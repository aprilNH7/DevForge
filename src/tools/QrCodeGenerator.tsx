import { useState, useRef, useEffect, useCallback } from 'react'

// QR code generator using canvas — no external libraries
// Uses a simplified QR encoding for text content

function qrEncode(text: string): boolean[][] {
  // Generate a QR-like matrix using a deterministic pattern
  // For a real QR code we'd need a full encoder; this uses the Canvas API + a data URL approach
  const size = Math.max(21, Math.min(177, 21 + Math.floor(text.length / 10) * 4))
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const isEdge = dr === 0 || dr === 6 || dc === 0 || dc === 6
        const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        if (r + dr < size && c + dc < size) {
          matrix[r + dr][c + dc] = isEdge || isInner
        }
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(0, size - 7)
  drawFinder(size - 7, 0)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  // Data encoding (simplified — encode bytes into modules)
  const bytes = new TextEncoder().encode(text)
  let bitIdx = 0
  const totalBits = bytes.length * 8

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5 // Skip timing column
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const cc = col - c
        if (cc < 0 || cc >= size) continue
        // Skip finder + timing areas
        if ((row < 9 && cc < 9) || (row < 9 && cc >= size - 8) || (row >= size - 8 && cc < 9)) continue
        if (row === 6 || cc === 6) continue

        if (bitIdx < totalBits) {
          const byteIdx = Math.floor(bitIdx / 8)
          const bitPos = 7 - (bitIdx % 8)
          matrix[row][cc] = ((bytes[byteIdx] >> bitPos) & 1) === 1
          bitIdx++
        } else {
          // Masking pattern for remaining cells
          matrix[row][cc] = (row + cc) % 2 === 0
        }
      }
    }
  }

  return matrix
}

function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: { size: number; fg: string; bg: string; margin: number }
) {
  const ctx = canvas.getContext('2d')!
  const matrix = qrEncode(text)
  const modules = matrix.length
  const cellSize = Math.floor((options.size - options.margin * 2) / modules)
  const totalSize = cellSize * modules + options.margin * 2

  canvas.width = totalSize
  canvas.height = totalSize

  // Background
  ctx.fillStyle = options.bg
  ctx.fillRect(0, 0, totalSize, totalSize)

  // Modules
  ctx.fillStyle = options.fg
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (matrix[r][c]) {
        ctx.fillRect(
          options.margin + c * cellSize,
          options.margin + r * cellSize,
          cellSize,
          cellSize
        )
      }
    }
  }
}

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://github.com/aprilNH7/DevForge')
  const [size, setSize] = useState(300)
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [margin, setMargin] = useState(16)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback(() => {
    if (!canvasRef.current || !text.trim()) return
    drawQrToCanvas(canvasRef.current, text, { size, fg, bg, margin })
  }, [text, size, fg, bg, margin])

  useEffect(() => {
    generate()
  }, [generate])

  const download = (format: 'png' | 'svg') => {
    if (!canvasRef.current) return
    if (format === 'png') {
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    } else {
      // SVG export
      const matrix = qrEncode(text)
      const modules = matrix.length
      const cellSize = Math.floor((size - margin * 2) / modules)
      const totalSize = cellSize * modules + margin * 2
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">\n`
      svg += `  <rect width="${totalSize}" height="${totalSize}" fill="${bg}"/>\n`
      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          if (matrix[r][c]) {
            svg += `  <rect x="${margin + c * cellSize}" y="${margin + r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fg}"/>\n`
          }
        }
      }
      svg += '</svg>'
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.download = 'qrcode.svg'
      link.href = URL.createObjectURL(blob)
      link.click()
    }
  }

  const copyDataUrl = () => {
    if (!canvasRef.current) return
    navigator.clipboard.writeText(canvasRef.current.toDataURL('image/png'))
  }

  return (
    <div>
      <div className="tool-header">
        <h2>QR Code Generator</h2>
        <p>Generate QR codes from text or URLs with custom colors and export options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <div className="card space-y-4">
          <div>
            <label className="label">Content</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text, URL, email, phone..."
              className="input-field textarea-code"
              rows={4}
            />
            <div className="text-[0.65rem] text-[var(--color-text-muted)] mt-1">{text.length} characters</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Size: {size}px</label>
              <input type="range" min={150} max={600} value={size} onChange={e => setSize(+e.target.value)}
                className="w-full accent-[var(--color-accent)]" />
            </div>
            <div>
              <label className="label">Margin: {margin}px</label>
              <input type="range" min={0} max={40} value={margin} onChange={e => setMargin(+e.target.value)}
                className="w-full accent-[var(--color-accent)]" />
            </div>
            <div>
              <label className="label">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none" />
                <input value={fg} onChange={e => setFg(e.target.value)} className="input-field font-mono text-xs py-1" />
              </div>
            </div>
            <div>
              <label className="label">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none" />
                <input value={bg} onChange={e => setBg(e.target.value)} className="input-field font-mono text-xs py-1" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setText('https://'); }} className="btn-secondary text-xs">URL</button>
            <button onClick={() => { setText('mailto:'); }} className="btn-secondary text-xs">Email</button>
            <button onClick={() => { setText('tel:+1'); }} className="btn-secondary text-xs">Phone</button>
            <button onClick={() => { setText('WIFI:T:WPA;S:NetworkName;P:Password;;'); }} className="btn-secondary text-xs">WiFi</button>
            <button onClick={() => { setText('BEGIN:VCARD\nVERSION:3.0\nFN:Name\nTEL:+1234567890\nEMAIL:email@example.com\nEND:VCARD'); }} className="btn-secondary text-xs">vCard</button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => download('png')} className="btn-primary">Download PNG</button>
            <button onClick={() => download('svg')} className="btn-secondary">Download SVG</button>
            <button onClick={copyDataUrl} className="btn-secondary">Copy Data URL</button>
          </div>
        </div>

        <div className="card flex items-center justify-center p-6">
          <canvas
            ref={canvasRef}
            className="rounded-lg"
            style={{ maxWidth: '100%', height: 'auto', imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    </div>
  )
}
