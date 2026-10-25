import { escapeHtml as e, icon } from './icons.js';
import { readPreference, savePreference } from './preferences.js';

// Spotify track pages verified against the titles and artists in this collection.
export const soundtrackSongs = [
  { id: '0FDzzruyVECATHXKHFs9eJ', title: 'A Sky Full of Stars', artist: 'Coldplay' },
  { id: '0ct6r3EGTcMLPtrXHDvVjc', title: 'The Nights', artist: 'Avicii' },
  { id: '7D49Iig0avHre9RFSUMkd2', title: 'I Lived', artist: 'OneRepublic' },
  { id: '6OtCIsQZ64Vs1EbzztvAv4', title: 'Good Life', artist: 'OneRepublic' },
  { id: '3AJwUDP919kvQ9QcozQPxg', title: 'Yellow', artist: 'Coldplay' },
];

export function soundtrackView() {
  return `<section class="soundtrack-panel" id="soundtrack-panel" aria-labelledby="soundtrack-title" hidden><header class="soundtrack-heading"><div><span>A few favorites, on repeat</span><h2 id="soundtrack-title">Little Soundtrack</h2></div><button class="icon-button" data-soundtrack-minimize aria-label="Minimize Little Soundtrack">${icon('close')}</button></header><div class="soundtrack-player" data-soundtrack-player></div><div class="soundtrack-song-list" role="group" aria-label="Choose a song">${soundtrackSongs.map((song, index) => `<button class="soundtrack-song" data-soundtrack-song="${song.id}" aria-label="Select ${e(song.title)} by ${e(song.artist)}" aria-pressed="false"><span class="soundtrack-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="soundtrack-song-copy"><strong>${e(song.title)}</strong><small>${e(song.artist)}</small></span><span class="soundtrack-selection" aria-hidden="true">${icon('music')}</span></button>`).join('')}</div><a class="soundtrack-external" data-soundtrack-link target="_blank" rel="noopener noreferrer">Open selected song in Spotify ↗</a><span class="visually-hidden" role="status" data-soundtrack-status></span></section><button class="soundtrack-launcher" data-soundtrack-toggle aria-controls="soundtrack-panel" aria-expanded="false" aria-label="Open Little Soundtrack"><span class="soundtrack-disc" aria-hidden="true">${icon('music')}</span><span class="soundtrack-launcher-copy"><strong>Little Soundtrack</strong><small data-soundtrack-caption>Five songs for your visit</small></span><span class="soundtrack-expand" aria-hidden="true">${icon('chevron')}</span></button>`;
}

export class Soundtrack {
  constructor(root) {
    this.root = root;
    const saved = readPreference('soundtrack-song');
    this.selected = soundtrackSongs.find(song => song.id === saved) || soundtrackSongs[0];
    root.innerHTML = soundtrackView();
    this.panel = root.querySelector('#soundtrack-panel');
    this.trigger = root.querySelector('[data-soundtrack-toggle]');
    this.player = root.querySelector('[data-soundtrack-player]');
    this.updateSelection();
    root.addEventListener('click', event => {
      if (event.target.closest('[data-soundtrack-toggle]')) this.setExpanded(this.panel.hidden);
      else if (event.target.closest('[data-soundtrack-minimize]')) this.setExpanded(false);
      else {
        const button = event.target.closest('[data-soundtrack-song]');
        if (button) this.select(button.dataset.soundtrackSong);
      }
    });
    root.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || this.panel.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      this.setExpanded(false);
    });
  }

  updateSelection() {
    this.root.querySelectorAll('[data-soundtrack-song]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.soundtrackSong === this.selected.id)));
    this.root.querySelector('[data-soundtrack-link]').href = `https://open.spotify.com/track/${this.selected.id}`;
    this.root.querySelector('[data-soundtrack-caption]').textContent = `${this.selected.title} · ${this.selected.artist}`;
  }

  loadPlayer() {
    if (this.player.dataset.trackId === this.selected.id) return;
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://open.spotify.com/embed/track/${this.selected.id}?theme=0`);
    iframe.setAttribute('title', `Spotify player: ${this.selected.title} — ${this.selected.artist}`);
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '152');
    iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');
    this.player.replaceChildren(iframe);
    this.player.dataset.trackId = this.selected.id;
  }

  select(id) {
    const song = soundtrackSongs.find(item => item.id === id);
    if (!song || song.id === this.selected.id) return;
    this.selected = song;
    savePreference('soundtrack-song', song.id);
    this.updateSelection();
    this.loadPlayer();
    this.root.querySelector('[data-soundtrack-status]').textContent = `Selected ${song.title} by ${song.artist}. Press Play in the Spotify player to listen.`;
  }

  setExpanded(expanded) {
    this.panel.hidden = !expanded;
    this.trigger.setAttribute('aria-expanded', String(expanded));
    this.trigger.setAttribute('aria-label', `${expanded ? 'Minimize' : 'Open'} Little Soundtrack`);
    if (expanded) {
      this.loadPlayer();
      this.root.querySelector('[data-soundtrack-minimize]').focus({ preventScroll: true });
    } else this.trigger.focus({ preventScroll: true });
  }
}
