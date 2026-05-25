export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const groqKey = process.env.GROQ_KEY
  if (!groqKey) return res.status(500).json({ error: 'GROQ_KEY not configured' })

  try {
    // Collect raw body chunks first
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const rawBody = Buffer.concat(chunks)

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': req.headers['content-type'],
      },
      body: rawBody,
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('Groq transcription error:', err)
      return res.status(502).json({ error: 'Groq error', detail: err })
    }

    const data = await groqRes.json()
    return res.status(200).json(data)

  } catch (err) {
    console.error('Transcribe handler error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}