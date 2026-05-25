const SYSTEM = (difficulty) => {
  const guide = {
    easy:   'The user is a beginner. Use simple vocabulary. Point out only the single most important mistake (max 1 correction). Be very encouraging and patient.',
    medium: 'The user is intermediate. Reply naturally. Correct up to 2 grammar or vocabulary mistakes. Be warm and supportive.',
    hard:   'The user is advanced. Reply with rich vocabulary. Correct every grammar, vocabulary, and fluency issue you notice. Be thorough but kind.',
  }

  return `You are Fluento, a warm and encouraging English conversation tutor.
The user is a non-native English speaker practising spoken English.
Difficulty: ${guide[difficulty] || guide.medium}

Your job:
1. Reply naturally to keep the conversation going (1–3 sentences).
2. Note mistakes according to the difficulty level above.
3. Return ONLY valid JSON — no extra text, no markdown fences:

{
  "reply": "Your conversational response here.",
  "corrections": [
    {
      "original":    "the phrase the user said incorrectly",
      "corrected":   "the correct version",
      "explanation": "brief, friendly explanation"
    }
  ],
  "score": 82
}

Score guide (0–100):
  90–100  near-perfect grammar and natural phrasing
  70–89   minor mistakes, meaning is clear
  50–69   several errors but understandable
  below 50  significant errors affecting clarity

If no mistakes, return an empty corrections array.
Always sound like a helpful, encouraging friend.`
}

// ── In-memory rate limiting ───────────────────────────────────────────────────
const userHits = new Map()   // userId  → { count, resetAt }
const ipHits   = new Map()   // ip      → { count, resetAt }

const USER_LIMIT = 20
const IP_LIMIT   = 50
const WINDOW_MS  = 60 * 60 * 1000   // 1 hour

function checkLimit(map, key, limit) {
  const now  = Date.now()
  const entry = map.get(key)

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false   // not limited
  }

  entry.count++
  if (entry.count > limit) return true   // limited

  return false
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip     = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const userId = req.body?.userId || null

  if (checkLimit(ipHits, ip, IP_LIMIT)) {
    return res.status(429).json({ error: 'You have reached your hourly limit. Please try again later.' })
  }
  if (userId && checkLimit(userHits, userId, USER_LIMIT)) {
    return res.status(429).json({ error: 'You have reached your hourly limit. Please try again later.' })
  }

  const { message, history = [], difficulty = 'medium' } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid message' })
  }

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    return res.status(500).json({ error: 'GROQ_KEY not configured on server' })
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM(difficulty) },
          ...history.slice(-10),            // cap history to last 10 messages
          { role: 'user', content: message },
        ],
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('Groq error:', err)
      return res.status(502).json({ error: 'Groq API error', detail: err })
    }

    const groqData = await groqRes.json()
    const parsed   = JSON.parse(groqData.choices[0].message.content)

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}