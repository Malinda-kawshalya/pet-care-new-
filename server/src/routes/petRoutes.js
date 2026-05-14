import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import petController from '../controllers/petController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', petController.list);
router.post('/', petController.create);
router.get('/:id', petController.get);
router.put('/:id', petController.update);
router.delete('/:id', petController.remove);
router.post('/:id/photos', upload.single('file'), petController.uploadPhoto);
router.post('/:id/photos/remove', petController.removePhoto);

export default router;
