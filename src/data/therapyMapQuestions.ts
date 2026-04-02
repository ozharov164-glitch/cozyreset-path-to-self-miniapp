/** id и смысл совпадают с services/therapy_map_questions.py */
export const THERAPY_MAP_QUESTIONS: {
  id: string
  text: string
  /** Можно включить в краткую версию PDF */
  shortEligible: boolean
  /** Стартовое выделение в краткой версии (если ответ непустой) */
  includeInShortByDefault: boolean
}[] = [
  {
    id: 'greeting_context',
    text: 'Как к тебе лучше обращаться на встрече (имя, на «ты» или на «вы»)? По желанию — две–три фразы о себе для контекста.',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'values_focus',
    text: 'Что для тебя сейчас по-настоящему важно? Напиши своими словами: что дорого, на что опираешься, что придаёт жизни смысл.',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'therapy_style',
    text: 'Как тебе удобнее вести терапию? Ответь списком или связным текстом по трём моментам:\n• темп — спокойнее и неторопливо или можно быстрее и насыщеннее;\n• обратная связь — прямее и чётче или мягче и деликатнее;\n• между встречами — хочешь ли короткие задания, достаточно работы только на сессиях или формат обсудите вместе со специалистом.',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'boundaries',
    text: 'О каких темах пока не готов(а) говорить? Что в процессе терапии для тебя недопустимо (например: давление, сравнение с другими, жёсткие советы без твоего запроса)?',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'regulation',
    text: 'Что помогает тебе приходить в равновесие между сессиями? Что чаще всего сбивает или ухудшает самочувствие?',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'therapy_fears',
    text: 'Какие есть страхи или смущение в связи с терапией? Например: стыдно говорить, боюсь осуждения, сомневаюсь, что поможет, не хочу обсуждать то, о чём пока не готов(а).',
    shortEligible: true,
    includeInShortByDefault: false,
  },
  {
    id: 'between_sessions',
    text: 'Как ты видишь контакт со специалистом между встречами — только на приёме, иногда письменно по договорённости или иначе? Это твои пожелания на старт; точный формат всегда можно уточнить в кабинете.',
    shortEligible: true,
    includeInShortByDefault: false,
  },
]
