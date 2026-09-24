import { getDatabase } from './database'
import type { Settings } from '../types'

const SETTINGS_KEY = 'app-settings'
const LEGACY_KEY = 'fitness:settings:v1'

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  vibration: true,
  autoRest: true,
  notifications: false,
  defaultRestSeconds: 120,
  weightUnit: 'kg',
  animations: true,
  keepScreenAwake: false,
}

const readLegacySettings = (): Settings | null => {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return null
  }
}

export const settingsRepository = {
  async get(): Promise<Settings> {
    const db = await getDatabase()
    const stored = await db.get('settings', SETTINGS_KEY)
    if (stored && typeof stored === 'object') {
      const merged = { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings>) }
      if (![60, 90, 120, 180, 240].includes(merged.defaultRestSeconds)) merged.defaultRestSeconds = DEFAULT_SETTINGS.defaultRestSeconds
      if (merged.weightUnit !== 'kg' && merged.weightUnit !== 'lb') merged.weightUnit = DEFAULT_SETTINGS.weightUnit
      return merged
    }

    const legacy = readLegacySettings()
    if (legacy) {
      await this.save(legacy)
      return legacy
    }

    return DEFAULT_SETTINGS
  },

  async save(settings: Settings) {
    const db = await getDatabase()
    await db.put('settings', settings, SETTINGS_KEY)
  },

  async reset() {
    await this.save(DEFAULT_SETTINGS)
  },
}
