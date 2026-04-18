import { Button, Card, Empty, Radio, Space, Tag, Typography } from '@douyinfe/semi-ui'

export function RlhfVlmPage() {
  return (
    <div className="page-block">
      <Card title="图片输入" bodyStyle={{ display: 'grid', gap: 12 }}>
        <Space>
          <Button type="primary">选择本地图片</Button>
          <Button>开始解析</Button>
        </Space>
        <Typography.Text type="tertiary">支持 `.jpg` / `.png` / `.webp`。</Typography.Text>
      </Card>

      <Card title="VLM 解析结果" bodyStyle={{ display: 'grid', gap: 12 }}>
        <Space>
          <Tag color="grey">描述：--</Tag>
          <Tag color="grey">关键元素：--</Tag>
        </Space>
        <Empty description="待接入解析结果" />
        <Radio.Group direction="horizontal" type="button" value={undefined}>
          <Radio value="accurate">准确</Radio>
          <Radio value="inaccurate">不准确</Radio>
        </Radio.Group>
      </Card>
    </div>
  )
}
