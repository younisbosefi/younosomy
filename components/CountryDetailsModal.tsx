'use client'

import { Country } from '@/types/country'
import CountryFlag from './CountryFlag'

interface CountryDetailsModalProps {
  country: Country | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function CountryDetailsModal({
  country,
  isOpen,
  onClose,
  onConfirm
}: CountryDetailsModalProps) {
  if (!isOpen || !country) return null

  const getDifficultyInfo = () => {
    switch (country.difficulty) {
      case 'easy':
        return {
          label: 'EASY',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
          description: 'Strong economy and stable institutions. Good for beginners!',
        }
      case 'medium':
        return {
          label: 'MEDIUM',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500',
          description: 'Moderate challenges with growth opportunities.',
        }
      case 'hard':
        return {
          label: 'HARD',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
          description: 'Significant challenges. Only for experienced players!',
        }
    }
  }

  const difficultyInfo = getDifficultyInfo()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative game-panel p-8 max-w-2xl w-full animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <CountryFlag countryCode={country.code} size="xl" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{country.name}</h2>
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full border-2
              ${difficultyInfo.bgColor} ${difficultyInfo.borderColor} ${difficultyInfo.color}
            `}>
              <span className="text-sm font-bold">{difficultyInfo.label}</span>
            </div>
            <p className="text-gray-400 mt-2">{difficultyInfo.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon="💰"
              label="GDP"
              value={`$${country.stats.gdp}B`}
              color="text-green-400"
            />
            <StatCard
              icon="👥"
              label="Population"
              value={`${country.stats.population}M`}
              color="text-blue-400"
            />
            <StatCard
              icon="🏛️"
              label="Stability"
              value={`${country.stats.stability}%`}
              color="text-purple-400"
            />
            <StatCard
              icon="😊"
              label="Happiness"
              value={`${country.stats.happiness}%`}
              color="text-yellow-400"
            />
          </div>

          {/* Challenge Preview */}
          <div className="game-panel bg-game-darker p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">YOUR CHALLENGE</h3>
            <p className="text-sm text-gray-300">
              Lead {country.name} through economic and political challenges.
              Make strategic decisions to improve GDP, maintain stability,
              and keep your citizens happy. Can you survive your term?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-game-border hover:bg-game-border
                       transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-6 rounded-lg bg-game-accent hover:bg-blue-600
                       transition-all duration-200 font-bold transform hover:scale-105
                       shadow-lg hover:shadow-blue-500/50"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: string
  label: string
  value: string
  color: string
}) {
  return (
    <div className="game-panel bg-game-darker p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
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
