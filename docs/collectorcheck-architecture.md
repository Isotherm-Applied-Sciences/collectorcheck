# CollectorCheck Product Architecture — Artifact Verification System

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
