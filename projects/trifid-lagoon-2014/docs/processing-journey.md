# Trifid / Lagoon 2014 Processing Journey

This is the chronological project log. It records decisions, false starts, and review questions so later processing branches remain understandable.

## 2026-05-27 - Inventory And Plan

Started from the user-provided archive folder:

```text
by-date/20140504-yelagiri-kairos-trifid-lagoon-2
```

Searched the `by-date` archive for related folders and found another Trifid/Lagoon collection:

```text
by-date/20140302-coorg-keemale-trifid-lagoon
```

This likely explains the `-2` suffix on the May folder: the archive already had a March Trifid/Lagoon session. No non-suffixed May sibling was found.

Created the project scaffold:

```text
projects/trifid-lagoon-2014
```

Inventory highlights:

- May 2014 has 39 curated `good` CR2 lights at 120s ISO1600, Canon EOS 60D, likely ES ED80 with reducer, +31 to +34 C.
- May 2014 also has rejected smudged/trailing/washed-out buckets and mostly short ISO6400 trial shots.
- March 2014 has 38 `good` CR2 lights at 120s ISO1600, Canon EOS 60D, likely ES ED80 with reducer, +24 to +30 C.
- March 2014 contains old calibrated TIFFs, stack info files, DSS/Photoshop-style processing artifacts, and the historical finished-work JPEG.
- Matching 120s ISO1600 Canon 60D darks were found only at 33 C, 34 C, 35 C, and 36 C.
- A plausible ED80/reducer-era flat set was found under `flat/20140302-rosette-m81-m82-markarian`, especially 48 frames in `1by3200s/set-2`, but it is not same-night May calibration and has no matching bias/dark-flat support yet.

Initial decision:

- Use May `good` as the first clean baseline.
- Keep March as a separate comparison/support branch.
- Test the 2014-03-02 flats only as a diagnostic branch.
- Do not combine sessions at the raw-frame stage before seeing separate masters.

Research highlights:

- M8 is dominated by emission nebulosity and a young cluster.
- M20 combines red emission, blue reflection, and dark dust lanes.
- At the likely ED80/reducer scale, M8 and M20 still share the frame but background placement is more target-sensitive; gradient correction remains the main risk.
- Corrected the initial EXIF-based optics assumption: `50.0 mm` is probably stale/unreliable metadata for this telescope setup, so Phase 2 should start near the ED80/reducer solve scale used in other projects.
- SPCC should calibrate star color with Canon EOS 60D filter names, but background neutralization needs careful review because there may be no truly clean sky in the frame.

Review questions before processing:

1. Should May be the first and only baseline, with March postponed until May is understood?
2. Do you remember whether the March flat set matches the Trifid/Lagoon ED80/reducer setup closely enough to prioritize a flat branch?
3. Should the historical JPEG guide final color/depth, or only serve as a record of what existed in 2014?
4. Do we want a natural dense-star Milky Way finish, or should star reduction/star separation be part of the first nonlinear plan?

## 2026-05-27 - May Baseline Phase 1 And Phase 2

Ran the accepted May-only baseline:

```text
wbpp-20140504-good-dark33-34-noflats
```

Inputs:

- 39 x 120s ISO1600 May `good` lights.
- 5 x 120s ISO1600 33 C darks.
- 10 x 120s ISO1600 34 C darks.
- No flats.
- No bias.

WBPP completed successfully and produced:

```text
work/wbpp-20140504-good-dark33-34-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf
work/wbpp-20140504-good-dark33-34-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB.xisf
```

Rendered the linked-STF preview:

```text
docs/images/trifid-lagoon-20140504-wbpp-linked-stf.jpg
```

The preview confirmed the user's correction: this is not a 50mm camera-lens field. M8 and M20 are framed at the same ED80/reducer-like scale seen in other projects. The preview had a strong green cast before color calibration.

Ran Phase 2 from the autocropped master:

```text
02-linear-20140504-good-dark33-34-noflats
```

Outputs:

```text
work/02-linear-20140504-good-dark33-34-noflats/02a-abe.xisf
work/02-linear-20140504-good-dark33-34-noflats/02b-solved.xisf
work/02-linear-20140504-good-dark33-34-noflats/02c-spcc.xisf
work/02-linear-20140504-good-dark33-34-noflats/02d-scnr.xisf
work/02-linear-20140504-good-dark33-34-noflats/02e-linear-nr.xisf
```

Plate solving succeeded with:

| Property | Value |
| --- | --- |
| Focal distance | 386.21 mm |
| Resolution | 2.302 arcsec/px |
| Field of view | 3d 18' 16.0" x 2d 11' 58.4" |
| Image center | RA 18 05 51.892, Dec -23 32 28.27 |
| Rotation | -96.582 deg |

SPCC completed with Canon EOS 60D R/G/B filters and background neutralization enabled. The linked-STF Phase 2 preview is:

```text
docs/images/trifid-lagoon-20140504-phase2-linear-linked-stf.jpg
```

Also ran a no-background-neutralization SPCC diagnostic:

```text
work/02-linear-20140504-good-dark33-34-noflats/02c-spcc-no-bn.xisf
docs/images/trifid-lagoon-20140504-spcc-no-bn-linked-stf.jpg
```

Initial visual read: the default SPCC+BN/SCNR/MLT checkpoint is cleaner and more balanced under linked STF. The no-BN comparison has a darker sky but harsher color behavior around the nebulae, so it is retained as a diagnostic, not the preferred baseline.

## 2026-05-27 - May-Only V1 Candidate

Created the first nonlinear May-only branch:

```text
work/03-nonlinear-20140504-may-v1
```

First, ran MaskedStretch from the default Phase 2 linear checkpoint:

```text
work/03-nonlinear-20140504-may-v1/03a-maskedstretch.xisf
docs/images/trifid-lagoon-20140504-maskedstretch-v1.jpg
```

The stretch was an honest baseline: natural, dark, not overcooked, and already showing M8, M20, dark lanes, and the rich Sagittarius star field.

Added a target-specific polish script:

```text
scripts/pjsr/03t-trifid-lagoon-v1-polish.js
```

The v1 polish applies restrained low-sky chroma cleanup, protected red/blue nebula color lift, mild local contrast, and a small final curves adjustment. It avoids the M31/Rosette target scripts because this field needs a wide-field Milky Way treatment, not galaxy enhancement or aggressive red-emission remixing.

Outputs:

```text
work/03-nonlinear-20140504-may-v1/03t-v1-polish.xisf
work/03-nonlinear-20140504-may-v1/trifid-lagoon-20140504-v1-polish.tif
docs/images/trifid-lagoon-20140504-v1-polish.jpg
```

Initial visual read against the old 2014 finished-work JPEG:

- The new v1 candidate is cleaner, darker, and more restrained.
- The old 2014 result is brighter and more dramatic, with stronger pink/cyan color, but also stronger background/color imbalance.
- M20's blue reflection and dark lanes are visible in v1.
- M8's bright core and surrounding red emission are present, but the result is deliberately not pushed as hard as the old JPEG.
- The next tuning choice is taste-driven: accept the cleaner restrained baseline, make a brighter old-reference branch, or run March/flats support before final polish.

## 2026-05-27 - Historical Attempt-02 Reference

After the user pointed to the older processing folder, copied two attempt-02 reference JPEGs:

```text
docs/images/original-2014-attempt-02-asraw-ps-2.jpg
docs/images/original-2014-attempt-02-asraw-ps.jpg
```

The `asraw-ps-2` image is the stronger match to the user-supplied reference: bright field, magenta/pink M8, blue/red M20, and a warmer Sagittarius background. It is a better historical target than the smaller filtered finished-work copy.

This changed the comparison goal. The May v1 candidate was technically clean, but it did not carry the brightness or color depth of the old attempt. Two May old-reference variants were exported:

```text
docs/images/trifid-lagoon-20140504-v2-oldref-polish.jpg
docs/images/trifid-lagoon-20140504-v3-oldref-lift.jpg
```

Visual read: the May old-reference variants moved in the right direction but still looked too dark/conservative. The March data was therefore worth processing as a first-class comparison branch, not just a future support idea.

## 2026-05-27 - March Diagnostics And Review Candidates

First tested the plausible March flat set against the March lights:

```text
work/wbpp-20140302-good-flat-nodark-test
docs/images/trifid-lagoon-20140302-wbpp-flat-nodark-linked-stf.jpg
```

Visual result: rejected. The linked-STF preview showed obvious flat mismatch and banding, so those flats should not be used for this Trifid/Lagoon path without a better calibration explanation.

Then ran the March no-dark/no-flats branch:

```text
work/wbpp-20140302-good-nodark-noflats
docs/images/trifid-lagoon-20140302-wbpp-nodark-noflats-linked-stf.jpg
```

Inputs:

- 38 x 120s ISO1600 March `good` lights.
- No darks, because the March lights are cooler than the available 33 to 36 C dark library.
- No flats, because the tested flat branch was visibly wrong.

Ran Phase 2:

```text
work/02-linear-20140302-good-nodark-noflats
docs/images/trifid-lagoon-20140302-phase2-linear-linked-stf.jpg
```

The first plate solve attempt was too strict for this dense, slightly messy DSLR field. The successful solve used:

```text
targetMax=5000
maxBox=120
magnitude=10.0
```

Successful solve details:

| Property | Value |
| --- | --- |
| Focal distance | 386.21 mm |
| Resolution | 2.302 arcsec/px |
| Field of view | 3d 19' 27.5" x 2d 12' 39.9" |
| Image center | RA 18 04 14.158, Dec -23 43 56.44 |
| Rotation | -93.225 deg |

Two background diagnostics were tried after noticing that the old attempt-02 image retained a broad Milky Way glow:

```text
docs/images/trifid-lagoon-20140302-phase2-noabe-linear-linked-stf.jpg
docs/images/trifid-lagoon-20140302-abe-divide-linked-stf.jpg
```

Both were rejected. The no-ABE branch retained unacceptable vignetting/field gradient, and the ABE-divide test produced severe green/chroma artifacts. The subtractive ABE branch remains the best technical March baseline despite being cleaner/darker than the old Photoshop-era result.

Created two March nonlinear review candidates from the accepted subtractive-ABE Phase 2 checkpoint:

```text
docs/images/trifid-lagoon-20140302-march-oldref-polish.jpg
docs/images/trifid-lagoon-20140302-march-oldref-vivid.jpg
```

Visual read:

- `march-oldref-polish` is the cleaner/balanced candidate.
- `march-oldref-vivid` is the brighter, warmer, more old-reference-like candidate.
- Both are closer to the user-supplied 2014 attempt-02 reference than the May candidates.
- Neither should be pushed further blindly; the next step is human review of taste: old-reference energy versus modern PixInsight cleanliness.

## 2026-05-27 - Final V1

The next decision was to finish the target rather than start a new one.

Created a finalizer script:

```text
scripts/pjsr/03t-trifid-lagoon-final-v1.js
```

The script applies a restrained nonlinear finishing pass: low-sky chroma calming, mild star-field red cleanup, small nebula-protected color support, and optional TIFF/JPEG export.

First tried promoting the brighter `march-oldref-vivid` branch. Two variants were exported during testing, but visually they pushed the Lagoon core and the red/orange star field too hard. Those draft JPEGs were not kept as documentation outputs.

The accepted final v1 instead starts from the cleaner `march-oldref-polish` XISF and applies only a minimal final balance. This keeps the image less theatrical than the 2014 attempt-02 reference, but more controlled and believable from the raw data.

Final outputs:

```text
work/03-nonlinear-20140302-final-v1/03t-trifid-lagoon-20140302-final-v1.xisf
work/03-nonlinear-20140302-final-v1/trifid-lagoon-20140302-final-v1.tif
docs/images/trifid-lagoon-20140302-final-v1.jpg
docs/images/trifid-lagoon-2014-final-v1-comparison.jpg
```

Visual read:

- Final v1 preserves M20's blue/red split and dust lanes better than the pushed vivid tests.
- M8 remains red/pink with a bright core, but avoids the most washed-out vivid-branch look.
- The Sagittarius star field remains dense; no star-reduction pass was accepted for v1.
- The old 2014 reference remains brighter and more magenta/warm, but some of that character appears tied to gradient/vignetting and older color handling.
