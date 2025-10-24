'use client'

import { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { GameState } from '@/types/game'
import { countries } from '@/data/countries'
import { countryMapping } from '@/data/countryCoordinates'
import { formatCurrency } from '@/utils/formatting'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface GameWorldMapProps {
  gameState: GameState
  onCountryClick?: (countryId: string) => void
}

export default function GameWorldMap({ gameState, onCountryClick }: GameWorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [pulseEffect, setPulseEffect] = useState(0)
  const [warFlashes, setWarFlashes] = useState<string[]>([])
  const [mapPosition, setMapPosition] = useState({ coordinates: [0, 20], zoom: 1 })

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setMapPosition(position)
  }

  const centerMap = () => {
    setMapPosition({ coordinates: [0, 20], zoom: 1 })
  }

  // Pulse animation for player's country
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // War flash animation - continuous pulsing
  useEffect(() => {
    if (gameState.activeWars.length > 0) {
      const interval = setInterval(() => {
        const warCountries = gameState.activeWars.flatMap(war => [war.attacker, war.defender])
        setWarFlashes(warCountries)

        setTimeout(() => setWarFlashes([]), 300)
      }, 600) // Flash every 600ms

      return () => clearInterval(interval)
    } else {
      setWarFlashes([])
    }
  }, [gameState.activeWars.length, gameState.currentDay])

  const getCountryColor = (geo: any) => {
    const geoId = geo.id
    const geoName = geo.properties.name

    // Player's country - glowing effect
    const isPlayerCountry = geo.id === countryMapping[gameState.country.id] ||
                           geoName.includes(gameState.country.name)
    if (isPlayerCountry) {
      const intensity = 0.5 + (Math.sin(pulseEffect * 0.1) * 0.3)
      return `rgba(59, 130, 246, ${intensity})`
    }

    // War countries - flash red
    const country = countries.find(c => {
      const isoCode = countryMapping[c.id]
      return isoCode === geoId || geoName.includes(c.name)
    })

    if (country && warFlashes.includes(country.id)) {
      return '#ef4444'
    }

    // Allies - green
    if (country && gameState.allies.includes(country.id)) {
      return hoveredCountry === geoId ? '#22c55e' : '#16a34a'
    }

    // Enemies - red
    if (country && gameState.enemies.includes(country.id)) {
      return hoveredCountry === geoId ? '#f87171' : '#dc2626'
    }

    // Sanctioned countries - orange
    if (country && gameState.sanctionsOnUs.includes(country.id)) {
      return hoveredCountry === geoId ? '#fb923c' : '#ea580c'
    }

    // Other known countries - darker blue
    if (country) {
      return hoveredCountry === geoId ? '#3b82f6' : '#1e40af'
    }

    // Unknown countries
    return hoveredCountry === geoId ? '#374151' : '#1f2937'
  }

  return (
    <div className="w-full h-full relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-background animate-grid-scroll"></div>
      </div>

      {/* Map */}
      <div className="relative z-10">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 147,
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <ZoomableGroup
            center={mapPosition.coordinates as [number, number]}
            zoom={mapPosition.zoom}
            minZoom={0.8}
            maxZoom={3}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => geo.id !== 'AQ' && geo.properties.name !== 'Antarctica')
                  .map((geo) => {
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getCountryColor(geo)}
                        stroke="#0a0e1a"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none', transition: 'fill 0.3s ease' },
                          hover: { outline: 'none', cursor: 'pointer' },
                          pressed: { outline: 'none' },
                        }}
                        onMouseEnter={() => setHoveredCountry(geo.id)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onClick={() => {
                          const country = countries.find(c => {
                            const isoCode = countryMapping[c.id]
                            return isoCode === geo.id || geo.properties.name.includes(c.name)
                          })
                          if (country && country.id !== gameState.country.id && onCountryClick) {
                            onCountryClick(country.id)
                          }
                        }}
                      />
                    )
                  })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Stats Overlay - Fixed positioning */}
      <div className="absolute top-4 left-4 space-y-2 pointer-events-none z-50">
        <div className="retro-panel px-3 py-2 pointer-events-auto">
          <div className="text-xs text-green-400 font-mono">GDP GROWTH</div>
          <div className={`text-xl font-bold font-mono ${gameState.gdpGrowthRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {gameState.gdpGrowthRate > 0 ? '+' : ''}{gameState.gdpGrowthRate.toFixed(2)}%
          </div>
        </div>

        <div className="retro-panel px-3 py-2 pointer-events-auto">
          <div className="text-xs text-yellow-400 font-mono">HAPPINESS</div>
          <div className={`text-xl font-bold font-mono ${
            gameState.happiness > 50 ? 'text-green-400' : gameState.happiness > 30 ? 'text-yellow-400' : 'text-red-400 animate-pulse'
          }`}>
            {gameState.happiness.toFixed(0)}%
          </div>
        </div>

        {gameState.isInWar && (
          <div className="retro-panel px-3 py-2 bg-red-500/20 border-red-500 animate-pulse pointer-events-auto">
            <div className="text-xs text-red-400 font-mono">⚔️ AT WAR</div>
            <div className="text-sm font-bold font-mono text-red-400">
              {gameState.activeWars.length} CONFLICT{gameState.activeWars.length > 1 ? 'S' : ''}
            </div>
          </div>
        )}
      </div>
      {/* Active War Indicator */}
      {gameState.activeWars.length > 0 && (
        <div className="absolute top-24 left-4 retro-panel border-red-500 bg-red-500/20 px-4 py-2 animate-pulse">
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-400 font-bold">⚔️ ACTIVE WARS: {gameState.activeWars.length}</span>
          </div>
          <div className="text-xs text-red-300 mt-1">
            {gameState.activeWars.map((war, idx) => {
              const enemy = countries.find(c => c.id === (war.isPlayerAttacker ? war.defender : war.attacker))
              return (
                <div key={war.id} className="opacity-80">
                  vs {enemy?.name || 'Unknown'} ({war.duration} days left)
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Live ticker at bottom */}
      <div className="absolute bottom-4 right-4 retro-panel px-4 py-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="text-green-400">
            <span className="opacity-60">GDP:</span> <span className="font-bold">{formatCurrency(gameState.gdp * 1_000_000_000)}</span>
          </div>
          <div className="text-yellow-400">
            <span className="opacity-60">DEBT:</span> <span className="font-bold">{gameState.debtToGdpRatio.toFixed(0)}%</span>
          </div>
          <div className="text-blue-400">
            <span className="opacity-60">SCORE:</span> <span className="font-bold">{gameState.score.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Center Map Button */}
      <button
        onClick={centerMap}
        className="absolute top-4 right-4 retro-panel px-4 py-2 bg-game-accent hover:bg-blue-600 transition-all duration-200 font-bold text-sm pointer-events-auto z-50"
      >
        🎯 CENTER MAP
      </button>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
