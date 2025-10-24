'use client'

import { GameEvent } from '@/types/game'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'

// Map emoji icons to Iconify icons
const emojiToIcon: Record<string, string> = {
  '🌍': 'game-icons:world',
  '⚠️': 'game-icons:warning-sign',
  '⚔️': 'game-icons:crossed-swords',
  '🛡️': 'game-icons:shield',
  '🎖️': 'game-icons:laurel-crown',
  '💀': 'game-icons:skull',
  '🏁': 'game-icons:checkered-flag',
  '🔥': 'game-icons:fire',
  '🤝': 'game-icons:handshake',
  '🚫': 'game-icons:cancel',
  '🎁': 'game-icons:present',
  '💰': 'game-icons:gold-bar',
  '📊': 'game-icons:chart',
  '🌪': 'game-icons:tornado',
  '🏳️': 'game-icons:white-flag',
  '❌': 'game-icons:cross-mark',
  '💡': 'game-icons:lightbulb-on',
}

function getIconComponent(iconStr: string | undefined) {
  if (!iconStr) return null

  // Check if it's an emoji and map to icon
  const iconName = emojiToIcon[iconStr] || emojiToIcon[iconStr.trim()]

  if (iconName) {
    return <Icon icon={iconName} className="text-xl flex-shrink-0" />
  }

  // Fallback to emoji if not found
  return <span className="text-lg flex-shrink-0">{iconStr}</span>
}

interface ChatStyleEventLogProps {
  events: GameEvent[]
}

export default function ChatStyleEventLog({ events }: ChatStyleEventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Track user scrolling to disable auto-scroll when they scroll up
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      // If the user scrolls near the bottom, enable auto-scroll
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100
      setAutoScroll(isNearBottom)
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    const el = scrollRef.current
    if (el && autoScroll) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [events, autoScroll])

  return (
    <div className="h-full flex flex-col bg-game-darker">
      <div className="p-4 border-b border-game-border">
        <h2 className="text-lg font-bold font-mono text-green-400">
          ◆ EVENT LOG ◆
        </h2>
        <p className="text-xs text-gray-500 font-mono">
          World events ← | Your actions →
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
      >
        {events.slice(-50).map((event) => {
          const isPlayer = event.type === 'player'
          const isCritical = event.type === 'critical'
          const isAdvice = event.type === 'advice'

          return (
            <div
              key={event.id}
              className={`flex ${
                isPlayer || isCritical
                  ? 'justify-end'
                  : isAdvice
                  ? 'justify-center'
                  : 'justify-start'
              } animate-slide-in`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg border-2 font-mono text-sm ${
                  isCritical
                    ? 'bg-red-500/20 border-red-500 animate-pulse'
                    : isPlayer
                    ? 'bg-blue-500/20 border-blue-500'
                    : isAdvice
                    ? 'bg-yellow-500/20 border-yellow-500 border-dashed'
                    : 'bg-gray-700/50 border-gray-600'
                }`}
              >
                <div
                  className={`flex items-start gap-2 ${
                    isPlayer ? 'flex-row-reverse text-right' : ''
                  }`}
                >
                  {event.icon && !isPlayer && !isAdvice && getIconComponent(event.icon)}
                  {isAdvice && getIconComponent('💡')}

                  <div className="flex-1">
                    <p
                      className={`text-xs ${
                        isCritical
                          ? 'text-red-300 font-bold'
                          : isPlayer
                          ? 'text-blue-300'
                          : isAdvice
                          ? 'text-yellow-200 font-semibold italic'
                          : 'text-gray-300'
                      }`}
                    >
                      {event.message}
                    </p>
                    <div className="mt-1 text-xs text-gray-500">
                      Day {event.day}
                    </div>
                  </div>

                  {event.icon && isPlayer && getIconComponent(event.icon)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
