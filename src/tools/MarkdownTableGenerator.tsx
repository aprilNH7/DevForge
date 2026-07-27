import { useState, useMemo } from 'react'

type Alignment = 'left' | 'center' | 'right'

export default function MarkdownTableGenerator() {
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(4)
  const [data, setData] = useState<string[][]>(() =>
    Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => r === 0 ? `Header ${c + 1}` : '')
    )
  )
  const [alignments, setAlignments] = useState<Alignment[]>(Array(10).fill('left'))
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')
  const [compact, setCompact] = useState(false)

  const updateCell = (r: number, c: number, val: string) => {
    setData(prev => {
      const next = prev.map(row => [...row])
      while (next.length <= r) next.push(Array(cols + 1).fill(''))
      while (next[r].length <= c) next[r].push('')
      next[r][c] = val
      return next
    })
  }

  const toggleAlignment = (c: number) => {
    setAlignments(prev => {
      const next = [...prev]
      const cycle: Alignment[] = ['left', 'center', 'right']
      const idx = cycle.indexOf(next[c])
      next[c] = cycle[(idx + 1) % 3]
      return next
    })
  }

  const addRow = () => setRows(r => r + 1)
  const addCol = () => setCols(c => c + 1)
  const removeRow = () => { if (rows > 1) setRows(r => r - 1) }
  const removeCol = () => { if (cols > 1) setCols(c => c - 1) }

  const markdown = useMemo(() => {
    const headerRow = data[0]?.slice(0, cols + 1) || []
    const dataRows = data.slice(1, rows + 1).map(r => r.slice(0, cols + 1))

    // Pad headers
    while (headerRow.length < cols + 1) headerRow.push('')

    if (compact) {
      const sep = headerRow.map((_, i) => {
        const a = alignments[i]
        if (a === 'center') return ':-:'
        if (a === 'right') return '--:'
        return '---'
      })
      const lines = [
        '| ' + headerRow.map(h => h || ' ').join(' | ') + ' |',
        '| ' + sep.join(' | ') + ' |',
      ]
      for (const row of dataRows) {
        const padded = [...row]
        while (padded.length < cols + 1) padded.push('')
        lines.push('| ' + padded.map(c => c || ' ').join(' | ') + ' |')
      }
      return lines.join('\n')
    }

    // Pretty-print with aligned columns
    const allRows = [headerRow, ...dataRows]
    const colWidths = headerRow.map((_, ci) => {
      let max = 3 // minimum separator width
      for (const row of allRows) {
        max = Math.max(max, (row[ci] || '').length)
      }
      return max
    })

    const pad = (s: string, width: number, align: Alignment) => {
      const diff = width - s.length
      if (diff <= 0) return s
      if (align === 'center') {
        const left = Math.floor(diff / 2)
        return ' '.repeat(left) + s + ' '.repeat(diff - left)
      }
      if (align === 'right') return ' '.repeat(diff) + s
      return s + ' '.repeat(diff)
    }

    const formatRow = (row: string[]) => {
      const cells = colWidths.map((w, i) => pad(row[i] || '', w, alignments[i]))
      return '| ' + cells.join(' | ') + ' |'
    }

    const separator = colWidths.map((w, i) => {
      const a = alignments[i]
      const inner = '-'.repeat(w)
      if (a === 'center') return ':' + inner.slice(1, -1) + ':'
      if (a === 'right') return inner.slice(0, -1) + ':'
      return inner
    })
    const sepLine = '| ' + separator.join(' | ') + ' |'

    const lines = [formatRow(headerRow), sepLine]
    for (const row of dataRows) {
      const padded = [...row]
      while (padded.length < cols + 1) padded.push('')
      lines.push(formatRow(padded))
    }
    return lines.join('\n')
  }, [data, rows, cols, alignments, compact])

  const copy = () => {
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const importTable = () => {
    const lines = importText.trim().split('\n').filter(l => l.trim().startsWith('|'))
    if (lines.length < 2) return

    const parseLine = (line: string) =>
      line.split('|').slice(1, -1).map(c => c.trim())

    const headers = parseLine(lines[0])
    const sepLine = parseLine(lines[1])
    const importAlignments: Alignment[] = sepLine.map(s => {
      if (s.startsWith(':') && s.endsWith(':')) return 'center'
      if (s.endsWith(':')) return 'right'
      return 'left'
    })

    const importRows = lines.slice(2).map(parseLine)

    const newData: string[][] = Array.from({ length: Math.max(importRows.length + 1, 5) }, () => Array(Math.max(headers.length, 5)).fill(''))
    headers.forEach((h, i) => { newData[0][i] = h })
    importRows.forEach((row, ri) => {
      row.forEach((cell, ci) => { newData[ri + 1][ci] = cell })
    })

    setData(newData)
    setCols(headers.length - 1)
    setRows(importRows.length)
    setAlignments(prev => {
      const next = [...prev]
      importAlignments.forEach((a, i) => { next[i] = a })
      return next
    })
    setImportText('')
  }

  const clearAll = () => {
    setData(Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 10 }, (_, c) => r === 0 ? `Header ${c + 1}` : '')
    ))
  }

  const loadSample = () => {
    const sample = [
      ['Feature', 'Status', 'Priority', 'Notes'],
      ['Authentication', 'Done', 'High', 'OAuth + JWT'],
      ['Dashboard', 'In Progress', 'High', 'Charts ready'],
      ['API Docs', 'Planned', 'Medium', 'OpenAPI spec'],
      ['Dark Mode', 'Done', 'Low', 'CSS variables'],
    ]
    const newData: string[][] = Array.from({ length: 10 }, () => Array(10).fill(''))
    sample.forEach((row, ri) => row.forEach((cell, ci) => { newData[ri][ci] = cell }))
    setData(newData)
    setCols(3)
    setRows(4)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>Markdown Table Generator</h2>
        <p>Build, edit, and export Markdown tables with column alignment control</p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={addRow} className="btn-secondary text-xs">+ Row</button>
          <button onClick={removeRow} className="btn-secondary text-xs">- Row</button>
          <button onClick={addCol} className="btn-secondary text-xs">+ Column</button>
          <button onClick={removeCol} className="btn-secondary text-xs">- Column</button>
          <span className="mx-1 text-[var(--color-text-muted)]">|</span>
          <button onClick={loadSample} className="btn-secondary text-xs">Sample</button>
          <button onClick={clearAll} className="btn-secondary text-xs">Clear</button>
          <label className="flex items-center gap-2 cursor-pointer select-none ml-2">
            <div
              onClick={() => setCompact(!compact)}
              className="w-9 h-5 rounded-full relative transition-colors duration-200"
              style={{ background: compact ? 'var(--color-accent)' : 'var(--color-bg-hover)' }}
            >
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                style={{ left: compact ? '18px' : '2px' }} />
            </div>
            <span className="text-xs text-[var(--color-text-secondary)]">Compact</span>
          </label>
        </div>

        {/* Alignment controls */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          <div className="w-8 flex-shrink-0" />
          {Array.from({ length: cols + 1 }, (_, c) => (
            <button
              key={c}
              onClick={() => toggleAlignment(c)}
              className="flex-1 min-w-[80px] text-center text-[0.6rem] uppercase tracking-wider py-1 rounded cursor-pointer border-none transition-colors"
              style={{ background: 'var(--color-bg-input)', color: 'var(--color-accent)' }}
              title={`Click to cycle: left → center → right`}
            >
              {alignments[c] === 'left' ? '⬅ Left' : alignments[c] === 'center' ? '↔ Center' : '➡ Right'}
            </button>
          ))}
        </div>

        {/* Table editor */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {Array.from({ length: rows + 1 }, (_, r) => (
                <tr key={r}>
                  <td className="p-0.5 w-8 text-center text-[0.6rem] text-[var(--color-text-muted)]">
                    {r === 0 ? 'H' : r}
                  </td>
                  {Array.from({ length: cols + 1 }, (_, c) => (
                    <td key={c} className="p-0.5">
                      <input
                        value={data[r]?.[c] || ''}
                        onChange={e => updateCell(r, c, e.target.value)}
                        className="input-field py-1.5 text-xs font-mono"
                        style={{
                          fontWeight: r === 0 ? 600 : 400,
                          background: r === 0 ? 'var(--color-accent-glow)' : undefined,
                          textAlign: alignments[c]
                        }}
                        placeholder={r === 0 ? `Col ${c + 1}` : ''}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Output */}
      <div className="card mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="label mb-0">Markdown Output</label>
          <button onClick={copy} className="btn-primary text-xs">
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
        </div>
        <pre className="code-block text-sm">{markdown}</pre>
      </div>

      {/* Preview */}
      <div className="card mt-4 space-y-3">
        <label className="label">Preview</label>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-input)' }}>
                {data[0]?.slice(0, cols + 1).map((h, i) => (
                  <th key={i} className="py-2 px-3 text-[0.7rem] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]"
                    style={{ textAlign: alignments[i] }}>
                    {h || '\u00A0'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(1, rows + 1).map((row, ri) => (
                <tr key={ri} className="border-t border-[var(--color-border)]">
                  {row.slice(0, cols + 1).map((cell, ci) => (
                    <td key={ci} className="py-1.5 px-3 text-[var(--color-text-primary)]"
                      style={{ textAlign: alignments[ci] }}>
                      {cell || '\u00A0'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import */}
      <div className="card mt-4 space-y-3">
        <label className="label">Import Existing Markdown Table</label>
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder="Paste a Markdown table here to edit it..."
          className="input-field textarea-code"
          rows={4}
        />
        {importText && (
          <button onClick={importTable} className="btn-secondary">Import Table</button>
        )}
      </div>
    </div>
  )
}
