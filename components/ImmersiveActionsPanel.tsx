'use client'

import { useState } from 'react'
import React from 'react'
import { GameState } from '@/types/game'
import { countries } from '@/data/countries'
import * as gameActions from '@/utils/gameActions'
import { formatCurrency } from '@/utils/formatting'

interface ImmersiveActionsPanelProps {
  gameState: GameState
  onAction: (result: any) => void
  selectedForeignCountry?: string
  activeTab?: 'quick' | 'economic' | 'domestic' | 'foreign'
  onTabChange?: (tab: 'quick' | 'economic' | 'domestic' | 'foreign') => void
}

type Tab = 'quick' | 'economic' | 'domestic' | 'foreign'

export default function ImmersiveActionsPanel({
  gameState,
  onAction,
  selectedForeignCountry = '',
  activeTab: externalActiveTab,
  onTabChange
}: ImmersiveActionsPanelProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<Tab>('quick')
  const [expanded, setExpanded] = useState(false)

  const activeTab = externalActiveTab || internalActiveTab
  const handleTabChange = (tab: Tab) => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      setInternalActiveTab(tab)
    }
  }

  // Auto-expand when foreign country is selected
  React.useEffect(() => {
    if (selectedForeignCountry && externalActiveTab === 'foreign') {
      setExpanded(true)
    }
  }, [selectedForeignCountry, externalActiveTab])

  return (
    <div className="absolute bottom-20 left-0 right-0 z-40">
      {/* Toggle Button */}
      <div className="text-center mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="retro-panel px-8 py-3 font-bold font-mono text-sm animate-pulse-glow action-button"
        >
          {expanded ? '▼ HIDE ACTIONS ▼' : '▲ SHOW ACTIONS ▲'}
        </button>
      </div>

      {/* Actions Panel */}
      <div
        className={`retro-panel transition-all duration-500 transform ${
          expanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: expanded ? '400px' : '0' }}
      >
        {/* Scanline effect */}
        <div className="scanline"></div>

        {/* Tabs */}
        <div className="grid grid-cols-4 border-b-2 border-game-border">
          {[
            { id: 'quick' as Tab, label: '⚡ QUICK', color: 'blue' },
            { id: 'economic' as Tab, label: '💰 ECONOMY', color: 'green' },
            { id: 'domestic' as Tab, label: '🏗️ DOMESTIC', color: 'purple' },
            { id: 'foreign' as Tab, label: '🌍 FOREIGN', color: 'red' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 font-bold font-mono text-sm transition-all action-button ${
                activeTab === tab.id
                  ? 'bg-game-accent text-white'
                  : 'bg-game-darker text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
          {activeTab === 'quick' && <QuickActions gameState={gameState} onAction={onAction} />}
          {activeTab === 'economic' && <EconomicActions gameState={gameState} onAction={onAction} />}
          {activeTab === 'domestic' && <DomesticActions gameState={gameState} onAction={onAction} />}
          {activeTab === 'foreign' && (
            <ForeignActions
              gameState={gameState}
              onAction={onAction}
              initialCountry={selectedForeignCountry}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function QuickActions({ gameState, onAction }: { gameState: GameState; onAction: any }) {
  // PERCENTAGE-BASED AMOUNTS (scales with economy size!)
  const printAmount = gameState.gdp * 0.01 // 1% of GDP
  const sectorAmount = gameState.treasury * 0.05 // 5% of treasury
  const reserveAmount = gameState.treasury * 0.1 // 10% of treasury
  const borrowAmount = gameState.gdp * 0.1 // 10% of GDP
  const debtPayment = gameState.treasury * 0.2 // 20% of treasury for debt payment

  return (
    <div className="grid grid-cols-3 gap-2">
      <ActionCard
        icon="📈"
        label="RAISE RATES"
        sublabel="+0.5%"
        onClick={() => {
          const result = gameActions.adjustInterestRate(gameState, Math.min(10, gameState.interestRate + 0.5))
          onAction(result)
        }}
        color="blue"
      />
      <ActionCard
        icon="📉"
        label="LOWER RATES"
        sublabel="-0.5%"
        onClick={() => {
          const result = gameActions.adjustInterestRate(gameState, Math.max(0, gameState.interestRate - 0.5))
          onAction(result)
        }}
        color="blue"
      />
      <ActionCard
        icon="💵"
        label="PRINT MONEY"
        sublabel="1% GDP ⚠️"
        onClick={() => {
          const result = gameActions.printMoney(gameState, printAmount)
          onAction(result)
        }}
        color="yellow"
        disabled={gameState.inflationRate > 10 || gameState.cooldowns.printMoney > 0}
        cooldownDays={gameState.cooldowns.printMoney}
        maxCooldown={30}
      />
      <ActionCard
        icon="🏥"
        label="INVEST HEALTH"
        sublabel="5% Treasury"
        onClick={() => {
          const result = gameActions.spendOnSector(gameState, 'health', sectorAmount)
          onAction(result)
        }}
        color="green"
        disabled={gameState.treasury < sectorAmount}
      />
      <ActionCard
        icon="🎓"
        label="INVEST EDU"
        sublabel="5% Treasury"
        onClick={() => {
          const result = gameActions.spendOnSector(gameState, 'education', sectorAmount)
          onAction(result)
        }}
        color="green"
        disabled={gameState.treasury < sectorAmount}
      />
      <ActionCard
        icon="🏗️"
        label="INFRASTRUCTURE"
        sublabel="5% Treasury"
        onClick={() => {
          const result = gameActions.spendOnSector(gameState, 'infrastructure', sectorAmount)
          onAction(result)
        }}
        color="green"
        disabled={gameState.treasury < sectorAmount}
      />
      <ActionCard
        icon="🛡️"
        label="TO RESERVES"
        sublabel="10% Treasury"
        onClick={() => {
          const result = gameActions.addToReserves(gameState, reserveAmount)
          onAction(result)
        }}
        color="purple"
        disabled={gameState.treasury < reserveAmount}
      />
      <ActionCard
        icon="🏦"
        label="BORROW IMF"
        sublabel="10% GDP"
        onClick={() => {
          const result = gameActions.borrowFromIMF(gameState, borrowAmount)
          onAction(result)
        }}
        color="red"
        disabled={gameState.cooldowns.borrowIMF > 0}
        cooldownDays={gameState.cooldowns.borrowIMF}
        maxCooldown={90}
      />
      {gameState.debt > 0 && (
        <ActionCard
          icon="💳"
          label="PAY DEBT"
          sublabel="20% Treasury"
          onClick={() => {
            const result = gameActions.payOffDebt(gameState, debtPayment)
            onAction(result)
          }}
          color="green"
          disabled={gameState.treasury < debtPayment}
        />
      )}
      {gameState.isUprising && (
        <ActionCard
          icon="🪖"
          label="REPRESS"
          sublabel="Stop Uprising"
          onClick={() => {
            const result = gameActions.repressUprising(gameState)
            onAction(result)
          }}
          color="red"
          className="col-span-3 animate-pulse"
        />
      )}
    </div>
  )
}

function EconomicActions({ gameState, onAction }: { gameState: GameState; onAction: any }) {
  const [interestRate, setInterestRate] = useState(gameState.interestRate)
  const [amount, setAmount] = useState(50)

  return (
    <div className="space-y-3">
      <div className="retro-panel p-3 bg-game-darker">
        <div className="font-mono text-xs text-green-400 mb-2">INTEREST RATE: {interestRate.toFixed(1)}%</div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full mb-2"
        />
        <button
          onClick={() => {
            const result = gameActions.adjustInterestRate(gameState, interestRate)
            onAction(result)
          }}
          className="w-full py-2 bg-game-accent rounded font-mono text-sm font-bold action-button"
        >
          APPLY RATE
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ActionCard
          icon="💵"
          label="PRINT MONEY"
          sublabel={`$${amount}B`}
          onClick={() => {
            const result = gameActions.printMoney(gameState, amount)
            onAction(result)
          }}
          color="yellow"
          disabled={gameState.cooldowns.printMoney > 0}
          cooldownDays={gameState.cooldowns.printMoney}
          maxCooldown={30}
        />
        <ActionCard
          icon="🏦"
          label="BORROW IMF"
          sublabel={`$${amount}B`}
          onClick={() => {
            const result = gameActions.borrowFromIMF(gameState, amount)
            onAction(result)
          }}
          color="red"
          disabled={gameState.cooldowns.borrowIMF > 0}
          cooldownDays={gameState.cooldowns.borrowIMF}
          maxCooldown={90}
        />
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 px-3 py-2 bg-game-darker border border-game-border rounded font-mono"
          placeholder="Amount"
        />
        <button
          onClick={() => setAmount(10)}
          className="px-3 py-2 bg-game-border rounded font-mono text-xs"
        >
          $10B
        </button>
        <button
          onClick={() => setAmount(50)}
          className="px-3 py-2 bg-game-border rounded font-mono text-xs"
        >
          $50B
        </button>
        <button
          onClick={() => setAmount(100)}
          className="px-3 py-2 bg-game-border rounded font-mono text-xs"
        >
          $100B
        </button>
      </div>
    </div>
  )
}

function DomesticActions({ gameState, onAction }: { gameState: GameState; onAction: any }) {
  // PERCENTAGE-BASED: 5% of treasury per sector investment
  const investAmount = gameState.treasury * 0.05

  const sectors = [
    { key: 'health' as const, name: 'HEALTH', icon: '🏥' },
    { key: 'education' as const, name: 'EDUCATION', icon: '🎓' },
    { key: 'infrastructure' as const, name: 'INFRASTRUCTURE', icon: '🏗️' },
    { key: 'housing' as const, name: 'HOUSING', icon: '🏘️' },
    { key: 'military' as const, name: 'MILITARY', icon: '🪖' },
    { key: 'security' as const, name: 'SECURITY', icon: '👮' },
    { key: 'agriculture' as const, name: 'AGRICULTURE', icon: '🌾' },
    { key: 'transportation' as const, name: 'TRANSPORT', icon: '🚇' },
    { key: 'tourism' as const, name: 'TOURISM', icon: '🏖️' },
    { key: 'sports' as const, name: 'SPORTS', icon: '⚽' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {sectors.map((sector) => (
        <ActionCard
          key={sector.key}
          icon={sector.icon}
          label={sector.name}
          sublabel={`Lv.${gameState.sectorLevels[sector.key].toFixed(0)} • 5%`}
          onClick={() => {
            const result = gameActions.spendOnSector(gameState, sector.key, investAmount)
            onAction(result)
          }}
          color="purple"
          disabled={gameState.treasury < investAmount}
        />
      ))}
    </div>
  )
}

function ForeignActions({
  gameState,
  onAction,
  initialCountry = ''
}: {
  gameState: GameState
  onAction: any
  initialCountry?: string
}) {
  const [selectedCountry, setSelectedCountry] = useState(initialCountry)
  const otherCountries = countries.filter((c) => c.id !== gameState.country.id)

  // PERCENTAGE-BASED foreign policy costs
  const aidAmount = gameState.treasury * 0.05 // 5% of treasury
  const warCost = gameState.gdp * 0.15 // 15% of GDP (wars are expensive!)

  // Update selected country when initialCountry changes
  React.useEffect(() => {
    if (initialCountry) {
      setSelectedCountry(initialCountry)
    }
  }, [initialCountry])

  return (
    <div className="space-y-3">
      <select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        className="w-full px-3 py-2 bg-game-darker border border-game-border rounded font-mono text-sm"
      >
        <option value="">-- SELECT TARGET --</option>
        {otherCountries.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {selectedCountry && (
        <div className="grid grid-cols-2 gap-2">
          <ActionCard
            icon="⚔️"
            label="DECLARE WAR"
            sublabel="15% GDP"
            onClick={() => {
              const result = gameActions.declareWar(gameState, selectedCountry)
              onAction(result)
            }}
            color="red"
            disabled={gameState.treasury < warCost || gameState.cooldowns.declareWar > 0}
            cooldownDays={gameState.cooldowns.declareWar}
            maxCooldown={180}
          />
          <ActionCard
            icon="🚫"
            label="SANCTION"
            sublabel="Embargo"
            onClick={() => {
              const result = gameActions.imposeSanction(gameState, selectedCountry)
              onAction(result)
            }}
            color="yellow"
          />
          <ActionCard
            icon="🤝"
            label="ALLIANCE"
            sublabel="Propose"
            onClick={() => {
              const result = gameActions.proposeAlliance(gameState, selectedCountry)
              onAction(result)
            }}
            color="green"
          />
          <ActionCard
            icon="🎁"
            label="SEND AID"
            sublabel="5% Treasury"
            onClick={() => {
              const result = gameActions.sendAid(gameState, selectedCountry, aidAmount)
              onAction(result)
            }}
            color="blue"
            disabled={gameState.treasury < aidAmount}
          />
        </div>
      )}
    </div>
  )
}

function ActionCard({
  icon,
  label,
  sublabel,
  onClick,
  color,
  disabled,
  className = '',
  cooldownDays,
  maxCooldown,
}: {
  icon: string
  label: string
  sublabel: string
  onClick: () => void
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  disabled?: boolean
  className?: string
  cooldownDays?: number
  maxCooldown?: number
}) {
  const colorClasses = {
    blue: 'border-blue-500 hover:bg-blue-500/20',
    green: 'border-green-500 hover:bg-green-500/20',
    yellow: 'border-yellow-500 hover:bg-yellow-500/20',
    red: 'border-red-500 hover:bg-red-500/20',
    purple: 'border-purple-500 hover:bg-purple-500/20',
  }

  const isCooldown = cooldownDays !== undefined && cooldownDays > 0
  const cooldownPercent = isCooldown && maxCooldown ? ((maxCooldown - cooldownDays) / maxCooldown) * 100 : 100

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`retro-panel p-3 border-2 ${colorClasses[color]} transition-all duration-200 transform hover:scale-105 action-button disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${className}`}
    >
      {/* Cooldown progress bar */}
      {isCooldown && (
        <>
          <div
            className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all"
            style={{ width: `${cooldownPercent}%` }}
          />
          <div className="absolute top-1 right-1 text-xs text-red-400 font-bold">
            {Math.ceil(cooldownDays)}d
          </div>
        </>
      )}
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-mono text-xs font-bold">{label}</div>
      <div className="font-mono text-xs text-gray-400">
        {isCooldown ? `Cooldown: ${Math.ceil(cooldownDays)}d` : sublabel}
      </div>
    </button>
  )
}
