import { useState } from 'react'

type StringOp = {
  id: string
  label: string
  fn: (s: string) => string
}

const OPS: StringOp[] = [
  { id: 'upper', label: 'UPPERCASE', fn: s => s.toUpperCase() },
  { id: 'lower', label: 'lowercase', fn: s => s.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: s => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) },
  { id: 'sentence', label: 'Sentence case', fn: s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
  { id: 'camel', label: 'camelCase', fn: s => s.replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '') },
  { id: 'pascal', label: 'PascalCase', fn: s => s.replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, c => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '') },
  { id: 'snake', label: 'snake_case', fn: s => s.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '') },
  { id: 'kebab', label: 'kebab-case', fn: s => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[_\s]+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '') },
  { id: 'constant', label: 'CONSTANT_CASE', fn: s => s.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[-\s]+/g, '_').toUpperCase().replace(/[^A-Z0-9_]/g, '') },
  { id: 'dot', label: 'dot.case', fn: s => s.replace(/([a-z])([A-Z])/g, '$1.$2').replace(/[-_\s]+/g, '.').toLowerCase() },
  { id: 'reverse', label: 'esreveR', fn: s => [...s].reverse().join('') },
  { id: 'slug', label: 'url-slug', fn: s => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') },
  { id: 'trim', label: 'Trim Whitespace', fn: s => s.split('\n').map(l => l.trim()).join('\n') },
  { id: 'dedup-lines', label: 'Remove Duplicate Lines', fn: s => [...new Set(s.split('\n'))].join('\n') },
  { id: 'sort-lines', label: 'Sort Lines (A-Z)', fn: s => s.split('\n').sort((a, b) => a.localeCompare(b)).join('\n') },
  { id: 'sort-lines-desc', label: 'Sort Lines (Z-A)', fn: s => s.split('\n').sort((a, b) => b.localeCompare(a)).join('\n') },
  { id: 'remove-empty', label: 'Remove Empty Lines', fn: s => s.split('\n').filter(l => l.trim() !== '').join('\n') },
  { id: 'number-lines', label: 'Number Lines', fn: s => s.split('\n').map((l, i) => `${(i + 1).toString().padStart(4)} | ${l}`).join('\n') },
  { id: 'escape', label: 'Escape (\\n, \\t)', fn: s => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/"/g, '\\"') },
  { id: 'unescape', label: 'Unescape', fn: s => s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\') },
]

export default function StringUtils() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const stats = {
    chars: input.length,
    charsNoSpace: input.replace(/\s/g, '').length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split('\n').length : 0,
    sentences: input.trim() ? (input.match(/[.!?]+/g) || []).length : 0,
    bytes: new Blob([input]).size,
  }

  const apply = (op: StringOp) => {
    setOutput(op.fn(input || 'Hello World Example Text'))
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>String Utilities</h2>
        <p>Transform text with 20 operations: case conversion, sorting, escaping, and more</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">Input Text</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste text here..."
            className="input-field textarea-code"
            rows={5}
          />
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-[var(--color-text-muted)]">{stats.chars} chars</span>
          <span className="text-[var(--color-text-muted)]">{stats.charsNoSpace} no spaces</span>
          <span className="text-[var(--color-text-muted)]">{stats.words} words</span>
          <span className="text-[var(--color-text-muted)]">{stats.lines} lines</span>
          <span className="text-[var(--color-text-muted)]">{stats.sentences} sentences</span>
          <span className="text-[var(--color-text-muted)]">{stats.bytes} bytes</span>
        </div>

        <div>
          <label className="label">Operations</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {OPS.map(op => (
              <button
                key={op.id}
                onClick={() => apply(op)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors border-none cursor-pointer"
                style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Output</label>
              <div className="flex gap-2">
                <button onClick={() => { setInput(output); setOutput('') }} className="btn-secondary text-xs py-1 px-2">
                  Use as Input
                </button>
                <button onClick={copy} className="btn-secondary text-xs py-1 px-2">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="code-block" style={{ maxHeight: '300px', overflow: 'auto' }}>{output}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
