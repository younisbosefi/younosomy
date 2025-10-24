'use client'

interface WarResultModalProps {
  isOpen: boolean
  playerWon: boolean
  enemyName: string
  onClose: () => void
}

export default function WarResultModal({
  isOpen,
  playerWon,
  enemyName,
  onClose
}: WarResultModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className={`relative game-panel p-8 max-w-2xl w-full animate-scale-in border-4 ${
        playerWon ? 'border-green-500' : 'border-red-500'
      }`}>
        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">{playerWon ? '🎖️' : '💀'}</div>
            <h2 className={`text-4xl font-bold mb-4 ${playerWon ? 'text-green-500' : 'text-red-500'}`}>
              {playerWon ? 'VICTORY!' : 'DEFEAT!'}
            </h2>
            <p className="text-xl text-gray-300">
              {playerWon
                ? `You have defeated ${enemyName}! Your military prowess is legendary!`
                : `${enemyName} has defeated you. Your forces have been crushed.`
              }
            </p>
          </div>

          {/* Results */}
          <div className={`game-panel p-4 border-2 ${
            playerWon ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'
          }`}>
            <h3 className={`text-sm font-semibold mb-2 ${playerWon ? 'text-green-400' : 'text-red-400'}`}>
              {playerWon ? '🎉 SPOILS OF WAR' : '💀 CONSEQUENCES OF DEFEAT'}
            </h3>
            <div className="text-sm space-y-1">
              {playerWon ? (
                <>
                  <p className="text-green-300">✓ GDP increased by 15%</p>
                  <p className="text-green-300">✓ Military strength increased by 20%</p>
                  <p className="text-green-300">✓ Global reputation increased by 30 points</p>
                  <p className="text-green-300">✓ Treasury increased by 10% of GDP</p>
                  <p className="text-yellow-300">• Happiness decreased by 5% (war casualties)</p>
                </>
              ) : (
                <>
                  <p className="text-red-300">✗ GDP decreased by 25%</p>
                  <p className="text-red-300">✗ Military strength reduced by 40%</p>
                  <p className="text-red-300">✗ Security reduced by 30%</p>
                  <p className="text-red-300">✗ Happiness decreased by 20%</p>
                  <p className="text-red-300">✗ Treasury reduced by 20% of GDP</p>
                  <p className="text-red-300">✗ Debt increased by 30% of GDP</p>
                  <p className="text-red-300">✗ Global reputation decreased by 40 points</p>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full py-4 px-6 rounded-lg font-bold transform hover:scale-105
                       transition-all duration-200 shadow-lg ${
              playerWon
                ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/50'
                : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/50'
            } text-white`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
