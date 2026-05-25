import { useState, useRef } from 'react'

// webm works in Chrome/Firefox. Safari needs audio/mp4.
const MIME = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'

export function useVoiceRecorder({ onTranscript, onError }) {
  const [state, setState] = useState('idle')
  // 'idle' | 'recording' | 'transcribing'

  const mediaRef  = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream, { mimeType: MIME })
      mediaRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => transcribe()
      recorder.start(100) // collect a chunk every 100ms
      setState('recording')
    } catch (err) {
      onError?.('Microphone access denied.')
    }
  }

  const stop = () => {
    mediaRef.current?.stop()
    // Release the mic indicator in the browser tab
    streamRef.current?.getTracks().forEach(t => t.stop())
    setState('transcribing')
  }

  const transcribe = async () => {
    const blob = new Blob(chunksRef.current, { type: MIME })
    const form = new FormData()
    form.append('file', blob, 'audio.webm')
    form.append('model', 'whisper-large-v3')
    form.append('task', 'translate')
    form.append('response_format', 'json')

    try {
      const res = await fetch('/api/transcribe', {
  method: 'POST',
  body: form,
})
      if (!res.ok) {
        const detail = await res.text()
        throw new Error(`${res.status} – ${detail}`)
      }
      const { text } = await res.json()
      onTranscript?.(text.trim())
    } catch (err) {
      onError?.(`Transcription failed: ${err.message}`)
    } finally {
      setState('idle')
    }
  }

  const toggle = () => (state === 'recording' ? stop() : start())

  return { state, start, stop, toggle }
}