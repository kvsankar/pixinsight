# Original 2014 Processing Evidence

This page records local historical artifacts found during the Trifid/Lagoon inventory. These are evidence, not final processing instructions.

## Finished-Work Reference

A finished JPEG was found in the local finished-work archive:

```text
finished-work/20140302-Trifid-Lagoon-Nebulae.jpg
```

A compressed public comparison copy is checked in here:

```text
docs/images/original-2014-finished-work.jpg
```

ExifTool did not report useful EXIF/software metadata from this JPEG, so treat it as a visual reference only.

## Attempt-02 Reference Images

The user identified the stronger historical reference in the March processing folder:

```text
by-date/20140302-coorg-keemale-trifid-lagoon/processing/attempt-02
```

Two public comparison copies are checked in:

```text
docs/images/original-2014-attempt-02-asraw-ps-2.jpg
docs/images/original-2014-attempt-02-asraw-ps.jpg
```

The `asraw-ps-2` image matches the user-supplied reference shown during review. It is brighter and more saturated than the smaller finished-work copy, with stronger pink/magenta M8 color, blue/red M20 contrast, and a brighter Sagittarius star-cloud background. Use this as the primary historical look reference.

The `original-2014-finished-work.jpg` copy is still useful as evidence, but it appears to be a smaller filtered derivative rather than the best comparison target.

## March 2014 Folder

The March folder contains both raw frames and historical processing outputs:

```text
by-date/20140302-coorg-keemale-trifid-lagoon
```

Notable contents:

| Location | Contents |
| --- | --- |
| `good` | 38 CR2 lights plus many `.cal.tif`, `.Info.txt`, and `.stackinfo.txt` artifacts |
| `stacking/attempt-01` | `Autosave.html` and `Autosave.tif` |
| `processing/attempt-01` | Stacked/applied TIFF and PSD files |
| `processing/attempt-02` | TIFF, PSD, and web-sized JPEG outputs |

The raw March lights are 120s ISO1600 Canon EOS 60D frames with unreliable EXIF focal-length metadata, likely from the ES ED80/reducer setup, with recorded temperatures from about +24 to +30 C. The old artifacts suggest a prior DSS/Photoshop workflow, but they should not be mixed into the new PixInsight integration.

## May 2014 Folder

The May folder is cleaner and appears raw-oriented:

```text
by-date/20140504-yelagiri-kairos-trifid-lagoon-2
```

Notable contents:

| Location | Contents |
| --- | --- |
| `good` | 39 CR2 lights |
| `bad/smudged` | 6 rejected CR2 frames |
| `bad/trailing` | 2 rejected CR2 frames |
| `bad/washed-out` | 2 rejected CR2 frames |
| `trial-shots` | 41 mixed short/test CR2 frames |
| `processing`, `stacking`, `unsorted` | No useful files found during this inventory pass |

The May `good` frames are 120s ISO1600 Canon EOS 60D frames with unreliable EXIF focal-length metadata, likely from the ES ED80/reducer setup, with recorded temperatures from about +31 to +34 C.

## Interpretation

The most likely explanation for the May folder suffix is that the March Trifid/Lagoon folder already existed, and the May folder became the second Trifid/Lagoon collection in the archive.

The March historical JPEGs are useful for final comparison, especially the attempt-02 `asraw-ps-2` copy, but the modern PixInsight work should start from raw CR2 frames, not from the old TIFF/PSD/JPEG products.
