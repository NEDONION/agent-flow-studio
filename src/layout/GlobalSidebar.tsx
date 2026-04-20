import type { ReactNode } from 'react'
import { Nav, Typography } from '@douyinfe/semi-ui'
import {
  IconActivity,
  IconApps,
  IconCheckList,
  IconCrown,
  IconHistogram,
  IconInfoCircle,
  IconList,
  IconSetting,
} from '@douyinfe/semi-icons'
import type { AppGroup, AppRouteItem } from '../app/routes-config'

interface GlobalSidebarProps {
  collapsed: boolean
  currentPath: string
  currentGroup: AppGroup
  currentGroupLabel: string
  routes: AppRouteItem[]
  onNavigate: (path: string) => void
}

interface NavSelectData {
  itemKey?: string | number
}

const ROUTE_ICON_MAP: Record<string, ReactNode> = {
  'agent-cases': <IconList />,
  'agent-run': <IconActivity />,
  'agent-stats': <IconHistogram />,
  'rlhf-generate': <IconCrown />,
  'rlhf-vlm': <IconApps />,
  'rlhf-labels': <IconCheckList />,
  settings: <IconSetting />,
  about: <IconInfoCircle />,
}

export function GlobalSidebar({
  collapsed,
  currentPath,
  currentGroup,
  currentGroupLabel,
  routes,
  onNavigate,
}: GlobalSidebarProps) {
  const items = routes.map((route) => ({
    itemKey: route.path,
    text: route.label,
    icon: ROUTE_ICON_MAP[route.key] ?? <IconList />,
  }))

  return (
    <div className="shell-side-inner">
      {!collapsed ? (
        <div className="shell-side-group-title-wrap">
          <Typography.Text strong>{currentGroupLabel}</Typography.Text>
          <Typography.Text type="tertiary">当前模块：{currentGroup}</Typography.Text>
        </div>
      ) : null}

      <Nav
        mode="vertical"
        className="shell-side-nav"
        style={{ height: '100%' }}
        bodyStyle={{ paddingBottom: 8 }}
        items={items}
        selectedKeys={[currentPath]}
        onSelect={(data: NavSelectData) => {
          if (typeof data.itemKey !== 'string' || !data.itemKey.startsWith('/')) {
            return
          }
          onNavigate(data.itemKey)
        }}
        isCollapsed={collapsed}
      />
    </div>
  )
}
