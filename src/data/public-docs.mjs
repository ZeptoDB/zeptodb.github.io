// Explicit source-document approvals. New Markdown stays unpublished until it is
// classified here or, for experiment specs/results, in experiment-routes.mjs.
export const publicDocSources = new Set([
  'kiro_usage.md',

  'api/api_reference.md',
  'api/config_reference.md',
  'api/cpp_reference.md',
  'api/flight_reference.md',
  'api/http_reference.md',
  'api/python_reference.md',
  'api/security_operations_guide.md',
  'api/sql_reference.md',
  'api/sso_integration_guide.md',

  'deployment/bare_metal_tuning.md',
  'deployment/branch_release_policy.md',
  'deployment/cloud_performance_tuning.md',
  'deployment/docker.md',
  'deployment/eks_cluster_requirements.md',
  'deployment/multi_node_cluster.md',
  'deployment/parquet_s3_activation.md',
  'deployment/production_deployment.md',
  'deployment/readme.md',
  'deployment/release_process.md',

  'getting-started/binary_install.md',
  'getting-started/example_datasets.md',
  'getting-started/interactive_playground.md',
  'getting-started/quick_start.md',
  'getting-started/build.md',
  'getting-started/installation.md',

  'operations/cold_tier_s3.md',
  'operations/k8s_test_report.md',
  'operations/kubernetes_failure_scenarios.md',
  'operations/kubernetes_operations.md',
  'operations/physical_ai_edge_fleet_controlled_pilot.md',
  'operations/production_operations.md',
  'operations/rolling_upgrade.md',
  'operations/ros2_edge_deployment.md',
  'operations/ros2_setup.md',
  'operations/telegraf_output.md',

  'research/action_outcome_episode_schema.md',
  'research/experiment_governance.md',
]);

export const internalDocSources = new Set([
  'backlog.md',
  'completed.md',
  'research/action_outcome_industry_research_scan_2026.md',
  'research/action_outcome_memory_engine_plan.md',
  'research/action_outcome_research_execution_roadmap.md',
  'research/action_outcome_research_process_log.md',
  'research/aiops_time_series_memory_research_data.md',
  'research/aiops_timeseries_industry_scan_2026.md',
  'research/physical_ai_edge_fleet_production_readiness_plan.md',
  // Experiments 031-035 are complete research evidence, but they have not
  // passed the public claim, raw-artifact-link, and editorial route review.
  // Keep the complete evidence chain private until that review is explicit.
  'research/physical_ai_vla_risk_router_experiment_031.md',
  'research/results/physical_ai_vla_risk_router_031.md',
  'research/physical_ai_vla_calibration_failure_attribution_experiment_032.md',
  'research/results/physical_ai_vla_calibration_failure_attribution_032.md',
  'research/physical_ai_vla_veto_separability_experiment_033.md',
  'research/results/physical_ai_vla_veto_separability_033.md',
  'research/results/physical_ai_vla_veto_separability_033_attempt1_invalidated.md',
  'research/physical_ai_vla_task_mapping_correction_experiment_034.md',
  'research/results/physical_ai_vla_veto_separability_034.md',
  'research/results/physical_ai_vla_failure_root_cause_synthesis_032_034.md',
  'research/physical_ai_vla_trajectory_window_preflight_experiment_035.md',
  'research/results/physical_ai_vla_trajectory_window_preflight_035.md',
  'research/time_series_agent_memory_edge.md',
]);

export function canonicalSourcePath(rel) {
  return rel
    .replaceAll('\\', '/')
    .toLowerCase()
    .replace(/(?:\.ko|_ko)\.md$/, '.md');
}
