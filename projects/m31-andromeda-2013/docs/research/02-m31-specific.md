# M31 (Andromeda Galaxy) — Image Processing Challenges and Techniques

**Target dataset:** 24 × 240 s @ ISO 1600, Canon EOS 60D + 50 mm lens, NEQ6 tracked, rural dark site, 2013.
**Software focus:** PixInsight (with notes on legacy / non-StarXTerminator workflows because the data is from 2013).
**Total integration:** 96 minutes.
**Field of view (APS-C, 50 mm):** approximately 25.5° × 17° (the entire Andromeda–Mirach–Triangulum region fits comfortably).

---

## TL;DR

1. **M31 is a dynamic-range monster.** The galactic nucleus is ~10–12 magnitudes brighter per arcsec² than the faint outer arms and the Bortle-3 sky. With a single 240 s sub at ISO 1600 + f/1.8, the nucleus is almost certainly clipped or very close to it. Plan all processing around protecting whatever core information survived in the stack.
2. **The "HDR fix" is mostly compression, not recovery.** Tools — `HDRMultiscaleTransform`, `LocalHistogramEqualization` with a range mask, `MaskedStretch`, `GeneralizedHyperbolicStretch` — compress brightness so the outer arms become visible without burning the core, but they can't invent data that wasn't captured. A real fix would have been a second short-exposure HDR stack, which you don't have. Treat the linear master accordingly: stretch gently, mask aggressively.
3. **Dust lanes are local-contrast structures, not stretch structures.** `LocalHistogramEqualization` (twice, at scales ~40 and ~150, low strength, masked to galaxy only) plus the `DarkStructureEnhance` script are the canonical PixInsight dust-lane recipe. Multiscale tools (`MultiscaleMedianTransform`, `MultiscaleLinearTransform`) at mid scales also work.
4. **Colour is the hardest part on an unmodified 60D.** The internal UV/IR cut blocks ~75 % of H-α, so the red NGC 206-region HII knots will be weak. Use `SpectrophotometricColorCalibration` (or `PhotometricColorCalibration`) with M31 as the reference, expect a desaturated red, push saturation **only with masks** that exclude background to avoid amplifying chroma noise.
5. **At 50 mm, M31 is just one of thousands of stars in the frame.** Star handling dominates the look more than galaxy processing does. Stop the lens to at least f/2.8 (coma!), build a proper `StarMask` + `MorphologicalTransformation` selection operator (not erosion), and treat Mirach (β And, mag 2.07, only ~3.5° from M31) as a real halo problem requiring a circular PixelMath mask.
6. **No flats + f/1.8 + DSLR + wide field = severe vignetting.** Plan on running `DynamicBackgroundExtraction` two or three times (low function degree, ~0.5 smoothing, points placed well clear of the galaxy and the Milky Way's edge) before any stretching. The `MultiscaleGradientCorrection` (newer) is also worth trying.
7. **24 frames is a low-S/N stack.** S/N scales with √N; you have ~4.9× the per-sub S/N rather than the ~10× you'd get from 100 subs. The hard limit is **how much you can stretch the background before it goes blotchy**. Practical rule: stop stretching where the smooth-background test starts to break down; let the galaxy be slightly under-stretched rather than the sky be over-amplified.
8. **The companions (M32 north-ish, M110 south-west) are easy to "fix" and easy to overcook.** Make a range mask that includes them; otherwise `HDRMultiscaleTransform` will treat M32 as another bright "core" and crush it.

---

## Table of contents

1. [Why M31 is unlike any other DSO to process](#1-why-m31-is-unlike-any-other-dso-to-process)
2. [The HDR challenge: protecting the core](#2-the-hdr-challenge-protecting-the-core)
3. [Dust lanes — local contrast without overcooking](#3-dust-lanes--local-contrast-without-overcooking)
4. [Colour of M31 (yellow core / blue arms / red HII)](#4-colour-of-m31-yellow-core--blue-arms--red-hii)
5. [Star bloat and star reduction (no StarXTerminator)](#5-star-bloat-and-star-reduction-no-starxterminator)
6. [Companion galaxies — M32 and M110](#6-companion-galaxies--m32-and-m110)
7. [Wide-field considerations at 50 mm](#7-wide-field-considerations-at-50-mm)
8. [Light pollution and gradients without flats](#8-light-pollution-and-gradients-without-flats)
9. [Low frame count (24) — what to expect and what not to push](#9-low-frame-count-24--what-to-expect-and-what-not-to-push)
10. [Proposed processing order for this specific dataset](#10-proposed-processing-order-for-this-specific-dataset)
11. [Sources](#sources)

---

## 1. Why M31 is unlike any other DSO to process

Most deep-sky processing problems fall into one of two families:

- **Faint, low-surface-brightness targets** (IFN, faint reflection nebulae, outer galaxy halos) — limited by sky background and read noise; you need long integration and aggressive stretching.
- **Bright emission nebulae** (M42, NGC 7000, M8) — bright cores but largely a *single* steep gradient from core to outskirts; HDR is needed but the transitions are smooth and roughly monotonic.

M31 lives in **both** families at once and adds a third problem:

- The **nucleus** behaves like a near-stellar point source (Adam Block describes M31's core as "essentially a star you cannot remove") — saturating in a few seconds even at modest focal ratios.
- The **bulge** is a smooth, yellow-orange, high-surface-brightness ellipsoid.
- The **disk** is criss-crossed by dark dust lanes embedded between bright young blue OB associations.
- The **outer halo / Halpha plumes / outer dust rings** are below sky brightness in most sub-exposures.
- And then there's a forest of foreground Milky Way stars on top, because M31 sits only ~21° from the galactic plane.

That combination — point-source-like core, broad mid-tones, dark filaments, ultra-faint outskirts, and a star-rich foreground — is essentially unique among "showpiece" DSOs and is the reason every M31 image you see online is heavily HDR-compressed in some form. [Light Vortex Astronomy](https://www.lightvortexastronomy.com/tutorial-example-m31-andromeda-galaxy---dslr.html), the [PixInsight forum example thread](https://pixinsight.com/forum/index.php?threads/new-post-processing-example-m31-andromeda-galaxy-from-a-dslr.9163/), and the [PixInsight M31-Ha example](https://pixinsight.com/examples/M31-Ha/) all open with this observation.

### Dynamic range, in numbers

Approximate surface brightnesses (mag/arcsec²):

| Region | μ (V) | Relative brightness |
|---|---|---|
| Nucleus (inner few arcsec) | ~14 | 1.0 |
| Bulge | ~17–18 | ~0.04–0.015 |
| Bright spiral arms | ~21 | ~0.0006 |
| Outer disk / faint plumes | ~25 | ~0.000015 |
| Bortle 3 sky background | ~21.5–22 | comparable to arms |

So between the nucleus and the outer disk you have roughly 10–11 stops of dynamic range. A 14-bit DSLR sub at ISO 1600 has ~10–11 stops of usable range before clipping. **The core will clip before the outer arms are detected** — that is the central problem of M31 processing.

---

## 2. The HDR challenge: protecting the core

### 2.1 Recognising what survived in your stack

Before you reach for any HDR tool, examine the integrated master:

- Open `Statistics` (or HistogramTransformation real-time preview, log scale) and check whether the inner nucleus pixels are at 1.0 (clipped) or below.
- Check whether the central pixels are *saturated in all three channels* (truly clipped, no recovery) or just in the green/red channel (partial information remains and can be reconstructed via `LRGBCombination` tricks or PixelMath).
- For 240 s @ ISO 1600 at f/1.8 with a 50 mm lens, expect partial clipping in the innermost ~5–10 px of the nucleus. The bulge should be fine.

If the very centre of the nucleus is clipped, no PixInsight tool will recover it. What HDR tools do is **compress the bright-to-faint ratio** so the faint stuff becomes visible without making the bright stuff burn out *visually*.

### 2.2 The canonical PixInsight HDR toolset for M31

In rough order of how strongly they compress:

**1. `MaskedStretch`** (mild, used at linear→non-linear transition)
A non-clipping, iterative stretch that uses a self-generated mask so the bright parts are stretched less than the faint ones. The Light Vortex Astronomy DSLR M31 tutorial and several CloudyNights threads describe this as the preferred initial stretch for M31 because `HistogramTransformation` set to make the outer arms visible will hammer the core flat. Settings to try: Target background 0.10–0.15, iterations 100, clipping fraction 0.00000.

**2. `GeneralizedHyperbolicStretch` (GHS)** (mild→aggressive, very controllable)
Available as a script and now as a process. Five parameters (`b`, `D`, `LP`, `SP`, `HP`) give very fine control over which intensity band is stretched. For M31:
- Set `SP` (stretch focus point) to just above the bulge brightness so the core is compressed and the disk is expanded.
- `b` 3–6 for moderate hyperbolic shape.
- `HP` near 0.9–1.0 keeps bright pixels from inverting.
This replaces a lot of what people used to do with masked `HistogramTransformation` + curves.

**3. `HDRMultiscaleTransform`** (moderate→strong, *the* M31 tool)
This is the workhorse. It performs multiscale dynamic range compression — coarse scales are flattened, fine scales are preserved.
- Number of layers: 6–10 (lower = stronger compression). 10 is recommended for M31 by both Light Vortex and the PixInsight example thread.
- Number of iterations: 1 to start.
- "To lightness" + "Lightness mask" checked, so only the bright stuff is compressed and the noise floor doesn't lift.
- **Always apply through a range mask** — at minimum a galaxy-only mask so HDRMT doesn't crater nearby stars and the M32 core.
- Re-apply at finer scales (layers = 6) for a second pass if you want extra "punch" in the bulge–disk transition.

**4. `LocalHistogramEqualization`** (mostly for dust lanes, but adds HDR-like flattening too)
Discussed in section 3 below.

**5. `HDRComposition`** (best, but requires a second short-exposure stack — you don't have one)
Combines two or more stacks of different exposures into a 64-bit float HDR. Rogelio Bernal Andreo's tutorial (`deepskycolors.com/tools-tutorials/hdr-composition-with-pixinisght/`) and the PixInsight M31-Ha example both demonstrate this with a separate 30 × 30 s short stack for the nucleus. **Practical note for your data:** if any of your 24 subs were shorter trial exposures, or if some were taken just as you were focusing/centring and are very short — *don't throw them away*. Even one or two 5–10 s sub-exposures can be stacked into a passable "core" frame for HDRComposition. If you have nothing shorter than 240 s, skip this tool entirely.

### 2.3 The mask is more important than the tool

In every M31 tutorial worth reading, the dominant theme is **the right mask**:

- A **range mask** (Image → Mask → Range Selection) with low end ~0.1 and high end ~1.0, smoothness ~3, will pick out the galaxy and stars but leave the sky alone. That's the basic "galaxy mask".
- A **luminance mask** (just an extracted L channel, possibly stretched) protects bright pixels in inverse proportion to brightness.
- A **star mask subtracted from the range mask** (PixelMath: `rangeMask - starMask`) gives a "galaxy only, no stars" mask — essential for applying HDRMT or LHE without distorting star shapes.
- A **dark structure mask** from `DarkStructureEnhance` (Extract Mask option) finds the dust lanes themselves.

Stack these. The standard "M31 mask" used by most tutorials is `(range_mask − star_mask)`, blurred slightly (Convolution σ = 3–5 px) for soft edges.

### 2.4 What the tools cannot do

- They cannot recover clipped pixels. If your nucleus is solid white, it stays solid white. `HDRMT` will at best darken it slightly so it isn't visually offensive.
- They cannot replace the data. Compression makes the image *look* HDR; the SNR in the compressed region is still defined by the original sub-exposures.
- They will amplify any colour noise around the core if the masks aren't tight. Always run `SCNR` and a chrominance noise reduction (TGV in CIE Lab, c-component, or `MMT` chrominance) before and/or after the HDR steps.

---

## 3. Dust lanes — local contrast without overcooking

The dust lanes are M31's most photogenic feature and the easiest thing to ruin. They're **dark structures embedded in mid-tone galaxy light**, so they respond to local-contrast tools, not to global stretching.

### 3.1 LocalHistogramEqualization (LHE)

`LocalHistogramEqualization` (an implementation of CLAHE) is the most-cited tool for this. Ron Brecher's 2023 M31 writeup (`astrodoc.ca/m31-2023/`) gives a concrete recipe that has become a quasi-standard:

> Apply LHE **twice** through a galaxy mask:
> - **Pass 1:** Scale 40, Contrast limit 1.5, Strength 0.25, 1 iteration → fine-scale dust detail.
> - **Pass 2:** Scale 150, Contrast limit 1.5, Strength 0.35, 1 iteration → larger-scale bulge/disk separation.

Two light passes at different scales produce a much more natural look than one strong pass. Keep contrast limit ≤ 2.0 — higher values posterize quickly.

**Mask:** galaxy-only (range mask minus star mask). Without the mask, LHE will brighten the sky background between stars and produce a soup of haloes.

### 3.2 DarkStructureEnhance script

`DarkStructureEnhance` (Script → Utilities) is a wavelet-based dark-structure booster. Default Amount = 0.40 is too strong for M31; drop it to 0.20–0.30. It also has an "Extract mask" mode which gives you a usable dust-lane mask for any subsequent processing (e.g. saturation boost specifically in the dust lanes).

### 3.3 MultiscaleMedianTransform / MultiscaleLinearTransform

For very subtle dust-lane sharpening (and for the brighter star-clouds between dust lanes), apply MMT/MLT to scales 1–4 with low strengths. Ron Brecher used `MultiscaleMedianTransform` on layers 1–5 with strengths of 0.01–0.03. These are tiny numbers on purpose — multiscale boosts compound very quickly on M31's mid-tones.

### 3.4 UnsharpMask — generally avoid

Classic unsharp mask is too coarse for M31 dust lanes; it produces dark haloes around stars in the disk and around the bulge edge. If you must, mask out stars and the core, use a very small radius (1–2 px), small amount (0.2), with a deringing low value.

### 3.5 What "overcooking" looks like

- **Black halos around the dust lanes** → LHE too strong, or applied without star protection.
- **Posterized "elephant skin" in the bulge** → multiple LHE passes at same scale, or contrast limit > 2.
- **Inverted dust lanes** (they go bright instead of dark) → dark-structure enhancement applied to a non-inverted mask, or `DarkStructureEnhance` with `Amount` too high.
- **"Painted-on" look** → too much sharpening on dust-lane edges; the underlying data was just barely resolved at 50 mm and you're hallucinating structure.

At 50 mm, M31 spans ~3° / pixel-scale-dependent-but-let's-say ~250–300 px across its long axis on a 60D. That's not enough resolution to push fine dust-lane detail hard. **Treat dust lanes as broad tonal structures, not as fine detail.**

---

## 4. Colour of M31 (yellow core / blue arms / red HII)

### 4.1 The truth of M31's colours

M31 is colour-rich in a way many imagers under-render:

- **Nucleus and bulge** — population II stars, dominantly K and M giants → strong **yellow-orange / pale-amber**.
- **Inner disk** — mixed populations → cream / pale-yellow.
- **Outer spiral arms / OB associations** — young, hot stars → distinct **blue** (NGC 206 is the brightest knot).
- **HII regions** — narrow red points dotted along the arms; mostly visible only with H-α-modified cameras or narrowband, but a few of the brightest knots (around NGC 206, on the leading edge of the southwest arm) can show up faintly in unmodified DSLR data.
- **Foreground stars** — full Milky Way star colour spectrum (mostly white/yellow with red giants and blue main-sequence sprinkled in).

The famous "yellow core / blue arms" appearance is *real and physical*, not a processing artifact. It comes from the stellar population gradient.

### 4.2 Why your unmodified 60D will struggle with red

The 60D's stock UV/IR cut filter attenuates H-α to ~20–25 % transmission (commonly quoted as "about 2 stops"). The 60Da is the H-α-modified variant. On an unmodified 60D:

- HII regions in M31 will be faint and shifted toward orange (because the broader 656.3 nm region is suppressed and the response is dominated by the wings).
- Reddish hue from the cool stars in the bulge will still be there fine — it's broadband.
- Don't expect to lift NGC 206's HII knots much above the noise floor at 96 minutes total integration without amplifying enormous chroma noise.

### 4.3 Photometric colour calibration

PixInsight's `PhotometricColorCalibration` (or the newer `SpectrophotometricColorCalibration`, SPCC) is the preferred way to get neutral, physically-meaningful colour:

1. Run before any non-linear stretch (the master must be linear).
2. Catalogue: APASS or Gaia DR3 (SPCC).
3. Target: M31 (PCC can look it up by name).
4. Filter: Mono filter setting? — for DSLR OSC, use a CFA-aware workflow: deBayer first, then run PCC/SPCC on the RGB image.
5. After PCC, run `SCNR` (Remove Green, default 0.5, average neutral) to kill the green cast that always appears.

Caveat from CloudyNights M31-colour threads: PCC tends to set the core white-balance reference using the bright bulge stars, which can pull the spiral arms slightly *too* blue if you're not careful. Some imagers prefer using a white-reference area off the galaxy (sky reference).

### 4.4 BackgroundNeutralization order

Run `BackgroundNeutralization` **before** PCC, with a preview box drawn over a clean sky region (not over the galaxy, not over Mirach's halo, not in a corner with vignetting residual). This is a hard requirement; PCC's accuracy is shot if the background is non-neutral.

### 4.5 Saturation, the right way

Default colour saturation after PCC will look weak. You need to push it, but:

- Push saturation **only on the galaxy** (use the same range mask as for HDR/LHE). Boosting saturation on the sky background just amplifies chroma noise.
- Use `CurvesTransformation` in S (Saturation) mode, with the mask active.
- Apply two or three light pulls (S-curve in S) instead of one strong one.
- Boost separately for stars (via a starless image) if you have a way to separate them — see section 5.
- Consider `ColorSaturation` (per-hue curve) to push reds and blues independently — useful for nudging the faint HII knots without over-saturating the bulge.

### 4.6 Common colour mistakes on M31

- **Magenta core** — too much red after PCC + a misplaced background reference, or aggressive H-α push on partially modified-DSLR data. The bulge should be amber-yellow, not pink.
- **Cyan-blue arms** — saturation push without hue control; the arms should be a deep blue, not cyan.
- **Green sky background** — skipped SCNR.
- **Brown / muddy disk** — under-saturated, mid-tones crushed by a too-aggressive black point. Lift the black point until just before the background goes lumpy.

The BBC Sky at Night and astrobackyard.com tutorials both emphasise: "exaggerated blues in spiral arms" is the single most common amateur over-processing tell on M31.

---

## 5. Star bloat and star reduction (no StarXTerminator)

StarXTerminator was released ~2021. Your 2013 data and a pre-SXT workflow leave you with the classical PixInsight star-handling toolkit. It's still very capable.

### 5.1 Why stars dominate the 50 mm M31 frame

At 50 mm on APS-C, you're imaging ~25 × 17 °. The Andromeda field includes:

- **β Andromedae (Mirach)**, mag 2.07, only ~3.5° from M31 — almost certainly inside your frame depending on framing. It will produce a bright bloated disk and a halo.
- **ν Andromedae**, mag 4.5, between Mirach and M31.
- **μ Andromedae** and several mag 4–5 stars in the field.
- Tens of thousands of faint Milky Way foreground stars.

The galaxy is, frame-wise, a small bright smudge in a sea of stars. **How the stars look will dominate the visual impression** more than the galaxy's own structure does.

### 5.2 Choke star bloat at acquisition time

- **Stop down the lens.** A 50 mm f/1.8 wide open has coma and chromatic aberration in the outer field. f/2.8–f/4 cleans up dramatically. (Multiple lens reviews and CloudyNights threads on the Canon 50/1.8 II confirm this.) You shot at f/1.8-ish, so expect coma in the corners — there is no software fix for coma; it has to be cropped or de-prioritised in the framing.
- **Don't overexpose subs.** 240 s @ ISO 1600 @ f/1.8 is *very* aggressive at a dark site — it's why your core probably clipped. Bloat is partly a function of how saturated stars are.

You already have the data, so the above is for next time.

### 5.3 StarMask creation (the prerequisite)

In PixInsight, before you do anything to stars you need a clean star mask. The classic recipe (Light Vortex / Rogelio Bernal Andreo tutorial):

1. Duplicate the image (call it `mask_source`).
2. Apply `HDRMultiscaleTransform` with layers 6 to `mask_source` — this compresses the bulge so the StarMask routine doesn't treat the bulge as one giant star.
3. Run `StarMask` on `mask_source` with parameters approximately:
   - Noise threshold: 0.15
   - Scale: 5
   - Small-scale: 1
   - Compensation: 2
   - Smoothness: 5–8
   - Aggregate: checked
   - Binarize / Contour: experiment per data
   - Midtones (output): 0.25
4. Inspect the mask. Refine by tweaking noise threshold (lower = more faint stars caught) and small-scale (higher = larger stars caught).
5. Optionally subtract a galaxy/range mask (`mask_star - mask_range`) so the bulge pixels aren't included.

### 5.4 Morphological Transformation — the workhorse star reducer

Rogelio Bernal Andreo's `deepskycolors.com` tutorial on morphological star reduction is the canonical reference:

- Process: `MorphologicalTransformation`
- Operator: **"Morphological Selection"** (NOT plain Erosion — Erosion always wins against smaller features and produces hard, square-ish star cores). Morphological Selection blends erosion with dilation based on a selection parameter.
- Selection: 0.20–0.30 (lower = more erosion-like, stronger reduction).
- Structuring element: **circular**, 5 × 5.
- Iterations: 1 (rarely 2).
- Amount: 0.5–0.7.
- Apply **through your star mask**.
- Optionally follow with a small `AtrousWaveletTransform` boost on layer 1 (bias +0.3) to give the reduced stars back a little definition.

This works very well on M31 fields because most stars are point-like, similar in size, and the technique reduces them all uniformly.

### 5.5 Mirach: special treatment

Mirach is not just a big star — it's bright enough to produce a true reflection halo from internal lens surfaces, and to bloom into a non-Gaussian disk. Star reduction won't clean this up. The classic PixInsight halo recipe (the digitalstars.wordpress.com tutorial):

1. Read the X/Y coordinates of the halo's left/right/top/bottom edges from the Readout panel.
2. Create a duplicate image of the same dimensions.
3. PixelMath formula on RGB/K:
   `iif(sqrt((x()-(R+L)/2)^2 + (y()-(B+T)/2)^2) < (R-L)/2, 1, 0)`
   with symbols `L, R, T, B` set to the measured coords.
4. Apply `Convolution` with σ ≈ 15–25 px on the resulting binary disk to soften edges.
5. Use the softened disk as a mask on the main image.
6. Apply `HistogramTransformation`: drag the black point right (and/or the midpoint right) inside the masked region until the halo fades to background.

Apply with a light hand or you'll create a dark hole where Mirach used to be. A more modern, gentler approach: apply Curves transformations through the same mask, with a downward pull in the highlights region (not the shadows).

### 5.6 Star colour preservation

Star reduction via Morphological Selection tends to desaturate stars (the dilation step "leaks" inward the average colour). To preserve star colour:

- Run star reduction on the L channel only (decompose RGB → L*ab, reduce on L, recombine).
- Or boost saturation of the star mask area afterwards via `CurvesTransformation` in S mode masked to stars.

### 5.7 What you CAN'T do without StarXTerminator (and shouldn't fake)

- True star removal for separate "starless" processing. Old workflows used to do this with iterated Morphological Erosion + Convolution, but the results were poor and posterized. Accept that for 2013-era data you process galaxy + stars together and use masks rather than separation.

---

## 6. Companion galaxies — M32 and M110

Both M32 and M110 sit within ~1° of M31's centre and at 50 mm will be small but resolved.

- **M32** — bright (mag 8.1), compact, elliptical, only ~25′ south of the M31 nucleus. On a 50 mm APS-C frame at ~24 arcsec/px, M32 is ~20 px across — a tight blob.
- **M110** — fainter (mag 8.5), much more diffuse, ~35′ NW of nucleus. Larger angular size (~22′ × 11′) so a more obvious extended object.

### 6.1 The risk

`HDRMultiscaleTransform` and `LocalHistogramEqualization` are not target-aware. They see bright structures and compress them. M32, being a bright compact bulge, looks to HDRMT exactly like a small M31 nucleus. Apply HDRMT without M32 in the mask and **M32 will be crushed to a dim blob** while M31 looks great.

### 6.2 The fix — extend the mask

When building the galaxy range mask:

- Use Range Selection with the lower bound set so that M110's diffuse halo is included (this typically means a lower threshold, ~0.05–0.08 above background).
- Verify by previewing the mask — M32 and M110 should both appear as bright regions, not as background.
- If the range mask doesn't pick up M110 cleanly because it's so diffuse, paint it in manually using `Clone Stamp` or build a soft mask via PixelMath with a circular kernel centred on M110.

### 6.3 Process passes — M32 needs its own HDR

Apply a *light* second HDRMT pass through a mask covering just M32, layers 8, lightness mask, 1 iteration — just enough to take the edge off its tiny "core" so it doesn't look like a punctuation mark.

### 6.4 Dust lane in M110

M110 has a faint dust lane structure of its own. At 50 mm focal length you will not resolve it. Don't try.

### 6.5 Other companions in a wide field

NGC 147 and NGC 185 (both dwarf spheroidals, ~7° N of M31) — at 50 mm they may or may not be in the frame depending on rotation. If they are, they're tiny mag-9 smudges easily lost in star clouds. Worth checking by plate-solving the master and overlaying the catalogue.

---

## 7. Wide-field considerations at 50 mm

### 7.1 The geometry

- 50 mm + APS-C (Canon 60D, crop 1.6, sensor 22.3 × 14.9 mm) → ~25.5° × 17° field.
- M31's angular size is ~3° × 1° (visible bulge+disk), or ~3.5° including the faint outskirts.
- M31 occupies ~12 % of the long axis and ~6 % of the short axis = ~1 % of the frame area. Visually it'll be a small bright structure, not the dominant subject.

### 7.2 Implications for processing

**More stars, smaller galaxy:**

- Tens of thousands of star detections per sub. `StarAlignment` will work fine but takes longer.
- Star colour and shape dominate the aesthetic.
- M31 is a small target in a big field — you'll be tempted to crop later. Plan acquisition / processing to keep the surrounding star field clean; consider 1:1 vertical or square framing for the final crop.

**Less core resolution:**

- ~22 arcsec/px (calculated as 206265 × sensor_pixel_pitch_µm / focal_length_mm = ~22 for 60D's 4.3 µm pixels at 50 mm; actually closer to 17.7 for 60D's true 4.3 µm pitch — verify with your data via SCP plate solve, but the order of magnitude is right).
- M31's nucleus is < 1 arcsec. It's a sub-pixel point source. The core's *intensity* is the issue, not its resolution — there's nothing structural to "bring out" at 50 mm.
- Dust lanes: M31's main inner dust lanes are ~30–60 arcsec wide → only 2–3 px wide on the sensor. **Fine-detail tools will be working at the pixel scale**, which means almost all "detail" you see is noise enhancement. Don't push high-frequency sharpening.

**More sky background per galaxy pixel:**

- A given exposure receives sky background photons proportional to area. Your "galaxy" pixels at 50 mm have many fewer galaxy photons per pixel than at 500 mm, while sky photon count per pixel scales with f-ratio and exposure (same for any focal length).
- At 50 mm f/1.8, sky background per pixel is very high. The wide-field signal-to-noise on the galaxy disk is therefore worse than the integration time suggests.
- This is the single biggest reason why wide-field M31 looks "thin" compared to long-focal-length M31. Push the stretch and the noise floor comes up to meet you.

### 7.3 Star alignment quirks at wide field

- Field rotation across 25° at low-latitude dark sites can produce uneven star elongation across the field even on a polar-aligned mount, if there's any drift.
- `StarAlignment` should use Polynomial degree 2 + distortion correction (for a 50 mm lens it's a meaningful correction).
- Use `LocalNormalization` before `ImageIntegration` to flatten frame-to-frame illumination differences (it helps a lot at wide field where flats are typically absent).

### 7.4 Coma in the corners (fixed at capture)

f/1.8 50 mm primes (the Canon 50/1.8 II or Yongnuo) have substantial coma below f/2.8. If the data was taken at f/1.8 or f/2, the corner stars will be flared. Software cannot restore symmetry. Choices:

- Crop the corners.
- Apply `MorphologicalTransformation` selectively to the corners (mask via PixelMath gradient mask) — this evens out the *size* but not the *shape* of the comatic stars.
- Live with it.

---

## 8. Light pollution and gradients without flats

At a rural dark site, Bortle 3 (rural-dark) is realistic; Bortle 2 is possible at especially good hilltop locations. Even so:

- At f/1.8 + 240 s + ISO 1600, sky background per sub will be substantial. A useful sanity check: the background ADU of a sub should be roughly 1/3 to 1/2 of full well. If it's ~5 % of full well you were under-exposing for the sky; if it's > 60 % you're sky-limited and 240 s is too long.
- Wide-field at 50 mm means **vignetting is severe**. Cheap fast primes show 1–2 stops of corner falloff wide open. Without flats, this becomes a giant bowl-shaped gradient in the master.

### 8.1 DynamicBackgroundExtraction (DBE) — the rescue tool

DBE is your primary line of defence:

1. Open `DynamicBackgroundExtraction` on the linear master (post-integration, pre-stretch).
2. **Don't auto-place points** with M31 in the frame — the auto-placement will put points on the galaxy. Manually place a sparse grid (10–15 points), all on clean sky, well away from M31, Mirach's halo, and the Milky Way's diffuse glow (which crosses the M31 region).
3. Function degree: **1 or 2** for vignetting (4-corner falloff). Higher degrees overfit and create artifacts.
4. Smoothing factor: **0.5–1.0**.
5. Correction: **Subtraction** for gradient-removal (not Division — Division is for synthetic flats and only when the master genuinely has multiplicative vignetting that can be modelled).
6. Tolerance: 0.5–1.0. Default is usually fine.
7. Apply, then **inspect**. The before/after of the background should show a flatter, more uniform sky with M31 untouched.

Repeat **2 or 3 times** with a fresh, sparser set of points each time. After two passes, place very few points (5–6) just at the corners and edges to catch any residual.

### 8.2 ABE (AutomaticBackgroundExtraction) — supplementary

`AutomaticBackgroundExtraction` is faster but riskier with M31 in the frame because its sample selection algorithm can include galaxy pixels. Use it only after DBE, with `Box size` = ~5–10 and `Function degree` = 1, to mop up residual gradients. Disable on the first pass.

### 8.3 MultiscaleGradientCorrection (newer, ~PixInsight 1.8.9+)

`MultiscaleGradientCorrection` (MGC) and its predecessor `MultiscaleMedianTransform`-based gradient removal can flatten complex gradients without manual point-placement. For a wide-field M31 with vignetting + light-pollution gradient, MGC works very well. Use the `Structure protection` option to avoid eating into M31 itself.

### 8.4 Light pollution colour cast

DSLR data often has a non-neutral background even after gradient removal (a yellow/brown cast from sodium, or magenta from broadband LED). Order of operations:

1. DBE (or MGC).
2. `BackgroundNeutralization` (with a sky preview box).
3. `PhotometricColorCalibration`.
4. (Stretch.)
5. (`SCNR` to kill any residual green.)

### 8.5 The unavoidable consequence of no flats

Even with DBE, you cannot perfectly recover small-scale structure that flats would have caught — dust motes ("dustmotes"), corner pixel-level vignetting, the slight asymmetry of the lens's exit pupil. These will show up as faint blotches in deep stretches. If you see donut-shaped or oddly placed dim spots in the background, they're dust motes; clone them out with the `Clone Stamp` process or mask them out of subsequent stretching.

---

## 9. Low frame count (24) — what to expect and what not to push

### 9.1 Where the SNR sits

S/N improvement from stacking ≈ √N. For N = 24, that's 4.9× improvement over a single sub. By contrast, a "modern" deep M31 with 100 subs gets 10×, and the well-known long-integration showpieces with 600+ subs get 24× or more. You have roughly half the S/N of a comparable 100-sub stack.

At 240 s × ISO 1600 × f/1.8 over 96 minutes total, the disk of M31 should be well above noise, but the outer faint plumes and the H-α-shifted HII regions will be near the noise floor.

### 9.2 What this means for processing

**Hard ceiling on stretch:**

There's a point in stretching where every further pull amplifies background noise more than it amplifies signal. With 24 subs you hit that ceiling earlier. The visible symptom is **blotchy, non-Gaussian-looking background**. When you see it, stop.

A useful technique:

- After your initial non-linear stretch, draw a 200 × 200 px preview on a clean sky area.
- Use Statistics: standard deviation should be small compared to median. If σ/median > ~0.15–0.20 in the sky preview, you've stretched past where the data supports.

**Aggressive noise reduction is your friend, with caveats:**

For pre-StarXTerminator/NoiseXTerminator data, the noise-reduction stack is:

- **MultiscaleLinearTransform** (MLT) on the **linear** master, mostly on chrominance, layers 1–4, small reductions (0.5–2.0).
- **TGVDenoise** on the L channel of CIE Lab, in linear stage. Recommended starting params: Strength 1.5–3.0, Edge protection 1e-3, Smoothness 2, Iterations 100, with `Local support` mask via a luminance mask so the bright parts are protected from over-smoothing. (See Jon Rista's noise-reduction guide on `jonrista.com`.)
- **ACDNR** for chrominance smoothing on the non-linear image.
- A second pass of TGV or MLT chrominance on the stretched image if needed.

If you have access to a NoiseXTerminator licence (released later than your data, but applicable to it now), use it cautiously — strength 0.5–0.7. Aggressive AI denoise hallucinates structure on low-S/N inputs.

**Stop pushing the outer arms:**

The outer arms and faint plumes of M31 require deep integration to show without noise. With 24 × 240 s you will get the bright disk well and the inner faint disk OK; **don't try to bring out the outer plumes** — they'll come up only as noise.

### 9.3 Sub-rejection is double-edged

When you have 100 subs, throwing out the worst 10 % is great. When you have 24, throwing out 10 % is throwing out 2 subs out of 24 — a noticeable S/N hit. Be conservative with rejection:

- Use `SubframeSelector` to *weight* subs (so good ones contribute more), but **only reject** subs that are genuinely unusable (clouds, satellite trails through the galaxy, badly tracked).
- Don't reject for FWHM unless the bad sub's FWHM is > 1.5× the median.

### 9.4 Drizzle integration — probably not worth it here

Drizzle helps when you have enough subs and small enough dithering. With 24 subs and probably modest dithering, drizzle's benefits are limited. It will, however, increase processing time substantially. Skip it for the first pass; consider it on a second pass if you have time and the data was well-dithered.

---

## 10. Proposed processing order for this specific dataset

Tailored to: 24 × 240 s, ISO 1600, 60D, 50 mm wide-open-ish, no flats, no shorter exposures for HDR, Bortle 3.

### Linear stage

1. **Calibrate** with darks + bias (you have these per your description? if not, use a DSLR dark library and CFA-bias subtraction — outside the scope here).
2. **CFA debayer** with the WBPP defaults (VNG or LRGB).
3. **Cosmetic correction** for hot pixels (CosmeticCorrection with auto-detect, k-sigma ~3).
4. **StarAlignment**: Polynomial degree 2, distortion correction ON (50 mm is wide enough that linear alignment will leak in the corners).
5. **LocalNormalization** (master frame = median sub) — important because you have no flats.
6. **ImageIntegration**:
   - Combination: Average.
   - Normalization: Local normalization (just computed) or "Additive with scaling".
   - Rejection: Winsorized Sigma Clipping (24 frames is on the edge for this; if rejection rates look weird use Linear Fit Clipping).
   - Weights: from `SubframeSelector` (FWHM × eccentricity × SNR-weight composite).
7. **DynamicBackgroundExtraction** ×2 with manual point placement; subtraction; degree 1–2; smoothing ~0.5.
8. **BackgroundNeutralization** with sky preview box.
9. **PhotometricColorCalibration** (or SPCC) with M31 as target.
10. **SCNR** Remove Green default.
11. **Linear noise reduction**:
    - MLT linear chrominance: layers 1–3, biases ~ −0.5 to −2.
    - TGVDenoise L channel via luminance mask.
12. **Optional**: deconvolution. At 50 mm wide-open with coma in the corners, deconvolution rarely helps and often hurts. Skip unless your central FWHM is small and clean.

### Non-linear stage

13. **MaskedStretch** (Target background 0.10–0.12) **OR** `GeneralizedHyperbolicStretch` carefully tuned.
14. **Verify**: histogram of stretched master, sky-preview standard deviation, no clipped highlights other than the (already-clipped) nucleus and Mirach.
15. Build masks:
    - `StarMask` (with HDRMT-pre-flattened source).
    - Range Mask for galaxy (low ~0.10, high 1, smoothness 3) — extend to include M32 and M110.
    - "Galaxy-only" mask = range − star.
    - "Dark structures" mask via `DarkStructureEnhance` extract.
16. **HDRMultiscaleTransform** through galaxy-only mask: layers 10, iterations 1, lightness mask, to lightness. Second pass at layers 6 if needed, more lightly.
17. **LocalHistogramEqualization** ×2 through galaxy-only mask:
    - Pass 1: scale 40, contrast limit 1.5, strength 0.25.
    - Pass 2: scale 150, contrast limit 1.5, strength 0.35.
18. **Optional DarkStructureEnhance** (Amount 0.2–0.3) for an extra dust-lane lift.
19. **CurvesTransformation** through galaxy mask: lift midtones, slight S-curve for contrast.
20. **CurvesTransformation** through galaxy mask in S (saturation) mode: ~+10–15.
21. **Star treatment**:
    - Apply star mask.
    - `MorphologicalTransformation` Morphological Selection, 0.25, circular 5×5, amount 0.6, 1 iteration.
    - **Special pass for Mirach halo** via PixelMath circular mask + soft Curves pull on highlights in that mask.
22. **Background**:
    - Apply inverted galaxy mask (background-only mask).
    - `ACDNR` or another light noise pass on chrominance.
    - Slight black-point pull on the inverted mask to darken sky without crushing it — leave the background measurably above zero (sky median around 0.05–0.08 looks natural).
23. **Companions check**: confirm M32 and M110 are still visible and not crushed. If M32 looks like a dot, repeat step 16 with mask carefully covering M32.
24. **Final colour**:
    - `ColorSaturation` per-hue: nudge red (HII knots, if visible) and blue (arms) up slightly.
    - Hue tweak if star colours look wrong.
25. **Final crop**: square-ish, M31 slightly off-centre toward Mirach for compositional balance; crop the worst comatic corners.
26. **Final output**: 16-bit TIFF for archive, JPEG for sharing.

### What to NOT do

- Don't run `HDRMultiscaleTransform` without a mask.
- Don't try to recover the clipped nucleus.
- Don't push the outer plumes (you don't have the integration).
- Don't apply heavy sharpening at 50 mm — there's no resolved structure to sharpen.
- Don't oversaturate (especially blue).
- Don't trust auto-DBE-point placement with M31 in the frame.
- Don't skip `BackgroundNeutralization` before PCC.

---

## Sources

- [Light Vortex Astronomy — M31 Andromeda Galaxy DSLR PixInsight Tutorial](https://www.lightvortexastronomy.com/tutorial-example-m31-andromeda-galaxy---dslr.html)
- [Light Vortex Astronomy — Producing an HDR Image](https://www.lightvortexastronomy.com/tutorial-producing-an-hdr-image.html)
- [Light Vortex Astronomy — Reducing Light Pollution, Removing Gradients, Artificial Flattening](https://www.lightvortexastronomy.com/tutorial-reducing-light-pollution-effects-removing-gradients-and-artificial-flattening.html)
- [Light Vortex Astronomy — Enhancing Feature Contrast](https://www.lightvortexastronomy.com/tutorial-enhancing-feature-contrast.html)
- [PixInsight forum — New post-processing example: M31 Andromeda Galaxy from a DSLR](https://pixinsight.com/forum/index.php?threads/new-post-processing-example-m31-andromeda-galaxy-from-a-dslr.9163/)
- [PixInsight — Messier 31 H-alpha Processing Notes (Continuum subtraction HDR)](https://pixinsight.com/examples/M31-Ha/)
- [PixInsight — Multiscale Gradient Correction tutorial](https://pixinsight.com/tutorials/multiscale-gradient-correction/)
- [PixInsight — Dynamic Range and Local Contrast (NGC 7023 HDR tutorial; principles apply)](https://pixinsight.com/tutorials/NGC7023-HDR/)
- [PixInsight — Deconvolution and Noise Reduction Example with M81/M82](https://pixinsight.com/examples/M81M82/)
- [Astrodoc (Ron Brecher) — M31, the Andromeda Galaxy (2023)](https://astrodoc.ca/m31-2023/)
- [Deep Sky Colors (Rogelio Bernal Andreo) — Star size reduction via Morphological Transformations](https://deepskycolors.com/tools-tutorials/star-size-reduction-via-morphological-transformations/)
- [Deep Sky Colors — HDR Composition with PixInsight](https://deepskycolors.com/tools-tutorials/hdr-composition-with-pixinisght/)
- [Deep Sky Colors — Messier 31 Andromeda Galaxy](http://www.deepskycolors.com/archivo/2008/08/27/messier-31--Andromeda-Galaxy.html)
- [Adam Block Studios — PixInsight Horizons](https://www.adamblockstudios.com/categories/pixinsight_horizons)
- [Nebula Photos (Nico Carver) — M31 with only a Camera, Lens & Tripod](https://www.nebulaphotos.com/resources/m31/)
- [AstroBackyard — Essential Andromeda Galaxy Image Processing Tutorial](https://astrobackyard.com/andromeda-galaxy-tutorial/)
- [AstroBackyard — Best Image of the Andromeda Galaxy Yet](https://astrobackyard.com/best-andromeda-galaxy-image/)
- [AstroBackyard — Unmodded DSLR Test (California Nebula, H-alpha comparison)](https://astrobackyard.com/unmodded-dslr-test-california-nebula/)
- [BBC Sky at Night Magazine — How to photograph the Andromeda Galaxy with a DSLR](https://www.skyatnightmagazine.com/astrophotography/astrophoto-tips/how-photograph-andromeda-galaxy-dslr-camera)
- [BBC Sky at Night Magazine — Processing the Andromeda Galaxy in Photoshop](https://www.skyatnightmagazine.com/astrophotography/astrophoto-tips/andromeda-galaxy-photoshop-processing)
- [Galactic Hunter — The Andromeda Galaxy (1000-hour tips)](https://www.galactic-hunter.com/post/m31-the-andromeda-galaxy)
- [Cosgrove's Cosmos — M31 LHaRGB 6 hours reprocess](https://cosgrovescosmos.com/projects/m31-lhargb-reprocess)
- [Cosgrove's Cosmos — Messier 31 with M32 and M110](https://cosgrovescosmos.com/projects/m31-m32-m110)
- [Cosgrove's Cosmos — Using Masks as a SUPERPOWER in PixInsight](https://cosgrovescosmos.com/tips-n-techniques/masks-asa-auperpower-in-pi)
- [Linda's Astronomy Adventures — M31: The Reprocessing (OSC)](https://lindasastronomyadventures.space/2019/02/08/m31-the-reprocessing/)
- [Digital Stars — How to eliminate star halos in PixInsight](https://digitalstars.wordpress.com/2019/10/27/tutorial-how-to-eliminate-star-halos-in-pixinsight/)
- [PhotographingSpace — Quick Tip: Remove Ugly Star Halo Color](https://www.photographingspace.com/star-halo/)
- [Jon Rista — PixInsights: DynamicBackgroundExtraction](https://jonrista.com/the-astrophotographers-guide/pixinsights/dynamicbackgroundextraction/)
- [Jon Rista — PixInsight Tips: Effective Noise Reduction Part 2](https://jonrista.com/the-astrophotographers-guide/pixinsights/effective-noise-reduction-part-2/)
- [RC-Astro — NoiseXTerminator 2 / AI3 User Manual (PixInsight)](https://www.rc-astro.com/noisexterminator-2-ai3-user-manual-pixinsight/)
- [NightPhotons — Multiscale Gradient Removal guide](https://www.nightphotons.com/guides/multiscale-gradient-removal/)
- [Chaotic Nebula — PixInsight Luminance Workflow](https://chaoticnebula.com/pixinsight-luminance-workflow/)
- [Chaotic Nebula — How to Use PixInsight Dynamic Background Extraction](https://chaoticnebula.com/pixinsight-dynamic-background-extraction/)
- [Astro Guide Starlust — Local Histogram Equalization reference](https://astroguide.starlust.de/html/LocalHistogramEqualization.html)
- [Astrophotons — Andromeda Galaxy: How to Photograph with a DSLR](https://astrophotons.com/andromeda-galaxy)
- [Astrophotons — PixInsight Background Extraction](https://astrophotons.com/pixinsight-remove-gradients-background-extraction)
- [GHS Astro — Generalized Hyperbolic Stretch documentation](https://www.ghsastro.co.uk/doc/tools/GeneralizedHyperbolicStretch/GeneralizedHyperbolicStretch.html)
- [GitHub — mikec1485 GHS PixInsight script/module](https://github.com/mikec1485/GHS)
- [Remote Astrophotography — Generalized Hyperbolic Stretch Script for PixInsight v2.1+](https://remoteastrophotography.com/generalized-hyperbolic-stretch-script-for-pixinsight-version-2-1/)
- [SEDS — NGC 206 Starcloud in M31](http://www.messier.seds.org/more/m031_n206.html)
- [Sky & Telescope — NGC 206 and Star Clouds in M31](https://skyandtelescope.org/online-gallery/ngc-206-and-star-clouds-in-m31/)
- [arXiv 1108.4044 — A New Catalog of HII Regions in M31](https://arxiv.org/pdf/1108.4044)
- [AstroBin — Andromeda Galaxy Widefield M31 M32 M110 200mm (G. R. Santos)](https://www.astrobin.com/232387/C/)
- [AstroBin — M31 (50mm & ASI120MC) by Jesco](https://www.astrobin.com/7gu3l0/C/)
- [AstroBin — M31 Andromeda Canon 60D 400mm SW Adventurer ISO 1600 by Patrick Cartou](https://www.astrobin.com/dmmp1q/B/)
- [LifePixel — Canon DSLR H-Alpha Conversion service (background on H-α DSLR sensitivity)](https://www.lifepixel.com/shop/our-services/h-alpha-camera-conversion/canon-dslr-h-alpha-camera-conversion)
- [StarTools — Recommended ISO for DSLR cameras](https://www.startools.org/links--tutorials/starting-with-a-good-dataset/recommended-iso-for-dslr-cameras)
- [YouTube — PixInsight Tutorial: How to remove or reduce halos around bright stars](https://www.youtube.com/watch?v=gNpOCYiD1RI)
- [YouTube — Cuiv The Lazy Geek: Process M31 in just 10 minutes](https://www.youtube.com/watch?v=QSupE-iEyF0)
- [YouTube — Processing the M31 Galaxy in PixInsight in 15 minutes](https://www.youtube.com/watch?v=5hy2J4IadHY)
- [YouTube — Nico Carver: Andromeda Galaxy with only a Camera, Lens & Tripod — Part 2c PixInsight](https://www.youtube.com/watch?v=fVypsS-dBy0)
- [YouTube — PixInsight Tutorial: Andromeda Galaxy (M31) Processing Workflow](https://www.youtube.com/watch?v=_53MvnD1sL4)
- [YouTube — Processing the Andromeda Galaxy: PixInsight Walkthrough with Commentary](https://www.youtube.com/watch?v=JWJxwlluFiU)
- [YouTube — Local Histogram Equalization in PixInsight](https://www.youtube.com/watch?v=hTW3KM8hccw)
