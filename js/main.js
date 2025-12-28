(function () {
  const tabScripts = [
    'js/tabs/intro-linux.js',
    'js/tabs/intro-distros.js',
    'js/tabs/fs-hierarchy.js',
    'js/tabs/fs-nav.js',
    'js/tabs/fs-manip.js',
    'js/tabs/fs-advanced.js',
    'js/tabs/term-shell.js',
    'js/tabs/term-pipes.js',
    'js/tabs/term-scripting.js',
    'js/tabs/admin-perms.js',
    'js/tabs/admin-sys.js',
    'js/tabs/admin-net.js',
    'js/tabs/rescue-grub.js',
    'js/tabs/rescue-disk.js',
    'js/tabs/custom-icons.js',
    'js/tabs/sys-debug.js',
    'js/tabs/devtools.js',
    'js/tabs/manim.js',
    'js/tabs/uv-python.js',
    'js/tabs/complementos-instalacion.js',
    'js/tabs/configuracion-ia-cli.js',
    'js/tabs/datascience.js',
    'js/tabs/anaconda.js',
    'js/tabs/essentials.js',
    'js/tabs/text-files.js',
    'js/tabs/sys-mgmt.js',
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = false;
      script.onload = () => resolve(src);
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(script);
    });
  }

  Promise.all(tabScripts.map(loadScript))
    .catch(error => {
      console.error(error);
    })
    .finally(() => {
      if (window.LinuxApp && window.LinuxApp.bootNavigation) {
        window.LinuxApp.bootNavigation();
      }
    });
})();
