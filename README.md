# Tipto BV — Premium Website

Premium, SEO-first, multilingual website for Tipto BV — a Belgian company specializing in custom balustrades, windows, doors, garage doors, stairs, and balconies.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **3D:** React Three Fiber + Drei
- **i18n:** next-intl (NL/EN/FR/PL)
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel-ready

## Features

- 13 premium pages with 4-language support (52 static routes)
- Interactive 3D balustrade configurator (material, color, style, height)
- Full SEO architecture (metadata, JSON-LD, sitemap, hreflang, canonical)
- Animated sections with scroll-reveal and parallax effects
- Contact form with Zod validation
- Responsive design across all breakpoints

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # All pages (NL default, EN/FR/PL prefixed)
│   │   ├── page.tsx        # Homepage
│   │   ├── balustrades/    # Product pages (6 total)
│   │   ├── 3d-simulator/   # 3D configurator
│   │   ├── contact/        # Contact + quote form
│   │   └── ...
│   └── api/contact/        # Form API route
├── components/
│   ├── layout/             # Header, Footer, LocaleSwitcher
│   ├── sections/           # Page sections (Hero, ProductGrid, etc.)
│   ├── three/              # 3D configurator components
│   └── ui/                 # Reusable UI (Button, Card, ScrollReveal)
├── i18n/                   # next-intl routing + request config
├── lib/                    # Utilities, constants, metadata, types
└── messages/               # Translation files (nl/en/fr/pl.json)
```

## Languages

| Language | Prefix | Example |
|----------|--------|---------|
| Dutch (default) | none | `/balustrades` |
| English | `/en` | `/en/balustrades` |
| French | `/fr` | `/fr/balustrades` |
| Polish | `/pl` | `/pl/balustrades` |

## Environment Variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://tiptobv.be
```

## Deployment

This project is configured for Vercel deployment. Push to GitHub and import in Vercel — no additional configuration needed.

## Company Info

- **Tipto BV**
- Koekoekstraat 25, 2630 Aartselaar, Belgium
- VAT: BE0802227315
- Phone: 0466 49 18 51
- Email: info@tiptobv.be
