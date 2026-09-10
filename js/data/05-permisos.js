/* 05-permisos.js — permisos, propietarios, usuarios y sudo */
(function (C) {
  'use strict';

  C.registrar({
    id: 'perm-basico',
    group: 'admin',
    title: 'Permisos: leer, escribir y ejecutar',
    level: 'intermedio',
    tags: ['chmod', 'chown', 'permisos', 'octal', 'umask', 'suid'],
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
        html: '<p>Un error de sintaxis en <code>/etc/sudoers</code> deja el sistema <b>sin sudo funcional</b>, y recuperarlo requiere arrancar en modo de recuperación. <code>visudo</code> valida el archivo antes de guardarlo, que es exactamente para lo que existe.</p>' }
    ]
  });

})(window.Contenido);
