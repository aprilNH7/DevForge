import { useState, useEffect } from 'react'

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and add padding
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) {
    base64 += '='.repeat(4 - pad)
  }
  return decodeURIComponent(
    Array.from(atob(base64), c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  )
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

function getExpiryStatus(payload: Record<string, unknown>): { text: string; color: string } | null {
  const exp = payload.exp as number | undefined
  if (!exp) return null

  const now = Math.floor(Date.now() / 1000)
  const diff = exp - now

  if (diff < 0) {
    const ago = Math.abs(diff)
    if (ago < 3600) return { text: `Expired ${Math.floor(ago / 60)}m ago`, color: 'text-[var(--color-error)]' }
    if (ago < 86400) return { text: `Expired ${Math.floor(ago / 3600)}h ago`, color: 'text-[var(--color-error)]' }
    return { text: `Expired ${Math.floor(ago / 86400)}d ago`, color: 'text-[var(--color-error)]' }
  }

  if (diff < 3600) return { text: `Expires in ${Math.floor(diff / 60)}m`, color: 'text-[var(--color-warning)]' }
  if (diff < 86400) return { text: `Expires in ${Math.floor(diff / 3600)}h`, color: 'text-[var(--color-warning)]' }
  return { text: `Expires in ${Math.floor(diff / 86400)}d`, color: 'text-[var(--color-success)]' }
}

const KNOWN_CLAIMS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration Time',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
}

export default function JwtDecoder() {
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!token.trim()) {
      setDecoded(null)
      setError('')
      return
    }

    try {
      const parts = token.trim().split('.')
      if (parts.length !== 3) {
        setError('Invalid JWT: Expected 3 parts separated by dots')
        setDecoded(null)
        return
      }

      const header = JSON.parse(base64UrlDecode(parts[0]))
      const payload = JSON.parse(base64UrlDecode(parts[1]))
      const signature = parts[2]

      setDecoded({ header, payload, signature })
      setError('')
    } catch (e) {
      setError(`Failed to decode: ${(e as Error).message}`)
      setDecoded(null)
    }
  }, [token])

  const copySection = async (section: string, data: string) => {
    await navigator.clipboard.writeText(data)
    setCopied(section)
    setTimeout(() => setCopied(null), 2000)
  }

  const loadSample = () => {
    // A sample JWT (not a real secret)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '')
    const payload = btoa(JSON.stringify({
      sub: '1234567890',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'devforge.app',
      role: 'admin',
    })).replace(/=/g, '')
    const sig = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    setToken(`${header}.${payload}.${sig}`)
  }

  const expiryStatus = decoded ? getExpiryStatus(decoded.payload) : null

  const renderValue = (key: string, value: unknown): React.ReactNode => {
    if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number') {
      return (
        <span>
          <span className="text-[#f59e0b]">{value}</span>
          <span className="text-[var(--color-text-muted)] ml-2 text-xs">
            ({formatTimestamp(value)})
          </span>
        </span>
      )
    }
    if (typeof value === 'string') return <span className="text-[#22c55e]">"{value}"</span>
    if (typeof value === 'number') return <span className="text-[#f59e0b]">{value}</span>
    if (typeof value === 'boolean') return <span className="text-[#a78bfa]">{String(value)}</span>
    if (value === null) return <span className="text-[var(--color-error)]">null</span>
    return <span className="text-[var(--color-text-secondary)]">{JSON.stringify(value)}</span>
  }

  return (
    <div>
      <div className="tool-header">
        <h2>JWT Decoder</h2>
        <p>Decode JSON Web Tokens and inspect header, payload, and expiry</p>
      </div>

      {/* Input */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="label mb-0">Token</span>
          <div className="flex gap-2">
            <button onClick={loadSample} className="btn-secondary text-xs !py-1 !px-2">
              Sample
            </button>
            <button onClick={() => setToken('')} className="btn-secondary text-xs !py-1 !px-2">
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Paste your JWT token here (eyJhbGciOiJIUzI1NiIs...)"
          className="input-field textarea-code min-h-[100px]"
          spellCheck={false}
        />
        {error && (
          <div className="mt-2 text-sm text-[var(--color-error)]">{error}</div>
        )}
      </div>

      {decoded && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="card flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">Algorithm:</span>
              <span className="badge bg-[var(--color-accent-glow)] text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                {decoded.header.alg as string || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">Type:</span>
              <span className="badge bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]">
                {decoded.header.typ as string || 'Unknown'}
              </span>
            </div>
            {expiryStatus && (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${expiryStatus.color}`}>
                  {expiryStatus.text}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Header */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="label mb-0 text-[#ef4444]">Header</span>
                <button
                  onClick={() => copySection('header', JSON.stringify(decoded.header, null, 2))}
                  className="btn-secondary text-xs !py-1 !px-2"
                >
                  {copied === 'header' ? '✓' : 'Copy'}
                </button>
              </div>
              <div className="code-block">
                {JSON.stringify(decoded.header, null, 2)}
              </div>
            </div>

            {/* Payload */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="label mb-0 text-[#a78bfa]">Payload</span>
                <button
                  onClick={() => copySection('payload', JSON.stringify(decoded.payload, null, 2))}
                  className="btn-secondary text-xs !py-1 !px-2"
                >
                  {copied === 'payload' ? '✓' : 'Copy'}
                </button>
              </div>
              <div className="space-y-1">
                {Object.entries(decoded.payload).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 py-1.5 px-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                    <div className="flex-shrink-0">
                      <span className="text-[#06b6d4] font-mono text-sm">{key}</span>
                      {KNOWN_CLAIMS[key] && (
                        <span className="text-[var(--color-text-muted)] text-[0.65rem] ml-1">
                          ({KNOWN_CLAIMS[key]})
                        </span>
                      )}
                    </div>
                    <span className="text-[var(--color-text-muted)] flex-shrink-0">:</span>
                    <div className="font-mono text-sm break-all">
                      {renderValue(key, value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="label mb-0 text-[#06b6d4]">Signature</span>
              <button
                onClick={() => copySection('signature', decoded.signature)}
                className="btn-secondary text-xs !py-1 !px-2"
              >
                {copied === 'signature' ? '✓' : 'Copy'}
              </button>
            </div>
            <div className="code-block text-sm break-all">
              {decoded.signature}
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Note: Signature verification requires the secret key and is not performed client-side.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
