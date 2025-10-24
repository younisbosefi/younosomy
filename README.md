# Younosomy - Economic Simulator Game

A real-time, browser-based economic and political strategy simulator built with Next.js, React, and Tailwind CSS.

## Features

- **Interactive Intro Screen** - Engaging welcome screen with game introduction
- **Interactive World Map** - Click on color-coded countries directly on a 2D world map
- **Country Selection** - Choose from 12 different countries with varying difficulty levels:
  - 🟢 **Easy** (Green): USA, Germany, UK, France, Japan
  - 🟡 **Medium** (Yellow): China, India, Brazil, Russia
  - 🔴 **Hard** (Red): Somalia, Venezuela, Afghanistan
- **Country Details Modal** - View detailed stats before starting (GDP, Population, Stability, Happiness)
- **Real-time Simulation** - Watch your decisions unfold in real-time with adjustable playback speed
- **Comprehensive Stats Panel** - Monitor GDP, population, stability, happiness, and economic indicators
- **Event System** - Track world events and your own actions through the event logs
- **Progress Tracking** - Visual progress bar with play/pause and speed controls

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

The project is already set up! Just run:

```bash
npm run dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Game Flow

1. **Intro Screen** - Click "BEGIN YOUR RULE" to start
2. **Interactive Map** - Click on a color-coded country on the world map
3. **Country Details** - Review country stats and difficulty in a popup modal
4. **Game Screen** - Confirm selection and manage your nation's economy

## Project Structure

```
younosomy/
├── app/
│   ├── globals.css                # Global styles and custom utilities
│   ├── layout.tsx                  # Root layout component
│   └── page.tsx                    # Main page with game state management
├── components/
│   ├── IntroScreen.tsx             # Welcome/intro screen
│   ├── CountrySelection.tsx        # Country selection screen with map
│   ├── InteractiveWorldMap.tsx     # Interactive 2D world map
│   ├── CountryDetailsModal.tsx     # Country details popup
│   └── GameUI.tsx                  # Main game interface
├── types/
│   └── country.ts                  # TypeScript type definitions
└── data/
    ├── countries.ts                # Country data and stats
    └── countryCoordinates.ts       # Country ISO code mappings
```

## Technologies Used

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3.4** - Styling
- **react-simple-maps** - Interactive SVG world map
- **Turbopack** - Fast bundler

## Next Steps

The interactive map is complete! Here are the next features to implement:

1. ✅ ~~Interactive world map with clickable regions~~
2. Actual game mechanics and simulation logic
3. Policy decision system (economic policies, interest rates, taxes)
4. Diplomatic interactions (trade agreements, alliances, conflicts)
5. Economic calculations and effects (inflation, GDP growth, unemployment)
6. Dynamic event system (random world events, consequences)
7. Win/lose conditions (stability threshold, economic collapse, revolution)
8. Save/load game functionality
9. Additional countries (expand from 12 to more nations)
10. Advanced map features (zoom, pan, tooltips with live stats)

## Color Scheme

The game uses a dark, futuristic theme:

- **Background**: Dark blue/black gradient
- **Accent**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)

## Development Notes

- All components are client-side rendered using 'use client' directive
- The UI is fully responsive and works on different screen sizes
- Custom scrollbars are styled to match the game aesthetic
- Placeholder data is used for demonstration purposes

## Interactive Map Features

The country selection now uses an interactive 2D world map with the following features:

- **Color-coded countries** by difficulty level (Green, Yellow, Red)
- **Hover effects** - Countries light up when you hover over them
- **Click to select** - Click on any playable country to view details
- **Modal popup** - Shows comprehensive stats before starting the game
- **Legend** - Displays difficulty levels and unavailable countries
- **Responsive design** - Map scales to fit different screen sizes
- **Country mapping** - Uses ISO 3166-1 alpha-3 codes for accurate country identification

Currently available playable countries:
- 🇺🇸 United States, 🇩🇪 Germany, 🇬🇧 United Kingdom, 🇫🇷 France, 🇯🇵 Japan (Easy)
- 🇨🇳 China, 🇮🇳 India, 🇧🇷 Brazil, 🇷🇺 Russia (Medium)
- 🇸🇴 Somalia, 🇻🇪 Venezuela, 🇦🇫 Afghanistan (Hard)
