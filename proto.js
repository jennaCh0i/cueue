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
})();
