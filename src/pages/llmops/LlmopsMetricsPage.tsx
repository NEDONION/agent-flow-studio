import { Card, Empty, Typography } from '@douyinfe/semi-ui'

export function LlmopsMetricsPage() {
  return (
    <div className="page-block">
      <div className="page-grid-3">
        <Card title="巡检成功率">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            --
          </Typography.Title>
        </Card>
        <Card title="平均调用延迟">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            --
          </Typography.Title>
        </Card>
        <Card title="平均得分">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            --
          </Typography.Title>
        </Card>
      </div>

      <div className="page-grid-2">
        <Card title="得分趋势">
          <Empty description="待接入趋势图" />
        </Card>
        <Card title="延迟趋势">
          <Empty description="待接入趋势图" />
        </Card>
      </div>
    </div>
  )
}
