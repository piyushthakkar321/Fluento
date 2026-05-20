import { supabase } from './supabaseClient'

export async function saveSession(userId, { transcript, reply, corrections, score }) {
  const { error: sessionError } = await supabase.from('sessions').insert({
    user_id:     userId,
    transcript,
    ai_feedback: JSON.stringify({ reply, corrections }),
    score,
  })
  if (sessionError) throw sessionError

  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // maybeSingle() returns null instead of throwing when no row exists
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const last    = streak?.last_session_date ?? null
  const current = streak?.current_streak    ?? 0
  const longest = streak?.longest_streak    ?? 0

  const newStreak =
    last === today      ? current           // already practiced today — no change
    : last === yesterday ? current + 1      // continuing streak
    : 1                                     // broken or first ever

  const { error: streakError } = await supabase
    .from('streaks')
    .upsert(
      {
        user_id:           userId,
        current_streak:    newStreak,
        longest_streak:    Math.max(newStreak, longest),
        last_session_date: today,
      },
      { onConflict: 'user_id' }             // key fix — tells Supabase which column to conflict on
    )
  if (streakError) throw streakError

  return { newStreak }
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