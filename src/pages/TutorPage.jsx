import { useState, useRef, useEffect } from 'react'
import { TutorResponse } from '../components/TutorResponse'
import { RobotAvatar } from '../components/RobotAvatar'
import { getTutorResponse } from '../lib/tutorApi'
import { saveSession } from '../lib/sessionApi'
import { useAuth } from '../context/AuthContext'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

// ─── Text-to-speech hook ──────────────────────────────────────────────────────
function useTTS() {
  const [muted, setMuted]     = useState(false)
  const [active, setActive]   = useState(false)
  const uttRef                = useRef(null)

  const speak = (text) => {
    if (muted || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang    = 'en-US'
    utt.rate    = 0.88
    utt.pitch   = 1.05
    utt.onstart = () => setActive(true)
    utt.onend   = () => setActive(false)
    utt.onerror = () => setActive(false)
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
  }

  const stop = () => { window.speechSynthesis?.cancel(); setActive(false) }

  // Cleanup on unmount
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  return { speak, stop, muted, active, toggleMute: () => { stop(); setMuted(m => !m) } }
}

// ─── Difficulty selector ──────────────────────────────────────────────────────
function DifficultySelector({ value, onChange }) {
  const levels = [
    { key: 'easy',   label: '🌱 Easy',   color: '#10b981' },
    { key: 'medium', label: '⚡ Medium', color: '#14b8a6' },
    { key: 'hard',   label: '🔥 Hard',   color: '#6366f1' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Level</span>
      <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 3, gap: 2 }}>
        {levels.map(l => (
          <button key={l.key} onClick={() => onChange(l.key)} style={{
            padding: '5px 13px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            background: value === l.key ? l.color : 'transparent',
            color:      value === l.key ? 'white'  : 'var(--text-muted)',
          }}>
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Topic suggestion chips ───────────────────────────────────────────────────
const TOPICS = [
  { icon: '☀️', text: 'Tell me about your day' },
  { icon: '🏙️', text: 'Describe your hometown' },
  { icon: '🍕', text: 'Your favourite food' },
  { icon: '✈️', text: 'Your dream vacation' },
  { icon: '🎮', text: 'A hobby you enjoy' },
  { icon: '📺', text: 'A film or show you liked' },
  { icon: '💼', text: 'Talk about your job or studies' },
  { icon: '🐾', text: 'Do you have any pets?' },
]

function TopicChips({ onSelect }) {
  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Or pick a topic to get started
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {TOPICS.map((t, i) => (
          <button key={i} onClick={() => onSelect(t.text)} style={{
            padding: '7px 14px', borderRadius: 99,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontWeight: 500,
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(20,184,166,0.45)'
              e.currentTarget.style.color = '#14b8a6'
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,184,166,0.18)'
              e.currentTarget.style.background = 'rgba(20,184,166,0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
              e.currentTarget.style.background = 'var(--bg-card)'
            }}
          >
            <span>{t.icon}</span>{t.text}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Mic button ───────────────────────────────────────────────────────────────
function MicControl({ recordingState, onToggle, tts }) {
  const isRecording    = recordingState === 'recording'
  const isTranscribing = recordingState === 'transcribing'

  const label =
    isTranscribing ? 'Transcribing…' : isRecording ? 'Tap to stop' : 'Tap to speak'

  const btnColor =
    isRecording ? '#ef4444' : isTranscribing ? '#f59e0b' : '#14b8a6'

  const btnGlow =
    isRecording    ? 'rgba(239,68,68,0.35)'
    : isTranscribing ? 'rgba(245,158,11,0.25)'
    : 'rgba(20,184,166,0.25)'

  // Icons
  const SpeakerOn  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
  const SpeakerOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <button
        onClick={onToggle}
        disabled={isTranscribing}
        aria-label={label}
        style={{
          width: 62, height: 62, borderRadius: '50%', border: 'none',
          background: btnColor,
          boxShadow: `0 0 0 9px ${btnGlow}, 0 8px 24px ${btnGlow}`,
          color: 'white', cursor: isTranscribing ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
          transform: isRecording ? 'scale(1.09)' : 'scale(1)',
        }}
      >
        {isTranscribing ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
            style={{ animation: 'mcSpin 0.8s linear infinite' }}>
            <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
            <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round"/>
          </svg>
        ) : isRecording ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="4" y="4" width="16" height="16" rx="3"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8"  y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          {label}
        </span>
        {/* Mute/unmute TTS */}
        <button onClick={tts.toggleMute} title={tts.muted ? 'Unmute voice' : 'Mute voice'} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
          color: tts.muted ? 'var(--text-dim)' : '#14b8a6',
          display: 'flex', alignItems: 'center', transition: 'all 0.15s',
        }}>
          {tts.muted ? <SpeakerOff/> : <SpeakerOn/>}
        </button>
      </div>

      <style>{`@keyframes mcSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function TutorPage({ onSessionSaved }) {
  const { user } = useAuth()
  const [transcript, setTranscript]           = useState('')
  const [response, setResponse]               = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState(null)
  const [history, setHistory]                 = useState([])
  const [difficulty, setDifficulty]           = useState('medium')
  const [isSpeakingState, setIsSpeakingState] = useState(false)

  const speakTimerRef       = useRef(null)
  const handleTranscriptRef = useRef(null)
  const tts                 = useTTS()

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
    setTranscript(text)
    setError(null)
    setLoading(true)
    setResponse(null)

    try {
      const result = await getTutorResponse(text, history, difficulty)
      setResponse(result)

      setHistory(prev => [
        ...prev,
        { role: 'user',      content: text },
        { role: 'assistant', content: result.reply },
      ].slice(-10))

      // Speak the reply
      tts.speak(result.reply)

      // Avatar speaking animation
      setIsSpeakingState(true)
      clearTimeout(speakTimerRef.current)
      speakTimerRef.current = setTimeout(() => setIsSpeakingState(false), 5000)

      await saveSession(user.id, {
        transcript: text,
        reply:       result.reply,
        corrections: result.corrections,
        score:       result.score,
      })
      onSessionSaved?.()
    } catch (err) {
      setError('Something went wrong. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Keep ref up to date
  handleTranscriptRef.current = processMessage

  // Topic chip clicked — send as message directly
  const handleTopicSelect = (topicText) => {
    if (recordingState !== 'idle' || loading) return
    processMessage(`Let's talk about this topic: ${topicText}`)
  }

  const showTopics = !transcript && tutorState === 'idle'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 80px' }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '25%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 600, pointerEvents: 'none',
        background: `radial-gradient(ellipse, ${
          tutorState === 'listening' ? 'rgba(239,68,68,0.07)'
          : tutorState === 'thinking' ? 'rgba(245,158,11,0.06)'
          : 'rgba(20,184,166,0.06)'
        } 0%, transparent 65%)`,
        transition: 'background 0.7s ease',
      }}/>

      <div style={{ width: '100%', maxWidth: 580, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative' }}>

        {/* Header row */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          {showTopics && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
                Your AI English tutor
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Tap the mic and start talking.
              </p>
            </div>
          )}
          {!showTopics && <div/>}
          <DifficultySelector value={difficulty} onChange={setDifficulty}/>
        </div>

        {/* Robot */}
        <RobotAvatar tutorState={tutorState} response={response}/>

        {/* Mic */}
        <MicControl recordingState={recordingState} onToggle={toggle} tts={tts}/>

        {/* Error */}
        {error && (
          <div style={{ fontSize: 14, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '12px 18px', width: '100%' }}>
            {error}
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', transition: 'background 0.25s ease' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              You said
            </span>
            <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--text-body)' }}>{transcript}</p>
          </div>
        )}

        {/* Topic chips — shown only when idle */}
        {showTopics && <TopicChips onSelect={handleTopicSelect}/>}

        {/* AI response */}
        <TutorResponse response={response} loading={loading}/>

      </div>
    </div>
  )
}