import { useState } from 'react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface HeaderEntry {
  key: string
  value: string
  id: string
}

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: string
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-[#22c55e]',
  POST: 'text-[#f59e0b]',
  PUT: 'text-[#3b82f6]',
  PATCH: 'text-[#a78bfa]',
  DELETE: 'text-[#ef4444]',
}

export default function ApiTester() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [headers, setHeaders] = useState<HeaderEntry[]>([
    { key: 'Content-Type', value: 'application/json', id: '1' },
  ])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')
  const [copied, setCopied] = useState(false)

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', id: Date.now().toString() }])
  }

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id))
  }

  const updateHeader = (id: string, field: 'key' | 'value', val: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: val } : h))
  }

  const sendRequest = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    const start = performance.now()

    try {
      const reqHeaders: Record<string, string> = {}
      headers.forEach(h => {
        if (h.key.trim()) reqHeaders[h.key.trim()] = h.value
      })

      const options: RequestInit = {
        method,
        headers: reqHeaders,
      }

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body
      }

      const res = await fetch(url, options)
      const elapsed = performance.now() - start

      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => {
        resHeaders[k] = v
      })

      const text = await res.text()
      let formattedBody = text
      try {
        formattedBody = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        // not JSON, keep as-is
      }

      const sizeBytes = new Blob([text]).size
      const size = sizeBytes > 1024
        ? `${(sizeBytes / 1024).toFixed(1)} KB`
        : `${sizeBytes} B`

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: formattedBody,
        time: Math.round(elapsed),
        size,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: number) => {
    if (status < 300) return 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30'
    if (status < 400) return 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30'
    return 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30'
  }

  const copyResponse = async () => {
    if (!response) return
    await navigator.clipboard.writeText(response.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>API Tester</h2>
        <p>Make HTTP requests and inspect responses with timing</p>
      </div>

      {/* URL Bar */}
      <div className="card mb-4">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={e => setMethod(e.target.value as HttpMethod)}
            className={`input-field !w-28 font-semibold text-sm cursor-pointer ${METHOD_COLORS[method]}`}
          >
            {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map(m => (
              <option key={m} value={m} className="bg-[var(--color-bg-input)] text-[var(--color-text-primary)]">{m}</option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="input-field flex-1 font-mono text-sm"
            onKeyDown={e => e.key === 'Enter' && sendRequest()}
          />
          <button
            onClick={sendRequest}
            disabled={loading}
            className="btn-primary !px-6 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
            ) : 'Send'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Config */}
        <div className="card">
          <div className="flex gap-1 mb-3 border-b border-[var(--color-border)] pb-2">
            <button
              onClick={() => setActiveTab('headers')}
              className={`text-xs px-3 py-1.5 rounded-t border-none cursor-pointer ${
                activeTab === 'headers'
                  ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                  : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Headers ({headers.length})
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`text-xs px-3 py-1.5 rounded-t border-none cursor-pointer ${
                activeTab === 'body'
                  ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                  : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Body
            </button>
          </div>

          {activeTab === 'headers' ? (
            <div>
              {headers.map(h => (
                <div key={h.id} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={h.key}
                    onChange={e => updateHeader(h.id, 'key', e.target.value)}
                    placeholder="Header name"
                    className="input-field flex-1 text-xs"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={e => updateHeader(h.id, 'value', e.target.value)}
                    placeholder="Value"
                    className="input-field flex-1 text-xs"
                  />
                  <button
                    onClick={() => removeHeader(h.id)}
                    className="btn-secondary !px-2 !py-1 text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button onClick={addHeader} className="btn-secondary text-xs mt-1">
                + Add Header
              </button>
            </div>
          ) : (
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="input-field textarea-code min-h-[200px]"
              spellCheck={false}
            />
          )}
        </div>

        {/* Response */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="label mb-0">Response</span>
            <div className="flex items-center gap-2">
              {response && (
                <>
                  <span className={`badge border ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="badge bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]">
                    {response.time}ms
                  </span>
                  <span className="badge bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]">
                    {response.size}
                  </span>
                  <button onClick={copyResponse} className="btn-secondary text-xs !py-0.5 !px-2">
                    {copied ? '✓' : 'Copy'}
                  </button>
                </>
              )}
            </div>
          </div>

          {error ? (
            <div className="code-block border-[var(--color-error)]/30 min-h-[200px]">
              <span className="text-[var(--color-error)]">Error: {error}</span>
            </div>
          ) : response ? (
            <div>
              {/* Response Headers (collapsible) */}
              <details className="mb-3">
                <summary className="text-xs text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-secondary)] mb-1">
                  Response Headers ({Object.keys(response.headers).length})
                </summary>
                <div className="code-block text-xs max-h-[120px] overflow-auto">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[#06b6d4]">{k}</span>
                      <span className="text-[var(--color-text-muted)]">: </span>
                      <span className="text-[var(--color-text-secondary)]">{v}</span>
                    </div>
                  ))}
                </div>
              </details>
              <div className="code-block min-h-[200px] max-h-[400px] overflow-auto">
                {response.body}
              </div>
            </div>
          ) : (
            <div className="code-block min-h-[200px] flex items-center justify-center">
              <span className="text-[var(--color-text-muted)]">
                {loading ? 'Sending request...' : 'Send a request to see the response'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
