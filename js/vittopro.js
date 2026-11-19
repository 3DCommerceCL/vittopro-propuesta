(function () {
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var escritorio = window.matchMedia('(min-width: 961px)');

  /* Header: se compacta al bajar */
  var header = document.getElementById('header');
  var wsp = document.querySelector('.wsp');
  function alScroll() { header.classList.toggle('compacto', window.scrollY > 40); wsp.classList.toggle('visible', window.scrollY > 420); }
  alScroll(); window.addEventListener('scroll', alScroll, { passive: true });

  /* Menú móvil */
  var hamb = document.getElementById('hamburguesa');
  function cerrarMovil() {
    header.classList.remove('menu-abierto'); hamb.setAttribute('aria-expanded', 'false');
    hamb.setAttribute('aria-label', 'Abrir menú'); document.body.style.overflow = '';
  }
  hamb.addEventListener('click', function () {
    var abrir = !header.classList.contains('menu-abierto');
    header.classList.toggle('menu-abierto', abrir);
    hamb.setAttribute('aria-expanded', String(abrir));
    hamb.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = abrir ? 'hidden' : '';
  });
  document.querySelectorAll('#menu-panel a').forEach(function (a) { a.addEventListener('click', cerrarMovil); });

  /* Desplegables: hover en escritorio, clic en táctil y móvil, Esc cierra */
  var items = document.querySelectorAll('.menu > li');
  function cerrarTodos(salvo) {
    items.forEach(function (li) {
      if (li === salvo) return; li.classList.remove('abierto');
      var b = li.querySelector(':scope > button'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  items.forEach(function (li) {
    var boton = li.querySelector(':scope > button'); if (!boton) return;
    var t;
    function abrir(si) { li.classList.toggle('abierto', si); boton.setAttribute('aria-expanded', String(si)); }
    boton.addEventListener('click', function () { var si = !li.classList.contains('abierto'); cerrarTodos(li); abrir(si); });
    li.addEventListener('mouseenter', function () { if (!escritorio.matches) return; clearTimeout(t); cerrarTodos(li); abrir(true); });
    li.addEventListener('mouseleave', function () { if (!escritorio.matches) return; t = setTimeout(function () { abrir(false); }, 160); });
    li.addEventListener('focusout', function (e) { if (escritorio.matches && !li.contains(e.relatedTarget)) abrir(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var abierto = document.querySelector('.menu > li.abierto > button');
    cerrarTodos(); if (abierto) abierto.focus();
    if (header.classList.contains('menu-abierto')) { cerrarMovil(); hamb.focus(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.menu')) cerrarTodos(); });

  /* Carrusel (solo portada) */
  var hero = document.querySelector('.hero[aria-roledescription]');
  if (hero) (function () {
  var diapos = hero.querySelectorAll('.diapo');
  var puntos = hero.querySelector('.puntos');
  var actual = 0, timer = null, pausado = reducir, DUR = 6500;
  diapos.forEach(function (d, i) {
    var b = document.createElement('button'); b.type = 'button';
    b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    b.addEventListener('click', function () { ir(i, true); });
    puntos.appendChild(b);
  });
  var botones = puntos.querySelectorAll('button');
  function ir(n, manual) {
    actual = (n + diapos.length) % diapos.length;
    diapos.forEach(function (d, i) {
      var si = i === actual; d.classList.toggle('activa', si); d.setAttribute('aria-hidden', String(!si));
      d.querySelectorAll('a').forEach(function (a) { a.tabIndex = si ? 0 : -1; });
      var img = d.querySelector('img'); if (si && img.loading === 'lazy') img.loading = 'eager';
    });
    botones.forEach(function (b, i) {
      b.setAttribute('aria-current', String(i === actual));
      if (i === actual) { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
    });
    // precarga la siguiente para que el fundido no muestre un hueco
    var sig = diapos[(actual + 1) % diapos.length].querySelector('img'); if (sig.loading === 'lazy') sig.loading = 'eager';
    programar();
  }
  function programar() { clearTimeout(timer); if (!pausado) timer = setTimeout(function () { ir(actual + 1); }, DUR); }
  hero.style.setProperty('--duracion', DUR + 'ms');
  document.getElementById('siguiente').addEventListener('click', function () { ir(actual + 1, true); });
  document.getElementById('anterior').addEventListener('click', function () { ir(actual - 1, true); });
  var bPausa = document.getElementById('pausa');
  function ponerPausa(si) {
    pausado = si; hero.classList.toggle('pausado', si);
    bPausa.setAttribute('aria-label', si ? 'Reanudar carrusel' : 'Pausar carrusel');
    bPausa.innerHTML = si ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
                          : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';
    programar();
  }
  bPausa.addEventListener('click', function () { ponerPausa(!pausado); });
  hero.addEventListener('mouseenter', function () { if (!pausado) { clearTimeout(timer); hero.classList.add('pausado'); } });
  hero.addEventListener('mouseleave', function () { if (!pausado) { hero.classList.remove('pausado'); ir(actual); } });
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(timer); else programar(); });
  var x0 = null;
  hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) ir(actual + (dx < 0 ? 1 : -1), true);
  });
  if (reducir) ponerPausa(true);
  ir(0);
  })();

  /* Cinta de clientes: se duplica para que el giro no tenga corte */
  var cinta = document.getElementById('cinta');
  if (cinta) Array.prototype.slice.call(cinta.children).forEach(function (li) {
    var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelector('img').alt = ''; cinta.appendChild(c);
  });

  /* Aparición al hacer scroll + contadores */
  function contar(el) {
    var fin = +el.dataset.contar, t0 = null;
    function paso(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(paso); }
    el.textContent = '0'; requestAnimationFrame(paso);
  }
  document.querySelectorAll('.escalonado').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (h, i) { h.style.setProperty('--i', i); });
  });
  if ('IntersectionObserver' in window && !reducir) {
    /* Se muestra al entrar a la pantalla y se esconde al salir: así vuelve a aparecer al subir.
       Lo que quedó arriba de la pantalla se esconde hacia arriba, para que al volver baje a su lugar. */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var el = e.target, raiz = e.rootBounds ? e.rootBounds.height : innerHeight;
        if (e.isIntersecting && (e.intersectionRatio >= 0.12 || e.intersectionRect.height > raiz * 0.25)) {
          el.classList.add('visible');
          if (!el.dataset.contado) { el.dataset.contado = 1; el.querySelectorAll('[data-contar]').forEach(contar); }
        } else if (!e.isIntersecting) {
          el.classList.remove('visible');
          el.classList.toggle('arriba', e.boundingClientRect.top < 0);
        }
      });
    }, { threshold: [0, 0.12, 0.25], rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.aparece').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.aparece').forEach(function (el) { el.classList.add('visible'); });
  }

  /* Filtro de productos */
  var filtros = document.querySelectorAll('.filtros button');
  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      filtros.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      var f = b.dataset.filtro;
      document.querySelectorAll('.producto').forEach(function (p) {
        p.classList.toggle('oculto', f !== 'todo' && p.dataset.cat.split(' ').indexOf(f) < 0);
      });
    });
  });

  /* Formularios de cotización: arman el mensaje y abren WhatsApp (o el correo) */
  document.querySelectorAll('form[data-cotizar]').forEach(function (f) {
    function mensaje() {
      var lineas = ['Hola VittoPro, quiero cotizar.', 'Nombre: ' + f.nombre.value.trim()];
      if (f.empresa && f.empresa.value.trim()) lineas.push('Empresa: ' + f.empresa.value.trim());
      if (f.tipo) lineas.push('Necesito: ' + f.tipo.value);
      if (f.cantidad && f.cantidad.value.trim()) lineas.push('Cantidad aprox.: ' + f.cantidad.value.trim());
      if (f.fecha && f.fecha.value) lineas.push('Fecha de entrega: ' + f.fecha.value.split('-').reverse().join('-'));
      if (f.detalle && f.detalle.value.trim()) lineas.push('Detalle: ' + f.detalle.value.trim());
      return lineas;
    }
    function valido() {
      if (f.nombre.value.trim()) { f.nombre.setCustomValidity(''); return true; }
      f.nombre.setCustomValidity('Escribe tu nombre'); f.nombre.reportValidity(); f.nombre.focus(); return false;
    }
    f.nombre.addEventListener('input', function () { f.nombre.setCustomValidity(''); });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); if (!valido()) return;
      window.open('https://wa.me/56950832436?text=' + encodeURIComponent(mensaje().join('\n')), '_blank', 'noopener');
    });
    var correo = f.querySelector('[data-correo]');
    if (correo) correo.addEventListener('click', function () {
      if (!valido()) return;
      var asunto = 'Cotización' + (f.empresa && f.empresa.value.trim() ? ' · ' + f.empresa.value.trim() : '');
      location.href = 'mailto:contacto@vittopro.cl?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(mensaje().join('\n'));
    });
  });

  /* Llega con ?producto= desde una nota o una categoría: lo deja escrito en el detalle */
  var pedido = new URLSearchParams(location.search).get('producto');
  var fp = document.querySelector('form[data-cotizar]');
  if (pedido && fp && fp.detalle && !fp.detalle.value) fp.detalle.value = 'Me interesa: ' + pedido.slice(0, 120);

  /* Galería ampliable */
  var visor = document.getElementById('visor');
  if (visor && visor.showModal) {
    var fotos = Array.prototype.slice.call(document.querySelectorAll('[data-ampliar]')), iv = 0;
    var vImg = visor.querySelector('img'), vTxt = visor.querySelector('figcaption');
    function mostrar(i) {
      iv = (i + fotos.length) % fotos.length; var a = fotos[iv];
      vImg.src = a.getAttribute('href'); vImg.alt = a.querySelector('img').alt; vTxt.textContent = a.dataset.ampliar || a.querySelector('img').alt;
    }
    fotos.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); mostrar(i); visor.showModal(); }); });
    visor.querySelector('.v-cerrar').addEventListener('click', function () { visor.close(); });
    visor.querySelector('.v-ant').addEventListener('click', function () { mostrar(iv - 1); });
    visor.querySelector('.v-sig').addEventListener('click', function () { mostrar(iv + 1); });
    visor.addEventListener('click', function (e) { if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') mostrar(iv - 1); if (e.key === 'ArrowRight') mostrar(iv + 1); });
  }

  /* Copiar el enlace de una nota */
  document.querySelectorAll('[data-copiar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.dataset.copiar || location.href, txt = b.textContent;
      function listo() { b.textContent = '¡Enlace copiado!'; setTimeout(function () { b.textContent = txt; }, 1800); }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(listo, function () { prompt('Copia el enlace:', url); });
      else prompt('Copia el enlace:', url);
    });
  });

  document.getElementById('anio').textContent = new Date().getFullYear();
})();
