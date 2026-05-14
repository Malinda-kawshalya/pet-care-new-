import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import marketController from "../controllers/marketController.js";

const router = express.Router();

// Public product listing and detail
router.get("/products", marketController.listPublicProducts);
router.get("/products/:id", marketController.getPublicProduct);

// Reviews for products (protected)
router.post("/products/:id/reviews", protect, marketController.addProductReview);

// Orders (protected)
router.post("/orders", protect, marketController.createOrder);
router.get("/orders", protect, marketController.listOrders);
router.get("/orders/:id", protect, marketController.getOrder);

// Shop (seller) - manage own products and inventory
router.get("/shop/dashboard", protect, authorize("petShop", "admin"), marketController.shopDashboard);
router.get("/shop/orders", protect, authorize("petShop", "admin"), marketController.shopListOrders);
router.patch("/shop/orders/:id/approve", protect, authorize("petShop", "admin"), marketController.shopApproveOrder);
router.patch("/shop/orders/:id/reject", protect, authorize("petShop", "admin"), marketController.shopRejectOrder);
router.post("/shop/products", protect, authorize("petShop", "admin"), upload.single("image"), marketController.shopCreateProduct);
router.put("/shop/products/:id", protect, authorize("petShop", "admin"), upload.single("image"), marketController.shopUpdateProduct);
router.delete("/shop/products/:id", protect, authorize("petShop", "admin"), marketController.shopDeleteProduct);
router.post("/shop/products/:id/inventory", protect, authorize("petShop", "admin"), marketController.shopAdjustInventory);

export default router;
