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
      rescate: {
        title: 'Rescate y emergencias',
        color: 'var(--accent-danger)',
        desc: 'GRUB, modo de recuperación, discos y recuperación de datos.'
      },
      ia: {
        title: 'IA y agentes',
        color: 'var(--accent-ia)',
        desc: 'CLIs de IA, modelos locales con Ollama y construcción de agentes.'
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
