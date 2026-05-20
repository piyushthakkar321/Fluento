import { useEffect, useState } from 'react'
import { getStreak } from '../lib/sessionApi'

export function StreakBadge({ userId }) {
  const [streak, setStreak] = useState(null)

  useEffect(() => {
    if (userId) getStreak(userId).then(setStreak)
  }, [userId])

  if (!streak) return null

  const { current_streak, longest_streak } = streak
  const isHot = current_streak >= 3

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: isHot ? 'rgba(234,88,12,0.1)' : 'var(--bg-card)',
        border: `1px solid ${isHot ? 'rgba(234,88,12,0.3)' : 'var(--border)'}`,
        borderRadius: 99, padding: '5px 14px', transition: 'background 0.25s ease',
      }}>
        <span style={{ fontSize: 16 }}>{isHot ? '🔥' : '💬'}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: isHot ? '#fb923c' : 'var(--text-secondary)' }}>
          {current_streak}
        </span>
        <span style={{ fontSize: 12, color: isHot ? '#ea580c' : 'var(--text-muted)' }}>
          day{current_streak !== 1 ? 's' : ''}
        </span>
      </div>
      {longest_streak > 0 && (
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Best: {longest_streak}</span>
      )}
    </div>
  )
}