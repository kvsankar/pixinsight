# Trifid / Lagoon Processing Research

**Scope:** Research and processing implications for the 2014 Canon EOS 60D Trifid/Lagoon data, likely captured with the ES ED80 plus reducer.
**Last reviewed:** 2026-05-27.

## Target Facts That Matter For Processing

The Lagoon Nebula / M8 is a bright star-forming emission nebula in Sagittarius with a young embedded cluster and dark cloud structure. The red/pink signal is real hydrogen emission, not just a color embellishment.

The Trifid Nebula / M20 is more complicated: it combines red emission nebulosity, blue reflection nebulosity, and dark dust lanes. A processing path that globally pushes red or globally neutralizes background can damage one of these components.

The two targets are close enough to share an ES ED80/reducer APS-C field. The frame also includes dense Sagittarius Milky Way stars and dust, so there may be very little "empty sky" for background sampling.

Approximate plate-solve seed for the combined field:

| Parameter | Initial value |
| --- | ---: |
| RA | 270.75 deg |
| Dec | -23.70 deg |
| Focal length | 386 mm initial guess |
| Pixel size | 4.31 um |
| Approx. scale | 2.3 arcsec/px initial guess |

Use the solved scale after Phase 2 as truth.

## Dataset-Specific Implications

The data is unmodified Canon EOS 60D broadband DSLR data. H-alpha response will be weaker than a modified-camera dataset, so the final image should not chase narrowband-style red at the cost of star color and reflection nebulosity.

The May primary data has 39 x 120s at ISO1600, or 78 minutes. The March comparison data has 38 x 120s, or 76 minutes. These are useful but not deep by modern standards for a broadband DSLR nebula field, so noise and gradients will set the ceiling.

The May and March sessions have different temperature ranges:

| Session | Temp range | Calibration consequence |
| --- | --- | --- |
| May 2014 | +31 to +34 C | 33/34 C darks are a plausible first match |
| March 2014 | +24 to +30 C | No close 120s darks found; no-dark and flat/no-flat tests are safer first |

Do not make a single WBPP integration from both sessions until each session has been integrated and inspected separately.

## Findings From This Dataset

The solved March and May masters both support the ED80/reducer interpretation, not the stale EXIF `50.0 mm` value. Both solved near 386.21 mm and 2.302 arcsec/px.

The March no-dark/no-flats branch is currently the best match to the historical attempt-02 reference. It has the same target scale, stronger Trifid/Lagoon color potential, and a more familiar Sagittarius field than the May branch.

Rejected diagnostics:

- March flat/no-dark branch: the tested flat set created visible flat mismatch and banding.
- March no-ABE branch: retained too much vignetting and large-scale field gradient.
- March ABE-divide branch: produced severe green/chroma artifacts.
- May SPCC no-background-neutralization: useful as a diagnostic, but harsher and less balanced than the default SPCC+BN branch.

Practical implication: use the subtractive ABE Phase 2 branch as the current technical baseline, but tune the nonlinear finish with care so it does not become too dark compared with the historical reference.

## Recommended Processing Strategy

### Calibration And Integration

- Start with the May `good` lights only.
- Use 33 C and 34 C 120s ISO1600 darks first.
- Keep the 35 C and 36 C darks as a comparison only if hot pixels remain problematic.
- Run a no-dark control if the first master shows dark overcorrection.
- Test the 2014-03-02 flats only as a branch. They are promising if they share the ED80/reducer optical train, but they are not same-night May flats.
- Use WBPP with distortion-aware registration and LocalNormalization.
- Use large-scale high rejection to help with any aircraft/satellite/washed artifacts, but keep rejection conservative enough not to erase diffuse Milky Way structure.

### Background And Gradient

The key risk is subtracting real signal as background. Avoid placing DBE samples on:

- M8 / Lagoon and its surrounding red nebulosity.
- M20 / Trifid, including the blue reflection region.
- The dark lanes around M20.
- The central Milky Way band and obvious dust lanes.

Suggested order:

1. Produce linked-STF previews of each integrated master before correction.
2. Try a restrained automatic background correction only as a diagnostic.
3. Prefer manual DBE or a carefully reviewed MGC/DBE branch for the accepted path.
4. Compare background models directly; reject any model that visibly contains M8, M20, or Milky Way dust structure.

### Color Calibration

Run SPCC only after a successful plate solve. Use Canon EOS 60D filter response names:

```text
Canon EOS 60D R
Canon EOS 60D G
Canon EOS 60D B
```

SPCC calibrates the stellar color system, but it does not decide the artistic balance between red emission, blue reflection, and dust contrast. Keep a no-background-neutralization comparison if the default background-neutralized result suppresses M8/M20 color in a way that conflicts with the raw/linked preview and target physics.

### Nonlinear Finish

The final image should be a wide-field Milky Way composition, not a tight crop of either nebula. Priorities:

- Use GHS, MaskedStretch, or careful HistogramTransformation to preserve faint dust while keeping stars under control.
- Increase saturation through masks, not globally.
- Apply local contrast around the nebulae and dust lanes gently.
- Consider star reduction or StarXTerminator only after the baseline color/background is accepted.
- If a starless workflow is used, process the starless nebula and star layer separately, then recombine with desaturated/reduced stars.

## Source Notes

- NASA's Messier 8 page describes the Lagoon Nebula as a star-forming region in Sagittarius, with glowing gas and young stars. This supports preserving red emission and embedded cluster structure.
- NASA's Messier 20 page describes the Trifid as a combination of red emission nebula, blue reflection nebula, and dark lanes. This supports a mixed-color strategy instead of a single red push.
- PixInsight SPCC documentation and installed process behavior require a solved image and appropriate sensor/filter response to calibrate broadband color.
- PixInsight ImageSolver and projection/distortion guidance matters here because the EXIF focal length is unreliable; the project's `02b-platesolve.js` accepts target-specific focal-length overrides and should start near the ED80/reducer scale.
- PixInsight's solver-distortion notes support using distortion correction for fields where optical distortion matters. This is consistent with the successful solved ED80/reducer March and May masters.
- The existing Rosette and M42 project notes in this repo are directly relevant: both showed that linked previews, background models, and conservative branch comparisons are more trustworthy than assuming one automated color/background pass is correct.

## Sources

- [NASA - M8 Lagoon Nebula and M20 Trifid Nebula image reference](https://science.nasa.gov/asset/hubble/m8-lagoon-nebula-and-m20-trifid-nebula/)
- [NASA - Messier 8, The Lagoon Nebula](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-8/)
- [NASA - Messier 20, The Trifid Nebula](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-20/)
- [PixInsight - SpectrophotometricColorCalibration reference](https://www.pixinsight.com/doc/docs/SPCC/SPCC.html)
- [PixInsight - New Plate Solving Distortion Correction Algorithm](https://pixinsight.com/tutorials/solver-distortion/)
- [PixInsight - WCS projections reference](https://pixinsight.com/doc/docs/Projections/Projections.html)
- [PixInsight - Multiscale Gradient Correction tutorial](https://www.pixinsight.com/tutorials/multiscale-gradient-correction/)
- [PixInsight - Arbitrary Distortion Correction with StarAlignment](https://www.pixinsight.com/tutorials/sa-distortion/index.html)
- [PixInsight - WeightedBatchPreprocessing script documentation](https://pixinsight.com/doc/scripts/WeightedBatchPreprocessing/WeightedBatchPreprocessing.html)
- [Nebula Photos - Lagoon and Trifid wide-field DSLR processing example](https://www.nebulaphotos.com/resources/lagoon/)
