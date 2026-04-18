import { Button, Card, Divider, Form, Space, Switch, Typography } from '@douyinfe/semi-ui'

export function SettingsPage() {
  return (
    <div className="page-block">
      <Card title="全局设置" bodyStyle={{ display: 'grid', gap: 12 }}>
        <Form labelPosition="left">
          <Form.Input field="modelApiUrl" label="模型 API 地址" placeholder="请输入 API 地址" />
          <Form.Input field="modelName" label="默认模型" placeholder="请输入默认模型名称" />
          <Form.Slot label="开机自启">
            <Switch size="default" />
          </Form.Slot>
          <Form.Slot label="窗口置顶">
            <Switch size="default" />
          </Form.Slot>
          <Form.Input field="dataPath" label="数据目录" placeholder="用户数据目录" disabled />
        </Form>

        <Divider />

        <Space>
          <Button type="primary">保存配置</Button>
          <Button>恢复默认</Button>
        </Space>

        <Typography.Text type="tertiary">页面骨架已就位：后续接入 app:setSetting / app:getState IPC。</Typography.Text>
      </Card>
    </div>
  )
}
