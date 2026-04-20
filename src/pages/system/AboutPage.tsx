import { Card, Space, Tag, Typography } from '@douyinfe/semi-ui'

export function AboutPage() {
  return (
    <div className="page-block">
      <Card title="关于 agent-flow-studio" bodyStyle={{ display: 'grid', gap: 12 }}>
        <Typography.Paragraph>
          这是一个桌面端 AI 工作台，整合 AI Agent 回归测试、RLHF 标注两个核心模块。
        </Typography.Paragraph>

        <Space>
          <Tag color="blue">React</Tag>
          <Tag color="blue">TypeScript</Tag>
          <Tag color="blue">Electron</Tag>
          <Tag color="blue">Semi Design</Tag>
        </Space>

        <Typography.Text type="tertiary">版本：v0.0.0（骨架版）</Typography.Text>
      </Card>
    </div>
  )
}
