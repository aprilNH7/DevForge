import { useState, useMemo } from 'react'

interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  bytes: number
  readingTime: string
  speakingTime: string
  avgWordLength: number
  avgSentenceLength: number
  longestWord: string
  shortestWord: string
  uniqueWords: number
  topWords: [string, number][]
  charFrequency: [string, number][]
}

function analyze(text: string): TextStats {
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const wordsArr = text.trim() ? text.trim().split(/\s+/) : []
  const words = wordsArr.length
  const sentences = text.trim() ? (text.match(/[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0) : 0
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
  const lines = text ? text.split('\n').length : 0
  const bytes = new Blob([text]).size

  const readMins = words / 238
  const speakMins = words / 150
  const readingTime = readMins < 1 ? `${Math.ceil(readMins * 60)}s` : `${Math.ceil(readMins)} min`
  const speakingTime = speakMins < 1 ? `${Math.ceil(speakMins * 60)}s` : `${Math.ceil(speakMins)} min`

  const wordLengths = wordsArr.map(w => w.replace(/[^a-zA-Z]/g, '').length)
  const avgWordLength = words > 0 ? wordLengths.reduce((a, b) => a + b, 0) / words : 0
  const avgSentenceLength = sentences > 0 ? words / sentences : 0

  const cleanWords = wordsArr.map(w => w.replace(/[^a-zA-Z']/g, '').toLowerCase()).filter(Boolean)
  const longestWord = cleanWords.length > 0 ? cleanWords.reduce((a, b) => a.length >= b.length ? a : b) : ''
  const shortestWord = cleanWords.length > 0 ? cleanWords.reduce((a, b) => a.length <= b.length ? a : b) : ''
  const uniqueWords = new Set(cleanWords).size

  // Top words
  const wordCounts: Record<string, number> = {}
  cleanWords.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1 })
  const topWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15) as [string, number][]

  // Character frequency (letters only)
  const charCounts: Record<string, number> = {}
  for (const ch of text.toLowerCase()) {
    if (/[a-z]/.test(ch)) {
      charCounts[ch] = (charCounts[ch] || 0) + 1
    }
  }
  const charFrequency = Object.entries(charCounts)
    .sort(([, a], [, b]) => b - a) as [string, number][]

  return {
    characters, charactersNoSpaces, words, sentences, paragraphs, lines, bytes,
    readingTime, speakingTime, avgWordLength, avgSentenceLength,
    longestWord, shortestWord, uniqueWords, topWords, charFrequency
  }
}

const SAMPLE = `The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.

DevForge is a developer toolkit with 23 essential tools. It runs entirely in your browser with zero external dependencies. No sign-ups required. No tracking. No API keys needed.

Built with React 19, TypeScript, Tailwind CSS 4, and Vite 6. Features include dark and light mode, mobile responsive design, and instant results with real-time processing.`

export default function TextAnalyzer() {
  const [text, setText] = useState('')
  const [tab, setTab] = useState<'stats' | 'words' | 'chars'>('stats')

  const stats = useMemo(() => analyze(text || SAMPLE), [text])

  const maxWordCount = stats.topWords.length > 0 ? stats.topWords[0][1] : 1
  const maxCharCount = stats.charFrequency.length > 0 ? stats.charFrequency[0][1] : 1

  return (
    <div>
      <div className="tool-header">
        <h2>Text Analyzer</h2>
        <p>Word count, reading time, character frequency, and text statistics</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">Input Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste text to analyze..."
            className="input-field textarea-code"
            rows={6}
          />
        </div>
        <button onClick={() => setText(SAMPLE)} className="btn-secondary text-xs">Load Sample</button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-4">
        {[
          { label: 'Characters', value: stats.characters, color: 'var(--color-accent)' },
          { label: 'No Spaces', value: stats.charactersNoSpaces, color: 'var(--color-accent)' },
          { label: 'Words', value: stats.words, color: 'var(--color-success)' },
          { label: 'Sentences', value: stats.sentences, color: 'var(--color-warning)' },
          { label: 'Paragraphs', value: stats.paragraphs, color: '#c084fc' },
          { label: 'Lines', value: stats.lines, color: '#f472b6' },
          { label: 'Bytes', value: stats.bytes, color: 'var(--color-text-secondary)' },
          { label: 'Unique Words', value: stats.uniqueWords, color: 'var(--color-accent)' },
          { label: 'Read Time', value: stats.readingTime, color: 'var(--color-success)' },
          { label: 'Speak Time', value: stats.speakingTime, color: 'var(--color-warning)' },
          { label: 'Avg Word', value: stats.avgWordLength.toFixed(1), color: '#c084fc' },
          { label: 'Avg Sentence', value: stats.avgSentenceLength.toFixed(1), color: '#f472b6' },
        ].map((s, i) => (
          <div key={i} className="card text-center py-3 px-2">
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[0.6rem] uppercase tracking-wider text-[var(--color-text-muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card mt-4 space-y-4">
        <div className="flex gap-1">
          {(['stats', 'words', 'chars'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-secondary'}>
              {t === 'stats' ? 'Details' : t === 'words' ? 'Top Words' : 'Char Frequency'}
            </button>
          ))}
        </div>

        {tab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
              <div className="text-[0.65rem] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Longest Word</div>
              <div className="text-sm font-mono text-[var(--color-accent)]">{stats.longestWord || '—'}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
              <div className="text-[0.65rem] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Shortest Word</div>
              <div className="text-sm font-mono text-[var(--color-accent)]">{stats.shortestWord || '—'}</div>
            </div>
          </div>
        )}

        {tab === 'words' && stats.topWords.length > 0 && (
          <div className="space-y-1">
            {stats.topWords.map(([word, count], i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <span className="w-6 text-right text-xs text-[var(--color-text-muted)]">{i + 1}</span>
                <span className="w-24 text-sm font-mono text-[var(--color-text-primary)] truncate">{word}</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-input)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${(count / maxWordCount) * 100}%`,
                    background: 'var(--color-accent)'
                  }} />
                </div>
                <span className="w-8 text-right text-xs font-mono text-[var(--color-accent)]">{count}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'chars' && stats.charFrequency.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            {stats.charFrequency.map(([ch, count], i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded" style={{ background: 'var(--color-bg-input)' }}>
                <span className="w-6 text-center text-sm font-mono font-bold text-[var(--color-accent)]">{ch}</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-hover)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(count / maxCharCount) * 100}%`,
                    background: `hsl(${180 + i * 5}, 60%, 50%)`
                  }} />
                </div>
                <span className="text-[0.65rem] font-mono text-[var(--color-text-muted)] w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
