import { listReceipts } from '../utils/db.js';
import { createReceiptModel } from '../models/receipt.js';

export async function getTimeline(request, response, next) {
  try {
    const receipts = await listReceipts();
    const direction = request.query.sort === 'desc' ? -1 : 1;
    const sorted = [...receipts].sort((a, b) => {
      const aDate = Date.parse(a.date || '') || 0;
      const bDate = Date.parse(b.date || '') || 0;
      return (aDate - bDate) * direction;
    });
    return response.json(sorted.map(createReceiptModel));
  } catch (error) {
    return next(error);
  }
}