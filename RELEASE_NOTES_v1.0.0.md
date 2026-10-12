# CollectorCheck Release Notes — v1.0.0

Release Date: October 2026  
Maintainer: Isotherm Applied Sciences Inc.

This is the first public release of CollectorCheck, the open‑source receipt verification gateway designed for collectors, archivists, institutions, and developers. Version 1.0.0 establishes the foundation of the verification pipeline, the backend API, and the frontend viewer.

---

## Overview

CollectorCheck v1.0.0 introduces a complete local-first verification workflow, enabling users to upload receipts, extract metadata, and perform integrity checks. This release focuses on simplicity, reliability, and transparency, providing a minimal but solid foundation for future enhancements.

---

## New Features

### Receipt Upload and Verification
- Upload receipts in common formats
- Automatic metadata extraction
- Basic tamper-check heuristics
- Structured verification output

### Backend API (Flask)
- POST /verify endpoint for receipt processing
- GET /status endpoint for health checks
- GET /version endpoint for version reporting
- Local SQLite database for storage

### Frontend Viewer
- Simple HTML-based interface
- Automatic connection to backend
- Clean display of verification results

### Local Processing
- No cloud dependency
- All verification performed on the user's machine
- Temporary file handling via uploads directory

### Project Structure
- Modular backend components
- Organized frontend assets
- Dedicated directories for logs, uploads, and database

---

## Improvements Included in v1.0.0

- Deterministic verification pipeline
- Clear separation of backend and frontend logic
- Basic error handling and user feedback
- Initial logging framework
- MIT License for open-source use

---

## Known Limitations

- Metadata extraction is basic and will be expanded in future versions
- Tamper detection is heuristic-based and not yet comprehensive
- No batch verification support
- No provenance scoring system
- No plugin architecture for custom validators
- Frontend UI is intentionally minimal

These limitations are expected for a v1 foundation release.

---

## Breaking Changes

None. This is the initial public release.

---

## Upgrade Notes

If you are upgrading from a pre-release or internal version:
- Delete old uploads and logs directories
- Recreate your virtual environment
- Install dependencies from requirements.txt
- Ensure database directory is writable

---

## Roadmap Alignment

This release corresponds to the baseline defined in ROADMAP.md.  
Upcoming versions will focus on:
- Enhanced metadata extraction
- Improved tamper detection
- Developer tooling
- Batch verification
- Provenance scoring
- Extensibility framework

---

## Contributors

This release was prepared by:
Isotherm Applied Sciences Inc.  
Ottawa, Canada

Community contributions will be welcomed starting with v1.1.

---

## License

CollectorCheck v1.0.0 is released under the MIT License.  
Users and developers are free to use, modify, distribute, and integrate the software into commercial or open-source projects.

