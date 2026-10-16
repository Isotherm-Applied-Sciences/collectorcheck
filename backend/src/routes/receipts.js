import express from 'express';
import { mkdirSync } from 'node:fs';
import multer from 'multer';
import { intakeReceipt } from '../controllers/receiptController.js';
import {
  deleteReceipt,
  getReceipt,
  listReceipts,
  updateReceipt,
  uploadReceipt
} from '../controllers/receipts.js';
import { uploadDirectory } from '../services/uploadStorage.js';

const router = express.Router();
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);
mkdirSync(uploadDirectory, { recursive: true });
function fileFilter(request, file, callback) {
  if (!allowedTypes.has(file.mimetype)) {
    const error = new Error('File type not allowed.');
    error.code = 'INVALID_FILE_TYPE';
    callback(error);
    return;
  }
  callback(null, true);
}

const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

router.post('/upload', upload.single('receipt'), intakeReceipt);
router.get('/', listReceipts);
router.get('/:id', getReceipt);
router.put('/:id', updateReceipt);
router.delete('/:id', deleteReceipt);

export const uploadRouter = express.Router();
uploadRouter.post('/upload', memoryUpload.single('file'), uploadReceipt);

export default router;