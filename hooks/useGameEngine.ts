import { useState, useEffect, useCallback, useRef } from 'react'
import { GameState, GameLength, Country, ActionResult } from '@/types/game'
import {
  calculateGDPGrowthRate,
  calculateDailyRevenue,
  calculateInflationRate,
  calculateUnemploymentRate,
  calculateHappiness,
  calculateScoreChange,
} from '@/utils/gameCalculations'
import { generateRandomWorldEvents, checkUprisingWarnings, createCriticalEvent, generateWarBattleEvents, generateEconomicAdvice } from '@/utils/eventGenerator'
import { getInitialRelationships } from '@/data/countryRelationships'

export function useGameEngine(country: Country, gameLength: GameLength = 10) {
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState(country, gameLength))
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState<string>('')
  const previousStateRef = useRef<GameState>(gameState)

  // Game Tick - runs every second based on speed
  useEffect(() => {
    if (!gameState.isPlaying || gameOver) return

    const intervalTime = gameState.gameSpeed === 3 ? 333 : 1000 // 3x speed or normal

    const interval = setInterval(() => {
      setGameState((prevState) => {
        const newState = runGameTick(prevState)

        // Check game over conditions
        if (newState.uprisingProgress >= 30) {
          setGameOver(true)
          setGameOverReason('YOU HAVE BEEN OVERTHROWN! The people have risen against you.')
          return prevState
        }

        if (newState.currentDay >= newState.totalDays) {
          setGameOver(true)
          setGameOverReason(`Game Complete! Final Score: ${newState.score.toFixed(0)}`)
          return prevState
        }

        return newState
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [gameState.isPlaying, gameState.gameSpeed, gameOver])

  // Store previous state for calculations
  useEffect(() => {
    previousStateRef.current = gameState
  }, [gameState])

  const togglePlayPause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
  }, [])

  const cycleSpeed = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameSpeed: prev.gameSpeed === 1 ? 3 : 1 as 1 | 3
    }))
  }, [])

  const executeAction = useCallback((result: ActionResult) => {
    setGameState((prev) => {
      const newEvents = [...prev.events, ...result.events].slice(-100) // Keep last 100 events

      return {
        ...prev,
        ...result.stateChanges,
        events: newEvents
      }
    })
  }, [])

  return {
    gameState,
    gameOver,
    gameOverReason,
    togglePlayPause,
    cycleSpeed,
    executeAction,
  }
}

function initializeGameState(country: Country, gameLength: GameLength): GameState {
  const totalDays = gameLength * 365

  const initialInflation = country.difficulty === 'easy' ? 2 : country.difficulty === 'medium' ? 3.5 : 6
  const initialUnemployment = country.difficulty === 'easy' ? 4 : country.difficulty === 'medium' ? 6 : 12
  const initialSecurity = country.stats.stability
  const initialMilitary = country.difficulty === 'easy' ? 70 : country.difficulty === 'medium' ? 50 : 30

  return {
    country,
    currentDay: 0,
    totalDays,
    gameLength,
    isPlaying: true,
    gameSpeed: 1,

    cooldowns: {
      printMoney: 0,
      borrowIMF: 0,
      declareWar: 0,
      adjustTaxes: 0,
    },

    initialStats: {
      gdp: country.stats.gdp,
      happiness: country.stats.happiness,
      unemployment: initialUnemployment,
      inflation: initialInflation,
      security: initialSecurity,
      militaryStrength: initialMilitary,
    },

    gdp: country.stats.gdp,
    gdpGrowthRate: country.difficulty === 'easy' ? 2.5 : country.difficulty === 'medium' ? 1.5 : 0.5,
    debt: country.stats.gdp * 0.6, // 60% debt-to-GDP initially
    debtToGdpRatio: 60,
    inflationRate: initialInflation,
    unemploymentRate: initialUnemployment,
    interestRate: 2.5,

    treasury: country.stats.gdp * 0.05, // 5% of GDP
    revenue: country.stats.gdp * 0.0001,
    reserves: country.stats.gdp * 0.02, // 2% of GDP

    borrowedMoney: [],

    happiness: country.stats.happiness,
    security: initialSecurity,
    militaryStrength: initialMilitary,
    globalReputation: country.difficulty === 'easy' ? 70 : country.difficulty === 'medium' ? 50 : 30,

    score: 0,
    previousScore: 0,

    // Initialize with geopolitical relationships
    allies: getInitialRelationships(country.id).allies,
    enemies: getInitialRelationships(country.id).enemies,
    sanctionsOnUs: [],
    cumulativeAid: {}, // Track aid sent to each country

    sectorLevels: {
      health: 20,
      education: 20,
      military: 20,
      infrastructure: 20,
      housing: 15,
      agriculture: 15,
      transportation: 15,
      security: 20,
      tourism: 10,
      sports: 10,
    },

    isInWar: false,
    activeWars: [],
    uprisingProgress: 0,
    isUprising: false,
    hasDefaulted: false,

    lastWarningDay: {
      debtRatio: -999,
      inflation: -999,
      unemployment: -999,
      lowHappiness: -999,
      highInterest: -999,
      lowTreasury: -999,
    },

    events: [{
      id: 'start',
      day: 0,
      timestamp: new Date(),
      type: 'system' as const,
      category: 'system',
      message: `Game started! You are now leading ${country.name}. Your goal: survive ${gameLength} years and maximize your score.`,
      icon: '🎮'
    }],
  }
}

function runGameTick(state: GameState): GameState {
  const speedMultiplier = state.gameSpeed
  const previousState = { ...state }

  // Increment day
  const newDay = state.currentDay + (1 * speedMultiplier)

  // Decrement cooldowns
  const updatedCooldowns = {
    printMoney: Math.max(0, state.cooldowns.printMoney - speedMultiplier),
    borrowIMF: Math.max(0, state.cooldowns.borrowIMF - speedMultiplier),
    declareWar: Math.max(0, state.cooldowns.declareWar - speedMultiplier),
    adjustTaxes: Math.max(0, state.cooldowns.adjustTaxes - speedMultiplier),
  }

  // Calculate new stats (SLOWED DOWN for better balance and educational value)
  const newGdpGrowthRate = calculateGDPGrowthRate(state)
  // GDP grows much slower - realistic annual growth divided by 365
  const dailyGrowth = newGdpGrowthRate / 100 / 365
  const newGdp = state.gdp * (1 + dailyGrowth)
  const newRevenue = calculateDailyRevenue({ ...state, gdp: newGdp })
  // Treasury grows slower - reduced by 90% for realistic feel
  const newTreasury = state.treasury + (newRevenue * 0.1)
  const newInflationRate = calculateInflationRate(state)
  const newUnemploymentRate = calculateUnemploymentRate(state)
  const newHappiness = calculateHappiness(state)

  // Update debt-to-GDP ratio
  const newDebtToGdpRatio = (state.debt / newGdp) * 100

  // Handle loan payments (monthly = every 30 days)
  let treasuryAfterPayments = newTreasury
  let reservesAfterPayments = state.reserves
  let hasDefaulted = state.hasDefaulted
  const updatedLoans = state.borrowedMoney.map(loan => {
    const daysRemaining = loan.daysUntilNextPayment - speedMultiplier

    if (daysRemaining <= 0) {
      // Payment due
      if (treasuryAfterPayments >= loan.monthlyPayment) {
        treasuryAfterPayments -= loan.monthlyPayment
      } else if (reservesAfterPayments >= loan.monthlyPayment) {
        reservesAfterPayments -= loan.monthlyPayment
      } else {
        // Default!
        hasDefaulted = true
      }

      return {
        ...loan,
        remaining: loan.remaining - (loan.monthlyPayment * 0.8), // Part goes to principal
        daysUntilNextPayment: 30
      }
    }

    return {
      ...loan,
      daysUntilNextPayment: daysRemaining
    }
  }).filter(loan => loan.remaining > 0) // Remove paid-off loans

  // Calculate score change
  const tempState = {
    ...state,
    gdp: newGdp,
    gdpGrowthRate: newGdpGrowthRate,
    debtToGdpRatio: newDebtToGdpRatio,
    happiness: newHappiness,
  }
  const scoreChange = calculateScoreChange(tempState, previousState)
  const newScore = state.score + scoreChange

  // Check for uprising
  let uprisingProgress = state.uprisingProgress
  let isUprising = state.isUprising

  if (newHappiness < 20) {
    uprisingProgress += speedMultiplier
    if (uprisingProgress >= 10 && !isUprising) {
      isUprising = true
    }
  } else {
    uprisingProgress = Math.max(0, uprisingProgress - (speedMultiplier * 0.5))
    if (uprisingProgress === 0) {
      isUprising = false
    }
  }

  // Generate random events
  const randomEvents = generateRandomWorldEvents(state)
  const warBattleEvents = generateWarBattleEvents(state) // NEW: Dynamic war events!
  const adviceEvents = generateEconomicAdvice({ // NEW: Economic advice!
    ...state,
    uprisingProgress,
    happiness: newHappiness,
    debtToGdpRatio: newDebtToGdpRatio,
    inflationRate: newInflationRate,
    unemploymentRate: newUnemploymentRate
  })
  const warningEvents = checkUprisingWarnings({
    ...state,
    uprisingProgress,
    happiness: newHappiness,
    debtToGdpRatio: newDebtToGdpRatio,
    inflationRate: newInflationRate,
    unemploymentRate: newUnemploymentRate
  })

  // Update lastWarningDay based on which warnings were sent
  const updatedLastWarningDay = { ...state.lastWarningDay }
  warningEvents.forEach(event => {
    if (event.message.includes('Debt-to-GDP')) {
      updatedLastWarningDay.debtRatio = newDay
    }
    if (event.message.includes('Hyperinflation')) {
      updatedLastWarningDay.inflation = newDay
    }
    if (event.message.includes('Unemployment')) {
      updatedLastWarningDay.unemployment = newDay
    }
    if (event.message.includes('happiness is dangerously low')) {
      updatedLastWarningDay.lowHappiness = newDay
    }
    if (event.message.includes('Interest rate at')) {
      updatedLastWarningDay.highInterest = newDay
    }
    if (event.message.includes('Treasury critically low')) {
      updatedLastWarningDay.lowTreasury = newDay
    }
  })

  // Handle war resolutions
  const updatedWars = state.activeWars.map(war => ({
    ...war,
    duration: war.duration - speedMultiplier
  })).filter(war => war.duration > 0)

  const isInWar = updatedWars.length > 0

  // Generate default event if needed
  const defaultEvents = hasDefaulted && !previousState.hasDefaulted
    ? [createCriticalEvent(state, 'ECONOMIC COLLAPSE! Your country has defaulted on its debts!', 'economic')]
    : []

  // Compile all events
  const newEvents = [
    ...state.events,
    ...randomEvents,
    ...warBattleEvents, // Include dynamic war battle messages!
    ...adviceEvents, // Include economic advice!
    ...warningEvents,
    ...defaultEvents
  ].slice(-100) // Keep last 100 events

  return {
    ...state,
    currentDay: newDay,
    cooldowns: updatedCooldowns,
    gdp: newGdp,
    gdpGrowthRate: newGdpGrowthRate,
    debtToGdpRatio: newDebtToGdpRatio,
    inflationRate: newInflationRate,
    unemploymentRate: newUnemploymentRate,
    happiness: newHappiness,
    treasury: treasuryAfterPayments,
    revenue: newRevenue,
    reserves: reservesAfterPayments,
    score: newScore,
    previousScore: state.score,
    borrowedMoney: updatedLoans,
    uprisingProgress,
    isUprising,
    hasDefaulted,
    activeWars: updatedWars,
    isInWar,
    lastWarningDay: updatedLastWarningDay,
    events: newEvents,
  }
}
