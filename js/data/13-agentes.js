/* 13-agentes.js — ingeniería de arneses y construcción de agentes locales */
(function (C) {
  'use strict';

  C.registrar({
    id: 'ag-harness',
    group: 'ia',
    title: 'Ingeniería de arneses: el entorno del agente',
    level: 'intermedio',
    tags: ['harness', 'agents.md', 'contexto', 'subagentes', 'verificacion'],
    lead: 'Un «arnés» (<i>harness</i>) es todo lo que construyes <b>alrededor</b> de un agente de IA para controlarlo. La observación de fondo: los modelos cambian cada pocas semanas, pero un buen arnés sobrevive al cambio de modelo y de herramienta.',
    blocks: [
      { type: 'callout', variant: 'info', title: 'Dos usos distintos de la palabra «harness»',
        html: '<p>Cuidado con la colisión de nombres: <b>DeepSeek Harness</b> (<code>dsh</code>) es una <em>herramienta</em> concreta. La <b>ingeniería de arneses</b> de esta sección es una <em>práctica</em> que aplica a cualquier agente: Claude Code, Codex, Gemini CLI o <code>dsh</code>.</p>' },
      { type: 'h2', id: 'cuatro-patas', text: 'Las cuatro patas de un arnés' },
      { type: 'grid', cols: 2, items: [
        { t: 'Contexto', html: 'Qué información llega a ver el modelo. Ni más ni menos: el exceso perjudica tanto como la falta.' },
        { t: 'Herramientas', html: 'Qué puede <em>hacer</em>: MCPs, scripts, comandos permitidos. Cada herramienta ocupa contexto en todas las peticiones.' },
        { t: 'Memoria', html: 'Archivos donde consulta y registra su estado entre sesiones. Sin esto, cada sesión empieza de cero.' },
        { t: 'Verificación', html: 'Comprobar que lo hecho está bien <em>antes</em> de continuar. La pata que más se olvida y más problemas evita.' }
      ]},
      { type: 'h2', id: 'capas', text: 'Las tres capas' },
      { type: 'ascii', text:
'┌──────────────────────────────────────────────────────────┐\n' +
'│ CAPA 3 — EL ARNÉS   ← esto es lo que TÚ controlas        │\n' +
'│  AGENTS.md · subagentes · skills · docs · hooks          │\n' +
'│  verificación · artefactos · registro de progreso        │\n' +
'└──────────────────────────────────────────────────────────┘\n' +
'                         ▲  intercambiable\n' +
'┌──────────────────────────────────────────────────────────┐\n' +
'│ CAPA 2 — EL AGENTE                                       │\n' +
'│  Claude Code · Codex · Gemini CLI · dsh                  │\n' +
'└──────────────────────────────────────────────────────────┘\n' +
'                         ▲  intercambiable\n' +
'┌──────────────────────────────────────────────────────────┐\n' +
'│ CAPA 1 — EL MODELO                                       │\n' +
'│  en la nube, o local con Ollama                          │\n' +
'└──────────────────────────────────────────────────────────┘' },
      { type: 'prose', html: '<p>Las capas 1 y 2 se renuevan constantemente. La capa 3 es tu inversión: por eso las reglas se escriben en <code>AGENTS.md</code> y no en la configuración de una herramienta concreta.</p>' },

      { type: 'h2', id: 'menos-es-mas', text: 'Menos es más: el dato que contradice la intuición' },
      { type: 'callout', variant: 'warn', title: 'El caso Vercel (agente v0)',
        html: '<p>Partieron de un agente con <b>16 herramientas especializadas</b> y le quitaron el <b>80%</b>. El resultado: <b>3,5 veces más rápido, 37% menos tokens consumidos y 100% de tasa de éxito</b>. Ganó en todas las comparaciones.</p><p>La conclusión práctica: darle al modelo más herramientas, más skills y más contexto <b>empeora</b> el resultado. Hay que darle lo justo, perfectamente ordenado.</p>' },
      { type: 'grid', cols: 3, items: [
        { value: '3,5×', label: 'más rápido', note: 'tras quitar el 80% de las herramientas' },
        { value: '−37%', label: 'tokens', note: 'menos consumo por tarea' },
        { value: '40-50%', label: 'de contexto', note: 'donde el rendimiento ya empieza a caer' }
      ]},
      { type: 'prose', html: '<p>Sobre la <b>ventana de contexto</b>: el rendimiento no cae solo al llegar al 80-90% de ocupación. Hay estudios que lo sitúan ya en el <b>40-50%</b>. La consecuencia operativa es concreta: cierra la fase, guarda el estado en un archivo y abre una sesión nueva. Sale más barato y más fiable que una conversación kilométrica.</p>' },

      { type: 'h2', id: 'estructura', text: 'Estructura de archivos' },
      { type: 'cmd', label: 'Crear el esqueleto', lines: [
        '$ cd ~/mi-proyecto',
        '$ mkdir -p .claude/{agents,hooks} docs herramientas progreso artefactos',
        '$ touch AGENTS.md CLAUDE.md feature-list.json',
        '',
        '$ tree -L 2 -a',
        '| .',
        '| ├── AGENTS.md          ← hoja de instrucciones: el PRIMER archivo que se lee',
        '| ├── CLAUDE.md          ← solo redirige a AGENTS.md',
        '| ├── feature-list.json  ← trabajo pendiente con criterios de aceptación',
        '| ├── .claude/agents/    ← subagentes: planificador, implementador, revisor',
        '| ├── .claude/hooks/     ← scripts de seguridad y de bloqueo',
        '| ├── docs/              ← arquitectura, convenciones, verificación',
        '| ├── herramientas/      ← servidores MCP',
        '| ├── progreso/          ← estado por fase y subagente',
        '| └── artefactos/        ← entregables + MANIFEST.json'
      ]},
      { type: 'cmd', label: 'AGENTS.md: las secciones imprescindibles', lines: [
        '# Es un estándar abierto: lo leen Claude Code, Codex, Gemini CLI y dsh.',
        '',
        '## Protocolo         # qué scripts ejecutar y en qué orden, al arrancar',
        '## Reglas duras      # lo que NO debe hacer nunca',
        '## Modo conversacional  # cómo responder a peticiones fuera de la lista',
        '## Equipo            # qué subagentes hay y cuándo delegar en cada uno',
        '## Pipeline          # las fases del flujo de trabajo, en orden',
        '## Verificación      # qué comprobar antes de cerrar cualquier fase',
        '## Mapa del repo     # dónde está cada cosa (evita que busque a ciegas)',
        '',
        '# CLAUDE.md solo apunta al anterior, para no duplicar reglas:',
        '$ cat > CLAUDE.md << \'EOF\'',
        '| Este proyecto usa AGENTS.md como punto de entrada.',
        '| Lee AGENTS.md y sigue su protocolo antes de hacer cualquier cosa.',
        '| EOF'
      ]},

      { type: 'h2', id: 'subagentes-ciclo', text: 'Subagentes: dividir y revisar' },
      { type: 'ascii', text:
'LÍDER  (lee AGENTS.md, el estado y la lista de tareas)\n' +
'  │\n' +
'  ├──► PLANIFICADOR ──► fases con criterio de aceptación sí/no\n' +
'  │\n' +
'  └──► por cada fase:\n' +
'         ┌────────────────────────────────────────────┐\n' +
'         │  IMPLEMENTADOR  (ejecuta UNA fase)         │\n' +
'         │        │                                    │\n' +
'         │        ▼                                    │\n' +
'         │  REVISOR  (REEJECUTA el criterio)           │\n' +
'         │        │                                    │\n' +
'         │   ┌────┴─────┐                              │\n' +
'         │ RECHAZADO  APROBADO                         │\n' +
'         │   │             │                           │\n' +
'         │   └──► vuelve   └──► siguiente fase         │\n' +
'         └────────────────────────────────────────────┘' },
      { type: 'callout', variant: 'tip', title: 'Por qué el revisor debe ser un subagente distinto',
        html: '<p>El implementador tiene sesgo de confirmación: acaba de escribir el código y tiende a darlo por bueno. Lo que atrapa el error es la <b>reejecución independiente</b> del criterio por parte de alguien que no escribió nada — no una segunda lectura del mismo agente.</p><p>Por eso el revisor lleva instrucciones explícitas de <em>poder rechazar</em>, y de no fiarse de la salida que reportó el implementador.</p>' },
      { type: 'cmd', label: 'Un subagente es un .md con frontmatter', lines: [
        '# .claude/agents/revisor.md',
        '',
        '| ---',
        '| name: revisor',
        '| description: Valida el trabajo del implementador contra el criterio de',
        '|   aceptación. Puede RECHAZAR y devolver la fase. Es el único que',
        '|   autoriza pasar a la fase siguiente.',
        '| tools: Read, Grep, Glob, Bash',
        '| model: razonador',
        '| ---',
        '|',
        '| # Su regla central:',
        '| REEJECUTA el criterio de aceptación por tu cuenta.',
        '| No te fíes de la salida que reportó el implementador.',
        '',
        '# Nota: en "model" se pone el ROL, no el nombre del modelo.',
        '# Así el arnés no se rompe al cambiar de modelo.'
      ]},

      { type: 'h2', id: 'verificar-hooks', text: 'Verificación: «parar hasta verde»' },
      { type: 'prose', html: '<p>El fallo más caro de un agente es equivocarse en la fase 1 y seguir adelante: el error se arrastra hasta el final y descubrirlo cuesta más que haberlo parado. Los <b>hooks</b> lo cortan, y no dependen de la buena voluntad del modelo.</p>' },
      { type: 'table', head: ['Nivel', 'Cuándo se ejecuta', 'Qué comprueba'], monoFirst: false, rows: [
        ['<b>Chequeo de salud</b>', 'Al iniciar la sesión', 'Estructura de archivos, JSON válidos, ausencia de secretos, que el modelo responde'],
        ['<b>Verificación</b>', 'Al cerrar cada fase', 'Artefactos registrados, fase con veredicto del revisor, frontmatter válido'],
        ['<b>Guardián de secretos</b>', 'Antes de cada comando', 'Bloquea leer <code>.env</code>, claves SSH y secretos en texto plano'],
        ['<b>Parar hasta verde</b>', 'Tras cada escritura', 'Si la verificación está en rojo, <b>prohíbe avanzar</b>']
      ]},
      { type: 'callout', variant: 'info', title: 'Un hook que sale con código 2 bloquea',
        html: '<p>En Claude Code, un hook que termina con <b>código de salida 2</b> no es un aviso: <b>bloquea la acción</b> y devuelve el motivo al agente, que debe corregir antes de continuar. Esa es la diferencia entre una recomendación en <code>AGENTS.md</code> (que el modelo puede ignorar) y una barrera real.</p>' },
      { type: 'h2', id: 'criterio', text: 'El criterio de aceptación' },
      { type: 'callout', variant: 'tip', title: 'Si no se puede comprobar, la fase está mal definida',
        html: '<p>Cada fase necesita un criterio que sea <b>un comando o comprobación con respuesta sí/no</b>.</p><p><b>Mal:</b> «el informe queda bien».<br><b>Bien:</b> «existe <code>artefactos/informe-X.md</code>, tiene entrada en <code>MANIFEST.json</code> y <code>./scripts/verificar.sh</code> sale en verde».</p><p>Un criterio subjetivo no se puede reejecutar, y sin reejecución el revisor no aporta nada.</p>' },
      { type: 'h2', id: 'instalar-arnes', text: 'Instalar un arnés en un proyecto en marcha' },
      { type: 'steps', items: [
        { t: 'Copiar la carpeta del arnés al proyecto',
          cmd: { label: 'Copiar', lines: ['$ cp -r ~/Descargas/agente-local-ollama/* ~/mi-proyecto/'] } },
        { t: 'Revisar que es seguro ANTES de ejecutar nada',
          html: '<p>Vale para este kit y para cualquier repositorio que descargues. Dos minutos de lectura evitan ejecutar algo que no querías.</p>',
          cmd: { label: 'Inspeccionar', lines: [
            '$ find . -name "*.sh" -o -name "*.py" | xargs -r file',
            '$ grep -rn "curl\\|wget\\|eval\\|base64\\|rm -rf" scripts/ || true',
            '$ less scripts/*.sh'
          ]} },
        { t: 'Pedir al agente que lo adapte, acotando el alcance',
          html: '<p>Una instrucción como «lee esta carpeta e implementa el arnés, <b>solo instalar y dejarlo listo</b>» evita que el agente ejecute el pipeline completo antes de que hayas revisado nada.</p>' },
        { t: 'Comprobar que arranca en verde',
          cmd: { label: 'Verificar', lines: [
            '$ python3 scripts/health_check.py',
            '$ ./scripts/verificar.sh'
          ]} }
      ]}
    ]
  });

  C.registrar({
    id: 'ag-kit',
    group: 'ia',
    title: 'Kit descargable: agente con modelos locales',
    level: 'avanzado',
    tags: ['kit', 'descargar', 'mcp', 'skills', 'artefactos', 'ollama', 'agente'],
    lead: 'Un arnés completo y <b>ejecutable</b> para construir un agente que opera modelos 100% locales servidos por Ollama: 4 subagentes, 3 skills, un servidor MCP funcional sin dependencias, artefactos versionados y hooks de verificación probados.',
    blocks: [
      { type: 'h2', id: 'descargar', text: 'Descargar' },
      { type: 'downloads', items: [
        { href: 'descargas/agente-local-ollama.tar.gz', title: 'agente-local-ollama.tar.gz',
          desc: 'Recomendado en Linux: conserva los permisos de ejecución', size: '28 KB' },
        { href: 'descargas/agente-local-ollama.zip', title: 'agente-local-ollama.zip',
          desc: 'Recomendado en Windows y macOS', size: '46 KB' }
      ]},
      { type: 'cmd', label: 'Descomprimir y arrancar', lines: [
        '$ tar -xzf agente-local-ollama.tar.gz',
        '# o bien:  unzip agente-local-ollama.zip',
        '',
        '$ cd agente-local-ollama',
        '$ chmod +x scripts/*.sh mcp/*.py     # solo si usaste el .zip',
        '$ cat README.md                      # empieza por aquí',
        '',
        '# Preparar el entorno',
        '$ cp .env.example .env',
        '$ ./scripts/ollama-up.sh start',
        '$ ./scripts/ollama-up.sh pull        # descarga los modelos de models.yaml',
        '',
        '# Comprobar que todo está en verde',
        '$ python3 scripts/health_check.py',
        '',
        '# Si aún no tienes modelos instalados, valida el resto del arnés:',
        '$ python3 scripts/health_check.py --sin-ollama'
      ]},
      { type: 'callout', variant: 'warn', title: 'Revisa los scripts antes de ejecutarlos',
        html: '<p>Este consejo aplica a este kit igual que a cualquier repositorio de internet. <code>find . -name \'*.sh\' -o -name \'*.py\' | xargs file</code> y una lectura rápida de <code>scripts/</code> cuestan dos minutos.</p>' },

      { type: 'h2', id: 'que-trae', text: 'Qué contiene' },
      { type: 'table', head: ['Pieza', 'Para qué sirve'], rows: [
        ['<code>AGENTS.md</code>', 'Punto de entrada: protocolo de arranque, reglas duras y mapa del repositorio'],
        ['<code>agents/</code>', '4 subagentes: planificador, implementador, revisor e investigador-local'],
        ['<code>skills/</code>', '3 skills: <code>ollama-ops</code>, <code>benchmark-modelos</code>, <code>generar-artefacto</code>'],
        ['<code>mcp/ollama_mcp_server.py</code>', 'Servidor MCP con 5 herramientas, <b>sin dependencias externas</b>'],
        ['<code>scripts/</code>', 'Chequeo de salud, verificación de coherencia y hooks de bloqueo'],
        ['<code>config/models.yaml</code>', 'Registro de modelos <b>por rol</b>, con alternativas según el hardware'],
        ['<code>config/settings.json</code>', 'Permisos <i>allow</i>/<i>deny</i> y hooks para Claude Code'],
        ['<code>artefactos/</code>', 'Salidas versionadas + <code>MANIFEST.json</code> + plantillas'],
        ['<code>progreso/ESTADO.md</code>', 'Memoria entre sesiones: qué se hizo y qué queda'],
        ['<code>docs/</code>', '7 documentos: arquitectura, convenciones, verificación, skills, artefactos, MCP y adaptación']
      ]},

      { type: 'h2', id: 'roles', text: 'Modelos por rol, no por nombre' },
      { type: 'prose' , html: '<p>La decisión de diseño central: el agente <b>no elige modelo libremente</b>. Se declaran <b>roles</b> y el agente pide un rol. Así, cambiar de modelo no obliga a reescribir ni una instrucción.</p>' },
      { type: 'table', head: ['Rol', 'Para qué', 'Modelo por defecto'], rows: [
        ['<code>razonador</code>', 'Planificar, revisar y decidir. Lento pero cuidadoso', '<code>deepseek-r1:7b</code>'],
        ['<code>codificador</code>', 'Escribir y editar código', '<code>qwen2.5-coder:7b</code>'],
        ['<code>rapido</code>', 'Clasificar, resumir y extraer. Respuestas en segundos', '<code>llama3.2:3b</code>'],
        ['<code>embeddings</code>', 'Búsqueda semántica y RAG local. <b>No sirve para chat</b>', '<code>nomic-embed-text</code>']
      ]},
      { type: 'cmd', label: 'Instalar los modelos de cada rol', lines: [
        '$ ollama pull deepseek-r1:7b        # razonador',
        '$ ollama pull qwen2.5-coder:7b      # codificador',
        '$ ollama pull llama3.2:3b           # rapido',
        '$ ollama pull nomic-embed-text      # embeddings',
        '',
        '# O todos de golpe, leyendo config/models.yaml:',
        '$ ./scripts/ollama-up.sh pull',
        '',
        '# ¿Solo 4 GB de RAM? Usa alternativas.poca_ram_4gb del YAML:',
        '#   qwen2.5-coder:1.5b · llama3.2:3b · qwen2.5:0.5b',
        '',
        '# Elegir con datos y no a ojo: mide en TU máquina',
        '$ ./scripts/bench-modelos.sh llama3.2:3b qwen2.5-coder:7b',
        '| MODELO                     PROMPT   TOTAL_s      TOK    TOK/s',
        '| llama3.2:3b                P1          0.42       12     41.3',
        '| qwen2.5-coder:7b           P1          1.18       11     14.7',
        '',
        '# Guía: <10 tok/s inservible interactivo | 10-30 apto razonador',
        '#       >30 apto rapido'
      ]},

      { type: 'h2', id: 'mcp-kit', text: 'El servidor MCP incluido' },
      { type: 'prose', html: '<p><b>MCP</b> (Model Context Protocol) es el estándar para dar herramientas a un agente. El servidor del kit habla JSON-RPC 2.0 sobre stdin/stdout usando <b>solo la biblioteca estándar de Python 3.8+</b>: no hay que instalar nada.</p>' },
      { type: 'table', head: ['Herramienta', 'Qué hace'], rows: [
        ['<code>ollama_listar_modelos</code>', 'Qué hay instalado <b>de verdad</b>, con tamaño y cuantización'],
        ['<code>ollama_estado</code>', 'Si Ollama responde y qué modelos están cargados en memoria'],
        ['<code>ollama_generar</code>', 'Inferencia de un turno, devolviendo métricas de latencia y tok/s'],
        ['<code>ollama_chat</code>', 'Conversación multi-turno con historial'],
        ['<code>ollama_embeddings</code>', 'Vectores para búsqueda semántica y RAG local']
      ]},
      { type: 'cmd', label: 'Declararlo y probarlo sin necesidad de agente', lines: [
        '# .mcp.json en la raíz del proyecto',
        '| {',
        '|   "mcpServers": {',
        '|     "ollama-local": {',
        '|       "command": "python3",',
        '|       "args": ["mcp/ollama_mcp_server.py"],',
        '|       "env": { "OLLAMA_HOST": "http://localhost:11434" }',
        '|     }',
        '|   }',
        '| }',
        '',
        '# Habla por stdio, así que se prueba a mano. Es la forma más rápida',
        '# de distinguir un fallo del servidor de uno de configuración:',
        '$ printf \'%s\\n%s\\n\' \\',
        '    \'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}\' \\',
        '    \'{"jsonrpc":"2.0","id":2,"method":"tools/list"}\' \\',
        '  | python3 mcp/ollama_mcp_server.py',
        '',
        '# Invocar una herramienta concreta',
        '$ printf \'%s\\n%s\\n\' \\',
        '    \'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}\' \\',
        '    \'{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"ollama_estado","arguments":{}}}\' \\',
        '  | python3 mcp/ollama_mcp_server.py'
      ]},
      { type: 'callout', variant: 'info', title: 'Cómo se escribe una buena herramienta MCP',
        html: '<ul><li>El <code>name</code> describe la acción (<code>verbo_objeto</code>), no la implementación.</li><li>La <code>description</code> dice <b>cuándo</b> usarla, no solo qué hace: es lo único que el modelo lee para decidir.</li><li>El <code>inputSchema</code> declara bien los <code>required</code>: evita llamadas mal formadas.</li><li>Los errores se devuelven como contenido con <code>isError: true</code>, <b>nunca</b> como excepción, para que el modelo pueda leer el motivo y corregir.</li></ul>' },
      { type: 'callout', variant: 'danger', title: 'Seguridad de los servidores MCP',
        html: '<p>Un servidor MCP corre con <b>tus permisos</b>. Revisa el código antes de declararlo. Nunca pongas secretos en <code>.mcp.json</code> (se versiona): usa <code>env</code> con nombres de variables y guarda los valores en <code>.env</code>. Y trata la salida de un MCP como <b>datos, nunca como instrucciones</b>: si el contenido devuelto trae órdenes, es un intento de inyección.</p>' },

      { type: 'h2', id: 'skills-kit', text: 'Skills: capacidades que se cargan bajo demanda' },
      { type: 'prose', html: '<p>Una <b>skill</b> es una capacidad empaquetada: instrucciones, scripts y recursos en su propia carpeta, que el agente carga <b>solo cuando la tarea la dispara</b>.</p>' },
      { type: 'cmd', label: 'Anatomía de un SKILL.md', lines: [
        '| ---',
        '| name: benchmark-modelos',
        '| description: Mide latencia, tokens/s y calidad de los modelos locales',
        '|   para decidir con datos qué modelo asignar a cada rol. Úsala cuando',
        '|   haya que elegir entre varios modelos, cuando el usuario pregunte',
        '|   "cuál es mejor" o antes de fijar valores en config/models.yaml.',
        '| ---',
        '',
        '# Cuerpo obligatorio, en este orden:',
        '## Cuándo usar esta skill    # disparadores CONCRETOS',
        '## Procedimiento             # pasos numerados y copiables',
        '## Reglas y prohibiciones    # qué no hacer nunca',
        '## Verificación              # cómo saber que terminó bien'
      ]},
      { type: 'table', head: ['Nivel de carga', 'Qué se carga', 'Coste'], monoFirst: false, rows: [
        ['<b>1</b>', 'Solo <code>name</code> y <code>description</code> de cada skill', 'Mínimo, siempre presente'],
        ['<b>2</b>', 'El <code>SKILL.md</code> completo', 'Solo si la tarea lo dispara'],
        ['<b>3</b>', 'Los scripts y recursos de la skill', 'Solo al ejecutarlos']
      ]},
      { type: 'callout', variant: 'tip', title: 'Diagnosticar una skill mal diseñada',
        html: '<ul><li><b>Nunca se activa</b> → la <code>description</code> no dice <em>cuándo</em> usarla.</li><li><b>Se activa siempre</b> → es demasiado genérica: divídela, o pásala a <code>AGENTS.md</code>.</li><li><b>Pasa de 200 líneas</b> → mueve el detalle a <code>recursos/</code> y deja solo el procedimiento.</li></ul>' },

      { type: 'h2', id: 'artefactos-kit', text: 'Artefactos: salidas trazables' },
      { type: 'prose', html: '<p>Criterio práctico: si el usuario querrá volver a ese resultado mañana, es un <b>artefacto</b> y va a disco. Si es una respuesta de paso, se queda en la conversación.</p>' },
      { type: 'grid', cols: 2, items: [
        { t: 'Sin manifiesto no existe', html: 'Todo artefacto tiene su entrada en <code>MANIFEST.json</code>. La verificación falla si hay huérfanos en <b>cualquiera de los dos sentidos</b>.' },
        { t: 'Inmutable', html: 'No se edita un artefacto publicado. Si cambia, se crea <code>-v2</code> y el anterior se marca con <code>sustituido_por</code>.' },
        { t: 'Con procedencia', html: 'Qué modelo lo generó, con qué rol, en qué fase y cuándo. Sin procedencia no se puede auditar.' },
        { t: 'Con hash', html: '<code>sha256</code> corto para detectar modificaciones posteriores.' }
      ]},
      { type: 'cmd', label: 'Entrada en artefactos/MANIFEST.json', lines: [
        '| {',
        '|   "id": "A1",',
        '|   "archivo": "informe-ia-educacion-20260910.md",',
        '|   "tipo": "informe",',
        '|   "fase_origen": "F3",',
        '|   "modelo": "deepseek-r1:7b",',
        '|   "rol_modelo": "razonador",',
        '|   "creado": "2026-09-10T12:00:00",',
        '|   "sha256_corto": "a1b2c3d4e5f6a7b8",',
        '|   "entradas": ["datos/articulos/*.pdf"],',
        '|   "verificado_por": "revisor",',
        '|   "sustituido_por": null',
        '| }',
        '',
        '# El campo "entradas" es lo que hace el artefacto REPRODUCIBLE:',
        '# dice de qué se generó. Sin él no puedes rehacerlo ni saber si',
        '# la fuente ha cambiado.',
        '',
        '$ sha256sum artefactos/informe-*.md | cut -c1-16'
      ]},

      { type: 'h2', id: 'verificacion-kit', text: 'Los controles, probados' },
      { type: 'cmd', label: 'Tres niveles de verificación', lines: [
        '# 1. Al iniciar sesión: no arrancar con el entorno roto',
        '$ python3 scripts/health_check.py',
        '#    estructura · JSON válidos · secretos · Ollama y sus modelos',
        '',
        '# 2. Al cerrar cada fase: coherencia del arnés',
        '$ ./scripts/verificar.sh',
        '#    artefacto sin MANIFEST (y al revés) · fase sin veredicto',
        '#    del revisor · frontmatter inválido · JSON roto',
        '',
        '# 3. Hooks automáticos, declarados en config/settings.json',
        '$ ./scripts/guardian-secretos.sh    # PreToolUse',
        '#    bloquea leer .env, id_rsa, *.pem y claves en texto plano',
        '$ ./scripts/parar-hasta-verde.sh    # PostToolUse',
        '#    si verificar.sh está en ROJO, prohíbe avanzar de fase',
        '',
        '# Y permisos deny explícitos en config/settings.json:',
        '#    sudo · rm -rf · git push · ollama rm · curl a APIs externas'
      ]},
      { type: 'accordion', items: [
        { t: 'Comprobaciones que se ejecutaron al construir este kit',
          html: '<p>Los controles no son declarativos: se probaron tanto en positivo (todo correcto) como en negativo (que el bloqueo realmente bloquee).</p>' +
                '<table><thead><tr><th>Prueba</th><th>Resultado</th></tr></thead><tbody>' +
                '<tr><td><code>health_check.py --sin-ollama</code></td><td>VERDE, salida 0</td></tr>' +
                '<tr><td><code>verificar.sh</code></td><td>VERDE: 4 subagentes + 3 skills + 4 JSON validados</td></tr>' +
                '<tr><td>MCP <code>initialize</code> + <code>tools/list</code></td><td>5 herramientas, protocolo <code>2024-11-05</code></td></tr>' +
                '<tr><td>MCP con Ollama caído</td><td>Error legible, no excepción</td></tr>' +
                '<tr><td>MCP sin parámetro obligatorio</td><td><code>isError: true</code> con el motivo</td></tr>' +
                '<tr><td>Intento de leer <code>.env</code></td><td><b>BLOQUEADO</b>, salida 2</td></tr>' +
                '<tr><td>Secreto plantado en el repositorio</td><td><b>BLOQUEADO</b>, salida 2</td></tr>' +
                '<tr><td>Artefacto huérfano sin <code>MANIFEST</code></td><td>ROJO, detectado</td></tr>' +
                '<tr><td>Fase sin informe del revisor</td><td>ROJO, detectado</td></tr>' +
                '<tr><td><code>parar-hasta-verde.sh</code> en rojo</td><td><b>BLOQUEADO</b>, salida 2</td></tr>' +
                '<tr><td>Extracción del zip y ejecución desde cero</td><td>VERDE</td></tr>' +
                '</tbody></table>' }
      ]},

      { type: 'h2', id: 'conectar', text: 'Conectarlo a tu agente' },
      { type: 'cmd', label: 'El mismo arnés, distintos agentes', lines: [
        '# Claude Code',
        '$ mkdir -p .claude',
        '$ cp config/settings.json .claude/settings.json',
        '$ cp -r agents .claude/agents',
        '',
        '# Codex / Gemini CLI → leen AGENTS.md directamente',
        '',
        '# dsh (DeepSeek Harness)',
        '#   preset "standard" + workspace en esta carpeta',
        '#   y declara el MCP ollama-local en Settings → Models',
        '',
        '# Que las reglas vivan en AGENTS.md y no en la configuración de una',
        '# herramienta concreta es lo que permite cambiar de agente (y de',
        '# modelo) sin reescribir nada.'
      ]},
      { type: 'callout', variant: 'tip', title: 'Presupuesto de contexto',
        html: '<p><code>AGENTS.md</code> ≤ 400 líneas · un subagente ≤ 120 · un <code>SKILL.md</code> ≤ 200 · y cierra la sesión antes del <b>40%</b> de la ventana ocupada. Cierra fase, guarda el estado en <code>progreso/ESTADO.md</code> y abre sesión nueva: sale más barato y más fiable que una conversación kilométrica.</p>' }
    ]
  });

})(window.Contenido);
