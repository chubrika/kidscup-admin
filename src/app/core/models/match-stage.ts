export const MATCH_STAGES = ['GROUP', 'SEMIFINAL', 'FINAL'] as const;

export type MatchStage = (typeof MATCH_STAGES)[number];

export const DEFAULT_MATCH_STAGE: MatchStage = 'GROUP';

export const MATCH_STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: 'Group Stage',
  SEMIFINAL: 'Semifinal',
  FINAL: 'Final',
};

export const MATCH_STAGE_OPTIONS = MATCH_STAGES.map((value) => ({
  value,
  label: MATCH_STAGE_LABELS[value],
}));

/** Treat missing stage as GROUP for backward compatibility. */
export function resolveMatchStage(stage?: MatchStage | null): MatchStage {
  return stage ?? DEFAULT_MATCH_STAGE;
}

export function isGroupStage(stage?: MatchStage | null): boolean {
  return resolveMatchStage(stage) === 'GROUP';
}
