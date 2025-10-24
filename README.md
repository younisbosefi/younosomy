1. Game Overview & Core Loop
Concept: A real-time, browser-based economic and political strategy simulator where the player acts as the leader of a nation, managing its economy, international relations, and domestic policies to achieve prosperity and avoid being overthrown.
Core Game Loop:
1 -> Select a country from the world map
2-> Plan & Decide: Use available actions to influence the country's trajectory.
3-> Observe & React: Watch the simulation run, react to world events, and see the consequences of your decisions.
4-> Survive & Thrive: The goal is to survive the chosen time period (5, 10, 25 years) with the highest possible score, avoiding overthrow.

2. Game Setup & UI Layout
Initial Screen: An interactive world map. The user clicks a country to select it.
Countries will have either the color green, yellow or red. Depending on the difficulty, the better stats to thrive and achieve economic prosperity the easier it is to play with.
Time Control: Play/Pause, Speed 
(Normal speed - 1 Game tick: 1 sec = 1 day)
(Fast forward - 3 Game ticks : 1 sec = 3 days). 
Since there are 3 game ticks in a second, instead of running the game tick function which executes the game frame (all the equations and events), there will be a special function that executes the same logic but with tweaked numbers, for example:
In the normal tick there is a 0.021 chance that an uprising will happen, and the country also gains 10Billion in GDP.
When the player speeds up, everything will be multiplied by 3 so the chance becomes 0.021 * 3 which is 0.063, and the gdp will increase by 30Billion.
Dropdown to select game length (5/10/25 years).

Proposed In-Game UI Layout:
After selecting the country, the world map is still shown in the middle, you can interact with it to see other countries' stats.
The stats are shown to the left as a side panel
On the right is the world event logs in shape of messages
messages on the left are of the world
Something like: North Korea waged war on South Korea
Messages on the right are of your own actions and things related to you, things like:
You increased interest rate by 1.5%
USA Waged war on you
Below is the progress bar, it moves at each tick (second) with play, pause and fast forward buttons



3. Core Statistics (The "State" of Your Nation)
These stats are displayed and updated every game tick.
Stat	Description & Mechanics
GDP	The total economic output. Increases/Decreases based on GDP Growth Rate.
GDP Growth Rate	The engine of the economy. Affected by: Interest Rate (high = bad), Government Spending (high = good), Debt-to-GDP Ratio (high = bad), Inflation (very high = bad), Unemployment (high = bad), Happiness (high = good), Wars (active = bad).
Debt	Total national debt. Increases by borrowing (e.g., from IMF or Other countries).
Debt-to-GDP Ratio	Debt / GDP. A key health metric. High ratio negatively impacts GDP Growth Rate and Score.
Inflation Rate	 The rate of price increases. Primarily affected by: Interest Rate (high = lowers inflation) and money printing, and also affects happiness.
Unemployment Rate	Percentage of workforce without jobs. Lowered by spending on domestic projects (Infrastructure, Health, Education). Raised by neglecting domestic spending. Affects Happiness and GDP Growth.
Interest Rate	A lever the player controls. Raising it: fights Inflation, but hurts GDP Growth. Lowering it: boosts GDP Growth, but risks higher Inflation.
National Treasury	The government's available cash. Your "mana" for actions.
Revenue	Daily income added to the Treasury. Increased by: GDP Growth, Taxes, profitable events.
Reserves Emergency "oh crap" fund. Can be added to from the Treasury and spent only during severe crises (e.g., massive war, economic crash).
Happiness Index	Citizen satisfaction. Affected by: Unemployment (high = bad), Taxes (high = bad), Security (high = good), Score (high = good) winning/losing wars, being sanctioned. If too low, uprising risk appears.
Security Index	How safe citizens feel. Increased by spending on "State Protection & Justice". Directly boosts happiness and success chances of the "Repress" action.
Military Strength	Power of your armed forces. Increased by spending on "Military". Determines war success probability.
Global Reputation	A stat representing how the world sees you. Affects alliance offers, aid acceptance, and event bidding. Increased by sending aid, honoring alliances. Decreased by breaking alliances, warmongering, too many enemies.
Score	The single most important metric. A running tally of your performance. Increases if GDP is up, Debt-to-GDP is down, Happiness is high, etc. Decreases if the opposite happens. A negative score increases overthrow risk.
Country Lists:

Allies: Countries that will likely send aid and join your wars.

Enemies: Countries that may sanction or declare war on you.

Sanctions On Your country list: Countries economically blocking you. Hurts GDP Growth and Revenue.

4. Actions Menu (The "Input")
Economic Actions

Adjust Interest Rate: Slider to set rate, affecting Inflation and GDP Growth.

Print Money: Instantly adds to Treasury but causes a large, immediate spike in Inflation.

Raise/Lower Taxes: Adjusts Revenue (and thus Treasury income) but negatively/positively affects Happiness.

Borrow from IMF: Large one-time boost to Treasury, but significantly increases Debt.
Note that any money you borrow has interest rate on it that has to be paid each month, it will be automatically paid and subtracted from your treasury, if there is no money left it will be taken from reserves, if none, your country will default on its debts and an economic crash will happen vastly decreasing happiness and score making an uprising inevitable if you don’t fix it soon

Add to Reserves: Moves money from Treasury to Reserves.

Domestic Spending (Each costs Treasury)

Spend on [Sector]: Health, Education, Infrastructure, Military, etc.
Available sectors: Health - Education - Military - Infrastructure - Housing - Agriculture - Transportation - State Protection and Justice (Affects security index) - Tourism - Sports

Mechanic: Each country has hidden "sector potential" indexes. Spending on a sector with high potential (e.g., UAE on Tourism) gives a great boost to GDP Growth and Happiness. Spending on a sector with low potential (e.g., Libya on Agriculture) gives a diminished return and can hurt Happiness ("wasting money").
The sector potential will range from: Very low -> low -> mid -> high -> very high
For example libya is very low on agriculture, investing on it will definitely waste money

Repress People: Only available during an uprising. Uses Military Strength and Security Index to calculate a success chance. Success delays overthrow. Failure accelerates it.

Foreign Policy Actions

Declare War: Target any country. High cost from Treasury/Reserves. You have to wage wars at enemies your strength, waging wars at enemies weaker than you will actually lose you money

War Resolution: A probability calculation over 7-90 in-game days based on: Military Strength of both sides + number of Allies that join. Winning boosts Score, Happiness, Treasury (plunder). Losing tanks Score, Happiness, Military Strength.

Impose Sanction: Designate a country as an Enemy and add them to their Sanctions On Us list. Hurts their economy. Hurts your Global Reputation if done arbitrarily.

Propose Alliance: Send a request to a neutral/friendly country. Chance based on Global Reputation and shared Enemies.

Send Aid: Send money from your Treasury to another country. To an Ally: greatly improves relations. To an Enemy: small chance they accept, removing them from your Enemies list.

Register Enemy: Formally declare a country an Enemy.

Special Actions

Host Global Event (World Cup, Olympics): A pop-up appears every 4 years for bidding. Spending a large amount from Treasury enters you into a lottery. Winning the bid grants a massive, multi-year boost to Revenue, Happiness, and GDP Growth.

5. Mechanics & Calculations (The "Engine")
Game Tick: Every second (real time) = 1 day (game time).

Tick Calculations: On each tick, the game:

Calculates daily Revenue and adds it to the Treasury.

Updates GDP based on GDP Growth Rate.

Recalculates all derived stats (Debt-to-GDP Ratio).

Calculates the SCORE.

Rolls for random world events (e.g., "Country X declares war on Country Y") based on pre-defined probabilities and relationships.

Checks Happiness and Score to determine if an uprising trigger is met.

The Score Equation (Simplified Example):
Score Change per Tick = (GDP Growth Rate * 10) + (Previous Debt-to-GDP - New Debt-to-GDP) * 100 + (Happiness Change * 5) + (New Alliances * 20) - (New Enemies * 20) - (Inflation Rate * 2)
This is just a template. You will need to playtest and balance the weights (the multiplied numbers).

Uprising & Loss Condition:

If Happiness stays below 20 for 30 consecutive days, an uprising begins.

A "Repress" button appears.

If the player doesn't repress, or repression fails, the game ends. YOU HAVE BEEN OVERTHROWN.

6. World Event Log
A simple text console that displays:

Results of your actions. ("You raised interest rates to 5%")

AI-driven world events. ("War broke out between India and Pakistan", "The United States hosted the World Cup")

Critical warnings. ("Public unrest is growing!", "Japan has sanctioned your country!")

This is crucial for giving the player context and making the world feel alive.

