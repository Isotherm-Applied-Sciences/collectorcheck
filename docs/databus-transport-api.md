# Databus — Deterministic Identity Transport API Specification

---

## Purpose

This document defines the deterministic Identity Transport API for Databus. It specifies the endpoints, request and response structures, and invariants required to maintain continuity, provenance, and stable identity movement across the Isotherm ecosystem.

---

## Scope

- Deterministic identity transport
- Continuity-safe transport metadata
- Unified lineage propagation
- Provenance-safe movement guarantees
- Cross-product identity movement

---

## Versioning

- **API Version:** v1
- **Stability:** Deterministic, continuity-first
- **Compatibility:** Aligned with Databus v1.0 and the Isotherm Identity Substrate

---

## Endpoint Groups

- **Identity Transport**
- **Transport Metadata Retrieval**
- **Lineage Propagation**
- **Provenance Transport Inspection**

---

## Identity Transport Endpoints

### POST /transport

Transport identity attributes deterministically across the Isotherm ecosystem.

**Request Body**
```json
{
	"hydropass_id": "string",
	"attributes": {},
	"source": "collectorcheck | hydropass | external",
	"destination": "collectorcheck | hydropass | external",
	"metadata": {}
}
```

**Response**
```json
{
	"transport_id": "string",
	"status": "delivered",
	"continuity_record_id": "string"
}
```

**Transport Invariants**
- Deterministic identity movement
- No mutation during transport
- Continuity-safe propagation

---

## Transport Metadata Retrieval Endpoints

### GET /transport/metadata/{id}

Retrieve metadata associated with a deterministic identity transport.

**Response**
```json
{
	"transport_id": "string",
	"source": "string",
	"destination": "string",
	"metadata": {},
	"timestamp": "ISO-8601"
}
```

**Metadata Guarantees**
- Deterministic metadata
- No retroactive mutation
- Unified transport lineage

---

## Lineage Propagation Endpoints

### POST /lineage/propagate

Propagate unified identity lineage across products.

**Request Body**
```json
{
	"hydropass_id": "string",
	"lineage": {
		"identity_lineage": {},
		"credential_lineage": {},
		"verification_lineage": {},
		"transport_lineage": {}
	},
	"metadata": {}
}
```

**Response**
```json
{
	"propagation_id": "string",
	"status": "propagated",
	"continuity_record_id": "string"
}
```

**Propagation Rules**
- Deterministic lineage propagation
- Unified lineage model
- Continuity-safe propagation

---

## Provenance Transport Inspection Endpoints

### GET /provenance/transport/{id}

Retrieve provenance metadata associated with a deterministic identity transport.

**Response**
```json
{
	"provenance_id": "string",
	"transport_id": "string",
	"identity_lineage": {},
	"credential_lineage": {},
	"verification_lineage": {},
	"transport_lineage": {},
	"timestamp": "ISO-8601"
}
```

**Provenance Guarantees**
- Deterministic provenance
- Continuity-safe transport lineage
- Unified provenance model

---
