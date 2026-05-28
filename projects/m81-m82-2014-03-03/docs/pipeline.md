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
- Complete/accepted as baseline: `wbpp-20140303-good-nodark-noflats-control`
- Deferred diagnostic: `wbpp-20140303-good-dark31-45-flat3200-test`
- Deferred diagnostic: cool-dark branch using `dark/canon-eos-60d/library-01/180s-1600iso/*c`

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

Outcome: completed and accepted as the current baseline. It still has residual vertical patterning, but it produced a calmer solved/SPCC-calibrated linear checkpoint than the dark branch.

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

### Run: BXT/NXT Linear Branch

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

## Phase 3 - Nonlinear Processing

Target-specific nonlinear priorities:

- Start with a conservative MaskedStretch or GHS-style stretch.
- Protect M81's core while lifting spiral arms and outer halo.
- Preserve M82's edge-on contrast and dark lane without turning the galaxy too magenta or red.
- Use star masks to keep the wide field from becoming star-dominated.
- Keep a wide pair presentation first; crop only after comparing against the historical reference.
- Consider an annotated review copy for SN 2014J, but keep the primary aesthetic candidate unmarked.

Candidate set:

1. Clean no-dark/no-flats candidate from the accepted no-dark branch.
2. Flat-diagnostic candidate only if the flat branch clearly improves vignetting without artifacts.
3. Dark-calibrated candidate is rejected as baseline.
4. Old-reference-style candidate if the clean candidate is too subdued compared with the 2014 finished-work image.

Status:

- Complete: MaskedStretch checkpoint, `work/03-nonlinear-20140303-nodark-v1/03a-maskedstretch.xisf`
- Complete: M81/M82 v1 polish script, `scripts/pjsr/03u-m81-m82-v1-polish.js`
- Complete: v1 crop, `docs/images/m81-m82-20140303-v1-crop.jpg`
- Complete: v2 calm-sky crop, `docs/images/m81-m82-20140303-v2-calm-sky-crop.jpg`
- Complete: v3 recentered detail crop, `docs/images/m81-m82-20140303-v3-detail-recentered-crop.jpg`
- Complete: v4 tighter detail crop, `docs/images/m81-m82-20140303-v4-detail-tight-crop.jpg`
- Complete/rejected: BXT/NXT v1 tight crop, `docs/images/m81-m82-20140303-bxt-nxt-v1-tight-crop.jpg`
- Complete/diagnostic: NXT-only v2 dark tight crop, `docs/images/m81-m82-20140303-nxt-calm-v2-dark-tight-crop.jpg`

No current presentation branch is accepted as final. The legacy v4 tighter detail crop remains the least-bad reference, but close-crop review shows it still carries objectionable vertical colored streaking. The BXT/NXT v1 tight crop used the same centered framing but made the background read as colored scratch/streak noise. The darker NXT-only v2 diagnostic reduced chroma but did not clearly beat v4 because luminance texture remained higher.

Next nonlinear work should wait until an upstream diagnostic improves the integrated master. Further BXT/NXT tuning on the current no-dark/no-flats stack is unlikely to solve the pattern noise.

## Review Checkpoint

Before finalizing, provide:

- historical reference: `docs/images/original-2014-finished-work.jpg`;
- linked-STF WBPP preview;
- accepted Phase 2 linear linked-STF preview;
- clean nonlinear candidate;
- optional flat diagnostic preview if run;
- optional SN 2014J annotated review copy;
- rejected diagnostics with one-line reasons.

Review questions:

1. Which upstream diagnostic should be tried next: same-trip flats, cool-dark library, or alternate rejection/integration settings?
2. Can the integrated master be improved enough that M81's faint arms and M82's dust lane survive without the sky becoming streaky or smudged?
3. If upstream diagnostics do not improve the pattern noise, should M81/M82 remain an archive-limited reference result rather than a final?
4. Should SN 2014J be emphasized only after a cleaner presentation branch exists?
