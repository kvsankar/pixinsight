# M7 / Ptolemy Cluster 2013-03-10 Processing - Status

**As of:** 2026-06-04 IST, this project is checkpointed for this processing pass. Phase 0 archive inventory/research, Phase 1 WBPP for 120s and 60s no-dark/no-flats branches, Phase 2 on the 120s branch, conservative BXT/NXT, regular MaskedStretch, LLM-as-judge narrow crop review, and a v2 dark-lane contrast diagnostic are complete.
**Pipeline progress:** Checkpoint complete. The accepted presentation branch is the regular 120s BXT/NXT MaskedStretch image. The v2 dark-lane contrast sibling measured darker but did not make a meaningful visual difference, so it remains a documented diagnostic rather than a promoted result.

For the processing plan, see [Processing pipeline](pipeline.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [M7 / Ptolemy Cluster processing research](research/01-m7-ptolemy-cluster-processing.md).
For historical local artifacts, see [Original 2013 processing evidence](original-2013-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE FOR 120S AND 60S NO-DARK BRANCHES
PHASE 2 - Linear post-integration                  COMPLETE FOR 120S
PHASE 3 - Nonlinear processing/export              ACCEPTED 120S BXT/NXT MASKEDSTRETCH + V2 DIAGNOSTIC COMPLETE
PHASE 4 - LLM-as-judge crop review                 COMPLETE
PHASE 5 - Checkpoint/final docs                    COMPLETE
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | M7 / Ptolemy Cluster / NGC 6475 |
| Primary date found | 2013-03-10 |
| Main source folder | `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster` |
| Camera | Canon EOS 60D |
| Likely optic | ED80/reducer-era setup, to be confirmed by plate solve |
| EXIF caveat | Raw EXIF says `50.0 mm` and `FNumber=0`; same-night Eta Carinae solved near 480 mm, so treat EXIF as stale until solved |
| ISO | 1600 |
| Good light groups | 1 x 1s, 1 x 30s, 8 x 60s, 5 x 120s |
| Accepted branch | 5 x 120s no-dark/no-flats, Phase 2 plus BXT/NXT and regular MaskedStretch |
| Sibling branch | 8 x 60s no-dark/no-flats WBPP diagnostic |
| Diagnostic branch | V2 dark-lane contrast from the regular MaskedStretch branch; not promoted because the visual difference is minor |
| Historical reference | Old DSS/Photoshop attempt under `processing/attempt-01` and `stacking/attempt-01` |

## Archive Search Results

The local archive search used target aliases: `m7`, `ptolemy`, `ngc6475`, `ngc-6475`, `scorpius`, `scorpio`, and `cluster`.

| Archive-relative path | Contents | Decision |
| --- | --- | --- |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster/good/120s-1600iso` | 5 CR2 lights plus old DSS sidecar text/JPEGs | Primary branch |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster/good/60s-1600iso` | 8 CR2 lights plus old DSS sidecar text/JPEGs | Sibling branch |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster/good/30s-1600iso` | 1 CR2 light plus JPEG | Too sparse for first integration; possible bright-star diagnostic only |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster/good/01s-1600iso` | 1 CR2 light plus JPEG | Too sparse for first integration; historical/framing only |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster/processing/attempt-01` | `m7-16bits-cropped-edited.jpg` and `.psd` | Historical processing reference only |
| `by-date/20130310-yelagiri-ymca-m7-ptolemy-cluster/stacking/attempt-01` | DSS autosave TIFF and 16-bit TIFF | Historical stacking evidence only |
| `by-date/20130310-yelagiri-ymca-virgo-cluster-galaxies` | Separate galaxy-field folder, matched only by generic `cluster` term | Separate project, do not mix |
| `finished-work/` target search | No M7/Ptolemy/NGC 6475 finished-work image found | No finished-work reference |

## Light Inventory

Good or first-pass candidate lights:

| Group | Frames | Exposure | ISO | Temp range | Stdev range | First-pass use |
| --- | ---: | ---: | ---: | --- | --- | --- |
| `good/120s-1600iso` | 5 | 120s | 1600 | +24 to +28 C | 911 to 942 | Primary branch |
| `good/60s-1600iso` | 8 | 60s | 1600 | +25 to +29 C | 564 to 685 | Sibling branch |
| `good/30s-1600iso` | 1 | 30s | 1600 | +27 C | 478 | Exclude from first integration |
| `good/01s-1600iso` | 1 | 1s | 1600 | +24 C | 108 | Exclude from first integration |

## Calibration Inventory

No same-session or target-named flats were found.

Dark-library candidates:

| Dark family | Count | Match quality | Candidate use |
| --- | ---: | --- | --- |
| `dark/canon-eos-60d/library-02/120s-1600iso/33c` | 5 | Exposure/ISO match, but 5-9 C warmer than the 120s lights | Diagnostic only if no-dark branch is poor |
| `dark/canon-eos-60d/library-02/120s-1600iso/34c-36c` | 25 total | Too warm for the 120s lights | Avoid for baseline |
| `dark/canon-eos-60d/library-02/60s-1600iso/31c-33c` | 30 total | Exposure/ISO match, but 2-8 C warmer than the 60s lights | Diagnostic only |
| `dark/canon-eos-60d/library-02/30s-1600iso/31c` | 20 | Nearer match for the one 30s frame | Not useful until a short-exposure branch has enough lights |
| Bias / dark flats | None found in this pass | No flat branch planned |

Current calibration decision:

1. Run the 120s primary branch no-dark/no-flats first.
2. Run the 60s sibling no-dark/no-flats branch separately before combining anything.
3. Keep warmer darks as diagnostics only; do not use them as the default baseline.
4. Do not use the 2016 Yelagiri flats for this 2013 M7 session.
5. Keep old DSS/Photoshop/TIFF/JPEG products as references, not PixInsight inputs.

## Processing Decisions So Far

- Created project scaffold: `projects/m7-ptolemy-cluster-2013-03-10/`.
- Chose M7 after Canis Major because it is a compact star-cluster project and was already flagged as a separate same-night target while processing Eta Carinae.
- Found one direct M7 by-date folder and no matching finished-work JPEG.
- Marked the 2013 Virgo Cluster folder as unrelated despite the generic `cluster` name match.
- Copied the historical cropped JPEG to `docs/images/original-2013-attempt-01-cropped-edited.jpg` as a small public reference.
- Planned a solve seed from ESO image metadata: RA 268.4634 deg, Dec -34.7929 deg.
- Planned Canon EOS 60D SPCC filters.
- Planned the first WBPP branch as 120s no-dark/no-flats, with 60s no-dark/no-flats as the first sibling diagnostic.
- Ran Phase 1 WBPP on the 120s no-dark/no-flats branch. WBPP completed with 5/5 registered, 0 rejected, and produced full/autocropped masters. The autocropped master is 5201 x 3460.
- Ran Phase 1 WBPP on the 60s no-dark/no-flats sibling branch. WBPP completed with 8/8 registered, 0 rejected, and produced full/autocropped masters. The autocropped master is 4770 x 2230, much narrower than the 120s crop, so it is not yet promoted.
- Rendered linked and unlinked WBPP previews for both branches.
- Ran Phase 2 on the 120s autocropped master through ABE, ImageSolver, SPCC, SCNR, and stock MLT. Plate solve succeeded at 480.31 mm, 1.851 arcsec/px, FOV 2d 40' 26.5" x 1d 46' 44.1", image center RA 17 53 36.834, Dec -34 45 20.17.
- Ran conservative BXT/NXT from the 120s `02d-scnr.xisf` checkpoint: BXT stars 0.12, halos 0.01, nonstellar 0.10; NXT luminance 0.52, color 0.76, low-frequency luminance/color 0.18/0.58.
- Ran first MaskedStretch from the BXT/NXT linear checkpoint with target background 0.075.
- Rendered the first review JPEG: `docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg`.
- Created four first-pass judge crops: cluster core, medium star field, background/star-cloud, and corner stars.
- Created a v2 dark-lane contrast sibling from the regular `03a-maskedstretch-bg075.xisf` branch using `scripts/pjsr/03m7-dark-lane-contrast.js`.
- The v2 pass applies mild large-scale LocalHistogramEqualization plus a lower-shadow S-curve to make black dust-lane structure around the cluster read more clearly.
- Rendered the v2 review JPEG: `docs/images/m7-20130310-bxt-nxt-v2-dark-lane-contrast.jpg`.
- Created four matched v2 judge crops using the same geometry as the first LLM-as-judge crop set.
- Visual review found little practical difference between the regular and v2 dark-lane contrast render. The regular 120s BXT/NXT MaskedStretch image is the accepted checkpoint; v2 remains a diagnostic sibling.

## First LLM-As-Judge Findings

| Crop | File | Finding |
| --- | --- | --- |
| Cluster core | `docs/images/m7-20130310-judge-01-cluster-core.jpg` | Bright-star cores clip in tiny areas, as expected for 120s cluster data, but the saturation footprint is small rather than field-wide. Use this crop to judge whether the BXT star treatment is too hard. |
| Medium star field | `docs/images/m7-20130310-judge-02-medium-star-field.jpg` | Useful branch-quality crop for star color and star roundness away from the densest core. |
| Background/star-cloud | `docs/images/m7-20130310-judge-03-background-star-cloud.jpg` | Background median remains restrained after the 0.075 stretch. This is the main crop for checking chroma speckles, mottling, and over-denoise. |
| Corner stars | `docs/images/m7-20130310-judge-04-corner-stars.jpg` | Edge/corner crop for coma, field rotation/crop edge effects, and registration trails. |

ROI stats on the nonlinear 120s BXT/NXT v1 image show background/corner medians around 0.063-0.075 by channel. Pixels above 0.98 are rare: about 0.02-0.04% in the core crop and less than about 0.006% in background/corner crops.

## V2 Dark-Lane Contrast Findings

The v2 branch is a stronger-contrast sibling. It measured darker in the background and corner crops, but visual review found the difference from the regular version minor. It is not promoted.

| Crop | File | Finding |
| --- | --- | --- |
| Full-frame review | `docs/images/m7-20130310-bxt-nxt-v2-dark-lane-contrast.jpg` | Lower shadows and slightly stronger local contrast should make the dust/dark-lane structure more legible around the cluster. |
| Cluster core | `docs/images/m7-20130310-v2-judge-01-cluster-core.jpg` | Star saturation is still confined to small bright-star cores; pixels above 0.98 are about 0.027-0.038% by channel. |
| Medium star field | `docs/images/m7-20130310-v2-judge-02-medium-star-field.jpg` | Median level dropped from about 0.080-0.084 to about 0.059-0.063, increasing star-field contrast. |
| Background/star-cloud | `docs/images/m7-20130310-v2-judge-03-background-star-cloud.jpg` | Median level dropped from about 0.069-0.075 to about 0.048-0.054, which should make dark lanes read more black. |
| Corner stars | `docs/images/m7-20130310-v2-judge-04-corner-stars.jpg` | Median level dropped from about 0.063-0.071 to about 0.043-0.049. Bright pixels above 0.98 remain low, about 0.004-0.005% by channel. |

V2 ROI stats show the intended contrast tradeoff: darker low tones and higher standard deviation in the background/corner crops, with no broad new clipping in the background. Since the visual separation is small, the project checkpoint keeps the regular branch as the accepted presentation image.

## Final Checkpoint

Accepted presentation image:

```text
docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg
```

Final decision:

1. Use the 120s branch as the presentation branch because it preserves the larger field and has enough total exposure for this compact open cluster.
2. Keep the 60s branch as a diagnostic only; it registered cleanly, but its autocrop is much narrower.
3. Keep BXT/NXT because the conservative settings did not create broad clipping in the judge crops.
4. Do not promote the v2 dark-lane contrast branch. It measured darker, but the visual difference is minor.
5. Stop further processing for this pass rather than chasing subtle background changes in a thin, five-frame dataset.

## Outputs

| Output | Status |
| --- | --- |
| `projects/m7-ptolemy-cluster-2013-03-10/` | Project scaffold created |
| `docs/status.md` | Inventory and current state written |
| `docs/processing-journey.md` | Chronological planning log written |
| `docs/pipeline.md` | First processing plan written |
| `docs/original-2013-processing.md` | Historical artifact note written |
| `docs/research/01-m7-ptolemy-cluster-processing.md` | Target-specific research note written |
| `docs/images/original-2013-attempt-01-cropped-edited.jpg` | Historical JPEG reference copied and metadata stripped |
| `work/wbpp-20130310-120s-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf` | 120s Phase 1 autocropped master |
| `docs/images/m7-20130310-wbpp-120s-nodark-linked-stf.jpg` | 120s WBPP linked-STF preview |
| `docs/images/m7-20130310-wbpp-120s-nodark-unlinked-stf.jpg` | 120s WBPP unlinked-STF preview |
| `work/wbpp-20130310-60s-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-60.00s_FILTER-NoFilter_RGB_autocrop.xisf` | 60s Phase 1 autocropped master |
| `docs/images/m7-20130310-wbpp-60s-nodark-linked-stf.jpg` | 60s WBPP linked-STF preview |
| `docs/images/m7-20130310-wbpp-60s-nodark-unlinked-stf.jpg` | 60s WBPP unlinked-STF preview |
| `work/02-linear-20130310-120s-nodark-noflats/02e-linear-nr.xisf` | Stock Phase 2 120s linear output |
| `docs/images/m7-20130310-phase2-120s-scnr-linked-stf.jpg` | 120s Phase 2 SCNR linked-STF preview |
| `work/02-linear-20130310-120s-bxt-nxt/02g-bxt-nxt.xisf` | Conservative BXT/NXT 120s linear branch |
| `docs/images/m7-20130310-bxt-nxt-linear-linked-stf.jpg` | BXT/NXT linked-STF preview |
| `work/03-nonlinear-20130310-120s-bxt-nxt-v1/03a-maskedstretch-bg075.xisf` | First nonlinear BXT/NXT MaskedStretch checkpoint |
| `docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg` | Accepted presentation JPEG |
| `docs/images/m7-20130310-judge-01-cluster-core.jpg` | First judge crop |
| `docs/images/m7-20130310-judge-02-medium-star-field.jpg` | First judge crop |
| `docs/images/m7-20130310-judge-03-background-star-cloud.jpg` | First judge crop |
| `docs/images/m7-20130310-judge-04-corner-stars.jpg` | First judge crop |
| `work/03-nonlinear-20130310-120s-bxt-nxt-v2-dark-lane-contrast/03b-dark-lane-contrast.xisf` | V2 dark-lane contrast diagnostic |
| `docs/images/m7-20130310-bxt-nxt-v2-dark-lane-contrast.jpg` | V2 dark-lane contrast diagnostic JPEG |
| `docs/images/m7-20130310-v2-judge-01-cluster-core.jpg` | V2 judge crop |
| `docs/images/m7-20130310-v2-judge-02-medium-star-field.jpg` | V2 judge crop |
| `docs/images/m7-20130310-v2-judge-03-background-star-cloud.jpg` | V2 judge crop |
| `docs/images/m7-20130310-v2-judge-04-corner-stars.jpg` | V2 judge crop |
