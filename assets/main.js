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
