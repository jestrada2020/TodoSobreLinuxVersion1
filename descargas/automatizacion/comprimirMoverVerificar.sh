#!/usr/bin/env bash
# ==============================================================================
# Nombre: comprimirMoverVerificar.sh   (versión avanzada de comprimidoYmovimiento.sh)
# Descripción:
#   Para cada subcarpeta del ORIGEN:
#     1. comprueba que hay espacio libre en el DESTINO,
#     2. la comprime en un .zip temporal escrito directamente en el DESTINO,
#     3. VERIFICA el zip contra la carpeta original:
#          - integridad del zip (CRC de cada entrada),
#          - que están TODOS los archivos, enlaces y carpetas (mismos nombres),
#          - que cada archivo tiene el mismo tamaño,
#          - con --estricto, además, el contenido byte a byte (CRC del origen),
#     4. solo si todo coincide: fija el nombre final, sincroniza el disco y
#        BORRA la carpeta de origen.
#   Si la verificación falla, la carpeta de origen NO se toca.
#
# Uso:
#   ./comprimirMoverVerificar.sh [opciones] ORIGEN DESTINO
#
# Opciones:
#   -n, --simular      Muestra qué haría, sin comprimir ni borrar nada.
#   -k, --conservar    Comprime, mueve y verifica, pero NO borra el origen.
#   -s, --estricto     Verificación byte a byte (relee el origen; más lento).
#   -y, --si           No pide confirmación antes de empezar a borrar.
#   -l, --log ARCHIVO  Registro (por defecto: DESTINO/.registro_AAAA-MM-DD_HHMMSS.log).
#   -h, --help         Muestra esta ayuda.
#
# Reanudación: si se interrumpe, vuelve a ejecutarlo con los mismos argumentos.
#   Un .zip ya presente en el destino se VERIFICA de nuevo y, si es correcto y
#   el origen sigue existiendo, se completa el borrado pendiente.
#
# Códigos de salida: 0 todo bien · 1 error de uso · 2 alguna carpeta falló.
# Requisitos: bash, zip, python3, coreutils (Ubuntu los trae; zip: sudo apt install zip).
# ==============================================================================

set -uo pipefail

VERDE="\033[0;32m"; AZUL="\033[0;34m"; AMARILLO="\033[1;33m"
ROJO="\033[0;31m"; CYAN="\033[0;36m"; NEGRITA="\033[1m"; RESET="\033[0m"
[[ -t 1 ]] || { VERDE=""; AZUL=""; AMARILLO=""; ROJO=""; CYAN=""; NEGRITA=""; RESET=""; }

SIMULAR=0; CONSERVAR=0; ESTRICTO=0; SIN_CONFIRMAR=0; LOG=""
TMP_ACTUAL=""

mostrar_ayuda() { sed -n '2,/^# =====/{/^# =====/d;s/^# \{0,1\}//;p}' "$0"; }

# ----------------------------- argumentos ------------------------------------
POSICIONALES=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--simular)   SIMULAR=1 ;;
    -k|--conservar) CONSERVAR=1 ;;
    -s|--estricto)  ESTRICTO=1 ;;
    -y|--si)        SIN_CONFIRMAR=1 ;;
    -l|--log)       LOG="${2:-}"; shift ;;
    -h|--help)      mostrar_ayuda; exit 0 ;;
    --)             shift; POSICIONALES+=("$@"); break ;;
    -*)             echo -e "${ROJO}Opción desconocida: $1${RESET} (usa --help)" >&2; exit 1 ;;
    *)              POSICIONALES+=("$1") ;;
  esac
  shift
done

ORIGEN="${POSICIONALES[0]:-}"
DESTINO="${POSICIONALES[1]:-}"
if [[ -z "$ORIGEN" ]]; then
  echo -e "${CYAN}=== Comprimir, mover, verificar y borrar ===${RESET}"
  read -r -p "Ruta de la carpeta/disco de ORIGEN: " ORIGEN
fi
if [[ -z "$DESTINO" ]]; then
  read -r -p "Ruta de la carpeta/disco de DESTINO: " DESTINO
fi
ORIGEN="${ORIGEN%/}"; DESTINO="${DESTINO%/}"

# ----------------------------- validaciones ----------------------------------
error() { echo -e "${ROJO}Error: $*${RESET}" >&2; exit 1; }

[[ -d "$ORIGEN" ]] || error "el origen '$ORIGEN' no existe o no es un directorio."
for c in zip python3 realpath df du sync; do
  command -v "$c" >/dev/null 2>&1 || error "falta la utilidad '$c' (sudo apt install ${c/python3/python3-minimal})."
done

ORIGEN_REAL="$(realpath -e -- "$ORIGEN")"
DESTINO_REAL="$(realpath -m -- "$DESTINO")"

# El destino no puede estar dentro del origen: se comprimiría a sí mismo y
# podría borrarse junto con la carpeta de origen.
case "$DESTINO_REAL/" in
  "$ORIGEN_REAL"/*) error "el destino está DENTRO del origen ($DESTINO_REAL). Elige otro destino." ;;
esac
[[ "$ORIGEN_REAL" == "/" ]] && error "el origen no puede ser la raíz del sistema."
case "$ORIGEN_REAL" in
  /bin|/boot|/dev|/etc|/lib|/lib64|/proc|/run|/sbin|/sys|/usr|/var|/home|/media|/mnt)
    error "por seguridad no se procesa '$ORIGEN_REAL' directamente. Indica una carpeta o disco concreto." ;;
esac
[[ -w "$ORIGEN_REAL" ]] || (( SIMULAR || CONSERVAR )) || error "no tienes permiso de escritura en el origen: no se podrían borrar las carpetas."

# Crear el destino solo DESPUÉS de las comprobaciones de seguridad
if [[ ! -d "$DESTINO" ]]; then
  if (( SIMULAR )); then
    echo -e "${AMARILLO}[simulación] Se crearía el destino: $DESTINO${RESET}"
  else
    mkdir -p "$DESTINO" || error "no se pudo crear el destino '$DESTINO'."
  fi
fi

# Un único proceso a la vez sobre el mismo destino
if [[ -d "$DESTINO" ]] && command -v flock >/dev/null 2>&1; then
  # (la redirección 2> va en el grupo { } para no silenciar el script entero)
  if { exec 9>"$DESTINO/.comprimirMoverVerificar.lock"; } 2>/dev/null; then
    flock -n 9 || error "ya hay otra ejecución trabajando sobre este destino."
  fi
fi

# Registro
if (( ! SIMULAR )); then
  [[ -z "$LOG" ]] && LOG="$DESTINO/.registro_$(date +%F_%H%M%S).log"
  exec > >(tee -a "$LOG") 2>&1
fi

# Interrupción: se borra el zip temporal a medias; el origen queda intacto.
al_interrumpir() {
  echo -e "\n${AMARILLO}Interrumpido. Se elimina el temporal y el origen queda intacto.${RESET}"
  [[ -n "$TMP_ACTUAL" ]] && rm -f -- "$TMP_ACTUAL"
  exit 130
}
trap al_interrumpir INT TERM

# --------------------------- verificador (python) -----------------------------
# Compara el zip con la carpeta: nombres, tipos, tamaños, integridad y,
# en modo estricto, el CRC32 del contenido de cada archivo de origen.
verificar_zip() {   # $1 zip  $2 carpeta padre  $3 nombre carpeta  $4 estricto(0/1)
  python3 -I - "$1" "$2" "$3" "$4" <<'PY'
import os, sys, zipfile, zlib, stat

zpath, padre, nombre, estricto = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] == "1"

def nombre_real(info):
    # zip 3.0 de Info-ZIP no marca los nombres UTF-8 (bit 11) y Python los
    # decodifica como cp437. Se recuperan los bytes originales.
    if info.flag_bits & 0x800:
        return info.filename
    try:
        return info.filename.encode("cp437").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return info.filename

# 1) Lo que hay en el origen
origen = {}   # ruta relativa -> (tipo, tamaño, ruta absoluta)
raiz = os.path.join(padre, nombre)
origen[nombre + "/"] = ("d", 0, raiz)
for dirpath, dirnames, filenames in os.walk(raiz, followlinks=False):
    rel_dir = os.path.relpath(dirpath, padre)
    for d in dirnames:
        p = os.path.join(dirpath, d)
        rel = os.path.join(rel_dir, d)
        if os.path.islink(p):
            origen[rel] = ("l", os.lstat(p).st_size, p)
        else:
            origen[rel + "/"] = ("d", 0, p)
    for f in filenames:
        p = os.path.join(dirpath, f)
        st = os.lstat(p)
        if stat.S_ISLNK(st.st_mode):
            origen[os.path.join(rel_dir, f)] = ("l", st.st_size, p)
        elif stat.S_ISREG(st.st_mode):
            origen[os.path.join(rel_dir, f)] = ("f", st.st_size, p)
        # sockets, FIFOs y dispositivos no se pueden guardar en un zip: se ignoran

# 2) Lo que hay en el zip
try:
    z = zipfile.ZipFile(zpath)
except Exception as e:
    print(f"   zip ilegible: {e}"); sys.exit(1)

enzip = {}
for info in z.infolist():
    n = nombre_real(info)
    es_link = (info.external_attr >> 16) & 0o170000 == 0o120000
    tipo = "d" if n.endswith("/") else ("l" if es_link else "f")
    enzip[n] = (tipo, info.file_size, info)

errores = []
faltan = sorted(set(origen) - set(enzip))
sobran = sorted(set(enzip) - set(origen))
for n in faltan[:10]: errores.append(f"falta en el zip: {n}")
if len(faltan) > 10: errores.append(f"... y {len(faltan) - 10} más que faltan")
for n in sobran[:5]: errores.append(f"en el zip pero no en el origen: {n}")

for n in set(origen) & set(enzip):
    t_o, s_o, _ = origen[n]; t_z, s_z, _ = enzip[n]
    if t_o != t_z:
        errores.append(f"tipo distinto ({t_o}≠{t_z}): {n}")
    elif t_o in "fl" and s_o != s_z:
        errores.append(f"tamaño distinto ({s_o}≠{s_z} bytes): {n}")

# 3) Integridad del propio zip (lee y comprueba el CRC de cada entrada)
try:
    malo = z.testzip()
    if malo: errores.append(f"entrada dañada en el zip: {malo}")
except Exception as e:
    errores.append(f"error al comprobar el zip: {e}")

# 4) Estricto: CRC32 del contenido de origen frente al CRC guardado
if estricto and not errores:
    for n, (t, _, p) in origen.items():
        if t != "f": continue
        crc = 0
        try:
            with open(p, "rb") as fh:
                for bloque in iter(lambda: fh.read(1 << 20), b""):
                    crc = zlib.crc32(bloque, crc)
        except OSError as e:
            errores.append(f"no se pudo leer {n}: {e}"); continue
        if crc != enzip[n][2].CRC:
            errores.append(f"contenido distinto: {n}")

archivos = sum(1 for v in origen.values() if v[0] == "f")
total = sum(v[1] for v in origen.values() if v[0] == "f")
if errores:
    for e in errores[:20]: print("   ✗ " + e)
    sys.exit(1)
bytes_txt = f"{total:,}".replace(",", ".")
print(f"   ✓ {archivos} archivos, {len(origen) - archivos} carpetas/enlaces, "
      f"{bytes_txt} bytes{' · contenido verificado' if estricto else ''}")
PY
}

# ----------------------------- inventario ------------------------------------
carpetas=()
while IFS= read -r -d $'\0' d; do
  b="$(basename "$d")"
  [[ "$b" == .* ]] || carpetas+=("$b")      # omite ocultas (.Trash-1000, etc.)
done < <(find "$ORIGEN" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)

total=${#carpetas[@]}
(( total > 0 )) || { echo -e "${AMARILLO}No hay subcarpetas en '$ORIGEN'.${RESET}"; exit 0; }

modo="comprimir → verificar → BORRAR origen"
(( CONSERVAR )) && modo="comprimir → verificar (el origen se conserva)"
(( SIMULAR ))   && modo="SIMULACIÓN (no se escribe ni se borra nada)"

echo -e "${CYAN}======================================================================${RESET}"
echo -e "${AZUL}Origen:${RESET}       $ORIGEN_REAL"
echo -e "${AZUL}Destino:${RESET}      $DESTINO_REAL"
echo -e "${AZUL}Carpetas:${RESET}     $total"
echo -e "${AZUL}Modo:${RESET}         $modo"
echo -e "${AZUL}Verificación:${RESET} $( ((ESTRICTO)) && echo 'estricta (byte a byte)' || echo 'nombres + tamaños + integridad del zip')"
[[ -n "$LOG" ]] && echo -e "${AZUL}Registro:${RESET}     $LOG"
echo -e "${CYAN}======================================================================${RESET}"

if (( ! SIMULAR && ! CONSERVAR && ! SIN_CONFIRMAR )); then
  echo -e "${AMARILLO}Cada carpeta se BORRARÁ del origen tras verificar su zip.${RESET}"
  read -r -p "Escribe SI para continuar: " resp
  [[ "$resp" == "SI" ]] || { echo "Cancelado."; exit 0; }
fi

# ----------------------------- proceso ---------------------------------------
n=0; ok=0; reanudadas=0; omitidas=0; fallidas=0; liberado=0

borrar_origen() {   # $1 nombre
  (( CONSERVAR )) && { echo -e "   ${AZUL}[CONSERVADA]${RESET} el origen no se borra (--conservar)"; return; }
  local bytes; bytes=$(du -sb -- "$ORIGEN/$1" 2>/dev/null | cut -f1)
  if rm -rf -- "${ORIGEN:?}/$1"; then
    liberado=$(( liberado + ${bytes:-0} ))
    echo -e "   ${VERDE}[BORRADA]${RESET} carpeta de origen eliminada"
  else
    echo -e "   ${ROJO}[AVISO]${RESET} el zip es correcto pero no se pudo borrar todo el origen" >&2
    fallidas=$((fallidas + 1))
  fi
}

for dir in "${carpetas[@]}"; do
  n=$((n + 1))
  zip_final="$DESTINO/$dir.zip"
  TMP_ACTUAL="$DESTINO/$dir.zip.tmp"
  echo -e "\n${CYAN}[$n/$total]${RESET} ${AZUL}$(date +%H:%M:%S)${RESET} ${NEGRITA}$dir${RESET}"

  # --- Reanudación: el zip ya está en el destino ---
  if [[ -f "$zip_final" ]]; then
    echo -e "   ya existe '$dir.zip': se verifica contra el origen…"
    if (( SIMULAR )); then
      echo -e "   ${AMARILLO}[simulación]${RESET} se verificaría y, si es correcto, se borraría el origen"
      continue
    fi
    if verificar_zip "$zip_final" "$ORIGEN" "$dir" "$ESTRICTO"; then
      borrar_origen "$dir"; reanudadas=$((reanudadas + 1))
    else
      echo -e "   ${ROJO}[NO COINCIDE]${RESET} el zip existente no corresponde al origen: no se toca nada" >&2
      omitidas=$((omitidas + 1))
    fi
    continue
  fi

  # --- Espacio libre en el destino (peor caso: tamaño sin comprimir + 5 %) ---
  necesita=$(du -sb -- "$ORIGEN/$dir" 2>/dev/null | cut -f1)
  necesita=$(( ${necesita:-0} * 105 / 100 ))
  if [[ -d "$DESTINO" ]]; then
    libre=$(( $(df --output=avail -B1 -- "$DESTINO" | tail -1) ))
    if (( necesita > libre )); then
      echo -e "   ${ROJO}[SIN ESPACIO]${RESET} necesita ~$(numfmt --to=iec "$necesita"), libres $(numfmt --to=iec "$libre"). Se omite." >&2
      fallidas=$((fallidas + 1)); continue
    fi
  fi

  if (( SIMULAR )); then
    echo -e "   ${AMARILLO}[simulación]${RESET} se comprimiría (~$(numfmt --to=iec "$necesita") sin comprimir), se verificaría y $( ((CONSERVAR)) && echo 'se conservaría' || echo 'se borraría') el origen"
    continue
  fi

  # --- 1. Comprimir directamente en el destino como .tmp ---
  inicio=$(date +%s)
  rm -f -- "$TMP_ACTUAL"
  # -y guarda los enlaces simbólicos como enlaces (no copia su destino)
  if ! (cd "$ORIGEN" && zip -r -y -q "$TMP_ACTUAL" "$dir"); then
    echo -e "   ${ROJO}[ERROR]${RESET} falló la compresión; el origen queda intacto" >&2
    rm -f -- "$TMP_ACTUAL"; fallidas=$((fallidas + 1)); continue
  fi

  # --- 2. Volcar a disco antes de verificar (importante en USB) ---
  sync -f -- "$TMP_ACTUAL" 2>/dev/null || sync

  # --- 3. Verificar ---
  if ! verificar_zip "$TMP_ACTUAL" "$ORIGEN" "$dir" "$ESTRICTO"; then
    echo -e "   ${ROJO}[VERIFICACIÓN FALLIDA]${RESET} se descarta el zip; el origen queda intacto" >&2
    rm -f -- "$TMP_ACTUAL"; fallidas=$((fallidas + 1)); continue
  fi

  # --- 4. Nombre definitivo y borrado del origen ---
  mv -- "$TMP_ACTUAL" "$zip_final" && sync -f -- "$zip_final" 2>/dev/null
  TMP_ACTUAL=""
  echo -e "   ${VERDE}[OK]${RESET} '$dir.zip' ($(du -sh -- "$zip_final" | cut -f1)) en $(( $(date +%s) - inicio ))s"
  borrar_origen "$dir"
  ok=$((ok + 1))
done

echo -e "\n${CYAN}======================================================================${RESET}"
echo -e "${VERDE}Resumen${RESET}"
echo -e "  Comprimidas y verificadas: ${VERDE}$ok${RESET}"
echo -e "  Reanudadas (zip previo):   ${VERDE}$reanudadas${RESET}"
echo -e "  Omitidas (zip no coincide):${AMARILLO} $omitidas${RESET}"
echo -e "  Con errores:               ${ROJO}$fallidas${RESET}"
(( liberado > 0 )) && echo -e "  Espacio liberado en origen: $(numfmt --to=iec "$liberado")"
[[ -n "$LOG" ]] && echo -e "  Registro: $LOG"
echo -e "${CYAN}======================================================================${RESET}"

(( fallidas == 0 && omitidas == 0 )) || exit 2
exit 0
