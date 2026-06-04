# Comet Catalina 2016-01-09 Status

## Project State

Stopped on 2026-06-04. The best 2026 branch did not match the 2016 human processing, especially in fan/tail depth and faint-star richness, so this project is being archived as a documented experiment rather than pushed further.

## Inputs

- Target: Comet Catalina, `C/2013 US10 (Catalina)`.
- Source folder: `by-date/20160109-yelagiri-ymca-comet-catalina`.
- Historical reference: `finished-work/20160109-Comet-Catalina.jpg`.
- Likely primary lights: `originals/good/star-tracking`, Canon EOS Rebel T1i, 6 x 120 s ISO1600, +25 C to +29 C.
- Other lights:
  - `originals/good/star-tracking`, Canon EOS 60D, 1 x 120 s and 2 x 300 s ISO1600.
  - `originals/good/comet-tracking`, Canon EOS 60D, 1 x 300 s ISO1600.
  - `originals`, Canon EOS 60D, 12 x 120 s ISO1600.
  - `originals/bad`, mixed rejects, 7 CR2.
- Darks: no matching T1i darks found. 60D 120 s ISO1600 darks exist at +33 C to +36 C, diagnostic only.
- Flats: `flat/20160109-yelagiri-ymca-flats/good`, 34 x T1i flat CR2 at ISO1600, same date.
- Bias/dark-flats: none found.

## Processing log

- Created project scaffold.
- Researched C/2013 US10 and PixInsight comet processing requirements before heavy processing.
- Updated `docs/new-project-playbook.md` with moving-target/comet guidance.
- Wrote project research, original-processing evidence, processing journey, and pipeline notes.
- Staged a clean T1i-only input set under `work/00-inputs/t1i-star-tracking-120s` from the mixed `originals/good/star-tracking` folder.
- Ran T1i no-dark/no-flat WBPP diagnostic:
  - Branch: `work/wbpp-t1i-120s-nodark-noflat`.
  - Result: 6/6 lights registered and integrated, 0 rejected.
  - Master: `master/masterLight_BIN-1_4770x3178_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf`.
- Ran T1i no-dark/same-date-flat WBPP diagnostic:
  - Branch: `work/wbpp-t1i-120s-nodark-flat34`.
  - Result: 34 flats matched, 6/6 lights registered and integrated, 0 rejected.
  - Masters: `master/masterFlat_BIN-1_4770x3178_FILTER-NoFilter_CFA.xisf` and `master/masterLight_BIN-1_4770x3178_EXPOSURE-120.00s_FILTER-NoFilter_RGB_autocrop.xisf`.
- Confirmed registered XISF frames retain acquisition time metadata, including `Observation:Time:Start` and `DATE-OBS`, suitable for a CometAlignment diagnostic.
- Rendered linked-STF full-frame previews and matched comet crops for the no-flat and flat34 branches.
- Preliminary visual finding: the flats do not look catastrophically wrong, but the flat34 branch suppresses the broad outer green fan in the matched no-flat-reference crop. Keep both branches until comet-aligned diagnostics decide whether this is calibration improvement or lost comet signal.
- Added reusable PJSR helpers for comet diagnostics:
  - `scripts/pjsr/locate-bright-centroid.js` to measure the comet nucleus in a bounded ROI.
  - `scripts/pjsr/comet-align-frames.js` to run PixInsight CometAlignment from a measured CSV table.
- Measured the no-flat registered-frame nucleus positions directly. The registered sequence moves smoothly from about `(2246.6, 1663.0)` to `(2215.5, 1659.4)`.
- Ran no-flat T1i CometAlignment:
  - Branch: `work/comet-align-t1i-noflat`.
  - Input: 6 registered no-flat T1i frames with measured nucleus positions and XISF `Observation:Time:Start` values.
  - Output: 6/6 comet-aligned XISF frames.
  - Verification: remeasured comet-aligned frames collapse to about `(2246.6, 1663.2)` in every frame.
- Integrated the no-flat comet-aligned frames:
  - Master: `work/comet-align-t1i-noflat/masterCometAligned_t1i_nodark_noflat.xisf`.
  - Visual finding: comet head and fan/tail are sharper, but only six frames leave small rejected-star flecks and several green residual clumps. Treat as a diagnostic, not a final product.
- Solved and color-calibrated the T1i star-aligned no-flat branch:
  - Branch: `work/02-color-t1i-noflat`.
  - Solve result: 383.97 mm focal distance, 2.519 arcsec/px, field of view `3d 20' 17.5" x 2d 13' 26.6"`.
  - Image center: RA `14 07 11.260`, Dec `+34 00 10.76`.
  - SPCC: succeeded with Canon EOS 500D R/G/B filters and background neutralization enabled.
- Added color-transfer diagnostics:
  - `scripts/pjsr/transfer-linear-color.js` fits per-channel linear transforms from the raw star-aligned master to the SPCC star-aligned master, then applies the transform to the comet-aligned master.
  - No-flat transfer coefficients were red `3.3905*x - 0.0200`, green `2.8713*x - 0.0139`, blue `3.9969*x - 0.0304`.
  - The transferred comet-aligned crop is far less neon green, but it exposes the no-flat gradient/noise and comet-aligned star-residual texture. Keep it diagnostic.
- Ran a flat34 star-aligned SPCC comparison by copying WCS from the no-flat solved master:
  - Branch: `work/02-color-t1i-flat34`.
  - SPCC succeeded with the same Canon EOS 500D filters.
  - Visual finding: the flat34 branch is a useful calibration comparison but still has a broad background/color gradient and appears to weaken the outer fan relative to no-flat.
- Compared the 2016 human edit against the 2026 SPCC/STF diagnostics:
  - The old edit is substantially better as a presentation image: darker sky, tighter comet head, less background/chroma noise, and more natural star color.
  - The 2026 no-flat SPCC branch remains the preferred technical baseline, but it needs nonlinear presentation work before it is fair to judge.
  - The comet-aligned SPCC-transfer branch remains useful for structure, but six-frame star rejection artifacts make it unsuitable as the next standalone presentation candidate.
- Updated `docs/new-project-playbook.md` with the new historical-reference checkpoint and comet presentation guardrails.
- Added Catalina-specific nonlinear scripts:
  - `scripts/pjsr/03catalina-historical-style.js`
  - `scripts/pjsr/blend-catalina-comet-region.js`
  - `scripts/pjsr/03catalina-final-tone.js`
- Ran historical-style star-aligned candidates from the no-flat SPCC baseline:
  - `historical-style-v1`: too dark and too sparse.
  - `historical-style-v2`: cleaner but still under-presented around the comet.
  - `old-reference-v3`: better faint-star depth, but too grey before final tone.
- Ran comet-aligned support candidates from the SPCC-transfer comet-aligned master:
  - `comet-aligned-historical-style-v2`: useful but too dim as a standalone.
  - `comet-support-v3`: deliberately bright support layer for blending only.
- Ran real-data comet blends:
  - `real-comet-blend-v1`: clean but too dark/sparse.
  - `real-comet-blend-v2`: better base, then toned.
  - `real-comet-blend-v2-darktone`: previous best before the ABE-base diagnostic.
- Blend provenance for the current checkpoint:
  - Base: no-flat star-aligned old-reference v3.
  - Support: no-flat comet-aligned support v3.
  - Method: add only color-qualified green/cyan support signal above a support-background offset inside an asymmetric comet/tail mask. No generated, cloned, or painted sky content was used.
- Ran upstream linear background diagnostics:
  - ABE subtract after SPCC succeeded: `work/02-background-t1i-noflat/02d-spcc-abe-sub.xisf`.
  - MGC failed cleanly with `MultiscaleGradientCorrection.executeOn returned false`; no MGC product was promoted.
- Ran ABE-based historical-style and real-data blend checkpoints:
  - `spcc-abe-old-reference-v1`: ABE-corrected base.
  - `abe-real-comet-blend-v1`: ABE base plus existing comet support.
  - `abe-real-comet-blend-v1-darktone`: clean but slightly too sparse.
  - `abe-real-comet-blend-v1-midtone`: current best 2026 checkpoint.
- Updated current-best provenance:
  - Base: no-flat star-aligned ABE old-reference v1.
  - Support: no-flat comet-aligned support v3.
  - Final tone: black point `0.065`, contrast `0.50`, saturation `0.035`.
  - Method still uses only real Catalina-derived layers, with no synthetic, cloned, or painted sky content.

## Outputs

- Full-frame linked-STF previews:
  - `docs/images/catalina-t1i-nodark-noflat-linked-stf.jpg`
  - `docs/images/catalina-t1i-nodark-flat34-linked-stf.jpg`
- Matched comet crops:
  - `docs/images/catalina-t1i-nodark-noflat-comet-crop.jpg`
  - `docs/images/catalina-t1i-nodark-flat34-comet-crop.jpg`
- Comet-aligned no-flat diagnostic previews:
  - `docs/images/catalina-t1i-noflat-comet-aligned-linked-stf.jpg`
  - `docs/images/catalina-t1i-noflat-comet-aligned-comet-crop.jpg`
- SPCC/color previews:
  - `docs/images/catalina-t1i-noflat-star-aligned-spcc-linked-stf.jpg`
  - `docs/images/catalina-t1i-noflat-star-aligned-spcc-comet-crop.jpg`
  - `docs/images/catalina-t1i-noflat-comet-aligned-spcc-transfer-linked-stf.jpg`
  - `docs/images/catalina-t1i-noflat-comet-aligned-spcc-transfer-comet-crop.jpg`
  - `docs/images/catalina-t1i-flat34-star-aligned-spcc-linked-stf.jpg`
  - `docs/images/catalina-t1i-flat34-star-aligned-spcc-comet-crop.jpg`
- Human-reference comparison panels:
  - `docs/images/catalina-2016-human-vs-2026-spcc-full.jpg`
  - `docs/images/catalina-2016-human-vs-2026-spcc-crops.jpg`
- Historical-style / real-data blend checkpoints:
  - `docs/images/catalina-t1i-noflat-spcc-historical-style-v1.jpg`
  - `docs/images/catalina-t1i-noflat-spcc-historical-style-v2.jpg`
  - `docs/images/catalina-t1i-noflat-spcc-historical-style-v2-comet-crop.jpg`
  - `docs/images/catalina-t1i-noflat-spcc-old-reference-v3.jpg`
  - `docs/images/catalina-t1i-noflat-comet-aligned-historical-style-v2.jpg`
  - `docs/images/catalina-t1i-noflat-comet-support-v3.jpg`
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v1.jpg`
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v1-comet-crop.jpg`
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v2.jpg`
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v2-toned.jpg`
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v2-darktone.jpg`
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v2-darktone-comet-crop.jpg`
  - `docs/images/catalina-2016-human-vs-2026-real-comet-blend-v2-darktone-full.jpg`
- ABE background diagnostic and improved checkpoint:
  - `docs/images/catalina-t1i-noflat-spcc-abe-sub-linked-stf.jpg`
  - `docs/images/catalina-t1i-noflat-spcc-abe-old-reference-v1.jpg`
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1.jpg`
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-darktone.jpg`
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-darktone-comet-crop.jpg`
  - `docs/images/catalina-2016-human-vs-2026-abe-real-comet-blend-v1-darktone-full.jpg`
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone.jpg`
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone-comet-crop.jpg`
  - `docs/images/catalina-2016-human-vs-2026-abe-real-comet-blend-v1-midtone-full.jpg`

## Stop Checkpoint

Use `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone.jpg` as the archived best 2026 checkpoint. It improves on the earlier SPCC and darktone diagnostics, but the 2016 human edit still wins on fan/tail depth and faint-star richness. No further processing is planned unless the project is explicitly resumed later.
