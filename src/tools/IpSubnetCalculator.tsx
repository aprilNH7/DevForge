import { useState, useMemo } from 'react'

function parseIp(ip: string): number | null {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
}

function toIp(num: number): string {
  return [(num >> 24) & 255, (num >> 16) & 255, (num >> 8) & 255, num & 255].join('.')
}

function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : -1 << (32 - cidr)
}

export default function IpSubnetCalculator() {
  const [ip, setIp] = useState('192.168.1.1')
  const [cidr, setCidr] = useState(24)

  const result = useMemo(() => {
    const ipNum = parseIp(ip)
    if (ipNum === null) return null
    const mask = cidrToMask(cidr)
    const network = ipNum & mask
    const broadcast = network | (~mask >>> 0)
    const firstHost = network + 1
    const lastHost = broadcast - 1
    const total = Math.pow(2, 32 - cidr)
    return {
      network: toIp(network),
      broadcast: toIp(broadcast),
      mask: toIp(mask),
      firstHost: cidr < 31 ? toIp(firstHost) : 'N/A',
      lastHost: cidr < 31 ? toIp(lastHost) : 'N/A',
      totalHosts: cidr === 32 ? 1 : cidr === 31 ? 2 : total - 2,
    }
  }, [ip, cidr])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">IP Subnet Calculator</h2>
      <div className="flex gap-3">
        <input
          type="text"
          value={ip}
          onChange={e => setIp(e.target.value)}
          placeholder="192.168.1.1"
          className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none"
        />
        <div className="flex items-center gap-2 px-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-sm text-[var(--color-text-muted)]">/</span>
          <input
            type="number"
            min={0}
            max={32}
            value={cidr}
            onChange={e => setCidr(Number(e.target.value))}
            className="w-12 bg-transparent outline-none text-center"
          />
        </div>
      </div>
      {result ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{key.replace(/([A-Z])/g, ' $1')}</span>
              <div className="mt-1 font-mono text-sm">{String(value)}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-red-500">Invalid IP address</p>
      )}
    </div>
  )
}
