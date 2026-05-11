import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'path-to-self-auth'

export interface AuthState {
  appSaveToken: string | null
  isInitialized: boolean
  /** null — ещё не знаем (нет ответа /init с полем isPremium) */
  isPremium: boolean | null
  premiumUntilIso: string | null
  setToken: (token: string | null) => void
  setInitialized: (v: boolean) => void
  setPremium: (v: boolean | null) => void
  setPremiumUntilIso: (v: string | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      appSaveToken: null,
      isInitialized: false,
      isPremium: null,
      premiumUntilIso: null,
      setToken: (appSaveToken) => set({ appSaveToken }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      setPremium: (isPremium) => set({ isPremium }),
      setPremiumUntilIso: (premiumUntilIso) => set({ premiumUntilIso }),
      clear: () => set({ appSaveToken: null, isInitialized: false, isPremium: null, premiumUntilIso: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        appSaveToken: s.appSaveToken,
        isInitialized: s.isInitialized,
        isPremium: s.isPremium,
        premiumUntilIso: s.premiumUntilIso,
      }),
    }
  )
)
