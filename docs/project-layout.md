# Project layout

Use one project directory per target/session:

```text
projects/
  target-name-date/
    docs/
      status.md
      pipeline.md
      research/
    work/
      wbpp-out/
      02-linear/
      03-nonlinear/
      logs/
```

Shared automation belongs in `scripts/`. Target-specific documentation, decisions, and generated outputs belong in the relevant `projects/<slug>/` folder.

For a new raw-image set, create a new lowercase slug such as `projects/orion-2026-01`, then copy `.env.example` to `.env` and set your local raw frame paths. `.env` is ignored by git.

```powershell
& .\scripts\new-project.ps1 -Slug orion-2026-01
& .\scripts\run-wbpp-phase1.ps1 -ProjectDir .\projects\orion-2026-01
& .\scripts\run-phase2.ps1 -ProjectDir .\projects\orion-2026-01 -Phase1Master <master-light>
& .\scripts\run-phase3.ps1 -ProjectDir .\projects\orion-2026-01
```

Some Phase 2 settings are still target-specific, especially the plate-solve seed coordinates and scale in `scripts/pjsr/02b-platesolve.js`.
