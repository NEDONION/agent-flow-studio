import { Button, Card, Input, Space, Table, Typography } from '@douyinfe/semi-ui'

const columns = [
  { title: 'ID', dataIndex: 'id', width: 160 },
  { title: 'Prompt', dataIndex: 'prompt' },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '得分', dataIndex: 'score', width: 120 },
]

export function AgentCasesPage() {
  return (
    <div className="page-block">
      <div className="page-toolbar">
        <Space wrap>
          <Button type="primary">新增用例</Button>
          <Button>导入 JSON</Button>
          <Button>导出 JSON</Button>
          <Button type="danger" theme="borderless">
            批量删除
          </Button>
        </Space>
        <Input showClear style={{ width: 280 }} placeholder="按 Prompt 搜索用例" />
      </div>

      <Card title="用例列表">
        <Table columns={columns} dataSource={[]} pagination={{ pageSize: 10 }} empty="暂无用例" />
      </Card>

      <Typography.Text type="tertiary">页面骨架已就位：后续接入用例 CRUD、导入导出与选中态联动。</Typography.Text>
    </div>
  )
}
