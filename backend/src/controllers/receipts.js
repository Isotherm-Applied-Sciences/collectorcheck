import { deleteReceipt as deleteLegacyReceipt } from './receiptController.js';
import {
  getReceiptById,
  insertReceipt,
  listReceipts as listReceiptRows,
  updateReceiptById
} from '../utils/db.js';
import { createReceiptModel } from '../models/receipt.js';
import { normalizeMetadata, normalizeReceipt as normalizeUploadReceipt } from '../utils/normalize.js';
import { runOCR } from '../utils/ocr.js';

export const deleteReceipt = deleteLegacyReceipt;

export async function uploadReceipt(request, response, next) {
  if (!request.file?.buffer) {
    return response.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const ocrResult = await runOCR(request.file.buffer);
    const submitted = request.body ?? {};
    const vendor = typeof submitted.vendor === 'string' && submitted.vendor.trim()
      ? submitted.vendor
      : ocrResult.vendor;
    const date = typeof submitted.date === 'string' && submitted.date.trim()
      ? submitted.date
      : ocrResult.date;
    const amount = submitted.amount !== undefined && submitted.amount !== null && String(submitted.amount).trim() !== ''
      ? submitted.amount
      : ocrResult.amount;
    const normalized = normalizeUploadReceipt({ ...ocrResult, vendor, date, amount });
    const hasAmount = amount !== undefined && amount !== null && String(amount).trim() !== '';
    const storedAmount = hasAmount ? normalized.amount : null;
    const rawMetadata = JSON.stringify({ ...submitted, ocr: ocrResult });
    const id = await insertReceipt({
      filename: request.file.originalname,
      storedFilename: null,
      vendor: normalized.vendor || null,
      date: normalized.date,
      amount: storedAmount,
      rawMetadata
    });
    const receipt = createReceiptModel({
      id,
      filename: request.file.originalname,
      vendor: normalized.vendor || null,
      date: normalized.date,
      amount: storedAmount,
      tags: normalized.tags,
      notes: normalized.notes,
      imageUrl: normalized.imageUrl,
      raw_metadata: rawMetadata
    });

    return response.status(201).json({
      ...receipt,
      status: normalized.vendor && normalized.date && hasAmount
        ? 'accepted'
        : 'needs_metadata'
    });
  } catch (error) {
    return next(error);
  }
}

export async function listReceipts(request, response, next) {
  try {
    const receipts = await listReceiptsFromDatabase();
    return response.json(receipts.map(createReceiptModel));
  } catch (error) {
    return next(error);
  }
}

export async function getReceipt(request, response, next) {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Invalid receipt ID.' });
  }

  try {
    const receipt = await getReceiptById(id);
    if (!receipt) return response.status(404).json({ error: 'Receipt not found.' });
    return response.json(createReceiptModel(receipt));
  } catch (error) {
    return next(error);
  }
}

export async function updateReceipt(request, response, next) {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Invalid receipt ID.' });
  }

  try {
    const current = await getReceiptById(id);
    if (!current) return response.status(404).json({ error: 'Receipt not found.' });

    const body = request.body ?? {};
    if (body.tags !== undefined && (!Array.isArray(body.tags) ||
      body.tags.some((tag) => typeof tag !== 'string' || !tag.trim()))) {
      return response.status(400).json({ error: 'tags must be an array of non-empty strings.' });
    }
    const tags = body.tags === undefined ? current.tags : [...new Set(body.tags.map((tag) => tag.trim()))];
    const filename = typeof body.filename === 'string' && body.filename.trim()
      ? body.filename.trim()
      : current.filename;
    const normalized = normalizeMetadata({
      vendor: body.vendor === undefined ? current.vendor : body.vendor,
      date: body.date === undefined ? current.date : body.date,
      amount: body.amount === undefined ? current.amount : body.amount
    });
    const updated = await updateReceiptById(id, {
      filename,
      vendor: normalized.vendor,
      date: normalized.date,
      amount: normalized.amount,
      tags
    });
    if (!updated) return response.status(404).json({ error: 'Receipt not found.' });

    return response.json(createReceiptModel(await getReceiptById(id)));
  } catch (error) {
    return next(error);
  }
}

async function listReceiptsFromDatabase() {
  return listReceiptRows();
}