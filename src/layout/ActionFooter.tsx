import { Button, Progress, Space, Tag, Typography } from '@douyinfe/semi-ui'

export function ActionFooter() {
  return (
    <div className="shell-footer-inner">
      <Space spacing="medium" align="center">
        <Button type="primary">开始任务</Button>
        <Button theme="borderless">批量导入</Button>
        <Tag color="green">就绪</Tag>
      </Space>

      <Space spacing="medium" align="center">
        <Typography.Text type="tertiary">快捷键：Ctrl/Cmd + K</Typography.Text>
        <div className="shell-progress-wrap">
          <Progress percent={0} size="small" showInfo={false} />
        </div>
      </Space>
    </div>
  )
}
