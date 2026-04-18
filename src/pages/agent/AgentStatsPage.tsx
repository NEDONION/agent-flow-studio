import { Card, Empty, Typography } from '@douyinfe/semi-ui'

export function AgentStatsPage() {
  return (
    <div className="page-block">
      <div className="page-grid-3">
        <Card title="整体通过率">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            --
          </Typography.Title>
        </Card>
        <Card title="平均得分">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            --
          </Typography.Title>
        </Card>
        <Card title="失败用例数">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            --
          </Typography.Title>
        </Card>
      </div>

      <div className="page-grid-2">
        <Card title="得分分布">
          <Empty description="待接入图表数据" />
        </Card>
        <Card title="运行趋势">
          <Empty description="待接入图表数据" />
        </Card>
      </div>
    </div>
  )
}
