import type { Course, CurriculumLesson, Exercise } from './curriculum'
import { isAcceptedAnswer } from './curriculum'

export type CompatibleQuestion = {
  prompt: string
  hint: string
  options: string[]
  answer: string
  acceptedAnswers?: string[]
  exerciseType?: Exercise['type']
  explanation: string
}

export type CompatibleLesson = {
  id: number
  courseLevel: 'A1' | 'A2'
  title: string
  subtitle: string
  unit: string
  emoji: string
  questions: CompatibleQuestion[]
}

const unitEmojis = ['👋', '💬', '🧩', '🗺️', '🛍️', '💬']

export function exerciseToQuestion(exercise: Exercise): CompatibleQuestion {
  const answer = exercise.correctAnswer ?? exercise.acceptedAnswers?.[0] ?? ''
  return {
    prompt: exercise.prompt,
    hint: exercise.hint ?? exercise.instruction,
    options: exercise.options ?? [],
    answer,
    acceptedAnswers: exercise.acceptedAnswers,
    exerciseType: exercise.type,
    explanation: exercise.explanation,
  }
}

export function validateLessonAnswer(answer: string, question: CompatibleQuestion): boolean {
  if (!question.exerciseType || question.exerciseType === 'multiple-choice' || question.options.length > 0) {
    return answer === question.answer
  }
  return isAcceptedAnswer(answer, {
    type: question.exerciseType,
    instruction: '',
    prompt: question.prompt,
    acceptedAnswers: question.acceptedAnswers,
    correctAnswer: question.answer,
    explanation: question.explanation,
  })
}

export function flattenA1Course(course: Course): CompatibleLesson[] {
  return course.units.flatMap((unit, unitIndex) =>
    unit.lessons.map((lesson: CurriculumLesson, lessonIndex) => ({
      id: unitIndex * 10 + lessonIndex + 1,
      courseLevel: 'A1' as const,
      title: lesson.title,
      subtitle: unit.title,
      unit: unit.title,
      emoji: unitEmojis[unitIndex] ?? '📚',
      questions: lesson.exercises.map(exerciseToQuestion),
    }))
  )
}
