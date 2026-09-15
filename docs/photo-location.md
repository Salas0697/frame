# Optional photo locations

The post-selection brief now asks whether to include a place, and whether its single note belongs on the first, middle (earlier middle for an even count), or last page. Surprise preserves these answers. A manual override is available in the brief and under Locación in the editor.

PhotoImportController still owns the import. Only after the user submits the brief does the analysis port read the selected original File objects with exifr 7.1.3. JPEG and HEIF/HEIC EXIF GPS are supported by that library. Image decoding remains subject to browser format support. No EXIF or photo analysis is started by the new brief controls.

When enabled and no manual override is provided, the app lazily loads a content-addressed local catalog derived from cities.json 1.1.61 (170,540 GeoNames settlements). Coordinates are compared on-device. No reverse-geocoding API, account, device geolocation permission, image upload or GPS transmission is used. The first successful lookup needs the catalog download (about 6.2 MiB uncompressed). An unavailable catalog or absent/stripped GPS leaves the import usable and opens the manual place control. Precise GPS is discarded after lookup; approximate locality names are retained in project metadata. Original files, as before, stay in local IndexedDB.

This is a nearby-locality estimate, not an address, venue or administrative boundary lookup. Maximum distance: 30 km. A single locality over 5 km away is prefixed “Cerca de”. Multiple localities share one note (two names and a count of remaining places). Missing metadata is never substituted with the device's current location. Country labels use Intl.DisplayNames in Spanish where supported; locality names follow the source data.

Rendering reserves space below the composition with uniform scaling, including existing captions; it does not cover photos with a text overlay. Continuous panorama groups reserve the same space, with text on only the selected page. The same text layer is used in preview and PNG export. Repeated renders are idempotent; moving/removing the note reverses its previous space reservation. Another option, append, history and project restoration preserve the setting.

Data attribution: [GeoNames](https://www.geonames.org/) via [lutangar/cities.json](https://github.com/lutangar/cities.json), CC BY 4.0. FRAME converts objects into compact arrays of name, country, latitude and longitude; attribution is visible in the Locación panel. Exif reader: [MikeKovarik/exifr](https://github.com/MikeKovarik/exifr), MIT. License copies are in docs/licenses.

Validation includes actual EXIF parsing of synthetic JPEG (both byte orders) and HEIF metadata containers, distance/fallback/multi-place tests, all template families, and browser acceptance with real JPEG pixels carrying synthetic test GPS. These fixtures do not establish physical iPhone picker behavior or native HEIC image decoding; a device-level test is still outstanding.
