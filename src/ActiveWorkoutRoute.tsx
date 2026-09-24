import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Workout } from './types'
import type { WorkoutSession } from './db/types'
import { workoutRepository } from './db/workoutRepository'
import { ActiveWorkoutPage } from './ActiveWorkoutPage'

export function ActiveWorkoutRoute({ workout }: { workout: Workout }) {
  const navigate = useNavigate(); const [session, setSession] = useState<WorkoutSession | null>(null)
  useEffect(() => { void workoutRepository.getActive().then((active) => { if (active?.workoutId === workout.id) setSession(active); else navigate(`/workout/${workout.id}`, { replace: true }) }) }, [navigate, workout.id])
  if (!session) return <div className="active-workout-page" aria-busy="true" />
  return <ActiveWorkoutPage workout={workout} initialSession={session} />
}
