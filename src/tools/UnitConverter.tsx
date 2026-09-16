import { useState, useMemo } from 'react'

const CATEGORIES: Record<string, Record<string, number>> = {
  Length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Inch: 0.0254, Foot: 0.3048, Yard: 0.9144, Mile: 1609.34 },
  Mass: { Kilogram: 1, Gram: 0.001, Milligram: 1e-6, Pound: 0.453592, Ounce: 0.0283495, Ton: 907.185 },
  Temperature: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 },
  Data: { Byte: 1, Kilobyte: 1024, Megabyte: 1024 ** 2, Gigabyte: 1024 ** 3, Terabyte: 1024 ** 4 },
}

function convert(category: string, from: string, to: string, value: number): number {
  if (category === 'Temperature') {
    if (from === to) return value
    let c = value
    if (from === 'Fahrenheit') c = (value - 32) * 5 / 9
    if (from === 'Kelvin') c = value - 273.15
    if (to === 'Fahrenheit') return c * 9 / 5 + 32
    if (to === 'Kelvin') return c + 273.15
    return c
  }
  const base = value * CATEGORIES[category][from]
  return base / CATEGORIES[category][to]
}

export default function UnitConverter() {
  const [category, setCategory] = useState('Length')
  const [from, setFrom] = useState('Meter')
  const [to, setTo] = useState('Foot')
  const [value, setValue] = useState(1)

  const units = useMemo(() => Object.keys(CATEGORIES[category]), [category])
  const result = useMemo(() => convert(category, from, to, value), [category, from, to, value])

  return (
    <div className="space-y-4">
      <div className="tool-header">
        <h2>Unit Converter</h2>
        <p>Convert length, mass, temperature, and digital storage units.</p>
      </div>

      <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <select value={category} onChange={e => { setCategory(e.target.value); setFrom(Object.keys(CATEGORIES[e.target.value])[0]); setTo(Object.keys(CATEGORIES[e.target.value])[1]) }} className="input-field">
            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Value</label>
          <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="input-field" />
        </div>
        <div>
          <label className="label">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="input-field">
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label">To</label>
          <select value={to} onChange={e => setTo(e.target.value)} className="input-field">
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <span className="label">Result</span>
        <div className="text-2xl font-mono mt-2">{result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}</div>
      </div>
    </div>
  )
}
