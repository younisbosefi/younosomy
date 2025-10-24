'use client'

import { GameState } from '@/types/game'
import { formatCurrency } from '@/utils/formatting'

interface ComprehensiveStatsPanelProps {
  gameState: GameState
  onOpenActions: () => void
}

export default function ComprehensiveStatsPanel({ gameState, onOpenActions }: ComprehensiveStatsPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {/* Score Display - Retro Style */}
      <div className="retro-panel bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500 p-4 text-center animate-pulse-glow relative overflow-hidden">
        <div className="scanline"></div>
        <div className="font-mono text-xs text-green-400 uppercase tracking-wider mb-1 glitch-text">◈ SCORE ◈</div>
        <div className={`text-4xl font-bold font-mono animate-ticker ${gameState.score >= 0 ? 'text-green-400' : 'text-red-400 glitch-text'}`}>
          {gameState.score.toFixed(0)}
        </div>
        <div className={`text-sm font-mono mt-2 ${
          gameState.score - gameState.previousScore > 0 ? 'text-green-400' :
          gameState.score - gameState.previousScore < 0 ? 'text-red-400' : 'text-gray-500'
        }`}>
          {gameState.score - gameState.previousScore >= 0 ? '▲ +' : '▼ '}{Math.abs(gameState.score - gameState.previousScore).toFixed(1)}
        </div>
      </div>

      {/* Economic Stats */}
      <div>
        <h3 className="text-xs font-bold font-mono text-green-400 uppercase tracking-wider mb-2 border-b border-green-500/30 pb-1">
          ◆ 💰 ECONOMIC ◆
        </h3>
        <div className="space-y-2">
          <StatRow label="GDP" value={formatCurrency(gameState.gdp * 1_000_000_000)} />
          <StatRow
            label="GDP Growth"
            value={`${gameState.gdpGrowthRate.toFixed(2)}%`}
            trend={gameState.gdpGrowthRate > 0 ? 'up' : 'down'}
          />
          <StatRow label="Debt" value={formatCurrency(gameState.debt * 1_000_000_000)} />
          <StatRow
            label="Debt-to-GDP"
            value={`${gameState.debtToGdpRatio.toFixed(1)}%`}
            warning={gameState.debtToGdpRatio > 100}
          />
          <StatRow label="Inflation" value={`${gameState.inflationRate.toFixed(1)}%`} />
          <StatRow label="Unemployment" value={`${gameState.unemploymentRate.toFixed(1)}%`} />
          <StatRow label="Interest Rate" value={`${gameState.interestRate.toFixed(1)}%`} />
        </div>
      </div>

      {/* Treasury */}
      <div>
        <h3 className="text-xs font-bold font-mono text-yellow-400 uppercase tracking-wider mb-2 border-b border-yellow-500/30 pb-1">
          ◆ 🏦 TREASURY ◆
        </h3>
        <div className="space-y-2">
          <StatRow label="Treasury" value={formatCurrency(gameState.treasury * 1_000_000_000)} highlight />
          <StatRow label="Daily Revenue" value={formatCurrency(gameState.revenue * 1_000_000_000)} />
          <StatRow label="Reserves" value={formatCurrency(gameState.reserves * 1_000_000_000)} />
          {gameState.borrowedMoney.length > 0 && (
            <StatRow
              label="Monthly Payments"
              value={formatCurrency(gameState.borrowedMoney.reduce((sum, loan) => sum + loan.monthlyPayment, 0) * 1_000_000_000)}
              warning
            />
          )}
        </div>
      </div>

      {/* Social Stats */}
      <div>
        <h3 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wider mb-2 border-b border-blue-500/30 pb-1">
          ◆ 👥 SOCIAL ◆
        </h3>
        <div className="space-y-2">
          <StatRow
            label="Happiness"
            value={`${gameState.happiness.toFixed(0)}%`}
            warning={gameState.happiness < 30}
            critical={gameState.happiness < 20}
          />
          <StatRow label="Security" value={`${gameState.security.toFixed(0)}%`} />
          <StatRow label="Military" value={`${gameState.militaryStrength.toFixed(0)}%`} />
          <StatRow label="Reputation" value={`${gameState.globalReputation.toFixed(0)}%`} />
        </div>
      </div>

      {/* Relations */}
      <div>
        <h3 className="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider mb-2 border-b border-purple-500/30 pb-1">
          ◆ 🌍 RELATIONS ◆
        </h3>
        <div className="space-y-2">
          <StatRow label="Allies" value={gameState.allies.length.toString()} />
          <StatRow label="Enemies" value={gameState.enemies.length.toString()} />
          <StatRow label="Sanctioned By" value={gameState.sanctionsOnUs.length.toString()} warning={gameState.sanctionsOnUs.length > 0} />
          <StatRow label="Active Wars" value={gameState.activeWars.length.toString()} critical={gameState.activeWars.length > 0} />
        </div>
      </div>

      {/* Uprising Warning - Dramatic */}
      {gameState.uprisingProgress > 0 && (
        <div className="retro-panel bg-red-500/20 border-2 border-red-500 p-3 animate-pulse relative overflow-hidden">
          <div className="scanline"></div>
          <div className="text-center">
            <div className="text-red-400 font-bold font-mono text-sm mb-1 glitch-text animate-bounce-slow">
              🔥 REVOLUTION IMMINENT 🔥
            </div>
            <div className="text-xs font-mono text-red-300 animate-flash">
              {30 - gameState.uprisingProgress} DAYS REMAINING!
            </div>
            <div className="w-full bg-game-darker rounded h-3 mt-2 overflow-hidden border border-red-500">
              <div
                className="h-full bg-red-500 transition-all animate-pulse"
                style={{ width: `${(gameState.uprisingProgress / 30) * 100}%` }}
              />
            </div>
            <div className="text-xs font-mono text-red-400 mt-1">
              DANGER LEVEL: {((gameState.uprisingProgress / 30) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function StatRow({
  label,
  value,
  trend,
  highlight,
  warning,
  critical
}: {
  label: string
  value: string
  trend?: 'up' | 'down'
  highlight?: boolean
  warning?: boolean
  critical?: boolean
}) {
  return (
    <div className={`flex justify-between items-center py-1 px-2 rounded font-mono transition-all ${
      highlight ? 'bg-game-accent/10 border-l-2 border-green-400' : ''
    } ${
      critical ? 'bg-red-500/20 text-red-400 animate-pulse' : warning ? 'bg-yellow-500/20 text-yellow-400' : ''
    }`}>
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${
          critical ? 'text-red-400 glitch-text' : warning ? 'text-yellow-400' : highlight ? 'text-green-400' : 'text-gray-200'
        }`}>
          {value}
        </span>
        {trend && (
          <span className={`text-lg ${trend === 'up' ? 'text-green-400 animate-bounce-slow' : 'text-red-400'}`}>
            {trend === 'up' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </div>
  )
}
