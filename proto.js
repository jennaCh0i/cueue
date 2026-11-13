/* Cueue prototype: makes the static screens behave like an app.
   - Buttons that act in place (they link to the page you are on) show a toast instead of reloading.
   - Tabs, segmented controls, picks and toggles switch state.
   - Enter in a sign-in form signs you in. */
(function () {
  var MSG = {
    'Record approval': 'Approval recorded · Fall drop invoice released',
    'Approve round 2': 'Round 2 approved · Mina has been told',
    'Request changes': 'Change request sent',
    'Send reminder': 'Reminder sent to Omar',
    'Record a payment': 'Payment recorded · reminders stopped',
    'Send invite': 'Invite sent to Rosa, Jae and Omar',
    'Copy link': 'Invite link copied',
    'Share with Rosa': 'Roadmap shared with Rosa',
    'Send to Rosa': 'Proposal sent to Rosa',
    'Save as draft': 'Draft saved',
    'Save changes': 'Changes saved',
    'Save goal': 'Goal saved',
    'Save': 'Saved',
    'Accept': 'Added to your month plan',
    'Dismiss': 'Dismissed · we won’t suggest it again',
    'Upload round 3': 'Upload started',
    'Upload version': 'Upload started',
    'Upload': 'Upload started',
    'Sign': 'Contract signed',
    'Join call': 'Joining the call…',
    'Send': 'Reply sent',
    'Pay $11,400': 'Payment sent · receipt emailed',
    'Pay $14,400 deposit': 'Deposit paid · the project starts',
    'Send to finance': 'Secure link sent to finance',
    'I’d like this': 'Mina will send a proposal',
    'Tell me more': 'Mina will follow up'
  };

  // After the toast, some actions move you on to the next screen in the flow
  var NEXT = {
    'Send invite': '/Project',
    'Approve round 2': '/CProject',
    'Pay $14,400 deposit': '/CProject',
    'Pay $11,400': '/CProjects',
    'Record approval': '/Project',
    'Send to Rosa': '/Roadmap',
    'Save goal': '/Plan'
  };

  function toast(text) {
    var t = document.createElement('div');
    t.className = 'proto-toast';
    t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 250); }, 2200);
  }

  function samePage(a) {
    var h = a.getAttribute('href');
    if (!h || h === '#') return true;
    if (h.charAt(0) === '#') return false; // in-page jump: let the browser scroll
    var u = new URL(h, location.href);
    var norm = function (p) { return p.replace(/\.html$/, '').replace(/\/$/, '') || '/'; };
    var here = norm(location.pathname) === '/' ? '/SignIn' : norm(location.pathname);
    return u.origin === location.origin && norm(u.pathname) === here;
  }

  function setOn(el, siblingsSel) {
    var parent = el.parentElement;
    Array.prototype.forEach.call(parent.querySelectorAll(':scope > ' + siblingsSel), function (s) { s.classList.remove('on'); });
    el.classList.add('on');
  }

  document.addEventListener('click', function (e) {
    var tog = e.target.closest('.toggle');
    if (tog) { tog.classList.toggle('on'); return; }

    var segItem = e.target.closest('.seg > a, .seg > span');
    if (segItem) { e.preventDefault(); setOn(segItem, 'a, span'); return; }
    var pickEl = e.target.closest('.pick');
    if (pickEl && pickEl.tagName !== 'A') {
      var multiP = pickEl.parentElement.querySelectorAll(':scope > .pick.on').length > 1;
      if (multiP) { pickEl.classList.toggle('on'); } else { setOn(pickEl, '.pick'); }
      return;
    }

    var a = e.target.closest('a');
    if (!a || !samePage(a)) return;
    e.preventDefault();

    if (a.closest('.seg')) { setOn(a, 'a, span'); return; }
    if (a.classList.contains('tab')) { setOn(a, '.tab'); return; }
    if (a.classList.contains('nav') && a.closest('main')) { setOn(a, '.nav'); return; }
    if (a.classList.contains('pick')) {
      var group = a.parentElement.querySelectorAll(':scope > .pick');
      var multi = a.parentElement.querySelectorAll(':scope > .pick.on').length > 1;
      if (multi) { a.classList.toggle('on'); } else { setOn(a, '.pick'); }
      return;
    }
    var label = (a.textContent || '').trim();
    if (a.classList.contains('btn') || a.closest('.cell, .row')) {
      toast(MSG[label] || ('✓ ' + label));
      if (NEXT[label]) setTimeout(function () { location.href = NEXT[label]; }, 1100);
    }
  });

  document.addEventListener('submit', function (e) {
    var go = e.target.querySelector('a.btn-p');
    if (go) { e.preventDefault(); location.href = go.href; }
  });
  // Project timeline: drag the marker to scrub; it snaps to stage edges and keyframes
  var MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function day(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5; }
  function fmt(d) { var x = new Date(d * 864e5); return MO[x.getUTCMonth()] + ' ' + x.getUTCDate(); }
  document.querySelectorAll('.tl').forEach(function (tl) {
    var lane = tl.querySelector('.tl-lane'), rows = tl.querySelector('.tl-rows');
    var head = tl.querySelector('.tl-head'), flag = tl.querySelector('.tl-flag');
    var past = tl.querySelector('.tl-past'), prog = tl.querySelector('.tl-prog');
    var rDate = tl.querySelector('.tl-date'), rStage = tl.querySelector('.tl-stage');
    var chip = tl.querySelector('.tl-chip'), note = tl.querySelector('.tl-note-t');
    var S = day(tl.dataset.start), E = day(tl.dataset.end), T = day(tl.dataset.today);
    var bars = [].slice.call(tl.querySelectorAll('[data-s]')).map(function (b) {
      return { el: b, a: day(b.dataset.from), b: day(b.dataset.to), name: b.dataset.name, st: b.dataset.state, note: b.dataset.note };
    });
    var keys = [].slice.call(tl.querySelectorAll('[data-k]')).map(function (k) { return { el: k, d: day(k.dataset.k), name: k.dataset.name }; });
    var stops = [T];
    bars.forEach(function (b) { stops.push(b.a, b.b); });
    keys.forEach(function (k) { stops.push(k.d); });
    stops = stops.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (x, y) { return x - y; });
    var CHIP = { done: ['c-done', 'Approved'], now: ['c-you', 'Your move'], next: ['', 'Not started'] };
    var cur = T;
    function pct(d) { return (d - S) / (E - S) * 100; }
    function set(d) {
      d = Math.max(S, Math.min(E, Math.round(d))); cur = d;
      var p = pct(d) + '%';
      head.style.left = p; past.style.width = p; prog.style.width = p;
      flag.textContent = d === T ? 'Today' : fmt(d);
      rDate.textContent = fmt(d);
      var hit = null, prev = null;
      bars.forEach(function (b) { if (d >= b.a && d <= b.b) hit = b; if (b.b < d) prev = b; b.el.classList.toggle('hit', false); });
      keys.forEach(function (k) { k.el.classList.toggle('hit', Math.abs(k.d - d) < 1); });
      var key = keys.filter(function (k) { return k.d === d; })[0];
      if (hit) {
        hit.el.classList.add('hit');
        rStage.textContent = hit.name;
        var c = CHIP[d > T && hit.st === 'now' ? 'next' : hit.st];
        chip.className = 'chip tl-chip ' + c[0]; chip.textContent = d > T && hit.st === 'now' ? 'Ahead' : c[1];
        note.textContent = key ? key.name + ' · ' + fmt(d) + (d > T ? ' · coming up' : '') : hit.note;
      } else {
        rStage.textContent = 'Between stages';
        chip.className = 'chip tl-chip'; chip.textContent = 'Gap';
        note.textContent = prev ? prev.name + ' wrapped ' + fmt(prev.b) + '. Next stage starts soon.' : 'Before the project started. Contract signed Mar 2.';
      }
      head.setAttribute('aria-valuetext', fmt(d) + ', ' + rStage.textContent);
    }
    function nearest(d, range) {
      var best = null;
      stops.forEach(function (s) { if (Math.abs(s - d) <= range && (best === null || Math.abs(s - d) < Math.abs(best - d))) best = s; });
      return best === null ? d : best;
    }
    function fromX(x) { var r = rows.getBoundingClientRect(); return S + (x - r.left) / r.width * (E - S); }
    var dragging = false;
    lane.addEventListener('pointerdown', function (e) {
      dragging = true; tl.classList.add('drag'); lane.setPointerCapture(e.pointerId);
      set(nearest(fromX(e.clientX), 3)); e.preventDefault();
    });
    lane.addEventListener('pointermove', function (e) { if (dragging) set(nearest(fromX(e.clientX), 3)); });
    function end() { if (!dragging) return; dragging = false; tl.classList.remove('drag'); set(nearest(cur, 1e9)); }
    lane.addEventListener('pointerup', end); lane.addEventListener('pointercancel', end);
    function step(dir) {
      var n = dir > 0 ? stops.filter(function (s) { return s > cur; })[0] : stops.filter(function (s) { return s < cur; }).pop();
      if (n !== undefined) set(n);
    }
    tl.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); var g = b.dataset.go; if (g === 'today') set(T); else step(g === 'next' ? 1 : -1); });
    });
    head.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
      if (e.key === 'Home') { set(T); e.preventDefault(); }
    });
    set(T);
  });
})();
