/* ==========================================================================
   00-catalogo.js — registro global de grupos y secciones
   Cada módulo de datos se registra llamando a Contenido.registrar(seccion).
   El orden de registro determina el orden del menú y la navegación
   anterior/siguiente.
   ========================================================================== */
(function (global) {
  'use strict';

  var Contenido = {
    grupos: {
      intro: {
        title: 'Fundamentos',
        color: 'var(--primary)',
        desc: 'Qué es Linux, cómo está organizado y qué distribución elegir.'
      },
      archivos: {
        title: 'Sistema de archivos',
        color: 'var(--accent-fs)',
        desc: 'La jerarquía FHS, moverse por ella, manipular archivos y buscarlos.'
      },
      terminal: {
        title: 'Terminal y shell',
        color: 'var(--accent-shell)',
        desc: 'Bash, redirecciones, tuberías, expansiones y procesamiento de texto.'
      },
      automatizacion: {
        title: 'Automatización',
        color: 'var(--accent-shell)',
        desc: 'Scripts listos: comprimir y mover a otro disco, verificar y borrar el origen, limpiar temporales y programarlos.'
      },
      admin: {
        title: 'Administración',
        color: 'var(--accent-sys)',
        desc: 'Permisos, usuarios, procesos, servicios systemd y registros del sistema.'
      },
      red: {
        title: 'Redes',
        color: 'var(--accent-net)',
        desc: 'Diagnóstico, transferencia de archivos, SSH y puertos abiertos.'
      },
      sistema: {
        title: 'Paquetes y hardware',
        color: 'var(--accent-warn)',
        desc: 'APT, snap, flatpak, limpieza del sistema e inventario de hardware.'
      },
      instalar: {
        title: 'Instalar software',
        color: 'var(--accent-warn)',
        desc: 'Instalar y desinstalar Python (cualquier versión), Manim, LaTeX, R y RStudio, Chrome, ofimática y conda.'
      },
      datos: {
        title: 'Datos y Python',
        color: 'var(--accent-data)',
        desc: 'Paquetes clave para procesar datos: compiladores, bibliotecas, Python, uv, conda, Jupyter y GPU.'
      },
      rescate: {
        title: 'Rescate y emergencias',
        color: 'var(--accent-danger)',
        desc: 'Plan de emergencia: GRUB, arranque, paquetes rotos, instantáneas y rescate de datos.'
      },
      ia: {
        title: 'IA y agentes',
        color: 'var(--accent-ia)',
        desc: 'CLI agénticas (Claude Code, Codex, Gemini, Antigravity, Kimi), modelos locales y agentes.'
      },
      capacitacion: {
        title: 'Capacitación EAFIT 2026',
        color: 'var(--accent-shell)',
        desc: 'Casos de capacitación de junio de 2026 (16, 17 y 18): guías de OpenCode y Jupyter con sus materiales.'
      },
      referencia: {
        title: 'Referencia',
        color: 'var(--accent-fs)',
        desc: 'Tablas de consulta rápida: código ASCII y distribución de teclado.'
      },
      meta: {
        title: 'Sobre esta guía',
        color: 'var(--text-muted)',
        desc: 'Atajos de teclado y cómo aprovechar la aplicación.'
      }
    },

    secciones: [],

    registrar: function (seccion) {
      if (!seccion || !seccion.id) throw new Error('Sección sin id');
      this.secciones.push(seccion);
      return seccion;
    }
  };

  global.Contenido = Contenido;
})(window);
