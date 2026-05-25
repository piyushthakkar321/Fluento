import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const groqKey = process.env.GROQ_KEY
  if (!groqKey) return res.status(500).json({ error: 'GROQ_KEY not configured' })

  try {
    // Parse the incoming multipart form
    const form = formidable({ keepExtensions: true })
    const [, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) return res.status(400).json({ error: 'No audio file received' })

    // Read parsed file and rebuild FormData for Groq
    const fileBuffer = fs.readFileSync(file.filepath)
    const blob       = new Blob([fileBuffer], { type: file.mimetype || 'audio/webm' })

    const outForm = new FormData()
    outForm.append('file', blob, file.originalFilename || 'audio.webm')
    outForm.append('model', 'whisper-large-v3')
    outForm.append('language', 'en')
    outForm.append('response_format', 'json')

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: outForm,
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('Groq error:', err)
      return res.status(502).json({ error: 'Groq error', detail: err })
    }

    const data = await groqRes.json()
    return res.status(200).json(data)

  } catch (err) {
    console.error('Transcribe error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}