import User, { APPROVAL_STATUSES, USER_ROLES } from "../models/User.js";
import { sanitizeUser } from "./authController.js";

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
    const [totalUsers, pendingApprovals, blockedUsers, verifiedUsers, byRole, byStatus] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ approvalStatus: "pending" }),
      User.countDocuments({ approvalStatus: "blocked" }),
      User.countDocuments({ isEmailVerified: true }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$approvalStatus", count: { $sum: 1 } } }])
    ]);

    res.json({
      totals: {
        users: totalUsers,
        pendingApprovals,
        blockedUsers,
        verifiedUsers
      },
      byRole: normalizeCounts(byRole, USER_ROLES),
      byStatus: normalizeCounts(byStatus, APPROVAL_STATUSES),
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
