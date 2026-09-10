/* 02-archivos.js — navegación, manipulación y búsqueda de archivos */
(function (C) {
  'use strict';

  C.registrar({
    id: 'fs-nav',
    group: 'archivos',
    title: 'Navegar por el sistema de archivos',
    level: 'basico',
    tags: ['cd', 'ls', 'pwd', 'tree', 'rutas', 'comodines'],
    lead: 'Moverse rápido por el árbol es la habilidad que más veces vas a usar. La clave está en entender la diferencia entre <b>ruta absoluta</b> y <b>relativa</b>, y en dejar que el tabulador escriba por ti.',
    blocks: [
      { type: 'h2', id: 'rutas', text: 'Rutas absolutas y relativas' },
      { type: 'prose', html: '<p>Una <b>ruta absoluta</b> empieza en <code>/</code> y funciona desde cualquier sitio. Una <b>ruta relativa</b> parte de donde estás ahora. Confundirlas es la causa número uno de «pero si el archivo está ahí».</p>' },
      { type: 'table', head: ['Símbolo', 'Significa', 'Ejemplo'], rows: [
        ['<code>/</code>', 'Raíz del sistema (absoluta)', '<code>cd /etc/ssh</code>'],
        ['<code>~</code>', 'Tu carpeta personal (<code>/home/tu-usuario</code>)', '<code>cd ~/Documentos</code>'],
        ['<code>.</code>', 'El directorio actual', '<code>./mi-script.sh</code>'],
        ['<code>..</code>', 'El directorio padre', '<code>cd ../..</code> sube dos niveles'],
        ['<code>-</code>', 'El directorio anterior (como «atrás»)', '<code>cd -</code>'],
        ['<code>~usuario</code>', 'La carpeta personal de otro usuario', '<code>cd ~ana</code>']
      ]},
      { type: 'command', name: 'cd', tagline: 'cambiar de directorio', level: 'basico',
        synopsis: 'cd [DESTINO]',
        desc: 'Cambia el directorio de trabajo. Es una función interna del shell, no un programa: por eso no tiene página <code>man</code> propia (usa <code>help cd</code>).',
        options: [
          ['(sin argumentos)', 'Va a tu carpeta personal, equivalente a <code>cd ~</code>'],
          ['-', 'Vuelve al directorio anterior. Alterna entre dos carpetas'],
          ['..', 'Sube un nivel. Se pueden encadenar: <code>../../..</code>'],
          ['-P', 'Sigue los enlaces simbólicos hasta la ruta física real']
        ],
        examples: [
          { label: 'Movimientos habituales', lines: [
            '$ cd /var/log        # Ruta absoluta: funciona desde cualquier sitio',
            '$ cd ..              # Sube a /var',
            '$ cd ~               # A tu home (o simplemente: cd)',
            '$ cd -               # Vuelve a donde estabas antes',
            '$ cd ~/Descargas     # Tu carpeta de descargas',
            '',
            '# Rutas con espacios: usa comillas o escapa el espacio',
            '$ cd "Mis Documentos"',
            '$ cd Mis\\ Documentos'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p><kbd>Tab</kbd> autocompleta. Escribe <code>cd /va</code> + <kbd>Tab</kbd> y se convierte en <code>cd /var/</code>. Con dos <kbd>Tab</kbd> ves todas las opciones posibles. <b>No escribas rutas largas a mano.</b></p>' }],
        seealso: ['pwd', 'pushd', 'popd', 'ls']
      },
      { type: 'command', name: 'ls', tagline: 'listar el contenido de un directorio', level: 'basico',
        synopsis: 'ls [OPCIONES] [RUTA...]',
        desc: 'El comando que más veces ejecutarás. Sus opciones se combinan: <code>ls -lah</code> es <code>-l</code> + <code>-a</code> + <code>-h</code>.',
        options: [
          ['-l', 'Formato largo: permisos, propietario, tamaño y fecha'],
          ['-a', 'Incluye los ocultos (los que empiezan por punto)'],
          ['-h', 'Tamaños legibles (4.0K, 2.3M) — solo tiene efecto junto a <code>-l</code>'],
          ['-t', 'Ordena por fecha de modificación, lo más reciente primero'],
          ['-S', 'Ordena por tamaño, lo más grande primero'],
          ['-r', 'Invierte el orden'],
          ['-R', 'Recursivo: baja por todos los subdirectorios'],
          ['-d', 'Muestra el directorio en sí, no su contenido'],
          ['-i', 'Muestra el número de inodo'],
          ['--color=auto', 'Colorea por tipo de archivo (suele venir ya activo)']
        ],
        examples: [
          { label: 'Las combinaciones que de verdad se usan', lines: [
            '# La más común: todo con detalle y tamaños legibles',
            '$ ls -lah',
            '| total 48K',
            '| drwxr-xr-x 5 john john 4.0K sep 10 06:33 .',
            '| drwxr-xr-x 3 root root 4.0K ago  2 11:02 ..',
            '| -rw-r--r-- 1 john john 1.2K sep 10 06:12 notas.txt',
            '',
            '# Lo modificado más recientemente, al final (cómodo en terminal larga)',
            '$ ls -ltr',
            '',
            '# Los archivos más grandes primero',
            '$ ls -lhS | head',
            '',
            '# Solo los directorios del nivel actual',
            '$ ls -d */',
            '',
            '# Contar cuántos archivos hay',
            '$ ls -1 | wc -l'
          ]}
        ],
        notes: [{ variant: 'info', html: '<p><b>Cómo leer <code>-rw-r--r--</code>:</b> el primer carácter es el tipo (<code>-</code> archivo, <code>d</code> directorio, <code>l</code> enlace). Los nueve siguientes son tres grupos de tres: permisos del <b>propietario</b>, del <b>grupo</b> y de <b>los demás</b>. Se explica a fondo en la sección de permisos.</p>' }],
        seealso: ['tree', 'stat', 'file', 'find']
      },
      { type: 'command', name: 'tree', tagline: 'ver la jerarquía en forma de árbol', level: 'basico',
        synopsis: 'tree [-L N] [-d] [-a] [-h] [RUTA]',
        desc: 'Dibuja la estructura de directorios. No viene instalado por defecto: <code>sudo apt install tree</code>.',
        options: [
          ['-L N', 'Limita la profundidad a N niveles. <b>Imprescindible</b>: sin esto la salida es enorme'],
          ['-d', 'Solo directorios, ignora los archivos'],
          ['-a', 'Incluye los ocultos'],
          ['-h', 'Muestra el tamaño de cada archivo'],
          ['-I PATRÓN', 'Ignora lo que coincida: <code>-I "node_modules|.git"</code>'],
          ['--du', 'Acumula el tamaño de cada directorio']
        ],
        examples: [
          { label: 'Entender un proyecto ajeno en 5 segundos', lines: [
            '# Estructura general, sin ahogarse en detalles',
            '$ tree -L 2',
            '',
            '# Solo la forma de las carpetas',
            '$ tree -d -L 3',
            '',
            '# Un proyecto de desarrollo, ignorando el ruido',
            '$ tree -L 2 -I "node_modules|.git|__pycache__|.venv"',
            '',
            '# Con tamaños acumulados: encuentra la carpeta pesada',
            '$ tree -h --du -L 1'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p>Sin <code>tree</code> instalado, esta línea hace algo parecido con herramientas que ya tienes:<br><code>find . -maxdepth 2 | sort | sed -e "s;[^/]*/;|  ;g" -e "s;|  \\([^|]\\);|-- \\1;"</code></p>' }],
        seealso: ['ls', 'find', 'du']
      },

      { type: 'h2', id: 'comodines', text: 'Comodines: seleccionar varios archivos a la vez' },
      { type: 'prose', html: '<p>Los comodines los expande <b>el shell</b> antes de ejecutar el comando. Cuando escribes <code>rm *.txt</code>, el programa <code>rm</code> recibe ya la lista completa de archivos. Esto explica por qué funcionan igual con cualquier comando.</p>' },
      { type: 'table', head: ['Comodín', 'Coincide con', 'Ejemplo'], rows: [
        ['<code>*</code>', 'Cualquier cantidad de caracteres, incluso ninguno', '<code>*.log</code> → todos los .log'],
        ['<code>?</code>', 'Exactamente un carácter', '<code>foto?.jpg</code> → foto1.jpg, fotoA.jpg'],
        ['<code>[abc]</code>', 'Uno de los caracteres de la lista', '<code>foto[12].jpg</code> → foto1, foto2'],
        ['<code>[a-z]</code>', 'Un carácter del rango', '<code>[a-c]*</code> → empieza por a, b o c'],
        ['<code>[!abc]</code>', 'Cualquiera <b>excepto</b> esos', '<code>[!t]*</code> → no empieza por t'],
        ['<code>{a,b}</code>', 'Expansión de llaves (no necesita que exista)', '<code>copia.{txt,bak}</code>'],
        ['<code>**</code>', 'Recursivo (requiere <code>shopt -s globstar</code>)', '<code>**/*.js</code> → en todo el árbol']
      ]},
      { type: 'callout', variant: 'danger', title: 'Verifica un comodín antes de borrar',
        html: '<p>Sustituye el comando destructivo por <code>ls</code> para ver exactamente sobre qué actuaría:</p><p><code>ls *.log</code> → si la lista es la correcta, <b>entonces</b> ejecuta <code>rm *.log</code>.</p><p>Cuidado especial con el espacio accidental: <code>rm * .log</code> (con espacio) borra <b>todo</b> el directorio. Este error ha costado muchos datos.</p>' }
    ]
  });

  C.registrar({
    id: 'fs-manip',
    group: 'archivos',
    title: 'Crear, copiar, mover y borrar',
    level: 'basico',
    tags: ['cp', 'mv', 'rm', 'mkdir', 'touch', 'ln', 'rsync'],
    lead: 'Estos comandos son los que <b>modifican</b> tu disco. Ninguno pregunta antes de sobrescribir y <b>no hay papelera</b>: lo que borras con <code>rm</code> se ha ido. Las opciones de seguridad de esta sección son las que evitan accidentes.',
    blocks: [
      { type: 'callout', variant: 'danger', title: 'Lo primero: en la terminal no hay papelera',
        html: '<p><code>rm</code> no mueve nada a la papelera: desvincula el archivo del sistema de archivos y el espacio queda disponible para reutilizarse. La recuperación es difícil, caótica y a menudo imposible.</p><p>Acostúmbrate a <code>rm -i</code> (pregunta por cada archivo) mientras coges confianza, y usa <code>ls</code> para verificar los comodines antes.</p>' },

      { type: 'h2', id: 'crear', text: 'Crear archivos y directorios' },
      { type: 'command', name: 'mkdir', tagline: 'crear directorios', level: 'basico',
        synopsis: 'mkdir [-p] [-m MODO] DIRECTORIO...',
        desc: 'Crea directorios. Falla si el padre no existe, salvo que uses <code>-p</code>.',
        options: [
          ['-p', '<i>parents</i>: crea toda la ruta intermedia y no falla si ya existe. <b>La opción que más se usa</b>'],
          ['-m 750', 'Fija los permisos al crear, en lugar de crear y luego hacer <code>chmod</code>'],
          ['-v', 'Informa de cada directorio creado']
        ],
        examples: [
          { label: 'Crear estructuras completas de una vez', lines: [
            '# Sin -p esto FALLA si proyecto/ no existe',
            '$ mkdir proyecto/src/componentes',
            '| mkdir: no se puede crear el directorio: No existe el archivo',
            '',
            '# Con -p crea toda la cadena',
            '$ mkdir -p proyecto/src/componentes',
            '',
            '# Varias ramas a la vez, con expansión de llaves',
            '$ mkdir -p proyecto/{src,docs,tests,build}',
            '$ mkdir -p proyecto/src/{css,js,img}',
            '',
            '# Crear con permisos restringidos desde el principio',
            '$ mkdir -m 700 ~/.secretos'
          ]}
        ],
        seealso: ['rmdir', 'touch', 'chmod']
      },
      { type: 'command', name: 'touch', tagline: 'crear archivos vacíos y cambiar fechas', level: 'basico',
        synopsis: 'touch [-a] [-m] [-t FECHA] ARCHIVO...',
        desc: 'Si el archivo no existe, lo crea vacío. Si existe, <b>actualiza su fecha</b> de modificación sin tocar el contenido.',
        options: [
          ['-a', 'Solo la fecha de último acceso'],
          ['-m', 'Solo la fecha de modificación'],
          ['-c', 'No crea el archivo si no existe'],
          ['-t AAAAMMDDhhmm', 'Fija una fecha concreta'],
          ['-r REFERENCIA', 'Copia las fechas de otro archivo']
        ],
        examples: [
          { label: 'Usos reales', lines: [
            '$ touch notas.txt                    # Crear vacío',
            '$ touch a.txt b.txt c.txt            # Varios de golpe',
            '$ touch archivo{1..5}.txt            # archivo1.txt … archivo5.txt',
            '',
            '# Forzar que una herramienta crea que el archivo cambió',
            '$ touch main.c && make',
            '',
            '# Fijar una fecha concreta',
            '$ touch -t 202601011200 informe.pdf'
          ]}
        ],
        seealso: ['mkdir', 'stat', 'date']
      },

      { type: 'h2', id: 'copiar', text: 'Copiar y mover' },
      { type: 'command', name: 'cp', tagline: 'copiar archivos y directorios', level: 'basico',
        synopsis: 'cp [OPCIONES] ORIGEN... DESTINO',
        desc: 'Copia. <b>Sobrescribe sin avisar</b> por defecto, así que las opciones de seguridad importan.',
        options: [
          ['-r', '<i>recursive</i>: obligatorio para copiar directorios'],
          ['-i', '<i>interactive</i>: pregunta antes de sobrescribir'],
          ['-n', '<i>no-clobber</i>: nunca sobrescribe, salta el archivo'],
          ['-u', '<i>update</i>: copia solo si el origen es más nuevo'],
          ['-p', 'Preserva permisos, propietario y fechas'],
          ['-a', '<i>archive</i>: equivale a <code>-rp</code> y además preserva enlaces. Para respaldos'],
          ['-v', 'Muestra cada archivo copiado'],
          ['--backup=numbered', 'Antes de sobrescribir, guarda una copia numerada']
        ],
        examples: [
          { label: 'Copiar con red de seguridad', lines: [
            '$ cp archivo.txt copia.txt              # Copia simple',
            '$ cp archivo.txt ~/Documentos/          # A otra carpeta, mismo nombre',
            '$ cp -r proyecto/ respaldo-proyecto/    # Directorio completo',
            '',
            '# Respaldo fiel: preserva permisos, fechas y enlaces',
            '$ cp -av ~/Documentos /mnt/usb/respaldo/',
            '',
            '# Sincronización barata: solo lo que cambió',
            '$ cp -ruv origen/ destino/',
            '',
            '# Nunca sobrescribir nada de lo que ya hay',
            '$ cp -n *.jpg ~/Fotos/'
          ]}
        ],
        notes: [
          { variant: 'warn', html: '<p><b>La barra final cambia el resultado.</b> <code>cp -r origen destino</code>: si <code>destino</code> existe, crea <code>destino/origen</code>. Si no existe, crea <code>destino</code> con el contenido de <code>origen</code>. Ante la duda, verifica con <code>ls</code> después.</p>' },
          { variant: 'tip', html: '<p>Para copias grandes o por red usa <code>rsync -ah --progress</code>: muestra el avance y puede reanudarse si se interrumpe. <code>cp</code> no.</p>' }
        ],
        seealso: ['mv', 'rsync', 'scp', 'tar']
      },
      { type: 'command', name: 'mv', tagline: 'mover y renombrar', level: 'basico',
        synopsis: 'mv [OPCIONES] ORIGEN... DESTINO',
        desc: 'Mueve o renombra: en Linux es la <b>misma operación</b>. Dentro del mismo sistema de archivos es instantáneo, porque solo cambia el nombre, no los datos.',
        options: [
          ['-i', 'Pregunta antes de sobrescribir'],
          ['-n', 'No sobrescribe nunca'],
          ['-u', 'Solo mueve si el origen es más nuevo'],
          ['-v', 'Muestra qué se movió'],
          ['-t DIRECTORIO', 'Indica el destino primero, útil con <code>xargs</code>'],
          ['--backup=numbered', 'Copia de seguridad antes de sobrescribir']
        ],
        examples: [
          { label: 'Mover y renombrar', lines: [
            '$ mv viejo.txt nuevo.txt              # Renombrar',
            '$ mv archivo.txt ~/Documentos/        # Mover',
            '$ mv *.jpg ~/Fotos/                   # Mover por lotes',
            '$ mv carpeta/ ~/Documentos/           # Mover un directorio (sin -r)',
            '',
            '# Renombrado seguro, preguntando',
            '$ mv -iv informe.pdf informe-final.pdf',
            '',
            '# Renombrar muchos archivos: bucle del shell',
            '$ for f in *.txt; do mv "$f" "${f%.txt}.md"; done',
            '',
            '# O con la herramienta dedicada (sudo apt install rename)',
            '$ rename \'s/\\.txt$/\\.md/\' *.txt'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p>Las comillas alrededor de <code>"$f"</code> en el bucle no son opcionales: sin ellas, un archivo con espacios en el nombre rompe el comando.</p>' }],
        seealso: ['cp', 'rename', 'rm']
      },

      { type: 'h2', id: 'borrar', text: 'Borrar (con cuidado)' },
      { type: 'command', name: 'rm', tagline: 'eliminar archivos y directorios', level: 'intermedio',
        synopsis: 'rm [OPCIONES] ARCHIVO...',
        desc: 'Elimina de forma <b>permanente</b>. No hay papelera, no hay «deshacer».',
        options: [
          ['-i', 'Pregunta por <b>cada</b> archivo. La red de seguridad'],
          ['-I', 'Pregunta <b>una vez</b> si son más de tres. Buen equilibrio'],
          ['-r', 'Recursivo: necesario para directorios'],
          ['-f', '<i>force</i>: no pregunta ni avisa de lo que no existe. <b>Úsalo con cabeza</b>'],
          ['-v', 'Informa de cada borrado'],
          ['-d', 'Borra directorios vacíos'],
          ['--one-file-system', 'No cruza a otros puntos de montaje. Protege tu USB en borrados amplios']
        ],
        examples: [
          { label: 'Borrado defensivo', lines: [
            '# 1. SIEMPRE verifica primero qué se vería afectado',
            '$ ls *.tmp',
            '',
            '# 2. Y entonces borra',
            '$ rm *.tmp',
            '',
            '# Preguntando una vez si son muchos (recomendado por defecto)',
            '$ rm -Iv *.log',
            '',
            '# Directorio y todo su contenido',
            '$ rm -r carpeta-vieja/',
            '',
            '# Directorio vacío (más seguro: falla si NO está vacío)',
            '$ rmdir carpeta-vacia/'
          ]}
        ],
        notes: [
          { variant: 'danger', html: '<p><b>Comandos que nunca debes ejecutar:</b></p><ul><li><code>rm -rf /</code> — destruye el sistema entero.</li><li><code>rm -rf ~</code> — borra toda tu carpeta personal.</li><li><code>rm -rf $VARIABLE/</code> — si la variable está vacía, se convierte en <code>rm -rf /</code>. <b>Siempre</b> comprueba que la variable tiene valor antes.</li><li><code>sudo rm -rf .*</code> — el patrón <code>.*</code> incluye <code>..</code>, es decir, el directorio padre.</li></ul>' },
          { variant: 'tip', html: '<p><b>Alternativa con papelera:</b> instala <code>trash-cli</code> (<code>sudo apt install trash-cli</code>) y usa <code>trash-put archivo</code>. Va a la papelera del escritorio y se puede recuperar. Para el día a día es más sensato que <code>rm</code>.</p>' }
        ],
        seealso: ['rmdir', 'trash-put', 'shred', 'find']
      },

      { type: 'h2', id: 'enlaces', text: 'Enlaces simbólicos y duros' },
      { type: 'prose', html: '<p>Un <b>enlace simbólico</b> es un atajo: apunta a una ruta. Si el original se mueve, el enlace se rompe. Un <b>enlace duro</b> es otro nombre para los mismos datos: si borras el original, los datos siguen ahí.</p>' },
      { type: 'command', name: 'ln', tagline: 'crear enlaces', level: 'intermedio',
        synopsis: 'ln [-s] [-f] DESTINO NOMBRE_DEL_ENLACE',
        desc: 'Crea enlaces. Sin <code>-s</code> crea un enlace duro; con <code>-s</code>, uno simbólico (que es lo que quieres el 95% de las veces).',
        options: [
          ['-s', 'Simbólico. <b>Casi siempre el que necesitas</b>'],
          ['-f', 'Sobrescribe el enlace si ya existe'],
          ['-n', 'Trata un enlace a directorio como archivo, no entra en él'],
          ['-r', 'Crea la ruta del destino de forma relativa'],
          ['-v', 'Informa de lo creado']
        ],
        examples: [
          { label: 'El orden de los argumentos: destino primero', lines: [
            '# Regla: ln -s <lo-que-existe> <el-atajo-nuevo>',
            '$ ln -s /opt/miapp/bin/miapp ~/.local/bin/miapp',
            '',
            '# Enlace a una carpeta',
            '$ ln -s /mnt/datos/proyectos ~/proyectos',
            '',
            '# Ver a dónde apunta realmente',
            '$ ls -l ~/proyectos',
            '| lrwxrwxrwx 1 john john 20 sep 10 06:40 proyectos -> /mnt/datos/proyectos',
            '',
            '# Resolver la ruta real y absoluta',
            '$ readlink -f ~/proyectos',
            '',
            '# Detectar enlaces roto en una carpeta',
            '$ find ~ -maxdepth 2 -xtype l'
          ]}
        ],
        notes: [{ variant: 'warn', html: '<p>El orden se olvida constantemente. Mnemotecnia: es igual que <code>cp</code> — <b>primero lo que ya existe, después el nombre nuevo</b>.</p>' }],
        seealso: ['readlink', 'realpath', 'ls']
      },

      { type: 'h2', id: 'rsync', text: 'rsync: la herramienta correcta para respaldos' },
      { type: 'command', name: 'rsync', tagline: 'sincronizar directorios de forma incremental', level: 'intermedio',
        synopsis: 'rsync [OPCIONES] ORIGEN DESTINO',
        desc: 'Copia solo <b>lo que ha cambiado</b>, muestra el progreso y puede reanudarse. Funciona en local y por SSH. Para respaldos es muy superior a <code>cp</code>.',
        options: [
          ['-a', '<i>archive</i>: recursivo preservando permisos, fechas, enlaces y grupos'],
          ['-h', 'Cifras legibles'],
          ['-v', 'Detallado; <code>-vv</code> aún más'],
          ['--progress', 'Barra de progreso por archivo'],
          ['-n', '<i>dry-run</i>: <b>simula</b> sin copiar nada. Úsalo siempre la primera vez'],
          ['--delete', 'Borra en el destino lo que ya no está en el origen (espejo exacto)'],
          ['--exclude=PATRÓN', 'Excluye rutas; se puede repetir'],
          ['-z', 'Comprime durante la transferencia. Útil por red, contraproducente en local'],
          ['-e ssh', 'Transporta por SSH (implícito si el destino tiene <code>usuario@host:</code>)']
        ],
        examples: [
          { label: 'Respaldo a un disco externo', lines: [
            '# 1. SIMULAR primero: -n no copia nada, solo dice qué haría',
            '$ rsync -ahn --delete ~/Documentos/ /mnt/usb/docs/',
            '',
            '# 2. Si la lista es correcta, ejecutar de verdad',
            '$ rsync -ah --progress --delete ~/Documentos/ /mnt/usb/docs/',
            '',
            '# Excluyendo lo que no merece respaldo',
            '$ rsync -ah --progress \\',
            '    --exclude=".cache" --exclude="node_modules" --exclude="*.iso" \\',
            '    ~/ /mnt/usb/home-backup/',
            '',
            '# A un servidor remoto por SSH',
            '$ rsync -ahz --progress ~/web/ usuario@servidor:/var/www/sitio/'
          ]}
        ],
        notes: [
          { variant: 'danger', html: '<p><b>La barra final del origen decide todo.</b> <code>rsync -a origen/ destino/</code> copia el <em>contenido</em> de origen dentro de destino. <code>rsync -a origen destino/</code> (sin barra) crea <code>destino/origen/</code>. Combinado con <code>--delete</code>, equivocarse aquí borra datos. Por eso <code>-n</code> primero, siempre.</p>' },
          { variant: 'tip', html: '<p><code>--delete</code> hace un espejo exacto: lo que borres en el origen desaparece del respaldo en la siguiente ejecución. Si quieres que el respaldo <em>acumule</em> y nunca borre, no uses <code>--delete</code>.</p>' }
        ],
        seealso: ['cp', 'scp', 'tar', 'cron']
      }
    ]
  });

  C.registrar({
    id: 'fs-buscar',
    group: 'archivos',
    title: 'Buscar archivos y contenido',
    level: 'intermedio',
    tags: ['find', 'locate', 'which', 'whereis', 'file', 'stat'],
    lead: '<code>find</code> recorre el disco en tiempo real y filtra por cualquier criterio; <code>locate</code> consulta una base de datos y es instantáneo pero puede estar desactualizada. Saber cuál usar ahorra minutos cada día.',
    blocks: [
      { type: 'h2', id: 'find', text: 'find: el buscador universal' },
      { type: 'command', name: 'find', tagline: 'buscar por nombre, tamaño, fecha, tipo o permisos', level: 'intermedio',
        synopsis: 'find [RUTA] [CRITERIOS] [ACCIÓN]',
        desc: 'Recorre el árbol y filtra. Su sintaxis es distinta al resto de comandos: primero <b>dónde</b>, luego <b>qué</b>, luego <b>qué hacer</b> con lo encontrado.',
        options: [
          ['-name "PATRÓN"', 'Por nombre, sensible a mayúsculas. <b>Entrecomilla el patrón</b> para que no lo expanda el shell'],
          ['-iname "PATRÓN"', 'Igual pero ignorando mayúsculas. Normalmente el que quieres'],
          ['-type f / d / l', 'Solo archivos / directorios / enlaces'],
          ['-size +100M', 'Mayor de 100 MB. <code>-</code> para menor. Sufijos: <code>k</code>, <code>M</code>, <code>G</code>'],
          ['-mtime -7', 'Modificado en los últimos 7 días. <code>+7</code> = hace más de 7'],
          ['-mmin -30', 'Modificado en los últimos 30 minutos'],
          ['-user NOMBRE', 'Propiedad de un usuario'],
          ['-perm 777', 'Con permisos exactos; <code>-perm /u+s</code> busca SUID'],
          ['-empty', 'Archivos o directorios vacíos'],
          ['-maxdepth N', 'No baja más de N niveles. <b>Ponlo primero</b> para que sea eficiente'],
          ['-delete', 'Borra lo encontrado. <b>Peligroso</b>: verifica antes sin esta opción'],
          ['-exec CMD {} \\;', 'Ejecuta un comando por cada resultado; <code>{}</code> es el archivo'],
          ['-exec CMD {} +', 'Igual pero agrupa resultados en una sola llamada: mucho más rápido']
        ],
        examples: [
          { label: 'Por nombre y tipo', lines: [
            '# Todos los PDF de tu home, sin importar mayúsculas',
            '$ find ~ -iname "*.pdf"',
            '',
            '# Solo directorios llamados "cache" en el nivel 1 y 2',
            '$ find ~ -maxdepth 2 -type d -name "cache"',
            '',
            '# Archivos de configuración en /etc, silenciando los errores',
            '$ find /etc -name "*.conf" 2>/dev/null',
            '',
            '# Enlaces simbólicos roto',
            '$ find ~ -xtype l'
          ]},
          { label: 'Por tamaño y fecha: liberar espacio', lines: [
            '# Los archivos de más de 500 MB, ordenados por tamaño',
            '$ find ~ -type f -size +500M -exec du -h {} + | sort -hr',
            '',
            '# Modificado en las últimas 24 horas (¿qué acabo de cambiar?)',
            '$ find ~/proyecto -type f -mtime -1',
            '',
            '# Registros de más de 30 días: primero VER, después borrar',
            '$ find /var/log -name "*.log" -mtime +30',
            '$ sudo find /var/log -name "*.log" -mtime +30 -delete',
            '',
            '# Directorios vacíos, para limpiar',
            '$ find . -type d -empty'
          ]},
          { label: '-exec: actuar sobre cada resultado', lines: [
            '# Copiar todos los .jpg encontrados a una carpeta',
            '$ find . -iname "*.jpg" -exec cp {} ~/Fotos/ \\;',
            '',
            '# La forma RÁPIDA: + agrupa en una sola invocación',
            '$ find . -iname "*.jpg" -exec cp -t ~/Fotos/ {} +',
            '',
            '# Cambiar permisos solo a los directorios',
            '$ find ~/web -type d -exec chmod 755 {} +',
            '',
            '# Buscar texto solo dentro de los archivos .py encontrados',
            '$ find . -name "*.py" -exec grep -l "import os" {} +',
            '',
            '# Con nombres que llevan espacios: -print0 + xargs -0',
            '$ find . -name "*.log" -print0 | xargs -0 rm -v'
          ]}
        ],
        notes: [
          { variant: 'warn', html: '<p>Comprueba <b>siempre</b> un <code>find … -delete</code> ejecutándolo primero sin <code>-delete</code>. <code>find</code> con un criterio mal escrito puede seleccionar muchísimo más de lo que crees.</p>' },
          { variant: 'tip', html: '<p><code>-exec … +</code> frente a <code>-exec … \\;</code>: la versión con <code>+</code> lanza el comando una sola vez con todos los archivos, en lugar de una vez por archivo. Con miles de resultados la diferencia es de minutos a segundos.</p>' }
        ],
        seealso: ['locate', 'grep', 'xargs', 'du']
      },

      { type: 'h2', id: 'locate', text: 'locate: búsqueda instantánea por nombre' },
      { type: 'command', name: 'locate', tagline: 'buscar en una base de datos indexada', level: 'basico',
        synopsis: 'locate [-i] [-l N] [-r REGEX] PATRÓN',
        desc: 'Consulta un índice del sistema de archivos, así que es <b>inmediato</b>. El precio: solo conoce lo que había cuando se actualizó el índice. Instálalo con <code>sudo apt install plocate</code>.',
        options: [
          ['-i', 'Ignora mayúsculas'],
          ['-l N', 'Limita a N resultados'],
          ['-c', 'Solo cuenta cuántos hay'],
          ['-r REGEX', 'Interpreta el patrón como expresión regular'],
          ['-e', 'Solo muestra los que existen ahora mismo (descarta los borrados)']
        ],
        examples: [
          { label: 'Encontrar algo al instante', lines: [
            '$ locate nginx.conf',
            '$ locate -i informe          # Sin distinguir mayúsculas',
            '$ locate -c "*.pdf"          # ¿Cuántos PDF hay en el sistema?',
            '$ locate -l 5 python3        # Solo los 5 primeros',
            '',
            '# El índice está desactualizado: refréscalo',
            '$ sudo updatedb',
            '',
            '# Recién creado un archivo y locate no lo ve? Es normal:',
            '# updatedb corre una vez al día. Usa find para lo reciente.'
          ]}
        ],
        notes: [{ variant: 'info', html: '<p><b>Cuál usar:</b> <code>locate</code> para «¿dónde está ese archivo que sé que existe?». <code>find</code> para «archivos de más de 100 MB modificados esta semana» o para cualquier cosa creada hace minutos.</p>' }],
        seealso: ['find', 'updatedb', 'which']
      },

      { type: 'h2', id: 'localizar-cmd', text: 'Localizar comandos e identificar archivos' },
      { type: 'cmd', label: '¿Qué comando se está ejecutando en realidad?', lines: [
        '# Ruta del ejecutable que se usará',
        '$ which python3',
        '| /usr/bin/python3',
        '',
        '# TODAS las versiones que hay en el PATH (revela conflictos)',
        '$ which -a python3',
        '| /home/john/anaconda3/bin/python3',
        '| /usr/bin/python3',
        '',
        '# Binario, fuentes y páginas de manual',
        '$ whereis python3',
        '',
        '# ¿Es un alias, una función o un programa real?',
        '$ type -a ls',
        '| ls is aliased to `ls --color=auto\'',
        '| ls is /usr/bin/ls',
        '',
        '# El orden de búsqueda: el primero del PATH gana',
        '$ echo $PATH | tr ":" "\\n"'
      ]},
      { type: 'callout', variant: 'tip', title: 'El caso clásico de Anaconda',
        html: '<p>Si <code>which -a python3</code> muestra primero una ruta de <code>anaconda3</code>, es que Anaconda se ha puesto delante en tu <code>PATH</code>. Por eso un paquete que instalaste con <code>apt</code> «no aparece»: estás usando otro Python. <code>type -a</code> y <code>which -a</code> son los que revelan este tipo de conflicto.</p>' },
      { type: 'cmd', label: 'Identificar y examinar un archivo', lines: [
        '# ¿Qué es esto en realidad? (no se fía de la extensión)',
        '$ file documento.pdf',
        '| documento.pdf: PDF document, version 1.7',
        '',
        '$ file script',
        '| script: Bourne-Again shell script, ASCII text executable',
        '',
        '# Metadatos completos: permisos, inodo, fechas, tamaño real',
        '$ stat notas.txt',
        '',
        '# Solo lo que te interesa, con formato propio',
        '$ stat -c "%n: %s bytes, permisos %a, dueño %U" notas.txt',
        '| notas.txt: 1234 bytes, permisos 644, dueño john'
      ]}
    ]
  });

})(window.Contenido);
