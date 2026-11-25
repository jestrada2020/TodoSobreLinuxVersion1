/* 95-constructores.js — constructores interactivos de comandos.
   Misma metodología que la calculadora de permisos: eliges opciones, ves el
   comando y la explicación de cada parte. Cada constructor se inserta junto a
   la explicación de su comando y, además, todos se reúnen en la sección
   «Constructor de comandos». Motor: render.js (bloqueBuilder) y app.js
   (conectarBuilders). Este archivo debe cargarse después de los de contenido. */
(function (C) {
  'use strict';

  var B = {};   // definiciones, por clave

  /* =========================== ARCHIVOS ================================== */
  B.find = { type: 'builder', id: 'find', title: 'find: buscar archivos y carpetas', prefix: 'find',
    prefixDesc: 'recorre el árbol de carpetas en tiempo real',
    desc: 'Elige dónde, qué y qué hacer con lo encontrado.',
    fields: [
      { k: 'sudo', type: 'check', flag: 'sudo', label: 'con sudo', at: 'pre', help: 'entra también en carpetas de otros usuarios y del sistema' },
      { k: 'ruta', type: 'text', label: 'Dónde buscar', value: '~', pos: true, at: 'start', help: 'punto de partida: <b>{v}</b> y todo lo que contiene' },
      { k: 'prof', type: 'text', label: 'Profundidad máxima', flag: '-maxdepth', at: 'start', placeholder: 'sin límite', raw: true, help: 'no baja más de {v} niveles de carpetas' },
      { k: 'xdev', type: 'check', flag: '-xdev', label: 'no cruzar a otros discos', at: 'start', help: 'se queda en el disco de partida (no entra en USB ni particiones montadas dentro)' },
      { k: 'nombre', type: 'text', label: 'Nombre (admite * y ?)', flag: '-iname', value: '*.pdf', help: 'nombre que coincide con <b>{v}</b>, sin distinguir mayúsculas' },
      { k: 'tipo', type: 'select', label: 'Tipo', options: [
        ['', 'archivos y carpetas'],
        ['-type f', 'solo archivos', 'solo archivos normales'],
        ['-type d', 'solo carpetas', 'solo directorios'],
        ['-type l', 'solo enlaces', 'solo enlaces simbólicos']] },
      { k: 'tam', type: 'select', label: 'Tamaño', options: [
        ['', 'cualquiera'],
        ['-size +100M', 'más de 100 MB', 'mayores de 100 MB'],
        ['-size +1G', 'más de 1 GB', 'mayores de 1 GB'],
        ['-size -1k', 'menos de 1 KB', 'menores de 1 KB'],
        ['-empty', 'vacíos', 'archivos o carpetas vacíos']] },
      { k: 'fecha', type: 'select', label: 'Modificados', options: [
        ['', 'cuando sea'],
        ['-mtime -1', 'últimas 24 h', 'modificados en las últimas 24 horas'],
        ['-mtime -7', 'última semana', 'modificados en los últimos 7 días'],
        ['-mtime +365', 'hace más de un año', 'sin cambios desde hace más de un año']] },
      { k: 'err', type: 'check', flag: '2>/dev/null', label: 'ocultar «Permiso denegado»', value: true, at: 'end', help: 'descarta los mensajes de error de carpetas sin permiso' },
      { k: 'acc', type: 'select', label: 'Qué hacer con lo encontrado', at: 'end', options: [
        ['', 'mostrar la ruta'],
        ['-ls', 'listado detallado', 'muestra permisos, dueño, tamaño y fecha de cada resultado'],
        ['-exec du -ch {} + | tail -1', 'tamaño total', 'suma el tamaño de todo lo encontrado'],
        ['-exec ls -lh {} +', 'ls -lh de cada uno', 'ejecuta ls -lh pasando todos los resultados de una vez ({} +)'],
        ['-delete', 'BORRAR', 'borra cada resultado', 'Borra sin preguntar: ejecútalo antes sin -delete y revisa la lista']] }
    ],
    presets: [
      { t: 'PDF de la carpeta personal', v: { ruta: '~', nombre: '*.pdf', tipo: '-type f', err: true } },
      { t: 'Archivos de más de 1 GB', v: { ruta: '/', nombre: '', tipo: '-type f', tam: '-size +1G', xdev: true, err: true, acc: '-exec ls -lh {} +' } },
      { t: 'Carpetas vacías', v: { ruta: '.', nombre: '', tipo: '-type d', tam: '-empty' } },
      { t: 'Modificado hoy', v: { ruta: '~/Documentos', nombre: '', tipo: '-type f', fecha: '-mtime -1' } },
      { t: 'Borrar .log viejos', v: { ruta: '~/proyectos', nombre: '*.log', tipo: '-type f', fecha: '-mtime +365', acc: '-delete' } }
    ] };

  B.grep = { type: 'builder', id: 'grep', title: 'grep: buscar texto dentro de archivos', prefix: 'grep', combine: true,
    prefixDesc: 'busca líneas que contienen un patrón',
    fields: [
      { k: 'patron', type: 'text', label: 'Texto o patrón', value: 'error', pos: true, at: 'end', req: true, help: 'lo que se busca: <b>{v}</b>' },
      { k: 'ruta', type: 'text', label: 'Archivo o carpeta', value: '/var/log/syslog', pos: true, at: 'end', help: 'dónde buscar: {v}' },
      { k: 'incl', type: 'text', label: 'Solo archivos (con -r)', flag: '--include', join: '=', placeholder: '*.py', help: 'limita la búsqueda recursiva a archivos {v}' },
      { k: 'ctx', type: 'select', label: 'Contexto', options: [
        ['', 'solo la línea'], ['-C 2', '2 líneas alrededor', 'muestra 2 líneas antes y después'],
        ['-A 3', '3 líneas después', 'muestra 3 líneas después (After)'], ['-B 3', '3 líneas antes', 'muestra 3 líneas antes (Before)']] },
      { k: 'r', type: 'check', flag: '-r', label: 'recursivo (carpetas)', help: 'entra en subcarpetas' },
      { k: 'i', type: 'check', flag: '-i', label: 'sin mayúsculas', value: true, help: 'no distingue mayúsculas de minúsculas' },
      { k: 'n', type: 'check', flag: '-n', label: 'número de línea', value: true, help: 'muestra el número de línea' },
      { k: 'w', type: 'check', flag: '-w', label: 'palabra completa', help: 'no coincide dentro de otra palabra («error» no encuentra «errores»)' },
      { k: 'v', type: 'check', flag: '-v', label: 'invertir', help: 'muestra las líneas que NO coinciden' },
      { k: 'l', type: 'check', flag: '-l', label: 'solo nombres de archivo', help: 'lista los archivos que contienen el patrón, no las líneas' },
      { k: 'c', type: 'check', flag: '-c', label: 'contar', help: 'cuenta las líneas que coinciden' },
      { k: 'E', type: 'check', flag: '-E', label: 'regex extendida', help: 'permite | + ? () sin escaparlos' },
      { k: 'F', type: 'check', flag: '-F', label: 'texto literal', help: 'trata el patrón como texto fijo (puntos, asteriscos… sin significado especial)' }
    ],
    avisos: function (v) {
      var w = [];
      if (v.incl && !v.r) w.push('--include solo tiene efecto con -r (recursivo).');
      if (v.E && v.F) w.push('-E y -F son incompatibles: elige uno.');
      return w;
    },
    presets: [
      { t: 'Errores en un log', v: { patron: 'error', ruta: '/var/log/syslog', i: true, n: true } },
      { t: 'Buscar en código Python', v: { patron: 'def calcular', ruta: '.', r: true, n: true, incl: '*.py' } },
      { t: 'Qué archivos lo contienen', v: { patron: 'TODO', ruta: '.', r: true, l: true } },
      { t: 'Config sin comentarios', v: { patron: '^#|^$', ruta: '/etc/ssh/sshd_config', v: true, E: true, i: false, n: false } }
    ] };

  B.tar = { type: 'builder', id: 'tar', title: 'tar: empaquetar, comprimir y extraer', prefix: 'tar', combine: true,
    prefixDesc: 'empaqueta varios archivos en uno',
    fields: [
      { k: 'modo', type: 'select', label: 'Operación', options: [
        ['-c', 'crear', 'crear un archivo nuevo (create)'],
        ['-x', 'extraer', 'extraer el contenido (extract)'],
        ['-t', 'listar', 'ver qué contiene sin extraer (list)']] },
      { k: 'comp', type: 'select', label: 'Compresión', options: [
        ['-z', 'gzip (.tar.gz)', 'compresión gzip: rápida y universal'],
        ['-J', 'xz (.tar.xz)', 'compresión xz: más pequeña, más lenta'],
        ['--zstd', 'zstd (.tar.zst)', 'compresión zstd: muy rápida y buena'],
        ['', 'sin comprimir (.tar)']] },
      { k: 'v', type: 'check', flag: '-v', label: 'ver cada archivo', value: true, help: 'muestra cada archivo que procesa (verbose)' },
      { k: 'p', type: 'check', flag: '-p', label: 'conservar permisos', help: 'mantiene los permisos originales al extraer' },
      { k: 'f', type: 'text', label: 'Archivo .tar', flag: '-f', value: 'respaldo.tar.gz', req: true, help: 'el archivo empaquetado: {v}' },
      { k: 'C', type: 'text', label: 'Extraer en (carpeta)', flag: '-C', placeholder: 'carpeta actual', help: 'extrae dentro de {v} (debe existir)' },
      { k: 'ex', type: 'text', label: 'Excluir', flag: '--exclude', join: '=', placeholder: '*.log', help: 'no incluye lo que coincida con {v}' },
      { k: 'o', type: 'text', label: 'Qué empaquetar', value: '~/Documentos', pos: true, at: 'end', help: 'carpetas o archivos de origen: {v}' }
    ],
    avisos: function (v) {
      var w = [];
      if (v.modo !== '-c' && v.o) w.push('Al extraer o listar, «Qué empaquetar» sobra salvo que quieras solo esos archivos.');
      if (v.modo === '-c' && v.C) w.push('-C al crear cambia la carpeta de origen: es avanzado; normalmente déjalo vacío.');
      return w;
    },
    presets: [
      { t: 'Respaldo comprimido', v: { modo: '-c', comp: '-z', v: true, f: 'documentos-$(date +%F).tar.gz', o: '~/Documentos' } },
      { t: 'Extraer en una carpeta', v: { modo: '-x', comp: '-z', v: true, f: 'respaldo.tar.gz', C: '/tmp/restaurado', o: '' } },
      { t: 'Ver contenido', v: { modo: '-t', comp: '-z', v: true, f: 'respaldo.tar.gz', o: '' } },
      { t: 'Máxima compresión', v: { modo: '-c', comp: '-J', v: true, f: 'proyecto.tar.xz', ex: 'node_modules', o: '~/proyecto' } }
    ] };

  B.rsync = { type: 'builder', id: 'rsync', title: 'rsync: copiar y sincronizar', prefix: 'rsync', combine: true,
    prefixDesc: 'copia solo lo que ha cambiado; se puede interrumpir y reanudar',
    fields: [
      { k: 'a', type: 'check', flag: '-a', label: 'modo archivo', value: true, help: 'recursivo y conserva permisos, fechas, enlaces y propietarios' },
      { k: 'v', type: 'check', flag: '-v', label: 'detallado', value: true, help: 'muestra los archivos copiados' },
      { k: 'h', type: 'check', flag: '-h', label: 'tamaños legibles', value: true, help: 'tamaños en K, M, G' },
      { k: 'P', type: 'check', flag: '-P', label: 'progreso y reanudar', value: true, help: 'muestra el progreso y conserva archivos a medias para reanudar' },
      { k: 'n', type: 'check', flag: '-n', label: 'SIMULAR', help: 'no copia nada: enseña lo que haría (dry-run)' },
      { k: 'z', type: 'check', flag: '-z', label: 'comprimir (red)', help: 'comprime durante la transferencia; útil por red, inútil en local' },
      { k: 'A', type: 'check', flag: '-A', label: 'ACL', help: 'conserva las ACL' },
      { k: 'del', type: 'check', flag: '--delete', label: 'espejo (borrar sobrantes)', help: 'borra en el destino lo que ya no existe en el origen', warn: '--delete borra en el destino: pruébalo antes con -n (SIMULAR).' },
      { k: 'ex', type: 'text', label: 'Excluir', flag: '--exclude', join: '=', placeholder: '.cache', help: 'no copia lo que coincida con {v}' },
      { k: 'o', type: 'text', label: 'Origen', value: '~/Documentos/', pos: true, at: 'end', req: true, help: 'origen: {v}' },
      { k: 'd', type: 'text', label: 'Destino', value: '/media/$USER/RESPALDO/Documentos/', pos: true, at: 'end', req: true, help: 'destino: {v}' }
    ],
    avisos: function (v) {
      var o = String(v.o || '');
      if (!o) return [];
      return [o.slice(-1) === '/'
        ? 'Origen con barra final: se copia el CONTENIDO de la carpeta dentro del destino.'
        : 'Origen sin barra final: se crea la carpeta «' + o.split('/').pop() + '» DENTRO del destino.'];
    },
    presets: [
      { t: 'Respaldo a USB', v: { a: true, v: true, h: true, P: true, o: '~/Documentos/', d: '/media/$USER/RESPALDO/Documentos/' } },
      { t: 'Espejo exacto (simular)', v: { a: true, v: true, h: true, n: true, del: true, o: '~/Proyectos/', d: '/media/$USER/RESPALDO/Proyectos/' } },
      { t: 'A un servidor por SSH', v: { a: true, v: true, h: true, P: true, z: true, o: '~/web/', d: 'usuario@servidor:/var/www/web/' } }
    ] };

  /* =========================== PERMISOS ================================== */
  B.chown = { type: 'builder', id: 'chown', title: 'chown: cambiar propietario y grupo',
    fields: [
      { k: 'u', type: 'text', label: 'Usuario', value: '$USER' },
      { k: 'g', type: 'text', label: 'Grupo', placeholder: 'el del usuario', hint: 'vacío + «grupo del usuario» = <code>usuario:</code>' },
      { k: 'gu', type: 'check', label: 'grupo principal del usuario', value: true },
      { k: 'R', type: 'check', flag: '-R', label: 'recursivo' },
      { k: 'v', type: 'check', flag: '-v', label: 'informar de cambios' },
      { k: 'r', type: 'text', label: 'Archivo o carpeta', value: '/media/$USER/DISCO/carpeta' }
    ],
    build: function (v, q) {
      var p = [{ t: 'sudo', d: 'cambiar el propietario requiere privilegios de administrador' }, { t: 'chown', d: 'cambia propietario y/o grupo' }];
      if (v.R) p.push({ t: '-R', d: 'aplica también a todo lo que hay dentro' });
      if (v.v) p.push({ t: '-v', d: 'muestra cada cambio' });
      var quien = (v.u || '') + (v.g ? ':' + v.g : (v.gu ? ':' : ''));
      var desc = (v.u ? 'propietario <b>' + v.u + '</b>' : '') +
        (v.g ? ', grupo <b>' + v.g + '</b>' : (v.gu ? ', grupo: el principal de ese usuario' : ', el grupo no cambia'));
      if (!v.u && v.g) { quien = ':' + v.g; desc = 'solo cambia el grupo a <b>' + v.g + '</b> (como chgrp)'; }
      p.push({ t: q(quien).replace(/^'(.*)'$/, '$1'), d: desc });
      p.push({ t: q(v.r || '.'), d: 'sobre: ' + (v.r || '.') });
      var w = [];
      if (v.R && /^\/(usr|etc|var|bin|lib|boot)?\/?$/.test(v.r || '')) w.push('chown -R sobre una carpeta del sistema lo rompe: revisa la ruta.');
      if (/^(\/media|\/mnt)/.test(v.r || '')) w.push('En discos FAT, exFAT o NTFS chown no tiene efecto: el dueño se fija al montar (pestaña USB de Permisos avanzados).');
      return { lines: [p.map(function (x) { return x.t; }).join(' ')], parts: p, warns: w };
    },
    presets: [
      { t: 'Recuperar mi carpeta personal', v: { u: '$USER', gu: true, R: true, r: '~' } },
      { t: 'Disco ext4 de otro equipo', v: { u: '$USER', gu: true, R: true, r: '/media/$USER/DISCO' } },
      { t: 'Solo grupo de proyecto', v: { u: '', g: 'proyecto', gu: false, R: true, r: '/srv/proyecto' } }
    ] };

  /* ======================= PROCESOS Y SERVICIOS ========================== */
  B.kill = { type: 'builder', id: 'kill', title: 'Terminar procesos: kill, pkill, killall',
    fields: [
      { k: 'modo', type: 'select', label: 'Cómo identificarlo', options: [['pkill', 'por nombre (pkill)'], ['kill', 'por número PID (kill)'], ['killall', 'por nombre exacto (killall)']] },
      { k: 'obj', type: 'text', label: 'Nombre o PID', value: 'firefox' },
      { k: 'sen', type: 'select', label: 'Señal', options: [
        ['TERM', 'TERM: pedir que termine', 'pide al programa que se cierre limpiamente (la normal)'],
        ['INT', 'INT: como Ctrl+C', 'interrupción, igual que pulsar Ctrl+C'],
        ['HUP', 'HUP: recargar', 'muchos servicios recargan su configuración'],
        ['KILL', 'KILL: matar ya', 'el kernel lo mata sin dejarle guardar nada', 'KILL no deja al programa guardar ni limpiar: úsalo solo si TERM no funciona.'],
        ['STOP', 'STOP: pausar', 'congela el proceso'],
        ['CONT', 'CONT: reanudar', 'reanuda un proceso pausado']] },
      { k: 'f', type: 'check', label: 'buscar en la línea de comandos completa (-f)' },
      { k: 'u', type: 'text', label: 'Solo de este usuario', placeholder: '$USER' },
      { k: 'sudo', type: 'check', label: 'con sudo (procesos de otros usuarios)' }
    ],
    build: function (v, q) {
      var p = [], previo;
      if (v.sudo) p.push({ t: 'sudo', d: 'necesario para procesos de otros usuarios o de root' });
      p.push({ t: v.modo, d: { pkill: 'envía la señal a los procesos cuyo nombre coincide', kill: 'envía la señal a un PID concreto', killall: 'envía la señal a los procesos con ese nombre exacto' }[v.modo] });
      if (v.sen !== 'TERM') p.push({ t: '-' + v.sen, d: 'señal ' + v.sen, w: v.sen === 'KILL' ? 'KILL no deja al programa guardar ni limpiar: úsalo solo si TERM no funciona.' : null });
      else p.push({ t: '', d: '' });
      if (v.modo === 'pkill' && v.f) p.push({ t: '-f', d: 'compara con la línea de comandos completa (p. ej. «python servidor.py»)' });
      if (v.modo !== 'kill' && v.u) p.push({ t: '-u ' + q(v.u), d: 'solo procesos del usuario ' + v.u });
      p.push({ t: q(v.obj || ''), d: v.modo === 'kill' ? 'número de proceso (PID)' : 'nombre del proceso' });
      previo = v.modo === 'kill' ? 'ps -fp ' + q(v.obj || '') : 'pgrep -a' + (v.f ? 'f' : '') + (v.u ? ' -u ' + q(v.u) : '') + ' ' + q(v.obj || '');
      p = p.filter(function (x) { return x.t; });
      return { lines: ['# 1. Comprueba qué procesos se verán afectados', previo, '# 2. Envía la señal', p.map(function (x) { return x.t; }).join(' ')], parts: p,
        warns: v.modo === 'kill' && !/^\d+$/.test(v.obj || '') ? ['kill necesita un número de proceso (PID): búscalo con pgrep -a nombre.'] : [] };
    },
    presets: [
      { t: 'Cerrar Firefox colgado', v: { modo: 'pkill', obj: 'firefox', sen: 'TERM' } },
      { t: 'Matar sin piedad', v: { modo: 'pkill', obj: 'firefox', sen: 'KILL' } },
      { t: 'Un script de Python', v: { modo: 'pkill', obj: 'servidor.py', f: true } },
      { t: 'Recargar nginx', v: { modo: 'pkill', obj: 'nginx', sen: 'HUP', sudo: true } }
    ] };

  B.systemctl = { type: 'builder', id: 'systemctl', title: 'systemctl: gestionar servicios',
    fields: [
      { k: 'acc', type: 'select', label: 'Acción', options: [
        ['status', 'ver estado'], ['start', 'arrancar'], ['stop', 'parar'], ['restart', 'reiniciar'], ['reload', 'recargar configuración'],
        ['enable --now', 'activar al arrancar y arrancar ya'], ['enable', 'activar al arrancar'], ['disable --now', 'desactivar y parar'],
        ['is-active', '¿está en marcha?'], ['is-enabled', '¿arranca con el sistema?'], ['mask', 'bloquear (que nadie lo arranque)'], ['unmask', 'desbloquear'],
        ['list-units --type=service --state=failed', 'listar servicios con fallos'], ['list-timers', 'listar temporizadores']] },
      { k: 'svc', type: 'text', label: 'Servicio', value: 'ssh' },
      { k: 'user', type: 'check', label: 'servicio de mi usuario (--user)' }
    ],
    build: function (v, q) {
      var lectura = /^(status|is-active|is-enabled|list-units|list-timers)/.test(v.acc);
      var global = /^list-/.test(v.acc);
      var p = [];
      if (!v.user && !lectura) p.push({ t: 'sudo', d: 'cambiar servicios del sistema requiere administrador' });
      p.push({ t: 'systemctl', d: 'controla systemd' });
      if (v.user) p.push({ t: '--user', d: 'servicios de tu sesión (~/.config/systemd/user), sin sudo' });
      var D = { status: 'estado, últimos registros y si arranca con el sistema', start: 'lo arranca ahora (no al reiniciar)', stop: 'lo detiene ahora',
        restart: 'para y vuelve a arrancar', reload: 'relee la configuración sin cortar el servicio (si lo admite)',
        'enable --now': 'lo activa para cada arranque y lo arranca ya', enable: 'lo activa para cada arranque (no lo arranca ahora)',
        'disable --now': 'lo quita del arranque y lo detiene', 'is-active': 'responde active/inactive (útil en scripts)',
        'is-enabled': 'responde enabled/disabled', mask: 'impide arrancarlo, incluso como dependencia', unmask: 'revierte mask' };
      p.push({ t: v.acc, d: D[v.acc] || 'listado general' });
      if (!global) p.push({ t: q(v.svc || ''), d: 'el servicio (se puede omitir el «.service»)' });
      var w = [];
      if (v.acc === 'mask') w.push('mask impide arrancarlo de cualquier forma hasta hacer unmask.');
      if (/stop|disable/.test(v.acc) && /^(ssh|sshd)$/.test(v.svc) ) w.push('Si estás conectado por SSH, parar ssh puede dejarte sin acceso.');
      return { lines: [p.map(function (x) { return x.t; }).join(' ')], parts: p, warns: w };
    },
    presets: [
      { t: '¿Funciona?', v: { acc: 'status', svc: 'ssh' } },
      { t: 'Activar y arrancar', v: { acc: 'enable --now', svc: 'ollama' } },
      { t: 'Servicios con fallos', v: { acc: 'list-units --type=service --state=failed' } },
      { t: 'Temporizador de mi usuario', v: { acc: 'enable --now', svc: 'limpieza.timer', user: true } }
    ] };

  B.journalctl = { type: 'builder', id: 'journalctl', title: 'journalctl: leer los registros', prefix: 'journalctl',
    prefixDesc: 'lee el diario de systemd',
    fields: [
      { k: 'u', type: 'text', label: 'Servicio (-u)', flag: '-u', placeholder: 'todos', help: 'solo los mensajes del servicio {v}' },
      { k: 'b', type: 'select', label: 'Arranque', options: [['', 'todos'], ['-b', 'el actual', 'solo desde el último arranque'], ['-b -1', 'el anterior', 'el arranque anterior (útil tras un cuelgue)']] },
      { k: 'p', type: 'select', label: 'Gravedad', options: [['', 'todas'], ['-p err', 'errores', 'errores y más graves'], ['-p warning', 'avisos', 'avisos y más graves']] },
      { k: 's', type: 'text', label: 'Desde', flag: '--since', placeholder: '"1 hour ago" o 2026-11-25', help: 'desde {v}' },
      { k: 'n', type: 'text', label: 'Últimas líneas', flag: '-n', value: '50', raw: true, help: 'las últimas {v} líneas' },
      { k: 'g', type: 'text', label: 'Que contenga', flag: '-g', placeholder: 'texto', help: 'solo mensajes que contienen {v}' },
      { k: 'k', type: 'check', flag: '-k', label: 'solo kernel', help: 'mensajes del kernel (como dmesg)' },
      { k: 'f', type: 'check', flag: '-f', label: 'seguir en vivo', help: 'sigue mostrando mensajes nuevos (Ctrl+C para salir)' },
      { k: 'x', type: 'check', flag: '-x', label: 'explicaciones', help: 'añade textos de ayuda a algunos mensajes' },
      { k: 'np', type: 'check', flag: '--no-pager', label: 'sin paginador', help: 'imprime todo de golpe (para copiar o redirigir)' },
      { k: 'user', type: 'check', flag: '--user', label: 'mis servicios', help: 'registros de los servicios de tu usuario' }
    ],
    presets: [
      { t: 'Errores de este arranque', v: { b: '-b', p: '-p err', n: '' } },
      { t: 'Un servicio en vivo', v: { u: 'ollama', f: true, n: '20' } },
      { t: '¿Por qué se colgó?', v: { b: '-b -1', p: '-p err', n: '100' } },
      { t: 'Última hora', v: { s: '1 hour ago', n: '' } }
    ] };

  B.cron = { type: 'builder', id: 'cron', title: 'cron: programar una tarea',
    desc: 'Construye la línea para <code>crontab -e</code> y comprueba en palabras cuándo se ejecutará.',
    fields: [
      { k: 'frec', type: 'select', label: 'Frecuencia', options: [
        ['min', 'cada N minutos'], ['hora', 'cada hora'], ['dia', 'cada día'], ['sem', 'cada semana'], ['mes', 'cada mes'], ['reboot', 'al encender']], value: 'dia' },
      { k: 'n', type: 'text', label: 'Cada N minutos', value: '15' },
      { k: 'h', type: 'text', label: 'Hora (0-23)', value: '9' },
      { k: 'm', type: 'text', label: 'Minuto (0-59)', value: '0' },
      { k: 'ds', type: 'select', label: 'Día de la semana', options: [['1', 'lunes'], ['2', 'martes'], ['3', 'miércoles'], ['4', 'jueves'], ['5', 'viernes'], ['6', 'sábado'], ['0', 'domingo'], ['1-5', 'de lunes a viernes']] },
      { k: 'dm', type: 'text', label: 'Día del mes (1-31)', value: '1' },
      { k: 'cmd', type: 'text', label: 'Comando (ruta completa)', value: '$HOME/.local/bin/limpieza.sh -y -p latex' },
      { k: 'log', type: 'check', label: 'guardar la salida en ~/cron.log', value: true }
    ],
    build: function (v) {
      var num = function (x, d, max) { x = parseInt(x, 10); return isNaN(x) || x < 0 || x > max ? d : x; };
      var m = num(v.m, 0, 59), h = num(v.h, 9, 23), n = num(v.n, 15, 59) || 15, dm = num(v.dm, 1, 31) || 1;
      var DS = { '0': 'domingo', '1': 'lunes', '2': 'martes', '3': 'miércoles', '4': 'jueves', '5': 'viernes', '6': 'sábado', '1-5': 'de lunes a viernes' };
      var hh = ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2), cuando, campos;
      switch (v.frec) {
        case 'min': campos = '*/' + n + ' * * * *'; cuando = 'cada ' + n + ' minutos'; break;
        case 'hora': campos = m + ' * * * *'; cuando = 'cada hora, en el minuto ' + m; break;
        case 'sem': campos = m + ' ' + h + ' * * ' + v.ds; cuando = (v.ds === '1-5' ? 'de lunes a viernes' : 'cada ' + DS[v.ds]) + ' a las ' + hh; break;
        case 'mes': campos = m + ' ' + h + ' ' + dm + ' * *'; cuando = 'el día ' + dm + ' de cada mes a las ' + hh; break;
        case 'reboot': campos = '@reboot'; cuando = 'cada vez que se enciende el equipo'; break;
        default: campos = m + ' ' + h + ' * * *'; cuando = 'todos los días a las ' + hh;
      }
      var cmd = (v.cmd || 'comando') + (v.log ? ' >> $HOME/cron.log 2>&1' : '');
      var parts = [];
      if (campos === '@reboot') parts.push({ t: '@reboot', d: 'al arrancar el sistema' });
      else {
        var c = campos.split(' '), N = ['minuto', 'hora', 'día del mes', 'mes', 'día de la semana'];
        c.forEach(function (x, i) { parts.push({ t: x, d: N[i] + ': ' + (x === '*' ? 'cualquiera' : x.indexOf('*/') === 0 ? 'cada ' + x.slice(2) : x) }); });
      }
      parts.push({ t: v.cmd || 'comando', d: 'qué se ejecuta. En cron usa rutas completas: no carga tu ~/.bashrc' });
      if (v.log) parts.push({ t: '>> $HOME/cron.log 2>&1', d: 'añade la salida y los errores a ~/cron.log' });
      parts.push({ t: '⇒', d: '<b>Se ejecutará ' + cuando + '.</b>' });
      var w = [];
      if (/^(sudo |~)/.test(v.cmd || '')) w.push('En cron no uses sudo ni ~: para tareas de root usa «sudo crontab -e»; para la carpeta personal, $HOME.');
      if (/\$USER\b/.test(v.cmd || '')) w.push('cron no siempre define $USER: usa $LOGNAME o escribe tu usuario.');
      return { lines: ['# crontab -e  y añade esta línea:', campos + ' ' + cmd], parts: parts, warns: w };
    },
    presets: [
      { t: 'Limpieza los domingos 9:00', v: { frec: 'sem', ds: '0', h: '9', m: '0', cmd: '$HOME/.local/bin/limpieza.sh -y -p latex' } },
      { t: 'Respaldo diario 23:30', v: { frec: 'dia', h: '23', m: '30', cmd: 'rsync -a $HOME/Documentos/ /media/$LOGNAME/RESPALDO/Documentos/' } },
      { t: 'Cada 15 minutos', v: { frec: 'min', n: '15', cmd: '$HOME/bin/comprobar.sh' } },
      { t: 'Al encender', v: { frec: 'reboot', cmd: '$HOME/bin/al_iniciar.sh' } }
    ] };

  /* ========================= PAQUETES Y RED ============================== */
  B.apt = { type: 'builder', id: 'apt', title: 'apt: instalar, actualizar y quitar software',
    fields: [
      { k: 'acc', type: 'select', label: 'Acción', options: [
        ['install', 'instalar'], ['install --reinstall', 'reinstalar'], ['remove', 'quitar (conserva configuración)'], ['purge', 'quitar con su configuración'],
        ['update', 'refrescar la lista de paquetes'], ['upgrade', 'actualizar lo instalado'], ['full-upgrade', 'actualizar aunque quite paquetes'],
        ['autoremove --purge', 'quitar dependencias huérfanas'], ['search', 'buscar'], ['show', 'ver información'], ['policy', 'versión y origen'], ['list --upgradable', 'qué tiene actualización']] },
      { k: 'pk', type: 'text', label: 'Paquete(s)', value: 'htop curl', hint: 'separados por espacios' },
      { k: 'up', type: 'check', label: 'refrescar la lista antes (apt update &&)', value: true },
      { k: 'y', type: 'check', label: 'no preguntar (-y)' },
      { k: 'nr', type: 'check', label: 'sin recomendados (--no-install-recommends)' },
      { k: 's', type: 'check', label: 'simular (-s)' }
    ],
    build: function (v) {
      var lectura = /^(search|show|policy|list)/.test(v.acc), sinPaquete = /^(update|upgrade|full-upgrade|autoremove|list)/.test(v.acc);
      var p = [];
      if (v.up && v.acc !== 'update' && !lectura) p.push({ t: 'sudo apt update &&', d: 'primero refresca la lista de versiones disponibles' });
      if (!lectura) p.push({ t: 'sudo', d: 'modificar paquetes requiere administrador' });
      p.push({ t: 'apt', d: 'gestor de paquetes de Debian/Ubuntu' });
      var D = { install: 'instala (y sus dependencias)', 'install --reinstall': 'vuelve a instalar los archivos del paquete', remove: 'desinstala, conserva la configuración del sistema',
        purge: 'desinstala y borra su configuración', update: 'descarga la lista de paquetes; no instala nada', upgrade: 'actualiza sin quitar paquetes',
        'full-upgrade': 'actualiza aunque tenga que quitar paquetes en conflicto', 'autoremove --purge': 'quita dependencias que ya nadie necesita',
        search: 'busca en nombres y descripciones', show: 'versión, tamaño, dependencias', policy: 'versión instalada, candidata y repositorio', 'list --upgradable': 'paquetes con actualización pendiente' };
      p.push({ t: v.acc, d: D[v.acc] });
      if (v.y && !lectura) p.push({ t: '-y', d: 'responde «sí» automáticamente' });
      if (v.nr && /install/.test(v.acc)) p.push({ t: '--no-install-recommends', d: 'instala solo lo imprescindible' });
      if (v.s && !lectura) p.push({ t: '-s', d: 'simula: muestra lo que haría sin cambiar nada' });
      if (!sinPaquete && v.pk) p.push({ t: v.pk, d: 'paquete(s): ' + v.pk });
      var w = [];
      if (v.acc === 'full-upgrade' && !v.s) w.push('full-upgrade puede quitar paquetes: lee la lista antes de aceptar (o márcalo como simular).');
      if (v.acc === 'purge' && /\b(python3|systemd|apt|linux-image)/.test(v.pk || '')) w.push('Quitar ese paquete puede dejar el sistema inutilizable.');
      return { lines: [p.map(function (x) { return x.t; }).join(' ')], parts: p, warns: w };
    },
    presets: [
      { t: 'Actualizar todo', v: { acc: 'upgrade', up: true, y: true } },
      { t: 'Instalar herramientas', v: { acc: 'install', pk: 'htop curl git', up: true, y: true } },
      { t: 'Desinstalar del todo', v: { acc: 'purge', pk: 'nombre-paquete', up: false } },
      { t: 'Limpieza', v: { acc: 'autoremove --purge', up: false } }
    ] };

  B.ssh = { type: 'builder', id: 'ssh', title: 'Copiar con un servidor: scp y rsync por SSH',
    fields: [
      { k: 'h', type: 'select', label: 'Herramienta', options: [['rsync', 'rsync (reanuda, solo cambios)'], ['scp', 'scp (simple)']] },
      { k: 'dir', type: 'select', label: 'Dirección', options: [['up', 'subir: mi equipo → servidor'], ['down', 'bajar: servidor → mi equipo']] },
      { k: 'u', type: 'text', label: 'Usuario remoto', value: 'john' },
      { k: 's', type: 'text', label: 'Servidor (IP o nombre)', value: '192.168.1.50' },
      { k: 'p', type: 'text', label: 'Puerto', value: '22' },
      { k: 'i', type: 'text', label: 'Clave privada', placeholder: '~/.ssh/id_ed25519' },
      { k: 'l', type: 'text', label: 'Ruta local', value: '~/Proyectos/web/' },
      { k: 'r', type: 'text', label: 'Ruta remota', value: '/var/www/web/' },
      { k: 'R', type: 'check', label: 'carpetas (recursivo)', value: true }
    ],
    build: function (v, q) {
      var p = [], remoto = (v.u ? v.u + '@' : '') + (v.s || 'servidor') + ':' + q(v.r || '~');
      var puerto = v.p && v.p !== '22';
      if (v.h === 'scp') {
        p.push({ t: 'scp', d: 'copia segura por SSH' });
        if (v.R) p.push({ t: '-r', d: 'copia carpetas completas' });
        if (puerto) p.push({ t: '-P ' + v.p, d: 'puerto SSH ' + v.p + ' (en scp es -P mayúscula)' });
        if (v.i) p.push({ t: '-i ' + q(v.i), d: 'usa esa clave privada' });
      } else {
        p.push({ t: 'rsync', d: 'sincroniza por SSH: solo envía lo que cambió y se puede reanudar' });
        p.push({ t: '-avzP', d: 'archivo + detallado + comprime en red + progreso y reanudación' });
        if (puerto || v.i) p.push({ t: '-e ' + q('ssh' + (puerto ? ' -p ' + v.p : '') + (v.i ? ' -i ' + v.i : '')), d: 'opciones de SSH: puerto y/o clave' });
      }
      var local = q(v.l || '.');
      if (v.dir === 'up') { p.push({ t: local, d: 'origen (tu equipo)' }); p.push({ t: remoto, d: 'destino en el servidor' }); }
      else { p.push({ t: remoto, d: 'origen en el servidor' }); p.push({ t: local, d: 'destino (tu equipo)' }); }
      var pre = 'ssh' + (puerto ? ' -p ' + v.p : '') + (v.i ? ' -i ' + q(v.i) : '') + ' ' + (v.u ? v.u + '@' : '') + (v.s || 'servidor') + ' true && echo "conexión OK"';
      return { lines: ['# Probar la conexión primero', pre, p.map(function (x) { return x.t; }).join(' ')], parts: p };
    },
    presets: [
      { t: 'Publicar una web', v: { h: 'rsync', dir: 'up', l: '~/Proyectos/web/', r: '/var/www/web/' } },
      { t: 'Bajar un respaldo', v: { h: 'scp', dir: 'down', R: false, r: '/home/john/respaldo.tar.gz', l: '~/Descargas/' } },
      { t: 'Puerto y clave propios', v: { h: 'rsync', p: '2222', i: '~/.ssh/id_ed25519' } }
    ] };

  /* ============================== DISCOS ================================= */
  B.mount = { type: 'builder', id: 'mount', title: 'Montar un disco o USB',
    fields: [
      { k: 'modo', type: 'select', label: 'Método', options: [['udisks', 'udisksctl (sin sudo, como el escritorio)'], ['mount', 'mount (control total)']] },
      { k: 'dev', type: 'text', label: 'Partición', value: '/dev/sdb1', hint: 'compruébala con <code>lsblk -f</code>' },
      { k: 'fs', type: 'select', label: 'Sistema de archivos', options: [['auto', 'detectar (ext4, Btrfs…)'], ['fat', 'FAT32 / exFAT'], ['ntfs3', 'NTFS'], ['loop', 'imagen .iso / .img']] },
      { k: 'pt', type: 'text', label: 'Punto de montaje (mount)', value: '/mnt/usb' },
      { k: 'ro', type: 'check', label: 'solo lectura (para rescatar datos)' },
      { k: 'mio', type: 'check', label: 'que los archivos sean míos (FAT/NTFS)', value: true }
    ],
    build: function (v, q) {
      var p = [], L = [];
      if (v.modo === 'udisks') {
        if (v.fs === 'loop') {
          p.push({ t: 'udisksctl loop-setup', d: 'convierte la imagen en un dispositivo' }, { t: (v.ro ? '-r ' : '') + '-f ' + q(v.dev), d: (v.ro ? 'solo lectura; ' : '') + 'archivo de imagen' });
          L.push(p.map(function (x) { return x.t; }).join(' '));
        } else {
          p.push({ t: 'udisksctl mount', d: 'monta en /media/$USER/ETIQUETA, sin sudo, con tus permisos' }, { t: '-b ' + q(v.dev), d: 'la partición' });
          if (v.ro) p.push({ t: '-o ro', d: 'solo lectura' });
          L.push(p.map(function (x) { return x.t; }).join(' '));
          L.push('# Al terminar: desmontar y apagar con seguridad');
          L.push('udisksctl unmount -b ' + q(v.dev) + ' && udisksctl power-off -b ' + q(String(v.dev).replace(/p?\d+$/, '')));
        }
      } else {
        var o = [];
        if (v.ro) o.push('ro');
        if (v.fs === 'loop') o.push('loop');
        if (v.mio && (v.fs === 'fat' || v.fs === 'ntfs3')) o.push('uid=$(id -u)', 'gid=$(id -g)', 'umask=022');
        p.push({ t: 'sudo mount', d: 'monta la partición en una carpeta' });
        if (v.fs === 'ntfs3') p.push({ t: '-t ntfs3', d: 'driver NTFS del kernel' });
        if (o.length) p.push({ t: '-o ' + o.join(','), d: o.map(function (x) {
          return { ro: 'solo lectura', loop: 'archivo de imagen como disco', umask: 'permisos 755/644' }[x.split('=')[0]] || (x.indexOf('uid') === 0 ? 'propietario: tú' : 'grupo: el tuyo');
        }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(' · ') });
        p.push({ t: q(v.dev), d: v.fs === 'loop' ? 'archivo de imagen' : 'partición' }, { t: q(v.pt), d: 'carpeta donde aparecerá el contenido' });
        L.push('sudo mkdir -p ' + q(v.pt));
        L.push(p.map(function (x) { return x.t; }).join(' '));
        L.push('# Al terminar');
        L.push('sudo umount ' + q(v.pt) + ' && sync');
      }
      var w = [];
      if (v.modo === 'udisks' && v.fs === 'ntfs3') w.push('Si NTFS aparece en solo lectura, Windows quedó hibernado: apágalo del todo o usa «sudo ntfsfix -d».');
      return { lines: L, parts: p, warns: w };
    },
    presets: [
      { t: 'USB normal', v: { modo: 'udisks', dev: '/dev/sdb1', fs: 'fat' } },
      { t: 'Disco de Windows', v: { modo: 'mount', dev: '/dev/sdb2', fs: 'ntfs3', pt: '/mnt/windows', mio: true } },
      { t: 'Rescate en solo lectura', v: { modo: 'mount', dev: '/dev/sdb1', fs: 'auto', pt: '/mnt/rescate', ro: true } },
      { t: 'Imagen ISO', v: { modo: 'udisks', dev: 'ubuntu.iso', fs: 'loop', ro: true } }
    ] };

  B.preparar = { type: 'builder', id: 'preparar', title: 'Preparar un disco o USB: borrar, particionar y formatear',
    desc: 'Genera la secuencia completa. <b>Comprueba el dispositivo</b> con <code>lsblk</code> antes de ejecutarla.',
    fields: [
      { k: 'dev', type: 'text', label: 'Disco COMPLETO', value: '/dev/sdX', hint: 'el disco (sdb), no la partición (sdb1)' },
      { k: 'tabla', type: 'select', label: 'Tabla de particiones', options: [['gpt', 'GPT (moderna)'], ['msdos', 'MBR (dispositivos antiguos)']] },
      { k: 'fs', type: 'select', label: 'Sistema de archivos', options: [['exfat', 'exFAT (todo sistema)'], ['vfat', 'FAT32 (máx. 4 GB por archivo)'], ['ntfs', 'NTFS (Windows)'], ['ext4', 'ext4 (solo Linux)']] },
      { k: 'et', type: 'text', label: 'Etiqueta', value: 'MI_USB' },
      { k: 'wipe', type: 'check', label: 'borrar la estructura anterior', value: true },
      { k: 'mnt', type: 'check', label: 'montar al terminar', value: true }
    ],
    build: function (v, q) {
      var d = v.dev || '/dev/sdX', part = /\d$/.test(d) ? d + 'p1' : d + '1', L = [], p = [];
      var fsinfo = { exfat: ['mkfs.exfat -L', 11], vfat: ['mkfs.vfat -F 32 -n', 11], ntfs: ['mkfs.ntfs -f -L', 128], ext4: ['mkfs.ext4 -L', 16] }[v.fs];
      var et = v.fs === 'vfat' ? String(v.et || '').toUpperCase() : String(v.et || '');
      L.push('lsblk -o NAME,SIZE,RM,TRAN,MODEL ' + q(d) + '   # ¿es el disco correcto?');
      L.push('sudo umount ' + d + '?* 2>/dev/null');
      p.push({ t: 'umount', d: 'desmonta todas sus particiones' });
      if (v.wipe) {
        L.push('sudo wipefs -a ' + d + '?* ' + q(d) + ' 2>/dev/null; sudo sgdisk --zap-all ' + q(d));
        p.push({ t: 'wipefs / sgdisk', d: 'borra firmas y tablas anteriores', w: 'Todo el contenido de ' + d + ' se perderá.' });
      }
      L.push('sudo parted -s ' + q(d) + ' mklabel ' + v.tabla);
      p.push({ t: 'mklabel ' + v.tabla, d: v.tabla === 'gpt' ? 'tabla GPT' : 'tabla MBR (msdos), máxima compatibilidad' });
      if (v.tabla === 'gpt') {
        L.push('sudo parted -s -a optimal ' + q(d) + ' mkpart ' + q(et || 'DATOS') + ' 1MiB 100%');
        p.push({ t: 'mkpart … 1MiB 100%', d: 'una partición alineada que ocupa todo el disco' });
        if (v.fs !== 'ext4') { L.push('sudo parted -s ' + q(d) + ' set 1 msftdata on'); p.push({ t: 'set 1 msftdata on', d: 'tipo «datos de Microsoft»: Windows y macOS la reconocen' }); }
      } else {
        L.push('sudo parted -s -a optimal ' + q(d) + ' mkpart primary ' + (v.fs === 'ext4' ? 'ext4' : v.fs === 'vfat' ? 'fat32' : 'ntfs') + ' 1MiB 100%');
        p.push({ t: 'mkpart primary … 1MiB 100%', d: 'partición primaria con el tipo adecuado' });
      }
      L.push('sudo partprobe ' + q(d) + ' && sleep 1');
      L.push('sudo ' + fsinfo[0] + ' ' + q(et || 'DATOS') + ' ' + part);
      p.push({ t: fsinfo[0].split(' ')[0], d: 'crea el sistema de archivos ' + v.fs + ' con la etiqueta ' + (et || 'DATOS') });
      if (v.mnt) {
        L.push('udisksctl mount -b ' + part);
        if (v.fs === 'ext4') L.push('sudo chown $USER: /media/$USER/' + q(et || 'DATOS') + '   # ext4: que sea tuyo');
        p.push({ t: 'udisksctl mount', d: 'lo monta en /media/$USER/' + (et || 'DATOS') });
      }
      var w = [];
      if (et.length > fsinfo[1]) w.push('La etiqueta tiene ' + et.length + ' caracteres; ' + v.fs + ' admite como máximo ' + fsinfo[1] + '.');
      if (/^\/dev\/(sda|nvme0n1)$/.test(d)) w.push(d + ' suele ser el disco del SISTEMA. Revisa con lsblk antes de continuar.');
      if (/\d$/.test(d) && !/nvme|mmcblk/.test(d)) w.push('Has indicado una partición (' + d + '); aquí va el disco completo (por ejemplo /dev/sdb).');
      if (d === '/dev/sdX') w.push('Sustituye /dev/sdX por el disco real.');
      return { lines: L, parts: p, warns: w };
    },
    presets: [
      { t: 'USB universal', v: { tabla: 'gpt', fs: 'exfat', et: 'MI_USB' } },
      { t: 'Para TV o radio antigua', v: { tabla: 'msdos', fs: 'vfat', et: 'MUSICA' } },
      { t: 'Disco de respaldo Linux', v: { tabla: 'gpt', fs: 'ext4', et: 'RESPALDO' } }
    ] };

  B.ddiso = { type: 'builder', id: 'ddiso', title: 'Grabar una ISO en una USB de arranque',
    fields: [
      { k: 'iso', type: 'text', label: 'Archivo ISO', value: '~/Descargas/ubuntu-24.04.3-desktop-amd64.iso' },
      { k: 'dev', type: 'text', label: 'USB (disco completo)', value: '/dev/sdX' },
      { k: 'sha', type: 'check', label: 'verificar la ISO antes', value: true }
    ],
    build: function (v, q) {
      var d = v.dev || '/dev/sdX', iso = q(v.iso || 'imagen.iso'), L = [], w = [];
      if (v.sha) L.push('sha256sum ' + iso + '      # compáralo con SHA256SUMS de la web oficial');
      L.push('lsblk -o NAME,SIZE,RM,TRAN,MODEL ' + q(d) + '   # ¿es la USB?');
      L.push('sudo umount ' + d + '?* 2>/dev/null');
      L.push('sudo dd if=' + iso + ' of=' + q(d) + ' bs=4M status=progress oflag=sync');
      L.push('sync');
      var p = [
        { t: 'if=' + iso, d: 'archivo de entrada: la ISO' },
        { t: 'of=' + d, d: 'salida: el DISCO completo (no una partición)', w: 'dd sobrescribe ' + d + ' sin preguntar.' },
        { t: 'bs=4M', d: 'bloques de 4 MB: mucho más rápido que el valor por defecto' },
        { t: 'status=progress', d: 'muestra el avance' },
        { t: 'oflag=sync', d: 'escribe de verdad cada bloque (el avance es real)' },
        { t: 'sync', d: 'vacía cachés antes de retirar la USB' }];
      if (/\d$/.test(d) && !/nvme|mmcblk/.test(d)) w.push('Indica el disco (sdb), no la partición (sdb1): si no, la USB no arrancará.');
      if (/^\/dev\/(sda|nvme0n1)$/.test(d)) w.push(d + ' suele ser el disco del SISTEMA.');
      return { lines: L, parts: p, warns: w };
    } };

  /* ============================== SCRIPTS ================================ */
  B.cmv = { type: 'builder', id: 'cmv', title: 'comprimirMoverVerificar.sh', prefix: './comprimirMoverVerificar.sh',
    prefixDesc: 'comprime cada subcarpeta, verifica el zip y borra el origen',
    fields: [
      { k: 'n', type: 'check', flag: '-n', label: 'simular', value: true, help: 'muestra qué haría, sin escribir ni borrar' },
      { k: 'k', type: 'check', flag: '-k', label: 'conservar el origen', help: 'verifica pero no borra' },
      { k: 's', type: 'check', flag: '-s', label: 'verificación estricta', help: 'compara el contenido byte a byte' },
      { k: 'y', type: 'check', flag: '-y', label: 'sin confirmar', help: 'no pide escribir SI', warn: 'Sin -n ni -k, -y borra el origen sin preguntar.' },
      { k: 'l', type: 'text', label: 'Registro', flag: '-l', placeholder: 'DESTINO/.registro_FECHA.log', help: 'guarda el registro en {v}' },
      { k: 'o', type: 'text', label: 'Origen', value: '/media/$USER/JohnParte1', pos: true, at: 'end', req: true, help: 'cada subcarpeta de {v} se comprime' },
      { k: 'd', type: 'text', label: 'Destino', value: '/media/$USER/Respaldo', pos: true, at: 'end', req: true, help: 'los .zip se guardan en {v}' }
    ],
    avisos: function (v) { return !v.n && !v.k ? ['Este comando BORRARÁ cada carpeta del origen tras verificar su zip.'] : []; },
    presets: [
      { t: '1. Simular', v: { n: true } },
      { t: '2. Respaldar sin borrar', v: { n: false, k: true, s: true } },
      { t: '3. Mover de verdad', v: { n: false, s: true } }
    ] };

  B.limp = { type: 'builder', id: 'limp', title: 'limpieza.sh',
    fields: [
      { k: 'u', type: 'text', label: 'Unidades (nombres)', placeholder: 'KINGSTON, CASORES', hint: 'separadas por comas' },
      { k: 'r', type: 'text', label: 'Carpetas', placeholder: '~/Documentos/tesis' },
      { k: 'p', type: 'select', label: 'Perfil', options: [['', 'extensiones por defecto'], ['latex', 'latex'], ['python', 'python'], ['editores', 'editores'], ['todo', 'todo']] },
      { k: 'e', type: 'text', label: 'Extensiones extra', placeholder: 'bak,tmp' },
      { k: 'E', type: 'text', label: 'SOLO estas extensiones', placeholder: 'aux,log' },
      { k: 'n', type: 'check', label: 'simular (-n)', value: true },
      { k: 't', type: 'check', label: 'a la papelera (-t)' },
      { k: 'y', type: 'check', label: 'sin confirmar (-y)' },
      { k: 'a', type: 'check', label: 'actualizar el sistema antes (-a, sudo)' }
    ],
    build: function (v, q) {
      var p = [];
      if (v.a) p.push({ t: 'sudo', d: '-a ejecuta apt-get, que requiere administrador' });
      p.push({ t: './limpieza.sh', d: 'borra archivos temporales por extensión' });
      if (v.n) p.push({ t: '-n', d: 'simulación: solo lista' });
      if (v.t) p.push({ t: '-t', d: 'a la papelera en vez de borrar' });
      if (v.y) p.push({ t: '-y', d: 'sin confirmación', w: v.n ? null : 'Sin -n, -y borra sin preguntar.' });
      if (v.a) p.push({ t: '-a', d: 'apt-get update && upgrade antes' });
      if (v.p) p.push({ t: '-p ' + v.p, d: 'añade el perfil de extensiones ' + v.p });
      if (v.e) p.push({ t: '-e ' + q(v.e.replace(/\s+/g, '')), d: 'extensiones adicionales: ' + v.e });
      if (v.E) p.push({ t: '-E ' + q(v.E.replace(/\s+/g, '')), d: 'solo estas extensiones: ' + v.E });
      String(v.u || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (x) {
        p.push({ t: '-u ' + q(x), d: 'unidad montada ' + x });
      });
      if (v.r) p.push({ t: q(v.r), d: 'carpeta a limpiar' });
      var w = [];
      if (!v.u && !v.r) w.push('Sin unidades ni carpetas se usan las rutas por defecto, que incluyen tu carpeta personal completa (y sus carpetas ocultas): revisa con -n.');
      return { lines: [p.map(function (x) { return x.t; }).join(' ')], parts: p, warns: w };
    },
    presets: [
      { t: 'Simular en dos USB', v: { u: 'KINGSTON, CASORES', p: 'latex', n: true } },
      { t: 'Proyecto LaTeX', v: { r: '~/Documentos/tesis', p: 'latex', n: false } },
      { t: 'Como baseAuto.sh', v: { a: true, y: true, n: false } }
    ] };

  B.buscar = { type: 'builder', id: 'buscar', title: 'buscarEnSistema.sh', prefix: './buscarEnSistema.sh',
    prefixDesc: 'busca en todo el sistema y abre una terminal donde está lo encontrado',
    fields: [
      { k: 'pat', type: 'text', label: 'Nombre (o parte)', value: 'informe', pos: true, at: 'end', help: 'busca nombres que contienen {v}' },
      { k: 'ruta', type: 'text', label: 'Dónde', placeholder: 'todo el sistema', pos: true, at: 'end', help: 'solo dentro de {v}' },
      { k: 't', type: 'select', label: 'Tipo', options: [['', 'archivos y carpetas'], ['-t f', 'solo archivos', 'solo archivos'], ['-t d', 'solo carpetas', 'solo carpetas']] },
      { k: 'c', type: 'text', label: 'Contenido', flag: '-c', placeholder: 'texto dentro', help: 'archivos que contienen {v}' },
      { k: 'a', type: 'text', label: 'Últimos N días', flag: '-a', placeholder: '7', raw: true, help: 'modificados en los últimos {v} días' },
      { k: 'T', type: 'text', label: 'Tamaño', flag: '-T', placeholder: '+100M', raw: true, help: 'tamaño {v}' },
      { k: 's', type: 'check', flag: '-s', label: 'con sudo', help: 'también carpetas del sistema y de otros usuarios' },
      { k: 'l', type: 'check', flag: '-l', label: 'sin USB', help: 'solo discos internos (más rápido)' },
      { k: 'e', type: 'check', flag: '-e', label: 'nombre exacto', help: 'nombre exacto, distinguiendo mayúsculas' },
      { k: 'g', type: 'check', flag: '-g', label: 'abrir gestor de archivos', help: 'en vez de la terminal' },
      { k: '1', type: 'check', flag: '-1', label: 'abrir el primero', help: 'sin menú' },
      { k: 'nn', type: 'check', flag: '-n', label: 'solo listar', help: 'no abre nada' }
    ],
    presets: [
      { t: 'Un archivo', v: { pat: 'informe_final' } },
      { t: 'Una carpeta', v: { pat: 'Astro_Luna', t: '-t d' } },
      { t: 'Por contenido en código', v: { pat: '*.py', ruta: '~/proyectos', c: 'def calcular' } },
      { t: 'Archivos enormes', v: { pat: '', T: '+1G', t: '-t f', nn: true } }
    ] };

  /* ================================= IA ================================== */
  B.claude = { type: 'builder', id: 'claude', title: 'claude -p: una tarea sin interfaz',
    fields: [
      { k: 'pr', type: 'text', label: 'Tarea', value: 'Ejecuta los tests y corrige los que fallen' },
      { k: 'in', type: 'text', label: 'Pasar un archivo por la entrada', placeholder: 'error.log' },
      { k: 'pm', type: 'select', label: 'Permisos', options: [
        ['', 'por defecto (deniega lo no permitido)', 'sin --permission-mode: solo se permite lo indicado en --allowedTools'],
        ['plan', 'plan: solo analizar', 'lee y propone, no modifica nada'],
        ['acceptEdits', 'aceptar ediciones', 'aprueba ediciones y comandos de archivos dentro del proyecto'],
        ['auto', 'auto: clasificador', 'un clasificador aprueba lo que considera seguro'],
        ['bypassPermissions', 'sin preguntar NADA', 'aprueba todo', 'bypassPermissions: solo en un contenedor o VM desechable.']] },
      { k: 'tR', type: 'check', label: 'Read' }, { k: 'tE', type: 'check', label: 'Edit' }, { k: 'tB', type: 'check', label: 'Bash' },
      { k: 'out', type: 'select', label: 'Salida', options: [['', 'texto'], ['json', 'JSON'], ['stream-json', 'eventos JSON en vivo']] },
      { k: 'c', type: 'check', label: 'continuar la última conversación (-c)' },
      { k: 'f', type: 'text', label: 'Guardar respuesta en', placeholder: 'resultado.txt' }
    ],
    build: function (v, q) {
      var p = [];
      if (v['in']) p.push({ t: 'cat ' + q(v['in']) + ' |', d: 'envía el contenido de ' + v['in'] + ' como contexto' });
      p.push({ t: 'claude', d: 'Claude Code' });
      if (v.c) p.push({ t: '-c', d: 'continúa la conversación anterior' });
      p.push({ t: '-p ' + q(v.pr || ''), d: 'modo no interactivo: ejecuta la tarea y termina' });
      if (v.pm) p.push({ t: '--permission-mode ' + v.pm, d: { plan: 'solo analiza', acceptEdits: 'acepta ediciones dentro del proyecto', auto: 'aprobación por clasificador', bypassPermissions: 'aprueba todo' }[v.pm],
        w: v.pm === 'bypassPermissions' ? 'bypassPermissions: solo en un contenedor o VM desechable.' : null });
      var t = []; if (v.tR) t.push('Read'); if (v.tE) t.push('Edit'); if (v.tB) t.push('Bash');
      if (t.length) p.push({ t: '--allowedTools ' + q(t.join(',')), d: 'herramientas permitidas sin preguntar: ' + t.join(', ') });
      if (v.out) p.push({ t: '--output-format ' + v.out + (v.out === 'stream-json' ? ' --verbose' : ''), d: v.out === 'json' ? 'un objeto JSON (léelo con jq -r .result)' : 'eventos en vivo (requiere --verbose)' });
      if (v.f) p.push({ t: '> ' + q(v.f), d: 'guarda la respuesta en ' + v.f });
      var w = [];
      if (!v.pm && !t.length) w.push('Sin modo de permisos ni herramientas permitidas, las acciones que requieran aprobación se denegarán.');
      return { lines: [p.map(function (x) { return x.t; }).join(' ')], parts: p, warns: w };
    },
    presets: [
      { t: 'Explicar un error', v: { pr: 'Explica la causa de este error en dos frases', 'in': 'error.log', pm: 'plan' } },
      { t: 'Arreglar tests', v: { pr: 'Ejecuta los tests y corrige los que fallen', pm: 'acceptEdits', tR: true, tE: true, tB: true } },
      { t: 'Resumen en JSON', v: { pr: 'Resume este proyecto', pm: 'plan', out: 'json', f: 'resumen.json' } }
    ] };

  /* ================== INSERTAR CADA CONSTRUCTOR EN SU SECCIÓN ============== */
  function seccion(id) { return C.secciones.filter(function (s) { return s.id === id; })[0]; }

  function listaDePestana(id) {
    var encontrada = null;
    C.secciones.forEach(function (s) {
      (s.blocks || []).forEach(function (b) {
        if (b.type === 'tabs') (b.items || []).forEach(function (it) { if (it.id === id) encontrada = it.blocks; });
      });
    });
    return encontrada;
  }

  /* donde: {sec, antes:'command:find'|'h2:id'|'script:x.sh', despues:..., tab, inicio:true} */
  function insertar(donde, bloque) {
    var lista = donde.tab ? listaDePestana(donde.tab) : (seccion(donde.sec) || {}).blocks;
    if (!lista) { if (global.console) console.warn('Constructor sin destino:', donde); return; }
    var buscar = function (clave) {
      var p = clave.split(':');
      for (var i = 0; i < lista.length; i++) {
        var b = lista[i];
        if (b.type === p[0] && (b.id === p[1] || b.name === p[1] || b.file === p[1])) return i;
      }
      return -1;
    };
    var i = donde.inicio ? 0 : donde.antes ? buscar(donde.antes) : donde.despues ? buscar(donde.despues) + 1 : lista.length;
    if (i < 0 || (donde.despues && i === 0)) i = lista.length;
    lista.splice(i, 0, bloque);
  }

  var global = window;
  insertar({ sec: 'fs-buscar', antes: 'command:find' }, B.find);
  insertar({ sec: 'txt-grep', antes: 'command:grep' }, B.grep);
  insertar({ sec: 'fs-manip', despues: 'h2:rsync' }, B.rsync);
  insertar({ sec: 'fs-manip' }, { type: 'h2', id: 'tar', text: 'Empaquetar y comprimir con tar' });
  insertar({ sec: 'fs-manip' }, B.tar);
  insertar({ sec: 'perm-basico', antes: 'command:chown' }, B.chown);
  insertar({ sec: 'proc-gestion', antes: 'command:kill' }, B.kill);
  insertar({ sec: 'proc-systemd', antes: 'command:systemctl' }, B.systemctl);
  insertar({ sec: 'proc-systemd', antes: 'command:journalctl' }, B.journalctl);
  insertar({ sec: 'script-bash', despues: 'h2:cron' }, B.cron);
  insertar({ sec: 'pkg-apt', antes: 'command:apt' }, B.apt);
  insertar({ sec: 'red-transfer', despues: 'h2:copiar-remoto' }, B.ssh);
  insertar({ tab: 'disco-montar', inicio: true }, B.mount);
  insertar({ tab: 'disco-receta', inicio: true }, B.preparar);
  insertar({ sec: 'resc-datos', despues: 'h2:usb' }, B.ddiso);
  insertar({ tab: 'auto-verificar', antes: 'script:comprimirMoverVerificar.sh' }, B.cmv);
  insertar({ tab: 'auto-limpieza', antes: 'script:limpieza.sh' }, B.limp);
  insertar({ tab: 'auto-buscar', antes: 'script:buscarEnSistema.sh' }, B.buscar);
  insertar({ tab: 'claude-agente', inicio: true }, B.claude);

  /* =================== SECCIÓN QUE LOS REÚNE TODOS ======================== */
  C.registrar({
    id: 'constructores',
    group: 'referencia',
    title: 'Constructor de comandos',
    level: 'basico',
    tags: ['constructor', 'generador', 'interactivo', 'find', 'grep', 'tar', 'rsync', 'chmod', 'chown', 'apt', 'systemctl', 'journalctl', 'cron', 'mount', 'dd', 'mkfs', 'kill', 'scp'],
    lead: 'Construye un comando <b>eligiendo opciones</b> en lugar de recordar la sintaxis: el comando se actualiza al instante, cada parte se explica debajo y los ajustes peligrosos se avisan en rojo. Los mismos constructores aparecen también junto a la explicación de cada comando en el resto de la guía.',
    blocks: [
      { type: 'callout', variant: 'tip', title: 'Cómo se usa',
        html: '<ol><li>Pulsa un <b>caso típico</b> para partir de un ejemplo, o rellena los campos.</li><li>Lee «<b>Cómo se lee este comando</b>»: cada parte con su significado.</li><li>Revisa los <b>avisos en rojo</b> y pulsa <b>Copiar</b>.</li></ol>' },
      { type: 'tabs', id: 'constr-tabs', title: 'Categorías', items: [
        { id: 'constr-archivos', n: '1', t: 'Archivos', blocks: [B.find, B.grep, B.tar, B.rsync] },
        { id: 'constr-permisos', n: '2', t: 'Permisos', blocks: [{ type: 'chmodcalc' }, B.chown] },
        { id: 'constr-procesos', n: '3', t: 'Procesos y servicios', blocks: [B.kill, B.systemctl, B.journalctl, B.cron] },
        { id: 'constr-paquetes', n: '4', t: 'Paquetes y red', blocks: [B.apt, B.ssh] },
        { id: 'constr-discos', n: '5', t: 'Discos y USB', blocks: [B.mount, B.preparar, B.ddiso] },
        { id: 'constr-scripts', n: '6', t: 'Scripts propios', blocks: [B.cmv, B.limp, B.buscar] },
        { id: 'constr-ia', n: '7', t: 'IA', blocks: [B.claude] },
        { id: 'constr-instalar', n: '8', t: 'Instalar', blocks: C.constructoresExtra || [] }
      ]}
    ]
  });

})(window.Contenido);
