(() => {
  const DEFAULT_SECTION = 'intro-linux';
  const pendingCallbacks = [];
  const registeredTabs = new Set();
  let domReady = document.readyState !== 'loading';

  const onReady = callback => {
    if (domReady) {
      callback();
      return;
    }
    pendingCallbacks.push(callback);
  };

  if (!domReady) {
    document.addEventListener('DOMContentLoaded', () => {
      domReady = true;
      while (pendingCallbacks.length) {
        const cb = pendingCallbacks.shift();
        cb();
      }
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('open');
      }
    }
  }

  function initSearchFilter() {
    const input = document.querySelector('.search-input');
    if (!input) return;

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase();
      const items = document.querySelectorAll('.nav-item');
      const groups = document.querySelectorAll('.nav-group-title');

      items.forEach(item => {
        const text = (item.textContent || '').toLowerCase();
        const tags = item.getAttribute('data-tags') || '';
        const visible = !query || text.includes(query) || tags.includes(query);
        item.style.display = visible ? 'flex' : 'none';
      });

      groups.forEach(group => {
        group.style.display = query ? 'none' : 'block';
      });
    });
  }

  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const parent = header.parentElement;
        if (parent) {
          parent.classList.toggle('open');
        }
      });
    });
  }

  function cleanCommandText(text) {
    return text.replace(/(^\$\s*)/gm, '').trimEnd();
  }

  function copySnippet(identifier) {
    let payload = '';
    const element = document.getElementById(identifier);

    if (element) {
      payload = element.innerText;
    } else {
      payload = identifier;
    }

    const normalized = cleanCommandText(payload);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(normalized).catch(() => {});
    }
  }

  function initCopyButtons() {
    document.querySelectorAll('[data-copy-target]').forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-copy-target');
        if (target) {
          copySnippet(target);
        }
      });
    });
  }

  function initMobileMenu() {
    const toggle = document.querySelector('[data-mobile-menu]');
    const sidebar = document.getElementById('sidebar');

    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const target = document.getElementById(sectionId);

    if (!target) return;

    sections.forEach(section => section.classList.remove('active'));
    target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(item => item.classList.add('active'));

    scrollToTop();
    closeSidebarOnMobile();
  }

  function registerTab(sectionId) {
    if (!sectionId || registeredTabs.has(sectionId)) return;
    registeredTabs.add(sectionId);

    const attach = () => {
      document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(link => {
        link.addEventListener('click', event => {
          event.preventDefault();
          showSection(sectionId);
        });
      });
    };

    onReady(attach);
  }

  function bootNavigation() {
    onReady(() => {
      initSearchFilter();
      initAccordions();
      initCopyButtons();
      initMobileMenu();
      showSection(DEFAULT_SECTION);
    });
  }

  window.LinuxApp = {
    registerTab,
    bootNavigation,
    showSection,
  };
})();
