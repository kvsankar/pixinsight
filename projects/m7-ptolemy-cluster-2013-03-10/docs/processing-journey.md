# M7 / Ptolemy Cluster 2013-03-10 Processing Journey

This is the chronological run log for the M7 / Ptolemy Cluster project.

## 2026-06-03 - Target Selection

After checkpointing Canis Major, M7 / Ptolemy Cluster was selected as the next target. It is a useful change of pace from Canis: still a star-field/cluster target, but without Sirius dominating the frame.

## 2026-06-03 - Archive Search

Searched the local by-date archive for `m7`, `ptolemy`, `ngc6475`, `ngc-6475`, `scorpius`, `scorpio`, and `cluster`.

Direct target match:

```text
by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster
```

Generic name-only match:

```text
by-date/20130310-yelagiri-ymca-virgo-cluster-galaxies
```

The Virgo folder is a separate galaxy-field project and should not be mixed with M7.

No matching M7/Ptolemy/NGC 6475 finished-work JPEG was found in the finished-work search.

## 2026-06-03 - Source Inventory

The M7 folder contains `good`, `processing`, and `stacking` subfolders.

Usable raw groups under `good`:

| Group | Frames | Exposure | ISO | Temperature | Decision |
| --- | ---: | ---: | ---: | --- | --- |
| `120s-1600iso` | 5 | 120s | 1600 | +24 to +28 C | Primary branch |
| `60s-1600iso` | 8 | 60s | 1600 | +25 to +29 C | Sibling branch |
| `30s-1600iso` | 1 | 30s | 1600 | +27 C | Too sparse for integration |
| `01s-1600iso` | 1 | 1s | 1600 | +24 C | Too sparse for integration |

Historical artifacts:

```text
processing/attempt-01/m7-16bits-cropped-edited.jpg
processing/attempt-01/m7-16bits-cropped-edited.psd
stacking/attempt-01/Autosave.tif
stacking/attempt-01/m7-16bits.TIF
```

The historical JPEG was copied into the project docs as:

```text
docs/images/original-2013-attempt-01-cropped-edited.jpg
```

## 2026-06-03 - Calibration Read

The available 120s darks match exposure/ISO but are warmer than the M7 lights:

```text
dark/canon-eos-60d/library-02/120s-1600iso/33c
dark/canon-eos-60d/library-02/120s-1600iso/34c
dark/canon-eos-60d/library-02/120s-1600iso/35c
dark/canon-eos-60d/library-02/120s-1600iso/36c
```

The 60s darks are also warmer than the 60s lights:

```text
dark/canon-eos-60d/library-02/60s-1600iso/31c
dark/canon-eos-60d/library-02/60s-1600iso/32c
dark/canon-eos-60d/library-02/60s-1600iso/33c
```

No compatible 2013 M7 flats were found. The 2016 Yelagiri flat folder is not a baseline candidate.

Decision: start no-dark/no-flats for 120s and 60s separately. Use warmer darks only if the no-dark background is worse than expected.

## 2026-06-03 - Research And Plan

NASA identifies M7 as a bright open cluster in Scorpius with about 80 stars, apparent magnitude 3.3, and distance around 980 light-years. ESO image metadata gives a useful plate-solve seed of RA 17 53 51.21, Dec -34 47 34.34.

Processing implications:

- M7 is not a faint-nebula target; star color, star shape, and natural field density matter most.
- Background extraction must be restrained because the field is in the Milky Way and may include real star-cloud/dust variation.
- Use modest BXT/NXT if the linear branch is clean enough; keep a stock comparison if BXT/NXT hardens stars.
- Create narrow LLM-as-judge crops for cluster core, bright stars, representative background, and corner stars before accepting a branch.

## 2026-06-03 - Phase 1 WBPP

Ran the 120s no-dark/no-flats branch:

```text
work/wbpp-20130310-120s-nodark-noflats
```

Result:

- 5 lights loaded.
- WBPP completed with exit code 0.
- 5/5 frames registered.
- 0 rejected.
- Autocropped master size: 5201 x 3460.

Rendered:

```text
docs/images/m7-20130310-wbpp-120s-nodark-linked-stf.jpg
docs/images/m7-20130310-wbpp-120s-nodark-unlinked-stf.jpg
```

Ran the 60s no-dark/no-flats sibling:

```text
work/wbpp-20130310-60s-nodark-noflats
```

Result:

- 8 lights loaded.
- WBPP completed with exit code 0.
- 8/8 frames registered.
- 0 rejected.
- Autocropped master size: 4770 x 2230.

Rendered:

```text
docs/images/m7-20130310-wbpp-60s-nodark-linked-stf.jpg
docs/images/m7-20130310-wbpp-60s-nodark-unlinked-stf.jpg
```

Decision: continue Phase 2 on the 120s branch first because it has slightly more total integration and a much more complete field after autocrop. Keep 60s as a sibling diagnostic for star color/saturation.

## 2026-06-03 - Phase 2 120s Branch

Ran Phase 2 on the 120s autocropped master:

```text
work/02-linear-20130310-120s-nodark-noflats
```

Stages completed:

- `02a-abe.xisf`
- `02b-solved.xisf`
- `02c-spcc.xisf`
- `02d-scnr.xisf`
- `02e-linear-nr.xisf`

The solve succeeded with the ED80/reducer-scale seed, confirming that the raw 50 mm EXIF is stale for this session:

```text
Focal distance: 480.31 mm
Resolution: 1.851 arcsec/px
Field of view: 2d 40' 26.5" x 1d 46' 44.1"
Image center: RA 17 53 36.834, Dec -34 45 20.17
```

Rendered:

```text
docs/images/m7-20130310-phase2-120s-scnr-linked-stf.jpg
```

## 2026-06-03 - Conservative BXT/NXT

Ran BXT/NXT from the 120s `02d-scnr.xisf` checkpoint into:

```text
work/02-linear-20130310-120s-bxt-nxt
```

Settings:

```text
BXT stars=0.12, halos=0.01, nonstellar=0.10
NXT luminance=0.52, color=0.76, low-frequency luminance=0.18, low-frequency color=0.58
```

This branch intentionally stays mild because M7 is a star-field target; over-hardening stars would be worse than leaving a little softness.

Rendered:

```text
docs/images/m7-20130310-bxt-nxt-linear-linked-stf.jpg
```

## 2026-06-03 - First Nonlinear Review Candidate

Ran the generic MaskedStretch helper from the BXT/NXT linear checkpoint with target background 0.075:

```text
work/03-nonlinear-20130310-120s-bxt-nxt-v1/03a-maskedstretch-bg075.xisf
```

Rendered:

```text
docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg
```

This is the first review branch, not a final. It is deliberately restrained so the sky does not become gray and the star field does not look overprocessed.

## 2026-06-03 - First Judge Crops

Created four crops from the first nonlinear branch:

| Crop | Geometry | File |
| --- | --- | --- |
| Cluster core | centerX 0.51, centerY 0.52, width 0.18, height 0.24 | `docs/images/m7-20130310-judge-01-cluster-core.jpg` |
| Medium star field | centerX 0.68, centerY 0.48, width 0.18, height 0.24 | `docs/images/m7-20130310-judge-02-medium-star-field.jpg` |
| Background/star-cloud | centerX 0.25, centerY 0.72, width 0.18, height 0.24 | `docs/images/m7-20130310-judge-03-background-star-cloud.jpg` |
| Corner stars | centerX 0.86, centerY 0.18, width 0.18, height 0.24 | `docs/images/m7-20130310-judge-04-corner-stars.jpg` |

ROI stats:

- Core median: roughly 0.082-0.091 by channel.
- Background median: roughly 0.069-0.075 by channel.
- Corner median: roughly 0.063-0.071 by channel.
- Core pixels above 0.98: roughly 0.024-0.036% by channel.
- Background/corner pixels above 0.98: less than about 0.006% by channel.

Interpretation: bright star cores clip in small areas, but not across a large part of the crop. Background and corner crops are restrained enough for review; visual review should focus on star shape, BXT hardness, and any chroma speckling.

## 2026-06-04 - Dark-Lane Contrast Sibling

After reviewing the first regular M7 render, the dark lanes around the cluster looked present but too subtle. The user clarified that the goal was better contrast so the black dust-lane structure is more visible, not simply a brighter overall stretch.

Added a target-specific PixInsight finishing script:

```text
scripts/pjsr/03m7-dark-lane-contrast.js
```

The script starts from the regular nonlinear branch:

```text
work/03-nonlinear-20130310-120s-bxt-nxt-v1/03a-maskedstretch-bg075.xisf
```

It applies mild large-scale LocalHistogramEqualization and a lower-shadow S-curve. This keeps the branch as a real-data transformation: no generated stars, no painted dust, and no synthetic texture.

Output:

```text
work/03-nonlinear-20130310-120s-bxt-nxt-v2-dark-lane-contrast/03b-dark-lane-contrast.xisf
docs/images/m7-20130310-bxt-nxt-v2-dark-lane-contrast.jpg
```

Created matched v2 judge crops using the same geometry as the first LLM-as-judge crop set:

| Crop | File |
| --- | --- |
| Cluster core | `docs/images/m7-20130310-v2-judge-01-cluster-core.jpg` |
| Medium star field | `docs/images/m7-20130310-v2-judge-02-medium-star-field.jpg` |
| Background/star-cloud | `docs/images/m7-20130310-v2-judge-03-background-star-cloud.jpg` |
| Corner stars | `docs/images/m7-20130310-v2-judge-04-corner-stars.jpg` |

ROI comparison:

- V1 background/corner medians were roughly 0.063-0.075 by channel.
- V2 background medians dropped to roughly 0.048-0.054 by channel.
- V2 corner medians dropped to roughly 0.043-0.049 by channel.
- Background/corner pixels above 0.98 stayed very low, roughly 0.003-0.006% by channel.

Decision: keep v2 as a sibling review branch. It should make the dark lanes read more clearly, but it needs visual review to decide whether the extra black-point contrast feels natural or too hard.

## 2026-06-04 - Project Checkpoint

Visual review found that the regular v1 render and the v2 dark-lane contrast render are not meaningfully different in practice. The measured median drop in the v2 background did not translate into a stronger-enough visual result to justify promoting it.

Accepted checkpoint:

```text
docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg
```

Diagnostic sibling retained:

```text
docs/images/m7-20130310-bxt-nxt-v2-dark-lane-contrast.jpg
```

Decision: wrap the M7 project for this pass with the regular 120s BXT/NXT MaskedStretch as the presentation image. Keep the 60s branch and v2 dark-lane contrast branch documented as diagnostics, but do not spend more processing time chasing a small contrast difference in this thin dataset.
