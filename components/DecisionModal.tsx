'use client'

import { Decision, DecisionChoice, GameState } from '@/types/game'
import { createPlayerEvent } from '@/utils/eventGenerator'

interface DecisionModalProps {
  isOpen: boolean
  decision: Decision
  gameState: GameState
  onChoice: (choice: DecisionChoice) => void
}

export default function DecisionModal({ isOpen, decision, gameState, onChoice }: DecisionModalProps) {
  if (!isOpen) return null

  const getUrgencyStyles = () => {
    switch (decision.urgency) {
      case 'critical':
        return 'border-red-600 bg-red-950/30'
      case 'high':
        return 'border-orange-500 bg-orange-950/30'
      case 'medium':
        return 'border-yellow-500 bg-yellow-950/30'
      case 'low':
        return 'border-blue-500 bg-blue-950/30'
    }
  }

  const getUrgencyLabel = () => {
    switch (decision.urgency) {
      case 'critical':
        return '🚨 CRITICAL'
      case 'high':
        return '⚠️ HIGH PRIORITY'
      case 'medium':
        return '📢 MEDIUM PRIORITY'
      case 'low':
        return '💡 LOW PRIORITY'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`game-panel border-4 ${getUrgencyStyles()} max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Scanline effect */}
        <div className="scanline"></div>

        {/* Header */}
        <div className="text-center mb-4 pb-4 border-b-2 border-game-border">
          <div className="text-xs font-mono text-gray-400 mb-2">{getUrgencyLabel()}</div>
          <div className="text-5xl mb-2">{decision.icon}</div>
          <h2 className="text-3xl font-bold font-mono text-game-text mb-2">{decision.title}</h2>
          <div className="text-xs font-mono text-gray-400">
            GAME PAUSED - AWAITING YOUR DECISION
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-black/40 rounded border border-game-border">
          <p className="text-base font-mono text-game-text leading-relaxed">
            {decision.description}
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          {decision.choices.map((choice, index) => {
            const successChance = (choice.outcomes.success * 100).toFixed(0)
            const hasRisk = choice.outcomes.success < 1.0

            return (
              <button
                key={index}
                onClick={() => onChoice(choice)}
                className="w-full text-left p-4 bg-game-darker border-2 border-game-border hover:border-game-accent transition-all duration-200 rounded action-button group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold font-mono text-lg text-game-text group-hover:text-game-accent transition-colors">
                    {choice.label}
                  </div>
                  {hasRisk && (
                    <div className={`text-xs font-mono px-2 py-1 rounded ${
                      choice.outcomes.success >= 0.70 ? 'bg-green-900/50 text-green-400' :
                      choice.outcomes.success >= 0.50 ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {successChance}% SUCCESS
                    </div>
                  )}
                </div>

                <p className="text-sm font-mono text-gray-400 mb-3">
                  {choice.description}
                </p>

                {/* Outcome preview */}
                <div className="text-xs font-mono space-y-1">
                  {choice.outcomes.success === 1.0 ? (
                    <div className="text-gray-500">
                      → {choice.outcomes.successEffect.message}
                    </div>
                  ) : (
                    <>
                      <div className="text-green-400">
                        ✓ SUCCESS: {choice.outcomes.successEffect.message}
                      </div>
                      {choice.outcomes.failureEffect && (
                        <div className="text-red-400">
                          ✗ FAILURE: {choice.outcomes.failureEffect.message}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Warning for critical decisions */}
        {decision.urgency === 'critical' && (
          <div className="mt-6 p-3 bg-red-950/50 border-2 border-red-600 rounded">
            <p className="text-sm font-mono text-red-400 text-center">
              ⚠️ This decision could have SEVERE consequences! Choose wisely!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
