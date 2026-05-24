# AGENTS.md

Guidance for AI coding agents working in this PixInsight automation repository.

## Purpose

This repo is an experiment in using generative AI to build repeatable astrophotography processing workflows with PixInsight and related tools.

Keep work reproducible, public-repo friendly, and organized by target/session.

## Repository Layout

```text
docs/                         Repo-level notes
scripts/                      Shared PowerShell and PixInsight JavaScript automation
projects/<target-slug>/       One target/session per project
  docs/                       Project notes, status, pipeline, research
  docs/images/                Small checked-in comparison images only
  work/                       Generated PixInsight outputs, ignored by git
```

Use lowercase hyphenated project slugs, for example `m31-andromeda-2013` or `orion-2026-01`.

## Bootstrap a New Project

1. Create the scaffold:

   ```powershell
   & .\scripts\new-project.ps1 -Slug target-name-date
   ```

2. Copy `.env.example` to `.env` and fill in local paths:

   ```text
   PI_PROJECT_DIR=<repo>\projects\target-name-date
   PI_LIGHT_DIR=<local raw light folder>
   PI_DARK_DIR=<local raw dark folder>
   PIXINSIGHT_EXE=C:\Program Files\PixInsight\bin\PixInsight.exe
   PI_WBPP_SCRIPT=C:\Program Files\PixInsight\src\scripts\BatchPreprocessing\WBPP.js
   PI_GAIA_DR3SP_DIR=<optional local Gaia DR3/SP catalog path>
   ```

3. Record acquisition facts in `projects/<slug>/docs/status.md` before tuning scripts:

   - Target, date, site if public-safe
   - Camera, telescope/lens, mount, guiding setup
   - Light/dark/flat/bias counts, exposure, ISO/gain, temperature
   - Capture and original processing software, if known

4. Run the pipeline in phases:

   ```powershell
   & .\scripts\run-wbpp-phase1.ps1 -ProjectDir .\projects\target-name-date
   & .\scripts\run-phase2.ps1 -ProjectDir .\projects\target-name-date -Phase1Master <master-light>
   & .\scripts\run-phase3.ps1 -ProjectDir .\projects\target-name-date
   ```

## Important Conventions

- Do not commit `.env`, raw frames, PixInsight intermediates, XISF/TIFF/FITS products, or project `work/` directories.
- Keep machine-specific paths in `.env`, not in checked-in scripts or docs.
- Small compressed JPEG comparison images may be checked in under `projects/<slug>/docs/images/`.
- Keep public docs scrubbed of unnecessary local paths and personal machine details.
- Update `readme.md` when adding new documentation pages so all docs remain reachable from the top level.
- Update `projects/<slug>/docs/status.md` with every processing step that actually ran.
- Prefer adding target-specific notes to project docs over embedding assumptions in shared scripts.

## PixInsight Notes

- Phase 1 uses WBPP for calibration, debayer, registration, local normalization, and integration.
- WBPP plate solving should stay disabled for headless automation; plate-solve once on the integrated master in Phase 2.
- Plate solving is target-specific. Check `scripts/pjsr/02b-platesolve.js` for seed coordinates, pixel size, focal length, projection, and catalog settings before reusing it.
- SPCC needs a successful WCS solution and a configured Gaia DR3/SP catalog.
- PJSR process properties can be version-sensitive. When unsure, inspect existing scripts and logs before changing process parameters.

## Before Committing

Run:

```powershell
git status --short
git diff --stat
```

For public commits, also check for accidental local paths or sensitive data:

```powershell
rg -n "C:\\|D:\\|M:\\|Users\\|\\.env|PixInsightData" .
```

Commit only intentional source, docs, scripts, and small public comparison assets.
