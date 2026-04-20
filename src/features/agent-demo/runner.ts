import type { RunLogLine, RunMode, RunProgress, RunResult, RunSession, RunType, TestCase } from './types'

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return Math.abs(hash >>> 0)
}

function intInRange(seed: string, min: number, max: number): number {
  const hash = hashString(seed)
  return min + (hash % (max - min + 1))
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function buildBaselineScore(testCase: TestCase): number {
  const base = intInRange(`baseline-${testCase.id}`, 84, 96)
  const riskPenalty = testCase.riskLevel === 'high' ? 2 : testCase.riskLevel === 'medium' ? 1 : 0
  const occasionalDrop = hashString(`drop-${testCase.id}`) % 13 === 0 ? 8 : 0
  return clamp(base - riskPenalty - occasionalDrop, 40, 100)
}

function buildOutput(testCase: TestCase, runType: RunType, passed: boolean): string {
  const needsJson = testCase.prompt.toLowerCase().includes('json') || testCase.expected.toLowerCase().includes('json')

  if (needsJson) {
    if (!passed && runType === 'candidate') {
      return '{"summary":"字段缺失示例"}'
    }
    return JSON.stringify(
      {
        summary: `${testCase.scenario} response`,
        nextAction: 'follow_up',
        confidence: passed ? 'high' : 'low',
      },
      null,
      2,
    )
  }

  if (passed) {
    return `已满足核心要求：${testCase.expected.slice(0, 48)}...`
  }

  return `未满足关键约束，需关注：${testCase.hardRules.slice(0, 2).join(' / ') || '输出质量波动'}`
}

function buildReplayResult(runId: string, testCase: TestCase, runType: RunType): RunResult {
  const baselineScore = buildBaselineScore(testCase)
  let score = baselineScore

  if (runType === 'candidate') {
    if (testCase.regressionPreset === 'candidate_regress') {
      score = clamp(baselineScore - intInRange(`reg-${testCase.id}`, 14, 26), 50, 79)
    } else {
      score = clamp(baselineScore + intInRange(`candidate-${testCase.id}`, -3, 4), 45, 100)
    }
  }

  const passed = score >= 80
  const latencyMs = intInRange(`${runType}-${testCase.id}-latency`, 600, 2800)

  let reason = '满足硬规则与评分标准'
  if (!passed) {
    reason = testCase.regressionPreset === 'candidate_regress' && runType === 'candidate' ? '候选版本在关键约束上出现退化' : '输出未满足至少一条硬规则'
  }

  return {
    runId,
    caseId: testCase.id,
    bizType: testCase.bizType,
    score,
    passed,
    reason,
    latencyMs,
    output: buildOutput(testCase, runType, passed),
    createdAt: new Date().toISOString(),
  }
}

function createLog(runId: string, level: RunLogLine['level'], message: string, caseId?: string): RunLogLine {
  return {
    runId,
    caseId,
    level,
    message,
    timestamp: new Date().toISOString(),
  }
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '未知错误'
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // no-op
  }

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    const snippet = cleaned.slice(start, end + 1)
    try {
      const parsed = JSON.parse(snippet) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      return null
    }
  }

  return null
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase()
    if (lower === 'true') {
      return true
    }
    if (lower === 'false') {
      return false
    }
  }
  return null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const n = Number(value)
    if (Number.isFinite(n)) {
      return n
    }
  }
  return null
}

function buildJudgePrompt(testCase: TestCase, output: string): string {
  return [
    '你是测试评审器。请根据用例要求对模型输出打分。',
    '必须返回 JSON，字段为 score(0-100整数), passed(boolean), reason(string)。不要输出其他内容。',
    '',
    `【用例ID】${testCase.id}`,
    `【业务】${testCase.bizType}`,
    `【风险】${testCase.riskLevel}`,
    `【用户输入】${testCase.prompt}`,
    `【期望】${testCase.expected}`,
    `【硬规则】${testCase.hardRules.join('；') || '无'}`,
    `【评分维度】${testCase.rubric.map((it) => `${it.name}:${it.weight}`).join('；') || '默认'}`,
    '',
    '【模型输出开始】',
    output,
    '【模型输出结束】',
    '',
    '评分标准：优先检查硬规则，再看期望匹配度。score>=80 则 passed=true。',
  ].join('\n')
}

function scoreByFallback(output: string, testCase: TestCase): { score: number; passed: boolean; reason: string } {
  if (!output.trim()) {
    return { score: 0, passed: false, reason: '模型输出为空' }
  }

  let score = 72
  const needsJson = testCase.prompt.toLowerCase().includes('json') || testCase.expected.toLowerCase().includes('json')
  if (needsJson) {
    const parsed = extractJsonObject(output)
    score += parsed ? 12 : -18
  }

  if (testCase.hardRules.length > 0) {
    score += 6
  }

  score = clamp(score, 0, 100)
  return {
    score,
    passed: score >= 80,
    reason: '评审结果解析失败，使用降级评分',
  }
}

const LIVE_BASELINE_SYSTEM_PROMPT = [
  '你是 AI Agent 基线版本，目标是稳定、合规、完整地回答。',
  '必须严格遵守用户约束，不得编造信息，不得忽略格式要求。',
  '在信息不足时先澄清。',
].join('\n')

const LIVE_CANDIDATE_SYSTEM_PROMPT = [
  '你是 AI Agent 候选版本，目标是高效、简洁。',
  '优先快速给出可执行答案，同时尽量满足约束。',
  '如有不确定请明确说明。',
].join('\n')

const LIVE_JUDGE_SYSTEM_PROMPT = [
  '你是严格评分器。',
  '你只能输出 JSON，不得输出任何额外文本。',
  'JSON 字段仅允许 score, passed, reason。',
].join('\n')

interface ExecuteRunParams {
  name: string
  runType: RunType
  mode: RunMode
  cases: TestCase[]
  concurrency: number
  isCanceled: () => boolean
  onProgress?: (progress: RunProgress) => void
  onResult?: (result: RunResult) => void
  onLog?: (log: RunLogLine) => void
  executeCase: (input: { runId: string; testCase: TestCase; runType: RunType }) => Promise<RunResult>
}

async function executeRun(params: ExecuteRunParams): Promise<RunSession> {
  const { name, runType, mode, cases, onProgress, onResult, onLog, isCanceled, executeCase } = params
  const runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const startedAt = new Date().toISOString()
  const queue = [...cases]
  const results: RunResult[] = []
  const progress: RunProgress = {
    total: cases.length,
    done: 0,
    success: 0,
    failed: 0,
    canceled: 0,
  }

  onLog?.(createLog(runId, 'info', `任务创建成功，模式=${mode}，类型=${runType}，并发=${params.concurrency}`))

  const worker = async (workerId: number) => {
    while (queue.length > 0) {
      if (isCanceled()) {
        return
      }

      const testCase = queue.shift()
      if (!testCase) {
        return
      }

      onLog?.(createLog(runId, 'info', `Worker-${workerId} 开始执行`, testCase.id))

      try {
        const result = await executeCase({ runId, testCase, runType })

        if (isCanceled()) {
          onLog?.(createLog(runId, 'warn', '任务取消，跳过结果写入', testCase.id))
          return
        }

        results.push(result)
        progress.done += 1
        if (result.passed) {
          progress.success += 1
        } else {
          progress.failed += 1
        }

        onResult?.(result)
        onProgress?.({ ...progress })
        onLog?.(createLog(runId, result.passed ? 'info' : 'warn', `${testCase.id} 完成，score=${result.score}`, testCase.id))
      } catch (error) {
        const reason = normalizeErrorMessage(error)
        const failedResult: RunResult = {
          runId,
          caseId: testCase.id,
          bizType: testCase.bizType,
          score: 0,
          passed: false,
          reason,
          latencyMs: 0,
          output: '',
          createdAt: new Date().toISOString(),
        }

        results.push(failedResult)
        progress.done += 1
        progress.failed += 1

        onResult?.(failedResult)
        onProgress?.({ ...progress })
        onLog?.(createLog(runId, 'error', `${testCase.id} 失败：${reason}`, testCase.id))
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(params.concurrency, 10)) }, (_, index) => worker(index + 1))
  await Promise.all(workers)

  const canceled = isCanceled()
  if (canceled) {
    progress.canceled = progress.total - progress.done
    onProgress?.({ ...progress })
    onLog?.(createLog(runId, 'warn', `运行已取消，剩余 ${progress.canceled} 条未执行`))
  } else {
    onLog?.(createLog(runId, 'info', '运行已完成'))
  }

  return {
    runId,
    name,
    runType,
    mode,
    status: canceled ? 'canceled' : 'done',
    startedAt,
    endedAt: new Date().toISOString(),
    progress,
    results,
  }
}

export interface StartReplayRunParams {
  name: string
  runType: RunType
  cases: TestCase[]
  concurrency: number
  isCanceled: () => boolean
  onProgress?: (progress: RunProgress) => void
  onResult?: (result: RunResult) => void
  onLog?: (log: RunLogLine) => void
}

export async function startReplayRun(params: StartReplayRunParams): Promise<RunSession> {
  return executeRun({
    ...params,
    mode: 'replay',
    executeCase: async ({ runId, testCase, runType }) => {
      const mockLatency = intInRange(`${runType}-${testCase.id}-wait`, 250, 980)
      await delay(mockLatency)
      return buildReplayResult(runId, testCase, runType)
    },
  })
}

export interface StartLiveRunParams {
  name: string
  runType: RunType
  cases: TestCase[]
  concurrency: number
  systemPrompt?: string
  judgeSystemPrompt?: string
  isCanceled: () => boolean
  onProgress?: (progress: RunProgress) => void
  onResult?: (result: RunResult) => void
  onLog?: (log: RunLogLine) => void
}

export async function startLiveRun(params: StartLiveRunParams): Promise<RunSession> {
  const llmApi = (window as unknown as { llm?: { chat?: (message: string, systemPrompt?: string) => Promise<{ reply: string }> } }).llm
  const chat = llmApi?.chat
  if (typeof chat !== 'function') {
    throw new Error('当前环境未注入 llm API，请在 Electron 环境中运行')
  }

  const defaultSystemPrompt = params.runType === 'baseline' ? LIVE_BASELINE_SYSTEM_PROMPT : LIVE_CANDIDATE_SYSTEM_PROMPT
  const runtimeSystemPrompt = params.systemPrompt?.trim() || defaultSystemPrompt
  const judgeSystemPrompt = params.judgeSystemPrompt?.trim() || LIVE_JUDGE_SYSTEM_PROMPT

  return executeRun({
    ...params,
    mode: 'live',
    executeCase: async ({ runId, testCase }) => {
      const startedAt = Date.now()

      const generation = await chat(testCase.prompt, runtimeSystemPrompt)
      const output = generation.reply?.trim() ?? ''

      const judgePrompt = buildJudgePrompt(testCase, output)
      const judgeResponse = await chat(judgePrompt, judgeSystemPrompt)
      const parsed = extractJsonObject(judgeResponse.reply ?? '')

      let score: number
      let passed: boolean
      let reason: string

      if (parsed) {
        const parsedScore = asNumber(parsed.score)
        const parsedPassed = asBoolean(parsed.passed)
        const parsedReason = typeof parsed.reason === 'string' ? parsed.reason.trim() : ''

        if (parsedScore !== null) {
          score = clamp(Math.round(parsedScore), 0, 100)
          passed = parsedPassed ?? score >= 80
          reason = parsedReason || '模型评审完成'
        } else {
          const fallback = scoreByFallback(output, testCase)
          score = fallback.score
          passed = fallback.passed
          reason = fallback.reason
        }
      } else {
        const fallback = scoreByFallback(output, testCase)
        score = fallback.score
        passed = fallback.passed
        reason = fallback.reason
      }

      return {
        runId,
        caseId: testCase.id,
        bizType: testCase.bizType,
        score,
        passed,
        reason,
        latencyMs: Date.now() - startedAt,
        output,
        createdAt: new Date().toISOString(),
      }
    },
  })
}
