export type ExerciseAsset = { muscleImage?: string; imagePosition?: string }

const path = (folder: string, file: string) => `/img/${folder}/${encodeURIComponent(file)}`

export const exerciseAssets: Record<string, ExerciseAsset> = {
  'bench-press': { muscleImage: path('Trenirovka A', 'Жим штанги лёжа.png'), imagePosition: '50% 50%' },
  'incline-dumbbell': { muscleImage: path('Trenirovka A', 'Жим гантелей на наклонной скамье.png') },
  'cable-fly': { muscleImage: path('Trenirovka A', 'Сведение рук в кроссовере.png') },
  'lateral-raise': { muscleImage: path('Trenirovka A', 'Подъём гантелей в стороны.png') },
  'cable-pushdown': { muscleImage: path('Trenirovka A', 'Разгибание рук на верхнем блоке.png') },
  'overhead-extension': { muscleImage: path('Trenirovka A', 'Разгибание рук из-за головы на блоке.png') },
  'pull-up': { muscleImage: path('Trenirovka B', 'Подтягивания.png') },
  'seated-row': { muscleImage: path('Trenirovka B', 'Тяга горизонтального блока.png') },
  'lat-pulldown': { muscleImage: path('Trenirovka B', 'Тяга верхнего блока.png') },
  'reverse-fly': { muscleImage: path('Trenirovka B', 'Обратная бабочка-разведение на заднюю дельту.png') },
  'barbell-curl': { muscleImage: path('Trenirovka B', 'Сгибание рук со штангой-EZ-грифом.png') },
  'hammer-curl': { muscleImage: path('Trenirovka B', 'Молотковые сгибания.png') },
  'back-squat': { muscleImage: path('Trenirovka C', 'Присед со штангой.png') },
  'romanian-deadlift': { muscleImage: path('Trenirovka C', 'Румынская тяга.png') },
  'leg-press': { muscleImage: path('Trenirovka C', 'Жим ногами.png') },
  'leg-curl': { muscleImage: path('Trenirovka C', 'Сгибание ног в тренажёре.png') },
  'calf-raise': { muscleImage: path('Trenirovka C', 'Подъёмы на носки.png') },
  'seated-press': { muscleImage: path('Trenirovka C', 'Жим гантелей сидя.png') },
  'cable-lateral-raise': { muscleImage: path('Trenirovka C', 'Подъёмы гантелей в стороны.png') },
  'cable-crunch': { muscleImage: path('Trenirovka C', 'Скручивания на блоке.png') }
}

export const getExerciseAsset = (id: string) => exerciseAssets[id]
