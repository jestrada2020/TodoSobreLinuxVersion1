/* 01-introduccion.js — Fundamentos: qué es Linux, distribuciones, la jerarquía */
(function (C) {
  'use strict';

  C.registrar({
    id: 'intro-linux',
    group: 'intro',
    title: 'Qué es Linux realmente',
    level: 'basico',
    tags: ['kernel', 'gnu', 'distribucion', 'shell', 'uname'],
    lead: 'Separar el <b>kernel</b> del <b>sistema operativo</b> completo es lo que hace que todo lo demás encaje: explica por qué hay tantas distribuciones, por qué los comandos son los mismos en todas y qué cambia en realidad entre Ubuntu y Fedora.',
    blocks: [
      { type: 'h2', id: 'capas', text: 'Las capas de un sistema Linux' },
      { type: 'prose', html: '<p>Lo que llamamos «Linux» son en realidad varias capas apiladas. Cuando algo no funciona, identificar <em>en qué capa</em> está el problema es la mitad del diagnóstico.</p>' },
      { type: 'ascii', text:
'┌─────────────────────────────────────────────────────────┐\n' +
'│ APLICACIONES        Firefox · VS Code · GIMP · tu script │\n' +
'├─────────────────────────────────────────────────────────┤\n' +
'│ ENTORNO DE ESCRITORIO   GNOME · KDE · XFCE  (opcional)  │\n' +
'├─────────────────────────────────────────────────────────┤\n' +
'│ SHELL Y UTILIDADES GNU  bash · ls · grep · coreutils    │\n' +
'├─────────────────────────────────────────────────────────┤\n' +
'│ BIBLIOTECAS         glibc · libssl · libstdc++          │\n' +
'├─────────────────────────────────────────────────────────┤\n' +
'│ KERNEL LINUX        procesos · memoria · drivers · red  │  ← esto es "Linux"\n' +
'├─────────────────────────────────────────────────────────┤\n' +
'│ HARDWARE            CPU · RAM · disco · tarjeta de red  │\n' +
'└─────────────────────────────────────────────────────────┘' },
      { type: 'callout', variant: 'info', title: 'Por qué importa esta distinción',
        html: '<p>El kernel solo gestiona recursos: procesos, memoria, sistemas de archivos y hardware. Todo lo que tú <em>escribes</em> en la terminal (<code>ls</code>, <code>cp</code>, <code>grep</code>) son programas GNU independientes. Por eso <code>ls</code> funciona igual en Ubuntu, Fedora y Arch: es el mismo programa. Lo que cambia entre distribuciones es el <strong>empaquetado</strong>, no las herramientas.</p>' },

      { type: 'h2', id: 'identificar', text: 'Identificar el sistema en el que estás' },
      { type: 'prose', html: '<p>Antes de seguir cualquier tutorial, comprueba dónde estás. Un comando de Ubuntu puede no existir en Fedora.</p>' },
      { type: 'command', name: 'uname', tagline: 'información del kernel', level: 'basico',
        synopsis: 'uname [-a] [-r] [-m] [-s]',
        desc: 'Imprime datos del <b>kernel</b>, no de la distribución. Es el primer comando que ejecutas en una máquina desconocida.',
        options: [
          ['-a', 'Todo junto: kernel, versión, arquitectura y nombre de host'],
          ['-r', 'Solo la versión del kernel (lo que necesitas para drivers y módulos)'],
          ['-m', 'Arquitectura: <code>x86_64</code>, <code>aarch64</code> (ARM), <code>i686</code> (32 bits)'],
          ['-s', 'Nombre del kernel: <code>Linux</code>'],
          ['-n', 'Nombre de host de la máquina']
        ],
        examples: [
          { label: 'Reconocimiento inicial', lines: [
            '# Versión del kernel: decide qué drivers y módulos puedes usar',
            '$ uname -r',
            '| 6.17.0-41-generic',
            '',
            '# Arquitectura: x86_64 = 64 bits Intel/AMD, aarch64 = ARM',
            '$ uname -m',
            '| x86_64',
            '',
            '# Todo de una vez',
            '$ uname -a'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p><code>uname</code> te dice el <em>kernel</em>. Para saber la <em>distribución</em> necesitas <code>lsb_release -a</code> o <code>/etc/os-release</code>: son cosas distintas.</p>' }],
        seealso: ['lsb_release', 'hostnamectl', '/etc/os-release']
      },
      { type: 'cmd', label: 'Identificar la distribución (funciona en todas)', lines: [
        '# El archivo estándar: existe en cualquier distribución moderna',
        '$ cat /etc/os-release',
        '| NAME="Ubuntu"',
        '| VERSION="24.04.1 LTS (Noble Numbat)"',
        '| ID=ubuntu',
        '| ID_LIKE=debian',
        '',
        '# Solo el nombre bonito, para scripts',
        '$ grep PRETTY_NAME /etc/os-release',
        '',
        '# Alternativa en Debian/Ubuntu (a veces hay que instalarla)',
        '$ lsb_release -a',
        '',
        '# Resumen del sistema, del propio systemd',
        '$ hostnamectl'
      ]},
      { type: 'callout', variant: 'tip', title: 'El campo que de verdad importa: ID_LIKE',
        html: '<p>Si <code>ID_LIKE=debian</code>, los comandos <code>apt</code> de cualquier tutorial de Debian o Ubuntu te sirven. Si dice <code>rhel fedora</code>, necesitas <code>dnf</code>. Este campo es lo que traduce un tutorial ajeno a tu sistema.</p>' },

      { type: 'h2', id: 'distros', text: 'Qué distribución elegir' },
      { type: 'prose', html: '<p>Las diferencias reales entre distribuciones se reducen a tres decisiones: <b>gestor de paquetes</b>, <b>ciclo de publicación</b> y <b>políticas por defecto</b>. Todo lo demás es cosmético.</p>' },
      { type: 'table', head: ['Distribución', 'Paquetes', 'Publicación', 'Para quién'], monoFirst: false, rows: [
        ['<b>Ubuntu LTS</b>', '<code>apt</code> / <code>.deb</code>', 'Fija, 5 años de soporte', 'Escritorio y servidores. La que más documentación tiene en español. <b>Empieza aquí</b> si dudas.'],
        ['<b>Debian Stable</b>', '<code>apt</code> / <code>.deb</code>', 'Fija, muy conservadora', 'Servidores donde la estabilidad importa más que tener lo último.'],
        ['<b>Linux Mint</b>', '<code>apt</code> / <code>.deb</code>', 'Sigue a Ubuntu LTS', 'Quien viene de Windows: el escritorio Cinnamon resulta familiar.'],
        ['<b>Fedora</b>', '<code>dnf</code> / <code>.rpm</code>', 'Semestral', 'Desarrolladores que quieren versiones recientes con respaldo de Red Hat.'],
        ['<b>Arch</b>', '<code>pacman</code>', 'Rolling (continua)', 'Quien quiere controlar cada pieza y no le importa dedicar tiempo.'],
        ['<b>openSUSE</b>', '<code>zypper</code> / <code>.rpm</code>', 'Fija o rolling', 'Administradores: YaST y snapshots con Btrfs por defecto.']
      ]},
      { type: 'callout', variant: 'warn', title: 'LTS frente a versión normal',
        html: '<p><b>LTS</b> (<i>Long Term Support</i>) significa 5 años de actualizaciones de seguridad en Ubuntu. Una versión no-LTS solo recibe 9 meses. Para una máquina de trabajo o un servidor, elige LTS: reinstalar el sistema cada 9 meses no es una estrategia.</p>' },

      { type: 'h2', id: 'terminal-primeros', text: 'Tus primeros cinco comandos' },
      { type: 'prose', html: '<p>Con estos cinco puedes orientarte en cualquier máquina Linux sin romper nada, porque ninguno modifica el sistema.</p>' },
      { type: 'cmd', label: 'Orientarse sin riesgo', lines: [
        '$ pwd                 # ¿Dónde estoy? (print working directory)',
        '$ ls -la              # ¿Qué hay aquí? (-l detalle, -a incluye ocultos)',
        '$ cd /etc             # Ir a un sitio',
        '$ whoami              # ¿Quién soy?',
        '$ man ls              # ¿Cómo funciona esto? (q para salir)'
      ]},
      { type: 'callout', variant: 'tip', title: 'Los tres hábitos que más tiempo ahorran',
        html: '<ul><li><b>Tabulador</b> autocompleta rutas y comandos. Pulsa <kbd>Tab</kbd> dos veces para ver todas las opciones. No escribas rutas largas a mano nunca.</li><li><b>Flecha arriba</b> recupera comandos anteriores; <kbd>Ctrl</kbd>+<kbd>R</kbd> los busca por texto.</li><li><b>Antes de un comando destructivo</b>, ejecútalo primero con <code>ls</code> o <code>echo</code> delante para ver a qué archivos afectaría.</li></ul>' }
    ]
  });

  C.registrar({
    id: 'fs-hierarchy',
    group: 'archivos',
    title: 'La jerarquía del sistema (FHS)',
    level: 'basico',
    tags: ['fhs', '/etc', '/var', '/usr', '/proc', 'df', 'du'],
    lead: 'En Linux <b>no hay unidades C: ni D:</b>. Existe un único árbol que arranca en <code>/</code> y todo cuelga de ahí, incluidos los discos externos. Saber qué significa cada directorio te dice dónde buscar un archivo de configuración, un registro o un ejecutable sin adivinar.',
    blocks: [
      { type: 'h2', id: 'arbol', text: 'El árbol completo' },
      { type: 'ascii', text:
'/                      raíz de TODO el sistema\n' +
'├── bin ──► usr/bin    ejecutables básicos (ls, cp, bash)\n' +
'├── boot               kernel, initramfs y GRUB  ⚠ no tocar a la ligera\n' +
'├── dev                dispositivos como archivos (sda, null, tty)\n' +
'├── etc                CONFIGURACIÓN del sistema, en texto plano  ★\n' +
'│   ├── fstab          qué se monta al arrancar\n' +
'│   ├── passwd         usuarios (¡las contraseñas están en shadow!)\n' +
'│   └── ssh/           configuración del servidor y cliente SSH\n' +
'├── home               carpetas personales de los usuarios  ★\n' +
'│   └── john           tus documentos y tu configuración (~)\n' +
'├── lib ──► usr/lib    bibliotecas compartidas\n' +
'├── media              montaje AUTOMÁTICO de USB y discos externos\n' +
'├── mnt                montaje MANUAL y temporal\n' +
'├── opt                software de terceros autocontenido\n' +
'├── proc               kernel y procesos, en RAM (no ocupa disco)\n' +
'├── root               carpeta personal del superusuario\n' +
'├── run                estado en ejecución, se borra al reiniciar\n' +
'├── sbin ──► usr/sbin  ejecutables de administración\n' +
'├── srv                datos servidos (web, ftp)\n' +
'├── sys                interfaz con el kernel y el hardware\n' +
'├── tmp                temporales, se vacía al reiniciar\n' +
'├── usr                programas y datos de solo lectura\n' +
'│   ├── bin            la mayoría de los programas instalados\n' +
'│   ├── local          lo que compilas TÚ (no lo toca el gestor de paquetes) ★\n' +
'│   └── share          documentación, iconos, traducciones\n' +
'└── var                datos VARIABLES: crecen con el uso  ★\n' +
'    ├── log            REGISTROS del sistema  ★\n' +
'    ├── cache          cachés (apt guarda aquí los .deb)\n' +
'    └── lib            estado de las aplicaciones (bases de datos)' },
      { type: 'callout', variant: 'tip', title: 'Los cuatro que usarás a diario',
        html: '<ul><li><code>/etc</code> — <b>toda</b> la configuración del sistema, en texto plano. Si algo se configura, se configura aquí.</li><li><code>/var/log</code> — cuando algo falla, la respuesta está aquí.</li><li><code>/home/tu-usuario</code> (o <code>~</code>) — tus cosas. Lo único que necesitas respaldar.</li><li><code>/usr/local</code> — lo que instalas manualmente, separado de lo que gestiona <code>apt</code>. Esta separación es la que evita que una actualización te borre lo que compilaste.</li></ul>' },

      { type: 'h2', id: 'diferencias', text: 'Las distinciones que se confunden' },
      { type: 'table', head: ['Parecidos pero distintos', 'La diferencia real'], monoFirst: false, rows: [
        ['<code>/media</code> vs <code>/mnt</code>', '<code>/media</code> lo usa el escritorio para montar tu USB automáticamente. <code>/mnt</code> es para montajes que haces tú a mano con <code>mount</code>.'],
        ['<code>/bin</code> vs <code>/sbin</code>', '<code>/bin</code>: cualquier usuario. <code>/sbin</code>: administración, normalmente requiere root. En Ubuntu moderno ambos son enlaces a <code>/usr/…</code>.'],
        ['<code>/usr/bin</code> vs <code>/usr/local/bin</code>', '<code>/usr/bin</code> lo gestiona <code>apt</code>. <code>/usr/local/bin</code> es <b>tuyo</b>: pon aquí tus scripts y lo que compiles.'],
        ['<code>/tmp</code> vs <code>/var/tmp</code>', '<code>/tmp</code> se borra al reiniciar. <code>/var/tmp</code> sobrevive al reinicio.'],
        ['<code>/proc</code> vs <code>/sys</code>', '<code>/proc</code>: procesos y kernel. <code>/sys</code>: dispositivos y drivers. Ninguno existe en disco: son ventanas al kernel en memoria.']
      ]},
      { type: 'cmd', label: 'Explorar /proc y /sys: información sin instalar nada', lines: [
        '# Modelo de CPU, núcleos y frecuencia',
        '$ cat /proc/cpuinfo | grep "model name" | head -1',
        '',
        '# Memoria total y disponible',
        '$ grep -E "MemTotal|MemAvailable" /proc/meminfo',
        '',
        '# Tiempo encendido, en segundos',
        '$ cat /proc/uptime',
        '',
        '# Nivel de la batería de un portátil',
        '$ cat /sys/class/power_supply/BAT0/capacity',
        '',
        '# Línea de arranque del kernel (útil para depurar GRUB)',
        '$ cat /proc/cmdline'
      ]},

      { type: 'h2', id: 'espacio', text: 'Cuánto espacio queda y quién se lo come' },
      { type: 'command', name: 'df', tagline: 'espacio libre por sistema de archivos', level: 'basico',
        synopsis: 'df [-h] [-T] [-i] [RUTA]',
        desc: 'Muestra el espacio <b>por partición montada</b>. Responde a «¿me queda disco?».',
        options: [
          ['-h', '<i>human-readable</i>: GB y MB en lugar de bloques. Úsalo siempre'],
          ['-T', 'Añade el tipo de sistema de archivos (ext4, btrfs, tmpfs)'],
          ['-i', 'Muestra <b>inodos</b> en lugar de bytes: si se agotan, el disco «se llena» aunque haya espacio'],
          ['-x tmpfs', 'Excluye un tipo; útil para no ver decenas de líneas de <code>tmpfs</code>']
        ],
        examples: [
          { label: 'Uso habitual', lines: [
            '# Lo que quieres el 95% de las veces',
            '$ df -h',
            '| Filesystem      Size  Used Avail Use% Mounted on',
            '| /dev/nvme0n1p2  468G  201G  244G  46% /',
            '| /dev/nvme0n1p1  511M  6.1M  505M   2% /boot/efi',
            '',
            '# Sin el ruido de los sistemas virtuales',
            '$ df -hT -x tmpfs -x devtmpfs',
            '',
            '# ¿Disco lleno pero df dice que hay espacio? Revisa los inodos',
            '$ df -i'
          ]}
        ],
        notes: [{ variant: 'warn', html: '<p>Si <code>Use%</code> llega al 100% en <code>/</code>, el sistema empieza a fallar de formas raras: no puedes iniciar sesión gráfica, los servicios no arrancan. Deja siempre un 10% libre.</p>' }],
        seealso: ['du', 'lsblk', 'ncdu']
      },
      { type: 'command', name: 'du', tagline: 'qué carpeta ocupa tanto', level: 'basico',
        synopsis: 'du [-h] [-s] [-d N] [--max-depth=N] [RUTA]',
        desc: 'Suma el tamaño <b>de los archivos dentro de un directorio</b>. Responde a «¿quién me está llenando el disco?».',
        options: [
          ['-h', 'Tamaños legibles (K, M, G)'],
          ['-s', '<i>summarize</i>: solo el total, sin listar cada subcarpeta'],
          ['-d 1', 'Profundidad máxima 1: solo el primer nivel de subcarpetas'],
          ['-a', 'Incluye archivos, no solo directorios'],
          ['--exclude=PATRÓN', 'Salta lo que coincida (por ejemplo <code>--exclude=node_modules</code>)']
        ],
        examples: [
          { label: 'Cazar al culpable, de arriba abajo', lines: [
            '# 1. Los 10 directorios más grandes del primer nivel de tu home',
            '$ du -h -d 1 ~ | sort -hr | head -10',
            '| 89G     /home/john',
            '| 42G     /home/john/Descargas',
            '| 21G     /home/john/anaconda3',
            '',
            '# 2. Bajar al sospechoso y repetir',
            '$ du -h -d 1 ~/Descargas | sort -hr | head',
            '',
            '# 3. Total de una carpeta, sin desglose',
            '$ du -sh ~/Descargas',
            '',
            '# 4. En todo el sistema: 2>/dev/null oculta los "permiso denegado"',
            '$ sudo du -h -d 1 / 2>/dev/null | sort -hr | head -15'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p><code>sort -hr</code> es la pieza clave: <code>-h</code> entiende «1.5G» y «800M» como números, y <code>-r</code> ordena de mayor a menor. Sin esto la salida de <code>du</code> es inservible.</p><p>Si vas a hacer esto a menudo, instala <code>ncdu</code>: es <code>du</code> con navegación interactiva. <code>sudo apt install ncdu</code> y luego <code>ncdu /</code>.</p>' }],
        seealso: ['df', 'ncdu', 'sort', 'find']
      },
      { type: 'callout', variant: 'danger', title: 'Nunca borres a ciegas en /var',
        html: '<p><code>/var/log</code> crece, sí, pero <b>no borres los archivos</b>: un servicio con el descriptor abierto seguirá escribiendo y el espacio no se liberará. Usa <code>sudo journalctl --vacuum-time=7d</code> para los registros de systemd y <code>sudo apt clean</code> para la caché de paquetes. Ambos son seguros y reversibles.</p>' }
    ]
  });

})(window.Contenido);
