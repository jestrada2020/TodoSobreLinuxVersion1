/* 09c-discos.js — discos y memorias USB: identificar, montar, borrar,
   particionar, formatear, reparar y recuperar. Comandos para Ubuntu 22.04-25.10
   (parted 3.6, exfatprogs, ntfs-3g, udisks2). */
(function (C) {
  'use strict';

  C.registrar({
    id: 'discos-usb',
    group: 'sistema',
    title: 'Discos y USB: montar, formatear, particionar y reparar',
    level: 'intermedio',
    tags: ['usb', 'disco', 'montar', 'desmontar', 'udisksctl', 'formatear', 'particionar', 'parted', 'fdisk', 'wipefs', 'mkfs', 'exfat', 'ntfs', 'fat32', 'fsck', 'reparar', 'recuperar', 'smartctl', 'f3'],
    lead: 'Todo el ciclo de vida de un disco o una memoria USB desde la terminal: <b>identificarlo sin equivocarse</b>, montarlo, borrarlo, particionarlo, formatearlo, repararlo y recuperar lo que contenía. La primera pestaña es la más importante: casi todos los desastres empiezan por escribir la letra de dispositivo equivocada.',
    blocks: [
      { type: 'callout', variant: 'danger', title: 'Antes de borrar, particionar o formatear',
        html: '<ol><li>Identifica el dispositivo por <b>tamaño, modelo y número de serie</b>, no solo por la letra (<code>sdb</code> puede pasar a ser <code>sdc</code> al reconectar).</li><li>Comprueba que es <b>extraíble</b> o que no contiene tu sistema: <code>lsblk</code> no debe mostrar <code>/</code>, <code>/boot</code> ni <code>[SWAP]</code> en él.</li><li>Desmonta todas sus particiones.</li><li>Haz copia de lo que necesites: estas operaciones <b>no tienen deshacer</b>.</li></ol><p>En los ejemplos, <code>/dev/sdX</code> es el disco completo y <code>/dev/sdX1</code> su primera partición. Sustituye la <code>X</code> por la letra real.</p>' },

      { type: 'tabs', id: 'discos-tabs', title: 'Operaciones', items: [

        /* ------------------------------ 1. IDENTIFICAR ------------------------------ */
        { id: 'disco-identificar', n: '1', t: 'Identificar', badge: 'primero', badgeVariant: 'danger',
          lead: 'Saber con certeza cuál es el dispositivo correcto antes de tocar nada.',
          blocks: [
            { type: 'cmd', label: 'Qué discos hay y cuál es cuál', lines: [
              '# Árbol de discos y particiones con sistema de archivos, etiqueta y montaje',
              '$ lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,MOUNTPOINTS,RM,TRAN,MODEL',
              '| NAME          SIZE TYPE FSTYPE LABEL   MOUNTPOINTS  RM TRAN MODEL',
              '| sda         476,9G disk                              0 sata Samsung SSD 860',
              '| ├─sda1        512M part vfat            /boot/efi     0',
              '| └─sda2      476,4G part ext4            /             0       ← tu SISTEMA',
              '| sdb          28,9G disk                              1 usb  Kingston DataTraveler',
              '| └─sdb1       28,9G part vfat   kistom  /media/john/kistom  1   ← la USB',
              '',
              '# RM=1: extraíble · TRAN=usb: conectado por USB',
              '',
              '# Nombres ESTABLES (no cambian al reconectar): úsalos en scripts',
              '$ ls -l /dev/disk/by-id/ | grep -v part',
              '$ ls -l /dev/disk/by-label/',
              '',
              '# UUID y tipo de cada partición',
              '$ sudo blkid',
              '',
              '# Tabla de particiones y tamaño exacto',
              '$ sudo fdisk -l /dev/sdX'
            ]},
            { type: 'cmd', label: 'Truco infalible: ver qué aparece al conectar', lines: [
              '# 1. Ejecuta esto y DESPUÉS conecta la USB',
              '$ sudo dmesg -w',
              '| usb 1-2: New USB device found, idVendor=0951, idProduct=1666',
              '| sd 2:0:0:0: [sdb] 60555264 512-byte logical blocks: (31.0 GB/28.9 GiB)',
              '| sdb: sdb1                                      ← el nombre asignado',
              '# Ctrl+C para salir',
              '',
              '# O compara antes y después',
              '$ lsblk -dn -o NAME > antes.txt   # (conecta la USB)',
              '$ lsblk -dn -o NAME | diff antes.txt -'
            ]},
            { type: 'cmd', label: 'Comprobación de seguridad para scripts', lines: [
              '# Se niega a seguir si el disco no es extraíble o tiene algo del sistema montado',
              '$ es_seguro() { local d="$1"; [[ $(lsblk -dno RM "$d") == 1 ]] || { echo "NO es extraíble"; return 1; }; ! lsblk -no MOUNTPOINTS "$d" | grep -qE "^/(boot)?$|SWAP" || { echo "contiene el sistema"; return 1; }; lsblk -dno SIZE,MODEL "$d"; }',
              '$ es_seguro /dev/sdb && echo "OK para trabajar"'
            ]}
          ]
        },

        /* ------------------------------ 2. MONTAR ------------------------------ */
        { id: 'disco-montar', n: '2', t: 'Montar y desmontar',
          lead: '<code>udisksctl</code> monta y desmonta como lo hace el escritorio, <b>sin sudo</b> y en <code>/media/USUARIO</code>. <code>mount</code> da control total pero exige root.',
          blocks: [
            { type: 'cmd', label: 'La forma cómoda: udisksctl (sin sudo)', lines: [
              '$ udisksctl mount -b /dev/sdX1',
              '| Mounted /dev/sdb1 at /media/john/kistom',
              '',
              '$ udisksctl unmount -b /dev/sdX1',
              '',
              '# Retirar con seguridad: vacía cachés, desmonta y APAGA el dispositivo',
              '$ udisksctl power-off -b /dev/sdX',
              '',
              '# Montar una imagen .iso o .img como si fuera un disco',
              '$ udisksctl loop-setup -r -f ubuntu.iso'
            ]},
            { type: 'cmd', label: 'Con mount, según el sistema de archivos', lines: [
              '$ sudo mkdir -p /mnt/usb',
              '',
              '$ sudo mount /dev/sdX1 /mnt/usb                                   # ext4: detecta el tipo',
              '$ sudo mount -o uid=$UID,gid=$(id -g),umask=022 /dev/sdX1 /mnt/usb   # FAT/exFAT: tuyo',
              '$ sudo mount -t ntfs3 -o uid=$UID,gid=$(id -g) /dev/sdX1 /mnt/usb    # NTFS',
              '$ sudo mount -o ro /dev/sdX1 /mnt/usb                             # SOLO LECTURA (rescate)',
              '$ sudo mount -o loop,ro imagen.img /mnt/usb                       # imagen de disco',
              '',
              '# Disco cifrado con LUKS (o BitLocker de Windows, con bitlk)',
              '$ sudo cryptsetup open /dev/sdX1 usbcifrada          # BitLocker: --type bitlk',
              '$ sudo mount /dev/mapper/usbcifrada /mnt/usb',
              '',
              '$ sudo umount /mnt/usb && sync'
            ]},
            { type: 'table', head: ['Error', 'Solución'], monoFirst: false, rows: [
              ['<code>target is busy</code> al desmontar', 'Algo lo está usando: <code>sudo lsof +f -- /mnt/usb</code> o <code>sudo fuser -vm /mnt/usb</code>. Cierra esa terminal o programa (a menudo una terminal con <code>cd</code> dentro)'],
              ['<code>wrong fs type, bad option, bad superblock</code>', 'Tipo no soportado o sistema de archivos dañado: <code>sudo blkid /dev/sdX1</code> y ve a la pestaña <b>Reparar</b>'],
              ['<code>unknown filesystem type \'exfat\'</code>', '<code>sudo apt install exfatprogs</code>'],
              ['NTFS solo en lectura: <code>The disk contains an unclean file system</code>', 'Windows lo dejó hibernado: apágalo del todo desde Windows, o <code>sudo ntfsfix -d /dev/sdX1</code>'],
              ['No se monta solo al conectarlo', 'Montaje automático desactivado o fuera de sesión gráfica: <code>udisksctl mount -b …</code>'],
              ['<code>can\'t read superblock</code>', 'Prueba solo lectura y la pestaña <b>Reparar</b>; si hay errores de I/O, ve a <b>Recuperar</b>']
            ]},
            { type: 'callout', variant: 'tip', title: 'Montaje permanente',
              html: '<p>Para que un disco se monte al arrancar, con <code>nofail</code> y la prueba <code>sudo mount -a</code>, ver <a href="#hw-discos/fstab">/etc/fstab</a>. Para fijar los permisos de discos FAT/exFAT/NTFS, ver <a href="#perm-avanzado/perm-usb">Permisos en USB</a>.</p>' }
          ]
        },

        /* ------------------------------ 3. BORRAR ------------------------------ */
        { id: 'disco-borrar', n: '3', t: 'Borrar / limpiar', badge: 'destructivo', badgeVariant: 'danger',
          lead: 'Dejar un disco «en blanco» antes de particionarlo, o borrar los datos de forma que no se puedan recuperar antes de regalarlo o venderlo.',
          blocks: [
            { type: 'cmd', label: 'Borrar firmas y tabla de particiones (rápido)', lines: [
              '# Desmonta todo lo del disco',
              '$ sudo umount /dev/sdX?* 2>/dev/null',
              '',
              '# Ver qué firmas hay (sin borrar)',
              '$ sudo wipefs /dev/sdX',
              '',
              '# Borrar firmas de TODAS las particiones y del disco (deja el disco vacío)',
              '$ sudo wipefs -a /dev/sdX?* /dev/sdX',
              '',
              '# Tablas GPT y MBR, incluida la copia GPT del final del disco',
              '$ sudo sgdisk --zap-all /dev/sdX',
              '$ sudo partprobe /dev/sdX',
              '$ lsblk /dev/sdX                    # ya sin particiones'
            ]},
            { type: 'cmd', label: 'Borrado seguro de los datos (irrecuperable)', lines: [
              '# Disco duro o USB: una pasada de ceros es suficiente en discos modernos',
              '$ sudo dd if=/dev/zero of=/dev/sdX bs=4M status=progress oflag=direct conv=fsync',
              '',
              '# SSD SATA o NVMe: TRIM de todo el dispositivo (instantáneo)',
              '$ sudo blkdiscard -f /dev/sdX',
              '',
              '# NVMe: borrado seguro del propio controlador',
              '$ sudo apt install -y nvme-cli',
              '$ sudo nvme format /dev/nvme1n1 --ses=1',
              '',
              '# Un solo archivo',
              '$ shred -u -n 1 -z documento_privado.pdf'
            ]},
            { type: 'callout', variant: 'warn', title: 'shred y las pasadas múltiples no sirven en SSD ni en USB',
              html: '<p>Las memorias flash reparten las escrituras y guardan bloques de reserva: sobrescribir un archivo no garantiza que se borre el bloque físico. En SSD y NVMe usa <code>blkdiscard</code> o el borrado del controlador; en USB, una pasada de <code>dd</code> sobre el dispositivo completo. Lo más seguro: tener el disco <b>cifrado desde el principio</b>, porque entonces basta con destruir la clave.</p>' }
          ]
        },

        /* ------------------------------ 4. PARTICIONAR ------------------------------ */
        { id: 'disco-particionar', n: '4', t: 'Particionar',
          lead: 'Crear la tabla de particiones y las particiones. <code>parted</code> se puede usar en una sola línea (ideal para scripts); <code>fdisk</code>/<code>gdisk</code> son interactivos; GParted y GNOME Discos son gráficos.',
          blocks: [
            { type: 'table', head: ['Tabla', 'Cuándo'], monoFirst: false, rows: [
              ['<b>GPT</b>', 'Por defecto hoy: discos de más de 2 TB, equipos UEFI, hasta 128 particiones'],
              ['<b>MBR (msdos)</b>', 'Máxima compatibilidad: radios de coche, televisores, cámaras, equipos BIOS antiguos. Límite de 2 TB y 4 particiones primarias']
            ]},
            { type: 'cmd', label: 'Una partición que ocupa todo el disco (parted)', lines: [
              '# GPT (recomendado)',
              '$ sudo parted -s /dev/sdX mklabel gpt',
              '$ sudo parted -s -a optimal /dev/sdX mkpart DATOS 1MiB 100%',
              '# Si será exFAT, NTFS o FAT: que Windows la reconozca como de datos',
              '$ sudo parted -s /dev/sdX set 1 msftdata on',
              '',
              '# MBR (para dispositivos antiguos); "ntfs" fija el tipo 0x07, válido también para exFAT',
              '$ sudo parted -s /dev/sdX mklabel msdos',
              '$ sudo parted -s -a optimal /dev/sdX mkpart primary ntfs 1MiB 100%',
              '',
              '$ sudo partprobe /dev/sdX && lsblk /dev/sdX'
            ]},
            { type: 'cmd', label: 'Varias particiones', lines: [
              '# 64 GB para Linux (ext4) y el resto para intercambio con Windows (exFAT)',
              '$ sudo parted -s /dev/sdX mklabel gpt',
              '$ sudo parted -s -a optimal /dev/sdX mkpart LINUX ext4 1MiB 64GiB',
              '$ sudo parted -s -a optimal /dev/sdX mkpart COMPARTIDO 64GiB 100%',
              '$ sudo parted -s /dev/sdX set 2 msftdata on',
              '$ sudo parted /dev/sdX print'
            ]},
            { type: 'cmd', label: 'fdisk interactivo (resumen de teclas)', lines: [
              '$ sudo fdisk /dev/sdX',
              '#   p  mostrar la tabla           g  nueva tabla GPT     o  nueva tabla MBR',
              '#   n  nueva partición (Enter acepta los valores por defecto = todo el espacio)',
              '#   t  cambiar el tipo (11 = Microsoft basic data en GPT; 7 = exFAT/NTFS en MBR)',
              '#   d  borrar partición           w  ESCRIBIR y salir    q  salir SIN guardar',
              '# Nada se escribe hasta pulsar w: si dudas, q'
            ]},
            { type: 'cmd', label: 'Ampliar una partición tras liberar espacio contiguo', lines: [
              '# ext4 (se puede hacer montada si crece)',
              '$ sudo growpart /dev/sdX 1                 # o: sudo parted /dev/sdX resizepart 1 100%',
              '$ sudo resize2fs /dev/sdX1',
              '',
              '# Reducir o mover particiones: mejor con GParted (sudo apt install gparted),',
              '# que encadena los pasos en el orden correcto. Haz copia antes.'
            ]}
          ]
        },

        /* ------------------------------ 5. FORMATEAR ------------------------------ */
        { id: 'disco-formatear', n: '5', t: 'Formatear',
          lead: 'Crear el sistema de archivos. La elección depende de <b>dónde</b> vas a usar el disco.',
          blocks: [
            { type: 'table', head: ['Sistema', 'Úsalo para', 'Límites'], monoFirst: false, rows: [
              ['<b>exFAT</b>', 'USB y discos para Linux, Windows, macOS, TV y cámaras modernas', 'Sin permisos de Linux ni diario (desenchufar en caliente es arriesgado)'],
              ['<b>FAT32</b>', 'Dispositivos antiguos, BIOS/UEFI, radios, impresoras', 'Archivos de máximo 4 GB'],
              ['<b>NTFS</b>', 'Discos que se usan sobre todo en Windows', 'macOS solo lee'],
              ['<b>ext4</b>', 'Discos solo para Linux, respaldos, servidores', 'Windows no lo lee sin programas extra'],
              ['<b>Btrfs</b>', 'Linux con instantáneas, compresión y sumas de verificación', 'Necesita <code>btrfs-progs</code>']
            ]},
            { type: 'cmd', label: 'Formatear (la partición ya debe existir y estar desmontada)', lines: [
              '$ sudo umount /dev/sdX1 2>/dev/null',
              '',
              '$ sudo mkfs.exfat -L MI_USB /dev/sdX1               # etiqueta: máx. 11 caracteres',
              '$ sudo mkfs.vfat -F 32 -n MI_USB /dev/sdX1          # etiqueta: máx. 11 caracteres, MAYÚSCULAS',
              '$ sudo mkfs.ntfs -f -L DATOS /dev/sdX1               # -f: rápido (sin poner a cero)',
              '$ sudo mkfs.ext4 -L RESPALDO /dev/sdX1',
              '$ sudo apt install -y btrfs-progs && sudo mkfs.btrfs -L DATOS /dev/sdX1'
            ]},
            { type: 'cmd', label: 'Después de formatear en ext4: que sea tuyo', lines: [
              '$ udisksctl mount -b /dev/sdX1',
              '$ sudo chown $USER: /media/$USER/RESPALDO',
              '',
              '# Recuperar el 5 % reservado para root (no tiene sentido en un disco de datos)',
              '$ sudo tune2fs -m 0 /dev/sdX1'
            ]},
            { type: 'cmd', label: 'Cambiar solo la etiqueta (sin formatear)', lines: [
              '$ sudo exfatlabel /dev/sdX1 RESPALDO26     # exFAT: máximo 11 caracteres',
              '$ sudo fatlabel   /dev/sdX1 RESPALDO26     # FAT32: máximo 11, mejor en MAYÚSCULAS',
              '$ sudo ntfslabel  /dev/sdX1 "Respaldo 2026"     # NTFS: hasta 128',
              '$ sudo e2label    /dev/sdX1 respaldo_2026       # ext4: hasta 16'
            ]},
            { type: 'callout', variant: 'tip', title: 'Interfaz gráfica',
              html: '<p><b>GNOME Discos</b> (<code>gnome-disks</code>, ya instalado) formatea, crea particiones, comprueba y repara con unos clics, y muestra el modelo y el tamaño de cada disco, lo que reduce el riesgo de equivocarse de dispositivo. <b>GParted</b> (<code>sudo apt install gparted</code>) añade redimensionar y mover particiones.</p>' }
          ]
        },

        /* ------------------------------ 6. REPARAR ------------------------------ */
        { id: 'disco-reparar', n: '6', t: 'Reparar', badge: 'fsck', badgeVariant: 'warn',
          lead: 'Corregir errores del sistema de archivos y diagnosticar el hardware. Siempre con la partición <b>desmontada</b>.',
          blocks: [
            { type: 'cmd', label: 'Reparar según el sistema de archivos', lines: [
              '$ sudo umount /dev/sdX1',
              '',
              '$ sudo fsck.exfat -y /dev/sdX1          # exFAT',
              '$ sudo fsck.vfat -a -w /dev/sdX1        # FAT32 (-a reparar, -w escribir enseguida)',
              '$ sudo ntfsfix -d /dev/sdX1             # NTFS: arreglo básico; el completo es chkdsk /f en Windows',
              '$ sudo e2fsck -f -y /dev/sdX1           # ext4',
              '',
              '# Solo comprobar, sin cambiar nada',
              '$ sudo fsck -n /dev/sdX1'
            ]},
            { type: 'cmd', label: 'Salud del hardware (SMART)', lines: [
              '$ sudo apt install -y smartmontools nvme-cli',
              '',
              '$ sudo smartctl -H /dev/sdX              # resumen: PASSED o FAILED',
              '$ sudo smartctl -a /dev/sdX | grep -iE "reallocated|pending|uncorrect|power_on|wear"',
              '$ sudo smartctl -t short /dev/sdX        # prueba de 2 minutos; resultado con -a',
              '$ sudo nvme smart-log /dev/nvme0         # NVMe: percentage_used, media_errors',
              '',
              '# Muchas memorias USB no exponen SMART: en ellas, usa badblocks y f3'
            ]},
            { type: 'cmd', label: 'Sectores defectuosos y USB falsificadas', lines: [
              '# Prueba de lectura (no destructiva, segura)',
              '$ sudo badblocks -sv /dev/sdX',
              '',
              '# ¿La USB tiene la capacidad que dice? (muy común en USB baratas)',
              '$ sudo apt install -y f3',
              '$ sudo f3probe --destructive --time-ops /dev/sdX        # BORRA la USB',
              '| Bad news: The device `/dev/sdb\' is a counterfeit of type limbo',
              '| *Usable* size: 7.48 GB · Announced size: 64.00 GB',
              '$ sudo f3fix --last-sec=15693823 /dev/sdX                 # la ajusta a su tamaño real'
            ]},
            { type: 'table', head: ['Síntoma', 'Causa probable y qué hacer'], monoFirst: false, rows: [
              ['La USB se monta en solo lectura y no se puede formatear', '<code>sudo dmesg | grep -i "write protect"</code>. Si dice <i>Write Protect is on</i>: interruptor físico, o la memoria flash está agotada y se bloquea para proteger los datos. Copia lo que puedas y reemplázala'],
              ['Aparece con 0 bytes o sin particiones', 'Tabla dañada: <code>sudo testdisk /dev/sdX</code> (pestaña Recuperar). Si no hay nada que salvar: pestañas Borrar → Particionar → Formatear'],
              ['Tamaño extraño (32 MB, 2 GB) en una USB grande', 'Quedó con la estructura de una ISO de arranque: receta en la pestaña 8'],
              ['No aparece en <code>lsblk</code>', '<code>sudo dmesg -w</code> al conectarla. Sin mensajes: otro puerto o cable. <code>device descriptor read error</code>: hardware o falta de alimentación (prueba un hub con corriente)'],
              ['Se desconecta sola durante copias largas', 'Ahorro de energía USB o alimentación insuficiente: <code>dmesg | grep -i "reset\\|disconnect"</code>'],
              ['<code>Input/output error</code> al leer', 'Fallo físico: <b>no repares</b>, clona primero (pestaña Recuperar)']
            ]}
          ]
        },

        /* ------------------------------ 7. RECUPERAR ------------------------------ */
        { id: 'disco-recuperar', n: '7', t: 'Recuperar datos', badge: 'rescate', badgeVariant: 'info',
          lead: 'Archivos borrados, USB formateada por error o disco que da errores. La regla: <b>deja de escribir en el dispositivo</b> y recupera hacia <b>otro</b> disco.',
          blocks: [
            { type: 'table', head: ['Situación', 'Herramienta', 'Qué recupera'], monoFirst: false, rows: [
              ['Borré archivos de una USB o tarjeta', '<code>photorec</code>', 'El contenido por su firma (fotos, PDF, documentos…), con nombres nuevos'],
              ['Formateé la USB por error', '<code>testdisk</code> y luego <code>photorec</code>', 'La partición anterior, o sus archivos'],
              ['La partición desapareció', '<code>testdisk</code>', 'La tabla de particiones'],
              ['El disco da errores de lectura', '<code>ddrescue</code> (primero) y después lo anterior sobre la imagen', 'Todo lo legible']
            ]},
            { type: 'cmd', label: 'Archivos borrados de una USB o tarjeta SD', lines: [
              '# 1. Desmonta y NO escribas nada más en ella',
              '$ udisksctl unmount -b /dev/sdX1',
              '',
              '# 2. photorec: elige el disco → la partición → File Opt (tipos) → Search',
              '#    y como destino una carpeta en OTRO disco',
              '$ mkdir -p ~/recuperado',
              '$ sudo photorec /log /d ~/recuperado/ /dev/sdX',
              '',
              '# 3. Ordenar lo recuperado por tipo',
              '$ cd ~/recuperado && for e in jpg pdf docx xlsx mp4; do mkdir -p $e; find . -path "./$e" -prune -o -iname "*.$e" -exec mv -t $e {} +; done',
              '$ sudo chown -R $USER: ~/recuperado'
            ]},
            { type: 'cmd', label: 'Disco con errores: clonar antes de nada', lines: [
              '$ sudo apt install -y gddrescue',
              '$ sudo ddrescue -d -n /dev/sdX /media/$USER/OTRO/usb.img /media/$USER/OTRO/usb.map',
              '$ sudo ddrescue -d -r3 /dev/sdX /media/$USER/OTRO/usb.img /media/$USER/OTRO/usb.map',
              '# Después, photorec/testdisk sobre usb.img en lugar del dispositivo'
            ]},
            { type: 'callout', variant: 'tip', title: 'Guía completa',
              html: '<p>Clonado con <code>ddrescue</code>, montaje de la imagen, <code>testdisk</code>, <code>photorec</code> y <code>extundelete</code>, paso a paso, en <a href="#resc-datos">Rescatar datos</a>. Si el disco hace ruidos mecánicos, apágalo y valora un servicio profesional.</p>' }
          ]
        },

        /* ------------------------------ 8. RECETA USB ------------------------------ */
        { id: 'disco-receta', n: '8', t: 'USB como nueva', badge: 'receta', badgeVariant: 'ok',
          lead: 'Devolver a su estado normal una USB que se usó como instalador (aparece con 2 GB, varias particiones o en solo lectura) o que tiene la estructura dañada. Cinco pasos, de principio a fin.',
          blocks: [
            { type: 'steps', items: [
              { t: 'Identificar y comprobar', cmd: { label: '1', lines: [
                  '$ lsblk -o NAME,SIZE,RM,TRAN,MODEL,MOUNTPOINTS',
                  '# Confirma tamaño y modelo. RM debe ser 1 y TRAN usb.',
                  '$ DISCO=/dev/sdX                       # ← la letra correcta'
                ]}
              },
              { t: 'Desmontar y borrar la estructura anterior', cmd: { label: '2', lines: [
                  '$ sudo umount ${DISCO}?* 2>/dev/null',
                  '$ sudo wipefs -a ${DISCO}?* $DISCO 2>/dev/null',
                  '$ sudo sgdisk --zap-all $DISCO',
                  '# Algunas ISO dejan restos que wipefs no ve: borra el primer MiB',
                  '$ sudo dd if=/dev/zero of=$DISCO bs=1M count=1 conv=fsync'
                ]}
              },
              { t: 'Crear una tabla y una partición', cmd: { label: '3', lines: [
                  '$ sudo parted -s $DISCO mklabel gpt',
                  '$ sudo parted -s -a optimal $DISCO mkpart MI_USB 1MiB 100%',
                  '$ sudo parted -s $DISCO set 1 msftdata on',
                  '$ sudo partprobe $DISCO && sleep 1'
                ]}
              },
              { t: 'Formatear en exFAT (funciona en todas partes)', cmd: { label: '4', lines: [
                  '$ sudo mkfs.exfat -L MI_USB ${DISCO}1'
                ]}
              },
              { t: 'Montar, comprobar y usar', cmd: { label: '5', lines: [
                  '$ udisksctl mount -b ${DISCO}1',
                  '$ df -h /media/$USER/MI_USB',
                  '$ echo prueba > /media/$USER/MI_USB/prueba.txt && cat /media/$USER/MI_USB/prueba.txt'
                ]}
              }
            ]},
            { type: 'callout', variant: 'info', title: 'Para crear una USB de arranque',
              html: '<p>El proceso inverso (grabar una ISO de Ubuntu en la USB) está en <a href="#resc-datos/usb">Crear un USB de arranque</a>.</p>' }
          ]
        }
      ]}
    ]
  });

})(window.Contenido);
