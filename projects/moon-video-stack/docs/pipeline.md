# Moon Video Stack Pipeline

## Current State

This pipeline is paused. The first AutoStakkert and same-phase combine results were not accepted, so this document records a conservative resume plan rather than a completed workflow.

## Intended Workflow

1. Select one Moon date/phase before staging.
2. Stage videos with `scripts/prepare-autostakkert-batch.ps1`.
3. In AutoStakkert, process only files with matching resolution and phase.
4. Review per-clip outputs before combining clips.
5. Promote only one clean stack or one carefully aligned same-day combine.
6. Perform any further sharpening or tonal work from the real stacked data only.

## AutoStakkert Notes

- AutoStakkert GUI batch processing can process multiple loaded clips, but it creates one stacked output per clip and per selected stack percentage.
- For Moon work, use `Surface` stabilization, a gradient quality estimator, and an AP grid over the lunar surface.
- Mixed-resolution inputs make the AS browser and selection step confusing. Stage only one resolution group when possible.
- Multiple stack percentages are useful for diagnostics but multiply output count quickly.

## Resume Plan

- Re-open the ignored work products only for comparison; do not treat them as the final source of truth.
- Pick one session:
  - `2014-02-02-crescent-1056x704` has the most same-day 1056 x 704 clips.
  - `2012-05-31-moon-1056x704` has six same-day 1056 x 704 clips.
  - `2023-02-13-moon-1056x704` has only one processed clip.
- Inspect individual `P10`, `P25`, and `P50` TIFs from the chosen session.
- If one per-clip stack is clearly better than the combined result, prefer that single stack.
- If combining multiple clip stacks again, align first and check a contact sheet for doubled limbs before sharpening.

## Guardrails

- Do not combine different Moon phases.
- Do not combine different resolutions without an explicit resampling/alignment plan.
- Do not synthesize, paint in, clone in, or generate lunar details.
- Keep all TIF/JPG processing products under `work/` unless a small, explicitly accepted comparison image is later added to `docs/images/`.
