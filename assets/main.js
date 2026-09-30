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

(function(){
  var card = document.getElementById('soundCard');

  if(!card) return;

  var playBtn = document.getElementById('scPlay');
  var answers = card.querySelectorAll('.sc-answer');
  var teaser = document.getElementById('scTeaser');
  var feedback = document.getElementById('scFeedback');
  var feedbackText = document.getElementById('scFeedbackText');
  var audioShip = document.getElementById('scAudioShip');
  var audioSheep = document.getElementById('scAudioSheep');
  var miniButtons = card.querySelectorAll('.sc-mini');

  if(!playBtn || !audioShip || !audioSheep) return;

  var target = Math.random() < 0.5 ? 'ship' : 'sheep';
  var answered = false;

  function audioFor(word){
    return word === 'ship' ? audioShip : audioSheep;
  }

  function stopOtherWordAudio(current){
    [audioShip, audioSheep].forEach(function(audio){
      if(audio !== current && !audio.paused){
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  function playWord(word, button){
    var audio = audioFor(word);

    stopOtherWordAudio(audio);
    audio.currentTime = 0;

    if(button){
      button.disabled = true;
    }

    audio.play().catch(function(){
      if(button){
        button.disabled = false;
      }
    });

    function restoreButton(){
      if(button){
        button.disabled = false;
      }

      audio.removeEventListener('ended', restoreButton);
    }

    audio.addEventListener('ended', restoreButton);
  }

  playBtn.addEventListener('click', function(){
    playWord(target, playBtn);

    answers.forEach(function(button){
      button.disabled = false;
    });
  });

  answers.forEach(function(button){
    button.addEventListener('click', function(){
      if(answered) return;

      answered = true;

      answers.forEach(function(answerButton){
        answerButton.setAttribute(
          'aria-pressed',
          String(answerButton === button)
        );
      });

      var chosenWord = button.getAttribute('data-word');

      feedbackText.textContent = chosenWord === target
        ? 'Да, здесь звучало «' + target + '».'
        : 'Эти гласные легко спутать. Здесь звучало «' + target + '».';

      if(teaser){
        teaser.hidden = true;
      }

      if(feedback){
        feedback.hidden = false;
      }
    });
  });

  miniButtons.forEach(function(button){
    button.addEventListener('click', function(){
      playWord(button.getAttribute('data-word'), button);
    });
  });
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
