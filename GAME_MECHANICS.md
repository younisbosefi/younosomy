# Younosomy - Complete Game Mechanics Documentation

## Game Overview

Younosomy is a fully functional real-time economic and political strategy simulator where you lead a nation through economic challenges, manage domestic policies, conduct foreign relations, and survive until the end of your term.

## 🎮 Core Game Loop

1. **Select Country** → Interactive world map with difficulty-coded countries
2. **Choose Game Length** → 5, 10, or 25 years
3. **Take Actions** → Make strategic economic, domestic, and foreign policy decisions
4. **Watch Simulation** → Real-time tick system updates all stats every second
5. **Survive & Thrive** → Maximize your score and avoid overthrow

## ⏱️ Time System

- **Normal Speed (1x)**: 1 real second = 1 game day
- **Fast Forward (3x)**: 1 real second = 3 game days
- All calculations are automatically adjusted for speed multiplier
- Play/Pause controls allow strategic planning

## 📊 Core Statistics

### Economic Stats
- **GDP** - Total economic output (in billions)
- **GDP Growth Rate** - Engine of the economy (percentage)
- **Debt** - Total national debt
- **Debt-to-GDP Ratio** - Key health metric (high ratio = bad)
- **Inflation Rate** - Price increase rate
- **Unemployment Rate** - Jobless percentage
- **Interest Rate** - Your primary economic lever

### Treasury & Revenue
- **Treasury** - Available government cash for actions
- **Daily Revenue** - Income added each tick
- **Reserves** - Emergency fund for crises
- **Loan Payments** - Automatic monthly deductions

### Social & Military
- **Happiness** (0-100) - Citizen satisfaction
- **Security** (0-100) - Safety index
- **Military Strength** (0-100) - Armed forces power
- **Global Reputation** (0-100) - How the world sees you

### Relations
- **Allies** - Countries that support you
- **Enemies** - Hostile nations
- **Sanctions** - Countries blocking your economy
- **Active Wars** - Ongoing military conflicts

## 🎯 The Score System

Your score is calculated every tick based on:
- GDP Growth Rate (+)
- Debt-to-GDP improvement (+)
- Happiness increase (+)
- New alliances (+)
- New enemies (-)
- High inflation (-)
- Economic default (---)

**Goal**: Maximize your score by maintaining economic growth, keeping citizens happy, and managing debt responsibly.

## 💰 Economic Actions

### Adjust Interest Rate (0-10%)
- **High Rate**: Fights inflation BUT hurts GDP growth
- **Low Rate**: Boosts GDP growth BUT risks higher inflation
- Free action, can be adjusted anytime

### Print Money
- Instantly adds cash to treasury
- **WARNING**: Causes massive inflation spike
- Use only in emergencies

### Borrow from IMF
- Large loan (up to $1000B) at 4.5% annual interest
- Monthly payments automatically deducted from treasury/reserves
- **DANGER**: Missing payments = economic default = game crisis

### Add to Reserves
- Move money from treasury to emergency reserves
- Reserves used when treasury can't cover loan payments
- Strategic safety net

## 🏗️ Domestic Spending

Invest in 10 different sectors:
- **Health** 🏥
- **Education** 🎓
- **Military** 🪖
- **Infrastructure** 🏗️
- **Housing** 🏘️
- **Agriculture** 🌾
- **Transportation** 🚇
- **Security & Justice** 👮
- **Tourism** 🏖️
- **Sports** ⚽

### Sector Potential System

Each country has different sector potentials:
- **Very High**: Excellent returns, boosts GDP & happiness
- **High**: Good returns
- **Mid**: Normal returns
- **Low**: Minimal effect
- **Very Low**: WASTING MONEY - Negative effect on happiness!

**Examples**:
- UAE Tourism = Very High (great investment!)
- Somalia Agriculture = Very Low (waste of money!)
- USA Technology = Very High
- Libya Agriculture = Very Low

### Repress Uprising
- Only available during active uprising
- Success chance = (Military × 0.4 + Security × 0.6)
- Success: Delays revolution but hurts happiness & reputation
- Failure: Immediate game over

## 🌍 Foreign Policy Actions

### Declare War
- Cost: $100B from treasury
- Duration: Random 7-90 days
- Outcome based on military strength + allies
- **Risks**: Hurts happiness, GDP, and reputation
- **Rewards**: Win = Score boost, plunder, happiness increase

### Impose Sanctions
- Designate country as enemy
- Hurts their economy
- Damages your global reputation

### Propose Alliance
- Success chance based on your global reputation
- **Benefits**: Support in wars, better reputation
- **Requirement**: Cannot ally with enemies

### Send Aid
- Send money to any country
- To Allies: Greatly improves relations
- To Enemies: Small chance to make peace

## 📈 Calculations & Formulas

### GDP Growth Rate Factors
```
Base: 2.0%
- Interest Rate Effect: -(rate - 2) × 0.15
- Debt Effect: If debt/GDP > 100%, -(debt/GDP - 100) × 0.02
- Inflation Effect: If > 5%, -(inflation - 5) × 0.3
- Unemployment Effect: -(unemployment - 4) × 0.1
- Happiness Effect: (happiness - 50) × 0.03
- War Effect: -1.5% per active war
- Sanctions Effect: -0.5% per sanction
+ Sector Investment Bonuses
```

### Happiness Factors
```
Base: Current happiness
- Unemployment: -(unemployment - 5) × 0.5
- High Inflation: -(inflation - 5) × 0.4 (if > 5%)
+ Security: (security - 50) × 0.15
+ Score: score × 0.001 (negative score hurts more)
- Wars: -5 per war
- Sanctions: -2 per sanction
+ Sectors: (health + education + housing) × 0.02
- Default: -20 if defaulted
```

## ⚠️ Game Over Conditions

### Overthrow (Revolution)
- Triggered if happiness < 20 for 30 consecutive days
- Warning messages appear when happiness drops below 30
- Uprising countdown visible in stats panel
- Must repress uprising or restore happiness
- **Result**: GAME OVER

### Economic Default
- Occurs when you can't pay loan monthly payments
- Treasury + Reserves both depleted
- **Effects**: -20 happiness, -500 score, massive crisis
- Often leads to uprising if not fixed quickly

### Natural End
- Game successfully completes after chosen duration
- Final score calculated
- Statistics displayed

## 🎲 Random World Events

The game generates random events each tick (adjusted for speed):
- **Wars between other nations** (0.7% chance per tick)
- **New alliances formed** (1% chance per tick)
- **Sanctions imposed** (0.5% chance per tick)
- **Economic events** (1.5% chance per tick)

These events make the world feel alive and dynamic.

## 🏆 Scoring & Success

### High Score Strategies
1. Maintain steady GDP growth (2-4%)
2. Keep debt-to-GDP ratio below 100%
3. Balance interest rates (2-3% ideal)
4. Keep citizens happy (>50%)
5. Invest in high-potential sectors
6. Build strategic alliances
7. Avoid unnecessary wars
8. Never default on loans

### Difficulty Differences

**Easy Countries** (🟢 Green):
- Higher starting stats
- Better sector potentials
- Starting GDP growth: 2.5%
- Examples: USA, Germany, UK, France, Japan

**Medium Countries** (🟡 Yellow):
- Moderate starting stats
- Mixed sector potentials
- Starting GDP growth: 1.5%
- Examples: China, India, Brazil, Russia

**Hard Countries** (🔴 Red):
- Low starting stats
- Poor sector potentials
- Starting GDP growth: 0.5%
- High initial unemployment & inflation
- Examples: Somalia, Venezuela, Afghanistan

## 🎨 UI Features

### Stats Panel (Left)
- Real-time stat updates
- Color-coded warnings (yellow/red)
- Uprising progress bar
- Quick "Take Action" button

### Event Log (Right)
- Critical events (red) - Always visible
- Your actions (green) - Your decisions & results
- World events (blue) - Global happenings
- Timestamps and day numbers

### Center Display
- Country flag and name
- Current day / total days
- Play/pause status
- Game speed indicator

### Progress Bar (Bottom)
- Visual time progression
- Play/Pause button
- Speed toggle (1x/3x)
- Years remaining counter

## 🔧 Technical Features

- Real-time game engine with tick system
- Automatic state calculations every tick
- Speed-adjusted probability calculations
- Loan payment automation
- War duration system
- Comprehensive action system
- Event generation engine

## 💡 Pro Tips

1. **Don't print money** unless absolutely desperate
2. **Watch your debt-to-GDP ratio** - Keep it under 100%
3. **Invest in high-potential sectors** - Check your country's strengths
4. **Build reserves early** - You'll need them for loan payments
5. **Keep happiness above 30** - Give yourself buffer before uprising
6. **Interest rates are powerful** - Small changes have big effects
7. **Alliances help in wars** - Build relationships before conflicts
8. **Speed up during stable times** - Slow down during crises

## 🎯 Achievement Ideas (Future)

- Survive 25 years in a Hard country
- Reach 1000+ score
- Zero debt achievement
- 100% happiness maintained
- Win 5 wars
- Form alliances with all neighbors
- Never print money challenge
- Economic prosperity (double starting GDP)

---

**The game is fully playable and all mechanics are implemented!** Start playing at [http://localhost:3000](http://localhost:3000)
