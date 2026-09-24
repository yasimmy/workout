import type { WorkoutId } from '../types'

export type SessionStatus = 'active' | 'completed' | 'cancelled'
export type ExerciseSessionStatus = 'pending' | 'active' | 'completed' | 'skipped'

export type WorkoutSet = {
  setNumber: number
  targetReps?: { min: number; max: number }
  weight?: number
  reps?: number
  completed: boolean
  completedAt?: number
}

export type WorkoutExerciseSession = {
  exerciseId: string
  status: ExerciseSessionStatus
  sets: WorkoutSet[]
  cardio?: { targetSeconds: number; completedSeconds: number; completed: boolean }
}

export type WorkoutSession = {
  id: string
  workoutId: WorkoutId
  startedAt: number
  finishedAt?: number
  status: SessionStatus
  currentExerciseIndex: number
  exercises: WorkoutExerciseSession[]
  restTimer?: { exerciseId: string; setNumber: number; startedAt: number; endsAt: number }
  createdAt: number
  updatedAt: number
}
