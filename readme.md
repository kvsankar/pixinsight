# PixInsight automation workspace

This is an experiment to see how far generative AI can help with astrophotography processing using PixInsight and other tools.

This repository is organized for repeatable PixInsight processing across multiple astrophotography targets.

## Layout

- `scripts/` - shared PowerShell drivers and PixInsight JavaScript process scripts.
- `projects/` - one folder per imaging target/session.
- `docs/` - repository-level notes that are not tied to a single target.

The current processed targets are `projects/m31-andromeda-2013`, `projects/rosette-2014-03-02`, `projects/horsehead-flame-2013-2016`, `projects/orion-nebula-m42-2013`, `projects/trifid-lagoon-2014`, and `projects/m7-ptolemy-cluster-2013-03-10`.

The current review-stage targets are `projects/m45-pleiades-2013-12-30`, `projects/m81-m82-2014-03-03`, `projects/markarian-chain-2014-03-03`, `projects/omega-centauri-2014-05-04`, `projects/eta-carinae-2013-03-10`, and `projects/canis-major-2013-01-14`.

There are no current newly-started targets.

## Documentation

Start here for the repository structure:

- [Project layout](docs/project-layout.md) - how the repo is organized for more targets and local-only work products.
- [Image picks](index.html) - selected finals and presentation candidates with full-screen lightbox review.
- [Project intent](intent.html) - short explanation of the AI-assisted processing experiment and what it does or does not claim.
- [Project gallery](project-gallery.html) - static project/process tree viewer with thumbnail lightbox review.
- [New project playbook](docs/new-project-playbook.md) - repeatable archive inventory, target research, planning, processing, review, and finalization procedure for new targets.
- [RC Astro plugin workflow](docs/rc-astro-workflow.md) - shared BXT/NXT/SXT phase order, guardrails, branch naming, and older-target reprocessing notes.
- [Processing summaries](docs/processing-summaries.md) - concise process summaries for completed and review-stage targets.
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

M45 / Pleiades 2013-12-30 review notes:

- [Current status](projects/m45-pleiades-2013-12-30/docs/status.md) - source inventory, completed primary/no-dark WBPP runs, Phase 2 solve, v2 crop output, and review questions.
- [Processing pipeline](projects/m45-pleiades-2013-12-30/docs/pipeline.md) - WBPP, Phase 2, and nonlinear plan/current processing record for the Pleiades data.
- [Review checkpoint](projects/m45-pleiades-2013-12-30/docs/review-2026-05-27.md) - current v2 crop candidate, accepted branch, rejected no-dark control, and open taste questions.
- [Processing journey](projects/m45-pleiades-2013-12-30/docs/processing-journey.md) - chronological planning record and decision trail.
- [M45 / Pleiades processing research](projects/m45-pleiades-2013-12-30/docs/research/01-m45-pleiades-processing.md) - target-specific research and processing implications for blue reflection nebulosity.
- [Original 2013 processing evidence](projects/m45-pleiades-2013-12-30/docs/original-2013-processing.md) - historical local artifacts and finished-work reference.
- [2013 finished-work reference](projects/m45-pleiades-2013-12-30/docs/images/original-2013-finished-work.jpg), [2026 v1 full-frame candidate](projects/m45-pleiades-2013-12-30/docs/images/m45-20131230-v1-polish.jpg), and [2026 v2 portrait crop](projects/m45-pleiades-2013-12-30/docs/images/m45-20131230-v2-portrait-crop.jpg) - compressed comparison images.

M81 / M82 2014-03-03 review notes:

- [Current status](projects/m81-m82-2014-03-03/docs/status.md) - source inventory, completed dark/no-dark WBPP diagnostics, Phase 2 solves, legacy v3/v4 crop outputs, rejected plugin diagnostics, and review questions.
- [Processing pipeline](projects/m81-m82-2014-03-03/docs/pipeline.md) - WBPP, Phase 2, RC Astro BXT/NXT branch, and nonlinear workflow/current processing record for the galaxy pair.
- [Review checkpoint](projects/m81-m82-2014-03-03/docs/review-2026-05-28.md) - least-bad v4 reference crop, rejected BXT/NXT v1, NXT-only diagnostic, accepted no-dark branch, rejected dark branch, and upstream calibration questions.
- [Processing journey](projects/m81-m82-2014-03-03/docs/processing-journey.md) - chronological planning record and decision trail.
- [M81 / M82 processing research](projects/m81-m82-2014-03-03/docs/research/01-m81-m82-processing.md) - target-specific facts and processing implications for M81, M82, and SN 2014J.
- [Original 2014 processing evidence](projects/m81-m82-2014-03-03/docs/original-2014-processing.md) - historical DSS/Photoshop artifacts and finished-work reference.
- [2014 finished-work reference](projects/m81-m82-2014-03-03/docs/images/original-2014-finished-work.jpg), [2026 v4 tight crop](projects/m81-m82-2014-03-03/docs/images/m81-m82-20140303-v4-detail-tight-crop.jpg), [rejected BXT/NXT v1 tight crop](projects/m81-m82-2014-03-03/docs/images/m81-m82-20140303-bxt-nxt-v1-tight-crop.jpg), and [NXT-only v2 diagnostic](projects/m81-m82-2014-03-03/docs/images/m81-m82-20140303-nxt-calm-v2-dark-tight-crop.jpg) - compressed comparison images.

Markarian Chain 2014-03-03 processing notes:

- [Current status](projects/markarian-chain-2014-03-03/docs/status.md) - source inventory, calibration candidates, related Virgo session, and review questions.
- [Processing pipeline](projects/markarian-chain-2014-03-03/docs/pipeline.md) - WBPP, Phase 2, RC Astro, and nonlinear plan for the Markarian Chain data.
- [Processing journey](projects/markarian-chain-2014-03-03/docs/processing-journey.md) - chronological planning record and decision trail.
- [Markarian Chain processing research](projects/markarian-chain-2014-03-03/docs/research/01-markarian-chain-processing.md) - target-specific facts and processing implications for the Virgo Cluster galaxy chain.
- [Original 2014 processing evidence](projects/markarian-chain-2014-03-03/docs/original-2014-processing.md) - historical DSS artifacts and local archive evidence.

Omega Centauri 2014-05-04 processing notes:

- [Current status](projects/omega-centauri-2014-05-04/docs/status.md) - source inventory, calibration candidates, historical references, and review questions.
- [Processing pipeline](projects/omega-centauri-2014-05-04/docs/pipeline.md) - WBPP, Phase 2, RC Astro, nonlinear, and LLM-as-judge plan for the Omega Centauri data.
- [Processing journey](projects/omega-centauri-2014-05-04/docs/processing-journey.md) - chronological planning record and decision trail.
- [Omega Centauri processing research](projects/omega-centauri-2014-05-04/docs/research/01-omega-centauri-processing.md) - target-specific facts and processing implications for the globular cluster.
- [Original 2014 processing evidence](projects/omega-centauri-2014-05-04/docs/original-2014-processing.md) - historical finished-work and local processing artifact evidence.

Eta Carinae 2013-03-10 processing notes:

- [Current status](projects/eta-carinae-2013-03-10/docs/status.md) - source inventory, calibration candidates, exposure groups, and review questions.
- [Processing pipeline](projects/eta-carinae-2013-03-10/docs/pipeline.md) - 120s baseline, dark diagnostics, sibling exposure branches, nonlinear, and LLM-as-judge plan.
- [Processing journey](projects/eta-carinae-2013-03-10/docs/processing-journey.md) - chronological planning record and decision trail.
- [Eta Carinae processing research](projects/eta-carinae-2013-03-10/docs/research/01-eta-carinae-processing.md) - target-specific facts and processing implications for the Carina Nebula.
- [Original 2013 processing evidence](projects/eta-carinae-2013-03-10/docs/original-2013-processing.md) - historical local stack and Photoshop artifact evidence.

Canis Major 2013-01-14 processing notes:

- [Current status](projects/canis-major-2013-01-14/docs/status.md) - source inventory, failed WBPP registration, WCS recovery integration, current v2 review branch, and judge-crop findings.
- [Processing pipeline](projects/canis-major-2013-01-14/docs/pipeline.md) - 50mm wide-field plan, WCS recovery branch, Phase 2, nonlinear v2, and LLM-as-judge review.
- [Processing journey](projects/canis-major-2013-01-14/docs/processing-journey.md) - chronological planning and processing decision trail.
- [Canis Major processing research](projects/canis-major-2013-01-14/docs/research/01-canis-major-processing.md) - target-specific facts and processing implications for Sirius/M41 wide-field processing.
- [Original 2013 processing evidence](projects/canis-major-2013-01-14/docs/original-2013-processing.md) - historical local stack and processing artifact evidence.
- [2026 WCS v2 review image](projects/canis-major-2013-01-14/docs/images/canis-major-2013-wcs-v2-review.jpg) and [v2 judge crops](projects/canis-major-2013-01-14/docs/images/canis-major-2013-wcs-v2-judge-crops.jpg) - compressed review outputs.

M7 / Ptolemy Cluster 2013-03-10 processing notes:

- [Current status](projects/m7-ptolemy-cluster-2013-03-10/docs/status.md) - source inventory, accepted regular checkpoint branch, v2 diagnostic branch, and dark-lane contrast findings.
- [Processing pipeline](projects/m7-ptolemy-cluster-2013-03-10/docs/pipeline.md) - 120s primary, 60s sibling, no-dark/no-flats plan, Phase 2 solve, BXT/NXT branch, v2 dark-lane contrast diagnostic, and checkpoint decision.
- [Processing journey](projects/m7-ptolemy-cluster-2013-03-10/docs/processing-journey.md) - chronological planning, processing decision trail, and final checkpoint note.
- [M7 processing research](projects/m7-ptolemy-cluster-2013-03-10/docs/research/01-m7-ptolemy-cluster-processing.md) - target facts and processing implications for the open cluster.
- [Original 2013 processing evidence](projects/m7-ptolemy-cluster-2013-03-10/docs/original-2013-processing.md) - historical local stack and Photoshop artifact evidence.
- [2013 cropped/edited reference](projects/m7-ptolemy-cluster-2013-03-10/docs/images/original-2013-attempt-01-cropped-edited.jpg), [accepted 2026 BXT/NXT MaskedStretch checkpoint image](projects/m7-ptolemy-cluster-2013-03-10/docs/images/m7-20130310-bxt-nxt-maskedstretch-bg075.jpg), [v2 dark-lane contrast diagnostic image](projects/m7-ptolemy-cluster-2013-03-10/docs/images/m7-20130310-bxt-nxt-v2-dark-lane-contrast.jpg), and [v2 cluster-core judge crop](projects/m7-ptolemy-cluster-2013-03-10/docs/images/m7-20130310-v2-judge-01-cluster-core.jpg) - compressed review outputs.

Rosette Nebula 2014 processing notes:

- [V3G old-red depth candidate](projects/rosette-2014-03-02/docs/v3g-old-red-depth.md) - visual branch tuned against the 2014 finished-work reference for deeper sky and redder Rosette color.
- [V3H old-red starless layer](projects/rosette-2014-03-02/docs/v3h-old-red-starless.md) - starless version of the old-reference red/depth treatment.
- [V3I/V3J subtle stars](projects/rosette-2014-03-02/docs/v3i-v3j-subtle-stars.md) - restrained star recombination over the old-red starless layer.
- [V3B presentation candidate](projects/rosette-2014-03-02/docs/final-v3b.md) - current preferred result, subs summary, and human-in-the-loop notes.
- [Current status](projects/rosette-2014-03-02/docs/status.md) - source inventory, completed runs, current outputs, and next processing steps.
- [Processing journey](projects/rosette-2014-03-02/docs/processing-journey.md) - chronological record of what was tried, including the v2g presentation candidate, starless-tool decision, BXT/NXT retrofit, and rejected synthetic-star boundary.
- [Processing pipeline](projects/rosette-2014-03-02/docs/pipeline.md) - Rosette-specific PixInsight plan, current color/background findings, and resume plan.
- [Original 2014 processing evidence](projects/rosette-2014-03-02/docs/original-2014-processing.md) - what was found in the old DSS/Photoshop folders.
- [2014 finished-work result](projects/rosette-2014-03-02/docs/images/original-2014-photoshop.jpg), [2026 StarXTerminator v3b result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3b.jpg), [2026 v3g old-red depth result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3g-old-red-depth.jpg), [2026 v3h old-red starless result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3h-old-red-starless.jpg), [2026 v3j subtle stars result](projects/rosette-2014-03-02/docs/images/rosette-starxterminator-v3j-sparse-anchor-stars.jpg), [2026 BXT/NXT v4f real-sparse-anchor result](projects/rosette-2014-03-02/docs/images/rosette-bxt-nxt-starxterminator-v4f-real-sparse-anchors.jpg), [2026 BXT/NXT v4j real-star de-emphasis diagnostic](projects/rosette-2014-03-02/docs/images/rosette-bxt-nxt-starxterminator-v4j-real-gem-deemphasis.jpg), and [2026 BXT/NXT v4l real soft-shine/gloss diagnostic](projects/rosette-2014-03-02/docs/images/rosette-bxt-nxt-starxterminator-v4l-real-soft-shine-gloss.jpg) - compressed comparison images.

Horsehead / Flame 2013-2016 processing notes:

- [Final v1 result](projects/horsehead-flame-2013-2016/docs/final-v1.md) - accepted mixed-camera result, selected data mix, exclusions, and caveats.
- [Current status](projects/horsehead-flame-2013-2016/docs/status.md) - source inventory, calibration findings, and candidate WBPP runs.
- [Processing journey](projects/horsehead-flame-2013-2016/docs/processing-journey.md) - chronological record of decisions and experiments.
- [Processing pipeline](projects/horsehead-flame-2013-2016/docs/pipeline.md) - staged plan for modded, unmodded, and wide-field data.
- [2013 finished-work result](projects/horsehead-flame-2013-2016/docs/images/original-2013-finished-work.jpg) and [2026 PixInsight v1 result](projects/horsehead-flame-2013-2016/docs/images/horsehead-04c-v1-polish.jpg) - compressed comparison images.

Orion Nebula / M42 2013 processing notes:

- [Final v1 result](projects/orion-nebula-m42-2013/docs/final-v1.md) - accepted February 2013 M42/M43/Running Man result, data mix, caveats, and deliverables.
- [Current status](projects/orion-nebula-m42-2013/docs/status.md) - source inventory, completed WBPP diagnostics, calibration findings, exclusions, and review questions.
- [Processing pipeline](projects/orion-nebula-m42-2013/docs/pipeline.md) - M42-specific plan with HDR/core-preservation decision gates.
- [Processing journey](projects/orion-nebula-m42-2013/docs/processing-journey.md) - chronological record of the inventory, planning decision, and Phase 1 diagnostic runs.
- [M42 processing research](projects/orion-nebula-m42-2013/docs/research/01-m42-processing.md) - web findings about M42 HDR processing and Trapezium preservation.
- [2026 final v1 result](projects/orion-nebula-m42-2013/docs/images/m42-2013-v8-presentation.jpg), [2013/v7/final comparison](projects/orion-nebula-m42-2013/docs/images/m42-2013-original-v7-v8-presentation-comparison.jpg), and [final v1 vs BXT/NXT v1/v2 diagnostic](projects/orion-nebula-m42-2013/docs/images/m42-2013-v8-vs-bxt-nxt-v1-v2-comparison.jpg) - accepted M42/M43/Running Man nonlinear export and post-final plugin replacement comparison, with close core/sky crops linked from the project docs.

Trifid / Lagoon 2014 processing notes:

- [Final v1 result](projects/trifid-lagoon-2014/docs/final-v1.md) - accepted March 2014 Trifid/Lagoon result, data mix, caveats, and deliverables.
- [Current status](projects/trifid-lagoon-2014/docs/status.md) - source inventory, likely reason for the `-2` folder suffix, calibration candidates, and final-v1 outputs.
- [Processing pipeline](projects/trifid-lagoon-2014/docs/pipeline.md) - WBPP, Phase 2, and nonlinear plan for the May and March ED80/reducer sessions.
- [Processing journey](projects/trifid-lagoon-2014/docs/processing-journey.md) - chronological planning record and decision trail.
- [Trifid / Lagoon processing research](projects/trifid-lagoon-2014/docs/research/01-trifid-lagoon-processing.md) - target-specific research and processing implications.
- [Original 2014 processing evidence](projects/trifid-lagoon-2014/docs/original-2014-processing.md) - historical local artifacts, attempt-02 references, and finished-work reference.
- [Review checkpoint](projects/trifid-lagoon-2014/docs/review-2026-05-27.md) - March-vs-reference review candidates and rejected diagnostics.
- [2014 attempt-02 reference](projects/trifid-lagoon-2014/docs/images/original-2014-attempt-02-asraw-ps-2.jpg), [2026 final v1 result](projects/trifid-lagoon-2014/docs/images/trifid-lagoon-20140302-final-v1.jpg), and [final v1 comparison](projects/trifid-lagoon-2014/docs/images/trifid-lagoon-2014-final-v1-comparison.jpg) - compressed comparison images.

## Current M31 rerun commands

Copy `.env.example` to `.env` and fill in local paths before running Phase 1. The `.env` file is ignored by git.

```powershell
& .\scripts\run-wbpp-phase1.ps1
& .\scripts\run-phase2.ps1
& .\scripts\run-phase3.ps1
```

Generated PixInsight work products live under each project's `work/` directory and are ignored by git.
