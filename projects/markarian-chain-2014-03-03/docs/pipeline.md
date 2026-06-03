# Markarian Chain 2014-03-03 Processing Pipeline

This is the initial processing plan for the 2014 Markarian Chain data. It is tailored to Canon EOS 60D 240s ISO1600 frames, likely ED80/reducer-scale framing, a small but well-matched dark set, and a same-trip flat set that should be treated as diagnostic until proven.

For current source inventory, see [Status](status.md). For the chronological reasoning log, see [Processing journey](processing-journey.md). For target-specific research, see [Markarian Chain processing research](research/01-markarian-chain-processing.md). For historical artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Processing Goals

1. Produce a believable wide Virgo Cluster field centered on the classic Markarian Chain: M84, M86, NGC 4438/4435, NGC 4458/4461, NGC 4473, and NGC 4477.
2. Preserve the soft low-contrast galaxy halos and the small background galaxies without over-darkening the sky to hide DSLR noise.
3. Keep colors restrained: mostly older stellar populations in M84/M86, subtle color in NGC 4438/4435, and natural star color.
4. Avoid aggressive background extraction that treats galaxy halos, unresolved faint galaxies, or broad vignetting residuals as removable background.
5. Use RC Astro BXT/NXT cautiously because the field is star-rich but the galaxy details are small and easy to over-harden.
6. Keep all machine-specific archive paths out of public docs and use archive-relative paths in notes.

## Phase 0 - Review And Setup

Project slug: `markarian-chain-2014-03-03`.

Recommended solve/SPCC defaults for `.env` or command-line overrides:

```text
PI_SOLVE_RA=186.75
PI_SOLVE_DEC=13.10
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=12.0
PI_CFA_PATTERN=AUTO
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The solve seed is centered near the visible chain rather than on a single galaxy. The raw EXIF focal length of `50.0 mm` is likely stale, matching the caveat seen in nearby 2014 ED80/reducer projects. If the 386 mm solve fails, inspect the master and logs before falling back to a wide 50mm solve seed.

For no-flats command examples, make sure `PI_FLAT_DIR` and `PI_FLAT_DIRS` are not set in `.env`, since the wrapper imports flat paths from the environment when present.

## Phase 1 - Calibration And Integration

Status:

- Complete/needs comparison: `wbpp-20140303-good-dark25-30-noflats`
- Complete/control: `wbpp-20140303-good-nodark-noflats-control`
- Complete/rejected: `wbpp-20140303-good-dark25-30-flat3200-test`

Command examples assume:

```powershell
$archive = '<local-archive-root>'
$project = '.\projects\markarian-chain-2014-03-03'
$lights = @((Join-Path $archive 'by-date\20140303-coorg-keemale-markarian-chain\good'))
$darks = @((Join-Path $archive 'dark\canon-eos-60d\library-02\240s-1600iso'))
$flat3200 = @((Join-Path $archive 'flat\20140302-rosette-m81-m82-markarian\1by3200s\set-2'))
```

### Run: Primary Dark-Calibrated, No Flats

Purpose: first modern baseline mirroring the successful historical all-light/no-flat DSS attempt while using PixInsight WBPP.

Inputs:

- Lights: `by-date/20140303-coorg-keemale-markarian-chain/good`
- Darks: `dark/canon-eos-60d/library-02/240s-1600iso`
- Flats: none
- Bias: none

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140303-good-dark25-30-noflats' `
  -LightDirs $lights `
  -DarkDirs $darks `
  -Fresh
```

Decision gate: accept as the Phase 2 baseline only if WBPP calibration does not require widespread automatic pedestal correction and the linked-STF master does not show severe vertical chroma streaking or dark overcorrection.

Outcome so far: completed. WBPP applied automatic output pedestals, registered 17 of 19 lights, and the STF previews show strong color/field imbalance, so it was not the first promoted branch. After downstream Phase 2/BXT/NXT/MaskedStretch comparison, this branch is cleaner than the no-dark branch in the tight right-side crop and is now the preferred branch for continued polish.

### Run: No-Dark / No-Flats Control

Purpose: check whether the small dark set harms the integrated master.

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140303-good-nodark-noflats-control' `
  -LightDirs $lights `
  -AllowNoDarks `
  -Fresh
```

Decision gate: keep this branch if it has calmer background/color behavior than the dark-calibrated branch. If both branches are noisy, compare rejection statistics and close crops before moving to nonlinear work.

Outcome so far: completed. The linked STF is calmer than the dark branch, but WBPP rejected one low-weight frame, registered 16 of 18 remaining lights, and the no-flats field still has strong vignetting. This was the first Phase 2 baseline, but its nonlinear crop shows stronger diagonal red/blue pattern noise than the dark-calibrated branch.

### Run: 2014-03-02 Flat Diagnostic

Purpose: test whether the same-trip Markarian-labeled flats reduce vignetting without adding mismatch artifacts.

Inputs:

- Same lights and darks as the primary run
- Flats: `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2`

Template:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140303-good-dark25-30-flat3200-test' `
  -LightDirs $lights `
  -DarkDirs $darks `
  -FlatDirs $flat3200 `
  -Fresh
```

Decision gate: reject if the branch shows banding, rings, dust mismatch, color overcorrection, or worse faint-galaxy/halo preservation than the no-flats baseline.

Outcome: rejected. The branch registered all 19 lights but the linked STF preview shows a severe bottom-half green gradient, so the flat set is not accepted for the first Phase 2 baseline.

## Phase 2 - Linear Processing

Current preferred Phase 1 master for continued polish:

```text
work/wbpp-20140303-good-dark25-30-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf
```

Earlier no-dark comparison master:

```text
work/wbpp-20140303-good-nodark-noflats-control/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf
```

Status:

- Complete: `02-linear-20140303-good-nodark-noflats-control/02a-abe.xisf`
- Complete after wider retry: `02-linear-20140303-good-nodark-noflats-control/02b-solved.xisf`
- Complete: `02-linear-20140303-good-nodark-noflats-control/02c-spcc.xisf`
- Complete/current RC Astro input: `02-linear-20140303-good-nodark-noflats-control/02d-scnr.xisf`
- Skipped by design: stock `02e-linear-nr.xisf`
- Complete: `02-linear-20140303-good-nodark-bxt-nxt/02f-bxt.xisf`
- Complete/current Phase 3 input: `02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf`
- Complete/preferred after noise review: `02-linear-20140303-good-dark25-30-noflats-diagnostic/02d-scnr.xisf`
- Complete/preferred after noise review: `02-linear-20140303-good-dark25-30-noflats-bxt-nxt/02g-bxt-nxt.xisf`

The solver succeeded with `targetMax=5000`, `maxBox=140`, and `magnitude=12.0` after the initial default-constrained solve failed. Solved scale is 385.88 mm and 2.304 arcsec/px.

For each accepted Phase 1 master:

1. Render linked and unlinked STF previews before changing the data.
2. Preserve the raw integrated master as a checkpoint.
3. Apply background correction conservatively. Avoid samples on M84/M86 halos, the NGC 4438/4435 interaction region, the upper chain, or dense patches of faint background galaxies.
4. Plate solve with the Markarian Chain seed above.
5. Run SPCC with Canon EOS 60D filters if WCS succeeds.
6. Preserve a no-background-neutralization SPCC diagnostic if the field becomes muddy or if background sampling appears biased by vignetting.
7. Run BlurXTerminator on linear color data after SPCC with modest galaxy settings.
8. Run NoiseXTerminator after BXT and before stretch. Keep low-frequency luminance denoise modest so faint galaxies and halos do not turn plastic.
9. Keep a stock/no-plugin diagnostic if BXT/NXT changes small galaxy cores or stellar color too aggressively.

Current BXT/NXT settings:

```text
BlurXTerminator: stars 0.18, halos 0.02, nonstellar 0.28
NoiseXTerminator: luminance 0.60, color 0.82, LF luminance 0.20, LF color 0.68, frequency scale 5, iterations 2, detail 0.14
```

Primary Phase 2 command pattern:

```powershell
& .\scripts\run-phase2.ps1 `
  -ProjectDir $project `
  -OutputSubdir '02-linear-20140303-good-dark25-30-noflats' `
  -Phase1Master '<master-light-from-wbpp-20140303-good-dark25-30-noflats>' `
  -SolveRa 186.75 `
  -SolveDec 13.10 `
  -SolveFocal 386 `
  -SolvePixel 4.31 `
  -SolveMagnitude 12.0 `
  -SpccRedFilter 'Canon EOS 60D R' `
  -SpccGreenFilter 'Canon EOS 60D G' `
  -SpccBlueFilter 'Canon EOS 60D B' `
  -Fresh
```

Potential Phase 2 risks:

- ABE/DBE can remove real low-surface-brightness galaxy halos.
- Aggressive denoise can erase small galaxies and turn the background into flat texture.
- BXT can make small galaxy cores brittle or sharpen noise around faint galaxies.
- SPCC background neutralization may be biased if vignetting remains strong.
- If solving fails at the ED80/reducer seed, do not trust EXIF `50.0 mm` blindly; inspect the image scale and logs.

## Phase 3 - Nonlinear Processing

Target-specific nonlinear priorities:

- Start with a conservative MaskedStretch or GHS-style stretch.
- Keep the sky natural enough that faint galaxies remain visible but not artificially boosted.
- Protect M84/M86 cores and avoid making ellipticals look over-sharpened.
- Preserve NGC 4438/4435 structure without pushing it into unrealistic color contrast.
- Use star reduction only if the star field overwhelms the chain; keep the stars from the actual image data.
- Build a classic chain composition first, then decide whether a wider crop including M87 is useful.

Candidate set:

1. Clean dark-calibrated/no-flats candidate from the primary branch.
2. No-dark/no-flats control candidate if the dark branch has pattern noise or overcorrection.
3. Flat diagnostic candidate only if it clearly improves vignetting without artifacts.
4. Stock/no-plugin comparison if BXT/NXT is too aggressive on small galaxies.

Status: first no-dark checkpoint complete from `02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf` to `03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch.xisf` with MaskedStretch target background 0.095. A sibling right-side crop, `03a-maskedstretch-right-half.xisf`, was also created from the same checkpoint. The crop uses `centerX=0.71`, `centerY=0.5`, `width=0.58`, `height=1.0` to avoid clipping the bright upper-left galaxy in the cropped composition.

A dark-calibrated checkpoint was then created with the same BXT/NXT settings, MaskedStretch target background, and right-side crop geometry:

```text
work/03-nonlinear-20140303-dark-bxt-nxt-v1/03a-maskedstretch.xisf
work/03-nonlinear-20140303-dark-bxt-nxt-v1/03a-maskedstretch-right-side.xisf
```

The dark-calibrated crop is visibly cleaner, with much weaker diagonal red/blue pattern noise. Continue final tuning from the dark branch unless a later comparison disproves it.

## Review Checkpoint

Before finalizing, provide:

- historical DSS reference note;
- linked-STF WBPP preview;
- accepted Phase 2 linear linked-STF preview;
- clean nonlinear full-frame candidate;
- clean nonlinear right-side sibling crop;
- optional flat diagnostic preview if run;
- optional annotated crop labeling the main galaxies;
- rejected diagnostics with one-line reasons.

Review questions:

1. Does the dark-calibrated branch beat the no-dark control, or does it introduce pattern noise like M81/M82?
2. Do the same-trip flats improve the field enough to justify using them without bias/dark-flat support?
3. Should the final composition center on the classic M84/M86-to-NGC4477 arc, or include more of the surrounding Virgo Cluster field?
4. Are BXT/NXT improvements real in close crops of M84/M86/NGC4438, or are they sharpening noise and small galaxy cores?
