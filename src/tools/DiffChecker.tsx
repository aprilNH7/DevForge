import { useState, useMemo } from 'react'

interface DiffLine {
  type: 'same' | 'added' | 'removed' | 'changed'
  left: string
  right: string
  lineLeft: number | null
  lineRight: number | null
}

function computeDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split('\n')
  const linesB = textB.split('\n')
  const result: DiffLine[] = []

  // Simple LCS-based diff
  const m = linesA.length
  const n = linesB.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  const diffs: Array<{ type: 'same' | 'removed' | 'added'; lineA?: string; lineB?: string; idxA?: number; idxB?: number }> = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      diffs.unshift({ type: 'same', lineA: linesA[i - 1], lineB: linesB[j - 1], idxA: i, idxB: j })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffs.unshift({ type: 'added', lineB: linesB[j - 1], idxB: j })
      j--
    } else {
      diffs.unshift({ type: 'removed', lineA: linesA[i - 1], idxA: i })
      i--
    }
  }

  for (const d of diffs) {
    if (d.type === 'same') {
      result.push({ type: 'same', left: d.lineA!, right: d.lineB!, lineLeft: d.idxA!, lineRight: d.idxB! })
    } else if (d.type === 'removed') {
      result.push({ type: 'removed', left: d.lineA!, right: '', lineLeft: d.idxA!, lineRight: null })
    } else {
      result.push({ type: 'added', left: '', right: d.lineB!, lineLeft: null, lineRight: d.idxB! })
    }
  }

  return result
}

const sampleA = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const x = 42;`

const sampleB = `function greet(name, greeting) {
  console.log(greeting + ", " + name + "!");
  return true;
}

const x = 100;
const y = 200;`

export default function DiffChecker() {
  const [textA, setTextA] = useState(sampleA)
  const [textB, setTextB] = useState(sampleB)

  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB])

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length
    const removed = diff.filter(d => d.type === 'removed').length
    const same = diff.filter(d => d.type === 'same').length
    return { added, removed, same, total: diff.length }
  }, [diff])

  const lineColors: Record<string, string> = {
    same: '',
    added: 'bg-green-500/10 border-l-2 border-green-500',
    removed: 'bg-red-500/10 border-l-2 border-red-500',
    changed: 'bg-yellow-500/10 border-l-2 border-yellow-500',
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Diff Checker</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Compare two texts and see the differences highlighted</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Original</span>
            <span className="text-xs text-[var(--color-text-muted)]">{textA.split('\n').length} lines</span>
          </div>
          <textarea
            value={textA}
            onChange={e => setTextA(e.target.value)}
            className="input-field w-full font-mono text-sm resize-none"
            style={{ height: '200px' }}
            placeholder="Paste original text..."
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Modified</span>
            <span className="text-xs text-[var(--color-text-muted)]">{textB.split('\n').length} lines</span>
          </div>
          <textarea
            value={textB}
            onChange={e => setTextB(e.target.value)}
            className="input-field w-full font-mono text-sm resize-none"
            style={{ height: '200px' }}
            placeholder="Paste modified text..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500"></span>
            <span className="text-[var(--color-text-muted)]">Added ({stats.added})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></span>
            <span className="text-[var(--color-text-muted)]">Removed ({stats.removed})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[var(--color-bg-card)] border border-[var(--color-border)]"></span>
            <span className="text-[var(--color-text-muted)]">Unchanged ({stats.same})</span>
          </span>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setTextA(''); setTextB('') }} className="btn-secondary text-xs px-3 py-1.5">Clear</button>
          <button onClick={() => { setTextA(textB); setTextB(textA) }} className="btn-secondary text-xs px-3 py-1.5">Swap</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm font-mono" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="w-12 px-3 py-2 text-xs text-[var(--color-text-muted)] text-right font-normal">L</th>
                <th className="px-4 py-2 text-xs text-[var(--color-text-muted)] text-left font-normal">Original</th>
                <th className="w-12 px-3 py-2 text-xs text-[var(--color-text-muted)] text-right font-normal">R</th>
                <th className="px-4 py-2 text-xs text-[var(--color-text-muted)] text-left font-normal">Modified</th>
              </tr>
            </thead>
            <tbody>
              {diff.map((line, idx) => (
                <tr key={idx} className={`${lineColors[line.type]} border-b border-[var(--color-border)] last:border-0`}>
                  <td className="w-12 px-3 py-1 text-xs text-[var(--color-text-muted)] text-right select-none">
                    {line.lineLeft ?? ''}
                  </td>
                  <td className={`px-4 py-1 whitespace-pre ${line.type === 'removed' ? 'text-red-400' : 'text-[var(--color-text-secondary)]'}`}>
                    {line.left || (line.type === 'added' ? '' : '\u00A0')}
                  </td>
                  <td className="w-12 px-3 py-1 text-xs text-[var(--color-text-muted)] text-right select-none">
                    {line.lineRight ?? ''}
                  </td>
                  <td className={`px-4 py-1 whitespace-pre ${line.type === 'added' ? 'text-green-400' : 'text-[var(--color-text-secondary)]'}`}>
                    {line.right || (line.type === 'removed' ? '' : '\u00A0')}
                  </td>
                </tr>
              ))}
              {diff.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                    Enter text in both fields to see differences
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
