# Canis Major 2013-01-14 Processing Pipeline

This is the initial processing plan for the 2013 Canis Major wide-field data. It is tailored to Canon EOS 60D 10s ISO1600 frames from a Canon EF 50mm f/1.8 II lens at f/1.8, with Sirius and M41 as the main visual anchors.

For current source inventory, see [Status](status.md). For the chronological reasoning log, see [Processing journey](processing-journey.md). For target-specific research, see [Canis Major processing research](research/01-canis-major-processing.md). For historical artifacts, see [Original 2013 processing evidence](original-2013-processing.md).

## Processing Goals

1. Produce a natural wide-field Canis Major image with Sirius, M41, and the surrounding star field.
2. Preserve star color and the density variation of the Milky Way field.
3. Keep Sirius bright and recognizable without letting its halo dominate the whole composition.
4. Improve the old reference's star shape and background where the raw data allows.
5. Avoid synthetic stars, painted halos, cloned cleanup, or any generated sky content.
6. Use LLM-as-judge narrow crops for Sirius/halo, M41, corner stars, and representative background before accepting a branch.

## Phase 0 - Review And Setup

Project slug: `canis-major-2013-01-14`.

Recommended solve/SPCC defaults for `.env` or command-line overrides:

```text
PI_SOLVE_RA=102.75695
PI_SOLVE_DEC=-22.93256
PI_SOLVE_FOCAL_MM=50
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=8.5
PI_CFA_PATTERN=AUTO
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The solve seed is from the successful clean-frame ImageSolver result. Expected scale is about 17.8 arcsec/px and expected field of view is roughly 25.6 deg x 17.1 deg. Because this is a very wide field, ImageSolver and registration may need wide-field-friendly settings.

Leave CFA on `AUTO` for the first run. Only force a Bayer pattern after a dataset-specific diagnostic shows WBPP auto-detection is wrong.

## Phase 1 - Calibration And Integration

### Run A: No-Hallow Primary, Dark-Calibrated, No Flats

Purpose: first serious baseline from the more promising light group with matching 10s dark support.

Inputs:

- Lights: `by-date/20130114-yelagiri-ymca-canis-major/lights-cr2/no-hallow-group`
- Darks:
  - `dark/canon-eos-60d/library-02/10s-1600iso/30c`
  - `dark/canon-eos-60d/library-02/10s-1600iso/31c`
  - `dark/canon-eos-60d/library-02/10s-1600iso/32c`
  - `dark/canon-eos-60d/library-02/10s-1600iso/33c`
- Flats: none
- Bias: none

Template:

```powershell
$archive = '<local-archive-root>'
$project = '.\projects\canis-major-2013-01-14'
$lights = @((Join-Path $archive 'by-date\20130114-yelagiri-ymca-canis-major\lights-cr2\no-hallow-group'))
$darks = @(
  (Join-Path $archive 'dark\canon-eos-60d\library-02\10s-1600iso\30c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\10s-1600iso\31c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\10s-1600iso\32c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\10s-1600iso\33c')
)

& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20130114-no-hallow-dark30-33-noflats' `
  -LightDirs $lights `
  -DarkDirs $darks `
  -Fresh
```

Result: calibration, debayer, and subframe measurement succeeded for all 33 frames, but WBPP StarAlignment only registered 2 of 33 frames. The branch was rejected as a standard WBPP integration path.

Root cause / lesson: WBPP auto-selected a visibly poor reference frame with a doubled/jerked Sirius profile, and direct StarAlignment remained brittle even with a cleaner manual reference. Use the WCS recovery branch below for this target.

### Run A2: No-Hallow WCS Recovery Integration

Purpose: recover a usable integration from calibrated/debayered real frames when direct StarAlignment fails.

Steps used:

1. Use the calibrated/debayered outputs from Run A.
2. Exclude the visibly poor doubled-Sirius frame around `00h37m55s259ms`.
3. Plate-solve a clean frame around `00h37m32s383ms` and use it as the WCS reference.
4. Batch solve remaining calibrated/debayered frames.
5. Align solved frames with `AlignByCoordinates`.
6. Integrate the WCS-aligned frames.

Result:

| Step | Result |
| --- | --- |
| Batch WCS solve | 17/32 solved |
| Added clean one-off solved reference | 1 frame |
| WCS alignment | 18/18 aligned |
| Integration | 18 x 10s master |

Current master:

```text
work/master-wcs-no-hallow/masterLight_canis-major-20130114_no-hallow_18x10s_wcs_crop.xisf
```

This is the accepted Phase 1 master for the current branch.

### Run B: No-Hallow No-Dark / No-Flats Control

Purpose: test whether the dark master overcorrects the warmer frames or creates artifacts.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20130114-no-hallow-nodark-noflats-control' `
  -LightDirs $lights `
  -AllowNoDarks `
  -Fresh
```

Decision gate: keep only if it is cleaner than the dark-calibrated branch.

### Run C: Hallow Group Diagnostic

Purpose: only if the primary branch fails or if there is a reason to compare the alternate light group.

Inputs:

- Lights: `by-date/20130114-yelagiri-ymca-canis-major/lights-cr2/hallow-group`
- Darks: same library-02 30-33 C dark set
- Flats: none
- Bias: none

Initial read: reject/defer because preview frames show a broader Sirius halo and a weaker visible star field.

### Explicit Exclusions

- Do not use `lights-jpg` as science input.
- Do not use old TIFF/JPEG stack products as PixInsight inputs.
- Do not use `flat/20130211-f10-1by3200-1600iso` in the first pass; it does not match f/1.8 lens lights.
- Do not combine `hallow-group` and `no-hallow-group` until they are integrated and judged separately.

## Phase 2 - Linear Processing

For each accepted Phase 1 master:

1. Render linked and unlinked STF previews before changing the data.
2. Apply conservative background correction. This field is mostly stars, but fast-lens vignetting and gradients may be significant.
3. Plate solve with the Sirius/M41 seed and 50 mm focal length.
4. Run SPCC with Canon EOS 60D filters if WCS succeeds.
5. Use SCNR only if SPCC leaves an obvious green cast.
6. Keep a stock linear branch before any BXT/NXT.
7. If RC Astro is used, keep BXT/NXT conservative because the image is almost entirely stars and the 50mm lens may have real off-axis aberration.

Suggested Phase 2 command pattern:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-20130114-no-hallow-dark30-33-noflats' `
  -Phase1Master '<master-light-from-wbpp-20130114-no-hallow-dark30-33-noflats>' `
  -SolveRa 102.75695 `
  -SolveDec -22.93256 `
  -SolveFocal 50 `
  -SolvePixel 4.31 `
  -SolveMagnitude 8.5 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

Actual Phase 2 command used the WCS recovery master:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-wcs-no-hallow-18x10s' `
  -Phase1Master '.\projects\canis-major-2013-01-14\work\master-wcs-no-hallow\masterLight_canis-major-20130114_no-hallow_18x10s_wcs_crop.xisf' `
  -SolveRa 102.75695 `
  -SolveDec -22.93256 `
  -SolveFocal 50 `
  -SolvePixel 4.31 `
  -SolveMagnitude 8.5 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

Accepted Phase 2 output:

```text
work/02-linear-wcs-no-hallow-18x10s/02e-linear-nr.xisf
```

Potential Phase 2 risks:

- The normal plate-solve script may need wider-field settings.
- ABE can overcorrect the star-density gradient near the Milky Way.
- SPCC background neutralization may be biased if the field has too little empty background.
- BXT can make off-axis lens aberrations look brittle if pushed too hard.

## Phase 3 - Nonlinear Processing

Target-specific nonlinear priorities:

- Start with a conservative stretch that keeps star colors.
- Keep the with-stars image as the primary product.
- Avoid starless/star-recombination workflows unless a specific halo-control problem calls for them.
- Use masked curves for Sirius halo restraint instead of global highlight crushing.
- Keep background dark enough for star colors but not so black that faint star-field structure disappears.
- Make at least two framing candidates: full wide field and a Sirius/M41 crop.

Likely first candidate:

1. MaskedStretch or GHS-style stretch.
2. Mild curves for star color.
3. Optional masked highlight restraint around Sirius.
4. Mild saturation, no aggressive star reduction.

Actual current branch:

1. MaskedStretch with `targetBackground=0.085`.
2. Canis-specific v1/v2 polish: low-sky chroma cleanup, restrained highlight desaturation/compression, final curves, and mild saturation.
3. v2 uses stronger highlight desaturation than v1 to reduce the saturated Sirius core.

Current review candidate:

```text
work/03-nonlinear-wcs-no-hallow-18x10s/canis-major-2013-wcs-v2.jpg
docs/images/canis-major-2013-wcs-v2-review.jpg
```

## Phase 4 - LLM-As-Judge Review

Before accepting a final branch, create a small matched crop set:

| Crop | Purpose |
| --- | --- |
| Sirius core/halo | Checks clipping, halo shape, false color, and ringing |
| M41 cluster | Checks cluster contrast, star color, and star roundness |
| Corner star field | Checks 50mm lens aberration, registration, and BXT artifacts |
| Background/star-density transition | Checks gradients, color cast, and noise |

Judge concrete qualities first: star shapes, halo behavior, chroma noise, clipping, gradients, color cast, and whether the star field looks overprocessed.

Current v2 crop review:

- Sirius halo/core: acceptable; saturated core remains slightly pink but v2 is calmer than v1.
- M41 cluster: visible and recognizable.
- Corner star field: elongated/comatic stars remain and are treated as real lens/tracking limitations.
- Background/star-density transition: dark and dense with some noise, but not synthetic-looking.

Decision: keep v2 as the current review candidate and avoid aggressive BXT/star-reduction cleanup.

## Review Checkpoint

Before finalizing, provide:

- historical reference image;
- linked/unlinked WBPP previews;
- accepted Phase 2 linear linked-STF preview;
- best full-field nonlinear candidate;
- best tighter Sirius/M41 crop if useful;
- LLM-as-judge crop findings;
- rejected diagnostics with one-line reasons.

Review questions:

1. Is the full field or tighter Sirius/M41 framing more compelling?
2. Does Sirius need additional halo/core restraint?
3. Is the dark-calibrated branch better than the no-dark control?
4. Should the `hallow-group` be permanently rejected or processed as a sibling?
