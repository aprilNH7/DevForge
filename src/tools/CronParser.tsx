import { useState } from 'react'

const PRESETS: { label: string; cron: string }[] = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every day at 9 AM', cron: '0 9 * * *' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { label: 'Every weekday at 9 AM', cron: '0 9 * * 1-5' },
  { label: '1st of every month', cron: '0 0 1 * *' },
  { label: 'Every Sunday at 2 AM', cron: '0 2 * * 0' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Every 6 hours', cron: '0 */6 * * *' },
  { label: 'Twice a day (9 AM, 5 PM)', cron: '0 9,17 * * *' },
]

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function describeField(field: string, name: string, _range: [number, number], names?: string[]): string {
  if (field === '*') return `every ${name}`
  if (field.startsWith('*/')) return `every ${field.slice(2)} ${name}s`
  if (field.includes(',')) {
    const parts = field.split(',').map(v => names ? (names[+v] || v) : v)
    return `${name} ${parts.join(', ')}`
  }
  if (field.includes('-')) {
    const [a, b] = field.split('-')
    const av = names ? (names[+a] || a) : a
    const bv = names ? (names[+b] || b) : b
    return `${name} ${av} through ${bv}`
  }
  if (field.includes('/')) {
    const [base, step] = field.split('/')
    const baseDesc = base === '*' ? '' : ` starting at ${names ? (names[+base] || base) : base}`
    return `every ${step} ${name}s${baseDesc}`
  }
  const val = names ? (names[+field] || field) : field
  return `at ${name} ${val}`
}

function parseCron(expr: string): { description: string; nextRuns: string[]; valid: boolean; fields: string[] } {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return { description: 'Invalid: expected 5 fields (min hour dom month dow)', nextRuns: [], valid: false, fields: [] }

  const [min, hour, dom, month, dow] = parts

  const validate = (_f: string, _lo: number, _hi: number): boolean => {
    if (_f === '*') return true
    const tokens = _f.split(',')
    for (const t of tokens) {
      const m = t.match(/^(\*|\d+)(?:\/(\d+))?$/) || t.match(/^(\d+)-(\d+)$/)
      if (!m) return false
    }
    return true
  }

  if (!validate(min, 0, 59) || !validate(hour, 0, 23) || !validate(dom, 1, 31) || !validate(month, 1, 12) || !validate(dow, 0, 7)) {
    return { description: 'Invalid cron expression', nextRuns: [], valid: false, fields: parts }
  }

  const descs: string[] = []
  if (min !== '*' || hour !== '*') {
    if (min.includes('/') || min.includes(',') || min.includes('-') || min.startsWith('*/')) {
      descs.push(describeField(min, 'minute', [0, 59]))
    }
    if (hour.includes('/') || hour.includes(',') || hour.includes('-') || hour.startsWith('*/')) {
      descs.push(describeField(hour, 'hour', [0, 23]))
    }
    if (!min.includes('/') && !min.includes(',') && !min.startsWith('*/') && min !== '*' &&
        !hour.includes('/') && !hour.includes(',') && !hour.startsWith('*/') && hour !== '*') {
      descs.push(`at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`)
    }
  }
  if (dom !== '*') descs.push(describeField(dom, 'day-of-month', [1, 31]))
  if (month !== '*') descs.push(describeField(month, 'month', [1, 12], MONTHS))
  if (dow !== '*') descs.push(`on ${describeField(dow, 'day', [0, 7], DAYS)}`)

  const description = descs.length > 0 ? descs.join(', ') : 'every minute'

  // Compute next 5 runs
  const nextRuns: string[] = []
  const now = new Date()
  const cursor = new Date(now)
  cursor.setSeconds(0, 0)

  const matchesField = (value: number, field: string): boolean => {
    if (field === '*') return true
    const tokens = field.split(',')
    for (const token of tokens) {
      if (token.includes('/')) {
        const [base, step] = token.split('/')
        const s = parseInt(step)
        const b = base === '*' ? 0 : parseInt(base)
        if ((value - b) % s === 0 && value >= b) return true
      } else if (token.includes('-')) {
        const [lo, hi] = token.split('-').map(Number)
        if (value >= lo && value <= hi) return true
      } else {
        if (value === parseInt(token)) return true
      }
    }
    return false
  }

  let safety = 0
  cursor.setMinutes(cursor.getMinutes() + 1)
  while (nextRuns.length < 5 && safety < 525600) {
    const m = cursor.getMinutes()
    const h = cursor.getHours()
    const d = cursor.getDate()
    const mo = cursor.getMonth() + 1
    const dw = cursor.getDay()

    if (matchesField(m, min) && matchesField(h, hour) && matchesField(d, dom) &&
        matchesField(mo, month) && (matchesField(dw, dow) || (dow === '7' && dw === 0))) {
      nextRuns.push(cursor.toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }))
    }
    cursor.setMinutes(cursor.getMinutes() + 1)
    safety++
  }

  return { description: description.charAt(0).toUpperCase() + description.slice(1), nextRuns, valid: true, fields: parts }
}

const FIELD_LABELS = ['Minute (0-59)', 'Hour (0-23)', 'Day of Month (1-31)', 'Month (1-12)', 'Day of Week (0-7)']

export default function CronParser() {
  const [cron, setCron] = useState('0 9 * * 1-5')
  const [copied, setCopied] = useState(false)

  const result = parseCron(cron)

  const copy = () => {
    navigator.clipboard.writeText(cron)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>Cron Expression Parser</h2>
        <p>Parse cron expressions and preview next scheduled runs</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">Cron Expression</label>
          <div className="flex gap-2">
            <input
              value={cron}
              onChange={e => setCron(e.target.value)}
              placeholder="* * * * *"
              className="input-field font-mono text-lg"
            />
            <button onClick={copy} className="btn-secondary flex-shrink-0">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {result.fields.length === 5 && (
          <div className="grid grid-cols-5 gap-2">
            {result.fields.map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-mono font-bold text-[var(--color-accent)]">{f}</div>
                <div className="text-[0.6rem] text-[var(--color-text-muted)] mt-0.5">{FIELD_LABELS[i]}</div>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 rounded-lg" style={{ background: result.valid ? 'var(--color-accent-glow)' : 'rgba(239,68,68,0.1)' }}>
          <p className="text-sm font-medium" style={{ color: result.valid ? 'var(--color-accent)' : 'var(--color-error)' }}>
            {result.description}
          </p>
        </div>

        {result.nextRuns.length > 0 && (
          <div>
            <label className="label">Next 5 Runs</label>
            <div className="space-y-1">
              {result.nextRuns.map((run, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm" style={{ background: 'var(--color-bg-input)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
                    {i + 1}
                  </span>
                  <span className="font-mono text-[var(--color-text-primary)]">{run}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card mt-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Presets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.cron}
              onClick={() => setCron(p.cron)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors border-none cursor-pointer"
              style={{ background: cron === p.cron ? 'var(--color-accent-glow)' : 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
            >
              <span className="text-[var(--color-text-secondary)]">{p.label}</span>
              <code className="text-xs font-mono text-[var(--color-accent)]">{p.cron}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
