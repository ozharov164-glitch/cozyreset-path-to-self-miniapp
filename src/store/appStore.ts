import { create } from 'zustand'

export type Screen =
  | 'dashboard'
  | 'catalog'
  | 'test'
  | 'result'
  | 'history'
  | 'voiceSupport'
  | 'selfRealization'
  | 'statistics'
  | 'specialistBrief'
  | 'therapyMap'
  | 'neuroArena'
  | 'pathCoach'

interface AppState {
  screen: Screen
  authReady: boolean
  setScreen: (s: Screen) => void
  setAuthReady: (v: boolean) => void
  currentTestId: string | null
  currentQuestionIndex: number
  answers: number[]
  setCurrentTest: (testId: string | null) => void
  setQuestionIndex: (i: number) => void
  setAnswers: (a: number[]) => void
  addAnswer: (value: number) => void
  lastSavedResultId: string | null
  setLastSavedResultId: (id: string | null) => void
  openResultId: string | null
  setOpenResultId: (id: string | null) => void
  resetTest: () => void
  /** Открыть экран результата по id из истории — один вызов, без промежуточного рендера */
  openResultFromHistory: (resultId: string) => void
  /** Тест открыт из чата ИИ-Венеры — после результата не грузим фразы для бота, пишем сводку в чат Венеры */
  pathCoachReturnAfterTest: boolean
  setPathCoachReturnAfterTest: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  screen: 'dashboard',
  authReady: false,
  setScreen: (screen) => set({ screen }),
  setAuthReady: (authReady) => set({ authReady }),
  currentTestId: null,
  currentQuestionIndex: 0,
  answers: [],
  setCurrentTest: (currentTestId) => set({ currentTestId, currentQuestionIndex: 0, answers: [] }),
  setQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setAnswers: (answers) => set({ answers }),
  addAnswer: (value) => set((s) => ({ answers: [...s.answers, value], currentQuestionIndex: s.currentQuestionIndex + 1 })),
  lastSavedResultId: null,
  setLastSavedResultId: (lastSavedResultId) => set({ lastSavedResultId }),
  openResultId: null,
  setOpenResultId: (openResultId) => set({ openResultId }),
  resetTest: () => set({ currentTestId: null, currentQuestionIndex: 0, answers: [] }),
  openResultFromHistory: (resultId) => set({ openResultId: resultId, screen: 'result' }),
  pathCoachReturnAfterTest: false,
  setPathCoachReturnAfterTest: (pathCoachReturnAfterTest) => set({ pathCoachReturnAfterTest }),
}))
