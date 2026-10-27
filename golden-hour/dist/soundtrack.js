import { escapeHtml as e, icon } from './icons.js';
import { readPreference, savePreference } from './preferences.js';

// Spotify track pages verified against the titles and artists in this collection.
export const soundtrackSongs = [
  { id: '0FDzzruyVECATHXKHFs9eJ', title: 'A Sky Full of Stars', artist: 'Coldplay', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e5a95573f1b91234630fd2cf' },
  { id: '5cgKosPPj5Cs9a2JQufUc1', title: 'Ilahi', artist: 'Pritam, Arijit Singh', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02707ea5b8023ac77d31756ed4' },
  { id: '0ct6r3EGTcMLPtrXHDvVjc', title: 'The Nights', artist: 'Avicii', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e020ae4f4d42e4a09f3a29f64ad' },
  { id: '4G8IkKFV8AawvbIp8uR6ts', title: 'Akhiyaan Milavanga', artist: 'Arijit Singh', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e028bf1204417e5b76b84df3c80' },
  { id: '6nek1Nin9q48AVZcWs9e9D', title: 'Paradise', artist: 'Coldplay', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02de0cd11d7b31c3bd1fd5983d' },
  { id: '1kcV2LJxt5v0s2cEGtEJ5i', title: 'Phir Se Ud Chala', artist: 'Mohit Chauhan', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0254e544672baa16145d67612b' },
  { id: '6sy3LkhNFjJWlaeSMNwQ62', title: 'Counting Stars', artist: 'OneRepublic', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e80e7dbce3996a1ae5967751' },
  { id: '4dPeCbg2Op44s9kwyMS3ZT', title: 'Sadka', artist: 'Vishal-Shekhar', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021992dd7b33baf5887ea4a1ec' },
  { id: '7D49Iig0avHre9RFSUMkd2', title: 'I Lived', artist: 'OneRepublic', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e80e7dbce3996a1ae5967751' },
  { id: '4uK0M8AI6gyFmyzUneQpbi', title: 'Rait Zara Si', artist: 'Arijit Singh', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02004f83c1be7d66c4677b32a8' },
  { id: '6OtCIsQZ64Vs1EbzztvAv4', title: 'Good Life', artist: 'OneRepublic', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0277a7bd558d81172446e525bb' },
  { id: '3AJwUDP919kvQ9QcozQPxg', title: 'Yellow', artist: 'Coldplay', artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e029164bafe9aaa168d93f4816a' },
];

export function soundtrackDockButton() {
  return `<button class="dock-item" id="dock-spotify" data-soundtrack-toggle aria-controls="soundtrack-panel" aria-expanded="false" aria-label="Open Spotify soundtrack" data-tooltip="Spotify"><span class="dock-icon dock-spotify">${icon('spotify')}</span><span class="dock-active"></span></button>`;
}

export function soundtrackView() {
  return `<section class="soundtrack-panel" id="soundtrack-panel" aria-labelledby="soundtrack-title" hidden><header class="soundtrack-heading"><div><span>Hindi & English, on repeat</span><h2 id="soundtrack-title">Little Soundtrack</h2></div><button class="icon-button" data-soundtrack-minimize aria-label="Minimize Little Soundtrack">${icon('close')}</button></header><div class="soundtrack-player" data-soundtrack-player></div><div class="soundtrack-song-list" role="group" aria-label="Choose a song">${soundtrackSongs.map(song => `<button class="soundtrack-song" data-soundtrack-song="${song.id}" aria-label="Select ${e(song.title)} by ${e(song.artist)}" aria-pressed="false"><span class="soundtrack-artwork" aria-hidden="true">${icon('music')}<img src="${e(song.artwork)}" alt="" width="40" height="40" loading="lazy" decoding="async"></span><span class="soundtrack-song-copy"><strong>${e(song.title)}</strong><small>${e(song.artist)}</small></span><span class="soundtrack-selection" aria-hidden="true">${icon('music')}</span></button>`).join('')}</div><a class="soundtrack-external" data-soundtrack-link target="_blank" rel="noopener noreferrer">Open selected song in Spotify ↗</a><span class="visually-hidden" role="status" data-soundtrack-status></span></section>`;
}

export class Soundtrack {
  constructor(root, trigger) {
    this.root = root;
    const saved = readPreference('soundtrack-song');
    this.selected = soundtrackSongs.find(song => song.id === saved) || soundtrackSongs[0];
    root.innerHTML = soundtrackView();
    this.panel = root.querySelector('#soundtrack-panel');
    this.trigger = trigger;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.player = root.querySelector('[data-soundtrack-player]');
    root.querySelectorAll('.soundtrack-artwork img').forEach(image => {
      image.addEventListener('error', () => { image.hidden = true; });
    });
    this.updateSelection();
    this.trigger.addEventListener('click', () => this.setExpanded(this.panel.hidden));
    root.addEventListener('click', event => {
      if (event.target.closest('[data-soundtrack-minimize]')) this.setExpanded(false);
      else {
        const button = event.target.closest('[data-soundtrack-song]');
        if (button) this.select(button.dataset.soundtrackSong);
      }
    });
    const onEscape = event => {
      if (event.key !== 'Escape' || this.panel.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      this.setExpanded(false);
    };
    root.addEventListener('keydown', onEscape);
    this.trigger.addEventListener('keydown', onEscape);
  }

  updateSelection() {
    this.root.querySelectorAll('[data-soundtrack-song]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.soundtrackSong === this.selected.id)));
    this.root.querySelector('[data-soundtrack-link]').href = `https://open.spotify.com/track/${this.selected.id}`;
    this.trigger.setAttribute('aria-description', `Little Soundtrack. Selected ${this.selected.title} by ${this.selected.artist}.`);
  }

  loadPlayer() {
    if (this.player.dataset.trackId === this.selected.id) return;
    const iframe = document.createElement('iframe');
    // Keep Spotify's album-colored preview in both portfolio appearances.
    iframe.setAttribute('src', `https://open.spotify.com/embed/track/${this.selected.id}?theme=1`);
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
    this.trigger.setAttribute('aria-label', `${expanded ? 'Minimize' : 'Open'} Spotify soundtrack`);
    if (expanded) {
      this.loadPlayer();
      this.root.querySelector('[data-soundtrack-minimize]').focus({ preventScroll: true });
    } else this.trigger.focus({ preventScroll: true });
  }
}
