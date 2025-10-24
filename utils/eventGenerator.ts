import { GameEvent, GameState, War } from '@/types/game'
import { countries } from '@/data/countries'
import { sectorPotentials } from '@/data/sectorPotentials'

let eventIdCounter = 0

export function generateEventId(): string {
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
  const allyAidProbability = 0.008 * speedMultiplier // ~0.8% chance per day

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

  // Random ally aid (only if you have allies)
  if (state.allies.length > 0 && Math.random() < allyAidProbability) {
    const allyAidEvent = generateAllyAidEvent(state)
    if (allyAidEvent) events.push(allyAidEvent)
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
    message: `${attacker.name} declared war on ${defender.name} ${reason}.${impactMessage}`,
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

  // Check relationships (using new relationship score system)
  const country1Relationship = state.relationships[country1.id] || 60
  const country2Relationship = state.relationships[country2.id] || 60
  const isCountry1Friend = country1Relationship >= 71 // Friendly or Allied
  const isCountry2Friend = country2Relationship >= 71
  const isCountry1Enemy = state.enemies.includes(country1.id)
  const isCountry2Enemy = state.enemies.includes(country2.id)

  // NEW: Apply relationship impacts based on the alliance!
  const impact: any = {}
  let impactMessage = ''

  // Both are your friends - relationship boost!
  if (isCountry1Friend && isCountry2Friend) {
    impact.relationshipChanges = {
      [country1.id]: 2,  // +2 relationship
      [country2.id]: 2   // +2 relationship
    }
    impactMessage = ` Both are your friends - your relationships improve! (+2 with each)`
  }
  // Both are enemies - warning message
  else if (isCountry1Enemy && isCountry2Enemy) {
    impactMessage = ` Your enemies unite - you should strengthen your military!`
  }
  // One friend, one enemy - diplomatic crisis (could trigger decision modal in future)
  else if ((isCountry1Friend && isCountry2Enemy) || (isCountry2Friend && isCountry1Enemy)) {
    const friendCountry = isCountry1Friend ? country1.name : country2.name
    const enemyCountry = isCountry1Enemy ? country1.name : country2.name
    impactMessage = ` Your friend ${friendCountry} allied with your enemy ${enemyCountry}! Diplomacy is shifting - this complicates your relations.`
    // Small reputation hit due to complex situation
    impact.globalReputation = -3
  }
  // One friend, one neutral
  else if (isCountry1Friend || isCountry2Friend) {
    impactMessage = ` Your friend gains a new ally - this may benefit you.`
  }
  // One enemy, one neutral
  else if (isCountry1Enemy || isCountry2Enemy) {
    impactMessage = ` Your enemy gains a new ally - monitor this carefully.`
  }
  // Both neutral
  else {
    impactMessage = ` This reshapes regional power dynamics.`
  }

  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'world',
    category: 'diplomatic',
    message: `${country1.name} and ${country2.name} formed an alliance ${reason}.${impactMessage}`,
    icon: '🤝',
    impact: Object.keys(impact).length > 0 ? impact : undefined
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
    message: `${sanctioner.name} imposed sanctions on ${sanctioned.name} ${reason}.${impactMessage}`,
    icon: '🚫'
  }
}

function generateAllyAidEvent(state: GameState): GameEvent | null {
  // Pick random ally
  const allyId = state.allies[Math.floor(Math.random() * state.allies.length)]
  const ally = countries.find(c => c.id === allyId)
  if (!ally) return null

  // Aid amount: 5% to 15% of player's GDP
  const aidPercent = 5 + Math.random() * 10 // 5-15%
  const aidAmount = state.gdp * (aidPercent / 100)

  return {
    id: generateEventId(),
    day: state.currentDay,
    timestamp: new Date(),
    type: 'player',
    category: 'diplomatic',
    message: `💰 ALLY SUPPORT: ${ally.name} sends $${aidAmount.toFixed(1)}B in aid (${aidPercent.toFixed(1)}% of your GDP)! Your alliance is strong!`,
    icon: '🤝',
    impact: {
      treasury: aidAmount,
      happiness: 3
    }
  }
}

// Format impact changes into readable string
function formatImpactString(impact: GameEvent['impact']): string {
  if (!impact) return ''

  const changes: string[] = []

  if (impact.gdpGrowth) {
    const sign = impact.gdpGrowth > 0 ? '+' : ''
    changes.push(`GDP Growth ${sign}${impact.gdpGrowth.toFixed(1)}%`)
  }
  if (impact.happiness) {
    const sign = impact.happiness > 0 ? '+' : ''
    changes.push(`Happiness ${sign}${impact.happiness.toFixed(0)}%`)
  }
  if (impact.treasury) {
    const sign = impact.treasury > 0 ? '+' : ''
    changes.push(`Treasury ${sign}$${Math.abs(impact.treasury).toFixed(1)}B`)
  }
  if (impact.revenue) {
    const sign = impact.revenue > 0 ? '+' : ''
    changes.push(`Revenue ${sign}$${Math.abs(impact.revenue).toFixed(2)}B/day`)
  }
  if (impact.unemployment) {
    const sign = impact.unemployment > 0 ? '+' : ''
    changes.push(`Unemployment ${sign}${impact.unemployment.toFixed(1)}%`)
  }
  if (impact.inflation) {
    const sign = impact.inflation > 0 ? '+' : ''
    changes.push(`Inflation ${sign}${impact.inflation.toFixed(1)}%`)
  }

  return changes.length > 0 ? ` [${changes.join(', ')}]` : ''
}

function generateRandomEconomicEvent(state: GameState): GameEvent | null {
  // Impactful economic events with varying probabilities based on severity
  const events = [
    // VERY RARE (1% chance) - Major positive events
    {
      message: '🏆 GLOBAL ECONOMIC BOOM: Major technological breakthrough creates worldwide prosperity!',
      impact: { gdpGrowth: 0.5, happiness: 10, treasury: state.gdp * 0.02 },
      probability: 0.01
    },
    {
      message: '💰 GOLD RUSH: Miners strike massive gold deposits! Treasury receives windfall!',
      impact: { treasury: state.gdp * 0.05, happiness: 5 },
      probability: 0.01
    },
    
    // RARE (3% chance) - Positive events
    {
      message: '📈 STOCK MARKET SURGE: Global markets rally, boosting investor confidence!',
      impact: { gdpGrowth: 0.2, treasury: state.gdp * 0.01, happiness: 3 },
      probability: 0.03
    },
    {
      message: '🌍 TRADE AGREEMENT: Major international trade deal signed, boosting exports!',
      impact: { gdpGrowth: 0.15, revenue: state.revenue * 0.1 },
      probability: 0.03
    },
    {
      message: '🏭 INDUSTRIAL REVOLUTION: New manufacturing technologies boost productivity!',
      impact: { gdpGrowth: 0.1, unemployment: -2 },
      probability: 0.03
    },
    
    // COMMON (8% chance) - Minor positive events
    {
      message: '🎯 TOURISM BOOM: Your country becomes a popular destination!',
      impact: { revenue: state.revenue * 0.05, happiness: 2 },
      probability: 0.08
    },
    {
      message: '🌱 GREEN ENERGY: Renewable energy investments pay off!',
      impact: { gdpGrowth: 0.05, happiness: 1 },
      probability: 0.08
    },
    
    // COMMON (8% chance) - Minor negative events
    {
      message: '📉 MARKET CORRECTION: Stock markets experience minor decline.',
      impact: { gdpGrowth: -0.05, happiness: -1 },
      probability: 0.08
    },
    {
      message: '🌪️ NATURAL DISASTER: Severe weather disrupts local economy.',
      impact: { gdpGrowth: -0.1, treasury: -state.gdp * 0.005, happiness: -2 },
      probability: 0.08
    },
    
    // RARE (3% chance) - Major negative events
    {
      message: '💥 ECONOMIC CRISIS: Global financial markets collapse!',
      impact: { gdpGrowth: -0.3, happiness: -8, treasury: -state.gdp * 0.02 },
      probability: 0.03
    },
    {
      message: '⚡ ENERGY CRISIS: Oil prices skyrocket, crippling transportation!',
      impact: { gdpGrowth: -0.2, inflation: 2, happiness: -5 },
      probability: 0.03
    },
    {
      message: '🏭 INDUSTRIAL ACCIDENT: Major factory disaster disrupts supply chains!',
      impact: { gdpGrowth: -0.15, unemployment: 3, happiness: -3 },
      probability: 0.03
    },
    
    // VERY RARE (1% chance) - Catastrophic events
    {
      message: '💀 ECONOMIC COLLAPSE: Global depression hits worldwide!',
      impact: { gdpGrowth: -0.5, happiness: -15, unemployment: 5, inflation: 3 },
      probability: 0.01
    }
  ]

  // Select event based on probability
  const random = Math.random()
  let cumulativeProbability = 0
  
  for (const event of events) {
    cumulativeProbability += event.probability
    if (random < cumulativeProbability) {
      // Apply the impact to the game state (this will be handled by the game engine)
      const impactString = formatImpactString(event.impact)
      return {
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'world',
        category: 'economic',
        message: event.message + impactString,
        icon: '📊',
        impact: event.impact // Store impact data for the game engine to process
      }
    }
  }

  return null
}

// Check for uprising warnings (ANTI-SPAM: Only warn every 30 days)
export function checkUprisingWarnings(state: GameState): GameEvent[] {
  const events: GameEvent[] = []
  const WARNING_COOLDOWN = 90 // Only warn every 90 days

  // Low happiness warning (only when happiness is below 15%)
  if (state.happiness < 15) {
    const daysSinceLastWarning = state.currentDay - state.lastWarningDay.lowHappiness
    if (daysSinceLastWarning >= WARNING_COOLDOWN || state.lastWarningDay.lowHappiness < 0) {
      // Calculate uprising probability for display (matches game engine calculation)
      const uprisingChance = ((15 - state.happiness) / 15) * 2 // Convert to percentage (0-2%)
      events.push({
        id: generateEventId(),
        day: state.currentDay,
        timestamp: new Date(),
        type: 'critical',
        category: 'domestic',
        message: `⚠️ UPRISING RISK: Happiness critically low at ${state.happiness.toFixed(0)}%! Daily uprising probability: ${uprisingChance.toFixed(2)}%. FIX: Invest in Health, Education, Housing sectors and stop wars.`,
        icon: '⚠️'
      })
    }
  }

  // Uprising triggered event (only shown once when uprising actually triggers)
  if (state.uprisingTriggered) {
    // This will be handled by a modal in the UI, no event log message needed
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

  // WAR WARNINGS - Multiple wars are extremely punishing!
  if (state.activeWars.length >= 2) {
    adviceGiven.push(createAdviceEvent(
      state,
      `🚨 MILITARY ADVISOR: Fighting ${state.activeWars.length} simultaneous wars is DEVASTATING your economy! Each additional war causes exponential damage. End conflicts immediately or face economic collapse!`,
      'military'
    ))
  } else if (state.activeWars.length === 1 && state.gdpGrowthRate < 2) {
    adviceGiven.push(createAdviceEvent(
      state,
      `⚔️ MILITARY ADVISOR: War is draining your economy (-2% GDP growth per war). Wars reduce happiness significantly. Consider peace if economic situation worsens.`,
      'military'
    ))
  }

  // TOO MANY PAST WARS WARNING
  if (state.warredCountries.length >= 3 && state.globalReputation < 40) {
    adviceGiven.push(createAdviceEvent(
      state,
      `💀 DIPLOMATIC ADVISOR: You've waged ${state.warredCountries.length} wars! Your global reputation is destroyed (${state.globalReputation.toFixed(0)}). Wars have SEVERE long-term consequences. Build alliances instead!`,
      'diplomatic'
    ))
  }

  // ALLIANCE ENCOURAGEMENT
  if (state.allies.length === 0 && state.currentDay > 100) {
    adviceGiven.push(createAdviceEvent(
      state,
      `🤝 DIPLOMATIC ADVISOR: You have NO allies! Alliances provide mutual defense, economic support, and strengthen your position. Propose alliances to friendly nations.`,
      'diplomatic'
    ))
  } else if (state.allies.length >= 3) {
    adviceGiven.push(createAdviceEvent(
      state,
      `🤝 DIPLOMATIC ADVISOR: Excellent! You have ${state.allies.length} allies. Strong alliances deter aggression and provide economic opportunities. Continue building relationships!`,
      'diplomatic'
    ))
  }

  // BAD SECTOR INVESTMENT ADVICE (check country-specific potentials)
  const countryPotentials = sectorPotentials[state.country.id]
  if (countryPotentials) {
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
      // Late war - final pushes (only show occasionally to avoid spam)
      if (Math.random() < 0.1) { // 10% chance in final phase
        const finalMsg = battleEvents.victories[Math.floor(Math.random() * battleEvents.victories.length)]
        events.push({
          id: generateEventId(),
          day: state.currentDay,
          timestamp: new Date(),
          type: 'player',
          category: 'military',
          message: `War with ${enemyCountry} nearing conclusion. Your forces ${finalMsg}!`,
          icon: '🏁'
        })
      }
    }
  })

  return events
}
