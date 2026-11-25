(function() {
  // Register tab with both PascalCase and lowercase versions
  if (window.LinuxApp && window.LinuxApp.registerTab) {
    window.LinuxApp.registerTab('Configuracion_Teclado');
    window.LinuxApp.registerTab('configuracion_teclado');
  }

  const CMDS = {
    linux: {
      'es-es': {
        label: 'Comando para Linux (Terminal / X11):',
        code: 'setxkbmap es',
        desc: '💡 <strong>Inmediato (X11).</strong> Para hacerlo permanente con systemd: <code>sudo localectl set-x11-keymap es</code>'
      },
      'es-latam': {
        label: 'Comando para Linux (Terminal / X11):',
        code: 'setxkbmap latam',
        desc: '💡 <strong>Inmediato (X11).</strong> Para hacerlo permanente con systemd: <code>sudo localectl set-x11-keymap latam</code>'
      },
      'en-us': {
        label: 'Comando para Linux (Terminal / X11):',
        code: 'setxkbmap us',
        desc: '💡 <strong>Inmediato (X11).</strong> Para hacerlo permanente con systemd: <code>sudo localectl set-x11-keymap us</code>'
      },
      'en-intl': {
        label: 'Comando para Linux (Terminal / X11):',
        code: 'setxkbmap -layout us -variant altgr-intl',
        desc: '💡 <strong>Inglés Internacional AltGr:</strong> Escribe <code>ñ</code> con <kbd>AltGr + n</kbd> y acentos con <kbd>AltGr + vocal</kbd>. Permanente: <code>sudo localectl set-x11-keymap us pc105 altgr-intl</code>'
      }
    },
    windows: {
      'es-es': {
        label: 'Comando para Windows (PowerShell):',
        code: 'Set-WinUserLanguageList -LanguageList es-ES -Force',
        desc: '💡 <strong>PowerShell:</strong> Cambia la distribución activa a Español (España). Atajo nativo de Windows: <kbd>Win + Espacio</kbd>'
      },
      'es-latam': {
        label: 'Comando para Windows (PowerShell):',
        code: 'Set-WinUserLanguageList -LanguageList es-419 -Force',
        desc: '💡 <strong>PowerShell:</strong> Cambia la distribución activa a Español (Latinoamérica). Atajo nativo: <kbd>Win + Espacio</kbd>'
      },
      'en-us': {
        label: 'Comando para Windows (PowerShell):',
        code: 'Set-WinUserLanguageList -LanguageList en-US -Force',
        desc: '💡 <strong>PowerShell:</strong> Cambia la distribución activa a Inglés (EE.UU.). Atajo nativo: <kbd>Win + Espacio</kbd>'
      },
      'en-intl': {
        label: 'Comando para Windows (PowerShell):',
        code: 'Set-WinDefaultInputMethodOverride -InputTip "0409:00020409"',
        desc: '💡 <strong>PowerShell:</strong> Establece el teclado Inglés Internacional (United States-International) como método de entrada principal.'
      }
    },
    mac: {
      'es-es': {
        label: 'Comando para macOS (Terminal / CLI iss):',
        code: 'iss set com.apple.keylayout.Spanish-ISO',
        desc: '💡 <strong>Requiere iss:</strong> Instala con <code>brew install input-source-switcher</code>. Atajo nativo de Mac: <kbd>Control + Espacio</kbd>'
      },
      'es-latam': {
        label: 'Comando para macOS (Terminal / CLI iss):',
        code: 'iss set com.apple.keylayout.LatinAmerican',
        desc: '💡 <strong>Requiere iss:</strong> Instala con <code>brew install input-source-switcher</code>. Atajo nativo de Mac: <kbd>Control + Espacio</kbd>'
      },
      'en-us': {
        label: 'Comando para macOS (Terminal / CLI iss):',
        code: 'iss set com.apple.keylayout.US',
        desc: '💡 <strong>Requiere iss:</strong> Instala con <code>brew install input-source-switcher</code>. Atajo nativo de Mac: <kbd>Control + Espacio</kbd>'
      },
      'en-intl': {
        label: 'Comando para macOS (Terminal / CLI iss):',
        code: 'iss set com.apple.keylayout.USInternational-PC',
        desc: '💡 <strong>Requiere iss:</strong> Cambia a distribución US International en macOS. Atajo nativo: <kbd>Control + Espacio</kbd>'
      }
    }
  };

  let selectedOS = 'linux';
  let selectedTarget = 'es-es';

  function updateGenerator() {
    const data = CMDS[selectedOS] && CMDS[selectedOS][selectedTarget];
    if (!data) return;

    const labelEl = document.getElementById('kb-gen-label');
    const codeEl = document.getElementById('kb-gen-code');
    const descEl = document.getElementById('kb-gen-desc');
    const btnEl = document.getElementById('kb-gen-copy-btn');

    if (labelEl) labelEl.textContent = data.label;
    if (codeEl) codeEl.textContent = data.code;
    if (descEl) descEl.innerHTML = data.desc;
    if (btnEl) btnEl.setAttribute('data-copy-val', data.code);
  }

  function initInteractiveGenerator() {
    const osBtns = document.querySelectorAll('#kb-gen-os .kb-pill-btn');
    const targetBtns = document.querySelectorAll('#kb-gen-target .kb-pill-btn');

    osBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        osBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedOS = btn.getAttribute('data-os') || 'linux';
        updateGenerator();
      });
    });

    targetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        targetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTarget = btn.getAttribute('data-target') || 'es-es';
        updateGenerator();
      });
    });

    const copyBtn = document.getElementById('kb-gen-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const val = copyBtn.getAttribute('data-copy-val');
        if (val) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(val).then(() => {
              const orig = copyBtn.textContent;
              copyBtn.textContent = '✓ ¡Copiado!';
              copyBtn.classList.add('copied');
              setTimeout(() => {
                copyBtn.textContent = orig;
                copyBtn.classList.remove('copied');
              }, 1500);
            });
          }
        }
      });
    }

    updateGenerator();
  }

  if (document.readyState !== 'loading') {
    initInteractiveGenerator();
  } else {
    document.addEventListener('DOMContentLoaded', initInteractiveGenerator);
  }
})();
