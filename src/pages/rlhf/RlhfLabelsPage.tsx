import { Button, Card, Input, Select, Slider, Space, Table, Typography } from '@douyinfe/semi-ui'

const columns = [
  { title: '标注时间', dataIndex: 'createdAt', width: 220 },
  { title: '类型', dataIndex: 'type', width: 160 },
  { title: '分值', dataIndex: 'score', width: 120 },
  { title: '备注', dataIndex: 'remark' },
]

export function RlhfLabelsPage() {
  return (
    <div className="page-block">
      <div className="page-grid-2">
        <Card title="标注表单" bodyStyle={{ display: 'grid', gap: 12 }}>
          <Select
            placeholder="标注对象类型"
            optionList={[
              { value: 'image', label: '生图质量' },
              { value: 'vlm', label: '解析质量' },
            ]}
          />
          <Typography.Text>分值（0~10）</Typography.Text>
          <Slider min={0} max={10} step={1} marks={{ 0: '0', 5: '5', 10: '10' }} />
          <Input placeholder="备注（可选）" showClear />
          <Space>
            <Button type="primary">提交标注</Button>
            <Button>重置</Button>
          </Space>
        </Card>

        <Card title="历史标注">
          <Table columns={columns} dataSource={[]} pagination={{ pageSize: 8 }} empty="暂无标注记录" />
        </Card>
      </div>
    </div>
  )
}
