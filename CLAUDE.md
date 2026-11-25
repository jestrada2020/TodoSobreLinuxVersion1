# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Qué es

**Todo en Linux**: curso de referencia en español sobre Linux/Ubuntu como
aplicación web **estática** (HTML + CSS + JS, sin build ni dependencias).
Todo el contenido está en español.

```bash
xdg-open index.html              # o:
python3 -m http.server 8000      # http://localhost:8000
```

## Arquitectura (contenido como datos)

- `index.html` — solo el armazón (sidebar, barra superior, paleta de búsqueda)
  y la lista de `<script>`. **No contiene contenido.**
- `js/core/`
  - `store.js` — estado en localStorage (tema, leídas, favoritos), con try/catch.
  - `highlight.js` — resaltado de shell y texto para el botón Copiar.
  - `render.js` — convierte bloques de datos en HTML (un manejador por `type`).
  - `search.js` — índice de texto completo (recursivo: entra en pestañas).
  - `app.js` — enrutado por hash `#seccion/ancla`, menú, TOC, pestañas, atajos.
  - `ascii.js` — datos de las tablas ASCII y símbolos.
- `js/data/NN-*.js` — **el contenido**. Cada archivo llama a
  `Contenido.registrar({...})`. `00-catalogo.js` define los grupos; el orden de
  las claves de `grupos` es el orden del menú y de «Anterior/Siguiente».
- `css/base.css` (tokens y temas claro/oscuro/auto), `layout.css`, `components.css`.
- `_legado/` — versión anterior (js/tabs, main.js, navigation.js, styles.css,
  anti.html). No se carga; se conserva solo como referencia.

## Grupos y secciones

| Grupo | Archivo | Secciones |
|---|---|---|
| automatizacion | `11b-automatizacion.js` (+ `11a-scripts-embebidos.js`, generado) | auto-scripts (pestañas: comprimir y mover, comprimir-verificar-borrar, limpieza, programar) |
| datos (Datos y Python) | `09b-datos.js` | datos-base, datos-python, datos-conda, datos-jupyter, datos-problemas |
| rescate | `10-rescate.js` | resc-triage, resc-grub, resc-sistema, resc-paquetes, resc-timeshift, resc-datos |
| ia | `12-ia-clis.js` | ia-clis (requisitos), ia-claude, ia-codex, ia-gemini, ia-antigravity, ia-kimi |
| ia | `12b-ia-local.js`, `13-agentes.js` | ia-ollama, ia-dsh, ag-harness, ag-kit |
| instalar (Instalar software) | `09d-instalar.js` | inst-python, inst-manim, inst-latex, inst-r, inst-r-datos, inst-apps, inst-conda (constructores pyver y rpaq, también en la pestaña «Instalar» del hub) |
| capacitacion | `13b-capacitacion.js` | cap-eafit (pestañas OpenCode, Jupyter y Materiales; archivos en `descargas/capacitacion-eafit-2026/`) |

## Añadir contenido

1. Registra la sección en un archivo de `js/data/` (`id`, `group`, `title`,
   `level`, `tags`, `lead`, `blocks`).
2. Si el archivo es nuevo, añade su `<script>` en `index.html` antes de
   `js/core/app.js`.
3. Menú, índice lateral y buscador se generan solos.

Tipos de bloque: `h2`, `h3`, `prose`, `cmd`, `command`, `callout`
(`info|tip|warn|danger`), `table`, `steps`, `accordion`, `grid`, `tiles`,
`ascii`, `keys`, `downloads` (con `open: true` se abre en pestaña nueva), `script` (visor de un .sh embebido), `chmodcalc` (calculadora de permisos), `builder` (constructor de comandos), `tabs`, `sos`, `asciitable`, `asciitool`, `simbolos`.

### Pestañas (`tabs`)

```js
{ type: 'tabs', id: 'grub-tabs', title: 'Escenarios', items: [
  { id: 'grub-uefi', n: '3', t: 'Reinstalar (UEFI)', badge: 'USB en vivo',
    badgeVariant: 'warn', lead: 'HTML opcional', blocks: [ /* bloques */ ] }
]}
```

Cada pestaña con `id` aparece en el índice lateral, en el buscador y se puede
enlazar: `#resc-grub/grub-uefi` abre la sección con esa pestaña activa. Los
`id` deben ser únicos dentro de la sección.

### Líneas de los bloques `cmd`

| Prefijo | Se muestra | Al copiar |
|---|---|---|
| `$ cmd` | prompt de usuario | `cmd` |
| `!root cmd` | prompt `#` | `sudo cmd` |
| `chroot> cmd` | `(chroot)#` | `cmd` |
| `grub> ` / `grub rescue> ` / `(initramfs) ` | ese prompt | `cmd` |
| `PS> cmd` | PowerShell | `cmd` |
| `# texto` | comentario | se copia |
| `\| salida` | salida | **se excluye** |

No escribas prompts como `(.venv) $`: se tratarían como salida.

## Convenciones

- Comandos realistas para Ubuntu 22.04/24.04, comentados en español.
- En operaciones destructivas: aviso `danger` con la alternativa segura.
- Comandos de instalación de herramientas externas (CLIs de IA, uv, conda):
  verificar contra la documentación oficial antes de cambiarlos; cambian a menudo.
- Enlaces internos con `href="#seccion/ancla"`.

## Constructores de comandos (`builder`)

Definidos todos en `js/data/95-constructores.js` (se carga después del
contenido): cada uno se inserta junto a la explicación de su comando con
`insertar({sec|tab, antes|despues|inicio}, bloque)` y se reúnen en la sección
`constructores`. Campos: `text`, `select`, `check` con `flag`, `pos`, `at`
(`pre|start|end`), `help` (`{v}` = valor), `warn`; `combine:true` agrupa
opciones cortas (`-czv`); `build(v, citar)` para comandos de varias líneas y
`avisos(v)` para advertencias que dependen de la combinación. Prueba: pulsar
todos los casos típicos y pasar cada comando por `bash -n`.

## Scripts de automatización

Los `.sh` viven en `descargas/automatizacion/`. El bloque `script` los muestra
desde `window.ScriptsEmbebidos` (Chrome no permite `fetch` con `file://`).
**Tras modificar cualquier `.sh` ejecuta:** `python3 herramientas/embeber_scripts.py`.

## Comprobaciones tras editar

```bash
for f in js/core/*.js js/data/*.js; do node --check "$f"; done
```

Y abrir la app: sin errores en consola, sin scroll horizontal a 360 px.
