import User from "../models/User.js";

export async function listUsers(_req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function updateApproval(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: req.body.approvalStatus },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function analytics(_req, res) {
  res.json({
    totals: {
      users: 1500,
      pets: 2200,
      appointments: 340,
      orders: 780,
      adoptionRequests: 95
    },
    alerts: ["Vaccination reminders due", "Provider approvals pending", "Unsafe-user reports waiting"]
  });
}
