import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail, generateVerificationLink, generatePasswordResetLink } from "../utils/emailService.js";
import crypto from "crypto";

const providerRoles = ["veterinarian", "petShop", "groomer"];
const signUpRoles = ["petOwner", "veterinarian", "petShop", "groomer"];

export async function register(req, res, next) {
  try {
    const { name, email, password, role = "petOwner", phone, address, providerProfile } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    if (!signUpRoles.includes(role)) {
      res.status(400);
      throw new Error("Invalid role. Sign up is available for petOwner, veterinarian, petShop, and groomer only");
    }
    
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const verificationToken = createToken();
    const approvalStatus = providerRoles.includes(role) ? "pending" : "approved";
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
      providerProfile,
      approvalStatus,
      verificationToken,
      verificationTokenExpires: expiresInHours(24)
    });

    // Send welcome email
    const verificationLink = generateVerificationLink(verificationToken);
    await sendEmail(email, "welcome", [name, verificationToken, verificationLink]);

    res.status(201).json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
      verificationToken,
      message: "Account created successfully. Check your email to verify your address."
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (user.approvalStatus === "blocked") {
      res.status(403);
      throw new Error("Account is blocked");
    }

    user.lastLoginAt = new Date();
    await user.save();
    res.json({ user: sanitizeUser(user), token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res) {
  res.json({ user: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    Object.assign(user, {
      name: req.body.name ?? user.name,
      phone: req.body.phone ?? user.phone,
      address: req.body.address ?? user.address,
      avatar: req.body.avatar ?? user.avatar,
      bio: req.body.bio ?? user.bio,
      providerProfile: req.body.providerProfile ?? user.providerProfile
    });
    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current password and new password are required");
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("New password must be at least 6 characters");
    }
    if (currentPassword === newPassword) {
      res.status(400);
      throw new Error("New password must be different from current password");
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = createToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiresInHours(1);
    await user.save();

    // Send password reset email
    const resetLink = generatePasswordResetLink(resetToken);
    await sendEmail(email, "passwordReset", [user.name, resetToken, resetLink]);

    return res.json({
      message: "Password reset link sent to your email.",
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400);
      throw new Error("Token and password are required");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400);
      throw new Error("Reset token is invalid or expired");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400);
      throw new Error("Verification token is invalid or expired");
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.json({ message: "Email verified successfully", user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.isEmailVerified) {
      return res.json({ message: "Email is already verified" });
    }

    const verificationToken = createToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = expiresInHours(24);
    await user.save();

    // Send verification email
    const verificationLink = generateVerificationLink(verificationToken);
    await sendEmail(user.email, "welcome", [user.name, verificationToken, verificationLink]);

    return res.json({ 
      message: "Verification email sent. Check your inbox.",
      verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined
    });
  } catch (error) {
    return next(error);
  }
}

export function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
    role: user.role,
    approvalStatus: user.approvalStatus,
    isEmailVerified: user.isEmailVerified,
    avatar: user.avatar,
    providerProfile: user.providerProfile,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt
  };
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function expiresInHours(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Demo accounts seeding
export async function seedDemoAccounts(req, res, next) {
  try {
    const demoAccounts = [
      { name: "Pet Owner Demo", email: "owner@demo.com", password: "demo123", role: "petOwner" },
      { name: "Veterinarian Demo", email: "vet@demo.com", password: "demo123", role: "veterinarian" },
      { name: "Pet Shop Demo", email: "shop@demo.com", password: "demo123", role: "petShop" },
      { name: "Groomer Demo", email: "groomer@demo.com", password: "demo123", role: "groomer" },
      { name: "Admin Demo", email: "admin@demo.com", password: "demo123", role: "admin" }
    ];

    const results = [];
    for (const account of demoAccounts) {
      const existing = await User.findOne({ email: account.email });
      if (existing) {
        results.push({ ...account, status: "exists", userId: existing._id });
      } else {
        const user = await User.create({
          name: account.name,
          email: account.email,
          password: account.password,
          role: account.role,
          isEmailVerified: true,
          approvalStatus: "approved",
          phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          address: "123 Demo Street, Demo City",
          providerProfile: account.role !== "petOwner" ? {
            businessName: `${account.name} Business`,
            licenseNumber: `DEMO-${account.role.toUpperCase()}-${Math.random().toString().slice(2, 8)}`,
            serviceArea: "Demo City",
            specialties: ["General Care"]
          } : undefined
        });
        results.push({ ...account, status: "created", userId: user._id });
      }
    }

    res.json({
      message: "Demo accounts processed",
      accounts: results
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Get all users
export async function getAllUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        approvalStatus: user.approvalStatus,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      })),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Get single user
export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ user: await sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

// Admin: Update user approval status
export async function updateUserApprovalStatus(req, res, next) {
  try {
    const { userId } = req.params;
    const { approvalStatus } = req.body;

    const validStatuses = ["pending", "approved", "blocked", "rejected"];
    if (!validStatuses.includes(approvalStatus)) {
      res.status(400);
      throw new Error(`Invalid approval status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { approvalStatus },
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Send approval/rejection email if user is a provider
    if (providerRoles.includes(user.role) && ["approved", "rejected"].includes(approvalStatus)) {
      await sendEmail(user.email, "approval", [user.name, user.role, approvalStatus]);
    }

    res.json({
      message: `User ${approvalStatus} successfully`,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Update user role
export async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ["petOwner", "veterinarian", "petShop", "groomer", "admin"];
    if (!validRoles.includes(role)) {
      res.status(400);
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.role = role;
    
    // Reset approval status for service providers
    const providerRoles = ["veterinarian", "petShop", "groomer"];
    if (providerRoles.includes(role) && user.approvalStatus === "approved") {
      user.approvalStatus = "pending";
    }

    await user.save();
    
    res.json({
      message: "User role updated successfully",
      user: await sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Delete user
export async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// Admin: Get user statistics
export async function getUserStatistics(req, res, next) {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      byRole: {},
      byApprovalStatus: {}
    };

    // Count by role
    for (const role of ["petOwner", "veterinarian", "petShop", "groomer", "admin"]) {
      stats.byRole[role] = await User.countDocuments({ role });
    }

    // Count by approval status
    for (const status of ["pending", "approved", "blocked", "rejected"]) {
      stats.byApprovalStatus[status] = await User.countDocuments({ approvalStatus: status });
    }

    // Get verification stats
    stats.emailVerified = await User.countDocuments({ isEmailVerified: true });
    stats.emailUnverified = await User.countDocuments({ isEmailVerified: false });

    res.json(stats);
  } catch (error) {
    next(error);
  }
}

// Get pending provider approvals
export async function getPendingApprovals(req, res, next) {
  try {
    const pendingUsers = await User.find({
      approvalStatus: "pending",
      role: { $in: ["veterinarian", "petShop", "groomer"] }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      count: pendingUsers.length,
      users: pendingUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessName: user.providerProfile?.businessName,
        licenseNumber: user.providerProfile?.licenseNumber,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}
