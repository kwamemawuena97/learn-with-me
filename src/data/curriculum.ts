export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type ExerciseType = 'multiple-choice' | 'fill-in-the-blank' | 'word-matching' | 'sentence-ordering' | 'translation' | 'reading'

export type Exercise = {
  type: ExerciseType
  instruction: string
  prompt: string
  options?: string[]
  acceptedAnswers?: string[]
  correctAnswer?: string
  explanation: string
  hint?: string
}

export type CurriculumLesson = {
  id: string
  title: string
  objectives: string[]
  estimatedMinutes: number
  exercises: Exercise[]
}

export type CurriculumUnit = {
  id: string
  title: string
  description: string
  sequence: number
  lessons: CurriculumLesson[]
}

export type Course = {
  id: string
  languageCode: string
  level: CEFRLevel
  title: string
  description: string
  published: boolean
  units: CurriculumUnit[]
}

export function normalizeFreeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[\s]+/g, ' ') 
    .replace(/\s+([?.!,])/g, '$1')
}

export function isAcceptedAnswer(value: string, exercise: Exercise): boolean {
  if (exercise.correctAnswer !== undefined) {
    return normalizeFreeText(value) === normalizeFreeText(exercise.correctAnswer)
  }
  return (exercise.acceptedAnswers ?? []).some(answer => normalizeFreeText(answer) === normalizeFreeText(value))
}

export const englishA1Course: Course = {
  id: 'english-a1',
  languageCode: 'en',
  level: 'A1',
  title: 'English Foundations',
  description: 'Build practical English for everyday communication.',
  published: true,
  units: [
    {
      id: 'a1-unit-1', title: 'Greetings and introductions', description: 'Meet people, introduce yourself, and ask names.', sequence: 1,
      lessons: [
        {
          id: 'a1-greetings', title: 'Say hello', estimatedMinutes: 5,
          objectives: ['Use common greetings.', 'Respond to “How are you?”', 'Say goodbye politely.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the best greeting.', prompt: 'What is a friendly way to greet someone?', options: ['Goodbye', 'Hello', 'Sorry', 'Maybe'], correctAnswer: 'Hello', hint: 'Use this when you meet a person.', explanation: '“Hello” is a common greeting when you meet someone.' },
            { type: 'multiple-choice', instruction: 'Choose a natural response.', prompt: 'How are you?', options: ['I am fine, thanks.', 'My name is book.', 'Good night yesterday.', 'I am a window.'], correctAnswer: 'I am fine, thanks.', explanation: 'Use a short answer about your wellbeing.' },
            { type: 'translation', instruction: 'Write the English phrase.', prompt: 'Translate: “Goodbye.”', acceptedAnswers: ['Goodbye.', 'Goodbye', 'Bye.', 'Bye'], explanation: '“Goodbye” or the shorter “Bye” are both standard farewells.' },
          ],
        },
        {
          id: 'a1-introductions', title: 'Introducing yourself', estimatedMinutes: 6,
          objectives: ['Use “My name is…”', 'Ask someone’s name.', 'Use a simple nationality word.'],
          exercises: [
            { type: 'fill-in-the-blank', instruction: 'Complete the introduction.', prompt: 'My ___ is Ama.', acceptedAnswers: ['name'], hint: 'This word identifies you.', explanation: 'English introductions use “My name is…”' },
            { type: 'multiple-choice', instruction: 'Choose the best question.', prompt: 'What can you ask a new person?', options: ['How much are names?', 'What is your name?', 'Where is goodbye?', 'Who is hungry?'], correctAnswer: 'What is your name?', explanation: '“What is your name?” is a direct and polite question.' },
            { type: 'multiple-choice', instruction: 'Choose the phrase for a first meeting.', prompt: 'Which phrase is appropriate?', options: ['See you later', 'Nice to meet you', 'I am hungry', 'No problem tomorrow'], correctAnswer: 'Nice to meet you', explanation: '“Nice to meet you” is used at a first meeting.' },
          ],
        },
        {
          id: 'a1-countries', title: 'Countries and nationalities', estimatedMinutes: 5,
          objectives: ['Name a country.', 'Use “I am from…”', 'Match a simple nationality.'],
          exercises: [
            { type: 'fill-in-the-blank', instruction: 'Complete the sentence.', prompt: 'I am ___ Ghana.', acceptedAnswers: ['from'], explanation: 'Use “from” with a country or place.' },
            { type: 'multiple-choice', instruction: 'Choose the nationality.', prompt: 'Someone from Ghana is…', options: ['Ghanaian', 'Englandish', 'Ghanese', 'Ghanan'], correctAnswer: 'Ghanaian', explanation: '“Ghanaian” is the usual nationality adjective and noun.' },
            { type: 'multiple-choice', instruction: 'Choose the country.', prompt: 'London is the capital of…', options: ['England', 'Ghana', 'Kenya', 'Nigeria'], correctAnswer: 'England', explanation: 'London is in England.' },
          ],
        },
      ],
    },
    {
      id: 'a1-unit-2', title: 'Everyday English', description: 'Learn numbers, time, days, family, and routines.', sequence: 2,
      lessons: [
        {
          id: 'a1-numbers-time', title: 'Numbers and time', estimatedMinutes: 6,
          objectives: ['Recognize basic numbers.', 'Tell time in simple phrases.', 'Use “at” for clock time.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the number.', prompt: 'Which number comes after twelve?', options: ['Ten', 'Eleven', 'Thirteen', 'Twenty'], correctAnswer: 'Thirteen', explanation: 'The number sequence continues 12, 13, 14.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the time phrase.', prompt: 'The class starts ___ 9:00.', acceptedAnswers: ['at'], explanation: 'Use “at” before a clock time.' },
            { type: 'multiple-choice', instruction: 'Choose the correct clock phrase.', prompt: '9:30 is usually read as…', options: ['nine thirty', 'thirty nine', 'at nine', 'nine past thirty'], correctAnswer: 'nine thirty', explanation: '“Nine thirty” states the hour and minute clearly.' },
          ],
        },
        {
          id: 'a1-days-months', title: 'Days and months', estimatedMinutes: 5,
          objectives: ['Name days of the week.', 'Name months.', 'Use “on” for calendar days.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the day after Monday.', prompt: 'Monday, then…', options: ['Sunday', 'Tuesday', 'Friday', 'Saturday'], correctAnswer: 'Tuesday', explanation: 'Tuesday follows Monday.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the month phrase.', prompt: 'My birthday is in ___.', acceptedAnswers: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], explanation: 'A month name completes this phrase.' },
            { type: 'multiple-choice', instruction: 'Choose the correct preposition.', prompt: 'I have a lesson ___ Monday.', options: ['at', 'on', 'in', 'by'], correctAnswer: 'on', explanation: 'Use “on” before days of the week.' },
          ],
        },
        {
          id: 'a1-family-routines', title: 'Family and daily routines', estimatedMinutes: 7,
          objectives: ['Name family members.', 'Use present-simple routines.', 'Use “every day” correctly.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the family member.', prompt: 'Your mother’s father is your…', options: ['brother', 'grandfather', 'uncle', 'son'], correctAnswer: 'grandfather', explanation: 'A mother’s father is your grandfather.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the routine.', prompt: 'I ___ breakfast at 7:00.', acceptedAnswers: ['eat'], explanation: 'Use “eat” to describe taking a meal.' },
            { type: 'multiple-choice', instruction: 'Choose a correct routine sentence.', prompt: 'Which sentence is grammatical?', options: ['She every day works.', 'She works every day.', 'Every day she work.', 'She working every day.'], correctAnswer: 'She works every day.', explanation: 'Present-simple third-person singular uses “works.”' },
          ],
        },
      ],
    },
    {
      id: 'a1-unit-3', title: 'Building sentences', description: 'Use pronouns, verb “to be,” questions, and negatives.', sequence: 3,
      lessons: [
        {
          id: 'a1-pronouns', title: 'Subject pronouns', estimatedMinutes: 5,
          objectives: ['Choose I, you, he, she, it, we, or they.', 'Match pronouns with simple nouns.', 'Avoid repeating names repeatedly.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the pronoun.', prompt: 'Ama is a student. ___ is a student.', options: ['He', 'She', 'It', 'They'], correctAnswer: 'She', explanation: 'Use “she” for a female person.' },
            { type: 'multiple-choice', instruction: 'Choose the pronoun.', prompt: 'Kofi and Ama are friends. ___ are friends.', options: ['He', 'She', 'It', 'They'], correctAnswer: 'They', explanation: 'Use “they” for plural people.' },
            { type: 'word-matching', instruction: 'Match each subject with its common verb form.', prompt: 'I → am; he → is; they → are', options: ['I', 'he', 'they'], correctAnswer: 'I', explanation: 'Subject pronouns use different forms of the verb “to be.”' },
          ],
        },
        {
          id: 'a1-verb-be', title: 'The verb “to be”', estimatedMinutes: 7,
          objectives: ['Use am, is, and are.', 'Form positive sentences.', 'Describe people and places.'],
          exercises: [
            { type: 'fill-in-the-blank', instruction: 'Complete with the correct form.', prompt: 'I ___ happy.', acceptedAnswers: ['am'], explanation: 'Use “am” with “I.”' },
            { type: 'fill-in-the-blank', instruction: 'Complete with the correct form.', prompt: 'The school ___ open.', acceptedAnswers: ['is'], explanation: 'Use “is” with a singular noun.' },
            { type: 'fill-in-the-blank', instruction: 'Complete with the correct form.', prompt: 'We ___ ready.', acceptedAnswers: ['are'], explanation: 'Use “are” with “we” or another plural subject.' },
          ],
        },
        {
          id: 'a1-questions-negatives', title: 'Questions and negatives', estimatedMinutes: 7,
          objectives: ['Invert “to be” in questions.', 'Use not for negative statements.', 'Answer simple yes/no questions.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the question.', prompt: 'Which is correct?', options: ['You are ready?', 'Are you ready?', 'Ready are you?', 'Is ready you?'], correctAnswer: 'Are you ready?', explanation: 'With “to be,” move the verb before the subject in a question.' },
            { type: 'fill-in-the-blank', instruction: 'Make a negative.', prompt: 'She ___ not late.', acceptedAnswers: ['is'], explanation: '“She is not late” uses the correct third-person form.' },
            { type: 'multiple-choice', instruction: 'Choose a short answer.', prompt: 'Are you a student?', options: ['Yes, I am.', 'Yes, I are.', 'No, you not.', 'Yes, student.'], correctAnswer: 'Yes, I am.', explanation: 'Match the subject and verb in the short answer.' },
          ],
        },
      ],
    },
    {
      id: 'a1-unit-4', title: 'People and places', description: 'Describe people and ask for directions.', sequence: 4,
      lessons: [
        {
          id: 'a1-describing-people', title: 'Describing people', estimatedMinutes: 6,
          objectives: ['Use common appearance adjectives.', 'Place adjectives before nouns.', 'Describe height and age simply.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose a describing word.', prompt: 'A person who is not old is…', options: ['young', 'long', 'low', 'late'], correctAnswer: 'young', explanation: '“Young” describes someone who is not old.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the description.', prompt: 'He has a ___ smile.', acceptedAnswers: ['kind', 'big', 'warm', 'happy', 'friendly'], explanation: 'An adjective describes the smile.' },
            { type: 'multiple-choice', instruction: 'Choose the correct word order.', prompt: 'Which description is natural?', options: ['boy a tall', 'a tall boy', 'tall the boy', 'boy tall a'], correctAnswer: 'a tall boy', explanation: 'English usually puts adjectives before nouns.' },
          ],
        },
        {
          id: 'a1-common-adjectives', title: 'Common adjectives', estimatedMinutes: 5,
          objectives: ['Use size and colour adjectives.', 'Distinguish similar descriptions.', 'Place adjectives before nouns.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose an opposite.', prompt: 'The opposite of “clean” is…', options: ['dirty', 'small', 'quick', 'soft'], correctAnswer: 'dirty', explanation: '“Dirty” is the opposite of “clean.”' },
            { type: 'fill-in-the-blank', instruction: 'Complete the description.', prompt: 'The car is ___ and fast.', acceptedAnswers: ['red', 'blue', 'black', 'white', 'green', 'yellow', 'small', 'new'], explanation: 'A colour or appearance adjective can describe a car.' },
            { type: 'multiple-choice', instruction: 'Choose the best adjective.', prompt: 'A bag with little weight is…', options: ['heavy', 'wide', 'light', 'far'], correctAnswer: 'light', explanation: '“Light” describes something with little weight.' },
          ],
        },
        {
          id: 'a1-places-directions', title: 'Places and directions', estimatedMinutes: 7,
          objectives: ['Name common town places.', 'Ask for directions.', 'Understand left, right, and straight.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the correct place.', prompt: 'Where can you buy medicine?', options: ['A pharmacy', 'A library', 'A bank', 'A cinema'], correctAnswer: 'A pharmacy', explanation: 'A pharmacy sells medicine.' },
            { type: 'multiple-choice', instruction: 'Choose a direction phrase.', prompt: 'Continue without turning.', options: ['Turn left', 'Go straight ahead', 'Turn right', 'Go behind'], correctAnswer: 'Go straight ahead', explanation: '“Go straight ahead” means continue without turning.' },
            { type: 'reading', instruction: 'Read and answer.', prompt: 'The bank is opposite the market. Go straight and turn left. What is opposite the market?', options: ['The bank', 'The school', 'The pharmacy', 'The station'], correctAnswer: 'The bank', explanation: 'The first sentence says the bank is opposite the market.' },
          ],
        },
      ],
    },
    {
      id: 'a1-unit-5', title: 'Food and shopping', description: 'Talk about food, prices, and quantities.', sequence: 5,
      lessons: [
        {
          id: 'a1-food-vocabulary', title: 'Food vocabulary', estimatedMinutes: 5,
          objectives: ['Name common foods.', 'Distinguish drinks and meals.', 'Order basic items.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose a fruit.', prompt: 'Which item is a fruit?', options: ['Rice', 'Apple', 'Bread', 'Cheese'], correctAnswer: 'Apple', explanation: 'An apple is a fruit.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the shopping sentence.', prompt: 'I would like some ___, please.', acceptedAnswers: ['rice', 'bread', 'water', 'fish', 'fruit'], explanation: 'This is a polite request for food or drink.' },
            { type: 'translation', instruction: 'Write the English phrase.', prompt: 'Translate: water', acceptedAnswers: ['water'], explanation: '“Water” names a drink without a countable form in this context.' },
          ],
        },
        {
          id: 'a1-countable-uncountable', title: 'Countable and uncountable nouns', estimatedMinutes: 7,
          objectives: ['Use a/an with countable nouns.', 'Use some with uncountable food.', 'Choose how much or how many.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose how many or how much.', prompt: '___ apples do you need?', options: ['How much', 'How many', 'A lot much', 'How little'], correctAnswer: 'How many', explanation: 'Use “how many” with countable nouns such as apples.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the phrase.', prompt: 'I would like some ___.', acceptedAnswers: ['rice', 'water', 'bread', 'milk', 'sugar'], explanation: 'Use “some” with uncountable quantities.' },
            { type: 'multiple-choice', instruction: 'Choose the article.', prompt: 'I ate ___ orange.', options: ['an', 'a', 'some', 'much'], correctAnswer: 'an', explanation: 'Use “an” before a vowel sound.' },
          ],
        },
        {
          id: 'a1-shopping', title: 'Prices and shopping', estimatedMinutes: 7,
          objectives: ['Ask the price politely.', 'Request quantities.', 'Say thank you after service.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Ask about the price.', prompt: 'Which question is most polite?', options: ['How much is this?', 'How old is this?', 'Where money this?', 'What price you?'], correctAnswer: 'How much is this?', explanation: '“How much is this?” asks the cost of one item.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the request.', prompt: 'Can I have two ___, please?', acceptedAnswers: ['apples', 'bananas', 'oranges', 'bottles'], explanation: 'Use a plural noun after a countable quantity.' },
            { type: 'sentence-ordering', instruction: 'Put the polite request in order.', prompt: 'please / have / I / can / an apple', options: ['Can I have an apple, please?', 'I can have please an apple.', 'Apple please can I have.', 'Have can I an apple please.'], correctAnswer: 'Can I have an apple, please?', explanation: 'The sentence begins with “Can I have” and ends with “please.”' },
          ],
        },
      ],
    },
    {
      id: 'a1-unit-6', title: 'Practical communication', description: 'Ask for help and understand everyday instructions.', sequence: 6,
      lessons: [
        {
          id: 'a1-asking-help', title: 'Asking for help', estimatedMinutes: 6,
          objectives: ['Use “Could you…”', 'Ask someone to repeat.', 'Explain a simple problem.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose a polite request.', prompt: 'How do you ask someone to help?', options: ['Could you help me, please?', 'Help you I?', 'You help could me?', 'Could helps me?'], correctAnswer: 'Could you help me, please?', explanation: '“Could you…” is a polite request.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the request.', prompt: 'Could you ___ more slowly, please?', acceptedAnswers: ['speak', 'talk', 'repeat'], explanation: 'Use a verb that asks the speaker to adjust their speech.' },
            { type: 'multiple-choice', instruction: 'Choose the simple problem phrase.', prompt: 'You do not understand. What do you say?', options: ['I understand everything.', 'I do not understand.', 'I am understanding no.', 'I no understand.'], correctAnswer: 'I do not understand.', explanation: '“I do not understand” clearly states confusion.' },
          ],
        },
        {
          id: 'a1-polite-requests', title: 'Making polite requests', estimatedMinutes: 6,
          objectives: ['Use please and thank you.', 'Use modal phrases naturally.', 'Make a request without sounding demanding.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the polite request.', prompt: 'Which phrase is polite?', options: ['Open the door.', 'Please open the door.', 'Door you open.', 'Open door now you.'], correctAnswer: 'Please open the door.', explanation: 'Adding “please” makes an imperative request more polite.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the polite sentence.', prompt: '___ you pass the menu?', acceptedAnswers: ['Could', 'Can', 'Would'], explanation: 'Could, would, or can can introduce a request, with “could” and “would” often sounding most polite.' },
            { type: 'multiple-choice', instruction: 'Choose the response.', prompt: 'Someone helps you. What do you say?', options: ['No thanks.', 'Thank you.', 'Please help again.', 'Sorry now.'], correctAnswer: 'Thank you.', explanation: '“Thank you” expresses appreciation.' },
          ],
        },
        {
          id: 'a1-simple-instructions', title: 'Understanding instructions', estimatedMinutes: 7,
          objectives: ['Follow numbered steps.', 'Understand first, next, and then.', 'Confirm simple actions.'],
          exercises: [
            { type: 'multiple-choice', instruction: 'Choose the first action.', prompt: 'Recipe: wash the rice; add water; cook it. What comes first?', options: ['Cook the rice', 'Add water', 'Wash the rice', 'Serve the rice'], correctAnswer: 'Wash the rice', explanation: 'The instruction list begins with washing the rice.' },
            { type: 'fill-in-the-blank', instruction: 'Complete the sequence word.', prompt: 'First open the form. ___, write your name.', acceptedAnswers: ['Next', 'Then', 'After that'], explanation: 'Sequence words organize the steps.' },
            { type: 'reading', instruction: 'Read the instruction and answer.', prompt: 'Sit down, write your name, and wait. What should you do before waiting?', options: ['Leave the room', 'Write your name', 'Ask a question', 'Eat lunch'], correctAnswer: 'Write your name', explanation: 'The instructions say to write your name before waiting.' },
          ],
        },
      ],
    },
  ],
}
