# M81 / M82 2014-03-03 Processing - Status

**As of:** 2026-06-05 IST, the M81/M82 project is accepted and closed for this processing pass. Phase 1 dark/no-dark/cool-dark WBPP diagnostics, Phase 2 linear processing, legacy nonlinear crops, rejected plugin diagnostics, cool-light/cool-dark rescue processing, and the M82/SN-preserving final branch are complete.
**Pipeline progress:** Complete. Final v1 is the cool-light/cool-dark SN-preserve v2 crop, tightened by 20% after acceptance to remove the half-in/half-out edge galaxy above M81. It supersedes the BXT/NXT calm crop because M82/SN 2014J visibility is a hard review feature; the tradeoff is a subtler/darker presentation.

For the proposed workflow, see [Processing pipeline](pipeline.md).
For the accepted result, see [Final v1](final-v1.md).
For the review checkpoint, see [Review checkpoint](review-2026-05-28.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [M81 / M82 processing research](research/01-m81-m82-processing.md).
For historical local artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE FOR DARK, NO-DARK, AND COOL-DARK DIAGNOSTICS
PHASE 2 - Linear post-integration                  COMPLETE FOR DARK, NO-DARK, AND COOL-DARK DIAGNOSTICS
PHASE 3 - Nonlinear processing/export              ACCEPTED COOL-DARK SN-PRESERVE V2 FINAL
PHASE 4 - Final docs / closeout                    COMPLETE
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
| Accepted final integration | 31 x 180s = 93 min from a 33-light +24 to +33 C subset after WBPP rejected 2 frames |
| Historical DSS integration | 40 x 180s = 120 min / 2h, 49 darks, no flats |
| Historical reference | `docs/images/original-2014-finished-work.jpg` |
| Legacy reference, not final | `docs/images/m81-m82-20140303-v4-detail-tight-crop.jpg` |
| Accepted final | `docs/images/m81-m82-20140303-final-v1.jpg` |
| Accepted final branch | `docs/images/m81-m82-20140303-cooldark-sn-preserve-v2-tight-crop.jpg` |
| Current blocker | None for this processing pass. Residual caveats are archive-limited depth, no accepted flats, and the deliberate darker/subtler SN-preserving presentation. |

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
| Cool-light diagnostic subset from `good` | 33 CR2 selected, 31 integrated after WBPP rejection | 180s | 1600 | +24 to +33 C | Accepted final upstream branch; drops 12 hotter lights |
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

1. Reject the broad warm-dark `library-02` branch as the nonlinear baseline. It completed, but every light required automatic output pedestal and the SPCC/SCNR/MLT preview showed severe red/blue vertical chroma streaking.
2. Keep the no-dark/no-flats branch as the legacy baseline/reference. It is useful for comparison but no longer the best candidate because it still shows visible red/blue vertical streaks in close crops.
3. Accepted the cool-light/cool-dark `library-01` diagnostic as the final upstream branch. It uses less integration time, but the matched linear crop and nonlinear proof both show much calmer colored pattern noise.
4. Do not set flats globally in `.env`; run the 2014-03-02 flat set only as a named diagnostic branch if vignetting/background artifacts become the main blocker.
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
- Staged the 33 cooler `good` lights from +24 to +33 C and ran `wbpp-20140303-good-cool24-33-dark28-33-noflats` with `library-01` +28 to +33 C darks. WBPP calibrated 33 lights, rejected 2 low-scoring frames, registered/integrated 31, and produced a new master.
- Ran Phase 2 on the cool-light/cool-dark master. It solved, SPCC-calibrated, SCNR-corrected, and produced a stock linear NR checkpoint.
- Compared matched v4-geometry Phase 2 crops. The warm-dark branch remained dramatically streaked; the no-dark branch showed colored vertical marks; the cool-dark branch was visibly calmer.
- Produced a stock cool-dark nonlinear proof and a conservative cool-dark BXT/NXT calm proof. The BXT/NXT calm crop reduced the old colored-streak failure without the scratchy background of the earlier no-dark BXT/NXT branch.
- User review then flagged the BXT/NXT calm M82 crop as overexposed/smoothed compared with the old processing, where the SN 2014J-era point source was visible. Added `scripts/pjsr/03u-m81-m82-sn-preserve.js` and produced SN-preserve v1/v2 branches from the stock cool-dark linear NR checkpoint, avoiding BXT/NXT and HDR/LHE. SN-preserve v2 became the accepted final branch.
- Accepted SN-preserve v2 as final v1 on 2026-06-05 IST and exported final aliases: `docs/images/m81-m82-20140303-final-v1.jpg` and `work/03-nonlinear-20140303-cooldark-sn-preserve-v2/m81-m82-20140303-final-v1.tif`.
- Tightened final v1 by 20% from the accepted branch crop, creating `work/03-nonlinear-20140303-cooldark-sn-preserve-v2/03u-m81-m82-cooldark-sn-preserve-v2-final-v1-crop.xisf`, then regenerated the final TIFF/JPEG aliases. This removes the half-in/half-out edge galaxy at the 11 o'clock position of M81 while preserving the accepted processing.

## Final Decision

1. Use SN-preserve v2 as final v1 for this processing pass.
2. Keep the unmarked 20% tighter final crop as the accepted presentation image.
3. Keep the marked M82/SN crop only as an approximate review annotation, not as a presentation image or astrometric identification.
4. Keep BXT/NXT calm, stock cool-dark, no-dark v4, and NXT-only branches as diagnostics/comparisons only.
5. Close M81/M82 unless a future v2 specifically tests same-trip flats on the accepted cool-light/cool-dark branch.

## Outputs

| Output | Status |
| --- | --- |
| `docs/images/original-2014-finished-work.jpg` | Compressed historical reference copied from finished work |
| `work/wbpp-20140303-good-dark31-45-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Dark-calibrated WBPP master, rejected as baseline |
| `docs/images/m81-m82-20140303-wbpp-dark-linked-stf.jpg` | Linked-STF preview of dark-calibrated WBPP master |
| `docs/images/m81-m82-20140303-wbpp-dark-unlinked-stf.jpg` | Unlinked-STF preview of dark-calibrated WBPP master |
| `work/wbpp-20140303-good-nodark-noflats-control/master/masterLight_BIN-1_5202x3464_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf` | No-dark WBPP master, accepted as legacy baseline |
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
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v3-detail-recentered-crop.xisf` | Historical v3 recentered detail crop XISF |
| `work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v3-detail-recentered-crop.tif` | Historical v3 recentered detail crop TIFF export |
| `docs/images/m81-m82-20140303-v3-detail-recentered-crop.jpg` | Historical v3 recentered detail crop JPEG review candidate |
| `work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v4-detail-tight-crop.xisf` | Historical v4 tighter detail crop XISF |
| `work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v4-detail-tight-crop.tif` | Historical v4 tighter detail crop TIFF export |
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
| `work/wbpp-20140303-good-cool24-33-dark28-33-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Cool-light/cool-dark WBPP master; 31 x 180s after WBPP rejection |
| `docs/images/m81-m82-20140303-wbpp-cooldark-linked-stf.jpg` | Linked-STF preview of cool-light/cool-dark WBPP master |
| `docs/images/m81-m82-20140303-wbpp-cooldark-unlinked-stf.jpg` | Unlinked-STF preview of cool-light/cool-dark WBPP master |
| `work/02-linear-20140303-good-cool24-33-dark28-33-noflats/02e-linear-nr.xisf` | Stock Phase 2 cool-light/cool-dark linear NR checkpoint |
| `docs/images/m81-m82-20140303-phase2-cooldark-linear-linked-stf.jpg` | Linked-STF preview of stock cool-light/cool-dark Phase 2 checkpoint |
| `docs/images/m81-m82-20140303-phase2-warmdark-v4crop-refstf.jpg` | Matched reference-STF crop showing rejected warm-dark streaking |
| `docs/images/m81-m82-20140303-phase2-nodark-v4crop-refstf.jpg` | Matched reference-STF crop of no-dark baseline |
| `docs/images/m81-m82-20140303-phase2-cooldark-v4crop-refstf.jpg` | Matched reference-STF crop showing improved cool-dark upstream master |
| `work/03-nonlinear-20140303-cooldark-v1/03u-m81-m82-cooldark-v1-polish.xisf` | Stock cool-light/cool-dark nonlinear proof XISF |
| `docs/images/m81-m82-20140303-cooldark-v1-polish.jpg` | Stock cool-light/cool-dark full-frame proof JPEG |
| `docs/images/m81-m82-20140303-cooldark-v1-tight-crop.jpg` | Stock cool-light/cool-dark tight-crop proof JPEG |
| `work/02-linear-20140303-good-cool24-33-dark28-33-bxt-nxt-calm/02g-bxt-nxt.xisf` | Conservative cool-light/cool-dark BXT/NXT calm linear checkpoint |
| `work/03-nonlinear-20140303-cooldark-bxt-nxt-calm-v1/03u-m81-m82-cooldark-bxt-nxt-calm-v1-polish.xisf` | Demoted BXT/NXT calm full-frame comparison XISF |
| `docs/images/m81-m82-20140303-cooldark-bxt-nxt-calm-v1-polish.jpg` | Demoted BXT/NXT calm full-frame comparison JPEG |
| `work/03-nonlinear-20140303-cooldark-bxt-nxt-calm-v1/03u-m81-m82-cooldark-bxt-nxt-calm-v1-tight-crop.xisf` | Demoted BXT/NXT calm tight-crop comparison XISF |
| `docs/images/m81-m82-20140303-cooldark-bxt-nxt-calm-v1-tight-crop.jpg` | Demoted BXT/NXT calm tight-crop comparison; cleaner sky but M82/SN overexposed/smoothed |
| `scripts/pjsr/03u-m81-m82-sn-preserve.js` | SN-preserving nonlinear script: low-background hard STF plus restrained curves, no BXT/NXT/HDR/LHE |
| `work/03-nonlinear-20140303-cooldark-m82-safe-v1/03u-m81-m82-cooldark-m82-safe-v1-polish.xisf` | First lower-stretch M82-safe proof from MaskedStretch/polish script |
| `docs/images/m81-m82-20140303-cooldark-m82-safe-v1-tight-crop.jpg` | M82-safe v1 tight-crop proof, lower contrast but still not enough SN separation |
| `work/03-nonlinear-20140303-cooldark-sn-preserve-v1/03u-m81-m82-cooldark-sn-preserve-v1.xisf` | SN-preserve v1 proof, darker/subtler |
| `docs/images/m81-m82-20140303-cooldark-sn-preserve-v1-tight-crop.jpg` | SN-preserve v1 tight-crop proof |
| `work/03-nonlinear-20140303-cooldark-sn-preserve-v2/03u-m81-m82-cooldark-sn-preserve-v2.xisf` | Accepted SN-preserve v2 full-frame XISF |
| `docs/images/m81-m82-20140303-cooldark-sn-preserve-v2.jpg` | Accepted SN-preserve v2 full-frame JPEG |
| `work/03-nonlinear-20140303-cooldark-sn-preserve-v2/03u-m81-m82-cooldark-sn-preserve-v2-tight-crop.xisf` | Accepted SN-preserve v2 tight-crop XISF |
| `docs/images/m81-m82-20140303-cooldark-sn-preserve-v2-tight-crop.jpg` | Accepted SN-preserve v2 tight-crop branch JPEG |
| `work/03-nonlinear-20140303-cooldark-sn-preserve-v2/03u-m81-m82-cooldark-sn-preserve-v2-final-v1-crop.xisf` | Accepted final v1 presentation crop XISF, 20% tighter than branch crop |
| `work/03-nonlinear-20140303-cooldark-sn-preserve-v2/m81-m82-20140303-final-v1.tif` | Accepted final v1 TIFF export, 2633 x 1671 |
| `docs/images/m81-m82-20140303-final-v1.jpg` | Accepted final v1 JPEG, 922 x 585 |
| `docs/images/m81-m82-20140303-m82-close-cooldark-sn-preserve-v2.jpg` | Current unmarked M82/SN close-crop review image |
| `docs/images/m81-m82-20140303-m82-close-cooldark-sn-preserve-v2-sn2014j-marked.jpg` | Approximate annotated M82/SN review crop; annotation only, not a presentation image |
