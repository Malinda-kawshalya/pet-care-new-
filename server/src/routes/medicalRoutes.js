import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import medicalController from '../controllers/medicalController.js';

const router = express.Router();

router.use(protect);
router.get('/', medicalController.listRecords);
router.post('/', medicalController.createRecord);
router.put('/:id', medicalController.updateRecord);
router.delete('/:id', medicalController.deleteRecord);

export default router;
