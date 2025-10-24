import { useState, useEffect, useCallback, useRef } from 'react'
import { GameState, GameLength, ActionResult } from '@/types/game'
import { Country } from '@/types/country'
import {
  calculateGDPGrowthRate,
  calculateDailyRevenue,
  calculateInflationRate,
  calculateUnemploymentRate,
  calculateHappiness,
  calculateScoreChange,
} from '@/utils/gameCalculations'
import { generateRandomWorldEvents, checkUprisingWarnings, createCriticalEvent, createPlayerEvent, generateWarBattleEvents, generateEconomicAdvice } from '@/utils/eventGenerator'
import { generateRandomDecisions } from '@/utils/decisionGenerator'
import { getInitialRelationships } from '@/data/countryRelationships'
import { countries } from '@/data/countries'
import { calculateWarOutcome } from '@/utils/warCalculations'
import { initializeRelationships, deriveAlliesAndEnemies } from '@/utils/relationshipSystem'

export function useGameEngine(country: Country, gameLength: GameLength = 10, savedGameState?: GameState | null) {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (savedGameState) {
      return savedGameState
    }
    return initializeGameState(country, gameLength)
  })
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState<string>('')
  const previousStateRef = useRef<GameState>(gameState)

  // Game Tick - runs every second based on speed (PAUSES for decisions!)
  useEffect(() => {
    // Pause game if there are pending decisions or game over
    if (!gameState.isPlaying || gameOver || gameState.pendingDecisions.length > 0) return

    const intervalTime = gameState.gameSpeed === 3 ? 333 : 1000 // 3x speed or normal

    const interval = setInterval(() => {
      setGameState((prevState) => {
        // Don't tick if decisions are pending
        if (prevState.pendingDecisions.length > 0) return prevState

        const newState = runGameTick(prevState)

        // Check game over conditions
        if (newState.currentDay >= newState.totalDays) {
          setGameOver(true)
          setGameOverReason(`Game Complete! Final Score: ${newState.score.toFixed(0)}`)
          return prevState
        }

        return newState
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [gameState.isPlaying, gameState.gameSpeed, gameOver, gameState.pendingDecisions.length])

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

  const triggerGameOver = useCallback((reason: string) => {
    setGameOver(true)
    setGameOverReason(reason)
  }, [])

  const handleDecisionChoice = useCallback((choice: any) => {
    setGameState((prev) => {
      if (prev.pendingDecisions.length === 0) return prev

      // Remove first decision from queue (FIFO)
      const remainingDecisions = prev.pendingDecisions.slice(1)
      const currentDecision = prev.pendingDecisions[0]

      // Roll for success/failure
      const success = Math.random() < choice.outcomes.success
      const effect = success ? choice.outcomes.successEffect : choice.outcomes.failureEffect

      if (!effect) return { ...prev, pendingDecisions: remainingDecisions }

      // Create event for the decision outcome
      const outcomeEvent = createPlayerEvent(
        prev,
        effect.message,
        'domestic',
        success ? '✓' : '✗'
      )

      // Apply state changes from the decision
      const { message, ...stateChanges } = effect

      return {
        ...prev,
        ...stateChanges,
        pendingDecisions: remainingDecisions,
        events: [...prev.events, outcomeEvent].slice(-100)
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
    triggerGameOver,
    handleDecisionChoice,
  }
}

function initializeGameState(country: Country, gameLength: GameLength): GameState {
  const totalDays = gameLength * 365

  const initialInflation = country.difficulty === 'easy' ? 2 : country.difficulty === 'medium' ? 3.5 : 6
  const initialUnemployment = country.difficulty === 'easy' ? 4 : country.difficulty === 'medium' ? 6 : 12
  const initialSecurity = country.stats.stability
  const initialMilitary = country.difficulty === 'easy' ? 70 : country.difficulty === 'medium' ? 50 : 30
  const initialDebt = country.stats.gdp * 0.6 // 60% debt-to-GDP initially
  const initialDebtRatio = 60

  const initialSectorLevels = {
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
  }

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
      requestAid: 0,
    },

    initialStats: {
      gdp: country.stats.gdp,
      happiness: country.stats.happiness,
      unemployment: initialUnemployment,
      inflation: initialInflation,
      security: initialSecurity,
      militaryStrength: initialMilitary,
      debt: initialDebt,
      debtToGdpRatio: initialDebtRatio,
      sectorLevels: { ...initialSectorLevels }, // Deep copy
    },

    gdp: country.stats.gdp,
    gdpGrowthRate: country.difficulty === 'easy' ? 2.5 : country.difficulty === 'medium' ? 1.5 : 0.5,
    debt: initialDebt,
    debtToGdpRatio: initialDebtRatio,
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

    // Initialize with geopolitical relationships (NEW: Relationship score system 0-100)
    relationships: initializeRelationships(
      country.id,
      getInitialRelationships(country.id).allies,
      getInitialRelationships(country.id).enemies
    ),
    allies: getInitialRelationships(country.id).allies,
    enemies: getInitialRelationships(country.id).enemies,
    sanctionsOnUs: [],
    cumulativeAid: {}, // Track aid sent to each country
    warredCountries: [], // Track countries we've warred with

    sectorLevels: { ...initialSectorLevels },

    isInWar: false,
    activeWars: [],
    uprisingTriggered: false,
    previousHappiness: country.stats.happiness,
    hasDefaulted: false,
    pendingWarResult: null,
    recentPrintMoneyCount: 0,
    pendingDecisions: [],

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
      type: 'world' as const,
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
    requestAid: Math.max(0, state.cooldowns.requestAid - speedMultiplier),
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
  let newHappiness = calculateHappiness(state)

  // HAPPINESS CASCADE - Low happiness destroys economy!
  let happinessPenalty = 0
  if (newHappiness < 50) {
    happinessPenalty = (50 - newHappiness) * 0.02 // -1% GDP at 0 happiness
  }
  if (newHappiness < 30) {
    happinessPenalty += (30 - newHappiness) * 0.03 // Extra penalty below 30%
  }
  if (newHappiness < 10) {
    happinessPenalty += 0.5 // General strike! Massive economic impact
  }

  // Apply happiness penalty to GDP
  const gdpAfterHappinessPenalty = newGdp * (1 - happinessPenalty)

  // PRINT MONEY COUNTER DECAY - Forgiveness over time (every 60 days)
  let updatedPrintMoneyCount = state.recentPrintMoneyCount
  if (state.currentDay % 60 === 0 && updatedPrintMoneyCount > 0) {
    updatedPrintMoneyCount = Math.max(0, updatedPrintMoneyCount - 1)
  }

  // SECTOR DETERIORATION - Sectors decay if not maintained!
  let updatedSectorLevels = { ...state.sectorLevels }
  let sectorDecayEvents: any[] = []

  Object.keys(updatedSectorLevels).forEach((sector) => {
    const sectorKey = sector as keyof typeof updatedSectorLevels
    const currentLevel = updatedSectorLevels[sectorKey]

    // Sectors decay by 0.3% per day if not invested in
    const decay = currentLevel * 0.003 * speedMultiplier
    updatedSectorLevels[sectorKey] = Math.max(0, currentLevel - decay)

    // Critical sector warnings
    if (updatedSectorLevels[sectorKey] < 20 && currentLevel >= 20) {
      sectorDecayEvents.push({
        message: `🚨 CRITICAL: ${sector.toUpperCase()} SECTOR COLLAPSING! Level: ${updatedSectorLevels[sectorKey].toFixed(0)}`,
        icon: '🚨',
        type: 'critical' as const
      })
    }
  })

  // CRISIS EVENTS from neglected sectors (ONLY IF DECLINED 10+ POINTS FROM START)
  let crisisEvents: any[] = []
  const healthDeclineForCrisis = state.initialStats.sectorLevels.health - updatedSectorLevels.health
  if (healthDeclineForCrisis > 10 && Math.random() < 0.03) { // Reduced from 0.05 to 0.03
    crisisEvents.push({
      message: `💀 DISEASE OUTBREAK! You let healthcare collapse! -10% GDP, -8 happiness. FIX: Invest in Health sector.`,
      icon: '💀',
      type: 'critical' as const,
      impact: { gdp: gdpAfterHappinessPenalty * -0.10, happiness: -8 }
    })
  }
  const securityDeclineForCrisis = state.initialStats.sectorLevels.security - updatedSectorLevels.security
  if (securityDeclineForCrisis > 10 && Math.random() < 0.03) {
    crisisEvents.push({
      message: `🔫 CRIME WAVE! You let security collapse! -5% GDP, -6 happiness. FIX: Invest in Security sector.`,
      icon: '🔫',
      type: 'critical' as const,
      impact: { gdp: gdpAfterHappinessPenalty * -0.05, happiness: -6 }
    })
  }
  const infrastructureDeclineForCrisis = state.initialStats.sectorLevels.infrastructure - updatedSectorLevels.infrastructure
  if (infrastructureDeclineForCrisis > 10 && Math.random() < 0.03) {
    crisisEvents.push({
      message: `⚡ INFRASTRUCTURE COLLAPSE! You let infrastructure decay! -8% GDP, -10 happiness. FIX: Invest in Infrastructure.`,
      icon: '⚡',
      type: 'critical' as const,
      impact: { gdp: gdpAfterHappinessPenalty * -0.08, happiness: -10 }
    })
  }

  // Apply crisis impacts
  let finalGdp = gdpAfterHappinessPenalty
  crisisEvents.forEach(crisis => {
    if (crisis.impact?.gdp) {
      finalGdp += crisis.impact.gdp
    }
    if (crisis.impact?.happiness) {
      newHappiness = Math.max(0, newHappiness + crisis.impact.happiness)
    }
  })

  // Update debt-to-GDP ratio with final GDP
  const newDebtToGdpRatio = (state.debt / finalGdp) * 100

  // Handle loan payments (monthly = every 30 days)
  let treasuryAfterPayments = newTreasury
  // Reserves grow slowly - 1% of daily revenue goes to reserves (capped at 5% of GDP)
  const maxReserves = finalGdp * 0.05
  let reservesAfterPayments = Math.min(maxReserves, state.reserves + (newRevenue * 0.01))
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

  // Uprising probability system (REDUCED - gives player more time to recover)
  // Happiness 15-100% = 0% uprising chance
  // Happiness 0-15% = linearly increases from 0% to 2% uprising chance per day
  let uprisingTriggered = state.uprisingTriggered
  let previousHappiness = state.previousHappiness

  // Store previous happiness when it first drops below 15%
  if (newHappiness < 15 && state.happiness >= 15) {
    previousHappiness = state.happiness
  }

  // Calculate uprising probability based on happiness
  if (!uprisingTriggered && newHappiness < 15) {
    // Linear scale: 15% happiness = 0% chance, 0% happiness = 2% chance
    const uprisingChance = ((15 - newHappiness) / 15) * 0.02 // 2% max chance (was 10%)

    // Roll for uprising each day
    if (Math.random() < uprisingChance) {
      uprisingTriggered = true
    }
  }

  // Generate random events
  const randomEvents = generateRandomWorldEvents(state)
  const warBattleEvents = generateWarBattleEvents(state)
  const adviceEvents = generateEconomicAdvice({
    ...state,
    happiness: newHappiness,
    debtToGdpRatio: newDebtToGdpRatio,
    inflationRate: newInflationRate,
    unemploymentRate: newUnemploymentRate
  })
  const warningEvents = checkUprisingWarnings({
    ...state,
    uprisingTriggered,
    happiness: newHappiness,
    debtToGdpRatio: newDebtToGdpRatio,
    inflationRate: newInflationRate,
    unemploymentRate: newUnemploymentRate
  })

  // Generate Presidential Decisions (will pause game if triggered!)
  const newDecisions = generateRandomDecisions({
    ...state,
    happiness: newHappiness,
    debtToGdpRatio: newDebtToGdpRatio,
    inflationRate: newInflationRate,
    unemploymentRate: newUnemploymentRate,
    gdp: finalGdp
  })

  // Process event impacts
  let eventImpactTreasury = 0
  let eventImpactHappiness = 0
  let eventImpactRevenue = 0
  let eventImpactUnemployment = 0
  let eventImpactInflation = 0
  let eventImpactGdpGrowth = 0
  let eventImpactReputation = 0
  const eventRelationshipChanges: Record<string, number> = {}

  randomEvents.forEach(event => {
    if (event.impact) {
      eventImpactTreasury += event.impact.treasury || 0
      eventImpactHappiness += event.impact.happiness || 0
      eventImpactRevenue += event.impact.revenue || 0
      eventImpactUnemployment += event.impact.unemployment || 0
      eventImpactInflation += event.impact.inflation || 0
      eventImpactGdpGrowth += event.impact.gdpGrowth || 0
      eventImpactReputation += event.impact.globalReputation || 0

      // Process relationship changes from events (NEW: Relationship system)
      if (event.impact.relationshipChanges) {
        Object.entries(event.impact.relationshipChanges).forEach(([countryId, change]) => {
          eventRelationshipChanges[countryId] = (eventRelationshipChanges[countryId] || 0) + (change as number)
        })
      }
    }
  })

  // Apply relationship changes from events
  let updatedRelationships = { ...state.relationships }
  Object.entries(eventRelationshipChanges).forEach(([countryId, change]) => {
    const currentScore = updatedRelationships[countryId] || 60
    updatedRelationships[countryId] = Math.max(0, Math.min(100, currentScore + change))
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
    if (event.message.includes('UPRISING RISK')) {
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
  let pendingWarResult = state.pendingWarResult
  const completedWars: typeof state.activeWars = []
  const updatedWars = state.activeWars.map(war => {
    const newDuration = war.duration - speedMultiplier
    if (newDuration <= 0 && war.isPlayerInvolved) {
      // War completed!
      completedWars.push(war)
      return null
    }
    return {
      ...war,
      duration: newDuration
    }
  }).filter((war): war is NonNullable<typeof war> => war !== null && war.duration > 0)

  const isInWar = updatedWars.length > 0

  // Process completed wars (only first one for now)
  let warResultChanges: Partial<GameState> = {}
  if (completedWars.length > 0 && !pendingWarResult) {
    const war = completedWars[0]
    const enemyCountryId = war.isPlayerAttacker ? war.defender : war.attacker
    const enemyCountry = countries.find(c => c.id === enemyCountryId)

    if (enemyCountry) {
      // Calculate winner based on power including allies
      const { playerPower, enemyPower, winProbability } = calculateWarOutcome(state, enemyCountryId)
      const playerWon = Math.random() * 100 < winProbability

      // Store result to show modal
      pendingWarResult = {
        playerWon,
        enemyName: enemyCountry.name
      }

      // Apply stat changes based on outcome
      if (playerWon) {
        // Victory bonuses
        warResultChanges = {
          gdp: state.gdp * 1.15, // +15% GDP
          militaryStrength: Math.min(100, state.militaryStrength + 20), // +20 military
          globalReputation: state.globalReputation + 30, // +30 reputation
          treasury: state.treasury + (state.gdp * 0.10), // +10% of GDP
          happiness: Math.max(0, state.happiness - 5) // -5% happiness (casualties)
        }
      } else {
        // Defeat penalties
        warResultChanges = {
          gdp: state.gdp * 0.75, // -25% GDP
          militaryStrength: Math.max(10, state.militaryStrength - 40), // -40 military
          security: Math.max(10, state.security - 30), // -30 security
          happiness: Math.max(0, state.happiness - 20), // -20% happiness
          treasury: Math.max(0, state.treasury - (state.gdp * 0.20)), // -20% of GDP
          debt: state.debt + (state.gdp * 0.30), // +30% GDP in debt
          globalReputation: Math.max(0, state.globalReputation - 40) // -40 reputation
        }
      }
    }
  }

  // Generate default event if needed
  const defaultEvents = hasDefaulted && !previousState.hasDefaulted
    ? [createCriticalEvent(state, 'ECONOMIC COLLAPSE! Your country has defaulted on its debts!', 'economic')]
    : []

  // Compile all events
  const newEvents = [
    ...state.events,
    ...sectorDecayEvents, // Critical sector warnings
    ...crisisEvents, // Crisis events from neglected sectors
    ...randomEvents,
    ...warBattleEvents, // Include dynamic war battle messages!
    ...adviceEvents, // Include economic advice!
    ...warningEvents,
    ...defaultEvents
  ].slice(-100) // Keep last 100 events

  return {
    ...state,
    ...warResultChanges,
    currentDay: newDay,
    cooldowns: updatedCooldowns,
    relationships: updatedRelationships,
    gdp: warResultChanges.gdp ?? finalGdp,
    gdpGrowthRate: newGdpGrowthRate + eventImpactGdpGrowth,
    debtToGdpRatio: newDebtToGdpRatio,
    inflationRate: Math.max(0, newInflationRate + eventImpactInflation),
    unemploymentRate: Math.max(1, Math.min(40, newUnemploymentRate + eventImpactUnemployment)),
    happiness: Math.max(0, Math.min(100, warResultChanges.happiness ?? (newHappiness + eventImpactHappiness))),
    globalReputation: Math.max(0, Math.min(100, state.globalReputation + eventImpactReputation)),
    treasury: warResultChanges.treasury ?? (treasuryAfterPayments + eventImpactTreasury),
    revenue: newRevenue + eventImpactRevenue,
    reserves: reservesAfterPayments,
    score: newScore,
    previousScore: state.score,
    borrowedMoney: updatedLoans,
    sectorLevels: updatedSectorLevels,
    recentPrintMoneyCount: updatedPrintMoneyCount,
    uprisingTriggered,
    previousHappiness,
    hasDefaulted,
    activeWars: updatedWars,
    isInWar,
    lastWarningDay: updatedLastWarningDay,
    events: newEvents,
    pendingWarResult,
    pendingDecisions: [...state.pendingDecisions, ...newDecisions],
  }
}
