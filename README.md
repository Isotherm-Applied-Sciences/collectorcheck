## **CollectorCheck — Receipt Ingestion & Provenance Viewer (MVP)**

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
- Safe, bounded Ditto assistant (frozen at contextual/cultural/emotional micro‑tone only)

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
- In‑memory DB (MVP)

## **Folder Structure**

```text
collectorcheck/
	frontend/
		src/
			pages/
			components/
			context/
			utils/
			Ditto/
	collectorcheck-backend/
		src/
			index.js
			routes/
			controllers/
			models/
			utils/
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
cd collectorcheck-backend
npm install
node src/index.js
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
- automation
- guided tours
- overlays
- NLP commands

Ditto **does not** perform:

- narrative inference
- mood inference
- life‑event inference
- behavioral inference
- regulated domain inference

## **License**

MIT (or your choice)
