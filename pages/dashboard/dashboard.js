/* --- pages/dashboard/dashboard.js --- */

(async function() {
    const userName = localStorage.getItem('user_name') || 'Viajante';
    const wb = document.getElementById('welcomeBox');
    wb.innerHTML = `<h3 style="display: block; text-align: center; font-size: clamp(1.6rem, 6vw, 2.2rem); line-height: 1.4; margin: 0;">Bem-vindo(a), ${userName}! <span class="hand-container" data-icon="hand" style="display: inline-block; vertical-align: middle; margin-left: 6px;"></span></h3>`;
    if (window.renderIcons) window.renderIcons();

    try {
        const uid = OrdemAuth.getCurrentUID();
        const [projects, account] = await Promise.all([
            OrdemMissions.getProjects(),
            OrdemDB.getAccount(uid)
        ]);
        const roles = account ? (account.roles || ['member']) : ['member'];
        const isAdmin = roles.includes('admin') || roles.includes('my_love');

        const list = document.getElementById('projectsList');
        list.innerHTML = '';

        projects.forEach(p => {
            const hasRoleAccess = !p.allowedRoles || p.allowedRoles.length === 0 || p.allowedRoles.some(r => roles.includes(r));
            const hasUserAccess = p.allowedUsers && p.allowedUsers.includes(uid);
            if (!isAdmin && !hasRoleAccess && !hasUserAccess) return;

            const card = document.createElement('a');
            card.href = p.gameUrl || '#';
            card.className = 'card';
            card.style.textDecoration = 'none';
            card.innerHTML = `<h3><span data-icon="gamepad"></span> ${p.name}</h3><p>Clique para jogar</p>`;
            list.appendChild(card);
        });

        if (list.childElementCount === 0) {
            list.innerHTML = '<div class="card"><p>Nenhum jogo disponível para seu perfil.</p></div>';
        }
        if (window.renderIcons) window.renderIcons();
    } catch (e) {
        showToast("Erro ao carregar projetos", true);
    }
    
    // Libera o carregamento da tela
    if (window.markDataReady) window.markDataReady();
})();
