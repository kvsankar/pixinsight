# PixInsight automation workspace

This is an experiment to see how far generative AI can help with astrophotography processing using PixInsight and other tools.

This repository is organized for repeatable PixInsight processing across multiple astrophotography targets.

## Layout

- `scripts/` - shared PowerShell drivers and PixInsight JavaScript process scripts.
- `projects/` - one folder per imaging target/session.
- `docs/` - repository-level notes that are not tied to a single target.

The current processed targets are `projects/m31-andromeda-2013`, `projects/rosette-2014-03-02`, and `projects/horsehead-flame-2013-2016`.

## Documentation

Start here for the repository structure:

- [Project layout](docs/project-layout.md) - how the repo is organized for more targets and local-only work products.
- [Processing summaries](docs/processing-summaries.md) - concise process summary for M31, Rosette, and Horsehead.
- [Horsehead / Flame processing plan](docs/horsehead-processing-plan.md) - source inventory, script changes, and processing strategy for combining modded, unmodded, and wide-field data.
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

Rosette Nebula 2014 processing notes:

- [V3G old-red depth candidate](projects/rosette-2014-03-02/docs/v3g-old-red-depth.md) - visual branch tuned against the 2014 finished-work reference for deeper sky and redder Rosette color.
- [V3H old-red starless layer](projects/rosette-2014-03-02/docs/v3h-old-red-starless.md) - starless version of the old-reference red/depth treatment.
- [V3I/V3J subtle stars](projects/rosette-2014-03-02/docs/v3i-v3j-subtle-stars.md) - restrained star recombination over the old-red starless layer.
- [V3B presentation candidate](projects/rosette-2014-03-02/docs/final-v3b.md) - current preferred result, subs summary, and human-in-the-loop notes.
- [Current status](projects/rosette-2014-03-02/docs/status.md) - source inventory, completed runs, current outputs, and next processing steps.
- [Processing journey](projects/rosette-2014-03-02/docs/processing-journey.md) - chronological record of what was tried, including the v2g presentation candidate and starless-tool decision.
- [Processing pipeline](projects/rosette-2014-03-02/docs/pipeline.md) - Rosette-specific PixInsight plan, current color/background findings, and resume plan.
- [Original 2014 processing evidence](projects/rosette-2014-03-02/docs/original-2014-processing.md) - what was found in the old DSS/Photoshop folders.
- [2014 finished-work result](projects/rosette-2014-03-02/docs/images/original-2014-photoshop.jpg), [2026 StarXTerminator v3b result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3b.jpg), [2026 v3g old-red depth result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3g-old-red-depth.jpg), [2026 v3h old-red starless result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3h-old-red-starless.jpg), and [2026 v3j subtle stars result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3j-sparse-anchor-stars.jpg) - compressed comparison images.

Horsehead / Flame 2013-2016 processing notes:

- [Final v1 result](projects/horsehead-flame-2013-2016/docs/final-v1.md) - accepted mixed-camera result, selected data mix, exclusions, and caveats.
- [Current status](projects/horsehead-flame-2013-2016/docs/status.md) - source inventory, calibration findings, and candidate WBPP runs.
- [Processing journey](projects/horsehead-flame-2013-2016/docs/processing-journey.md) - chronological record of decisions and experiments.
- [Processing pipeline](projects/horsehead-flame-2013-2016/docs/pipeline.md) - staged plan for modded, unmodded, and wide-field data.
- [2013 finished-work result](projects/horsehead-flame-2013-2016/docs/images/original-2013-finished-work.jpg) and [2026 PixInsight v1 result](projects/horsehead-flame-2013-2016/docs/images/horsehead-04c-v1-polish.jpg) - compressed comparison images.

## Current M31 rerun commands

Copy `.env.example` to `.env` and fill in local paths before running Phase 1. The `.env` file is ignored by git.

```powershell
& .\scripts\run-wbpp-phase1.ps1
& .\scripts\run-phase2.ps1
& .\scripts\run-phase3.ps1
```

Generated PixInsight work products live under each project's `work/` directory and are ignored by git.
