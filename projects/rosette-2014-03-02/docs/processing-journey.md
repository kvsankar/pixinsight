# Rosette Nebula Processing Journey

This document records the path actually taken while trying to process the 2014 Rosette Nebula data with PixInsight automation. It is intentionally narrative: the goal is to preserve what was tried, what each attempt taught us, and where the project now stands.

## Starting Point

The Rosette data came from the 2014-03-02 Coorg/Keemale archive. The original folder included raw Canon EOS 60D CR2 frames, darks from the same dark library used by the M31 work, and historical DeepSkyStacker/Photoshop processing attempts.

The historical DSS report became the first anchor:

| Evidence | Finding |
|---|---|
| DSS light count | 31 lights |
| DSS total exposure | 2 hr 4 min |
| Darks | 9 x 240s ISO 1600 |
| Flats | None |
| Bias | None |
| Processing after stack | Adobe Photoshop CS6 |

The current archive layout did not map one-to-one to the historical DSS report. The working PixInsight baseline therefore used the simplest repeatable modern selection: 33 top-level good lights from `good/east` and `good/west`, excluding the separated satellite-trail folders.

## Human-In-The-Loop Contributions

Rosette was not a fully blind automation run. Human input changed the direction of the work several times:

| Human input | Where it affected the workflow |
|---|---|
| Manual DBE sample placement in PixInsight | The automatic background branches were too blunt for a no-flats, nebula-rich field. Human-placed samples around the outer field avoided the central Rosette and produced the cleanest background model. |
| Visual observation that the raw/embedded CR2 preview showed red Rosette signal | This kept the investigation from accepting the gray-green SPCC result too quickly and led to checking Canon white-balance multipliers, linked previews, and DSS-style per-channel background calibration. |
| Installing StarXTerminator | This enabled the v3/v3b starless-plus-stars workflow after local scripted starless approximations proved inadequate. |
| Interactive SPCC test | This helped separate "SPCC cannot process the image" from "scripted SPCC is missing metadata." The notes do not explicitly identify who operated this interactive step. |

## Project Scaffold

A new project was created at:

```text
projects/rosette-2014-03-02/
```

Generated PixInsight output was kept under:

```text
projects/rosette-2014-03-02/work/
```

That `work/` directory is intentionally ignored by git. The repo should keep scripts and documentation, not large local processing products.

The shared WBPP driver was extended so Rosette could use more than one light folder through either `-LightDirs` or `PI_LIGHT_DIRS`.

## First WBPP Run

The first full PixInsight calibration/integration used:

| Input | Value |
|---|---|
| Lights | 33 x 240s ISO 1600 |
| Darks | 9 x 240s ISO 1600 |
| Flats | None |
| Bias | None |
| Debayer | WBPP auto-detected Canon/LibRaw result |

The integrated master was created successfully:

```text
work/wbpp-out/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf
```

## Plate Solving

The CR2 metadata reported `FocalLength=50.0 mm`, which was misleading. The Rosette image was not a 50 mm wide-field image. Plate solving initially needed Rosette-specific seed parameters rather than the earlier M31 assumptions.

The successful plate-solve result established the real image scale:

| Field | Value |
|---|---|
| Solved file | `work/02-linear/02b-solved.xisf` |
| Center | RA 6h 32m 19.922s, Dec +4d 55m 27.90s |
| Focal length | about 386 mm |
| Scale | about 2.303 arcsec/px |
| Field of view | about 3d 19m x 2d 12m |

This confirmed that the optical setup was in the ED80/reducer class rather than the bogus 50 mm EXIF value.

## First SPCC Result

SPCC completed once Gaia DR3/SP catalog access and WCS were working. The first important surprise was that SPCC did not fail technically; it succeeded but produced the wrong-looking color. The Rosette came out cyan-green or gray-green instead of red/pink.

That changed the investigation from "why does SPCC not run?" to "why does a technically successful SPCC produce implausible color?"

## Gaia And Catalog Status

The Gaia DR3/SP catalog issue was a setup/access issue, not evidence that SPCC was impossible. Once the catalog files were available locally, SPCC could run. The later failures were color-quality failures, not Gaia-download failures.

## CFA Investigation

WBPP logged the raw data as `GBRG`. Because a wrong Bayer/CFA interpretation can turn red emission into green/cyan signal, we tested all four CFA interpretations.

Two diagnostics were useful:

1. A one-frame raw diagnostic with all four CFA choices.
2. A calibrated-frame diagnostic using WBPP's calibrated CFA output.

Both diagnostics showed the same pattern:

| CFA choice | Visual result |
|---|---|
| `GBRG` | green/cyan cast |
| `GRBG` | green/cyan cast |
| `RGGB` | more neutral/pink candidate |
| `BGGR` | more neutral/pink candidate |

This made `RGGB` and `BGGR` worth full WBPP reruns. However, full forced `RGGB` and forced `BGGR` integrations still became unacceptable after the automated background/color-calibration stages. That meant CFA was part of the suspicion, but not the whole explanation.

The active branch is now the forced-`RGGB` run because it showed the most promising pre-SPCC signal.

## Background And No-Flats Problem

The data has no flats. The forced-`RGGB` pre-SPCC stack contains real Rosette signal, but it also has strong magenta/vignetting structure. The historical DSS intermediate stack is faint gray-pink, and the old Photoshop result is red/pink, so the raw data does contain plausible H-alpha signal.

The current working theory is:

- The Rosette field is nebula-rich.
- There are no flats to correct vignetting cleanly.
- Automatic background extraction and SPCC background neutralization are likely treating a mix of nebulosity and uneven field illumination as "background."
- That process suppresses or rebalances the red/pink nebula into gray-green.

SPCC without background neutralization was also tested. It did not restore the red/pink color; it made the field worse, with a broad green cast.

## Other Linear Attempts

Several linear branches were tested:

| Attempt | Outcome |
|---|---|
| ABE subtraction | Solves and processes, but color becomes gray-green after SPCC |
| ABE division | Tested as a variant; did not fix the core issue |
| Canon EOS 60D SPCC filters | Accepted by SPCC, but did not restore red/pink color |
| Manual BN + ColorCalibration fallback | Tested; did not materially restore red/pink color |
| MGC wrapper | Added, but `MultiscaleGradientCorrection.executeOn()` returned false with current no-reference settings |

These tests pushed the next effort toward a stronger flat/gradient strategy rather than more basic SPCC parameter changes.

## Experimental Visual Branch

Because the calibrated SPCC branches remained gray-green, an explicitly experimental visual branch was created from the pre-SPCC forced-`RGGB` image.

This branch used:

1. ABE subtract correction.
2. Hard-applied STF stretch.
3. Green suppression and contrast/saturation curves.
4. Manual red-channel remix.
5. Final crop/export.

Outputs:

```text
work/03-nonlinear/rosette-redmix-experimental.jpg
work/03-nonlinear/rosette-redmix-experimental.tif
work/03-nonlinear/03r-rosette-redmix-final.xisf
```

This is the most visually red current output. It proves the integrated data can produce Rosette-like red/pink structure, but it is not color-calibrated and should not be treated as a scientific final.

## Synthetic-Background Branch

A first automated synthetic-background model was then tested before SPCC. It sampled presumed sky regions away from the Rosette, built a smooth model, and tried both subtract and divide corrections.

Main path:

```text
work/02-linear/02a-synthbg-subtract.xisf
work/02-linear/02b-synthbg-subtract-wcs.xisf
work/02-linear/02c-synthbg-subtract-spcc.xisf
work/02-linear/02d-synthbg-subtract-scnr.xisf
work/02-linear/02e-synthbg-subtract-linear-nr.xisf
work/03-nonlinear/03r-synthbg-calibrated-final.xisf
work/03-nonlinear/rosette-synthbg-calibrated-experimental.jpg
work/03-nonlinear/rosette-synthbg-calibrated-experimental.tif
```

Notes:

- Plate solving the synthetic-background output directly failed, so WCS was copied from the solved ABE branch.
- SPCC then completed with Canon EOS 60D filter curves.
- SCNR, MLT linear noise reduction, hard-STF stretch, and final export all completed.
- The final image has good structure, but it remains mostly gray/green.

Conclusion: the quick synthetic-background model was not strong enough to solve the color/background problem.

## Manual DBE Branch

Next we tried manual DBE because the automatic background strategies were either too blunt or too easily confused by faint nebulosity.

A guide image was created:

```text
work/diagnostics/dbe-manual-sample-guide.jpg
```

The guide marked suggested sample areas around the outer field and an avoid region over the central Rosette. The DBE samples were then placed by hand in PixInsight. The intent was to model the large-scale vignetting/gradient while avoiding real nebular signal.

This was a human-in-the-loop step: the user placed the DBE samples manually rather than relying on an automated sample generator.

Saved manual DBE files:

```text
work/02-linear/02a-dbe-manual-subtract.xisf
work/02-linear/02a-dbe-manual-background-model.xisf
```

The rendered background model looked smooth and large-scale, not like a recognizable Rosette. That was the first good sign that manual DBE was doing a more appropriate job than the earlier automated model.

The corrected DBE image was then plate-solved:

```text
work/02-linear/02b-dbe-manual-solved.xisf
```

Plate solving succeeded with a focal length around 385.64 mm. SPCC was then tried several ways:

| SPCC attempt | Result |
|---|---|
| Copied WCS + Canon EOS 60D filters | `executeOn()` returned `false` |
| Copied WCS, no background neutralization | `executeOn()` returned `false` |
| Clean cloned WCS image | `executeOn()` returned `false` |
| Freshly solved DBE image + Canon EOS 60D filters | `executeOn()` returned `false` |
| Freshly solved DBE image + default filters | `executeOn()` returned `false` |
| Interactive SPCC + Canon EOS 60D filters | Completed |
| Metadata-restored DBE image + Canon EOS 60D filters | Completed in scripted/headless run |
| Metadata-restored DBE image + Canon EOS 60D filters, no BN | Completed in scripted/headless run |

The DBE image itself had valid pixel ranges and the fresh plate solve succeeded. Interactive SPCC later completed on the same image, so the scripted `executeOn()` failure was not proof that SPCC could not process the data.

The actual cause was missing image metadata. Compared with the solved WBPP-derived branch, the manual-DBE solved file was missing camera/filter/exposure/CFA/noise/signal properties. A helper script was added:

```text
scripts/pjsr/copy-spcc-metadata.js
```

It copies only non-geometric SPCC-related metadata from a solved reference while preserving the target image pixels and WCS. Running it produced:

```text
work/02-linear/02b-dbe-manual-solved-spccmeta.xisf
```

After this, scripted SPCC succeeded both with and without SPCC background neutralization:

```text
work/02-linear/02c-dbe-manual-spccmeta-spcc.xisf
work/02-linear/02c-dbe-manual-spccmeta-spcc-no-bn.xisf
```

However, the SPCC result was still not visually useful. With background neutralization disabled, a plain linked-RGB stretch keeps a magenta/purple sky and a mostly gray Rosette. With SPCC background neutralization enabled, the sky becomes more neutral, but the Rosette remains gray/green rather than red/pink:

```text
work/02-linear/02c-dbe-manual-spcc-interactive.xisf
work/02-linear/02c-dbe-manual-spcc-interactive-bn.xisf
work/02-linear/02d-dbe-manual-spcc-interactive-bn-scnr.xisf
work/03-nonlinear/rosette-dbe-manual-spcc-no-bn-neutral-stretch.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-bn-neutral-stretch.jpg
```

SPCC diagnostic text export was enabled for the metadata-restored manual DBE branch:

```text
work/diagnostics/spcc-dbe-manual/SPCC-data.csv
```

It contains 2738 fitted stars. A quick median check showed the fitted image star colors were much stronger in red and blue relative to green than the Gaia-derived catalog expectations. Median image ratios were about `R/G=1.612` and `B/G=1.612`; median catalog ratios were about `R/G=0.804` and `B/G=0.536`. This explains the behavior: SPCC is scaling red and blue down hard to match the star fit, and that suppresses the Rosette's weak DSLR H-alpha color too.

Conclusion: the scripted/headless SPCC blocker is resolved. The remaining issue is a color-calibration quality problem caused by the interaction of no flats, residual background/gradient structure, stock DSLR response, and a nebula-rich field.

After this test, the working decision is to keep SPCC in the pipeline but not accept the current SPCC color as final. Further SPCC work should focus on improving the flat/gradient/background model before color calibration. The DSS-style branch remains a useful visual comparison, not a replacement for a solved SPCC path.

That visual branch was then generated from the manual DBE corrected image before the color-calibration steps:

```text
work/03-nonlinear/03r-dbe-manual-visual-hardstf.xisf
work/03-nonlinear/03r-dbe-manual-visual-redmix.xisf
work/03-nonlinear/03r-dbe-manual-visual-final.xisf
work/03-nonlinear/rosette-dbe-manual-visual-redmix.jpg
work/03-nonlinear/rosette-dbe-manual-visual-redmix.tif
```

This revealed the nebula, but it also showed a problem: a blunt red remix can make the whole background red/magenta. It proved that red signal exists, but it was not a satisfying output.

The branch was continued with fallback color calibration:

```text
work/02-linear/02c-dbe-manual-colorcal.xisf
work/02-linear/02d-dbe-manual-scnr.xisf
work/02-linear/02e-dbe-manual-linear-nr.xisf
work/03-nonlinear/03r-dbe-manual-final.xisf
work/03-nonlinear/rosette-dbe-manual-experimental.jpg
work/03-nonlinear/rosette-dbe-manual-experimental.tif
```

Conclusion: manual DBE improved the background model and produced the cleanest calibrated-style comparison so far, but it still did not recover a strong red/pink Rosette. The result is structurally good and useful, but still not an accepted final color result.

## Raw Preview And DSS-Style Background Calibration

The next clue came from human visual feedback on the CR2 files: the embedded camera preview shows faint red Rosette nebulosity. EXIF metadata for a representative CR2 frame reports Canon white-balance multipliers around:

```text
R = 1964
G = 1024
B = 1830
```

So the camera preview is not showing untouched linear raw color; it is applying a strong red/blue white balance and a camera preview tone curve. That explains part of why the CR2 looked redder than the PixInsight linear integrations.

We also found that our diagnostic preview scripts used PixInsight auto STF with `linkedRGB=false`. That is useful for seeing faint structure because each channel gets its own stretch, but it can hide the actual color balance. The scripts now support `linkedRGB=true`, and linked previews show that the raw and integrated data are strongly magenta before the background is re-anchored.

The historical DSS report also contained an important setting:

```text
Per Channel Background Calibration: Yes
```

To reproduce that idea, a new script was added:

```text
scripts/pjsr/02c-per-channel-background-cal.js
```

It scales channels if requested and then subtracts per-channel median offsets so the background is neutral again. Two variants were generated from the manual DBE output:

```text
work/02-linear/02c-dss-bgcal.xisf
work/02-linear/02c-camera-wb-bgcal.xisf
```

The final comparison outputs are:

```text
work/03-nonlinear/rosette-dss-bgcal-experimental.jpg
work/03-nonlinear/rosette-dss-bgcal-experimental.tif
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.jpg
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.tif
```

The `dss-bgcal` output is now the preferred restrained visual comparison. The `camera-wb-bgcal` output is stronger and closer to a camera-preview look. Neither is SPCC-calibrated, but both are more credible than the earlier global red remix because the background is not globally pushed red.

## Return To SPCC

After the scripted SPCC metadata problem was fixed, two more SPCC-focused tests were run.

First, the DSS-style per-channel background-calibrated image was made SPCC-ready by copying WCS and restoring metadata:

```text
work/02-linear/02c-dss-bgcal-wcs-spccmeta.xisf
work/02-linear/02c-dss-bgcal-spcc.xisf
work/02-linear/02c-dss-bgcal-spcc-no-bn.xisf
```

This completed, but it did not improve the color problem. The SPCC diagnostic ratios remained essentially the same as the manual DBE run.

Second, SPCC was rerun with `whiteReference=Photon Flux`:

```text
work/02-linear/02c-dbe-manual-spccmeta-spcc-photon-flux.xisf
work/02-linear/02c-dbe-manual-spccmeta-spcc-photon-flux-no-bn.xisf
```

This also completed, but the visual output and diagnostic ratios were practically unchanged. The useful conclusion is that the blocker is not a simple white-reference setting.

Since raw SPCC still rendered Rosette mostly gray/green, a labeled SPCC-based visual branch was generated. It starts from the successful manual-DBE SPCC background-neutralized image, applies a linked-RGB stretch, then selectively enhances diffuse nebular color with a luminance-shaped mask:

```text
scripts/pjsr/03r-rosette-spcc-visual-color.js
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.tif
```

A conservative star-reduction script was then added and tested:

```text
scripts/pjsr/03r-star-reduction.js
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained-star-reduced.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained-star-reduced.tif
```

This became the first credible SPCC-based visual candidate. It should be described carefully: SPCC is used as the calibration baseline, but the final pink/red nebula color is restored by selective nonlinear visual enhancement.

## v2 Visual Polish And Star Reduction

The first SPCC-based visual candidate was the best version so far, but it still had a non-neutral reddish/magenta background, too many dominant stars, and not quite enough contrast/vibrance in the Rosette. A second polish script was added:

```text
scripts/pjsr/03r-rosette-v2-polish.js
```

The v2 branch starts from:

```text
work/03-nonlinear/03r-dbe-manual-spcc-visual-restrained.xisf
```

Several variants were tested:

| Variant | Result |
|---|---|
| v2 | More vivid nebula, but the sky became too warm/red again |
| v2b | Over-corrected the sky slightly green/cool |
| v2c | Better compromise, but still a small green bias after red cleanup |
| v2d | More contrast/saturation and stronger stars, but still slight green in dark sky |
| v2e | Added low-luminance green-excess cleanup; darkest sky became close to neutral |
| v2f | Same v2e polish with more aggressive star reduction; only modest improvement because the original star mask missed many stars inside the nebula |
| v2g | Retuned the StarMask parameters to catch more stars in the Rosette while keeping the v2e background cleanup |

The best current output is:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.tif
work/03-nonlinear/03r-dbe-manual-spcc-visual-v2g-final.xisf
```

The rendered v2g star mask is also saved for diagnosis:

```text
work/03-nonlinear/masks/rosette-spcc-visual-v2g-star-mask.jpg
```

Quick JPEG sampling showed why v2g replaced the earlier restrained star-reduced output. The older restrained branch had low-sky medians around `R-G=+2..+3` and `B-G=+3..+4`, matching the user's reddish/pink background concern. The v2g branch measured around `R-G=-1` and `B-G=0..+1` in the same kind of dark-sky sample. Bright-pixel counts also dropped relative to v2e/v2f, confirming the star reduction is stronger.

Conclusion at this point: v2g became the preferred pre-StarXTerminator presentation candidate. It does not solve the underlying scientific color-calibration problem, but it was the best visual finish from the SPCC-calibrated manual-DBE baseline before the later StarXTerminator branch.

## Starless Experiment And Tool Decision

After v2g, the next desired step was a completely starless version so the nebula could be enhanced separately from the stars. The local PixInsight installation did not have StarNet or StarXTerminator installed, so a deterministic fallback script was added:

```text
scripts/starless-preview.py
```

This script uses local peak detection, masks, inpainting, and a few broad smoothing/morphological modes to approximate a starless support image. It produced several diagnostic outputs:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-balanced-v2.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-aggressive-v2.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-two-pass.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-smooth.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-clean.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-matte.jpg
```

None of these should be treated as final. The tighter mask/inpaint versions leave visible star scars and residual bright stars. The smoother/morphological versions remove more stars, but they lose too much texture or leave square-looking artifacts. The useful conclusion is that this dense Rosette field needs a real star-separation tool.

At this point, StarXTerminator became the recommended next tool for this project. The later 2026-05-26 session installed StarXTerminator, generated a clean starless layer and a stars-only layer, then finished the nebula and stars separately.

## 2026-05-26 — StarXTerminator V3 Presentation Branch

StarXTerminator was installed by the user and detected in PixInsight as a PJSR process with these usable properties:

```text
stars
unscreen
overlap
ai_file
```

Added a reusable separator:

```text
scripts/pjsr/starxterminator-separate.js
```

The separator was run on the pre-morphological v2e polish, rather than the already star-reduced v2g image, so StarXTerminator would see cleaner original star profiles:

```text
work/03-nonlinear/03r-dbe-manual-spcc-visual-v2e-polished.xisf
```

Outputs:

```text
work/03-nonlinear/03s-v2e-starxterminator-starless.xisf
work/03-nonlinear/03s-v2e-starxterminator-stars.xisf
work/03-nonlinear/rosette-starxterminator-v2e-starless.jpg
work/03-nonlinear/rosette-starxterminator-v2e-stars.jpg
```

The StarXTerminator starless layer is much cleaner than the earlier local inpaint/matte attempts. It exposes the remaining green/yellow background residue more clearly, so the recombination step has to stay conservative.

Added the Rosette-specific recombination/polish script:

```text
scripts/pjsr/03r-rosette-starless-v3.js
```

First recombination output:

```text
work/03-nonlinear/03s-rosette-starxterminator-v3.xisf
work/03-nonlinear/rosette-starxterminator-v3.tif
work/03-nonlinear/rosette-starxterminator-v3.jpg
```

This was clean, but still too star-dense relative to what StarXTerminator made possible.

Second recombination output:

```text
work/03-nonlinear/03s-rosette-starxterminator-v3b.xisf
work/03-nonlinear/rosette-starxterminator-v3b.tif
work/03-nonlinear/rosette-starxterminator-v3b.jpg
docs/images/rosette-starxterminator-v3b.jpg
```

`v3b` used lower star recombination strength and more star desaturation than the first v3 attempt. Quick JPEG sampling showed:

| Branch | Bright pixels >= 220 | Average sampled dark-sky R-G | Average sampled dark-sky B-G |
| --- | ---: | ---: | ---: |
| v2g | 1.166% | +0.71 | +0.94 |
| v3 | 0.906% | -0.18 | +0.64 |
| v3b | 0.240% | -0.49 | +0.61 |

Decision: `v3b` is now the preferred Rosette presentation candidate. It improves the star/nebula balance substantially and keeps sampled dark sky close to neutral. It is still a visual presentation branch, not proof that the pure SPCC color calibration is solved.

## Pause State

Rosette is no longer paused at the local starless experiment. The current presentation resume point is the StarXTerminator v3b branch; return to the linear/manual-DBE branches only if the goal is to improve calibration rather than presentation.

Best current presentation image:

```text
work/03-nonlinear/rosette-starxterminator-v3b.jpg
work/03-nonlinear/rosette-starxterminator-v3b.tif
work/03-nonlinear/03s-rosette-starxterminator-v3b.xisf
```

Previous presentation candidate:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.tif
work/03-nonlinear/03r-dbe-manual-spcc-visual-v2g-final.xisf
```

Best linear/SPCC diagnostic branch:

```text
work/02-linear/02a-dbe-manual-subtract.xisf
work/02-linear/02b-dbe-manual-solved-spccmeta.xisf
work/02-linear/02c-dbe-manual-spccmeta-spcc.xisf
```

Recommended resume plan:

1. Compare `rosette-starxterminator-v3b.jpg` against the historical 2014 Photoshop output and the v2g branch.
2. If the star field feels too reduced, make a gentler `v3c` by increasing `starScale` in `03r-rosette-starless-v3.js`.
3. Longer term, revisit flats/gradient correction before judging SPCC's raw color result again.

## Current Best Understanding

The project is no longer blocked on plate solving, Gaia catalog access, or scripted SPCC execution. It is blocked on robust color/background treatment for an old DSLR emission-nebula dataset with no flats.

Current evidence supports this interpretation:

- Plate solving works with the Rosette seed.
- SPCC runs successfully, including on the manual DBE branch after metadata restoration.
- Canon EOS 60D response filters are available and accepted.
- The red signal exists before aggressive calibration.
- Manual red remix can reveal red/pink nebulosity, but it pushes the background too much.
- Linked-RGB previews and DSS-style per-channel background calibration explain why the raw preview and old DSS/Photoshop result showed red while the SPCC/BN branches went gray-green.
- SPCC-calibrated paths remain gray/green after background handling.
- A simple synthetic-background model did not correct the field enough.
- Manual DBE improves large-scale background control, but still leaves the calibrated-style result mostly gray/green.
- SPCC diagnostics show that PixInsight is fitting many stars successfully, but the star-fit correction strongly reduces red and blue relative to green on this branch.
- SPCC-based visual enhancement can produce a credible pink Rosette without globally turning the sky red, but this is a presentation branch, not a pure SPCC color result.
- The v2g presentation branch had the best balance before StarXTerminator was installed.
- Local scripted starless approximations are not adequate for this field.
- StarXTerminator v3b is now the preferred presentation branch because it gives a cleaner nebula/stars separation and much lower bright-star dominance.

## Current Outputs

| Output | Role |
|---|---|
| `work/03-nonlinear/rosette-starxterminator-v3b.jpg` | Current preferred presentation candidate; StarXTerminator starless/stars recombination |
| `docs/images/rosette-starxterminator-v3b.jpg` | Small checked-in preview of the current preferred presentation candidate |
| `work/03-nonlinear/rosette-redmix-experimental.jpg` | Best visual red/pink checkpoint; not calibrated |
| `work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.jpg` | Previous SPCC-based visual candidate; v2 sky cleanup, stronger nebula contrast/vibrance, and retuned star reduction |
| `work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2e.jpg` | Balanced v2 background/nebula polish before the retuned v2g star mask |
| `work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2f-strong-stars.jpg` | Aggressive star-reduction comparison from the v2e polish |
| `work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-two-pass.jpg` | Best local scripted starless approximation; diagnostic only, not accepted |
| `work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-matte.jpg` | Broad starless support matte; diagnostic only, loses fine texture |
| `work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained-star-reduced.jpg` | Older SPCC-based visual candidate; selective nebula color enhancement plus mild star reduction |
| `work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.jpg` | Same SPCC-based visual candidate without star reduction |
| `work/03-nonlinear/rosette-dss-bgcal-experimental.jpg` | Best current restrained visual rendering; manual DBE plus DSS-style per-channel background calibration, not SPCC-calibrated |
| `work/03-nonlinear/rosette-camera-wb-bgcal-experimental.jpg` | Stronger camera-WB visual rendering; useful comparison, not SPCC-calibrated |
| `work/03-nonlinear/rosette-dbe-manual-spcc-bn-neutral-stretch.jpg` | Metadata-restored manual DBE SPCC branch, background-neutralized, plain linked stretch |
| `work/03-nonlinear/rosette-dbe-manual-spcc-no-bn-neutral-stretch.jpg` | Metadata-restored manual DBE SPCC branch without SPCC background neutralization, plain linked stretch |
| `work/03-nonlinear/rosette-dbe-manual-visual-redmix.jpg` | Older red remix; proves signal exists but over-pushes background |
| `work/03-nonlinear/rosette-dbe-manual-experimental.jpg` | Best background-controlled calibrated-style comparison; still gray/green |
| `work/03-nonlinear/rosette-synthbg-calibrated-experimental.jpg` | More calibrated comparison branch; still gray/green |
| `work/02-linear/02b-solved.xisf` | Reliable solved WCS reference |
| `work/02-linear/02a-abe.xisf` | Pre-SPCC ABE branch used for visual experiments |
| `work/02-linear/02a-dbe-manual-subtract.xisf` | User-guided manual DBE correction |
| `work/02-linear/02c-synthbg-subtract-spcc.xisf` | Synthetic-background SPCC branch |

## What We Should Try Next

The next useful work should focus on gradient/flat correction, not plate solving.

Priority options:

1. Compare `rosette-starxterminator-v3b.jpg`, `rosette-dbe-manual-spcc-visual-v2g-nebula-stars.jpg`, and `rosette-dss-bgcal-experimental.jpg` against the historical Photoshop output.
2. Search for real matching flats or twilight flats from the same setup.
3. Refine the manual DBE process or try a second DBE pass with different sample placement.
4. Try a dedicated external gradient/background tool if available.
5. Improve the pre-SPCC background/flat model, then rerun SPCC on the metadata-preserved/manual-DBE path.
6. Reconstruct the historical 31-frame DSS set and compare whether the older selection has a cleaner field.
7. Inspect rejection maps and frame quality before deciding whether to include the separated satellite-trail folders.

Only after a better gradient/flat correction should the SPCC color result be judged again.
