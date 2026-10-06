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

The Dexterity section shows four clips across three subsections: handover and in-hand manipulation, regrasping, and pre-grasp manipulation. Three clips retain the saved trims from slides 28 and 30 of `SimDuoReal.key`. The coordination clips from slide 29 remain archived but are no longer displayed. Pre-grasp manipulation uses the full supplied `C0175.MP4`, encoded at 1280×720 and 30fps with its framing and timing preserved; it replaces the three earlier slide-31 clips. `assets/dexterity/manifest.json` records the sources for the displayed clips. The earlier pre-grasp assets remain archived in the folder. All clips are silent H.264 with fast-start metadata.

To add a clip, place its MP4 and JPEG poster in `assets/dexterity/`, add its provenance to the manifest, and add a `dexterity-clip` figure to the relevant `dexterity-grid` in `index.html`. Use `data-src`, `preload="none"`, `muted`, `loop`, `playsinline`, and `controls` on the video. Update the group's clip count. The grid wraps extra clips automatically; the existing script supplies visibility-based autoplay and shared 0.5× / 1× / 2× controls for every video in the section.

## Expert simulation videos

Workspace experts includes Left workspace, Cross-workspace, and Right workspace tabs. The full 60-second recordings from `Downloads/small` are encoded at 1280px wide with their aspect ratios and timing preserved. `assets/experts/manifest.json` records the sources. Only the visible expert loads and autoplays; hidden experts pause. The existing custom playback and section speed controls apply to these videos.

The method wording follows Section III and Figure 2 of the supplied paper: workspace experts, transition-aware refinement, unified-policy distillation, and object-trajectory commands.

## Barcode object choices

Barcode scanning offers six recordings from `SimDuoReal_demo/barcode_new`, with source mappings in `assets/barcode/manifest.json`. Full clips are encoded as silent 1280×720 H.264 at 30fps with fast-start metadata. The shared player loads only the selected clip and remembers the object selection when switching tasks. Existing speed and viewport playback controls apply. The reported task success rate remains the paper’s aggregate result.

The combined handover and in-hand manipulation clip is already slowed to 0.5× in its source. Its `data-source-speed="0.5"` scales displayed speeds to actual motion: 0.25× / 0.5× / 1×, while browser playback stays at 0.5× / 1× / 2×. Other clips retain their existing labels.

Assembly and Cleaning each show one full recording with objects starting in different workspaces: `assembly-different.mp4` from `assembly.MP4` and `cleaning-different.mp4` from `clean.MP4`. No workspace selector is shown. Earlier assets are retained for provenance.
