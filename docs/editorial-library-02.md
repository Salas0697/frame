# Editorial Library 02

FRAME now offers 14 collections, 42 body compositions, 28 collection-specific cover designs and five frame treatments. Six new collections are original FRAME compositions: Full Bleed, Offset Studies, Cinema Club, Collector, Column House and Contact Press. These are design choices, not claims about market popularity.

The earlier engine used one opening cover and let most families fall back to the same gallery/pair layouts. Its 15% penalty for repeating the previous family was too weak to ensure visible variety. This edition gives each family its own covers and safe single-photo fallbacks. Automatic selection excludes the three most recent families; explicit collection selection stays in that collection and alternates its cover. Recent choices are persisted with the design and included in existing undo snapshots. Ineligible panoramas are excluded from automatic selection.

The library dialog presents composition diagrams, descriptions, selection state, keyboard focus management and an automatic exploration option. Importing still belongs to PhotoImportController; the library neither decodes nor analyzes photos. The original post-selection brief, optional location and manual fallback remain unchanged.

Print and Darkroom mounts add a backing and uniformly inset the photo, leaving a larger lower margin. They preserve crop offsets/aspect ratio and share the normal preview, thumbnail and PNG layer model. The note and location remain outside the photos. Explicit frame/background settings and pinned pages still take precedence over automatic variation.

Coverage and detected-face safety override layout preferences. A wide group can therefore get a fitted single-photo fallback, and a fixed album where every page is pinned cannot visibly change. The library diagrams describe composition rather than promise an exact result for every photo set. No invented dates, slogans or locations are added.

Validation targets: existing import/location/crop/persistence regressions; every catalog body variant reachable; both covers in all 14 families; unique photo coverage across batch sizes; 24 automatic generations with no recent-three repeats and at least 16 different geometric sequences; mount crop preservation; live-browser library selection, all six new families, PNG mount pixels, recency after restore and fixed-cover variation. Browser evidence is attached to the PR quality run. Chromium/WebKit automation does not replace a physical iPhone/PWA test.

## Measured photo backgrounds

Automatic backgrounds now use the most prevalent measured image color across the album instead of the family background or a transformed RGB average. Each original is sampled once during post-brief pixel analysis. RGB bins merge nearby samples; representatives are actual sampled RGB values, ranked by pixel population, with rare fringe samples omitted. No hue rotations, lightening or darkening are applied. Suggestions use the current page photos or all unique album photos according to the scope selector. Explicit white and black remain available.

Applying a suggested color changes only the background and caption/location contrast, without regenerating geometry or analysis. Whole-album choices clear page overrides; page choices override one page position and survive Another option, undo and restoration. When regenerating a different sequence, the page override follows that page position. Moving an existing page retains its override. Old saved projects backfill measured colors from stored originals on restore, without reopening the picker or running face detection.

The page pin and favorite controls now live in a separate row above the artwork. Browser QA exposed the previous overlay intercepting the first cell in a small Museum Notes grid; the regression still clicks the actual image and checks editing/cover pin behavior.

WebKit traces also exposed stale page selection: a smooth thumbnail scroll emitted intermediate scroll positions after selection, while clicking a partially visible image selected its page before the scroll handler reverted to the preceding page. Explicit selection now aligns the full page immediately, rendering retains its scroll position, and trailing space lets the last page align too. Manual swiping still follows scroll position and clears stale image selection. Browser regressions assert the selected page after two paint frames before checking suggestions/editor state.
