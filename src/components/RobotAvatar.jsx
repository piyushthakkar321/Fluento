import { useState, useEffect, useRef } from 'react'

export function RobotAvatar({ tutorState, response }) {
  const [mouthOpen, setMouthOpen] = useState(false)
  const [blink, setBlink]         = useState(false)
  const mouthRef = useRef(null)
  const blinkRef = useRef(null)

  const isIdle      = tutorState === 'idle'
  const isListening = tutorState === 'listening'
  const isSpeaking  = tutorState === 'speaking'
  const isThinking  = tutorState === 'thinking'

  // Mouth flap while speaking
  useEffect(() => {
    clearInterval(mouthRef.current)
    if (!isSpeaking) { setMouthOpen(false); return }
    mouthRef.current = setInterval(() => setMouthOpen(v => !v), 280)
    return () => clearInterval(mouthRef.current)
  }, [isSpeaking])

  // Random blink when idle
  useEffect(() => {
    const schedule = () => {
      blinkRef.current = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 130)
      }, 2200 + Math.random() * 2400)
    }
    if (isIdle) schedule()
    return () => clearTimeout(blinkRef.current)
  }, [isIdle])

  const eyeColor     = isListening ? '#ff5f5f' : '#00d8ff'
  const eyeGlowRgb   = isListening ? '255,95,95' : '0,216,255'
  const statusColor  = isListening ? '#ff5f5f' : isSpeaking ? '#14b8a6' : isThinking ? '#f59e0b' : '#6366f1'
  const statusLabel  = isListening ? '🎙 Listening…' : isSpeaking ? '💬 Speaking…' : isThinking ? '🧠 Thinking…' : '● Ready'

  // ── Eyes ───────────────────────────────────────────────────────────────────
  const Eyes = () => {
    if (blink) return (
      <>
        <rect x="62" y="89" width="24" height="4" rx="2" fill={eyeColor}/>
        <rect x="114" y="89" width="24" height="4" rx="2" fill={eyeColor}/>
      </>
    )
    if (isThinking) return (
      <>
        {/* Half-closed squint */}
        <ellipse cx="74" cy="92" rx="12" ry="8"  fill={eyeColor} filter="url(#eGlow)"/>
        <ellipse cx="126" cy="92" rx="12" ry="8" fill={eyeColor} filter="url(#eGlow)"/>
        {/* Top eyelid cover */}
        <rect x="62" y="84" width="24" height="7" rx="2" fill="#050f1e"/>
        <rect x="114" y="84" width="24" height="7" rx="2" fill="#050f1e"/>
        <circle cx="69" cy="91" r="3" fill="white" opacity="0.55"/>
        <circle cx="121" cy="91" r="3" fill="white" opacity="0.55"/>
      </>
    )
    if (isSpeaking) return (
      <>
        {/* Happy ^ ^ arcs */}
        <path d="M61 97 Q74 80 87 97" stroke={eyeColor} strokeWidth="5.5" fill="none"
          strokeLinecap="round" filter="url(#eGlow)"/>
        <path d="M113 97 Q126 80 139 97" stroke={eyeColor} strokeWidth="5.5" fill="none"
          strokeLinecap="round" filter="url(#eGlow)"/>
      </>
    )
    if (isListening) return (
      <>
        {/* Alert wide eyes with outer ring */}
        <circle cx="74" cy="92" r="17" fill="none" stroke={eyeColor} strokeWidth="1"
          opacity="0.35" filter="url(#eGlow)"/>
        <circle cx="74" cy="92" r="13" fill={eyeColor} filter="url(#eGlow)"/>
        <circle cx="68" cy="86" r="4.5" fill="white" opacity="0.7"/>
        <circle cx="74" cy="92" r="4.5" fill="rgba(100,0,0,0.25)"/>

        <circle cx="126" cy="92" r="17" fill="none" stroke={eyeColor} strokeWidth="1"
          opacity="0.35" filter="url(#eGlow)"/>
        <circle cx="126" cy="92" r="13" fill={eyeColor} filter="url(#eGlow)"/>
        <circle cx="120" cy="86" r="4.5" fill="white" opacity="0.7"/>
        <circle cx="126" cy="92" r="4.5" fill="rgba(100,0,0,0.25)"/>
      </>
    )
    // Idle — round glowing dots
    return (
      <>
        <circle cx="74"  cy="92" r="12" fill={eyeColor} filter="url(#eGlow)"/>
        <circle cx="126" cy="92" r="12" fill={eyeColor} filter="url(#eGlow)"/>
        <circle cx="68"  cy="86" r="4"  fill="white" opacity="0.7"/>
        <circle cx="120" cy="86" r="4"  fill="white" opacity="0.7"/>
        <circle cx="74"  cy="92" r="4"  fill="rgba(0,60,80,0.3)"/>
        <circle cx="126" cy="92" r="4"  fill="rgba(0,60,80,0.3)"/>
      </>
    )
  }

  // ── Mouth ──────────────────────────────────────────────────────────────────
  const Mouth = () => {
    if (isThinking) return (
      <>
        {[0,1,2].map(i => (
          <circle key={i} cx={88 + i * 12} cy="122" r="4"
            fill={eyeColor} opacity="0.9"
            style={{ animation: 'thinkDot 1.1s ease-in-out infinite', animationDelay: `${i * 0.27}s` }}/>
        ))}
      </>
    )
    if (isListening) return (
      <ellipse cx="100" cy="122" rx="9" ry="8"
        fill="#030d1c" stroke={eyeColor} strokeWidth="2" filter="url(#eGlow)"/>
    )
    if (isSpeaking) return (
      <ellipse cx="100" cy="122" rx="18" ry={mouthOpen ? 13 : 6}
        fill="#030d1c" stroke={eyeColor} strokeWidth="2"
        style={{ transition: 'ry 0.15s ease' }} filter="url(#eGlow)"/>
    )
    // Idle — friendly smile
    return (
      <path d="M83 118 Q100 133 117 118"
        stroke={eyeColor} strokeWidth="3.5" fill="none"
        strokeLinecap="round" filter="url(#eGlow)"/>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

      {/* Sonar rings while listening */}
      {isListening && [0,1,2].map(i => (
        <div key={i} style={{
          position: 'absolute', top: '34%', left: '50%',
          width: 210, height: 210,
          marginLeft: -105, marginTop: -105,
          borderRadius: '50%',
          border: `2px solid rgba(${eyeGlowRgb},${0.55 - i * 0.15})`,
          animation: 'rgListen 2s ease-out infinite',
          animationDelay: `${i * 0.65}s`,
          pointerEvents: 'none',
        }}/>
      ))}

      {/* Background glow halo */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 280, height: 280, borderRadius: '50%',
        background: isListening
          ? 'radial-gradient(circle, rgba(239,68,68,0.16) 0%, transparent 68%)'
          : isThinking
          ? 'radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 68%)'
          : isSpeaking
          ? 'radial-gradient(circle, rgba(20,184,166,0.16) 0%, transparent 68%)'
          : 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 68%)',
        filter: 'blur(28px)',
        transition: 'background 0.7s ease',
        pointerEvents: 'none',
      }}/>

      {/* ── Robot SVG ── */}
      <svg viewBox="0 0 200 272" width="216" height="216" style={{
        animation: 'rgFloat 3.8s ease-in-out infinite',
        filter: `drop-shadow(0 14px 30px rgba(0,0,0,0.22))
                 drop-shadow(0 0 ${isListening || isSpeaking ? 18 : 8}px
                 rgba(${eyeGlowRgb},${isListening || isSpeaking ? 0.32 : 0.12}))`,
        transition: 'filter 0.5s ease',
        position: 'relative', zIndex: 1,
      }}>
        <defs>
          <radialGradient id="rgHead" cx="33%" cy="26%" r="72%">
            <stop offset="0%"   stopColor="#ffffff"/>
            <stop offset="55%"  stopColor="#e6e8f2"/>
            <stop offset="100%" stopColor="#c2c6d6"/>
          </radialGradient>
          <radialGradient id="rgBody" cx="30%" cy="26%" r="72%">
            <stop offset="0%"   stopColor="#f2f4fa"/>
            <stop offset="55%"  stopColor="#dadce8"/>
            <stop offset="100%" stopColor="#bec2d0"/>
          </radialGradient>
          <radialGradient id="rgArm" cx="26%" cy="20%" r="72%">
            <stop offset="0%"   stopColor="#eef0f8"/>
            <stop offset="100%" stopColor="#c2c6d6"/>
          </radialGradient>
          <radialGradient id="rgVisor" cx="50%" cy="22%" r="82%">
            <stop offset="0%"   stopColor="#0c1e3c"/>
            <stop offset="100%" stopColor="#040c1a"/>
          </radialGradient>
          <filter id="eGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dropSh">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.16)"/>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="266" rx="44" ry="6" fill="rgba(0,0,0,0.08)"/>

        {/* ── Body ── */}
        <ellipse cx="100" cy="218" rx="54" ry="52" fill="url(#rgBody)" filter="url(#dropSh)"/>
        <ellipse cx="84" cy="197" rx="20" ry="13" fill="rgba(255,255,255,0.5)"/>
        <path d="M74 228 L85 234 L100 236 L115 234 L126 228"
          stroke="#b0b4c6" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

        {/* ── Left arm ── */}
        <ellipse cx="36" cy="210" rx="14" ry="24"
          fill="url(#rgArm)" transform="rotate(-10,36,210)" filter="url(#dropSh)"/>
        <ellipse cx="30" cy="199" rx="5.5" ry="4.5" fill="rgba(255,255,255,0.48)"/>

        {/* ── Right arm ── */}
        <ellipse cx="164" cy="210" rx="14" ry="24"
          fill="url(#rgArm)" transform="rotate(10,164,210)" filter="url(#dropSh)"/>
        <ellipse cx="158" cy="199" rx="5.5" ry="4.5" fill="rgba(255,255,255,0.48)"/>

        {/* ── Neck ── */}
        <rect x="87" y="148" width="26" height="18" rx="10" fill="url(#rgHead)"/>

        {/* ── Head ── */}
        <rect x="20" y="38" width="160" height="118" rx="40" fill="url(#rgHead)" filter="url(#dropSh)"/>

        {/* Side bumps */}
        <ellipse cx="30" cy="96" rx="13" ry="20" fill="url(#rgHead)"/>
        <ellipse cx="170" cy="96" rx="13" ry="20" fill="url(#rgHead)"/>
        <ellipse cx="25" cy="88" rx="5" ry="7.5" fill="rgba(255,255,255,0.52)"/>
        <ellipse cx="175" cy="88" rx="5" ry="7.5" fill="rgba(255,255,255,0.52)"/>

        {/* Head top shine */}
        <ellipse cx="76" cy="52" rx="40" ry="18" fill="rgba(255,255,255,0.54)"/>

        {/* ── Antenna ── */}
        <rect x="92" y="16" width="16" height="26" rx="8" fill="url(#rgHead)"/>
        <ellipse cx="100" cy="14" rx="13" ry="12" fill="url(#rgHead)" filter="url(#dropSh)"/>
        <ellipse cx="94" cy="9" rx="5.5" ry="4.5" fill="rgba(255,255,255,0.65)"/>

        {/* ── Visor (dark screen) ── */}
        <rect x="34" y="52" width="132" height="90" rx="26" fill="url(#rgVisor)"/>
        {/* Visor top sheen */}
        <rect x="38" y="54" width="124" height="22" rx="18" fill="rgba(255,255,255,0.055)"/>
        {/* Visor border */}
        <rect x="34" y="52" width="132" height="90" rx="26"
          fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.5"/>

        {/* ── Face ── */}
        <Eyes/>
        <Mouth/>
      </svg>

      {/* Status badge */}
      <div style={{
        fontSize: 11, fontWeight: 700, color: statusColor,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        background: 'var(--bg-card)',
        padding: '4px 14px', borderRadius: 99,
        border: `1px solid ${statusColor}44`,
        transition: 'color 0.4s ease, border-color 0.4s ease',
        marginTop: -2,
      }}>
        {statusLabel}
      </div>

      {/* ── Speech bubble while speaking ── */}
      {isSpeaking && response && (
        <div style={{
          maxWidth: 360, width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid rgba(20,184,166,0.28)',
          borderRadius: 18,
          padding: '16px 20px',
          position: 'relative',
          animation: 'rgFadeUp 0.3s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          {/* Pointer triangle */}
          <div style={{
            position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid rgba(20,184,166,0.28)',
          }}/>
          {/* Tutor reply */}
          <div style={{ fontSize: 10, fontWeight: 700, color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Fluento says
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--text-body)' }}>
            {response.reply}
          </p>

          {/* Corrections */}
          {response.corrections?.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                The correct way to say this
              </div>
              {response.corrections.slice(0, 2).map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: i < 1 ? 6 : 0, lineHeight: 1.5 }}>
                  <span style={{ color: '#f87171', textDecoration: 'line-through', marginRight: 6 }}>{c.original}</span>
                  <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>→</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{c.corrected}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes rgFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes rgListen {
          0%   { transform: scale(0.72); opacity: 0.7; }
          100% { transform: scale(2.5);  opacity: 0; }
        }
        @keyframes thinkDot {
          0%, 100% { transform: translateY(0);   opacity: 0.35; }
          50%       { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes rgFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}