export interface UserStatsDto {
  testsCompleted: number;
  testsAvailable: number;
  bestTestScorePct: number | null;
  configsGenerated: number;
  configsSaved: number;
  simulationsRan: number;
  lastActivityAt: string | null;
}
