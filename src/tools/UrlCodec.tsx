import { useState } from 'react'

export default function UrlCodec() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component')
  const [copied, setCopied] = useState(false)

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeType === 'component' ? encodeURIComponent(input) : encodeURI(input))
      } else {
        setOutput(encodeType === 'component' ? decodeURIComponent(input) : decodeURI(input))
      }
    } catch {
      setOutput('Error: Invalid input for decoding')
    }
  }

  const parseQuery = () => {
    try {
      let url: URL
      try {
        url = new URL(input)
      } catch {
        url = new URL('https://example.com?' + input)
      }
      const params: [string, string][] = []
      url.searchParams.forEach((v, k) => params.push([k, v]))
      if (params.length === 0) {
        setOutput('No query parameters found')
        return
      }
      const maxKey = Math.max(...params.map(([k]) => k.length))
      setOutput(
        `URL: ${url.origin}${url.pathname}\n\n` +
        params.map(([k, v]) => `${k.padEnd(maxKey)}  =  ${v}`).join('\n')
      )
    } catch {
      setOutput('Error: Could not parse URL')
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>URL Encoder / Decoder</h2>
        <p>Encode, decode, and parse URLs and query parameters</p>
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
          <span className="mx-2 self-center text-[var(--color-text-muted)]">|</span>
          <button
            onClick={() => setEncodeType('component')}
            className={encodeType === 'component' ? 'btn-primary' : 'btn-secondary'}
          >Component</button>
          <button
            onClick={() => setEncodeType('full')}
            className={encodeType === 'full' ? 'btn-primary' : 'btn-secondary'}
          >Full URI</button>
        </div>

        <div>
          <label className="label">Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode'
              ? 'https://example.com/path?name=John Doe&city=New York'
              : 'https%3A%2F%2Fexample.com%2Fpath%3Fname%3DJohn%20Doe'}
            className="input-field textarea-code"
            rows={4}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={process} className="btn-primary">
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          <button onClick={parseQuery} className="btn-secondary">
            Parse Query Params
          </button>
          <button onClick={() => { setInput(output); setOutput('') }} className="btn-secondary">
            Swap
          </button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Output</label>
              <button onClick={copy} className="btn-secondary text-xs py-1 px-2">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="code-block">{output}</pre>
          </div>
        )}
      </div>

      <div className="card mt-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-medium text-[var(--color-accent)] mb-1">encodeURIComponent</p>
            <p className="text-[var(--color-text-secondary)]">Encodes everything except: A-Z a-z 0-9 - _ . ! ~ * ' ( )</p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-accent)] mb-1">encodeURI</p>
            <p className="text-[var(--color-text-secondary)]">Preserves: : / ? # [ ] @ ! $ & ' ( ) * + , ; = - _ . ~</p>
          </div>
        </div>
      </div>
    </div>
  )
}
