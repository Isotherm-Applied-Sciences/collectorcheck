import cors from 'cors';
import express from 'express';
import legacyReceiptRoutes from './routes/receiptRoutes.js';
import receiptRoutes, { uploadRouter } from './routes/receipts.js';
import vendorRoutes from './routes/vendors.js';
import tagRoutes from './routes/tags.js';
import statsRoutes from './routes/stats.js';
import timelineRoutes from './routes/timeline.js';
import { handleError, notFound } from './utils/errors.js';

export const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (request, response) => {
  response.json({ status: 'CollectorCheck Receipts U.S.A. backend running.' });
});

app.use('/api/receipts', legacyReceiptRoutes);
app.use('/api', uploadRouter);
app.use(['/receipts', '/api/receipts'], receiptRoutes);
app.use(['/vendors', '/api/vendors'], vendorRoutes);
app.use(['/tags', '/api/tags'], tagRoutes);
app.use(['/stats', '/api/stats'], statsRoutes);
app.use(['/timeline', '/api/timeline'], timelineRoutes);

app.use(notFound);
app.use(handleError);

app.listen(port, () => {
  console.log(`CollectorCheck backend listening on port ${port}`);
});