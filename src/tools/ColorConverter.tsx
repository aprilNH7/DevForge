import { useState, useCallback } from 'react'

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '')
  let r: number, g: number, b: number
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16)
    g = parseInt(clean.slice(2, 4), 16)
    b = parseInt(clean.slice(4, 6), 16)
  } else {
    return null
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360, s = hsl.s / 100, l = hsl.l / 100

  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

function getContrastColor(rgb: RGB): string {
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const luminance = (rgb: RGB) => {
    const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  const l1 = luminance(rgb1)
  const l2 = luminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export default function ColorConverter() {
  const [hex, setHex] = useState('#06b6d4')
  const [rgb, setRgb] = useState<RGB>({ r: 6, g: 182, b: 212 })
  const [hsl, setHsl] = useState<HSL>({ h: 189, s: 94, l: 43 })
  const [copied, setCopied] = useState<string | null>(null)

  const updateFromRgb = useCallback((newRgb: RGB) => {
    setRgb(newRgb)
    setHex(rgbToHex(newRgb))
    setHsl(rgbToHsl(newRgb))
  }, [])

  const handleHexChange = (val: string) => {
    setHex(val)
    const parsed = hexToRgb(val)
    if (parsed) {
      setRgb(parsed)
      setHsl(rgbToHsl(parsed))
    }
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: string) => {
    const num = parseInt(val) || 0
    const clamped = Math.max(0, Math.min(255, num))
    const newRgb = { ...rgb, [channel]: clamped }
    updateFromRgb(newRgb)
  }

  const handleHslChange = (channel: 'h' | 's' | 'l', val: string) => {
    const num = parseInt(val) || 0
    const max = channel === 'h' ? 360 : 100
    const clamped = Math.max(0, Math.min(max, num))
    const newHsl = { ...hsl, [channel]: clamped }
    setHsl(newHsl)
    const newRgb = hslToRgb(newHsl)
    setRgb(newRgb)
    setHex(rgbToHex(newRgb))
  }

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHex(val)
    const parsed = hexToRgb(val)
    if (parsed) {
      setRgb(parsed)
      setHsl(rgbToHsl(parsed))
    }
  }

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const contrastWhite = getContrastRatio(rgb, { r: 255, g: 255, b: 255 })
  const contrastBlack = getContrastRatio(rgb, { r: 0, g: 0, b: 0 })
  const textColor = getContrastColor(rgb)

  const cssRgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const cssHsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

  // Generate palette shades
  const shades = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(l => {
    const shadeRgb = hslToRgb({ ...hsl, l })
    return { l, hex: rgbToHex(shadeRgb), rgb: shadeRgb }
  })

  // Complementary color
  const complementary = hslToRgb({ ...hsl, h: (hsl.h + 180) % 360 })
  const analogous1 = hslToRgb({ ...hsl, h: (hsl.h + 30) % 360 })
  const analogous2 = hslToRgb({ ...hsl, h: (hsl.h + 330) % 360 })
  const triadic1 = hslToRgb({ ...hsl, h: (hsl.h + 120) % 360 })
  const triadic2 = hslToRgb({ ...hsl, h: (hsl.h + 240) % 360 })

  return (
    <div>
      <div className="tool-header">
        <h2>Color Converter</h2>
        <p>Convert between HEX, RGB, and HSL with live preview and palette generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Color Preview */}
        <div className="card lg:col-span-1">
          <span className="label">Preview</span>
          <div className="relative">
            <div
              className="w-full aspect-square rounded-xl border border-[var(--color-border)] flex items-center justify-center text-lg font-bold transition-colors"
              style={{ backgroundColor: hex, color: textColor }}
            >
              {hex.toUpperCase()}
            </div>
            <input
              type="color"
              value={hex.length === 7 ? hex : '#000000'}
              onChange={handleColorPicker}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer"
              title="Pick a color"
            />
          </div>

          {/* Contrast info */}
          <div className="mt-4 space-y-2">
            <span className="label">Contrast Ratios</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white border border-[var(--color-border)]" />
              <div className="flex-1">
                <div className="text-xs text-[var(--color-text-secondary)]">
                  vs White: <span className="font-mono font-semibold">{contrastWhite.toFixed(2)}:1</span>
                </div>
                <div className="text-[0.65rem]">
                  {contrastWhite >= 7 ? (
                    <span className="text-[var(--color-success)]">AAA Pass</span>
                  ) : contrastWhite >= 4.5 ? (
                    <span className="text-[var(--color-warning)]">AA Pass</span>
                  ) : (
                    <span className="text-[var(--color-error)]">Fail</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-black border border-[var(--color-border)]" />
              <div className="flex-1">
                <div className="text-xs text-[var(--color-text-secondary)]">
                  vs Black: <span className="font-mono font-semibold">{contrastBlack.toFixed(2)}:1</span>
                </div>
                <div className="text-[0.65rem]">
                  {contrastBlack >= 7 ? (
                    <span className="text-[var(--color-success)]">AAA Pass</span>
                  ) : contrastBlack >= 4.5 ? (
                    <span className="text-[var(--color-warning)]">AA Pass</span>
                  ) : (
                    <span className="text-[var(--color-error)]">Fail</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Values */}
        <div className="card lg:col-span-2">
          <span className="label">Color Values</span>

          {/* HEX */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">HEX</span>
              <button onClick={() => copyValue('hex', hex)} className="btn-secondary text-xs !py-0.5 !px-2">
                {copied === 'hex' ? '✓' : 'Copy'}
              </button>
            </div>
            <input
              type="text"
              value={hex}
              onChange={e => handleHexChange(e.target.value)}
              className="input-field font-mono"
              placeholder="#000000"
            />
          </div>

          {/* RGB */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">RGB</span>
              <button onClick={() => copyValue('rgb', cssRgb)} className="btn-secondary text-xs !py-0.5 !px-2">
                {copied === 'rgb' ? '✓' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['r', 'g', 'b'] as const).map(ch => (
                <div key={ch}>
                  <label className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">{ch}</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[ch]}
                    onChange={e => handleRgbChange(ch, e.target.value)}
                    className="input-field font-mono text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 text-xs text-[var(--color-text-muted)] font-mono">{cssRgb}</div>
          </div>

          {/* HSL */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">HSL</span>
              <button onClick={() => copyValue('hsl', cssHsl)} className="btn-secondary text-xs !py-0.5 !px-2">
                {copied === 'hsl' ? '✓' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { ch: 'h' as const, max: 360, unit: '°' },
                { ch: 's' as const, max: 100, unit: '%' },
                { ch: 'l' as const, max: 100, unit: '%' },
              ]).map(({ ch, max, unit }) => (
                <div key={ch}>
                  <label className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">{ch} ({unit})</label>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={hsl[ch]}
                    onChange={e => handleHslChange(ch, e.target.value)}
                    className="input-field font-mono text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 text-xs text-[var(--color-text-muted)] font-mono">{cssHsl}</div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <label className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Hue</label>
              <input
                type="range"
                min={0}
                max={360}
                value={hsl.h}
                onChange={e => handleHslChange('h', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
              />
            </div>
            <div>
              <label className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Saturation</label>
              <input
                type="range"
                min={0}
                max={100}
                value={hsl.s}
                onChange={e => handleHslChange('s', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="text-[0.65rem] text-[var(--color-text-muted)] uppercase">Lightness</label>
              <input
                type="range"
                min={0}
                max={100}
                value={hsl.l}
                onChange={e => handleHslChange('l', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shades & Harmony */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Shades */}
        <div className="card">
          <span className="label">Shades</span>
          <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
            {shades.map(shade => (
              <button
                key={shade.l}
                onClick={() => copyValue(`shade-${shade.l}`, shade.hex)}
                className="flex-1 h-12 cursor-pointer border-none transition-transform hover:scale-110 hover:z-10 relative"
                style={{ backgroundColor: shade.hex }}
                title={`${shade.hex} (L: ${shade.l}%)`}
              />
            ))}
          </div>
        </div>

        {/* Color Harmony */}
        <div className="card">
          <span className="label">Color Harmony</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Complementary', color: complementary },
              { label: 'Analogous 1', color: analogous1 },
              { label: 'Analogous 2', color: analogous2 },
              { label: 'Triadic 1', color: triadic1 },
              { label: 'Triadic 2', color: triadic2 },
              { label: 'Original', color: rgb },
            ].map(({ label, color }) => {
              const h = rgbToHex(color)
              return (
                <button
                  key={label}
                  onClick={() => copyValue(label, h)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border border-[var(--color-border)] cursor-pointer bg-transparent hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <div
                    className="w-full h-8 rounded"
                    style={{ backgroundColor: h }}
                  />
                  <span className="text-[0.6rem] text-[var(--color-text-muted)]">{label}</span>
                  <span className="text-[0.65rem] font-mono text-[var(--color-text-secondary)]">{h}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
