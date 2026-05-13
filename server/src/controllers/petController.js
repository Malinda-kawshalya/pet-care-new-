import Pet from "../models/Pet.js";

export const petController = {
  async list(req, res, next) {
    try {
      // Admins see all, owners see their own pets
      if (req.user && req.user.role === 'admin') {
        const items = await Pet.find().sort({ createdAt: -1 }).populate('owner');
        return res.json({ items });
      }
      const items = await Pet.find({ owner: req.user._id }).sort({ createdAt: -1 }).populate('owner');
      res.json({ items });
    } catch (error) {
      next(error);
    }
  },
  async get(req, res, next) {
    try {
      const item = await Pet.findById(req.params.id).populate('owner');
      if (!item) {
        res.status(404);
        throw new Error('Pet not found');
      }
      // allow owner or admin to view
      if (item.owner && item.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized');
      }
      res.json({ item });
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const data = { ...req.body, owner: req.user._id };
      const item = await Pet.create(data);
      await item.populate('owner');
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const item = await Pet.findById(req.params.id);
      if (!item) {
        res.status(404);
        throw new Error('Pet not found');
      }
      if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this pet');
      }
      Object.assign(item, req.body);
      await item.save();
      await item.populate('owner');
      res.json({ item });
    } catch (error) {
      next(error);
    }
  },
  async remove(req, res, next) {
    try {
      const item = await Pet.findById(req.params.id);
      if (!item) {
        res.status(404);
        throw new Error('Pet not found');
      }
      if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this pet');
      }
      await item.remove();
      res.json({ message: 'Pet deleted' });
    } catch (error) {
      next(error);
    }
  }
};

export default petController;
