import { useState } from 'react'

function parseYaml(text: string): unknown {
  const lines = text.split('\n')
  const root: Record<string, unknown> = {}
  const stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: root, indent: -1 }]

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue

    const indent = raw.search(/\S/)
    const content = raw.trim()

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }
    const parent = stack[stack.length - 1].obj

    // List item
    if (content.startsWith('- ')) {
      const val = content.slice(2).trim()
      const keys = Object.keys(parent)
      const lastKey = keys[keys.length - 1]
      if (lastKey && Array.isArray(parent[lastKey])) {
        const parsed = parseValue(val)
        if (typeof parsed === 'string' && parsed.includes(': ')) {
          const obj: Record<string, unknown> = {}
          const colonIdx = parsed.indexOf(': ')
          obj[parsed.slice(0, colonIdx)] = parseValue(parsed.slice(colonIdx + 2))
          ;(parent[lastKey] as unknown[]).push(obj)
        } else {
          ;(parent[lastKey] as unknown[]).push(parsed)
        }
      }
      continue
    }

    const colonIdx = content.indexOf(':')
    if (colonIdx === -1) continue

    const key = content.slice(0, colonIdx).trim()
    const rawVal = content.slice(colonIdx + 1).trim()

    if (rawVal === '' || rawVal === '|' || rawVal === '>') {
      // Check if next line is a list
      const nextLine = i + 1 < lines.length ? lines[i + 1] : ''
      const nextTrimmed = nextLine.trim()
      if (nextTrimmed.startsWith('- ')) {
        parent[key] = []
      } else if (rawVal === '|' || rawVal === '>') {
        // Multi-line string
        const blockIndent = i + 1 < lines.length ? lines[i + 1].search(/\S/) : indent + 2
        const blockLines: string[] = []
        let j = i + 1
        while (j < lines.length && (lines[j].trim() === '' || lines[j].search(/\S/) >= blockIndent)) {
          blockLines.push(lines[j].slice(blockIndent))
          j++
        }
        parent[key] = rawVal === '|' ? blockLines.join('\n') : blockLines.join(' ').trim()
        i = j - 1
      } else {
        const child: Record<string, unknown> = {}
        parent[key] = child
        stack.push({ obj: child, indent })
      }
    } else {
      parent[key] = parseValue(rawVal)
    }
  }

  return root
}

function parseValue(s: string): unknown {
  if (s === 'true' || s === 'True' || s === 'TRUE') return true
  if (s === 'false' || s === 'False' || s === 'FALSE') return false
  if (s === 'null' || s === 'Null' || s === 'NULL' || s === '~') return null
  if (/^-?\d+$/.test(s)) return parseInt(s, 10)
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1)
  if (s.startsWith('[') && s.endsWith(']')) {
    return s.slice(1, -1).split(',').map(v => parseValue(v.trim()))
  }
  return s
}

function toYaml(obj: unknown, indent: number = 0): string {
  const pad = '  '.repeat(indent)
  if (obj === null || obj === undefined) return pad + 'null'
  if (typeof obj === 'boolean') return pad + (obj ? 'true' : 'false')
  if (typeof obj === 'number') return pad + obj.toString()
  if (typeof obj === 'string') {
    if (obj.includes('\n')) return pad + '|\n' + obj.split('\n').map(l => pad + '  ' + l).join('\n')
    if (obj.includes(':') || obj.includes('#') || obj.includes('"') || obj.startsWith(' ') || /^\d/.test(obj)) return pad + `"${obj}"`
    return pad + obj
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return pad + '[]'
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const inner = toYaml(item, indent + 1).trimStart()
        return pad + '- ' + inner
      }
      return pad + '- ' + (typeof item === 'string' && (item.includes(':') || item.includes('#')) ? `"${item}"` : String(item))
    }).join('\n')
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return pad + '{}'
    return entries.map(([key, val]) => {
      if (typeof val === 'object' && val !== null) {
        return pad + key + ':\n' + toYaml(val, indent + 1)
      }
      const v = toYaml(val, 0)
      return pad + key + ': ' + v
    }).join('\n')
  }
  return pad + String(obj)
}

export default function YamlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const SAMPLE = `server:
  host: localhost
  port: 8080
  debug: true
database:
  driver: postgres
  connection:
    host: db.example.com
    port: 5432
    name: myapp
  pool_size: 10
features:
  - authentication
  - caching
  - logging
environment: production`

  const format = () => {
    try {
      setError('')
      const parsed = parseYaml(input || SAMPLE)
      setOutput(toYaml(parsed))
    } catch (e) {
      setError(String(e))
      setOutput('')
    }
  }

  const toJson = () => {
    try {
      setError('')
      const parsed = parseYaml(input || SAMPLE)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch (e) {
      setError(String(e))
      setOutput('')
    }
  }

  const fromJson = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      setOutput(toYaml(parsed))
    } catch (e) {
      setError('Invalid JSON: ' + String(e))
      setOutput('')
    }
  }

  const loadSample = () => setInput(SAMPLE)

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const stats = input ? {
    lines: input.split('\n').length,
    keys: (input.match(/^\s*[\w.-]+\s*:/gm) || []).length,
    lists: (input.match(/^\s*-\s/gm) || []).length,
  } : null

  return (
    <div>
      <div className="tool-header">
        <h2>YAML Formatter</h2>
        <p>Format YAML, convert between YAML and JSON</p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={format} className="btn-primary">Format YAML</button>
          <button onClick={toJson} className="btn-secondary">YAML &rarr; JSON</button>
          <button onClick={fromJson} className="btn-secondary">JSON &rarr; YAML</button>
          <button onClick={loadSample} className="btn-secondary">Load Sample</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Input</label>
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); setError('') }}
              placeholder="Paste YAML or JSON here..."
              className="input-field textarea-code"
              rows={16}
              spellCheck={false}
            />
            {stats && (
              <div className="flex gap-3 mt-1">
                <span className="text-[0.65rem] text-[var(--color-text-muted)]">{stats.lines} lines</span>
                <span className="text-[0.65rem] text-[var(--color-text-muted)]">{stats.keys} keys</span>
                <span className="text-[0.65rem] text-[var(--color-text-muted)]">{stats.lists} list items</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Output</label>
              {output && (
                <button onClick={copy} className="btn-secondary text-xs py-1 px-2">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            {error ? (
              <div className="code-block text-[var(--color-error)]" style={{ minHeight: '384px' }}>{error}</div>
            ) : (
              <pre className="code-block" style={{ minHeight: '384px', maxHeight: '500px', overflow: 'auto' }}>
                {output || 'Click a button above to process'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
