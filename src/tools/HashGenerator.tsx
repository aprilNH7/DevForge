import { useState, useCallback } from 'react'

async function computeHash(algorithm: string, data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Simple MD5 implementation (not crypto-secure, but functional for the tool)
function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt))
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  function binlMD5(x: number[], len: number) {
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d
      a = md5ff(a, b, c, d, x[i] || 0, 7, -680876936)
      d = md5ff(d, a, b, c, x[i + 1] || 0, 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2] || 0, 17, 606105819)
      b = md5ff(b, c, d, a, x[i + 3] || 0, 22, -1044525330)
      a = md5ff(a, b, c, d, x[i + 4] || 0, 7, -176418897)
      d = md5ff(d, a, b, c, x[i + 5] || 0, 12, 1200080426)
      c = md5ff(c, d, a, b, x[i + 6] || 0, 17, -1473231341)
      b = md5ff(b, c, d, a, x[i + 7] || 0, 22, -45705983)
      a = md5ff(a, b, c, d, x[i + 8] || 0, 7, 1770035416)
      d = md5ff(d, a, b, c, x[i + 9] || 0, 12, -1958414417)
      c = md5ff(c, d, a, b, x[i + 10] || 0, 17, -42063)
      b = md5ff(b, c, d, a, x[i + 11] || 0, 22, -1990404162)
      a = md5ff(a, b, c, d, x[i + 12] || 0, 7, 1804603682)
      d = md5ff(d, a, b, c, x[i + 13] || 0, 12, -40341101)
      c = md5ff(c, d, a, b, x[i + 14] || 0, 17, -1502002290)
      b = md5ff(b, c, d, a, x[i + 15] || 0, 22, 1236535329)
      a = md5gg(a, b, c, d, x[i + 1] || 0, 5, -165796510)
      d = md5gg(d, a, b, c, x[i + 6] || 0, 9, -1069501632)
      c = md5gg(c, d, a, b, x[i + 11] || 0, 14, 643717713)
      b = md5gg(b, c, d, a, x[i] || 0, 20, -373897302)
      a = md5gg(a, b, c, d, x[i + 5] || 0, 5, -701558691)
      d = md5gg(d, a, b, c, x[i + 10] || 0, 9, 38016083)
      c = md5gg(c, d, a, b, x[i + 15] || 0, 14, -660478335)
      b = md5gg(b, c, d, a, x[i + 4] || 0, 20, -405537848)
      a = md5gg(a, b, c, d, x[i + 9] || 0, 5, 568446438)
      d = md5gg(d, a, b, c, x[i + 14] || 0, 9, -1019803690)
      c = md5gg(c, d, a, b, x[i + 3] || 0, 14, -187363961)
      b = md5gg(b, c, d, a, x[i + 8] || 0, 20, 1163531501)
      a = md5gg(a, b, c, d, x[i + 13] || 0, 5, -1444681467)
      d = md5gg(d, a, b, c, x[i + 2] || 0, 9, -51403784)
      c = md5gg(c, d, a, b, x[i + 7] || 0, 14, 1735328473)
      b = md5gg(b, c, d, a, x[i + 12] || 0, 20, -1926607734)
      a = md5hh(a, b, c, d, x[i + 5] || 0, 4, -378558)
      d = md5hh(d, a, b, c, x[i + 8] || 0, 11, -2022574463)
      c = md5hh(c, d, a, b, x[i + 11] || 0, 16, 1839030562)
      b = md5hh(b, c, d, a, x[i + 14] || 0, 23, -35309556)
      a = md5hh(a, b, c, d, x[i + 1] || 0, 4, -1530992060)
      d = md5hh(d, a, b, c, x[i + 4] || 0, 11, 1272893353)
      c = md5hh(c, d, a, b, x[i + 7] || 0, 16, -155497632)
      b = md5hh(b, c, d, a, x[i + 10] || 0, 23, -1094730640)
      a = md5hh(a, b, c, d, x[i + 13] || 0, 4, 681279174)
      d = md5hh(d, a, b, c, x[i] || 0, 11, -358537222)
      c = md5hh(c, d, a, b, x[i + 3] || 0, 16, -722521979)
      b = md5hh(b, c, d, a, x[i + 6] || 0, 23, 76029189)
      a = md5hh(a, b, c, d, x[i + 9] || 0, 4, -640364487)
      d = md5hh(d, a, b, c, x[i + 12] || 0, 11, -421815835)
      c = md5hh(c, d, a, b, x[i + 15] || 0, 16, 530742520)
      b = md5hh(b, c, d, a, x[i + 2] || 0, 23, -995338651)
      a = md5ii(a, b, c, d, x[i] || 0, 6, -198630844)
      d = md5ii(d, a, b, c, x[i + 7] || 0, 10, 1126891415)
      c = md5ii(c, d, a, b, x[i + 14] || 0, 15, -1416354905)
      b = md5ii(b, c, d, a, x[i + 5] || 0, 21, -57434055)
      a = md5ii(a, b, c, d, x[i + 12] || 0, 6, 1700485571)
      d = md5ii(d, a, b, c, x[i + 3] || 0, 10, -1894986606)
      c = md5ii(c, d, a, b, x[i + 10] || 0, 15, -1051523)
      b = md5ii(b, c, d, a, x[i + 1] || 0, 21, -2054922799)
      a = md5ii(a, b, c, d, x[i + 8] || 0, 6, 1873313359)
      d = md5ii(d, a, b, c, x[i + 15] || 0, 10, -30611744)
      c = md5ii(c, d, a, b, x[i + 6] || 0, 15, -1560198380)
      b = md5ii(b, c, d, a, x[i + 13] || 0, 21, 1309151649)
      a = md5ii(a, b, c, d, x[i + 4] || 0, 6, -145523070)
      d = md5ii(d, a, b, c, x[i + 11] || 0, 10, -1120210379)
      c = md5ii(c, d, a, b, x[i + 2] || 0, 15, 718787259)
      b = md5ii(b, c, d, a, x[i + 9] || 0, 21, -343485551)
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd)
    }
    return [a, b, c, d]
  }

  function str2binl(str: string) {
    const bin: number[] = []
    const mask = (1 << 8) - 1
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32)
    }
    return bin
  }

  function binl2hex(binarray: number[]) {
    const hexTab = '0123456789abcdef'
    let str = ''
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
             hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf)
    }
    return str
  }

  // Encode to UTF-8 first
  const utf8 = unescape(encodeURIComponent(input))
  return binl2hex(binlMD5(str2binl(utf8), utf8.length * 8))
}

interface HashResult {
  algorithm: string
  hash: string
  bits: number
}

const ALGORITHMS = [
  { name: 'MD5', webCrypto: null, bits: 128 },
  { name: 'SHA-1', webCrypto: 'SHA-1', bits: 160 },
  { name: 'SHA-256', webCrypto: 'SHA-256', bits: 256 },
  { name: 'SHA-384', webCrypto: 'SHA-384', bits: 384 },
  { name: 'SHA-512', webCrypto: 'SHA-512', bits: 512 },
]

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<HashResult[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [uppercase, setUppercase] = useState(false)

  const generateHashes = useCallback(async (text: string) => {
    if (!text) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const hashResults: HashResult[] = []

      for (const algo of ALGORITHMS) {
        let hash: string
        if (algo.webCrypto) {
          hash = await computeHash(algo.webCrypto, text)
        } else {
          hash = md5(text)
        }
        hashResults.push({
          algorithm: algo.name,
          hash,
          bits: algo.bits,
        })
      }

      setResults(hashResults)
    } catch (e) {
      console.error('Hash generation failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (val: string) => {
    setInput(val)
    generateHashes(val)
  }

  const copyHash = async (algo: string, hash: string) => {
    const text = uppercase ? hash.toUpperCase() : hash
    await navigator.clipboard.writeText(text)
    setCopied(algo)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = async () => {
    const text = results
      .map(r => `${r.algorithm}: ${uppercase ? r.hash.toUpperCase() : r.hash}`)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="tool-header">
        <h2>Hash Generator</h2>
        <p>Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text</p>
      </div>

      {/* Input */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="label mb-0">Input Text</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercase(e.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              <span className="text-xs text-[var(--color-text-muted)]">Uppercase</span>
            </label>
            <button onClick={() => { setInput(''); setResults([]) }} className="btn-secondary text-xs !py-1 !px-2">
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="Enter text to hash..."
          className="input-field textarea-code min-h-[120px]"
          spellCheck={false}
        />
        <div className="mt-2 text-xs text-[var(--color-text-muted)]">
          {input.length} characters · {new Blob([input]).size} bytes
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label">Hash Results</span>
            <button onClick={copyAll} className="btn-secondary text-xs">
              {copied === 'all' ? '✓ Copied All' : 'Copy All'}
            </button>
          </div>

          {results.map(r => (
            <div key={r.algorithm} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--color-accent)]">{r.algorithm}</span>
                  <span className="badge bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]">
                    {r.bits}-bit
                  </span>
                </div>
                <button
                  onClick={() => copyHash(r.algorithm, r.hash)}
                  className="btn-secondary text-xs !py-1 !px-2"
                >
                  {copied === r.algorithm ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="code-block text-sm break-all font-mono">
                {uppercase ? r.hash.toUpperCase() : r.hash}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="card flex items-center justify-center py-8">
          <span className="text-[var(--color-text-muted)]">Computing hashes...</span>
        </div>
      )}

      {!input && !loading && (
        <div className="card flex items-center justify-center py-12">
          <span className="text-[var(--color-text-muted)]">Enter text above to generate hashes</span>
        </div>
      )}
    </div>
  )
}
