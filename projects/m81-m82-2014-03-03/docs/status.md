# M81 / M82 2014-03-03 Processing - Status

**As of:** 2026-05-28 IST, the M81/M82 project has completed Phase 1 dark/no-dark WBPP diagnostics, Phase 2 linear processing for both branches, legacy v3/v4 nonlinear crops, BXT/NXT/NXT-only plugin diagnostics, and close-crop review.
**Pipeline progress:** 85%, nonlinear comparison is complete but no presentation branch is accepted as final. Legacy v4 is the least-bad reference image, while the next useful work is upstream calibration/integration refinement.

For the proposed workflow, see [Processing pipeline](pipeline.md).
For the review checkpoint, see [Review checkpoint](review-2026-05-28.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [M81 / M82 processing research](research/01-m81-m82-processing.md).
For historical local artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE FOR DARK + NO-DARK CONTROL
PHASE 2 - Linear post-integration                  COMPLETE FOR DARK + NO-DARK CONTROL
PHASE 3 - Nonlinear processing/export              COMPARISONS COMPLETE; FINAL BLOCKED BY PATTERN NOISE
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | M81 / Bode's Galaxy and M82 / Cigar Galaxy |
| Primary date found | 2014-03-03 |
| Main source folder | `by-date/20140303-coorg-keemale-m81-m82/good` |
| Camera | Canon EOS 60D |
| Likely optic | ED80/reducer-era setup, to be confirmed by plate solving |
| EXIF caveat | Raw EXIF says `50.0 mm` with `FNumber=0`; treat that as stale/unreliable until solved |
| Main exposure pattern | 180s, ISO 1600 |
| Light temperature range | +24 to +49 C |
| Primary usable integration | 45 x 180s = 135 min / 2h15m |
| Historical DSS integration | 40 x 180s = 120 min / 2h, 49 darks, no flats |
| Historical reference | `docs/images/original-2014-finished-work.jpg` |
| Least-bad reference, not final | `docs/images/m81-m82-20140303-v4-detail-tight-crop.jpg` |
| Current blocker | Close-crop review shows vertical colored streaking in both BXT/NXT v1 and legacy v4; this is likely upstream pattern noise, not a nonlinear polish problem |

## Archive Search Results

The local archive search used M81/M82 aliases and related identifiers: `m81`, `m82`, `bode`, `cigar`, `ngc3031`, `ngc3034`, `ursa`, `supernova`, and `sn2014j`.

| Archive-relative path | Contents | Decision |
| --- | --- | --- |
| `by-date/20140303-coorg-keemale-m81-m82/good` | 45 CR2 lights, 45 historical `.cal.tif` files, 91 DSS sidecar text files | Primary source |
| `by-date/20140303-coorg-keemale-m81-m82/framing-trials` | 8 CR2 trial frames: 7 x 30s ISO3200 and 1 x 40s ISO1600 | Exclude from primary integration |
| `by-date/20140303-coorg-keemale-m81-m82/stacking/attempt-01` | DSS `Autosave.tif` and `Autosave.html` | Historical stacking evidence only |
| `by-date/20140303-coorg-keemale-m81-m82/processing/attempt-01` | TIFF/PSD/JPEG processing outputs | Historical visual reference only |
| `finished-work/20140303-M81-M82.jpg` | Final-looking 2014 JPEG, copied as docs reference | Visual/historical reference only |

No other by-date folders matching the M81/M82 alias search were found.

## Candidate Light Sets

| Candidate | Frames | Exposure | ISO | Temp | Decision |
| --- | ---: | ---: | ---: | --- | --- |
| `20140303-coorg-keemale-m81-m82/good` | 45 CR2 | 180s | 1600 | +24 to +49 C | Primary branch |
| Historical DSS subset from `good` | 40 CR2 | 180s | 1600 | +24 to +49 C | Comparison only; old DSS omitted the final five +30 C frames |
| `20140303-coorg-keemale-m81-m82/framing-trials` | 8 CR2 | 30s/40s | 3200/1600 | +38 to +42 C | Reject from first integration |

Temperature counts for the 45 `good` frames:

| Temperature | Count |
| ---: | ---: |
| +24 C | 1 |
| +27 C | 1 |
| +28 C | 2 |
| +29 C | 1 |
| +30 C | 9 |
| +31 C | 10 |
| +32 C | 2 |
| +33 C | 7 |
| +34 C | 3 |
| +35 C | 2 |
| +36 C | 2 |
| +37 C | 1 |
| +40 C | 1 |
| +42 C | 1 |
| +46 C | 1 |
| +49 C | 1 |

## Calibration Inventory

| Calibration source | Candidate use | Caveat |
| --- | --- | --- |
| `dark/canon-eos-60d/library-02/180s-1600iso/*c` | Primary dark support; 49 CR2 darks from +31 to +45 C | Same-duration/ISO dark family used by the historical DSS stack, but can overcorrect cooler +24 to +30 C lights |
| `dark/canon-eos-60d/library-01/180s-1600iso/*c` | Cool-dark diagnostic; 15 CR2 darks from +28 to +33 C | Older/smaller set, may better match the cooler majority but does not cover the early hot frames |
| `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` | Flat diagnostic; 48 CR2, ISO200, 1/3200s, +27 to +29 C | Same trip/ED80-era and folder explicitly names M81/M82, but no bias/dark-flat support; previous target tests showed this flat set can be risky |
| Bias / dark flats | None found in this pass | Flat branches require extra skepticism |

Current calibration decision:

1. Reject the dark-calibrated branch as the nonlinear baseline. It completed, but every light required automatic output pedestal and the SPCC/SCNR/MLT preview showed severe red/blue vertical chroma streaking.
2. Use the no-dark/no-flats branch as the current baseline. It has residual vertical patterning but produces a calmer solved/SPCC-calibrated linear checkpoint and better nonlinear review candidate.
3. Do not set flats globally in `.env`; run the 2014-03-02 flat set only as a named diagnostic branch if vignetting/background artifacts become the main blocker.
4. Keep the cool-dark `library-01` set as a deferred diagnostic only if a new dark-calibration investigation is needed.
5. Treat historical `.cal.tif`, DSS `Autosave.tif`, and PSD/TIFF/JPEG outputs as references, not modern PixInsight inputs.

## Decisions So Far

- Created project scaffold: `projects/m81-m82-2014-03-03/`.
- Copied a compressed historical finished-work reference to `docs/images/original-2014-finished-work.jpg`.
- Chose the 2014-03-03 `good` folder as the first source because it is curated, homogeneous, and has same-duration dark support.
- Excluded framing trials because they are short, mixed ISO, and not needed for a first deep integration.
- Treated EXIF `50.0 mm` as suspect because this repo has multiple ED80/reducer datasets with stale `50.0 mm` EXIF.
- Set a planned solve seed at the visual midpoint of M81 and M82: RA 148.93 deg, Dec +69.37 deg.
- Flagged SN 2014J as a review feature in M82, since the historical reference marks a point in M82 and the data was captured after the January 2014 discovery.
- Ran `wbpp-20140303-good-dark31-45-noflats` with 45 lights and 49 darks. WBPP completed, detected `GBRG`, calibrated all 45 lights with automatic pedestals, registered 44 non-reference images, and produced autocropped/uncropped masters. One low-weight +30 C frame was warned as rejected.
- Ran `wbpp-20140303-good-nodark-noflats-control`. It completed and registered successfully, with a calmer linked-STF background than the dark-calibrated branch.
- Ran Phase 2 on both branches. Both solved at 386.19 mm and 2.302 arcsec/px. The dark branch was rejected after SPCC/SCNR/MLT because of severe red/blue vertical streaking.
- Promoted the no-dark/no-flats Phase 2 checkpoint as the nonlinear baseline.
- Ran MaskedStretch at target background 0.085.
- Added `scripts/pjsr/03u-m81-m82-v1-polish.js` for M81/M82-specific nonlinear finishing.
- Exported a v1 polish, v1 crop, and v2 calm-sky crop.
- After review feedback that the galaxy pair's visual center was not centered and M82 looked too smudged, exported a v3 detail/recentered crop.
- Exported a v4 tighter crop from the same v3 detail image, keeping the corrected center while trimming more sky.
- After BlurXTerminator and NoiseXTerminator licenses were installed, created a new BXT/NXT branch from the accepted no-dark SPCC checkpoint, before the old MLT denoise.
- Rejected BXT/NXT v1 after visual review showed colored scratch/streak noise in the background crop.
- Tested NXT-only calm variants from the SCNR linear checkpoint. NXT v2 reduced chroma noise but still did not clearly beat legacy v4 because luminance texture remained higher.
- Close-crop review of M81 showed neither BXT/NXT v1 nor legacy v4 is acceptable as a clean final. V4 remains the least-bad reference only; further nonlinear/plugin tuning is deferred until calibration or integration diagnostics improve the underlying pattern noise.

## Review Questions

1. Which upstream diagnostic should be tried next: same-trip flats, cool-dark library, or different rejection/integration settings?
2. Can any calibration branch reduce the vertical red/blue streaking enough that BXT/NXT becomes useful later?
3. Should M81/M82 be paused as an archive-limited result if the upstream diagnostics do not improve the pattern noise?
4. Should a separate SN 2014J annotated crop be produced only after a cleaner presentation branch exists?

## Outputs

| Output | Status |
| --- | --- |
| `docs/images/original-2014-finished-work.jpg` | Compressed historical reference copied from finished work |
| `work/wbpp-20140303-good-dark31-45-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Dark-calibrated WBPP master, rejected as baseline |
| `docs/images/m81-m82-20140303-wbpp-dark-linked-stf.jpg` | Linked-STF preview of dark-calibrated WBPP master |
| `docs/images/m81-m82-20140303-wbpp-dark-unlinked-stf.jpg` | Unlinked-STF preview of dark-calibrated WBPP master |
| `work/wbpp-20140303-good-nodark-noflats-control/master/masterLight_BIN-1_5202x3464_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf` | No-dark WBPP master, accepted as current baseline |
| `docs/images/m81-m82-20140303-wbpp-nodark-linked-stf.jpg` | Linked-STF preview of no-dark WBPP master |
| `docs/images/m81-m82-20140303-wbpp-nodark-unlinked-stf.jpg` | Unlinked-STF preview of no-dark WBPP master |
| `work/02-linear-20140303-good-dark31-45-noflats/02e-linear-nr.xisf` | Dark-calibrated Phase 2 checkpoint, rejected as baseline |
| `docs/images/m81-m82-20140303-phase2-dark-linear-linked-stf.jpg` | Rejected dark branch Phase 2 linked-STF preview |
| `work/02-linear-20140303-good-nodark-noflats-control/02e-linear-nr.xisf` | Accepted no-dark Phase 2 linear checkpoint |
| `docs/images/m81-m82-20140303-phase2-nodark-linear-linked-stf.jpg` | Accepted no-dark Phase 2 linked-STF preview |
| `work/03-nonlinear-20140303-nodark-v1/03a-maskedstretch.xisf` | No-dark nonlinear stretch checkpoint |
| `docs/images/m81-m82-20140303-maskedstretch-v1.jpg` | JPEG preview of MaskedStretch checkpoint |
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v1-polish.xisf` | Full-frame v1 polish XISF |
| `docs/images/m81-m82-20140303-v1-polish.jpg` | Full-frame v1 polish JPEG |
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v1-crop.xisf` | Cropped v1 XISF |
| `docs/images/m81-m82-20140303-v1-crop.jpg` | Cropped v1 JPEG |
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v2-calm-sky-crop.xisf` | Previous v2 calm-sky crop XISF |
| `work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v2-calm-sky-crop.tif` | Previous v2 calm-sky TIFF export |
| `docs/images/m81-m82-20140303-v2-calm-sky-crop.jpg` | Previous v2 calm-sky JPEG review candidate |
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v3-detail.xisf` | v3 full-frame detail-preserving polish XISF |
| `docs/images/m81-m82-20140303-v3-detail-full.jpg` | v3 full-frame detail-preserving polish JPEG |
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v3-detail-recentered-crop.xisf` | Current v3 recentered detail crop XISF |
| `work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v3-detail-recentered-crop.tif` | Current v3 recentered detail crop TIFF export |
| `docs/images/m81-m82-20140303-v3-detail-recentered-crop.jpg` | Current v3 recentered detail crop JPEG review candidate |
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v4-detail-tight-crop.xisf` | Current v4 tighter detail crop XISF |
| `work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v4-detail-tight-crop.tif` | Current v4 tighter detail crop TIFF export |
| `docs/images/m81-m82-20140303-v4-detail-tight-crop.jpg` | Least-bad v4 tighter detail crop JPEG reference; not accepted as final |
| `work/02-linear-20140303-good-nodark-bxt-nxt/02f-bxt.xisf` | BXT linear checkpoint from accepted no-dark SPCC image, rejected diagnostic |
| `work/02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf` | BXT/NXT linear checkpoint, rejected diagnostic |
| `docs/images/m81-m82-20140303-bxt-nxt-linear-linked-stf.jpg` | Linked-STF preview of BXT/NXT linear checkpoint |
| `work/03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch.xisf` | BXT/NXT MaskedStretch checkpoint |
| `docs/images/m81-m82-20140303-bxt-nxt-maskedstretch.jpg` | BXT/NXT MaskedStretch JPEG |
| `work/03-nonlinear-20140303-bxt-nxt-v1/03u-m81-m82-bxt-nxt-v1-polish.xisf` | BXT/NXT v1 full-frame polish XISF |
| `docs/images/m81-m82-20140303-bxt-nxt-v1-polish.jpg` | BXT/NXT v1 full-frame polish JPEG |
| `work/03-nonlinear-20140303-bxt-nxt-v1/03u-m81-m82-bxt-nxt-v1-tight-crop.xisf` | Rejected BXT/NXT v1 tight crop XISF |
| `work/03-nonlinear-20140303-bxt-nxt-v1/m81-m82-20140303-bxt-nxt-v1-tight-crop.tif` | Rejected BXT/NXT v1 tight crop TIFF export |
| `docs/images/m81-m82-20140303-bxt-nxt-v1-tight-crop.jpg` | Rejected BXT/NXT v1 tight crop JPEG; background crop showed colored scratch/streak noise |
| `work/02-linear-20140303-good-nodark-nxt-calm/02g-nxt-calm.xisf` | NXT-only calm linear diagnostic from SCNR checkpoint |
| `docs/images/m81-m82-20140303-nxt-calm-v2-dark-tight-crop.jpg` | NXT-only v2 dark tight-crop diagnostic |
| `work/03-nonlinear-20140303-nxt-calm-v2-dark/03u-m81-m82-nxt-calm-v2-dark-tight-crop.xisf` | NXT-only v2 dark tight-crop XISF diagnostic |
| `work/03-nonlinear-20140303-nxt-calm-v2-dark/m81-m82-20140303-nxt-calm-v2-dark-tight-crop.tif` | NXT-only v2 dark tight-crop TIFF diagnostic |
