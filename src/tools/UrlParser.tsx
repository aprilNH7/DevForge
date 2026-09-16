import { useState, useMemo } from 'react'
import { TextArea } from '../components/TextArea'

export default function UrlParser() {
  const [url, setUrl] = useState('https://example.com:8080/path?foo=bar&baz=qux#section')

  const parsed = useMemo(() => {
    try {
      const u = new URL(url)
      const params: Record<string, string> = {}
      u.searchParams.forEach((v, k) => { params[k] = v })
      return {
        href: u.href,
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        params,
      }
    } catch {
      return null
    }
  }, [url])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">URL Parser</h2>
      <TextArea value={url} onChange={setUrl} rows={2} />
      {parsed ? (
        <div className="grid gap-3">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{key}</span>
              <div className="mt-1 text-sm break-all">
                {key === 'params' ? (
                  Object.keys(value as Record<string, string>).length ? (
                    <ul className="space-y-1">
                      {Object.entries(value as Record<string, string>).map(([k, v]) => (
                        <li key={k}><span className="text-[var(--color-accent)]">{k}</span>: {v}</li>
                      ))}
                    </ul>
                  ) : 'None'
                ) : String(value)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-red-500">Invalid URL</p>
      )}
    </div>
  )
}
