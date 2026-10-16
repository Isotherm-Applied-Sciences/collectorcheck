import express from 'express';
import { mkdirSync } from 'node:fs';
import multer from 'multer';
import {
  deleteReceipt,
  downloadReceipt,
  extractMetadata,
  getReceipt,
  intakeReceipt,
  listAllReceipts,
  normalizeMetadataEndpoint,
  storeReceipt
} from '../controllers/receiptController.js';
import { uploadDirectory } from '../services/uploadStorage.js';

const router = express.Router();
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);
mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(request, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error('File type not allowed.');
      error.code = 'INVALID_FILE_TYPE';
      callback(error);
      return;
    }
    callback(null, true);
  }
});

router.post('/intake', upload.single('receipt'), intakeReceipt);
router.post('/extract', extractMetadata);
router.post('/normalize', normalizeMetadataEndpoint);
router.post('/store', storeReceipt);
router.get('/list', listAllReceipts);
router.get('/receipt/:id', getReceipt);
router.get('/file/:id', downloadReceipt);
router.delete('/receipt/:id', deleteReceipt);

export default router;
