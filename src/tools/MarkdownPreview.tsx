import { useState, useMemo } from 'react'

function parseMarkdown(md: string): string {
  let html = md
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:0.875em;color:#06b6d4">$1</code>')
  // Headers
  html = html.replace(/^######\s+(.*)$/gm, '<h6 style="font-size:0.875rem;font-weight:600;margin:16px 0 8px;color:#e2e8f0">$1</h6>')
  html = html.replace(/^#####\s+(.*)$/gm, '<h5 style="font-size:1rem;font-weight:600;margin:16px 0 8px;color:#e2e8f0">$1</h5>')
  html = html.replace(/^####\s+(.*)$/gm, '<h4 style="font-size:1.1rem;font-weight:600;margin:20px 0 8px;color:#e2e8f0">$1</h4>')
  html = html.replace(/^###\s+(.*)$/gm, '<h3 style="font-size:1.25rem;font-weight:700;margin:24px 0 8px;color:#f1f5f9">$1</h3>')
  html = html.replace(/^##\s+(.*)$/gm, '<h2 style="font-size:1.5rem;font-weight:700;margin:28px 0 10px;color:#f1f5f9;border-bottom:1px solid #334155;padding-bottom:8px">$1</h2>')
  html = html.replace(/^#\s+(.*)$/gm, '<h1 style="font-size:2rem;font-weight:800;margin:32px 0 12px;color:#f8fafc">$1</h1>')
  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/~~(.+?)~~/g, '<del style="opacity:0.5">$1</del>')
  // Links and images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0" />')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#06b6d4;text-decoration:underline">$1</a>')
  // Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote style="border-left:3px solid #06b6d4;padding:4px 16px;margin:8px 0;color:#94a3b8;background:#0f172a;border-radius:0 4px 4px 0">$1</blockquote>')
  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #334155;margin:24px 0" />')
  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li style="margin:4px 0;margin-left:20px;list-style:disc;color:#cbd5e1">$1</li>')
  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, '<li style="margin:4px 0;margin-left:20px;list-style:decimal;color:#cbd5e1">$1</li>')
  // Checkboxes
  html = html.replace(/<li([^>]*)>\[x\]\s*/g, '<li$1><input type="checkbox" checked disabled style="margin-right:8px" />')
  html = html.replace(/<li([^>]*)>\[ \]\s*/g, '<li$1><input type="checkbox" disabled style="margin-right:8px" />')
  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split('|').filter(c => c.trim())
    if (cells.every(c => /^[\s-:]+$/.test(c))) return '<!--table-sep-->'
    const cellHtml = cells.map(c => `<td style="padding:8px 12px;border:1px solid #334155">${c.trim()}</td>`).join('')
    return `<tr>${cellHtml}</tr>`
  })
  html = html.replace(/((<tr>.*<\/tr>\n?)+)/g, '<table style="border-collapse:collapse;width:100%;margin:12px 0;font-size:0.875rem">$1</table>')
  html = html.replace(/<!--table-sep-->\n?/g, '')
  // Paragraphs
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p style="margin:8px 0;line-height:1.7;color:#cbd5e1">$1</p>')

  return html
}

const sampleMd = `# Welcome to Markdown Preview

## Features

This tool supports **bold**, *italic*, ***bold italic***, and ~~strikethrough~~ text.

### Code

Inline \`code\` and code blocks:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

- First item
- Second item
- Third item

1. Ordered one
2. Ordered two
3. Ordered three

### Links & Quotes

[Visit GitHub](https://github.com)

> This is a blockquote. It can contain **formatted** text.

---

### Table

| Feature | Status |
| --- | --- |
| Headers | Done |
| Lists | Done |
| Code | Done |
| Tables | Done |

*Built with DevForge*
`

export default function MarkdownPreview() {
  const [input, setInput] = useState(sampleMd)
  const rendered = useMemo(() => parseMarkdown(input), [input])

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0
  const charCount = input.length
  const lineCount = input.split('\n').length

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Markdown Preview</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Write Markdown and see the rendered output in real-time</p>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-[var(--color-text-muted)]">
        <span>{lineCount} lines</span>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
        <button
          onClick={() => setInput('')}
          className="btn-secondary text-xs px-3 py-1"
        >
          Clear
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(rendered)}
          className="btn-secondary text-xs px-3 py-1"
        >
          Copy HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Editor</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="input-field flex-1 font-mono text-sm resize-none"
            placeholder="Type your Markdown here..."
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Preview</div>
          <div
            className="card flex-1 overflow-y-auto p-5 scrollbar-thin"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </div>
      </div>
    </div>
  )
}
