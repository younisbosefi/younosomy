export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Country {
  id: string
  name: string
  code: string
  flag: string
  difficulty: Difficulty
  stats: {
    gdp: number
    population: number
    stability: number
    happiness: number
  }
}
