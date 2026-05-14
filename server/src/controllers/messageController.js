import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function listThreads(req, res, next) {
  try {
    const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
      .populate("sender", "name role avatar")
      .populate("receiver", "name role avatar")
      .populate("relatedPet", "name species breed images")
      .sort({ createdAt: -1 });

    res.json({ items: messages });
  } catch (error) {
    next(error);
  }
}

export async function listConversation(req, res, next) {
  try {
    const otherUser = await User.findById(req.params.userId).select("name role avatar");
    if (!otherUser) {
      res.status(404);
      throw new Error("User not found");
    }
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate("sender", "name role avatar")
      .populate("receiver", "name role avatar")
      .populate("relatedPet", "name species breed images")
      .sort({ createdAt: 1 });

    res.json({ user: otherUser, items: messages });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { receiver, body, relatedPet } = req.body;
    if (!receiver || !body) {
      res.status(400);
      throw new Error("receiver and body are required");
    }
    const item = await Message.create({ sender: req.user._id, receiver, relatedPet, body });
    await Notification.create({
      user: receiver,
      title: "New message",
      message: "You received a new message.",
      type: "system",
      channel: "inApp"
    });
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

export async function markConversationRead(req, res, next) {
  try {
    const result = await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );
    res.json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    next(error);
  }
}

export default {
  listThreads,
  listConversation,
  sendMessage,
  markConversationRead
};