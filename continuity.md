# Continuity Notes

Last updated: 2026-02-28 (night, UI modernization + homelab build prep)

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
  - quick request for a small shelf subset (`shelves=recently-added,recent-series`)
  - followed by full personalized request to restore complete shelf set
  - endpoint parameter is additive and optional for compatibility.
- Found another startup bottleneck: `libraries/fetch` awaited `?include=filterdata`, which can take several seconds and compete with home requests.
  - `initLibraries` now fetches base library first (`includeFilterData: false`) and emits `library-changed` immediately.
  - Filter data is fetched in a delayed background call (`fetchFilterData`) to reduce first-screen blocking.
- Similar bottleneck existed when navigating to item pages that switch libraries.
  - Item-page `setLibrary()` now does lightweight library fetch first and defers filterdata fetch in background.
  - This reduces perceived lag when opening books across libraries.
- First-run UX improvement:
  - When no saved server config exists, app now auto-redirects to `/connect` instead of leaving user on empty `/bookshelf` with only a connect button.
  - Implemented in `layouts/default.vue` (`attemptConnection`) and kept non-invasive for existing connected users.
- Latest live observations (post-tuning):
  - Fast first-paint subset (`shelves=recently-added,recent-series`) is consistently sub-1s (commonly ~0.01s to ~0.10s server-side).
- Remaining spikes happen on full follow-up personalized calls (`include=numEpisodesIncomplete` and `include=rssfeed`) when cache is invalidated.
- Remaining spikes correlate with cache invalidation during playback/progress updates on server side.
  - Typical spike signature in logs: `Loaded 7 personalized shelves in ~3.8s` with `Discover` around `~2.7s to ~3.5s`.
  - Cache invalidation just before spikes is commonly triggered by playback/progress events (`mediaProgress.afterUpdate`, `playbackSession.afterBulkUpdate`, `Array.afterUpsert`).
- Stats/book-open spot checks are currently not primary bottlenecks:
  - `/api/me/stats/year/:year` around ~0.83s in sampled run.
  - `/api/items/:id?expanded=1&include=rssfeed` around ~0.06s.
  - `/api/items/:id/play` around ~0.11s.
- **i18n workflow failures** were caused by key ordering comparator mismatch.
  - The GitHub action checks simple lexical order (`keys[i] < keys[i-1]`), not locale-aware sort.
  - Added `scripts/sort-i18n.js` and `npm run i18n:sort` to apply CI-compatible ordering.
- **Publish Test App failure (older run)** was due to GitHub Pages not enabled on the fork.
  - GitHub Pages has been enabled with workflow build mode.

## Workflow behavior notes

- `Verify all i18n files are alphabetized` uses `audiobookshelf/audiobookshelf-i18n-updater@v1.3.0`.
- For translation edits, run `npm run i18n:sort` before pushing.
- `Publish Test App` requires repository Pages to stay enabled.
- Latest release published manually after CI:
- `homelab-book-requests-debug-20260228-r4`
- APK: `audiobookshelf-20260228-034439-a893a94.apk`
- New release published after latest successful `master` workflows:
  - `homelab-book-requests-debug-20260228-r5`
  - APK: `audiobookshelf-20260228-040419-cdc445b.apk`
  - Commit: `cdc445b5` (`improve first-run connect flow and item navigation responsiveness`)
- Latest signed homelab release after flavor/signing migration:
  - `homelab-book-requests-debug-20260228-r6`
  - APK: `audiobookshelf-20260228-152623-ace5674.apk`
  - Commit: `ace5674c`

## New homelab packaging and backup behavior

- Added Android flavor `homelab` to keep side-by-side install with upstream app:
  - `applicationId`: `com.audiobookshelf.app.homelab` via suffix
  - app label override: `Audiobookshelf Homelab`
- `Publish Test App` now builds signed `assembleHomelabRelease` APK (instead of unsigned debug) using repository secrets:
  - `ANDROID_SIGNING_KEYSTORE_BASE64`
  - `ANDROID_SIGNING_STORE_PASSWORD`
  - `ANDROID_SIGNING_KEY_ALIAS`
  - `ANDROID_SIGNING_KEY_PASSWORD`
- `Build APK` workflow was adjusted for flavors and now builds `assembleUpstreamDebug` from `apk/upstream/debug`.
- Default settings backup implemented in native DB plugin:
  - auto-writes backup JSON to shared Downloads as `audiobookshelf-homelab-settings-backup.json`
  - triggered on load and whenever server configs/settings are changed
  - backup excludes auth tokens (security)
- First-setup restore flow added on `/connect`:
  - when no saved server configs exist and backup is found, app prompts to restore
  - restore repopulates server configs (without tokens) + device settings
  - prompt is shown once per install using local preference flag

## UI modernization pass (current session)

- Completed a broad UI modernization while preserving app behavior:
  - new warm-token design foundation (`assets/tailwind.css`, `tailwind.config.js`)
  - slim app shell + persistent bottom nav (`components/app/BottomNav.vue`, `layouts/default.vue`, `components/app/Appbar.vue`)
  - bottom-sheet system and modal migrations (`components/modals/BottomSheet.vue` + migrated core modals)
  - refreshed cards/shelves/player/form controls/pages for cleaner mobile UX
  - dedicated UX audit fixes applied (touch targets, contrast, aria labels, empty states, hardcoded color cleanup)
- Added legacy compatibility option:
  - `Classic Shelf Style` toggle in settings
  - persisted in local preferences via `plugins/localStore.js`
  - `components/bookshelf/Shelf.vue` now respects this preference
- Added reusable loading placeholders:
  - `components/ui/SkeletonLoader.vue`
  - `components/ui/BookCardSkeleton.vue`
- Saved design system for future sessions in:
  - `.interface-design/system.md`

## Local build verification notes (current session)

- `npm run generate` + `npx cap sync` succeeded locally.
- Local Android build needs environment setup:
  - first attempt failed with `Unsupported class file major version 69` when defaulting to Java 25
  - rerun with Java 21 resolved that error (`JAVA_HOME=/usr/lib/jvm/java-21-openjdk`)
  - build then failed due missing Android SDK (`ANDROID_HOME` / `android/local.properties` not set in this environment)
- CI workflow remains the source of truth for homelab APK generation (`assembleHomelabRelease` in GitHub Actions).

## Follow-up suggestions for future PR to upstream

- Keep first-paint path minimal in `pages/bookshelf/index.vue`.
- If RSS metadata must be richer, keep it as deferred hydration after first paint.
- Consider a small server endpoint for visible-shelf-only data if further latency reduction is needed.

## Visual QA iteration (2026-02-28, late)

- Added a dev-only proxy path in Nuxt for browser QA against live server:
  - `nuxt.config.js` now wires `serverMiddleware/proxy.js` in non-production.
  - Proxy target defaults to `https://audiobooks.deployitwith.me` and forwards API/auth/socket paths only.
- Ran screenshot pass against live data (mobile viewport) and confirmed key layout issues:
  - `/bookshelf/library` was rendering as single-column in classic shelf mode.
  - Bottom chrome spacing could be tight on safe-area devices.
- Implemented layout fixes:
  - `components/bookshelf/LazyBookshelf.vue`: reduced non-list card gutter width contribution so phone widths can keep two columns.
  - `mixins/bookshelfCardsHelpers.js`: aligned card x-offset with new gutter math.
  - `assets/app.css`: content height calc now subtracts `env(safe-area-inset-bottom)` when bottom nav is visible (with and without mini-player).
  - `assets/app.css`: `#bookshelf` uses full parent height (removed extra `-48px` subtraction).
  - `pages/settings.vue`: increased bottom padding (`pb-24`) to keep lower settings rows clear of bottom chrome.
  - `pages/bookshelf/latest.vue`: added guards to avoid invalid recent-episodes requests when not in a podcast library (prevents empty/error state on non-podcast libraries).
- Verification artifacts:
  - Pre-fix one-column library: `screenshots/qa/tmp-library.png`
  - Post-fix two-column library: `screenshots/qa/fix-library-reset.png`
  - Settings spacing check: `screenshots/qa/fix-settings-scrolled.png`

## Visual QA iteration (2026-03-01, follow-up)

- Published interim test release for user validation:
  - `homelab-book-requests-debug-20260301-r8`
  - URL: `https://github.com/kevingatera/audiobookshelf-app/releases/tag/homelab-book-requests-debug-20260301-r8`
- Additional UI pass (same design language, no re-theme):
  - `pages/item/_id/index.vue`: removed `whitespace-nowrap` from metadata link rows (series/narrators/genres/tags) and enabled wrapping with `break-words`.
    - Fixes clipped metadata text on narrow screens.
  - `components/bookshelf/Shelf.vue`: corrected class typo `categoryPlacardtransform` -> `categoryPlacard transform` for legacy shelf placard positioning.
- Verification artifact:
  - Item metadata wrapping fixed: `screenshots/qa/fix-item-metadata-wrap.png`
- Follow-up release after this pass:
  - `homelab-book-requests-debug-20260301-r9`
  - URL: `https://github.com/kevingatera/audiobookshelf-app/releases/tag/homelab-book-requests-debug-20260301-r9`

## Mini-player regression fix (2026-03-01, later)

- User reported collapsed player bar regressed and was sitting too low, overlapping/hiding bottom nav.
- Restored collapsed player UX from upstream as baseline in `components/app/AudioPlayer.vue`, then re-skinned within current design language:
  - Removed the custom 64px mini-row replacement.
  - Reinstated original collapsed structure (cover/title/controls/track) and cover-tinted collapsed background.
  - Added bottom offset support so collapsed player sits above bottom nav (`56px + safe-area`) when nav is visible.
- Updated layout spacing to match restored collapsed player footprint:
  - `assets/app.css`: player-open content height now subtracts 120px (instead of 64px).
  - Reader/local media bottom offsets updated from 64px -> 120px in:
    - `components/readers/ComicReader.vue`
    - `components/readers/EpubReader.vue`
    - `components/readers/PdfReader.vue`
    - `pages/localMedia/item/_id.vue`
- Build verification: `npm run build` passes.
