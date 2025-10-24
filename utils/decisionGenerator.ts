import { GameState, Decision, War } from '@/types/game'
import { countries } from '@/data/countries'

// Helper to create a War object with proper typing
function createWar(state: GameState, enemyCountryId: string, isPlayerAttacker: boolean = false): War {
  return {
    id: `war-${state.currentDay}-${enemyCountryId}`,
    attacker: isPlayerAttacker ? state.country.id : enemyCountryId,
    defender: isPlayerAttacker ? enemyCountryId : state.country.id,
    startDay: state.currentDay,
    duration: 180,
    attackerStrength: isPlayerAttacker ? state.militaryStrength : 50,
    defenderStrength: isPlayerAttacker ? 50 : state.militaryStrength,
    isPlayerInvolved: true,
    isPlayerAttacker
  }
}

// Generate random presidential decisions based on game state
export function generateRandomDecisions(state: GameState): Decision[] {
  const decisions: Decision[] = []

  // Only generate decisions randomly (low chance each day)
  if (Math.random() > 0.05) return decisions // 5% chance per day

  // Pool of possible decisions based on game state
  const possibleDecisions: (() => Decision | null)[] = [
    () => generateEnemyWarDeclaration(state),
    () => generateAIBreakthrough(state),
    () => generateAssassinationPlot(state),
    () => generateDebtCrisisUltimatum(state),
    () => generateNaturalDisaster(state),
    () => generateTradeDealOffer(state),
    () => generateRefugeeCrisis(state),
    () => generateCorruptionScandal(state),
    () => generateEconomicBoomOpportunity(state),
    () => generateMilitaryCoupAttempt(state),
    () => generateBorderDispute(state),
    () => generateEthnicConflict(state),
    () => generateBrainDrain(state),
    () => generateInfrastructureFailure(state),
  ]

  // Pick one random decision that matches current conditions
  const shuffled = possibleDecisions.sort(() => Math.random() - 0.5)
  for (const generator of shuffled) {
    const decision = generator()
    if (decision) {
      decisions.push(decision)
      break // Only one decision at a time
    }
  }

  return decisions
}

// 1. ENEMY DECLARES WAR (Low reputation, weak stats)
function generateEnemyWarDeclaration(state: GameState): Decision | null {
  if (state.enemies.length === 0) return null
  if (state.globalReputation > 40) return null
  if (state.militaryStrength > state.initialStats.militaryStrength) return null
  if (Math.random() > 0.3) return null // 30% chance if conditions met

  const enemy = countries.find(c => state.enemies.includes(c.id))
  if (!enemy) return null

  const warCost = state.treasury * 0.20

  return {
    id: `enemy-war-${Date.now()}`,
    title: `🚨 ${enemy.name} DECLARES WAR!`,
    description: `${enemy.name} has declared war on ${state.country.name}! Your reputation is low (${state.globalReputation.toFixed(0)}) and they see you as weak. How do you respond?`,
    icon: '⚔️',
    urgency: 'critical',
    choices: [
      {
        label: 'Fight Back',
        description: 'Declare war and defend your nation',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: `You declared war on ${enemy.name} in self-defense!`,
            activeWars: [...state.activeWars, createWar(state, enemy.id, true)],
            isInWar: true,
            warredCountries: [...state.warredCountries, enemy.id],
            treasury: state.treasury - (warCost * 0.5), // Half cost for defensive war
            happiness: state.happiness - 5
          }
        }
      },
      {
        label: `Pay ${warCost.toFixed(1)}B to Make Deal`,
        description: 'Pay tribute to avoid war',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: `You paid ${warCost.toFixed(1)}B to ${enemy.name} to avoid war. Your people see this as weakness.`,
            treasury: state.treasury - warCost,
            happiness: state.happiness - 12,
            globalReputation: state.globalReputation - 15
          }
        }
      },
      {
        label: 'Diplomatic Approach',
        description: '60% chance of success - negotiate peace',
        outcomes: {
          success: 0.6,
          successEffect: {
            message: `Diplomatic success! You negotiated peace with ${enemy.name}. Reputation improved!`,
            globalReputation: state.globalReputation + 10,
            happiness: state.happiness + 5
          },
          failureEffect: {
            message: `Diplomacy failed! ${enemy.name} attacks anyway!`,
            activeWars: [...state.activeWars, createWar(state, enemy.id, false)],
            isInWar: true,
            warredCountries: [...state.warredCountries, enemy.id],
            treasury: state.treasury - warCost, // Full cost, caught off guard
            happiness: state.happiness - 8,
            globalReputation: state.globalReputation - 10
          }
        }
      },
      {
        label: 'Ignore',
        description: '40% chance they back down',
        outcomes: {
          success: 0.4,
          successEffect: {
            message: `${enemy.name} was bluffing! They backed down. But your weakness is noted.`,
            globalReputation: state.globalReputation - 5
          },
          failureEffect: {
            message: `${enemy.name} attacks! You're caught completely unprepared!`,
            activeWars: [...state.activeWars, createWar(state, enemy.id, false)],
            isInWar: true,
            warredCountries: [...state.warredCountries, enemy.id],
            militaryStrength: state.militaryStrength - 20,
            treasury: state.treasury - warCost,
            happiness: state.happiness - 15,
            gdp: state.gdp * 0.90 // -10% GDP from surprise attack
          }
        }
      }
    ]
  }
}

// 2. AI BREAKTHROUGH
function generateAIBreakthrough(state: GameState): Decision | null {
  if (state.sectorLevels.education < 40) return null // Need decent education
  if (Math.random() > 0.4) return null

  const supportCost = state.treasury * 0.10

  return {
    id: `ai-breakthrough-${Date.now()}`,
    title: '🤖 AI TECHNOLOGY BREAKTHROUGH!',
    description: 'Your scientists have made a major breakthrough in artificial intelligence! This could revolutionize your economy, but there are concerns about job losses and ethics.',
    icon: '🤖',
    urgency: 'medium',
    choices: [
      {
        label: `Support Research (${supportCost.toFixed(1)}B)`,
        description: 'Fund AI development - boost GDP but increase unemployment',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'AI research funded! Your economy is modernizing rapidly, but some workers are displaced.',
            treasury: state.treasury - supportCost,
            gdp: state.gdp * 1.15, // +15% GDP!
            unemploymentRate: state.unemploymentRate + 3,
            happiness: state.happiness + 5,
            sectorLevels: { ...state.sectorLevels, education: state.sectorLevels.education + 10 }
          }
        }
      },
      {
        label: 'Ban AI Development',
        description: 'Stop research - protect jobs but fall behind',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'AI development banned. Workers protected, but your country falls behind technologically.',
            happiness: state.happiness + 3,
            gdpGrowthRate: state.gdpGrowthRate - 0.5, // Long-term growth penalty
            globalReputation: state.globalReputation - 5
          }
        }
      },
      {
        label: 'Regulate Carefully',
        description: 'Balanced approach - moderate both benefits and risks',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'AI regulations implemented. Balanced growth with worker protections.',
            gdp: state.gdp * 1.07, // +7% GDP (moderate)
            unemploymentRate: state.unemploymentRate + 1,
            happiness: state.happiness + 2
          }
        }
      }
    ]
  }
}

// 3. ASSASSINATION PLOT
function generateAssassinationPlot(state: GameState): Decision | null {
  if (state.sectorLevels.security > 50) return null // High security prevents this
  if (state.happiness > 60) return null // Happy citizens don't plot
  if (Math.random() > 0.35) return null

  const investigationCost = state.treasury * 0.10

  return {
    id: `assassination-plot-${Date.now()}`,
    title: '💀 ASSASSINATION PLOT DISCOVERED!',
    description: 'Your intelligence services have uncovered a plot against your life! Low security and unhappy citizens have emboldened conspirators. Act quickly!',
    icon: '💀',
    urgency: 'critical',
    choices: [
      {
        label: 'Ignore',
        description: '20% risk of GAME OVER!',
        outcomes: {
          success: 0.80,
          successEffect: {
            message: 'False alarm! The plot was exaggerated. But your security is still weak.',
            happiness: state.happiness - 2
          },
          failureEffect: {
            message: 'YOU HAVE BEEN ASSASSINATED! Game Over.',
            happiness: 0 // Triggers game over
          }
        }
      },
      {
        label: `Launch Investigation (${investigationCost.toFixed(1)}B)`,
        description: 'Find and stop the conspirators',
        outcomes: {
          success: 0.85,
          successEffect: {
            message: 'Conspirators arrested! Security improved, but some innocent people were caught in the dragnet.',
            treasury: state.treasury - investigationCost,
            sectorLevels: { ...state.sectorLevels, security: state.sectorLevels.security + 15 },
            happiness: state.happiness - 3
          },
          failureEffect: {
            message: 'Investigation failed! Conspirators remain at large.',
            treasury: state.treasury - investigationCost,
            happiness: state.happiness - 8,
            sectorLevels: { ...state.sectorLevels, security: state.sectorLevels.security - 5 }
          }
        }
      },
      {
        label: 'Increase Security',
        description: 'Boost security spending permanently',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Security forces strengthened! Plot thwarted. Citizens feel safer.',
            sectorLevels: { ...state.sectorLevels, security: state.sectorLevels.security + 20 },
            happiness: state.happiness + 5,
            treasury: state.treasury - (investigationCost * 1.5)
          }
        }
      }
    ]
  }
}

// 4. DEBT CRISIS ULTIMATUM
function generateDebtCrisisUltimatum(state: GameState): Decision | null {
  if (state.debtToGdpRatio < 120) return null // Only when debt is very high
  if (Math.random() > 0.4) return null

  const fineCost = state.gdp * 0.30 // 30% fine!

  return {
    id: `debt-crisis-${Date.now()}`,
    title: '🏦 DEBT CRISIS ULTIMATUM!',
    description: `Your debt-to-GDP ratio is ${state.debtToGdpRatio.toFixed(0)}%! International creditors are threatening action. You must make a difficult choice.`,
    icon: '🏦',
    urgency: 'critical',
    choices: [
      {
        label: 'Raise Taxes',
        description: 'Increase revenue but risk civil unrest',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Taxes raised! Revenue increased but citizens are FURIOUS. Mass protests.',
            revenue: state.revenue * 1.5,
            happiness: state.happiness - 20,
            unemploymentRate: state.unemploymentRate + 4
          }
        }
      },
      {
        label: 'Ignore Creditors',
        description: `30% chance of ${fineCost.toFixed(0)}B fine`,
        outcomes: {
          success: 0.70,
          successEffect: {
            message: 'Creditors backed down! You called their bluff. But reputation damaged.',
            globalReputation: state.globalReputation - 20
          },
          failureEffect: {
            message: `Creditors imposed massive ${fineCost.toFixed(0)}B sanctions! Economic disaster!`,
            treasury: state.treasury - fineCost,
            gdp: state.gdp * 0.85, // -15% GDP
            globalReputation: state.globalReputation - 30,
            hasDefaulted: true
          }
        }
      },
      {
        label: 'Emergency Austerity',
        description: 'Cut all spending to pay debt',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Austerity measures implemented. Debt reduced but all sectors suffer.',
            debt: state.debt * 0.70, // -30% debt
            happiness: state.happiness - 15,
            sectorLevels: {
              ...state.sectorLevels,
              health: state.sectorLevels.health - 10,
              education: state.sectorLevels.education - 10,
              infrastructure: state.sectorLevels.infrastructure - 10
            }
          }
        }
      }
    ]
  }
}

// 5. NATURAL DISASTER
function generateNaturalDisaster(state: GameState): Decision | null {
  if (Math.random() > 0.3) return null

  const reliefCost = state.gdp * 0.05
  const fullReliefCost = state.gdp * 0.12

  return {
    id: `natural-disaster-${Date.now()}`,
    title: '🌪️ NATURAL DISASTER STRIKES!',
    description: 'A devastating earthquake/hurricane has hit your nation! Thousands are displaced. Infrastructure damaged. Your response will define your leadership.',
    icon: '🌪️',
    urgency: 'high',
    choices: [
      {
        label: `Full Relief (${fullReliefCost.toFixed(1)}B)`,
        description: 'Comprehensive aid - expensive but saves many lives',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Full relief deployed! Lives saved, infrastructure quickly rebuilt. People grateful.',
            treasury: state.treasury - fullReliefCost,
            happiness: state.happiness + 15,
            sectorLevels: { ...state.sectorLevels, infrastructure: state.sectorLevels.infrastructure - 5 } // Minimal damage
          }
        }
      },
      {
        label: `Minimal Relief (${reliefCost.toFixed(1)}B)`,
        description: 'Basic aid only - many suffer',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Minimal relief provided. Many people left to rebuild on their own. Resentment grows.',
            treasury: state.treasury - reliefCost,
            happiness: state.happiness - 10,
            sectorLevels: { ...state.sectorLevels, infrastructure: state.sectorLevels.infrastructure - 15 }
          }
        }
      },
      {
        label: 'Request International Aid',
        description: '70% chance of receiving help',
        outcomes: {
          success: 0.70,
          successEffect: {
            message: 'International community sends aid! Your reputation improves.',
            happiness: state.happiness + 8,
            globalReputation: state.globalReputation + 10,
            sectorLevels: { ...state.sectorLevels, infrastructure: state.sectorLevels.infrastructure - 8 }
          },
          failureEffect: {
            message: 'No help arrived! You look weak on the world stage.',
            happiness: state.happiness - 15,
            globalReputation: state.globalReputation - 15,
            sectorLevels: { ...state.sectorLevels, infrastructure: state.sectorLevels.infrastructure - 20 }
          }
        }
      }
    ]
  }
}

// 6. TRADE DEAL OFFER
function generateTradeDealOffer(state: GameState): Decision | null {
  if (state.allies.length === 0) return null
  if (Math.random() > 0.4) return null

  const ally = countries.find(c => state.allies.includes(c.id))
  if (!ally) return null

  return {
    id: `trade-deal-${Date.now()}`,
    title: `📦 ${ally.name} TRADE DEAL OFFER`,
    description: `${ally.name} proposes a major trade agreement! This could boost your economy significantly but may hurt some domestic industries.`,
    icon: '📦',
    urgency: 'medium',
    choices: [
      {
        label: 'Accept Deal',
        description: '+12% GDP but +2% unemployment',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: `Trade deal with ${ally.name} signed! Economy booming but some domestic jobs lost.`,
            gdp: state.gdp * 1.12,
            unemploymentRate: state.unemploymentRate + 2,
            globalReputation: state.globalReputation + 8
          }
        }
      },
      {
        label: 'Reject Deal',
        description: 'Protect domestic industry',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Deal rejected. Domestic industries protected but growth opportunity missed.',
            happiness: state.happiness + 3,
            gdpGrowthRate: state.gdpGrowthRate - 0.3
          }
        }
      },
      {
        label: 'Negotiate Better Terms',
        description: '50% success - better deal or nothing',
        outcomes: {
          success: 0.50,
          successEffect: {
            message: 'Negotiation success! Better deal secured with minimal job losses!',
            gdp: state.gdp * 1.15,
            unemploymentRate: state.unemploymentRate + 0.5,
            globalReputation: state.globalReputation + 12
          },
          failureEffect: {
            message: `${ally.name} walked away! Deal canceled. They're insulted.`,
            globalReputation: state.globalReputation - 10,
            // Remove from allies
            allies: state.allies.filter(a => a !== ally.id)
          }
        }
      }
    ]
  }
}

// 7. REFUGEE CRISIS
function generateRefugeeCrisis(state: GameState): Decision | null {
  if (Math.random() > 0.3) return null

  const aidCost = state.gdp * 0.08

  return {
    id: `refugee-crisis-${Date.now()}`,
    title: '🚢 REFUGEE CRISIS AT BORDER',
    description: '100,000 refugees fleeing war/famine are at your border seeking asylum. Your decision will have major economic and moral consequences.',
    icon: '🚢',
    urgency: 'high',
    choices: [
      {
        label: `Accept Refugees (${aidCost.toFixed(1)}B)`,
        description: 'Provide asylum - expensive but moral',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Refugees welcomed! Global praise but short-term costs. Long-term workforce boost.',
            treasury: state.treasury - aidCost,
            globalReputation: state.globalReputation + 20,
            happiness: state.happiness - 5, // Some citizens unhappy
            unemploymentRate: state.unemploymentRate + 1.5,
            gdpGrowthRate: state.gdpGrowthRate + 0.4 // Long-term boost
          }
        }
      },
      {
        label: 'Close Borders',
        description: 'Refuse entry - protect resources',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Borders closed. Refugees turned away. International condemnation but domestic support.',
            globalReputation: state.globalReputation - 25,
            happiness: state.happiness + 8 // Nationalist citizens happy
          }
        }
      },
      {
        label: 'Limited Asylum',
        description: 'Accept 20,000 most vulnerable',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Selective asylum granted. Compromise solution but criticized by both sides.',
            treasury: state.treasury - (aidCost * 0.25),
            globalReputation: state.globalReputation - 5,
            unemploymentRate: state.unemploymentRate + 0.3
          }
        }
      }
    ]
  }
}

// 8. CORRUPTION SCANDAL
function generateCorruptionScandal(state: GameState): Decision | null {
  if (state.sectorLevels.security > 60) return null // High security prevents corruption
  if (Math.random() > 0.35) return null

  return {
    id: `corruption-scandal-${Date.now()}`,
    title: '💼 MAJOR CORRUPTION SCANDAL!',
    description: 'Evidence emerges that senior officials have been embezzling millions! The public demands action. Your response will define your integrity.',
    icon: '💼',
    urgency: 'high',
    choices: [
      {
        label: 'Full Investigation',
        description: 'Prosecute everyone - lose some allies',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Corruption purge complete! Public trust restored but powerful people now hate you.',
            happiness: state.happiness + 12,
            globalReputation: state.globalReputation + 15,
            treasury: state.treasury + (state.gdp * 0.05), // Recovered embezzled funds
            sectorLevels: { ...state.sectorLevels, security: state.sectorLevels.security + 10 }
          }
        }
      },
      {
        label: 'Cover It Up',
        description: '60% chance of success',
        outcomes: {
          success: 0.60,
          successEffect: {
            message: 'Scandal buried. You maintain powerful allies but your soul is tarnished.',
            globalReputation: state.globalReputation - 5
          },
          failureEffect: {
            message: 'Cover-up EXPOSED! Massive scandal! People demand your resignation!',
            happiness: state.happiness - 30,
            globalReputation: state.globalReputation - 40
          }
        }
      },
      {
        label: 'Scapegoat Low-Level Officials',
        description: 'Blame underlings, protect the powerful',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Low-level officials prosecuted. Corruption continues but public satisfied for now.',
            happiness: state.happiness + 3,
            treasury: state.treasury + (state.gdp * 0.01) // Small recovery
          }
        }
      }
    ]
  }
}

// 9. ECONOMIC BOOM OPPORTUNITY
function generateEconomicBoomOpportunity(state: GameState): Decision | null {
  if (state.gdpGrowthRate < 2) return null // Need decent growth
  if (Math.random() > 0.35) return null

  const investmentCost = state.treasury * 0.25

  return {
    id: `economic-boom-${Date.now()}`,
    title: '📈 ONCE-IN-A-LIFETIME INVESTMENT!',
    description: 'A rare opportunity to invest in a booming sector! Tech giants want to build facilities in your country. Large upfront cost but massive long-term gains.',
    icon: '📈',
    urgency: 'medium',
    choices: [
      {
        label: `Invest Big (${investmentCost.toFixed(1)}B)`,
        description: 'All-in - huge risk, huge reward',
        outcomes: {
          success: 0.75,
          successEffect: {
            message: 'JACKPOT! Investment pays off massively! Your economy is booming!',
            treasury: state.treasury - investmentCost,
            gdp: state.gdp * 1.30, // +30% GDP!
            gdpGrowthRate: state.gdpGrowthRate + 1.5,
            unemploymentRate: Math.max(1, state.unemploymentRate - 5),
            happiness: state.happiness + 15
          },
          failureEffect: {
            message: 'Investment FAILED! Companies pulled out. Massive losses.',
            treasury: state.treasury - investmentCost,
            happiness: state.happiness - 12,
            globalReputation: state.globalReputation - 10
          }
        }
      },
      {
        label: 'Pass',
        description: 'Too risky - stay safe',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Opportunity passed. Later you learn it would have made you rich. Regret lingers.',
            happiness: state.happiness - 5
          }
        }
      }
    ]
  }
}

// 10. MILITARY COUP ATTEMPT
function generateMilitaryCoupAttempt(state: GameState): Decision | null {
  if (state.militaryStrength > 60) return null // Strong military won't coup
  if (state.happiness > 50) return null // Happy citizens prevent coups
  if (Math.random() > 0.25) return null

  return {
    id: `military-coup-${Date.now()}`,
    title: '⚔️ MILITARY COUP ATTEMPT!',
    description: 'The military is unhappy! Generals are planning a coup! Your weak position has emboldened them. Act fast or lose power!',
    icon: '⚔️',
    urgency: 'critical',
    choices: [
      {
        label: 'Arrest Generals',
        description: '50% success - risky but ends threat',
        outcomes: {
          success: 0.50,
          successEffect: {
            message: 'Coup leaders arrested! Military purged and rebuilt. You survive!',
            militaryStrength: state.militaryStrength - 30,
            sectorLevels: { ...state.sectorLevels, security: state.sectorLevels.security + 20 },
            happiness: state.happiness + 10
          },
          failureEffect: {
            message: 'COUP SUCCESSFUL! You have been overthrown! GAME OVER.',
            happiness: 0 // Triggers game over
          }
        }
      },
      {
        label: 'Negotiate With Generals',
        description: 'Give them concessions',
        outcomes: {
          success: 0.80,
          successEffect: {
            message: 'Generals appeased with bribes and promotions. You keep power but are now their puppet.',
            treasury: state.treasury * 0.70, // -30% treasury
            militaryStrength: state.militaryStrength + 10,
            happiness: state.happiness - 8
          },
          failureEffect: {
            message: 'Negotiations failed! Coup proceeds! GAME OVER.',
            happiness: 0
          }
        }
      },
      {
        label: 'Rally Public Support',
        description: '60% success - people vs military',
        outcomes: {
          success: 0.60,
          successEffect: {
            message: 'Public rallies behind you! Coup collapses. Democracy wins!',
            happiness: state.happiness + 20,
            militaryStrength: state.militaryStrength - 15,
            globalReputation: state.globalReputation + 20
          },
          failureEffect: {
            message: 'Public support insufficient! Military takes over! GAME OVER.',
            happiness: 0
          }
        }
      }
    ]
  }
}

// 11. BORDER DISPUTE
function generateBorderDispute(state: GameState): Decision | null {
  if (state.enemies.length === 0) return null
  if (Math.random() > 0.35) return null

  const enemy = countries.find(c => state.enemies.includes(c.id))
  if (!enemy) return null

  return {
    id: `border-dispute-${Date.now()}`,
    title: `⚠️ BORDER DISPUTE WITH ${enemy.name}`,
    description: `${enemy.name} claims your territory! They've moved troops to the border. Tensions are high. One wrong move could start a war.`,
    icon: '🗺️',
    urgency: 'high',
    choices: [
      {
        label: 'Send Troops',
        description: 'Show strength - 70% they back down',
        outcomes: {
          success: 0.70,
          successEffect: {
            message: `${enemy.name} backed down! Your show of force worked. Respect earned.`,
            globalReputation: state.globalReputation + 8,
            militaryStrength: state.militaryStrength + 5
          },
          failureEffect: {
            message: `Both sides fired! Conflict escalates into war!`,
            activeWars: [...state.activeWars, createWar(state, enemy.id, true)],
            isInWar: true,
            warredCountries: [...state.warredCountries, enemy.id]
          }
        }
      },
      {
        label: 'Diplomatic Solution',
        description: 'Negotiate - appear weak',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Border dispute resolved peacefully. You gave up small territory.',
            gdp: state.gdp * 0.97, // -3% GDP
            happiness: state.happiness - 8,
            globalReputation: state.globalReputation - 5
          }
        }
      }
    ]
  }
}

// 12. ETHNIC/RELIGIOUS CONFLICT
function generateEthnicConflict(state: GameState): Decision | null {
  if (state.happiness > 50) return null
  if (Math.random() > 0.3) return null

  return {
    id: `ethnic-conflict-${Date.now()}`,
    title: '🔥 ETHNIC/RELIGIOUS VIOLENCE!',
    description: 'Long-simmering tensions have erupted into violence! Communities are attacking each other. Deaths mounting. You must act decisively.',
    icon: '🔥',
    urgency: 'critical',
    choices: [
      {
        label: 'Deploy Military',
        description: 'Martial law - restore order by force',
        outcomes: {
          success: 0.85,
          successEffect: {
            message: 'Military deployed. Order restored but at a heavy cost. Some innocents killed.',
            happiness: state.happiness - 10,
            sectorLevels: { ...state.sectorLevels, security: state.sectorLevels.security + 15 },
            militaryStrength: state.militaryStrength - 10
          },
          failureEffect: {
            message: 'Military intervention backfired! Violence spreads! Society fracturing!',
            happiness: state.happiness - 25,
            gdp: state.gdp * 0.90
          }
        }
      },
      {
        label: 'Mediate Peace',
        description: 'Bring leaders together',
        outcomes: {
          success: 0.50,
          successEffect: {
            message: 'Peace talks successful! Communities agree to reconciliation process.',
            happiness: state.happiness + 10,
            globalReputation: state.globalReputation + 15
          },
          failureEffect: {
            message: 'Mediation failed! Violence continues to spread!',
            happiness: state.happiness - 15,
            gdp: state.gdp * 0.93
          }
        }
      }
    ]
  }
}

// 13. BRAIN DRAIN
function generateBrainDrain(state: GameState): Decision | null {
  if (state.sectorLevels.education > 50) return null
  if (Math.random() > 0.35) return null

  const incentiveCost = state.gdp * 0.06

  return {
    id: `brain-drain-${Date.now()}`,
    title: '🎓 BRAIN DRAIN CRISIS!',
    description: 'Your best and brightest are emigrating! Doctors, engineers, scientists fleeing to better opportunities abroad. Your future is leaving!',
    icon: '🎓',
    urgency: 'high',
    choices: [
      {
        label: `Offer Incentives (${incentiveCost.toFixed(1)}B)`,
        description: 'Pay people to stay',
        outcomes: {
          success: 0.75,
          successEffect: {
            message: 'Incentives work! Many skilled workers stay. Education sector strengthened.',
            treasury: state.treasury - incentiveCost,
            sectorLevels: { ...state.sectorLevels, education: state.sectorLevels.education + 15 },
            gdpGrowthRate: state.gdpGrowthRate + 0.5
          },
          failureEffect: {
            message: 'Money not enough! They still leave. Funds wasted.',
            treasury: state.treasury - incentiveCost,
            happiness: state.happiness - 5
          }
        }
      },
      {
        label: 'Let Them Go',
        description: 'Accept the loss',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Educated elite leaves. Your country loses its best minds.',
            sectorLevels: { ...state.sectorLevels, education: state.sectorLevels.education - 20 },
            gdpGrowthRate: state.gdpGrowthRate - 0.8,
            unemploymentRate: state.unemploymentRate - 1 // Less competition for jobs
          }
        }
      }
    ]
  }
}

// 14. INFRASTRUCTURE CATASTROPHIC FAILURE
function generateInfrastructureFailure(state: GameState): Decision | null {
  const infrastructureDecline = state.initialStats.sectorLevels.infrastructure - state.sectorLevels.infrastructure
  if (infrastructureDecline < 15) return null // Only if infrastructure declined significantly
  if (Math.random() > 0.4) return null

  const repairCost = state.gdp * 0.15

  return {
    id: `infrastructure-failure-${Date.now()}`,
    title: '⚡ INFRASTRUCTURE COLLAPSE!',
    description: 'Major power grid failure! Your neglected infrastructure has catastrophically failed. Blackouts nationwide. Water systems failing. Immediate action required!',
    icon: '⚡',
    urgency: 'critical',
    choices: [
      {
        label: `Emergency Repairs (${repairCost.toFixed(1)}B)`,
        description: 'Fix everything immediately',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Emergency repairs completed! Grid restored. Expensive but effective.',
            treasury: state.treasury - repairCost,
            sectorLevels: { ...state.sectorLevels, infrastructure: state.sectorLevels.infrastructure + 25 },
            happiness: state.happiness + 8
          }
        }
      },
      {
        label: 'Gradual Repairs',
        description: 'Cheaper but citizens suffer longer',
        outcomes: {
          success: 1.0,
          successEffect: {
            message: 'Slow repairs underway. People suffer weeks of blackouts. Deep resentment.',
            treasury: state.treasury - (repairCost * 0.50),
            sectorLevels: { ...state.sectorLevels, infrastructure: state.sectorLevels.infrastructure + 10 },
            happiness: state.happiness - 12,
            gdp: state.gdp * 0.95 // -5% GDP from prolonged outage
          }
        }
      },
      {
        label: 'Request Foreign Help',
        description: '60% success - lose sovereignty',
        outcomes: {
          success: 0.60,
          successEffect: {
            message: 'Foreign engineers fix your infrastructure. Humiliating but effective.',
            sectorLevels: { ...state.sectorLevels, infrastructure: state.sectorLevels.infrastructure + 30 },
            globalReputation: state.globalReputation - 20,
            happiness: state.happiness - 5
          },
          failureEffect: {
            message: 'No one helps! You look weak and incompetent!',
            happiness: state.happiness - 20,
            globalReputation: state.globalReputation - 15
          }
        }
      }
    ]
  }
}
