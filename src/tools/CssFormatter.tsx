import { useState } from 'react'
import { Button } from '../components/Button'
import { TextArea } from '../components/TextArea'

function formatCss(css: string): string {
  let depth = 0
  const out: string[] = []
  css.replace(/\s+/g, ' ').split('').forEach(char => {
    if (char === '{') { out.push(' {\n' + '  '.repeat(++depth)); }
    else if (char === '}') { out.push('\n' + '  '.repeat(--depth) + '}\n' + '  '.repeat(depth)); }
    else if (char === ';') { out.push(';\n' + '  '.repeat(depth)); }
    else { out.push(char); }
  })
  return out.join('').replace(/\n\s*\n/g, '\n').trim()
}

function minifyCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim()
}

export default function CssFormatter() {
  const [input, setInput] = useState('.btn { color: red; background: blue; }')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')

  const run = () => {
    try {
      setOutput(mode === 'format' ? formatCss(input) : minifyCss(input))
    } catch (e) {
      setOutput('Error processing CSS')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">CSS Formatter</h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('format')} className={`px-3 py-1.5 rounded-lg text-sm border ${mode === 'format' ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>Format</button>
          <button onClick={() => setMode('minify')} className={`px-3 py-1.5 rounded-lg text-sm border ${mode === 'minify' ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>Minify</button>
        </div>
      </div>
      <TextArea value={input} onChange={setInput} rows={10} placeholder="Paste CSS..." />
      <Button onClick={run}>{mode === 'format' ? 'Format CSS' : 'Minify CSS'}</Button>
      <TextArea value={output} onChange={setOutput} rows={10} readOnly />
    </div>
  )
}
