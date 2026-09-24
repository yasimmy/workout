export const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
export const vibrate = (pattern: number | number[]) => { if ('vibrate' in navigator) navigator.vibrate(pattern) }
