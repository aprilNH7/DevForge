import { useState, useCallback } from 'react'

interface PasswordEntry {
  value: string
  strength: number
  label: string
  color: string
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(20)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [exclude, setExclude] = useState('')
  const [count, setCount] = useState(5)
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [copied, setCopied] = useState<number | null>(null)

  const calcStrength = useCallback((pw: string): { strength: number; label: string; color: string } => {
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (pw.length >= 16) score++
    if (pw.length >= 24) score++
    if (/[a-z]/.test(pw)) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^a-zA-Z0-9]/.test(pw)) score++
    const pct = Math.min(100, (score / 8) * 100)
    if (pct < 30) return { strength: pct, label: 'Weak', color: 'var(--color-error)' }
    if (pct < 60) return { strength: pct, label: 'Fair', color: 'var(--color-warning)' }
    if (pct < 85) return { strength: pct, label: 'Strong', color: 'var(--color-accent)' }
    return { strength: pct, label: 'Very Strong', color: 'var(--color-success)' }
  }, [])

  const generate = () => {
    let charset = ''
    if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lower) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (digits) charset += '0123456789'
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    if (exclude) {
      for (const ch of exclude) {
        charset = charset.replaceAll(ch, '')
      }
    }
    if (!charset) return

    const results: PasswordEntry[] = []
    for (let i = 0; i < count; i++) {
      const arr = new Uint32Array(length)
      crypto.getRandomValues(arr)
      const pw = Array.from(arr, v => charset[v % charset.length]).join('')
      const s = calcStrength(pw)
      results.push({ value: pw, ...s })
    }
    setPasswords(results)
  }

  const copy = (idx: number) => {
    navigator.clipboard.writeText(passwords[idx].value)
    setCopied(idx)
    setTimeout(() => setCopied(null), 1500)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.map(p => p.value).join('\n'))
    setCopied(-1)
    setTimeout(() => setCopied(null), 1500)
  }

  const Toggle = ({ label: lbl, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className="w-9 h-5 rounded-full relative transition-colors duration-200"
        style={{ background: checked ? 'var(--color-accent)' : 'var(--color-bg-hover)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
          style={{ left: checked ? '18px' : '2px' }}
        />
      </div>
      <span className="text-sm text-[var(--color-text-secondary)]">{lbl}</span>
    </label>
  )

  return (
    <div>
      <div className="tool-header">
        <h2>Password Generator</h2>
        <p>Generate cryptographically secure passwords with strength analysis</p>
      </div>

      <div className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Length: {length}</label>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={e => setLength(+e.target.value)}
              className="w-full accent-[var(--color-accent)]"
            />
            <div className="flex justify-between text-[0.65rem] text-[var(--color-text-muted)] mt-1">
              <span>4</span><span>128</span>
            </div>
          </div>
          <div>
            <label className="label">Count: {count}</label>
            <input
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={e => setCount(+e.target.value)}
              className="w-full accent-[var(--color-accent)]"
            />
            <div className="flex justify-between text-[0.65rem] text-[var(--color-text-muted)] mt-1">
              <span>1</span><span>20</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Toggle label="Uppercase (A-Z)" checked={upper} onChange={setUpper} />
          <Toggle label="Lowercase (a-z)" checked={lower} onChange={setLower} />
          <Toggle label="Digits (0-9)" checked={digits} onChange={setDigits} />
          <Toggle label="Symbols (!@#$)" checked={symbols} onChange={setSymbols} />
        </div>

        <div>
          <label className="label">Exclude Characters</label>
          <input
            value={exclude}
            onChange={e => setExclude(e.target.value)}
            placeholder="e.g. 0Ol1I"
            className="input-field font-mono"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={generate} className="btn-primary">Generate</button>
          {passwords.length > 0 && (
            <button onClick={copyAll} className="btn-secondary">
              {copied === -1 ? 'Copied All!' : 'Copy All'}
            </button>
          )}
        </div>
      </div>

      {passwords.length > 0 && (
        <div className="space-y-2 mt-4">
          {passwords.map((pw, i) => (
            <div key={i} className="card flex items-center gap-3 py-3 px-4">
              <code className="flex-1 text-sm font-mono text-[var(--color-text-primary)] break-all leading-relaxed">
                {pw.value}
              </code>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-2 min-w-[100px]">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-hover)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pw.strength}%`, background: pw.color }} />
                  </div>
                  <span className="text-[0.65rem] font-medium" style={{ color: pw.color }}>{pw.label}</span>
                </div>
                <button onClick={() => copy(i)} className="btn-secondary text-xs py-1 px-2">
                  {copied === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
