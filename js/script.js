(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');
  var toTop = document.getElementById('toTop');
  var hero = document.getElementById('top');

  // Header solid + back-to-top
  function onScroll() {
    header.classList.toggle('solid', window.scrollY > 24);
    toTop.classList.toggle('show', window.scrollY > 700);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  function setMenu(open) {
    header.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  mobileNav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  // Hero glow follows the pointer
  if (window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', e.clientX - r.left + 'px');
      hero.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  }

  // Scroll reveal
  var targets = document.querySelectorAll(
    '.section .eyebrow, .section h2, .section .lead-sm, .about-photos img, .checklist.big, .service, .gallery-label, .tank-grid img, .chip-nav, .step, .faq-list details, .product, .contact-cards li, .form, .building, .footer-grid > *'
  );
  var delays = {};
  targets.forEach(function (el) {
    el.classList.add('reveal');
    var p = el.parentElement;
    delays[p] = (delays[p] || 0);
    el.style.transitionDelay = Math.min(delays[p]++ * 70, 280) + 'ms';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  // Active nav link
  var links = document.querySelectorAll('.nav-desktop a[href^="#"]:not(.btn)');
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if (map.services) map.process = map.services;
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          if (map[en.target.id]) map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  // Inquiry form: opens the visitor's email app (no backend needed)
  var EMAIL = 'sales@wolfsburgmetals.com';
  var form = document.getElementById('inquiryForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = Object.fromEntries(new FormData(form));
    var subject = 'Inquiry: ' + (f.topic || 'General') + ' (' + f.name + ')';
    var body =
      'Name: ' + f.name + '\n' +
      'Company: ' + (f.company || '-') + '\n' +
      'Email: ' + f.email + '\n' +
      'Phone: ' + (f.phone || '-') + '\n' +
      'Interested in: ' + (f.topic || '-') + '\n\n' + f.message;
    window.location.href =
      'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.getElementById('formNote').hidden = false;
  });


  // Product detail popup
  var modal = document.getElementById('productModal');
  var pmMain = document.getElementById('pmMain');
  var pmCaption = document.getElementById('pmCaption');
  var pmThumbs = document.getElementById('pmThumbs');
  var pmTitle = document.getElementById('pmTitle');
  var lastFocus = null;

  function showImage(img, btn) {
    pmMain.src = img.src;
    pmMain.alt = img.alt;
    pmCaption.textContent = img.caption || '';
    Array.prototype.forEach.call(pmThumbs.children, function (b) { b.removeAttribute('aria-current'); });
    if (btn) btn.setAttribute('aria-current', 'true');
  }

  function openProduct(card, index) {
    var imgs = Array.prototype.map.call(card.querySelectorAll('.product-imgs figure'), function (f) {
      var im = f.querySelector('img');
      var cap = f.querySelector('figcaption');
      return { src: im.getAttribute('src'), alt: im.alt, caption: cap ? cap.textContent : '' };
    });
    var eyebrow = card.querySelector('.eyebrow');
    document.getElementById('pmEyebrow').textContent = eyebrow ? eyebrow.textContent : '';
    document.getElementById('pmEyebrow').hidden = !eyebrow;
    pmTitle.textContent = card.querySelector('h3').textContent;
    document.getElementById('pmBlurb').textContent = card.querySelector('.product-text > .muted').textContent;
    document.getElementById('pmItems').innerHTML = card.querySelector('.tags').innerHTML;

    pmThumbs.innerHTML = '';
    imgs.forEach(function (im, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show ' + (im.caption || im.alt));
      var t = document.createElement('img');
      t.src = im.src; t.alt = '';
      b.appendChild(t);
      b.addEventListener('click', function () { showImage(im, b); });
      pmThumbs.appendChild(b);
    });
    pmThumbs.hidden = imgs.length < 2;
    var start = Math.min(index || 0, imgs.length - 1);
    showImage(imgs[start], pmThumbs.children[start]);

    lastFocus = document.activeElement;
    root.classList.add('no-scroll');
    modal.showModal();
    modal.querySelector('.modal-box').scrollTop = 0;
  }

  document.querySelectorAll('.product').forEach(function (card) {
    card.querySelector('.view-btn').addEventListener('click', function () { openProduct(card, 0); });
    card.querySelectorAll('.product-imgs figure').forEach(function (fig, i) {
      fig.addEventListener('click', function () { openProduct(card, i); });
    });
  });

  document.getElementById('pmClose').addEventListener('click', function () { modal.close(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', function () {
    root.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  });

  // "Request a quote" from the popup: pre-fill the form's topic and jump to it
  document.getElementById('pmQuote').addEventListener('click', function () {
    var title = pmTitle.textContent;
    var select = form.elements.topic;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === title) { select.selectedIndex = i; break; }
    }
    lastFocus = null;
    modal.close();
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { form.elements.message.focus({ preventScroll: true }); }, 700);
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
