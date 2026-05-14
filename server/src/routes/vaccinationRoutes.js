import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import vaccinationController from '../controllers/vaccinationController.js';

const router = express.Router();

router.use(protect);
router.get('/', vaccinationController.listVaccinations);
router.post('/', vaccinationController.createVaccination);
router.put('/:id', vaccinationController.updateVaccination);
router.delete('/:id', vaccinationController.deleteVaccination);

router.post('/reminders', vaccinationController.sendVaccinationReminders);

export default router;
