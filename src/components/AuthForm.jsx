import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '🎙', text: 'AI-powered conversation practice' },
  { icon: '✅', text: 'Real-time grammar corrections' },
  { icon: '🔥', text: 'Daily streaks & progress tracking' },
  { icon: '📝', text: 'Vocabulary quiz challenges' },
]

export function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode]         = useState('signin')   // 'signin' | 'signup' | 'forgotpw'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const switchMode = (m) => { setMode(m); setError(null); setSuccess(false) }

  const handle = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'forgotpw') {
      const { error } = await resetPassword(email)
      setLoading(false)
      if (error) setError(error.message)
      else setSuccess(true)
      return
    }

    const fn = mode === 'signin' ? signIn : signUp
    const { error } = await fn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else if (mode === 'signup') setSuccess(true)
  }

  // ── Success screens ──────────────────────────────────────────────────────
  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center', padding: '40px 32px', background: 'var(--bg-card)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 24, maxWidth: 360, boxShadow: 'var(--shadow-elevated)' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>✉️</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
          {mode === 'forgotpw' ? 'Reset link sent' : 'Check your inbox'}
        </div>
        <div style={{ fontSize: 14, marginTop: 8, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {mode === 'forgotpw'
            ? 'Check your email for a link to reset your password.'
            : 'Confirm your email to start practising.'}
        </div>
        <button
          onClick={() => switchMode('signin')}
          style={{
            marginTop: 20, padding: '10px 24px', borderRadius: 10,
            border: '1px solid rgba(20,184,166,0.3)', background: 'transparent',
            color: '#14b8a6', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}
        >
          Back to sign in
        </button>
      </div>
    </div>
  )

  const isForgot = mode === 'forgotpw'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)', transition: 'background 0.3s ease' }}>
      <style>{`
        @media (max-width: 820px) {
          .fl-auth-left { display: none !important; }
          .fl-auth-right { flex: 1 !important; align-items: flex-start !important; padding-top: 48px !important; }
          .fl-auth-logo { display: flex !important; }
        }
        .fl-input:focus { border-color: #14b8a6 !important; box-shadow: 0 0 0 3px rgba(20,184,166,0.12) !important; }
      `}</style>

      {/* ── Left branding panel (unchanged) ── */}
      <div className="fl-auth-left" style={{
        flex: '0 0 44%',
        background: 'linear-gradient(145deg, #060612 0%, #0a1628 50%, #060f14 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 52px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
            <span style={{ fontSize: 26 }}>🗣️</span>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #14b8a6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fluento</span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#eeeef8', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 16 }}>
            Speak English<br/>with confidence.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(180,180,220,0.6)', lineHeight: 1.75, marginBottom: 44 }}>
            Practice with an AI tutor that corrects your grammar, tracks your progress, and keeps you coming back.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 52 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{f.icon}</div>
                <span style={{ fontSize: 14, color: 'rgba(190,190,230,0.8)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 13 }}>⭐</span>)}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(180,180,220,0.65)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
              "My confidence improved so much after two weeks. The corrections feel encouraging, not embarrassing."
            </p>
            <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(180,180,220,0.35)', fontWeight: 600 }}>— Ana, Brazil</div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="fl-auth-right" style={{
        flex: '0 0 56%',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '48px 24px',
        background: 'var(--bg-base)', transition: 'background 0.3s ease',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile-only logo */}
          <div className="fl-auth-logo" style={{ display: 'none', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <span style={{ fontSize: 24 }}>🗣️</span>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #14b8a6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fluento</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
              {isForgot ? 'Reset your password' : mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {isForgot
                ? "Enter your email and we'll send a reset link."
                : mode === 'signin'
                  ? 'Keep your streak alive and keep improving.'
                  : "Start your English journey today — it's free."}
            </p>
          </div>

          {/* Sign in / Sign up toggle — hidden in forgotpw mode */}
          {!isForgot && (
            <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
              {['signin', 'signup'].map(m => (
                <button key={m} onClick={() => switchMode(m)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s ease',
                  background: mode === m ? '#14b8a6' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 2px 8px rgba(20,184,166,0.3)' : 'none',
                }}>
                  {m === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email — always shown */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Email
              </label>
              <input
                className="fl-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1.5px solid var(--border-input)',
                  background: 'var(--bg-input)', fontSize: 14,
                  color: 'var(--text-primary)', outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>

            {/* Password — hidden in forgotpw mode */}
            {!isForgot && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Password
                  </label>
                  {/* Forgot password link — only in signin mode */}
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgotpw')}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: '#14b8a6', fontWeight: 600, padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  className="fl-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1.5px solid var(--border-input)',
                    background: 'var(--bg-input)', fontSize: 14,
                    color: 'var(--text-primary)', outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                />
              </div>
            )}

            {error && (
              <div style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '11px 14px', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '13px 0', marginTop: 4, borderRadius: 12, border: 'none',
              background: loading ? 'var(--bg-card)' : 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: loading ? 'var(--text-muted)' : 'white',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : 'var(--shadow-btn)',
              transition: 'all 0.2s ease',
            }}>
              {loading
                ? 'Please wait…'
                : isForgot
                  ? 'Send reset link →'
                  : mode === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>

            {/* Back link in forgotpw mode */}
            {isForgot && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: 'var(--text-muted)', fontWeight: 500,
                  textAlign: 'center', padding: '4px 0',
                }}
              >
                ← Back to sign in
              </button>
            )}
          </form>

          <div style={{ marginTop: 28, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
            🔒 Secured with Supabase Auth
          </div>
        </div>
      </div>
    </div>
  )
}