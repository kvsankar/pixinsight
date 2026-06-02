# Orion Nebula / M42 2013 Processing Pipeline

This plan has produced an accepted February 2013 M42 final v1 presentation result, plus later BXT/NXT replacement diagnostics. After review, BXT/NXT is the preferred replacement direction; v3 is the current cleaner review candidate.

For the accepted output and caveats, see [Final v1](final-v1.md). For source inventory and open questions, see [Status](status.md). For web findings behind the HDR strategy, see [M42 processing research](research/01-m42-processing.md).

The project's first-party acquisition source is the [sankara.net Astrophotography page](https://sankara.net/astrophotography/), which confirms the February M42 image was shot with a Canon EF 70-200 mm f/2.8L IS II USM at 200 mm, stopped to f/3.5, on a Canon EOS 60D with an NEQ6 Pro GoTo mount.

## Processing Goals

1. Produce a February M42/M43 result with as much Trapezium/core detail as the data permits, using solved image scale rather than EXIF focal length as truth.
2. Avoid pretending HDR tools can recover clipped detail. If the core is saturated in every matching short exposure, document the limitation and make the best dynamic-range-compressed result possible.
3. Produce an optional January 2013 Orion context branch if the short 2013-01-13 data is worth finishing, but treat the EXIF-reported 50 mm focal length as provisional until plate solving confirms the true field scale.
4. Keep all branches reproducible and separate until master-level comparisons justify any blend.

## Phase 0 - Review And Setup

1. Confirm the project slug: `orion-nebula-m42-2013`.
2. Keep full local archive paths in `.env` or command invocations only.
3. Use archive-relative source paths in public docs.
4. Before processing, decide whether the ES ED80 trial folder is intentionally excluded.
5. Set solve defaults for M42:

```text
PI_SOLVE_RA=83.85
PI_SOLVE_DEC=-5.45
PI_SOLVE_PIXEL_UM=4.31
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

Use `PI_SOLVE_FOCAL_MM=200` as the initial guess for the February M42 branches because the first-party published page confirms the 200 mm lens setting. Still record the solved scale after Phase 2. For the January Orion branch, start with the EXIF-reported `PI_SOLVE_FOCAL_MM=50` only as a first solve guess; if solving lands elsewhere, update the branch name/docs to the solved focal length rather than the EXIF value.

## Phase 1 - Calibration And Integration

Run separate WBPP branches. Do not combine exposure lengths at the raw-frame stage.

Phase 1 diagnostic status:

- Complete: `wbpp-2013-m42-180s`
- Complete: `wbpp-2013-m42-180s-noflats`
- Complete: `wbpp-2013-m42-300s-nodark-test`
- Complete: `wbpp-2013-m42-300s-nodark-noflats`
- Complete as diagnostic only: `wbpp-2013-m42-60s-core-nodark-test`
- Attempted but no master: `wbpp-2013-m42-60s-core-test`

Phase 2 diagnostic status:

- Complete: `02-linear-2013-m42-180s-flat`
- Complete: `02-linear-2013-m42-180s-noflats`
- Complete: `02-linear-2013-m42-300s-flat-nodark`
- Complete as post-final diagnostic: `02-linear-2013-m42-180s-noflats-bxt-nxt`
- Complete as post-final diagnostic: `02-linear-2013-m42-300s-flat-nodark-bxt-nxt`
- Complete: registration of 300s and 60s diagnostic masters to the 180s no-flats grid
- Complete: nonlinear 180s no-flats refinement, crop/color revision, first 300s faint-support test, accepted final v1 export `m42-2013-v8-presentation.jpg`, BXT/NXT v1 review export `m42-2013-bxt-nxt-v1-presentation.jpg`, BXT/NXT v2 300s-support export `m42-2013-bxt-nxt-v2-presentation.jpg`, and cleaner BXT/NXT v3 no-300s export `m42-2013-bxt-nxt-v3-presentation.jpg`

Command examples below assume:

```powershell
$archive = '<local-archive>/pictures/astronomy/images'
$project = '.\projects\orion-nebula-m42-2013'
```

### Run: February M42 180s Baseline

Purpose: first clean M42 baseline with enough subs and plausible matched dark support.

Inputs:

- lights: `by-date/20130208-coorg-keemale-m42-flame-horsehead/180s-1600iso`
- darks: `dark/canon-eos-60d/library-01/180s-1600iso/33c`
- flats: historically 6 flats were used; the local candidate tested here is `flat/20130211-f2.8-1by8000-1600iso`

Completed command shape:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-2013-m42-180s' `
  -LightDirs @((Join-Path $archive 'by-date\20130208-coorg-keemale-m42-flame-horsehead\180s-1600iso')) `
  -DarkDirs @((Join-Path $archive 'dark\canon-eos-60d\library-01\180s-1600iso\33c')) `
  -FlatDirs @(
    (Join-Path $archive 'flat\20130211-f2.8-1by8000-1600iso')
  ) `
  -Fresh
```

No-flats control also completed with output subdir `wbpp-2013-m42-180s-noflats`.

Decision gate: carry both 180s branches into one controlled Phase 2 comparison. The flat-calibrated branch has better calibration metadata and less raw vignetting, but its linked-STF preview shows suspicious large-scale structure. The no-flats branch removes that variable but keeps lens vignetting.

### Run: February M42 300s Faint-Signal Test

Purpose: decide whether the long exposures improve outer nebulosity or mostly add saturation/gradient problems.

Inputs:

- lights: `by-date/20130208-coorg-keemale-m42-flame-horsehead/300s-1600iso`
- darks: none found yet
- flats: same historical 6-flat candidate as above; compare against no-flats if gradients or dust correction look wrong

Completed command shape:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-2013-m42-300s-nodark-test' `
  -LightDirs @((Join-Path $archive 'by-date\20130208-coorg-keemale-m42-flame-horsehead\300s-1600iso')) `
  -FlatDirs @((Join-Path $archive 'flat\20130211-f2.8-1by8000-1600iso')) `
  -AllowNoDarks `
  -Fresh
```

No-flats control also completed with output subdir `wbpp-2013-m42-300s-nodark-noflats`.

Decision gate: accept this branch only if it registers cleanly to the 180s master and improves faint structure without causing unacceptable halos or background haze.

### Run: February M42 60s Core Test

Purpose: test whether the sparse 60s data preserves core/Trapezium detail better than the 180s/300s masters.

Inputs:

- lights: `by-date/20130208-coorg-keemale-m42-flame-horsehead/060s-1600iso`
- darks: `dark/canon-eos-60d/library-02/60s-1600iso/31c`, `32c`, `33c`

Attempted command shape:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-2013-m42-60s-core-test' `
  -LightDirs @((Join-Path $archive 'by-date\20130208-coorg-keemale-m42-flame-horsehead\060s-1600iso')) `
  -DarkDirs @(
    (Join-Path $archive 'dark\canon-eos-60d\library-02\60s-1600iso\31c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-02\60s-1600iso\32c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-02\60s-1600iso\33c')
  ) `
  -Fresh
```

The curated ISO1600 run did not produce a master light because only two frames remained after registration. A separate no-dark diagnostic using all four 60s folder frames did produce `wbpp-2013-m42-60s-core-nodark-test`, but that master mixes ISO800 and ISO1600.

Decision gate: use the 60s diagnostic only if a core crop proves it preserves real core detail. It is not a clean final stack.

### Optional Run: January Orion Context 10s

Purpose: a separate constellation/sword context image, not a February M42 HDR source. The EXIF 50 mm value is only a provisional starting assumption.

Inputs:

- lights: `by-date/20130113-yelagiri-ymca-orion/1600iso/lights-cr2`
- darks: 10s ISO 1600 dark buckets around 33-39 C
- flats: none found

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-2013-orion-widefield-10s' `
  -LightDirs @((Join-Path $archive 'by-date\20130113-yelagiri-ymca-orion\1600iso\lights-cr2')) `
  -DarkDirs @(
    (Join-Path $archive 'dark\canon-eos-60d\library-01\010s-1600iso\33c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\010s-1600iso\34c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\010s-1600iso\35c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\010s-1600iso\36c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\010s-1600iso\37c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\010s-1600iso\38c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\010s-1600iso\39c')
  ) `
  -Fresh
```

## Phase 2 - Linear Processing

For each accepted Phase 1 master:

1. Render a linked-STF preview before changing the data.
2. Crop only enough to remove stacking edges.
3. Apply conservative background correction. For M42, avoid placing DBE samples on the bright nebula, M43, Running Man/NGC 1977, or large faint arcs.
4. Plate solve the integrated master with the focal length appropriate to the branch as an initial guess, then treat the solved focal length/image scale as authoritative.
5. Run SPCC on the main unmodified 60D branch if WCS succeeds and metadata is valid.
6. Apply mild linear noise reduction.
7. Export a diagnostic core crop for saturation comparison.

First Phase 2 comparison has been run on both 180s branches with identical settings:

- `wbpp-2013-m42-180s/master/masterLight_BIN-1_5202x3464_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf`
- `wbpp-2013-m42-180s-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-180.00s_FILTER-NoFilter_RGB_autocrop.xisf`

Command pattern:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-2013-m42-180s' `
  -Phase1Master '<master-light-from-wbpp-2013-m42-180s>' `
  -SolveRa 83.85 `
  -SolveDec -5.45 `
  -SolveFocal 200 `
  -SolvePixel 4.31 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

The solved scale was stable across both 180s branches: about 193.04-193.05 mm and 4.605 arcsec/px. Use the solved scale, not nominal EXIF, for downstream documentation.

Current baseline: `work/02-linear-2013-m42-180s-noflats/02e-linear-nr.xisf`.

Rationale: with the same Phase 2 treatment, the no-flats branch preserves more of M42's larger outer structure than the flat-calibrated branch. The flat-calibrated branch remains a fallback if later nonlinear work exposes unacceptable vignetting or background correction problems.

The 300s branch has also been run through Phase 2 and registered to the 180s no-flats grid:

- source: `work/02-linear-2013-m42-300s-flat-nodark/02e-linear-nr.xisf`
- registered: `work/registered-to-180s-noflats/300s-02e-linear-nr_to_180s_noflats.xisf`

Use this only as masked faint-signal support, not as the main baseline.

### Run: BXT/NXT Linear Diagnostic

Purpose: test the licensed RC Astro workflow on the accepted 180s no-flats baseline without carrying forward the old MLT denoise.

Input:

```text
work/02-linear-2013-m42-180s-noflats/02c-spcc.xisf
```

Settings:

```text
BlurXTerminator AI4:
  sharpenStars=0.18
  adjustHalos=0.03
  sharpenNonstellar=0.25
  autoNonstellarPsf=true

NoiseXTerminator AI3:
  colorSeparation=true
  frequencySeparation=true
  denoise=0.60
  denoiseColor=0.82
  denoiseLf=0.20
  denoiseLfColor=0.60
  frequencyScale=5
  iterations=2
  detail=0.18
```

Output:

```text
work/02-linear-2013-m42-180s-noflats-bxt-nxt/02h-bxt-nxt-scnr.xisf
docs/images/m42-2013-bxt-nxt-linear-linked-stf.jpg
```

Decision gate: compare close crops of the core, Running Man, faint outer haze, and representative dark sky before replacing final v1. The first BXT/NXT branch was preferred over the pre-BXT/NXT cut, then v2 added a fresh BXT/NXT version of the 300s faint-support layer.

### Run: BXT/NXT 300s Support Diagnostic

Purpose: make a fairer BXT/NXT comparison by processing the 300s support layer through the same plugin workflow before blending.

Input:

```text
work/02-linear-2013-m42-300s-flat-nodark/02c-spcc.xisf
```

Settings:

```text
BlurXTerminator AI4:
  sharpenStars=0.14
  adjustHalos=0.02
  sharpenNonstellar=0.18

NoiseXTerminator AI3:
  colorSeparation=true
  frequencySeparation=true
  denoise=0.68
  denoiseColor=0.88
  denoiseLf=0.28
  denoiseLfColor=0.70
  frequencyScale=5
  iterations=2
  detail=0.12
```

Output:

```text
work/02-linear-2013-m42-300s-flat-nodark-bxt-nxt/02h-bxt-nxt-scnr.xisf
work/registered-to-180s-bxt-nxt/300s-02h-bxt-nxt-scnr_to_180s_bxt_nxt.xisf
```

## Phase 3 - HDR And Master Combination

Only proceed if at least two February M42 masters register cleanly and the support layer improves the result.

1. Use the registered 300s support layer only where it improves faint outer nebulosity.
2. Make controlled previews with one crop and one reference stretch:
   - 180s only
   - 300s only
   - 60s diagnostic/core crop
   - HDR candidate
3. Do not use the current 60s diagnostic as a confident core replacement. It registered, but its core crop is too weak/sparse for a clean Trapezium-preserving HDR layer.
4. Use the 180s baseline with careful MaskedStretch/GHS and HDRMultiscaleTransform.
5. Document whether Trapezium preservation is data-supported or only approximated by dynamic range compression.

## Phase 4 - Nonlinear Processing

M42-specific nonlinear priorities:

- Preserve a luminous but structured core.
- Keep the Fish's Mouth and dark lanes visible without clipping them black.
- Avoid over-saturating the central magenta/red region.
- Keep M43 and the blue reflection nebulosity north of M42 from being neutralized away.
- Apply HDRMultiscaleTransform through a lightness or core mask; test layer counts rather than committing blindly.
- Use LocalHistogramEqualization sparingly and masked, especially around stars.
- Use star reduction only if the solved-scale February M42 field becomes distractingly busy.

Accepted nonlinear result:

- source: `work/02-linear-2013-m42-180s-noflats/02e-linear-nr.xisf`
- nonlinear branch: `work/03-nonlinear-2013-m42-180s-noflats-v1/`
- final JPEG: `docs/images/m42-2013-v8-presentation.jpg`

The accepted result uses a conservative MaskedStretch, M42 core mask, HDRMultiscaleTransform, mild LocalHistogramEqualization, highlight desaturation/compression, and a crop around M42/M43/Running Man. Final v1 is the v8 branch: it nudges the crop slightly back from v7, blends a quieter core variant into the richer 180s field, adds a conservative brighten-only registered-300s support blend for faint/background nebulosity, then applies a lighter final presentation polish. The 300s support improves haze visibility but adds some background texture; that tradeoff is accepted for final v1.

BXT/NXT diagnostics:

- source: `work/02-linear-2013-m42-180s-noflats-bxt-nxt/02h-bxt-nxt-scnr.xisf`
- v3 source: `work/02-linear-2013-m42-180s-noflats-bxt-nxt-v3/02h-bxt-nxt-scnr.xisf`
- v1 nonlinear branch: `work/03-nonlinear-2013-m42-bxt-nxt-v1/`
- v2 nonlinear branch: `work/03-nonlinear-2013-m42-bxt-nxt-v2/`
- v3 nonlinear branch: `work/03-nonlinear-2013-m42-bxt-nxt-v3/`
- v1 review JPEG: `docs/images/m42-2013-bxt-nxt-v1-presentation.jpg`
- v2 review JPEG: `docs/images/m42-2013-bxt-nxt-v2-presentation.jpg`
- v3 review JPEG: `docs/images/m42-2013-bxt-nxt-v3-presentation.jpg`
- comparison panels: `docs/images/m42-2013-v8-vs-bxt-nxt-v1-v2-comparison.jpg`, `docs/images/m42-2013-v8-vs-bxt-nxt-v1-v2-core-crop.jpg`, `docs/images/m42-2013-v8-vs-bxt-nxt-v1-v2-sky-crop.jpg`
- v3 comparison panels: `docs/images/m42-2013-v8-vs-bxt-nxt-v2-v3-comparison.jpg`, `docs/images/m42-2013-v8-vs-bxt-nxt-v2-v3-core-crop.jpg`, `docs/images/m42-2013-v8-vs-bxt-nxt-v2-v3-sky-crop.jpg`
- close crops: `docs/images/m42-2013-v8-vs-bxt-nxt-v1-core-crop.jpg`, `docs/images/m42-2013-v8-vs-bxt-nxt-v1-sky-crop.jpg`

The v1 plugin diagnostic reuses the v8 crop, rich/corequiet split, core blend, and final-presentation machinery, but with a gentler final lift because the BXT/NXT stretch already opens the faint field. Human review preferred it to the pre-BXT/NXT cut. V2 then adds freshly processed 300s support at a conservative blend amount. Later noise review demoted v2. V3 returns to an 180s-only branch with lower BXT sharpening, stronger NXT, darker stretch, reduced local contrast, no final faint-lift, and no 300s support; it is the current cleaner replacement candidate, pending final review.

Candidate outputs to prepare after review:

```text
docs/images/orion-m42-2013-original-finished-work.jpg
docs/images/orion-m42-2013-180s-baseline.jpg
docs/images/orion-m42-2013-hdr-candidate.jpg
docs/images/orion-2013-widefield-solvedscale.jpg
```

## Current Resume Plan

Final v1 is accepted. Future work is optional:

1. Process the January 2013 Orion wide-field/context data as a separate solved-scale branch.
2. Review BXT/NXT v2 against v1 and final v1 using the comparison panel and close crops.
3. If v2 is accepted, update Final v1 docs or create a new `final-v2` page and commit the plugin review assets.
4. Do not claim true Trapezium recovery unless a better short-exposure source is found.
