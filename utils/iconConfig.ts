export const ICONS = {
  // Quick Actions
  printMoney: 'game-icons:cash',
  borrowMoney: 'game-icons:money-stack',
  payDebt: 'game-icons:contract',
  reserves: 'game-icons:shield-echoes',
  rateIncrease: 'game-icons:up-arrow',
  rateDecrease: 'game-icons:down-arrow',

  // Economic
  adjustTaxes: 'game-icons:scales',
  interestRate: 'game-icons:chart',

  // Domestic
  health: 'game-icons:health-normal',
  education: 'game-icons:graduate-cap',
  military: 'game-icons:sword-brandish',
  infrastructure: 'game-icons:stone-bridge',
  housing: 'game-icons:house',
  agriculture: 'game-icons:wheat',
  transportation: 'game-icons:railway',
  security: 'game-icons:shield',
  tourism: 'game-icons:palm-tree',
  sports: 'game-icons:trophy',

  // Foreign
  war: 'game-icons:crossed-swords',
  sanction: 'game-icons:cancel',
  alliance: 'game-icons:handshake',
  sendAid: 'game-icons:present',
  requestAid: 'game-icons:plea',

  // Events
  world: 'game-icons:world',
  player: 'game-icons:crown',
  critical: 'game-icons:WarningSign',
  advice: 'game-icons:enlightenment',

  // Stats
  gdp: 'game-icons:gold-bar',
  happiness: 'game-icons:hearts',
  treasury: 'game-icons:treasure',
  debt: 'game-icons:broken-chain',
  inflation: 'game-icons:fire-wave',
  unemployment: 'game-icons:person',
  reputation: 'game-icons:star-formation',

  // Special
  uprising: 'game-icons:fire-silhouette',
  gameOver: 'game-icons:skull-crossed-bones',
  victory: 'game-icons:laurel-crown',
  flag: 'game-icons:waving-flag',

  // UI
  play: 'game-icons:play-button',
  pause: 'game-icons:pause-button',
  speed: 'game-icons:fast-forward-button',
  exit: 'game-icons:exit-door',

  // War
  warBattle: 'game-icons:battle-gear',
  warVictory: 'game-icons:crowned-skull',
  warDefeat: 'game-icons:bleeding-wound',

  // Economic events
  stockCrash: 'game-icons:chart-down',
  stockBoom: 'game-icons:chart-up',
  disaster: 'game-icons:tornado',
  gift: 'game-icons:gift-trap',
} as const

export function getIcon(key: keyof typeof ICONS, fallback = 'game-icons:help'): string {
  return ICONS[key] || fallback
}
