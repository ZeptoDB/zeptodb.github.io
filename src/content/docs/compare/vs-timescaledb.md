---
title: "ZeptoDB vs TimescaleDB"
template: splash
prev: false
next: false
description: "Compare ZeptoDB and TimescaleDB — microsecond time-series and Agent Memory vs PostgreSQL extension"
---

## Overview

TimescaleDB extends PostgreSQL with time-series capabilities. ZeptoDB is a purpose-built in-memory time-series engine delivering lower latency for real-time workloads, with an Agent Memory layer for context retrieval, prompt cache, and AgentOps telemetry.

---

## Feature Comparison

| | **ZeptoDB** | **TimescaleDB** |
|---|---|---|
| **Architecture** | Purpose-built in-memory engine | PostgreSQL extension |
| **Query Latency** | **272μs** (1M rows) | ~10ms |
| **Ingestion** | **5.52M events/sec** | ~50K events/sec |
| **Query Language** | Standard SQL | PostgreSQL SQL |
| **ASOF JOIN** | ✓ (native, optimized) | ✗ (requires LATERAL JOIN workaround) |
| **Window Functions** | ✓ + EMA, VWAP built-in | PostgreSQL window functions |
| **xbar (time bucketing)** | ✓ | `time_bucket()` |
| **Python Zero-Copy** | **522ns** | psycopg2 (~ms) |
| **Agent Memory** | Native memory + exact/semantic cache layer | Separate stack required |
| **JIT Compilation** | LLVM JIT | PostgreSQL JIT (limited) |
| **SIMD** | Highway (AVX2/512, NEON) | ✗ |
| **Continuous Aggregates** | Window functions | ✓ (materialized) |
| **Compression** | Parquet (columnar) | Row-level compression |
| **Ecosystem** | Growing | Full PostgreSQL ecosystem |
| **License** | BUSL-1.1, free Community | Apache 2.0 (Community) / Proprietary (Cloud) |

---

## When to Choose ZeptoDB

- Sub-millisecond latency is a hard requirement
- ASOF JOIN for sensor, robot, or tick-by-tick alignment
- Millions of events/sec ingestion throughput
- Python zero-copy for ML feature stores and analytics pipelines
- Agent Memory for operational agents that need timeline evidence and durable context
- Multi-vertical footprint (Physical AI, industrial, automotive, energy, markets) where PostgreSQL would be a mismatch

## When TimescaleDB May Be Better

- Existing PostgreSQL infrastructure and expertise
- Need for full PostgreSQL ecosystem (PostGIS, extensions, etc.)
- Continuous aggregates for pre-computed rollups
- Managed cloud service preference (Timescale Cloud)
- Workloads where 10ms latency is acceptable

---

Get started with the [Quick Start Guide](/getting-started/quick_start/).
