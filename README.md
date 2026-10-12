# CollectorCheck — Receipt Verification Gateway
CollectorCheck is a free, open‑source verification gateway that allows collectors, archivists, and institutions to validate the authenticity, integrity, and provenance of receipts and purchase records. It provides a simple, reliable, and transparent way to confirm that a receipt is real, unaltered, and traceable.

CollectorCheck is part of the **Isotherm Applied Sciences** ecosystem.

---

## Features
- Upload and verify receipts
- Automatic metadata extraction
- Integrity and tamper‑checking
- Structured verification output
- Local processing (no cloud dependency)
- Lightweight Flask backend
- Simple frontend viewer
- MIT‑licensed and open for contributors

---

## Project Structure
(Indented instead of fenced code block)

collectorcheck/
    backend/
        app.py
        routes/
        services/
        models/
        utils/
        tests/
    frontend/
        index.html
        static/
        css/
        js/
        components/
    database/
        collectorcheck.db
    uploads/
        (temporary receipt files)
    logs/
    README.md
    LICENSE
    .gitignore

---

## Installation
CollectorCheck runs locally and requires Python 3.10+.

### 1. Clone the repository
git clone https://github.com/Isotherm-Applied-Sciences/collectorcheck.git
cd collectorcheck

### 2. Create a virtual environment
python -m venv .venv
source .venv/bin/activate   (macOS/Linux)
.venv\Scripts\activate      (Windows)

### 3. Install dependencies
pip install -r requirements.txt

---

## Running the Backend
Start the Flask server:

python backend/app.py

The API will be available at:

http://127.0.0.1:5000

---

## Running the Frontend
Open:

frontend/index.html

The viewer will connect to the backend automatically.

---

## API Endpoints

### POST /verify
Upload a receipt and receive a verification result.

### GET /status
Health check for the backend.

### GET /version
Returns the current CollectorCheck version.

---

## Contributing
Contributions are welcome.

### Steps
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Follow the coding style in /backend and /frontend

See CONTRIBUTING.md for full guidelines.

---

## Roadmap

### v1.1
- Improved metadata extraction
- Enhanced tamper‑detection heuristics
- Frontend UI polish

### v2.0
- Multi‑receipt batch verification
- Advanced provenance scoring
- Optional cloud sync module

See ROADMAP.md for details.

---

## License
CollectorCheck is released under the **MIT License**.
You are free to use, modify, distribute, and integrate it into commercial or open‑source projects.

---

## Maintained by
**Isotherm Applied Sciences Inc.**
Ottawa, Canada
