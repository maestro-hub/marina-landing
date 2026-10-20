(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if(!toggle || !links) return;

  function close(){
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
  }

  toggle.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', close);
  });

  document.addEventListener('click', function(e){
    if(!links.classList.contains('open')) return;
    if(links.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') close();
  });
})();

(function(){
  var bar = document.getElementById('stickyCta');

  if(!bar) return;

  var shown = false;

  function onScroll(){
    var shouldShow = window.scrollY > window.innerHeight * 0.9;

    if(shouldShow !== shown){
      shown = shouldShow;
      bar.classList.toggle('visible', shouldShow);
    }
  }

  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

(function(){
  if(!('IntersectionObserver' in window)) return;

  if(
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ){
    return;
  }

  var targets = document.querySelectorAll('section:not(.hero)');

  if(!targets.length) return;

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold:0.08
  });

  targets.forEach(function(element){
    element.classList.add('reveal');
    observer.observe(element);
  });
})();

(function(){
  var eggs = [
    {
      btn:document.getElementById('anthemRecord'),
      audio:document.getElementById('anthemAudio')
    },
    {
      btn:document.getElementById('queenRecord'),
      audio:document.getElementById('queenAudio')
    },
    {
      btn:document.getElementById('beatRecord'),
      audio:document.getElementById('beatAudio')
    }
  ].filter(function(item){
    return item.btn && item.audio;
  });

  if(!eggs.length) return;

  function stopAll(except){
    eggs.forEach(function(egg){
      if(egg !== except && !egg.audio.paused){
        egg.audio.pause();
        egg.audio.currentTime = 0;
        egg.btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  eggs.forEach(function(egg){
    egg.btn.addEventListener('click', function(){
      if(egg.audio.paused){
        stopAll(egg);
        egg.audio.currentTime = 0;
        egg.btn.setAttribute('aria-pressed', 'true');

        egg.audio.play().catch(function(){
          egg.btn.setAttribute('aria-pressed', 'false');
        });
      } else {
        egg.audio.pause();
        egg.btn.setAttribute('aria-pressed', 'false');
      }
    });

    egg.audio.addEventListener('ended', function(){
      egg.btn.setAttribute('aria-pressed', 'false');
      egg.audio.currentTime = 0;
    });
  });
})();

// Тест на слух: 5 минимальных пар, шаги по образцу matte-steps-navigation (SL UI Library).
(function(){
  var card = document.getElementById('soundCard');

  if(!card) return;

  var PAIRS = [
    { tag:'/ɪ/ или /iː/', ipa:'ɪ<i>/</i>iː', words:[['ship','/ʃɪp/'], ['sheep','/ʃiːp/']],
      explain:'В ship гласный короткий и расслабленный: /ɪ/. В sheep он длиннее и напряжённее: /iː/. Для русскоязычных это не одна «и», а два разных звука.' },
    { tag:'/e/ или /æ/', ipa:'e<i>/</i>æ', words:[['bed','/bed/'], ['bad','/bæd/']],
      explain:'В bed рот приоткрыт, язык выше: /e/. В bad челюсть опускается, рот шире: /æ/. Русское «э» не подходит ни туда, ни туда.' },
    { tag:'/ʊ/ или /uː/', ipa:'ʊ<i>/</i>uː', words:[['full','/fʊl/'], ['fool','/fuːl/']],
      explain:'В full гласный короткий, губы почти не напряжены: /ʊ/. В fool он долгий, губы округлены сильнее: /uː/.' },
    { tag:'/ʌ/ или /ɑː/', ipa:'ʌ<i>/</i>ɑː', words:[['cut','/kʌt/'], ['cart','/kɑːt/']],
      explain:'В cut короткий звук в центре рта: /ʌ/. В cart долгий и глубокий, язык оттянут назад: /ɑː/. Буква r в британском cart не звучит.' },
    { tag:'/θ/ или /s/', ipa:'θ<i>/</i>s', words:[['think','/θɪŋk/'], ['sink','/sɪŋk/']],
      explain:'В think кончик языка между зубами, выдох через щель: /θ/. В sink язык за зубами: /s/. Подмена θ на s - одна из самых заметных черт русского акцента.' }
  ];

  var playBtn = document.getElementById('scPlay');
  var answers = card.querySelectorAll('.sc-answer');
  var minis = card.querySelectorAll('.sc-mini[data-slot]');
  var steps = card.querySelectorAll('.mp-step');
  var pairLabel = document.getElementById('mpPair');
  var teaser = document.getElementById('scTeaser');
  var teaserIpa = document.getElementById('scTeaserIpa');
  var feedback = document.getElementById('scFeedback');
  var feedbackText = document.getElementById('scFeedbackText');
  var explain = document.getElementById('scExplain');
  var nextBtn = document.getElementById('scNext');
  var finalBox = document.getElementById('scFinal');
  var scoreEl = document.getElementById('scScore');
  var verdict = document.getElementById('scVerdict');
  var restart = document.getElementById('scRestart');

  if(!playBtn || !answers.length) return;

  var audio = new Audio();
  audio.preload = 'none';
  var index = 0, target = 0, answered = false, score = 0;

  function word(slot){ return PAIRS[index].words[slot][0]; }

  var stopCurrent = null;

  // остановить звук и вернуть кнопке, которая его включила, активное состояние
  function stop(){
    audio.pause();
    if(stopCurrent) stopCurrent();
  }

  function play(slot, button){
    stop();
    audio.src = '/assets/audio/gb-' + word(slot) + '.mp3';
    if(button) button.disabled = true;
    function done(){
      if(button) button.disabled = false;
      audio.removeEventListener('ended', done);
      if(stopCurrent === done) stopCurrent = null;
    }
    stopCurrent = done;
    audio.addEventListener('ended', done);
    audio.play().catch(done);
  }

  function label(button, slot){
    var w = PAIRS[index].words[slot];
    button.innerHTML = (button.classList.contains('sc-mini') ? '▶ ' : '') + w[0] + ' <span class="ipa">' + w[1] + '</span>';
  }

  function show(i){
    index = i;
    answered = false;
    target = Math.random() < 0.5 ? 0 : 1;
    var pair = PAIRS[i];

    steps.forEach(function(step, n){
      if(n === i) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
    });
    pairLabel.textContent = 'Пара ' + (i + 1) + ' из ' + PAIRS.length + ' · ' + pair.tag;
    if(teaserIpa) teaserIpa.innerHTML = pair.ipa;
    answers.forEach(function(button){
      label(button, Number(button.dataset.slot));
      button.disabled = true;
      button.setAttribute('aria-pressed', 'false');
    });
    minis.forEach(function(button){ label(button, Number(button.dataset.slot)); });
    playBtn.textContent = '▶ Послушать слово';
    teaser.hidden = false;
    feedback.hidden = true;
    finalBox.hidden = true;
  }

  function finish(){
    scoreEl.textContent = score;
    verdict.textContent = score === 5
      ? 'Отличный слух. Следующий шаг - так же чётко произносить: на интенсиве Марина разбирает твою запись и говорит, что поправить.'
      : score >= 3
        ? 'Хорошая база. Пары, где была ошибка, - ровно то, что тренируем на интенсиве: сначала слышать, потом произносить.'
        : 'Эти пары легко спутать: в русском для них часто один звук. Различать их на слух учимся с первого дня интенсива.';
    teaser.hidden = true;
    feedback.hidden = true;
    finalBox.hidden = false;
    playBtn.disabled = true;
    if(window.msTrack) window.msTrack('quiz_done', score);
  }

  playBtn.addEventListener('click', function(){
    play(target, playBtn);
    playBtn.textContent = '▶ Послушать ещё раз';
    if(!answered) answers.forEach(function(button){ button.disabled = false; });
  });

  answers.forEach(function(button){
    button.addEventListener('click', function(){
      if(answered) return;
      answered = true;

      var slot = Number(button.dataset.slot);
      var right = slot === target;
      if(right) score++;

      answers.forEach(function(other){ other.setAttribute('aria-pressed', String(other === button)); });
      steps[index].setAttribute('data-result', right ? 'right' : 'wrong');

      feedbackText.textContent = right
        ? 'Да, здесь звучало «' + word(target) + '».'
        : 'Эти звуки легко спутать. Здесь звучало «' + word(target) + '».';
      explain.textContent = PAIRS[index].explain;
      nextBtn.textContent = index === PAIRS.length - 1 ? 'Узнать результат →' : 'Следующая пара →';
      teaser.hidden = true;
      feedback.hidden = false;
    });
  });

  minis.forEach(function(button){
    button.addEventListener('click', function(){ play(Number(button.dataset.slot), button); });
  });

  nextBtn.addEventListener('click', function(){
    stop();
    if(index < PAIRS.length - 1) show(index + 1); else finish();
  });

  restart.addEventListener('click', function(){
    stop();
    score = 0;
    playBtn.disabled = false;
    steps.forEach(function(step){ step.removeAttribute('data-result'); });
    show(0);
  });

  show(0);
})();

// Атлас звуков: контур языка - одна линия, которая перетекает между
// артикуляциями; нижняя челюсть поворачивается вокруг сустава.
(function(){
  var row = document.querySelector('.sound-row');
  var tongue = document.getElementById('atlasTongue');
  var jaw = document.getElementById('atlasJaw');
  var glyph = document.getElementById('atlasGlyph');
  var text = document.getElementById('atlasText');
  var neck = document.getElementById('atlasNeck');

  if(!row || !tongue || !jaw) return;

  var reducedMotion = !!(
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  var SOUNDS = {
    i:{
      jaw:-1,
      glyph:'iː',
      caption:'/iː/ FLEECE: язык поднят высоко и продвинут вперёд, губы слегка растянуты. Звук долгий.',
      d:'M116.9 163.3 C124.9 159.3 119 154 113 140 C124 112 152 98 188 100 C224 104 248 134 254 176 C258 204 258 232 254 256'
    },
    ae:{
      jaw:-10,
      glyph:'æ',
      caption:'/æ/ TRAP: челюсть опущена, язык лежит низко и впереди, рот открыт широко.',
      d:'M126.5 183.5 C134.5 179.5 126 176 120 162 C140 154 170 150 202 154 C232 160 250 182 256 210 C258 228 258 242 254 256'
    },
    er:{
      jaw:-4,
      glyph:'ɜː',
      caption:'/ɜː/ NURSE: язык в центре рта, губы нейтральные, не округлены. Звук долгий.',
      d:'M119.7 170.2 C127.7 166.2 121 164 115 150 C136 134 166 122 198 124 C230 126 250 152 256 188 C258 212 258 234 254 256'
    },
    or:{
      jaw:-8,
      glyph:'ɔː',
      caption:'/ɔː/ THOUGHT: язык оттянут назад, губы округлены и выдвинуты вперёд. Звук долгий.',
      d:'M128 188 C136 184 128 180 122 166 C132 148 158 130 196 122 C230 120 250 138 256 168 C258 196 258 226 254 256'
    }
  };

  var NUM = /-?\d+(\.\d+)?/g;
  var template = SOUNDS.i.d.replace(NUM, '#');

  function numbers(d){
    return d.match(NUM).map(Number);
  }

  function toPath(values){
    var i = 0;
    return template.replace(/#/g, function(){
      return (Math.round(values[i++] * 10) / 10).toString();
    });
  }

  // cubic-bezier(.77,0,.175,1): сильный ease-in-out для движения внутри схемы
  function easeInOut(t){
    var x1 = .77, y1 = 0, x2 = .175, y2 = 1;
    var u = t;

    for(var i = 0; i < 6; i++){
      var x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
      var dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);

      if(Math.abs(dx) < 1e-6) break;
      u = Math.min(1, Math.max(0, u - x / dx));
    }

    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  }

  var current = { values:numbers(SOUNDS.i.d), jaw:SOUNDS.i.jaw };
  var anim = null;

  // Кожа шеи крепится к концу нижней челюсти, поэтому её начало
  // поворачивается вместе с челюстью вокруг сустава (250, 112).
  function draw(values, angle){
    tongue.setAttribute('d', toPath(values));
    jaw.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ' 250 112)');

    if(neck){
      var a = angle * Math.PI / 180;
      var dx = 186 - 250;
      var dy = 222 - 112;
      var ex = 250 + dx * Math.cos(a) - dy * Math.sin(a);
      var ey = 112 + dx * Math.sin(a) + dy * Math.cos(a);
      neck.setAttribute('d', 'M' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ' C' + (ex + 8).toFixed(1) + ' ' + (ey + 34).toFixed(1) + ' 206 296 204 334');
    }
  }

  function go(key){
    var next = SOUNDS[key];

    if(!next) return;

    var from = current.values.slice();
    var to = numbers(next.d);
    var jawFrom = current.jaw;
    var start = null;
    var DURATION = 480;

    if(anim) cancelAnimationFrame(anim);

    if(reducedMotion){
      current = { values:to, jaw:next.jaw };
      draw(to, next.jaw);
    } else {
      anim = requestAnimationFrame(function step(now){
        if(start === null) start = now;

        var t = Math.min(1, (now - start) / DURATION);
        var e = easeInOut(t);
        var values = from.map(function(v, i){ return v + (to[i] - v) * e; });
        var angle = jawFrom + (next.jaw - jawFrom) * e;

        current = { values:values, jaw:angle };
        draw(values, angle);

        if(t < 1){
          anim = requestAnimationFrame(step);
        } else {
          anim = null;
        }
      });
    }

    if(glyph){
      glyph.textContent = next.glyph;

      if(!reducedMotion && glyph.animate){
        glyph.animate(
          [{ opacity:.35, filter:'blur(2px)' }, { opacity:1, filter:'blur(0)' }],
          { duration:220, easing:'cubic-bezier(.23,1,.32,1)' }
        );
      }
    }

    if(text){
      text.textContent = next.caption;
    }
  }

  var keys = row.querySelectorAll('[data-sound]');

  keys.forEach(function(button){
    button.addEventListener('click', function(){
      keys.forEach(function(other){
        other.setAttribute('aria-pressed', String(other === button));
      });

      go(button.getAttribute('data-sound'));
    });
  });
})();

/* Продуктовые метрики (2026-09-30): свой счётчик вместо Яндекс.Метрики.
   Без cookie и персональных данных: случайный id посетителя в localStorage, IP на сервере не хранится.
   Кнопки в бота получают хвост ?start=<как было>__<место>__<источник>__<id визита> -
   бот запоминает, откуда пришёл человек (см. split_start_attribution в боте). */
(function(){
  var ENDPOINT = 'https://sergei-akimov.com/mstats/e';
  function store(kind, key, val){
    try{
      var s = kind === 'l' ? window.localStorage : window.sessionStorage;
      if(val === undefined) return s.getItem(key);
      s.setItem(key, val);
    }catch(e){}
    return val === undefined ? null : val;
  }
  function rid(n){
    var a = 'abcdefghijklmnopqrstuvwxyz0123456789', out = '';
    for(var i = 0; i < n; i++) out += a.charAt(Math.floor(Math.random() * a.length));
    return out;
  }
  function clean(v, n){ return String(v || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, n || 12); }

  var vid = store('l', 'ms_vid') || store('l', 'ms_vid', rid(8)) || rid(8);
  var sid = store('s', 'ms_sid') || store('s', 'ms_sid', rid(8)) || rid(8);

  var q = new URLSearchParams(location.search);
  var utm = {};
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){ if(q.get(k)) utm[k] = q.get(k); });

  // источник: utm_source, иначе сайт-реферер; первое касание запоминаем
  function refSource(){
    var r = document.referrer;
    if(!r) return 'direct';
    var h;
    try{ h = new URL(r).hostname.replace(/^www\./, ''); }catch(e){ return 'direct'; }
    if(h === location.hostname) return '';
    var map = { 't.me':'tg', 'telegram.org':'tg', 'web.telegram.org':'tg', 'instagram.com':'ig', 'l.instagram.com':'ig',
      'threads.net':'threads', 'vk.com':'vk', 'm.vk.com':'vk', 'google.com':'google', 'yandex.ru':'yandex', 'ya.ru':'yandex',
      'youtube.com':'yt', 'facebook.com':'fb', 'l.facebook.com':'fb' };
    return map[h] || h.split('.')[0];
  }
  var src = clean(utm.utm_source) || clean(refSource());
  if(src) store('l', 'ms_src') || store('l', 'ms_src', src);
  var firstSrc = store('l', 'ms_src') || src || 'direct';

  function send(ev, extra){
    var d = { site: /(^|\.)marinaspeaksrp\.org$/.test(location.hostname) ? 'marina' : 'marina-dev', vid: vid, sid: sid, ev: ev, path: location.pathname, ref: document.referrer.slice(0, 200),
      sw: String(screen.width), sh: String(screen.height), lang: navigator.language || '',
      device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop' };
    for(var k in utm) d[k] = utm[k];
    for(var e in (extra || {})) d[e] = String(extra[e]);
    var body = JSON.stringify(d);
    try{
      if(navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
    }catch(err){}
    try{ fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' }); }catch(err){}
  }

  send('pageview');
  window.msTrack = function(label, value){ send('click', { label: String(label).slice(0, 60), value: value }); };

  // кнопки в бота: место на странице + хвост атрибуции
  function placeOf(a){
    if(a.dataset.place) return a.dataset.place;
    var m = (a.href.match(/start=waitlist_(tariff\d)/) || [])[1];
    if(m) return m.replace('tariff', 't');
    if(a.closest('#stickyCta')) return 'sticky';
    if(a.closest('header, nav')) return 'header';
    var slug = location.pathname.split('/').filter(Boolean).pop() || '';
    if(location.pathname.indexOf('/articles/') === 0) return ('art-' + slug.replace('.html', '')).slice(0, 24);
    var sec = a.closest('section');
    return sec && sec.id ? sec.id.slice(0, 24) : 'page';
  }
  document.querySelectorAll('a[href*="t.me/Marinatoken_bot"]').forEach(function(a){
    var place = clean(placeOf(a), 24);
    try{
      var u = new URL(a.href);
      var base = (u.searchParams.get('start') || 'waitlist').split('__')[0];
      u.searchParams.set('start', base + '__' + place + '__' + (clean(firstSrc) || 'direct') + '__' + vid);
      a.href = u.toString();
    }catch(e){}
    a.addEventListener('click', function(){ send('click', { label: place, value: 'bot' }); });
  });

  // глубина прокрутки
  var marks = [25, 50, 75, 100], hit = {};
  function onScroll(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.round(window.scrollY / h * 100) : 100;
    marks.forEach(function(m){ if(p >= m && !hit[m]){ hit[m] = 1; send('scroll', { value: m }); } });
  }
  document.addEventListener('scroll', onScroll, { passive: true });

  // какие секции реально увидели
  if('IntersectionObserver' in window){
    var seen = {};
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var id = en.target.id;
        if(en.isIntersecting && id && !seen[id]){ seen[id] = 1; send('section_view', { label: id }); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('section[id]').forEach(function(s){ io.observe(s); });
  }

  // открытия вопросов FAQ
  document.querySelectorAll('details').forEach(function(d){
    d.addEventListener('toggle', function(){
      if(d.open){ var s = d.querySelector('summary'); send('faq_open', { label: (s ? s.textContent : '').trim().slice(0, 60) }); }
    });
  });

  // вовлечённость: 15 секунд на видимой вкладке; уход - сколько секунд провёл
  var t0 = Date.now(), visibleMs = 0, lastVis = Date.now(), engaged = false;
  setInterval(function(){
    if(document.visibilityState === 'visible'){ visibleMs += Date.now() - lastVis; }
    lastVis = Date.now();
    if(!engaged && visibleMs >= 15000){ engaged = true; send('engaged'); }
  }, 1000);
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden') send('leave', { value: Math.round((Date.now() - t0) / 1000) });
  });
})();

/* Блоки на компонентах SL UI Library (MIT, github.com/SLtowl/sl-ui-library), 2026-10-20:
   перекрашены в палитру сайта и переведены. Плеер звуков - matte-playback + matte-speed-slider,
   карусель отзывов - matte-carousel-navigation, вкладки FAQ - matte-tabs-navigation,
   сравнение тарифов - matte-overlays-plan-compare-v11, уведомление - matte-toast-feedback. */

// Плеер примеров у звуков программы: Play/Pause с морфингом иконки и скорость 0.5-1×.
(function(){
  var button = document.getElementById('atlasPlay');
  var row = document.querySelector('.sound-row');
  var words = document.getElementById('atlasWords');
  var range = document.getElementById('atlasRate');
  var out = document.getElementById('atlasRateOut');

  if(!button || !row || !range) return;

  var WORDS = { i:'sheep · see · team', ae:'cat · bad · map', er:'bird · word · learn', or:'door · talk · four' };
  var label = button.querySelector('.sl-playback__label');
  var audio = new Audio();
  var sound = 'i';
  audio.preload = 'none';

  function setPlaying(on){
    button.dataset.playing = String(on);
    button.setAttribute('aria-label', on ? 'Пауза' : 'Послушать примеры');
    if(label) label.textContent = on ? 'Пауза' : 'Слушать';
  }

  function setRate(value){
    var rate = Number(value);
    range.value = String(rate);
    range.setAttribute('aria-valuetext', rate + '×');
    range.style.setProperty('--fill', ((rate - 0.5) / 0.5 * 100) + '%');
    if(out) out.textContent = rate + '×';
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
  }

  button.addEventListener('click', function(){
    if(button.dataset.playing === 'true'){ audio.pause(); return; }
    var src = '/assets/audio/snd-' + sound + '.mp3';
    if(audio.getAttribute('src') !== src) audio.src = src;
    if(audio.ended) audio.currentTime = 0;
    audio.playbackRate = Number(range.value);
    audio.play().catch(function(){ setPlaying(false); });
  });
  audio.addEventListener('play', function(){ setPlaying(true); });
  audio.addEventListener('pause', function(){ setPlaying(false); });
  audio.addEventListener('ended', function(){ setPlaying(false); audio.currentTime = 0; });

  range.addEventListener('input', function(){ setRate(range.value); });
  document.querySelectorAll('#atlasSpeed [data-rate]').forEach(function(stop){
    stop.addEventListener('click', function(){ setRate(stop.dataset.rate); });
  });

  row.querySelectorAll('[data-sound]').forEach(function(key){
    key.addEventListener('click', function(){
      sound = key.getAttribute('data-sound');
      audio.pause();
      audio.removeAttribute('src');
      if(words) words.textContent = WORDS[sound] || '';
    });
  });

  setRate(1);
})();

// Карусель отзывов: горизонтальная лента со snap, стрелки и точки.
(function(){
  var track = document.getElementById('tcarTrack');
  var prev = document.getElementById('tcarPrev');
  var next = document.getElementById('tcarNext');
  var dotsBox = document.getElementById('tcarDots');

  if(!track || !prev || !next || !dotsBox) return;

  var slides = Array.prototype.slice.call(track.children);
  var dots = slides.map(function(slide, i){
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'tcar-dot';
    dot.setAttribute('aria-label', 'Отзыв ' + (i + 1) + ' из ' + slides.length);
    dot.addEventListener('click', function(){ go(i); });
    dotsBox.appendChild(dot);
    return dot;
  });

  function perView(){
    var first = slides[0];
    return first ? Math.max(1, Math.round(track.clientWidth / first.getBoundingClientRect().width)) : 1;
  }

  function current(){
    var left = track.scrollLeft, best = 0, dist = Infinity;
    slides.forEach(function(slide, i){
      var d = Math.abs(slide.offsetLeft - track.offsetLeft - left);
      if(d < dist){ dist = d; best = i; }
    });
    return best;
  }

  function go(i){
    var max = slides.length - perView();
    i = Math.max(0, Math.min(i, max));
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  function sync(){
    var i = current(), n = perView(), max = slides.length - n;
    dots.forEach(function(dot, k){
      dot.hidden = k > max;
      dot.setAttribute('aria-current', String(k === i));
    });
    prev.disabled = i <= 0;
    next.disabled = i >= max;
  }

  prev.addEventListener('click', function(){ go(current() - 1); });
  next.addEventListener('click', function(){ go(current() + 1); });
  track.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft'){ e.preventDefault(); go(current() - 1); }
    if(e.key === 'ArrowRight'){ e.preventDefault(); go(current() + 1); }
  });
  var timer;
  track.addEventListener('scroll', function(){ clearTimeout(timer); timer = setTimeout(sync, 60); }, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();

// Вкладки FAQ со скользящей линией.
(function(){
  var list = document.querySelector('.faq-tabs');

  if(!list) return;

  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  var line = list.querySelector('.faq-tabs-indicator');

  function place(tab){
    if(!line) return;
    line.style.width = tab.offsetWidth + 'px';
    line.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
  }

  function select(tab, focus){
    tabs.forEach(function(t){
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if(panel) panel.hidden = !on;
    });
    place(tab);
    if(focus) tab.focus();
  }

  tabs.forEach(function(tab, i){
    tab.addEventListener('click', function(){
      select(tab);
      if(window.msTrack) window.msTrack('faq_tab', i);
    });
    tab.addEventListener('keydown', function(e){
      var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if(k === undefined) return;
      e.preventDefault();
      select(tabs[(k + tabs.length) % tabs.length], true);
    });
  });

  // ссылка #objections ведёт на вкладку «Сомнения»
  function fromHash(){ if(location.hash === '#objections') select(tabs[0]); }
  window.addEventListener('hashchange', fromHash);
  // без JS видны оба списка и нет вкладок, с JS - вкладки и первый список
  list.hidden = false;
  select(tabs[0]);

  window.addEventListener('resize', function(){
    var on = tabs.filter(function(t){ return t.getAttribute('aria-selected') === 'true'; })[0];
    if(on) place(on);
  });
  requestAnimationFrame(function(){ place(tabs[0]); list.setAttribute('data-ready', 'true'); });
})();

// Окно сравнения тарифов: нативный <dialog>, переключатель «Только различия».
(function(){
  var dialog = document.getElementById('cmpDialog');
  var open = document.getElementById('cmpOpen');
  var close = document.getElementById('cmpClose');
  var diff = document.getElementById('cmpDiff');

  if(!dialog || !open || typeof dialog.showModal !== 'function'){
    return;
  }
  open.hidden = false;

  open.addEventListener('click', function(){
    dialog.showModal();
    if(window.msTrack) window.msTrack('compare_open', 1);
  });
  close.addEventListener('click', function(){ dialog.close(); });
  dialog.addEventListener('click', function(e){ if(e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function(){ open.focus(); });
  diff.addEventListener('change', function(){ dialog.classList.toggle('only-diff', diff.checked); });
})();

// Уведомление при переходе в бота: что нажать дальше.
(function(){
  var toast = document.getElementById('toast');
  var title = document.getElementById('toastTitle');
  var detail = document.getElementById('toastDetail');
  var close = document.getElementById('toastClose');

  if(!toast || !title || !detail) return;

  var timer = null, left = 0, started = 0;

  function hide(){
    clearTimeout(timer);
    toast.classList.remove('is-on');
    setTimeout(function(){ if(!toast.classList.contains('is-on')) toast.hidden = true; }, 260);
  }

  function run(ms){ left = ms; started = Date.now(); clearTimeout(timer); timer = setTimeout(hide, ms); }

  function show(t, d){
    title.textContent = t;
    detail.textContent = d;
    toast.hidden = false;
    requestAnimationFrame(function(){ toast.classList.add('is-on'); });
    run(7000);
  }

  // пауза таймера, пока курсор или фокус на уведомлении
  toast.addEventListener('mouseenter', function(){ clearTimeout(timer); left -= Date.now() - started; });
  toast.addEventListener('mouseleave', function(){ run(Math.max(left, 1500)); });
  if(close) close.addEventListener('click', hide);

  document.addEventListener('click', function(e){
    var link = e.target.closest && e.target.closest('a[href*="t.me/Marinatoken_bot"]');
    if(!link) return;
    var dialog = link.closest('dialog');
    if(dialog && dialog.open) dialog.close();
    show('Открываем бота Марины', 'Нажми «Старт» - и ты в листе ожидания. О старте записи на 2027 сообщим в боте.');
  });
})();
