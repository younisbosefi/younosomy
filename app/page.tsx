'use client'

import { useState } from 'react'
import IntroScreen from '@/components/IntroScreen'
import CountrySelection from '@/components/CountrySelection'

type GameScreen = 'intro' | 'selection'

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('intro')

  const handleStart = () => {
    setCurrentScreen('selection')
  }

  return (
    <main>
      {currentScreen === 'intro' && <IntroScreen onStart={handleStart} />}
      {currentScreen === 'selection' && <CountrySelection />}
    </main>
  )
}
