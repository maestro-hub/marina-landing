(function(){
  // Sticky CTA bar - появляется после того как прокрутили больше одного экрана.
  // Работает только на страницах, где есть #stickyCta (сейчас - только главная).
  var bar = document.getElementById('stickyCta');
  if(bar){
    var shown = false;
    function onScroll(){
      var should = window.scrollY > window.innerHeight * 0.9;
      if(should !== shown){ shown = should; bar.classList.toggle('visible', should); }
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

(function(){
  // Появление секций при прокрутке - лёгкий fade+slide-up, без JS/IntersectionObserver
  // секции остаются видимыми по умолчанию (класс .reveal добавляется только здесь).
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var targets = document.querySelectorAll('section:not(.hero)');
  if(!targets.length) return;

  // Без отрицательного нижнего rootMargin: с ним последняя секция перед
  // футером иногда не может "дотянуться" до срабатывания, потому что дальше
  // физически некуда скроллить (нашла тестом реального скролла до конца страницы).
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(function(el){
    el.classList.add('reveal');
    io.observe(el);
  });
})();

(function(){
  // Две пасхалки в хиро - грампластинка (гимн, US Navy Band, 22 сек) и восковая печать
  // (коронационная речь Елизаветы II, 1953, обе записи - общественное достояние, см.
  // memory проекта). Ручной запуск, не автоплей. Второй клик или конец отрывка -
  // остановка. Если запущена одна пасхалка, а нажали вторую - первая глушится, чтобы
  // не наложились друг на друга.
  var eggs = [
    { btn: document.getElementById('anthemRecord'), audio: document.getElementById('anthemAudio') },
    { btn: document.getElementById('queenRecord'), audio: document.getElementById('queenAudio') }
  ].filter(function(e){ return e.btn && e.audio; });
  if(!eggs.length) return;

  function stopAll(except){
    eggs.forEach(function(e){
      if(e !== except && !e.audio.paused){
        e.audio.pause();
        e.btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  eggs.forEach(function(egg){
    egg.btn.addEventListener('click', function(){
      if(egg.audio.paused){
        stopAll(egg);
        egg.audio.currentTime = 0;
        egg.audio.play().catch(function(){ /* автоплей может быть заблокирован - тихо игнорируем */ });
        egg.btn.setAttribute('aria-pressed', 'true');
      } else {
        egg.audio.pause();
        egg.btn.setAttribute('aria-pressed', 'false');
      }
    });
    egg.audio.addEventListener('ended', function(){ egg.btn.setAttribute('aria-pressed', 'false'); });
  });
})();

(function(){
  // Карточка "think vs sink" - минимальная пара на слух, один вопрос, без баллов
  // и без "правильно/неправильно" в духе теста (аудитория стесняется акцента).
  var card = document.getElementById('soundCard');
  if(!card) return;

  var playBtn = document.getElementById('scPlay');
  var answers = card.querySelectorAll('.sc-answer');
  var feedback = document.getElementById('scFeedback');
  var feedbackText = document.getElementById('scFeedbackText');
  var audioThink = document.getElementById('scAudioThink');
  var audioSink = document.getElementById('scAudioSink');
  var miniButtons = card.querySelectorAll('.sc-mini');

  var target = Math.random() < 0.5 ? 'think' : 'sink';
  var answered = false;

  function audioFor(word){ return word === 'think' ? audioThink : audioSink; }

  function playWord(word, btn){
    var a = audioFor(word);
    a.currentTime = 0;
    a.play().catch(function(){});
    if(btn){
      btn.disabled = true;
      a.addEventListener('ended', function once(){ btn.disabled = false; a.removeEventListener('ended', once); });
    }
  }

  playBtn.addEventListener('click', function(){
    playWord(target, playBtn);
    answers.forEach(function(btn){ btn.disabled = false; });
  });

  answers.forEach(function(btn){
    btn.addEventListener('click', function(){
      if(answered) return;
      answered = true;
      answers.forEach(function(b){ b.setAttribute('aria-pressed', String(b === btn)); });
      var chose = btn.getAttribute('data-word');
      feedbackText.textContent = (chose === target)
        ? 'Да, здесь звучало «' + target + '».'
        : 'Эти звуки легко спутать. Здесь звучало «' + target + '».';
      feedback.hidden = false;
    });
  });

  miniButtons.forEach(function(btn){
    btn.addEventListener('click', function(){ playWord(btn.getAttribute('data-word'), btn); });
  });
})();
