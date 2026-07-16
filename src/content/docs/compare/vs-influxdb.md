---
title: "ZeptoDB vs InfluxDB"
template: splash
prev: false
next: false
description: "Compare ZeptoDB and InfluxDB — microsecond time-series, SQL, and Agent Memory vs metrics-first storage"
---

## Overview

InfluxDB is a popular time-series database for monitoring and IoT. ZeptoDB targets a different envelope — workloads where microsecond latency, ASOF JOIN, high-throughput ingestion, and agent-ready operational memory are non-negotiable.

---

## Feature Comparison

| | **ZeptoDB** | **InfluxDB** |
|---|---|---|
| **Query Latency** | **272μs** (1M rows) | ~15ms |
| **Ingestion** | **5.52M events/sec** | ~50K events/sec |
| **Query Language** | Standard SQL | InfluxQL / Flux |
| **ASOF JOIN** | ✓ | ✗ |
| **Window Functions** | ✓ (full SQL window) | Limited |
| **EMA / VWAP** | ✓ (built-in) | Flux function |
| **Python Zero-Copy** | **522ns** | Client library (ms) |
| **Agent Memory** | Native memory + exact/semantic cache layer | Separate stack required |
| **Storage** | In-memory + Parquet HDB | TSM engine (disk) |
| **Cardinality** | No limit (symbol-partitioned) | High cardinality issues |
| **JIT Compilation** | LLVM JIT | ✗ |
| **Feed Handlers** | FIX, ITCH, Binance, Kafka | Telegraf plugins |
| **Clustering** | Multi-node auto-sharding | Cloud/proprietary options vary by deployment |
| **License** | BUSL-1.1 with Additional Use Grant | MIT (OSS) / proprietary cloud options |

---

## When to Choose ZeptoDB

- Microsecond query latency required
- Financial, industrial, or robotics time-series with ASOF JOIN needs
- High-throughput ingestion (millions of events/sec)
- Standard SQL preferred over InfluxQL / Flux
- Python zero-copy for ML pipelines and feature stores
- Agent Memory for operational agents over metrics, incidents, and telemetry
- High-cardinality data (fleets, devices, meters — no cardinality penalty)

## When InfluxDB May Be Better

- Infrastructure monitoring with Telegraf ecosystem
- Simple metrics collection where ms latency is acceptable
- Existing InfluxDB/Grafana stack investment
- InfluxDB Cloud managed service preference

---

Get started with the [Quick Start Guide](/getting-started/quick_start/).
