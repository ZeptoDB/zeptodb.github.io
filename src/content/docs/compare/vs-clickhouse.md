---
title: "ZeptoDB vs ClickHouse"
template: splash
prev: false
next: false
description: "Compare ZeptoDB and ClickHouse by architecture, temporal SQL, storage, and operational fit."
---

## Scope

This page is an architecture and workload-fit comparison, not a head-to-head benchmark. ClickHouse and ZeptoDB can both run SQL over time-oriented data, but they optimize for different operating shapes. Validate either system with your own schema, retention policy, concurrency, hardware, and durability settings.

**Last verified:** 2026-07-18

**Version scope:** ZeptoDB means the exact source SHA recorded by the current build in [`docs-sync.json`](/docs-sync.json). ClickHouse means the continuously updated official documentation accessed on the date above, not an asserted server patch release; confirm every feature against the release you will deploy.

---

## Architecture and workflow

| Decision area | **ZeptoDB** | **ClickHouse** |
|---|---|---|
| **Design center** | Hot, ordered time-series processing plus Action-Outcome/Agent Memory | General-purpose column-oriented analytics and data warehousing |
| **Query interface** | SQL with time-series operators | SQL with a broad analytical function and integration ecosystem |
| **Temporal join** | Native ASOF JOIN and Window JOIN | Native ASOF JOIN, with documented key and join-algorithm constraints |
| **Ingestion pattern** | Continuous ingestion into an in-memory hot path | Batch or asynchronous inserts into persistent columnar tables |
| **Storage approach** | In-memory hot data with Parquet historical paths | MergeTree-family persistent columnar storage |
| **Agent workflow** | Timeline evidence, retrieval/cache, and replay are part of ZeptoDB's product surface | Not evaluated in this comparison; verify the selected product and application stack |

The important correction to older versions of this page is that **ClickHouse does support ASOF JOIN**. Syntax, ordering requirements, algorithms, and workload behavior differ, so compatibility should be tested rather than inferred from the shared name.

## Choose by workload

ZeptoDB is worth evaluating when the same operational timeline must serve live time-series SQL and replayable agent context, or when native Window JOIN and the in-process Python path matter to the design.

ClickHouse is worth evaluating when the primary requirement is large-scale analytical storage, a mature OLAP ecosystem, broad integrations, or managed analytical infrastructure.

The systems can also be complementary: keep a bounded live working set in ZeptoDB and move broader analytical history into an OLAP store when that matches the retention and query plan.

## Verification notes

- ZeptoDB numbers on the [Benchmarks](/benchmarks/) page are ZeptoDB project measurements unless a section explicitly names a shared harness.
- Do not compare a ZeptoDB microbenchmark with a ClickHouse number from different hardware, data, durability, or concurrency settings.
- Re-run representative point, aggregation, temporal-join, ingest, recovery, and retention tests before selecting an architecture.

## Primary sources

- [ZeptoDB SQL reference](/api/sql_reference/)
- [ZeptoDB benchmark scope and results](/benchmarks/)
- [ClickHouse JOIN reference, including ASOF JOIN](https://clickhouse.com/docs/sql-reference/statements/select/join)
- [ClickHouse MergeTree reference](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree)
- [ClickHouse asynchronous inserts](https://clickhouse.com/docs/optimize/asynchronous-inserts)

Get started with the [Quick Start Guide](/getting-started/quick_start/).
