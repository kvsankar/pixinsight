# Eta Carinae 2013-03-10 Processing - Status

**As of:** 2026-06-03 IST, this project has completed Phase 0 source inventory/research, Phase 1 120s no-dark/no-flats WBPP, Phase 2 ABE/solve/SPCC/SCNR, conservative BXT/NXT, first MaskedStretch/crop, mixed-exposure research, a partial 240s diagnostic, brighter 120s v2/v3/v4 stretch variants, Eta-specific crop polish, LLM-as-judge crop review, and an annotated orientation aid.
**Pipeline progress:** 80%, with v2/v3/v4 sibling crops available for review. The current working branch remains the 120s `good` no-dark/no-flats branch; v4 makes the nebula easiest to see but has the clearest noise tradeoff.

For the processing plan, see [Processing pipeline](pipeline.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [Eta Carinae processing research](research/01-eta-carinae-processing.md).
For historical local artifacts, see [Original 2013 processing evidence](original-2013-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE, 120S NO-DARK BASELINE
PHASE 2 - Linear post-integration                  COMPLETE FOR CURRENT BRANCH
PHASE 3 - Nonlinear processing/export              V4 EXTRA STRETCH COMPLETE
PHASE 4 - LLM-as-judge crop review                 V2 SET + V3 CORE CHECK + ANNOTATION COMPLETE
DIAGNOSTIC - 240s depth branch                     PARTIAL, WEAK
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | Eta Carinae / Carina Nebula / NGC 3372 |
| Primary date found | 2013-03-10 |
| Main source folder | `by-date/20130310-yelagiri-ymca-carinae` |
| Camera | Canon EOS 60D |
| Solved optic scale | 479.64 mm focal distance, 1.853 arcsec/px |
| EXIF caveat | Raw EXIF says `50.0 mm` and has no lens model; this was stale/unreliable |
| ISO | 1600 |
| Good light groups | 10 x 30s, 11 x 60s, 16 x 120s, 6 x 240s |
| Rejected first-pass light groups | 2 x 30s `bad-trailing`, 5 x 240s `bad-trailing` |
| Good integration if all accepted groups are later combined | 72 min |
| Current processed branch | 16 x 120s = 32 min, `120s/good` |
| Historical reference | Old DSS/Photoshop products under 60s, 120s, and 240s folders |

## Archive Search Results

The local archive search used target aliases: `eta`, `carina`, `carinae`, `ngc3372`, and `ngc-3372`.

| Archive-relative path | Contents | Decision |
| --- | --- | --- |
| `by-date/20130310-yelagiri-ymca-carinae/120s/good` | 16 CR2 lights plus old DSS/Photoshop processing artifacts | Primary branch, processed |
| `by-date/20130310-yelagiri-ymca-carinae/60s/good` | 11 CR2 lights plus old DSS/Photoshop artifacts | Shorter-exposure sibling branch |
| `by-date/20130310-yelagiri-ymca-carinae/30s` | 10 top-level CR2 lights plus JPG sidecars | Core-protection/HDR sibling branch |
| `by-date/20130310-yelagiri-ymca-carinae/240s/good` | 6 CR2 lights plus old DSS/Photoshop artifacts | Depth diagnostic; watch star trailing and saturation |
| `by-date/20130310-yelagiri-ymca-carinae/30s/bad-trailing` | 2 CR2 lights | Exclude from first integration |
| `by-date/20130310-yelagiri-ymca-carinae/240s/bad-trailing` | 5 CR2 lights | Exclude from first integration |
| `finished-work` Eta/Carina search | No matching finished-work image found | Use local processing artifacts only as historical references |

No other by-date folder matched the Eta Carinae / NGC 3372 aliases.

## Light Inventory

Good or first-pass candidate lights:

| Group | Frames | Exposure | ISO | Temp range | Stdev range | First-pass use |
| --- | ---: | ---: | ---: | --- | --- | --- |
| `120s/good` | 16 | 120s | 1600 | +29 to +32 C | 595 to 882 | Primary baseline, processed |
| `60s/good` | 11 | 60s | 1600 | +27 to +32 C | 525 to 677 | Sibling branch |
| `30s` | 10 | 30s | 1600 | +31 C | 408 to 453 | Sibling branch for core/highlights |
| `240s/good` | 6 raw, 3 accepted by WBPP | 240s | 1600 | +27 to +31 C | 630 to 735 | Depth diagnostic, weak |

Rejected light groups:

| Group | Frames | Exposure | ISO | Reason |
| --- | ---: | ---: | ---: | --- |
| `30s/bad-trailing` | 2 | 30s | 1600 | Marked bad/trailing in archive |
| `240s/bad-trailing` | 5 | 240s | 1600 | Marked bad/trailing in archive |

## Calibration Inventory

No same-session or target-named flats were found.

Dark-library candidates:

| Dark family | Count | Match quality | Candidate use |
| --- | ---: | --- | --- |
| `dark/canon-eos-60d/library-02/30s-1600iso/31c` | 20 | Excellent for 30s +31 C lights | Use for 30s sibling branch |
| `dark/canon-eos-60d/library-02/30s-1600iso/30c,32c` | 1 and 9 | Near match | Optional add-on if master dark needs more frames |
| `dark/canon-eos-60d/library-02/60s-1600iso/31c,32c,33c` | 1, 11, and 18 | Close but slightly warm for some 60s lights | Use carefully for 60s branch |
| `dark/canon-eos-60d/library-02/120s-1600iso/33c` | 5 | Exposure/ISO match, warmer than +29 to +32 C lights | Diagnostic only after no-dark 120s baseline |
| `dark/canon-eos-60d/library-02/120s-1600iso/34c-36c` | 25 total | Too warm for primary | Avoid unless a controlled diagnostic needs them |
| `dark/canon-eos-60d/library-02/240s-1600iso` | 9 | Exposure/ISO match but around +25 C and from a later date | Diagnostic only |

Current calibration decision:

1. The current lead branch is the 120s `good` no-dark/no-flats baseline.
2. Do not combine 30s, 60s, 120s, and 240s raw groups until each group has been integrated and inspected separately.
3. Keep the 120s +33 C darks as the first dark diagnostic, not the default, because they are warmer than the lights and only 5 frames.
4. Use the good 30s/60s dark matches when those sibling branches are processed.
5. Keep all old DSS/Photoshop/TIFF/JPEG products as historical references only.

## Processing Decisions So Far

- Created project scaffold: `projects/eta-carinae-2013-03-10/`.
- Confirmed the only matching by-date source folder is `20130310-yelagiri-ymca-carinae`.
- Confirmed camera via EXIF as Canon EOS 60D.
- Confirmed EXIF focal length is stale/unreliable at `50.0 mm`.
- Chose `120s/good` as the first WBPP baseline because it is the largest homogeneous deep-light group and matches the historical main processing artifacts.
- Ran Phase 1 WBPP on 16 x 120s lights with no darks, no flats, and no bias.
- Rendered linked and unlinked STF WBPP previews. Linked STF is strongly green before calibration; unlinked STF confirms useful centered Carina structure.
- Ran Phase 2 ABE, plate solve, SPCC, and SCNR.
- Plate solve succeeded at 1.853 arcsec/px, 479.64 mm focal distance, image center RA 10 44 14.153 and Dec -59 38 29.37.
- Ran conservative BXT/NXT: BXT stars 0.14, halos 0.02, nonstellar 0.12; NXT luminance 0.54, color 0.76, low-frequency conservative.
- Ran first MaskedStretch with target background 0.080.
- Created a moderate Carina-centered crop to remove the worst no-flats corners while retaining wide nebula context.
- Documented the mixed-exposure rule: integrate exposure families separately, judge them separately, and use HDRComposition-style combination only after masters are accepted.
- Ran a 240s `good` no-dark/no-flats WBPP diagnostic. WBPP accepted 3 of 6 frames, registered 3, and locally normalized 3.
- Rendered 240s linked/unlinked STF previews. The unlinked view shows broader red signal but also heavy noise/background fragility.
- Started 240s Phase 2 ABE successfully, but the 240s solve stage stalled and was stopped. This branch is not a current primary/depth master.
- Ran a brighter 120s MaskedStretch v2 with target background 0.125.
- Cropped the v2 stretch with the same Carina-centered geometry as v1.
- Added `scripts/pjsr/03eta-carinae-v2-polish.js` for restrained sky cleanup, protected red-nebula lift, local contrast, and curves on the cropped real data.
- Rendered a v2 polished crop and four judge crops: core/Keyhole, central dust, upper red nebulosity, and corner/background stars.
- Added `scripts/pjsr/03eta-carinae-v3-deeper-stretch.js` and ran it from the v2 polished crop to lift midtones and red emission further.
- Rendered a v3 deeper crop and v3 core/Keyhole judge crop. An attempted v3 corner/background judge crop left PixInsight processes behind and was stopped; the full v3 crop already shows the noise tradeoff clearly.
- Created an annotated v3 JPEG to orient the field, marking Eta Carinae, the Keyhole dark lane, Trumpler 14/16 regions, the Carina Nebula core, faint red emission, and low-contrast dust/pillar structure. This is an explanatory overlay on the real processed image, not a source-content modification.
- Ran a regular, unannotated v4 extra stretch from the v3 crop, then a protected low-sky chroma cleanup pass. V4 is the most legible nebula presentation so far, while v3 remains the cleaner/more restrained sibling.

## First Visual Read

- The 120s branch has real Carina Nebula structure and good target placement.
- The full frame is too wide and dim for presentation, with no-flats corner artifacts visible.
- The centered crop is the stronger first presentation candidate.
- The current stretch is conservative and a bit subdued; it needs contrast/color/background polish before final review.
- The dark diagnostic is still deferred because the no-dark baseline is usable enough to continue.
- The 240s diagnostic suggests the longer subs are not an easy fix for faint nebulosity: only three frames survived quality rejection, so the branch is noisy and should not be blindly combined with the 120s baseline.
- The v2 polished crop is a meaningful improvement over v1. The nebula is visible, the Keyhole/dark structure reads clearly in crops, and the full crop has better red emission.
- The v2 judge crops show the cost: upper red/background regions have chroma speckles and faint patterned texture.
- The v3 deeper stretch makes the nebula much easier to see and is the current user-facing candidate if brightness is preferred. It also makes red/blue speckles more obvious in the background.
- The v4 extra stretch reveals substantially more outer red nebulosity and makes the central complex easier to orient, but the background is visibly noisy. The cleaned v4 sibling is preferable to the raw v4 version, but both should be reviewed against v3.

## LLM-As-Judge Findings

| Crop | File | Finding |
| --- | --- | --- |
| Core / Keyhole | `docs/images/eta-carinae-20130310-v2-judge-core-keyhole.jpg` | Strongest crop. Bright core and dark structure are clear; star shapes are acceptable; red lift looks plausible. |
| Central dust | `docs/images/eta-carinae-20130310-v2-judge-central-dust.jpg` | Nebula and dust read well, with useful texture. Noise is present but not the dominant impression. |
| Upper red nebulosity | `docs/images/eta-carinae-20130310-v2-judge-upper-red-nebulosity.jpg` | Red nebulosity is present, but the crop is noisy and shows chroma speckles. |
| Corner/background stars | `docs/images/eta-carinae-20130310-v2-judge-corner-background-stars.jpg` | Background texture and red/blue speckles are visible. Stars are acceptable, but this is the limiting quality crop. |
| V3 core / Keyhole | `docs/images/eta-carinae-20130310-v3-judge-core-keyhole.jpg` | Brighter and more dramatic than v2; still acceptable in the subject area. |
| V4 full crop | `docs/images/eta-carinae-20130310-v4-extra-stretch-clean-carina-crop.jpg` | Most legible full-field nebula view so far, with obvious background/chroma noise tradeoff. |

## Review Questions

1. Does the current crop have the right framing, or should it be tighter around Eta/Keyhole?
2. Does the bright Eta/Keyhole region need 30s/60s HDR support?
3. Is the remaining background texture acceptable after crop, or does the 120s +33 C dark diagnostic deserve a run?
4. How much red emission should be lifted without making the field look artificial?
5. Should the 240s `good` group be tested for faint depth, or left aside?

## Outputs

| Output | Status |
| --- | --- |
| `projects/eta-carinae-2013-03-10/` | Project scaffold created |
| `docs/status.md` | Inventory and current state written |
| `docs/processing-journey.md` | Chronological run log written |
| `docs/pipeline.md` | Processing plan and current branch state written |
| `docs/original-2013-processing.md` | Historical artifact note written |
| `docs/research/01-eta-carinae-processing.md` | Target-specific research note written |
| `work/wbpp-20130310-120s-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB.xisf` | Phase 1 master |
| `work/wbpp-20130310-120s-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Phase 1 autocropped master used for Phase 2 |
| `docs/images/eta-carinae-20130310-wbpp-120s-nodark-linked-stf.jpg` | Phase 1 linked-STF preview |
| `docs/images/eta-carinae-20130310-wbpp-120s-nodark-unlinked-stf.jpg` | Phase 1 unlinked-STF preview |
| `work/02-linear-20130310-120s-good-nodark-noflats/02a-abe.xisf` | Phase 2 ABE output |
| `work/02-linear-20130310-120s-good-nodark-noflats/02b-solved.xisf` | Phase 2 solved output |
| `work/02-linear-20130310-120s-good-nodark-noflats/02c-spcc.xisf` | Phase 2 SPCC output |
| `work/02-linear-20130310-120s-good-nodark-noflats/02d-scnr.xisf` | Phase 2 SCNR output |
| `docs/images/eta-carinae-20130310-phase2-120s-nodark-scnr-linked-stf.jpg` | Phase 2 linked-STF preview |
| `docs/images/eta-carinae-20130310-phase2-120s-nodark-scnr-unlinked-stf.jpg` | Phase 2 unlinked-STF preview |
| `work/02-linear-20130310-120s-good-nodark-bxt-nxt/02f-bxt.xisf` | Linear BXT output |
| `work/02-linear-20130310-120s-good-nodark-bxt-nxt/02g-bxt-nxt.xisf` | Linear BXT/NXT output |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v1/03a-maskedstretch.xisf` | First nonlinear candidate |
| `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch.jpg` | Full-frame nonlinear preview |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v1/review-crops/03a-maskedstretch-carina-crop.xisf` | First crop candidate |
| `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch-carina-crop.jpg` | First crop JPEG |
| `work/wbpp-20130310-240s-good-nodark-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB.xisf` | 240s diagnostic master from 3 accepted frames |
| `docs/images/eta-carinae-20130310-wbpp-240s-nodark-linked-stf.jpg` | 240s diagnostic linked-STF preview |
| `docs/images/eta-carinae-20130310-wbpp-240s-nodark-unlinked-stf.jpg` | 240s diagnostic unlinked-STF preview |
| `work/02-linear-20130310-240s-good-nodark-noflats/02a-abe.xisf` | 240s diagnostic ABE output; solve stalled afterward |
| `scripts/pjsr/03eta-carinae-v2-polish.js` | Eta-specific nonlinear crop polish script |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/03a-maskedstretch-bright.xisf` | Brighter v2 nonlinear stretch |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03a-maskedstretch-bright-carina-crop.xisf` | Brighter v2 crop |
| `docs/images/eta-carinae-20130310-bxt-nxt-maskedstretch-bright-carina-crop.jpg` | Brighter v2 crop JPEG |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03b-polished-carina-crop.xisf` | V2 polished crop XISF |
| `docs/images/eta-carinae-20130310-v2-polished-carina-crop.jpg` | V2 polished crop JPEG |
| `docs/images/eta-carinae-20130310-v2-judge-core-keyhole.jpg` | V2 judge crop |
| `docs/images/eta-carinae-20130310-v2-judge-central-dust.jpg` | V2 judge crop |
| `docs/images/eta-carinae-20130310-v2-judge-upper-red-nebulosity.jpg` | V2 judge crop |
| `docs/images/eta-carinae-20130310-v2-judge-corner-background-stars.jpg` | V2 judge crop |
| `scripts/pjsr/03eta-carinae-v3-deeper-stretch.js` | Eta-specific stronger stretch diagnostic |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03c-v3-deeper-carina-crop.xisf` | V3 deeper crop XISF |
| `docs/images/eta-carinae-20130310-v3-deeper-carina-crop.jpg` | V3 deeper crop JPEG |
| `docs/images/eta-carinae-20130310-v3-judge-core-keyhole.jpg` | V3 judge crop |
| `docs/images/eta-carinae-20130310-v3-deeper-carina-crop-annotated.jpg` | Annotated v3 orientation JPEG |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03d-v4-extra-stretch-carina-crop.xisf` | V4 extra stretch XISF |
| `docs/images/eta-carinae-20130310-v4-extra-stretch-carina-crop.jpg` | V4 extra stretch JPEG |
| `scripts/pjsr/03eta-carinae-v4-background-cleanup.js` | V4 low-sky chroma cleanup script |
| `work/03-nonlinear-20130310-120s-good-nodark-bxt-nxt-v2/review-crops/03e-v4-extra-stretch-clean-carina-crop.xisf` | V4 cleaned extra stretch XISF |
| `docs/images/eta-carinae-20130310-v4-extra-stretch-clean-carina-crop.jpg` | V4 cleaned extra stretch JPEG |
