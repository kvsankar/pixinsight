# Rosette Nebula Processing — Status

**As of:** 2026-05-25 IST, Rosette is paused after an improved SPCC-based visual candidate and starless-tool investigation.
**Pipeline progress:** 88%, paused — raw archive found, historical DSS/Photoshop processing inspected, project scaffold created, 33-frame WBPP integration completed, plate solve completed, multiple CFA/color-calibration branches tested, synthetic-background and manual-DBE branches tested, CR2 preview/color handling investigated, SPCC metadata failure diagnosed, SPCC diagnostics generated, SPCC-based visual exports produced, and local starless approximations tested. Color/background handling is improved but still not scientifically final.

For the chronological record of how we got here, see [Processing journey](processing-journey.md).

---

## Where We Are

```text
PHASE 0 — Source inventory                         DONE
PHASE 1 — Calibration + Integration                DONE, RGGB TEST ACTIVE
PHASE 2 — Linear post-integration                  DONE, COLOR/BACKGROUND ISSUE
PHASE 3 — Nonlinear processing/export              PAUSED AT V2G PRESENTATION OUTPUT
```

## Dataset Summary

| Field | Value |
|---|---|
| Target | Rosette Nebula / NGC 2237 region |
| Camera | Canon EOS 60D DSLR, unmodified, inferred from CR2 metadata |
| Date | 2014-03-02 |
| Site | Keemale Estate, Coorg, Karnataka, India, inferred from folder name |
| Good long lights on disk | 33 top-level good CR2 lights: 3 east + 30 west, all 240s ISO 1600 |
| Historical DSS stack | 31 frames, ISO 1600, total exposure 2h04m |
| Additional good-but-separated lights | 1 east `sat-trails` CR2 and 3 west `sat-trail` CR2 files |
| Rejected / trial frames | bad, trailing, and framing-trial folders preserved |
| Darks used historically | 9× 240s ISO 1600 darks, same dark library used for M31 |
| Flats | None in DSS report |
| Bias / offset | None in DSS report |
| Historical processing | DeepSkyStacker 3.3.3 beta 51, then Adobe Photoshop CS6 |
| EXIF focal metadata caveat | CR2 files report `FocalLength=50.0 mm`, `FNumber=0`, no lens model. Treat optical scale as unverified until plate solving. |

## Original Folder Layout

```text
<original-capture-root>/
├── bad/
│   └── trailing/
├── framing-trials/
├── good/
│   ├── east/
│   │   └── sat-trails/
│   └── west/
│       └── sat-trail/
├── processing/
│   ├── attempt-01/
│   ├── attempt-02/
│   └── attempt-03/
└── stacking/
    └── attempt-01/
```

## Decisions So Far

- Created project scaffold: `projects/rosette-2014-03-02/`.
- Kept generated PixInsight outputs under `work/`, which is ignored by git.
- Updated `run-wbpp-phase1.ps1` to support multiple light folders via `-LightDirs` or `PI_LIGHT_DIRS`.
- Used the 33 top-level good lights as the first repeatable PixInsight baseline rather than trying to infer the exact historical DSS 31-frame selection from folder names.
- The EXIF `50.0 mm` focal length is wrong for solving. The solved integration reports about 386.08 mm focal length and 2.303 arcsec/px.
- Use the same 9 ISO 1600 darks initially because that is what the historical DSS stack used. Note the caveat: Rosette lights are mostly +31 to +36 C, while the dark library is +25 to +30 C.
- Do not accept the current color/background result yet.
- PixInsight WBPP auto-detected the CR2 CFA pattern as `GBRG`. This may be normal LibRaw behavior for Canon 60D data depending on RAW read origin, so it is a suspect to test, not a proven bug.
- Full WBPP reruns were tested with forced `RGGB` and `BGGR`. Neither by itself produced an acceptable SPCC-calibrated Rosette.
- The active WBPP output is currently the forced `RGGB` run.
- The pre-SPCC `RGGB` stack shows pink/magenta signal and the historical DSS intermediate stack is faint gray-pink, so the red signal exists. The current failure is now believed to be background/color calibration over-correcting a no-flats, nebula-rich field rather than a simple Gaia/SPCC catalog failure.
- Because the SPCC path still over-neutralizes the nebula, an experimental nonlinear branch was produced from the pre-SPCC `02a-abe.xisf` image. This branch is for visual comparison only, not a calibrated final.
- A first automated synthetic-background correction was tested before SPCC. It completed successfully but did not materially improve the Rosette color problem.
- A user-guided manual DBE correction was tested. Its background model looked like smooth vignetting/gradient rather than Rosette structure, and the corrected image has the best background control so far.
- The scripted SPCC failure on the manual DBE branch was traced to metadata dropped from the DBE-derived image. Copying non-geometric camera/filter/exposure/CFA/noise/signal metadata from the solved WBPP-derived reference restored scripted SPCC execution.
- Scripted SPCC now succeeds on the manual DBE branch with and without SPCC background neutralization. The remaining problem is color quality: neutral linked-RGB stretches still render the Rosette mostly gray/green, while no-background-neutralization leaves a magenta/purple sky.
- A DSS-style per-channel background calibration before SPCC was tested and did not improve the SPCC star-fit ratios or final color.
- A `Photon Flux` SPCC white-reference test was also run. It logged the requested white reference but produced the same practical result as the `Average Spiral Galaxy` run.
- A new SPCC-based visual branch was generated from the successful manual-DBE SPCC result. It keeps SPCC as the calibration baseline, then applies selective luminance-shaped nebula color enhancement, low-luminance background-neutrality cleanup, and star reduction.
- Local scripted starless attempts were tested after v2g. They are useful diagnostics, but not accepted as final starless images. A dedicated star-separation tool is recommended before continuing Rosette.
- The raw CR2 embedded preview shows faint red Rosette signal. EXIF reports Canon white-balance multipliers of about `R=1964`, `G=1024`, `B=1830`, so camera/raw-preview software boosts red and blue strongly relative to green.
- Earlier diagnostic previews used PixInsight auto STF with `linkedRGB=false`, which stretches each channel independently and can hide true red/magenta balance. The preview script now accepts `linkedRGB=true`; linked previews show the raw and integrated data are strongly magenta before background re-anchoring.
- A DSS-style per-channel background calibration branch now gives the best non-SPCC visual result: it keeps the sky much more neutral while preserving pink/red Rosette signal.
- The project is no longer blocked by plate solving or Gaia catalog setup. The current blocker is robust gradient/flat handling before color calibration.

## Candidate Light Sets

| Candidate | Frames | Exposure | Notes |
|---|---:|---:|---|
| Historical DSS-equivalent | 31 | 2h04m | Best baseline if we can reconstruct the exact old selection. |
| Top-level good east + west | 33 | 2h12m | Simple automated starting point; excludes current `sat-trail(s)` subfolders. |
| All good including satellite-trail folders | 37 | 2h28m | Only worth trying if large-scale rejection handles trails cleanly. |

First PixInsight run used: **top-level good east + west**. Rejection maps still need visual inspection before deciding whether to include satellite-trail folders or reconstruct the historical 31-frame set.

## First PixInsight Run

| Stage | Result |
|---|---|
| WBPP input | 33 lights, 9 darks, no flats, no bias |
| WBPP output | `work/wbpp-out/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf` |
| ABE | `work/02-linear/02a-abe.xisf` |
| Plate solve | `work/02-linear/02b-solved.xisf` |
| Plate solution | RA 6h 32m 19.922s, Dec +4d 55m 27.90s; 386.08 mm; 2.303 arcsec/px; FOV 3d 19m x 2d 12m |
| SPCC | Completed with Gaia DR3/SP; later rerun with Canon EOS 60D R/G/B filter response names |
| SCNR + MLT | Completed |
| Preview | `work/02-linear/rosette-phase2-linear-stf.jpg` |
| SPCC without background neutralization | Tested separately as `work/02-linear/02c-spcc-no-bn.xisf`; did not fix the color issue |
| One-frame CFA diagnostic | `work/diagnostics/cfa-one-frame/preview-*.jpg`; RGGB/BGGR look much more neutral than GBRG/GRBG |
| Forced `RGGB` WBPP | Completed; active master under `work/wbpp-out/master/` |
| Forced `BGGR` WBPP | Completed earlier; preview archived under `work/diagnostics/phase1-cfa-reruns/` |
| Canon 60D SPCC filters | Accepted by SPCC, but did not materially restore red/pink color |
| Manual BN + ColorCalibration fallback | Tested; did not materially restore red/pink color |
| Pre-SPCC stretch | `work/03-nonlinear/rosette-rggb-abe-no-spcc-maskedstretch.jpg`; shows faint red/purple signal |
| MGC attempt | `MultiscaleGradientCorrection` wrapper was added but `executeOn()` returned false with current no-reference settings |
| Experimental hard-STF finish | `work/03-nonlinear/rosette-hardstf-experimental.jpg` and `.tif`; visible Rosette, still too neutral/green |
| Experimental red-remix finish | `work/03-nonlinear/rosette-redmix-experimental.jpg` and `.tif`; closer to historical red/pink, but manually color-remixed and not SPCC-calibrated |
| Synthetic-background correction | `work/02-linear/02a-synthbg-subtract.xisf`; first pass sky-sample model, no material vignetting/color improvement |
| Synthetic-background WCS copy | `work/02-linear/02b-synthbg-subtract-wcs.xisf`; WCS copied from solved ABE branch |
| Synthetic-background SPCC | `work/02-linear/02c-synthbg-subtract-spcc.xisf`; completed with Canon EOS 60D filters, still gray/green |
| Synthetic-background SCNR + MLT | `work/02-linear/02d-synthbg-subtract-scnr.xisf`, `work/02-linear/02e-synthbg-subtract-linear-nr.xisf` |
| Synthetic-background calibrated comparison | `work/03-nonlinear/rosette-synthbg-calibrated-experimental.jpg` and `.tif`; structurally good, still mostly gray/green |
| Manual DBE correction | `work/02-linear/02a-dbe-manual-subtract.xisf`; user-placed DBE samples guided by `work/diagnostics/dbe-manual-sample-guide.jpg` |
| Manual DBE background model | `work/02-linear/02a-dbe-manual-background-model.xisf`; rendered model is smooth large-scale vignetting/gradient, not a clear Rosette-shaped model |
| Manual DBE plate solve | `work/02-linear/02b-dbe-manual-solved.xisf`; fresh solve succeeded, focal length about 385.64 mm |
| Manual DBE metadata restore | `work/02-linear/02b-dbe-manual-solved-spccmeta.xisf`; copied 24 non-geometric SPCC-related properties from the solved reference |
| Manual DBE scripted SPCC | `work/02-linear/02c-dbe-manual-spccmeta-spcc.xisf`; now succeeds with Canon EOS 60D filters and SPCC background neutralization |
| Manual DBE scripted SPCC without BN | `work/02-linear/02c-dbe-manual-spccmeta-spcc-no-bn.xisf`; now succeeds but leaves magenta/purple sky in a linked neutral stretch |
| Manual DBE SPCC diagnostics | `work/diagnostics/spcc-dbe-manual/SPCC-data.csv`; 2738 fitted stars exported for inspection |
| Manual DBE SPCC neutral stretches | `work/03-nonlinear/rosette-dbe-manual-spcc-bn-neutral-stretch.jpg`, `work/03-nonlinear/rosette-dbe-manual-spcc-no-bn-neutral-stretch.jpg`; plain linked stretches with no SCNR or saturation curves |
| DSS-bgcal before SPCC | `work/02-linear/02c-dss-bgcal-spcc.xisf`, `work/02-linear/02c-dss-bgcal-spcc-no-bn.xisf`; SPCC succeeds but color remains gray/green or green-skewed |
| SPCC visual color branch | `work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.jpg` and `.tif`; SPCC baseline with selective nebula color enhancement |
| SPCC visual star-reduced branch | `work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained-star-reduced.jpg` and `.tif`; older first star-reduced visual candidate |
| SPCC visual v2g branch | `work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.jpg` and `.tif`; current best SPCC-based visual candidate |
| Starless local approximations | `work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-*.jpg`; diagnostic only, not accepted as final |
| Manual DBE interactive SPCC | `work/02-linear/02c-dbe-manual-spcc-interactive.xisf`; interactive SPCC completed, but the output was strongly green without background neutralization |
| Manual DBE interactive SPCC + BN | `work/02-linear/02c-dbe-manual-spcc-interactive-bn.xisf`; background neutralization made the preview harsh/clipped-looking and still gray/green |
| Manual DBE fallback color | `work/02-linear/02c-dbe-manual-colorcal.xisf`; BackgroundNeutralization + ColorCalibration completed |
| Manual DBE calibrated comparison | `work/03-nonlinear/rosette-dbe-manual-experimental.jpg` and `.tif`; best background control so far, still mostly gray/green |
| Manual DBE visual redmix | `work/03-nonlinear/rosette-dbe-manual-visual-redmix.jpg` and `.tif`; older visual branch, red/pink restored through blunt manual color remix but background pushed too red; not calibrated |
| Manual DBE DSS-style background calibration | `work/03-nonlinear/rosette-dss-bgcal-experimental.jpg` and `.tif`; best current restrained visual branch, closer to historical DSS/Photoshop behavior; not SPCC-calibrated |
| Manual DBE camera-WB + background calibration | `work/03-nonlinear/rosette-camera-wb-bgcal-experimental.jpg` and `.tif`; stronger pink/red version using Canon CR2 white-balance multipliers, not SPCC-calibrated |

## Journey Summary

The investigation moved through these stages:

1. Reconstructed the original 2014 DSS/Photoshop context and identified a 31-light historical stack with darks but no flats or bias.
2. Created a repeatable PixInsight project using 33 top-level good lights and the known 9 darks.
3. Fixed the plate-solve assumptions by ignoring bogus 50 mm EXIF metadata and solving with Rosette-specific coordinates and an approximately 386 mm scale.
4. Got SPCC running with local Gaia DR3/SP data, then discovered the result was technically successful but visually implausible.
5. Investigated CFA/Bayer interpretation because WBPP reported `GBRG`; diagnostics made `RGGB`/`BGGR` better candidates, but full reruns still failed after background/color processing.
6. Tested SPCC without background neutralization, Canon EOS 60D SPCC filter names, manual color-calibration fallback, ABE variants, MGC, and synthetic-background correction.
7. Produced three comparison outputs: a non-calibrated red-remix branch that shows the data contains red/pink signal, a synthetic-background calibrated branch that remains gray/green, and a manual-DBE fallback-color branch with better background control but still weak red/pink color.
8. Rechecked the raw CR2 color clue. The embedded camera preview shows faint red nebulosity and the CR2 metadata contains strong Canon white-balance multipliers. Our diagnostic preview scripts were also using unlinked/channel-independent STF, which is useful for inspection but misleading for judging color. Linked STF previews plus DSS-style per-channel background calibration explain why the historical workflow could show red without turning the whole background red.
9. Reopened SPCC as a blocker. The manual-DBE scripted failure was real but local: the DBE-derived solved image was missing SPCC-relevant metadata. Restoring that metadata made scripted SPCC succeed, so the current SPCC problem is not execution, Gaia, or WCS; it is the resulting color calibration on this no-flats dataset.
10. Tested two SPCC-adjacent corrections: per-channel background anchoring before SPCC and the `Photon Flux` white reference. Neither changed the core SPCC color behavior.
11. Created an SPCC-based visual branch that keeps the successful SPCC calibration as the base, then selectively restores Rosette pink/red nebulosity in nonlinear processing without globally pushing the background red.
12. Refined that branch through v2c-v2g: low-luminance sky cleanup removed the red/pink background cast, a green-excess cleanup made the darkest sky nearly neutral, and a retuned star mask reduced stars more effectively inside the Rosette.
13. Tried local scripted starless approximations. They confirmed that this dense field needs StarXTerminator or a similar star-separation tool for a clean starless layer.

## Active Problem: Background And Color

The Phase 2 preview has good structure and a clean solve, but SPCC/background neutralization drives the Rosette nebulosity toward gray-green. This is not considered a valid final color result.

Evidence:

- The old Photoshop-processed image from the 2014 folder shows the nebula as red/pink.
- The old DSS intermediate `rosette-stacked-applied.TIF`, before the strongest Photoshop finish, is faint gray-pink rather than green.
- Rosette is H-alpha dominated; a stock Canon DSLR may have weak H-alpha response, but the signal should not be predominantly cyan-green.
- WBPP logged the CR2 metadata as `CFA pattern ....... Bayer GBRG`.
- A wrong Bayer/CFA interpretation can explain red emission appearing in green/cyan.
- SPCC background neutralization was tested separately with `neutralize=false`; it did not restore the red/pink nebula.
- A quick literature/forum check shows Canon 60D CFA reporting is confusing across DCRaw/LibRaw-era tools, and `GBRG` can be normal depending on how the RAW decoder starts reading the image.
- A one-frame PixInsight diagnostic was run with all four CFA choices. In that test, `GBRG` and `GRBG` produce the same green/cyan cast seen in the current integration; `RGGB` and `BGGR` produce a much more neutral-looking raw preview. This makes the CFA/channel interpretation the strongest current lead.
- A second diagnostic was run on WBPP's calibrated CFA output, which is the more relevant test recommended by PixInsight forum users. It gives the same result: `GBRG`/`GRBG` are green-cyan, while `RGGB`/`BGGR` are more neutral.
- However, full forced `RGGB` and `BGGR` integrations still become gray-green after the automated background/color-calibration stages.
- The pre-SPCC `RGGB` stack has a strong magenta/vignetting field and faint Rosette signal, matching the no-flats problem. This points to gradient/background modeling as the next target.
- The first synthetic-background branch sampled presumed sky regions and ran through SPCC, SCNR, MLT, and export. The final comparison image still lacks the expected red/pink emission color, so the quick synthetic model is not enough.
- The manual DBE branch shows that careful human sample placement can model the large-scale background more cleanly than the first automated synthetic-background attempt. However, it still does not restore a calibrated red/pink Rosette.
- The raw CR2 preview itself does show faint red nebulosity. This is partly because Canon's embedded preview applies camera white balance/preview rendering, not because the linear raw data is already a finished red image.
- PixInsight linked-RGB previews show the forced-`RGGB` raw/master data is strongly magenta before background anchoring. Earlier unlinked STF previews rebalanced the channels for display and made the red signal look weaker.
- The historical DSS stack used per-channel background calibration. Recreating that idea after manual DBE keeps the background gray while preserving pink/red nebular excess. This is the clearest explanation for why the 2014 Photoshop result looked better than the earlier SPCC/BN branches.
- SPCC diagnostic export on the metadata-restored manual-DBE image produced 2738 fitted stars. The median fitted image star ratios before SPCC were roughly `R/G=1.612` and `B/G=1.612`, while the median catalog ratios were roughly `R/G=0.804` and `B/G=0.536`. This explains why SPCC strongly scales down red and blue relative to green, suppressing the emission-nebula color along with the star calibration.
- Running SPCC after DSS-style per-channel background calibration yielded almost the same fitted star ratios, so the SPCC star-color mismatch is not solved by subtracting channel medians alone.

Relevant external findings:

- PixInsight forum users with wrong WBPP OSC color recommend testing the actual calibrated CFA frame and the exact Debayer settings used by WBPP, rather than guessing from the camera model alone.
- Another PixInsight forum thread says Canon 60D is among Canon models affected by the PixInsight 1.8.8/LibRaw RAW-decoding change; the reported Bayer pattern and image height can differ from older processing.
- Siril/LibRaw discussions make the same point: the displayed Bayer pattern depends on the RAW read origin, so a logged `GBRG` is not automatically an error.
- PixInsight documentation for SPCC confirms selected Canon DSLR response curves are available; this install has `Canon EOS 60D R/G/B` in `library/filters.xspd`.
- PixInsight and user discussions on DBE/gradient correction emphasize avoiding samples on nebulosity; otherwise background extraction can remove or neutralize real nebular signal. Missing flats make this harder because vignetting is multiplicative.

Next investigation:

1. Keep `RGGB` as the active CFA candidate for now.
2. Replace the current automatic ABE + SPCC/background-neutralization flow with a stronger Rosette-specific gradient strategy:
   - Prefer real flats if they can be found.
   - Otherwise refine manual DBE or test a dedicated external gradient/background tool before SPCC.
   - Avoid using nebula-contaminated regions as background references.
3. Keep SPCC in the pipeline, but require a metadata-preserving path after DBE or run `copy-spcc-metadata.js` before SPCC on DBE-derived images.
4. Treat the raw SPCC color result as a diagnostic failure, not an execution failure. The SPCC-based visual branch is useful for presentation/comparison, but the next scientific SPCC work still needs better flats/gradient/background modeling before asking SPCC to calibrate star colors.

## Experimental Output

The best current SPCC-based visual output is the v2g branch:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.tif
work/03-nonlinear/03r-dbe-manual-spcc-visual-v2g-final.xisf
```

This output was made from the manual-DBE branch after metadata-restored SPCC with background neutralization. It uses a linked-RGB stretch, selective luminance-shaped nebula color enhancement, dark-sky red/blue/green neutrality cleanup, and a stronger StarMask/MorphologicalTransformation star-reduction pass tuned to catch more stars inside the nebula. It is the best presentation candidate so far that still starts from a successful SPCC calibration, but it is not a pure raw-SPCC color result.

Useful comparison candidates from the same v2 polish branch are:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2e.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2f-strong-stars.jpg
work/03-nonlinear/masks/rosette-spcc-visual-v2g-star-mask.jpg
```

Dark-sky JPEG sampling shows the v2g background is much closer to neutral than the previous restrained star-reduced branch. The older branch had low-sky medians around `R-G=+2..+3` and `B-G=+3..+4`; v2g is around `R-G=-1` and `B-G=0..+1`. Bright-pixel counts also dropped compared with v2e/v2f, so v2g is the strongest star-reduced candidate from this script family.

The local starless approximation outputs are:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-balanced-v2.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-aggressive-v2.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-two-pass.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-matte.jpg
```

These are diagnostic only. The inpainting variants leave star scars or residual bright stars; the broad matte variant removes more stars but sacrifices fine nebular texture. Do not resume from these as final products.

The same SPCC-based visual branch without star reduction is:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.tif
work/03-nonlinear/03r-dbe-manual-spcc-visual-restrained-final.xisf
```

The best current restrained visual output is:

```text
work/03-nonlinear/rosette-dss-bgcal-experimental.jpg
work/03-nonlinear/rosette-dss-bgcal-experimental.tif
work/03-nonlinear/03r-dss-bgcal-final.xisf
```

This output was made from the forced-`RGGB` WBPP master through user-guided manual DBE, per-channel background calibration modeled after the historical DSS setting, linked-RGB hard STF, mild green suppression, curves, and final crop/export. It is not SPCC-calibrated, but it is now the best visual comparison because the background is not globally red.

The stronger camera-white-balance variant is:

```text
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.jpg
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.tif
work/03-nonlinear/03r-camera-wb-bgcal-final.xisf
```

This uses the Canon CR2 white-balance multipliers before per-channel background calibration. It is more saturated and more pink, useful as a visual reference for what the camera preview is doing.

The older blunt red-remix output is:

```text
work/03-nonlinear/rosette-dbe-manual-visual-redmix.jpg
work/03-nonlinear/rosette-dbe-manual-visual-redmix.tif
work/03-nonlinear/03r-dbe-manual-visual-final.xisf
```

This output was made from the forced-`RGGB` WBPP master through:

1. User-guided manual DBE (`02a-dbe-manual-subtract.xisf`).
2. Hard-applied STF stretch (`03r-rosette-hardstf.js`).
3. Green suppression, contrast/saturation curves, and a manual red-channel remix (`03r-rosette-color-remix.js`).
4. Existing final crop/export script.

Use it as proof that the data contains red signal, not as the preferred output; it boosts red too globally.

The earlier non-DBE redmix output remains useful for comparison:

```text
work/03-nonlinear/rosette-redmix-experimental.jpg
work/03-nonlinear/rosette-redmix-experimental.tif
work/03-nonlinear/03r-rosette-redmix-final.xisf
```

The best background-controlled calibrated comparison branch is:

```text
work/03-nonlinear/rosette-dbe-manual-experimental.jpg
work/03-nonlinear/rosette-dbe-manual-experimental.tif
work/03-nonlinear/03r-dbe-manual-final.xisf
```

This output was made from the forced-`RGGB` WBPP master through user-guided manual DBE, fresh plate solve, BackgroundNeutralization + ColorCalibration fallback, SCNR, MLT linear noise reduction, hard-STF stretch, and final crop/export. It has better background control than the earlier automated branches, but it remains mostly gray/green and is not accepted as the target color result.

The most complete SPCC-based calibrated comparison branch is:

```text
work/02-linear/02c-dbe-manual-spccmeta-spcc.xisf
work/02-linear/02c-dbe-manual-spccmeta-spcc-no-bn.xisf
work/03-nonlinear/rosette-dbe-manual-spcc-bn-neutral-stretch.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-no-bn-neutral-stretch.jpg
work/03-nonlinear/rosette-synthbg-calibrated-experimental.jpg
work/03-nonlinear/rosette-synthbg-calibrated-experimental.tif
work/03-nonlinear/03r-synthbg-calibrated-final.xisf
```

The manual-DBE SPCC files are now the best direct SPCC diagnostic branch because they start from the cleanest background model and scripted SPCC succeeds after metadata restoration. The plain neutral stretches intentionally skip SCNR and curves. They show that the remaining gray/green Rosette result is already present after SPCC, before cosmetic finishing. The synthetic-background branch remains useful as an earlier comparison, but it is not the preferred SPCC diagnostic branch.

## How To Start Phase 1

Set local `.env` values or pass paths explicitly. For this target, `PI_LIGHT_DIRS` should be semicolon-separated if using both east and west folders.

```powershell
& .\scripts\run-wbpp-phase1.ps1 `
  -ProjectDir .\projects\rosette-2014-03-02 `
  -LightDirs @(
    '<original-capture-root>\good\east',
    '<original-capture-root>\good\west'
  ) `
  -DarkDir '<dark-library-root>\240s-1600iso' `
  -CfaPattern RGGB `
  -Fresh
```

## Next Tasks

1. Install StarXTerminator or a comparable star-separation tool in PixInsight.
2. Generate starless and stars-only layers from the v2g XISF/TIFF.
3. Enhance the starless Rosette separately, then recombine with a reduced/desaturated stars-only layer.
4. Refine the DSS-style per-channel background calibration path and compare it with the historical 2014 output.
5. Inspect WBPP rejection maps and frame quality for the 33-frame set.
6. Decide whether to rerun with the historical 31-frame DSS-equivalent set, the 33-frame top-level good set, or all 37 good frames.
