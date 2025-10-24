'use client'

interface UprisingModalProps {
  isOpen: boolean
  onFight: () => void
  onSurrender: () => void
}

export default function UprisingModal({
  isOpen,
  onFight,
  onSurrender
}: UprisingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative game-panel p-8 max-w-2xl w-full animate-scale-in border-4 border-red-500">
        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🔥</div>
            <h2 className="text-4xl font-bold mb-4 text-red-500">
              UPRISING HAS BEGUN!
            </h2>
            <p className="text-xl text-gray-300 mb-2">
              The people have taken to the streets!
            </p>
            <p className="text-lg text-gray-400">
              Your citizens are revolting against your rule. This is a critical moment.
            </p>
          </div>

          {/* Warning Box */}
          <div className="game-panel bg-red-500/10 p-4 border-2 border-red-500">
            <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ CRITICAL DECISION</h3>
            <p className="text-sm text-gray-300">
              <strong className="text-red-400">Fight It:</strong> Attempt to suppress the uprising.
              You have a <strong className="text-yellow-400">50% chance</strong> of success.
              If successful, happiness will be restored giving you a last chance.
              If you fail, you will be overthrown.
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <strong className="text-red-400">Surrender:</strong> Step down from power immediately.
              Your reign ends now.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onSurrender}
              className="flex-1 py-4 px-6 rounded-lg border-2 border-gray-500 hover:bg-gray-800
                       transition-all duration-200 font-semibold text-gray-300 hover:text-white"
            >
              Surrender
            </button>
            <button
              onClick={onFight}
              className="flex-1 py-4 px-6 rounded-lg bg-red-600 hover:bg-red-700
                       transition-all duration-200 font-bold transform hover:scale-105
                       shadow-lg hover:shadow-red-500/50 text-white"
            >
              Fight It (50% Chance)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
