import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Input, Modal, Progress, Select, Space, Spin, Table, Tag, TextArea, Toast, Typography } from '@douyinfe/semi-ui'
import type { RunMode, RunTask, RunType, TestCase } from '../../features/agent-demo'
import { bizTypeLabel, cancelRunTask, ensureCasesSeeded, listCases, riskLabel, submitRunTask, useRunTaskSnapshot } from '../../features/agent-demo'

const EMPTY_PROGRESS = {
  total: 0,
  done: 0,
  success: 0,
  failed: 0,
  canceled: 0,
}

function createDefaultRunName(runType: RunType) {
  const d = new Date()
  const stamp = `${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}${d.getSeconds().toString().padStart(2, '0')}`
  return `${runType}-${stamp}`
}

function formatTime(value?: string) {
  if (!value) {
    return '--'
  }
  return value.slice(11, 19)
}

function statusTag(status: RunTask['status']) {
  if (status === 'running') {
    return <Tag color="blue">运行中</Tag>
  }
  if (status === 'queued') {
    return <Tag color="cyan">排队中</Tag>
  }
  if (status === 'done') {
    return <Tag color="green">完成</Tag>
  }
  if (status === 'canceled') {
    return <Tag color="orange">已取消</Tag>
  }
  return <Tag color="red">失败</Tag>
}

export function AgentRunPage() {
  const [cases, setCases] = useState<TestCase[]>([])
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([])
  const [bizFilter, setBizFilter] = useState<'all' | TestCase['bizType']>('all')
  const [keyword, setKeyword] = useState('')

  const [runType, setRunType] = useState<RunType>('baseline')
  const [runMode, setRunMode] = useState<RunMode>('live')
  const [concurrency, setConcurrency] = useState(3)
  const [runName, setRunName] = useState(createDefaultRunName('baseline'))
  const [systemPrompt, setSystemPrompt] = useState('')
  const [activeTaskId, setActiveTaskId] = useState('')

  const { tasks, globalLogs } = useRunTaskSnapshot()

  const hasLlmApi = typeof (window as unknown as { llm?: { chat?: unknown } }).llm?.chat === 'function'

  useEffect(() => {
    ensureCasesSeeded()
    setCases(listCases())
  }, [])

  useEffect(() => {
    setRunName(createDefaultRunName(runType))
  }, [runType])

  useEffect(() => {
    if (tasks.length === 0) {
      setActiveTaskId('')
      return
    }

    const found = tasks.some((item) => item.taskId === activeTaskId)
    if (!activeTaskId || !found) {
      setActiveTaskId(tasks[0].taskId)
    }
  }, [tasks, activeTaskId])

  const runningCount = tasks.filter((item) => item.status === 'running' || item.status === 'queued').length
  const activeTask = tasks.find((item) => item.taskId === activeTaskId) ?? null
  const activeProgress = activeTask?.progress ?? EMPTY_PROGRESS
  const activePercent = activeProgress.total === 0 ? 0 : Math.round((activeProgress.done / activeProgress.total) * 100)

  const filteredCases = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return cases.filter((item) => {
      if (bizFilter !== 'all' && item.bizType !== bizFilter) {
        return false
      }
      if (!q) {
        return true
      }
      return [item.id, item.prompt, item.scenario].join(' ').toLowerCase().includes(q)
    })
  }, [cases, bizFilter, keyword])

  const selectedCases = useMemo(() => {
    const byId = new Map(cases.map((item) => [item.id, item]))
    return selectedCaseIds.map((id) => byId.get(id)).filter((item): item is TestCase => !!item)
  }, [cases, selectedCaseIds])

  const handleSubmit = () => {
    if (runMode === 'live' && !hasLlmApi) {
      Modal.warning({
        title: '当前环境不支持真实执行',
        content: '请在 Electron 客户端中启动应用，并确认 preload 已注入 llm API。',
      })
      return
    }

    const targetCases = selectedCases.length > 0 ? selectedCases : filteredCases
    if (targetCases.length === 0) {
      Modal.warning({
        title: '没有可运行用例',
        content: '当前筛选条件下没有用例，请先调整筛选或新增用例。',
      })
      return
    }

    if (selectedCases.length === 0) {
      Toast.info(`未手动勾选用例，默认运行当前筛选结果（${targetCases.length} 条）`)
    }

    const taskId = submitRunTask({
      name: runName.trim() || createDefaultRunName(runType),
      mode: runMode,
      runType,
      cases: targetCases,
      concurrency,
      systemPrompt: systemPrompt.trim() || undefined,
    })

    setActiveTaskId(taskId)
    Toast.success(`任务已提交：${taskId}`)
  }

  const handleCancel = (taskId: string) => {
    const ok = cancelRunTask(taskId)
    if (!ok) {
      Toast.warning('该任务不可取消（可能已结束）')
      return
    }
    Toast.warning(`已发送取消请求：${taskId}`)
  }

  const caseColumns = [
    { title: '用例 ID', dataIndex: 'id', width: 140 },
    {
      title: '业务',
      dataIndex: 'bizType',
      width: 110,
      render: (value: TestCase['bizType']) => <Tag color="blue">{bizTypeLabel(value)}</Tag>,
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 90,
      render: (value: TestCase['riskLevel']) => {
        const color = value === 'high' ? 'red' : value === 'medium' ? 'orange' : 'green'
        return <Tag color={color}>{riskLabel(value)}</Tag>
      },
    },
    { title: '场景', dataIndex: 'scenario', width: 140 },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      render: (value: string) => <Typography.Text ellipsis={{ showTooltip: true }}>{value}</Typography.Text>,
    },
  ]

  const taskColumns = [
    { title: '任务 ID', dataIndex: 'taskId', width: 180 },
    {
      title: '名称',
      dataIndex: 'name',
      width: 160,
      render: (value: string) => <Typography.Text ellipsis={{ showTooltip: true }}>{value}</Typography.Text>,
    },
    {
      title: '模式',
      dataIndex: 'mode',
      width: 90,
      render: (value: RunMode) => <Tag color={value === 'live' ? 'red' : 'grey'}>{value}</Tag>,
    },
    {
      title: '类型',
      dataIndex: 'runType',
      width: 100,
      render: (value: RunType) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: RunTask['status']) => statusTag(value),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      render: (value: RunTask['progress']) => `${value.done}/${value.total}`,
    },
    {
      title: '开始',
      dataIndex: 'startedAt',
      width: 90,
      render: (value: string | undefined) => formatTime(value),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 140,
      render: (_: unknown, record: RunTask) => (
        <Space>
          <Button size="small" theme="borderless" onClick={() => setActiveTaskId(record.taskId)}>
            查看
          </Button>
          {(record.status === 'running' || record.status === 'queued') ? (
            <Button size="small" theme="borderless" type="danger" onClick={() => handleCancel(record.taskId)}>
              取消
            </Button>
          ) : null}
        </Space>
      ),
    },
  ]

  const resultColumns = [
    { title: '用例 ID', dataIndex: 'caseId', width: 140 },
    {
      title: '业务',
      dataIndex: 'bizType',
      width: 110,
      render: (value: TestCase['bizType']) => <Tag color="blue">{bizTypeLabel(value)}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'passed',
      width: 90,
      render: (value: boolean) => (value ? <Tag color="green">通过</Tag> : <Tag color="red">失败</Tag>),
    },
    { title: '分数', dataIndex: 'score', width: 90 },
    { title: '耗时(ms)', dataIndex: 'latencyMs', width: 110 },
    {
      title: '原因',
      dataIndex: 'reason',
      render: (value: string) => <Typography.Text ellipsis={{ showTooltip: true }}>{value}</Typography.Text>,
    },
  ]

  const displayLogs = activeTask?.logs ?? globalLogs

  return (
    <div className="page-block">
      <div className="page-toolbar">
        <Space wrap>
          <Button type="primary" onClick={handleSubmit}>
            提交任务
          </Button>
          <Button
            type="danger"
            theme="borderless"
            disabled={!activeTask || (activeTask.status !== 'running' && activeTask.status !== 'queued')}
            onClick={() => {
              if (activeTask) {
                handleCancel(activeTask.taskId)
              }
            }}
          >
            取消当前任务
          </Button>
          <Tag color={runningCount > 0 ? 'blue' : 'green'}>{runningCount > 0 ? `后台运行 ${runningCount}` : '无运行中任务'}</Tag>
        </Space>

        <Space wrap>
          <Select
            style={{ width: 150 }}
            value={runMode}
            optionList={[
              { label: '真实执行', value: 'live' },
              { label: '回放执行', value: 'replay' },
            ]}
            onChange={(value) => setRunMode((value ?? 'live') as RunMode)}
          />
          <Select
            style={{ width: 170 }}
            value={runType}
            optionList={[
              { label: 'Baseline 运行', value: 'baseline' },
              { label: 'Candidate 运行', value: 'candidate' },
            ]}
            onChange={(value) => setRunType((value ?? 'baseline') as RunType)}
          />
          <Input style={{ width: 180 }} value={runName} onChange={setRunName} placeholder="任务名称" />
          <Select
            style={{ width: 140 }}
            value={concurrency}
            optionList={[
              { label: '并发 1', value: 1 },
              { label: '并发 2', value: 2 },
              { label: '并发 3', value: 3 },
              { label: '并发 5', value: 5 },
              { label: '并发 8', value: 8 },
            ]}
            onChange={(value) => setConcurrency(Number(value) || 3)}
          />
        </Space>
      </div>

      {runMode === 'live' ? (
        <Card title="真实执行配置">
          <Space vertical align="start" spacing="medium" style={{ width: '100%' }}>
            <TextArea rows={4} value={systemPrompt} onChange={setSystemPrompt} placeholder="可选：自定义系统提示词（留空则使用内置 baseline/candidate 提示词）" />
            <Typography.Text type="tertiary">真实执行会对每条用例进行两次模型调用：一次生成输出，一次评审打分。</Typography.Text>
            {!hasLlmApi ? <Tag color="red">未检测到 llm API，无法真实执行</Tag> : <Tag color="green">已检测到 llm API</Tag>}
          </Space>
        </Card>
      ) : null}

      <Card title={`任务队列（${tasks.length}）`}>
        <Table columns={taskColumns} dataSource={tasks.map((item) => ({ ...item, key: item.taskId }))} pagination={{ pageSize: 6 }} empty="暂无任务" />
      </Card>

      <Card title="用例选择">
        <Space style={{ marginBottom: 12 }} wrap>
          <Select
            style={{ width: 150 }}
            value={bizFilter}
            onChange={(value) => setBizFilter((value ?? 'all') as 'all' | TestCase['bizType'])}
            optionList={[
              { label: '全部业务', value: 'all' },
              { label: '客服', value: 'customer_service' },
              { label: '销售', value: 'sales' },
              { label: '代码', value: 'coding' },
              { label: '数据分析', value: 'data_analysis' },
            ]}
          />
          <Input showClear style={{ width: 300 }} value={keyword} onChange={setKeyword} placeholder="搜索 ID/Prompt/场景" />
          <Button
            theme="borderless"
            onClick={() => {
              setSelectedCaseIds(filteredCases.map((item) => item.id))
            }}
          >
            全选当前筛选
          </Button>
          <Button theme="borderless" onClick={() => setSelectedCaseIds([])}>
            清空选择
          </Button>
          <Tag color="grey">已选 {selectedCaseIds.length} 条</Tag>
          <Typography.Text type="tertiary">未勾选时默认运行当前筛选结果</Typography.Text>
        </Space>

        <Table
          dataSource={filteredCases.map((item) => ({ ...item, key: item.id }))}
          columns={caseColumns}
          pagination={{ pageSize: 8 }}
          rowSelection={{
            selectedRowKeys: selectedCaseIds,
            onChange: (keys) => setSelectedCaseIds(keys as string[]),
          }}
        />
      </Card>

      <Card title={activeTask ? `任务进度：${activeTask.taskId}` : '任务进度'}>
        <Space vertical align="start" spacing="medium" style={{ width: '100%' }}>
          <Progress percent={activePercent} showInfo={true} />
          <Space wrap>
            {activeTask ? statusTag(activeTask.status) : <Tag>未选中任务</Tag>}
            <Tag>总数 {activeProgress.total}</Tag>
            <Tag color="green">通过 {activeProgress.success}</Tag>
            <Tag color="red">失败 {activeProgress.failed}</Tag>
            <Tag color="orange">取消 {activeProgress.canceled}</Tag>
          </Space>
          <Spin spinning={!!activeTask && (activeTask.status === 'running' || activeTask.status === 'queued')} tip="后台执行中..." />
          {activeTask?.errorMessage ? <Typography.Text type="danger">{activeTask.errorMessage}</Typography.Text> : null}
        </Space>
      </Card>

      <div className="page-grid-2">
        <Card title="任务结果">
          <Table
            columns={resultColumns}
            dataSource={(activeTask?.results ?? []).map((item) => ({ ...item, key: item.caseId }))}
            pagination={false}
            empty="暂无结果"
          />
        </Card>

        <Card title="任务日志">
          <div style={{ maxHeight: 360, overflow: 'auto', display: 'grid', gap: 8 }}>
            {displayLogs.length === 0 ? <Typography.Text type="tertiary">暂无日志</Typography.Text> : null}
            {displayLogs.map((item, index) => (
              <div key={`${item.taskId}-${item.timestamp}-${index}`} style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--semi-color-fill-0)' }}>
                <Typography.Text size="small" type="tertiary">
                  {item.timestamp.slice(11, 19)} [{item.level.toUpperCase()}] {item.taskId}
                  {item.caseId ? `/${item.caseId}` : ''}
                </Typography.Text>
                <div>
                  <Typography.Text>{item.message}</Typography.Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Typography.Text type="tertiary">任务提交后在后台持续执行，可切换页面查看，返回后仍可在任务队列查看进度与日志。</Typography.Text>
    </div>
  )
}
