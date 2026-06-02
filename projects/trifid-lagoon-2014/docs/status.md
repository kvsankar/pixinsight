# Trifid / Lagoon 2014 Processing - Status

**As of:** 2026-05-30 IST, final v1 has been exported from the March 2014 no-dark/no-flats branch, and a separate BXT/NXT retrofit candidate has been generated.
**Pipeline progress:** 100%, final v1 complete. The BXT/NXT output is a review candidate for a possible future v2, not required to finish this target.

For the accepted result, see [Final v1](final-v1.md).
For the proposed workflow, see [Processing pipeline](pipeline.md).
For the review branch comparison, see [Review checkpoint](review-2026-05-27.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [Trifid / Lagoon processing research](research/01-trifid-lagoon-processing.md).
For historical local artifacts, see [Original 2014 processing evidence](original-2014-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE FOR MAY AND MARCH BASELINES
PHASE 2 - Linear post-integration                  COMPLETE FOR MAY AND MARCH BASELINES
PHASE 3 - Nonlinear processing/export              FINAL V1 COMPLETE + BXT/NXT REVIEW CANDIDATE
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | Lagoon Nebula / M8 / NGC 6523 and Trifid Nebula / M20 wide field |
| Dates found | 2014-03-02 and 2014-05-04 |
| Camera | Canon EOS 60D |
| Optic | Likely ES ED80 with reducer; EXIF `50.0 mm` is probably unreliable, as seen in other telescope sessions |
| Main exposure pattern | 120s, ISO 1600 |
| Main goal | Produce a believable wide-field Sagittarius result with M8, M20, dark lanes, and Milky Way context |
| Historical reference | `docs/images/original-2014-attempt-02-asraw-ps-2.jpg`, copied from the 2014 attempt-02 processing folder |
| Current result | `docs/images/trifid-lagoon-20140302-final-v1.jpg`; BXT/NXT candidate at `docs/images/trifid-lagoon-20140302-bxt-nxt-v1.jpg` |
| Current blocker | None; BXT/NXT candidate needs taste review before any v2 promotion |

## Why The May Folder Is Suffixed `-2`

The local `by-date` archive contains two Trifid/Lagoon collections:

| Folder | Role |
| --- | --- |
| `by-date/20140302-coorg-keemale-trifid-lagoon` | Earlier Trifid/Lagoon session with old stacking/processing artifacts and the finished-work JPEG |
| `by-date/20140504-yelagiri-kairos-trifid-lagoon-2` | Later Trifid/Lagoon session with a cleaner raw-only structure |

No non-suffixed `20140504-yelagiri-kairos-trifid-lagoon` sibling was found. The best current explanation is that `-2` marks the May folder as the second Trifid/Lagoon collection in the archive, not a second part of the same night. This is plausible but not proven without your memory or external notes.

## Candidate Light Sets

| Candidate | Frames | Exposure | Temp | Decision |
| --- | ---: | ---: | --- | --- |
| `20140504-yelagiri-kairos-trifid-lagoon-2/good` | 39 CR2 | 120s ISO 1600 | +31 to +34 C | May comparison baseline |
| `20140504-yelagiri-kairos-trifid-lagoon-2/bad/smudged` | 6 CR2 | 120s ISO 1600 | around +33 C | Reject initially |
| `20140504-yelagiri-kairos-trifid-lagoon-2/bad/trailing` | 2 CR2 | 120s ISO 1600 | around +33 C | Reject initially |
| `20140504-yelagiri-kairos-trifid-lagoon-2/bad/washed-out` | 2 CR2 | 120s ISO 1600 | around +34 C | Reject initially |
| `20140504-yelagiri-kairos-trifid-lagoon-2/trial-shots` | 41 CR2 | mostly 10s ISO 6400 | mixed | Reject from main integration |
| `20140302-coorg-keemale-trifid-lagoon/good` | 38 CR2 | 120s ISO 1600 | +24 to +30 C | Final v1 source branch |
| `20140302-coorg-keemale-trifid-lagoon/twilight/better` | 4 CR2 | 120s ISO 1600 | not reviewed | Skip unless needed for context |
| `20140302-coorg-keemale-trifid-lagoon/twilight/worse` | 2 CR2 | 120s ISO 1600 | not reviewed | Reject initially |
| `20140302-coorg-keemale-trifid-lagoon/washed-out` | 4 CR2 | 120s ISO 1600 | not reviewed | Reject initially |
| `20140302-coorg-keemale-trifid-lagoon/trial-shots` | 6 CR2 | mixed short tests | mixed | Reject from main integration |

Estimated usable light time:

| Session | Subs | Total |
| --- | ---: | ---: |
| May 2014 primary | 39 x 120s | 78 min |
| March 2014 comparison | 38 x 120s | 76 min |
| Combined only after master-level registration | 77 x 120s | 154 min |

Do not combine March and May raw frames in one WBPP run unless a later test proves the framing, sky gradients, and calibration behave well. The safer plan is separate integrations, then register solved masters if a blend is useful.

## Calibration Inventory

| Calibration source | Candidate use | Caveat |
| --- | --- | --- |
| `dark/canon-eos-60d/library-02/120s-1600iso/33c` | May 120s ISO1600 dark support | 5 CR2; close to many May lights |
| `dark/canon-eos-60d/library-02/120s-1600iso/34c` | May 120s ISO1600 dark support | 10 CR2; close to late May lights |
| `dark/canon-eos-60d/library-02/120s-1600iso/35c` | May dark comparison only | 8 CR2; may overcorrect cooler frames |
| `dark/canon-eos-60d/library-02/120s-1600iso/36c` | May dark comparison only | 7 CR2; likely too warm for most lights |
| `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` | ED80/reducer-era flat test branch | 48 CR2, ISO 200, 1/3200s; not same night as May |
| `flat/20140302-rosette-m81-m82-markarian/1by2500s/set-1` | Secondary flat test branch | 16 CR2, ISO 200, 1/2500s; likely less robust |
| Bias / dark flats | None found in this pass | Flat branches are diagnostic unless supporting calibration is found |

Current calibration recommendation:

1. Run May primary with 33 C and 34 C darks, no flats.
2. Run a May no-dark/no-flat control only if the dark-calibrated master shows overcorrection.
3. Reject the tested 2014-03-02 flat branch for this target run; it introduced obvious flat mismatch/banding.
4. Keep March lights as a separate branch rather than raw-combining with May. The final v1 result uses the March no-dark/no-flats branch.

## Decisions So Far

- Created project scaffold: `projects/trifid-lagoon-2014/`.
- Copied the old finished-work JPEG into `docs/images/original-2014-finished-work.jpg` for public, compressed visual comparison.
- Copied the stronger 2014 attempt-02 references into `docs/images/original-2014-attempt-02-asraw-ps-2.jpg` and `docs/images/original-2014-attempt-02-asraw-ps.jpg`. The `asraw-ps-2` JPEG is the reference matching the user-supplied image.
- Selected the May `good` folder as the first baseline because it is cleanly curated and raw-only.
- Kept the March `good` folder as a separate branch because it has a historical result and similar framing, but different temperature and older processing artifacts.
- Decided not to use the May `bad`, `trial-shots`, or washed/trailing/smudged buckets in the first WBPP run.
- Identified the 2014-03-02 flat set as a test candidate, not a default calibration dependency.
- Corrected the initial optics assumption: the EXIF `50.0 mm` value is likely wrong for these telescope frames. Use an ED80-with-reducer solve guess first.
- Ran `wbpp-20140504-good-dark33-34-noflats` with 39 May lights and 15 matching 33/34 C darks. WBPP completed and produced autocropped and uncropped master lights.
- Rendered the WBPP linked-STF preview. It showed M8/M20 at ED80/reducer scale and a strong pre-calibration green cast.
- Ran Phase 2 on the autocropped May master: ABE, ImageSolver, SPCC, SCNR, and MLT linear noise reduction all completed.
- Plate solving confirmed the ED80/reducer interpretation: 386.21 mm focal distance, 2.302 arcsec/px, 3d 18' 16.0" x 2d 11' 58.4" field of view.
- Ran and rendered an SPCC no-background-neutralization comparison. Under linked STF it is harsher/darker and greener around the nebulae, so the default SPCC+BN branch remains the preferred linear checkpoint for now.
- Ran a first nonlinear branch in `work/03-nonlinear-20140504-may-v1/`: MaskedStretch followed by `scripts/pjsr/03t-trifid-lagoon-v1-polish.js`.
- Exported the first May-only v1 presentation candidate. It is cleaner and more restrained than the old 2014 JPEG, with less cyan/magenta sky push, but also darker and less dramatic.
- Ran brighter May old-reference variants. They improved brightness and color depth but remained too conservative/dark compared with the historical attempt-02 result.
- Ran a March flat/no-dark WBPP diagnostic with the 2014-03-02 flat set. The linked-STF preview showed severe flat mismatch and banding, so the flat branch is rejected.
- Ran a March no-dark/no-flats WBPP branch with 38 x 120s ISO1600 lights. This is now the preferred March baseline.
- Ran Phase 2 on the March no-dark/no-flats master. The first solve needed a denser target-star limit and deeper catalog magnitude; the successful solve used targetMax 5000, maxBox 120, and magnitude 10.0.
- Plate solving confirmed the ED80/reducer interpretation for March as well: 386.21 mm focal distance, 2.302 arcsec/px, 3d 19' 27.5" x 2d 12' 39.9" field of view.
- Ran no-ABE and ABE-divide diagnostics on the March master. No-ABE retained unacceptable vignetting/field gradient, and ABE-divide produced severe green/chroma artifacts. The subtractive ABE Phase 2 branch remains the best technical baseline.
- Exported two March review candidates: a balanced `march-oldref-polish` version and a brighter/more saturated `march-oldref-vivid` version.
- Tried final passes from the vivid candidate, but they pushed the Lagoon core and red star field too hard for a final.
- Promoted the cleaner March polish branch into final v1 with `scripts/pjsr/03t-trifid-lagoon-final-v1.js`, using restrained sky/star color calming and no extra star reduction.
- Exported final v1 JPEG/TIFF/XISF and a four-panel comparison image.

## Residual Questions

These are optional v2 directions, not blockers for final v1:

1. Would a manual DBE/MGC branch preserve more real Sagittarius background without keeping vignetting?
2. Would a very subtle starless workflow let the nebulae lift without making the dense star field too busy?
3. Is a registered March/May master blend worth testing after the single-session result is complete?

## Outputs

| Output | Status |
| --- | --- |
| `docs/images/original-2014-finished-work.jpg` | Historical reference copied |
| `docs/images/original-2014-attempt-02-asraw-ps-2.jpg` | Stronger historical attempt-02 reference matching the user-supplied image |
| `docs/images/original-2014-attempt-02-asraw-ps.jpg` | Alternate attempt-02 historical reference |
| `work/wbpp-20140504-good-dark33-34-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf` | May WBPP baseline master |
| `docs/images/trifid-lagoon-20140504-wbpp-linked-stf.jpg` | Linked-STF preview of WBPP master |
| `work/02-linear-20140504-good-dark33-34-noflats/02e-linear-nr.xisf` | Current May Phase 2 linear checkpoint |
| `docs/images/trifid-lagoon-20140504-phase2-linear-linked-stf.jpg` | Linked-STF preview of current linear checkpoint |
| `work/02-linear-20140504-good-dark33-34-noflats/02c-spcc-no-bn.xisf` | SPCC no-background-neutralization diagnostic |
| `docs/images/trifid-lagoon-20140504-spcc-no-bn-linked-stf.jpg` | Linked-STF preview of SPCC no-BN diagnostic |
| `work/03-nonlinear-20140504-may-v1/03a-maskedstretch.xisf` | First nonlinear stretch checkpoint |
| `docs/images/trifid-lagoon-20140504-maskedstretch-v1.jpg` | JPEG preview of the stretch checkpoint |
| `work/03-nonlinear-20140504-may-v1/03t-v1-polish.xisf` | May-only v1 polished XISF |
| `work/03-nonlinear-20140504-may-v1/trifid-lagoon-20140504-v1-polish.tif` | May-only v1 TIFF export |
| `docs/images/trifid-lagoon-20140504-v1-polish.jpg` | May-only v1 JPEG candidate for review |
| `docs/images/trifid-lagoon-20140504-v2-oldref-polish.jpg` | Brighter May old-reference comparison |
| `docs/images/trifid-lagoon-20140504-v3-oldref-lift.jpg` | Brightest May old-reference comparison |
| `work/wbpp-20140302-good-flat-nodark-test/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf` | March flat/no-dark diagnostic master, rejected visually |
| `docs/images/trifid-lagoon-20140302-wbpp-flat-nodark-linked-stf.jpg` | Rejected March flat diagnostic preview |
| `work/wbpp-20140302-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf` | March no-dark/no-flats WBPP baseline master |
| `docs/images/trifid-lagoon-20140302-wbpp-nodark-noflats-linked-stf.jpg` | March no-dark/no-flats WBPP preview |
| `work/02-linear-20140302-good-nodark-noflats/02e-linear-nr.xisf` | March preferred Phase 2 linear checkpoint |
| `docs/images/trifid-lagoon-20140302-phase2-linear-linked-stf.jpg` | March preferred Phase 2 linked-STF preview |
| `docs/images/trifid-lagoon-20140302-phase2-noabe-linear-linked-stf.jpg` | No-ABE diagnostic preview, rejected for vignetting/gradient |
| `docs/images/trifid-lagoon-20140302-abe-divide-linked-stf.jpg` | ABE divide diagnostic preview, rejected for green/chroma artifacts |
| `work/03-nonlinear-20140302-march-oldref/03t-march-oldref-polish.xisf` | March balanced old-reference polish XISF |
| `work/03-nonlinear-20140302-march-oldref/trifid-lagoon-20140302-march-oldref-polish.tif` | March balanced old-reference polish TIFF |
| `docs/images/trifid-lagoon-20140302-march-oldref-polish.jpg` | March balanced old-reference polish JPEG |
| `work/03-nonlinear-20140302-march-oldref/03t-march-oldref-vivid.xisf` | March brighter old-reference vivid XISF |
| `work/03-nonlinear-20140302-march-oldref/trifid-lagoon-20140302-march-oldref-vivid.tif` | March brighter old-reference vivid TIFF |
| `docs/images/trifid-lagoon-20140302-march-oldref-vivid.jpg` | March brighter old-reference vivid JPEG |
| `work/03-nonlinear-20140302-final-v1/03t-trifid-lagoon-20140302-final-v1.xisf` | Final v1 XISF |
| `work/03-nonlinear-20140302-final-v1/trifid-lagoon-20140302-final-v1.tif` | Final v1 TIFF export |
| `docs/images/trifid-lagoon-20140302-final-v1.jpg` | Final v1 JPEG |
| `docs/images/trifid-lagoon-2014-final-v1-comparison.jpg` | Four-panel reference/review/final comparison |
