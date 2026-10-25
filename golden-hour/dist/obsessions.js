import { escapeHtml as e, icon } from './icons.js';

export const obsessionCollections = [
  { id: 'anime-fiction', title: 'Anime & Fiction', type: 'A world to get lost in', icon: 'book', summary: 'One Piece, and a soft spot for Zoro.' },
  { id: 'things-i-create', title: 'Things I Create', type: 'Made with a little curiosity', icon: 'spark', summary: 'Painting and creative experiments.' },
  { id: 'play-mode', title: 'Play Mode', type: 'A little friendly competition', icon: 'grid', summary: 'Away from the keyboard, over to foosball.' },
  { id: 'current-fixation', title: 'Current Fixation', type: 'On repeat, lately', icon: 'volume', summary: 'Watching One Piece. Listening to Coldplay.' },
];

function foosballArt() {
  return `<svg class="foosball-art" viewBox="0 0 340 180" aria-hidden="true"><rect x="35" y="15" width="270" height="150" rx="14" fill="#b08c68"/><rect x="46" y="25" width="248" height="130" rx="7" fill="#527569"/><g stroke="#dde7d3" stroke-width="1.5" fill="none" opacity=".65"><rect x="57" y="36" width="226" height="108" rx="2"/><path d="M170 36v108M57 65h30v50H57m226-50h-30v50h30"/><circle cx="170" cy="90" r="25"/></g><g stroke="#bfc7c7" stroke-width="4"><path d="M92 7v166M140 7v166M200 7v166M248 7v166"/></g><g fill="#e4bd9f"><rect x="85" y="48" width="14" height="22" rx="4"/><rect x="85" y="110" width="14" height="22" rx="4"/><rect x="133" y="35" width="14" height="22" rx="4"/><rect x="133" y="79" width="14" height="22" rx="4"/><rect x="133" y="123" width="14" height="22" rx="4"/></g><g fill="#283d55"><rect x="193" y="35" width="14" height="22" rx="4"/><rect x="193" y="79" width="14" height="22" rx="4"/><rect x="193" y="123" width="14" height="22" rx="4"/><rect x="241" y="48" width="14" height="22" rx="4"/><rect x="241" y="110" width="14" height="22" rx="4"/></g><circle cx="180" cy="112" r="5" fill="#fff5e4"/></svg>`;
}

function nightSky() {
  return `<div class="obsession-night-sky" aria-hidden="true"><svg viewBox="0 0 340 180"><g fill="#fff5ce"><circle cx="38" cy="35" r="2"/><circle cx="87" cy="112" r="2"/><circle cx="134" cy="52" r="3"/><circle cx="193" cy="92" r="2"/><circle cx="236" cy="34" r="3"/><circle cx="284" cy="117" r="2"/><circle cx="310" cy="55" r="1.5"/><circle cx="51" cy="144" r="1.5"/><circle cx="162" cy="148" r="1.5"/><circle cx="260" cy="154" r="1.5"/></g><path d="m87 112 47-60 59 40 43-58 48 83" fill="none" stroke="#d8dbf4" stroke-opacity=".35"/><path d="m236 23 2.7 8.3H247l-6.7 5 2.6 8-6.9-4.9-6.9 4.9 2.6-8-6.7-5h8.3Z" fill="#fff5ce"/></svg><span>A Sky Full of Stars</span></div>`;
}

function cover(id) {
  if (id === 'anime-fiction') return '<img src="assets/snapshots/13-thumb.jpg" alt="Kirti’s painting of Luffy from One Piece" loading="lazy">';
  if (id === 'things-i-create') return '<img src="assets/snapshots/12-thumb.jpg" alt="A painted canvas with brushes and paints" loading="lazy">';
  return id === 'play-mode' ? foosballArt() : nightSky();
}

export function obsessionView() {
  return `<div class="page obsession-page"><span class="reading-eyebrow">Off the clock, in my element</span><div class="personal-heading"><div><h1>Little Obsession</h1><p>A few things I keep coming back to.</p></div></div><div class="obsession-grid">${obsessionCollections.map(collection => `<button class="personal-file reading-card obsession-card" data-personal-item="interests/${collection.id}"><div class="obsession-cover obsession-cover-${collection.id}">${cover(collection.id)}</div><small>${e(collection.type)}</small><h2>${e(collection.title)}</h2><p>${e(collection.summary)}</p><span class="reading-card-link">Open collection ${icon('arrow')}</span></button>`).join('')}</div></div>`;
}

export function obsessionDetail(id) {
  const collection = obsessionCollections.find(item => item.id === id);
  if (!collection) return '';
  let content;
  if (id === 'anime-fiction') content = `<img class="obsession-hero" src="assets/snapshots/13.jpg" alt="Kirti’s Luffy painting with paintbrushes"><div class="obsession-note"><span class="reading-eyebrow">Currently watching</span><h3>One Piece</h3><p>A little escape into the world of the Straw Hats.</p></div><div class="favorite-character"><span class="character-monogram" aria-hidden="true">Z</span><div><small>Favorite character</small><h3>Roronoa Zoro</h3><p>The swordsman has my vote.</p></div></div>`;
  else if (id === 'things-i-create') content = `<div class="obsession-note"><h3>Painting</h3><p>Favorite characters, a few brushes, and a little time away from the screen.</p></div><div class="creation-gallery">${[{ number: 11, name: 'Kakashi' }, { number: 12, name: 'Gojo' }, { number: 13, name: 'Luffy' }].map(painting => `<figure><img src="assets/snapshots/${painting.number}-thumb.jpg" alt="Kirti’s painting of ${painting.name}" loading="lazy"><figcaption>${painting.name}</figcaption></figure>`).join('')}</div><div class="creative-note"><span aria-hidden="true">✦</span><div><h3>Creative Experiments</h3><p>A little space to try something new, play with an idea, and see where it goes.</p></div></div>`;
  else if (id === 'play-mode') content = `<div class="foosball-preview">${foosballArt()}</div><div class="obsession-note"><span class="reading-eyebrow">My kind of play break</span><h3>Foosball</h3><p>A change of pace, a little friendly competition, and a reason to step away from the screen.</p><span class="play-mode-tag">Play mode: on</span></div>`;
  else content = `<div class="fixation-item"><img src="assets/snapshots/13-thumb.jpg" alt="A painting of Luffy from One Piece"><div><small>${icon('book')} Currently watching</small><h3>One Piece</h3><p>Anime time, one episode at a time.</p></div></div><div class="fixation-item fixation-song">${nightSky()}<div><small>${icon('volume')} Currently listening</small><h3>A Sky Full of Stars</h3><p>Coldplay</p><span class="play-mode-tag">On repeat</span></div></div>`;
  return `<button class="dialog-close icon-button" data-close="personal-dialog" aria-label="Close collection">${icon('close')}</button><article class="obsession-detail"><span class="reading-eyebrow">Little Obsession / ${e(collection.type)}</span><h2 id="obsession-detail-title">${e(collection.title)}</h2>${content}</article>`;
}
