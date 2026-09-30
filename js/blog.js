/* ==========================================================================
   blog.js — Write & Publish (Form Validation, Local Storage) + Audio playback
   ========================================================================== */
(function () {
  const STORAGE_KEY = 'yummyshare_my_blogs';
  const DEMO_NARRATION = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

  const grid = document.getElementById('blogGrid');
  const countEl = document.getElementById('blogCount');
  const audioPlayer = document.getElementById('blogAudioPlayer');
  let activeListenBtn = null;

  /* ---------- Toggle the write-a-blog form ---------- */
  const toggleBtn = document.getElementById('toggleWriteForm');
  const writeSection = document.getElementById('writeSection');
  toggleBtn.addEventListener('click', () => {
    const showing = writeSection.style.display !== 'none';
    writeSection.style.display = showing ? 'none' : 'block';
    toggleBtn.textContent = showing ? '✍️ Write a Blog' : '✕ Close editor';
    if (!showing) writeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- Prefill author name if the user is logged in ---------- */
  const authorInput = document.getElementById('blogAuthor');
  try {
    const session = JSON.parse(localStorage.getItem('yummyshare_session'));
    if (session && session.name) {
      authorInput.value = session.name;
      authorInput.setAttribute('readonly', 'true');
    }
  } catch (e) { /* not logged in — leave the field editable */ }

  /* ---------- Local Storage read/write ---------- */
  function getMyBlogs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveMyBlogs(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  /* ---------- Render the combined feed (static + user-published) ---------- */
  function render() {
    const mine = getMyBlogs();
    const combined = [
      ...mine.map(b => ({ ...b, mine: true })),
      ...BLOG_POSTS.map(b => ({ ...b, mine: false }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    countEl.textContent = `${combined.length} post${combined.length === 1 ? '' : 's'}`;

    grid.innerHTML = combined.map((p, i) => `
      <article class="blog-card" data-audio="${p.audioSrc ? 'custom' : 'demo'}">
        <div class="strip" style="background:${p.accent};"></div>
        <div class="body">
          <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:flex-start;">
            <span class="tag" style="color:${p.accent};">${p.category}</span>
            ${p.mine ? `<span class="pill-note">Your post</span>` : ''}
          </div>
          <h3>${p.title}</h3>
          <p>${p.excerpt || (p.content ? p.content.slice(0, 140) + (p.content.length > 140 ? '…' : '') : '')}</p>
          <p class="byline">By ${p.author} · ${new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.6rem;">
            <button type="button" class="btn btn-ghost listen-btn" data-audio-src="${p.audioSrc || DEMO_NARRATION}" style="padding-left:0;">🔊 Listen</button>
            ${p.mine ? `<button type="button" class="icon-btn" data-delete-blog="${p.id}" aria-label="Delete post">🗑</button>` : ''}
          </div>
        </div>
      </article>`).join('');

    // Wire up delete buttons for user-published posts
    grid.querySelectorAll('[data-delete-blog]').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = getMyBlogs().filter(b => String(b.id) !== btn.dataset.deleteBlog);
        saveMyBlogs(list);
        render();
        showToast('Post deleted', '🗑');
      });
    });

    // Wire up "Listen" buttons — HTML5 <audio> playback, one post at a time
    grid.querySelectorAll('.listen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.audioSrc;
        const isThisPlaying = activeListenBtn === btn && !audioPlayer.paused;

        if (isThisPlaying) {
          audioPlayer.pause();
          btn.textContent = '🔊 Listen';
          activeListenBtn = null;
          return;
        }
        if (activeListenBtn && activeListenBtn !== btn) {
          activeListenBtn.textContent = '🔊 Listen';
        }
        audioPlayer.src = src;
        audioPlayer.play();
        btn.textContent = '⏸ Playing…';
        activeListenBtn = btn;
      });
    });
  }

  audioPlayer.addEventListener('ended', () => {
    if (activeListenBtn) activeListenBtn.textContent = '🔊 Listen';
    activeListenBtn = null;
  });

  /* ---------- Publish form: validation + FileReader for audio + Local Storage ---------- */
  const form = document.getElementById('blogForm');
  const success = document.getElementById('blogSuccess');
  const fields = [
    [document.getElementById('blogTitle'), 'f-blogTitle'],
    [document.getElementById('blogCategory'), 'f-blogCategory'],
    [authorInput, 'f-blogAuthor'],
    [document.getElementById('blogContent'), 'f-blogContent']
  ];
  fields.forEach(([input, fieldId]) => {
    input.addEventListener('input', () => validate(input, fieldId));
    input.addEventListener('blur', () => validate(input, fieldId));
  });
  function validate(input, fieldId) {
    const field = document.getElementById(fieldId);
    const valid = input.checkValidity();
    field.classList.toggle('has-error', !valid);
    field.classList.toggle('is-valid', valid);
    return valid;
  }

  let audioDataUrl = '';
  document.getElementById('blogAudio').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) { audioDataUrl = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => { audioDataUrl = ev.target.result; showToast('Narration attached', '🎙️'); };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;
    fields.forEach(([input, fieldId]) => { if (!validate(input, fieldId)) allValid = false; });
    if (!allValid) {
      const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      showToast('Please fix the highlighted fields', '⚠️');
      return;
    }

    const list = getMyBlogs();
    list.unshift({
      id: Date.now(),
      title: document.getElementById('blogTitle').value.trim(),
      category: document.getElementById('blogCategory').value,
      author: authorInput.value.trim(),
      accent: document.getElementById('blogAccent').value,
      content: document.getElementById('blogContent').value.trim(),
      excerpt: document.getElementById('blogContent').value.trim().slice(0, 140),
      audioSrc: audioDataUrl,
      date: new Date().toISOString()
    });
    saveMyBlogs(list);

    success.classList.add('is-visible');
    form.reset();
    document.getElementById('blogAccent').value = '#3FAE5C';
    audioDataUrl = '';
    fields.forEach(([, fieldId]) => document.getElementById(fieldId).classList.remove('is-valid', 'has-error'));
    if (authorInput.hasAttribute('readonly')) {
      try {
        const session = JSON.parse(localStorage.getItem('yummyshare_session'));
        if (session && session.name) authorInput.value = session.name;
      } catch (err) { /* ignore */ }
    }
    render();
    setTimeout(() => success.classList.remove('is-visible'), 3000);
  });

  render();
})();
