import MedicalRecord from "../models/MedicalRecord.js";
import Pet from "../models/Pet.js";

export async function listRecords(req, res, next) {
  try {
    const { petId } = req.query;
    const filters = {};
    if (petId) filters.pet = petId;
    // owners can only see their pet records
    if (req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
      // assume owner
      const pets = await Pet.find({ owner: req.user._id }).select('_id');
      filters.pet = { $in: pets.map(p => p._id) };
    }
    const items = await MedicalRecord.find(filters).populate('pet').populate('veterinarian', 'name');
    res.json({ items });
  } catch (err) { next(err); }
}

export async function createRecord(req, res, next) {
  try {
    // Only veterinarians or admins can create medical records
    if (!(req.user.role === 'veterinarian' || req.user.role === 'admin')) {
      res.status(403); throw new Error('Only veterinarians can create records');
    }
    const payload = { ...req.body, veterinarian: req.user._id };
    const item = await MedicalRecord.create(payload);
    res.status(201).json({ item });
  } catch (err) { next(err); }
}

export async function updateRecord(req, res, next) {
  try {
    const item = await MedicalRecord.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Record not found'); }
    // vet or admin
    if (!(req.user.role === 'veterinarian' || req.user.role === 'admin')) { res.status(403); throw new Error('Not allowed'); }
    Object.assign(item, req.body);
    await item.save();
    res.json({ item });
  } catch (err) { next(err); }
}

export async function deleteRecord(req, res, next) {
  try {
    const item = await MedicalRecord.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Record not found'); }
    if (!(req.user.role === 'veterinarian' || req.user.role === 'admin')) { res.status(403); throw new Error('Not allowed'); }
    await item.remove();
    res.json({ message: 'Record deleted' });
  } catch (err) { next(err); }
}

export default { listRecords, createRecord, updateRecord, deleteRecord };
