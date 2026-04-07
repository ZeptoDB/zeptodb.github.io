---
title: "ZeptoDB vs ClickHouse"
template: splash
prev: false
next: false
description: "Compare ZeptoDB and ClickHouse — microsecond vs millisecond latency for time-series workloads"
---

## Overview

ClickHouse excels at analytical queries over large datasets. ZeptoDB is purpose-built for real-time time-series where microsecond latency and temporal operations (ASOF JOIN, EMA) are critical.

---

## Feature Comparison

| | **ZeptoDB** | **ClickHouse** |
|---|---|---|
| **Primary Use** | Real-time time-series | OLAP analytics |
| **Query Latency** | **272μs** (1M rows) | ~5ms |
| **Ingestion** | **5.52M events/sec** | ~100K events/sec |
| **Storage Model** | In-memory + Parquet HDB | Disk-based columnar (MergeTree) |
| **ASOF JOIN** | ✓ (native) | ✗ |
| **Window JOIN** | ✓ | ✗ |
| **EMA / VWAP** | ✓ (built-in) | UDF required |
| **xbar (time bucketing)** | ✓ | `toStartOfInterval()` |
| **Python Zero-Copy** | **522ns** | — (requires serialization) |
| **JIT Compilation** | LLVM JIT | Partial |
| **SIMD** | Highway (AVX2/512, NEON) | SSE4.2/AVX2 |
| **Real-Time Ingestion** | Lock-free ring buffer | Async inserts + merge |
| **Feed Handlers** | FIX, ITCH, Binance, Kafka | Kafka (via connector) |
| **Clustering** | Multi-node auto-sharding | ReplicatedMergeTree + ZooKeeper |
| **License** | Apache 2.0 | Apache 2.0 |

---

## When to Choose ZeptoDB

- Sub-millisecond query latency is a requirement
- You need ASOF JOIN, Window JOIN, or temporal analytics
- Real-time streaming ingestion (millions of events/sec)
- Python zero-copy for ML/quant workflows
- Financial market data or high-frequency sensor data

## When ClickHouse May Be Better

- Large-scale batch analytics (billions of rows, seconds-acceptable latency)
- Complex OLAP queries with many JOINs on dimension tables
- Existing ClickHouse ecosystem and tooling investment
- Data warehouse use cases where disk-based storage is preferred

---

## Performance Comparison

| Workload | ZeptoDB | ClickHouse |
|----------|---------|------------|
| Point query (1M rows) | 272μs | ~5ms |
| Aggregation (1M rows) | 185μs | ~3ms |
| ASOF JOIN | 410μs | N/A |
| Ingestion (single stream) | 5.52M/sec | ~100K/sec |
| Python result access | 522ns | ~1ms (serialization) |

Get started with the [Quick Start Guide](/getting-started/quick_start/).
