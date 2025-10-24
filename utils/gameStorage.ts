import { GameState } from '@/types/game'
import Cookies from 'js-cookie'

const COOKIE_EXPIRY_DAYS = 30 // Keep saved games for 30 days

export function saveGameState(countryId: string, gameState: GameState): void {
  try {
    const serialized = JSON.stringify({
      ...gameState,
      // Convert Date objects to ISO strings for serialization
      events: gameState.events.map(event => ({
        ...event,
        timestamp: event.timestamp.toISOString()
      }))
    })

    Cookies.set(`game_${countryId}`, serialized, { expires: COOKIE_EXPIRY_DAYS })
  } catch (error) {
    console.error('Failed to save game state:', error)
  }
}

export function loadGameState(countryId: string): GameState | null {
  try {
    const saved = Cookies.get(`game_${countryId}`)
    if (!saved) return null

    const parsed = JSON.parse(saved)

    // Convert ISO strings back to Date objects
    return {
      ...parsed,
      events: parsed.events.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }))
    }
  } catch (error) {
    console.error('Failed to load game state:', error)
    return null
  }
}

export function clearGameState(countryId: string): void {
  Cookies.remove(`game_${countryId}`)
}

export interface ScoreboardEntry {
  countryId: string
  countryName: string
  countryFlag: string
  finalScore: number
  finalDay: number
  totalDays: number
  finalGDP: number
  finalHappiness: number
  finalDebt: number
  timestamp: number
}

export function saveScoreboardEntry(entry: ScoreboardEntry): void {
  try {
    const existing = getScoreboard()
    // Replace existing entry for this country or add new one
    const updated = existing.filter(e => e.countryId !== entry.countryId)
    updated.push(entry)

    // Sort by score descending
    updated.sort((a, b) => b.finalScore - a.finalScore)

    Cookies.set('scoreboard', JSON.stringify(updated), { expires: 365 }) // Keep for 1 year
  } catch (error) {
    console.error('Failed to save scoreboard entry:', error)
  }
}

export function getScoreboard(): ScoreboardEntry[] {
  try {
    const saved = Cookies.get('scoreboard')
    if (!saved) return []
    return JSON.parse(saved)
  } catch (error) {
    console.error('Failed to load scoreboard:', error)
    return []
  }
}
