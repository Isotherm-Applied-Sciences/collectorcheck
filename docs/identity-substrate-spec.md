# Isotherm Identity Substrate — Deterministic Specification

---

## Document Index

- [Purpose](#purpose)
- [Scope](#scope)
- [Substrate Invariants](#substrate-invariants)
- [Canonical Object Model](#canonical-object-model)
- [Continuity Foundations](#continuity-foundations)
- [Provenance Foundations](#provenance-foundations)
- [Deterministic Identity Grammar](#deterministic-identity-grammar)
- [Continuity Timelines](#continuity-timelines)
- [Provenance Semantics](#provenance-semantics)
- [Unified Lineage Model](#unified-lineage-model)
- [Substrate-Level Authenticity Signals](#substrate-level-authenticity-signals)
- [Repository Integration Notes](#repository-integration-notes)

---

## Document Version

- **Version:** 1.0
- **Maintainer:** Isotherm Applied Sciences
- **Last Updated:** October 2026
- **Branch:** v2

---

## Repository Integration Notes

- This specification defines the deterministic identity substrate used by CollectorCheck, HydroPass, and Databus.
- It provides the canonical grammar for identity, continuity, provenance, lineage, and authenticity across the ecosystem.
- Future versions will include multi-hop lineage propagation, extended authenticity signals, and substrate-level transport semantics.

---

## Purpose

The Identity Substrate defines the deterministic grammar for identity, continuity, provenance, and lineage across the Isotherm ecosystem. It provides the sealed, reproducible foundation that CollectorCheck, HydroPass, and Databus operate on.

---

## Scope

- Deterministic identity grammar
- Continuity timelines
- Provenance records
- Unified lineage model
- Canonical object architecture
- Deterministic authenticity signals
- Deterministic metadata normalization

---

## Substrate Invariants

- Same input → same output
- No probabilistic behavior
- No hidden heuristics
- No retroactive mutation
- Continuity-safe propagation
- Provenance-safe lineage
- Canonical object determinism

---

## Canonical Object Model

The substrate defines canonical objects for:

- Identity Objects
- Continuity Objects
- Provenance Objects
- Lineage Objects
- Transport Objects
- Verification Objects
- Credential Objects
- Exposure Objects

Each canonical object is sealed, deterministic, and reproducible.

---

## Continuity Foundations

Continuity describes the evolution of identity across time, context, and systems. Continuity records must be:

- deterministic
- immutable
- reproducible
- lineage-safe

---

## Provenance Foundations

Provenance describes origin, ownership, and transitions. Provenance records must be:

- deterministic
- continuity-safe
- transport-safe
- lineage-aligned

---

## Deterministic Identity Grammar

The identity substrate defines a deterministic grammar for representing identity across systems.

### Grammar Rules
- Identity must be represented using canonical fields
- No probabilistic inference
- No heuristic-based mutation
- All identity transformations must be deterministic

### Canonical Identity Fields
```json
{
	"identity_id": "string",
	"attributes": {},
	"metadata": {},
	"created_at": "ISO-8601",
	"updated_at": "ISO-8601"
}
```

---

## Continuity Timelines

Continuity describes the evolution of identity across time, context, and systems.

### Continuity Timeline Structure
```json
{
	"continuity_record_id": "string",
	"identity_id": "string",
	"event_type": "created | updated | transported | verified | credentialed | exposed",
	"timestamp": "ISO-8601",
	"metadata": {}
}
```

### Continuity Rules
- Continuity records must be immutable
- No retroactive mutation
- Deterministic ordering
- Continuity-safe propagation across systems

---

## Provenance Semantics

Provenance describes origin, ownership, and transitions.

### Provenance Record Structure
```json
{
	"provenance_record_id": "string",
	"identity_id": "string",
	"origin": "collectorcheck | hydropass | databus | external",
	"lineage": {},
	"timestamp": "ISO-8601",
	"metadata": {}
}
```

### Provenance Rules
- Deterministic provenance
- No probabilistic origin inference
- Provenance-safe lineage propagation
- Immutable provenance history

---

## Unified Lineage Model

The unified lineage model defines how identity, credential, verification, and transport lineage propagate across systems.

### Lineage Object Structure
```json
{
	"lineage_id": "string",
	"identity_lineage": {},
	"credential_lineage": {},
	"verification_lineage": {},
	"transport_lineage": {},
	"timestamp": "ISO-8601"
}
```

### Lineage Rules
- Deterministic lineage propagation
- Unified lineage model across all products
- Continuity-safe lineage transitions
- Immutable lineage history

---

## Substrate-Level Authenticity Signals

Authenticity signals describe deterministic indicators of identity validity.

### Authenticity Signal Structure
```json
{
	"signal_id": "string",
	"identity_id": "string",
	"signal_type": "continuity | provenance | lineage | transport | verification | credential",
	"value": {},
	"timestamp": "ISO-8601"
}
```

### Authenticity Rules
- Deterministic authenticity
- No heuristic scoring
- Immutable authenticity history

---
