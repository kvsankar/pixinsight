# Omega Centauri 2014-05-04 Processing Journey

This is the chronological record of what was tried and what was learned while processing the Omega Centauri project.

## 2026-06-03 - Target Switch

After committing and pushing the Markarian Chain project, switched to the star-cluster target from the earlier candidate list. The intended target is Omega Centauri / NGC 5139, not the separate M7/Ptolemy open-cluster folder.

## 2026-06-03 - Archive Search

Searched the local `by-date` archive for:

```text
omega
centauri
ngc5139
ngc-5139
cluster
globular
```

Candidate hits:

| Candidate | Notes |
| --- | --- |
| `20140504-yelagiri-kairos-ngc5139-omega-centauri` | Primary Omega Centauri session |
| `20130310-yelagiri-ymca-m7-ptolemy-cluster` | Separate open-cluster target |
| `20130310-yelagiri-ymca-virgo-cluster-galaxies` | Galaxy cluster wording, already treated as separate from Markarian |

The Omega session also has an old finished-work reference:

```text
finished-work/20140504-Omega-Centauri.jpg
```

## 2026-06-03 - Source Inventory

The Omega source folder contains:

- 27 top-level CR2 lights in `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/good`.
- 3 CR2 lights in `good/tree-obstructed`.
- 7 CR2 trial frames in `trial-shots`.
- DSS/processing artifacts under `good`, `stacking/attempt-01`, and `processing/attempt-01`.

Primary top-level `good` lights are homogeneous:

```text
27 x 60s ISO800, Canon EOS 60D
Temperature range: +31 to +34 C
```

Temperature counts:

```text
+31 C: 1
+33 C: 5
+34 C: 21
```

EXIF reports `50.0 mm` and `Aperture=Inf`, which matches the stale-focal-length caveat seen in other 2014 telescope sessions. Treat the ED80/reducer-scale solve seed around 386 mm as the better starting hypothesis until Phase 2 proves otherwise.

## 2026-06-03 - Calibration Search

No matching Canon 60D 60s ISO800 darks were found in the searched dark library.

The nearest dark family found was:

```text
dark/canon-eos-60d/library-02/60s-1600iso/31c
dark/canon-eos-60d/library-02/60s-1600iso/32c
dark/canon-eos-60d/library-02/60s-1600iso/33c
```

Counts:

```text
+31 C: 1
+32 C: 11
+33 C: 18
```

Because the ISO differs from the ISO800 lights, these are not primary calibration frames. Keep them only as a named diagnostic if the no-dark branch shows severe fixed-pattern noise.

No same-session/target-named flats were found in this pass.

## 2026-06-03 - Phase 0 Deliverables

Created and wrote:

- `docs/status.md`
- `docs/processing-journey.md`
- `docs/pipeline.md`
- `docs/original-2014-processing.md`
- `docs/research/01-omega-centauri-processing.md`

Updated local `.env` to point at this project and the Omega Centauri source data. Updated the repo `readme.md` so the project docs are reachable from the top level.

## 2026-06-03 - Phase 1 WBPP No-Dark / No-Flats

Ran the primary WBPP branch using the 27 top-level `good` lights only:

```text
Output subdir: wbpp-20140504-good-nodark-noflats
Lights: 27 x 60s ISO800
Darks: none
Flats: none
Bias: none
```

Result:

- WBPP completed successfully.
- All 27 lights registered.
- LocalNormalization succeeded for all 27 lights.
- No frames were rejected.
- Created both full and autocropped integrated masters.

Rendered Phase 1 previews:

- `docs/images/omega-centauri-20140504-wbpp-nodark-linked-stf.jpg`
- `docs/images/omega-centauri-20140504-wbpp-nodark-unlinked-stf.jpg`

Read:

The no-dark/no-flats integration has strong vignetting and DSLR color imbalance, as expected without flats. The cluster itself is registered and visible, so the branch is good enough to carry into Phase 2 before deciding whether the ISO-mismatched dark diagnostic is worth the risk.

## 2026-06-03 - Phase 2 ABE / Plate Solve / SPCC / SCNR

Ran Phase 2 from the autocropped Phase 1 master:

```text
Input: work/wbpp-20140504-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-60.00s_FILTER-NoFilter_RGB_autocrop.xisf
Output subdir: 02-linear-20140504-good-nodark-noflats
Solve seed: RA 201.697 deg, Dec -47.4795 deg, focal 386 mm, pixel 4.31 um
SPCC filters: Canon EOS 60D R/G/B
```

Outputs:

- `work/02-linear-20140504-good-nodark-noflats/02a-abe.xisf`
- `work/02-linear-20140504-good-nodark-noflats/02b-solved.xisf`
- `work/02-linear-20140504-good-nodark-noflats/02c-spcc.xisf`
- `work/02-linear-20140504-good-nodark-noflats/02d-scnr.xisf`

Plate-solve facts:

```text
Reference catalog: TYCHO-2
Control points: 622
Resolution: 2.304 arcsec/px
Focal distance: 385.88 mm
Pixel size: 4.31 um
FOV: 3d 19' 39.7" x 2d 12' 51.1"
Image center: RA 13 26 38.429, Dec -47 25 06.09
Rotation: 91.536 deg
Observation interval: 2014-05-03 19:40:28 to 20:13:41 UTC
```

Rendered:

- `docs/images/omega-centauri-20140504-phase2-nodark-scnr-linked-stf.jpg`

Read:

SPCC/SCNR moved the data out of the harsh green/magenta state. The background remains uneven because there are no flats, but the branch is now color-calibrated, solved, and ready for the conservative RC Astro linear pass.

## 2026-06-03 - Conservative BXT/NXT Linear Branch

Ran BXT/NXT on `02d-scnr.xisf`:

```text
Output subdir: 02-linear-20140504-good-nodark-bxt-nxt
BXT sharpen stars: 0.14
BXT adjust halos: 0.02
BXT sharpen nonstellar: 0.14
NXT denoise: 0.56
NXT denoise color: 0.78
NXT low-frequency denoise: 0.16
NXT low-frequency color: 0.55
NXT frequency scale: 5
NXT iterations: 2
NXT detail: 0.12
```

Outputs:

- `work/02-linear-20140504-good-nodark-bxt-nxt/02f-bxt.xisf`
- `work/02-linear-20140504-good-nodark-bxt-nxt/02g-bxt-nxt.xisf`

Read:

The pass completed successfully. The settings stayed restrained because Omega Centauri is dominated by stars, and over-tightening would quickly make the cluster look brittle or artificial.

## 2026-06-03 - First Nonlinear Candidate

Ran MaskedStretch from the BXT/NXT output:

```text
Input: work/02-linear-20140504-good-nodark-bxt-nxt/02g-bxt-nxt.xisf
Output subdir: 03-nonlinear-20140504-good-nodark-bxt-nxt-v1
Target background: 0.075
```

Output:

- `work/03-nonlinear-20140504-good-nodark-bxt-nxt-v1/03a-maskedstretch.xisf`

Rendered:

- `docs/images/omega-centauri-20140504-bxt-nxt-maskedstretch.jpg`

Read:

The first stretch is surprisingly usable for a 27-minute no-dark/no-flats DSLR dataset. It still carries residual vignetting, chroma speckles, and background texture, but the cluster is clean enough to evaluate with crops.

## 2026-06-03 - Centered Presentation Crop

Created a centered crop from the first MaskedStretch candidate:

```text
Center X/Y: 0.48, 0.51
Width/height: 0.58, 0.82
Crop size: 3016 x 2837
```

Outputs:

- `work/03-nonlinear-20140504-good-nodark-bxt-nxt-v1/review-crops/03a-maskedstretch-centered-crop.xisf`
- `docs/images/omega-centauri-20140504-bxt-nxt-maskedstretch-centered-crop.jpg`

Read:

The centered crop is a better presentation framing than the full frame. It keeps enough surrounding field to show scale while making Omega Centauri the clear subject.

## 2026-06-03 - LLM-As-Judge Narrow Crop Set

Rendered four narrow diagnostic crops:

| Crop | Geometry | Output |
| --- | --- | --- |
| Core | centerX 0.48, centerY 0.51, width 0.16, height 0.24 | `docs/images/omega-centauri-20140504-judge-core.jpg` |
| Outer halo | centerX 0.39, centerY 0.56, width 0.16, height 0.24 | `docs/images/omega-centauri-20140504-judge-outer-halo.jpg` |
| Corner stars | centerX 0.86, centerY 0.18, width 0.16, height 0.24 | `docs/images/omega-centauri-20140504-judge-corner-stars.jpg` |
| Background edge | centerX 0.88, centerY 0.78, width 0.16, height 0.24 | `docs/images/omega-centauri-20140504-judge-background-edge.jpg` |

Read:

- The core is bright and slightly soft, but still resolved. A second stretch branch may recover a more graceful core gradient.
- The outer halo crop shows believable star preservation, with visible DSLR pattern/chroma noise in the background.
- The corner star crop does not show a catastrophic star-shape problem.
- The background edge crop is the weakest: chroma speckles and no-flats texture remain visible.

Decision:

Keep the no-dark BXT/NXT MaskedStretch branch as the first review candidate. Do not run the ISO1600 dark diagnostic automatically; it remains a contingency if the user decides the background texture is unacceptable.
