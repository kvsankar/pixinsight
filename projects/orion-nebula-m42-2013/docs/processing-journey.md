# Orion Nebula / M42 2013 Processing Journey

## 2026-05-26 - Source Inventory And Plan

Started the Orion/M42 project and paused before processing, per review request.

What was found:

- January 2013 has a provisional wide-field Orion dataset: 31 x 10s ISO 1600 and 30 x 5s ISO 3200 with a Canon EOS 60D. EXIF reports EF50mm f/1.8 II at 50 mm, but that should be treated as a solve guess, not as proven field scale.
- February 2013 has the main M42 material with a Canon EOS 60D; EXIF/lens metadata reports EF70-200mm f/2.8L IS II at 200 mm and f/3.5, but plate solve should confirm true scale:
  - 4 x 60s mixed ISO 800/1600
  - 1 x 120s ISO 800
  - 31 x 180s ISO 1600
  - 20 x 300s ISO 1600
  - 12 x 180s tree-obscured frames excluded for now
- The first-party astrophotography page confirms the historically published M42 result used 31 x 180s plus 20 x 300s at ISO 1600, 9 x 180s darks at 33 C, 6 flats, no bias, NEQ6 Pro GoTo, Canon EF 70-200 mm at 200 mm f/3.5, unmodified Canon EOS 60D, ST80 guide scope, SSAG, BackyardEOS, DeepSkyStacker, Photoshop Elements, and Neat Image.
- December 2013 has an ES ED80 trial folder, but the metadata shows very short generic ISO 100 frames. It is excluded until human review says otherwise.
- A historical M42 finished-work JPEG exists under `finished-work/20130208-M42-Orion-Nebula.jpg`.
- The old DSS file list combined 180s and 300s M42 lights, 180s darks, and six f/2.8 flats. For this PixInsight plan, mismatched darks/flats are not accepted automatically.
- The website's "6 flats" note makes the local `flat/20130211-f2.8-1by8000-1600iso` set more plausible as the historical flat set, but it still needs a PixInsight comparison because the M42 lights were f/3.5.

Research conclusion:

- M42 should be treated as an HDR target. The Trapezium/core needs a shorter matching exposure, while long exposures carry faint outer nebulosity.
- If the shortest matching February M42 material is still clipped, no process can truly recover the Trapezium. In that case, the honest finish is a dynamic-range-compressed M42, not a full Trapezium-preserved HDR image.

Current recommendation:

1. Run separate WBPP branches for the 180s, 300s, and 60s February M42 data.
2. Inspect core saturation and framing before any HDR merge.
3. Use 180s as the first baseline.
4. Keep the January Orion context data as a separate branch and plate solve it before naming the true field scale.
5. Pause for review before any processing.

## 2026-05-26 - Phase 1 Diagnostic WBPP Runs

After review approval, ran the first PixInsight/WBPP diagnostic branches for the February M42 data.

Completed branches:

- `wbpp-2013-m42-180s`: 31 x 180s lights, 9 x 180s/ISO1600/33 C darks, and the six historical flats. This produced master dark, master flat, and master light products. The linked-STF preview is usable for orientation but shows a strong green imbalance and large-scale background/flat artifacts.
- `wbpp-2013-m42-300s-nodark-test`: 20 x 300s lights and the six historical flats, with no darks because no matching 300s ISO1600 darks were found. This produced master flat and master light products. The field is flatter than the no-flats control, but gradients remain significant.
- `wbpp-2013-m42-60s-core-test`: a curated copy of only the three ISO1600 60s lights, plus 60s darks and flats. WBPP finished, but one light failed registration, leaving only two registered frames; integration was skipped because WBPP requires at least three.
- `wbpp-2013-m42-60s-core-nodark-test`: all four 60s folder frames, no darks, and the historical flats. This produced a diagnostic master, but it mixes ISO800 and ISO1600 and is not a clean final branch.
- `wbpp-2013-m42-180s-noflats`: same 180s lights and darks, no flats. This is a control branch for the f/2.8 historical flats.
- `wbpp-2013-m42-300s-nodark-noflats`: same 300s lights, no darks, no flats. This is a control branch for judging the historical flats on the long-exposure set.

Preview findings:

- The 180s flat-calibrated and no-flats controls both have a strong green linked-STF appearance. That points to channel/background calibration work still ahead rather than a simple flat-only problem.
- The 180s flat-calibrated branch has suspicious large-scale background structure; the no-flats branch has expected lens vignetting. Both should be carried into one controlled Phase 2 comparison.
- The 300s flat-calibrated branch is visually cleaner than the 300s no-flats control, but it lacks dark support and should be treated as faint-signal support rather than the main luminance/color anchor.
- The 60s diagnostic branch is too sparse for a robust stack. It may still be useful for a core crop check, but it should not be trusted blindly for HDR replacement.

Statistics check:

- Master maxima are below 1.0 in all inspected integrated masters, so the integrated files do not by themselves prove full saturation clipping.
- The Trapezium question is still open. Next evidence should be a core crop and raw-frame saturation audit across 60s, 180s, and 300s before using HDRComposition or saying the core is unrecoverable.

Current recommendation:

1. Pause before Phase 2.
2. Run Phase 2 on both `wbpp-2013-m42-180s` and `wbpp-2013-m42-180s-noflats` with identical crop/background/color settings.
3. Plate solve with 200 mm only as the initial focal-length guess and record the solved scale.
4. If the flat-calibrated 180s branch wins after background correction, use it as the baseline; otherwise use the no-flats branch and accept/correct the lens vignetting.
5. Bring the 300s flat-calibrated branch forward only if it adds faint outer nebulosity after registration to the 180s baseline.
6. Use the 60s diagnostic master only if a core crop shows it preserves real core structure.

## 2026-05-26 - Phase 2 Linear Comparison

Ran Phase 2 on the two 180s controls:

- `02-linear-2013-m42-180s-flat`
- `02-linear-2013-m42-180s-noflats`

Both completed ABE, plate solving, SPCC with Canon EOS 60D filters, SCNR, and MLT linear noise reduction.

Plate-solve findings:

- 180s with flats solved at 193.05 mm and 4.605 arcsec/px.
- 180s no-flats solved at 193.04 mm and 4.605 arcsec/px.
- This confirms the published 200 mm lens setting as the right acquisition description, while giving a solved processing scale slightly below nominal.

Visual comparison:

- The flat-calibrated 180s branch is usable, but the equal-stretch preview looks more aggressively subtracted around the outer M42 structure.
- The no-flats 180s branch retains more of the larger M42/M43 nebulosity after the same Phase 2 treatment. It is the current preferred baseline for the first nonlinear candidate.

Then ran Phase 2 on `wbpp-2013-m42-300s-nodark-test` as `02-linear-2013-m42-300s-flat-nodark`.

- The 300s branch solved at 193.17 mm and 4.602 arcsec/px.
- It needed registration to the 180s no-flats grid before meaningful crops could be compared.
- After registration, it can support faint outer nebulosity experiments, but it is noisy/gradient-heavy and lacks matching darks.

Core/HDR finding:

- Representative raw-frame ROI checks show clipped pixels in the core region, so the Trapezium warning is real.
- The 60s diagnostic master registered to the 180s no-flats grid, but its core crop is too weak and sparse to support a confident Trapezium replacement.
- The next candidate should be an honest dynamic-range-compressed M42 from the 180s no-flats baseline, with registered 300s support tested only through masks. Do not describe the result as fully recovering clipped Trapezium detail unless better short exposures are found.

## 2026-05-26 - First Nonlinear Candidate

Created a target-specific nonlinear script, `scripts/pjsr/03m-m42-v1-polish.js`, because the generic M31/Horsehead phase 3 scripts were not a good fit for M42's bright core and wide reflection/emission structure.

The nonlinear branch is `work/03-nonlinear-2013-m42-180s-noflats-v1/`.

Processing sequence:

- `03a-stretched.xisf`: conservative MaskedStretch from the preferred 180s no-flats Phase 2 master.
- `03m-m42-v1.xisf`: first M42 polish/export; useful proof, but the core retained an obvious magenta/cyan artifact.
- `03m-m42-v2.xisf`: added highlight desaturation/compression under the core mask.
- `03m-m42-v3.xisf`: stronger highlight desaturation/compression; this became the first usable review candidate before later core blending.

Current preview:

- [M42 2013 v3, 180s no-flats](images/m42-2013-v3-180s-noflats.jpg)

Assessment:

- v3 is a coherent first M42/M43/Running Man presentation and is much cleaner than the raw linked-STF diagnostics.
- The core is compressed and less falsely colored than v1/v2, but it is not a true Trapezium recovery.
- Registered 300s support has not been blended into v3. Keep it available for a later masked faint-nebulosity experiment, but do not add it until it clearly improves signal more than gradients/noise.

## 2026-05-27 - Core Refinement And Historical Comparison

Copied the historical finished-work JPEG into the project docs as [original-2013-finished-work](images/original-2013-finished-work.jpg) for public comparison.

Created additional core-focused variants:

- [v4](images/m42-2013-v4-180s-noflats.jpg): stronger core compression/desaturation, but rejected because the bright core shifted green.
- [v5](images/m42-2013-v5-180s-noflats.jpg): quieter, less false-colored core, but the whole nebula became too muted.
- [v6](images/m42-2013-v6-coreblend.jpg): core-only blend using v3 as the base and v5 as the quiet-core source. This became the preferred interim review candidate before later crop and faint-nebulosity revisions.

Created comparison panels:

- [Original vs v3 vs v5](images/m42-2013-original-v3-v5-comparison.jpg)
- [Original vs v3 vs v6](images/m42-2013-original-v3-v6-comparison.jpg)

Assessment:

- The 2013 version has a more familiar bright-core look, but its core is much more blown out.
- v3 preserves richer color in the new process but keeps a noticeable false-color core artifact.
- v6 is the best compromise so far: more depth and structure than the 2013 JPEG, better core control than v3, and less global muting than v5.

## 2026-05-27 - Crop And Presentation Revision

Reviewed the v6 candidate and identified two presentation issues:

- M42 sat too high in the final frame.
- The color and contrast were too subdued for the intended presentation.

The crop issue did not require recalibration, reintegration, plate solving, or a fresh linear workflow. It came from the final nonlinear crop parameters in `03m-m42-v1-polish.js`; the earlier crop used `centerY=0.650`, while v7 uses `centerY=0.565` with the same crop size to move the nebula lower in the final frame.

Created v7 outputs:

- [v7 rich](images/m42-2013-v7-rich.jpg): recentered crop with stronger field saturation and local contrast.
- [v7 quiet core](images/m42-2013-v7-corequiet.jpg): matching recentered crop with quieter core settings.
- [v7 core blend](images/m42-2013-v7-coreblend.jpg): quiet-core blend over the richer field with the blend center adjusted for the new crop.
- [v7 presentation](images/m42-2013-v7-presentation.jpg): final review candidate after a small reproducible presentation polish for excess-green reduction, darker background, stronger contrast, and stronger saturation.

Created comparison panel:

- [Original vs v6 vs v7 presentation](images/m42-2013-original-v6-v7-presentation-comparison.jpg)

Assessment:

- v7 corrects the high crop without rerunning the heavy processing stages.
- The v7 presentation version keeps the core substantially better controlled than the historical 2013 JPEG while giving the field more visual contrast and color than v6.
- The Trapezium is still not claimed as fully recovered; the available short-exposure data remains too sparse and clipped for a clean HDR replacement.

## 2026-05-27 - Background Nebulosity Revision

Reviewed v7 for missing/lacking background nebulosity. The likely cause was a combination of the 180s-only baseline, conservative no-flats background handling, and the v7 presentation black-point move.

Created v8 with two changes:

- Crop moved slightly back from v7: `centerY=0.585`, compared with `centerY=0.565` for v7 and `centerY=0.650` for the earlier too-high crop.
- Registered 300s data was tested as faint-nebulosity support, not as a full replacement layer.

Created v8 outputs:

- [v8 rich](images/m42-2013-v8-rich.jpg): 180s base with the revised crop.
- [v8 quiet core](images/m42-2013-v8-corequiet.jpg): matching crop for core blending.
- [v8 core blend](images/m42-2013-v8-coreblend.jpg): quiet-core blend with the v8 crop.
- [v8 300s support](images/m42-2013-v8-300s-support.jpg): registered 300s layer stretched/cropped to the v8 frame.
- [v8 300s support blend](images/m42-2013-v8-300s-supportblend.jpg): conservative brighten-only blend of the 300s support into the 180s v8 core blend.
- [v8 presentation](images/m42-2013-v8-presentation.jpg): accepted final v1 candidate with a lighter black point and faint-nebulosity lift.

Created comparison panel:

- [Original vs v7 vs v8 presentation](images/m42-2013-original-v7-v8-presentation-comparison.jpg)

Assessment:

- v8 restores more of the broad surrounding haze than v7 and places M42 slightly higher in the frame.
- The 300s support layer also brings extra background texture and residual gradient/noise. This is now the central review tradeoff: v7 is cleaner but more conservative; v8 is deeper but less smooth.
- The result still does not claim clean Trapezium recovery.

## 2026-05-27 - Final v1 Accepted

Accepted the v8 presentation branch as final v1 for the February 2013 M42/M43/Running Man result.

Final notes:

- [Final v1](final-v1.md)
- [Final v1 JPEG](images/m42-2013-v8-presentation.jpg)
- [2013 / v7 / final v1 comparison](images/m42-2013-original-v7-v8-presentation-comparison.jpg)

Acceptance rationale:

- v8 fixes the earlier high/low crop feedback with an intermediate crop position.
- v8 restores more background nebulosity than v7 by using the registered 300s layer conservatively.
- The additional 300s texture/noise is accepted as the cost of the deeper faint-nebulosity presentation.
- The core remains better controlled than the 2013 historical JPEG, while the documentation remains clear that this is not true Trapezium recovery.

## 2026-05-28 - BXT/NXT V1 Diagnostic

After the RC Astro licenses were installed, ran a post-final BlurXTerminator/NoiseXTerminator diagnostic on Orion. The branch starts from the accepted 180s no-flats SPCC checkpoint before the old MLT denoise:

```text
work/02-linear-2013-m42-180s-noflats/02c-spcc.xisf
```

Linear processing:

```text
work/02-linear-2013-m42-180s-noflats-bxt-nxt/02f-bxt.xisf
work/02-linear-2013-m42-180s-noflats-bxt-nxt/02g-bxt-nxt.xisf
work/02-linear-2013-m42-180s-noflats-bxt-nxt/02h-bxt-nxt-scnr.xisf
docs/images/m42-2013-bxt-nxt-linear-linked-stf.jpg
```

BXT was kept conservative (`sharpenStars=0.18`, `adjustHalos=0.03`, `sharpenNonstellar=0.25`). NXT used moderate denoise (`denoise=0.60`, `denoiseColor=0.82`, `denoiseLf=0.20`, `denoiseLfColor=0.60`, `iterations=2`, `detail=0.18`). A light SCNR pass followed the plugin pair.

Nonlinear processing reused the existing M42 machinery: MaskedStretch, rich/corequiet variants, core blend, and final presentation polish. Outputs:

```text
docs/images/m42-2013-bxt-nxt-v1-rich.jpg
docs/images/m42-2013-bxt-nxt-v1-corequiet.jpg
docs/images/m42-2013-bxt-nxt-v1-coreblend.jpg
docs/images/m42-2013-bxt-nxt-v1-presentation.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v1-comparison.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v1-core-crop.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v1-sky-crop.jpg
```

Initial assessment: this behaves much better than the M81/M82 plugin branch. It does not turn the background into colored scratch noise, and it opens the faint field while sharpening the M42 structure. The tradeoff is a brighter, more textured sky, and the branch is 180s-only rather than a fresh plugin treatment of both the 180s base and 300s support.

Review feedback preferred BXT/NXT v1 over the pre-BXT/NXT cut. A v2 branch then processed the 300s support layer through BXT/NXT, registered it to the 180s BXT/NXT branch, and blended it conservatively:

```text
work/02-linear-2013-m42-300s-flat-nodark-bxt-nxt/02h-bxt-nxt-scnr.xisf
work/registered-to-180s-bxt-nxt/300s-02h-bxt-nxt-scnr_to_180s_bxt_nxt.xisf
work/03-nonlinear-2013-m42-bxt-nxt-v2/03m-m42-bxt-nxt-v2-presentation.xisf
docs/images/m42-2013-bxt-nxt-v2-presentation.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v1-v2-comparison.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v1-v2-core-crop.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v1-v2-sky-crop.jpg
```

The 300s support blend uses `amount=0.12`, intentionally lower than the old v8 support blend. Initial read: v2 keeps the BXT/NXT structural improvement while adding a small amount of plugin-cleaned 300s haze. Later review found that it still carried too much background texture/noise, so it was demoted in favor of a cleaner 180s-only redo.

## 2026-05-31 - BXT/NXT V3 Noise Redo

Review feedback: M42 still looked noisy after v2. The likely cause was the combination of the no-dark 300s support layer and the presentation lift used to keep broad haze visible.

V3 was rebuilt as an 180s-only BXT/NXT branch rather than another support blend:

```text
work/02-linear-2013-m42-180s-noflats-bxt-nxt-v3/02f-bxt.xisf
work/02-linear-2013-m42-180s-noflats-bxt-nxt-v3/02g-bxt-nxt.xisf
work/02-linear-2013-m42-180s-noflats-bxt-nxt-v3/02h-bxt-nxt-scnr.xisf
work/03-nonlinear-2013-m42-bxt-nxt-v3/03a-stretched.xisf
work/03-nonlinear-2013-m42-bxt-nxt-v3/03m-m42-bxt-nxt-v3-presentation.xisf
```

Linear/plugin settings:

- BXT: `sharpenStars=0.16`, `adjustHalos=0.03`, `sharpenNonstellar=0.20`.
- NXT: `denoise=0.72`, `denoiseColor=0.90`, `denoiseLf=0.34`, `denoiseLfColor=0.80`, `frequencyScale=5`, `iterations=2`, `detail=0.10`.
- SCNR was applied after NXT.

Nonlinear changes:

- MaskedStretch target background reduced to `0.092`.
- Local contrast and saturation in the M42 polish were reduced.
- The first v3 presentation exposed a magenta core artifact, so a quiet-core variant was generated and blended into the no-300s base.
- Final presentation used no extra faint-nebulosity lift and a darker black point (`0.006`).

Outputs:

```text
docs/images/m42-2013-bxt-nxt-v3-no300s.jpg
docs/images/m42-2013-bxt-nxt-v3-corequiet.jpg
docs/images/m42-2013-bxt-nxt-v3-coreblend.jpg
docs/images/m42-2013-bxt-nxt-v3-presentation.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v2-v3-comparison.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v2-v3-core-crop.jpg
docs/images/m42-2013-v8-vs-bxt-nxt-v2-v3-sky-crop.jpg
```

Assessment: v3 is cleaner than v2 and avoids the no-dark 300s support texture, but gives up some of the extra faint haze v2 was trying to preserve. It is the current BXT/NXT replacement candidate for review.
