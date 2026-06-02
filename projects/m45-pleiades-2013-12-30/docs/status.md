# M45 / Pleiades 2013-12-30 Processing - Status

**As of:** 2026-05-30 IST, the primary dark-calibrated branch has completed WBPP, Phase 2, the M45-specific nonlinear v1 polish, a v2 portrait crop, and a separate conservative BXT/NXT retrofit candidate. A no-dark WBPP control was also run and rejected as the baseline.
**Pipeline progress:** 93%, v2 crop and BXT/NXT crop review candidates exported. Remaining work is human review and optional final brightness/color refinement.

For the proposed workflow, see [Processing pipeline](pipeline.md).
For the review checkpoint, see [Review checkpoint](review-2026-05-27.md).
For the chronological reasoning log, see [Processing journey](processing-journey.md).
For target-specific research, see [M45 / Pleiades processing research](research/01-m45-pleiades-processing.md).
For historical local artifacts, see [Original 2013 processing evidence](original-2013-processing.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration                COMPLETE FOR PRIMARY + NO-DARK CONTROL
PHASE 2 - Linear post-integration                  COMPLETE FOR PRIMARY
PHASE 3 - Nonlinear processing/export              V2 CROP + BXT/NXT REVIEW CANDIDATES COMPLETE
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | M45 / Pleiades / Seven Sisters, including blue reflection nebulosity |
| Primary date found | 2013-12-30 into 2013-12-31 |
| Main source folder | `by-date/20131230-coorg-keemale-m45-pleiades/good` |
| Camera | Canon EOS 60D |
| Optic | Plate solved at 386.02 mm, consistent with the ED80/reducer-era interpretation |
| EXIF caveat | Raw EXIF says `50.0 mm` with `FNumber=0`; treat that as stale/unreliable |
| Main exposure pattern | 240s, ISO 1600 |
| Light temperature range | +27 to +31 C |
| Primary usable integration | 12 x 240s = 48 min |
| Historical reference | `docs/images/original-2013-finished-work.jpg` |
| Current result | `docs/images/m45-20131230-v2-portrait-crop.jpg`; BXT/NXT candidate at `docs/images/m45-20131230-bxt-nxt-v1-portrait-crop.jpg` |
| Current blocker | Human review of crop taste, final brightness, and whether BXT/NXT preserves reflection dust naturally |

## Archive Search Results

The local archive search used Pleiades aliases and related identifiers: `pleiades`, misspelled `pleides`, `m45`, `seven sisters`, `ngc1432`, `ngc1435`, `maia`, `merope`, and `alcyone`.

| Archive-relative path | Contents | Decision |
| --- | --- | --- |
| `by-date/20131230-coorg-keemale-m45-pleiades/good` | 12 CR2 lights, 12 historical calibrated TIFFs, DSS sidecars | Primary source |
| `by-date/20131230-coorg-keemale-m45-pleiades/trial-shots` | 7 mixed trial CR2 frames: 10s, 30s, 60s, 240s, 360s; ISO 800/1600/3200 | Exclude from primary integration |
| `by-date/20131230-coorg-keemale-m45-pleiades/stacking/attempt-01` | `Autosave.tif` and DSS HTML | Historical stacking evidence only |
| `by-date/20131230-coorg-keemale-m45-pleiades/processing/attempt-01` | JPEG/TIF/PSD outputs from old processing | Historical visual reference only |
| `finished-work/20131230-Pleiades-Cluster.jpg` | Final-looking 2013 JPEG | Copied as a compressed docs reference |
| `by-date/20130113-yelagiri-ymca-jupiter-and-pleides/lights-cr2` | 13 x 10s wide-field frames at f/1.8, mixed ISO 1600/3200 | Context/reference only; do not combine with 2013-12-30 raw data |

## Candidate Light Sets

| Candidate | Frames | Exposure | ISO | Temp | Decision |
| --- | ---: | ---: | ---: | --- | --- |
| `20131230-coorg-keemale-m45-pleiades/good` | 12 CR2 | 240s | 1600 | +27 to +31 C | Primary branch |
| `20131230-coorg-keemale-m45-pleiades/trial-shots` | 7 CR2 | mixed 10s to 360s | 800/1600/3200 | +25 to +28 C | Reject from first integration |
| `20130113-yelagiri-ymca-jupiter-and-pleides/lights-cr2` | 13 CR2 | 10s | 1600/3200 | +34 to +39 C | Separate wide-field historical/context material |

## Calibration Inventory

| Calibration source | Candidate use | Caveat |
| --- | --- | --- |
| `dark/canon-eos-60d/library-02/240s-1600iso` | Primary dark support for the 240s ISO1600 M45 lights | 9 CR2 total: +25, +28, +29, and +30 C; no +31 C darks found |
| `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` | Late diagnostic flat branch only | 48 CR2 ED80-era flats, but not same night and previously risky on other targets |
| `flat/20130211-f2.8-1by8000-1600iso` and related 2013 lens flats | Not recommended for this target | Lens-era flats do not match the solved telescope-scale optical train |
| Bias / dark flats | None found in this pass | Flat branches require extra skepticism |

Current calibration decision:

1. Keep the dark-calibrated, no-flats branch as the baseline.
2. Keep the no-dark/no-flats branch as a rejected control unless later evidence changes the calibration diagnosis.
3. Do not run the late flat diagnostic unless v2 work specifically targets vignetting/background modeling.
4. Do not use the historical `.cal.tif` files as primary PixInsight inputs.

## Decisions So Far

- Created project scaffold: `projects/m45-pleiades-2013-12-30/`.
- Copied a compressed historical finished-work reference to `docs/images/original-2013-finished-work.jpg`.
- Chose the 2013-12-30 `good` folder as the first Phase 1 source because it is curated, homogeneous, and has matching-duration dark support.
- Excluded trial shots and the January 2013 Jupiter/Pleiades wide-field session from the first integration.
- Treated EXIF `50.0 mm` as suspect. Plate solving confirmed the ED80/reducer-scale interpretation at 386.02 mm and 2.303 arcsec/px.
- Ran `wbpp-20131230-good-dark25-30-noflats` with 12 lights and 9 darks. WBPP completed with all 12 lights registered. Calibration applied automatic pedestals to the lights, which triggered the no-dark control.
- Rendered dark-calibrated WBPP linked and unlinked STF previews. The dust signal is strong, but the raw linked-STF color is very green before SPCC.
- Ran Phase 2 on the dark-calibrated master. ABE, ImageSolver, SPCC with Canon EOS 60D filters, SCNR, and MLT linear noise reduction completed.
- Plate solving succeeded with target star limiting: 2500 of 9979 stars selected. The solved center is RA 03h46m42.722s, Dec +24d06m26.79s, with a 3d17m31s x 2d12m39s field of view.
- SPCC completed with background neutralization enabled. The linear linked-STF preview became much more plausible, though the dust remained cyan/blue-green before nonlinear color shaping.
- Ran MaskedStretch at target background 0.095 and exported a restrained stretch preview.
- Added `scripts/pjsr/03p-m45-v1-polish.js` for M45-specific nonlinear finishing.
- Exported the first v1 review candidate: `docs/images/m45-20131230-v1-polish.jpg`.
- Cropped the v1 polish into the v2 portrait review candidate: `docs/images/m45-20131230-v2-portrait-crop.jpg`.
- Ran `wbpp-20131230-good-nodark-noflats-control`. It completed, but the linked-STF preview had stronger broad-field gradient and did not solve the raw green tendency, so the dark-calibrated branch remains preferred.
- Added a conservative BXT/NXT retrofit branch from the accepted pre-denoise checkpoint. The branch uses low BXT/NXT strengths to protect reflection nebulosity and exports both a full-frame polish and a portrait crop.

## Review Questions

1. Is the v2 portrait crop the preferred presentation over the wider v1 landscape frame?
2. Does the BXT/NXT portrait candidate improve the star field without making the blue dust look over-smoothed or too contrasty?
3. Is the cleaner, darker modern background preferable, or should a final pass move closer to the brighter old finished-work look?
4. Is the blue reflection dust strong enough, or should a final pass lift dust more aggressively with a stronger noise tradeoff?

## Outputs

| Output | Status |
| --- | --- |
| `docs/images/original-2013-finished-work.jpg` | Compressed historical reference |
| `work/wbpp-20131230-good-dark25-30-noflats/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf` | Primary WBPP master |
| `docs/images/m45-20131230-wbpp-dark-linked-stf.jpg` | Linked-STF preview of the primary WBPP master |
| `docs/images/m45-20131230-wbpp-dark-unlinked-stf.jpg` | Unlinked-STF diagnostic preview |
| `work/02-linear-20131230-good-dark25-30-noflats/02e-linear-nr.xisf` | Primary Phase 2 linear checkpoint |
| `docs/images/m45-20131230-phase2-abe-linked-stf.jpg` | Linked-STF preview after ABE |
| `docs/images/m45-20131230-phase2-linear-linked-stf.jpg` | Linked-STF preview after SPCC, SCNR, and MLT |
| `work/03-nonlinear-20131230-v1/03a-maskedstretch.xisf` | First nonlinear stretch checkpoint |
| `docs/images/m45-20131230-maskedstretch-v1.jpg` | JPEG preview of MaskedStretch checkpoint |
| `work/03-nonlinear-20131230-v1/03p-m45-v1-polish.xisf` | Full-frame v1 polish XISF |
| `work/03-nonlinear-20131230-v1/m45-20131230-v1-polish.tif` | Full-frame v1 TIFF export |
| `docs/images/m45-20131230-v1-polish.jpg` | Full-frame v1 JPEG review candidate |
| `work/03-nonlinear-20131230-v1/03p-m45-v2-portrait-crop.xisf` | Current v2 portrait-crop XISF |
| `work/03-nonlinear-20131230-v1/m45-20131230-v2-portrait-crop.tif` | Current v2 portrait-crop TIFF export |
| `docs/images/m45-20131230-v2-portrait-crop.jpg` | Current v2 portrait-crop JPEG review candidate |
| `work/02-linear-20131230-bxt-nxt-v1/02g-bxt-nxt.xisf` | Conservative BXT/NXT linear retrofit candidate |
| `work/03-nonlinear-20131230-bxt-nxt-v1/03p-bxt-nxt-v1-polish.xisf` | BXT/NXT v1 full-frame polish |
| `docs/images/m45-20131230-bxt-nxt-v1-polish.jpg` | BXT/NXT v1 full-frame JPEG review candidate |
| `work/03-nonlinear-20131230-bxt-nxt-v1/03q-bxt-nxt-v1-portrait-crop.xisf` | BXT/NXT v1 portrait-crop XISF |
| `docs/images/m45-20131230-bxt-nxt-v1-portrait-crop.jpg` | BXT/NXT v1 portrait-crop JPEG review candidate |
| `work/wbpp-20131230-good-nodark-noflats-control/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf` | No-dark diagnostic master |
| `docs/images/m45-20131230-wbpp-nodark-linked-stf.jpg` | No-dark diagnostic preview, rejected as baseline |
