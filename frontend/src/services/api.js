import API_BASE_URL from '../config';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Sends messages to the Groq API and returns the assistant's reply text.
 * @param {Array} messages Conversation history
 * @param {Object} settings Model settings
 * @param {Function} onChunk Callback to receive incoming chunk text progressively
 */
export async function sendMessage(messages, settings, onChunk) {
  const openAiModel = settings?.model || 'llama-3.3-70b-versatile'
  const url = 'https://api.groq.com/openai/v1/chat/completions'

  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }))

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: openAiModel,
        messages: formattedMessages,
        stream: true
      })
    })

    if (!res.ok) {
      let msg = res.statusText
      try {
        const errorData = await res.json()
        msg = errorData.error?.message || msg
      } catch (e) {}

      if (res.status === 401)
        throw new Error('Groq: Invalid built-in API key. Please check the hardcoded key.')
      if (res.status === 429)
        throw new Error(`Groq: Rate limit exceeded (${msg}). Please wait a moment.`)
      throw new Error(`Groq error: ${msg}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullResponse = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const data = JSON.parse(trimmed.slice(6))
            const delta = data.choices?.[0]?.delta?.content
            if (delta) {
              fullResponse += delta
              if (onChunk) onChunk(delta)
            }
          } catch (e) {
            // Ignore parse errors on incomplete chunks
          }
        }
      }
    }

    return fullResponse
  } catch (err) {
    throw new Error(err.message || 'Network error. Check your connection.')
  }
}
import axios from 'axios';

// Strip `/api` suffix so axios baseURL is just the origin,
// while individual routes in Businessloanapi.js already include `/api/...`
const AXIOS_BASE = API_BASE_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: AXIOS_BASE,
});

// ── Attach JWT token to every request ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('tushgpt_jwt') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 globally ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('tushgpt_jwt');
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;