# M45 / Pleiades 2013-12-30 Processing Journey

This is the chronological record for the Pleiades project. Keep it focused on what was tried, what changed direction, and why.

## 2026-05-27 - Project Selection

After finishing the main Trifid/Lagoon work, Pleiades was considered as the next target. The repo already had completed or review-ready projects for M31, Rosette, Horsehead/Flame, M42, and Trifid/Lagoon, so starting a new target made sense.

Initial archive search found a strong M45 candidate:

- `by-date/20131230-coorg-keemale-m45-pleiades`
- `by-date/20131230-coorg-keemale-m45-pleiades/good`
- `finished-work/20131230-Pleiades-Cluster.jpg`

The old finished-work image clearly shows real blue-gray reflection nebulosity around the cluster, so the target is worth processing even with the modest 48 minute primary integration.

## 2026-05-27 - Archive Inventory

The archive search was expanded beyond the seed M45 folder using common aliases and likely misspellings: `pleiades`, `pleides`, `m45`, `seven sisters`, `ngc1432`, `ngc1435`, `maia`, `merope`, and `alcyone`.

Findings:

- Main 2013-12-30 Pleiades folder has 12 curated `good` CR2 lights at 240s ISO1600, with temperatures from +27 to +31 C.
- The same folder has 7 mixed trial shots. These are not a clean first-pass integration source.
- Old DSS/Photoshop-era products exist under `stacking/attempt-01` and `processing/attempt-01`.
- A finished-work JPEG exists under `finished-work/20131230-Pleiades-Cluster.jpg`.
- A separate 2013-01-13 `jupiter-and-pleides` folder has 13 x 10s wide-field frames at f/1.8. It is useful context but not compatible with the main M45 telescope-like dataset.

Calibration search found 9 Canon EOS 60D darks in `dark/canon-eos-60d/library-02/240s-1600iso`, spanning +25 to +30 C. No same-night flats or bias/dark-flats were found.

## 2026-05-27 - First Processing Direction

The main decision is to treat this as a faint reflection-dust target rather than a simple star cluster.

Plan implications:

- Start with the 12 x 240s good lights and 240s ISO1600 dark library.
- Do not raw-combine the January 2013 Jupiter/Pleiades wide-field data.
- Leave CFA on `AUTO` until a dataset-specific diagnostic says otherwise.
- Use Canon EOS 60D SPCC filter names after WCS is present.
- Be cautious with ABE/DBE because real reflection nebulosity and dust can be mistaken for gradient.
- Avoid aggressive SCNR or color neutralization that would bleach the blue reflection signal.

The first plan stops before heavy PixInsight processing so the branch choices can be reviewed.

## 2026-05-27 - Primary WBPP Branch

Ran the first Phase 1 branch:

```text
wbpp-20131230-good-dark25-30-noflats
```

Inputs:

- 12 x 240s ISO1600 Canon EOS 60D lights from `by-date/20131230-coorg-keemale-m45-pleiades/good`
- 9 x 240s ISO1600 Canon EOS 60D darks from `dark/canon-eos-60d/library-02/240s-1600iso`
- no flats
- no bias
- CFA `AUTO`

WBPP detected `GBRG` and registered all 12 lights. It produced autocropped and uncropped master lights plus a master dark. The log reported negative or insignificant pixel sample values after calibration and applied automatic output pedestals to the calibrated lights. Because of that calibration warning, a no-dark control became worth running later.

The linked-STF preview of the primary master showed very strong Pleiades dust signal, but with a heavy green cast before color calibration. The unlinked STF was also not color-trustworthy, confirming that linked previews and SPCC would be important.

## 2026-05-27 - Phase 2 Linear Processing

Ran Phase 2 on the primary dark-calibrated master:

```text
02-linear-20131230-good-dark25-30-noflats
```

Stages completed:

- ABE
- ImageSolver
- SPCC with Canon EOS 60D R/G/B filters
- SCNR
- MLT linear noise reduction

The solve confirmed the ED80/reducer interpretation:

```text
Resolution: 2.303 arcsec/px
Focal distance: 386.02 mm
Field of view: 3d 17' 31.3" x 2d 12' 39.2"
Image center: RA 03h46m42.722s, Dec +24d06m26.79s
```

SPCC completed successfully. The linked-STF Phase 2 preview is far more plausible than the raw WBPP preview, but the dust still leans cyan/blue-green. This led to a target-specific nonlinear polish rather than reusing M31 or Trifid scripts.

## 2026-05-27 - First Nonlinear Candidate

Ran MaskedStretch from the Phase 2 linear checkpoint with target background 0.095:

```text
work/03-nonlinear-20131230-v1/03a-maskedstretch.xisf
```

The MaskedStretch preview is restrained and clean: the main reflection dust is visible, the background is not over-bright, and the severe raw green cast is mostly gone.

Added a target-specific M45 polish script:

```text
scripts/pjsr/03p-m45-v1-polish.js
```

The script starts from the MaskedStretch image and applies:

- low-sky chroma cleanup,
- reflection-dust color shaping away from green/cyan toward blue-gray,
- bright-star halo restraint,
- mild LocalHistogramEqualization,
- final curves and restrained saturation.

Current v1 review candidate:

```text
docs/images/m45-20131230-v1-polish.jpg
work/03-nonlinear-20131230-v1/03p-m45-v1-polish.xisf
work/03-nonlinear-20131230-v1/m45-20131230-v1-polish.tif
```

## 2026-05-27 - No-Dark Control

Ran the planned no-dark control because the dark-calibrated branch required automatic pedestals:

```text
wbpp-20131230-good-nodark-noflats-control
```

It registered all 12 lights and produced a master, but the linked-STF preview had stronger broad-field gradient and did not improve the raw green/cyan behavior. Decision: keep the dark-calibrated branch as the baseline. The no-dark control is retained only as diagnostic evidence.

## 2026-05-27 - V2 Portrait Crop

After reviewing the full-frame v1 polish, created a portrait-oriented crop from the same nonlinear image rather than reprocessing the linear data.

Crop settings:

```text
input: work/03-nonlinear-20131230-v1/03p-m45-v1-polish.xisf
centerX: 0.51
centerY: 0.52
width: 0.49
height: 0.96
output: work/03-nonlinear-20131230-v1/03p-m45-v2-portrait-crop.xisf
```

The crop reduced the frame from 5146 x 3456 to 2522 x 3318 pixels, keeping the main blue reflection dust and bright cluster stars while dropping much of the less useful side margin.

Current v2 review candidate:

```text
docs/images/m45-20131230-v2-portrait-crop.jpg
work/03-nonlinear-20131230-v1/03p-m45-v2-portrait-crop.xisf
work/03-nonlinear-20131230-v1/m45-20131230-v2-portrait-crop.tif
```
