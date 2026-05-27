# Trifid / Lagoon 2014 Processing Pipeline

This is the review-ready plan for the 2014 Trifid/Lagoon data. It is tailored to Canon EOS 60D, likely ES ED80 with reducer, 120s ISO1600 frames, with one clean May session and one earlier March session.

For current source inventory and review questions, see [Status](status.md). For the current visual checkpoint, see [Review checkpoint](review-2026-05-27.md). For research notes, see [Trifid / Lagoon processing research](research/01-trifid-lagoon-processing.md). For historical artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Processing Goals

1. Produce a wide-field Sagittarius image where M8 and M20 are both recognizable, with M8's red emission, M20's red/blue split, and the dark lanes preserved.
2. Keep the Milky Way background believable. This field contains real nebulosity and dust, so gradient correction must not flatten everything into neutral gray.
3. Build a May-only baseline before attempting cross-session blending.
4. Treat March as a separate comparison/support master unless review confirms it should be co-equal.
5. Keep all machine-specific archive paths out of public docs and use archive-relative paths in notes.

## Phase 0 - Review And Setup

Project slug: `trifid-lagoon-2014`.

Recommended solve/SPCC defaults for `.env` or command-line overrides:

```text
PI_SOLVE_RA=270.75
PI_SOLVE_DEC=-23.70
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=8.5
PI_CFA_PATTERN=AUTO
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The solve seed is centered between M8 and M20. Treat the solved focal length/scale as authoritative after Phase 2. The EXIF `50.0 mm` value is probably unreliable here, as with other ES ED80/reducer sessions.

Leave CFA on `AUTO` for the first run. Only force a Bayer pattern after a dataset-specific diagnostic shows WBPP auto-detection is wrong.

For no-flats command examples, make sure `PI_FLAT_DIR` and `PI_FLAT_DIRS` are not set in `.env`, since the current wrapper imports flat paths from the environment when present.

## Phase 1 - Calibration And Integration

Status:

- Complete: `wbpp-20140504-good-dark33-34-noflats`
- Complete: `wbpp-20140302-good-nodark-noflats`
- Rejected diagnostic: `wbpp-20140302-good-flat-nodark-test`
- Not run: May flat diagnostic
- Not run: May no-dark control

Do not mix March and May raw frames in the first run. The two sessions should be integrated separately because sky gradients, camera temperature, framing, and calibration quality may differ.

Command examples assume:

```powershell
$archive = '<local-archive>/pictures/astronomy/images'
$project = '.\projects\trifid-lagoon-2014'
```

### Run: May 2014 Primary, Dark-Calibrated, No Flats

Purpose: first clean baseline from the curated May good frames.

Inputs:

- Lights: `by-date/20140504-yelagiri-kairos-trifid-lagoon-2/good`
- Darks: `dark/canon-eos-60d/library-02/120s-1600iso/33c`, `34c`
- Flats: none
- Bias: none

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140504-good-dark33-34-noflats' `
  -LightDirs @((Join-Path $archive 'by-date\20140504-yelagiri-kairos-trifid-lagoon-2\good')) `
  -DarkDirs @(
    (Join-Path $archive 'dark\canon-eos-60d\library-02\120s-1600iso\33c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-02\120s-1600iso\34c')
  ) `
  -Fresh
```

Expected master naming may differ slightly by PixInsight/WBPP version, but the likely exposure group is `EXPOSURE-120.00s`.

Decision gate: accept this as the baseline if registration succeeds, hot pixels are controlled, and the linked-STF preview shows no obvious dark overcorrection.

### Run: May 2014 Flat Diagnostic

Purpose: test whether the March 2014 ED80/reducer-era flats help or harm the May data.

Inputs:

- Same May lights and 33/34 C darks as the primary run
- Flats: `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2`

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140504-good-flat-test' `
  -LightDirs @((Join-Path $archive 'by-date\20140504-yelagiri-kairos-trifid-lagoon-2\good')) `
  -DarkDirs @(
    (Join-Path $archive 'dark\canon-eos-60d\library-02\120s-1600iso\33c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-02\120s-1600iso\34c')
  ) `
  -FlatDirs @((Join-Path $archive 'flat\20140302-rosette-m81-m82-markarian\1by3200s\set-2')) `
  -Fresh
```

Decision gate: keep this branch only if it reduces vignetting without creating dust, ring, color, or overcorrection artifacts. Because the flats are not same-night May flats and no matching flat-darks/bias were found, the no-flats branch remains the baseline until visual evidence says otherwise.

### Run: May 2014 No-Dark Control

Purpose: diagnose whether 33/34 C darks overcorrect the cooler May frames.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140504-good-nodark-noflats-control' `
  -LightDirs @((Join-Path $archive 'by-date\20140504-yelagiri-kairos-trifid-lagoon-2\good')) `
  -AllowNoDarks `
  -Fresh
```

Decision gate: run only if the dark-calibrated branch shows black specks, clipped pixels, or stronger color patterning than expected.

### Run: March 2014 Comparison Branch

Purpose: reconstruct the older Trifid/Lagoon session separately, then decide whether it is useful as support.

Inputs:

- Lights: `by-date/20140302-coorg-keemale-trifid-lagoon/good`
- Darks: start with no-dark control, because the March lights are +24 to +30 C and only 33 to 36 C 120s darks were found
- Flats: `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` or no-flats comparison

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140302-good-flat-nodark-test' `
  -LightDirs @((Join-Path $archive 'by-date\20140302-coorg-keemale-trifid-lagoon\good')) `
  -FlatDirs @((Join-Path $archive 'flat\20140302-rosette-m81-m82-markarian\1by3200s\set-2')) `
  -AllowNoDarks `
  -Fresh
```

Decision gate: compare March as its own image first. Register/blend it with the May master only if the solved scale, framing, star shapes, and background behavior are compatible.

Outcome so far: the March flat/no-dark branch is rejected because it showed obvious flat mismatch and banding. The March no-dark/no-flats branch is the preferred review baseline.

## Phase 2 - Linear Processing

Status:

- Complete: `02-linear-20140504-good-dark33-34-noflats`
- Complete: SPCC no-background-neutralization comparison from the solved May master
- Complete: `02-linear-20140302-good-nodark-noflats`
- Rejected diagnostic: `02-linear-20140302-good-nodark-noflats-noabe`
- Rejected diagnostic: `02-linear-20140302-good-nodark-noflats-abe-divide-test`

For each accepted Phase 1 master:

1. Render a linked-STF preview before changing the data.
2. Crop only enough to remove stacking edges.
3. Use conservative background correction. Prefer manual DBE or a carefully reviewed MGC/DBE branch over aggressive ABE if the nebulae or Milky Way dust are being treated as background.
4. Plate solve with the M8/M20 seed above.
5. Run SPCC with Canon EOS 60D filters if WCS succeeds.
6. Preserve an SPCC no-background-neutralization comparison if background neutralization suppresses the red emission or blue reflection signal.
7. Apply mild linear noise reduction only after background/color behavior looks sane.

Phase 2 command pattern:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-20140504-good-dark33-34-noflats' `
  -Phase1Master '<master-light-from-wbpp-20140504-good-dark33-34-noflats>' `
  -SolveRa 270.75 `
  -SolveDec -23.70 `
  -SolveFocal 386 `
  -SolvePixel 4.31 `
  -SolveMagnitude 8.5 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

Potential Phase 2 risks:

- The Sagittarius star field is dense; plate solving may need a shallower magnitude limit and target-star limiter tuning.
- A default background ROI may contain Milky Way dust or faint nebulosity. If SPCC background neutralization looks wrong, rerun SPCC with a reviewed ROI or neutralization disabled.
- ED80/reducer data can have vignetting and field-shape issues, especially without trusted flats. Keep solved scale and crop decisions in the status log.

## Phase 3 - Master Comparison And Optional Combination

Only combine masters after separate Phase 2 outputs exist.

Candidate comparisons:

1. May dark-calibrated no-flats baseline.
2. March no-dark/no-flats baseline.
3. May flat diagnostic only if the May branch becomes active again.
4. May no-dark control only if dark overcorrection becomes a concern.
5. Registered March-to-May support blend only if it improves faint Milky Way/nebulosity without introducing gradient mismatch.

Comparison previews should use one crop and one reference STF/stretch where possible, so branch differences are not hidden by display settings.

## Phase 4 - Nonlinear Processing

Status:

- Complete: `work/03-nonlinear-20140504-may-v1/03a-maskedstretch.xisf`
- Complete: `work/03-nonlinear-20140504-may-v1/03t-v1-polish.xisf`
- Complete: May old-reference variants `trifid-lagoon-20140504-v2-oldref-polish.jpg` and `trifid-lagoon-20140504-v3-oldref-lift.jpg`
- Complete: March old-reference variants `trifid-lagoon-20140302-march-oldref-polish.jpg` and `trifid-lagoon-20140302-march-oldref-vivid.jpg`
- Preferred review direction: March old-reference variants

Target-specific nonlinear priorities:

- Preserve M8 as warm red/pink emission, not clipped orange.
- Preserve M20's mixed red emission, blue reflection, and dark dust lanes.
- Keep surrounding Sagittarius Milky Way texture instead of crushing it into a flat background.
- Use saturation through luminance/range masks so background chroma noise does not dominate.
- Use star reduction or star separation only after a clean baseline exists; the field is star-rich, but over-reducing stars can make the Milky Way look unnatural.
- If StarXTerminator is used, keep starless and stars layers as documented intermediates under `work/`, then export only small comparison JPEGs to docs.

Candidate outputs after review and processing:

```text
docs/images/trifid-lagoon-2014-may-baseline.jpg
docs/images/trifid-lagoon-2014-march-comparison.jpg
docs/images/trifid-lagoon-2014-final-candidate.jpg
```

## Current Resume Plan

1. Review `docs/images/trifid-lagoon-20140302-march-oldref-polish.jpg` and `docs/images/trifid-lagoon-20140302-march-oldref-vivid.jpg` against `docs/images/original-2014-attempt-02-asraw-ps-2.jpg`.
2. Pick the final tuning direction:
   - balanced PixInsight finish: start from `march-oldref-polish`,
   - brighter 2014-reference finish: start from `march-oldref-vivid`,
   - cleaner but darker comparison: revisit May v3.
3. Keep the rejected diagnostic previews in docs as evidence: March flats, no-ABE, and ABE-divide should not be reused as defaults.
4. Decide whether the next pass should add star reduction/starless control, or keep the dense Sagittarius star field natural.
