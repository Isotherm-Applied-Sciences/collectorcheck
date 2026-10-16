# CollectorCheck API

The backend listens on `http://localhost:4000` by default. Receipt records and tags are persisted in SQLite.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/upload` | Upload multipart field `file` with optional vendor, date, and amount. |
| GET | `/api/receipts` | Return all receipt records as an array. |
| GET | `/api/receipts/:id` | Return one receipt. |
| PUT | `/api/receipts/:id` | Update receipt filename, vendor, date, amount, or tags. |
| DELETE | `/api/receipts/:id` | Delete a receipt and its stored file, when available. |
| GET | `/api/vendors` | Return vendor summaries: `{ name, count, total }`. |
| GET | `/api/vendors/:name` | Return matching receipts as an array. |
| GET | `/api/tags` | Return tag summaries: `{ name, count }`. |
| GET | `/api/tags/:name` | Return matching receipts as an array. |
| GET | `/api/stats` | Return monthly and tag-category amount totals and overall statistics. |
| GET | `/api/timeline` | Return receipt records in ascending date order. |

The frontend uses these `/api` endpoints. The unprefixed resource routes remain available for compatibility, as do legacy receipt-ingestion routes such as `/api/receipts/list`, `/api/receipts/receipt/:id`, and `/api/receipts/file/:id`.

The receipt list updates shared frontend state. Receipt detail tag and vendor edits persist with `PUT`; vendor, tag, stats, and timeline pages reload their endpoint data after shared receipt changes. Vendor and tag links load their respective detail endpoints.

## Receipt Updates

Send JSON with only the fields to change. Omitted fields are preserved. Tags must be an array of non-empty strings; whitespace and duplicate tags are removed. Use `{"tags":[]}` to clear tags. Changes persist across backend restarts.

Receipt IDs must be positive integers. Invalid IDs or tag updates return `400`; missing receipts, vendor details, and tag details return `404`. Successful deletion returns `{ "status": "deleted", "id": 123 }`.

URL-encode vendor and tag names in detail URLs. Vendor matching is case-insensitive; tag matching is exact. Vendor and tag details return receipt arrays, not summary wrappers.

## Statistics And Timeline

`/api/stats` includes:

- `monthlyTotals`: amount totals keyed by `YYYY-MM`; receipts without dates are excluded.
- `categoryTotals`: amount totals keyed by tag; a receipt contributes once to each of its tags, including when its date is missing.
- `monthly`: a compatibility alias for `monthlyTotals`.
- `totalReceipts`, `totalAmount`, `averageAmount`, `earliestDate`, and `latestDate`.

Empty totals are `{}` and empty collection endpoints return `[]`. Use `/api/timeline?sort=desc` for newest-first ordering.

## Verification

Run `npm --prefix backend test` from the repository root. Tests use a temporary SQLite database and verify migration, receipt CRUD, vendors, tags, stats, timeline, `/api` paths, and compatibility routes. `COLLECTORCHECK_DB_PATH` can override the default database path. Run `npm --prefix frontend run build` to compile the integrated pages.
