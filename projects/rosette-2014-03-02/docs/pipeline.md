# Rosette Nebula Processing Pipeline

This is the current working plan for the 2014 Rosette Nebula data. It began by borrowing the proven M31 automation structure, but the target is different: Rosette is a faint emission nebula with embedded cluster stars, not a broadband galaxy.

For the chronological record of experiments and decisions, see [Processing journey](processing-journey.md).

## Phase 1 — Calibration + Integration

Use WBPP with:

- Lights: start with top-level `good/east` + `good/west` CR2 files, 33× 240s ISO 1600.
- Darks: 9× 240s ISO 1600 darks from the Canon EOS 60D library.
- Flats: none.
- Bias: none.
- Debayer: force `RGGB` for the current PixInsight test branch. WBPP auto-detected `GBRG`, but dataset diagnostics made `RGGB`/`BGGR` stronger candidates.
- Dark optimization: off.
- Registration: distortion correction on.
- LocalNormalization: on.
- Rejection: Winsorized sigma clipping, large-scale high rejection enabled.
- Plate solving in WBPP: off.

Potential alternate run: reconstruct the historical 31-frame DSS selection and compare integration quality. The current 33-frame run is a repeatable PixInsight baseline, not a claim that it exactly matches the 2014 DSS stack.

## Phase 2 — Linear Processing

1. DynamicCrop only if stacking edges require it.
2. Background/gradient correction. No flats are available, so this is the critical stage.
3. Plate solve the integrated master using the Rosette seed, not the M31 defaults. The solved scale is about 385-386 mm, not the CR2 `50 mm` EXIF value.
4. SPCC if WCS and Gaia DR3/SP are available. Use Canon EOS 60D R/G/B response filters for this dataset.
5. Mild linear noise reduction.

### Findings So Far

The first automated Phase 2 run plate-solved successfully and SPCC completed, but the preview color is wrong: the Rosette appears cyan-green/gray-green instead of red/pink. Do not proceed to final nonlinear processing from that linear master until the background/color issue is resolved.

SPCC without background neutralization was tested and did not fix the color. A one-frame CFA-pattern diagnostic was then run. `GBRG` and `GRBG` reproduce the green/cyan cast, while `RGGB` and `BGGR` look much more neutral. Full WBPP reruns with forced `RGGB` and `BGGR` were then tested. Both still become unacceptable after the automated background/color stage, so the next lead is not simple CFA order but no-flats gradient correction and background neutralization.

The current active branch is forced `RGGB`. Before SPCC, it shows pink/magenta signal and severe vignetting. After SPCC/background neutralization, the nebula is driven gray-green. This suggests the automation is treating a nebula-rich, poorly flattened field as background.

The project is not currently blocked by plate solving, Gaia catalog access, or scripted SPCC execution. The earlier scripted SPCC failure on the user-guided manual DBE branch was traced to missing non-geometric metadata on the DBE-derived image. Restoring camera/filter/exposure/CFA/noise/signal metadata from the solved WBPP-derived reference made SPCC succeed on that branch. The main blocker is now trustworthy background/flat correction before judging the SPCC color result.

After the user noticed visible red in the CR2 raw preview, we traced the color earlier in the chain. The CR2 embedded preview does show faint red nebulosity and the metadata reports Canon white-balance multipliers around `R=1964`, `G=1024`, `B=1830`. Our own preview scripts were also using unlinked/channel-independent STF, which is good for seeing faint structure but misleading for judging color. The render and hard-STF scripts now support `linkedRGB=true` for color-faithful previews and stretches.

Next background strategies to test:

- Manual DBE or a stronger synthetic-flat workflow with samples kept off nebulosity.
- GraXpert or another gradient tool if installed.
- A lower-order, less aggressive ABE only as a starting point, followed by manual correction.
- Real flats, if any matching calibration frames can be found.

### Synthetic-Background Attempt

A first automated synthetic-background correction was tested from the forced-`RGGB` master. The branch sampled presumed sky regions, subtracted a smooth background model, copied the astrometric solution from the solved ABE branch, and then ran SPCC with Canon EOS 60D filter curves. It completed through SCNR, MLT linear noise reduction, hard-STF stretch, and final export.

Outputs:

```text
work/02-linear/02a-synthbg-subtract.xisf
work/02-linear/02b-synthbg-subtract-wcs.xisf
work/02-linear/02c-synthbg-subtract-spcc.xisf
work/03-nonlinear/rosette-synthbg-calibrated-experimental.jpg
work/03-nonlinear/rosette-synthbg-calibrated-experimental.tif
work/03-nonlinear/03r-synthbg-calibrated-final.xisf
```

Result: this is a useful calibrated comparison branch, but it is still mostly gray/green. The quick synthetic model did not solve the no-flats/background-neutralization problem.

### Manual DBE Attempt

A user-guided DBE pass was run interactively on the forced-`RGGB` WBPP master. A reference JPEG was created at:

```text
work/diagnostics/dbe-manual-sample-guide.jpg
```

The DBE samples were placed mostly around the outer field, avoiding the central Rosette and obvious nebulosity. The saved files were:

```text
work/02-linear/02a-dbe-manual-subtract.xisf
work/02-linear/02a-dbe-manual-background-model.xisf
```

The background model preview looked like smooth large-scale vignetting/gradient, not a recognizable Rosette-shaped model. That is a good sign: DBE did not obviously subtract the main nebula.

Follow-up processing:

```text
work/02-linear/02b-dbe-manual-solved.xisf
work/02-linear/02c-dbe-manual-colorcal.xisf
work/02-linear/02d-dbe-manual-scnr.xisf
work/02-linear/02e-dbe-manual-linear-nr.xisf
work/03-nonlinear/rosette-dbe-manual-experimental.jpg
work/03-nonlinear/rosette-dbe-manual-experimental.tif
work/03-nonlinear/03r-dbe-manual-final.xisf
```

Result: this branch has the best background control so far, and the Rosette structure is clear. The initial scripted SPCC runs returned `false` with both Canon EOS 60D filters and default filters. That was later diagnosed as a metadata problem: manual DBE preserved pixels and WCS, but the derived image was missing SPCC-relevant image properties that the solved WBPP branch still had. Running `copy-spcc-metadata.js` produced:

```text
work/02-linear/02b-dbe-manual-solved-spccmeta.xisf
```

After that, scripted SPCC succeeded:

```text
work/02-linear/02c-dbe-manual-spccmeta-spcc.xisf
work/02-linear/02c-dbe-manual-spccmeta-spcc-no-bn.xisf
work/03-nonlinear/rosette-dbe-manual-spcc-bn-neutral-stretch.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-no-bn-neutral-stretch.jpg
```

The SPCC execution blocker is therefore resolved. The color result is still not accepted: the background-neutralized SPCC branch has a mostly gray/green Rosette, while the no-background-neutralization branch leaves a magenta/purple sky.

### Per-Channel Background Calibration Attempt

The historical DSS report says `Per Channel Background Calibration: Yes`. To reproduce that behavior, we added a PixInsight script that optionally scales channels and then subtracts per-channel median offsets so the sky background is re-anchored after color scaling.

Inputs:

```text
work/02-linear/02a-dbe-manual-subtract.xisf
```

Linear outputs:

```text
work/02-linear/02c-dss-bgcal.xisf
work/02-linear/02c-camera-wb-bgcal.xisf
```

Final comparison outputs:

```text
work/03-nonlinear/rosette-dss-bgcal-experimental.jpg
work/03-nonlinear/rosette-dss-bgcal-experimental.tif
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.jpg
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.tif
```

Result: this is the best explanation so far for the gap between the old DSS/Photoshop result and the earlier PixInsight attempts. A global red remix turns the whole field red, but per-channel background calibration keeps the sky gray while preserving the nebula's red/pink excess. The `dss-bgcal` branch is the preferred restrained visual comparison; the `camera-wb-bgcal` branch is a stronger preview-like variant based on Canon CR2 white-balance multipliers. Neither is SPCC-calibrated.

### DSS-Style Background Calibration Before SPCC

The DSS-style background-calibrated linear file was also made SPCC-ready by copying WCS and restoring SPCC metadata:

```text
work/02-linear/02c-dss-bgcal-wcs-spccmeta.xisf
work/02-linear/02c-dss-bgcal-spcc.xisf
work/02-linear/02c-dss-bgcal-spcc-no-bn.xisf
```

Result: SPCC succeeds, but the color problem remains. The diagnostic star-fit ratios are essentially unchanged from the manual-DBE SPCC run, so subtracting per-channel background medians before SPCC does not solve the calibration mismatch.

### SPCC White Reference Test

SPCC was rerun on the metadata-restored manual DBE branch with `whiteReference=Photon Flux`:

```text
work/02-linear/02c-dbe-manual-spccmeta-spcc-photon-flux.xisf
work/02-linear/02c-dbe-manual-spccmeta-spcc-photon-flux-no-bn.xisf
```

Result: the run completed, but the practical output and diagnostic ratios matched the `Average Spiral Galaxy` run. This is not the lever that fixes Rosette color.

### Current Phase 2 Recommendation

Keep SPCC in the pipeline, but do not judge it until the linear background model is better. For DBE-derived images, either preserve SPCC-relevant metadata through the processing step or run `copy-spcc-metadata.js` before SPCC.

1. Search for real matching flats.
2. If no flats exist, refine manual DBE with conservative samples placed off nebulosity.
3. If available, test a dedicated external gradient/background tool and bring the corrected linear image back to PixInsight.
4. Reuse the solved WCS reference or re-solve after correction, restore SPCC metadata if needed, then rerun SPCC.
5. Use the DSS-style per-channel background-calibrated branch as a visual comparison, not as the scientific color-calibrated path.

## Phase 3 — Nonlinear Processing

Rosette needs a different nonlinear emphasis than M31:

- Preserve faint red emission.
- Avoid over-neutralizing the nebula as if it were background.
- Protect stars and the central cluster.
- Use restrained saturation; unmodified DSLR data may have weak H-alpha response.
- Consider a star mask earlier than in the M31 flow.
- Do not reuse the M31 galaxy-enhancement stages blindly; they are tuned for broadband galaxy structure, not emission nebulosity.

### Experimental No-SPCC Finish

Since the SPCC path still over-neutralizes the nebula, an experimental visual branch was run from the pre-SPCC `02a-abe.xisf` image:

1. Hard-apply STF with `03r-rosette-hardstf.js`.
2. Apply mild SCNR, contrast/saturation curves, and local contrast.
3. Apply `03r-rosette-color-remix.js` to boost red and reduce green.
4. Crop/export with `03c-final-export.js`.

Outputs:

```text
work/03-nonlinear/rosette-redmix-experimental.jpg
work/03-nonlinear/rosette-redmix-experimental.tif
work/03-nonlinear/03r-rosette-redmix-final.xisf
```

This is deliberately marked experimental because it is not SPCC-calibrated and includes manual color remixing. It is useful as proof that the integrated data contains Rosette signal and can produce a red/pink visual result.

### Manual DBE Visual Finish

After manual DBE improved the background model, a second visual branch was run from `02a-dbe-manual-subtract.xisf`, before SPCC or fallback color calibration:

```text
work/03-nonlinear/rosette-dbe-manual-visual-redmix.jpg
work/03-nonlinear/rosette-dbe-manual-visual-redmix.tif
work/03-nonlinear/03r-dbe-manual-visual-final.xisf
```

This older output combines better manual-DBE background control with deliberate red/pink color remixing. It is not scientifically color-calibrated, and the later DSS-style branch is preferred because it avoids pushing the whole background red.

### DSS-Style Visual Finish

After tracing the raw CR2 preview color and the historical DSS settings, the preferred visual branch is now:

```text
work/03-nonlinear/rosette-dss-bgcal-experimental.jpg
work/03-nonlinear/rosette-dss-bgcal-experimental.tif
work/03-nonlinear/03r-dss-bgcal-final.xisf
```

A stronger camera-white-balance variant is also available:

```text
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.jpg
work/03-nonlinear/rosette-camera-wb-bgcal-experimental.tif
work/03-nonlinear/03r-camera-wb-bgcal-final.xisf
```

These are not SPCC-calibrated, but they are more defensible visual experiments than the blunt red remix because the background is calibrated per channel before the final linked-RGB stretch.

### SPCC-Based Visual Finish

After the SPCC execution issue was fixed, a new visual branch was generated from the manual-DBE SPCC background-neutralized image:

```text
work/02-linear/02c-dbe-manual-spccmeta-spcc.xisf
work/03-nonlinear/03r-dbe-manual-spcc-bn-neutral-stretch.xisf
work/03-nonlinear/03r-dbe-manual-spcc-visual-restrained.xisf
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained.tif
```

The branch uses `03r-rosette-spcc-visual-color.js` to selectively restore pink/red nebulosity in the nonlinear image with a luminance-shaped mask. A second output applies a very conservative star-reduction pass:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained-star-reduced.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-restrained-star-reduced.tif
work/03-nonlinear/03r-dbe-manual-spcc-visual-restrained-star-reduced-final.xisf
```

Result at this point: this became the first credible SPCC-based presentation candidate. It is still not a pure raw-SPCC color result; it should be described as SPCC-calibrated baseline plus selective visual nebula color enhancement.

### SPCC-Based v2 Polish

The restrained SPCC-based visual output still had a warm/magenta sky and too many dominant stars. The next branch used `03r-rosette-v2-polish.js` to make low-luminance sky cleanup explicit and to add more nebula contrast/vibrance without a global red push.

The best current v2 candidate is:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-nebula-stars.tif
work/03-nonlinear/03r-dbe-manual-spcc-visual-v2g-final.xisf
```

Supporting comparison files:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2e.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2f-strong-stars.jpg
work/03-nonlinear/masks/rosette-spcc-visual-v2g-star-mask.jpg
```

The v2e/v2g polish parameters use selective dark-sky red/blue/green cleanup, `contrast=0.22`, `redLift=0.23`, `greenDrop=0.12`, and `satAmount=0.14`. The v2g star-reduction pass uses a lower StarMask noise threshold and a less nebula-biased mask than the first pass, so stars inside the Rosette are reduced more effectively.

Result: v2g is the current best presentation output. It keeps the SPCC-calibrated manual-DBE baseline, has a much more neutral background than the earlier restrained candidate, and has stronger nebula color/contrast with additional star reduction. It is still a visual finish, not proof that the raw SPCC color calibration is solved.

### Starless Follow-Up

A local fallback starless script was added after v2g:

```text
scripts/starless-preview.py
```

It generated several starless approximation outputs from the v2g JPEG:

```text
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-balanced-v2.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-aggressive-v2.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-two-pass.jpg
work/03-nonlinear/rosette-dbe-manual-spcc-visual-v2g-starless-matte.jpg
```

Result: not accepted as final. The mask/inpaint paths leave visible star scars and residual bright stars; the broad matte path removes more stars but gives up too much fine texture. The next nonlinear work should use StarXTerminator or a comparable neural star-separation tool instead of trying to push the local fallback further.

Recommended StarXTerminator workflow when Rosette resumes:

1. Start from `work/03-nonlinear/03r-dbe-manual-spcc-visual-v2g-final.xisf` if available.
2. Generate starless and stars-only layers.
3. Apply nebula contrast/vibrance changes only to the starless layer.
4. Reduce and optionally desaturate the stars-only layer.
5. Recombine gently and export a new presentation candidate.

## Open Questions

- Can a better gradient/flat correction preserve the faint red/pink H-alpha signal before SPCC?
- Can the SPCC star-fit ratios become less aggressive after a better flat/gradient model?
- Can the DSS-style per-channel background calibration be refined into a repeatable Phase 2 visual path without over-saturating stars?
- Are the east/west groups aligned enough for a single integration, or do they need separate registration treatment?
- Should the first run use the simple 33-frame top-level good set, or the historical 31-frame DSS set?
- Would the separated satellite-trail frames help after stronger rejection, or do they add more trouble than signal?
- How much better does the v2g branch become after real star separation and starless-only nebula enhancement?
