'use client'

import { useState } from 'react'
import { Country, GameLength } from '@/types/country'
import { useGameEngine } from '@/hooks/useGameEngine'
import { useGamePersistence } from '@/hooks/useGamePersistence'
import ComprehensiveStatsPanel from './ComprehensiveStatsPanel'
import ChatStyleEventLog from './ChatStyleEventLog'
import GameWorldMap from './GameWorldMap'
import ImmersiveActionsPanel from './ImmersiveActionsPanel'
import CountryFlag from './CountryFlag'
import { formatCurrency } from '@/utils/formatting'

interface ComprehensiveGameUIProps {
  country: Country
  onExit: () => void
}

export default function ComprehensiveGameUI({ country, onExit }: ComprehensiveGameUIProps) {
  const [gameLength, setGameLength] = useState<GameLength>(10)
  const [showLengthSelection, setShowLengthSelection] = useState(true)
  const [selectedForeignCountry, setSelectedForeignCountry] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'quick' | 'economic' | 'domestic' | 'foreign'>('quick')

  const {
    gameState,
    gameOver,
    gameOverReason,
    togglePlayPause,
    cycleSpeed,
    executeAction,
  } = useGameEngine(country, gameLength)

  // Auto-save game state every 2 minutes and save final score
  useGamePersistence(country.id, gameState, gameOver)

  const handleCountryClick = (countryId: string) => {
    setSelectedForeignCountry(countryId)
    setActiveTab('foreign')
  }

  if (showLengthSelection) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-game-darker via-game-dark to-game-darker">
        <div className="game-panel p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Select Game Length</h2>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Choose how long you want to lead {country.name}
          </p>

          <div className="space-y-3">
            {[5, 10, 25].map((years) => (
              <button
                key={years}
                onClick={() => {
                  setGameLength(years as GameLength)
                  setShowLengthSelection(false)
                }}
                className="w-full p-4 rounded-lg border-2 border-game-border hover:border-game-accent bg-game-darker hover:bg-game-dark transition-all"
              >
                <div className="text-2xl font-bold mb-1">{years} Years</div>
                <div className="text-xs text-gray-400">{years * 365} days</div>
              </button>
            ))}
          </div>

          <button
            onClick={onExit}
            className="w-full mt-4 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors"
          >
            Back to Country Selection
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-game-darker via-game-dark to-game-darker">
        <div className="game-panel p-8 max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-4">
            {gameState.uprisingProgress >= 30 ? '💀 GAME OVER' : '🎉 GAME COMPLETE'}
          </h1>
          <p className="text-xl text-gray-300 mb-6">{gameOverReason}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="game-panel bg-game-darker p-4">
              <div className="text-xs text-gray-400 uppercase mb-1">Final Score</div>
              <div className={`text-3xl font-bold ${gameState.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.score.toFixed(0)}
              </div>
            </div>
            <div className="game-panel bg-game-darker p-4">
              <div className="text-xs text-gray-400 uppercase mb-1">Days Survived</div>
              <div className="text-3xl font-bold text-blue-400">{gameState.currentDay}</div>
            </div>
            <div className="game-panel bg-game-darker p-4">
              <div className="text-xs text-gray-400 uppercase mb-1">Final GDP</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(gameState.gdp * 1_000_000_000)}</div>
            </div>
            <div className="game-panel bg-game-darker p-4">
              <div className="text-xs text-gray-400 uppercase mb-1">Final Happiness</div>
              <div className="text-2xl font-bold text-yellow-400">{gameState.happiness.toFixed(0)}%</div>
            </div>
          </div>

          <button
            onClick={onExit}
            className="px-8 py-3 bg-game-accent hover:bg-blue-600 rounded-lg font-bold transition-all"
          >
            Return to Country Selection
          </button>
        </div>
      </div>
    )
  }

  const progress = (gameState.currentDay / gameState.totalDays) * 100
  const yearsRemaining = ((gameState.totalDays - gameState.currentDay) / 365).toFixed(1)

  return (
    <div className="h-screen flex flex-col bg-game-darker">
      {/* Header */}
      <div className="bg-game-dark border-b border-game-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CountryFlag countryCode={country.code} size="md" />
            <div>
              <h1 className="text-xl font-bold">{country.name}</h1>
              <p className="text-sm text-gray-400">Economic Simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Day {gameState.currentDay} of {gameState.totalDays}</div>
              <div className="text-lg font-semibold">{yearsRemaining} years remaining</div>
            </div>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Exit Game
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Stats */}
        <div className="w-80 bg-game-dark border-r border-game-border overflow-hidden">
          <ComprehensiveStatsPanel
            gameState={gameState}
            onOpenActions={() => {}}
          />
        </div>

        {/* Center - Interactive Map */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative bg-gradient-to-br from-blue-950 via-purple-950 to-blue-950 overflow-hidden">
            <GameWorldMap
              gameState={gameState}
              onCountryClick={handleCountryClick}
            />
          </div>

          {/* Immersive Actions Panel (overlays on map) */}
          <ImmersiveActionsPanel
            gameState={gameState}
            onAction={executeAction}
            selectedForeignCountry={selectedForeignCountry}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Right Sidebar - Events */}
        <div className="w-80 bg-game-dark border-l border-game-border overflow-hidden">
          <ChatStyleEventLog events={gameState.events} />
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="bg-game-dark border-t border-game-border p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayPause}
                className={`w-12 h-12 flex items-center justify-center rounded transition-colors text-xl ${
                  gameState.isPlaying
                    ? 'bg-game-accent hover:bg-blue-600'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {gameState.isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={cycleSpeed}
                className="px-4 h-12 flex items-center justify-center bg-game-dark border border-game-border hover:bg-game-border rounded transition-colors font-bold"
              >
                {gameState.gameSpeed}x ⏩
              </button>
            </div>
            <div className="text-sm text-gray-400">
              Progress: {progress.toFixed(1)}% | {yearsRemaining} years remaining
            </div>
          </div>
          <div className="w-full bg-game-darker rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

function getFlagEmoji(countryCode: string): string {
  const flagMap: Record<string, string> = {
    'US': '🇺🇸',
    'DE': '🇩🇪',
    'GB': '🇬🇧',
    'FR': '🇫🇷',
    'CN': '🇨🇳',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'RU': '🇷🇺',
    'SO': '🇸🇴',
    'VE': '🇻🇪',
    'AF': '🇦🇫',
    'JP': '🇯🇵',
  }
  return flagMap[countryCode] || '🏳️'
}
