# Eta Carinae 2013-03-10 Processing Pipeline

This is the initial processing plan for the 2013 Eta Carinae / Carina Nebula data. It is tailored to Canon EOS 60D ISO1600 lights, mixed 30s/60s/120s/240s exposure groups, no found flats, and a bright emission-nebula target with a high-dynamic-range core around Eta Carinae and the Keyhole region.

For current source inventory, see [Status](status.md). For the chronological reasoning log, see [Processing journey](processing-journey.md). For target-specific research, see [Eta Carinae processing research](research/01-eta-carinae-processing.md). For historical artifacts, see [Original 2013 processing evidence](original-2013-processing.md).

## Processing Goals

1. Produce a natural wide-field Carina Nebula image with believable red emission, dark dust structure, and dense southern Milky Way star fields.
2. Preserve the bright Eta Carinae / Keyhole region without letting it become a blown-out white patch.
3. Avoid treating real large-scale nebulosity as gradient during ABE/DBE.
4. Process exposure groups separately before any HDR-style combination.
5. Keep BXT/NXT conservative enough to preserve star color and avoid brittle stars in the dense field.
6. Use LLM-as-judge narrow crops before accepting a branch: bright core, dust lane, nebulosity/background transition, and corner star field.

## Phase 0 - Review And Setup

Project slug: `eta-carinae-2013-03-10`.

Recommended solve/SPCC defaults for `.env` or command-line overrides after the first successful solve:

```text
PI_SOLVE_RA=161.265
PI_SOLVE_DEC=-59.6844
PI_SOLVE_FOCAL_MM=480
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=12.0
PI_CFA_PATTERN=AUTO
PI_SPCC_RED_FILTER=Canon EOS 60D R
PI_SPCC_GREEN_FILTER=Canon EOS 60D G
PI_SPCC_BLUE_FILTER=Canon EOS 60D B
```

The solve seed is near Eta Carinae. The raw EXIF focal length of `50.0 mm` is stale. The first Phase 2 solve succeeded at 479.64 mm and 1.853 arcsec/px.

## Phase 1 - Calibration And Integration

### Completed Run A: 120s Good No-Dark / No-Flats Baseline

Purpose: establish a clean baseline from the deepest homogeneous group without risking overcorrection from warmer darks.

Inputs:

- Lights: `by-date/20130310-yelagiri-ymca-carinae/120s/good`
- Darks: none
- Flats: none
- Bias: none

Template:

```powershell
$archive = '<local-archive-root>'
$project = '.\projects\eta-carinae-2013-03-10'
$lights = @((Join-Path $archive 'by-date\20130310-yelagiri-ymca-carinae\120s\good'))

& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20130310-120s-good-nodark-noflats' `
  -LightDirs $lights `
  -AllowNoDarks `
  -Fresh
```

Result: accepted for Phase 2. The linked STF preview is strongly green before calibration, but the unlinked STF shows centered Carina structure and tolerable no-dark/no-flats issues for a first baseline.

### Run B: 120s Good + 33 C Dark Diagnostic

Purpose: test whether the closest 120s darks improve the baseline enough to justify using them.

Inputs:

- Lights: `by-date/20130310-yelagiri-ymca-carinae/120s/good`
- Darks: `dark/canon-eos-60d/library-02/120s-1600iso/33c`
- Flats: none
- Bias: none

Template:

```powershell
$archive = '<local-archive-root>'
$project = '.\projects\eta-carinae-2013-03-10'
$lights = @((Join-Path $archive 'by-date\20130310-yelagiri-ymca-carinae\120s\good'))
$darks = @((Join-Path $archive 'dark\canon-eos-60d\library-02\120s-1600iso\33c'))

& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir $project `
  -OutputSubdir 'wbpp-20130310-120s-good-dark33c-noflats' `
  -LightDirs $lights `
  -DarkDirs $darks `
  -Fresh
```

Decision gate: reject unless it clearly improves hot pixels/pattern noise without dark overcorrection or worse color. The darks are warmer than the lights and only 5 frames.

### Sibling Branches

These should be run only after the 120s baseline is understood.

| Branch | Lights | Darks | Purpose |
| --- | --- | --- | --- |
| 30s core branch | `30s` | `30s-1600iso/31c` | Protect Eta/Keyhole highlights and possible HDR core |
| 60s branch | `60s/good` | 60s 31c/32c/33c diagnostic | Middle exposure comparison |
| 240s depth branch | `240s/good` | 240s dark diagnostic only | Tested as no-dark diagnostic; weak because WBPP accepted only 3 of 6 |

### Mixed-Exposure Combination Rule

Do not feed all exposure lengths into one undifferentiated raw integration. The current target plan is:

1. Build separate masters for 30s, 60s, 120s, and 240s exposure families.
2. Reject or defer any family that fails its own registration, noise, saturation, or star-shape review.
3. Use 120s as the current baseline.
4. The 240s no-dark test is now weak/deferred because WBPP accepted only 3 of 6 frames and Phase 2 solving stalled.
5. Test 30s/60s later only if the bright Eta/Keyhole region needs highlight recovery.
6. Combine accepted masters later with a dedicated HDRComposition-style linear workflow, not by raw-mixing all subs.

### Exclusions

- `30s/bad-trailing`: reject from first integration.
- `240s/bad-trailing`: reject from first integration.
- Old DSS/Photoshop/TIFF/JPEG artifacts: historical references only.

## Phase 2 - Linear Processing

For each accepted Phase 1 master:

1. Render linked and unlinked STF previews before changing the data.
2. Preserve the raw integrated master as a checkpoint.
3. Apply background correction conservatively. The Carina Nebula fills much of the field, so a high-order or aggressive background model can remove real nebulosity.
4. Plate solve with the Eta Carinae seed above.
5. Run SPCC with Canon EOS 60D filters if WCS succeeds.
6. Use SCNR only if SPCC leaves an obvious green cast.
7. Run BlurXTerminator on linear color data with restrained star settings.
8. Run NoiseXTerminator after BXT and before stretch, but avoid plastic smoothing in the dust lanes and star field.

Suggested initial BXT/NXT settings:

```text
BlurXTerminator: stars 0.12-0.16, halos 0.02, nonstellar 0.10-0.16
NoiseXTerminator: luminance 0.50-0.56, color 0.72-0.78, low-frequency conservative
```

Potential Phase 2 risks:

- ABE/DBE can erase real red nebulosity and dust structure.
- SPCC background neutralization can be biased if the field has little clean background.
- BXT can over-tighten the dense star field or create dark halos around bright stars.
- A solved FOV may reveal the target is not centered exactly on Eta Carinae; adjust crop planning based on the actual WCS, not the folder name.

### Completed Current Branch

Input:

```text
work/wbpp-20130310-120s-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf
```

Outputs:

- `work/02-linear-20130310-120s-good-nodark-noflats/02a-abe.xisf`
- `work/02-linear-20130310-120s-good-nodark-noflats/02b-solved.xisf`
- `work/02-linear-20130310-120s-good-nodark-noflats/02c-spcc.xisf`
- `work/02-linear-20130310-120s-good-nodark-noflats/02d-scnr.xisf`

Solve result:

```text
Resolution: 1.853 arcsec/px
Focal distance: 479.64 mm
Image center: RA 10 44 14.153, Dec -59 38 29.37
Rotation: 102.141 deg
```

Completed BXT/NXT branch:

```text
BlurXTerminator: stars 0.14, halos 0.02, nonstellar 0.12
NoiseXTerminator: luminance 0.54, color 0.76, low-frequency 0.14, low-frequency color 0.50
```

Outputs:

- `work/02-linear-20130310-120s-good-nodark-bxt-nxt/02f-bxt.xisf`
- `work/02-linear-20130310-120s-good-nodark-bxt-nxt/02g-bxt-nxt.xisf`

## Phase 3 - Nonlinear Processing

Target-specific nonlinear priorities:

- Start with a conservative stretch that protects the bright Eta/Keyhole region.
- Preserve red nebulosity while keeping the background from becoming muddy.
- Lift dust lanes and structure gently; do not invent texture.
- Build at least one wide-field candidate and one tighter Eta/Keyhole-centered crop if framing supports both.
- Consider HDR-style recombination only from real integrated exposure-group products after each group has been judged separately.

### Completed First Candidate

Input:

```text
work/02-linear-20130310-120s-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
```

Settings:

```text
MaskedStretch target background: 0.080
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v1/03a-maskedstretch.xisf`
- `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch.jpg`

First crop:

```text
Center X/Y: 0.50, 0.51
Width/height: 0.56, 0.68
Crop size: 2911 x 2348
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v1/review-crops/03a-maskedstretch-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch-carina-crop.jpg`

Read: promising but subdued. The crop is stronger than the full frame, but the branch needs color/contrast/background polish before the LLM-as-judge crop set.

### Completed V2 Crop Polish

Input:

```text
work/02-linear-20130310-120s-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
```

V2 stretch:

```text
MaskedStretch target background: 0.125
```

Crop geometry:

```text
Center X/Y: 0.50, 0.51
Width/height: 0.56, 0.68
Crop size: 2911 x 2348
```

Polish:

```text
scripts/pjsr/03eta-carinae-v2-polish.js
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/03a-maskedstretch-bright.xisf`
- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03a-maskedstretch-bright-carina-crop.xisf`
- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03b-polished-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch-bright-carina-crop.jpg`
- `docs/images/eta-carinae-20130310-v2-polished-carina-crop.jpg`

Read: v2 is the current lead. It makes the nebula visible and preserves real structure, but background/chroma noise still limits how hard the data can be pushed.

### Completed V3 Deeper Stretch Diagnostic

Input:

```text
work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03b-polished-carina-crop.xisf
```

Script:

```text
scripts/pjsr/03eta-carinae-v3-deeper-stretch.js
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03c-v3-deeper-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-v3-deeper-carina-crop.jpg`
- `docs/images/eta-carinae-20130310-v3-judge-core-keyhole.jpg`

Read: v3 is brighter and more satisfying at normal viewing size, but it reveals more chroma/background speckle. Keep v2 and v3 as sibling candidates.

### Completed V4 Extra Stretch Diagnostic

Input:

```text
work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03c-v3-deeper-carina-crop.xisf
```

Stretch script:

```text
scripts/pjsr/03eta-carinae-v3-deeper-stretch.js
```

Cleanup script:

```text
scripts/pjsr/03eta-carinae-v4-background-cleanup.js
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03d-v4-extra-stretch-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-v4-extra-stretch-carina-crop.jpg`
- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03e-v4-extra-stretch-clean-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-v4-extra-stretch-clean-carina-crop.jpg`

Read: v4 is the brightest and easiest-to-read Carina presentation so far. The cleaned v4 sibling is preferred over the raw v4 stretch, but the background/chroma speckle tradeoff is now very visible. Keep v3 as the cleaner sibling.

## Phase 4 - LLM-As-Judge Review

Before accepting a final branch, generate a small matched crop set across the leading candidates:

1. Bright Eta/Keyhole crop: tests clipping, halos, star bloat, and highlight recovery.
2. Dust-lane crop: tests texture preservation, sharpening artifacts, and color noise.
3. Outer nebulosity/background transition crop: tests gradient correction and over-denoise.
4. Corner star crop: tests field curvature, registration, BXT artifacts, and chroma noise.

Ask the LLM to judge noise, star shapes, star color, halos, gradients, clipping, faint-signal preservation, and whether real nebulosity appears accidentally flattened.

### Completed V2 Judge Set

| Crop | Output | Finding |
| --- | --- | --- |
| Core / Keyhole | `docs/images/eta-carinae-20130310-v2-judge-core-keyhole.jpg` | Strongest crop; structure and red emission are clear. |
| Central dust | `docs/images/eta-carinae-20130310-v2-judge-central-dust.jpg` | Good subject detail; noise present but acceptable for review. |
| Upper red nebulosity | `docs/images/eta-carinae-20130310-v2-judge-upper-red-nebulosity.jpg` | Red field is visible but noisy. |
| Corner/background stars | `docs/images/eta-carinae-20130310-v2-judge-corner-background-stars.jpg` | Background/chroma speckles are the limiting artifact. |
| V3 core / Keyhole | `docs/images/eta-carinae-20130310-v3-judge-core-keyhole.jpg` | Brighter and more dramatic; subject area remains acceptable. |
| V4 cleaned full crop | `docs/images/eta-carinae-20130310-v4-extra-stretch-clean-carina-crop.jpg` | Most legible full-field view, with clear background noise cost. |

## Review Checkpoint

Before finalizing, provide:

- historical processing artifact note;
- linked/unlinked WBPP previews;
- accepted Phase 2 linear linked-STF preview;
- full-frame nonlinear candidate;
- tighter Eta/Keyhole crop candidate if useful;
- LLM-as-judge narrow crop findings;
- rejected diagnostics with one-line reasons.

Review questions:

1. Is the no-dark 120s branch clean enough, or does the 120s +33 C dark diagnostic deserve to lead?
2. Does the 120s branch clip the bright core enough to require 30s/60s HDR support?
3. Does BXT/NXT improve structure without making stars brittle?
4. Should 240s `good` be left aside unless manually re-reviewed, given the 3/6 WBPP acceptance result?
5. Should final presentation be full-field, tighter core/dust composition, or both?
