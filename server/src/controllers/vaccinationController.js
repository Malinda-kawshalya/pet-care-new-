import Vaccination from "../models/Vaccination.js";
import Pet from "../models/Pet.js";
import Notification from "../models/Notification.js";

export async function listVaccinations(req, res, next) {
  try {
    const { petId } = req.query;
    const filter = {};
    if (petId) filter.pet = petId;
    // owners only see their pets
    if (req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
      const pets = await Pet.find({ owner: req.user._id }).select('_id');
      filter.pet = { $in: pets.map(p => p._id) };
    }
    const items = await Vaccination.find(filter).populate('pet');
    res.json({ items });
  } catch (err) { next(err); }
}

export async function createVaccination(req, res, next) {
  try {
    // vets or owners can create records
    const payload = { ...req.body };
    const item = await Vaccination.create(payload);
    res.status(201).json({ item });
  } catch (err) { next(err); }
}

export async function updateVaccination(req, res, next) {
  try {
    const item = await Vaccination.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Vaccination not found'); }
    Object.assign(item, req.body);
    await item.save();
    res.json({ item });
  } catch (err) { next(err); }
}

export async function deleteVaccination(req, res, next) {
  try {
    const item = await Vaccination.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Vaccination not found'); }
    await item.remove();
    res.json({ message: 'Vaccination removed' });
  } catch (err) { next(err); }
}

// Manual trigger for reminders: finds upcoming vaccinations within daysAhead and not yet reminded
export async function sendVaccinationReminders(req, res, next) {
  try {
    const daysAhead = Number(req.query.days || 7);
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const due = await Vaccination.find({ nextDueDate: { $lte: cutoff }, reminderSent: false }).populate('pet');
    const created = [];
    for (const v of due) {
      // create notification for pet owner
      const notif = await Notification.create({ user: v.pet.owner, title: 'Vaccination due', message: `Vaccination ${v.vaccineName} is due on ${v.nextDueDate.toDateString()}`, type: 'vaccination', channel: 'inApp' });
      v.reminderSent = true;
      await v.save();
      created.push({ vaccinationId: v._id, notificationId: notif._id });
    }

    res.json({ created });
  } catch (err) { next(err); }
}

export default { listVaccinations, createVaccination, updateVaccination, deleteVaccination, sendVaccinationReminders };
