/* ==========================================================================
   app.js — arranque, enrutado por hash, sidebar, TOC, tema, paleta y atajos
   ========================================================================== */
(function (global) {
  'use strict';

  var doc = global.document;
  var Store = global.Store, Render = global.Render, Search = global.Search;

  var Catalogo = global.Contenido;   // { grupos: {...}, secciones: [...] }
  var secciones = Catalogo.secciones;
  var grupos = Catalogo.grupos;
  var porId = {};
  // Orden de lectura = orden del menú (grupo y, dentro, orden de registro).
  // Así «Anterior / Siguiente» y las teclas j/k no saltan entre grupos.
  var ordenGrupo = {};
  Object.keys(grupos).forEach(function (g, i) { ordenGrupo[g] = i; });
  secciones.forEach(function (s, i) { s._reg = i; });
  secciones.sort(function (x, y) {
    return (ordenGrupo[x.group] - ordenGrupo[y.group]) || (x._reg - y._reg);
  });
  secciones.forEach(function (s, i) { porId[s.id] = s; s._i = i; });

  /* Recorta un texto en el límite de palabra y añade puntos suspensivos. */
  function resumir(html, max) {
    var t = String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    var corte = t.lastIndexOf(' ', max);
    return t.slice(0, corte > max * 0.6 ? corte : max).replace(/[,;:.\s]+$/, '') + '…';
  }

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* =============================== TEMA ================================= */
  var ORDEN_TEMA = ['auto', 'light', 'dark'];
  var ETIQUETA_TEMA = { auto: 'Tema: automático', light: 'Tema: claro', dark: 'Tema: oscuro' };
  var ICONO_TEMA = {
    auto:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" opacity=".45"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>',
    dark:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'
  };

  function aplicarTema() {
    var t = Store.get().tema;
    doc.documentElement.setAttribute('data-theme', t);
    var btn = $('#btn-tema');
    if (btn) {
      btn.innerHTML = ICONO_TEMA[t];
      btn.setAttribute('title', ETIQUETA_TEMA[t] + ' — pulsa para cambiar');
      btn.setAttribute('aria-label', ETIQUETA_TEMA[t]);
    }
  }

  /* ============================== SIDEBAR =============================== */
  function pintarSidebar() {
    var nav = $('#nav');
    var html = '';
    var ordenGrupos = Object.keys(grupos);

    ordenGrupos.forEach(function (gid) {
      var g = grupos[gid];
      var items = secciones.filter(function (s) { return s.group === gid; });
      if (!items.length) return;
      var abierto = Store.grupoAbierto(gid);

      html += '<div class="navgroup" data-group="' + gid + '" data-open="' + abierto + '">' +
        '<button class="navgroup__btn" type="button" aria-expanded="' + abierto + '">' +
          '<span class="navgroup__dot" style="background:' + g.color + '"></span>' +
          '<span>' + global.Highlight.esc(g.title) + '</span>' +
          '<span class="navgroup__count">' + items.length + '</span>' +
          '<svg class="navgroup__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
        '</button><ul class="navgroup__items">';

      items.forEach(function (s) {
        html += '<li><a class="navlink" href="#' + s.id + '" data-id="' + s.id + '"' +
          ' data-read="' + Store.esLeida(s.id) + '">' +
          '<span class="navlink__label">' + global.Highlight.esc(s.title) + '</span>' +
          (Store.esFavorita(s.id) ? '<svg class="navlink__star" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg>' : '') +
          '<svg class="navlink__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
          '</a></li>';
      });
      html += '</ul></div>';
    });

    nav.innerHTML = html;

    $$('.navgroup__btn', nav).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var grupo = btn.closest('.navgroup');
        var abierto = grupo.getAttribute('data-open') !== 'true';
        grupo.setAttribute('data-open', abierto);
        btn.setAttribute('aria-expanded', abierto);
        Store.setGrupoAbierto(grupo.getAttribute('data-group'), abierto);
      });
    });
  }

  function marcarActiva(id) {
    $$('.navlink').forEach(function (a) {
      if (a.getAttribute('data-id') === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    var activo = $('.navlink[aria-current="page"]');
    if (activo) {
      var grupo = activo.closest('.navgroup');
      if (grupo && grupo.getAttribute('data-open') !== 'true') {
        grupo.setAttribute('data-open', 'true');
        Store.setGrupoAbierto(grupo.getAttribute('data-group'), true);
      }
      // Mantén el enlace activo visible dentro del scroll del menú
      var caja = activo.getBoundingClientRect(), nav = $('#nav').getBoundingClientRect();
      if (caja.top < nav.top || caja.bottom > nav.bottom) {
        activo.scrollIntoView({ block: 'center' });
      }
    }
  }

  function actualizarProgreso() {
    var total = secciones.length, hechas = 0;
    secciones.forEach(function (s) { if (Store.esLeida(s.id)) hechas++; });
    var pct = total ? Math.round(hechas / total * 100) : 0;
    var texto = $('#progreso-texto');
    if (texto) texto.textContent = hechas + ' de ' + total + ' leídas (' + pct + '%)';
    var barra = $('#progreso-bar');
    if (barra) {
      var r = 12.5, c = 2 * Math.PI * r;
      barra.setAttribute('stroke-dasharray', c.toFixed(2));
      barra.setAttribute('stroke-dashoffset', (c * (1 - pct / 100)).toFixed(2));
    }
    $$('.navlink').forEach(function (a) {
      a.setAttribute('data-read', Store.esLeida(a.getAttribute('data-id')));
    });
  }

  /* ---------------------- filtro rápido del menú ------------------------- */
  function sinAcentos(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function filtrarMenu(q) {
    var norm = sinAcentos(q.trim());
    var visiblesPorGrupo = {};

    $$('.navlink').forEach(function (a) {
      var s = porId[a.getAttribute('data-id')];
      var heno = sinAcentos(s.title + ' ' + (s.tags || []).join(' ') + ' ' +
                            String(s.lead || '').replace(/<[^>]+>/g, ''));
      var ok = !norm || heno.indexOf(norm) > -1;
      a.parentNode.hidden = !ok;
      if (ok) visiblesPorGrupo[s.group] = (visiblesPorGrupo[s.group] || 0) + 1;
    });

    $$('.navgroup').forEach(function (g) {
      var gid = g.getAttribute('data-group');
      var n = visiblesPorGrupo[gid] || 0;
      g.hidden = n === 0;
      var cont = $('.navgroup__count', g);
      if (cont) cont.textContent = n;
      if (norm) g.setAttribute('data-open', 'true');
    });
  }

  /* ================================ TOC ================================= */
  var observador = null;

  function pintarToc(sec) {
    var caja = $('#toc');
    var items = Render.toc(sec);
    if (items.length < 2) { caja.hidden = true; caja.innerHTML = ''; return; }
    caja.hidden = false;
    caja.innerHTML = '<div class="toc__title">En esta página</div><ul class="toc__list">' +
      items.map(function (i) {
        return '<li><a class="lvl-' + i.lvl + '" href="#' + sec.id + '/' + i.id + '" data-anc="' + i.id + '">' +
          global.Highlight.esc(i.text) + '</a></li>';
      }).join('') + '</ul>';
    observarEncabezados(items);
  }

  function observarEncabezados(items) {
    if (observador) observador.disconnect();
    var enlaces = {};
    $$('#toc a').forEach(function (a) { enlaces[a.getAttribute('data-anc')] = a; });

    observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('#toc a').forEach(function (a) { a.classList.remove('is-active'); });
        var a = enlaces[e.target.id];
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-' + (58 + 20) + 'px 0px -70% 0px', threshold: 0 });

    items.forEach(function (i) {
      var el = doc.getElementById(i.id);
      if (el) observador.observe(el);
    });
  }

  /* ============================== ENRUTADO ============================== */
  function partesHash() {
    var h = (global.location.hash || '').replace(/^#/, '');
    if (!h) return { id: null, anc: null };
    var p = h.split('/');
    return { id: p[0] || null, anc: p[1] || null };
  }

  function mostrar(id, anc, empujar) {
    var sec = porId[id];
    if (!sec) { mostrarInicio(); return; }

    var grupo = grupos[sec.group];
    var contenido = $('#contenido');
    contenido.innerHTML = Render.seccion(sec, grupo) + pieDeSeccion(sec);

    // Migas de pan
    $('#crumbs').innerHTML = '<span>' + global.Highlight.esc(grupo.title) + '</span>' +
      '<span>/</span><b>' + global.Highlight.esc(sec.title) + '</b>';
    doc.title = sec.title + ' · Todo en Linux';

    marcarActiva(id);
    pintarToc(sec);
    conectarCopias(contenido);
    conectarTablasAscii(contenido);
    conectarConversorAscii(contenido);
    conectarSimbolos(contenido);
    conectarTabs(contenido);
    conectarChmod(contenido);
    conectarBuilders(contenido);
    conectarPie(sec);
    Store.setUltima(id);

    if (empujar !== false) {
      var nuevo = '#' + id + (anc ? '/' + anc : '');
      if (global.location.hash !== nuevo) {
        global.history.pushState(null, '', nuevo);
      }
    }

    cerrarMenu();
    if (anc) {
      var el = doc.getElementById(anc);
      if (el) {
        activarTabDe(el);
        // Un panel de pestaña se muestra con su barra de pestañas visible
        var destino = el.classList.contains('tabs__panel') ? el.closest('.tabs') : el;
        destino.scrollIntoView();
        return;
      }
    }
    global.scrollTo({ top: 0, behavior: 'auto' });
  }

  function pieDeSeccion(sec) {
    var leida = Store.esLeida(sec.id);
    var fav = Store.esFavorita(sec.id);
    var prev = secciones[sec._i - 1], next = secciones[sec._i + 1];

    var h = '<div class="sectionfoot">' +
      '<button class="markread" id="btn-leida" type="button" aria-pressed="' + leida + '">' +
        Render.ICO.ok + '<span>' + (leida ? 'Leída' : 'Marcar como leída') + '</span></button>' +
      '<button class="markread" id="btn-fav" type="button" aria-pressed="' + fav + '">' +
        '<svg viewBox="0 0 24 24" fill="' + (fav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg>' +
        '<span>' + (fav ? 'En favoritos' : 'Añadir a favoritos') + '</span></button>' +
      '<button class="markread" id="btn-print" type="button">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>' +
        '<span>Imprimir / PDF</span></button>' +
      '</div>';

    h += '<nav class="pager">';
    if (prev) h += '<a class="prev" href="#' + prev.id + '"><small>← Anterior</small><b>' +
      global.Highlight.esc(prev.title) + '</b></a>'; else h += '<span></span>';
    if (next) h += '<a class="next" href="#' + next.id + '"><small>Siguiente →</small><b>' +
      global.Highlight.esc(next.title) + '</b></a>';
    return h + '</nav>';
  }

  function conectarPie(sec) {
    var bl = $('#btn-leida');
    if (bl) bl.addEventListener('click', function () {
      var ahora = Store.alternarLeida(sec.id);
      bl.setAttribute('aria-pressed', ahora);
      $('span', bl).textContent = ahora ? 'Leída' : 'Marcar como leída';
      actualizarProgreso();
      toast(ahora ? 'Sección marcada como leída' : 'Marca de lectura quitada');
    });

    var bf = $('#btn-fav');
    if (bf) bf.addEventListener('click', function () {
      var ahora = Store.alternarFavorita(sec.id);
      bf.setAttribute('aria-pressed', ahora);
      $('span', bf).textContent = ahora ? 'En favoritos' : 'Añadir a favoritos';
      $('svg', bf).setAttribute('fill', ahora ? 'currentColor' : 'none');
      pintarSidebar(); marcarActiva(sec.id); actualizarProgreso();
      toast(ahora ? 'Añadida a favoritos' : 'Quitada de favoritos');
    });

    var bp = $('#btn-print');
    if (bp) bp.addEventListener('click', function () { global.print(); });
  }

  function mostrarInicio() {
    var contenido = $('#contenido');
    var total = 0;
    secciones.forEach(function (s) {
      (s.blocks || []).forEach(function (b) { if (b.type === 'command') total++; });
    });

    var favs = secciones.filter(function (s) { return Store.esFavorita(s.id); });

    var h = '<div class="hero"><h1>Todo en Linux</h1>' +
      '<p>Curso de referencia sobre Linux y Ubuntu: sistema de archivos, terminal, ' +
      'permisos, procesos, redes, paquetes para datos y Python, rescate del sistema ' +
      'y CLI agénticas de IA. Todo en español, todo ejecutable.</p>' +
      '<div class="pagehead__meta" style="margin-top:1.5rem">' +
        '<span class="chip chip--primary">' + secciones.length + ' secciones</span>' +
        '<span class="chip chip--primary">' + total + ' comandos documentados</span>' +
        '<span class="chip">Pulsa <kbd>Ctrl</kbd>+<kbd>K</kbd> para buscar</span>' +
      '</div></div>';

    // Acceso inmediato a la solución de los fallos graves
    h += Render.bloques([{ type: 'sos', title: '¿El sistema ha fallado?',
      desc: 'Ve directo al escenario. Todas las soluciones están en pestañas, paso a paso.',
      items: [
        { t: 'No arranca: ¿por dónde empiezo?', d: 'Plan de emergencia', href: 'resc-triage' },
        { t: 'grub rescue> / sin menú de GRUB', d: 'Reparar GRUB', href: 'resc-grub' },
        { t: 'emergency mode · initramfs · pantalla negra', d: 'Fallos tras GRUB', href: 'resc-sistema' },
        { t: 'apt / dpkg roto', d: 'Paquetes rotos', href: 'resc-paquetes' }
      ]
    }]);

    if (favs.length) {
      h += '<h2 class="block__title">Tus favoritos</h2>' + Render.bloques([{
        type: 'tiles', items: favs.map(function (s) {
          return { id: s.id, t: s.title, d: resumir(s.lead, 95),
                   color: grupos[s.group].color };
        })
      }]) + '<hr>';
    }

    Object.keys(grupos).forEach(function (gid) {
      var g = grupos[gid];
      var items = secciones.filter(function (s) { return s.group === gid; });
      if (!items.length) return;
      h += '<h2 class="block__title" id="g-' + gid + '">' +
        '<span class="navgroup__dot" style="background:' + g.color + ';width:10px;height:10px"></span>' +
        global.Highlight.esc(g.title) + '</h2>';
      if (g.desc) h += '<p class="block__intro">' + g.desc + '</p>';
      h += Render.bloques([{
        type: 'tiles', items: items.map(function (s) {
          var n = 0;
          (s.blocks || []).forEach(function (b) { if (b.type === 'command') n++; });
          return { id: s.id, t: s.title, n: n ? n + ' cmd' : '',
                   d: resumir(s.lead, 105), color: g.color };
        })
      }]);
    });

    contenido.innerHTML = h;
    $('#crumbs').innerHTML = '<b>Inicio</b>';
    $('#toc').hidden = true;
    doc.title = 'Todo en Linux · Curso de referencia';
    $$('.navlink').forEach(function (a) { a.removeAttribute('aria-current'); });
    global.scrollTo({ top: 0 });
    cerrarMenu();
  }

  function enrutar(empujar) {
    var p = partesHash();
    if (!p.id) mostrarInicio();
    else mostrar(p.id, p.anc, empujar);
  }

  /* ============================ COPIAR CÓDIGO =========================== */
  function conectarCopias(ctx) {
    // Dentro del <summary> de un visor de script, los botones no deben plegarlo
    $$('.script__acts a, .script__acts button', ctx).forEach(function (el) {
      el.addEventListener('click', function (e) { e.stopPropagation(); });
    });
    $$('button.cmd__copy', ctx).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var txt = btn.getAttribute('data-copy');
        copiar(txt).then(function () {
          btn.classList.add('is-done');
          var etiqueta = $('span', btn);
          var antes = etiqueta.textContent;
          etiqueta.textContent = '¡Copiado!';
          setTimeout(function () {
            btn.classList.remove('is-done'); etiqueta.textContent = antes;
          }, 1600);
        });
      });
    });
  }

  function copiar(texto) {
    if (global.navigator.clipboard && global.isSecureContext) {
      return global.navigator.clipboard.writeText(texto);
    }
    // Reserva para file:// y contextos no seguros
    return new Promise(function (res) {
      var ta = doc.createElement('textarea');
      ta.value = texto;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy'); } catch (e) { /* sin portapapeles */ }
      doc.body.removeChild(ta); res();
    });
  }


  /* ======================= INTERACTIVOS DE LA TABLA ASCII ================ */

  /* Filtro en vivo sobre las tablas ASCII generadas. */
  function conectarTablasAscii(ctx) {
    $$('.asciitbl', ctx).forEach(function (caja) {
      var input = $('.asciitbl__filtro', caja);
      var cuenta = $('.asciitbl__cuenta', caja);
      var filas = $$('tbody tr', caja);
      if (!input) return;

      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        var n = 0;
        filas.forEach(function (tr) {
          var ok = !q || tr.getAttribute('data-b').indexOf(q) > -1;
          tr.hidden = !ok;
          if (ok) n++;
        });
        cuenta.textContent = n + ' de ' + filas.length;
        cuenta.classList.toggle('is-vacio', n === 0);
      });
    });
  }

  /* Conversor bidireccional texto ⇄ códigos. */
  function conectarConversorAscii(ctx) {
    var caja = $('[data-atool]', ctx);
    if (!caja) return;

    var txt = $('#atool-txt', caja);
    var rev = $('#atool-rev', caja);
    var A = global.AsciiData;

    function codigos(cadena, fn) {
      var out = [];
      for (var i = 0; i < cadena.length; i++) out.push(fn(cadena.charCodeAt(i)));
      return out.join(' ');
    }

    function actualizar() {
      var v = txt.value;
      $('#atool-dec', caja).textContent = codigos(v, function (c) { return c; }) || '—';
      $('#atool-hex', caja).textContent = codigos(v, function (c) {
        return '0x' + (c > 255 ? c.toString(16).toUpperCase().padStart(4, '0') : A.hex(c));
      }) || '—';
      $('#atool-oct', caja).textContent = codigos(v, function (c) { return A.oct(c); }) || '—';
      $('#atool-bin', caja).textContent = codigos(v, function (c) {
        return c > 255 ? c.toString(2).padStart(16, '0') : A.bin(c);
      }) || '—';
    }

    function actualizarInverso() {
      var partes = rev.value.trim().split(/[\s,;]+/).filter(Boolean);
      var salida = '', valido = true;
      partes.forEach(function (p) {
        var n = /^0x/i.test(p) ? parseInt(p, 16) : parseInt(p, 10);
        if (isNaN(n) || n < 0 || n > 0x10FFFF) { valido = false; return; }
        salida += String.fromCharCode(n);
      });
      var out = $('#atool-revout', caja);
      out.textContent = salida || (valido ? '—' : 'códigos no válidos');
      out.classList.toggle('is-error', !valido && partes.length > 0);
    }

    txt.addEventListener('input', actualizar);
    rev.addEventListener('input', actualizarInverso);
    actualizar();
    actualizarInverso();

    $$('.atool__copy', caja).forEach(function (b) {
      b.addEventListener('click', function () {
        var el = doc.getElementById(b.getAttribute('data-src'));
        if (!el) return;
        copiar(el.textContent).then(function () {
          var antes = b.textContent;
          b.textContent = '¡copiado!';
          setTimeout(function () { b.textContent = antes; }, 1400);
        });
      });
    });
  }


  /* Rejilla de símbolos: filtro por texto, filtro por categoría y copia. */
  function conectarSimbolos(ctx) {
    var caja = $('[data-symgrid]', ctx);
    if (!caja) return;

    var input = $('.symgrid__filtro', caja);
    var cuenta = $('.symgrid__cuenta', caja);
    var vacio = $('.symgrid__vacio', caja);
    var tarjetas = $$('.symcard', caja);
    var pills = $$('.sympill', caja);
    var cat = 'todos';

    function aplicar() {
      var q = input.value.trim().toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var n = 0;
      tarjetas.forEach(function (t) {
        var okCat = cat === 'todos' ||
                    (' ' + t.getAttribute('data-cats') + ' ').indexOf(' ' + cat + ' ') > -1;
        var okTxt = !q || t.getAttribute('data-b').indexOf(q) > -1;
        var ok = okCat && okTxt;
        t.hidden = !ok;
        if (ok) n++;
      });
      cuenta.textContent = n;
      vacio.hidden = n > 0;
    }

    input.addEventListener('input', aplicar);

    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        cat = p.getAttribute('data-cat');
        pills.forEach(function (o) { o.setAttribute('aria-pressed', o === p); });
        aplicar();
      });
    });

    /* Copiar al pulsar el símbolo o cualquiera de sus atajos. */
    $$('[data-copy-val]', caja).forEach(function (b) {
      b.addEventListener('click', function () {
        copiar(b.getAttribute('data-copy-val')).then(function () {
          b.classList.add('is-copiado');
          setTimeout(function () { b.classList.remove('is-copiado'); }, 900);
          toast('Copiado: ' + b.getAttribute('data-copy-val'));
        });
      });
    });
  }

  /* ======================== CALCULADORA DE PERMISOS ===================== */
  function conectarChmod(ctx) {
    $$('[data-chmodcalc]', ctx).forEach(function (caja) {
      var casillas = $$('input[data-w]', caja), especiales = $$('input[data-esp]', caja);
      var oct = $('.chcalc__oct', caja), tipo = $('.chcalc__tipo', caja), nom = $('.chcalc__nom', caja);

      function digitos() {
        var d = { u: 0, g: 0, o: 0 }, e = 0;
        casillas.forEach(function (c) { if (c.checked) d[c.dataset.w] += +c.dataset.v; });
        especiales.forEach(function (c) { if (c.checked) e += +c.dataset.esp; });
        return { e: e, u: d.u, g: d.g, o: d.o };
      }
      function simbolico(v) {
        function tri(n, esp, letra) {
          var x = n & 1;
          var ult = esp ? (x ? letra : letra.toUpperCase()) : (x ? 'x' : '-');
          return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + ult;
        }
        return (tipo.value === 'd' ? 'd' : '-') + tri(v.u, v.e & 4, 's') + tri(v.g, v.e & 2, 's') + tri(v.o, v.e & 1, 't');
      }
      function letras(n) { return (n & 4 ? 'r' : '') + (n & 2 ? 'w' : '') + (n & 1 ? 'x' : ''); }
      function explicar(v) {
        var d = tipo.value === 'd', out = [];
        var quien = { u: 'El propietario', g: 'El grupo', o: 'El resto' };
        ['u', 'g', 'o'].forEach(function (k) {
          var n = v[k], acc = [];
          if (d) {
            if (n & 4) acc.push('listar su contenido');
            if (n & 2) acc.push((n & 1) ? 'crear, renombrar y borrar archivos dentro' : 'nada más con w (sin x no sirve)');
            if (n & 1) acc.push('entrar (cd) y abrir lo que contiene');
          } else {
            if (n & 4) acc.push('leer');
            if (n & 2) acc.push('modificar');
            if (n & 1) acc.push('ejecutar');
          }
          out.push('<b>' + quien[k] + '</b> puede ' + (acc.length ? acc.join(', ') : '<b>nada</b>') + '.');
        });
        if (v.e & 4) out.push('<b>SUID</b>: ' + (d ? 'sin efecto en directorios.' : 'se ejecuta con los permisos del propietario. Peligroso si el dueño es root.'));
        if (v.e & 2) out.push('<b>SGID</b>: ' + (d ? 'lo creado dentro hereda el grupo del directorio (carpetas compartidas).' : 'se ejecuta con el grupo del archivo.'));
        if (v.e & 1) out.push('<b>Sticky</b>: ' + (d ? 'cada usuario solo puede borrar sus propios archivos (como /tmp).' : 'sin efecto en archivos en Linux.'));
        if (d && !(v.e & 6)) out.push('<i>En carpetas, <code>chmod</code> con 3 cifras no quita un SUID/SGID que ya tuvieran: usa <code>chmod g-s</code> o 5 cifras (<code>00' + v.u + v.g + v.o + '</code>).</i>');
        if (v.o & 2) out.push('<span class="chcalc__aviso">Cualquier usuario del sistema puede modificarlo.</span>');
        if (v.u === 0) out.push('<span class="chcalc__aviso">Ni siquiera el propietario tiene acceso.</span>');
        return out.map(function (t) { return '<li>' + t + '</li>'; }).join('');
      }
      function pintar(desdeOctal) {
        var v = digitos();
        var o = (v.e ? String(v.e) : '') + v.u + v.g + v.o;
        if (!desdeOctal) oct.value = o;
        oct.classList.remove('is-error');
        var n = nom.value.trim() || 'archivo';
        if (/[\s'"$`\\]/.test(n)) n = "'" + n.replace(/'/g, "'\\''") + "'";
        $('.chcalc__sim', caja).textContent = simbolico(v);
        $('.chcalc__cmd1', caja).textContent = 'chmod ' + o + ' ' + n;
        var simb = 'u=' + letras(v.u) + ',g=' + letras(v.g) + ',o=' + letras(v.o);
        var esp = [];
        if (v.e & 4) esp.push('u+s'); if (v.e & 2) esp.push('g+s'); if (v.e & 1) esp.push('+t');
        $('.chcalc__cmd2', caja).textContent = 'chmod ' + simb + (esp.length ? ',' + esp.join(',') : '') + ' ' + n;
        $('.chcalc__exp', caja).innerHTML = explicar(v);
      }
      function desdeOctal() {
        var t = oct.value.trim();
        if (!/^[0-7]{3,4}$/.test(t)) { oct.classList.add('is-error'); return; }
        if (t.length === 3) t = '0' + t;
        var e = +t[0], d = { u: +t[1], g: +t[2], o: +t[3] };
        casillas.forEach(function (c) { c.checked = !!(d[c.dataset.w] & +c.dataset.v); });
        especiales.forEach(function (c) { c.checked = !!(e & +c.dataset.esp); });
        pintar(true);
      }
      casillas.concat(especiales).forEach(function (c) { c.addEventListener('change', function () { pintar(false); }); });
      oct.addEventListener('input', desdeOctal);
      tipo.addEventListener('change', function () { pintar(true); });
      nom.addEventListener('input', function () { pintar(true); });
      $$('[data-preset]', caja).forEach(function (b) {
        b.addEventListener('click', function () {
          oct.value = b.dataset.preset;
          var t = b.dataset.preset;
          tipo.value = /^(755|700|775|2775|1777)$/.test(t) ? 'd' : 'f';
          // Nombre de ejemplo coherente con el tipo (sin pisar uno escrito por el usuario)
          if (nom.value === 'archivo.txt' || nom.value === 'carpeta') nom.value = tipo.value === 'd' ? 'carpeta' : 'archivo.txt';
          desdeOctal();
        });
      });
      $$('[data-copiar]', caja).forEach(function (b) {
        b.addEventListener('click', function () {
          copiar($('.' + b.dataset.copiar, caja).textContent).then(function () {
            var antes = b.textContent; b.textContent = '¡copiado!';
            setTimeout(function () { b.textContent = antes; }, 1400);
          });
        });
      });
      desdeOctal();
    });
  }

  /* ======================== CONSTRUCTOR DE COMANDOS ===================== */
  /* Comillas de shell solo cuando hacen falta. ~/ se deja fuera para que
     la shell lo siga expandiendo. */
  function citar(v) {
    v = String(v);
    if (v === '') return "''";
    if (v === '~' || /^[A-Za-z0-9_\/.,:=@%+^-]+$/.test(v)) return v;
    if (v.indexOf('~/') === 0) return '~/' + citar(v.slice(2));
    // Con $VAR o $(…) se usan comillas dobles para que la shell los expanda
    if (/\$[A-Za-z_{(]/.test(v) && !/["`\\]/.test(v)) return '"' + v + '"';
    return "'" + v.replace(/'/g, "'\\''") + "'";
  }

  function construirGenerico(b, v) {
    var grupos = { pre: [], start: [], mid: [], end: [] };
    (b.fields || []).forEach(function (f) {
      var val = v[f.k], parte = null;
      var ayuda = function (h) { return String(h || '').replace(/\{v\}/g, global.Highlight.esc(String(val))); };
      if (f.type === 'check') {
        if (val) parte = { t: f.flag, d: ayuda(f.help), w: f.warn, corto: /^-[A-Za-z0-9]$/.test(f.flag) };
      } else if (f.type === 'select') {
        var op = (f.options || []).filter(function (o) { return o[0] === val; })[0];
        if (op && op[0] !== '') {
          var tok = f.flag ? f.flag + (f.join || ' ') + citar(op[0]) : op[0];
          parte = { t: tok, d: ayuda(op[2] || f.help), w: op[3], corto: !f.flag && /^-[A-Za-z0-9]$/.test(op[0]) };
        }
      } else {
        val = String(val || '').trim();
        if (val !== '') {
          var q = f.raw ? val : citar(val);
          parte = { t: f.pos ? q : f.flag + (f.join === undefined ? ' ' : f.join) + q, d: ayuda(f.help), w: f.warn };
        } else if (f.req) {
          parte = { t: '<' + f.label.toUpperCase() + '>', d: 'Falta: ' + f.label, w: 'Completa «' + f.label + '»' };
        }
      }
      if (parte) grupos[f.at || 'mid'].push(parte);
    });
    var partes = grupos.pre.concat(b.prefix ? [{ t: b.prefix, d: b.prefixDesc || '' }] : [], grupos.start, grupos.mid, grupos.end);

    // Línea del comando: con combine, las opciones cortas sin valor se agrupan (-czvf)
    var tokens = [];
    if (b.combine) {
      var letras = '', pos = -1;
      partes.forEach(function (p) {
        if (p.corto) { if (pos < 0) { pos = tokens.length; tokens.push(''); } letras += p.t.slice(1); }
        else tokens.push(p.t);
      });
      if (pos >= 0) tokens[pos] = '-' + letras;
    } else {
      tokens = partes.map(function (p) { return p.t; });
    }
    return { lines: [tokens.join(' ')], parts: partes };
  }

  function conectarBuilders(ctx) {
    $$('[data-builder]', ctx).forEach(function (caja) {
      var b = Render.builders[caja.getAttribute('data-builder')];
      if (!b) return;
      var controles = $$('[data-k]', caja);
      var salida = $('.bld__cmd', caja), lista = $('.bld__exp', caja), avisos = $('.bld__warns', caja);

      function valores() {
        var v = {};
        controles.forEach(function (c) { v[c.dataset.k] = c.type === 'checkbox' ? c.checked : c.value; });
        return v;
      }
      function pintar() {
        var v = valores();
        var r = typeof b.build === 'function' ? b.build(v, citar) : construirGenerico(b, v);
        salida.textContent = r.lines.join('\n');
        lista.innerHTML = (r.parts || []).filter(function (p) { return p.d; }).map(function (p) {
          return '<li' + (p.w ? ' class="is-warn"' : '') + '><code>' + global.Highlight.esc(p.t) + '</code><span>' + p.d + '</span></li>';
        }).join('');
        var ws = (r.parts || []).filter(function (p) { return p.w && typeof p.w === 'string'; }).map(function (p) { return p.w; })
                  .concat(r.warns || [], typeof b.avisos === 'function' ? (b.avisos(v) || []) : []);
        avisos.innerHTML = ws.map(function (w) { return '<div class="bld__warn">' + Render.ICO.warn + '<span>' + w + '</span></div>'; }).join('');
      }
      controles.forEach(function (c) { c.addEventListener(c.type === 'checkbox' || c.tagName === 'SELECT' ? 'change' : 'input', pintar); });
      $$('[data-preset]', caja).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = b.presets[+btn.dataset.preset];
          // Un caso típico parte de los valores por defecto y aplica los suyos
          controles.forEach(function (c) {
            var f = (b.fields || []).filter(function (x) { return x.k === c.dataset.k; })[0] || {};
            var nuevo = p.v.hasOwnProperty(c.dataset.k) ? p.v[c.dataset.k] : f.value;
            if (c.type === 'checkbox') c.checked = !!nuevo;
            else if (c.tagName === 'SELECT') c.value = nuevo !== undefined ? nuevo : c.options[0].value;
            else c.value = nuevo || '';
          });
          $$('[data-preset]', caja).forEach(function (o) { o.setAttribute('aria-pressed', o === btn); });
          pintar();
        });
      });
      $('.bld__copy', caja).addEventListener('click', function () {
        var btn = this;
        copiar(salida.textContent).then(function () {
          var e = $('span', btn), antes = e.textContent;
          btn.classList.add('is-done'); e.textContent = '¡Copiado!';
          setTimeout(function () { btn.classList.remove('is-done'); e.textContent = antes; }, 1600);
        });
      });
      pintar();
    });
  }

  /* =============================== PESTAÑAS ============================= */
  function seleccionarTab(caja, boton, enfocar) {
    $$('.tabs__tab', caja).forEach(function (b) {
      if (b.closest('[data-tabs]') !== caja) return;   // pestañas anidadas
      var on = b === boton;
      b.setAttribute('aria-selected', on);
      b.setAttribute('tabindex', on ? '0' : '-1');
      var panel = doc.getElementById(b.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (enfocar) boton.focus();
    boton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function conectarTabs(ctx) {
    $$('[data-tabs]', ctx).forEach(function (caja) {
      var lista = $('.tabs__list', caja);
      var botones = $$('.tabs__tab', lista);
      botones.forEach(function (b, i) {
        b.addEventListener('click', function () {
          seleccionarTab(caja, b, false);
          // Actualiza la URL para que la pestaña se pueda compartir o recargar
          var p = partesHash();
          if (p.id) global.history.replaceState(null, '', '#' + p.id + '/' + b.getAttribute('aria-controls'));
        });
        b.addEventListener('keydown', function (e) {
          var j = null;
          if (e.key === 'ArrowRight') j = (i + 1) % botones.length;
          else if (e.key === 'ArrowLeft') j = (i - 1 + botones.length) % botones.length;
          else if (e.key === 'Home') j = 0;
          else if (e.key === 'End') j = botones.length - 1;
          if (j === null) return;
          e.preventDefault();
          botones[j].click();
          botones[j].focus();
        });
      });
    });
  }

  /* Si el destino de un enlace está dentro de una pestaña oculta, ábrela
     (y también las pestañas que la contengan, si están anidadas). */
  function activarTabDe(el) {
    var cadena = [];
    var nodo = el;
    while (nodo && nodo !== doc.body) {
      if (nodo.classList && nodo.classList.contains('tabs__panel')) cadena.unshift(nodo);
      nodo = nodo.parentNode;
    }
    cadena.forEach(function (panel) {
      var boton = doc.getElementById('tab-' + panel.id);
      var caja = panel.closest('[data-tabs]');
      if (boton && caja) seleccionarTab(caja, boton, false);
    });
  }

  /* ================================ TOASTS ============================== */
  function toast(msg) {
    var caja = $('#toasts');
    var t = doc.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    caja.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  /* ============================ PALETA (Ctrl+K) ========================= */
  var pal = { abierta: false, sel: 0, resultados: [] };

  function abrirPaleta(inicial) {
    pal.abierta = true;
    var p = $('#palette');
    p.hidden = false;
    var input = $('#palette-input');
    input.value = inicial || '';
    buscarEnPaleta();
    input.focus(); input.select();
  }

  function cerrarPaleta() {
    pal.abierta = false;
    $('#palette').hidden = true;
  }

  var ETIQUETA_TIPO = { comando: 'comando', seccion: 'sección', apartado: 'apartado' };

  function buscarEnPaleta() {
    var q = $('#palette-input').value;
    var caja = $('#palette-results');

    if (!q.trim()) {
      // Sin consulta: sugiere lo último visitado y las secciones favoritas
      var sug = [];
      var ult = Store.get().ultima;
      if (ult && porId[ult]) sug.push({ hash: ult, tipo: 'seccion', titulo: porId[ult].title, sub: 'Continuar donde lo dejaste' });
      secciones.forEach(function (s) {
        if (Store.esFavorita(s.id)) sug.push({ hash: s.id, tipo: 'seccion', titulo: s.title, sub: 'Favorito' });
      });
      if (!sug.length) {
        secciones.slice(0, 6).forEach(function (s) {
          sug.push({ hash: s.id, tipo: 'seccion', titulo: s.title, sub: grupos[s.group].title });
        });
      }
      pal.resultados = sug; pal.sel = 0;
      caja.innerHTML = '<div class="palette__group">Sugerencias</div>' + filasPaleta(sug, '');
      conectarFilas();
      return;
    }

    var res = Search.buscar(q, 24);
    pal.resultados = res; pal.sel = 0;

    if (!res.length) {
      caja.innerHTML = '<div class="palette__empty">Sin resultados para <b>' +
        global.Highlight.esc(q) + '</b>.<br>Prueba con el nombre de un comando: <code>grep</code>, <code>chmod</code>, <code>systemctl</code>.</div>';
      return;
    }

    var cmds = res.filter(function (r) { return r.tipo === 'comando'; });
    var otros = res.filter(function (r) { return r.tipo !== 'comando'; });
    var html = '';
    if (cmds.length) html += '<div class="palette__group">Comandos</div>' + filasPaleta(cmds, q);
    if (otros.length) html += '<div class="palette__group">Secciones y apartados</div>' + filasPaleta(otros, q);
    caja.innerHTML = html;
    conectarFilas();
    resaltarSeleccion();
  }

  function filasPaleta(lista, q) {
    return lista.map(function (r, i) {
      var idx = pal.resultados.indexOf(r);
      var ico = r.tipo === 'comando' ? '&gt;_' : (r.tipo === 'apartado' ? '§' : '▤');
      return '<button class="pres" type="button" data-i="' + idx + '" data-hash="' + global.Highlight.esc(r.hash) + '">' +
        '<span class="pres__ico">' + ico + '</span>' +
        '<span class="pres__main"><span class="pres__t">' + Search.marcar(r.titulo, q) + '</span>' +
        '<span class="pres__s">' + global.Highlight.esc(r.sub || '') + '</span></span>' +
        '<span class="pres__kind">' + (ETIQUETA_TIPO[r.tipo] || '') + '</span></button>';
    }).join('');
  }

  function conectarFilas() {
    $$('#palette-results .pres').forEach(function (b) {
      b.addEventListener('click', function () {
        irA(b.getAttribute('data-hash'));
      });
      b.addEventListener('mousemove', function () {
        pal.sel = parseInt(b.getAttribute('data-i'), 10) || 0;
        resaltarSeleccion();
      });
    });
  }

  function resaltarSeleccion() {
    $$('#palette-results .pres').forEach(function (b) {
      var on = parseInt(b.getAttribute('data-i'), 10) === pal.sel;
      b.classList.toggle('is-sel', on);
      if (on) b.scrollIntoView({ block: 'nearest' });
    });
  }

  function moverSeleccion(d) {
    if (!pal.resultados.length) return;
    pal.sel = (pal.sel + d + pal.resultados.length) % pal.resultados.length;
    resaltarSeleccion();
  }

  function irA(hash) {
    cerrarPaleta();
    global.location.hash = '#' + hash;
  }

  /* ============================== MENÚ MÓVIL ============================ */
  function abrirMenu() { doc.body.classList.add('nav-open'); }
  function cerrarMenu() { doc.body.classList.remove('nav-open'); }

  /* =========================== BARRA DE LECTURA ========================= */
  function actualizarBarraLectura() {
    var h = doc.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    $('#readbar').style.width = pct.toFixed(2) + '%';
  }

  /* ================================ ATAJOS ============================== */
  function esCampo(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  function atajos(e) {
    // Paleta: Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); pal.abierta ? cerrarPaleta() : abrirPaleta(); return;
    }

    if (pal.abierta) {
      if (e.key === 'Escape') { e.preventDefault(); cerrarPaleta(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); moverSeleccion(1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); moverSeleccion(-1); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        var r = pal.resultados[pal.sel];
        if (r) irA(r.hash);
        return;
      }
      return;
    }

    if (esCampo(e.target)) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }

    // "/" abre la paleta
    if (e.key === '/') { e.preventDefault(); abrirPaleta(); return; }

    // j / k: sección siguiente / anterior
    var p = partesHash();
    var actual = p.id ? porId[p.id] : null;
    if (e.key === 'j' || e.key === 'J') {
      var sig = actual ? secciones[actual._i + 1] : secciones[0];
      if (sig) { e.preventDefault(); global.location.hash = '#' + sig.id; }
      return;
    }
    if (e.key === 'k' || e.key === 'K') {
      var ant = actual ? secciones[actual._i - 1] : null;
      if (ant) { e.preventDefault(); global.location.hash = '#' + ant.id; }
      return;
    }
    // g: inicio
    if (e.key === 'g' || e.key === 'G') { e.preventDefault(); global.location.hash = ''; enrutar(); return; }
    // t: cambia de tema
    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      var i = ORDEN_TEMA.indexOf(Store.get().tema);
      Store.setTema(ORDEN_TEMA[(i + 1) % ORDEN_TEMA.length]); aplicarTema();
      toast(ETIQUETA_TEMA[Store.get().tema]);
      return;
    }
    // m: marcar como leída
    if ((e.key === 'm' || e.key === 'M') && actual) {
      e.preventDefault();
      var b = $('#btn-leida'); if (b) b.click();
      return;
    }
    // ?: ayuda de atajos
    if (e.key === '?') { e.preventDefault(); global.location.hash = '#atajos'; return; }
  }

  /* =============================== ARRANQUE ============================= */
  function iniciar() {
    aplicarTema();
    pintarSidebar();
    actualizarProgreso();

    var n = Search.construir(secciones, grupos);
    var cont = $('#idx-count');
    if (cont) cont.textContent = n;

    // Tema
    $('#btn-tema').addEventListener('click', function () {
      var i = ORDEN_TEMA.indexOf(Store.get().tema);
      Store.setTema(ORDEN_TEMA[(i + 1) % ORDEN_TEMA.length]);
      aplicarTema();
    });

    // Paleta
    $('#btn-buscar').addEventListener('click', function () { abrirPaleta(); });
    $('#palette-input').addEventListener('input', buscarEnPaleta);
    $('#palette').addEventListener('mousedown', function (e) {
      if (e.target === $('#palette')) cerrarPaleta();
    });

    // Menú móvil
    $('#btn-menu').addEventListener('click', abrirMenu);
    $('#btn-cerrar-menu').addEventListener('click', cerrarMenu);
    $('#backdrop').addEventListener('click', cerrarMenu);

    // Filtro del menú
    $('#filtro').addEventListener('input', function (e) { filtrarMenu(e.target.value); });

    // Enrutado
    global.addEventListener('hashchange', function () { enrutar(false); });
    doc.addEventListener('keydown', atajos);
    global.addEventListener('scroll', actualizarBarraLectura, { passive: true });

    Store.suscribir(function (_, evento) {
      if (evento === 'leidas' || evento === 'favoritas') actualizarProgreso();
    });

    enrutar(false);
    actualizarBarraLectura();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(window);
