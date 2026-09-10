/* 09-hardware.js — inventario de hardware, discos y monitorización */
(function (C) {
  'use strict';

  C.registrar({
    id: 'hw-inventario',
    group: 'sistema',
    title: 'Inventario de hardware',
    level: 'intermedio',
    tags: ['lscpu', 'lsblk', 'lspci', 'lsusb', 'free', 'sensors', 'dmidecode'],
    lead: 'Antes de comprar RAM, instalar un driver o diagnosticar un cuelgue, necesitas saber <b>exactamente</b> qué hay dentro de la máquina. Estos comandos lo dicen sin abrir la caja.',
    blocks: [
      { type: 'h2', id: 'resumen', text: 'Reconocimiento en cuatro comandos' },
      { type: 'cmd', label: 'Radiografía rápida del equipo', lines: [
        '# CPU: modelo, núcleos, hilos, caché, virtualización',
        '$ lscpu | grep -E "^(Arquitectura|Model name|CPU\\(s\\)|Thread|Core|Socket|Virtual)"',
        '',
        '# Memoria: total, usada, disponible y swap',
        '$ free -h',
        '| Total: 15Gi   Usado: 4,2Gi   Disponible: 10Gi',
        '',
        '# Discos y particiones en forma de árbol',
        '$ lsblk -f',
        '',
        '# Resumen general del sistema y la distribución',
        '$ hostnamectl'
      ]},
      { type: 'command', name: 'lsblk', tagline: 'discos, particiones y puntos de montaje', level: 'intermedio',
        synopsis: 'lsblk [-f] [-o COLUMNAS] [-p]',
        desc: 'Lista los dispositivos de bloque en árbol. Es el comando correcto para «¿cómo se llama mi USB?» antes de montar o formatear.',
        options: [
          ['-f', 'Añade sistema de archivos, etiqueta, UUID y punto de montaje. <b>El más útil</b>'],
          ['-o COLUMNAS', 'Elige columnas: <code>-o NAME,SIZE,FSTYPE,MOUNTPOINT,MODEL</code>'],
          ['-p', 'Rutas completas (<code>/dev/sda1</code> en lugar de <code>sda1</code>)'],
          ['-a', 'Incluye los dispositivos vacíos'],
          ['-d', 'Solo los discos, sin sus particiones'],
          ['-t', 'Información de topología (sectores, RAID)']
        ],
        examples: [
          { label: 'Identificar un disco antes de tocarlo', lines: [
            '# La vista más informativa',
            '$ lsblk -f',
            '| NAME        FSTYPE LABEL  UUID          MOUNTPOINTS',
            '| nvme0n1',
            '| ├─nvme0n1p1 vfat   EFI    1234-ABCD     /boot/efi',
            '| └─nvme0n1p2 ext4   ubuntu 9f8e...       /',
            '| sdb',
            '| └─sdb1      exfat  USB16  5678-EF01',
            '',
            '# Con el modelo del disco: distinguir el USB del disco interno',
            '$ lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT,MODEL',
            '',
            '# Solo discos, sin particiones',
            '$ lsblk -d -o NAME,SIZE,ROTA,MODEL',
            '#   ROTA=1 → disco mecánico   ROTA=0 → SSD'
          ]}
        ],
        notes: [{ variant: 'danger', html: '<p><b>Comprueba dos veces el nombre del dispositivo</b> antes de cualquier <code>mkfs</code> o <code>dd</code>. Confundir <code>/dev/sdb</code> (tu USB) con <code>/dev/sda</code> (tu disco del sistema) destruye la instalación sin aviso ni confirmación. Usa <code>lsblk -f</code> y verifica por <b>tamaño y etiqueta</b>, no solo por la letra.</p>' }],
        seealso: ['df', 'mount', 'blkid', 'fdisk']
      },
      { type: 'command', name: 'free', tagline: 'uso de memoria RAM y swap', level: 'basico',
        synopsis: 'free [-h] [-s N] [-t]',
        desc: 'Muestra la memoria. La columna que importa es <b>available</b>, no <b>free</b>: Linux usa la RAM libre como caché de disco a propósito.',
        options: [
          ['-h', 'Legible (Gi, Mi)'],
          ['-m / -g', 'En megabytes o gigabytes'],
          ['-s N', 'Se repite cada N segundos'],
          ['-t', 'Añade una fila con los totales'],
          ['-w', 'Separa buffers y cache en columnas distintas']
        ],
        examples: [
          { label: 'Interpretar la salida correctamente', lines: [
            '$ free -h',
            '|                total   usado   libre  compart  buff/caché  disponible',
            '| Mem:            15Gi   4,2Gi   1,1Gi    412Mi       9,7Gi       10Gi',
            '| Swap:          2,0Gi      0B   2,0Gi',
            '',
            '# NO te alarmes por "libre: 1,1Gi". Lo que importa es:',
            '#   disponible: 10Gi  ← memoria que las aplicaciones pueden pedir YA',
            '#   buff/caché: 9,7Gi ← caché de disco, se libera al instante si hace falta',
            '',
            '# Vigilar en tiempo real',
            '$ free -h -s 2',
            '',
            '# ¿Se está usando la swap? Señal de que falta RAM',
            '$ free -h | awk "/Swap/ {print \\$3 \\\" de \\\" \\$2 \\\" en uso\\\"}"',
            '',
            '# Qué procesos consumen más memoria',
            '$ ps aux --sort=-%mem | head -6'
          ]}
        ],
        notes: [{ variant: 'info', html: '<p><b>«Linux se come mi RAM» es un mito.</b> La memoria en <code>buff/caché</code> acelera el acceso a disco y se cede inmediatamente a cualquier aplicación que la pida. Una RAM «libre» al 90% sería memoria desperdiciada. Solo preocúpate si <code>disponible</code> baja mucho o si la <b>swap</b> empieza a usarse de forma sostenida.</p>' }],
        seealso: ['ps', 'top', 'vmstat', 'swapon']
      },
      { type: 'cmd', label: 'Detalle por componente', lines: [
        '# CPU completo',
        '$ lscpu',
        '',
        '# Tarjetas PCI: gráfica, red, controladoras',
        '$ lspci',
        '$ lspci -nnk | grep -A3 -i vga        # gráfica + driver en uso',
        '$ lspci -nnk | grep -A3 -i network    # tarjeta de red + driver',
        '',
        '# Dispositivos USB conectados',
        '$ lsusb',
        '$ lsusb -t                            # en árbol, con velocidades',
        '',
        '# Módulos del kernel cargados (drivers)',
        '$ lsmod | head',
        '$ modinfo nvidia 2>/dev/null | head    # info de un driver concreto',
        '',
        '# Placa base, BIOS y RAM instalada físicamente',
        '$ sudo dmidecode -t system | grep -E "Manufacturer|Product"',
        '$ sudo dmidecode -t bios | grep -E "Vendor|Version|Release"',
        '$ sudo dmidecode -t memory | grep -E "Size|Speed|Type:|Locator" | head -20',
        '',
        '# ¿Cuántas ranuras de RAM hay y cuántas están libres?',
        '$ sudo dmidecode -t memory | grep -c "^Memory Device"',
        '$ sudo dmidecode -t memory | grep "Size:" | grep -c "No Module"',
        '',
        '# Inventario completo en un resumen',
        '$ sudo lshw -short'
      ]},
      { type: 'h2', id: 'temperatura', text: 'Temperaturas, ventiladores y batería' },
      { type: 'cmd', label: 'Vigilar el estado térmico', lines: [
        '$ sudo apt install lm-sensors',
        '$ sudo sensors-detect --auto      # detecta los sensores (responde Sí)',
        '$ sensors',
        '| coretemp-isa-0000',
        '| Package id 0:  +52.0°C  (high = +100.0°C, crit = +100.0°C)',
        '| Core 0:        +50.0°C',
        '',
        '# Vigilar mientras haces una tarea pesada',
        '$ watch -n 2 sensors',
        '',
        '# Temperatura del disco (SSD/NVMe)',
        '$ sudo apt install smartmontools nvme-cli',
        '$ sudo smartctl -A /dev/sda | grep -i temp',
        '$ sudo nvme smart-log /dev/nvme0 | grep -i temp',
        '',
        '# Batería de un portátil',
        '$ upower -i $(upower -e | grep BAT)',
        '$ cat /sys/class/power_supply/BAT0/capacity',
        '',
        '# Frecuencia actual de la CPU (¿está bajando por calor?)',
        '$ grep "MHz" /proc/cpuinfo',
        '$ watch -n 1 "grep MHz /proc/cpuinfo"'
      ]},
      { type: 'h2', id: 'salud-disco', text: 'Salud del disco: comprobarlo antes de que falle' },
      { type: 'cmd', label: 'SMART: el disco te avisa antes de morir', lines: [
        '$ sudo apt install smartmontools',
        '',
        '# Veredicto rápido: ¿está sano?',
        '$ sudo smartctl -H /dev/sda',
        '| SMART overall-health self-assessment test result: PASSED',
        '',
        '# Los atributos que de verdad predicen un fallo',
        '$ sudo smartctl -A /dev/sda | grep -E \\',
        '    "Reallocated_Sector|Current_Pending|Offline_Uncorrectable|Power_On_Hours"',
        '',
        '# En un NVMe',
        '$ sudo nvme smart-log /dev/nvme0',
        '#   percentage_used → desgaste de la memoria flash (0-100%)',
        '#   media_errors    → debe ser 0',
        '',
        '# Lanzar un autotest corto (2 minutos, no interrumpe el uso)',
        '$ sudo smartctl -t short /dev/sda',
        '$ sudo smartctl -l selftest /dev/sda      # ver el resultado',
        '',
        '# Errores de disco en el registro del kernel: la señal de alarma',
        '$ journalctl -k -p err | grep -iE "ata|nvme|i/o error|sector"'
      ]},
      { type: 'callout', variant: 'warn', title: 'Las cifras que anuncian un fallo',
        html: '<p><code>Reallocated_Sector_Ct</code> y <code>Current_Pending_Sector</code> deberían ser <b>0</b>. Si crecen entre una comprobación y la siguiente, el disco está fallando: <b>haz una copia de seguridad ahora</b>, no la semana que viene. Un <code>PASSED</code> en el veredicto general no descarta un fallo inminente — los atributos individuales avisan antes.</p>' }
    ]
  });

  C.registrar({
    id: 'hw-discos',
    group: 'sistema',
    title: 'Montar discos y particiones',
    level: 'avanzado',
    tags: ['mount', 'fstab', 'uuid', 'mkfs', 'usb', 'exfat'],
    lead: 'Montar un disco es conectarlo al árbol de directorios. Hacerlo <b>permanente</b> requiere editar <code>/etc/fstab</code>, y un error ahí puede impedir que el sistema arranque — por eso existen las opciones <code>nofail</code> y la comprobación previa.',
    blocks: [
      { type: 'h2', id: 'montar', text: 'Montar a mano' },
      { type: 'steps', items: [
        { t: 'Identificar el dispositivo',
          html: '<p>Localiza el disco por <b>tamaño y etiqueta</b>, no por la letra: las letras cambian entre reinicios.</p>',
          cmd: { label: 'Identificar', lines: [
            '$ lsblk -f',
            '$ sudo blkid',
            '| /dev/sdb1: LABEL="USB16" UUID="5678-EF01" TYPE="exfat"'
          ]}
        },
        { t: 'Crear el punto de montaje y montar',
          cmd: { label: 'Montar', lines: [
            '$ sudo mkdir -p /mnt/usb',
            '$ sudo mount /dev/sdb1 /mnt/usb',
            '',
            '# Por UUID: más fiable, no depende de la letra',
            '$ sudo mount UUID=5678-EF01 /mnt/usb',
            '',
            '# En solo lectura (recuperación de datos: no escribas nada)',
            '$ sudo mount -o ro /dev/sdb1 /mnt/usb',
            '',
            '# Comprobar que está montado',
            '$ df -h /mnt/usb',
            '$ findmnt /mnt/usb'
          ]}
        },
        { t: 'Desmontar antes de retirar el disco',
          html: '<p>Desmontar vacía los búferes a disco. Retirar un USB sin desmontarlo puede corromper archivos.</p>',
          cmd: { label: 'Desmontar', lines: [
            '$ sudo umount /mnt/usb',
            '',
            '# "target is busy": algo lo está usando. Averigua qué:',
            '$ sudo lsof +D /mnt/usb',
            '$ sudo fuser -vm /mnt/usb',
            '',
            '# Desmontar en cuanto deje de estar ocupado',
            '$ sudo umount -l /mnt/usb'
          ]}
        }
      ]},
      { type: 'h2', id: 'fstab', text: '/etc/fstab: montaje automático al arrancar' },
      { type: 'cmd', label: 'Añadir una entrada de forma segura', lines: [
        '# 1. SIEMPRE haz copia antes de editar',
        '$ sudo cp /etc/fstab /etc/fstab.bak',
        '',
        '# 2. Obtén el UUID (nunca uses /dev/sdX en fstab)',
        '$ sudo blkid /dev/sdb1',
        '| /dev/sdb1: UUID="a1b2c3d4-..." TYPE="ext4"',
        '',
        '# 3. Añade la línea',
        '$ sudo nano /etc/fstab',
        '',
        '# Formato:  <dispositivo> <punto> <tipo> <opciones> <dump> <fsck>',
        '| UUID=a1b2c3d4-...  /mnt/datos  ext4  defaults,nofail  0  2',
        '',
        '# Para un disco exFAT o NTFS compartido con Windows:',
        '| UUID=5678-EF01  /mnt/usb  exfat  defaults,nofail,uid=1000,gid=1000,umask=022  0  0',
        '',
        '# 4. PROBAR SIN REINICIAR: esto es lo que evita un sistema que no arranca',
        '$ sudo mount -a',
        '',
        '# 5. Si mount -a no da errores, verifica',
        '$ df -h | grep /mnt/datos'
      ]},
      { type: 'callout', variant: 'danger', title: 'nofail y mount -a: los dos seguros de vida',
        html: '<p><b><code>nofail</code></b> — sin esta opción, si el disco no está presente al arrancar, el sistema se detiene en modo de emergencia esperando. Con un disco externo en <code>fstab</code>, <code>nofail</code> es obligatorio.</p><p><b><code>sudo mount -a</code></b> — intenta montar todo lo de <code>fstab</code> <em>sin reiniciar</em>. Si hay un error de sintaxis, lo ves ahora y lo corriges; si reinicias sin probar, lo descubres cuando ya no puedes arrancar.</p><p>Si aun así te quedas bloqueado: arranca desde un USB en vivo, monta la partición del sistema y restaura <code>/etc/fstab.bak</code>.</p>' },
      { type: 'table', head: ['Opción de fstab', 'Qué hace'], rows: [
        ['<code>defaults</code>', 'Equivale a <code>rw,suid,dev,exec,auto,nouser,async</code>'],
        ['<code>nofail</code>', 'No detiene el arranque si el dispositivo falta. <b>Imprescindible en discos externos</b>'],
        ['<code>noauto</code>', 'No se monta al arrancar, pero queda definido para montarlo a mano'],
        ['<code>ro</code> / <code>rw</code>', 'Solo lectura o lectura y escritura'],
        ['<code>user</code>', 'Permite que un usuario normal lo monte'],
        ['<code>uid=1000,gid=1000</code>', 'Dueño de los archivos en sistemas sin permisos POSIX (exFAT, NTFS, FAT32)'],
        ['<code>umask=022</code>', 'Permisos de los archivos en esos mismos sistemas'],
        ['<code>x-systemd.automount</code>', 'Montaje perezoso: solo al acceder por primera vez'],
        ['<code>discard</code>', 'Activa TRIM continuo en SSD (o usa el temporizador <code>fstrim.timer</code>)']
      ]},
      { type: 'h2', id: 'formatear', text: 'Formatear un USB' },
      { type: 'cmd', label: 'Con cuidado: verifica el dispositivo dos veces', lines: [
        '# 1. IDENTIFICA por tamaño y etiqueta. NO te fíes de la letra.',
        '$ lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINT,MODEL',
        '',
        '# 2. Desmonta si está montado',
        '$ sudo umount /dev/sdb1',
        '',
        '# 3. Formatea la PARTICIÓN (sdb1), no el disco entero (sdb)',
        '$ sudo mkfs.exfat -n "MI_USB" /dev/sdb1     # compatible con todo',
        '$ sudo mkfs.ext4 -L "DATOS" /dev/sdb1       # solo Linux, con permisos',
        '$ sudo mkfs.vfat -n "USB" -F 32 /dev/sdb1   # FAT32, límite de 4 GB/archivo',
        '',
        '# 4. Comprobar el resultado',
        '$ lsblk -f /dev/sdb'
      ]},
      { type: 'table', head: ['Sistema de archivos', 'Cuándo usarlo'], monoFirst: false, rows: [
        ['<b>ext4</b>', 'Discos que solo usarás en Linux. Permisos completos, robusto, la opción por defecto'],
        ['<b>exFAT</b>', 'USB o disco externo para compartir con Windows y macOS. Sin límite de tamaño de archivo'],
        ['<b>FAT32</b>', 'Máxima compatibilidad (equipos antiguos, cámaras, arranque UEFI). <b>Límite de 4 GB por archivo</b>'],
        ['<b>NTFS</b>', 'Disco que ya viene de Windows y quieres seguir usando allí'],
        ['<b>Btrfs</b>', 'Cuando quieres snapshots y comprobación de integridad. Más complejo de administrar']
      ]},
      { type: 'callout', variant: 'danger', title: 'mkfs no pregunta',
        html: '<p><code>mkfs</code> no pide confirmación y no hay recuperación práctica. Antes de ejecutarlo, comprueba con <code>lsblk</code> que el tamaño corresponde al dispositivo que crees. Si tu USB es de 16 GB y el dispositivo que vas a formatear muestra 500 GB, has escrito la letra equivocada.</p>' }
    ]
  });

})(window.Contenido);
