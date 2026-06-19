const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const tones = ['var(--rust)', 'var(--gold)', 'var(--sage)', 'var(--slate)', 'var(--plum)', 'var(--violet)'];
let profileData = null;

async function loadProfile() {
  const response = await fetch('/data/profile.json', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Não foi possível carregar o conteúdo do portfólio.');
  return response.json();
}

function renderStats(stats) {
  $('#hero-stats').innerHTML = stats.map(item => `
    <div class="hero-stat">
      <strong>${item.value}</strong>
      <span>${item.label}</span>
    </div>
  `).join('');
}

function renderFocus(items) {
  $('#focus-grid').innerHTML = items.map((item, index) => `
    <article class="focus-card reveal" style="--delay:${index * 75}ms;--card-tone:${tones[index % tones.length]}">
      <div class="focus-symbol" aria-hidden="true">${item.symbol}</div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <div class="tag-list">${item.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
    </article>
  `).join('');
}

function technologyIcon(item) {
  if (item.iconUrl) {
    return `<img src="${item.iconUrl}" alt="" width="44" height="44" loading="lazy" decoding="async">`;
  }
  if (item.iconClass) {
    return `<i class="${item.iconClass}" aria-hidden="true"></i>`;
  }
  return `<span aria-hidden="true">${item.name.slice(0, 2).toUpperCase()}</span>`;
}

function renderTechnologies(items) {
  const doubled = [...items, ...items];
  $('#tech-track').innerHTML = doubled.map(item => `
    <div class="tech-badge" aria-label="${item.name}">
      <span class="tech-icon">${technologyIcon(item)}</span>
      <span>${item.name}</span>
    </div>
  `).join('');
}

function projectLinks(links) {
  if (!links?.length) return '<span class="disabled">Preview público em breve</span>';
  return links.map(link => {
    const isDownload = link.url.toLowerCase().endsWith('.pbix');
    const attrs = isDownload ? 'download' : 'target="_blank" rel="noopener"';
    return `<a href="${link.url}" ${attrs}>${link.label} ↗</a>`;
  }).join('');
}

function renderProjects(projects, filter = 'all') {
  const filtered = filter === 'all' ? projects : projects.filter(project => project.category === filter);
  $('#project-grid').innerHTML = filtered.map((project, index) => `
    <article class="project-card reveal" style="--delay:${index * 65}ms" data-category="${project.category}">
      <div class="project-media">
        <img src="${project.image}" alt="${project.alt}" loading="lazy">
        <span class="project-status ${project.status.toLowerCase().includes('desenvolvimento') ? 'is-building' : ''}">${project.status}</span>
      </div>
      <div class="project-body">
        <p class="project-kicker">${project.categoryLabel} · ${project.kicker}</p>
        <h3>${project.name}</h3>
        <p class="project-description">${project.summary}</p>
        <div class="tag-list compact-tags">${project.tags.slice(0, 4).map(tag => `<span>${tag}</span>`).join('')}</div>
        <div class="project-card-actions">
          <button class="project-open" type="button" data-project="${project.name}" aria-label="Ver detalhes do projeto ${project.name}">Ver detalhes <span aria-hidden="true">↗</span></button>
          ${project.links?.[0] ? `<a class="project-direct" href="${project.links[0].url}" target="_blank" rel="noopener" aria-label="${project.links[0].label} de ${project.name}">${project.links[0].label}</a>` : ''}
        </div>
      </div>
    </article>
  `).join('');

  setupReveal();
  setupProjectButtons();
}

function setupProjectFilters(projects) {
  const filterBox = $('#project-filters');
  filterBox.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    $$('button[data-filter]', filterBox).forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderProjects(projects, button.dataset.filter);
  });
}

function openProjectDialog(project) {
  const dialog = $('#project-dialog');
  $('.dialog-media img', dialog).src = project.image;
  $('.dialog-media img', dialog).alt = project.alt;
  $('#project-dialog-kicker').textContent = `${project.categoryLabel} · ${project.kicker}`;
  $('#project-dialog-title').textContent = project.name;
  $('#project-dialog-summary').textContent = project.description;
  $('#project-dialog-problem').textContent = project.problem;
  $('#project-dialog-solution').textContent = project.solution;
  $('#project-dialog-value').textContent = project.value;
  const gallery = $('#project-dialog-gallery');
  if (project.gallery?.length) {
    gallery.hidden = false;
    gallery.innerHTML = project.gallery.map((item, index) => `
      <button type="button" data-gallery-index="${index}" aria-label="Ver ${item.caption || project.name}">
        <img src="${item.image}" alt="${item.alt}" loading="lazy"><span>${item.caption || ''}</span>
      </button>`).join('');
    $$('button', gallery).forEach((button, index) => button.addEventListener('click', () => {
      const item = project.gallery[index];
      $('.dialog-media img', dialog).src = item.image;
      $('.dialog-media img', dialog).alt = item.alt;
      $$('button', gallery).forEach((candidate, candidateIndex) => candidate.classList.toggle('is-active', candidateIndex === index));
      button.classList.add('is-active');
    }));
    $('button', gallery)?.classList.add('is-active');
  } else {
    gallery.hidden = true;
    gallery.innerHTML = '';
  }
  $('#project-dialog-tags').innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
  $('#project-dialog-links').innerHTML = projectLinks(project.links);
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function setupProjectButtons() {
  $$('.project-open').forEach(button => {
    button.addEventListener('click', () => {
      const project = profileData.projects.find(item => item.name === button.dataset.project);
      if (project) openProjectDialog(project);
    });
  });
}

function setupProjectDialog() {
  const dialog = $('#project-dialog');
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}

function renderTimeline(items) {
  $('#timeline').innerHTML = items.map((item, index) => `
    <article class="timeline-item reveal ${item.active ? 'is-current' : ''}" style="--delay:${index * 75}ms;--tone:${tones[index % tones.length]}">
      <div class="timeline-period">${item.period}</div>
      <div class="timeline-marker" aria-hidden="true"><span></span></div>
      <div class="timeline-content">
        <p>${item.place}</p>
        <h3>${item.title}</h3>
        <span>${item.text}</span>
        <div class="tag-list">${item.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      </div>
    </article>
  `).join('');
}

function renderCertificates(items) {
  $('#certificate-grid').innerHTML = items.map((item, index) => `
    <article class="certificate-card reveal" style="--delay:${index * 60}ms;--tone:${tones[index % tones.length]}">
      <span class="certificate-category">${item.category}</span>
      <h3>${item.title}</h3>
      <p class="certificate-meta">${item.issuer} · ${item.date}</p>
    </article>
  `).join('');
}

function renderInterests(items) {
  $('#interest-grid').innerHTML = items.map((item, index) => `
    <article class="interest-card reveal" style="--delay:${index * 70}ms">
      <span aria-hidden="true">${item.icon}</span>
      <div><h3>${item.title}</h3><p>${item.text}</p></div>
    </article>
  `).join('');
}

function renderGallery(items) {
  $('#gallery-grid').innerHTML = items.map((item, index) => `
    <button class="gallery-card reveal" type="button" style="--delay:${index * 55}ms" data-image="${item.image}" data-title="${item.title}" data-alt="${item.alt}">
      <span class="photo-frame"><img src="${item.image}" alt="${item.alt}" loading="lazy"></span>
      <span class="gallery-caption"><strong>${item.title}</strong><small>${item.text}</small></span>
    </button>
  `).join('');
}

function setupReveal() {
  const elements = $$('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px' });
  elements.forEach(el => observer.observe(el));
}

function setupHeader() {
  const header = $('.site-header');
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function setupNavigation() {
  const toggle = $('.menu-toggle');
  const nav = $('.main-nav');
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('nav-open', !isOpen);
  });
  $$('.main-nav a').forEach(link => link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  }));

  const links = $$('.main-nav a');
  const sections = $$('main section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(section => observer.observe(section));
}

function setupTheme() {
  const root = document.documentElement;
  const button = $('.theme-toggle');
  const stored = localStorage.getItem('max-theme');
  root.dataset.theme = stored || 'light';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', root.dataset.theme === 'dark' ? '#0E1110' : '#F4EFE4');

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('max-theme', next);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', next === 'dark' ? '#0E1110' : '#F4EFE4');
  });
}

function setupParallax() {
  if (!window.matchMedia('(pointer:fine)').matches) return;
  const hero = $('.hero');
  const layers = $$('[data-depth]', hero);
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    layers.forEach(layer => {
      const depth = Number(layer.dataset.depth || 1);
      layer.style.transform = `translate3d(${x * 8 * depth}px, ${y * 7 * depth}px, ${depth * 2}px)`;
    });
  });
  hero.addEventListener('pointerleave', () => layers.forEach(layer => { layer.style.transform = ''; }));
}

function setupGallery() {
  const lightbox = $('#lightbox');
  const image = $('img', lightbox);
  const caption = $('figcaption', lightbox);
  const close = () => {
    lightbox.hidden = true;
    image.src = '';
    document.body.style.overflow = '';
  };
  $$('.gallery-card').forEach(card => card.addEventListener('click', () => {
    image.src = card.dataset.image;
    image.alt = card.dataset.alt;
    caption.textContent = card.dataset.title;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }));
  $('.lightbox-close').addEventListener('click', close);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !lightbox.hidden) close(); });
}

async function init() {
  try {
    profileData = await loadProfile();
    renderStats(profileData.stats);
    renderFocus(profileData.focus);
    renderTechnologies(profileData.technologies);
    renderProjects(profileData.projects);
    renderTimeline(profileData.timeline);
    renderCertificates(profileData.certificates);
    renderInterests(profileData.interests);
    renderGallery(profileData.gallery);

    setupHeader();
    setupNavigation();
    setupTheme();
    setupParallax();
    setupProjectFilters(profileData.projects);
    setupProjectDialog();
    setupGallery();
    setupReveal();
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML('beforeend', `<p class="load-error">${error.message}</p>`);
  }
}

init();
