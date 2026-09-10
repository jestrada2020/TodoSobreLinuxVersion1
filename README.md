# Todo en Linux

Curso de referencia en español sobre Linux y Ubuntu, como aplicación web
**estática**: sin build, sin dependencias y sin servidor. Se abre y funciona.

Reescritura de la aplicación anterior con una arquitectura distinta: el contenido
vive en **módulos de datos** y un renderizador los convierte en páginas. Eso es lo
que permite que el buscador indexe cada opción de cada comando.

## Ejecutar

```bash
# Opción 1: abrir directamente
xdg-open index.html

# Opción 2: servidor local (recomendado; el portapapeles necesita
# contexto seguro en algunos navegadores)
python3 -m http.server 8000
# → http://localhost:8000
```

## Qué incluye

| | |
|---|---|
| **29 secciones** | agrupadas en 10 áreas temáticas |
| **38 comandos** | con sinopsis, tabla de opciones, ejemplos y relacionados |
| **184 entradas** | indexadas para el buscador de texto completo |
| **256 filas ASCII** | generadas desde datos, con filtro y conversor interactivo |
| **88 símbolos** | en tarjetas, con copia a un clic y atajos de Linux y Windows |
| **1 kit descargable** | arnés de agente con modelos locales, en `descargas/` |

Áreas: fundamentos · sistema de archivos · terminal y shell · administración ·
redes · paquetes y hardware · rescate y emergencias · IA y agentes · referencia.

## Mejoras respecto a la versión anterior

**Interfaz**

- **Tema claro, oscuro y automático** (sigue al sistema operativo), con paleta
  completa de tokens CSS y persistencia.
- **Buscador tipo paleta de comandos** (<kbd>Ctrl</kbd>+<kbd>K</kbd>) que indexa
  **todo** el contenido —comandos, opciones, ejemplos y prosa—, no solo los
  títulos del menú. Insensible a acentos y con soporte de varias palabras.
- **Índice lateral** por página, con resaltado de la sección visible según se
  hace scroll (`IntersectionObserver`).
- **Navegación por teclado** completa: `j`/`k` entre secciones, `t` tema,
  `m` marcar leída, `g` inicio, `/` buscar, `?` ayuda.
- **Seguimiento de progreso**: marcar secciones como leídas, favoritos y anillo
  de progreso en el menú.
- **Migas de pan**, navegación anterior/siguiente y barra de progreso de lectura.
- **Estilos de impresión**: cada sección se exporta a PDF sin interfaz y con las
  URL de los enlaces visibles.
- **Responsive real**: comprobado sin scroll horizontal a 360, 390, 768 y 1440 px.

**Contenido**

- Fichas de comando estructuradas en lugar de bloques de texto: sinopsis, tabla
  de opciones explicadas, ejemplos agrupados por objetivo, avisos y comandos
  relacionados.
- Se explica **por qué**, no solo **cómo**: el orden de expansión de Bash, por qué
  `2>&1` no es conmutable, por qué la barra final de `rsync` cambia el resultado,
  por qué `chmod 777` casi nunca es la respuesta.
- Avisos de peligro en los comandos destructivos, con la alternativa segura.
- Diagramas ASCII para la jerarquía FHS, los flujos de un proceso, las fases del
  arranque y el ciclo de los subagentes.
- **Tabla de código ASCII completa** (0-255) generada desde datos, con filtro en
  vivo insensible a acentos y notas de lo que significa cada símbolo en Bash, más
  un **conversor interactivo** texto ⇄ decimal/hex/octal/binario.
- **Símbolos de acceso rápido en tarjetas**: 88 símbolos con el glifo grande,
  su código decimal y hexadecimal, y los atajos de **Linux** (`Ctrl+Shift+U`) y
  **Windows** (`Alt`). Un clic copia el carácter o la combinación de teclas.
  Se filtran por categoría (más usados, español, matemáticos, marcos y flechas)
  y por texto.
- **Configuración de teclado** para Linux (`setxkbmap`, `localectl`, `gsettings`,
  `loadkeys`), Windows y macOS, incluido el caso que más confunde: por qué el
  cambio se pierde al reiniciar y por qué Wayland ignora `setxkbmap`.

**Arquitectura**

- Contenido separado de la presentación: añadir una sección es registrar un
  objeto en `js/data/`, sin tocar el HTML ni el CSS.
- Resaltador de sintaxis de shell propio, sin dependencias.
- El botón de copiar quita los prompts y **excluye las líneas de salida**, así que
  lo que llega al portapapeles es directamente ejecutable.

## Estructura

```
TODO_EN_LINUX/
├── index.html            estructura de la aplicación
├── css/
│   ├── base.css          tokens de diseño, temas y reset
│   ├── layout.css        rejilla, menú, índice, responsive, impresión
│   └── components.css    tarjetas, bloques de comando, tablas, avisos
├── js/core/
│   ├── store.js          estado y persistencia (localStorage, con try/catch)
│   ├── highlight.js      resaltado de sintaxis de shell
│   ├── ascii.js          genera las tablas ASCII desde datos
│   ├── render.js         convierte los bloques de datos en HTML
│   ├── search.js         índice de búsqueda de texto completo
│   └── app.js            enrutado por hash, menú, índice, tema, atajos
├── js/data/              EL CONTENIDO
│   ├── 00-catalogo.js    registro de grupos y secciones
│   ├── 01-introduccion.js … 14-ascii-teclado.js
│   └── 99-atajos.js
└── descargas/            kit de agente (.zip y .tar.gz)
```

## Añadir contenido

```javascript
// en cualquier archivo de js/data/
(function (C) {
  C.registrar({
    id: 'mi-seccion',
    group: 'terminal',          // debe existir en 00-catalogo.js
    title: 'Mi sección',
    level: 'basico',            // basico | intermedio | avanzado
    tags: ['palabra', 'clave'],
    lead: 'Introducción con <b>HTML</b> permitido.',
    blocks: [
      { type: 'h2', id: 'apartado', text: 'Un apartado' },
      { type: 'prose', html: '<p>Texto normal.</p>' },
      { type: 'cmd', label: 'ejemplo', lines: ['$ ls -la', '| total 48'] },
      { type: 'callout', variant: 'tip', title: 'Consejo', html: '<p>…</p>' }
    ]
  });
})(window.Contenido);
```

Si creas un archivo nuevo, añade su `<script>` en `index.html` **antes** de
`js/core/app.js`. El menú, el índice y el buscador se generan solos.

Tipos de bloque disponibles: `h2`, `h3`, `prose`, `cmd`, `command`, `callout`,
`table`, `steps`, `accordion`, `grid`, `ascii`, `keys`, `downloads`, `tiles`,
`asciitable` (tabla ASCII generada y filtrable), `asciitool` (conversor) y
`simbolos` (tarjetas de símbolos con copia a un clic).

### Convención de los bloques de terminal

| Prefijo | Se muestra como |
|---|---|
| `$ comando` | línea de comando con prompt de usuario |
| `# texto` | comentario explicativo |
| `!root comando` | comando con prompt de root; al copiar añade `sudo` |
| `PS> comando` | línea de PowerShell |
| `\| salida` | salida del programa; **se excluye al copiar** |

## Privacidad

Tema, progreso y favoritos se guardan en el `localStorage` del navegador, solo en
ese equipo. La aplicación es estática: **no envía nada a ningún servidor** y
funciona sin conexión.

## Compatibilidad

Navegadores actuales (Chrome, Firefox, Safari, Edge). Usa `IntersectionObserver`,
`color-mix()` y propiedades personalizadas de CSS. El portapapeles recurre a
`execCommand` cuando no hay contexto seguro, para que funcione también con
`file://`.
