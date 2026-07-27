import { useState, useEffect } from 'react'
import JsonFormatter from './tools/JsonFormatter'
import ApiTester from './tools/ApiTester'
import Base64Codec from './tools/Base64Codec'
import JwtDecoder from './tools/JwtDecoder'
import HashGenerator from './tools/HashGenerator'
import RegexTester from './tools/RegexTester'
import ColorConverter from './tools/ColorConverter'
import UuidGenerator from './tools/UuidGenerator'
import MarkdownPreview from './tools/MarkdownPreview'
import TimestampConverter from './tools/TimestampConverter'
import DiffChecker from './tools/DiffChecker'
import LoremGenerator from './tools/LoremGenerator'

type ToolId = 'json' | 'api' | 'base64' | 'jwt' | 'hash' | 'regex' | 'color' | 'uuid' | 'markdown' | 'timestamp' | 'diff' | 'lorem'

interface ToolDef {
  id: ToolId
  label: string
  icon: React.ReactNode
  component: React.FC
}

const IconJson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 6h2a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H4" />
    <path d="M20 6h-2a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2 2 2 0 0 1 2 2v1a2 2 0 0 0 2 2h2" />
  </svg>
)

const IconApi = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const IconBase64 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>
)

const IconJwt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconHash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
)

const IconRegex = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="3" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="21" />
    <line x1="5.6" y1="5.6" x2="7.8" y2="7.8" />
    <line x1="16.2" y1="16.2" x2="18.4" y2="18.4" />
    <line x1="3" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="21" y2="12" />
    <line x1="5.6" y1="18.4" x2="7.8" y2="16.2" />
    <line x1="16.2" y1="7.8" x2="18.4" y2="5.6" />
  </svg>
)

const IconColor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="13.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="10.5" r="2.5" />
    <circle cx="8.5" cy="7.5" r="2.5" />
    <circle cx="6.5" cy="12.5" r="2.5" />
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5C4.636 19.37 7.258 22 12 22z" />
  </svg>
)

const IconUuid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 3h-8l-2 4h12z" />
  </svg>
)

const IconMarkdown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M7 15V9l2.5 3L12 9v6" />
    <path d="M17 9v6l-2-2" />
  </svg>
)

const IconTimestamp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconDiff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 3v18" />
    <rect x="2" y="5" width="8" height="6" rx="1" />
    <rect x="14" y="13" width="8" height="6" rx="1" />
  </svg>
)

const IconLorem = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
)

const tools: ToolDef[] = [
  { id: 'json', label: 'JSON Formatter', icon: <IconJson />, component: JsonFormatter },
  { id: 'api', label: 'API Tester', icon: <IconApi />, component: ApiTester },
  { id: 'base64', label: 'Base64 Codec', icon: <IconBase64 />, component: Base64Codec },
  { id: 'jwt', label: 'JWT Decoder', icon: <IconJwt />, component: JwtDecoder },
  { id: 'hash', label: 'Hash Generator', icon: <IconHash />, component: HashGenerator },
  { id: 'regex', label: 'Regex Tester', icon: <IconRegex />, component: RegexTester },
  { id: 'color', label: 'Color Converter', icon: <IconColor />, component: ColorConverter },
  { id: 'uuid', label: 'UUID Generator', icon: <IconUuid />, component: UuidGenerator },
  { id: 'markdown', label: 'Markdown Preview', icon: <IconMarkdown />, component: MarkdownPreview },
  { id: 'timestamp', label: 'Timestamp', icon: <IconTimestamp />, component: TimestampConverter },
  { id: 'diff', label: 'Diff Checker', icon: <IconDiff />, component: DiffChecker },
  { id: 'lorem', label: 'Lorem Ipsum', icon: <IconLorem />, component: LoremGenerator },
]

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('json')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('devforge-theme') as 'dark' | 'light') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('devforge-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const ActiveComponent = tools.find(t => t.id === activeTool)!.component

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col
          bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)]
          transform transition-all duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo + theme toggle */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 12px var(--color-accent-glow)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-tight">DevForge</h1>
              <p className="text-[0.65rem] text-[var(--color-text-muted)] uppercase tracking-widest">Developer Toolkit</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
          <div className="space-y-0.5">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id)
                  setSidebarOpen(false)
                }}
                className={`
                  relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 cursor-pointer border-none
                  ${activeTool === tool.id
                    ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                  }
                `}
              >
                {activeTool === tool.id && <span className="sidebar-active-indicator" />}
                <span className="flex-shrink-0">{tool.icon}</span>
                <span>{tool.label}</span>
                {activeTool === tool.id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <p className="text-[0.65rem] text-[var(--color-text-muted)]">
              Built with React + TypeScript
            </p>
            <p className="text-[0.6rem] text-[var(--color-text-muted)] opacity-60">v1.2.0</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border-none cursor-pointer bg-transparent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] flex-1">
            {tools.find(t => t.id === activeTool)!.label}
          </span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border-none cursor-pointer bg-transparent"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Tool content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
          <div className="max-w-6xl mx-auto">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </div>
  )
}
