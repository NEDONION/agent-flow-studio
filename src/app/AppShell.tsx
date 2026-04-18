import { Button, Layout } from '@douyinfe/semi-ui'
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { findRouteByPath } from './routes-config'
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

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contextVisible, setContextVisible] = useState(true)

  const currentRoute = useMemo(() => findRouteByPath(location.pathname), [location.pathname])
  const currentLabel = currentRoute?.label ?? '未定义页面'

  return (
    <Layout className="shell-root">
      <Layout.Header style={{ height: HEADER_HEIGHT, padding: 0 }}>
        <GlobalHeader
          currentLabel={currentLabel}
          contextVisible={contextVisible}
          onToggleContext={() => setContextVisible((value) => !value)}
        />
      </Layout.Header>

      <Layout className="shell-main">
        <Layout.Sider
          style={{
            width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            flex: `0 0 ${sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`,
            borderRight: '1px solid var(--semi-color-border)',
          }}
        >
          <GlobalSidebar
            collapsed={sidebarCollapsed}
            currentPath={location.pathname}
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
              {sidebarCollapsed ? '展开导航' : '收起导航'}
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

        {contextVisible ? (
          <Layout.Sider
            style={{
              width: CONTEXT_WIDTH,
              flex: `0 0 ${CONTEXT_WIDTH}px`,
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
