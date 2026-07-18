---
title: "ZeptoDB vs kdb+"
template: splash
prev: false
next: false
description: "Compare ZeptoDB and kdb+ by query language, temporal operations, storage workflow, and application fit."
---

## Scope

kdb+ and ZeptoDB both address ordered time-series workloads and expose concepts such as as-of joins, window joins, and time bucketing. They are not drop-in replacements: query semantics, types, storage layout, deployment, operations, and surrounding ecosystems differ.

This page is an architecture and migration-orientation guide, not a head-to-head benchmark or pricing comparison.

**Last verified:** 2026-07-18

**Version scope:** ZeptoDB means the exact source SHA recorded by the current build in [`docs-sync.json`](/docs-sync.json). kdb+ means the continuously updated KX q reference accessed on the date above, not an asserted runtime patch release; confirm semantics against the version you will deploy.

---

## Architecture and workflow

| Decision area | **ZeptoDB** | **kdb+** |
|---|---|---|
| **Primary query language** | SQL | q |
| **As-of join** | `ASOF JOIN` in ZeptoDB SQL | `aj`, `aj0`, `ajf`, and `ajf0` variants in q |
| **Window join** | `WINDOW JOIN` in ZeptoDB SQL | `wj` and `wj1` in q |
| **Time bucketing** | `xbar(...)` in ZeptoDB SQL | `xbar` in q |
| **Historical workflow** | In-memory hot data with Parquet historical paths | kdb+ database layouts and q-based historical workflows |
| **Application integration** | C++ APIs and an in-process Python path | q APIs, IPC, and KX ecosystem integrations |
| **Agent workflow** | Timeline evidence, retrieval/cache, and replay are part of ZeptoDB's product surface | Not evaluated in this comparison; verify the selected product and application stack |

## Choose by workload

ZeptoDB is worth evaluating when SQL is the preferred interface, the application needs ZeptoDB's Python/C++ paths, or agent context and operational events should share one replayable timeline.

kdb+ is worth evaluating when the organization has established q applications, operational expertise, vendor relationships, or KX ecosystem dependencies.

## Migration orientation

The following mappings are conceptual starting points, not guaranteed syntactic or semantic equivalence:

| kdb+/q concept | ZeptoDB concept |
|---|---|
| `aj[...]` | `ASOF JOIN` |
| `xbar[...]` | `xbar(...)` |
| `ema[...]` | `ema(...)` |
| `mavg[...]` | `mavg(...)` |
| `wj[...]` | `WINDOW JOIN` |

For every port, test sort order, equality keys, timestamp direction, boundary inclusion, null handling, late data, duplicate timestamps, and window aggregation semantics. Re-run performance tests on the same hardware and data after correctness matches.

## Primary sources

- [ZeptoDB SQL reference](/api/sql_reference/)
- [ZeptoDB Python reference](/api/python_reference/)
- [KX q reference: as-of join](https://code.kx.com/q/ref/aj/)
- [KX q reference: window join](https://code.kx.com/q/ref/wj/)
- [KX q reference: xbar](https://code.kx.com/q/ref/xbar/)
- [KX q reference: ema](https://code.kx.com/q/ref/ema/)
- [KX q reference: avg and mavg](https://code.kx.com/q/ref/avg/)

Get started with the [Quick Start Guide](/getting-started/quick_start/).
