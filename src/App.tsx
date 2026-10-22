import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { type User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { parseTutorReply, tutorLevelFromXp, tutorLevelName, tutorStarterPrompts, type TutorReply, type TutorTurn } from './lib/tutor'
import {
  BookOpen, Flame, Heart, Home, Trophy, UserRound, Zap, ChevronRight,
  Check, X, LockKeyhole, RotateCcw, Target, Sparkles, Menu, Volume2, ChevronDown,
  ChartNoAxesCombined, Award, Clock3, MessageCircle, Send
} from 'lucide-react'

type Question = {
  prompt: string
  hint: string
  options: string[]
  answer: string
  explanation: string
}
type Lesson = {
  id: number
  courseLevel: 'A1' | 'A2'
  title: string
  subtitle: string
  unit: string
  emoji: string
  questions: Question[]
}
type Progress = {
  xp: number
  streak: number
  lastStudyDate: string | null
  completedLessons: number[]
  totalAnswered: number
  totalCorrect: number
  answerStreak: number
  dailyGoal: number
  todayXp: number
  todayDate: string
  activityByDate: Record<string, number>
}
type View = 'learn' | 'tutor' | 'quests' | 'profile'
type TutorMessage = {
  id: string
  role: 'user' | 'assistant'
  text?: string
  reply?: TutorReply
}

const lessons: Lesson[] = [
  {
    id: 1, courseLevel: 'A1', title: 'Hello, there!', subtitle: 'Greetings and introductions', unit: 'Unit 1 · Basics', emoji: '👋',
    questions: [
      { prompt: 'What is a friendly way to greet someone?', hint: 'Use this when you meet a person.', options: ['Goodbye', 'Hello', 'Sorry', 'Maybe'], answer: 'Hello', explanation: '“Hello” is a common greeting when you meet someone.' },
      { prompt: 'Complete the introduction: “My ___ is Ama.”', hint: 'You use it to identify yourself.', options: ['name', 'house', 'happy', 'hello'], answer: 'name', explanation: 'We say “My name is…” when introducing ourselves.' },
      { prompt: 'Which phrase means you are pleased to meet someone?', hint: 'A polite phrase for a first meeting.', options: ['See you later', 'I am hungry', 'Nice to meet you', 'I do not know'], answer: 'Nice to meet you', explanation: '“Nice to meet you” is a polite expression used when meeting someone for the first time.' },
      { prompt: 'Choose the correct response: “How are you?”', hint: 'A simple answer about how you feel.', options: ['I am fine, thanks.', 'My name is book.', 'Good night yesterday.', 'I am a window.'], answer: 'I am fine, thanks.', explanation: '“I am fine, thanks” is a natural response to “How are you?”' },
      { prompt: 'Which is the best way to end a conversation?', hint: 'You may say this when leaving.', options: ['Hello!', 'Goodbye!', 'Thank you for your name.', 'How old is hello?'], answer: 'Goodbye!', explanation: '“Goodbye” is a common way to say farewell.' },
    ],
  },
  {
    id: 2, courseLevel: 'A1', title: 'Everyday words', subtitle: 'Useful words for daily life', unit: 'Unit 1 · Basics', emoji: '💬',
    questions: [
      { prompt: 'Which word names something you drink?', hint: 'You may drink it when thirsty.', options: ['Water', 'Chair', 'Window', 'Road'], answer: 'Water', explanation: 'Water is a drink essential for life.' },
      { prompt: 'Choose the opposite of “big”.', hint: 'A word that means not large.', options: ['Tall', 'Small', 'Wide', 'Long'], answer: 'Small', explanation: '“Small” is the opposite of “big”.' },
      { prompt: 'Complete: “Please ___ me.”', hint: 'Use this when asking someone to give attention.', options: ['listen to', 'blue', 'table', 'quickly is'], answer: 'listen to', explanation: '“Please listen to me” is a polite request for attention.' },
      { prompt: 'Which word describes a person who is not late?', hint: 'The opposite of late.', options: ['Early', 'Empty', 'Heavy', 'Quietly'], answer: 'Early', explanation: '“Early” means before the expected time.' },
      { prompt: 'What does “thank you” express?', hint: 'Say it when someone helps you.', options: ['Gratitude', 'Anger', 'Confusion', 'Sleepiness'], answer: 'Gratitude', explanation: 'We say “thank you” to show appreciation.' },
    ],
  },
  {
    id: 3, courseLevel: 'A1', title: 'Build a sentence', subtitle: 'Put words in the right order', unit: 'Unit 2 · Sentences', emoji: '🧩',
    questions: [
      { prompt: 'Choose the correct sentence.', hint: 'A person + action + object.', options: ['Eat I rice.', 'I eat rice.', 'Rice I eat am.', 'I rice eat the.'], answer: 'I eat rice.', explanation: 'A simple English sentence often follows subject + verb + object.' },
      { prompt: 'Complete: “She ___ a student.”', hint: 'Use the correct form of “be”.', options: ['are', 'am', 'is', 'be'], answer: 'is', explanation: 'Use “is” with he, she, or it in the present tense.' },
      { prompt: 'Which word makes this a question: “___ you ready?”', hint: 'Use the form of “be” for “you”.', options: ['Is', 'Are', 'Am', 'Be'], answer: 'Are', explanation: '“Are you ready?” is the correct question form.' },
      { prompt: 'Choose the correct plural of “book”.', hint: 'More than one book.', options: ['Bookes', 'Books', 'Bookies', 'Book'], answer: 'Books', explanation: 'Most English nouns form the plural by adding “s”.' },
      { prompt: 'Complete: “They ___ playing football.”', hint: 'Plural subject + present continuous.', options: ['is', 'am', 'are', 'be'], answer: 'are', explanation: 'Use “are” with “they”: “They are playing football.”' },
    ],
  },
  {
    id: 4, courseLevel: 'A1', title: 'At the market', subtitle: 'Prices, requests, and shopping', unit: 'Unit 2 · Sentences', emoji: '🛍️',
    questions: [
      { prompt: 'Which is a polite way to ask the price?', hint: 'Ask how much something costs.', options: ['How much is this?', 'Where am I?', 'Who are prices?', 'How many old?'], answer: 'How much is this?', explanation: '“How much is this?” is a common way to ask the price.' },
      { prompt: 'Complete: “I would ___ some oranges.”', hint: 'A polite way to express what you want.', options: ['like', 'likes', 'liking', 'liked be'], answer: 'like', explanation: '“I would like…” is a polite way to make a request.' },
      { prompt: 'What does “cheap” mean?', hint: 'It describes a low price.', options: ['Costing little money', 'Very far away', 'Difficult to hear', 'Very heavy'], answer: 'Costing little money', explanation: 'Something cheap costs relatively little money.' },
      { prompt: 'Choose the correct question.', hint: 'Ask for two items.', options: ['Can I have two, please?', 'Can I has two?', 'I can two please?', 'Have I can two?'], answer: 'Can I have two, please?', explanation: '“Can I have…?” is a polite way to ask for something.' },
      { prompt: 'What should you say after receiving help?', hint: 'Show appreciation.', options: ['Thank you.', 'Never mind you.', 'How much thanks?', 'Good morning yesterday.'], answer: 'Thank you.', explanation: '“Thank you” expresses appreciation.' },
    ],
  },
  {
    id: 5, courseLevel: 'A2', title: 'Yesterday and last weekend', subtitle: 'Talk about past events', unit: 'Unit 3 · Past experiences', emoji: '🗓️',
    questions: [
      { prompt: 'Yesterday, Maya ___ her aunt.', hint: 'Use the past form of “visit”.', options: ['visit', 'visited', 'visits', 'visiting'], answer: 'visited', explanation: 'Add -ed to most regular verbs to talk about a finished past event: “Maya visited her aunt.”' },
      { prompt: 'I went to the beach ___ Sunday.', hint: 'Choose a phrase for the most recent Sunday.', options: ['next', 'every', 'last', 'since'], answer: 'last', explanation: 'Use “last” with a finished time period: “last Sunday”.' },
      { prompt: 'Did you ___ the new museum?', hint: 'After “did”, use the base form of the verb.', options: ['saw', 'seeing', 'see', 'seen'], answer: 'see', explanation: 'Questions with “did” use the base verb: “Did you see…?”' },
      { prompt: 'They didn’t ___ dinner at home.', hint: 'After “didn’t”, use the base form.', options: ['ate', 'eating', 'eats', 'eat'], answer: 'eat', explanation: 'Use the base verb after “didn’t”: “They didn’t eat dinner at home.”' },
      { prompt: 'We ___ a wonderful time on our trip.', hint: 'The past form of “have” is irregular.', options: ['have', 'has', 'had', 'having'], answer: 'had', explanation: '“Had” is the past form of “have”.' },
    ],
  },
  {
    id: 6, courseLevel: 'A2', title: 'Making plans', subtitle: 'Invitations and future arrangements', unit: 'Unit 3 · Past experiences', emoji: '📅',
    questions: [
      { prompt: 'We ___ our friends at six tonight.', hint: 'Use the present continuous for a planned arrangement.', options: ['meet', 'are meeting', 'met', 'meets'], answer: 'are meeting', explanation: 'The present continuous can describe a confirmed future arrangement.' },
      { prompt: 'I bought flour because I’m ___ a cake.', hint: 'Use “going to” for an intention.', options: ['bake', 'baked', 'going to bake', 'bakes'], answer: 'going to bake', explanation: 'Use “be going to” to talk about an intention or plan.' },
      { prompt: 'Would you like to ___ for coffee tomorrow?', hint: 'An invitation is followed by “to” and a base verb.', options: ['meet', 'met', 'meeting', 'meets'], answer: 'meet', explanation: 'Use the base form after “would like to”: “Would you like to meet…?”' },
      { prompt: 'Sorry, I can’t. I ___ my grandparents this evening.', hint: 'This is an arranged visit later today.', options: ['visit', 'visited', 'am visiting', 'have visit'], answer: 'am visiting', explanation: 'The present continuous is natural for a personal arrangement in the near future.' },
      { prompt: 'What ___ you going to do this weekend?', hint: 'Use the correct form of “be” with “you”.', options: ['is', 'are', 'do', 'does'], answer: 'are', explanation: 'The question is “What are you going to do…?”' },
    ],
  },
  {
    id: 7, courseLevel: 'A2', title: 'Getting around town', subtitle: 'Directions and transport', unit: 'Unit 4 · Around town', emoji: '🚌',
    questions: [
      { prompt: 'The train is ___ than the bus.', hint: 'Compare their speed.', options: ['fast', 'faster', 'fastest', 'more fast'], answer: 'faster', explanation: 'Use “-er” with many short adjectives to compare two things.' },
      { prompt: 'How do I get ___ the station?', hint: 'Complete the phrase “get ___ a place”.', options: ['at', 'to', 'on', 'by'], answer: 'to', explanation: 'Use “get to” when asking how to reach a destination.' },
      { prompt: 'The pharmacy is ___ the bank and the bakery.', hint: 'It is in the middle of two places.', options: ['behind', 'between', 'across', 'through'], answer: 'between', explanation: 'Use “between” for a place in the middle of two others.' },
      { prompt: 'This is the ___ route to the airport.', hint: 'Choose the superlative form of “quick”.', options: ['quicker', 'quickest', 'more quick', 'most quicker'], answer: 'quickest', explanation: 'Use “the” + “-est” to compare one thing with a whole group.' },
      { prompt: 'Go straight ahead, then turn ___ at the traffic lights.', hint: 'Choose a direction.', options: ['left', 'early', 'near', 'across'], answer: 'left', explanation: '“Turn left” gives a direction at a junction.' },
    ],
  },
  {
    id: 8, courseLevel: 'A2', title: 'Feeling better', subtitle: 'Health, symptoms, and advice', unit: 'Unit 4 · Around town', emoji: '🩺',
    questions: [
      { prompt: 'I’ve got a headache. You ___ get some rest.', hint: 'Choose a word for gentle advice.', options: ['should', 'shouldn’t', 'mustn’t', 'would'], answer: 'should', explanation: 'Use “should” to give positive advice.' },
      { prompt: 'You ___ eat so many sweets if you feel unwell.', hint: 'Give advice against doing something.', options: ['should', 'shouldn’t', 'can', 'are'], answer: 'shouldn’t', explanation: 'Use “shouldn’t” to say something is not a good idea.' },
      { prompt: 'How ___ water do you drink each day?', hint: '“Water” is uncountable.', options: ['many', 'much', 'few', 'several'], answer: 'much', explanation: 'Use “how much” to ask about an uncountable noun such as water.' },
      { prompt: 'I’m feeling ___ today than yesterday.', hint: 'Compare how you feel on two days.', options: ['good', 'best', 'better', 'well'], answer: 'better', explanation: '“Better” is the comparative form of “good”.' },
      { prompt: 'You should ___ a doctor if the pain continues.', hint: 'Use the base form after “should”.', options: ['seeing', 'saw', 'see', 'sees'], answer: 'see', explanation: 'Use the base verb after “should”: “You should see a doctor.”' },
    ],
  },
]

const courseUnits = [
  { courseLevel: 'A1', label: 'A1 · STARTER', title: 'Start communicating', description: 'Everyday English essentials.', emoji: '🌱' },
  { courseLevel: 'A2', label: 'A2 · NEXT LEVEL', title: 'Everyday conversations', description: 'Past events, plans, directions, and advice.', emoji: '🧭' },
] as const

const STORAGE_KEY = 'linguaquest-progress-v1'
const STORAGE_OWNER_KEY = 'linguaquest-progress-owner-v1'
const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const yesterdayKey = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const initialProgress: Progress = {
  xp: 0, streak: 0, lastStudyDate: null, completedLessons: [], totalAnswered: 0,
  totalCorrect: 0, answerStreak: 0, dailyGoal: 20, todayXp: 0, todayDate: todayKey(), activityByDate: {},
}
function normalizeProgress(value: unknown): Progress {
  const saved = value && typeof value === 'object' ? value as Partial<Progress> : {}
  const parsed: Progress = {
    ...initialProgress,
    ...saved,
    completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons : [],
    activityByDate: saved.activityByDate && typeof saved.activityByDate === 'object' ? saved.activityByDate : {},
  }
  return parsed.todayDate === todayKey() ? parsed : { ...parsed, todayXp: 0, todayDate: todayKey() }
}
function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialProgress
    return normalizeProgress(JSON.parse(raw))
  } catch {
    return initialProgress
  }
}
function levelForXp(xp: number) {
  return Math.floor(xp / 100) + 1
}
function levelProgress(xp: number) {
  return xp % 100
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [user, setUser] = useState<User | null>(null)
  const [cloudReady, setCloudReady] = useState(!supabase)
  const [cloudUserId, setCloudUserId] = useState<string | null>(null)
  const [cloudRefresh, setCloudRefresh] = useState(0)
  const [syncStatus, setSyncStatus] = useState<'local' | 'loading' | 'syncing' | 'synced' | 'error' | 'unconfigured'>(supabase ? 'loading' : 'unconfigured')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([])
  const [tutorDraft, setTutorDraft] = useState('')
  const [tutorBusy, setTutorBusy] = useState(false)
  const [tutorError, setTutorError] = useState('')
  const tutorScrollRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>('learn')
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionAnswered, setSessionAnswered] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showUpcomingLessons, setShowUpcomingLessons] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setAuthError(error.message)
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthError('')
      setAuthMessage('')
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) {
      setCloudReady(true)
      setCloudUserId(null)
      setSyncStatus(supabase ? 'local' : 'unconfigured')
      return
    }
    let active = true
    const userId = user.id
    setCloudReady(false)
    setCloudUserId(null)
    setSyncStatus('loading')
    async function loadCloudProgress() {
      const { data, error } = await supabase!.from('learner_progress').select('progress').eq('user_id', userId).maybeSingle()
      if (!active) return
      if (error) {
        setSyncStatus('error')
        setAuthError(`Could not load cloud progress: ${error.message}`)
        return
      }
      if (data?.progress) {
        const cloudProgress = normalizeProgress(data.progress)
        setProgress(cloudProgress)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudProgress))
        localStorage.setItem(STORAGE_OWNER_KEY, userId)
      } else {
        const storedOwner = localStorage.getItem(STORAGE_OWNER_KEY)
        const localProgress = !storedOwner || storedOwner === userId ? loadProgress() : { ...initialProgress, todayDate: todayKey() }
        setProgress(localProgress)
        const { error: saveError } = await supabase!.from('learner_progress').upsert({ user_id: userId, progress: localProgress })
        if (!active) return
        if (saveError) {
          setSyncStatus('error')
          setAuthError(`Could not create cloud progress: ${saveError.message}`)
          return
        }
        localStorage.setItem(STORAGE_OWNER_KEY, userId)
      }
      setSyncStatus('synced')
      setCloudUserId(userId)
      setCloudReady(true)
    }
    void loadCloudProgress()
    return () => { active = false }
  }, [user?.id, cloudRefresh])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    if (!supabase || !user || !cloudReady || cloudUserId !== user.id) return
    let active = true
    setSyncStatus('syncing')
    const timeout = window.setTimeout(async () => {
      const { error } = await supabase!.from('learner_progress').upsert({
        user_id: user.id,
        progress,
        updated_at: new Date().toISOString(),
      })
      if (!active) return
      setSyncStatus(error ? 'error' : 'synced')
      if (error) setAuthError(`Could not sync progress: ${error.message}`)
      else localStorage.setItem(STORAGE_OWNER_KEY, user.id)
    }, 500)
    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [progress, user?.id, cloudReady, cloudUserId])

  useEffect(() => {
    if (view === 'tutor' && tutorScrollRef.current) {
      tutorScrollRef.current.scrollTop = tutorScrollRef.current.scrollHeight
    }
  }, [view, tutorMessages, tutorBusy])

  const currentLevel = levelForXp(progress.xp)
  const tutorLevel = tutorLevelFromXp(progress.xp)
  const accuracy = progress.totalAnswered ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0
  const doneCount = progress.completedLessons.length
  const firstIncompleteIndex = lessons.findIndex(lesson => !progress.completedLessons.includes(lesson.id))
  const visibleLessonCount = firstIncompleteIndex === -1 ? lessons.length : firstIncompleteIndex + 1
  const visibleLessons = lessons.slice(0, visibleLessonCount)
  const upcomingLessons = lessons.slice(visibleLessonCount)
  const currentCourseLevel = lessons.find(lesson => !progress.completedLessons.includes(lesson.id))?.courseLevel ?? 'A2'
  const goalPercent = Math.min(100, Math.round((progress.todayXp / progress.dailyGoal) * 100))
  const currentQuestion = activeLesson?.questions[questionIndex]
  const weekActivity = useMemo(() => {
    const today = new Date()
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(today.getDate() - mondayOffset)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      return { key, label: date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), xp: progress.activityByDate[key] ?? 0, today: key === todayKey() }
    })
  }, [progress.activityByDate])

  const achievements = useMemo(() => [
    { name: 'First Steps', detail: 'Complete your first lesson', icon: '🌱', earned: doneCount >= 1 },
    { name: 'Word Explorer', detail: 'Complete 3 lessons', icon: '🧭', earned: doneCount >= 3 },
    { name: 'Perfect Practice', detail: 'Get 5 answers right in a row', icon: '🎯', earned: progress.answerStreak >= 5 },
    { name: 'On Fire', detail: 'Build a 3-day streak', icon: '🔥', earned: progress.streak >= 3 },
    { name: 'Century Club', detail: 'Earn 100 XP', icon: '💯', earned: progress.xp >= 100 },
    { name: 'Dedicated Learner', detail: 'Complete all 8 course lessons', icon: '🏆', earned: doneCount >= lessons.length },
  ], [doneCount, progress.answerStreak, progress.streak, progress.xp])

  function beginLesson(lesson: Lesson) {
    setActiveLesson(lesson)
    setQuestionIndex(0)
    setSelected(null)
    setChecked(false)
    setSessionCorrect(0)
    setSessionAnswered(0)
    setSessionXp(0)
    setFinished(false)
  }

  function chooseAnswer(option: string) {
    if (!checked) setSelected(option)
  }

  function submitAnswer() {
    if (!currentQuestion || !selected || checked) return
    setChecked(true)
    const correct = selected === currentQuestion.answer
    setSessionAnswered(v => v + 1)
    setProgress(p => ({
      ...p,
      totalAnswered: p.totalAnswered + 1,
      totalCorrect: p.totalCorrect + (correct ? 1 : 0),
      answerStreak: correct ? p.answerStreak + 1 : 0,
    }))
    if (correct) setSessionCorrect(v => v + 1)
  }

  function awardLesson(xpEarned: number) {
    const today = todayKey()
    setProgress(p => {
      const sameDay = p.lastStudyDate === today
      const streak = sameDay ? p.streak : p.lastStudyDate === yesterdayKey() ? Math.max(1, p.streak + 1) : 1
      const completedLessons = p.completedLessons.includes(activeLesson!.id)
        ? p.completedLessons
        : [...p.completedLessons, activeLesson!.id]
      return {
        ...p,
        xp: p.xp + xpEarned,
        todayXp: (p.todayDate === today ? p.todayXp : 0) + xpEarned,
        todayDate: today,
        streak,
        lastStudyDate: today,
        completedLessons,
        activityByDate: { ...p.activityByDate, [today]: (p.activityByDate[today] ?? 0) + xpEarned },
      }
    })
  }

  function nextQuestion() {
    if (!activeLesson || !currentQuestion) return
    if (questionIndex < activeLesson.questions.length - 1) {
      setQuestionIndex(v => v + 1)
      setSelected(null)
      setChecked(false)
    } else {
      const baseXp = sessionCorrect * 10
      const perfectBonus = sessionCorrect === activeLesson.questions.length ? 10 : 0
      const earned = progress.completedLessons.includes(activeLesson.id) ? 0 : baseXp + perfectBonus
      setSessionXp(earned)
      awardLesson(earned)
      setFinished(true)
    }
  }

  function closeLesson() {
    setActiveLesson(null)
    setFinished(false)
    setView('learn')
  }

  function resetProgress() {
    localStorage.removeItem(STORAGE_KEY)
    setProgress({ ...initialProgress, todayDate: todayKey() })
    setShowReset(false)
    setView('learn')
    setActiveLesson(null)
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setAuthBusy(true)
    setAuthError('')
    setAuthMessage('')
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email: authEmail, password: authPassword })
      : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
    setAuthBusy(false)
    if (result.error) {
      setAuthError(result.error.message)
      return
    }
    if (authMode === 'signup' && !result.data.session) {
      setAuthMessage('Check your email for a confirmation link to finish creating your account.')
    } else {
      setAuthMessage(authMode === 'signup' ? 'Your account is ready.' : 'You are signed in.')
    }
    setAuthPassword('')
  }

  async function sendPasswordReset() {
    if (!supabase || !authEmail) {
      setAuthError('Enter your email address first.')
      return
    }
    setAuthBusy(true)
    setAuthError('')
    setAuthMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail, { redirectTo: window.location.origin })
    setAuthBusy(false)
    if (error) setAuthError(error.message)
    else setAuthMessage('Password reset instructions have been sent to your email.')
  }

  async function handleSignOut() {
    if (!supabase) return
    setAuthBusy(true)
    const { error } = await supabase.auth.signOut()
    setAuthBusy(false)
    if (error) setAuthError(error.message)
    else {
      setAuthMessage('You are signed out. Your local progress remains on this device.')
      setCloudReady(true)
      setSyncStatus('local')
    }
  }

  async function sendTutorMessage(content = tutorDraft) {
    const message = content.trim()
    if (!message || tutorBusy) return
    if (!supabase) {
      setTutorError('AI Tutor needs a configured Supabase project and deployed tutor function.')
      return
    }
    if (!user) {
      setTutorError('Sign in to use the AI Tutor and keep your learning level in sync.')
      return
    }

    const history: TutorTurn[] = []
    for (const turn of tutorMessages.slice(-8)) {
      if (turn.role === 'user' && turn.text) history.push({ role: 'user', content: turn.text })
      if (turn.role === 'assistant' && turn.reply) history.push({ role: 'assistant', content: JSON.stringify(turn.reply) })
    }
    const userTurn: TutorMessage = { id: crypto.randomUUID(), role: 'user', text: message }
    setTutorMessages(items => [...items, userTurn])
    setTutorDraft('')
    setTutorError('')
    setTutorBusy(true)

    const { data, error } = await supabase.functions.invoke('english-tutor', { body: { message, history } })
    setTutorBusy(false)
    if (error) {
      setTutorError(error.message)
      return
    }
    if (data?.error) {
      setTutorError(data.error)
      return
    }
    try {
      const reply = parseTutorReply(JSON.stringify(data?.reply))
      setTutorMessages(items => [...items, { id: crypto.randomUUID(), role: 'assistant', reply }])
    } catch (error) {
      setTutorError(error instanceof Error ? error.message : 'The tutor could not format a reply.')
    }
  }

  if (activeLesson && finished) {
    const total = activeLesson.questions.length
    const percent = Math.round((sessionCorrect / total) * 100)
    return (
      <div className="lesson-finish">
        <div className="finish-top"><button className="icon-button" onClick={closeLesson} aria-label="Close lesson"><X /></button><span>LESSON COMPLETE</span></div>
        <div className="finish-card">
          <div className="finish-confetti">🎉</div>
          <div className="finish-medal">🏆</div>
          <h1>{percent >= 80 ? 'Amazing work!' : 'Good effort!'}</h1>
          <p>You finished <strong>{activeLesson.title}</strong>. Every lesson is a step forward.</p>
          <div className="finish-stats">
            <div><Zap size={22} /><strong>+{sessionXp}</strong><span>XP earned</span></div>
            <div><Target size={22} /><strong>{sessionCorrect}/{total}</strong><span>Correct answers</span></div>
            <div><ChartNoAxesCombined size={22} /><strong>{percent}%</strong><span>Accuracy</span></div>
          </div>
          {percent === 100 && <div className="perfect-banner"><Sparkles size={18} /> Perfect lesson bonus included!</div>}
          <button className="primary-button wide" onClick={closeLesson}>Continue learning <ChevronRight size={18} /></button>
        </div>
      </div>
    )
  }

  if (activeLesson && currentQuestion) {
    const isCorrect = selected === currentQuestion.answer
    const progressPercent = ((questionIndex + (checked ? 1 : 0)) / activeLesson.questions.length) * 100
    return (
      <div className="quiz-page">
        <div className="quiz-header">
          <button className="icon-button" onClick={closeLesson} aria-label="Exit lesson"><X /></button>
          <div className="quiz-progress"><div style={{ width: `${progressPercent}%` }} /></div>
          <div className="quiz-heart"><Heart size={19} fill="currentColor" /> 5</div>
        </div>
        <main className="quiz-main">
          <div className="lesson-label">{activeLesson.unit} · QUESTION {questionIndex + 1} OF {activeLesson.questions.length}</div>
          <h1>{currentQuestion.prompt}</h1>
          <div className="question-art">{activeLesson.emoji}</div>
          <p className="question-hint"><span>💡</span> {currentQuestion.hint}</p>
          <div className="answer-list">
            {currentQuestion.options.map(option => {
              const isAnswer = checked && option === currentQuestion.answer
              const isWrong = checked && option === selected && !isCorrect
              return (
                <button key={option} className={`answer-option ${selected === option ? 'selected' : ''} ${isAnswer ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} onClick={() => chooseAnswer(option)} disabled={checked}>
                  <span className="answer-letter">{String.fromCharCode(65 + currentQuestion.options.indexOf(option))}</span>
                  <span>{option}</span>
                  {isAnswer && <Check size={19} />}
                  {isWrong && <X size={19} />}
                </button>
              )
            })}
          </div>
          {checked && <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
            <div className="feedback-title">{isCorrect ? 'Correct!' : 'Not quite — keep going!'}</div>
            <p>{currentQuestion.explanation}</p>
          </div>}
        </main>
        <div className={`quiz-footer ${checked ? (isCorrect ? 'footer-correct' : 'footer-wrong') : ''}`}>
          {!checked ? <><span className="footer-hint">Choose the best answer.</span><button className="primary-button" disabled={!selected} onClick={submitAnswer}>Check answer <ChevronRight size={18} /></button></>
            : <><span className="footer-hint">{isCorrect ? 'Great job. Keep it up!' : `Correct answer: ${currentQuestion.answer}`}</span><button className="primary-button" onClick={nextQuestion}>{questionIndex === activeLesson.questions.length - 1 ? 'Finish lesson' : 'Continue'} <ChevronRight size={18} /></button></>}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setView('learn'); setMobileMenu(false) }}>
          <div className="brand-mark">L<span>Q</span></div><span>lingua<span className="brand-accent">quest</span></span>
        </a>
        <div className="course-switcher">
          <div className="flag">🇬🇧</div><div><strong>English course</strong><small>Level {currentCourseLevel}</small></div><ChevronRight size={16} />
        </div>
        <nav className="main-nav">
          <button className={view === 'learn' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('learn'); setMobileMenu(false) }}><Home size={20} /> Learn</button>
          <button className={view === 'tutor' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('tutor'); setMobileMenu(false) }}><MessageCircle size={20} /> AI Tutor</button>
          <button className={view === 'quests' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('quests'); setMobileMenu(false) }}><Trophy size={20} /> Achievements <span className="nav-count">{achievements.filter(a => a.earned).length}</span></button>
          <button className={view === 'profile' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('profile'); setMobileMenu(false) }}><UserRound size={20} /> My progress</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="streak-mini"><span>🔥</span><div><strong>{progress.streak} day streak</strong><small>Consistency is key!</small></div></div>
          <div className="sidebar-tip"><div>✨ A little every day</div><p>Five minutes of practice can build a lasting habit.</p></div>
          <div className="sidebar-version">LINGUAQUEST · BETA 0.1</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(v => !v)} aria-label="Open navigation"><Menu /></button>
          <div className="breadcrumb"><span>LEARN</span><ChevronRight size={14} /><strong>{view === 'learn' ? 'Learning path' : view === 'tutor' ? 'AI Tutor' : view === 'quests' ? 'Achievements' : 'My progress'}</strong></div>
          <div className="top-stats">
            <div className="top-stat streak-stat"><Flame size={19} fill="currentColor" /><strong>{progress.streak}</strong><span>streak</span></div>
            <div className="top-stat xp-stat"><Zap size={19} fill="currentColor" /><strong>{progress.xp}</strong><span>XP</span></div>
            <div className="top-stat level-stat"><Award size={19} /><strong>{currentLevel}</strong><span>level</span></div>
          </div>
        </header>

        {view === 'learn' && <div className="content-grid">
          <section className="learning-column">
            <div className="welcome-row">
              <div><div className="eyebrow">YOUR LEARNING JOURNEY</div><h1>Keep your momentum.</h1><p>Small steps today. Big progress tomorrow.</p></div>
              <div className="mascot" aria-label="Friendly owl mascot"><span>🦉</span><i>Hi!</i></div>
            </div>
            <div className="daily-card">
              <div className="daily-card-top"><div className="daily-icon"><Target size={20} /></div><div className="daily-title"><strong>Daily XP goal</strong><span>{progress.todayXp} of {progress.dailyGoal} XP earned today</span></div><strong className="daily-percent">{goalPercent}%</strong></div>
              <div className="goal-track"><div style={{ width: `${goalPercent}%` }} /></div>
              <div className="daily-bottom"><span>{goalPercent >= 100 ? '🎉 Goal reached! Fantastic work.' : `${progress.dailyGoal - progress.todayXp} XP to reach your daily goal`}</span><span>🎯 {progress.dailyGoal} XP</span></div>
            </div>

            <div className="section-heading"><div><div className="eyebrow">YOUR COURSE</div><h2>English foundations</h2></div><span className="course-progress">{doneCount}/{lessons.length} lessons</span></div>
            {courseUnits.map(unit => {
              const unitLessons = lessons.filter(lesson => lesson.courseLevel === unit.courseLevel)
              const shownLessons = visibleLessons.filter(lesson => lesson.courseLevel === unit.courseLevel)
              if (shownLessons.length === 0) return null
              const unitDone = unitLessons.filter(lesson => progress.completedLessons.includes(lesson.id)).length
              return <section className="course-unit" key={unit.courseLevel}>
                <div className="unit-banner"><div className="unit-symbol">{unit.emoji}</div><div><span>{unit.label}</span><h3>{unit.title}</h3><p>{unit.description}</p></div><div className="unit-progress">{Math.round(unitDone / unitLessons.length * 100)}%</div></div>
                <div className="lesson-path">
                  <div className="path-line" />
                  {shownLessons.map(lesson => {
                    const index = lessons.findIndex(item => item.id === lesson.id)
                    const complete = progress.completedLessons.includes(lesson.id)
                    return <div className={`lesson-node-row node-${index % 2 === 0 ? 'left' : 'right'}`} key={lesson.id}>
                      <div className={`lesson-node ${complete ? 'node-complete' : 'node-current'}`} style={{ marginLeft: index % 2 === 0 ? '12%' : '52%' }}>
                        <button className="node-button" onClick={() => beginLesson(lesson)} aria-label={`${complete ? 'Review' : 'Start'} ${lesson.title}`}>
                          {complete ? <Check size={26} strokeWidth={3} /> : <span>{lesson.emoji}</span>}
                        </button>
                        <div className="node-label"><strong>{lesson.title}</strong><span>{complete ? 'Completed ✓' : lesson.subtitle}</span></div>
                        {!complete && <div className="node-tag">START HERE</div>}
                      </div>
                    </div>
                  })}
                </div>
              </section>
            })}
            {upcomingLessons.length > 0 && <div className="upcoming-lessons">
              <button className="upcoming-lessons-toggle" aria-expanded={showUpcomingLessons} aria-controls="upcoming-lessons-list" onClick={() => setShowUpcomingLessons(value => !value)}>
                <span><strong>{showUpcomingLessons ? 'Hide upcoming lessons' : `${upcomingLessons.length} more lessons`}</strong><small>{showUpcomingLessons ? 'Keep your focus on the next step' : 'Complete lessons to unlock'}</small></span>
                <ChevronDown className={showUpcomingLessons ? 'expanded' : ''} size={19} />
              </button>
              {showUpcomingLessons && <div className="upcoming-lessons-list" id="upcoming-lessons-list">
                {upcomingLessons.map(lesson => <div className="upcoming-lesson-row" key={lesson.id}><span className="upcoming-lesson-emoji">{lesson.emoji}</span><span className="upcoming-lesson-copy"><strong>{lesson.title}</strong><small>{lesson.courseLevel} · {lesson.subtitle}</small></span><LockKeyhole size={17} /></div>)}
              </div>}
            </div>}
            <div className="next-step-card"><div className="next-step-icon">💬</div><div><strong>Learning tip</strong><p>Say new phrases out loud. Speaking helps you remember them.</p></div></div>
          </section>

          <aside className="right-column">
            <div className="side-card level-card"><div className="side-card-heading"><span>YOUR LEVEL</span><Award size={18} /></div><div className="level-display"><div className="level-badge">{currentLevel}</div><div><h3>{currentLevel === 1 ? 'Curious Beginner' : currentLevel < 4 ? 'Confident Learner' : 'Language Explorer'}</h3><p>{progress.xp} total XP</p></div></div><div className="level-track"><div style={{ width: `${levelProgress(progress.xp)}%` }} /></div><div className="level-foot"><span>Level {currentLevel}</span><span>{100 - levelProgress(progress.xp)} XP to level {currentLevel + 1}</span></div></div>
            <div className="side-card"><div className="side-card-heading"><span>YOUR ACTIVITY</span><ChartNoAxesCombined size={18} /></div><div className="activity-stats"><div><span>Lessons done</span><strong>{doneCount}<small> / {lessons.length}</small></strong></div><div><span>Accuracy</span><strong>{accuracy}<small>%</small></strong></div><div><span>Answers</span><strong>{progress.totalAnswered}</strong></div></div><div className="activity-week"><div className="week-label">THIS WEEK</div><div className="week-bars">{weekActivity.map(day => <div key={day.key} className="week-day"><div className={`week-bar ${day.today ? 'today' : ''}`} title={`${day.xp} XP`} style={{ height: `${day.xp ? Math.max(8, Math.min(44, Math.round(day.xp / progress.dailyGoal * 44))) : 4}px` }} /><span>{day.label}</span></div>)}</div><p className="activity-note">Daily XP earned from completed lessons.</p></div></div>
            <div className="side-card achievements-card"><div className="side-card-heading"><span>ACHIEVEMENTS</span><Trophy size={18} /></div><div className="achievement-preview">{achievements.slice(0, 3).map(a => <div className={`achievement-mini ${a.earned ? 'earned' : ''}`} key={a.name}><span>{a.icon}</span><div><strong>{a.name}</strong><small>{a.earned ? 'Unlocked!' : a.detail}</small></div>{a.earned && <Check size={16} />}</div>)}</div><button className="text-button" onClick={() => setView('quests')}>View all achievements <ChevronRight size={16} /></button></div>
            <div className="motivation-card"><Sparkles size={20} /><p><strong>Progress, not perfection.</strong><br />Every mistake is a chance to learn something new.</p></div>
          </aside>
        </div>}

        {view === 'tutor' && <section className="tutor-page">
          <div className="tutor-page-heading"><div><div className="eyebrow">PERSONAL ENGLISH PRACTICE</div><h1>AI Tutor</h1><p>Write naturally. Get a kind correction and a level-matched reply.</p></div><div className="tutor-level-card"><span>ACTIVE LEVEL</span><strong>Level {tutorLevel}</strong><small>{tutorLevelName(tutorLevel)}</small></div></div>
          {!supabase || !user ? <div className="tutor-gate"><div className="tutor-gate-icon"><MessageCircle size={23} /></div><div><h2>{!supabase ? 'Connect the tutor service' : 'Sign in to start learning'}</h2><p>{!supabase ? 'Add your Supabase settings, deploy the tutor function, and set the server-side OpenAI key to enable secure AI replies.' : 'Your tutor uses your saved XP to choose the right language level. Sign in to begin.'}</p><button className="primary-button" onClick={() => setView('profile')}>{!supabase ? 'Open setup' : 'Go to sign in'} <ChevronRight size={17} /></button></div></div> : <div className="tutor-chat-panel">
            <div className="tutor-chat-top"><div><MessageCircle size={18} /><strong>English conversation</strong></div><span>Level {tutorLevel} · {tutorLevelName(tutorLevel)}</span></div>
            <div className="tutor-chat-log" ref={tutorScrollRef} role="log" aria-live="polite" aria-label="Tutor conversation">
              {tutorMessages.length === 0 && <div className="tutor-welcome"><div className="tutor-bot-mark"><MessageCircle size={22} /></div><span className="eyebrow">YOUR LEVEL {tutorLevel} PRACTICE</span><h2>What would you like to talk about?</h2><p>Your tutor corrects your English first, then keeps the conversation going.</p><div className="tutor-starters">{tutorStarterPrompts(tutorLevel).map(prompt => <button className="tutor-starter" key={prompt} onClick={() => void sendTutorMessage(prompt)} disabled={tutorBusy}>{prompt}</button>)}</div></div>}
              {tutorMessages.map(turn => turn.role === 'user' ? <div className="tutor-user-turn" key={turn.id}><span>{turn.text}</span></div> : <article className="tutor-assistant-turn" key={turn.id}>
                {turn.reply?.correction && <div className="tutor-correction"><strong>Correction</strong><p>{turn.reply.correction}</p>{turn.reply.explanation && <small>{turn.reply.explanation}</small>}</div>}
                <p className="tutor-ai-response">{turn.reply?.ai_response}</p>
                <div className="tutor-suggested-replies">{turn.reply?.suggested_replies.map(reply => <button key={reply} onClick={() => void sendTutorMessage(reply)} disabled={tutorBusy}>{reply}</button>)}</div>
              </article>)}
              {tutorBusy && <div className="tutor-thinking" role="status">Your tutor is thinking…</div>}
            </div>
            {tutorError && <p className="tutor-error" role="alert">{tutorError}</p>}
            <form className="tutor-composer" onSubmit={event => { event.preventDefault(); void sendTutorMessage() }}><textarea value={tutorDraft} onChange={event => setTutorDraft(event.target.value)} placeholder="Write a message in English…" rows={2} maxLength={1000} aria-label="Your message" disabled={tutorBusy} /><button className="tutor-send" type="submit" aria-label="Send message" title="Send message" disabled={tutorBusy || !tutorDraft.trim()}><Send size={18} /></button></form>
          </div>}
        </section>}

        {view === 'quests' && <section className="standalone-page"><div className="eyebrow">MILESTONES & REWARDS</div><h1>Every win counts.</h1><p className="standalone-intro">Keep practising to unlock these achievements. You can do it!</p><div className="achievement-grid">{achievements.map(a => <div className={`achievement-card ${a.earned ? 'achievement-earned' : ''}`} key={a.name}><div className="achievement-art">{a.icon}</div><div className="achievement-status">{a.earned ? 'UNLOCKED' : 'LOCKED'}</div><h3>{a.name}</h3><p>{a.detail}</p>{a.earned ? <span className="earned-label"><Check size={14} /> Earned</span> : <span className="locked-label"><LockKeyhole size={13} /> Keep learning</span>}</div>)}</div></section>}

        {view === 'profile' && <section className="standalone-page"><div className="eyebrow">YOUR PERSONAL DASHBOARD</div><h1>Look how far you've come.</h1><p className="standalone-intro">{user ? 'Your account keeps progress in sync across devices.' : 'Your progress is saved on this device.'}</p>
          <div className="account-panel">
            <div className="account-panel-heading"><div><div className="eyebrow">LINGUAQUEST ACCOUNT</div><h2>{user ? 'Your learner account' : 'Save your progress'}</h2></div><UserRound size={22} /></div>
            {!supabase ? <div className="account-notice"><strong>Cloud accounts are not configured yet.</strong><p>Add your Supabase project URL and anon key to <code>.env.local</code>, then run the setup in <code>supabase/schema.sql</code>. Your current progress remains saved on this device.</p></div>
              : user ? <div className="account-signed-in"><div className="account-identity"><span className="account-avatar"><UserRound size={20} /></span><div><strong>{user.email}</strong><small>{syncStatus === 'loading' ? 'Loading cloud progress…' : syncStatus === 'syncing' ? 'Saving progress…' : syncStatus === 'synced' ? 'Progress synced' : syncStatus === 'error' ? 'Sync needs attention' : 'Progress saved on this device'}</small></div></div><div className="account-actions">{syncStatus === 'error' && <button className="secondary-button" onClick={() => { setAuthError(''); setCloudReady(false); setCloudRefresh(value => value + 1) }}>Retry sync</button>}<button className="secondary-button" onClick={handleSignOut} disabled={authBusy}>Sign out</button></div></div>
                : <><div className="auth-toggle"><button type="button" className={authMode === 'signin' ? 'selected' : ''} onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthMessage('') }}>Sign in</button><button type="button" className={authMode === 'signup' ? 'selected' : ''} onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage('') }}>Create account</button></div><form className="auth-form" onSubmit={handleAuthSubmit}><label>Email address<input type="email" autoComplete="email" value={authEmail} onChange={event => setAuthEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={8} value={authPassword} onChange={event => setAuthPassword(event.target.value)} required /></label><button className="primary-button" type="submit" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'}</button></form>{authMode === 'signin' && <button className="text-button auth-reset" type="button" onClick={sendPasswordReset} disabled={authBusy}>Forgot password?</button>}</>}
            {authError && <p className="account-feedback error" role="alert">{authError}</p>}{authMessage && <p className="account-feedback success" role="status">{authMessage}</p>}
          </div>
          <div className="profile-summary"><div className="profile-avatar">🦉</div><div><h2>English learner</h2><p>{currentCourseLevel === 'A1' ? 'Curious Beginner' : 'Confident Learner'} · Level {currentLevel}</p><span className="profile-chip">🇬🇧 English · {currentCourseLevel}</span></div></div><div className="profile-metrics"><div><Zap /><span>Total XP</span><strong>{progress.xp}</strong></div><div><Flame /><span>Current streak</span><strong>{progress.streak} days</strong></div><div><BookOpen /><span>Lessons completed</span><strong>{doneCount}/{lessons.length}</strong></div><div><Target /><span>Answer accuracy</span><strong>{accuracy}%</strong></div></div><div className="profile-progress-card"><h3>Course completion</h3><div className="goal-track"><div style={{ width: `${doneCount / lessons.length * 100}%` }} /></div><p>{doneCount === lessons.length ? 'You completed the A2 course. More lessons coming soon!' : `${doneCount} of ${lessons.length} course lessons completed.`}</p></div><div className="profile-progress-card"><h3>Learning settings</h3><label className="goal-setting">Daily XP goal <select value={progress.dailyGoal} onChange={e => setProgress(p => ({ ...p, dailyGoal: Number(e.target.value) }))}><option value={10}>10 XP · Easy</option><option value={20}>20 XP · Standard</option><option value={30}>30 XP · Focused</option><option value={50}>50 XP · Challenge</option></select></label><button className="reset-button" onClick={() => setShowReset(true)}><RotateCcw size={16} /> Reset all progress</button></div></section>}
        <footer className="app-footer"><span>© 2026 LinguaQuest</span><span>Learn a little. Grow a lot. <span className="footer-heart">♥</span></span><span>Prototype v0.1</span></footer>
      </main>

      {showReset && <div className="modal-backdrop"><div className="confirm-modal"><div className="modal-icon">⚠️</div><h2>Reset your progress?</h2><p>This will erase your XP, streak, completed lessons, and quiz statistics from this device and your account. This cannot be undone.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setShowReset(false)}>Cancel</button><button className="danger-button" onClick={resetProgress}>Reset progress</button></div></div></div>}
    </div>
  )
}
