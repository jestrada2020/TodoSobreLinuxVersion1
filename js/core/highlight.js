/* ==========================================================================
   highlight.js — resaltado de sintaxis de shell, sin dependencias
   Convención de las líneas en los datos de contenido:
     "$ comando"    → línea de comando (prompt de usuario)
     "# comentario" → comentario explicativo (la línea entera)
     "!root comando"→ línea de comando con prompt de root (#)
     "PS> comando"  → línea de comando de PowerShell
     "| salida"     → salida del programa (atenuada)
     cualquier otra → texto plano
   ========================================================================== */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tk(clase, texto) {
    return '<span class="tk-' + clase + '">' + esc(texto) + '</span>';
  }

  /* Palabras que introducen un comando nuevo dentro de la misma línea:
     tras ellas, el siguiente token vuelve a ser un nombre de comando. */
  var REINICIA = {
    '|': 1, '||': 1, '&&': 1, ';': 1, 'sudo': 1, 'time': 1, 'watch': 1,
    'xargs': 1, 'env': 1, 'nohup': 1, 'exec': 1, 'command': 1, 'then': 1,
    'do': 1, 'else': 1, '!': 1
  };

  /* Divide respetando comillas simples y dobles. */
  function trocear(linea) {
    var piezas = [], actual = '', comilla = null, i, c;
    for (i = 0; i < linea.length; i++) {
      c = linea[i];
      if (comilla) {
        actual += c;
        if (c === comilla && linea[i - 1] !== '\\') { piezas.push(actual); actual = ''; comilla = null; }
        continue;
      }
      if (c === '"' || c === "'") {
        if (actual) { piezas.push(actual); actual = ''; }
        comilla = c; actual = c; continue;
      }
      if (c === ' ' || c === '\t') {
        if (actual) { piezas.push(actual); actual = ''; }
        piezas.push(c); continue;
      }
      actual += c;
    }
    if (actual) piezas.push(actual);
    return piezas;
  }

  function resaltarComando(cuerpo) {
    // Separa un comentario final que no esté dentro de comillas
    var comentario = '', enComilla = null, corte = -1, i, c;
    for (i = 0; i < cuerpo.length; i++) {
      c = cuerpo[i];
      if (enComilla) { if (c === enComilla) enComilla = null; continue; }
      if (c === '"' || c === "'") { enComilla = c; continue; }
      if (c === '#' && (i === 0 || /\s/.test(cuerpo[i - 1]))) { corte = i; break; }
    }
    if (corte >= 0) { comentario = cuerpo.slice(corte); cuerpo = cuerpo.slice(0, corte); }

    var piezas = trocear(cuerpo);
    var salida = '', esperaComando = true;

    for (i = 0; i < piezas.length; i++) {
      var p = piezas[i];

      if (p === ' ' || p === '\t') { salida += p; continue; }

      if (REINICIA[p]) { salida += tk('opt', p); esperaComando = true; continue; }

      if (p[0] === '"' || p[0] === "'") { salida += tk('str', p); esperaComando = false; continue; }

      if (esperaComando && /^[A-Za-z_./~][\w.\-/]*$/.test(p)) {
        salida += tk('cmd', p); esperaComando = false; continue;
      }

      if (p[0] === '-') { salida += tk('opt', p); continue; }

      if (/^[$][{(]?[A-Za-z_]/.test(p)) { salida += tk('str', p); continue; }

      if (/[/~]/.test(p) && !/^-/.test(p)) { salida += tk('path', p); continue; }

      if (/^[>|<&;]+$/.test(p)) { salida += tk('opt', p); esperaComando = true; continue; }

      salida += tk('arg', p);
    }

    if (comentario) salida += tk('comment', comentario);
    return salida;
  }

  /* Convierte un array de líneas en HTML resaltado. */
  function resaltar(lineas) {
    var salida = [];
    for (var i = 0; i < lineas.length; i++) {
      var l = lineas[i];

      if (l === '') { salida.push(''); continue; }

      // Comentario de línea completa
      if (/^\s*#/.test(l)) { salida.push(tk('comment', l)); continue; }
      // Salida de programa
      if (l.indexOf('| ') === 0) { salida.push(tk('out', l.slice(2))); continue; }
      if (l === '|') { salida.push(''); continue; }
      // Prompt de root
      if (l.indexOf('!root ') === 0) {
        salida.push(tk('prompt', '# ') + resaltarComando(l.slice(6)));
        continue;
      }
      // PowerShell
      if (l.indexOf('PS> ') === 0) {
        salida.push(tk('prompt', 'PS> ') + resaltarComando(l.slice(4)));
        continue;
      }
      // Prompt de usuario
      if (l.indexOf('$ ') === 0) {
        salida.push(tk('prompt', '$ ') + resaltarComando(l.slice(2)));
        continue;
      }
      // Continuación de comando (indentada) — se resalta igual
      if (/^\s+\S/.test(l) && /[-|\\]/.test(l)) {
        var sangria = l.match(/^\s+/)[0];
        salida.push(sangria + resaltarComando(l.slice(sangria.length)));
        continue;
      }
      salida.push(tk('out', l));
    }
    return salida.join('\n');
  }

  /* Texto plano de las líneas, para el botón de copiar:
     quita prompts y descarta las líneas de salida. */
  function textoPlano(lineas) {
    var out = [];
    for (var i = 0; i < lineas.length; i++) {
      var l = lineas[i];
      if (l.indexOf('| ') === 0 || l === '|') continue;
      if (l.indexOf('$ ') === 0) { out.push(l.slice(2)); continue; }
      if (l.indexOf('!root ') === 0) { out.push('sudo ' + l.slice(6)); continue; }
      if (l.indexOf('PS> ') === 0) { out.push(l.slice(4)); continue; }
      out.push(l);
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  global.Highlight = { resaltar: resaltar, textoPlano: textoPlano, esc: esc };
})(window);
