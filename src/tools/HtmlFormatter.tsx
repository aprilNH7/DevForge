import { useState } from 'react'
import { Button } from '../components/Button'
import { TextArea } from '../components/TextArea'

function formatHtml(html: string): string {
  let depth = 0
  const out: string[] = []
  html.replace(/\s+/g, ' ').split(/(<\/?[^\u003e]+>)/g).filter(Boolean).forEach(part => {
    const trimmed = part.trim()
    if (!trimmed) return
    if (trimmed.startsWith('</')) {
      depth = Math.max(0, depth - 1)
      out.push('  '.repeat(depth) + trimmed + '\n')
    } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>') && !trimmed.startsWith('<!--')) {
      out.push('  '.repeat(depth) + trimmed + '\n')
      depth++
    } else {
      out.push('  '.repeat(depth) + trimmed + '\n')
    }
  })
  return out.join('').trim()
}

function minifyHtml(html: string): string {
  return html.replace(/\s+/g, ' ').replace(/> \u003c/g, '><').trim()
}

export default function HtmlFormatter() {
  const [input, setInput] = useState('<div><p>Hello</p></div>')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')

  const run = () => {
    try {
      setOutput(mode === 'format' ? formatHtml(input) : minifyHtml(input))
    } catch {
      setOutput('Error processing HTML')
    }
  }

  return (
    <div className="space-y-4">
      <div className="tool-header">
        <h2>HTML Formatter</h2>
        <p>Format or minify HTML markup.</p>
      </div>
      <div className="card">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMode('format')} className={`btn-secondary text-sm ${mode === 'format' ? 'bg-[var(--color-accent)] text-black' : ''}`}>Format</button>
          <button onClick={() => setMode('minify')} className={`btn-secondary text-sm ${mode === 'minify' ? 'bg-[var(--color-accent)] text-black' : ''}`}>Minify</button>
        </div>
        <TextArea value={input} onChange={setInput} rows={10} placeholder="Paste HTML..." />
        <Button onClick={run} className="mt-3">{mode === 'format' ? 'Format HTML' : 'Minify HTML'}</Button>
      </div>
      {output && <div className="card"><span className="label">Output</span><TextArea value={output} onChange={setOutput} rows={10} readOnly /></div>}
    </div>
  )
}
