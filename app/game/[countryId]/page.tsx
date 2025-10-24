'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { countries } from '@/data/countries'
import ComprehensiveGameUI from '@/components/ComprehensiveGameUI'
import { Country } from '@/types/country'
import { loadGameState } from '@/hooks/useGamePersistence'
import { GameState } from '@/types/game'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedGameState, setSavedGameState] = useState<GameState | null>(null)
  const [checkingSavedGame, setCheckingSavedGame] = useState(true)

  useEffect(() => {
    const countryId = params.countryId as string
    const foundCountry = countries.find(c => c.id === countryId)

    if (!foundCountry) {
      // Invalid country, redirect to home
      router.push('/')
      return
    }

    setCountry(foundCountry)

    // Check for saved game state
    const savedState = loadGameState(countryId)
    if (savedState && savedState.currentDay < savedState.totalDays) {
      setSavedGameState(savedState)
      console.log('Found saved game, resuming...')
    }
    
    setCheckingSavedGame(false)
    setLoading(false)
  }, [params, router])

  const handleExit = () => {
    // Clear saved game for this country
    document.cookie = `game_${params.countryId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    router.push('/')
  }

  const handleNewGame = () => {
    // Clear any saved game and start fresh
    document.cookie = `game_${params.countryId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    setSavedGameState(null)
  }

  if (loading || !country || checkingSavedGame) {
    return (
      <div className="h-screen flex items-center justify-center bg-game-darker">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    )
  }

  return (
    <ComprehensiveGameUI 
      country={country} 
      onExit={handleExit}
      savedGameState={savedGameState}
      onNewGame={handleNewGame}
    />
  )
}
