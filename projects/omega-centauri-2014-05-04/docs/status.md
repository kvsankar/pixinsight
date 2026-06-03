# Omega Centauri 2014-05-04 Processing - Status

**As of:** 2026-06-03 IST, this project has completed Phase 0 inventory/research, Phase 1 no-dark/no-flats WBPP, Phase 2 ABE/solve/SPCC/SCNR, a conservative BXT/NXT linear branch, first MaskedStretch, a centered presentation crop, and the first LLM-as-judge narrow crop review.
**Pipeline progress:** 70%, with a first review candidate ready. The current working branch is still the no-dark/no-flats branch; the risky ISO1600 dark diagnostic is deferred unless the review decides the background pattern noise justifies it.

For the proposed workflow, see [Processing pipeline](pipeline.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [Omega Centauri processing research](research/01-omega-centauri-processing.md).
For historical local artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE, NO-DARK PRIMARY
PHASE 2 - Linear post-integration                  COMPLETE FOR CURRENT BRANCH
PHASE 3 - Nonlinear processing/export              FIRST MASKEDSTRETCH + CROP COMPLETE
PHASE 4 - LLM-as-judge crop review                 FIRST CROP SET COMPLETE
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | Omega Centauri / NGC 5139 |
| Primary date found | 2014-05-04 |
| Main source folder | `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/good` |
| Camera | Canon EOS 60D |
| Solved optic scale | ED80/reducer-scale branch confirmed by plate solve |
| EXIF caveat | Raw EXIF says `50.0 mm` with `Aperture=Inf`; this was stale/unreliable |
| Main exposure pattern | 60s, ISO 800 |
| Light temperature range | +31 to +34 C |
| Primary usable integration | 27 x 60s = 27 min |
| Calibration used so far | No darks, no flats, no bias |
| Historical reference | Finished-work JPEG plus local DSS/Photoshop processing artifacts |

## Archive Search Results

The local archive search used star-cluster and target aliases: `omega`, `centauri`, `ngc5139`, `ngc-5139`, `cluster`, and `globular`.

| Archive-relative path | Contents | Decision |
| --- | --- | --- |
| `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/good` | 27 top-level CR2 lights, 60s ISO800, plus DSS `Autosave.tif/html` side artifacts | Primary source |
| `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/good/tree-obstructed` | 3 CR2 lights marked tree-obstructed | Exclude from first integration |
| `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/trial-shots` | 7 CR2 trials: 1s/10s/30s at ISO6400/1600/800 | Exclude from first integration |
| `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/stacking/attempt-01` | DSS `Autosave.tif` | Historical evidence only |
| `by-date/20140504-yelagiri-kairos-ngc5139-omega-centauri/processing/attempt-01` | Photoshop/TIFF/JPEG products from an old processed stack | Historical reference only |
| `finished-work/20140504-Omega-Centauri.jpg` | Old finished-work JPEG | Visual/historical reference only |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster` | Separate M7 open cluster session | Separate project; do not mix |
| `by-date/20130310-yelagiri-ymca-virgo-cluster-galaxies` | Galaxy-field session already documented as separate from Markarian | Not a star-cluster input |

## Candidate Light Sets

| Candidate | Frames | Exposure | ISO | Temp | Decision |
| --- | ---: | ---: | ---: | --- | --- |
| `20140504-yelagiri-kairos-ngc5139-omega-centauri/good` | 27 CR2 | 60s | 800 | +31 to +34 C | Primary branch, processed |
| `good/tree-obstructed` | 3 CR2 | 60s | 800 | +34 C | Rejected from first integration |
| `trial-shots` | 7 CR2 | 1s/10s/30s | 6400/1600/800 | +33 to +39 C where recorded | Rejected from first integration |
| `20130310-yelagiri-ymca-m7-ptolemy-cluster` | Not inspected deeply yet | Separate target | Separate target | Separate date | Separate project candidate |

Temperature counts for the 27 primary top-level `good` frames:

| Temperature | Count |
| ---: | ---: |
| +31 C | 1 |
| +33 C | 5 |
| +34 C | 21 |

## Calibration Inventory

| Calibration source | Candidate use | Caveat |
| --- | --- | --- |
| `dark/canon-eos-60d/library-02/60s-1600iso/31c-33c` | Risky diagnostic only if no-dark branch fails badly | Exposure matches, but ISO does not match the ISO800 lights; do not treat as primary calibration |
| 60s ISO800 darks | None found in this pass | Primary branch is no-dark/no-flats |
| Same-session or target-named flats | None found in this pass | No flat branch planned until a compatible set is discovered |
| Bias / dark flats | None found in this pass | No flat calibration support found |

Current calibration decision:

1. The current accepted baseline is no-dark/no-flats using only the 27 top-level `good` CR2 lights.
2. Do not include `good/tree-obstructed`, `trial-shots`, old DSS autosaves, or Photoshop/TIFF/JPEG products as PixInsight inputs.
3. Keep the 60s ISO1600 dark library as a named diagnostic only, not a default, because ISO mismatch can make DSLR dark calibration worse.
4. The first judge crops show visible background/chroma pattern noise, but not enough yet to justify the ISO-mismatched dark branch as the next automatic step.

## Processing Decisions So Far

- Created project scaffold: `projects/omega-centauri-2014-05-04/`.
- Chose the 2014-05-04 `good` folder as the primary source because it is the only homogeneous Omega Centauri light set found.
- Excluded `tree-obstructed` and `trial-shots` from the first integration.
- Found and recorded the old finished-work JPEG and local processing artifacts as historical references only.
- Confirmed no matching 60s ISO800 Canon 60D darks were found in the searched dark library.
- Set the local project environment to this project, the Omega source folder, no dark directory, and a solve seed near Omega Centauri: RA 201.697 deg, Dec -47.4795 deg, focal 386 mm, pixel size 4.31 um.
- Ran Phase 1 no-dark/no-flats WBPP with the 27 top-level `good` lights. Registration and local normalization succeeded for all 27 lights with no rejected frames.
- Rendered linked and unlinked STF WBPP previews. They showed strong no-flats vignetting/color imbalance, but the cluster was well registered and worth carrying forward.
- Ran Phase 2 ABE, plate solve, SPCC, and SCNR on the autocropped Phase 1 master.
- Plate solve succeeded at 2.304 arcsec/px, 385.88 mm focal distance, 3d 19' 39.7" x 2d 12' 51.1" FOV, with image-center RA 13 26 38.429 and Dec -47 25 06.09.
- Ran conservative linear BXT/NXT: BXT stars 0.14, halos 0.02, nonstellar 0.14; NXT luminance 0.56, color 0.78, low-frequency conservative.
- Ran first MaskedStretch with target background 0.075.
- Created both a full-frame nonlinear preview and a centered crop candidate.
- Created four narrow judge crops: core, outer halo, corner stars, and background edge.

## LLM-As-Judge Findings

| Crop | File | Finding |
| --- | --- | --- |
| Core | `docs/images/omega-centauri-20140504-judge-core.jpg` | Core is bright and a little soft, but many resolved stars remain visible. Consider a gentler or alternate stretch if the core should carry more detail. |
| Outer halo | `docs/images/omega-centauri-20140504-judge-outer-halo.jpg` | Halo/field transition is believable, but background shows diagonal DSLR texture and red/cyan speckles. |
| Corner stars | `docs/images/omega-centauri-20140504-judge-corner-stars.jpg` | Corner stars are acceptable for this dataset; no catastrophic edge star-shape issue seen. Background texture remains visible. |
| Background edge | `docs/images/omega-centauri-20140504-judge-background-edge.jpg` | Edge background shows chroma speckles and no-flats texture. This is the main remaining quality concern. |

## Review Questions

1. Does the core need a second stretch branch with stronger highlight protection?
2. Is the current background/chroma noise acceptable for a 27-minute no-dark/no-flats DSLR dataset, or should a risky ISO1600 dark diagnostic be tested?
3. Should the deliverable keep both full-frame context and the tighter centered crop?
4. Does the BXT/NXT branch need a stock/no-plugin comparison, or is the conservative plugin branch acceptable as the current lead?

## Outputs

| Output | Status |
| --- | --- |
| `projects/omega-centauri-2014-05-04/` | Project scaffold created |
| `docs/status.md` | Inventory and current state written |
| `docs/processing-journey.md` | Chronological run log written |
| `docs/pipeline.md` | Processing plan and actual branch state written |
| `docs/original-2014-processing.md` | Historical artifact note written |
| `docs/research/01-omega-centauri-processing.md` | Target-specific research note written |
| `work/wbpp-20140504-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-60.00s_FILTER-NoFilter_RGB.xisf` | Phase 1 master |
| `work/wbpp-20140504-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-60.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Phase 1 autocropped master used for Phase 2 |
| `docs/images/omega-centauri-20140504-wbpp-nodark-linked-stf.jpg` | Phase 1 linked-STF preview |
| `docs/images/omega-centauri-20140504-wbpp-nodark-unlinked-stf.jpg` | Phase 1 unlinked-STF preview |
| `work/02-linear-20140504-good-nodark-noflats/02a-abe.xisf` | Phase 2 ABE output |
| `work/02-linear-20140504-good-nodark-noflats/02b-solved.xisf` | Phase 2 solved output |
| `work/02-linear-20140504-good-nodark-noflats/02c-spcc.xisf` | Phase 2 SPCC output |
| `work/02-linear-20140504-good-nodark-noflats/02d-scnr.xisf` | Phase 2 SCNR output |
| `docs/images/omega-centauri-20140504-phase2-nodark-scnr-linked-stf.jpg` | Phase 2 linked-STF preview |
| `work/02-linear-20140504-good-nodark-bxt-nxt/02f-bxt.xisf` | Linear BXT output |
| `work/02-linear-20140504-good-nodark-bxt-nxt/02g-bxt-nxt.xisf` | Linear BXT/NXT output |
| `work/03-nonlinear-20140504-good-nodark-bxt-nxt-v1/03a-maskedstretch.xisf` | First nonlinear candidate |
| `docs/images/omega-centauri-20140504-bxt-nxt-maskedstretch.jpg` | Full-frame nonlinear preview |
| `work/03-nonlinear-20140504-good-nodark-bxt-nxt-v1/review-crops/03a-maskedstretch-centered-crop.xisf` | Centered crop XISF |
| `docs/images/omega-centauri-20140504-bxt-nxt-maskedstretch-centered-crop.jpg` | Centered crop JPEG |
| `docs/images/omega-centauri-20140504-judge-core.jpg` | Narrow judge crop |
| `docs/images/omega-centauri-20140504-judge-outer-halo.jpg` | Narrow judge crop |
| `docs/images/omega-centauri-20140504-judge-corner-stars.jpg` | Narrow judge crop |
| `docs/images/omega-centauri-20140504-judge-background-edge.jpg` | Narrow judge crop |
