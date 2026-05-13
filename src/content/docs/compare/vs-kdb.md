---
title: "ZeptoDB vs kdb+"
template: splash
prev: false
next: false
description: "Compare ZeptoDB and kdb+ — same microsecond performance, standard SQL, zero license cost"
---

## Overview

kdb+ is the historical benchmark for microsecond time-series — and has been the de-facto choice on trading desks for two decades. The same workloads are now showing up outside capital markets: Physical AI, autonomous systems, industrial control, and grid operations all need the same temporal primitives at the same latency.

ZeptoDB targets that broader envelope. Comparable microsecond performance to kdb+, but on standard SQL, with a zero-copy path into Python, and a license model that doesn't gate adoption.

---

## Feature Comparison

| | **ZeptoDB** | **kdb+** |
|---|---|---|
| **Latency** | μs (272μs / 1M rows) | μs |
| **Ingestion** | 5.52M events/sec | ~5M events/sec |
| **Query Language** | Standard SQL | q (proprietary) |
| **ASOF JOIN** | ✓ | ✓ |
| **Window JOIN** | ✓ | ✓ |
| **xbar / time bucketing** | ✓ | ✓ |
| **EMA / VWAP** | ✓ | ✓ |
| **Python Integration** | 522ns zero-copy | IPC (~ms latency) |
| **C++ API** | Native | C binding |
| **SQL** | Full standard SQL | ✗ (q lang only) |
| **JIT Compilation** | LLVM JIT | Interpreter |
| **SIMD** | Highway (AVX2/512, NEON) | Limited |
| **Historical DB** | Parquet on S3 | Splayed tables on disk |
| **Clustering** | Multi-node with auto-sharding | Manual |
| **Security** | TLS 1.3, RBAC, JWT, audit | Basic |
| **License** | **Open Source (Apache 2.0)** | **$100K+/year** |

---

## When to Choose ZeptoDB

- You want kdb+-class performance without the license cost
- Your team knows SQL, not q
- You need Python zero-copy for quant research
- You want modern security (RBAC, JWT/OIDC, audit logging)
- You need Parquet/S3 for cost-effective historical storage

## When kdb+ May Still Fit

- Deep existing investment in q codebases
- Vendor support contract is a hard requirement
- Specific kdb+ ecosystem tools (KX Dashboards, etc.)

---

## Migration

ZeptoDB supports the same temporal operations as kdb+ with SQL syntax:

| kdb+ | ZeptoDB |
|------|---------|
| `aj[\`sym\`time; trades; quotes]` | `trades ASOF JOIN quotes ON sym, ts` |
| `xbar[0D00:01; time]` | `xbar(1m, ts)` |
| `ema[20; price]` | `ema(price, 20)` |
| `mavg[50; price]` | `mavg(price, 50)` |
| `wj[w; \`sym\`time; trades; (quotes; (max;bid); (min;ask))]` | `trades WINDOW JOIN quotes ...` |

Get started with the [Quick Start Guide](/getting-started/quick_start/).
