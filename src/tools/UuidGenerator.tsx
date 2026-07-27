import { useState, useCallback } from 'react'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback manual v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([generateUUID()])
  const [bulkCount, setBulkCount] = useState(10)
  const [format, setFormat] = useState<'lowercase' | 'uppercase' | 'no-dashes'>('lowercase')
  const [copied, setCopied] = useState<number | 'all' | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const formatUuid = useCallback((uuid: string): string => {
    switch (format) {
      case 'uppercase': return uuid.toUpperCase()
      case 'no-dashes': return uuid.replace(/-/g, '')
      default: return uuid
    }
  }, [format])

  const generateOne = () => {
    const newUuid = generateUUID()
    setUuids([newUuid])
    setHistory(prev => [newUuid, ...prev].slice(0, 50))
  }

  const generateBulk = () => {
    const count = Math.max(1, Math.min(1000, bulkCount))
    const newUuids = Array.from({ length: count }, () => generateUUID())
    setUuids(newUuids)
    setHistory(prev => [...newUuids, ...prev].slice(0, 50))
  }

  const copyUuid = async (index: number) => {
    const uuid = formatUuid(uuids[index])
    await navigator.clipboard.writeText(uuid)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = async () => {
    const text = uuids.map(formatUuid).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  const clearHistory = () => setHistory([])

  return (
    <div>
      <div className="tool-header">
        <h2>UUID Generator</h2>
        <p>Generate v4 UUIDs with bulk generation and clipboard support</p>
      </div>

      {/* Controls */}
      <div className="card mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={generateOne} className="btn-primary">
            Generate UUID
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={1000}
              value={bulkCount}
              onChange={e => setBulkCount(parseInt(e.target.value) || 1)}
              className="input-field !w-20 text-center text-sm"
            />
            <button onClick={generateBulk} className="btn-secondary">
              Bulk Generate
            </button>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-[var(--color-text-muted)] mr-1">Format:</span>
            {([
              { value: 'lowercase', label: 'abc' },
              { value: 'uppercase', label: 'ABC' },
              { value: 'no-dashes', label: 'No -' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFormat(value)}
                className={`text-xs px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                  format === value
                    ? 'bg-[var(--color-accent-glow)] border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated UUIDs */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="label mb-0">
            Generated UUIDs
            <span className="ml-2 badge bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
              {uuids.length}
            </span>
          </span>
          <button onClick={copyAll} className="btn-secondary text-xs">
            {copied === 'all' ? '✓ Copied All' : 'Copy All'}
          </button>
        </div>

        {uuids.length === 1 ? (
          /* Single UUID - large display */
          <div
            className="code-block text-center py-6 cursor-pointer hover:border-[var(--color-accent)] transition-colors group"
            onClick={() => copyUuid(0)}
          >
            <span className="text-xl font-mono text-[var(--color-accent)] tracking-wider">
              {formatUuid(uuids[0])}
            </span>
            <div className="mt-2 text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
              {copied === 0 ? '✓ Copied!' : 'Click to copy'}
            </div>
          </div>
        ) : (
          /* Multiple UUIDs - list */
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin space-y-1">
            {uuids.map((uuid, i) => (
              <div
                key={`${uuid}-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors group"
              >
                <span className="text-xs text-[var(--color-text-muted)] w-8 text-right flex-shrink-0">
                  {i + 1}.
                </span>
                <span className="font-mono text-sm text-[var(--color-text-primary)] flex-1 break-all">
                  {formatUuid(uuid)}
                </span>
                <button
                  onClick={() => copyUuid(i)}
                  className="btn-secondary text-xs !py-0.5 !px-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  {copied === i ? '✓' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UUID Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* UUID Anatomy */}
        <div className="card">
          <span className="label">UUID v4 Anatomy</span>
          {uuids.length > 0 && (
            <div className="mt-2">
              <div className="font-mono text-sm flex flex-wrap gap-0.5 items-center">
                {(() => {
                  const uuid = uuids[0]
                  const parts = uuid.split('-')
                  const colors = ['text-[#06b6d4]', 'text-[#22c55e]', 'text-[#a78bfa]', 'text-[#f59e0b]', 'text-[#ef4444]']
                  const labels = ['time-low', 'time-mid', 'version', 'variant', 'node']
                  return parts.map((part, i) => (
                    <span key={i} className="flex flex-col items-center">
                      <span className={`${colors[i]} font-semibold`}>{formatUuid(part)}</span>
                      <span className="text-[0.55rem] text-[var(--color-text-muted)]">{labels[i]}</span>
                      {i < parts.length - 1 && <span className="text-[var(--color-text-muted)] mx-0.5">-</span>}
                    </span>
                  ))
                })()}
              </div>
              <div className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)]">
                <p>Version: <span className="text-[var(--color-text-secondary)]">4 (random)</span></p>
                <p>Variant: <span className="text-[var(--color-text-secondary)]">RFC 4122</span></p>
                <p>Bits of randomness: <span className="text-[var(--color-text-secondary)]">122</span></p>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="label mb-0">
              History
              {history.length > 0 && (
                <span className="ml-2 badge bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]">
                  {history.length}
                </span>
              )}
            </span>
            {history.length > 0 && (
              <button onClick={clearHistory} className="btn-secondary text-xs !py-0.5 !px-2">
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-[var(--color-text-muted)] py-4 text-center">
              Generated UUIDs will appear here
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto scrollbar-thin space-y-0.5">
              {history.slice(0, 20).map((uuid, i) => (
                <div
                  key={`${uuid}-hist-${i}`}
                  className="font-mono text-xs text-[var(--color-text-muted)] py-0.5 px-2 rounded hover:bg-[var(--color-bg-hover)] cursor-pointer truncate"
                  onClick={async () => {
                    await navigator.clipboard.writeText(formatUuid(uuid))
                    setCopied(-1)
                    setTimeout(() => setCopied(null), 1000)
                  }}
                  title="Click to copy"
                >
                  {formatUuid(uuid)}
                </div>
              ))}
              {history.length > 20 && (
                <div className="text-xs text-[var(--color-text-muted)] text-center py-1">
                  +{history.length - 20} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
