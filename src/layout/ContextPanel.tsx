import { Card, Divider, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { useRunTaskSnapshot } from '../features/agent-demo'

interface ContextPanelProps {
  currentLabel: string
}

export function ContextPanel({ currentLabel }: ContextPanelProps) {
  const { tasks, globalLogs } = useRunTaskSnapshot()
  const runningCount = tasks.filter((item) => item.status === 'running' || item.status === 'queued').length
  const latestTask = tasks[0] ?? null

  return (
    <div className="context-panel">
      <Card bordered bodyStyle={{ display: 'grid', gap: 12 }}>
        <Typography.Title heading={6} style={{ margin: 0 }}>
          Context
        </Typography.Title>
        <Typography.Text type="tertiary">用于承载当前模块的配置、执行状态与快速摘要。</Typography.Text>

        <Divider />

        <Space spacing={8} wrap>
          <Tag color="blue">当前页面</Tag>
          <Tag color="grey">{currentLabel}</Tag>
        </Space>

        <Card title="运行状态" bodyStyle={{ display: 'grid', gap: 6 }}>
          <Typography.Text>后台任务：{runningCount} 个</Typography.Text>
          <Typography.Text type="tertiary">最近任务：{latestTask ? `${latestTask.taskId} (${latestTask.status})` : '暂无'}</Typography.Text>
        </Card>

        <Card title="最近日志" bodyStyle={{ display: 'grid', gap: 6 }}>
          {globalLogs.length === 0 ? <Typography.Text type="tertiary">暂无日志</Typography.Text> : null}
          {globalLogs.slice(0, 6).map((item, index) => (
            <div key={`${item.taskId}-${item.timestamp}-${index}`}>
              <Typography.Text size="small" type="tertiary">
                {item.timestamp.slice(11, 19)} [{item.level.toUpperCase()}] {item.taskId}
              </Typography.Text>
              <Typography.Text size="small">{item.message}</Typography.Text>
            </div>
          ))}
        </Card>
      </Card>
    </div>
  )
}
