import User, { APPROVAL_STATUSES, USER_ROLES } from "../models/User.js";
import { sanitizeUser } from "./authController.js";
import Appointment from "../models/Appointment.js";
import Product from "../models/Product.js";
import Blog from "../models/Blog.js";
import AdoptionPost from "../models/AdoptionPost.js";
import Order from "../models/Order.js";
import ContactInquiry from "../models/ContactInquiry.js";

const userSelect = "-password -verificationToken -resetPasswordToken";

export async function listUsers(req, res, next) {
  try {
    const { search = "", role, approvalStatus } = req.query;
    const filters = {};

    if (role && USER_ROLES.includes(role)) filters.role = role;
    if (approvalStatus && APPROVAL_STATUSES.includes(approvalStatus)) filters.approvalStatus = approvalStatus;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filters).select(userSelect).sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role = "petOwner", approvalStatus = "approved", phone, address, bio, providerProfile } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      approvalStatus,
      phone,
      address,
      bio,
      providerProfile,
      isEmailVerified: true,
      approvedAt: approvalStatus === "approved" ? new Date() : undefined,
      approvedBy: approvalStatus === "approved" ? req.user._id : undefined
    });

    res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(userSelect);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const allowedFields = ["name", "email", "phone", "address", "avatar", "bio", "role", "approvalStatus", "isEmailVerified", "providerProfile"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });
    if (req.body.password) user.password = req.body.password;
    applyApprovalAudit(user, req.user._id);
    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (String(req.user._id) === req.params.id) {
      res.status(400);
      throw new Error("Admins cannot delete their own account");
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ message: "User deleted successfully", id: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function updateApproval(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.approvalStatus = req.body.approvalStatus;
    applyApprovalAudit(user, req.user._id);
    await user.save();

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.role = req.body.role;
    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function analytics(_req, res, next) {
  try {
    const [
      totalUsers,
      pendingApprovals,
      blockedUsers,
      verifiedUsers,
      byRole,
      byStatus,
      totalAppointments,
      totalProducts,
      totalBlogs,
      totalAdoptions,
      totalOrders,
      paidOrders,
      monthlyUsers,
      monthlyOrders,
      monthlyAppointments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ approvalStatus: "pending" }),
      User.countDocuments({ approvalStatus: "blocked" }),
      User.countDocuments({ isEmailVerified: true }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$approvalStatus", count: { $sum: 1 } } }]),
      Appointment.countDocuments(),
      Product.countDocuments(),
      Blog.countDocuments(),
      AdoptionPost.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      aggregateMonthly(User),
      aggregateMonthly(Order),
      aggregateMonthly(Appointment, "scheduledAt")
    ]);

    res.json({
      totals: {
        users: totalUsers,
        pendingApprovals,
        blockedUsers,
        verifiedUsers,
        appointments: totalAppointments,
        products: totalProducts,
        blogs: totalBlogs,
        adoptions: totalAdoptions,
        orders: totalOrders,
        paidOrders
      },
      byRole: normalizeCounts(byRole, USER_ROLES),
      byStatus: normalizeCounts(byStatus, APPROVAL_STATUSES),
      trends: {
        users: monthlyUsers,
        orders: monthlyOrders,
        appointments: monthlyAppointments
      },
      alerts: [
        `${pendingApprovals} account approvals pending`,
        `${blockedUsers} blocked accounts under review`,
        `${totalUsers - verifiedUsers} users still need email verification`
      ]
    });
  } catch (error) {
    next(error);
  }
}

function normalizeCounts(rows, keys) {
  return keys.reduce((counts, key) => {
    counts[key] = rows.find((row) => row._id === key)?.count || 0;
    return counts;
  }, {});
}

function applyApprovalAudit(user, adminId) {
  if (user.approvalStatus === "approved" && !user.approvedAt) {
    user.approvedAt = new Date();
    user.approvedBy = adminId;
  }
}

export async function dashboardStats(_req, res, next) {
  try {
    const [
      totalUsers,
      approvedUsers,
      pendingUsers,
      blockedUsers,
      totalAppointments,
      totalProducts,
      pendingProducts,
      pendingBlogs,
      pendingAdoptions,
      totalContactInquiries,
      usersByRole,
      latestUsers,
      latestAppointments,
      latestOrders,
      latestContacts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ approvalStatus: "approved" }),
      User.countDocuments({ approvalStatus: "pending" }),
      User.countDocuments({ approvalStatus: "blocked" }),
      Appointment.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ approvalStatus: "pending" }),
      Blog.countDocuments({ status: "draft" }),
      AdoptionPost.countDocuments({ status: "pendingApproval" }),
      ContactInquiry.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.find().select("name createdAt").sort({ createdAt: -1 }).limit(4),
      Appointment.find().select("serviceType createdAt status").sort({ createdAt: -1 }).limit(4),
      Order.find().select("total createdAt orderStatus").sort({ createdAt: -1 }).limit(4),
      ContactInquiry.find().select("name subject createdAt").sort({ createdAt: -1 }).limit(4)
    ]);

    const recentActivity = [
      ...latestContacts.map((contact) => ({
        type: "contact",
        message: `Contact message received: ${contact.subject}`,
        timestamp: formatAgo(contact.createdAt)
      })),
      ...latestUsers.map((u) => ({
        type: "user",
        message: `New user registered: ${u.name}`,
        timestamp: formatAgo(u.createdAt)
      })),
      ...latestAppointments.map((a) => ({
        type: "appointment",
        message: `Appointment ${a.status} (${a.serviceType})`,
        timestamp: formatAgo(a.createdAt)
      })),
      ...latestOrders.map((o) => ({
        type: "product",
        message: `Order ${o.orderStatus} ($${o.total})`,
        timestamp: formatAgo(o.createdAt)
      }))
    ]
      .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
      .slice(0, 8);

    const moderationLoad = pendingProducts + pendingBlogs + pendingAdoptions + pendingUsers;
    const platformHealth = Math.max(0, Math.min(100, 100 - moderationLoad * 3));

    res.json({
      totalUsers,
      totalAppointments,
      totalProducts,
      pendingApprovals: pendingUsers + pendingProducts + pendingBlogs + pendingAdoptions,
      totalContactInquiries,
      pendingUsers,
      approvedUsers,
      blockedUsers,
      pendingAdoptions,
      usersByRole: normalizeCounts(usersByRole, USER_ROLES),
      platformHealth,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
}

export async function listAppointments(req, res, next) {
  try {
    const { status, serviceType, q = "" } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (serviceType) filters.serviceType = serviceType;

    const appointments = await Appointment.find(filters)
      .populate("pet", "name species")
      .populate("owner", "name email")
      .populate("provider", "name email role")
      .sort({ scheduledAt: -1 })
      .limit(200);

    const normalized = appointments.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.pet?.name, item.owner?.name, item.provider?.name, item.notes, item.location]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));
    });

    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const item = await Appointment.create(req.body);
    const hydrated = await Appointment.findById(item._id)
      .populate("pet", "name species")
      .populate("owner", "name email")
      .populate("provider", "name email role");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(req, res, next) {
  try {
    const item = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate("pet", "name species")
      .populate("owner", "name email")
      .populate("provider", "name email role");
    if (!item) {
      res.status(404);
      throw new Error("Appointment not found");
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    const item = await Appointment.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Appointment not found");
    }
    res.json({ message: "Appointment deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function listProducts(req, res, next) {
  try {
    const { approvalStatus, isActive, q = "" } = req.query;
    const filters = {};
    if (approvalStatus) filters.approvalStatus = approvalStatus;
    if (typeof isActive === "string") filters.isActive = isActive === "true";

    const items = await Product.find(filters)
      .populate("seller", "name email role")
      .sort({ createdAt: -1 })
      .limit(300);

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.name, item.category, item.description, item.seller?.name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));
    });

    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const item = await Product.create(req.body);
    const hydrated = await Product.findById(item._id).populate("seller", "name email role");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const payload = { ...req.body };
    if (payload.approvalStatus) {
      payload.reviewedAt = new Date();
      payload.reviewedBy = req.user._id;
    }
    const item = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    }).populate("seller", "name email role");

    if (!item) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const item = await Product.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json({ message: "Product deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function listBlogs(req, res, next) {
  try {
    const { status, q = "" } = req.query;
    const filters = {};
    if (status) filters.status = status;

    const items = await Blog.find(filters)
      .populate("author", "name email role")
      .sort({ createdAt: -1 })
      .limit(300);

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.title, item.body, item.author?.name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));
    });

    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function createBlog(req, res, next) {
  try {
    const item = await Blog.create(req.body);
    const hydrated = await Blog.findById(item._id).populate("author", "name email role");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function updateBlog(req, res, next) {
  try {
    const item = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("author", "name email role");
    if (!item) {
      res.status(404);
      throw new Error("Blog post not found");
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function deleteBlog(req, res, next) {
  try {
    const item = await Blog.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Blog post not found");
    }
    res.json({ message: "Blog deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function listAdoptions(req, res, next) {
  try {
    const { status, q = "" } = req.query;
    const filters = {};
    if (status) filters.status = status;

    const items = await AdoptionPost.find(filters)
      .populate("pet", "name species")
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(300);

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.title, item.description, item.pet?.name, item.postedBy?.name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));
    });

    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function createAdoption(req, res, next) {
  try {
    const item = await AdoptionPost.create(req.body);
    const hydrated = await AdoptionPost.findById(item._id)
      .populate("pet", "name species")
      .populate("postedBy", "name email role");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function updateAdoption(req, res, next) {
  try {
    const item = await AdoptionPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate("pet", "name species")
      .populate("postedBy", "name email role");
    if (!item) {
      res.status(404);
      throw new Error("Adoption post not found");
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdoption(req, res, next) {
  try {
    const item = await AdoptionPost.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Adoption post not found");
    }
    res.json({ message: "Adoption post deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function listContactInquiries(req, res, next) {
  try {
    const { status, q = "" } = req.query;
    const filters = {};
    if (status) filters.status = status;

    const items = await ContactInquiry.find(filters).sort({ createdAt: -1 }).limit(300);
    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.name, item.email, item.subject, item.message, item.role]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));
    });

    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function reports(req, res, next) {
  try {
    const { type = "summary" } = req.query;
    const [users, orders, appointments, contactInquiries] = await Promise.all([
      User.find().select("name email role approvalStatus isEmailVerified createdAt"),
      Order.find().select("total paymentStatus orderStatus createdAt"),
      Appointment.find().select("serviceType status scheduledAt createdAt"),
      ContactInquiry.find().select("name email subject status createdAt")
    ]);

    const base = {
      generatedAt: new Date().toISOString(),
      totals: {
        users: users.length,
        orders: orders.length,
        appointments: appointments.length,
        contacts: contactInquiries.length
      },
      usersByRole: users.reduce((acc, item) => {
        acc[item.role] = (acc[item.role] || 0) + 1;
        return acc;
      }, {}),
      ordersByStatus: orders.reduce((acc, item) => {
        acc[item.orderStatus] = (acc[item.orderStatus] || 0) + 1;
        return acc;
      }, {}),
      appointmentsByStatus: appointments.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}),
      contactsByStatus: contactInquiries.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}),
      revenue: orders.reduce((sum, item) => sum + (item.total || 0), 0)
    };

    if (type === "detailed") {
      return res.json({
        ...base,
        users,
        orders,
        appointments,
        contactInquiries
      });
    }

    return res.json(base);
  } catch (error) {
    return next(error);
  }
}

function formatAgo(date) {
  const delta = Date.now() - new Date(date).getTime();
  const mins = Math.max(1, Math.floor(delta / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

async function aggregateMonthly(Model, dateField = "createdAt") {
  const rows = await Model.aggregate([
    {
      $group: {
        _id: {
          year: { $year: `$${dateField}` },
          month: { $month: `$${dateField}` }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 }
  ]);

  return rows.reverse().map((row) => ({
    label: `${row._id.year}-${String(row._id.month).padStart(2, "0")}`,
    count: row.count
  }));
}
