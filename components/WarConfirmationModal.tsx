'use client'

interface WarConfirmationModalProps {
  isOpen: boolean
  enemyName: string
  winProbability: number
  playerPower: number
  enemyPower: number
  warCost: number
  happinessCost: number
  onConfirm: () => void
  onCancel: () => void
}

export default function WarConfirmationModal({
  isOpen,
  enemyName,
  winProbability,
  playerPower,
  enemyPower,
  warCost,
  happinessCost,
  onConfirm,
  onCancel
}: WarConfirmationModalProps) {
  if (!isOpen) return null

  const winChanceColor = winProbability >= 70 ? 'text-green-400' : winProbability >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative game-panel p-8 max-w-2xl w-full animate-scale-in border-4 border-red-500">
        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-4xl font-bold mb-4 text-red-500">
              DECLARE WAR?
            </h2>
            <p className="text-xl text-gray-300">
              You are about to declare war on {enemyName}
            </p>
          </div>

          {/* Win Probability */}
          <div className="game-panel bg-game-darker p-4 text-center border-2 border-yellow-500">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">WIN PROBABILITY</h3>
            <div className={`text-5xl font-bold ${winChanceColor}`}>
              {winProbability.toFixed(1)}%
            </div>
          </div>

          {/* Stats Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="game-panel bg-blue-500/10 p-4 border-2 border-blue-500">
              <h3 className="text-sm font-semibold text-blue-400 mb-2 text-center">YOUR FORCES</h3>
              <div className="text-3xl font-bold text-blue-400 text-center">
                {playerPower.toFixed(0)}
              </div>
              <div className="text-xs text-gray-400 text-center mt-1">
                (Military + Security + Allies)
              </div>
            </div>
            <div className="game-panel bg-red-500/10 p-4 border-2 border-red-500">
              <h3 className="text-sm font-semibold text-red-400 mb-2 text-center">ENEMY FORCES</h3>
              <div className="text-3xl font-bold text-red-400 text-center">
                {enemyPower.toFixed(0)}
              </div>
              <div className="text-xs text-gray-400 text-center mt-1">
                (Military + Security + Allies)
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="game-panel bg-red-500/10 p-4 border-2 border-red-500">
            <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ WAR COSTS</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Treasury Cost:</span>
                <span className="text-white ml-2">${warCost.toFixed(1)}B</span>
              </div>
              <div>
                <span className="text-gray-400">Happiness Cost:</span>
                <span className="text-white ml-2">-{happinessCost}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              War will last 20 to 50 days. If you lose, expect massive stat penalties!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 px-6 rounded-lg border-2 border-gray-500 hover:bg-gray-800
                       transition-all duration-200 font-semibold text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 px-6 rounded-lg bg-red-600 hover:bg-red-700
                       transition-all duration-200 font-bold transform hover:scale-105
                       shadow-lg hover:shadow-red-500/50 text-white"
            >
              Declare War
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
