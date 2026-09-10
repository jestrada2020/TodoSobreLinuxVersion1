/* 03-terminal.js — shell, redirecciones, tuberías y expansiones */
(function (C) {
  'use strict';

  C.registrar({
    id: 'term-shell',
    group: 'terminal',
    title: 'El shell: cómo interpreta lo que escribes',
    level: 'basico',
    tags: ['bash', 'alias', 'PATH', 'variables', 'historial', 'bashrc'],
    lead: 'Entender el <b>orden</b> en que Bash procesa una línea explica casi todos los comportamientos «raros»: por qué las comillas cambian el resultado, por qué un comodín a veces no se expande y por qué tu alias no funciona dentro de un script.',
    blocks: [
      { type: 'h2', id: 'orden', text: 'El orden de procesamiento de Bash' },
      { type: 'prose', html: '<p>Cuando pulsas <kbd>Enter</kbd>, Bash no ejecuta la línea tal cual. La transforma en varias pasadas, y siempre en este orden:</p>' },
      { type: 'ascii', text:
'  echo "Hola $USER" > salida.txt\n' +
'          │                │\n' +
'  1. Divide en palabras (por espacios y tabuladores)\n' +
'  2. Expande llaves        {a,b}      → a b\n' +
'  3. Expande la virgulilla ~          → /home/john\n' +
'  4. Expande variables     $USER      → john\n' +
'  5. Sustituye comandos    $(fecha)   → salida del comando\n' +
'  6. Expande aritmética    $((2+3))   → 5\n' +
'  7. Divide en palabras otra vez (¡aquí rompen los espacios!)\n' +
'  8. Expande comodines     *.txt      → a.txt b.txt\n' +
'  9. Aplica redirecciones  > salida.txt\n' +
' 10. Ejecuta el comando' },
      { type: 'callout', variant: 'tip', title: 'El paso 7 es el que causa los errores',
        html: '<p>Después de expandir una variable, Bash <b>vuelve a dividir por espacios</b>. Si <code>$ARCHIVO</code> contiene <code>mi documento.txt</code>, el comando recibe <em>dos</em> argumentos. Por eso se entrecomilla: <code>"$ARCHIVO"</code> impide esa segunda división. <b>Entrecomilla siempre las variables.</b></p>' },
      { type: 'cmd', label: 'Ver la diferencia en la práctica', lines: [
        '$ ARCHIVO="mi documento.txt"',
        '$ touch "$ARCHIVO"        # Crea UN archivo llamado "mi documento.txt"',
        '$ ls -l $ARCHIVO          # ERROR: busca "mi" y "documento.txt"',
        '| ls: no se puede acceder a \'mi\': No existe el archivo',
        '$ ls -l "$ARCHIVO"        # Correcto',
        '',
        '# Comprobar qué recibe realmente un comando:',
        '$ printf "[%s]\\n" $ARCHIVO',
        '| [mi]',
        '| [documento.txt]',
        '$ printf "[%s]\\n" "$ARCHIVO"',
        '| [mi documento.txt]'
      ]},

      { type: 'h2', id: 'comillas', text: 'Los tres tipos de comillas' },
      { type: 'table', head: ['Forma', 'Qué hace', 'Cuándo usarla'], monoFirst: false, rows: [
        ['<code>"doble"</code>', 'Expande variables y <code>$(comandos)</code>, pero no divide por espacios ni expande comodines', '<b>El caso normal.</b> Casi siempre esto'],
        ['<code>\'simple\'</code>', 'Literal absoluto: nada se expande, ni <code>$</code> ni <code>*</code>', 'Cuando quieres el texto exacto, como en expresiones regulares'],
        ['<code>\\</code> (barra)', 'Escapa el siguiente carácter', 'Un espacio o un carácter especial suelto'],
        ['sin comillas', 'Todo se expande y se divide', 'Solo cuando <em>quieres</em> que un comodín se expanda']
      ]},
      { type: 'cmd', label: 'La diferencia importa', lines: [
        '$ echo "Usuario: $USER"     # Usuario: john',
        '$ echo \'Usuario: $USER\'     # Usuario: $USER  (literal)',
        '',
        '# Con grep: comillas SIMPLES para que el shell no toque el patrón',
        '$ grep \'^[a-z]*$\' archivo.txt',
        '',
        '# Con rutas que llevan espacios',
        '$ cd "/home/john/Mis Documentos"',
        '$ cd /home/john/Mis\\ Documentos'
      ]},

      { type: 'h2', id: 'variables', text: 'Variables y el PATH' },
      { type: 'cmd', label: 'Variables de shell y de entorno', lines: [
        '# Variable de SHELL: solo existe en esta terminal',
        '$ nombre="Linux"',
        '$ echo $nombre',
        '',
        '# Variable de ENTORNO: la heredan los programas que lances',
        '$ export EDITOR=nano',
        '',
        '# Sin espacios alrededor del = (esto FALLA):',
        '$ nombre = "Linux"',
        '| nombre: orden no encontrada',
        '',
        '# Ver todas las variables de entorno',
        '$ env | sort | less',
        '',
        '# Valor por defecto si la variable está vacía',
        '$ echo "${EDITOR:-vim}"',
        '',
        '# Borrar una variable',
        '$ unset nombre'
      ]},
      { type: 'table', head: ['Variable', 'Contiene'], rows: [
        ['<code>$HOME</code>', 'Tu carpeta personal'],
        ['<code>$USER</code>', 'Tu nombre de usuario'],
        ['<code>$PATH</code>', 'Directorios donde se buscan los comandos, separados por <code>:</code>'],
        ['<code>$PWD</code>', 'Directorio actual'],
        ['<code>$SHELL</code>', 'Tu shell de inicio de sesión'],
        ['<code>$?</code>', 'Código de salida del último comando: <b>0 = éxito</b>'],
        ['<code>$$</code>', 'PID del shell actual'],
        ['<code>$!</code>', 'PID del último proceso lanzado en segundo plano'],
        ['<code>$0</code>', 'Nombre del script en ejecución'],
        ['<code>$1</code>…<code>$9</code>', 'Argumentos posicionales de un script'],
        ['<code>$#</code>', 'Cuántos argumentos se recibieron'],
        ['<code>$@</code>', 'Todos los argumentos como lista (entrecomíllalo: <code>"$@"</code>)']
      ]},
      { type: 'cmd', label: 'Añadir algo al PATH de forma permanente', lines: [
        '# Ver el PATH de forma legible',
        '$ echo $PATH | tr ":" "\\n"',
        '',
        '# Añadir tu carpeta de scripts (solo para esta sesión)',
        '$ export PATH="$HOME/.local/bin:$PATH"',
        '',
        '# Hacerlo permanente: añadirlo a ~/.bashrc',
        '$ echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.bashrc',
        '$ source ~/.bashrc      # Recargar sin cerrar la terminal',
        '',
        '# El ORDEN importa: lo que va primero, gana.',
        '# Poner $PATH al final significa "mi carpeta tiene prioridad".'
      ]},
      { type: 'callout', variant: 'warn', title: 'Nunca sobrescribas el PATH',
        html: '<p><code>export PATH="/mi/ruta"</code> (sin incluir <code>$PATH</code>) deja el sistema sin acceso a <code>ls</code>, <code>cat</code> ni nada. Incluye <b>siempre</b> el <code>$PATH</code> anterior. Si te ocurre, cierra la terminal y abre otra: la variable no se ha guardado.</p>' },

      { type: 'h2', id: 'alias', text: 'Alias: atajos propios' },
      { type: 'cmd', label: 'Alias útiles para ~/.bashrc', lines: [
        '# Definir uno en la sesión actual',
        '$ alias ll="ls -lah"',
        '',
        '# Ver los que tienes',
        '$ alias',
        '',
        '# Ejecutar el comando REAL, ignorando el alias (barra delante)',
        '$ \\ls',
        '',
        '# --- Para pegar al final de ~/.bashrc ---',
        '# Listados',
        '# alias ll="ls -lahF"',
        '# alias lt="ls -lahtr"        # por fecha, lo nuevo al final',
        '# alias ..="cd .."',
        '# alias ...="cd ../.."',
        '',
        '# Seguridad: preguntar antes de destruir',
        '# alias rm="rm -I --preserve-root"',
        '# alias cp="cp -i"',
        '# alias mv="mv -i"',
        '',
        '# Utilidades',
        '# alias df="df -hT -x tmpfs -x devtmpfs"',
        '# alias ports="ss -tulpn"',
        '# alias grande="du -h -d 1 | sort -hr | head -15"',
        '# alias actualizar="sudo apt update && sudo apt upgrade"'
      ]},
      { type: 'callout', variant: 'info', title: 'Por qué tu alias no funciona en un script',
        html: '<p>Los alias no se heredan por los shells no interactivos. Dentro de un script, usa una <b>función</b> en lugar de un alias, o define el alias en el propio script y activa <code>shopt -s expand_aliases</code>.</p>' },

      { type: 'h2', id: 'historial', text: 'Historial y atajos de teclado' },
      { type: 'keys', items: [
        { k: ['Tab'], d: 'Autocompletar comando o ruta' },
        { k: ['Tab', 'Tab'], d: 'Ver todas las opciones posibles' },
        { k: ['Ctrl', 'R'], d: 'Buscar en el historial (repite para ir atrás)' },
        { k: ['Ctrl', 'C'], d: 'Interrumpir el comando en marcha' },
        { k: ['Ctrl', 'D'], d: 'Fin de entrada / cerrar la sesión' },
        { k: ['Ctrl', 'L'], d: 'Limpiar la pantalla (como clear)' },
        { k: ['Ctrl', 'A'], d: 'Ir al inicio de la línea' },
        { k: ['Ctrl', 'E'], d: 'Ir al final de la línea' },
        { k: ['Ctrl', 'U'], d: 'Borrar desde el cursor hasta el inicio' },
        { k: ['Ctrl', 'K'], d: 'Borrar desde el cursor hasta el final' },
        { k: ['Ctrl', 'W'], d: 'Borrar la palabra anterior' },
        { k: ['Alt', 'B'], d: 'Retroceder una palabra' },
        { k: ['Alt', 'F'], d: 'Avanzar una palabra' },
        { k: ['Ctrl', 'Z'], d: 'Suspender el proceso (recupéralo con fg)' }
      ]},
      { type: 'cmd', label: 'Reutilizar comandos del historial', lines: [
        '$ history | tail -20            # Los 20 últimos',
        '$ history | grep apt            # Buscar en el historial',
        '$ !!                            # Repetir el último comando',
        '$ sudo !!                       # Repetirlo con sudo (¡muy útil!)',
        '$ !342                          # Ejecutar el número 342',
        '$ !apt                          # El último que empezaba por "apt"',
        '$ !$                            # El último ARGUMENTO del comando anterior',
        '',
        '# Ejemplo de !$ :',
        '$ mkdir -p /tmp/pruebas/datos',
        '$ cd !$                         # cd /tmp/pruebas/datos',
        '',
        '# Corregir un error de escritura del comando anterior',
        '$ ^apt^apt-get^'
      ]}
    ]
  });

  C.registrar({
    id: 'term-pipes',
    group: 'terminal',
    title: 'Redirecciones y tuberías',
    level: 'intermedio',
    tags: ['pipe', 'stdout', 'stderr', 'tee', 'xargs', 'redireccion'],
    lead: 'La filosofía de Unix: programas pequeños que hacen una cosa bien y se <b>encadenan</b>. Las tuberías son lo que convierte una docena de comandos simples en una herramienta a medida.',
    blocks: [
      { type: 'h2', id: 'flujos', text: 'Los tres flujos de todo proceso' },
      { type: 'ascii', text:
'                  ┌──────────────────┐\n' +
'  stdin (0) ─────►│                  │────► stdout (1)  resultado normal\n' +
'  entrada         │     PROGRAMA     │\n' +
'                  │                  │────► stderr (2)  mensajes de error\n' +
'                  └──────────────────┘\n' +
'\n' +
'  Clave: stdout y stderr son SEPARADOS. Por eso los errores siguen\n' +
'  apareciendo en pantalla aunque redirijas la salida a un archivo.' },
      { type: 'table', head: ['Operador', 'Qué hace'], rows: [
        ['<code>&gt;</code>', 'Redirige stdout a un archivo, <b>sobrescribiéndolo</b>'],
        ['<code>&gt;&gt;</code>', 'Redirige stdout <b>añadiendo</b> al final'],
        ['<code>2&gt;</code>', 'Redirige solo stderr'],
        ['<code>2&gt;&amp;1</code>', 'Manda stderr al mismo sitio que stdout'],
        ['<code>&amp;&gt;</code>', 'Redirige ambos (atajo de Bash)'],
        ['<code>&lt;</code>', 'Lee stdin desde un archivo'],
        ['<code>|</code>', 'Conecta el stdout de un comando al stdin del siguiente'],
        ['<code>|&amp;</code>', 'Conecta stdout <b>y</b> stderr al siguiente'],
        ['<code>&lt;&lt;EOF</code>', '<i>Heredoc</i>: pasa varias líneas como entrada'],
        ['<code>&lt;&lt;&lt;"texto"</code>', '<i>Herestring</i>: pasa una cadena como entrada']
      ]},
      { type: 'cmd', label: 'Redirecciones en la práctica', lines: [
        '$ ls -l > listado.txt           # Guardar (sobrescribe)',
        '$ echo "linea nueva" >> log.txt # Añadir al final',
        '',
        '# Descartar los errores de "permiso denegado"',
        '$ find / -name "*.conf" 2>/dev/null',
        '',
        '# Guardar SOLO los errores para revisarlos',
        '$ ./script.sh 2> errores.log',
        '',
        '# Guardar todo junto (las dos formas equivalentes)',
        '$ ./script.sh > todo.log 2>&1',
        '$ ./script.sh &> todo.log',
        '',
        '# Silencio absoluto',
        '$ comando > /dev/null 2>&1',
        '',
        '# Heredoc: escribir un archivo de varias líneas',
        '$ cat > config.ini << EOF',
        '| [general]',
        '| debug = false',
        '| EOF'
      ]},
      { type: 'callout', variant: 'warn', title: 'El orden de 2>&1 no es intercambiable',
        html: '<p><code>comando &gt; log 2&gt;&amp;1</code> funciona: primero stdout va al archivo, después stderr se une a donde apunta stdout.</p><p><code>comando 2&gt;&amp;1 &gt; log</code> <b>no</b> hace lo mismo: stderr se copia al destino que stdout tenía <em>en ese momento</em> (la pantalla), y solo después stdout se redirige al archivo. Resultado: los errores siguen saliendo por pantalla.</p>' },

      { type: 'h2', id: 'tuberias', text: 'Tuberías: encadenar herramientas' },
      { type: 'cmd', label: 'De lo simple a lo útil', lines: [
        '# Contar archivos de un directorio',
        '$ ls -1 | wc -l',
        '',
        '# Los 10 comandos que más usas',
        '$ history | awk "{print \\$2}" | sort | uniq -c | sort -rn | head -10',
        '',
        '# Los 5 procesos que más memoria consumen',
        '$ ps aux --sort=-%mem | head -6',
        '',
        '# Las IP que más aparecen en un registro de acceso',
        '$ awk "{print \\$1}" /var/log/nginx/access.log | sort | uniq -c | sort -rn | head',
        '',
        '# Los usuarios del sistema con shell válida',
        '$ grep -v "/nologin\\|/false" /etc/passwd | cut -d: -f1',
        '',
        '# Espacio por subcarpeta, de mayor a menor',
        '$ du -h -d 1 ~ | sort -hr | head -15'
      ]},
      { type: 'command', name: 'tee', tagline: 'ver y guardar a la vez', level: 'intermedio',
        synopsis: 'tee [-a] ARCHIVO...',
        desc: 'Duplica el flujo: lo escribe en el archivo <b>y</b> lo deja pasar a stdout. Resuelve el problema de «quiero ver la salida y guardarla».',
        options: [
          ['-a', 'Añade al final en lugar de sobrescribir'],
          ['-i', 'Ignora las señales de interrupción']
        ],
        examples: [
          { label: 'Los dos usos que importan', lines: [
            '# Ver el progreso Y guardarlo en un registro',
            '$ sudo apt upgrade 2>&1 | tee actualizacion.log',
            '',
            '# Escribir en un archivo protegido: el TRUCO de sudo',
            '# Esto FALLA: la redirección la hace tu shell, que no es root',
            '$ sudo echo "texto" > /etc/archivo-protegido',
            '| bash: /etc/archivo-protegido: Permiso denegado',
            '',
            '# Esto FUNCIONA: es tee quien corre como root',
            '$ echo "texto" | sudo tee /etc/archivo-protegido',
            '',
            '# Añadir una línea a un archivo del sistema',
            '$ echo "127.0.0.1 miapp.local" | sudo tee -a /etc/hosts',
            '',
            '# Guardar en varios sitios a la vez y seguir la tubería',
            '$ dmesg | tee copia1.log copia2.log | grep -i error'
          ]}
        ],
        notes: [{ variant: 'tip', html: '<p>El truco de <code>| sudo tee</code> es de los más valiosos de esta sección: <code>sudo</code> eleva el <em>comando</em>, no la redirección, porque la redirección la ejecuta tu shell antes de que <code>sudo</code> entre en juego.</p>' }],
        seealso: ['cat', 'sudo', 'xargs']
      },
      { type: 'command', name: 'xargs', tagline: 'convertir una lista en argumentos', level: 'avanzado',
        synopsis: 'xargs [-0] [-n N] [-I {}] [-P N] COMANDO',
        desc: 'Algunos comandos no leen de stdin, solo aceptan argumentos. <code>xargs</code> hace de puente: toma líneas de la tubería y las convierte en argumentos.',
        options: [
          ['-0', 'Separa por byte nulo. <b>Úsalo con <code>find -print0</code></b> para soportar nombres con espacios'],
          ['-n N', 'Como máximo N argumentos por invocación'],
          ['-I {}', 'Define un marcador de posición: el argumento va donde pongas <code>{}</code>'],
          ['-P N', 'Ejecuta N procesos <b>en paralelo</b>'],
          ['-p', 'Pregunta antes de cada ejecución'],
          ['-t', 'Muestra el comando antes de ejecutarlo'],
          ['-r', 'No ejecuta nada si la entrada está vacía (evita sorpresas)']
        ],
        examples: [
          { label: 'Patrones habituales', lines: [
            '# rm no lee de stdin: xargs se lo pasa como argumentos',
            '$ find . -name "*.tmp" -print0 | xargs -0 rm -v',
            '',
            '# Con -I para poner el argumento en medio del comando',
            '$ ls *.jpg | xargs -I {} cp {} ~/respaldo/{}',
            '',
            '# Comprimir en PARALELO con 4 procesos: aprovecha los núcleos',
            '$ find . -name "*.log" -print0 | xargs -0 -P 4 -n 1 gzip -v',
            '',
            '# Instalar una lista de paquetes desde un archivo',
            '$ cat paquetes.txt | xargs sudo apt install -y',
            '',
            '# Ver qué se ejecutaría, sin ejecutarlo (-t muestra, -p pregunta)',
            '$ find . -name "*.bak" | xargs -t -p rm'
          ]}
        ],
        notes: [{ variant: 'danger', html: '<p><b>Nombres con espacios rompen <code>xargs</code>.</b> «mi archivo.txt» se convierte en dos argumentos y puedes borrar algo equivocado. La pareja <code>find -print0 | xargs -0</code> es la forma segura, y debería ser tu opción por defecto.</p><p>Añade <code>-r</code> para que no se ejecute nada cuando la búsqueda no encuentra resultados.</p>' }],
        seealso: ['find', 'parallel', 'tee']
      },
      { type: 'callout', variant: 'tip', title: 'Depurar una tubería que no funciona',
        html: '<p>Constrúyela <b>por partes</b>: ejecuta el primer comando solo y comprueba la salida; añade el segundo y vuelve a comprobar. El error casi siempre está en la primera etapa que no devuelve lo que creías.</p><p>Intercala <code>| tee /dev/stderr |</code> en medio de una tubería para inspeccionar lo que pasa por ese punto sin interrumpir el flujo.</p>' }
    ]
  });

})(window.Contenido);
