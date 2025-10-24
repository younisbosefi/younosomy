'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { countries } from '@/data/countries'
import ComprehensiveGameUI from '@/components/ComprehensiveGameUI'
import { Country } from '@/types/country'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const countryId = params.countryId as string
    const foundCountry = countries.find(c => c.id === countryId)

    if (!foundCountry) {
      // Invalid country, redirect to home
      router.push('/')
      return
    }

    setCountry(foundCountry)
    setLoading(false)
  }, [params, router])

  const handleExit = () => {
    // Clear saved game for this country
    document.cookie = `game_${params.countryId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    router.push('/')
  }

  if (loading || !country) {
    return (
      <div className="h-screen flex items-center justify-center bg-game-darker">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    )
  }

  return <ComprehensiveGameUI country={country} onExit={handleExit} />
}
