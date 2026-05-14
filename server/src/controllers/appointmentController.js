import Appointment from "../models/Appointment.js";
import Pet from "../models/Pet.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

function isProvider(user, serviceType) {
  if (!user) return false;
  if (serviceType === "training") {
    return Boolean(user.providerProfile?.specialties?.some((specialty) => String(specialty).toLowerCase() === "training") || user.role === "groomer" || user.role === "veterinarian");
  }
  return user.role === "veterinarian" || user.role === "groomer";
}

function canManageAppointment(appointment, user) {
  return String(appointment.owner) === String(user?._id) || String(appointment.provider) === String(user?._id) || user?.role === "admin";
}

export async function listAppointments(req, res, next) {
  try {
    const { q = "", status, providerId } = req.query;
    const filter = {};

    if (req.user.role === "admin") {
      if (status) filter.status = status;
      if (providerId) filter.provider = providerId;
    } else if (isProvider(req.user)) {
      filter.provider = req.user._id;
    } else {
      filter.owner = req.user._id;
    }

    const items = await Appointment.find(filter)
      .populate("pet", "name species breed images")
      .populate("owner", "name email phone")
      .populate("provider", "name email role providerProfile")
      .sort({ scheduledAt: -1 });

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.pet?.name, item.owner?.name, item.provider?.name, item.serviceType, item.location, item.notes]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(search));
    });

    res.json({ items: normalized });
  } catch (error) {
    next(error);
  }
}

export async function listProviders(req, res, next) {
  try {
    const { q = "", serviceType } = req.query;
    const query = { approvalStatus: "approved" };
    if (serviceType === "grooming") query.role = "groomer";
    else if (serviceType === "vet") query.role = "veterinarian";
    else if (serviceType === "training") query.role = { $in: ["veterinarian", "groomer", "petShop"] };
    const providers = await User.find(query).select("name email role providerProfile address");
    const items = providers.filter((provider) => {
      if (serviceType === "training") {
        const specialties = provider.providerProfile?.specialties || [];
        if (!specialties.some((specialty) => String(specialty).toLowerCase() === "training") && provider.role !== "veterinarian" && provider.role !== "groomer") {
          return false;
        }
      }
      if (!q) return true;
      const search = q.toLowerCase();
      return [provider.name, provider.email, provider.providerProfile?.businessName, provider.providerProfile?.serviceArea, provider.address]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(search));
    });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function getSlots(req, res, next) {
  try {
    const { providerId, date } = req.query;
    if (!providerId || !date) {
      res.status(400);
      throw new Error("providerId and date are required");
    }

    const provider = await User.findById(providerId).select("role");
    if (!provider || !isProvider(provider)) {
      res.status(404);
      throw new Error("Provider not found");
    }

    const day = new Date(date);
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(17, 0, 0, 0);

    const existing = await Appointment.find({
      provider: providerId,
      scheduledAt: { $gte: start, $lte: end },
      status: { $in: ["pending", "confirmed"] }
    }).select("scheduledAt");

    const used = new Set(existing.map((item) => new Date(item.scheduledAt).toISOString().slice(11, 16)));
    const slots = [];
    for (let minutes = 0; minutes <= (8 * 60); minutes += 30) {
      const slot = new Date(start.getTime() + minutes * 60000);
      const hhmm = slot.toISOString().slice(11, 16);
      if (!used.has(hhmm)) slots.push(hhmm);
    }

    res.json({ items: slots });
  } catch (error) {
    next(error);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const { pet, provider, serviceType, scheduledAt, notes, location } = req.body;
    if (!pet || !provider || !serviceType || !scheduledAt) {
      res.status(400);
      throw new Error("pet, provider, serviceType, and scheduledAt are required");
    }

    const petDoc = await Pet.findById(pet);
    if (!petDoc) {
      res.status(404);
      throw new Error("Pet not found");
    }
    if (String(petDoc.owner) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("You can only book appointments for your own pets");
    }

    const providerDoc = await User.findById(provider);
    if (!providerDoc || providerDoc.approvalStatus !== "approved" || !isProvider(providerDoc, serviceType)) {
      res.status(400);
      throw new Error("Selected provider is not available");
    }

    const conflict = await Appointment.findOne({ provider, scheduledAt: new Date(scheduledAt), status: { $in: ["pending", "confirmed"] } });
    if (conflict) {
      res.status(409);
      throw new Error("Selected time slot is already booked");
    }

    const item = await Appointment.create({
      pet,
      owner: req.user._id,
      provider,
      serviceType,
      scheduledAt,
      notes,
      location,
      status: "pending"
    });

    await Notification.create([
      {
        user: providerDoc._id,
        title: "New appointment request",
        message: `${req.user.name || "A pet owner"} requested a ${serviceType} appointment`,
        type: "appointment",
        channel: "inApp"
      },
      {
        user: req.user._id,
        title: "Appointment created",
        message: "Your appointment request has been created and sent to the provider.",
        type: "appointment",
        channel: "inApp"
      }
    ]);

    const hydrated = await Appointment.findById(item._id)
      .populate("pet", "name species")
      .populate("owner", "name email")
      .populate("provider", "name email role providerProfile");

    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(req, res, next) {
  try {
    const item = await Appointment.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Appointment not found");
    }
    if (!canManageAppointment(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to update this appointment");
    }

    const editable = ["scheduledAt", "status", "notes", "location", "provider"];
    editable.forEach((key) => {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    });

    await item.save();

    if (req.body.status === "cancelled" || req.body.scheduledAt) {
      const counterpart = String(item.owner) === String(req.user._id) ? item.provider : item.owner;
      await Notification.create({
        user: counterpart,
        title: "Appointment updated",
        message: `Appointment ${req.body.status || "rescheduled"}.`,
        type: "appointment",
        channel: "inApp"
      });
    }

    const hydrated = await Appointment.findById(item._id)
      .populate("pet", "name species")
      .populate("owner", "name email")
      .populate("provider", "name email role providerProfile");

    res.json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    const item = await Appointment.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Appointment not found");
    }
    if (!canManageAppointment(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to delete this appointment");
    }
    await item.deleteOne();
    res.json({ message: "Appointment deleted" });
  } catch (error) {
    next(error);
  }
}

export async function bookingHistory(req, res, next) {
  try {
    const items = await Appointment.find({ owner: req.user._id })
      .populate("pet", "name species")
      .populate("provider", "name role providerProfile")
      .sort({ scheduledAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export default {
  listAppointments,
  listProviders,
  getSlots,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  bookingHistory
};