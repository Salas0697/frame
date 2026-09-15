# Editorial Library 02

FRAME now offers 14 collections, 42 body compositions, 28 collection-specific cover designs and five frame treatments. Six new collections are original FRAME compositions: Full Bleed, Offset Studies, Cinema Club, Collector, Column House and Contact Press. These are design choices, not claims about market popularity.

The earlier engine used one opening cover and let most families fall back to the same gallery/pair layouts. Its 15% penalty for repeating the previous family was too weak to ensure visible variety. This edition gives each family its own covers and safe single-photo fallbacks. Automatic selection excludes the three most recent families; explicit collection selection stays in that collection and alternates its cover. Recent choices are persisted with the design and included in existing undo snapshots. Ineligible panoramas are excluded from automatic selection.

The library dialog presents composition diagrams, descriptions, selection state, keyboard focus management and an automatic exploration option. Importing still belongs to PhotoImportController; the library neither decodes nor analyzes photos. The original post-selection brief, optional location and manual fallback remain unchanged.

Print and Darkroom mounts add a backing and uniformly inset the photo, leaving a larger lower margin. They preserve crop offsets/aspect ratio and share the normal preview, thumbnail and PNG layer model. The note and location remain outside the photos. Explicit frame/background settings and pinned pages still take precedence over automatic variation.

Coverage and detected-face safety override layout preferences. A wide group can therefore get a fitted single-photo fallback, and a fixed album where every page is pinned cannot visibly change. The library diagrams describe composition rather than promise an exact result for every photo set. No invented dates, slogans or locations are added.

Validation targets: existing import/location/crop/persistence regressions; every catalog body variant reachable; both covers in all 14 families; unique photo coverage across batch sizes; 24 automatic generations with no recent-three repeats and at least 16 different geometric sequences; mount crop preservation; live-browser library selection, all six new families, PNG mount pixels, recency after restore and fixed-cover variation. Browser evidence is attached to the PR quality run. Chromium/WebKit automation does not replace a physical iPhone/PWA test.
