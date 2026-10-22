export type LessonRewardInput = {
  completedLessonIds: number[]
  lessonId: number
  correctAnswers: number
  totalQuestions: number
  activityXp: number
  currentTodayXp: number
  todayDate: string
  activityDate: string
  lastStudyDate: string | null
  streak: number
}

export type LessonRewardResult = {
  xpEarned: number
  streak: number
  isReplay: boolean
  completedLessonIds: number[]
  todayXp: number
}

export function dateKey(date = new Date(), timeZone?: string): string {
  if (!timeZone) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function previousDateKey(dateKeyValue: string): string {
  const [year, month, day] = dateKeyValue.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day - 1))
  return date.toISOString().slice(0, 10)
}

export function calculateLessonReward(input: LessonRewardInput): LessonRewardResult {
  const isReplay = input.completedLessonIds.includes(input.lessonId)
  const xpEarned = isReplay ? 0 : Math.max(0, input.correctAnswers * 10) + (input.correctAnswers === input.totalQuestions ? 10 : 0)
  const completedLessonIds = isReplay ? input.completedLessonIds : [...input.completedLessonIds, input.lessonId]

  let streak = input.streak
  if (!isReplay) {
    if (input.lastStudyDate === input.activityDate) {
      streak = input.streak
    } else if (input.lastStudyDate === previousDateKey(input.activityDate)) {
      streak = input.streak + 1
    } else {
      streak = 1
    }
  }

  return {
    xpEarned,
    streak,
    isReplay,
    completedLessonIds,
    todayXp: input.todayDate === input.activityDate ? input.currentTodayXp + xpEarned : xpEarned,
  }
}
