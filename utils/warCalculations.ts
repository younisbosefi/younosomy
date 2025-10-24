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

  if (state.warredCountries.includes(targetCountryId)) {
    reasons.push(`You have already fought a war with ${target.name}! Cannot war the same country twice.`)
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

  if (state.cooldowns.declareWar > 0) {
    reasons.push(`Military on cooldown for ${Math.ceil(state.cooldowns.declareWar)} more days`)
  }

  const minMilitaryStrength = isEnemy ? 15 : 30
  const minSecurity = isEnemy ? 15 : 25
  const minMilitaryLevel = isEnemy ? 10 : 20

  const warCostPercent = isEnemy ? 0.02 : 0.08
  const warCost = state.gdp * warCostPercent
  const happinessCost = isEnemy ? 3 : 10

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

  let playerPower = state.militaryStrength * 2 + state.sectorLevels.military + (state.gdp / 1000)

  state.allies.forEach(allyId => {
    const ally = countries.find(c => c.id === allyId)
    if (ally) {
      const allyPower = ally.stats.stability * 0.8 + (ally.stats.gdp / 1000)
      playerPower += allyPower * 0.5
    }
  })

  let enemyPower = target.stats.stability * 2 + (target.stats.gdp / 1000)

  const { getInitialRelationships } = require('@/data/countryRelationships')
  const targetRelationships = getInitialRelationships(targetCountryId)

  targetRelationships.allies.forEach((allyId: string) => {
    const ally = countries.find(c => c.id === allyId)
    if (ally) {
      const allyPower = ally.stats.stability * 0.8 + (ally.stats.gdp / 1000)
      enemyPower += allyPower * 0.5
    }
  })

  const powerRatio = playerPower / (playerPower + enemyPower)
  const winProbability = Math.max(10, Math.min(90, powerRatio * 100))

  return { playerPower, enemyPower, winProbability }
}
