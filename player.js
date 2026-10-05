/* ============================================================
   PLAYER — renders the portfolio grid from PORTFOLIO data and
   provides the in-page cinematic video modal.
   Videos are loaded ON DEMAND only (lazy). Thumbnails load lazily.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Render portfolio cards ---------- */
  var grid = document.getElementById('portfolioGrid');
  if (grid && window.PORTFOLIO) {
    var frag = document.createDocumentFragment();
    window.PORTFOLIO.forEach(function (p, i) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'work-card reveal';
      card.setAttribute('aria-label', 'Play video: ' + p.title + ' (' + p.category + ')');
      card.dataset.index = i;

      var img = document.createElement('img');
      img.src = p.poster;
      img.alt = p.title + ' — ' + p.category + ' video thumbnail';
      img.width = 720; img.height = 1280;           // prevents layout shift
      img.loading = 'lazy';
      img.decoding = 'async';

      var shade = document.createElement('span');
      shade.className = 'card-shade';
      shade.setAttribute('aria-hidden', 'true');

      var play = document.createElement('span');
      play.className = 'card-play';
      play.setAttribute('aria-hidden', 'true');
      play.innerHTML = '<svg width="15" height="17" viewBox="0 0 14 16" fill="none"><path d="M0 0l14 8-14 8V0z" fill="#fff"/></svg>';

      var meta = document.createElement('span');
      meta.className = 'card-meta';
      meta.innerHTML =
        '<span class="chip"></span>' +
        '<h3></h3>' +
        '<p class="card-desc"></p>';
      meta.querySelector('.chip').textContent = p.category;
      meta.querySelector('h3').textContent = p.title;
      meta.querySelector('.card-desc').textContent = p.description;

      card.appendChild(img);
      card.appendChild(shade);
      card.appendChild(play);
      card.appendChild(meta);
      card.addEventListener('click', function () { openModal(i); });
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  /* ---------- Modal player ---------- */
  var modal = document.getElementById('videoModal');
  if (!modal) return;

  var video = document.getElementById('modalVideo');
  var shell = modal.querySelector('.modal-shell');
  var titleEl = document.getElementById('modalTitle');
  var catEl = document.getElementById('modalCategory');
  var closeBtn = document.getElementById('modalClose');
  var playPause = document.getElementById('playPause');
  var iconPlay = playPause.querySelector('.icon-play');
  var iconPause = playPause.querySelector('.icon-pause');
  var muteBtn = document.getElementById('muteBtn');
  var iconVol = muteBtn.querySelector('.icon-vol');
  var iconMute = muteBtn.querySelector('.icon-mute');
  var volumeRange = document.getElementById('volumeRange');
  var timeLabel = document.getElementById('timeLabel');
  var progress = document.getElementById('progress');
  var progressFilled = document.getElementById('progressFilled');
  var fullscreenBtn = document.getElementById('fullscreenBtn');
  var emptyNote = document.getElementById('playerEmpty');

  var lastFocus = null;
  var isOpen = false;

  function fmt(t) {
    if (!isFinite(t)) return '0:00';
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function openModal(i) {
    var p = window.PORTFOLIO[i];
    if (!p) return;
    lastFocus = document.activeElement;
    titleEl.textContent = p.title;
    catEl.textContent = p.category;

    // On-demand loading: attach the source ONLY when opened.
    video.poster = p.poster;
    video.src = p.video || '';
    emptyNote.hidden = !!p.video;
    video.load();

    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(function () { modal.classList.add('open'); });
    isOpen = true;
    closeBtn.focus();

    if (p.video) {
      var tryPlay = video.play();
      if (tryPlay && tryPlay.catch) { tryPlay.catch(function () { /* autoplay blocked — user presses play */ }); }
    }
  }

  function closeModal() {
    if (!isOpen) return;
    modal.classList.remove('open');
    isOpen = false;
    video.pause();
    video.removeAttribute('src');   // release the network resource
    video.load();
    setTimeout(function () {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 320);
  }

  /* Controls */
  function togglePlay() {
    if (!video.src) return;
    if (video.paused) { video.play(); } else { video.pause(); }
  }
  playPause.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  video.addEventListener('play', function () {
    iconPlay.style.display = 'none'; iconPause.style.display = 'block';
    playPause.setAttribute('aria-label', 'Pause');
  });
  video.addEventListener('pause', function () {
    iconPlay.style.display = 'block'; iconPause.style.display = 'none';
    playPause.setAttribute('aria-label', 'Play');
  });

  video.addEventListener('loadedmetadata', function () {
    timeLabel.textContent = '0:00 / ' + fmt(video.duration);
  });
  video.addEventListener('timeupdate', function () {
    var pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    progressFilled.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', Math.round(pct));
    timeLabel.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration);
  });

  function seek(clientX) {
    if (!video.duration) return;
    var rect = progress.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  }
  progress.addEventListener('click', function (e) { seek(e.clientX); });
  progress.addEventListener('keydown', function (e) {
    if (!video.duration) return;
    if (e.key === 'ArrowRight') { video.currentTime = Math.min(video.duration, video.currentTime + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { video.currentTime = Math.max(0, video.currentTime - 5); e.preventDefault(); }
  });

  volumeRange.addEventListener('input', function () {
    video.volume = parseFloat(volumeRange.value);
    video.muted = video.volume === 0;
    syncVolIcon();
  });
  muteBtn.addEventListener('click', function () {
    video.muted = !video.muted;
    syncVolIcon();
  });
  function syncVolIcon() {
    var muted = video.muted || video.volume === 0;
    iconVol.style.display = muted ? 'none' : 'block';
    iconMute.style.display = muted ? 'block' : 'none';
  }

  fullscreenBtn.addEventListener('click', function () {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else if (shell.requestFullscreen) { shell.requestFullscreen(); }
  });

  closeBtn.addEventListener('click', closeModal);
  modal.querySelector('[data-close]').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === ' ' && e.target === document.body) { e.preventDefault(); togglePlay(); }
  });
})();
