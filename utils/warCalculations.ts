import { GameState } from '@/types/game'
import { countries } from '@/data/countries'

export interface WarValidation {
  canDeclareWar: boolean
  reasons: string[]
  warCost: number
  happinessCost: number
  winProbability: number
  playerPower: number
  enemyPower: number
}

export function validateWarDeclaration(
  state: GameState,
  targetCountryId: string
): WarValidation {
  const target = countries.find(c => c.id === targetCountryId)
  const reasons: string[] = []

  if (!target) {
    return {
      canDeclareWar: false,
      reasons: ['Invalid target country'],
      warCost: 0,
      happinessCost: 0,
      winProbability: 0,
      playerPower: 0,
      enemyPower: 0
    }
  }

  const isEnemy = state.enemies.includes(targetCountryId)
  const isAlly = state.allies.includes(targetCountryId)
  const isNeutral = !isEnemy && !isAlly

  // RELATIONSHIP CHECKS
  if (isAlly) {
    reasons.push(`Cannot declare war on ally ${target.name}! Impose sanctions first to make them an enemy.`)
    return {
      canDeclareWar: false,
      reasons,
      warCost: 0,
      happinessCost: 0,
      winProbability: 0,
      playerPower: 0,
      enemyPower: 0
    }
  }

  // COOLDOWN CHECK
  if (state.cooldowns.declareWar > 0) {
    reasons.push(`Military on cooldown for ${Math.ceil(state.cooldowns.declareWar)} more days`)
  }

  // EASIER REQUIREMENTS FOR ENEMIES, STRICTER FOR NEUTRALS
  const minMilitaryStrength = isEnemy ? 25 : 40
  const minSecurity = isEnemy ? 20 : 35
  const minMilitaryLevel = isEnemy ? 15 : 30

  // COST BASED ON RELATIONSHIP
  const warCostPercent = isEnemy ? 0.05 : 0.20 // 5% for enemies, 20% for neutrals!
  const warCost = state.gdp * warCostPercent
  const happinessCost = isEnemy ? 3 : 15 // Much bigger happiness hit for attacking neutrals

  // REQUIREMENTS CHECKS
  if (state.militaryStrength < minMilitaryStrength) {
    reasons.push(`Military strength too low: ${state.militaryStrength.toFixed(0)}% (need ${minMilitaryStrength}%)`)
  }

  if (state.security < minSecurity) {
    reasons.push(`Domestic security too low: ${state.security.toFixed(0)}% (need ${minSecurity}%)`)
  }

  if (state.sectorLevels.military < minMilitaryLevel) {
    reasons.push(`Military infrastructure insufficient: Level ${state.sectorLevels.military.toFixed(0)} (need Level ${minMilitaryLevel})`)
  }

  if (state.treasury < warCost) {
    reasons.push(`Insufficient treasury: $${state.treasury.toFixed(2)}B (need ${(warCostPercent * 100).toFixed(0)}% of GDP: $${warCost.toFixed(2)}B)`)
  }

  // CALCULATE WAR POWER INCLUDING ALLIES
  const { playerPower, enemyPower, winProbability } = calculateWarOutcome(state, targetCountryId)

  const canDeclareWar = reasons.length === 0

  return {
    canDeclareWar,
    reasons,
    warCost,
    happinessCost,
    winProbability,
    playerPower,
    enemyPower
  }
}

export function calculateWarOutcome(
  state: GameState,
  targetCountryId: string
): { playerPower: number; enemyPower: number; winProbability: number } {
  const target = countries.find(c => c.id === targetCountryId)
  if (!target) {
    return { playerPower: 0, enemyPower: 0, winProbability: 0 }
  }

  // PLAYER POWER = military strength + military level + GDP factor
  let playerPower = state.militaryStrength * 2 + state.sectorLevels.military + (state.gdp / 1000)

  // ADD ALLY STRENGTH (50% of each ally's military power)
  state.allies.forEach(allyId => {
    const ally = countries.find(c => c.id === allyId)
    if (ally) {
      const allyPower = ally.stats.stability * 0.8 + (ally.stats.gdp / 1000)
      playerPower += allyPower * 0.5 // Allies contribute 50% of their power
    }
  })

  // ENEMY POWER = stability + GDP factor
  let enemyPower = target.stats.stability * 2 + (target.stats.gdp / 1000)

  // ADD ENEMY'S ALLY STRENGTH
  // We need to check which countries are allies of the target
  // For now, we'll check the initial relationships
  const { getInitialRelationships } = require('@/data/countryRelationships')
  const targetRelationships = getInitialRelationships(targetCountryId)

  targetRelationships.allies.forEach((allyId: string) => {
    const ally = countries.find(c => c.id === allyId)
    if (ally) {
      const allyPower = ally.stats.stability * 0.8 + (ally.stats.gdp / 1000)
      enemyPower += allyPower * 0.5 // Enemy allies contribute 50% of their power
    }
  })

  // CALCULATE WIN PROBABILITY (capped between 10% and 90%)
  const powerRatio = playerPower / (playerPower + enemyPower)
  const winProbability = Math.max(10, Math.min(90, powerRatio * 100))

  return { playerPower, enemyPower, winProbability }
}
