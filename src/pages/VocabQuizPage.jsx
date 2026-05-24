import { useState, useMemo } from 'react'

// ─── Word bank ────────────────────────────────────────────────────────────────
const ALL_WORDS = [
  { word: 'Abandon',    meaning: 'To leave someone or something behind permanently',     options: ['To follow closely',       'To leave behind permanently',   'To improve slowly',         'To celebrate loudly'] },
  { word: 'Abundant',   meaning: 'Existing in large quantities; more than enough',       options: ['Extremely rare',           'Existing in large quantities',  'Slightly damaged',          'Completely invisible'] },
  { word: 'Ambiguous',  meaning: 'Open to more than one interpretation; unclear',        options: ['Perfectly clear',          'Open to many interpretations',  'Very loud and obvious',     'Completely finished'] },
  { word: 'Benevolent', meaning: 'Well-meaning and kindly toward others',               options: ['Constantly angry',         'Well-meaning and kind',         'Very secretive',            'Easily frightened'] },
  { word: 'Candid',     meaning: 'Truthful and straightforward; frank',                  options: ['Deliberately vague',       'Truthful and straightforward',  'Overly formal',             'Extremely shy'] },
  { word: 'Diligent',   meaning: 'Showing care and persistent effort in work',           options: ['Carelessly fast',          'Showing care and effort',       'Stubbornly idle',           'Openly dishonest'] },
  { word: 'Eloquent',   meaning: 'Fluent and persuasive in speaking or writing',         options: ['Very quiet and shy',       'Fluent and persuasive',         'Confused and forgetful',    'Rude and aggressive'] },
  { word: 'Ephemeral',  meaning: 'Lasting for only a very short time',                   options: ['Lasting forever',          'Lasting a very short time',     'Very heavy and solid',      'Extremely loud'] },
  { word: 'Frugal',     meaning: 'Careful and economical with money or resources',       options: ['Extremely wasteful',       'Economical with money',         'Very emotional',            'Very loud'] },
  { word: 'Garrulous',  meaning: 'Excessively talkative, especially on trivial matters', options: ['Very quiet and reserved',  'Excessively talkative',         'Completely honest',         'Deeply thoughtful'] },
  { word: 'Harbinger',  meaning: 'Something that signals what is to come; an omen',     options: ['A final conclusion',       'A signal of things to come',    'A loud celebration',        'A sudden disappearance'] },
  { word: 'Hostile',    meaning: 'Showing aggression or opposition; unfriendly',         options: ['Very welcoming',           'Showing aggression',            'Quietly nervous',           'Extremely helpful'] },
  { word: 'Insidious',  meaning: 'Proceeding in a gradual and harmful way',             options: ['Openly helpful',           'Gradually and subtly harmful',  'Very obvious and loud',     'Completely harmless'] },
  { word: 'Intricate',  meaning: 'Very complex or detailed in design or structure',      options: ['Very simple and plain',    'Complex and detailed',          'Completely broken',         'Very noisy'] },
  { word: 'Jovial',     meaning: 'Cheerful and friendly in manner',                      options: ['Deeply serious',           'Cheerful and friendly',         'Always angry',              'Frequently absent'] },
  { word: 'Laconic',    meaning: 'Using very few words; brief and concise',              options: ['Speaking at great length', 'Using very few words',          'Very emotional',            'Always agreeable'] },
  { word: 'Lament',     meaning: 'To express grief or sorrow about something',           options: ['To celebrate noisily',     'To express grief or sorrow',    'To argue loudly',           'To eat hungrily'] },
  { word: 'Meticulous', meaning: 'Very careful and precise about details',               options: ['Extremely careless',       'Very careful about details',    'Very impatient',            'Completely random'] },
  { word: 'Perfidious', meaning: 'Guilty of betrayal; treacherous',                     options: ['Completely loyal',         'Guilty of betrayal',            'Openly generous',           'Deeply religious'] },
  { word: 'Tenacious',  meaning: 'Holding firmly to a position; persistent and strong',  options: ['Easily giving up',         'Persistent and strong-willed',  'Very forgetful',            'Openly dishonest'] },
  { word: 'Verbose',    meaning: 'Using more words than needed; long-winded',            options: ['Very brief and clear',     'Using too many words',          'Completely silent',         'Very precise'] },
  { word: 'Wary',       meaning: 'Feeling cautious about possible dangers or problems',  options: ['Very trusting',            'Cautious about danger',         'Feeling overconfident',     'Deeply relaxed'] },
  { word: 'Zealous',    meaning: 'Having great energy or enthusiasm for a cause',        options: ['Very indifferent',         'Full of enthusiasm',            'Easily bored',              'Quietly modest'] },
  { word: 'Pragmatic',  meaning: 'Dealing with things sensibly and realistically',       options: ['Idealistic and dreamy',    'Sensible and realistic',        'Very emotional',            'Strictly traditional'] },
  { word: 'Aloof',      meaning: 'Distant and not friendly; not involved',               options: ['Warm and approachable',    'Distant and not friendly',      'Very talkative',            'Extremely helpful'] },
  { word: 'Concise',    meaning: 'Giving a lot of information clearly in few words',     options: ['Very long and detailed',   'Clear and using few words',     'Very confusing',            'Extremely vague'] },
  { word: 'Resilient',  meaning: 'Able to recover quickly from difficulties',            options: ['Easily broken down',       'Recovering quickly from setbacks', 'Very rigid',             'Never changing'] },
  { word: 'Subtle',     meaning: 'So delicate or precise as to be difficult to notice',  options: ['Very loud and obvious',    'Difficult to notice',           'Extremely heavy',           'Very straightforward'] },
  { word: 'Empathy',    meaning: 'The ability to understand and share another\'s feelings', options: ['Lack of any emotion',   'Understanding others\' feelings', 'Strong physical ability',  'Hatred of others'] },
  { word: 'Trivial',    meaning: 'Of little importance or value; insignificant',         options: ['Extremely important',      'Of little importance',          'Very complex',              'Very frightening'] },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickQuestions(count = 8) {
  return shuffle(ALL_WORDS).slice(0, count).map(w => ({
    word:    w.word,
    meaning: w.meaning,
    options: shuffle(w.options),
  }))
}

// ─── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ score, total, onRestart }) {
  const pct     = Math.round((score / total) * 100)
  const color   = pct >= 80 ? '#10b981' : pct >= 60 ? '#14b8a6' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const emoji   = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '📚' : '💪'
  const message = pct >= 80 ? 'Excellent vocabulary!' : pct >= 60 ? 'Good work, keep it up!' : pct >= 40 ? 'Keep studying!' : "Don't give up — try again!"

  const circumference = 2 * Math.PI * 52

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, animation: 'qFade 0.35s ease' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>{emoji}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Quiz complete!</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>{message}</p>
      </div>

      {/* Circular score */}
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg viewBox="0 0 120 120" width="130" height="130">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--track)" strokeWidth="9"/>
          <circle cx="60" cy="60" r="52" fill="none"
            stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{score}/{total}</span>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%', maxWidth: 360 }}>
        {[
          { icon: '✅', label: 'Correct', value: score,         color: '#10b981' },
          { icon: '❌', label: 'Wrong',   value: total - score, color: '#ef4444' },
          { icon: '📊', label: 'Score',   value: `${pct}%`,     color },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <button onClick={onRestart} style={{
        width: '100%', maxWidth: 360, padding: '14px 0', borderRadius: 14, border: 'none',
        background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
        color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(20,184,166,0.3)',
      }}>
        🔄 Try another quiz
      </button>
    </div>
  )
}

// ─── Quiz page ────────────────────────────────────────────────────────────────
export function VocabQuizPage() {
  const [questions, setQuestions] = useState(null)
  const [qIndex, setQIndex]       = useState(0)
  const [selected, setSelected]   = useState(null)
  const [score, setScore]         = useState(0)
  const [done, setDone]           = useState(false)

  const TOTAL = 8

  const startQuiz = () => {
    setQuestions(pickQuestions(TOTAL))
    setQIndex(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  const handleSelect = (opt) => {
    if (selected !== null) return
    setSelected(opt)
    if (opt === questions[qIndex].meaning) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (qIndex + 1 >= TOTAL) {
      setDone(true)
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
    }
  }

  const q = questions?.[qIndex]

  // ── Landing screen ──────────────────────────────────────────────────────────
  if (!questions) return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', padding: '52px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📝</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>Vocabulary quiz</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
          {TOTAL} words · multiple choice · see your score at the end.<br/>
          Read each word and pick the correct definition.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%' }}>
        {[
          { icon: '📖', label: `${TOTAL} words`,         sub: 'per quiz' },
          { icon: '🎯', label: '4 options',              sub: 'per question' },
          { icon: '⏱️', label: '~3 minutes',             sub: 'to complete' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 22 }}>{c.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <button onClick={startQuiz} style={{
        width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
        background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
        color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(20,184,166,0.3)',
      }}>
        Start quiz →
      </button>
    </div>
  )

  // ── Results ─────────────────────────────────────────────────────────────────
  if (done) return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', padding: '52px 20px' }}>
      <ResultScreen score={score} total={TOTAL} onRestart={startQuiz}/>
    </div>
  )

  // ── Question ────────────────────────────────────────────────────────────────
  const isCorrect   = (opt) => opt === q.meaning
  const isSelected  = (opt) => opt === selected
  const answered    = selected !== null
  const gotItRight  = answered && isCorrect(selected)

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', padding: '40px 20px 80px', display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Question {qIndex + 1} of {TOTAL}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>✅ {score} correct</span>
        </div>
        <div style={{ height: 5, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${((qIndex + (answered ? 1 : 0)) / TOTAL) * 100}%`,
            background: 'linear-gradient(90deg, #6366f1, #14b8a6)',
            transition: 'width 0.35s ease',
          }}/>
        </div>
      </div>

      {/* Word card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          What does this word mean?
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
          {q.word}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => {
          const correct  = isCorrect(opt)
          const picked   = isSelected(opt)

          let borderColor = 'var(--border)'
          let bgColor     = 'var(--bg-card)'
          let textColor   = 'var(--text-body)'
          let icon        = null

          if (answered) {
            if (correct)       { borderColor = 'rgba(16,185,129,0.5)'; bgColor = 'rgba(16,185,129,0.07)'; textColor = '#10b981'; icon = '✅' }
            else if (picked)   { borderColor = 'rgba(239,68,68,0.5)';  bgColor = 'rgba(239,68,68,0.07)';  textColor = '#f87171'; icon = '❌' }
          }

          return (
            <button key={i} onClick={() => handleSelect(opt)} style={{
              width: '100%', textAlign: 'left', padding: '14px 18px',
              borderRadius: 14, border: `1.5px solid ${borderColor}`,
              background: bgColor, color: textColor, fontSize: 14,
              fontWeight: answered && correct ? 600 : 400,
              cursor: answered ? 'default' : 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = '#14b8a6'; e.currentTarget.style.background = 'rgba(20,184,166,0.05)' } }}
              onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' } }}
            >
              <span>{opt}</span>
              {icon && <span style={{ flexShrink: 0, fontSize: 16 }}>{icon}</span>}
            </button>
          )
        })}
      </div>

      {/* Feedback banner */}
      {answered && (
        <div style={{
          background: gotItRight ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
          border: `1px solid ${gotItRight ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 14, padding: '14px 18px',
          animation: 'qFade 0.2s ease',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: gotItRight ? '#10b981' : '#f87171', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {gotItRight ? '✅ Correct!' : '❌ Not quite'}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{q.word}</strong> means: {q.meaning}
          </p>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button onClick={handleNext} style={{
          width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(20,184,166,0.3)',
          animation: 'qFade 0.2s ease',
        }}>
          {qIndex + 1 >= TOTAL ? '🏁 See results' : 'Next question →'}
        </button>
      )}

      <style>{`
        @keyframes qFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}