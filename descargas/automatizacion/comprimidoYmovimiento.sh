#!/usr/bin/env bash
# ==============================================================================
# Nombre: comprimidoYmovimiento.sh
# Descripción: Comprime individualmente cada subcarpeta de un directorio o disco
#              de origen y traslada el archivo comprimido (.zip) de inmediato al
#              directorio o disco de destino.
# Uso:
#   ./comprimidoYmovimiento.sh [ORIGEN] [DESTINO]
#   ./comprimidoYmovimiento.sh --help
# ==============================================================================

set -uo pipefail

# Colores para la terminal
VERDE="\033[0;32m"
AZUL="\033[0;34m"
AMARILLO="\033[1;33m"
ROJO="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

mostrar_ayuda() {
  echo -e "${CYAN}Uso:${RESET}"
  echo -e "  $0 [ORIGEN] [DESTINO]"
  echo -e ""
  echo -e "${CYAN}Descripción:${RESET}"
  echo -e "  Recorre cada subcarpeta en la ruta de ORIGEN, genera su archivo .zip"
  echo -e "  y lo traslada inmediatamente a la ruta de DESTINO (otro disco o carpeta)."
  echo -e "  Si no se pasan parámetros, el script los solicitará de manera interactiva."
  echo -e ""
  echo -e "${CYAN}Opciones:${RESET}"
  echo -e "  -h, --help    Muestra este mensaje de ayuda."
  echo -e ""
  echo -e "${CYAN}Ejemplos:${RESET}"
  echo -e "  $0 /run/media/john/JohnParte1 /run/media/john/DiscoDestino/Respaldos"
  echo -e "  $0 /home/john/Descargas /run/media/john/DiscoExterno/Documentos"
}

# Verificar bandera de ayuda
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  mostrar_ayuda
  exit 0
fi

# 1. Obtener rutas de Origen y Destino
ORIGEN="${1:-}"
DESTINO="${2:-}"

if [[ -z "$ORIGEN" ]]; then
  echo -e "${CYAN}=== Script de Compresión y Traslado ===${RESET}"
  read -r -p "Ingrese la ruta de la carpeta/disco de ORIGEN: " ORIGEN
fi

if [[ -z "$DESTINO" ]]; then
  read -r -p "Ingrese la ruta de la carpeta/disco de DESTINO: " DESTINO
fi

# Eliminar barra diagonal final si existe
ORIGEN="${ORIGEN%/}"
DESTINO="${DESTINO%/}"

# 2. Validaciones
if [[ ! -d "$ORIGEN" ]]; then
  echo -e "${ROJO}Error: La ruta de origen '$ORIGEN' no existe o no es un directorio.${RESET}" >&2
  exit 1
fi

if ! command -v zip &> /dev/null; then
  echo -e "${ROJO}Error: La utilidad 'zip' no está instalada en el sistema.${RESET}" >&2
  exit 1
fi

# Crear carpeta de destino si no existe
if [[ ! -d "$DESTINO" ]]; then
  echo -e "${AMARILLO}Creando carpeta de destino: $DESTINO${RESET}"
  mkdir -p "$DESTINO" || {
    echo -e "${ROJO}Error: No se pudo crear el directorio de destino '$DESTINO'.${RESET}" >&2
    exit 1
  }
fi

# 3. Detectar subcarpetas a procesar (excluyendo carpetas ocultas como .Trash-1000)
carpetas=()
while IFS= read -r -d $'\0' d; do
  nombre_base="$(basename "$d")"
  # Omitir carpetas ocultas
  if [[ "$nombre_base" != .* ]]; then
    carpetas+=("$nombre_base")
  fi
done < <(find "$ORIGEN" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)

total=${#carpetas[@]}

if [[ $total -eq 0 ]]; then
  echo -e "${AMARILLO}No se encontraron subcarpetas en '$ORIGEN'. Nada por procesar.${RESET}"
  exit 0
fi

echo ""
echo -e "${CYAN}======================================================================${RESET}"
echo -e "${AZUL}Origen:${RESET}  $ORIGEN"
echo -e "${AZUL}Destino:${RESET} $DESTINO"
echo -e "${AZUL}Total de carpetas a procesar:${RESET} $total"
echo -e "${CYAN}======================================================================${RESET}"
echo ""

# 4. Proceso de compresión y movimiento secuencial
current=0
completadas=0
omitidas=0
errores=0

for dir in "${carpetas[@]}"; do
  current=$((current + 1))
  target_zip="$DESTINO/$dir.zip"
  tmp_zip="$DESTINO/$dir.zip.tmp"

  echo -e "${CYAN}[$current/$total]${RESET} ${AZUL}$(date +%H:%M:%S)${RESET} -> Procesando carpeta: '${AMARILLO}$dir${RESET}'"

  # Si ya existe en destino, omitir para evitar sobreescritura accidental y permitir reanudar
  if [[ -f "$target_zip" ]]; then
    tam=$(du -sh "$target_zip" 2>/dev/null | cut -f1)
    echo -e "   ${AMARILLO}[OMITIDA]${RESET} Ya existe en destino: '$dir.zip' ($tam)"
    omitidas=$((omitidas + 1))
    continue
  fi

  start_sec=$(date +%s)

  # Comprimir usando subshell para mantener rutas relativas limpias dentro del zip
  # Se escribe inicialmente como .zip.tmp en destino para evitar archivos corruptos si se interrumpe
  if (cd "$ORIGEN" && zip -r -q "$tmp_zip" "$dir"); then
    # Renombrar de .tmp al nombre final (.zip) en destino
    mv "$tmp_zip" "$target_zip"
    end_sec=$(date +%s)
    duracion=$((end_sec - start_sec))
    tam=$(du -sh "$target_zip" 2>/dev/null | cut -f1)
    echo -e "   ${VERDE}[OK]${RESET} Comprimida y trasladada: '$dir.zip' ($tam) en ${duracion}s"
    completadas=$((completadas + 1))
  else
    echo -e "   ${ROJO}[ERROR]${RESET} Falló la compresión de '$dir'" >&2
    rm -f "$tmp_zip"
    errores=$((errores + 1))
  fi
done

echo ""
echo -e "${CYAN}======================================================================${RESET}"
echo -e "${VERDE}Proceso finalizado:${RESET}"
echo -e "  - Total procesadas con éxito: ${VERDE}$completadas${RESET}"
echo -e "  - Omitidas (ya existían):      ${AMARILLO}$omitidas${RESET}"
echo -e "  - Con errores:                 ${ROJO}$errores${RESET}"
echo -e "  - Ubicación de destino:        $DESTINO"
echo -e "${CYAN}======================================================================${RESET}"
