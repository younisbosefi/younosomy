'use client'

import { useState } from 'react'
import React from 'react'
import { Country } from '@/types/country'
import { GameLength, GameState } from '@/types/game'
import { useGameEngine } from '@/hooks/useGameEngine'
import { useGamePersistence } from '@/hooks/useGamePersistence'
import ComprehensiveStatsPanel from './ComprehensiveStatsPanel'
import ChatStyleEventLog from './ChatStyleEventLog'
import GameWorldMap from './GameWorldMap'
import ImmersiveActionsPanel from './ImmersiveActionsPanel'
import CountryFlag from './CountryFlag'
import UprisingModal from './UprisingModal'
import WarConfirmationModal from './WarConfirmationModal'
import WarResultModal from './WarResultModal'
import DecisionModal from './DecisionModal'
import { formatCurrency } from '@/utils/formatting'
import { createCriticalEvent } from '@/utils/eventGenerator'
import { validateWarDeclaration } from '@/utils/warCalculations'
import * as gameActions from '@/utils/gameActions'
import { countries } from '@/data/countries'

interface ComprehensiveGameUIProps {
  country: Country
  onExit: () => void
  savedGameState?: GameState | null
  onNewGame?: () => void
}

export default function ComprehensiveGameUI({ country, onExit, savedGameState, onNewGame }: ComprehensiveGameUIProps) {
  const [gameLength, setGameLength] = useState<GameLength>(10)
  const [showLengthSelection, setShowLengthSelection] = useState(!savedGameState)
  const [selectedForeignCountry, setSelectedForeignCountry] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'economy' | 'domestic' | 'foreign'>('economy')

  // War modal states
  const [showWarConfirmation, setShowWarConfirmation] = useState(false)
  const [warTarget, setWarTarget] = useState<string>('')
  const [warValidation, setWarValidation] = useState<ReturnType<typeof validateWarDeclaration> | null>(null)

  // Event batching to prevent spam
  const lastEventRef = React.useRef<{ message: string; time: number } | null>(null)

  const {
    gameState,
    gameOver,
    gameOverReason,
    togglePlayPause,
    cycleSpeed,
    executeAction,
    triggerGameOver,
    handleDecisionChoice,
  } = useGameEngine(country, gameLength, savedGameState)

  // Auto-save game state every 2 minutes and save final score
  useGamePersistence(country.id, gameState, gameOver)

  const handleCountryClick = (countryId: string) => {
    setSelectedForeignCountry(countryId)
    setActiveTab('foreign')
  }

  const handleUprisingFight = () => {
    const success = Math.random() < 0.5 // 50% chance

    if (success) {
      // Player successfully suppresses the uprising
      executeAction({
        success: true,
        message: 'Uprising suppressed!',
        events: [
          createCriticalEvent(
            gameState,
            '🎖️ UPRISING SUPPRESSED! Your forces have successfully put down the rebellion. Happiness has been restored as a final warning. Do not let this happen again!',
            'domestic'
          )
        ],
        stateChanges: {
          uprisingTriggered: false,
          happiness: gameState.previousHappiness // Restore previous happiness
        }
      })
    } else {
      // Player fails to suppress - game over
      executeAction({
        success: false,
        message: 'Uprising victorious!',
        events: [
          createCriticalEvent(
            gameState,
            '💀 UPRISING VICTORIOUS! Your forces have been overwhelmed. The people have overthrown your government. Your reign has ended.',
            'domestic'
          )
        ],
        stateChanges: {
          uprisingTriggered: false
        }
      })
      triggerGameOver('YOU HAVE BEEN OVERTHROWN! The people have risen against you.')
    }
  }

  const handleUprisingSurrender = () => {
    executeAction({
      success: false,
      message: 'You have surrendered power.',
      events: [
        createCriticalEvent(
          gameState,
          '🏳️ SURRENDER: You have stepped down from power. The people have won. Your reign has ended.',
          'domestic'
        )
      ],
      stateChanges: {
        uprisingTriggered: false
      }
    })
    triggerGameOver('You surrendered to the uprising. Your reign has ended.')
  }

  // Custom execute action with event debouncing
  const handleExecuteAction = (result: any) => {
    const now = Date.now()
    const batchWindow = 2000 // 2 seconds

    // Check if this is a repeat event
    if (result.events && result.events.length > 0) {
      const firstEvent = result.events[0]
      const eventMessage = firstEvent.message?.substring(0, 50) // First 50 chars

      if (lastEventRef.current &&
          lastEventRef.current.message === eventMessage &&
          (now - lastEventRef.current.time) < batchWindow) {
        // Same event within 2 seconds - skip logging but apply state changes
        executeAction({ ...result, events: [] })
        return
      }

      lastEventRef.current = { message: eventMessage, time: now }
    }

    executeAction(result)
  }

  const handleWarDeclaration = (targetCountryId: string) => {
    const validation = validateWarDeclaration(gameState, targetCountryId)

    if (!validation.canDeclareWar) {
      // Show rejection reasons in event log
      executeAction({
        success: false,
        message: 'Cannot declare war',
        events: validation.reasons.map(reason => createCriticalEvent(gameState, `⚔️ WAR BLOCKED: ${reason}`, 'military')),
        stateChanges: {}
      })
      return
    }

    // Show confirmation modal with stats
    setWarTarget(targetCountryId)
    setWarValidation(validation)
    setShowWarConfirmation(true)
  }

  const handleWarConfirm = () => {
    if (!warTarget) return

    setShowWarConfirmation(false)
    const result = gameActions.declareWar(gameState, warTarget)
    executeAction(result)
    setWarTarget('')
    setWarValidation(null)
  }

  const handleWarCancel = () => {
    setShowWarConfirmation(false)
    setWarTarget('')
    setWarValidation(null)
  }

  const handleWarResultClose = () => {
    executeAction({
      success: true,
      message: 'War concluded',
      events: [],
      stateChanges: {
        pendingWarResult: null
      }
    })
  }

  if (showLengthSelection) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-game-darker via-game-dark to-game-darker">
        <div className="game-panel p-8 max-w-md">
          {savedGameState ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-center">Resume Game?</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">
                You have a saved game for {country.name}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setGameLength(savedGameState.gameLength)
                    setShowLengthSelection(false)
                  }}
                  className="w-full p-4 rounded-lg border-2 border-green-500 hover:border-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all"
                >
                  <div className="text-2xl font-bold mb-1">🔄 RESUME GAME</div>
                  <div className="text-xs text-gray-400">
                    Day {savedGameState.currentDay} of {savedGameState.totalDays} • Score: {savedGameState.score.toFixed(0)}
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    if (onNewGame) onNewGame()
                    setShowLengthSelection(true)
                  }}
                  className="w-full p-4 rounded-lg border-2 border-game-border hover:border-game-accent bg-game-darker hover:bg-game-dark transition-all"
                >
                  <div className="text-2xl font-bold mb-1">🆕 NEW GAME</div>
                  <div className="text-xs text-gray-400">Start fresh with this country</div>
                </button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

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
            {gameState.currentDay >= gameState.totalDays ? '🎉 GAME COMPLETE' : '💀 GAME OVER'}
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
            <div className="flex gap-2">
              {savedGameState && onNewGame && (
                <button
                  onClick={() => {
                    if (onNewGame) onNewGame()
                    setShowLengthSelection(true)
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors text-sm"
                >
                  New Game
                </button>
              )}
              <button
                onClick={onExit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Exit Game
              </button>
            </div>
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
            onAction={handleExecuteAction}
            selectedForeignCountry={selectedForeignCountry}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onWarDeclaration={handleWarDeclaration}
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

      {/* Uprising Modal */}
      <UprisingModal
        isOpen={gameState.uprisingTriggered}
        onFight={handleUprisingFight}
        onSurrender={handleUprisingSurrender}
      />

      {/* War Confirmation Modal */}
      {warValidation && (
        <WarConfirmationModal
          isOpen={showWarConfirmation}
          enemyName={warValidation.reasons.length === 0 ? countries.find(c => c.id === warTarget)?.name || 'Unknown' : 'Error'}
          winProbability={warValidation.winProbability}
          playerPower={warValidation.playerPower}
          enemyPower={warValidation.enemyPower}
          warCost={warValidation.warCost}
          happinessCost={warValidation.happinessCost}
          onConfirm={handleWarConfirm}
          onCancel={handleWarCancel}
        />
      )}

      {/* War Result Modal */}
      {gameState.pendingWarResult && (
        <WarResultModal
          isOpen={!!gameState.pendingWarResult}
          playerWon={gameState.pendingWarResult.playerWon}
          enemyName={gameState.pendingWarResult.enemyName}
          onClose={handleWarResultClose}
        />
      )}

      {/* Decision Modal - Queue system (FIFO) */}
      {gameState.pendingDecisions.length > 0 && (
        <DecisionModal
          isOpen={true}
          decision={gameState.pendingDecisions[0]}
          gameState={gameState}
          onChoice={handleDecisionChoice}
        />
      )}
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
