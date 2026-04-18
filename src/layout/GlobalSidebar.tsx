import { Nav, Typography } from '@douyinfe/semi-ui'
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
