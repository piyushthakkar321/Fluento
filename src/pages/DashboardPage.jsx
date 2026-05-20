import { useEffect, useState, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getStreak, getRecentSessions } from '../lib/sessionApi'
import { useAuth } from '../context/AuthContext'

function ShareModal({ sessions, streak, onClose }) {
  const [copied, setCopied] = useState(false)

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
    : 0

  const scoreColor = avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#14b8a6' : '#f59e0b'

  const copyText = () => {
    const lines = [
      `🗣️ My Fluento Progress`,
      ``,
      `📊 Sessions completed: ${sessions.length}`,
      `⭐ Average score: ${avgScore}/100`,
      `🔥 Current streak: ${streak?.current_streak ?? 0} days`,
      `🏆 Longest streak: ${streak?.longest_streak ?? 0} days`,
      ``,
      `Practising English with Fluento AI Tutor`,
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(6px)',
      animation: 'smFadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', maxWidth: 380, width: '100%' }}>
        <div style={{
          width: '100%',
          background: 'linear-gradient(145deg, #0d0d20, #111128)',
          border: '1px solid rgba(20,184,166,0.25)',
          borderRadius: 24, padding: '32px 28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.12), transparent 70%)' }}/>
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)' }}/>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <span style={{ fontSize: 26 }}>🗣️</span>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #14b8a6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fluento</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '💬', label: 'Sessions',      value: sessions.length },
              { icon: '⭐', label: 'Avg Score',      value: `${avgScore}/100`, color: scoreColor },
              { icon: '🔥', label: 'Current Streak', value: `${streak?.current_streak ?? 0}d`, color: streak?.current_streak >= 3 ? '#fb923c' : undefined },
              { icon: '🏆', label: 'Longest Streak', value: `${streak?.longest_streak ?? 0}d` },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color || '#eeeef5', marginTop: 6, letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#5a5a78', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#5a5a78', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Average accuracy</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor }}>{avgScore}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${avgScore}%`, background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})`, borderRadius: 99 }}/>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#3a3a58', textAlign: 'center' }}>Practising English with Fluento AI</div>
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={copyText} style={{
            flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
            background: copied ? '#10b981' : 'linear-gradient(135deg, #14b8a6, #0d9488)',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {copied ? '✓ Copied!' : '📋 Copy stats'}
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#9898b8',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Close</button>
        </div>
        <p style={{ fontSize: 11, color: '#3a3a58', textAlign: 'center' }}>Screenshot the card above to share on social media</p>
      </div>
      <style>{`@keyframes smFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </div>
  )
}

export function DashboardPage() {
  const { user }                  = useAuth()
  const [streak, setStreak]       = useState(null)
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([getStreak(user.id), getRecentSessions(user.id, 20)])
      .then(([s, sess]) => { setStreak(s); setSessions(sess); setLoading(false) })
  }, [user])

  // ── Chart fix: use session number as label, store date in tooltip only ──
  const chartData = [...sessions]
    .reverse()
    .map((s, i) => ({
      label: `#${i + 1}`,
      score: s.score,
      date:  new Date(s.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    }))

  const avgScore  = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
    : 0
  const avgColor  = avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#14b8a6' : '#f59e0b'

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 14 }}>
      Loading…
    </div>
  )

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '48px 20px 80px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {showShare && <ShareModal sessions={sessions} streak={streak} onClose={() => setShowShare(false)}/>}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Your progress</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Keep practising daily to improve your score.</p>
        </div>
        {sessions.length > 0 && (
          <button onClick={() => setShowShare(true)} style={{
            padding: '9px 16px', borderRadius: 12,
            background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
            border: 'none', color: 'white',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(20,184,166,0.25)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            🔗 Share progress
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <StatCard label="Total sessions" value={sessions.length}                    icon="💬"/>
        <StatCard label="Current streak" value={`${streak?.current_streak ?? 0}d`}  icon="🔥" highlight={streak?.current_streak >= 3}/>
        <StatCard label="Longest streak" value={`${streak?.longest_streak ?? 0}d`}  icon="🏆"/>
      </div>

      {sessions.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', transition: 'background 0.25s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Average score</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: avgColor }}>
              {avgScore}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>/100</span>
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${avgScore}%`, borderRadius: 99, background: `linear-gradient(90deg, ${avgColor}99, ${avgColor})`, transition: 'width 0.8s ease' }}/>
          </div>
        </div>
      )}

      {chartData.length > 1 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 16px 16px', transition: 'background 0.25s ease' }}>
          <p style={{ margin: '0 0 20px 10px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Score history
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#14b8a6"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false}/>

              {/* ── Fixed: use label (#1, #2…) not date ── */}
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={28}/>

              {/* Show date + score in tooltip */}
              <Tooltip
                contentStyle={{ background: 'var(--bg-tooltip)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13 }}
                formatter={(val) => [`${val}/100`, 'Score']}
                labelFormatter={(label, payload) => {
                  const date = payload?.[0]?.payload?.date
                  return date ? `${label} · ${date}` : label
                }}
                cursor={{ stroke: 'var(--border-hover)' }}
              />
              <Line
                type="monotone" dataKey="score"
                stroke="url(#lineGrad)" strokeWidth={2.5}
                dot={{ r: 4, fill: '#14b8a6', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#14b8a6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Complete at least 2 sessions to see your score chart.
        </div>
      )}

      {sessions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Recent sessions
          </p>
          {sessions.slice(0, 5).map(s => {
            const feedback = (() => { try { return JSON.parse(s.ai_feedback) } catch { return null } })()
            return (
              <div key={s.id}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color 0.15s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <ScorePill score={s.score}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.transcript}
                  </p>
                  {feedback?.corrections?.length > 0 && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      {feedback.corrections.length} correction{feedback.corrections.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {new Date(s.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, highlight = false }) {
  return (
    <div style={{
      background: highlight ? 'rgba(234,88,12,0.07)' : 'var(--bg-card)',
      border: `1px solid ${highlight ? 'rgba(234,88,12,0.25)' : 'var(--border)'}`,
      borderRadius: 16, padding: '18px 16px',
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'background 0.25s ease',
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: highlight ? '#fb923c' : 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3 }}>{label}</span>
    </div>
  )
}

function ScorePill({ score }) {
  const [bg, color] =
    score >= 80 ? ['rgba(16,185,129,0.1)', '#10b981']
    : score >= 60 ? ['rgba(20,184,166,0.1)', '#14b8a6']
    : ['rgba(245,158,11,0.1)', '#f59e0b']
  return (
    <div style={{ background: bg, color, fontSize: 13, fontWeight: 700, padding: '4px 11px', borderRadius: 99, flexShrink: 0, border: `1px solid ${color}33` }}>
      {score}
    </div>
  )
}