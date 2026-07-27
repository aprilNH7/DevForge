import { useState } from 'react'

function formatDate(d: Date): string {
  return d.toISOString()
}

function toLocal(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function toUTC(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
}

function relativeTime(d: Date): string {
  const now = Date.now()
  const diff = now - d.getTime()
  const abs = Math.abs(diff)
  const future = diff < 0

  if (abs < 1000) return 'just now'
  if (abs < 60000) { const s = Math.floor(abs / 1000); return future ? `in ${s}s` : `${s}s ago` }
  if (abs < 3600000) { const m = Math.floor(abs / 60000); return future ? `in ${m}m` : `${m}m ago` }
  if (abs < 86400000) { const h = Math.floor(abs / 3600000); return future ? `in ${h}h` : `${h}h ago` }
  if (abs < 2592000000) { const d2 = Math.floor(abs / 86400000); return future ? `in ${d2}d` : `${d2}d ago` }
  if (abs < 31536000000) { const mo = Math.floor(abs / 2592000000); return future ? `in ${mo}mo` : `${mo}mo ago` }
  const y = Math.floor(abs / 31536000000); return future ? `in ${y}y` : `${y}y ago`
}

function dayOfWeek(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

interface ConversionResult {
  unix: number
  unixMs: number
  iso: string
  utc: string
  local: string
  relative: string
  dayOfWeek: string
  date: Date
}

function convert(d: Date): ConversionResult {
  return {
    unix: Math.floor(d.getTime() / 1000),
    unixMs: d.getTime(),
    iso: formatDate(d),
    utc: toUTC(d),
    local: toLocal(d),
    relative: relativeTime(d),
    dayOfWeek: dayOfWeek(d),
    date: d,
  }
}

function ResultRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--color-border)] last:border-0">
      <div>
        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{label}</div>
        <div className="text-sm font-mono text-[var(--color-text-primary)]">{value}</div>
      </div>
      <button
        onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="btn-secondary text-xs px-2 py-1 flex-shrink-0"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

export default function TimestampConverter() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState('')

  function handleConvert() {
    setError('')
    const trimmed = input.trim()
    if (!trimmed) { setError('Enter a timestamp or date string'); return }

    let d: Date | null = null

    // Try unix seconds
    if (/^\d{10}$/.test(trimmed)) {
      d = new Date(parseInt(trimmed) * 1000)
    }
    // Try unix milliseconds
    else if (/^\d{13}$/.test(trimmed)) {
      d = new Date(parseInt(trimmed))
    }
    // Try number (auto-detect)
    else if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed)
      d = n > 9999999999 ? new Date(n) : new Date(n * 1000)
    }
    // Try date string
    else {
      d = new Date(trimmed)
    }

    if (!d || isNaN(d.getTime())) {
      setError('Could not parse input. Try a Unix timestamp, ISO string, or date string.')
      return
    }

    setResult(convert(d))
  }

  function handleNow() {
    const d = new Date()
    setInput(Math.floor(d.getTime() / 1000).toString())
    setResult(convert(d))
    setError('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleConvert()
  }

  const presets = [
    { label: '1 hour ago', fn: () => new Date(Date.now() - 3600000) },
    { label: '1 day ago', fn: () => new Date(Date.now() - 86400000) },
    { label: '1 week ago', fn: () => new Date(Date.now() - 604800000) },
    { label: '1 year ago', fn: () => new Date(Date.now() - 31536000000) },
    { label: 'Epoch', fn: () => new Date(0) },
    { label: 'Y2K', fn: () => new Date('2000-01-01T00:00:00Z') },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Timestamp Converter</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Convert between Unix timestamps, ISO 8601, and human-readable dates</p>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-field flex-1 font-mono"
            placeholder="Enter timestamp, ISO date, or date string..."
          />
          <button onClick={handleConvert} className="btn-primary px-6">Convert</button>
          <button onClick={handleNow} className="btn-secondary px-4">Now</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => { const d = p.fn(); setInput(Math.floor(d.getTime() / 1000).toString()); setResult(convert(d)); setError('') }}
              className="text-xs px-3 py-1.5 rounded-md bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] border-none cursor-pointer transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">{error}</div>
        )}
      </div>

      {result && (
        <div className="card overflow-hidden">
          <ResultRow label="Unix Timestamp (seconds)" value={result.unix.toString()} />
          <ResultRow label="Unix Timestamp (milliseconds)" value={result.unixMs.toString()} />
          <ResultRow label="ISO 8601" value={result.iso} />
          <ResultRow label="UTC" value={result.utc} />
          <ResultRow label="Local Time" value={result.local} />
          <ResultRow label="Relative" value={result.relative} />
          <ResultRow label="Day of Week" value={result.dayOfWeek} />
        </div>
      )}
    </div>
  )
}
