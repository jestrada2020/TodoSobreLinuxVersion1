(function() {
  // Register tab in LinuxApp
  if (window.LinuxApp && window.LinuxApp.registerTab) {
    window.LinuxApp.registerTab('codigo_ascii');
  }

  const CP437 = ["Ç", "ü", "é", "â", "ä", "à", "å", "ç", "ê", "ë", "è", "ï", "î", "ì", "Ä", "Å", "É", "æ", "Æ", "ô", "ö", "ò", "û", "ù", "ÿ", "Ö", "Ü", "¢", "£", "¥", "₧", "ƒ", "á", "í", "ó", "ú", "ñ", "Ñ", "ª", "º", "¿", "⌐", "¬", "½", "¼", "¡", "«", "»", "░", "▒", "▓", "│", "┤", "╡", "╢", "╖", "╕", "╣", "║", "╗", "╝", "╜", "╛", "┐", "└", "┴", "┬", "├", "─", "┼", "╞", "╟", "╚", "╔", "╩", "╦", "╠", "═", "╬", "╧", "╨", "╤", "╥", "╙", "╘", "╒", "╓", "╫", "╪", "┘", "┌", "█", "▄", "▌", "▐", "▀", "α", "ß", "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "∞", "φ", "ε", "∩", "≡", "±", "≥", "≤", "⌠", "⌡", "÷", "≈", "°", "∙", "·", "√", "ⁿ", "²", "■", " "];

  const CTRL_NAMES = {
    0: { name: "Carácter Nulo (NUL)", desc: "Terminador de strings en C", alt: "Alt + 0" },
    1: { name: "Inicio de Cabecera (SOH)", desc: "En Bash: Ir al inicio de la línea (Ctrl+A)", alt: "Alt + 1" },
    2: { name: "Inicio de Texto (STX)", desc: "En Bash: Retroceder un carácter (Ctrl+B)", alt: "Alt + 2" },
    3: { name: "Fin de Texto (ETX)", desc: "En Linux: Interrumpir comando (Ctrl+C)", alt: "Alt + 3" },
    4: { name: "Fin de Transmisión (EOT)", desc: "En Linux: Salir de terminal / EOF (Ctrl+D)", alt: "Alt + 4" },
    5: { name: "Consulta (ENQ)", desc: "En Bash: Ir al final de línea (Ctrl+E)", alt: "Alt + 5" },
    6: { name: "Reconocimiento (ACK)", desc: "En Bash: Avanzar un carácter (Ctrl+F)", alt: "Alt + 6" },
    7: { name: "Campana (BEL)", desc: "Pitido o alerta sonora de terminal (Ctrl+G)", alt: "Alt + 7" },
    8: { name: "Retroceso (BS)", desc: "Borrar a la izquierda (Ctrl+H)", alt: "Alt + 8" },
    9: { name: "Tabulación (HT)", desc: "Autocompletado en terminal (Tab / Ctrl+I)", alt: "Alt + 9" },
    10: { name: "Salto de Línea (LF)", desc: "Salto de línea \\n en Linux (Ctrl+J)", alt: "Alt + 10" },
    11: { name: "Tabulación Vertical (VT)", desc: "En Bash: Cortar texto hacia adelante (Ctrl+K)", alt: "Alt + 11" },
    12: { name: "Salto de Página (FF)", desc: "En Linux: Limpiar pantalla clear (Ctrl+L)", alt: "Alt + 12" },
    13: { name: "Retorno de Carro (CR)", desc: "Retorno al inicio de línea \\r (Enter / Ctrl+M)", alt: "Alt + 13" },
    14: { name: "Cambio Fuera (SO)", desc: "Historial comando siguiente (Ctrl+N)", alt: "Alt + 14" },
    15: { name: "Cambio Dentro (SI)", desc: "Ejecutar y cargar siguiente (Ctrl+O)", alt: "Alt + 15" },
    16: { name: "Escape Enlace Datos (DLE)", desc: "Historial comando anterior (Ctrl+P)", alt: "Alt + 16" },
    17: { name: "Control Disp 1 (DC1)", desc: "Reanudar flujo de salida XON (Ctrl+Q)", alt: "Alt + 17" },
    18: { name: "Control Disp 2 (DC2)", desc: "Búsqueda inversa historial (Ctrl+R)", alt: "Alt + 18" },
    19: { name: "Control Disp 3 (DC3)", desc: "Pausar flujo de salida XOFF (Ctrl+S)", alt: "Alt + 19" },
    20: { name: "Control Disp 4 (DC4)", desc: "Intercambiar caracteres (Ctrl+T)", alt: "Alt + 20" },
    21: { name: "Reconocimiento Negativo (NAK)", desc: "Borrar línea hasta cursor (Ctrl+U)", alt: "Alt + 21" },
    22: { name: "Sincronismo Ocioso (SYN)", desc: "Carácter de escape literal (Ctrl+V)", alt: "Alt + 22" },
    23: { name: "Fin Bloque (ETB)", desc: "Borrar palabra anterior (Ctrl+W)", alt: "Alt + 23" },
    24: { name: "Cancelar (CAN)", desc: "Cancelar entrada (Ctrl+X)", alt: "Alt + 24" },
    25: { name: "Fin Medio (EM)", desc: "Pegar texto cortado (Ctrl+Y)", alt: "Alt + 25" },
    26: { name: "Sustitución (SUB)", desc: "Suspender a 2do plano SIGTSTP (Ctrl+Z)", alt: "Alt + 26" },
    27: { name: "Escape (ESC)", desc: "Secuencias ANSI / Salir en Vim (Esc / Ctrl+[)", alt: "Alt + 27" },
    28: { name: "Separador Archivos (FS)", desc: "Señal SIGQUIT con volcado (Ctrl+\\)", alt: "Alt + 28" },
    29: { name: "Separador Grupos (GS)", desc: "Delimitador de grupo (Ctrl+])", alt: "Alt + 29" },
    30: { name: "Separador Registros (RS)", desc: "Delimitador de registro (Ctrl+^)", alt: "Alt + 30" },
    31: { name: "Separador Unidades (US)", desc: "Deshacer en Bash undo (Ctrl+_)", alt: "Alt + 31" },
    127: { name: "Suprimir (DEL)", desc: "Borrar carácter bajo cursor (Delete / Ctrl+?)", alt: "Alt + 127" }
  };

  const SPECIAL_NAMES = {
    32: "Espacio (Space)",
    33: "Signo de exclamación (!)",
    34: "Comillas dobles (\")",
    35: "Almohadilla / Hash (#)",
    36: "Signo de dólar ($)",
    37: "Signo de porcentaje (%)",
    38: "Ampersand (&)",
    39: "Comilla simple (')",
    40: "Paréntesis de apertura (()",
    41: "Paréntesis de cierre ())",
    42: "Asterisco (*)",
    43: "Signo más (+)",
    44: "Coma (,)",
    45: "Guion medio / Menos (-)",
    46: "Punto (.)",
    47: "Barra diagonal / Slash (/)",
    58: "Dos puntos (:)",
    59: "Punto y coma (;)",
    60: "Menor que (<)",
    61: "Signo igual (=)",
    62: "Mayor que (>)",
    63: "Signo de interrogación (?)",
    64: "Arroba (@)",
    91: "Corchete de apertura ([)",
    92: "Barra invertida / Backslash (\\)",
    93: "Corchete de cierre (])",
    94: "Acento circunflejo / Caret (^)",
    95: "Guion bajo / Underscore (_)",
    96: "Acento grave / Backtick (`)",
    123: "Llave de apertura ({)",
    124: "Barra vertical / Pipe (|)",
    125: "Llave de cierre (})",
    126: "Virgulilla / Tilde (~)",
    160: "Letra a minúscula con tilde (á)",
    161: "Letra i minúscula con tilde (í)",
    162: "Letra o minúscula con tilde (ó)",
    163: "Letra u minúscula con tilde (ú)",
    164: "Letra eñe minúscula (ñ)",
    165: "Letra Eñe mayúscula (Ñ)",
    168: "Signo de interrogación apertura (¿)",
    173: "Signo de exclamación apertura (¡)",
    248: "Signo de grado (°)",
    241: "Signo más-menos (±)",
    246: "Signo de división (÷)"
  };

  let toastTimer = null;
  function showToast(message) {
    let toast = document.getElementById('ascii-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ascii-toast';
      toast.className = 'ascii-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function copyText(text, triggerEl) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`✓ Copiado al portapapeles: ${text}`);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }

    if (triggerEl && triggerEl.tagName === 'BUTTON') {
      const origText = triggerEl.innerHTML;
      triggerEl.classList.add('copied');
      triggerEl.innerHTML = '✓ ¡Copiado!';
      setTimeout(() => {
        triggerEl.classList.remove('copied');
        triggerEl.innerHTML = origText;
      }, 1400);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(`✓ Copiado: ${text}`);
    } catch (e) {
      showToast(`No se pudo copiar: ${text}`);
    }
    document.body.removeChild(ta);
  }

  function getCharInfo(code) {
    code = Math.max(0, Math.min(255, parseInt(code, 10) || 0));
    let glyph = "";
    let name = "";
    let alt = `Alt + ${code}`;
    let hex = code.toString(16).toUpperCase().padStart(2, '0');
    let bin = code.toString(2).padStart(8, '0');

    if (code >= 0 && code <= 31) {
      glyph = CTRL_NAMES[code] ? CTRL_NAMES[code].name.split("(")[1].replace(")", "") : "^";
      name = CTRL_NAMES[code] ? CTRL_NAMES[code].name : "Control";
    } else if (code === 127) {
      glyph = "DEL";
      name = CTRL_NAMES[127].name;
    } else if (code === 32) {
      glyph = "␣";
      name = "Espacio (Space)";
    } else if (code >= 33 && code <= 126) {
      glyph = String.fromCharCode(code);
      name = SPECIAL_NAMES[code] || `Carácter '${glyph}'`;
    } else {
      glyph = CP437[code - 128] || String.fromCharCode(code);
      name = SPECIAL_NAMES[code] || `Carácter extendido '${glyph}'`;
    }

    return { code, glyph, name, alt, hex, bin };
  }

  function initLiveTester() {
    const charInput = document.getElementById('ascii-test-char-input');
    const decInput = document.getElementById('ascii-test-dec-input');

    if (charInput) {
      charInput.addEventListener('input', () => {
        const val = charInput.value;
        if (!val) return;
        const char = val[val.length - 1];
        let code = char.charCodeAt(0);
        // Map CP437 if high Unicode
        if (code > 127) {
          const idx = CP437.indexOf(char);
          if (idx !== -1) code = 128 + idx;
        }
        updateTesterChar(code, char);
      });

      charInput.addEventListener('keydown', (e) => {
        if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setTimeout(() => {
            if (charInput.value) {
              const char = charInput.value[charInput.value.length - 1];
              let code = char.charCodeAt(0);
              if (code > 127) {
                const idx = CP437.indexOf(char);
                if (idx !== -1) code = 128 + idx;
              }
              updateTesterChar(code, char);
            }
          }, 10);
        }
      });
    }

    if (decInput) {
      decInput.addEventListener('input', () => {
        let code = parseInt(decInput.value, 10);
        if (isNaN(code)) return;
        code = Math.max(0, Math.min(255, code));
        updateTesterDec(code);
      });
    }

    function updateTesterChar(code, rawChar) {
      const info = getCharInfo(code);
      const dispGlyph = (code === 32) ? "␣" : (rawChar || info.glyph);
      const copyVal = (code === 32) ? " " : (rawChar || info.glyph);

      document.getElementById('ascii-res-glyph').textContent = dispGlyph;
      document.getElementById('ascii-res-name').textContent = info.name;
      document.getElementById('ascii-res-dec').textContent = info.code;
      document.getElementById('ascii-res-hex').textContent = `0x${info.hex}`;
      document.getElementById('ascii-res-bin').textContent = info.bin;

      const altEl = document.getElementById('ascii-res-alt');
      altEl.textContent = info.alt;
      altEl.setAttribute('data-copy-val', info.alt);

      const btnChar = document.getElementById('ascii-btn-copy-test-char');
      const btnCode = document.getElementById('ascii-btn-copy-test-code');
      btnChar.setAttribute('data-copy-val', copyVal);
      btnCode.setAttribute('data-copy-val', info.alt);
    }

    function updateTesterDec(code) {
      const info = getCharInfo(code);
      const copyVal = (code === 32) ? " " : info.glyph;

      document.getElementById('ascii-res2-glyph').textContent = info.glyph;
      document.getElementById('ascii-res2-name').textContent = info.name;
      document.getElementById('ascii-res2-dec').textContent = info.code;
      document.getElementById('ascii-res2-hex').textContent = `0x${info.hex}`;
      document.getElementById('ascii-res2-bin').textContent = info.bin;

      const altEl = document.getElementById('ascii-res2-alt');
      altEl.textContent = info.alt;
      altEl.setAttribute('data-copy-val', info.alt);

      const btnChar = document.getElementById('ascii-btn-copy-dec-char');
      const btnCode = document.getElementById('ascii-btn-copy-dec-code');
      btnChar.setAttribute('data-copy-val', copyVal);
      btnCode.setAttribute('data-copy-val', info.alt);
    }
  }

  function initFiltering() {
    const searchInput = document.getElementById('ascii-table-search');
    const clearBtn = document.getElementById('ascii-search-clear');
    const filterBtns = document.querySelectorAll('#ascii-filter-pills .ascii-filter-btn');
    const rows = document.querySelectorAll('.ascii-table tbody tr');
    const cards = document.querySelectorAll('.quick-sym-grid .ascii-card');
    const noResults = document.getElementById('ascii-no-results');

    const secPrint = document.getElementById('sec-table-print');
    const secCtrl = document.getElementById('sec-table-ctrl');
    const secExt = document.getElementById('sec-table-ext');

    let activeFilter = 'all';

    function applyFilter() {
      const q = (searchInput ? searchInput.value.trim().toLowerCase() : '');
      if (clearBtn) {
        clearBtn.style.display = q ? 'block' : 'none';
      }

      let visibleCount = 0;
      let printVis = 0;
      let ctrlVis = 0;
      let extVis = 0;

      rows.forEach(row => {
        const cat = row.getAttribute('data-category') || '';
        const search = row.getAttribute('data-search') || '';

        let matchCat = (activeFilter === 'all');
        if (!matchCat) {
          if (activeFilter === 'popular') {
            matchCat = cat.includes('popular');
          } else if (activeFilter === 'print') {
            matchCat = cat.includes('print');
          } else if (activeFilter === 'ctrl') {
            matchCat = cat.includes('ctrl');
          } else if (activeFilter === 'es') {
            matchCat = cat.includes('es');
          } else if (activeFilter === 'math') {
            matchCat = cat.includes('math');
          } else if (activeFilter === 'box') {
            matchCat = cat.includes('box');
          }
        }

        const matchSearch = (!q || search.includes(q));
        const show = matchCat && matchSearch;

        row.style.display = show ? '' : 'none';
        if (show) {
          visibleCount++;
          if (cat.includes('print')) printVis++;
          if (cat.includes('ctrl')) ctrlVis++;
          if (cat.includes('ext')) extVis++;
        }
      });

      // Filter quick access cards
      cards.forEach(card => {
        const cardSearch = card.getAttribute('data-search') || '';
        const matchSearch = (!q || cardSearch.includes(q));
        const matchCat = (activeFilter === 'all' || activeFilter === 'popular' || activeFilter === 'print');
        card.style.display = (matchCat && matchSearch) ? 'flex' : 'none';
      });

      if (secPrint) secPrint.style.display = (printVis > 0) ? 'block' : 'none';
      if (secCtrl) secCtrl.style.display = (ctrlVis > 0) ? 'block' : 'none';
      if (secExt) secExt.style.display = (extVis > 0) ? 'block' : 'none';

      if (noResults) {
        noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        applyFilter();
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  }

  function initGlobalCopyDelegation() {
    const sec = document.getElementById('codigo_ascii');
    if (!sec) return;

    sec.addEventListener('click', (e) => {
      const copyTarget = e.target.closest('[data-copy-val]');
      if (copyTarget) {
        const val = copyTarget.getAttribute('data-copy-val');
        if (val !== null && val !== undefined) {
          copyText(val, copyTarget);
        }
      }
    });
  }

  function initAscii() {
    initLiveTester();
    initFiltering();
    initGlobalCopyDelegation();
  }

  if (document.readyState !== 'loading') {
    initAscii();
  } else {
    document.addEventListener('DOMContentLoaded', initAscii);
  }
})();
