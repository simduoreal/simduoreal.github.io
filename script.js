(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const taskData = {
    assembly: {title: 'Two hands, one precise fit.', description: 'Acquire a peg and a block, transfer when needed, then coordinate both hands to align and insert.', count: 15, label: 'Real-world peg insertion demonstration'},
    scanning: {title: 'Bring the barcode into view.', description: 'Pick up and reorient the brush, passing it between hands to present its barcode to the scanner.', count: 15, label: 'Real-world barcode scanning demonstration'},
    cleaning: {title: 'A coordinated pair of tools.', description: 'Acquire the brush and dustpan, transfer the brush, then coordinate the two objects through a sweeping motion.', count: 16, label: 'Real-world brush and dustpan cleaning demonstration'},
    cooking: {title: 'Keep one steady. Move the other.', description: 'Stabilize the pan with one hand while the other moves the spatula through the prescribed cooking motion.', count: 15, label: 'Real-world pan and spatula cooking demonstration'}
  };

  function wireTabs(group, onSelect) {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
      onSelect(tab);
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let index;
        if (event.key === 'ArrowRight' || (event.key === 'ArrowDown' && group.getAttribute('aria-orientation') === 'vertical')) index = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || (event.key === 'ArrowUp' && group.getAttribute('aria-orientation') === 'vertical')) index = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') index = 0;
        if (event.key === 'End') index = tabs.length - 1;
        if (index !== undefined) { event.preventDefault(); tabs[index].focus(); select(tabs[index]); }
      });
    });
  }

  const taskVideo = document.getElementById('task-video');
  const compactGallery = window.matchMedia('(max-width: 760px)');
  const syncGalleryOrientation = () => document.querySelector('.task-tabs').setAttribute('aria-orientation', compactGallery.matches ? 'horizontal' : 'vertical');
  compactGallery.addEventListener('change', syncGalleryOrientation);
  syncGalleryOrientation();
  wireTabs(document.querySelector('.task-tabs'), tab => {
    const name = tab.dataset.task;
    const data = taskData[name];
    const changed = !taskVideo.getAttribute('src').endsWith(`/${name}.mp4`);
    if (changed) {
      pauseAutomatically(taskVideo);
      taskVideo.poster = `assets/${name}.jpg`;
      taskVideo.src = `assets/${name}.mp4`;
      taskVideo.setAttribute('aria-label', data.label);
      taskVideo.load();
      manuallyPaused.delete(taskVideo);
      playWhenVisible(taskVideo);
    }
    document.getElementById('task-title').textContent = data.title;
    document.getElementById('task-description').textContent = data.description;
    document.getElementById('task-count').replaceChildren(document.createTextNode(String(data.count)), Object.assign(document.createElement('span'), {textContent: '/20'}));
    document.getElementById('task-panel').setAttribute('aria-labelledby', tab.id);
  });

  wireTabs(document.querySelector('.method-tabs'), tab => {
    document.querySelectorAll('.method-panel').forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  });

  // Load and play videos as they enter view, keeping offscreen clips paused.
  const overview = document.getElementById('overview-video');
  const inView = new Set();
  const manuallyPaused = new Set();
  const automaticPauses = new WeakSet();
  const videos = [...document.querySelectorAll('video')];
  // Reveal controls on interaction, never just because autoplay starts.
  videos.forEach(video => {
    const frame = video.closest('.video-frame');
    video.tabIndex = 0;
    video.controls = false;
    frame.classList.add('custom-player');
    const playback = document.createElement('div');
    playback.className = 'video-playback-controls';
    playback.setAttribute('role', 'group');
    playback.setAttribute('aria-label', 'Video playback');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'video-play-toggle';
    const seek = document.createElement('input');
    seek.type = 'range';
    seek.className = 'video-seek';
    seek.min = '0';
    seek.max = '0';
    seek.step = '0.01';
    seek.value = '0';
    seek.disabled = true;
    seek.setAttribute('aria-label', 'Video position');
    const time = document.createElement('span');
    time.className = 'video-time';
    time.setAttribute('aria-hidden', 'true');
    const formatTime = seconds => {
      const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
      return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
    };
    const syncControls = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      toggle.innerHTML = video.paused
        ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5 16 10 6 16.5Z" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4v12M14 4v12" stroke="currentColor" stroke-width="3"/></svg>';
      seek.disabled = duration <= 0;
      seek.max = String(duration);
      seek.value = String(video.currentTime);
      seek.style.setProperty('--progress', `${duration ? video.currentTime / duration * 100 : 0}%`);
      seek.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} of ${formatTime(duration)}`);
      time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
    };
    const togglePlayback = () => {
      if (video.paused) {
        if (video.dataset.src) { video.src = video.dataset.src; delete video.dataset.src; video.load(); }
        video.play().catch(() => {});
      } else video.pause();
    };
    toggle.addEventListener('click', togglePlayback);
    seek.addEventListener('input', () => {
      if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value);
      syncControls();
    });
    video.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); togglePlayback(); }
    });
    for (const event of ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange', 'emptied']) video.addEventListener(event, syncControls);
    playback.append(toggle, seek, time);
    frame.append(playback);
    syncControls();
    let hovering = false;
    let keyboardFocus = false;
    let touchActive = false;
    const updateControls = () => {
      const visible = hovering || keyboardFocus || touchActive;
      video.controls = false;
      frame.classList.toggle('controls-visible', visible);
    };
    frame.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') hovering = true;
      updateControls();
    });
    frame.addEventListener('pointerleave', () => { hovering = false; updateControls(); });
    frame.addEventListener('pointerdown', event => {
      keyboardFocus = false;
      if (event.pointerType === 'touch') touchActive = true;
      updateControls();
    });
    frame.addEventListener('focusin', event => {
      if (event.target.matches(':focus-visible')) keyboardFocus = true;
      updateControls();
    });
    frame.addEventListener('focusout', () => {
      // Wait for focus to reach the next control before hiding the toolbar.
      requestAnimationFrame(() => {
        if (!frame.contains(document.activeElement)) keyboardFocus = false;
        updateControls();
      });
    });
    frame.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        hovering = false;
        keyboardFocus = false;
        touchActive = false;
      } else keyboardFocus = true;
      updateControls();
    });
    document.addEventListener('pointerdown', event => {
      if (!frame.contains(event.target)) { touchActive = false; updateControls(); }
    });
    updateControls();
  });
  // One speed per section, shared by any companion clips. Reuse the same files.
  const speedSections = new Map();
  videos.forEach(video => {
    const section = video.closest('section');
    if (!speedSections.has(section)) speedSections.set(section, {rate: 1, videos: [], controls: []});
    const state = speedSections.get(section);
    state.videos.push(video);
    const controls = document.createElement('div');
    controls.className = 'video-speed-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Section playback speed');
    const status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    for (const rate of [0.5, 1, 2]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${rate}×`;
      button.dataset.rate = String(rate);
      button.setAttribute('aria-label', `${rate} times playback speed`);
      button.setAttribute('aria-pressed', String(rate === state.rate));
      button.addEventListener('click', () => {
        state.rate = rate;
        state.videos.forEach(clip => {
          clip.defaultPlaybackRate = rate;
          clip.playbackRate = rate;
        });
        updateSpeedControls(state);
        status.textContent = `Section playback speed: ${rate} times`;
      });
      controls.append(button);
    }
    controls.append(status);
    state.controls.push(controls);
    video.parentElement.append(controls);
    video.addEventListener('loadedmetadata', () => {
      video.defaultPlaybackRate = state.rate;
      video.playbackRate = state.rate;
    });
    video.addEventListener('ratechange', () => {
      // Ignore transient resets while a new source is loading.
      if (video.readyState === 0 || video.playbackRate === state.rate) return;
      state.rate = video.playbackRate;
      state.videos.forEach(clip => {
        if (clip.defaultPlaybackRate !== state.rate) clip.defaultPlaybackRate = state.rate;
        if (clip.playbackRate !== state.rate) clip.playbackRate = state.rate;
      });
      updateSpeedControls(state);
    });
  });
  function updateSpeedControls(state) {
    state.controls.forEach(controls => {
      controls.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(Number(button.dataset.rate) === state.rate));
      });
    });
  }

  function pauseAutomatically(video) {
    if (!video.paused) {
      automaticPauses.add(video);
      video.pause();
    }
  }
  function playWhenVisible(video) {
    if (!inView.has(video) || document.hidden || reducedMotion.matches || manuallyPaused.has(video)) return;
    video.play().then(() => {
      if (!inView.has(video) || document.hidden || reducedMotion.matches) pauseAutomatically(video);
    }).catch(() => {}); // Browser autoplay restrictions leave native controls available.
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target: video, isIntersecting, intersectionRatio}) => {
      if (isIntersecting && intersectionRatio >= 0.15) {
        inView.add(video);
        if (video.dataset.src) { video.src = video.dataset.src; delete video.dataset.src; video.load(); }
        playWhenVisible(video);
      } else {
        inView.delete(video);
        pauseAutomatically(video);
      }
    });
  }, {threshold: 0.15});
  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('pause', () => {
      if (automaticPauses.delete(video)) return;
      if (inView.has(video) && !document.hidden && !reducedMotion.matches) manuallyPaused.add(video);
    });
    video.addEventListener('play', () => { manuallyPaused.delete(video); });
    observer.observe(video);
  });
  overview.addEventListener('timeupdate', () => {
    document.getElementById('reel-task').textContent = ['Assembly', 'Barcode scanning', 'Cleaning', 'Cooking'][Math.min(3, Math.floor(overview.currentTime / 5))];
  });
  function syncPlayback() {
    videos.forEach(video => {
      if (document.hidden || reducedMotion.matches) pauseAutomatically(video);
      else playWhenVisible(video);
    });
  }
  reducedMotion.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);

  const sectionLinks = [...document.querySelectorAll('.contents nav a')];
  const sections = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).sort((a, b) => a.offsetTop - b.offsetTop);
  let scheduled = false;
  function updateNavigation() {
    const threshold = window.innerWidth <= 800 ? 160 : 180;
    let current = null;
    sections.forEach(section => { if (section.getBoundingClientRect().top <= threshold) current = section; });
    sectionLinks.forEach(link => {
      if (current && link.getAttribute('href') === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); } }, {passive: true});
  updateNavigation();

  const dexterityNav = document.querySelector('.dexterity-nav');
  const dexterityLinks = [...dexterityNav.querySelectorAll('a')];
  const dexterityHeadings = dexterityLinks.map(link => document.querySelector(link.getAttribute('href')));
  const mainNav = document.querySelector('.contents');
  let dexterityScheduled = false;
  function updateDexterityNavigation() {
    const threshold = window.innerHeight / 2 + 1;
    let active = dexterityHeadings[0];
    dexterityHeadings.forEach(heading => {
      if (heading.getBoundingClientRect().top <= threshold) active = heading;
    });
    dexterityLinks.forEach(link => {
      if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    dexterityScheduled = false;
  }
  function sizeDexterityNavigation() {
    const height = mainNav.getBoundingClientRect().height;
    dexterityNav.style.setProperty('--main-nav-height', `${height}px`);
    const pagePadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    dexterityHeadings.forEach(heading => {
      heading.style.scrollMarginTop = `${Math.max(0, window.innerHeight / 2 - heading.getBoundingClientRect().height / 2 - pagePadding)}px`;
    });
    updateDexterityNavigation();
  }
  new ResizeObserver(sizeDexterityNavigation).observe(mainNav);
  window.addEventListener('resize', sizeDexterityNavigation);
  window.addEventListener('scroll', () => {
    if (!dexterityScheduled) { dexterityScheduled = true; requestAnimationFrame(updateDexterityNavigation); }
  }, {passive: true});
  sizeDexterityNavigation();

  const copyButton = document.getElementById('copy-citation');
  copyButton.addEventListener('click', async () => {
    const text = document.getElementById('citation-text').textContent;
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = 'Copied';
      document.getElementById('copy-status').textContent = 'Citation copied to clipboard.';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 2200);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('citation-text'));
      selection.removeAllRanges(); selection.addRange(range);
      copyButton.textContent = 'Select & copy';
      document.getElementById('copy-status').textContent = 'Citation selected. Use your browser’s copy command.';
    }
  });

  // A future external demo is enabled through one setting, without placeholder links.
  const demoUrl = window.SIMDUOREAL?.demoUrl;
  if (demoUrl) {
    try {
      const url = new URL(demoUrl);
      if (url.protocol === 'https:') {
        const launch = document.getElementById('demo-launch');
        launch.href = url.href; launch.hidden = false;
        document.getElementById('demo-pending').hidden = true;
        document.querySelector('.demo-copy p').textContent = 'Explore SimDuoReal in a dedicated interactive experience, directly in your browser.';
        const heroLink = document.querySelector('.resource-links a[href="#demo"]');
        heroLink.href = url.href; heroLink.target = '_blank'; heroLink.rel = 'noopener';
        heroLink.textContent = 'Interactive demo ↗';
      }
    } catch { /* Leave the coming-soon state intact until a valid URL is supplied. */ }
  }
})();
