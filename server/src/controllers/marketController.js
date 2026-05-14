import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { normalizeUploadPath } from "../utils/uploadPath.js";

function parseNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function isSeller(user) {
  return ["petShop", "admin"].includes(user?.role);
}

function sanitizePaymentMethod(method) {
  return method === "cod" ? "cod" : "card";
}

function normalizeText(value) {
  return String(value || "").trim();
}

function createTrackingEntry(status, message) {
  return { status, message, timestamp: new Date() };
}

function isOrderForSeller(order, user) {
  if (!isSeller(user)) return false;
  if (user.role === "admin") return true;

  return order.items.some((item) => {
    const seller = item.product?.seller;
    return String(seller?._id || seller) === String(user._id);
  });
}

async function hydrateOrder(orderId) {
  return Order.findById(orderId)
    .populate("user", "name firstName lastName email role")
    .populate({
      path: "items.product",
      select: "name brand category price images seller stock",
      populate: { path: "seller", select: "name firstName lastName email role" }
    });
}

export async function listPublicProducts(req, res, next) {
  try {
    const { q, category, brand, minPrice, maxPrice, page = 1, limit = 24, sort } = req.query;
    const filter = { isActive: true, approvalStatus: "approved" };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (q) filter.$text = { $search: q };
    const priceMin = parseNumber(minPrice);
    const priceMax = parseNumber(maxPrice);
    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = priceMin;
      if (priceMax !== undefined) filter.price.$lte = priceMax;
    }

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.min(100, Number(limit) || 24);

    let qfind = Product.find(filter).populate("seller", "name");
    if (sort === "price_asc") qfind = qfind.sort({ price: 1 });
    else if (sort === "price_desc") qfind = qfind.sort({ price: -1 });
    else qfind = qfind.sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);
    const items = await qfind.skip((pageNum - 1) * perPage).limit(perPage).exec();

    res.json({ items, total, page: pageNum, limit: perPage });
  } catch (err) {
    next(err);
  }
}

export async function getPublicProduct(req, res, next) {
  try {
    const item = await Product.findById(req.params.id).populate("seller", "name");
    if (!item) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  const adjustedStock = [];
  try {
    const userId = req.user._id;
    const { items = [], shipping = {}, paymentMethod: requestedPaymentMethod = 'card', paymentToken, paymentLast4, notes } = req.body;
    const paymentMethod = sanitizePaymentMethod(requestedPaymentMethod);

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Cart items required');
    }

    if (!shipping.name || !shipping.email || !shipping.phone || !shipping.address) {
      res.status(400);
      throw new Error('Shipping name, email, phone, and address are required');
    }

    if (paymentMethod === 'card' && (!paymentToken || !paymentLast4)) {
      res.status(400);
      throw new Error('Card payment details are required');
    }

    const groupedItems = items.reduce((accumulator, item) => {
      const productId = String(item.product || item.productId || '');
      if (!productId) return accumulator;
      accumulator[productId] = (accumulator[productId] || 0) + Math.max(1, Number(item.quantity) || 1);
      return accumulator;
    }, {});

    const productIds = Object.keys(groupedItems);
    if (productIds.length === 0) {
      res.status(400);
      throw new Error('Cart items required');
    }

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      approvalStatus: "approved"
    });

    if (products.length !== productIds.length) {
      res.status(400);
      throw new Error('One or more products are unavailable');
    }

    const byId = new Map(products.map(p => [String(p._id), p]));

    let total = 0;
    const orderItems = [];
    for (const productId of productIds) {
      const prod = byId.get(productId);
      if (!prod) {
        res.status(400);
        throw new Error('Product not found: ' + productId);
      }
      const qty = groupedItems[productId];
      if (prod.stock < qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${prod.name}`);
      }

      orderItems.push({ product: prod._id, quantity: qty, price: prod.price });
      total += prod.price * qty;
    }

    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        res.status(400);
        throw new Error('Product stock changed while placing the order. Please review your cart.');
      }

      adjustedStock.push({ product: item.product, quantity: item.quantity });
    }

    const created = await Order.create({
      user: userId,
      shippingName: shipping?.name,
      shippingEmail: shipping?.email,
      shippingPhone: shipping?.phone,
      shippingAddress: shipping?.address,
      paymentMethod,
      paymentLast4: paymentMethod === 'card' ? String(paymentLast4).slice(-4) : undefined,
      trackingNumber: 'TRK' + Date.now(),
      estimatedDeliveryAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      trackingHistory: [
        createTrackingEntry(
          paymentMethod === 'cod' ? 'placed' : 'processing',
          paymentMethod === 'cod'
            ? 'Cash on delivery order submitted and waiting for shop approval'
            : 'Card payment accepted and order is being prepared'
        )
      ],
      items: orderItems,
      total: Number(total.toFixed(2)),
      notes,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: paymentMethod === 'cod' ? 'placed' : 'processing'
    });

    const hydrated = await hydrateOrder(created._id);
    
    // Notify sellers of the new order
    const sellerIds = new Set();
    hydrated.items.forEach(item => {
      if (item.product?.seller?._id) {
        sellerIds.add(String(item.product.seller._id));
      }
    });

    for (const sellerId of sellerIds) {
      await Notification.create({
        user: sellerId,
        title: "New Order Received",
        message: `You have received a new order #${created._id.toString().slice(-8).toUpperCase()} for $${total.toFixed(2)}`,
        type: "order",
        relatedOrder: created._id,
        channel: "inApp"
      });
    }

    res.status(201).json({ item: hydrated });
  } catch (err) {
    if (adjustedStock.length > 0) {
      await Promise.all(adjustedStock.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
      ));
    }
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const items = await Order.find({ user: req.user._id })
      .populate("items.product", "name brand category price images seller")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await hydrateOrder(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const isOwner = String(order.user?._id || order.user) === String(req.user._id);
    if (!isOwner && !isOrderForSeller(order, req.user)) {
      res.status(403);
      throw new Error('Not allowed to view this order');
    }

    res.json({ item: order });
  } catch (err) {
    next(err);
  }
}

export async function addProductReview(req, res, next) {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Rating 1-5 required');
    }
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const review = await Review.create({ user: req.user._id, targetType: 'product', targetId: productId, rating, comment });

    // Recompute rating
    const agg = await Review.aggregate([
      { $match: { targetType: 'product', targetId: product._id } },
      { $group: { _id: '$targetId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg && agg[0]) {
      product.rating = Math.round(agg[0].avg * 10) / 10;
      product.reviewCount = agg[0].count;
      await product.save();
    }

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

// Pet shop endpoints
export async function shopCreateProduct(req, res, next) {
  try {
    const price = Number(req.body.price);
    const stock = Math.max(0, Number(req.body.stock) || 0);

    if (!normalizeText(req.body.name) || !normalizeText(req.body.category) || !Number.isFinite(price) || price <= 0) {
      res.status(400);
      throw new Error("Product name, category, and valid price are required");
    }

    // Handle uploaded image or existing images
    let images = [];
    if (req.file) {
      images = [normalizeUploadPath(req.file.path)];
    } else if (Array.isArray(req.body.images)) {
      images = req.body.images.map(normalizeText).filter(Boolean);
    } else if (normalizeText(req.body.image)) {
      images = [normalizeText(req.body.image)];
    }

    const item = await Product.create({
      seller: req.user._id,
      name: normalizeText(req.body.name),
      brand: normalizeText(req.body.brand),
      category: normalizeText(req.body.category),
      description: normalizeText(req.body.description),
      price,
      stock,
      lowStockThreshold: Math.max(0, Number(req.body.lowStockThreshold) || 10),
      images,
      isActive: req.body.isActive !== false,
      approvalStatus: "approved"
    });

    const hydrated = await Product.findById(item._id).populate("seller", "name firstName lastName email role");
    res.status(201).json({ item: hydrated });
  } catch (err) {
    next(err);
  }
}

export async function shopUpdateProduct(req, res, next) {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Product not found'); }
    if (String(item.seller) !== String(req.user._id)) { res.status(403); throw new Error('Not allowed'); }
    
    // Update fields
    if (req.body.name) item.name = normalizeText(req.body.name);
    if (req.body.brand) item.brand = normalizeText(req.body.brand);
    if (req.body.category) item.category = normalizeText(req.body.category);
    if (req.body.description) item.description = normalizeText(req.body.description);
    if (req.body.price) item.price = Number(req.body.price);
    if (req.body.stock !== undefined) item.stock = Math.max(0, Number(req.body.stock));
    if (req.body.lowStockThreshold !== undefined) item.lowStockThreshold = Math.max(0, Number(req.body.lowStockThreshold));
    
    // Handle image upload
    if (req.file) {
      item.images = [normalizeUploadPath(req.file.path)];
    }
    
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function shopDeleteProduct(req, res, next) {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Product not found'); }
    if (String(item.seller) !== String(req.user._id)) { res.status(403); throw new Error('Not allowed'); }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
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

export async function shopDashboard(req, res, next) {
  try {
    if (!isSeller(req.user)) {
      res.status(403);
      throw new Error("Only pet shops can view shop orders");
    }

    const inventoryFilter = req.user.role === "admin" && req.query.sellerId
      ? { seller: req.query.sellerId }
      : { seller: req.user._id };

    const [inventory, allOrders] = await Promise.all([
      Product.find(inventoryFilter).sort({ createdAt: -1 }),
      Order.find()
        .populate("user", "name firstName lastName email role")
        .populate({
          path: "items.product",
          select: "name brand category price images seller stock",
          populate: { path: "seller", select: "name firstName lastName email role" }
        })
        .sort({ createdAt: -1 })
        .limit(200)
    ]);

    const orders = allOrders.filter((order) => isOrderForSeller(order, req.user));
    const pendingCod = orders.filter((order) => order.paymentMethod === "cod" && order.paymentStatus === "pending" && order.orderStatus === "placed");

    res.json({
      inventory,
      orders,
      summary: {
        totalProducts: inventory.length,
        lowStock: inventory.filter((item) => item.stock <= item.lowStockThreshold).length,
        orders: orders.length,
        pendingCod: pendingCod.length,
        revenue: orders
          .filter((order) => order.orderStatus !== "rejected" && order.orderStatus !== "cancelled")
          .reduce((sum, order) => sum + (order.total || 0), 0)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function shopListOrders(req, res, next) {
  try {
    if (!isSeller(req.user)) {
      res.status(403);
      throw new Error("Only pet shops can view shop orders");
    }

    const allOrders = await Order.find()
      .populate("user", "name firstName lastName email role")
      .populate({
        path: "items.product",
        select: "name brand category price images seller stock",
        populate: { path: "seller", select: "name firstName lastName email role" }
      })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ items: allOrders.filter((order) => isOrderForSeller(order, req.user)) });
  } catch (err) {
    next(err);
  }
}

export async function shopApproveOrder(req, res, next) {
  try {
    if (!isSeller(req.user)) {
      res.status(403);
      throw new Error("Only pet shops can approve orders");
    }

    const order = await hydrateOrder(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (!isOrderForSeller(order, req.user)) {
      res.status(403);
      throw new Error("Not allowed to approve this order");
    }

    if (order.paymentMethod !== "cod" || order.paymentStatus !== "pending" || order.orderStatus !== "placed") {
      res.status(400);
      throw new Error("Only pending cash on delivery orders can be approved");
    }

    order.orderStatus = "processing";
    order.trackingHistory = [
      ...(order.trackingHistory || []),
      createTrackingEntry("processing", "Cash on delivery order approved by the shop")
    ];

    await order.save();
    
    // Notify customer
    await Notification.create({
      user: order.user._id,
      title: "Order Approved",
      message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been approved and is being prepared for shipment`,
      type: "order",
      relatedOrder: order._id,
      channel: "inApp"
    });

    res.json({ item: await hydrateOrder(order._id) });
  } catch (err) {
    next(err);
  }
}

export async function shopRejectOrder(req, res, next) {
  try {
    if (!isSeller(req.user)) {
      res.status(403);
      throw new Error("Only pet shops can reject orders");
    }

    const order = await hydrateOrder(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (!isOrderForSeller(order, req.user)) {
      res.status(403);
      throw new Error("Not allowed to reject this order");
    }

    if (order.paymentMethod !== "cod" || order.paymentStatus !== "pending" || order.orderStatus !== "placed") {
      res.status(400);
      throw new Error("Only pending cash on delivery orders can be rejected");
    }

    await Promise.all(order.items.map((item) =>
      Product.findByIdAndUpdate(item.product?._id || item.product, { $inc: { stock: item.quantity } })
    ));

    order.orderStatus = "rejected";
    order.paymentStatus = "failed";
    order.trackingHistory = [
      ...(order.trackingHistory || []),
      createTrackingEntry("rejected", "Cash on delivery order rejected by the shop")
    ];

    await order.save();
    
    // Notify customer
    await Notification.create({
      user: order.user._id,
      title: "Order Rejected",
      message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been rejected by the shop. Stock has been restored and payment refunded if applicable.`,
      type: "order",
      relatedOrder: order._id,
      channel: "inApp"
    });

    res.json({ item: await hydrateOrder(order._id) });
  } catch (err) {
    next(err);
  }
}

export default {
  listPublicProducts,
  getPublicProduct,
  createOrder,
  listOrders,
  getOrder,
  addProductReview,
  shopCreateProduct,
  shopUpdateProduct,
  shopDeleteProduct,
  shopAdjustInventory,
  shopDashboard,
  shopListOrders,
  shopApproveOrder,
  shopRejectOrder
};
