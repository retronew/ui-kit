export type Theme = 'system' | 'light' | 'dark'

export interface Settings {
  notifications: boolean
  syncOnLaunch: boolean
  theme: Theme
}
