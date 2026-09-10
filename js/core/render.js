/* ==========================================================================
   render.js — convierte los datos de contenido en HTML
   Cada sección es un objeto con un array `blocks`; cada bloque tiene un
   `type` que se corresponde con una función de este módulo.
   ========================================================================== */
(function (global) {
  'use strict';

  var H = global.Highlight;
  var esc = H.esc;

  /* --------------------------- iconos en línea --------------------------- */
  var ICO = {
    copiar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    ok:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    tip:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z"/></svg>',
    warn:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    info:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    descargar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>'
  };

  /* ---------------------------- bloque: cmd ------------------------------ */
  function bloqueCmd(b) {
    var lineas = b.lines || [];
    var plano = H.textoPlano(lineas);
    return '<div class="cmd">' +
      '<div class="cmd__head">' +
        '<div class="cmd__dots"><i></i><i></i><i></i></div>' +
        '<span class="cmd__label">' + esc(b.label || 'terminal') + '</span>' +
        '<button class="cmd__copy" type="button" data-copy="' + esc(plano) + '">' +
          ICO.copiar + '<span>Copiar</span></button>' +
      '</div>' +
      '<pre class="cmd__body"><code>' + H.resaltar(lineas) + '</code></pre>' +
    '</div>';
  }

  /* --------------------------- bloque: callout --------------------------- */
  function bloqueCallout(b) {
    var v = b.variant || 'info';
    return '<div class="callout callout--' + v + '">' +
      '<span class="callout__icon">' + (ICO[v] || ICO.info) + '</span>' +
      '<div class="callout__body">' +
        (b.title ? '<div class="callout__title">' + esc(b.title) + '</div>' : '') +
        b.html +
      '</div></div>';
  }

  /* ---------------------------- bloque: table ---------------------------- */
  function bloqueTable(b) {
    var h = '<div class="tablewrap"><table>';
    if (b.caption) h += '<caption class="visually-hidden">' + esc(b.caption) + '</caption>';
    if (b.head) {
      h += '<thead><tr>';
      for (var i = 0; i < b.head.length; i++) h += '<th>' + b.head[i] + '</th>';
      h += '</tr></thead>';
    }
    h += '<tbody>';
    (b.rows || []).forEach(function (fila) {
      h += '<tr>';
      fila.forEach(function (celda, j) {
        h += '<td' + (j === 0 && b.monoFirst !== false ? ' class="col-mono"' : '') + '>' + celda + '</td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* ---------------------------- bloque: steps ---------------------------- */
  function bloqueSteps(b) {
    var h = '<ol class="steps">';
    (b.items || []).forEach(function (it) {
      h += '<li>' + (it.t ? '<div class="steps__t">' + esc(it.t) + '</div>' : '') +
           (it.html || '') + (it.cmd ? bloqueCmd(it.cmd) : '') + '</li>';
    });
    return h + '</ol>';
  }

  /* -------------------------- bloque: accordion -------------------------- */
  function bloqueAccordion(b) {
    var h = '';
    (b.items || []).forEach(function (it) {
      h += '<details class="acc"' + (it.open ? ' open' : '') + '><summary>' + esc(it.t) + '</summary>' +
           '<div class="acc__body">' + (it.html || '') +
           (it.cmd ? bloqueCmd(it.cmd) : '') + '</div></details>';
    });
    return h;
  }

  /* ----------------------------- bloque: grid ---------------------------- */
  function bloqueGrid(b) {
    var h = '<div class="grid grid--' + (b.cols || 2) + '">';
    (b.items || []).forEach(function (it) {
      if (it.value !== undefined) {
        h += '<div class="stat"><div class="stat__value">' + esc(it.value) + '</div>' +
             '<div class="stat__label">' + esc(it.label || '') + '</div>' +
             (it.note ? '<div class="stat__note">' + it.note + '</div>' : '') + '</div>';
      } else {
        h += '<div class="card"><h4 style="margin-bottom:.5rem">' + esc(it.t || '') + '</h4>' +
             '<div style="font-size:var(--fs-sm);color:var(--text-soft)">' + (it.html || it.d || '') + '</div></div>';
      }
    });
    return h + '</div>';
  }

  /* --------------------------- bloque: command --------------------------- */
  /* Ficha completa de un comando: sinopsis, descripción, opciones, ejemplos. */
  function bloqueCommand(b) {
    var h = '<article class="cmdcard" id="cmd-' + esc(b.name.replace(/\W+/g, '-')) + '">';
    h += '<div class="cmdcard__top">' +
           '<code class="cmdcard__name">' + esc(b.name) + '</code>' +
           '<span class="cmdcard__tag">' + esc(b.tagline || '') + '</span>' +
           (b.level ? '<span class="level level--' + b.level + '">' + esc(b.level) + '</span>' : '') +
         '</div><div class="cmdcard__inner">';

    if (b.synopsis) h += '<div class="cmdcard__syn">' + esc(b.synopsis) + '</div>';
    if (b.desc) h += '<p>' + b.desc + '</p>';

    if (b.options && b.options.length) {
      h += bloqueTable({
        head: ['Opción', 'Qué hace'],
        rows: b.options.map(function (o) { return ['<code>' + esc(o[0]) + '</code>', o[1]]; }),
        monoFirst: false
      });
    }

    (b.examples || []).forEach(function (ej) { h += bloqueCmd(ej); });
    (b.notes || []).forEach(function (n) { h += bloqueCallout(n); });

    if (b.seealso && b.seealso.length) {
      h += '<div class="cmdcard__seealso"><span>Relacionados:</span>' +
           b.seealso.map(function (s) {
             return '<span class="chip chip--mono">' + esc(s) + '</span>';
           }).join('') + '</div>';
    }
    return h + '</div></article>';
  }

  /* -------------------------- bloque: downloads -------------------------- */
  function bloqueDownloads(b) {
    var h = '';
    (b.items || []).forEach(function (it) {
      h += '<a class="dl" href="' + esc(it.href) + '" download>' +
        '<span class="dl__ico">' + ICO.descargar + '</span>' +
        '<span class="dl__main"><span class="dl__t">' + esc(it.title) + '</span>' +
        '<span class="dl__d">' + esc(it.desc || '') + '</span></span>' +
        '<span class="dl__size">' + esc(it.size || '') + '</span></a>';
    });
    return h;
  }

  /* --------------------------- bloque: tilegrid -------------------------- */
  function bloqueTiles(b) {
    var h = '<div class="tilegrid">';
    (b.items || []).forEach(function (it) {
      h += '<a class="tile" href="#' + esc(it.id) + '" style="border-top-color:' + (it.color || 'var(--primary)') + '">' +
        '<span class="tile__t">' + esc(it.t) +
        (it.n ? '<span class="tile__n">' + esc(it.n) + '</span>' : '') + '</span>' +
        '<span class="tile__d">' + esc(it.d || '') + '</span></a>';
    });
    return h + '</div>';
  }


  /* -------------------------- bloque: asciitable ------------------------- */
  /* Genera la tabla desde AsciiData en lugar de almacenar 256 filas de HTML. */
  function bloqueAsciiTable(b) {
    var filas = global.AsciiData.filas(b.rango);
    var conNombre = b.rango === 'control';
    var id = 'at-' + b.rango;

    var h = '<div class="asciitbl" data-ascii="' + b.rango + '">';
    h += '<div class="asciitbl__bar">' +
      '<input type="search" class="asciitbl__filtro" id="' + id + '-f" ' +
      'placeholder="Filtrar por carácter, código o descripción…" ' +
      'aria-label="Filtrar la tabla ASCII">' +
      '<span class="asciitbl__cuenta" id="' + id + '-n">' + filas.length + ' de ' + filas.length + '</span>' +
      '</div>';

    h += '<div class="tablewrap"><table class="asciitbl__t"><thead><tr>' +
      '<th>Dec</th><th>Hex</th><th>Oct</th><th>Bin</th><th>Car.</th>' +
      (conNombre ? '<th>Nombre</th><th>Teclado</th>' : '<th>HTML</th>') +
      '<th>Notas</th></tr></thead><tbody>';

    filas.forEach(function (f) {
      var busca = (f.dec + ' ' + f.hex + ' ' + f.oct + ' ' + f.car + ' ' + f.nom + ' ' +
                   f.tecla + ' ' + f.desc)
                   .replace(/<[^>]+>/g, '').toLowerCase()
                   .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      h += '<tr data-b="' + esc(busca) + '">' +
        '<td class="col-mono">' + f.dec + '</td>' +
        '<td class="col-mono">0x' + f.hex + '</td>' +
        '<td class="col-mono">' + f.oct + '</td>' +
        '<td class="col-mono asciitbl__bin">' + f.bin + '</td>' +
        '<td class="asciitbl__car">' + esc(f.car) + '</td>' +
        (conNombre
          ? '<td class="col-mono">' + esc(f.nom) + '</td><td>' + (f.tecla ? '<kbd>' + esc(f.tecla) + '</kbd>' : '') + '</td>'
          : '<td class="col-mono">' + f.ent + '</td>') +
        '<td>' + (f.desc || '') + '</td>' +
      '</tr>';
    });

    return h + '</tbody></table></div></div>';
  }

  /* --------------------------- bloque: asciitool ------------------------- */
  /* Conversor bidireccional texto ⇄ códigos. La lógica se conecta en app.js. */
  function bloqueAsciiTool() {
    return '<div class="atool" data-atool>' +
      '<div class="atool__fila">' +
        '<label class="atool__lbl" for="atool-txt">Texto</label>' +
        '<input class="atool__in" id="atool-txt" type="text" value="Hola Ñ" ' +
               'autocomplete="off" spellcheck="false" placeholder="Escribe aquí…">' +
      '</div>' +
      '<div class="atool__salidas">' +
        ['dec', 'hex', 'oct', 'bin'].map(function (k) {
          return '<div class="atool__out"><span class="atool__lbl">' +
            { dec: 'Decimal', hex: 'Hexadecimal', oct: 'Octal', bin: 'Binario' }[k] +
            '</span><code class="atool__val" id="atool-' + k + '"></code>' +
            '<button class="atool__copy" type="button" data-src="atool-' + k + '">copiar</button></div>';
        }).join('') +
      '</div>' +
      '<div class="atool__fila">' +
        '<label class="atool__lbl" for="atool-rev">Códigos decimales → texto</label>' +
        '<input class="atool__in" id="atool-rev" type="text" value="76 105 110 117 120" ' +
               'autocomplete="off" spellcheck="false" placeholder="72 111 108 97">' +
      '</div>' +
      '<div class="atool__res">Resultado: <code class="atool__val" id="atool-revout"></code></div>' +
      '<p class="atool__nota">Los códigos por encima de 127 dependen de la codificación. ' +
      'En Linux, con UTF-8, un carácter como <code>ñ</code> ocupa <b>dos bytes</b> ' +
      '(0xC3 0xB1) aunque su punto Unicode sea 241.</p>' +
    '</div>';
  }


  /* -------------------------- bloque: simbolos --------------------------- */
  /* Rejilla de tarjetas ("diapositivas"): símbolo grande, nombre, atajos
     de teclado y copia con un clic. Se filtra por categoría y por texto. */
  function bloqueSimbolos() {
    var lista = global.AsciiData.simbolos();
    var cats = global.AsciiData.categorias;

    var h = '<div class="symgrid" data-symgrid>';

    h += '<div class="symgrid__bar">' +
      '<input type="search" class="symgrid__filtro" ' +
      'placeholder="Buscar un símbolo por nombre, código o carácter…" ' +
      'aria-label="Buscar símbolo">' +
      '<span class="symgrid__cuenta">' + lista.length + '</span></div>';

    h += '<div class="symgrid__cats" role="group" aria-label="Filtrar por categoría">';
    cats.forEach(function (c, i) {
      h += '<button class="sympill" type="button" data-cat="' + c[0] + '"' +
           (i === 0 ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' +
           esc(c[1]) + '</button>';
    });
    h += '</div>';

    h += '<div class="symgrid__items">';
    lista.forEach(function (s) {
      var busca = (s.car + ' ' + s.nombre + ' ' + s.dec + ' ' + s.hex + ' ' +
                   s.alt + ' ' + s.nota).replace(/<[^>]+>/g, '').toLowerCase()
                   .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      h += '<article class="symcard" data-cats="' + esc(s.cats) + '" data-b="' + esc(busca) + '">' +
        '<button class="symcard__glifo" type="button" data-copy-val="' + esc(s.car) + '" ' +
          'title="Copiar el carácter ' + esc(s.car) + '">' + esc(s.car) + '</button>' +
        '<div class="symcard__nombre">' + esc(s.nombre) + '</div>' +
        '<div class="symcard__codigos">' +
          '<code title="Código decimal">' + s.dec + '</code>' +
          '<code title="Código hexadecimal">0x' + s.hex.toUpperCase() + '</code>' +
        '</div>' +
        (s.nota ? '<div class="symcard__nota">' + s.nota + '</div>' : '') +
        '<div class="symcard__teclas">' +
          '<button class="symkey" type="button" data-copy-val="' + esc(s.linux) + '" ' +
            'title="Linux: pulsa Ctrl+Shift+U, escribe el código y Enter">' +
            '<span class="symkey__so">Linux</span><kbd>' + esc(s.linux) + '</kbd></button>' +
          (s.alt ? '<button class="symkey" type="button" data-copy-val="' + esc(s.alt) + '" ' +
            'title="Windows: mantén Alt y teclea el número en el teclado numérico">' +
            '<span class="symkey__so">Win</span><kbd>' + esc(s.alt) + '</kbd></button>' : '') +
        '</div>' +
      '</article>';
    });

    return h + '</div><p class="symgrid__vacio" hidden>Ningún símbolo coincide con la búsqueda.</p></div>';
  }

  /* ----------------------------- despachador ----------------------------- */
  var MANEJADORES = {
    prose:     function (b) { return b.html; },
    h2:        function (b) { return '<h2 class="block__title" id="' + esc(b.id) + '">' + esc(b.text) +
                              ' <a class="anchor" href="#' + esc(b.id) + '" aria-label="Enlace a esta sección">#</a></h2>'; },
    h3:        function (b) { return '<h3 class="subblock__title" id="' + esc(b.id) + '">' + esc(b.text) + '</h3>'; },
    cmd:       bloqueCmd,
    callout:   bloqueCallout,
    table:     bloqueTable,
    steps:     bloqueSteps,
    accordion: bloqueAccordion,
    grid:      bloqueGrid,
    command:   bloqueCommand,
    downloads: bloqueDownloads,
    tiles:     bloqueTiles,
    asciitable: bloqueAsciiTable,
    asciitool:  bloqueAsciiTool,
    simbolos:   bloqueSimbolos,
    ascii:     function (b) { return '<div class="ascii">' + esc(b.text) + '</div>'; },
    keys:      function (b) {
      var h = '<div class="kbdlist">';
      (b.items || []).forEach(function (it) {
        h += '<div class="kbdrow"><span class="kbdrow__keys">' +
          it.k.map(function (k) { return '<kbd>' + esc(k) + '</kbd>'; }).join('') +
          '</span><span class="kbdrow__what">' + esc(it.d) + '</span></div>';
      });
      return h + '</div>';
    }
  };

  function bloques(lista) {
    var h = '';
    (lista || []).forEach(function (b) {
      var fn = MANEJADORES[b.type];
      if (!fn) { h += '<!-- bloque desconocido: ' + esc(b.type) + ' -->'; return; }
      h += fn(b);
    });
    return h;
  }

  /* ----------------------- índice de la sección (TOC) --------------------- */
  function toc(seccion) {
    var items = [];
    (seccion.blocks || []).forEach(function (b) {
      if (b.type === 'h2') items.push({ id: b.id, text: b.text, lvl: 2 });
      else if (b.type === 'h3') items.push({ id: b.id, text: b.text, lvl: 3 });
      else if (b.type === 'command') {
        items.push({ id: 'cmd-' + b.name.replace(/\W+/g, '-'), text: b.name, lvl: 3 });
      }
    });
    return items;
  }

  /* --------------------------- sección completa -------------------------- */
  function seccion(sec, grupo) {
    var h = '<header class="pagehead">';
    h += '<div class="pagehead__eyebrow">' +
      '<span class="dot" style="background:' + (grupo ? grupo.color : 'var(--primary)') + '"></span>' +
      esc(grupo ? grupo.title : '') + '</div>';
    h += '<h1>' + esc(sec.title) + '</h1>';
    if (sec.lead) h += '<p class="pagehead__lead">' + sec.lead + '</p>';

    h += '<div class="pagehead__meta">';
    if (sec.level) h += '<span class="chip">Nivel: <b class="level level--' + sec.level + '">' + esc(sec.level) + '</b></span>';
    if (sec.tags && sec.tags.length) {
      h += sec.tags.slice(0, 8).map(function (t) {
        return '<span class="chip chip--mono">' + esc(t) + '</span>';
      }).join('');
    }
    h += '</div></header>';

    h += '<div class="sectionbody">' + bloques(sec.blocks) + '</div>';
    return h;
  }

  global.Render = {
    seccion: seccion,
    bloques: bloques,
    toc: toc,
    ICO: ICO
  };
})(window);
