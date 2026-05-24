import { supabase } from './supabaseClient'

export async function saveSession(userId, { transcript, reply, corrections, score }) {
  const { error: sessionError } = await supabase.from('sessions').insert({
    user_id:     userId,
    transcript,
    ai_feedback: JSON.stringify({ reply, corrections }),
    score,
  })
  if (sessionError) throw sessionError

  await updateStreak(userId)
}

async function updateStreak(userId) {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // maybeSingle returns null instead of throwing when no row exists
  const { data: existing, error: fetchError } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError) { console.error('Streak fetch error:', fetchError); return }

  if (!existing) {
    // First ever session — insert a fresh row
    await supabase.from('streaks').insert({
      user_id:           userId,
      current_streak:    1,
      longest_streak:    1,
      last_session_date: today,
    })
    return
  }

  const last    = existing.last_session_date
  const current = existing.current_streak
  const longest = existing.longest_streak

  // Already practiced today — nothing to change
  if (last === today) return

  const newStreak = last === yesterday ? current + 1 : 1
  const newLongest = Math.max(newStreak, longest)

  const { error: updateError } = await supabase
    .from('streaks')
    .update({
      current_streak:    newStreak,
      longest_streak:    newLongest,
      last_session_date: today,
    })
    .eq('user_id', userId)

  if (updateError) console.error('Streak update error:', updateError)
}

export async function getStreak(userId) {
  const { data } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', userId)
    .maybeSingle()
  return data ?? { current_streak: 0, longest_streak: 0 }
}

export async function getRecentSessions(userId, limit = 20) {
  const { data } = await supabase
    .from('sessions')
    .select('id, transcript, ai_feedback, score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}