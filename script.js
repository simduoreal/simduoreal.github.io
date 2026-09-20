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
      taskVideo.pause();
      taskVideo.poster = `assets/${name}.jpg`;
      taskVideo.src = `assets/${name}.mp4`;
      taskVideo.setAttribute('aria-label', data.label);
      taskVideo.load();
      if (!reducedMotion.matches) taskVideo.play().catch(() => {});
    }
    document.getElementById('task-title').textContent = data.title;
    document.getElementById('task-description').textContent = data.description;
    document.getElementById('task-count').replaceChildren(document.createTextNode(String(data.count)), Object.assign(document.createElement('span'), {textContent: '/20'}));
    document.getElementById('task-panel').setAttribute('aria-labelledby', tab.id);
  });

  wireTabs(document.querySelector('.method-tabs'), tab => {
    document.querySelectorAll('.method-panel').forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  });

  // Defer loading lower-page videos; only the small overview starts on its own.
  const overview = document.getElementById('overview-video');
  let overviewAutoAllowed = !reducedMotion.matches;
  const inView = new Set();
  let observerPausing = false;
  const videos = [...document.querySelectorAll('video')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target: video, isIntersecting}) => {
      if (isIntersecting) {
        inView.add(video);
        if (video.dataset.src) { video.src = video.dataset.src; delete video.dataset.src; video.load(); }
        if (video === overview && overviewAutoAllowed && !document.hidden) video.play().catch(() => {});
      } else {
        inView.delete(video);
        observerPausing = true;
        video.pause();
        observerPausing = false;
      }
    });
  }, {threshold: 0.15});
  videos.forEach(video => {
    observer.observe(video);
    video.addEventListener('play', () => { videos.forEach(other => { if (other !== video) other.pause(); }); });
  });
  // A user pause remains paused when the overview scrolls back into view.
  overview.addEventListener('pause', () => {
    if (!observerPausing && inView.has(overview) && !document.hidden) overviewAutoAllowed = false;
  });
  overview.addEventListener('timeupdate', () => {
    document.getElementById('reel-task').textContent = ['Assembly', 'Barcode scanning', 'Cleaning', 'Cooking'][Math.min(3, Math.floor(overview.currentTime / 5))];
  });
  reducedMotion.addEventListener('change', () => { overviewAutoAllowed = !reducedMotion.matches; if (reducedMotion.matches) overview.pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) videos.forEach(video => video.pause()); });

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
