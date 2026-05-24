# PixInsight Workflow Research: Canon EOS 60D (OSC) with Master Darks but No Flat Frames

**Target setup**
- Camera: Canon EOS 60D (APS-C CMOS, ~18 MP, 14-bit CR2)
- Exposure: 240 s subs, ISO 1600
- Available calibration: master dark(s) matched to the lights (same exposure, same ISO, similar sensor temperature)
- Missing calibration: no flats, no flat-darks, no separate bias library
- Software: PixInsight 1.8.9-x with WBPP 2.5/2.6+

This document is split into two topics:

- Topic A: Canon DSLR (OSC) calibration in PixInsight with darks-only
- Topic B: Processing astrophotos when flat frames are missing (DBE/ABE, synthetic flats, vignetting, ordering)

Each topic starts with a TL;DR and then drills into concrete settings, parameter values, and rationale, with inline citations to the original sources.

---

## Topic A: Canon DSLR (OSC) Calibration in PixInsight with Darks Only

### TL;DR (Topic A)

1. **CFA pattern**: The Canon EOS 60D (and 60Da) uses an **RGGB** Bayer pattern. PixInsight will normally auto-detect this from the CR2 header, but in WBPP it is safe and recommended to explicitly set the CFA pattern to RGGB to guard against capture-app metadata quirks.
2. **Bias frames**: With matched-exposure, matched-ISO, matched-temperature master darks, bias frames are **not required** for calibrating the lights. They are only strictly required if (a) you want to dark-frame-optimize (scale) the master dark, or (b) you also use flats and need bias for the flat calibration. For this darks-only workflow you can safely skip bias.
3. **Dark Frame Optimization**: For DSLR data where the lights and the darks are nominally matched in exposure and ISO but temperature drifts (which it always does on an uncooled DSLR like the 60D), the consensus best practice is to **disable Optimize Darks** when (a) you have no bias master and (b) your darks are nominally matched. Optimization requires a bias to mathematically scale the thermal component, and without a bias master it cannot be performed correctly. In WBPP, set `Optimize Darks` = **off** for the master dark when no master bias is provided.
4. **CosmeticCorrection**: Build a CosmeticCorrection icon that uses the master dark for hot/cold defect detection. Recommended starting values: `Use Master Dark` enabled, `Hot Sigma` ≈ 3.0 (defect detection from master dark), `Cold Sigma` ≈ 3.0; combine with `Use Auto Detect` at Hot Sigma 3.0, Cold Sigma 3.0, and `Use CFA` = **on** because the data is still Bayer-mosaiced at this stage.
5. **Debayer method**: For deep-sky OSC astrophotography in PixInsight, **VNG** is the most commonly recommended default; it preserves full sensor resolution and produces clean stars and nebulae for typical Canon CR2 data. **SuperPixel** is an option for short focal length / undersampled fields where you want to avoid interpolation artifacts and don't mind the 2x resolution loss. **Bilinear** is favored by a minority for its gradient-agnostic behaviour around point sources but tends to produce noisier output. Default to **VNG** for the 60D.
6. **60D quirks**: ISO 1600 is the sensible cap on the 60D (read noise plateaus there). Black level is normally clamped around 2048 ADU at 14-bit. The 60D has mild banding at very high ISO but at ISO 1600 the banding is generally manageable. There is no significant amp glow on the 60D (unlike many modern cooled CMOS), so dark subtraction is well-behaved.

### A.1 The Canon EOS 60D sensor: what you need to know

The 60D is a Canon APS-C 18 MP CMOS sensor (the same generation as 7D / 600D family). It is a 14-bit ADC sensor, raw output in CR2. Relevant calibration characteristics:

- **CFA pattern**: RGGB. This is confirmed across multiple independent sources, including the PixInsight forum (for the closely-related 60Da), Cloudy Nights, the Siril project (which uses libraw / dcraw under the hood), and dcraw itself. The PixInsight forum confirms the Canon EOS 60Da Bayer pattern is RGGB, and the Siril developers confirm the same pattern for the standard 60D ("CFA pattern: RGGB"). See sources [1], [2], [3], [4].
- **Black level / pedestal**: When there is no light, the 60D produces a baseline value around 2048 ADU at 14-bit (Canon historically adds a pedestal so that very small negative read-noise values don't get clipped at zero). Some references quote 1024 ADU; the precise number depends on ISO and Canon firmware/processing but does not matter for PixInsight workflows because the calibration subtraction handles the offset automatically.
- **Read noise**: Drops steadily up to ISO 1600 and is approximately constant from there. ISO 1600 is the canonical "sweet spot" for the 60D and most older Canon APS-C bodies: you have effectively reached the read-noise floor, and going higher (3200+) starts to amplify shot noise visibly and only marginally improves read noise. Your ISO 1600 / 240 s subs are well-matched to this camera.
- **Amp glow**: The 60D does not exhibit the strong amp-glow that many cooled CMOS astro cameras (ASI071, ASI1600, ASI294) show in long subs. The dark frame should subtract cleanly without leaving residual glow halos at sub-frame edges.
- **Banding**: Older Canon DSLRs can show low-amplitude horizontal banding (the "Canon banding") in dark, heavily-stretched backgrounds. At ISO 1600 this is generally mild; if it becomes objectionable post-stretch, CanonBandingReduction script (community) or DBE with horizontally-elongated samples can address it.
- **In-camera options to disable for astro use**: Long Exposure Noise Reduction (LENR) — OFF (otherwise the camera takes an internal dark after every exposure, halving throughput). High ISO Noise Reduction — OFF. Auto Lighting Optimizer — OFF.

Citations: [5][6][7]

### A.2 Bias frames — do you need them with matched darks?

This is one of the most commonly-asked DSLR calibration questions, and the short answer for this setup is: **no, you do not need bias frames**.

Reasoning, paraphrasing the canonical PixInsight calibration sources [8][9][10]:

- The bias signal is a fixed-pattern, exposure-independent pedestal. It is contained inside any dark frame of any exposure length. When you subtract a dark frame from a light frame, you also subtract the bias (because the dark contains bias + thermal).
- Bias frames are required in two scenarios:
  1. **Flat-frame calibration**: To calibrate a flat, you need to remove the bias so that the flat's normalized signal represents only the optical transmission. If you have no flats, you don't need bias for the flats either.
  2. **Dark frame optimization (scaling)**: When you tell PixInsight to scale the master dark to match the thermal noise of each light, it needs the bias separated from the thermal component. Mathematically: `thermal = dark - bias`. Without a master bias, PI cannot perform proper optimization, so optimization must be turned off.
- The PixInsight official tutorial on master calibration frames explicitly notes that thermal noise must be bias-subtracted to be optimized: "only thermal noise must be rescaled in the master dark to match the thermal noise in the light frame" [8].
- For a typical DSLR shooter using matched darks (same exposure, same ISO, broadly similar temperature), no optimization is being done, the bias is contained in the dark, and bias frames add no information to the calibration of the lights. See Cloudy Nights [10] and Awesome Astro [11].

**Practical rule for your 60D setup**: ship your CR2 lights and your master dark to WBPP, leave the bias section empty, and disable dark optimization (Section A.4). This is fully supported, mathematically correct, and is exactly the workflow described in "Part 6: WBPP 2.0 (PixInsight): DSLR Darks only example" by Adam Block et al. [12].

**Caveat**: If you later want to add flats, you will then want at least bias OR flat-darks (matched-exposure flat darks are usually preferred for DSLR/CMOS because they perfectly subtract any thermal contribution from a short flat exposure together with the bias).

### A.3 BatchPreprocessing / WBPP settings for Canon CR2, darks-only

The following is a settings checklist for WBPP (≥2.5) with the 60D, ISO 1600, 240 s subs, master dark available, no bias, no flats.

#### A.3.1 Loading frames

- Drop your CR2 lights into the **Lights** group. WBPP will read the FITS/CR2 headers and group by camera/ISO/exposure automatically.
- Drop your master dark (a single integrated XISF/FITS file) into the **Darks** group. WBPP detects "Master" in the filename or in the FITS keyword `MASTER=T` and will skip integration of darks.
- Leave **Flats** and **Bias** completely empty.

#### A.3.2 Global / pipeline options

- **CFA images**: ENABLE this checkbox (CR2 is mosaic data). PixInsight needs to know the lights are mosaiced so it does not blindly mix Bayer subpixels.
- **Up-bottom FITS**: Leave at the default. The important rule is consistency: all of your calibration masters and lights must share the same FITS vertical orientation flag. Bernd Landmann's guide explicitly warns: *"It is crucial that one and the same setting for the vertical orientation in FITS files is used for the generation of all master calibration files as well as for light frame calibration, otherwise the calibration result will be wrong"* [13].
- **CFA pattern (manual override)**: If WBPP cannot detect the pattern reliably from your particular capture pipeline (e.g., if you preprocessed your CR2 to FITS without preserving BAYERPAT), set it explicitly to **RGGB** [14][15].

#### A.3.3 Master Dark group settings

- **Exposure tolerance**: Leave the default (10 s). Since your darks and lights both use 240 s, they will pair automatically.
- **Optimize Darks (Master Dark Optimization)**: **DISABLED**. You have no master bias, so optimization cannot be done correctly. With matched-exposure / matched-temperature darks the optimization gain is also minimal, so disabling it is the correct choice. See A.4 below for the full justification.
- **Calibrate Master Darks**: This option only matters if WBPP is calibrating the dark itself with a bias. With no bias provided, this is moot; leave at default.

#### A.3.4 CosmeticCorrection in WBPP

WBPP can automatically build a CosmeticCorrection from your master dark.

- **Apply CosmeticCorrection**: ENABLE.
- **Use Master Dark**: ENABLE — let WBPP detect hot pixels from the master dark statistics directly.
- **Hot pixel threshold (from master dark)**: Default ≈ 3.0 sigma is a good start. If you still see residual hot pixels after debayer + integration, lower to ~1.5–2.0 to be more aggressive. Going below ~1.0 starts removing real signal and is not recommended [16][17].
- **Cold pixel threshold**: Default ≈ 3.0. The 60D rarely has many genuine "cold" defective pixels, so this is generally not load-bearing.
- **Use Auto Detect**: ENABLE in addition. Default Hot Sigma = 3.0, Cold Sigma = 3.0. Auto-detect catches transient hot pixels that may not appear in the master dark (especially cosmic-ray-like single-frame events) [18].
- **CFA**: Auto-handled by WBPP when the global CFA option is on; the underlying CosmeticCorrection process needs "Use CFA" enabled when fed Bayer-mosaiced data so it doesn't smear across neighbouring color subpixels [16][19].

After WBPP creates the CosmeticCorrection icon you can inspect/edit it manually if needed. Typical workflow:

1. WBPP creates a `_cc` icon on the workspace using your master dark.
2. Optionally test it on one calibrated frame to confirm the hot/cold counts are reasonable (a few hundred to a few thousand pixels touched on an 18 MP frame is normal).
3. Adjust Hot Sigma / quantities if you see residual hot pixels in your final stack.

#### A.3.5 Debayer settings

- **Debayer method**: **VNG** (recommended default for OSC deep-sky). Rationale in A.5.
- **CFA pattern**: Auto (let PI read the header) or force to **RGGB** for the 60D.

#### A.3.6 Image registration / integration

These are not the focus of this document, but the relevant note for OSC data is:

- **Signal Evaluation** and **Noise Evaluation** in ImageCalibration: For CFA data, *disable* these in the ImageCalibration step; the Debayer process will perform signal/noise evaluation on the demosaiced output instead. This is per Bernd Landmann's calibration guide [13][14].
- For ImageIntegration of OSC data, use Pixel Rejection: Winsorized Sigma Clipping or Linear Fit Clipping. Normalization: Additive with Scaling. Weights: PSF Signal Weight (preferred in modern PI). For 240 s 60D subs with light to moderate light pollution this gives clean stacks.

### A.4 Dark Frame Optimization — enable or disable?

The Dark Frame Optimization feature in `ImageCalibration` (and the equivalent toggle in WBPP) scales the master dark on a per-light basis to better match the thermal noise. It is mathematically a regression of `dark - bias` against the light frame's noise after bias subtraction.

For your 60D, darks-only setup:

- **You have no master bias**. Without a bias, PI cannot separate the thermal component from the dark pedestal. Optimization will either silently degrade or be skipped, depending on PI version.
- **Your darks are nominally matched** (240 s @ ISO 1600). The main rationale for optimization is to handle mismatched exposures or temperatures. If your darks are matched, you gain little.
- **Recommendation**: **Disable** Optimize Darks in WBPP and in any manual ImageCalibration run. This matches the advice in the PixInsight forum discussion on the optimization threshold [20] and the Cloudy Nights / LightVortex pre-processing tutorials [21][9]. The "Optimize" option is also explicitly discouraged for CMOS data even when bias is available, because the dark frame on modern CMOS includes an "electronic signature" that does not scale linearly with temperature.
- **If you ever do enable it**: leave the optimization threshold at the default 3.0 sigma. Lowering it makes the regression try harder on noisier data which usually makes the result worse.

Source consensus: "If your master dark is the same temperature and exposure length as your lights, you should not use dark optimization. Dark optimization should really be avoided if at all possible." (Cloudy Nights, paraphrased; see also [22][23]).

### A.5 Debayer method choice for OSC astrophotography

PixInsight ships four debayer (demosaic) algorithms relevant here:

| Method      | Output resolution | Pros                                                              | Cons                                                              |
|-------------|-------------------|-------------------------------------------------------------------|-------------------------------------------------------------------|
| SuperPixel  | Half (each 2x2 → 1 pixel) | No interpolation, no demosaic artifacts. Fastest. Good for short FL undersampled fields. | Halves linear resolution. Star FWHM doubles in pixels. |
| Bilinear    | Full              | Gradient-agnostic; some users prefer for stars because it doesn't try to "guess" edges. | Tends to be noisier; can produce subtle checker patterns. |
| VNG         | Full              | "Variable Number of Gradients" — best general-purpose. Default in PI for most workflows. | Can occasionally produce minor maze patterns around very bright stars. |
| AHD         | Full              | Adaptive Homogeneity Directed; sharper edge behaviour. | Heavier compute; not always better on DSO data. |

For the 60D at typical focal lengths (telephoto / short refractor with APS-C):

- **VNG is the standard recommendation** for OSC deep-sky in PixInsight workflows. The Telescope Live and Argent tutorials, plus most modern WBPP defaults, settle on VNG. Confidence: high.
- **SuperPixel** only makes sense if your image scale is so undersampled (e.g., 50 mm prime on APS-C is ~16 arcsec/pixel — heavily undersampled) that resolution loss does not hurt and you want to avoid any demosaic artifacts on small stars. **For your 50 mm prime data (Topic B), SuperPixel is a legitimate alternative worth experimenting with** because at 16 arcsec/pixel you have no real resolution to lose, and a 2×2 SuperPixel debayer gives perfectly clean small-star handling. If your focal length is longer (200–400 mm), VNG is the better choice.
- **Bilinear** is recommended by a minority of DSO imagers (e.g., StarTools forum) on the grounds that VNG's gradient-following behaviour mis-handles point-like stars. The evidence is mixed; for the 60D / VNG combination most users do not see this in practice. Stick with VNG unless you observe visible star halos / artifacts.

Sources: [24][25][26][27].

### A.6 CosmeticCorrection beyond WBPP

If you want to manually tune CosmeticCorrection outside of WBPP (recommended once you process a few targets and want consistent defect maps), the recipe is:

1. Open `CosmeticCorrection` process.
2. Drag your CR2 (or calibrated frame) onto the Target Frames area as a target.
3. In the **Use Master Dark** section:
   - Master dark: select your master dark file.
   - **Enable Hot Pixel detection**, Sigma ≈ 3.0 (lower = more aggressive; 1.5–2.5 if many residual hot pixels remain post-integration).
   - **Enable Cold Pixel detection**, Sigma ≈ 3.0 (often left off if not needed).
4. In the **Use Auto Detect** section:
   - **Enable** Hot Auto Detect, Sigma 3.0. This catches transient hot pixels not in the master dark.
   - Cold Auto Detect: optional; usually unnecessary for DSLR data.
5. **Use CFA**: **ENABLE** if you are running CosmeticCorrection on Bayer-mosaiced (not yet debayered) data — which is the correct order: calibrate → CosmeticCorrection → debayer. With CFA on, defect replacement only samples from same-color neighbours in the Bayer grid.
6. Save as a process icon (`CC_60D_ISO1600_240s`) so you can reuse it across targets shot with the same camera/ISO/exposure.

Sources: [16][17][19].

### A.7 Putting it together — the 60D / darks-only workflow

End-to-end manual workflow (this is what WBPP automates):

1. **Build master dark** (you already have this). Integration: Winsorized Sigma Clipping, Average combine, no normalization, no weights. At least 10–20 dark subs, ideally 20+.
2. **Calibrate lights** (`ImageCalibration`):
   - Master Bias: empty.
   - Master Dark: your master dark.
   - **Calibrate** master dark: off.
   - **Optimize** master dark: **off**.
   - Master Flat: empty.
   - CFA: on. Output Pedestal: 100 DN (default).
3. **Cosmetic correction** (`CosmeticCorrection`): apply the CC icon built from the master dark, CFA on.
4. **Debayer** (`Debayer`): VNG (or SuperPixel for very short FL), CFA pattern RGGB or Auto.
5. **Subframe selection / weighting**, registration, integration as usual.
6. Proceed to background extraction (Topic B).

This is exactly the structure that the PixInsight darks-only example videos walk through [12].

---

## Topic B: Processing Astrophotos with Missing Flat Frames

### TL;DR (Topic B)

1. **DBE is your primary tool** when flats are missing. It uses a 2D spline interpolation of user-placed background samples, which gives more local control than ABE's global polynomial fit and is generally the better default for OSC / DSLR data.
2. **For your 50 mm prime at wide apertures**, expect roughly 1.5–3 stops of corner vignetting (i.e. corners receive 30–60% as much light as the centre). DBE can fully fix this *if* the vignetting falloff is smooth and the field has enough true background area. Vignetting on a 50 mm at f/2 is large-scale and multiplicative, so it is well within DBE's capability — but you must use **Correction: Division**, not Subtraction.
3. **Two-pass DBE** is the recommended workflow when both vignetting and additive gradients (light pollution) are present: pass 1 with **Division** and symmetrical samples to flatten the vignette; pass 2 with **Subtraction** and a denser, more local sample grid to remove the residual additive sky gradient.
4. **Synthetic flat** is a powerful fallback when DBE/ABE cannot deal with structured artifacts like dust motes or unusual non-radial vignetting. Recipe: star-remove the integrated linear master (StarXTerminator or StarNet++ in Linear mode), CloneStamp over residual DSO, blur heavily with MultiscaleMedianTransform (large layers), then divide the original image by the (normalized) synthetic flat via PixelMath.
5. **Order matters**: do DBE/ABE on **linear data, after integration, before color calibration**. The dominant view (LightVortex, ChaoticNebula, Jon Rista) is that you cannot do correct color calibration over a strongly-gradiented background, because the calibration sky-background sampling is corrupted. Run DBE first, then BackgroundNeutralization / SPCC, then continue.
6. **ABE versus DBE**: ABE is useful as a quick first pass with a low polynomial degree (1 or 2) on heavily-gradiented data where placing manual samples is hard. For high-quality final correction, DBE is preferred.

### B.1 Why missing flats matter (and what they don't fix)

Flat frames correct two distinct things:
- **Multiplicative pixel-by-pixel sensitivity variation** (vignetting, dust motes, sensor QE differences).
- The geometric / optical response of the system at the time of imaging.

When flats are missing, your integrated stack will exhibit:
- Smooth radial vignetting falloff toward the corners (from the lens).
- Dust motes / "dust bunnies" — round darker blobs from sensor dust.
- Possible small-scale fixed-pattern variation (minor on most modern CMOS).

DBE / ABE / synthetic flats can address the first issue well (smooth vignette) and partially the second (dust motes — synthetic flats are best for these because DBE samples cannot localize a 50-pixel-wide mote well). They cannot truly fix pixel-level sensitivity differences, but for DSLR data those are usually tiny and dominated by other sources of noise.

### B.2 Vignetting on a 50 mm prime — how bad is it?

For a typical 50 mm SLR prime lens used wide open or near-wide:

- **f/1.4–f/1.8 wide open**: 2–3 stops of corner falloff is normal. Corners may receive only 20–30% of the centre illumination. Often combined with optical aberrations (coma, astigmatism, lateral colour) at the edges.
- **f/2.0–f/2.8**: Vignetting reduces to ~1–2 stops in the corners. Corners receive ~40–60% of centre illumination.
- **f/4.0 and stopped down further**: Vignetting drops to <1 stop and is often visually negligible.

Implication for DBE without flats:

- **At f/2 or wider**: DBE with Division and a careful sample grid will largely flatten the vignette, but the corners often retain higher noise (because you stretched fewer photons by more in those regions). You may see corner colour casts after stretching even if the brightness is flat. Crop the worst 5–10% of the field if needed.
- **At f/2.8 or narrower**: DBE/ABE should handle the residual vignette comfortably.
- **APS-C crop helps**: The 60D is APS-C, so for a full-frame 50 mm lens you are using only the central ~63% of the image circle, where vignetting is less severe. Expect ~1 stop worst-case at f/2.

Source guidance: typical lens reviews quote ~2 EV corner falloff for fast 50 mm primes wide open; vignetting "decreases significantly when stopped down to f/2.8, and is completely gone by f/4.0" [28].

### B.3 DBE — DynamicBackgroundExtraction in detail

DBE is the most powerful background-modelling tool in PixInsight. It uses a spline fit between user-placed sample points to produce a smooth background model that you then subtract (additive gradients) or divide (multiplicative falloff) from your data.

#### B.3.1 When and where to run DBE

- **Linear data**: Run DBE on the linear integrated image, before stretching. A temporary ScreenTransferFunction (STF) auto-stretch is fine for visualization; the underlying data stays linear.
- **Before color calibration**: See Section B.7.
- **After integration**: Never on individual subs; always on the integrated master.

#### B.3.2 Sample placement

This is the single most important DBE skill. Misplaced samples ruin DBE faster than any other parameter mistake.

- **True background only**: Samples must sit on actual sky background, never on nebulosity, galaxies, or star halos. Jon Rista's tutorial is emphatic: *"True background sky is important here…samples only be placed on areas of the image that do indeed represent true background sky"* [29].
- **Coverage**: Distribute samples across the entire frame, including corners. Without corner samples, DBE will extrapolate the vignette badly. For a 1800×1200 effective canvas after registration, 60–120 sample points is a typical sweet spot.
- **Avoid stars**: Each sample is a small box (radius 5–15 pixels). Place between stars where possible. The `Tolerance` parameter will further reject bright pixels inside the box.
- **Generate by axes / symmetry**: For the first pass on vignette, use the Generate samples controls with horizontal + vertical symmetry to lay out a regular grid. Then manually delete samples that fall on the target object and add more samples in difficult background regions.
- **Use the magenta sample color**: In the DBE Sample Generation pane, change Sample Color from grey to magenta. This makes the sample boxes far more visible against a stretched-preview astro image [29].
- **Inspect with an unlinked STF stretch too**: An unlinked stretch can reveal color casts (sky glow, gradients) you might miss in a linked stretch [29].

#### B.3.3 Recommended parameter starting values

Two distinct DBE configurations are useful, one tuned for vignetting and one for additive gradients:

**Vignetting (Pass 1, Division)** — adapted from ChaoticNebula [30]:
- Correction: **Division**
- Tolerance: **1.000** (allow brighter pixels into samples because vignetting affects bright regions too)
- Shadows relaxation: **10** (very lenient at the dark end so corners are included)
- Default Sample radius: **250** (large, smoothing samples)
- Samples per row: **10–15** (sparse, large-area coverage)
- Smoothing factor: **0.250** (the default; vignetting is by definition smooth)
- Symmetry: enable horizontal + vertical symmetry to enforce a centred radial model
- Minimum sample weight: 0.75 (default)
- Normalize: ON (preserve mean intensity through the division)

**Additive gradient (Pass 2, Subtraction)** — adapted from Jon Rista [29]:
- Correction: **Subtraction**
- Tolerance: **0.5–1.0** (start low; raise if too few samples survive)
- Shadows relaxation: **3–5**
- Default Sample radius: **15–25**
- Samples per row: **10–20**
- Smoothing factor: **0.250** (default; raise toward 0.5–1.0 only on very complex fields like Sadr or IFN-rich data)
- Symmetry: OFF (additive sky gradient is rarely symmetric)
- Normalize: ON

#### B.3.4 Interpreting the background model

Before clicking Execute on the final pass, set `Target Image Correction → Correction` to **None** to generate just the background model image. Inspect it:

- It should look like a smooth, low-frequency map (bright in the centre, dark at the corners for the vignette pass; an asymmetric ramp for the gradient pass).
- If you see your DSO faintly visible in the model, you have a sample sitting on the object — delete it.
- If you see ringing / oscillations, you have either too few samples in some region or a smoothing factor too low for that region.

Then re-enable Subtraction or Division, enable `Replace target image` (or `Discard model` if you want a non-destructive output), and Execute.

#### B.3.5 Two-pass workflow in detail

The canonical "two-pass DBE" workflow for data with both vignette and gradient (which is exactly your case — 50 mm prime + light pollution):

**Pass 1 — Flatten the vignette (Division)**
1. Open DBE on the linear integrated master.
2. Apply the "Vignetting" parameters from B.3.3.
3. Lay samples on a symmetric grid emphasizing corners and edges.
4. Execute with Correction = Division.
5. Save the result as e.g. `integration_unvignetted`.

**Pass 2 — Remove residual additive gradient (Subtraction)**
1. Open DBE again on the un-vignetted image.
2. Apply the "Additive gradient" parameters from B.3.3.
3. Lay a denser, more uniform sample grid (you no longer need symmetry; additive gradient is not radial).
4. Execute with Correction = Subtraction.

This is the workflow described in the Cloudy Nights and LightVortex tutorials [31][32], and in the PuWe1 processing notes on pixinsight.com [33]: "Linear gradients such as light pollution or natural sky brightness gradients are additive in nature and should be removed by subtraction, residual vignetting (not corrected by flat frame calibration) is multiplicative in nature and must be removed by division, and any remaining complex gradients are usually best treated with DBE using subtraction."

### B.4 ABE — when and how

ABE fits a global polynomial of user-chosen degree to the entire image background. It is faster, has no manual sampling, but is less local than DBE.

- **Function Degree 1**: Linear gradient. Good for pure light-pollution ramps with no vignetting. [34]
- **Function Degree 2**: Quadratic. Useful for vignette-like falloff or moon-glow gradients. [34]
- **Function Degree 3–4**: Rarely useful on real DSO data. High degrees easily oscillate and over-fit, subtracting real signal. Avoid degree > 2 unless you have a specific reason. [35]
- Correction: Subtraction (default) for additive gradients; Division for vignetting.
- Normalize: ON for color images to preserve color balance.

**When to use ABE over DBE**:
- As a quick first pass when the image is so gradiented you cannot tell where true background is.
- When the field is mostly empty space (galaxy clusters, small DSOs in a wide frame).
- As a sanity check: an ABE result and a DBE result should disagree only in localized regions.

**When to prefer DBE**:
- IFN, large nebulae, or galaxy halos where polynomial fitting will swallow real signal.
- Any time you want spatial control over which regions inform the background model.

For your 50 mm / 60D / unknown-target setup, **DBE is the better default**; use ABE-degree-1 only as a preliminary if a wide ramp dominates the image.

### B.5 Synthetic flats — when DBE is not enough

If DBE leaves residual structured artifacts (especially circular dust motes or asymmetric vignetting that DBE's spline cannot localize), you can synthesize a flat from your own data and divide it out.

This is widely documented; the canonical references are Mike Cranfield's "Synthetic Flats with PixInsight" (Trapped Photons [36]) and the Westwood Astro / Suffolk Sky writeups [37][38].

#### B.5.1 Workflow

1. **Clone the linear, post-DBE integrated master**. Rename the clone "SynthFlat".
2. **Remove stars** on the clone:
   - StarXTerminator: enable the "Linear" option (the image is still linear) and run.
   - OR LinearStarNet script: set Stride = 64, uncheck "Show clipping map".
3. **Manually paint over residual DSO** using CloneStamp (Process → Painting). Set radius ~40 px and clone empty-sky over any remaining galaxy / nebula trace. The goal is a fully starless and DSO-less version of the field that contains only the optical illumination pattern + noise.
4. **Blur aggressively** with MultiscaleMedianTransform:
   - Open MultiscaleMedianTransform.
   - Layers: 6
   - Disable (uncheck) all detail layers; keep only the **Residual (R)** layer enabled.
   - Apply. This collapses everything except the very lowest spatial frequencies, producing a smooth illumination map.
5. **Apply via PixelMath**:
   - Open PixelMath, target = your original (pre-synth-flat) image.
   - Expression: `$T * mean(SynthFlat) / SynthFlat`
   - This divides out the optical falloff (multiplicative) while preserving the mean intensity.
   - Disable "Rescale result" and "Truncate result" unless you have negative values to deal with.
6. Continue to color calibration etc.

What this corrects: smooth vignetting + dust motes + smooth large-scale gradient (because they are all baked into the cloned background). What it does **not** correct: pixel-level sensitivity variation (you have no per-pixel info), and any genuine signal accidentally cloned out (so be conservative).

#### B.5.2 When to synthesize a flat vs do another DBE pass

- DBE handles wide, smooth vignette beautifully. Use synth flat if you see dust motes (round, 20–80 pixel dark blobs) that DBE leaves behind.
- Synth flat handles asymmetric / non-radial illumination that DBE cannot model with a few samples.
- The two approaches stack: DBE first to remove additive gradient, then synth flat for residual multiplicative structure.

### B.6 GraXpert and MultiscaleGradientCorrection — modern alternatives

PixInsight 1.8.9-2 introduced the **MultiscaleGradientCorrection** (MGC) process, which uses a wide-field reference image (typically a survey image such as DSS) to model and correct gradients far better than DBE for fields with extensive nebulosity. If your target has IFN or a large galaxy halo where DBE struggles, MGC is worth investigating [39].

GraXpert is an external open-source tool that uses an AI model trained on background patches to remove gradients. It is widely used as a faster, automated alternative to DBE for "cleanup" passes. Most users still combine it with one DBE/ABE pass [40].

These tools are out of scope for a strict "darks-only no-flats" workflow but worth knowing about.

### B.7 Order of operations: DBE before or after color calibration?

This is the single most-debated workflow ordering question on the PixInsight forums and Cloudy Nights.

**The consensus answer for OSC / DSLR data**: **DBE FIRST, then color calibration**. Rationale:

- BackgroundNeutralization (BN) and SPCC / PCC sample the background to estimate a black point. If the background has a strong colour cast from light-pollution gradient or vignetting-induced colour drift, the calibration sample is corrupted and the resulting calibration is wrong.
- Jon Rista's DBE tutorial recommends DBE on linear data "before color calibration" [29].
- Cloudy Nights consensus: "With DSLR or OSC CCD images, DBE is one of your very first steps, and usually performed before any other form of color calibration." [41]
- LightVortex Astronomy and ChaoticNebula tutorials also do DBE → BN → CC.

**Dissenting view**: Some experienced imagers (notably some users on the PixInsight forum) run SPCC first because SPCC's photometric calibration is robust to mild gradients and they want a known reference white point before background fitting. This is a coherent argument but assumes high-quality subs and only mild gradients. For your darks-only + no-flats + 50 mm prime case (which will have substantial vignetting-driven colour gradient), **stick with DBE first**.

**The full recommended linear-stage order**:

1. Integrate (master light).
2. DynamicCrop — remove registration edges.
3. **DBE pass 1**: Division for vignette.
4. **DBE pass 2**: Subtraction for residual additive gradient.
5. (Optional) Synthetic flat correction if dust motes remain.
6. BackgroundNeutralization (sample the now-clean background).
7. SpectrophotometricColorCalibration (SPCC) or PhotometricColorCalibration (PCC).
8. (Optional) Final small-radius DBE/ABE clean-up pass if needed.
9. Stretch and proceed to non-linear processing.

### B.8 Common pitfalls for the no-flats workflow

- **Sample on nebulosity → DBE subtracts real signal**. Always inspect the background model before committing.
- **Using Subtraction where Division was needed (or vice versa)**: Telltale sign is a colour cast in the regions where the original gradient was most severe (e.g., orange-tinted corners after a vignette "fix") [42]. Switch correction type and retry.
- **Too few samples in corners → vignette under-corrected**. Always check corner sample density specifically.
- **Smoothing factor too high → DBE swallows real structure**. Stay near 0.25 unless the field is exceptionally complex.
- **Running DBE on stretched data**: Produces non-physical results because gradients are multiplicative in linear data but become non-linear after stretch. Always run on linear data.
- **Bias frames included while optimizing darks but bias not actually matched to camera**: Causes worse calibration than no-bias-no-optimization. For your setup, leave both off.

### B.9 Worked recipe for your specific data

Given: 60D, ISO 1600, 240 s subs, master dark, no flats, possibly a 50 mm prime at wide aperture.

1. WBPP:
   - Lights: your CR2s.
   - Darks: master dark.
   - Bias / Flats: empty.
   - CFA images: ON. CFA pattern: RGGB.
   - Optimize Darks: OFF.
   - CosmeticCorrection: ON, Use Master Dark + Use Auto Detect, Hot Sigma 3.0.
   - Debayer: VNG (or SuperPixel if 50 mm + APS-C — undersampled).
   - Registration + integration with PSF Signal Weight, Winsorized Sigma Clipping.
2. Post-integration:
   - DynamicCrop edges.
   - DBE pass 1: Division, symmetry on, samples-per-row 12, radius 250, smoothing 0.25, tolerance 1.0, shadows relaxation 10. Inspect background model — should look like a smooth vignette map.
   - DBE pass 2: Subtraction, symmetry off, samples-per-row 15, radius 20, smoothing 0.25, tolerance 0.5–1.0. Background model should look like a smooth low-amplitude ramp.
   - (Optional) Synthetic flat if dust motes remain.
3. BackgroundNeutralization, then SPCC.
4. Continue with non-linear processing (stretch, noise reduction, sharpening, etc.).

---

## Consolidated source list

1. PixInsight Forum, "Bayer pattern for Canon EOS 60Da", https://pixinsight.com/forum/index.php?threads/bayer-pattern-for-canon-eos-60da.4370/
2. Cloudy Nights, "Canon 60D bayer matrix confusion", https://www.cloudynights.com/forums/topic/842984-canon-60d-bayer-matrix-confusion/
3. discuss.pixls.us, "Filter Pattern for Canon 60d" (Siril), https://discuss.pixls.us/t/filter-pattern-for-canon-60d/20444
4. dcraw / libraw camera lists — RGGB confirmed for EOS 60D.
5. Cloudy Nights, "Astrophotography with the New Canon 60D anyone?", https://www.cloudynights.com/topic/313619-astrophotography-with-the-new-canon-60d-anyone/
6. Astropix, "Nikon, Canon and Sony for Astrophotography", https://www.astropix.com/html/cameras/camera_quirks.html
7. Lorenzo Comolli, "Canon EOS 60D astrophotography notes", http://www.astrosurf.com/comolli/strum39.htm
8. PixInsight Official, "Master Calibration Frames: Acquisition and Processing", https://www.pixinsight.com/tutorials/master-frames/
9. Light Vortex Astronomy, "Pre-processing (Calibrating and Stacking) Images in PixInsight", https://www.lightvortexastronomy.com/tutorial-pre-processing-calibrating-and-stacking-images-in-pixinsight.html
10. Cloudy Nights, "Help with calibration frames in PixInsight", https://www.cloudynights.com/topic/659298-help-with-calibration-frames-in-pixinsight/
11. Awesome Astro, "How to take bias frames for DSLRs", https://www.awesomeastro.com/tutorials/how-to-take-bias-frames/
12. YouTube, "Part 6: WBPP 2.0 (PixInsight): DSLR Darks only example", https://www.youtube.com/watch?v=p2_T8ytNXys
13. Bernd Landmann, "Guide to PixInsight's ImageCalibration" (PDF), https://sh-cosmiccanvas.s3.us-west-2.amazonaws.com/Resources/20200902_GuideToPIsImageCalibration.pdf
14. Bernd Landmann, "Guide to Preprocessing of Raw Data with PixInsight" (PDF), https://sh-cosmiccanvas.s3.us-west-2.amazonaws.com/Resources/20230101_GuideToPreprocessingOfRawDataWithPixInsight.pdf
15. PixInsight Forum, "WBPP and CFA flats", https://pixinsight.com/forum/index.php?threads/wbpp-and-cfa-flats.18177/
16. ChaoticNebula, "PixInsight Cosmetic Correction to Remove Hot Pixels", https://chaoticnebula.com/cosmetic-correction/
17. PixInsight Forum, "CosmeticCorrection Settings with Master Dark", https://pixinsight.com/forum/index.php?threads/cosmeticcorrection-settings-with-master-dark.8060/
18. Telescope Live, "Enhanced, Automated WBPP CosmeticCorrection", https://telescope.live/tutorials/enhanced-automated-wbpp-cosmeticcorrection
19. PixInsight Forum, "Cosmetic Correction for DSLR (Canon) Raw files", https://pixinsight.com/forum/index.php?threads/cosmetic-correction-for-dslr-canon-raw-files.12154/
20. PixInsight Forum, "Dark Frame Optimization: Optimization Threshold", https://pixinsight.com/forum/index.php?threads/dark-frame-optimization-optimization-threshold.11502/
21. Cloudy Nights, "PixInsight Image Calibration - darks as flats or what?", https://www.cloudynights.com/topic/672726-pixinsight-image-calibration-darks-as-flats-or-what/
22. YouTube, "WBPP (PixInsight): Dark Frame Optimization", https://www.youtube.com/watch?v=y9qzQnyzMsc
23. Adam Block Studios forum, "Dark Frame Calibration in WBPP Part #9", https://forum.adamblockstudios.com/forums/discussion/171/dark-frame-calibration-in-wbpp-part-9
24. Trapped Photons, "PixInsight BatchPreprocessing", http://trappedphotons.com/blog/?p=1144
25. PixInsight Forum, "WBPP - DSLR (Super Pixel CFA Debayer method)", https://pixinsight.com/forum/index.php?threads/wbpp-dslr-super-pixel-cfa-debayer-method.20030/
26. Telescope Live, "The PixInsight Debayer / Demosaicing Process Explained", https://telescope.live/blog/pixinsight-debayer-demosaicing-process-explained
27. Cloudy Nights, "DeBayerization: VNG or AHD?", https://www.cloudynights.com/topic/608289-debayerization-vng-or-ahd/
28. Photography Life / lens reviews on 50 mm prime vignetting characteristics, https://photographylife.com/reviews/nikon-50mm-f1-8g/2
29. Jon Rista, "PixInsight DynamicBackgroundExtraction", https://jonrista.com/the-astrophotographers-guide/pixinsights/dynamicbackgroundextraction/
30. ChaoticNebula, "How to Use PixInsight Dynamic Background Extraction", https://chaoticnebula.com/pixinsight-dynamic-background-extraction/
31. Cloudy Nights, "Light Pollution and Gradient Reduction in PixInsight", https://www.cloudynights.com/topic/649557-light-pollution-and-gradient-reduction-in-pixinsight/
32. Light Vortex Astronomy, "Reducing Light Pollution Effects, Removing Gradients and Artificial Flattening", https://www.lightvortexastronomy.com/tutorial-reducing-light-pollution-effects-removing-gradients-and-artificial-flattening.html
33. PixInsight examples, "PuWe 1 Processing Notes", https://pixinsight.com/examples/PuWe1/index.html
34. Konstantin Dzuin, "ABE Function Degree in PixInsight", https://dzuin.me/til/2023-02-abe/
35. PixInsight Forum, "Correct values for DBE", https://pixinsight.com/forum/index.php?threads/correct-values-for-dbe.3689/
36. Trapped Photons, "Synthetic Flats with PixInsight", http://trappedphotons.com/blog/?p=756
37. Westwood Astro, "Remove Image Defects With a Synthetic Flat Frame", https://www.westwoodastro.net/blog/2021/11/27/creating-a-synthetic-flat-frame-with-pixinsight
38. The Suffolk Sky, "Learning PixInsight – Create and Use a Synthetic Flat", http://www.suffolksky.com/2024/12/12/learning-pixinsight-create-and-use-a-synthetic-flat/
39. PixInsight Official, "Multiscale Gradient Correction", https://pixinsight.com/tutorials/multiscale-gradient-correction/
40. Stirling Astrophoto, "A Guide to PixInsight's MultiscaleGradientCorrection", https://stirlingastrophoto.com/posts/multiscale-gradient-correction/
41. Cloudy Nights, "DBE before or after Color Calibration?", https://www.cloudynights.com/topic/865803-dbe-before-or-after-color-calibration/
42. Cloudy Nights, "PixInsight — Multiplicative v. Additive Gradients", https://www.cloudynights.com/topic/513931-pixinsight-multiplicative-v-additive-gradients/
43. PixInsight Forum, "WBPP for OSC: Minimum to check other than default", https://pixinsight.com/forum/index.php?threads/wbpp-for-osc-minimum-to-check-other-than-default.21140/
44. AstroARG / theargents.wordpress.com, "PixInsight – working with WBPP part 1", https://theargents.wordpress.com/2022/03/06/pixinsight-working-with-wbpp-part-1/
45. PixInsight Forum, "WBPP: What am I doing wrong in my DSLR workflow?", https://pixinsight.com/forum/index.php?threads/wbpp-what-am-i-doing-wrong-in-my-dslr-workflow.16624/
46. Kernow Astronomers, "Deep Sky Image Calibration, Integration and Processing with PixInsight" (PDF), https://kernowastronomers.com/wp-content/uploads/2024/02/PixInsight-OSC-Workshop-Manual.pdf
47. astrophotons.com, "PixInsight Background Extraction - How to Remove Gradients and Tints", https://astrophotons.com/pixinsight-remove-gradients-background-extraction
48. nrStellar, "PixInsight LRGB Editing Workflow", https://nrstellar.com/blogs/articles/lrgb-editing-workflow-for-pixinsight
49. Madratter's AstroImaging, "Gradient Reduction Part 2", https://astroimages.weebly.com/gradient-reduction-part-2.html
50. Telescope Live, "Creating a Synthetic Flat in PixInsight to Correct Flat Field Errors", https://telescope.live/blog/creating-synthetic-flat-pixinsight-correct-flat-field-errors

---

## Quick parameter reference cards

### Card 1 — WBPP for 60D / ISO 1600 / 240 s / darks-only

| Setting                       | Value                                       |
|-------------------------------|---------------------------------------------|
| CFA images                    | ON                                          |
| CFA pattern (override)        | RGGB                                        |
| Darks → Optimize              | OFF                                         |
| Darks → Calibrate Master Dark | OFF (no bias)                               |
| Bias                          | empty                                       |
| Flats                         | empty                                       |
| Cosmetic Correction           | ON                                          |
| CC → Use Master Dark          | ON                                          |
| CC → Hot Sigma (master dark)  | 3.0                                         |
| CC → Cold Sigma               | 3.0                                         |
| CC → Use Auto Detect          | ON, Hot Sigma 3.0, Cold Sigma 3.0           |
| CC → Use CFA                  | ON (handled automatically by WBPP)          |
| Debayer method                | VNG (or SuperPixel for very short FL)       |
| ImageCalibration signal/noise eval | OFF (Debayer does it for CFA)         |

### Card 2 — Two-pass DBE for 50 mm prime / no flats

| Setting              | Pass 1 (Vignette / Division) | Pass 2 (Gradient / Subtraction) |
|----------------------|------------------------------|----------------------------------|
| Correction           | Division                     | Subtraction                      |
| Tolerance            | 1.000                        | 0.500–1.000                      |
| Shadows relaxation   | 10                           | 3–5                              |
| Default sample radius| 250                          | 15–25                            |
| Samples per row      | 10–15                        | 10–20                            |
| Smoothing factor     | 0.250                        | 0.250 (raise for complex fields) |
| Symmetry             | Horizontal + Vertical ON     | OFF                              |
| Minimum sample weight| 0.75                         | 0.75                             |
| Normalize            | ON                           | ON                               |
| Linear data?         | YES                          | YES                              |
| Before color calib?  | YES                          | YES                              |

### Card 3 — Synthetic flat (PixelMath recipe)

```
SynthFlat workflow:
  1. Clone integrated linear master → "SynthFlat"
  2. StarXTerminator (Linear=ON)  OR  LinearStarNet (Stride=64)
  3. CloneStamp residual DSO away (radius ~40 px)
  4. MultiscaleMedianTransform: Layers=6, only Residual layer enabled
  5. PixelMath on original image:
        expression: $T * mean(SynthFlat) / SynthFlat
        Rescale: OFF
        Truncate: OFF
        Use single RGB/K expression: ON
```

### Card 4 — Linear-stage processing order

1. Integrate
2. DynamicCrop
3. DBE Pass 1 (Division — vignette)
4. DBE Pass 2 (Subtraction — gradient)
5. (Optional) Synthetic flat correction
6. BackgroundNeutralization
7. SPCC / PCC
8. (Optional) cleanup DBE/ABE pass
9. Non-linear stretch → continue
