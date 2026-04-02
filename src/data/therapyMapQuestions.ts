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
    text: 'Как тебе комфортно, чтобы к тебе обращались? При желании — пара слов о себе (необязательно).',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'values_focus',
    text: 'Что для тебя сейчас важно в жизни: ценности, опоры, смыслы — своими словами.',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'therapy_style',
    text: 'Как тебе комфортнее работать в терапии: темп (медленнее / можно быстрее), стиль обратной связи (прямее / мягче), структура (люблю задания между встречами / лучше только в сессии / обсудим вместе)?',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'boundaries',
    text: 'Какие темы пока не готов(а) обсуждать? Что для тебя недопустимо в процессе (например: давление, сравнения, непрошенные жёсткие советы)?',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'regulation',
    text: 'Что помогает тебе стабилизироваться между встречами? Что, наоборот, часто ухудшает состояние?',
    shortEligible: true,
    includeInShortByDefault: true,
  },
  {
    id: 'therapy_fears',
    text: 'Чего ты боишься или стесняешься в терапии? (например: осуждение, что не помогут, что заставят говорить о том, о чём не хочется)',
    shortEligible: true,
    includeInShortByDefault: false,
  },
  {
    id: 'between_sessions',
    text: 'Как ты представляешь связь со специалистом между сессиями? (только на приёме / по правилам специалиста в мессенджере — это лишь твои ожидания, их можно обсудить в кабинете)',
    shortEligible: true,
    includeInShortByDefault: false,
  },
]
