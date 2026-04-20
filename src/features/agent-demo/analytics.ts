import type { RegressionDiff, RegressionSummary, RunSession, ScoreBucketItem, TrendPoint } from './types'

export function calcPassRate(passed: number, total: number): number {
  if (total <= 0) {
    return 0
  }
  return Number(((passed / total) * 100).toFixed(1))
}

export function calcAvgScore(scores: number[]): number {
  if (scores.length === 0) {
    return 0
  }
  const total = scores.reduce((acc, item) => acc + item, 0)
  return Number((total / scores.length).toFixed(1))
}

export function summarizeRun(run: RunSession | null) {
  if (!run) {
    return { total: 0, passRate: 0, avgScore: 0, failCount: 0 }
  }

  const passed = run.results.filter((item) => item.passed).length
  const failCount = run.results.length - passed

  return {
    total: run.results.length,
    passRate: calcPassRate(passed, run.results.length),
    avgScore: calcAvgScore(run.results.map((item) => item.score)),
    failCount,
  }
}

export function scoreDistribution(run: RunSession | null): ScoreBucketItem[] {
  const buckets: ScoreBucketItem[] = [
    { label: '0-59', count: 0 },
    { label: '60-79', count: 0 },
    { label: '80-89', count: 0 },
    { label: '90-100', count: 0 },
  ]

  if (!run) {
    return buckets
  }

  for (const item of run.results) {
    if (item.score < 60) {
      buckets[0].count += 1
    } else if (item.score < 80) {
      buckets[1].count += 1
    } else if (item.score < 90) {
      buckets[2].count += 1
    } else {
      buckets[3].count += 1
    }
  }

  return buckets
}

function severityByDelta(delta: number): 'low' | 'medium' | 'high' {
  const abs = Math.abs(delta)
  if (abs >= 15) {
    return 'high'
  }
  if (abs >= 8) {
    return 'medium'
  }
  return 'low'
}

export function compareRuns(baselineRun: RunSession | null, candidateRun: RunSession | null) {
  const emptySummary: RegressionSummary = {
    total: 0,
    regressed: 0,
    improved: 0,
    unchanged: 0,
    baselinePassRate: 0,
    candidatePassRate: 0,
    passRateDelta: 0,
  }

  if (!baselineRun || !candidateRun) {
    return { summary: emptySummary, diffs: [] as RegressionDiff[] }
  }

  const baselineMap = new Map(baselineRun.results.map((item) => [item.caseId, item]))
  const candidateMap = new Map(candidateRun.results.map((item) => [item.caseId, item]))
  const caseIds = Array.from(new Set([...baselineMap.keys(), ...candidateMap.keys()]))

  const diffs: RegressionDiff[] = []
  let regressed = 0
  let improved = 0
  let unchanged = 0

  for (const caseId of caseIds) {
    const baseline = baselineMap.get(caseId)
    const candidate = candidateMap.get(caseId)
    if (!baseline || !candidate) {
      continue
    }

    const delta = Number((candidate.score - baseline.score).toFixed(1))
    const regressedItem = delta < 0 && baseline.passed && !candidate.passed

    if (delta < -0.5) {
      regressed += 1
    } else if (delta > 0.5) {
      improved += 1
    } else {
      unchanged += 1
    }

    diffs.push({
      caseId,
      bizType: baseline.bizType,
      baselineScore: baseline.score,
      candidateScore: candidate.score,
      delta,
      regressed: regressedItem,
      severity: severityByDelta(delta),
      baselinePassed: baseline.passed,
      candidatePassed: candidate.passed,
      baselineReason: baseline.reason,
      candidateReason: candidate.reason,
    })
  }

  const baselinePassed = baselineRun.results.filter((item) => item.passed).length
  const candidatePassed = candidateRun.results.filter((item) => item.passed).length

  const baselinePassRate = calcPassRate(baselinePassed, baselineRun.results.length)
  const candidatePassRate = calcPassRate(candidatePassed, candidateRun.results.length)

  const summary: RegressionSummary = {
    total: diffs.length,
    regressed,
    improved,
    unchanged,
    baselinePassRate,
    candidatePassRate,
    passRateDelta: Number((candidatePassRate - baselinePassRate).toFixed(1)),
  }

  diffs.sort((a, b) => a.delta - b.delta)

  return { summary, diffs }
}

export function buildTrend(runs: RunSession[], limit = 8): TrendPoint[] {
  const grouped = new Map<string, { passRates: number[]; avgScores: number[] }>()

  for (const run of runs) {
    if (run.results.length === 0) {
      continue
    }
    const day = run.startedAt.slice(0, 10)
    const avgScore = calcAvgScore(run.results.map((item) => item.score))
    const passRate = calcPassRate(run.results.filter((item) => item.passed).length, run.results.length)
    if (!grouped.has(day)) {
      grouped.set(day, { passRates: [], avgScores: [] })
    }
    grouped.get(day)?.avgScores.push(avgScore)
    grouped.get(day)?.passRates.push(passRate)
  }

  const points = Array.from(grouped.entries())
    .map(([date, metrics]) => ({
      date,
      passRate: calcAvgScore(metrics.passRates),
      avgScore: calcAvgScore(metrics.avgScores),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return points.slice(-limit)
}

export function latestRunByType(runs: RunSession[], runType: RunSession['runType']): RunSession | null {
  return runs.find((item) => item.runType === runType) ?? null
}
