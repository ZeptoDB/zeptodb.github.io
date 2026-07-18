export const experimentRoutes = [
  ['001', 'action_outcome_replay_experiment_001.md', '001-action-outcome-replay'],
  ['002', 'action_outcome_guardrail_experiment_002.md', '002-retrieval-guardrails'],
  ['003', 'action_outcome_ablation_experiment_003.md', '003-signal-ablation'],
  ['004', 'action_outcome_noisy_distractor_experiment_004.md', '004-noisy-distractor'],
  ['005', 'action_outcome_context_gate_experiment_005.md', '005-context-gate'],
  ['006', 'action_outcome_sql_backed_replay_experiment_006.md', '006-sql-backed-replay'],
  ['007', 'action_outcome_live_sql_replay_experiment_007.md', '007-live-sql-replay'],
  ['008', 'action_outcome_distributed_live_sql_replay_experiment_008.md', '008-distributed-live-sql-replay'],
  ['009', 'action_outcome_join_window_replay_experiment_009.md', '009-join-window-replay'],
  ['010-baseline', 'action_outcome_vendor_baseline_experiment_010.md', '010-vendor-baseline'],
  ['010-replay', 'action_outcome_vendor_sql_replay_experiment_010.md', '010-vendor-sql-replay'],
  ['011', 'action_outcome_distributed_vendor_sql_replay_experiment_011.md', '011-distributed-vendor-sql-replay'],
  ['012', 'action_outcome_operational_placement_experiment_012.md', '012-operational-placement'],
  ['013', 'physical_ai_action_outcome_experiment_013.md', '013-context-gated-action-recall'],
  ['014', 'physical_ai_action_outcome_sql_replay_experiment_014.md', '014-native-sql-replay'],
  ['015', 'physical_ai_edge_fleet_replay_experiment_015.md', '015-edge-fleet-replay'],
  ['016', 'physical_ai_edge_fleet_feed_replay_experiment_016.md', '016-edge-fleet-feed-replay'],
  ['017', 'physical_ai_edge_fleet_runtime_connector_experiment_017.md', '017-runtime-connector'],
  ['018', 'physical_ai_edge_fleet_cpp_connector_replay_experiment_018.md', '018-cpp-connector-replay'],
  ['019', 'physical_ai_edge_fleet_lifecycle_experiment_019.md', '019-server-lifecycle'],
  ['020', 'physical_ai_edge_fleet_worker_experiment_020.md', '020-edge-fleet-worker-runtime'],
  ['021', 'physical_ai_shadow_supervisor_ab_experiment_021.md', '021-shadow-supervisor-ab'],
  ['022', 'physical_ai_supervisor_node_replacement_experiment_022.md', '022-supervisor-node-replacement'],
  ['023', 'physical_ai_supervisor_commit_ledger_stress_experiment_023.md', '023-commit-ledger-stress'],
].map(([key, sourceFile, slug]) => ({
  key,
  sourceFile,
  slug,
  href: `/experiments/${slug}/`,
  legacyHref: `/research/${sourceFile.replace(/\.md$/, '')}/`,
}));

const routesByKey = new Map(experimentRoutes.map((route) => [route.key, route]));
const routesBySource = new Map(experimentRoutes.map((route) => [route.sourceFile, route]));

export function experimentHref(key) {
  const route = routesByKey.get(key);
  if (!route) throw new Error(`Unknown experiment route: ${key}`);
  return route.href;
}

export function experimentRouteForSource(sourceFile) {
  return routesBySource.get(sourceFile);
}

export const experimentRedirects = Object.fromEntries([
  ['/research/action-outcome-evidence/', '/experiments/'],
  ...experimentRoutes.map((route) => [route.legacyHref, route.href]),
]);
