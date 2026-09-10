/* ==========================================================================
   ascii.js — genera las tablas ASCII a partir de datos, no de HTML fijo
   Rangos: 'control' (0-31 y 127), 'imprimible' (32-126), 'extendido' (128-255)
   ========================================================================== */
(function (global) {
  'use strict';

  /* Nombre, abreviatura, secuencia de teclado y para qué sirve.
     Solo se listan los de control: los imprimibles se generan solos. */
  var CONTROL = {
    0:  ['NUL', 'Ctrl+@', 'Nulo. Termina las cadenas en C y marca el final de campo en <code>find -print0</code>'],
    1:  ['SOH', 'Ctrl+A', 'Inicio de cabecera. En Bash y tmux: ir al principio de la línea'],
    2:  ['STX', 'Ctrl+B', 'Inicio de texto. Prefijo por defecto de tmux'],
    3:  ['ETX', 'Ctrl+C', '<b>Interrumpe</b> el proceso en primer plano (envía SIGINT)'],
    4:  ['EOT', 'Ctrl+D', '<b>Fin de entrada</b>. Cierra la sesión o termina la lectura de stdin'],
    5:  ['ENQ', 'Ctrl+E', 'Consulta. En Bash: ir al final de la línea'],
    6:  ['ACK', 'Ctrl+F', 'Acuse de recibo. En Bash: avanzar un carácter'],
    7:  ['BEL', 'Ctrl+G', 'Campana: hace sonar un pitido. <code>printf "\\a"</code>'],
    8:  ['BS',  'Ctrl+H', 'Retroceso. Equivale a la tecla Borrar en muchas terminales'],
    9:  ['HT',  'Ctrl+I', '<b>Tabulador</b>. Separador de campos por defecto en <code>cut</code> y <code>awk</code>'],
    10: ['LF',  'Ctrl+J', '<b>Salto de línea</b>. Fin de línea en Linux y macOS'],
    11: ['VT',  'Ctrl+K', 'Tabulador vertical. En Bash: borrar hasta el final de la línea'],
    12: ['FF',  'Ctrl+L', 'Avance de página. En la terminal: <b>limpiar la pantalla</b>'],
    13: ['CR',  'Ctrl+M', '<b>Retorno de carro</b>. Windows usa CR+LF; de ahí los <code>^M</code>'],
    14: ['SO',  'Ctrl+N', 'Fuera de código. En Bash: siguiente comando del historial'],
    15: ['SI',  'Ctrl+O', 'Dentro de código. En nano: guardar el archivo'],
    16: ['DLE', 'Ctrl+P', 'Escape de enlace. En Bash: comando anterior del historial'],
    17: ['DC1', 'Ctrl+Q', 'XON: <b>reanuda</b> la salida de la terminal congelada con Ctrl+S'],
    18: ['DC2', 'Ctrl+R', 'En Bash: <b>buscar en el historial</b> hacia atrás'],
    19: ['DC3', 'Ctrl+S', 'XOFF: <b>congela</b> la terminal. Si parece colgada, prueba Ctrl+Q'],
    20: ['DC4', 'Ctrl+T', 'En Bash: intercambiar los dos caracteres anteriores'],
    21: ['NAK', 'Ctrl+U', 'En Bash: borrar desde el cursor hasta el inicio de la línea'],
    22: ['SYN', 'Ctrl+V', 'Inserta el siguiente carácter <b>literal</b>, sin interpretarlo'],
    23: ['ETB', 'Ctrl+W', 'En Bash: borrar la palabra anterior'],
    24: ['CAN', 'Ctrl+X', 'Cancelar. En nano: salir'],
    25: ['EM',  'Ctrl+Y', 'En Bash: pegar lo último borrado con Ctrl+U o Ctrl+W'],
    26: ['SUB', 'Ctrl+Z', '<b>Suspende</b> el proceso (SIGTSTP). Recupéralo con <code>fg</code>'],
    27: ['ESC', 'Ctrl+[', '<b>Escape</b>. Inicia las secuencias de color y control ANSI'],
    28: ['FS',  'Ctrl+\\', 'Separador de archivo. Envía SIGQUIT y genera un volcado'],
    29: ['GS',  'Ctrl+]', 'Separador de grupo. En telnet: volver al prompt'],
    30: ['RS',  'Ctrl+^', 'Separador de registro'],
    31: ['US',  'Ctrl+_', 'Separador de unidad'],
    127:['DEL', 'Supr',   'Suprimir. Históricamente perforaba todos los agujeros de la cinta']
  };

  /* Descripciones de los imprimibles que merecen una nota en Linux. */
  var NOTAS = {
    32:  'Espacio. El motivo de entrecomillar las variables en Bash',
    33:  'Cierre de admiración. En Bash: <code>!!</code> repite el último comando',
    34:  'Comilla doble: permite la expansión de variables',
    35:  'Almohadilla: comentario en Bash; prompt de root',
    36:  'Dólar: expansión de variables (<code>$HOME</code>) y prompt de usuario',
    37:  'Porcentaje. En crontab hay que escaparlo como <code>\\%</code>',
    38:  'Ampersand: ejecuta en segundo plano; <code>&amp;&amp;</code> encadena si hay éxito',
    39:  'Comilla simple: literal absoluto, nada se expande dentro',
    42:  'Asterisco: comodín de cualquier número de caracteres',
    43:  'Más. En <code>find -exec … +</code> agrupa los resultados',
    45:  'Guion: prefijo de opciones; <code>cd -</code> vuelve al directorio anterior',
    46:  'Punto: directorio actual; archivos ocultos; cualquier carácter en regex',
    47:  'Barra: separador de rutas y raíz del sistema',
    58:  'Dos puntos: separador en <code>/etc/passwd</code> y en <code>$PATH</code>',
    59:  'Punto y coma: separa comandos en la misma línea',
    60:  'Menor que: redirige la entrada estándar',
    62:  'Mayor que: redirige la salida estándar',
    63:  'Interrogación: comodín de un solo carácter; <code>$?</code> es el código de salida',
    64:  'Arroba. En Bash: <code>"$@"</code> son todos los argumentos',
    91:  'Corchete: clases de caracteres en regex; <code>[[ ]]</code> en Bash',
    92:  'Barra invertida: escapa el siguiente carácter',
    94:  'Circunflejo: inicio de línea en regex',
    95:  'Guion bajo: válido en nombres de variable',
    96:  'Acento grave: sustitución de comandos antigua. Usa <code>$( )</code>',
    123: 'Llave: expansión de llaves <code>{1..5}</code> y <code>${VAR}</code>',
    124: 'Barra vertical: <b>tubería</b>. La pieza clave de Unix',
    125: 'Llave de cierre',
    126: 'Virgulilla: tu carpeta personal (<code>$HOME</code>)'
  };

  var EXTENDIDO_UTILES = {
    161: 'Apertura de admiración', 176: 'Grado', 178: 'Superíndice dos',
    180: 'Acento agudo', 181: 'Micro (µ)', 183: 'Punto medio',
    186: 'Ordinal masculino', 170: 'Ordinal femenino',
    191: 'Apertura de interrogación', 193: 'A con tilde', 201: 'E con tilde',
    205: 'I con tilde', 209: 'Eñe mayúscula', 211: 'O con tilde',
    218: 'U con tilde', 220: 'U con diéresis', 225: 'a con tilde',
    233: 'e con tilde', 237: 'i con tilde', 241: 'eñe minúscula',
    243: 'o con tilde', 250: 'u con tilde', 252: 'u con diéresis',
    128: 'Euro (en Windows-1252; en Latin-1 es un carácter de control)',
    171: 'Comilla angular de apertura', 187: 'Comilla angular de cierre'
  };


  /* ---------------------------------------------------------------------
     Símbolos de acceso rápido, en formato tarjeta ("diapositivas").
     Cada uno: [carácter, nombre, categorías, nota]
     La secuencia de Linux (Ctrl+Shift+U + hex) y el código Alt de Windows
     se calculan solos a partir del carácter.
     --------------------------------------------------------------------- */
  var SIMBOLOS = [
    // — Los que más se usan en la terminal —
    ['@', 'Arroba', 'popular print', 'Usuario y host en SSH: <code>usuario@servidor</code>'],
    ['\\', 'Barra invertida', 'popular print', 'Escapa el carácter siguiente y parte líneas largas'],
    ['|', 'Barra vertical (pipe)', 'popular print', 'Tubería: conecta la salida de un comando con la entrada del siguiente'],
    ['~', 'Virgulilla', 'popular print', 'Tu carpeta personal: <code>cd ~</code>'],
    ['{', 'Llave de apertura', 'popular print', 'Expansión: <code>{1..5}</code> y <code>${VAR}</code>'],
    ['}', 'Llave de cierre', 'popular print', ''],
    ['[', 'Corchete de apertura', 'popular print', 'Clases en regex y pruebas <code>[[ ]]</code> en Bash'],
    [']', 'Corchete de cierre', 'popular print', ''],
    ['<', 'Menor que', 'popular print', 'Redirige la entrada estándar'],
    ['>', 'Mayor que', 'popular print', 'Redirige la salida; <code>&gt;&gt;</code> añade al final'],
    ['#', 'Almohadilla', 'popular print', 'Comentario en Bash y prompt de root'],
    ['$', 'Dólar', 'popular print', 'Expansión de variables y prompt de usuario'],
    ['%', 'Porcentaje', 'popular print', 'En crontab hay que escaparlo como <code>\\%</code>'],
    ['&', 'Ampersand', 'popular print', 'Segundo plano; <code>&amp;&amp;</code> encadena si hay éxito'],
    ['^', 'Circunflejo', 'popular print', 'Inicio de línea en expresiones regulares'],
    ['_', 'Guion bajo', 'popular print', 'Válido en nombres de variable'],
    ['`', 'Acento grave', 'popular print', 'Sustitución antigua de comandos. Usa <code>$( )</code>'],
    ['/', 'Barra', 'popular print', 'Separador de rutas y raíz del sistema'],
    ['"', 'Comillas dobles', 'popular print', 'Permiten expandir variables dentro'],
    ["'", 'Comilla simple', 'popular print', 'Literal absoluto: nada se expande'],
    ['*', 'Asterisco', 'popular print', 'Comodín de cualquier número de caracteres'],
    ['?', 'Interrogación', 'popular print', 'Comodín de un carácter; <code>$?</code> es el código de salida'],
    ['!', 'Cierre de admiración', 'popular print', '<code>!!</code> repite el último comando'],
    [';', 'Punto y coma', 'print', 'Separa comandos en la misma línea'],
    [':', 'Dos puntos', 'print', 'Separador en <code>/etc/passwd</code> y en <code>$PATH</code>'],
    ['=', 'Igual', 'print', 'Asignación. Sin espacios alrededor en Bash'],
    ['+', 'Más', 'print math', 'En <code>find -exec … +</code> agrupa los resultados'],
    ['-', 'Guion', 'print math', 'Prefijo de opciones; <code>cd -</code> vuelve atrás'],
    ['.', 'Punto', 'print', 'Directorio actual, archivos ocultos, cualquier carácter en regex'],

    // — Español —
    ['ñ', 'Eñe minúscula', 'es popular', ''],
    ['Ñ', 'Eñe mayúscula', 'es', ''],
    ['á', 'a con tilde', 'es', ''],
    ['é', 'e con tilde', 'es', ''],
    ['í', 'i con tilde', 'es', ''],
    ['ó', 'o con tilde', 'es', ''],
    ['ú', 'u con tilde', 'es', ''],
    ['ü', 'u con diéresis', 'es', ''],
    ['¿', 'Apertura de interrogación', 'es popular', ''],
    ['¡', 'Apertura de admiración', 'es popular', ''],
    ['«', 'Comilla angular izquierda', 'es', ''],
    ['»', 'Comilla angular derecha', 'es', ''],

    // — Matemáticos y monedas —
    ['°', 'Grado', 'math', ''],
    ['±', 'Más-menos', 'math', ''],
    ['÷', 'División', 'math', ''],
    ['×', 'Multiplicación', 'math', ''],
    ['µ', 'Micro', 'math', 'Prefijo de microsegundo en las métricas'],
    ['·', 'Punto medio', 'math', ''],
    ['²', 'Superíndice dos', 'math', ''],
    ['³', 'Superíndice tres', 'math', ''],
    ['½', 'Un medio', 'math', ''],
    ['€', 'Euro', 'math', ''],
    ['£', 'Libra', 'math', ''],
    ['¢', 'Centavo', 'math', ''],
    ['§', 'Sección', 'math', ''],
    ['¶', 'Calderón', 'math', ''],
    ['†', 'Cruz', 'math', ''],
    ['∞', 'Infinito', 'math', ''],
    ['≈', 'Aproximadamente', 'math', ''],
    ['≠', 'Distinto de', 'math', ''],
    ['≤', 'Menor o igual', 'math', ''],
    ['≥', 'Mayor o igual', 'math', ''],

    // — Marcos y cajas: para dibujar diagramas en la terminal —
    ['─', 'Línea horizontal', 'box', 'Para diagramas en texto monoespaciado'],
    ['│', 'Línea vertical', 'box', ''],
    ['┌', 'Esquina superior izquierda', 'box', ''],
    ['┐', 'Esquina superior derecha', 'box', ''],
    ['└', 'Esquina inferior izquierda', 'box', ''],
    ['┘', 'Esquina inferior derecha', 'box', ''],
    ['├', 'Unión izquierda', 'box', 'La que usa <code>tree</code> para el árbol'],
    ['┤', 'Unión derecha', 'box', ''],
    ['┬', 'Unión superior', 'box', ''],
    ['┴', 'Unión inferior', 'box', ''],
    ['┼', 'Cruce', 'box', ''],
    ['═', 'Doble horizontal', 'box', ''],
    ['║', 'Doble vertical', 'box', ''],
    ['█', 'Bloque lleno', 'box', 'Barras de progreso en la terminal'],
    ['▓', 'Bloque denso', 'box', ''],
    ['▒', 'Bloque medio', 'box', ''],
    ['░', 'Bloque ligero', 'box', ''],
    ['►', 'Triángulo derecha', 'box', ''],
    ['◄', 'Triángulo izquierda', 'box', ''],
    ['▲', 'Triángulo arriba', 'box', ''],
    ['▼', 'Triángulo abajo', 'box', ''],
    ['✓', 'Marca de verificación', 'box', 'Salida correcta en los scripts'],
    ['✗', 'Marca de error', 'box', 'Salida con fallo en los scripts'],
    ['→', 'Flecha derecha', 'box', ''],
    ['←', 'Flecha izquierda', 'box', ''],
    ['↑', 'Flecha arriba', 'box', ''],
    ['↓', 'Flecha abajo', 'box', '']
  ];

  /* Código Alt de Windows. Para los que están en la tabla de códigos de
     página antigua se usa el valor clásico; para el resto, Alt + 0 + decimal
     de Windows-1252, y si tampoco está, no se muestra. */
  var ALT_CLASICO = {
    'ñ': '164', 'Ñ': '165', 'á': '160', 'é': '130', 'í': '161', 'ó': '162',
    'ú': '163', 'ü': '129', '¿': '168', '¡': '173', '°': '248', '±': '241',
    '÷': '246', '«': '174', '»': '175', '·': '250', '²': '253', '£': '156',
    '¢': '155', '×': '158', 'µ': '230', '½': '171',
    '─': '196', '│': '179', '┌': '218', '┐': '191', '└': '192', '┘': '217',
    '├': '195', '┤': '180', '┬': '194', '┴': '193', '┼': '197',
    '═': '205', '║': '186', '█': '219', '▓': '178', '▒': '177', '░': '176',
    '►': '16', '◄': '17', '▲': '30', '▼': '31', '∞': '236'
  };

  /* Devuelve los símbolos listos para pintar. */
  function simbolos() {
    return SIMBOLOS.map(function (s) {
      var car = s[0], cp = car.codePointAt(0);
      var alt;
      if (ALT_CLASICO[car]) alt = 'Alt + ' + ALT_CLASICO[car];
      else if (cp < 128) alt = 'Alt + ' + cp;
      else if (cp <= 255) alt = 'Alt + 0' + cp;
      else alt = '';
      return {
        car: car,
        nombre: s[1],
        cats: s[2],
        nota: s[3] || '',
        dec: cp,
        hex: cp.toString(16).toLowerCase(),
        alt: alt,
        linux: 'Ctrl+Shift+U ' + cp.toString(16).toLowerCase()
      };
    });
  }

  var CATEGORIAS = [
    ['todos', 'Todos'],
    ['popular', '★ Más usados'],
    ['print', 'Imprimibles'],
    ['es', 'Español'],
    ['math', 'Matemáticos'],
    ['box', 'Marcos y flechas']
  ];

  function bin(n) { return n.toString(2).padStart(8, '0'); }
  function hex(n) { return n.toString(16).toUpperCase().padStart(2, '0'); }
  function oct(n) { return n.toString(8).padStart(3, '0'); }

  /* Devuelve las filas de un rango: {dec, hex, oct, bin, car, ent, nom, desc, tecla} */
  function filas(rango) {
    var out = [], i;

    if (rango === 'control') {
      var codigos = Object.keys(CONTROL).map(Number).sort(function (a, b) { return a - b; });
      codigos.forEach(function (c) {
        var d = CONTROL[c];
        out.push({
          dec: c, hex: hex(c), oct: oct(c), bin: bin(c),
          car: '^' + (c === 127 ? '?' : String.fromCharCode(c + 64)),
          ent: '&amp;#' + c + ';', nom: d[0], tecla: d[1], desc: d[2]
        });
      });
      return out;
    }

    if (rango === 'imprimible') {
      for (i = 32; i <= 126; i++) {
        out.push({
          dec: i, hex: hex(i), oct: oct(i), bin: bin(i),
          car: i === 32 ? '(espacio)' : String.fromCharCode(i),
          ent: '&amp;#' + i + ';',
          nom: '', tecla: '', desc: NOTAS[i] || ''
        });
      }
      return out;
    }

    // extendido: 128-255 (Latin-1 / ISO-8859-1)
    for (i = 128; i <= 255; i++) {
      var car = String.fromCharCode(i);
      var imprimible = i >= 160;
      out.push({
        dec: i, hex: hex(i), oct: oct(i), bin: bin(i),
        car: imprimible ? car : '·',
        ent: '&amp;#' + i + ';',
        nom: '', tecla: imprimible ? 'Ctrl+Shift+U ' + hex(i).toLowerCase() : '',
        desc: EXTENDIDO_UTILES[i] || (imprimible ? '' : 'Control extendido, no imprimible')
      });
    }
    return out;
  }

  global.AsciiData = { filas: filas, simbolos: simbolos, categorias: CATEGORIAS,
                       bin: bin, hex: hex, oct: oct };
})(window);
