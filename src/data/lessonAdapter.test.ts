import { describe, expect, it } from 'vitest'
import { englishA1Course } from './curriculum'
import { exerciseToQuestion, flattenA1Course, validateLessonAnswer } from './lessonAdapter'

describe('structured lesson adapter', () => {
  it('flattens every A1 lesson to a unique compatible numeric ID', () => {
    const lessons = flattenA1Course(englishA1Course)
    expect(lessons).toHaveLength(18)
    expect(new Set(lessons.map(lesson => lesson.id)).size).toBe(18)
  })

  it('maps exercise metadata into the existing question shape', () => {
    const exercise = englishA1Course.units[0].lessons[0].exercises[0]
    const question = exerciseToQuestion(exercise)
    expect(question.answer).toBe('Hello')
    expect(question.options).toContain('Hello')
    expect(question.exerciseType).toBe('multiple-choice')
  })

  it('validates multiple-choice answers strictly', () => {
    const question = exerciseToQuestion(englishA1Course.units[0].lessons[0].exercises[0])
    expect(validateLessonAnswer('Hello', question)).toBe(true)
    expect(validateLessonAnswer('hello', question)).toBe(false)
  })

  it('normalizes fill-in-the-blank answers for spacing and casing', () => {
    const exercise = englishA1Course.units[0].lessons[1].exercises[0]
    const question = exerciseToQuestion(exercise)
    expect(validateLessonAnswer('  NAME  ', question)).toBe(true)
    expect(validateLessonAnswer('book', question)).toBe(false)
  })
})
