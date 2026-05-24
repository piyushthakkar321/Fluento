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

const TABS = [
  { key: 'tutor',     label: '🎙 Practice'   },
  { key: 'dashboard', label: '📊 Progress'   },
  { key: 'quiz',      label: '📝 Vocab Quiz' },
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