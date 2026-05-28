# M45 / Pleiades 2013-12-30 Processing Pipeline

This is the review-ready plan and current processing record for the 2013 Pleiades data. It is tailored to Canon EOS 60D, solved ED80/reducer-scale 240s ISO1600 frames, with matching-duration dark support and no trusted flats.

For current source inventory, see [Status](status.md). For the review checkpoint, see [Review checkpoint](review-2026-05-27.md). For the chronological reasoning log, see [Processing journey](processing-journey.md). For target-specific research, see [M45 / Pleiades processing research](research/01-m45-pleiades-processing.md). For historical artifacts, see [Original 2013 processing evidence](original-2013-processing.md).

## Processing Goals

1. Produce a believable M45 image with bright blue-white cluster stars, blue reflection nebulosity, and visible dust structure.
2. Avoid flattening real reflection dust while correcting vignetting and sky gradient.
3. Preserve star halos without letting them dominate the whole frame.
4. Use the historical finished-work image as a visual reference, not as ground truth.
5. Keep all machine-specific archive paths out of public docs and use archive-relative paths in notes.

## Phase 0 - Review And Setup

Project slug: `m45-pleiades-2013-12-30`.

Recommended solve/SPCC defaults for `.env` or command-line overrides:

```text
PI_SOLVE_RA=56.75
PI_SOLVE_DEC=24.12
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=9.5
PI_CFA_PATTERN=AUTO
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The solve seed is centered on M45. Phase 2 solved at 386.02 mm and 2.303 arcsec/px, confirming the ED80/reducer-scale interpretation. EXIF says `50.0 mm`, but the blank lens model, `FNumber=0`, same-night Andromeda precedent, and historical framing make that value stale/unreliable.

Leave CFA on `AUTO` for the first run. Only force a Bayer pattern after a dataset-specific diagnostic shows WBPP auto-detection is wrong.

For no-flats command examples, make sure `PI_FLAT_DIR` and `PI_FLAT_DIRS` are not set in `.env`, since the wrapper imports flat paths from the environment when present.

## Phase 1 - Calibration And Integration

Status:

- Complete: `wbpp-20131230-good-dark25-30-noflats`
- Complete/rejected as baseline: `wbpp-20131230-good-nodark-noflats-control`
- Deferred: `wbpp-20131230-good-flat-test`

Do not mix the January 2013 Jupiter/Pleiades wide-field data with the December 2013 M45 raw frames. They differ in date, optic, exposure, ISO, temperature, framing, and intent.

Command examples assume:

```powershell
$archive = '<local-archive-root>'
$project = '.\projects\m45-pleiades-2013-12-30'
```

### Run: December 2013 Primary, Dark-Calibrated, No Flats

Purpose: first clean baseline from the curated M45 good frames.

Inputs:

- Lights: `by-date/20131230-coorg-keemale-m45-pleiades/good`
- Darks: `dark/canon-eos-60d/library-02/240s-1600iso`
- Flats: none
- Bias: none

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20131230-good-dark25-30-noflats' `
  -LightDirs @((Join-Path $archive 'by-date\20131230-coorg-keemale-m45-pleiades\good')) `
  -DarkDirs @((Join-Path $archive 'dark\canon-eos-60d\library-02\240s-1600iso')) `
  -Fresh
```

Expected master naming may differ slightly by PixInsight/WBPP version, but the likely exposure group is `EXPOSURE-240.00s`.

Outcome: accepted as the baseline. WBPP registered all 12 lights and produced autocropped and uncropped master lights. Calibration applied automatic pedestals after detecting negative or insignificant sample values, so a no-dark control was run for comparison.

### Run: No-Dark / No-Flats Control

Purpose: test whether the +25 to +30 C dark library overcorrects some lights, especially the +27 C frames or +31 C frames lacking exact dark matches.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20131230-good-nodark-noflats-control' `
  -LightDirs @((Join-Path $archive 'by-date\20131230-coorg-keemale-m45-pleiades\good')) `
  -AllowNoDarks `
  -Fresh
```

Outcome: completed and rejected as baseline. The no-dark linked-STF preview shows stronger broad-field gradient and no clear color advantage over the dark-calibrated master.

### Run: Late Flat Diagnostic

Purpose: test whether ED80-era flats can help with vignetting.

Inputs:

- Same M45 lights and darks as the primary run
- Flats: `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2`

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20131230-good-flat-test' `
  -LightDirs @((Join-Path $archive 'by-date\20131230-coorg-keemale-m45-pleiades\good')) `
  -DarkDirs @((Join-Path $archive 'dark\canon-eos-60d\library-02\240s-1600iso')) `
  -FlatDirs @((Join-Path $archive 'flat\20140302-rosette-m81-m82-markarian\1by3200s\set-2')) `
  -Fresh
```

Decision gate: do not run this unless v2 specifically targets vignetting/background modeling. Reject if it introduces rings, banding, dust mismatch, or color overcorrection.

## Phase 2 - Linear Processing

Status:

- Complete: `02-linear-20131230-good-dark25-30-noflats`

For each accepted Phase 1 master:

1. Render a linked-STF preview before changing the data.
2. Preserve the raw integrated master as a checkpoint.
3. Apply background correction cautiously. M45 reflection dust is target signal, not background.
4. Plate solve with the M45 seed above.
5. Run SPCC with Canon EOS 60D filters if WCS succeeds.
6. Preserve an SPCC no-background-neutralization comparison if the default SPCC result bleaches the blue dust.
7. Apply only mild linear noise reduction.

Primary Phase 2 command pattern:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-20131230-good-dark25-30-noflats' `
  -Phase1Master '<master-light-from-wbpp-20131230-good-dark25-30-noflats>' `
  -SolveRa 56.75 `
  -SolveDec 24.12 `
  -SolveFocal 386 `
  -SolvePixel 4.31 `
  -SolveMagnitude 9.5 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

Potential Phase 2 risks:

- The default scripted ABE is a useful first diagnostic, but it may subtract real reflection dust. Inspect `02a-abe.xisf` before accepting the downstream linear checkpoint.
- If ImageSolver fails at the ED80/reducer seed, try the real solved scale from a visually inspected master before assuming EXIF `50.0 mm` is true.
- If SPCC background neutralization makes the reflection dust gray or suppresses blue signal, keep a no-BN comparison branch.
- SCNR should be light. Heavy green removal can leave the field unnaturally magenta or cyan.

Outcome: ABE, ImageSolver, SPCC, SCNR, and MLT completed. ImageSolver selected 2500 of 9979 target stars and solved with:

```text
Resolution: 2.303 arcsec/px
Focal distance: 386.02 mm
Field of view: 3d 17' 31.3" x 2d 12' 39.2"
Image center: RA 03h46m42.722s, Dec +24d06m26.79s
```

The Phase 2 linked-STF preview is usable but still has cyan/blue-green dust color, so nonlinear color shaping is part of the first candidate path.

## Phase 3 - Nonlinear Processing

Target-specific nonlinear priorities:

- Start with a conservative MaskedStretch or GHS-style stretch.
- Protect bright star cores and halos.
- Lift blue reflection dust through masks rather than global saturation.
- Preserve dark dust contrast without crushing the background.
- Keep a with-stars presentation as the primary candidate.
- Test star separation or star reduction only after a clean baseline exists.

Status:

- Complete: MaskedStretch checkpoint, `work/03-nonlinear-20131230-v1/03a-maskedstretch.xisf`
- Complete: M45 v1 polish, `work/03-nonlinear-20131230-v1/03p-m45-v1-polish.xisf`
- Complete: review JPEG, `docs/images/m45-20131230-v1-polish.jpg`
- Complete: v2 portrait crop, `work/03-nonlinear-20131230-v1/03p-m45-v2-portrait-crop.xisf`
- Complete: v2 crop JPEG/TIFF exports, `docs/images/m45-20131230-v2-portrait-crop.jpg` and `work/03-nonlinear-20131230-v1/m45-20131230-v2-portrait-crop.tif`

Current candidate set:

1. Clean calibrated candidate from the primary dark/no-flats branch.
2. Historical-reference candidate is deferred unless v1 is too subdued.
3. No-dark control candidate is rejected as baseline.
4. Flat diagnostic candidate is deferred unless the no-flats result is blocked by vignetting.

The current v2 crop is a portrait presentation from the darker, cleaner v1 polish. It prioritizes plausible blue reflection dust, calm background, and restrained star halos over matching the older brighter/cooler presentation.

## Review Checkpoint

Before finalizing, provide:

- historical reference: `docs/images/original-2013-finished-work.jpg`;
- linked-STF WBPP preview;
- accepted Phase 2 linear linked-STF preview;
- clean nonlinear candidate;
- old-reference-style candidate if different;
- rejected diagnostics with one-line reasons.

Review questions:

1. Is the v2 portrait crop preferable to the full-frame v1 landscape view?
2. Is the cleaner modern background preferable to the older finished-work look?
3. Is the blue reflection dust strong enough, or should we test a more assertive dust-lift branch?
4. Are bright star halos natural enough, or do they need masked restraint?

## Next Optional Work

1. Build a brighter old-reference branch from the v1 polish if the current modern candidate feels too subdued.
2. Try manual DBE/MGC-style background modeling before the nonlinear stretch if more dust can be preserved without keeping vignetting.
3. Test a late flat diagnostic only if vignetting becomes the main blocker.
