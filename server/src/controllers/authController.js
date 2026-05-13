import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

const providerRoles = ["veterinarian", "petShop", "groomer"];

export async function register(req, res, next) {
  try {
    const { name, email, password, role = "petOwner", phone, address, providerProfile } = req.body;
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

    res.status(201).json({
      user: sanitizeUser(user),
      token: generateToken(user._id),
      verificationToken,
      message: "Account created. Verify email with the returned token in this development build."
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been prepared." });
    }

    const resetToken = createToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiresInHours(1);
    await user.save();

    return res.json({
      message: "Password reset token generated for this development build.",
      resetToken
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
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
    res.json({ message: "Password reset successfully" });
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
    if (user.isEmailVerified) {
      return res.json({ message: "Email is already verified" });
    }

    const verificationToken = createToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = expiresInHours(24);
    await user.save();
    return res.json({ message: "Verification token generated", verificationToken });
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
