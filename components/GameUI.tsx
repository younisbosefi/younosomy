'use client'

import { useState, useEffect } from 'react'
import { Country, WorldEvent } from '@/types/country'

interface GameUIProps {
  country: Country
}

export default function GameUI({ country }: GameUIProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 3>(1)
  const [progress, setProgress] = useState(0)
  const [worldEvents, setWorldEvents] = useState<WorldEvent[]>([
    {
      id: '1',
      message: 'North Korea launched missile tests',
      timestamp: new Date(),
      type: 'world',
    },
    {
      id: '2',
      message: 'European Union announces new trade agreement',
      timestamp: new Date(),
      type: 'world',
    },
  ])
  const [playerEvents, setPlayerEvents] = useState<WorldEvent[]>([
    {
      id: '1',
      message: 'You increased interest rate by 1.5%',
      timestamp: new Date(),
      type: 'player',
    },
  ])

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + (0.5 * playbackSpeed)
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying, playbackSpeed])

  const togglePlayPause = () => setIsPlaying(!isPlaying)

  const cycleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(2)
    else if (playbackSpeed === 2) setPlaybackSpeed(3)
    else setPlaybackSpeed(1)
  }

  return (
    <div className="h-screen flex flex-col bg-game-darker">
      {/* Header */}
      <div className="bg-game-dark border-b border-game-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{getFlagEmoji(country.code)}</div>
            <div>
              <h1 className="text-xl font-bold">{country.name}</h1>
              <p className="text-sm text-gray-400">Economic Simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Game Time</div>
              <div className="text-lg font-semibold">Year 1, Month 1</div>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
              Exit Game
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Stats */}
        <div className="w-80 bg-game-dark border-r border-game-border overflow-y-auto">
          <StatsPanel country={country} />
        </div>

        {/* Center - Map */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-gradient-to-br from-blue-950 to-purple-950 overflow-hidden">
            <MapView country={country} />
          </div>
        </div>

        {/* Right Sidebar - Events */}
        <div className="w-80 bg-game-dark border-l border-game-border flex flex-col">
          <EventsPanel worldEvents={worldEvents} playerEvents={playerEvents} />
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="bg-game-dark border-t border-game-border p-4">
        <ProgressBar
          progress={progress}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onTogglePlayPause={togglePlayPause}
          onCycleSpeed={cycleSpeed}
        />
      </div>
    </div>
  )
}

function StatsPanel({ country }: { country: Country }) {
  const stats = [
    { label: 'GDP', value: `$${country.stats.gdp}B`, icon: '💰', color: 'text-green-400' },
    { label: 'Population', value: `${country.stats.population}M`, icon: '👥', color: 'text-blue-400' },
    { label: 'Stability', value: `${country.stats.stability}%`, icon: '🏛️', color: 'text-purple-400' },
    { label: 'Happiness', value: `${country.stats.happiness}%`, icon: '😊', color: 'text-yellow-400' },
  ]

  const economicStats = [
    { label: 'Inflation Rate', value: '2.3%', trend: 'up' },
    { label: 'Unemployment', value: '4.1%', trend: 'down' },
    { label: 'Interest Rate', value: '3.5%', trend: 'stable' },
    { label: 'Trade Balance', value: '+$45B', trend: 'up' },
  ]

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4 text-gray-300">National Overview</h2>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="game-panel p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
                <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 text-gray-300">Economic Indicators</h2>
        <div className="space-y-2">
          {economicStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between py-2 border-b border-game-border">
              <span className="text-sm text-gray-400">{stat.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{stat.value}</span>
                <TrendIndicator trend={stat.trend} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 text-gray-300">Quick Actions</h2>
        <div className="space-y-2">
          <button className="w-full game-button-secondary py-2 text-sm">
            📊 Economic Policy
          </button>
          <button className="w-full game-button-secondary py-2 text-sm">
            🤝 Diplomacy
          </button>
          <button className="w-full game-button-secondary py-2 text-sm">
            ⚙️ Infrastructure
          </button>
          <button className="w-full game-button-secondary py-2 text-sm">
            🛡️ Military
          </button>
        </div>
      </div>
    </div>
  )
}

function MapView({ country }: { country: Country }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-9xl mb-4">{getFlagEmoji(country.code)}</div>
        <h2 className="text-3xl font-bold text-white/80">{country.name}</h2>
        <p className="text-gray-400">Interactive world map coming soon...</p>
        <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
          <div className="game-panel p-4 bg-blue-500/10 border-blue-500/30">
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-sm text-gray-400">Explore World</div>
          </div>
          <div className="game-panel p-4 bg-green-500/10 border-green-500/30">
            <div className="text-2xl mb-2">🤝</div>
            <div className="text-sm text-gray-400">View Allies</div>
          </div>
          <div className="game-panel p-4 bg-red-500/10 border-red-500/30">
            <div className="text-2xl mb-2">⚔️</div>
            <div className="text-sm text-gray-400">Conflicts</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventsPanel({ worldEvents, playerEvents }: { worldEvents: WorldEvent[]; playerEvents: WorldEvent[] }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-game-border">
        <h2 className="text-lg font-bold">Events Log</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* World Events */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">🌍 WORLD EVENTS</h3>
          <div className="space-y-2">
            {worldEvents.map((event) => (
              <div key={event.id} className="game-panel p-3 bg-blue-500/5 border-blue-500/20">
                <p className="text-sm text-gray-300">{event.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {event.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Player Events */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">📋 YOUR ACTIONS</h3>
          <div className="space-y-2">
            {playerEvents.map((event) => (
              <div key={event.id} className="game-panel p-3 bg-green-500/5 border-green-500/20">
                <p className="text-sm text-gray-300">{event.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {event.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({
  progress,
  isPlaying,
  playbackSpeed,
  onTogglePlayPause,
  onCycleSpeed,
}: {
  progress: number
  isPlaying: boolean
  playbackSpeed: number
  onTogglePlayPause: () => void
  onCycleSpeed: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlayPause}
            className="w-10 h-10 flex items-center justify-center bg-game-accent hover:bg-blue-600 rounded transition-colors"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={onCycleSpeed}
            className="px-4 h-10 flex items-center justify-center bg-game-dark border border-game-border hover:bg-game-border rounded transition-colors"
          >
            {playbackSpeed}x ⏩
          </button>
        </div>
        <div className="text-sm text-gray-400">
          Progress: {progress.toFixed(1)}% | 5 Years Remaining
        </div>
      </div>
      <div className="w-full bg-game-darker rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-green-400">↗</span>
  if (trend === 'down') return <span className="text-red-400">↘</span>
  return <span className="text-gray-400">→</span>
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
