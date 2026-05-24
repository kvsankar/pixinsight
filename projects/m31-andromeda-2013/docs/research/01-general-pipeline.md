# PixInsight Standard Processing Pipeline for M31 (Andromeda Galaxy)

**Scope:** Modern (2023–2026) consensus workflow with **stock PixInsight processes only**. No third-party paid plugins (BlurXTerminator / NoiseXTerminator / StarXTerminator) are used.
**Target gear assumption:** Canon DSLR, ~24 light frames, 50 mm wide-field optic, master dark available, **no flats, no bias**.
**Last reviewed:** 2026-05-23
**Author:** research compiled from PixInsight Reference Documentation, Light Vortex Astronomy, Chaotic Nebula, Stirling Astrophoto, Adam Block / RBA / CloudyNights consensus discussions, and the PixInsight forum.

---

## TL;DR — The Pipeline at a Glance

```
                 RAW CR2 LIGHTS  +  MASTER DARK ONLY
                          |
                          v
 1. WBPP (or manual)  ImageCalibration  --(master dark)-->  calibrated CFA
                          |
                          v
 2. CosmeticCorrection  (Auto Detect, Hot σ ≈ 3.0, Cold σ ≈ 3.0; master-dark mode)
                          |
                          v
 3. Debayer              (Pattern = RGGB for Canon, VNG algorithm)
                          |
                          v
 4. SubframeSelector     (weight formula; reject FWHM and eccentricity outliers)
                          |
                          v
 5. StarAlignment        (best frame as reference, 2-D Surface Splines + Distortion Correction for 50 mm)
                          |
                          v
 6. LocalNormalization   (reference = pre-integrated best ~6 frames)
                          |
                          v
 7. ImageIntegration     (Winsorized σ-clip for 24 frames; weights from SFS; Local Normalization input)
                          |
                          v
                =====  LINEAR STAGE  =====
                          |
 8. DynamicCrop          (remove stacking edges)
                          |
                          v
 9. DBE  (two passes)    (vignetting pass: edge samples + Division;
                          gradient pass: spread samples + Subtraction)
                          |
                          v
10. SPCC                  (Average Spiral Galaxy white reference;
                          Canon DSLR Bayer filters; needs plate-solve)
                          |
                          v
11. Deconvolution (opt.)  (Regularized Richardson–Lucy; DynamicPSF model;
                          star mask + local deringing; luminance only)
                          |
                          v
12. Linear NR            (MultiscaleLinearTransform layers 1–4 with inverted lum mask;
                          + TGVDenoise optional in CIE L*a*b*)
                          |
                          v
                =====  NON-LINEAR STAGE  =====
                          |
13. Stretch              (M31: GHS preferred; MaskedStretch acceptable;
                          ArcsinhStretch good for color saturation;
                          finish with HistogramTransformation)
                          |
                          v
14. LocalHistogramEqualization  (kernel ~64–150 px, contrast 1.5–2.0, amount 0.3–0.5, range mask)
                          |
                          v
15. CurvesTransformation (saturation, gentle S-curve on RGB/K)
                          |
                          v
16. MorphologicalTransformation  (Erosion or Morph. Selection, 3x3 diamond, through star mask)
                          |
                          v
17. Final NR             (ACDNR or TGVDenoise on chroma)
                          |
                          v
                       FINAL IMAGE
```

**Key 2023–2026 changes vs. the older Light Vortex workflow (2014–2018):**
- **SPCC** has replaced PCC as the recommended color calibration tool.
- **LocalNormalization** is now considered effectively mandatory before integration.
- **GeneralizedHyperbolicStretch (GHS)** is the favored stretch for M31's extreme dynamic range — it has displaced MaskedStretch for galaxies in most community discussions.
- **WBPP** has matured to where it is recommended over manual pre-processing in nearly all cases.

---

## 1. Calibration — ImageCalibration

### What it does
Subtracts a master dark from each light frame to remove dark current and bias signal. With no flats, no flat correction is applied (the field will still have vignetting + dust motes, which DBE must clean up later).

### Master-dark-only setup
Since no flats are available, the bias is also unnecessary in PixInsight: **bias frames are only needed for the calibration of flats, or for dark frame optimization.** In a "darks only" workflow these can be skipped entirely.

**ImageCalibration settings (or WBPP equivalent):**
- **Master Bias:** *unchecked* (none)
- **Master Dark:** loaded; **Calibrate** = off (the master dark already includes the bias for matched-exposure / matched-temperature darks)
- **Optimize:** off (turn on only if you have a bias master and your darks were taken at a different exposure or temperature — usually not advisable for DSLRs)
- **Master Flat:** *unchecked* (none)
- **Output pedestal:** 0 (Auto only if you see negative pixels)
- **Evaluate noise:** **ON** (this populates NOISExx FITS keywords used by ImageIntegration weighting)
- **Output extension:** `.xisf` (preserve float32 precision)

### Common mistakes
- Loading darks taken at a wildly different temperature than the lights (DSLR darks must be temperature-matched within a few °C — Canon CR2 sensor temperature varies during a session).
- Forgetting to leave **Calibrate Dark = OFF** when the master dark was built from temperature-matched darks (you'd be removing the wrong bias).
- Trying to apply a "synthetic flat" via Calibration — that's DBE's job in this workflow.

### Sources
- [Light Vortex Astronomy — Pre-processing in PixInsight](https://www.lightvortexastronomy.com/tutorial-pre-processing-calibrating-and-stacking-images-in-pixinsight.html)
- [Bernd Landmann — Guide to PixInsight's ImageCalibration (PDF)](https://sh-cosmiccanvas.s3.us-west-2.amazonaws.com/Resources/20200902_GuideToPIsImageCalibration.pdf)

---

## 2. CosmeticCorrection

### What it does
Removes the residual hot and cold pixels that survive the dark subtraction. Even an excellent master dark cannot zero out every defect on a DSLR sensor because pixel response drifts with temperature.

### Required for a master-dark-only DSLR workflow?
**Yes — strongly recommended.** Even with a temperature-matched master dark, Canon DSLRs produce a noticeable "starfield of hot pixels" after debayering, and these can survive into integration if rejection settings are weak.

### Recommended settings
- **Use Master Dark:** ON, pointed at the same master dark you used in Calibration. This is the most reliable mode: PixInsight identifies hot/cold pixels in the master dark and replaces them in each light.
  - **Hot Sigma:** ~3.0 (lower = more aggressive)
  - **Cold Sigma:** ~3.0
- **Use Auto Detect (fallback or supplement):**
  - **Hot Sigma:** 3.0 (default works well; do **not** go below 1.0 — that destroys real signal)
  - **Cold Sigma:** 3.0
- **Show Map** in real-time preview to visually verify only true defects are flagged.

### Position in workflow
Run on **calibrated, CFA (still mosaiced) frames** — **before** Debayer. Running after Debayer can colorize the corrected pixels incorrectly.

### Common mistakes
- Sigma values < 1.0 (deletes faint stars).
- Running on already-debayered (RGB) data — the per-channel statistics get distorted by the Bayer pattern.
- Skipping it because "WBPP handles it" — WBPP does, but you should verify the auto-detect map looks sensible.

### Sources
- [Chaotic Nebula — PixInsight Cosmetic Correction](https://chaoticnebula.com/cosmetic-correction/)
- [PixInsight Forum — CosmeticCorrection Settings with Master Dark](https://pixinsight.com/forum/index.php?threads/cosmeticcorrection-settings-with-master-dark.8060/)

---

## 3. Debayering — Debayer

### What it does
Demosaics the Bayer CFA into a full RGB image, one of three interpolation algorithms.

### Pattern detection for Canon CR2
- Canon DSLRs use the **RGGB** Bayer pattern. PixInsight can usually detect this from FITS/XISF headers, but for raw CR2 the pattern is fixed: **explicitly set Bayer/mosaic pattern = RGGB.**
- If you see false-color crosshatch or magenta/green tinting after debayer, the pattern is wrong — try BGGR or GRBG.

### Algorithm choice — VNG vs SuperPixel vs Bilinear
| Algorithm  | Resolution | Color fidelity | Notes |
|------------|-----------|----------------|-------|
| **VNG**    | Full      | Excellent      | **Recommended.** Variable-Number-of-Gradients; best compromise of detail and color accuracy for OSC. |
| SuperPixel | **Half**  | Excellent      | Averages each 2x2 Bayer cell into 1 RGB pixel. Halves resolution but produces zero interpolation artifacts. Good for star tests / when oversampled. |
| Bilinear   | Full      | Mediocre       | Fast but produces colored fringes around stars. Avoid. |

**For M31 wide-field at 50 mm:** stars are tiny (1–2 px), so **VNG** is the safe default. SuperPixel is tempting at long focal lengths where you are heavily oversampled, but at 50 mm you almost certainly need every pixel.

### Settings
- **Bayer/mosaic pattern:** RGGB (Canon)
- **Demosaic method:** VNG
- Run on the cosmetically corrected calibrated frames.

### Common mistakes
- Letting WBPP auto-detect the pattern from a CR2 that has been re-saved by another program (the pattern hint can be lost).
- Using SuperPixel on undersampled wide-field — you destroy resolvable star detail.

### Sources
- [Telescope Live — PixInsight Debayer / Demosaicing](https://telescope.live/blog/pixinsight-debayer-demosaicing-process-explained)
- [PixInsight Forum — Debayer Pattern Canon](https://pixinsight.com/forum/index.php?threads/debayer-pattern-canon-450d.11423/)

---

## 4. Sub-frame Quality Assessment — SubframeSelector

### What it does
Measures each calibrated/debayered frame for FWHM, eccentricity, SNR, star count, etc., and either (a) rejects bad frames outright and/or (b) computes a per-frame weight that ImageIntegration will use in the average.

### Recommended weight formula (M31 / nebula type targets — emphasis on signal)
A modern, community-favored formula that uses min/max normalization so the best frame ends up at weight 100:

```
(15 * (1 - (FWHM        - FWHMMin)        / (FWHMMax        - FWHMMin)))
+ (15 * (1 - (Eccentricity - EccentricityMin) / (EccentricityMax - EccentricityMin)))
+ (20 *      (SNRWeight  - SNRWeightMin)   / (SNRWeightMax   - SNRWeightMin))
+ 50
```

Total range: **50 (worst) → 100 (best).** The fixed pedestal of **50** prevents weights from going to zero on borderline frames.

**Alternative (simpler, very popular in 2024–26):**
- **Just use PSFSignalWeight** as the weight expression. It already integrates FWHM, signal, and noise in a way that is well-matched to ImageIntegration's `Average` combination. The newer PSFSignalWeight is empirically the best single-metric weight for most DSO targets.

**Cluster / star-field oriented formula:** put 35 % on each of FWHM and Eccentricity, only 10 % on SNR — but **for M31** stick with the nebula/galaxy-weighted form above.

### Rejection criteria (reject, don't just down-weight)
Typical hard cutoffs for a 24-frame DSLR set:
- `FWHM < median(FWHM) * 1.30`  (drops the soft 5–10 % outliers)
- `Eccentricity < 0.575`  (round-ish stars only)
- `Stars > median * 0.5`  (drop frames where clouds killed star counts)

For 24 frames you can usually keep **20–22 frames** after applying these — losing more than ~15 % means your thresholds are too tight.

### Common mistakes
- Computing the weight formula but **forgetting to copy it to ImageIntegration's "Image weight" field**. The formula must propagate.
- Adding a pedestal of 0 → many frames end up at weight 0 → effectively rejected during integration.
- Using FWHM expressed in **pixels** on one session and **arcseconds** on another (set `Subframe scale` and `Camera resolution` correctly so the unit is consistent across sessions).

### Sources
- [PixInsight Reference Documentation — SubframeSelector](https://pixinsight.com/doc/scripts/SubframeSelector/SubframeSelector.html)
- [Chaotic Nebula — Subframe Selector Guide](https://chaoticnebula.com/pixinsight-subframe-selector/)
- [Stirling Astrophoto — SubframeSelector & PSFSignalWeight](https://stirlingastrophoto.com/posts/subframeselector-psfsignalweight-drizzle/)
- [Keen Astro — Subframe Selector: Analysing and Weighting Your Data](https://www.keenastro.com/subframe-selector-analysing-and-weighting-your-data/)

---

## 5. Registration — StarAlignment

### What it does
Re-projects each frame onto the geometry of a single reference frame (usually the best-scoring frame from SubframeSelector). Necessary before integration.

### Settings for wide-field 50 mm DSLR

A 50 mm lens has noticeable optical distortion at the edges (pincushion / coma), so the projective transform is **not enough** — you want a spline-based, distortion-aware registration.

**Recommended registration model:**
- **Registration model:** *2-D Surface Splines (Thin-Plate Splines)*
- **Distortion correction:** **ON**
- **Distortion iterations:** 20 (default fine; 100 is overkill for a single-session 50 mm set)
- **Distortion model:** leave at default unless you have one from a previous run

**Star detection:**
- **Detection scales:** 5 (default)
- **Star detection sensitivity:** 0.5 (default)
- **Noise scales:** 1 (default)
- **Maximum stars:** Auto — let PixInsight pick

**Pixel interpolation:**
- **Bicubic B-Spline** (best for downstream noise reduction)
- **Clamping threshold:** 0.30 (default; reduces ringing around bright stars in 50 mm frames)

**Reference frame:** the single best frame from SubframeSelector — the one with the lowest FWHM combined with a non-extreme star count. Avoid the absolute best if it was taken at an awkward rotation.

### Common mistakes for 50 mm wide-field
- Using **Projective** transform — leaves star registration errors at the corners, which then look like "trails" after integration.
- Setting **Frame adaptation** ON with **CFA** images that have been debayered — already-debayered RGB is fine; do **not** treat as CFA.
- Forgetting to set the same reference frame for both StarAlignment **and** LocalNormalization.

### Sources
- [PixInsight Tutorial — Arbitrary Distortion Correction with StarAlignment](https://www.pixinsight.com/tutorials/sa-distortion/index.html)
- [Chaotic Nebula — Star Alignment & Troubleshooting](https://chaoticnebula.com/pixinsight-star-alignment/)
- [PixInsight Forum — Aligning ultra wide field images](https://pixinsight.com/forum/index.php?threads/aligning-ultra-wide-field-images.8540/)

---

## 6. Integration — ImageIntegration (with LocalNormalization)

### 6a. LocalNormalization (do this first)

#### What it does
For each registered subframe, computes a per-region multiplicative + additive correction so that the background gradient and overall signal match a reference image. This dramatically improves outlier rejection in ImageIntegration because the rejection algorithm is no longer "confused" by varying gradients between frames.

#### Workflow
1. Run ImageIntegration **once on your best ~6 registered frames** (lowest noise) to produce a high-SNR reference.
2. Apply DBE lightly to that reference (you only need it gradient-free, not pretty).
3. Run **LocalNormalization** with that pre-integrated, DBE'd image as the reference.
4. Set **Scale:** start with **1024 px** (default); for visibly varying skyglow drop to **256 px**.
5. Output `.xnml` files are written next to each input.

#### Common mistakes
- Skipping the "pre-integrate the best frames" step and using a single frame as the LocalNormalization reference — the reference must be **higher SNR** than the individual frames or LN preserves noise patterns.
- Forgetting to give the `.xnml` files to ImageIntegration in its **Local Normalization** tab.

### 6b. ImageIntegration

#### Rejection algorithm choice for 24 frames

| Frames | Best rejection |
|--------|----------------|
| 3–6    | Percentile Clipping |
| 7–10   | Averaged Sigma Clipping |
| **11–25** | **Winsorized Sigma Clipping** ← M31 case (24 frames) |
| 25+    | Linear Fit Clipping |
| Many, very clean | Generalized ESD (GESD) |

For **24 frames** the consensus answer is **Winsorized Sigma Clipping**. It's strictly better than plain Sigma Clipping (replaces outliers with the winsorized value before computing stats, so the dispersion estimate is not skewed by the very outliers you are trying to find). Linear Fit Clipping needs ≥25 frames to be statistically sound; ESD is best on already-clean frames.

#### Recommended ImageIntegration settings for 24 DSLR frames

- **Combination:** Average
- **Normalization:** **Local Normalization** (use the `.xnml` files you just created); fallback = Additive with scaling
- **Weights:** **PSF Signal Weight** (or the SubframeSelector-computed weight FITS keyword if you wrote one)
- **Weight scale:** IKSS
- **Pixel rejection:**
  - **Rejection algorithm:** Winsorized Sigma Clipping
  - **Normalization:** **Scale + zero offset** (or **Local Normalization** if you used LN)
  - **Sigma Low:** 4.0
  - **Sigma High:** 3.0  (asymmetric — be more permissive at the low end because faint signal pixels look like low outliers)
  - **Winsorization cutoff:** 5.0
- **Large-Scale Pixel Rejection:**
  - **Reject Low Large-Scale:** off (galaxies have legitimate low large-scale structure)
  - **Reject High Large-Scale:** **2 layers, growth 2** (helps reject satellite trails / airplanes)
- **Clip low / high range:** ON (default ranges)
- **Generate Drizzle data:** ON if you might do drizzle later
- **Evaluate noise:** ON

#### Common mistakes
- Using **Sigma Clipping** instead of Winsorized — at 24 frames the difference in trail rejection is visible.
- Forgetting to switch ImageIntegration's normalization to **Local Normalization** after generating `.xnml` files — the files are ignored otherwise.
- Asymmetric sigmas reversed (Sigma Low < Sigma High) — destroys faint signal in low-SNR regions.

### Sources
- [Chaotic Nebula — Image Integration: The Power of Stacking](https://chaoticnebula.com/pixinsight-image-integration/)
- [Chaotic Nebula — PixInsight Local Normalization](https://chaoticnebula.com/pixinsight-local-normalization/)
- [Stirling Astrophoto — LocalNormalization and Reference Image](https://stirlingastrophoto.com/posts/localnormalization-and-reference-image/)
- [DSLR Astrophotography — A Detailed Look into Pixel Rejection](https://dslr-astrophotography.com/detailed-pixel-rejection-methods/)
- [PixInsight Forum — Winsorised sigma clipping rejection values](https://pixinsight.com/forum/index.php?threads/winsorised-sigma-clipping-rejection-values.8069/)

---

## 7. Linear-Stage Post-Integration

The integrated master is still linear (very dark — background near 0.001–0.01). All processes below assume linear input.

### 7.1 DynamicCrop

#### What it does
Removes the ragged stacking edges (rotation/dither leaves a partial overlap zone). These edges cause DBE samples to spike and confuse all later processes.

#### Settings
- Eyeball-crop until **no zero-value bands** remain at any edge.
- For M31 at 50 mm, leave significant margin around the galaxy: the IFN (Integrated Flux Nebula) and faint outer halo of M31 extend much further than the visible disk.
- Apply once. Don't keep cropping later — re-running DynamicCrop on a stretched image is fine but the linear crop here saves the most processing time.

### 7.2 DynamicBackgroundExtraction (DBE) vs. AutomaticBackgroundExtractor (ABE)

This is the single most important step when **no flats** were taken. DBE must "rescue" the field-flatness that flats would have provided.

#### When to use ABE vs DBE

| Tool | Strength | Weakness | Use it when… |
|------|----------|----------|--------------|
| ABE  | Fully automatic, fits a global polynomial of order 0–6 | Cannot distinguish faint nebulosity from gradient | First-pass cleanup; very smooth gradients; when you don't trust your sample placement |
| DBE  | Manual sample placement, can model complex (multi-direction, non-polynomial) gradients via 2-D splines | Tedious; misplaced samples eat real signal | Final / definitive gradient & vignetting removal — **the answer for M31 without flats** |

**For this workflow with no flats:** **use DBE, two passes** (do not skip).

#### DBE workflow without flats — two passes

**Pass 1 — Vignetting correction (Division)**
1. Open DBE, generate the default sample grid.
2. **Delete every interior sample.** Keep only samples around the **outside perimeter** of the frame (top/bottom/left/right edges). This forces the model to fit the brightness ramp from the optical vignette.
3. **Default sample radius:** 10–15 px (slightly larger than usual)
4. **Tolerance:** start at 1.0; increase if too many samples are auto-rejected
5. **Smoothing factor:** 0.500
6. **Correction:** **Division** (vignetting is multiplicative)
7. Execute. Inspect the model — it should look like a smooth bowl.

**Pass 2 — Residual gradient correction (Subtraction)**
1. On the vignette-corrected output, reopen DBE. Generate samples and now keep an even spread across the entire frame.
2. **Manually delete** samples that landed on M31's disk, bright stars, IFN clumps, or any obviously nebulous region.
3. **Default sample radius:** 25–50 px (larger samples = more robust against missed stars)
4. **Tolerance:** ~0.5
5. **Smoothing factor:** 0.5
6. **Correction:** **Subtraction** (light pollution is additive)
7. Execute. The output should be visibly flat — pan around the image; the background level should not change measurably.

If after pass 2 there is still a gradient, run **a third subtraction pass** with even tighter sample placement.

#### Common mistakes
- Placing samples on **the M31 disk or its halo** — DBE then treats real galaxy light as "background" and subtracts it. M31 is huge in the field: when in doubt, leave more samples off the frame.
- Using **Division for additive light-pollution gradients** — produces a tilted background.
- Using **Subtraction for vignetting** — leaves a brightness ramp.
- Skipping DBE entirely because you "trust the stack" — without flats, vignetting will absolutely destroy color calibration.

### Sources
- [Light Vortex Astronomy — Reducing Light Pollution and Gradients](https://www.lightvortexastronomy.com/tutorial-reducing-light-pollution-effects-removing-gradients-and-artificial-flattening.html)
- [Chaotic Nebula — Dynamic Background Extraction](https://chaoticnebula.com/pixinsight-dynamic-background-extraction/)
- [Jon Rista — DynamicBackgroundExtraction](https://jonrista.com/the-astrophotographers-guide/pixinsights/dynamicbackgroundextraction/)

### 7.3 Color Calibration — SPCC (preferred), PCC, or manual BN+CC

#### Modern (2023–2026) recommendation: **SPCC**
SPCC (Spectrophotometric Color Calibration) has replaced PCC as the recommended tool. PixInsight team's own guidance is that **"SPCC is more accurate (by orders of magnitude) and more robust than PCC in all practical applications."** SPCC uses Gaia DR3's actual stellar **spectra** combined with explicit filter transmission curves, while PCC only matches integrated photometry against the (looser) APASS catalog.

#### SPCC prerequisites
1. Image must be plate-solved (use the **ImageSolver** script first — it embeds astrometric metadata).
2. Image must still be **linear** and **background-neutralized** (DBE done).
3. Internet connection (Gaia DR3 catalog access).

#### SPCC settings for a Canon DSLR shooting M31

- **White reference:** **Average Spiral Galaxy** (or "Average Elliptical Galaxy") — M31 is a spiral, this is the textbook choice. Avoid G2V for galaxy work; G2V biases the image toward a sun-like white point, which makes broad galaxy fields look subtly yellow.
- **Filters:**
  - **Red:** *Sony Color Sensor — Red* (or the closest match from the curve database — Canon CR2 stock filters are similar to Sony's; use the Curve Explorer to verify)
  - **Green:** *Sony Color Sensor — Green*
  - **Blue:** *Sony Color Sensor — Blue*
  - If you have IR-cut modification details for your DSLR you can build/load a custom curve.
- **QE curve:** if available for your specific sensor, load it; otherwise the included sensor curves are good enough.
- **Background Neutralization:** **ON** with a preview that contains only sky (no M31 halo, no IFN).
- **Generate graphs:** ON the first time — visually verify the fit lines through the cluster of points are flat.
- **Limit magnitude:** Auto

#### Fallback when SPCC unavailable: PCC
Same idea, slightly less accurate. Workflow is essentially identical: plate-solve → run PCC with **Average Spiral Galaxy** white reference. Avoid PCC's narrowband mode for broadband M31 work.

#### Fallback when offline / catalog unreachable: Manual BackgroundNeutralization + ColorCalibration
1. **BackgroundNeutralization:** drag a small (~100x100) sky-only preview into the Reference field. Set Upper Limit using Readout = mean + 0.1.
2. **ColorCalibration:** two previews — one over background, one over a "white reference." For M31 use a preview of the whole **outer disk** (excluding the bright core and dust lanes) as the white reference; the integrated light of a spiral disk is close to spectrally neutral.

#### Common mistakes
- Running SPCC before DBE — gradients shift the per-channel statistics and the white balance comes out wrong.
- Running SPCC on a **stretched** image — must be linear.
- Picking the wrong filter set (e.g., "Generic OSC" when your camera curves are known) — color drifts subtly off.

### Sources
- [PixInsight Reference Documentation — Spectrophotometry-based Color Calibration (SPCC)](https://pixinsight.com/doc/docs/SPCC/SPCC.html)
- [Chaotic Nebula — SPCC for Accurate Colors](https://chaoticnebula.com/color-balancing-with-pixinsight-spectrophotometric-color-calibration/)
- [Telescope Live — PixInsight SPCC](https://telescope.live/blog/pixinsight-spectrophotometric-color-calibration)
- [Night Sky Pics — SPCC in PixInsight](https://nightskypics.com/pixinsight-spectrophotometric-color-calibration/)
- [Light Vortex Astronomy — Colour-Calibrating Images](https://www.lightvortexastronomy.com/tutorial-colour-calibrating-images.html)

### 7.4 Deconvolution (optional, stock — without BlurXTerminator)

#### Honest assessment
Stock Richardson–Lucy deconvolution is finicky, slow, and easy to ruin. For a 50 mm wide-field M31 where stars are 1–2 px and atmospheric blur is dominated by the optic, **you can legitimately skip deconvolution entirely** and the image will be fine. If you do it, do it carefully on a small subset of the image.

#### Stock workflow (if attempting)
1. **DynamicPSF:** drag the tool over the image, click ~30–50 well-isolated medium-brightness stars (avoid saturated stars and bright clumps), let it auto-fit each. Sort the table by **MAD** ascending, delete worst 10 %, then **Export PSF** to a new image. This is your synthetic PSF.
2. **Star mask:** generate via StarMask process — only the brightest stars need to be in the mask. This serves as the **deringing support** to suppress dark rings around bright stars.
3. **Apply Deconvolution:**
   - Algorithm: **Regularized Richardson–Lucy**
   - Iterations: **30–50** (start low)
   - **Deringing — Global Dark:** 0.005–0.020 (most important parameter; raise until the dark rings around stars disappear)
   - **Deringing — Local Deringing:** ON, **Local support** = the star mask above
   - **Wavelet Regularization:** ON; layers 1–3 enabled, noise reduction 1.0/0.7/0.5
   - Apply via a luminance mask (only deconvolve the bright structures of M31, not the noise floor)
4. Inspect — if you see ringing, lower iterations or raise Global Dark.

#### Common mistakes
- Skipping the star mask / deringing support — produces black halos around stars that look like cartoon outlines.
- Hundreds of iterations — diminishing returns by 50, destruction by 100.
- Running on a non-linear image — RL deconvolution is mathematically defined for the linear (Poisson) regime.

### Sources
- [Chaotic Nebula — PixInsight Deconvolution](https://chaoticnebula.com/pixinsight-deconvolution/)
- [PixInsight Tutorial — Deconvolution Example with M81 and M82](https://www.pixinsight.com/examples/M81M82/index.html)

### 7.5 Linear Noise Reduction

Two stock processes, often used together: **MultiscaleLinearTransform (MLT)** for luminance noise on broad scales, and **TGVDenoise** for residual fine grain.

#### NoiseEvaluation (do this first)
Run **NoiseEvaluation** (Script → Image Analysis) on the linear image to get σ for each channel. This tells you how aggressive to be: typical post-integration σ for K-channel ≈ 1e-3 to 5e-3.

#### Luminance mask for linear NR
Create the protective inverted-luminance mask so NR only touches the dim regions:
1. Duplicate image
2. **STF** Auto-stretch the duplicate, then **HistogramTransformation → Apply** the STF (permanent stretch — this is the "DeLinear" script approach)
3. Optional: HistogramTransformation midtone slider so the bright peak sits around 75 % (concentrates protection on signal)
4. Apply as **mask, inverted** → most of the bright galaxy and stars are now red/protected; the dim sky is exposed for NR.

#### MultiscaleLinearTransform settings (linear stage, M31)
With the mask above applied, in MLT's wavelet layers panel, only **layers 1–4** get noise reduction; layers 5+ and the residual untouched.

| Layer | Pixel scale | Threshold | Amount | Iterations |
|-------|------------|-----------|--------|------------|
| 1     | 1 px       | 3.0       | 0.80   | 3 |
| 2     | 2 px       | 2.0       | 0.70   | 2 |
| 3     | 4 px       | 1.0       | 0.50   | 1 |
| 4     | 8 px       | 0.5       | 0.30   | 1 |
| 5+    | —          | (untouched) | (untouched) | — |

Threshold is in **sigma units** (the NoiseEvaluation σ).
**Strategy: decrease strength as layers grow** — finer scales (layer 1) carry most noise; coarser layers carry actual structure.

#### TGVDenoise (optional, after MLT)
For fine chrominance grain that MLT didn't reach:
- **Color space:** **CIE L*a*b\*** — apply **only to chrominance (a* and b*)** by setting luminance iterations to 0
- **Strength:** start at 2.5 (default 5.0 is too aggressive for linear data)
- **Edge Protection:** set to **3 × the K-channel σ from NoiseEvaluation** (e.g. σ = 0.002 → Edge Protection = 0.006)
- **Smoothness:** 2.0
- **Iterations:** 80–100
- **Local Support:** the same inverted-luminance mask as above (built-in to TGVDenoise as a parameter)

#### Common mistakes
- Not applying a mask → noise reduction smears the bright galaxy core into mush.
- Using TGVDenoise defaults → over-smooths.
- Doing NR before DBE/SPCC → gradients and color casts get baked into the noise estimate.
- Doing strong NR on linear data → all the obvious noise reappears after stretching, and you've lost detail.

### Sources
- [Light Vortex Astronomy — Noise Reduction](https://www.lightvortexastronomy.com/tutorial-noise-reduction.html)
- [Chaotic Nebula — MultiscaleLinearTransform NR](https://chaoticnebula.com/pixinsight-noise-reduction-multiscale-linear-transform/)
- [Chaotic Nebula — TGV Denoise](https://chaoticnebula.com/pixinsight-noise-reduction-tgv-denoise/)
- [PixInsight Forum — TGVDenoise 1.0 release notes](https://pixinsight.com/forum/index.php?threads/tgvdenoise-1-0-released.5414/)
- [Jon Rista — Effective Noise Reduction Part 2](https://jonrista.com/the-astrophotographers-guide/pixinsights/effective-noise-reduction-part-2/)

---

## 8. Non-Linear Stretch — the M31 problem

M31 has **arguably the worst dynamic range of any common DSO target**: the core is ~12 magnitudes brighter than the outer arms. Naive HistogramTransformation will either blow the core or never reveal the outer arms.

### Stretching options ranked for M31

| Tool | Pro | Con | Use for M31? |
|------|-----|-----|--------------|
| **HistogramTransformation** | Universal, simple | Blows core if you push outer arms; bloats stars | Only as a *final touch-up* after a smarter stretch |
| **MaskedStretch** | Protects bright cores iteratively via internal mask | Distorts star shapes (compresses round stars into squarish blobs); slow | OK but no longer preferred |
| **ArcsinhStretch** | Preserves star color very well (logarithmic in luminance, linear in color) | Doesn't protect the core; can produce flat-looking galaxies | Good for color saturation; combine with another tool |
| **GeneralizedHyperbolicStretch (GHS)** | Five-parameter family covers MaskedStretch, Arcsinh, log, gamma, histogram as special cases; real-time preview; **graphical stretch curve design** | Learning curve — five parameters | **Recommended primary tool for M31 in 2024–2026** |

### Recommended M31 stretch — GHS-led, two-step

**Step 1 — GHS for the bulk stretch:**
- Open **GeneralizedHyperbolicStretch** (built into PixInsight 1.8.9+; was previously a script)
- **Stretch type:** Generalized Hyperbolic
- **Symmetry point (SP):** set just slightly above the background peak (typical 0.10–0.20)
- **Stretch intensity (D):** 0.5–1.5 (the main "amount" slider; raise until the outer arms become visible)
- **Local intensity (b):** 3–6 (controls how strongly the stretch concentrates around SP — a higher b puts more stretch into the mid-tones)
- **Highlight protection (HP):** **0.85–0.95** ← the magic for M31. This effectively cuts the stretch at HP, so the core is **not** pushed further. Use the histogram preview to set HP just below where the core peak sits.
- **Shadow protection (LP):** 0.0

This single GHS application can take a linear M31 to a visually balanced "core not blown, arms visible" state in one shot.

**Step 2 — HistogramTransformation for fine micro-stretch:**
After GHS, run a gentle HistogramTransformation: pull the black point to just left of the background peak (don't clip!), nudge midtones slightly right (0.45–0.50).

### Alternative — Combined MaskedStretch + ArcsinhStretch (older but still valid)
- **MaskedStretch:** target background level 0.10–0.15, iterations 100, mask is internally generated
- Follow with **ArcsinhStretch** at low stretch factor (5–10) to lift color saturation without further compression of the core
- Finish with HistogramTransformation cleanup

### Common mistakes
- Pulling the **black point** into the histogram peak — clips dim galaxy halo / IFN.
- Stretching without any core protection on M31 — the bright nucleus saturates white and you cannot recover detail.
- Using ArcsinhStretch alone — looks flat and lifeless on galaxies; better paired.

### Sources
- [PixInsight Reference Documentation — GeneralizedHyperbolicStretch](https://www.ghsastro.co.uk/doc/tools/GeneralizedHyperbolicStretch/GeneralizedHyperbolicStretch.html)
- [GitHub — mikec1485/GHS](https://github.com/mikec1485/GHS)
- [Light Vortex Astronomy — Stretching Linear Images to Non-linear](https://www.lightvortexastronomy.com/tutorial-stretching-linear-images-to-non-linear.html)
- [PixInsight Forum — MaskedStretch and big stars](https://pixinsight.com/forum/index.php?threads/masked-stretch-and-big-star-appearance.13430/)
- [Stargazers Lounge — GHS Process Module Release Thread](https://stargazerslounge.com/topic/402171-generalisedhyperbolicstretch-ghs-process-module-for-pixinsight/)

---

## 9. Non-Linear Post-Processing

### 9.1 LocalHistogramEqualization (LHE) — local contrast

#### What it does
Increases contrast within local neighborhoods, revealing dust lanes and tonal structure in M31's spiral arms.

#### Settings for M31
- **Kernel Radius:** **64** for fine dust-lane detail; **150** for broader arm contrast (run two passes at different radii is a known trick)
- **Contrast Limit:** **1.5–2.0** (don't exceed 3.0 — produces black hole artifacts)
- **Amount:** **0.30–0.50** (LHE is very easy to overdo; keep it light)
- **Histogram bins:** 256
- **Kernel size:** 64-bit

#### Range mask (required)
LHE without a mask will turn stars into donuts. Create a range mask:
- **Lower Limit:** raise until background is fully black in the mask
- **Upper Limit:** 1.000
- **Fuzziness:** 0.10
- **Smoothness:** 0.60
- Apply as mask, **not inverted** — the bright galaxy is exposed for LHE, the background and stars are protected.

#### Common mistakes
- Amount = 1.0 → garish, posterized look.
- No mask → stars erupt into dark-ringed donuts.

### Sources
- [Chaotic Nebula — Local Histogram Equalization](https://chaoticnebula.com/unlocking-faint-details-a-guide-to-local-histogram-equalization/)
- [Light Vortex Astronomy — Enhancing Feature Contrast](https://www.lightvortexastronomy.com/tutorial-enhancing-feature-contrast.html)
- [PixInsight Tutorial — Dynamic Range and Local Contrast (NGC 7023)](https://pixinsight.com/tutorials/NGC7023-HDR/)

### 9.2 CurvesTransformation — color & saturation

For M31:
- **S-curve on K (RGB/K):** gentle — control point at (0.25, 0.22) and (0.75, 0.80). Adds contrast.
- **Saturation curve (S):** a soft hump that peaks at midtones (rotate the (0.5, 0.5) point up to ~0.65). Adds color without saturating stars.
- **Hue curve (H):** optional — small tweak to drift the dust-lane reds toward warmer red.
- Apply through the same **range mask** used for LHE to avoid amplifying background noise color.

### 9.3 Star reduction without StarXTerminator — MorphologicalTransformation

#### Workflow
1. Generate a **star mask** with the **StarMask** process. Tune `Noise threshold` so only the stars (not nebulous M31 features) are captured. Common settings: noise threshold 0.10, scale 5, large-scale 2, small-scale 1.
2. Apply the star mask to your image.
3. Open **MorphologicalTransformation:**
   - **Operator:** **Erosion** (simple) **or Morphological Selection** (finer control)
   - **Interlacing distance:** 1
   - **Structuring element:** **3x3 Diamond** (the most common; a "circle" pattern at 3x3)
   - **Amount:** 0.5–0.7 (full = 1.0)
   - **Iterations:** 1 (start) — increase if effect too weak
   - If using **Morphological Selection**, set **Selection** to ~0.20–0.30 (lower = more erosion bias)
4. Apply through the star mask.

#### Tips
- **Always start with one iteration and Amount 0.5.** Star reduction artifacts (truncated star cores) are very hard to undo.
- For M31, large stars in the field can be reduced more aggressively because they distract from the galaxy.
- A second pass through MorphologicalTransformation at lower Amount blends in better than one strong pass.

### Sources
- [Light Vortex Astronomy — Reducing Star Sizes](https://www.lightvortexastronomy.com/tutorial-reducing-star-sizes.html)
- [The Coldest Nights — PixInsight Multiscale Star Reduction](https://thecoldestnights.com/2020/08/pixinsight-multiscale-star-reduction/)
- [Chaotic Nebula — Morphological Transformation for Star Reduction](https://chaoticnebula.com/pixinsight-star-reduction/)
- [Deep Sky Colors — PixInsight Morphology](http://www.deepskycolors.com/PixInsight/Morphology.html)

### 9.4 Final Noise Reduction — ACDNR or TGVDenoise

After all stretching and contrast enhancement, residual noise (especially color noise in the background) often needs a final, gentler pass.

#### Option A: ACDNR
- **Lightness (L\*):** disable or very low (the data is already smooth enough on luminance)
- **Chrominance (a* / b\*):** Standard deviation 2.0, Iterations 3, Amount 0.5
- Apply through the inverted luminance mask (same one used in linear NR)

#### Option B: TGVDenoise (non-linear stage)
- **Color space:** CIE L*a*b*
- **Apply only to chrominance** (set luminance iterations = 0)
- **Strength:** 1.5
- **Edge Protection:** 0.002–0.005 (a touch higher than linear stage)
- **Smoothness:** 2.0
- **Iterations:** 100

### Sources
- See TGVDenoise sources above
- [Light Vortex Astronomy — Noise Reduction](https://www.lightvortexastronomy.com/tutorial-noise-reduction.html)

---

## 10. WeightedBatchPreProcessing (WBPP) — when to use vs. manual

### When to use WBPP
- **For a 24-frame DSLR M31 set: WBPP is the right answer.** As of WBPP 2.x (current in 2024–2026), it correctly handles:
  - Master dark only (no flats, no bias) — just drop in the master dark and lights, enable CFA, set "Cosmetic Correction" to use the master dark.
  - Canon CR2 raws — uses libRAW under the hood; detects RGGB.
  - SubframeSelector quality weighting — pick **Maximum Quality** preset, optionally edit the weight expression.
  - StarAlignment with distortion correction — set "registration model" in the script's Lights tab.
  - LocalNormalization — there's a checkbox in the Lights tab.
  - ImageIntegration — there's a per-group integration step.

### When to drop to manual
- You need a **custom DBE-corrected reference frame** for LocalNormalization (WBPP can't do that — WBPP's LN reference is built from a sub-stack only).
- You have **multiple sessions with very different gradients** — manual gives finer control.
- You're debugging a specific issue (e.g., suspect a bad subframe is poisoning LN or weighting).
- You're learning PixInsight and want to understand each step.

### Recommended WBPP setup for M31 / 24 Canon CR2 frames + master dark only

**Lights tab:**
- All CR2 files added, group by exposure/ISO automatically
- **CFA images:** ON (Canon DSLR)
- **Bayer/mosaic pattern:** Auto (or RGGB if Auto fails)
- **Debayer method:** VNG
- **CosmeticCorrection:** ON, mode = "Use master dark", sigma = 3 / 3

**Calibration tab:**
- Add master dark → set as **Master Dark**, "Calibrate" off
- No master flat, no master bias

**Pre-processing tab:**
- **Subframe weighting:** ON, preset = Maximum Quality (or paste the custom weight expression from §4 above)
- **Image registration:** ON; **distortion correction** ON
- **LocalNormalization:** ON; reference frame = "Auto" (or pick the best frame manually)
- **Integration:** ON; rejection = Winsorized Sigma Clipping; sigmas 4 / 3

**Output tab:**
- Output directory: an empty folder
- Generate Drizzle data: ON if you might drizzle later

Run. The result is a calibrated, debayered, registered, normalized, integrated master ready for §7 (DynamicCrop forward).

### Common WBPP mistakes
- Loading a master dark that's at a different temperature / exposure than the lights — WBPP will complain or silently produce a poor stack.
- Forgetting to set CFA = ON — get a grayscale stack instead of color.
- Letting the script auto-detect Bayer pattern from raws that have been recompressed by another tool — set RGGB explicitly to be safe.

### Sources
- [Urban Astrophotography — PixInsight Pre-Processing Guide](https://urbanastrophotography.com/pixinsight-guide-pre-processing/)
- [AstroARG — Working with WBPP Part 1](https://theargents.wordpress.com/2022/03/06/pixinsight-working-with-wbpp-part-1/)
- [Telescope Live — WBPP Masterclass](https://telescope.live/tutorials/wbpp-masterclass-professionally-and-efficiently-pre-processing-data-pixinsights)
- [Bernd Landmann — Preprocessing of Raw Image Data with PixInsight (Dec 2023)](https://sh-cosmiccanvas.s3.us-west-2.amazonaws.com/Resources/20231210_PreprocessingOfRawImageDataWithPixInsight.pdf)
- [PixInsight Forum — WBPP Cosmetic Correction workflow help](https://pixinsight.com/forum/index.php?threads/wbpp-cosmetic-correction-workflow-help-please.16620/)

---

## Appendix A — Quick-Reference Parameter Sheet for 24-frame Canon DSLR M31

| Stage | Process | Key parameter | Value |
|-------|---------|---------------|-------|
| 1 | ImageCalibration | Master Dark | (your file); Calibrate OFF |
| 1 | ImageCalibration | Evaluate noise | ON |
| 2 | CosmeticCorrection | Mode | Use master dark, σ 3/3 |
| 3 | Debayer | Pattern / Method | RGGB / VNG |
| 4 | SubframeSelector | Weight | PSFSignalWeight (or custom; pedestal 50) |
| 4 | SubframeSelector | Reject | FWHM > 1.30 × median; ecc > 0.575 |
| 5 | StarAlignment | Model | 2-D Surface Splines, Distortion ON |
| 5 | StarAlignment | Interpolation | Bicubic B-Spline |
| 6 | LocalNormalization | Reference | Pre-integrated, DBE'd best ~6 frames |
| 6 | LocalNormalization | Scale | 1024 (drop to 256 if light pollution varies) |
| 7 | ImageIntegration | Combination | Average |
| 7 | ImageIntegration | Normalization | Local Normalization |
| 7 | ImageIntegration | Rejection | Winsorized σ-clip, σ 4.0 / 3.0, cutoff 5 |
| 7 | ImageIntegration | Large-scale high | 2 layers, growth 2 |
| 8 | DynamicCrop | — | Crop just inside ragged edges |
| 9 | DBE Pass 1 | Samples | Edges only; Division |
| 9 | DBE Pass 2 | Samples | Spread; Subtraction; r 25–50 |
| 10 | SPCC | White ref | Average Spiral Galaxy |
| 10 | SPCC | Filters | Sony Color Sensor R/G/B (closest match) |
| 11 | Deconvolution (opt) | Algo | Reg. Richardson–Lucy, 30–50 iter |
| 11 | Deconvolution (opt) | Deringing | Global 0.005–0.020 + star-mask local |
| 12 | MLT (linear NR) | Layers 1–4 | Decreasing strength (see §7.5 table) |
| 12 | TGVDenoise (linear) | Color space | L*a*b*, chroma only, Edge 3σ |
| 13 | GHS Stretch | HP | 0.85–0.95 (the M31 core-protect) |
| 13 | GHS Stretch | D / b | 0.5–1.5 / 3–6 |
| 14 | LHE | Kernel / Contrast / Amount | 64–150 / 1.5–2.0 / 0.3–0.5 |
| 14 | LHE | Mask | Range mask, not inverted |
| 15 | CurvesTransformation | K (S-curve), S (sat hump) | Through range mask |
| 16 | MorphologicalTransformation | Operator / SE / Amount | Erosion / 3x3 diamond / 0.5 |
| 17 | ACDNR or TGV (final) | Apply | Chrominance only, gentle |

---

## Appendix B — Things This Pipeline Deliberately Does Not Do

- **No third-party plugins** (BlurXTerminator, NoiseXTerminator, StarXTerminator, GraXpert). Equivalents in stock:
  - BlurX → Deconvolution (worse, but functional)
  - NoiseX → MLT + TGVDenoise (worse, but functional)
  - StarX → MorphologicalTransformation through a star mask (for *reduction* only; true star removal is much harder in stock — there is no built-in clean equivalent)
  - GraXpert → DBE (more manual but flexible)
- **No drizzle** (assumes a single session of 24 frames; drizzle benefits from many heavily-dithered frames). Drizzle data can be generated by ImageIntegration if you want to try.
- **No HDR composition.** For M31's dynamic range, GHS alone is enough; full HDRComposition needs multiple exposure lengths.
- **No starless / starful re-combination.** That technique typically depends on StarXTerminator.

---

## Appendix C — M31-Specific Tips

- **M31's halo is HUGE.** At 50 mm, you may see Mu (M110) and Andromeda IV. Crop conservatively; reframe gently.
- **Dust lanes** are the highlight of M31 processing. They emerge during stretching but are *finalized* by LHE through a tight range mask.
- **Nuclear region:** the core is essentially a star — treat it like one. Don't let any stretch push it above 0.95 or you lose all the nuclear structure.
- **Color:** M31 should show a **distinct yellow-orange bulge** and a **blue-tinted outer disk** with **red HII region knots**. If your colors are washed-out or uniformly white-blue, your color calibration step needs revisiting (SPCC with Average Spiral Galaxy reference fixes this 95 % of the time).
- **IFN (Integrated Flux Nebula):** if you exposed deep enough at 50 mm, you may see faint IFN around M31. DBE will try to flatten it — keep your DBE samples well off the IFN regions.

---

## Sources Summary

### Primary references
- [PixInsight Reference Documentation — SPCC](https://pixinsight.com/doc/docs/SPCC/SPCC.html)
- [PixInsight Reference Documentation — SubframeSelector](https://pixinsight.com/doc/scripts/SubframeSelector/SubframeSelector.html)
- [PixInsight Reference Documentation — GeneralizedHyperbolicStretch](https://www.ghsastro.co.uk/doc/tools/GeneralizedHyperbolicStretch/GeneralizedHyperbolicStretch.html)
- [PixInsight Reference Documentation — Arbitrary Distortion Correction (StarAlignment)](https://www.pixinsight.com/tutorials/sa-distortion/index.html)
- [PixInsight Tutorial — Deconvolution and Noise Reduction (M81/M82)](https://www.pixinsight.com/examples/M81M82/index.html)
- [PixInsight Tutorial — Dynamic Range and Local Contrast (NGC 7023)](https://pixinsight.com/tutorials/NGC7023-HDR/)
- [PixInsight Tutorial — Noise Reduction with MultiscaleMedianTransform](https://www.pixinsight.com/tutorials/mmt-noise-reduction/)
- [PixInsight Tutorial — Multiscale Gradient Correction](https://pixinsight.com/tutorials/multiscale-gradient-correction/)
- [PixInsight Forum — M31 from a DSLR Post-Processing Example](https://pixinsight.com/forum/index.php?threads/new-post-processing-example-m31-andromeda-galaxy-from-a-dslr.9163/)

### Tutorial sites
- [Light Vortex Astronomy — full tutorial library](https://www.lightvortexastronomy.com/)
- [Chaotic Nebula — PixInsight guides](https://chaoticnebula.com/)
- [Stirling Astrophoto](https://stirlingastrophoto.com/)
- [Keen Astro](https://www.keenastro.com/)
- [Jon Rista — Astrophotographer's Guide](https://jonrista.com/the-astrophotographers-guide/pixinsights/)
- [Bernd Landmann — Preprocessing of Raw Image Data with PixInsight (Dec 2023, PDF)](https://sh-cosmiccanvas.s3.us-west-2.amazonaws.com/Resources/20231210_PreprocessingOfRawImageDataWithPixInsight.pdf)
- [Urban Astrophotography](https://urbanastrophotography.com/pixinsight-guide-pre-processing/)
- [Telescope Live tutorial blog](https://telescope.live/blog/)
- [Deep Sky Colors (Rogelio Bernal Andreo)](http://www.deepskycolors.com/PixInsight/)
- [PixInsight Resources](https://pixinsight.com.ar/en/)

### Community / forum threads
- [CloudyNights — Pixel rejection method discussion](https://www.cloudynights.com/topic/776947-normalize-scale-gradient-alternative/)
- [CloudyNights — LocalNormalization vs NSG vs AN](https://www.cloudynights.com/forums/topic/814415-pixinsight-when-to-use-ln-vs-nsg-vs-an/)
- [CloudyNights — M31 exposure settings](https://www.cloudynights.com/topic/886912-m31-and-exposures-settings/)
- [PixInsight Forum — Aligning ultra wide field](https://pixinsight.com/forum/index.php?threads/aligning-ultra-wide-field-images.8540/)
- [PixInsight Forum — Winsorised σ rejection values](https://pixinsight.com/forum/index.php?threads/winsorised-sigma-clipping-rejection-values.8069/)
- [Stargazers Lounge — GHS module release](https://stargazerslounge.com/topic/402171-generalisedhyperbolicstretch-ghs-process-module-for-pixinsight/)
