import express from "express";
import {
  dashboardStats,
  reports,
  analytics,
  createUser,
  deleteUser,
  createAppointment,
  createProduct,
  createBlog,
  createAdoption,
  deleteAppointment,
  deleteProduct,
  deleteBlog,
  deleteAdoption,
  listContactInquiries,
  listHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  listMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  getUser,
  listUsers,
  listAppointments,
  listProducts,
  listBlogs,
  listAdoptions,
  updateApproval,
  updateRole,
  updateUser,
  updateAppointment,
  updateProduct,
  updateBlog,
  updateAdoption
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/dashboard/stats", dashboardStats);

router.get("/users", listUsers);
router.post("/users", createUser);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/approval", updateApproval);
router.patch("/users/:id/role", updateRole);

router.get("/appointments", listAppointments);
router.post("/appointments", createAppointment);
router.put("/appointments/:id", updateAppointment);
router.delete("/appointments/:id", deleteAppointment);

router.get("/products", listProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/blogs", listBlogs);
router.post("/blogs", createBlog);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

router.get("/adoptions", listAdoptions);
router.post("/adoptions", createAdoption);
router.put("/adoptions/:id", updateAdoption);
router.delete("/adoptions/:id", deleteAdoption);

router.get("/analytics", analytics);
router.get("/reports", reports);
router.get("/contact-inquiries", listContactInquiries);
router.get("/health-records", listHealthRecords);
router.post("/health-records", createHealthRecord);
router.put("/health-records/:id", updateHealthRecord);
router.delete("/health-records/:id", deleteHealthRecord);

router.get("/messages", listMessages);
router.post("/messages", createMessage);
router.put("/messages/:id", updateMessage);
router.delete("/messages/:id", deleteMessage);

export default router;
