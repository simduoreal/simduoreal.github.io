# SimDuoReal project website

Self-contained static project page. Open through a local web server or host this directory with GitHub Pages / any static web host. This repository is the working copy for subsequent site refinements.

```sh
python3 -m http.server 8000
```

## Content

- `index.html`: research narrative, anonymous attribution, quantitative results, and citation.
- `style.css`: warm ivory editorial styling, horizontal navigation, asymmetric research header, and thumbnail task gallery with responsive layouts.
- `script.js`: accessible video/method tabs, video visibility handling, citation copying, and section navigation.
- `site-config.js`: set `demoUrl` to the future demo's HTTPS URL to enable both launch links and update the coming-soon text.
- `assets/`: optimized video copies, posters, and the supplied paper.

The website and citation are anonymous for now. Affiliations and a publication venue are omitted. The citation is a provisional `misc` entry, not a claim of conference acceptance.

The six supplied recordings are converted to 1280px H.264 MP4, 30fps, without audio, retaining their source timing. The overview joins four five-second excerpts; no extra playback acceleration is applied. `assets/media-sources.json` maps the descriptive filenames to the provided originals. Originals are untouched. The task gallery retains its full task recordings.

The paper contains the reported results. Real-world demonstrations are driven by operator-provided object goals; robot arm/hand control is learned. The interactive demo is explicitly marked as forthcoming.

## Dexterity clips

The Dexterity section groups nine clips from the detailed Emergent Dexterity slides (28–31) in `SimDuoReal.key`: in-hand manipulation and handover, bimanual coordination, regrasping, and pre-grasp manipulation. `assets/dexterity/manifest.json` records source files, slide numbers, and the saved Keynote start/end times. Output durations are rounded to 30fps frame boundaries. The pre-grasp clips retain the right 60% of the source frame to match the slide's close framing; the other clips preserve the full frame. Clips are silent H.264 with fast-start metadata.

To add a clip, place its MP4 and JPEG poster in `assets/dexterity/`, add its provenance to the manifest, and add a `dexterity-clip` figure to the relevant `dexterity-grid` in `index.html`. Use `data-src`, `preload="none"`, `muted`, `loop`, `playsinline`, and `controls` on the video. Update the group's clip count. The grid wraps extra clips automatically; the existing script supplies visibility-based autoplay and shared 0.5× / 1× / 2× controls for every video in the section.
