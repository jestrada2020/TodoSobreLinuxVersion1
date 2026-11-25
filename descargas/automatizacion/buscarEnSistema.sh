#!/usr/bin/env bash
# ==============================================================================
# Nombre: buscarEnSistema.sh
# Descripción:
#   Búsqueda exhaustiva de archivos o carpetas en TODO el sistema (discos,
#   particiones y memorias USB montadas). Muestra la RUTA COMPLETA de cada
#   resultado y abre una TERMINAL en la carpeta donde está lo encontrado
#   (o el gestor de archivos, con -g).
#
# Uso:
#   ./buscarEnSistema.sh [opciones] PATRÓN [RUTA ...]
#
#   PATRÓN  Parte del nombre (sin distinguir mayúsculas):  informe  →  *informe*
#           o un comodín explícito:  "*.pdf"   "tesis_202?.tex"
#   RUTA    Dónde buscar (por defecto: / completo, incluidos los USB montados)
#
# Qué buscar:
#   -t f|d          Solo archivos (f) o solo carpetas (d)
#   -e, --exacto    Nombre exacto, distinguiendo mayúsculas
#   -r, --regex     El PATRÓN es una expresión regular sobre la ruta completa
#   -c, --contenido TEXTO   Archivos cuyo CONTENIDO incluye TEXTO (PATRÓN opcional: "")
#   -a, --antiguedad N      Modificados en los últimos N días
#   -T, --tamano N          Tamaño, como en find: +100M (más de), -1k (menos de)
#
# Dónde y cómo:
#   -s, --sudo      Buscar con sudo: entra también en carpetas de otros usuarios y del sistema
#   -l, --local     No entrar en USB ni discos externos (/media, /mnt, /run/media)
#   -m, --max N     Máximo de resultados (por defecto 300)
#   -o, --guardar ARCHIVO   Guarda las rutas encontradas en ARCHIVO
#
# Qué hacer con el resultado:
#   -n, --no-abrir  Solo lista, no abre nada
#   -g, --gestor    Abre el gestor de archivos (con el archivo seleccionado) en vez de la terminal
#   -1, --primero   Abre directamente el primer resultado, sin menú
#   -p, --rutas     Solo imprime las rutas, una por línea (para usar en tuberías)
#   -h, --help      Muestra esta ayuda
#
# Ejemplos:
#   ./buscarEnSistema.sh informe_final
#   ./buscarEnSistema.sh -t d Astro_Luna
#   ./buscarEnSistema.sh "*.tex" ~/Documentos
#   ./buscarEnSistema.sh -c "def calcular" "*.py" ~/proyectos
#   ./buscarEnSistema.sh -s -t f sshd_config
#   ./buscarEnSistema.sh -T +1G -n           # (PATRÓN vacío = cualquiera) archivos de más de 1 GB
#   ./buscarEnSistema.sh -p "*.ipynb" | xargs -d '\n' ls -lh
# ==============================================================================

set -uo pipefail

VERDE="\033[0;32m"; AZUL="\033[0;34m"; AMARILLO="\033[1;33m"; ROJO="\033[0;31m"
CYAN="\033[0;36m"; GRIS="\033[0;90m"; NEGRITA="\033[1m"; RESET="\033[0m"
[[ -t 1 ]] || { VERDE=""; AZUL=""; AMARILLO=""; ROJO=""; CYAN=""; GRIS=""; NEGRITA=""; RESET=""; }

mostrar_ayuda() { sed -n '2,/^# =====/{/^# =====/d;s/^# \{0,1\}//;p}' "$0"; }
error() { echo -e "${ROJO}Error: $*${RESET}" >&2; exit 1; }
info()  { (( SOLO_RUTAS )) || echo -e "$*" >&2; }

# ----------------------------- argumentos ------------------------------------
TIPO=""; EXACTO=0; REGEX=0; CONTENIDO=""; DIAS=""; TAMANO=""
USAR_SUDO=0; LOCAL=0; MAX=300; GUARDAR=""; NO_ABRIR=0; GESTOR=0; PRIMERO=0; SOLO_RUTAS=0
POS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t)              TIPO="${2:-}"; [[ "$TIPO" == f || "$TIPO" == d ]] || error "-t admite f (archivo) o d (carpeta)"; shift ;;
    -e|--exacto)     EXACTO=1 ;;
    -r|--regex)      REGEX=1 ;;
    -c|--contenido)  CONTENIDO="${2:-}"; [[ -n "$CONTENIDO" ]] || error "falta el TEXTO de -c"; shift ;;
    -a|--antiguedad) DIAS="${2:-}"; [[ "$DIAS" =~ ^[0-9]+$ ]] || error "-a necesita un número de días"; shift ;;
    -T|--tamano)     TAMANO="${2:-}"; [[ "$TAMANO" =~ ^[+-]?[0-9]+[ckMG]?$ ]] || error "-T: usa formatos como +100M, -10k, +2G"; shift ;;
    -s|--sudo)       USAR_SUDO=1 ;;
    -l|--local)      LOCAL=1 ;;
    -m|--max)        MAX="${2:-}"; [[ "$MAX" =~ ^[0-9]+$ ]] || error "-m necesita un número"; shift ;;
    -o|--guardar)    GUARDAR="${2:-}"; shift ;;
    -n|--no-abrir)   NO_ABRIR=1 ;;
    -g|--gestor)     GESTOR=1 ;;
    -1|--primero)    PRIMERO=1 ;;
    -p|--rutas)      SOLO_RUTAS=1; NO_ABRIR=1 ;;
    -h|--help)       mostrar_ayuda; exit 0 ;;
    --)              shift; POS+=("$@"); break ;;
    -*)              error "opción desconocida: $1 (usa --help)" ;;
    *)               POS+=("$1") ;;
  esac
  shift
done

PATRON="${POS[0]-}"
RAICES=("${POS[@]:1}")

if [[ -z "$PATRON" && -z "$CONTENIDO" && -z "$TAMANO" && -z "$DIAS" && ${#POS[@]} -eq 0 ]]; then
  [[ -t 0 ]] || { mostrar_ayuda; exit 1; }
  read -r -p "¿Qué archivo o carpeta buscas? (parte del nombre): " PATRON
  [[ -n "$PATRON" ]] || error "no has indicado qué buscar."
fi
(( ${#RAICES[@]} )) || RAICES=(/)

for r in "${RAICES[@]}"; do [[ -d "$r" ]] || error "la ruta '$r' no existe o no es una carpeta."; done
if (( USAR_SUDO )); then
  command -v sudo >/dev/null || error "no está sudo."
  sudo -v || error "no se pudo obtener permiso de sudo."
fi

# ------------------------- construcción del find -----------------------------
# Se podan los sistemas de archivos virtuales (no contienen archivos reales y
# recorrerlos es lento o infinito) y las imágenes de snaps (solo lectura y
# duplican contenido).
PODA=( \( -path /proc -o -path /sys -o -path /dev -o -path /run -o -path /snap
          -o -path /var/lib/snapd/snap -o -path /tmp/.X11-unix -o -path /var/lib/docker
          -o -fstype proc -o -fstype sysfs -o -fstype devtmpfs -o -fstype devpts
          -o -fstype squashfs -o -fstype debugfs -o -fstype tracefs -o -fstype securityfs
          -o -fstype cgroup2 -o -fstype fuse.portal -o -fstype fuse.gvfsd-fuse \)
       -prune )
# /run se poda, pero las USB montadas en /run/media/USUARIO (Fedora, Arch) sí interesan
if (( ! LOCAL )) && [[ " ${RAICES[*]} " == " / " ]] && [[ -d /run/media ]]; then
  RAICES+=(/run/media)
fi
if (( LOCAL )); then
  PODA=( \( "${PODA[@]:1:${#PODA[@]}-3}" -o -path /media -o -path /mnt -o -path /run/media \) -prune )
fi

FILTRO=()
if [[ -n "$PATRON" ]]; then
  if (( REGEX )); then
    FILTRO+=( -regextype posix-extended -iregex ".*${PATRON}.*" )
  elif (( EXACTO )); then
    FILTRO+=( -name "$PATRON" )
  elif [[ "$PATRON" == *[\*\?\[]* ]]; then
    FILTRO+=( -iname "$PATRON" )          # comodín explícito del usuario
  else
    FILTRO+=( -iname "*${PATRON}*" )      # «contiene», sin distinguir mayúsculas
  fi
fi
[[ -n "$TIPO" ]]      && FILTRO+=( -type "$TIPO" )
[[ -n "$CONTENIDO" ]] && FILTRO+=( -type f )
[[ -n "$DIAS" ]]      && FILTRO+=( -mtime "-$DIAS" )
[[ -n "$TAMANO" ]]    && FILTRO+=( -size "$TAMANO" )

PREFIJO=(); (( USAR_SUDO )) && PREFIJO=(sudo)

buscar() {
  # 2>/dev/null: los «Permiso denegado» de carpetas ajenas no son resultados
  if [[ -n "$CONTENIDO" ]]; then
    "${PREFIJO[@]}" find "${RAICES[@]}" "${PODA[@]}" -o \( "${FILTRO[@]}" -print0 \) 2>/dev/null \
      | "${PREFIJO[@]}" xargs -0 -r grep -IlZ -F -i -- "$CONTENIDO" 2>/dev/null
  else
    "${PREFIJO[@]}" find "${RAICES[@]}" "${PODA[@]}" -o \( "${FILTRO[@]}" -print0 \) 2>/dev/null
  fi
}

# ------------------------------- búsqueda ------------------------------------
desc="'${PATRON:-*}'"
[[ -n "$CONTENIDO" ]] && desc+=" que contengan «$CONTENIDO»"
info "${CYAN}Buscando${RESET} $desc en ${RAICES[*]} $( ((USAR_SUDO)) && echo '(con sudo)' )…"
inicio=$(date +%s)

# Indicador de progreso mientras find trabaja (solo en terminal)
GIRO_PID=""
if [[ -t 2 ]] && (( ! SOLO_RUTAS )); then
  ( s='|/-\'; i=0; while :; do printf '\r  %s %ds ' "${s:i++%4:1}" $(( $(date +%s) - inicio )) >&2; sleep 0.2; done ) &
  GIRO_PID=$!
fi
parar_giro() { [[ -n "$GIRO_PID" ]] && { kill "$GIRO_PID" 2>/dev/null; wait "$GIRO_PID" 2>/dev/null; printf '\r\033[K' >&2; GIRO_PID=""; }; }
trap 'parar_giro; echo; exit 130' INT TERM

mapfile -d '' -t RESULTADOS < <(buscar | head -z -n "$MAX")
parar_giro
segundos=$(( $(date +%s) - inicio ))
total=${#RESULTADOS[@]}

if (( total == 0 )); then
  info "${AMARILLO}No se encontró nada${RESET} (${segundos}s)."
  (( USAR_SUDO )) || info "${GRIS}Consejo: con -s también se busca en carpetas de otros usuarios y del sistema.${RESET}"
  exit 1
fi

# ------------------------------ resultados -----------------------------------
if (( SOLO_RUTAS )); then
  printf '%s\n' "${RESULTADOS[@]}"
  [[ -n "$GUARDAR" ]] && printf '%s\n' "${RESULTADOS[@]}" > "$GUARDAR"
  exit 0
fi

echo -e "${VERDE}${total} resultado(s)${RESET} en ${segundos}s$( (( total >= MAX )) && echo " ${AMARILLO}(límite de $MAX alcanzado: afina la búsqueda o usa -m)${RESET}")"
echo
for i in "${!RESULTADOS[@]}"; do
  ruta="${RESULTADOS[$i]}"
  if [[ -d "$ruta" ]]; then
    marca="${AZUL}[carpeta]${RESET}"; tam="$(du -sh -- "$ruta" 2>/dev/null | cut -f1)"
  else
    marca="${GRIS}[archivo]${RESET}"; tam="$(stat -c %s -- "$ruta" 2>/dev/null | numfmt --to=iec 2>/dev/null)"
  fi
  fecha="$(date -r "$ruta" '+%Y-%m-%d %H:%M' 2>/dev/null)"
  printf "%b%4d)%b %b %7s  %s  %b%s%b\n" "$CYAN" $((i + 1)) "$RESET" "$marca" "${tam:-?}" "${fecha:-                }" "$NEGRITA" "$ruta" "$RESET"
done
echo

if [[ -n "$GUARDAR" ]]; then
  printf '%s\n' "${RESULTADOS[@]}" > "$GUARDAR" && echo -e "Rutas guardadas en: ${NEGRITA}$(realpath -- "$GUARDAR")${RESET}"
fi
(( NO_ABRIR )) && exit 0

# --------------------------- abrir terminal ----------------------------------
# Carpeta en la que abrir: si es una carpeta, ella misma; si es un archivo, su carpeta.
carpeta_de() { if [[ -d "$1" ]]; then echo "$1"; else dirname -- "$1"; fi; }

# Ejecuta un programa gráfico desligado de este script (sigue abierto al salir).
# Si el script se lanzó con «sudo», la ventana se abre como el usuario real.
lanzar() {
  if (( EUID == 0 )) && [[ -n "${SUDO_USER:-}" ]]; then
    local uid; uid="$(id -u "$SUDO_USER")"
    sudo -u "$SUDO_USER" env DISPLAY="${DISPLAY:-:0}" WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}" \
      XDG_RUNTIME_DIR="/run/user/$uid" DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$uid/bus" \
      setsid "$@" >/dev/null 2>&1 < /dev/null &
  else
    setsid "$@" >/dev/null 2>&1 < /dev/null &
  fi
}

abrir_terminal() {   # $1 carpeta
  local dir="$1"
  if [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
    # Sin entorno gráfico (SSH, consola): se abre una shell nueva en esa carpeta
    echo -e "${CYAN}Sin escritorio: se abre una shell en${RESET} $dir ${GRIS}(escribe exit para volver)${RESET}"
    cd -- "$dir" && exec "${SHELL:-/bin/bash}" -i
  fi
  local t
  for t in "${TERMINAL:-}" ptyxis gnome-terminal kgx konsole xfce4-terminal mate-terminal tilix kitty alacritty wezterm foot xterm x-terminal-emulator; do
    [[ -n "$t" ]] && command -v "$t" >/dev/null 2>&1 || continue
    case "$t" in
      ptyxis)          lanzar ptyxis --new-window -d "$dir" ;;
      gnome-terminal|mate-terminal|xfce4-terminal|kgx)
                       lanzar "$t" --working-directory="$dir" ;;
      konsole)         lanzar konsole --workdir "$dir" ;;
      tilix)           lanzar tilix -w "$dir" ;;
      kitty)           lanzar kitty --directory "$dir" ;;
      alacritty)       lanzar alacritty --working-directory "$dir" ;;
      wezterm)         lanzar wezterm start --cwd "$dir" ;;
      foot)            lanzar foot -D "$dir" ;;
      *)               (cd -- "$dir" && lanzar "$t") ;;   # xterm y genéricos heredan la carpeta actual
    esac
    echo -e "${VERDE}Terminal abierta en:${RESET} ${NEGRITA}$dir${RESET} ${GRIS}($t)${RESET}"
    return 0
  done
  echo -e "${AMARILLO}No se encontró ningún emulador de terminal.${RESET} Ve a la carpeta con:  cd \"$dir\""
}

abrir_gestor() {   # $1 ruta (selecciona el archivo si es posible)
  if command -v nautilus >/dev/null 2>&1 && [[ ! -d "$1" ]]; then
    lanzar nautilus --select "$1"
  else
    lanzar xdg-open "$(carpeta_de "$1")"
  fi
  echo -e "${VERDE}Gestor de archivos abierto en:${RESET} ${NEGRITA}$(carpeta_de "$1")${RESET}"
}

abrir() {   # $1 índice (desde 1)
  local ruta="${RESULTADOS[$(( $1 - 1 ))]}"
  echo -e "Ruta completa: ${NEGRITA}$ruta${RESET}"
  # Copia la ruta al portapapeles si hay herramienta disponible
  if command -v wl-copy >/dev/null 2>&1 && [[ -n "${WAYLAND_DISPLAY:-}" ]]; then printf '%s' "$ruta" | wl-copy 2>/dev/null && echo -e "${GRIS}(copiada al portapapeles)${RESET}"
  elif command -v xclip >/dev/null 2>&1 && [[ -n "${DISPLAY:-}" ]]; then printf '%s' "$ruta" | xclip -selection clipboard 2>/dev/null && echo -e "${GRIS}(copiada al portapapeles)${RESET}"
  fi
  if (( GESTOR )); then abrir_gestor "$ruta"; else abrir_terminal "$(carpeta_de "$ruta")"; fi
}

if (( total == 1 || PRIMERO )); then
  abrir 1
  exit 0
fi

[[ -t 0 ]] || exit 0   # sin teclado (tubería): solo listar
while :; do
  read -r -p "Número a abrir (varios separados por espacios, Enter para salir): " eleccion || break
  [[ -z "$eleccion" ]] && break
  validos=0
  for n in $eleccion; do
    if [[ "$n" =~ ^[0-9]+$ ]] && (( n >= 1 && n <= total )); then abrir "$n"; validos=1
    else echo -e "${ROJO}'$n' no es un número de la lista (1-$total)${RESET}"; fi
  done
  (( validos )) && break
done
