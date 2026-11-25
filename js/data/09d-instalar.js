/* 09d-instalar.js — instalar y desinstalar software clave: Python (cualquier
   versión), Manim, LaTeX (TeX Live, MiKTeX, TeXstudio), R y RStudio, paquetes
   de R para bases de datos / ML / series de tiempo, Chrome, OpenOffice,
   LibreOffice y alternativas de conda.
   Versiones comprobadas en noviembre de 2026: Python 3.15.0 (9-oct-2026),
   R 4.6.x (CRAN), RStudio 2026.09, Manim CE 0.22.1, TeX Live 2025/2026.
   CRAN, r2u, MiKTeX y rig solo publican para Ubuntu LTS (22.04, 24.04, 26.04). */
(function (C) {
  'use strict';

  /* =====================================================================
     1. PYTHON: CUALQUIER VERSIÓN
     ===================================================================== */
  var bPython = { type: 'builder', id: 'pyver', title: 'Instalar una versión concreta de Python',
    desc: 'Elige versión y método; el comando se adapta.',
    fields: [
      { k: 'ver', type: 'select', label: 'Versión', options: [
        ['3.15', '3.15 — la última (oct. 2026)'], ['3.14', '3.14 — penúltima'], ['3.13', '3.13 — antepenúltima (la de Ubuntu 25.10)'],
        ['3.12', '3.12 — solo parches de seguridad'], ['3.11', '3.11 — solo parches de seguridad'], ['3.10', '3.10 — fin de soporte en oct. 2026']], value: '3.13' },
      { k: 'met', type: 'select', label: 'Método', options: [
        ['uv', 'uv (recomendado, cualquier Ubuntu)'], ['conda', 'conda / mamba'], ['deadsnakes', 'PPA deadsnakes (solo Ubuntu LTS)'], ['pyenv', 'pyenv (compila desde el código)']] },
      { k: 'env', type: 'text', label: 'Carpeta del proyecto', value: '~/proyectos/analisis' },
      { k: 'venv', type: 'check', label: 'crear un entorno virtual con esa versión', value: true }
    ],
    build: function (v, q) {
      var L = [], p = [], w = [], ver = v.ver, dir = q(v.env || '.');
      if (v.met === 'uv') {
        L.push('uv self update                       # versiones nuevas requieren uv reciente');
        L.push('uv python install ' + ver);
        L.push('uv python list --only-installed');
        if (v.venv) { L.push('mkdir -p ' + dir + ' && cd ' + dir); L.push('uv venv --python ' + ver + ' && source .venv/bin/activate'); L.push('python --version'); }
        p.push({ t: 'uv python install ' + ver, d: 'descarga un Python precompilado; no toca el python3 del sistema' });
        if (v.venv) p.push({ t: 'uv venv --python ' + ver, d: 'crea .venv con esa versión en la carpeta del proyecto' });
      } else if (v.met === 'conda') {
        L.push('conda create -y -n py' + ver.replace('.', '') + ' -c conda-forge python=' + ver);
        L.push('conda activate py' + ver.replace('.', ''));
        L.push('python --version');
        p.push({ t: 'conda create -n py' + ver.replace('.', '') + ' python=' + ver, d: 'entorno conda independiente con esa versión' });
        if (ver === '3.15') w.push('conda-forge publica una versión de Python unas semanas después de su salida: si falla, prueba con uv.');
      } else if (v.met === 'deadsnakes') {
        L.push('sudo add-apt-repository -y ppa:deadsnakes/ppa');
        L.push('sudo apt update');
        L.push('sudo apt install -y python' + ver + ' python' + ver + '-venv python' + ver + '-dev');
        if (v.venv) { L.push('mkdir -p ' + dir + ' && cd ' + dir); L.push('python' + ver + ' -m venv .venv && source .venv/bin/activate'); }
        p.push({ t: 'ppa:deadsnakes/ppa', d: 'repositorio con versiones de Python para Ubuntu LTS' });
        p.push({ t: 'python' + ver + '-venv -dev', d: 'módulo venv y cabeceras para compilar extensiones' });
        w.push('deadsnakes solo publica para Ubuntu LTS (22.04, 24.04, 26.04) y no incluye la versión que ya trae tu Ubuntu. En 25.10 usa uv o conda.');
      } else {
        L.push('sudo apt install -y build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev');
        L.push('curl -fsSL https://pyenv.run | bash');
        L.push('# añade a ~/.bashrc lo que indica el instalador y abre una terminal nueva');
        L.push('pyenv install ' + ver);
        if (v.venv) { L.push('mkdir -p ' + dir + ' && cd ' + dir); L.push('pyenv local ' + ver + ' && python -m venv .venv && source .venv/bin/activate'); }
        p.push({ t: 'pyenv install ' + ver, d: 'compila esa versión desde el código (varios minutos)' });
      }
      p.push({ t: 'python ' + ver, d: { '3.15': 'última versión: lo más nuevo; algunas librerías tardan semanas en publicar ruedas para ella', '3.14': 'penúltima: estable y con amplio soporte de librerías', '3.13': 'antepenúltima: la más compatible hoy con librerías científicas (Manim, PyTorch…)', '3.12': 'solo parches de seguridad', '3.11': 'solo parches de seguridad', '3.10': 'llega al fin de soporte en octubre de 2026' }[ver] });
      if (ver === '3.10') w.push('Python 3.10 deja de recibir parches de seguridad en octubre de 2026.');
      return { lines: L, parts: p, warns: w };
    },
    presets: [
      { t: 'Última (3.15) con uv', v: { ver: '3.15', met: 'uv' } },
      { t: 'Antepenúltima (3.13) con uv', v: { ver: '3.13', met: 'uv' } },
      { t: '3.14 con conda', v: { ver: '3.14', met: 'conda' } }
    ] };

  C.registrar({
    id: 'inst-python',
    group: 'instalar',
    title: 'Python: instalar cualquier versión',
    level: 'basico',
    tags: ['python', 'python 3.15', 'python 3.14', 'python 3.13', 'uv', 'deadsnakes', 'pyenv', 'versiones', 'desinstalar python'],
    lead: 'Varias versiones de Python pueden convivir sin problemas si <b>no tocas el <code>python3</code> del sistema</b>. Aquí: qué versión elegir —en especial la última (3.15) y la antepenúltima (3.13)— y cuatro formas de instalarla.',
    blocks: [
      { type: 'table', head: ['Versión', 'Estado (nov. 2026)', 'Cuándo elegirla'], monoFirst: false, rows: [
        ['<b>3.15</b>', 'Última. Salió el 9-oct-2026', 'Probar novedades. Algunas librerías aún no tienen ruedas para ella'],
        ['<b>3.14</b>', 'Penúltima, con parches', 'Proyectos nuevos que quieren algo reciente y estable'],
        ['<b>3.13</b>', 'Antepenúltima, con parches', '<b>La más compatible</b> con librerías científicas. Es la de Ubuntu 25.10'],
        ['3.12 · 3.11', 'Solo seguridad', 'Proyectos existentes que la exigen'],
        ['3.10', 'Fin de soporte (oct. 2026)', 'Migra a una versión más nueva']
      ]},
      bPython,
      { type: 'tabs', id: 'py-tabs', title: 'Métodos', items: [
        { id: 'py-m-uv', n: '1', t: 'uv', badge: 'recomendado', badgeVariant: 'ok',
          lead: 'Descarga Pythons precompilados en tu carpeta personal. Funciona en cualquier Ubuntu, incluido 25.10, y no necesita sudo.',
          blocks: [
            { type: 'cmd', label: 'Última y antepenúltima a la vez', lines: [
              '$ curl -LsSf https://astral.sh/uv/install.sh | sh     # si aún no tienes uv',
              '$ uv self update                                     # necesario para ver la 3.15 final',
              '$ uv python install 3.15 3.13',
              '$ uv python list --only-installed',
              '',
              '# Usar una versión concreta',
              '$ uv run --python 3.15 python -c "import sys; print(sys.version)"',
              '$ uv venv --python 3.13                             # entorno del proyecto',
              '',
              '# uv crea los comandos python3.15 y python3.13 en ~/.local/bin',
              '$ ls ~/.local/bin/python3.*',
              '# Opcional: que «python» y «python3» de tu usuario sean la 3.15',
              '$ uv python install --default 3.15'
            ]},
            { type: 'cmd', label: 'Desinstalar', lines: [
              '$ uv python uninstall 3.15',
              '$ uv python list --only-installed'
            ]}
          ]
        },
        { id: 'py-m-conda', n: '2', t: 'conda',
          blocks: [
            { type: 'cmd', label: 'Un entorno por versión', lines: [
              '$ conda create -y -n py313 -c conda-forge python=3.13',
              '$ conda create -y -n py315 -c conda-forge python=3.15',
              '$ conda activate py315 && python --version',
              '',
              '$ conda env remove -n py315                          # desinstalar'
            ]}
          ]
        },
        { id: 'py-m-deadsnakes', n: '3', t: 'deadsnakes (LTS)',
          lead: 'Paquetes .deb de otras versiones de Python. <b>Solo para Ubuntu LTS</b> (22.04, 24.04, 26.04).',
          blocks: [
            { type: 'cmd', label: 'Instalar y quitar', lines: [
              '$ sudo add-apt-repository -y ppa:deadsnakes/ppa && sudo apt update',
              '$ sudo apt install -y python3.15 python3.15-venv python3.15-dev',
              '$ python3.15 -m venv .venv',
              '',
              '$ sudo apt purge python3.15 python3.15-venv python3.15-dev',
              '$ sudo add-apt-repository --remove ppa:deadsnakes/ppa'
            ]}
          ]
        },
        { id: 'py-m-pyenv', n: '4', t: 'pyenv',
          lead: 'Compila cada versión desde el código fuente. Útil si necesitas una versión de parche exacta (3.13.4) o compilaciones a medida.',
          blocks: [
            { type: 'cmd', label: 'Instalar pyenv y una versión', lines: [
              '$ sudo apt install -y build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev',
              '$ curl -fsSL https://pyenv.run | bash',
              '# Copia en ~/.bashrc las 3 líneas que muestra el instalador y abre otra terminal',
              '$ pyenv install --list | grep -E "^\\s*3\\.1[3-5]"',
              '$ pyenv install 3.13',
              '$ pyenv local 3.13          # en la carpeta del proyecto (.python-version)',
              '',
              '$ pyenv uninstall 3.13      # desinstalar'
            ]}
          ]
        },
        { id: 'py-m-quitar', n: '5', t: 'Desinstalar y problemas', badge: 'cuidado', badgeVariant: 'danger',
          blocks: [
            { type: 'callout', variant: 'danger', title: 'Nunca desinstales el python3 de Ubuntu',
              html: '<p><code>sudo apt remove python3</code> arrastra cientos de paquetes: el escritorio, el gestor de actualizaciones y la terminal. Si lo hiciste, recupéralo desde la consola (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F3</kbd>) con <code>sudo apt install ubuntu-desktop python3</code>. Tampoco cambies <code>/usr/bin/python3</code> con <code>update-alternatives</code>.</p>' },
            { type: 'table', head: ['Problema', 'Solución'], monoFirst: false, rows: [
              ['<code>uv python install 3.15</code> instala una beta (3.15.0b1)', 'Tu uv es antiguo: <code>uv self update</code>'],
              ['Una librería no instala en 3.15', 'Aún no publica ruedas para la versión nueva: usa 3.13 o 3.14 en ese proyecto'],
              ['<code>python</code> no es la versión que esperas', '<code>which -a python python3</code>; activa el entorno del proyecto'],
              ['Anaconda «tapa» al resto', 'conda pone su <code>python3</code> primero en el PATH: <code>conda config --set auto_activate_base false</code>'],
              ['<code>ModuleNotFoundError: No module named \'_ssl\'</code> (pyenv)', 'Faltaban cabeceras al compilar: instala las dependencias y <code>pyenv install --force 3.13</code>']
            ]},
            { type: 'callout', variant: 'tip', title: 'Relacionado',
              html: '<p>Entornos, pip, uv, pipx y errores de instalación de librerías en <a href="#datos-python">Python para datos</a> y <a href="#datos-problemas">Errores al instalar</a>.</p>' }
          ]
        }
      ]}
    ]
  });
  C.constructoresExtra = (C.constructoresExtra || []).concat([bPython]);

  /* =====================================================================
     2. MANIM
     ===================================================================== */
  C.registrar({
    id: 'inst-manim',
    group: 'instalar',
    title: 'Manim: animaciones matemáticas con Python',
    level: 'intermedio',
    tags: ['manim', 'manim community', 'animaciones', 'pycairo', 'manimpango', 'ffmpeg', 'manim-slides', 'manim-voiceover', 'mathtex'],
    lead: 'Manim Community (0.22.1, octubre de 2026) genera vídeos de matemáticas desde código. Necesita tres cosas del sistema: <b>compilador y cabeceras</b> (para pycairo y ManimPango), <b>FFmpeg</b> (para el vídeo) y <b>LaTeX</b> (para las fórmulas con <code>MathTex</code>).',
    blocks: [
      { type: 'tabs', id: 'manim-tabs', items: [
        { id: 'manim-deps', n: '1', t: 'Dependencias del sistema',
          blocks: [
            { type: 'cmd', label: 'Ubuntu / Debian', lines: [
              '$ sudo apt update',
              '$ sudo apt install -y build-essential python3-dev pkg-config \\',
              '    libcairo2-dev libpango1.0-dev ffmpeg',
              '',
              '# LaTeX para MathTex y Tex (mínimo recomendado por Manim)',
              '$ sudo apt install -y texlive texlive-latex-extra texlive-fonts-extra \\',
              '    texlive-science dvisvgm',
              '',
              '$ ffmpeg -version | head -1 && latex --version | head -1'
            ]}
          ]
        },
        { id: 'manim-uv', n: '2', t: 'Instalar con uv', badge: 'recomendado', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Proyecto de animaciones', lines: [
              '$ uv init animaciones && cd animaciones',
              '$ uv python pin 3.13            # la más compatible con todo el ecosistema',
              '$ uv add manim',
              '$ uv run manim checkhealth',
              '',
              '# O como herramienta global (comando «manim» en cualquier carpeta)',
              '$ uv tool install manim',
              '$ manim --version'
            ]},
            { type: 'cmd', label: 'Primera animación', lines: [
              '$ cat > escena.py <<\'EOF\'',
              'from manim import *',
              '',
              'class Pitagoras(Scene):',
              '    def construct(self):',
              '        f = MathTex(r"a^2 + b^2 = c^2", font_size=96)',
              '        self.play(Write(f))',
              '        self.wait()',
              'EOF',
              '',
              '# -p reproduce al terminar · -ql calidad baja (rápido) · -qh alta',
              '$ uv run manim -pql escena.py Pitagoras',
              '$ uv run manim -qh escena.py Pitagoras        # 1080p para publicar'
            ]}
          ]
        },
        { id: 'manim-conda', n: '3', t: 'Instalar con conda',
          lead: 'conda-forge trae pycairo, Pango y FFmpeg ya compilados: no hace falta instalar dependencias del sistema (salvo LaTeX).',
          blocks: [
            { type: 'cmd', label: 'Entorno conda', lines: [
              '$ conda create -y -n manim -c conda-forge python=3.13 manim',
              '$ conda activate manim',
              '$ manim checkhealth'
            ]}
          ]
        },
        { id: 'manim-libs', n: '4', t: 'Librerías complementarias',
          blocks: [
            { type: 'table', head: ['Paquete', 'Versión', 'Para qué'], rows: [
              ['manim-slides', '5.7.0', 'Presentaciones a partir de escenas (HTML o PowerPoint)'],
              ['manim-voiceover', '0.4.0', 'Narración sincronizada con la animación (voz sintética o grabada)'],
              ['manim-chemistry', '0.5.1', 'Moléculas, orbitales y tabla periódica'],
              ['manim-physics', '0.4.0', 'Péndulos, campos, óptica. <b>Solo Python ≤ 3.12</b>'],
              ['manimgl', '1.7.2', 'La versión original de 3Blue1Brown (incompatible con Manim CE en el mismo entorno)']
            ]},
            { type: 'cmd', label: 'Añadirlas al proyecto', lines: [
              '$ uv add manim-slides manim-voiceover manim-chemistry',
              '',
              '# manim-physics requiere Python 3.12 o anterior: en un proyecto aparte',
              '$ uv init fisica && cd fisica && uv python pin 3.12 && uv add manim manim-physics',
              '',
              '# Presentación con manim-slides',
              '$ uv run manim-slides render escena.py Pitagoras',
              '$ uv run manim-slides convert Pitagoras presentacion.html'
            ]}
          ]
        },
        { id: 'manim-quitar', n: '5', t: 'Desinstalar y problemas',
          blocks: [
            { type: 'cmd', label: 'Desinstalar', lines: [
              '$ uv remove manim                 # del proyecto',
              '$ uv tool uninstall manim         # herramienta global',
              '$ conda env remove -n manim       # entorno conda',
              '$ rm -rf media/                   # vídeos e imágenes generados en el proyecto'
            ]},
            { type: 'table', head: ['Error', 'Solución'], monoFirst: false, rows: [
              ['<code>Failed building wheel for pycairo</code> / <code>No C compiler found</code>', '<code>sudo apt install build-essential python3-dev pkg-config libcairo2-dev</code>'],
              ['<code>pango … not found</code> al instalar ManimPango', '<code>sudo apt install libpango1.0-dev pkg-config</code>'],
              ['<code>LaTeX Error: File \'standalone.cls\' not found</code>', 'Faltan paquetes LaTeX: <code>sudo apt install texlive-latex-extra</code>'],
              ['<code>dvisvgm: command not found</code> o fórmulas en blanco', '<code>sudo apt install dvisvgm</code>'],
              ['<code>FileNotFoundError: ffmpeg</code>', '<code>sudo apt install ffmpeg</code>'],
              ['Funciona en la terminal pero no en el cuaderno', 'El kernel de Jupyter es otro Python: ver <a href="#datos-jupyter/jup-instalar">kernels</a>'],
              ['manim-physics no instala', 'Requiere Python ≤ 3.12: crea su propio proyecto con esa versión']
            ]}
          ]
        }
      ]}
    ]
  });

  /* =====================================================================
     3. LATEX
     ===================================================================== */
  C.registrar({
    id: 'inst-latex',
    group: 'instalar',
    title: 'LaTeX: TeX Live completo, MiKTeX y TeXstudio',
    level: 'intermedio',
    tags: ['latex', 'texlive', 'texlive-full', 'tlmgr', 'miktex', 'texstudio', 'pdflatex', 'xelatex', 'paquete sty'],
    lead: 'Dos distribuciones de LaTeX: <b>TeX Live</b> (la estándar en Linux; «full» lo trae todo) y <b>MiKTeX</b> (instala los paquetes a medida que tus documentos los piden). Y <b>TeXstudio</b>, el editor. Instala solo <b>una</b> distribución: dos a la vez provocan conflictos de rutas.',
    blocks: [
      { type: 'tabs', id: 'latex-tabs', items: [
        { id: 'tex-full', n: '1', t: 'TeX Live completo (texlive-full)', badge: 'recomendado', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Desde los repositorios de Ubuntu (lo más sencillo)', lines: [
              '# Todo TeX Live: ~6 GB descargados, ~8 GB instalados',
              '$ df -h /',
              '$ sudo apt update && sudo apt install -y texlive-full',
              '',
              '$ pdflatex --version | head -1',
              '$ kpsewhich tikz.sty beamer.cls     # comprobar que un paquete está'
            ]},
            { type: 'cmd', label: 'Instalación «por partes» (más ligera, ~1,5 GB)', lines: [
              '$ sudo apt install -y texlive texlive-latex-extra texlive-fonts-recommended \\',
              '    texlive-fonts-extra texlive-science texlive-lang-spanish texlive-bibtex-extra \\',
              '    texlive-xetex texlive-luatex biber latexmk',
              '',
              '# ¿En qué paquete de Ubuntu está un .sty que falta?',
              '$ sudo apt install -y apt-file && sudo apt-file update',
              '$ apt-file search siunitx.sty'
            ]},
            { type: 'cmd', label: 'TeX Live oficial de TUG (versión del año, con tlmgr completo)', lines: [
              '# Útil si necesitas la última versión de TeX Live o actualizar paquetes con tlmgr',
              '$ cd /tmp && wget https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz',
              '$ tar -xzf install-tl-unx.tar.gz && cd install-tl-2*',
              '$ sudo perl ./install-tl --no-interaction        # esquema completo en /usr/local/texlive/AÑO',
              '',
              '# Añadir al PATH (ajusta el año)',
              '$ echo \'export PATH="/usr/local/texlive/2026/bin/x86_64-linux:$PATH"\' >> ~/.bashrc',
              '$ source ~/.bashrc && which pdflatex',
              '',
              '$ sudo env PATH="$PATH" tlmgr update --self --all    # actualizar paquetes'
            ]},
            { type: 'callout', variant: 'warn', title: 'No mezcles la de Ubuntu con la de TUG',
              html: '<p>Si instalas la de TUG, quita antes la de Ubuntu (<code>sudo apt purge "texlive*"</code>) o asegúrate de que <code>/usr/local/texlive/AÑO/bin</code> va primero en el PATH. Para que apt no reinstale TeX Live al instalar otros programas, existe el paquete ficticio <code>tex-common</code>/<code>equivs</code> (ver la guía de TUG).</p>' }
          ]
        },
        { id: 'tex-miktex', n: '2', t: 'MiKTeX',
          lead: 'MiKTeX publica paquetes para <b>Ubuntu 26.04, 24.04 y 22.04 LTS</b>. En versiones no LTS (como 25.10) no hay repositorio: usa TeX Live o Docker.',
          blocks: [
            { type: 'cmd', label: 'Instalar (cambia «noble» por «resolute» en 26.04 o «jammy» en 22.04)', lines: [
              '$ curl -fsSL https://miktex.org/download/key | sudo gpg --dearmor -o /usr/share/keyrings/miktex.gpg',
              '$ echo "deb [signed-by=/usr/share/keyrings/miktex.gpg] https://miktex.org/download/ubuntu noble universe" \\',
              '    | sudo tee /etc/apt/sources.list.d/miktex.list',
              '$ sudo apt-get update && sudo apt-get install -y miktex',
              '',
              '# Terminar la configuración (solo para tu usuario; ejecutables en ~/bin)',
              '$ miktexsetup finish',
              '# Instalar paquetes automáticamente cuando un documento los pida',
              '$ initexmf --set-config-value [MPM]AutoInstall=1',
              '',
              '# Para todos los usuarios, en su lugar:',
              '$ sudo miktexsetup --shared=yes finish',
              '$ sudo initexmf --admin --set-config-value [MPM]AutoInstall=1',
              '',
              '# Mantener: comprobar y actualizar los paquetes instalados',
              '$ miktex packages check-update',
              '$ miktex packages update',
              '$ sudo miktex --admin packages update      # si lo configuraste para todos'
            ]},
            { type: 'cmd', label: 'En Ubuntu 25.10 (sin repositorio): MiKTeX en Docker', lines: [
              '$ docker pull miktex/miktex',
              '$ docker run -ti --rm -v miktex:/miktex/.miktex -v "$PWD":/miktex/work \\',
              '    miktex/miktex pdflatex documento.tex'
            ]},
            { type: 'cmd', label: 'Desinstalar MiKTeX', lines: [
              '# MiKTeX no documenta la desinstalación en Linux («miktexsetup uninstall» es solo para Windows).',
              '# Esta es la secuencia equivalente: paquete, repositorio, datos de usuario y enlaces.',
              '$ sudo apt purge miktex',
              '$ sudo rm -f /etc/apt/sources.list.d/miktex.list /usr/share/keyrings/miktex.gpg',
              '$ rm -rf ~/.miktex                            # paquetes y configuración de tu usuario',
              '',
              '# Enlaces que creó «miktexsetup finish» en ~/bin: revísalos y después bórralos',
              '$ find ~/bin -maxdepth 1 -type l -lname "*miktex*" -print',
              '$ find ~/bin -maxdepth 1 -type l -lname "*miktex*" -delete',
              '# Instalación compartida: los enlaces están en /usr/local/bin (mismo find con sudo)'
            ]}
          ]
        },
        { id: 'tex-studio', n: '3', t: 'TeXstudio',
          blocks: [
            { type: 'cmd', label: 'Instalar el editor', lines: [
              '# Repositorios de Ubuntu (versión algo anterior)',
              '$ sudo apt install -y texstudio',
              '',
              '# Flatpak (última versión)',
              '$ flatpak install -y flathub org.texstudio.TeXstudio',
              '',
              '# Desinstalar',
              '$ sudo apt purge texstudio        # o: flatpak uninstall --delete-data org.texstudio.TeXstudio',
              '$ rm -rf ~/.config/texstudio'
            ]},
            { type: 'callout', variant: 'tip', title: 'Configuración recomendada',
              html: '<p><b>Opciones → Configurar TeXstudio → Producción</b>: compilador por defecto <code>Latexmk</code> (compila las veces necesarias y ejecuta biber/bibtex solo) y bibliografía <code>Biber</code>. Con MiKTeX, comprueba en <b>Comandos</b> que las rutas apuntan a <code>~/bin</code>.</p>' }
          ]
        },
        { id: 'tex-quitar', n: '4', t: 'Desinstalar y problemas',
          blocks: [
            { type: 'cmd', label: 'Quitar TeX Live', lines: [
              '# El de Ubuntu (libera varios GB)',
              '$ sudo apt purge "texlive*" tex-common && sudo apt autoremove --purge',
              '',
              '# El oficial de TUG',
              '$ sudo rm -rf /usr/local/texlive/2026 ~/.texlive2026',
              '# y quita su línea del PATH en ~/.bashrc'
            ]},
            { type: 'table', head: ['Error', 'Solución'], monoFirst: false, rows: [
              ['<code>! LaTeX Error: File \'xxx.sty\' not found</code>', 'TeX Live de Ubuntu: <code>apt-file search xxx.sty</code> e instala ese paquete. TUG: <code>sudo tlmgr install xxx</code>. MiKTeX: activa AutoInstall'],
              ['<code>tlmgr: unexpected return value from verify_checksum</code> o «user mode not initialized»', 'Con TeX Live de Ubuntu tlmgr está limitado: instala paquetes con apt o usa la versión de TUG'],
              ['Acentos o ñ rotos en el PDF', '<code>\\usepackage[T1]{fontenc}</code> y archivo guardado en UTF-8 (pdflatex), o usa xelatex/lualatex'],
              ['Bibliografía vacía', 'Ejecuta biber (o bibtex) entre compilaciones; con latexmk es automático'],
              ['TeXstudio no encuentra pdflatex', '<code>which pdflatex</code> y pon esa ruta en Opciones → Comandos']
            ]}
          ]
        }
      ]}
    ]
  });

  /* =====================================================================
     4. R Y RSTUDIO
     ===================================================================== */
  C.registrar({
    id: 'inst-r',
    group: 'instalar',
    title: 'R y RStudio: instalar, actualizar y desinstalar',
    level: 'intermedio',
    tags: ['r', 'r-base', 'cran', 'rstudio', 'rig', 'r2u', 'r 4.6', 'posit', 'actualizar r'],
    lead: 'La versión de R depende del método: los repositorios de Ubuntu traen una versión algo antigua (4.5.1 en 25.10), <b>CRAN</b> trae la última (4.6.x) pero solo para Ubuntu LTS, y <b>rig</b> instala cualquier versión en cualquier Ubuntu, incluso varias a la vez. RStudio es un paquete .deb independiente.',
    blocks: [
      { type: 'table', head: ['Método', 'Versión de R', 'Ubuntu', 'Ideal para'], monoFirst: false, rows: [
        ['<b>CRAN (apt)</b>', 'Última (4.6.x)', '22.04, 24.04, 26.04 LTS', 'Equipos LTS: se actualiza con apt'],
        ['<b>rig</b>', 'Cualquiera, varias a la vez', 'Cualquiera (incluida 25.10)', 'Tener la última en una versión no LTS, o cambiar de versión por proyecto'],
        ['<b>Ubuntu (apt)</b>', 'La de tu versión de Ubuntu', 'Todas', 'Lo más simple si no necesitas la última'],
        ['<b>conda</b>', 'conda-forge', 'Todas', 'Proyectos que ya usan conda']
      ]},
      { type: 'tabs', id: 'r-tabs', items: [
        { id: 'r-cran', n: '1', t: 'R desde CRAN (LTS)', badge: 'LTS', badgeVariant: 'info',
          blocks: [
            { type: 'cmd', label: 'Ubuntu 22.04 / 24.04 / 26.04', lines: [
              '$ sudo apt update -qq',
              '$ sudo apt install -y --no-install-recommends software-properties-common dirmngr',
              '',
              '# Clave de CRAN (huella E298A3A825C0D65DFD57CBB651716619E084DAB9)',
              '$ wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc \\',
              '    | sudo tee -a /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc',
              '$ gpg --show-keys /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc',
              '',
              '# Repositorio («cran40» es solo una etiqueta: instala la 4.6.x)',
              '$ sudo add-apt-repository "deb https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/"',
              '$ sudo apt install -y --no-install-recommends r-base r-base-dev',
              '$ R --version | head -1'
            ]},
            { type: 'callout', variant: 'warn', title: 'En Ubuntu 25.10 este repositorio no existe',
              html: '<p><code>add-apt-repository</code> añadiría <code>questing-cran40</code>, que da error 404 en <code>apt update</code>. Usa <b>rig</b> (pestaña 2) o el R de Ubuntu. Si ya lo añadiste: <code>sudo add-apt-repository --remove "deb https://cloud.r-project.org/bin/linux/ubuntu questing-cran40/"</code>.</p>' }
          ]
        },
        { id: 'r-rig', n: '2', t: 'R con rig (cualquier Ubuntu)', badge: 'recomendado en 25.10', badgeVariant: 'ok',
          lead: 'rig (de Posit) instala versiones oficiales de R, una o varias, y permite elegir la predeterminada. En modo usuario no necesita sudo.',
          blocks: [
            { type: 'cmd', label: 'Instalar rig y la última R', lines: [
              '$ curl -LsSf https://r-lib.github.io/rig/install.sh | sh',
              '$ rig system user-mode           # instala las R en tu carpeta personal',
              '$ rig add release                # última versión estable',
              '$ rig add 4.5                    # otra versión, si un proyecto la necesita',
              '',
              '$ rig list                       # versiones instaladas (* = predeterminada)',
              '$ rig default release            # cuál usa el comando R',
              '$ R --version | head -1'
            ]},
            { type: 'callout', variant: 'info', title: 'Ubuntu 25.10 no aparece en la lista oficial de rig',
              html: '<p>rig lista oficialmente Ubuntu 20.04, 22.04, 24.04 y 26.04. Su modo usuario funciona en cualquier Linux con glibc ≥ 2.28, que es el caso de 25.10, pero no es una plataforma certificada: si algo falla, el R de Ubuntu (pestaña 3) es la alternativa.</p>' },
            { type: 'cmd', label: 'Desinstalar', lines: [
              '$ rig rm 4.5                     # una versión',
              '$ rig self uninstall             # rig completo (instalación por script)'
            ]}
          ]
        },
        { id: 'r-ubuntu', n: '3', t: 'R de Ubuntu',
          blocks: [
            { type: 'cmd', label: 'La versión de tu Ubuntu', lines: [
              '$ sudo apt install -y r-base r-base-dev',
              '$ apt-cache policy r-base-core | head -3',
              '',
              '# conda como alternativa',
              '$ conda create -y -n r -c conda-forge r-base r-essentials && conda activate r'
            ]}
          ]
        },
        { id: 'r-rstudio', n: '4', t: 'RStudio',
          lead: 'Posit publica un único .deb para Ubuntu 22.04 y posteriores (la compilación «jammy»), válido también en 24.04, 25.10 y 26.04.',
          blocks: [
            { type: 'cmd', label: 'Instalar o actualizar RStudio Desktop', lines: [
              '# Comprueba la versión actual en posit.co/download/rstudio-desktop',
              '$ VER=2026.09.0-174',
              '$ cd /tmp && wget https://download1.rstudio.org/electron/jammy/amd64/rstudio-${VER}-amd64.deb',
              '$ sudo apt install -y ./rstudio-${VER}-amd64.deb',
              '$ rstudio --version'
            ]},
            { type: 'cmd', label: 'Desinstalar', lines: [
              '$ sudo apt purge rstudio',
              '$ rm -rf ~/.config/rstudio ~/.local/share/rstudio      # ajustes y sesiones guardadas'
            ]},
            { type: 'table', head: ['Problema', 'Solución'], monoFirst: false, rows: [
              ['Pantalla en blanco o se cierra al abrir', '<code>rstudio --disable-gpu</code>; si funciona, desactiva la aceleración en Tools → Global Options → Advanced'],
              ['No encuentra R', '<code>which R</code>; con rig: <code>rig default release</code> y vuelve a abrir RStudio'],
              ['Usa otra versión de R', 'Tools → Global Options → General → R version (o <code>export RSTUDIO_WHICH_R=/ruta/R</code>)'],
              ['Error de sandbox de Chromium en Ubuntu 24.04+', 'Actualiza a la última versión de RStudio, que incluye el perfil de AppArmor']
            ]}
          ]
        },
        { id: 'r-actualizar', n: '5', t: 'Actualizar R y desinstalar',
          blocks: [
            { type: 'cmd', label: 'Tras subir de versión menor (4.5 → 4.6): reinstalar los paquetes', lines: [
              '# Antes de actualizar, guarda la lista de paquetes',
              '$ Rscript -e \'saveRDS(rownames(installed.packages(priority="NA")), "~/paquetes_R.rds")\'',
              '',
              '# Después de actualizar',
              '$ Rscript -e \'install.packages("pak"); pak::pkg_install(readRDS("~/paquetes_R.rds"))\''
            ]},
            { type: 'cmd', label: 'Desinstalar R por completo', lines: [
              '$ sudo apt purge "r-base*" "r-cran-*" r-recommended',
              '$ sudo apt autoremove --purge',
              '$ sudo rm -f /etc/apt/sources.list.d/*cran* /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc',
              '$ rm -rf ~/R ~/.local/share/R ~/.Rprofile ~/.Renviron    # librería personal y ajustes'
            ]}
          ]
        }
      ]}
    ]
  });

  /* =====================================================================
     5. R PARA BASES DE DATOS, ML Y SERIES DE TIEMPO
     ===================================================================== */
  var bRpaq = { type: 'builder', id: 'rpaq', title: 'Paquetes de R por área',
    desc: 'Marca las áreas; se genera la instalación con <code>pak</code>, que también informa de las librerías del sistema necesarias.',
    fields: [
      { k: 'base', type: 'check', label: 'Base: tidyverse, data.table, janitor', value: true },
      { k: 'bd', type: 'check', label: 'Bases de datos', value: true },
      { k: 'ml', type: 'check', label: 'Machine learning' },
      { k: 'ts', type: 'check', label: 'Series de tiempo' },
      { k: 'rep', type: 'check', label: 'Informes: rmarkdown, quarto, gt' },
      { k: 'dl', type: 'check', label: 'Deep learning (torch)' }
    ],
    build: function (v) {
      var G = {
        base: ['tidyverse', 'data.table', 'janitor', 'arrow'],
        bd: ['DBI', 'dbplyr', 'RSQLite', 'duckdb', 'RPostgres', 'RMariaDB', 'odbc', 'pool'],
        ml: ['tidymodels', 'ranger', 'xgboost', 'glmnet', 'lightgbm', 'vip', 'mlr3verse', 'caret'],
        ts: ['tsibble', 'fable', 'feasts', 'fabletools', 'forecast', 'timetk', 'modeltime', 'zoo', 'xts', 'tseries', 'urca', 'imputeTS', 'prophet'],
        rep: ['rmarkdown', 'quarto', 'gt', 'knitr'],
        dl: ['torch', 'luz']
      };
      var D = { base: 'manipulación de datos y lectura rápida (arrow: Parquet)', bd: 'conexión a SQLite, DuckDB, PostgreSQL, MySQL/MariaDB y ODBC; dplyr sobre SQL', ml: 'modelado unificado (tidymodels/mlr3), bosques, boosting, regularización',
        ts: 'series ordenadas (tsibble), pronóstico (fable, forecast, modeltime, prophet), pruebas de estacionariedad', rep: 'informes reproducibles', dl: 'redes neuronales con libtorch' };
      var paq = [], p = [];
      Object.keys(G).forEach(function (k) { if (v[k]) { paq = paq.concat(G[k]); p.push({ t: G[k].join(' '), d: D[k] }); } });
      if (!paq.length) return { lines: ['# Marca al menos un área'], parts: [] };
      var vec = 'c(' + paq.map(function (x) { return '"' + x + '"'; }).join(', ') + ')';
      var L = [
        '# 1. Ver qué librerías del sistema necesitan (y el comando apt para instalarlas)',
        'Rscript -e \'install.packages("pak", repos = "https://cloud.r-project.org"); print(pak::pkg_sysreqs(' + vec + '))\'',
        '# 2. Instalar los paquetes (en paralelo, con dependencias)',
        'Rscript -e \'pak::pkg_install(' + vec + ')\''
      ];
      if (v.dl) L.push('Rscript -e \'torch::install_torch()\'        # descarga libtorch (~1 GB)');
      var w = [];
      if (v.ts) w.push('prophet compila Stan: tarda varios minutos y necesita ~4 GB de RAM.');
      return { lines: L, parts: p, warns: w };
    } };

  C.registrar({
    id: 'inst-r-datos',
    group: 'instalar',
    title: 'R y RStudio para bases de datos, ML y series de tiempo',
    level: 'avanzado',
    tags: ['r', 'rstudio', 'dbi', 'odbc', 'rpostgres', 'duckdb', 'tidymodels', 'xgboost', 'mlr3', 'fable', 'forecast', 'tsibble', 'prophet', 'modeltime', 'pak', 'r2u', 'openblas'],
    lead: 'Cómo dejar R y RStudio preparados para trabajo serio: <b>instalar paquetes rápido</b> (binarios en lugar de compilar), conectarse a <b>bases de datos</b>, <b>machine learning</b>, <b>series de tiempo</b> y ajustes de <b>rendimiento</b>.',
    blocks: [
      bRpaq,
      { type: 'tabs', id: 'rdatos-tabs', items: [
        { id: 'rd-rapido', n: '1', t: 'Instalar paquetes rápido', badge: 'primero', badgeVariant: 'ok',
          lead: 'En Linux, CRAN entrega el código fuente y cada paquete se compila: tidyverse puede tardar 20 minutos. Hay tres formas de evitarlo.',
          blocks: [
            { type: 'table', head: ['Método', 'Cómo funciona', 'Requisitos'], monoFirst: false, rows: [
              ['<b>r2u</b>', 'Todos los paquetes de CRAN como .deb binarios: <code>install.packages()</code> instala en segundos', 'Ubuntu LTS (22.04, 24.04) y R de CRAN'],
              ['<b>Posit Package Manager</b>', 'Binarios precompilados servidos como un repositorio de CRAN', 'Ubuntu LTS; funciona con cualquier R'],
              ['<b>pak + paralelo</b>', 'Compila, pero en paralelo y avisando de las librerías del sistema', 'Cualquier Ubuntu (25.10 incluido)']
            ]},
            { type: 'cmd', label: 'r2u (Ubuntu 24.04 LTS)', lines: [
              '# Script oficial de configuración (añade el repositorio y bspm)',
              '$ wget -q https://raw.githubusercontent.com/eddelbuettel/r2u/master/inst/scripts/add_cranapt_noble.sh',
              '$ less add_cranapt_noble.sh && sudo bash add_cranapt_noble.sh',
              '',
              '# A partir de ahora, install.packages() usa binarios .deb',
              '$ Rscript -e \'install.packages(c("tidyverse", "tidymodels", "fable"))\''
            ]},
            { type: 'cmd', label: 'Posit Package Manager (binarios para Ubuntu LTS)', lines: [
              '# En ~/.Rprofile (cambia noble por jammy en 22.04)',
              '$ cat >> ~/.Rprofile <<\'EOF\'',
              'options(repos = c(CRAN = "https://packagemanager.posit.co/cran/__linux__/noble/latest"))',
              'options(HTTPUserAgent = sprintf("R/%s R (%s)", getRversion(), paste(getRversion(), R.version["platform"], R.version["arch"], R.version["os"])))',
              'EOF'
            ]},
            { type: 'cmd', label: 'Cualquier Ubuntu: compilar en paralelo y con las dependencias del sistema', lines: [
              '# Librerías del sistema que piden los paquetes más habituales',
              '$ sudo apt install -y build-essential gfortran cmake libcurl4-openssl-dev libssl-dev libxml2-dev \\',
              '    libfontconfig1-dev libharfbuzz-dev libfribidi-dev libfreetype-dev libpng-dev libtiff-dev libjpeg-dev \\',
              '    libgit2-dev libsodium-dev libudunits2-dev libgdal-dev libgeos-dev libproj-dev \\',
              '    libpq-dev libmariadb-dev unixodbc-dev libsqlite3-dev libopenblas-dev liblapack-dev',
              '',
              '# Usar todos los núcleos al instalar',
              '$ echo \'options(Ncpus = parallel::detectCores())\' >> ~/.Rprofile',
              '$ mkdir -p ~/.R && echo "MAKEFLAGS = -j$(nproc)" >> ~/.R/Makevars'
            ]}
          ]
        },
        { id: 'rd-bd', n: '2', t: 'Bases de datos',
          blocks: [
            { type: 'cmd', label: 'Paquetes y librerías del sistema', lines: [
              '$ sudo apt install -y libpq-dev libmariadb-dev unixodbc-dev libsqlite3-dev',
              '# Controladores ODBC (para el panel «Connections» de RStudio)',
              '$ sudo apt install -y odbc-postgresql odbc-mariadb',
              '$ odbcinst -q -d                              # controladores disponibles',
              '',
              '$ Rscript -e \'pak::pkg_install(c("DBI", "dbplyr", "RSQLite", "duckdb", "RPostgres", "RMariaDB", "odbc", "pool"))\''
            ]},
            { type: 'cmd', label: 'Conectar y consultar desde R', lines: [
              '| library(DBI); library(dplyr)',
              '|',
              '| # DuckDB: analítica local sobre CSV/Parquet sin servidor',
              '| con <- dbConnect(duckdb::duckdb(), "ventas.duckdb")',
              '| dbExecute(con, "CREATE TABLE v AS SELECT * FROM read_csv_auto(\'ventas.csv\')")',
              '|',
              '| # PostgreSQL (la contraseña desde ~/.Renviron, nunca en el código)',
              '| con <- dbConnect(RPostgres::Postgres(), dbname = "datos", host = "localhost",',
              '|                  user = Sys.getenv("PGUSER"), password = Sys.getenv("PGPASSWORD"))',
              '|',
              '| # dplyr traduce a SQL y ejecuta en la base de datos',
              '| tbl(con, "v") |> group_by(region) |> summarise(total = sum(importe)) |> show_query()',
              '| dbDisconnect(con)'
            ]},
            { type: 'callout', variant: 'tip', title: 'Credenciales en ~/.Renviron',
              html: '<p><code>PGUSER=analista</code> y <code>PGPASSWORD=…</code> en <code>~/.Renviron</code> (con <code>chmod 600 ~/.Renviron</code>). En RStudio también puedes usar <code>rstudioapi::askForPassword()</code>.</p>' }
          ]
        },
        { id: 'rd-ml', n: '3', t: 'Machine learning',
          blocks: [
            { type: 'table', head: ['Paquete', 'Para qué'], rows: [
              ['tidymodels', 'Marco unificado: recetas, validación cruzada, ajuste de hiperparámetros'],
              ['mlr3verse', 'Alternativa orientada a objetos, muy completa para benchmarking'],
              ['ranger', 'Random forest rápido y multinúcleo'],
              ['xgboost · lightgbm', 'Gradient boosting (lo que suele ganar en datos tabulares)'],
              ['glmnet', 'Regresión regularizada (lasso, ridge, elastic net)'],
              ['vip', 'Importancia de variables'],
              ['torch · luz', 'Redes neuronales con libtorch, sin Python']
            ]},
            { type: 'cmd', label: 'Instalar y comprobar', lines: [
              '$ Rscript -e \'pak::pkg_install(c("tidymodels", "ranger", "xgboost", "glmnet", "lightgbm", "vip"))\'',
              '$ Rscript -e \'library(tidymodels); tidymodels_prefer(); print(packageVersion("tidymodels"))\'',
              '',
              '# Deep learning',
              '$ Rscript -e \'pak::pkg_install(c("torch", "luz")); torch::install_torch()\'',
              '$ Rscript -e \'torch::cuda_is_available()\'       # TRUE si usa la GPU NVIDIA'
            ]}
          ]
        },
        { id: 'rd-ts', n: '4', t: 'Series de tiempo',
          blocks: [
            { type: 'table', head: ['Paquete', 'Para qué'], rows: [
              ['tsibble · feasts', 'Series en formato ordenado; descomposición STL, autocorrelación'],
              ['fable · fabletools', 'ARIMA, ETS, regresión dinámica sobre muchas series a la vez'],
              ['forecast', 'El clásico: auto.arima, ets, tbats'],
              ['modeltime · timetk', 'ML para series (xgboost, prophet) con la sintaxis de tidymodels'],
              ['prophet', 'Modelo de Meta: tendencia + estacionalidad + festivos'],
              ['zoo · xts', 'Series irregulares y financieras'],
              ['tseries · urca', 'Pruebas de raíz unitaria (ADF, KPSS) y cointegración'],
              ['imputeTS', 'Rellenar huecos en series']
            ]},
            { type: 'cmd', label: 'Instalar y un pronóstico de ejemplo', lines: [
              '$ Rscript -e \'pak::pkg_install(c("tsibble", "fable", "feasts", "forecast", "modeltime", "timetk", "zoo", "xts", "tseries", "urca", "imputeTS"))\'',
              '# prophet compila Stan: tarda y necesita ~4 GB de RAM',
              '$ Rscript -e \'pak::pkg_install("prophet")\'',
              '',
              '| library(fpp3)   # tsibble + fable + feasts + datos de ejemplo',
              '| aus_production |> model(ETS(Beer), ARIMA(Beer)) |> forecast(h = "2 years") |> autoplot(aus_production)'
            ]}
          ]
        },
        { id: 'rd-rend', n: '5', t: 'Rendimiento y RStudio',
          blocks: [
            { type: 'cmd', label: 'Álgebra lineal más rápida (R de apt)', lines: [
              '$ sudo apt install -y libopenblas-dev',
              '$ sudo update-alternatives --config libblas.so.3-x86_64-linux-gnu      # elige openblas',
              '$ Rscript -e \'sessionInfo()\' | grep -i blas',
              '',
              '# Comparar: multiplicación de matrices 2000×2000',
              '$ Rscript -e \'m <- matrix(rnorm(4e6), 2000); print(system.time(m %*% m))\''
            ]},
            { type: 'cmd', label: '~/.Rprofile recomendado', lines: [
              '| options(',
              '|   Ncpus = parallel::detectCores(),     # instalar paquetes en paralelo',
              '|   repos = c(CRAN = "https://cloud.r-project.org"),',
              '|   scipen = 999,                        # sin notación científica',
              '|   digits.secs = 3',
              '| )',
              '| if (requireNamespace("data.table", quietly = TRUE)) data.table::setDTthreads(0)'
            ]},
            { type: 'table', head: ['Ajuste de RStudio', 'Dónde'], monoFirst: false, rows: [
              ['No guardar ni restaurar el espacio de trabajo (.RData)', 'Tools → Global Options → General: «Restore .RData» desactivado y «Save workspace» = Never'],
              ['Proyectos (.Rproj) y renv por proyecto', 'File → New Project; <code>renv::init()</code> fija las versiones de paquetes'],
              ['Panel Connections para bases de datos', 'Aparece solo con <code>odbc</code> y controladores instalados'],
              ['Memoria visible en el panel Environment', 'Tools → Global Options → General → Advanced → «Show memory usage»'],
              ['Trabajos en segundo plano', 'Background Jobs: ejecuta un script largo sin bloquear la consola']
            ]}
          ]
        }
      ]}
    ]
  });
  C.constructoresExtra = C.constructoresExtra.concat([bRpaq]);

  /* =====================================================================
     6. CHROME, OPENOFFICE Y LIBREOFFICE
     ===================================================================== */
  C.registrar({
    id: 'inst-apps',
    group: 'instalar',
    title: 'Google Chrome, Apache OpenOffice y LibreOffice',
    level: 'basico',
    tags: ['google chrome', 'chrome', 'openoffice', 'apache openoffice', 'libreoffice', 'ofimatica', 'navegador', 'desinstalar chrome'],
    lead: 'Instalación limpia y desinstalación <b>completa</b> (incluidos repositorios y perfiles) de un navegador y dos paquetes ofimáticos.',
    blocks: [
      { type: 'tabs', id: 'apps-tabs', items: [
        { id: 'app-chrome', n: '1', t: 'Google Chrome',
          blocks: [
            { type: 'cmd', label: 'Instalar (añade el repositorio de Google para recibir actualizaciones)', lines: [
              '$ cd /tmp && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb',
              '$ sudo apt install -y ./google-chrome-stable_current_amd64.deb',
              '$ google-chrome --version',
              '',
              '# Actualizar (llega con las actualizaciones normales)',
              '$ sudo apt update && sudo apt install --only-upgrade google-chrome-stable'
            ]},
            { type: 'cmd', label: 'Desinstalar por completo', lines: [
              '$ sudo apt purge google-chrome-stable',
              '$ sudo rm -f /etc/apt/sources.list.d/google-chrome.list /etc/apt/sources.list.d/google-chrome.sources',
              '# Perfil: marcadores, contraseñas y extensiones (haz copia o sincroniza antes)',
              '$ rm -rf ~/.config/google-chrome ~/.cache/google-chrome'
            ]},
            { type: 'callout', variant: 'tip', title: 'Si Chrome no arranca',
              html: '<p>Perfil bloqueado tras un cierre brusco: <code>rm ~/.config/google-chrome/Singleton*</code>. Pantalla en negro o parpadeos: <code>google-chrome --disable-gpu</code>. Para empezar con un perfil limpio sin perder el tuyo: <code>mv ~/.config/google-chrome ~/.config/google-chrome.bak</code>.</p>' }
          ]
        },
        { id: 'app-openoffice', n: '2', t: 'Apache OpenOffice',
          lead: 'Se distribuye como un .tar.gz con paquetes .deb. Su desarrollo es muy lento (versión 4.1.x); para uso diario, LibreOffice está mucho más actualizado.',
          blocks: [
            { type: 'cmd', label: 'Instalar', lines: [
              '# 1. Descarga en openoffice.org el paquete «Linux 64-bit (x86-64) (DEB)» en español',
              '$ cd ~/Descargas',
              '$ tar -xzf Apache_OpenOffice_4.1.*_Linux_x86-64_install-deb_es.tar.gz',
              '$ cd es/DEBS',
              '$ sudo dpkg -i *.deb',
              '$ sudo dpkg -i desktop-integration/*.deb',
              '$ sudo apt install -f                 # si faltara alguna dependencia',
              '',
              '# Java (opcional: asistentes y la base de datos Base)',
              '$ sudo apt install -y default-jre',
              '$ openoffice4'
            ]},
            { type: 'cmd', label: 'Desinstalar', lines: [
              '$ dpkg -l | grep -i openoffice',
              '$ sudo apt purge "openoffice*" "openoffice4*"',
              '$ sudo rm -rf /opt/openoffice4 ~/.openoffice'
            ]},
            { type: 'callout', variant: 'warn', title: 'Con LibreOffice instalado',
              html: '<p>Pueden convivir, pero ambos se registran para abrir .odt, .docx, etc. Elige el predeterminado con clic derecho en un archivo → <b>Abrir con</b> → <b>Establecer como predeterminado</b>.</p>' }
          ]
        },
        { id: 'app-libreoffice', n: '3', t: 'LibreOffice',
          blocks: [
            { type: 'table', head: ['Fuente', 'Ventaja', 'Inconveniente'], monoFirst: false, rows: [
              ['<b>apt</b> (Ubuntu)', 'Integrado y estable', 'Versión de cuando salió tu Ubuntu'],
              ['<b>PPA libreoffice</b>', 'Versión reciente como .deb', 'Solo Ubuntu'],
              ['<b>Flatpak</b>', 'Última versión, aislada', 'Ocupa más'],
              ['<b>snap</b>', 'Preinstalado en algunos Ubuntu', 'Arranque más lento; no ve rutas fuera de tu carpeta']
            ]},
            { type: 'cmd', label: 'Instalar (elige una)', lines: [
              '$ sudo apt install -y libreoffice libreoffice-l10n-es libreoffice-help-es',
              '',
              '$ sudo add-apt-repository -y ppa:libreoffice/ppa && sudo apt update && sudo apt full-upgrade',
              '',
              '$ flatpak install -y flathub org.libreoffice.LibreOffice'
            ]},
            { type: 'cmd', label: 'Desinstalar', lines: [
              '$ sudo apt purge "libreoffice*" && sudo apt autoremove --purge',
              '$ sudo snap remove --purge libreoffice',
              '$ flatpak uninstall --delete-data org.libreoffice.LibreOffice',
              '$ rm -rf ~/.config/libreoffice        # perfil (si se corrompe, también lo arregla)'
            ]}
          ]
        }
      ]}
    ]
  });

  /* =====================================================================
     7. CONDA Y ALTERNATIVAS
     ===================================================================== */
  C.registrar({
    id: 'inst-conda',
    group: 'instalar',
    title: 'Conda y sus alternativas: Miniforge, Miniconda, Anaconda, micromamba y pixi',
    level: 'intermedio',
    tags: ['conda', 'anaconda', 'miniconda', 'miniforge', 'mamba', 'micromamba', 'pixi', 'desinstalar anaconda'],
    lead: 'Todas instalan paquetes de los canales de conda; cambian el tamaño, el canal por defecto y la velocidad. Elige una: tener varias a la vez en el PATH causa conflictos.',
    blocks: [
      { type: 'table', head: ['Opción', 'Tamaño', 'Canal por defecto', 'Para quién'], monoFirst: false, rows: [
        ['<b>Miniforge</b>', '~100 MB', 'conda-forge', 'La recomendada: libre de licencias, incluye mamba'],
        ['<b>Miniconda</b>', '~150 MB', 'defaults (Anaconda)', 'Mínima de Anaconda. Licencia de pago en organizaciones grandes'],
        ['<b>Anaconda</b>', '~5 GB', 'defaults', 'Todo preinstalado + Navigator gráfico'],
        ['<b>micromamba</b>', '~15 MB', 'el que indiques', 'Un único ejecutable, sin «base»: contenedores y CI'],
        ['<b>pixi</b>', '~30 MB', 'conda-forge', 'Gestor por proyecto (como uv, pero con paquetes conda) con archivo de bloqueo']
      ]},
      { type: 'tabs', id: 'conda-opc-tabs', items: [
        { id: 'co-miniforge', n: '1', t: 'Miniforge', badge: 'recomendado', badgeVariant: 'ok',
          blocks: [
            { type: 'callout', variant: 'tip', title: 'Instalación y uso',
              html: '<p>Los comandos de instalación, entornos, <code>environment.yml</code> y limpieza están en <a href="#datos-conda/conda-miniforge">Datos → Conda</a>.</p>' }
          ]
        },
        { id: 'co-miniconda', n: '2', t: 'Miniconda',
          blocks: [
            { type: 'cmd', label: 'Instalar', lines: [
              '$ cd /tmp && wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh',
              '$ bash Miniconda3-latest-Linux-x86_64.sh -b -p "$HOME/miniconda3"',
              '$ "$HOME/miniconda3/bin/conda" init bash && source ~/.bashrc',
              '',
              '# Usar conda-forge en lugar de defaults',
              '$ conda config --add channels conda-forge && conda config --set channel_priority strict'
            ]}
          ]
        },
        { id: 'co-micromamba', n: '3', t: 'micromamba',
          blocks: [
            { type: 'cmd', label: 'Instalar y usar', lines: [
              '$ "${SHELL}" <(curl -L micro.mamba.pm/install.sh)',
              '$ source ~/.bashrc',
              '$ micromamba create -y -n datos -c conda-forge python=3.13 pandas',
              '$ micromamba activate datos',
              '',
              '# Desinstalar',
              '$ micromamba shell deinit && rm -rf ~/.local/bin/micromamba ~/micromamba'
            ]}
          ]
        },
        { id: 'co-pixi', n: '4', t: 'pixi',
          blocks: [
            { type: 'cmd', label: 'Proyecto con pixi', lines: [
              '$ curl -fsSL https://pixi.sh/install.sh | bash',
              '$ source ~/.bashrc',
              '$ pixi init analisis && cd analisis',
              '$ pixi add python=3.13 pandas r-base r-forecast      # Python y R en el mismo entorno',
              '$ pixi run python -c "import pandas; print(pandas.__version__)"',
              '$ pixi shell                                        # activar el entorno',
              '',
              '# Desinstalar',
              '$ rm -rf ~/.pixi && sed -i "/pixi/d" ~/.bashrc'
            ]}
          ]
        },
        { id: 'co-cambiar', n: '5', t: 'Desinstalar Anaconda y pasar a Miniforge',
          lead: 'Para liberar varios GB y evitar la licencia: exporta tus entornos, desinstala Anaconda, instala Miniforge y recréalos.',
          blocks: [
            { type: 'steps', items: [
              { t: 'Exportar los entornos', cmd: { label: '1', lines: [
                  '$ mkdir -p ~/entornos_conda',
                  '$ for e in $(conda env list | awk \'!/^#/ && NF {print $1}\'); do conda env export -n "$e" --from-history > ~/entornos_conda/"$e".yml; done',
                  '$ ls ~/entornos_conda'
                ]}
              },
              { t: 'Desinstalar Anaconda por completo', cmd: { label: '2', lines: [
                  '$ conda install -y anaconda-clean && anaconda-clean --yes      # borra configuraciones ocultas',
                  '$ conda init --reverse --all',
                  '$ rm -rf ~/anaconda3 ~/.conda ~/.condarc ~/.continuum ~/.anaconda_backup',
                  '# Abre una terminal nueva: «conda» ya no debe existir',
                  '$ command -v conda || echo "conda eliminado"'
                ]}
              },
              { t: 'Instalar Miniforge y recrear', cmd: { label: '3', lines: [
                  '# Instálalo como en Datos → Conda → Instalar Miniforge, y después:',
                  '$ for f in ~/entornos_conda/*.yml; do mamba env create -f "$f"; done'
                ]}
              }
            ]},
            { type: 'callout', variant: 'warn', title: 'Revisa qué usa tu Anaconda antes de borrarla',
              html: '<p>Programas como Jupyter, Spyder o el comando <code>manim</code> pueden estar instalados dentro de <code>~/anaconda3</code>: tras borrarla desaparecen. Compruébalo con <code>ls ~/anaconda3/bin</code> y reinstala lo que necesites en el entorno nuevo.</p>' }
          ]
        }
      ]}
    ]
  });

})(window.Contenido);
