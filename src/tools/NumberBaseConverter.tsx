import { useState } from 'react'

interface BaseResult {
  label: string
  prefix: string
  base: number
  value: string
}

export default function NumberBaseConverter() {
  const [input, setInput] = useState('')
  const [inputBase, setInputBase] = useState(10)
  const [copied, setCopied] = useState<string | null>(null)

  const parseInput = (): bigint | null => {
    try {
      let clean = input.trim()
      if (!clean) return null
      // Auto-detect prefix
      if (clean.startsWith('0x') || clean.startsWith('0X')) {
        clean = clean.slice(2)
        return BigInt('0x' + clean)
      }
      if (clean.startsWith('0b') || clean.startsWith('0B')) {
        clean = clean.slice(2)
        return BigInt('0b' + clean)
      }
      if (clean.startsWith('0o') || clean.startsWith('0O')) {
        clean = clean.slice(2)
        return BigInt('0o' + clean)
      }
      // Parse with selected base
      const neg = clean.startsWith('-')
      if (neg) clean = clean.slice(1)
      let result = 0n
      for (const ch of clean) {
        const digit = parseInt(ch, inputBase)
        if (isNaN(digit)) return null
        result = result * BigInt(inputBase) + BigInt(digit)
      }
      return neg ? -result : result
    } catch {
      return null
    }
  }

  const num = parseInput()

  const bases: BaseResult[] = num !== null ? [
    { label: 'Binary', prefix: '0b', base: 2, value: (num < 0n ? '-' : '') + (num < 0n ? (-num) : num).toString(2) },
    { label: 'Octal', prefix: '0o', base: 8, value: (num < 0n ? '-' : '') + (num < 0n ? (-num) : num).toString(8) },
    { label: 'Decimal', prefix: '', base: 10, value: num.toString(10) },
    { label: 'Hexadecimal', prefix: '0x', base: 16, value: ((num < 0n ? '-' : '') + (num < 0n ? (-num) : num).toString(16)).toUpperCase() },
  ] : []

  const formatBinary = (bin: string): string => {
    const neg = bin.startsWith('-')
    const clean = neg ? bin.slice(1) : bin
    const padded = clean.padStart(Math.ceil(clean.length / 4) * 4, '0')
    const grouped = padded.match(/.{4}/g)?.join(' ') || padded
    return (neg ? '-' : '') + grouped
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const bitInfo = num !== null && num >= 0n ? (() => {
    const bin = num.toString(2)
    const bits = bin.length
    const setBits = [...bin].filter(c => c === '1').length
    return { bits, setBits }
  })() : null

  return (
    <div>
      <div className="tool-header">
        <h2>Number Base Converter</h2>
        <p>Convert between binary, octal, decimal, and hexadecimal (supports BigInt)</p>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="label">Input</label>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter a number (auto-detects 0x, 0b, 0o prefixes)"
              className="input-field font-mono text-lg"
            />
          </div>
          <div>
            <label className="label">Input Base</label>
            <div className="flex gap-1">
              {[2, 8, 10, 16].map(b => (
                <button
                  key={b}
                  onClick={() => setInputBase(b)}
                  className={inputBase === b ? 'btn-primary' : 'btn-secondary'}
                >
                  {b === 2 ? 'BIN' : b === 8 ? 'OCT' : b === 10 ? 'DEC' : 'HEX'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {input && num === null && (
          <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <p className="text-sm text-[var(--color-error)]">Invalid number for base {inputBase}</p>
          </div>
        )}
      </div>

      {bases.length > 0 && (
        <div className="space-y-2 mt-4">
          {bases.map(b => (
            <div key={b.base} className="card flex items-center gap-3 py-3 px-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] w-20 flex-shrink-0">
                {b.label}
              </span>
              <code className="flex-1 text-sm font-mono text-[var(--color-text-primary)] break-all">
                <span className="text-[var(--color-text-muted)]">{b.prefix}</span>
                {b.base === 2 ? formatBinary(b.value) : b.value}
              </code>
              <button onClick={() => copy(b.prefix + b.value, b.label)} className="btn-secondary text-xs py-1 px-2 flex-shrink-0">
                {copied === b.label ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}

      {bitInfo && (
        <div className="card mt-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Bit Analysis</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
              <div className="text-xl font-bold text-[var(--color-accent)]">{bitInfo.bits}</div>
              <div className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Total Bits</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
              <div className="text-xl font-bold text-[var(--color-success)]">{bitInfo.setBits}</div>
              <div className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Set Bits (1s)</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
              <div className="text-xl font-bold text-[var(--color-text-secondary)]">{bitInfo.bits - bitInfo.setBits}</div>
              <div className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Unset (0s)</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
              <div className="text-xl font-bold text-[var(--color-warning)]">{Math.pow(2, Math.ceil(Math.log2(bitInfo.bits || 1)))}</div>
              <div className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Next Pow 2 Bits</div>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Quick Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--color-text-muted)]">
                <th className="text-left py-1 px-2">Dec</th>
                <th className="text-left py-1 px-2">Hex</th>
                <th className="text-left py-1 px-2">Oct</th>
                <th className="text-left py-1 px-2">Bin</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[0,1,2,4,8,16,32,64,128,255,256,1024].map(n => (
                <tr key={n} className="border-t border-[var(--color-border)]">
                  <td className="py-1 px-2 text-[var(--color-text-primary)]">{n}</td>
                  <td className="py-1 px-2 text-[var(--color-accent)]">{n.toString(16).toUpperCase()}</td>
                  <td className="py-1 px-2 text-[var(--color-text-secondary)]">{n.toString(8)}</td>
                  <td className="py-1 px-2 text-[var(--color-text-secondary)]">{n.toString(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
