# Eta Carinae 2013-03-10 Processing Journey

This is the chronological record of what was tried and what was learned while starting the Eta Carinae project.

## 2026-06-03 - Target Switch

After checkpointing and pushing the Omega Centauri project, switched to Eta Carinae / the Carina Nebula as the next target.

Reason for choosing it:

- It is a new subject type after galaxies and a globular cluster.
- The archive contains a meaningful exposure ladder: 30s, 60s, 120s, and 240s.
- The target has enough dynamic range to justify careful branch planning and LLM-as-judge crops.

## 2026-06-03 - Archive Search

Searched the local `by-date` archive for:

```text
eta
carina
carinae
ngc3372
ngc-3372
```

Only one matching by-date project was found:

```text
by-date/20130310-yelagiri-ymca-carinae
```

No matching Eta/Carina finished-work image was found in the searched finished-work folder.

## 2026-06-03 - Source Inventory

The source folder contains 50 CR2 raw lights in total:

| Folder | CR2 count | Decision |
| --- | ---: | --- |
| `120s/good` | 16 | Primary baseline |
| `60s/good` | 11 | Sibling branch |
| `30s` | 10 | Sibling branch for core/highlights |
| `240s/good` | 6 | Depth diagnostic |
| `30s/bad-trailing` | 2 | Reject |
| `240s/bad-trailing` | 5 | Reject |

First-pass good-light total if all non-rejected groups are eventually used:

```text
10 x 30s  =  5 min
11 x 60s  = 11 min
16 x 120s = 32 min
 6 x 240s = 24 min
Total     = 72 min
```

The first WBPP branch should not combine these raw groups. Integrate and inspect each exposure family separately before deciding whether an HDR-style recombination is warranted.

## 2026-06-03 - EXIF Check

Sampled CR2 files from 30s, 120s, and 240s groups.

Findings:

```text
Camera: Canon EOS 60D
ISO: 1600
EXIF focal length: 50.0 mm
Lens model: blank
```

The `50.0 mm` focal length is treated as stale/unreliable, matching other telescope-era datasets. Use an ED80/reducer-scale solve seed initially.

## 2026-06-03 - Calibration Search

No same-session or target-named flats were found.

Dark-library hits:

```text
30s-1600iso: 30c x1, 31c x20, 32c x9
60s-1600iso: 31c x1, 32c x11, 33c x18
120s-1600iso: 33c x5, 34c x10, 35c x8, 36c x7
240s-1600iso: 25c-ish x9
```

Interpretation:

- 30s darks are strong for the 30s sibling branch.
- 60s darks are close enough to test.
- 120s darks are warmer than the 120s lights; use the +33 C set only as a diagnostic.
- 240s darks match exposure/ISO but are cooler and from a later date; diagnostic only.

## 2026-06-03 - Phase 0 Deliverables

Created and wrote:

- `docs/status.md`
- `docs/processing-journey.md`
- `docs/pipeline.md`
- `docs/original-2013-processing.md`
- `docs/research/01-eta-carinae-processing.md`

Updated local `.env` to point at this project and the 120s `good` source folder. Updated the repo `readme.md` so the new project docs are reachable from the top level.

## 2026-06-03 - Phase 1 WBPP 120s No-Dark / No-Flats

Ran the first WBPP branch using only the 120s `good` lights:

```text
Output subdir: wbpp-20130310-120s-good-nodark-noflats
Lights: 16 x 120s ISO1600
Darks: none
Flats: none
Bias: none
```

Outputs:

- `work/wbpp-20130310-120s-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB.xisf`
- `work/wbpp-20130310-120s-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf`

Rendered:

- `docs/images/eta-carinae-20130310-wbpp-120s-nodark-linked-stf.jpg`
- `docs/images/eta-carinae-20130310-wbpp-120s-nodark-unlinked-stf.jpg`

Read:

The linked STF preview is strongly green before calibration, but the unlinked STF shows a centered Carina Nebula field with useful structure. The branch is good enough to carry into Phase 2 before running a warmer-dark diagnostic.

## 2026-06-03 - Phase 2 ABE / Plate Solve / SPCC / SCNR

Ran Phase 2 from the autocropped Phase 1 master:

```text
Input: work/wbpp-20130310-120s-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf
Output subdir: 02-linear-20130310-120s-good-nodark-noflats
Solve seed: RA 161.265 deg, Dec -59.6844 deg, focal 386 mm, pixel 4.31 um
SPCC filters: Canon EOS 60D R/G/B
```

Outputs:

- `work/02-linear-20130310-120s-good-nodark-noflats/02a-abe.xisf`
- `work/02-linear-20130310-120s-good-nodark-noflats/02b-solved.xisf`
- `work/02-linear-20130310-120s-good-nodark-noflats/02c-spcc.xisf`
- `work/02-linear-20130310-120s-good-nodark-noflats/02d-scnr.xisf`

Plate-solve facts:

```text
Reference catalog: TYCHO-2
Control points: 1075
Resolution: 1.853 arcsec/px
Focal distance: 479.64 mm
Pixel size: 4.31 um
Image center: RA 10 44 14.153, Dec -59 38 29.37
Rotation: 102.141 deg
Observation interval: 2013-03-09 19:28:44 to 20:54:16 UTC
```

Rendered:

- `docs/images/eta-carinae-20130310-phase2-120s-nodark-scnr-linked-stf.jpg`
- `docs/images/eta-carinae-20130310-phase2-120s-nodark-scnr-unlinked-stf.jpg`

Read:

SPCC/SCNR produced a much more believable linear preview. The corners still show no-flats artifacts, but the central target structure is strong. The solve corrected the initial 386 mm assumption to a 479.64 mm focal distance; local `.env` was updated to use 480 mm for future reruns.

## 2026-06-03 - Conservative BXT/NXT Linear Branch

Ran BXT/NXT on `02d-scnr.xisf`:

```text
Output subdir: 02-linear-20130310-120s-good-nodark-bxt-nxt
BXT sharpen stars: 0.14
BXT adjust halos: 0.02
BXT sharpen nonstellar: 0.12
NXT denoise: 0.54
NXT denoise color: 0.76
NXT low-frequency denoise: 0.14
NXT low-frequency color: 0.50
NXT frequency scale: 5
NXT iterations: 2
NXT detail: 0.12
```

Outputs:

- `work/02-linear-20130310-120s-good-nodark-bxt-nxt/02f-bxt.xisf`
- `work/02-linear-20130310-120s-good-nodark-bxt-nxt/02g-bxt-nxt.xisf`

Read:

The pass completed successfully. Settings were restrained because the Carina field has a dense star background and many bright stars.

## 2026-06-03 - First Nonlinear Candidate And Crop

Ran MaskedStretch from the BXT/NXT output:

```text
Input: work/02-linear-20130310-120s-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
Output subdir: 03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v1
Target background: 0.080
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v1/03a-maskedstretch.xisf`
- `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch.jpg`

Created a moderate Carina-centered crop:

```text
Center X/Y: 0.50, 0.51
Width/height: 0.56, 0.68
Crop size: 2911 x 2348
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v1/review-crops/03a-maskedstretch-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch-carina-crop.jpg`

Read:

The first nonlinear branch is promising but subdued. The full frame is too wide and keeps too much no-flats corner ugliness. The crop is a better first presentation candidate, but it needs further contrast, color, and background polish before final review.

## 2026-06-03 - Mixed-Exposure Research Check

Did a short mixed-exposure/HDR workflow check before combining exposure groups.

Findings:

- PixInsight has HDRComposition for high-dynamic-range linear images, plus StarAlignment and ImageIntegration for registration/integration.
- Mixed exposure lengths should be integrated and judged as separate masters before any HDR-style combination.
- For this dataset, 120s remains the baseline, 240s is the next depth diagnostic, and 30s/60s should wait as potential highlight/core recovery branches.

Decision:

Proceed with a separate 240s `good` no-dark/no-flats diagnostic branch. Do not raw-combine all exposure lengths.

## 2026-06-03 - 240s Good No-Dark Diagnostic

Ran WBPP on the 240s `good` folder:

```text
Output subdir: wbpp-20130310-240s-good-nodark-noflats
Raw lights: 6 x 240s ISO1600
Darks: none
Flats: none
Bias: none
```

WBPP result:

```text
Debayer: 6 succeeded
SubframeSelector: 6 succeeded
WBPP accepted: 3 frames
WBPP rejected: 3 frames
StarAlignment: 3 succeeded
LocalNormalization: 3 succeeded
Effective accepted integration: 3 x 240s = 12 min
```

Accepted frames:

- `ETA_CARINA_240s_1600iso_+30c_728stdev_20130310-02h35m32s111ms`
- `ETA_CARINA_240s_1600iso_+31c_640stdev_20130310-03h01m39s672ms`
- `ETA_CARINA_240s_1600iso_+31c_735stdev_20130310-02h39m44s527ms`

Rejected frames:

- `ETA_CARINA_240s_1600iso_+27c_641stdev_20130310-03h16m54s974ms`
- `ETA_CARINA_240s_1600iso_+30c_630stdev_20130310-03h21m07s714ms`
- `ETA_CARINA_240s_1600iso_+31c_638stdev_20130310-03h05m53s377ms`

Rendered:

- `docs/images/eta-carinae-20130310-wbpp-240s-nodark-linked-stf.jpg`
- `docs/images/eta-carinae-20130310-wbpp-240s-nodark-unlinked-stf.jpg`

Read:

The 240s diagnostic reveals a wider red field than the first 120s stretch, but it is noisy and fragile because only three frames survived quality rejection. This is not a clean "more depth" branch yet.

Attempted Phase 2:

- ABE completed and wrote `work/02-linear-20130310-240s-good-nodark-noflats/02a-abe.xisf`.
- The plate-solve stage exceeded the timeout and continued without producing the expected solve output/log.
- The stalled PixInsight process was stopped.

Decision:

Do not combine the 240s master into the 120s branch automatically. Treat 240s as weak/deferred unless the rejected frames are manually reviewed or a separate 240s strategy is needed.

## 2026-06-03 - 120s V2 Brighter Stretch And Crop Polish

Because the first 120s crop was too subdued, ran a brighter stretch from the accepted BXT/NXT linear branch:

```text
Input: work/02-linear-20130310-120s-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
Output subdir: 03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2
MaskedStretch target background: 0.125
```

Output:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/03a-maskedstretch-bright.xisf`

Created the same Carina-centered crop geometry used for v1:

```text
Center X/Y: 0.50, 0.51
Width/height: 0.56, 0.68
Crop size: 2911 x 2348
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03a-maskedstretch-bright-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch-bright-carina-crop.jpg`

Added `scripts/pjsr/03eta-carinae-v2-polish.js` and ran it on the brighter crop only. The script applies restrained sky chroma cleanup, protected red-nebula lift, mild local contrast, and curves. It does not add or synthesize sky content.

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03b-polished-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-v2-polished-carina-crop.jpg`

Read:

The v2 polished crop is a clear improvement over v1. The nebula is visible now, the Keyhole/dark structure reads, and red emission is present without needing the weak 240s branch. Background noise and chroma speckles remain the limiting factors.

## 2026-06-03 - V2 LLM-As-Judge Crop Set

Rendered four narrow diagnostic crops from the v2 polished crop:

| Crop | Output |
| --- | --- |
| Core / Keyhole | `docs/images/eta-carinae-20130310-v2-judge-core-keyhole.jpg` |
| Central dust | `docs/images/eta-carinae-20130310-v2-judge-central-dust.jpg` |
| Upper red nebulosity | `docs/images/eta-carinae-20130310-v2-judge-upper-red-nebulosity.jpg` |
| Corner/background stars | `docs/images/eta-carinae-20130310-v2-judge-corner-background-stars.jpg` |

Read:

- Core/Keyhole and central dust crops are successful: the structure is legible and the red lift looks plausible.
- Upper red nebulosity is visible but noisy.
- Background/corner crop shows chroma speckles and faint texture; this is the limiting quality area.

Operational note:

Batch-launching many PixInsight crop/render invocations in a PowerShell loop left processes behind. One PixInsight invocation per shell call was reliable. Future crop automation should use a single PJSR multi-crop script or explicitly manage process completion.

## 2026-06-03 - V3 Deeper Stretch Diagnostic

The v2 crop looked good but still faint, so created a stronger v3 diagnostic from the v2 polished crop.

Added:

```text
scripts/pjsr/03eta-carinae-v3-deeper-stretch.js
```

Input:

```text
work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03b-polished-carina-crop.xisf
```

Outputs:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03c-v3-deeper-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-v3-deeper-carina-crop.jpg`

Rendered a v3 core/Keyhole judge crop:

- `docs/images/eta-carinae-20130310-v3-judge-core-keyhole.jpg`

Read:

V3 is brighter and makes the red field and central structure easier to see. It also exposes more red/blue chroma speckles and background texture. The core crop remains acceptable and more dramatic than v2. The full v3 crop makes the noise tradeoff clear enough that v3 should be treated as a brighter review candidate, not an unqualified replacement for v2.

Operational note:

An attempted v3 corner/background judge crop again left PixInsight processes behind and was stopped. Do not batch crop/render with multiple PixInsight launches in one shell command for this target.

## 2026-06-03 - Annotated Orientation Aid

Created an annotated derivative of the v3 deeper crop:

- `docs/images/eta-carinae-20130310-v3-deeper-carina-crop-annotated.jpg`

Labels mark the main orientation anchors: Eta Carinae, the Keyhole Nebula dark dust lane, the Trumpler 16 / Eta cluster region, the compact Trumpler 14 region, the broader Carina Nebula core / NGC 3372, faint red emission, and low-contrast southern dust/pillar structure.

This is only an explanatory overlay on the processed user data. It does not add, paint, clone, or synthesize any sky content.

## 2026-06-03 - V4 Regular Extra Stretch

The regular v3 crop still felt faint, so ran a stronger unannotated v4 stretch from:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03c-v3-deeper-carina-crop.xisf`

Output:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03d-v4-extra-stretch-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-v4-extra-stretch-carina-crop.jpg`

The extra stretch reveals more of the outer red emission field and makes the Carina complex easier to orient, but it also exposes stronger red/blue background speckles.

Added and ran:

- `scripts/pjsr/03eta-carinae-v4-background-cleanup.js`

Cleaned output:

- `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03e-v4-extra-stretch-clean-carina-crop.xisf`
- `docs/images/eta-carinae-20130310-v4-extra-stretch-clean-carina-crop.jpg`

Read:

The cleaned v4 crop is the better presentation sibling if the goal is to make the nebula easy to see. It does not remove the underlying noise limitation; v3 remains the cleaner, more restrained version.
