import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { getStreak, getRecentSessions } from '../lib/sessionApi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ─── Share modal ───────────────────────────────────────────────────────────────
function ShareModal({ sessions, streak, onClose }) {
  const [copied, setCopied] = useState(false)

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length)
    : 0

  const scoreColor = avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#14b8a6' : '#f59e0b'

  const copyText = () => {
    navigator.clipboard.writeText([
      '🗣️ My Fluento Progress',
      '',
      `📊 Sessions: ${sessions.length}`,
      `⭐ Average score: ${avgScore}/100`,
      `🔥 Current streak: ${streak?.current_streak ?? 0} days`,
      `🏆 Longest streak: ${streak?.longest_streak ?? 0} days`,
      '',
      'Practising English with Fluento AI Tutor',
    ].join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', maxWidth: 380, width: '100%' }}>

        {/* Card */}
        <div style={{
          width: '100%', background: 'linear-gradient(145deg, #0d0d20, #111128)',
          border: '1px solid rgba(20,184,166,0.25)', borderRadius: 24, padding: '32px 28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.12), transparent 70%)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: 26 }}>🗣️</span>
            <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #14b8a6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fluento</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { icon: '💬', label: 'Sessions',      value: sessions.length },
              { icon: '⭐', label: 'Avg Score',      value: `${avgScore}/100`, color: scoreColor },
              { icon: '🔥', label: 'Current Streak', value: `${streak?.current_streak ?? 0}d`, color: (streak?.current_streak ?? 0) >= 3 ? '#fb923c' : undefined },
              { icon: '🏆', label: 'Best Streak',    value: `${streak?.longest_streak ?? 0}d` },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color || '#eeeef5', marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#5a5a78', marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: '#5a5a78', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg accuracy</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{avgScore}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${avgScore}%`, background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})`, borderRadius: 99 }}/>
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#3a3a58', textAlign: 'center' }}>Practising English with Fluento AI</div>
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={copyText} style={{
            flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
            background: copied ? '#10b981' : 'linear-gradient(135deg, #14b8a6, #0d9488)',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            {copied ? '✓ Copied!' : '📋 Copy stats'}
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: '#9898b8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function EmptyState({ onNavigateToPractice }) {
  return (
    <div style={{ padding: '40px 24px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🗣️</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 8 }}>
        Start your journey
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 300, margin: '0 auto 36px' }}>
        Complete your first session to see your progress, scores, and streaks here.
      </p>

      {/* Onboarding steps */}
      <div style={{ textAlign: 'left', marginBottom: 36 }}>
        {[
          { step: '1', icon: '🎙', title: 'Tap the mic', desc: 'Go to Practice and start speaking — any topic is fine.' },
          { step: '2', icon: '✅', title: 'Get corrections', desc: 'Fluento corrects your grammar and gives a score.' },
          { step: '3', icon: '📊', title: 'Track progress', desc: 'See your score chart and streak build over time.' },
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: 22, alignItems: 'flex-start' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-dim)', border: '2px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: 'var(--accent)',
            }}>{s.step}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                {s.icon} {s.title}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onNavigateToPractice} style={{
        width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
        background: 'var(--accent)', color: '#fff',
        fontSize: 16, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(20,184,166,0.35)',
      }}>
        Start your first session →
      </button>
    </div>
  )
}

export function DashboardPage({ onNavigateToPractice }) {
  const { user }                  = useAuth()
  const [streak, setStreak]       = useState(null)
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showShare, setShowShare] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()
  const { signOut } = useAuth()

  useEffect(() => {
    if (!user) return
    Promise.all([getStreak(user.id), getRecentSessions(user.id, 20)])
      .then(([s, sess]) => { setStreak(s); setSessions(sess); setLoading(false) })
  }, [user])

  // ── Chart data: each session gets its own number label ──
  const chartData = [...sessions]
    .reverse()
    .map((s, i) => ({
      label: `S${i + 1}`,                   // x-axis: S1, S2, S3…
      fullLabel: `Session ${i + 1}`,         // shown in tooltip
      score: s.score,
      date: new Date(s.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    }))

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((s, x) => s + x.score, 0) / sessions.length)
    : 0
  const avgColor = avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#14b8a6' : '#f59e0b'

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 14 }}>Loading…</div>
  )

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '48px 20px 80px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {showShare && <ShareModal sessions={sessions} streak={streak} onClose={() => setShowShare(false)}/>}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Your progress</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16,
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {/* Sign out */}
          <button onClick={signOut} style={{
            height: 38, padding: '0 14px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-card)', fontSize: 13, fontWeight: 600,
            color: 'var(--text-muted)', cursor: 'pointer',
          }}>Sign out</button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && sessions.length === 0 && <EmptyState onNavigateToPractice={onNavigateToPractice}/>}

      {sessions.length > 0 && (
        <button onClick={() => setShowShare(true)} style={{
          width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, var(--accent), #6366f1)',
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(20,184,166,0.3)',
        }}>🔗 Share my progress</button>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <StatCard label="Total sessions" value={sessions.length}                    icon="💬"/>
        <StatCard label="Current streak" value={`${streak?.current_streak ?? 0}d`}  icon="🔥" highlight={(streak?.current_streak ?? 0) >= 3}/>
        <StatCard label="Longest streak" value={`${streak?.longest_streak ?? 0}d`}  icon="🏆"/>
      </div>

      {/* Avg score bar */}
      {sessions.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
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

      {/* Score chart */}
      {chartData.length > 1 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 12px 16px' }}>
          <p style={{ margin: '0 0 20px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Score history
          </p>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#14b8a6"/>
                </linearGradient>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#14b8a6" stopOpacity="0.2"/>
                  <stop offset="75%"  stopColor="#14b8a6" stopOpacity="0.03"/>
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false}/>

              {/* Each point gets its own Session N label */}
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={chartData.length <= 10 ? 0 : Math.ceil(chartData.length / 10) - 1}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-tooltip)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
                formatter={(val) => [`${val}/100`, 'Score']}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload
                  return p ? `${p.fullLabel} · ${p.date}` : ''
                }}
                cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="url(#chartGrad)"
                strokeWidth={2.5}
                fill="url(#areaFill)"
                dot={{ r: 3.5, fill: '#14b8a6', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#14b8a6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Complete at least 2 sessions to see your score chart.
        </div>
      )}

      {/* Recent sessions */}
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
    </div>
  )
}

function StatCard({ label, value, icon, highlight = false }) {
  return (
    <div style={{
      background: highlight
        ? 'linear-gradient(145deg, rgba(234,88,12,0.09) 0%, rgba(234,88,12,0.04) 100%)'
        : 'linear-gradient(145deg, var(--bg-card) 0%, rgba(20,184,166,0.03) 100%)',
      border: `1px solid ${highlight ? 'rgba(234,88,12,0.22)' : 'var(--border)'}`,
      borderRadius: 18, padding: '20px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: 'var(--shadow-card)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: highlight ? '#fb923c' : 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
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