# Continuity Notes

Last updated: 2026-02-28

## Current branch status

- Active branch: `master`
- Home performance and RSS hybrid changes are pushed.
- Recent key commits:
  - `d90e994e` - hydrate RSS metadata after fast home first paint
  - `017446b4` - prioritize above-the-fold shelves on home
  - `0bae6503` - speed up home shelf first paint
  - `0640dd6c` - broader cold-start improvements

## Findings and fixes

- **Home page first paint was delayed** by waiting on local progress and local DB enrichment.
  - Fixed by rendering server shelves first, then local enrichment in background.
- **`include=rssfeed` in home personalized request** increased cold latency.
  - Home first request now excludes RSS feed data for speed.
  - Hybrid follow-up added: background request hydrates RSS metadata for visible top shelves.
- **Cold-path spikes still occurred** on first home load in some sessions.
  - Added a small first-render server limit for home (`limit=4`) to reduce initial payload work.
  - Added a simple local fallback timer (~1.2s): if server shelves are still pending and local items exist, render local shelves immediately.
  - Kept behavior backward-compatible: this only changes optional query params and client-side fallback order.
- Added a two-phase home fetch for first paint:
  - quick request for a small shelf subset (`shelves=continue-listening,recent-series`)
  - followed by full personalized request to restore complete shelf set
  - endpoint parameter is additive and optional for compatibility.
- **i18n workflow failures** were caused by key ordering comparator mismatch.
  - The GitHub action checks simple lexical order (`keys[i] < keys[i-1]`), not locale-aware sort.
  - Added `scripts/sort-i18n.js` and `npm run i18n:sort` to apply CI-compatible ordering.
- **Publish Test App failure (older run)** was due to GitHub Pages not enabled on the fork.
  - GitHub Pages has been enabled with workflow build mode.

## Workflow behavior notes

- `Verify all i18n files are alphabetized` uses `audiobookshelf/audiobookshelf-i18n-updater@v1.3.0`.
- For translation edits, run `npm run i18n:sort` before pushing.
- `Publish Test App` requires repository Pages to stay enabled.

## Follow-up suggestions for future PR to upstream

- Keep first-paint path minimal in `pages/bookshelf/index.vue`.
- If RSS metadata must be richer, keep it as deferred hydration after first paint.
- Consider a small server endpoint for visible-shelf-only data if further latency reduction is needed.
