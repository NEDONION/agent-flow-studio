import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Empty, Modal, Progress, Select, Space, Table, Tag, Typography } from '@douyinfe/semi-ui'
import type { RegressionDiff, RunSession, TestCase } from '../../features/agent-demo'
import {
  bizTypeLabel,
  buildTrend,
  calcAvgScore,
  clearRuns,
  compareRuns,
  ensureCasesSeeded,
  latestRunByType,
  listCaseMap,
  listRunSessions,
  scoreDistribution,
  summarizeRun,
} from '../../features/agent-demo'

function runOptionLabel(run: RunSession): string {
  return `${run.name} | ${run.mode}/${run.runType} | ${run.startedAt.slice(0, 19).replace('T', ' ')}`
}

function severityTagColor(severity: RegressionDiff['severity']) {
  switch (severity) {
    case 'high':
      return 'red'
    case 'medium':
      return 'orange'
    case 'low':
      return 'blue'
    default:
      return 'grey'
  }
}

export function AgentStatsPage() {
  const [runs, setRuns] = useState<RunSession[]>([])
  const [baselineRunId, setBaselineRunId] = useState<string>('')
  const [candidateRunId, setCandidateRunId] = useState<string>('')
  const [detail, setDetail] = useState<RegressionDiff | null>(null)
  const [caseMap, setCaseMap] = useState<Map<string, TestCase>>(new Map())

  const load = () => {
    ensureCasesSeeded()
    const nextRuns = listRunSessions()
    setRuns(nextRuns)
    setCaseMap(listCaseMap())

    const latestBaseline = latestRunByType(nextRuns, 'baseline')
    const latestCandidate = latestRunByType(nextRuns, 'candidate')

    setBaselineRunId((prev) => prev || latestBaseline?.runId || '')
    setCandidateRunId((prev) => prev || latestCandidate?.runId || '')
  }

  useEffect(() => {
    load()
  }, [])

  const baselineRun = useMemo(() => runs.find((item) => item.runId === baselineRunId) ?? null, [runs, baselineRunId])
  const candidateRun = useMemo(() => runs.find((item) => item.runId === candidateRunId) ?? null, [runs, candidateRunId])

  const baselineSummary = summarizeRun(baselineRun)
  const candidateSummary = summarizeRun(candidateRun)

  const compare = useMemo(() => compareRuns(baselineRun, candidateRun), [baselineRun, candidateRun])
  const distribution = useMemo(() => scoreDistribution(candidateRun), [candidateRun])
  const trend = useMemo(() => buildTrend(runs, 10), [runs])

  const baselineResultMap = useMemo(() => new Map((baselineRun?.results ?? []).map((item) => [item.caseId, item])), [baselineRun])
  const candidateResultMap = useMemo(() => new Map((candidateRun?.results ?? []).map((item) => [item.caseId, item])), [candidateRun])

  const failedTop = useMemo(() => {
    return compare.diffs.filter((item) => !item.candidatePassed || item.regressed).slice(0, 20)
  }, [compare.diffs])

  const avgDelta = useMemo(() => {
    if (compare.diffs.length === 0) {
      return 0
    }
    return calcAvgScore(compare.diffs.map((item) => item.delta))
  }, [compare.diffs])

  const diffColumns = [
    { title: '用例 ID', dataIndex: 'caseId', width: 140 },
    {
      title: '业务',
      dataIndex: 'bizType',
      width: 100,
      render: (value: RegressionDiff['bizType']) => <Tag color="blue">{bizTypeLabel(value)}</Tag>,
    },
    { title: 'Baseline', dataIndex: 'baselineScore', width: 100 },
    { title: 'Candidate', dataIndex: 'candidateScore', width: 100 },
    {
      title: 'Delta',
      dataIndex: 'delta',
      width: 90,
      render: (value: number) => (
        <Typography.Text type={value < 0 ? 'danger' : 'success'}>
          {value > 0 ? `+${value}` : value}
        </Typography.Text>
      ),
    },
    {
      title: '严重级别',
      dataIndex: 'severity',
      width: 110,
      render: (value: RegressionDiff['severity']) => <Tag color={severityTagColor(value)}>{value}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'candidatePassed',
      width: 100,
      render: (value: boolean, record: RegressionDiff) => {
        if (record.regressed) {
          return <Tag color="red">退化</Tag>
        }
        return value ? <Tag color="green">通过</Tag> : <Tag color="red">失败</Tag>
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      render: (_: unknown, record: RegressionDiff) => (
        <Button size="small" theme="borderless" onClick={() => setDetail(record)}>
          查看
        </Button>
      ),
    },
  ]

  const baselineOptions = runs.filter((item) => item.runType === 'baseline').map((item) => ({ label: runOptionLabel(item), value: item.runId }))
  const candidateOptions = runs.filter((item) => item.runType === 'candidate').map((item) => ({ label: runOptionLabel(item), value: item.runId }))

  const selectedCase = detail ? caseMap.get(detail.caseId) : null
  const baselineDetail = detail ? baselineResultMap.get(detail.caseId) ?? null : null
  const candidateDetail = detail ? candidateResultMap.get(detail.caseId) ?? null : null

  return (
    <div className="page-block">
      <div className="page-toolbar">
        <Space wrap>
          <Select
            style={{ width: 340 }}
            placeholder="选择 Baseline"
            value={baselineRunId}
            optionList={baselineOptions}
            onChange={(value) => setBaselineRunId((value ?? '') as string)}
          />
          <Select
            style={{ width: 340 }}
            placeholder="选择 Candidate"
            value={candidateRunId}
            optionList={candidateOptions}
            onChange={(value) => setCandidateRunId((value ?? '') as string)}
          />
        </Space>

        <Space>
          <Button onClick={load}>刷新</Button>
          <Button
            type="danger"
            theme="borderless"
            onClick={() => {
              Modal.confirm({
                title: '确认清空运行记录',
                content: '将清空本地所有 run 结果，仅保留用例。',
                onOk: () => {
                  clearRuns()
                  setBaselineRunId('')
                  setCandidateRunId('')
                  load()
                },
              })
            }}
          >
            清空运行记录
          </Button>
        </Space>
      </div>

      <div className="page-grid-3">
        <Card title="通过率对比">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            {candidateSummary.passRate}%
          </Typography.Title>
          <Typography.Text type="tertiary">Baseline {baselineSummary.passRate}% · Delta {compare.summary.passRateDelta}%</Typography.Text>
        </Card>
        <Card title="平均分对比">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            {candidateSummary.avgScore}
          </Typography.Title>
          <Typography.Text type="tertiary">Baseline {baselineSummary.avgScore} · 平均差值 {avgDelta}</Typography.Text>
        </Card>
        <Card title="失败/退化">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            {candidateSummary.failCount} / {compare.summary.regressed}
          </Typography.Title>
          <Typography.Text type="tertiary">失败数 / 退化数</Typography.Text>
        </Card>
      </div>

      <div className="page-grid-2">
        <Card title="Candidate 得分分布">
          {candidateRun ? (
            <Space vertical align="start" spacing="medium" style={{ width: '100%' }}>
              {distribution.map((item) => (
                <div key={item.label} style={{ width: '100%' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Typography.Text>{item.label}</Typography.Text>
                    <Typography.Text type="tertiary">{item.count}</Typography.Text>
                  </Space>
                  <Progress percent={candidateSummary.total === 0 ? 0 : Math.round((item.count / candidateSummary.total) * 100)} showInfo={false} />
                </div>
              ))}
            </Space>
          ) : (
            <Empty description="暂无 Candidate 运行数据" />
          )}
        </Card>

        <Card title="运行趋势（最近 10 天）">
          {trend.length > 0 ? (
            <Table
              pagination={false}
              columns={[
                { title: '日期', dataIndex: 'date', width: 140 },
                { title: '通过率(%)', dataIndex: 'passRate', width: 120 },
                { title: '平均分', dataIndex: 'avgScore', width: 120 },
              ]}
              dataSource={trend.map((item) => ({ ...item, key: item.date }))}
            />
          ) : (
            <Empty description="暂无趋势数据" />
          )}
        </Card>
      </div>

      <Card title={`失败/退化 TopN（${failedTop.length}）`}>
        {failedTop.length === 0 ? <Empty description="当前未发现失败或退化用例" /> : <Table columns={diffColumns} dataSource={failedTop.map((item) => ({ ...item, key: item.caseId }))} pagination={{ pageSize: 8 }} />}
      </Card>

      <Modal title={detail ? `用例详情：${detail.caseId}` : '用例详情'} visible={!!detail} width={900} footer={null} onCancel={() => setDetail(null)}>
        {detail ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <Space>
              <Tag color="blue">{bizTypeLabel(detail.bizType)}</Tag>
              <Tag color={detail.regressed ? 'red' : 'grey'}>{detail.regressed ? '退化' : '非退化'}</Tag>
              <Tag color={severityTagColor(detail.severity)}>{detail.severity}</Tag>
            </Space>

            <Card title="输入与预期">
              <Typography.Paragraph style={{ marginTop: 0 }}>{selectedCase?.prompt ?? '-'}</Typography.Paragraph>
              <Typography.Text type="tertiary">Expected: {selectedCase?.expected ?? '-'}</Typography.Text>
            </Card>

            <div className="page-grid-2">
              <Card title={`Baseline：${detail.baselineScore}`}>
                <Typography.Paragraph style={{ marginTop: 0 }}>{baselineDetail?.output ?? '-'}</Typography.Paragraph>
                <Typography.Text type="tertiary">{detail.baselineReason}</Typography.Text>
              </Card>
              <Card title={`Candidate：${detail.candidateScore}`}>
                <Typography.Paragraph style={{ marginTop: 0 }}>{candidateDetail?.output ?? '-'}</Typography.Paragraph>
                <Typography.Text type="tertiary">{detail.candidateReason}</Typography.Text>
              </Card>
            </div>

            <Typography.Text strong>
              Delta: {detail.delta > 0 ? `+${detail.delta}` : detail.delta}
            </Typography.Text>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
