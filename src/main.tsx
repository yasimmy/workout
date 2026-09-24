import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { animate } from 'animejs'
import { Activity, ArrowLeft, BarChart3, Bell, Check, CheckCircle2, ChevronRight, Clock3, Dumbbell, Download, House, Info, Pause, Play, RotateCcw, Settings, Square, Target, TimerReset, Upload, Volume2, VolumeX, X, Zap } from 'lucide-react'
import { workouts, workoutById } from './data/workouts'
import type { Exercise, ProgressState, Settings as SettingsType, Workout, WorkoutId } from './types'
import { storage } from './storage'
import { formatTime, vibrate } from './utils'
import { ExerciseInfoSheet } from './ExerciseInfoSheet'
import { TrainingGuide, WarmupSheet } from './workoutGuides'
import { ActiveWorkoutPage, buildSessionExercises } from './ActiveWorkoutPage'
import { ActiveWorkoutRoute } from './ActiveWorkoutRoute'
import { settingsRepository, DEFAULT_SETTINGS } from './db/settingsRepository'
import { workoutRepository } from './db/workoutRepository'
import './styles.css'
import './reference.css'
import './local-bg.css'
import './home-reference.css'
import './home-fine.css'
import './home-layout-fix.css'
import './home-pixel.css'
import './home-canvas-fix.css'
import './home-short-viewport.css'
import './workout-guides.css'
import './warmup-mobile.css'
import './warmup-fullscreen.css'
import './active-workout.css'
import './active-entry.css'
import './active-session-card.css'
import './active-summary.css'
import './rest-banner-fix.css'
import './compact-workout.css'
import './compact-workout-fine.css'
import './compact-workout-reference-fix.css'
import './exercise-info-reference.css'
import './exercise-info-fine.css'
import './exercise-video-fallback.css'
import './settings-enhanced.css'

const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>(() => storage.progress())
  const toggle = (id: string) => setProgress((current) => { const next = { ...current, [id]: !current[id] }; storage.saveProgress(next); return next })
  const clear = async () => {
    storage.clear();
    await workoutRepository.clearAll();
    setProgress({})
  }
  return { progress, toggle, clear }
}

function BottomNav() {
  const navigate = useNavigate(); const location = useLocation()
  const links = [{ path: '/', label: 'Главная', icon: House }, { path: '/progress', label: 'Прогресс', icon: BarChart3 }, { path: '/settings', label: 'Настройки', icon: Settings }]
  return <nav className="bottom-nav">{links.map(({ path, label, icon: Icon }) => <button key={path} className={location.pathname === path ? 'nav-item active' : 'nav-item'} onClick={() => navigate(path)} aria-label={label}><Icon size={20} strokeWidth={2.2} /><span>{label}</span></button>)}</nav>
}

function HomePage() {
  const navigate = useNavigate()
  const subtitles = { A: 'Грудь / Трицепс / Кардио', B: 'Спина / Бицепс / Пресс', C: 'Ноги / Плечи / Корпус' }
  const [active, setActive] = useState<Awaited<ReturnType<typeof workoutRepository.getActive>> | undefined>(undefined)
  useEffect(() => { void workoutRepository.getActive().then(setActive) }, [])
  useEffect(() => { animate('.workout-card', { opacity: [0, 1], translateY: [10, 0], delay: (_element, index) => (index ?? 0) * 60, duration: 260, ease: 'outQuad' }) }, [])
  const activeWorkout = active ? workoutById(active.workoutId) : undefined
  return <><main className="page"><header className="page-header"><h1>Тренировки</h1><p>Выбери программу<br />на сегодня</p></header>{activeWorkout && active && <button className="active-session-card" onClick={() => navigate(`/active/${activeWorkout.id}`)}><span><strong>Продолжить тренировку</strong><small>{activeWorkout.title} · упражнение {active.currentExerciseIndex + 1} из {active.exercises.length}</small></span><ChevronRight size={19} /></button>}<section className="workout-list">{workouts.map((workout) => <button className="workout-card" key={workout.id} onClick={() => navigate(`/workout/${workout.id}`)}><span className="card-main"><strong>{workout.title}</strong><span>{subtitles[workout.id]}</span></span><ChevronRight className="card-arrow" size={19} /></button>)}</section></main><BottomNav /></>
}

function SetModal({ exercise, onDone, onClose }: { exercise: Exercise; onDone: () => void; onClose: () => void }) {
  const total = exercise.sets ?? 1; const [set, setSet] = useState(1); const [resting, setResting] = useState(false); const [end, setEnd] = useState<number | null>(null); const [remaining, setRemaining] = useState(exercise.restSeconds)
  useEffect(() => { if (!end) return; const tick = () => { const next = Math.max(0, Math.ceil((end - Date.now()) / 1000)); setRemaining(next); if (!next) { setEnd(null); setResting(false); vibrate([200, 100, 300]) } }; tick(); const id = window.setInterval(tick, 250); return () => window.clearInterval(id) }, [end])
  const complete = () => { if (set >= total) { onDone(); onClose(); return }; setSet((value) => value + 1); if (exercise.restSeconds) { setResting(true); setEnd(Date.now() + exercise.restSeconds * 1000) } }
  return <div className="modal-backdrop"><section className="focus-modal" role="dialog" aria-modal="true"><div className="focus-top"><span className="mini-label">ПОДХОДЫ</span><button className="icon-button" onClick={onClose} aria-label="Закрыть"><X /></button></div>{resting ? <><div className="rest-state"><TimerReset size={28} /><span>ОТДЫХ</span><strong>{formatTime(remaining)}</strong><small>Приготовься к следующему подходу</small></div><button className="secondary-button wide" onClick={() => { setEnd(null); setResting(false) }}>Пропустить</button></> : <><div className="set-counter">Подход {set} из {total}<div className="set-dots">{Array.from({ length: total }, (_, index) => <i key={index} className={index < set ? 'done' : ''} />)}</div></div><h2>{exercise.name}</h2><p className="goal">Цель: <strong>{exercise.reps} повторений</strong></p><button className="primary-button wide" onClick={complete}><Check size={19} /> Подход выполнен</button></>}</section></div>
}

function CardioModal({ exercise, onDone, onClose }: { exercise: Exercise; onDone: () => void; onClose: () => void }) {
  const key = `fitness:timer:${exercise.id}`; const total = exercise.durationSeconds ?? 0; const [end, setEnd] = useState<number | null>(() => { const saved = localStorage.getItem(key); return saved ? Number(saved) : null }); const [remaining, setRemaining] = useState(total); const [paused, setPaused] = useState(false)
  useEffect(() => { if (!end || paused) return; const tick = () => { const next = Math.max(0, Math.ceil((end - Date.now()) / 1000)); setRemaining(next); if (!next) { localStorage.removeItem(key); vibrate([300, 150, 300, 150, 600]); onDone() } }; tick(); const id = window.setInterval(tick, 250); return () => window.clearInterval(id) }, [end, paused, onDone])
  useEffect(() => { const refresh = () => { if (end && end <= Date.now()) setRemaining(0) }; document.addEventListener('visibilitychange', refresh); window.addEventListener('focus', refresh); return () => { document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh) } }, [end])
  const start = () => { const next = Date.now() + remaining * 1000; setEnd(next); localStorage.setItem(key, String(next)) }; const stop = () => { localStorage.removeItem(key); onClose() }; const ratio = total ? remaining / total : 0
  return <div className="modal-backdrop full"><section className={remaining === 0 ? 'timer-screen finished' : 'timer-screen'}><div className="focus-top"><span className="mini-label">КАРДИО</span><button className="icon-button" onClick={onClose} aria-label="Закрыть"><X /></button></div><div className="timer-center">{remaining === 0 ? <><CheckCircle2 size={58} /><h2>Время вышло!</h2><p>{formatTime(total)} завершено</p></> : <><div className="timer-ring" style={{ '--progress': `${ratio * 360}deg` } as React.CSSProperties}><span>{formatTime(remaining)}</span></div><h2>{exercise.name}</h2><p>{end ? 'Таймер запущен' : 'Готов к старту'}</p></>}</div><div className="timer-actions">{remaining === 0 ? <button className="primary-button wide" onClick={onClose}>Готово</button> : !end ? <button className="primary-button wide" onClick={start}><Play size={19} /> Засечь время</button> : <><button className="secondary-button" onClick={() => setPaused((value) => !value)}>{paused ? <Play size={18} /> : <Pause size={18} />} {paused ? 'Продолжить' : 'Пауза'}</button><button className="danger-button" onClick={stop}><Square size={17} /> Остановить</button></>}</div></section></div>
}

function CompactWorkoutPage({ workout, progress, toggle, onStart }: { workout: Workout; progress: ProgressState; toggle: (id: string) => void; onStart: () => void }) {
  const navigate = useNavigate(); const [info, setInfo] = useState<Exercise | null>(null); const [sets, setSets] = useState<Exercise | null>(null); const [cardio, setCardio] = useState<Exercise | null>(null)
  useEffect(() => { animate('.compact-exercise-row', { opacity: [0, 1], translateY: [6, 0], delay: (_element, index) => (index ?? 0) * 25, duration: 200, ease: 'outQuad' }) }, [workout.id])
  return <><main className="compact-workout-page"><header className="compact-workout-header"><button className="compact-back" onClick={() => navigate(-1)} aria-label="Назад"><ArrowLeft size={22} /></button><div><h1>{workout.title}</h1><p>{workout.id === 'A' ? 'Грудь / Трицепс / Кардио' : workout.id === 'B' ? 'Спина / Бицепс' : 'Ноги / Плечи / Пресс'}</p></div></header><section className="target-card"><Target size={30} /><div><span>Примерное время</span><strong><Clock3 size={13} /> {workout.estimatedMinutes}</strong></div></section><button className="start-workout-button" onClick={onStart}><Play size={16} /> Начать тренировку</button><section className="compact-exercises">{workout.exercises.map((exercise, index) => <article className={progress[exercise.id] ? 'compact-exercise-row completed' : 'compact-exercise-row'} key={exercise.id}><span className="compact-number">{progress[exercise.id] ? <Check size={15} /> : index + 1}</span><div className="compact-thumb" style={{ backgroundImage: `url(${exercise.media})` }} aria-hidden="true" /><div className="compact-exercise-content"><h2>{exercise.name}</h2><p>{exercise.kind === 'timer' ? `${Math.round((exercise.durationSeconds ?? 0) / 60)} минут` : `${exercise.sets} × ${exercise.reps}`}</p><button className={progress[exercise.id] ? 'compact-done-action' : 'compact-action'} onClick={() => progress[exercise.id] ? toggle(exercise.id) : exercise.kind === 'timer' ? setCardio(exercise) : setSets(exercise)}>{progress[exercise.id] ? <CheckCircle2 size={14} /> : exercise.kind === 'timer' ? <TimerReset size={14} /> : null}<span>{progress[exercise.id] ? 'Готово' : exercise.kind === 'timer' ? 'Засечь время' : 'Начать подходы'}</span></button></div><button className="compact-info" onClick={() => setInfo(exercise)} aria-label="Информация об упражнении"><Info size={18} /></button></article>)}</section></main>{info && <ExerciseInfoSheet exercise={info} onClose={() => setInfo(null)} />}{sets && <SetModal exercise={sets} onDone={() => toggle(sets.id)} onClose={() => setSets(null)} />}{cardio && <CardioModal exercise={cardio} onDone={() => { toggle(cardio.id); setCardio(null) }} onClose={() => setCardio(null)} />}</>
}

function WorkoutPageWithPreparation({ workout, progress, toggle }: { workout: Workout; progress: ProgressState; toggle: (id: string) => void }) {
  const navigate = useNavigate()
  const [warmedUp, setWarmedUp] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  return <>
    <CompactWorkoutPage
      workout={workout}
      progress={progress}
      toggle={toggle}
      onStart={() => {
        void workoutRepository.create(workout.id, buildSessionExercises(workout)).then(() => {
          navigate(`/active/${workout.id}`)
        })
      }}
    />
    {warmedUp && <button className="guide-fab" onClick={() => setGuideOpen(true)} aria-label="Открыть гайд"><Info size={18} /><span>Гайд</span></button>}
    {!warmedUp && <WarmupSheet workoutId={workout.id} onComplete={() => setWarmedUp(true)} />}
    {guideOpen && <TrainingGuide onClose={() => setGuideOpen(false)} />}
  </>
}

function LegacyProgressPage({ progress }: { progress: ProgressState }) { const [sessions, setSessions] = useState<Awaited<ReturnType<typeof workoutRepository.listCompleted>>>([]); useEffect(() => { void workoutRepository.listCompleted().then(setSessions) }, []); const completed = Object.values(progress).filter(Boolean).length; const totalSets = sessions.reduce((sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.filter((set) => set.completed).length, 0), 0); return <><main className="page"><header className="page-header"><h1>Прогресс</h1><p>Твоя работа, сохранённая локально</p></header><div className="stats-grid"><div className="stat-card"><strong>{sessions.length}</strong><span>Тренировок завершено</span></div><div className="stat-card"><strong>{totalSets || completed}</strong><span>Подходов выполнено</span></div></div><h2 className="section-title">История</h2>{sessions.length ? <section className="progress-list">{sessions.slice().reverse().map((session) => <div className="progress-row" key={session.id}><div className="progress-letter">{session.workoutId}</div><div><strong>Тренировка {session.workoutId}</strong><span>{new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(session.finishedAt ?? session.startedAt)}</span></div></div>)}</section> : <div className="progress-note"><Activity size={18} /><span>Пока нет завершённых тренировок. После первой тренировки здесь появится история.</span></div>}</main><BottomNav /></> }

function ProgressPage() {
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof workoutRepository.listCompleted>>>([])
  useEffect(() => { void workoutRepository.listCompleted().then(setSessions) }, [])
  const now = Date.now()
  const weekStart = now - 7 * 24 * 60 * 60 * 1000
  const totalSets = sessions.reduce((sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.filter((set) => set.completed).length, 0), 0)
  const weeklyCount = sessions.filter((session) => (session.finishedAt ?? session.startedAt) >= weekStart).length
  const records = new Map<string, { name: string; weight: number; reps?: number }>()
  sessions.forEach((session) => session.exercises.forEach((exerciseSession) => {
    const exercise = workoutById(session.workoutId)?.exercises.find((item) => item.id === exerciseSession.exerciseId)
    if (!exercise) return
    exerciseSession.sets.filter((set) => set.completed && typeof set.weight === 'number').forEach((set) => {
      const current = records.get(exercise.id)
      if (!current || set.weight! > current.weight) records.set(exercise.id, { name: exercise.name, weight: set.weight!, reps: set.reps })
    })
  }))
  const formatDuration = (session: (typeof sessions)[number]) => {
    const seconds = Math.max(0, Math.floor(((session.finishedAt ?? session.startedAt) - session.startedAt) / 1000))
    return `${Math.floor(seconds / 3600)} ч ${String(Math.floor(seconds / 60) % 60).padStart(2, '0')} мин`
  }
  const formatDate = (timestamp: number) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(timestamp)
  return <><main className="page"><header className="page-header"><h1>Прогресс</h1><p>Твоя работа, сохранённая локально</p></header><div className="stats-grid"><div className="stat-card"><strong>{sessions.length}</strong><span>Тренировок завершено</span></div><div className="stat-card"><strong>{weeklyCount}</strong><span>За последние 7 дней</span></div><div className="stat-card"><strong>{totalSets}</strong><span>Подходов выполнено</span></div></div>{records.size > 0 && <><h2 className="section-title">Личные рекорды</h2><section className="progress-list">{Array.from(records.values()).slice(0, 4).map((record) => <div className="progress-row" key={record.name}><div className="progress-letter"><Dumbbell size={16} /></div><div><strong>{record.name}</strong><span>Лучший вес: {record.weight} кг{record.reps !== undefined ? ` × ${record.reps}` : ''}</span></div></div>)}</section></>}<h2 className="section-title">История</h2>{sessions.length ? <section className="progress-list">{sessions.slice().sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt)).map((session) => { const exerciseCount = session.exercises.filter((exercise) => exercise.status === 'completed').length; const sets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length, 0); return <div className="progress-row" key={session.id}><div className="progress-letter">{session.workoutId}</div><div><strong>Тренировка {session.workoutId}</strong><span>{formatDate(session.finishedAt ?? session.startedAt)} · {formatDuration(session)}</span><small>{exerciseCount} упражнений · {sets} подходов</small></div></div>})}</section> : <div className="progress-note"><Activity size={18} /><span>Пока нет завершённых тренировок. После первой тренировки здесь появится история.</span></div>}</main><BottomNav /></>
}
function SettingsPage({ progress, clear }: { progress: ProgressState; clear: () => void }) {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [resetOpen, setResetOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [importPreview, setImportPreview] = useState<{ sessions: Awaited<ReturnType<typeof workoutRepository.listAll>>; settings: SettingsType } | null>(null)
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => { void settingsRepository.get().then(setSettings).finally(() => setLoading(false)) }, [])

  const save = async (next: SettingsType) => {
    setSettings(next)
    await settingsRepository.save(next)
  }

  const update = (key: keyof SettingsType) => { void save({ ...settings, [key]: !settings[key] }) }
  const toggleNotifications = async () => {
    if (settings.notifications) return save({ ...settings, notifications: false })
    if (!('Notification' in window)) { setNotice('Уведомления не поддерживаются этим браузером'); return }
    const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission
    if (permission === 'granted') await save({ ...settings, notifications: true })
    else setNotice(permission === 'denied' ? 'Доступ к уведомлениям запрещён в браузере' : 'Уведомления не включены')
  }
  const toggleWakeLock = () => {
    if (!('wakeLock' in navigator)) { setNotice('Не гасить экран не поддерживается этим браузером'); return }
    update('keepScreenAwake')
  }
  const exportData = async () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), sessions: await workoutRepository.listAll(), settings }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fitness-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
  const readImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as { version?: unknown; sessions?: unknown; settings?: unknown }
      if (parsed.version !== 1 || !Array.isArray(parsed.sessions) || !parsed.settings || parsed.sessions.some((session) => !session || typeof session !== 'object' || !('id' in session) || !('status' in session) || !('workoutId' in session))) throw new Error('invalid')
      const importedSettings = { ...DEFAULT_SETTINGS, ...(parsed.settings as Partial<SettingsType>) }
      setImportPreview({ sessions: parsed.sessions as Awaited<ReturnType<typeof workoutRepository.listAll>>, settings: importedSettings })
    } catch {
      setNotice('Не удалось прочитать этот backup-файл')
    }
  }
  const applyImport = async () => {
    if (!importPreview) return
    await workoutRepository.importSessions(importPreview.sessions)
    await save(importPreview.settings)
    setImportPreview(null)
    setNotice('Данные импортированы')
  }

  return <><main className="page settings-page"><header className="page-header"><h1>Настройки</h1><p>Настрой Workout под себя</p></header><section className="settings-group"><h2>Таймер</h2>{([['sound', 'Звук таймера', settings.sound ? <Volume2 size={19} /> : <VolumeX size={19} />, 'Сигнал после завершения отдыха'], ['vibration', 'Вибрация', <Zap size={19} />, 'Тактильный сигнал на телефоне'], ['notifications', 'Уведомления', <Bell size={19} />, 'Сообщение после завершения отдыха']] as const).map(([key, label, icon, description]) => <button className="setting-row" key={key} onClick={() => key === 'notifications' ? void toggleNotifications() : update(key)} disabled={loading}><span className="setting-icon">{icon}</span><span><strong>{label}</strong><small>{description}</small></span><i className={settings[key] ? 'switch on' : 'switch'} /></button>)}<button className="setting-row" onClick={() => update('autoRest')} disabled={loading}><span className="setting-icon"><TimerReset size={19} /></span><span><strong>Автоматический отдых</strong><small>Запускать паузу после подхода</small></span><i className={settings.autoRest ? 'switch on' : 'switch'} /></button><label className="setting-select-row"><span><strong>Отдых по умолчанию</strong><small>Используется, если у упражнения нет своего значения</small></span><select value={settings.defaultRestSeconds} onChange={(event) => void save({ ...settings, defaultRestSeconds: Number(event.target.value) })}>{[60, 90, 120, 180, 240].map((seconds) => <option key={seconds} value={seconds}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</option>)}</select></label></section><section className="settings-group"><h2>Интерфейс</h2><button className="setting-row" onClick={() => toggleWakeLock()} disabled={loading}><span className="setting-icon"><Dumbbell size={19} /></span><span><strong>Не гасить экран во время тренировки</strong><small>{'wakeLock' in navigator ? 'Работает только в активной тренировке' : 'Не поддерживается этим браузером'}</small></span><i className={settings.keepScreenAwake ? 'switch on' : 'switch'} /></button><button className="setting-row" onClick={() => update('animations')} disabled={loading}><span className="setting-icon"><Settings size={19} /></span><span><strong>Анимации</strong><small>Переходы и декоративные эффекты</small></span><i className={settings.animations ? 'switch on' : 'switch'} /></button><div className="unit-control"><span><strong>Единицы веса</strong><small>Внутри приложения вес хранится в килограммах</small></span><div><button className={settings.weightUnit === 'kg' ? 'unit-button active' : 'unit-button'} onClick={() => void save({ ...settings, weightUnit: 'kg' })}>кг</button><button className={settings.weightUnit === 'lb' ? 'unit-button active' : 'unit-button'} onClick={() => void save({ ...settings, weightUnit: 'lb' })}>lb</button></div></div></section>{notice && <p className="settings-notice" role="status">{notice}</p>}<section className="settings-group settings-data"><h2>Данные</h2><p>Данные хранятся на этом устройстве. Очистка данных браузера может удалить историю.</p><button className="clear-button" onClick={() => setResetOpen(true)}><RotateCcw size={18} /><span><strong>Сбросить прогресс</strong><small>{Object.values(progress).filter(Boolean).length} отмеченных упражнений</small></span></button><button className="data-action" onClick={() => void exportData()}><Download size={17} /><span>Экспортировать данные</span></button><button className="data-action" onClick={() => importInput.current?.click()}><Upload size={17} /><span>Импортировать данные</span></button><input ref={importInput} hidden type="file" accept=".json,application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void readImport(file); event.target.value = '' }} /></section></main><BottomNav />{resetOpen && <div className="settings-dialog-backdrop"><section className="settings-dialog" role="dialog" aria-modal="true"><h2>Удалить весь прогресс?</h2><p>Будут удалены история тренировок, веса, повторения и активная тренировка.</p><div><button className="secondary-button" onClick={() => setResetOpen(false)}>Отмена</button><button className="danger-button" onClick={() => { setResetOpen(false); void clear() }}>Удалить</button></div></section></div>}{importPreview && <div className="settings-dialog-backdrop"><section className="settings-dialog" role="dialog" aria-modal="true"><h2>Импортировать данные?</h2><p>Найдено тренировок: {importPreview.sessions.length}. Настройки приложения тоже будут восстановлены.</p><div><button className="secondary-button" onClick={() => setImportPreview(null)}>Отмена</button><button className="primary-button" onClick={() => void applyImport()}>Импортировать</button></div></section></div>}</> }

function App() { const { progress, toggle, clear } = useProgress(); const location = useLocation(); const activeMatch = location.pathname.match(/^\/active\/([ABC])$/); if (activeMatch) { const workout = workoutById(activeMatch[1] as WorkoutId); if (workout) return <ActiveWorkoutRoute workout={workout} /> } const match = location.pathname.match(/^\/workout\/([ABC])$/); if (match) { const workout = workoutById(match[1] as WorkoutId); if (workout) return <WorkoutPageWithPreparation workout={workout} progress={progress} toggle={toggle} /> } if (location.pathname === '/progress') return <ProgressPage />; if (location.pathname === '/settings') return <SettingsPage progress={progress} clear={clear} />; return <HomePage /> }

createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>)
