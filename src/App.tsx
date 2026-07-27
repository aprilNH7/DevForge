import { useState, useEffect, useMemo } from 'react'
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
import UrlCodec from './tools/UrlCodec'
import PasswordGenerator from './tools/PasswordGenerator'
import CronParser from './tools/CronParser'
import NumberBaseConverter from './tools/NumberBaseConverter'
import SqlFormatter from './tools/SqlFormatter'
import HtmlEntityCodec from './tools/HtmlEntityCodec'
import YamlFormatter from './tools/YamlFormatter'
import XmlFormatter from './tools/XmlFormatter'
import CsvParser from './tools/CsvParser'
import JsonTreeViewer from './tools/JsonTreeViewer'
import StringUtils from './tools/StringUtils'
import QrCodeGenerator from './tools/QrCodeGenerator'
import MarkdownTableGenerator from './tools/MarkdownTableGenerator'
import JsonDiff from './tools/JsonDiff'
import TextAnalyzer from './tools/TextAnalyzer'

type ToolId = 'json' | 'api' | 'base64' | 'jwt' | 'hash' | 'regex' | 'color' | 'uuid' | 'markdown' | 'timestamp' | 'diff' | 'lorem' | 'url' | 'password' | 'cron' | 'baseconv' | 'sql' | 'html' | 'yaml' | 'xml' | 'csv' | 'jsontree' | 'string' | 'qr' | 'mdtable' | 'jsondiff' | 'textanalyze'

type Theme = 'dark' | 'light' | 'midnight'

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
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" />
  </svg>
)
const IconJwt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconHash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
)
const IconRegex = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="3" /><line x1="12" y1="3" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="21" />
    <line x1="5.6" y1="5.6" x2="7.8" y2="7.8" /><line x1="16.2" y1="16.2" x2="18.4" y2="18.4" />
    <line x1="3" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="21" y2="12" />
    <line x1="5.6" y1="18.4" x2="7.8" y2="16.2" /><line x1="16.2" y1="7.8" x2="18.4" y2="5.6" />
  </svg>
)
const IconColor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="10.5" r="2.5" /><circle cx="8.5" cy="7.5" r="2.5" /><circle cx="6.5" cy="12.5" r="2.5" />
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5C4.636 19.37 7.258 22 12 22z" />
  </svg>
)
const IconUuid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 3h-8l-2 4h12z" />
  </svg>
)
const IconMarkdown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M7 15V9l2.5 3L12 9v6" /><path d="M17 9v6l-2-2" />
  </svg>
)
const IconTimestamp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconDiff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 3v18" /><rect x="2" y="5" width="8" height="6" rx="1" /><rect x="14" y="13" width="8" height="6" rx="1" />
  </svg>
)
const IconLorem = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
  </svg>
)
const IconUrl = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)
const IconPassword = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M12 13V9" /><rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="7" cy="12" r="1" /><circle cx="17" cy="12" r="1" />
  </svg>
)
const IconCron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" /><polyline points="11 14 13 16 16 13" />
  </svg>
)
const IconBaseConv = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" />
    <path d="M10 7h4" /><path d="M10 17h4" /><path d="M7 10v4" /><path d="M17 10v4" />
  </svg>
)
const IconSql = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)
const IconHtml = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
  </svg>
)
const IconYaml = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="4 4 12 12 20 4" /><line x1="12" y1="12" x2="12" y2="20" />
  </svg>
)
const IconXml = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="7 8 3 12 7 16" /><polyline points="17 8 21 12 17 16" /><line x1="14" y1="4" x2="10" y2="20" />
  </svg>
)
const IconCsv = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
  </svg>
)
const IconJsonTree = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="5" r="2" /><circle cx="6" cy="13" r="2" /><circle cx="18" cy="13" r="2" />
    <circle cx="6" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
    <line x1="12" y1="7" x2="6" y2="11" /><line x1="12" y1="7" x2="18" y2="11" />
    <line x1="6" y1="15" x2="6" y2="18.5" /><line x1="18" y1="15" x2="18" y2="18.5" />
  </svg>
)
const IconString = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 6H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" /><path d="M9 10h6" /><path d="M9 14h4" />
  </svg>
)
const IconQr = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" /><rect x="18" y="14" width="3" height="1" /><rect x="14" y="18" width="1" height="3" />
  </svg>
)
const IconMdTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="3" x2="9" y2="21" />
  </svg>
)
const IconJsonDiff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="4" width="8" height="16" rx="1" /><rect x="14" y="4" width="8" height="16" rx="1" /><path d="M10 10h4" /><path d="M10 14h4" />
  </svg>
)
const IconTextAnalyze = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
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
  { id: 'url', label: 'URL Codec', icon: <IconUrl />, component: UrlCodec },
  { id: 'password', label: 'Password Gen', icon: <IconPassword />, component: PasswordGenerator },
  { id: 'cron', label: 'Cron Parser', icon: <IconCron />, component: CronParser },
  { id: 'baseconv', label: 'Base Converter', icon: <IconBaseConv />, component: NumberBaseConverter },
  { id: 'sql', label: 'SQL Formatter', icon: <IconSql />, component: SqlFormatter },
  { id: 'html', label: 'HTML Entities', icon: <IconHtml />, component: HtmlEntityCodec },
  { id: 'yaml', label: 'YAML Formatter', icon: <IconYaml />, component: YamlFormatter },
  { id: 'xml', label: 'XML Formatter', icon: <IconXml />, component: XmlFormatter },
  { id: 'csv', label: 'CSV Parser', icon: <IconCsv />, component: CsvParser },
  { id: 'jsontree', label: 'JSON Tree', icon: <IconJsonTree />, component: JsonTreeViewer },
  { id: 'string', label: 'String Utils', icon: <IconString />, component: StringUtils },
  { id: 'qr', label: 'QR Code Gen', icon: <IconQr />, component: QrCodeGenerator },
  { id: 'mdtable', label: 'MD Table Gen', icon: <IconMdTable />, component: MarkdownTableGenerator },
  { id: 'jsondiff', label: 'JSON Diff', icon: <IconJsonDiff />, component: JsonDiff },
  { id: 'textanalyze', label: 'Text Analyzer', icon: <IconTextAnalyze />, component: TextAnalyzer },
]

const THEMES: Theme[] = ['dark', 'midnight', 'light']
const THEME_ICONS: Record<Theme, React.ReactNode> = {
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  midnight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2l1.09 3.26L16 4l-1.26 2.91L18 8l-3.26 1.09L16 12l-2.91-1.26L12 14l-1.09-3.26L8 12l1.26-2.91L6 8l3.26-1.09L8 4l2.91 1.26z" />
      <path d="M5 18l.5 1.5L7 20l-1.5.5L5 22l-.5-1.5L3 20l1.5-.5z" />
    </svg>
  ),
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
}

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('json')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [contentKey, setContentKey] = useState(0)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('devforge-theme') as Theme) || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? '' : theme
    localStorage.setItem('devforge-theme', theme)
  }, [theme])

  const cycleTheme = () => {
    setTheme(t => {
      const idx = THEMES.indexOf(t)
      return THEMES[(idx + 1) % THEMES.length]
    })
  }

  const filteredTools = useMemo(() => {
    if (!search.trim()) return tools
    const q = search.toLowerCase()
    return tools.filter(t => t.label.toLowerCase().includes(q) || t.id.includes(q))
  }, [search])

  const selectTool = (id: ToolId) => {
    setActiveTool(id)
    setSidebarOpen(false)
    setContentKey(k => k + 1)
  }

  const ActiveComponent = tools.find(t => t.id === activeTool)!.component

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="overlay-enter fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col
          bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)]
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="logo-glow w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
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
            onClick={cycleTheme}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-transparent cursor-pointer transition-all duration-200 hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-text-muted)]"
            title={`Theme: ${theme} (click to cycle)`}
          >
            <span className="text-[var(--color-accent)]">{THEME_ICONS[theme]}</span>
            <span className="theme-label">{theme}</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)] pointer-events-none">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="search-input"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer text-xs"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 scrollbar-thin">
          <div className="space-y-0.5">
            {filteredTools.map((tool, i) => (
              <button
                key={tool.id}
                onClick={() => selectTool(tool.id)}
                className={`
                  sidebar-item relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 cursor-pointer border-none
                  ${activeTool === tool.id
                    ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                  }
                `}
                style={{ animationDelay: `${i * 15}ms` }}
              >
                {activeTool === tool.id && <span className="sidebar-active-indicator" />}
                <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">{tool.icon}</span>
                <span>{tool.label}</span>
                {activeTool === tool.id && (
                  <span className="active-dot ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                )}
              </button>
            ))}
            {filteredTools.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-8">No tools match "{search}"</p>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <p className="text-[0.65rem] text-[var(--color-text-muted)]">
              {tools.length} tools available
            </p>
            <p className="text-[0.6rem] text-[var(--color-text-muted)] opacity-60">v2.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border-none cursor-pointer bg-transparent transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] flex-1">
            {tools.find(t => t.id === activeTool)!.label}
          </span>
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-transparent cursor-pointer transition-all hover:bg-[var(--color-bg-hover)]"
          >
            <span className="text-[var(--color-accent)]">{THEME_ICONS[theme]}</span>
            <span className="theme-label">{theme}</span>
          </button>
        </div>

        {/* Tool content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
          <div key={contentKey} className="tool-content-enter max-w-6xl mx-auto">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </div>
  )
}
