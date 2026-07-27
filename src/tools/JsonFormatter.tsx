import { useState, useCallback } from 'react'

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-[#f59e0b]' // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-[#06b6d4]' // key
        } else {
          cls = 'text-[#22c55e]' // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-[#a78bfa]' // boolean
      } else if (/null/.test(match)) {
        cls = 'text-[#ef4444]' // null
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<{ keys: number; depth: number; size: string } | null>(null)

  const getDepth = (obj: unknown, d = 0): number => {
    if (typeof obj !== 'object' || obj === null) return d
    const children = Array.isArray(obj) ? obj : Object.values(obj)
    if (children.length === 0) return d
    return Math.max(...children.map(c => getDepth(c, d + 1)))
  }

  const countKeys = (obj: unknown): number => {
    if (typeof obj !== 'object' || obj === null) return 0
    const entries = Array.isArray(obj) ? obj : Object.values(obj)
    const own = Array.isArray(obj) ? 0 : Object.keys(obj).length
    return own + entries.reduce((sum, v) => sum + countKeys(v), 0)
  }

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some JSON')
      setOutput('')
      setStats(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setError('')
      setStats({
        keys: countKeys(parsed),
        depth: getDepth(parsed),
        size: new Blob([formatted]).size > 1024
          ? `${(new Blob([formatted]).size / 1024).toFixed(1)} KB`
          : `${new Blob([formatted]).size} B`,
      })
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
      setStats(null)
    }
  }, [input, indent])

  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some JSON')
      setOutput('')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }, [input])

  const validateJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some JSON')
      return
    }
    try {
      JSON.parse(input)
      setError('')
      setOutput('✓ Valid JSON')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }, [input])

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadSample = () => {
    const sample = JSON.stringify({
      name: "DevForge",
      version: "1.0.0",
      tools: ["JSON Formatter", "API Tester", "Base64 Codec"],
      config: { theme: "dark", accent: "#06b6d4" },
      active: true,
      users: null
    }, null, 2)
    setInput(sample)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>JSON Formatter</h2>
        <p>Format, minify, and validate JSON with syntax highlighting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="label mb-0">Input</span>
            <div className="flex gap-2">
              <button onClick={loadSample} className="btn-secondary text-xs !py-1 !px-2">
                Sample
              </button>
              <button onClick={() => { setInput(''); setOutput(''); setError(''); setStats(null) }} className="btn-secondary text-xs !py-1 !px-2">
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Paste your JSON here...'
            className="input-field textarea-code min-h-[300px] lg:min-h-[400px]"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="label mb-0">Output</span>
            {output && (
              <button onClick={copyOutput} className="btn-secondary text-xs !py-1 !px-2">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
          {error ? (
            <div className="code-block border-[var(--color-error)]/30 bg-[var(--color-error)]/5 min-h-[300px] lg:min-h-[400px]">
              <span className="text-[var(--color-error)] font-medium">Error: </span>
              <span className="text-[var(--color-text-secondary)]">{error}</span>
            </div>
          ) : output === '✓ Valid JSON' ? (
            <div className="code-block border-[var(--color-success)]/30 bg-[var(--color-success)]/5 min-h-[300px] lg:min-h-[400px] flex items-center justify-center">
              <span className="text-[var(--color-success)] text-lg font-semibold">{output}</span>
            </div>
          ) : (
            <div
              className="code-block min-h-[300px] lg:min-h-[400px]"
              dangerouslySetInnerHTML={{
                __html: output ? syntaxHighlight(output) : '<span class="text-[var(--color-text-muted)]">Output will appear here...</span>'
              }}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="card mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={formatJson} className="btn-primary">
            Format
          </button>
          <button onClick={minifyJson} className="btn-secondary">
            Minify
          </button>
          <button onClick={validateJson} className="btn-secondary">
            Validate
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[var(--color-text-muted)]">Indent:</span>
            {[2, 4].map(n => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`text-xs px-2 py-1 rounded border cursor-pointer ${
                  indent === n
                    ? 'bg-[var(--color-accent-glow)] border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {n} spaces
              </button>
            ))}
          </div>
        </div>

        {stats && (
          <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)]">
              Keys: <span className="text-[var(--color-text-secondary)]">{stats.keys}</span>
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Depth: <span className="text-[var(--color-text-secondary)]">{stats.depth}</span>
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Size: <span className="text-[var(--color-text-secondary)]">{stats.size}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
