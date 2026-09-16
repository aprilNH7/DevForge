import { useState } from 'react'
import { Button } from '../components/Button'
import { TextArea } from '../components/TextArea'

async function hmac(message: string, secret: string, algorithm: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

export default function HmacGenerator() {
  const [message, setMessage] = useState('The quick brown fox')
  const [secret, setSecret] = useState('secret-key')
  const [algorithm, setAlgorithm] = useState('SHA-256')
  const [output, setOutput] = useState('')

  const generate = async () => {
    const hash = await hmac(message, secret, algorithm)
    setOutput(hash)
  }

  return (
    <div className="space-y-4">
      <div className="tool-header">
        <h2>HMAC Generator</h2>
        <p>Generate HMAC signatures with SHA-1/256/384/512.</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="label mb-0">Algorithm</span>
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="input-field text-sm py-1.5 px-3">
            {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <label className="label">Message</label>
        <TextArea value={message} onChange={setMessage} rows={4} />

        <label className="label mt-3">Secret Key</label>
        <input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="input-field" />

        <Button onClick={generate} className="mt-4">Generate HMAC</Button>
      </div>

      {output && (
        <div className="card">
          <span className="label">HMAC ({algorithm})</span>
          <div className="mt-2 font-mono text-sm break-all">{output}</div>
        </div>
      )}
    </div>
  )
}
