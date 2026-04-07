---
title: "ZeptoDB vs InfluxDB"
template: splash
prev: false
next: false
description: "Compare ZeptoDB and InfluxDB — microsecond latency and SQL vs InfluxQL"
---

## Overview

InfluxDB is a popular time-series database for monitoring and IoT. ZeptoDB targets workloads where microsecond latency, ASOF JOIN, and high-throughput ingestion are non-negotiable.

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
| **Storage** | In-memory + Parquet HDB | TSM engine (disk) |
| **Cardinality** | No limit (symbol-partitioned) | High cardinality issues |
| **JIT Compilation** | LLVM JIT | ✗ |
| **Feed Handlers** | FIX, ITCH, Binance, Kafka | Telegraf plugins |
| **Clustering** | Multi-node auto-sharding | Enterprise only (paid) |
| **License** | Apache 2.0 | MIT (OSS) / Proprietary (Cloud) |

---

## When to Choose ZeptoDB

- Microsecond query latency required
- Financial or industrial time-series with ASOF JOIN needs
- High-throughput ingestion (millions of events/sec)
- Standard SQL preferred over InfluxQL/Flux
- Python zero-copy for ML pipelines
- High-cardinality data (many unique series)

## When InfluxDB May Be Better

- Infrastructure monitoring with Telegraf ecosystem
- Simple metrics collection where ms latency is acceptable
- Existing InfluxDB/Grafana stack investment
- InfluxDB Cloud managed service preference

---

Get started with the [Quick Start Guide](/getting-started/quick_start/).
