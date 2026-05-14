import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import mongoose from "mongoose";

function parseNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user._id;
    const { items = [], shipping, paymentMethod = 'card', notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Cart items required');
    }

    // Fetch products and validate stock
    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const byId = new Map(products.map(p => [String(p._id), p]));

    let total = 0;
    const orderItems = [];
    for (const it of items) {
      const prod = byId.get(String(it.product));
      if (!prod) {
        res.status(400);
        throw new Error('Product not found: ' + it.product);
      }
      const qty = Math.max(1, Number(it.quantity) || 1);
      if (prod.stock < qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${prod.name}`);
      }
      // decrement stock
      prod.stock = prod.stock - qty;
      await prod.save({ session });

      orderItems.push({ product: prod._id, quantity: qty, price: prod.price });
      total += prod.price * qty;
    }

    const order = await Order.create([
      {
        user: userId,
        shippingName: shipping?.name,
        shippingEmail: shipping?.email,
        shippingPhone: shipping?.phone,
        shippingAddress: shipping?.address,
        paymentMethod,
        items: orderItems,
        total,
        notes,
        paymentStatus: process.env.SKIP_PAYMENT === 'true' ? 'paid' : 'pending'
      }
    ], { session });

    const created = order[0];
    // Mock payment processing: if SKIP_PAYMENT true or paymentMethod === 'mock' mark paid
    if (process.env.SKIP_PAYMENT === 'true' || paymentMethod === 'mock') {
      created.paymentStatus = 'paid';
      created.paymentLast4 = '0000';
      created.trackingNumber = 'TRK' + Date.now();
      created.estimatedDeliveryAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5); // +5 days
      await created.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ item: created });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    // allow user or admin
    if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
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

export default {
  listPublicProducts,
  getPublicProduct,
  createOrder,
  getOrder,
  addProductReview,
  shopCreateProduct,
  shopUpdateProduct,
  shopAdjustInventory
};
