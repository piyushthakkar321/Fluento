import { useState, useRef, useEffect } from 'react'
import { TutorResponse } from '../components/TutorResponse'
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
  return { speak, stop, muted, active, toggleMute: () => { stop(); setMuted(m => !m) } }
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

// ── Page ──────────────────────────────────────────────────────────────────────
export function TutorPage({ onSessionSaved, streakKey }) {
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

  return (
    <>
      <style>{`
        @keyframes tpPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.75); }
        }
        @keyframes tpMicRing {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35), 0 8px 28px rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 0 16px rgba(239,68,68,0), 0 8px 28px rgba(239,68,68,0.4); }
        }
        @keyframes tpSpin { to { transform:rotate(360deg); } }
      `}</style>

      {/* ── Scrollable content ── */}
      <div style={{ background: 'var(--bg-base)', paddingBottom: 160 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 4px' }}>
          <StreakBadge key={streakKey} userId={user.id}/>
          {/* Difficulty selector */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 2 }}>
            {[
              { key: 'easy',   label: 'Easy',   color: '#10b981' },
              { key: 'medium', label: 'Med',    color: 'var(--accent)' },
              { key: 'hard',   label: 'Hard',   color: '#6366f1' },
            ].map(l => (
              <button key={l.key} onClick={() => setDifficulty(l.key)} style={{
                padding: '6px 13px', borderRadius: 7, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: difficulty === l.key ? l.color : 'transparent',
                color:      difficulty === l.key ? '#fff'   : 'var(--text-muted)',
                minHeight: 34, transition: 'background 0.15s ease',
              }}>{l.label}</button>
            ))}
          </div>
        </div>

        {/* Robot */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <RobotAvatar tutorState={tutorState} response={response}/>
        </div>

        {/* State label */}
        <div style={{ textAlign: 'center', padding: '4px 20px 20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {tutorState === 'listening' && (
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', animation: 'tpPulse 1.1s ease-in-out infinite' }}/>
            )}
            <span style={{
              fontSize: 16, fontWeight: 700,
              color: STATE_COLORS[tutorState],
              transition: 'color 0.3s ease',
            }}>
              {STATE_LABELS[tutorState]}
            </span>
          </div>
        </div>

        {/* Topic chips — horizontal scroll, only when no conversation yet */}
        {!transcript && tutorState === 'idle' && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 14 }}>
              Or pick a topic
            </p>
            <div className="hide-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 20px 4px', WebkitOverflowScrolling: 'touch' }}>
              {TOPICS.map((t, i) => (
                <button key={i} onClick={() => handleTopicSelect(t.text)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
                  padding: '11px 18px', borderRadius: 99,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)',
                  cursor: 'pointer', minHeight: 48,
                }}>
                  <span>{t.icon}</span><span style={{ whiteSpace: 'nowrap' }}>{t.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ margin: '16px 20px 0', padding: '14px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, fontSize: 14, color: '#f87171', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div style={{ margin: '16px 20px 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '16px 18px', boxShadow: 'var(--shadow-card)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>You said</span>
            <p style={{ margin: '8px 0 0', fontSize: 16, lineHeight: 1.65, color: 'var(--text-body)', fontWeight: 500 }}>{transcript}</p>
          </div>
        )}

        {/* AI response */}
        <div style={{ padding: '0 20px' }}>
          <TutorResponse response={response} loading={loading}/>
        </div>
      </div>

      {/* ── Fixed mic zone ── */}
      <div style={{
        position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '14px 0 10px',
        background: 'linear-gradient(to top, var(--bg-base) 65%, transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Mute toggle */}
          <button onClick={tts.toggleMute} style={{
            width: 46, height: 46, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: tts.muted ? 'var(--text-dim)' : 'var(--text-secondary)',
          }}>
            {tts.muted
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            }
          </button>

          {/* Big mic button */}
          <button
            onClick={toggle}
            disabled={isTranscribing}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            style={{
              width: 80, height: 80, borderRadius: '50%', border: 'none',
              background: isRecording ? '#ef4444' : isTranscribing ? '#f59e0b' : 'var(--accent)',
              color: '#fff', cursor: isTranscribing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: isRecording ? 'tpMicRing 1.6s ease-in-out infinite' : 'none',
              boxShadow: isRecording
                ? '0 8px 28px rgba(239,68,68,0.4)'
                : '0 8px 28px rgba(20,184,166,0.4)',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {isTranscribing ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                style={{ animation: 'tpSpin 0.8s linear infinite' }}>
                <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
                <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round"/>
              </svg>
            ) : isRecording ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <rect x="4" y="4" width="16" height="16" rx="3"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8"  y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>

          {/* Spacer for symmetry */}
          <div style={{ width: 46 }}/>
        </div>
      </div>
    </>
  )
}