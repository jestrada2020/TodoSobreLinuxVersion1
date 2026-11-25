/* 05-permisos.js — permisos, propietarios, usuarios y sudo */
(function (C) {
  'use strict';

  C.registrar({
    id: 'perm-basico',
    group: 'admin',
    title: 'Permisos: leer, escribir y ejecutar',
    level: 'intermedio',
    tags: ['chmod', 'chown', 'permisos', 'octal', 'umask', 'suid', 'calculadora'],
    lead: 'Los permisos de Linux se resumen en una matriz de 3×3: tres acciones (<b>leer, escribir, ejecutar</b>) para tres audiencias (<b>propietario, grupo, resto</b>). Una vez ves esa matriz, la notación <code>rwxr-xr--</code> y el número <code>754</code> son la misma cosa escrita de dos formas.',
    blocks: [
      { type: 'h2', id: 'leer', text: 'Cómo leer una línea de ls -l' },
      { type: 'ascii', text:
'  -rwxr-xr--  1  john  desarrollo  4096  sep 10 06:33  script.sh\n' +
'  │└┬┘└┬┘└┬┘     └─┬┘  └────┬───┘\n' +
'  │ │  │  │        │        │\n' +
'  │ │  │  └─ otros (r--)    └─ grupo propietario\n' +
'  │ │  └──── grupo (r-x)  └──── usuario propietario\n' +
'  │ └─────── propietario (rwx)\n' +
'  └───────── tipo de archivo\n' +
'\n' +
'  TIPO:  -  archivo normal      l  enlace simbólico\n' +
'         d  directorio          c  dispositivo de caracteres\n' +
'         b  dispositivo de bloque (un disco)   p  tubería con nombre' },
      { type: 'table', head: ['Permiso', 'En un ARCHIVO', 'En un DIRECTORIO'], monoFirst: false, rows: [
        ['<code>r</code> (4)', 'Leer el contenido', 'Listar los nombres que contiene (<code>ls</code>)'],
        ['<code>w</code> (2)', 'Modificar el contenido', 'Crear, renombrar y <b>borrar</b> archivos dentro'],
        ['<code>x</code> (1)', 'Ejecutarlo como programa', '<b>Entrar</b> en él (<code>cd</code>) y acceder a su contenido']
      ]},
      { type: 'callout', variant: 'warn', title: 'Los dos casos que sorprenden',
        html: '<ul><li><b>Un directorio sin <code>x</code> es inservible</b> aunque tenga <code>r</code>: puedes ver los nombres de los archivos pero no leer ninguno. Los directorios casi siempre necesitan <code>r</code> y <code>x</code> juntos.</li><li><b>Borrar un archivo depende del directorio, no del archivo.</b> Si tienes <code>w</code> en la carpeta, puedes borrar un archivo aunque sea de otro usuario y esté en solo lectura. Esto es lo que resuelve el <i>sticky bit</i>.</li></ul>' },

      { type: 'h2', id: 'octal', text: 'La notación octal: sumar 4+2+1' },
      { type: 'prose', html: '<p>Cada grupo de tres permisos se convierte en un dígito sumando: <code>r</code>=4, <code>w</code>=2, <code>x</code>=1. Tres grupos, tres dígitos.</p>' },
      { type: 'ascii', text:
'  rwx r-x r--\n' +
'  │││ │││ ││└─ 0\n' +
'  ││└ ││└ │└── 0\n' +
'  │└─ │└─ └─── 4      →   7        5        4\n' +
'  └── └──          (4+2+1)  (4+0+1)  (4+0+0)\n' +
'\n' +
'  4 = r--     5 = r-x     6 = rw-     7 = rwx\n' +
'  0 = ---     1 = --x     2 = -w-     3 = -wx' },
      { type: 'table', head: ['Octal', 'Simbólico', 'Uso típico'], rows: [
        ['<code>644</code>', '<code>rw-r--r--</code>', '<b>Archivos normales.</b> El dueño escribe, los demás leen'],
        ['<code>755</code>', '<code>rwxr-xr-x</code>', '<b>Directorios y ejecutables.</b> Todos pueden entrar y ejecutar'],
        ['<code>600</code>', '<code>rw-------</code>', '<b>Archivos privados.</b> Claves, credenciales, <code>.env</code>'],
        ['<code>700</code>', '<code>rwx------</code>', 'Directorios privados: <code>~/.ssh</code>, <code>~/.gnupg</code>'],
        ['<code>664</code>', '<code>rw-rw-r--</code>', 'Archivo compartido dentro de un grupo de trabajo'],
        ['<code>775</code>', '<code>rwxrwxr-x</code>', 'Directorio compartido dentro de un grupo'],
        ['<code>777</code>', '<code>rwxrwxrwx</code>', '<b>Casi nunca correcto.</b> Cualquiera puede modificarlo y ejecutarlo'],
        ['<code>400</code>', '<code>r--------</code>', 'Solo lectura para el dueño: claves privadas ya listas']
      ]},
      { type: 'h3', id: 'calculadora', text: 'Calculadora: marca las casillas o escribe el número' },
      { type: 'chmodcalc' },
      { type: 'command', name: 'chmod', tagline: 'cambiar permisos', level: 'intermedio',
        synopsis: 'chmod [-R] MODO ARCHIVO...',
        desc: 'Acepta dos notaciones: <b>octal</b> (<code>755</code>, fija todo de golpe) y <b>simbólica</b> (<code>u+x</code>, modifica solo lo indicado).',
        options: [
          ['-R', 'Recursivo. <b>Con cuidado</b>: en un árbol, archivos y directorios necesitan permisos distintos'],
          ['-v', 'Informa de cada cambio'],
          ['--reference=ARCHIVO', 'Copia los permisos de otro archivo'],
          ['u / g / o / a', 'A quién: usuario, grupo, otros, todos'],
          ['+ / - / =', 'Añadir, quitar o fijar exactamente']
        ],
        examples: [
          { label: 'Notación octal: fija todo de una vez', lines: [
            '$ chmod 644 documento.txt      # rw-r--r--',
            '$ chmod 755 script.sh          # rwxr-xr-x',
            '$ chmod 600 ~/.ssh/id_ed25519  # rw------- (obligatorio para SSH)',
            '$ chmod 700 ~/.ssh             # rwx------'
          ]},
          { label: 'Notación simbólica: modifica sin tocar el resto', lines: [
            '$ chmod +x script.sh           # Hacerlo ejecutable para todos',
            '$ chmod u+x script.sh          # Solo para el propietario',
            '$ chmod g+w informe.txt        # Dar escritura al grupo',
            '$ chmod o-rwx privado.txt      # Quitar TODO a los demás',
            '$ chmod a=r publico.txt        # Exactamente: solo lectura para todos',
            '$ chmod u+x,g-w,o= archivo     # Varios cambios encadenados'
          ]},
          { label: 'Recursivo hecho bien: la clave está en X mayúscula', lines: [
            '# MAL: da permiso de ejecución también a los archivos de datos',
            '$ chmod -R 755 ~/web',
            '',
            '# BIEN: X mayúscula aplica x SOLO a directorios',
            '$ chmod -R u=rwX,go=rX ~/web',
            '',
            '# BIEN, la otra forma: separar por tipo con find',
            '$ find ~/web -type d -exec chmod 755 {} +',
            '$ find ~/web -type f -exec chmod 644 {} +'
          ]}
        ],
        notes: [
          { variant: 'danger', html: '<p><b>No uses <code>chmod 777</code>.</b> Es el «arreglo» más repetido de internet y casi siempre está mal: convierte el archivo en escribible y ejecutable por cualquier usuario o proceso del sistema. Si algo no funciona por permisos, el problema suele ser el <b>propietario</b> (<code>chown</code>) o la falta de <code>x</code> en un directorio del camino, no la falta de <code>777</code>.</p>' },
          { variant: 'tip', html: '<p>La <code>X</code> mayúscula es la solución al problema clásico del recursivo: significa «ejecución solo si es un directorio o si ya tenía ejecución». Es lo que quieres en el 99% de los <code>chmod -R</code>.</p>' }
        ],
        seealso: ['chown', 'umask', 'find', 'stat']
      },
      { type: 'command', name: 'chown', tagline: 'cambiar propietario y grupo', level: 'intermedio',
        synopsis: 'chown [-R] USUARIO[:GRUPO] ARCHIVO...',
        desc: 'Cambia quién es el dueño. Requiere <code>sudo</code>: un usuario normal no puede regalar sus archivos a otro.',
        options: [
          ['-R', 'Recursivo por todo el árbol'],
          ['usuario:grupo', 'Cambia ambos a la vez'],
          [':grupo', 'Solo el grupo (equivale a <code>chgrp</code>)'],
          ['usuario:', 'El usuario y su grupo principal'],
          ['--reference=ARCHIVO', 'Copia el propietario de otro archivo'],
          ['--from=ANTIGUO', 'Solo cambia si el propietario actual coincide']
        ],
        examples: [
          { label: 'Casos habituales', lines: [
            '# Recuperar la propiedad de tus propios archivos',
            '$ sudo chown john:john archivo.txt',
            '',
            '# Todo un directorio de forma recursiva',
            '$ sudo chown -R john:john ~/proyecto',
            '',
            '# Atajo: tu usuario y tu grupo actuales',
            '$ sudo chown -R $USER:$USER ~/proyecto',
            '',
            '# Solo el grupo',
            '$ sudo chown :desarrollo informe.txt',
            '',
            '# Web servida por nginx',
            '$ sudo chown -R www-data:www-data /var/www/sitio'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p><b>El síntoma más común:</b> copiaste archivos con <code>sudo</code> y ahora son de <code>root</code> y no puedes editarlos. La solución es <code>sudo chown -R $USER:$USER carpeta/</code>, no <code>chmod 777</code>.</p>' }],
        seealso: ['chmod', 'chgrp', 'id', 'groups']
      },

      { type: 'h2', id: 'especiales', text: 'Permisos especiales: SUID, SGID y sticky bit' },
      { type: 'table', head: ['Bit', 'Octal', 'Se ve como', 'Qué hace'], monoFirst: false, rows: [
        ['<b>SUID</b>', '4000', '<code>rw<b>s</b>r-xr-x</code>', 'El programa se ejecuta con los permisos <b>del propietario</b>, no de quien lo lanza. Así funciona <code>passwd</code>: un usuario normal modifica <code>/etc/shadow</code>'],
        ['<b>SGID</b>', '2000', '<code>rwxr-<b>s</b>r-x</code>', 'En un <b>directorio</b>: los archivos nuevos heredan el grupo de la carpeta. Es la base de las carpetas compartidas'],
        ['<b>Sticky</b>', '1000', '<code>rwxrwxrw<b>t</b></code>', 'En un directorio compartido: cada usuario solo puede borrar <b>sus</b> archivos. Es lo que protege <code>/tmp</code>']
      ]},
      { type: 'cmd', label: 'Ver y aplicar los bits especiales', lines: [
        '# /usr/bin/passwd tiene SUID: fíjate en la "s"',
        '$ ls -l /usr/bin/passwd',
        '| -rwsr-xr-x 1 root root 68208 mar 23  2025 /usr/bin/passwd',
        '',
        '# /tmp tiene sticky bit: la "t" final',
        '$ ls -ld /tmp',
        '| drwxrwxrwt 18 root root 4096 sep 10 06:00 /tmp',
        '',
        '# Crear una carpeta compartida por un grupo, bien hecha:',
        '$ sudo mkdir /srv/compartido',
        '$ sudo chgrp desarrollo /srv/compartido',
        '$ sudo chmod 2775 /srv/compartido    # SGID: hereda el grupo',
        '$ sudo chmod +t /srv/compartido      # Sticky: cada uno borra lo suyo',
        '$ ls -ld /srv/compartido',
        '| drwxrwsr-t 2 root desarrollo 4096 sep 10 06:45 /srv/compartido',
        '',
        '# AUDITORÍA DE SEGURIDAD: buscar binarios con SUID',
        '$ sudo find / -perm /4000 -type f 2>/dev/null'
      ]},
      { type: 'callout', variant: 'danger', title: 'SUID es una superficie de ataque',
        html: '<p>Un programa con SUID de <code>root</code> y un fallo de seguridad permite a cualquier usuario ejecutar código como root. <b>Nunca</b> pongas SUID a un script propio (además, Linux lo ignora en scripts por este motivo). Si necesitas dar permisos elevados puntuales, configúralo en <code>/etc/sudoers.d/</code> con <code>sudo visudo</code>.</p>' },

      { type: 'h2', id: 'umask', text: 'umask: los permisos de lo que creas' },
      { type: 'cmd', label: 'Por qué tus archivos nuevos son 644', lines: [
        '# Ver la máscara actual',
        '$ umask',
        '| 0022',
        '',
        '# En formato simbólico, más legible',
        '$ umask -S',
        '| u=rwx,g=rx,o=rx',
        '',
        '# El cálculo: la máscara se RESTA de los permisos base',
        '#   Archivos:     666 - 022 = 644  (rw-r--r--)',
        '#   Directorios:  777 - 022 = 755  (rwxr-xr-x)',
        '# Nota: los archivos nunca nacen con x, de ahí el 666 y no 777.',
        '',
        '# Más restrictivo: nada para el grupo ni para otros',
        '$ umask 077          # archivos 600, directorios 700',
        '',
        '# Para trabajo en grupo: el grupo puede escribir',
        '$ umask 002          # archivos 664, directorios 775',
        '',
        '# Hacerlo permanente',
        '$ echo "umask 077" >> ~/.bashrc'
      ]},

      { type: 'h2', id: 'usuarios', text: 'Usuarios, grupos y sudo' },
      { type: 'cmd', label: 'Quién soy y a qué tengo acceso', lines: [
        '$ whoami                 # Tu nombre de usuario',
        '$ id                     # UID, GID y todos tus grupos',
        '| uid=1000(john) gid=1000(john) grupos=1000(john),27(sudo),44(video)',
        '$ groups                 # Solo los nombres de grupo',
        '$ id -u                  # Solo el UID numérico (0 = root)',
        '',
        '# Quién está conectado ahora',
        '$ who',
        '$ w                      # Con lo que está ejecutando cada uno',
        '',
        '# Los últimos inicios de sesión',
        '$ last | head'
      ]},
      { type: 'cmd', label: 'Gestionar usuarios y grupos', lines: [
        '# Crear un usuario con su home y shell',
        '$ sudo adduser ana                    # Interactivo, recomendado en Debian/Ubuntu',
        '$ sudo useradd -m -s /bin/bash ana    # Equivalente de bajo nivel',
        '',
        '# Cambiar una contraseña',
        '$ sudo passwd ana',
        '',
        '# Añadir a un grupo SIN quitarle los que ya tiene (-a es crucial)',
        '$ sudo usermod -aG sudo ana',
        '$ sudo usermod -aG docker,video ana',
        '',
        '# Crear un grupo',
        '$ sudo groupadd desarrollo',
        '',
        '# Ver los miembros de un grupo',
        '$ getent group desarrollo',
        '',
        '# Borrar un usuario (y su home, con -r)',
        '$ sudo deluser --remove-home ana'
      ]},
      { type: 'callout', variant: 'danger', title: 'La -a de usermod -aG no es opcional',
        html: '<p><code>sudo usermod -G docker ana</code> (sin la <code>-a</code>) <b>sustituye</b> todos los grupos de Ana por solo <code>docker</code>. Si tenía <code>sudo</code>, lo pierde, y si era la única cuenta administradora te quedas sin acceso administrativo.</p><p>Usa <b>siempre</b> <code>-aG</code> (<i>append</i>). Y comprueba con <code>id ana</code> después.</p>' },
      { type: 'callout', variant: 'info', title: 'Los cambios de grupo necesitan iniciar sesión de nuevo',
        html: '<p>Tras un <code>usermod -aG</code>, el usuario debe cerrar la sesión y volver a entrar (o ejecutar <code>newgrp grupo</code>) para que el nuevo grupo tenga efecto. Los grupos se leen al iniciar sesión. Este es el motivo del clásico «he añadido mi usuario a docker y sigue dando permiso denegado».</p>' },
      { type: 'cmd', label: 'sudo con cabeza', lines: [
        '$ sudo comando               # Ejecutar como root',
        '$ sudo -u ana comando        # Ejecutar como otro usuario',
        '$ sudo -i                    # Sesión interactiva de root',
        '$ sudo !!                    # Repetir el comando anterior con sudo',
        '',
        '# ¿Qué puedo hacer con sudo?',
        '$ sudo -l',
        '',
        '# Editar la configuración de sudo SIEMPRE con visudo:',
        '# comprueba la sintaxis antes de guardar y evita bloquearte',
        '$ sudo visudo',
        '',
        '# Mejor práctica: un archivo aparte en sudoers.d',
        '$ sudo visudo -f /etc/sudoers.d/copias',
        '# Contenido de ejemplo (permite un solo comando sin contraseña):',
        '#   john ALL=(root) NOPASSWD: /usr/bin/rsync'
      ]},
      { type: 'callout', variant: 'warn', title: 'Nunca edites /etc/sudoers con un editor normal',
        html: '<p>Un error de sintaxis en <code>/etc/sudoers</code> deja el sistema <b>sin sudo funcional</b>, y recuperarlo requiere arrancar en modo de recuperación. <code>visudo</code> valida el archivo antes de guardarlo, que es exactamente para lo que existe.</p>' },
      { type: 'callout', variant: 'tip', title: 'Sigue en «Permisos avanzados»',
        html: '<p>ACL por persona, archivos inmutables, capabilities, carpetas compartidas, permisos en memorias USB, auditoría y un método para resolver cualquier «Permission denied»: <a href="#perm-avanzado">Permisos avanzados</a>.</p>' }
    ]
  });

  /* ======================================================================
     PERMISOS AVANZADOS
     ====================================================================== */
  C.registrar({
    id: 'perm-avanzado',
    group: 'admin',
    title: 'Permisos avanzados: ACL, atributos, discos y diagnóstico',
    level: 'avanzado',
    tags: ['acl', 'setfacl', 'getfacl', 'chattr', 'inmutable', 'capabilities', 'setcap', 'permission denied', 'ntfs', 'exfat', 'fat32', 'sudoers', 'namei', 'carpeta compartida'],
    lead: 'Cuando <code>chmod</code> y <code>chown</code> no bastan: dar acceso a <b>una persona concreta</b> sin cambiar el grupo, impedir que <b>ni root</b> borre un archivo, permisos en <b>memorias USB</b> que ignoran <code>chmod</code>, y un método para resolver cualquier <code>Permission denied</code>.',
    blocks: [
      { type: 'h2', id: 'calculadora-av', text: 'Calculadora de permisos' },
      { type: 'chmodcalc' },

      { type: 'tabs', id: 'perm-tabs', title: 'Opciones avanzadas', items: [

        /* ------------------------------ ACL ------------------------------ */
        { id: 'perm-acl', n: '1', t: 'ACL', badge: 'por persona', badgeVariant: 'info',
          lead: 'Las listas de control de acceso (ACL) añaden permisos para usuarios o grupos <b>concretos</b>, además de los tres clásicos. Un <code>+</code> al final de los permisos en <code>ls -l</code> indica que hay ACL.',
          blocks: [
            { type: 'cmd', label: 'Ver y dar permisos a personas concretas', lines: [
              '$ sudo apt install -y acl',
              '',
              '$ ls -l informe.ods',
              '| -rw-rw-r--+ 1 john john 18K nov 25 informe.ods     ← el + indica ACL',
              '$ getfacl informe.ods',
              '',
              '# Ana puede leer y escribir; el grupo contabilidad solo leer',
              '$ setfacl -m u:ana:rw informe.ods',
              '$ setfacl -m g:contabilidad:r informe.ods',
              '',
              '# En una carpeta y todo lo que contiene (X: ejecutar solo en carpetas)',
              '$ setfacl -R -m u:ana:rwX ~/Proyectos/tesis',
              '',
              '# ACL por defecto: lo que se cree DESPUÉS dentro también la tendrá',
              '$ setfacl -d -m u:ana:rwX ~/Proyectos/tesis',
              '',
              '# Quitar la de Ana, o todas',
              '$ setfacl -x u:ana informe.ods',
              '$ setfacl -b informe.ods'
            ]},
            { type: 'cmd', label: 'Copiar, respaldar y restaurar ACL', lines: [
              '# Guardar todas las ACL de un árbol y restaurarlas',
              '$ getfacl -R ~/Proyectos > acl-proyectos.txt',
              '$ setfacl --restore=acl-proyectos.txt',
              '',
              '# Conservarlas al copiar',
              '$ cp -a origen/ destino/',
              '$ rsync -aA origen/ destino/          # -A = ACL, -X = atributos extendidos',
              '$ tar --acls -cpzf respaldo.tar.gz carpeta/'
            ]},
            { type: 'callout', variant: 'warn', title: 'La máscara limita a todos los ACL',
              html: '<p><code>getfacl</code> muestra una línea <code>mask::</code>: es el máximo efectivo para todas las entradas de ACL y para el grupo. Un <code>chmod g-w</code> posterior <b>reduce la máscara</b> y deja sin escritura a Ana aunque su ACL diga <code>rw</code> (aparece <code>#effective:r--</code>). Se restaura con <code>setfacl -m m::rwx archivo</code>.</p>' }
          ]
        },

        /* --------------------------- ATRIBUTOS --------------------------- */
        { id: 'perm-chattr', n: '2', t: 'Atributos (chattr)', badge: 'ni root', badgeVariant: 'warn',
          lead: 'Los atributos del sistema de archivos van por encima de los permisos: un archivo <b>inmutable</b> no se puede modificar, renombrar ni borrar, <b>ni siquiera como root</b>, hasta quitarle el atributo.',
          blocks: [
            { type: 'cmd', label: 'Proteger archivos importantes', lines: [
              '# Inmutable: nadie puede modificarlo ni borrarlo',
              '$ sudo chattr +i /etc/resolv.conf',
              '$ lsattr /etc/resolv.conf',
              '| ----i---------e------- /etc/resolv.conf',
              '$ sudo rm /etc/resolv.conf',
              '| rm: no se puede borrar: Operación no permitida',
              '$ sudo chattr -i /etc/resolv.conf       # quitarlo',
              '',
              '# Solo añadir: se puede escribir al final, pero no borrar ni reescribir',
              '$ sudo chattr +a /var/log/mi-auditoria.log',
              '',
              '# Atributos de una carpeta (no de su contenido)',
              '$ lsattr -d ~/Documentos',
              '',
              '# Buscar archivos inmutables (si algo «no se deja borrar»)',
              '$ sudo lsattr -R /etc 2>/dev/null | grep -- "-i-"'
            ]},
            { type: 'table', head: ['Atributo', 'Efecto'], rows: [
              ['i', 'Inmutable: sin cambios, renombrado, enlaces ni borrado'],
              ['a', 'Solo añadir (registros de auditoría)'],
              ['C', 'Sin copia en escritura (Btrfs): para imágenes de VM y bases de datos'],
              ['c', 'Compresión transparente (Btrfs)'],
              ['e', 'Usa extents (ext4, normal; no lo toques)']
            ]},
            { type: 'callout', variant: 'info', title: 'Solo en sistemas de archivos de Linux',
              html: '<p>Funciona en ext4, Btrfs y XFS. En memorias USB con FAT32, exFAT o NTFS <code>chattr</code> no tiene efecto.</p>' }
          ]
        },

        /* ------------------------- CAPABILITIES -------------------------- */
        { id: 'perm-cap', n: '3', t: 'Capabilities',
          lead: 'Las <i>capabilities</i> dividen los poderes de root en piezas. En lugar de ejecutar un programa como root (o con SUID), se le concede <b>solo</b> lo que necesita, por ejemplo abrir puertos por debajo de 1024.',
          blocks: [
            { type: 'cmd', label: 'Ver y asignar capabilities', lines: [
              '$ getcap /usr/bin/ping',
              '| /usr/bin/ping cap_net_raw=ep',
              '',
              '# Todas las del sistema (revisión de seguridad)',
              '$ sudo getcap -r / 2>/dev/null',
              '',
              '# Permitir que un servidor propio escuche en el puerto 80 sin root',
              '$ sudo setcap cap_net_bind_service=+ep ./mi-servidor',
              '$ sudo setcap -r ./mi-servidor          # quitarla',
              '',
              '# Capabilities del proceso actual',
              '$ grep Cap /proc/$$/status && capsh --decode=$(awk \'/CapEff/{print $2}\' /proc/$$/status)'
            ]},
            { type: 'callout', variant: 'danger', title: 'No se la des al intérprete',
              html: '<p><code>setcap … /usr/bin/python3</code> concede el poder a <b>cualquier</b> script de Python del sistema. Para un servicio, mejor <code>AmbientCapabilities=CAP_NET_BIND_SERVICE</code> en su unidad de systemd, o escucha en un puerto alto (8080) detrás de un proxy.</p>' },
            { type: 'table', head: ['Capability', 'Permite'], rows: [
              ['cap_net_bind_service', 'Escuchar en puertos &lt; 1024'],
              ['cap_net_raw', 'Sockets en bruto (ping, captura de tráfico)'],
              ['cap_net_admin', 'Configurar interfaces y cortafuegos'],
              ['cap_sys_admin', 'Casi todo: equivale prácticamente a root. Evítala'],
              ['cap_dac_override', 'Ignorar los permisos de lectura y escritura de archivos']
            ]}
          ]
        },

        /* ---------------------- CARPETA COMPARTIDA ----------------------- */
        { id: 'perm-compartida', n: '4', t: 'Carpeta compartida', badge: 'receta', badgeVariant: 'ok',
          lead: 'El problema típico: varias personas trabajan en la misma carpeta y cada archivo nuevo queda con el grupo y los permisos de quien lo creó, así que los demás no pueden editarlo. La solución combina <b>SGID</b> y <b>ACL por defecto</b>.',
          blocks: [
            { type: 'steps', items: [
              { t: 'Crear el grupo y añadir a las personas',
                cmd: { label: 'Grupo', lines: [
                  '$ sudo groupadd proyecto',
                  '$ sudo usermod -aG proyecto john',
                  '$ sudo usermod -aG proyecto ana',
                  '# Cada uno debe cerrar sesión y volver a entrar'
                ]}
              },
              { t: 'Crear la carpeta con SGID (2) para que todo herede el grupo',
                cmd: { label: 'Carpeta', lines: [
                  '$ sudo mkdir -p /srv/proyecto',
                  '$ sudo chown root:proyecto /srv/proyecto',
                  '$ sudo chmod 2770 /srv/proyecto',
                  '$ ls -ld /srv/proyecto',
                  '| drwxrws--- 2 root proyecto 4096 nov 25 /srv/proyecto      ← la s es el SGID'
                ]}
              },
              { t: 'ACL por defecto para que todo lo nuevo sea editable por el grupo',
                html: '<p>Sin esto, el <code>umask</code> de cada persona (normalmente <code>022</code>) dejaría los archivos nuevos sin escritura para el grupo.</p>',
                cmd: { label: 'ACL', lines: [
                  '$ sudo setfacl -m g:proyecto:rwX /srv/proyecto',
                  '$ sudo setfacl -d -m g:proyecto:rwX /srv/proyecto',
                  '$ getfacl /srv/proyecto'
                ]}
              },
              { t: 'Comprobar',
                cmd: { label: 'Prueba', lines: [
                  '$ touch /srv/proyecto/prueba.txt',
                  '$ ls -l /srv/proyecto/prueba.txt',
                  '| -rw-rw----+ 1 john proyecto 0 nov 25 prueba.txt          ← grupo proyecto, rw'
                ]}
              }
            ]},
            { type: 'callout', variant: 'tip', title: '¿Y si la carpeta ya existía con archivos?',
              html: '<p>Aplica también a lo existente: <code>sudo chgrp -R proyecto /srv/proyecto</code>, <code>sudo find /srv/proyecto -type d -exec chmod 2770 {} +</code> y <code>sudo setfacl -R -m g:proyecto:rwX /srv/proyecto</code>.</p>' }
          ]
        },

        /* ------------------------ DISCOS EXTERNOS ------------------------ */
        { id: 'perm-usb', n: '5', t: 'USB y discos externos', badge: 'FAT · exFAT · NTFS', badgeVariant: 'warn',
          lead: 'FAT32, exFAT y NTFS no guardan permisos de Linux: <b><code>chmod</code> y <code>chown</code> no hacen nada</b> sobre ellos. Los permisos los decide el sistema al <b>montar</b> la unidad.',
          blocks: [
            { type: 'cmd', label: 'Saber qué sistema de archivos tiene y cómo está montado', lines: [
              '$ lsblk -f',
              '$ findmnt -T /media/$USER/kistom -o TARGET,FSTYPE,OPTIONS',
              '| /media/john/kistom vfat rw,nosuid,nodev,relatime,uid=1000,gid=1000,fmask=0022,dmask=0022,showexec,…'
            ]},
            { type: 'table', head: ['Síntoma', 'Causa y solución'], monoFirst: false, rows: [
              ['<code>./script.sh: Permiso denegado</code> en una USB FAT/exFAT', 'Se monta con <code>showexec</code> o <code>noexec</code>: solo .exe/.bat son ejecutables. Ejecútalo con <code>bash script.sh</code> o cópialo a tu carpeta'],
              ['<code>chmod</code> «funciona» pero no cambia nada', 'FAT/exFAT/NTFS no guardan permisos. Ajusta las opciones de montaje (abajo)'],
              ['NTFS montado en solo lectura', 'Windows lo dejó hibernado (inicio rápido). Apaga Windows del todo o: <code>sudo ntfsfix -d /dev/sdb1</code>'],
              ['USB ext4 de otro equipo: «no tienes permisos»', 'Los archivos pertenecen a un UID de otra máquina: <code>sudo chown -R $USER: /media/$USER/DISCO/carpeta</code>'],
              ['No puedo escribir en la raíz de un disco ext4 nuevo', 'La raíz recién formateada es de root: <code>sudo chown $USER: /media/$USER/DISCO</code>'],
              ['Un USB vuelve a montarse en solo lectura', 'Errores en el sistema de archivos: desmonta y <code>sudo fsck.vfat -a /dev/sdb1</code> (o <code>fsck.exfat</code>)']
            ]},
            { type: 'cmd', label: 'Montaje fijo con permisos a tu medida (/etc/fstab)', lines: [
              '$ sudo blkid /dev/sdb1                          # anota el UUID',
              '$ sudo mkdir -p /mnt/datos',
              '$ sudo cp /etc/fstab /etc/fstab.bak',
              '$ sudoedit /etc/fstab',
              '',
              '# exFAT o FAT32: tuyo, carpetas 755, archivos 644 (sin ejecución)',
              'UUID=1A68-304A  /mnt/datos  exfat  uid=1000,gid=1000,dmask=022,fmask=133,nofail  0  0',
              '',
              '# NTFS con el driver del kernel (ntfs3)',
              'UUID=XXXXXXXX  /mnt/win  ntfs3  uid=1000,gid=1000,umask=022,nofail  0  0',
              '',
              '$ sudo mount -a && findmnt /mnt/datos'
            ]},
            { type: 'callout', variant: 'info', title: 'fmask y dmask son máscaras',
              html: '<p>Funcionan como <code>umask</code>: indican lo que se <b>quita</b>. <code>dmask=022</code> → carpetas <code>755</code>; <code>fmask=133</code> → archivos <code>644</code>; <code>fmask=022</code> → archivos <code>755</code> (todos ejecutables). Usa <code>nofail</code> para que el sistema arranque aunque la unidad no esté conectada.</p>' }
          ]
        },

        /* ------------------------ AUDITAR Y REPARAR ---------------------- */
        { id: 'perm-auditar', n: '6', t: 'Auditar y reparar',
          lead: 'Encontrar permisos peligrosos y devolver un árbol de carpetas a un estado sano.',
          blocks: [
            { type: 'cmd', label: 'Auditoría de seguridad', lines: [
              '# Programas con SUID/SGID (compara con una lista conocida)',
              '$ sudo find / -xdev -perm /6000 -type f -exec ls -l {} + 2>/dev/null',
              '',
              '# Archivos y carpetas que CUALQUIERA puede modificar',
              '$ sudo find / -xdev -type f -perm -0002 2>/dev/null | grep -v "^/proc"',
              '$ sudo find / -xdev -type d -perm -0002 ! -perm -1000 2>/dev/null   # sin sticky: peligroso',
              '',
              '# Archivos sin dueño válido (de usuarios borrados)',
              '$ sudo find / -xdev \\( -nouser -o -nogroup \\) 2>/dev/null',
              '',
              '# Archivos de tu carpeta personal que no son tuyos (por usar sudo con apps)',
              '$ find ~ ! -user $USER 2>/dev/null | head',
              '',
              '# Permisos en formato compacto',
              '$ stat -c "%a %A %U:%G %n" ~/.ssh/*'
            ]},
            { type: 'cmd', label: 'Reparar', lines: [
              '# Carpetas 755 y archivos 644 en un árbol (la X mayúscula hace la magia)',
              '$ chmod -R u=rwX,go=rX ~/Documentos/proyecto',
              '',
              '# Equivalente explícito con find',
              '$ find ~/Documentos/proyecto -type d -exec chmod 755 {} +',
              '$ find ~/Documentos/proyecto -type f -exec chmod 644 {} +',
              '',
              '# Devolverte la propiedad de tu carpeta personal',
              '$ sudo chown -R $USER:$USER ~',
              '',
              '# Permisos correctos de SSH (si no, ssh ignora las claves)',
              '$ chmod 700 ~/.ssh',
              '$ chmod 600 ~/.ssh/id_* ~/.ssh/authorized_keys ~/.ssh/config',
              '$ chmod 644 ~/.ssh/*.pub',
              '',
              '# ¿Qué archivos de un paquete han cambiado de permisos o contenido?',
              '$ dpkg -V sudo',
              '$ sudo apt install --reinstall sudo     # repone los originales'
            ]},
            { type: 'callout', variant: 'danger', title: 'Si ejecutaste chmod -R 777 / (o chown -R sobre /)',
              html: '<p>El sistema queda roto de forma sutil: <code>sudo</code> deja de funcionar (exige su SUID y dueño root), <code>ssh</code> rechaza las claves y muchos servicios fallan. No hay un comando que lo deshaga del todo: <b>salva tus datos y reinstala</b>. Prevención: nunca uses <code>-R</code> sobre <code>/</code>, <code>/usr</code> o <code>/etc</code>, y escribe siempre la ruta completa.</p>' }
          ]
        },

        /* ------------------------- PERMISSION DENIED --------------------- */
        { id: 'perm-denied', n: '7', t: '«Permission denied»', badge: 'diagnóstico', badgeVariant: 'danger',
          lead: 'Un método en cinco comprobaciones que encuentra la causa de casi cualquier <code>Permiso denegado</code>.',
          blocks: [
            { type: 'steps', items: [
              { t: 'Permisos de CADA carpeta del camino', html: '<p>Para abrir un archivo necesitas <code>x</code> en todas las carpetas de la ruta. <code>namei</code> lo muestra de un vistazo.</p>',
                cmd: { label: 'namei', lines: [
                  '$ namei -l /srv/proyecto/datos/ventas.csv',
                  '| drwxr-xr-x root root     /',
                  '| drwxr-xr-x root root     srv',
                  '| drwxrws--- root proyecto proyecto     ← sin x para "otros": hay que ser del grupo',
                  '$ id                     # ¿estoy en ese grupo? (si acabas de entrar: cierra sesión)'
                ]}
              },
              { t: 'ACL y atributos', cmd: { label: 'Extras', lines: [
                  '$ getfacl /srv/proyecto/datos/ventas.csv',
                  '$ lsattr /srv/proyecto/datos/ventas.csv     # ¿i (inmutable) o a (solo añadir)?'
                ]}
              },
              { t: 'Opciones de montaje: solo lectura o sin ejecución', cmd: { label: 'Montaje', lines: [
                  '$ findmnt -T /ruta/al/archivo -o TARGET,FSTYPE,OPTIONS',
                  '#   ro      → todo el sistema de archivos es de solo lectura',
                  '#   noexec  → no se ejecuta nada de ahí: usa  bash script.sh'
                ]}
              },
              { t: 'AppArmor (aplicaciones confinadas, snaps)', cmd: { label: 'Denegaciones', lines: [
                  '$ sudo journalctl -k -g "apparmor=\\"DENIED\\"" -n 20',
                  '# Los snaps solo ven tu carpeta personal: un archivo en /srv o en',
                  '# una partición extra puede ser invisible para la versión snap'
                ]}
              },
              { t: 'Los errores que no son de permisos', html: '<p>Algunos mensajes dicen «permiso denegado» aunque la causa es otra; están en la tabla de abajo.</p>' }
            ]},
            { type: 'table', head: ['Situación', 'Causa y solución'], monoFirst: false, rows: [
              ['<code>sudo echo "x" &gt; /etc/archivo</code> → Permiso denegado', 'La redirección la hace TU shell, no sudo. Usa <code>echo "x" | sudo tee /etc/archivo</code> (o <code>tee -a</code> para añadir)'],
              ['<code>./script.sh: Permiso denegado</code>', 'Falta <code>x</code>: <code>chmod +x script.sh</code>, o la partición es <code>noexec</code>'],
              ['<code>bad interpreter: /bin/bash^M</code>', 'Saltos de línea de Windows: <code>sed -i \'s/\\r$//\' script.sh</code>'],
              ['<code>permission denied … /var/run/docker.sock</code>', '<code>sudo usermod -aG docker $USER</code> y volver a iniciar sesión'],
              ['<code>/dev/ttyUSB0: Permission denied</code> (Arduino, puerto serie)', '<code>sudo usermod -aG dialout $USER</code> y volver a iniciar sesión'],
              ['No puedo borrar un archivo en /tmp de otro usuario', 'Es el sticky bit de <code>/tmp</code>: funciona como debe'],
              ['<code>Operación no permitida</code> incluso con sudo', 'Atributo inmutable (<code>lsattr</code>) o sistema de archivos que no admite el cambio (FAT/NTFS)']
            ]}
          ]
        },

        /* --------------------------- SUDO AVANZADO ----------------------- */
        { id: 'perm-sudo', n: '8', t: 'sudo avanzado',
          lead: 'Reglas finas en sudoers, editar archivos del sistema con tu editor, registros de quién hizo qué y cómo recuperarte si rompes sudo.',
          blocks: [
            { type: 'cmd', label: 'Sintaxis de sudoers', lines: [
              '# QUIÉN  EN_QUÉ_EQUIPO=(COMO_QUIÉN)  [NOPASSWD:]  QUÉ_COMANDOS',
              '#   john       ALL=(ALL:ALL) ALL',
              '#   %backup    ALL=(root) NOPASSWD: /usr/bin/rsync, /usr/bin/systemctl restart nginx',
              '#   Defaults   timestamp_timeout=15      # minutos que recuerda la contraseña',
              '#   Defaults   insults                   # (opcional, humor)',
              '',
              '# Siempre en un archivo propio y con visudo (valida antes de guardar)',
              '$ sudo visudo -f /etc/sudoers.d/backup',
              '$ sudo visudo -c                          # comprobar toda la configuración'
            ]},
            { type: 'cmd', label: 'Uso cotidiano', lines: [
              '# Editar un archivo del sistema con TU editor y TU configuración, de forma segura',
              '$ sudoedit /etc/hosts                     # usa $EDITOR; edita una copia y la instala al salir',
              '',
              '$ sudo -l                                 # qué puedo ejecutar',
              '$ sudo -k                                 # olvidar la contraseña ya',
              '$ sudo -u postgres psql                   # como otro usuario',
              '$ sudo --preserve-env=HTTPS_PROXY apt update   # conservar una variable concreta',
              '',
              '# Registro: quién ejecutó qué con sudo',
              '$ journalctl _COMM=sudo -n 20 --no-pager',
              '$ sudo grep sudo /var/log/auth.log | tail'
            ]},
            { type: 'table', head: ['', 'su', 'sudo -i'], monoFirst: false, rows: [
              ['Contraseña', 'La de <b>root</b> (bloqueada en Ubuntu)', 'La <b>tuya</b>'],
              ['Registro', 'Solo «alguien entró como root»', 'Cada comando, con usuario y hora'],
              ['En Ubuntu', 'No funciona salvo que actives root', 'Es la forma correcta']
            ]},
            { type: 'callout', variant: 'danger', title: 'Si rompiste sudoers',
              html: '<p>Con un error de sintaxis, <code>sudo</code> deja de funcionar. Dos salidas: <code>pkexec visudo</code> desde el escritorio (usa polkit, no sudo), o arrancar en <a href="#resc-sistema/sis-password">modo de recuperación</a>, <code>mount -o remount,rw /</code> y <code>visudo</code>. Por eso las reglas van en <code>/etc/sudoers.d/</code>: basta con borrar ese archivo.</p>' }
          ]
        }
      ]}
    ]
  });

})(window.Contenido);
