import { Button, Card, Progress, Space, Spin, Table, Tag, Typography } from '@douyinfe/semi-ui'

const columns = [
  { title: '用例 ID', dataIndex: 'caseId' },
  { title: '状态', dataIndex: 'status' },
  { title: '分数', dataIndex: 'score' },
  { title: '耗时(ms)', dataIndex: 'latencyMs' },
]

export function AgentRunPage() {
  return (
    <div className="page-block">
      <div className="page-toolbar">
        <Space>
          <Button type="primary">运行测试</Button>
          <Button>批量运行</Button>
          <Button type="danger" theme="borderless">
            取消任务
          </Button>
        </Space>
        <Tag color="blue">并发：3</Tag>
      </div>

      <Card title="批量运行进度">
        <Space vertical align="start" spacing="medium">
          <Progress percent={0} showInfo={true} />
          <Spin spinning={false} tip="执行中..." />
        </Space>
      </Card>

      <Card title="运行结果">
        <Table columns={columns} dataSource={[]} pagination={false} empty="暂无运行结果" />
      </Card>

      <Typography.Text type="tertiary">页面骨架已就位：后续接入队列调度、进度事件和日志抽屉。</Typography.Text>
    </div>
  )
}
