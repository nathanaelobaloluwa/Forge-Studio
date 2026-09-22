const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const RM   = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;

/* ---------- Scroll reveals ---------- */
const revealIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
}), { threshold: .12 });
$$('.rv').forEach(el => revealIO.observe(el));

/* ---------- Animated counters ---------- */
function animateCount(el) {
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  if (RM) { el.textContent = target.toLocaleString('en-US') + suffix; return; }
  const t0 = performance.now(), dur = 1700;
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * e).toLocaleString('en-US') + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
const countIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); }
}), { threshold: .4 });
$$('[data-count]').forEach(el => countIO.observe(el));

/* ---------- Performance chart ---------- */
const chartIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('drawn'); chartIO.unobserve(e.target); }
}), { threshold: .35 });
chartIO.observe($('#chartCard'));

/* ---------- Nav ---------- */
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
const secIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.sec === e.target.id));
  }
}), { rootMargin: '-40% 0px -55% 0px' });
$$('[data-nav]').forEach(s => secIO.observe(s));

/* ---------- Mobile menu ---------- */
const burger = $('#burger'), mmenu = $('#mobileMenu');
function closeMenu() {
  mmenu.classList.remove('open'); burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
}
burger.addEventListener('click', () => {
  const open = mmenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('#mobileMenu a, #mobileMenu button').forEach(el => el.addEventListener('click', closeMenu));

/* ---------- Sound toggle ---------- */
let actx = null, masterGain = null;
function initAudio() {
  actx = new (window.AudioContext || window.webkitAudioContext)();
  const len = actx.sampleRate * 3, buf = actx.createBuffer(1, len, actx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.2; }
  const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240;
  masterGain = actx.createGain(); masterGain.gain.value = 0;
  src.connect(lp).connect(masterGain).connect(actx.destination); src.start();
}
$('#soundToggle').addEventListener('click', function () {
  if (!actx) initAudio();
  if (actx.state === 'suspended') actx.resume();
  const on = this.getAttribute('aria-pressed') === 'true' ? false : true;
  this.setAttribute('aria-pressed', on);
  masterGain.gain.setTargetAtTime(on ? .07 : 0, actx.currentTime, .4);
  $('#soundLabel').textContent = on ? 'Sound on / tap to mute' : 'Sound off / tap to experience';
});

/* ---------- Coach parallax ---------- */
const hero = $('#hero');
if (FINE && !RM) hero.addEventListener('mousemove', e => {
  const mx = e.clientX / innerWidth - .5, my = e.clientY / innerHeight - .5;
  $$('.hcoach').forEach(c => {
    const d = +c.dataset.depth;
    c.style.setProperty('--px', (mx * d).toFixed(1) + 'px');
    c.style.setProperty('--py', (my * d).toFixed(1) + 'px');
  });
});

/* ---------- Background number parallax ---------- */
if (!RM) {
  const paras = $$('[data-para]');
  const onScroll = () => requestAnimationFrame(() => paras.forEach(el => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translateY(${((r.top + r.height / 2 - innerHeight / 2) * -el.dataset.para).toFixed(1)}px)`;
  }));
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

/* ---------- Custom cursor ---------- */
if (FINE && !RM) {
  document.body.classList.add('has-cursor');
  const dot = $('.cursor'), label = $('.cursor-label');
  let mx = -100, my = -100, cx = mx, cy = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.classList.add('show'); });
  (function loop() {
    cx += (mx - cx) * .18; cy += (my - cy) * .18;
    dot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    label.style.transform = `translate(${cx + 18}px,${cy + 18}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cursor]');
    if (t) { label.textContent = t.dataset.cursor; label.classList.add('on'); dot.classList.add('big'); }
    else if (e.target.closest('a,button')) { dot.classList.add('on'); }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-cursor]')) { label.classList.remove('on'); dot.classList.remove('big'); }
    if (e.target.closest('a,button')) dot.classList.remove('on');
  });
}

/* ---------- Magnetic buttons ---------- */
if (FINE && !RM) $$('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .24}px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

/* ---------- Coach flip on touch ---------- */
if (!FINE) $$('.flip').forEach(f => f.addEventListener('click', () => f.classList.toggle('flipped')));

/* ---------- Stories carousel ---------- */
(() => {
  const vp = $('#carViewport'), track = $('#carTrack'), slides = $$('.story-card', track);
  const n = slides.length; let idx = 0, x = 0, minX = 0;
  const stepW = () => slides[0].offsetWidth + 24;
  const setMin = () => minX = -(n - 1) * stepW();
  const setX = (v, anim = true) => {
    x = v; track.classList.toggle('no-anim', !anim);
    track.style.transform = `translate3d(${x}px,0,0)`;
    if (!anim) requestAnimationFrame(() => track.classList.remove('no-anim'));
  };
  const go = i => {
    setMin(); idx = ((i % n) + n) % n; setX(Math.max(minX, -idx * stepW()));
    $('#carNow').textContent = String(idx + 1).padStart(2, '0');
    $('#carFill').style.transform = `scaleX(${(idx + 1) / n})`;
  };
  $('#carTotal').textContent = String(n).padStart(2, '0');
  $('#carFill').style.transform = `scaleX(${1 / n})`;
  $('#carPrev').addEventListener('click', () => go(idx - 1));
  $('#carNext').addEventListener('click', () => go(idx + 1));
  addEventListener('resize', () => go(idx));

  let sx = 0, base = 0, moved = false, dragging = false;
  vp.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button')) return;
    dragging = true; moved = false; sx = e.clientX; base = x;
    vp.classList.add('dragging'); vp.setPointerCapture(e.pointerId);
    stopAuto();
  });
  vp.addEventListener('pointermove', e => {
    if (!dragging) return;
    let raw = base + (e.clientX - sx);
    if (Math.abs(e.clientX - sx) > 6) moved = true;
    if (raw > 0) raw *= .3;
    else if (raw < minX) raw = minX + (raw - minX) * .3;
    setX(raw, false);
  });
  const endDrag = e => {
    if (!dragging) return; dragging = false; vp.classList.remove('dragging');
    let i = Math.round(-x / stepW());
    if (moved && e.clientX < sx - 55) i = idx + 1;
    if (moved && e.clientX > sx + 55) i = idx - 1;
    go(i); startAuto();
  };
  vp.addEventListener('pointerup', endDrag);
  vp.addEventListener('pointercancel', endDrag);
  vp.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  let timer = null;
  const startAuto = () => { if (!RM) { stopAuto(); timer = setInterval(() => go(idx + 1), 5000); } };
  const stopAuto = () => clearInterval(timer);
  vp.addEventListener('mouseenter', stopAuto);
  vp.addEventListener('mouseleave', startAuto);
  document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());
  startAuto();
})();

/* ---------- Schedule ---------- */
const SCHED = {
  MON: [['06:30','Strength Foundations','Marcus Reed','Intermediate','Build',8],['07:45','Conditioning Circuit','Darius Cole','Advanced','Lean',5],['12:15','Mobility & Core','Sofia Lindqvist','All Levels','Perform',12],['17:30','Hypertrophy Upper','James Okada','Intermediate','Build',6],['18:45','Metcon','Priya Anand','Advanced','Lean',4],['20:00','Olympic Lifting Club','Elena Voss','Advanced','Build',3]],
  TUE: [['06:30','Metcon','Priya Anand','Advanced','Lean',6],['09:00','Movement Lab','Sofia Lindqvist','Beginner','Perform',10],['12:15','Hypertrophy Lower','James Okada','Intermediate','Build',7],['17:30','Strength Foundations','Marcus Reed','Beginner','Build',9],['19:00','Boxing Conditioning','Darius Cole','Intermediate','Lean',5]],
  WED: [['06:30','Endurance Engine','Priya Anand','Intermediate','Perform',8],['07:45','Hypertrophy Upper','James Okada','Intermediate','Build',6],['12:15','Mobility & Core','Sofia Lindqvist','All Levels','Perform',14],['17:30','Olympic Lifting Club','Elena Voss','Advanced','Build',4],['18:45','Conditioning Circuit','Darius Cole','Advanced','Lean',6],['20:00','Strength Foundations','Marcus Reed','Intermediate','Build',7]],
  THU: [['06:30','Strength Foundations','Marcus Reed','Intermediate','Build',8],['09:00','Movement Lab','Sofia Lindqvist','Beginner','Perform',11],['12:15','Metcon','Priya Anand','Advanced','Lean',5],['17:30','Boxing Conditioning','Darius Cole','Intermediate','Lean',6],['19:00','Hypertrophy Lower','James Okada','Intermediate','Build',8]],
  FRI: [['06:30','Olympic Lifting Club','Elena Voss','Advanced','Build',3],['07:45','Endurance Engine','Priya Anand','Intermediate','Perform',9],['12:15','Hypertrophy Upper','James Okada','Intermediate','Build',6],['17:30','Conditioning Circuit','Darius Cole','Advanced','Lean',5],['18:45','Team WOD','Marcus Reed','All Levels','Lean',16]],
  SAT: [['08:00','Community Strength Session','Marcus Reed','All Levels','Build',20],['09:30','Boxing Conditioning','Darius Cole','Intermediate','Lean',8],['11:00','Movement Lab','Sofia Lindqvist','Beginner','Perform',12],['12:30','Olympic Lifting Club','Elena Voss','Advanced','Build',4]]
};

const CLASSES = [
  ['Strength Foundations','Build','Coach-led strength fundamentals'],
  ['Hypertrophy Upper','Build','Volume blocks for muscle'],
  ['Olympic Lifting Club','Build','Barbell technique & power'],
  ['Conditioning Circuit','Lean','High-output engine work'],
  ['Metcon','Lean','Short, sharp, honest'],
  ['Boxing Conditioning','Lean','Pads, footwork, sweat'],
  ['Mobility & Core','Perform','Move better, hold longer'],
  ['Endurance Engine','Perform','Aerobic base building'],
  ['Movement Lab','Perform','Quality over load']
];

let schedDay = 'MON';
const timeBucket = t => { const h = +t.split(':')[0]; return h < 12 ? 'morning' : h < 16 ? 'midday' : 'evening'; };

function renderSchedule() {
  const f = { goal: $('#fGoal').value, diff: $('#fDiff').value, coach: $('#fCoach').value, time: $('#fTime').value };
  const rows = SCHED[schedDay].filter(r =>
    (f.goal === 'all' || r[4] === f.goal) &&
    (f.diff === 'all' || r[3] === f.diff) &&
    (f.coach === 'all' || r[2] === f.coach) &&
    (f.time === 'all' || timeBucket(r[0]) === f.time));
  const list = $('#schedList');
  list.innerHTML = rows.length ? rows.map(r => `
    <div class="srow" role="button" tabindex="0" data-cls="${r[1]}">
      <span class="s-time">${r[0]}</span>
      <div class="s-main"><strong>${r[1].toUpperCase()}</strong><span>Coach ${r[2].split(' ')[0]}</span></div>
      <span class="s-diff ${r[3] === 'Advanced' ? 'adv' : ''}">${r[3]}</span>
      <span class="s-spots"><b>${r[5]}</b> spots</span>
      <span class="s-spots" style="opacity:.5">${r[4].toUpperCase()}</span>
    </div>`).join('')
    : `<p class="sched-empty">No classes match your filters — try adjusting.</p>`;
  $$('.srow', list).forEach(row => {
    const open = () => { Booking.state.cls = row.dataset.cls; Booking.open(3); };
    row.addEventListener('click', open);
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}

$$('#schedTabs .sched-tab').forEach(tab => tab.addEventListener('click', () => {
  $$('#schedTabs .sched-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
  schedDay = tab.dataset.day; renderSchedule();
}));
['#fGoal','#fDiff','#fCoach','#fTime'].forEach(s => $(s).addEventListener('change', renderSchedule));
renderSchedule();

/* ---------- FAQ ---------- */
$$('.faq-item').forEach(item => {
  $('.faq-q', item).addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    $$('.faq-item').forEach(i => { i.classList.remove('open'); $('.faq-q', i).setAttribute('aria-expanded', 'false'); });
    if (!wasOpen) { item.classList.add('open'); $('.faq-q', item).setAttribute('aria-expanded', 'true'); }
  });
});

/* ---------- Sticky CTA ---------- */
const sticky = $('#stickyCta');
addEventListener('scroll', () => {
  const pastTrial = $('#trial').getBoundingClientRect().top < innerHeight;
  sticky.classList.toggle('show', scrollY > innerHeight * .85 && !pastTrial);
}, { passive: true });

/* ---------- Booking modal ---------- */
const Booking = {
  state: { goal: null, time: null, cls: null, name: '', email: '', phone: '' },
  step: 0,
  modal: $('#booking'), track: $('#bkTrack'), hint: $('#bkHint'),
  open(startStep = 0) {
    this.step = startStep; this.renderClasses(); this.show(); this.update();
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('.modal-close').focus(), 100);
  },
  close() { this.modal.classList.remove('open'); document.body.style.overflow = ''; },
  show() { this.modal.classList.add('open'); },
  update() {
    const s = this.step;
    this.track.style.transform = `translateX(-${s * 100}%)`;
    $('#bkTitle').textContent = s < 4 ? `Book Your Trial — 0${s + 1}/05` : 'Confirm Your Trial';
    $$('#bkSteps li:not(.sep)').forEach((li, i) => {
      li.className = i < s ? 'done' : i === s ? 'cur' : '';
    });
    $('#bkBack').style.visibility = s === 0 ? 'hidden' : 'visible';
    $('#bkNext').innerHTML = s === 4
      ? 'Confirm Booking <span class="arr"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>'
      : 'Continue <span class="arr"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
    this.hint.classList.remove('show');
    if (s === 4) {
      $('#bkSummary').innerHTML = `
        <div><span>Goal</span><b>${this.state.goal || '—'}</b></div>
        <div><span>Preferred time</span><b>${this.state.time || '—'}</b></div>
        <div><span>Class</span><b>${this.state.cls || '—'}</b></div>
        <div><span>Name</span><b>${this.state.name || '—'}</b></div>
        <div><span>Email</span><b>${this.state.email || '—'}</b></div>`;
    }
  },
  renderClasses() {
    const pool = CLASSES.filter(c => !this.state.goal || c[1] === this.state.goal);
    $('#bkClasses').innerHTML = (pool.length ? pool : CLASSES).map(c => `
      <button class="opt ${this.state.cls === c[0] ? 'sel' : ''}" data-val="${c[0]}">
        <span class="opt-check" aria-hidden="true"></span>
        <span><strong>${c[0].toUpperCase()}</strong><span>${c[2]}</span></span>
      </button>`).join('');
  },
  next() {
    const s = this.step, st = this.state;
    const fail = () => { this.hint.classList.add('show'); return true; };
    if (s === 0 && !st.goal) return fail();
    if (s === 1 && !st.time) return fail();
    if (s === 2 && !st.cls) return fail();
    if (s === 3) {
      st.name = $('#bkName').value.trim();
      st.email = $('#bkEmail').value.trim();
      if (st.name.length < 2) return fail();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(st.email)) {
        this.hint.textContent = 'Enter a valid name and email'; return fail();
      }
      this.hint.textContent = 'Select an option to continue';
    }
    if (s === 4) return this.confirm();
    this.step++; this.update();
  },
  back() { if (this.step > 0) { this.step--; this.update(); } },
  confirm() {
    $('.bk-viewport').innerHTML = `
      <div class="bk-success">
        <div class="big-check"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></div>
        <h3>You're in<span style="color:var(--orange)">.</span></h3>
        <p style="color:var(--gray);font-size:.9rem;max-width:38ch;margin:0 auto 1.8rem">
          We'll confirm your trial by email within a few hours.
          Bring training shoes, a towel, and water — we'll handle the rest.</p>
        <button class="btn btn-primary" data-close>Done</button>
      </div>`;
    $('#bkBack').style.visibility = 'hidden';
    $('#bkNext').style.display = 'none';
    $$('#bkSteps li').forEach(li => li.className = 'done');
    $('#bkTitle').textContent = 'Booking Confirmed';
  }
};

document.addEventListener('click', e => {
  const opt = e.target.closest('.opt');
  if (!opt) return;
  const field = opt.closest('[data-field]').dataset.field;
  Booking.state[field] = opt.dataset.val;
  $$('.opt', opt.closest('.opt-grid')).forEach(o => o.classList.remove('sel'));
  opt.classList.add('sel');
  Booking.hint.classList.remove('show');
});
$('#bkNext').addEventListener('click', () => Booking.next());
$('#bkBack').addEventListener('click', () => Booking.back());
$('#booking').addEventListener('click', e => { if (e.target.closest('[data-close]')) Booking.close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#booking').classList.contains('open')) Booking.close(); });
$$('.js-open-booking').forEach(b => b.addEventListener('click', () => Booking.open(0)));