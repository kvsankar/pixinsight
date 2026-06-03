# Markarian Chain 2014-03-03 Processing Journey

This is the chronological record of what was tried and what was learned while starting the Markarian Chain project.

## 2026-06-03 - Target Selection

The initial archive scan compared unprocessed or not-yet-projectized deep-sky folders under `by-date/`:

| Candidate | Primary raw count | Notes |
| --- | ---: | --- |
| `20140303-coorg-keemale-markarian-chain` | 19 curated `good` CR2 lights | Homogeneous 240s ISO1600 set with historical DSS stack and same-duration dark support |
| `20140504-yelagiri-kairos-ngc5139-omega-centauri` | 30 curated `good` CR2 lights | Attractive target, but 60s ISO800 dark support was not found |
| `20130310-yelagiri-ymca-carinae` | 50 CR2 across 30s/60s/120s/240s | Interesting but mixed exposure folders need more planning |
| `20130310-yelagiri-ymca-virgo-cluster-galaxies` | 23 CR2 in `lights` | Related galaxy field but separate 200mm lens session with mixed exposure/ISO |
| `20160109-yelagiri-ymca-comet-catalina` | 30 CR2 | Comet workflow would need target-specific moving-object decisions |

Markarian Chain was selected because it has a curated primary set, uniform exposure/ISO, matching dark-family support, same-trip flat candidates, and no existing project directory.

## 2026-06-03 - Archive Inventory

The source folder has:

- 19 primary CR2 lights in `by-date/20140303-coorg-keemale-markarian-chain/good`.
- 7 rejected CR2 files in `bad`, split into `double-stars`, `light`, `sat-trails`, and `trailing-stars`.
- 3 framing/trial frames in `framing-trials`.
- Two DSS stack attempts under `stacking`.

The historical DSS evidence is useful because attempt 1 used 17 lights and attempt 2 used all 19 lights. Both used darks and no flats. This supports a modern primary branch of all 19 lights with same-duration darks, while keeping the old DSS autosaves out of the PixInsight input path.

## 2026-06-03 - Related Session Check

Alias search found `by-date/20130310-yelagiri-ymca-virgo-cluster-galaxies`. EXIF shows Canon EOS 60D with an EF70-200mm lens at 200mm/f3.5. The exposure set is mixed:

```text
5 x 180s ISO1600
4 x 240s ISO1600
7 x 300s ISO1600
1 x 60s ISO1600
1 x 20s ISO3200
4 x 40s ISO3200
1 x 60s ISO3200
```

This is a separate lens/date/site dataset and should not be raw-combined with the 2014 Markarian Chain session. It may become its own Virgo Cluster project later.

## 2026-06-03 - Calibration Plan

The matching dark directory is `dark/canon-eos-60d/library-02/240s-1600iso`. It contains 9 raw CR2 darks:

```text
1 x +25 C
1 x +28 C
2 x +29 C
5 x +30 C
```

This is smaller than ideal, but well matched to the 19 lights, which are mostly +30 C. The first Phase 1 branch should use this dark set with no flats. A no-dark/no-flats control is worth running if dark calibration behaves like the rejected dark branch in the nearby M81/M82 project.

The same-trip flat directory `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` contains 52 CR2 flats at ISO200 and 1/3200s. It explicitly names Markarian, but there are no bias or dark-flat frames, so this is a diagnostic branch rather than a global default.

## 2026-06-03 - Phase 0 Deliverables

Created and wrote:

- `docs/status.md`
- `docs/processing-journey.md`
- `docs/pipeline.md`
- `docs/original-2014-processing.md`
- `docs/research/01-markarian-chain-processing.md`

Updated local `.env` to point at this project and the Markarian Chain data. Updated the repo `readme.md` so the new project docs are reachable from the top level.

No heavy PixInsight processing has been run yet.

## 2026-06-03 - Phase 1 Dark-Calibrated WBPP

Ran the planned primary branch:

```text
Output: work/wbpp-20140303-good-dark25-30-noflats
Lights: 19 x 240s ISO1600
Darks: 9 x 240s ISO1600
Flats: none
Bias: none
```

WBPP completed with exit code 0. It auto-detected `GBRG`, calibrated/debayered all 19 lights, registered 17 of 19, ran LocalNormalization on the registered set, and produced master dark plus uncropped/autocropped master lights.

The two registration failures were:

```text
MARKARIAN-CHAIN_240s_1600iso_+30c_00442stdev_20140303-04h45m05s517ms
MARKARIAN-CHAIN_240s_1600iso_+30c_00499stdev_20140303-04h49m12s176ms
```

This mirrors the older DSS attempt-01 17-frame stack more than the all-19 attempt-02 stack, but not with the same omitted frames. WBPP also applied automatic output pedestal during light calibration, which is a warning sign seen in other DSLR dark-calibrated branches in this repo.

Rendered:

```text
docs/images/markarian-chain-20140303-wbpp-dark-linked-stf.jpg
docs/images/markarian-chain-20140303-wbpp-dark-unlinked-stf.jpg
```

Visual read: the linked STF is strongly green, and the unlinked STF shows a strong magenta/green field imbalance plus broad central glow. The run is not rejected yet, but it should not be promoted to Phase 2 before a no-dark/no-flats control is compared.

## 2026-06-03 - Phase 1 No-Dark Control

Ran the planned control branch:

```text
Output: work/wbpp-20140303-good-nodark-noflats-control
Lights: 19 x 240s ISO1600
Darks: none
Flats: none
Bias: none
```

WBPP completed with exit code 0 and auto-detected `GBRG`. It debayered all 19 lights, but the bad-frame rejection step rejected this frame at the minimum threshold:

```text
MARKARIAN-CHAIN_240s_1600iso_+30c_00403stdev_20140303-04h53m18s722ms
```

It then registered 16 of 18 remaining frames. The two registration failures matched the dark branch:

```text
MARKARIAN-CHAIN_240s_1600iso_+30c_00442stdev_20140303-04h45m05s517ms
MARKARIAN-CHAIN_240s_1600iso_+30c_00499stdev_20140303-04h49m12s176ms
```

Rendered:

```text
docs/images/markarian-chain-20140303-wbpp-nodark-linked-stf.jpg
```

The linked preview is calmer than the dark-calibrated branch, but still shows strong vignetting/field imbalance. The unlinked preview eventually rendered too and confirmed the same broad magenta/vignetting imbalance. Since the no-flats branches both show field issues, the next useful branch is the same-trip flat diagnostic.

## 2026-06-03 - Phase 1 Flat Diagnostic

Ran the planned same-trip flat diagnostic:

```text
Output: work/wbpp-20140303-good-dark25-30-flat3200-test
Lights: 19 x 240s ISO1600
Darks: 9 x 240s ISO1600
Flats: 48 x 1/3200s ISO200
Bias: none
```

WBPP completed with exit code 0 and auto-detected `GBRG`. It calibrated/debayered all 19 lights, registered all 19, ran LocalNormalization on all 19, and produced master dark, master flat, and uncropped/autocropped master lights.

Rendered:

```text
docs/images/markarian-chain-20140303-wbpp-dark-flat3200-linked-stf.jpg
```

Despite the perfect registration result, the linked STF preview shows a severe bottom-half green gradient. This looks like flat mismatch or unsupported flat calibration rather than a usable improvement. The flat branch is rejected as the Phase 2 baseline.

Phase 1 conclusion: use `wbpp-20140303-good-nodark-noflats-control` for the first Phase 2 run. It has fewer integrated frames than ideal, but it is the least pathological baseline for color/background behavior.

## 2026-06-03 - Phase 2 No-Dark Baseline

Ran Phase 2 on:

```text
work/wbpp-20140303-good-nodark-noflats-control/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf
```

The run intentionally stopped after SCNR, before stock MLT denoise, to preserve a clean linear checkpoint for the RC Astro BXT/NXT branch.

Phase 2a ABE completed and wrote:

```text
work/02-linear-20140303-good-nodark-noflats-control/02a-abe.xisf
```

The first plate-solve attempt failed with the initial constrained settings:

```text
targetMax=2500
maxBox=85
magnitude=10.5
```

The retry solved successfully with:

```text
targetMax=5000
maxBox=140
magnitude=12.0
```

Solved result:

```text
Resolution: 2.304 arcsec/px
Focal distance: 385.88 mm
Field of view: 3d 19' 21.3" x 2d 12' 18.9"
Image center: RA 12h26m47.663s, Dec +12d21m52.20s
Reference catalog: TYCHO-2
Control points: 136
```

This confirms the ED80/reducer-scale hypothesis and proves the raw EXIF `50.0 mm` was stale.

SPCC completed with Canon EOS 60D R/G/B filters and background neutralization enabled, then SCNR completed:

```text
work/02-linear-20140303-good-nodark-noflats-control/02c-spcc.xisf
work/02-linear-20140303-good-nodark-noflats-control/02d-scnr.xisf
```

Rendered:

```text
docs/images/markarian-chain-20140303-phase2-nodark-scnr-linked-stf.jpg
```

The linked-STF preview is a major improvement over the WBPP masters after ABE, SPCC, and SCNR. The galaxies are visible and the color is much calmer, but red/blue streaky pattern noise remains visible across the field.

## 2026-06-03 - BXT/NXT Linear Branch

Ran the RC Astro linear branch from:

```text
work/02-linear-20140303-good-nodark-noflats-control/02d-scnr.xisf
```

Settings:

```text
BlurXTerminator AI4:
  sharpenStars=0.18
  adjustHalos=0.02
  sharpenNonstellar=0.28
  autoNonstellarPsf=true

NoiseXTerminator AI3:
  denoise=0.60
  denoiseColor=0.82
  denoiseLf=0.20
  denoiseLfColor=0.68
  frequencyScale=5
  iterations=2
  detail=0.14
```

Outputs:

```text
work/02-linear-20140303-good-nodark-bxt-nxt/02f-bxt.xisf
work/02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
```

Both plugins completed successfully.

## 2026-06-03 - Phase 3a MaskedStretch Checkpoint

Ran a first MaskedStretch from the BXT/NXT output:

```text
work/02-linear-20140303-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
```

Settings and output:

```text
MaskedStretch target background: 0.095
Output: work/03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch.xisf
Preview: docs/images/markarian-chain-20140303-bxt-nxt-maskedstretch.jpg
```

The automation log confirms MaskedStretch returned true and saved the output. The preview shows many Virgo galaxies clearly, including the main chain, but residual diagonal/color pattern noise is still prominent. This is a good first nonlinear review checkpoint, not a final candidate.

## 2026-06-03 - Sibling Right-Side Crop

Created a right-side sibling crop from the first MaskedStretch checkpoint:

```text
Input: work/03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch.xisf
Crop: centerX=0.71, centerY=0.5, width=0.58, height=1.0
Output: work/03-nonlinear-20140303-bxt-nxt-v1/03a-maskedstretch-right-half.xisf
Preview: docs/images/markarian-chain-20140303-bxt-nxt-maskedstretch-right-half.jpg
```

The crop preserves the original full-frame view as a sibling while adding a tighter composition around the more traditional Markarian Chain area on the right side of the frame. A first literal right-half crop clipped the bright galaxy near the upper-left edge of the cropped view, so the corrected version starts farther left. It reads better as a classic chain framing, though the same diagonal/color pattern noise is more apparent because the composition is tighter.

## 2026-06-03 - Pattern Noise Review And Dark-Branch Diagnostic

A close review of the no-dark right-side crop showed strong diagonal red/blue pattern noise. This looks like DSLR fixed-pattern/walking noise being revealed by the stretch and crop, so the next diagnostic was to process the dark-calibrated/no-flats WBPP master through the same downstream path rather than apply heavier late denoise to the no-dark branch.

Ran the dark-calibrated branch through Phase 2 ABE, ImageSolver, SPCC, and SCNR:

```text
Input: work/wbpp-20140303-good-dark25-30-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf
Output: work/02-linear-20140303-good-dark25-30-noflats-diagnostic/02d-scnr.xisf
```

The solver succeeded with the same wider settings used by the no-dark branch: `targetMax=5000`, `maxBox=140`, and `magnitude=12.0`.

Then ran the same BXT/NXT settings and MaskedStretch target background 0.095:

```text
work/02-linear-20140303-good-dark25-30-noflats-bxt-nxt/02g-bxt-nxt.xisf
work/03-nonlinear-20140303-dark-bxt-nxt-v1/03a-maskedstretch.xisf
work/03-nonlinear-20140303-dark-bxt-nxt-v1/03a-maskedstretch-right-side.xisf
```

Rendered:

```text
docs/images/markarian-chain-20140303-dark-bxt-nxt-maskedstretch.jpg
docs/images/markarian-chain-20140303-dark-bxt-nxt-maskedstretch-right-side.jpg
```

The dark-calibrated right-side crop is visibly cleaner than the no-dark crop. It still has DSLR background limitations, but the diagonal chroma streaking is much weaker. Promote the dark-calibrated branch for continued final polish while keeping the no-dark branch as a comparison.
