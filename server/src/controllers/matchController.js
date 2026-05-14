import MatchRequest from "../models/MatchRequest.js";
import Pet from "../models/Pet.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

async function isOwnerOfPet(petId, userId) {
  const pet = await Pet.findById(petId).select("owner");
  return pet && String(pet.owner) === String(userId);
}

export async function listMatchablePets(req, res, next) {
  try {
    const { breed, gender, city, species, q = "" } = req.query;
    const filter = { owner: { $ne: req.user._id } };
    if (breed) filter.breed = new RegExp(breed, "i");
    if (gender && gender !== "any") filter.gender = gender;
    if (species) filter.species = species;
    if (city) filter["location.city"] = new RegExp(city, "i");

    const items = await Pet.find(filter).populate("owner", "name address role").sort({ createdAt: -1 });
    const normalized = items.filter((pet) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [pet.name, pet.breed, pet.species, pet.owner?.name, pet.location?.city]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    });
    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function updateMatchProfile(req, res, next) {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      res.status(404);
      throw new Error("Pet not found");
    }
    if (String(pet.owner) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not allowed");
    }

    pet.matchProfile = {
      ...(pet.matchProfile || {}),
      isLooking: req.body.isLooking ?? pet.matchProfile?.isLooking ?? false,
      preferredBreed: req.body.preferredBreed ?? pet.matchProfile?.preferredBreed,
      preferredGender: req.body.preferredGender ?? pet.matchProfile?.preferredGender ?? "any",
      preferredAgeMin: req.body.preferredAgeMin ?? pet.matchProfile?.preferredAgeMin,
      preferredAgeMax: req.body.preferredAgeMax ?? pet.matchProfile?.preferredAgeMax,
      notes: req.body.notes ?? pet.matchProfile?.notes
    };
    await pet.save();
    res.json({ item: pet });
  } catch (error) {
    next(error);
  }
}

export async function createMatchRequest(req, res, next) {
  try {
    const { requesterPet, targetPet, message } = req.body;
    if (!requesterPet || !targetPet) {
      res.status(400);
      throw new Error("requesterPet and targetPet are required");
    }
    if (!(await isOwnerOfPet(requesterPet, req.user._id))) {
      res.status(403);
      throw new Error("You can only request matches for your own pet");
    }
    const target = await Pet.findById(targetPet).populate("owner", "name email");
    if (!target) {
      res.status(404);
      throw new Error("Target pet not found");
    }

    const item = await MatchRequest.create({ requesterPet, targetPet, message, status: "pending" });
    await Notification.create({
      user: target.owner._id,
      title: "New match request",
      message: "A pet owner has sent you a match request.",
      type: "system",
      channel: "inApp"
    });
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

export async function listMatchRequests(req, res, next) {
  try {
    const { type = "inbox", status } = req.query;
    const requesterPets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = requesterPets.map((pet) => pet._id);
    const filter = {};
    if (status) filter.status = status;
    if (type === "outbox") filter.requesterPet = { $in: petIds };
    else filter.targetPet = { $in: petIds };

    const items = await MatchRequest.find(filter)
      .populate({ path: "requesterPet", populate: { path: "owner", select: "name" } })
      .populate({ path: "targetPet", populate: { path: "owner", select: "name" } })
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function respondMatchRequest(req, res, next) {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      res.status(400);
      throw new Error("status must be accepted or rejected");
    }
    const item = await MatchRequest.findById(req.params.id)
      .populate({ path: "targetPet", populate: { path: "owner", select: "name email" } })
      .populate({ path: "requesterPet", populate: { path: "owner", select: "name email" } });
    if (!item) {
      res.status(404);
      throw new Error("Match request not found");
    }
    const targetOwner = item.targetPet?.owner;
    if (String(targetOwner?._id) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only the target pet owner can respond");
    }
    item.status = status;
    await item.save();

    await Notification.create({
      user: item.requesterPet.owner._id,
      title: `Match request ${status}`,
      message: `Your match request was ${status}.`,
      type: "system",
      channel: "inApp"
    });

    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function reportMatchRequest(req, res, next) {
  try {
    const item = await MatchRequest.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Match request not found");
    }
    item.status = "reported";
    item.reportReason = req.body.reportReason || "Reported by user";
    await item.save();
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export default {
  listMatchablePets,
  updateMatchProfile,
  createMatchRequest,
  listMatchRequests,
  respondMatchRequest,
  reportMatchRequest
};