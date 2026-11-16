/* Sunehri Rajwada live invitation runtime (Just For You) */
(window.JFY_READY || Promise.resolve()).then(function () {
  'use strict';
  var D = Object.assign({}, window.JFY_DATA || {});
  var Q = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function pd(v) { var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{1,2}):(\d{2}))?/.exec(String(v || '')); if (!m) return null; return { y:+m[1], mo:+m[2]-1, d:+m[3], h: m[4]==null?null:+m[4], mi: m[5]==null?0:+m[5] }; }
  function dow(p) { return new Date(Date.UTC(p.y,p.mo,p.d)).getUTCDay(); }
  var TOK = /\{\{\s*([\w.]+)\s*(?:\|\s*(\w+)\s*)?\}\}/g;
  function interp(str, ctx) { return String(str).replace(TOK, function (_, k) { var v = ctx[k]; return (v == null || typeof v === 'object') ? '' : String(v); }); }
  function empty(ctx, k) { var v = ctx[k]; return v == null || (Array.isArray(v) ? !v.length : String(v).trim() === ''); }
  function bind(root, ctx) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) if (n.nodeValue.indexOf('{{') > -1) list.push(n);
    list.forEach(function (t) { t.nodeValue = interp(t.nodeValue, ctx); });
    Array.prototype.forEach.call(root.querySelectorAll('*'), function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (a) { if (a.value.indexOf('{{') > -1) el.setAttribute(a.name, interp(a.value, ctx)); });
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-optional]'), function (el) {
      var ks = el.getAttribute('data-optional').split(',').map(function (s) { return s.trim(); });
      el.classList.toggle('is-empty', ks.every(function (k) { return empty(ctx, k); }));
    });
  }
  function fit(el) {
    var min = parseFloat(el.getAttribute('data-fit')) || 14;
    el.style.fontSize = ''; var fs = parseFloat(getComputedStyle(el).fontSize);
    var box = (el.parentElement ? el.parentElement.clientWidth : el.clientWidth) - 8, g = 40;
    while (el.scrollWidth > box && fs > min && g--) { fs -= 1; el.style.fontSize = fs + 'px'; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function buildBeats() {
    var box = $('#beats');
    var list = D.story_beats || [];
    if (!list.length) { box.classList.add('is-empty'); return; }
    box.innerHTML = list.map(function (b) {
      return '<li><h4>' + esc(b.title || '') + '</h4><p>' + esc(b.text || '') + '</p></li>';
    }).join('');
  }
  function buildEvents() {
    var evs = (D.events || []).filter(function (e) { return e && e.name; });
    var box = $('#eventList');
    if (!evs.length) { $('#events').classList.add('is-empty'); return; }
    box.innerHTML = evs.map(function (e) {
      var p = pd(e.date);
      var when = p ? (DAYS[dow(p)] + '  ·  ' + p.d + '  ' + MON[p.mo] + '  ' + p.y) : '';
      var map = e.map_url || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((e.venue||'')+' '+(e.street||'')));
      return '<article class="event">' +
        (e.image ? '<img src="' + esc(e.image) + '" alt="' + esc(e.name) + '">' : '') +
        '<div class="event__body"><p class="event__when"><span>' + esc(when) + '</span><span aria-hidden="true">✦</span></p>' +
        '<h3 class="event__name">' + esc(e.name) + '</h3>' +
        (e.kicker ? '<p class="event__kicker">' + esc(e.kicker) + '</p>' : '') +
        (e.time_label ? '<p class="event__time">' + esc(e.time_label) + '</p>' : '') +
        (e.place_kicker ? '<p class="event__place">' + esc(e.place_kicker) + '</p>' : '') +
        (e.venue ? '<p class="event__venue">' + esc(e.venue) + '</p>' : '') +
        (e.street ? '<p class="event__street">' + esc(e.street) + '</p>' : '') +
        (e.dress_code ? '<p class="event__dress">Dress Code — <b>' + esc(e.dress_code) + '</b></p>' : '') +
        '<a class="btn-cal cinzel" href="' + esc(map) + '" target="_blank" rel="noopener">View on Map</a></div></article>';
    }).join('');
  }
  function buildGallery() {
    var g = D.gallery || [];
    var box = $('#galleryGrid');
    if (!g.length) { $('#gallery').classList.add('is-empty'); return; }
    box.innerHTML = g.map(function (im, i) {
      return '<button type="button" data-i="' + i + '"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || '') + '"></button>';
    }).join('');
    var lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true;
    lb.innerHTML = '<button type="button" aria-label="Close">×</button><img alt="">';
    document.body.appendChild(lb);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var im = g[+b.getAttribute('data-i')]; if (!im) return;
      lb.querySelector('img').src = im.src; lb.hidden = false;
    });
    lb.addEventListener('click', function () { lb.hidden = true; });
  }
  function buildFamily() {
    var box = $('#familyGrid');
    var list = D.family || [];
    if (!list.length) { box.classList.add('is-empty'); return; }
    box.innerHTML = list.map(function (f) {
      return '<div class="fam"><div class="fam__mono">' + esc(f.initials || '') + '</div>' +
        '<p class="fam__names">' + esc(f.names || '') + '</p><p class="fam__role">' + esc(f.role || '') + '</p></div>';
    }).join('');
  }
  function buildFriends() {
    var box = $('#friendsList');
    var list = D.friends || [];
    if (!list.length) { box.classList.add('is-empty'); return; }
    box.innerHTML = list.map(function (f) { return '<span>' + esc(f.name || f) + '</span>'; }).join('');
  }

  /* countdown */
  function tick() {
    var p = pd(D.event_date); if (!p) return;
    var t = Date.UTC(p.y, p.mo, p.d, p.h == null ? 19 : p.h, p.mi || 0) - Date.now();
    if (t < 0) t = 0;
    var s = Math.floor(t/1000), d = Math.floor(s/86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60);
    function pad(n){ return String(n).padStart(2,'0'); }
    $('#cDays').textContent = pad(d); $('#cHours').textContent = pad(h);
    $('#cMins').textContent = pad(m); $('#cSecs').textContent = pad(s%60);
  }

  /* calendar */
  function ics() {
    var p = pd(D.event_date); if (!p) return;
    function z(n){ return String(n).padStart(2,'0'); }
    var start = ''+p.y+z(p.mo+1)+z(p.d)+'T'+z(p.h==null?19:p.h)+z(p.mi||0)+'00';
    var title = (D.bride_name||'') + ' & ' + (D.groom_name||'') + ' Wedding';
    var loc = [D.venue_name, D.venue_address].filter(Boolean).join(', ');
    var body = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:'+start+'\nSUMMARY:'+title+'\nLOCATION:'+loc+'\nEND:VEVENT\nEND:VCALENDAR';
    var a = $('#calBtn');
    a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(body);
    a.download = 'wedding.ics';
  }

  /* scratch foil */
  function initScratch() {
    var canvas = $('#scratch-foil'), dateEl = $('#scratch-date'), hint = $('#scratch-hint');
    if (!canvas) return;
    var p = pd(D.event_date);
    if (p) dateEl.innerHTML = p.d + '<sup style="font-size:.55em">th</sup>  ' + MON[p.mo] + '  ' + p.y;
    var ctx = canvas.getContext('2d'), w = 0, h = 0, cleared = false, down = false, last = null, cells = {}, nCells = 0;
    function paint() {
      var dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var g = ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#7a1020'); g.addColorStop(.35,'#e07018'); g.addColorStop(.55,'#f0c230'); g.addColorStop(1,'#8a1a18');
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      for (var i=0;i<w*h*0.03;i++) { ctx.fillStyle = 'rgba(255,255,255,'+(Math.random()*0.18)+')'; ctx.fillRect(Math.random()*w, Math.random()*h, 1.2, 1.2); }
    }
    function brush(x,y) {
      var r = Math.max(w,h) * 0.08;
      var grd = ctx.createRadialGradient(x,y,0,x,y,r);
      grd.addColorStop(0,'rgba(0,0,0,1)'); grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    function at(e) {
      if (cleared) return;
      var r = canvas.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * w, y = (e.clientY - r.top) / r.height * h;
      var from = last || {x:x,y:y}, dist = Math.hypot(x-from.x,y-from.y), steps = Math.max(1, Math.ceil(dist/8));
      for (var i=0;i<=steps;i++) {
        var px = from.x+(x-from.x)*(i/steps), py = from.y+(y-from.y)*(i/steps);
        brush(px,py);
        var cx = Math.floor(px/w*8), cy = Math.floor(py/h*5);
        var k = cx+','+cy; if (!cells[k]) { cells[k]=1; nCells++; }
      }
      last = {x:x,y:y};
      if (nCells > 12) reveal();
    }
    function reveal() {
      if (cleared) return; cleared = true;
      canvas.classList.add('is-cleared'); hint.classList.add('is-done'); dateEl.classList.add('is-in');
    }
    canvas.addEventListener('pointerdown', function (e) { down=true; last=null; canvas.setPointerCapture(e.pointerId); at(e); });
    canvas.addEventListener('pointermove', function (e) { if (down) at(e); });
    ['pointerup','pointercancel','pointerleave'].forEach(function (t) { canvas.addEventListener(t, function(){ down=false; last=null; }); });
    canvas.addEventListener('touchmove', function (e) { if (!cleared) e.preventDefault(); }, {passive:false});
    paint();
    window.addEventListener('resize', function () { if (!cleared && canvas.offsetWidth !== w) paint(); });
  }

  /* music */
  var audio = $('#music'), mBtn = $('#musicBtn'), musicOn = Q.get('music') !== '0' && D.music_enabled !== false;
  if (D.music_url) audio.src = D.music_url;
  function playMusic() {
    if (!musicOn || !audio.src) return;
    audio.volume = 0; var p = audio.play(); if (p && p.catch) p.catch(function(){});
    var s=audio.volume, t0=performance.now();
    (function f(t){ var k=Math.min(1,(t-t0)/1000); audio.volume=s+(0.8-s)*k; if(k<1) requestAnimationFrame(f); })(t0);
    mBtn.classList.add('is-on');
  }
  mBtn.onclick = function () {
    if (audio.paused) { musicOn = true; playMusic(); }
    else { audio.pause(); mBtn.classList.remove('is-on'); }
  };

  /* opening */
  var opened = false;
  function unlock() {
    if (opened) return; opened = true;
    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
    mBtn.hidden = false; $('#orb').hidden = false;
    $('#hero-scroll').classList.add('is-in');
  }
  function begin() {
    $('#cover').classList.add('is-open');
    $('#hero').classList.add('is-playing');
    playMusic();
    setTimeout(function () { $('#hero').classList.add('is-late'); }, 4200);
    setTimeout(unlock, 800);
  }
  $('#openBtn').addEventListener('click', begin);

  /* orb — next section */
  var sections = ['hero','invoke','countdown','story','couple','events','gallery','rsvp','family','venue','close'];
  $('#orb').addEventListener('click', function () {
    var y = window.scrollY + 80, next = sections[sections.length-1];
    for (var i=0;i<sections.length;i++) {
      var el = document.getElementById(sections[i]);
      if (el && el.offsetTop > y) { next = sections[i]; break; }
    }
    document.getElementById(next).scrollIntoView({behavior:'smooth'});
  });

  /* blessings form */
  $('#blessForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target, name = form.name.value.trim();
    if (!name) { $('#bErr').hidden = false; form.name.focus(); return; }
    $('#bErr').hidden = true;
    var rel = form.relation.value.trim() || 'a friend';
    var msg = 'Blessings for ' + (D.bride_name||'') + ' & ' + (D.groom_name||'') + ' from ' + name + ' (' + rel + ').';
    if (form.message.value.trim()) msg += '\n\n“' + form.message.value.trim() + '”';
    try { localStorage.setItem('jfy-marwari-bless', JSON.stringify({name:name,relation:rel,message:form.message.value.trim()})); } catch(_){}
    $('#bThanksMsg').textContent = 'Thank you, ' + name + '. Your blessing has been received with love.';
    var wa = String(D.rsvp_whatsapp||'').replace(/\D/g,'');
    var b = $('#bWa');
    if (wa) { b.href='https://wa.me/'+wa+'?text='+encodeURIComponent(msg); b.hidden=false; } else b.hidden=true;
    form.hidden = true; $('#bThanks').hidden = false;
  });

  function render() {
    document.title = interp(document.title, D);
    bind(document.body, D);
    buildBeats(); buildEvents(); buildGallery(); buildFamily(); buildFriends(); ics();
    $$('[data-fit]').forEach(fit);
  }

  function boot() {
    render(); tick(); setInterval(tick, 1000); initScratch();
    window.addEventListener('resize', function () { $$('[data-fit]').forEach(fit); });
    if (Q.get('music') === '0') { musicOn = false; }
    if (Q.get('skip') === '1') {
      $('#cover').classList.add('is-open','is-instant');
      $('#hero').classList.add('is-playing','is-late','is-instant');
      unlock();
    }
    if (Q.get('preview') === '1') {
      var sy = +Q.get('y') || 0;
      if (sy) setTimeout(function () { window.scrollTo(0, sy); }, 400);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
});
