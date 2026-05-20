import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import styles from './VoiceButton.module.css'

const LABELS = {
  idle:         'Tap to speak',
  recording:    'Tap to stop',
  transcribing: 'Transcribing…',
}

export function VoiceButton({ onTranscript, onError }) {
  const { state, toggle } = useVoiceRecorder({ onTranscript, onError })

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.ring} ${state === 'recording' ? styles.ringActive : ''}`} />

      <button
        className={`${styles.btn} ${styles[state]}`}
        onClick={toggle}
        disabled={state === 'transcribing'}
        aria-label={LABELS[state]}
      >
        {state === 'transcribing' ? <Spinner /> : state === 'recording' ? <StopIcon /> : <MicIcon />}
      </button>

      <span className={styles.label}>{LABELS[state]}</span>

      {state === 'recording' && <Waveform />}
    </div>
  )
}

function Waveform() {
  return (
    <div className={styles.waveform} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.bar} style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  )
}

const MicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
)

const Spinner = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
  </svg>
)