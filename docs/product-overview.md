# Isotherm Applied Sciences — Product Overview

This document provides a high-level overview of the three core products in the Isotherm Applied Sciences ecosystem: **CollectorCheck**, **HydroPass**, and **Databus**. Each product is designed to support continuity, provenance, and trust across real-world verification flows.

---

## CollectorCheck

CollectorCheck is a deterministic verification gateway for collectors, gig workers, and individuals who need to validate identity, activity, and provenance with clear, reproducible flows.

### Purpose
CollectorCheck strengthens trust-traffic by providing a stable, inspectable verification surface that organizations can rely on. It reduces ambiguity, prevents fraud, and supports continuity across ecosystems.

### Problem Statement
Modern verification flows are fragmented, inconsistent, and often opaque. Gig workers, collectors, and individuals who rely on portable identity frequently encounter:
- inconsistent verification requirements
- unverifiable claims
- unclear provenance
- trust gaps between platforms
- repeated identity exposure

CollectorCheck addresses these issues by providing a deterministic, continuity-first verification gateway that produces stable, reproducible outcomes.

### Design Philosophy
CollectorCheck is built on three core principles:
- **Determinism** — verification flows must produce the same result given the same inputs.
- **Continuity** — identity and activity records must remain stable over time.
- **Provenance** — every verification must have a clear lineage.

These principles ensure that CollectorCheck can serve as a trust anchor across ecosystems.

### Verification Flow
CollectorCheck implements a structured verification pipeline:
1. **Identity Intake** — capture and validate identity attributes.
2. **Activity Intake** — record the relevant activity or artifact.
3. **Provenance Linking** — attach lineage metadata to the activity.
4. **Continuity Record Creation** — generate a stable, inspectable record.
5. **Gateway Output** — produce a deterministic verification result.

This pipeline ensures that verification is not only accurate but reproducible.

### Continuity Model
CollectorCheck’s continuity model ensures that identity and activity records:
- remain stable across time
- can be revalidated deterministically
- support long-term trust-traffic
- avoid unnecessary re-exposure of identity attributes

Continuity is a first-class design constraint, not an afterthought.

### Provenance Model
Provenance is captured through:
- artifact lineage
- identity lineage
- activity lineage
- verification lineage

Each lineage type contributes to a unified provenance record that can be inspected and validated.

### Gateway API Overview
CollectorCheck exposes a deterministic API surface that includes:
- **POST /identity** — submit identity attributes
- **POST /activity** — submit activity or artifact metadata
- **POST /verify** — run the verification pipeline
- **GET /record/{id}** — retrieve continuity records
- **GET /provenance/{id}** — retrieve provenance lineage

The API is designed for clarity, reproducibility, and long-term stability.

### Trust-Traffic Alignment
CollectorCheck improves trust-traffic by:
- reducing verification ambiguity
- providing stable identity continuity
- enabling cross-platform provenance validation
- supporting gig workers and collectors with portable verification

### Core Concepts
- **Deterministic verification** — predictable, reproducible identity and activity validation.
- **Continuity-first design** — verification flows that remain stable over time.
- **Provenance tracking** — clear lineage of identity, activity, and artifacts.
- **Gig-worker alignment** — supports individuals who rely on portable verification.

### Components
- **Identity validation**
- **Activity verification**
- **Provenance ledger**
- **Continuity record**
- **Gateway API**

### Why It Matters
CollectorCheck provides a trust foundation for ecosystems that depend on reliable verification. It is the anchor product for the broader Isotherm identity substrate.

---

## HydroPass (Preview)

HydroPass is a dignity-first identity credential focused on continuity and respect. It enables individuals to carry trusted identity across contexts without overexposure.

---

## Databus (Preview)

Databus is a universal identity substrate for secure provenance across ecosystems. It supports continuity, trust, and deterministic verification flows.

---
