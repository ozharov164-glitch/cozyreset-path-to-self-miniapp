import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'path-to-self-auth'

export interface AuthState {
  appSaveToken: string | null
  isInitialized: boolean
  setToken: (token: string | null) => void
  setInitialized: (v: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      appSaveToken: null,
      isInitialized: false,
      setToken: (appSaveToken) => set({ appSaveToken }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      clear: () => set({ appSaveToken: null, isInitialized: false }),
    }),
    { name: STORAGE_KEY }
  )
)
