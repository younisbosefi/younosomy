'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Country } from '@/types/country'
import { countries } from '@/data/countries'
import { countryMapping, reverseCountryMapping } from '@/data/countryCoordinates'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface InteractiveWorldMapProps {
  onCountryClick: (country: Country) => void
}

export default function InteractiveWorldMap({ onCountryClick }: InteractiveWorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const getCountryColor = (geo: any) => {
    const geoId = geo.id // ISO numeric code
    const geoName = geo.properties.name

    // Try to find matching country in our data
    const countryId = Object.keys(reverseCountryMapping).find(key => {
      const country = countries.find(c => c.id === reverseCountryMapping[key])
      return country && (
        geoId === countryMapping[country.id] ||
        geoName.includes(country.name) ||
        country.name.includes(geoName)
      )
    })

    if (countryId && reverseCountryMapping[countryId]) {
      const country = countries.find(c => c.id === reverseCountryMapping[countryId])
      if (country) {
        switch (country.difficulty) {
          case 'easy':
            return hoveredCountry === countryId ? '#22c55e' : '#16a34a'
          case 'medium':
            return hoveredCountry === countryId ? '#fbbf24' : '#f59e0b'
          case 'hard':
            return hoveredCountry === countryId ? '#f87171' : '#ef4444'
        }
      }
    }

    // Countries not in our game data
    return hoveredCountry === geoId ? '#374151' : '#1f2937'
  }

  const handleCountryClick = (geo: any) => {
    const geoId = geo.id
    const geoName = geo.properties.name

    // Find the country in our data
    const country = countries.find(c => {
      const isoCode = countryMapping[c.id]
      return isoCode === geoId || geoName.includes(c.name) || c.name.includes(geoName)
    })

    if (country) {
      onCountryClick(country)
    }
  }

  const isPlayableCountry = (geo: any): boolean => {
    const geoId = geo.id
    const geoName = geo.properties.name

    return countries.some(c => {
      const isoCode = countryMapping[c.id]
      return isoCode === geoId || geoName.includes(c.name) || c.name.includes(geoName)
    })
  }

  return (
    <div className="w-full h-full relative">
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
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isPlayable = isPlayableCountry(geo)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(geo)}
                    stroke="#0a0e1a"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', cursor: isPlayable ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => {
                      if (isPlayable) {
                        setHoveredCountry(geo.id)
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null)
                    }}
                    onClick={() => {
                      if (isPlayable) {
                        handleCountryClick(geo)
                      }
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 game-panel p-4 space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 mb-2">DIFFICULTY</h3>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-xs text-gray-300">Easy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-600 rounded"></div>
          <span className="text-xs text-gray-300">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-xs text-gray-300">Hard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 rounded"></div>
          <span className="text-xs text-gray-300">Unavailable</span>
        </div>
      </div>
    </div>
  )
}
