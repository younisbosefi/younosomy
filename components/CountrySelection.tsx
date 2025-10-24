'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Country } from '@/types/country'
import InteractiveWorldMap from './InteractiveWorldMap'
import CountryDetailsModal from './CountryDetailsModal'
import { clearGameState } from '@/utils/gameStorage'

interface CountrySelectionProps {
  onSelectCountry?: (country: Country) => void
}

export default function CountrySelection({ onSelectCountry }: CountrySelectionProps) {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country)
    setIsModalOpen(true)
  }

  const handleConfirmSelection = () => {
    if (selectedCountry) {
      setIsModalOpen(false)
      // Clear any existing saved game for this country (fresh start)
      clearGameState(selectedCountry.id)
      // Navigate to the game route
      router.push(`/game/${selectedCountry.id}`)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-darker via-game-dark to-game-darker">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
          SELECT YOUR NATION
        </h1>
        <p className="text-gray-400">Click on a colored country to begin</p>
      </div>

      {/* Interactive Map */}
      <div className="h-[calc(100vh-200px)]">
        <InteractiveWorldMap onCountryClick={handleCountryClick} />
      </div>

      {/* Country Details Modal */}
      <CountryDetailsModal
        country={selectedCountry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSelection}
      />
    </div>
  )
}
