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
    const items = await MedicalRecord.find(filters).populate('pet').populate('veterinarian', 'name').populate('createdBy', 'name email role');
    res.json({ items });
  } catch (err) { next(err); }
}

export async function createRecord(req, res, next) {
  try {
    const pet = await Pet.findById(req.body.pet);
    if (!pet) {
      res.status(404); throw new Error('Pet not found');
    }

    const isVetOrAdmin = req.user.role === 'veterinarian' || req.user.role === 'admin';
    const isPetOwner = String(pet.owner) === String(req.user._id);

    if (!isVetOrAdmin && !isPetOwner) {
      res.status(403); throw new Error('Not allowed to create records for this pet');
    }

    const payload = {
      ...req.body,
      createdBy: req.user._id,
      createdByRole: req.user.role
    };

    if (isVetOrAdmin) {
      payload.veterinarian = req.user._id;
    } else {
      delete payload.veterinarian;
      delete payload.vetNotes;
      delete payload.diagnosis;
      delete payload.treatment;
      delete payload.prescriptions;
    }

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
