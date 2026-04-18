import { Card, Divider, Space, Tag, Typography } from '@douyinfe/semi-ui'

interface ContextPanelProps {
  currentLabel: string
}

export function ContextPanel({ currentLabel }: ContextPanelProps) {
  return (
    <div className="context-panel">
      <Card bordered bodyStyle={{ display: 'grid', gap: 12 }}>
        <Typography.Title heading={6} style={{ margin: 0 }}>
          上下文面板
        </Typography.Title>
        <Typography.Text type="tertiary">用于承载参数配置、任务日志和对象详情。</Typography.Text>

        <Divider />

        <Space spacing={8} wrap>
          <Tag color="blue">当前页面</Tag>
          <Tag color="grey">{currentLabel}</Tag>
        </Space>

        <Card title="参数配置" bodyStyle={{ display: 'grid', gap: 6 }}>
          <Typography.Text>模型：待接入</Typography.Text>
          <Typography.Text>并发：待接入</Typography.Text>
        </Card>

        <Card title="执行日志" bodyStyle={{ display: 'grid', gap: 6 }}>
          <Typography.Text type="tertiary">日志面板骨架已就位，后续接入实时事件流。</Typography.Text>
        </Card>
      </Card>
    </div>
  )
}
