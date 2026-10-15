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
