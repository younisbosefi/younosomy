import { GameState } from '@/types/game'
import { countries } from '@/data/countries'

// Relationship levels based on score (0-100)
export type RelationshipLevel = 'Hostile' | 'Cold' | 'Neutral' | 'Friendly' | 'Allied'

export function getRelationshipLevel(score: number): RelationshipLevel {
  if (score >= 86) return 'Allied'
  if (score >= 71) return 'Friendly'
  if (score >= 51) return 'Neutral'
  if (score >= 31) return 'Cold'
  return 'Hostile'
}

export function getRelationshipColor(score: number): string {
  if (score >= 86) return 'text-green-400'
  if (score >= 71) return 'text-blue-400'
  if (score >= 51) return 'text-gray-400'
  if (score >= 31) return 'text-orange-400'
  return 'text-red-400'
}

// Derive allies/enemies from relationship scores
export function deriveAlliesAndEnemies(relationships: Record<string, number>): {
  allies: string[]
  enemies: string[]
} {
  const allies: string[] = []
  const enemies: string[] = []

  Object.entries(relationships).forEach(([countryId, score]) => {
    if (score >= 86) allies.push(countryId)
    else if (score <= 30) enemies.push(countryId)
  })

  return { allies, enemies }
}

// Initialize relationships for a new game (based on existing alliances/enemies)
export function initializeRelationships(countryId: string, allies: string[], enemies: string[]): Record<string, number> {
  const relationships: Record<string, number> = {}

  countries.forEach(country => {
    if (country.id === countryId) return // Skip self

    if (allies.includes(country.id)) {
      relationships[country.id] = 90 // Start as allied
    } else if (enemies.includes(country.id)) {
      relationships[country.id] = 20 // Start as hostile
    } else {
      relationships[country.id] = 60 // Start as neutral
    }
  })

  return relationships
}

// Calculate tourism boost from relationships (friendly nations = more tourists)
export function calculateTourismBoost(state: GameState): number {
  let tourismBoost = 0

  Object.entries(state.relationships).forEach(([countryId, score]) => {
    const country = countries.find(c => c.id === countryId)
    if (!country) return

    // Friendly/allied nations send tourists
    if (score >= 71) {
      const countryGDP = country.stats.gdp
      // Larger, friendlier countries = more tourism
      tourismBoost += (score - 70) * (countryGDP / 1000) * 0.001
    }
  })

  return tourismBoost
}

// Calculate trade boost from relationships (friendly nations = better trade)
export function calculateTradeBoost(state: GameState): number {
  let tradeBoost = 0

  Object.entries(state.relationships).forEach(([countryId, score]) => {
    // Friendly/allied nations = trade benefits
    if (score >= 71) {
      tradeBoost += (score - 70) * 0.0005 // Max +0.015% GDP per friendly nation
    }
    // Hostile nations = trade penalties
    else if (score <= 30) {
      tradeBoost -= (30 - score) * 0.0008 // Max -0.024% GDP per hostile nation
    }
  })

  return tradeBoost
}

// Calculate happiness from relationships (people like when you're friendly with others)
export function calculateRelationshipHappiness(state: GameState): number {
  let happiness = 0

  const alliedCount = Object.values(state.relationships).filter(s => s >= 86).length
  const friendlyCount = Object.values(state.relationships).filter(s => s >= 71 && s < 86).length
  const hostileCount = Object.values(state.relationships).filter(s => s <= 30).length

  // Citizens like having allies
  happiness += alliedCount * 2 // +2 per ally
  happiness += friendlyCount * 0.5 // +0.5 per friendly nation

  // Citizens dislike hostility
  happiness -= hostileCount * 1.5 // -1.5 per hostile nation

  // Isolated country (no allies) = unhappy
  if (alliedCount === 0 && friendlyCount === 0) {
    happiness -= 5
  }

  return happiness
}

// Change relationship score (with boundaries)
export function changeRelationship(
  relationships: Record<string, number>,
  countryId: string,
  change: number
): Record<string, number> {
  const newRelationships = { ...relationships }
  const currentScore = newRelationships[countryId] || 60

  newRelationships[countryId] = Math.max(0, Math.min(100, currentScore + change))

  return newRelationships
}

// Get consequences of provoking an ally/friend
export function getProvocationConsequences(relationshipScore: number, state: GameState): {
  happinessLoss: number
  tourismLoss: number
  reputationLoss: number
  message: string
} {
  const level = getRelationshipLevel(relationshipScore)

  if (level === 'Allied') {
    return {
      happinessLoss: 15,
      tourismLoss: state.sectorLevels.tourism * 0.20, // -20% tourism
      reputationLoss: 25,
      message: 'Your people are OUTRAGED! You attacked an ally! Tourism collapses, international condemnation!'
    }
  } else if (level === 'Friendly') {
    return {
      happinessLoss: 10,
      tourismLoss: state.sectorLevels.tourism * 0.12, // -12% tourism
      reputationLoss: 15,
      message: 'Your people are upset! You attacked a friend! Tourism damaged, reputation suffers!'
    }
  } else if (level === 'Neutral') {
    return {
      happinessLoss: 3,
      tourismLoss: state.sectorLevels.tourism * 0.05, // -5% tourism
      reputationLoss: 5,
      message: 'Unprovoked aggression! Minor international backlash.'
    }
  }

  return {
    happinessLoss: 0,
    tourismLoss: 0,
    reputationLoss: 0,
    message: 'Hostile nations expect conflict.'
  }
}

// Get description for relationship score
export function getRelationshipDescription(score: number): string {
  const level = getRelationshipLevel(score)

  switch (level) {
    case 'Allied':
      return 'Strong alliance - mutual defense pact, free trade, cultural exchange'
    case 'Friendly':
      return 'Friendly relations - trade benefits, tourism boost, cooperation'
    case 'Neutral':
      return 'Neutral - basic diplomatic relations, limited interaction'
    case 'Cold':
      return 'Cold relations - trade restrictions, limited cooperation'
    case 'Hostile':
      return 'Hostile - sanctions possible, war risk, trade penalties'
  }
}
