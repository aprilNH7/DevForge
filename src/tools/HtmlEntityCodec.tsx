import { useState } from 'react'

const COMMON_ENTITIES: [string, string, string][] = [
  ['&amp;', '&', 'Ampersand'],
  ['&lt;', '<', 'Less than'],
  ['&gt;', '>', 'Greater than'],
  ['&quot;', '"', 'Double quote'],
  ['&#39;', "'", 'Single quote'],
  ['&nbsp;', '\u00A0', 'Non-breaking space'],
  ['&copy;', '\u00A9', 'Copyright'],
  ['&reg;', '\u00AE', 'Registered'],
  ['&trade;', '\u2122', 'Trademark'],
  ['&mdash;', '\u2014', 'Em dash'],
  ['&ndash;', '\u2013', 'En dash'],
  ['&laquo;', '\u00AB', 'Left guillemet'],
  ['&raquo;', '\u00BB', 'Right guillemet'],
  ['&bull;', '\u2022', 'Bullet'],
  ['&hellip;', '\u2026', 'Ellipsis'],
  ['&larr;', '\u2190', 'Left arrow'],
  ['&rarr;', '\u2192', 'Right arrow'],
  ['&uarr;', '\u2191', 'Up arrow'],
  ['&darr;', '\u2193', 'Down arrow'],
  ['&euro;', '\u20AC', 'Euro'],
  ['&pound;', '\u00A3', 'Pound'],
  ['&yen;', '\u00A5', 'Yen'],
  ['&cent;', '\u00A2', 'Cent'],
  ['&hearts;', '\u2665', 'Heart'],
  ['&spades;', '\u2660', 'Spade'],
  ['&clubs;', '\u2663', 'Club'],
  ['&diams;', '\u2666', 'Diamond'],
  ['&check;', '\u2713', 'Check mark'],
  ['&cross;', '\u2717', 'Cross mark'],
  ['&deg;', '\u00B0', 'Degree'],
]

function encodeHtml(text: string, mode: 'basic' | 'all'): string {
  if (mode === 'basic') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  return Array.from(text).map(ch => {
    const code = ch.codePointAt(0)!
    if (code > 127 || ch === '&' || ch === '<' || ch === '>' || ch === '"' || ch === "'") {
      return `&#${code};`
    }
    return ch
  }).join('')
}

function decodeHtml(text: string): string {
  const el = document.createElement('textarea')
  el.innerHTML = text
  return el.value
}

export default function HtmlEntityCodec() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeMode, setEncodeMode] = useState<'basic' | 'all'>('basic')
  const [copied, setCopied] = useState(false)
  const [entityCopied, setEntityCopied] = useState<string | null>(null)

  const process = () => {
    if (mode === 'encode') {
      setOutput(encodeHtml(input, encodeMode))
    } else {
      setOutput(decodeHtml(input))
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const copyEntity = (entity: string) => {
    navigator.clipboard.writeText(entity)
    setEntityCopied(entity)
    setTimeout(() => setEntityCopied(null), 1500)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>HTML Entity Encoder</h2>
        <p>Encode and decode HTML entities with a reference table</p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode('encode')}
            className={mode === 'encode' ? 'btn-primary' : 'btn-secondary'}
          >Encode</button>
          <button
            onClick={() => setMode('decode')}
            className={mode === 'decode' ? 'btn-primary' : 'btn-secondary'}
          >Decode</button>
          {mode === 'encode' && (
            <>
              <span className="mx-2 self-center text-[var(--color-text-muted)]">|</span>
              <button
                onClick={() => setEncodeMode('basic')}
                className={encodeMode === 'basic' ? 'btn-primary' : 'btn-secondary'}
              >Basic (&amp; &lt; &gt;)</button>
              <button
                onClick={() => setEncodeMode('all')}
                className={encodeMode === 'all' ? 'btn-primary' : 'btn-secondary'}
              >All Characters</button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Input</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode'
                ? '<p>Hello "World" & Friends</p>'
                : '&lt;p&gt;Hello &quot;World&quot; &amp; Friends&lt;/p&gt;'}
              className="input-field textarea-code"
              rows={8}
            />
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
            <pre className="code-block" style={{ minHeight: '192px' }}>{output || 'Click process to see output'}</pre>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={process} className="btn-primary">Process</button>
          <button onClick={() => { setInput(output); setOutput('') }} className="btn-secondary">Swap</button>
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Common HTML Entities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {COMMON_ENTITIES.map(([entity, char, name]) => (
            <button
              key={entity}
              onClick={() => copyEntity(entity)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors border-none cursor-pointer"
              style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
              title={`Click to copy ${entity}`}
            >
              <span className="text-lg w-6 text-center">{char}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-[var(--color-accent)] truncate">
                  {entityCopied === entity ? 'Copied!' : entity}
                </div>
                <div className="text-[0.6rem] text-[var(--color-text-muted)] truncate">{name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
