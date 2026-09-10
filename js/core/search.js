/* ==========================================================================
   search.js — índice de búsqueda de texto completo sobre TODO el contenido
   A diferencia de la app anterior (que solo filtraba los títulos del menú),
   aquí se indexan también los comandos, las opciones, los ejemplos y la prosa.
   ========================================================================== */
(function (global) {
  'use strict';

  var indice = [];   // { id, tipo, titulo, sub, seccion, texto, peso }

  function limpiar(html) {
    return String(html)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(nbsp|amp|lt|gt|quot|#\d+);/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizar(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // quita acentos
  }

  /* Construye el índice a partir del catálogo de secciones. */
  function construir(secciones, grupos) {
    indice = [];
    secciones.forEach(function (sec) {
      var grupo = grupos[sec.group] || { title: '' };
      var partes = [sec.title, sec.lead || '', (sec.tags || []).join(' ')];

      // 1. La sección como entrada principal
      (sec.blocks || []).forEach(function (b) {
        if (b.type === 'prose') partes.push(limpiar(b.html));
        else if (b.type === 'h2' || b.type === 'h3') partes.push(b.text);
        else if (b.type === 'cmd') partes.push((b.lines || []).join(' '));
        else if (b.type === 'callout') partes.push((b.title || '') + ' ' + limpiar(b.html));
        else if (b.type === 'table') {
          partes.push((b.head || []).join(' '));
          (b.rows || []).forEach(function (f) { partes.push(limpiar(f.join(' '))); });
        } else if (b.type === 'steps' || b.type === 'accordion') {
          (b.items || []).forEach(function (i) { partes.push((i.t || '') + ' ' + limpiar(i.html || '')); });
        } else if (b.type === 'grid') {
          (b.items || []).forEach(function (i) { partes.push((i.t || i.label || '') + ' ' + limpiar(i.html || i.d || i.note || '')); });
        }
      });

      indice.push({
        id: sec.id, hash: sec.id, tipo: 'seccion',
        titulo: sec.title, sub: grupo.title,
        texto: normalizar(partes.join(' ')), peso: 3
      });

      // 2. Cada comando documentado, como entrada propia y navegable
      (sec.blocks || []).forEach(function (b) {
        if (b.type !== 'command') return;
        var anc = 'cmd-' + b.name.replace(/\W+/g, '-');
        var t = [b.name, b.tagline || '', b.synopsis || '', limpiar(b.desc || '')];
        (b.options || []).forEach(function (o) { t.push(o[0] + ' ' + limpiar(o[1])); });
        (b.examples || []).forEach(function (e) { t.push((e.lines || []).join(' ')); });
        (b.seealso || []).forEach(function (s) { t.push(s); });

        indice.push({
          id: b.name, hash: sec.id + '/' + anc, tipo: 'comando',
          titulo: b.name, sub: b.tagline || sec.title,
          texto: normalizar(t.join(' ')), peso: 5
        });
      });

      // 3. Los apartados (h2) también son navegables
      (sec.blocks || []).forEach(function (b) {
        if (b.type !== 'h2') return;
        indice.push({
          id: b.id, hash: sec.id + '/' + b.id, tipo: 'apartado',
          titulo: b.text, sub: sec.title,
          texto: normalizar(b.text + ' ' + sec.title), peso: 2
        });
      });
    });
    return indice.length;
  }

  /* Puntuación: coincidencia exacta al inicio del título > en el título >
     en el cuerpo. Multiplicada por el peso del tipo de entrada. */
  function puntuar(entrada, q) {
    var titulo = normalizar(entrada.titulo);
    var p = 0;
    if (titulo === q) p = 1000;
    else if (titulo.indexOf(q) === 0) p = 500;
    else if (titulo.indexOf(q) > -1) p = 250;
    else if (entrada.texto.indexOf(q) > -1) {
      p = 60;
      // bonus si la coincidencia está al principio de una palabra
      if (new RegExp('\\b' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(entrada.texto)) p += 40;
    }
    return p ? p + entrada.peso * 10 : 0;
  }

  function buscar(consulta, limite) {
    var q = normalizar(String(consulta).trim());
    if (q.length < 1) return [];
    var terminos = q.split(/\s+/);
    var res = [];

    for (var i = 0; i < indice.length; i++) {
      var e = indice[i], total = 0, todos = true;
      for (var j = 0; j < terminos.length; j++) {
        var p = puntuar(e, terminos[j]);
        if (!p) { todos = false; break; }
        total += p;
      }
      if (todos) res.push({ entrada: e, punt: total });
    }

    res.sort(function (a, b) {
      if (b.punt !== a.punt) return b.punt - a.punt;
      return a.entrada.titulo.length - b.entrada.titulo.length;
    });
    return res.slice(0, limite || 30).map(function (r) { return r.entrada; });
  }

  /* Resalta el fragmento coincidente del título, para la paleta. */
  function marcar(texto, consulta) {
    var q = normalizar(String(consulta).trim().split(/\s+/)[0] || '');
    if (!q) return global.Highlight.esc(texto);
    var norm = normalizar(texto);
    var i = norm.indexOf(q);
    if (i < 0) return global.Highlight.esc(texto);
    var esc = global.Highlight.esc;
    return esc(texto.slice(0, i)) + '<mark>' + esc(texto.slice(i, i + q.length)) + '</mark>' +
           esc(texto.slice(i + q.length));
  }

  global.Search = { construir: construir, buscar: buscar, marcar: marcar, tamano: function () { return indice.length; } };
})(window);
