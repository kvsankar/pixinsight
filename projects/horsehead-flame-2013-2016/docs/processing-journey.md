# Horsehead / Flame Processing Journey

This is the chronological record for the Horsehead / Flame project. Keep decisions here, especially failed branches that explain why a dataset was included or excluded.

## 2026-05-25 — Source Inventory And Plan

- Paused Rosette processing and started Horsehead / Flame inventory.
- Found three explicit Horsehead / Flame source sessions in the external astronomy archive:
  - `20130208-coorg-keemale-m42-flame-horsehead`
  - `20131231-coorg-keemale-flame-horsehead`
  - `20160109-yelagiri-ymca-flame-horsehead`
- Identified `20160109` as the mixed modified/unmodified session:
  - `good/modded`: Canon EOS Rebel T1i, 28 CR2, 180s ISO1600.
  - `good/unmodded`: Canon EOS 60D, 7 CR2, mixed 145/240/300s ISO1600.
  - `washed-out-maybe`: Canon EOS Rebel T1i, 41 CR2, 300s ISO1600.
- Identified `20131231/good-with-geosats` as a strong unmodified 60D broadband source: 23 CR2, 240s ISO1600.
- Identified the `20130208` 70mm data as useful wide-field/context material, but not appropriate for the same fine-detail raw integration.
- Found likely calibration material:
  - Canon EOS 60D dark library.
  - 2016 T1i flats.
  - 2016 60D flats needing curation.
  - 2013 f/2.8 flats that may not match f/3.5 lights.
- Wrote the repo-level plan at `docs/horsehead-processing-plan.md`.
- Created project scaffold at `projects/horsehead-flame-2013-2016/`.
- Customized `scripts/run-wbpp-phase1.ps1` to support named WBPP output folders plus flats, bias, and multiple dark directories.

## 2026-05-25 — First WBPP Branch: 2016 Modded Good

Prepared to run the clean modified-camera branch as a documented no-dark control because matching T1i darks have not been found.

```powershell
$archive = '<external-archive>\pictures\astronomy\images'
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir .\projects\horsehead-flame-2013-2016 `
  -OutputSubdir 'wbpp-2016-modded-good' `
  -LightDirs @((Join-Path $archive 'by-date\20160109-yelagiri-ymca-flame-horsehead\good\modded')) `
  -FlatDirs @((Join-Path $archive 'flat\20160109-yelagiri-ymca-flats\good')) `
  -AllowNoDarks `
  -Fresh
```

Preflight counts:

- Lights: 28 CR2
- Flats: 34 CR2
- Darks: none, intentionally allowed for this control branch

Result: the first launch completed but was invalid. The wrapper still inherited `PI_DARK_DIR` from `.env` even with `-AllowNoDarks`, so WBPP used the Canon 60D 240s dark library against the modified T1i lights. That output is rejected. The wrapper was patched so `-AllowNoDarks` suppresses inherited dark directories unless darks are explicitly passed.

Rerun result: completed successfully as the intended no-dark control.

Outputs:

```text
work/wbpp-2016-modded-good/master/masterFlat_BIN-1_4770x3178_FILTER-NoFilter_CFA.xisf
work/wbpp-2016-modded-good/master/masterLight_BIN-1_4770x3178_EXPOSURE-180.00s_FILTER-NoFilter_RGB.xisf
work/wbpp-2016-modded-good/master/masterLight_BIN-1_4770x3178_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf
docs/images/horsehead-2016-modded-good-stf-linked.jpg
```

WBPP log confirms `Master dark: none` and `masterDarkEnabled = false`.

## 2026-05-26 — Second WBPP Branch: 2016 Modded Washed-Out Test

Prepared to run the longer modified-camera `washed-out-maybe` branch separately, again as a no-dark control with the matching T1i flat set.

```powershell
$archive = '<external-archive>\pictures\astronomy\images'
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir .\projects\horsehead-flame-2013-2016 `
  -OutputSubdir 'wbpp-2016-modded-washed-out-test' `
  -LightDirs @((Join-Path $archive 'by-date\20160109-yelagiri-ymca-flame-horsehead\washed-out-maybe')) `
  -FlatDirs @((Join-Path $archive 'flat\20160109-yelagiri-ymca-flats\good')) `
  -AllowNoDarks `
  -Fresh
```

Result: completed successfully as a no-dark control.

Outputs:

```text
work/wbpp-2016-modded-washed-out-test/master/masterFlat_BIN-1_4770x3178_FILTER-NoFilter_CFA.xisf
work/wbpp-2016-modded-washed-out-test/master/masterLight_BIN-1_4770x3178_EXPOSURE-300.00s_FILTER-NoFilter_RGB.xisf
work/wbpp-2016-modded-washed-out-test/master/masterLight_BIN-1_4770x3178_EXPOSURE-300.00s_FILTER-NoFilter_RGB_autocrop.xisf
docs/images/horsehead-2016-modded-washed-out-test-stf-linked.jpg
```

WBPP log confirms `Master dark: none` and `ImageCalibration: 41 succeeded, 0 failed, 0 skipped`.

## 2026-05-26 — Third WBPP Branch: 2013 60D Broadband Geosats

Adjusted the original `60d-broadband-narrow` idea: run the strong 2013-12-31 60D set separately first because it is cleanly homogeneous at 240s ISO1600 and has a matching 9-frame 240s ISO1600 60D dark set. The small 2016 unmodified group has mixed exposure lengths and should be tested later as its own branch.

```powershell
$archive = '<external-archive>\pictures\astronomy\images'
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir .\projects\horsehead-flame-2013-2016 `
  -OutputSubdir 'wbpp-60d-20131231-geosats' `
  -LightDirs @((Join-Path $archive 'by-date\20131231-coorg-keemale-flame-horsehead\good-with-geosats')) `
  -DarkDirs @((Join-Path $archive 'dark\canon-eos-60d\library-02\240s-1600iso')) `
  -Fresh
```

Result: completed successfully and produced the first unmodified-camera broadband master.

Outputs:

```text
work/wbpp-60d-20131231-geosats/master/masterDark_BIN-1_5202x3464_EXPOSURE-240.00s.xisf
work/wbpp-60d-20131231-geosats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB.xisf
work/wbpp-60d-20131231-geosats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf
docs/images/horsehead-60d-20131231-geosats-stf-linked.jpg
```

WBPP caveats:

- Master dark was used from the 240s ISO1600 60D library.
- No flats were used.
- Calibration logged negative/insignificant pixel sample warnings on the light frames.
- StarAlignment reported 22 succeeded, 1 failed.
- The master exists and is useful for first broadband/color comparison, but rejection maps and the failed registered frame should be inspected before treating it as final.

## 2026-05-26 — Phase 2: 2013 60D Broadband Geosats

Ran the 60D broadband master through ABE, plate solving, SPCC, SCNR, and linear noise reduction using Horsehead seed coordinates and Canon EOS 60D SPCC filters.

```powershell
$project = '.\projects\horsehead-flame-2013-2016'
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-60d-20131231-geosats' `
  -Phase1Master (Join-Path $project 'work\wbpp-60d-20131231-geosats\master\masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf') `
  -SolveRa 85.246 `
  -SolveDec -2.458 `
  -SolveFocal 386 `
  -SolvePixel 4.31 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

Outputs:

```text
work/02-linear-60d-20131231-geosats/02a-abe.xisf
work/02-linear-60d-20131231-geosats/02b-solved.xisf
work/02-linear-60d-20131231-geosats/02c-spcc.xisf
work/02-linear-60d-20131231-geosats/02d-scnr.xisf
work/02-linear-60d-20131231-geosats/02e-linear-nr.xisf
docs/images/horsehead-60d-20131231-geosats-phase2-linear-stf-linked.jpg
```

Plate solve result:

- Center: RA `5h 40m 52.019s`, Dec `-2d 24m 06.57s`.
- Resolution: `2.300 arcsec/px`.
- Focal distance: `386.57 mm`.
- Field of view: `3d 17' 51.0" x 2d 11' 14.1"`.

SPCC result:

- SPCC returned `true`.
- Filters used: `Canon EOS 60D R/G/B`.
- Background neutralization was enabled with the scripted upper-right ROI.

## 2026-05-26 — Phase 2: 2016 Modded T1i Support Masters

Ran the two modified-camera T1i masters through ABE and plate solving only. SPCC was deliberately skipped for these branches: they are meant to contribute red/H-alpha-rich structure after registration to the 60D color reference, not to define broadband color.

Clean 180s T1i branch:

```powershell
$project = '.\projects\horsehead-flame-2013-2016'
$master = Join-Path $project 'work\wbpp-2016-modded-good\master\masterLight_BIN-1_4770x3178_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf'
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-2016-modded-good' `
  -Phase1Master $master `
  -SolveRa 85.246 `
  -SolveDec -2.458 `
  -SolveFocal 386 `
  -SolvePixel 4.69 `
  -OnlyStage a `
  -Fresh
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-2016-modded-good' `
  -Phase1Master $master `
  -SolveRa 85.246 `
  -SolveDec -2.458 `
  -SolveFocal 386 `
  -SolvePixel 4.69 `
  -OnlyStage b
```

Outputs:

```text
work/02-linear-2016-modded-good/02a-abe.xisf
work/02-linear-2016-modded-good/02b-solved.xisf
docs/images/horsehead-2016-modded-good-solved-stf-linked.jpg
```

Plate solve result:

- Center: RA `5h 41m 07.304s`, Dec `-2d 24m 19.81s`.
- Resolution: `2.515 arcsec/px`.
- Focal distance: `384.69 mm`.
- Field of view: `3d 19' 45.2" x 2d 12' 39.1"`.

Long 300s washed-out test branch:

```powershell
$project = '.\projects\horsehead-flame-2013-2016'
$master = Join-Path $project 'work\wbpp-2016-modded-washed-out-test\master\masterLight_BIN-1_4770x3178_EXPOSURE-300.00s_FILTER-NoFilter_RGB_autocrop.xisf'
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-2016-modded-washed-out-test' `
  -Phase1Master $master `
  -SolveRa 85.246 `
  -SolveDec -2.458 `
  -SolveFocal 386 `
  -SolvePixel 4.69 `
  -OnlyStage a `
  -Fresh
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-2016-modded-washed-out-test' `
  -Phase1Master $master `
  -SolveRa 85.246 `
  -SolveDec -2.458 `
  -SolveFocal 386 `
  -SolvePixel 4.69 `
  -OnlyStage b
```

Outputs:

```text
work/02-linear-2016-modded-washed-out-test/02a-abe.xisf
work/02-linear-2016-modded-washed-out-test/02b-solved.xisf
docs/images/horsehead-2016-modded-washed-out-test-solved-stf-linked.jpg
```

Plate solve result:

- Center: RA `5h 40m 57.806s`, Dec `-2d 22m 41.60s`.
- Resolution: `2.515 arcsec/px`.
- Focal distance: `384.68 mm`.
- Field of view: `3d 13' 58.5" x 2d 6' 27.2"`.

Visual checkpoint:

- The 60D SPCC branch remains the color reference.
- The modified T1i linked-STF previews have strong channel imbalance, which is expected before color work and reinforces that they should be treated as support signal.
- The washed-out branch has real Horsehead/IC 434 structure and a usable WCS solution, but it should still be accepted only after registration/blend comparison against the clean T1i branch.

## 2026-05-26 — Registration And First Red-Support Blend

Added `scripts/pjsr/register-to-reference.js` to register one solved master to a solved reference with StarAlignment distortion correction. Used the 60D Phase 2 linear output as the geometric and color reference:

```text
work/02-linear-60d-20131231-geosats/02e-linear-nr.xisf
```

Registered support outputs:

```text
work/04-combine/2016-modded-good-02b-solved-to-60d.xisf
work/04-combine/2016-modded-washed-out-test-02b-solved-to-60d.xisf
docs/images/horsehead-2016-modded-good-registered-to-60d-stf-linked.jpg
docs/images/horsehead-2016-modded-washed-out-test-registered-to-60d-stf-linked.jpg
```

Registration result: both modified-camera masters aligned to the 60D 5162x3424 reference frame. The registered support images have black warped edges, which is expected and should be handled by later crop/intersection decisions. They were not directly used as color images.

Checked the WBPP logs for the T1i branches before blending:

- Camera: Canon EOS 500D / Rebel T1i.
- CFA pattern detected by WBPP: Bayer `RGGB`.
- No CFA override is currently justified.

Added `scripts/pjsr/blend-red-support.js` for first-pass comparison blends. It keeps the 60D SPCC/noise-reduced RGB image as the base, robustly normalizes the registered T1i red channel to the 60D red channel, and adds only positive red excess with bright-star protection.

First comparison outputs:

```text
work/04-combine/04a-rgb-plus-t1i-good-red-support.xisf
docs/images/horsehead-04a-rgb-plus-t1i-good-red-support-stf-linked.jpg

work/04-combine/04b-rgb-plus-t1i-good-washed-red-support.xisf
docs/images/horsehead-04b-rgb-plus-t1i-good-washed-red-support-stf-linked.jpg
```

Initial read:

- The 60D branch remains the color anchor.
- The clean T1i support increases IC 434/Horsehead red signal without globally replacing the color solution.
- The washed-out T1i branch does not obviously damage the linked-STF preview, but it needs a tighter crop and controlled stretch comparison before it should be accepted.
- These are still linear comparison products, not final nonlinear processing.

## 2026-05-26 — Controlled Comparison And Current Candidate

Added `scripts/pjsr/render-cropped-reference-stf-jpeg.js` to make fair candidate previews: each image gets the same crop and the same linked STF computed from the cropped 60D reference. This avoids each candidate receiving its own auto-stretch.

Controlled comparison previews:

```text
docs/images/horsehead-compare-60d-only-crop-refstf.jpg
docs/images/horsehead-compare-04a-good-support-crop-refstf.jpg
docs/images/horsehead-compare-04b-good-washed-support-crop-refstf.jpg
```

Added `scripts/pjsr/roi-stats.js` to measure fixed red-channel ROIs on the linear candidates. Approximate red-channel IC 434 contrast over sky, normalized by sky standard deviation:

| Candidate | Support mix | IC 434 contrast/std | Alnitak halo contrast/std | Read |
| --- | --- | ---: | ---: | --- |
| `60d` | 60D only | 0.104 | 0.179 | Color reference, weaker red emission |
| `04a` | clean T1i | 0.116 | 0.208 | Good lift, acceptable |
| `04b` | clean + full washed T1i | 0.128 | 0.227 | Best red lift, more halo |
| `04c` | clean + half washed T1i | 0.124 | 0.220 | Best compromise so far |

Created `04c` with the washed-out branch at half weight:

```text
work/04-combine/04c-rgb-plus-t1i-good-washed-half-red-support.xisf
docs/images/horsehead-compare-04c-good-washed-half-support-crop-refstf.jpg
```

Decision: use `04c` as the current linear candidate. The washed-out frames are useful, but not at full weight for the first final path.

Added `scripts/pjsr/crop-xisf.js`, cropped `04c`, and ran a conservative MaskedStretch:

```text
work/03-nonlinear/03a-04c-linear-crop.xisf
work/03-nonlinear/03b-04c-maskedstretch.xisf
docs/images/horsehead-04c-maskedstretch-crop.jpg
```

First nonlinear checkpoint read:

- The Horsehead silhouette and IC 434 emission survive the stretch.
- Alnitak is bright and needs later highlight/halo handling, but it is not a showstopper.
- The Flame has recognizable structure.
- The background is usable but still needs final color/contrast/noise refinement.

## 2026-05-26 — v1 Polish And Export

Added `scripts/pjsr/03h-horsehead-v1-polish.js` for target-specific nonlinear finishing. It starts from the cropped MaskedStretch image and applies:

- restrained low-luminance sky neutrality,
- bright-star highlight desaturation/compression,
- modest IC 434 red/color lift,
- gentle contrast and saturation curves,
- TIFF and small JPEG export.

Command shape:

```powershell
$project = '.\projects\horsehead-flame-2013-2016'
& $env:PIXINSIGHT_EXE -n `
  "-r=scripts/pjsr/03h-horsehead-v1-polish.js,input=$project/work/03-nonlinear/03b-04c-maskedstretch.xisf,output=$project/work/03-nonlinear/03h-04c-v1-polish.xisf,tiff=$project/work/03-nonlinear/horsehead-04c-v1-polish.tif,jpg=$project/docs/images/horsehead-04c-v1-polish.jpg,jpgScale=0.5" `
  --force-exit
```

Outputs:

```text
work/03-nonlinear/03h-04c-v1-polish.xisf
work/03-nonlinear/horsehead-04c-v1-polish.tif
docs/images/horsehead-04c-v1-polish.jpg
docs/images/original-2013-finished-work.jpg
```

v1 read:

- Slightly cleaner sky and highlights than the raw MaskedStretch checkpoint.
- Horsehead remains a dark silhouette.
- IC 434 red support is visible without making the entire field red.
- Flame structure is preserved.
- Alnitak is still bright, as expected, but less distracting than the initial stretch.

Also ran a very mild star-reduction comparison:

```text
work/03-nonlinear/03i-04c-v1-polish-star-reduced.xisf
work/03-nonlinear/03i-04c-v1-star-mask.xisf
docs/images/horsehead-04c-v1-polish-star-reduced.jpg
```

Decision: keep the non-star-reduced v1 polish as the current presentation candidate. The star-reduced version is subtle and useful for comparison, but not enough of an improvement to make it the default.

Historical comparison note: a compressed, metadata-stripped copy of `finished-work/20131231-Flame-Horsehead-Nebulae.jpg` is checked in as `docs/images/original-2013-finished-work.jpg` so the old finished-work result can be compared directly with the 2026 v1 PixInsight result.
