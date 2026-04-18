import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { DEFAULT_ROUTE } from './routes-config'
import { AgentCasesPage } from '../pages/agent/AgentCasesPage'
import { AgentRunPage } from '../pages/agent/AgentRunPage'
import { AgentStatsPage } from '../pages/agent/AgentStatsPage'
import { LlmopsInspectPage } from '../pages/llmops/LlmopsInspectPage'
import { LlmopsLogsPage } from '../pages/llmops/LlmopsLogsPage'
import { LlmopsMetricsPage } from '../pages/llmops/LlmopsMetricsPage'
import { RlhfGeneratePage } from '../pages/rlhf/RlhfGeneratePage'
import { RlhfLabelsPage } from '../pages/rlhf/RlhfLabelsPage'
import { RlhfVlmPage } from '../pages/rlhf/RlhfVlmPage'
import { AboutPage } from '../pages/system/AboutPage'
import { SettingsPage } from '../pages/system/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
        <Route path="agent/cases" element={<AgentCasesPage />} />
        <Route path="agent/run" element={<AgentRunPage />} />
        <Route path="agent/stats" element={<AgentStatsPage />} />

        <Route path="llmops/inspect" element={<LlmopsInspectPage />} />
        <Route path="llmops/logs" element={<LlmopsLogsPage />} />
        <Route path="llmops/metrics" element={<LlmopsMetricsPage />} />

        <Route path="rlhf/generate" element={<RlhfGeneratePage />} />
        <Route path="rlhf/vlm" element={<RlhfVlmPage />} />
        <Route path="rlhf/labels" element={<RlhfLabelsPage />} />

        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
    </Routes>
  )
}
