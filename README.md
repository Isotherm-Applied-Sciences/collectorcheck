# CollectorCheck — Receipt Ingestion & Provenance Viewer (MVP)

[GitHub repository](https://github.com/Isotherm-Applied-Sciences/collectorcheck) · [Developer setup](docs/setup.md) · [Architecture](docs/architecture.md) · [Folder overview](docs/folder-structure.md) · [API reference](docs/API.md)

CollectorCheck is a lightweight, deterministic receipt‑ingestion system designed for personal organization, provenance tracking, and continuity workflows.
It provides:

- Image/PDF upload
- OCR extraction (stub in MVP)
- Vendor/date/amount normalization
- Receipt list, detail, delete, edit
- Vendor overview
- Tag overview
- Stats (monthly + category totals)
- Timeline view
- Frontend + backend integration
- Bounded Ditto assistant with contextual help, static cultural moments, light tone, and user-triggered organization helpers

CollectorCheck is **not** a tax assistant, insurance assistant, compliance tool, or regulated workflow engine.

## **Features**

### ✔ Upload receipts (image/PDF)

### ✔ Automatic normalization

### ✔ Full CRUD

### ✔ Vendor totals

### ✔ Tag totals

### ✔ Monthly stats

### ✔ Timeline view

### ✔ Deterministic backend

### ✔ React frontend

### ✔ Safe Ditto assistant (frozen)

## **Tech Stack**

### **Frontend**

- React
- React Router
- Context API
- Fetch API

### **Backend**

- Node.js
- Express
- Multer (file upload)
- SQLite (persistent receipt metadata and tags)

## **Folder Structure**

```text
collectorcheck/
	frontend/
		src/
			pages/
			components/
			context/
			utils/
		tests/
	backend/
		src/
			index.js
			routes/
			controllers/
			models/
			db/
			services/
			utils/
		tests/
	docs/
		folder-structure.md
		architecture.md
		setup.md
		API.md
	LICENSE
	README.md
```

## **Backend Endpoints**

### **POST /api/upload**
Upload a receipt file.

### **GET /api/receipts**
List all receipts.

### **GET /api/receipts/:id**
Get receipt detail.

### **PUT /api/receipts/:id**
Update receipt.

### **DELETE /api/receipts/:id**
Delete receipt.

### **GET /api/vendors**
Vendor totals.

### **GET /api/tags**
Tag totals.

### **GET /api/stats**
Monthly + category totals.

### **GET /api/timeline**
Chronological receipts.

## **Setup Instructions**

### **Backend**

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:4000
```

### **Frontend**

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3001
```

## **Ditto Assistant (Frozen Mode)**

Ditto is included in the frontend but frozen at:

- contextual help
- cultural micro‑moments
- emotional micro‑tone
- user-triggered deterministic organization (browser-local)
- guided tours
- overlays
- fixed-keyword commands, including explicit repeat requests

Ditto **does not** perform:

- narrative inference
- mood inference
- life‑event inference
- behavioral inference
- regulated domain inference
- usage-history-based action predictions

Manual tags remain available. Ditto does not infer tax relevance, learn tax patterns, or classify receipts for regulated workflows. Receipt-level tag and vendor edits persist through the API; Ditto's organization helpers currently update browser-local/shared state only.

## MVP Limitations

- OCR is a stub. Enter vendor, date, and amount manually.
- `/api/upload` accepts JPEG, PNG, and PDF files up to 5 MiB. It persists metadata, not original file bytes, so downloads from that upload route are unavailable. Legacy disk-backed upload routes retain files separately.
- This is a public source release, not a hosted service. The local API has no authentication and needs a security review before public deployment.
- Navigation can overflow on narrow mobile screens; that existing layout issue remains open.

## Verification

From the repository root:

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
```

Backend tests use temporary SQLite databases. Frontend tests enforce the frozen Ditto boundary. Production build output is generated in `frontend/dist/` and is not committed.

## **License**

[MIT](LICENSE)
