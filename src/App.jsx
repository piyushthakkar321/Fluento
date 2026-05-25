import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthForm } from './components/AuthForm'
import { TutorPage } from './pages/TutorPage'
import { DashboardPage } from './pages/DashboardPage'
import { VocabQuizPage } from './pages/VocabQuizPage'
import { StreakBadge } from './components/StreakBadge'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>     <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/> <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} style={{
      width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      color: 'var(--text-muted)', transition: 'all 0.2s ease', flexShrink: 0,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {theme === 'dark' ? <SunIcon/> : <MoonIcon/>}
    </button>
  )
}

// ── Name setup screen (shown once after signup) ────────────────────────────
function NameSetupScreen() {
  const { updateUserName } = useAuth()
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handle = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    const { error } = await updateUserName(trimmed)
    if (error) { setError(error.message); setLoading(false) }
    // On success, onAuthStateChange fires → user_metadata.name is set → Root re-renders automatically
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '32px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>👋</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 10 }}>
          What should we call you?
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.6 }}>
          We'll use your name to personalise your experience.
        </p>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            placeholder="Your first name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
            style={{
              width: '100%', padding: '17px 18px', borderRadius: 16,
              border: '1.5px solid var(--border-input)',
              background: 'var(--bg-input)', fontSize: 19,
              color: 'var(--text-primary)', outline: 'none',
              textAlign: 'center', fontWeight: 700,
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border-input)'}
          />

          {error && (
            <div style={{ fontSize: 13, color: '#f87171', padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !name.trim()} style={{
            padding: '17px 0', borderRadius: 16, border: 'none', minHeight: 58,
            background: name.trim() ? 'var(--accent)' : 'var(--track)',
            color: name.trim() ? '#fff' : 'var(--text-muted)',
            fontSize: 17, fontWeight: 700,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            boxShadow: name.trim() ? '0 6px 24px rgba(20,184,166,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}>
            {loading ? 'Saving…' : "Let's go! →"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Profile button + dropdown ──────────────────────────────────────────────
function ProfileButton({ user }) {
  const { signOut }             = useAuth()
  const { theme, toggle }       = useTheme()
  const [open, setOpen]         = useState(false)

  const name    = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const initial = name[0].toUpperCase()

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 800,
        }}
      >
        {initial}
      </button>

      {open && (
        <>
          {/* Dismiss backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 149 }}
          />

          {/* Dropdown */}
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 18, padding: 8, minWidth: 210, zIndex: 150,
            boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
          }}>
            {/* User info */}
            <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => { toggle(); setOpen(false) }}
              style={{
                width: '100%', minHeight: 46, padding: '0 14px', borderRadius: 11,
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 14, color: 'var(--text-body)',
                fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            {/* Sign out */}
            <button
              onClick={() => { signOut(); setOpen(false) }}
              style={{
                width: '100%', minHeight: 46, padding: '0 14px', borderRadius: 11,
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 14, color: '#f87171',
                fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const TABS = [
  { key: 'tutor',     label: 'Practice', Icon: MicIcon   },
  { key: 'dashboard', label: 'Progress', Icon: ChartIcon },
  { key: 'quiz',      label: 'Quiz',     Icon: BookIcon  },
]

function Root() {
  const { user, signOut }         = useAuth()
  const [tab, setTab]             = useState('tutor')
  const [streakKey, setStreakKey] = useState(0)

  if (!user) return <AuthForm/>

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 2,
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'background 0.3s ease',
      }}>
        {/* Logo */}
        <span style={{
          fontWeight: 800, fontSize: 18,
          marginRight: 18, padding: '16px 0',
          background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px', flexShrink: 0,
        }}>Fluento</span>

        {/* Tabs */}
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0 14px', height: 56,
            background: 'none', border: 'none',
            borderBottom: `2.5px solid ${tab === t.key ? 'var(--nav-active)' : 'transparent'}`,
            cursor: 'pointer', fontSize: 13,
            fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? 'var(--nav-active)' : 'var(--nav-text)',
            transition: 'color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
            opacity: tab === t.key ? 1 : 0.75,
            whiteSpace: 'nowrap', letterSpacing: '-0.01em',
          }}>{t.label}</button>
        ))}

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <StreakBadge key={streakKey} userId={user.id}/>
          <ThemeToggle/>
          <button onClick={signOut} style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 9, padding: '7px 14px',
            fontSize: 13, color: 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s ease',
            fontWeight: 500,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >Sign out</button>
        </div>
      </nav>

      {tab === 'tutor'     && <TutorPage onSessionSaved={() => setStreakKey(k => k + 1)}/>}
      {tab === 'dashboard' && <DashboardPage/>}
      {tab === 'quiz'      && <VocabQuizPage/>}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root/>
      </AuthProvider>
    </ThemeProvider>
  )
}