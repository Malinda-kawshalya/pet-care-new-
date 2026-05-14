import Notification from "../models/Notification.js";

export async function listNotifications(req, res, next) {
  try {
    const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const item = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) {
      res.status(404);
      throw new Error("Notification not found");
    }
    item.readAt = new Date();
    await item.save();
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
    res.json({ message: "All notifications marked read" });
  } catch (error) {
    next(error);
  }
}

export default {
  listNotifications,
  markRead,
  markAllRead
};