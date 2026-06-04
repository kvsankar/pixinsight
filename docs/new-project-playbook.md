# New Project Playbook

Use this playbook when starting a new astrophotography target/session in this PixInsight automation repo. It captures the workflow that has worked across M31, Rosette, Horsehead/Flame, M42, and Trifid/Lagoon, now updated for the licensed RC Astro plugin workflow in [RC Astro plugin workflow](rc-astro-workflow.md). It also includes first-pass guardrails for moving targets such as comets, where star-aligned and target-aligned products must be planned separately.

## Operator Prompt Template

When starting a target, the user can give a compact prompt like this:

```text
Pick up <target name> from <local archive folder>.
Search the local by-date image archive for related collections, old finished-work images, processing attempts, stacking artifacts, and calibration data.
Research target-specific PixInsight processing considerations and customize the plan for my actual data.
Document the inventory, research, calibration choices, processing plan, and review questions.
Do not start heavy processing until the plan is ready for review, unless I explicitly say "proceed".
```

Useful optional details:

```text
Likely camera/optic:
Known site/date:
Historical image to match:
Whether old-reference style or cleaner modern processing is preferred:
Any known bad folders or calibration caveats:
For comets or asteroids: whether frames were star-tracked, target-tracked, or mixed:
Whether camera timestamps are local time or UTC:
```

## Agent Procedure

### Data Authenticity Guardrail

All visible sky content must come from the user's captured frames or products directly derived from those frames. Reference images can guide review language and taste, but do not synthesize, paint, clone, or generate stars, spikes, nebulosity, background texture, or any other astrophotography content.

### 0. Load Local-Only Archive Context

Actual archive roots are private machine details. They should live only in ignored local files such as `.env` or `.env.local`, or be provided by the user in the current session.

Supported local-only variables:

```text
PI_ARCHIVE_ROOT=<local astronomy image archive root>
PI_BY_DATE_DIR=<local by-date image folder>
PI_FINISHED_WORK_DIR=<local finished-work folder>
PI_DARK_LIBRARY_DIR=<local dark library folder>
PI_FLAT_LIBRARY_DIR=<local flat library folder>
```

Use these values for local searches, but never commit them. In public docs, write archive-relative paths such as `by-date/<date-site-target>/good`.

### 1. Identify The Project Shape

Start by finding the target's actual archive context.

- Treat the user-provided folder as the seed, not the whole truth.
- Search the local `by-date` image archive for the same target, target aliases, catalog identifiers, alternate dates, site names, suffixes like `-2`, and older/later sessions.
- If the user gives a folder under `by-date`, search its siblings and not just its descendants.
- Use broad name matching first, then inspect candidate folder contents. For example, search for target common names, catalog names, and abbreviations.
- Search for old `finished-work`, `processing`, `stacking`, `attempt-*`, `Autosave.tif`, DSS `.Info.txt`, `.stackinfo.txt`, PSD/TIFF/JPEG artifacts, and web-sized comparison images.
- Count every plausible light group before recommending one.
- Separate curated `good` folders from `bad`, `trial-shots`, `washed-out`, `smudged`, `trailing`, `twilight`, and historical processing products.
- Do not raw-combine sessions just because they share a target. Different dates often have different gradients, temperature ranges, framing, optics, camera state, or calibration quality.
- For moving targets, also separate star-tracked frames from comet/asteroid-tracked frames, and separate different cameras or optics even when the comet name matches.
- Preserve old comet alignment metadata such as DSS `Comet = x, y` coordinates and "align on stars and comet" logs as historical evidence. Treat those logs as hints, not proof that the same input set or calibration choices should be reused.

Recommended inventory facts:

```text
Target:
Archive-relative source folders:
Dates/sites:
Camera(s):
Likely optic(s):
Light counts by folder:
Exposure / ISO or gain:
Temperature range:
Darks found:
Flats found:
Bias/dark-flats found:
Old processing references:
Initial exclusions:
Open questions:
```

Extra moving-target inventory facts:

```text
Target designation:
Ephemeris source and query time basis:
Camera timestamp time zone:
Tracking mode by folder:
Frames with visible nucleus coordinates:
Star-aligned historical stack:
Comet-aligned historical stack:
Potential target-aligned branch:
Potential stars-only branch:
```

Example search procedure, using placeholders only:

```powershell
$byDate = '<local-by-date-folder>'
$terms = @('<target-name>', '<catalog-id>', '<common-alias>')
Get-ChildItem -Directory $byDate |
  Where-Object {
    $name = $_.Name.ToLowerInvariant()
    $terms | Where-Object { $name -like "*$($_.ToLowerInvariant())*" }
  } |
  Select-Object Name, FullName
```

When recording results, convert `FullName` values back to archive-relative paths before writing docs.

### 2. Research Before Processing

Create `projects/<slug>/docs/research/01-<target>-processing.md` before tuning scripts.

Research should cover:

- What signals are real for the target: emission, reflection, dust, galaxy arms, IFN, star clusters, HDR cores, halos, or faint support.
- What must be protected during background extraction and color calibration.
- Approximate plate-solve coordinates for the target or combined field.
- Expected framing and scale for the likely optic/camera.
- PixInsight process choices relevant to the target: WBPP, ABE/DBE/MGC, ImageSolver, SPCC/PCC, SCNR, HDR, GHS/MaskedStretch, starless workflows.
- Whether BlurXTerminator/NoiseXTerminator should be used as the primary linear branch, and whether a stock-only diagnostic branch is worth keeping for comparison.
- Existing repo lessons from similar targets.

For comets or asteroids, research should also cover:

- Official designation and ephemeris source.
- Approximate RA/Dec at the actual exposure times, with the time scale stated.
- Apparent motion rate and direction during the usable sequence.
- Real morphology to protect: coma, dust tail, ion tail, antitail, outburst shell, or fragment.
- Whether green/blue coma color is expected real signal; do not remove it with broad SCNR unless a target-specific mask/review justifies it.
- Whether star-aligned color calibration can be transferred to a comet-aligned image.
- Whether the data supports a clean comet-only integration, a star-field image with a moving comet, or only a historical-style star-and-comet composite.

Use primary or high-quality sources where possible, and link them in the research note. For PixInsight behavior, prefer installed scripts/logs and official PixInsight documentation. For target facts, NASA/ESA/catalog pages are usually better than random image-processing blogs.

### 3. Scaffold And Document

Create the project scaffold:

```powershell
& .\scripts\new-project.ps1 -Slug <target-slug>
```

Maintain these docs from the start:

```text
projects/<slug>/docs/status.md
projects/<slug>/docs/processing-journey.md
projects/<slug>/docs/pipeline.md
projects/<slug>/docs/original-<year>-processing.md
projects/<slug>/docs/research/01-<target>-processing.md
```

Add `docs/review-<date>.md` and `docs/final-v*.md` when the project reaches review/final stages.

Public docs should use archive-relative paths such as:

```text
by-date/20140302-coorg-keemale-trifid-lagoon/good
dark/canon-eos-60d/library-02/120s-1600iso/33c
```

Do not put machine-specific roots in committed docs.

### 4. Build A Plan Before Heavy Processing

Before running WBPP, write a plan that names:

- Primary branch and why it is primary.
- Diagnostic branches and why they are worth testing.
- Explicit rejection buckets.
- Calibration choice and known caveats.
- Plate-solve seed and assumed focal length/pixel size.
- SPCC filter names, if known.
- Preview/review outputs to generate.
- Decision gates after each phase.

The first plan should usually stop for user review unless the user has already said "proceed".

For moving targets, the plan must also name:

- The star-aligned calibration/registration branch used for WCS, SPCC/PCC, star color, and background judgment.
- The comet/asteroid-aligned branch, including how the nucleus positions will be measured on the calibrated/star-registered frames and which frames define the path.
- Any stars-only or comet-only product, and how real captured layers will be recombined.
- Rejection settings to test for star trails in the target-aligned integration.
- A rule for not cloning out star trails, painting tails, or using generative fill. Cosmetic removal must not add or invent sky content.

### 5. Run In Phases

Phase 1: WBPP calibration, debayer, registration, LocalNormalization, integration.

- Keep WBPP plate solving disabled for automation.
- Use `-LightDirs`, `-DarkDirs`, `-FlatDirs`, and `-AllowNoDarks` explicitly for branch clarity.
- Use `PI_LIGHT_DIRS`/`-LightDirs` when usable lights are split across folders.
- For comets, preserve the calibrated/debayered/star-registered frames needed by CometAlignment. A normal star-aligned master is useful for WCS and color calibration, but it will blur the comet if the comet moved significantly.
- Do not combine star-tracked and comet-tracked frames in one raw WBPP run unless a target-specific registration test proves the transforms are compatible.
- After star registration, verify `Observation:Time:Start` or `DATE-OBS` survived into the registered files. Then measure the nucleus positions on those registered frames; old DSS or capture-software comet coordinates are useful sanity checks, but registration can change the coordinate system.
- Before integrating a comet-aligned set, remeasure the nucleus on the comet-aligned frames. The measured positions should collapse to the chosen reference position; if they do not, stop and fix the table/timestamps/coordinates first.
- Make output subdirectories descriptive, for example:

```text
wbpp-20140302-good-nodark-noflats
wbpp-20140504-good-dark33-34-noflats
wbpp-20140302-good-flat-nodark-test
```

Phase 2: linear post-integration.

- Render a linked-STF preview before modifying the master.
- Treat linked-STF/SPCC previews as diagnostic views, not finished-image candidates. If an old human edit exists, compare it at this stage for black point, background restraint, star color, and target scale before deciding what the nonlinear branch should optimize.
- Use conservative background correction. If the target is embedded in Milky Way dust/nebulosity, avoid treating real signal as background.
- If using BlurXTerminator Correct Only, run it on linear data before solving/color calibration, then plate-solve the corrected image.
- Plate-solve the integrated or BXT-corrected master with target-specific RA/Dec/focal/pixel values.
- Run SPCC only after WCS exists and Gaia DR3/SP is configured.
- Run BlurXTerminator detail/deconvolution on linear color data after SPCC unless a target-specific plan says otherwise.
- Run NoiseXTerminator after BlurXTerminator and before stretching.
- For comet targets, run ImageSolver and SPCC/PCC on the star-aligned branch first. Transfer color calibration or color balance to comet-aligned products only after documenting the method.
- Be cautious with BlurXTerminator on comet nuclei and tails. Keep a stock/no-BXT diagnostic until close crops prove BXT is not hardening the coma, inventing tail texture, or damaging faint tail signal.
- Noise reduction should be mild and crop-reviewed around the coma/tail and empty sky. Over-denoise can erase the low-surface-brightness tail.
- Preserve no-background-neutralization, no-ABE, or alternate background diagnostics when the target is background-sensitive.
- If NoiseXTerminator is not used, apply only mild stock linear noise reduction unless the data clearly supports more.

Phase 3: nonlinear presentation.

- Start with a conservative stretch.
- Make target-specific polish scripts rather than overfitting shared scripts from unrelated targets.
- If a historical finished-work image exists, make an explicit historical-reference checkpoint before calling a modern branch better or worse. Old references can reveal presentation goals such as darker sky, tighter halos, or warmer star color, but they must not be used as pixel sources or absolute color truth.
- Use StarXTerminator only when starless/star recombination helps the target; do not remove stars before BlurXTerminator in the normal workflow.
- For comet products, star removal/recombination is allowed only with stars extracted from the user's own frames. Do not synthesize replacement stars or paint over trails with artificial background.
- If making a comet-plus-stars composite, document the PixelMath/layer formula and keep the source comet-only and stars-only products under `work/`.
- For comet products, first try a clean star-aligned presentation candidate when the comet-aligned branch has too few frames for clean star rejection. Keep the comet-aligned branch available for nucleus/tail structure and possible real-data recombination, but do not let rejection flecks, cloned backgrounds, or broad color suppression sneak into a final.
- Protect real comet color during nonlinear work. A green/cyan coma can be authentic; prefer low-luminance sky chroma cleanup and target masks over broad SCNR.
- Keep comparison JPEGs small and checked in under `docs/images/`.
- Keep XISF/TIFF/FITS and full processing outputs under ignored `work/`.
- Do not accept a pushed branch just because it resembles the old reference; compare whether it is technically plausible from the raw data.

Phase 4: LLM-as-judge review.

- Treat the LLM as a critical reviewer, not as an image source or aesthetic oracle. It must judge only products derived from the user's captured data.
- Create a small number of very narrow diagnostic crops before asking for judgment. Usually 3-6 crops is enough; avoid flooding the review with dozens of tiles.
- Use the same crop geometry across competing branches so the comparison is fair.
- Include at least one crop from clean-looking background, one from the main target/detail area, one from a representative medium-bright star field, and one from any suspicious edge/corner/framing area.
- For galaxy fields or faint dust targets, include a crop where faint structure and empty background coexist, since over-denoise and pattern noise are easiest to see there.
- Ask the LLM to judge concrete technical qualities first: diagonal/walking noise, fixed-pattern or chroma streaks, blotchy over-denoise, star roundness, star color, halos, registration trails, deconvolution artifacts, clipped cores, gradients, color casts, edge clipping, and whether faint real signal is being erased.
- Ask for branch-level decisions only after the crop findings are listed. A good answer should say which branch is technically safer, which defects are upstream calibration/integration problems, and which are presentation-polish problems.
- If narrow crops reveal strong fixed-pattern/walking noise, revisit calibration, rejection, drizzle/integration choices, or branch selection before trying to hide it with heavier nonlinear denoise.
- Record the crop names, crop geometry, LLM findings, and accepted/rejected branch decisions in `docs/review-<date>.md`, `status.md`, and `processing-journey.md`.

### 6. Review And Finalize

For review, provide:

- Historical reference image, if available.
- Best clean candidate.
- Best old-reference candidate, if different.
- LLM-as-judge narrow crop set and findings.
- Rejected diagnostics with one-line reasons.
- Open decision questions.

When the historical reference is clearly stronger than the current technical diagnostic, write down why before processing further. Common reasons are lifted sky, weak black point, overlarge halos, noisy color, poor background control, or a preview stretch that emphasizes calibration defects. Then make the next branch address those specific presentation failures while staying inside real-data transformations.

For final v1, provide:

- `docs/final-v1.md`.
- Final JPEG under `docs/images/`.
- Optional comparison panel under `docs/images/`.
- Full XISF/TIFF under `work/`.
- Updated `status.md`, `processing-journey.md`, `pipeline.md`, repo `readme.md`, and `docs/processing-summaries.md`.

## Typical Setup And Gotchas

### Archive And Public Docs

- The raw archive is local and can be referenced during processing, but committed docs should use archive-relative paths.
- Search the local `by-date` folder for image sessions before deciding the dataset is complete.
- Search both target-specific `by-date` folders and generic calibration libraries.
- Keep archive roots, drive letters, usernames, and site-private path details in `.env`/`.env.local` or the current shell/session only.
- Historical folders often include DSS/Photoshop products. Use them as references, not as inputs for modern PixInsight integration.
- A folder suffix such as `-2` may mean "second target collection in the archive", not necessarily a second part of the same night.

### Cameras And Optics

- Canon EOS 60D appears frequently. Pixel size is 4.31 um.
- Canon EOS 60D SPCC filter names are usually:

```text
Canon EOS 60D R
Canon EOS 60D G
Canon EOS 60D B
```

- Canon EOS Rebel T1i files appear in PixInsight as Canon EOS 500D. Pixel size is 4.69 um. SPCC filter names are:

```text
Canon EOS 500D R
Canon EOS 500D G
Canon EOS 500D B
```

- EXIF focal length can be stale or misleading. Several telescope datasets reported `50.0 mm` even though plate solving showed ED80/reducer scale around 386 mm.
- Treat plate-solved scale as truth after Phase 2.
- Mixed-camera or modified-camera data should usually be separate support branches, not broadband color truth.

### Calibration

- Matching dark temperature matters for DSLR data. Too-warm darks can overcorrect cooler lights.
- Flats must match optical train, focus, orientation, and dust state. Old or cross-target flats are diagnostic branches until proven.
- If no bias/dark-flats exist, flat branches need extra skepticism.
- No-dark/no-flats controls are often useful when calibration is uncertain.

### Plate Solving

- Set target-specific `PI_SOLVE_RA`, `PI_SOLVE_DEC`, `PI_SOLVE_FOCAL_MM`, and `PI_SOLVE_PIXEL_UM` before Phase 2.
- Dense Milky Way fields may need a larger target-star limit, larger max box, and deeper magnitude limit.
- If solving fails, inspect the logs before changing scripts. Common knobs are `targetMax`, `maxBox`, `magnitude`, projection, and focal seed.

### Background And Color

- ABE can subtract real nebulosity, dust, IFN, or Milky Way background. Always inspect linked-STF previews and, where possible, background models/diagnostics.
- SPCC background neutralization can help or harm depending on whether any clean background exists. Keep no-BN diagnostics for target-rich fields.
- SCNR should be light and documented.
- Linked versus unlinked STF matters: use linked previews to judge real color balance.
- Full-frame previews can hide severe local defects. Always use narrow crop review before accepting a branch as final.

### Moving Targets And Comets

- Comets move against the star field, so fixed-sky integration and target-aligned integration answer different questions. Keep both branches named and documented.
- Accurate acquisition times are mandatory for PixInsight CometAlignment. Verify whether camera timestamps are UTC or local time before using ephemeris positions or interpolated comet paths.
- Register comet frames to stars first when possible; CometAlignment applies translation from measured nucleus positions and expects no remaining rotation or scale changes unless a target-specific plan uses PSF Fit and multiple fixed frames.
- Measure comet coordinates on the registered frames used as CometAlignment input, then confirm the aligned outputs place the nucleus at a stable reference coordinate before integration.
- Use at least first and last frames as fixed comet-position frames, and add middle fixed frames when motion is nonlinear, the sequence is long, or the comet nucleus is weak.
- Use star-aligned products for plate solving, SPCC/PCC, and star color. Then transfer color to comet-aligned products by a documented method.
- A star-aligned integration will smear the comet. A comet-aligned integration will trail or reject stars. A final image may use both, but every visible layer must come from the user's data.
- Reject or label any branch where star-trail cleanup, clone stamping, or background repair starts inventing sky texture.
- Protect real comet color and tail structure. Green coma, blue ion tail, yellow-white dust tail, antitail geometry, and asymmetric coma can be real signal.
- Use LLM-as-judge crops around the nucleus, tail, clean sky, and star-trail rejection zones before accepting a comet branch.
- For comet presentation, separate three judgments: scientific alignment correctness, color-calibrated plausibility, and finished-image appearance. A branch can be correct and still look bad, especially if it is just an automatic STF or a six-frame comet-aligned integration with imperfect star rejection.

### PixInsight Automation

- Headless runs should not require user interaction. If PixInsight opens a process window such as "Basic CCD Parameters", assume something is wrong or waiting in the GUI; tell the user no action is expected, stop/review the run, and inspect logs/scripts.
- PJSR process properties are version-sensitive. Inspect existing scripts and logs before changing process parameter names.
- Third-party process modules are also version-sensitive. Verify BlurXTerminator/NoiseXTerminator/StarXTerminator parameter names from installed docs, instance source, or logs before adding shared scripts.
- Do not leave PixInsight running at the end of a task.

### RC Astro Plugins

- Licensed BlurXTerminator, NoiseXTerminator, and StarXTerminator are available on this machine.
- The default plugin order is BXT on linear data, NXT after BXT and before stretch, and SXT only after stretch when starless processing is useful.
- See [RC Astro plugin workflow](rc-astro-workflow.md) for branch naming, guardrails, and reprocessing notes.
- Keep older stock-only branches available until the plugin branch is reviewed and accepted.

### Final Choice

- Old finished-work images are emotional and historical references, not absolute truth.
- A good final may be less dramatic than the old reference if the old look came from gradients, vignetting, or color imbalance.
- Record why a more vivid branch was rejected, not just which branch won.

## New Project Checklist

```text
[ ] Search archive for same target across by-date folders.
[ ] Search by target aliases/catalog IDs, not only the folder name the user provided.
[ ] Count lights by candidate folder, exposure, ISO/gain, and temperature.
[ ] Search for old finished-work / processing / stacking artifacts.
[ ] Search calibration libraries for matching darks, flats, bias/dark-flats.
[ ] Identify likely camera, optic, pixel size, and solve seed.
[ ] Research target-specific processing risks and write research note.
[ ] For comets/asteroids, verify official designation, ephemeris, timestamp time zone, and apparent motion.
[ ] For comets/asteroids, separate star-tracked, target-tracked, star-aligned, target-aligned, stars-only, and target-only branches.
[ ] Create project scaffold.
[ ] Write status, journey, pipeline, and original-processing notes.
[ ] Present plan and review questions.
[ ] Run Phase 1 primary branch only after plan is accepted or user says proceed.
[ ] Render linked-STF previews after every integration/linear checkpoint.
[ ] Run Phase 2 with target-specific solve and SPCC settings.
[ ] Run BXT/NXT linear branch when appropriate, preserving stock diagnostics.
[ ] Preserve and document diagnostics.
[ ] Compare against any old human edit before treating diagnostic previews as presentation candidates.
[ ] Build nonlinear candidates, then review.
[ ] Create 3-6 matched narrow crops for LLM-as-judge review.
[ ] Judge crops for noise, star shapes, gradients, artifacts, clipping, and faint-signal preservation.
[ ] Record LLM-as-judge findings and any branch promotion/rejection decision.
[ ] Export final v1 and comparison panel.
[ ] Update readme and processing summaries.
[ ] Check public docs for local paths and secrets.
[ ] Commit only docs, scripts, and small comparison assets.
```
