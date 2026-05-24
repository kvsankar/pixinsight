# M31 Andromeda — Tuned Processing Pipeline

**Dataset:** 24× 240s @ ISO 1600, Canon EOS 60D + 50mm prime (likely EF 50mm f/1.8 wide open), NEQ6 tracked, rural dark site, 2013-12-30.
**Total integration:** 96 minutes.
**Calibration available:** 9× matched-exposure raw darks (240s, ISO 1600, +25 to +30°C, taken 2013-12-31 same trip). No flats. No bias.
**Software target:** PixInsight 1.8.9+, stock processes only (no BlurXT / NoiseXT / StarXT assumed).
**Mode:** Headless scripting via `PixInsight.exe -r=script.js`, with interactive GUI inspection at key checkpoints.

---

## Reality check up front

This dataset has three structural constraints that shape every decision below.

**1. M31's core is almost certainly clipped.** 240s × ISO 1600 × f/1.8 from Bortle ~3 dark sky is very aggressive exposure for M31's nucleus. No software recovers clipped pixels. Plan: protect what survived, compress what's bright, don't try to "rebuild" the core.

**2. 50mm = wide field, M31 is ~1% of the frame.** Pixel scale ≈ 17.7 arcsec/px. The main inner dust lanes (~30-60") are only **2-3 pixels wide**. There is no fine galaxy structure to deconvolve or sharpen — anything you "reveal" with high-frequency tools is noise enhancement / hallucination, not detail. Stars dominate the visual impression more than the galaxy does.

**3. 24 subs = √24 ≈ 4.9× per-sub SNR.** Hard ceiling on how far you can stretch before the background goes blotchy. The bright disk will come up clean; the outer plumes / IFN won't — don't chase them.

Two consequences flow from this:
- **No deconvolution.** Skip it. It will only hurt at 50mm undersampled.
- **No "recover the core" wizardry.** Accept that the nucleus saturates and protect the surrounding bulge instead.

---

## What WILL be in the final image

Yellow-orange bulge, blue spiral arms with the famous dust lane wrapping the south-west side, M32 as a tight bright dot ~25' south of nucleus, M110 as a diffuse oval ~35' NW, Mirach (β And, mag 2.07) as a bright bloated star roughly 3.5° away — likely in-frame and bringing a halo problem with it. Foreground Milky Way stars everywhere; their color and shape will define the aesthetic more than M31's structure will.

---

## Pipeline at a glance

```
PHASE 1 — CALIBRATION + INTEGRATION (WBPP)
  9 raw darks ──► Master Dark (Winsorized σ-clip)
                       │
  24 raw lights ──────►├─► Calibrate ─► CosmeticCorrection ─► Debayer (RGGB/VNG)
                       │     (no bias, no flats, no optimization)
                       ▼
                 SubframeSelector (PSFSignalWeight, reject worst ~10%)
                       │
                       ▼
                 StarAlignment (2-D Surface Splines + Distortion ON)
                       │
                       ▼
                 LocalNormalization (reference = pre-integrated best ~6 frames)
                       │
                       ▼
                 ImageIntegration (Winsorized σ-clip, σ 4.0/3.0)
                       │
                       ▼
                  master_light.xisf  ← end of Phase 1

PHASE 2 — LINEAR POST-INTEGRATION
  DynamicCrop ─► DBE pass 1 (Division, vignette) ─► DBE pass 2 (Subtraction, gradient)
       │
       ▼
  Plate-solve (ImageSolver) ─► SPCC (Average Spiral Galaxy ref) ─► SCNR (light, 0.5)
       │
       ▼
  Linear NR: MLT layers 1-4 through inverted lum mask (light hand)
       │
       ▼
  master_linear.xisf  ← end of Phase 2

PHASE 3 — NON-LINEAR
  GHS stretch (HP 0.85-0.95, protect core) ─► HistogramTransformation cleanup
       │
       ▼
  Build masks: range mask (incl. M32+M110), star mask (from HDRMT-flattened source)
       │
       ▼
  HDRMultiscaleTransform (galaxy mask, layers 10, 1 iter)
       │
       ▼
  LocalHistogramEqualization ×2 (galaxy mask, scales 40 + 150)
       │
       ▼
  CurvesTransformation (S-curve K, saturation hump S through galaxy mask)
       │
       ▼
  MorphologicalTransformation star reduction (Morph Selection 0.25, 5x5 circ., through star mask)
       │
       ▼
  Mirach halo: PixelMath circular mask + Curves highlight pull
       │
       ▼
  ACDNR chroma (background mask) ─► Final crop ─► Export TIFF + JPEG
```

---

## Phase 1 — Calibration + Integration

### Inputs

| Role | Files | Path |
|---|---|---|
| Lights | 24× CR2 @ 240s/1600 ISO | configured locally with `PI_LIGHT_DIR` in `.env` |
| Darks (raw, for fresh master) | 9× CR2 @ 240s/1600 ISO | configured locally with `PI_DARK_DIR` in `.env` |

**Decision:** Drop the single 800 ISO light frame in `good/240s-800iso/`. Different ISO, no matching dark, would only contaminate the stack.

**Decision:** Build a **fresh master dark** from the 9 raw darks rather than reusing the 2014 DSS-built master. The DSS master was made with different statistics (`Dark_Method=2, Kappa-Sigma`) and the underlying raw data is right there — better to redo with PixInsight's superior rejection.

### Master dark build

Run `ImageIntegration` directly on the 9 raw dark CR2s:
- **Combination:** Average
- **Normalization:** No normalization
- **Weights:** Don't care
- **Rejection algorithm:** **Winsorized Sigma Clipping** (9 frames is on the low side; would prefer 15-20, but it's what we have)
- **Sigma Low / High:** 4.0 / 3.0
- **Clip range:** ON
- Output: `master_dark_240s_ISO1600.xisf`

### WBPP for lights (one-shot)

WBPP 2.x handles calibration → cosmetic correction → debayer → registration → normalization → integration end-to-end. For this dataset it's the right tool — no exotic complications.

**Lights tab:**
- All 24 CR2s, group auto
- **CFA images:** ON
- **CFA pattern override:** **RGGB** (explicit — don't rely on auto-detect for CR2)
- **Debayer method:** **VNG**

**Calibration tab:**
- **Master Dark:** `master_dark_240s_ISO1600.xisf`
- **Calibrate Master Dark:** OFF (no bias)
- **Optimize Darks:** **OFF** (no bias master → can't optimize correctly anyway; darks are matched, so no benefit)
- **Master Bias:** empty
- **Master Flat:** empty

**Cosmetic correction:**
- ON, **Use Master Dark** mode
- **Hot Sigma:** 3.0
- **Cold Sigma:** 3.0
- Also enable **Auto Detect** at 3.0/3.0 to catch transient hot pixels

**Pre-processing tab:**
- **Subframe weighting:** ON, **PSFSignalWeight** (single-metric, well-matched to ImageIntegration)
- **Subframe rejection:** drop frames with `FWHM > 1.30 × median` OR `Eccentricity > 0.575`. With 24 frames we expect to keep ~20-22; don't be more aggressive than that.
- **Image registration:** ON
  - **Registration model:** 2-D Surface Splines
  - **Distortion correction:** ON (50mm has visible distortion at frame edges)
  - **Pixel interpolation:** Bicubic B-Spline, clamping 0.30
  - **Reference frame:** Auto (best PSFSignalWeight)
- **LocalNormalization:** ON, reference = Auto
- **Integration:** ON
  - **Combination:** Average
  - **Normalization:** Local Normalization
  - **Weights:** PSFSignalWeight (from SFS)
  - **Rejection:** Winsorized Sigma Clipping
  - **Sigma Low / High:** 4.0 / 3.0 (asymmetric — be permissive at low end; faint signal looks like low outliers)
  - **Large-scale reject high:** 2 layers, growth 2 (satellite trail protection)
  - **Generate Drizzle data:** OFF (27 frames, drizzle not worth it at this scale)
- **Plate solving:** **OFF in WBPP** (`platesolve=false`). Reason: WBPP's plate-solver falls back to an interactive ImageSolver dialog when frames lack astrometric metadata (which raw CR2s always do), breaking headless automation. Plate-solving belongs in Phase 2, run once on the integrated master before SPCC.

**Checkpoint:** After WBPP, open `master_light.xisf` in the GUI. STF auto-stretch. Verify:
- Stars are round across the entire frame including corners (if elongated in corners, distortion correction didn't kick in properly).
- No obvious dust mote rings or banding.
- Background isn't catastrophically gradiented (DBE will handle the rest).
- Core of M31 is visibly saturated to white — confirms our clipping suspicion.

---

## Phase 2 — Linear Post-Integration

### 2.1 DynamicCrop

Crop just inside the ragged stacking edges. Leave **generous margin around M31** — the IFN and faint outer halo extend far beyond the visible disk and we don't want DBE samples falling outside those regions to mistake faint signal for background.

### 2.2 DBE Pass 1 — Vignetting (Division)

50mm at f/1.8 means 2-3 stops corner falloff. Without flats, this is what DBE pass 1 addresses.

- **Correction:** **Division** (vignetting is multiplicative)
- **Tolerance:** 1.0
- **Shadows relaxation:** 10
- **Default sample radius:** 250 (big samples = robust against missed stars)
- **Samples per row:** 10-15
- **Smoothing factor:** 0.250
- **Symmetry:** Horizontal + Vertical ON (vignette is radially symmetric)
- **Normalize:** ON

**Sample placement procedure:**
1. Click "Generate" to get the default symmetric grid.
2. **Delete every sample that overlaps M31, M32, M110, or sits within ~2× sample radius of any bright star** (Mirach especially).
3. Keep samples concentrated on the **outer perimeter** of the frame — that's where vignette information lives.
4. Before clicking Execute, set Correction temporarily to "None" → click Execute → inspect the generated model image. It should look like a smooth bright-center / dim-corners bowl. If it looks like M31 or has weird bumps, samples are misplaced.
5. Set Correction back to Division, Execute for real.

Save the output as `master_unvignetted.xisf`.

### 2.3 DBE Pass 2 — Residual gradient (Subtraction)

Light pollution + sky glow gradients are additive, not multiplicative.

- **Correction:** **Subtraction**
- **Tolerance:** 0.5-1.0
- **Shadows relaxation:** 3-5
- **Default sample radius:** 20-25
- **Samples per row:** 12-15 (denser than pass 1)
- **Smoothing factor:** 0.250
- **Symmetry:** OFF (additive gradients aren't radial)
- **Normalize:** ON

**Sample placement:**
1. Generate a denser grid this time, spread evenly across the frame.
2. Same deletion rules — anything near M31, the companions, Mirach, the IFN region, or bright star halos goes.
3. Inspect the model — should look like a low-amplitude tilted ramp (or a slight bowl if pass 1 didn't fully flatten).
4. Execute.

Save as `master_flat_linear.xisf`.

**If a third pass is needed** (still visible gradient), use even sparser samples, radius 25, subtraction, smoothing 0.5.

### 2.4 Plate-solve (prerequisite for SPCC)

Run **Script → Image Analysis → ImageSolver** on the linear image.
- **Image parameters:**
  - Search target: "M31" or "NGC 224" (PI will resolve coordinates)
  - Focal length: 50 mm
  - Pixel size: 4.31 µm (60D)
  - Resolution: auto-computed → ~17.7 arcsec/px
- **Catalogue:** Auto / Gaia DR3
- Execute. On success the image has astrometric metadata embedded.

If the solve fails (most common cause at wide field: too many faint stars confusing the matcher), drop "Limit magnitude" to 12 and try again.

### 2.5 SPCC — Color calibration

- **White reference:** **Average Spiral Galaxy** (textbook choice for M31)
- **Filters:** under "Sony Color Sensor" group — pick Red/Green/Blue. Canon stock UV-IR cut + Bayer filters are close enough to the Sony curves that this is the standard substitute. (PixInsight's curve database doesn't have explicit "Canon 60D" entries; the Sony OSC curves are the closest match.)
- **Background Neutralization:** ON
  - **Reference image:** create a small (~200×200 px) preview on a clean sky region — avoid the IFN around M31, avoid Mirach's halo, avoid corners where DBE residual may remain
  - **Upper limit:** Readout the preview mean and set ~0.5σ above
- **Generate graphs:** ON (visually verify fit is flat)
- **Limit magnitude:** Auto

**Common mistake to avoid:** running SPCC before DBE — gradients shift per-channel statistics and produce wrong white balance.

### 2.6 SCNR — Remove residual green cast

Stock DSLR sensors and most light pollution leave a slight green tint in the sky background. After SPCC there shouldn't be much, but a single light pass cleans it.

- **Color to remove:** Green
- **Amount:** 0.5
- **Protection method:** Average Neutral

### 2.7 Linear Noise Reduction — MLT only, light hand

**Skip TGVDenoise at linear stage.** Default TGV settings are aggressive enough to smear M31's already-soft dust lane structure. We'll do chrominance NR at the non-linear stage instead.

**Build inverted luminance mask:**
1. `Image → Extract → Lightness (CIE L*)` — gives `master_linear_L`
2. Apply `STF` auto-stretch to `master_linear_L`, then `HistogramTransformation → Apply` to bake it in (this is the "DeLinear" trick — gives a non-linear mask from linear data)
3. Optional: HistogramTransformation midtone slider so the bright peak sits ~0.75 (concentrates protection on signal)
4. Apply as **mask, inverted** to `master_flat_linear.xisf`

**MultiscaleLinearTransform settings** (with mask applied):

| Layer | Threshold (σ units) | Amount | Iterations |
|-------|---------------------|--------|------------|
| 1 (1px) | 3.0 | 0.50 | 2 |
| 2 (2px) | 2.0 | 0.40 | 2 |
| 3 (4px) | 1.0 | 0.30 | 1 |
| 4 (8px) | 0.5 | 0.20 | 1 |
| 5+    | (untouched) | — | — |

*Lower strengths than the research-paper defaults — we're at low integration, and any over-smoothing at linear stage compounds when stretched.*

Save as `master_linear_NR.xisf`. **End of Phase 2.**

---

## Phase 3 — Non-linear

### 3.1 Stretch — GHS

GHS (GeneralizedHyperbolicStretch) ships with PixInsight 1.8.9+ as a stock process. It's the right tool for M31's dynamic range.

**Open GHS on `master_linear_NR.xisf`.**

- **Stretch type:** Generalized Hyperbolic
- **Stretch intensity (D):** start at 0.8, raise until the outer disk arms become visible
- **Local intensity (b):** 4-5 (puts the stretch into the mid-tones where the disk lives)
- **Symmetry point (SP):** measure the histogram peak of a sky preview, set SP just above it (typically 0.10-0.18)
- **Highlight protection (HP):** **0.88** as a starting value ← the magic parameter for M31. Identify the bright bulge peak in the histogram and put HP just below it. This caps the stretch and prevents the bright pixels from being pushed further toward 1.0.
- **Shadow protection (LP):** 0.0

Iterate the four GHS parameters interactively using the real-time preview until you can see:
- Yellow-orange bulge clearly distinct from the white core
- Outer disk faintly visible
- Background not blotchy in clean sky preview
- M32 visible as a tight bright dot
- M110 visible as a soft oval

**Save** as `master_nonlinear.xisf`.

**Common mistakes:**
- Pulling D too high until the background lifts above ~0.1 — at our SNR this looks lumpy and noisy
- HP too low — you flatten the bulge into a featureless white blob
- HP too high — you defeat the purpose; the core saturates to white anyway

### 3.2 HistogramTransformation cleanup

A small post-GHS micro-stretch:
- Pull black point to **just left** of the background histogram peak (do not clip into it)
- Nudge midtones slightly right (0.45-0.50)
- Don't touch white point

### 3.3 Mask building

Three masks needed downstream. Build them now.

**Galaxy range mask** (range_mask.xisf):
- `Image → Mask → Range Selection`
- **Lower limit:** raise until background is fully black in the mask preview (likely 0.10-0.15 after the stretch)
- **Upper limit:** 1.000
- **Fuzziness:** 0.10
- **Smoothness:** 5.0
- **Lightness:** ON

**Verify M32 and M110 are bright in the mask.** If M110 is too faint (it's diffuse), lower the threshold or hand-paint it in via CloneStamp.

**Star mask** (star_mask.xisf):
1. Duplicate `master_nonlinear`
2. Apply **HDRMultiscaleTransform** with **layers 6** to the duplicate — this flattens the galaxy bulge so StarMask doesn't treat the bulge as a giant star
3. Run **StarMask** on the flattened duplicate:
   - **Noise threshold:** 0.10
   - **Scale:** 5
   - **Large-scale:** 2
   - **Small-scale:** 1
   - **Compensation:** 2
   - **Smoothness:** 8
   - **Aggregate:** ON
   - **Midtones (output):** 0.25
4. Inspect: bright/medium stars should be captured; M31's bulge should NOT be in the mask. Iterate noise threshold.

**Galaxy-only mask** (galaxy_only_mask.xisf):
- `PixelMath`: `galaxy_only = range_mask - star_mask`
- This is the workhorse — used for HDRMT, LHE, Curves. Galaxy structure exposed, stars protected.

### 3.4 HDRMultiscaleTransform — bulge compression

The key tool for compressing M31's bright bulge so the surrounding disk and the dust lanes register visually.

Apply `galaxy_only_mask` first, then:
- **Number of layers:** **10** (stronger compression = bulge flattens more)
- **Number of iterations:** **1** (raise to 2 only if first pass isn't enough)
- **To lightness:** ON
- **Lightness mask:** ON (protects noise floor)
- **Overdrive:** 0.0
- **Median transform:** OFF
- **Scaling function:** Linear Interpolation

Inspect: bulge should now show internal structure (the bulge isn't a featureless yellow blob anymore — you can see the gradient from core out to disk). M32 should not be crushed. If M32 is dimmer than before, the mask didn't cover it well — fix the mask and redo.

### 3.5 LocalHistogramEqualization — dust lanes + bulge/disk separation

Two passes through `galaxy_only_mask`, at different scales (Ron Brecher's M31 recipe):

**Pass 1 — fine dust-lane detail:**
- **Kernel radius:** 40
- **Contrast limit:** 1.5
- **Amount:** 0.25
- **Histogram bins:** 256
- **Kernel size:** 64-bit
- 1 iteration

**Pass 2 — broader bulge/disk contrast:**
- **Kernel radius:** 150
- **Contrast limit:** 1.5
- **Amount:** 0.35
- 1 iteration

**Common mistakes:** Amount > 0.5 = garish, posterized look. Skipping the mask = stars become dark-ringed donuts.

### 3.6 CurvesTransformation — color and contrast

Apply `galaxy_only_mask`.

- **K (RGB/K) curve:** very gentle S — control points roughly at (0.25, 0.22) and (0.75, 0.80). Small contrast boost.
- **S (Saturation) curve:** lift the (0.5, 0.5) point up to ~0.62. Adds color saturation only on the galaxy (mask protects sky from chroma noise amplification).
- **Hue (H):** leave alone unless dust lanes look too magenta — small drift toward warmer red if needed.

Run a second light pass on just the S curve if galaxy color still looks washed out.

### 3.7 MorphologicalTransformation — star reduction

Stars at 50mm dominate the visual field. Reduce them after all galaxy work is done, through `star_mask`.

- **Operator:** **Morphological Selection** (NOT Erosion — Erosion makes square-edged stars)
- **Selection:** 0.25 (lower = more erosion-like, stronger reduction)
- **Structuring element:** **5×5 Circular**
- **Interlacing distance:** 1
- **Amount:** 0.6
- **Iterations:** 1

Inspect. If stars are still too bloated, a second light pass at Amount 0.4 will blend better than a single strong pass.

### 3.8 Mirach halo treatment (special case)

Mirach (β And) is mag 2.07 and almost certainly in-frame. After star reduction it will still have a soft halo and may look like a bright disk.

**If the halo is bothering you:**

1. Open the image. Use **Readout** to pick four points on the halo edge: left (L), right (R), top (T), bottom (B). Note pixel coordinates.

2. Create a new image of same dimensions (use `NewImage` process).

3. Apply PixelMath to the new image:
   ```
   iif(sqrt((x()-(R+L)/2)^2 + (y()-(B+T)/2)^2) < (R-L)/2, 1, 0)
   ```
   replacing L, R, T, B with the numeric coords. This creates a binary disk mask.

4. Apply `Convolution` with σ = 15-25 px to soften mask edges.

5. Use this softened disk as a **mask** on the main image.

6. Apply `CurvesTransformation` through the mask: gentle pull-down on highlights (right side of curve, drag down by 0.05-0.10). This fades the halo without creating a black hole.

**Use a light hand.** Overpulling = dark crater where Mirach used to be.

### 3.9 Final noise reduction — chroma only

After all stretching, residual color noise in the background is the most likely artifact. **Background mask** = inverted `range_mask`.

**Option A: ACDNR** (simpler, faster):
- **Lightness:** disabled
- **Chrominance (a*/b*):** Standard deviation 2.0, Iterations 3, Amount 0.5
- Apply through inverted range mask

**Option B: TGVDenoise** (more control):
- **Color space:** CIE L*a*b*
- **Iterations:** Luminance 0, Chrominance 100
- **Strength:** 1.5
- **Edge Protection:** 0.003
- Apply through inverted range mask

Pick whichever feels right on inspection — they produce similar results.

### 3.10 Final crop + export

- **Crop the worst comatic corners** (f/1.8 50mm primes have visible coma in the outer field — no software fix; just remove).
- Compose with M31 slightly off-center toward Mirach for visual balance.
- Aim for ~3:2 or 16:9 aspect ratio.

**Exports:**
- **16-bit TIFF** for archive (`andromeda_2013_pixinsight_final.tif`)
- **JPEG** for sharing (`andromeda_2013_pixinsight_final.jpg`, quality 95)

---

## Things this pipeline deliberately does NOT do

- **No deconvolution.** 50mm undersampled, no resolved structure to deconvolve.
- **No HDR Composition.** Need a separate short-exposure stack we don't have.
- **No drizzle.** 24 frames is too few for drizzle benefit; processing time would balloon.
- **No StarXTerminator-based star-removal-and-recompose workflows.** Stock tools can't reliably separate stars from this density of foreground.
- **No third-party plugins (BlurXT / NoiseXT / NXT / GraXpert).** If you do have these installed, tell me and I'll substitute — they would materially upgrade NR, deconvolution, and gradient removal.

---

## Watchpoints (things that will surprise you)

1. **The core will be solid white** after stretching. That's clipped-data physics, not a pipeline bug. HDRMT can darken it slightly to look less offensive but cannot recover what was never recorded.
2. **Corner stars will be smeared** (coma at f/1.8). Crop them out — there is no software fix.
3. **NGC 206 (the brightest HII complex in M31) will be faint.** Unmodified 60D blocks ~75% of H-α, so the red knots will be desaturated. Don't try to "push the red" — you'll just lift chroma noise.
4. **Mirach's halo is part of the image now.** It can be tamed (§3.8) but probably can't be made invisible.
5. **The background will go blotchy** if you stretch too hard. With 24 frames, the SNR ceiling is real. The sky preview standard-deviation test (§9.2 of research doc 2) is a good objective check.
6. **DBE will look "almost right" and then be wrong in the corners** if sample density is too low there. Specifically check corner background after pass 1.

---

## What I'll output at each checkpoint

| Phase | File | What you check |
|---|---|---|
| 1 | `master_dark_240s_ISO1600.xisf` | dark current map looks smooth, no hot bands |
| 1 | `master_light.xisf` | round stars edge-to-edge, core obviously clipped |
| 2 | `master_unvignetted.xisf` | corners no longer dim |
| 2 | `master_flat_linear.xisf` | uniform background, no tilt |
| 2 | `master_linear_NR.xisf` | smooth background, no detail loss in dust lanes |
| 3 | `master_nonlinear.xisf` | visible disk, bulge with structure, core white |
| 3 | `andromeda_2013_pixinsight_final.tif` | done |

---

## Open questions for you (before I start)

1. **Do you have any RC Astro plugins installed?** (StarXTerminator, NoiseXTerminator, BlurXTerminator). If yes, I'll substantially upgrade Phases 2-3. If no, we use stock as documented above.
2. **Do you have GraXpert installed?** (Free, open-source AI gradient removal.) If yes, it can replace or supplement DBE.
3. **Approve the plan?** Or any tweaks before I write the PJSR scripts and start processing?
