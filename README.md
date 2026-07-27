<div align="center">

# DevForge

### The Developer's Swiss Army Knife

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

**12 essential developer tools in one beautiful, fast, offline-capable dashboard.**

No sign-ups. No tracking. No API keys. Everything runs in your browser.

[![Live Demo](https://img.shields.io/badge/Live_Demo-aprilnh7.github.io/DevForge-06b6d4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://aprilnh7.github.io/DevForge/)

---

[Live Demo](https://aprilnh7.github.io/DevForge/) · [Features](#features) · [Tools](#tools) · [Getting Started](#getting-started) · [Tech Stack](#tech-stack) · [Contributing](#contributing)

</div>

---

## Features

- **Zero Dependencies** — All tools use native Web APIs (Crypto, Fetch, FileReader)
- **Fully Offline** — Works without internet (except API Tester)
- **Dark Theme** — Easy on the eyes, built for developers
- **Mobile Responsive** — Use on any device
- **Instant Results** — Real-time processing, no loading screens
- **Copy to Clipboard** — One-click copy on every output
- **Privacy First** — Nothing leaves your browser

---

## Tools

| Tool | Description |
|------|-------------|
| **JSON Formatter** | Format, minify, and validate JSON with syntax highlighting and depth analysis |
| **API Tester** | Full HTTP client with custom headers, request body, response timing, and status badges |
| **Base64 Codec** | Encode/decode strings and files with Unicode support |
| **JWT Decoder** | Decode tokens, inspect claims, check expiry status with live countdown |
| **Hash Generator** | Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes instantly |
| **Regex Tester** | Test patterns with real-time highlighting, capture groups, and find & replace |
| **Color Converter** | Convert HEX/RGB/HSL with WCAG contrast checker and color harmony palettes |
| **UUID Generator** | Generate v4 UUIDs in bulk with format options and anatomy breakdown |
| **Markdown Preview** | Write Markdown and see rendered output in real-time with full syntax support |
| **Timestamp Converter** | Convert between Unix timestamps, ISO 8601, and human-readable dates |
| **Diff Checker** | Compare two texts side-by-side with LCS-based diff highlighting |
| **Lorem Ipsum** | Generate placeholder text — paragraphs, sentences, or words |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/aprilNH7/DevForge.git

# Navigate to directory
cd DevForge

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with hooks |
| **TypeScript 5.8** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Vite 6** | Build tool & dev server |
| **Web Crypto API** | SHA hashing |
| **Fetch API** | HTTP requests |

---

## Project Structure

```
devforge/
├── src/
│   ├── tools/
│   │   ├── JsonFormatter.tsx      # JSON format/minify/validate
│   │   ├── ApiTester.tsx          # HTTP request client
│   │   ├── Base64Codec.tsx        # Base64 encode/decode
│   │   ├── JwtDecoder.tsx         # JWT token decoder
│   │   ├── HashGenerator.tsx      # Hash generation (MD5-SHA512)
│   │   ├── RegexTester.tsx        # Regex pattern tester
│   │   ├── ColorConverter.tsx     # Color format converter
│   │   ├── UuidGenerator.tsx      # UUID v4 generator
│   │   ├── MarkdownPreview.tsx    # Live Markdown renderer
│   │   ├── TimestampConverter.tsx  # Unix/ISO date converter
│   │   ├── DiffChecker.tsx        # Text diff comparison
│   │   └── LoremGenerator.tsx     # Placeholder text generator
│   ├── App.tsx                    # Main app with sidebar nav
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind + custom styles
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-tool`)
3. Commit your changes (`git commit -m 'feat: add new tool'`)
4. Push to the branch (`git push origin feature/new-tool`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by [@aprilNH7](https://github.com/aprilNH7)**

If this saved you time, consider giving it a star!

</div>
