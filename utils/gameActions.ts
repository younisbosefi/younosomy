import { GameState, ActionResult, BorrowedLoan, War } from '@/types/game'
import { calculateLoanPayment, calculateSectorSpendingEffect, calculateRepressSuccessChance } from './gameCalculations'
import { createPlayerEvent, createCriticalEvent } from './eventGenerator'
import { countries } from '@/data/countries'
import { changeRelationship, getRelationshipLevel, getProvocationConsequences } from './relationshipSystem'

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

// Print Money - ESCALATING CONSEQUENCES!
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

  // ESCALATING CONSEQUENCES based on recent usage!
  const printCount = state.recentPrintMoneyCount
  const escalationMultiplier = 1 + (printCount * 0.5) // 1x, 1.5x, 2x, 2.5x...

  const baseInflationIncrease = (amount / state.gdp) * 10
  const inflationIncrease = baseInflationIncrease * escalationMultiplier

  // Additional punishments for repeated money printing
  let happinessPenalty = 0
  let reputationPenalty = 0
  let gdpPenalty = 0
  let message = ''

  if (printCount === 0) {
    message = `Printed money but inflation increased by ${inflationIncrease.toFixed(1)}%!`
  } else if (printCount === 1) {
    happinessPenalty = -5
    message = `Printed money AGAIN! Inflation +${inflationIncrease.toFixed(1)}%, citizens losing confidence (-5 happiness)`
  } else if (printCount === 2) {
    happinessPenalty = -10
    reputationPenalty = -10
    message = `⚠️ RECKLESS MONEY PRINTING! Inflation +${inflationIncrease.toFixed(1)}%, currency devaluing (-10 happiness, -10 reputation)`
  } else {
    happinessPenalty = -15
    reputationPenalty = -20
    gdpPenalty = 0.05 // -5% GDP!
    message = `🚨 HYPERINFLATION RISK! Excessive money printing destroying currency! Inflation +${inflationIncrease.toFixed(1)}%, -5% GDP, -15 happiness, -20 reputation!`
  }

  return {
    success: true,
    message,
    events: [
      createPlayerEvent(
        state,
        message,
        'economic',
        printCount >= 3 ? '🚨' : printCount >= 2 ? '⚠️' : '💵'
      )
    ],
    stateChanges: {
      treasury: state.treasury + amount,
      inflationRate: state.inflationRate + inflationIncrease,
      happiness: state.happiness + happinessPenalty,
      globalReputation: state.globalReputation + reputationPenalty,
      gdp: state.gdp * (1 - gdpPenalty),
      recentPrintMoneyCount: printCount + 1,
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
    revenue: state.revenue + effect.revenueBoost,
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

// Declare War 
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

  // Already warred check
  if (state.warredCountries.includes(targetCountryId)) {
    return {
      success: false,
      message: `You have already fought a war with ${target.name}!`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ Cannot declare war on ${target.name}! You have already fought a war with them. You cannot war the same country twice.`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  // EASIER REQUIREMENTS FOR ENEMIES
  const minMilitaryStrength = isEnemy ? 15 : 30
  const minSecurity = isEnemy ? 15 : 25
  const minMilitaryLevel = isEnemy ? 10 : 20
  const warCostPercent = isEnemy ? 0.02 : 0.08 // 2% for enemies, 8% for neutrals
  const warCost = state.gdp * warCostPercent
  const happinessCost = isEnemy ? 3 : 10 // Happiness hit for attacking

  // Requirements checks with detailed messages
  if (state.militaryStrength < minMilitaryStrength) {
    return {
      success: false,
      message: `Military too weak! Need ${minMilitaryStrength}% strength (current: ${state.militaryStrength.toFixed(0)}%)`,
      events: [
        createCriticalEvent(
          state,
          `⚔️ WAR BLOCKED: Cannot declare war on ${target.name}! Military strength too weak: ${state.militaryStrength.toFixed(0)}% (need ${minMilitaryStrength}%). ${isNeutral ? 'Attacking neutrals requires stronger military!' : 'Invest in military sector to increase strength.'}`,
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
          `⚔️ WAR BLOCKED: Cannot declare war on ${target.name}! Domestic security too low: ${state.security.toFixed(0)}% (need ${minSecurity}%). Strengthen security sector before going to war.`,
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
          `⚔️ WAR BLOCKED: Cannot declare war on ${target.name}! Military infrastructure insufficient: Level ${state.sectorLevels.military.toFixed(0)} (need Level ${minMilitaryLevel}). Build up military sector first.`,
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
          `⚔️ WAR BLOCKED: Cannot declare war on ${target.name}! Insufficient treasury: $${state.treasury.toFixed(2)}B (need ${(warCostPercent * 100).toFixed(0)}% of GDP: $${warCost.toFixed(2)}B). ${isNeutral ? 'Wars against neutrals are VERY expensive!' : 'Wars are expensive!'}`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  // Get current relationship and calculate provocation consequences
  const currentRelationship = state.relationships[targetCountryId] || 60
  const currentLevel = getRelationshipLevel(currentRelationship)
  const consequences = getProvocationConsequences(currentRelationship, state)

  // Reduce relationship by -40 (war is severe!)
  const newRelationships = changeRelationship(state.relationships, targetCountryId, -40)
  const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

  // random from 20 to 50 days
  const duration = Math.floor(Math.random() * (50 - 20 + 1)) + 20;

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

  const isFriendly = currentRelationship >= 51 // Neutral or better
  const relationshipMessage = isEnemy
    ? 'Your people support this war against a known enemy.'
    : 'Your people are shocked by this unprovoked aggression!'

  // Provocation message if attacking friend/neutral
  const provocationMessage = isFriendly ? ` ${consequences.message}` : ''

  // Reputation penalty increases with each war
  const numWars = state.warredCountries.length
  const baseReputationLoss = isEnemy ? 10 : 25
  const multipleWarsPenalty = numWars * 5 // Each previous war adds 5 more reputation loss
  const totalReputationLoss = baseReputationLoss + multipleWarsPenalty + consequences.reputationLoss

  // Apply provocation consequences
  const totalHappinessLoss = happinessCost + consequences.happinessLoss

  return {
    success: true,
    message: `War declared against ${target.name}!`,
    events: [
      createPlayerEvent(
        state,
        `You declared war on ${target.name}! War will last ${duration} days. ${relationshipMessage}${provocationMessage} Relationship -40 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel})${numWars > 0 ? ` (This is your ${numWars + 1}${numWars === 0 ? 'st' : numWars === 1 ? 'nd' : numWars === 2 ? 'rd' : 'th'} war - reputation hit: -${totalReputationLoss})` : ''}`,
        'military',
        isFriendly ? '🚨' : '⚔️'
      )
    ],
    stateChanges: {
      relationships: newRelationships,
      treasury: state.treasury - warCost,
      isInWar: true,
      activeWars: [...state.activeWars, newWar],
      enemies: newEnemies,
      warredCountries: [...state.warredCountries, targetCountryId], // Track this war
      sectorLevels: {
        ...state.sectorLevels,
        tourism: Math.max(0, state.sectorLevels.tourism - consequences.tourismLoss) // Tourism hit from provocation
      },
      globalReputation: state.globalReputation - totalReputationLoss,
      happiness: state.happiness - totalHappinessLoss,
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
      events: [
        createCriticalEvent(
          state,
          `🚫 SANCTION BLOCKED: Cannot sanction ${target.name}! You are already sanctioning this country.`,
          'diplomatic'
        )
      ],
      stateChanges: {}
    }
  }

  // Get current relationship and calculate consequences
  const currentRelationship = state.relationships[targetCountryId] || 60
  const currentLevel = getRelationshipLevel(currentRelationship)
  const consequences = getProvocationConsequences(currentRelationship, state)

  // Reduce relationship by -20
  const newRelationships = changeRelationship(state.relationships, targetCountryId, -20)
  const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

  const isAlly = state.allies.includes(targetCountryId)
  const isFriendly = currentRelationship >= 71 // Friendly or Allied
  const newEnemies = [...state.enemies, targetCountryId]
  const newAllies = isAlly ? state.allies.filter(id => id !== targetCountryId) : state.allies

  const allyMessage = isAlly
    ? ` This breaks your alliance with ${target.name}! They are now your enemy.`
    : ''

  // Apply provocation consequences if attacking friend/ally
  const provocationMessage = isFriendly ? ` ${consequences.message}` : ''
  const totalHappinessLoss = (isAlly ? 5 : 0) + consequences.happinessLoss
  const totalReputationLoss = (isAlly ? 15 : 5) + consequences.reputationLoss

  return {
    success: true,
    message: `Sanctions imposed on ${target.name}`,
    events: [
      createPlayerEvent(
        state,
        `You imposed economic sanctions on ${target.name}.${allyMessage}${provocationMessage} Relationship -20 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel})`,
        'diplomatic',
        isFriendly ? '🚨' : '🚫'
      )
    ],
    stateChanges: {
      relationships: newRelationships,
      enemies: newEnemies,
      allies: newAllies,
      sectorLevels: {
        ...state.sectorLevels,
        tourism: Math.max(0, state.sectorLevels.tourism - consequences.tourismLoss) // Tourism hit from provocation
      },
      globalReputation: state.globalReputation - totalReputationLoss,
      happiness: state.happiness - totalHappinessLoss
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
      events: [
        createCriticalEvent(
          state,
          `🤝 ALLIANCE BLOCKED: Cannot propose alliance to ${target.name}! You are already allied with this country.`,
          'diplomatic'
        )
      ],
      stateChanges: {}
    }
  }

  if (state.enemies.includes(targetCountryId)) {
    return {
      success: false,
      message: 'Cannot ally with an enemy',
      events: [
        createCriticalEvent(
          state,
          `🤝 ALLIANCE BLOCKED: Cannot propose alliance to ${target.name}! You cannot ally with an enemy. Send aid to improve relations first.`,
          'diplomatic'
        )
      ],
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
        createCriticalEvent(
          state,
          `🤝 ALLIANCE REJECTED: ${target.name} rejected your alliance proposal! Your global reputation is ${state.globalReputation.toFixed(0)}% (need higher reputation for alliances). Try sending aid to improve relations first.`,
          'diplomatic'
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

export function requestAid(state: GameState, targetCountryId: string): ActionResult {
  // Check cooldown
  if (state.cooldowns.requestAid > 0) {
    return {
      success: false,
      message: `Cannot request aid yet. Cooldown: ${Math.ceil(state.cooldowns.requestAid)} days remaining`,
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

  // Calculate acceptance chance based on relationship
  let acceptanceChance = 0
  if (isAlly) {
    acceptanceChance = 0.20 // 20% for allies
  } else if (isEnemy) {
    acceptanceChance = 0.005 // 0.5% for enemies (for the lols)
  } else {
    acceptanceChance = 0.10 // 10% for neutrals
  }

  const accepted = Math.random() < acceptanceChance

  if (accepted) {
    // Aid amount: 5% to 15% of player's GDP
    const aidPercent = 5 + Math.random() * 10 // 5-15%
    const aidAmount = state.gdp * (aidPercent / 100)

    return {
      success: true,
      message: `${target.name} accepted! Received $${aidAmount.toFixed(1)}B`,
      events: [
        createPlayerEvent(
          state,
          `💰 AID RECEIVED: ${target.name} sends $${aidAmount.toFixed(1)}B in aid (${aidPercent.toFixed(1)}% of your GDP)!`,
          'diplomatic',
          '🤝'
        )
      ],
      stateChanges: {
        treasury: state.treasury + aidAmount,
        happiness: 5,
        globalReputation: state.globalReputation + 3,
        cooldowns: {
          ...state.cooldowns,
          requestAid: 100 // 100 day cooldown
        }
      }
    }
  } else {
    return {
      success: false,
      message: `${target.name} declined your aid request`,
      events: [
        createPlayerEvent(
          state,
          `❌ AID DECLINED: ${target.name} has declined your request for aid.`,
          'diplomatic',
          '❌'
        )
      ],
      stateChanges: {
        globalReputation: state.globalReputation - 1,
        cooldowns: {
          ...state.cooldowns,
          requestAid: 100 // Cooldown applies even if declined
        }
      }
    }
  }
}

export function culturalExchange(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const cost = state.treasury * 0.02 // 2% of treasury
  if (state.treasury < cost) {
    return {
      success: false,
      message: `Insufficient funds! Need $${cost.toFixed(2)}B (2% of treasury)`,
      events: [],
      stateChanges: {}
    }
  }

  const currentRelationship = state.relationships[targetCountryId] || 60
  const newRelationships = changeRelationship(state.relationships, targetCountryId, 5)
  const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

  return {
    success: true,
    message: `Cultural exchange with ${target.name}`,
    events: [
      createPlayerEvent(
        state,
        `🎭 CULTURAL EXCHANGE: Hosted cultural festival with ${target.name}. Relationship +5 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel})`,
        'diplomatic',
        '🎭'
      )
    ],
    stateChanges: {
      treasury: state.treasury - cost,
      relationships: newRelationships,
      happiness: state.happiness + 1 // Citizens enjoy cultural exchange
    }
  }
}

export function tradeAgreement(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const cost = state.treasury * 0.05 // 5% of treasury
  if (state.treasury < cost) {
    return {
      success: false,
      message: `Insufficient funds! Need $${cost.toFixed(2)}B (5% of treasury)`,
      events: [],
      stateChanges: {}
    }
  }

  const currentRelationship = state.relationships[targetCountryId] || 60
  const newRelationships = changeRelationship(state.relationships, targetCountryId, 8)
  const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

  return {
    success: true,
    message: `Trade agreement signed with ${target.name}`,
    events: [
      createPlayerEvent(
        state,
        `📜 TRADE AGREEMENT: Signed free trade pact with ${target.name}. Relationship +8 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel}), GDP growth +0.5%`,
        'diplomatic',
        '📜'
      )
    ],
    stateChanges: {
      treasury: state.treasury - cost,
      relationships: newRelationships,
      gdpGrowthRate: state.gdpGrowthRate + 0.5, // +0.5% GDP growth
      happiness: state.happiness + 2
    }
  }
}

export function militaryCooperation(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const currentRelationship = state.relationships[targetCountryId] || 60

  // Require at least 70 relationship (Friendly)
  if (currentRelationship < 70) {
    return {
      success: false,
      message: `${target.name} refuses! Relationship too low (${currentRelationship.toFixed(0)}/100, need 70+)`,
      events: [
        createCriticalEvent(
          state,
          `🛡️ COOPERATION DENIED: ${target.name} rejected military cooperation! Relationship: ${currentRelationship.toFixed(0)}/100 (need 70+ Friendly). Improve relations first!`,
          'military'
        )
      ],
      stateChanges: {}
    }
  }

  const newRelationships = changeRelationship(state.relationships, targetCountryId, 10)
  const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

  return {
    success: true,
    message: `Military cooperation pact with ${target.name}`,
    events: [
      createPlayerEvent(
        state,
        `🛡️ MILITARY COOPERATION: Signed defense pact with ${target.name}. Joint military exercises! Relationship +10 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel}), Military strength +5`,
        'military',
        '🛡️'
      )
    ],
    stateChanges: {
      relationships: newRelationships,
      militaryStrength: Math.min(100, state.militaryStrength + 5),
      security: Math.min(100, state.security + 3)
    }
  }
}

export function denouncePublicly(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const currentRelationship = state.relationships[targetCountryId] || 60
  const newRelationships = changeRelationship(state.relationships, targetCountryId, -15)
  const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

  // Find countries that are enemies of the target (relationship < 30)
  const targetEnemies = Object.entries(state.relationships)
    .filter(([countryId, score]) => {
      const targetRel = state.relationships[targetCountryId] || 60
      // Countries that have bad relationship with target
      return countryId !== targetCountryId && score < 40
    })
    .length

  const reputationBoost = Math.min(10, targetEnemies * 2) // +2 rep per enemy of target, max +10

  return {
    success: true,
    message: `Publicly denounced ${target.name}`,
    events: [
      createPlayerEvent(
        state,
        `📢 PUBLIC DENOUNCEMENT: You condemned ${target.name} on the world stage! Relationship -15 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel}), Reputation +${reputationBoost} with their rivals`,
        'diplomatic',
        '📢'
      )
    ],
    stateChanges: {
      relationships: newRelationships,
      globalReputation: state.globalReputation + reputationBoost,
      happiness: state.happiness - 2 // Citizens worried about escalation
    }
  }
}

export function espionageMission(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const cost = state.treasury * 0.03 // 3% of treasury for operation
  if (state.treasury < cost) {
    return {
      success: false,
      message: `Insufficient funds! Need $${cost.toFixed(2)}B (3% of treasury)`,
      events: [],
      stateChanges: {}
    }
  }

  // 60% success rate
  const success = Math.random() < 0.60

  if (success) {
    // Mission success - gain intelligence and military advantage
    return {
      success: true,
      message: `Espionage mission against ${target.name} succeeded!`,
      events: [
        createPlayerEvent(
          state,
          `🕵️ ESPIONAGE SUCCESS: Intelligence gathered on ${target.name}! Gained military insights and economic data. Security +5, Military +3`,
          'military',
          '🕵️'
        )
      ],
      stateChanges: {
        treasury: state.treasury - cost,
        security: Math.min(100, state.security + 5),
        militaryStrength: Math.min(100, state.militaryStrength + 3),
        globalReputation: state.globalReputation + 2 // Secret success
      }
    }
  } else {
    // Mission failed - caught! Major diplomatic incident
    const currentRelationship = state.relationships[targetCountryId] || 60
    const newRelationships = changeRelationship(state.relationships, targetCountryId, -20)
    const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

    return {
      success: false,
      message: `Espionage mission CAUGHT! Diplomatic crisis!`,
      events: [
        createCriticalEvent(
          state,
          `🚨 ESPIONAGE EXPOSED: Your spies were caught by ${target.name}! International scandal! Relationship -20 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel}), Reputation -15, Happiness -8`,
          'military'
        )
      ],
      stateChanges: {
        treasury: state.treasury - cost,
        relationships: newRelationships,
        globalReputation: Math.max(0, state.globalReputation - 15),
        happiness: Math.max(0, state.happiness - 8)
      }
    }
  }
}

export function borderAgreement(state: GameState, targetCountryId: string): ActionResult {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return {
      success: false,
      message: 'Invalid target country',
      events: [],
      stateChanges: {}
    }
  }

  const cost = state.treasury * 0.01 // 1% of treasury
  if (state.treasury < cost) {
    return {
      success: false,
      message: `Insufficient funds! Need $${cost.toFixed(2)}B (1% of treasury)`,
      events: [],
      stateChanges: {}
    }
  }

  const currentRelationship = state.relationships[targetCountryId] || 60
  const newRelationships = changeRelationship(state.relationships, targetCountryId, 3)
  const newLevel = getRelationshipLevel(newRelationships[targetCountryId])

  return {
    success: true,
    message: `Border agreement signed with ${target.name}`,
    events: [
      createPlayerEvent(
        state,
        `🗺️ BORDER AGREEMENT: Peacefully resolved territorial disputes with ${target.name}. Relationship +3 (now ${newRelationships[targetCountryId].toFixed(0)}/100 - ${newLevel}), Security +2`,
        'diplomatic',
        '🗺️'
      )
    ],
    stateChanges: {
      treasury: state.treasury - cost,
      relationships: newRelationships,
      security: Math.min(100, state.security + 2),
      happiness: state.happiness + 1 // Citizens happy about peaceful resolution
    }
  }
}
