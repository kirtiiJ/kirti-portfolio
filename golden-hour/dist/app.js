import { profile, navigation, projects, skillGroups, personalFolders } from './profile.js';
import { icon, escapeHtml as e } from './icons.js';
import { views, workView, projectDetail } from './views.js';
import { DesktopWindows } from './desktop.js';
import { LiquidGlass } from './glass.js';
import { ClickSounds } from './sound.js';
import { readPreference, savePreference } from './preferences.js';
import { themes, modes, themeTokens } from './themes.js';
import { readAppearance } from './appearance.js';
import { DockMagnifier } from './dock.js';
import { isSection, initialSection } from './routing.js';
import { showFirstVisitWelcome } from './welcome.js';
import { desktopFolders, personalFolderView, personalDetail, snapshotView } from './personal.js';
import { FolderLayout } from './folder-layout.js';
import { WidgetLayout } from './widget-layout.js';
import { readingView, readingDetail, destinationMap, savePlant, addGrowthPhoto } from './reading.js';
import { Soundtrack } from './soundtrack.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let currentView = null;
let workFilter = 'All';
let searchResults = [];
let searchIndex = 0;
let toastTimer;
let { theme: currentTheme, mode: currentMode, glass, tinted } = readAppearance();
const sounds = new ClickSounds(readPreference('muted', 'false') === 'true');

const windowSizes = {
  about: [1000, 610], experience: [880, 670], work: [1040, 700],
  skills: [860, 620], contact: [680, 490], resume: [900, 700], appearance: [760, 720],
  'reading-list': [960, 700],
  interests: [900, 680],
};
const definitions = Object.fromEntries([
  ...navigation,
  ...personalFolders.map(folder => ({ ...folder, dockId: 'about' })),
  { id: 'resume', label: 'Résumé', icon: 'file', color: 'peach' },
  { id: 'appearance', label: 'Appearance & sound', icon: 'settings', color: 'lavender' },
].map(item => [item.id, { ...item, width: windowSizes[item.id]?.[0] || 820, height: windowSizes[item.id]?.[1] || 570 }]));

function setTheme(theme, persist = true) {
  if (!Object.hasOwn(themes, theme)) return;
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = currentMode;
  for (const [token, value] of Object.entries(themeTokens(theme, currentMode))) document.documentElement.style.setProperty(token, value);
  $$('button[data-theme]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
    const variant = themes[button.dataset.theme][currentMode];
    button.style.setProperty('--preview-start', variant.folds[0]);
    button.style.setProperty('--preview-middle', variant.wallpaper);
    button.style.setProperty('--preview-end', variant.folds[1]);
    button.style.setProperty('--preview-panel', variant.panel);
  });
  $$('button[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === currentMode)));
  $('meta[name="theme-color"]').content = themes[theme][currentMode].wallpaper;
  if (persist) { savePreference('theme', theme); savePreference('mode', currentMode); }
}

function setMode(mode) {
  if (!Object.hasOwn(modes, mode)) return;
  currentMode = mode;
  setTheme(currentTheme);
}

function setGlass(value, persist = true) {
  const numeric = Number(value);
  glass = Number.isFinite(numeric) ? Math.max(35, Math.min(95, numeric)) : 72;
  document.documentElement.style.setProperty('--glass-opacity', glass / 100);
  $$('[data-glass-range]').forEach(input => {
    input.value = glass;
    input.setAttribute('aria-valuetext', `${glass}% frosted`);
  });
  if (persist) savePreference('glass', glass);
}

function setTint(value, persist = true) {
  tinted = value;
  document.documentElement.dataset.tint = tinted ? 'tinted' : 'clear';
  $$('[data-action="tint"]').forEach(button => button.setAttribute('aria-checked', String(tinted)));
  if (persist) savePreference('tint', tinted);
}

function updateSoundControls() {
  $('.sound-button').innerHTML = icon(sounds.muted ? 'muted' : 'volume');
  $('.sound-button').setAttribute('aria-label', sounds.muted ? 'Unmute interface sounds' : 'Mute interface sounds');
  $('.sound-button').setAttribute('aria-pressed', String(sounds.muted));
  $('.sound-button').title = sounds.muted ? 'Interface sounds muted' : 'Interface sounds on';
  $$('.sound-switch').forEach(button => button.setAttribute('aria-checked', String(!sounds.muted)));
  document.body.dataset.sound = sounds.muted ? 'muted' : 'on';
}

function initializeChrome() {
  $('.menu-apple').innerHTML = icon('apple');
  $('.menu-right>[data-action="search"]').innerHTML = icon('search');
  $('.menu-right>[data-action="show-desktop"]').innerHTML = icon('desktop');
  $('.menu-brand').textContent = profile.name;
  $$('.search-icon').forEach(element => element.innerHTML = icon('search'));
  $$('.dialog-close').forEach(element => element.innerHTML = icon('close'));
  $('#menu-go').innerHTML = [...navigation, ...personalFolders].map(item => `<button data-nav="${item.id}">${item.label}</button>`).join('');
  $('#desktop-folders').innerHTML = desktopFolders();
  const finder = '<svg viewBox="0 0 40 40" class="finder-face" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M21 4 17 23h6v13"/><path d="M10 26q10 8 20-1"/><path d="M11 13v3m17-3v3" stroke-width="2"/></svg>';
  const dockClasses = ['finder', 'case', 'grid', 'code', 'mail'];
  $('#dock-apps').innerHTML = navigation.map((item, index) => `<button class="dock-item" data-nav="${item.id}" aria-label="${item.label}" data-tooltip="${item.label}"><span class="dock-icon dock-${dockClasses[index]}">${index === 0 ? finder : icon(item.icon)}</span><span class="dock-active"></span></button>`).join('');
  $('.dock-resume').innerHTML = icon('file');
  $('.dock-settings').innerHTML = icon('settings');
  updateSoundControls();
}

function closeMenus() {
  $$('.menu-dropdown').forEach(menu => { menu.hidden = true; liquidGlass.detach(menu); });
  $$('.menu-trigger').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

function moveLens() {
  const active = $('#dock .dock-item.active');
  $('.dock-lens').style.opacity = active ? '1' : '0';
  if (!active) return;
  const dockRect = $('#dock').getBoundingClientRect();
  const itemRect = active.getBoundingClientRect();
  const padding = parseFloat(getComputedStyle($('#dock')).paddingLeft);
  $('.dock-lens').style.transform = `translateX(${itemRect.left - dockRect.left - padding}px)`;
  $('.dock-lens').style.width = `${itemRect.width}px`;
}

initializeChrome();
new Soundtrack($('#soundtrack'));
const folderLayout = new FolderLayout($('#desktop-folders'), { obstacles: () => [$('#profile-widget').getBoundingClientRect()] });
new WidgetLayout($('#desktop-widgets'), { obstacles: () => $$('.desktop-folder').map(button => button.getBoundingClientRect()) });
new DockMagnifier($('#dock'));
const liquidGlass = new LiquidGlass();
liquidGlass.attach($('#dock'));
liquidGlass.attach($('.profile-widget-caption'), { photo: $('.profile-widget-photo') });
const desktop = new DesktopWindows({
  definitions,
  render: id => id === 'work' ? workView(workFilter) : views[id] ? views[id]() : personalFolderView(id),
  onCreate: () => { setTheme(currentTheme, false); setGlass(glass, false); setTint(tinted, false); updateSoundControls(); },
  onStateChange: () => liquidGlass.schedule(),
  onActiveChange: id => {
    currentView = id;
    const name = profile.fullName || profile.name;
    document.title = isSection(id) && id !== 'about' ? `${definitions[id].label} — ${name} | ${profile.role}` : `${name} — ${profile.role} | React & TypeScript`;
    if (isSection(id) && location.hash !== `#${id}`) history.replaceState({ view: id }, '', `#${id}`);
    requestAnimationFrame(moveLens);
  },
});

async function navigate(id, updateHistory = true, animate = true) {
  if (!definitions[id]) return;
  closeMenus();
  if (updateHistory && isSection(id) && location.hash !== `#${id}`) history.pushState({ view: id }, '', `#${id}`);
  await desktop.open(id, { animate });
}

function showDialog(id) {
  closeMenus();
  $$('dialog[open]').forEach(dialog => dialog.close());
  const dialog = $(`#${id}`);
  dialog.showModal();
  if (id === 'spotlight') {
    $('#spotlight-input').value = '';
    searchIndex = 0;
    search('');
    $('#spotlight-input').focus();
  }
}

const searchEntries = [
  ...personalFolders.map(folder => ({ id: folder.id, title: folder.label, subtitle: folder.sample ? 'Personal folder · Sample content' : folder.description, keywords: folder.entries.map(entry => `${entry.title} ${entry.summary}`).join(' '), icon: 'folder', color: folder.color, kind: 'nav' })),
  ...navigation.map(item => ({ ...item, title: item.label, subtitle: { about: 'Senior Software Engineer · 8+ years', experience: 'Mphasis, Capgemini & Acnovate', work: 'Client projects & contributions', skills: 'React, TypeScript, Redux & more', contact: 'Professional inquiries' }[item.id], keywords: item.id === 'skills' ? skillGroups.flatMap(group => group.skills).join(' ') : '', kind: 'nav' })),
  { id: 'resume', title: 'Résumé', subtitle: 'Experience & qualifications', icon: 'file', color: 'peach', kind: 'nav' },
  ...projects.map(project => ({ id: project.id, title: project.title, subtitle: project.client, keywords: `${project.description} ${project.stack.join(' ')} ${project.contributions.join(' ')}`, icon: project.icon, color: project.color, kind: 'project' })),
  { id: 'appearance', title: 'Appearance & sound', subtitle: 'Themes, glass tint & click sounds', keywords: 'theme dark light color settings glass tint mute audio greeting intro', icon: 'settings', color: 'lavender', kind: 'nav' },
];

function search(query) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  searchResults = searchEntries.filter(item => words.every(word => `${item.title} ${item.subtitle} ${item.keywords || ''}`.toLowerCase().includes(word)));
  searchIndex = Math.min(searchIndex, Math.max(searchResults.length - 1, 0));
  $('#spotlight-results').innerHTML = searchResults.length ? searchResults.map((item, index) => `<button class="search-result ${index === searchIndex ? 'selected' : ''}" data-search-result="${index}"><span class="${item.color}">${icon(item.icon)}</span><div><strong>${e(item.title)}</strong><small>${e(item.subtitle)}</small></div>${icon('arrowUp')}</button>`).join('') : '<p class="no-results">No results. Try “React”, “HP”, or “experience”.</p>';
}

function updateSearchIndex(nextIndex) {
  if (!searchResults.length) return;
  searchIndex = (nextIndex + searchResults.length) % searchResults.length;
  $$('.search-result').forEach((item, index) => item.classList.toggle('selected', index === searchIndex));
  $(`.search-result[data-search-result="${searchIndex}"]`)?.scrollIntoView({ block: 'nearest' });
}

function openSearchResult(index) {
  const result = searchResults[index];
  if (!result) return;
  $('#spotlight').close();
  if (result.kind === 'project') openProject(result.id);
  else run(navigate(result.id));
}

function openProject(id) {
  const content = projectDetail(id);
  if (!content) return;
  $('#project-dialog').innerHTML = content;
  showDialog('project-dialog');
}

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}

function run(task) {
  Promise.resolve(task).catch(error => {
    console.error('Portfolio action failed:', error);
    toast('Unable to complete this action. Please try again.');
  });
}

function downloadResume() {
  const link = document.createElement('a');
  link.href = 'assets/kirti-resume.pdf';
  link.download = `${(profile.fullName || profile.name).replaceAll(' ', '-')}-Resume.pdf`;
  link.click();
}

function windowId(control) {
  return control?.closest('[data-window-id]')?.dataset.windowId || desktop.activeId;
}

function openReadingDetail(key, show = true) {
  const content = readingDetail(key);
  if (!content) return;
  const dialog = $('#personal-dialog');
  dialog.classList.remove('snapshot-dialog');
  dialog.classList.remove('obsession-dialog');
  dialog.classList.add('reading-dialog');
  dialog.dataset.activeReadingDetail = key;
  dialog.innerHTML = content;
  dialog.setAttribute('aria-labelledby', 'reading-detail-title');
  if (show) showDialog('personal-dialog');
}

function refreshJungle() {
  const root = $('#window-reading-list');
  if (root?.dataset.activeReadingCollection === 'jungle') root.querySelector('.window-content').innerHTML = readingView('jungle');
}

async function uploadGrowthPhoto(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    toast('Choose a JPG, PNG, or WebP photo smaller than 10 MB.');
    input.value = '';
    return;
  }
  const plantId = input.dataset.growthPhoto;
  const image = new Image();
  const url = URL.createObjectURL(file);
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const scale = Math.min(1, 600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const saved = addGrowthPhoto(plantId, canvas.toDataURL('image/jpeg', .8));
    if ($('#personal-dialog').open && $('#personal-dialog').dataset.activeReadingDetail === `plant/${plantId}`) {
      openReadingDetail(`plant/${plantId}`, false);
      $('[data-growth-feedback]').textContent = saved ? 'A little growth, saved.' : 'Photo available for this visit. Browser storage is full or unavailable.';
    }
  } catch { toast('This photo could not be opened. Please try another image.'); }
  finally { URL.revokeObjectURL(url); }
}


const actions = {
  home: () => navigate('about'),
  download: downloadResume,
  search: () => showDialog('spotlight'),
  shortcuts: () => showDialog('shortcuts-dialog'),
  'arrange-folders': () => folderLayout.reset(),
  'show-desktop': () => desktop.toggleDesktop(),
  tint: () => setTint(!tinted),
  'replay-welcome': () => {
    closeMenus();
    $$('dialog[open]').forEach(dialog => dialog.close());
    return showFirstVisitWelcome({ replay: true });
  },
  minimize: control => desktop.minimize(windowId(control)),
  close: control => desktop.close(windowId(control)),
  maximize: control => desktop.maximize(windowId(control)),
  skip: () => desktop.activeId ? desktop.focusContent() : navigate('about'),
};

document.addEventListener('click', event => {
  const interactive = event.target.closest('button, a, summary');
  const action = event.target.closest('[data-action]');
  if (action?.dataset.action === 'sound') {
    sounds.muted = !sounds.muted;
    savePreference('muted', sounds.muted);
    updateSoundControls();
    sounds.play();
    return;
  }
  if (interactive) sounds.play();
  const trigger = event.target.closest('[data-menu]');
  if (trigger) {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    closeMenus();
    $(`#menu-${trigger.dataset.menu}`).hidden = isOpen;
    if (!isOpen) liquidGlass.attach($(`#menu-${trigger.dataset.menu}`));
    trigger.setAttribute('aria-expanded', String(!isOpen));
    return;
  }
  if (!event.target.closest('.menu-wrap')) closeMenus();
  const theme = event.target.closest('button[data-theme]');
  if (theme) { setTheme(theme.dataset.theme); return; }
  const mode = event.target.closest('button[data-mode]');
  if (mode) { setMode(mode.dataset.mode); return; }
  const close = event.target.closest('[data-close]');
  if (close) { $(`#${close.dataset.close}`).close(); return; }
  const nav = event.target.closest('[data-nav]');
  if (nav) { run(navigate(nav.dataset.nav)); return; }
  if (action) {
    if (action.dataset.action === 'skip') event.preventDefault();
    closeMenus();
    run(actions[action.dataset.action]?.(action));
    return;
  }
  const project = event.target.closest('[data-project]');
  if (project) { openProject(project.dataset.project); return; }
  const collectionButton = event.target.closest('[data-reading-collection]');
  if (collectionButton) {
    const root = collectionButton.closest('.portfolio-window');
    const id = collectionButton.dataset.readingCollection;
    root.querySelector('.window-content').innerHTML = readingView(id);
    root.querySelector('.content-scroll').scrollTop = 0;
    const focusTarget = id ? root.querySelector('[data-reading-heading]') : root.querySelector(`[data-reading-collection="${root.dataset.activeReadingCollection || ''}"]`);
    root.dataset.activeReadingCollection = id;
    focusTarget?.focus({ preventScroll: true });
    return;
  }
  const readingItem = event.target.closest('[data-reading-detail]');
  if (readingItem && readingItem.tagName === 'BUTTON') { openReadingDetail(readingItem.dataset.readingDetail); return; }
  const mapButton = event.target.closest('[data-dream-map]');
  if (mapButton) {
    const map = mapButton.closest('.dream-map');
    map.querySelector('[data-dream-map-view]').innerHTML = destinationMap(mapButton.dataset.dreamMap);
    map.querySelectorAll('[data-dream-map]').forEach(button => button.setAttribute('aria-pressed', String(button === mapButton)));
    return;
  }
  const waterButton = event.target.closest('[data-water-plant]');
  if (waterButton) {
    const id = waterButton.dataset.waterPlant;
    const saved = savePlant(id, { watered: new Date().toISOString() });
    refreshJungle();
    if ($('#personal-dialog').open && $('#personal-dialog').dataset.activeReadingDetail === `plant/${id}`) {
      openReadingDetail(`plant/${id}`, false);
      $('#personal-dialog [data-water-plant]').focus();
    } else $(`#window-reading-list [data-water-plant="${id}"]`)?.focus({ preventScroll: true });
    toast(saved ? 'Watering logged. A little love goes a long way.' : 'Watering logged for this visit; browser storage is unavailable.');
    return;
  }
  const personalItem = event.target.closest('[data-personal-item]');
  const albumButton = event.target.closest('[data-snapshot-album]');
  if (albumButton) {
    const root = albumButton.closest('.portfolio-window');
    const albumId = albumButton.dataset.snapshotAlbum;
    root.querySelector('.window-content').innerHTML = snapshotView(albumId);
    root.querySelector('.content-scroll').scrollTop = 0;
    const focusTarget = albumId ? root.querySelector('[data-snapshot-heading]') : root.querySelector(`[data-snapshot-album="${root.dataset.activeSnapshotAlbum || ''}"]`);
    root.dataset.activeSnapshotAlbum = albumId;
    focusTarget?.focus({ preventScroll: true });
    return;
  }
  if (personalItem) {
    const content = personalDetail(personalItem.dataset.personalItem);
    if (content) {
      const dialog = $('#personal-dialog');
      dialog.classList.remove('reading-dialog');
      delete dialog.dataset.activeReadingDetail;
      dialog.classList.toggle('snapshot-dialog', personalItem.dataset.personalItem.startsWith('snapshots/'));
      dialog.classList.toggle('obsession-dialog', personalItem.dataset.personalItem.startsWith('interests/'));
      dialog.innerHTML = content;
      if (dialog.querySelector('#snapshot-photo-title')) dialog.setAttribute('aria-labelledby', 'snapshot-photo-title');
      else if (dialog.querySelector('#obsession-detail-title')) dialog.setAttribute('aria-labelledby', 'obsession-detail-title');
      else dialog.removeAttribute('aria-labelledby');
      showDialog('personal-dialog');
    }
    return;
  }
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    const root = filter.closest('.portfolio-window');
    const content = root.querySelector('.content-scroll');
    const scroll = content.scrollTop;
    workFilter = filter.dataset.filter;
    root.querySelector('.window-content').innerHTML = workView(workFilter);
    content.scrollTop = scroll;
    root.querySelector(`.filter-button[data-filter="${workFilter}"]`).focus({ preventScroll: true });
    return;
  }
  const result = event.target.closest('[data-search-result]');
  if (result) openSearchResult(Number(result.dataset.searchResult));
});

document.addEventListener('input', event => {
  if (event.target.matches('[data-glass-range]')) setGlass(event.target.value);
});
document.addEventListener('change', event => {
  const input = event.target;
  if (input.matches('[data-growth-photo]')) { run(uploadGrowthPhoto(input)); return; }
  if (input.matches('[data-plant-interval]')) {
    const days = Number(input.value);
    if (!Number.isInteger(days) || days < 1 || days > 60) { toast('Choose a check-in interval from 1 to 60 days.'); return; }
    const saved = savePlant(input.dataset.plantInterval, { days });
    refreshJungle();
    openReadingDetail(`plant/${input.dataset.plantInterval}`, false);
    $('#personal-dialog [data-plant-interval]').focus();
    if (!saved) toast('Interval changed for this visit; browser storage is unavailable.');
  }
});
$$('dialog').forEach(dialog => {
  if (dialog.id === 'personal-dialog') dialog.addEventListener('close', () => {
    if (!dialog.dataset.activeReadingDetail) return;
    $(`#window-reading-list button[data-reading-detail="${dialog.dataset.activeReadingDetail}"]`)?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
$('#spotlight-input').addEventListener('input', event => { searchIndex = 0; search(event.target.value); });
$('#spotlight').addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    updateSearchIndex(searchIndex + (event.key === 'ArrowDown' ? 1 : -1));
  } else if (event.key === 'Enter' && !event.target.closest('.escape-key')) {
    event.preventDefault();
    sounds.play();
    openSearchResult(searchIndex);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeMenus(); return; }
  if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
  const command = { k: () => showDialog('spotlight'), ',': () => navigate('appearance'), '/': () => showDialog('shortcuts-dialog') }[event.key.toLowerCase()];
  if (command) { event.preventDefault(); sounds.play(); run(command()); }
});
document.addEventListener('keydown', event => {
  const openMenu = $('.menu-trigger[aria-expanded="true"]');
  if (!openMenu || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  const items = [...$(`#menu-${openMenu.dataset.menu}`).querySelectorAll('button')];
  const index = items.indexOf(document.activeElement);
  items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
});
window.addEventListener('popstate', () => run(navigate(initialSection(location.hash), false)));
window.addEventListener('hashchange', () => {
  const id = initialSection(location.hash);
  if (id !== currentView) run(navigate(id, false));
});
window.addEventListener('resize', () => requestAnimationFrame(moveLens));
document.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement && event.target.hasAttribute('data-profile-photo')) {
    event.target.closest('.portrait-frame')?.classList.remove('has-image');
    event.target.remove();
    console.warn('The profile photo could not load; the text profile remains available.');
  }
}, true);

function updateClock() {
  const now = new Date();
  $('#desktop-clock').textContent = new Intl.DateTimeFormat('en-US', innerWidth <= 760 ? { hour: 'numeric', minute: '2-digit' } : { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(now).replaceAll(',', '');
  $('#desktop-clock').dateTime = now.toISOString();
}

setTheme(currentTheme, false);
setGlass(glass, false);
setTint(tinted, false);
const initialId = initialSection(location.hash);
if (initialId !== 'about') document.querySelector('[data-prerendered="about"]')?.remove();
run(navigate(initialId, false, false).then(showFirstVisitWelcome));
updateClock();
setInterval(updateClock, 30_000);
window.addEventListener('resize', updateClock);
