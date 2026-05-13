---
title: "Benchmarks"
template: splash
prev: false
next: false
description: "ZeptoDB performance benchmarks — ingestion, query latency, and Python zero-copy across sensor, robotics, and market-data workloads"
---

Reproducible benchmarks on commodity hardware. The same engine, the same numbers — whether the input is tick data, PMU streams, factory sensors, or vehicle telemetry. All numbers measured on a single node unless noted.

---

## Hardware

| Component | Spec |
|-----------|------|
| CPU | AMD EPYC 9654 (96 cores) / Intel Xeon Platinum 8488C |
| RAM | 256 GB DDR5-4800 ECC |
| Storage | NVMe Gen4 (for WAL & Parquet HDB) |
| OS | Amazon Linux 2023, kernel 6.1 |
| Compiler | Clang 19, `-O3 -march=native` |

---

## Ingestion Throughput

| Scenario | Events/sec | Latency (p99) |
|----------|-----------|---------------|
| Single stream (tick / sensor) | **5.52M** | 181ns |
| Multi-symbol (1,000 streams) | **4.8M** | 210ns |
| Kafka consumer (batch 10K) | **3.2M** | 850μs batch |
| FIX 4.4 market data | **1.1M** | 420ns parse+ingest |

Lock-free MPMC ring buffer with Highway SIMD batch copy. Zero allocation on hot path. The ingestion path does not care whether a row came from an exchange, a PMU, a robot, or a vehicle bus.

---

## Query Latency

All queries on 1M-row in-memory table, single thread. Table names (`trades`, `quotes`, `sensors`) are illustrative — the engine treats them identically.

| Query | Latency |
|-------|---------|
| `SELECT * FROM trades WHERE sym='AAPL' AND ts > now()-1h` | **272μs** |
| `SELECT avg(price), max(volume) FROM trades GROUP BY sym` | **185μs** |
| `SELECT * FROM trades ASOF JOIN quotes USING(sym, ts)` | **410μs** |
| `SELECT sensor_id, ema(vibration, 100) FROM sensors` | **320μs** |
| `SELECT xbar(1m, ts) AS bucket, avg(reading) FROM sensors GROUP BY bucket` | **290μs** |
| Window JOIN (±500ms, sensor fusion) | **580μs** |

LLVM JIT compilation. Vectorized execution with SIMD aggregation.

---

## Python Zero-Copy

| Operation | Latency |
|-----------|---------|
| `conn.query("SELECT * FROM trades")` → NumPy array | **522ns** |
| DataFrame view (1M rows × 5 cols) | **1.2μs** |
| PyTorch tensor from query result | **890ns** |

Direct memory-mapped view. No serialization, no copy, no Arrow conversion.

---

## Comparison

| | **ZeptoDB** | **kdb+** | **ClickHouse** | **TimescaleDB** | **InfluxDB** |
|---|---|---|---|---|---|
| Ingestion (events/sec) | **5.52M** | ~5M | 100K | 50K | 50K |
| Point query latency | **272μs** | ~300μs | ~5ms | ~10ms | ~15ms |
| ASOF JOIN | ✓ | ✓ | ✗ | ✗ | ✗ |
| SQL | Standard | q lang | ✓ | ✓ | InfluxQL |
| Python zero-copy | **522ns** | IPC (~ms) | — | — | — |
| License cost | **Free (OSS)** | $100K+/yr | Free | Free | Free |

---

## EKS Multi-Node (3× r7i.2xlarge)

Distributed benchmarks on EKS with 3 data nodes + 1 load generator, single AZ placement. Representative of fleet-scale telemetry, multi-venue tick capture, or multi-line sensor ingestion.

| Scenario | Target | Notes |
|----------|--------|-------|
| Distributed ingestion (3 nodes) | **>12M events/sec** | Linear scale from 4M/node |
| Per-node ingestion | **>4M events/sec** | Lock-free MPMC + consistent hash routing |
| Scatter-gather query (Tier A, single-node routing) | **<1ms overhead** | Direct routing via partition map |
| Scatter-gather query (Tier B, 3-node fan-out) | **<5ms total** | Fan-out <1ms + merge <1ms |
| Distributed ASOF JOIN | Sub-ms overhead | Cross-node timestamp alignment |
| Failover recovery | **<15s** | HealthMonitor dead_timeout=10s + pod restart |
| Linear scalability (1→2→3 nodes) | Near-linear | GROUP BY throughput scales with node count |

Cluster: EKS `zepto-bench` (ap-northeast-2), K8s v1.35, Helm chart deployment.
Cost: ~$12/run (2 hours) or ~$1.17/run with sleep/wake automation.

---

## amd64 vs arm64 (Graviton)

Tested on EKS with 6× amd64 (r7i/m7i/c7i) + 5× arm64 (m7g, Karpenter). All K8s tests passed 38/38 on both architectures.

### Ingestion Throughput

| Metric | amd64 | arm64 | Winner |
|--------|------:|------:|--------|
| Single-thread (batch=1) | 4.39M/s | 4.49M/s | arm64 +2% |
| Single-thread (batch=64) | 4.85M/s | 4.48M/s | amd64 +8% |
| Concurrent (1 thread) | 1.73M/s | 2.46M/s | **arm64 +42%** |
| Concurrent (4 threads) | 1.88M/s | 2.20M/s | **arm64 +17%** |
| E2E query throughput | 983.7M rows/s | 1608.1M rows/s | **arm64 +63%** |
| E2E query latency | 10,166μs | 6,218μs | **arm64 −39%** |

### SIMD Performance (Highway)

| Operation (1M rows) | amd64 (AVX2) | arm64 (NEON) | Winner |
|---------------------|-------------:|-------------:|--------|
| sum_i64 | 264μs | 241μs | arm64 |
| filter_gt_i64 | 1,387μs | 4,847μs | **amd64 3.5×** |
| vwap | 530μs | 466μs | arm64 |

amd64 (AVX2) has a significant advantage on filter/scan operations (BitMask). sum/vwap are comparable.

### SQL Performance

| Query | amd64 | arm64 | Winner |
|-------|------:|------:|--------|
| ASOF JOIN (parse) | 10.37μs | 7.41μs | **arm64 −29%** |
| VWAP (execute) | 161.93μs | 382.45μs | **amd64 2.4×** |
| Filter price (execute) | 2,873μs | 5,820μs | **amd64 2.0×** |

SQL parsing is faster on arm64 (branch prediction). SQL execution is 2–2.4× faster on amd64 (SIMD vectorized scan).

### Recommendation

| Workload | Best Architecture | Why |
|----------|-------------------|-----|
| Ingestion-heavy | **arm64 (Graviton)** | +17–42% concurrent throughput, ~20% cheaper |
| Query-heavy with filters | **amd64** | AVX2 SIMD 2–4× advantage on scan/filter |
| Mixed workloads | **arm64** | Better cost-performance; NEON gap closing with SVE2 |

---

## RDMA / AWS EFA

UCX transport on AWS EFA (Elastic Fabric Adapter) for kernel-bypass networking.

| Transport | 64B Write Latency | 4KB Bulk Write | Ingestion (3 nodes) |
|-----------|-------------------|----------------|---------------------|
| TCP RPC | ~60μs | ~3 GB/s | ~12M events/sec |
| **UCX/EFA RDMA** | **~2–5μs** | **~20 GB/s** | **~20–25M events/sec** |

Cost: ~$2.25/run (4× m7a.4xlarge Spot, 2 hours). See [EKS Cluster Requirements](/deployment/eks_cluster_requirements/) for setup details.

---

## Reproduce

```bash
git clone https://github.com/zeptodb/zeptodb.git && cd zeptodb
mkdir -p build && cd build
cmake .. -G Ninja -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_C_COMPILER=clang-19 -DCMAKE_CXX_COMPILER=clang++-19
ninja -j$(nproc)

# Ingestion benchmark
./bench/bench_ingestion --symbols 1 --duration 10s

# Query benchmark
./bench/bench_query --rows 1000000 --iterations 100

# Python zero-copy
python3 ../bench/bench_python_zerocopy.py
```

See [benchmark source code](https://github.com/zeptodb/zeptodb/tree/main/bench) for full methodology.
