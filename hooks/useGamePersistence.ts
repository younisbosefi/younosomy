import { useEffect, useRef } from 'react'
import { GameState } from '@/types/game'
import { saveGameState, loadGameState, saveScoreboardEntry, ScoreboardEntry } from '@/utils/gameStorage'

export function useGamePersistence(
  countryId: string,
  gameState: GameState,
  gameOver: boolean
) {
  const saveIntervalRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>('')

  // Auto-save every 2 minutes
  useEffect(() => {
    if (gameOver) return

    // Save immediately on first render
    saveGameState(countryId, gameState)

    // Then save every 2 minutes
    saveIntervalRef.current = setInterval(() => {
      const currentState = JSON.stringify(gameState)
      // Only save if state has actually changed
      if (currentState !== lastSavedRef.current) {
        saveGameState(countryId, gameState)
        lastSavedRef.current = currentState
        console.log('Game auto-saved')
      }
    }, 2 * 60 * 1000) // 2 minutes

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current)
      }
    }
  }, [countryId, gameState, gameOver])

  // Save final score when game ends
  useEffect(() => {
    if (gameOver && gameState) {
      const scoreboardEntry: ScoreboardEntry = {
        countryId: gameState.country.id,
        countryName: gameState.country.name,
        countryFlag: gameState.country.flag,
        finalScore: gameState.score,
        finalDay: gameState.currentDay,
        totalDays: gameState.totalDays,
        finalGDP: gameState.gdp,
        finalHappiness: gameState.happiness,
        finalDebt: gameState.debtToGdpRatio,
        timestamp: Date.now()
      }
      saveScoreboardEntry(scoreboardEntry)
      console.log('Final score saved to scoreboard')
    }
  }, [gameOver, gameState])
}

export { loadGameState }
