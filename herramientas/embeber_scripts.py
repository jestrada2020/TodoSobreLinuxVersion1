#!/usr/bin/env python3
"""Incrusta los scripts de descargas/automatizacion/ en js/data/11a-scripts-embebidos.js.

Chrome no permite leer archivos locales con fetch() cuando la app se abre con
file://, así que el visor de código necesita el texto dentro de un .js.
Ejecuta este script cada vez que cambies alguno de los .sh:

    python3 herramientas/embeber_scripts.py
"""
import json, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CARPETA = RAIZ / "descargas" / "automatizacion"
SALIDA = RAIZ / "js" / "data" / "11a-scripts-embebidos.js"

scripts = {p.name: p.read_text(encoding="utf-8") for p in sorted(CARPETA.glob("*.sh"))}
SALIDA.write_text(
    "/* GENERADO por herramientas/embeber_scripts.py — no editar a mano. */\n"
    "window.ScriptsEmbebidos = " + json.dumps(scripts, ensure_ascii=False, indent=0) + ";\n",
    encoding="utf-8",
)
print(f"{len(scripts)} scripts → {SALIDA.relative_to(RAIZ)}")
