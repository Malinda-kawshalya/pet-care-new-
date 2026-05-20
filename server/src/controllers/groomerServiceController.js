import GroomerService from "../models/GroomerService.js";

function canManage(service, user) {
  return user?.role === "admin" || String(service.groomer) === String(user?._id);
}

function servicePayload(body) {
  return {
    name: body.name,
    description: body.description || "",
    category: body.category || "Grooming",
    price: body.price === "" || body.price == null ? 0 : Number(body.price),
    durationMinutes: body.durationMinutes === "" || body.durationMinutes == null ? 60 : Number(body.durationMinutes),
    image: body.image || "",
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
  };
}

export async function listPublicServices(req, res, next) {
  try {
    const { limit, groomer, q = "" } = req.query;
    const filter = { isActive: true };
    if (groomer) filter.groomer = groomer;

    const items = await GroomerService.find(filter)
      .populate("groomer", "name email phone address providerProfile")
      .sort({ createdAt: -1 })
      .limit(100);

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.name, item.description, item.category, item.groomer?.name, item.groomer?.providerProfile?.businessName, item.groomer?.providerProfile?.serviceArea]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(search));
    });

    const parsedLimit = Number.parseInt(limit, 10);
    res.json({ items: Number.isFinite(parsedLimit) && parsedLimit > 0 ? normalized.slice(0, parsedLimit) : normalized });
  } catch (error) {
    next(error);
  }
}

export async function listMyServices(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { groomer: req.user._id };
    const items = await GroomerService.find(filter)
      .populate("groomer", "name email phone address providerProfile")
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function createService(req, res, next) {
  try {
    if (req.user.role !== "groomer" && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only groomers can create services");
    }

    const payload = servicePayload(req.body);
    if (!payload.name?.trim()) {
      res.status(400);
      throw new Error("Service name is required");
    }

    const item = await GroomerService.create({
      ...payload,
      groomer: req.user._id
    });
    const hydrated = await GroomerService.findById(item._id).populate("groomer", "name email phone address providerProfile");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await GroomerService.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }
    if (!canManage(service, req.user)) {
      res.status(403);
      throw new Error("You can only update your own services");
    }

    Object.assign(service, servicePayload(req.body));
    await service.save();
    const item = await GroomerService.findById(service._id).populate("groomer", "name email phone address providerProfile");
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const service = await GroomerService.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }
    if (!canManage(service, req.user)) {
      res.status(403);
      throw new Error("You can only delete your own services");
    }

    await service.deleteOne();
    res.json({ message: "Service deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
}
