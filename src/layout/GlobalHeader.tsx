import { Button, Input, Space, Tag, Typography } from '@douyinfe/semi-ui'

interface GlobalHeaderProps {
  currentLabel: string
  contextVisible: boolean
  onToggleContext: () => void
}

export function GlobalHeader({ currentLabel, contextVisible, onToggleContext }: GlobalHeaderProps) {
  return (
    <div className="shell-header-inner">
      <Space spacing="medium" align="center">
        <Typography.Title heading={5} style={{ margin: 0 }}>
          agent-flow-studio
        </Typography.Title>
        <Tag color="blue" size="small">
          桌面端
        </Tag>
        <Typography.Text type="tertiary">当前页面：{currentLabel}</Typography.Text>
      </Space>

      <Space spacing={8} align="center">
        <Input
          showClear
          style={{ width: 260 }}
          placeholder="全局搜索（功能/路由）"
          aria-label="全局搜索"
        />
        <Button theme="borderless" onClick={onToggleContext}>
          {contextVisible ? '收起右栏' : '展开右栏'}
        </Button>
        <Button theme="solid" type="primary">
          设置
        </Button>
      </Space>
    </div>
  )
}
