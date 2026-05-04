# Argos Emporio Group — Website

Static one-page website for Argos Emporio Group (Lazarevac, Serbia). Built with Vite + TypeScript.

## Stack

- **Vite 6** — dev server, bundling, asset hashing
- **TypeScript 5** (strict) — type-checked at build time via `tsc --noEmit`
- **Vanilla DOM** — no UI framework. Plain HTML + CSS + a single TS module.
- **ESLint + Prettier** — linting and formatting

## Requirements

- Node.js >= 20 (see `.nvmrc`)
- npm 10+

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc --noEmit`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over `src/` |
| `npm run format` | Format all source files with Prettier |
| `npm run format:check` | Verify formatting without writing |

## Project layout

```
.
├─ index.html               # Entry document (head, meta, CSP)
├─ src/
│  ├─ main.ts               # Behavior: nav scroll, reveal, smooth-scroll, form, image fallback
│  └─ styles/
│     └─ main.css           # All styles
├─ public/
│  ├─ robots.txt
│  └─ .well-known/
│     └─ security.txt       # RFC 9116
├─ .github/
│  └─ dependabot.yml
├─ vite.config.ts
├─ tsconfig.json
├─ eslint.config.js
└─ .prettierrc.json
```

Files inside `public/` are copied to the build root as-is and are served from `/` in dev.

## Contact form

The form is **client-only**: on submit it composes a `mailto:` link to `office@argoshellas.rs` and opens the user's mail client. Nothing is sent over the network. To collect submissions server-side, swap out `setupContactForm()` in `src/main.ts` for a `fetch` POST to your form endpoint (e.g. Formspree) and remove the `mailto:` line.

## Security notes

- **Content Security Policy** is set via `<meta http-equiv>` in `index.html`:
  - `script-src 'self'` — strict; no inline JS, no third-party scripts allowed.
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` — `'unsafe-inline'` is currently required because the original markup contains inline `style="..."` attributes (38 of them, cosmetic). To tighten this to just `'self' https://fonts.googleapis.com`, refactor inline styles into `main.css`.
  - `font-src` and `img-src` are scoped to the specific origins actually used.
  - `frame-ancestors 'none'` — equivalent to `X-Frame-Options: DENY`.
- **`X-Content-Type-Options: nosniff`** and a strict **`Referrer-Policy`** are set as meta equivalents.
- **No inline event handlers**: the original `onsubmit=` and `onerror=` attributes were moved into `src/main.ts`.
- **Form input** is trimmed and length-capped (5000 chars/field); email is regex-validated.
- **`security.txt`** at `/.well-known/security.txt` per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116).
- **Dependabot** runs weekly for npm and monthly for GitHub Actions.

### Known relaxations

- **Google Fonts** is loaded over HTTPS without Subresource Integrity. Google rotates the served CSS to deliver per-browser optimizations, so a fixed SRI hash would break. To eliminate the third-party dependency entirely, self-host the fonts (e.g. via `@fontsource/...` packages) and remove `fonts.googleapis.com` / `fonts.gstatic.com` from the CSP.
- The CSP is delivered via `<meta>` tag, which is fine but cannot set `frame-ancestors` enforcement on older browsers and cannot cover everything an HTTP-header CSP can. When deploying, also send the same CSP as an HTTP header from the host (Netlify `_headers`, Cloudflare Pages, nginx, etc.).
- `style-src 'unsafe-inline'` — see above.

## Deployment

This is a fully static build. After `npm run build`, deploy `dist/` to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3+CloudFront, nginx). Make sure to also send the CSP and other security headers at the HTTP layer in production.

## License

MIT — see [LICENSE](./LICENSE).
