import { useState } from 'react'
import { Button } from '../components/Button'
import { TextArea } from '../components/TextArea'

const ALGORITHMS = ['HS256', 'HS384', 'HS512']

export default function JwtGenerator() {
  const [payload, setPayload] = useState(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000) }, null, 2))
  const [secret, setSecret] = useState('your-256-bit-secret')
  const [alg, setAlg] = useState('HS256')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const generate = () => {
    try {
      const data = JSON.parse(payload)
      const header = { alg, typ: 'JWT' }
      const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
      const encodedPayload = btoa(JSON.stringify(data)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
      const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
      setToken(`${encodedHeader}.${encodedPayload}.${signature}`)
      setError('')
    } catch {
      setError('Invalid JSON payload')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">JWT Generator</h2>
        <select
          value={alg}
          onChange={e => setAlg(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm"
        >
          {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Payload (JSON)</label>
        <TextArea value={payload} onChange={setPayload} rows={8} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Secret</label>
        <input
          type="text"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none"
        />
      </div>
      <Button onClick={generate}>Generate Token</Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {token && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Token</label>
          <TextArea value={token} onChange={() => {}} rows={4} readOnly />
        </div>
      )}
    </div>
  )
}
