import { Button, Card, Empty, Space, Tag, TextArea, Typography } from '@douyinfe/semi-ui'

export function LlmopsInspectPage() {
  return (
    <div className="page-block">
      <Card title="对话输入">
        <Space vertical align="start" spacing="medium" style={{ width: '100%' }}>
          <TextArea rows={8} placeholder="粘贴单轮/多轮对话内容" showClear />
          <Space>
            <Button type="primary">开始巡检</Button>
            <Button>导入文本</Button>
            <Button>导出结果</Button>
          </Space>
        </Space>
      </Card>

      <Card title="巡检结果">
        <Space vertical align="start" spacing="medium">
          <Space>
            <Tag color="grey">得分：--</Tag>
            <Tag color="grey">事实性：--</Tag>
            <Tag color="grey">安全性：--</Tag>
          </Space>
          <Empty description="待接入模型巡检结果" />
        </Space>
      </Card>

      <Typography.Text type="tertiary">页面骨架已就位：后续接入 inspect:start / import / export IPC。</Typography.Text>
    </div>
  )
}
