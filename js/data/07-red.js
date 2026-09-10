/* 07-red.js — diagnóstico de red, transferencia y SSH */
(function (C) {
  'use strict';

  C.registrar({
    id: 'red-diagnostico',
    group: 'red',
    title: 'Diagnosticar la red por capas',
    level: 'intermedio',
    tags: ['ip', 'ping', 'ss', 'dig', 'traceroute', 'dns'],
    lead: 'Cuando «no hay internet», el error puede estar en cinco sitios distintos. Recorrer las capas <b>de abajo arriba</b> localiza el problema en menos de un minuto, en lugar de probar cosas al azar.',
    blocks: [
      { type: 'h2', id: 'metodo', text: 'El método: cinco comprobaciones en orden' },
      { type: 'steps', items: [
        { t: '¿Tengo una dirección IP?',
          html: '<p>Si no aparece una <code>inet</code> distinta de <code>127.0.0.1</code>, el problema es la interfaz o el DHCP: ni el cable ni el DNS importan todavía.</p>',
          cmd: { label: 'Capa 1-2: interfaz', lines: [
            '$ ip -brief address',
            '| lo     UNKNOWN  127.0.0.1/8',
            '| wlp3s0 UP       192.168.1.42/24',
            '',
            '# ¿Está el cable conectado / la wifi asociada?',
            '$ ip -brief link'
          ]}
        },
        { t: '¿Tengo una puerta de enlace?',
          html: '<p>Sin ruta por defecto, los paquetes no salen de tu red local.</p>',
          cmd: { label: 'Capa 3: enrutado', lines: [
            '$ ip route',
            '| default via 192.168.1.1 dev wlp3s0 proto dhcp metric 600',
            '',
            '# ¿Responde el router?',
            '$ ping -c 3 192.168.1.1'
          ]}
        },
        { t: '¿Llego a internet por IP?',
          html: '<p>Si esto funciona pero el paso 4 falla, el problema es <b>exclusivamente</b> el DNS.</p>',
          cmd: { label: 'Capa 3: conectividad', lines: [
            '$ ping -c 3 1.1.1.1'
          ]}
        },
        { t: '¿Resuelve el DNS?',
          html: '<p>Este es el fallo más frecuente y el que más se confunde con «no hay internet».</p>',
          cmd: { label: 'Capa 7: resolución de nombres', lines: [
            '$ ping -c 3 google.com',
            '$ dig +short google.com',
            '',
            '# ¿Qué servidores DNS estoy usando?',
            '$ resolvectl status | grep "DNS Server"'
          ]}
        },
        { t: '¿Responde el servicio concreto?',
          cmd: { label: 'Capa 7: aplicación', lines: [
            '$ curl -I https://ejemplo.com',
            '$ nc -zv ejemplo.com 443'
          ]}
        }
      ]},
      { type: 'callout', variant: 'tip', title: 'El diagnóstico en una línea',
        html: '<p>Si el paso 3 (<code>ping 1.1.1.1</code>) funciona y el paso 4 (<code>ping google.com</code>) no, <b>es el DNS</b>. Ese único dato descarta el cable, el router, el proveedor y el cortafuegos.</p>' },

      { type: 'h2', id: 'ip', text: 'ip: la herramienta actual' },
      { type: 'command', name: 'ip', tagline: 'interfaces, direcciones y rutas', level: 'intermedio',
        synopsis: 'ip [-brief] {address|link|route|neigh} [ACCIÓN]',
        desc: 'Sustituye a <code>ifconfig</code>, <code>route</code> y <code>arp</code>, que están obsoletos y a menudo ni instalados. Todos los subcomandos aceptan abreviaturas: <code>ip a</code>, <code>ip r</code>, <code>ip l</code>.',
        options: [
          ['address (a)', 'Direcciones IP asignadas'],
          ['link (l)', 'Interfaces físicas y su estado'],
          ['route (r)', 'Tabla de enrutado'],
          ['neigh (n)', 'Tabla ARP: vecinos de la red local'],
          ['-brief (-br)', 'Salida compacta en columnas. <b>Mucho más legible</b>'],
          ['-c', 'Colorea la salida'],
          ['-4 / -6', 'Solo IPv4 o solo IPv6']
        ],
        examples: [
          { label: 'Consultar', lines: [
            '# La vista más útil: compacta y en columnas',
            '$ ip -brief -color address',
            '',
            '# Solo tu IP de la interfaz principal',
            '$ ip -4 -brief a show wlp3s0',
            '',
            '# La dirección MAC',
            '$ ip link show wlp3s0 | grep ether',
            '',
            '# Tabla de rutas',
            '$ ip route',
            '',
            '# Qué IP de origen se usaría para llegar a un destino',
            '$ ip route get 8.8.8.8',
            '',
            '# Vecinos de la red local (la antigua tabla ARP)',
            '$ ip neigh'
          ]},
          { label: 'Configurar (temporal, se pierde al reiniciar)', lines: [
            '$ sudo ip link set wlp3s0 down',
            '$ sudo ip link set wlp3s0 up',
            '',
            '# Asignar una IP fija manualmente',
            '$ sudo ip address add 192.168.1.50/24 dev eth0',
            '$ sudo ip route add default via 192.168.1.1',
            '',
            '# Quitarla',
            '$ sudo ip address del 192.168.1.50/24 dev eth0'
          ]}
        ],
        notes: [{ variant: 'warn', html: '<p>Todo lo que configuras con <code>ip</code> es <b>temporal</b>. Para que persista usa <code>nmcli</code> (escritorio con NetworkManager) o Netplan en <code>/etc/netplan/*.yaml</code> (servidores Ubuntu).</p>' }],
        seealso: ['nmcli', 'ss', 'ping', 'netplan']
      },
      { type: 'cmd', label: 'nmcli: configuración persistente en escritorio', lines: [
        '# Estado general',
        '$ nmcli general status',
        '$ nmcli device status',
        '',
        '# Redes wifi disponibles',
        '$ nmcli device wifi list',
        '',
        '# Conectarse a una wifi (queda guardada)',
        '$ nmcli device wifi connect "MiRed" password "micontraseña"',
        '',
        '# Ver las conexiones guardadas',
        '$ nmcli connection show',
        '',
        '# Fijar una IP estática de forma permanente',
        '$ nmcli connection modify "Cableada 1" \\',
        '    ipv4.method manual \\',
        '    ipv4.addresses 192.168.1.50/24 \\',
        '    ipv4.gateway 192.168.1.1 \\',
        '    ipv4.dns "1.1.1.1,8.8.8.8"',
        '$ nmcli connection up "Cableada 1"'
      ]},

      { type: 'h2', id: 'puertos', text: 'ss: puertos y conexiones' },
      { type: 'command', name: 'ss', tagline: 'sockets abiertos y quién los usa', level: 'intermedio',
        synopsis: 'ss [-t] [-u] [-l] [-p] [-n] [FILTRO]',
        desc: 'Sustituye a <code>netstat</code>. Responde a la pregunta más frecuente al desarrollar: <b>¿qué está ocupando este puerto?</b>',
        options: [
          ['-t', 'Sockets TCP'],
          ['-u', 'Sockets UDP'],
          ['-l', 'Solo los que están <b>escuchando</b>'],
          ['-p', 'Muestra el proceso dueño. <b>Requiere sudo</b> para ver los de otros usuarios'],
          ['-n', 'Números en lugar de nombres de servicio (más rápido)'],
          ['-a', 'Todos: escuchando y establecidos'],
          ['-s', 'Resumen estadístico'],
          ['-tulpn', 'La combinación que se usa siempre']
        ],
        examples: [
          { label: 'Qué está escuchando en mi máquina', lines: [
            '# EL comando: todos los puertos abiertos con su proceso',
            '$ sudo ss -tulpn',
            '| Netid State  Local Address:Port  Process',
            '| tcp   LISTEN 0.0.0.0:22          users:(("sshd",pid=1243,fd=3))',
            '| tcp   LISTEN 127.0.0.1:11434     users:(("ollama",pid=2891,fd=6))',
            '',
            '# ¿Quién ocupa el 8080? (el error "address already in use")',
            '$ sudo ss -tulpn | grep :8080',
            '',
            '# Solo TCP escuchando',
            '$ sudo ss -tlpn',
            '',
            '# Conexiones establecidas ahora mismo',
            '$ ss -tn state established',
            '',
            '# Conexiones a un puerto concreto',
            '$ ss -tn "dport = :443"',
            '',
            '# Resumen por protocolo',
            '$ ss -s'
          ]}
        ],
        notes: [{ variant: 'info', html: '<p><b>Lee la dirección de escucha:</b> <code>127.0.0.1:11434</code> solo acepta conexiones de tu propia máquina. <code>0.0.0.0:22</code> acepta de <b>cualquier</b> equipo de la red. Si un servicio de desarrollo escucha en <code>0.0.0.0</code>, está expuesto a tu red local.</p>' }],
        seealso: ['lsof', 'netstat', 'ip', 'ufw']
      },

      { type: 'h2', id: 'dns', text: 'DNS y conectividad' },
      { type: 'cmd', label: 'ping, dig y traceroute', lines: [
        '# ping: -c limita el número de intentos (sin él, no para)',
        '$ ping -c 4 google.com',
        '',
        '# Comprobar el tamaño máximo de paquete (MTU) sin fragmentar',
        '$ ping -c 3 -M do -s 1472 google.com',
        '',
        '# dig: la consulta DNS completa',
        '$ dig google.com',
        '$ dig +short google.com          # solo la IP',
        '$ dig MX gmail.com +short        # servidores de correo',
        '$ dig TXT ejemplo.com +short     # registros TXT (SPF, verificaciones)',
        '',
        '# Preguntar a un DNS concreto: descarta que el problema sea el tuyo',
        '$ dig @1.1.1.1 ejemplo.com +short',
        '',
        '# Resolución inversa: de IP a nombre',
        '$ dig -x 8.8.8.8 +short',
        '',
        '# ¿Por dónde pasan mis paquetes y dónde se pierden?',
        '$ traceroute google.com',
        '$ mtr google.com                 # traceroute continuo, mejor herramienta',
        '',
        '# Qué DNS usa el sistema (systemd-resolved)',
        '$ resolvectl status',
        '$ resolvectl query ejemplo.com'
      ]},
      { type: 'callout', variant: 'tip', title: 'Cambiar el DNS cuando la resolución falla',
        html: '<p>Si <code>dig @1.1.1.1 ejemplo.com</code> funciona pero <code>dig ejemplo.com</code> no, tu DNS configurado es el problema. En escritorio se cambia con <code>nmcli connection modify … ipv4.dns "1.1.1.1"</code>; editar <code>/etc/resolv.conf</code> a mano <b>no sirve</b> en Ubuntu moderno, porque lo regenera <code>systemd-resolved</code>.</p>' },

      { type: 'h2', id: 'cortafuegos', text: 'Cortafuegos con ufw' },
      { type: 'cmd', label: 'ufw: lo básico bien hecho', lines: [
        '$ sudo ufw status verbose',
        '',
        '# ORDEN CORRECTO: primero permitir SSH, después activar.',
        '# Al revés te quedas fuera de un servidor remoto.',
        '$ sudo ufw allow 22/tcp',
        '$ sudo ufw enable',
        '',
        '# Política por defecto recomendada',
        '$ sudo ufw default deny incoming',
        '$ sudo ufw default allow outgoing',
        '',
        '# Abrir servicios por nombre',
        '$ sudo ufw allow http',
        '$ sudo ufw allow https',
        '',
        '# Solo desde tu red local',
        '$ sudo ufw allow from 192.168.1.0/24 to any port 5432',
        '',
        '# Limitar intentos de conexión (protege SSH de fuerza bruta)',
        '$ sudo ufw limit 22/tcp',
        '',
        '# Ver las reglas numeradas y borrar una',
        '$ sudo ufw status numbered',
        '$ sudo ufw delete 3'
      ]},
      { type: 'callout', variant: 'danger', title: 'Antes de activar ufw en un servidor remoto',
        html: '<p>Ejecuta <code>sudo ufw allow 22/tcp</code> <b>antes</b> de <code>sudo ufw enable</code>. Si activas el cortafuegos con la política <i>deny incoming</i> y sin permitir SSH, pierdes el acceso al servidor en ese mismo instante y necesitarás la consola física o del proveedor para recuperarlo.</p>' }
    ]
  });

  C.registrar({
    id: 'red-transfer',
    group: 'red',
    title: 'Transferir archivos y SSH',
    level: 'intermedio',
    tags: ['ssh', 'scp', 'rsync', 'curl', 'wget', 'claves'],
    lead: 'SSH es la puerta de entrada a cualquier máquina remota, y las <b>claves</b> son la forma correcta de usarlo: más seguras que una contraseña y sin teclearla cada vez.',
    blocks: [
      { type: 'h2', id: 'claves', text: 'Configurar SSH con claves (una vez, para siempre)' },
      { type: 'steps', items: [
        { t: 'Generar el par de claves',
          html: '<p><code>ed25519</code> es el algoritmo recomendado: más corto y más seguro que RSA. La frase de paso protege la clave privada si te roban el portátil.</p>',
          cmd: { label: 'En tu máquina local', lines: [
            '$ ssh-keygen -t ed25519 -C "john@portatil"',
            '| Enter file in which to save the key (~/.ssh/id_ed25519): [Enter]',
            '| Enter passphrase: [escribe una frase de paso]',
            '',
            '# Se crean DOS archivos:',
            '#   ~/.ssh/id_ed25519       clave PRIVADA — nunca sale de tu equipo',
            '#   ~/.ssh/id_ed25519.pub   clave PÚBLICA — esta se copia al servidor'
          ]}
        },
        { t: 'Copiar la clave pública al servidor',
          cmd: { label: 'Instalar la clave', lines: [
            '# La forma automática (pide la contraseña una última vez)',
            '$ ssh-copy-id usuario@servidor',
            '',
            '# Si ssh-copy-id no está disponible:',
            '$ cat ~/.ssh/id_ed25519.pub | ssh usuario@servidor \\',
            '    "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys"'
          ]}
        },
        { t: 'Comprobar y guardar un atajo',
          cmd: { label: '~/.ssh/config', lines: [
            '$ ssh usuario@servidor        # ya no debe pedir contraseña',
            '',
            '# Definir un alias en ~/.ssh/config:',
            '|   Host miservidor',
            '|       HostName 203.0.113.10',
            '|       User john',
            '|       Port 22',
            '|       IdentityFile ~/.ssh/id_ed25519',
            '|       ServerAliveInterval 60',
            '',
            '# Ahora basta con:',
            '$ ssh miservidor',
            '$ scp archivo.txt miservidor:~/     # el alias funciona también aquí'
          ]}
        }
      ]},
      { type: 'callout', variant: 'danger', title: 'Los permisos de ~/.ssh no son negociables',
        html: '<p>SSH <b>rechaza</b> las claves si los permisos son demasiado abiertos, y el mensaje de error no siempre lo deja claro. Los valores correctos:</p><p><code>chmod 700 ~/.ssh</code> · <code>chmod 600 ~/.ssh/id_ed25519</code> · <code>chmod 644 ~/.ssh/id_ed25519.pub</code> · <code>chmod 600 ~/.ssh/authorized_keys</code></p><p>Y nunca compartas ni subas a un repositorio el archivo <b>sin</b> extensión <code>.pub</code>: esa es la clave privada.</p>' },
      { type: 'cmd', label: 'Usar SSH', lines: [
        '$ ssh usuario@servidor',
        '$ ssh -p 2222 usuario@servidor        # puerto distinto',
        '',
        '# Ejecutar un comando y salir',
        '$ ssh miservidor "df -h; uptime"',
        '',
        '# Túnel local: acceder a un servicio remoto como si fuera local.',
        '# Aquí, la base de datos del servidor en tu localhost:5433',
        '$ ssh -L 5433:localhost:5432 miservidor',
        '',
        '# Proxy SOCKS para navegar a través del servidor',
        '$ ssh -D 8080 -N miservidor',
        '',
        '# Depurar por qué no conecta',
        '$ ssh -vvv miservidor'
      ]},

      { type: 'h2', id: 'copiar-remoto', text: 'Copiar archivos entre máquinas' },
      { type: 'table', head: ['Herramienta', 'Cuándo usarla'], monoFirst: false, rows: [
        ['<code>scp</code>', 'Copia puntual de pocos archivos. Simple, sin estado'],
        ['<code>rsync</code>', '<b>Lo habitual:</b> carpetas grandes, sincronización, reanudar transferencias, ver progreso'],
        ['<code>sftp</code>', 'Sesión interactiva para explorar y traer archivos sueltos'],
        ['<code>curl</code>/<code>wget</code>', 'Descargar de una URL, no entre máquinas propias']
      ]},
      { type: 'cmd', label: 'scp y rsync por SSH', lines: [
        '# scp: subir y bajar',
        '$ scp archivo.txt miservidor:~/documentos/',
        '$ scp miservidor:~/informe.pdf ./',
        '$ scp -r carpeta/ miservidor:~/       # -r para directorios',
        '',
        '# rsync: mejor para todo lo que no sea un archivo suelto',
        '$ rsync -ahz --progress ~/web/ miservidor:/var/www/sitio/',
        '',
        '# Traer del servidor, simulando primero',
        '$ rsync -ahzn --progress miservidor:/var/backups/ ~/respaldos/',
        '',
        '# Reanudar una transferencia grande interrumpida',
        '$ rsync -ahz --partial --progress iso-grande.iso miservidor:~/',
        '',
        '# Por un puerto SSH distinto',
        '$ rsync -ahz -e "ssh -p 2222" origen/ miservidor:destino/'
      ]},
      { type: 'command', name: 'curl', tagline: 'transferir datos con URL', level: 'intermedio',
        synopsis: 'curl [OPCIONES] URL',
        desc: 'La navaja suiza de HTTP. Por defecto imprime la respuesta en pantalla; para descargar archivos hay que pedírselo explícitamente.',
        options: [
          ['-O', 'Guarda con el nombre del archivo remoto'],
          ['-o NOMBRE', 'Guarda con el nombre que indiques'],
          ['-L', '<b>Sigue las redirecciones.</b> Sin esto, muchas descargas fallan'],
          ['-I', 'Solo las cabeceras de respuesta (petición HEAD)'],
          ['-s', 'Silencioso, sin barra de progreso'],
          ['-f', 'Falla con código de error en respuestas HTTP 4xx/5xx'],
          ['-X MÉTODO', 'POST, PUT, DELETE…'],
          ['-d DATOS', 'Cuerpo de la petición (implica POST)'],
          ['-H "Cabecera: valor"', 'Añade una cabecera; se puede repetir'],
          ['-u usuario:clave', 'Autenticación básica'],
          ['-C -', 'Reanuda una descarga interrumpida'],
          ['--max-time N', 'Tiempo máximo total en segundos']
        ],
        examples: [
          { label: 'Descargar y consultar APIs', lines: [
            '# Descargar siguiendo redirecciones (lo que casi siempre necesitas)',
            '$ curl -LO https://ejemplo.com/archivo.tar.gz',
            '',
            '# Ver solo las cabeceras: ¿existe? ¿qué tamaño? ¿redirige?',
            '$ curl -I https://ejemplo.com',
            '',
            '# Consultar una API y formatear el JSON',
            '$ curl -s https://api.github.com/users/torvalds | jq .',
            '',
            '# POST con JSON',
            '$ curl -X POST https://api.ejemplo.com/items \\',
            '    -H "Content-Type: application/json" \\',
            '    -d \'{"nombre":"prueba","valor":42}\'',
            '',
            '# Medir el tiempo de respuesta de un sitio',
            '$ curl -o /dev/null -s -w "conexión: %{time_connect}s  total: %{time_total}s\\n" \\',
            '    https://ejemplo.com',
            '',
            '# Reanudar una descarga cortada',
            '$ curl -C - -LO https://ejemplo.com/iso-grande.iso'
          ]}
        ],
        notes: [
          { variant: 'danger', html: '<p><b>Nunca ejecutes <code>curl … | sudo bash</code> sin leer el script primero.</b> Estás dando permisos de root a código de un tercero que no has visto. Lo correcto es descargar, inspeccionar y luego ejecutar:</p><p><code>curl -fsSL https://sitio/install.sh -o inst.sh</code><br><code>less inst.sh</code> ← léelo<br><code>bash inst.sh</code></p>' },
          { variant: 'tip', html: '<p><code>wget</code> es más cómodo para descargas simples y recursivas: <code>wget -c URL</code> reanuda por defecto y <code>wget -r -np -k URL</code> descarga un sitio completo para verlo sin conexión.</p>' }
        ],
        seealso: ['wget', 'jq', 'scp', 'rsync']
      }
    ]
  });

})(window.Contenido);
