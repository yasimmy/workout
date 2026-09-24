export type ExerciseMedia = { videoId: string; videoTitle: string; youtubeUrl: string }

const media = (videoId: string, videoTitle: string): ExerciseMedia => ({ videoId, videoTitle, youtubeUrl: `https://www.youtube.com/watch?v=${videoId}` })

export const exerciseMedia: Record<string, ExerciseMedia> = {
  'bench-press': media('vcBig73ojpE', 'Barbell Bench Press Technique'),
  'incline-dumbbell': media('8iPEnn-ltC8', 'Incline Dumbbell Press Technique'),
  'cable-fly': media('eozdVDA78K0', 'Cable Chest Fly Technique'),
  'lateral-raise': media('3VcKaHpzqRo', 'Dumbbell Lateral Raise Technique'),
  'cable-pushdown': media('2-LAMcpzODU', 'Cable Triceps Pushdown Technique'),
  'overhead-extension': media('nRi4k1VfVqE', 'Overhead Cable Triceps Extension Technique'),
  'pull-up': media('eGo4IYlbE5g', 'Pull Up Technique'),
  'seated-row': media('GZbfZ033f74', 'Seated Cable Row Technique'),
  'lat-pulldown': media('CAwf7n6Luuc', 'Lat Pulldown Technique'),
  'reverse-fly': media('EA7u4Q_8HQ0', 'Reverse Pec Deck Technique'),
  'barbell-curl': media('kwG2ipFRgfo', 'EZ Bar Curl Technique'),
  'hammer-curl': media('zC3nLlEvin4', 'Dumbbell Hammer Curl Technique'),
  'back-squat': media('ultWZbUMPL8', 'Barbell Back Squat Technique'),
  'romanian-deadlift': media('JCXUYuzwNrM', 'Romanian Deadlift Technique'),
  'leg-press': media('IZxyjW7MPJQ', 'Leg Press Technique'),
  'leg-curl': media('Orxowest56U', 'Leg Curl Technique'),
  'calf-raise': media('gwLzBJYoWlI', 'Standing Calf Raise Technique'),
  'seated-press': media('qEwKCR5JCog', 'Seated Dumbbell Shoulder Press Technique'),
  'cable-lateral-raise': media('3VcKaHpzqRo', 'Dumbbell Lateral Raise Technique'),
  'cable-crunch': media('2fbujeHfF1M', 'Cable Crunch Technique')
}

export const getExerciseMedia = (id: string) => exerciseMedia[id]
