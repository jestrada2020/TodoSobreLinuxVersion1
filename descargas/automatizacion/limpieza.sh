#!/usr/bin/env bash
# ==============================================================================
# Nombre: limpieza.sh   (versión ampliada de baseAuto.sh)
# Descripción:
#   Borra archivos temporales (por defecto los auxiliares de LaTeX y los .log)
#   en las UNIDADES o CARPETAS que indiques, con las EXTENSIONES que quieras.
#   Antes de borrar muestra cuántos archivos y cuánto espacio ocupan, y pide
#   confirmación. Opcionalmente actualiza el sistema (apt) como baseAuto.sh.
#
# Uso:
#   ./limpieza.sh [opciones] [RUTA ...]
#
# Dónde limpiar (si no indicas ninguna, se usan las rutas de RUTAS_POR_DEFECTO):
#   RUTA ...               Carpetas o puntos de montaje a limpiar.
#   -u, --unidad NOMBRE    Unidad montada por su nombre (p. ej. KINGSTON, CASORES).
#                          Se busca en /media/USUARIO y /run/media/USUARIO. Repetible.
#   -i, --interactivo      Muestra las unidades montadas y te deja elegirlas.
#   -L, --listar-unidades  Solo lista las unidades montadas y termina.
#
# Qué borrar:
#   -e, --ext LISTA        Extensiones ADICIONALES, separadas por comas o repitiendo
#                          la opción:  -e bbl,blg -e fls   (sin punto ni asterisco).
#   -E, --solo-ext LISTA   Usa SOLO estas extensiones (ignora las predeterminadas).
#   -p, --perfil NOMBRE    Añade un grupo de extensiones: latex | python | editores | todo
#   -x, --excluir PATRÓN   No entrar en carpetas con ese nombre (repetible). Por
#                          defecto se excluyen: .git node_modules .venv .Trash-1000
#
# Cómo:
#   -n, --simular          Lista lo que se borraría, sin borrar nada.
#   -t, --papelera         Envía a la papelera (gio trash) en vez de borrar.
#   -y, --si               No pide confirmación.
#   -a, --actualizar       Antes de limpiar ejecuta apt-get update && upgrade (requiere sudo).
#   -h, --help             Muestra esta ayuda.
#
# Ejemplos:
#   ./limpieza.sh -n                                  # qué borraría con la configuración por defecto
#   ./limpieza.sh -u KINGSTON -u CASORES -p latex     # dos memorias USB, perfil LaTeX completo
#   ./limpieza.sh -e bak,tmp ~/Documentos             # extensiones extra en una carpeta
#   ./limpieza.sh -E pyc -x .venv ~/proyectos         # solo .pyc
#   ./limpieza.sh -i                                  # elegir unidades en un menú
#   sudo ./limpieza.sh -a -y                          # como baseAuto.sh: actualizar y limpiar
# ==============================================================================

set -uo pipefail

# ------------------------- configuración por defecto -------------------------
USUARIO="${SUDO_USER:-$USER}"
CASA="$(getent passwd "$USUARIO" | cut -d: -f6)"; CASA="${CASA:-$HOME}"

# Rutas de baseAuto.sh (sin duplicados). Edítalas a tu gusto.
RUTAS_POR_DEFECTO=(
  "$CASA"
  "/media/$USUARIO/b56cad9f-ad3d-4fb1-88c8-f1fc943e6b4a/home/$USUARIO"
  "/media/$USUARIO/CASORES"
  "/media/$USUARIO/KINGSTON"
  "/media/$USUARIO/1A68-304A"
  "/media/$USUARIO/USB321"
)

EXT_POR_DEFECTO=(toc log aux out synctex.gz)

declare -A PERFILES=(
  [latex]="toc log aux out synctex.gz nav snm vrb bbl blg bcf run.xml fls fdb_latexmk lof lot xdv idx ilg ind"
  [python]="pyc pyo"
  [editores]="swp swo bak orig"
)
PERFILES[todo]="${PERFILES[latex]} ${PERFILES[python]} ${PERFILES[editores]}"

EXCLUIR=(.git node_modules .venv .Trash-1000)

VERDE="\033[0;32m"; AMARILLO="\033[1;33m"; ROJO="\033[0;31m"; CYAN="\033[0;36m"; RESET="\033[0m"
[[ -t 1 ]] || { VERDE=""; AMARILLO=""; ROJO=""; CYAN=""; RESET=""; }

mostrar_ayuda() { sed -n '2,/^# =====/{/^# =====/d;s/^# \{0,1\}//;p}' "$0"; }
error() { echo -e "${ROJO}Error: $*${RESET}" >&2; exit 1; }

# ------------------------------ unidades -------------------------------------
listar_unidades() {
  # Puntos de montaje bajo /media/USUARIO y /run/media/USUARIO, con tamaño y uso
  findmnt -rn -o TARGET,SIZE,USE%,FSTYPE 2>/dev/null \
    | awk -v a="/media/$USUARIO/" -v b="/run/media/$USUARIO/" 'index($1,a)==1 || index($1,b)==1' \
    | sed 's/\\x20/ /g'
}

ruta_de_unidad() {   # nombre → punto de montaje
  local n="$1" r
  for r in "/media/$USUARIO/$n" "/run/media/$USUARIO/$n"; do
    [[ -d "$r" ]] && { echo "$r"; return 0; }
  done
  return 1
}

# ----------------------------- argumentos ------------------------------------
RUTAS=(); EXT_EXTRA=(); EXT_SOLO=(); SIMULAR=0; PAPELERA=0; SI=0; ACTUALIZAR=0; INTERACTIVO=0

anadir_lista() {   # "a,b c" → elementos en el array cuyo nombre se pasa en $1
  # read -ra NO expande comodines: "*.pyc" llega tal cual (un bucle for sí los expandiría)
  local -n destino=$1; local -a items; local item
  IFS=', ' read -ra items <<<"$2"
  for item in "${items[@]}"; do [[ -n "$item" ]] && destino+=("$item"); done
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -u|--unidad)   [[ -n "${2:-}" ]] || error "falta el nombre de la unidad"
                   r="$(ruta_de_unidad "$2")" || { echo -e "${AMARILLO}!!! Unidad '$2' no montada: se omite${RESET}"; shift 2; continue; }
                   RUTAS+=("$r"); shift ;;
    -e|--ext)      anadir_lista EXT_EXTRA "${2:-}"; shift ;;
    -E|--solo-ext) anadir_lista EXT_SOLO "${2:-}"; shift ;;
    -p|--perfil)   [[ -n "${PERFILES[${2:-}]:-}" ]] || error "perfil desconocido '${2:-}' (latex, python, editores, todo)"
                   anadir_lista EXT_EXTRA "${PERFILES[$2]}"; shift ;;
    -x|--excluir)  EXCLUIR+=("${2:-}"); shift ;;
    -n|--simular)  SIMULAR=1 ;;
    -t|--papelera) PAPELERA=1 ;;
    -y|--si)       SI=1 ;;
    -a|--actualizar) ACTUALIZAR=1 ;;
    -i|--interactivo) INTERACTIVO=1 ;;
    -L|--listar-unidades) listar_unidades; exit 0 ;;
    -h|--help)     mostrar_ayuda; exit 0 ;;
    --)            shift; RUTAS+=("$@"); break ;;
    -*)            error "opción desconocida: $1 (usa --help)" ;;
    *)             RUTAS+=("$1") ;;
  esac
  shift
done

# ------------------------------ modo interactivo -----------------------------
if (( INTERACTIVO )); then
  mapfile -t UNIDADES < <(listar_unidades)
  echo -e "${CYAN}Unidades montadas:${RESET}"
  echo "  0) Carpeta personal ($CASA)"
  for i in "${!UNIDADES[@]}"; do echo "  $((i + 1))) ${UNIDADES[$i]}"; done
  read -r -p "Números a limpiar (p. ej. 0 2 3): " seleccion
  for s in $seleccion; do
    if [[ "$s" == 0 ]]; then RUTAS+=("$CASA")
    elif [[ "$s" =~ ^[0-9]+$ ]] && (( s >= 1 && s <= ${#UNIDADES[@]} )); then
      RUTAS+=("$(awk '{print $1}' <<<"${UNIDADES[$((s - 1))]}" | sed 's/\\x20/ /g')")
    fi
  done
  echo -e "Extensiones por defecto: ${EXT_POR_DEFECTO[*]}"
  read -r -p "Extensiones adicionales (separadas por comas, Enter para ninguna): " extra
  [[ -n "$extra" ]] && anadir_lista EXT_EXTRA "$extra"
fi

# --------------------------- actualizar (opcional) ---------------------------
if (( ACTUALIZAR )); then
  (( EUID == 0 )) || error "--actualizar necesita sudo:  sudo $0 -a ..."
  if (( SIMULAR )); then
    echo -e "${AMARILLO}[simulación] se ejecutaría apt-get update && apt-get upgrade -y${RESET}"
  else
    echo -e "${CYAN}>>> Actualizando el sistema${RESET}"
    /usr/bin/apt-get update && /usr/bin/apt-get upgrade -y || echo -e "${ROJO}!!! La actualización falló; se continúa con la limpieza${RESET}"
  fi
fi

# ------------------------------ extensiones ----------------------------------
if (( ${#EXT_SOLO[@]} )); then EXTS=("${EXT_SOLO[@]}"); else EXTS=("${EXT_POR_DEFECTO[@]}" "${EXT_EXTRA[@]}"); fi

declare -A vistas=(); LIMPIAS=()
for e in "${EXTS[@]}"; do
  e="${e#\*}"; e="${e#.}"                       # acepta "*.log", ".log" o "log"
  [[ -z "$e" ]] && continue
  [[ "$e" =~ ^[A-Za-z0-9._+-]+$ ]] || error "extensión no válida: '$e'"
  case "$e" in sh|py|tex|c|h|js|md|txt|pdf|doc|docx|odt|jpg|png|zip|bib|cls|sty)
    error "por seguridad no se borra la extensión '.$e' (es un archivo de trabajo, no temporal)";;
  esac
  [[ -n "${vistas[$e]:-}" ]] || { vistas[$e]=1; LIMPIAS+=("$e"); }
done
(( ${#LIMPIAS[@]} )) || error "no hay extensiones que limpiar."

# --------------------------------- rutas -------------------------------------
(( ${#RUTAS[@]} )) || RUTAS=("${RUTAS_POR_DEFECTO[@]}")

PROHIBIDAS=(/ /bin /boot /dev /etc /lib /lib64 /opt /proc /root /run /sbin /srv /sys /usr /var /media /mnt /home)
FINALES=()
for r in "${RUTAS[@]}"; do
  if [[ ! -d "$r" ]]; then echo -e "${AMARILLO}!!! OMITIDA (no existe o la unidad no está montada): $r${RESET}"; continue; fi
  real="$(realpath -e -- "$r")"
  for p in "${PROHIBIDAS[@]}"; do
    [[ "$real" == "$p" ]] && { echo -e "${ROJO}!!! OMITIDA por seguridad (directorio del sistema): $real${RESET}"; continue 2; }
  done
  FINALES+=("$real")
done

# Quita duplicados y rutas contenidas en otra ya incluida (baseAuto.sh repetía
# /home/john y varias de sus subcarpetas, y CASORES dos veces).
mapfile -t ORDENADAS < <(printf '%s\n' "${FINALES[@]}" | sort -u)
DIRS=()
for r in "${ORDENADAS[@]}"; do
  dentro=0
  for d in "${DIRS[@]}"; do [[ "$r/" == "$d/"* ]] && { dentro=1; break; }; done
  (( dentro )) || DIRS+=("$r")
done
(( ${#DIRS[@]} )) || error "ninguna de las rutas indicadas existe."

# --------------------------- construir el find -------------------------------
NOMBRES=(); for e in "${LIMPIAS[@]}"; do NOMBRES+=(-o -name "*.$e"); done; NOMBRES=("${NOMBRES[@]:1}")
PODA=();    for x in "${EXCLUIR[@]}"; do PODA+=(-o -name "$x"); done;    PODA=("${PODA[@]:1}")

buscar() {   # $1 ruta → lista NUL-terminada; -xdev: no cruza a otros discos montados
  find "$1" -xdev \( -type d \( "${PODA[@]}" \) -prune \) -o \( -type f \( "${NOMBRES[@]}" \) -print0 \) 2>/dev/null
}

echo -e "${CYAN}======================================================================${RESET}"
echo -e "Extensiones: ${LIMPIAS[*]/#/.}"
echo -e "Excluidas:   ${EXCLUIR[*]}"
echo -e "Modo:        $( ((SIMULAR)) && echo 'SIMULACIÓN' || { ((PAPELERA)) && echo 'a la papelera' || echo 'borrado definitivo'; })"
echo -e "${CYAN}======================================================================${RESET}"

# --------------------------- inventario previo -------------------------------
total_n=0; total_b=0
declare -A N_POR=() B_POR=()
for d in "${DIRS[@]}"; do
  n=0; b=0
  while IFS= read -r -d '' f; do
    n=$((n + 1)); b=$(( b + $(stat -c %s -- "$f" 2>/dev/null || echo 0) ))
    (( SIMULAR )) && echo "   $f"
  done < <(buscar "$d")
  N_POR[$d]=$n; B_POR[$d]=$b; total_n=$((total_n + n)); total_b=$((total_b + b))
  printf "  %-60s %6d archivos  %8s\n" "$d" "$n" "$(numfmt --to=iec "$b")"
done
echo -e "  ${VERDE}TOTAL: $total_n archivos, $(numfmt --to=iec "$total_b")${RESET}"

(( SIMULAR )) && { echo -e "${AMARILLO}Simulación: no se ha borrado nada.${RESET}"; exit 0; }
(( total_n > 0 )) || { echo "Nada que limpiar."; exit 0; }

if (( ! SI )); then
  read -r -p "¿Borrar estos $total_n archivos? Escribe SI para continuar: " resp
  [[ "$resp" == "SI" ]] || { echo "Cancelado."; exit 0; }
fi

if (( PAPELERA )) && ! command -v gio >/dev/null 2>&1; then
  error "no está 'gio' para usar la papelera (sudo apt install libglib2.0-bin)"
fi

# -------------------------------- limpieza -----------------------------------
borrados=0; fallos=0
for d in "${DIRS[@]}"; do
  (( ${N_POR[$d]} > 0 )) || continue
  echo -e ">>> Limpiando: $d"
  while IFS= read -r -d '' f; do
    if (( PAPELERA )); then gio trash -- "$f" 2>/dev/null; else rm -f -- "$f"; fi \
      && borrados=$((borrados + 1)) || { fallos=$((fallos + 1)); echo -e "   ${ROJO}no se pudo borrar:${RESET} $f"; }
  done < <(buscar "$d")
done

echo -e "${VERDE}Hecho: $borrados archivos eliminados, $(numfmt --to=iec "$total_b") liberados aprox.${RESET}"
(( fallos == 0 )) || { echo -e "${ROJO}$fallos archivos no se pudieron borrar (¿permisos? prueba con sudo)${RESET}"; exit 2; }
