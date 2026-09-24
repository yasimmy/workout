import type { ProgressState, Settings } from './types'
const keys = { progress: 'fitness:progress:v1', settings: 'fitness:settings:v1', history: 'fitness:history:v1' }
const read = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback } }
export const storage = {
  progress: () => read<ProgressState>(keys.progress, {}),
  saveProgress: (value: ProgressState) => localStorage.setItem(keys.progress, JSON.stringify(value)),
  settings: () => read<Settings>(keys.settings, { sound: true, vibration: true, autoRest: true, notifications: false, defaultRestSeconds: 120, weightUnit: 'kg', animations: true, keepScreenAwake: false }),
  saveSettings: (value: Settings) => localStorage.setItem(keys.settings, JSON.stringify(value)),
  history: () => read<string[]>(keys.history, []),
  saveHistory: (value: string[]) => localStorage.setItem(keys.history, JSON.stringify(value)),
  clear: () => Object.values(keys).forEach((key) => localStorage.removeItem(key))
}
