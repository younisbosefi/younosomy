import { GameState, SectorPotential } from '@/types/game'
import { sectorPotentials } from '@/data/sectorPotentials'
import { calculateTourismBoost, calculateTradeBoost, calculateRelationshipHappiness } from './relationshipSystem'

// Calculate GDP Growth Rate based on multiple factors (ECONOMIC MISTAKES HAVE LASTING CONSEQUENCES!)
export function calculateGDPGrowthRate(state: GameState): number {
  let growth = 2.0 // Base growth rate

  // Interest rate effect (SEVERELY PUNISHING!)
  // High rates = businesses can't borrow to expand, consumers can't afford loans
  if (state.interestRate > 7) {
    // Very high rates devastate growth
    growth -= (state.interestRate - 7) * 0.8 // 10% rate = -2.4% growth!
  } else if (state.interestRate > 4) {
    growth -= (state.interestRate - 4) * 0.5 // Moderate penalty
  } else if (state.interestRate < 1) {
    // TOO LOW rates can cause asset bubbles and malinvestment
    growth -= (1 - state.interestRate) * 0.3
  }

  // LASTING CONSEQUENCE: Debt-to-GDP ratio effect (MUCH MORE PUNISHING!)
  if (state.debtToGdpRatio > 100) {
    // Exponential penalty - debt crisis is hard to escape
    const debtPenalty = Math.pow((state.debtToGdpRatio - 100) / 100, 1.5) * 2
    growth -= debtPenalty
  }
  // Even moderate debt hurts growth now
  if (state.debtToGdpRatio > 60) {
    growth -= (state.debtToGdpRatio - 60) * 0.01
  }

  // LASTING CONSEQUENCE: Inflation effect (EXPONENTIAL DAMAGE!)
  if (state.inflationRate > 10) {
    // Hyperinflation devastates economy
    growth -= Math.pow(state.inflationRate - 10, 1.3) * 0.5
  } else if (state.inflationRate > 5) {
    growth -= (state.inflationRate - 5) * 0.4
  }

  // Unemployment effect (high unemployment hurts growth)
  growth -= (state.unemploymentRate - 4) * 0.1

  // Happiness effect (happy citizens = productive economy)
  growth += (state.happiness - 50) * 0.03

  // War effect (active wars DEVASTATE economy - especially multiple wars!)
  if (state.isInWar) {
    const numWars = state.activeWars.length
    // Exponential penalty for multiple wars: 1 war = -2%, 2 wars = -5%, 3 wars = -9%
    growth -= numWars * 2.0 + (numWars * (numWars - 1)) * 0.5
  }

  // Sanction effect
  growth -= state.sanctionsOnUs.length * 0.5

  // LASTING CONSEQUENCE: Default ruins credit rating
  if (state.hasDefaulted) {
    growth -= 3 // Permanent major penalty
  }

  // Sector investments positive effect
  const sectorBoost = calculateSectorBoost(state)
  growth += sectorBoost

  // Relationship system: Trade benefits/penalties from international relations
  const tradeBoost = calculateTradeBoost(state)
  growth += tradeBoost

  return Number(growth.toFixed(2))
}

// Calculate boost from sector investments
function calculateSectorBoost(state: GameState): number {
  const potentials = sectorPotentials[state.country.id]
  if (!potentials) return 0

  let boost = 0
  const sectors = Object.keys(state.sectorLevels) as Array<keyof typeof state.sectorLevels>

  sectors.forEach((sector) => {
    const level = state.sectorLevels[sector]
    const potential = potentials[sector]

    const multiplier = getPotentialMultiplier(potential)
    boost += level * multiplier * 0.02
  })

  return boost
}

function getPotentialMultiplier(potential: SectorPotential): number {
  switch (potential) {
    case 'very-high': return 2.0
    case 'high': return 1.5
    case 'mid': return 1.0
    case 'low': return 0.3
    case 'very-low': return -0.5 // Negative effect!
  }
}

// Calculate daily revenue (SLOWED DOWN for educational balance)
export function calculateDailyRevenue(state: GameState): number {
  // Base revenue is a much smaller percentage of GDP for realistic gameplay
  let revenue = state.gdp * 0.00001 // 0.001% of GDP per day (10x slower!)

  // Tax effect (higher taxes = more revenue but hurts happiness)
  const taxMultiplier = 1.0 // This will be adjustable by player
  revenue *= taxMultiplier

  // GDP growth contributes to revenue (reduced impact)
  revenue += state.gdpGrowthRate * 0.01

  // Sanctions hurt revenue
  revenue -= state.sanctionsOnUs.length * 0.01

  // Relationship system: Tourism revenue from friendly nations
  const tourismBoost = calculateTourismBoost(state)
  revenue += tourismBoost

  return Number(revenue.toFixed(4))
}

// Calculate inflation rate (LASTING CONSEQUENCE: High inflation is sticky!)
export function calculateInflationRate(state: GameState, moneyPrinted: number = 0): number {
  let inflation = state.inflationRate

  // Interest rate effect (high rate lowers inflation, but less effective at high levels)
  const interestEffectiveness = inflation > 10 ? 0.3 : 0.5 // Increased effectiveness
  inflation -= (state.interestRate - 2) * interestEffectiveness

  // Money printing effect
  if (moneyPrinted > 0) {
    inflation += (moneyPrinted / state.gdp) * 10
  }

  // LASTING CONSEQUENCE: High inflation is sticky (hard to reduce)
  if (inflation > 10) {
    // Hyperinflation has momentum - only drifts down slowly
    inflation += (5 - inflation) * 0.01 // Drifts toward 5%, not 2%!
  } else if (inflation > 5) {
    // Moderate inflation drifts toward 3%
    inflation += (3 - inflation) * 0.03
  } else {
    // Low inflation drifts toward healthy 2%
    inflation += (2 - inflation) * 0.05
  }

  // Unemployment effect (high unemployment = low inflation, but weaker when inflation is high)
  const unemploymentEffect = inflation > 10 ? 0.02 : 0.05
  inflation -= (state.unemploymentRate - 5) * unemploymentEffect

  // LASTING CONSEQUENCE: Debt crisis can cause inflation
  if (state.debtToGdpRatio > 150) {
    inflation += 0.1 // Debt monetization pressure
  }

  // Keep between 0 and 25 (allow hyperinflation to go higher)
  inflation = Math.max(0, Math.min(25, inflation))

  return Number(inflation.toFixed(2))
}

// Calculate unemployment rate
export function calculateUnemploymentRate(state: GameState): number {
  let unemployment = state.unemploymentRate

  // GDP growth effect (growth = jobs)
  unemployment -= state.gdpGrowthRate * 0.2

  // HIGH INTEREST RATES KILL JOBS! (businesses can't borrow to expand)
  if (state.interestRate > 6) {
    unemployment += (state.interestRate - 6) * 0.4 // 10% rate = +1.6% unemployment!
  }

  // TOO LOW interest rates can also cause problems (misallocated capital)
  if (state.interestRate < 0.5 && state.inflationRate > 5) {
    unemployment += 0.3 // Asset bubble forming
  }

  // Sector investment effect (infrastructure, education create jobs)
  unemployment -= (state.sectorLevels.infrastructure + state.sectorLevels.education) * 0.01

  // Declining infrastructure causes structural unemployment (ONLY IF BELOW START)
  const infrastructureDecline = state.initialStats.sectorLevels.infrastructure - state.sectorLevels.infrastructure
  if (infrastructureDecline > 0) {
    unemployment += infrastructureDecline * 0.08 // Punishment for letting infrastructure decay
  }

  // War effect (wars create jobs but also casualties)
  if (state.isInWar) {
    unemployment -= state.activeWars.length * 0.3
  }

  // Natural drift toward baseline
  const baseline = state.country.difficulty === 'easy' ? 4 : state.country.difficulty === 'medium' ? 6 : 10
  unemployment += (baseline - unemployment) * 0.02

  // Keep between 1 and 40 (allow higher unemployment)
  unemployment = Math.max(1, Math.min(40, unemployment))

  return Number(unemployment.toFixed(2))
}

// Calculate happiness - RELATIVE TO INITIAL STATS (this is crucial for balancing!)
export function calculateHappiness(state: GameState): number {
  let happiness = state.initialStats.happiness // Start from initial baseline

  // RELATIVE CHANGES (people react to changes from what they're used to)

  // GDP change - did economy grow or shrink?
  const gdpChangePercent = ((state.gdp - state.initialStats.gdp) / state.initialStats.gdp) * 100
  happiness += gdpChangePercent * 0.3 // ±30% GDP = ±9 happiness

  // Unemployment change - are more/fewer people employed?
  const unemploymentDelta = state.unemploymentRate - state.initialStats.unemployment
  happiness -= unemploymentDelta * 2 // Each % increase in unemployment = -2 happiness

  // Inflation change - is inflation rising or falling?
  const inflationDelta = state.inflationRate - state.initialStats.inflation
  happiness -= inflationDelta * 1.5 // Each % increase in inflation = -1.5 happiness

  // Security change - do people feel safer?
  const securityDelta = state.security - state.initialStats.security
  happiness += securityDelta * 0.5

  // Military strength change (national pride)
  const militaryDelta = state.militaryStrength - state.initialStats.militaryStrength
  happiness += militaryDelta * 0.2

  // ABSOLUTE EFFECTS (things that matter regardless of baseline)

  // Extreme poverty/hardship - absolute floor
  if (state.gdp < state.initialStats.gdp * 0.5) {
    happiness -= 20 // Economy collapsed to half
  }

  // Extreme inflation is always bad
  if (state.inflationRate > 15) {
    happiness -= (state.inflationRate - 15) * 2
  }

  // Extreme unemployment is always bad
  if (state.unemploymentRate > 20) {
    happiness -= (state.unemploymentRate - 20) * 1.5
  }

  // INTEREST RATE EXTREMES HURT HAPPINESS
  if (state.interestRate > 7) {
    // High rates = expensive mortgages, car loans, credit cards
    happiness -= (state.interestRate - 7) * 3 // 10% rate = -9 happiness!
  } else if (state.interestRate < 1 && state.inflationRate > 5) {
    // Too low with high inflation = savings destroyed
    happiness -= 5
  }

  // War effect - always reduces happiness (MULTIPLE WARS EXPONENTIALLY WORSE!)
  const playerWars = state.activeWars.filter(war => war.isPlayerInvolved)
  if (playerWars.length > 0) {
    // First war: -10, Second war: -12, Third war: -14...
    playerWars.forEach((war, index) => {
      happiness -= 10 + (index * 2) // Exponentially more unpopular
    })
  }

  // Sanctions effect - always bad
  happiness -= state.sanctionsOnUs.length * 3

  // NEGLECTED SECTORS CAUSE MISERY! (ONLY IF BELOW STARTING LEVELS)
  // Health decline = disease, suffering
  const healthDecline = state.initialStats.sectorLevels.health - state.sectorLevels.health
  if (healthDecline > 0) {
    happiness -= healthDecline * 0.5 // Punishment for letting health decline
  } else if (state.sectorLevels.health > state.initialStats.sectorLevels.health + 30) {
    happiness += (state.sectorLevels.health - state.initialStats.sectorLevels.health - 30) * 0.1 // Small reward for major improvements
  }

  // Education decline = no opportunities
  const educationDecline = state.initialStats.sectorLevels.education - state.sectorLevels.education
  if (educationDecline > 0) {
    happiness -= educationDecline * 0.4
  } else if (state.sectorLevels.education > state.initialStats.sectorLevels.education + 30) {
    happiness += (state.sectorLevels.education - state.initialStats.sectorLevels.education - 30) * 0.1
  }

  // Housing decline = homelessness crisis
  const housingDecline = state.initialStats.sectorLevels.housing - state.sectorLevels.housing
  if (housingDecline > 0) {
    happiness -= housingDecline * 0.6
  } else if (state.sectorLevels.housing > state.initialStats.sectorLevels.housing + 30) {
    happiness += (state.sectorLevels.housing - state.initialStats.sectorLevels.housing - 30) * 0.15
  }

  // Security decline = crime waves
  const securityDecline = state.initialStats.sectorLevels.security - state.sectorLevels.security
  if (securityDecline > 0) {
    happiness -= securityDecline * 0.5
  }

  // Infrastructure decline = power outages, no water, etc.
  const infrastructureDecline = state.initialStats.sectorLevels.infrastructure - state.sectorLevels.infrastructure
  if (infrastructureDecline > 0) {
    happiness -= infrastructureDecline * 0.6
  }

  // Default effect - economic disaster
  if (state.hasDefaulted) {
    happiness -= 25
  }

  // Relationship system: Diplomatic standing affects citizen happiness
  const relationshipHappiness = calculateRelationshipHappiness(state)
  happiness += relationshipHappiness

  // NATURAL DECAY - happiness slowly decays if you're not actively improving
  // This makes the game challenging - you must constantly work to keep people happy
  const decayRate = state.country.difficulty === 'easy' ? 0.02 :
                    state.country.difficulty === 'medium' ? 0.05 : 0.08
  happiness -= decayRate

  // Keep between 0 and 100
  happiness = Math.max(0, Math.min(100, happiness))

  return Number(happiness.toFixed(1))
}

// Calculate score change per tick
export function calculateScoreChange(state: GameState, previousState: GameState): number {
  let scoreChange = 0

  // GDP growth effect
  scoreChange += state.gdpGrowthRate * 10

  // Debt-to-GDP improvement/worsening
  const debtChange = previousState.debtToGdpRatio - state.debtToGdpRatio
  scoreChange += debtChange * 100

  // Happiness change
  const happinessChange = state.happiness - previousState.happiness
  scoreChange += happinessChange * 5

  // Inflation penalty (high inflation is bad)
  if (state.inflationRate > 5) {
    scoreChange -= (state.inflationRate - 5) * 2
  }

  // Alliance/enemy changes
  const newAllies = state.allies.length - previousState.allies.length
  const newEnemies = state.enemies.length - previousState.enemies.length
  scoreChange += newAllies * 20
  scoreChange -= newEnemies * 20

  // War results will add/subtract large amounts

  // Default penalty
  if (state.hasDefaulted && !previousState.hasDefaulted) {
    scoreChange -= 500
  }

  return Number(scoreChange.toFixed(1))
}

// Calculate loan monthly payment
export function calculateLoanPayment(amount: number, annualInterestRate: number): number {
  // Simplified: amount * interest rate / 12 + principal / (10 years * 12 months)
  const monthlyInterest = (amount * (annualInterestRate / 100)) / 12
  const monthlyPrincipal = amount / (10 * 12) // 10-year repayment
  return monthlyInterest + monthlyPrincipal
}

// Calculate war outcome probability
export function calculateWarOutcome(
  attackerStrength: number,
  defenderStrength: number,
  attackerAllies: number,
  defenderAllies: number
): { attackerWinProbability: number; defenderWinProbability: number } {
  const attackerTotal = attackerStrength + (attackerAllies * 10)
  const defenderTotal = defenderStrength + (defenderAllies * 10)

  const total = attackerTotal + defenderTotal
  const attackerWinProbability = attackerTotal / total
  const defenderWinProbability = defenderTotal / total

  return {
    attackerWinProbability: Number(attackerWinProbability.toFixed(2)),
    defenderWinProbability: Number(defenderWinProbability.toFixed(2)),
  }
}

// Calculate repress success chance
export function calculateRepressSuccessChance(militaryStrength: number, security: number): number {
  const chance = (militaryStrength * 0.4 + security * 0.6) / 100
  return Number(chance.toFixed(2))
}

// Sector type classification
const REVENUE_SECTORS = ['tourism', 'sports', 'transportation', 'housing'] as const
const LONGTERM_SECTORS = ['education', 'health'] as const
const INFRASTRUCTURE_SECTORS = ['infrastructure', 'agriculture'] as const
const SECURITY_SECTORS = ['military', 'security'] as const

// Calculate sector spending effect (DIFFERENTIATED BY SECTOR TYPE)
export function calculateSectorSpendingEffect(
  sector: keyof typeof sectorPotentials.usa,
  amount: number,
  countryId: string,
  currentLevel: number
): {
  levelIncrease: number
  happinessChange: number
  gdpGrowthBoost: number
  revenueBoost: number
  unemploymentReduction: number
  message: string
} {
  const potentials = sectorPotentials[countryId]
  if (!potentials) {
    return {
      levelIncrease: 0,
      happinessChange: -2,
      gdpGrowthBoost: 0,
      revenueBoost: 0,
      unemploymentReduction: 0,
      message: 'Invalid country'
    }
  }

  const potential = potentials[sector]
  const multiplier = getPotentialMultiplier(potential)

  let levelIncrease = (amount / 10) * multiplier
  let happinessChange = 0
  let gdpGrowthBoost = 0
  let revenueBoost = 0
  let unemploymentReduction = 0
  let message = ''

  // REVENUE SECTORS - Generate direct income (more expensive!)
  if (REVENUE_SECTORS.includes(sector as any)) {
    revenueBoost = amount * 0.02 * multiplier // 2% of investment returned as daily revenue
    happinessChange = multiplier > 1 ? 1 : 0
    gdpGrowthBoost = multiplier * 0.05
    message = multiplier > 1
      ? `${sector} investment generating revenue! Tourism/entertainment boost economy.`
      : `${sector} investment has limited potential in your country.`
  }
  // LONG-TERM SECTORS - Improve happiness, reduce unemployment
  else if (LONGTERM_SECTORS.includes(sector as any)) {
    happinessChange = multiplier * 3 // Strong happiness boost
    unemploymentReduction = multiplier * 0.5 // Reduces unemployment
    gdpGrowthBoost = multiplier * 0.03 // Small GDP boost
    message = multiplier > 1
      ? `Excellent ${sector} investment! Citizens happier and healthier, unemployment falling.`
      : `${sector} investment showing modest results.`
  }
  // INFRASTRUCTURE SECTORS - GDP growth focus
  else if (INFRASTRUCTURE_SECTORS.includes(sector as any)) {
    gdpGrowthBoost = multiplier * 0.15 // Strong GDP boost
    unemploymentReduction = multiplier * 0.3
    happinessChange = multiplier > 1 ? 2 : 1
    message = multiplier > 1
      ? `${sector} development accelerating economic growth!`
      : `${sector} development proceeding.`
  }
  // SECURITY SECTORS - Handled separately in gameActions
  else if (SECURITY_SECTORS.includes(sector as any)) {
    happinessChange = multiplier > 1 ? 1 : 0
    message = `${sector} capabilities strengthened.`
  }
  // Default
  else {
    happinessChange = multiplier > 1 ? 1 : 0
    gdpGrowthBoost = multiplier * 0.05
    message = `Invested in ${sector}.`
  }

  // Negative multiplier = waste of money
  if (multiplier < 0) {
    happinessChange = -3
    gdpGrowthBoost = 0
    revenueBoost = 0
    message = `Wasted money on ${sector}. Your country has no potential here!`
  }

  // Diminishing returns (if already high level)
  if (currentLevel > 50) {
    levelIncrease *= 0.5
    happinessChange *= 0.5
    gdpGrowthBoost *= 0.5
    revenueBoost *= 0.5
  }

  return {
    levelIncrease: Number(levelIncrease.toFixed(1)),
    happinessChange: Number(happinessChange.toFixed(1)),
    gdpGrowthBoost: Number(gdpGrowthBoost.toFixed(2)),
    revenueBoost: Number(revenueBoost.toFixed(2)),
    unemploymentReduction: Number(unemploymentReduction.toFixed(2)),
    message
  }
}
