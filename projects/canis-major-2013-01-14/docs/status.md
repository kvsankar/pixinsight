# Canis Major 2013-01-14 Processing - Status

**As of:** 2026-06-03 IST, this project has completed source inventory, target research, a failed standard WBPP registration attempt, a WCS-based recovery integration, Phase 2 linear processing, and a first nonlinear v2 review branch.
**Pipeline progress:** 85%, first review candidate ready from the `no-hallow-group` WCS branch.

For the processing plan, see [Processing pipeline](pipeline.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [Canis Major processing research](research/01-canis-major-processing.md).
For historical local artifacts, see [Original 2013 processing evidence](original-2013-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE VIA WCS RECOVERY
PHASE 2 - Linear post-integration                  COMPLETE
PHASE 3 - Nonlinear processing/export              COMPLETE, V2 REVIEW
PHASE 4 - LLM-as-judge crop review                 COMPLETE FOR V2
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | Canis Major wide field, centered on Sirius / M41 context |
| Primary date found | 2013-01-14 |
| Main source folder | `by-date/20130114-yelagiri-ymca-canis-major` |
| Camera | Canon EOS 60D |
| Optic | Canon EF 50mm f/1.8 II |
| Exposure pattern | 10s, ISO 1600, f/1.8 |
| Raw image size | 5184 x 3456 |
| Estimated image scale | about 17.8 arcsec/px at 50 mm and 4.31 um pixels |
| Estimated full-frame FOV | about 25.6 deg x 17.1 deg |
| Primary candidate branch | `lights-cr2/no-hallow-group`, 33 CR2 |
| Diagnostic/reject branch | `lights-cr2/hallow-group`, 40 CR2 |
| Historical reference | `docs/images/original-2013-attempt-01-stacked-pse.jpg` |
| Current accepted branch | WCS-aligned `no-hallow-group`, 18 x 10s |
| Current review image | `docs/images/canis-major-2013-wcs-v2-review.jpg` |

## Archive Search Results

The local archive search used aliases and identifiers: `canis`, `major`, `sirius`, `m41`, `ngc2287`, and `ngc-2287`.

| Archive-relative path | Contents | Decision |
| --- | --- | --- |
| `by-date/20130114-yelagiri-ymca-canis-major/lights-cr2/no-hallow-group` | 33 CR2 lights plus DSS-era sidecars | Primary branch |
| `by-date/20130114-yelagiri-ymca-canis-major/lights-cr2/hallow-group` | 40 CR2 lights | Diagnostic/reject until inspected separately |
| `by-date/20130114-yelagiri-ymca-canis-major/lights-jpg` | 73 camera JPEGs matching the raw lights | Quick visual reference only |
| `by-date/20130114-yelagiri-ymca-canis-major/snaps` | 2 JPG snapshots | Context only |
| `by-date/20130114-yelagiri-ymca-canis-major/processing/atttempt-01` | Old processed JPEG/TIFF outputs | Historical reference only |
| `by-date/20130114-yelagiri-ymca-canis-major/stacking/attempt-01` | Old DSS `Autosave.tif` | Historical stack evidence only |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster` | Separate M7/Ptolemy Cluster dataset | Separate future project, do not combine |

No other by-date folder matched the Canis Major / Sirius / M41 aliases.

## Light Inventory

| Group | Frames | Exposure | ISO | Temp range | Stdev range | First-pass use |
| --- | ---: | ---: | ---: | --- | --- | --- |
| `lights-cr2/no-hallow-group` | 33 | 10s | 1600 | +29 to +39 C | 944 to 1069 | Primary branch |
| `lights-cr2/hallow-group` | 40 | 10s | 1600 | +28 to +38 C | 595 to 674 | Diagnostic/reject branch |

Temperature distribution:

| Group | Distribution |
| --- | --- |
| `no-hallow-group` | +29 C x4, +30 C x11, +31 C x6, +32 C x2, +33 C x3, +34 C x1, +35 C x1, +36 C x2, +37 C x2, +39 C x1 |
| `hallow-group` | +28 C x8, +29 C x12, +30 C x11, +31 C x2, +32 C x1, +33 C x2, +34 C x1, +35 C x1, +36 C x1, +38 C x1 |

## Calibration Inventory

| Calibration source | Count | Match quality | Candidate use |
| --- | ---: | --- | --- |
| `dark/canon-eos-60d/library-02/10s-1600iso/30c` | 2 | Exposure/ISO close; sparse | Add to primary dark set |
| `dark/canon-eos-60d/library-02/10s-1600iso/31c` | 5 | Exposure/ISO close; sparse | Add to primary dark set |
| `dark/canon-eos-60d/library-02/10s-1600iso/32c` | 43 | Strongest match by count | Primary dark support |
| `dark/canon-eos-60d/library-02/10s-1600iso/33c` | 10 | Good warm support | Add to primary dark set |
| `dark/canon-eos-60d/library-01/010s-1600iso/31c` through `39c` | sparse | Same-night-ish warm diagnostic support | Defer unless primary dark set over/undercorrects |
| `flat/20130211-f10-1by3200-1600iso` | found | Does not match 50mm f/1.8 science frames | Reject for first pass |

Current calibration decision:

1. Run the `no-hallow-group` primary branch with the 30-33 C library-02 10s/ISO1600 darks and no flats.
2. Keep a no-dark/no-flats control available if the dark-calibrated branch shows overcorrection, odd color, or calibration artifacts.
3. Do not use the available `f10` flats for this f/1.8 lens dataset.
4. Do not combine the `hallow-group` with the `no-hallow-group` until the primary branch has been integrated and inspected.

## Processing Decisions So Far

- Created project scaffold: `projects/canis-major-2013-01-14/`.
- Confirmed only one Canis Major by-date folder.
- Confirmed camera and lens via EXIF: Canon EOS 60D, Canon EF 50mm f/1.8 II, 50.0 mm, f/1.8.
- Confirmed the filename metadata matches EXIF: 10s, ISO1600, warm DSLR sensor temperatures.
- Chose the `no-hallow-group` as the first branch because preview frames show a more controlled Sirius halo, richer usable star field, and it appears to be the old DSS stack branch.
- Treated the `hallow-group` as a diagnostic/reject branch because preview frames show a broader Sirius halo and fewer useful stars.
- Copied a compressed historical reference from the old processed JPEG to `docs/images/original-2013-attempt-01-stacked-pse.jpg`.
- Wrote the initial target-specific research and pipeline plan.
- Ran the primary dark-calibrated WBPP branch. Calibration, debayer, and subframe measurement succeeded for all 33 lights, but StarAlignment only registered 2 of 33 frames, so no useful WBPP master light was produced.
- Diagnosed WBPP's auto-selected reference as a poor frame with a doubled/jerked Sirius profile. Even with a cleaner manual reference, StarAlignment remained brittle on this wide 50mm dataset.
- Plate-solved a clean frame and used PixInsight `AlignByCoordinates` as a WCS-based recovery path. The recovery branch solved/aligned/integrated 18 real calibrated frames.
- Cropped the WCS master to remove reprojection borders, then ran ABE, ImageSolver, SPCC, SCNR, and MLT linear noise reduction.
- Created nonlinear v1 and v2 branches. v2 is the current review candidate because it slightly reduces saturated highlight color around Sirius while keeping the same field depth.

## Processing Runs Completed

| Stage | Result |
| --- | --- |
| WBPP no-hallow dark30-33 no-flats | Calibration 33/33, Debayer 33/33, SubframeSelector 33/33, StarAlignment 2/33; rejected as an integration path |
| WCS solve recovery | 17/32 batch frames solved, plus one clean reference solved separately |
| WCS alignment | 18/18 solved frames aligned with `AlignByCoordinates` |
| WCS integration | `work/master-wcs-no-hallow/masterLight_canis-major-20130114_no-hallow_18x10s_wcs.xisf` |
| Linear crop | `work/master-wcs-no-hallow/masterLight_canis-major-20130114_no-hallow_18x10s_wcs_crop.xisf`, 4942 x 3048 |
| Phase 2 | `work/02-linear-wcs-no-hallow-18x10s/02e-linear-nr.xisf` |
| Nonlinear v1 | `work/03-nonlinear-wcs-no-hallow-18x10s/canis-major-2013-wcs-v1.jpg` |
| Nonlinear v2 | `work/03-nonlinear-wcs-no-hallow-18x10s/canis-major-2013-wcs-v2.jpg`; current review candidate |

## LLM-As-Judge Crop Review

Reviewed four v2 crops: Sirius halo, M41, upper-left corner stars, and representative background field.

Findings:

- Sirius: halo is broad but natural for this data; saturated core remains slightly pink but less aggressive in v2 than v1.
- M41: cluster is visible and recognizable within the dense field.
- Corner stars: elongated/comatic shapes remain; this appears to be real 50mm f/1.8 plus tracking/registration behavior, not a cleanup target.
- Background: dark and somewhat noisy, but star colors are preserved and the field does not look painted or synthetic.

Decision: keep v2 as the current review branch. Avoid BXT/star reduction for now because the artifacts are dominated by real capture/lens limitations and the image is almost entirely stars.

## First Visual Read

- The image is a wide-field star-color target, not a faint-nebula target.
- Sirius is the dominant challenge: its core and halo must be allowed to look bright without turning the whole field into a glare-processing artifact.
- M41 is visible near the lower central field in the historical reference and should be preserved as a recognizable cluster.
- The old reference has strong contrast and many small elongated stars; the modern run should improve star shape where the data allows without inventing or painting in anything.
- The no-flats field will likely have vignetting and color gradient from the fast lens; background correction must be careful but does not need to protect faint nebulosity in the way Eta Carinae did.

## Review Questions

1. Does the primary dark-calibrated branch control hot pixels/pattern noise without overcorrecting the warm lights?
2. Are the `no-hallow-group` stars acceptable across the wide 50mm field?
3. Does Sirius look natural enough, or does the final presentation need masked halo/core restraint?
4. Should the `hallow-group` be discarded permanently or processed as a comparison?
5. Should final framing keep the full constellation field or crop tighter around Sirius and M41?

## Outputs

| Output | Status |
| --- | --- |
| `projects/canis-major-2013-01-14/` | Project scaffold created |
| `docs/status.md` | Inventory and current state written |
| `docs/processing-journey.md` | Chronological run log started |
| `docs/pipeline.md` | Processing plan written |
| `docs/original-2013-processing.md` | Historical artifact note written |
| `docs/research/01-canis-major-processing.md` | Target-specific research note written |
| `docs/images/original-2013-attempt-01-stacked-pse.jpg` | Compressed historical reference |
| `docs/images/canis-major-2013-wcs-v2-review.jpg` | Compressed v2 review image |
| `docs/images/canis-major-2013-wcs-v2-judge-crops.jpg` | v2 LLM-as-judge crop sheet |
| `work/03-nonlinear-wcs-no-hallow-18x10s/canis-major-2013-wcs-v2.jpg` | Current nonlinear review export, ignored by git |
