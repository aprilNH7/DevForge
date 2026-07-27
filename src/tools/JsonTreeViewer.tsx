import { useState, useCallback } from 'react'

function escapeJsonPointer(key: string): string {
  return key.replace(/~/g, '~0').replace(/\//g, '~1')
}

function flattenJson(obj: unknown, prefix: string = '', result: [string, string][] = []): [string, string][] {
  if (obj === null || obj === undefined) {
    result.push([prefix || '/', 'null'])
    return result
  }
  if (typeof obj !== 'object') {
    result.push([prefix || '/', String(obj)])
    return result
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) result.push([prefix || '/', '[]'])
    obj.forEach((item, i) => flattenJson(item, `${prefix}/${i}`, result))
    return result
  }
  const entries = Object.entries(obj as Record<string, unknown>)
  if (entries.length === 0) result.push([prefix || '/', '{}'])
  for (const [key, val] of entries) {
    flattenJson(val, `${prefix}/${escapeJsonPointer(key)}`, result)
  }
  return result
}

function jsonToQueryString(obj: unknown, prefix: string = ''): string {
  if (typeof obj !== 'object' || obj === null) return ''
  const params: string[] = []

  function walk(o: unknown, p: string) {
    if (o === null || o === undefined) {
      params.push(`${encodeURIComponent(p)}=`)
    } else if (typeof o !== 'object') {
      params.push(`${encodeURIComponent(p)}=${encodeURIComponent(String(o))}`)
    } else if (Array.isArray(o)) {
      o.forEach((item, i) => walk(item, `${p}[${i}]`))
    } else {
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        walk(v, p ? `${p}[${k}]` : k)
      }
    }
  }

  walk(obj, prefix)
  return params.join('&')
}

function getType(val: unknown): string {
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'string': return 'var(--color-success)'
    case 'number': return 'var(--color-accent)'
    case 'boolean': return 'var(--color-warning)'
    case 'null': return 'var(--color-text-muted)'
    case 'array': return '#c084fc'
    case 'object': return '#f472b6'
    default: return 'var(--color-text-secondary)'
  }
}

interface TreeNode {
  key: string
  value: unknown
  type: string
  path: string
  children?: TreeNode[]
}

function buildTree(obj: unknown, key: string = 'root', path: string = ''): TreeNode {
  const type = getType(obj)
  const node: TreeNode = { key, value: obj, type, path: path || '/' }

  if (Array.isArray(obj)) {
    node.children = obj.map((item, i) => buildTree(item, String(i), `${path}/${i}`))
  } else if (typeof obj === 'object' && obj !== null) {
    node.children = Object.entries(obj as Record<string, unknown>).map(([k, v]) =>
      buildTree(v, k, `${path}/${escapeJsonPointer(k)}`)
    )
  }

  return node
}

function TreeView({ node, depth = 0, collapsed, toggle }: { node: TreeNode; depth?: number; collapsed: Set<string>; toggle: (p: string) => void }) {
  const hasChildren = node.children && node.children.length > 0
  const isCollapsed = collapsed.has(node.path)

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <div
        className="flex items-center gap-1 py-0.5 hover:bg-[var(--color-bg-hover)] rounded px-1 cursor-pointer select-none"
        onClick={() => hasChildren && toggle(node.path)}
      >
        {hasChildren ? (
          <span className="w-4 text-center text-xs text-[var(--color-text-muted)]">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">{node.key}</span>
        <span className="text-[0.6rem] px-1 rounded" style={{ background: `${getTypeColor(node.type)}22`, color: getTypeColor(node.type) }}>
          {node.type}
        </span>
        {!hasChildren && (
          <span className="text-xs font-mono ml-1 truncate max-w-[300px]" style={{ color: getTypeColor(node.type) }}>
            {node.type === 'string' ? `"${String(node.value)}"` : String(node.value)}
          </span>
        )}
        {hasChildren && (
          <span className="text-[0.6rem] text-[var(--color-text-muted)]">
            ({node.children!.length} {node.type === 'array' ? 'items' : 'keys'})
          </span>
        )}
      </div>
      {hasChildren && !isCollapsed && (
        <div>
          {node.children!.map((child, i) => (
            <TreeView key={i} node={child} depth={depth + 1} collapsed={collapsed} toggle={toggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function JsonTreeViewer() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [view, setView] = useState<'tree' | 'flat' | 'query' | 'types'>('tree')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [pathCopied, setPathCopied] = useState<string | null>(null)

  const SAMPLE = `{
  "users": [
    { "id": 1, "name": "Alice", "email": "alice@example.com", "active": true, "roles": ["admin", "user"] },
    { "id": 2, "name": "Bob", "email": "bob@example.com", "active": false, "roles": ["user"] }
  ],
  "meta": { "total": 2, "page": 1, "per_page": 10 },
  "api_version": "2.1.0"
}`

  const parsed = (() => {
    try {
      const src = input || SAMPLE
      return JSON.parse(src)
    } catch (e) {
      return null
    }
  })()

  const tree = parsed !== null ? buildTree(parsed) : null

  const toggle = useCallback((path: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const expandAll = () => setCollapsed(new Set())
  const collapseAll = () => {
    if (!tree) return
    const paths = new Set<string>()
    function walk(node: TreeNode) {
      if (node.children) {
        paths.add(node.path)
        node.children.forEach(walk)
      }
    }
    walk(tree)
    setCollapsed(paths)
  }

  const validate = () => {
    try {
      JSON.parse(input || SAMPLE)
      setError('')
    } catch (e) {
      setError(String(e))
    }
  }

  const flat = parsed !== null ? flattenJson(parsed) : []
  const query = parsed !== null ? jsonToQueryString(parsed) : ''

  const typeStats = (() => {
    if (!parsed) return {}
    const counts: Record<string, number> = {}
    function walk(val: unknown) {
      const t = getType(val)
      counts[t] = (counts[t] || 0) + 1
      if (Array.isArray(val)) val.forEach(walk)
      else if (typeof val === 'object' && val !== null) Object.values(val).forEach(walk)
    }
    walk(parsed)
    return counts
  })()

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setPathCopied(path)
    setTimeout(() => setPathCopied(null), 1500)
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>JSON Tree Viewer</h2>
        <p>Explore JSON structure with tree view, flattened paths, and type analysis</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">JSON Input</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            placeholder='Paste JSON here or click Load Sample...'
            className="input-field textarea-code"
            rows={6}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setInput(SAMPLE)} className="btn-secondary">Load Sample</button>
          <button onClick={validate} className="btn-secondary">Validate</button>
        </div>

        {error && (
          <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          </div>
        )}
      </div>

      {tree && (
        <div className="card mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['tree', 'flat', 'query', 'types'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={view === v ? 'btn-primary' : 'btn-secondary'}>
                {v === 'tree' ? 'Tree' : v === 'flat' ? 'Flat Paths' : v === 'query' ? 'Query String' : 'Type Stats'}
              </button>
            ))}
            {view === 'tree' && (
              <>
                <span className="mx-1 text-[var(--color-text-muted)]">|</span>
                <button onClick={expandAll} className="btn-secondary text-xs py-1">Expand All</button>
                <button onClick={collapseAll} className="btn-secondary text-xs py-1">Collapse All</button>
              </>
            )}
          </div>

          {view === 'tree' && (
            <div className="code-block" style={{ maxHeight: '500px', overflow: 'auto' }}>
              <TreeView node={tree} collapsed={collapsed} toggle={toggle} />
            </div>
          )}

          {view === 'flat' && (
            <div className="space-y-1" style={{ maxHeight: '500px', overflow: 'auto' }}>
              {flat.map(([path, val], i) => (
                <div key={i} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[var(--color-bg-hover)] group">
                  <code className="text-xs font-mono text-[var(--color-accent)] flex-shrink-0 cursor-pointer" onClick={() => copyPath(path)}>
                    {pathCopied === path ? 'Copied!' : path}
                  </code>
                  <span className="text-[var(--color-text-muted)]">=</span>
                  <span className="text-xs font-mono text-[var(--color-text-primary)] truncate">{val}</span>
                </div>
              ))}
            </div>
          )}

          {view === 'query' && (
            <div>
              <div className="flex justify-end mb-1">
                <button onClick={() => copy(query)} className="btn-secondary text-xs py-1 px-2">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="code-block break-all" style={{ maxHeight: '300px', overflow: 'auto' }}>{query}</pre>
            </div>
          )}

          {view === 'types' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(typeStats).map(([type, count]) => (
                <div key={type} className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
                  <div className="text-xl font-bold" style={{ color: getTypeColor(type) }}>{count}</div>
                  <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: getTypeColor(type) }}>{type}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
