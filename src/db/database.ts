import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { WorkoutSession } from './types'

type FitnessDBSchema = DBSchema & {
  workoutSessions: { key: string; value: WorkoutSession; indexes: { 'by-status': string; 'by-startedAt': number } }
  settings: { key: string; value: unknown }
  appState: { key: string; value: unknown }
}

let databasePromise: Promise<IDBPDatabase<FitnessDBSchema>> | undefined

export const getDatabase = () => {
  databasePromise ??= openDB<FitnessDBSchema>('fitness-tracker', 1, {
    upgrade(database) {
      const sessions = database.createObjectStore('workoutSessions', { keyPath: 'id' })
      sessions.createIndex('by-status', 'status')
      sessions.createIndex('by-startedAt', 'startedAt')
      database.createObjectStore('settings')
      database.createObjectStore('appState')
    }
  })
  return databasePromise
}
