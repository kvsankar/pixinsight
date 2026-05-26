# Horsehead / Flame 2013-2016 Processing — Status

**As of:** 2026-05-26 IST, the primary narrow-field masters are solved, registered, blended, and a v1 presentation candidate has been exported.
**Pipeline progress:** 75%, v1 Horsehead candidate complete — remaining work is optional refinement/comparison.

For the repo-level planning document, see [Horsehead / Flame processing plan](../../../docs/horsehead-processing-plan.md).
For the chronological log, see [Processing journey](processing-journey.md).
For the accepted result, see [Final v1](final-v1.md).

## Where We Are

```text
PHASE 0 — Source inventory and project setup       COMPLETE FOR PRIMARY SETS
PHASE 1 — Calibration + integration                COMPLETE FOR PRIMARY SETS
PHASE 2 — Linear post-integration                  COMPLETE FOR FIRST CANDIDATE
PHASE 3 — Nonlinear processing/export              V1 COMPLETE
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | Horsehead Nebula / Barnard 33, IC 434, Flame Nebula / NGC 2024 region |
| Dates found | 2013-02-08/09, 2013-12-31, 2016-01-07/08/09 |
| Camera bodies | Canon EOS 60D unmodified; Canon EOS Rebel T1i modified |
| Main goal | Combine modded and unmodded narrow-field data for better S/N without losing believable broadband color |
| Wide-field role | Separate context/large-scale support only; not part of the fine-detail integration |
| Checked-in historical preview | `docs/images/original-2013-finished-work.jpg`, sourced from `finished-work/20131231-Flame-Horsehead-Nebulae.jpg` |
| Current blocker | None for v1; remaining work is optional refinement/comparison |

## Candidate Light Sets

| Candidate | Frames | Exposure | Decision |
| --- | ---: | ---: | --- |
| `20160109-yelagiri-ymca-flame-horsehead/good/modded` | 28 CR2 | 84 min | Primary modded/H-alpha-rich stack |
| `20160109-yelagiri-ymca-flame-horsehead/washed-out-maybe` | 41 CR2 | 205 min | Test separately; include only after quality review |
| `20131231-coorg-keemale-flame-horsehead/good-with-geosats` | 23 CR2 | 92 min | Primary unmodified/broadband stack; satellite rejection needed |
| `20160109-yelagiri-ymca-flame-horsehead/good/unmodded` | 7 CR2 | 31 min | Extra unmodified/broadband stack |
| `20130208-coorg-keemale-m42-flame-horsehead/180s-1600iso` | 31 CR2 | 93 min | Separate 70mm wide-field branch |
| `20130208-coorg-keemale-m42-flame-horsehead/300s-1600iso` | 20 CR2 | 100 min | Separate 70mm wide-field branch |

Skip for now: `bad`, `bad-tree-shadow`, `tree-obscured`, `aborted`, `trial-shots`, previews, JPGs, old TIF/PSD outputs, and the short 50mm `20130113-yelagiri-ymca-orion` set.

## Calibration Inventory

| Calibration source | Candidate use | Caveat |
| --- | --- | --- |
| Canon EOS 60D dark library | 60D unmodified sessions | Has useful ISO1600 buckets; 300s matching darks were not obvious in the first scan |
| 2016 T1i flats, `good` | 2016 modded T1i stack | 34 consistent flats found |
| 2016 60D flats, `unsorted` | 2016 60D unmodified frames | Needs curation before use |
| 2013 f/2.8 flats | 2013 February 70mm stack | Lights are f/3.5, so use only as a fallback after inspection |
| T1i darks | Not found yet | Need either locate matching darks or document a no-dark/flat-only control branch |
| Bias frames | Not found yet | Optional if located later |

## Decisions So Far

- Accepted `04c` with the plain v1 polish as the current final v1 result.
- Created project scaffold: `projects/horsehead-flame-2013-2016/`.
- Added the repo-level plan at `docs/horsehead-processing-plan.md`.
- Updated the WBPP wrapper to support named output subdirectories, optional flats, optional bias, multiple dark directories, and documented no-dark control runs.
- Rejected the first `wbpp-2016-modded-good` launch because `.env` darks leaked into the intended no-dark control and WBPP used Canon 60D darks on modified T1i lights.
- Reran `wbpp-2016-modded-good` as the intended no-dark control. It completed and produced an autocropped master light plus a linked STF preview.
- Ran `wbpp-2016-modded-washed-out-test` as a separate no-dark control. It completed and produced an autocropped 300s master light plus a linked STF preview.
- Split the 60D broadband plan: run the homogeneous 2013-12-31 240s geosat set first, and leave the small mixed-exposure 2016 unmodified group for a later test.
- Ran `wbpp-60d-20131231-geosats` with 23 lights and 9 matching 240s darks. It completed, with one registration failure and no-flats calibration caveats.
- Ran Phase 2 on `wbpp-60d-20131231-geosats`. Plate solve succeeded at 386.57 mm / 2.300 arcsec per px, and SPCC succeeded with Canon EOS 60D filters.
- Ran Phase 2a/2b on `wbpp-2016-modded-good`. Plate solve succeeded at 384.69 mm / 2.515 arcsec per px; SPCC was deliberately skipped because this modified-camera branch is red/H-alpha support, not broadband color truth.
- Ran Phase 2a/2b on `wbpp-2016-modded-washed-out-test`. Plate solve succeeded at 384.68 mm / 2.515 arcsec per px; SPCC was deliberately skipped for the same reason.
- Confirmed WBPP detected the T1i/Canon EOS 500D CFA pattern as Bayer `RGGB`; no CFA override is currently justified.
- Registered both solved T1i masters to the 60D Phase 2 reference with `scripts/pjsr/register-to-reference.js`.
- Created first-pass linear red-support blends with `scripts/pjsr/blend-red-support.js`. These are comparison branches, not final edits.
- The washed-out branch does not obviously damage the first red-support preview, but it is not fully accepted until crop, noise, and halo behavior are checked under a controlled stretch.
- Added `scripts/pjsr/render-cropped-reference-stf-jpeg.js` for fair visual comparisons: one crop and one 60D-derived STF applied to all candidate previews.
- Added `scripts/pjsr/roi-stats.js` and measured fixed red-channel ROIs. The half-weight washed blend `04c` keeps most of the IC 434 lift from full washed support while slightly reducing the Alnitak halo penalty.
- Added `scripts/pjsr/crop-xisf.js`, cropped `04c`, and ran a first conservative MaskedStretch. This is now the current nonlinear checkpoint.
- Added `scripts/pjsr/03h-horsehead-v1-polish.js` and exported the first v1 presentation candidate from `04c`.
- Ran a very mild star-reduction comparison branch. It is retained for inspection, but the plain v1 polish is the current preferred candidate because the star reduction is subtle and not worth making the default path yet.
- Do not mix modded T1i, unmodified 60D, and 70mm wide-field frames in one raw integration.
- Use the unmodified 60D stack for broadband color reference where possible.
- Use the modded T1i stack as H-alpha/red signal enhancement, not as the only color truth.
- Keep the 70mm 2013 February data as a separate wide-field/context master unless tests prove it improves low-frequency background or color.

## First Runs To Prepare

| Run name | Purpose |
| --- | --- |
| `wbpp-2016-modded-good` | Baseline modified-camera signal master |
| `wbpp-2016-modded-washed-out-test` | Decide whether the long washed-out set helps or hurts |
| `wbpp-60d-20131231-geosats` | Main broadband/color reference from homogeneous unmodified 60D data |
| `wbpp-60d-2016-unmodded-test` | Later mixed-exposure unmodified 60D test |
| `wbpp-2013-70mm-widefield` | Separate wide-field/context master |

## Outputs

| Output | Status |
| --- | --- |
| `work/wbpp-2016-modded-good/master/masterLight_BIN-1_4770x3178_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Completed no-dark control |
| `docs/images/horsehead-2016-modded-good-stf-linked.jpg` | Preview rendered |
| `work/wbpp-2016-modded-washed-out-test/master/masterLight_BIN-1_4770x3178_EXPOSURE-300.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Completed no-dark control |
| `docs/images/horsehead-2016-modded-washed-out-test-stf-linked.jpg` | Preview rendered |
| `work/wbpp-60d-20131231-geosats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Completed dark-calibrated no-flats broadband branch |
| `docs/images/horsehead-60d-20131231-geosats-stf-linked.jpg` | Preview rendered |
| `work/02-linear-60d-20131231-geosats/02e-linear-nr.xisf` | Phase 2 linear output completed |
| `docs/images/horsehead-60d-20131231-geosats-phase2-linear-stf-linked.jpg` | Phase 2 preview rendered |
| `work/02-linear-2016-modded-good/02b-solved.xisf` | Solved T1i support master |
| `docs/images/horsehead-2016-modded-good-solved-stf-linked.jpg` | Solved support preview rendered |
| `work/02-linear-2016-modded-washed-out-test/02b-solved.xisf` | Solved T1i washed-out support master |
| `docs/images/horsehead-2016-modded-washed-out-test-solved-stf-linked.jpg` | Solved washed-out support preview rendered |
| `work/04-combine/2016-modded-good-02b-solved-to-60d.xisf` | Clean T1i master registered to 60D reference |
| `work/04-combine/2016-modded-washed-out-test-02b-solved-to-60d.xisf` | Washed-out T1i master registered to 60D reference |
| `docs/images/horsehead-2016-modded-good-registered-to-60d-stf-linked.jpg` | Registered clean T1i preview rendered |
| `docs/images/horsehead-2016-modded-washed-out-test-registered-to-60d-stf-linked.jpg` | Registered washed-out T1i preview rendered |
| `work/04-combine/04a-rgb-plus-t1i-good-red-support.xisf` | First-pass 60D + clean T1i red-support blend |
| `docs/images/horsehead-04a-rgb-plus-t1i-good-red-support-stf-linked.jpg` | First-pass clean-support blend preview rendered |
| `work/04-combine/04b-rgb-plus-t1i-good-washed-red-support.xisf` | First-pass 60D + clean/washed T1i red-support blend |
| `docs/images/horsehead-04b-rgb-plus-t1i-good-washed-red-support-stf-linked.jpg` | First-pass combined-support blend preview rendered |
| `work/04-combine/04c-rgb-plus-t1i-good-washed-half-red-support.xisf` | Current best linear candidate: 60D + clean T1i + half-weight washed T1i red support |
| `docs/images/horsehead-compare-04c-good-washed-half-support-crop-refstf.jpg` | Controlled comparison preview rendered |
| `work/03-nonlinear/03a-04c-linear-crop.xisf` | Cropped current linear candidate |
| `work/03-nonlinear/03b-04c-maskedstretch.xisf` | First nonlinear checkpoint |
| `docs/images/horsehead-04c-maskedstretch-crop.jpg` | First nonlinear checkpoint preview |
| `work/03-nonlinear/03h-04c-v1-polish.xisf` | Accepted v1 PixInsight result |
| `work/03-nonlinear/horsehead-04c-v1-polish.tif` | Accepted v1 TIFF export |
| `docs/images/horsehead-04c-v1-polish.jpg` | Accepted v1 JPEG preview |
| `work/03-nonlinear/03i-04c-v1-polish-star-reduced.xisf` | Optional very mild star-reduction comparison |
| `docs/images/horsehead-04c-v1-polish-star-reduced.jpg` | Optional star-reduced preview |
| `docs/images/original-2013-finished-work.jpg` | Compressed historical finished-work preview for comparison |
