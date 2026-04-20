import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Button, Card, Input, Modal, Select, Space, Table, Tag, TextArea, Toast, Typography } from '@douyinfe/semi-ui'
import type { TestCase } from '../../features/agent-demo'
import { bizTypeLabel, createCase, deleteCases, ensureCasesSeeded, exportCases, importCases, listCases, riskLabel, updateCase } from '../../features/agent-demo'

interface CaseDraft {
  id: string
  bizType: TestCase['bizType']
  scenario: string
  riskLevel: TestCase['riskLevel']
  prompt: string
  expected: string
  hardRulesText: string
  tagsText: string
  regressionPreset: '' | 'candidate_regress'
}

function toDraft(item?: TestCase): CaseDraft {
  if (!item) {
    return {
      id: '',
      bizType: 'customer_service',
      scenario: 'general',
      riskLevel: 'medium',
      prompt: '',
      expected: '',
      hardRulesText: '',
      tagsText: 'demo',
      regressionPreset: '',
    }
  }

  return {
    id: item.id,
    bizType: item.bizType,
    scenario: item.scenario,
    riskLevel: item.riskLevel,
    prompt: item.prompt,
    expected: item.expected,
    hardRulesText: item.hardRules.join('\n'),
    tagsText: item.tags.join(','),
    regressionPreset: item.regressionPreset ?? '',
  }
}

function parseTextList(text: string): string[] {
  return text
    .split(/\n|,|，/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function AgentCasesPage() {
  const [cases, setCases] = useState<TestCase[]>([])
  const [keyword, setKeyword] = useState('')
  const [bizFilter, setBizFilter] = useState<'all' | TestCase['bizType']>('all')
  const [riskFilter, setRiskFilter] = useState<'all' | TestCase['riskLevel']>('all')
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const [createVisible, setCreateVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [draft, setDraft] = useState<CaseDraft>(toDraft())

  const importInputRef = useRef<HTMLInputElement | null>(null)

  const loadCases = () => {
    setCases(listCases())
  }

  useEffect(() => {
    ensureCasesSeeded()
    loadCases()
  }, [])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return cases.filter((item) => {
      if (bizFilter !== 'all' && item.bizType !== bizFilter) {
        return false
      }
      if (riskFilter !== 'all' && item.riskLevel !== riskFilter) {
        return false
      }
      if (!q) {
        return true
      }
      return [item.id, item.prompt, item.expected, item.scenario, item.tags.join(' ')].join(' ').toLowerCase().includes(q)
    })
  }, [cases, keyword, bizFilter, riskFilter])

  const tableData = filtered.map((item) => ({
    ...item,
    key: item.id,
    scoreHint: item.regressionPreset === 'candidate_regress' ? '候选预设退化' : '常规',
  }))

  const resetDraft = () => setDraft(toDraft())

  const openCreate = () => {
    setDraft(toDraft())
    setCreateVisible(true)
  }

  const openEdit = (item: TestCase) => {
    setDraft(toDraft(item))
    setEditVisible(true)
  }

  const validateDraft = (value: CaseDraft) => {
    if (!value.prompt.trim()) {
      throw new Error('Prompt 不能为空')
    }
    if (value.prompt.trim().length > 4000) {
      throw new Error('Prompt 不能超过 4000 字符')
    }
    if (!value.expected.trim()) {
      throw new Error('Expected 不能为空')
    }
  }

  const saveNewCase = () => {
    try {
      validateDraft(draft)
      createCase({
        id: draft.id.trim() || undefined,
        bizType: draft.bizType,
        scenario: draft.scenario.trim() || 'general',
        riskLevel: draft.riskLevel,
        prompt: draft.prompt.trim(),
        expected: draft.expected.trim(),
        hardRules: parseTextList(draft.hardRulesText),
        rubric: [
          { name: 'accuracy', weight: 0.5 },
          { name: 'completeness', weight: 0.5 },
        ],
        tags: parseTextList(draft.tagsText),
        regressionPreset: draft.regressionPreset || undefined,
      })
      setCreateVisible(false)
      resetDraft()
      loadCases()
      Toast.success('新增用例成功')
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '新增失败')
    }
  }

  const saveEditCase = () => {
    try {
      validateDraft(draft)
      const old = cases.find((item) => item.id === draft.id)
      if (!old) {
        throw new Error('用例不存在')
      }

      updateCase({
        ...old,
        bizType: draft.bizType,
        scenario: draft.scenario.trim() || 'general',
        riskLevel: draft.riskLevel,
        prompt: draft.prompt.trim(),
        expected: draft.expected.trim(),
        hardRules: parseTextList(draft.hardRulesText),
        tags: parseTextList(draft.tagsText),
        regressionPreset: draft.regressionPreset || undefined,
      })
      setEditVisible(false)
      resetDraft()
      loadCases()
      Toast.success('更新成功')
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '更新失败')
    }
  }

  const handleDeleteSelected = () => {
    if (selectedRowKeys.length === 0) {
      Toast.warning('请先选择用例')
      return
    }

    Modal.confirm({
      title: '确认删除',
      content: `将删除 ${selectedRowKeys.length} 条用例，是否继续？`,
      onOk: () => {
        const count = deleteCases(selectedRowKeys)
        setSelectedRowKeys([])
        loadCases()
        Toast.success(`已删除 ${count} 条用例`)
      },
    })
  }

  const handleDeleteOne = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `将删除用例 ${id}`,
      onOk: () => {
        deleteCases([id])
        setSelectedRowKeys((prev) => prev.filter((item) => item !== id))
        loadCases()
        Toast.success('删除成功')
      },
    })
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      Toast.error('仅支持 .json 文件')
      return
    }

    try {
      const text = await file.text()
      const replace = window.confirm('点击“确定”覆盖导入；点击“取消”合并导入')
      const result = importCases(text, replace ? 'replace' : 'merge')
      loadCases()
      Toast.success(`导入完成：共 ${result.total} 条，新增 ${result.added}，更新 ${result.updated}`)
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '导入失败')
    }
  }

  const handleExport = () => {
    const content = exportCases(selectedRowKeys)
    const filename = selectedRowKeys.length > 0 ? `agent-cases-selected-${Date.now()}.json` : `agent-cases-all-${Date.now()}.json`
    downloadText(filename, content)
    Toast.success('导出成功')
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 150 },
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
    { title: '场景', dataIndex: 'scenario', width: 150 },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      render: (value: string) => <Typography.Text ellipsis={{ showTooltip: true }}>{value}</Typography.Text>,
    },
    {
      title: '演示标记',
      dataIndex: 'scoreHint',
      width: 130,
      render: (value: string) => (value.includes('退化') ? <Tag color="red">{value}</Tag> : <Tag>{value}</Tag>),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
      render: (_: unknown, record: TestCase) => (
        <Space>
          <Button size="small" theme="borderless" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button size="small" theme="borderless" type="danger" onClick={() => handleDeleteOne(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-block">
      <div className="page-toolbar">
        <Space wrap>
          <Button type="primary" onClick={openCreate}>
            新增用例
          </Button>
          <Button onClick={handleImportClick}>导入 JSON</Button>
          <Button onClick={handleExport}>导出 JSON</Button>
          <Button type="danger" theme="borderless" onClick={handleDeleteSelected}>
            批量删除
          </Button>
        </Space>

        <Space>
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
          <Select
            style={{ width: 120 }}
            value={riskFilter}
            onChange={(value) => setRiskFilter((value ?? 'all') as 'all' | TestCase['riskLevel'])}
            optionList={[
              { label: '全部风险', value: 'all' },
              { label: '高风险', value: 'high' },
              { label: '中风险', value: 'medium' },
              { label: '低风险', value: 'low' },
            ]}
          />
          <Input showClear style={{ width: 300 }} placeholder="按 ID/Prompt/场景搜索" value={keyword} onChange={setKeyword} />
        </Space>
      </div>

      <Card title={`用例列表（${filtered.length}/${cases.length}）`}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
          empty="暂无用例"
        />
      </Card>

      <Typography.Text type="tertiary">已接入本地 Demo 数据层：支持 CRUD、导入/导出、筛选与批量删除。</Typography.Text>

      <input ref={importInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImportFile} />

      <Modal
        title="新增用例"
        visible={createVisible}
        onOk={saveNewCase}
        onCancel={() => {
          setCreateVisible(false)
          resetDraft()
        }}
        width={760}
      >
        <CaseEditor draft={draft} onChange={setDraft} lockedId={false} />
      </Modal>

      <Modal
        title="编辑用例"
        visible={editVisible}
        onOk={saveEditCase}
        onCancel={() => {
          setEditVisible(false)
          resetDraft()
        }}
        width={760}
      >
        <CaseEditor draft={draft} onChange={setDraft} lockedId={true} />
      </Modal>
    </div>
  )
}

interface CaseEditorProps {
  draft: CaseDraft
  onChange: (next: CaseDraft) => void
  lockedId: boolean
}

function CaseEditor({ draft, onChange, lockedId }: CaseEditorProps) {
  const updateField = <K extends keyof CaseDraft>(key: K, value: CaseDraft[K]) => {
    onChange({ ...draft, [key]: value })
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Space wrap>
        <Input
          style={{ width: 220 }}
          disabled={lockedId}
          value={draft.id}
          onChange={(value) => updateField('id', value)}
          placeholder="ID（可留空自动生成）"
        />
        <Select
          style={{ width: 160 }}
          value={draft.bizType}
          onChange={(value) => updateField('bizType', value as TestCase['bizType'])}
          optionList={[
            { label: '客服', value: 'customer_service' },
            { label: '销售', value: 'sales' },
            { label: '代码', value: 'coding' },
            { label: '数据分析', value: 'data_analysis' },
          ]}
        />
        <Input style={{ width: 180 }} value={draft.scenario} onChange={(value) => updateField('scenario', value)} placeholder="场景" />
        <Select
          style={{ width: 120 }}
          value={draft.riskLevel}
          onChange={(value) => updateField('riskLevel', value as TestCase['riskLevel'])}
          optionList={[
            { label: '低', value: 'low' },
            { label: '中', value: 'medium' },
            { label: '高', value: 'high' },
          ]}
        />
      </Space>

      <TextArea value={draft.prompt} onChange={(value: string) => updateField('prompt', value)} placeholder="Prompt（必填，1~4000）" rows={4} maxCount={4000} />

      <TextArea value={draft.expected} onChange={(value: string) => updateField('expected', value)} placeholder="Expected（必填）" rows={3} />

      <TextArea value={draft.hardRulesText} onChange={(value: string) => updateField('hardRulesText', value)} placeholder="硬规则（逗号或换行分隔）" rows={3} />

      <Space wrap>
        <Input style={{ width: 360 }} value={draft.tagsText} onChange={(value) => updateField('tagsText', value)} placeholder="标签（逗号分隔）" />
        <Select
          style={{ width: 220 }}
          value={draft.regressionPreset}
          onChange={(value) => updateField('regressionPreset', (value ?? '') as '' | 'candidate_regress')}
          optionList={[
            { label: '无退化预设', value: '' },
            { label: '候选版本预设退化', value: 'candidate_regress' },
          ]}
        />
      </Space>
    </div>
  )
}
