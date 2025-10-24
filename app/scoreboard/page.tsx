'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getScoreboard, ScoreboardEntry } from '@/utils/gameStorage'
import { formatCurrency } from '@/utils/formatting'

export default function ScoreboardPage() {
  const router = useRouter()
  const [scores, setScores] = useState<ScoreboardEntry[]>([])

  useEffect(() => {
    setScores(getScoreboard())
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-darker via-game-dark to-game-darker p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
            🏆 SCOREBOARD 🏆
          </h1>
          <p className="text-gray-400">Your best runs for each country</p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 px-6 py-3 bg-game-dark border-2 border-game-border hover:border-game-accent rounded transition-all font-bold"
        >
          ← Back to Home
        </button>

        {/* Scoreboard */}
        {scores.length === 0 ? (
          <div className="game-panel p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Scores Yet</h2>
            <p className="text-gray-400 mb-6">
              Complete a game to see your scores here!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-game-accent hover:bg-blue-600 rounded font-bold transition-all"
            >
              Start Playing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((entry, index) => (
              <div
                key={entry.countryId}
                className={`game-panel p-6 hover:scale-[1.02] transition-all cursor-pointer ${
                  index === 0 ? 'border-yellow-500 bg-yellow-500/10' : ''
                }`}
                onClick={() => router.push(`/game/${entry.countryId}`)}
              >
                <div className="flex items-center justify-between">
                  {/* Rank & Country */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`text-3xl font-bold ${
                        index === 0
                          ? 'text-yellow-400'
                          : index === 1
                          ? 'text-gray-300'
                          : index === 2
                          ? 'text-orange-600'
                          : 'text-gray-500'
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div className="text-4xl">{entry.countryFlag}</div>
                    <div>
                      <h3 className="text-xl font-bold">{entry.countryName}</h3>
                      <p className="text-sm text-gray-400">
                        Day {entry.finalDay} of {entry.totalDays} ({((entry.finalDay / entry.totalDays) * 100).toFixed(0)}% complete)
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6 flex-1">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase mb-1">Score</div>
                      <div className={`text-2xl font-bold ${
                        entry.finalScore >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {entry.finalScore.toFixed(0)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase mb-1">GDP</div>
                      <div className="text-lg font-bold text-green-400">
                        ${entry.finalGDP.toFixed(0)}B
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase mb-1">Happiness</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {entry.finalHappiness.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase mb-1">Debt/GDP</div>
                      <div className={`text-lg font-bold ${
                        entry.finalDebt < 60 ? 'text-green-400' : entry.finalDebt < 100 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {entry.finalDebt.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Play Again Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/game/${entry.countryId}`)
                    }}
                    className="px-4 py-2 bg-game-accent hover:bg-blue-600 rounded font-bold transition-all"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
