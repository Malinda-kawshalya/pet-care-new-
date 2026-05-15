import ContactInquiry from "../models/ContactInquiry.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function submitContactInquiry(req, res, next) {
  try {
    const { name, email, subject, message, role = "", phone = "" } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error("name, email, subject and message are required");
    }

    const item = await ContactInquiry.create({ name, email, subject, message, role, phone });

    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length) {
      await Notification.insertMany(
        admins.map((admin) => ({
          user: admin._id,
          title: "New contact inquiry",
          message: `${name} sent a support message about ${subject}`,
          type: "system",
          channel: "inApp"
        }))
      );
    }

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}