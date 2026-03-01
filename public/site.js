(function () {
  function normalizePrefix(prefix) {
    var p = String(prefix || '').trim();
    if (!p) return '';
    p = p.replace(/^\/+/, '');
    if (p.startsWith('images/')) p = p.slice('images/'.length);
    if (p.startsWith('/images/')) p = p.slice('/images/'.length);
    return p;
  }

  function buildImageUrl(prefix, n) {
    var p = normalizePrefix(prefix);
    return '/images/' + p + String(n) + '.jpg';
  }

  function formatAlt(template, n) {
    var t = String(template || '').trim();
    if (!t) return 'Photo ' + String(n);
    return t.replace(/\{n\}/g, String(n));
  }

  function findRepresentativeImageSrc(galleryEl, prefix) {
    var search = '/images/' + normalizePrefix(prefix);
    var sib = galleryEl.previousElementSibling;

    while (sib) {
      var imgs = sib.querySelectorAll('img');
      for (var i = imgs.length - 1; i >= 0; i--) {
        var src = imgs[i].getAttribute('src') || '';
        if (src.indexOf(search) !== -1) return src;
      }
      sib = sib.previousElementSibling;
    }

    return '';
  }

  function hideRepresentativeImageBlock(galleryEl, prefix) {
    var search = '/images/' + normalizePrefix(prefix);
    var sib = galleryEl.previousElementSibling;

    while (sib) {
      var img = sib.querySelector('img');
      if (img) {
        var src = img.getAttribute('src') || '';
        if (src.indexOf(search) !== -1) {
          var wrapper = img.closest('[aria-hidden="true"]');
          (wrapper || img).style.display = 'none';
          return;
        }
      }
      sib = sib.previousElementSibling;
    }
  }

  function getInitialIndex(prefix, fallbackSrc) {
    var p = normalizePrefix(prefix).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('/images/' + p + '(\\d+)\\.jpg(?:[?#].*)?$', 'i');
    var m = re.exec(String(fallbackSrc || ''));
    var n = m ? Number(m[1]) : 1;
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }

  function enhanceGallery(galleryEl) {
    if (!galleryEl || galleryEl.getAttribute('data-gallery-ready') === '1') return;

    var prefix = galleryEl.getAttribute('data-carousel-prefix') || '';
    var count = Number(galleryEl.getAttribute('data-carousel-count') || '0');
    var altTemplate = galleryEl.getAttribute('data-carousel-alt') || 'Photo {n}';

    if (!prefix || !Number.isFinite(count) || count < 2) return;

    var headRow = galleryEl.firstElementChild;
    var carouselRoot = headRow ? headRow.nextElementSibling : null;
    var paginationRoot = carouselRoot ? carouselRoot.nextElementSibling : null;

    if (!carouselRoot) return;

    var prevBtn = headRow ? headRow.querySelector('[data-carousel="prev"]') : null;
    var nextBtn = headRow ? headRow.querySelector('[data-carousel="next"]') : null;

    // Use any existing nearby image as the initial selection (and hide it to prevent duplicates).
    var representativeSrc = findRepresentativeImageSrc(galleryEl, prefix);
    var initialIndex = getInitialIndex(prefix, representativeSrc);
    if (initialIndex > count) initialIndex = 1;

    hideRepresentativeImageBlock(galleryEl, prefix);

    galleryEl.classList.add('card', 'gallery-card');
    galleryEl.setAttribute('data-gallery-ready', '1');

    if (headRow) headRow.className = 'gallery-head';
    if (prevBtn) prevBtn.className = 'gallery-nav';
    if (nextBtn) nextBtn.className = 'gallery-nav';

    var body = document.createElement('div');
    body.className = 'gallery-body';

    var mainBtn = document.createElement('button');
    mainBtn.type = 'button';
    mainBtn.className = 'gallery-main';
    mainBtn.setAttribute('aria-label', 'Open full size');

    var mainImg = document.createElement('img');
    mainImg.decoding = 'async';
    mainImg.loading = 'eager';
    mainImg.alt = formatAlt(altTemplate, initialIndex);
    mainImg.src = buildImageUrl(prefix, initialIndex);
    mainBtn.appendChild(mainImg);

    var thumbs = document.createElement('div');
    thumbs.className = 'gallery-thumbs';
    thumbs.setAttribute('role', 'list');

    var thumbButtons = [];
    var current = initialIndex;

    function setCurrent(next, opts) {
      if (!Number.isFinite(next)) return;
      var n = next;
      if (n < 1) n = count;
      if (n > count) n = 1;
      current = n;

      mainImg.src = buildImageUrl(prefix, n);
      mainImg.alt = formatAlt(altTemplate, n);

      for (var i = 0; i < thumbButtons.length; i++) {
        thumbButtons[i].setAttribute('aria-pressed', i + 1 === n ? 'true' : 'false');
      }

      if (!opts || !opts.silentScroll) {
        var active = thumbButtons[n - 1];
        if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }

    function openFull() {
      try {
        window.open(mainImg.src, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = mainImg.src;
      }
    }

    mainBtn.addEventListener('click', openFull);

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        setCurrent(current - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        setCurrent(current + 1);
      });
    }

    for (var i = 1; i <= count; i++) {
      (function (n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gallery-thumb';
        b.setAttribute('aria-label', 'Photo ' + String(n));
        b.setAttribute('aria-pressed', n === initialIndex ? 'true' : 'false');

        var img = document.createElement('img');
        img.decoding = 'async';
        img.loading = 'lazy';
        img.alt = formatAlt(altTemplate, n);
        img.src = buildImageUrl(prefix, n);
        b.appendChild(img);

        b.addEventListener('click', function () {
          setCurrent(n);
        });

        b.addEventListener('keydown', function (e) {
          if (!e) return;
          var key = e.key || '';
          if (key === 'ArrowLeft' || key === 'ArrowUp') {
            e.preventDefault();
            setCurrent(current - 1);
            thumbButtons[current - 1].focus();
          }
          if (key === 'ArrowRight' || key === 'ArrowDown') {
            e.preventDefault();
            setCurrent(current + 1);
            thumbButtons[current - 1].focus();
          }
        });

        thumbs.appendChild(b);
        thumbButtons.push(b);
      })(i);
    }

    body.appendChild(mainBtn);
    body.appendChild(thumbs);

    carouselRoot.textContent = '';
    carouselRoot.appendChild(body);

    if (paginationRoot) paginationRoot.style.display = 'none';

    setCurrent(initialIndex, { silentScroll: true });
  }

  function run() {
    var galleries = document.querySelectorAll('[data-carousel-prefix][data-carousel-count]');
    for (var i = 0; i < galleries.length; i++) enhanceGallery(galleries[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
