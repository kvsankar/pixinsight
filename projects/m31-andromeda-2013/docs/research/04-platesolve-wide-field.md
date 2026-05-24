# Plate-solving ultra-wide DSLR images (25 deg FOV, M31, 50 mm) in PixInsight

Scope: ImageSolver v6.4.1 failing with "Failed to perform the initial field
alignment" / RANSAC "Unable to find a valid set of star pair matches" on a
5167x3444 Canon 60D + 50 mm f/1.8 frame centred on M31. Putative matches are
being found (199, 392, 1134, 1896 across retries) but RANSAC rejects all of
them. Coordinates, focal length and pixel size are correct.

This file focuses on root cause and fixes; see `01-general-pipeline.md` for
overall WBPP context.

---

## TL;DR - top 3 ranked actions

1. **Switch projection to Stereographic** and re-run ImageSolver (most likely
   to unblock RANSAC). At 25 deg FOV with f/1.8 coma the gnomonic (TAN)
   projection plus a low-order distortion polynomial cannot reconcile real
   star positions with catalogue positions, so RANSAC keeps rejecting the
   putative pairs as outliers even when 1000+ candidates exist. Also enable
   `Distortion correction` (thin plate splines) with `Distortion order >= 3`
   and bump `Maximum Distortion` from 25 to ~50.
2. **Bypass PixInsight and solve with Astrometry.net (nova or local) or
   ASTAP**, then import the WCS into the PixInsight FITS header. Both tools
   are designed for blind / very-wide solves and routinely succeed on 50 mm
   DSLR frames where ImageSolver fails. Workflow below.
3. **Use ManualImageSolver as a one-time bootstrap**: identify 5-8 stars by
   eye against a CatalogStarGenerator synthetic field, get a coarse WCS,
   then re-run ImageSolver with `Only apply optimisation` to refine. This
   is the documented PixInsight fallback for exactly this failure mode
   ("noise, low SNR, lack of enough stars, or heavy distortions").

If you want one thing to try first: **#1 (Stereographic + distortion
correction)**. It takes 30 seconds and addresses the most probable root
cause (projection-induced residuals exceeding RANSAC's inlier tolerance).

---

## 1. Why ImageSolver fails on 25 deg fields even with putative matches

### 1a. The projection is the wrong shape for the sky

PixInsight ImageSolver defaults to a **gnomonic (TAN) projection**. Gnomonic
is the standard for narrow-field deep-sky work because it maps great circles
to straight lines and is fast, but its distortion grows as `tan(theta)` from
the optical axis. At 12.5 deg from centre (your corners) the projection
itself introduces multiple-pixel deviations between the linear WCS model
and the true catalogue positions.

PixInsight's own documentation and the chaoticnebula.com walkthrough both
say the same thing: "Gnomonic (default) is effective and fast, but may
struggle with excessive edge distortion. Stereographic is a good option for
handling distortion in very wide fields of view (approaching 90 deg and
beyond)." The Reference Documentation `Projections.html` page lists
Stereographic as the recommended projection for mosaics and wide fields.

For 25 deg FOV with f/1.8 prime-lens coma layered on top, the residuals
from a TAN-only model will substantially exceed RANSAC's per-star tolerance
(a few arcsec of equivalent pixel error). RANSAC therefore reports each
sample set as having too few inliers and declares no consensus, even though
many of the candidates are in fact correct matches. This matches your
observed behaviour: it finds 1134/1896 putative matches yet still fails to
build a valid set.

### 1b. Mirach (mag 2.07) is wrecking star detection locally

A naked-eye-bright star inside an unbinned 5167x3444 DSLR frame produces a
huge saturated core, a long diffraction/glare halo, and (with f/1.8) a
coma-stretched ghost. PixInsight's star detector treats those bright pixels
as a star structure - or worse, as several adjacent structures - and:

- inflates the detected centroid away from the true catalogue position
- generates many phantom "stars" from halo speckle that have no catalogue
  counterpart
- consumes RANSAC's budget on near-Mirach false matches

Forum discussions (CloudyNights, AstroBin) note that bright saturated stars
breaking ImageSolver is a recurring failure mode; the standard advice is
either to mask the bright star out before solving, or to use a tool that
is less sensitive to single-star pathologies (Astrometry.net + downsample).

### 1c. f/1.8 prime coma magnifies the projection residual

The 50 mm f/1.8 is famous for soft, comatic corners. Off-axis stars are
elongated and shifted by a wavelength- and angle-dependent amount.
ImageSolver fits a polynomial / thin-plate-spline distortion model *after*
the linear projection step. With default settings it only models distortion
during the optimisation pass, not the initial RANSAC pass. So your initial
RANSAC is being asked to fit `TAN + small linear` to data that needs
`Stereographic + 3rd-order TPS`.

### 1d. PPMXL local index may be too coarse at this scale

PPMXL with automatic limit magnitude in the PixInsight bundle is fine for
narrow fields but at 17.8 arcsec/pixel many catalogue stars fall within
one pixel of each other, causing duplicate-match ambiguity. Several
PixInsight forum threads on wide-field failures recommend switching the
catalogue to **Gaia DR3 (online via VizieR)** with a manually set limit
magnitude around 11-12 to thin the catalogue to one star per ~3 pixels,
which makes triangle matching far more discriminating.

---

## 2. Concrete ImageSolver settings to try (in order)

Run after each change; if it succeeds, stop.

### Attempt A - "Right projection + right distortion"

In Image Plate Solver, expand Advanced parameters:

- `Projection`: **Stereographic** (not Gnomonic)
- `Distortion correction`: **enabled**
- `Distortion order`: **3** (or 4)
- `Distortion model`: **Thin plate splines** (default; keep)
- `Maximum Distortion`: bump from default 25 -> **50**
- `Sensitivity`: lower to **0.3** (forces detection on brighter, sharper
  cores - reduces coma-affected faint stars polluting the match)
- `Noise reduction`: **0** (it blurs centroids)
- `Hot pixel filter radius`: **1** if there are obvious hot pixels in the
  RAW; otherwise 0
- `Star sensitivity` / `restrictToHQStars`: **enabled** with **HQ** stars
  prioritised - you already tried this; keep enabled but combine with the
  projection change
- `tryExhaustiveInitialAlignment`: **disabled** (it was burning 10 minutes
  for no reason - the problem isn't the search radius, it's the model)
- Catalogue: switch from PPMXL to **Gaia DR3 (XPSD or online)** with
  `Automatic limit magnitude` **OFF** and a manual limit of **11.5**

### Attempt B - "Mask Mirach"

If Attempt A still fails, the bright-star pathology is dominating. Either:

- Create a circular mask covering ~200-300 px radius around Mirach,
  invert it, and apply it to a *copy* of the image to use solely for
  solving (`PixelMath: image * (1 - mask)`). Solve the masked copy, then
  transfer the resulting WCS keywords back to the original via FITSHeader.
- Or use `Crop` to remove the corner region containing Mirach for the
  solve only, solve, then propagate the WCS back to the uncropped frame
  using PixInsight's `CoordinatesFromImage`/`AlignByCoordinates` chain.

This is the "solve a clean subset, propagate" idea your question raised.
It works because the WCS is anchored on the centre + linear scale + a
distortion model, all of which can be derived from any sufficiently large
contiguous region of the frame. The Cloudy Nights "Pixinsight plate solving
and PCC on a crop" thread confirms this approach succeeds when full-frame
solving fails.

### Attempt C - "Bootstrap with ManualImageSolver, then optimise"

If Attempts A and B both fail, fall back to manual:

1. Run `Script > Render > CatalogStarGenerator` with the same centre RA/Dec
   and the actual scale (17.8 arcsec/pixel, 5167x3444). Choose
   Stereographic projection. This produces a synthetic catalogue image.
2. Open both the synthetic image and your DSLR image. Use
   `Process > Geometry > DynamicAlignment` to place 6-8 well-separated
   control points - obvious bright stars around the frame, avoiding
   Mirach and the worst coma corners. The first 2-3 are the hard ones;
   afterwards DynamicAlignment will auto-suggest the rest.
3. Save the DynamicAlignment instance as a process icon.
4. Run `Script > Image Analysis > ManualImageSolver` and point it at
   your DSLR image and the saved DynamicAlignment instance. It writes a
   WCS to the FITS header.
5. Re-run `ImageSolver` with **`Only apply optimisation`** ticked. This
   refines the coarse manual solution using the full star list with
   higher-order distortion, producing a final accurate WCS.

The "Only apply optimisation" path is documented as the standard recovery
for cases where the initial alignment is the only thing failing - which is
exactly your symptom.

---

## 3. External tool route - Astrometry.net or ASTAP

When PixInsight cannot solve a wide field, the community consensus
(CloudyNights, Stargazers Lounge, APT forum) is to bypass it. Both options
below succeed on 50 mm DSLR frames where ImageSolver chokes.

### 3a. Astrometry.net (recommended for blind / pathological cases)

Astrometry.net is the gold standard for wide-field DSLR plate solving. It
is robust to bright stars, missing data, coma, and lens distortion because
it builds its index from invariant 4-star asterisms rather than fitting a
projection up front.

**Web (nova.astrometry.net):**

1. Downsample the image first - either save as a 1920px JPEG, or use the
   site's built-in `downsample_factor=2` or `4`. Their docs state
   downsampling "helps with saturated images, noisy images, and large
   images" - a perfect description of your frame.
2. Upload via https://nova.astrometry.net/upload .
3. Set advanced options:
   - Scale units: `arcsecperpix`
   - Scale lower / upper: **15 - 20** (your computed scale is 17.8)
   - Centre RA / Dec: `10.6843 / 41.2691`, radius: `5` degrees
   - Downsample: `2` or `4`
   - Tweak order: `3` (polynomial distortion order)
4. After it solves (typically <60 s) download `wcs.fits` and `new-image.fits`
   from the results page.

**API (for scripting / batches):**

POST to `http://nova.astrometry.net/api/upload` (multipart) or
`/api/url_upload`. Pass `scale_units=arcsecperpix`, `scale_lower=15`,
`scale_upper=20`, `center_ra=10.6843`, `center_dec=41.2691`, `radius=5`,
`downsample_factor=4`, `tweak_order=3`. Poll job status, then GET
`http://nova.astrometry.net/wcs_file/<JOBID>`.

**Local (ansvr / installed astrometry.net):**

Equivalent command line:

```
solve-field --scale-units arcsecperpix --scale-low 15 --scale-high 20 \
            --ra 10.6843 --dec 41.2691 --radius 5 \
            --downsample 4 --tweak-order 3 \
            --no-plots --overwrite mybigimage.fits
```

You will need the wide-field index files. For ~25 deg fields use the
`4200-series` indexes (skymark diameters 1400-2000 arcmin). Local solve on
a 16 GB machine completes in 5-30 s.

### 3b. ASTAP (also good, faster, slightly more fragile)

ASTAP is a single-binary plate solver popular with NINA/APT users. For
your FOV:

- Download and install the **V17 star database** (large-FOV variant). The
  H17/H18 databases used for narrow-field work are wrong here - they cover
  too small a sky tile. ASTAP will warn "Large FOV, use V17 database" if
  you forget.
- In ASTAP GUI: Alignment > set `Hash code tolerance` to **0.01** (default
  0.007 is too tight for distorted optics), `Search radius` 180 deg for
  blind solve, or constrain to your known RA/Dec with a small radius.
- Use **2x2 binning** when calling ASTAP - reported on the ASTAP forum to
  raise success rate to ~88% on 50 mm DSLR frames.
- Ensure ASTAP >= 0.9.570; earlier versions had a bug picking H17/H18
  even when V17 was selected for wide FOVs.

ASTAP outputs a `.wcs` file alongside the input.

Community verdict (CloudyNights, APT forum): "ASTAP is great when it works,
but it seems much more fragile than Astrometry.net... every version of
files plate-solves with Astrometry.net even when ASTAP fails." For this
particular pathological frame, prefer Astrometry.net first.

### 3c. Importing the external WCS into PixInsight

The wcs.fits or .wcs sidecar file contains only the WCS header keywords.
You need them inside *your* image's FITS header so PixInsight scripts that
depend on a solved image (Annotation, PhotometricColorCalibration, etc.)
will work.

Two options:

**Option 1 - astrometry.net's `new-image.fits`.** Download the modified
FITS that astrometry.net produces; it already contains your image data
plus the WCS keywords. Open it in PixInsight; the WCS is in the header.
Done. (This is the easiest path. Only catch: nova flattens to greyscale
unless you upload a colour FITS; if you care about colour, use Option 2.)

**Option 2 - Transfer keywords with PixInsight's FITSHeader tool.**

1. Open both the externally solved image (or the wcs.fits) and your
   original Canon DSLR FITS in PixInsight.
2. `Process > FITSHeader` on the solved image. Note/copy the keywords:
   `CTYPE1, CTYPE2, CRPIX1, CRPIX2, CRVAL1, CRVAL2, CD1_1, CD1_2, CD2_1,
   CD2_2, RADESYS, EQUINOX`, plus any SIP `A_*, B_*, AP_*, BP_*` distortion
   keywords if astrometry.net wrote them.
3. Open `FITSHeader` on the target original image and paste-add each of
   those keywords with their values from step 2.
4. Save. The original FITS now carries the astrometry.net astrometric
   solution and all downstream PixInsight scripts will see it as solved.

The PixInsight forum thread "Import WCS solution from Astrometry.net into
FTS header" (topic 16424) walks through this exact procedure.

**Caveat about distortion encoding:** astrometry.net uses SIP keywords
for distortion; PixInsight's native ImageSolver uses its own
`POLYNOMIAL_*` / spline storage. Modern PixInsight reads SIP correctly for
annotation/PCC; if a particular script complains, re-run ImageSolver with
`Only apply optimisation` after transferring the linear WCS - it will
re-derive PixInsight-format distortion using the WCS as a seed.

---

## 4. Things that *probably won't* fix this (so don't waste time)

- Raising `tryExhaustiveInitialAlignment` to true. You already burnt 10
  minutes; the search-space problem is not what is failing here.
- Trying lower and lower `brightThreshold`. You already iterated 15 -> 8000
  stars; more stars means more outliers, not better RANSAC convergence,
  when the projection is wrong.
- Switching PPMXL -> Tycho2. Tycho is too shallow (mag 11 max) for
  17.8 arcsec/pixel images; you get too few catalogue stars to triangulate.
- Increasing `Noise reduction` filter radius. It blurs star centroids and
  worsens the RANSAC residual.
- StarAlignment with a synthetic reference. Different process, won't help
  - StarAlignment also fails on wide-field non-linear images for the same
  projection-residual reason.

---

## 5. Recommended decision tree

```
1. Try Stereographic + distortion order 3 + Maximum Distortion 50
   |-- success -> done
   |-- fail   -> 2
2. Crop or mask out the Mirach region, re-run with same settings
   |-- success -> propagate WCS back, done
   |-- fail   -> 3
3. Submit to nova.astrometry.net with scale 15-20 arcsec/pix,
   centre RA/Dec, downsample 4, tweak-order 3
   |-- success -> download new-image.fits OR transfer WCS keywords, done
   |-- fail   -> 4
4. ManualImageSolver bootstrap (CatalogStarGenerator + DynamicAlignment
   + ManualImageSolver), then ImageSolver "Only apply optimisation"
   |-- success -> done
   |-- fail   -> the image isn't solvable; check focus/tracking/clouds
```

In practice steps 1 and 3 between them solve essentially every wide-field
DSLR case reported on the PixInsight forum, CloudyNights and Stargazers
Lounge. Step 3 has the highest absolute success rate; step 1 is fastest if
it works.

---

## Sources

- [PixInsight - New Plate Solving Distortion Correction Algorithm](https://pixinsight.com/tutorials/solver-distortion/)
- [PixInsight Forum - Wide field image plate solving not really working](https://pixinsight.com/forum/index.php?threads/wide-field-image-plate-solving-not-really-working.19853/)
- [PixInsight Forum - Persistent problem RANSAC unable to find a valid set of star pair matches](https://pixinsight.com/forum/index.php?threads/persistent-problem-ransac-unable-to-find-a-valid-set-of-star-pair-matches.24692/)
- [PixInsight Forum - Process for wide field DSLR alignment to Stargen reference](https://pixinsight.com/forum/index.php?topic=12427.0)
- [PixInsight Forum - Import WCS solution from Astrometry.net into FITS header](https://pixinsight.com/forum/index.php?threads/import-wcs-solution-from-astrometry-net-into-fts-header.16424/)
- [PixInsight Reference Documentation - Projections](https://pixinsight.com/doc/docs/Projections/Projections.html)
- [PixInsight Reference - ImageSolver.pidoc on GitHub](https://github.com/PixInsight/Reference-Documentation/blob/master/scripts/ImageSolver/ImageSolver.pidoc)
- [Chaotic Nebula - PixInsight Image Solver Usage and Troubleshooting Guide](https://chaoticnebula.com/pixinsight-image-solver/)
- [MyPetStars - ImageSolver Process in PixInsight: Introduction & Troubleshooting](https://mypetstars.com/tutorials/pixinsight/scripts/imagesolver)
- [CloudyNights - Problems plate solving wide angle shots with ASTAP](https://www.cloudynights.com/forums/topic/784809-problems-plate-solving-wide-angle-shots-with-astap/)
- [CloudyNights - PI warning RANSAC Unable to find a valid set of star pair matches](https://www.cloudynights.com/topic/895863-pi-warning-in-script-image-analysis-ransac-unable-to-find-a-valid-set-of-star-pair-matches/)
- [CloudyNights - PixInsight plate solving and PCC on a crop](https://www.cloudynights.com/topic/906666-pixinsight-plate-solving-and-pcc-on-a-crop/)
- [CloudyNights - PixInsight fails to platesolve Milky Way Widefield image](https://www.cloudynights.com/topic/939569-pixinsight-fails-to-platesolve-milky-way-widefield-image/)
- [CloudyNights - Having repeated issue with Image Solver in PI](https://www.cloudynights.com/topic/955729-having-repeated-issue-with-image-solver-in-pi/)
- [Stargazers Lounge - Plate solving in PixInsight](https://stargazerslounge.com/topic/259202-plate-solving-in-pixinsight/)
- [SourceForge - ASTAP forum: Problems with plate solving wide angle images](https://sourceforge.net/p/astap-program/discussion/general/thread/2f6dd9d096/)
- [SourceForge - ASTAP forum: very wide field vs long focal length](https://sourceforge.net/p/astap-program/discussion/general/thread/f74eac3f78/)
- [ASTAP main site](https://www.hnsky.org/astap.htm)
- [Nova Astrometry.net upload](https://nova.astrometry.net/upload)
- [Astrometry.net API documentation](http://astrometry.net/doc/net/api.html)
- [solve-field manpage on Debian](https://manpages.debian.org/testing/astrometry.net/solve-field.1.en.html)
- [Astrometry.net techniques and tips - scivision.dev](https://www.scivision.dev/astrometry-tips-techniques/)
- [APT Forum - PixInsight ImageSolver](https://aptforum.com/phpbb/viewtopic.php?t=6027)
- [Sequence Generator Pro forum - Plate solving with a 50mm lens](https://forum.sequencegeneratorpro.com/t/plate-solving-image-with-a-50mm-lens/14029)
