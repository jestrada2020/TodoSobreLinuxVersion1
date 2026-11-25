/* 11b-automatizacion.js — scripts listos para usar: comprimir y mover,
   comprimir-verificar-borrar, limpieza y cómo programarlos.
   El código se muestra desde window.ScriptsEmbebidos (11a, generado). */
(function (C) {
  'use strict';

  var DL = 'descargas/automatizacion/';

  C.registrar({
    id: 'auto-scripts',
    group: 'automatizacion',
    title: 'Scripts: respaldo, limpieza y búsqueda',
    level: 'intermedio',
    tags: ['automatizacion', 'script', 'bash', 'buscar', 'zip', 'respaldo', 'comprimir', 'mover', 'verificar', 'limpieza', 'latex', 'cron', 'systemd timer'],
    lead: 'Tres scripts de Bash para tareas repetitivas: <b>comprimir cada carpeta y llevarla a otro disco</b>, la misma tarea con <b>verificación completa y borrado seguro del origen</b>, y una <b>limpieza de temporales</b> en las unidades y con las extensiones que elijas, y un <b>buscador exhaustivo</b> que abre una terminal donde está lo encontrado. La última pestaña explica cómo programarlos.',
    blocks: [
      { type: 'cmd', label: 'Preparación (una sola vez)', lines: [
        '$ sudo apt install -y zip unzip python3',
        '$ mkdir -p ~/.local/bin',
        '# Copia el script descargado y hazlo ejecutable',
        '$ cp ~/Descargas/limpieza.sh ~/.local/bin/ && chmod +x ~/.local/bin/limpieza.sh',
        '$ limpieza.sh --help'
      ]},

      { type: 'tabs', id: 'auto-tabs', title: 'Scripts', items: [

        /* ---------------------------- 1. ORIGINAL ---------------------------- */
        { id: 'auto-comprimir', n: '1', t: 'Comprimir y mover', badge: 'original', badgeVariant: 'info',
          lead: '<code>comprimidoYmovimiento.sh</code> recorre las subcarpetas del ORIGEN, comprime cada una en su propio <code>.zip</code> y lo escribe directamente en el DESTINO. <b>No borra nada</b> del origen.',
          blocks: [
            { type: 'ascii', text:
'  ORIGEN/                         DESTINO/\n' +
'  ├── Fotos 2025/   ── zip ──►    ├── Fotos 2025.zip\n' +
'  ├── Proyectos/    ── zip ──►    ├── Proyectos.zip\n' +
'  └── .Trash-1000/  (se omite: carpeta oculta)\n' +
'\n' +
'  Cada zip se escribe primero como NOMBRE.zip.tmp y se renombra al terminar:\n' +
'  si se corta la luz, nunca queda un .zip a medias con el nombre bueno.' },
            { type: 'table', head: ['Comportamiento', 'Detalle'], monoFirst: false, rows: [
              ['Argumentos', '<code>ORIGEN DESTINO</code>; si faltan, los pregunta'],
              ['Carpetas ocultas', 'Se omiten (<code>.Trash-1000</code>, <code>.cache</code>…)'],
              ['Reanudar', 'Si el <code>.zip</code> ya existe en el destino, esa carpeta se salta'],
              ['Rutas dentro del zip', 'Relativas: el zip contiene <code>Fotos 2025/…</code>, no la ruta completa'],
              ['Errores', 'Si falla una compresión borra el temporal y sigue con la siguiente']
            ]},
            { type: 'cmd', label: 'Uso', lines: [
              '$ ./comprimidoYmovimiento.sh /media/$USER/JohnParte1 /media/$USER/DiscoDestino/Respaldos',
              '$ ./comprimidoYmovimiento.sh ~/Descargas /media/$USER/DiscoExterno/Documentos',
              '$ ./comprimidoYmovimiento.sh          # modo interactivo: pregunta las rutas',
              '',
              '# Comprobar después un zip a mano',
              '$ unzip -tq "/media/$USER/DiscoDestino/Respaldos/Proyectos.zip"'
            ]},
            { type: 'callout', variant: 'info', title: 'Qué no comprueba',
              html: '<p>Da por bueno un zip si <code>zip</code> terminó sin error, y salta los que ya existen aunque estén incompletos o la carpeta haya cambiado. Para respaldos que después vas a borrar del origen, usa la <a href="#auto-scripts/auto-verificar">versión avanzada</a>.</p>' },
            { type: 'script', file: 'comprimidoYmovimiento.sh', href: DL + 'comprimidoYmovimiento.sh', desc: 'versión original' }
          ]
        },

        /* ---------------------------- 2. AVANZADO ---------------------------- */
        { id: 'auto-verificar', n: '2', t: 'Comprimir, verificar y borrar', badge: 'avanzado', badgeVariant: 'warn',
          lead: '<code>comprimirMoverVerificar.sh</code> hace lo mismo y además <b>comprueba que el zip contiene todo</b> antes de <b>borrar la carpeta del origen</b>. Si algo no cuadra, el origen no se toca.',
          blocks: [
            { type: 'ascii', text:
'  por cada carpeta:\n' +
'\n' +
'  ¿hay espacio en DESTINO? ──no──► [SIN ESPACIO] se omite, origen intacto\n' +
'          │ sí\n' +
'          ▼\n' +
'  zip -r -y  →  DESTINO/carpeta.zip.tmp      (-y: enlaces como enlaces)\n' +
'          │\n' +
'  sync (vuelca a disco: imprescindible en memorias USB)\n' +
'          │\n' +
'  VERIFICAR  ─ todos los archivos, carpetas y enlaces están en el zip\n' +
'             ─ cada archivo tiene el mismo tamaño\n' +
'             ─ el zip no está dañado (CRC de cada entrada)\n' +
'             ─ con --estricto: mismo contenido byte a byte\n' +
'          │\n' +
'     ┌────┴─────┐\n' +
'    falla       ok\n' +
'     │           │\n' +
'  borra el    renombra a carpeta.zip → sync → BORRA la carpeta de origen\n' +
'  temporal,\n' +
'  origen intacto' },
            { type: 'table', head: ['Opción', 'Efecto'], rows: [
              ['-n, --simular', 'Muestra qué haría, sin escribir ni borrar nada. <b>Úsalo siempre la primera vez</b>'],
              ['-k, --conservar', 'Comprime y verifica, pero no borra el origen'],
              ['-s, --estricto', 'Verificación byte a byte: relee el origen (más lento, máxima seguridad)'],
              ['-y, --si', 'No pide escribir SI antes de empezar a borrar'],
              ['-l, --log ARCHIVO', 'Registro de la ejecución (por defecto en <code>DESTINO/.registro_FECHA.log</code>)']
            ]},
            { type: 'cmd', label: 'Uso recomendado', lines: [
              '# 1. Ver qué va a pasar',
              '$ ./comprimirMoverVerificar.sh -n /media/$USER/JohnParte1 /media/$USER/Respaldo',
              '',
              '# 2. Ejecutar con verificación estricta (pide escribir SI)',
              '$ ./comprimirMoverVerificar.sh -s /media/$USER/JohnParte1 /media/$USER/Respaldo',
              '',
              '# Solo respaldar y verificar, sin borrar nada',
              '$ ./comprimirMoverVerificar.sh -k ~/Proyectos /media/$USER/Respaldo/Proyectos',
              '',
              '# Si se interrumpió: repite el MISMO comando. Los zip ya creados se',
              '# vuelven a verificar y se completa el borrado pendiente.',
              '',
              '# Restaurar una carpeta',
              '$ cd ~/Restaurado && unzip "/media/$USER/Respaldo/Proyectos.zip"'
            ]},
            { type: 'table', head: ['Protección', 'Por qué'], monoFirst: false, rows: [
              ['El destino no puede estar dentro del origen', 'El zip se comprimiría a sí mismo y se borraría con la carpeta'],
              ['Rechaza <code>/</code>, <code>/home</code>, <code>/media</code>, <code>/usr</code>…', 'Evita borrar el sistema o carpetas de todos los usuarios por un error de ruta'],
              ['Pide escribir <code>SI</code>', 'El borrado no empieza por una pulsación accidental'],
              ['Bloqueo con <code>flock</code>', 'Dos ejecuciones simultáneas sobre el mismo destino no se pisan'],
              ['<kbd>Ctrl</kbd>+<kbd>C</kbd> limpio', 'Borra el temporal a medias; el origen queda intacto'],
              ['Nombres con tildes y ñ', 'El verificador recupera la codificación UTF-8 que <code>zip</code> 3.0 no marca'],
              ['Códigos de salida', '<code>0</code> todo bien · <code>1</code> error de uso · <code>2</code> alguna carpeta falló (útil en cron)']
            ]},
            { type: 'callout', variant: 'danger', title: 'Borra de verdad',
              html: '<p>Tras verificar, la carpeta de origen se elimina con <code>rm -rf</code> (no va a la papelera). Ensaya primero con <code>-n</code> y con <code>-k</code>, y comprueba un zip restaurándolo en otra carpeta. Un zip verificado protege frente a copias incompletas, <b>no</b> frente a que se estropee el disco de destino: para datos importantes conserva dos copias.</p>' },
            { type: 'callout', variant: 'tip', title: 'Probado',
              html: '<p>Se probó con nombres con espacios, tildes, ñ y corchetes, archivos ocultos, enlaces a archivos y a carpetas, carpetas vacías, un zip manipulado (se detecta y no se borra el origen), una carpeta que cambió después de comprimirla (no se borra) y una interrupción a mitad (el origen queda intacto). La carpeta restaurada desde el zip resultó idéntica a la original.</p>' },
            { type: 'script', file: 'comprimirMoverVerificar.sh', href: DL + 'comprimirMoverVerificar.sh', desc: 'comprime, verifica y borra el origen' }
          ]
        },

        /* ---------------------------- 3. LIMPIEZA ---------------------------- */
        { id: 'auto-limpieza', n: '3', t: 'Limpieza', badge: 'unidades + extensiones', badgeVariant: 'ok',
          lead: '<code>limpieza.sh</code> amplía <code>baseAuto.sh</code>: eliges <b>dónde</b> limpiar (carpetas o unidades por nombre, también con un menú) y <b>qué</b> borrar (extensiones adicionales o perfiles). Antes de borrar enseña cuántos archivos y cuánto ocupan, y pide confirmación.',
          blocks: [
            { type: 'table', head: ['Opción', 'Efecto'], rows: [
              ['RUTA …', 'Carpetas o puntos de montaje a limpiar (sin rutas: las de <code>RUTAS_POR_DEFECTO</code>)'],
              ['-u, --unidad NOMBRE', 'Unidad montada por su nombre: <code>-u KINGSTON -u CASORES</code>'],
              ['-i, --interactivo', 'Menú con las unidades montadas y pregunta de extensiones extra'],
              ['-L, --listar-unidades', 'Lista las unidades montadas con tamaño y uso'],
              ['-e, --ext LISTA', 'Extensiones <b>adicionales</b>: <code>-e bbl,blg -e fls</code> (acepta <code>log</code>, <code>.log</code> o <code>*.log</code>)'],
              ['-E, --solo-ext LISTA', 'Usa <b>solo</b> esas extensiones'],
              ['-p, --perfil NOMBRE', '<code>latex</code>, <code>python</code>, <code>editores</code> o <code>todo</code>'],
              ['-x, --excluir PATRÓN', 'Carpetas en las que no entrar (por defecto <code>.git</code>, <code>node_modules</code>, <code>.venv</code>, <code>.Trash-1000</code>)'],
              ['-n, --simular', 'Lista lo que borraría, sin borrar'],
              ['-t, --papelera', 'Envía a la papelera en lugar de borrar'],
              ['-y, --si', 'Sin confirmación (para cron)'],
              ['-a, --actualizar', '<code>apt-get update && upgrade</code> antes de limpiar, como baseAuto.sh (requiere sudo)']
            ]},
            { type: 'table', head: ['Perfil', 'Extensiones'], monoFirst: false, rows: [
              ['<b>predeterminadas</b>', '<code>toc log aux out synctex.gz</code> (las de baseAuto.sh)'],
              ['<b>latex</b>', '<code>toc log aux out synctex.gz nav snm vrb bbl blg bcf run.xml fls fdb_latexmk lof lot xdv idx ilg ind</code>'],
              ['<b>python</b>', '<code>pyc pyo</code>'],
              ['<b>editores</b>', '<code>swp swo bak orig</code>']
            ]},
            { type: 'cmd', label: 'Ejemplos', lines: [
              '# ¿Qué unidades hay montadas?',
              '$ ./limpieza.sh -L',
              '',
              '# Ver qué borraría con la configuración por defecto',
              '$ ./limpieza.sh -n',
              '',
              '# Dos memorias USB, con todos los auxiliares de LaTeX',
              '$ ./limpieza.sh -u KINGSTON -u CASORES -p latex',
              '',
              '# Una carpeta concreta, añadiendo .bak y .tmp',
              '$ ./limpieza.sh -e bak,tmp ~/Documentos/FACULTADCnuevo2025Enero',
              '',
              '# Elegir en un menú',
              '$ ./limpieza.sh -i',
              '',
              '# Como el baseAuto.sh original: actualizar y limpiar sin preguntar',
              '$ sudo ./limpieza.sh -a -y'
            ]},
            { type: 'table', head: ['Mejora frente a baseAuto.sh', 'Detalle'], monoFirst: false, rows: [
              ['Rutas duplicadas o anidadas', 'baseAuto.sh repetía <code>CASORES</code> y recorría <code>/home</code> y luego varias de sus subcarpetas. Ahora cada archivo se examina una sola vez'],
              ['Rutas del usuario', 'Usa <code>/media/USUARIO</code> y la carpeta personal reales aunque se ejecute con sudo'],
              ['No cruza de disco (<code>-xdev</code>)', 'Limpiar <code>~</code> no entra en las unidades montadas dentro'],
              ['Extensiones protegidas', 'Rechaza <code>.tex</code>, <code>.pdf</code>, <code>.py</code>, <code>.sh</code>… para evitar un borrado catastrófico por error'],
              ['Sin comodines accidentales', '<code>-e "*.pyc"</code> nunca se expande a los archivos de la carpeta actual'],
              ['sudo solo si hace falta', 'Solo <code>-a</code> requiere root; limpiar tus carpetas no']
            ]},
            { type: 'callout', variant: 'warn', title: '.log en toda la carpeta personal',
              html: '<p>La lista por defecto (heredada de baseAuto.sh) incluye <code>.log</code> en toda tu carpeta personal: también borra registros de otras aplicaciones (en <code>~/.local</code>, <code>~/.config</code>…). Suele ser inofensivo, pero revisa la simulación con <code>-n</code>. Si solo quieres limpiar proyectos LaTeX, indica sus carpetas en lugar de <code>~</code>.</p>' },
            { type: 'script', file: 'limpieza.sh', href: DL + 'limpieza.sh', desc: 'limpieza por unidades y extensiones' },
            { type: 'script', file: 'baseAuto.sh', href: DL + 'baseAuto.sh', desc: 'script original de referencia' }
          ]
        },

        /* ----------------------------- 4. BUSCAR ---------------------------- */
        { id: 'auto-buscar', n: '4', t: 'Buscar en el sistema', badge: 'abre terminal', badgeVariant: 'info',
          lead: '<code>buscarEnSistema.sh</code> busca archivos o carpetas en <b>todo el sistema</b> (incluidas las memorias USB y discos montados), muestra la <b>ruta completa</b> de cada resultado con su tamaño y fecha, y <b>abre una terminal en la carpeta</b> donde está lo encontrado.',
          blocks: [
            { type: 'ascii', text:
'  $ buscarEnSistema.sh informe\n' +
'  Buscando \'informe\' en / …\n' +
'  3 resultado(s) en 17s\n' +
'\n' +
'     1) [archivo]  396K  2026-11-25 12:30  /home/john/Documentos/informe_final.pdf\n' +
'     2) [carpeta]  1.2M  2026-06-19 07:26  /media/john/kistom/Informes 2026\n' +
'     3) [archivo]   18K  2026-06-19 07:26  /media/john/CASORES/backup/informe.ods\n' +
'\n' +
'  Número a abrir (varios separados por espacios, Enter para salir): 2\n' +
'  Ruta completa: /media/john/kistom/Informes 2026      (copiada al portapapeles)\n' +
'  Terminal abierta en: /media/john/kistom/Informes 2026 (ptyxis)' },
            { type: 'table', head: ['Opción', 'Efecto'], rows: [
              ['PATRÓN', 'Parte del nombre, sin distinguir mayúsculas (<code>informe</code> = <code>*informe*</code>), o comodín explícito (<code>"*.pdf"</code>)'],
              ['RUTA …', 'Dónde buscar. Por defecto <code>/</code> completo, con los USB montados'],
              ['-t f | -t d', 'Solo archivos o solo carpetas'],
              ['-e, --exacto', 'Nombre exacto, distinguiendo mayúsculas'],
              ['-r, --regex', 'Expresión regular sobre la ruta: <code>-r \'informe_20(25|26)\'</code>'],
              ['-c, --contenido TEXTO', 'Archivos cuyo contenido incluye TEXTO'],
              ['-a N / -T TAMAÑO', 'Modificados en los últimos N días / por tamaño (<code>+100M</code>, <code>-1k</code>)'],
              ['-s, --sudo', 'Busca también en carpetas de otros usuarios y del sistema'],
              ['-l, --local', 'Sin USB ni discos externos (mucho más rápido)'],
              ['-g, --gestor', 'Abre el gestor de archivos con el archivo seleccionado, en vez de la terminal'],
              ['-1, --primero', 'Abre el primer resultado sin preguntar'],
              ['-n, --no-abrir', 'Solo lista'],
              ['-p, --rutas', 'Solo rutas, una por línea, para tuberías'],
              ['-o ARCHIVO / -m N', 'Guardar las rutas en un archivo / máximo de resultados (300)']
            ]},
            { type: 'cmd', label: 'Ejemplos', lines: [
              '$ buscarEnSistema.sh informe_final',
              '$ buscarEnSistema.sh -t d Astro_Luna                 # una carpeta',
              '$ buscarEnSistema.sh "*.tex" ~/Documentos            # en una ruta concreta',
              '$ buscarEnSistema.sh -c "def calcular" "*.py" ~/proyectos   # por contenido',
              '$ buscarEnSistema.sh -s sshd_config                  # archivos del sistema',
              '$ buscarEnSistema.sh -T +1G -n ""                    # archivos de más de 1 GB',
              '$ buscarEnSistema.sh -a 2 -t f ""  ~                 # lo modificado en 2 días',
              '$ buscarEnSistema.sh -g tesis.pdf                    # abrir en el gestor de archivos',
              '',
              '# Usar los resultados en otros comandos',
              '$ buscarEnSistema.sh -p "*.ipynb" | xargs -d \'\\n\' ls -lh'
            ]},
            { type: 'table', head: ['Detalle', 'Cómo lo resuelve'], monoFirst: false, rows: [
              ['Exhaustiva pero sin perder tiempo', 'Recorre todos los discos, pero salta <code>/proc</code>, <code>/sys</code>, <code>/dev</code>, <code>/run</code> y las imágenes de snap, que no contienen archivos reales'],
              ['Terminal correcta', 'Detecta Ptyxis (Ubuntu 25.10), GNOME Terminal, Konsole, Xfce, Kitty, Alacritty, Tilix, WezTerm, foot y xterm; respeta la variable <code>$TERMINAL</code>'],
              ['Sin escritorio (SSH)', 'Abre una shell nueva directamente en la carpeta encontrada (<code>exit</code> para volver)'],
              ['Ejecutado con sudo', 'La ventana se abre como tu usuario, no como root'],
              ['Si es un archivo', 'La terminal se abre en la carpeta que lo contiene; la ruta completa queda en el portapapeles (con <code>wl-clipboard</code> o <code>xclip</code>)'],
              ['Enlaces simbólicos', 'No los sigue: evita resultados duplicados y bucles infinitos'],
              ['Nombres raros', 'Espacios, tildes, ñ y corchetes funcionan (se usan separadores NUL)']
            ]},
            { type: 'callout', variant: 'info', title: 'Tiempo de búsqueda',
              html: '<p>En este equipo, todo el sistema con dos memorias USB tarda unos 17 s; solo los discos internos (<code>-l</code>), unos 6 s. Para búsquedas instantáneas repetidas, instala <code>plocate</code> (<code>sudo apt install plocate</code>), que consulta un índice; a cambio, no ve lo creado desde la última actualización del índice.</p>' },
            { type: 'callout', variant: 'tip', title: 'Para que «cd» funcione en TU terminal actual',
              html: '<p>Un script no puede cambiar la carpeta de la terminal que lo llamó; por eso abre una nueva. Si prefieres moverte en la misma, añade a <code>~/.bashrc</code>:</p><p><code>ir() { local r; r=$(buscarEnSistema.sh -p -m 1 "$@") && cd "$( [ -d "$r" ] && echo "$r" || dirname "$r")"; }</code></p><p>y usa <code>ir informe_final</code>.</p>' },
            { type: 'script', file: 'buscarEnSistema.sh', href: DL + 'buscarEnSistema.sh', desc: 'búsqueda exhaustiva y apertura de terminal' }
          ]
        },

        /* ---------------------------- 5. PROGRAMAR --------------------------- */
        { id: 'auto-programar', n: '5', t: 'Programar y ejecutar',
          lead: 'Cómo dejar los scripts a mano y ejecutarlos de forma automática.',
          blocks: [
            { type: 'cmd', label: 'Alias en ~/.bashrc', lines: [
              '$ cat >> ~/.bashrc <<\'EOF\'',
              'alias respaldar="comprimirMoverVerificar.sh -s"',
              'alias limpiar="limpieza.sh -p latex"',
              'EOF',
              '$ source ~/.bashrc'
            ]},
            { type: 'cmd', label: 'cron: limpieza cada domingo a las 9:00', lines: [
              '$ crontab -e',
              '# min hora día mes díasemana  comando',
              '0 9 * * 0  $HOME/.local/bin/limpieza.sh -y -p latex >> $HOME/limpieza.log 2>&1',
              '',
              '$ crontab -l'
            ]},
            { type: 'cmd', label: 'Temporizador de systemd (más control que cron)', lines: [
              '$ mkdir -p ~/.config/systemd/user',
              '$ cat > ~/.config/systemd/user/limpieza.service <<\'EOF\'',
              '[Unit]',
              'Description=Limpieza de temporales',
              '[Service]',
              'Type=oneshot',
              'ExecStart=%h/.local/bin/limpieza.sh -y -p latex',
              'EOF',
              '',
              '$ cat > ~/.config/systemd/user/limpieza.timer <<\'EOF\'',
              '[Unit]',
              'Description=Limpieza semanal',
              '[Timer]',
              'OnCalendar=Sun 09:00',
              'Persistent=true',
              '[Install]',
              'WantedBy=timers.target',
              'EOF',
              '',
              '$ systemctl --user daemon-reload',
              '$ systemctl --user enable --now limpieza.timer',
              '$ systemctl --user list-timers',
              '$ journalctl --user -u limpieza.service -n 50'
            ]},
            { type: 'callout', variant: 'tip', title: 'Persistent=true',
              html: '<p>Si el equipo estaba apagado a la hora programada, systemd ejecuta la tarea al encender. cron, en cambio, se la salta. Por eso el temporizador es mejor en un portátil.</p>' },
            { type: 'callout', variant: 'warn', title: 'No programes el borrado del origen sin supervisión',
              html: '<p><code>comprimirMoverVerificar.sh</code> borra datos. Si lo automatizas, usa <code>-k</code> (conservar) o revisa el registro y el código de salida: un <code>2</code> significa que alguna carpeta falló.</p>' },
            { type: 'cmd', label: 'Revisar un script antes de usarlo', lines: [
              '$ bash -n limpieza.sh                    # solo comprueba la sintaxis',
              '$ sudo apt install -y shellcheck',
              '$ shellcheck limpieza.sh                 # avisos de errores habituales',
              '$ bash -x limpieza.sh -n ~/Documentos    # traza cada línea ejecutada'
            ]}
          ]
        }
      ]}
    ]
  });

})(window.Contenido);
