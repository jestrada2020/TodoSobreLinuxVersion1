/* 10-rescate.js — GRUB, modo de recuperación y rescate de datos */
(function (C) {
  'use strict';

  C.registrar({
    id: 'resc-arranque',
    group: 'rescate',
    title: 'El sistema no arranca',
    level: 'avanzado',
    tags: ['grub', 'chroot', 'recovery', 'fsck', 'usb en vivo', 'initramfs'],
    lead: 'Antes de reinstalar, identifica <b>en qué punto</b> falla el arranque. Cada fase tiene su propia solución, y casi todas se arreglan en diez minutos con un USB en vivo. Reinstalar es casi siempre innecesario.',
    blocks: [
      { type: 'h2', id: 'fases', text: 'Localizar la fase del fallo' },
      { type: 'ascii', text:
'  1. BIOS/UEFI ──► 2. GRUB ──► 3. KERNEL ──► 4. INITRAMFS ──► 5. SYSTEMD ──► 6. LOGIN\n' +
'       │              │            │              │               │            │\n' +
'  Pantalla del   "grub rescue>"  Pantalla     "waiting for    Un servicio   Bucle de\n' +
'  fabricante,    o no aparece    negra tras   root device"    se cuelga     inicio de\n' +
'  no llega más   el menú         GRUB         o initramfs                   sesión\n' +
'  allá                                        shell\n' +
'\n' +
'  ¿Ves el menú de GRUB?\n' +
'    NO  → fase 1 o 2: GRUB dañado o arranque mal configurado en la UEFI\n' +
'    SÍ  → fase 3 en adelante: el problema es el kernel o el sistema' },
      { type: 'table', head: ['Síntoma', 'Fase', 'Qué hacer'], monoFirst: false, rows: [
        ['No hay señal, no llega al menú', '1-2', 'Comprobar el orden de arranque en la UEFI. Reinstalar GRUB desde un USB en vivo'],
        ['<code>grub rescue&gt;</code>', '2', 'GRUB no encuentra su configuración: reinstalarlo con <code>chroot</code>'],
        ['<code>Minimal BASH-like editing</code>', '2', 'Igual que el anterior'],
        ['Pantalla negra tras elegir en GRUB', '3', 'Arrancar el kernel anterior desde «Opciones avanzadas». Suele ser el driver de la gráfica'],
        ['<code>waiting for root device</code>', '4', 'El UUID de <code>/etc/fstab</code> o de GRUB no coincide. Comprobar con <code>blkid</code>'],
        ['Se detiene en un mensaje de servicio', '5', 'Arrancar en modo de recuperación y revisar <code>systemctl list-units --failed</code>'],
        ['Vuelve siempre a la pantalla de inicio de sesión', '6', 'Suele ser permisos de <code>~</code>, disco lleno o el driver gráfico'],
        ['<code>You are in emergency mode</code>', '4-5', 'Error en <code>/etc/fstab</code>. Restaurar la copia de seguridad']
      ]},

      { type: 'h2', id: 'menu-grub', text: 'Primer intento: el menú de GRUB' },
      { type: 'cmd', label: 'Sin USB, sin herramientas: solo el menú', lines: [
        '# Si el menú no aparece, mantén PULSADO Shift (BIOS)',
        '# o pulsa Esc repetidamente (UEFI) justo al encender.',
        '',
        '# 1. "Advanced options for Ubuntu" → arranca el KERNEL ANTERIOR.',
        '#    Si funciona, el problema es el kernel nuevo o su driver gráfico.',
        '',
        '# 2. En el mismo menú, la entrada "(recovery mode)" te da',
        '#    un menú con: reparar paquetes roto, arreglar fsck, red, root shell.',
        '',
        '# 3. Editar la línea de arranque al vuelo: pulsa "e" sobre la entrada.',
        '#    Localiza la línea que empieza por "linux" y añade al final:',
        '#      nomodeset          → desactiva el driver gráfico del kernel',
        '#      systemd.unit=multi-user.target   → arranca SIN entorno gráfico',
        '#      single             → modo monousuario',
        '#      init=/bin/bash     → shell directo, sin systemd (último recurso)',
        '#    Después Ctrl+X o F10 para arrancar con ese cambio (no es permanente).'
      ]},
      { type: 'callout', variant: 'tip', title: 'nomodeset resuelve la mayoría de las pantallas negras',
        html: '<p>Si arranca con <code>nomodeset</code>, el problema es el driver de la tarjeta gráfica (típico tras actualizar el kernel con una NVIDIA). Desde dentro puedes reinstalar el driver:</p><p><code>sudo apt install --reinstall nvidia-driver-550</code> o probar la versión que recomiende <code>ubuntu-drivers devices</code>.</p>' },

      { type: 'h2', id: 'chroot', text: 'Reparar desde un USB en vivo con chroot' },
      { type: 'prose', html: '<p><code>chroot</code> te mete «dentro» de tu sistema instalado desde el USB en vivo, con acceso a <code>apt</code>, <code>grub-install</code> y todo lo demás. Es la técnica que resuelve la mayoría de los arranques roto.</p>' },
      { type: 'steps', items: [
        { t: 'Arrancar el USB en vivo y localizar tus particiones',
          html: '<p>Elige «Probar Ubuntu» (no instalar). Identifica la partición raíz por tamaño y sistema de archivos.</p>',
          cmd: { label: 'Identificar', lines: [
            '$ sudo lsblk -f',
            '| nvme0n1p1 vfat        EFI      ← partición EFI (~512 MB)',
            '| nvme0n1p2 ext4        ubuntu   ← tu raíz  /',
            '',
            '# Si usas cifrado LUKS, ábrelo primero:',
            '$ sudo cryptsetup open /dev/nvme0n1p3 sistema',
            '$ sudo lvscan            # si además hay LVM'
          ]}
        },
        { t: 'Montar la raíz y los sistemas virtuales',
          html: '<p>Los cuatro <code>--bind</code> son imprescindibles: sin ellos <code>grub-install</code> y <code>apt</code> fallan dentro del chroot.</p>',
          cmd: { label: 'Montar', lines: [
            '$ sudo mount /dev/nvme0n1p2 /mnt',
            '',
            '# La partición EFI, si el sistema es UEFI',
            '$ sudo mount /dev/nvme0n1p1 /mnt/boot/efi',
            '',
            '# Si /boot o /home están en particiones separadas, móntalas también',
            '# $ sudo mount /dev/nvme0n1pX /mnt/boot',
            '',
            '# Sistemas virtuales del kernel',
            '$ for d in dev dev/pts proc sys run; do sudo mount --bind /$d /mnt/$d; done'
          ]}
        },
        { t: 'Entrar en el sistema y reparar',
          cmd: { label: 'chroot y reparación', lines: [
            '$ sudo chroot /mnt /bin/bash',
            '',
            '# Ya estás DENTRO de tu sistema instalado.',
            '# Reinstalar GRUB (UEFI):',
            '# chroot> grub-install --target=x86_64-efi --efi-directory=/boot/efi \\',
            '#             --bootloader-id=ubuntu',
            '',
            '# Reinstalar GRUB (BIOS antigua): apunta al DISCO, no a la partición',
            '# chroot> grub-install /dev/nvme0n1',
            '',
            '# Regenerar la configuración del menú',
            '# chroot> update-grub',
            '',
            '# Regenerar el initramfs (fallo en la fase 4)',
            '# chroot> update-initramfs -u -k all',
            '',
            '# Reparar paquetes a medio instalar',
            '# chroot> apt --fix-broken install',
            '# chroot> dpkg --configure -a'
          ]}
        },
        { t: 'Salir limpiamente y reiniciar',
          cmd: { label: 'Salir', lines: [
            '# chroot> exit',
            '',
            '$ sudo umount -R /mnt        # -R desmonta en orden inverso, recursivo',
            '$ sudo reboot'
          ]}
        }
      ]},
      { type: 'callout', variant: 'warn', title: 'BIOS y UEFI necesitan comandos distintos',
        html: '<p>Comprueba en qué modo está tu sistema <b>antes</b> de reinstalar GRUB:</p><p><code>[ -d /sys/firmware/efi ] && echo UEFI || echo BIOS</code></p><p>Si es <b>UEFI</b>, monta la partición EFI y usa <code>grub-install --target=x86_64-efi --efi-directory=/boot/efi</code>. Si es <b>BIOS</b>, usa <code>grub-install /dev/sdX</code> apuntando al <em>disco</em>, no a la partición. Ejecutar el comando equivocado deja el sistema igual de inarrancable.</p>' },

      { type: 'h2', id: 'fsck', text: 'Comprobar y reparar el sistema de archivos' },
      { type: 'cmd', label: 'fsck: solo en particiones DESMONTADAS', lines: [
        '# ¡NUNCA ejecutes fsck sobre una partición montada en escritura!',
        '# Desde el USB en vivo, con la partición sin montar:',
        '$ sudo umount /dev/nvme0n1p2',
        '',
        '# Comprobar sin reparar (informe)',
        '$ sudo fsck -n /dev/nvme0n1p2',
        '',
        '# Reparar de forma interactiva',
        '$ sudo fsck /dev/nvme0n1p2',
        '',
        '# Reparar automáticamente (responde "sí" a todo)',
        '$ sudo fsck -y /dev/nvme0n1p2',
        '',
        '# Forzar comprobación en el próximo arranque, sin USB:',
        '$ sudo touch /forcefsck',
        '$ sudo reboot',
        '',
        '# Comprobar sectores defectuosos (lento, horas en discos grandes)',
        '$ sudo badblocks -sv /dev/sdb'
      ]},
      { type: 'callout', variant: 'danger', title: 'fsck sobre un disco montado corrompe datos',
        html: '<p><code>fsck</code> asume acceso exclusivo. Si lo ejecutas sobre una partición montada en lectura-escritura, sus reparaciones chocan con las escrituras del sistema y <b>agravan</b> el daño. Desmonta primero, o hazlo desde un USB en vivo.</p><p>Si el disco da errores de lectura (revisa <code>journalctl -k -p err</code>), <b>no ejecutes fsck</b>: clona primero la imagen con <code>ddrescue</code> y trabaja sobre la copia.</p>' }
    ]
  });

  C.registrar({
    id: 'resc-datos',
    group: 'rescate',
    title: 'Rescatar datos y crear un USB de arranque',
    level: 'avanzado',
    tags: ['ddrescue', 'testdisk', 'photorec', 'dd', 'usb arranque'],
    lead: 'Cuando el disco falla, el orden de las operaciones lo decide todo: <b>primero clonar, después reparar</b>. Cada intento de recuperación sobre un disco moribundo reduce las probabilidades del siguiente.',
    blocks: [
      { type: 'callout', variant: 'danger', title: 'La regla de oro de la recuperación',
        html: '<ol><li><b>Deja de escribir en el disco inmediatamente.</b> Desmóntalo. Si es el disco del sistema, apaga y arranca desde un USB.</li><li><b>Clona antes de tocar nada</b> con <code>ddrescue</code>. Trabaja siempre sobre la copia.</li><li>Si son datos irremplazables y el disco hace ruidos mecánicos, <b>para y valora un servicio profesional</b>: cada encendido puede ser el último.</li></ol>' },
      { type: 'h2', id: 'clonar', text: 'Clonar el disco dañado' },
      { type: 'cmd', label: 'ddrescue: soporta sectores ilegibles', lines: [
        '$ sudo apt install gddrescue',
        '',
        '# Clonar a un ARCHIVO de imagen (necesitas otro disco con espacio).',
        '# El archivo de registro (mapfile) permite REANUDAR: no lo pierdas.',
        '$ sudo ddrescue -d -r3 /dev/sdb /mnt/rescate/imagen.img /mnt/rescate/mapa.log',
        '#   -d  acceso directo, evita la caché del kernel',
        '#   -r3 hasta 3 reintentos en los sectores con error',
        '',
        '# Primera pasada rápida, sin insistir en los sectores malos:',
        '$ sudo ddrescue -n -d /dev/sdb imagen.img mapa.log',
        '# Segunda pasada, ya solo sobre lo que falló:',
        '$ sudo ddrescue -d -r3 /dev/sdb imagen.img mapa.log',
        '',
        '# Montar la imagen en solo lectura para explorarla',
        '$ sudo mkdir -p /mnt/imagen',
        '$ sudo mount -o ro,loop imagen.img /mnt/imagen',
        '',
        '# Si la imagen contiene todo el disco (con tabla de particiones):',
        '$ sudo losetup -fP --show imagen.img',
        '| /dev/loop0',
        '$ sudo mount -o ro /dev/loop0p1 /mnt/imagen'
      ]},
      { type: 'callout', variant: 'warn', title: 'ddrescue frente a dd',
        html: '<p><code>dd</code> se <b>detiene</b> al primer error de lectura, dejando la copia incompleta e inservible. <code>ddrescue</code> salta los sectores ilegibles, sigue con el resto y luego reintenta solo los fallidos. Para un disco dañado, <code>dd</code> es la herramienta equivocada.</p>' },
      { type: 'h2', id: 'recuperar', text: 'Recuperar particiones y archivos borrados' },
      { type: 'cmd', label: 'testdisk y photorec', lines: [
        '$ sudo apt install testdisk',
        '',
        '# testdisk: recuperar la TABLA DE PARTICIONES perdida',
        '# Trabaja sobre la IMAGEN, no sobre el disco original',
        '$ sudo testdisk imagen.img',
        '#   → Proceed → tipo de tabla → Analyse → Quick Search',
        '#   Si encuentra las particiones: Write (y reinicia)',
        '',
        '# photorec: recuperar ARCHIVOS por su firma, ignorando el',
        '# sistema de archivos. Funciona aunque la tabla esté destruida.',
        '# Pierde los nombres originales, pero recupera el contenido.',
        '$ sudo photorec imagen.img',
        '#   → elige la partición → File Opt (filtra por tipo) → Search',
        '#   → elige un DESTINO EN OTRO DISCO',
        '',
        '# En un ext4, si acabas de borrar un archivo:',
        '$ sudo apt install extundelete',
        '$ sudo extundelete /dev/sdb1 --restore-file ruta/al/archivo.txt'
      ]},
      { type: 'callout', variant: 'tip', title: 'El destino de la recuperación va en otro disco',
        html: '<p>Nunca recuperes archivos <b>al mismo disco</b> del que los estás rescatando: cada archivo escrito puede sobrescribir precisamente los datos que aún no has recuperado.</p>' },

      { type: 'h2', id: 'usb', text: 'Crear un USB de arranque' },
      { type: 'cmd', label: 'Con dd (la forma estándar en Linux)', lines: [
        '# 1. Verificar la ISO descargada (comprueba que no está corrupta)',
        '$ sha256sum ubuntu-24.04.1-desktop-amd64.iso',
        '# Compara el resultado con el SHA256SUMS oficial de la web',
        '',
        '# 2. IDENTIFICAR el USB. Comprueba el TAMAÑO, no la letra.',
        '$ lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,MODEL',
        '| sdb    14,6G disk        SanDisk Ultra   ← este es el USB',
        '| nvme0n1 476G disk                        ← este es tu SISTEMA',
        '',
        '# 3. Desmontar (pero NO formatear)',
        '$ sudo umount /dev/sdb*',
        '',
        '# 4. Escribir la ISO al DISCO COMPLETO (sdb), no a una partición (sdb1)',
        '$ sudo dd if=ubuntu-24.04.1-desktop-amd64.iso of=/dev/sdb \\',
        '    bs=4M status=progress oflag=sync',
        '',
        '# 5. Asegurar que se ha volcado todo antes de retirarlo',
        '$ sync',
        '',
        '# Alternativas gráficas más seguras (verifican el destino):',
        '#   Discos de GNOME → "Restaurar imagen de disco"',
        '#   balenaEtcher, o Ventoy (permite varias ISO en un mismo USB)'
      ]},
      { type: 'callout', variant: 'danger', title: 'dd no perdona un error de letra',
        html: '<p><code>dd</code> se apoda «disk destroyer» con razón: no pide confirmación, no comprueba nada y sobrescribe lo que le indiques. Escribir <code>of=/dev/sda</code> en lugar de <code>of=/dev/sdb</code> destruye tu instalación en segundos.</p><p><b>Verifica el destino tres veces</b> con <code>lsblk</code>, comparando por tamaño y modelo. Y si es tu primera vez, usa una herramienta gráfica: comprueban que el destino sea un dispositivo extraíble.</p>' },
      { type: 'h2', id: 'kit', text: 'Kit de emergencia: prepáralo antes de necesitarlo' },
      { type: 'grid', cols: 2, items: [
        { t: 'USB en vivo de Ubuntu', html: 'Hazlo <b>ahora</b>, mientras el sistema funciona. Sirve para chroot, fsck, recuperación de datos y reinstalar GRUB.' },
        { t: 'Copia de /etc y lista de paquetes', html: '<code>sudo tar czf etc-$(date +%F).tar.gz /etc</code> y <code>dpkg --get-selections > paquetes.txt</code>. Reconstruir el sistema con esto es cuestión de minutos.' },
        { t: 'Los UUID de tus particiones', html: '<code>sudo blkid > uuids.txt</code>. Imprescindible para reparar <code>/etc/fstab</code> o GRUB desde un USB.' },
        { t: 'Copia de /etc/fstab', html: '<code>sudo cp /etc/fstab /etc/fstab.bak</code> antes de cada edición. Es el archivo que más veces impide arrancar.' },
        { t: 'Respaldo real de ~', html: '<code>rsync -ah --delete ~/ /mnt/usb/home/</code>. Ninguna técnica de recuperación sustituye a una copia reciente.' },
        { t: 'Anota el modo de arranque', html: '<code>[ -d /sys/firmware/efi ] && echo UEFI || echo BIOS</code>. Determina qué comando de <code>grub-install</code> necesitarás.' }
      ]}
    ]
  });

})(window.Contenido);
