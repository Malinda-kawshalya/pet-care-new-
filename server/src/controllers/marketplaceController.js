import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";

const sellerRoles = ["petShop", "admin"];

function isSeller(user) {
  return sellerRoles.includes(user?.role);
}

function canManageProduct(product, user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return String(product.seller) === String(user._id);
}

function normalizeText(value) {
  return String(value || "").trim();
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildProductFilter(query, user) {
  const filters = {};
  const search = normalizeText(query.q);

  if (query.category) {
    filters.category = query.category;
  }

  if (query.brand) {
    filters.brand = query.brand;
  }

  if (query.approvalStatus && isSeller(user)) {
    filters.approvalStatus = query.approvalStatus;
  } else if (!isSeller(user)) {
    filters.approvalStatus = "approved";
    filters.isActive = true;
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = parseNumber(query.minPrice, 0);
    if (query.maxPrice) filters.price.$lte = parseNumber(query.maxPrice, Number.MAX_SAFE_INTEGER);
  }

  if (query.stockStatus === "low") {
    filters.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
  }

  return { filters, search };
}

function createTrackingHistory(status, message) {
  return [{ status, message, timestamp: new Date() }];
}

function trackingTimeline(order) {
  const timeline = order.trackingHistory?.length
    ? order.trackingHistory
    : createTrackingHistory(order.orderStatus, "Order created");

  const orderedStatus = ["placed", "processing", "shipped", "delivered"];
  return orderedStatus.map((status, index) => {
    const hit = timeline.find((entry) => entry.status === status);
    return {
      status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      active: orderedStatus.indexOf(order.orderStatus) >= index,
      message: hit?.message || defaultTrackingMessage(status),
      timestamp: hit?.timestamp || null
    };
  });
}

function defaultTrackingMessage(status) {
  const messages = {
    placed: "Order placed successfully",
    processing: "Payment confirmed and order is being prepared",
    shipped: "Parcel handed to the delivery partner",
    delivered: "Order delivered to the customer"
  };
  return messages[status] || "Update available";
}

async function refreshProductScore(productId) {
  const stats = await Review.aggregate([
    { $match: { targetType: "product", targetId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$targetId",
        rating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const [aggregate] = stats;
  await Product.findByIdAndUpdate(productId, {
    rating: aggregate ? Number(aggregate.rating.toFixed(1)) : 0,
    reviewCount: aggregate?.reviewCount || 0
  });
}

async function loadOrdersForSeller(user, scope = "buyer") {
  const orders = await Order.find()
    .populate("user", "name email role")
    .populate("items.product", "name seller category brand price stock images")
    .sort({ createdAt: -1 });

  if (user.role === "admin" && scope === "all") {
    return orders;
  }

  if (user.role === "petShop" || scope === "seller") {
    return orders.filter((order) =>
      order.items.some((item) => String(item.product?.seller?._id || item.product?.seller) === String(user._id))
    );
  }

  return orders.filter((order) => String(order.user?._id || order.user) === String(user._id));
}

export async function listProducts(req, res, next) {
  try {
    const { filters, search } = buildProductFilter(req.query, req.user);

    const products = await Product.find(filters)
      .populate("seller", "name email role providerProfile")
      .sort({ createdAt: -1 })
      .limit(300);

    const items = products.filter((product) => {
      if (!search) return true;
      const haystack = [product.name, product.brand, product.category, product.description, product.seller?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    const [categories, brands] = await Promise.all([
      Product.distinct("category", { approvalStatus: "approved", isActive: true }),
      Product.distinct("brand", { approvalStatus: "approved", isActive: true })
    ]);

    res.json({
      items,
      facets: {
        categories: categories.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name email role providerProfile");
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const reviews = await Review.find({ targetType: "product", targetId: product._id })
      .populate("user", "name role avatar")
      .sort({ createdAt: -1 });

    res.json({
      item: product,
      reviews,
      rating: product.rating,
      reviewCount: product.reviewCount || reviews.length
    });
  } catch (error) {
    next(error);
  }
}

export async function listSellerInventory(req, res, next) {
  try {
    const sellerId = req.user.role === "admin" && req.query.sellerId ? req.query.sellerId : req.user._id;
    const filters = req.user.role === "admin" && req.query.sellerId ? { seller: sellerId } : { seller: req.user._id };

    const items = await Product.find(filters)
      .populate("seller", "name email role")
      .sort({ createdAt: -1 });

    const summary = {
      total: items.length,
      active: items.filter((item) => item.isActive).length,
      lowStock: items.filter((item) => item.stock <= item.lowStockThreshold).length,
      pending: items.filter((item) => item.approvalStatus === "pending").length
    };

    res.json({ items, summary });
  } catch (error) {
    next(error);
  }
}

export async function createSellerProduct(req, res, next) {
  try {
    if (!isSeller(req.user)) {
      res.status(403);
      throw new Error("Only pet shops and admins can manage products");
    }

    const payload = {
      seller: req.user.role === "admin" && req.body.seller ? req.body.seller : req.user._id,
      name: normalizeText(req.body.name),
      brand: normalizeText(req.body.brand),
      category: normalizeText(req.body.category),
      description: normalizeText(req.body.description),
      price: parseNumber(req.body.price),
      stock: parseNumber(req.body.stock),
      lowStockThreshold: parseNumber(req.body.lowStockThreshold, 10),
      images: Array.isArray(req.body.images) ? req.body.images : [],
      isActive: req.body.isActive !== false,
      approvalStatus: req.body.approvalStatus || "approved"
    };

    const item = await Product.create(payload);
    const hydrated = await Product.findById(item._id).populate("seller", "name email role providerProfile");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function updateSellerProduct(req, res, next) {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (!canManageProduct(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to edit this product");
    }

    const editableFields = ["name", "brand", "category", "description", "price", "stock", "lowStockThreshold", "images", "isActive", "approvalStatus"];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    if (req.body.price !== undefined) item.price = parseNumber(req.body.price, item.price);
    if (req.body.stock !== undefined) item.stock = parseNumber(req.body.stock, item.stock);
    if (req.body.lowStockThreshold !== undefined) item.lowStockThreshold = parseNumber(req.body.lowStockThreshold, item.lowStockThreshold);
    if (req.body.images !== undefined) item.images = Array.isArray(req.body.images) ? req.body.images : item.images;

    if (req.body.approvalStatus) {
      item.reviewedAt = new Date();
      item.reviewedBy = req.user._id;
    }

    await item.save();
    const hydrated = await Product.findById(item._id).populate("seller", "name email role providerProfile");
    res.json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function deleteSellerProduct(req, res, next) {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (!canManageProduct(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to delete this product");
    }

    await Product.findByIdAndDelete(item._id);
    res.json({ message: "Product deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function createCheckoutOrder(req, res, next) {
  try {
    // Handle both flat and nested shipping object formats
    const shipping = req.body.shipping || {};
    const { items = [], shippingAddress, shippingName, shippingEmail, shippingPhone, paymentMethod = "card", paymentToken, paymentLast4 } = req.body;
    
    const finalShippingName = shippingName || shipping.name;
    const finalShippingEmail = shippingEmail || shipping.email;
    const finalShippingPhone = shippingPhone || shipping.phone;
    const finalShippingAddress = shippingAddress || shipping.address;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Cart is empty");
    }

    if (!finalShippingAddress || !finalShippingName) {
      res.status(400);
      throw new Error("Shipping name and address are required");
    }

    if (paymentMethod === "card" && !paymentToken) {
      res.status(400);
      throw new Error("Payment token is required for card checkout");
    }

    const groupedItems = items.reduce((accumulator, item) => {
      const productId = String(item.productId || item.product || "");
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (!productId) return accumulator;
      accumulator[productId] = (accumulator[productId] || 0) + quantity;
      return accumulator;
    }, {});

    const productIds = Object.keys(groupedItems);
    const products = await Product.find({ _id: { $in: productIds }, approvalStatus: "approved", isActive: true });

    if (products.length !== productIds.length) {
      res.status(400);
      throw new Error("One or more products are unavailable");
    }

    let total = 0;
    const orderItems = [];

    for (const product of products) {
      const quantity = groupedItems[String(product._id)];
      if (product.stock < quantity) {
        res.status(400);
        throw new Error(`Not enough stock for ${product.name}`);
      }

      product.stock -= quantity;
      await product.save();

      total += product.price * quantity;
      orderItems.push({ product: product._id, quantity, price: product.price });
    }

    const trackingNumber = `PC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const estimatedDeliveryAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const order = await Order.create({
      user: req.user._id,
      shippingName: finalShippingName,
      shippingEmail: finalShippingEmail,
      shippingPhone: finalShippingPhone,
      shippingAddress: finalShippingAddress,
      paymentMethod,
      paymentLast4: paymentLast4 || (paymentToken ? paymentToken.slice(-4) : undefined),
      estimatedDeliveryAt,
      trackingNumber,
      trackingHistory: createTrackingHistory("placed", "Order placed securely"),
      items: orderItems,
      total: Number(total.toFixed(2)),
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      orderStatus: paymentMethod === "cod" ? "placed" : "processing",
      notes: "Tokenized payment data only. Full payment details are not stored."
    });

    const hydrated = await Order.findById(order._id)
      .populate("user", "name email role")
      .populate("items.product", "name brand category price images seller stock");

    // Notify each seller of the new order
    const sellerIds = new Set();
    hydrated.items.forEach(item => {
      if (item.product?.seller) {
        sellerIds.add(String(item.product.seller._id || item.product.seller));
      }
    });

    for (const sellerId of sellerIds) {
      await Notification.create({
        user: sellerId,
        title: "New Order Received",
        message: `You have received a new order #${order._id.toString().slice(-8).toUpperCase()} for $${total.toFixed(2)}`,
        type: "order",
        relatedOrder: order._id,
        channel: "inApp"
      });
    }

    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function approveOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("items.product", "seller")
      .populate("user", "name email role");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Check if user is the seller of any product in the order
    const isSellerOrder = order.items.some((item) => String(item.product?.seller?._id || item.product?.seller) === String(req.user._id));
    if (!isSellerOrder && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not allowed to approve this order");
    }

    // Update order status to processing
    order.orderStatus = "processing";
    order.trackingHistory = [...(order.trackingHistory || []), {
      status: "processing",
      message: "Shop owner approved - Order is being prepared for shipment",
      timestamp: new Date()
    }];
    await order.save();

    // Notify buyer
    await Notification.create({
      user: order.user._id,
      title: "Order Approved",
      message: `Your order #${orderId.toString().slice(-8).toUpperCase()} has been approved and is being prepared`,
      type: "order",
      relatedOrder: orderId,
      channel: "inApp"
    });

    const hydrated = await Order.findById(order._id)
      .populate("user", "name email role")
      .populate("items.product", "name brand category price images seller stock");

    res.json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function rejectOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await Order.findById(orderId)
      .populate("items.product", "seller stock")
      .populate("user", "name email role");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Check if user is the seller of any product in the order
    const isSellerOrder = order.items.some((item) => String(item.product?.seller?._id || item.product?.seller) === String(req.user._id));
    if (!isSellerOrder && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not allowed to reject this order");
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Update order status to cancelled
    order.orderStatus = "cancelled";
    order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : order.paymentStatus;
    order.trackingHistory = [...(order.trackingHistory || []), {
      status: "cancelled",
      message: `Shop owner rejected order${reason ? `: ${reason}` : ''}`,
      timestamp: new Date()
    }];
    await order.save();

    // Notify buyer
    await Notification.create({
      user: order.user._id,
      title: "Order Rejected",
      message: `Your order #${orderId.toString().slice(-8).toUpperCase()} has been rejected${reason ? `. Reason: ${reason}` : ''}. Payment will be refunded if it was already processed.`,
      type: "order",
      relatedOrder: orderId,
      channel: "inApp"
    });

    const hydrated = await Order.findById(order._id)
      .populate("user", "name email role")
      .populate("items.product", "name brand category price images seller stock");

    res.json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function getSellerOrders(req, res, next) {
  try {
    if (req.user.role !== "petShop" && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only pet shops can view their orders");
    }

    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "name price seller")
      .sort({ createdAt: -1 });

    // Filter orders that belong to this seller
    const sellerOrders = orders.filter(order =>
      order.items.some(item => String(item.product?.seller) === String(req.user._id))
    );

    res.json({ items: sellerOrders });
  } catch (error) {
    next(error);
  }

export async function listOrders(req, res, next) {
  try {
    const scope = req.query.scope || "buyer";
    const orders = await loadOrdersForSeller(req.user, scope);

    const items = scope === "seller" && (req.user.role === "petShop" || req.user.role === "admin")
      ? orders.filter((order) => order.items.some((item) => String(item.product?.seller?._id || item.product?.seller) === String(req.user._id)))
      : orders;

    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email role")
      .populate("items.product", "name brand category price images seller stock")
      .populate("items.product.seller", "name email role");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isOwner = String(order.user?._id || order.user) === String(req.user._id);
    const isSellerOrder = order.items.some((item) => String(item.product?.seller?._id || item.product?.seller) === String(req.user._id));

    if (!isOwner && !isSeller(req.user) && !isSellerOrder) {
      res.status(403);
      throw new Error("Not allowed to view this order");
    }

    res.json({
      item: order,
      tracking: {
        trackingNumber: order.trackingNumber,
        estimatedDeliveryAt: order.estimatedDeliveryAt,
        timeline: trackingTimeline(order)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderTracking(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email role")
      .populate("items.product", "name brand category price images seller stock")
      .populate("items.product.seller", "name email role");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isOwner = String(order.user?._id || order.user) === String(req.user._id);
    const isSellerOrder = order.items.some((item) => String(item.product?.seller?._id || item.product?.seller) === String(req.user._id));

    if (!isOwner && !isSeller(req.user) && !isSellerOrder) {
      res.status(403);
      throw new Error("Not allowed to view this order");
    }

    res.json({
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      estimatedDeliveryAt: order.estimatedDeliveryAt,
      history: order.trackingHistory?.length ? order.trackingHistory : createTrackingHistory(order.orderStatus, defaultTrackingMessage(order.orderStatus)),
      timeline: trackingTimeline(order)
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status, message } = req.body;
    if (!["placed", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      res.status(400);
      throw new Error("Invalid order status");
    }

    const order = await Order.findById(req.params.id).populate("items.product", "seller");
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isOwner = String(order.user) === String(req.user._id);
    const isSellerOrder = order.items.some((item) => String(item.product?.seller?._id || item.product?.seller) === String(req.user._id));
    if (!isOwner && !isSeller(req.user) && !isSellerOrder) {
      res.status(403);
      throw new Error("Not allowed to update this order");
    }

    order.orderStatus = status;
    order.trackingHistory = [...(order.trackingHistory || []), {
      status,
      message: message || defaultTrackingMessage(status),
      timestamp: new Date()
    }];

    if (status === "delivered") {
      order.paymentStatus = order.paymentStatus === "pending" ? "paid" : order.paymentStatus;
    }

    await order.save();
    const hydrated = await Order.findById(order._id)
      .populate("user", "name email role")
      .populate("items.product", "name brand category price images seller stock");

    res.json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function listProductReviews(req, res, next) {
  try {
    const reviews = await Review.find({ targetType: "product", targetId: req.params.id })
      .populate("user", "name role avatar")
      .sort({ createdAt: -1 });

    res.json({ items: reviews });
  } catch (error) {
    next(error);
  }
}

export async function upsertProductReview(req, res, next) {
  try {
    const rating = parseNumber(req.body.rating, 0);
    const comment = normalizeText(req.body.comment);

    if (rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, targetType: "product", targetId: product._id },
      { rating, comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("user", "name role avatar");

    await refreshProductScore(product._id);

    const refreshedProduct = await Product.findById(product._id).populate("seller", "name email role providerProfile");
    const reviews = await Review.find({ targetType: "product", targetId: product._id })
      .populate("user", "name role avatar")
      .sort({ createdAt: -1 });

    res.status(201).json({
      item: review,
      product: refreshedProduct,
      reviews
    });
  } catch (error) {
    next(error);
  }
}

export async function sellerDashboard(req, res, next) {
  try {
    if (!isSeller(req.user)) {
      res.status(403);
      throw new Error("Only pet shops and admins can view seller dashboard");
    }

    const [inventory, orders] = await Promise.all([
      Product.find({ seller: req.user.role === "admin" && req.query.sellerId ? req.query.sellerId : req.user._id })
        .populate("seller", "name email role")
        .sort({ createdAt: -1 }),
      loadOrdersForSeller(req.user, "seller")
    ]);

    const lowStock = inventory.filter((item) => item.stock <= item.lowStockThreshold);
    const pendingCodOrders = orders.filter((order) =>
      order.paymentMethod === "cod" &&
      order.paymentStatus === "pending" &&
      order.orderStatus === "placed"
    );
    const recentOrders = orders.slice(0, 10);

    res.json({
      inventory,
      orders: recentOrders,
      summary: {
        totalProducts: inventory.length,
        lowStock: lowStock.length,
        pendingCod: pendingCodOrders.length,
        orders: orders.length,
        revenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
      }
    });
  } catch (error) {
    next(error);
  }
}

// Wrapper functions to match route names
export async function shopListOrders(req, res, next) {
  return getSellerOrders(req, res, next);
}

export async function shopApproveOrder(req, res, next) {
  req.params.orderId = req.params.id;
  return approveOrder(req, res, next);
}

export async function shopRejectOrder(req, res, next) {
  req.params.orderId = req.params.id;
  return rejectOrder(req, res, next);
}

// Shop product management wrappers
export async function shopCreateProduct(req, res, next) {
  try {
    const payload = { ...req.body, seller: req.user._id };
    const item = await Product.create(payload);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function shopUpdateProduct(req, res, next) {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Product not found'); }
    if (String(item.seller) !== String(req.user._id)) { res.status(403); throw new Error('Not allowed'); }
    Object.assign(item, req.body);
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function shopAdjustInventory(req, res, next) {
  try {
    const { delta } = req.body; // positive or negative
    const item = await Product.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Product not found'); }
    if (String(item.seller) !== String(req.user._id)) { res.status(403); throw new Error('Not allowed'); }
    item.stock = Math.max(0, item.stock + Number(delta || 0));
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}
