import { Button, Input, Radio, Space, Tag, Typography } from '@douyinfe/semi-ui'
import type { AppGroup } from '../app/routes-config'

interface HeaderEntryItem {
  key: AppGroup
  label: string
}

interface GlobalHeaderProps {
  currentLabel: string
  currentGroup: AppGroup
  entries: HeaderEntryItem[]
  compact: boolean
  contextVisible: boolean
  contextEnabled: boolean
  onToggleContext: () => void
  onNavigateGroup: (group: AppGroup) => void
  onNavigateSettings: () => void
}

export function GlobalHeader({
  currentLabel,
  currentGroup,
  entries,
  compact,
  contextVisible,
  contextEnabled,
  onToggleContext,
  onNavigateGroup,
  onNavigateSettings,
}: GlobalHeaderProps) {
  return (
    <div className="shell-header-inner">
      <div className="shell-header-left">
        <Space spacing="medium" align="center">
          <Typography.Title heading={5} style={{ margin: 0 }}>
            agent-flow-studio
          </Typography.Title>
          <Tag color="blue" size="small">
            桌面端
          </Tag>
          <Typography.Text type="tertiary" className="shell-current-label">
            当前页面：{currentLabel}
          </Typography.Text>
        </Space>
      </div>

      <div className="shell-header-entry-wrap">
        <div className="shell-header-entry-switch">
          <Radio.Group
            direction="horizontal"
            type="button"
            value={currentGroup}
            onChange={(value) => {
              if (typeof value === 'string') {
                onNavigateGroup(value as AppGroup)
              }
            }}
          >
            {entries.map((entry) => (
              <Radio key={entry.key} value={entry.key}>
                {entry.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </div>

      <div className="shell-header-right">
        <Space spacing={8} align="center" wrap>
          {!compact ? (
            <Input
              showClear
              className="shell-search-input"
              placeholder="全局搜索（功能/路由）"
              aria-label="全局搜索"
            />
          ) : null}
          <Button theme="borderless" disabled={!contextEnabled} onClick={onToggleContext}>
            {contextEnabled ? (contextVisible ? '收起右栏' : '展开右栏') : '右栏(窄屏隐藏)'}
          </Button>
          <Button theme="solid" type="primary" onClick={onNavigateSettings}>
            设置
          </Button>
        </Space>
      </div>
    </div>
  )
}
