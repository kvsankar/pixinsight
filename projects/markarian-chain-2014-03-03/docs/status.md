# Markarian Chain 2014-03-03 Processing - Status

**As of:** 2026-06-03 IST, this project has completed Phase 0 source inventory, Phase 1 diagnostics, Phase 2 ABE/solve/SPCC/SCNR on both no-dark and dark-calibrated/no-flats branches, BXT/NXT linear branches, and first nonlinear MaskedStretch checkpoints in sibling framings. The flat diagnostic registered all 19 lights but produced a severe bottom-half green gradient, so it is rejected. A closer review of the no-dark crop showed strong diagonal red/blue pattern noise; the dark-calibrated branch is now the better candidate for continued polish because it materially reduces that texture.
**Pipeline progress:** 77%, dark-calibrated BXT/NXT MaskedStretch full-frame and right-side crop candidates rendered for review; next work is final noise/background refinement on the dark branch and/or a stock/no-plugin comparison.

For the proposed workflow, see [Processing pipeline](pipeline.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [Markarian Chain processing research](research/01-markarian-chain-processing.md).
For historical local artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                DIAGNOSTICS COMPLETE
PHASE 2 - Linear post-integration                  BXT/NXT COMPLETE ON NO-DARK AND DARK BRANCHES
PHASE 3 - Nonlinear processing/export              DARK-BRANCH MASKEDSTRETCH CHECKPOINTS COMPLETE
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | Markarian's Chain, including M84, M86, NGC 4438/4435, and nearby Virgo Cluster galaxies |
| Primary date found | 2014-03-03 |
| Main source folder | `by-date/20140303-coorg-keemale-markarian-chain/good` |
| Camera | Canon EOS 60D |
| Likely optic | ED80/reducer-era setup, to be confirmed by plate solving |
| EXIF caveat | Raw EXIF says `50.0 mm` with `FNumber=0`; treat that as stale/unreliable until solved |
| Main exposure pattern | 240s, ISO 1600 |
| Light temperature range | +24 to +31 C |
| Primary usable integration | 19 x 240s = 76 min / 1h16m |
| Historical DSS integration | Attempt 1: 17 x 240s = 68 min; attempt 2: 19 x 240s = 76 min |
| Historical reference | DSS `Autosave.tif` and `Autosave001.tif` only; no finished-work JPEG found |

## Archive Search Results

The local archive search used Markarian and Virgo aliases: `markarian`, `chain`, `virgo`, `m84`, `m86`, `ngc443`, and `ngc447`.

| Archive-relative path | Contents | Decision |
| --- | --- | --- |
| `by-date/20140303-coorg-keemale-markarian-chain/good` | 19 CR2 lights, historical calibrated TIFFs/sidecars, one calibrated JPEG | Primary source |
| `by-date/20140303-coorg-keemale-markarian-chain/framing-trials` | 3 CR2 trial frames: 30s, 180s, and 240s ISO1600 | Exclude from primary integration |
| `by-date/20140303-coorg-keemale-markarian-chain/bad` | 7 rejected CR2 frames under `double-stars`, `light`, `sat-trails`, and `trailing-stars` | Exclude |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-01` | DSS `Autosave.tif` and `Autosave.html` | Historical stacking evidence only |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-02` | DSS `Autosave001.tif` and `Autosave001.html` | Historical stacking evidence only |
| `by-date/20130310-yelagiri-ymca-virgo-cluster-galaxies/lights` | 23 CR2 lights, mixed 20s-300s and ISO1600/ISO3200, Canon 60D with EF70-200mm at 200mm/f3.5 | Related separate session; do not raw-combine |
| `by-date/20130310-yelagiri-ymca-virgo-cluster-galaxies/processing` | 2 CR2 plus TIFF/JPEG historical artifacts including `virgo-clusters.jpg` | Historical reference only |
| `finished-work/` | No Markarian/Virgo finished-work file found | No finished-work reference |

## Candidate Light Sets

| Candidate | Frames | Exposure | ISO | Temp | Decision |
| --- | ---: | ---: | ---: | --- | --- |
| `20140303-coorg-keemale-markarian-chain/good` | 19 CR2 | 240s | 1600 | +24 to +31 C | Primary branch |
| Historical DSS attempt 1 from `good` | 17 CR2 | 240s | 1600 | +24 to +31 C | Historical comparison only |
| Historical DSS attempt 2 from `good` | 19 CR2 | 240s | 1600 | +24 to +31 C | Historical comparison only |
| `20140303-coorg-keemale-markarian-chain/framing-trials` | 3 CR2 | 30s/180s/240s | 1600 | +26 to +31 C | Reject from first integration |
| `20140303-coorg-keemale-markarian-chain/bad` | 7 CR2 | 240s | 1600 | +30 C | Reject by archive bucket |
| `20130310-yelagiri-ymca-virgo-cluster-galaxies/lights` | 23 CR2 | 20s-300s | 1600/3200 | +24 to +36 C | Separate project/diagnostic only |

Temperature counts for the 19 primary `good` frames:

| Temperature | Count |
| ---: | ---: |
| +24 C | 1 |
| +26 C | 1 |
| +28 C | 2 |
| +29 C | 1 |
| +30 C | 13 |
| +31 C | 1 |

## Calibration Inventory

| Calibration source | Candidate use | Caveat |
| --- | --- | --- |
| `dark/canon-eos-60d/library-02/240s-1600iso` | Primary dark support; 9 raw CR2 darks from +25 to +30 C plus historical master dark | Small dark set; one +31 C light lacks exact temperature match |
| `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` | Flat diagnostic; 52 CR2 flats, 1/3200s, ISO200 | Same trip/flat folder explicitly names Markarian, but no bias/dark-flat support and flat compatibility is unproven |
| `flat/20140302-rosette-m81-m82-markarian/1by1600s/set-1` and other one-off folders | Deferred diagnostics only | Mixed counts and unclear quality; README says some `-bad` markings were uncertain |
| Bias / dark flats | None found in this pass | Flat branches require extra skepticism |

Current calibration decision:

1. The dark-calibrated/no-flats primary branch completed with automatic output pedestal warnings and two registration failures, but downstream Phase 2/BXT/NXT/MaskedStretch comparison shows it suppresses the diagonal chroma pattern noise better than the no-dark branch.
2. The no-dark/no-flats control completed and was initially calmer in linked STF, but it integrated only 16 frames and its nonlinear right-side crop shows stronger diagonal red/blue pattern noise.
3. The same-trip flat diagnostic registered all 19 lights, but it produced a severe bottom-half green gradient and is rejected.
4. Treat historical `.cal.tif`, DSS autosaves, and old JPEG/TIFF outputs as references, not modern PixInsight inputs.

## Decisions So Far

- Created project scaffold: `projects/markarian-chain-2014-03-03/`.
- Chose the 2014-03-03 `good` folder as the primary source because it is curated, homogeneous, and has same-duration/ISO dark support.
- Excluded the `bad` and `framing-trials` folders from the first integration.
- Marked the 2013 Virgo Cluster folder as related but separate because it uses a different optic, mixed exposures, mixed ISO, and a different date/site.
- Found no finished-work Markarian/Virgo JPEG in `finished-work/`.
- Recorded DSS attempt 1 and attempt 2 as historical evidence only.
- Set a planned solve seed around the visible chain midpoint: RA 186.75 deg, Dec +13.10 deg, focal 386 mm, pixel size 4.31 um, limiting magnitude 12.0 after the successful retry.
- Planned Canon EOS 60D SPCC filters.
- Updated local `.env` to point at this project and dataset for the next run.
- Ran `wbpp-20140303-good-dark25-30-noflats` with 19 lights and 9 darks. WBPP completed with exit code 0, detected `GBRG`, calibrated/debayered all 19 lights, registered 17, and produced autocropped/uncropped master lights plus a master dark.
- WBPP warned that registration failed for two +30 C frames: `MARKARIAN-CHAIN_240s_1600iso_+30c_00442stdev_20140303-04h45m05s517ms` and `MARKARIAN-CHAIN_240s_1600iso_+30c_00499stdev_20140303-04h49m12s176ms`.
- Rendered linked and unlinked STF previews for the dark branch. The linked preview is strongly green; the unlinked preview shows a strong magenta/green field imbalance and broad central glow, so the no-dark/no-flats control should run before Phase 2.
- Ran `wbpp-20140303-good-nodark-noflats-control` with 19 lights and no calibration frames. WBPP completed with exit code 0, detected `GBRG`, debayered all 19 lights, rejected `MARKARIAN-CHAIN_240s_1600iso_+30c_00403stdev_20140303-04h53m18s722ms` at the bad-frame threshold, registered 16 of the remaining 18, and failed registration on the same two +30 C frames as the dark branch.
- Rendered linked and unlinked STF previews for the no-dark branch. The field is calmer than the dark branch but shows stronger uncalibrated vignetting.
- Ran `wbpp-20140303-good-dark25-30-flat3200-test` with 19 lights, 9 darks, and 48 flats. WBPP completed with exit code 0, detected `GBRG`, calibrated/debayered all 19 lights, registered all 19, and produced master dark, master flat, and master light outputs.
- Rejected the flat diagnostic as a Phase 2 baseline after its linked STF preview showed a severe bottom-half green gradient, suggesting flat mismatch or unusable flat calibration for this data.
- Ran Phase 2 on the no-dark/no-flats baseline through ABE, ImageSolver, SPCC, and SCNR, intentionally stopping before stock MLT denoise to preserve a clean input for BXT/NXT.
- The first plate solve failed at `targetMax=2500`, `maxBox=85`, `magnitude=10.5`. Retrying with `targetMax=5000`, `maxBox=140`, `magnitude=12.0` solved successfully at 385.88 mm and 2.304 arcsec/px.
- SPCC completed with Canon EOS 60D R/G/B filters and background neutralization enabled; SCNR completed after SPCC.
- Rendered a linked-STF preview from `02d-scnr.xisf`. The Phase 2 checkpoint has much improved color/background compared to the WBPP masters, but red/blue streaky pattern noise remains visible.
- Ran BXT/NXT from `02d-scnr.xisf` into `02-linear-20140303-good-nodark-bxt-nxt`. BlurXTerminator and NoiseXTerminator both completed and wrote `02f-bxt.xisf` and `02g-bxt-nxt.xisf`.
- Ran a first MaskedStretch from the no-dark `02g-bxt-nxt.xisf` with target background 0.095 into `03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch.xisf`, then rendered review JPEGs. The preview shows many Virgo galaxies clearly, but the right-side crop shows strong diagonal red/blue pattern noise.
- Created a sibling right-side crop from the same MaskedStretch checkpoint using `centerX=0.71`, `centerY=0.5`, `width=0.58`, `height=1.0`. This preserves the full-frame Virgo-field composition while adding a more traditional Markarian Chain framing without clipping the bright upper-left galaxy in the cropped view.
- Ran the dark-calibrated/no-flats branch through Phase 2, BXT/NXT, MaskedStretch, and the same corrected right-side crop. This diagnostic is visibly cleaner than the no-dark crop, with much weaker diagonal chroma streaking, so it is promoted as the preferred branch for continued tuning.

## Review Questions

1. How far should the dark-branch background be smoothed before it starts looking overprocessed or erasing faint galaxies?
2. Should a stock/no-plugin stretch be made as a comparison before judging the BXT/NXT branch?
3. Between the sibling framings, should final polish favor the full Virgo-field view, the right-side traditional chain crop, or keep both as final deliverables?
4. Should the 2013 Virgo Cluster lens data become a separate project later, or remain only historical context for this Markarian Chain project?

## Outputs

| Output | Status |
| --- | --- |
| `projects/markarian-chain-2014-03-03/` | Project scaffold created |
| `docs/status.md` | Inventory and current state written |
| `docs/processing-journey.md` | Chronological planning log written |
| `docs/pipeline.md` | Reviewable processing plan written |
| `docs/original-2014-processing.md` | Historical DSS/local artifact note written |
| `docs/research/01-markarian-chain-processing.md` | Target-specific research note written |
| `work/wbpp-20140303-good-dark25-30-noflats/master/masterDark_BIN-1_5202x3464_EXPOSURE-240.00s.xisf` | Dark-branch master dark |
| `work/wbpp-20140303-good-dark25-30-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB.xisf` | Dark-branch uncropped WBPP master light |
| `work/wbpp-20140303-good-dark25-30-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Dark-branch autocropped WBPP master light |
| `docs/images/markarian-chain-20140303-wbpp-dark-linked-stf.jpg` | Linked-STF preview of dark-calibrated WBPP master |
| `docs/images/markarian-chain-20140303-wbpp-dark-unlinked-stf.jpg` | Unlinked-STF preview of dark-calibrated WBPP master |
| `work/wbpp-20140303-good-nodark-noflats-control/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB.xisf` | No-dark control uncropped WBPP master light |
| `work/wbpp-20140303-good-nodark-noflats-control/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf` | No-dark control autocropped WBPP master light |
| `docs/images/markarian-chain-20140303-wbpp-nodark-linked-stf.jpg` | Linked-STF preview of no-dark control master |
| `docs/images/markarian-chain-20140303-wbpp-nodark-unlinked-stf.jpg` | Unlinked-STF preview of no-dark control master |
| `work/wbpp-20140303-good-dark25-30-flat3200-test/master/masterDark_BIN-1_5202x3464_EXPOSURE-240.00s.xisf` | Flat-diagnostic master dark |
| `work/wbpp-20140303-good-dark25-30-flat3200-test/master/masterFlat_BIN-1_5202x3464_FILTER-NoFilter_CFA.xisf` | Flat-diagnostic master flat |
| `work/wbpp-20140303-good-dark25-30-flat3200-test/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Rejected flat-diagnostic WBPP master light |
| `docs/images/markarian-chain-20140303-wbpp-dark-flat3200-linked-stf.jpg` | Linked-STF preview of rejected flat diagnostic |
| `work/02-linear-20140303-good-nodark-noflats-control/02a-abe.xisf` | No-dark Phase 2 ABE checkpoint |
| `work/02-linear-20140303-good-nodark-noflats-control/02b-solved.xisf` | No-dark Phase 2 solved checkpoint |
| `work/02-linear-20140303-good-nodark-noflats-control/02c-spcc.xisf` | No-dark Phase 2 SPCC checkpoint |
| `work/02-linear-20140303-good-nodark-noflats-control/02d-scnr.xisf` | No-dark Phase 2 SCNR checkpoint; current BXT/NXT input |
| `docs/images/markarian-chain-20140303-phase2-nodark-scnr-linked-stf.jpg` | Linked-STF preview of no-dark Phase 2 SCNR checkpoint |
| `work/02-linear-20140303-good-nodark-bxt-nxt/02f-bxt.xisf` | BlurXTerminator linear checkpoint |
| `work/02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf` | NoiseXTerminator linear checkpoint; input for first MaskedStretch |
| `work/03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch.xisf` | First nonlinear BXT/NXT MaskedStretch checkpoint |
| `docs/images/markarian-chain-20140303-bxt-nxt-maskedstretch.jpg` | JPEG preview of first nonlinear BXT/NXT MaskedStretch checkpoint |
| `work/03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch-right-half.xisf` | Corrected right-side sibling crop of first nonlinear checkpoint |
| `docs/images/markarian-chain-20140303-bxt-nxt-maskedstretch-right-half.jpg` | JPEG preview of corrected right-side sibling crop |
| `work/02-linear-20140303-good-dark25-30-noflats-diagnostic/02d-scnr.xisf` | Dark-calibrated Phase 2 SCNR checkpoint |
| `work/02-linear-20140303-good-dark25-30-noflats-bxt-nxt/02g-bxt-nxt.xisf` | Dark-calibrated BXT/NXT linear checkpoint; preferred branch after noise review |
| `work/03-nonlinear-20140303-dark-bxt-nxt-v1/03a-maskedstretch.xisf` | Dark-calibrated nonlinear BXT/NXT MaskedStretch checkpoint |
| `docs/images/markarian-chain-20140303-dark-bxt-nxt-maskedstretch.jpg` | JPEG preview of dark-calibrated full-frame checkpoint |
| `work/03-nonlinear-20140303-dark-bxt-nxt-v1/03a-maskedstretch-right-side.xisf` | Dark-calibrated corrected right-side crop |
| `docs/images/markarian-chain-20140303-dark-bxt-nxt-maskedstretch-right-side.jpg` | JPEG preview of dark-calibrated corrected right-side crop |
