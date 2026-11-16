/* Sunehri Rajwada invitation editor — live preview + shareable #data= link. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SAMPLE = JSON.parse(JSON.stringify(window.JFY_DATA || {}));
  var TEXT = ['groom_name','bride_name','groom_parents','bride_parents','groom_city','bride_city',
    'cover_blessing','hero_title','hero_kicker','story_title','story_lead',
    'venue_name','venue_address','venue_map','close_title','close_body','rsvp_whatsapp'];
  var form = $('#ed'), pvTimer = null, pvN = 0, DRAFT = 'jfy-marwari-draft';
  function split(dt) { var m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(dt || ''); return m ? [m[1], m[2] || ''] : ['', '']; }

  function load(d) {
    TEXT.forEach(function (k) { if (form[k]) form[k].value = d[k] || ''; });
    var dt = split(d.event_date); if (form.event_date) form.event_date.value = dt[0]; if (form.event_time) form.event_time.value = d.event_time || dt[1];
    form.music_enabled.checked = d.music_enabled !== false;
    form.friends_csv.value = (d.friends || []).map(function (f) { return f.name || f; }).join(', ');
    $('#evList').innerHTML = ''; (d.events || []).forEach(addEv); renumber('#evList', 'Event');
    $('#beatList').innerHTML = ''; (d.story_beats || []).forEach(addBeat); renumber('#beatList', 'Beat');
    $('#famList').innerHTML = ''; (d.family || []).forEach(addFam); renumber('#famList', 'Family');
  }
  function addEv(e) {
    e = e || {};
    var node = $('#evTpl').content.firstElementChild.cloneNode(true), dt = split(e.date);
    $('[data-k=name]', node).value = e.name || '';
    $('[data-k=date]', node).value = dt[0]; $('[data-k=time]', node).value = (e.time || dt[1] || '');
    ['kicker','place_kicker','venue','street','dress_code','map_url'].forEach(function (k) { var i=$('[data-k='+k+']', node); if (i) i.value = e[k] || ''; });
    $('.ev__del', node).onclick = function () { node.remove(); renumber('#evList','Event'); schedule(); };
    $('#evList').appendChild(node); return node;
  }
  function addBeat(e) {
    e = e || {};
    var node = $('#beatTpl').content.firstElementChild.cloneNode(true);
    $('[data-k=title]', node).value = e.title || ''; $('[data-k=text]', node).value = e.text || '';
    $('.ev__del', node).onclick = function () { node.remove(); renumber('#beatList','Beat'); schedule(); };
    $('#beatList').appendChild(node); return node;
  }
  function addFam(e) {
    e = e || {};
    var node = $('#famTpl').content.firstElementChild.cloneNode(true);
    $('[data-k=names]', node).value = e.names || ''; $('[data-k=role]', node).value = e.role || ''; $('[data-k=initials]', node).value = e.initials || '';
    $('.ev__del', node).onclick = function () { node.remove(); renumber('#famList','Family'); schedule(); };
    $('#famList').appendChild(node); return node;
  }
  function renumber(sel, label) { $$(sel+' .ev, '+sel+' .beat, '+sel+' .fam').forEach(function (n, i) { var el=$('.ev__no', n); if (el) el.textContent = label + ' ' + (i+1); }); }
  function val(n,k){ var el=$('[data-k='+k+']', n); return el ? (el.value||'').trim() : ''; }

  function collect() {
    var d = {};
    TEXT.forEach(function (k) { if (!form[k]) return; var v = (form[k].value || '').trim(); if (v) d[k] = v; });
    if (d.rsvp_whatsapp) d.rsvp_whatsapp = d.rsvp_whatsapp.replace(/\D/g,'');
    if (form.event_date.value) d.event_date = form.event_date.value + (form.event_time.value ? 'T'+form.event_time.value : '');
    if (!form.music_enabled.checked) d.music_enabled = false;
    d.events = $$('#evList .ev').map(function (n) {
      var e = { name: val(n,'name') }; if (!e.name) return null;
      if (val(n,'date')) e.date = val(n,'date') + (val(n,'time') ? 'T'+val(n,'time') : '');
      ['kicker','place_kicker','venue','street','dress_code','map_url'].forEach(function (k) { if (val(n,k)) e[k] = val(n,k); });
      return e;
    }).filter(Boolean);
    d.story_beats = $$('#beatList .beat, #beatList .ev').map(function (n) {
      var e = { title: val(n,'title'), text: val(n,'text') }; return (e.title || e.text) ? e : null;
    }).filter(Boolean);
    d.family = $$('#famList .fam, #famList .ev').map(function (n) {
      var e = { names: val(n,'names'), role: val(n,'role'), initials: val(n,'initials') }; return (e.names || e.role) ? e : null;
    }).filter(Boolean);
    d.friends = (form.friends_csv.value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean).map(function (name) { return { name: name }; });
    return d;
  }
  function schedule() { clearTimeout(pvTimer); pvTimer = setTimeout(preview, 650); }
  function preview() {
    var d = collect();
    try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch (_) {}
    JFYCodec.encode(d).then(function (s) {
      var f = $('#pv'), y = 0; try { y = Math.round(f.contentWindow.scrollY || 0); } catch (_) {}
      f.src = 'index.html?skip=1&preview=1&music=0&y=' + y + '&r=' + (++pvN) + '#data=' + s;
    });
  }
  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  $('#evAdd').onclick = function () { var n = addEv({}); $('input', n).focus(); renumber('#evList','Event'); schedule(); };
  $('#evPreset').onchange = function () { if (!this.value) return; addEv({ name: this.value, date: form.event_date.value }); this.value=''; renumber('#evList','Event'); schedule(); };
  $('#beatAdd').onclick = function () { addBeat({}); renumber('#beatList','Beat'); schedule(); };
  $('#famAdd').onclick = function () { addFam({}); renumber('#famList','Family'); schedule(); };
  $('#resetBtn').onclick = function () { load(SAMPLE); preview(); };
  $('#clearBtn').onclick = function () { load({ events: [], story_beats: [], family: [], friends: [], music_enabled: true }); preview(); };

  function showErr(t) { var e = $('#err'); e.textContent = t; e.hidden = !t; }
  $('#createBtn').onclick = function () {
    var d = collect(), miss = [];
    [['bride_name',"Bride's first name"],['groom_name',"Groom's first name"],['event_date','Wedding date']].forEach(function (p) { if (!d[p[0]]) miss.push(p[1]); });
    if (miss.length) { showErr('Please fill: ' + miss.join(', ')); document.body.classList.remove('v-preview'); var first=form.querySelector(':invalid'); if (first) { var det=first.closest('details'); if (det) det.open=true; first.focus(); } return; }
    showErr('');
    JFYCodec.encode(d).then(function (s) {
      var u = new URL('index.html', location.href); u.search=''; u.hash='data='+s;
      var link = u.toString(), msg = 'You are invited to the wedding of ' + d.bride_name + ' & ' + d.groom_name + ' ✨\nOpen your invitation: ' + link;
      $('#shareUrl').value = link; $('#openLink').href = link;
      $('#waShare').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
      $('#lenNote').textContent = link.length > 6000 ? 'This link is long (' + Math.round(link.length/1000) + 'k characters).' : '';
      var ns = $('#nativeShare'); ns.hidden = !navigator.share; ns.onclick = function () { navigator.share({ title:'Wedding invitation', text: msg.split('\n')[0], url: link }).catch(function(){}); };
      $('#sheet').hidden = false;
    });
  };
  $('#copyBtn').onclick = function () {
    var i = $('#shareUrl'), b = this; i.select();
    var ok = function () { b.textContent = 'Copied ✓'; setTimeout(function(){ b.textContent='Copy'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(i.value).then(ok, function(){ document.execCommand('copy'); ok(); }); else { document.execCommand('copy'); ok(); }
  };
  $('#sheetX').onclick = function () { $('#sheet').hidden = true; };
  $$('.tab').forEach(function (t) { t.onclick = function () { $$('.tab').forEach(function (x) { x.classList.toggle('on', x===t); }); document.body.classList.toggle('v-preview', t.dataset.view==='preview'); window.scrollTo(0,0); }; });

  var m = /[#&]data=([^&]+)/.exec(location.hash), start = Promise.resolve(null);
  if (m) start = JFYCodec.decode(m[1]).catch(function () { return null; });
  start.then(function (d) {
    if (!d) { try { d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (_) { d = null; } }
    load(d || SAMPLE); preview();
  });
})();
