import { GameEvent, GameState, War } from '@/types/game'
import { countries } from '@/data/countries'

let eventIdCounter = 0

function generateEventId(): string {
  return `event-${Date.now()}-${eventIdCounter++}`
}

// War battle event messages (varied and dynamic)
const battleEvents = {
  attack: [
    'launched a devastating missile strike',
    'captured strategic positions',
    'destroyed enemy supply lines',
    'bombed military installations',
    'launched a successful offensive',
    'seized key infrastructure',
    'conducted precision airstrikes',
    'breached enemy defenses'
  ],
  defend: [
    'repelled enemy advances',
    'fortified defensive positions',
    'shot down enemy aircraft',
    'intercepted enemy missiles',
    'held the frontlines',
    'evacuated civilians from combat zones',
    'reinforced strategic locations',
    'countered enemy offensive'
  ],
  casualties: [
    'heavy casualties reported',
    'military forces diminished',
    'significant losses sustained',
    'troops decimated in fierce battle',
    'devastating blow to military strength'
  ],
  victories: [
    'achieved tactical victory',
    'gained strategic advantage',
    'broke through enemy lines',
    'secured major win',
    'dominated the battlefield'
  ]
}

// Generate random world events
export function generateRandomWorldEvents(state: GameState): GameEvent[] {
  const events: GameEvent[] = []
  const speedMultiplier = state.gameSpeed

  // Base probabilities (adjusted by speed)
  const warProbability = 0.007 * speedMultiplier
  const allianceProbability = 0.01 * speedMultiplier
  const sanctionProbability = 0.005 * speedMultiplier
  const economicEventProbability = 0.015 * speedMultiplier

  // Random war between countries
  if (Math.random() < warProbability) {
    const warEvent = generateRandomWar(state)
    if (warEvent) events.push(warEvent)
  }

  // Random alliance formation
  if (Math.random() < allianceProbability) {
    const allianceEvent = generateRandomAlliance(state)
    if (allianceEvent) events.push(allianceEvent)
  }

  // Random sanction
  if (Math.random() < sanctionProbability) {
    const sanctionEvent = generateRandomSanction(state)
    if (sanctionEvent) events.push(sanctionEvent)
  }

  // Random economic events
  if (Math.random() < economicEventProbability) {
    const economicEvent = generateRandomEconomicEvent(state)
    if (economicEvent) events.push(economicEvent)
  }

  return events
}

function generateRandomWar(state: GameState): GameEvent | null {
  const availableCountries = countries.filter(c => c.id !== state.country.id)
  if (availableCountries.length < 2) return null

  const attacker = availableCountries[Math.floor(Math.random() * availableCountries.length)]
  const defender = availableCountries.filter(c => c.id !== attacker.id)[Math.floor(Math.random() * (availableCountries.length - 1))]

  // Generate contextual reasons for war
  const reasons = [
    'over territorial disputes',
    'citing border violations',
    'following failed diplomatic negotiations',
    'over resource access',
    'in response to military buildups'
  ]
  const reason = reasons[Math.floor(Math.random() * reasons.length)]

  // Check if either country is an ally or enemy to explain impact
  let impactMessage = ''
  const isAttackerAlly = state.allies.includes(attacker.id)
  const isDefenderAlly = state.allies.includes(defender.id)
  const isAttackerEnemy = state.enemies.includes(attacker.id)
  const isDefenderEnemy = state.enemies.includes(defender.id)

  if (isAttackerAlly && isDefenderEnemy) {
    impactMessage = ` Your ally fights your enemy - this benefits you!`
  } else if (isDefenderAlly && isAttackerEnemy) {
    impactMessage = ` Your ally is under attack by your enemy - consider supporting them!`
  } else if (isAttackerAlly || isDefenderAlly) {
    impactMessage = ` Your ally is at war - this may affect trade and your security.`
  } else if (isAttackerEnemy || isDefenderEnemy) {
    impactMessage = ` Your enemy is distracted by war - an opportunity for you.`
  } else {
    impactMessage = ` Regional instability may affect global markets.`
  }

  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'world',
    category: 'military',
    message: `⚔️ ${attacker.name} declared war on ${defender.name} ${reason}.${impactMessage}`,
    icon: '⚔️'
  }
}

function generateRandomAlliance(state: GameState): GameEvent | null {
  const availableCountries = countries.filter(c => c.id !== state.country.id)
  if (availableCountries.length < 2) return null

  const country1 = availableCountries[Math.floor(Math.random() * availableCountries.length)]
  const country2 = availableCountries.filter(c => c.id !== country1.id)[Math.floor(Math.random() * (availableCountries.length - 1))]

  // Generate contextual reasons
  const reasons = [
    'to strengthen mutual defense',
    'for economic cooperation',
    'to counter regional threats',
    'following successful trade negotiations',
    'to promote shared interests'
  ]
  const reason = reasons[Math.floor(Math.random() * reasons.length)]

  // Check relationships and explain impact
  let impactMessage = ''
  const isCountry1Ally = state.allies.includes(country1.id)
  const isCountry2Ally = state.allies.includes(country2.id)
  const isCountry1Enemy = state.enemies.includes(country1.id)
  const isCountry2Enemy = state.enemies.includes(country2.id)

  if (isCountry1Ally && isCountry2Ally) {
    impactMessage = ` Both are your allies - strengthens your alliance network!`
  } else if (isCountry1Enemy && isCountry2Enemy) {
    impactMessage = ` Your enemies unite - you should strengthen your military!`
  } else if ((isCountry1Ally && isCountry2Enemy) || (isCountry2Ally && isCountry1Enemy)) {
    impactMessage = ` Your ally partnered with your enemy - diplomacy is shifting!`
  } else if (isCountry1Ally || isCountry2Ally) {
    impactMessage = ` Your ally gains a new partner - this may benefit you.`
  } else if (isCountry1Enemy || isCountry2Enemy) {
    impactMessage = ` Your enemy gains a new ally - monitor this carefully.`
  } else {
    impactMessage = ` This reshapes regional power dynamics.`
  }

  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'world',
    category: 'diplomatic',
    message: `🤝 ${country1.name} and ${country2.name} formed an alliance ${reason}.${impactMessage}`,
    icon: '🤝'
  }
}

function generateRandomSanction(state: GameState): GameEvent | null {
  const availableCountries = countries.filter(c => c.id !== state.country.id)
  if (availableCountries.length < 2) return null

  const sanctioner = availableCountries[Math.floor(Math.random() * availableCountries.length)]
  const sanctioned = availableCountries.filter(c => c.id !== sanctioner.id)[Math.floor(Math.random() * (availableCountries.length - 1))]

  // Generate contextual reasons
  const reasons = [
    'due to human rights concerns',
    'over nuclear program development',
    'following trade violations',
    'in response to military aggression',
    'over democratic backsliding'
  ]
  const reason = reasons[Math.floor(Math.random() * reasons.length)]

  // Check relationships and explain impact
  let impactMessage = ''
  const isSanctionerAlly = state.allies.includes(sanctioner.id)
  const isSanctionedAlly = state.allies.includes(sanctioned.id)
  const isSanctionerEnemy = state.enemies.includes(sanctioner.id)
  const isSanctionedEnemy = state.enemies.includes(sanctioned.id)

  if (isSanctionedAlly && !isSanctionerEnemy) {
    impactMessage = ` Your ally is sanctioned - this may hurt your economy too.`
  } else if (isSanctionedEnemy && isSanctionerAlly) {
    impactMessage = ` Your ally sanctions your enemy - this weakens your adversary!`
  } else if (isSanctionedEnemy) {
    impactMessage = ` Your enemy is weakened by sanctions - an advantage for you.`
  } else if (isSanctionerAlly) {
    impactMessage = ` Your ally takes strong diplomatic action.`
  } else {
    impactMessage = ` International tensions rise, affecting global trade.`
  }

  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'world',
    category: 'diplomatic',
    message: `🚫 ${sanctioner.name} imposed sanctions on ${sanctioned.name} ${reason}.${impactMessage}`,
    icon: '🚫'
  }
}

function generateRandomEconomicEvent(state: GameState): GameEvent | null {
  const events = [
    'Global oil prices surge, affecting economies worldwide.',
    'Major stock market rally boosts investor confidence.',
    'International trade agreements signed between multiple nations.',
    'Global economic forum discusses climate change policies.',
    'Major tech company announces breakthrough innovation.',
    'Natural disaster impacts global supply chains.',
    'International currency fluctuations affect trade.',
    'Global tourism industry reports record numbers.',
  ]

  const message = events[Math.floor(Math.random() * events.length)]

  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'world',
    category: 'economic',
    message,
    icon: '📊'
  }
}

// Check for uprising warnings (ANTI-SPAM: Only warn every 30 days)
export function checkUprisingWarnings(state: GameState): GameEvent[] {
  const events: GameEvent[] = []
  const WARNING_COOLDOWN = 30 // Only warn every 30 days

  // Low happiness warning (30-20%)
  if (state.happiness < 30 && state.happiness > 20) {
    const daysSinceLastWarning = state.currentDay - state.lastWarningDay.lowHappiness
    if (daysSinceLastWarning >= WARNING_COOLDOWN || state.lastWarningDay.lowHappiness < 0) {
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'critical',
        category: 'domestic',
        message: 'WARNING: Public happiness is dangerously low! Risk of uprising increasing.',
        icon: '⚠️'
      })
    }
  }

  // Uprising progress warning (ALWAYS show this - it's time-critical!)
  if (state.uprisingProgress > 0 && state.uprisingProgress < 30) {
    const daysRemaining = 30 - state.uprisingProgress
    events.push({
      id: generateEventId(),
      day: state.currentDay,
      timestamp: new Date(),
      type: 'critical',
      category: 'domestic',
      message: `UPRISING WARNING: ${daysRemaining} days until revolution if happiness remains below 20!`,
      icon: '🔥'
    })
  }

  // Debt ratio warning
  if (state.debtToGdpRatio > 150) {
    const daysSinceLastWarning = state.currentDay - state.lastWarningDay.debtRatio
    if (daysSinceLastWarning >= WARNING_COOLDOWN || state.lastWarningDay.debtRatio < 0) {
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'critical',
        category: 'economic',
        message: 'CRITICAL: Debt-to-GDP ratio dangerously high! Economic collapse risk!',
        icon: '💀'
      })
    }
  }

  // High inflation warning
  if (state.inflationRate > 10) {
    const daysSinceLastWarning = state.currentDay - state.lastWarningDay.inflation
    if (daysSinceLastWarning >= WARNING_COOLDOWN || state.lastWarningDay.inflation < 0) {
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'critical',
        category: 'economic',
        message: `CRITICAL: Hyperinflation detected at ${state.inflationRate.toFixed(1)}%! Economy at risk!`,
        icon: '📈'
      })
    }
  }

  // High unemployment warning
  if (state.unemploymentRate > 15) {
    const daysSinceLastWarning = state.currentDay - state.lastWarningDay.unemployment
    if (daysSinceLastWarning >= WARNING_COOLDOWN || state.lastWarningDay.unemployment < 0) {
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'critical',
        category: 'economic',
        message: `CRITICAL: Unemployment at ${state.unemploymentRate.toFixed(1)}%! Social unrest growing!`,
        icon: '📉'
      })
    }
  }

  // High interest rate warning (>8%)
  if (state.interestRate > 8) {
    const daysSinceLastWarning = state.currentDay - state.lastWarningDay.highInterest
    if (daysSinceLastWarning >= WARNING_COOLDOWN || state.lastWarningDay.highInterest < 0) {
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'critical',
        category: 'economic',
        message: `WARNING: Interest rate at ${state.interestRate.toFixed(1)}%! High rates slow economic growth and increase debt costs.`,
        icon: '📈'
      })
    }
  }

  // Low treasury warning (less than 25% of initial treasury)
  const initialTreasury = state.initialStats.gdp * 0.05 // Initial treasury was 5% of GDP
  if (state.treasury < initialTreasury * 0.25) {
    const daysSinceLastWarning = state.currentDay - state.lastWarningDay.lowTreasury
    if (daysSinceLastWarning >= WARNING_COOLDOWN || state.lastWarningDay.lowTreasury < 0) {
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'critical',
        category: 'economic',
        message: `ALERT: Treasury critically low at $${state.treasury.toFixed(2)}B! You started with $${initialTreasury.toFixed(2)}B. Replenish funds soon!`,
        icon: '💰'
      })
    }
  }

  return events
}

// Create player action event
export function createPlayerEvent(
  state: GameState,
  message: string,
  category: GameEvent['category'] = 'economic',
  icon?: string
): GameEvent {
  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'player',
    category,
    message,
    icon
  }
}

// Create critical system event
export function createCriticalEvent(
  state: GameState,
  message: string,
  category: GameEvent['category'] = 'system'
): GameEvent {
  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'critical',
    category,
    message,
    icon: '❗'
  }
}

// Create advice event
export function createAdviceEvent(
  state: GameState,
  message: string,
  category: GameEvent['category'] = 'economic'
): GameEvent {
  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'advice',
    category,
    message,
    icon: '💡'
  }
}

// Generate economic advice based on performance (check every 30 days, only show if underperforming)
export function generateEconomicAdvice(state: GameState): GameEvent[] {
  const events: GameEvent[] = []

  // Only generate advice every 30 days and after day 10 (to let player get started)
  if (state.currentDay < 10 || state.currentDay % 30 !== 0) {
    return events
  }

  const adviceGiven = []

  // HIGH DEBT ADVICE
  if (state.debtToGdpRatio > 100) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💡 ECONOMIC ADVISOR: Your debt-to-GDP ratio is ${state.debtToGdpRatio.toFixed(0)}%! This is dangerously high. Consider paying off debt using the "PAY DEBT" action to avoid economic collapse.`,
      'economic'
    ))
  }

  // HIGH INFLATION ADVICE
  if (state.inflationRate > 7) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💡 ECONOMIC ADVISOR: Inflation at ${state.inflationRate.toFixed(1)}%! Raise interest rates to cool the economy. Avoid printing money until inflation is under control.`,
      'economic'
    ))
  }

  // LOW GDP GROWTH ADVICE
  if (state.gdpGrowthRate < 1 && state.debtToGdpRatio < 80) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💡 ECONOMIC ADVISOR: GDP growth is stagnant at ${state.gdpGrowthRate.toFixed(1)}%. Invest in infrastructure, education, and long-term sectors to boost growth.`,
      'economic'
    ))
  }

  // HIGH UNEMPLOYMENT ADVICE
  if (state.unemploymentRate > 12) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💡 ECONOMIC ADVISOR: Unemployment at ${state.unemploymentRate.toFixed(1)}%! Invest in education, health, and infrastructure sectors to create jobs and reduce unemployment.`,
      'domestic'
    ))
  }

  // LOW HAPPINESS ADVICE
  if (state.happiness < 35) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💡 SOCIAL ADVISOR: Happiness at ${state.happiness.toFixed(0)}%! Invest in health, education, housing, and sports sectors to improve quality of life.`,
      'domestic'
    ))
  }

  // BAD SECTOR INVESTMENT ADVICE (check country-specific potentials)
  if (state.country && state.country.sectorPotentials) {
    const countryPotentials = state.country.sectorPotentials
    if (countryPotentials.agriculture === 'very-low' && state.sectorLevels.agriculture > 25) {
      adviceGiven.push(createAdviceEvent(
        state,
        `💡 SECTOR ADVISOR: Agriculture has very low potential in ${state.country.name} due to climate/geography. This is a bad investment! Focus on higher-potential sectors instead.`,
        'domestic'
      ))
    }
    if (countryPotentials.tourism === 'very-low' && state.sectorLevels.tourism > 25) {
      adviceGiven.push(createAdviceEvent(
        state,
        `💡 SECTOR ADVISOR: Tourism has very low potential in ${state.country.name}. Consider investing in sectors with better prospects for your country.`,
        'domestic'
      ))
    }
  }

  // TREASURY TOO LOW ADVICE
  const initialTreasury = state.initialStats.gdp * 0.05
  if (state.treasury < initialTreasury * 0.3 && state.debt < state.gdp * 0.5) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💡 FISCAL ADVISOR: Treasury is running low at $${state.treasury.toFixed(2)}B. You started with $${initialTreasury.toFixed(2)}B. Generate revenue through tourism/sports/transport sectors or consider careful borrowing.`,
      'economic'
    ))
  }

  // MILITARY TOO WEAK IF THREATENED
  if (state.enemies.length > 0 && state.militaryStrength < 30) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💡 DEFENSE ADVISOR: You have enemies but military strength is only ${state.militaryStrength.toFixed(0)}%! Invest in military and security sectors to defend your nation.`,
      'military'
    ))
  }

  // Return max 2 advice messages to avoid spam
  return adviceGiven.slice(0, 2)
}

// Generate dynamic war battle events
export function generateWarBattleEvents(state: GameState): GameEvent[] {
  const events: GameEvent[] = []

  // Only generate battle events every 3-7 days to avoid spam
  state.activeWars.forEach(war => {
    if (!war.isPlayerInvolved) return

    // 20% chance per day to generate a battle event
    if (Math.random() > 0.2) return

    const playerCountry = state.country.name
    const enemyCountry = countries.find(c =>
      c.id === (war.isPlayerAttacker ? war.defender : war.attacker)
    )?.name || 'Enemy'

    const daysElapsed = state.currentDay - war.startDay
    const progressPercent = ((war.duration - (war.duration - daysElapsed)) / war.duration) * 100

    // Different types of events based on war progress
    if (progressPercent < 25) {
      // Early war - attacks and initial engagements
      if (war.isPlayerAttacker) {
        const attackMsg = battleEvents.attack[Math.floor(Math.random() * battleEvents.attack.length)]
        events.push({
          id: generateEventId(),
          day: state.currentDay,
          timestamp: new Date(),
          type: 'player',
          category: 'military',
          message: `Your forces ${attackMsg} against ${enemyCountry}!`,
          icon: '⚔️'
        })
      } else {
        const defendMsg = battleEvents.defend[Math.floor(Math.random() * battleEvents.defend.length)]
        events.push({
          id: generateEventId(),
          day: state.currentDay,
          timestamp: new Date(),
          type: 'critical',
          category: 'military',
          message: `${enemyCountry} attacks! Your forces ${defendMsg}.`,
          icon: '🛡️'
        })
      }
    } else if (progressPercent < 75) {
      // Mid war - heavy fighting, casualties
      const playerStrengthAdvantage = war.isPlayerAttacker
        ? war.attackerStrength > war.defenderStrength
        : war.defenderStrength > war.attackerStrength

      if (playerStrengthAdvantage) {
        const victoryMsg = battleEvents.victories[Math.floor(Math.random() * battleEvents.victories.length)]
        events.push({
          id: generateEventId(),
          day: state.currentDay,
          timestamp: new Date(),
          type: 'player',
          category: 'military',
          message: `Your forces ${victoryMsg} against ${enemyCountry}!`,
          icon: '🎖️'
        })
      } else {
        const casualtyMsg = battleEvents.casualties[Math.floor(Math.random() * battleEvents.casualties.length)]
        const lossPercent = Math.floor(Math.random() * 15) + 10 // 10-25%
        events.push({
          id: generateEventId(),
          day: state.currentDay,
          timestamp: new Date(),
          type: 'critical',
          category: 'military',
          message: `${enemyCountry} counterattack! ${casualtyMsg} - ${lossPercent}% military strength lost!`,
          icon: '💀'
        })
      }
    } else {
      // Late war - final pushes
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'player',
        category: 'military',
        message: `War with ${enemyCountry} nearing conclusion. Final battles underway...`,
        icon: '🏁'
      })
    }
  })

  return events
}
