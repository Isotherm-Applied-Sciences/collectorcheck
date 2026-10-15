# CollectorCheck Product Architecture — Artifact Verification System

---

## Document Index

- [Purpose](#purpose)
- [Scope](#scope)
- [Architectural Role in Isotherm](#architectural-role-in-isotherm)
- [Core Components](#core-components)
- [High-Level Verification Flow](#high-level-verification-flow)
- [Detailed Verification Flow](#detailed-verification-flow)
- [Component Interaction Diagram](#component-interaction-diagram-ascii)
- [Product-Level Invariants](#product-level-invariants)
- [Product Failure Domains](#product-failure-domains)
- [Integration with Identity Substrate](#integration-with-identity-substrate)
- [Integration with HydroPass and Databus](#integration-with-hydropass-and-databus)
- [Artifact Intake Lifecycle](#artifact-intake-lifecycle)
- [Repository Integration Notes](#repository-integration-notes)

---

## Document Version

- **Version:** 1.0
- **Maintainer:** Isotherm Applied Sciences
- **Last Updated:** October 2026
- **Branch:** v2

---

## Repository Integration Notes

- This product architecture defines the internal behavior of CollectorCheck within the Isotherm ecosystem.
- It integrates directly with the Identity Substrate, Unified Identity Architecture, and CollectorCheck Gateway API.
- Future versions will include extended verification diagrams, multi-artifact verification flows, and cross-system authenticity propagation.

---

## Purpose

This document defines the product-level architecture for CollectorCheck, Isotherm’s deterministic artifact verification system. It describes how CollectorCheck uses the Identity Substrate, Unified Identity Architecture, and CollectorCheck Gateway API to verify artifacts, generate continuity, and record provenance.

---

## Scope

- Artifact verification flows
- Identity and continuity integration
- Provenance intake and recording
- Interaction with the Identity Substrate
- Interaction with the CollectorCheck Gateway API
- Product-level invariants and failure domains

---

## Architectural Role in Isotherm

CollectorCheck is the primary verification surface in the Isotherm ecosystem:

- Accepts artifacts and associated identity/metadata
- Produces continuity records
- Records provenance for verified artifacts
- Feeds lineage and authenticity signals into the substrate

---

## Core Components

- Verification Engine
- Continuity Recorder
- Provenance Recorder
- Identity Substrate Adapter
- CollectorCheck API Adapter
- Artifact Intake Surface (UI/API)

---

## High-Level Verification Flow

1. Artifact and metadata are submitted via UI or API.
2. Identity Substrate Adapter normalizes identity and metadata.
3. Verification Engine evaluates artifact deterministically.
4. Continuity Recorder writes continuity records to the substrate.
5. Provenance Recorder writes provenance records to the substrate.
6. Lineage and authenticity signals are updated for the artifact and identity.

---

## Detailed Verification Flow

CollectorCheck performs deterministic artifact verification using the Identity Substrate and CollectorCheck Gateway API.

### Verification Stages
1. **Artifact Intake**
   - Artifact and metadata submitted via UI or API.
   - Identity Substrate Adapter normalizes identity and metadata.

2. **Deterministic Evaluation**
   - Verification Engine evaluates artifact using deterministic rules.
   - No probabilistic scoring or heuristic inference.

3. **Continuity Recording**
   - Continuity Recorder writes continuity records to the Identity Substrate.
   - Records are immutable and ordered deterministically.

4. **Provenance Recording**
   - Provenance Recorder writes provenance records for the artifact.
   - Origin, ownership, and transitions are recorded deterministically.

5. **Lineage and Authenticity Update**
   - Lineage and authenticity signals are updated for the artifact and associated identity.
   - Signals propagate into the Unified Identity Architecture.

---

## Component Interaction Diagram (ASCII)

```text
		+-----------------------------+
		| Artifact Intake Surface     |
		| (UI / API)                  |
		+--------------+--------------+
					   |
					   v
		+--------------+--------------+
		| Identity Substrate Adapter  |
		+--------------+--------------+
					   |
					   v
		+--------------+--------------+
		| Verification Engine         |
		+--------------+--------------+
					   |
					   v
		+--------------+--------------+
		| Continuity Recorder         |
		+--------------+--------------+
					   |
					   v
		+--------------+--------------+
		| Provenance Recorder         |
		+--------------+--------------+
					   |
					   v
		+--------------+--------------+
		| Lineage & Authenticity      |
		+-----------------------------+
```

---

## Product-Level Invariants

CollectorCheck must satisfy the following invariants:

- Deterministic artifact evaluation.
- Same artifact + same metadata → same verification outcome.
- No probabilistic behavior or heuristic scoring.
- Immutable continuity and provenance records.
- Deterministic lineage and authenticity propagation.

---

## Product Failure Domains

### Intake Failure Domain
- Invalid artifact payload.
- Missing or malformed metadata.
- Identity normalization failure.

### Verification Failure Domain
- Deterministic rule evaluation failure.
- Unsupported artifact type (not yet modeled).
- Invariant violation in verification logic.

### Continuity/Provenance Failure Domain
- Continuity record write failure.
- Provenance record write failure.
- Mismatch between continuity and provenance data.

### Lineage/Authenticity Failure Domain
- Lineage aggregation failure.
- Authenticity signal update failure.
- Inconsistent lineage across systems.

---

## Integration with Identity Substrate

CollectorCheck uses the Identity Substrate to:

- Normalize identity and artifact metadata.
- Write continuity records for verification events.
- Write provenance records for artifact origin and transitions.
- Update lineage and authenticity signals.

All interactions with the substrate are deterministic and invariant-checked.

---

## Integration with HydroPass and Databus

### CollectorCheck → HydroPass
- Verified artifacts and associated identity can be used to issue credentials in HydroPass.
- Continuity and provenance records from CollectorCheck feed into HydroPass credential lineage.

### CollectorCheck → Databus
- Verification events and associated metadata can be transported via Databus.
- Continuity and provenance records are propagated across systems using Databus transport semantics.

---

## Artifact Intake Lifecycle

```text
Artifact Submission
	↓
Identity & Metadata Normalization (Substrate Adapter)
	↓
Deterministic Verification (Verification Engine)
	↓
Continuity Recording (Continuity Recorder)
	↓
Provenance Recording (Provenance Recorder)
	↓
Lineage & Authenticity Update
```

---
