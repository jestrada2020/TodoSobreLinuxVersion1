# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Spanish-language Linux learning platform** - an interactive educational web application titled "Curso Maestría Linux: Deep Dive". It's a standalone, static web application designed to teach Linux concepts, commands, and system administration to Ubuntu/Linux users.

The application is entirely client-side (HTML/CSS/JavaScript) with no build process or backend required.

## Running the Application

**To run:** Simply open `index.html` in a web browser.

```bash
# Option 1: Direct open
xdg-open index.html

# Option 2: Simple HTTP server (if needed)
python3 -m http.server 8000
# Then navigate to http://localhost:8000
```

**No build, compilation, or package installation is required.** This is a pure static website.

## Architecture

### Core Navigation System

The application uses a **tab-based registration pattern** with centralized navigation:

- **`js/core/navigation.js`** - Central navigation engine that manages:
  - Tab registration system (registerTab)
  - Section switching and visibility
  - Search/filtering functionality
  - Accordion interactions
  - Copy-to-clipboard for code snippets
  - Mobile menu responsiveness

- **`js/main.js`** - Bootstrap loader that:
  - Dynamically loads all tab modules in parallel
  - Calls `LinuxApp.bootNavigation()` after all tabs are loaded

- **Global API** - `window.LinuxApp` exposes:
  - `registerTab(sectionId)` - Register a new section
  - `bootNavigation()` - Initialize navigation system
  - `showSection(sectionId)` - Switch to a specific section

### Content Structure

**HTML-based content:**
- `index.html` - Main application (2700+ lines) containing:
  - Navigation sidebar with hierarchical menu
  - All educational content sections embedded in `<section id="...">` elements
  - Each section contains formatted command examples, explanations, and code boxes

**Tab modules** (`js/tabs/*.js`):
- Each file is minimal (typically 5 lines) and only registers its corresponding section
- Pattern: `window.LinuxApp.registerTab('section-id')`
- Examples: `intro-linux.js`, `fs-nav.js`, `admin-sys.js`, etc.

**Sections are organized by topic:**
1. Introducción (intro-linux, intro-distros)
2. Sistema de Archivos (fs-hierarchy, fs-nav, fs-manip, fs-advanced)
3. Power User (term-shell, term-pipes, term-scripting)
4. Admin Avanzada (admin-perms, admin-sys, admin-net)
5. Emergencia (rescue-grub, rescue-disk)
6. Personalización (custom-icons)
7. Mantenimiento (sys-debug, pkg-uninstall)
8. Software y Tools (devtools, manim, uv-python, complementos-instalacion, configuracion-ia-cli)
9. Ciencia de Datos (datascience, anaconda)
10. Expansión de Comandos (essentials, text-files, sys-mgmt)
11. Hardware (config-hardware)

### Styling

- **`css/styles.css`** - Single stylesheet with:
  - CSS custom properties for theming (dark slate palette)
  - Responsive sidebar (280px on desktop, collapsible on mobile)
  - Semantic color coding for different command types (file operations, terminal, system, network, warnings)
  - Command box styling with syntax highlighting classes

## Adding New Content Sections

To add a new educational section:

1. **Add navigation link** in `index.html` sidebar:
   ```html
   <a class="nav-link nav-item" data-section="new-section-id"
      data-tags="searchable keywords here">
       Display Name
   </a>
   ```

2. **Create section content** in `index.html` main area:
   ```html
   <section id="new-section-id" class="section">
       <h1>Section Title</h1>
       <!-- Content here -->
   </section>
   ```

3. **Register the tab** - Create `js/tabs/new-section-id.js`:
   ```javascript
   (function() {
     if (window.LinuxApp && window.LinuxApp.registerTab) {
       window.LinuxApp.registerTab('new-section-id');
     }
   })();
   ```

4. **Load the tab script** - Add to `js/main.js` in the `tabScripts` array:
   ```javascript
   'js/tabs/new-section-id.js',
   ```

## Code Conventions

- **Command box structure** - Use this HTML pattern for displaying Linux commands:
  ```html
  <div class="cmd-box">
      <div class="cmd-header">Command Category</div>
      <div class="cmd-content">
          <span class="hl-prompt">$</span>
          <span class="hl-cmd">command</span>
          <span class="hl-opt">--option</span>
          <span class="hl-arg">argument</span><br>
          <span class="hl-comment"># Explanation in Spanish</span>
      </div>
  </div>
  ```

- **CSS classes for syntax highlighting:**
  - `.hl-prompt` - Shell prompt ($, #)
  - `.hl-cmd` - Command name
  - `.hl-opt` - Options/flags
  - `.hl-arg` - Arguments
  - `.hl-comment` - Comments

- **All content is in Spanish** - Maintain consistent Spanish language throughout

## Special Files

- **`anti.html`** - Appears to be an unrelated "Google Antigravity" demo page (not part of main app)
- **`anti-main.js`** - Large JavaScript file (1.6MB) associated with anti.html
- **`uv.html`** - Empty placeholder file

## Search Functionality

The sidebar search box filters navigation items by:
- Text content of the navigation link
- `data-tags` attribute values (keywords for discoverability)

When adding sections, include relevant `data-tags` for better searchability.

## Mobile Responsiveness

- Sidebar collapses on screens ≤ 768px
- Mobile menu toggle button (☰) controls sidebar visibility
- Sidebar automatically closes when selecting a section on mobile
- Smooth scroll-to-top behavior on section changes

## Command Coverage

The application covers 40+ essential Linux commands organized by functionality. Based on industry-standard guides (Hostinger, etc.), key command categories include:

### Text Processing & Files (section: text-files)
- **Reading**: `cat`, `head`, `tail`, `less`
- **Searching**: `grep` (with -i, -r, -n, -c, -v options)
- **Processing**: `wc`, `sort`, `diff`
- **Advanced**: `awk` (column processing), `sed` (stream editing)
- **Archiving**: `tar`, `zip`, `unzip`

### File Search (section: fs-advanced)
- **Real-time search**: `find` (by name, size, type, modification time, with -exec)
- **Indexed search**: `locate` (with `updatedb`)

### System Administration (section: admin-sys)
- **Process monitoring**: `ps`, `top`, `htop`
- **Process management**: `kill`, `pkill`, `killall`, `pgrep`
- **Services**: `systemctl` (start, stop, enable, restart, status)
- **Logs**: `journalctl`
- **Hardware info**: `lsblk`, `lscpu`, `free`, `uname`

### System Utilities (section: sys-mgmt)
- **Output**: `echo`
- **Documentation**: `man`, `--help`
- **Monitoring**: `watch`
- **File identification**: `file`
- **Command location**: `which`, `whereis`

### Permissions & Ownership (section: admin-perms)
- `chmod` (octal notation)
- `chown`
- `sudo`
- SUID, SGID, Sticky Bit

### Network & Connectivity (section: admin-net)
- **Diagnostics**: `ip`, `ping`, `traceroute`
- **Transfer**: `curl`, `wget`, `scp`
- **Remote access**: `ssh`
- **Ports**: `ss`, `netstat`

### Package Management & Cleanup (section: pkg-uninstall)
- **Basic uninstall**: `apt remove`, `apt purge`
- **Dependency cleanup**: `apt autoremove`, `apt autoremove --purge`
- **Cache management**: `apt clean`, `apt autoclean`
- **Low-level management**: `dpkg -r`, `dpkg -P`, `dpkg -l`
- **Configuration cleanup**: Finding and purging residual configs
- **Alternative formats**: `snap remove`, `flatpak uninstall`
- **Repository management**: PPA removal
- **Advanced**: Kernel cleanup, force removal
- **Complete cleanup workflow**: Monthly maintenance routine

## Content Enhancement Notes

When improving command examples:
- Include practical use cases relevant to Ubuntu users
- Show both basic and advanced options
- Use realistic file/directory names
- Add inline comments in Spanish explaining each option
- Group related commands logically (e.g., all grep options together)
