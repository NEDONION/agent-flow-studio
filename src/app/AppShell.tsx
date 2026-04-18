import { Button, Layout } from '@douyinfe/semi-ui'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { findRouteByPath, getGroupMeta, getRoutesByGroup, PRIMARY_GROUPS, type AppGroup } from './routes-config'
import { ActionFooter } from '../layout/ActionFooter'
import { ContextPanel } from '../layout/ContextPanel'
import { GlobalHeader } from '../layout/GlobalHeader'
import { GlobalSidebar } from '../layout/GlobalSidebar'
import './app-shell.css'

const HEADER_HEIGHT = 56
const FOOTER_HEIGHT = 40
const SIDEBAR_WIDTH = 240
const SIDEBAR_COLLAPSED_WIDTH = 72
const CONTEXT_WIDTH = 320

function getViewportWidth() {
  return typeof window === 'undefined' ? 1440 : window.innerWidth
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contextVisible, setContextVisible] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth)

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const currentRoute = useMemo(() => findRouteByPath(location.pathname), [location.pathname])
  const currentLabel = currentRoute?.label ?? '未定义页面'
  const currentGroup = (currentRoute?.group ?? 'agent') as AppGroup
  const currentGroupMeta = getGroupMeta(currentGroup)
  const currentGroupRoutes = useMemo(() => getRoutesByGroup(currentGroup), [currentGroup])
  const compactMode = viewportWidth < 1320
  const contextEnabled = viewportWidth >= 1200
  const effectiveSidebarCollapsed = sidebarCollapsed || compactMode
  const sidebarWidth = effectiveSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : (viewportWidth < 1500 ? 208 : SIDEBAR_WIDTH)
  const contextWidth = viewportWidth < 1440 ? 280 : CONTEXT_WIDTH
  const shouldShowContext = contextVisible && contextEnabled

  const headerEntries = PRIMARY_GROUPS.map((group) => {
    const meta = getGroupMeta(group)
    return { key: group, label: meta.label }
  })

  return (
    <Layout className="shell-root">
      <Layout.Header style={{ minHeight: HEADER_HEIGHT, padding: 0 }}>
        <GlobalHeader
          currentLabel={currentLabel}
          currentGroup={currentGroup}
          entries={headerEntries}
          compact={compactMode}
          contextVisible={shouldShowContext}
          contextEnabled={contextEnabled}
          onToggleContext={() => {
            if (!contextEnabled) {
              return
            }
            setContextVisible((value) => !value)
          }}
          onNavigateGroup={(group) => {
            navigate(getGroupMeta(group).defaultPath)
          }}
          onNavigateSettings={() => {
            navigate(getGroupMeta('system').defaultPath)
          }}
        />
      </Layout.Header>

      <Layout className="shell-main">
        <Layout.Sider
          className="shell-left-sider"
          style={{
            width: sidebarWidth,
            flex: `0 0 ${sidebarWidth}px`,
            borderRight: '1px solid var(--semi-color-border)',
          }}
        >
          <GlobalSidebar
            collapsed={effectiveSidebarCollapsed}
            currentPath={location.pathname}
            currentGroup={currentGroup}
            currentGroupLabel={currentGroupMeta.label}
            routes={currentGroupRoutes}
            onNavigate={(path) => {
              navigate(path)
            }}
          />
          <div className="shell-side-toggle-wrap">
            <Button
              block
              theme="borderless"
              onClick={() => {
                setSidebarCollapsed((value) => !value)
              }}
            >
              {effectiveSidebarCollapsed ? '展开导航' : '收起导航'}
            </Button>
          </div>
        </Layout.Sider>

        <Layout className="shell-workspace">
          <Layout.Content className="shell-content-wrap">
            <div className="shell-content-inner">
              <Outlet />
            </div>
          </Layout.Content>

          <Layout.Footer style={{ height: FOOTER_HEIGHT, padding: 0 }}>
            <ActionFooter />
          </Layout.Footer>
        </Layout>

        {shouldShowContext ? (
          <Layout.Sider
            className="shell-right-sider"
            style={{
              width: contextWidth,
              flex: `0 0 ${contextWidth}px`,
              borderLeft: '1px solid var(--semi-color-border)',
            }}
          >
            <ContextPanel currentLabel={currentLabel} />
          </Layout.Sider>
        ) : null}
      </Layout>
    </Layout>
  )
}
