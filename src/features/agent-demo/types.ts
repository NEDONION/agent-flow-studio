export type BizType = 'customer_service' | 'sales' | 'coding' | 'data_analysis'

export type RiskLevel = 'low' | 'medium' | 'high'

export type RegressionPreset = 'candidate_regress'

export interface RubricItem {
  name: string
  weight: number
}

export interface TestCase {
  id: string
  bizType: BizType
  scenario: string
  riskLevel: RiskLevel
  prompt: string
  expected: string
  hardRules: string[]
  rubric: RubricItem[]
  tags: string[]
  regressionPreset?: RegressionPreset
}

export type RunMode = 'live' | 'replay'

export type RunType = 'baseline' | 'candidate'

export type RunStatus = 'running' | 'done' | 'canceled' | 'failed'

export interface RunResult {
  runId: string
  caseId: string
  bizType: BizType
  score: number
  passed: boolean
  reason: string
  latencyMs: number
  output: string
  createdAt: string
}

export interface RunProgress {
  total: number
  done: number
  success: number
  failed: number
  canceled: number
}

export interface RunLogLine {
  runId: string
  caseId?: string
  level: 'info' | 'warn' | 'error'
  message: string
  timestamp: string
}

export interface TaskLogLine extends RunLogLine {
  taskId: string
  mode: RunMode
  runType: RunType
}

export interface RunSession {
  runId: string
  name: string
  runType: RunType
  mode: RunMode
  status: RunStatus
  startedAt: string
  endedAt?: string
  progress: RunProgress
  results: RunResult[]
}

export type RunTaskStatus = 'queued' | 'running' | 'done' | 'canceled' | 'failed'

export interface RunTask {
  taskId: string
  runId?: string
  name: string
  mode: RunMode
  runType: RunType
  status: RunTaskStatus
  createdAt: string
  startedAt?: string
  endedAt?: string
  progress: RunProgress
  results: RunResult[]
  logs: TaskLogLine[]
  errorMessage?: string
}

export interface RunTaskSnapshot {
  tasks: RunTask[]
  globalLogs: TaskLogLine[]
}

export interface RegressionDiff {
  caseId: string
  bizType: BizType
  baselineScore: number
  candidateScore: number
  delta: number
  regressed: boolean
  severity: RiskLevel
  baselinePassed: boolean
  candidatePassed: boolean
  baselineReason: string
  candidateReason: string
}

export interface RegressionSummary {
  total: number
  regressed: number
  improved: number
  unchanged: number
  baselinePassRate: number
  candidatePassRate: number
  passRateDelta: number
}

export interface ScoreBucketItem {
  label: '0-59' | '60-79' | '80-89' | '90-100'
  count: number
}

export interface TrendPoint {
  date: string
  passRate: number
  avgScore: number
}
