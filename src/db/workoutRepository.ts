import { getDatabase } from './database'
import type { WorkoutId } from '../types'
import type { WorkoutSession } from './types'

const ACTIVE_KEY = 'active-workout'
const createId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const workoutRepository = {
  async getActive() {
    const db = await getDatabase()
    const sessions = await db.getAllFromIndex('workoutSessions', 'by-status', 'active')
    return sessions.sort((a, b) => b.startedAt - a.startedAt)[0]
  },
  async save(session: WorkoutSession) {
    const db = await getDatabase()
    await db.put('workoutSessions', { ...session, updatedAt: Date.now() })
    await db.put('appState', session.id, ACTIVE_KEY)
  },
  async finish(session: WorkoutSession, status: 'completed' | 'cancelled' = 'completed') {
    const db = await getDatabase()
    await db.put('workoutSessions', { ...session, status, finishedAt: Date.now(), updatedAt: Date.now() })
    await db.delete('appState', ACTIVE_KEY)
  },
  async create(workoutId: WorkoutId, exercises: WorkoutSession['exercises']) {
    const existing = await this.getActive()
    if (existing) return existing
    const now = Date.now()
    const session: WorkoutSession = { id: createId(), workoutId, startedAt: now, createdAt: now, updatedAt: now, status: 'active', currentExerciseIndex: 0, exercises }
    await this.save(session)
    return session
  },
  async get(id: string) { return (await getDatabase()).get('workoutSessions', id) },
  async listAll() { return (await getDatabase()).getAll('workoutSessions') },
  async listCompleted() { return (await getDatabase()).getAllFromIndex('workoutSessions', 'by-status', 'completed') },
  async importSessions(sessions: WorkoutSession[]) {
    const db = await getDatabase()
    const tx = db.transaction(['workoutSessions', 'appState'], 'readwrite')
    await tx.objectStore('workoutSessions').clear()
    await Promise.all(sessions.map((session) => tx.objectStore('workoutSessions').put(session)))
    await tx.objectStore('appState').delete(ACTIVE_KEY)
    const active = sessions.find((session) => session.status === 'active')
    if (active) await tx.objectStore('appState').put(active.id, ACTIVE_KEY)
    await tx.done
  },
  async clearAll() {
    const db = await getDatabase()
    const tx = db.transaction(['workoutSessions', 'settings', 'appState'], 'readwrite')
    await Promise.all([
      tx.objectStore('workoutSessions').clear(),
      tx.objectStore('settings').clear(),
      tx.objectStore('appState').clear(),
    ])
  },
  async cancelActive() {
    const active = await this.getActive()
    if (!active) return
    await this.finish(active, 'cancelled')
  }
}
