export type TutorLevel = 1 | 2 | 3 | 4 | 5

export type TutorReply = {
  correction: string | null
  explanation: string | null
  ai_response: string
  suggested_replies: [string, string]
}

export type TutorTurn = {
  role: 'user' | 'assistant'
  content: string
}

const levelNames: Record<TutorLevel, string> = {
  1: 'Absolute Beginner',
  2: 'Elementary / Low-Intermediate',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Pro / Fluent Speaker',
}

const levelRules: Record<TutorLevel, string> = {
  1: 'Use A1 survival vocabulary about family, food, colors, and daily needs. Use only present simple and subject-verb-object sentences of 5 to 7 words maximum. Keep questions binary or multiple choice. Give a short translation or brief hint in brackets for programmatic phrases.',
  2: 'Use A2/B1 vocabulary about routines, shopping, hobbies, and travel. Use simple compound sentences with and, but, or because; keep sentences to 12 words maximum. Introduce simple past and future. Ask clear, open-ended questions.',
  3: 'Use B2 vocabulary about work, media, opinions, and feelings. Use complex sentences, conditionals, and passive voice. Offer situational roleplays. Do not offer native-language translations.',
  4: 'Use C1 vocabulary, idioms, phrasal verbs, corporate terminology, and nuanced adjectives. Use natural varied structures. Invite debate and ask the learner to defend opinions. Use casual slang naturally.',
  5: 'Use C2 vocabulary, specialist terminology, advanced metaphors, subtle irony, and academic rhetoric. Treat the learner like a fluent peer. Use dense, varied phrasing and deep conversational context.',
}

const starterPrompts: Record<TutorLevel, [string, string]> = {
  1: ['I like apples.', 'I eat rice.'],
  2: ['I visited my family yesterday.', 'I plan a trip next week.'],
  3: ['How does remote work affect teams?', 'Can we roleplay a job interview?'],
  4: ['Should companies embrace a four-day week?', 'Challenge my opinion about remote work.'],
  5: ['Let’s examine the ethics of automation.', 'Make the strongest case against my view.'],
}

export function tutorLevelFromXp(xp: number): TutorLevel {
  return Math.min(5, Math.max(1, Math.floor(Math.max(0, xp) / 100) + 1)) as TutorLevel
}

export function tutorLevelName(level: TutorLevel) {
  return levelNames[level]
}

export function tutorStarterPrompts(level: TutorLevel) {
  return starterPrompts[level]
}

export function buildTutorSystemPrompt(level: TutorLevel) {
  return `You are LinguaQuest, an adaptable English tutor and conversational partner. The learner is at Level ${level}: ${levelNames[level]}.\n\nSTRICT LEVEL RULES\n${levelRules[level]}\nNever use language above this level in any user-facing field. Do not advance the learner unless the active level changes.\n\nREAL-TIME CORRECTION\nAnalyze the learner's latest message for grammatical and contextual errors before responding. If an error exists, give a friendly corrected version and briefly explain the rule at this level. If it is correct, set correction and explanation to null. Then continue the conversation naturally.\n\nOUTPUT CONTRACT\nReturn only one valid JSON object, with no Markdown or surrounding text, using exactly these keys and types:\n{"correction": string | null, "explanation": string | null, "ai_response": string, "suggested_replies": [string, string]}\nAlways provide exactly two short, level-appropriate suggested replies. Keep every response field within the level rules. Do not include the correction twice in ai_response unless it is useful to continue the conversation.`
}

export function parseTutorReply(raw: string): TutorReply {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('The tutor returned an invalid response. Please try again.')
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The tutor response is missing required fields. Please try again.')
  }

  const value = parsed as Record<string, unknown>
  const suggestions = value.suggested_replies
  if (
    !(value.correction === null || typeof value.correction === 'string') ||
    !(value.explanation === null || typeof value.explanation === 'string') ||
    typeof value.ai_response !== 'string' ||
    !Array.isArray(suggestions) ||
    suggestions.length !== 2 ||
    suggestions.some(reply => typeof reply !== 'string')
  ) {
    throw new Error('The tutor response does not match the expected format. Please try again.')
  }

  return {
    correction: value.correction,
    explanation: value.explanation,
    ai_response: value.ai_response,
    suggested_replies: suggestions as [string, string],
  }
}