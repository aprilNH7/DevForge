import { useState, useMemo } from 'react'

interface MatchResult {
  fullMatch: string
  index: number
  groups: string[]
  namedGroups: Record<string, string>
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [replacement, setReplacement] = useState('')
  const [showReplace, setShowReplace] = useState(false)

  const { regex, error, matches, highlightedText, replaceResult } = useMemo(() => {
    if (!pattern) {
      return { regex: null, error: '', matches: [] as MatchResult[], highlightedText: '', replaceResult: '' }
    }

    try {
      const re = new RegExp(pattern, flags)
      const matchResults: MatchResult[] = []

      if (testString) {
        if (flags.includes('g')) {
          let m: RegExpExecArray | null
          const reCopy = new RegExp(pattern, flags)
          while ((m = reCopy.exec(testString)) !== null) {
            matchResults.push({
              fullMatch: m[0],
              index: m.index,
              groups: m.slice(1),
              namedGroups: m.groups ? { ...m.groups } : {},
            })
            if (m[0].length === 0) reCopy.lastIndex++
          }
        } else {
          const m = re.exec(testString)
          if (m) {
            matchResults.push({
              fullMatch: m[0],
              index: m.index,
              groups: m.slice(1),
              namedGroups: m.groups ? { ...m.groups } : {},
            })
          }
        }
      }

      // Build highlighted text
      let highlighted = ''
      if (testString && matchResults.length > 0) {
        let lastIndex = 0
        const colors = ['bg-[#06b6d4]/25 border-b-2 border-[#06b6d4]', 'bg-[#a78bfa]/25 border-b-2 border-[#a78bfa]', 'bg-[#22c55e]/25 border-b-2 border-[#22c55e]', 'bg-[#f59e0b]/25 border-b-2 border-[#f59e0b]']
        matchResults.forEach((match, i) => {
          const before = testString.slice(lastIndex, match.index)
          highlighted += escapeHtml(before)
          highlighted += `<mark class="${colors[i % colors.length]} text-white rounded-sm px-0.5">${escapeHtml(match.fullMatch)}</mark>`
          lastIndex = match.index + match.fullMatch.length
        })
        highlighted += escapeHtml(testString.slice(lastIndex))
      } else {
        highlighted = escapeHtml(testString)
      }

      // Replace result
      let replResult = ''
      if (showReplace && testString && replacement !== undefined) {
        try {
          replResult = testString.replace(re, replacement)
        } catch {
          replResult = ''
        }
      }

      return { regex: re, error: '', matches: matchResults, highlightedText: highlighted, replaceResult: replResult }
    } catch (e) {
      return { regex: null, error: (e as Error).message, matches: [] as MatchResult[], highlightedText: escapeHtml(testString), replaceResult: '' }
    }
  }, [pattern, flags, testString, replacement, showReplace])

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''))
    } else {
      setFlags(flags + flag)
    }
  }

  const loadExample = () => {
    setPattern('(\\w+)@(\\w+\\.\\w+)')
    setFlags('g')
    setTestString('Contact us at hello@example.com or support@devforge.io for help.')
  }

  return (
    <div>
      <div className="tool-header">
        <h2>Regex Tester</h2>
        <p>Test regular expressions with real-time matching and capture groups</p>
      </div>

      {/* Pattern */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="label mb-0">Pattern</span>
          <div className="flex gap-2">
            <button onClick={loadExample} className="btn-secondary text-xs !py-1 !px-2">
              Example
            </button>
            <button onClick={() => { setPattern(''); setTestString(''); setFlags('g') }} className="btn-secondary text-xs !py-1 !px-2">
              Clear
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[var(--color-text-muted)] text-lg font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="input-field flex-1 font-mono"
            spellCheck={false}
          />
          <span className="text-[var(--color-text-muted)] text-lg font-mono">/</span>
          <input
            type="text"
            value={flags}
            onChange={e => setFlags(e.target.value)}
            className="input-field !w-16 font-mono text-center"
            placeholder="flags"
          />
        </div>

        {/* Flag toggles */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            { flag: 'g', label: 'Global' },
            { flag: 'i', label: 'Case Insensitive' },
            { flag: 'm', label: 'Multiline' },
            { flag: 's', label: 'Dotall' },
            { flag: 'u', label: 'Unicode' },
          ].map(({ flag, label }) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={`text-xs px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                flags.includes(flag)
                  ? 'bg-[var(--color-accent-glow)] border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {flag} — {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test String */}
        <div className="card">
          <span className="label">Test String</span>
          <textarea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="input-field textarea-code min-h-[200px]"
            spellCheck={false}
          />

          {/* Highlighted preview */}
          {testString && pattern && !error && (
            <>
              <span className="label mt-4">Highlighted Matches</span>
              <div
                className="code-block min-h-[60px] whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
            </>
          )}

          {/* Replace */}
          <div className="mt-4">
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="btn-secondary text-xs"
            >
              {showReplace ? 'Hide' : 'Show'} Replace
            </button>
            {showReplace && (
              <div className="mt-3">
                <span className="label">Replacement</span>
                <input
                  type="text"
                  value={replacement}
                  onChange={e => setReplacement(e.target.value)}
                  placeholder="Replacement string ($1, $2, etc.)"
                  className="input-field font-mono mb-2"
                />
                {replaceResult && (
                  <>
                    <span className="label mt-2">Result</span>
                    <div className="code-block whitespace-pre-wrap">{replaceResult}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Matches */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="label mb-0">
              Matches
              {matches.length > 0 && (
                <span className="ml-2 badge bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
                  {matches.length}
                </span>
              )}
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)] text-sm">
              {!pattern ? 'Enter a pattern to start matching' : !testString ? 'Enter test text' : 'No matches found'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
              {matches.map((match, i) => (
                <div key={i} className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Match {i + 1} at index {match.index}
                    </span>
                  </div>
                  <div className="font-mono text-sm text-[var(--color-accent)] break-all">
                    {match.fullMatch || <span className="text-[var(--color-text-muted)] italic">empty string</span>}
                  </div>

                  {match.groups.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                      <span className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider">Capture Groups</span>
                      <div className="mt-1 space-y-1">
                        {match.groups.map((g, gi) => (
                          <div key={gi} className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--color-text-muted)] font-mono">${gi + 1}:</span>
                            <span className="text-[#22c55e] font-mono break-all">{g ?? 'undefined'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(match.namedGroups).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                      <span className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider">Named Groups</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(match.namedGroups).map(([name, val]) => (
                          <div key={name} className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--color-text-muted)] font-mono">{name}:</span>
                            <span className="text-[#22c55e] font-mono break-all">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Regex info */}
          {regex && (
            <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
              <span className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-wider">Pattern Info</span>
              <div className="mt-1 text-xs text-[var(--color-text-secondary)] font-mono">
                /{pattern}/{flags}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
