import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fn = mode === 'signin' ? signIn : signUp
    const { error } = await fn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else if (mode === 'signup') setSuccess(true)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center', padding: '40px 32px', background: 'var(--bg-card)', border: '1px solid rgba(20,184,166,0.25)', borderRadius: 20, maxWidth: 360, boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>✉️</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Check your inbox</div>
        <div style={{ fontSize: 14, marginTop: 8, color: 'var(--text-muted)', lineHeight: 1.6 }}>Confirm your email to start practising.</div>
        <button onClick={() => { setSuccess(false); setMode('signin') }} style={{
          marginTop: 20, padding: '10px 22px', borderRadius: 10,
          border: '1px solid rgba(20,184,166,0.3)', background: 'transparent',
          color: '#14b8a6', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}>
          Back to sign in
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', transition: 'background 0.25s ease' }}>
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 400,
        background: 'var(--bg-card)',
        borderRadius: 24, padding: '36px 32px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        position: 'relative', transition: 'background 0.25s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗣️</div>
          <div style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Fluento
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
            {mode === 'signin' ? 'Welcome back — keep your streak alive' : 'Start your English journey today'}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-toggle)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
          {['signin', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null) }} style={{
              flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: mode === m ? '#14b8a6' : 'transparent',
              color: mode === m ? 'white' : 'var(--text-muted)',
            }}>
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Email',    type: 'email',    value: email,    set: setEmail,    placeholder: 'you@example.com' },
            { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: '••••••••' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                required
                minLength={f.type === 'password' ? 6 : undefined}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1px solid var(--border-input)',
                  background: 'var(--bg-input)', fontSize: 14,
                  color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#14b8a6'}
                onBlur={e  => e.target.style.borderColor = 'var(--border-input)'}
              />
            </div>
          ))}

          {error && (
            <div style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '13px 0', marginTop: 4, borderRadius: 12, border: 'none',
            background: loading ? 'var(--bg-toggle)' : 'linear-gradient(135deg, #14b8a6, #0d9488)',
            color: loading ? 'var(--text-muted)' : 'white',
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : 'var(--shadow-btn)',
            transition: 'all 0.15s',
          }}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
          🔒 Secured by Supabase Auth
        </div>
      </div>
    </div>
  )
}