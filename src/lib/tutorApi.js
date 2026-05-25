export async function getTutorResponse(userMessage, history = [], difficulty = 'medium', userId = null) {
  const res = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage, history, difficulty, userId }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Tutor API error: ${res.status}`)
  }

  const data = await res.json()
  return data  // { reply, corrections, score }
}