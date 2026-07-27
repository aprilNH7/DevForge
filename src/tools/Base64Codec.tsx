import { useState, useRef } from 'react'

export default function Base64Codec() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [fileInfo, setFileInfo] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const encode = (text: string) => {
    try {
      // Handle unicode properly
      const encoded = btoa(
        encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      )
      setOutput(encoded)
      setError('')
    } catch (e) {
      setError(`Encoding failed: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const decode = (text: string) => {
    try {
      const decoded = decodeURIComponent(
        Array.from(atob(text), c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      )
      setOutput(decoded)
      setError('')
    } catch (e) {
      setError(`Decoding failed: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const handleProcess = () => {
    if (!input.trim()) {
      setError('Please enter some text')
      setOutput('')
      return
    }
    if (mode === 'encode') {
      encode(input)
    } else {
      decode(input)
    }
  }

  const handleInputChange = (val: string) => {
    setInput(val)
    setFileInfo(null)
    if (val.trim()) {
      if (mode === 'encode') encode(val)
      else decode(val)
    } else {
      setOutput('')
      setError('')
    }
  }

  const handleModeSwitch = (newMode: 'encode' | 'decode') => {
    setMode(newMode)
    setError('')
    if (output && input) {
      // Swap input and output
      const newInput = output
      setInput(newInput)
      if (newMode === 'encode') {
        encode(newInput)
      } else {
        decode(newInput)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // result is data URL like "data:type;base64,XXXX"
      const base64 = result.split(',')[1] || ''
      setInput(base64)
      setOutput(base64)
      setMode('encode')
      setFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
      setError('')
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const swap = () => {
    const newInput = output
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    setInput(newInput)
    setFileInfo(null)
    if (newInput.trim()) {
      if (newMode === 'encode') encode(newInput)
      else decode(newInput)
    }
  }

  return (
    <div>
      <div className="tool-header">
        <h2>Base64 Codec</h2>
        <p>Encode and decode Base64 strings with Unicode support</p>
      </div>

      {/* Mode Toggle */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
            <button
              onClick={() => handleModeSwitch('encode')}
              className={`px-4 py-2 text-sm font-medium border-none cursor-pointer transition-colors ${
                mode === 'encode'
                  ? 'bg-[var(--color-accent)] text-[#0a0a0a]'
                  : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => handleModeSwitch('decode')}
              className={`px-4 py-2 text-sm font-medium border-none cursor-pointer transition-colors ${
                mode === 'decode'
                  ? 'bg-[var(--color-accent)] text-[#0a0a0a]'
                  : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Decode
            </button>
          </div>

          <button onClick={swap} className="btn-secondary text-xs" title="Swap input/output">
            ⇄ Swap
          </button>

          <div className="ml-auto flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-secondary text-xs"
            >
              Upload File
            </button>
            {fileInfo && (
              <span className="text-xs text-[var(--color-text-muted)]">{fileInfo}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="label mb-0">
              {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
            </span>
            <button
              onClick={() => { setInput(''); setOutput(''); setError(''); setFileInfo(null) }}
              className="btn-secondary text-xs !py-1 !px-2"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
            className="input-field textarea-code min-h-[250px]"
            spellCheck={false}
          />
          <div className="mt-2 text-xs text-[var(--color-text-muted)]">
            {input.length} characters · {new Blob([input]).size} bytes
          </div>
        </div>

        {/* Output */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="label mb-0">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </span>
            {output && (
              <button onClick={copyOutput} className="btn-secondary text-xs !py-1 !px-2">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
          {error ? (
            <div className="code-block border-[var(--color-error)]/30 bg-[var(--color-error)]/5 min-h-[250px]">
              <span className="text-[var(--color-error)]">{error}</span>
            </div>
          ) : (
            <div className="code-block min-h-[250px] break-all">
              {output || <span className="text-[var(--color-text-muted)]">Output will appear here...</span>}
            </div>
          )}
          {output && (
            <div className="mt-2 text-xs text-[var(--color-text-muted)]">
              {output.length} characters · {new Blob([output]).size} bytes
            </div>
          )}
        </div>
      </div>

      {/* Quick action */}
      <div className="card mt-4">
        <button onClick={handleProcess} className="btn-primary">
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
      </div>
    </div>
  )
}
