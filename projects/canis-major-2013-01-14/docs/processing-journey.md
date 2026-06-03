# Canis Major 2013-01-14 Processing Journey

This is the chronological record of what was tried and what was learned while starting the Canis Major wide-field project.

## 2026-06-03 - Target Selection

After checkpointing Eta Carinae, selected Canis Major as the next project.

Reason for choosing it:

- It is a fresh target type after galaxies, a globular cluster, and a bright emission nebula.
- It is a wide-field star-color composition, with Sirius and M41 as natural anchors.
- It has enough raw frames to process meaningfully: 73 CR2 lights split into two named groups.
- It has historical stack/processing artifacts for reference.

## 2026-06-03 - Archive Search

Searched the local `by-date` archive for:

```text
canis
major
sirius
m41
ngc2287
ngc-2287
```

Only one matching Canis Major folder was found:

```text
by-date/20130114-yelagiri-ymca-canis-major
```

One separate M41-adjacent open cluster target was also found:

```text
by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster
```

That is a separate M7/Ptolemy Cluster dataset and should not be combined with Canis Major.

## 2026-06-03 - Source Inventory

The source folder contains 73 CR2 raw lights total:

| Folder | CR2 count | Decision |
| --- | ---: | --- |
| `lights-cr2/no-hallow-group` | 33 | Primary branch |
| `lights-cr2/hallow-group` | 40 | Diagnostic/reject until separately inspected |

The folder also contains:

- `lights-jpg`: 73 camera JPEGs matching the raw lights.
- `snaps`: 2 context JPGs.
- `processing/atttempt-01`: old processed JPEG/TIFF outputs.
- `stacking/attempt-01`: old DSS `Autosave.tif`.

## 2026-06-03 - EXIF Check

Sampled raw files from both light groups.

Findings:

```text
Camera: Canon EOS 60D
Lens: Canon EF 50mm f/1.8 II
Focal length: 50.0 mm
Aperture: f/1.8
Exposure: 10s
ISO: 1600
Raw size: 5184 x 3456
```

Unlike several telescope-era datasets, the EXIF focal length appears trustworthy here because the lens model and f/ratio are present and match the filenames.

## 2026-06-03 - Light Group Visual Check

Previewed representative camera JPEGs from both groups.

Read:

- `no-hallow-group` has Sirius controlled enough, a richer visible star field, and M41 visible. It also has higher background stdev and warmer late frames.
- `hallow-group` has a broader Sirius halo and fewer visible useful stars in the inspected preview. Despite lower stdev filenames, it is not the preferred first branch.

Decision:

Start with `no-hallow-group`.

## 2026-06-03 - Calibration Search

Found 10s ISO1600 Canon EOS 60D darks:

| Dark source | Count |
| --- | ---: |
| `dark/canon-eos-60d/library-02/10s-1600iso/30c` | 2 |
| `dark/canon-eos-60d/library-02/10s-1600iso/31c` | 5 |
| `dark/canon-eos-60d/library-02/10s-1600iso/32c` | 43 |
| `dark/canon-eos-60d/library-02/10s-1600iso/33c` | 10 |

Also found sparse 10s ISO1600 darks in `library-01/010s-1600iso` from +31 C through +39 C, but the first baseline will use the stronger library-02 30-33 C set.

Found one flat folder:

```text
flat/20130211-f10-1by3200-1600iso
```

Rejected it for the first pass because it does not match the 50mm f/1.8 light frames.

## 2026-06-03 - Historical Reference

Found old processing artifacts:

```text
by-date/20130114-yelagiri-ymca-canis-major/processing/atttempt-01/canis-major-stacked-pse.jpg
by-date/20130114-yelagiri-ymca-canis-major/processing/atttempt-01/canis-major-stacked-pse.tif
by-date/20130114-yelagiri-ymca-canis-major/processing/atttempt-01/canis-major-stacked.TIF
by-date/20130114-yelagiri-ymca-canis-major/stacking/attempt-01/Autosave.tif
```

Created a compressed project reference:

```text
docs/images/original-2013-attempt-01-stacked-pse.jpg
```

The reference shows Sirius, M41, a rich star field, and many elongated small stars. It is useful for orientation and taste, but it is not ground truth.

## 2026-06-03 - Phase 0 Deliverables

Created and wrote:

- `docs/status.md`
- `docs/processing-journey.md`
- `docs/pipeline.md`
- `docs/original-2013-processing.md`
- `docs/research/01-canis-major-processing.md`

Initial Phase 1 decision:

Run the `no-hallow-group` primary branch with 10s ISO1600 darks from library-02 30-33 C, no flats, and no bias.

## 2026-06-03 - Phase 1A WBPP Attempt

Ran the primary `no-hallow-group` branch through WBPP with library-02 30-33 C darks and no flats.

Results:

| WBPP step | Result |
| --- | --- |
| ImageCalibration | 33 succeeded, 0 failed |
| Debayer | 33 succeeded, 0 failed |
| SubframeSelector | 33 succeeded, 0 failed |
| StarAlignment | 2 succeeded, 31 failed |
| LocalNormalization | 2 succeeded, 0 failed |

WBPP did not produce a useful master light because only two frames registered. The failure mode was repeated RANSAC failure / not enough valid star-pair matches.

The wrapper initially reported the master dark as the master light because the output search was too broad, but the WBPP log confirmed no integrated master light was produced.

## 2026-06-03 - Registration Diagnosis

Rendered individual calibrated/debayered frames for inspection.

Important finding:

- WBPP auto-selected the `00h37m55s259ms` frame as reference.
- That frame has a visibly doubled/jerked Sirius profile.
- A neighboring frame around `00h37m32s383ms` is much cleaner and solved successfully.

Tried standalone StarAlignment tests:

- Old DSS `Autosave.tif` as a geometry-only reference: failed.
- WBPP auto reference against adjacent frames: failed.
- Clean manual reference against nearby and far frames: still failed in direct StarAlignment.
- The standalone helper could reproduce WBPP's one successful non-reference registration, so the problem was not merely command plumbing.

Conclusion:

This 50mm dataset is a poor fit for plain StarAlignment across the whole run. It behaves more like a wide-field/tripod sequence with variable frame quality and large enough geometry changes to make descriptor matching brittle.

## 2026-06-03 - WCS Recovery Branch

Tested PixInsight ImageSolver on the clean `00h37m32s383ms` frame. It solved successfully with an actual field center near:

```text
RA  = 102.75695 deg
Dec = -22.93256 deg
```

This corrected the initial rough solve seed, which had been only a Sirius/M41 contextual estimate.

Built a WCS-based recovery path:

1. Batch solved the calibrated/debayered no-halo frames, excluding the visibly bad doubled-Sirius frame.
2. 17 of 32 batch frames solved. The remaining 15 failed at initial field alignment, mostly on the hotter/earlier part of the set.
3. Added the separately solved clean reference frame back into the branch.
4. Aligned 18 solved frames with PixInsight `AlignByCoordinates`.
5. Integrated the aligned frames into a 18 x 10s master.

Current WCS master:

```text
work/master-wcs-no-hallow/masterLight_canis-major-20130114_no-hallow_18x10s_wcs.xisf
```

The WCS master had reprojection borders, so it was cropped to 4942 x 3048:

```text
work/master-wcs-no-hallow/masterLight_canis-major-20130114_no-hallow_18x10s_wcs_crop.xisf
```

## 2026-06-03 - Phase 2 And Nonlinear v1/v2

Ran Phase 2 on the cropped WCS master:

- ABE
- ImageSolver with corrected 50mm WCS seed
- SPCC using Canon EOS 60D filters
- SCNR
- MLT linear noise reduction

Phase 2 output:

```text
work/02-linear-wcs-no-hallow-18x10s/02e-linear-nr.xisf
```

Ran a dark MaskedStretch (`targetBackground=0.085`) followed by a Canis-specific v1 polish. The first v1 image had a good wide-field look but Sirius retained a slightly strong magenta core.

Ran v2 with stronger highlight desaturation and slightly lower saturation. v2 is the current review candidate:

```text
work/03-nonlinear-wcs-no-hallow-18x10s/canis-major-2013-wcs-v2.jpg
```

## 2026-06-03 - LLM-As-Judge Crop Review

Created four narrow crops for v2:

- Sirius halo/core
- M41 cluster
- upper-left corner star field
- representative background field

Findings:

- Sirius is bright with a broad halo, as expected. v2 reduces the saturated color core slightly.
- M41 is readable and placed naturally inside the rich star field.
- Corner star shapes remain elongated/comatic. Treat as a real acquisition/lens limitation, not something to fake-correct.
- Background is dark and dense, with visible noise and many stars, but not obviously overprocessed.

Decision:

Keep v2 as the current review branch. Do not apply aggressive BXT, star reduction, or synthetic-looking cleanup on this target.
