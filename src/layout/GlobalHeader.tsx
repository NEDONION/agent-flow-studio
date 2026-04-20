import { Avatar, Button, Nav, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { IconBell, IconFeishuLogo, IconHelpCircle, IconSemiLogo, IconSetting } from '@douyinfe/semi-icons'
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
  const knownGroups = new Set<AppGroup>(['agent', 'rlhf', 'system'])

  return (
    <div className="shell-header-wrap">
      <Nav
        mode="horizontal"
        className="shell-global-nav"
        selectedKeys={[currentGroup]}
        header={{
          logo: <IconSemiLogo className="shell-brand-logo" />,
          text: 'agent-flow-studio',
        }}
        onSelect={(data) => {
          if (typeof data.itemKey !== 'string' || !knownGroups.has(data.itemKey as AppGroup)) {
            return
          }
          onNavigateGroup(data.itemKey as AppGroup)
        }}
        footer={
          <div className="shell-global-nav-actions">
            <IconFeishuLogo className="shell-global-nav-icon" />
            <IconHelpCircle className="shell-global-nav-icon" />
            <IconBell className="shell-global-nav-icon" />
            <Button
              theme="borderless"
              icon={<IconSetting />}
              onClick={onNavigateSettings}
              aria-label="打开设置"
            />
            {contextEnabled ? (
              <Button theme="borderless" onClick={onToggleContext}>
                {contextVisible ? '收起右栏' : '展开右栏'}
              </Button>
            ) : null}
            <Avatar size="small" color="light-blue">
              AF
            </Avatar>
          </div>
        }
      >
        {entries.map((entry) => (
          <Nav.Item key={entry.key} itemKey={entry.key} text={entry.label} />
        ))}
      </Nav>

      {!compact ? (
        <div className="shell-global-nav-subline">
          <Space spacing={8} align="center">
            <Tag color="blue" size="small">
              桌面端
            </Tag>
            <Typography.Text type="tertiary">当前页面：{currentLabel}</Typography.Text>
          </Space>
          <Typography.Text type="quaternary">
            {contextEnabled ? '右侧上下文面板可按需展开' : '窗口较窄，右侧上下文面板自动隐藏'}
          </Typography.Text>
        </div>
      ) : null}
    </div>
  )
}
