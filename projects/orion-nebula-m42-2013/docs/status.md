# Orion Nebula / M42 2013 Processing - Status

**As of:** 2026-05-27 IST, source inventory, web research, Phase 1 diagnostics, Phase 2 comparisons, nonlinear refinement, crop/color revision, 300s faint-nebulosity support test, and final v1 documentation are complete.
**Pipeline progress:** M42 final v1 accepted; optional January wide-field/context work remains separate.

For the accepted result, see [Final v1](final-v1.md).
For the target-specific processing plan, see [Pipeline](pipeline.md).
For the web research notes, see [M42 processing research](research/01-m42-processing.md).
For the chronological log, see [Processing journey](processing-journey.md).

## Where We Are

```text
PHASE 0 - Source inventory and project setup       COMPLETE
PHASE 1 - Calibration + integration diagnostics    COMPLETE
PHASE 2 - Linear post-integration comparison       COMPLETE
PHASE 3 - HDR/nonlinear processing/export          COMPLETE FOR FINAL V1
```

## Dataset Summary

| Field | Value |
| --- | --- |
| Target | Orion Nebula / M42, with likely M43 and wider Orion context branches |
| Dates found | 2013-01-13, 2013-02-08/09, 2013-12-15 trial frames |
| Camera body | Canon EOS 60D |
| Wide-field branch | EXIF reports Canon EF50mm f/1.8 II at 50 mm, f/1.8; treat this as provisional until plate solving confirms the true field scale |
| M42 branch | First-party published notes confirm a Canon EF 70-200 mm f/2.8L IS II USM lens at 200 mm, stopped to f/3.5, with no telescope; plate solve should still be treated as authoritative for exact image scale |
| ES ED80 evidence | A 2013-12-15 "trial-shots-es-ed80d" folder exists, but the frames are very short ISO 100 generic IMG files and do not look like a usable M42 light set from metadata alone |
| Main processing goal | Build an M42 result that preserves core/Trapezium structure as far as the data permits, while still showing the outer nebulosity |
| Main risk | The main February M42 branch may not include enough truly short, matching-core exposures for a clean Trapezium-preserving HDR merge |
| Historical reference | `finished-work/20130208-M42-Orion-Nebula.jpg` |
| First-party source | [sankara.net Astrophotography - Orion and Running Man Nebulae](https://sankara.net/astrophotography/) |

## Published M42 Technical Details

The public astrophotography page confirms these details for the Orion and Running Man Nebulae image:

| Field | Published value |
| --- | --- |
| Date and location | 8-9 February 2013, Keemale Estate, Coorg, Karnataka, India |
| Light frames | 31 x 180s plus 20 x 300s at ISO 1600, about 3h 13m total integration |
| Calibration | 9 x 180s darks at 33 C, 6 flats, no bias |
| Mount | Sky-Watcher NEQ6 Pro GoTo |
| Imaging optic | Canon EF 70-200 mm f/2.8L IS II USM at 200 mm, stopped to f/3.5, no telescope |
| Camera | Canon EOS 60D DSLR, unmodified |
| Guide setup | Orion Short Tube 80 guide scope and Orion StarShoot AutoGuider |
| Capture/processing software | BackyardEOS, DeepSkyStacker, Adobe Photoshop Elements, Neat Image |
| Field of view | About 7.7 degrees wide native, final image cropped to about 2 degrees |

## Candidate Light Sets

Paths are archive-relative, not machine-specific.

| Candidate | Frames | Exposure | Total | Decision |
| --- | ---: | --- | ---: | --- |
| `by-date/20130113-yelagiri-ymca-orion/1600iso/lights-cr2` | 31 CR2 | 10s, ISO 1600, f/1.8, EXIF 50 mm | 5.2 min | Separate provisional wide-field branch; solve before labeling true scale |
| `by-date/20130113-yelagiri-ymca-orion/3200iso/lights-cr2` | 30 CR2 | 5s, ISO 3200, f/1.8, EXIF 50 mm | 2.5 min | Separate provisional wide-field/core-color context only; not enough scale for February M42 Trapezium repair unless plate solve proves otherwise |
| `by-date/20130208-coorg-keemale-m42-flame-horsehead/060s-1600iso` | 4 CR2 | 60s, mixed ISO 800/1600, f/3.5, EXIF 200 mm | 4 min | Possible short/core February M42 HDR branch, but very sparse |
| `by-date/20130208-coorg-keemale-m42-flame-horsehead/120s-0800iso` | 1 CR2 | 120s, ISO 800, f/3.5, EXIF 200 mm | 2 min | Diagnostic only unless it cleanly preserves core detail |
| `by-date/20130208-coorg-keemale-m42-flame-horsehead/180s-1600iso` | 31 CR2 | 180s, ISO 1600, f/3.5, EXIF 200 mm | 93 min | Primary February M42 stack candidate |
| `by-date/20130208-coorg-keemale-m42-flame-horsehead/300s-1600iso` | 20 CR2 | 300s, ISO 1600, f/3.5, EXIF 200 mm | 100 min | Long/faint-nebulosity candidate; quality and saturation gate required |
| `by-date/20130208-coorg-keemale-m42-flame-horsehead/180s-1600iso/tree-obscured` | 12 CR2 | 180s, ISO 1600, f/3.5, EXIF 200 mm | 36 min | Skip initially |
| `by-date/20130208-coorg-keemale-m42-flame-horsehead/bad` | 5 CR2 | 30s, 300s, 600s mixed | 21 min | Skip unless a later core-rescue audit proves one 30s frame is usable |
| `by-date/20131215-bangalore-trial-shots-es-ed80d` | 18 CR2 | very short ISO 100 generic frames | n/a | Not a processing branch for now |

## Calibration Inventory

| Calibration source | Candidate use | Caveat |
| --- | --- | --- |
| `dark/canon-eos-60d/library-01/010s-1600iso/*` | 10s ISO 1600 wide-field branch | Temperature coverage 31-42 C, but no 5s ISO 3200 darks found |
| `dark/canon-eos-60d/library-02/10s-1600iso/*` | Alternate 10s ISO 1600 darks | Temperature coverage 30-33 C |
| `dark/canon-eos-60d/library-02/60s-1600iso/*` | 60s ISO 1600 subset | Temperature coverage 31-33 C; the 60s folder includes mixed ISO lights |
| `dark/canon-eos-60d/library-01/180s-1600iso/*` | Best match for 180s ISO 1600 M42 lights | Includes 9 frames at 33 C from the same general period; use only matched exposure/ISO darks |
| `dark/canon-eos-60d/library-02/180s-1600iso/*` | Backup 180s dark buckets | Many are much hotter than the lights; use cautiously |
| 300s ISO 1600 darks | 300s branch | Not found in the first search; plan for a no-dark control unless found later |
| `flat/20130211-f2.8-1by8000-1600iso` | Possible 2013 lens flats | Only 6 frames and f/2.8, while M42 lights are f/3.5; test before accepting |
| EXIF-50mm f/1.8 flats | Provisional wide-field Orion branch | Not found in the first search; true flat needs depend on solved field/lens confirmation |
| Bias frames | Any branch | Not found in the first search; not required for dark-only tests |

## Phase 1 Runs Completed

All outputs below are project-relative. The `work/` products are ignored by git; the small JPEG previews are checked in under `docs/images/`.

| Run | Inputs | Result | Preview |
| --- | --- | --- | --- |
| `wbpp-2013-m42-180s` | 31 x 180s lights, 9 x 180s/ISO1600/33 C darks, 6 historical flats | Succeeded. Best calibration-supported baseline, but linked-STF preview shows strong green imbalance and large-scale flat/gradient artifacts. | [180s flat-calibrated preview](images/m42-180s-wbpp-linked-stf.jpg) |
| `wbpp-2013-m42-180s-noflats` | 31 x 180s lights, same 180s darks, no flats | Succeeded. Useful control branch; removes the suspect flat variable but leaves obvious lens vignetting. | [180s no-flats preview](images/m42-180s-noflats-wbpp-linked-stf.jpg) |
| `wbpp-2013-m42-300s-nodark-test` | 20 x 300s lights, 6 historical flats, no darks | Succeeded. Faint-signal candidate; flatter than the no-flats control but no matching 300s darks were found. | [300s flat-calibrated preview](images/m42-300s-nodark-wbpp-linked-stf.jpg) |
| `wbpp-2013-m42-300s-nodark-noflats` | 20 x 300s lights, no darks, no flats | Succeeded. Diagnostic control with strong corner vignetting. | [300s no-flats preview](images/m42-300s-nodark-noflats-wbpp-linked-stf.jpg) |
| `wbpp-2013-m42-60s-core-test` | Curated 3 x 60s ISO1600 lights, 60s darks, flats | WBPP completed but did not produce a master light. One of three frames failed registration, leaving fewer than three frames to integrate. | n/a |
| `wbpp-2013-m42-60s-core-nodark-test` | All 4 x 60s folder frames, mixed ISO800/1600, flats, no darks | Succeeded as a diagnostic only. Very sparse and mixed ISO; use only to inspect whether any core detail exists, not as a clean final color/SNR source. | [60s diagnostic preview](images/m42-60s-core-nodark-wbpp-linked-stf.jpg) |

## Initial Master Statistics

The green channel median is materially higher than red/blue in all current masters, especially the 180s branches. That is expected enough for uncalibrated DSLR linear data that it should be handled by background correction, plate solving, and SPCC/manual color calibration, not by judging the raw linked-STF preview alone.

| Master | Red median | Green median | Blue median | Max values |
| --- | ---: | ---: | ---: | --- |
| 180s with flats | 0.00413 | 0.00682 | 0.00393 | R 0.366, G 0.373, B 0.358 |
| 180s no flats | 0.00432 | 0.00725 | 0.00419 | R 0.243, G 0.254, B 0.248 |
| 300s with flats, no darks | 0.03862 | 0.04266 | 0.03767 | R 0.353, G 0.388, B 0.377 |
| 300s no flats, no darks | 0.03863 | 0.04258 | 0.03759 | R 0.294, G 0.319, B 0.301 |
| 60s diagnostic | 0.03254 | 0.03351 | 0.03255 | R 0.361, G 0.397, B 0.375 |

The integrated masters do not hit a normalized maximum of 1.0, so do not declare the Trapezium unrecoverably clipped from these master statistics alone. A core crop and representative raw-frame saturation audit are still required before deciding whether HDRComposition/core replacement is justified.

## Phase 2 Runs Completed

| Run | Input | Result | Preview |
| --- | --- | --- | --- |
| `02-linear-2013-m42-180s-flat` | `wbpp-2013-m42-180s` | Succeeded through ABE, plate solve, SPCC, SCNR, and MLT linear NR. Solved focal length 193.05 mm, scale 4.605 arcsec/px. | [field](images/m42-180s-flat-phase2-field-linked-stf.jpg), [core](images/m42-180s-flat-phase2-core-linked-stf.jpg) |
| `02-linear-2013-m42-180s-noflats` | `wbpp-2013-m42-180s-noflats` | Succeeded through the same settings. Solved focal length 193.04 mm, scale 4.605 arcsec/px. Current preferred baseline because it retains more M42 outer nebulosity after the same linear treatment. | [field](images/m42-180s-noflats-phase2-field-linked-stf.jpg), [core](images/m42-180s-noflats-phase2-core-linked-stf.jpg) |
| `02-linear-2013-m42-300s-flat-nodark` | `wbpp-2013-m42-300s-nodark-test` | Succeeded through the same settings. Solved focal length 193.17 mm, scale 4.602 arcsec/px. Registered to the 180s no-flats baseline for possible faint-signal support; not suitable as the main baseline because it lacks matching darks and has strong gradients/noise. | [self-STF field](images/m42-300s-flat-nodark-phase2-field-selfstf.jpg), [registered field](images/m42-300s-registered-to-180s-noflats-field-selfstf.jpg) |

The solved focal lengths are close to, but not exactly, the website/EXIF 200 mm setting. The published 200 mm value is correct as an acquisition setting; for processing, use the solved scale around 193 mm / 4.60 arcsec per pixel.

## Core And HDR Findings

- Representative 60s, 180s, and 300s raw frames all contain pixels at normalized 1.0 in the M42 core ROI, so the "do not overexpose the Trapezium" warning remains relevant.
- The registered 60s diagnostic master is too sparse and weak to use as a confident Trapezium replacement layer. It should not be the basis for a strong HDRComposition claim.
- The registered 300s branch is useful for faint outer nebulosity experiments only. It should not be used for the core.
- Current honest path: process the 180s no-flats Phase 2 branch as the main image, optionally blend registered 300s only where it improves faint background/outer nebulosity, and use HDRMultiscaleTransform or a light masked core compression for the bright center. Do not claim full Trapezium recovery unless a better short-exposure source is found.

## Accepted Nonlinear Result

The accepted result is [M42 2013 final v1](images/m42-2013-v8-presentation.jpg).

It starts from the v7 approach, but nudges the crop slightly back upward (`centerY=0.585`) and blends in the registered 300s branch as conservative, brighten-only faint-nebulosity support. The 300s layer is masked to protect the bright core and stars, then the final presentation uses a smaller black-point move plus a faint-nebulosity lift. This keeps more surrounding haze than v7, with the known tradeoff of slightly more background texture from the 300s data.

The nonlinear branch starts from `work/02-linear-2013-m42-180s-noflats/02e-linear-nr.xisf` with:

- conservative MaskedStretch
- M42-specific core mask
- HDRMultiscaleTransform on the core mask
- mild LocalHistogramEqualization
- highlight desaturation/compression to reduce false core color
- crop to the M42/M43/Running Man field
- core-only blend for a quieter bright center
- conservative 300s support blend for faint/background nebulosity
- final presentation contrast/color/faint-nebulosity polish

Earlier comparison exports are also present:

- [v1](images/m42-2013-v1-180s-noflats.jpg): first proof of pipeline, but core color artifact is too strong
- [v2](images/m42-2013-v2-180s-noflats.jpg): better core color control
- [v3](images/m42-2013-v3-180s-noflats.jpg): richer field color, but the bright core still has more false color
- [v4](images/m42-2013-v4-180s-noflats.jpg): rejected because the core shifted green
- [v5](images/m42-2013-v5-180s-noflats.jpg): quiet core, but globally too muted
- [v6](images/m42-2013-v6-coreblend.jpg): prior core-blend candidate; better core behavior, but crop placed M42 too high and the presentation was too subdued
- [v7 core blend](images/m42-2013-v7-coreblend.jpg): recentered crop before final color/contrast polish
- [v7 presentation](images/m42-2013-v7-presentation.jpg): stronger crop/color revision, but still too conservative on faint background nebulosity
- [v8 300s support](images/m42-2013-v8-300s-support.jpg): registered 300s layer stretched/cropped to the v8 frame for support only
- [v8 300s support blend](images/m42-2013-v8-300s-supportblend.jpg): conservative brighten-only 300s blend into the v8 180s core blend
- [v8 presentation / final v1](images/m42-2013-v8-presentation.jpg): accepted M42/M43/Running Man result

Historical comparison panels:

- [2013 original vs v3 vs v5](images/m42-2013-original-v3-v5-comparison.jpg)
- [2013 original vs v3 vs v6](images/m42-2013-original-v3-v6-comparison.jpg)
- [2013 original vs v6 vs v7 presentation](images/m42-2013-original-v6-v7-presentation-comparison.jpg)
- [2013 original vs v7 vs v8 presentation](images/m42-2013-original-v7-v8-presentation-comparison.jpg)

## Decisions So Far

- Create one project for the Orion/M42 2013 material: `projects/orion-nebula-m42-2013`.
- Treat the January 2013 EXIF-50mm data as a separate provisional wide-field Orion branch until plate solving confirms the true scale; do not use it as a core-detail replacement for the February M42 stack.
- Treat the February 2013 EXIF-200mm data as the main M42 branch, but verify the actual scale by plate solving before final naming.
- Integrate each exposure group separately before attempting any HDR composition. Do not mix 60s, 120s, 180s, and 300s raw frames in one WBPP integration.
- Use the 180s stack as the first primary M42 baseline because it has the strongest matching dark support and enough subs for rejection.
- Test the 300s stack separately as faint-nebulosity support; accept it only if gradients, framing, and saturated core behavior are manageable.
- Use the 60s and single 120s February M42 frames only after saturation inspection. If the 60s core is already clipped, the project should document that the Trapezium cannot be fully recovered from the current data.
- Use the historical finished-work JPEG only as a visual reference; do not treat old TIFF/PSD/DSS outputs as input to the new PixInsight pipeline.
- Prefer the website-published M42 technical details over filename inference when they conflict, but still verify true image scale by plate solving.
- Keep both flat-calibrated and no-flats controls for now. The Phase 2 comparison favors the 180s no-flats branch, but the flat-calibrated branch remains useful evidence because it matches the historical calibration set.
- Prefer `02-linear-2013-m42-180s-noflats/02e-linear-nr.xisf` as the current nonlinear baseline.
- Keep the flat-calibrated 180s branch as a comparison and possible fallback if later crop/gradient work makes the no-flats branch misbehave.
- Treat the 60s master as evidence-gathering only; the registered diagnostic does not justify a clean core replacement.

## Open Questions For Review

- Do you recognize the 2013-12-15 ES ED80 trial frames as M42 or another useful target, or should they remain excluded?
- The website says 6 flats were used historically; are those the `flat/20130211-f2.8-1by8000-1600iso` frames, or is there another better-matching flat set?
- Are there additional 300s ISO 1600 darks outside the folders scanned here?
- Should the separate January 2013 Orion context data be processed later as a wide-field branch?

## Proposed Next Runs

| Run name | Purpose |
| --- | --- |
| `03-m42-300s-support-test` | Register/use 300s support only through masks if it improves faint outer nebulosity |
| `final-v1` | Accepted M42/M43/Running Man result from the v8 300s faint-support branch |
| `wbpp-2013-orion-widefield-10s` | Separate provisional wide-field Orion branch; plate solve before true-scale claims |

## Outputs

Phase 1 master lights are in:

- `work/wbpp-2013-m42-180s/master/`
- `work/wbpp-2013-m42-180s-noflats/master/`
- `work/wbpp-2013-m42-300s-nodark-test/master/`
- `work/wbpp-2013-m42-300s-nodark-noflats/master/`
- `work/wbpp-2013-m42-60s-core-nodark-test/master/`

Phase 2 linear outputs are in:

- `work/02-linear-2013-m42-180s-flat/`
- `work/02-linear-2013-m42-180s-noflats/`
- `work/02-linear-2013-m42-300s-flat-nodark/`
- `work/registered-to-180s-noflats/`

Nonlinear candidate outputs are in:

- `work/03-nonlinear-2013-m42-180s-noflats-v1/`
- `docs/images/m42-2013-v8-presentation.jpg`
- `docs/images/m42-2013-original-v7-v8-presentation-comparison.jpg`
