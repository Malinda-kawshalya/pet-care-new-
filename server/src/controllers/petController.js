import Pet from "../models/Pet.js";
import { normalizeUploadPath } from "../utils/uploadPath.js";

export const petController = {
  async list(req, res, next) {
    try {
      // Admins and veterinarians see all pets; owners see their own pets
      if (req.user && (req.user.role === 'admin' || req.user.role === 'veterinarian')) {
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
  ,
  async uploadPhoto(req, res, next) {
    try {
      const item = await Pet.findById(req.params.id);
      if (!item) { res.status(404); throw new Error('Pet not found'); }
      if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
      if (!req.file) { res.status(400); throw new Error('File required'); }
      const path = `/${normalizeUploadPath(req.file.path)}`;
      item.images = item.images || [];
      item.images.push(path);
      await item.save();
      res.status(201).json({ item });
    } catch (error) { next(error); }
  },
  async removePhoto(req, res, next) {
    try {
      const item = await Pet.findById(req.params.id);
      if (!item) { res.status(404); throw new Error('Pet not found'); }
      if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
      const { filename } = req.body;
      if (!filename) { res.status(400); throw new Error('filename required'); }
      item.images = (item.images || []).filter(p => p !== filename && p !== `uploads/${filename}` && p !== `/uploads/${filename}`);
      await item.save();
      res.json({ item });
    } catch (error) { next(error); }
  }
};

export default petController;
