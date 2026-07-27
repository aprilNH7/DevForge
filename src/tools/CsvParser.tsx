import { useState, useMemo, useCallback } from 'react'

interface ParsedCsv {
  headers: string[]
  rows: string[][]
  errors: string[]
}

function parseCsv(text: string, delimiter: string = ','): ParsedCsv {
  const errors: string[] = []
  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false
  let lineNum = 1

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === delimiter) {
        current.push(field)
        field = ''
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        current.push(field)
        field = ''
        rows.push(current)
        current = []
        lineNum++
        if (ch === '\r') i++
      } else if (ch === '\r') {
        current.push(field)
        field = ''
        rows.push(current)
        current = []
        lineNum++
      } else {
        field += ch
      }
    }
  }

  // Last field/row
  if (field || current.length > 0) {
    current.push(field)
    rows.push(current)
  }

  if (inQuotes) {
    errors.push(`Line ${lineNum}: Unterminated quoted field`)
  }

  const headers = rows.length > 0 ? rows[0] : []
  const dataRows = rows.slice(1)

  // Check column consistency
  for (let i = 0; i < dataRows.length; i++) {
    if (dataRows[i].length !== headers.length) {
      errors.push(`Row ${i + 2}: Expected ${headers.length} columns, got ${dataRows[i].length}`)
    }
  }

  return { headers, rows: dataRows, errors }
}

function csvToJson(headers: string[], rows: string[][]): string {
  const objs = rows.map(row => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = row[i] || ''
    })
    return obj
  })
  return JSON.stringify(objs, null, 2)
}

function toCsv(headers: string[], rows: string[][], delimiter: string): string {
  const escape = (val: string): string => {
    if (val.includes(delimiter) || val.includes('"') || val.includes('\n')) {
      return '"' + val.replace(/"/g, '""') + '"'
    }
    return val
  }
  const lines = [headers.map(escape).join(delimiter)]
  for (const row of rows) {
    lines.push(row.map(escape).join(delimiter))
  }
  return lines.join('\n')
}

const SAMPLE = `name,email,role,salary,department
Alice Johnson,alice@example.com,Engineer,120000,Engineering
Bob Smith,bob@example.com,Designer,95000,Design
Carol Williams,carol@example.com,Manager,140000,Engineering
Dave Brown,dave@example.com,Engineer,115000,Engineering
Eve Davis,eve@example.com,Analyst,88000,Analytics
Frank Miller,frank@example.com,Designer,92000,Design
Grace Wilson,grace@example.com,Manager,145000,Product
Hank Moore,hank@example.com,Engineer,125000,Engineering
Ivy Taylor,ivy@example.com,Analyst,91000,Analytics
Jack Anderson,jack@example.com,Engineer,110000,Engineering`

export default function CsvParser() {
  const [input, setInput] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<'table' | 'json' | 'stats'>('table')

  const parsed = useMemo(() => parseCsv(input || SAMPLE, delimiter), [input, delimiter])

  const filteredRows = useMemo(() => {
    let rows = parsed.rows
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      rows = rows.filter(row => row.some(cell => cell.toLowerCase().includes(lower)))
    }
    if (sortCol !== null) {
      rows = [...rows].sort((a, b) => {
        const va = a[sortCol] || ''
        const vb = b[sortCol] || ''
        const na = parseFloat(va)
        const nb = parseFloat(vb)
        if (!isNaN(na) && !isNaN(nb)) return sortDir === 'asc' ? na - nb : nb - na
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
    }
    return rows
  }, [parsed.rows, searchTerm, sortCol, sortDir])

  const toggleSort = useCallback((idx: number) => {
    if (sortCol === idx) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(idx)
      setSortDir('asc')
    }
  }, [sortCol])

  const stats = useMemo(() => {
    if (parsed.headers.length === 0) return []
    return parsed.headers.map((header, idx) => {
      const values = parsed.rows.map(r => r[idx] || '')
      const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n))
      const unique = new Set(values).size
      const empty = values.filter(v => v.trim() === '').length
      return {
        header,
        total: values.length,
        unique,
        empty,
        isNumeric: nums.length > values.length * 0.5,
        min: nums.length > 0 ? Math.min(...nums) : null,
        max: nums.length > 0 ? Math.max(...nums) : null,
        avg: nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null,
      }
    })
  }, [parsed])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const loadSample = () => setInput(SAMPLE)

  return (
    <div>
      <div className="tool-header">
        <h2>CSV Parser</h2>
        <p>Parse, search, sort, and convert CSV data with column statistics</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">CSV Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste CSV data here..."
            className="input-field textarea-code"
            rows={6}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={loadSample} className="btn-secondary">Load Sample</button>
          <button onClick={() => copy(csvToJson(parsed.headers, filteredRows))} className="btn-secondary">
            {copied ? 'Copied!' : 'Copy as JSON'}
          </button>
          <button onClick={() => copy(toCsv(parsed.headers, filteredRows, delimiter))} className="btn-secondary">
            Copy as CSV
          </button>
          <span className="mx-2 self-center text-[var(--color-text-muted)]">|</span>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            Delimiter:
            <select value={delimiter} onChange={e => setDelimiter(e.target.value)} className="input-field w-20 py-1">
              <option value=",">Comma</option>
              <option value={'\t'}>Tab</option>
              <option value=";">Semicolon</option>
              <option value="|">Pipe</option>
            </select>
          </label>
        </div>

        {parsed.errors.length > 0 && (
          <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
            {parsed.errors.map((e, i) => (
              <p key={i} className="text-sm text-[var(--color-error)]">{e}</p>
            ))}
          </div>
        )}
      </div>

      {parsed.headers.length > 0 && (
        <div className="card mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1">
              {(['table', 'json', 'stats'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={view === v ? 'btn-primary' : 'btn-secondary'}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            {view === 'table' && (
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search rows..."
                className="input-field max-w-xs py-1.5"
              />
            )}

            <div className="flex gap-3 ml-auto">
              <span className="badge" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
                {parsed.headers.length} columns
              </span>
              <span className="badge" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
                {filteredRows.length} rows
              </span>
            </div>
          </div>

          {view === 'table' && (
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--color-bg-input)' }}>
                    <th className="py-2 px-3 text-left text-[0.65rem] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold w-8">#</th>
                    {parsed.headers.map((h, i) => (
                      <th
                        key={i}
                        onClick={() => toggleSort(i)}
                        className="py-2 px-3 text-left text-[0.65rem] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold cursor-pointer hover:text-[var(--color-accent)] select-none"
                      >
                        {h} {sortCol === i ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.slice(0, 100).map((row, ri) => (
                    <tr key={ri} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                      <td className="py-1.5 px-3 text-[var(--color-text-muted)] text-xs">{ri + 1}</td>
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-1.5 px-3 text-[var(--color-text-primary)] font-mono text-xs whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRows.length > 100 && (
                <div className="py-2 px-3 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
                  Showing 100 of {filteredRows.length} rows
                </div>
              )}
            </div>
          )}

          {view === 'json' && (
            <pre className="code-block" style={{ maxHeight: '500px', overflow: 'auto' }}>
              {csvToJson(parsed.headers, filteredRows)}
            </pre>
          )}

          {view === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                  <h4 className="text-sm font-semibold text-[var(--color-accent)] mb-2 truncate">{s.header}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Total</span>
                      <span className="text-[var(--color-text-primary)] font-mono">{s.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Unique</span>
                      <span className="text-[var(--color-text-primary)] font-mono">{s.unique}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Empty</span>
                      <span className="text-[var(--color-text-primary)] font-mono">{s.empty}</span>
                    </div>
                    {s.isNumeric && (
                      <>
                        <div className="border-t border-[var(--color-border)] my-1" />
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Min</span>
                          <span className="text-[var(--color-success)] font-mono">{s.min?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Max</span>
                          <span className="text-[var(--color-error)] font-mono">{s.max?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Average</span>
                          <span className="text-[var(--color-accent)] font-mono">{s.avg?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
