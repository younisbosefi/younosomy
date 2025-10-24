'use client'

import { GameEvent } from '@/types/game'
import { useEffect, useRef } from 'react'

interface ChatStyleEventLogProps {
  events: GameEvent[]
}

export default function ChatStyleEventLog({ events }: ChatStyleEventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [events])

  return (
    <div className="h-full flex flex-col bg-game-darker">
      <div className="p-4 border-b border-game-border">
        <h2 className="text-lg font-bold font-mono text-green-400">◆ EVENT LOG ◆</h2>
        <p className="text-xs text-gray-500 font-mono">World events ← | Your actions →</p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
      >
        {events.slice(-50).map((event) => (
          <div
            key={event.id}
            className={`flex ${
              event.type === 'player' || event.type === 'critical'
                ? 'justify-end'
                : event.type === 'advice'
                ? 'justify-center'
                : 'justify-start'
            } animate-slide-in`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-lg border-2 font-mono text-sm ${
                event.type === 'critical'
                  ? 'bg-red-500/20 border-red-500 animate-pulse'
                  : event.type === 'player'
                  ? 'bg-blue-500/20 border-blue-500 text-right'
                  : event.type === 'advice'
                  ? 'bg-yellow-500/20 border-yellow-500 border-dashed'
                  : 'bg-gray-700/50 border-gray-600'
              }`}
            >
              <div className="flex items-start gap-2">
                {event.icon && event.type !== 'player' && event.type !== 'advice' && (
                  <span className="text-lg">{event.icon}</span>
                )}
                {event.type === 'advice' && (
                  <span className="text-lg">💡</span>
                )}
                <div className="flex-1">
                  <p className={`text-xs ${
                    event.type === 'critical'
                      ? 'text-red-300 font-bold'
                      : event.type === 'player'
                      ? 'text-blue-300'
                      : event.type === 'advice'
                      ? 'text-yellow-200 font-semibold italic'
                      : 'text-gray-300'
                  }`}>
                    {event.message}
                  </p>
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">Day {event.day}</span>
                  </div>
                </div>
                {event.icon && event.type === 'player' && (
                  <span className="text-lg">{event.icon}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
