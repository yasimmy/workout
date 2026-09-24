import { useEffect, useState } from 'react'
import { animate } from 'animejs'
import { Play, X } from 'lucide-react'
import type { Exercise } from './types'
import { getExerciseAsset } from './data/exerciseAssets'
import { getExerciseMedia } from './data/exerciseMedia'

type Tab = 'about' | 'technique' | 'muscles'

export function ExerciseInfoSheet({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('about')
  const [playing, setPlaying] = useState(false)
  const asset = getExerciseAsset(exercise.id)
  const media = getExerciseMedia(exercise.id)

  useEffect(() => {
    document.body.classList.add('modal-open')
    animate('.exercise-info-sheet', { translateY: [20, 0], duration: 230, ease: 'outCubic' })
    return () => document.body.classList.remove('modal-open')
  }, [])

  useEffect(() => {
    setPlaying(false)
    animate('.exercise-info-panel', { translateY: [4, 0], duration: 190, ease: 'outQuad' })
  }, [tab, exercise.id])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const tabs: [Tab, string][] = [['about', 'Описание'], ['technique', 'Техника'], ['muscles', 'Мышцы']]
  return <div className="exercise-info-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="exercise-info-sheet" role="dialog" aria-modal="true" aria-labelledby="exercise-info-title">
      <header className="exercise-info-header"><h2 id="exercise-info-title">{exercise.name}</h2><button className="exercise-info-close" onClick={onClose} aria-label="Закрыть"><X size={20} /></button></header>
      <div className="exercise-info-tabs" role="tablist">{tabs.map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'exercise-info-tab active' : 'exercise-info-tab'} onClick={() => setTab(key)}>{label}</button>)}</div>
      <div className="exercise-info-panel" role="tabpanel">{tab === 'about' && <AboutPanel exercise={exercise} />}{tab === 'technique' && <TechniquePanel exercise={exercise} media={media} playing={playing} onPlay={() => setPlaying(true)} />}{tab === 'muscles' && <MusclesPanel exercise={exercise} asset={asset} />}</div>
    </section>
  </div>
}

function AboutPanel({ exercise }: { exercise: Exercise }) { const rest = exercise.restSeconds >= 150 ? '2–3 минуты' : exercise.restSeconds >= 90 ? '90–120 секунд' : '—'; return <div className="info-about"><div className="info-facts"><div><span>Формат</span><strong>{exercise.kind === 'timer' ? `${Math.round((exercise.durationSeconds ?? 0) / 60)} минут` : `${exercise.sets} × ${exercise.reps}`}</strong></div><div><span>Отдых</span><strong>{rest}</strong></div><div><span>Сложность</span><strong>Средняя</strong></div></div><h3>Об упражнении</h3><p>{exercise.description}</p><h3>Основная цель</h3><div className="info-tags">{exercise.primaryMuscles.map((muscle) => <span key={muscle}>{muscle}</span>)}</div></div> }

function TechniquePanel({ exercise, media, playing, onPlay }: { exercise: Exercise; media?: { videoId: string; videoTitle: string; youtubeUrl?: string }; playing: boolean; onPlay: () => void }) {
  return <div className="info-technique">
    {media && <>
      <div className="video-preview">
        {playing ? <iframe title={media.videoTitle} src={`https://www.youtube-nocookie.com/embed/${media.videoId}?rel=0&playsinline=1`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <>
          <img src={`https://i.ytimg.com/vi/${media.videoId}/hqdefault.jpg`} alt="Превью техники упражнения" />
          <button className="video-play" onPointerUp={(event) => { event.stopPropagation(); onPlay() }} onClick={(event) => { event.stopPropagation(); onPlay() }} aria-label="Смотреть технику выполнения"><Play size={22} fill="currentColor" /></button>
        </>}
      </div>
      <a className="youtube-fallback" href={media.youtubeUrl ?? `https://www.youtube.com/watch?v=${media.videoId}`} target="_blank" rel="noreferrer">Открыть на YouTube</a>
    </>}
    <h3>Техника выполнения</h3>
    <ol className="technique-steps">{exercise.technique.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
    <h3>Советы</h3>
    <ul className="technique-tips">{exercise.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
  </div>
}

function MusclesPanel({ exercise, asset }: { exercise: Exercise; asset?: { muscleImage?: string } }) { return <div className="info-muscles">{asset?.muscleImage && <div className="muscle-image-wrap"><img src={asset.muscleImage} alt={`Задействованные мышцы — ${exercise.name}`} /></div>}<h3>Основные мышцы</h3><MuscleList muscles={exercise.primaryMuscles} primary /><h3>Дополнительные</h3><MuscleList muscles={exercise.secondaryMuscles} /></div> }
function MuscleList({ muscles, primary = false }: { muscles: string[]; primary?: boolean }) { return <ul className={primary ? 'muscle-list primary' : 'muscle-list'}>{muscles.map((muscle) => <li key={muscle}><i />{muscle}</li>)}</ul> }
