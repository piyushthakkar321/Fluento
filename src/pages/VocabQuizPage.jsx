import { useState, useMemo } from 'react'

const ALL_WORDS = [
  // ── Daily Life ──────────────────────────────────────────────────────────────
  { word: 'Abandon',       meaning: 'To leave someone or something behind permanently',                    options: ['To follow closely',                                        'To leave someone or something behind permanently',                    'To improve gradually',                                               'To celebrate loudly'],                          category: 'Daily Life' },
  { word: 'Frugal',        meaning: 'Careful and economical with money or resources',                      options: ['Extremely wasteful',                                       'Careful and economical with money or resources',                      'Very emotional',                                                     'Very loud'],                                    category: 'Daily Life' },
  { word: 'Lament',        meaning: 'To express grief or sorrow about something',                          options: ['To celebrate noisily',                                     'To express grief or sorrow about something',                          'To argue loudly',                                                    'To eat hungrily'],                              category: 'Daily Life' },
  { word: 'Resilient',     meaning: 'Able to recover quickly from difficulties',                           options: ['Easily broken down',                                       'Able to recover quickly from difficulties',                           'Very rigid',                                                         'Never changing'],                               category: 'Daily Life' },
  { word: 'Subtle',        meaning: 'So delicate or precise as to be difficult to notice',                 options: ['Very loud and obvious',                                    'So delicate or precise as to be difficult to notice',                 'Extremely heavy',                                                    'Very straightforward'],                         category: 'Daily Life' },
  { word: 'Trivial',       meaning: 'Of little importance or value; insignificant',                        options: ['Extremely important',                                      'Of little importance or value; insignificant',                        'Very complex',                                                       'Very frightening'],                             category: 'Daily Life' },
  { word: 'Procrastinate', meaning: 'To delay or postpone doing something',                               options: ['To act immediately',                                       'To delay or postpone doing something',                                'To work very hard',                                                  'To forget completely'],                         category: 'Daily Life' },
  { word: 'Spontaneous',   meaning: 'Done naturally without planning or thought',                          options: ['Carefully planned',                                        'Done naturally without planning or thought',                          'Very slow and deliberate',                                           'Forced and unnatural'],                         category: 'Daily Life' },
  { word: 'Mundane',       meaning: 'Lacking interest or excitement; routine',                             options: ['Exciting and unusual',                                     'Lacking interest or excitement; routine',                             'Very dangerous',                                                     'Extremely creative'],                           category: 'Daily Life' },
  { word: 'Thrifty',       meaning: 'Using money and resources carefully and without waste',               options: ['Spending money freely',                                    'Using money and resources carefully and without waste',               'Very generous',                                                      'Completely broke'],                             category: 'Daily Life' },
  { word: 'Serene',        meaning: 'Calm, peaceful, and untroubled',                                     options: ['Loud and chaotic',                                         'Calm, peaceful, and untroubled',                                      'Very angry',                                                         'Deeply sad'],                                   category: 'Daily Life' },
  { word: 'Versatile',     meaning: 'Able to adapt or be used in many different ways',                    options: ['Limited to one purpose only',                              'Able to adapt or be used in many different ways',                     'Very slow to change',                                                'Completely unreliable'],                        category: 'Daily Life' },
  { word: 'Pessimistic',   meaning: 'Tending to see the worst aspect of things',                          options: ['Always expecting the best',                                'Tending to see the worst aspect of things',                           'Completely indifferent',                                             'Very excited about life'],                      category: 'Daily Life' },

  // ── Travel ──────────────────────────────────────────────────────────────────
  { word: 'Nomadic',       meaning: 'Moving from place to place without a permanent home',                options: ['Settled and stationary',                                   'Moving from place to place without a permanent home',                 'Very fast-moving',                                                   'Extremely social'],                             category: 'Travel'    },
  { word: 'Itinerary',     meaning: 'A planned route or schedule for a journey',                          options: ['A type of luggage',                                        'A planned route or schedule for a journey',                           'A travel insurance policy',                                          'A foreign currency'],                           category: 'Travel'    },
  { word: 'Layover',       meaning: 'A break in a journey, especially at an airport',                     options: ['Extra luggage fees',                                       'A break in a journey, especially at an airport',                      'A missed connection',                                                'A travel document'],                            category: 'Travel'    },
  { word: 'Customs',       meaning: 'The official process of checking goods at a border',                 options: ['Local traditions only',                                    'The official process of checking goods at a border',                  'A travel tax',                                                       'A type of visa'],                               category: 'Travel'    },
  { word: 'Souvenir',      meaning: 'A thing kept as a reminder of a person, place, or event',            options: ['A travel document',                                        'A thing kept as a reminder of a person, place, or event',             'A local food item',                                                  'A type of transport'],                          category: 'Travel'    },
  { word: 'Expedition',    meaning: 'A journey undertaken for a specific purpose',                        options: ['A short daily walk',                                       'A journey undertaken for a specific purpose',                         'A cancelled trip',                                                   'A return flight'],                              category: 'Travel'    },
  { word: 'Landmark',      meaning: 'A recognisable feature or object that marks a location',             options: ['A road sign',                                              'A recognisable feature or object that marks a location',              'A tourist ticket',                                                   'A city map'],                                   category: 'Travel'    },
  { word: 'Detour',        meaning: 'A longer alternative route taken to avoid something',                options: ['A direct shortcut',                                        'A longer alternative route taken to avoid something',                 'A travel delay',                                                     'A missed turn'],                                category: 'Travel'    },

  // ── Workplace ───────────────────────────────────────────────────────────────
  { word: 'Ambiguous',     meaning: 'Open to more than one interpretation; unclear',                      options: ['Perfectly clear',                                          'Open to more than one interpretation; unclear',                       'Very loud and obvious',                                              'Completely finished'],                          category: 'Workplace' },
  { word: 'Diligent',      meaning: 'Showing care and persistent effort in work',                         options: ['Carelessly fast',                                          'Showing care and persistent effort in work',                          'Stubbornly idle',                                                    'Openly dishonest'],                             category: 'Workplace' },
  { word: 'Eloquent',      meaning: 'Fluent and persuasive in speaking or writing',                       options: ['Very quiet and shy',                                       'Fluent and persuasive in speaking or writing',                        'Confused and forgetful',                                             'Rude and aggressive'],                          category: 'Workplace' },
  { word: 'Intricate',     meaning: 'Very complex or detailed in design or structure',                    options: ['Very simple and plain',                                    'Very complex or detailed in design or structure',                     'Completely broken',                                                  'Very noisy'],                                   category: 'Workplace' },
  { word: 'Laconic',       meaning: 'Using very few words; brief and to the point',                       options: ['Speaking at great length',                                 'Using very few words; brief and to the point',                        'Very emotional',                                                     'Always agreeable'],                             category: 'Workplace' },
  { word: 'Meticulous',    meaning: 'Very careful and precise about every detail',                        options: ['Extremely careless',                                       'Very careful and precise about every detail',                         'Very impatient',                                                     'Completely random'],                            category: 'Workplace' },
  { word: 'Pragmatic',     meaning: 'Dealing with problems in a practical and realistic way',             options: ['Idealistic and dreamy',                                    'Dealing with problems in a practical and realistic way',              'Very emotional',                                                     'Strictly traditional'],                         category: 'Workplace' },
  { word: 'Tenacious',     meaning: 'Holding firmly to something; very persistent',                       options: ['Easily giving up',                                         'Holding firmly to something; very persistent',                        'Very forgetful',                                                     'Openly dishonest'],                             category: 'Workplace' },
  { word: 'Verbose',       meaning: 'Using more words than needed; long-winded',                          options: ['Very brief and clear',                                     'Using more words than needed; long-winded',                           'Completely silent',                                                  'Very precise'],                                 category: 'Workplace' },
  { word: 'Delegate',      meaning: 'To assign a task or responsibility to someone else',                 options: ['To do everything yourself',                                'To assign a task or responsibility to someone else',                  'To cancel a project',                                                'To complain about work'],                       category: 'Workplace' },
  { word: 'Collaborate',   meaning: 'To work jointly with others toward a common goal',                   options: ['To work entirely alone',                                   'To work jointly with others toward a common goal',                    'To compete against colleagues',                                      'To avoid responsibilities'],                    category: 'Workplace' },
  { word: 'Proficient',    meaning: 'Competent and skilled at doing something',                           options: ['Completely untrained',                                     'Competent and skilled at doing something',                            'Slightly interested',                                                'Very slow to learn'],                           category: 'Workplace' },
  { word: 'Redundant',     meaning: 'No longer needed or useful; superfluous',                            options: ['Absolutely essential',                                     'No longer needed or useful; superfluous',                             'Very important',                                                     'Newly created'],                                category: 'Workplace' },
  { word: 'Innovative',    meaning: 'Introducing new ideas or methods; creative and original',            options: ['Strictly following old methods',                           'Introducing new ideas or methods; creative and original',             'Very slow to change',                                                'Copying others exactly'],                       category: 'Workplace' },
  { word: 'Complacent',    meaning: 'Showing uncritical satisfaction with oneself; self-satisfied',       options: ['Always striving to improve',                               'Showing uncritical satisfaction with oneself; self-satisfied',         'Very hard-working',                                                  'Deeply unhappy'],                               category: 'Workplace' },

  // ── Academic ────────────────────────────────────────────────────────────────
  { word: 'Abundant',      meaning: 'Existing in large quantities; more than enough',                     options: ['Extremely rare',                                           'Existing in large quantities; more than enough',                      'Slightly damaged',                                                   'Completely invisible'],                         category: 'Academic'  },
  { word: 'Ephemeral',     meaning: 'Lasting for only a very short time',                                 options: ['Lasting forever',                                          'Lasting for only a very short time',                                  'Very heavy and solid',                                               'Extremely loud'],                               category: 'Academic'  },
  { word: 'Harbinger',     meaning: 'A sign or warning that something is to come',                        options: ['A final conclusion',                                       'A sign or warning that something is to come',                         'A loud celebration',                                                 'A sudden disappearance'],                       category: 'Academic'  },
  { word: 'Insidious',     meaning: 'Proceeding in a gradual, harmful, and subtle way',                   options: ['Openly helpful',                                           'Proceeding in a gradual, harmful, and subtle way',                    'Very obvious and loud',                                              'Completely harmless'],                          category: 'Academic'  },
  { word: 'Hypothesis',    meaning: 'A proposed explanation made on the basis of limited evidence',       options: ['A proven scientific law',                                  'A proposed explanation made on the basis of limited evidence',         'A final research conclusion',                                        'A published textbook'],                         category: 'Academic'  },
  { word: 'Ambivalent',    meaning: 'Having mixed feelings or contradictory ideas about something',       options: ['Completely certain',                                       'Having mixed feelings or contradictory ideas about something',         'Very enthusiastic',                                                  'Deeply committed'],                             category: 'Academic'  },
  { word: 'Empirical',     meaning: 'Based on observation or experience rather than theory',              options: ['Based purely on guesswork',                                'Based on observation or experience rather than theory',               'Completely theoretical',                                             'Historically recorded'],                        category: 'Academic'  },
  { word: 'Paradox',       meaning: 'A statement that contradicts itself but may be true',                options: ['A simple straightforward fact',                             'A statement that contradicts itself but may be true',                  'A mathematical formula',                                             'A historical event'],                           category: 'Academic'  },
  { word: 'Obsolete',      meaning: 'No longer produced or used; out of date',                            options: ['Modern and cutting-edge',                                  'No longer produced or used; out of date',                             'Very popular currently',                                             'Recently invented'],                            category: 'Academic'  },

  // ── Social ──────────────────────────────────────────────────────────────────
  { word: 'Benevolent',    meaning: 'Well-meaning and kindly toward others',                              options: ['Constantly angry',                                         'Well-meaning and kindly toward others',                               'Very secretive',                                                     'Easily frightened'],                            category: 'Social'    },
  { word: 'Candid',        meaning: 'Truthful and straightforward; frank',                                options: ['Deliberately vague',                                       'Truthful and straightforward; frank',                                 'Overly formal',                                                      'Extremely shy'],                                category: 'Social'    },
  { word: 'Garrulous',     meaning: 'Excessively talkative, especially on trivial matters',               options: ['Very quiet and reserved',                                  'Excessively talkative, especially on trivial matters',                'Completely honest',                                                  'Deeply thoughtful'],                            category: 'Social'    },
  { word: 'Hostile',       meaning: 'Showing aggression or opposition; unfriendly',                       options: ['Very welcoming',                                           'Showing aggression or opposition; unfriendly',                        'Quietly nervous',                                                    'Extremely helpful'],                            category: 'Social'    },
  { word: 'Jovial',        meaning: 'Cheerful and friendly in manner',                                    options: ['Deeply serious',                                           'Cheerful and friendly in manner',                                     'Always angry',                                                       'Frequently absent'],                            category: 'Social'    },
  { word: 'Zealous',       meaning: 'Having great energy or enthusiasm for a cause',                      options: ['Very indifferent',                                         'Having great energy or enthusiasm for a cause',                        'Easily bored',                                                       'Quietly modest'],                               category: 'Social'    },
  { word: 'Empathy',       meaning: "Understanding and sharing another person's feelings",                options: ['Lack of any emotion',                                      "Understanding and sharing another person's feelings",                  'Strong physical ability',                                            'Hatred of others'],                             category: 'Social'    },
  { word: 'Gregarious',    meaning: 'Fond of the company of others; sociable',                            options: ['Preferring to be alone',                                   'Fond of the company of others; sociable',                             'Easily irritated by people',                                         'Very formal in manner'],                        category: 'Social'    },
  { word: 'Condescending', meaning: 'Acting as if others are inferior or less important',                 options: ['Treating everyone as equal',                               'Acting as if others are inferior or less important',                   'Being overly generous',                                              'Showing great admiration'],                     category: 'Social'    },
  { word: 'Tactful',       meaning: 'Careful not to offend or upset others',                              options: ['Deliberately rude',                                        'Careful not to offend or upset others',                               'Very blunt and harsh',                                               'Completely indifferent'],                       category: 'Social'    },
  { word: 'Arrogant',      meaning: "Having an exaggerated sense of one's own importance",                options: ['Very humble and modest',                                   "Having an exaggerated sense of one's own importance",                  'Extremely shy and quiet',                                            'Very kind and generous'],                       category: 'Social'    },
  { word: 'Cynical',       meaning: 'Believing that people are motivated only by self-interest',          options: ['Trusting and optimistic',                                  'Believing that people are motivated only by self-interest',            'Very emotional and sensitive',                                       'Deeply religious'],                             category: 'Social'    },
  { word: 'Introverted',   meaning: 'Tending to be inward-looking and prefer solitude',                   options: ['Very outgoing and social',                                 'Tending to be inward-looking and prefer solitude',                    'Extremely talkative',                                                'Always seeking attention'],                     category: 'Social'    },
]

const CATEGORY_CONFIG = {
  'Daily Life': { color: '#14b8a6', bg: 'rgba(20,184,166,0.1)',  emoji: '🏠' },
  'Travel':     { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  emoji: '✈️' },
  'Workplace':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', emoji: '💼' },
  'Academic':   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', emoji: '📚' },
  'Social':     { color: '#10b981', bg: 'rgba(16,185,129,0.1)', emoji: '💬' },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(count = 8) {
  return shuffle(ALL_WORDS).slice(0, count).map(w => ({
    ...w,
    options: shuffle(w.options),
  }))
}

// ── Result screen ──────────────────────────────────────────────────────────────
function ResultScreen({ score, total, onRestart }) {
  const pct     = Math.round((score / total) * 100)
  const color   = pct >= 80 ? '#10b981' : pct >= 60 ? '#14b8a6' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const emoji   = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '📚' : '💪'
  const message = pct >= 80 ? 'Excellent vocabulary!' : pct >= 60 ? 'Good work!' : pct >= 40 ? 'Keep studying!' : "Don't give up!"
  const C       = 2 * Math.PI * 52

  return (
    <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>Quiz complete!</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 6 }}>{message}</p>
      </div>

      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg viewBox="0 0 120 120" width="140" height="140">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--track)" strokeWidth="9"/>
          <circle cx="60" cy="60" r="52" fill="none"
            stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.9s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{score}/{total} correct</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%' }}>
        {[
          { icon: '✅', label: 'Correct', value: score,         color: '#10b981' },
          { icon: '❌', label: 'Wrong',   value: total - score, color: '#ef4444' },
          { icon: '📊', label: 'Score',   value: `${pct}%`,     color },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 10px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <button onClick={onRestart} style={{
        width: '100%', padding: '17px 0', borderRadius: 16, border: 'none',
        background: 'var(--accent)', color: '#fff',
        fontSize: 16, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(20,184,166,0.35)',
        minHeight: 56,
      }}>
        🔄 Try another quiz
      </button>
    </div>
  )
}

// ── Main quiz ──────────────────────────────────────────────────────────────────
export function VocabQuizPage() {
  const [deck, setDeck]         = useState(null)
  const [qIndex, setQIndex]     = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore]       = useState(0)
  const [done, setDone]         = useState(false)

  const TOTAL = 8

  const startQuiz = () => {
    setDeck(buildDeck(TOTAL))
    setQIndex(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  const q = deck?.[qIndex]

  const handleSelect = (opt) => {
    if (selected !== null) return
    setSelected(opt)
    if (opt === q.meaning) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (qIndex + 1 >= TOTAL) { setDone(true) }
    else { setQIndex(i => i + 1); setSelected(null) }
  }

  // ── Landing ──────────────────────────────────────────────────────────────────
  if (!deck) return (
    <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>📝</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Vocabulary quiz</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
          {TOTAL} words · multiple choice · see your score at the end
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', width: '100%', padding: '0 4px' }}>
        {Object.entries(CATEGORY_CONFIG).map(([name, cfg]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.color}33`, flexShrink: 0 }}>
            <span style={{ fontSize: 13 }}>{cfg.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{name}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%' }}>
        {[
          { icon: '📖', label: `${TOTAL} words`, sub: 'per quiz' },
          { icon: '🎯', label: '4 choices',       sub: 'per word' },
          { icon: '⏱️', label: '~3 min',          sub: 'to finish' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 8px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <button onClick={startQuiz} style={{
        width: '100%', padding: '18px 0', borderRadius: 16, border: 'none',
        background: 'var(--accent)', color: '#fff',
        fontSize: 17, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 8px 28px rgba(20,184,166,0.4)',
        minHeight: 60,
      }}>
        Start quiz →
      </button>
    </div>
  )

  // ── Results ───────────────────────────────────────────────────────────────────
  if (done) return <ResultScreen score={score} total={TOTAL} onRestart={startQuiz}/>

  // ── Question ──────────────────────────────────────────────────────────────────
  const answered = selected !== null
  const gotRight = answered && selected === q.meaning
  const catCfg   = CATEGORY_CONFIG[q.category] || CATEGORY_CONFIG['Daily Life']
  const pctDone  = ((qIndex + (answered ? 1 : 0)) / TOTAL) * 100

  return (
    <>
      <style>{`
        @keyframes vqCorrect {
          0%   { transform: scale(1); }
          45%  { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes vqWrong {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }
        @keyframes vqFade {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div style={{ padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{qIndex + 1} / {TOTAL}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>✅ {score} correct</span>
          </div>
          <div style={{ height: 6, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${pctDone}%`,
              background: 'linear-gradient(90deg, #6366f1, var(--accent))',
              transition: 'width 0.35s ease',
            }}/>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '6px 14px', borderRadius: 99, background: catCfg.bg, border: `1px solid ${catCfg.color}33` }}>
            <span style={{ fontSize: 14 }}>{catCfg.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: catCfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{q.category}</span>
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1.5px', marginBottom: 10 }}>
            {q.word}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            What does this word mean?
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.meaning
            const isPicked  = opt === selected
            let bg         = 'var(--bg-card)'
            let border     = 'var(--border)'
            let textColor  = 'var(--text-body)'
            let icon       = null
            let anim       = 'none'
            let fontWeight = 500

            if (answered) {
              if (isCorrect)     { bg = 'rgba(16,185,129,0.08)'; border = 'rgba(16,185,129,0.5)'; textColor = '#10b981'; icon = '✅'; fontWeight = 700; anim = 'vqCorrect 0.4s ease' }
              else if (isPicked) { bg = 'rgba(239,68,68,0.08)';  border = 'rgba(239,68,68,0.5)';  textColor = '#f87171'; icon = '❌'; anim = 'vqWrong 0.4s ease' }
            }

            return (
              <button key={i} onClick={() => handleSelect(opt)} style={{
                width: '100%', minHeight: 58, padding: '16px 18px',
                borderRadius: 16, border: `1.5px solid ${border}`,
                background: bg, color: textColor,
                fontSize: 15, fontWeight, lineHeight: 1.4,
                cursor: answered ? 'default' : 'pointer',
                textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                transition: 'border-color 0.15s ease, background 0.15s ease',
                animation: anim,
                boxShadow: 'var(--shadow-card)',
              }}>
                <span>{opt}</span>
                {icon && <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>}
              </button>
            )
          })}
        </div>

        {answered && (
          <div style={{
            padding: '16px 18px', borderRadius: 16, animation: 'vqFade 0.25s ease',
            background: gotRight ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
            border: `1px solid ${gotRight ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: gotRight ? '#10b981' : '#f87171', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {gotRight ? '✅ Correct!' : '❌ Not quite'}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{q.word}</strong> means: {q.meaning}
            </p>
          </div>
        )}

        {answered && (
          <button onClick={handleNext} style={{
            width: '100%', padding: '18px 0', borderRadius: 16, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(20,184,166,0.4)',
            minHeight: 60, animation: 'vqFade 0.2s ease',
          }}>
            {qIndex + 1 >= TOTAL ? '🏁 See results' : 'Next →'}
          </button>
        )}
      </div>
    </>
  )
}