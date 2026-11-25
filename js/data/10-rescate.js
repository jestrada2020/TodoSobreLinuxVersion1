/* 10-rescate.js — plan de emergencia: diagnóstico, GRUB, arranque, paquetes
   rotos, instantáneas y rescate de datos. Cada escenario va en su pestaña. */
(function (C) {
  'use strict';

  /* ======================================================================
     1. TRIAGE
     ====================================================================== */
  C.registrar({
    id: 'resc-triage',
    group: 'rescate',
    title: 'Plan de emergencia: qué falla y por dónde empezar',
    level: 'intermedio',
    tags: ['emergencia', 'no arranca', 'triage', 'usb en vivo', 'kit', 'recuperar sistema'],
    lead: 'Ante un fallo grave, lo primero no es teclear comandos: es <b>identificar en qué fase</b> se rompe el arranque. Cada fase tiene su solución y casi todas se resuelven en diez minutos con un USB en vivo. Reinstalar casi nunca es necesario.',
    blocks: [
      { type: 'sos', title: 'Busca tu síntoma', desc: 'Cada enlace abre directamente la pestaña con la solución.', items: [
        { t: 'grub rescue>', d: 'GRUB no encuentra su configuración', href: 'resc-grub/grub-rescue' },
        { t: 'No aparece el menú de GRUB', d: 'Reinstalar GRUB (UEFI)', href: 'resc-grub/grub-uefi' },
        { t: 'Windows desapareció del menú', d: 'Arranque dual', href: 'resc-grub/grub-dualboot' },
        { t: 'You are in emergency mode', d: 'Revisar /etc/fstab', href: 'resc-sistema/sis-emergency' },
        { t: '(initramfs) _', d: 'Reparar la raíz con fsck', href: 'resc-sistema/sis-initramfs' },
        { t: 'Pantalla negra tras GRUB', d: 'nomodeset y driver gráfico', href: 'resc-sistema/sis-negra' },
        { t: 'Vuelve siempre al login', d: 'Bucle de inicio de sesión', href: 'resc-sistema/sis-login' },
        { t: 'Read-only file system', d: 'Disco en solo lectura', href: 'resc-sistema/sis-readonly' },
        { t: 'dpkg was interrupted', d: 'Terminar la configuración', href: 'resc-paquetes/pk-interrumpido' },
        { t: 'Could not get lock', d: 'Bloqueo de apt/dpkg', href: 'resc-paquetes/pk-lock' },
        { t: 'unmet dependencies', d: 'Dependencias rotas', href: 'resc-paquetes/pk-deps' },
        { t: 'Disco con errores / datos perdidos', d: 'Clonar antes de reparar', href: 'resc-datos/clonar' }
      ]},

      { type: 'h2', id: 'fases', text: 'Las seis fases del arranque' },
      { type: 'ascii', text:
'  1. BIOS/UEFI ──► 2. GRUB ──► 3. KERNEL ──► 4. INITRAMFS ──► 5. SYSTEMD ──► 6. LOGIN\n' +
'       │              │            │              │               │            │\n' +
'  Logo del       "grub rescue>"  Pantalla     "(initramfs)"   "emergency    Bucle de\n' +
'  fabricante y   o no aparece    negra tras   "waiting for    mode" o un    inicio de\n' +
'  no avanza      el menú         GRUB         root device"    servicio      sesión\n' +
'                                                              colgado\n' +
'\n' +
'  ¿Ves el menú de GRUB?\n' +
'    NO  → fase 1 o 2: GRUB dañado o la UEFI no apunta a él      → «Reparar GRUB»\n' +
'    SÍ  → fase 3 en adelante: kernel, fstab, disco o gráficos   → «Fallos tras GRUB»' },
      { type: 'table', head: ['Síntoma', 'Fase', 'Dónde está la solución'], monoFirst: false, rows: [
        ['No llega al menú, va directo a la UEFI', '1-2', '<a href="#resc-grub/grub-efi">efibootmgr: orden de arranque</a>'],
        ['<code>grub rescue&gt;</code> o <code>error: unknown filesystem</code>', '2', '<a href="#resc-grub/grub-rescue">Consola grub rescue</a>'],
        ['<code>Minimal BASH-like line editing</code> (prompt <code>grub&gt;</code>)', '2', '<a href="#resc-grub/grub-rescue">Arranque manual desde grub&gt;</a>'],
        ['Pantalla negra tras elegir Ubuntu', '3', '<a href="#resc-sistema/sis-negra">Pantalla negra / NVIDIA</a>'],
        ['Falla tras actualizar el kernel', '3', '<a href="#resc-sistema/sis-kernel">Kernel nuevo roto</a>'],
        ['<code>(initramfs)</code> o <code>waiting for root device</code>', '4', '<a href="#resc-sistema/sis-initramfs">initramfs</a>'],
        ['<code>You are in emergency mode</code>', '4-5', '<a href="#resc-sistema/sis-emergency">fstab</a>'],
        ['Un servicio se queda colgado', '5', '<a href="#resc-sistema/sis-emergency">journalctl -xb</a>'],
        ['Vuelve una y otra vez al login', '6', '<a href="#resc-sistema/sis-login">Bucle de login</a>'],
        ['Arranca, pero apt está roto', '—', '<a href="#resc-paquetes">Paquetes rotos</a>']
      ]},

      { type: 'h2', id: 'protocolo', text: 'Protocolo de actuación' },
      { type: 'steps', items: [
        { t: 'No reinstales ni formatees',
          html: '<p>Reinstalar borra justo lo que quieres salvar. El 95 % de los fallos de arranque se reparan sin tocar tus datos.</p>' },
        { t: 'Prueba primero el menú de GRUB',
          html: '<p>Kernel anterior, modo de recuperación o <code>nomodeset</code>. No necesita USB. Ver <a href="#resc-grub/grub-menu">Menú de GRUB</a>.</p>' },
        { t: 'Si no basta, arranca desde un USB en vivo',
          html: '<p>Elige «Probar Ubuntu». Desde ahí tienes acceso a tus discos, a internet y a <code>chroot</code>.</p>',
          cmd: { label: 'Primeros comandos en el USB en vivo', lines: [
            '# ¿El equipo arrancó en modo UEFI o BIOS? Determina el comando de GRUB',
            '$ [ -d /sys/firmware/efi ] && echo UEFI || echo BIOS',
            '',
            '# Discos, particiones, sistemas de archivos y etiquetas',
            '$ sudo lsblk -f',
            '$ sudo fdisk -l',
            '',
            '# ¿El disco da errores de lectura? Si sí: CLONA antes de reparar',
            '$ sudo dmesg | grep -iE "i/o error|medium error|ata.*error" | tail'
          ]}
        },
        { t: 'Si hay errores de disco, salva los datos antes de reparar',
          html: '<p>Con un disco que falla, cada reparación es un riesgo. Ve a <a href="#resc-datos">Rescatar datos</a> y clona con <code>ddrescue</code>.</p>' },
        { t: 'Repara la fase concreta y verifica',
          html: '<p>Una sola reparación cada vez, reinicia y comprueba. Si cambias diez cosas a la vez no sabrás cuál lo arregló, ni cuál lo empeoró.</p>' }
      ]},

      { type: 'h2', id: 'kit', text: 'Kit de emergencia: prepáralo hoy' },
      { type: 'prose', html: '<p>Todo lo que vas a necesitar cuando el sistema no arranque tiene que existir <b>antes</b> del fallo. Este script guarda en un USB la información que te pedirá cualquier reparación:</p>' },
      { type: 'cmd', label: 'Guardar el kit en un USB (montado en /media/$USER/RESCATE)', lines: [
        '$ KIT="/media/$USER/RESCATE/kit-$(hostname)-$(date +%F)"',
        '$ mkdir -p "$KIT"',
        '',
        '# Modo de arranque, discos, UUID y fstab: lo que pide GRUB y chroot',
        '$ ( [ -d /sys/firmware/efi ] && echo UEFI || echo BIOS ) > "$KIT/modo-arranque.txt"',
        '$ lsblk -f > "$KIT/lsblk.txt"',
        '$ sudo blkid > "$KIT/blkid.txt"',
        '$ cp /etc/fstab "$KIT/fstab"',
        '$ sudo efibootmgr -v > "$KIT/efibootmgr.txt" 2>/dev/null',
        '',
        '# Lista de paquetes: reconstruir el sistema es cuestión de minutos',
        '$ dpkg --get-selections > "$KIT/paquetes.txt"',
        '$ apt-mark showmanual > "$KIT/paquetes-manuales.txt"',
        '$ snap list > "$KIT/snaps.txt" 2>/dev/null',
        '$ flatpak list --app --columns=application > "$KIT/flatpaks.txt" 2>/dev/null',
        '',
        '# Configuración del sistema y de tu usuario',
        '$ sudo tar czf "$KIT/etc.tar.gz" /etc',
        '$ uname -r > "$KIT/kernel.txt"',
        '$ ls "$KIT"'
      ]},
      { type: 'cmd', label: 'Restaurar los paquetes en un sistema nuevo', lines: [
        '$ sudo apt update',
        '$ xargs -a paquetes-manuales.txt sudo apt install -y',
        '',
        '# Alternativa exacta (todas las selecciones de dpkg)',
        '$ sudo dpkg --set-selections < paquetes.txt',
        '$ sudo apt-get dselect-upgrade -y'
      ]},
      { type: 'grid', cols: 2, items: [
        { t: 'USB en vivo de Ubuntu', html: 'Hazlo <b>ahora</b>, con la misma versión que tienes instalada. Ver <a href="#resc-datos/usb">Crear un USB de arranque</a>.' },
        { t: 'Instantáneas con Timeshift', html: 'Volver a ayer en cinco minutos. Es la mejor póliza contra actualizaciones que rompen el sistema. Ver <a href="#resc-timeshift">Timeshift</a>.' },
        { t: 'Copia de seguridad real de ~', html: '<code>rsync -ah --delete ~/ /media/$USER/RESPALDO/home/</code>. Ninguna técnica de recuperación sustituye a una copia reciente.' },
        { t: 'Copia de /etc/fstab antes de editarlo', html: '<code>sudo cp /etc/fstab /etc/fstab.bak</code>. Es el archivo que más veces impide arrancar.' }
      ]}
    ]
  });

  /* ======================================================================
     2. GRUB
     ====================================================================== */
  C.registrar({
    id: 'resc-grub',
    group: 'rescate',
    title: 'Reparar GRUB paso a paso',
    level: 'avanzado',
    tags: ['grub', 'grub rescue', 'chroot', 'uefi', 'bios', 'boot-repair', 'efibootmgr', 'dual boot', 'update-grub', 'grub-install'],
    lead: 'GRUB es el cargador que enlaza la UEFI con el kernel. Cuando se rompe, el sistema sigue intacto en el disco: solo hay que <b>volver a decirle dónde está</b>. Elige la pestaña que corresponde a lo que ves en pantalla.',
    blocks: [
      { type: 'callout', variant: 'warn', title: 'Dos datos que necesitas antes de empezar',
        html: '<p><b>1. ¿UEFI o BIOS?</b> <code>[ -d /sys/firmware/efi ] && echo UEFI || echo BIOS</code> (ejecútalo en el USB en vivo arrancado en el mismo modo que tu sistema). Los comandos de <code>grub-install</code> son distintos y usar el equivocado no arregla nada.</p><p><b>2. ¿Cuál es tu partición raíz y cuál la EFI?</b> <code>sudo lsblk -f</code>: la EFI es <code>vfat</code> de 100 MB a 1 GB; la raíz suele ser <code>ext4</code> o <code>btrfs</code> y la más grande. En los ejemplos se usa <code>/dev/nvme0n1p1</code> (EFI) y <code>/dev/nvme0n1p2</code> (raíz); en discos SATA serán <code>/dev/sda1</code> y <code>/dev/sda2</code>.</p>' },

      { type: 'tabs', id: 'grub-tabs', title: 'Escenarios de GRUB', items: [

        /* ---------------- 1. Menú ---------------- */
        { id: 'grub-menu', n: '1', t: 'Menú de GRUB', badge: 'sin USB', badgeVariant: 'ok',
          lead: 'El primer intento siempre: no necesita herramientas y no cambia nada de forma permanente.',
          blocks: [
            { type: 'cmd', label: 'Hacer aparecer el menú y usarlo', lines: [
              '# Al encender: mantén Shift (BIOS) o pulsa Esc repetidamente (UEFI)',
              '',
              '# Opciones del menú:',
              '#   "Advanced options for Ubuntu" → elige el KERNEL ANTERIOR',
              '#   "... (recovery mode)"         → menú: clean, dpkg, fsck, network, root',
              '',
              '# Editar la entrada solo para este arranque: pulsa "e",',
              '# busca la línea que empieza por "linux" y añade al final uno de estos',
              '# parámetros. Arranca con Ctrl+X o F10.'
            ]},
            { type: 'table', head: ['Parámetro del kernel', 'Para qué sirve'], rows: [
              ['nomodeset', 'Desactiva el driver gráfico del kernel. Resuelve la mayoría de las pantallas negras'],
              ['systemd.unit=multi-user.target', 'Arranca sin entorno gráfico, en consola de texto'],
              ['systemd.unit=rescue.target', 'Modo rescate: root, sistemas montados, sin red'],
              ['systemd.unit=emergency.target', 'Mínimo absoluto: raíz en solo lectura, nada más'],
              ['init=/bin/bash', 'Shell directa sin systemd. Último recurso (p. ej. contraseña olvidada)'],
              ['fsck.mode=force fsck.repair=yes', 'Fuerza la comprobación y reparación del disco al arrancar'],
              ['acpi=off / noapic', 'Equipos que se cuelgan al inicio por problemas de ACPI']
            ]},
            { type: 'cmd', label: 'Hacer permanente un cambio (ya dentro del sistema)', lines: [
              '$ sudo cp /etc/default/grub /etc/default/grub.bak',
              '$ sudo nano /etc/default/grub',
              '|   GRUB_TIMEOUT_STYLE=menu        ← muestra siempre el menú',
              '|   GRUB_TIMEOUT=5',
              '|   GRUB_CMDLINE_LINUX_DEFAULT="quiet splash nomodeset"',
              '|   GRUB_DEFAULT=saved             ← recuerda la última entrada elegida',
              '|   GRUB_SAVEDEFAULT=true',
              '',
              '# Sin este paso los cambios NO se aplican',
              '$ sudo update-grub'
            ]}
          ]
        },

        /* ---------------- 2. grub rescue ---------------- */
        { id: 'grub-rescue', n: '2', t: 'grub rescue>', badge: 'sin USB', badgeVariant: 'ok',
          lead: 'GRUB arrancó pero no encuentra sus módulos ni su configuración (suele pasar tras redimensionar o mover particiones). Se puede arrancar a mano y repararlo desde dentro.',
          blocks: [
            { type: 'cmd', label: 'Prompt «grub rescue>»: localizar la raíz y cargar el modo normal', lines: [
              '# 1. Lista discos y particiones que ve GRUB',
              'grub rescue> ls',
              '| (hd0) (hd0,gpt1) (hd0,gpt2) (hd0,gpt3)',
              '',
              '# 2. Prueba cada partición hasta ver tu sistema (carpetas boot/ etc/ home/)',
              'grub rescue> ls (hd0,gpt2)/',
              '| ./ ../ lost+found/ boot/ etc/ home/ usr/ var/ ...   ← esta es la raíz',
              '',
              '# 3. Indica dónde está GRUB y carga el modo normal',
              'grub rescue> set root=(hd0,gpt2)',
              'grub rescue> set prefix=(hd0,gpt2)/boot/grub',
              'grub rescue> insmod normal',
              'grub rescue> normal',
              '',
              '# Si /boot está en una partición aparte, el prefix NO lleva /boot:',
              '#   set prefix=(hd0,gpt3)/grub'
            ]},
            { type: 'cmd', label: 'Prompt «grub>»: arrancar el kernel a mano', lines: [
              '# Aparece "Minimal BASH-like line editing is supported"',
              'grub> ls (hd0,gpt2)/boot',
              'grub> set root=(hd0,gpt2)',
              'grub> linux /boot/vmlinuz root=/dev/nvme0n1p2 ro',
              'grub> initrd /boot/initrd.img',
              'grub> boot',
              '',
              '# Si no sabes el nombre del dispositivo, usa el UUID (más fiable):',
              'grub> search --no-floppy --fs-uuid --set=root TU-UUID',
              'grub> linux /boot/vmlinuz root=UUID=TU-UUID ro'
            ]},
            { type: 'cmd', label: 'Ya dentro del sistema: dejarlo arreglado de forma permanente', lines: [
              '# UEFI',
              '$ sudo grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=ubuntu',
              '# BIOS (al DISCO, no a la partición)',
              '$ sudo grub-install /dev/sda',
              '',
              '$ sudo update-grub'
            ]},
            { type: 'callout', variant: 'tip', title: 'Si «ls» devuelve «unknown filesystem» en todas',
              html: '<p>GRUB no tiene cargado el módulo del sistema de archivos. Prueba <code>insmod ext2</code> (sirve para ext2/3/4), <code>insmod btrfs</code> o <code>insmod part_gpt</code> antes de <code>ls</code>. Si sigue sin verlas, la raíz está cifrada o en LVM: ve a la pestaña <a href="#resc-grub/grub-lvm">Cifrado / LVM / Btrfs</a>.</p>' }
          ]
        },

        /* ---------------- 3. UEFI chroot ---------------- */
        { id: 'grub-uefi', n: '3', t: 'Reinstalar (UEFI)', badge: 'USB en vivo', badgeVariant: 'warn',
          lead: 'El caso más frecuente en equipos posteriores a 2012. Reinstala GRUB en la partición EFI desde un USB en vivo arrancado <b>en modo UEFI</b>.',
          blocks: [
            { type: 'steps', items: [
              { t: 'Comprobar el modo y localizar particiones',
                cmd: { label: 'En el USB en vivo', lines: [
                  '$ [ -d /sys/firmware/efi ] && echo UEFI || echo BIOS',
                  '| UEFI',
                  '$ sudo lsblk -f',
                  '| nvme0n1p1  vfat   FAT32       ← EFI (~512 MB)',
                  '| nvme0n1p2  ext4   1.0         ← raíz /'
                ]}
              },
              { t: 'Montar la raíz, la EFI y los sistemas virtuales',
                html: '<p>Los montajes <code>--bind</code> son imprescindibles: sin ellos <code>grub-install</code> y <code>apt</code> fallan dentro del chroot. <code>/sys/firmware/efi/efivars</code> hace falta para escribir la entrada de arranque en la UEFI.</p>',
                cmd: { label: 'Montar', lines: [
                  '$ sudo mount /dev/nvme0n1p2 /mnt',
                  '$ sudo mount /dev/nvme0n1p1 /mnt/boot/efi',
                  '# Si /boot está separado:  sudo mount /dev/nvme0n1pX /mnt/boot  (ANTES que la EFI)',
                  '',
                  '$ for d in dev dev/pts proc sys run; do sudo mount --bind /$d /mnt/$d; done',
                  '$ sudo mount --bind /sys/firmware/efi/efivars /mnt/sys/firmware/efi/efivars 2>/dev/null',
                  '',
                  '# Red dentro del chroot (para apt)',
                  '$ sudo cp /etc/resolv.conf /mnt/etc/resolv.conf'
                ]}
              },
              { t: 'Entrar y reinstalar',
                cmd: { label: 'Dentro del chroot', lines: [
                  '$ sudo chroot /mnt /bin/bash',
                  '',
                  'chroot> grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=ubuntu --recheck',
                  'chroot> update-grub',
                  '',
                  '# Si falta el paquete o está dañado:',
                  'chroot> apt install --reinstall grub-efi-amd64-signed shim-signed',
                  '',
                  '# Comprueba que la entrada "ubuntu" existe en la UEFI',
                  'chroot> efibootmgr -v'
                ]}
              },
              { t: 'Salir limpiamente y reiniciar',
                cmd: { label: 'Salir', lines: [
                  'chroot> exit',
                  '$ sudo umount -R /mnt',
                  '$ sudo reboot'
                ]}
              }
            ]},
            { type: 'callout', variant: 'danger', title: 'Errores típicos',
              html: '<ul><li><code>EFI variables are not supported on this system</code>: el USB arrancó en modo BIOS/Legacy. Reinicia y elige la entrada <b>UEFI:</b> del USB en el menú de arranque del firmware.</li><li><code>cannot find EFI directory</code>: no montaste la partición EFI en <code>/mnt/boot/efi</code>.</li><li><code>failed to get canonical path of /cow</code>: ejecutaste <code>grub-install</code> fuera del chroot.</li></ul>' }
          ]
        },

        /* ---------------- 4. BIOS ---------------- */
        { id: 'grub-bios', n: '4', t: 'Reinstalar (BIOS)', badge: 'USB en vivo', badgeVariant: 'warn',
          lead: 'Para equipos antiguos o instalaciones en modo Legacy/CSM. GRUB se escribe en el sector de arranque del <b>disco</b>.',
          blocks: [
            { type: 'cmd', label: 'BIOS/Legacy con chroot', lines: [
              '$ sudo mount /dev/sda2 /mnt',
              '$ for d in dev dev/pts proc sys run; do sudo mount --bind /$d /mnt/$d; done',
              '$ sudo chroot /mnt /bin/bash',
              '',
              '# Al DISCO (sda), nunca a la partición (sda1)',
              'chroot> grub-install --target=i386-pc --recheck /dev/sda',
              'chroot> update-grub',
              'chroot> exit',
              '',
              '$ sudo umount -R /mnt && sudo reboot'
            ]},
            { type: 'callout', variant: 'warn', title: 'GPT + BIOS necesita una partición bios_grub',
              html: '<p>Si el disco usa tabla <b>GPT</b> pero el equipo arranca en BIOS, <code>grub-install</code> falla con <code>this GPT partition label contains no BIOS Boot Partition</code>. Hace falta una partición de 1 MB sin formato con el indicador <code>bios_grub</code> (créala con GParted en espacio libre). Comprueba la tabla con <code>sudo parted /dev/sda print</code>.</p>' }
          ]
        },

        /* ---------------- 5. Boot-Repair ---------------- */
        { id: 'grub-bootrepair', n: '5', t: 'Boot-Repair', badge: 'automático', badgeVariant: 'info',
          lead: 'Herramienta gráfica que detecta y aplica la reparación habitual por ti. Muy útil si no te sientes cómodo con chroot.',
          blocks: [
            { type: 'cmd', label: 'En el USB en vivo, con internet', lines: [
              '$ sudo add-apt-repository ppa:yannubuntu/boot-repair -y',
              '$ sudo apt update',
              '$ sudo apt install -y boot-repair',
              '$ boot-repair'
            ]},
            { type: 'steps', items: [
              { t: 'Pulsa «Reparación recomendada»', html: '<p>Cubre la mayoría de los casos: reinstala GRUB, regenera la configuración y corrige la entrada UEFI.</p>' },
              { t: 'Sigue las instrucciones en pantalla', html: '<p>A veces pide copiar y ejecutar comandos en una terminal (por ejemplo, para purgar e instalar GRUB). Hazlo en el orden indicado.</p>' },
              { t: 'Guarda la URL del informe', html: '<p>Al terminar muestra un enlace con el diagnóstico completo. Es lo que debes compartir si pides ayuda en un foro.</p>' }
            ]},
            { type: 'callout', variant: 'info', title: 'Solo diagnóstico',
              html: '<p>En «Opciones avanzadas» puedes generar únicamente el informe (<i>Create a BootInfo summary</i>) sin cambiar nada: útil para entender qué está pasando antes de tocar.</p>' }
          ]
        },

        /* ---------------- 6. efibootmgr ---------------- */
        { id: 'grub-efi', n: '6', t: 'UEFI: efibootmgr',
          lead: 'GRUB está bien instalado pero la UEFI arranca otra cosa (o nada). Se corrige editando las entradas de arranque del firmware.',
          blocks: [
            { type: 'cmd', label: 'Ver, ordenar, crear y borrar entradas UEFI', lines: [
              '$ sudo efibootmgr -v',
              '| BootOrder: 0001,0000,0003',
              '| Boot0000* ubuntu   HD(1,GPT,...)/File(\\EFI\\ubuntu\\shimx64.efi)',
              '| Boot0001* Windows Boot Manager',
              '',
              '# Poner Ubuntu primero',
              '$ sudo efibootmgr -o 0000,0001,0003',
              '',
              '# Crear la entrada si no existe (-d disco, -p número de partición EFI)',
              '$ sudo efibootmgr -c -d /dev/nvme0n1 -p 1 -L "ubuntu" -l "\\EFI\\ubuntu\\shimx64.efi"',
              '',
              '# Borrar una entrada obsoleta o duplicada',
              '$ sudo efibootmgr -b 0003 -B',
              '',
              '# Arrancar una entrada solo la próxima vez',
              '$ sudo efibootmgr -n 0001'
            ]},
            { type: 'cmd', label: 'Firmware que ignora las entradas: ruta de respaldo', lines: [
              '# Algunas placas solo arrancan \\EFI\\BOOT\\BOOTX64.EFI',
              '$ sudo mkdir -p /boot/efi/EFI/BOOT',
              '$ sudo cp /boot/efi/EFI/ubuntu/shimx64.efi /boot/efi/EFI/BOOT/BOOTX64.EFI',
              '$ sudo cp /boot/efi/EFI/ubuntu/grubx64.efi /boot/efi/EFI/BOOT/',
              '',
              '# Secure Boot: ¿está activo?',
              '$ mokutil --sb-state'
            ]},
            { type: 'callout', variant: 'tip', title: 'Secure Boot y drivers de terceros',
              html: '<p>Con Secure Boot activo, Ubuntu arranca con <code>shimx64.efi</code> (firmado). Los módulos de terceros (NVIDIA, VirtualBox) requieren registrar una clave MOK: el sistema la pide en una pantalla azul tras instalarlos. Si la saltas, el driver no carga y la pantalla puede quedarse negra.</p>' }
          ]
        },

        /* ---------------- 7. Dual boot ---------------- */
        { id: 'grub-dualboot', n: '7', t: 'Dual boot con Windows',
          lead: 'Windows desaparece del menú, o una actualización de Windows hace que el equipo arranque directamente en él.',
          blocks: [
            { type: 'cmd', label: 'Windows no aparece en el menú de GRUB', lines: [
              '# Desde Ubuntu 22.04, os-prober viene desactivado por defecto',
              '$ sudo apt install os-prober',
              '$ echo "GRUB_DISABLE_OS_PROBER=false" | sudo tee -a /etc/default/grub',
              '$ sudo os-prober',
              '| /dev/nvme0n1p1@/EFI/Microsoft/Boot/bootmgfw.efi:Windows Boot Manager:Windows:efi',
              '$ sudo update-grub'
            ]},
            { type: 'cmd', label: 'Tras una actualización de Windows ya no aparece GRUB', lines: [
              '# Windows se ha puesto primero en el orden UEFI. Desde Ubuntu (o el USB):',
              '$ sudo efibootmgr',
              '$ sudo efibootmgr -o 0000,0001     # ubuntu primero',
              '',
              '# Alternativa desde Windows (cmd como administrador):',
              '#   bcdedit /set {bootmgr} path \\EFI\\ubuntu\\shimx64.efi'
            ]},
            { type: 'callout', variant: 'warn', title: 'Antes de tocar nada en un equipo con Windows',
              html: '<ul><li><b>Desactiva el «Inicio rápido»</b> de Windows (Panel de control → Opciones de energía): deja el disco NTFS en estado hibernado y Linux lo monta solo en lectura.</li><li><b>BitLocker:</b> cambiar el orden de arranque puede pedir la clave de recuperación de Windows. Tenla a mano (cuenta de Microsoft) antes de usar <code>efibootmgr</code>.</li></ul>' }
          ]
        },

        /* ---------------- 8. LUKS / LVM / Btrfs ---------------- */
        { id: 'grub-lvm', n: '8', t: 'Cifrado / LVM / Btrfs',
          lead: 'Si instalaste con cifrado o con Btrfs, la raíz no se monta con un simple <code>mount</code>. Estos pasos van antes del chroot.',
          blocks: [
            { type: 'cmd', label: 'Abrir LUKS y activar LVM', lines: [
              '$ sudo lsblk -f',
              '| nvme0n1p3  crypto_LUKS          ← partición cifrada',
              '',
              '$ sudo cryptsetup open /dev/nvme0n1p3 dm_crypt-0',
              '$ sudo vgscan && sudo vgchange -ay',
              '$ sudo lvs',
              '| root  ubuntu-vg   ...',
              '',
              '$ sudo mount /dev/ubuntu-vg/root /mnt          # o /dev/mapper/ubuntu--vg-ubuntu--lv',
              '$ sudo mount /dev/nvme0n1p2 /mnt/boot          # /boot sin cifrar',
              '$ sudo mount /dev/nvme0n1p1 /mnt/boot/efi',
              '# … y sigue con los --bind y el chroot de la pestaña UEFI'
            ]},
            { type: 'cmd', label: 'Btrfs con subvolúmenes (@ y @home)', lines: [
              '$ sudo mount -o subvol=@ /dev/nvme0n1p2 /mnt',
              '$ sudo mount -o subvol=@home /dev/nvme0n1p2 /mnt/home',
              '',
              '# ¿Qué subvolúmenes hay?',
              '$ sudo mount /dev/nvme0n1p2 /tmp/btr && sudo btrfs subvolume list /tmp/btr'
            ]},
            { type: 'callout', variant: 'info', title: 'Al terminar, cierra en orden inverso',
              html: '<p><code>sudo umount -R /mnt</code>, después <code>sudo vgchange -an</code> y por último <code>sudo cryptsetup close dm_crypt-0</code>.</p>' }
          ]
        }
      ]},

      { type: 'h2', id: 'verificar-grub', text: 'Verificar que ha quedado bien' },
      { type: 'cmd', label: 'Tras reiniciar en el sistema reparado', lines: [
        '# GRUB y su configuración',
        '$ sudo grub-install --version',
        '$ ls /boot/grub/grub.cfg && grep -c menuentry /boot/grub/grub.cfg',
        '',
        '# Entrada UEFI apuntando a Ubuntu y en primer lugar',
        '$ sudo efibootmgr | head -3',
        '',
        '# Kernels disponibles en el menú',
        '$ ls /boot/vmlinuz-*',
        '',
        '# Errores del arranque actual',
        '$ journalctl -b -p err --no-pager | head -30'
      ]}
    ]
  });

  /* ======================================================================
     3. FALLOS DESPUÉS DE GRUB
     ====================================================================== */
  C.registrar({
    id: 'resc-sistema',
    group: 'rescate',
    title: 'Fallos tras GRUB: kernel, fstab, disco y gráficos',
    level: 'avanzado',
    tags: ['emergency mode', 'fstab', 'initramfs', 'nomodeset', 'nvidia', 'fsck', 'solo lectura', 'login', 'contraseña', 'kernel'],
    lead: 'El menú de GRUB aparece, pero el sistema no termina de arrancar. Aquí el problema está en el kernel, en el disco, en <code>/etc/fstab</code> o en el entorno gráfico. Cada pestaña es un escenario.',
    blocks: [
      { type: 'callout', variant: 'tip', title: 'La consola de texto casi siempre funciona',
        html: '<p>Aunque el escritorio no cargue, pulsa <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F3</kbd> para abrir una consola de texto e inicia sesión con tu usuario. Muchas reparaciones de esta página se hacen desde ahí, sin USB. Para volver al gráfico: <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd> o <kbd>F2</kbd>.</p>' },

      { type: 'tabs', id: 'sistema-tabs', title: 'Escenarios', items: [

        { id: 'sis-emergency', n: '1', t: 'Emergency mode / fstab',
          lead: '<code>You are in emergency mode. After logging in, type "journalctl -xb"…</code> Casi siempre es una línea de <code>/etc/fstab</code> que apunta a un disco que ya no existe o con un UUID incorrecto.',
          blocks: [
            { type: 'cmd', label: 'Diagnóstico y corrección desde el propio modo de emergencia', lines: [
              '# Pulsa Enter para obtener la shell de root',
              '# 1. ¿Qué falló? Busca líneas en rojo con "mount" o "dev-disk"',
              '$ journalctl -xb -p err --no-pager | tail -40',
              '',
              '# 2. Valida fstab sin reiniciar (util-linux)',
              '$ findmnt --verify --verbose',
              '',
              '# 3. Compara los UUID reales con los de fstab',
              '$ blkid',
              '$ cat /etc/fstab',
              '',
              '# 4. La raíz suele estar en solo lectura: remóntala para poder editar',
              '$ mount -o remount,rw /',
              '$ cp /etc/fstab /etc/fstab.roto',
              '$ nano /etc/fstab',
              '#    Corrige el UUID, comenta la línea (#) o añade "nofail" a discos extraíbles',
              '',
              '# 5. Prueba que todo monta y reinicia',
              '$ systemctl daemon-reload',
              '$ mount -a && reboot'
            ]},
            { type: 'cmd', label: 'Línea de fstab segura para un disco que no siempre está', lines: [
              '# nofail: si falta, arranca igual. x-systemd.device-timeout: no espera 90 s',
              'UUID=1234-ABCD  /mnt/datos  ext4  defaults,nofail,x-systemd.device-timeout=5s  0  2'
            ]},
            { type: 'callout', variant: 'warn', title: 'Si tienes la copia de seguridad',
              html: '<p><code>cp /etc/fstab.bak /etc/fstab</code> y reinicia. Por eso conviene copiar fstab antes de cada edición.</p>' }
          ]
        },

        { id: 'sis-readonly', n: '2', t: 'Disco en solo lectura',
          lead: '<code>Read-only file system</code> al guardar o instalar. El kernel remonta la raíz en solo lectura cuando detecta errores, para protegerla.',
          blocks: [
            { type: 'cmd', label: 'Averiguar por qué', lines: [
              '$ findmnt -no OPTIONS /',
              '| ro,relatime,errors=remount-ro',
              '',
              '# Errores de ext4 o de hardware en el registro del kernel',
              '$ sudo dmesg | grep -iE "ext4-fs error|i/o error|remount" | tail -20',
              '',
              '# Salud del disco (SMART)',
              '$ sudo apt install smartmontools',
              '$ sudo smartctl -H /dev/nvme0n1',
              '$ sudo smartctl -a /dev/sda | grep -iE "reallocated|pending|uncorrect"'
            ]},
            { type: 'cmd', label: 'Reparar', lines: [
              '# Temporal: volver a lectura/escritura (si no hay errores de hardware)',
              '$ sudo mount -o remount,rw /',
              '',
              '# Definitivo: fsck de la raíz en el próximo arranque',
              '$ sudo touch /forcefsck            # o el parámetro fsck.mode=force en GRUB',
              '$ sudo reboot'
            ]},
            { type: 'callout', variant: 'danger', title: 'Con errores de I/O o sectores reasignados',
              html: '<p>El disco está fallando físicamente. <b>Haz copia de tus datos ya</b> y no ejecutes reparaciones largas: ve a <a href="#resc-datos/clonar">Clonar el disco dañado</a>.</p>' }
          ]
        },

        { id: 'sis-initramfs', n: '3', t: '(initramfs)',
          lead: 'El arranque se detiene en el prompt <code>(initramfs)</code> o en <code>Gave up waiting for root device</code>. El sistema mínimo no puede montar tu raíz: o está dañada, o el UUID no coincide.',
          blocks: [
            { type: 'cmd', label: 'Reparación directa desde el prompt (initramfs)', lines: [
              '# El mensaje suele indicar la partición, p. ej. /dev/nvme0n1p2',
              '(initramfs) blkid',
              '(initramfs) fsck -y /dev/nvme0n1p2',
              '(initramfs) exit',
              '',
              '# ¿Qué raíz espera el kernel? Compárala con blkid',
              '(initramfs) cat /proc/cmdline'
            ]},
            { type: 'cmd', label: 'Si el UUID no coincide o el initramfs está corrupto (USB + chroot)', lines: [
              '# Monta y entra como en «Reparar GRUB → Reinstalar (UEFI)», después:',
              'chroot> update-initramfs -u -k all',
              'chroot> update-grub',
              '',
              '# Faltan módulos del disco (NVMe, RAID, LVM)? Reinstala las herramientas',
              'chroot> apt install --reinstall initramfs-tools lvm2 cryptsetup-initramfs'
            ]}
          ]
        },

        { id: 'sis-negra', n: '4', t: 'Pantalla negra / NVIDIA',
          lead: 'Tras elegir Ubuntu la pantalla se queda negra o con el cursor parpadeando. Casi siempre es el driver gráfico, típico tras actualizar el kernel con una tarjeta NVIDIA.',
          blocks: [
            { type: 'steps', items: [
              { t: 'Arranca con nomodeset', html: '<p>En GRUB pulsa <kbd>e</kbd>, añade <code>nomodeset</code> al final de la línea <code>linux</code> y arranca con <kbd>Ctrl</kbd>+<kbd>X</kbd>. Si entra (en baja resolución), el problema es el driver.</p>' },
              { t: 'Reinstala el driver recomendado',
                cmd: { label: 'Driver NVIDIA', lines: [
                  '$ ubuntu-drivers devices',
                  '| driver   : nvidia-driver-570 - distro non-free recommended',
                  '',
                  '# Quitar por completo el driver actual',
                  '$ sudo apt purge "^nvidia-.*" "^libnvidia-.*"',
                  '$ sudo apt autoremove --purge',
                  '',
                  '# Instalar el recomendado para tu tarjeta y kernel',
                  '$ sudo ubuntu-drivers install',
                  '$ sudo reboot',
                  '',
                  '# Comprobar',
                  '$ nvidia-smi',
                  '$ lsmod | grep -E "nvidia|nouveau"'
                ]}
              },
              { t: 'Si quieres volver al driver libre', cmd: { label: 'nouveau', lines: [
                  '$ sudo apt purge "^nvidia-.*"',
                  '$ sudo rm -f /etc/modprobe.d/blacklist-nvidia-nouveau.conf',
                  '$ sudo update-initramfs -u && sudo reboot'
                ]}
              }
            ]},
            { type: 'callout', variant: 'tip', title: 'Wayland o Xorg',
              html: '<p>Si el escritorio arranca pero se congela o parpadea, prueba la otra sesión: en la pantalla de inicio, el engranaje abajo a la derecha → «Ubuntu en Xorg». Para forzar Xorg: <code>WaylandEnable=false</code> en <code>/etc/gdm3/custom.conf</code>.</p>' }
          ]
        },

        { id: 'sis-kernel', n: '5', t: 'Kernel nuevo roto',
          lead: 'Todo funcionaba hasta la última actualización. Arranca el kernel anterior y retira el que falla.',
          blocks: [
            { type: 'cmd', label: 'Arrancar el anterior y retirar el defectuoso', lines: [
              '# 1. GRUB → "Advanced options for Ubuntu" → kernel anterior',
              '$ uname -r                                    # el que funciona',
              '| 6.8.0-45-generic',
              '$ dpkg -l "linux-image-*" | grep ^ii',
              '',
              '# 2. Quitar SOLO la versión que falla (nunca la que estás usando)',
              '$ sudo apt remove linux-image-6.8.0-47-generic linux-modules-6.8.0-47-generic',
              '$ sudo update-grub',
              '',
              '# 3. Evitar que se reinstale hasta que haya una corrección',
              '$ sudo apt-mark hold linux-image-generic linux-headers-generic',
              '#    (deshacer más adelante: sudo apt-mark unhold linux-image-generic linux-headers-generic)'
            ]},
            { type: 'callout', variant: 'danger', title: 'Deja siempre al menos dos kernels',
              html: '<p>Comprueba <code>uname -r</code> antes de quitar nada. Sin un segundo kernel en el menú, el siguiente fallo te obliga a usar el USB.</p>' }
          ]
        },

        { id: 'sis-login', n: '6', t: 'Bucle de login',
          lead: 'Escribes la contraseña, la pantalla parpadea y vuelve al inicio de sesión. Las tres causas habituales: disco lleno, archivos de tu carpeta con dueño root y driver gráfico.',
          blocks: [
            { type: 'cmd', label: 'Desde la consola de texto (Ctrl+Alt+F3)', lines: [
              '# 1. ¿Disco lleno?',
              '$ df -h / /home',
              '',
              '# 2. ¿Archivos de tu carpeta que pertenecen a root? (por usar sudo con apps gráficas)',
              '$ ls -la ~ | grep -E "Xauthority|ICEauthority|\\.config|\\.cache"',
              '$ sudo chown -R $USER:$USER ~/.Xauthority ~/.ICEauthority ~/.config ~/.cache ~/.local 2>/dev/null',
              '',
              '# 3. Permisos de /tmp',
              '$ ls -ld /tmp',
              '| drwxrwxrwt  ← debe terminar en t',
              '$ sudo chmod 1777 /tmp',
              '',
              '# 4. ¿Qué dice el registro de la sesión?',
              '$ journalctl -b -p err _COMM=gnome-shell --no-pager | tail -20',
              '$ cat ~/.xsession-errors 2>/dev/null | tail',
              '',
              '# 5. Reiniciar el gestor de sesiones',
              '$ sudo systemctl restart gdm3'
            ]},
            { type: 'callout', variant: 'info', title: 'Prueba con un usuario nuevo',
              html: '<p><code>sudo adduser prueba</code> y entra con él. Si funciona, el problema está en tu configuración (<code>~/.config</code>): renómbrala a <code>~/.config.viejo</code> para descartarla sin perderla.</p>' }
          ]
        },

        { id: 'sis-lleno', n: '7', t: 'Disco lleno',
          lead: 'Con la raíz al 100 % fallan el login, apt y casi todo. Libera espacio de forma segura desde la consola.',
          blocks: [
            { type: 'cmd', label: 'Encontrar y liberar espacio', lines: [
              '$ df -h /',
              '',
              '# Qué carpetas ocupan más (sin cruzar a otros discos)',
              '$ sudo du -xh / --max-depth=2 2>/dev/null | sort -rh | head -20',
              '',
              '# Liberadores seguros',
              '$ sudo apt clean',
              '$ sudo apt autoremove --purge',
              '$ sudo journalctl --vacuum-size=200M',
              '$ sudo snap set system refresh.retain=2',
              '$ rm -rf ~/.cache/*',
              '',
              '# Archivos de más de 1 GB',
              '$ sudo find / -xdev -type f -size +1G -exec ls -lh {} + 2>/dev/null',
              '',
              '# ¿Espacio "fantasma"? Archivos borrados que un proceso aún mantiene abiertos',
              '$ sudo lsof +L1 | head'
            ]},
            { type: 'callout', variant: 'tip', title: 'Herramienta interactiva',
              html: '<p><code>sudo apt install ncdu</code> y <code>sudo ncdu -x /</code>: navegas por las carpetas ordenadas por tamaño y borras con <kbd>d</kbd>.</p>' }
          ]
        },

        { id: 'sis-fsck', n: '8', t: 'fsck: reparar el sistema de archivos',
          lead: 'Comprobar y reparar ext4 cuando hay errores de sistema de archivos. Solo sobre particiones <b>desmontadas</b>.',
          blocks: [
            { type: 'cmd', label: 'fsck desde el USB en vivo', lines: [
              '# NUNCA sobre una partición montada en escritura',
              '$ sudo umount /dev/nvme0n1p2',
              '',
              '# Informe sin cambiar nada',
              '$ sudo fsck -n /dev/nvme0n1p2',
              '',
              '# Reparar respondiendo "sí" a todo',
              '$ sudo fsck -fy /dev/nvme0n1p2',
              '',
              '# Si dice "bad superblock", usa una copia de respaldo del superbloque',
              '$ sudo mke2fs -n /dev/nvme0n1p2        # -n: SOLO muestra, no formatea',
              '| Superblock backups stored on blocks: 32768, 98304, 163840 ...',
              '$ sudo e2fsck -b 32768 /dev/nvme0n1p2',
              '',
              '# Btrfs (no uses fsck): primero en solo lectura',
              '$ sudo btrfs check --readonly /dev/nvme0n1p2',
              '$ sudo btrfs scrub start -B /'
            ]},
            { type: 'callout', variant: 'danger', title: 'fsck sobre un disco que falla físicamente empeora las cosas',
              html: '<p>Si <code>dmesg</code> muestra errores de I/O, <b>clona primero</b> con <code>ddrescue</code> y repara la copia. Y no ejecutes <code>btrfs check --repair</code> sin una copia: sus propios desarrolladores lo desaconsejan salvo como último recurso.</p>' }
          ]
        },

        { id: 'sis-password', n: '9', t: 'Contraseña olvidada',
          lead: 'Restablecer la contraseña de tu usuario con acceso físico al equipo.',
          blocks: [
            { type: 'cmd', label: 'Desde el modo de recuperación', lines: [
              '# GRUB → Advanced options → (recovery mode) → root',
              '$ mount -o remount,rw /',
              '$ passwd tu_usuario',
              '$ sync && reboot',
              '',
              '# Si el menú de recuperación pide la contraseña de root: en GRUB pulsa "e"',
              '# y añade init=/bin/bash a la línea linux. Después, los mismos comandos y',
              '# para reiniciar: exec /sbin/init'
            ]},
            { type: 'callout', variant: 'warn', title: 'Con la carpeta personal cifrada',
              html: '<p>Cambiar la contraseña así funciona, pero si usas <code>ecryptfs</code> para cifrar <code>~</code>, la clave de descifrado sigue ligada a la contraseña antigua. Y con disco completo cifrado (LUKS), la frase de LUKS es distinta y no se puede recuperar.</p>' }
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     4. PAQUETES ROTOS
     ====================================================================== */
  C.registrar({
    id: 'resc-paquetes',
    group: 'rescate',
    title: 'Paquetes rotos y actualizaciones fallidas',
    level: 'intermedio',
    tags: ['dpkg', 'apt', 'lock', 'fix-broken', 'unmet dependencies', 'NO_PUBKEY', 'kept back', 'do-release-upgrade', 'postinst'],
    lead: 'Una actualización cortada por un apagón o un repositorio mal añadido pueden dejar <code>apt</code> inutilizable. Busca el <b>mensaje exacto</b> que ves en la pestaña correspondiente: cada error tiene su arreglo.',
    blocks: [
      { type: 'cmd', label: 'Secuencia de reparación general (empieza siempre por aquí)', lines: [
        '$ sudo dpkg --configure -a          # termina configuraciones pendientes',
        '$ sudo apt --fix-broken install     # resuelve dependencias rotas',
        '$ sudo apt update',
        '$ sudo apt full-upgrade',
        '$ sudo apt autoremove --purge',
        '',
        '# ¿Qué paquetes están a medio instalar? (estado distinto de "ii")',
        '$ dpkg -l | grep -vE "^(ii|rc)" | tail -n +6'
      ]},

      { type: 'tabs', id: 'paquetes-tabs', title: 'Mensaje de error', items: [

        { id: 'pk-interrumpido', n: '1', t: 'dpkg was interrupted',
          lead: '<code>E: dpkg was interrupted, you must manually run \'sudo dpkg --configure -a\' to correct the problem.</code>',
          blocks: [
            { type: 'cmd', label: 'Terminar lo que quedó a medias', lines: [
              '$ sudo dpkg --configure -a',
              '$ sudo apt --fix-broken install',
              '$ sudo apt full-upgrade',
              '',
              '# Si dpkg --configure -a se queda en un paquete concreto, míralo:',
              '$ sudo dpkg --audit'
            ]}
          ]
        },

        { id: 'pk-lock', n: '2', t: 'Could not get lock',
          lead: '<code>E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 1234 (unattended-upgr)</code>',
          blocks: [
            { type: 'cmd', label: 'Comprobar quién tiene el bloqueo (y esperar)', lines: [
              '# Casi siempre son las actualizaciones automáticas. Espera a que terminen:',
              '$ ps aux | grep -E "[a]pt|[d]pkg|[u]nattended"',
              '$ sudo lsof /var/lib/dpkg/lock-frontend',
              '',
              '# Ver su progreso',
              '$ sudo tail -f /var/log/unattended-upgrades/unattended-upgrades-dpkg.log'
            ]},
            { type: 'cmd', label: 'SOLO si no hay ningún proceso apt/dpkg vivo', lines: [
              '$ sudo rm /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock',
              '$ sudo rm /var/cache/apt/archives/lock /var/lib/apt/lists/lock',
              '$ sudo dpkg --configure -a'
            ]},
            { type: 'callout', variant: 'danger', title: 'No mates a dpkg a mitad de instalación',
              html: '<p>Hacer <code>kill -9</code> a un <code>dpkg</code> que está escribiendo deja paquetes a medio desempaquetar: es la forma más rápida de romper el sistema. Si el proceso existe, <b>espera</b>.</p>' }
          ]
        },

        { id: 'pk-deps', n: '3', t: 'unmet dependencies',
          lead: '<code>The following packages have unmet dependencies…</code> o <code>E: Unable to correct problems, you have held broken packages.</code>',
          blocks: [
            { type: 'cmd', label: 'De lo menos a lo más invasivo', lines: [
              '$ sudo apt --fix-broken install',
              '',
              '# ¿Qué versión pide y de qué repositorio viene cada una?',
              '$ apt-cache policy paquete-problema',
              '',
              '# aptitude propone soluciones alternativas (acepta con "y", otra con "n")',
              '$ sudo apt install aptitude',
              '$ sudo aptitude install paquete-problema',
              '',
              '# Un .deb externo que exige versiones que no existen: quítalo',
              '$ sudo dpkg --remove --force-remove-reinstreq paquete-problema',
              '$ sudo apt --fix-broken install'
            ]},
            { type: 'callout', variant: 'tip', title: 'La causa más común: un PPA o .deb de otra versión de Ubuntu',
              html: '<p>Revisa <code>ls /etc/apt/sources.list.d/</code>. Si un PPA es la causa, <code>sudo ppa-purge ppa:usuario/nombre</code> devuelve sus paquetes a la versión oficial.</p>' }
          ]
        },

        { id: 'pk-retenidos', n: '4', t: 'kept back',
          lead: '<code>The following packages have been kept back:</code> — no es un error. APT no actualiza paquetes que necesitan instalar o quitar otros, o que están en «despliegue por fases».',
          blocks: [
            { type: 'cmd', label: 'Entender y resolver', lines: [
              '# ¿Retenidos a mano?',
              '$ apt-mark showhold',
              '',
              '# ¿Despliegue por fases? (Ubuntu libera las actualizaciones poco a poco)',
              '$ apt-cache policy paquete | grep -i phased',
              '',
              '# Actualizar solo ese paquete, aceptando sus nuevas dependencias',
              '$ sudo apt install --only-upgrade paquete',
              '',
              '# O todo, permitiendo instalar y quitar lo necesario (lee la lista)',
              '$ sudo apt full-upgrade'
            ]},
            { type: 'callout', variant: 'info', title: 'Con fases, lo mejor es esperar',
              html: '<p>Si es un despliegue por fases, en unos días te llegará solo. Forzarlo te adelanta a la detección de errores que justifica las fases.</p>' }
          ]
        },

        { id: 'pk-repos', n: '5', t: 'Errores de repositorio',
          lead: '<code>NO_PUBKEY</code>, <code>does not have a Release file</code>, <code>404 Not Found</code>, <code>Conflicting values set for option Signed-By</code>.',
          blocks: [
            { type: 'table', head: ['Mensaje', 'Causa y arreglo'], monoFirst: false, rows: [
              ['<code>NO_PUBKEY ABCD1234…</code>', 'Falta la clave del repositorio. Descárgala de la web del proveedor a <code>/etc/apt/keyrings/</code> y referénciala con <code>signed-by=</code> (ver <a href="#pkg-apt/repos">Repositorios</a>)'],
              ['<code>does not have a Release file</code>', 'El repo no publica para tu versión de Ubuntu (típico de PPAs antiguos tras actualizar). Desactívalo'],
              ['<code>404 Not Found</code>', 'Versión de Ubuntu sin soporte (EOL) o URL obsoleta. Si es EOL, actualiza la versión'],
              ['<code>Conflicting values set for option Signed-By</code>', 'El mismo repo está definido dos veces con claves distintas. Borra el duplicado'],
              ['<code>Target … is configured multiple times</code>', 'Repo duplicado: aviso inofensivo, pero conviene eliminar la línea repetida']
            ]},
            { type: 'cmd', label: 'Localizar y desactivar el repositorio problemático', lines: [
              '# Desde Ubuntu 24.04 los repos usan el formato .sources (deb822)',
              '$ ls /etc/apt/sources.list.d/',
              '$ grep -rl "dominio-del-repo" /etc/apt/sources.list /etc/apt/sources.list.d/',
              '',
              '# Desactivarlo sin borrarlo',
              '$ sudo mv /etc/apt/sources.list.d/repo.list /etc/apt/sources.list.d/repo.list.disabled',
              '# (en un .sources también vale añadir la línea "Enabled: no")',
              '',
              '$ sudo apt update'
            ]}
          ]
        },

        { id: 'pk-postinst', n: '6', t: 'subprocess returned error',
          lead: '<code>installed post-installation script subprocess returned error exit status 1</code> — el script de configuración de un paquete falló.',
          blocks: [
            { type: 'cmd', label: 'Ver por qué falla y reinstalar limpio', lines: [
              '# El nombre del paquete aparece justo antes del error',
              '$ sudo dpkg --configure -D 2 paquete      # depuración del script',
              '$ less /var/lib/dpkg/info/paquete.postinst',
              '',
              '# Reinstalar desde cero conservando el resto',
              '$ sudo apt purge paquete',
              '$ sudo apt install paquete',
              '',
              '# Si ni siquiera se deja purgar',
              '$ sudo dpkg --purge --force-all paquete',
              '$ sudo apt --fix-broken install'
            ]}
          ]
        },

        { id: 'pk-upgrade', n: '7', t: 'Actualización de versión cortada',
          lead: '<code>do-release-upgrade</code> se interrumpió (corte de luz, cierre de la terminal). El sistema queda entre dos versiones.',
          blocks: [
            { type: 'cmd', label: 'Completar la actualización', lines: [
              '# Si no arranca el escritorio, usa Ctrl+Alt+F3 o el modo de recuperación',
              '$ sudo dpkg --configure -a',
              '$ sudo apt --fix-broken install',
              '$ sudo apt full-upgrade',
              '',
              '# Registros de lo que falló',
              '$ ls /var/log/dist-upgrade/',
              '$ less /var/log/dist-upgrade/main.log',
              '',
              '# Verifica la versión resultante',
              '$ lsb_release -a'
            ]},
            { type: 'callout', variant: 'tip', title: 'La próxima vez, dentro de tmux o screen',
              html: '<p>Si actualizas por SSH, <code>do-release-upgrade</code> ya abre una sesión de respaldo en el puerto 1022. En local, ejecútalo dentro de <code>tmux</code>: si se cierra la ventana, la actualización sigue y la recuperas con <code>tmux attach</code>.</p>' }
          ]
        },

        { id: 'pk-atras', n: '8', t: 'Volver a una versión anterior',
          lead: 'La nueva versión de un paquete rompe algo. Instala la anterior y bloquéala.',
          blocks: [
            { type: 'cmd', label: 'Downgrade controlado', lines: [
              '# ¿Qué se instaló y cuándo? (historial de apt)',
              '$ grep -A3 "Start-Date" /var/log/apt/history.log | tail -30',
              '$ zgrep -h "upgrade " /var/log/dpkg.log* | grep paquete',
              '',
              '# Versiones disponibles en los repositorios',
              '$ apt list -a paquete',
              '',
              '# Instalar la anterior y retenerla',
              '$ sudo apt install paquete=1.2.3-1ubuntu1',
              '$ sudo apt-mark hold paquete',
              '',
              '# Si ya no está en los repos, puede seguir en la caché',
              '$ ls /var/cache/apt/archives/ | grep paquete',
              '$ sudo apt install /var/cache/apt/archives/paquete_1.2.3-1_amd64.deb'
            ]}
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     5. TIMESHIFT
     ====================================================================== */
  C.registrar({
    id: 'resc-timeshift',
    group: 'rescate',
    title: 'Timeshift: instantáneas para volver atrás',
    level: 'intermedio',
    tags: ['timeshift', 'snapshot', 'instantánea', 'restaurar', 'btrfs', 'rsync', 'copia del sistema'],
    lead: 'Una instantánea del sistema antes de cada cambio arriesgado convierte un desastre en cinco minutos de restauración. Timeshift protege los <b>archivos del sistema</b>; tus documentos van en una copia aparte.',
    blocks: [
      { type: 'tabs', id: 'timeshift-tabs', items: [
        { id: 'ts-instalar', n: '1', t: 'Instalar y configurar',
          blocks: [
            { type: 'cmd', label: 'Instalación y primera configuración', lines: [
              '$ sudo apt install timeshift',
              '$ sudo timeshift-gtk          # asistente gráfico',
              '',
              '# O por terminal: lista los dispositivos y elige el destino',
              '$ sudo timeshift --list-devices'
            ]},
            { type: 'table', head: ['Modo', 'Cuándo usarlo'], monoFirst: false, rows: [
              ['<b>RSYNC</b>', 'ext4 (lo habitual en Ubuntu). La primera copia ocupa lo que el sistema; las siguientes solo los cambios. Mejor en <b>otro disco</b>'],
              ['<b>BTRFS</b>', 'Solo si la raíz es Btrfs con subvolúmenes <code>@</code> y <code>@home</code>. Instantáneas inmediatas y casi sin espacio']
            ]},
            { type: 'callout', variant: 'warn', title: 'Excluye /home (es la opción por defecto)',
              html: '<p>Si incluyes tu carpeta personal, al restaurar volverían también tus documentos a la fecha de la instantánea y perderías lo creado después. Para <code>~</code> usa <code>rsync</code> o Déjà Dup.</p>' }
          ]
        },
        { id: 'ts-crear', n: '2', t: 'Crear y programar',
          blocks: [
            { type: 'cmd', label: 'Instantáneas por terminal', lines: [
              '# Antes de un cambio arriesgado (actualizar versión, drivers, kernel)',
              '$ sudo timeshift --create --comments "antes de instalar driver NVIDIA" --tags O',
              '',
              '$ sudo timeshift --list',
              '',
              '# Borrar una instantánea antigua',
              '$ sudo timeshift --delete --snapshot "2026-11-20_10-00-01"',
              '',
              '# Programación: en el asistente gráfico → Niveles (diaria, semanal, al arrancar)'
            ]}
          ]
        },
        { id: 'ts-restaurar', n: '3', t: 'Restaurar', badge: 'emergencia', badgeVariant: 'danger',
          blocks: [
            { type: 'cmd', label: 'Si el sistema arranca', lines: [
              '$ sudo timeshift --list',
              '$ sudo timeshift --restore --snapshot "2026-11-20_10-00-01"',
              '# Pregunta si reinstalar GRUB: responde sí y elige el disco del sistema'
            ]},
            { type: 'cmd', label: 'Si el sistema NO arranca: desde el USB en vivo', lines: [
              '$ sudo apt update && sudo apt install -y timeshift',
              '',
              '# Indica dónde están las instantáneas y la raíz de destino',
              '$ sudo timeshift --list --snapshot-device /dev/sdb1',
              '$ sudo timeshift --restore --snapshot-device /dev/sdb1 --target-device /dev/nvme0n1p2',
              '',
              '# También existe la herramienta gráfica: sudo timeshift-launcher'
            ]}
          ]
        },
        { id: 'ts-etc', n: '4', t: 'Extra: etckeeper',
          blocks: [
            { type: 'prose', html: '<p><code>etckeeper</code> guarda <code>/etc</code> en un repositorio git y hace un commit automático en cada operación de apt. Así sabes exactamente qué configuración cambió y cuándo, y puedes deshacerlo archivo por archivo.</p>' },
            { type: 'cmd', label: 'Historial de /etc con git', lines: [
              '$ sudo apt install etckeeper',
              '$ sudo etckeeper commit "estado inicial"',
              '',
              '$ sudo git -C /etc log --oneline | head',
              '$ sudo git -C /etc diff HEAD~1 -- fstab',
              '$ sudo git -C /etc checkout HEAD~1 -- default/grub && sudo update-grub'
            ]}
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     6. RESCATE DE DATOS
     ====================================================================== */
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
        html: '<p><code>dd</code> se apoda «disk destroyer» con razón: no pide confirmación, no comprueba nada y sobrescribe lo que le indiques. Escribir <code>of=/dev/sda</code> en lugar de <code>of=/dev/sdb</code> destruye tu instalación en segundos.</p><p><b>Verifica el destino tres veces</b> con <code>lsblk</code>, comparando por tamaño y modelo. Y si es tu primera vez, usa una herramienta gráfica: comprueban que el destino sea un dispositivo extraíble.</p>' }
    ]
  });

})(window.Contenido);
