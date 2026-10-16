import express from 'express';
import { getVendor, listVendors } from '../controllers/vendors.js';

const router = express.Router();
router.get('/', listVendors);
router.get('/:name', getVendor);

export default router;