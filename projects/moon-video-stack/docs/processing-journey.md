# Moon Video Stack Processing Journey

## 2026-06-05 Project Start

- Started a lunar/planetary video-stacking experiment after finding Moon videos in the local astronomy archive.
- Confirmed AutoStakkert 4 was installed locally and that it does not expose a useful headless command-line batch API for this workflow.
- Added `scripts/prepare-autostakkert-batch.ps1` to make the manual AutoStakkert step less error-prone:
  - stage videos into an ignored project `work/` folder,
  - assign simple `clip-###` names,
  - write a source map,
  - capture basic ffprobe metadata,
  - optionally update AS Moon/surface defaults and launch AS.
- First staging accidentally followed the repo `.env` project directory from a different target; corrected the script default so Moon video staging lands under `projects/moon-video-stack`.

## AutoStakkert Session

- The staged set included 22 videos from several dates, phases, and resolutions.
- The AutoStakkert browser made it hard to select a clean subset while mixed resolutions were present.
- We created a same-resolution input subset for the 1056 x 704 files.
- AutoStakkert was then run manually through the GUI:
  - load the same-resolution files,
  - analyze,
  - place an AP grid,
  - stack with multiple stack percentages.
- AS generated separate stacks per video clip, not one final image from all clips.

## Phase-Mixing Discovery

- After stacking, we noticed the original staged collection contained different Moon phases from different dates.
- The AS outputs were grouped by session/date to avoid mixing phases:
  - 2012-05-31 Moon, 6 processed clips.
  - 2014-02-02 crescent Moon, 7 processed clips.
  - 2023-02-13 Moon, 1 processed clip.
- The session grouping was correct for review, but it also made clear that any final result must be built from one date/phase only.

## Same-Phase Combine Attempt

- Chose the 2014-02-02 crescent set because it had the most same-day clips at the processed resolution.
- Used the `P25` AS outputs as a first combine attempt.
- Translation-aligned the seven per-clip stacks to `clip-001`, averaged them, and generated full-frame/cropped sharpened previews.
- The contact sheet showed no obvious phase mismatch or gross doubling, but the final visual quality still was not good enough.

## Stop Decision

- User chose to abandon the project for now because the stacked images are not good.
- Current products remain useful only as diagnostics and process notes.
- Future work should restart from a single date/phase and review individual AS outputs before any multi-clip combine.
