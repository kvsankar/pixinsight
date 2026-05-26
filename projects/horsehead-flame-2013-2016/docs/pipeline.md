# Horsehead / Flame Processing Pipeline

This project combines heterogeneous DSLR data: modified-camera emission signal, unmodified-camera broadband color, and a separate 70mm wide-field set. The pipeline intentionally builds multiple masters first, then combines only the masters that earn their place.

For current inventory and decisions, see [Status](status.md). For the accepted v1 result, see [Final v1](final-v1.md).

## Phase 0 — Setup

1. Keep raw archive paths local-only in `.env` or command invocations.
2. Run WBPP from leaf folders only. Do not point the wrapper at parent folders that contain `bad`, `tree-obscured`, previews, or old processing outputs.
3. Make one named WBPP output per acquisition group.
4. Render small STF previews for documentation after each successful master.

## Phase 1 — Calibration + Integration

Use `scripts/run-wbpp-phase1.ps1` with:

- `-OutputSubdir` for named branches.
- `-LightDirs` for one or more curated light folders.
- `-DarkDirs` when multiple 60D dark temperature buckets are needed.
- `-FlatDirs` when matching flats are available.
- no recursive frame discovery.
- `-AllowNoDarks` only for documented control runs when no matching darks are available.
- WBPP plate solving disabled.
- distortion correction and LocalNormalization enabled.
- large-scale high rejection enabled, especially for satellite trails.

Command template conventions below:

```powershell
$archive = '<external-archive>/pictures/astronomy/images'
$project = '.\projects\horsehead-flame-2013-2016'
```

### Run: 2016 Modded Good

Purpose: clean H-alpha-rich modified-camera master.

Inputs:

- lights: `20160109-yelagiri-ymca-flame-horsehead/good/modded`
- flats: `flat/20160109-yelagiri-ymca-flats/good`
- darks: not identified yet for the T1i

Decision: first run may need to use `-AllowNoDarks` for a flat-only or no-dark control. Document the calibration limitation clearly.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-2016-modded-good' `
  -LightDirs @((Join-Path $archive 'by-date\20160109-yelagiri-ymca-flame-horsehead\good\modded')) `
  -FlatDirs @((Join-Path $archive 'flat\20160109-yelagiri-ymca-flats\good')) `
  -AllowNoDarks `
  -Fresh
```

### Run: 2016 Modded Washed-Out Test

Purpose: test whether the long 300s modified-camera set improves faint signal.

Inputs:

- lights: `20160109-yelagiri-ymca-flame-horsehead/washed-out-maybe`
- flats: same T1i flat set as above

Decision gate: include only if gradients and background quality remain manageable.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-2016-modded-washed-out-test' `
  -LightDirs @((Join-Path $archive 'by-date\20160109-yelagiri-ymca-flame-horsehead\washed-out-maybe')) `
  -FlatDirs @((Join-Path $archive 'flat\20160109-yelagiri-ymca-flats\good')) `
  -AllowNoDarks `
  -Fresh
```

### Run: 60D Broadband 2013 Geosats

Purpose: main broadband/color reference from homogeneous unmodified camera data.

Inputs:

- lights: `20131231-coorg-keemale-flame-horsehead/good-with-geosats`
- darks: matching 60D 240s ISO1600 library bucket
- flats: none for the first controlled run

Decision gate: inspect whether satellite trails are rejected cleanly. Treat this as the first broadband/color reference.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-60d-20131231-geosats' `
  -LightDirs @((Join-Path $archive 'by-date\20131231-coorg-keemale-flame-horsehead\good-with-geosats')) `
  -DarkDirs @(
    (Join-Path $archive 'dark\canon-eos-60d\library-02\240s-1600iso')
  ) `
  -Fresh
```

### Run: 60D 2016 Unmodded Test

Purpose: decide whether the small 2016 unmodified set helps after separate calibration.

Inputs:

- lights: `20160109-yelagiri-ymca-flame-horsehead/good/unmodded`
- flats: curated 60D subset from `flat/20160109-yelagiri-ymca-flats/unsorted`, if appropriate
- darks: matching 60D library buckets where possible

Decision gate: because this set mixes 145s, 240s, and 300s frames, run it separately and compare master-level contribution later.

### Run: 2013 70mm Wide Field

Purpose: separate context master and optional low-frequency support.

Inputs:

- lights: `20130208-coorg-keemale-m42-flame-horsehead/180s-1600iso`
- lights: `20130208-coorg-keemale-m42-flame-horsehead/300s-1600iso`
- darks: matching 60D ISO1600 library buckets where possible
- flats: 2013 f/2.8 flats only if inspection shows they help despite the f/3.5 mismatch

Decision gate: do not use for fine Horsehead detail. Keep it separate unless it improves background/color at large scales.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-2013-70mm-widefield' `
  -LightDirs @(
    (Join-Path $archive 'by-date\20130208-coorg-keemale-m42-flame-horsehead\180s-1600iso'),
    (Join-Path $archive 'by-date\20130208-coorg-keemale-m42-flame-horsehead\300s-1600iso')
  ) `
  -DarkDirs @(
    (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso'),
    (Join-Path $archive 'dark\canon-eos-60d\library-02\240s-1600iso')
  ) `
  -Fresh
```

## Phase 2 — Master Review

For each WBPP output:

1. Inspect rejection maps.
2. Inspect star shapes and registration failures.
3. Check whether satellite trails survived.
4. Compare gradients before any color work.
5. Record accepted/rejected branches in [Processing journey](processing-journey.md).

Accepted masters then get registered to the best narrow-field reference.

## Phase 3 — Linear Processing

Suggested solve seed:

- RA: about `85.246`
- Dec: about `-2.458`

Order:

1. Crop only after registration artifacts are understood.
2. Background correction with care around IC 434 emission and Alnitak gradients.
3. Plate solve the accepted narrow-field masters.
4. SPCC the unmodified 60D broadband master if filter response and WCS are valid.
5. Mild linear noise reduction.
6. Prepare masks or channel extracts for modded-camera red/H-alpha enhancement.

First broadband Phase 2 command:

```powershell
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

Modified-camera support masters should currently run only through ABE and plate solving:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-2016-modded-good' `
  -Phase1Master (Join-Path $project 'work\wbpp-2016-modded-good\master\masterLight_BIN-1_4770x3178_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf') `
  -SolveRa 85.246 `
  -SolveDec -2.458 `
  -SolveFocal 386 `
  -SolvePixel 4.69 `
  -OnlyStage a `
  -Fresh
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-2016-modded-good' `
  -Phase1Master (Join-Path $project 'work\wbpp-2016-modded-good\master\masterLight_BIN-1_4770x3178_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf') `
  -SolveRa 85.246 `
  -SolveDec -2.458 `
  -SolveFocal 386 `
  -SolvePixel 4.69 `
  -OnlyStage b
```

Repeat the same pattern for `02-linear-2016-modded-washed-out-test`. Do not run SPCC on the modified-camera branches unless the purpose is a diagnostic; use the 60D branch as the broadband color anchor.

## Phase 4 — Master Combination

Build comparison branches:

1. 60D broadband only.
2. T1i modded only.
3. 60D broadband color plus T1i red/H-alpha enhancement.
4. Same as above plus the washed-out T1i test master, only if accepted.
5. Optional 70mm low-frequency support, only if accepted.

The expected best branch is 60D broadband color with carefully weighted T1i red/H-alpha signal.

Combination prep:

1. Use `work/02-linear-60d-20131231-geosats/02e-linear-nr.xisf` as the first geometric and color reference.
2. Register `work/02-linear-2016-modded-good/02b-solved.xisf` to that reference.
3. Register `work/02-linear-2016-modded-washed-out-test/02b-solved.xisf` to that reference separately.
4. Make comparison previews before any final decision: clean T1i only, washed-out T1i only, both T1i combined, 60D plus clean T1i red support, and 60D plus both T1i branches.
5. Accept the washed-out branch only if it improves IC 434/Horsehead S/N without adding large-scale haze around Alnitak or flattening the dark nebula.

Current helper scripts:

- `scripts/pjsr/register-to-reference.js` registers one solved support master to the 60D reference with StarAlignment distortion correction.
- `scripts/pjsr/blend-red-support.js` makes first-pass comparison blends by adding normalized positive T1i red-channel support to the 60D RGB base.
- `scripts/pjsr/render-cropped-reference-stf-jpeg.js` renders controlled previews with one crop and one reference-derived STF.
- `scripts/pjsr/roi-stats.js` reports fixed ROI statistics for candidate comparisons.
- `scripts/pjsr/crop-xisf.js` applies the chosen comparison crop to a linear XISF before nonlinear processing.
- `scripts/pjsr/03h-horsehead-v1-polish.js` performs the first target-specific nonlinear polish and exports v1 TIFF/JPEG products.

Current comparison outputs:

```text
work/04-combine/04a-rgb-plus-t1i-good-red-support.xisf
work/04-combine/04b-rgb-plus-t1i-good-washed-red-support.xisf
work/04-combine/04c-rgb-plus-t1i-good-washed-half-red-support.xisf
```

Current candidate: `04c`, the 60D RGB base plus clean T1i support and half-weight washed T1i support.

Treat the `04a` and `04b` branches as diagnostic linear products. They answer whether support signal helps; `04c` is the first branch worth taking through nonlinear refinement.

## Phase 5 — Nonlinear Processing

Goals:

- preserve the Horsehead as a dark silhouette without clipping it,
- keep IC 434 red emission visible but not oversaturated,
- control Alnitak and the Flame region,
- avoid letting the modified camera make the whole image unnaturally red,
- produce a tight Horsehead/Flame crop and, separately, a wider context version if the 70mm data is useful.

Current nonlinear checkpoint:

```text
work/03-nonlinear/03a-04c-linear-crop.xisf
work/03-nonlinear/03b-04c-maskedstretch.xisf
docs/images/horsehead-04c-maskedstretch-crop.jpg
```

Accepted v1 presentation result:

```text
work/03-nonlinear/03h-04c-v1-polish.xisf
work/03-nonlinear/horsehead-04c-v1-polish.tif
docs/images/horsehead-04c-v1-polish.jpg
```

Optional comparison:

```text
work/03-nonlinear/03i-04c-v1-polish-star-reduced.xisf
docs/images/horsehead-04c-v1-polish-star-reduced.jpg
```

Optional follow-up work:

1. Compare v1 on a calibrated display and decide whether the background is too dark.
2. If needed, make a brighter v1b with slightly less sky neutralization and a gentler black point.
3. Keep star reduction optional unless the field feels too busy at final display size.
4. Consider a separate tighter Horsehead crop for presentation.
