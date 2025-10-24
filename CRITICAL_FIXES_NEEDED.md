# Critical Fixes Needed

## ✅ COMPLETED:
1. ✅ Added click handler to map countries - opens foreign tab and selects country
2. ✅ Added zoom limits to map (minZoom: 0.8, maxZoom: 3)
3. ✅ Fixed overlay positioning (z-index: 20)
4. ✅ Added number formatting utility (formatNumber, formatCurrency)
5. ✅ Added cooldowns to GameState type

## 🔧 TO IMPLEMENT:

### 1. Update useGameEngine Hook
**File**: `hooks/useGameEngine.ts`

Add to initialize function:
```typescript
cooldowns: {
  printMoney: 0,
  borrowIMF: 0,
  declareWar: 0,
  adjustTaxes: 0,
}
```

### 2. Update All Number Displays
**Files**: All components showing GDP, treasury, debt, etc.

Replace all number displays with:
```typescript
import { formatCurrency, formatNumber } from '@/utils/formatting'

// Instead of: ${gameState.gdp.toFixed(1)}B
// Use: formatCurrency(gameState.gdp * 1_000_000_000) // Convert back from billions
```

### 3. Update Actions to Use Percentages
**File**: `components/ImmersiveActionsPanel.tsx`

Change Quick Actions:
- Print Money: 1% of GDP (not $10B)
- Invest Health/Edu: 0.5% of GDP
- Add Reserves: 1% of Treasury
- Borrow IMF: 5% of GDP

Add percentage input sliders for custom amounts.

### 4. Implement Cooldowns
**File**: `utils/gameActions.ts`

Each action should check:
```typescript
if (state.currentDay < state.cooldowns.printMoney) {
  return {
    success: false,
    message: `Action on cooldown for ${state.cooldowns.printMoney - state.currentDay} more days`,
    events: [],
    stateChanges: {}
  }
}
```

And set cooldown after use:
```typescript
stateChanges.cooldowns = {
  ...state.cooldowns,
  printMoney: state.currentDay + 30 // 30 day cooldown
}
```

### 5. Make Game More Punishing

**Update**: `utils/gameCalculations.ts`

#### Happiness Calculation (Make it decay faster):
```typescript
// Base decay every tick
happiness -= 0.1 // Constant decay

// Unemployment hits HARD
happiness -= (state.unemploymentRate - 3) * 1.0 // Increased from 0.5

// Inflation hurts more
if (state.inflationRate > 3) {
  happiness -= (state.inflationRate - 3) * 0.8 // Increased
}

// Low GDP growth hurts
if (state.gdpGrowthRate < 1) {
  happiness -= (1 - state.gdpGrowthRate) * 0.5
}

// Require constant investment to maintain happiness
const totalInvestment = Object.values(state.sectorLevels).reduce((a, b) => a + b, 0)
if (totalInvestment < 100) {
  happiness -= 0.2 // Decay if not investing enough
}
```

#### GDP Growth (Make it harder):
```typescript
// Start with lower base
let growth = 0.5 // Changed from 2.0

// Require active management
if (state.interestRate < 1 || state.interestRate > 5) {
  growth -= 1.0 // Penalty for poor interest rate management
}

// Investments decay over time
growth += (totalSectorInvestment / 500) // Require MORE investment
```

#### Random Disasters:
Add to `utils/eventGenerator.ts`:
```typescript
// Economic Crisis (2% chance per tick)
if (Math.random() < 0.02 * speedMultiplier) {
  // Sudden GDP drop, inflation spike
}

// Natural Disaster (1% chance)
// Political Scandal (1.5% chance)
// Trade War (1% chance with random country)
```

### 6. Event Log Redesign
**File**: `components/ComprehensiveEventLog.tsx`

Change to chat-style layout:
```tsx
<div className="flex flex-col h-full">
  {events.map(event => (
    <div className={`flex ${event.type === 'player' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] p-3 rounded-lg ${
        event.type === 'player'
          ? 'bg-blue-500/20 border-blue-500'
          : 'bg-gray-700 border-gray-600'
      }`}>
        {event.message}
      </div>
    </div>
  ))}
</div>
```

### 7. Auto-Save System
**File**: `hooks/useGameEngine.ts`

Add useEffect:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    localStorage.setItem('younosomy-save', JSON.stringify(gameState))
  }, 30000) // Every 30 seconds

  return () => clearInterval(interval)
}, [gameState])

// On load:
const savedGame = localStorage.getItem('younosomy-save')
if (savedGame) {
  setGameState(JSON.parse(savedGame))
}
```

### 8. Create Game Route
**File**: `app/game/[countryId]/page.tsx`

```tsx
export default function GamePage({ params }: { params: { countryId: string } }) {
  const country = countries.find(c => c.id === params.countryId)

  if (!country) {
    redirect('/')
  }

  return <ComprehensiveGameUI country={country} />
}
```

### 9. Update ImmersiveActionsPanel Props
Add prop for country selection:
```typescript
interface ImmersiveActionsPanelProps {
  gameState: GameState
  onAction: (result: any) => void
  selectedForeignCountry?: string
  onTabChange?: (tab: Tab) => void
}
```

When country clicked on map, call:
```typescript
onTabChange?.('foreign')
setSelectedCountry(countryId)
```

### 10. Make World Events Impactful
**File**: `utils/eventGenerator.ts`

When events generated, actually modify game state:
```typescript
// If war breaks out near you
if (nearbyWar) {
  stateChanges.gdpGrowthRate -= 0.5
  stateChanges.happiness -= 5
}

// Global economic crisis
if (globalCrisis) {
  stateChanges.inflationRate += 2
  stateChanges.gdpGrowthRate -= 1
}
```

## Priority Order:
1. **HIGH**: Number formatting (prevents display bugs)
2. **HIGH**: Happiness dynamics (core gameplay)
3. **HIGH**: Percentage-based actions (game balance)
4. **MEDIUM**: Cooldowns (prevents abuse)
5. **MEDIUM**: Event log redesign (UX)
6. **MEDIUM**: Auto-save (prevents loss)
7. **LOW**: Game route (nice to have)
8. **LOW**: More impactful events (balance)

## Quick Implementation Notes:

The number formatting is CRITICAL - without it, numbers will continue to be nonsense.

Update all displays like this:
```typescript
// OLD
<span>${gameState.treasury.toFixed(1)}B</span>

// NEW
import { formatCurrency } from '@/utils/formatting'
<span>{formatCurrency(gameState.treasury * 1_000_000_000)}</span>
```

The game is currently TOO EASY because happiness doesn't decay and GDP grows passively. Add decay to both.
