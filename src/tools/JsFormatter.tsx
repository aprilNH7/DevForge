import { useState } from 'react'
import { Button } from '../components/Button'
import { TextArea } from '../components/TextArea'

function formatJs(js: string): string {
  let depth = 0
  const out: string[] = []
  js.replace(/\s+/g, ' ').split(/([{}();,])/g).filter(Boolean).forEach(char => {
    if (char === '{') { out.push(' {\n' + '  '.repeat(++depth)); }
    else if (char === '}') { out.push('\n' + '  '.repeat(--depth) + '}\n' + '  '.repeat(depth)); }
    else if (char === ';') { out.push(';\n' + '  '.repeat(depth)); }
    else { out.push(char); }
  })
  return out.join('').replace(/\n\s*\n/g, '\n').trim()
}

function minifyJs(js: string): string {
  return js.replace(/\/\/[\s\S]*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}();,=+\-*/])\s*/g, '$1').trim()
}

export default function JsFormatter() {
  const [input, setInput] = useState('function greet(name) { console.log("Hello, " + name); }')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')

  const run = () => {
    try {
      setOutput(mode === 'format' ? formatJs(input) : minifyJs(input))
    } catch {
      setOutput('Error processing JS')
    }
  }

  return (
    <div className="space-y-4">
      <div className="tool-header">
        <h2>JS Formatter</h2>
        <p>Format or minify JavaScript code.</p>
      </div>
      <div className="card">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMode('format')} className={`btn-secondary text-sm ${mode === 'format' ? 'bg-[var(--color-accent)] text-black' : ''}`}>Format</button>
          <button onClick={() => setMode('minify')} className={`btn-secondary text-sm ${mode === 'minify' ? 'bg-[var(--color-accent)] text-black' : ''}`}>Minify</button>
        </div>
        <TextArea value={input} onChange={setInput} rows={10} placeholder="Paste JavaScript..." />
        <Button onClick={run} className="mt-3">{mode === 'format' ? 'Format JS' : 'Minify JS'}</Button>
      </div>
      {output && <div className="card"><span className="label">Output</span><TextArea value={output} onChange={setOutput} rows={10} readOnly /></div>}
    </div>
  )
}
