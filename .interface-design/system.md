# Audiobookshelf App — Design System

## Direction
Warm reading-nook aesthetic. Dark surfaces with warm charcoal undertones. Covers are the heroes — generous space, subtle color-bleed from cover art into surrounding chrome.

## Feel
Quiet, unhurried, companion-like. Dense enough to browse a collection, spacious enough to not feel cluttered.

## Depth Strategy
Surface color shifts (no heavy shadows). Cards use subtle warm-tinted shadows. Borders at low opacity for structure.

## Spacing
Base unit: 4px. Scale: 4/8/12/16/20/24/32/48.

## Surfaces (Dark theme)
- Page: rgb(28, 26, 24) — `bg-primary`
- Card: rgb(38, 36, 33) — `bg-secondary`
- Elevated: rgb(48, 45, 41) — `bg-bg`
- Hover: rgb(68, 64, 58) — `bg-bg-hover`

## Surfaces (OLED theme)
- Page: rgb(0, 0, 0) — pure black
- Card: rgb(18, 16, 14)
- Elevated: rgb(28, 26, 24)

## Text
- Primary: rgb(232, 228, 223) — `text-fg`
- Muted: rgb(178, 173, 166) — `text-fg-muted`

## Borders
- Default: `rgb(var(--color-border) / 0.08)` — `border-warm`
- Emphasis: 1.5x opacity — `border-warm-emphasis`

## Colors
- Accent: #1ad691 (bookmark green)
- Error: #FF5252
- Warning: #FB8C00
- Success: #4CAF50
- Info: #2196F3

## Border Radius
- Cards: 12px (`rounded-xl`)
- Buttons: 8px (`rounded-lg`)
- Sheets: 16px top corners
- Pills: 9999px (`rounded-full`)

## Typography
- Sans: Source Sans Pro (300/400/600)
- Mono: Ubuntu Mono (400)
- Heading: font-semibold, tight tracking
- Labels: text-xs font-semibold uppercase tracking-wider text-fg-muted
- Body: text-sm text-fg

## Icons
- Material Symbols Rounded
- Filled variant: .fill class
- Custom: absicons font

## Navigation
- Bottom nav: 56px, 5 tabs (Home, Library, Search, Downloads, More)
- Top bar: 48px slim
- Mini-player: 64px

## Components
- Modals: Bottom sheets with drag-to-dismiss
- Cards: rounded-xl bg-secondary with subtle shadow
- Buttons: rounded-lg, flat with border, accent variant for CTAs
- Inputs: inset bg-primary, rounded-lg, accent focus ring
- Toggles: pill-shaped, bg-accent when on
- Shelves: horizontal scroll with snap, modern by default, classic wood as toggle

## Transitions
- Entry: cubic-bezier(0.16, 1, 0.3, 1) 200-300ms
- Exit: ease-in 150-250ms
- Page: fade + 8px lift
- Sheets: slide up from bottom
- Micro: 150ms for hovers/presses

## Signature
Cover-color-bleed: FastAverageColor extracts dominant color from book covers, tints surrounding UI subtly.
