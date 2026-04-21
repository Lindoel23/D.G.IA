/* --- pages/dashboard/dashboard.js --- */

(async function() {
    const userName = localStorage.getItem('user_name') || 'Viajante';
    const wb = document.getElementById('welcomeBox');
    wb.innerHTML = `<h3>Bem-vindo(a), <span style="white-space: nowrap;">${userName}!&nbsp;<span class="hand-container" data-icon="hand"></span></span></h3>`;
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
