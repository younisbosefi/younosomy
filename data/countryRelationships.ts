// Initial geopolitical relationships for each country
// Based on real-world alliances and historical tensions

export const initialRelationships: Record<string, { allies: string[], enemies: string[] }> = {
  // United States - NATO leader, Western alliances
  usa: {
    allies: ['uk', 'france', 'germany', 'japan', 'southkorea', 'canada'],
    enemies: ['russia', 'china', 'iran', 'northkorea']
  },

  // China - Rising power, Eastern bloc
  china: {
    allies: ['russia', 'iran', 'northkorea', 'pakistan'],
    enemies: ['usa', 'japan', 'india', 'southkorea']
  },

  // Russia - Former Soviet power
  russia: {
    allies: ['china', 'iran', 'northkorea'],
    enemies: ['usa', 'uk', 'france', 'germany', 'poland']
  },

  // India - Non-aligned but democratic
  india: {
    allies: ['usa', 'france', 'japan'],
    enemies: ['china', 'pakistan']
  },

  // United Kingdom - NATO, Commonwealth
  uk: {
    allies: ['usa', 'france', 'germany', 'canada', 'australia'],
    enemies: ['russia', 'iran']
  },

  // France - EU leader, NATO member
  france: {
    allies: ['uk', 'germany', 'usa', 'india'],
    enemies: ['russia']
  },

  // Germany - EU economic powerhouse
  germany: {
    allies: ['france', 'uk', 'usa', 'poland'],
    enemies: ['russia']
  },

  // Japan - US ally in Asia
  japan: {
    allies: ['usa', 'southkorea', 'india', 'australia'],
    enemies: ['china', 'northkorea', 'russia']
  },

  // Brazil - Regional leader, mostly neutral
  brazil: {
    allies: ['argentina', 'mexico'],
    enemies: []
  },

  // Mexico - Regional power, US neighbor
  mexico: {
    allies: ['usa', 'brazil'],
    enemies: []
  },

  // South Africa - Regional power, neutral
  southafrica: {
    allies: ['brazil', 'india'],
    enemies: []
  },

  // Somalia - Weak state, minimal relationships
  somalia: {
    allies: [],
    enemies: ['ethiopia', 'kenya']
  },

  // Additional countries (if you add more)
  canada: {
    allies: ['usa', 'uk', 'france'],
    enemies: ['russia']
  },

  australia: {
    allies: ['usa', 'uk', 'japan'],
    enemies: ['china']
  },

  southkorea: {
    allies: ['usa', 'japan'],
    enemies: ['northkorea', 'china']
  },

  northkorea: {
    allies: ['china', 'russia'],
    enemies: ['usa', 'southkorea', 'japan']
  },

  iran: {
    allies: ['russia', 'china'],
    enemies: ['usa', 'uk', 'israel']
  },

  pakistan: {
    allies: ['china'],
    enemies: ['india']
  },

  poland: {
    allies: ['usa', 'uk', 'germany', 'france'],
    enemies: ['russia']
  },

  argentina: {
    allies: ['brazil', 'chile'],
    enemies: ['uk'] // Falklands tension
  },

  ethiopia: {
    allies: ['usa'],
    enemies: ['somalia', 'eritrea']
  },

  kenya: {
    allies: ['usa', 'uk'],
    enemies: ['somalia']
  },

  israel: {
    allies: ['usa'],
    enemies: ['iran', 'syria', 'lebanon']
  }
}

// Helper function to get relationships for a country
export function getInitialRelationships(countryId: string): { allies: string[], enemies: string[] } {
  return initialRelationships[countryId] || { allies: [], enemies: [] }
}

// Helper to check if two countries are naturally allied
export function areNaturalAllies(country1: string, country2: string): boolean {
  const relationships = initialRelationships[country1]
  return relationships?.allies.includes(country2) || false
}

// Helper to check if two countries are natural enemies
export function areNaturalEnemies(country1: string, country2: string): boolean {
  const relationships = initialRelationships[country1]
  return relationships?.enemies.includes(country2) || false
}
