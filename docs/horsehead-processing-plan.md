# Horsehead / Flame Processing Plan

This plan is for combining the Horsehead Nebula / Flame Nebula data found in the external astronomy archive under `pictures/astronomy/images/by-date`. The goal is better signal-to-noise while avoiding the two easiest mistakes in this dataset: mixing incompatible raw frames in one integration, and letting modded-camera red response define the entire color solution.

Current outcome: v1 is accepted from the `04c` branch. See [Final v1](../projects/horsehead-flame-2013-2016/docs/final-v1.md) for the selected data mix, exclusions, and deliverables.

## Current Findings

Explicit Horsehead / Flame folders were found in three sessions:

| Session folder | Camera/body | Optics/frame | Candidate frames | Use |
| --- | --- | --- | ---: | --- |
| `20160109-yelagiri-ymca-flame-horsehead/good/modded` | Canon EOS Rebel T1i, modified | narrow field | 28 CR2, 84 min | Primary H-alpha-rich signal |
| `20160109-yelagiri-ymca-flame-horsehead/washed-out-maybe` | Canon EOS Rebel T1i, modified | narrow field | 41 CR2, 205 min | Included in v1 at half weight |
| `20131231-coorg-keemale-flame-horsehead/good-with-geosats` | Canon EOS 60D, unmodified | narrow field | 23 CR2, 92 min | Primary broadband/color data; satellite rejection needed |
| `20160109-yelagiri-ymca-flame-horsehead/good/unmodded` | Canon EOS 60D, unmodified | narrow field | 7 CR2, 31 min | Deferred from v1; small mixed-exposure support branch only |
| `20130208-coorg-keemale-m42-flame-horsehead/180s-1600iso` and `300s-1600iso` | Canon EOS 60D, unmodified | 70mm wide field | 51 CR2, 193 min | Excluded from v1; separate wide-field/context master only |

Folders to skip for the main integration: `bad`, `bad-tree-shadow`, `tree-obscured`, `aborted`, `trial-shots`, previews, JPGs, old TIF/PSD processing outputs, and `20130113-yelagiri-ymca-orion` unless a separate wide Orion context image is desired.

Calibration material found:

| Calibration set | Likely use | Caveat |
| --- | --- | --- |
| `dark/canon-eos-60d/library-02` | 60D darks for several ISO1600 exposure/temperature buckets | Has no 300s bucket visible in the summary; 240s exists |
| `flat/20160109-yelagiri-ymca-flats/good` | T1i flats for 2016 modded data | Looks consistent: 34 flats at ISO1600 |
| `flat/20160109-yelagiri-ymca-flats/unsorted` | 60D flats from the same trip | Needs curation; mostly 1/100s ISO1600 frames |
| `flat/20130211-f2.8-*` | Possible 2013 February 70mm/f2.8 flats | The lights are at f/3.5, so these are fallback only |

No T1i dark library or bias frames were found in the first pass.

## Processing Principles

1. Integrate by compatible acquisition group first.

   Do not put all Horsehead CR2 files into a single WBPP run. Different camera bodies, modified vs unmodified spectral response, exposure lengths, frame scale, and likely calibration availability need separate masters.

2. Use the modded T1i data as strong red/H-alpha signal, not as the sole color truth.

   Canon's EOS 60Da material is a useful proxy for why this matters: Canon documents that modifying the IR filter can increase H-alpha sensitivity around 656 nm by about 3x relative to the stock EOS 60D. That is good for emission nebula signal, but it means stock-camera color calibration should not be blindly mixed with modded-camera color response.

3. Treat wide-field data as a separate master.

   The 70mm frames can help with context, large-scale background, and maybe low-frequency color/nebulosity. They should not be expected to improve fine Horsehead detail after resampling to the narrower field.

4. Make the best narrow-field stack first.

   The baseline result should use clean narrow-field data only. The washed-out and wide-field experiments should be added only after they visibly improve the result.

5. Keep every experimental branch reproducible.

   Each integration branch should have its own notes, command line, master output, and quality decision.

## Script Customization Plan

Implemented on 2026-05-25 in `scripts/run-wbpp-phase1.ps1` and `.env.example`:

| Change | Status | Why |
| --- | --- | --- |
| Add `-FlatDir` / `-FlatDirs` and `PI_FLAT_DIR` / `PI_FLAT_DIRS` | Done | Needed for 2016 T1i flats and curated 60D flats |
| Add optional `-BiasDir` / `-BiasDirs` and env equivalents | Done | Useful if bias frames are later found or generated |
| Add optional `-DarkDirs` / `PI_DARK_DIRS` | Done | Lets a session use multiple dark temperature buckets without manual copying |
| Add `-AllowNoDarks` and `PI_ALLOW_NO_DARKS` | Done | Allows documented control runs when matching T1i darks are unavailable |
| Add `-OutputSubdir` and `PI_WBPP_OUTPUT_SUBDIR` | Done | Allows separate outputs such as `wbpp-2016-modded-good` and `wbpp-60d-broadband` |
| Keep light enumeration non-recursive by default | Done | Prevents accidental inclusion of `bad`, `tree-obscured`, previews, or old processing outputs |
| Print counts per frame type and directory | Done | Makes mistakes obvious before PixInsight starts |
| Save the WBPP command per run | Done | Preserves reproducibility |
| Add `scripts/pjsr/register-to-reference.js` | Done | Registers solved support masters to the 60D color reference before blend tests |
| Add `scripts/pjsr/blend-red-support.js` | Done | Makes reproducible first-pass RGB plus modified-camera red-support comparison branches |
| Add `scripts/pjsr/render-cropped-reference-stf-jpeg.js` | Done | Keeps candidate previews comparable with one crop and one reference stretch |
| Add `scripts/pjsr/roi-stats.js` | Done | Quantifies support-branch tradeoffs in fixed regions |
| Add `scripts/pjsr/crop-xisf.js` | Done | Applies the selected crop before nonlinear checkpoints |
| Add `scripts/pjsr/03h-horsehead-v1-polish.js` | Done | Produces the first target-specific nonlinear v1 candidate and exports |

Do not change the existing default behavior for current M31/Rosette commands.

## Execution Plan

### Phase 0: Project Setup

Created project scaffold:

```powershell
& .\scripts\new-project.ps1 -Slug horsehead-flame-2013-2016
```

Then create project notes:

- `projects/horsehead-flame-2013-2016/docs/status.md`
- `projects/horsehead-flame-2013-2016/docs/processing-journey.md`
- `projects/horsehead-flame-2013-2016/docs/pipeline.md`

Record the source inventory above, including which folders are in scope and which are deliberately skipped.

### Phase 1: Curated WBPP Runs

Run these as separate WBPP outputs:

1. `2016-modded-good`
   - lights: `20160109-yelagiri-ymca-flame-horsehead/good/modded`
   - flats: `flat/20160109-yelagiri-ymca-flats/good`
   - darks: only if a matching T1i dark set is found; otherwise document no-dark/flat-only calibration risk

2. `2016-modded-washed-out-test`
   - lights: `20160109-yelagiri-ymca-flame-horsehead/washed-out-maybe`
   - flats: same T1i flat set
   - decision gate: include only if Blink/SubframeSelector and the resulting master show usable signal without damaging gradients

3. `60d-broadband-narrow`
   - v1 lights: `20131231-coorg-keemale-flame-horsehead/good-with-geosats`
   - optional later test: `20160109-yelagiri-ymca-flame-horsehead/good/unmodded`
   - flats: none used for the v1 2013 branch; curated 60D flats remain a possible later 2016 branch input
   - darks: 60D 240s ISO1600 library bucket for the 2013 branch
   - rejection: large-scale high rejection enabled because the folder explicitly contains geostationary satellite trails

4. `2013-70mm-widefield`
   - lights: `20130208-coorg-keemale-m42-flame-horsehead/180s-1600iso` and `300s-1600iso`
   - calibration: 60D dark library; flats only if the f/2.8 flat fallback is acceptable after inspection
   - purpose: context master or low-frequency support, not fine-detail SNR

### Phase 2: Master Review

For each WBPP result:

- inspect rejection maps,
- inspect star shapes and registration failures,
- compare gradients,
- note whether satellite trails survive,
- render a small STF JPEG for project docs,
- record the accepted/rejected frame groups in `processing-journey.md`.

Decision gates and outcomes:

- `washed-out-maybe` helped red/H-alpha signal but increased halo cost, so v1 uses it at half weight.
- 2013 70mm wide-field data stays out of v1 and remains a separate presentation/context option.
- The 2016 unmodified 60D set stays out of v1 because it is only 7 mixed-exposure frames.
- If 60D calibration is poor because flats/darks mismatch, try a no-flats or dark-only control integration before discarding the data.

### Phase 3: Registration And Combination

Use the best narrow-field master as the geometric reference. Register other accepted masters to it with distortion correction.

Combination strategy:

1. Calibrate color on the best unmodified 60D broadband master.
2. Use the modded T1i master to enhance red/H-alpha structure with masks or channel/luminance blending.
3. Compare:
   - 60D-only broadband,
   - T1i-only modded,
   - 60D color plus T1i red/H-alpha enhancement,
   - same blend with `washed-out-maybe`,
   - optional wide-field low-frequency support.

The likely best final is 60D broadband color with carefully weighted modded T1i red/H-alpha signal.

### Phase 4: Linear Processing

Use the existing repo phase pattern where possible:

- background extraction suitable for strong IC 434 emission and nearby Alnitak gradients,
- plate solve with Horsehead coordinates,
- SPCC on the broadband master where camera/filter response is meaningful,
- noise reduction while linear,
- preserve the Horsehead as a dark silhouette against IC 434.

Suggested solve seed:

- RA: about `85.246`
- Dec: about `-2.458`

### Phase 5: Nonlinear Processing

Stretch conservatively:

- protect Alnitak and bright stars,
- avoid flattening the IC 434 red emission curtain,
- keep the Horsehead dark but not clipped,
- separate star and nebula adjustments only if they improve the image naturally,
- produce both a tight Horsehead/Flame crop and a wider context version if the 70mm data earns its keep.

## Success Criteria

The project is ready to process when:

- the WBPP wrapper supports flats and named output subdirectories,
- each source group has a documented inclusion/exclusion decision,
- each accepted group has its own master,
- the final combination improves S/N without softening the Horsehead,
- the final color is not dominated by the modded camera's red response,
- all outputs remain under project `work/`, and docs contain only public-safe paths.

## References

- NASA Science: [The Horsehead Nebula](https://science.nasa.gov/asset/hubble/the-horsehead-nebula/) - identifies Barnard 33 as a dark cloud silhouetted against IC 434 and lists H-alpha Hubble data.
- NASA Science: [Horsehead Nebula (Infrared)](https://science.nasa.gov/asset/hubble/horsehead-nebula-infrared/) - useful context for the target's structure and surrounding Orion Molecular Cloud.
- Canon: [EOS 60Da product sheet](https://downloads.canon.com/nw/brochures/pdf/camera/brochures/canoneos60da-productpage.pdf) - documents increased H-alpha sensitivity around 656 nm relative to the EOS 60D.
- PixInsight: [M31 H-alpha Processing Notes](https://pixinsight.com/examples/M31-Ha/) - reference for LocalNormalization and multi-source H-alpha/broadband combination ideas.
- PixInsight: [A New Approach to Combination of Broadband and Narrowband Data](https://pixinsight.com/tutorials/narrowband/) - reference for treating H-alpha-like support as a separate signal rather than a simple raw-frame mix.
- PixInsight: [New Image Weighting Algorithms](https://pixinsight.com/doc/docs/ImageWeighting/ImageWeighting.html) - reference for image weighting and integration behavior.
