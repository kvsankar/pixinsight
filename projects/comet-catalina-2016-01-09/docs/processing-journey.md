# Comet Catalina 2016-01-09 Processing Journey

## 2026-06-04 Project Start

- Started Comet Catalina as the first comet project in this repo.
- Read the shared new-project playbook and local workdir notes before processing.
- Updated the playbook with moving-target/comet-specific requirements before starting heavy processing.
- Searched the local `by-date` archive for `catalina`, `comet`, `2013us10`, and `us10`.
- Found one obvious source folder: `by-date/20160109-yelagiri-ymca-comet-catalina`.
- Found one old finished-work reference: `finished-work/20160109-Comet-Catalina.jpg`.
- Inspected local raw metadata with ExifTool. The archive is mixed-camera and mixed-tracking:
  - T1i 120 s star-tracking frames appear to be the historical primary input.
  - 60D 50 mm frames exist as separate previous-morning and support/diagnostic data.
  - A single 60D 300 s comet-tracking frame exists, but it cannot make an integration by itself.
- Inspected DSS logs and confirmed historical stacks used 5-6 T1i frames, no darks, sometimes 34 flats, and DSS "align on stars and comet."
- Researched C/2013 US10 and PixInsight CometAlignment before writing the pipeline.

## Current Decision

Use the no-flat star-aligned SPCC branch as the current color baseline and build the first historical-style presentation candidate from it. Keep the no-flat comet-aligned branch as the comet-sharp diagnostic, but do not promote it yet: color transfer fixes the neon-green preview, while the six-frame comet-aligned integration still leaves rejected-star flecks, green residual clumps, and strong background texture.

Still verify:

- Whether background/gradient control can improve the no-flat branch without subtracting real coma/tail signal.
- Whether a 5-6 frame comet-aligned integration can reject star trails well enough for presentation, or only for a comet-sharp diagnostic.
- Whether the flat34 branch is genuinely correcting background/illumination or suppressing low-surface-brightness comet signal.
- Whether the first presentation branch can recover the 2016 edit's controlled sky and tighter comet appearance without erasing real green/cyan coma or tail signal.

## 2026-06-04 T1i Star-Aligned Diagnostics

- Staged only the six Canon EOS Rebel T1i 120 s ISO1600 star-tracking lights into `work/00-inputs/t1i-star-tracking-120s` so the mixed T1i/60D source folder would not be combined accidentally.
- Ran `wbpp-t1i-120s-nodark-noflat` with no darks and no flats:
  - 6/6 lights registered and integrated.
  - 0 rejected.
  - Autocrop master written under `work/wbpp-t1i-120s-nodark-noflat/master`.
- Ran `wbpp-t1i-120s-nodark-flat34` with the 34 same-date T1i flats:
  - 34 flats matched and produced a master flat.
  - 6/6 lights registered and integrated.
  - 0 rejected.
  - Autocrop master written under `work/wbpp-t1i-120s-nodark-flat34/master`.
- Checked registered XISF metadata and confirmed the frames retain `Observation:Time:Start` and `DATE-OBS`. The first registered frame reports a UTC-like start time corresponding to the local-morning capture, so the camera timestamps appear usable for PixInsight CometAlignment.
- Rendered full-frame linked-STF previews:
  - `docs/images/catalina-t1i-nodark-noflat-linked-stf.jpg`
  - `docs/images/catalina-t1i-nodark-flat34-linked-stf.jpg`
- Rendered matched comet crops using the no-flat branch as the reference stretch:
  - `docs/images/catalina-t1i-nodark-noflat-comet-crop.jpg`
  - `docs/images/catalina-t1i-nodark-flat34-comet-crop.jpg`
- Visual read:
  - Both branches show a strong green/cyan coma and real fan/tail structure.
  - The flat branch looks usable at full-frame scale and does not show obvious catastrophic flat overcorrection.
  - In the matched comet crop, the flat branch suppresses the broad outer green fan compared with no-flat. Keep it as a diagnostic branch until a comet-aligned comparison proves whether the difference is real calibration or lost comet signal.

## 2026-06-04 No-Flat CometAlignment Diagnostic

- Inspected PixInsight's installed `CometAlignment` process properties before scripting it. The required target-frame table is `path, enabled, date, jd, x, y, fixed, drizzlePath`.
- Added `scripts/pjsr/locate-bright-centroid.js` and measured the comet nucleus directly on the no-flat registered frames instead of trusting the old DSS coordinates.
- The registered-frame positions moved smoothly with timestamp:
  - Earliest frame: about `(2246.6, 1663.0)`.
  - Latest frame: about `(2215.5, 1659.4)`.
- Built `work/comet-align-t1i-noflat/comet-alignment-table.csv` from the measured positions and the registered XISF `Observation:Time:Start` values.
- Added `scripts/pjsr/comet-align-frames.js` and ran PixInsight CometAlignment with fixed measured positions and `fitPSF=false`.
- CometAlignment produced six comet-aligned frames under `work/comet-align-t1i-noflat/aligned`.
- Remeasured the comet-aligned frames and confirmed every nucleus landed near `(2246.6, 1663.2)`, so the alignment table/timestamps were internally consistent.
- Integrated the comet-aligned frames into `work/comet-align-t1i-noflat/masterCometAligned_t1i_nodark_noflat.xisf`.
- Rendered review previews:
  - `docs/images/catalina-t1i-noflat-comet-aligned-linked-stf.jpg`
  - `docs/images/catalina-t1i-noflat-comet-aligned-comet-crop.jpg`
- Visual read:
  - The comet nucleus is better aligned than in the star-aligned master.
  - The green/cyan fan/tail survives and is sharper.
  - Star rejection is imperfect with only six frames: small flecks and a few green residual clumps remain. Do not clone or paint them out; compare rejection settings and any future recombination only with real layers from this dataset.

## 2026-06-04 Star-Aligned SPCC And Color Transfer

- Plate solving the no-flat T1i star-aligned master failed with an overlong `510 mm` seed, then succeeded with a `386 mm` seed derived from the measured comet motion.
- Solved result:
  - Focal distance: `383.97 mm`.
  - Pixel scale: `2.519 arcsec/px`.
  - Field of view: `3d 20' 17.5" x 2d 13' 26.6"`.
  - Image center: RA `14 07 11.260`, Dec `+34 00 10.76`.
- Confirmed PixInsight has Canon EOS 500D filter responses, matching the T1i internal model name.
- Added `camera=CanonEOS500D` support to `scripts/pjsr/02c-spcc.js` so scripted SPCC can use `Canon EOS 500D R/G/B` without spaced filter names on the command line.
- Ran SPCC on the no-flat solved star-aligned master:
  - Output: `work/02-color-t1i-noflat/02c-spcc.xisf`.
  - SPCC succeeded with background neutralization enabled.
  - Rendered:
    - `docs/images/catalina-t1i-noflat-star-aligned-spcc-linked-stf.jpg`
    - `docs/images/catalina-t1i-noflat-star-aligned-spcc-comet-crop.jpg`
- Added `scripts/pjsr/transfer-linear-color.js` to fit and apply a per-channel linear color transform from the raw star-aligned master to the SPCC star-aligned master.
- Applied that transform to the no-flat comet-aligned master:
  - Output: `work/02-color-t1i-noflat/masterCometAligned_t1i_nodark_noflat_spcc-transfer.xisf`.
  - Fitted channel transforms: red `3.3905*x - 0.0200`, green `2.8713*x - 0.0139`, blue `3.9969*x - 0.0304`.
  - Rendered:
    - `docs/images/catalina-t1i-noflat-comet-aligned-spcc-transfer-linked-stf.jpg`
    - `docs/images/catalina-t1i-noflat-comet-aligned-spcc-transfer-comet-crop.jpg`
- Visual read:
  - The comet is no longer the hard neon green from the raw linked-STF diagnostic.
  - The coma remains plausibly cyan-green, as expected for comet signal.
  - The comet-aligned color-transfer image is not presentation-ready because background/noise texture and star-rejection residuals are too visible.
- Ran a flat34 star-aligned SPCC diagnostic by copying WCS from the no-flat solved master:
  - Output: `work/02-color-t1i-flat34/02c-spcc.xisf`.
  - Rendered:
    - `docs/images/catalina-t1i-flat34-star-aligned-spcc-linked-stf.jpg`
    - `docs/images/catalina-t1i-flat34-star-aligned-spcc-comet-crop.jpg`
  - The flat34 branch remains diagnostic: it is color-calibrated, but still has a broad gradient and appears less protective of the outer fan/tail than no-flat.

## 2026-06-04 Human Reference And Web Research Checkpoint

- Compared the 2016 human edit against the first 2026 SPCC/STF products.
- Finding: the old edit is much stronger as a presentation image. It has a darker and quieter sky, tighter comet head, less noisy green halo, and warmer star color. The 2026 SPCC branch is more traceable and color-calibrated, but it is still only a diagnostic preview.
- Created comparison panels:
  - `docs/images/catalina-2016-human-vs-2026-spcc-full.jpg`
  - `docs/images/catalina-2016-human-vs-2026-spcc-crops.jpg`
- Added the lesson to the shared new-project playbook: compare against historical human edits before treating linked-STF/SPCC previews as candidates.
- Rechecked external comet-processing references:
  - PixInsight's C/2022 E3 notes support treating comet alignment, star-field color calibration, and any target-aligned color transfer as separate documented steps.
  - PixInsight SPCC documentation supports the star-aligned branch as the color-calibrated baseline because the process uses Gaia DR3/SP spectra and actual filter responses.
  - NASA/APOD descriptions of Catalina's dust and ion tails reinforce that green/cyan coma and tail structure should be protected, not globally suppressed.
- Current direction: make a conservative no-flat star-aligned historical-style branch first; revisit real-data comet-plus-stars recombination only if the star-aligned comet stays too soft after presentation polish.

## 2026-06-04 Historical-Style Nonlinear Checkpoints

- Added `scripts/pjsr/03catalina-historical-style.js` for Catalina-specific nonlinear presentation attempts from linear SPCC data.
- Ran no-flat star-aligned presentation candidates:
  - `catalina-t1i-noflat-spcc-historical-style-v1`: too dark; sky was controlled but comet/fan and faint stars were under-presented.
  - `catalina-t1i-noflat-spcc-historical-style-v2`: cleaner and more usable, but still too timid around the comet and too sparse compared with the 2016 reference.
  - `catalina-t1i-noflat-spcc-old-reference-v3`: recovered more faint stars and old-reference depth, but the sky became too grey before final tone.
- Ran comet-aligned support stretches from the SPCC-transfer comet-aligned master:
  - `catalina-t1i-noflat-comet-aligned-historical-style-v2`: useful but too dim as a standalone.
  - `catalina-t1i-noflat-comet-support-v3`: deliberately brighter support layer for real-data blending; not a standalone candidate because its background is ugly and mostly star-rejected.
- Added `scripts/pjsr/blend-catalina-comet-region.js` and made real-data comet blends:
  - `catalina-t1i-noflat-real-comet-blend-v1`: v2 star-aligned base plus comet support; cleaner sky but still too dark/sparse.
  - `catalina-t1i-noflat-real-comet-blend-v2`: v3 old-reference base plus comet support; better faint-star density but sky needed a tone pass.
- Added `scripts/pjsr/03catalina-final-tone.js` and toned the v2 blend:
  - `catalina-t1i-noflat-real-comet-blend-v2-toned`: useful intermediate, still too lifted.
  - `catalina-t1i-noflat-real-comet-blend-v2-darktone`: previous best before the ABE-base diagnostic.
- Current best review files:
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v2-darktone.jpg`
  - `docs/images/catalina-t1i-noflat-real-comet-blend-v2-darktone-comet-crop.jpg`
  - `docs/images/catalina-2016-human-vs-2026-real-comet-blend-v2-darktone-full.jpg`
- Real-data blend record:
  - Base: no-flat star-aligned old-reference v3.
  - Support: no-flat comet-aligned support v3.
  - The blend adds only color-qualified green/cyan comet support above a support-background offset inside an asymmetric comet/tail ellipse. It does not replace the sky background and does not synthesize, clone, or paint comet/tail structure.
- Visual finding:
  - The darktone blend is much better than the raw 2026 SPCC diagnostic and finally gives us something worth looking at.
  - The 2016 human edit still beats it: deeper background, richer faint-star texture, and stronger apparent fan/tail.
  - The next improvement should be upstream background/gradient correction or a better star/comet integration strategy, not broad green suppression.

## 2026-06-04 ABE Background Diagnostic And Improved Checkpoint

- Tested linear background/gradient correction after SPCC on the no-flat star-aligned branch.
- Ran ABE subtract:
  - Output: `work/02-background-t1i-noflat/02d-spcc-abe-sub.xisf`.
  - Preview: `docs/images/catalina-t1i-noflat-spcc-abe-sub-linked-stf.jpg`.
  - Finding: ABE did not obviously erase the comet fan/tail in the linked-STF diagnostic and gave a slightly better presentation base.
- Tried MGC:
  - `MultiscaleGradientCorrection.executeOn` returned false, so no MGC output was produced.
  - Keep MGC as failed diagnostic for now rather than tuning blindly.
- Ran `catalina-t1i-noflat-spcc-abe-old-reference-v1` from the ABE-subtracted linear master.
- Reused the existing real-data comet support layer `catalina-t1i-noflat-comet-support-v3`.
- Produced ABE real-data blends:
  - `catalina-t1i-noflat-abe-real-comet-blend-v1`: ABE base plus comet support.
  - `catalina-t1i-noflat-abe-real-comet-blend-v1-darktone`: cleaner/darker but a little too sparse.
  - `catalina-t1i-noflat-abe-real-comet-blend-v1-midtone`: current best checkpoint; better balance between controlled sky and retained faint-star field.
- Current best review files:
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone.jpg`
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone-comet-crop.jpg`
  - `docs/images/catalina-2016-human-vs-2026-abe-real-comet-blend-v1-midtone-full.jpg`
- The old 2016 edit still has stronger fan/tail depth and richer faint-star texture, but the ABE midtone branch is now the best 2026 result and a better base for the next improvement pass.

## 2026-06-04 Stop Decision

- Stopped the Comet Catalina project at the user's request.
- Reason: the 2026 processing experiments did not match the 2016 human processing. The best modern checkpoint is reproducible and technically documented, but the old edit still has stronger fan/tail depth, richer faint-star texture, and a better presentation feel.
- Archived best 2026 checkpoint:
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone.jpg`
  - `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone-comet-crop.jpg`
  - `docs/images/catalina-2016-human-vs-2026-abe-real-comet-blend-v1-midtone-full.jpg`
- No further processing is planned unless the project is explicitly resumed later.
