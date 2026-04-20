// shared/js/menu.js — Menu Sidebar Overlay (Firebase)

const ALL_MENU_ITEMS = [
    // --- GERAL ---
    { label: 'Central', link: 'pages/dashboard/dashboard.html', group: 'common', iconKey: 'home' },
    { label: 'Mapa Mundi', link: 'tools/map.html', group: 'common', iconKey: 'map-zone' },
    { label: 'Configurações', link: 'pages/config/config.html', group: 'common', iconKey: 'settings' },

    // --- ADMIN ---
    { label: 'Gerenciar Jogos', link: 'pages/games-panel/games-panel.html', group: 'admin', iconKey: 'gamepad' },
    { label: 'Glossário (Manual)', link: 'pages/glossary/glossary.html', group: 'admin', iconKey: 'book' },
    { label: 'Gerador de Jogos', link: 'pages/prompt/prompt.html', group: 'admin', iconKey: 'scroll' },
    { label: 'Backup e Estrutura', link: 'pages/backup/backup.html', group: 'admin', iconKey: 'box' },
    { label: 'Contas e Cargos', link: 'pages/accounts/accounts.html', group: 'admin', iconKey: 'users' }
];

async function initMenu() {
    const triggerBtn = document.getElementById('menuTrigger');
    if (!triggerBtn || document.getElementById('menuSidebar')) return;

    const uid = OrdemAuth ? OrdemAuth.getCurrentUID() : localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name') || 'Viajante';
    let userRoles = ['member'];
    let rolesData = [];
    let profileImage = localStorage.getItem('user_profile_image') || null;

    if (uid) {
        try {
            const [account, roles] = await Promise.all([
                OrdemDB.getAccount(uid),
                OrdemRoles.getRoles()
            ]);
            if (account) {
                userRoles = Array.isArray(account.roles) ? account.roles : ['member'];
                if (account.profileImage) {
                    profileImage = account.profileImage;
                    localStorage.setItem('user_profile_image', profileImage);
                }
            }
            if (roles) rolesData = roles;
        } catch (e) { console.error("Erro menu", e); }
    }

    let finalPermissions = new Set();
    let isSuperAdmin = false;

    userRoles.forEach(roleId => {
        const roleObj = rolesData.find(r => r.id === roleId);
        if (roleObj) {
            if (roleObj.permissions.includes("ALL")) isSuperAdmin = true;
            roleObj.permissions.forEach(p => finalPermissions.add(p));
        }
    });

    const currentPath = window.location.pathname;
    const allowedItems = ALL_MENU_ITEMS.filter(item => {
        if (currentPath.endsWith(item.link.split('/').pop())) return false;
        if (isSuperAdmin) return true;
        return finalPermissions.has(item.link);
    });

    const commonItems = allowedItems.filter(i => i.group === 'common');
    const adminItems = allowedItems.filter(i => i.group === 'admin');

    // --- Criar Backdrop ---
    const backdrop = document.createElement('div');
    backdrop.id = 'menuBackdrop';
    backdrop.className = 'menu-backdrop';
    document.body.appendChild(backdrop);

    // --- Criar Sidebar ---
    const sidebar = document.createElement('div');
    sidebar.id = 'menuSidebar';
    sidebar.className = 'menu-sidebar';

    // Botão Fechar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'menu-sidebar-close';
    closeBtn.title = 'Fechar Menu';
    closeBtn.innerHTML = window.getIcon ? window.getIcon('arrow_left') : '✕';
    sidebar.appendChild(closeBtn);

    // Seção Perfil (Banner)
    const profileSection = document.createElement('div');
    profileSection.id = 'menuProfileBanner';
    profileSection.className = 'menu-profile-section';
    if (profileImage) {
        profileSection.style.backgroundImage = `url(${profileImage})`;
    } else {
        const defaultIcon = document.createElement('div');
        defaultIcon.className = 'menu-profile-default-icon';
        defaultIcon.innerHTML = window.getIcon ? window.getIcon('user') : '';
        profileSection.appendChild(defaultIcon);
    }

    const nameDiv = document.createElement('div');
    nameDiv.className = 'menu-profile-name';
    nameDiv.textContent = userName;

    profileSection.appendChild(nameDiv);
    sidebar.appendChild(profileSection);

    // Items Container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'menu-sidebar-items';

    // Links Comuns
    commonItems.forEach(item => {
        itemsContainer.appendChild(createSidebarLink(item));
    });

    // Separador ADM
    if (adminItems.length > 0) {
        const separator = document.createElement('div');
        separator.className = 'menu-sidebar-separator';
        separator.textContent = '── ADM ──';
        itemsContainer.appendChild(separator);
        adminItems.forEach(item => {
            itemsContainer.appendChild(createSidebarLink(item));
        });
    }

    sidebar.appendChild(itemsContainer);

    // Logout
    const logoutBtn = document.createElement('a');
    logoutBtn.className = 'menu-sidebar-item logout-item';
    logoutBtn.innerHTML = (window.getIcon ? window.getIcon('logout') : '') + ' Sair';
    logoutBtn.href = '#';
    logoutBtn.onclick = async (e) => {
        e.preventDefault();
        if (window.showGlobalLoader) window.showGlobalLoader();
        setTimeout(async () => {
            await OrdemAuth.logout();
        window.showGlobalLoader(() => window.location.href = 'pages/login/login.html');
        }, 400);
    };
    sidebar.appendChild(logoutBtn);

    document.body.appendChild(sidebar);

    // --- Handlers ---
    function openMenu() {
        sidebar.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    }

    function closeMenu() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    triggerBtn.onclick = (e) => {
        e.stopPropagation();
        if (sidebar.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeMenu();
    };

    backdrop.onclick = () => closeMenu();

    // ESC fecha menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeMenu();
        }
    });

    if (window.renderIcons) window.renderIcons();
}

function createSidebarLink(item) {
    const a = document.createElement('a');
    a.className = 'menu-sidebar-item';
    const iconHtml = window.getIcon ? window.getIcon(item.iconKey) : '';
    a.innerHTML = iconHtml + ` ${item.label}`;
    a.href = item.link;
    return a;
}

document.addEventListener('DOMContentLoaded', initMenu);