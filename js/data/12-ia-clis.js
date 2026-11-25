/* 12-ia-clis.js — CLI agénticas: requisitos comunes y una sección por
   herramienta (Claude Code, Codex, Gemini CLI, Antigravity, Kimi Code).
   Comandos revisados con la documentación oficial en noviembre de 2026. */
(function (C) {
  'use strict';

  /* ======================================================================
     0. REQUISITOS COMUNES
     ====================================================================== */
  C.registrar({
    id: 'ia-clis',
    group: 'ia',
    title: 'CLI agénticas: requisitos y comparativa',
    level: 'basico',
    tags: ['claude code', 'codex', 'gemini', 'antigravity', 'kimi', 'npm', 'EACCES', 'api key', 'node', 'PATH'],
    lead: 'Un agente de terminal lee tu proyecto, edita archivos y ejecuta comandos por ti. Todas estas CLI comparten requisitos (PATH, Node.js en algunos casos, claves) y los mismos errores de instalación. Esta página los resuelve una vez; cada CLI tiene después su propia sección.',
    blocks: [
      { type: 'h2', id: 'comparativa', text: 'Las CLI de un vistazo' },
      { type: 'table', head: ['CLI', 'Comando', 'Instalación recomendada', 'Necesita Node'], monoFirst: false, rows: [
        ['<a href="#ia-claude"><b>Claude Code</b></a> (Anthropic)', '<code>claude</code>', '<code>curl -fsSL https://claude.ai/install.sh | bash</code>', 'No (npm opcional: Node 22+)'],
        ['<a href="#ia-codex"><b>Codex</b></a> (OpenAI)', '<code>codex</code>', '<code>curl -fsSL https://chatgpt.com/codex/install.sh | sh</code>', 'No (npm opcional)'],
        ['<a href="#ia-gemini"><b>Gemini CLI</b></a> (Google)', '<code>gemini</code>', '<code>npm install -g @google/gemini-cli</code>', 'Sí, Node 20+'],
        ['<a href="#ia-antigravity"><b>Antigravity</b></a> (Google)', '<code>agy</code>', '<code>curl -fsSL https://antigravity.google/cli/install.sh | bash</code>', 'No'],
        ['<a href="#ia-kimi"><b>Kimi Code</b></a> (Moonshot)', '<code>kimi</code>', '<code>curl -fsSL https://code.kimi.com/kimi-code/install.sh | bash</code>', 'No (npm opcional: Node 22.19+)'],
        ['<a href="#cap-eafit/cap-opencode"><b>OpenCode</b></a> (código abierto, multiproveedor)', '<code>opencode</code>', '<code>curl -fsSL https://opencode.ai/install.sh | sh</code>', 'No']
      ]},
      { type: 'callout', variant: 'warn', title: 'Antes de ejecutar un «curl … | bash»',
        html: '<p>Estos instaladores son oficiales, pero el hábito seguro es descargarlos, leerlos y después ejecutarlos: <code>curl -fsSL URL -o instalar.sh && less instalar.sh && bash instalar.sh</code>. Nunca los ejecutes con <code>sudo</code>: se instalan en tu carpeta personal.</p>' },

      { type: 'h2', id: 'path', text: 'PATH: el error número uno' },
      { type: 'prose', html: '<p>Los instaladores nativos colocan el ejecutable en <code>~/.local/bin</code>. Si esa carpeta no está en tu <code>PATH</code>, la instalación «funciona» pero la terminal responde <code>command not found</code>.</p>' },
      { type: 'cmd', label: 'Diagnóstico y arreglo de PATH (bash)', lines: [
        '# ¿Dónde está instalado y lo encuentra la shell?',
        '$ ls -l ~/.local/bin/',
        '$ command -v claude codex gemini agy kimi opencode',
        '',
        '# ¿Está ~/.local/bin en el PATH?',
        '$ echo $PATH | tr \':\' \'\\n\' | grep -Fx "$HOME/.local/bin"',
        '',
        '# Si no sale nada, añádelo y recarga',
        '$ echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.bashrc',
        '$ source ~/.bashrc',
        '',
        '# La shell recuerda rutas antiguas: vacía su caché',
        '$ hash -r'
      ]},

      { type: 'h2', id: 'requisitos', text: 'Node.js (para Gemini CLI y las instalaciones por npm)' },
      { type: 'cmd', label: 'Instalar Node.js LTS en Ubuntu', lines: [
        '# Comprueba si ya lo tienes y en qué versión',
        '$ node --version',
        '$ npm --version',
        '',
        '# El de los repositorios de Ubuntu suele ser antiguo. Usa NodeSource:',
        '$ curl -fsSL https://deb.nodesource.com/setup_lts.x -o nodesource.sh',
        '$ less nodesource.sh              # ← LÉELO antes de ejecutarlo con sudo',
        '$ sudo -E bash nodesource.sh',
        '$ sudo apt install -y nodejs',
        '',
        '# Alternativa recomendada si trabajas con varias versiones: nvm',
        '$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash',
        '$ source ~/.bashrc',
        '$ nvm install --lts',
        '$ nvm use --lts'
      ]},
      { type: 'callout', variant: 'danger', title: 'EACCES: la solución correcta y la incorrecta',
        html: '<p>Al hacer <code>npm install -g</code> aparece <code>EACCES: permission denied</code>. La respuesta que verás en internet es <code>sudo npm install -g</code>. <b>No lo hagas</b>: ejecuta los scripts de instalación del paquete como root y deja archivos con propiedad de root en tu <code>~/.npm</code>, lo que rompe instalaciones posteriores.</p><p>La solución correcta es decirle a npm que instale en tu carpeta personal:</p>' },
      { type: 'cmd', label: 'Arreglar EACCES de una vez y para siempre', lines: [
        '$ mkdir -p ~/.npm-global',
        '$ npm config set prefix "$HOME/.npm-global"',
        '$ echo \'export PATH="$HOME/.npm-global/bin:$PATH"\' >> ~/.bashrc',
        '$ source ~/.bashrc',
        '',
        '# Verificar que ha quedado bien',
        '$ npm config get prefix',
        '| /home/usuario/.npm-global',
        '',
        '# Ahora ya funciona sin sudo:',
        '$ npm install -g @anthropic-ai/claude-code',
        '',
        '# Si ya usaste sudo antes y algo está roto, recupera la propiedad:',
        '$ sudo chown -R $USER:$USER ~/.npm ~/.config'
      ]},
      { type: 'h2', id: 'claves', text: 'Guardar las claves API sin exponerlas' },
      { type: 'cmd', label: 'El método seguro', lines: [
        '# MAL: en ~/.bashrc queda en texto plano y se filtra en cualquier',
        '# captura de pantalla, copia de seguridad o repositorio de dotfiles.',
        '',
        '# MEJOR: un archivo aparte, con permisos restringidos',
        '$ touch ~/.config/claves-ia.env',
        '$ chmod 600 ~/.config/claves-ia.env',
        '$ nano ~/.config/claves-ia.env',
        '|   export ANTHROPIC_API_KEY="sk-ant-..."',
        '|   export OPENAI_API_KEY="sk-..."',
        '',
        '# Cárgalo solo cuando lo necesites, con una función en ~/.bashrc:',
        '$ echo \'ia() { source ~/.config/claves-ia.env; }\' >> ~/.bashrc',
        '',
        '# Comprobar que una clave está cargada SIN mostrarla entera',
        '$ echo "${ANTHROPIC_API_KEY:0:8}..."',
        '| sk-ant-a...',
        '',
        '# LO MEJOR: un gestor de secretos del sistema',
        '$ sudo apt install pass gnupg',
        '$ gpg --full-generate-key',
        '$ pass init "tu-correo@ejemplo.com"',
        '$ pass insert ia/anthropic',
        '$ export ANTHROPIC_API_KEY="$(pass ia/anthropic)"'
      ]},
      { type: 'callout', variant: 'warn', title: 'Antes de subir tus dotfiles a GitHub',
        html: '<p>Comprueba que no llevas claves dentro. Esta línea las busca en tu carpeta personal:</p><p><code>grep -rIl -E \'sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}\' ~ --exclude-dir=.cache 2>/dev/null</code></p><p>Si alguna clave ha llegado a un repositorio público, <b>revócala</b> en el panel del proveedor: borrarla del historial de git no basta, porque ya ha podido ser indexada.</p>' },

      { type: 'h2', id: 'errores-comunes', text: 'Errores comunes a todas' },
      { type: 'accordion', items: [
        { t: 'command not found justo después de instalar',
          html: '<p>Abre una terminal nueva o ejecuta <code>source ~/.bashrc</code>. Si sigue, es el PATH (ver arriba). Para npm: <code>npm config get prefix</code> + <code>/bin</code> debe estar en el PATH.</p>' },
        { t: 'EACCES: permission denied al usar npm -g',
          html: '<p>Nunca <code>sudo npm install -g</code>. Configura el prefijo de npm en tu carpeta (ver «Arreglar EACCES» arriba) o usa el instalador nativo.</p>' },
        { t: 'curl: (23) / (56) Failure writing output',
          html: '<p>Red cortada o <b>curl instalado como snap</b> (no puede escribir en todas las rutas). Comprueba con <code>which curl</code>: si sale <code>/snap/bin/curl</code>, haz <code>sudo snap remove curl && sudo apt install curl</code>.</p>' },
        { t: 'syntax error near unexpected token \'<\'',
          html: '<p>El instalador ha devuelto una página HTML (proxy, portal cautivo o región bloqueada) en vez del script. Abre la URL en el navegador para ver qué devuelve.</p>' },
        { t: 'unable to get local issuer certificate / SSL en red corporativa',
          cmd: { label: 'Certificado corporativo para Node y curl', lines: [
            '$ export NODE_EXTRA_CA_CERTS=/ruta/ca-empresa.crt',
            '$ export NODE_USE_SYSTEM_CA=1',
            '$ export CURL_CA_BUNDLE=/ruta/ca-empresa.crt',
            '$ export HTTPS_PROXY=http://proxy.empresa:8080'
          ]}
        },
        { t: 'Killed durante la instalación (servidor con poca RAM)',
          cmd: { label: 'Añadir 2 GB de swap', lines: [
            '$ sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile',
            '$ sudo mkswap /swapfile && sudo swapon /swapfile'
          ]}
        },
        { t: 'El inicio de sesión no abre el navegador (SSH, servidor, WSL)',
          html: '<p>Cada CLI tiene un modo sin navegador: <code>claude setup-token</code>, <code>codex login --device-auth</code>, <code>kimi login</code> o una clave API en variable de entorno. Detalles en la pestaña «Autenticar» de cada una.</p>' }
      ]},

      { type: 'h2', id: 'uso-seguro', text: 'Trabajar con agentes de forma segura' },
      { type: 'grid', cols: 2, items: [
        { t: 'Siempre dentro de git', html: 'Haz <code>git commit</code> antes de pedir cambios grandes. <code>git diff</code> te enseña qué tocó y <code>git restore .</code> lo deshace.' },
        { t: 'Empieza en modo de solo lectura o plan', html: 'Pide primero un plan, revísalo y después concede permisos de escritura.' },
        { t: 'El modo «sin preguntar» solo en aislamiento', html: 'Los modos tipo <i>yolo</i> o <i>bypass</i> se usan en un contenedor o una VM desechable, nunca sobre tu carpeta personal.' },
        { t: 'Un archivo de instrucciones por proyecto', html: '<code>CLAUDE.md</code>, <code>AGENTS.md</code> o <code>GEMINI.md</code>: comandos de prueba, estilo y reglas. Ver <a href="#ag-harness">Ingeniería de arneses</a>.' }
      ]}
    ]
  });

  /* ======================================================================
     1. CLAUDE CODE
     ====================================================================== */
  C.registrar({
    id: 'ia-claude',
    group: 'ia',
    title: 'Claude Code',
    level: 'intermedio',
    tags: ['claude', 'anthropic', 'claude code', 'claude doctor', 'claude -p', 'permission-mode', 'mcp', 'CLAUDE.md'],
    lead: 'Agente de programación de Anthropic. El instalador nativo trae su propio runtime (no necesita Node), se instala en <code>~/.local/bin/claude</code> y se actualiza solo en segundo plano. Requiere un plan Pro, Max, Team, Enterprise o una cuenta de Console.',
    blocks: [
      { type: 'tabs', id: 'claude-tabs', items: [
        { id: 'claude-instalar', n: '1', t: 'Instalar', badge: 'nativo', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Instalador nativo (recomendado)', lines: [
              '$ curl -fsSL https://claude.ai/install.sh | bash',
              '',
              '# Canal estable (algo más conservador) o una versión concreta',
              '$ curl -fsSL https://claude.ai/install.sh | bash -s stable',
              '',
              '$ claude --version',
              '$ claude doctor              # diagnóstico de la instalación'
            ]},
            { type: 'cmd', label: 'Alternativa: repositorio APT oficial (Debian/Ubuntu)', lines: [
              '$ sudo apt install -y curl gnupg',
              '$ sudo install -d -m 0755 /etc/apt/keyrings',
              '$ sudo curl -fsSL https://downloads.claude.ai/keys/claude-code.asc -o /etc/apt/keyrings/claude-code.asc',
              '',
              '# Verifica la huella: 31DDDE24DDFAB679F42D7BD2BAA929FF1A7ECACE',
              '$ gpg --show-keys /etc/apt/keyrings/claude-code.asc',
              '',
              '$ echo "deb [signed-by=/etc/apt/keyrings/claude-code.asc] https://downloads.claude.ai/claude-code/apt/stable stable main" \\',
              '    | sudo tee /etc/apt/sources.list.d/claude-code.list',
              '$ sudo apt update && sudo apt install claude-code'
            ]},
            { type: 'cmd', label: 'Alternativa: npm (requiere Node.js 22 o superior)', lines: [
              '$ node --version',
              '$ npm install -g @anthropic-ai/claude-code@latest     # SIN sudo'
            ]},
            { type: 'callout', variant: 'info', title: 'Requisitos',
              html: '<p>Ubuntu 20.04+ o Debian 10+, x64 o ARM64, 4 GB de RAM y unos 512 MB libres. Git es opcional pero muy recomendable.</p>' }
          ]
        },
        { id: 'claude-auth', n: '2', t: 'Autenticar',
          blocks: [
            { type: 'cmd', label: 'Inicio de sesión', lines: [
              '# Interactivo: abre el navegador. Si no se abre, pulsa "c" para copiar la URL',
              '$ claude',
              '',
              '# O directamente por comando',
              '$ claude auth login',
              '$ claude auth status --text',
              '$ claude auth logout'
            ]},
            { type: 'cmd', label: 'Servidores y CI, sin navegador', lines: [
              '# En un equipo CON navegador: genera un token de larga duración',
              '$ claude setup-token',
              '',
              '# En el servidor: guárdalo en una variable de entorno',
              '$ export CLAUDE_CODE_OAUTH_TOKEN="token-generado"',
              '',
              '# Alternativa con clave de la API (Console, pago por uso)',
              '$ export ANTHROPIC_API_KEY="sk-ant-..."'
            ]}
          ]
        },
        { id: 'claude-agente', n: '3', t: 'Uso agéntico',
          blocks: [
            { type: 'cmd', label: 'Sesión interactiva en un proyecto', lines: [
              '$ cd ~/proyectos/mi-app',
              '$ claude                         # dentro: /init crea CLAUDE.md con el contexto',
              '$ claude -c                      # continúa la última conversación',
              '$ claude --resume                # elige una conversación anterior',
              '',
              '# Modo plan: analiza y propone sin tocar nada',
              '$ claude --permission-mode plan'
            ]},
            { type: 'cmd', label: 'Modo no interactivo (-p) para scripts y automatización', lines: [
              '# Una tarea, con las herramientas permitidas explícitamente',
              '$ claude -p "Encuentra y corrige el fallo de auth.py" --allowedTools "Read,Edit,Bash"',
              '',
              '# Con tuberías: entrada por stdin, salida a archivo',
              '$ cat error-build.txt | claude -p "Explica la causa raíz de este error" > causa.txt',
              '',
              '# Salida JSON para procesar con jq',
              '$ claude -p "Resume este proyecto" --output-format json | jq -r .result',
              '',
              '# Ejecutar las pruebas y arreglar fallos, aceptando ediciones',
              '$ claude -p "Ejecuta los tests y corrige los que fallen" --permission-mode acceptEdits'
            ]},
            { type: 'table', head: ['--permission-mode', 'Comportamiento'], rows: [
              ['default', 'Pregunta antes de cada acción que lo requiera'],
              ['plan', 'Solo lee y planifica; no edita hasta que apruebes el plan'],
              ['acceptEdits', 'Acepta ediciones y comandos de archivos dentro del proyecto'],
              ['auto', 'Un clasificador revisa cada acción y aprueba las seguras'],
              ['dontAsk', 'Deniega todo lo que requeriría preguntar (para CI)'],
              ['bypassPermissions', 'No pregunta nada. <b>Solo en contenedores o VMs aisladas</b>']
            ]},
            { type: 'cmd', label: 'Servidores MCP (herramientas externas)', lines: [
              '$ claude mcp add github -- npx -y @modelcontextprotocol/server-github',
              '$ claude mcp list',
              '$ claude mcp remove github'
            ]}
          ]
        },
        { id: 'claude-mantener', n: '4', t: 'Actualizar / desinstalar',
          blocks: [
            { type: 'cmd', label: 'Actualizar', lines: [
              '$ claude update                                   # nativo',
              '$ sudo apt update && sudo apt upgrade claude-code # apt',
              '$ npm install -g @anthropic-ai/claude-code@latest  # npm (no uses npm update -g)'
            ]},
            { type: 'cmd', label: 'Desinstalar', lines: [
              '# Nativo',
              '$ rm -f ~/.local/bin/claude',
              '$ rm -rf ~/.local/share/claude',
              '',
              '# apt',
              '$ sudo apt remove claude-code',
              '$ sudo rm /etc/apt/sources.list.d/claude-code.list /etc/apt/keyrings/claude-code.asc',
              '',
              '# npm',
              '$ npm uninstall -g @anthropic-ai/claude-code',
              '',
              '# Configuración e historial (BORRA ajustes, MCP y sesiones)',
              '$ rm -rf ~/.claude ~/.claude.json'
            ]},
            { type: 'callout', variant: 'info', title: 'Dónde guarda su configuración',
              html: '<p><code>~/.claude/settings.json</code> (usuario), <code>.claude/settings.json</code> (proyecto), <code>~/.claude.json</code> (estado global) y <code>~/.claude/.credentials.json</code> (credenciales, permisos 600).</p>' }
          ]
        },
        { id: 'claude-problemas', n: '5', t: 'Problemas', badge: 'errores', badgeVariant: 'danger',
          blocks: [
            { type: 'cmd', label: 'Primero, siempre', lines: [
              '$ claude doctor'
            ]},
            { type: 'table', head: ['Mensaje', 'Solución'], monoFirst: false, rows: [
              ['<code>claude: command not found</code> o <code>~/.local/bin is not in your PATH</code>', 'Añade <code>~/.local/bin</code> al PATH (ver <a href="#ia-clis/path">PATH</a>)'],
              ['<code>bash: ~/.bashrc: Permission denied</code>', '<code>sudo chown $(whoami) ~/.bashrc</code> (o <code>chmod u+w ~/.bashrc</code> si ya es tuyo)'],
              ['<code>Killed</code> durante la instalación', 'Poca RAM: añade swap y reintenta'],
              ['<code>Error loading shared library</code>', 'Binario incompatible con tu libc: <code>ldd "$(command -v claude)" | grep "not found"</code>'],
              ['<code>Illegal instruction</code>', 'CPU sin AVX: <code>grep -m1 -ow avx /proc/cpuinfo</code>'],
              ['<code>Failed to fetch version from downloads.claude.ai</code>', 'Red o proxy: prueba <code>curl -sI https://downloads.claude.ai/claude-code-releases/latest</code>; define <code>HTTPS_PROXY</code>'],
              ['<code>NO_PUBKEY BAA929FF1A7ECACE</code> (apt)', 'La clave no se descargó: repite el paso del <code>curl</code> de la clave'],
              ['<code>npm error code ENOTEMPTY</code>', '<code>rm -rf "$(npm root -g)/@anthropic-ai/claude-code"</code> y reinstala'],
              ['<code>EBADENGINE</code> (npm)', 'Node demasiado antiguo: necesita 22+. Mejor usa el instalador nativo'],
              ['<code>Auto-update failed · Run claude doctor</code>', 'Ejecuta <code>claude update</code> desde la terminal'],
              ['Dos instalaciones a la vez (npm y nativa)', '<code>which -a claude</code>; desinstala la de npm y deja la nativa']
            ]}
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     2. CODEX
     ====================================================================== */
  C.registrar({
    id: 'ia-codex',
    group: 'ia',
    title: 'Codex CLI (OpenAI)',
    level: 'intermedio',
    tags: ['codex', 'openai', 'chatgpt', 'codex exec', 'sandbox', 'device-auth', 'AGENTS.md', 'config.toml'],
    lead: 'Agente de programación de OpenAI escrito en Rust. Se usa con tu cuenta de ChatGPT (Plus, Pro, Business, Edu, Enterprise) o con una clave API. Lee las instrucciones del proyecto desde <code>AGENTS.md</code>.',
    blocks: [
      { type: 'tabs', id: 'codex-tabs', items: [
        { id: 'codex-instalar', n: '1', t: 'Instalar', badge: 'nativo', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Instalador oficial', lines: [
              '$ curl -fsSL https://chatgpt.com/codex/install.sh | sh',
              '$ codex --version',
              '',
              '# Si releases.openai.com está bloqueado en tu red, usa GitHub Releases',
              '$ curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_INSTALLER_USE_RELEASES_OPENAI_COM=false sh'
            ]},
            { type: 'cmd', label: 'Alternativas', lines: [
              '# npm (sin sudo)',
              '$ npm install -g @openai/codex',
              '',
              '# Binario manual desde GitHub Releases (x86_64)',
              '$ tar -xzf codex-x86_64-unknown-linux-musl.tar.gz',
              '$ mv codex-x86_64-unknown-linux-musl ~/.local/bin/codex && chmod +x ~/.local/bin/codex'
            ]},
            { type: 'callout', variant: 'info', title: 'Requisitos',
              html: '<p>Ubuntu 20.04+ o Debian 10+ (en Windows, mediante WSL2), 4 GB de RAM (8 GB recomendado) y Git 2.23+ opcional.</p>' }
          ]
        },
        { id: 'codex-auth', n: '2', t: 'Autenticar',
          blocks: [
            { type: 'cmd', label: 'Iniciar sesión', lines: [
              '# Con tu cuenta de ChatGPT: abre el navegador',
              '$ codex login',
              '$ codex login status',
              '',
              '# Sin navegador (SSH, servidores): código de dispositivo',
              '$ codex login --device-auth',
              '',
              '# Con clave API, leída desde la entrada estándar (no queda en el historial)',
              '$ printenv OPENAI_API_KEY | codex login --with-api-key',
              '',
              '$ codex logout'
            ]},
            { type: 'callout', variant: 'tip', title: 'Login por SSH sin --device-auth',
              html: '<p>El inicio de sesión redirige a <code>http://localhost:1455</code>. Si trabajas en un servidor remoto, crea un túnel desde tu equipo: <code>ssh -L 1455:localhost:1455 usuario@servidor</code>, ejecuta <code>codex login</code> en el servidor y abre la URL en tu navegador local.</p>' }
          ]
        },
        { id: 'codex-agente', n: '3', t: 'Uso agéntico',
          blocks: [
            { type: 'cmd', label: 'Interactivo', lines: [
              '$ cd ~/proyectos/mi-app',
              '$ codex                               # dentro: /init genera AGENTS.md',
              '$ codex "explica la arquitectura de este repositorio"',
              '$ codex resume --last                 # retoma la última sesión'
            ]},
            { type: 'cmd', label: 'No interactivo: codex exec', lines: [
              '# Solo lectura: analiza sin modificar el repositorio',
              '$ codex exec --sandbox read-only "lista los riesgos de seguridad de este código"',
              '',
              '# Puede editar dentro del proyecto, sin pedir aprobación',
              '$ codex exec --full-auto "añade pruebas para utils/fechas.py y haz que pasen"',
              '',
              '# Salida en JSONL para scripts',
              '$ codex exec --json "resume los cambios del último commit" > informe.jsonl'
            ]},
            { type: 'table', head: ['Opción', 'Valores y efecto'], rows: [
              ['--sandbox', '<code>read-only</code> · <code>workspace-write</code> (edita solo el proyecto) · <code>danger-full-access</code>'],
              ['--ask-for-approval / -a', '<code>untrusted</code> · <code>on-request</code> · <code>never</code>'],
              ['--full-auto', 'Atajo de <code>workspace-write</code> con aprobación bajo demanda'],
              ['-m', 'Modelo a usar'],
              ['-C', 'Directorio de trabajo']
            ]},
            { type: 'cmd', label: 'Configuración persistente: ~/.codex/config.toml', lines: [
              '| model = "gpt-5-codex"',
              '| approval_policy = "on-request"',
              '| sandbox_mode = "workspace-write"',
              '|',
              '| [mcp_servers.github]',
              '| command = "npx"',
              '| args = ["-y", "@modelcontextprotocol/server-github"]'
            ]},
            { type: 'callout', variant: 'info', title: 'Comprueba las opciones de tu versión',
              html: '<p>Codex evoluciona muy rápido. Antes de automatizar, consulta <code>codex --help</code> y <code>codex exec --help</code>: la lista de opciones de tu versión instalada es la que manda.</p>' }
          ]
        },
        { id: 'codex-mantener', n: '4', t: 'Actualizar / desinstalar',
          blocks: [
            { type: 'cmd', label: 'Mantenimiento', lines: [
              '# Actualizar: repite el instalador o, si usaste npm:',
              '$ npm install -g @openai/codex@latest',
              '',
              '# Desinstalar',
              '$ npm uninstall -g @openai/codex        # si fue con npm',
              '$ rm -f "$(command -v codex)"           # si fue con el instalador',
              '$ rm -rf ~/.codex                        # configuración, sesiones y credenciales'
            ]}
          ]
        },
        { id: 'codex-problemas', n: '5', t: 'Problemas', badge: 'errores', badgeVariant: 'danger',
          blocks: [
            { type: 'table', head: ['Síntoma', 'Solución'], monoFirst: false, rows: [
              ['<code>codex: command not found</code>', 'PATH (ver <a href="#ia-clis/path">PATH</a>) o <code>npm config get prefix</code> fuera del PATH'],
              ['El login se queda esperando en un servidor', '<code>codex login --device-auth</code> o túnel <code>ssh -L 1455:localhost:1455</code>'],
              ['Errores de sandbox (Landlock/seccomp) en contenedores o WSL antiguos', 'El kernel no ofrece el aislamiento. Dentro de un contenedor ya aislado: <code>--sandbox danger-full-access</code>'],
              ['Descarga del instalador bloqueada', '<code>CODEX_INSTALLER_USE_RELEASES_OPENAI_COM=false</code> o binario de GitHub Releases'],
              ['Quiero ver qué está pasando', '<code>codex -c log_dir=./.codex-log</code> y <code>tail -F ./.codex-log/codex-tui.log</code>'],
              ['Ignora mis instrucciones', 'Revisa que <code>AGENTS.md</code> esté en la raíz del repositorio y sea concreto']
            ]}
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     3. GEMINI CLI
     ====================================================================== */
  C.registrar({
    id: 'ia-gemini',
    group: 'ia',
    title: 'Gemini CLI (Google)',
    level: 'intermedio',
    tags: ['gemini', 'google', 'gemini cli', 'gemini -p', 'approval-mode', 'yolo', 'GEMINI.md', 'vertex'],
    lead: 'Agente de código abierto de Google para la terminal, distribuido por npm. Requiere <b>Node.js 20 o superior</b>. Lee el contexto del proyecto desde <code>GEMINI.md</code>.',
    blocks: [
      { type: 'callout', variant: 'warn', title: 'Cambio importante en 2026',
        html: '<p>Según la documentación oficial, para usuarios del nivel gratuito y de Google One <b>Gemini CLI fue sustituido por Antigravity CLI el 18 de junio de 2026</b>, y los modelos más nuevos se recomiendan desde Antigravity. Gemini CLI sigue funcionando con clave API de Gemini, Vertex AI y cuentas de empresa. Si usas una cuenta personal gratuita, mira <a href="#ia-antigravity">Antigravity</a>.</p>' },
      { type: 'tabs', id: 'gemini-tabs', items: [
        { id: 'gemini-instalar', n: '1', t: 'Instalar',
          blocks: [
            { type: 'cmd', label: 'npm (requiere Node 20+)', lines: [
              '$ node --version                  # v20 o superior',
              '$ npm install -g @google/gemini-cli',
              '$ gemini --version',
              '',
              '# Canales: estable, preview o nightly',
              '$ npm install -g @google/gemini-cli@preview',
              '',
              '# Probar sin instalar',
              '$ npx @google/gemini-cli'
            ]},
            { type: 'cmd', label: 'Si tu Node es antiguo: dentro de un entorno conda', lines: [
              '$ conda create -y -n gemini_env -c conda-forge nodejs',
              '$ conda activate gemini_env',
              '$ npm install -g @google/gemini-cli'
            ]}
          ]
        },
        { id: 'gemini-auth', n: '2', t: 'Autenticar',
          blocks: [
            { type: 'cmd', label: 'Tres formas de autenticarse', lines: [
              '# 1. Cuenta de Google (interactivo): ejecuta gemini → "Sign in with Google"',
              '$ gemini',
              '',
              '# 2. Clave de Gemini API (de Google AI Studio)',
              '$ export GEMINI_API_KEY="tu-clave"',
              '',
              '# 3. Vertex AI (empresa / Google Cloud)',
              '$ export GOOGLE_CLOUD_PROJECT="id-del-proyecto"',
              '$ export GOOGLE_CLOUD_LOCATION="us-central1"',
              '$ gcloud auth application-default login'
            ]},
            { type: 'callout', variant: 'tip', title: 'Variables persistentes solo para Gemini',
              html: '<p>Puedes guardarlas en <code>~/.gemini/.env</code> en lugar de <code>~/.bashrc</code> (protégelo con <code>chmod 600</code>). Se usa el primer <code>.env</code> que encuentra; no se combinan.</p>' }
          ]
        },
        { id: 'gemini-agente', n: '3', t: 'Uso agéntico',
          blocks: [
            { type: 'cmd', label: 'Interactivo y sin interfaz (-p)', lines: [
              '$ cd ~/proyectos/mi-app && gemini        # dentro: /init, /mcp, /memory, /stats',
              '',
              '# Una tarea sin interfaz',
              '$ gemini -p "resume README.md"',
              '',
              '# Con salida JSON para scripts',
              '$ gemini -p "lista las funciones sin pruebas" --output-format json | jq -r .response',
              '',
              '# Aprobar solo ediciones de archivos automáticamente',
              '$ gemini --approval-mode=auto_edit',
              '',
              '# Aprobar TODO, pero dentro de un sandbox (Docker/Podman)',
              '$ gemini --sandbox --approval-mode=yolo -p "actualiza las dependencias y ejecuta los tests"'
            ]},
            { type: 'table', head: ['--approval-mode', 'Comportamiento'], rows: [
              ['default', 'Pregunta antes de cada herramienta'],
              ['auto_edit', 'Aprueba las ediciones, pregunta lo demás'],
              ['plan', 'Solo lectura'],
              ['yolo', 'Aprueba todo. Solo por línea de comandos y, mejor, con <code>--sandbox</code>']
            ]},
            { type: 'cmd', label: 'Configuración: ~/.gemini/settings.json', lines: [
              '# Usuario: ~/.gemini/settings.json  ·  Proyecto: .gemini/settings.json (tiene prioridad)',
              '$ cat ~/.gemini/settings.json',
              '| { "general": { "defaultApprovalMode": "auto_edit" } }'
            ]}
          ]
        },
        { id: 'gemini-mantener', n: '4', t: 'Actualizar / desinstalar',
          blocks: [
            { type: 'cmd', label: 'Mantenimiento', lines: [
              '$ npm install -g @google/gemini-cli@latest',
              '$ npm uninstall -g @google/gemini-cli',
              '$ rm -rf ~/.gemini               # ajustes, credenciales y memoria'
            ]}
          ]
        },
        { id: 'gemini-problemas', n: '5', t: 'Problemas', badge: 'errores', badgeVariant: 'danger',
          blocks: [
            { type: 'table', head: ['Mensaje', 'Solución'], monoFirst: false, rows: [
              ['<code>You must be a named user on your organization\'s Gemini Code Assist…</code>', 'Tienes definida <code>GOOGLE_CLOUD_PROJECT</code> sin licencia: <code>unset GOOGLE_CLOUD_PROJECT GOOGLE_CLOUD_PROJECT_ID</code> (y quítala de <code>.bashrc</code> y <code>.env</code>)'],
              ['<code>Request contains an invalid argument</code>', 'Define <code>GOOGLE_CLOUD_PROJECT</code> con tu proyecto o usa una clave de AI Studio'],
              ['<code>Your current account is not eligible…</code>', 'Región no soportada para esa cuenta'],
              ['<code>UNABLE_TO_GET_ISSUER_CERT_LOCALLY</code>', '<code>export NODE_USE_SYSTEM_CA=1</code> o <code>NODE_EXTRA_CA_CERTS=/ruta/ca.crt</code>'],
              ['<code>EADDRINUSE</code> al arrancar un MCP', 'Otro proceso usa el puerto: ciérralo o cambia el puerto'],
              ['No pide confirmaciones en scripts', 'Una variable <code>CI_*</code> lo pone en modo no interactivo: <code>env -u CI_TOKEN gemini</code>'],
              ['<code>npm WARN deprecated …</code>', 'Avisos inofensivos de dependencias'],
              ['Código de salida 41 / 42 / 44 / 52 / 53', 'Autenticación / entrada / sandbox / configuración / límite de turnos'],
              ['Necesito más detalle', '<code>gemini --debug</code> (en interactivo, <kbd>F12</kbd> abre la consola)']
            ]}
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     4. ANTIGRAVITY
     ====================================================================== */
  C.registrar({
    id: 'ia-antigravity',
    group: 'ia',
    title: 'Google Antigravity: CLI, app e IDE',
    level: 'intermedio',
    tags: ['antigravity', 'agy', 'google', 'antigravity cli', 'ide', 'tar.gz', 'chrome-sandbox'],
    lead: 'Antigravity es la plataforma agéntica de Google: una <b>CLI para la terminal</b> (<code>agy</code>), una app de escritorio y un IDE. Desde junio de 2026 sustituye a Gemini CLI para las cuentas personales gratuitas. En Linux la CLI se instala con un script; la app y el IDE se distribuyen como <code>.tar.gz</code>.',
    blocks: [
      { type: 'tabs', id: 'agy-tabs', items: [
        { id: 'agy-cli', n: '1', t: 'CLI de terminal', badge: 'agéntica', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Instalar la CLI oficial', lines: [
              '$ sudo apt install -y curl',
              '$ curl -fsSL https://antigravity.google/cli/install.sh -o agy-install.sh',
              '$ less agy-install.sh              # revisa qué instala y dónde',
              '$ bash agy-install.sh',
              '',
              '# Abre una terminal nueva y arranca',
              '$ agy',
              '$ agy --help'
            ]},
            { type: 'callout', variant: 'info', title: 'El nombre del comando',
              html: '<p>La CLI se ejecuta como <code>agy</code>. Si tras instalar no aparece, mira la ruta que imprime el instalador al terminar y comprueba que esté en tu <code>PATH</code> (ver <a href="#ia-clis/path">PATH</a>).</p>' },
            { type: 'cmd', label: 'Primer uso agéntico', lines: [
              '$ cd ~/proyectos/mi-app',
              '$ agy                     # inicia sesión con tu cuenta de Google la primera vez',
              '# Pide tareas en lenguaje natural. Al principio, en un repositorio con git',
              '# para poder revisar los cambios con git diff.'
            ]}
          ]
        },
        { id: 'agy-app', n: '2', t: 'App de escritorio',
          lead: 'Requisitos: glibc ≥ 2.28 (Ubuntu 20.04 o posterior). Descarga el <code>.tar.gz</code> desde <code>antigravity.google/download</code>.',
          blocks: [
            { type: 'cmd', label: 'Instalar el tar.gz en tu carpeta personal', lines: [
              '$ mkdir -p ~/.local/opt',
              '$ tar -xzf ~/Descargas/Antigravity.tar.gz -C ~/.local/opt',
              '$ ls ~/.local/opt/                 # anota el nombre de la carpeta creada',
              '',
              '# Acceso directo en el menú de aplicaciones (ajusta la ruta del ejecutable)',
              '$ cat > ~/.local/share/applications/antigravity.desktop <<EOF',
              '[Desktop Entry]',
              'Name=Antigravity',
              'Exec=$HOME/.local/opt/Antigravity/antigravity %U',
              'Type=Application',
              'Categories=Development;',
              'EOF',
              '$ update-desktop-database ~/.local/share/applications'
            ]}
          ]
        },
        { id: 'agy-ide', n: '3', t: 'IDE',
          blocks: [
            { type: 'cmd', label: 'IDE independiente (tar.gz)', lines: [
              '$ tar -xzf ~/Descargas/"Antigravity IDE.tar.gz" -C ~/.local/opt',
              '$ ls ~/.local/opt/'
            ]},
            { type: 'cmd', label: 'IDE legado 1.x por repositorio APT', lines: [
              '# Repositorio de la primera versión (se quedó en la 1.x)',
              '$ sudo mkdir -p /etc/apt/keyrings',
              '$ curl -fsSL https://us-central1-apt.pkg.dev/doc/repo-signing-key.gpg \\',
              '    | sudo gpg --dearmor -o /etc/apt/keyrings/antigravity-repo-key.gpg',
              '$ echo "deb [signed-by=/etc/apt/keyrings/antigravity-repo-key.gpg] https://us-central1-apt.pkg.dev/projects/antigravity-auto-updater-dev/ antigravity-debian main" \\',
              '    | sudo tee /etc/apt/sources.list.d/antigravity.list',
              '$ sudo apt update && sudo apt install antigravity'
            ]},
            { type: 'callout', variant: 'warn', title: 'Versión antigua',
              html: '<p>Ese repositorio sirve el IDE 1.x, no la versión 2. Para lo más reciente usa los <code>.tar.gz</code> de la web oficial. Los «instaladores» de la comunidad (snap <code>antigravity-cli</code>, scripts de GitHub) <b>no son de Google</b>: revísalos antes de usarlos.</p>' }
          ]
        },
        { id: 'agy-problemas', n: '4', t: 'Problemas', badge: 'errores', badgeVariant: 'danger',
          blocks: [
            { type: 'accordion', items: [
              { t: 'agy: command not found', html: '<p>Abre una terminal nueva. Si persiste, añade al PATH la carpeta que indicó el instalador (normalmente <code>~/.local/bin</code>) y ejecuta <code>hash -r</code>.</p>' },
              { t: 'apt update falla por el repositorio de Antigravity',
                html: '<p>Si el repositorio legado da errores de firma o de <code>Release</code>, desactívalo: no es necesario para la CLI ni para los tar.gz.</p>',
                cmd: { label: 'Quitar el repositorio', lines: [
                  '$ sudo rm /etc/apt/sources.list.d/antigravity.list',
                  '$ sudo rm /etc/apt/keyrings/antigravity-repo-key.gpg',
                  '$ sudo apt update'
                ]}
              },
              { t: 'The SUID sandbox helper binary was found, but is not configured correctly',
                html: '<p>Las apps Electron distribuidas en tar.gz necesitan que <code>chrome-sandbox</code> pertenezca a root con el bit SUID.</p>',
                cmd: { label: 'Arreglar chrome-sandbox', lines: [
                  '$ cd ~/.local/opt/Antigravity',
                  '$ sudo chown root:root chrome-sandbox',
                  '$ sudo chmod 4755 chrome-sandbox'
                ]}
              },
              { t: 'La app no abre en Ubuntu 24.04 (restricción de AppArmor)',
                html: '<p>Ubuntu 24.04 limita los espacios de nombres sin privilegios que usan las apps Electron. La solución correcta es un perfil de AppArmor para el ejecutable:</p>',
                cmd: { label: 'Perfil de AppArmor', lines: [
                  '$ sudo tee /etc/apparmor.d/antigravity <<EOF',
                  'abi <abi/4.0>,',
                  'include <tunables/global>',
                  'profile antigravity /home/*/.local/opt/Antigravity/antigravity flags=(unconfined) {',
                  '  userns,',
                  '}',
                  'EOF',
                  '$ sudo apparmor_parser -r /etc/apparmor.d/antigravity'
                ]}
              },
              { t: 'error while loading shared libraries',
                cmd: { label: 'Dependencias habituales de apps Electron', lines: [
                  '$ sudo apt install -y libnss3 libgbm1 libasound2t64 libgtk-3-0 libxss1',
                  '# En Ubuntu 22.04 el paquete se llama libasound2'
                ]}
              },
              { t: 'Ninguna vía oficial por apt o flatpak',
                html: '<p>Es así a fecha de noviembre de 2026: para la versión 2 solo hay script (CLI) y tar.gz (app e IDE). Actualiza descargando el tar.gz nuevo y sustituyendo la carpeta en <code>~/.local/opt</code>.</p>' }
            ]}
          ]
        }
      ]}
    ]
  });

  /* ======================================================================
     5. KIMI CODE
     ====================================================================== */
  C.registrar({
    id: 'ia-kimi',
    group: 'ia',
    title: 'Kimi Code CLI (Moonshot)',
    level: 'intermedio',
    tags: ['kimi', 'kimi code', 'moonshot', 'kimi-cli', 'kimi -p', 'yolo', 'acp'],
    lead: 'Agente de terminal de Moonshot AI. <b>Ojo</b>: el antiguo <code>kimi-cli</code> de Python (instalado con <code>uv tool install kimi-cli</code>) está archivado desde septiembre de 2026 y dejará de funcionar. Su sustituto es <b>Kimi Code CLI</b>, que conserva el comando <code>kimi</code>.',
    blocks: [
      { type: 'tabs', id: 'kimi-tabs', items: [
        { id: 'kimi-instalar', n: '1', t: 'Instalar', badge: 'nuevo', badgeVariant: 'ok',
          blocks: [
            { type: 'cmd', label: 'Instalador oficial (no necesita Node)', lines: [
              '$ curl -fsSL https://code.kimi.com/kimi-code/install.sh | bash',
              '# Abre una terminal nueva',
              '$ kimi --version'
            ]},
            { type: 'cmd', label: 'Alternativa: npm (Node.js 22.19 o superior)', lines: [
              '$ npm install -g @moonshot-ai/kimi-code'
            ]},
            { type: 'cmd', label: 'Si tenías el kimi-cli antiguo: migrar y retirarlo', lines: [
              '# Al primer arranque, Kimi Code detecta ~/.kimi y ofrece migrarlo',
              '$ kimi migrate',
              '',
              '# Después, desinstala la versión legada',
              '$ uv tool uninstall kimi-cli',
              '',
              '# Comprueba que "kimi" apunta al nuevo',
              '$ which -a kimi'
            ]}
          ]
        },
        { id: 'kimi-auth', n: '2', t: 'Autenticar',
          blocks: [
            { type: 'cmd', label: 'Inicio de sesión', lines: [
              '# Dentro de la interfaz: elige "Kimi Code (OAuth)" o "Kimi Platform API key"',
              '$ kimi',
              '#   /login   ·   /logout',
              '',
              '# Sin interfaz (servidores): código de dispositivo',
              '$ kimi login',
              '#   Imprime una URL y un código: ábrela en cualquier navegador'
            ]}
          ]
        },
        { id: 'kimi-agente', n: '3', t: 'Uso agéntico',
          blocks: [
            { type: 'cmd', label: 'Interactivo y no interactivo', lines: [
              '$ cd ~/proyectos/mi-app && kimi',
              '',
              '# Modo plan: analiza antes de actuar',
              '$ kimi --plan',
              '',
              '# Aprobación automática de las herramientas habituales',
              '$ kimi --yolo',
              '',
              '# Una tarea sin interfaz (-p / --prompt)',
              '$ kimi -p "revisa la estructura de directorios de este proyecto"',
              '$ kimi -p "lista los TODO del código" --output-format stream-json',
              '',
              '# Continuar la sesión anterior',
              '$ kimi -c -p "ahora crea las pruebas que faltan"'
            ]},
            { type: 'table', head: ['Opción', 'Efecto'], rows: [
              ['--plan', 'Empieza en modo plan'],
              ['--yolo / -y', 'Omite la aprobación de las llamadas a herramientas habituales'],
              ['--auto', 'Nunca pregunta (no combinable con --yolo)'],
              ['-p / --prompt', 'Ejecuta una tarea y termina (no combinable con --yolo, --auto ni --plan)'],
              ['-m', 'Elige modelo'],
              ['kimi acp', 'Servidor ACP para integrarlo en editores (Zed, JetBrains)']
            ]},
            { type: 'cmd', label: 'Configuración', lines: [
              '# ~/.kimi-code/config.toml   (se crea en el primer arranque)',
              '# ~/.kimi-code/mcp.json      (servidores MCP del usuario)',
              '# .kimi-code/mcp.json        (servidores MCP del proyecto)',
              '$ kimi doctor                # valida config.toml y tui.toml'
            ]}
          ]
        },
        { id: 'kimi-mantener', n: '4', t: 'Actualizar / desinstalar',
          blocks: [
            { type: 'cmd', label: 'Mantenimiento', lines: [
              '$ kimi upgrade                          # alias: kimi update',
              '$ npm install -g @moonshot-ai/kimi-code@latest',
              '',
              '# Desinstalar',
              '$ npm uninstall -g @moonshot-ai/kimi-code   # si fue con npm',
              '$ rm -f "$(command -v kimi)"                # si fue con el instalador',
              '$ rm -rf ~/.kimi-code                        # configuración y sesiones'
            ]}
          ]
        },
        { id: 'kimi-problemas', n: '5', t: 'Problemas', badge: 'errores', badgeVariant: 'danger',
          blocks: [
            { type: 'table', head: ['Síntoma', 'Solución'], monoFirst: false, rows: [
              ['<code>kimi</code> abre la versión antigua', '<code>which -a kimi</code>: quita la legada con <code>uv tool uninstall kimi-cli</code> y ejecuta <code>hash -r</code>'],
              ['<code>kimi: command not found</code>', 'Terminal nueva o PATH (ver <a href="#ia-clis/path">PATH</a>)'],
              ['Error de configuración al arrancar', '<code>kimi doctor</code> indica qué línea de <code>config.toml</code> falla'],
              ['Código de salida 1 en <code>kimi -p</code>', 'Argumentos inválidos o sesión sin autenticar: ejecuta <code>kimi login</code>'],
              ['Código de salida 4', 'Otra instancia de kimi está usando esa sesión'],
              ['<code>EBADENGINE</code> con npm', 'Node anterior a 22.19: usa el instalador por script']
            ]}
          ]
        }
      ]}
    ]
  });

})(window.Contenido);
