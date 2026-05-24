export async function getTutorResponse(userMessage, history = [], difficulty = 'medium') {
  const res = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage, history, difficulty }),
  })

  if (!res.ok) throw new Error(`Tutor API error: ${res.status}`)

  const data = await res.json()
  return data  // { reply, corrections, score }
}