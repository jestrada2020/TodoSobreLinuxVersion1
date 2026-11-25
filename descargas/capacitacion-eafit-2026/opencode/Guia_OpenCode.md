---
author:
- Elaboración práctica para usuarios de Linux
date: 2026-06-19
title: |
  **GUIA OPENCODE**\
  Manual práctico, completo y robusto\
  Desde la instalación hasta flujos de trabajo avanzados
---

**GUIA OPENCODE**\
Manual práctico, completo y robusto\
Desde la instalación hasta flujos de trabajo avanzados\

------------------------------------------------------------------------


Versión del documento: 1.0\
Fecha: 2026-06-19\
Sistema: Linux (Ubuntu/Debian y derivadas)


# Introducción a OpenCode

## ¿Qué es OpenCode?

OpenCode es una herramienta de interfaz de línea de comandos (CLI) diseñada para interactuar con modelos de inteligencia artificial directamente desde la terminal. Permite:

-   Conversar con modelos de lenguaje en una interfaz de terminal (TUI).

-   Ejecutar tareas mediante comandos directos (modo no interactivo).

-   Gestionar múltiples proveedores de IA y credenciales.

-   Trabajar con sesiones, proyectos, plugins y servidores MCP.

-   Exportar e importar conversaciones.

> **💡 Nota:**
> OpenCode integra la potencia de los LLM en el flujo de trabajo del desarrollador sin salir de la terminal ni depender de un navegador.

## Requisitos previos

Antes de instalar OpenCode se recomienda contar con:

1.  Un sistema Linux actualizado.

2.  Conexión a Internet.

3.  Permisos para ejecutar scripts en el directorio del usuario.

4.  Una clave API de algún proveedor compatible (OpenAI, Anthropic, Google, etc.).

# Instalación y actualización

## Instalación en Linux y macOS

El método más rápido en sistemas Unix es ejecutar el script oficial:

```
# Instalación con curl
curl -fsSL https://opencode.ai/install.sh | sh
```

El instalador descarga el binario y lo coloca en `~/.opencode/bin`, añadiéndolo automáticamente al `PATH` en los archivos de inicio del shell.

### Distribuciones Linux

#### Ubuntu / Debian

```
# Instalación en Ubuntu/Debian
sudo apt update && sudo apt install -y curl

curl -fsSL https://opencode.ai/install.sh | sh

# Recarga el PATH o abre una nueva terminal
source ~/.bashrc
opencode --version
```

#### Fedora / RHEL / CentOS / AlmaLinux

```
# Instalación en Fedora/RHEL
sudo dnf install -y curl

curl -fsSL https://opencode.ai/install.sh | sh

source ~/.bashrc
opencode --version
```

#### Arch Linux / Manjaro

```
# Instalación en Arch Linux
sudo pacman -S curl

curl -fsSL https://opencode.ai/install.sh | sh

source ~/.bashrc
opencode --version
```

#### openSUSE

```
# Instalación en openSUSE
sudo zypper install -y curl

curl -fsSL https://opencode.ai/install.sh | sh

source ~/.bashrc
opencode --version
```

### macOS

En macOS solo necesitas `curl`. El instalador detecta tanto Intel como Apple Silicon:

```
# Instalación en macOS
curl -fsSL https://opencode.ai/install.sh | sh
```

```
# Verificar PATH en macOS
echo $PATH | grep opencode
opencode --version
```

> **✅ Tip:**
> Si prefieres, puedes gestionar el binario manualmente descargándolo desde la web oficial y colocándolo en `~/.opencode/bin` o en cualquier directorio de tu `PATH`.

## Instalación en Windows

OpenCode se puede instalar en Windows de dos formas principales.

### PowerShell

```
# Instalación con PowerShell
irm https://opencode.ai/install.ps1 | iex
```

Tras la instalación, cierra y vuelve a abrir PowerShell para que el `PATH` actualizado esté disponible.

```
# Verificar instalación en PowerShell
$env:PATH -split ";" | Select-String opencode
opencode --version
```

### Windows Subsystem for Linux (WSL)

Si usas WSL, sigue las instrucciones de Linux:

```
# Instalación en WSL
curl -fsSL https://opencode.ai/install.sh | sh
```

> **💡 Nota:**
> WSL ofrece la mejor experiencia si ya trabajas con herramientas de desarrollo en entornos Unix y quieres aprovechar scripts, pipes y alias de shell.

## Verificar la instalación

```
# Comprobación de la instalación
which opencode
opencode --version
opencode --help
```

## Actualizar OpenCode

```
# Actualizar a la última versión
opencode upgrade
```

Para una versión específica:

```
# Actualizar a una versión concreta
opencode upgrade 1.17.8
```

> **⚠️ Advertencia:**
> La actualización sobrescribe el binario actual. Si tienes una configuración personalizada, ésta se conserva porque reside en `~/.opencode`.

## Desinstalación

```
# Eliminar OpenCode del sistema
opencode uninstall
```

# Primeros pasos

## Iniciar la interfaz interactiva

El comando por defecto abre la interfaz TUI:

```
# Modo interactivo
opencode
```

Desde allí puedes escribir mensajes, revisar respuestas y ejecutar acciones con atajos de teclado.

## Ejecutar un mensaje directo

```
# Modo no interactivo
opencode run "Explica la diferencia entre bash y zsh"
```

> **✅ Tip:**
> El modo `run` permite encadenar OpenCode en `scripts`, `makefiles` y `CI/CD`.

## Estructura de comandos

La sintaxis general es:

```
# Sintaxis general
opencode [comando] [subcomando] [opciones] [argumentos]
```

Ejemplos:

```
# Ejemplos de sintaxis
opencode providers list
opencode models openai
opencode session list
```

<figure id="fig:flujo">

<figcaption>Flujo basico de interaccion con OpenCode</figcaption>
</figure>

# Comandos principales

## Tabla resumen de comandos

  **Comando**    **Alias**   **Descripción**
  -------------- ----------- ----------------------------------------
  `completion`   ---         Genera script de autocompletado.
  `acp`          ---         Inicia servidor ACP.
  `mcp`          ---         Gestiona servidores MCP.
  `[project]`    ---         Inicia la TUI en una ruta.
  `attach`       ---         Se conecta a un servidor en ejecución.
  `run`          ---         Ejecuta un mensaje sin interacción.
  `debug`        ---         Herramientas de depuración.
  `providers`    `auth`      Gestiona proveedores y credenciales.
  `agent`        ---         Gestiona agentes.
  `upgrade`      ---         Actualiza OpenCode.
  `uninstall`    ---         Desinstala OpenCode.
  `serve`        ---         Inicia servidor sin cabeza.
  `web`          ---         Inicia servidor y abre interfaz web.
  `models`       ---         Lista modelos disponibles.
  `stats`        ---         Muestra uso y costes.
  `export`       ---         Exporta sesión a JSON.
  `import`       ---         Importa sesión desde JSON.
  `github`       ---         Gestiona agente GitHub.
  `pr`           ---         Descarga y revisa un PR.
  `session`      ---         Gestiona sesiones.
  `plugin`       `plug`      Instala plugins.
  `db`           ---         Herramientas de base de datos.


## Autocompletado

Genera el script de autocompletado para tu shell:

```
# Autocompletado para bash
opencode completion bash >> ~/.bashrc
source ~/.bashrc
```

```
# Autocompletado para zsh
opencode completion zsh >> ~/.zshrc
source ~/.zshrc
```

```
# Autocompletado para fish
opencode completion fish > ~/.config/fish/completions/opencode.fish
```

# Configuración de proveedores

## Listar proveedores

```
# Proveedores configurados
opencode providers list
```

## Añadir una API key

```
# Configurar OpenAI
opencode providers set openai --key TU_API_KEY
```

```
# Configurar Anthropic
opencode providers set anthropic --key TU_API_KEY
```

```
# Configurar Google
opencode providers set google --key TU_API_KEY
```

## Listar modelos disponibles

```
# Modelos de un proveedor
opencode models openai
opencode models anthropic
opencode models google
```

> **✅ Tip:**
> Usa `opencode models` para conocer los modelos disponibles con tu plan y seleccionar el más adecuado según coste y capacidad.

# Uso práctico con ejemplos

## Explicar código

```
# Pedir explicación de un script
opencode run "Explica este script de Python" < script.py
```

## Generar código

```
# Generar una función en Python
opencode run "Crea una funcion en Python que calcule el factorial de un numero usando recursividad"
```

## Refactorizar

```
# Refactorizar código
opencode run "Refactoriza este codigo para que sea mas legible" < main.py
```

## Resumir archivos

```
# Resumen de un documento
opencode run "Resume los puntos principales de este archivo" < informe.txt
```

## Análisis de diferencias

```
# Comparar dos archivos
diff -u archivo1.txt archivo2.txt | opencode run "Explica las diferencias entre estos archivos"
```

## Generar tests

```
# Crear pruebas unitarias
opencode run "Genera pruebas unitarias con pytest para este modulo" < utils.py
```

# Gestión de sesiones y proyectos

## Sesiones

Las sesiones guardan el historial de conversación.

```
# Listar sesiones
opencode session list
```

```
# Exportar una sesion
opencode export ID_DE_SESION > sesion.json
```

```
# Importar una sesion
opencode import sesion.json
```

## Proyectos

Puedes iniciar OpenCode apuntando a una carpeta específica:

```
# Iniciar en un proyecto
opencode /ruta/al/proyecto
```

Esto permite que OpenCode tenga contexto sobre los archivos del proyecto.

# Servidores e integraciones

## Servidor ACP

```
# Iniciar servidor ACP
opencode acp
```

## Servidores MCP

```
# Gestionar servidores MCP
opencode mcp list
opencode mcp add nombre-del-servidor comando
opencode mcp remove nombre-del-servidor
```

## Modo web

```
# Abrir interfaz web
opencode web
```

```
# Servidor headless
opencode serve --port 8080 --hostname 127.0.0.1
```

# Agentes

## ¿Qué son los agentes?

En OpenCode, un agente es una configuración especializada que define el comportamiento, el modelo, las herramientas y el contexto del asistente. Los agentes permiten adaptar OpenCode a tareas específicas como programación, revisión de código, escritura técnica o análisis de datos.

Cada agente puede tener:

-   **Nombre**: identificador único del agente.

-   **Modelo**: proveedor y modelo de IA a utilizar.

-   **Instrucciones**: comportamiento esperado y personalidad.

-   **Herramientas**: servidores MCP, plugins y skills habilitados.

-   **Contexto**: proyectos o archivos asociados.

## Gestión de agentes

<figure id="fig:agente">

<figcaption>Componentes de un agente en OpenCode</figcaption>
</figure>

```
# Listar agentes disponibles
opencode agent list
```

```
# Crear un nuevo agente
opencode agent create
```

El comando interactivo te pedirá el nombre, el modelo y las instrucciones del sistema.

```
# Iniciar OpenCode con un agente
opencode --agent nombre-del-agente
```

```
# Ejecutar un mensaje con un agente
opencode run --agent nombre-del-agente "Refactoriza este modulo"
```

## Buenas prácticas con agentes

-   Crea un agente por rol: `reviewer`, `tester`, `writer`, `devops`.

-   Mantén las instrucciones del sistema concisas y específicas.

-   Asocia cada agente al modelo más rentable para su tarea.

-   Revisa y actualiza los agentes periódicamente.

> **✅ Tip:**
> Si trabajas en equipo, versiona tus agentes exportando la configuración de `~/.opencode` en un repositorio compartido.

# Skills

## ¿Qué son los skills?

Los *skills* son capacidades modulares que extienden lo que OpenCode puede hacer. Un skill puede ser un conjunto de instrucciones, una integración con una herramienta externa o un flujo de trabajo reutilizable.

OpenCode permite ampliar sus capacidades mediante plugins, que actúan como skills instalables.

## Instalación de skills/plugins

<figure id="fig:skills">

<figcaption>Ecosistema de extensiones de OpenCode</figcaption>
</figure>

```
# Instalar un plugin globalmente
opencode plugin nombre-del-modulo
```

```
# Instalar un plugin forzando la reinstalación
opencode plugin nombre-del-modulo -f
```

```
# Instalar un plugin solo para el proyecto actual
opencode plugin nombre-del-modulo -g
```

```
# Listar plugins instalados
opencode plugin list
```

## Skills personalizados

Puedes crear tus propios skills como plugins locales o como archivos de configuración en el directorio de OpenCode:

```
# Estructura de un skill personalizado
~/.opencode/
  skills/
    mi-skill/
      SKILL.md
      scripts/
      templates/
```

```
# Ejemplo de SKILL.md
# mi-skill

Descripcion de lo que hace el skill.

## Uso

opencode run "Usa el skill mi-skill para analizar este archivo" < main.py
```

## Gestión de skills

-   Mantén los skills en repositorios de Git para versionarlos.

-   Documenta cada skill con ejemplos de uso.

-   Evita instalar plugins de fuentes no confiables.

-   Prueba los skills en un proyecto de prueba antes de usarlos en producción.

> **💡 Nota:**
> Un **plugin** es un módulo de software instalado (frecuentemente vía npm). Un **skill** es una capacidad o flujo de trabajo que puede venir de un plugin o de una configuración personalizada.

# Artefactos

## ¿Qué son los artefactos?

Los artefactos son archivos o bloques de contenido generados durante una conversación con OpenCode. Pueden ser fragmentos de código, documentación, configuraciones, diagramas o cualquier salida estructurada que quieras conservar.

Ejemplos comunes de artefactos:

-   Archivos de código fuente.

-   Archivos de configuración (Dockerfile, CI/CD, dotfiles).

-   Documentación técnica o README.

-   Scripts de automatización.

-   Diagramas y representaciones en texto.

## Generar artefactos

En el modo interactivo, solicita directamente la creación del archivo:

```
# Solicitar un artefacto en TUI
Crea un archivo README.md profesional para este proyecto.
```

En el modo `run`, redirige la salida estándar al archivo deseado:

```
# Guardar salida en un archivo
opencode run "Genera un Dockerfile para una app Python con Flask" > Dockerfile
```

```
# Generar multiples archivos
opencode run "Crea un .gitignore para Python y un Makefile con targets basicos"
```

## Aplicar artefactos al proyecto

Antes de aplicar cualquier artefacto:

1.  Revisa el contenido generado.

2.  Comprueba que no sobrescriba archivos importantes.

3.  Guarda una copia de seguridad si es necesario.

4.  Realiza un commit con `git` antes de integrar cambios.

```
# Flujo seguro de aplicación
git add .
git commit -m "backup antes de aplicar artefactos de OpenCode"
opencode run "Genera tests para utils.py" > test_utils.py
# revisa test_utils.py antes de ejecutarlo
pytest test_utils.py
```

## Exportar e importar artefactos

Las sesiones completas (incluyendo artefactos generados) se pueden exportar:

```
# Exportar una sesion con artefactos
opencode export ID_DE_SESION > sesion_completa.json
```

```
# Importar una sesion
opencode import sesion_completa.json
```

> **⚠️ Advertencia:**
> Los artefactos generados por IA pueden contener errores. No los ejecutes directamente en producción sin revisarlos y probarlos.

# Consejos avanzados

## Uso en pipelines

```
# Pipeline con git
git diff HEAD~1 | opencode run "Resume los cambios de este commit"
```

## Automatización con alias

Añade alias útiles a tu `.bashrc` o `.zshrc`:

```
# Alias recomendados
alias oc='opencode'
alias ocr='opencode run'
alias ocw='opencode web'
alias ocm='opencode models'
```

## Depuración

```
# Ver logs de depuracion
opencode debug
```

## Estadísticas de uso

```
# Consultar consumo
opencode stats
```

# Solución de problemas

## OpenCode no se encuentra

```
# Verificar PATH
echo $PATH | grep opencode
export PATH="$HOME/.opencode/bin:$PATH"
```

## Error de autenticación

1.  Verifica que la API key sea correcta.

2.  Confirma que el proveedor esté activo en `opencode providers list`.

3.  Revisa que el modelo seleccionado esté disponible en tu cuenta.

## La TUI no responde

```
# Forzar cierre y reinicio
killall opencode
opencode
```

```
# Iniciar sin plugins externos
opencode --pure
```

## Problemas de red

Si usas un proxy, exporta las variables antes de ejecutar OpenCode:

```
# Configurar proxy
export HTTP_PROXY=http://proxy.empresa:8080
export HTTPS_PROXY=http://proxy.empresa:8080
opencode run "hola"
```

# Ejercicios prácticos

## Ejercicio 1: Primer contacto

Objetivo: familiarizarte con la interfaz interactiva.

1.  Abre una terminal y ejecuta `opencode`.

2.  Escribe: `Hola, ¿que puedes hacer?`

3.  Explora los atajos de teclado disponibles.

4.  Cierra la sesión con `Ctrl+C`.

## Ejercicio 2: Explicar código

Objetivo: usar OpenCode para entender código ajeno.

1.  Crea un archivo `ejemplo.py` con una función compleja.

2.  Ejecuta: `opencode run "Explica este codigo paso a paso" < ejemplo.py`

3.  Lee la explicación y solicita un diagrama o pseudocodigo.

## Ejercicio 3: Refactorización

Objetivo: mejorar la calidad del código.

1.  Encuentra un script con funciones largas o repetidas.

2.  Ejecuta: `opencode run "Refactoriza este codigo para que sea mas limpio" < script.py`

3.  Compara el original con el resultado y aplica los cambios que consideres validos.

## Ejercicio 4: Generar documentación

Objetivo: crear documentación técnica automáticamente.

```
# Generar README
opencode run "Genera un README.md profesional para este proyecto" > README.md
```

```
# Generar docstring
opencode run "Agrega docstrings y comentarios a este modulo" < utils.py > utils_documentado.py
```

## Ejercicio 5: Crear un agente personalizado

Objetivo: configurar un agente especializado.

1.  Ejecuta `opencode agent create`.

2.  Nómbralo `python-expert`.

3.  Define instrucciones del sistema: *Eres un experto en Python, enfocado en codigo limpio, type hints y pruebas con pytest.*

4.  Usa el agente: `opencode run --agent python-expert "Revisa este codigo" < main.py`

## Ejercicio 6: Pipeline con git

Objetivo: integrar OpenCode en tu flujo de git.

```
# Resumen de cambios
git diff HEAD~1 | opencode run "Escribe un mensaje de commit claro y conciso para estos cambios"
```

## Ejercicio 7: Instalar un skill/plugin

Objetivo: ampliar OpenCode con capacidades adicionales.

1.  Busca un plugin compatible (puede ser un modulo npm).

2.  Instálalo: `opencode plugin nombre-del-modulo`.

3.  Verifica que aparece en la configuración.

4.  Prueba su funcionalidad con un mensaje de prueba.

> **✅ Tip:**
> Realiza los ejercicios en orden. Cada uno construye sobre el anterior y te ayudara a dominar OpenCode de forma practica.

# Plantillas de agentes

## Code Reviewer

Agente especializado en revisar código y detectar problemas.

```
# Instrucciones para agente reviewer
Eres un revisor de codigo senior. Tu trabajo es:
- Detectar bugs, errores de logica y problemas de seguridad.
- Sugerir mejoras de rendimiento y legibilidad.
- Verificar que el codigo siga buenas practicas del lenguaje.
- Responder de forma clara, estructurada y constructiva.
```

```
# Uso del agente reviewer
opencode run --agent reviewer "Revisa este PR" < cambios.diff
```

## Technical Writer

Agente enfocado en documentación técnica.

```
# Instrucciones para agente writer
Eres un redactor tecnico especializado en documentacion de software.
Tu tarea es crear documentacion clara, concisa y bien estructurada.
Usa Markdown cuando sea posible y adapta el tono al publico objetivo.
```

```
# Uso del agente writer
opencode run --agent writer "Documenta la API de este modulo" < api.py
```

## DevOps Assistant

Agente para tareas de infraestructura y despliegue.

```
# Instrucciones para agente devops
Eres un ingeniero DevOps. Ayudas a crear y revisar:
- Dockerfiles y docker-compose.yml
- Pipelines CI/CD (GitHub Actions, GitLab CI)
- Scripts de despliegue y automatizacion
- Configuraciones de infraestructura como codigo
```

```
# Uso del agente devops
opencode run --agent devops "Genera un Dockerfile para Node.js 20"
```

## Python Expert

Agente para desarrollo Python avanzado.

```
# Instrucciones para agente python
Eres un experto en Python. Proporcionas codigo:
- Con type hints y docstrings
- Orientado a pruebas con pytest
- Siguiendo PEP 8
- Eficiente, legible y mantenible
```

```
# Uso del agente python
opencode run --agent python "Crea una clase para manejar configuracion con Pydantic"
```

## Frontend Developer

Agente para desarrollo web frontend.

```
# Instrucciones para agente frontend
Eres un desarrollador frontend experto en React, TypeScript y CSS moderno.
Creas componentes accesibles, responsivos y bien estructurados.
```

```
# Uso del agente frontend
opencode run --agent frontend "Crea un componente de formulario de login en React"
```

## Como importar una plantilla

Puedes crear un agente a partir de estas plantillas:

```
# Crear agente desde plantilla
opencode agent create
# Nombre: reviewer
# Instrucciones: (pega el texto de la plantilla)
```

> **💡 Nota:**
> Guarda tus plantillas en archivos de texto dentro de un repositorio para poder reutilizarlas y compartirlas con tu equipo.

# Glosario de términos

Configuracion especializada que define el comportamiento, modelo y herramientas de OpenCode para una tarea concreta.

Clave secreta que permite a OpenCode autenticarse con un proveedor de IA.

Archivo o bloque de contenido generado por OpenCode durante una conversacion.

Continuous Integration / Continuous Deployment, practicas de automatizacion de software.

Informacion adicional (archivos, proyectos, historial) que OpenCode utiliza para responder mejor.

Plataforma para crear, desplegar y ejecutar aplicaciones en contenedores.

Copia de un repositorio que permite hacer cambios independientes.

Sistema de control de versiones distribuido.

Large Language Model, modelo de lenguaje grande como GPT-4, Claude o Gemini.

Model Context Protocol, protocolo para conectar OpenCode con servidores de herramientas.

Algoritmo de IA utilizado por OpenCode para generar respuestas.

Serie de pasos automatizados en un flujo de trabajo.

Modulo de software que extiende las capacidades de OpenCode.

Empresa o servicio que ofrece acceso a modelos de IA (OpenAI, Anthropic, Google, etc.).

Instruccion o mensaje enviado a OpenCode.

Pull Request, solicitud de integracion de cambios en un repositorio.

Reescribir codigo para mejorar su estructura sin cambiar su comportamiento externo.

Capacidad o flujo de trabajo reutilizable que puede provenir de un plugin o configuracion personalizada.

Conversacion guardada con su historial y contexto.

Unidad minima de texto procesada por un LLM; tambien se usa como unidad de facturacion.

Terminal User Interface, interfaz de usuario en modo texto.

Windows Subsystem for Linux, subsistema de Linux para Windows.


# Recursos adicionales

## Documentación oficial

-   **Sitio web oficial:** <https://opencode.ai>

-   **Documentación:** consulta la web oficial para guías actualizadas.

-   **Repositorio:** busca `opencode-ai` en GitHub para el codigo fuente y ejemplos.

## Comunidad y soporte

-   **Discord:** muchos proyectos de IA cuentan con servidor oficial para preguntas y anuncios.

-   **GitHub Discussions:** foro para compartir casos de uso y resolver dudas.

-   **Stack Overflow:** etiqueta `opencode` para preguntas técnicas específicas.

## Herramientas complementarias

Control de versiones indispensable para gestionar artefactos generados.

Para probar contenedores y despliegues creados con OpenCode.

Framework de pruebas recomendado para validar codigo Python generado.

Entorno necesario para instalar plugins basados en npm.

Util para mantener sesiones de terminal con OpenCode activas.


## Tutoriales recomendados

1.  Configura tu primer proveedor de IA y envía tu primer mensaje.

2.  Crea tres agentes especializados: uno para codigo, uno para documentacion y uno para DevOps.

3.  Instala un plugin y documenta como cambia tu flujo de trabajo.

4.  Automatiza la generacion de mensajes de commit con `git diff`.

5.  Exporta e importa una sesion para entender como funciona el historial.

## Lecturas adicionales

-   *Prompt Engineering Guide* --- técnicas para escribir mejores instrucciones a modelos de lenguaje.

-   *Clean Code* (Robert C. Martin) --- buenas practicas para revisar codigo generado.

-   *The Phoenix Project* (Gene Kim) --- cultura DevOps aplicable a la automatizacion con agentes.

> **✅ Tip:**
> OpenCode evoluciona rapidamente. Revisa periodicamente la documentacion oficial y las notas de version para conocer nuevos comandos, proveedores y capacidades.

# Referencia rápida

## Comandos imprescindibles

```
# Hoja de ruta
opencode --version          # version instalada
opencode --help             # ayuda general
opencode                    # TUI interactiva
opencode run "mensaje"      # ejecucion directa
opencode web                # interfaz web
opencode providers list     # proveedores
opencode models             # modelos
opencode session list       # sesiones
opencode stats              # uso y costes
opencode agent list         # agentes
opencode agent create       # crear agente
opencode plugin <modulo>    # instalar skill/plugin
opencode mcp list           # servidores MCP
opencode export ID          # exportar sesion
```


------------------------------------------------------------------------


Documento generado con LaTeX el 2026-06-19.\
OpenCode es un proyecto en evolucion; consulta <https://opencode.ai> para la documentacion oficial.

