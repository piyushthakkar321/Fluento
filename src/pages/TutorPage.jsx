import { useState, useRef, useEffect } from 'react'
import { RobotAvatar } from '../components/RobotAvatar'
import { StreakBadge } from '../components/StreakBadge'
import { getTutorResponse } from '../lib/tutorApi'
import { saveSession } from '../lib/sessionApi'
import { useAuth } from '../context/AuthContext'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

// ── TTS ───────────────────────────────────────────────────────────────────────
function useTTS() {
  const [muted, setMuted]   = useState(false)
  const [active, setActive] = useState(false)
  const uttRef              = useRef(null)
  const unlockedRef         = useRef(false)

  // iOS requires a silent utterance fired inside a user gesture
  // to unlock speechSynthesis for subsequent auto-play
  const unlock = () => {
    if (unlockedRef.current || !window.speechSynthesis) return
    const silent = new SpeechSynthesisUtterance('')
    silent.volume = 0
    window.speechSynthesis.speak(silent)
    unlockedRef.current = true
  }

  const speak = (text) => {
    if (muted || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt   = new SpeechSynthesisUtterance(text)
    utt.lang    = 'en-US'
    utt.rate    = 0.88
    utt.onstart = () => setActive(true)
    utt.onend   = () => setActive(false)
    utt.onerror = () => setActive(false)
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
  }

  const stop = () => { window.speechSynthesis?.cancel(); setActive(false) }
  useEffect(() => () => window.speechSynthesis?.cancel(), [])
  return { speak, stop, muted, active, unlock, toggleMute: () => { stop(); setMuted(m => !m) } }
}

// ── Topic chips ───────────────────────────────────────────────────────────────
const TOPICS = [
  { icon: '☀️', text: 'Tell me about your day' },
  { icon: '🏙️', text: 'Describe your hometown' },
  { icon: '🍕', text: 'Your favourite food' },
  { icon: '✈️', text: 'Your dream vacation' },
  { icon: '🎮', text: 'A hobby you enjoy' },
  { icon: '📺', text: 'A film or show you liked' },
  { icon: '💼', text: 'Talk about your job' },
  { icon: '🐾', text: 'Do you have pets?' },
]

const STATE_LABELS = {
  idle:      'Tap the mic to speak',
  listening: 'Listening…',
  thinking:  'Thinking…',
  speaking:  'Responding…',
}
const STATE_COLORS = {
  idle:      'var(--text-muted)',
  listening: '#ef4444',
  thinking:  '#f59e0b',
  speaking:  'var(--accent)',
}
// ── Waveform ──────────────────────────────────────────────────────────────────
function Waveform({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {[0.4, 0.75, 1, 0.75, 0.4, 0.85, 0.55].map((h, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2,
          background: active ? '#ef4444' : 'var(--border)',
          height: active ? `${Math.round(h * 24)}px` : '4px',
          animation: active ? 'wvBar 0.8s ease-in-out infinite alternate' : 'none',
          animationDelay: `${i * 0.1}s`,
          transition: 'height 0.3s ease, background 0.3s ease',
        }}/>
      ))}
      <style>{`
        @keyframes wvBar { from { transform:scaleY(0.4); } to { transform:scaleY(1); } }
      `}</style>
    </div>
  )
}

// ── Conversation bubble ───────────────────────────────────────────────────────
function BubbleTurn({ turn }) {
  return (
    <div style={{ marginBottom: 18, animation: 'tpFade 0.25s ease' }}>
      {/* User bubble */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
        <div style={{
          maxWidth: '80%', padding: '12px 16px',
          borderRadius: '18px 18px 4px 18px',
          background: 'var(--accent)', color: '#fff',
          fontSize: 15, lineHeight: 1.55, fontWeight: 500,
        }}>
          {turn.userText}
        </div>
      </div>

      {/* Corrections inline */}
      {turn.corrections?.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ maxWidth: '86%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {turn.corrections.map((c, i) => (
              <div key={i} style={{
                padding: '9px 13px', borderRadius: 12,
                background: 'rgba(245,158,11,0.07)',
                border: '1px solid rgba(245,158,11,0.25)',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#f87171', textDecoration: 'line-through' }}>{c.original}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontSize: 13, color: '#34d399', fontWeight: 700 }}>{c.corrected}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI bubble */}
      {turn.aiReply && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '82%' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, marginBottom: 2,
            }}>🤖</div>
            <div style={{
              padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontSize: 15, lineHeight: 1.55,
              color: 'var(--text-body)', fontWeight: 500,
            }}>
              {turn.aiReply}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Coaching card ─────────────────────────────────────────────────────────────
function CoachingCard({ turns, loading }) {
  if (!turns.length && !loading) return null

  const latest        = turns[turns.length - 1]
  const score         = latest?.score ?? null
  const corrs         = latest?.corrections ?? []
  const grammarScore  = score !== null ? Math.max(38, score - corrs.length * 7) : null
  const fluencyScore  = score !== null ? Math.min(100, Math.round(score * 0.96)) : null
  const vocabWords    = corrs.slice(0, 3).map(c => c.corrected).filter(Boolean)

  function Ring({ value, label, color }) {
    if (value === null) return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--track)', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      </div>
    )
    const C = 2 * Math.PI * 20
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto 6px' }}>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="20" fill="none" stroke="var(--track)" strokeWidth="4.5"/>
            <circle cx="26" cy="26" r="20" fill="none"
              stroke={color} strokeWidth="4.5" strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - value / 100)}
              transform="rotate(-90 26 26)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '16px 16px', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        Live coaching
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10px 0', color: 'var(--text-muted)', fontSize: 13 }}>Analysing…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: vocabWords.length ? 16 : 0 }}>
            <Ring value={grammarScore} label="Grammar" color="#14b8a6"/>
            <Ring value={score}        label="Overall" color="#6366f1"/>
            <Ring value={fluencyScore} label="Fluency" color="#10b981"/>
          </div>

          {vocabWords.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Better phrasing</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {vocabWords.map((w, i) => (
                  <span key={i} style={{ padding: '5px 12px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, fontWeight: 600, color: '#818cf8' }}>{w}</span>
                ))}
              </div>
            </div>
          )}

          {turns.length > 0 && corrs.length === 0 && score !== null && (
            <div style={{ textAlign: 'center', fontSize: 13, color: '#10b981', fontWeight: 700, padding: '6px 0' }}>
              ✨ Perfect — no corrections needed!
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function TutorPage({ onSessionSaved, streakKey, userName }) {
  const { user } = useAuth()
  const [turns, setTurns]                     = useState([])   // { userText, aiReply, corrections, score }
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState(null)
  const [history, setHistory]                 = useState([])
  const [difficulty, setDifficulty]           = useState('medium')
  const [isSpeakingState, setIsSpeakingState] = useState(false)
  const [showAllTopics, setShowAllTopics]     = useState(false)
  const speakTimerRef       = useRef(null)
  const handleTranscriptRef = useRef(null)
  const transcriptRef       = useRef(null)

  // Auto-scroll transcript on new turns
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [turns, loading])
  const tts = useTTS()

  const { state: recordingState, toggle } = useVoiceRecorder({
    onTranscript: (text) => handleTranscriptRef.current?.(text),
    onError:      setError,
  })

  const tutorState =
    recordingState === 'recording'                 ? 'listening'
    : recordingState === 'transcribing' || loading ? 'thinking'
    : isSpeakingState                              ? 'speaking'
    : 'idle'

  const processMessage = async (text) => {
    setError(null)
    setLoading(true)
    // Optimistically add user turn
    setTurns(prev => [...prev, { userText: text, aiReply: null, corrections: [], score: null }])
    try {
      const result = await getTutorResponse(text, history, difficulty, user?.id)
      // Fill in AI reply on the last turn
      setTurns(prev => [
        ...prev.slice(0, -1),
        { userText: text, aiReply: result.reply, corrections: result.corrections, score: result.score },
      ])
      setHistory(prev => [
        ...prev,
        { role: 'user',      content: text },
        { role: 'assistant', content: result.reply },
      ].slice(-10))
      tts.speak(result.reply)
      setIsSpeakingState(true)
      clearTimeout(speakTimerRef.current)
      speakTimerRef.current = setTimeout(() => setIsSpeakingState(false), 5000)
      await saveSession(user.id, {
        transcript: text,
        reply:      result.reply,
        corrections: result.corrections,
        score:      result.score,
      })
      onSessionSaved?.()
    } catch {
      setTurns(prev => prev.slice(0, -1))    // remove pending turn on error
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  handleTranscriptRef.current = processMessage

  const handleTopicSelect = (topicText) => {
    if (recordingState !== 'idle' || loading) return
    processMessage(`Let's talk about: ${topicText}`)
  }

  const isRecording    = recordingState === 'recording'
  const isTranscribing = recordingState === 'transcribing'
  const isActive       = turns.length > 0
  const featuredTopics = TOPICS.slice(0, 3)
  const extraTopics    = TOPICS.slice(3)

  return (
    <>
      <style>{`
        @keyframes tpPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.75); }
        }
        @keyframes tpMicRing {
          0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,0.35),0 8px 28px rgba(239,68,68,0.4); }
          50%      { box-shadow:0 0 0 16px rgba(239,68,68,0),0 8px 28px rgba(239,68,68,0.4); }
        }
        @keyframes tpSpin  { to { transform:rotate(360deg); } }
        @keyframes tpFade  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ background: 'var(--bg-base)', paddingBottom: 180 }}>

        {/* ── IDLE STATE ── */}
        {!isActive && tutorState === 'idle' && (
          <div style={{ padding: '4px 20px 16px' }}>

            {/* Welcome */}
            {userName && (
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 4 }}>
                Welcome back, {userName}! 👋
              </p>
            )}

            {/* Smaller robot */}
            <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', height: 172, marginBottom: 0 }}>
              <div style={{ transform: 'scale(0.78)', transformOrigin: 'center top', flexShrink: 0 }}>
                <RobotAvatar tutorState={tutorState} response={null}/>
              </div>
            </div>

            {/* Hint */}
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 22 }}>
              Tap mic → speak → get instant corrections
            </p>

            {/* Difficulty */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, gap: 2 }}>
                {[
                  { key: 'easy',   label: '🌱 Easy',   color: '#10b981' },
                  { key: 'medium', label: '⚡ Medium', color: 'var(--accent)' },
                  { key: 'hard',   label: '🔥 Hard',   color: '#6366f1' },
                ].map(l => (
                  <button key={l.key} onClick={() => setDifficulty(l.key)} style={{
                    padding: '7px 16px', borderRadius: 9, border: 'none',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 38,
                    background: difficulty === l.key ? l.color : 'transparent',
                    color:      difficulty === l.key ? '#fff'   : 'var(--text-muted)',
                    transition: 'background 0.15s ease',
                  }}>{l.label}</button>
                ))}
              </div>
            </div>

            {/* Featured topic chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
              {featuredTopics.map((t, i) => (
                <button key={i} onClick={() => handleTopicSelect(t.text)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '15px 18px', borderRadius: 16, minHeight: 56,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  fontSize: 15, fontWeight: 600, color: 'var(--text-body)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <span>{t.text}</span>
                </button>
              ))}
            </div>

            {/* More topics toggle */}
            {!showAllTopics ? (
              <button onClick={() => setShowAllTopics(true)} style={{
                width: '100%', padding: '13px 0', borderRadius: 14, minHeight: 50,
                background: 'none', border: '1.5px dashed var(--border)',
                fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer',
              }}>
                More topics ↓
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {extraTopics.map((t, i) => (
                  <button key={i} onClick={() => handleTopicSelect(t.text)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '15px 18px', borderRadius: 16, minHeight: 56,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    fontSize: 15, fontWeight: 600, color: 'var(--text-body)',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <span>{t.text}</span>
                  </button>
                ))}
                <button onClick={() => setShowAllTopics(false)} style={{
                  width: '100%', padding: '13px 0', borderRadius: 14, minHeight: 50,
                  background: 'none', border: '1.5px dashed var(--border)',
                  fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer',
                }}>
                  Show less ↑
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE STATE ── */}
        {isActive && (
          <div style={{ padding: '12px 16px 16px' }}>

            {/* Conversation transcript */}
            <div ref={transcriptRef} style={{
              overflowY: 'auto', maxHeight: 340,
              marginBottom: 16, paddingRight: 4,
            }}
              className="hide-scroll"
            >
              {turns.map((turn, i) => <BubbleTurn key={i} turn={turn}/>)}

              {/* AI typing indicator */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12, animation: 'tpFade 0.2s ease' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#14b8a6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
                    <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0,1,2].map(j => (
                        <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'tpPulse 1s ease-in-out infinite', animationDelay: `${j*0.2}s` }}/>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + waveform + state label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <div style={{ height: 142, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                <div style={{ transform: 'scale(0.65)', transformOrigin: 'center top', flexShrink: 0 }}>
                  <RobotAvatar tutorState={tutorState} response={null}/>
                </div>
              </div>
              <Waveform active={isRecording}/>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                {tutorState === 'listening' && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'tpPulse 1.1s ease-in-out infinite' }}/>
                )}
                <span style={{ fontSize: 14, fontWeight: 700, color: STATE_COLORS[tutorState], transition: 'color 0.3s ease' }}>
                  {STATE_LABELS[tutorState]}
                </span>
              </div>
            </div>

            {/* Coaching card */}
            <CoachingCard turns={turns} loading={loading}/>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ margin: '4px 16px 0', padding: '13px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, fontSize: 14, color: '#f87171', lineHeight: 1.5 }}>
            {error}
          </div>
        )}
      </div>

      {/* ── Fixed mic zone ── */}
      <div style={{
        position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 0 8px',
        background: 'linear-gradient(to top, var(--bg-base) 65%, transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>

          {/* Mute toggle */}
          <button onClick={tts.toggleMute} style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: tts.muted ? 'var(--text-dim)' : 'var(--text-secondary)',
          }}>
            {tts.muted
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            }
          </button>

          {/* Main mic button */}
          <button
            onClick={() => { tts.unlock(); toggle() }}
            disabled={isTranscribing}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            style={{
              width: 80, height: 80, borderRadius: '50%', border: 'none',
              background: isRecording ? '#ef4444' : isTranscribing ? '#f59e0b' : 'var(--accent)',
              color: '#fff', cursor: isTranscribing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: isRecording ? 'tpMicRing 1.6s ease-in-out infinite' : 'none',
              boxShadow: isRecording ? '0 8px 28px rgba(239,68,68,0.4)' : '0 8px 28px rgba(20,184,166,0.4)',
              transition: 'background 0.2s ease',
            }}
          >
            {isTranscribing ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'tpSpin 0.8s linear infinite' }}>
                <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
                <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round"/>
              </svg>
            ) : isRecording ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8"  y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>

          {/* New conversation / spacer */}
          {isActive ? (
            <button
              onClick={() => { setTurns([]); setHistory([]); setError(null); setShowAllTopics(false) }}
              title="New conversation"
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20,
              }}
            >↺</button>
          ) : (
            <div style={{ width: 48 }}/>
          )}
        </div>
      </div>
    </>
  )
}
