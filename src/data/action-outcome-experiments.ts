import { experimentHref } from './experiment-routes.mjs';

export interface ExperimentMetric {
  label: string;
  value: string;
}

export interface ActionOutcomeExperiment {
  id: string;
  date: string;
  stage: 'Research complete' | 'Runtime validation';
  title: string;
  result: string;
  question: string;
  whyItMatters: string;
  limitation: string;
  href: string;
  evidenceHref: string;
  metrics: ExperimentMetric[];
}

// Curated, public experiment claims live here so landing pages do not drift.
export const actionOutcomeExperiments: ActionOutcomeExperiment[] = [
  {
    id: '013',
    date: '2026-06-23',
    stage: 'Research complete',
    title: 'Context-gated action recall',
    result: 'Context gating avoided every risky repeat in the fixture',
    question: 'Can a robot reuse a prior recovery without repeating an action that only worked under a different physical context?',
    whyItMatters: 'The result moved the problem from incident search to evidence-backed action reuse.',
    limitation: 'Five synthetic Physical AI incident families; not a production safety guarantee.',
    href: experimentHref('013'),
    evidenceHref: '/research/results/physical_ai_action_outcome_013/',
    metrics: [
      { label: 'Recovery Top-1', value: '1.00' },
      { label: 'Risky-repeat avoidance', value: '1.00' },
      { label: 'Hazardous Top-1', value: '0.00' },
    ],
  },
  {
    id: '014',
    date: '2026-06-23',
    stage: 'Research complete',
    title: 'Native SQL replay',
    result: 'The action-outcome result survived native SQL materialization',
    question: 'Can the fixture be replayed through live ZeptoDB tables, joins, windows, and spatial checks?',
    whyItMatters: 'Robot state, sensor evidence, recommendations, suppressions, and outcomes became one inspectable SQL path.',
    limitation: 'Research tables and replay harness; no new promoted product surface.',
    href: experimentHref('014'),
    evidenceHref: '/research/results/physical_ai_action_outcome_sql_replay_014/',
    metrics: [
      { label: 'Tables', value: '9' },
      { label: 'Research rows', value: '227' },
      { label: 'Expected recoveries', value: '5/5' },
    ],
  },
  {
    id: '016',
    date: '2026-06-23',
    stage: 'Research complete',
    title: 'Edge-to-fleet feed replay',
    result: '52/52 feed events converged through outage and restart cases',
    question: 'Can immediate edge decisions remain local while fleet evidence converges later?',
    whyItMatters: 'The replay preserved bounded transfer, duplicate handling, late delivery, and restart recovery.',
    limitation: 'Deterministic research worker; not a general replication service.',
    href: experimentHref('016'),
    evidenceHref: '/research/results/physical_ai_edge_fleet_feed_replay_016/',
    metrics: [
      { label: 'Acknowledged', value: '52/52' },
      { label: 'Duplicate attempts', value: '1' },
      { label: 'Late attempts', value: '2' },
    ],
  },
  {
    id: '021',
    date: '2026-07-04',
    stage: 'Research complete',
    title: 'Shadow supervisor A/B',
    result: '15/15 hazardous proposals were suppressed in shadow replay',
    question: 'Can a shadow supervisor suppress hazardous baseline proposals and remain idempotent after restart?',
    whyItMatters: 'The experiment connected historical outcomes to explicit allow, suppress, and manual-review decisions.',
    limitation: 'Research-only shadow fixture; no autonomous actuation.',
    href: experimentHref('021'),
    evidenceHref: '/research/results/physical_ai_shadow_supervisor_ab_021/',
    metrics: [
      { label: 'Hazardous suppressed', value: '15/15' },
      { label: 'Safe allowed', value: '5/5' },
      { label: 'Restart skips', value: '20/20' },
    ],
  },
  {
    id: '022',
    date: '2026-07-09',
    stage: 'Runtime validation',
    title: 'Supervisor node replacement',
    result: 'A replacement owner fenced stale work and converged all rows',
    question: 'Can the experimental supervisor survive an expired-lease handoff without duplicate or lost decisions?',
    whyItMatters: 'The bounded runtime recovered ownership and completed the remaining proposal stream exactly once.',
    limitation: 'The SQL lease is a pilot guard, not a consensus or leader-election system.',
    href: experimentHref('022'),
    evidenceHref: '/research/results/physical_ai_supervisor_node_replacement_022/',
    metrics: [
      { label: 'Proposals converged', value: '3/3' },
      { label: 'Final owner epoch', value: '2' },
      { label: 'Stale-owner work', value: '0' },
    ],
  },
  {
    id: '023',
    date: '2026-07-09',
    stage: 'Runtime validation',
    title: 'Commit-ledger stress',
    result: '12/12 proposals converged after injected projection faults',
    question: 'Can fresh runtime objects repair committed state without duplicating decision or evidence rows?',
    whyItMatters: 'The commit ledger held as an effectively-once boundary for the bounded supervisor sink.',
    limitation: 'Supervisor-specific contract; not a generic multi-table SQL transaction.',
    href: experimentHref('023'),
    evidenceHref: '/research/results/physical_ai_supervisor_commit_ledger_stress_023/',
    metrics: [
      { label: 'Proposals converged', value: '12/12' },
      { label: 'Faults repaired', value: '3/3' },
      { label: 'Duplicate ids', value: '0' },
    ],
  },
];

export function selectExperiments(ids?: string[]) {
  if (!ids) return actionOutcomeExperiments;
  const byId = new Map(actionOutcomeExperiments.map((experiment) => [experiment.id, experiment]));
  return ids.flatMap((id) => {
    const experiment = byId.get(id);
    return experiment ? [experiment] : [];
  });
}
