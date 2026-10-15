# CollectorCheck — Gateway API Specification

---

## Document Index

- [Purpose](#purpose)
- [Scope](#scope)
- [Versioning](#versioning)
- [Endpoint Groups](#endpoint-groups)
- [Verification Submission Endpoints](#verification-submission-endpoints)
- [Continuity Record Endpoints](#continuity-record-endpoints)
- [Provenance Inspection Endpoints](#provenance-inspection-endpoints)
- [Identity Intake Endpoints](#identity-intake-endpoints)
- [Activity Intake Endpoints](#activity-intake-endpoints)
- [Repository Integration Notes](#repository-integration-notes)

---

## Document Version

- **Version:** 1.0
- **Maintainer:** Isotherm Applied Sciences
- **Last Updated:** October 2026
- **Branch:** v2

---

## Repository Integration Notes

- This API specification defines the deterministic Gateway API for CollectorCheck.
- It is aligned with the Isotherm Identity Substrate and Databus transport model.
- Future versions will include contributor API surfaces, multi-hop provenance validation, and organization-facing verification analytics.

---

## Purpose

This document defines the deterministic Gateway API for CollectorCheck. It specifies the endpoints, request and response structures, and invariants required to maintain continuity, provenance, and reproducible verification results.

---

## Scope

- Verification submission endpoints
- Continuity record retrieval endpoints
- Provenance inspection endpoints
- Identity and activity intake endpoints

---

## Versioning

- **API Version:** v1
- **Stability:** Deterministic, continuity-first
- **Compatibility:** Aligned with CollectorCheck v1.0 and the Isotherm Identity Substrate

---

## Endpoint Groups

- **Verification Submission**
- **Continuity Records**
- **Provenance Inspection**
- **Identity Intake**
- **Activity Intake**

---

## Verification Submission Endpoints

### POST /verify

Submit a receipt, identity attributes, and activity metadata for deterministic verification.

**Request Body**
```json
{
	"receipt": "<base64-encoded>",
	"identity": {
		"hydropass_id": "string",
		"attributes": {}
	},
	"activity": {
		"timestamp": "ISO-8601",
		"location": "string",
		"metadata": {}
	}
}
```

**Response**
```json
{
	"verification_id": "string",
	"result": "authentic | inauthentic | indeterminate",
	"continuity_record_id": "string",
	"provenance_record_id": "string"
}
```

**Deterministic Invariants**
- Same input → same output
- No hidden heuristics
- No cloud-dependent randomness
- Fully reproducible verification

---

## Continuity Record Endpoints

### GET /continuity/{id}

Retrieve a continuity record generated during verification.

**Response**
```json
{
	"continuity_record_id": "string",
	"identity_lineage": {},
	"activity_lineage": {},
	"credential_lineage": {},
	"verification_lineage": {},
	"timestamp": "ISO-8601"
}
```

---

## Provenance Inspection Endpoints

### GET /provenance/{id}

Retrieve provenance metadata associated with a verification.

**Response**
```json
{
	"provenance_record_id": "string",
	"source": "collectorcheck",
	"identity_lineage": {},
	"activity_lineage": {},
	"credential_lineage": {},
	"verification_lineage": {},
	"transport": {
		"databus_id": "string",
		"metadata": {}
	}
}
```

**Provenance Guarantees**
- Deterministic provenance
- Unified lineage model
- Continuity-safe transport metadata

---

## Identity Intake Endpoints

### POST /identity/intake

Submit identity attributes for deterministic intake.

**Request Body**
```json
{
	"hydropass_id": "string",
	"attributes": {}
}
```

**Response**
```json
{
	"intake_id": "string",
	"status": "accepted",
	"continuity_record_id": "string"
}
```

---

## Activity Intake Endpoints

### POST /activity/intake

Submit activity metadata for deterministic intake.

**Request Body**
```json
{
	"timestamp": "ISO-8601",
	"location": "string",
	"metadata": {}
}
```

**Response**
```json
{
	"intake_id": "string",
	"status": "accepted",
	"continuity_record_id": "string"
}
```
