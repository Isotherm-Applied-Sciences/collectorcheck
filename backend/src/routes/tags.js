import express from 'express';
import { getTag, listTags } from '../controllers/tags.js';

const router = express.Router();
router.get('/', listTags);
router.get('/:name', getTag);

export default router;