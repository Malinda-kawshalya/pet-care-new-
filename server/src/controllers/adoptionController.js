import AdoptionPost from "../models/AdoptionPost.js";
import Pet from "../models/Pet.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";

async function canManagePost(post, user) {
  return String(post.postedBy) === String(user?._id) || user?.role === "admin";
}

export async function listAdoptions(req, res, next) {
  try {
    const { q = "", status = "open" } = req.query;
    const filter = {};
    if (req.user.role !== "admin") filter.status = status;
    if (req.user.role !== "admin") {
      filter.$or = [{ status: "open" }, { postedBy: req.user._id }];
    }

    const items = await AdoptionPost.find(filter)
      .populate("pet", "name species breed images location vaccinationStatus")
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 });

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.title, item.description, item.location, item.pet?.name, item.pet?.breed, item.postedBy?.name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(search));
    });

    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function createAdoption(req, res, next) {
  try {
    const { pet, title, description, adoptionFee, location } = req.body;
    if (!pet || !title) {
      res.status(400);
      throw new Error("pet and title are required");
    }
    const petDoc = await Pet.findById(pet);
    if (!petDoc) {
      res.status(404);
      throw new Error("Pet not found");
    }
    if (String(petDoc.owner) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("You can only post your own pet for adoption");
    }

    const item = await AdoptionPost.create({
      pet,
      postedBy: req.user._id,
      title,
      description,
      adoptionFee,
      location,
      status: req.user.role === "admin" ? "open" : "pendingApproval"
    });

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

export async function requestAdoption(req, res, next) {
  try {
    const { message } = req.body;
    const post = await AdoptionPost.findById(req.params.id).populate("postedBy", "name email");
    if (!post) {
      res.status(404);
      throw new Error("Adoption post not found");
    }
    if (!["open", "pendingApproval"].includes(post.status) && req.user.role !== "admin") {
      res.status(400);
      throw new Error("Adoption post is not open");
    }

    post.requests.push({ user: req.user._id, message, status: "pending" });
    await post.save();

    await Notification.create({
      user: post.postedBy._id,
      title: "New adoption request",
      message: "A user requested to adopt one of your pets.",
      type: "system",
      channel: "inApp"
    });

    res.json({ item: post });
  } catch (error) {
    next(error);
  }
}

export async function respondAdoptionRequest(req, res, next) {
  try {
    const { requestId, status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400);
      throw new Error("status must be approved or rejected");
    }
    const post = await AdoptionPost.findById(req.params.id).populate("postedBy", "name email");
    if (!post) {
      res.status(404);
      throw new Error("Adoption post not found");
    }
    if (!(await canManagePost(post, req.user))) {
      res.status(403);
      throw new Error("Not allowed");
    }
    const request = post.requests.id(requestId);
    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }
    request.status = status;
    if (status === "approved") post.status = "pendingApproval";
    await post.save();

    await Notification.create({
      user: request.user,
      title: `Adoption request ${status}`,
      message: `Your adoption request was ${status}.`,
      type: "system",
      channel: "inApp"
    });

    res.json({ item: post });
  } catch (error) {
    next(error);
  }
}

export async function contactAdoptionOwner(req, res, next) {
  try {
    const post = await AdoptionPost.findById(req.params.id).populate("postedBy", "name email");
    if (!post) {
      res.status(404);
      throw new Error("Adoption post not found");
    }
    const message = req.body.message || `I am interested in ${post.title}`;
    const item = await Message.create({
      sender: req.user._id,
      receiver: post.postedBy._id,
      relatedPet: post.pet,
      body: message
    });
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

export default {
  listAdoptions,
  createAdoption,
  requestAdoption,
  respondAdoptionRequest,
  contactAdoptionOwner
};