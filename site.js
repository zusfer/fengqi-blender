(function () {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay');
  var menu = document.getElementById('menu');
  function closeMenu() { document.body.classList.remove('menu-open'); }
  if (menu) menu.addEventListener('click', function () {
    document.body.classList.toggle('menu-open');
  });
  if (overlay) overlay.addEventListener('click', closeMenu);
  if (sidebar) sidebar.addEventListener('click', function (e) {
    if (e.target && e.target.tagName === 'A') closeMenu();
  });

  var top = document.getElementById('top');
  if (top) {
    window.addEventListener('scroll', function () {
      top.classList.toggle('show', window.scrollY > 600);
    });
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var input = document.getElementById('q');
  var panel = document.getElementById('results');
  if (!input || !panel || !window.SITE_SEARCH) return;
  var INDEX = window.SITE_SEARCH;
  var LIMIT = 40;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function hitHTML(d, q, sw) {
    var text = d.x, low = text.toLowerCase(), pos = low.indexOf(q);
    var snip;
    if (pos === -1) {
      snip = text.slice(0, 72);
    } else {
      var a = Math.max(0, pos - 34), b = Math.min(text.length, pos + q.length + 46);
      snip = (a > 0 ? '…' : '') + text.slice(a, b) + (b < text.length ? '…' : '');
    }
    var out = esc(snip);
    var k = out.toLowerCase().indexOf(q);
    if (k !== -1) {
      out = out.slice(0, k) + '<mark>' + out.slice(k, k + q.length) + '</mark>' + out.slice(k + q.length);
    }
    var href = d.u + (d.a ? '#' + encodeURIComponent(d.a) : '');
    return '<a class="hit" href="' + href + '">' +
      '<span class="hit-t">' + esc(d.p) + ' · ' + esc(d.s) + '</span>' +
      '<span class="hit-x">' + out + '</span></a>';
  }

  function search(raw) {
    var q = raw.trim().toLowerCase();
    if (!q) { panel.innerHTML = ''; panel.classList.remove('show'); return; }
    var head = [], body = [];
    for (var i = 0; i < INDEX.length; i++) {
      var d = INDEX[i];
      var inTitle = d.s.toLowerCase().indexOf(q) !== -1 || d.p.toLowerCase().indexOf(q) !== -1;
      var inText = d.x.toLowerCase().indexOf(q) !== -1;
      if (!inTitle && !inText) continue;
      (inTitle ? head : body).push(hitHTML(d, q));
      if (head.length + body.length >= LIMIT * 2) break;
    }
    var out = head.concat(body).slice(0, LIMIT);
    panel.innerHTML = out.length ? out.join('')
      : '<div class="none">没有找到与“' + esc(raw.trim()) + '”相关的内容</div>';
    panel.classList.add('show');
  }

  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { search(input.value); }, 110);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.value = ''; search(''); input.blur(); }
    if (e.key === 'Enter') {
      var first = panel.querySelector('a.hit');
      if (first) location.href = first.getAttribute('href');
    }
  });
  document.addEventListener('click', function (e) {
    if (!document.getElementById('searchbox').contains(e.target)) {
      panel.classList.remove('show');
    }
  });

  var m = location.search.match(/[?&]q=([^&]*)/);
  if (m) {
    try { input.value = decodeURIComponent(m[1]); } catch (err) { input.value = m[1]; }
    search(input.value);
  }
})();
