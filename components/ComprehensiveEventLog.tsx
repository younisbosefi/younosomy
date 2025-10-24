'use client'

import { GameEvent } from '@/types/game'
import { useEffect, useRef } from 'react'

interface ComprehensiveEventLogProps {
  events: GameEvent[]
}

export default function ComprehensiveEventLog({ events }: ComprehensiveEventLogProps) {
  const worldEvents = events.filter(e => e.type === 'world').slice(-20)
  const playerEvents = events.filter(e => e.type === 'player' || e.type === 'critical').slice(-20)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-game-border">
        <h2 className="text-lg font-bold">Events Log</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Critical Events - Always on top */}
        {playerEvents.filter(e => e.type === 'critical').length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">🔥 CRITICAL</h3>
            <div className="space-y-2">
              {playerEvents.filter(e => e.type === 'critical').reverse().map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Player Actions */}
        <div>
          <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">📋 YOUR ACTIONS</h3>
          <div className="space-y-2">
            {playerEvents.filter(e => e.type === 'player').reverse().map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* World Events */}
        <div>
          <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">🌍 WORLD EVENTS</h3>
          <div className="space-y-2">
            {worldEvents.reverse().map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event }: { event: GameEvent }) {
  const bgColor = event.type === 'critical'
    ? 'bg-red-500/10 border-red-500/30'
    : event.type === 'player'
    ? 'bg-green-500/5 border-green-500/20'
    : 'bg-blue-500/5 border-blue-500/20'

  return (
    <div className={`game-panel ${bgColor} p-3`}>
      <div className="flex items-start gap-2">
        {event.icon && (
          <span className="text-lg">{event.icon}</span>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-300">{event.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              Day {event.day}
            </span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">
              {event.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
