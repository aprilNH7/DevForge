import { useState } from 'react'

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
  'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'COUNT', 'SUM',
  'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'WITH', 'RECURSIVE',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'INDEX', 'UNIQUE',
  'CONSTRAINT', 'DEFAULT', 'CHECK', 'CASCADE', 'GRANT', 'REVOKE',
  'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'RETURNING',
]

const MAJOR_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
  'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
  'DROP TABLE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
  'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'WITH', 'RETURNING',
]

function formatSql(sql: string, indent: string = '  ', uppercase: boolean = true): string {
  let formatted = sql.trim()

  // Normalize whitespace
  formatted = formatted.replace(/\s+/g, ' ')

  // Uppercase keywords
  if (uppercase) {
    KEYWORDS.forEach(kw => {
      const re = new RegExp(`\\b${kw}\\b`, 'gi')
      formatted = formatted.replace(re, kw)
    })
  }

  // Add newlines before major keywords
  MAJOR_KEYWORDS.forEach(kw => {
    const re = new RegExp(`\\s+${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi')
    formatted = formatted.replace(re, `\n${uppercase ? kw : kw.toLowerCase()}`)
  })

  // Handle AND/OR
  formatted = formatted.replace(/\s+AND\b/gi, `\n${indent}AND`)
  formatted = formatted.replace(/\s+OR\b/gi, `\n${indent}OR`)

  // Indent after SELECT, SET
  formatted = formatted.replace(/\bSELECT\s+/gi, 'SELECT\n' + indent)
  formatted = formatted.replace(/\bSET\s+/gi, 'SET\n' + indent)

  // Handle commas in SELECT lists
  const lines = formatted.split('\n')
  const result: string[] = []
  let inSelect = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^SELECT\b/i.test(trimmed)) inSelect = true
    else if (/^(FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON)\b/i.test(trimmed)) inSelect = false

    if (inSelect && trimmed.includes(',') && !trimmed.startsWith('SELECT')) {
      const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean)
      parts.forEach((p, i) => {
        result.push(indent + p + (i < parts.length - 1 ? ',' : ''))
      })
    } else {
      result.push(line)
    }
  }

  return result.join('\n').trim()
}

function minifySql(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),])\s*/g, '$1')
    .replace(/\s*=\s*/g, '=')
    .trim()
}

const SAMPLE_SQL = `select u.id, u.name, u.email, count(o.id) as order_count, sum(o.total) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at > '2024-01-01' and u.status = 'active' group by u.id, u.name, u.email having count(o.id) > 5 order by total_spent desc limit 100`

export default function SqlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [uppercase, setUppercase] = useState(true)
  const [copied, setCopied] = useState(false)

  const format = () => {
    const indent = ' '.repeat(indentSize)
    setOutput(formatSql(input || SAMPLE_SQL, indent, uppercase))
  }

  const minify = () => {
    setOutput(minifySql(input || SAMPLE_SQL))
  }

  const loadSample = () => {
    setInput(SAMPLE_SQL)
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const stats = input ? {
    chars: input.length,
    lines: input.split('\n').length,
    keywords: KEYWORDS.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(input)).length,
  } : null

  return (
    <div>
      <div className="tool-header">
        <h2>SQL Formatter</h2>
        <p>Format, beautify, and minify SQL queries</p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={format} className="btn-primary">Format</button>
          <button onClick={minify} className="btn-secondary">Minify</button>
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
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setUppercase(!uppercase)}
              className="w-9 h-5 rounded-full relative transition-colors duration-200"
              style={{ background: uppercase ? 'var(--color-accent)' : 'var(--color-bg-hover)' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                style={{ left: uppercase ? '18px' : '2px' }}
              />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">UPPERCASE</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Input SQL</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your SQL query here..."
              className="input-field textarea-code"
              rows={14}
            />
            {stats && (
              <div className="flex gap-3 mt-1">
                <span className="text-[0.65rem] text-[var(--color-text-muted)]">{stats.chars} chars</span>
                <span className="text-[0.65rem] text-[var(--color-text-muted)]">{stats.lines} lines</span>
                <span className="text-[0.65rem] text-[var(--color-text-muted)]">{stats.keywords} keywords</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Formatted Output</label>
              {output && (
                <button onClick={copy} className="btn-secondary text-xs py-1 px-2">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <pre className="code-block" style={{ minHeight: '328px', maxHeight: '400px', overflow: 'auto' }}>
              {output || 'Click "Format" or "Minify" to see output'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
