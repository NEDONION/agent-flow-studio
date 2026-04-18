import { Button, Card, Empty, Input, Select, Space, Table, Typography } from '@douyinfe/semi-ui'

const columns = [
  { title: '时间', dataIndex: 'createdAt', width: 220 },
  { title: '提示词', dataIndex: 'prompt' },
  { title: '状态', dataIndex: 'status', width: 120 },
]

export function RlhfGeneratePage() {
  return (
    <div className="page-block">
      <div className="page-grid-2">
        <Card title="生图参数" bodyStyle={{ display: 'grid', gap: 12 }}>
          <Input placeholder="输入提示词" showClear />
          <Select
            placeholder="选择风格"
            optionList={[
              { value: 'realistic', label: '写实' },
              { value: 'anime', label: '二次元' },
            ]}
          />
          <Space>
            <Button type="primary">生成图片</Button>
            <Button>重新生成</Button>
            <Button>保存本地</Button>
          </Space>
        </Card>

        <Card title="图片预览">
          <Empty description="待接入图片预览" />
        </Card>
      </div>

      <Card title="生成历史">
        <Table columns={columns} dataSource={[]} pagination={{ pageSize: 8 }} empty="暂无生成记录" />
      </Card>

      <Typography.Text type="tertiary">页面骨架已就位：后续接入 image:generate / save / history IPC。</Typography.Text>
    </div>
  )
}
