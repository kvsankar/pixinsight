# PixInsight automation workspace

This is an experiment to see how far generative AI can help with astrophotography processing using PixInsight and other tools.

This repository is organized for repeatable PixInsight processing across multiple astrophotography targets.

## Layout

- `scripts/` - shared PowerShell drivers and PixInsight JavaScript process scripts.
- `projects/` - one folder per imaging target/session.
- `docs/` - repository-level notes that are not tied to a single target.

The current processed target is `projects/m31-andromeda-2013`.

## Current M31 rerun commands

Copy `.env.example` to `.env` and fill in local paths before running Phase 1. The `.env` file is ignored by git.

```powershell
& .\scripts\run-wbpp-phase1.ps1
& .\scripts\run-phase2.ps1
& .\scripts\run-phase3.ps1
```

Generated PixInsight work products live under each project's `work/` directory and are ignored by git.
