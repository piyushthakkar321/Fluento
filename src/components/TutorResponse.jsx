export function TutorResponse({ response, loading }) {
  if (loading) return <LoadingBubble />
  if (!response) return null

  const { reply, corrections, score } = response

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(99,102,241,0.06))', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '20px 22px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Fluento
        </span>
        <p style={{ margin: '10px 0 0', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)' }}>{reply}</p>
      </div>

      <ScoreBar score={score} />

      {corrections.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Corrections
          </span>
          {corrections.map((c, i) => <CorrectionCard key={i} {...c} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 14, color: '#14b8a6', padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>✨</span> Perfect — no mistakes!
        </div>
      )}
    </div>
  )
}

function ScoreBar({ score }) {
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#14b8a6' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Keep practising'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', transition: 'background 0.25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Session score</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/100 · {label}</span>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  )
}

function CorrectionCard({ original, corrected, explanation }) {
  return (
    <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#f87171', textDecoration: 'line-through', opacity: 0.8 }}>{original}</span>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>→</span>
        <span style={{ fontSize: 14, color: '#34d399', fontWeight: 600 }}>{corrected}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{explanation}</p>
    </div>
  )
}

function LoadingBubble() {
  return (
    <div style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 16, padding: '22px', display: 'flex', gap: 7, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: '50%', background: '#14b8a6',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: `${i * 0.15}s`, opacity: 0.7,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.5} 50%{transform:translateY(-7px);opacity:1} }`}</style>
    </div>
  )
}