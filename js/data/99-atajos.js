/* 99-atajos.js — atajos de la aplicación y cómo aprovecharla */
(function (C) {
  'use strict';

  C.registrar({
    id: 'atajos',
    group: 'meta',
    title: 'Atajos y cómo usar esta guía',
    level: 'basico',
    tags: ['atajos', 'teclado', 'buscar', 'progreso', 'imprimir'],
    lead: 'La aplicación está pensada para usarse con el teclado. Con <kbd>Ctrl</kbd>+<kbd>K</kbd> se busca en <b>todo</b> el contenido —comandos, opciones, ejemplos y explicaciones—, no solo en los títulos del menú.',
    blocks: [
      { type: 'h2', id: 'teclado', text: 'Atajos de teclado' },
      { type: 'keys', items: [
        { k: ['Ctrl', 'K'], d: 'Abrir el buscador (también con /)' },
        { k: ['/'], d: 'Abrir el buscador' },
        { k: ['↑', '↓'], d: 'Moverse por los resultados' },
        { k: ['Enter'], d: 'Abrir el resultado seleccionado' },
        { k: ['Esc'], d: 'Cerrar el buscador' },
        { k: ['j'], d: 'Sección siguiente' },
        { k: ['k'], d: 'Sección anterior' },
        { k: ['g'], d: 'Volver al inicio' },
        { k: ['t'], d: 'Cambiar de tema (automático → claro → oscuro)' },
        { k: ['m'], d: 'Marcar la sección actual como leída' },
        { k: ['?'], d: 'Abrir esta página de atajos' }
      ]},
      { type: 'h2', id: 'buscador', text: 'El buscador' },
      { type: 'prose', html: '<p>El índice incluye cada <b>comando</b> documentado, cada <b>apartado</b> y el texto completo de las secciones. Eso significa que puedes buscar por cosas que no son títulos:</p>' },
      { type: 'table', head: ['Si buscas…', 'Encuentras'], monoFirst: false, rows: [
        ['<code>chmod</code>', 'La ficha del comando, con sus opciones y ejemplos'],
        ['<code>ocultos</code>', 'La opción <code>-a</code> de <code>ls</code>, aunque la palabra no esté en ningún título'],
        ['<code>inodos</code>', 'La opción <code>-i</code> de <code>df</code>, explicada en su tabla de opciones'],
        ['<code>no arranca</code>', 'La sección de rescate del arranque'],
        ['<code>navegacion</code>', 'La sección «Navegación», aunque la escribas <b>sin acento</b>'],
        ['<code>awk suma</code>', 'El ejemplo de sumar una columna con <code>awk</code>']
      ]},
      { type: 'callout', variant: 'tip', title: 'Búsqueda sin acentos y por varias palabras',
        html: '<p>Los acentos se ignoran en ambos sentidos: <code>navegacion</code> encuentra «Navegación». Y si escribes varias palabras, se exige que <b>todas</b> aparezcan, lo que permite acotar mucho: <code>rsync respaldo</code>, <code>grep contexto</code>, <code>systemd temporizador</code>.</p>' },
      { type: 'h2', id: 'progreso', text: 'Progreso y favoritos' },
      { type: 'grid', cols: 2, items: [
        { t: 'Marcar como leída', html: 'El botón al final de cada sección (o la tecla <kbd>m</kbd>). El anillo de progreso del menú lateral lleva la cuenta y aparece un ✓ junto a la sección.' },
        { t: 'Favoritos', html: 'Marca las secciones que consultas a menudo. Aparecen destacadas al principio de la página de inicio y como sugerencia en el buscador vacío.' },
        { t: 'Continuar donde lo dejaste', html: 'Al abrir el buscador sin escribir nada, la primera sugerencia es la última sección que visitaste.' },
        { t: 'Imprimir o guardar en PDF', html: 'El botón «Imprimir / PDF» al final de cada sección genera una versión limpia, sin menú ni interfaz, con las URL de los enlaces visibles.' }
      ]},
      { type: 'callout', variant: 'info', title: 'Dónde se guardan tus datos',
        html: '<p>El tema, el progreso de lectura y los favoritos se guardan en el <code>localStorage</code> de tu navegador: <b>solo en este equipo y en este navegador</b>. No se envía nada a ningún servidor — la aplicación es completamente estática y funciona sin conexión.</p><p>Si usas el navegador en modo privado o borras los datos del sitio, el progreso se pierde. La aplicación seguirá funcionando igual.</p>' },
      { type: 'h2', id: 'estructura-app', text: 'Cómo está organizada' },
      { type: 'prose', html: '<p>El contenido no está incrustado en el HTML: vive en módulos de datos en <code>js/data/</code>, y un renderizador los convierte en páginas. Eso es lo que permite que el buscador indexe cada opción de cada comando, y que añadir contenido nuevo no requiera tocar la interfaz.</p>' },
      { type: 'ascii', text:
'TODO_EN_LINUX/\n' +
'├── index.html            estructura de la aplicación\n' +
'├── css/\n' +
'│   ├── base.css          tokens de diseño y temas claro/oscuro\n' +
'│   ├── layout.css        rejilla, menú lateral, índice, responsive\n' +
'│   └── components.css    tarjetas, bloques de comando, tablas, avisos\n' +
'├── js/core/\n' +
'│   ├── store.js          estado y persistencia (localStorage)\n' +
'│   ├── highlight.js      resaltado de sintaxis de shell\n' +
'│   ├── render.js         convierte los datos en HTML\n' +
'│   ├── search.js         índice de búsqueda de texto completo\n' +
'│   └── app.js            enrutado, menú, índice, tema, atajos\n' +
'├── js/data/              EL CONTENIDO, un módulo por área\n' +
'│   ├── 00-catalogo.js    registro de grupos y secciones\n' +
'│   ├── 01-introduccion.js … 13-agentes.js\n' +
'│   └── 99-atajos.js\n' +
'└── descargas/            el kit de agente, listo para descargar' },
      { type: 'h2', id: 'anadir', text: 'Añadir una sección nueva' },
      { type: 'cmd', label: 'Tres pasos', lines: [
        '# 1. Crea o edita un módulo en js/data/ y registra la sección:',
        '|   (function (C) {',
        '|     C.registrar({',
        '|       id: "mi-seccion",',
        '|       group: "terminal",        // debe existir en 00-catalogo.js',
        '|       title: "Mi sección",',
        '|       level: "basico",          // basico | intermedio | avanzado',
        '|       tags: ["palabra", "clave"],',
        '|       lead: "Introducción con <b>HTML</b> permitido.",',
        '|       blocks: [',
        '|         { type: "h2", id: "apartado", text: "Un apartado" },',
        '|         { type: "prose", html: "<p>Texto normal.</p>" },',
        '|         { type: "cmd", label: "ejemplo", lines: ["$ ls -la"] },',
        '|         { type: "callout", variant: "tip", title: "Consejo",',
        '|           html: "<p>Contenido del aviso.</p>" }',
        '|       ]',
        '|     });',
        '|   })(window.Contenido);',
        '',
        '# 2. Si es un archivo nuevo, añade su <script> en index.html',
        '#    ANTES de js/core/app.js',
        '',
        '# 3. Abre la aplicación: el menú, el índice y el buscador',
        '#    se generan solos.'
      ]},
      { type: 'table', head: ['Tipo de bloque', 'Para qué'], rows: [
        ['<code>h2</code> / <code>h3</code>', 'Encabezados. Los <code>h2</code> y los comandos alimentan el índice lateral'],
        ['<code>prose</code>', 'Texto libre en HTML'],
        ['<code>cmd</code>', 'Bloque de terminal con resaltado y botón de copiar'],
        ['<code>command</code>', 'Ficha completa de un comando: sinopsis, opciones, ejemplos y relacionados'],
        ['<code>callout</code>', 'Aviso destacado: <code>tip</code>, <code>warn</code>, <code>danger</code> o <code>info</code>'],
        ['<code>table</code>', 'Tabla con cabecera'],
        ['<code>steps</code>', 'Lista numerada de pasos, cada uno con su bloque de comandos'],
        ['<code>accordion</code>', 'Secciones plegables'],
        ['<code>grid</code>', 'Rejilla de tarjetas o de métricas'],
        ['<code>ascii</code>', 'Diagrama en texto monoespaciado'],
        ['<code>keys</code>', 'Lista de atajos de teclado'],
        ['<code>downloads</code>', 'Enlaces de descarga con tamaño'],
        ['<code>tiles</code>', 'Rejilla de enlaces a otras secciones']
      ]},
      { type: 'h2', id: 'convencion-lineas', text: 'Convención de los bloques de terminal' },
      { type: 'prose', html: '<p>El resaltador interpreta el prefijo de cada línea, así que el contenido se escribe como se leería en una terminal real:</p>' },
      { type: 'table', head: ['Prefijo', 'Se muestra como'], rows: [
        ['<code>$ comando</code>', 'Línea de comando con prompt de usuario'],
        ['<code># texto</code>', 'Comentario explicativo, en cursiva atenuada'],
        ['<code>!root comando</code>', 'Comando con prompt de root (<code>#</code>). Al copiar añade <code>sudo</code>'],
        ['<code>PS&gt; comando</code>', 'Línea de PowerShell'],
        ['<code>| salida</code>', 'Salida del programa, atenuada. <b>Se excluye al copiar</b>'],
        ['<code>(vacío)</code>', 'Línea en blanco de separación']
      ]},
      { type: 'callout', variant: 'tip', title: 'El botón de copiar es selectivo',
        html: '<p>Al copiar un bloque se omiten las líneas de salida (<code>|</code>) y se quitan los prompts, de modo que lo que llega al portapapeles es <b>directamente ejecutable</b>. Los comentarios se conservan, porque explican lo que se va a ejecutar.</p>' }
    ]
  });

})(window.Contenido);
