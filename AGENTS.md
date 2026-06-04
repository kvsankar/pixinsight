# AGENTS.md

Guidance for AI coding agents working in this PixInsight automation repository.

## Purpose

This repo is an experiment in using generative AI to build repeatable astrophotography processing workflows with PixInsight and related tools.

Keep work reproducible, public-repo friendly, and organized by target/session.

## Data Authenticity

Process only the user's own captured astronomy data and products derived from it. Do not synthesize, generate, paint in, clone in, or hallucinate astrophotography content.

This specifically forbids artificial stars, synthetic diffraction spikes, generated nebulosity, generated background texture, generative fill, AI-created sky details, or decorative elements added to make an image look more impressive. Reference images may guide taste and review language, but they must not be used as source content.

Allowed operations must be transformations of the user's data: calibration, registration, stacking, gradient/background correction, plate solving, color calibration, deconvolution, denoise, stretching, star separation, star reduction, masks, curves, saturation, sharpening, cropping, and recombination of real starless/stars layers extracted from the user's own image. Star removal/recombination is acceptable only when the recombined stars come from the actual image data, not from synthetic placement or drawing.

For a full repeatable new-target workflow, follow [docs/new-project-playbook.md](docs/new-project-playbook.md). That playbook captures the typical archive search, target research, planning, processing, review, and finalization procedure.

For current licensed third-party processing, follow [docs/rc-astro-workflow.md](docs/rc-astro-workflow.md). BlurXTerminator, NoiseXTerminator, and StarXTerminator are available and should be used as documented there unless a target-specific plan calls for a stock-only diagnostic.

Local archive roots, artifact roots, symlink layouts, and other private path details belong in ignored local files such as `.env`, `.env.local`, or `.env.workdir-layout.md`, not in committed docs. If `.env.workdir-layout.md` exists, read it before assuming where generated project `work/` directories physically live. Use placeholders and archive-relative paths in public notes.

## Repository Layout

```text
docs/                         Repo-level notes
scripts/                      Shared PowerShell and PixInsight JavaScript automation
projects/<target-slug>/       One target/session per project
  docs/                       Project notes, status, pipeline, research
  docs/images/                Small checked-in comparison images only
  work/                       Generated PixInsight outputs, ignored by git; may be a local symlink
```

Use lowercase hyphenated project slugs, for example `m31-andromeda-2013` or `orion-2026-01`.

## Bootstrap a New Project

Before running heavy PixInsight processing, use the new-project playbook to inventory the archive, research target-specific processing concerns, customize the plan for the actual data, and write the initial project docs.

For a new target, explicitly search the local `by-date` image archive for all folders that could contain the target, even when the user provides one seed folder. Read `PI_ARCHIVE_ROOT` / `PI_BY_DATE_DIR` from ignored local config when available, or use the user-provided local path only during the session.

1. Create the scaffold:

   ```powershell
   & .\scripts\new-project.ps1 -Slug target-name-date
   ```

2. Copy `.env.example` to `.env` and fill in local paths:

   ```text
   PI_PROJECT_DIR=<repo>\projects\target-name-date
   PI_ARCHIVE_ROOT=<optional local astronomy image archive root>
   PI_BY_DATE_DIR=<optional local by-date image folder>
   PI_FINISHED_WORK_DIR=<optional local finished-work folder>
   PI_DARK_LIBRARY_DIR=<optional local dark library folder>
   PI_FLAT_LIBRARY_DIR=<optional local flat library folder>
   PI_LIGHT_DIR=<local raw light folder>
   PI_LIGHT_DIRS=<optional semicolon-separated raw light folders>
   PI_DARK_DIR=<local raw dark folder>
   PI_CFA_PATTERN=<optional WBPP CFA override: AUTO, RGGB, BGGR, GBRG, or GRBG>
   PI_SOLVE_RA=<optional target RA in degrees>
   PI_SOLVE_DEC=<optional target Dec in degrees>
   PI_SOLVE_FOCAL_MM=<optional solved/estimated focal length>
   PI_SOLVE_PIXEL_UM=<optional camera pixel size>
   PI_SPCC_RED_FILTER=<optional SPCC red filter name>
   PI_SPCC_GREEN_FILTER=<optional SPCC green filter name>
   PI_SPCC_BLUE_FILTER=<optional SPCC blue filter name>
   PIXINSIGHT_EXE=<PixInsight install>\bin\PixInsight.exe
   PI_WBPP_SCRIPT=<PixInsight install>\src\scripts\BatchPreprocessing\WBPP.js
  PI_GAIA_DR3SP_DIR=<optional local Gaia DR3/SP catalog path>
  PI_ENABLE_RC_ASTRO=<optional: true/false, default target-specific>
  ```

3. Record acquisition facts in `projects/<slug>/docs/status.md` before tuning scripts:

   - Target, date, site if public-safe
   - Camera, telescope/lens, mount, guiding setup
   - Light/dark/flat/bias counts, exposure, ISO/gain, temperature
   - Capture and original processing software, if known

   For longer investigations, also maintain `projects/<slug>/docs/processing-journey.md` as a chronological record of what was tried and what was learned.

4. Write the target-specific research and plan before Phase 1:

   ```text
   projects/<slug>/docs/research/01-<target>-processing.md
   projects/<slug>/docs/pipeline.md
   projects/<slug>/docs/original-<year>-processing.md
   ```

   The plan should name the primary branch, diagnostic branches, rejected buckets, calibration assumptions, plate-solve seed, SPCC settings, preview outputs, and review questions.

5. Run the pipeline in phases:

   ```powershell
   & .\scripts\run-wbpp-phase1.ps1 -ProjectDir .\projects\target-name-date
   & .\scripts\run-phase2.ps1 -ProjectDir .\projects\target-name-date -Phase1Master <master-light>
   & .\scripts\run-phase3.ps1 -ProjectDir .\projects\target-name-date
   ```

## Important Conventions

- Do not commit `.env`, raw frames, PixInsight intermediates, XISF/TIFF/FITS products, or project `work/` directories.
- Keep machine-specific paths in `.env`, not in checked-in scripts or docs.
- Use `PI_LIGHT_DIRS` or `-LightDirs` when a target's usable lights are split across folders.
- Use `PI_CFA_PATTERN` or `-CfaPattern` only after a dataset-specific CFA diagnostic proves WBPP auto-detection is wrong or suspect.
- Set `PI_SOLVE_RA`, `PI_SOLVE_DEC`, and scale-related solve settings for each non-M31 target before running Phase 2 fresh.
- Set SPCC filter names when the camera response is known, for example `Canon EOS 60D R/G/B`.
- For the RC Astro workflow, apply BlurXTerminator on linear data before NoiseXTerminator, and use StarXTerminator only after stretch for starless/star recombination branches.
- Keep stock-only or old accepted branches available until a BXT/NXT/SXT branch has been reviewed and accepted.
- Small compressed JPEG comparison images may be checked in under `projects/<slug>/docs/images/`.
- Keep public docs scrubbed of unnecessary local paths and personal machine details.
- Update `readme.md` when adding new documentation pages so all docs remain reachable from the top level.
- Update `projects/<slug>/docs/status.md` with every processing step that actually ran.
- Update `projects/<slug>/docs/processing-journey.md` when an investigation changes direction or a failed branch teaches something important.
- Prefer adding target-specific notes to project docs over embedding assumptions in shared scripts.
- For new targets, search for related sessions and historical processing artifacts before assuming the user-provided folder is complete.
- Search the local `by-date` archive for target-name aliases, catalog identifiers, date/site variants, and suffixes like `-2`; document only archive-relative paths.
- Treat old finished-work images as visual/historical references, not as ground truth.
- Do not raw-combine sessions until each session has been integrated and inspected separately.
- If PixInsight unexpectedly opens an interactive process window during automation, tell the user no interaction is expected, stop/review the run, and inspect logs/scripts.

## PixInsight Notes

- Phase 1 uses WBPP for calibration, debayer, registration, local normalization, and integration.
- WBPP plate solving should stay disabled for headless automation; plate-solve once on the integrated master in Phase 2.
- Plate solving is target-specific. Check `scripts/pjsr/02b-platesolve.js` for seed coordinates, pixel size, focal length, projection, and catalog settings before reusing it.
- SPCC needs a successful WCS solution and a configured Gaia DR3/SP catalog.
- BlurXTerminator AI4 needs linear input. Do not run it on already stretched nonlinear products.
- NoiseXTerminator should run after deconvolution, usually still linear and before stretch.
- StarXTerminator is for nonlinear starless/stars workflows; do not remove stars before BlurXTerminator in the normal branch.
- PJSR process properties can be version-sensitive. When unsure, inspect existing scripts and logs before changing process parameters.

## Before Committing

Run:

```powershell
git status --short
git diff --stat
```

For public commits, also check for accidental local paths or sensitive data:

```powershell
rg -n "([A-Z]:\\|User[s]\\|[.]env|PixInsight[D]ata)" .
```

Commit only intentional source, docs, scripts, and small public comparison assets.
