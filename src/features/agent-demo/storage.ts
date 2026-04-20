import seedCasesRaw from './cases.demo.json'
import type { BizType, RiskLevel, RunSession, TaskLogLine, TestCase } from './types'

const CASES_KEY = 'agent.demo.cases.v1'
const RUNS_KEY = 'agent.demo.runs.v1'
const RUN_LOGS_KEY = 'agent.demo.run.logs.v1'

const BIZ_TYPES: BizType[] = ['customer_service', 'sales', 'coding', 'data_analysis']
const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high']

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeCase(item: unknown): TestCase | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  const raw = item as Partial<TestCase>
  if (typeof raw.id !== 'string' || !raw.id.trim()) {
    return null
  }

  if (typeof raw.prompt !== 'string' || !raw.prompt.trim()) {
    return null
  }

  if (typeof raw.expected !== 'string' || !raw.expected.trim()) {
    return null
  }

  const bizType = BIZ_TYPES.includes(raw.bizType as BizType) ? (raw.bizType as BizType) : 'customer_service'
  const riskLevel = RISK_LEVELS.includes(raw.riskLevel as RiskLevel) ? (raw.riskLevel as RiskLevel) : 'medium'

  return {
    id: raw.id.trim(),
    bizType,
    scenario: typeof raw.scenario === 'string' && raw.scenario.trim() ? raw.scenario.trim() : 'general',
    riskLevel,
    prompt: raw.prompt.trim(),
    expected: raw.expected.trim(),
    hardRules: Array.isArray(raw.hardRules) ? raw.hardRules.filter((it): it is string => typeof it === 'string' && !!it.trim()) : [],
    rubric: Array.isArray(raw.rubric)
      ? raw.rubric
          .filter((it): it is { name: string; weight: number } => {
            return !!it && typeof it === 'object' && typeof it.name === 'string' && typeof it.weight === 'number'
          })
          .map((it) => ({ name: it.name.trim(), weight: it.weight }))
      : [],
    tags: Array.isArray(raw.tags) ? raw.tags.filter((it): it is string => typeof it === 'string' && !!it.trim()) : [],
    regressionPreset: raw.regressionPreset === 'candidate_regress' ? 'candidate_regress' : undefined,
  }
}

function normalizeCases(items: unknown[]): TestCase[] {
  const seen = new Set<string>()
  const result: TestCase[] = []

  for (const item of items) {
    const normalized = normalizeCase(item)
    if (!normalized || seen.has(normalized.id)) {
      continue
    }

    seen.add(normalized.id)
    result.push(normalized)
  }

  return result
}

const SEED_CASES = normalizeCases(seedCasesRaw as unknown[])

function writeCases(cases: TestCase[]) {
  localStorage.setItem(CASES_KEY, JSON.stringify(cases))
}

function writeRuns(runs: RunSession[]) {
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs))
}

export function ensureCasesSeeded(): TestCase[] {
  const existing = localStorage.getItem(CASES_KEY)
  if (!existing) {
    writeCases(SEED_CASES)
    return SEED_CASES
  }

  return listCases()
}

export function listCases(): TestCase[] {
  const raw = safeParse<unknown[]>(localStorage.getItem(CASES_KEY), [])
  const normalized = normalizeCases(raw)
  if (normalized.length === 0 && raw.length > 0) {
    writeCases(normalized)
  }
  return normalized
}

export function listCaseMap(): Map<string, TestCase> {
  return new Map(listCases().map((item) => [item.id, item]))
}

export function createCase(payload: Omit<TestCase, 'id'> & { id?: string }): TestCase {
  const cases = listCases()
  const generatedId = payload.id?.trim() || `case_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`

  const newCase: TestCase = {
    ...payload,
    id: generatedId,
  }

  const normalized = normalizeCase(newCase)
  if (!normalized) {
    throw new Error('用例格式不合法')
  }

  if (cases.some((item) => item.id === normalized.id)) {
    throw new Error('用例 ID 已存在')
  }

  cases.unshift(normalized)
  writeCases(cases)
  return normalized
}

export function updateCase(payload: TestCase): TestCase {
  const normalized = normalizeCase(payload)
  if (!normalized) {
    throw new Error('用例格式不合法')
  }

  const cases = listCases()
  const index = cases.findIndex((item) => item.id === normalized.id)
  if (index < 0) {
    throw new Error('用例不存在')
  }

  cases[index] = normalized
  writeCases(cases)
  return normalized
}

export function deleteCases(ids: string[]): number {
  if (ids.length === 0) {
    return 0
  }

  const idSet = new Set(ids)
  const cases = listCases()
  const next = cases.filter((item) => !idSet.has(item.id))
  const deleted = cases.length - next.length
  writeCases(next)
  return deleted
}

export function importCases(content: string, mode: 'replace' | 'merge') {
  const parsed = safeParse<unknown[]>(content, [])
  if (!Array.isArray(parsed)) {
    throw new Error('导入文件必须是 JSON 数组')
  }

  const normalized = normalizeCases(parsed)
  if (normalized.length === 0) {
    throw new Error('导入内容为空或结构不合法')
  }

  if (mode === 'replace') {
    writeCases(normalized)
    return { total: normalized.length, added: normalized.length, updated: 0, skipped: 0 }
  }

  const existing = listCases()
  const byId = new Map(existing.map((item) => [item.id, item]))
  let added = 0
  let updated = 0

  for (const item of normalized) {
    if (byId.has(item.id)) {
      updated += 1
    } else {
      added += 1
    }
    byId.set(item.id, item)
  }

  const merged = Array.from(byId.values())
  writeCases(merged)
  return {
    total: normalized.length,
    added,
    updated,
    skipped: normalized.length - added - updated,
  }
}

export function exportCases(ids?: string[]): string {
  const all = listCases()
  const target = !ids || ids.length === 0 ? all : all.filter((item) => ids.includes(item.id))
  return JSON.stringify(target, null, 2)
}

export function listRunSessions(): RunSession[] {
  const raw = safeParse<RunSession[]>(localStorage.getItem(RUNS_KEY), [])
  return raw.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export function saveRunSession(session: RunSession) {
  const runs = listRunSessions()
  const index = runs.findIndex((it) => it.runId === session.runId)
  if (index >= 0) {
    runs[index] = session
  } else {
    runs.unshift(session)
  }
  writeRuns(runs)
}

export function getRunById(runId: string): RunSession | null {
  return listRunSessions().find((item) => item.runId === runId) ?? null
}

export function clearRuns() {
  writeRuns([])
}

export function listRunLogs(limit = 500): TaskLogLine[] {
  const raw = safeParse<TaskLogLine[]>(localStorage.getItem(RUN_LOGS_KEY), [])
  const ordered = raw.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  return ordered.slice(0, Math.max(1, limit))
}

export function appendRunLogs(lines: TaskLogLine[]) {
  if (lines.length === 0) {
    return
  }
  const existing = safeParse<TaskLogLine[]>(localStorage.getItem(RUN_LOGS_KEY), [])
  const merged = [...lines, ...existing].slice(0, 2000)
  localStorage.setItem(RUN_LOGS_KEY, JSON.stringify(merged))
}

export function clearRunLogs() {
  localStorage.setItem(RUN_LOGS_KEY, JSON.stringify([]))
}

export function bizTypeLabel(value: BizType): string {
  switch (value) {
    case 'customer_service':
      return '客服'
    case 'sales':
      return '销售'
    case 'coding':
      return '代码'
    case 'data_analysis':
      return '数据分析'
    default:
      return value
  }
}

export function riskLabel(value: RiskLevel): string {
  switch (value) {
    case 'high':
      return '高'
    case 'medium':
      return '中'
    case 'low':
      return '低'
    default:
      return value
  }
}
