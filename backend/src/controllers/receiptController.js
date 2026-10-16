import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import {
  deleteReceiptById,
  getReceiptById,
  getReceiptStorageById,
  insertReceipt,
  listReceipts
} from '../db/sqlite.js';
import { extractMetadataFromBody } from '../services/metadataExtractor.js';
import { normalizeMetadata } from '../services/normalizer.js';
import { uploadDirectory } from '../services/uploadStorage.js';
import { runOCR } from '../utils/ocr.js';
import { normalizeReceipt } from '../utils/normalize.js';

function missingRequiredMetadata(metadata) {
  return !metadata.date || !metadata.vendor || metadata.amount === null;
}

export async function intakeReceipt(request, response) {
  const file = request.file;
  const rawMetadata = request.body ?? {};

  if (!file) {
    return response.status(400).json({ error: 'No receipt file uploaded.' });
  }

  try {
    const fileBuffer = await readFile(file.path);
    const ocrResult = await runOCR(fileBuffer);
    const rawVendor = typeof rawMetadata.vendor === 'string' && rawMetadata.vendor.trim()
      ? rawMetadata.vendor
      : ocrResult.vendor;
    const rawDate = typeof rawMetadata.date === 'string' && rawMetadata.date.trim()
      ? rawMetadata.date
      : ocrResult.date;
    const rawAmount = rawMetadata.amount !== null && rawMetadata.amount !== undefined &&
      String(rawMetadata.amount).trim() !== ''
      ? rawMetadata.amount
      : ocrResult.amount;
    const normalized = normalizeReceipt({
      ...ocrResult,
      vendor: rawVendor,
      date: rawDate,
      amount: rawAmount
    });
    const hasAmount = rawAmount !== null && rawAmount !== undefined && String(rawAmount).trim() !== '';
    const storedAmount = hasAmount ? normalized.amount : null;
    const status = missingRequiredMetadata({
      vendor: normalized.vendor,
      date: normalized.date,
      amount: storedAmount
    }) ? 'needs_metadata' : 'accepted';

    const id = await insertReceipt({
      filename: file.originalname,
      storedFilename: file.filename,
      vendor: normalized.vendor || null,
      date: normalized.date,
      amount: storedAmount,
      rawMetadata: JSON.stringify(rawMetadata)
    });

    const imageUrl = `/api/receipts/file/${id}`;

    return response.status(201).json({
      id,
      filename: file.originalname,
      vendor: normalized.vendor || null,
      date: normalized.date,
      amount: storedAmount,
      tags: normalized.tags,
      notes: normalized.notes,
      imageUrl,
      status,
      ocr: ocrResult
    });
  } catch {
    await unlink(file.path).catch(() => {});
    return response.status(500).json({ error: 'Failed to store receipt.' });
  }
}

export function extractMetadata(request, response) {
  return response.json(extractMetadataFromBody(request.body ?? {}));
}

export function normalizeMetadataEndpoint(request, response) {
  const extracted = extractMetadataFromBody(request.body ?? {});
  return response.json(normalizeMetadata(extracted));
}

export async function storeReceipt(request, response) {
  const { filename, vendor, date, amount, rawMetadata } = request.body ?? {};

  if (typeof filename !== 'string' || filename.trim() === '') {
    return response.status(400).json({ error: 'filename is required.' });
  }

  const normalized = normalizeMetadata({ vendor, date, amount });

  try {
    const id = await insertReceipt({
      filename: filename.trim(),
      vendor: normalized.vendor,
      date: normalized.date,
      amount: normalized.amount,
      rawMetadata: rawMetadata === undefined ? null : JSON.stringify(rawMetadata)
    });

    return response.status(201).json({
      id,
      filename: filename.trim(),
      vendor: normalized.vendor,
      date: normalized.date,
      amount: normalized.amount
    });
  } catch {
    return response.status(500).json({ error: 'Failed to store receipt.' });
  }
}

export async function listAllReceipts(request, response) {
  try {
    return response.json(await listReceipts());
  } catch {
    return response.status(500).json({ error: 'Failed to list receipts.' });
  }
}

export async function getReceipt(request, response) {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Invalid receipt ID.' });
  }

  try {
    const receipt = await getReceiptById(id);
    if (!receipt) {
      return response.status(404).json({ error: 'Receipt not found.' });
    }
    return response.json(receipt);
  } catch {
    return response.status(500).json({ error: 'Failed to fetch receipt.' });
  }
}

export async function deleteReceipt(request, response) {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Invalid receipt ID.' });
  }

  try {
    const receipt = await getReceiptById(id);
    if (!receipt) {
      return response.status(404).json({ error: 'Receipt not found.' });
    }

    const storage = await getReceiptStorageById(id);
    const storedFilename = storage?.stored_filename;
    if (storedFilename) {
      const safeFilename = path.basename(storedFilename);
      if (safeFilename !== storedFilename) {
        return response.status(500).json({ error: 'Invalid stored receipt path.' });
      }

      try {
        await unlink(path.join(uploadDirectory, safeFilename));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    const deleted = await deleteReceiptById(id);
    if (!deleted) {
      return response.status(404).json({ error: 'Receipt not found.' });
    }

    return response.json({ status: 'deleted', id });
  } catch {
    return response.status(500).json({ error: 'Failed to delete receipt.' });
  }
}

export async function downloadReceipt(request, response) {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Invalid receipt ID.' });
  }

  try {
    const receipt = await getReceiptById(id);
    if (!receipt) {
      return response.status(404).json({ error: 'Receipt not found.' });
    }

    const storage = await getReceiptStorageById(id);
    const storedFilename = storage?.stored_filename;
    if (!storedFilename) {
      return response.status(404).json({ error: 'Receipt file is unavailable.' });
    }

    const safeFilename = path.basename(storedFilename);
    if (safeFilename !== storedFilename) {
      return response.status(500).json({ error: 'Invalid stored receipt path.' });
    }

    return response.download(
      path.join(uploadDirectory, safeFilename),
      receipt.filename,
      (error) => {
        if (error && !response.headersSent) {
          const status = error.code === 'ENOENT' ? 404 : 500;
          response.status(status).json({
            error: status === 404 ? 'Receipt file is unavailable.' : 'Failed to download receipt.'
          });
        }
      }
    );
  } catch {
    return response.status(500).json({ error: 'Failed to download receipt.' });
  }
}
