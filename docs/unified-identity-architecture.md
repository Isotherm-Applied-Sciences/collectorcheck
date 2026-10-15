# Isotherm Unified Identity Architecture — Overview

---

## Purpose

This document provides a unified overview of the Isotherm identity architecture, describing how the Identity Substrate, CollectorCheck, HydroPass, and Databus interoperate to form a deterministic, continuity-safe, provenance-aligned identity ecosystem.

---

## Scope

- Identity Substrate
- CollectorCheck Gateway API
- HydroPass Exposure & Credential API
- Databus Transport API
- Cross-product identity flow
- Unified lineage and continuity model
- Deterministic authenticity signals

---

## Architectural Layers

### 1. Identity Substrate (Foundational Layer)

Defines the deterministic grammar for identity, continuity, provenance, lineage, and authenticity. All identity objects, continuity records, provenance records, lineage objects, and authenticity signals originate here.

### 2. Product APIs (Interface Layer)

- **CollectorCheck** — Verification, continuity, provenance, identity intake, activity intake
- **HydroPass** — Identity exposure, credential issuance, credential validation, identity lineage
- **Databus** — Identity transport, metadata retrieval, lineage propagation, provenance inspection

### 3. Product Surfaces (Application Layer)

Each product uses the substrate and APIs to provide deterministic identity services:

- CollectorCheck: artifact verification
- HydroPass: identity credentialing
- Databus: identity transport

---

## Cross-Product Identity Flow

Identity moves deterministically across products:

1. **Identity Creation** — Originates in the Identity Substrate.
2. **Verification (CollectorCheck)** — Produces continuity and provenance records.
3. **Credentialing (HydroPass)** — Issues deterministic identity credentials.
4. **Transport (Databus)** — Moves identity, continuity, and provenance across systems.
5. **Unified Lineage** — Aggregates identity, credential, verification, and transport lineage.

---

## Deterministic Guarantees

- Same input → same output
- No probabilistic behavior
- No retroactive mutation
- Continuity-safe propagation
- Provenance-safe lineage
- Canonical object determinism

---

## Identity Lifecycle (Deterministic)

Identity moves through a deterministic lifecycle across the Isotherm ecosystem.

### Lifecycle Stages
1. **Identity Creation** — Originates in the Identity Substrate.
2. **Verification (CollectorCheck)** — Produces continuity and provenance records.
3. **Credentialing (HydroPass)** — Issues deterministic identity credentials.
4. **Transport (Databus)** — Moves identity, continuity, and provenance across systems.
5. **Unified Lineage Aggregation** — Consolidates identity, credential, verification, and transport lineage.

---

## Continuity Lifecycle

Continuity describes the evolution of identity across time, context, and systems.

### Continuity Flow
```text
Identity → Verification → Continuity Record → Credentialing → Transport → Lineage
```

### Continuity Guarantees
- Deterministic ordering
- Immutable continuity records
- Continuity-safe propagation

---

## Provenance Lifecycle

Provenance describes origin, ownership, and transitions.

### Provenance Flow
```text
Origin → Verification → Provenance Record → Transport → Provenance Lineage
```

### Provenance Guarantees
- Deterministic origin
- Immutable provenance history
- Provenance-safe lineage propagation

---

## Lineage Lifecycle

Lineage aggregates identity, credential, verification, and transport history.

### Lineage Flow
```text
Identity Lineage
Credential Lineage
Verification Lineage
Transport Lineage
→ Unified Lineage Object
```

### Lineage Guarantees
- Deterministic lineage propagation
- Unified lineage model
- Immutable lineage history

---

## Authenticity Signal Flow

Authenticity signals describe deterministic indicators of identity validity.

### Authenticity Flow
```text
Continuity → Provenance → Lineage → Credential → Verification → Transport
→ Authenticity Signal
```

### Authenticity Guarantees
- Deterministic authenticity
- No heuristic scoring
- Immutable authenticity history

---

## Cross-Product Identity Diagram (ASCII)

```text
		  +---------------------------+
		  |   Identity Substrate      |
		  |  (Deterministic Grammar)  |
		  +-------------+-------------+
						|
						v
		+---------------+----------------+
		| CollectorCheck (Verification)  |
		+---------------+----------------+
						|
						v
		+---------------+----------------+
		| HydroPass (Credentialing)      |
		+---------------+----------------+
						|
						v
		+---------------+----------------+
		| Databus (Transport)            |
		+---------------+----------------+
						|
						v
		  +-------------+-------------+
		  | Unified Lineage Model     |
		  +---------------------------+
```

---

## Substrate → API → Product Mapping Table

| Substrate Object | CollectorCheck | HydroPass | Databus |
|------------------|----------------|-----------|---------|
| Identity Object | Verification Intake | Credential Identity | Transport Identity |
| Continuity Object | Continuity Records | Credential Continuity | Transport Continuity |
| Provenance Object | Provenance Records | Credential Provenance | Transport Provenance |
| Lineage Object | Verification Lineage | Credential Lineage | Transport Lineage |
| Authenticity Signal | Verification Authenticity | Credential Authenticity | Transport Authenticity |

---
