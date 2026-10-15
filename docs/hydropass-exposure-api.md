# HydroPass — Exposure & Credential API Specification

---

## Document Index

- [Purpose](#purpose)
- [Scope](#scope)
- [Versioning](#versioning)
- [Endpoint Groups](#endpoint-groups)
- [Identity Exposure Endpoints](#identity-exposure-endpoints)
- [Credential Issuance Endpoints](#credential-issuance-endpoints)
- [Credential Validation Endpoints](#credential-validation-endpoints)
- [Identity Lineage Retrieval Endpoints](#identity-lineage-retrieval-endpoints)
- [Repository Integration Notes](#repository-integration-notes)

---

## Document Version

- **Version:** 1.0
- **Maintainer:** Isotherm Applied Sciences
- **Last Updated:** October 2026
- **Branch:** v2

---

## Repository Integration Notes

- This API specification defines the deterministic Exposure & Credential API for HydroPass.
- It is aligned with the Isotherm Identity Substrate and Databus transport model.
- Future versions will include scoped exposure surfaces, privacy-preserving verification flows, and extended credential lineage.

---

## Purpose

This document defines the deterministic Exposure & Credential API for HydroPass. It specifies the endpoints, request and response structures, and invariants required to maintain continuity, privacy, and stable identity attributes across the Isotherm ecosystem.

---

## Scope

- Identity attribute exposure
- Credential issuance
- Credential validation
- Continuity-safe identity lineage
- Privacy-preserving verification flows

---

## Versioning

- **API Version:** v1
- **Stability:** Deterministic, continuity-first
- **Compatibility:** Aligned with HydroPass v1.0 and the Isotherm Identity Substrate

---

## Endpoint Groups

- **Identity Exposure**
- **Credential Issuance**
- **Credential Validation**
- **Identity Lineage Retrieval**

---

## Identity Exposure Endpoints

### POST /expose

Expose a scoped subset of identity attributes in a privacy-preserving manner.

**Request Body**
```json
{
	"hydropass_id": "string",
	"requested_attributes": ["string"],
	"scope": "minimal | extended",
	"metadata": {}
}
```

**Response**
```json
{
	"exposure_id": "string",
	"attributes": {},
	"continuity_record_id": "string"
}
```

**Exposure Invariants**
- Attribute exposure must be deterministic
- No over-exposure beyond requested scope
- Continuity-safe identity lineage

---

## Credential Issuance Endpoints

### POST /credential/issue

Issue a HydroPass credential with deterministic identity attributes.

**Request Body**
```json
{
	"hydropass_id": "string",
	"attributes": {},
	"metadata": {}
}
```

**Response**
```json
{
	"credential_id": "string",
	"status": "issued",
	"continuity_record_id": "string"
}
```

**Issuance Guarantees**
- Deterministic credential attributes
- Continuity-safe issuance lineage
- No retroactive mutation

---

## Credential Validation Endpoints

### POST /credential/validate

Validate a HydroPass credential deterministically.

**Request Body**
```json
{
	"credential_id": "string",
	"hydropass_id": "string",
	"metadata": {}
}
```

**Response**
```json
{
	"validation_id": "string",
	"result": "valid | invalid",
	"continuity_record_id": "string"
}
```

**Validation Rules**
- Deterministic validation
- Unified identity lineage
- Continuity-safe validation metadata

---

## Identity Lineage Retrieval Endpoints

### GET /identity/lineage/{id}

Retrieve identity lineage associated with a HydroPass identity.

**Response**
```json
{
	"lineage_id": "string",
	"identity_lineage": {},
	"credential_lineage": {},
	"exposure_lineage": {},
	"validation_lineage": {},
	"timestamp": "ISO-8601"
}
```

**Lineage Guarantees**
- Deterministic lineage propagation
- Unified lineage model
- Continuity-safe identity history

---
