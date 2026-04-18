import { Nav } from '@douyinfe/semi-ui'

interface GlobalSidebarProps {
  collapsed: boolean
  currentPath: string
  onNavigate: (path: string) => void
}

interface NavSelectData {
  itemKey?: string | number
}

const navItems = [
  {
    itemKey: 'group-agent',
    text: 'AI Agent 回归测试',
    items: [
      { itemKey: '/agent/cases', text: '用例管理' },
      { itemKey: '/agent/run', text: '测试运行' },
      { itemKey: '/agent/stats', text: '结果统计' },
    ],
  },
  {
    itemKey: 'group-llmops',
    text: 'LLMOps 监控巡检',
    items: [
      { itemKey: '/llmops/inspect', text: '对话质量巡检' },
      { itemKey: '/llmops/logs', text: '模型调用日志' },
      { itemKey: '/llmops/metrics', text: '巡检指标可视化' },
    ],
  },
  {
    itemKey: 'group-rlhf',
    text: 'RLHF 标注平台',
    items: [
      { itemKey: '/rlhf/generate', text: '生图生成' },
      { itemKey: '/rlhf/vlm', text: 'VLM 图片解析' },
      { itemKey: '/rlhf/labels', text: '标注管理' },
    ],
  },
  {
    itemKey: 'group-system',
    text: '系统',
    items: [
      { itemKey: '/settings', text: '全局设置' },
      { itemKey: '/about', text: '关于' },
    ],
  },
]

export function GlobalSidebar({ collapsed, currentPath, onNavigate }: GlobalSidebarProps) {
  return (
    <Nav
      mode="vertical"
      className="shell-side-nav"
      style={{ height: '100%' }}
      bodyStyle={{ paddingBottom: 8 }}
      items={navItems}
      defaultOpenKeys={['group-agent', 'group-llmops', 'group-rlhf', 'group-system']}
      selectedKeys={[currentPath]}
      onSelect={(data: NavSelectData) => {
        if (typeof data.itemKey !== 'string' || !data.itemKey.startsWith('/')) {
          return
        }
        onNavigate(data.itemKey)
      }}
      isCollapsed={collapsed}
    />
  )
}
