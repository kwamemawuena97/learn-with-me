import { describe, expect, it } from 'vitest'
import { calculateLessonReward, previousDateKey } from './progress'

describe('lesson reward rules', () => {
  const base = {
    completedLessonIds: [], lessonId: 1, correctAnswers: 4, totalQuestions: 5,
    activityXp: 40, currentTodayXp: 0, todayDate: '2026-10-22', activityDate: '2026-10-22',
    lastStudyDate: null, streak: 0,
  }

  it('awards base XP for a first completion and one streak day', () => {
    const result = calculateLessonReward(base)
    expect(result.xpEarned).toBe(40)
    expect(result.streak).toBe(1)
    expect(result.completedLessonIds).toEqual([1])
  })

  it('awards a perfect lesson bonus and never farms replay XP', () => {
    const perfect = calculateLessonReward({ ...base, correctAnswers: 5, activityXp: 60 })
    expect(perfect.xpEarned).toBe(60)
    const replay = calculateLessonReward({ ...base, completedLessonIds: [1], streak: 2, lastStudyDate: '2026-10-22' })
    expect(replay.xpEarned).toBe(0)
    expect(replay.isReplay).toBe(true)
    expect(replay.streak).toBe(2)
  })

  it('keeps the streak stable for repeated activity on the same day', () => {
    const result = calculateLessonReward({ ...base, completedLessonIds: [], lastStudyDate: '2026-10-22', streak: 5 })
    expect(result.streak).toBe(5)
  })

  it('increments for consecutive days and resets after a missed day', () => {
    const consecutive = calculateLessonReward({ ...base, lastStudyDate: '2026-10-21', streak: 5 })
    expect(consecutive.streak).toBe(6)
    const missed = calculateLessonReward({ ...base, lastStudyDate: '2026-10-19', streak: 5 })
    expect(missed.streak).toBe(1)
  })

  it('rolls today XP over when the activity date changes', () => {
    const result = calculateLessonReward({ ...base, todayDate: '2026-10-21', currentTodayXp: 30 })
    expect(result.todayXp).toBe(40)
  })

  it('calculates the UTC-style previous calendar date', () => {
    expect(previousDateKey('2026-01-01')).toBe('2025-12-31')
  })
})
