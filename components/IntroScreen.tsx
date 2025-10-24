'use client'

import { useRouter } from 'next/navigation'

interface IntroScreenProps {
  onStart: () => void
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-game-darker via-game-dark to-game-darker">
      <div className="text-center space-y-8 p-8">
        {/* Title with glow effect */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-pulse-slow">
            YOUNOSOMY
          </h1>
          <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-game-accent to-transparent"></div>
          <p className="text-xl text-gray-400 font-light tracking-wider">
            ECONOMIC SIMULATOR
          </p>
        </div>

        {/* Subtitle */}
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-gray-300 text-lg leading-relaxed">
            Lead your nation to prosperity in this real-time economic and political strategy game.
          </p>
          <p className="text-gray-400">
            Manage economies, forge alliances, and survive the challenges of governance.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onStart}
            className="group relative px-12 py-4 text-xl font-bold text-white bg-game-accent rounded-lg
                       hover:bg-blue-600 transition-all duration-300 transform hover:scale-105
                       shadow-lg hover:shadow-blue-500/50"
          >
            <span className="relative z-10">BEGIN YOUR RULE</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={() => router.push('/scoreboard')}
            className="group relative px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg
                       hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105
                       shadow-lg hover:shadow-yellow-500/50"
          >
            <span className="relative z-10">🏆 SCOREBOARD</span>
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-12 pt-12 border-t border-game-border">
          <div className="space-y-2">
            <div className="text-3xl">🌍</div>
            <h3 className="text-sm font-semibold text-gray-300">Global Strategy</h3>
            <p className="text-xs text-gray-500">Choose from countries worldwide</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📊</div>
            <h3 className="text-sm font-semibold text-gray-300">Economic Management</h3>
            <p className="text-xs text-gray-500">Control policies and markets</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">⏱️</div>
            <h3 className="text-sm font-semibold text-gray-300">Real-Time Simulation</h3>
            <p className="text-xs text-gray-500">Watch your decisions unfold</p>
          </div>
        </div>
      </div>
    </div>
  )
}
