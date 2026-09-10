/* 04-texto.js — leer, filtrar y procesar texto */
(function (C) {
  'use strict';

  C.registrar({
    id: 'txt-leer',
    group: 'terminal',
    title: 'Leer archivos: cat, less, head, tail',
    level: 'basico',
    tags: ['cat', 'less', 'head', 'tail', 'wc', 'nl'],
    lead: 'Cuatro comandos para cuatro necesidades distintas: ver todo, paginar, ver el principio o seguir el final en directo. Elegir mal es lo que hace que una terminal se llene de miles de líneas inservibles.',
    blocks: [
      { type: 'table', head: ['Comando', 'Cuándo usarlo'], monoFirst: false, rows: [
        ['<code>cat</code>', 'Archivos <b>cortos</b> (menos de una pantalla) o para concatenar y pasar por tubería'],
        ['<code>less</code>', 'Archivos <b>largos</b>: pagina, busca y no carga todo en memoria'],
        ['<code>head</code>', 'Solo el principio: cabeceras de CSV, primeras líneas de un registro'],
        ['<code>tail -f</code>', '<b>Seguir un registro en vivo</b> mientras se escribe. Imprescindible al depurar']
      ]},
      { type: 'command', name: 'cat', tagline: 'concatenar y mostrar', level: 'basico',
        synopsis: 'cat [-n] [-A] [-s] ARCHIVO...',
        desc: 'Vuelca el contenido a stdout. Su nombre viene de <i>concatenate</i>: su propósito original era unir archivos.',
        options: [
          ['-n', 'Numera todas las líneas'],
          ['-b', 'Numera solo las líneas no vacías'],
          ['-A', 'Muestra los caracteres invisibles: tabuladores como <code>^I</code>, fin de línea como <code>$</code>'],
          ['-s', 'Comprime varias líneas vacías consecutivas en una'],
          ['-T', 'Solo marca los tabuladores']
        ],
        examples: [
          { label: 'Usos reales', lines: [
            '$ cat notas.txt                    # Ver un archivo corto',
            '$ cat parte1.txt parte2.txt > completo.txt   # Concatenar',
            '$ cat -n script.sh                 # Con números de línea',
            '',
            '# Depurar espacios invisibles: ¿tabulador o espacios?',
            '$ cat -A Makefile | head',
            '| ^Igcc -o programa main.c$',
            '',
            '# Ver la configuración sin comentarios ni líneas vacías',
            '$ grep -v "^#" /etc/ssh/sshd_config | grep -v "^$"'
          ]}
        ],
        notes: [{ variant: 'warn', html: '<p>No hagas <code>cat</code> a un archivo binario o enorme: llenará la terminal de basura y puede dejarla inutilizable. Si ocurre, ejecuta <code>reset</code>. Comprueba antes con <code>file archivo</code> y <code>wc -l archivo</code>.</p>' }],
        seealso: ['less', 'head', 'tac', 'wc']
      },
      { type: 'command', name: 'less', tagline: 'paginar con búsqueda', level: 'basico',
        synopsis: 'less [-N] [-S] [+F] ARCHIVO',
        desc: 'Visor paginado. No carga el archivo completo, así que abre archivos de gigabytes al instante.',
        options: [
          ['-N', 'Muestra números de línea'],
          ['-S', 'No parte las líneas largas (se desplaza en horizontal)'],
          ['+F', 'Arranca en modo seguimiento, como <code>tail -f</code>'],
          ['-i', 'Búsquedas insensibles a mayúsculas'],
          ['+G', 'Abre directamente al final del archivo']
        ],
        examples: [
          { label: 'Abrir y navegar', lines: [
            '$ less /var/log/syslog',
            '$ less -N script.py            # Con números de línea',
            '$ journalctl -u ssh | less     # Paginar la salida de otro comando',
            '$ less +G /var/log/syslog      # Directo al final'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p><b>Dentro de <code>less</code>:</b> <kbd>Espacio</kbd> página siguiente · <kbd>b</kbd> anterior · <kbd>g</kbd> al inicio · <kbd>G</kbd> al final · <kbd>/texto</kbd> buscar hacia delante · <kbd>?texto</kbd> hacia atrás · <kbd>n</kbd> siguiente coincidencia · <kbd>N</kbd> anterior · <kbd>F</kbd> seguir en vivo · <kbd>q</kbd> salir.</p>' }],
        seealso: ['cat', 'tail', 'more', 'journalctl']
      },
      { type: 'command', name: 'tail', tagline: 'el final del archivo, y en vivo', level: 'basico',
        synopsis: 'tail [-n N] [-f] [-F] ARCHIVO...',
        desc: 'Muestra las últimas líneas. Con <code>-f</code> se queda esperando y muestra lo que se vaya escribiendo: es <b>la</b> herramienta para depurar servicios.',
        options: [
          ['-n N', 'Las últimas N líneas (por defecto 10)'],
          ['-n +N', 'Desde la línea N hasta el final'],
          ['-f', '<i>follow</i>: sigue mostrando lo nuevo. Sal con <kbd>Ctrl</kbd>+<kbd>C</kbd>'],
          ['-F', 'Como <code>-f</code> pero <b>reabre</b> el archivo si se rota. Mejor para registros'],
          ['-c N', 'Los últimos N bytes']
        ],
        examples: [
          { label: 'Depurar en tiempo real', lines: [
            '$ tail /var/log/syslog             # Últimas 10 líneas',
            '$ tail -n 50 /var/log/syslog       # Últimas 50',
            '',
            '# LO MÁS ÚTIL: seguir un registro mientras reproduces el error',
            '$ sudo tail -F /var/log/syslog',
            '',
            '# Seguir y filtrar a la vez',
            '$ sudo tail -F /var/log/syslog | grep -i --line-buffered error',
            '',
            '# Varios archivos a la vez (muestra cabeceras)',
            '$ sudo tail -F /var/log/nginx/*.log',
            '',
            '# Saltarse la cabecera de un CSV',
            '$ tail -n +2 datos.csv'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p><code>--line-buffered</code> en <code>grep</code> es necesario al filtrar un <code>tail -F</code>: sin él, <code>grep</code> acumula la salida en un búfer y no verás nada hasta que se llene.</p><p>Para registros de systemd, <code>journalctl -f -u servicio</code> es mejor que <code>tail</code>.</p>' }],
        seealso: ['head', 'less', 'journalctl', 'grep']
      },
      { type: 'cmd', label: 'head y wc: el resto del grupo', lines: [
        '$ head archivo.txt              # Primeras 10 líneas',
        '$ head -n 3 datos.csv           # Cabecera de un CSV',
        '$ head -c 100 archivo.bin       # Primeros 100 bytes',
        '',
        '# Ver principio y final de golpe',
        '$ (head -n 5; echo "..."; tail -n 5) < archivo.log',
        '',
        '# wc: contar',
        '$ wc -l archivo.txt             # Líneas',
        '$ wc -w archivo.txt             # Palabras',
        '$ wc -c archivo.txt             # Bytes',
        '$ ls -1 | wc -l                 # Cuántos archivos hay aquí',
        '',
        '# Antes de hacer cat a algo desconocido, mide',
        '$ wc -l /var/log/syslog',
        '| 128437 /var/log/syslog        # ← mejor usa less'
      ]}
    ]
  });

  C.registrar({
    id: 'txt-grep',
    group: 'terminal',
    title: 'grep: buscar dentro de los archivos',
    level: 'intermedio',
    tags: ['grep', 'regex', 'expresiones regulares', 'buscar texto'],
    lead: 'Si <code>find</code> busca archivos <em>por sus datos</em>, <code>grep</code> busca <em>dentro</em> de ellos. Es probablemente el comando que más veces salva una tarde de depuración.',
    blocks: [
      { type: 'command', name: 'grep', tagline: 'buscar patrones en texto', level: 'intermedio',
        synopsis: 'grep [OPCIONES] PATRÓN [ARCHIVO...]',
        desc: 'Imprime las líneas que coinciden con un patrón. Lee de archivos o de una tubería.',
        options: [
          ['-i', 'Ignora mayúsculas y minúsculas'],
          ['-r', 'Recursivo por directorios; <code>-R</code> además sigue enlaces'],
          ['-n', 'Muestra el número de línea. <b>Casi siempre lo quieres</b>'],
          ['-c', 'Solo cuenta las coincidencias'],
          ['-v', '<b>Invierte</b>: muestra las líneas que NO coinciden'],
          ['-l', 'Solo los nombres de archivo con coincidencias'],
          ['-L', 'Solo los archivos <b>sin</b> coincidencias'],
          ['-w', 'Solo palabras completas (<code>-w cat</code> no encuentra «catálogo»)'],
          ['-A N', 'Muestra N líneas <i>después</i> de cada coincidencia'],
          ['-B N', 'N líneas <i>antes</i>'],
          ['-C N', 'N líneas de contexto a cada lado'],
          ['-E', 'Expresiones regulares extendidas (permite <code>|</code>, <code>+</code>, <code>?</code>)'],
          ['-F', 'Trata el patrón como texto literal, sin regex. Más rápido'],
          ['-o', 'Muestra solo la parte que coincide, no la línea entera'],
          ['--include="*.py"', 'En búsquedas recursivas, limita por tipo de archivo'],
          ['--exclude-dir=.git', 'Salta directorios completos']
        ],
        examples: [
          { label: 'Lo básico', lines: [
            '$ grep "error" registro.log              # Búsqueda simple',
            '$ grep -i "error" registro.log           # Sin distinguir mayúsculas',
            '$ grep -n "TODO" script.py               # Con número de línea',
            '$ grep -c "404" access.log               # Cuántas veces aparece',
            '',
            '# Excluir en lugar de incluir: ver config sin comentarios',
            '$ grep -v "^#" /etc/fstab | grep -v "^$"',
            '',
            '# Contexto: ver qué pasó ALREDEDOR del error',
            '$ grep -C 3 "Segmentation fault" crash.log'
          ]},
          { label: 'Búsqueda recursiva en código', lines: [
            '# ¿Dónde se usa esta función en todo el proyecto?',
            '$ grep -rn "calcularTotal" .',
            '',
            '# Limitando a archivos Python y sin el ruido de .git',
            '$ grep -rn --include="*.py" --exclude-dir=".git" "import requests" .',
            '',
            '# Solo los NOMBRES de archivo que la contienen',
            '$ grep -rl "TODO" src/',
            '',
            '# Buscar en varios patrones a la vez (-E permite el |)',
            '$ grep -rnE "TODO|FIXME|HACK" src/',
            '',
            '# Palabra completa: evita falsos positivos',
            '$ grep -rnw "id" modelo.py'
          ]},
          { label: 'Combinado con tuberías', lines: [
            '# ¿Está corriendo el proceso? (el -v grep se quita a sí mismo)',
            '$ ps aux | grep [n]ginx',
            '',
            '# Filtrar la salida de otro comando',
            '$ dmesg | grep -i usb',
            '$ systemctl list-units | grep failed',
            '$ ip a | grep "inet "',
            '',
            '# Seguir un registro filtrando en vivo',
            '$ sudo tail -F /var/log/syslog | grep --line-buffered -i "denied"'
          ]}
        ],
        notes: [
          { variant: 'tip', html: '<p><b>El truco de los corchetes:</b> <code>ps aux | grep [n]ginx</code> encuentra nginx pero no la propia línea de <code>grep</code>, porque el patrón literal <code>[n]ginx</code> no coincide consigo mismo. Más elegante que <code>| grep -v grep</code>.</p>' },
          { variant: 'info', html: '<p>Entrecomilla el patrón con <b>comillas simples</b> cuando lleve caracteres especiales de regex: <code>grep \'^[a-z]*$\'</code>. Con comillas dobles el shell podría expandir <code>$</code> o <code>*</code> antes de que grep lo vea.</p>' }
        ],
        seealso: ['find', 'sed', 'awk', 'rg']
      },
      { type: 'h2', id: 'regex', text: 'Expresiones regulares: lo que de verdad se usa' },
      { type: 'table', head: ['Patrón', 'Coincide con', 'Ejemplo'], rows: [
        ['<code>^</code>', 'Inicio de línea', '<code>^root</code> → líneas que empiezan por root'],
        ['<code>$</code>', 'Fin de línea', '<code>bash$</code> → líneas que terminan en bash'],
        ['<code>^$</code>', 'Línea vacía', '<code>grep -v "^$"</code> quita las vacías'],
        ['<code>.</code>', 'Un carácter cualquiera', '<code>c.t</code> → cat, cot, c9t'],
        ['<code>.*</code>', 'Cualquier cosa, incluso nada', '<code>error.*fatal</code>'],
        ['<code>[0-9]</code>', 'Un dígito', '<code>[0-9]\\{3\\}</code> → tres dígitos'],
        ['<code>[^0-9]</code>', 'Cualquier cosa que NO sea dígito', ''],
        ['<code>\\+</code> o <code>+</code> con -E', 'Una o más veces', '<code>-E "ab+"</code> → ab, abb'],
        ['<code>?</code> con -E', 'Cero o una vez (opcional)', '<code>-E "colou?r"</code>'],
        ['<code>|</code> con -E', 'Alternativa (o)', '<code>-E "error|warning"</code>'],
        ['<code>\\b</code>', 'Límite de palabra', '<code>\\bcat\\b</code> → cat, no catálogo'],
        ['<code>()</code> con -E', 'Agrupar', '<code>-E "(ab)+"</code>']
      ]},
      { type: 'cmd', label: 'Patrones que resuelven problemas reales', lines: [
        '# Extraer todas las direcciones IP de un registro',
        '$ grep -oE "([0-9]{1,3}\\.){3}[0-9]{1,3}" access.log | sort -u',
        '',
        '# Extraer direcciones de correo',
        '$ grep -oE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}" contactos.txt',
        '',
        '# Líneas que empiezan por una fecha ISO',
        '$ grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" registro.log',
        '',
        '# Usuarios del sistema con shell real (no de servicio)',
        '$ grep -E "/(bash|sh|zsh)$" /etc/passwd | cut -d: -f1',
        '',
        '# Buscar una IP concreta como palabra exacta',
        '$ grep -w "192.168.1.10" access.log'
      ]},
      { type: 'callout', variant: 'tip', title: 'ripgrep: grep moderno para código',
        html: '<p><code>sudo apt install ripgrep</code> y luego <code>rg patrón</code>. Es mucho más rápido en árboles grandes, respeta <code>.gitignore</code> automáticamente, colorea la salida y recursa por defecto. Para buscar en código es la mejor opción; <code>grep</code> sigue siendo el que está en <em>todas</em> las máquinas.</p>' }
    ]
  });

  C.registrar({
    id: 'txt-procesar',
    group: 'terminal',
    title: 'Procesar texto: sort, cut, awk, sed',
    level: 'avanzado',
    tags: ['sort', 'uniq', 'cut', 'awk', 'sed', 'tr', 'paste'],
    lead: 'Con estos cinco comandos se transforma cualquier archivo de texto sin abrir un editor: extraer columnas, ordenar, contar repeticiones y reemplazar en masa. Es lo que convierte un registro de 100 000 líneas en una tabla legible.',
    blocks: [
      { type: 'h2', id: 'sort-uniq', text: 'sort y uniq: ordenar y contar' },
      { type: 'command', name: 'sort', tagline: 'ordenar líneas', level: 'intermedio',
        synopsis: 'sort [-n] [-h] [-r] [-u] [-k N] [-t SEP] ARCHIVO',
        desc: 'Ordena líneas. Por defecto alfabéticamente, lo que da sorpresas con números: «10» va antes de «9».',
        options: [
          ['-n', 'Orden <b>numérico</b>. Necesario para cifras'],
          ['-h', 'Numérico entendiendo sufijos: <code>1.5G</code> &gt; <code>800M</code>. Ideal con <code>du -h</code>'],
          ['-r', 'Invierte el orden (de mayor a menor)'],
          ['-u', 'Elimina duplicados durante la ordenación'],
          ['-k N', 'Ordena por la columna N'],
          ['-t SEP', 'Separador de campos (<code>-t:</code> para <code>/etc/passwd</code>)'],
          ['-V', 'Orden de versiones: <code>1.10</code> &gt; <code>1.9</code>'],
          ['-f', 'Ignora mayúsculas']
        ],
        examples: [
          { label: 'La trampa del orden alfabético', lines: [
            '$ printf "10\\n9\\n100\\n" | sort',
            '| 10',
            '| 100',
            '| 9              # ← alfabéticamente correcto, pero no es lo que querías',
            '',
            '$ printf "10\\n9\\n100\\n" | sort -n',
            '| 9',
            '| 10',
            '| 100',
            '',
            '# Con tamaños legibles: la combinación clave',
            '$ du -h -d 1 ~ | sort -hr | head',
            '',
            '# Por la tercera columna, numéricamente',
            '$ sort -t: -k3 -n /etc/passwd',
            '',
            '# Ordenar versiones correctamente',
            '$ printf "v1.9\\nv1.10\\nv1.2\\n" | sort -V'
          ]}
        ],
        seealso: ['uniq', 'awk', 'cut']
      },
      { type: 'cmd', label: 'uniq: contar repeticiones (requiere ordenar antes)', lines: [
        '# uniq SOLO elimina duplicados ADYACENTES: hay que ordenar primero',
        '$ sort archivo.txt | uniq',
        '',
        '# -c cuenta cuántas veces aparece cada línea',
        '$ sort archivo.txt | uniq -c',
        '',
        '# EL PATRÓN MÁS ÚTIL: top de repeticiones',
        '$ sort access.log | uniq -c | sort -rn | head -10',
        '',
        '# Solo las líneas duplicadas',
        '$ sort archivo.txt | uniq -d',
        '',
        '# Solo las que aparecen UNA vez',
        '$ sort archivo.txt | uniq -u',
        '',
        '# Ejemplo real: las 10 IP que más peticiones hacen',
        '$ awk "{print \\$1}" access.log | sort | uniq -c | sort -rn | head -10',
        '|  1523 203.0.113.45',
        '|   891 198.51.100.7'
      ]},

      { type: 'h2', id: 'cut', text: 'cut: extraer columnas' },
      { type: 'command', name: 'cut', tagline: 'quedarse con ciertos campos', level: 'basico',
        synopsis: 'cut -d SEP -f LISTA | cut -c RANGO',
        desc: 'Extrae columnas de un texto delimitado. Simple y rápido, pero solo sirve con <b>un</b> carácter separador; si los campos están separados por varios espacios, necesitas <code>awk</code>.',
        options: [
          ['-d SEP', 'Carácter delimitador (por defecto el tabulador)'],
          ['-f N', 'Campo N; acepta listas <code>-f1,3</code> y rangos <code>-f2-4</code>'],
          ['-c N', 'Por caracteres en lugar de campos'],
          ['--complement', 'Devuelve todo <b>menos</b> los campos indicados'],
          ['-s', 'Descarta las líneas que no tienen el separador']
        ],
        examples: [
          { label: 'Extraer campos', lines: [
            '# Usuarios y sus shells de /etc/passwd',
            '$ cut -d: -f1,7 /etc/passwd',
            '| root:/bin/bash',
            '| john:/bin/bash',
            '',
            '# Solo la primera columna de un CSV',
            '$ cut -d, -f1 datos.csv',
            '',
            '# Columnas 2 a 4',
            '$ cut -d, -f2-4 datos.csv',
            '',
            '# Todo menos la primera columna',
            '$ cut -d, -f1 --complement datos.csv',
            '',
            '# Los 10 primeros caracteres de cada línea',
            '$ cut -c1-10 registro.log'
          ]}
        ],
        notes: [{ variant: 'warn', html: '<p><code>cut</code> no maneja <b>varios espacios seguidos</b> como un separador. Con la salida de <code>ls -l</code> o <code>ps</code>, usa <code>awk \'{print $3}\'</code>, que sí colapsa los espacios.</p>' }],
        seealso: ['awk', 'paste', 'column']
      },

      { type: 'h2', id: 'awk', text: 'awk: el procesador de columnas' },
      { type: 'command', name: 'awk', tagline: 'programar sobre columnas de texto', level: 'avanzado',
        synopsis: "awk [-F SEP] 'PATRÓN { ACCIÓN }' ARCHIVO",
        desc: 'Un lenguaje completo especializado en texto tabular. Procesa línea a línea, partiéndola en campos: <code>$1</code>, <code>$2</code>… y <code>$0</code> es la línea entera.',
        options: [
          ['-F SEP', 'Separador de campos: <code>-F:</code> o <code>-F,</code>'],
          ['-v var=valor', 'Pasa una variable del shell a awk'],
          ['NR', 'Variable: número de línea actual'],
          ['NF', 'Variable: cuántos campos tiene la línea'],
          ['$NF', 'El <b>último</b> campo (muy útil cuando el número varía)'],
          ['BEGIN {}', 'Se ejecuta antes de leer nada (cabeceras, inicializar)'],
          ['END {}', 'Se ejecuta al terminar (totales, promedios)']
        ],
        examples: [
          { label: 'Extraer y formatear', lines: [
            '# Campo 1 y 3, con texto propio',
            '$ awk -F: \'{print $1 " usa " $7}\' /etc/passwd',
            '',
            '# El último campo, sea el número que sea',
            '$ awk \'{print $NF}\' registro.log',
            '',
            '# Con cabecera y columnas alineadas',
            '$ ls -l | awk \'BEGIN {printf "%-20s %10s\\n", "ARCHIVO", "BYTES"} \\',
            '                NR>1 {printf "%-20s %10d\\n", $9, $5}\'',
            '',
            '# Solo las líneas donde el campo 5 supera un valor',
            '$ ls -l | awk \'$5 > 1000000 {print $9, $5}\'',
            '',
            '# Solo las líneas 10 a 20',
            '$ awk \'NR>=10 && NR<=20\' archivo.txt'
          ]},
          { label: 'Calcular: sumas, promedios, agrupaciones', lines: [
            '# Sumar la columna 3',
            '$ awk \'{suma += $3} END {print "Total:", suma}\' datos.csv',
            '',
            '# Promedio',
            '$ awk \'{s += $1; n++} END {print "Media:", s/n}\' numeros.txt',
            '',
            '# Agrupar y contar: cuántas peticiones por código HTTP',
            '$ awk \'{cuenta[$9]++} END {for (c in cuenta) print c, cuenta[c]}\' access.log',
            '| 200 8421',
            '| 404 213',
            '| 500 12',
            '',
            '# Sumar bytes transferidos por IP',
            '$ awk \'{bytes[$1] += $10} END {for (ip in bytes) print bytes[ip], ip}\' \\',
            '    access.log | sort -rn | head',
            '',
            '# Memoria total de los procesos de un usuario',
            '$ ps aux | awk \'$1=="john" {m += $6} END {print m/1024 " MB"}\''
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p>Usa <b>comillas simples</b> para el programa de awk: dentro se usa <code>$1</code>, y con comillas dobles el shell lo expandiría como variable propia antes de que awk lo viera.</p>' }],
        seealso: ['cut', 'sed', 'sort', 'column']
      },

      { type: 'h2', id: 'sed', text: 'sed: reemplazar y editar en flujo' },
      { type: 'command', name: 'sed', tagline: 'editor de flujo: sustituir, borrar, insertar', level: 'avanzado',
        synopsis: "sed [-i] [-E] 'COMANDO' ARCHIVO",
        desc: 'Aplica transformaciones línea a línea. Su uso más frecuente, con diferencia, es la sustitución <code>s/viejo/nuevo/</code>.',
        options: [
          ['-i', '<i>in-place</i>: <b>modifica el archivo</b>. Usa <code>-i.bak</code> para dejar copia'],
          ['-E', 'Expresiones regulares extendidas'],
          ['-n', 'No imprime nada salvo lo que pidas con <code>p</code>'],
          ['s/a/b/', 'Sustituye la <b>primera</b> aparición de cada línea'],
          ['s/a/b/g', '<i>global</i>: todas las apariciones de cada línea'],
          ['s/a/b/gI', 'Global e insensible a mayúsculas'],
          ['Nd', 'Borra la línea N; <code>/patrón/d</code> borra las que coincidan'],
          ['Np', 'Imprime la línea N (con <code>-n</code>)'],
          ['1i\\texto', 'Inserta texto antes de la línea 1'],
          ['$a\\texto', 'Añade texto al final del archivo']
        ],
        examples: [
          { label: 'Sustituir (siempre probando antes)', lines: [
            '# 1. PRUEBA: muestra el resultado sin tocar el archivo',
            '$ sed \'s/localhost/127.0.0.1/g\' config.conf',
            '',
            '# 2. Si es correcto, aplica DEJANDO COPIA de seguridad',
            '$ sed -i.bak \'s/localhost/127.0.0.1/g\' config.conf',
            '$ ls config.conf*',
            '| config.conf  config.conf.bak',
            '',
            '# Solo la primera aparición de cada línea (sin la g)',
            '$ sed \'s/error/ERROR/\' registro.log',
            '',
            '# Usar otro delimitador cuando el texto lleva barras',
            '$ sed \'s|/usr/local/bin|/opt/bin|g\' script.sh',
            '',
            '# Reutilizar lo coincidente con &',
            '$ echo "version 5" | sed \'s/[0-9]\\+/[&]/\'',
            '| version [5]'
          ]},
          { label: 'Borrar, insertar y extraer', lines: [
            '# Quitar los comentarios y las líneas vacías',
            '$ sed \'/^#/d; /^$/d\' /etc/fstab',
            '',
            '# Borrar la primera línea (la cabecera de un CSV)',
            '$ sed \'1d\' datos.csv',
            '',
            '# Borrar de la línea 5 a la 10',
            '$ sed \'5,10d\' archivo.txt',
            '',
            '# Imprimir SOLO un rango de líneas (más rápido que head|tail)',
            '$ sed -n \'100,120p\' registro-enorme.log',
            '',
            '# Añadir una línea al principio',
            '$ sed \'1i\\#!/usr/bin/env bash\' script.sh',
            '',
            '# Quitar espacios al final de cada línea',
            '$ sed -i \'s/[[:space:]]*$//\' archivo.txt'
          ]}
        ],
        notes: [
          { variant: 'danger', html: '<p><code>sed -i</code> <b>reescribe el archivo</b> y no hay deshacer. Dos hábitos que evitan desastres:</p><ol><li>Ejecútalo <b>sin</b> <code>-i</code> primero y revisa la salida.</li><li>Usa <code>-i.bak</code> en lugar de <code>-i</code>: deja el original en <code>archivo.bak</code>.</li></ol>' }
        ],
        seealso: ['awk', 'grep', 'tr', 'perl']
      },
      { type: 'cmd', label: 'tr: transformar caracteres', lines: [
        '# Minúsculas a mayúsculas',
        '$ echo "hola" | tr "a-z" "A-Z"',
        '| HOLA',
        '',
        '# Cambiar el separador: dos puntos por saltos de línea',
        '$ echo $PATH | tr ":" "\\n"',
        '',
        '# Borrar caracteres (-d)',
        '$ echo "a1b2c3" | tr -d "0-9"',
        '| abc',
        '',
        '# Comprimir repeticiones (-s): varios espacios en uno',
        '$ echo "a    b     c" | tr -s " "',
        '| a b c',
        '',
        '# Limpiar los retornos de carro de un archivo de Windows',
        '$ tr -d "\\r" < windows.txt > unix.txt'
      ]},
      { type: 'callout', variant: 'tip', title: 'Cuál elegir de los cuatro',
        html: '<ul><li><code>cut</code> — extraer campos con <b>un</b> separador limpio. Lo más simple.</li><li><code>awk</code> — cuando hay que <b>calcular</b>, agrupar, o los campos están separados por espacios variables.</li><li><code>sed</code> — <b>sustituir</b> texto o borrar líneas.</li><li><code>tr</code> — cambiar o borrar <b>caracteres</b> sueltos.</li></ul><p>En la duda entre <code>cut</code> y <code>awk</code>: si <code>cut</code> lo resuelve, úsalo; es más legible.</p>' }
    ]
  });

})(window.Contenido);
