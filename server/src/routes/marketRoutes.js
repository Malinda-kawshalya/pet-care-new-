import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import marketController from "../controllers/marketController.js";

const router = express.Router();

// Public product listing and detail
router.get("/products", marketController.listPublicProducts);
router.get("/products/:id", marketController.getPublicProduct);

// Reviews for products (protected)
router.post("/products/:id/reviews", protect, marketController.addProductReview);

// Orders (protected)
router.post("/orders", protect, marketController.createOrder);
router.get("/orders/:id", protect, marketController.getOrder);

// Shop (seller) - manage own products and inventory
router.post("/shop/products", protect, marketController.shopCreateProduct);
router.put("/shop/products/:id", protect, marketController.shopUpdateProduct);
router.post("/shop/products/:id/inventory", protect, marketController.shopAdjustInventory);

export default router;
