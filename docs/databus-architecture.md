# Databus Product Architecture — Deterministic Identity Transport System

---

## Purpose

This document defines the product-level architecture for Databus, Isotherm’s deterministic identity transport system. It describes how Databus moves identity, continuity, provenance, lineage, authenticity, and credentials across Isotherm systems.

---

## Scope

- Deterministic identity transport
- Continuity and provenance transport
- Credential transport
- Lineage and authenticity propagation
- Integration with Identity Substrate
- Integration with CollectorCheck and HydroPass
- Product-level invariants and failure domains

---

## Architectural Role in Isotherm

Databus is the deterministic transport layer of the Isotherm ecosystem:

- Moves identity between systems
- Moves continuity and provenance records
- Moves credentials issued by HydroPass
- Propagates lineage and authenticity signals
- Ensures deterministic, invariant-safe transport semantics
- Serves as the backbone connecting CollectorCheck, HydroPass, and external systems

---

## Core Components

- Identity Transport Engine
- Continuity Transport Engine
- Provenance Transport Engine
- Credential Transport Engine
- Lineage & Authenticity Propagator
- Identity Substrate Adapter
- Databus Transport API Adapter

---

## High-Level Transport Flow

1. Identity, continuity, provenance, or credentials are submitted for transport.
2. Identity Substrate Adapter normalizes transport payloads.
3. Transport Engines move payloads deterministically across systems.
4. Lineage & Authenticity Propagator updates identity lineage.
5. Receiving systems ingest transported payloads deterministically.

---
