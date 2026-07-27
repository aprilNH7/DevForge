import { useState, useCallback } from 'react'

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'semper', 'ligula',
  'nec', 'volutpat', 'maecenas', 'fermentum', 'consequuntur', 'magni', 'dolores',
  'eos', 'ratione', 'sequi', 'nesciunt', 'neque', 'porro', 'quisquam',
  'dolorem', 'adipisci', 'numquam', 'eius', 'modi', 'tempora', 'quaerat',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur',
  'aut', 'odit', 'fugit', 'harum', 'quidem', 'rerum', 'facilis', 'expedita',
  'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis', 'eligendi',
  'optio', 'cumque', 'nihil', 'impedit', 'quo', 'minus', 'maxime', 'placeat',
  'facere', 'possimus', 'omnis', 'voluptatibus', 'maiores', 'alias', 'perferendis',
  'doloribus', 'asperiores', 'repellat',
]

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function generateSentence(minWords: number, maxWords: number): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1))
  const words = Array.from({ length: count }, () => randomWord())
  words[0] = capitalize(words[0])
  // Add commas occasionally
  if (count > 6) {
    const commaPos = 3 + Math.floor(Math.random() * (count - 5))
    words[commaPos] = words[commaPos] + ','
  }
  return words.join(' ') + '.'
}

function generateParagraph(sentences: number): string {
  return Array.from({ length: sentences }, () => generateSentence(8, 18)).join(' ')
}

type GenType = 'paragraphs' | 'sentences' | 'words'

export default function LoremGenerator() {
  const [type, setType] = useState<GenType>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    let result = ''

    if (type === 'paragraphs') {
      const paragraphs = Array.from({ length: count }, (_, i) => {
        if (i === 0 && startWithLorem) {
          return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + generateParagraph(3)
        }
        return generateParagraph(4 + Math.floor(Math.random() * 3))
      })
      result = paragraphs.join('\n\n')
    } else if (type === 'sentences') {
      const sentences = Array.from({ length: count }, (_, i) => {
        if (i === 0 && startWithLorem) {
          return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        }
        return generateSentence(8, 18)
      })
      result = sentences.join(' ')
    } else {
      const words = Array.from({ length: count }, () => randomWord())
      if (startWithLorem && count >= 2) {
        words[0] = 'lorem'
        words[1] = 'ipsum'
      }
      result = words.join(' ')
    }

    setOutput(result)
  }, [type, count, startWithLorem])

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0
  const charCount = output.length

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Lorem Ipsum Generator</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Generate placeholder text for your designs and mockups</p>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div>
            <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">Type</label>
            <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
              {(['paragraphs', 'sentences', 'words'] as GenType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 text-sm capitalize border-none cursor-pointer transition-colors ${
                    type === t
                      ? 'bg-[var(--color-accent)] text-[#0a0a0a] font-semibold'
                      : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">Count</label>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="input-field w-24 text-center"
              min={1}
              max={100}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={e => setStartWithLorem(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">Start with "Lorem ipsum..."</span>
          </label>

          <button onClick={generate} className="btn-primary px-6 py-2.5">Generate</button>
        </div>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn-secondary text-xs px-3 py-1.5">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => setOutput('')} className="btn-secondary text-xs px-3 py-1.5">Clear</button>
            </div>
          </div>
          <div className="card p-5">
            <p className="text-sm text-[var(--color-text-secondary)] leading-7 whitespace-pre-wrap">{output}</p>
          </div>
        </div>
      )}

      {!output && (
        <div className="card p-12 text-center">
          <p className="text-[var(--color-text-muted)]">Click "Generate" to create placeholder text</p>
        </div>
      )}
    </div>
  )
}
