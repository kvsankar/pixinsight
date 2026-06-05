# M81 / M82 2014-03-03 Processing Pipeline

This is the processing plan and current record for the 2014 M81/M82 data. It is tailored to Canon EOS 60D 180s ISO1600 frames, solved ED80/reducer-scale framing, uncertain dark calibration, and a plausible but unproven flat set.

For current source inventory, see [Status](status.md). For the review checkpoint, see [Review checkpoint](review-2026-05-28.md). For the chronological reasoning log, see [Processing journey](processing-journey.md). For target-specific research, see [M81 / M82 processing research](research/01-m81-m82-processing.md). For historical artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Processing Goals

1. Produce a believable wide-field M81/M82 image with M81's yellow-white core, faint blue spiral arms, M82's dust lane/starburst structure, and natural star color.
2. Preserve low-surface-brightness galaxy halos and any faint outer arms while correcting real gradient and vignetting.
3. Avoid forcing M82 into exaggerated red emission; this is stock Canon EOS 60D broadband data.
4. Check whether SN 2014J is visible in M82 without turning the final image into an annotation exercise.
5. Use the historical finished-work image as a visual reference, not as ground truth.
6. Keep all machine-specific archive paths out of public docs and use archive-relative paths in notes.

## Phase 0 - Review And Setup

Project slug: `m81-m82-2014-03-03`.

Recommended solve/SPCC defaults for `.env` or command-line overrides:

```text
PI_SOLVE_RA=148.93
PI_SOLVE_DEC=69.37
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=10.0
PI_CFA_PATTERN=AUTO
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The solve seed is centered between M81 and M82. Phase 2 solved both tested branches at 386.19 mm and 2.302 arcsec/px, confirming the ED80/reducer-scale interpretation. EXIF `50.0 mm` is stale/unreliable.

For no-flats command examples, make sure `PI_FLAT_DIR` and `PI_FLAT_DIRS` are not set in `.env`, since the wrapper imports flat paths from the environment when present.

## Phase 1 - Calibration And Integration

Status:

- Complete/rejected as baseline: `wbpp-20140303-good-dark31-45-noflats`
- Complete/legacy baseline: `wbpp-20140303-good-nodark-noflats-control`
- Complete/accepted upstream branch: `wbpp-20140303-good-cool24-33-dark28-33-noflats`
- Deferred diagnostic: `wbpp-20140303-good-dark31-45-flat3200-test`

Command examples assume:

```powershell
$archive = '<local-archive-root>'
$project = '.\projects\m81-m82-2014-03-03'
$darkDirs = @(
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\31c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\35c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\36c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\37c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\39c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\40c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\41c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\42c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\43c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\44c'),
  (Join-Path $archive 'dark\canon-eos-60d\library-02\180s-1600iso\45c')
)
```

### Run: Primary Dark-Calibrated, No Flats

Purpose: first modern baseline mirroring the historical no-flats approach but using all 45 curated lights.

Inputs:

- Lights: `by-date/20140303-coorg-keemale-m81-m82/good`
- Darks: `dark/canon-eos-60d/library-02/180s-1600iso/*c`
- Flats: none
- Bias: none

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140303-good-dark31-45-noflats' `
  -LightDirs @((Join-Path $archive 'by-date\20140303-coorg-keemale-m81-m82\good')) `
  -DarkDirs $darkDirs `
  -Fresh
```

Outcome: completed, but rejected as baseline after Phase 2. Every light needed automatic pedestal, and the SPCC/SCNR/MLT preview showed severe red/blue vertical streaking.

### Run: No-Dark / No-Flats Control

Purpose: test whether the broad-temperature dark library hurts the cooler lights.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140303-good-nodark-noflats-control' `
  -LightDirs @((Join-Path $archive 'by-date\20140303-coorg-keemale-m81-m82\good')) `
  -AllowNoDarks `
  -Fresh
```

Outcome: completed and accepted as the first usable legacy baseline. It still has residual vertical patterning, but it produced a calmer solved/SPCC-calibrated linear checkpoint than the dark branch.

### Run: Cool-Light / Cool-Dark Diagnostic

Purpose: test whether dropping the hottest lights and using the smaller, cooler `library-01` dark set can reduce the vertical red/blue pattern noise that limited both the no-dark and broad warm-dark branches.

Inputs:

- Lights: 33 selected CR2 frames from `by-date/20140303-coorg-keemale-m81-m82/good`, limited to +24 through +33 C.
- Darks: `dark/canon-eos-60d/library-01/180s-1600iso/28c`, `31c`, `32c`, and `33c`, 15 CR2 darks total.
- Flats: none.
- Bias: none.

The actual run staged the selected lights under ignored project `work/` inputs, then ran WBPP as a named diagnostic:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140303-good-cool24-33-dark28-33-noflats' `
  -LightDirs @('<ignored-work-selected-cool-light-dir>') `
  -DarkDirs @(
    (Join-Path $archive 'dark\canon-eos-60d\library-01\180s-1600iso\28c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\180s-1600iso\31c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\180s-1600iso\32c'),
    (Join-Path $archive 'dark\canon-eos-60d\library-01\180s-1600iso\33c')
  ) `
  -Fresh
```

Outcome: completed. WBPP calibrated 33 lights, rejected 2 low-scoring frames, registered/integrated 31, and produced the accepted upstream master. Matched v4-geometry reference-STF crops showed the branch is much calmer than the warm-dark branch and cleaner than the no-dark branch, at the cost of lower total integration time.

### Run: 2014-03-02 Flat Diagnostic

Purpose: test whether the M81/M82-labeled ED80-era flats reduce vignetting without adding mismatch artifacts.

Inputs:

- Same lights and darks as the primary run
- Flats: `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2`

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140303-good-dark31-45-flat3200-test' `
  -LightDirs @((Join-Path $archive 'by-date\20140303-coorg-keemale-m81-m82\good')) `
  -DarkDirs $darkDirs `
  -FlatDirs @((Join-Path $archive 'flat\20140302-rosette-m81-m82-markarian\1by3200s\set-2')) `
  -Fresh
```

Decision gate: reject if the branch shows banding, rings, dust mismatch, color overcorrection, or worse galaxy halo preservation than the no-flats baseline.

## Phase 2 - Linear Processing

Status:

- Complete/rejected as baseline: `02-linear-20140303-good-dark31-45-noflats`
- Complete/accepted as legacy baseline: `02-linear-20140303-good-nodark-noflats-control`
- Complete/rejected diagnostic: `02-linear-20140303-good-nodark-bxt-nxt`
- Complete/deferred diagnostic: `02-linear-20140303-good-nodark-nxt-calm`
- Complete/accepted stock-linear diagnostic: `02-linear-20140303-good-cool24-33-dark28-33-noflats`
- Complete/demoted plugin comparison: `02-linear-20140303-good-cool24-33-dark28-33-bxt-nxt-calm`

For each accepted Phase 1 master:

1. Render a linked-STF preview before changing the data.
2. Preserve the raw integrated master as a checkpoint.
3. Apply background correction cautiously. Do not sample on M81's halo/spiral arms, M82's halo/outflow area, or the space between the galaxies if it contains residual low-surface signal.
4. Plate solve with the M81/M82 seed above.
5. Run SPCC with Canon EOS 60D filters if WCS succeeds.
6. Preserve a no-background-neutralization SPCC diagnostic if background sampling appears biased.
7. For stock-only diagnostics, apply only mild linear noise reduction.
8. For current RC Astro processing, skip stock MLT denoise and run BlurXTerminator followed by NoiseXTerminator while the image is still linear.

Primary Phase 2 command pattern:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-20140303-good-dark31-45-noflats' `
  -Phase1Master '<master-light-from-wbpp-20140303-good-dark31-45-noflats>' `
  -SolveRa 148.93 `
  -SolveDec 69.37 `
  -SolveFocal 386 `
  -SolvePixel 4.31 `
  -SolveMagnitude 10.0 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

Outcome: both tested branches solved successfully. The accepted no-dark branch solved with:

```text
Resolution: 2.302 arcsec/px
Focal distance: 386.19 mm
Field of view: 3d 8' 29.6" x 2d 9' 24.6"
Image center: RA 09h55m36.974s, Dec +69d29m31.34s
```

Potential Phase 2 risks:

- ABE can remove M81's faint outer halo or spiral arms if it treats them as gradient.
- M82's asymmetric dust and starburst shape are real structure; do not neutralize them away.
- If SPCC background neutralization makes the whole field muddy or green-brown, keep a no-BN branch.
- If solving fails at the ED80/reducer seed, inspect the raw master and logs before trusting EXIF `50.0 mm`.

### Run: Original No-Dark BXT/NXT Linear Branch

Purpose: test the licensed RC Astro workflow on the accepted no-dark baseline without carrying forward the old MLT denoise.

Input:

```text
work/02-linear-20140303-good-nodark-noflats-control/02c-spcc.xisf
```

Settings:

```text
BlurXTerminator AI4:
  sharpenStars=0.25
  adjustHalos=0.03
  sharpenNonstellar=0.35
  autoNonstellarPsf=true

NoiseXTerminator AI3:
  colorSeparation=true
  frequencySeparation=true
  denoise=0.70
  denoiseColor=0.88
  denoiseLf=0.30
  denoiseLfColor=0.80
  frequencyScale=5
  iterations=3
```

Outcome: completed but rejected as a presentation branch. The BXT/NXT linear checkpoint is:

```text
work/02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
```

Visual review of a background crop showed worse colored scratch/streak noise than the legacy v4 branch. A subsequent NXT-only diagnostic from `02d-scnr.xisf` reduced chroma in the darker v2 version but still left higher luminance texture than v4. A closer M81 crop then showed v4 is also compromised by vertical colored streaking, so no nonlinear/plugin branch is accepted as final.

### Run: Cool-Dark BXT/NXT Calm Branch

Purpose: retest the licensed RC Astro workflow after the upstream cool-light/cool-dark diagnostic reduced the colored vertical pattern noise.

Input:

```text
work/02-linear-20140303-good-cool24-33-dark28-33-noflats/02c-spcc.xisf
```

Settings were intentionally calmer than the rejected no-dark plugin branch:

```text
BlurXTerminator AI4:
  sharpenStars=0.16
  adjustHalos=0.01
  sharpenNonstellar=0.22
  autoNonstellarPsf=true

NoiseXTerminator AI3:
  colorSeparation=true
  frequencySeparation=true
  denoise=0.56
  denoiseColor=0.76
  denoiseLf=0.18
  denoiseLfColor=0.58
  frequencyScale=4
  iterations=2
  detail=0.10
```

Outcome: completed and kept as a comparison branch after SN-preserve v2 was accepted. The linear checkpoint is:

```text
work/02-linear-20140303-good-cool24-33-dark28-33-bxt-nxt-calm/02g-bxt-nxt.xisf
```

## Phase 3 - Nonlinear Processing

Target-specific nonlinear priorities:

- Start with a conservative MaskedStretch or GHS-style stretch.
- Protect M81's core while lifting spiral arms and outer halo.
- Preserve M82's edge-on contrast and dark lane without turning the galaxy too magenta or red.
- Use star masks to keep the wide field from becoming star-dominated.
- Keep a wide pair presentation first; crop only after comparing against the historical reference.
- Consider an annotated review copy for SN 2014J, but keep the primary aesthetic candidate unmarked.

Candidate set:

1. Accepted final v1: cool-light/cool-dark SN-preserve v2 from the accepted cool-light/cool-dark upstream branch.
2. Cool-light/cool-dark BXT/NXT calm candidate as a background-clean comparison only; it makes M82/SN too overexposed/smoothed.
3. Stock cool-light/cool-dark candidate if the SN-preserve branch feels too dark/subtle.
4. No-dark/no-flats v4 candidate as a legacy reference only.
5. Flat-diagnostic candidate only if the flat branch clearly improves vignetting/background without artifacts.
6. Dark-calibrated broad warm-dark candidate is rejected as baseline.

Status:

- Complete: MaskedStretch checkpoint, `work/03-nonlinear-20140303-nodark-v1/03a-maskedstretch.xisf`
- Complete: M81/M82 v1 polish script, `scripts/pjsr/03u-m81-m82-v1-polish.js`
- Complete: v1 crop, `docs/images/m81-m82-20140303-v1-crop.jpg`
- Complete: v2 calm-sky crop, `docs/images/m81-m82-20140303-v2-calm-sky-crop.jpg`
- Complete: v3 recentered detail crop, `docs/images/m81-m82-20140303-v3-detail-recentered-crop.jpg`
- Complete: v4 tighter detail crop, `docs/images/m81-m82-20140303-v4-detail-tight-crop.jpg`
- Complete/rejected: BXT/NXT v1 tight crop, `docs/images/m81-m82-20140303-bxt-nxt-v1-tight-crop.jpg`
- Complete/diagnostic: NXT-only v2 dark tight crop, `docs/images/m81-m82-20140303-nxt-calm-v2-dark-tight-crop.jpg`
- Complete/current stock cool-dark proof: `docs/images/m81-m82-20140303-cooldark-v1-tight-crop.jpg`
- Complete/demoted BXT/NXT calm comparison: `docs/images/m81-m82-20140303-cooldark-bxt-nxt-calm-v1-tight-crop.jpg`
- Complete/accepted final v1: `docs/images/m81-m82-20140303-final-v1.jpg`
- Complete/accepted SN-preserve branch: `docs/images/m81-m82-20140303-cooldark-sn-preserve-v2-tight-crop.jpg`

The accepted final v1 is a 20% tighter presentation crop from the cool-light/cool-dark SN-preserve v2 tight crop. It removes the half-in/half-out edge galaxy above M81, reduces the objectionable vertical red/blue streaking that blocked v4, and avoids the over-bright/smoothed M82 core of the BXT/NXT calm crop. It is intentionally subtler and uses only 31 integrated frames with no-flat/archive-limited background constraints.

The SN-preserve branch uses `scripts/pjsr/03u-m81-m82-sn-preserve.js`, which hard-applies a low-background STF through HistogramTransformation and then uses restrained curves only. It intentionally skips BXT/NXT, HDRMT, and LHE so point-like structure in M82 is not smoothed into the galaxy core.

SN-preserve v2 settings:

```text
Input: work/02-linear-20140303-good-cool24-33-dark28-33-noflats/02e-linear-nr.xisf
targetBackground=0.115
shadows=-2.8
k07=0.043
k22=0.205
k52=0.525
k83=0.850
satAmount=0.038
```

This project is closed for this processing pass. Any future v2 work should start from the cool-light/cool-dark branch, not the old no-dark branch. The only meaningful upstream test left is the same-trip flat set against the cool-light/cool-dark selection.

## Final Checkpoint

Accepted final and retained comparison set:

- historical reference: `docs/images/original-2014-finished-work.jpg`;
- linked-STF WBPP preview;
- cool-dark Phase 2 linear linked-STF preview;
- accepted final v1: `docs/images/m81-m82-20140303-final-v1.jpg`;
- accepted cool-dark SN-preserve branch: `docs/images/m81-m82-20140303-cooldark-sn-preserve-v2-tight-crop.jpg`;
- BXT/NXT calm and stock cool-dark proofs for comparison;
- unmarked and approximate annotated M82/SN close crops;
- rejected diagnostics with one-line reasons.

Final decision:

1. Accept the 20% tighter SN-preserve v2 crop as final v1.
2. Keep the marked SN 2014J crop as review context only.
3. Keep BXT/NXT calm as a comparison branch because it is cleaner but over-smooths/over-brightens M82.
4. Stop further processing for this pass.
