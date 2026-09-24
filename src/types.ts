export type WorkoutId = 'A' | 'B' | 'C'
export type ExerciseKind = 'sets' | 'timer'
export type Exercise = {
  id: string
  name: string
  kind: ExerciseKind
  sets?: number
  reps?: string
  durationSeconds?: number
  restSeconds: number
  description: string
  technique: string[]
  mistakes: string[]
  primaryMuscles: string[]
  secondaryMuscles: string[]
  media?: string
}
export type Workout = { id: WorkoutId; title: string; subtitle: string; color: string; estimatedMinutes: string; exercises: Exercise[] }
export type ProgressState = Record<string, boolean>
export type WeightUnit = 'kg' | 'lb'
export type Settings = {
  sound: boolean
  vibration: boolean
  autoRest: boolean
  notifications: boolean
  defaultRestSeconds: number
  weightUnit: WeightUnit
  animations: boolean
  keepScreenAwake: boolean
}
