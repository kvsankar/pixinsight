# M81 / M82 2014-03-03 Processing Journey

This is the chronological record for the M81/M82 project. Keep it focused on what was tried, what changed direction, and why.

## 2026-05-28 - Project Selection

After the Pleiades v2 crop, the remaining archive targets were scanned for unprocessed sessions with enough raw data and historical context to justify a new project. M81/M82 was selected because it has a historical finished-work reference, a structured archive folder, and a relatively strong 45-frame Canon EOS 60D light set.

The target is also a nice change of problem: instead of broad emission or reflection nebulosity, this field needs galaxy color, faint spiral structure, M82 dust/starburst structure, and careful background control.

## 2026-05-28 - Archive Inventory

The local archive search used M81/M82 aliases and related identifiers: `m81`, `m82`, `bode`, `cigar`, `ngc3031`, `ngc3034`, `ursa`, `supernova`, and `sn2014j`.

Findings:

- The only matching by-date session is `by-date/20140303-coorg-keemale-m81-m82`.
- The `good` folder has 45 CR2 lights at 180s ISO1600 with Canon EOS 60D.
- The `framing-trials` folder has 8 short trial frames and is not a primary integration source.
- Historical stacking and processing artifacts exist under `stacking/attempt-01` and `processing/attempt-01`.
- A finished-work JPEG exists under `finished-work/20140303-M81-M82.jpg`.

The old DSS HTML reports 40 light frames, 49 dark frames, no flats, and 2h total exposure. Comparing the DSS light list to the current `good` folder showed that the old stack omitted the final five +30 C frames. These omitted frames are not obvious rejects from filename statistics; they are low-stdev late frames, so the modern first branch should include all 45 unless WBPP inspection says otherwise.

## 2026-05-28 - Calibration Direction

The light temperatures span +24 to +49 C, with most frames between +30 and +35 C. The calibration library has two plausible 180s ISO1600 dark sources:

- `dark/canon-eos-60d/library-02/180s-1600iso/*c`: 49 CR2 darks from +31 to +45 C.
- `dark/canon-eos-60d/library-01/180s-1600iso/*c`: 15 CR2 darks from +28 to +33 C.

The historical DSS stack used 49 darks and no flats, and a same-era master dark exists under the 180s ISO1600 library. That makes the library-02 dark family the best first branch even though it may overcorrect the cooler late lights.

A plausible ED80-era flat set exists:

```text
flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2
```

It contains 48 Canon EOS 60D flat frames at ISO200 and 1/3200s. The folder explicitly names M81/M82, but there are no bias or dark-flat frames, and the same flat family has been risky on other targets. Decision: keep it as a named diagnostic branch, not as the first calibration dependency.

## 2026-05-28 - Planning Decision

The first planned WBPP branch is:

```text
wbpp-20140303-good-dark31-45-noflats
```

Inputs:

- 45 x 180s ISO1600 Canon EOS 60D lights from `by-date/20140303-coorg-keemale-m81-m82/good`
- 49 x 180s ISO1600 Canon EOS 60D darks from `dark/canon-eos-60d/library-02/180s-1600iso/*c`
- no flats
- no bias
- CFA `AUTO`

The first plan stopped here for review before heavy PixInsight processing.

## 2026-05-28 - Primary Dark-Calibrated WBPP

After the plan was approved, ran:

```text
wbpp-20140303-good-dark31-45-noflats
```

Inputs:

- 45 x 180s ISO1600 Canon EOS 60D lights from `by-date/20140303-coorg-keemale-m81-m82/good`
- 49 x 180s ISO1600 Canon EOS 60D darks from `dark/canon-eos-60d/library-02/180s-1600iso/*c`
- no flats
- no bias
- CFA `AUTO`

WBPP detected `GBRG`. Calibration completed for all 45 lights but every frame required an automatic output pedestal after negative or insignificant pixel values were detected. The run registered 44 non-reference frames successfully and produced autocropped and uncropped master lights. WBPP also warned that one low-weight +30 C frame was rejected.

The linked and unlinked STF previews showed strong galaxy signal, but the color/background behavior looked suspicious enough to trigger the planned no-dark control.

## 2026-05-28 - No-Dark Control

Ran:

```text
wbpp-20140303-good-nodark-noflats-control
```

The no-dark branch completed and registered successfully. Its linked-STF preview was still affected by vignetting and vertical patterning, but it was calmer than the dark-calibrated preview and did not show the same severe dark-overcorrection signature.

## 2026-05-28 - Phase 2 Branch Comparison

Ran Phase 2 on both the dark-calibrated and no-dark branches:

```text
02-linear-20140303-good-dark31-45-noflats
02-linear-20140303-good-nodark-noflats-control
```

Both branches completed ABE, ImageSolver, SPCC with Canon EOS 60D filters, SCNR, and MLT. Both solved cleanly at about 386.19 mm and 2.302 arcsec/px, confirming the ED80/reducer-scale interpretation.

The dark branch was rejected after SPCC/SCNR/MLT because the linked-STF preview showed severe red/blue vertical chroma streaking. The no-dark branch kept residual vertical patterning but produced a much calmer linear baseline, so it became the accepted branch for nonlinear work.

## 2026-05-28 - Nonlinear Candidate

Ran MaskedStretch from the accepted no-dark Phase 2 checkpoint with target background 0.085:

```text
work/03-nonlinear-20140303-nodark-v1/03a-maskedstretch.xisf
```

The stretch showed usable M81/M82 signal and better color than the historical reference, but the background still had vertical patterning and low-level red/blue chroma streaks.

Added a target-specific polish script:

```text
scripts/pjsr/03u-m81-m82-v1-polish.js
```

The script applies low-sky chroma cleanup, background chroma smoothing protected by a galaxy range mask, mild galaxy-local HDR/LHE, and final curves. The first v1 crop improved composition by removing edge artifacts and the lower-left partial galaxy.

A second v2 calm-sky pass used stronger low-sky red/blue neutralization and slightly lower saturation. It became the first review crop:

```text
docs/images/m81-m82-20140303-v2-calm-sky-crop.jpg
work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v2-calm-sky-crop.xisf
work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v2-calm-sky-crop.tif
```

## 2026-05-28 - V3 Recentered Detail Crop

Review feedback found two issues in v2:

1. The visual center of gravity of M81 and M82 was not centered in the frame.
2. M82/Cigar looked too smudged.

The v3 pass keeps the accepted no-dark baseline and starts again from the MaskedStretch checkpoint. It reduces sky cleanup around galaxy luminance, widens the galaxy protection mask, and uses smaller-radius/stronger local contrast to recover more M82 internal structure.

The crop was changed from:

```text
centerX=0.52 centerY=0.44 width=0.80 height=0.76
```

to:

```text
centerX=0.462 centerY=0.497 width=0.78 height=0.72
```

A JPEG component check measured the M81/M82 pair midpoint about 123 px left and 83 px below the v2 frame center. The v3 crop puts the pair midpoint within about 1 px of the frame center.

Current review candidate:

```text
docs/images/m81-m82-20140303-v3-detail-recentered-crop.jpg
work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v3-detail-recentered-crop.xisf
work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v3-detail-recentered-crop.tif
```

## 2026-05-28 - V4 Tight Crop

The next review request asked for a tighter crop. V4 keeps the same v3 detail processing and changes only the framing:

```text
centerX=0.462 centerY=0.497 width=0.66 height=0.62
```

This keeps the M81/M82 visual midpoint centered while trimming more sky than v3. A JPEG component check measured the pair midpoint about 1 px from the frame center in the exported review image.

Tight-crop review candidate:

```text
docs/images/m81-m82-20140303-v4-detail-tight-crop.jpg
work/03-nonlinear-20140303-nodark-v1/03u-m81-m82-v4-detail-tight-crop.xisf
work/03-nonlinear-20140303-nodark-v1/m81-m82-20140303-v4-detail-tight-crop.tif
```

## 2026-05-28 - BXT/NXT Linear Workflow Trial

After BlurXTerminator and NoiseXTerminator licenses were installed, the shared playbook was updated to make the RC Astro workflow the default plugin branch: BXT on linear data, NXT after BXT and before stretch, and SXT only later for starless presentation work.

For M81/M82, the trial started from the accepted no-dark SPCC checkpoint instead of the old MLT-denoised linear file:

```text
work/02-linear-20140303-good-nodark-noflats-control/02c-spcc.xisf
```

The branch skipped the old stock MLT noise reduction and produced:

```text
work/02-linear-20140303-good-nodark-bxt-nxt/02f-bxt.xisf
work/02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
docs/images/m81-m82-20140303-bxt-nxt-linear-linked-stf.jpg
```

BXT settings:

```text
sharpenStars=0.25
adjustHalos=0.03
sharpenNonstellar=0.35
autoNonstellarPsf=true
```

NXT settings:

```text
colorSeparation=true
frequencySeparation=true
denoise=0.70
denoiseColor=0.88
denoiseLf=0.30
denoiseLfColor=0.80
frequencyScale=5
iterations=3
```

The branch then used the same MaskedStretch target background as v4 and a conservative M81/M82 polish pass with less extra LHE/local contrast:

```text
work/03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch.xisf
work/03-nonlinear-20140303-bxt-nxt-v1/03u-m81-m82-bxt-nxt-v1-polish.xisf
```

The tight crop kept the v4 crop geometry:

```text
centerX=0.462 centerY=0.497 width=0.66 height=0.62
```

Rejected BXT/NXT review candidate:

```text
docs/images/m81-m82-20140303-bxt-nxt-v1-tight-crop.jpg
work/03-nonlinear-20140303-bxt-nxt-v1/03u-m81-m82-bxt-nxt-v1-tight-crop.xisf
work/03-nonlinear-20140303-bxt-nxt-v1/m81-m82-20140303-bxt-nxt-v1-tight-crop.tif
```

Quick aggregate JPEG metrics against v4 looked encouraging at first: the pair midpoint stayed centered, the measured M82 local gradient mean rose from 5.09 to 6.07, and sky high-pass texture dropped from 13.10 to 11.56. Visual review of a background crop overruled those metrics: the branch made the remaining background artifacts read as colored scratch/streak noise, so BXT/NXT v1 was rejected.

## 2026-05-28 - NXT-Only Calm Diagnostics

To test whether BXT was the main cause of sharpened background artifacts, two NXT-only diagnostics were run from the SCNR linear checkpoint:

```text
work/02-linear-20140303-good-nodark-noflats-control/02d-scnr.xisf
```

The NXT-only linear checkpoint used stronger chroma and low-frequency cleanup:

```text
work/02-linear-20140303-good-nodark-nxt-calm/02g-nxt-calm.xisf
```

NXT settings:

```text
colorSeparation=true
frequencySeparation=true
denoise=0.78
denoiseColor=0.96
denoiseLf=0.52
denoiseLfColor=0.96
frequencyScale=7
iterations=3
detail=0.10
```

NXT-only v1 was too bright and exposed more sky texture. NXT-only v2 used a darker MaskedStretch target and stronger low-sky chroma cleanup:

```text
docs/images/m81-m82-20140303-nxt-calm-v2-dark-tight-crop.jpg
work/03-nonlinear-20140303-nxt-calm-v2-dark/03u-m81-m82-nxt-calm-v2-dark-tight-crop.xisf
work/03-nonlinear-20140303-nxt-calm-v2-dark/m81-m82-20140303-nxt-calm-v2-dark-tight-crop.tif
```

NXT-only v2 reduced chroma metrics versus v4, but sky high-pass/luminance texture stayed worse. The recommendation at this point was to keep legacy v4 as the best current reference and treat the plugin runs as rejected/deferred diagnostics until calibration or flat/dark support is revisited.

## 2026-05-28 - Close-Crop Review

Closer M81 crops changed the acceptance decision. BXT/NXT v1 is not acceptable because it makes the residual artifacts read as colored scratch/streak noise. Legacy v4 is less smeared, but it is also not a satisfying final because the same vertical red/blue streaking remains visible across the galaxy and sky.

Decision: v4 remains only the least-bad reference image. Stop tuning nonlinear polish and plugin strengths on the current no-dark/no-flats stack. The next meaningful M81/M82 work should revisit upstream calibration or integration: same-trip flat diagnostic, cool-dark diagnostic, or rejection/integration settings.
