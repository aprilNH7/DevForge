import { useState } from 'react'

function formatXml(xml: string, indentStr: string = '  '): string {
  let formatted = ''
  let indent = 0
  // Normalize whitespace between tags
  const cleaned = xml.replace(/>\s+</g, '><').trim()
  const tokens = cleaned.split(/(<[^>]+>)/g).filter(Boolean)

  for (const token of tokens) {
    if (token.startsWith('<?') || token.startsWith('<!')) {
      // Processing instruction or doctype
      formatted += indentStr.repeat(indent) + token + '\n'
    } else if (token.startsWith('</')) {
      // Closing tag
      indent = Math.max(0, indent - 1)
      formatted += indentStr.repeat(indent) + token + '\n'
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      // Self-closing tag
      formatted += indentStr.repeat(indent) + token + '\n'
    } else if (token.startsWith('<')) {
      // Opening tag
      formatted += indentStr.repeat(indent) + token + '\n'
      indent++
    } else {
      // Text content
      const trimmed = token.trim()
      if (trimmed) {
        formatted += indentStr.repeat(indent) + trimmed + '\n'
      }
    }
  }

  // Fix inline text: if a text node sits between an opening and closing tag on separate lines, merge
  const lines = formatted.split('\n').filter(l => l.trim())
  const result: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i].trim()
    const next = lines[i + 1]?.trim() || ''
    const after = lines[i + 2]?.trim() || ''
    if (cur.startsWith('<') && !cur.startsWith('</') && !cur.endsWith('/>') &&
        !next.startsWith('<') && after.startsWith('</')) {
      const lineIndent = lines[i].match(/^(\s*)/)?.[1] || ''
      result.push(lineIndent + cur + next + after)
      i += 2
    } else {
      result.push(lines[i])
    }
  }

  return result.join('\n')
}

function minifyXml(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .trim()
}

function validateXml(xml: string): { valid: boolean; error?: string; info?: { elements: number; attributes: number; depth: number } } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    return { valid: false, error: parseError.textContent || 'Parse error' }
  }

  let elements = 0
  let attributes = 0
  let maxDepth = 0

  function walk(node: Element, depth: number) {
    elements++
    attributes += node.attributes.length
    maxDepth = Math.max(maxDepth, depth)
    for (const child of Array.from(node.children)) {
      walk(child, depth + 1)
    }
  }

  if (doc.documentElement) {
    walk(doc.documentElement, 1)
  }

  return { valid: true, info: { elements, attributes, depth: maxDepth } }
}

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
</catalog>`

export default function XmlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [validation, setValidation] = useState<ReturnType<typeof validateXml> | null>(null)
  const [copied, setCopied] = useState(false)

  const format = () => {
    const src = input || SAMPLE_XML
    const v = validateXml(src)
    setValidation(v)
    if (!v.valid) {
      setError(v.error || 'Invalid XML')
      setOutput('')
      return
    }
    setError('')
    setOutput(formatXml(src, ' '.repeat(indentSize)))
  }

  const minify = () => {
    const src = input || SAMPLE_XML
    const v = validateXml(src)
    setValidation(v)
    if (!v.valid) {
      setError(v.error || 'Invalid XML')
      setOutput('')
      return
    }
    setError('')
    setOutput(minifyXml(src))
  }

  const toJson = () => {
    const src = input || SAMPLE_XML
    const parser = new DOMParser()
    const doc = parser.parseFromString(src, 'application/xml')
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      setError(parseError.textContent || 'Parse error')
      setOutput('')
      return
    }
    setError('')

    function xmlToObj(node: Element): unknown {
      const obj: Record<string, unknown> = {}

      // Attributes
      for (const attr of Array.from(node.attributes)) {
        obj['@' + attr.name] = attr.value
      }

      // Group children by tag
      const childMap: Record<string, unknown[]> = {}
      for (const child of Array.from(node.children)) {
        const tag = child.tagName
        if (!childMap[tag]) childMap[tag] = []
        childMap[tag].push(xmlToObj(child))
      }

      for (const [tag, items] of Object.entries(childMap)) {
        obj[tag] = items.length === 1 ? items[0] : items
      }

      // Text content (if no children)
      if (node.children.length === 0) {
        const text = node.textContent?.trim()
        if (text && Object.keys(obj).length === 0) return text
        if (text) obj['#text'] = text
      }

      return obj
    }

    const result = { [doc.documentElement.tagName]: xmlToObj(doc.documentElement) }
    setOutput(JSON.stringify(result, null, 2))
    setValidation(validateXml(src))
  }

  const loadSample = () => setInput(SAMPLE_XML)

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>XML Formatter</h2>
        <p>Format, minify, validate, and convert XML to JSON</p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={format} className="btn-primary">Format</button>
          <button onClick={minify} className="btn-secondary">Minify</button>
          <button onClick={toJson} className="btn-secondary">XML &rarr; JSON</button>
          <button onClick={loadSample} className="btn-secondary">Load Sample</button>
          <span className="mx-2 self-center text-[var(--color-text-muted)]">|</span>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            Indent:
            <select
              value={indentSize}
              onChange={e => setIndentSize(+e.target.value)}
              className="input-field w-16 py-1"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </label>
        </div>

        {validation && (
          <div className="flex flex-wrap gap-3">
            <span className="badge" style={{
              background: validation.valid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: validation.valid ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {validation.valid ? 'Valid XML' : 'Invalid XML'}
            </span>
            {validation.info && (
              <>
                <span className="badge" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
                  {validation.info.elements} elements
                </span>
                <span className="badge" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
                  {validation.info.attributes} attributes
                </span>
                <span className="badge" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
                  depth: {validation.info.depth}
                </span>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Input XML</label>
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); setValidation(null) }}
              placeholder="Paste XML here..."
              className="input-field textarea-code"
              rows={16}
              spellCheck={false}
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
