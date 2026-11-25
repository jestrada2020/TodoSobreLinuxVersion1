/* 13b-capacitacion.js — casos de capacitación EAFIT, junio 2026 (16, 17 y 18):
   guía de OpenCode, guía de Jupyter y materiales del curso.
   Los comandos de OpenCode se contrastaron con `opencode --help` de la
   versión 1.17.13; los materiales originales están copiados en
   descargas/capacitacion-eafit-2026/. */
(function (C) {
  'use strict';

  var BASE = 'descargas/capacitacion-eafit-2026/';

  C.registrar({
    id: 'cap-eafit',
    group: 'capacitacion',
    title: 'Casos de capacitación EAFIT 2026',
    level: 'intermedio',
    tags: ['eafit', 'capacitacion', 'opencode', 'jupyter', 'jupyterlab', 'curso', 'junio 2026', 'guia'],
    lead: 'Material de las sesiones del <b>16, 17 y 18 de junio de 2026</b>: dos aplicaciones de trabajo diario —<b>OpenCode</b>, un agente de IA para la terminal, y <b>Jupyter</b>, el entorno de cuadernos para datos— con sus guías completas, la versión interactiva, el cuestionario y la hoja de referencia.',
    blocks: [
      { type: 'grid', cols: 3, items: [
        { value: '2', label: 'aplicaciones', note: 'OpenCode y Jupyter' },
        { value: '4', label: 'PDF', note: 'guías y hoja de referencia rápida' },
        { value: '31', label: 'ejercicios', note: '7 de OpenCode y 24 de Jupyter' }
      ]},

      { type: 'tabs', id: 'cap-tabs', title: 'Aplicaciones del curso', items: [

        /* ============================== OPENCODE ============================== */
        { id: 'cap-opencode', n: '1', t: 'OpenCode', badge: 'agente IA', badgeVariant: 'info',
          lead: 'OpenCode es un agente de programación de código abierto para la terminal. Trabaja con muchos proveedores de modelos (OpenAI, Anthropic, Google, modelos locales…), tiene interfaz de texto (TUI), modo web, servidor sin interfaz, agentes, MCP y plugins.',
          blocks: [
            { type: 'h3', id: 'oc-instalar', text: 'Instalar, actualizar y desinstalar' },
            { type: 'cmd', label: 'Linux (Ubuntu/Debian)', lines: [
              '$ sudo apt update && sudo apt install -y curl',
              '$ curl -fsSL https://opencode.ai/install.sh | sh',
              '# El binario queda en ~/.opencode/bin; abre una terminal nueva o:',
              '$ source ~/.bashrc',
              '$ opencode --version',
              '',
              '$ opencode upgrade              # última versión',
              '$ opencode upgrade 1.17.8       # una versión concreta',
              '$ opencode uninstall            # quita OpenCode y sus archivos'
            ]},

            { type: 'h3', id: 'oc-proveedores', text: 'Proveedores y modelos' },
            { type: 'cmd', label: 'Credenciales (providers, alias: auth)', lines: [
              '$ opencode providers login        # asistente: elige proveedor e introduce la clave o inicia sesión',
              '$ opencode providers list         # proveedores y credenciales configurados',
              '$ opencode providers logout anthropic',
              '',
              '# Modelos disponibles, en formato proveedor/modelo',
              '$ opencode models',
              '$ opencode models anthropic'
            ]},

            { type: 'h3', id: 'oc-uso', text: 'Uso interactivo y agéntico' },
            { type: 'cmd', label: 'TUI y modo no interactivo (run)', lines: [
              '$ opencode                                  # TUI en la carpeta actual',
              '$ opencode ~/proyectos/mi-app               # TUI en un proyecto',
              '$ opencode -c                               # continuar la última sesión',
              '',
              '# Una tarea sin interfaz: ideal para scripts y CI',
              '$ opencode run "Explica la diferencia entre bash y zsh"',
              '',
              '# Adjuntar archivos con -f (mejor que redirigir con <)',
              '$ opencode run -f utils.py "Genera pruebas con pytest para este módulo"',
              '',
              '# Elegir modelo y agente',
              '$ opencode run -m anthropic/claude-sonnet-5-5 --agent reviewer "Revisa este cambio" -f cambios.diff',
              '',
              '# Con tuberías',
              '$ git diff HEAD~1 | opencode run "Escribe un mensaje de commit claro para estos cambios"',
              '',
              '# Salida JSON (eventos) para procesar en scripts',
              '$ opencode run --format json "Resume README.md" > eventos.jsonl'
            ]},
            { type: 'callout', variant: 'danger', title: '--auto aprueba todo lo que no esté prohibido',
              html: '<p><code>opencode --auto</code> y <code>opencode run --auto</code> conceden los permisos sin preguntar (la propia ayuda lo marca como <i>dangerous</i>). Úsalo solo en un repositorio con <code>git commit</code> reciente o dentro de un contenedor.</p>' },

            { type: 'h3', id: 'oc-agentes', text: 'Agentes, skills y plugins' },
            { type: 'cmd', label: 'Agentes especializados', lines: [
              '$ opencode agent create             # asistente: nombre, modelo, instrucciones y ámbito',
              '$ opencode agent list',
              '$ opencode debug agent reviewer     # configuración resuelta de un agente',
              '',
              '$ opencode --agent reviewer         # TUI con ese agente',
              '$ opencode run --agent python-expert -f main.py "Revisa este código"'
            ]},
            { type: 'cmd', label: 'Skills y plugins', lines: [
              '# Skills que OpenCode ha encontrado (SKILL.md) y dónde busca',
              '$ opencode debug skill',
              '$ opencode debug paths',
              '',
              '# Plugins: módulos npm. Por defecto en el proyecto; -g en la config global',
              '$ opencode plugin nombre-del-modulo',
              '$ opencode plugin nombre-del-modulo -g',
              '$ opencode plugin nombre-del-modulo -f      # reemplaza la versión instalada'
            ]},

            { type: 'h3', id: 'oc-servidor', text: 'MCP, servidor y sesiones' },
            { type: 'cmd', label: 'Integraciones', lines: [
              '# Servidores MCP',
              '$ opencode mcp add                 # asistente',
              '$ opencode mcp list',
              '$ opencode mcp auth github         # servidores con OAuth',
              '',
              '# Interfaz web y servidor sin interfaz (solo en 127.0.0.1)',
              '$ opencode web',
              '$ opencode serve --port 4096',
              '$ opencode run --attach http://localhost:4096 "hola"',
              '',
              '# Sesiones, exportación y consumo',
              '$ opencode session list',
              '$ opencode export ID_DE_SESION > sesion.json',
              '$ opencode import sesion.json',
              '$ opencode stats                   # tokens y coste'
            ]},

            { type: 'h3', id: 'oc-problemas', text: 'Solución de problemas' },
            { type: 'table', head: ['Síntoma', 'Solución'], monoFirst: false, rows: [
              ['<code>opencode: command not found</code>', '<code>export PATH="$HOME/.opencode/bin:$PATH"</code> en <code>~/.bashrc</code> y <code>source ~/.bashrc</code>'],
              ['Error de autenticación', '<code>opencode providers list</code>; repite <code>opencode providers login</code>; comprueba el modelo con <code>opencode models &lt;proveedor&gt;</code>'],
              ['La TUI se cuelga o un plugin falla', '<code>opencode --pure</code> arranca sin plugins externos'],
              ['¿Qué configuración está usando?', '<code>opencode debug config</code> y <code>opencode debug paths</code>'],
              ['Necesito ver los registros', '<code>opencode --print-logs --log-level DEBUG</code>'],
              ['Arranque lento', '<code>opencode debug startup</code> muestra los tiempos'],
              ['Red con proxy', '<code>export HTTPS_PROXY=http://proxy.empresa:8080</code> antes de ejecutar']
            ]},
            { type: 'callout', variant: 'warn', title: 'Diferencias entre la guía PDF y la versión 1.17',
              html: '<ul><li><code>opencode providers set openai --key …</code> <b>no existe</b>: las credenciales se añaden con <code>opencode providers login</code>.</li><li>En <code>opencode plugin</code>, <code>-g</code> significa <b>global</b> (no «solo el proyecto»): sin <code>-g</code> se instala en el proyecto.</li><li>La configuración del usuario está en <code>~/.config/opencode/opencode.jsonc</code>; <code>~/.opencode</code> contiene el binario. Compruébalo con <code>opencode debug paths</code>.</li><li><code>opencode debug</code> solo no hace nada: tiene subcomandos (<code>config</code>, <code>paths</code>, <code>info</code>, <code>skill</code>…).</li></ul>' }
          ]
        },

        /* =============================== JUPYTER =============================== */
        { id: 'cap-jupyter', n: '2', t: 'Jupyter', badge: 'datos', badgeVariant: 'ok',
          lead: 'Jupyter combina código ejecutable, texto, ecuaciones y gráficos en un mismo cuaderno. La guía del curso cubre Notebook y JupyterLab, kernels, magic commands, bases de datos, pruebas, Plotly y Bokeh, Dask, MLflow, widgets, Voilà, JupyterHub, Jupyter AI, seguridad y despliegue con Docker y Kubernetes.',
          blocks: [
            { type: 'table', head: ['', 'Jupyter Notebook', 'JupyterLab'], monoFirst: false, rows: [
              ['<b>Interfaz</b>', 'Clásica, un cuaderno a la vez', 'Modular, varios paneles'],
              ['<b>Herramientas</b>', 'Básicas', 'Terminales, editores y visores integrados'],
              ['<b>Recomendado para</b>', 'Empezar', 'Trabajo diario y proyectos']
            ]},

            { type: 'h3', id: 'jp-instalar', text: 'Instalar en Ubuntu (forma correcta)' },
            { type: 'cmd', label: 'Tres opciones según tu entorno', lines: [
              '# A) En un entorno virtual del proyecto',
              '$ python3 -m venv .venv && source .venv/bin/activate',
              '$ pip install jupyterlab notebook ipykernel',
              '',
              '# B) Como herramienta global aislada',
              '$ pipx install jupyterlab           # o: uv tool install jupyterlab',
              '',
              '# C) Con Anaconda / Miniforge',
              '$ conda install -c conda-forge jupyterlab notebook',
              '',
              '$ jupyter --version',
              '$ jupyter kernelspec list'
            ]},
            { type: 'callout', variant: 'warn', title: 'Corrección a la guía: «pip3 install jupyter» falla en Ubuntu 23.04+',
              html: '<p>Instalar con <code>pip3</code> directamente en el Python del sistema produce <code>error: externally-managed-environment</code>. Usa una de las tres opciones de arriba. Más detalle en <a href="#datos-python">Python para datos</a> y <a href="#datos-problemas">Errores al instalar</a>.</p>' },

            { type: 'h3', id: 'jp-iniciar', text: 'Iniciar y trabajar' },
            { type: 'cmd', label: 'Arranque', lines: [
              '$ jupyter lab                                 # http://localhost:8888',
              '$ jupyter notebook',
              '$ jupyter lab --no-browser --port 8889',
              '$ jupyter lab --notebook-dir=~/proyectos/analisis',
              '',
              '# Servidores en marcha y sus tokens',
              '$ jupyter server list'
            ]},
            { type: 'callout', variant: 'danger', title: 'Corrección a la guía: no uses --ip=0.0.0.0 para acceso remoto',
              html: '<p>Esa opción publica Jupyter en toda la red y Jupyter ejecuta código arbitrario. Para trabajar en remoto usa un túnel SSH: en el servidor <code>jupyter lab --no-browser --port 8888</code> y en tu equipo <code>ssh -N -L 8888:localhost:8888 usuario@servidor</code>.</p>' },
            { type: 'keys', items: [
              { k: ['Esc'], d: 'Modo comando (azul)' },
              { k: ['Enter'], d: 'Modo edición (verde)' },
              { k: ['Shift', 'Enter'], d: 'Ejecutar celda y pasar a la siguiente' },
              { k: ['A'], d: 'Insertar celda arriba (modo comando)' },
              { k: ['B'], d: 'Insertar celda abajo' },
              { k: ['D', 'D'], d: 'Borrar celda' },
              { k: ['M'], d: 'Convertir en Markdown' },
              { k: ['Y'], d: 'Convertir en código' },
              { k: ['0', '0'], d: 'Reiniciar el kernel' }
            ]},

            { type: 'h3', id: 'jp-kernels', text: 'Kernels y magic commands' },
            { type: 'cmd', label: 'Un kernel por entorno', lines: [
              '$ source .venv/bin/activate',
              '$ python -m ipykernel install --user --name analisis --display-name "Python (analisis)"',
              '$ jupyter kernelspec list',
              '$ jupyter kernelspec uninstall analisis'
            ]},
            { type: 'table', head: ['Magic', 'Qué hace'], rows: [
              ['%timeit expr', 'Tiempo medio de una expresión'],
              ['%%time', 'Tiempo de la celda entera'],
              ['!ls -la', 'Ejecuta un comando de la terminal'],
              ['%pip install paquete', 'Instala en el kernel actual (no en otro Python)'],
              ['%load_ext autoreload · %autoreload 2', 'Recarga módulos propios al editarlos'],
              ['%%writefile script.py', 'Guarda la celda en un archivo'],
              ['%matplotlib inline', 'Gráficos dentro del cuaderno']
            ]},

            { type: 'h3', id: 'jp-publicar', text: 'Exportar, dashboards, JupyterHub y Jupyter AI' },
            { type: 'cmd', label: 'Más allá del cuaderno', lines: [
              '# Exportar',
              '$ jupyter nbconvert analisis.ipynb --to html',
              '$ jupyter nbconvert analisis.ipynb --to pdf        # requiere LaTeX (texlive-xetex)',
              '$ jupyter nbconvert --to notebook --execute analisis.ipynb   # ejecutar de principio a fin',
              '',
              '# Cuaderno como dashboard (oculta el código)',
              '$ pip install voila && voila dashboard.ipynb',
              '',
              '# Servidor multiusuario',
              '$ pip install jupyterhub && jupyterhub',
              '',
              '# Asistente de IA en JupyterLab',
              '$ pip install jupyter-ai',
              '#   en una celda:  %load_ext jupyter_ai_magics',
              '#                  %%ai anthropic:claude-...   (y el prompt debajo)'
            ]},

            { type: 'h3', id: 'jp-problemas', text: 'Solución de problemas' },
            { type: 'table', head: ['Síntoma', 'Solución'], monoFirst: false, rows: [
              ['<code>jupyter: command not found</code>', '<code>python -m jupyter --version</code>; activa el entorno donde lo instalaste'],
              ['Puerto 8888 ocupado', '<code>jupyter lab --port 8889</code> o cierra el anterior con <code>jupyter server stop 8888</code>'],
              ['<code>ModuleNotFoundError</code> en el cuaderno', 'Kernel equivocado: <code>import sys; sys.executable</code> y <code>%pip install</code> en esa celda'],
              ['Kernel muerto', 'Reinicia el kernel; revisa la terminal del servidor (suele ser falta de RAM)'],
              ['Extensiones que no cargan', '<code>jupyter labextension list</code>; en JupyterLab 4 se instalan con pip y no requieren <code>jupyter lab build</code>'],
              ['No abre el navegador', 'Copia la URL con el token que aparece en la terminal']
            ]},
            { type: 'callout', variant: 'tip', title: 'Relacionado',
              html: '<p>Instalación del stack de datos, kernels por proyecto y PyTorch con GPU en <a href="#datos-jupyter">Jupyter, el stack de datos y la GPU</a>.</p>' }
          ]
        },

        /* ============================== MATERIALES ============================= */
        { id: 'cap-materiales', n: '3', t: 'Materiales del curso',
          lead: 'Copias de los materiales originales, incluidas en la aplicación para usarlas sin conexión. Las páginas HTML y los PDF se abren en una pestaña nueva.',
          blocks: [
            { type: 'h3', id: 'mat-opencode', text: 'OpenCode' },
            { type: 'downloads', items: [
              { href: BASE + 'opencode/html/index.html', open: true, title: 'Guía OpenCode (HTML)',
                desc: 'Instalación, comandos, agentes, skills, artefactos, 7 ejercicios y plantillas de agentes', size: '44 KB' },
              { href: BASE + 'opencode/Guia_OpenCode.pdf', open: true, title: 'Guía OpenCode (PDF)',
                desc: 'Versión para imprimir o proyectar', size: '395 KB' },
              { href: BASE + 'opencode/Guia_OpenCode.md', title: 'Guía OpenCode (Markdown)',
                desc: 'Fuente editable', size: '25 KB' }
            ]},
            { type: 'h3', id: 'mat-jupyter', text: 'Jupyter' },
            { type: 'downloads', items: [
              { href: BASE + 'jupyter/html-interactiva/interactivo.html', open: true, title: 'Guía Jupyter interactiva',
                desc: 'Tema claro/oscuro, índice, secciones plegables y cuestionario con filtro por categoría', size: '99 KB' },
              { href: BASE + 'jupyter/html-interactiva/cuestionario_imprimible.html', open: true, title: 'Cuestionario de evaluación',
                desc: 'Versión imprimible del cuestionario', size: '8 KB' },
              { href: BASE + 'jupyter/html-interactiva/index.html', open: true, title: 'Guía Jupyter resumida (HTML)',
                desc: 'Versión breve generada con R Markdown', size: '1 MB' },
              { href: BASE + 'jupyter/html-completa/index.html', open: true, title: 'Guía Jupyter completa (HTML)',
                desc: 'Todas las secciones y los 24 ejercicios', size: '82 KB' },
              { href: BASE + 'jupyter/Guia_Jupyter.pdf', open: true, title: 'Guía Jupyter (PDF)',
                desc: 'Manual completo', size: '514 KB' },
              { href: BASE + 'jupyter/Guia_Jupyter_RMD.pdf', open: true, title: 'Guía Jupyter resumida (PDF)',
                desc: 'Versión R Markdown', size: '292 KB' },
              { href: BASE + 'jupyter/Cheatsheet_Jupyter.pdf', open: true, title: 'Hoja de referencia Jupyter (PDF)',
                desc: 'Atajos, magics y comandos en una página', size: '282 KB' }
            ]},
            { type: 'h3', id: 'mat-clase', text: 'Usar los materiales en clase' },
            { type: 'cmd', label: 'Servir la aplicación en la red del aula', lines: [
              '# Desde la carpeta de la aplicación: los asistentes abren http://IP-DEL-EQUIPO:8000',
              '$ cd ~/Descargas/TodoSobreLinuxVersion1_MODIFICADO_25NOVIEMBRE2026',
              '$ hostname -I | awk \'{print $1}\'',
              '$ python3 -m http.server 8000',
              '',
              '# Recompilar los PDF desde las fuentes LaTeX originales (memoria USB)',
              '$ cd /media/$USER/kistom/casos_capacitacion2026_EAFIT_JUNIO_16_17_18/Guia_OPENCODE',
              '$ latexmk -pdf Guia_OpenCode.tex',
              '',
              '# La guía en R Markdown',
              '$ cd ../JUPYTER_GUIA',
              '$ Rscript -e \'rmarkdown::render("Guia_Jupyter.Rmd")\''
            ]},
            { type: 'callout', variant: 'info', title: 'Origen de los materiales',
              html: '<p>Originales en <code>/media/john/kistom/casos_capacitacion2026_EAFIT_JUNIO_16_17_18/</code>. La copia de la aplicación está en <code>descargas/capacitacion-eafit-2026/</code>; si actualizas las guías, vuelve a copiar los archivos para que coincidan.</p>' }
          ]
        }
      ]}
    ]
  });

})(window.Contenido);
