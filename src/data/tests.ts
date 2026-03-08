export interface TestQuestion {
  id: string
  text: string
  dimension?: string
}

export interface TestDef {
  id: string
  title: string
  description: string
  questionCount: number
  questions: TestQuestion[]
}

const scaleQuestions = (count: number, prefix: string, dimension?: string): TestQuestion[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-q${i + 1}`,
    text: `Вопрос ${i + 1} из ${count}. (Оцени по шкале от 1 до 10: 1 — совсем нет, 10 — полностью согласен.)`,
    dimension: dimension || 'general',
  }))

export const TESTS: TestDef[] = [
  {
    id: 'anxiety',
    title: 'Тревога и беспокойство',
    description: 'Помогает оценить уровень тревоги, навязчивых мыслей и телесных проявлений. Подходит для регулярной самопроверки и отслеживания динамики.',
    questionCount: 22,
    questions: scaleQuestions(22, 'anxiety', 'anxiety'),
  },
  {
    id: 'mood-energy',
    title: 'Настроение и энергия',
    description: 'Исследует связь настроения с энергией, сном и активностью. Позволяет увидеть паттерны и точки опоры в течение дня и недели.',
    questionCount: 20,
    questions: scaleQuestions(20, 'mood', 'energy'),
  },
  {
    id: 'self-esteem',
    title: 'Самооценка и внутренний критик',
    description: 'Фокус на отношении к себе, самокритике и уверенности. Помогает заметить внутренние установки и их влияние на самочувствие.',
    questionCount: 24,
    questions: scaleQuestions(24, 'self', 'self_esteem'),
  },
  {
    id: 'burnout',
    title: 'Эмоциональное выгорание',
    description: 'Оценка признаков выгорания в работе, отношениях и заботе о себе. Полезен для профилактики и восстановления ресурса.',
    questionCount: 25,
    questions: scaleQuestions(25, 'burnout', 'burnout'),
  },
  {
    id: 'boundaries',
    title: 'Границы и отношения с собой',
    description: 'Проясняет, насколько комфортны личные границы и забота о себе в отношениях и в повседневных решениях.',
    questionCount: 18,
    questions: scaleQuestions(18, 'boundaries', 'boundaries'),
  },
  {
    id: 'meaning',
    title: 'Смысл жизни и удовлетворённость',
    description: 'Касается ощущения смысла, целей и общей удовлетворённости жизнью. Подходит для периодической рефлексии.',
    questionCount: 21,
    questions: scaleQuestions(21, 'meaning', 'meaning'),
  },
  {
    id: 'progress',
    title: 'Прогресс терапии',
    description: 'Входной/выходной статус. Снимок состояния до и после периода работы над собой. Помогает зафиксировать изменения по ключевым областям.',
    questionCount: 16,
    questions: scaleQuestions(16, 'progress', 'progress'),
  },
]
