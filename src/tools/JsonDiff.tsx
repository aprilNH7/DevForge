import { useState, useMemo } from 'react'

interface Comparison {
  key: string
  left: string
  right: string
  match: boolean
  type: 'same' | 'modified' | 'added' | 'removed'
}

function flatten(obj: unknown, prefix: string = ''): Record<string, string> {
  const result: Record<string, string> = {}
  if (obj === null || obj === undefined) {
    result[prefix || '(root)'] = String(obj)
    return result
  }
  if (typeof obj !== 'object') {
    result[prefix || '(root)'] = String(obj)
    return result
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) result[prefix || '(root)'] = '[]'
    obj.forEach((item, i) => Object.assign(result, flatten(item, `${prefix}[${i}]`)))
    return result
  }
  const entries = Object.entries(obj as Record<string, unknown>)
  if (entries.length === 0) result[prefix || '(root)'] = '{}'
  for (const [key, val] of entries) {
    const newKey = prefix ? `${prefix}.${key}` : key
    Object.assign(result, flatten(val, newKey))
  }
  return result
}

export default function JsonDiff() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [filter, setFilter] = useState<'all' | 'modified' | 'added' | 'removed'>('all')
  const [copied, setCopied] = useState(false)

  const SAMPLE_LEFT = `{
  "name": "DevForge",
  "version": "1.0.0",
  "tools": 18,
  "features": {
    "darkMode": true,
    "offline": true,
    "tracking": false
  },
  "author": "aprilNH7",
  "license": "MIT"
}`

  const SAMPLE_RIGHT = `{
  "name": "DevForge",
  "version": "2.0.0",
  "tools": 23,
  "features": {
    "darkMode": true,
    "lightMode": true,
    "offline": true,
    "tracking": false
  },
  "author": "aprilNH7",
  "license": "MIT",
  "homepage": "https://aprilnh7.github.io/DevForge/"
}`

  const comparison = useMemo((): { items: Comparison[]; error: string } => {
    try {
      const l = left.trim() || SAMPLE_LEFT
      const r = right.trim() || SAMPLE_RIGHT
      const leftObj = JSON.parse(l)
      const rightObj = JSON.parse(r)
      const leftFlat = flatten(leftObj)
      const rightFlat = flatten(rightObj)
      const allKeys = new Set([...Object.keys(leftFlat), ...Object.keys(rightFlat)])
      const items: Comparison[] = []

      for (const key of Array.from(allKeys).sort()) {
        const lv = leftFlat[key]
        const rv = rightFlat[key]
        if (lv !== undefined && rv !== undefined) {
          items.push({
            key,
            left: lv,
            right: rv,
            match: lv === rv,
            type: lv === rv ? 'same' : 'modified'
          })
        } else if (lv !== undefined) {
          items.push({ key, left: lv, right: '', match: false, type: 'removed' })
        } else {
          items.push({ key, left: '', right: rv, match: false, type: 'added' })
        }
      }

      return { items, error: '' }
    } catch (e) {
      return { items: [], error: 'Invalid JSON: ' + String(e) }
    }
  }, [left, right])

  const filtered = comparison.items.filter(i => filter === 'all' || i.type === filter)

  const stats = useMemo(() => {
    const items = comparison.items
    return {
      total: items.length,
      same: items.filter(i => i.type === 'same').length,
      modified: items.filter(i => i.type === 'modified').length,
      added: items.filter(i => i.type === 'added').length,
      removed: items.filter(i => i.type === 'removed').length,
    }
  }, [comparison.items])

  const copy = () => {
    const text = filtered.map(i => `${i.type.toUpperCase().padEnd(8)} ${i.key}: ${i.left || '(none)'} → ${i.right || '(none)'}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const loadSample = () => { setLeft(SAMPLE_LEFT); setRight(SAMPLE_RIGHT) }

  const typeColor = (type: string) => {
    switch (type) {
      case 'same': return 'var(--color-text-muted)'
      case 'modified': return 'var(--color-warning)'
      case 'added': return 'var(--color-success)'
      case 'removed': return 'var(--color-error)'
      default: return 'var(--color-text-secondary)'
    }
  }

  const typeBg = (type: string) => {
    switch (type) {
      case 'modified': return 'rgba(245,158,11,0.08)'
      case 'added': return 'rgba(34,197,94,0.08)'
      case 'removed': return 'rgba(239,68,68,0.08)'
      default: return 'transparent'
    }
  }

  return (
    <div>
      <div className="tool-header">
        <h2>JSON Diff</h2>
        <p>Compare two JSON objects and see added, removed, and modified fields</p>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Left JSON (Original)</label>
            <textarea
              value={left}
              onChange={e => setLeft(e.target.value)}
              placeholder="Paste original JSON..."
              className="input-field textarea-code"
              rows={10}
              spellCheck={false}
            />
          </div>
          <div>
            <label className="label">Right JSON (Modified)</label>
            <textarea
              value={right}
              onChange={e => setRight(e.target.value)}
              placeholder="Paste modified JSON..."
              className="input-field textarea-code"
              rows={10}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={loadSample} className="btn-secondary">Load Sample</button>
          <button onClick={() => { setLeft(right); setRight(left) }} className="btn-secondary">Swap</button>
          {filtered.length > 0 && (
            <button onClick={copy} className="btn-secondary">
              {copied ? 'Copied!' : 'Copy Report'}
            </button>
          )}
        </div>

        {comparison.error && (
          <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <p className="text-sm text-[var(--color-error)]">{comparison.error}</p>
          </div>
        )}
      </div>

      {comparison.items.length > 0 && (
        <div className="card mt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Total', count: stats.total, color: 'var(--color-accent)', f: 'all' as const },
              { label: 'Same', count: stats.same, color: 'var(--color-text-muted)', f: 'all' as const },
              { label: 'Modified', count: stats.modified, color: 'var(--color-warning)', f: 'modified' as const },
              { label: 'Added', count: stats.added, color: 'var(--color-success)', f: 'added' as const },
              { label: 'Removed', count: stats.removed, color: 'var(--color-error)', f: 'removed' as const },
            ].map(s => (
              <button
                key={s.label}
                onClick={() => setFilter(s.f)}
                className="text-center p-2 rounded-lg border-none cursor-pointer transition-colors"
                style={{
                  background: filter === s.f ? `${s.color}18` : 'var(--color-bg-input)',
                  border: filter === s.f ? `1px solid ${s.color}40` : '1px solid transparent'
                }}
              >
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
                <div className="text-[0.6rem] uppercase tracking-wider" style={{ color: s.color }}>{s.label}</div>
              </button>
            ))}
          </div>

          {/* Diff list */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filtered.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg text-sm" style={{ background: typeBg(item.type) }}>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ color: typeColor(item.type), background: `${typeColor(item.type)}18` }}>
                  {item.type === 'same' ? '=' : item.type === 'modified' ? '~' : item.type === 'added' ? '+' : '-'}
                </span>
                <span className="font-mono text-xs text-[var(--color-text-secondary)] flex-shrink-0 min-w-[120px]">{item.key}</span>
                {item.type === 'modified' ? (
                  <div className="flex-1 flex items-center gap-2 text-xs font-mono flex-wrap">
                    <span className="text-[var(--color-error)] line-through">{item.left}</span>
                    <span className="text-[var(--color-text-muted)]">&rarr;</span>
                    <span className="text-[var(--color-success)]">{item.right}</span>
                  </div>
                ) : (
                  <span className="flex-1 text-xs font-mono" style={{ color: typeColor(item.type) }}>
                    {item.left || item.right}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
