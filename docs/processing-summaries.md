# Processing Summaries

This page gives a compact view of the processing path for each target processed in this repository. It intentionally does not replace the detailed per-target status, pipeline, research, or journey notes.

## M31 / Andromeda 2013

Current result: v3 ED80-aware PixInsight export.

Detailed notes:

- [Status](../projects/m31-andromeda-2013/docs/status.md)
- [Pipeline](../projects/m31-andromeda-2013/docs/pipeline.md)
- [Original 2013 processing evidence](../projects/m31-andromeda-2013/docs/original-2013-processing.md)

Summary process:

1. Reconstructed the original dataset and historical DSS/Photoshop context.
2. Used the homogeneous Canon EOS 60D ISO 1600 long-light set: 27 usable 240s lights, matched with 9 240s ISO 1600 darks.
3. Ran WBPP for calibration, debayer, registration, LocalNormalization, and integration. No flats or bias were available.
4. Corrected the early false 50 mm assumption after plate-solving failed; the data solved as an ED80-scale field around 386 mm effective focal length.
5. Ran linear cleanup: ABE, plate solve, SPCC, SCNR, and conservative MultiscaleLinearTransform noise reduction.
6. Ran nonlinear processing with MaskedStretch, generated galaxy and star masks, then applied restrained HDRMultiscaleTransform, LocalHistogramEqualization, Curves, and crop/export.
7. Created feedback-loop refinements:
   - v2 reduced residual green/cyan bias and smoothed background chroma noise.
   - v3 added mild star reduction and restrained detail/color polish appropriate for the solved ED80-scale data.
8. Accepted `m31-final-v3` as the current best stock-PixInsight result.

Primary feedback signals:

- Plate-solve failures exposed the wrong focal-length assumption.
- Visual inspection showed residual green/cyan bias after the first final, leading to v2.
- Visual inspection of the ED80-scale result showed room for mild star/detail polish, leading to v3.

## Rosette Nebula 2014

Current result: StarXTerminator v3b clean presentation candidate, v3h old-red starless layer, and v3j subtle/sparse-star presentation candidate; none is considered scientifically final.

Detailed notes:

- [V3B presentation candidate](../projects/rosette-2014-03-02/docs/final-v3b.md)
- [V3G old-red depth candidate](../projects/rosette-2014-03-02/docs/v3g-old-red-depth.md)
- [V3H old-red starless layer](../projects/rosette-2014-03-02/docs/v3h-old-red-starless.md)
- [V3I/V3J subtle stars](../projects/rosette-2014-03-02/docs/v3i-v3j-subtle-stars.md)
- [Status](../projects/rosette-2014-03-02/docs/status.md)
- [Processing journey](../projects/rosette-2014-03-02/docs/processing-journey.md)
- [Pipeline](../projects/rosette-2014-03-02/docs/pipeline.md)
- [Original 2014 processing evidence](../projects/rosette-2014-03-02/docs/original-2014-processing.md)
- [2014 finished-work result](../projects/rosette-2014-03-02/docs/images/original-2014-photoshop.jpg)
- [2026 StarXTerminator v3b result](../projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3b.jpg)
- [2026 StarXTerminator v3g old-red depth result](../projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3g-old-red-depth.jpg)
- [2026 StarXTerminator v3h old-red starless result](../projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3h-old-red-starless.jpg)
- [2026 StarXTerminator v3j subtle stars result](../projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3j-sparse-anchor-stars.jpg)

Summary process:

1. Reconstructed the historical Rosette folder layout and DSS/Photoshop evidence.
2. Built the first repeatable PixInsight baseline from the 33 top-level good Canon EOS 60D lights: 240s, ISO 1600, with the same 9 darks used historically.
3. Ran WBPP, then ABE, plate solving, SPCC, SCNR, and linear noise reduction.
4. Found that the normal SPCC/background-neutralization path produced an implausible gray-green Rosette despite valid WCS/Gaia execution.
5. Investigated the color problem through multiple feedback branches:
   - CFA diagnostics on raw and calibrated CFA frames.
   - Forced `RGGB` and `BGGR` WBPP reruns.
   - Linked versus unlinked STF previews to avoid misleading per-channel display stretches.
   - SPCC with and without background neutralization.
   - Canon EOS 60D filter-response names.
   - Manual color calibration fallback.
   - Synthetic-background correction.
   - User-guided manual DBE.
   - DSS-style per-channel background calibration.
   - SPCC diagnostic star-ratio exports.
6. Restored missing SPCC metadata after the manual DBE branch so scripted SPCC could run on the DBE-derived image.
7. Built presentation-oriented branches that selectively restored Rosette pink/red nebulosity while trying to keep the sky neutral.
8. Tested local starless approximations after the v2g visual result, but did not accept them as final because they left artifacts or removed nebular texture.
9. After StarXTerminator was installed, generated clean starless and stars-only layers from the pre-morphological v2e polish.
10. Enhanced the starless nebula separately, recombined a reduced/desaturated star layer, and accepted `rosette-starxterminator-v3b` as the current presentation candidate while documenting that the color/background problem is not fully solved.
11. Added compressed, metadata-stripped comparison previews for the historical finished-work result and the current v3b result.
12. Compared v3b against the historical finished-work image and tuned a v3g old-reference depth branch with darker sky, stronger midtone contrast, and protected crimson/red hue shift.
13. Exported v3h as the same old-reference red/depth treatment with no star recombination after v3g's stars read too warm/red.
14. Exported v3i/v3j by applying red/depth before stars and adding back threshold-gated, desaturated stars; v3j is the best sparse-anchor-star version so far.

Subs used for v3b:

| Group | Subs | Exposure | ISO | Total |
| --- | ---: | ---: | ---: | ---: |
| `good/east`, top-level | 3 | 240s | 1600 | 12 min |
| `good/west`, top-level | 30 | 240s | 1600 | 120 min |
| **Total** | **33** | **240s** | **1600** | **132 min / 2h12m** |

Human involvement:

| Human input | Why it mattered |
| --- | --- |
| Manual DBE sample placement | Avoided subtracting real Rosette nebulosity as background. |
| Raw/embedded CR2 preview color observation | Kept the red-signal investigation alive and led to linked previews and DSS-style background calibration. |
| StarXTerminator installation | Enabled the current v3b starless/stars workflow. |
| Interactive SPCC test | Helped diagnose scripted SPCC metadata failure; operator not explicitly identified in the notes. |

Primary feedback signals:

- The historical Photoshop output and embedded CR2 previews showed that red/pink Rosette signal exists.
- Linked previews showed the pre-calibrated data behaved differently than earlier unlinked diagnostic views suggested.
- Manual DBE improved background control, but SPCC still suppressed the emission color.
- Starless attempts showed that a dedicated star-separation tool is needed before pushing the Rosette finish further.
- StarXTerminator v3b reduced bright-star dominance substantially while keeping sampled dark-sky color close to neutral.
- Visual comparison against the old finished-work image showed v3b was clean but too flat/gray, leading to the deeper v3g old-reference branch.
- Visual comparison of v3g showed the red treatment also warmed the star field, so v3h keeps the nebula treatment as a starless layer.
- Visual comparison of v3i/v3j showed that v3j gives the better small-number/subtle-star compromise.

## Horsehead / Flame 2013-2016

Current result: accepted v1 from the `04c` mixed-camera branch.

Detailed notes:

- [Final v1](../projects/horsehead-flame-2013-2016/docs/final-v1.md)
- [Status](../projects/horsehead-flame-2013-2016/docs/status.md)
- [Processing journey](../projects/horsehead-flame-2013-2016/docs/processing-journey.md)
- [Pipeline](../projects/horsehead-flame-2013-2016/docs/pipeline.md)
- [Repo-level processing plan](horsehead-processing-plan.md)
- [2013 finished-work result](../projects/horsehead-flame-2013-2016/docs/images/original-2013-finished-work.jpg)
- [2026 PixInsight v1 result](../projects/horsehead-flame-2013-2016/docs/images/horsehead-04c-v1-polish.jpg)

Summary process:

1. Scanned the archive for Horsehead/Flame sessions and separated the usable narrow-field groups from bad, tree-obscured, trial, preview, and old processing-output folders.
2. Chose separate master integrations rather than mixing heterogeneous raw subs:
   - 2013-12-31 Canon EOS 60D unmodified, 23 x 240s ISO 1600, broadband/color base.
   - 2016-01-09 Canon EOS Rebel T1i modified, 28 x 180s ISO 1600, clean red/H-alpha support.
   - 2016-01-09 Canon EOS Rebel T1i modified, 41 x 300s ISO 1600, washed-out red/H-alpha support test.
3. Ran separate WBPP branches:
   - The 60D branch used matching 240s ISO 1600 darks and no flats.
   - The T1i branches used matching flats but no matching darks, so they were treated as documented no-dark support controls.
4. Ran Phase 2 linear processing:
   - ABE and plate solving on the accepted masters.
   - SPCC only on the unmodified 60D broadband branch.
   - No SPCC on modified T1i branches because they were red/H-alpha support, not broadband color truth.
5. Registered both solved T1i masters to the solved 60D reference.
6. Created reproducible red-support comparison blends:
   - `04a`: 60D plus clean T1i red support.
   - `04b`: 60D plus clean T1i and full washed T1i red support.
   - `04c`: 60D plus clean T1i and half-weight washed T1i red support.
7. Rendered controlled comparison previews using the same crop and 60D-derived stretch.
8. Measured fixed red-channel ROIs around IC 434 and Alnitak to compare signal lift against halo/background cost.
9. Selected `04c` because it kept most of the useful IC 434/Horsehead lift from the washed branch while reducing the Alnitak penalty compared with full washed support.
10. Cropped `04c`, ran a conservative MaskedStretch, applied target-specific nonlinear polish, and exported the v1 XISF/TIFF/JPEG products.
11. Tested a very mild star-reduction branch, but kept the plain v1 polish as the accepted presentation result.
12. Added compressed, metadata-stripped comparison previews for the historical finished-work result and the current v1 result.

Primary feedback signals:

- The first T1i WBPP launch revealed accidental `.env` dark leakage; the wrapper was patched and the branch rerun correctly.
- Controlled previews showed the washed-out branch added useful signal but risked extra halo/background cost.
- ROI statistics confirmed the half-weight washed branch was the better compromise.
- Visual comparison showed the optional star-reduced version was too subtle to replace the plain v1 polish.

## Orion Nebula / M42 2013

Current result: accepted final v1 from the v8 300s faint-support branch.

Detailed notes:

- [Final v1](../projects/orion-nebula-m42-2013/docs/final-v1.md)
- [Status](../projects/orion-nebula-m42-2013/docs/status.md)
- [Processing journey](../projects/orion-nebula-m42-2013/docs/processing-journey.md)
- [Pipeline](../projects/orion-nebula-m42-2013/docs/pipeline.md)
- [M42 processing research](../projects/orion-nebula-m42-2013/docs/research/01-m42-processing.md)
- [2013 finished-work result](../projects/orion-nebula-m42-2013/docs/images/original-2013-finished-work.jpg)
- [2026 final v1 result](../projects/orion-nebula-m42-2013/docs/images/m42-2013-v8-presentation.jpg)
- [2013 / v7 / final v1 comparison](../projects/orion-nebula-m42-2013/docs/images/m42-2013-original-v7-v8-presentation-comparison.jpg)

Summary process:

1. Scanned the archive and reconciled local source folders with the public acquisition notes on sankara.net.
2. Confirmed the February M42 image was shot with a Canon EOS 60D and Canon EF 70-200 mm lens at the published 200 mm f/3.5 setting; plate solving later measured about 193 mm effective focal length and 4.60 arcsec/px.
3. Kept the January 2013 EXIF-50mm Orion data as a separate possible wide-field branch because the true field scale was not proven.
4. Ran separate WBPP branches for 180s, 300s, and 60s diagnostic groups instead of mixing exposure lengths at the raw-frame stage.
5. Compared 180s flat-calibrated and no-flats branches through identical Phase 2 processing, then selected the 180s no-flats branch because it retained more outer M42/M43 structure.
6. Ran Phase 2 on the 300s branch and registered it to the 180s no-flats grid for possible faint-nebulosity support.
7. Audited the core/HDR situation and documented that the sparse 60s material was not a clean Trapezium replacement.
8. Built M42-specific nonlinear scripts for masked stretch, core compression, color/contrast polish, and core blending.
9. Iterated through v3-v7 based on visual feedback about the bright core, crop placement, color, contrast, and missing background nebulosity.
10. Accepted final v1 from v8: an adjusted-crop 180s base with quiet-core blend, conservative registered-300s faint support, and a lighter final presentation polish.

Primary feedback signals:

- Public acquisition notes corrected uncertainty about the February M42 optics while plate solving supplied the processing scale.
- Raw/core saturation checks kept the result honest about Trapezium limits.
- Visual feedback showed the v6 crop was high, v7 color/contrast was improved but too conservative on background nebulosity, and v8 gave the preferred depth/crop balance.
- The 300s support layer improved surrounding haze at the cost of some background texture; that tradeoff was accepted for final v1.

## Shared Workflow Pattern

Across the processed targets, the repeatable pattern is:

1. Inventory the raw archive and historical processing evidence.
2. Split incompatible acquisition groups before integration.
3. Run WBPP as Phase 1 with calibration choices documented.
4. Plate-solve once on integrated masters, not inside headless WBPP.
5. Run target-appropriate linear cleanup and color calibration.
6. Export small previews for comparison.
7. Tune scripts only after inspecting outputs or diagnostic measurements.
8. Keep generated XISF/TIFF/FITS products under ignored `work/` directories.
9. Check in only source scripts, notes, and small documentation previews.
