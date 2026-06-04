# M7 / Ptolemy Cluster 2013-03-10 Processing Pipeline

This plan applies to the M7 / Ptolemy Cluster data in:

```text
by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster
```

The goal is a clean open-cluster presentation: natural star color, round stars, restrained background, and enough Milky Way context to keep the cluster from feeling isolated.

## Solve And Color Defaults

Recommended solve/SPCC defaults for `.env` or command-line overrides:

```text
PI_SOLVE_RA=268.4634
PI_SOLVE_DEC=-34.7929
PI_SOLVE_FOCAL_MM=480
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=11.5
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The focal length is a seed, not a fact. The raw EXIF says `50.0 mm`, but same-night Eta Carinae solved near 480 mm. Treat the plate-solved scale as truth after Phase 2.

## Branch Plan

### Primary Branch: 120s No-Dark/No-Flats

```text
good/120s-1600iso
```

Rationale:

- Deepest homogeneous M7 group.
- Five frames is thin but likely enough for a first cluster presentation.
- Available darks are much warmer than the lights, so no-dark is safer than overcorrecting.

Planned WBPP output:

```text
work/wbpp-20130310-120s-nodark-noflats
```

### Sibling Branch: 60s No-Dark/No-Flats

```text
good/60s-1600iso
```

Rationale:

- More frames than the 120s branch.
- Shorter exposures may protect bright cluster-star color and shape.
- Should be inspected separately before any multi-exposure combination.

Planned WBPP output:

```text
work/wbpp-20130310-60s-nodark-noflats
```

### Excluded From First Integration

```text
good/30s-1600iso
good/01s-1600iso
```

Each has only one CR2 frame. Keep as historical/framing or possible single-frame bright-star diagnostics, not as integration inputs.

### Dark Diagnostics

Do not start with dark calibration.

If no-dark output is poor enough to justify a diagnostic, test only the least-warm matching dark family first:

```text
dark/canon-eos-60d/library-02/120s-1600iso/33c
dark/canon-eos-60d/library-02/60s-1600iso/31c;32c
```

The warmer 34c-36c 120s darks are not a baseline candidate for +24 to +28 C lights.

## Phase 1 - WBPP

Run 120s and 60s separately.

Primary:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir .\projects\m7-ptolemy-cluster-2013-03-10 `
  -LightDir <archive>\by-date\20130310-yelagiri-ymca-m7-ptolemy-cluster\good\120s-1600iso `
  -AllowNoDarks `
  -OutputSubdir wbpp-20130310-120s-nodark-noflats
```

Sibling:

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir .\projects\m7-ptolemy-cluster-2013-03-10 `
  -LightDir <archive>\by-date\20130310-yelagiri-ymca-m7-ptolemy-cluster\good\60s-1600iso `
  -AllowNoDarks `
  -OutputSubdir wbpp-20130310-60s-nodark-noflats
```

Decision gate:

- Did all frames register?
- Is the 120s branch star color/saturation acceptable?
- Is the 60s branch cleaner or sharper enough to outrank the 120s branch?
- Are gradients mild enough for conservative ABE, or should a no-ABE/MGC diagnostic be kept?

## Phase 2 - Linear Processing

For the first accepted WBPP master:

1. Render linked/unlinked STF previews.
2. Run conservative ABE. Avoid heavy background removal because M7 lies in a dense Milky Way field.
3. Plate solve with the M7 seed.
4. Run SPCC with Canon EOS 60D filters.
5. Run light SCNR only if there is clear residual green.
6. Run conservative BXT/NXT if the data supports it.

For this dense star-field target, first plugin settings should stay modest:

```text
BXT stars: 0.12-0.16
BXT nonstellar: 0.10-0.18
NXT luminance: 0.50-0.56
NXT color: 0.74-0.80
```

Keep a stock/no-plugin or lower-strength diagnostic if BXT/NXT hardens the star field or creates halos.

## Phase 3 - Nonlinear Presentation

Presentation goals:

- Preserve blue-white/yellow-orange star color.
- Avoid clipped bright cluster cores.
- Avoid over-blackening the Milky Way background.
- Crop only after judging whether wide context adds value.

Initial nonlinear path:

1. Conservative MaskedStretch or GHS-style stretch.
2. Mild curves for contrast and color saturation.
3. Target-specific star-size restraint only if needed; avoid aggressive MorphologicalTransformation on an open cluster.
4. Export full-frame and one cluster-centered crop for review.

## Phase 4 - LLM-As-Judge Review

Create 4-5 narrow crops before accepting a branch:

| Crop | Purpose |
| --- | --- |
| Cluster core | Bright star color, saturation, registration, and star shapes |
| Medium-bright field stars | Star roundness, BXT halos, chroma balance |
| Background/star-cloud area | Walking noise, mottling, over-denoise, real field texture |
| Edge/corner stars | Coma, tilt, registration trails |
| 120s vs 60s matched crop | Branch-level comparison if both integrations are usable |

Judgment questions:

1. Which branch has safer star shapes and color?
2. Is background noise upstream/integration-limited or polish-limited?
3. Does the crop erase useful Milky Way context?
4. Should BXT/NXT be kept, reduced, or replaced by a stock branch?

## Actual Run State

### Phase 1

Completed:

```text
work/wbpp-20130310-120s-nodark-noflats
work/wbpp-20130310-60s-nodark-noflats
```

Results:

| Branch | Frames | Registered | Rejected | Autocrop | Current role |
| --- | ---: | ---: | ---: | --- | --- |
| 120s no-dark/no-flats | 5 | 5/5 | 0 | 5201 x 3460 | Current lead |
| 60s no-dark/no-flats | 8 | 8/8 | 0 | 4770 x 2230 | Sibling diagnostic |

The 60s branch registered successfully, but its autocrop is much narrower, so the 120s branch is the field-preserving baseline for first Phase 2 work.

### Phase 2

Completed for the 120s branch:

```text
work/02-linear-20130310-120s-nodark-noflats/02a-abe.xisf
work/02-linear-20130310-120s-nodark-noflats/02b-solved.xisf
work/02-linear-20130310-120s-nodark-noflats/02c-spcc.xisf
work/02-linear-20130310-120s-nodark-noflats/02d-scnr.xisf
work/02-linear-20130310-120s-nodark-noflats/02e-linear-nr.xisf
```

Solve result:

```text
Focal distance: 480.31 mm
Resolution: 1.851 arcsec/px
Field of view: 2d 40' 26.5" x 1d 46' 44.1"
Image center: RA 17 53 36.834, Dec -34 45 20.17
```

### BXT/NXT Branch

Completed from the 120s `02d-scnr.xisf` checkpoint:

```text
work/02-linear-20130310-120s-bxt-nxt/02f-bxt.xisf
work/02-linear-20130310-120s-bxt-nxt/02g-bxt-nxt.xisf
```

Settings:

```text
BXT stars=0.12
BXT halos=0.01
BXT nonstellar=0.10
NXT luminance=0.52
NXT color=0.76
NXT low-frequency luminance=0.18
NXT low-frequency color=0.58
```

### Phase 3

Completed first conservative stretch:

```text
work/03-nonlinear-20130310-120s-bxt-nxt-v1/03a-maskedstretch-bg075.xisf
docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg
```

This is the accepted presentation branch for the 2026-06-04 checkpoint.

Completed v2 dark-lane contrast sibling from the regular stretched image:

```text
work/03-nonlinear-20130310-120s-bxt-nxt-v2-dark-lane-contrast/03b-dark-lane-contrast.xisf
docs/images/m7-20130310-bxt-nxt-v2-dark-lane-contrast.jpg
```

The v2 branch uses mild large-scale LocalHistogramEqualization plus a lower-shadow S-curve to make black dust-lane structure more visible around the cluster. Visual review found little practical difference from the regular branch, so v2 remains a diagnostic sibling rather than the accepted presentation result.

### Phase 4 Judge Crops

Completed first crop set:

```text
docs/images/m7-20130310-judge-01-cluster-core.jpg
docs/images/m7-20130310-judge-02-medium-star-field.jpg
docs/images/m7-20130310-judge-03-background-star-cloud.jpg
docs/images/m7-20130310-judge-04-corner-stars.jpg
```

Completed matched v2 crop set:

```text
docs/images/m7-20130310-v2-judge-01-cluster-core.jpg
docs/images/m7-20130310-v2-judge-02-medium-star-field.jpg
docs/images/m7-20130310-v2-judge-03-background-star-cloud.jpg
docs/images/m7-20130310-v2-judge-04-corner-stars.jpg
```

## Checkpoint Decision

M7 is checkpointed for this processing pass. The accepted presentation image is:

```text
docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg
```

The 60s WBPP branch and v2 dark-lane contrast branch remain documented diagnostics. No further M7 processing is planned for this pass unless new data or a different presentation goal appears.
