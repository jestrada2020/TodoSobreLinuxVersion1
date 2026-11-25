/* 09b-datos.js — paquetes clave para procesar datos: sistema, Python, uv,
   conda, Jupyter, GPU y solución de errores de instalación */
(function (C) {
  'use strict';

  /* ======================================================================
     1. BASE DEL SISTEMA
     ====================================================================== */
  C.registrar({
    id: 'datos-base',
    group: 'datos',
    title: 'Paquetes del sistema para trabajar con datos',
    level: 'basico',
    tags: ['build-essential', 'python3-dev', 'openblas', 'postgresql', 'gdal', 'duckdb', 'jq', 'csvkit', 'ciencia de datos'],
    lead: 'La mitad de los errores al instalar librerías de datos (<code>pandas</code>, <code>psycopg</code>, <code>geopandas</code>, <code>lxml</code>…) no son de Python: faltan <b>compiladores y cabeceras del sistema</b>. Instálalos una vez y te ahorras horas.',
    blocks: [
      { type: 'h2', id: 'kit-rapido', text: 'Instalación recomendada en un solo paso' },
      { type: 'cmd', label: 'Ubuntu 22.04 / 24.04 — base para datos', lines: [
        '$ sudo apt update',
        '$ sudo apt install -y \\',
        '    build-essential gfortran pkg-config cmake git git-lfs curl wget \\',
        '    python3 python3-dev python3-venv python3-pip pipx \\',
        '    libssl-dev libffi-dev zlib1g-dev libbz2-dev liblzma-dev \\',
        '    libreadline-dev libsqlite3-dev libncursesw5-dev tk-dev uuid-dev \\',
        '    libopenblas-dev liblapack-dev libhdf5-dev \\',
        '    libxml2-dev libxslt1-dev libjpeg-dev libpng-dev \\',
        '    sqlite3 jq',
        '',
        '# Comprobar',
        '$ gcc --version | head -1 && python3 --version && pipx --version'
      ]},
      { type: 'callout', variant: 'info', title: 'Por qué cada grupo',
        html: '<p><code>build-essential</code> + <code>python3-dev</code> compilan extensiones en C cuando no hay <i>wheel</i> precompilado. Las <code>lib*-dev</code> de compresión, SSL y readline hacen falta para que <code>uv</code> o <code>pyenv</code> compilen versiones de Python completas. <code>openblas</code>/<code>lapack</code>/<code>gfortran</code> son el álgebra lineal de NumPy y SciPy cuando se compilan desde fuente.</p>' },

      { type: 'h2', id: 'por-area', text: 'Paquetes por área' },
      { type: 'tabs', id: 'base-tabs', items: [
        { id: 'base-bd', n: '1', t: 'Bases de datos',
          blocks: [
            { type: 'cmd', label: 'Clientes y cabeceras de bases de datos', lines: [
              '# PostgreSQL: cliente psql y libpq (lo necesita psycopg al compilar)',
              '$ sudo apt install -y postgresql-client libpq-dev',
              '',
              '# Servidor PostgreSQL local',
              '$ sudo apt install -y postgresql',
              '$ sudo -u postgres createuser --interactive "$USER"',
              '$ createdb datos && psql datos',
              '',
              '# MySQL / MariaDB (mysqlclient)',
              '$ sudo apt install -y default-libmysqlclient-dev',
              '',
              '# DuckDB: SQL analítico sobre CSV y Parquet, sin servidor',
              '$ curl https://install.duckdb.org | sh',
              '$ ~/.duckdb/cli/latest/duckdb -c "SELECT * FROM \'ventas.csv\' LIMIT 5"',
              '',
              '# ODBC (SQL Server, conectores corporativos)',
              '$ sudo apt install -y unixodbc-dev'
            ]}
          ]
        },
        { id: 'base-geo', n: '2', t: 'Geoespacial',
          blocks: [
            { type: 'cmd', label: 'GDAL, GEOS y PROJ (geopandas, rasterio, shapely)', lines: [
              '$ sudo apt install -y gdal-bin libgdal-dev libgeos-dev libproj-dev proj-bin libspatialindex-dev',
              '$ gdalinfo --version',
              '',
              '# Si instalas el paquete GDAL de Python, su versión DEBE coincidir con la del sistema',
              '$ pip install "GDAL==$(gdal-config --version).*"'
            ]},
            { type: 'callout', variant: 'tip', title: 'Más fácil con conda',
              html: '<p>El stack geoespacial es donde <code>conda</code> (canal <code>conda-forge</code>) más ahorra: <code>mamba install -c conda-forge geopandas rasterio</code> trae GDAL compilado y compatible, sin tocar el sistema.</p>' }
          ]
        },
        { id: 'base-cli', n: '3', t: 'Datos en la terminal',
          blocks: [
            { type: 'cmd', label: 'Herramientas para explorar datos sin abrir Python', lines: [
              '$ sudo apt install -y jq miller csvkit visidata',
              '',
              '# jq: JSON',
              '$ curl -s https://api.github.com/repos/pandas-dev/pandas | jq ".stargazers_count"',
              '',
              '# csvkit: estadísticas y SQL sobre CSV',
              '$ csvstat ventas.csv',
              '$ csvsql --query "select region, sum(total) from ventas group by region" ventas.csv',
              '',
              '# miller (mlr): como awk pero entiende cabeceras',
              '$ mlr --icsv --opprint sort -nr total then head -n 5 ventas.csv',
              '',
              '# visidata: hoja de cálculo interactiva en la terminal',
              '$ vd ventas.csv'
            ]}
          ]
        },
        { id: 'base-r', n: '4', t: 'R',
          blocks: [
            { type: 'cmd', label: 'R con las dependencias de tidyverse', lines: [
              '$ sudo apt install -y r-base r-base-dev \\',
              '    libcurl4-openssl-dev libxml2-dev libssl-dev libfontconfig1-dev \\',
              '    libharfbuzz-dev libfribidi-dev libfreetype6-dev libtiff5-dev',
              '',
              '$ R -e \'install.packages(c("tidyverse", "IRkernel"))\'',
              '# Registrar R como kernel de Jupyter',
              '$ R -e \'IRkernel::installspec()\''
            ]}
          ]
        },
        { id: 'base-gpu', n: '5', t: 'GPU NVIDIA',
          lead: 'Para PyTorch o TensorFlow con GPU solo necesitas el <b>driver</b> del sistema: los wheels de PyTorch ya incluyen las librerías CUDA.',
          blocks: [
            { type: 'cmd', label: 'Driver y comprobación', lines: [
              '$ ubuntu-drivers devices',
              '$ sudo ubuntu-drivers install',
              '$ sudo reboot',
              '',
              '$ nvidia-smi',
              '| Driver Version: 570.xx   CUDA Version: 12.8   ← CUDA MÁXIMA que soporta el driver',
              '',
              '# El toolkit CUDA completo (nvcc) solo hace falta para COMPILAR código CUDA',
              '$ sudo apt install -y nvidia-cuda-toolkit && nvcc --version'
            ]},
            { type: 'callout', variant: 'warn', title: 'Si algo va mal con el driver',
              html: '<p>Una instalación de driver fallida puede dejar la pantalla negra. La solución está en <a href="#resc-sistema/sis-negra">Rescate → Pantalla negra / NVIDIA</a>. Crea una instantánea con Timeshift antes de cambiar de driver.</p>' }
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     2. PYTHON: venv, pip, uv
     ====================================================================== */
  C.registrar({
    id: 'datos-python',
    group: 'datos',
    title: 'Python para datos: venv, pip, uv y pipx',
    level: 'basico',
    tags: ['python', 'pip', 'venv', 'uv', 'pipx', 'pep 668', 'externally-managed-environment', 'entorno virtual'],
    lead: 'Regla de oro: <b>nunca instales librerías en el Python del sistema</b>. Ubuntu lo usa para sus propias herramientas y, desde 23.04, lo bloquea con <code>externally-managed-environment</code>. Cada proyecto tiene su entorno virtual.',
    blocks: [
      { type: 'table', head: ['Herramienta', 'Para qué', 'Recomendación'], monoFirst: false, rows: [
        ['<b>uv</b>', 'Proyectos, entornos, versiones de Python y herramientas. 10-100× más rápido que pip', 'La opción por defecto hoy'],
        ['<b>venv + pip</b>', 'Lo estándar, incluido en Python', 'Cuando no puedes instalar nada más'],
        ['<b>pipx</b> / <b>uv tool</b>', 'Aplicaciones de línea de comandos aisladas (jupyterlab, ruff, csvkit…)', 'Para herramientas globales'],
        ['<b>conda</b>', 'Paquetes con binarios no-Python (GDAL, CUDA, R)', 'Ver <a href="#datos-conda">Conda</a>']
      ]},

      { type: 'tabs', id: 'python-tabs', items: [
        { id: 'py-uv', n: '1', t: 'uv', badge: 'recomendado', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Instalar uv', lines: [
              '$ curl -LsSf https://astral.sh/uv/install.sh | sh',
              '$ source ~/.bashrc          # o abre una terminal nueva',
              '$ uv --version',
              '',
              '# Actualizar uv más adelante',
              '$ uv self update'
            ]},
            { type: 'cmd', label: 'Proyecto de datos completo con uv', lines: [
              '$ uv init analisis-ventas && cd analisis-ventas',
              '',
              '# Fija una versión de Python (uv la descarga si no la tienes)',
              '$ uv python install 3.12',
              '$ uv python pin 3.12',
              '',
              '# Añadir dependencias: se registran en pyproject.toml y uv.lock',
              '$ uv add pandas numpy matplotlib seaborn scikit-learn pyarrow openpyxl',
              '$ uv add --dev ipykernel ruff pytest',
              '',
              '# Ejecutar dentro del entorno sin activarlo',
              '$ uv run python analisis.py',
              '$ uv run --with jupyter jupyter lab',
              '',
              '# Reproducir el entorno exacto en otro equipo',
              '$ uv sync'
            ]},
            { type: 'cmd', label: 'uv como reemplazo directo de venv + pip', lines: [
              '$ uv venv                         # crea .venv',
              '$ source .venv/bin/activate',
              '$ uv pip install -r requirements.txt',
              '$ uv pip freeze > requirements.txt'
            ]}
          ]
        },
        { id: 'py-venv', n: '2', t: 'venv + pip',
          blocks: [
            { type: 'cmd', label: 'El método estándar', lines: [
              '$ sudo apt install -y python3-venv python3-pip',
              '',
              '$ cd ~/proyectos/analisis',
              '$ python3 -m venv .venv',
              '$ source .venv/bin/activate',
              '$ python -m pip install --upgrade pip',
              '$ pip install pandas numpy matplotlib jupyterlab',
              '',
              '# Guardar y reproducir las dependencias',
              '$ pip freeze > requirements.txt',
              '$ pip install -r requirements.txt',
              '',
              '# Salir del entorno',
              '$ deactivate'
            ]},
            { type: 'callout', variant: 'tip', title: 'Comprueba siempre qué Python estás usando',
              html: '<p><code>which python</code> y <code>python -c "import sys; print(sys.prefix)"</code>. Si no apuntan a <code>.venv</code>, el entorno no está activo y vas a instalar en otro sitio.</p>' }
          ]
        },
        { id: 'py-pipx', n: '3', t: 'pipx / uv tool',
          lead: 'Para aplicaciones que quieres disponibles en cualquier carpeta, cada una aislada en su propio entorno.',
          blocks: [
            { type: 'cmd', label: 'Herramientas globales sin ensuciar el sistema', lines: [
              '# Con pipx',
              '$ sudo apt install -y pipx && pipx ensurepath',
              '$ pipx install jupyterlab',
              '$ pipx install csvkit',
              '$ pipx list',
              '$ pipx upgrade-all',
              '',
              '# Con uv (más rápido)',
              '$ uv tool install ruff',
              '$ uv tool install --with pandas jupyterlab',
              '$ uv tool list',
              '$ uv tool upgrade --all',
              '',
              '# Ejecutar una herramienta una sola vez, sin instalarla',
              '$ uvx ruff check .'
            ]}
          ]
        },
        { id: 'py-versiones', n: '4', t: 'Varias versiones de Python',
          blocks: [
            { type: 'cmd', label: 'Tener 3.10, 3.11, 3.12 y 3.13 a la vez', lines: [
              '# Con uv (descarga binarios precompilados, no toca el sistema)',
              '$ uv python install 3.10 3.11 3.13',
              '$ uv python list',
              '$ uv venv --python 3.11',
              '',
              '# Con el PPA deadsnakes (paquetes de sistema)',
              '$ sudo add-apt-repository ppa:deadsnakes/ppa',
              '$ sudo apt install -y python3.11 python3.11-venv python3.11-dev',
              '$ python3.11 -m venv .venv'
            ]},
            { type: 'callout', variant: 'danger', title: 'No cambies el python3 del sistema',
              html: '<p>Nunca uses <code>update-alternatives</code> para que <code>python3</code> apunte a otra versión ni desinstales el <code>python3</code> de Ubuntu: rompe <code>apt</code>, la terminal de GNOME y el gestor de actualizaciones. Usa entornos virtuales.</p>' }
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     3. CONDA
     ====================================================================== */
  C.registrar({
    id: 'datos-conda',
    group: 'datos',
    title: 'Conda: Miniforge, Anaconda y mamba',
    level: 'intermedio',
    tags: ['conda', 'anaconda', 'miniforge', 'mamba', 'conda-forge', 'environment.yml', 'miniconda'],
    lead: 'Conda gestiona paquetes <b>con sus binarios no-Python</b> (GDAL, CUDA, MKL, R, compiladores). Es la opción más cómoda para stacks científicos complejos. Miniforge es la distribución mínima recomendada, con <code>conda-forge</code> como canal por defecto.',
    blocks: [
      { type: 'tabs', id: 'conda-tabs', items: [
        { id: 'conda-miniforge', n: '1', t: 'Instalar Miniforge', badge: 'recomendado', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Miniforge (conda + mamba, canal conda-forge)', lines: [
              '$ cd ~/Descargas',
              '$ curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"',
              '',
              '# -b: sin preguntas   -p: carpeta de instalación',
              '$ bash Miniforge3-$(uname)-$(uname -m).sh -b -p "$HOME/miniforge3"',
              '',
              '# Engancharlo a la shell y abrir una terminal nueva',
              '$ "$HOME/miniforge3/bin/conda" init bash',
              '$ source ~/.bashrc',
              '$ conda --version && mamba --version',
              '',
              '# Que (base) no se active al abrir cada terminal',
              '$ conda config --set auto_activate_base false'
            ]}
          ]
        },
        { id: 'conda-anaconda', n: '2', t: 'Anaconda',
          lead: 'Anaconda trae cientos de paquetes preinstalados (unos 5 GB). Útil si quieres todo listo, a costa de espacio.',
          blocks: [
            { type: 'cmd', label: 'Instalar Anaconda', lines: [
              '# Descarga el instalador .sh para Linux x86_64 desde anaconda.com/download',
              '$ bash ~/Descargas/Anaconda3-*-Linux-x86_64.sh',
              '#   Acepta la licencia, ruta por defecto ~/anaconda3, "yes" a conda init',
              '$ source ~/.bashrc',
              '$ conda info',
              '',
              '# Verificar la integridad del instalador antes de ejecutarlo',
              '$ sha256sum ~/Descargas/Anaconda3-*-Linux-x86_64.sh'
            ]},
            { type: 'callout', variant: 'warn', title: 'Licencia del canal «defaults»',
              html: '<p>Los repositorios propios de Anaconda (<code>defaults</code>) requieren licencia de pago en organizaciones de más de 200 personas. Para evitarlo y tener paquetes más recientes, usa <code>conda-forge</code>: <code>conda config --add channels conda-forge && conda config --set channel_priority strict</code>.</p>' }
          ]
        },
        { id: 'conda-entornos', n: '3', t: 'Entornos',
          blocks: [
            { type: 'cmd', label: 'Crear, usar y reproducir entornos', lines: [
              '# Un entorno por proyecto, con su versión de Python',
              '$ mamba create -n datos python=3.12 pandas numpy scipy scikit-learn matplotlib jupyterlab ipykernel',
              '$ conda activate datos',
              '$ mamba install -c conda-forge polars duckdb',
              '',
              '$ conda env list',
              '$ conda list | grep pandas',
              '',
              '# Exportar solo lo que pediste (portable entre sistemas)',
              '$ conda env export --from-history > environment.yml',
              '$ mamba env create -f environment.yml',
              '$ mamba env update -f environment.yml --prune',
              '',
              '# Borrar un entorno',
              '$ conda deactivate && conda env remove -n datos'
            ]},
            { type: 'cmd', label: 'environment.yml de ejemplo', lines: [
              '| name: datos',
              '| channels:',
              '|   - conda-forge',
              '| dependencies:',
              '|   - python=3.12',
              '|   - pandas',
              '|   - geopandas',
              '|   - jupyterlab',
              '|   - pip',
              '|   - pip:',
              '|     - paquete-que-solo-esta-en-pypi'
            ]}
          ]
        },
        { id: 'conda-mantener', n: '4', t: 'Mantener y limpiar',
          blocks: [
            { type: 'cmd', label: 'Actualizar, liberar espacio y desinstalar', lines: [
              '$ conda update -n base conda',
              '$ mamba update --all -n datos',
              '',
              '# Cachés de paquetes descargados (suele liberar varios GB)',
              '$ conda clean --all -y',
              '$ du -sh ~/miniforge3 ~/anaconda3 2>/dev/null',
              '',
              '# Desinstalar conda por completo',
              '$ conda init --reverse bash',
              '$ rm -rf ~/miniforge3          # o ~/anaconda3',
              '$ rm -rf ~/.conda ~/.condarc'
            ]},
            { type: 'callout', variant: 'warn', title: 'No mezcles pip y conda sin orden',
              html: '<p>Instala primero todo lo posible con <code>mamba</code> y usa <code>pip</code> solo para lo que no exista en conda-forge, <b>al final</b> y dentro del entorno activo. Si después actualizas con conda paquetes que pip modificó, el entorno puede quedar incoherente: lo más rápido es recrearlo desde <code>environment.yml</code>.</p>' }
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     4. JUPYTER Y STACK
     ====================================================================== */
  C.registrar({
    id: 'datos-jupyter',
    group: 'datos',
    title: 'Jupyter, el stack de datos y la GPU',
    level: 'intermedio',
    tags: ['jupyter', 'jupyterlab', 'kernel', 'ipykernel', 'pandas', 'polars', 'pytorch', 'cuda', 'vscode'],
    lead: 'El error más frecuente con Jupyter no es instalarlo: es que el notebook use <b>otro Python</b> distinto al de tu entorno. La clave es registrar cada entorno como un <i>kernel</i>.',
    blocks: [
      { type: 'tabs', id: 'jupyter-tabs', items: [
        { id: 'jup-instalar', n: '1', t: 'JupyterLab y kernels',
          blocks: [
            { type: 'cmd', label: 'Un JupyterLab global y un kernel por proyecto', lines: [
              '# JupyterLab una sola vez, aislado',
              '$ uv tool install jupyterlab          # o: pipx install jupyterlab',
              '',
              '# En cada proyecto, registra su entorno como kernel',
              '$ cd ~/proyectos/analisis && source .venv/bin/activate',
              '$ pip install ipykernel',
              '$ python -m ipykernel install --user --name analisis --display-name "Python (analisis)"',
              '',
              '$ jupyter lab                       # elige el kernel "Python (analisis)"',
              '',
              '# Gestionar kernels',
              '$ jupyter kernelspec list',
              '$ jupyter kernelspec uninstall analisis'
            ]},
            { type: 'cmd', label: 'Jupyter en un servidor remoto, por túnel SSH', lines: [
              '# En el servidor',
              '$ jupyter lab --no-browser --port 8888',
              '',
              '# En tu equipo, y abre http://localhost:8888 con el token',
              '$ ssh -N -L 8888:localhost:8888 usuario@servidor'
            ]}
          ]
        },
        { id: 'jup-stack', n: '2', t: 'Stack de datos',
          blocks: [
            { type: 'table', head: ['Paquete', 'Para qué'], rows: [
              ['pandas', 'Tablas en memoria, el estándar'],
              ['polars', 'DataFrames muy rápidos y multinúcleo, ideal para archivos grandes'],
              ['duckdb', 'SQL directamente sobre DataFrames, CSV y Parquet'],
              ['pyarrow', 'Formato Parquet y columnar; acelera pandas'],
              ['numpy / scipy', 'Cálculo numérico y científico'],
              ['scikit-learn', 'Aprendizaje automático clásico'],
              ['matplotlib / seaborn / plotly', 'Gráficos estáticos e interactivos'],
              ['openpyxl / xlsxwriter', 'Leer y escribir Excel'],
              ['sqlalchemy + psycopg', 'Conexión a PostgreSQL']
            ]},
            { type: 'cmd', label: 'Instalar y verificar', lines: [
              '$ uv add pandas polars duckdb pyarrow numpy scipy scikit-learn matplotlib seaborn plotly openpyxl "psycopg[binary]" sqlalchemy',
              '',
              '$ uv run python -c "import pandas, polars, duckdb, sklearn; print(pandas.__version__, polars.__version__, duckdb.__version__, sklearn.__version__)"'
            ]}
          ]
        },
        { id: 'jup-gpu', n: '3', t: 'PyTorch con GPU',
          blocks: [
            { type: 'cmd', label: 'Instalar y comprobar CUDA', lines: [
              '# Requisito: driver NVIDIA instalado (nvidia-smi funciona)',
              '$ uv add torch torchvision',
              '#   En Linux, el wheel por defecto de PyTorch ya incluye CUDA.',
              '#   Para una versión concreta de CUDA usa el selector de pytorch.org.',
              '',
              '$ uv run python -c "import torch; print(torch.__version__, torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else \'CPU\')"',
              '| 2.x.x True NVIDIA GeForce ...'
            ]},
            { type: 'callout', variant: 'tip', title: 'Solo CPU (equipos sin NVIDIA)',
              html: '<p>El wheel con CUDA ocupa varios GB. Si no tienes GPU NVIDIA, instala la versión CPU, mucho más ligera: <code>pip install torch --index-url https://download.pytorch.org/whl/cpu</code>.</p>' }
          ]
        },
        { id: 'jup-vscode', n: '4', t: 'VS Code',
          blocks: [
            { type: 'cmd', label: 'VS Code con notebooks', lines: [
              '$ sudo snap install code --classic',
              '$ code --install-extension ms-python.python',
              '$ code --install-extension ms-toolsai.jupyter',
              '',
              '# Abre la carpeta del proyecto: VS Code detecta .venv automáticamente',
              '$ code ~/proyectos/analisis',
              '# Ctrl+Shift+P → "Python: Select Interpreter" → .venv'
            ]}
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     5. PROBLEMAS DE INSTALACIÓN
     ====================================================================== */
  C.registrar({
    id: 'datos-problemas',
    group: 'datos',
    title: 'Errores al instalar paquetes de datos',
    level: 'intermedio',
    tags: ['externally-managed-environment', 'Python.h', 'pg_config', 'ModuleNotFoundError', 'numpy 2', 'ssl', 'conda lento', 'error pip'],
    lead: 'Los mensajes de error de <code>pip</code> y <code>conda</code> son largos, pero casi siempre caen en uno de estos casos. Busca la <b>última línea</b> del error y ábrela abajo.',
    blocks: [
      { type: 'accordion', items: [
        { t: 'error: externally-managed-environment', open: true,
          html: '<p>Intentaste instalar en el Python del sistema (PEP 668). <b>No uses</b> <code>--break-system-packages</code>: crea un entorno.</p>',
          cmd: { label: 'Solución', lines: [
            '$ python3 -m venv .venv && source .venv/bin/activate && pip install paquete',
            '# o una herramienta global:  pipx install paquete   /   uv tool install paquete'
          ]}
        },
        { t: 'fatal error: Python.h: No such file or directory',
          html: '<p>Faltan las cabeceras para compilar una extensión en C.</p>',
          cmd: { label: 'Solución', lines: [
            '$ sudo apt install -y build-essential python3-dev',
            '# Para otra versión de deadsnakes: python3.11-dev'
          ]}
        },
        { t: 'error: command \'gcc\' failed / Failed building wheel for …',
          html: '<p>No hay wheel precompilado para tu versión de Python y la compilación falla. Primero comprueba si estás en una versión de Python demasiado nueva para ese paquete (pasa al salir cada versión).</p>',
          cmd: { label: 'Diagnóstico', lines: [
            '$ python --version',
            '$ pip install --upgrade pip setuptools wheel',
            '$ pip install paquete -v 2>&1 | grep -iE "error|not found" | head',
            '# Si es por versión: crea el entorno con una algo más antigua',
            '$ uv venv --python 3.12'
          ]}
        },
        { t: 'pg_config executable not found (psycopg2)',
          cmd: { label: 'Solución', lines: [
            '# Opción 1: el wheel binario, sin compilar',
            '$ pip install "psycopg[binary]"          # o psycopg2-binary',
            '# Opción 2: cabeceras de PostgreSQL',
            '$ sudo apt install -y libpq-dev'
          ]}
        },
        { t: 'ModuleNotFoundError en Jupyter, pero instalado en la terminal',
          html: '<p>El notebook usa otro kernel. Compruébalo dentro del notebook:</p>',
          cmd: { label: 'Comprobar e instalar en el kernel correcto', lines: [
            '# En una celda del notebook:',
            '#   import sys; print(sys.executable)',
            '#   %pip install paquete        ← instala en EL kernel actual',
            '',
            '# O registra tu entorno como kernel y selecciónalo',
            '$ python -m ipykernel install --user --name mi-entorno'
          ]}
        },
        { t: 'A module that was compiled using NumPy 1.x cannot be run in NumPy 2.x',
          html: '<p>Un paquete compilado contra NumPy 1 convive con NumPy 2. Actualiza ese paquete o fija NumPy por debajo de 2 mientras tanto.</p>',
          cmd: { label: 'Solución', lines: [
            '$ pip install --upgrade paquete-que-falla',
            '# temporal:',
            '$ pip install "numpy<2"'
          ]}
        },
        { t: 'SSL: CERTIFICATE_VERIFY_FAILED',
          html: '<p>Proxy corporativo o certificados del sistema desactualizados.</p>',
          cmd: { label: 'Solución', lines: [
            '$ sudo apt install --reinstall ca-certificates && sudo update-ca-certificates',
            '# Red corporativa: usa el certificado de la empresa',
            '$ pip config set global.cert /ruta/ca-empresa.pem',
            '$ export SSL_CERT_FILE=/ruta/ca-empresa.pem',
            '$ conda config --set ssl_verify /ruta/ca-empresa.pem'
          ]}
        },
        { t: 'conda: «Solving environment» tarda muchísimo o falla',
          cmd: { label: 'Solución', lines: [
            '# Usa mamba (o asegúrate de tener el solver libmamba)',
            '$ conda install -n base conda-libmamba-solver',
            '$ conda config --set solver libmamba',
            '',
            '# Un solo canal con prioridad estricta evita conflictos',
            '$ conda config --add channels conda-forge',
            '$ conda config --set channel_priority strict',
            '',
            '# No instales todo en base: crea un entorno nuevo',
            '$ mamba create -n limpio python=3.12 paquete'
          ]}
        },
        { t: 'conda: command not found (tras instalar)',
          cmd: { label: 'Solución', lines: [
            '$ ~/miniforge3/bin/conda init bash      # o ~/anaconda3/bin/conda',
            '$ source ~/.bashrc'
          ]}
        },
        { t: 'torch.cuda.is_available() devuelve False',
          cmd: { label: 'Diagnóstico', lines: [
            '$ nvidia-smi                            # ¿funciona el driver?',
            '$ python -c "import torch; print(torch.version.cuda)"',
            '# None → instalaste la versión CPU: reinstala torch con CUDA',
            '# CUDA del wheel > "CUDA Version" de nvidia-smi → actualiza el driver'
          ]}
        },
        { t: 'Killed / MemoryError al instalar o al cargar datos',
          html: '<p>Falta RAM (al compilar o al leer un CSV enorme). Añade swap y lee por partes.</p>',
          cmd: { label: 'Solución', lines: [
            '$ free -h',
            '$ sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile',
            '$ sudo mkswap /swapfile && sudo swapon /swapfile',
            '',
            '# Leer un CSV grande sin cargarlo entero: polars en modo perezoso',
            '#   pl.scan_csv("grande.csv").group_by("region").agg(pl.col("total").sum()).collect()'
          ]}
        },
        { t: 'No space left on device durante pip o conda',
          cmd: { label: 'Liberar cachés', lines: [
            '$ pip cache purge',
            '$ uv cache clean',
            '$ conda clean --all -y',
            '$ du -sh ~/.cache/pip ~/.cache/uv ~/miniforge3/pkgs 2>/dev/null'
          ]}
        }
      ]}
    ]
  });

})(window.Contenido);
