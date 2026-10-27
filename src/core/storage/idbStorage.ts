import { get, set, del } from 'idb-keyval'
import type { UserPreferences } from '../../types'

const PREFS_KEY = 'ios27_music_player_prefs'
const FAVORITES_KEY = 'ios27_music_player_favorites'
const DIR_HANDLE_KEY = 'ios27_music_player_dir_handle'

export const DEFAULT_PREFERENCES: UserPreferences = {
  glassOpacity: 0.16, // Default iOS 27 clear-tinted balance
  volume: 0.85,
  isMuted: false,
  playMode: 'sequence',
  eqEnabled: true,
  eqPresetId: 'flat',
  customEqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  sidebarCollapsed: false,
  visualizerMode: 'fluid',
}

export async function loadUserPreferences(): Promise<UserPreferences> {
  try {
    const saved = await get<UserPreferences>(PREFS_KEY)
    return saved ? { ...DEFAULT_PREFERENCES, ...saved } : DEFAULT_PREFERENCES
  } catch (err) {
    console.error('Failed to load user preferences:', err)
    return DEFAULT_PREFERENCES
  }
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  try {
    await set(PREFS_KEY, prefs)
  } catch (err) {
    console.error('Failed to save user preferences:', err)
  }
}

export async function loadFavorites(): Promise<string[]> {
  try {
    const favs = await get<string[]>(FAVORITES_KEY)
    return favs || []
  } catch {
    return []
  }
}

export async function saveFavorites(favIds: string[]): Promise<void> {
  try {
    await set(FAVORITES_KEY, favIds)
  } catch (err) {
    console.error('Failed to save favorites:', err)
  }
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    await set(DIR_HANDLE_KEY, handle)
  } catch (err) {
    console.warn('Could not persist directory handle:', err)
  }
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | undefined> {
  try {
    return await get<FileSystemDirectoryHandle>(DIR_HANDLE_KEY)
  } catch {
    return undefined
  }
}

export async function clearDirectoryHandle(): Promise<void> {
  try {
    await del(DIR_HANDLE_KEY)
  } catch (err) {
    console.error('Failed to clear directory handle:', err)
  }
}
