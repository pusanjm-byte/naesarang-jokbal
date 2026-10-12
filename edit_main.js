(function(){
  var HEAD = '<title>내사랑족발 온천장점</title><link rel="stylesheet" href="__FONTS__">';
  var RESET = ':root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif;background:#faf9f5}img{max-width:100%}[hidden]{display:none!important}';
  var tpl = document.getElementById('tpl'), app = document.getElementById('app');
  var state;
  try { state = JSON.parse(document.getElementById('state').textContent); } catch (e) { state = {}; }
  if (!state || typeof state !== 'object') state = {};
  state.text = state.text || {}; state.links = state.links || {};
  var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var defaults = {}, editing = false, art = null, ui = null;
  var EN = __EN__;
  var lang = 'ko';
  try { lang = localStorage.getItem('nsj-lang') || ''; } catch (e) { lang = ''; }
  if (lang !== 'ko' && lang !== 'en') lang = /^ko/i.test(navigator.language || 'ko') ? 'ko' : 'en';
  function tr(t){ return (lang === 'en' && EN[t]) || t; }
  function applyLang(){
    document.documentElement.lang = lang;
    if (lang === 'en') {
      app.querySelectorAll('[data-k]').forEach(function(el){
        var k = el.getAttribute('data-k');
        if (state.text[k] != null) return;
        if (EN[defaults[k]]) el.textContent = EN[defaults[k]];
      });
      app.querySelectorAll('a.pill, button.pill, .dk').forEach(function(el){
        var d = (el.textContent || '').trim();
        if (EN[d]) el.textContent = EN[d];
      });
      var n = app.querySelector('.say .note'); if (n) n.hidden = true;
    }
    var head = app.querySelector('.site-head');
    if (head) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lang';
      b.textContent = lang === 'en' ? '한국어' : 'English';
      b.setAttribute('aria-label', lang === 'en' ? '한국어로 보기' : 'View in English');
      b.addEventListener('click', function(){
        lang = lang === 'en' ? 'ko' : 'en';
        try { localStorage.setItem('nsj-lang', lang); } catch (e) {}
        var y = window.scrollY; render(); window.scrollTo(0, y);
      });
      head.appendChild(b);
    }
  }

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function okUrl(u){ return /^https?:\/\/[^\s"'<>]+$/i.test(u); }
  function lines(el){
    var out = '';
    (function walk(n){
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) out += c.nodeValue;
        else if (c.nodeType === 1) {
          if (c.tagName === 'BR') out += '\n';
          else { if (/^(DIV|P)$/.test(c.tagName) && out && out.slice(-1) !== '\n') out += '\n'; walk(c); }
        }
      }
    })(el);
    return out.split('\n').map(function(s){ return s.replace(/\s+/g,' ').trim(); }).filter(Boolean).join('\n');
  }
  function getVal(el){
    if (el.hasAttribute('data-ml')) return lines(el);
    return (el.textContent || '').replace(/\s+/g,' ').trim();
  }
  function setVal(el, v){
    if (el.hasAttribute('data-ml')) el.innerHTML = String(v).split('\n').map(esc).join('<br>');
    else el.textContent = v;
  }
  function applyLinks(){
    app.querySelectorAll('[data-href]').forEach(function(a){
      var u = state.links[a.getAttribute('data-href')] || a.getAttribute('data-default') || '';
      if (okUrl(u)) { a.setAttribute('href', u); a.hidden = false; } else { a.removeAttribute('href'); a.hidden = true; }
    });
    var o = app.querySelector('#order');
    if (o) o.hidden = !o.querySelector('a:not([hidden])');
  }

  function render(){
    app.innerHTML = tpl.innerHTML;
    app.querySelectorAll('[data-k]').forEach(function(el){
      var k = el.getAttribute('data-k');
      defaults[k] = getVal(el);
      if (state.text[k] != null) setVal(el, state.text[k]);
    });
    applyLinks();
    applyLang();
    init();
  }

  function init(){
    if ('IntersectionObserver' in window && !rm) {
      document.documentElement.classList.add('js');
      var io = new IntersectionObserver(function(es){
        es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, {rootMargin:'0px 0px -8% 0px'});
      app.querySelectorAll('.fu').forEach(function(el){ io.observe(el); });
    }
    var vids = app.querySelectorAll('.film video, video.auto');
    if (rm) {
      vids.forEach(function(v){ v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
    } else if ('IntersectionObserver' in window) {
      var vo = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function(){}); }
          else e.target.pause();
        });
      }, {threshold: 0.25});
      vids.forEach(function(v){ vo.observe(v); });
    }
    app.querySelectorAll('.film .snd').forEach(function(btn){
      var film = btn.parentNode, bgm = film.querySelector('audio'), lab = btn.querySelector('span'), on = false;
      if (!bgm) return;
      bgm.volume = 0.6;
      function show(){ btn.setAttribute('aria-pressed', on ? 'true' : 'false'); lab.textContent = tr(on ? '음악 끄기' : '음악 켜기'); }
      show();
      btn.addEventListener('click', function(){
        on = !on; show();
        if (on) { var p = bgm.play(); if (p && p.catch) p.catch(function(){ on = false; show(); }); }
        else bgm.pause();
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function(es){
          es.forEach(function(e){
            if (!on) return;
            if (!e.isIntersecting) bgm.pause(); else { var p = bgm.play(); if (p && p.catch) p.catch(function(){}); }
          });
        }, {threshold: 0.05}).observe(film);
      }
    });
    app.querySelectorAll('.ctl button').forEach(function(b){
      b.addEventListener('click', function(){
        var s = document.getElementById(b.dataset.for);
        s.scrollBy({left: Number(b.dataset.go) * Math.min(s.clientWidth * .8, 660), behavior: rm ? 'auto' : 'smooth'});
      });
    });
    var rows = app.querySelectorAll('.row');
    rows.forEach(function(r){ r.addEventListener('click', function(){
      if (editing) return;
      var on = !r.classList.contains('flip');
      rows.forEach(function(o){ o.classList.remove('flip'); });
      if (on) r.classList.add('flip');
    }); });
    var clips = app.querySelectorAll('.clip video');
    clips.forEach(function(v){ v.addEventListener('play', function(){ clips.forEach(function(o){ if (o !== v) o.pause(); }); }); });
    var desk = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    app.querySelectorAll('a[href^="tel:"]').forEach(function(t){
      t.addEventListener('click', function(ev){
        if (!desk || document.documentElement.classList.contains('editing')) return;
        ev.preventDefault();
        if (t.getAttribute('data-busy')) return;
        var keep = t.textContent, num = '051-711-3848';
        t.setAttribute('data-busy', '1');
        try { navigator.clipboard.writeText(num); } catch (e) {}
        t.textContent = num + ' · ' + tr('번호를 복사했습니다');
        setTimeout(function(){ t.textContent = keep; t.removeAttribute('data-busy'); }, 3200);
      });
    });
    var cp = app.querySelector('#copy');
    if (cp) cp.addEventListener('click', function(){
      var b = this, el = app.querySelector('#addr');
      function done(){ b.textContent = tr('복사했습니다'); setTimeout(function(){ b.textContent = tr('주소 복사'); }, 1800); }
      function pick(){ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = tr('주소를 선택했습니다'); }
      try { navigator.clipboard.writeText(el.textContent).then(done, pick); } catch (e) { pick(); }
    });
  }

  /* ---------- 편집 모드 (주인에게만 보임) ---------- */
  var FIELDS = [
    ['baemin', '배달의민족 주문 링크'],
    ['coupang', '쿠팡이츠 주문 링크'],
    ['naver', '네이버 플레이스 (온천장점)'],
    ['main_naver', '네이버 지도 (시청 본점)']
  ];
  function el(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function showFab(){
    if (document.querySelector('.ed-fab')) return;
    var fab = el('button', 'ed-fab', '편집');
    fab.type = 'button';
    fab.addEventListener('click', startEdit);
    document.body.appendChild(fab);
  }

  function startEdit(){
    if (editing) return;
    if (lang !== 'ko') { lang = 'ko'; render(); }
    editing = true;
    document.documentElement.classList.add('editing');
    var fab = document.querySelector('.ed-fab'); if (fab) fab.hidden = true;
    app.querySelectorAll('[data-k]').forEach(function(e){
      e.setAttribute('contenteditable', 'plaintext-only');
      if (e.contentEditable !== 'plaintext-only') e.setAttribute('contenteditable', 'true');
      e.spellcheck = false;
    });
    app.querySelectorAll('details').forEach(function(d){ d.open = true; });

    var bar = el('div', 'ed-bar');
    var TIP = '편집 중입니다. 점선 안의 글자를 눌러 고치세요.';
    var tip = el('span', null, TIP);
    var linkBtn = el('button', null, '링크 넣기'); linkBtn.type = 'button';
    var msg = {set textContent(t){ tip.textContent = t || TIP; }};
    var cancel = el('button', null, '취소'); cancel.type = 'button';
    var save = el('button', 'go', '저장'); save.type = 'button';
    bar.appendChild(tip); bar.appendChild(linkBtn); bar.appendChild(cancel); bar.appendChild(save);

    var panel = el('div', 'ed-panel');
    panel.appendChild(el('h4', null, '링크'));
    panel.appendChild(el('p', null, '주소를 붙여 넣으면 버튼이 생깁니다. 비워 두면 버튼이 숨겨집니다.'));
    var inputs = {};
    FIELDS.forEach(function(f){
      var lab = el('label', null, f[1]);
      var inp = el('input'); inp.type = 'url'; inp.id = 'ed-' + f[0]; inp.placeholder = 'https://';
      var def = app.querySelector('[data-href="' + f[0] + '"]');
      inp.value = state.links[f[0]] || (def && def.getAttribute('data-default')) || '';
      lab.appendChild(inp); panel.appendChild(lab); inputs[f[0]] = inp;
    });
    var close = el('button', 'ed-close', '닫기'); close.type = 'button'; panel.appendChild(close);
    panel.hidden = true;
    linkBtn.addEventListener('click', function(){ panel.hidden = !panel.hidden; });
    close.addEventListener('click', function(){ panel.hidden = true; });

    document.body.appendChild(bar); document.body.appendChild(panel);
    ui = {bar: bar, panel: panel};
    cancel.addEventListener('click', stopEdit);
    save.addEventListener('click', function(){
      var text = {};
      app.querySelectorAll('[data-k]').forEach(function(e){
        var k = e.getAttribute('data-k'), v = getVal(e);
        if (v !== defaults[k]) text[k] = v;
      });
      var links = {}, bad = null;
      FIELDS.forEach(function(f){
        var v = inputs[f[0]].value.trim();
        var def = app.querySelector('[data-href="' + f[0] + '"]');
        var d = (def && def.getAttribute('data-default')) || '';
        if (!v) { if (d) links[f[0]] = ''; return; }
        if (!okUrl(v)) { bad = f[1]; return; }
        if (v !== d) links[f[0]] = v;
      });
      if (bad) { panel.hidden = false; msg.textContent = bad + ': https://로 시작하는 주소를 넣어 주세요.'; return; }
      if (!art) { msg.textContent = '이 화면에서는 저장할 수 없습니다.'; return; }
      save.disabled = cancel.disabled = true; msg.textContent = '저장하는 중입니다.';
      var doc = buildDoc({v: 1, text: text, links: links});
      art.publish(doc).then(function(){
        msg.textContent = '저장했습니다. 곧 새 화면으로 바뀝니다.';
      }, function(e){
        var c = e && e.code;
        save.disabled = cancel.disabled = false;
        if (c === 'conflict') msg.textContent = '다른 곳에서 먼저 수정되어 새 화면으로 바뀝니다. 다시 고쳐 주세요.';
        else if (c === 'not_writer' || c === 'not_granted' || c === 'not_declared' || c === 'capability_disabled' || c === 'consent_required') msg.textContent = '이 화면에서는 저장할 수 없습니다. Claude에서 주인 계정으로 열어 주세요.';
        else if (c === 'too_large') msg.textContent = '내용이 너무 깁니다. 글을 줄여 주세요.';
        else if (c === 'rate_limited') msg.textContent = '저장을 너무 자주 했습니다. 잠시 뒤에 다시 눌러 주세요.';
        else msg.textContent = '저장하지 못했습니다. 잠시 뒤에 다시 눌러 주세요.';
      });
    });
  }

  function stopEdit(){
    editing = false;
    document.documentElement.classList.remove('editing');
    if (ui) { ui.bar.remove(); ui.panel.remove(); ui = null; }
    var fab = document.querySelector('.ed-fab'); if (fab) fab.hidden = false;
    render();
  }

  function buildDoc(st){
    var reset = '', hs = document.head ? document.head.querySelectorAll('style') : [];
    for (var i = 0; i < hs.length; i++) { var t = hs[i].textContent || ''; if (t.indexOf('[hidden]') > -1 && t.indexOf('max-width') > -1) { reset = t; break; } }
    if (!reset) reset = RESET;
    var json = JSON.stringify(st).replace(/</g, '\\u003c');
    return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>' + reset + '</style></head><body>'
      + HEAD
      + '<style id="css">' + document.getElementById('css').textContent + '</style>'
      + '<template id="tpl">' + tpl.innerHTML + '</template><div id="app"></div>'
      + '<script type="application/json" id="state">' + json + '</scr' + 'ipt>'
      + '<script id="main">' + document.getElementById('main').textContent + '</scr' + 'ipt></body></html>';
  }

  app.addEventListener('keydown', function(e){
    if (!editing || e.key !== 'Enter') return;
    var t = e.target.closest && e.target.closest('[data-k]');
    if (t && !t.hasAttribute('data-ml')) e.preventDefault();
  });
  app.addEventListener('click', function(e){
    if (!editing) return;
    if (e.target.closest && e.target.closest('summary, a')) e.preventDefault();
  });

  render();

  if (window.claude && typeof window.claude.use === 'function') {
    Promise.all([window.claude.use('user'), window.claude.use('artifact')]).then(function(r){
      if (!r[0] || !r[1]) return;
      art = r[1];
      return r[0].canEdit().then(function(ok){ if (ok) showFab(); });
    }).catch(function(){});
  }
})();
