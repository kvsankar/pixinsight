# Comet Catalina 2016-01-09 Pipeline

## Goal

Build a technically honest modern PixInsight version of the 2016 Comet Catalina data, preserving real comet coma/tail signal and avoiding any synthetic sky cleanup.

Project state: stopped on 2026-06-04. The best 2026 checkpoint did not match the 2016 human processing, so this project is archived as a documented comet-processing experiment rather than an active finalization candidate.

The first processing pass should stop after planning and light diagnostics unless explicitly approved for heavy processing.

## Source Inventory

Primary source folder:

- `by-date/20160109-yelagiri-ymca-comet-catalina`

Candidate light groups:

| Group | Camera | Exposure | Count | Temperature | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `originals/good/star-tracking` | Canon EOS Rebel T1i | 120 s ISO1600 | 6 | +25 C to +29 C | Likely historical primary. EXIF focal length is `0.0 mm`; solve required. |
| `originals/good/star-tracking` | Canon EOS 60D | 120 s ISO1600 | 1 | +23 C | Same folder, different camera/framing. Do not combine with T1i. |
| `originals/good/star-tracking` | Canon EOS 60D | 300 s ISO1600 | 2 | +21 C to +26 C | Diagnostic/support only until inspected separately. |
| `originals/good/comet-tracking` | Canon EOS 60D | 300 s ISO1600 | 1 | +29 C | Single comet-tracked exposure; reference/diagnostic only. |
| `originals` | Canon EOS 60D | 120 s ISO1600 | 12 | +23 C to +29 C | Previous-morning/uncurated group. Process separately before judging. |
| `originals/preview` | Canon EOS 60D | 180 s ISO1600 | 1 | +35 C | Preview only. |
| `originals/bad` | mixed | mixed | 7 | +18 C to +27 C | Rejection bucket unless a specific diagnostic needs them. |

Calibration candidates:

- T1i flats: `flat/20160109-yelagiri-ymca-flats/good`, 34 x CR2, 1/125 s ISO1600, same date.
- T1i darks: none found in local dark archive search.
- 60D darks: `dark/canon-eos-60d/library-02/120s-1600iso/33c` through `36c`, warmer than the 60D lights and diagnostic only.
- 60D flats: same-date `flat/20160109-yelagiri-ymca-flats/unsorted`, mixed short exposures, diagnostic only.

Historical references:

- `finished-work/20160109-Comet-Catalina.jpg`
- `by-date/20160109-yelagiri-ymca-comet-catalina/processing/catalina-star-aligned-stacked-settings-applied_filtered-copyright.jpg`
- DSS `Autosave*.html`, `*.Info.txt`, and `*.stackinfo.txt` under `originals/good/star-tracking`.

Historical-reference finding:

- The 2016 human edit is presently better as an image than the first 2026 SPCC/STF diagnostics. The modern data path is more reproducible, but the preview has a lifted noisy sky, exaggerated green halo, and weak presentation contrast. The next branch should deliberately address black point, background restraint, star color, and comet-halo scale while preserving real comet color and tail signal.

## Initial Branches

### Branch A: T1i Star-Aligned Control

Purpose: WCS, SPCC/PCC, star color, background quality, and historical comparison.

Inputs:

- Six T1i 120 s ISO1600 frames from `originals/good/star-tracking`.
- No darks.
- Two sub-branches:
  - `t1i-120s-nodark-noflat`
  - `t1i-120s-nodark-flat34`

Decision gates:

- Confirm CR2 acquisition times propagate to calibrated XISF outputs. Done: registered XISF frames retain `Observation:Time:Start` and `DATE-OBS`.
- Plate solve and record actual focal length/scale.
- Compare flat/no-flat linked-STF previews for overcorrection, dust correction, and edge gradients.
- Do not accept a branch until comet head/tail crops are reviewed.

Current diagnostic result:

- `t1i-120s-nodark-noflat`: 6/6 registered and integrated, 0 rejected. This is the current comet-signal reference branch.
- `t1i-120s-nodark-flat34`: 34 flats matched, 6/6 registered and integrated, 0 rejected. Full-frame preview looks usable, but the matched comet crop suppresses the broad outer fan under the no-flat reference stretch.
- Keep both star-aligned masters. Start CometAlignment with no-flat first, then repeat on flat34 only if the no-flat comet-aligned result shows calibration defects that matter.

### Branch B: T1i Comet-Aligned Diagnostic

Purpose: sharper comet head and tail.

Inputs:

- Calibrated/debayered/star-registered frames from the accepted T1i star-aligned control branch.
- Historical DSS comet coordinates as sanity checks:
  - First historical T1i frame around `(2246.64, 1664.44)`.
  - Last historical T1i frame around `(2276.89, 1665.60)`.

Plan:

- Use PixInsight CometAlignment with valid acquisition time metadata.
- Measure nucleus positions on the star-registered frames, not on raw or historical DSS coordinate systems.
- Define first and last nucleus positions, and add middle fixed frames when needed. For the first no-flat diagnostic, all six measured positions were fixed and `fitPSF=false`.
- Integrate comet-aligned frames with rejection tuned for star trails.
- Keep a visible-trails version and a more aggressive rejection diagnostic if needed.

Decision gates:

- Reject any comet-aligned product where the nucleus is doubled, the tail is smeared, or star rejection creates false background texture.
- Do not clone or paint out star trails.
- If recombining with stars, use only a star layer derived from this same data.

Current diagnostic result:

- No-flat CometAlignment succeeded from six registered T1i frames using XISF `Observation:Time:Start` and measured nucleus coordinates.
- Numeric verification succeeded: after CometAlignment, the six remeasured nuclei all landed near `(2246.6, 1663.2)`.
- Comet-aligned integration output: `work/comet-align-t1i-noflat/masterCometAligned_t1i_nodark_noflat.xisf`.
- Review previews:
  - `docs/images/catalina-t1i-noflat-comet-aligned-linked-stf.jpg`
  - `docs/images/catalina-t1i-noflat-comet-aligned-comet-crop.jpg`
- Visual finding: the comet head and fan/tail are sharper, but six-frame star rejection leaves flecks and residual clumps. This branch is useful, not final.
- Next comet-branch tests: no-rejection visible-trails integration and one alternate rejection diagnostic before deciding whether to make a real-data comet-plus-stars composite.

### Branch C: 60D 2016-01-08 Diagnostic

Purpose: inspect whether the 60D 50 mm data is a usable separate field or only context.

Inputs:

- Twelve 60D 120 s ISO1600 frames from `originals`.
- No raw combining with T1i.

Decision gates:

- Plate solve separately.
- Compare framing and comet scale against T1i branch.
- Decide whether this branch is a separate wide-field product, a context reference, or rejected.

### Branch D: 60D Support Singles

Purpose: historical/support inspection only.

Inputs:

- One 300 s comet-tracking frame from `originals/good/comet-tracking`.
- Two 300 s star-tracking frames from `originals/good/star-tracking`.

Decision gates:

- Inspect for framing, focus, trailing, and coma/tail visibility.
- Do not integrate single-frame comet-tracking data as a main branch.

### Branch E: T1i Historical-Style Presentation Candidate

Purpose: make the first genuinely viewable 2026 candidate, using the 2016 human edit as a taste/reference checkpoint but not as source data.

Inputs:

- Primary input: `work/02-color-t1i-noflat/02c-spcc.xisf`.
- Diagnostic comparison input: no-flat comet-aligned SPCC-transfer master, only for judging comet structure and possible later real-data recombination.

Plan:

- Start from the no-flat star-aligned SPCC branch for clean stars, WCS-derived color, and safer background judgment.
- Apply a conservative nonlinear stretch with a darker target background than the first linked-STF previews.
- Use low-luminance sky chroma cleanup only; do not apply broad SCNR, since the green/cyan coma is likely real.
- Keep the comet head and fan/tail visible, but avoid the bloated diagnostic halo from the automatic stretch.
- Export a compressed review JPEG and a side-by-side comparison against the 2016 reference.

Decision gates:

- Sky should be darker and quieter than the SPCC/STF diagnostic without clipping the faint tail/fan.
- Coma should remain plausibly green/cyan, not neon and not neutralized away.
- Stars should keep warmer natural color than the raw diagnostic.
- If the star-aligned comet is still too soft, revisit the comet-aligned branch for a real-data recombination; do not clone or paint star-trail artifacts.

Current result:

- Added `scripts/pjsr/03catalina-historical-style.js` for the first nonlinear Catalina-specific stretch/polish branch.
- Added `scripts/pjsr/blend-catalina-comet-region.js` for real-data comet-region blending from the comet-aligned support image into the star-aligned base.
- Added `scripts/pjsr/03catalina-final-tone.js` for a small nonlinear black-point/contrast/saturation tone pass that does not apply SCNR.
- Ran a linear ABE-subtract diagnostic after SPCC:
  - Output: `work/02-background-t1i-noflat/02d-spcc-abe-sub.xisf`.
  - Preview: `docs/images/catalina-t1i-noflat-spcc-abe-sub-linked-stf.jpg`.
  - Finding: ABE did not remove the comet fan/tail in the diagnostic preview and gave a slightly better base for the presentation branch.
- Tried MGC as a linear diagnostic, but `MultiscaleGradientCorrection.executeOn` returned false and no output was produced.
- Best current checkpoint: `docs/images/catalina-t1i-noflat-abe-real-comet-blend-v1-midtone.jpg`.
- Best current comparison panel: `docs/images/catalina-2016-human-vs-2026-abe-real-comet-blend-v1-midtone-full.jpg`.

Documented real-data blend:

- Base: `work/03-catalina-historical-style/catalina-t1i-noflat-spcc-abe-old-reference-v1.xisf`.
- Comet support: `work/03-catalina-historical-style/catalina-t1i-noflat-comet-support-v3.xisf`.
- Blend shape: asymmetric comet/tail ellipse centered at `0.470w, 0.524h`, with left radius `0.070w`, right radius `0.185w`, and vertical radius `0.105h`.
- Blend rule: add only color-qualified green/cyan support signal above a support background offset (`0.205`) into the base, scaled per channel (`R 0.42`, `G 0.82`, `B 0.60`) and limited by spatial, color, and support-signal masks.
- Final tone: black point `0.065`, contrast `0.50`, saturation `0.035`.
- No synthetic sky content, cloned background, or broad SCNR was used.

Current visual finding:

- The ABE real-data blend midtone branch is the best 2026 checkpoint so far. It improves on the previous non-ABE darktone branch by keeping the sky less grey while preserving more faint-star field.
- The 2016 human edit still wins as a presentation image. It has richer faint-star texture and better apparent fan/tail depth.
- No further technical investigation is planned unless the project is explicitly resumed later.

## Phase 2 Plan

For the accepted star-aligned branch:

1. Render linked-STF preview before modification.
2. Use conservative ABE/DBE only if samples can avoid the coma and tail.
3. Plate solve using the solved branch scale once known. Done for no-flat: 383.97 mm, 2.519 arcsec/px.
4. Use SPCC/PCC on the star-aligned branch if WCS and catalog support are reliable. Done for no-flat and flat34 with Canon EOS 500D R/G/B filters.
5. Avoid broad SCNR. The green/cyan coma can be real comet signal.
6. Keep a stock/no-BXT branch before trying any BXT/NXT branch.

For the comet-aligned branch:

1. Transfer color balance from the star-aligned calibrated branch by a documented method. First diagnostic used fitted per-channel linear transforms from raw no-flat star-aligned to no-flat SPCC star-aligned, then applied them to the no-flat comet-aligned master.
2. Avoid BXT until a stock comet-aligned branch is reviewed.
3. Use mild denoise only after close crop checks around coma, tail, empty sky, and star-trail zones.

## Phase 3 Plan

- Build a conservative historical-style candidate from the no-flat star-aligned SPCC branch first.
- Build a comet-priority diagnostic if CometAlignment gives a clean nucleus/tail result.
- Compare the first presentation candidate against the 2016 human edit and the SPCC/STF diagnostic before promoting it.
- Use crops around:
  - nucleus and inner coma;
  - faint tail direction;
  - clean background;
  - star-trail/rejection artifacts;
  - frame edges/corners.
- Keep final exports small under `docs/images/` only after a branch is accepted for review.

## Open Questions

- Are the T1i timestamps local time or UTC? Likely local camera time converted to UTC by PixInsight; registered frames retain UTC-like `Observation:Time:Start` values consistent with the local-morning capture.
- What focal length/scale does the T1i branch solve to? Answered: 383.97 mm and 2.519 arcsec/px on the no-flat star-aligned master.
- Do the same-date T1i flats improve the frame without bias/dark-flat support? Still unresolved; they look safe at full-frame scale but may reduce faint comet fan signal in the matched crop.
- Is there enough frame count for acceptable comet-aligned star rejection? Partially: enough to align the comet well, not yet enough for a clean presentation without more rejection/composite work.
- Should the first review target be a historical clean star field, a sharper comet, or both side by side?
