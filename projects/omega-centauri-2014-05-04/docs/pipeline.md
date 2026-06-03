# Omega Centauri 2014-05-04 Processing Pipeline

This processing plan is tailored to Canon EOS 60D 60s ISO800 frames, ED80/reducer-scale framing confirmed by plate solve, no matching ISO800 darks, no found flats, and the goal of resolving a dense globular cluster without clipping the core or making stars brittle.

For current source inventory, see [Status](status.md). For the chronological reasoning log, see [Processing journey](processing-journey.md). For target-specific research, see [Omega Centauri processing research](research/01-omega-centauri-processing.md). For historical artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Processing Goals

1. Produce a believable Omega Centauri field with a resolved, bright cluster core and a natural outer halo.
2. Preserve star colors and star-size variation; do not turn the cluster into uniform white dots.
3. Avoid clipping the core during stretch or local contrast.
4. Keep BXT conservative because this is a star-dominated field where over-sharpening can quickly make stars brittle.
5. Use LLM-as-judge narrow crops before accepting a branch, especially on the cluster core and edge/corner star fields.
6. Keep all machine-specific archive paths out of public docs and use archive-relative paths in notes.

## Phase 0 - Review And Setup

Project slug: `omega-centauri-2014-05-04`.

Solve/SPCC defaults used:

```text
PI_SOLVE_RA=201.697
PI_SOLVE_DEC=-47.4795
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=12.0
PI_CFA_PATTERN=AUTO
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The raw EXIF focal length of `50.0 mm` was stale. Phase 2 solved successfully at the ED80/reducer-scale seed.

## Phase 1 - Calibration And Integration

### Completed: Primary No-Dark / No-Flats

Purpose: first modern baseline without ISO-mismatched darks or unproven flats.

Inputs:

- Lights: `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/good`
- Darks: none
- Flats: none
- Bias: none

Run shape:

```powershell
$archive = '<local-archive-root>'
$project = '.\projects\omega-centauri-2014-05-04'
$lights = @((Join-Path $archive 'by-date\20140504-yelagiri-kairos-ngc5139-omega-centauri\good'))

& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20140504-good-nodark-noflats' `
  -LightDirs $lights `
  -AllowNoDarks `
  -Fresh
```

Result:

- WBPP completed.
- 27 lights were used.
- 27 lights registered.
- LocalNormalization succeeded for all 27 lights.
- No rejected frames.

Accepted Phase 1 master:

```text
work/wbpp-20140504-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-60.00s_FILTER-NoFilter_RGB_autocrop.xisf
```

Decision: accepted for Phase 2. The branch has strong no-flats background unevenness, but registration and cluster structure are good enough to continue.

### Deferred: ISO-Mismatched Dark Diagnostic

Purpose: only if the primary no-dark branch shows severe pattern noise that outweighs the calibration mismatch risk.

Inputs would be:

- Lights: same 27 top-level `good` lights
- Darks: `dark/canon-eos-60d/library-02/60s-1600iso/31c-33c`
- Flats: none
- Bias: none

Decision gate: reject unless it clearly improves background/pattern noise without dark overcorrection, chroma streaking, or worse star color. The ISO mismatch makes this a risky diagnostic, not a recommended baseline.

### Exclusions

- `good/tree-obstructed`: rejected from first integration.
- `trial-shots`: rejected from first integration because they are mixed 1s/10s/30s and ISO6400/1600/800 framing/exposure tests.
- Old DSS/Photoshop/TIFF/JPEG artifacts: historical references only.

## Phase 2 - Linear Processing

### Completed: ABE / Solve / SPCC / SCNR

Input:

```text
work/wbpp-20140504-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-60.00s_FILTER-NoFilter_RGB_autocrop.xisf
```

Outputs:

- `work/02-linear-20140504-good-nodark-noflats/02a-abe.xisf`
- `work/02-linear-20140504-good-nodark-noflats/02b-solved.xisf`
- `work/02-linear-20140504-good-nodark-noflats/02c-spcc.xisf`
- `work/02-linear-20140504-good-nodark-noflats/02d-scnr.xisf`

Solve result:

```text
Resolution: 2.304 arcsec/px
Focal distance: 385.88 mm
FOV: 3d 19' 39.7" x 2d 12' 51.1"
Image center: RA 13 26 38.429, Dec -47 25 06.09
Rotation: 91.536 deg
```

### Completed: Conservative BXT/NXT

Input:

```text
work/02-linear-20140504-good-nodark-noflats/02d-scnr.xisf
```

Actual settings:

```text
BlurXTerminator: stars 0.14, halos 0.02, nonstellar 0.14
NoiseXTerminator: luminance 0.56, color 0.78, low-frequency 0.16, low-frequency color 0.55
NXT frequency scale: 5
NXT iterations: 2
NXT detail: 0.12
```

Outputs:

- `work/02-linear-20140504-good-nodark-bxt-nxt/02f-bxt.xisf`
- `work/02-linear-20140504-good-nodark-bxt-nxt/02g-bxt-nxt.xisf`

Risk notes:

- BXT was intentionally restrained to avoid brittle stars in the dense cluster.
- NXT helped, but visible background/chroma texture remains because this is a no-dark/no-flats DSLR integration.

## Phase 3 - Nonlinear Processing

### Completed: First MaskedStretch Candidate

Input:

```text
work/02-linear-20140504-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
```

Settings:

```text
MaskedStretch target background: 0.075
```

Outputs:

- `work/03-nonlinear-20140504-good-nodark-bxt-nxt-v1/03a-maskedstretch.xisf`
- `docs/images/omega-centauri-20140504-bxt-nxt-maskedstretch.jpg`

Read: usable first candidate. The full frame gives context but leaves too much noisy background for presentation.

### Completed: Centered Presentation Crop

Crop geometry:

```text
Center X/Y: 0.48, 0.51
Width/height: 0.58, 0.82
Crop size: 3016 x 2837
```

Outputs:

- `work/03-nonlinear-20140504-good-nodark-bxt-nxt-v1/review-crops/03a-maskedstretch-centered-crop.xisf`
- `docs/images/omega-centauri-20140504-bxt-nxt-maskedstretch-centered-crop.jpg`

Read: this is the stronger presentation framing for the current branch.

### Candidate Next Refinements

1. Try a second stretch with stronger core protection if the core crop feels too soft or too bright.
2. Consider a mild nonlinear background/chroma cleanup branch before final export.
3. Keep the full frame and centered crop as siblings if the user wants both context and a presentation crop.

## Phase 4 - LLM-As-Judge Review

### Completed: First Narrow Crop Set

| Crop | Output | Judge read |
| --- | --- | --- |
| Core | `docs/images/omega-centauri-20140504-judge-core.jpg` | Bright and slightly soft, but still resolved. Watch for core clipping/over-smoothing. |
| Outer halo | `docs/images/omega-centauri-20140504-judge-outer-halo.jpg` | Halo transition and small stars are usable; diagonal DSLR texture and chroma speckles are visible. |
| Corner stars | `docs/images/omega-centauri-20140504-judge-corner-stars.jpg` | Corner star shapes are acceptable for the dataset; no severe BXT artifacts apparent. |
| Background edge | `docs/images/omega-centauri-20140504-judge-background-edge.jpg` | Main weakness. Background shows chroma speckles and no-flats texture. |

Decision: keep this as the first review candidate. The ISO1600 dark diagnostic is still deferred because the current branch is usable and the mismatched darks could make calibration worse.

## Review Checkpoint

Provide:

- historical finished-work reference note;
- linked/unlinked WBPP previews;
- accepted Phase 2 linear linked-STF preview;
- full-frame nonlinear candidate;
- tighter cluster crop candidate;
- LLM-as-judge narrow crop findings;
- rejected/deferred diagnostics with one-line reasons.

Current review questions:

1. Is the no-dark/no-flats branch clean enough for this old 27-minute DSLR dataset, or should the ISO-mismatched dark diagnostic get one controlled test?
2. Does the core need a second stretch branch with more highlight protection?
3. Does the centered crop become the main presentation framing while the full frame remains as context?
4. Is the residual background texture acceptable after crop, or should we build a mild cleanup pass before final export?
