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

The six supplied recordings are converted to 1280px H.264 MP4, 30fps, without audio, retaining their source timing. The overview joins four five-second excerpts; no extra playback acceleration is applied. `assets/media-sources.json` maps the descriptive filenames to the provided originals. Originals are untouched. All source clips remain available through the task gallery and behavior videos.

The paper contains the reported results. Real-world demonstrations are driven by operator-provided object goals; robot arm/hand control is learned. The interactive demo is explicitly marked as forthcoming.
