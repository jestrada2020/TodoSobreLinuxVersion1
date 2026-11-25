#!/bin/bash
# Requiere root para apt-get
if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse con sudo: sudo ./baseAuto.sh"
    exit 1
fi

/usr/bin/apt-get update && /usr/bin/apt-get upgrade -y

# Directorios a limpiar (solo se procesan los que existen/estan montados)
DIRS=(
    /home
    /media/john/b56cad9f-ad3d-4fb1-88c8-f1fc943e6b4a/home/john/
    /media/john/CASORES/
    /home/john/Imágenes/
    /home/john/Imágenes/CASO2_cambios_ejercicios/
    /home/john/Documentos/MEJORADOR_TEMAS_LATEX/FACULTADCnuevo2023Abril/
    /home/john/Vídeos/Todo_Sobre_Tensores/
    /media/john/KINGSTON/
    /media/john/1A68-304A/
    /media/john/USB321/
    /media/john/CASORES/
    /home/john/Documentos/FACULTADCnuevo2023Abril/
    /home/john/Documentos/FACULTADCnuevo2025Enero/
)

for d in "${DIRS[@]}"; do
    if [ -d "$d" ]; then
        echo ">>> Limpiando: $d"
        /usr/bin/find "$d" -type f \( -name "*.toc" -o -name "*.log" -o -name "*.aux" -o -name "*.out" -o -name "*.synctex.gz" \) -print -delete
    else
        echo "!!! OMITIDO (no existe o USB no montado): $d"
    fi
done
