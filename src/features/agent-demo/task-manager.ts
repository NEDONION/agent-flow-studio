import { useEffect, useState } from 'react'
import { startLiveRun, startReplayRun } from './runner'
import { appendRunLogs, clearRunLogs, listRunLogs, saveRunSession } from './storage'
import type { RunLogLine, RunMode, RunProgress, RunResult, RunTask, RunTaskSnapshot, RunType, TaskLogLine, TestCase } from './types'

interface SubmitRunTaskParams {
  name: string
  mode: RunMode
  runType: RunType
  cases: TestCase[]
  concurrency: number
  systemPrompt?: string
}

interface TaskControl {
  cancel: () => void
}

const MAX_TASK_LOGS = 300
const MAX_GLOBAL_LOGS = 600

const taskMap = new Map<string, RunTask>()
const taskOrder: string[] = []
const taskControls = new Map<string, TaskControl>()
let globalLogs: TaskLogLine[] = listRunLogs(MAX_GLOBAL_LOGS)

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function cloneTask(task: RunTask): RunTask {
  return {
    ...task,
    progress: { ...task.progress },
    results: [...task.results],
    logs: [...task.logs],
  }
}

function getTask(taskId: string): RunTask | null {
  return taskMap.get(taskId) ?? null
}

function setTask(next: RunTask) {
  taskMap.set(next.taskId, next)
  emitChange()
}

function updateTask(taskId: string, updater: (current: RunTask) => RunTask) {
  const current = getTask(taskId)
  if (!current) {
    return
  }
  setTask(updater(current))
}

function toTaskLog(taskId: string, mode: RunMode, runType: RunType, log: RunLogLine): TaskLogLine {
  return {
    ...log,
    taskId,
    mode,
    runType,
  }
}

function pushTaskLog(taskId: string, line: TaskLogLine) {
  updateTask(taskId, (current) => ({
    ...current,
    runId: current.runId || line.runId,
    logs: [line, ...current.logs].slice(0, MAX_TASK_LOGS),
  }))

  globalLogs = [line, ...globalLogs].slice(0, MAX_GLOBAL_LOGS)
  appendRunLogs([line])
}

function taskProgress(total: number): RunProgress {
  return {
    total,
    done: 0,
    success: 0,
    failed: 0,
    canceled: 0,
  }
}

function newTaskId() {
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '未知错误'
}

export function submitRunTask(params: SubmitRunTaskParams): string {
  const taskId = newTaskId()
  const createdAt = new Date().toISOString()

  const initialTask: RunTask = {
    taskId,
    name: params.name,
    mode: params.mode,
    runType: params.runType,
    status: 'queued',
    createdAt,
    progress: taskProgress(params.cases.length),
    results: [],
    logs: [],
  }

  taskMap.set(taskId, initialTask)
  taskOrder.unshift(taskId)
  emitChange()

  let canceled = false
  taskControls.set(taskId, {
    cancel: () => {
      canceled = true
      const current = getTask(taskId)
      if (!current || (current.status !== 'running' && current.status !== 'queued')) {
        return
      }
      setTask({ ...current, status: 'canceled' })
      pushTaskLog(
        taskId,
        toTaskLog(taskId, current.mode, current.runType, {
          runId: current.runId || taskId,
          level: 'warn',
          message: '收到取消请求，任务将在当前步骤结束后停止',
          timestamp: new Date().toISOString(),
        }),
      )
    },
  })

  window.setTimeout(() => {
    void (async () => {
      updateTask(taskId, (current) => ({
        ...current,
        status: 'running',
        startedAt: new Date().toISOString(),
      }))

      pushTaskLog(
        taskId,
        toTaskLog(taskId, params.mode, params.runType, {
          runId: taskId,
          level: 'info',
          message: `任务已启动，共 ${params.cases.length} 条用例`,
          timestamp: new Date().toISOString(),
        }),
      )

      const onProgress = (progress: RunProgress) => {
        updateTask(taskId, (current) => ({
          ...current,
          progress,
        }))
      }

      const onResult = (result: RunResult) => {
        updateTask(taskId, (current) => {
          const exists = current.results.some((item) => item.caseId === result.caseId)
          const results = exists ? current.results.map((item) => (item.caseId === result.caseId ? result : item)) : [result, ...current.results]
          return {
            ...current,
            runId: current.runId || result.runId,
            results,
          }
        })
      }

      const onLog = (log: RunLogLine) => {
        pushTaskLog(taskId, toTaskLog(taskId, params.mode, params.runType, log))
      }

      try {
        const runnerParams = {
          name: params.name,
          runType: params.runType,
          cases: params.cases,
          concurrency: params.concurrency,
          isCanceled: () => canceled,
          onProgress,
          onResult,
          onLog,
        }

        const session =
          params.mode === 'live'
            ? await startLiveRun({
                ...runnerParams,
                systemPrompt: params.systemPrompt,
              })
            : await startReplayRun(runnerParams)

        saveRunSession(session)

        updateTask(taskId, (current) => ({
          ...current,
          runId: session.runId,
          status: session.status,
          endedAt: session.endedAt,
          progress: session.progress,
        }))
      } catch (error) {
        const message = normalizeErrorMessage(error)
        updateTask(taskId, (current) => ({
          ...current,
          status: 'failed',
          endedAt: new Date().toISOString(),
          errorMessage: message,
        }))

        pushTaskLog(
          taskId,
          toTaskLog(taskId, params.mode, params.runType, {
            runId: getTask(taskId)?.runId || taskId,
            level: 'error',
            message: `任务失败：${message}`,
            timestamp: new Date().toISOString(),
          }),
        )
      } finally {
        taskControls.delete(taskId)
      }
    })()
  }, 0)

  return taskId
}

export function cancelRunTask(taskId: string): boolean {
  const control = taskControls.get(taskId)
  if (!control) {
    return false
  }
  control.cancel()
  return true
}

export function getRunTaskSnapshot(): RunTaskSnapshot {
  const tasks = taskOrder.map((taskId) => taskMap.get(taskId)).filter((item): item is RunTask => !!item).map(cloneTask)
  return {
    tasks,
    globalLogs: [...globalLogs],
  }
}

export function subscribeRunTaskSnapshot(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useRunTaskSnapshot() {
  const [snapshot, setSnapshot] = useState<RunTaskSnapshot>(() => getRunTaskSnapshot())

  useEffect(() => {
    return subscribeRunTaskSnapshot(() => {
      setSnapshot(getRunTaskSnapshot())
    })
  }, [])

  return snapshot
}

export function clearAllRunTaskLogs() {
  globalLogs = []
  clearRunLogs()
  emitChange()
}
