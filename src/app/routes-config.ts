export interface AppRouteItem {
  key: string
  path: string
  label: string
  group: 'agent' | 'llmops' | 'rlhf' | 'system'
}

export const APP_ROUTES: AppRouteItem[] = [
  { key: 'agent-cases', path: '/agent/cases', label: '用例管理', group: 'agent' },
  { key: 'agent-run', path: '/agent/run', label: '测试运行', group: 'agent' },
  { key: 'agent-stats', path: '/agent/stats', label: '结果统计', group: 'agent' },
  { key: 'llmops-inspect', path: '/llmops/inspect', label: '对话质量巡检', group: 'llmops' },
  { key: 'llmops-logs', path: '/llmops/logs', label: '模型调用日志', group: 'llmops' },
  { key: 'llmops-metrics', path: '/llmops/metrics', label: '巡检指标可视化', group: 'llmops' },
  { key: 'rlhf-generate', path: '/rlhf/generate', label: '生图生成', group: 'rlhf' },
  { key: 'rlhf-vlm', path: '/rlhf/vlm', label: 'VLM 图片解析', group: 'rlhf' },
  { key: 'rlhf-labels', path: '/rlhf/labels', label: '标注管理', group: 'rlhf' },
  { key: 'settings', path: '/settings', label: '全局设置', group: 'system' },
  { key: 'about', path: '/about', label: '关于', group: 'system' },
]

export const DEFAULT_ROUTE = '/agent/cases'

const routeMap = new Map(APP_ROUTES.map((route) => [route.path, route]))

export function findRouteByPath(pathname: string): AppRouteItem | undefined {
  return routeMap.get(pathname)
}
