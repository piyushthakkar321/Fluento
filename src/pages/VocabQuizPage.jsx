import { useState, useEffect } from 'react'

// ─── Word bank ────────────────────────────────────────────────────────────────
const WORDS = [
  // Easy
  { word: 'abandon',    def: 'to leave someone or something behind permanently',         wrong: ['to follow closely', 'to improve slowly', 'to celebrate loudly'],             level: 'easy' },
  { word: 'brief',      def: 'lasting only a short time',                                wrong: ['very loud', 'extremely heavy', 'brightly coloured'],                         level: 'easy' },
  { word: 'curious',    def: 'eager to know or learn something',                         wrong: ['feeling very tired', 'very generous', 'afraid of strangers'],                 level: 'easy' },
  { word: 'damage',     def: 'physical harm that reduces value or function',             wrong: ['a kind gift', 'a loud noise', 'a slow movement'],                            level: 'easy' },
  { word: 'eager',      def: 'very keen or enthusiastic to do something',                wrong: ['slow and lazy', 'cold and distant', 'loud and rude'],                        level: 'easy' },
  { word: 'fragile',    def: 'easily broken or damaged',                                 wrong: ['very strong', 'extremely heavy', 'very flexible'],                           level: 'easy' },
  { word: 'generous',   def: 'willing to give more than is expected',                    wrong: ['very selfish', 'easily angered', 'always tired'],                            level: 'easy' },
  { word: 'harsh',      def: 'unpleasantly rough or severe',                             wrong: ['very sweet', 'extremely quiet', 'very soft'],                                level: 'easy' },
  { word: 'imitate',    def: 'to copy the actions or speech of someone',                 wrong: ['to destroy something', 'to move very fast', 'to stay very still'],           level: 'easy' },
  { word: 'jealous',    def: 'feeling envious of someone else\'s advantages',            wrong: ['feeling very happy for others', 'feeling calm and relaxed', 'feeling proud'], level: 'easy' },

  // Medium
  { word: 'abundant',   def: 'existing in large quantities; more than enough',           wrong: ['extremely rare', 'slightly damaged', 'completely invisible'],                level: 'medium' },
  { word: 'benevolent', def: 'well-meaning and kindly toward others',                    wrong: ['constantly angry', 'very secretive', 'easily frightened'],                   level: 'medium' },
  { word: 'candid',     def: 'truthful and straightforward; frank',                      wrong: ['deliberately vague', 'overly formal', 'extremely shy'],                      level: 'medium' },
  { word: 'diligent',   def: 'having or showing care and effort in work',                wrong: ['carelessly fast', 'stubbornly idle', 'openly dishonest'],                    level: 'medium' },
  { word: 'eloquent',   def: 'fluent and persuasive in speaking or writing',             wrong: ['very quiet and shy', 'confused and forgetful', 'rude and aggressive'],       level: 'medium' },
  { word: 'frugal',     def: 'sparing or economical with money or resources',            wrong: ['extremely wasteful', 'very loud', 'deeply emotional'],                       level: 'medium' },
  { word: 'genuine',    def: 'truly what it is said to be; authentic',                   wrong: ['completely fake', 'somewhat boring', 'overly complicated'],                  level: 'medium' },
  { word: 'hostile',    def: 'showing opposition or aggression; unfriendly',             wrong: ['very welcoming', 'quietly nervous', 'extremely helpful'],                    level: 'medium' },
  { word: 'intricate',  def: 'very complex or detailed in design',                       wrong: ['very simple and plain', 'completely broken', 'very loud'],                   level: 'medium' },
  { word: 'jovial',     def: 'cheerful and friendly in manner',                          wrong: ['deeply serious', 'always angry', 'frequently absent'],                       level: 'medium' },
  { word: 'lament',     def: 'to express grief or sorrow about something',               wrong: ['to celebrate noisily', 'to argue loudly', 'to eat hungrily'],                level: 'medium' },
  { word: 'meticulous', def: 'very careful and precise about details',                   wrong: ['extremely careless', 'very impatient', 'completely random'],                  level: 'medium' },

  // Hard
  { word: 'acquiesce',  def: 'to accept something reluctantly but without protest',      wrong: ['to refuse strongly', 'to explain in detail', 'to celebrate publicly'],       level: 'hard' },
  { word: 'ambiguous',  def: 'open to more than one interpretation; unclear',            wrong: ['perfectly clear', 'very loud and obvious', 'completely finished'],           level: 'hard' },
  { word: 'cacophony',  def: 'a harsh mixture of loud, discordant sounds',               wrong: ['a perfect musical harmony', 'a long period of silence', 'a gentle breeze'],  level: 'hard' },
  { word: 'didactic',   def: 'intended to teach or give moral instruction',              wrong: ['meant purely for entertainment', 'completely meaningless', 'very destructive'], level: 'hard' },
  { word: 'ephemeral',  def: 'lasting for a very short time; transitory',                wrong: ['lasting forever', 'very heavy and solid', 'extremely loud'],                  level: 'hard' },
  { word: 'fastidious', def: 'very attentive to detail; difficult to please',            wrong: ['completely careless', 'very easy-going', 'extremely generous'],               level: 'hard' },
  { word: 'garrulous',  def: 'excessively talkative, especially about trivial things',   wrong: ['very quiet and reserved', 'completely honest', 'deeply thoughtful'],          level: 'hard' },
  { word: 'harbinger',  def: 'a person or thing that signals what is to come',           wrong: ['a final conclusion', 'a loud celebration', 'a sudden disappearance'],         level: 'hard' },
  { word: 'insidious',  def: 'proceeding in a subtle but harmful way',                   wrong: ['openly helpful', 'very loud and obvious', 'completely harmless'],             level: 'hard' },
  { word: 'juxtapose',  def: 'to place two things close together to highlight contrast', wrong: ['to destroy completely', 'to repeat endlessly', 'to hide carefully'],          level: 'hard' },
  { word: 'laconic',    def: 'using very few words; brief to the point of seeming rude', wrong: ['speaking at great length', 'very emotionally expressive', 'always agreeable'], level: 'hard' },
  { word: 'perfidious', def: 'guilty of betrayal; treacherous and untrustworthy',        wrong: ['completely loyal', 'openly generous', 'deeply religious'],                    level: 'hard' },
]

const LEVEL_CONFIG = {
  all:    { label: '🌍 All',    color: '#6366f1' },
  easy:   { label: '🌱 Easy',   color: '#10b981' },
  medium: { label: '⚡ Medium', color: '#14b8a6' },
  hard:   { label: '🔥 Hard',   color: '#ef4444' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestion(item) {
  const options = shuffle([item.def, ...item.wrong])
  return { word: item.word, correct: item.def, options, level: item.level }
}

function buildDeck(level, count = 10) {
  const pool = level === 'all' ? WORDS : WORDS.filter(w => w.level === level)
  return shuffle(pool).slice(0, count).map(buildQuestion)
}

// ─── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ score, total, level, onRestart }) {
  const pct      = Math.round((score / total) * 100)
  const color    = pct >= 80 ? '#10b981' : pct >= 60 ? '#14b8a6' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const emoji    = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '📚' : '💪'
  const message  = pct >= 80 ? 'Excellent vocabulary!' : pct >= 60 ? 'Good work!' : pct >= 40 ? 'Keep studying!' : 'Don\'t give up!'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '20px 0', animation: 'vqFadeUp 0.35s ease' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>
          Quiz complete!
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>{message}</p>
      </div>

      {/* Score ring */}
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg viewBox="0 0 140 140" width="140" height="140">
          <circle cx="70" cy="70" r="58" fill="none" stroke="var(--track)" strokeWidth="10"/>
          <circle cx="70" cy="70" r="58" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 58}`}
            strokeDashoffset={`${2 * Math.PI * 58 * (1 - pct / 100)}`}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{score}/{total} correct</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, width: '100%', maxWidth: 380 }}>
        {[
          { icon: '✅', label: 'Correct',   value: score,         color: '#10b981' },
          { icon: '❌', label: 'Wrong',     value: total - score, color: '#ef4444' },
          { icon: '📊', label: 'Score',     value: `${pct}%`,     color },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 380 }}>
        <button onClick={() => onRestart(level)} style={{
          flex: 1, padding: '13px 0', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(20,184,166,0.25)',
        }}>
          🔄 Same level
        </button>
        <button onClick={() => onRestart('all')} style={{
          flex: 1, padding: '13px 0', borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--bg-card)', color: 'var(--text-secondary)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          🌍 Mixed quiz
        </button>
      </div>
    </div>
  )
}

// ─── Main quiz ────────────────────────────────────────────────────────────────
export function VocabQuizPage() {
  const [level, setLevel]           = useState('medium')
  const [deck, setDeck]             = useState(null)
  const [qIndex, setQIndex]         = useState(0)
  const [selected, setSelected]     = useState(null)   // index of chosen option
  const [score, setScore]           = useState(0)
  const [done, setDone]             = useState(false)
  const [animKey, setAnimKey]       = useState(0)      // forces re-animation on new question

  const startQuiz = (lvl) => {
    setLevel(lvl)
    setDeck(buildDeck(lvl))
    setQIndex(0)
    setSelected(null)
    setScore(0)
    setDone(false)
    setAnimKey(k => k + 1)
  }

  const question = deck?.[qIndex]
  const total    = deck?.length ?? 10

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    if (question.options[idx] === question.correct) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (qIndex + 1 >= total) {
      setDone(true)
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setAnimKey(k => k + 1)
    }
  }

  const levelColor = LEVEL_CONFIG[level]?.color ?? '#14b8a6'

  return (
    <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: '40px 20px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
          Vocabulary quiz
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Read the word and pick the correct definition.
        </p>
      </div>

      {/* Level selector + start */}
      {!deck && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'vqFadeUp 0.3s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Choose difficulty
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setLevel(key)} style={{
                  padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                  border: `2px solid ${level === key ? cfg.color : 'var(--border)'}`,
                  background: level === key ? `${cfg.color}14` : 'var(--bg-card)',
                  color: level === key ? cfg.color : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: 600, transition: 'all 0.15s', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{cfg.label.split(' ')[0]}</span>
                  <div>
                    <div>{cfg.label.split(' ')[1]}</div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginTop: 1 }}>
                      {key === 'all' ? 'Mixed levels' : key === 'easy' ? 'Common words' : key === 'medium' ? 'Intermediate' : 'Advanced'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => startQuiz(level)} style={{
            padding: '15px 0', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${LEVEL_CONFIG[level].color}, ${LEVEL_CONFIG[level].color}bb)`,
            color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 6px 24px ${LEVEL_CONFIG[level].color}44`,
            transition: 'all 0.2s',
          }}>
            Start 10-question quiz →
          </button>

          {/* Word count info */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['easy', 'medium', 'hard'].map(lvl => (
              <div key={lvl} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 99, padding: '3px 12px' }}>
                {WORDS.filter(w => w.level === lvl).length} {lvl} words
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz in progress */}
      {deck && !done && question && (
        <div key={animKey} style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'vqFadeUp 0.25s ease' }}>

          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                Question {qIndex + 1} of {total}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✅ {score}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>·</span>
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>❌ {qIndex - (selected !== null ? 0 : 0) - score + (selected !== null && question.options[selected] !== question.correct ? 0 : 0)}</span>
              </div>
            </div>
            <div style={{ height: 5, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${((qIndex + (selected !== null ? 1 : 0)) / total) * 100}%`,
                background: `linear-gradient(90deg, ${levelColor}99, ${levelColor})`,
                borderRadius: 99, transition: 'width 0.4s ease',
              }}/>
            </div>
          </div>

          {/* Word + level badge */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: levelColor,
                background: `${levelColor}18`,
                padding: '3px 10px', borderRadius: 99,
                border: `1px solid ${levelColor}33`,
              }}>
                {LEVEL_CONFIG[question.level]?.label}
              </span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 4 }}>
              {question.word}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              What does this word mean?
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options.map((opt, idx) => {
              const isCorrect  = opt === question.correct
              const isSelected = selected === idx
              const revealed   = selected !== null

              let bg     = 'var(--bg-card)'
              let border = 'var(--border)'
              let color  = 'var(--text-body)'
              let icon   = null

              if (revealed) {
                if (isCorrect) {
                  bg = 'rgba(16,185,129,0.08)'; border = 'rgba(16,185,129,0.4)'; color = '#10b981'; icon = '✅'
                } else if (isSelected) {
                  bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.4)'; color = '#f87171'; icon = '❌'
                }
              }

              return (
                <button key={idx} onClick={() => handleSelect(idx)} style={{
                  width: '100%', textAlign: 'left',
                  padding: '14px 18px', borderRadius: 14,
                  background: bg, border: `1.5px solid ${border}`,
                  color, fontSize: 14, lineHeight: 1.5,
                  cursor: revealed ? 'default' : 'pointer',
                  transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  fontWeight: revealed && isCorrect ? 600 : 400,
                  transform: isSelected && revealed ? 'scale(1.01)' : 'scale(1)',
                }}
                  onMouseEnter={e => { if (!revealed) { e.currentTarget.style.borderColor = levelColor; e.currentTarget.style.background = `${levelColor}0d` } }}
                  onMouseLeave={e => { if (!revealed) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' } }}
                >
                  <span>{opt}</span>
                  {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
                </button>
              )
            })}
          </div>

          {/* Explanation after answer */}
          {selected !== null && (
            <div style={{ background: question.options[selected] === question.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${question.options[selected] === question.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 14, padding: '14px 18px', animation: 'vqFadeUp 0.2s ease' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: question.options[selected] === question.correct ? '#10b981' : '#f87171', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {question.options[selected] === question.correct ? '✅ Correct!' : '❌ Not quite'}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{question.word}</strong> means: {question.correct}
              </p>
            </div>
          )}

          {/* Next button */}
          {selected !== null && (
            <button onClick={handleNext} style={{
              padding: '14px 0', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${levelColor}, ${levelColor}bb)`,
              color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 20px ${levelColor}44`,
              animation: 'vqFadeUp 0.2s ease',
              transition: 'transform 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {qIndex + 1 >= total ? '🏁 See results' : 'Next question →'}
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {done && (
        <ResultScreen
          score={score}
          total={total}
          level={level}
          onRestart={(lvl) => startQuiz(lvl)}
        />
      )}

      <style>{`
        @keyframes vqFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}