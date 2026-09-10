/* ==========================================================================
   store.js — estado de la aplicación y persistencia en localStorage
   Todo acceso a localStorage va envuelto en try/catch: en modo privado o con
   las cookies bloqueadas el acceso lanza excepción, y la app debe seguir
   funcionando igual (solo pierde la persistencia).
   ========================================================================== */
(function (global) {
  'use strict';

  var CLAVE = 'todoenlinux:v1';

  var predeterminado = {
    tema: 'auto',        // 'auto' | 'light' | 'dark'
    leidas: {},          // { idSeccion: true }
    favoritas: {},       // { idSeccion: true }
    gruposAbiertos: null,// { idGrupo: bool } — null = todos abiertos
    ultima: null         // última sección visitada
  };

  function leer() {
    try {
      var crudo = global.localStorage.getItem(CLAVE);
      if (!crudo) return Object.assign({}, predeterminado);
      var datos = JSON.parse(crudo);
      return Object.assign({}, predeterminado, datos || {});
    } catch (e) {
      return Object.assign({}, predeterminado);
    }
  }

  var estado = leer();
  var oyentes = [];

  function guardar() {
    try {
      global.localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch (e) { /* sin persistencia: la sesión sigue siendo válida */ }
  }

  function avisar(evento) {
    for (var i = 0; i < oyentes.length; i++) {
      try { oyentes[i](estado, evento); } catch (e) { /* un oyente roto no rompe el resto */ }
    }
  }

  var Store = {
    get: function () { return estado; },

    suscribir: function (fn) {
      oyentes.push(fn);
      return function () { oyentes = oyentes.filter(function (o) { return o !== fn; }); };
    },

    setTema: function (tema) {
      estado.tema = tema; guardar(); avisar('tema');
    },

    alternarLeida: function (id) {
      if (estado.leidas[id]) delete estado.leidas[id];
      else estado.leidas[id] = true;
      guardar(); avisar('leidas');
      return !!estado.leidas[id];
    },

    esLeida: function (id) { return !!estado.leidas[id]; },

    alternarFavorita: function (id) {
      if (estado.favoritas[id]) delete estado.favoritas[id];
      else estado.favoritas[id] = true;
      guardar(); avisar('favoritas');
      return !!estado.favoritas[id];
    },

    esFavorita: function (id) { return !!estado.favoritas[id]; },

    setGrupoAbierto: function (idGrupo, abierto) {
      if (!estado.gruposAbiertos) estado.gruposAbiertos = {};
      estado.gruposAbiertos[idGrupo] = abierto;
      guardar();
    },

    grupoAbierto: function (idGrupo) {
      if (!estado.gruposAbiertos) return true;
      return estado.gruposAbiertos[idGrupo] !== false;
    },

    setUltima: function (id) { estado.ultima = id; guardar(); },

    contarLeidas: function () { return Object.keys(estado.leidas).length; },

    reiniciarProgreso: function () {
      estado.leidas = {}; guardar(); avisar('leidas');
    }
  };

  global.Store = Store;
})(window);
