import { describe, expect, it } from 'vitest'
import { englishA1Course, isAcceptedAnswer, normalizeFreeText } from './curriculum'

describe('curriculum utilities', () => {
  it('normalizes whitespace, punctuation spacing, and capitalization', () => {
    expect(normalizeFreeText('  My   NAME  is Ama!  ')).toBe("my name is ama!")
    expect(normalizeFreeText("I'm ready")).toBe("i'm ready")
  })

  it('accepts a matching fill-in-the-blank answer only', () => {
    const exercise = { type: 'fill-in-the-blank' as const, instruction: '', prompt: '', acceptedAnswers: ['name'], explanation: '' }
    expect(isAcceptedAnswer(' Name ', exercise)).toBe(true)
    expect(isAcceptedAnswer('book', exercise)).toBe(false)
  })

  it('matches an exact multiple-choice answer after normalization', () => {
    const exercise = { type: 'multiple-choice' as const, instruction: '', prompt: '', correctAnswer: 'I am fine, thanks.', explanation: '' }
    expect(isAcceptedAnswer('i am fine, thanks', exercise)).toBe(false)
    expect(isAcceptedAnswer('I am fine, thanks.', exercise)).toBe(true)
  })

  it('exports a published A1 course with sequenced units and objectives', () => {
    expect(englishA1Course.published).toBe(true)
    expect(englishA1Course.level).toBe('A1')
    expect(englishA1Course.units.map(unit => unit.sequence)).toEqual([1, 2, 3, 4, 5, 6])
    expect(englishA1Course.units.every(unit => unit.lessons.length > 0)).toBe(true)
    const lessons = englishA1Course.units.flatMap(unit => unit.lessons)
    expect(lessons).toHaveLength(18)
    expect(new Set(lessons.map(lesson => lesson.id)).size).toBe(18)
    expect(lessons.every(lesson => lesson.objectives.length > 0)).toBe(true)
    expect(lessons.flatMap(lesson => lesson.exercises).every(exercise => {
      return exercise.correctAnswer !== undefined || (exercise.acceptedAnswers?.length ?? 0) > 0
    })).toBe(true)
  })
})
