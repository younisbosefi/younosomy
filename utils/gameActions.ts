import { GameState, ActionResult, BorrowedLoan, War } from '@/types/game'
import { calculateLoanPayment, calculateSectorSpendingEffect, calculateRepressSuccessChance } from './gameCalculations'
import { createPlayerEvent, createCriticalEvent } from './eventGenerator'
import { countries } from '@/data/countries'

// Adjust Interest Rate
export function adjustInterestRate(state: GameState, newRate: number): ActionResult {
  const change = newRate - state.interestRate

  return {
    success: true,
    message: `Interest rate adjusted to ${newRate}%`,
    events: [
      createPlayerEvent(
        state,
        `You ${change > 0 ? 'increased' : 'decreased'} interest rate by ${Math.abs(change).toFixed(1)}% to ${newRate}%`,
        'economic',
        '📈'
      )
    ],
    stateChanges: {
      interestRate: newRate
    }
  }
}

// Print Money
export function printMoney(state: GameState, amount: number): ActionResult {
  // Check cooldown (30 days)
  if (state.cooldowns.printMoney > 0) {
    return {
      success: false,
      message: `Action on cooldown! Wait ${Math.ceil(state.cooldowns.printMoney)} more days.`,
      events: [],
      stateChanges: {}
    }
  }

  if (amount <= 0) {
    return {
      success: false,
      message: 'Invalid amount',
      events: [],
      stateChanges: {}
    }
  }

  const inflationIncrease = (amount / state.gdp) * 10

  return {
    success: true,
    message: `Printed money but inflation increased significantly!`,
    events: [
      createPlayerEvent(
        state,
        `You printed money. Treasury increased but inflation spiked by ${inflationIncrease.toFixed(1)}%!`,
        'economic',
        '💵'
      )
    ],
    stateChanges: {
      treasury: state.treasury + amount,
      inflationRate: state.inflationRate + inflationIncrease,
      cooldowns: {
        ...state.cooldowns,
        printMoney: 30 // 30-day cooldown
      }
    }
  }
}

// Borrow from IMF
export function borrowFromIMF(state: GameState, amount: number): ActionResult {
  // Check cooldown (90 days - borrowing should be rarer)
  if (state.cooldowns.borrowIMF > 0) {
    return {
      success: false,
      message: `Cannot borrow again yet! Wait ${Math.ceil(state.cooldowns.borrowIMF)} more days.`,
      events: [],
      stateChanges: {}
    }
  }

  if (amount <= 0 || amount > state.gdp * 0.5) {
    return {
      success: false,
      message: 'Invalid amount (maximum 50% of GDP)',
      events: [],
      stateChanges: {}
    }
  }

  const interestRate = 4.5 // IMF interest rate
  const monthlyPayment = calculateLoanPayment(amount, interestRate)

  const newLoan: BorrowedLoan = {
    id: `imf-${Date.now()}`,
    amount,
    remaining: amount,
    interestRate,
    monthlyPayment,
    daysUntilNextPayment: 30,
    source: 'IMF'
  }

  return {
    success: true,
    message: `Borrowed from IMF at ${interestRate}% interest`,
    events: [
      createPlayerEvent(
        state,
        `You borrowed from the IMF. Monthly payment required.`,
        'economic',
        '🏦'
      )
    ],
    stateChanges: {
      treasury: state.treasury + amount,
      debt: state.debt + amount,
      borrowedMoney: [...state.borrowedMoney, newLoan],
      cooldowns: {
        ...state.cooldowns,
        borrowIMF: 90 // 90-day cooldown (3 months)
      }
    }
  }
}

// Add to Reserves
export function addToReserves(state: GameState, amount: number): ActionResult {
  if (amount <= 0 || amount > state.treasury) {
    return {
      success: false,
      message: 'Invalid amount or insufficient treasury funds',
      events: [],
      stateChanges: {}
    }
  }

  return {
    success: true,
    message: `Moved to reserves`,
    events: [
      createPlayerEvent(
        state,
        `You added to emergency reserves`,
        'economic',
        '🛡️'
      )
    ],
    stateChanges: {
      treasury: state.treasury - amount,
      reserves: state.reserves + amount
    }
  }
}

// Pay Off Debt (instantly reduce debt with treasury funds)
export function payOffDebt(state: GameState, amount: number): ActionResult {
  if (amount <= 0 || amount > state.treasury) {
    return {
      success: false,
      message: 'Invalid amount or insufficient treasury funds',
      events: [],
      stateChanges: {}
    }
  }

  if (state.debt === 0) {
    return {
      success: false,
      message: 'No debt to pay off',
      events: [],
      stateChanges: {}
    }
  }

  const actualPayment = Math.min(amount, state.debt)

  return {
    success: true,
    message: `Paid off debt`,
    events: [
      createPlayerEvent(
        state,
        `You paid off debt. Debt-to-GDP ratio improved!`,
        'economic',
        '💳'
      )
    ],
    stateChanges: {
      treasury: state.treasury - actualPayment,
      debt: state.debt - actualPayment,
      globalReputation: state.globalReputation + 2, // Fiscal responsibility boosts reputation
      happiness: state.happiness + 1 // People like debt reduction
    }
  }
}

// Spend on Sector
export function spendOnSector(
  state: GameState,
  sector: keyof typeof state.sectorLevels,
  amount: number
): ActionResult {
  if (amount <= 0 || amount > state.treasury) {
    return {
      success: false,
      message: 'Invalid amount or insufficient treasury funds',
      events: [],
      stateChanges: {}
    }
  }

  const effect = calculateSectorSpendingEffect(
    sector,
    amount,
    state.country.id,
    state.sectorLevels[sector]
  )

  const newSectorLevels = { ...state.sectorLevels }
  newSectorLevels[sector] += effect.levelIncrease

  // DIFFERENTIATED BENEFITS BY SECTOR TYPE
  const stateChanges: Partial<GameState> = {
    treasury: state.treasury - amount,
    sectorLevels: newSectorLevels,
    happiness: state.happiness + effect.happinessChange,
    gdpGrowthRate: state.gdpGrowthRate + effect.gdpGrowthBoost,
    // NEW: Revenue boost from tourism/sports/transport
    revenue: state.revenue + effect.revenueBoost,
    // NEW: Unemployment reduction from education/health/infrastructure
    unemploymentRate: Math.max(1, state.unemploymentRate - effect.unemploymentReduction)
  }

  // If spending on military, increase military strength
  if (sector === 'military') {
    stateChanges.militaryStrength = Math.min(100, state.militaryStrength + effect.levelIncrease * 0.5)
  }

  // If spending on security, increase security stat
  if (sector === 'security') {
    stateChanges.security = Math.min(100, state.security + effect.levelIncrease * 0.5)
  }

  return {
    success: true,
    message: effect.message,
    events: [
      createPlayerEvent(
        state,
        `Spent $${amount.toFixed(2)}B on ${sector}. ${effect.message}`,
        'domestic',
        '🏗️'
      )
    ],
    stateChanges
  }
}

// Repress Uprising
export function repressUprising(state: GameState): ActionResult {
  if (!state.isUprising) {
    return {
      success: false,
      message: 'No uprising to repress',
      events: [],
      stateChanges: {}
    }
  }

  const successChance = calculateRepressSuccessChance(state.militaryStrength, state.security)
  const success = Math.random() < successChance

  if (success) {
    return {
      success: true,
      message: 'Uprising suppressed successfully!',
      events: [
        createPlayerEvent(
          state,
          'You successfully suppressed the uprising. Peace restored, but at what cost?',
          'domestic',
          '🛡️'
        )
      ],
      stateChanges: {
        isUprising: false,
        uprisingProgress: 0,
        happiness: state.happiness - 5, // Repression hurts happiness
        globalReputation: state.globalReputation - 10
      }
    }
  } else {
    return {
      success: false,
      message: 'Repression failed! Uprising escalating!',
      events: [
        createCriticalEvent(
          state,
          'FAILURE: Repression attempt failed! Revolution is imminent!',
          'domestic'
        )
      ],
      stateChanges: {
        uprisingProgress: 30, // Immediate overthrow
        militaryStrength: state.militaryStrength * 0.7 // Military weakened
      }
    }
  }
}

// Declare War (now with relationship-based costs and validation)
export function declareWar(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const isEnemy = state.enemies.includes(targetCountryId)
  const isAlly = state.allies.includes(targetCountryId)
  const isNeutral = !isEnemy && !isAlly

  // Cannot declare war on allies
  if (isAlly) {
    return {
      success: false,
      message: `Cannot declare war on ally ${target.name}!`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ Cannot declare war on ${target.name}! They are your ally. You must impose sanctions first to break the alliance.`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  // Check cooldown
  if (state.cooldowns.declareWar > 0) {
    return {
      success: false,
      message: `Cannot declare war yet! Wait ${Math.ceil(state.cooldowns.declareWar)} more days.`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ Cannot declare war on ${target.name} yet! Your military needs ${Math.ceil(state.cooldowns.declareWar)} more days to prepare.`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  // EASIER REQUIREMENTS FOR ENEMIES
  const minMilitaryStrength = isEnemy ? 25 : 40
  const minSecurity = isEnemy ? 20 : 35
  const minMilitaryLevel = isEnemy ? 15 : 30
  const warCostPercent = isEnemy ? 0.05 : 0.20 // 5% for enemies, 20% for neutrals
  const warCost = state.gdp * warCostPercent
  const happinessCost = isEnemy ? 3 : 15 // Much bigger happiness hit for attacking neutrals

  // Requirements checks with detailed messages
  if (state.militaryStrength < minMilitaryStrength) {
    return {
      success: false,
      message: `Military too weak! Need ${minMilitaryStrength}% strength (current: ${state.militaryStrength.toFixed(0)}%)`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ Cannot declare war on ${target.name}! Military strength too weak: ${state.militaryStrength.toFixed(0)}% (need ${minMilitaryStrength}%). ${isNeutral ? 'Attacking neutrals requires stronger military!' : 'Invest in military sector to increase strength.'}`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  if (state.security < minSecurity) {
    return {
      success: false,
      message: `Domestic security too low! Need ${minSecurity}% (current: ${state.security.toFixed(0)}%)`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ Cannot declare war on ${target.name}! Domestic security too low: ${state.security.toFixed(0)}% (need ${minSecurity}%). Strengthen security sector before going to war.`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  if (state.sectorLevels.military < minMilitaryLevel) {
    return {
      success: false,
      message: `Insufficient military infrastructure! Need level ${minMilitaryLevel} (current: ${state.sectorLevels.military.toFixed(0)})`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ Cannot declare war on ${target.name}! Military infrastructure insufficient: Level ${state.sectorLevels.military.toFixed(0)} (need Level ${minMilitaryLevel}). Build up military sector first.`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  if (state.treasury < warCost) {
    return {
      success: false,
      message: `Insufficient funds to wage war (need ${(warCostPercent * 100).toFixed(0)}% of GDP: $${warCost.toFixed(2)}B)`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ Cannot declare war on ${target.name}! Insufficient treasury: $${state.treasury.toFixed(2)}B (need ${(warCostPercent * 100).toFixed(0)}% of GDP: $${warCost.toFixed(2)}B). ${isNeutral ? 'Wars against neutrals are VERY expensive!' : 'Wars are expensive!'}`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  // Fixed 30-day war duration
  const duration = 30

  const newWar: War = {
    id: `war-${Date.now()}`,
    attacker: state.country.id,
    defender: targetCountryId,
    startDay: state.currentDay,
    duration,
    attackerStrength: state.militaryStrength,
    defenderStrength: target.stats.stability,
    isPlayerInvolved: true,
    isPlayerAttacker: true
  }

  const newEnemies = state.enemies.includes(targetCountryId)
    ? state.enemies
    : [...state.enemies, targetCountryId]

  const relationshipMessage = isEnemy
    ? 'Your people support this war against a known enemy.'
    : 'Your people are shocked by this unprovoked aggression!'

  return {
    success: true,
    message: `War declared against ${target.name}!`,
    events: [
      createPlayerEvent(
        state,
        `You declared war on ${target.name}! War will last 30 days. ${relationshipMessage}`,
        'military',
        '⚔️'
      )
    ],
    stateChanges: {
      treasury: state.treasury - warCost,
      isInWar: true,
      activeWars: [...state.activeWars, newWar],
      enemies: newEnemies,
      globalReputation: state.globalReputation - (isEnemy ? 10 : 25), // Bigger reputation hit for attacking neutrals
      happiness: state.happiness - happinessCost,
      cooldowns: {
        ...state.cooldowns,
        declareWar: isEnemy ? 90 : 180 // Shorter cooldown for attacking enemies
      }
    }
  }
}

// Impose Sanction (breaks alliances if sanctioning an ally)
export function imposeSanction(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  if (state.enemies.includes(targetCountryId)) {
    return {
      success: false,
      message: 'Already sanctioning this country',
      events: [],
      stateChanges: {}
    }
  }

  const isAlly = state.allies.includes(targetCountryId)
  const newEnemies = [...state.enemies, targetCountryId]
  const newAllies = isAlly ? state.allies.filter(id => id !== targetCountryId) : state.allies

  const allyMessage = isAlly
    ? ` This breaks your alliance with ${target.name}! They are now your enemy.`
    : ''

  return {
    success: true,
    message: `Sanctions imposed on ${target.name}`,
    events: [
      createPlayerEvent(
        state,
        `You imposed economic sanctions on ${target.name}.${allyMessage}`,
        'diplomatic',
        '🚫'
      )
    ],
    stateChanges: {
      enemies: newEnemies,
      allies: newAllies,
      globalReputation: state.globalReputation - (isAlly ? 15 : 5), // Bigger reputation hit for betraying allies
      happiness: state.happiness - (isAlly ? 5 : 0) // People don't like betraying allies
    }
  }
}

// Propose Alliance
export function proposeAlliance(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  if (state.allies.includes(targetCountryId)) {
    return {
      success: false,
      message: 'Already allied with this country',
      events: [],
      stateChanges: {}
    }
  }

  if (state.enemies.includes(targetCountryId)) {
    return {
      success: false,
      message: 'Cannot ally with an enemy',
      events: [],
      stateChanges: {}
    }
  }

  // Success chance based on global reputation
  const successChance = state.globalReputation / 100
  const success = Math.random() < successChance

  if (success) {
    const newAllies = [...state.allies, targetCountryId]
    return {
      success: true,
      message: `Alliance formed with ${target.name}!`,
      events: [
        createPlayerEvent(
          state,
          `${target.name} accepted your alliance proposal!`,
          'diplomatic',
          '🤝'
        )
      ],
      stateChanges: {
        allies: newAllies,
        globalReputation: state.globalReputation + 10
      }
    }
  } else {
    return {
      success: false,
      message: `${target.name} rejected your alliance proposal`,
      events: [
        createPlayerEvent(
          state,
          `${target.name} rejected your alliance proposal. Try improving your global reputation.`,
          'diplomatic',
          '❌'
        )
      ],
      stateChanges: {
        globalReputation: state.globalReputation - 2
      }
    }
  }
}

// Send Aid
export function sendAid(state: GameState, targetCountryId: string, amount: number): ActionResult {
  if (amount <= 0 || amount > state.treasury) {
    return {
      success: false,
      message: 'Invalid amount or insufficient treasury funds',
      events: [],
      stateChanges: {}
    }
  }

  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const isEnemy = state.enemies.includes(targetCountryId)
  const isAlly = state.allies.includes(targetCountryId)

  // Track cumulative aid
  const currentAid = state.cumulativeAid[targetCountryId] || 0
  const newTotalAid = currentAid + amount
  const aidAsPercentOfGDP = (newTotalAid / state.gdp) * 100

  let stateChanges: Partial<GameState> = {
    treasury: state.treasury - amount,
    globalReputation: state.globalReputation + 5,
    cumulativeAid: {
      ...state.cumulativeAid,
      [targetCountryId]: newTotalAid
    }
  }

  let message = `Sent $${amount.toFixed(2)}B in aid to ${target.name}`
  let relationshipChanged = false

  // ENEMY → NEUTRAL: After 2% of GDP in aid, remove from enemies
  if (isEnemy && aidAsPercentOfGDP >= 2) {
    const newEnemies = state.enemies.filter(id => id !== targetCountryId)
    stateChanges.enemies = newEnemies
    message += `. ${target.name} is now NEUTRAL with you! (Total aid: $${newTotalAid.toFixed(2)}B)`
    relationshipChanged = true
  } else if (isEnemy) {
    const remainingForNeutral = (state.gdp * 0.02) - newTotalAid
    message += `. They remain hostile. (Need $${remainingForNeutral.toFixed(2)}B more for neutral relations)`
  }

  // NEUTRAL → ALLY: After 5% of GDP in aid, become allies
  else if (!isAlly && !isEnemy && aidAsPercentOfGDP >= 5) {
    const newAllies = [...state.allies, targetCountryId]
    stateChanges.allies = newAllies
    stateChanges.globalReputation = state.globalReputation + 15
    message += `. ${target.name} has become your ALLY! (Total aid: $${newTotalAid.toFixed(2)}B)`
    relationshipChanged = true
  } else if (!isAlly && !isEnemy) {
    const remainingForAlly = (state.gdp * 0.05) - newTotalAid
    message += `. Relations improving. (Need $${remainingForAlly.toFixed(2)}B more for alliance)`
  }

  // ALLY: Already allied, strengthen relationship
  else if (isAlly) {
    stateChanges.globalReputation = state.globalReputation + 10
    message += `. Alliance strengthened! (Total aid: $${newTotalAid.toFixed(2)}B)`
  }

  return {
    success: true,
    message,
    events: [
      createPlayerEvent(
        state,
        message,
        'diplomatic',
        relationshipChanged ? '🤝' : '🎁'
      )
    ],
    stateChanges
  }
}
