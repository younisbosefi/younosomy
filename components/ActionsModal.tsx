'use client'

import { useState } from 'react'
import { GameState } from '@/types/game'
import { countries } from '@/data/countries'
import * as gameActions from '@/utils/gameActions'

interface ActionsModalProps {
  gameState: GameState
  onAction: (result: any) => void
  onClose: () => void
}

type ActionCategory = 'economic' | 'domestic' | 'foreign' | null

export default function ActionsModal({ gameState, onAction, onClose }: ActionsModalProps) {
  const [category, setCategory] = useState<ActionCategory>(null)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  if (!category) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative game-panel p-6 max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-4">Choose Action Category</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setCategory('economic')}
              className="p-6 rounded-lg bg-green-500/10 border-2 border-green-500 hover:bg-green-500/20 transition-all"
            >
              <div className="text-4xl mb-2">💰</div>
              <div className="font-semibold">Economic</div>
              <div className="text-xs text-gray-400 mt-1">Rates, Taxes, Borrowing</div>
            </button>
            <button
              onClick={() => setCategory('domestic')}
              className="p-6 rounded-lg bg-blue-500/10 border-2 border-blue-500 hover:bg-blue-500/20 transition-all"
            >
              <div className="text-4xl mb-2">🏗️</div>
              <div className="font-semibold">Domestic</div>
              <div className="text-xs text-gray-400 mt-1">Sector Spending</div>
            </button>
            <button
              onClick={() => setCategory('foreign')}
              className="p-6 rounded-lg bg-purple-500/10 border-2 border-purple-500 hover:bg-purple-500/20 transition-all"
            >
              <div className="text-4xl mb-2">🌍</div>
              <div className="font-semibold">Foreign Policy</div>
              <div className="text-xs text-gray-400 mt-1">War, Alliances, Aid</div>
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 rounded bg-game-border hover:bg-game-accent transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative game-panel p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <button
          onClick={() => setCategory(null)}
          className="mb-4 text-sm text-gray-400 hover:text-white"
        >
          ← Back to Categories
        </button>

        {category === 'economic' && (
          <EconomicActions gameState={gameState} onAction={onAction} onClose={onClose} />
        )}
        {category === 'domestic' && (
          <DomesticActions gameState={gameState} onAction={onAction} onClose={onClose} />
        )}
        {category === 'foreign' && (
          <ForeignActions gameState={gameState} onAction={onAction} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

function EconomicActions({ gameState, onAction, onClose }: Omit<ActionsModalProps, 'gameState'> & { gameState: GameState }) {
  const [interestRate, setInterestRate] = useState(gameState.interestRate)
  const [printAmount, setPrintAmount] = useState(10)
  const [borrowAmount, setBorrowAmount] = useState(100)
  const [reserveAmount, setReserveAmount] = useState(10)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Economic Actions</h2>

      {/* Adjust Interest Rate */}
      <div className="game-panel bg-game-darker p-4">
        <h3 className="font-semibold mb-2">Adjust Interest Rate</h3>
        <p className="text-sm text-gray-400 mb-3">
          Current: {gameState.interestRate}% | High rate fights inflation but hurts growth
        </p>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full mb-2"
        />
        <div className="flex justify-between items-center">
          <span>{interestRate}%</span>
          <button
            onClick={() => {
              const result = gameActions.adjustInterestRate(gameState, interestRate)
              onAction(result)
              onClose()
            }}
            className="px-4 py-2 bg-game-accent rounded hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Print Money */}
      <div className="game-panel bg-game-darker p-4">
        <h3 className="font-semibold mb-2">Print Money</h3>
        <p className="text-sm text-gray-400 mb-3">
          Instant cash but causes inflation spike!
        </p>
        <input
          type="number"
          value={printAmount}
          onChange={(e) => setPrintAmount(Number(e.target.value))}
          className="w-full px-3 py-2 bg-game-dark border border-game-border rounded mb-2"
          placeholder="Amount (Billions)"
        />
        <button
          onClick={() => {
            const result = gameActions.printMoney(gameState, printAmount)
            onAction(result)
            onClose()
          }}
          className="w-full py-2 bg-yellow-600 rounded hover:bg-yellow-700"
        >
          Print ${printAmount}B
        </button>
      </div>

      {/* Borrow from IMF */}
      <div className="game-panel bg-game-darker p-4">
        <h3 className="font-semibold mb-2">Borrow from IMF</h3>
        <p className="text-sm text-gray-400 mb-3">
          Large loan at 4.5% interest. Monthly payments required!
        </p>
        <input
          type="number"
          value={borrowAmount}
          onChange={(e) => setBorrowAmount(Number(e.target.value))}
          className="w-full px-3 py-2 bg-game-dark border border-game-border rounded mb-2"
          placeholder="Amount (max 1000B)"
          max="1000"
        />
        <button
          onClick={() => {
            const result = gameActions.borrowFromIMF(gameState, borrowAmount)
            onAction(result)
            onClose()
          }}
          className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Borrow ${borrowAmount}B
        </button>
      </div>

      {/* Add to Reserves */}
      <div className="game-panel bg-game-darker p-4">
        <h3 className="font-semibold mb-2">Add to Emergency Reserves</h3>
        <p className="text-sm text-gray-400 mb-3">
          Treasury: ${gameState.treasury.toFixed(1)}B | Reserves: ${gameState.reserves.toFixed(1)}B
        </p>
        <input
          type="number"
          value={reserveAmount}
          onChange={(e) => setReserveAmount(Number(e.target.value))}
          className="w-full px-3 py-2 bg-game-dark border border-game-border rounded mb-2"
          placeholder="Amount"
          max={gameState.treasury}
        />
        <button
          onClick={() => {
            const result = gameActions.addToReserves(gameState, reserveAmount)
            onAction(result)
            onClose()
          }}
          className="w-full py-2 bg-green-600 rounded hover:bg-green-700"
        >
          Add ${reserveAmount}B to Reserves
        </button>
      </div>
    </div>
  )
}

function DomesticActions({ gameState, onAction, onClose }: Omit<ActionsModalProps, 'gameState'> & { gameState: GameState }) {
  const [selectedSector, setSelectedSector] = useState<keyof typeof gameState.sectorLevels>('infrastructure')
  const [spendAmount, setSpendAmount] = useState(10)

  const sectors: Array<{ key: keyof typeof gameState.sectorLevels; name: string; icon: string }> = [
    { key: 'health', name: 'Health', icon: '🏥' },
    { key: 'education', name: 'Education', icon: '🎓' },
    { key: 'military', name: 'Military', icon: '🪖' },
    { key: 'infrastructure', name: 'Infrastructure', icon: '🏗️' },
    { key: 'housing', name: 'Housing', icon: '🏘️' },
    { key: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { key: 'transportation', name: 'Transportation', icon: '🚇' },
    { key: 'security', name: 'Security & Justice', icon: '👮' },
    { key: 'tourism', name: 'Tourism', icon: '🏖️' },
    { key: 'sports', name: 'Sports', icon: '⚽' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Domestic Spending</h2>
      <p className="text-sm text-gray-400">
        Treasury: ${gameState.treasury.toFixed(1)}B available
      </p>

      <div className="grid grid-cols-2 gap-3">
        {sectors.map((sector) => (
          <button
            key={sector.key}
            onClick={() => setSelectedSector(sector.key)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedSector === sector.key
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-game-border bg-game-darker hover:border-blue-500/50'
            }`}
          >
            <div className="text-2xl mb-1">{sector.icon}</div>
            <div className="font-semibold text-sm">{sector.name}</div>
            <div className="text-xs text-gray-400">Level: {gameState.sectorLevels[sector.key].toFixed(0)}</div>
          </button>
        ))}
      </div>

      <div className="game-panel bg-game-darker p-4">
        <h3 className="font-semibold mb-2">Invest in {sectors.find(s => s.key === selectedSector)?.name}</h3>
        <input
          type="number"
          value={spendAmount}
          onChange={(e) => setSpendAmount(Number(e.target.value))}
          className="w-full px-3 py-2 bg-game-dark border border-game-border rounded mb-2"
          placeholder="Amount (Billions)"
          max={gameState.treasury}
        />
        <button
          onClick={() => {
            const result = gameActions.spendOnSector(gameState, selectedSector, spendAmount)
            onAction(result)
            onClose()
          }}
          className="w-full py-2 bg-game-accent rounded hover:bg-blue-600"
          disabled={spendAmount > gameState.treasury || spendAmount <= 0}
        >
          Invest ${spendAmount}B
        </button>
      </div>

      {/* Repress Uprising (only if uprising) */}
      {gameState.isUprising && (
        <div className="game-panel bg-red-500/20 border-2 border-red-500 p-4">
          <h3 className="font-semibold mb-2 text-red-400">⚠️ SUPPRESS UPRISING</h3>
          <p className="text-sm mb-3">
            Success Chance: {(gameState.militaryStrength * 0.4 + gameState.security * 0.6).toFixed(0)}%
          </p>
          <button
            onClick={() => {
              const result = gameActions.repressUprising(gameState)
              onAction(result)
              onClose()
            }}
            className="w-full py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Attempt Suppression
          </button>
        </div>
      )}
    </div>
  )
}

function ForeignActions({ gameState, onAction, onClose }: Omit<ActionsModalProps, 'gameState'> & { gameState: GameState }) {
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [aidAmount, setAidAmount] = useState(10)

  const otherCountries = countries.filter(c => c.id !== gameState.country.id)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Foreign Policy</h2>

      <div>
        <label className="text-sm text-gray-400 block mb-2">Select Country:</label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full px-3 py-2 bg-game-dark border border-game-border rounded"
        >
          <option value="">-- Choose Country --</option>
          {otherCountries.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCountry && (
        <div className="space-y-3">
          <button
            onClick={() => {
              const result = gameActions.declareWar(gameState, selectedCountry)
              onAction(result)
              onClose()
            }}
            className="w-full py-3 bg-red-600 rounded hover:bg-red-700"
            disabled={gameState.treasury < 50}
          >
            ⚔️ Declare War (Cost: $100B)
          </button>

          <button
            onClick={() => {
              const result = gameActions.imposeSanction(gameState, selectedCountry)
              onAction(result)
              onClose()
            }}
            className="w-full py-3 bg-orange-600 rounded hover:bg-orange-700"
          >
            🚫 Impose Sanctions
          </button>

          <button
            onClick={() => {
              const result = gameActions.proposeAlliance(gameState, selectedCountry)
              onAction(result)
              onClose()
            }}
            className="w-full py-3 bg-green-600 rounded hover:bg-green-700"
          >
            🤝 Propose Alliance
          </button>

          <div className="game-panel bg-game-darker p-4">
            <h3 className="font-semibold mb-2">Send Aid</h3>
            <input
              type="number"
              value={aidAmount}
              onChange={(e) => setAidAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-game-dark border border-game-border rounded mb-2"
              placeholder="Amount (Billions)"
              max={gameState.treasury}
            />
            <button
              onClick={() => {
                const result = gameActions.sendAid(gameState, selectedCountry, aidAmount)
                onAction(result)
                onClose()
              }}
              className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              🎁 Send ${aidAmount}B
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
