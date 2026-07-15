import { TOKEN_STORAGE_KEY } from '../constants'

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

function extractErrorMessage(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
  if (Array.isArray(payload.details) && payload.details.length > 0) {
    const first = payload.details[0]
    if (typeof first === 'string') return first
    if (first?.msg) return first.msg
    if (first?.message) return first.message
  }
  return fallback
}

/**
 * Cliente HTTP compartido. Adjunta Bearer JWT cuando hay sesión.
 */
export async function request(baseUrl, path, options = {}) {
  const {
    method = 'GET',
    body,
    auth = true,
    headers: extraHeaders = {},
    signal,
  } = options

  const headers = {
    Accept: 'application/json',
    ...extraHeaders,
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getStoredToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica que los servicios estén en ejecución.', {
      status: 0,
      code: 'NETWORK_ERROR',
    })
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload, `Error ${response.status}`), {
      status: response.status,
      code: payload?.error ?? null,
      details: payload?.details ?? null,
    })
  }

  return payload
}
