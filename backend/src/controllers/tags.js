import { listReceipts } from '../utils/db.js';
import { createTagModel } from '../models/tag.js';
import { createReceiptModel } from '../models/receipt.js';

export async function listTags(request, response, next) {
  try {
    const receipts = await listReceipts();
    const counts = new Map();
    receipts.forEach((receipt) => {
      (Array.isArray(receipt.tags) ? receipt.tags : []).forEach((name) => {
        counts.set(name, (counts.get(name) || 0) + 1);
      });
    });
    return response.json([...counts.entries()].map(([name, count]) => createTagModel(name, count)));
  } catch (error) {
    return next(error);
  }
}

export async function getTag(request, response, next) {
  try {
    const receipts = await listReceipts();
    const name = request.params.name;
    const matches = receipts.filter((receipt) =>
      Array.isArray(receipt.tags) && receipt.tags.includes(name)
    );
    if (matches.length === 0) return response.status(404).json({ error: 'Tag not found.' });
    return response.json(matches.map(createReceiptModel));
  } catch (error) {
    return next(error);
  }
}