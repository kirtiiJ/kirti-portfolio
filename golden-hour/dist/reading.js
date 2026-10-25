import { escapeHtml as e, icon } from './icons.js';
import { readPreference, savePreference } from './preferences.js';

export const readingCollections = [
  { id: 'places', title: 'Places I Want to Exist in the World', summary: 'A little collection of someday destinations.', type: 'Travel postcards', icon: 'sun' },
  { id: 'jungle', title: 'My Little Jungle', summary: 'New leaves, small rituals, a little drama.', type: 'Plant shelf', icon: 'spark' },
  { id: 'open-when', title: 'Open When…', summary: 'A small note for whatever kind of day it is.', type: 'Letters', icon: 'mail' },
];

export const destinations = [
  { id: 'japan', title: 'Japan', subtitle: 'Blossoms & quiet mornings', image: 'assets/reading/japan.jpg', alt: 'Mount Fuji framed by pink cherry blossoms', note: 'Someday, a slow morning beneath the cherry blossoms. A train window, a warm bowl of ramen, and a whole afternoon with nowhere to rush.', wishes: ['See Mount Fuji', 'Wander through Kyoto', 'Find a tiny matcha café'], lat: 35.36, lon: 138.73, photographer: 'Nicolas Jehly', credit: 'https://unsplash.com/photos/mt-fuji-is-framed-by-cherry-blossoms-in-the-foreground-DEXxCRUZtDo' },
  { id: 'rome', title: 'Rome', subtitle: 'Little streets, long evenings', image: 'assets/reading/rome.jpg', alt: 'The ancient arches of the Colosseum in Rome', note: 'Getting a little lost in cobbled streets, stopping for an espresso, and watching the city turn golden. A postcard I would love to send myself.', wishes: ['See the Colosseum', 'Take an unplanned walk', 'Gelato at golden hour'], lat: 41.89, lon: 12.49, photographer: 'Mathew Schwartz', credit: 'https://unsplash.com/photos/coliseum-italy-s87bBFZviAU' },
  { id: 'switzerland', title: 'Switzerland', subtitle: 'Somewhere between green & blue', image: 'assets/reading/switzerland.jpg', alt: 'Green mountains and village houses in Lauterbrunnen, Switzerland', note: 'A little wooden house, mountain air, and a view that makes me put my phone away. Slow trains, waterfall walks, and a very full camera roll.', wishes: ['Walk through Lauterbrunnen', 'Take a scenic train', 'Have a quiet mountain picnic'], lat: 46.59, lon: 7.91, photographer: 'Robin Ulrich', credit: 'https://unsplash.com/photos/green-mountains-and-houses-during-daytime-bvSLu1Lew3Y' },
];

export const plants = [
  { id: 'monstera', name: 'Monstera', nickname: 'The main character', days: 7, mood: 'thriving', shape: 'split' },
  { id: 'pothos', name: 'Pothos', nickname: 'Always reaching for the sun', days: 7, mood: 'thirsty', shape: 'trailing' },
  { id: 'peace-lily', name: 'Peace Lily', nickname: 'A flair for the dramatic', days: 5, mood: 'being dramatic', shape: 'lily' },
];

export const letters = [
  { id: 'motivation', title: 'Open when you need motivation', tag: 'A little nudge', symbol: '✦', quote: 'You can start small and still go somewhere wonderful.', message: 'You do not need the whole plan today. Pick one thing you can do in the next ten minutes. Open the document. Sketch the idea. Take the first step. Small beginnings count, too.', signoff: 'One little step at a time.' },
  { id: 'bored', title: 'Open when you are bored', tag: 'A spark of curiosity', symbol: '☀', quote: 'There might be a small adventure hiding in an ordinary afternoon.', message: 'Make your favorite drink. Put on a song you have not heard in ages. Photograph three things in the same color, draw something with your other hand, or take a different route on your next walk. See what catches your eye.', signoff: 'Go find a tiny plot twist.' },
  { id: 'overwhelmed', title: 'Open when life feels overwhelming', tag: 'A softer landing', symbol: '♡', quote: 'You are allowed to take this day one small piece at a time.', message: 'For a moment, let the rest of the list wait. Feel your feet on the floor, take a comfortable breath, and have a sip of water. You do not have to solve everything right now. Rest is allowed, and so is asking someone you trust for company.', signoff: 'Be gentle with yourself today.' },
];

const sessionPlants = new Map();
function plantState(id) {
  if (sessionPlants.has(id)) return sessionPlants.get(id);
  if (typeof localStorage === 'undefined') return {};
  try {
    const saved = JSON.parse(readPreference(`plant-${id}`, '{}'));
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch { return {}; }
}

export function savePlant(id, patch) {
  if (!plants.some(plant => plant.id === id)) return false;
  const state = { ...plantState(id), ...patch };
  const saved = savePreference(`plant-${id}`, JSON.stringify(state));
  sessionPlants.set(id, state);
  return saved;
}

function plantPhotos(id) {
  const photos = plantState(id).photos;
  return Array.isArray(photos) ? photos.filter(photo => typeof photo.src === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo.src)).slice(-6) : [];
}

export function addGrowthPhoto(id, src) {
  return savePlant(id, { photos: [...plantPhotos(id), { src, date: new Date().toISOString() }].slice(-6) });
}

export function wateringState(plant, now = new Date()) {
  const state = plantState(plant.id);
  const interval = Number(state.days || plant.days);
  const days = Number.isInteger(interval) && interval >= 1 && interval <= 60 ? interval : plant.days;
  const last = new Date(state.watered || 'invalid');
  if (!Number.isFinite(last.getTime())) return { days, mood: plant.mood, label: 'No watering logged yet', due: null };
  const due = new Date(last);
  due.setDate(due.getDate() + days);
  const remaining = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  return { days, mood: remaining <= 0 ? 'thirsty' : 'thriving', due, label: remaining <= 0 ? 'Watering check due' : `Next check in ${remaining} ${remaining === 1 ? 'day' : 'days'}` };
}

function plantArt(plant) {
  const leaves = plant.shape === 'trailing' ? '<path d="M92 83q-57-35-54 17t31 35M100 80q58-12 45 34" fill="none" stroke="#547a54" stroke-width="4"/><path d="M40 95q-26-23-28 1 11 23 28-1M47 124q-25-10-19 13 20 14 19-13M143 103q25-22 30 1-9 24-30-1" fill="#6c9664"/>' : plant.shape === 'lily' ? '<path d="M97 95Q47 14 51 75q3 25 46 20M104 93Q145 18 148 76q-7 27-44 17" fill="#5f805c"/><path d="M101 90V36" stroke="#769365" stroke-width="3"/><path d="M101 53Q75 24 103 14q27 17-2 39" fill="#fff8e7"/><path d="M103 44V26" stroke="#d4bb75" stroke-width="4"/>' : '<path d="M100 98V47" stroke="#57784d" stroke-width="4"/><path d="M99 72Q39 13 40 56q-2 43 59 16M101 86q58-54 59-14-4 36-59 14M101 49q-6-44 25-38 25 28-25 38" fill="#648b5d"/><path d="m51 49 29 15m-25 8 24 1m64-7-27 14m11-55-18 18" stroke="#b8c9a0" stroke-width="3"/>';
  return `<svg class="jungle-art" viewBox="0 0 200 175" aria-hidden="true"><ellipse cx="100" cy="156" rx="53" ry="7" fill="#384b2914"/>${leaves}<path d="M69 100h62l-9 51H78Z" fill="${plant.shape === 'trailing' ? '#d8bf94' : plant.shape === 'lily' ? '#a5b5ac' : '#c68e75'}"/><rect x="66" y="96" width="68" height="12" rx="4" fill="${plant.shape === 'trailing' ? '#e5cfaa' : plant.shape === 'lily' ? '#b7c8be' : '#d6a18b'}"/></svg>`;
}

function mapUrl(place) {
  const box = [place.lon - .12, place.lat - .08, place.lon + .12, place.lat + .08].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(box)}&layer=mapnik&marker=${place.lat}%2C${place.lon}`;
}

export function destinationMap(id = 'japan') {
  const place = destinations.find(item => item.id === id) || destinations[0];
  return `<iframe title="Map of ${e(place.title)} dream destination" src="${mapUrl(place)}" loading="lazy" referrerpolicy="no-referrer"></iframe><a href="https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=12/${place.lat}/${place.lon}" target="_blank" rel="noopener noreferrer">Explore ${e(place.title)} on OpenStreetMap ↗</a>`;
}

function collectionCover(id) {
  if (id === 'places') return `<div class="collection-cover places-cover"><img src="${destinations[0].image}" alt="" loading="lazy"><span>Somewhere, someday.</span></div>`;
  if (id === 'jungle') return `<div class="collection-cover jungle-cover">${plantArt(plants[0])}<span>A little room to grow.</span></div>`;
  return '<div class="collection-cover letters-cover"><span class="paper-envelope" aria-hidden="true"><span>for you</span></span><span>A note, just in case.</span></div>';
}

export function readingView(collectionId = '') {
  const collection = readingCollections.find(item => item.id === collectionId);
  let content;
  if (collection?.id === 'places') content = `<div class="reading-grid">${destinations.map(place => `<button class="destination-card reading-card" data-reading-detail="place/${place.id}"><img src="${place.image}" alt="${e(place.alt)}" loading="lazy"><small>Someday / ${e(place.title)}</small><h2>${e(place.title)}</h2><p>${e(place.subtitle)}</p><span class="reading-card-link">Open postcard ${icon('arrow')}</span></button>`).join('')}</div><section class="dream-map"><div class="reading-section-heading"><h2>Three pins for someday</h2><div class="map-choices" role="group" aria-label="Choose a destination on the map">${destinations.map((place, index) => `<button data-dream-map="${place.id}" aria-pressed="${index === 0}">${e(place.title)}</button>`).join('')}</div></div><div data-dream-map-view>${destinationMap()}</div></section>`;
  else if (collection?.id === 'jungle') content = `<p class="reading-note">A starter shelf to make your own. Log a watering to begin your reminders; choose a check-in interval that suits your plant.</p><div class="reading-grid jungle-shelf">${plants.map(plant => {
    const state = wateringState(plant);
    return `<article class="plant-card reading-card"><button class="plant-open" data-reading-detail="plant/${plant.id}" aria-label="Open ${e(plant.name)} plant journal">${plantArt(plant)}<h2>${e(plant.name)}</h2><p>${e(plant.nickname)}</p></button><span class="plant-status">${e(state.mood)}</span><p class="watering-label">${e(state.label)}</p><button class="reading-button" data-water-plant="${plant.id}">Watered today</button><button class="plant-journal-link" data-reading-detail="plant/${plant.id}">Growth journal ↗</button></article>`;
  }).join('')}</div><p class="reading-note">Watering check-ins appear here when you visit. Your logs and growth photos stay in this browser.</p>`;
  else if (collection?.id === 'open-when') content = `<div class="reading-grid envelope-grid">${letters.map(letter => `<button class="letter-envelope" data-reading-detail="letter/${letter.id}"><span class="envelope-fold" aria-hidden="true"></span><span class="envelope-stamp" aria-hidden="true">${letter.symbol}</span><small>${e(letter.tag)}</small><h2>${e(letter.title)}</h2><span class="letter-open-label">Break the seal ${icon('arrow')}</span></button>`).join('')}</div><p class="reading-note">A few words to come back to. Written for this little corner of the internet.</p>`;
  else content = `<div class="reading-grid collection-grid">${readingCollections.map(item => `<button class="reading-card collection-card" data-reading-collection="${item.id}">${collectionCover(item.id)}<small>${e(item.type)}</small><h2>${e(item.title)}</h2><p>${e(item.summary)}</p><span class="reading-card-link">Take a look ${icon('arrow')}</span></button>`).join('')}</div>`;
  return `<div class="page reading-page">${collection ? '<button class="snapshot-back" data-reading-collection="">← Little Things</button>' : '<span class="reading-eyebrow">A corner of my world</span>'}<div class="personal-heading"><div><h1 tabindex="-1" data-reading-heading>${e(collection?.title || 'Little Things')}</h1><p>${e(collection?.summary || 'Places to dream of, things to nurture, and words to keep.')}</p></div></div>${content}</div>`;
}

export function readingDetail(key) {
  const [kind, id] = key.split('/');
  const close = `<button class="dialog-close icon-button" data-close="personal-dialog" aria-label="Close preview">${icon('close')}</button>`;
  if (kind === 'place') {
    const place = destinations.find(item => item.id === id);
    if (!place) return '';
    return `${close}<article class="travel-postcard"><img class="postcard-photo" src="${place.image}" alt="${e(place.alt)}"><div class="postcard-body"><span class="postcard-stamp">SOMEDAY<br>${e(place.title.toUpperCase())}</span><small>A postcard from the wishlist</small><h2 id="reading-detail-title">${e(place.title)}</h2><p class="postcard-message">${e(place.note)}</p><h3>Little things on my list</h3><ul>${place.wishes.map(wish => `<li>${e(wish)}</li>`).join('')}</ul><span class="postcard-signoff">Until someday, Kirti</span><details class="postcard-map"><summary>Find this little dream on the map</summary>${destinationMap(place.id)}</details><a class="photo-credit" href="${place.credit}" target="_blank" rel="noopener noreferrer">Photo: ${e(place.photographer)} / Unsplash ↗</a></div></article>`;
  }
  if (kind === 'plant') {
    const plant = plants.find(item => item.id === id);
    if (!plant) return '';
    const state = wateringState(plant);
    const photos = plantPhotos(id);
    return `${close}<article class="plant-detail"><div class="plant-detail-heading">${plantArt(plant)}<div><small>My Little Jungle / Starter plant</small><h2 id="reading-detail-title">${e(plant.name)}</h2><p>${e(plant.nickname)}</p><span class="plant-status">${e(state.mood)}</span></div></div><section class="plant-care"><h3>A small watering ritual</h3><p>${e(state.label)}${state.due ? ` · ${e(state.due.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }))}` : ''}</p><label>Remind me to check every <input type="number" min="1" max="60" value="${state.days}" data-plant-interval="${id}"> days</label><button class="reading-button" data-water-plant="${id}">Watered today</button></section><section><h3>Growing, little by little</h3><p class="reading-note">Your growth journal starts with your first photo.</p><div class="growth-photos">${photos.map(photo => `<figure><img src="${e(photo.src)}" alt="Growth photo of ${e(plant.name)}" loading="lazy"><figcaption>${e(new Date(photo.date).toLocaleDateString())}</figcaption></figure>`).join('')}</div><label class="reading-button growth-upload">${icon('camera')} Add a growth photo<input type="file" accept="image/jpeg,image/png,image/webp" data-growth-photo="${id}"></label><p class="reading-note">Saved on this device, up to six photos per plant.</p><p class="growth-feedback" role="status" data-growth-feedback></p></section></article>`;
  }
  if (kind === 'letter') {
    const letter = letters.find(item => item.id === id);
    if (!letter) return '';
    return `${close}<article class="open-letter"><span class="letter-symbol" aria-hidden="true">${letter.symbol}</span><small>${e(letter.tag)}</small><h2 id="reading-detail-title">${e(letter.title)}</h2><p class="letter-greeting">Hey, you.</p><blockquote>${e(letter.quote)}</blockquote><p>${e(letter.message)}</p><p class="letter-signoff">${e(letter.signoff)}<br><span>With a little kindness, Kirti</span></p>${id === 'bored' ? '<img class="letter-photo" src="assets/snapshots/17-thumb.jpg" alt="A small bunch of yellow flowers held above a green valley">' : ''}</article>`;
  }
  const collection = readingCollections.find(item => item.id === key);
  return collection ? `${close}<div class="personal-preview"><h2>${e(collection.title)}</h2><p>${e(collection.summary)}</p></div>` : '';
}
