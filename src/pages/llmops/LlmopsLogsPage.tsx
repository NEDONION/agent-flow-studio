import { Button, Card, Input, Select, Space, Table, Typography } from '@douyinfe/semi-ui'

const columns = [
  { title: '时间', dataIndex: 'createdAt', width: 220 },
  { title: '类型', dataIndex: 'type', width: 120 },
  { title: '耗时(ms)', dataIndex: 'latencyMs', width: 120 },
  { title: '得分', dataIndex: 'score', width: 120 },
  { title: '状态', dataIndex: 'status', width: 120 },
]

export function LlmopsLogsPage() {
  return (
    <div className="page-block">
      <Card bodyStyle={{ display: 'grid', gap: 12 }}>
        <div className="page-toolbar">
          <Space>
            <Select style={{ width: 180 }} placeholder="状态筛选" optionList={[{ value: 'success', label: '成功' }, { value: 'fail', label: '失败' }]} />
            <Input showClear placeholder="关键字搜索" style={{ width: 240 }} />
          </Space>
          <Space>
            <Button>导出</Button>
            <Button type="danger" theme="borderless">
              清空日志
            </Button>
          </Space>
        </div>

        <Table columns={columns} dataSource={[]} pagination={{ pageSize: 10 }} empty="暂无日志" />
      </Card>

      <Typography.Text type="tertiary">页面骨架已就位：后续接入日志分页、展开详情和导出能力。</Typography.Text>
    </div>
  )
}
