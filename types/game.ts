import { Country } from './country'

export type GameSpeed = 1 | 3
export type GameLength = 5 | 10 | 25

export interface GameState {
  // Country Info
  country: Country

  // Time Management
  currentDay: number
  totalDays: number
  gameLength: GameLength
  isPlaying: boolean
  gameSpeed: GameSpeed

  // Action Cooldowns (day when action becomes available again)
  cooldowns: {
    printMoney: number
    borrowIMF: number
    declareWar: number
    adjustTaxes: number
  }

  // Initial Stats (for relative happiness calculation)
  initialStats: {
    gdp: number
    happiness: number
    unemployment: number
    inflation: number
    security: number
    militaryStrength: number
  }

  // Core Economic Stats
  gdp: number // in billions
  gdpGrowthRate: number // percentage
  debt: number // in billions
  debtToGdpRatio: number // percentage
  inflationRate: number // percentage
  unemploymentRate: number // percentage
  interestRate: number // percentage

  // Treasury & Revenue
  treasury: number // in billions
  revenue: number // daily revenue in billions
  reserves: number // emergency fund in billions

  // Borrowed Money Tracking
  borrowedMoney: BorrowedLoan[]

  // Social & Military
  happiness: number // 0-100
  security: number // 0-100
  militaryStrength: number // 0-100
  globalReputation: number // 0-100

  // Score
  score: number
  previousScore: number

  // Relations
  allies: string[] // country IDs
  enemies: string[] // country IDs
  sanctionsOnUs: string[] // country IDs sanctioning us
  cumulativeAid: Record<string, number> // Track total aid sent to each country (in billions)

  // Sector Investments
  sectorLevels: SectorLevels

  // Special States
  isInWar: boolean
  activeWars: War[]
  uprisingProgress: number // 0-30 days of low happiness
  isUprising: boolean
  hasDefaulted: boolean

  // Warning Tracking (to prevent spam - only warn every 30 days)
  lastWarningDay: {
    debtRatio: number
    inflation: number
    unemployment: number
    lowHappiness: number
    highInterest: number
    lowTreasury: number
  }

  // Events
  events: GameEvent[]
}

export interface BorrowedLoan {
  id: string
  amount: number // original amount
  remaining: number // remaining to pay
  interestRate: number // annual interest rate
  monthlyPayment: number
  daysUntilNextPayment: number
  source: 'IMF' | string // country ID or IMF
}

export interface SectorLevels {
  health: number
  education: number
  military: number
  infrastructure: number
  housing: number
  agriculture: number
  transportation: number
  security: number // State Protection and Justice
  tourism: number
  sports: number
}

export type SectorPotential = 'very-low' | 'low' | 'mid' | 'high' | 'very-high'

export interface CountrySectorPotentials {
  health: SectorPotential
  education: SectorPotential
  military: SectorPotential
  infrastructure: SectorPotential
  housing: SectorPotential
  agriculture: SectorPotential
  transportation: SectorPotential
  security: SectorPotential
  tourism: SectorPotential
  sports: SectorPotential
}

export interface War {
  id: string
  attacker: string // country ID
  defender: string // country ID
  startDay: number
  duration: number // days until resolution (7-90)
  attackerStrength: number
  defenderStrength: number
  isPlayerInvolved: boolean
  isPlayerAttacker: boolean
}

export interface GameEvent {
  id: string
  day: number
  timestamp: Date
  type: 'world' | 'player' | 'critical' | 'advice'
  category: 'economic' | 'military' | 'diplomatic' | 'domestic' | 'system'
  message: string
  icon?: string
}

export type ActionType =
  | 'adjust-interest'
  | 'print-money'
  | 'adjust-taxes'
  | 'borrow-imf'
  | 'add-reserves'
  | 'spend-sector'
  | 'repress'
  | 'declare-war'
  | 'impose-sanction'
  | 'propose-alliance'
  | 'send-aid'
  | 'register-enemy'

export interface ActionResult {
  success: boolean
  message: string
  events: GameEvent[]
  stateChanges: Partial<GameState>
}

export interface GlobalEventBid {
  eventType: 'world-cup' | 'olympics'
  year: number
  bidAmount: number
  participants: { countryId: string; bidAmount: number }[]
}
