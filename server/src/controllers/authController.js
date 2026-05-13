import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const approvalStatus = role && role !== "petOwner" ? "pending" : "approved";
    const user = await User.create({ name, email, password, role, approvalStatus });
    res.status(201).json({
      user: sanitizeUser(user),
      token: generateToken(user._id)
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
      avatar: req.body.avatar ?? user.avatar
    });
    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    approvalStatus: user.approvalStatus,
    isEmailVerified: user.isEmailVerified,
    avatar: user.avatar
  };
}
