# CollectorCheck Setup

## Requirements

- Node.js 18 or newer, as declared in both package manifests. Prefer a currently supported LTS release; development checks have used Node.js 24.
- npm, included with Node.js.
- Two terminals opened at the repository root.

Check your installation:

```bash
node --version
npm --version
```

## Get The Source

```bash
git clone https://github.com/Isotherm-Applied-Sciences/collectorcheck.git
cd collectorcheck
```

The checked-in backend directory is `backend/`; `collectorcheck-backend` is its package name. The [folder overview](folder-structure.md) and [architecture diagram](architecture.md) describe the current implementation.

## Start The Backend

In the first terminal:

```bash
cd backend
npm install
npm start
```

The API listens at `http://localhost:4000`. Opening that URL returns the backend status response. No database server or external OCR service is required.

`npm run dev` starts the backend with automatic restarts. Stop either mode with Ctrl+C.

## Start The Frontend

In the second terminal, starting from the repository root:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3001`. Upload a JPEG, PNG, or PDF, then browse Receipts, Vendors, Tags, Stats, and Timeline. The upload limit is 5 MiB. Enter vendor, date, and amount manually: OCR is a stub in this MVP.

Use Receipt Details to add or remove tags and save vendor corrections. These edits persist through the API. Monthly and tag totals come from the backend, not local-only calculations.

## Data And Configuration

- Receipt metadata and tags persist in `backend/receipts.db` using SQLite. Schema setup and migrations run automatically.
- `COLLECTORCHECK_DB_PATH` optionally selects a different SQLite database file. Its parent directory must already exist.
- `PORT` optionally changes the backend port; the default is 4000.
- The frontend API URL is configured in [api.js](../frontend/src/utils/api.js) and defaults to `http://localhost:4000`. If the backend port changes, update that value too.
- Uploads through `/api/upload` are processed in memory and persist metadata, not original file bytes. File downloads for those receipts are unavailable. Legacy disk-backed upload routes use `backend/uploads/`.
- Browser-local Ditto memory, preferences, and saved views remain specific to that browser.

Treat this setup as local development. The MVP has no authentication; do not expose personal receipts through a public deployment without an appropriate security review.

See the [API reference](API.md) for request and response details.

## Verify Changes

From the repository root:

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
```

Backend tests use a temporary SQLite database and clean it up afterward. They cover schema migration, receipt CRUD, vendors, tags, stats, timeline, API prefixes, and compatibility routes. They do not use the normal development database.

Frontend tests enforce the frozen Ditto boundary: no tax inference, tax-pattern learning, or usage-history-based predictions. Contextual help and explicit deterministic organization commands remain available.

The frontend production build is written to `frontend/dist/`. Existing Webpack bundle-size warnings do not prevent compilation. The build command does not start a production web server or package the backend.

## Dependency Security

Run advisory checks separately from functional tests:

```bash
npm --prefix backend audit
npm --prefix frontend audit
```

At release verification, npm reported 10 backend advisories (2 low, 7 high, 1 critical) and 9 frontend advisories (4 moderate, 5 high). Affected paths include `tar` in SQLite's native installation dependency chain, backend development tooling, and frontend router/development dependencies. Functional test success does not resolve these findings.

Dependency remediation remains open. Do not expose the MVP publicly as a service until the advisory paths and missing authentication have been addressed. Review upgrades and rerun tests; no forced dependency upgrades were applied during source publication.

## Troubleshooting

- API errors: confirm the backend is running at the URL configured in the frontend.
- Port already in use: stop the previous development process or choose a different port. For the frontend, run `npm start -- --port 3002` from `frontend/`; for a changed backend port, update the frontend API URL as well.
- SQLite installation failure: use a supported Node.js LTS release and reinstall backend dependencies. If a native build is required on Windows, install the appropriate C++ build tools and Python for node-gyp.
- On Windows PowerShell, use `Invoke-WebRequest -UseBasicParsing` for API checks to avoid the HTML parsing confirmation prompt.
