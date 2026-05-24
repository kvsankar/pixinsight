# PixInsight automation workspace

This is an experiment to see how far generative AI can help with astrophotography processing using PixInsight and other tools.

This repository is organized for repeatable PixInsight processing across multiple astrophotography targets.

## Layout

- `scripts/` - shared PowerShell drivers and PixInsight JavaScript process scripts.
- `projects/` - one folder per imaging target/session.
- `docs/` - repository-level notes that are not tied to a single target.

The current processed target is `projects/m31-andromeda-2013`.

## Documentation

Start here for the repository structure:

- [Project layout](docs/project-layout.md) - how the repo is organized for more targets and local-only work products.
- [Agent bootstrap guide](AGENTS.md) - conventions for AI agents creating or extending projects.

M31 / Andromeda 2013 processing notes:

- [Current status](projects/m31-andromeda-2013/docs/status.md) - what has been run, current outputs, and how to resume.
- [Processing pipeline](projects/m31-andromeda-2013/docs/pipeline.md) - the intended PixInsight workflow and settings.
- [Original 2013 processing evidence](projects/m31-andromeda-2013/docs/original-2013-processing.md) - what was found in the old DSS/Photoshop folders.
- [2013 Photoshop result](projects/m31-andromeda-2013/docs/images/original-2013-photoshop.jpg) and [2026 PixInsight v3 result](projects/m31-andromeda-2013/docs/images/pixinsight-v3-ed80.jpg) - compressed comparison images.

Research notes created during the experiment:

- [General PixInsight pipeline research](projects/m31-andromeda-2013/docs/research/01-general-pipeline.md)
- [M31-specific processing research](projects/m31-andromeda-2013/docs/research/02-m31-specific.md)
- [DSLR no-flats workflow research](projects/m31-andromeda-2013/docs/research/03-dslr-no-flats.md)
- [Plate-solving notes from the failed 50mm assumption](projects/m31-andromeda-2013/docs/research/04-platesolve-wide-field.md)

## Current M31 rerun commands

Copy `.env.example` to `.env` and fill in local paths before running Phase 1. The `.env` file is ignored by git.

```powershell
& .\scripts\run-wbpp-phase1.ps1
& .\scripts\run-phase2.ps1
& .\scripts\run-phase3.ps1
```

Generated PixInsight work products live under each project's `work/` directory and are ignored by git.
