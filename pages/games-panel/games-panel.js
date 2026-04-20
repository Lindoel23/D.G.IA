/* --- pages/games-panel/games-panel.js --- */

let allRoles = [];
let allUsers = [];
let selectedRoles = [];
let selectedUsers = [];

function switchTab(viewId, btn) {
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-create').style.display = 'none';
    document.getElementById('view-' + viewId).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (viewId === 'list') loadGames();
}

async function loadGames() {
    const list = document.getElementById('gamesList');
    try {
        const projects = await OrdemMissions.getProjects();
        list.innerHTML = '';
        projects.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3><span data-icon="gamepad"></span> ${p.name}</h3>
                <p style="font-size:0.75rem; color:#666;">ID: ${p.id}</p>
                <div class="game-card-actions">
                    <a href="${p.gameUrl || '#'}" class="btn-play" style="flex:1; font-size:0.8rem;">JOGAR</a>
                    <button class="btn-icon" onclick="editGame('${p.id}')" data-icon="edit"></button>
                    <button class="btn-danger-icon" onclick="tryDeleteGame('${p.id}')" data-icon="trash"></button>
                </div>`;
            list.appendChild(card);
        });
        if (projects.length === 0) list.innerHTML = '<div class="card"><p>Nenhum jogo criado ainda.</p></div>';
        if (window.renderIcons) window.renderIcons();
    } catch (e) { showToast("Erro ao carregar jogos", true); }
}

async function editGame(id) {
    try {
        const projects = await OrdemMissions.getProjects();
        const p = projects.find(proj => proj.id === id);
        if (!p) return showToast("Jogo não encontrado", true);
        document.getElementById('editingId').value = p.id;
        document.getElementById('gameName').value = p.name;
        document.getElementById('gameHtml').value = p.htmlCode || '';
        document.getElementById('gameLogic').value = p.logicCode || '';
        selectedRoles = p.allowedRoles || [];
        selectedUsers = p.allowedUsers || [];
        document.getElementById('formTitle').innerHTML = '<span data-icon="edit"></span> Editar Jogo';
        document.getElementById('cancelEditBtn').style.display = 'flex';
        document.getElementById('saveGameBtn').innerText = 'ATUALIZAR JOGO';
        switchTab('create', document.querySelectorAll('.tab-btn')[1]);
        if (window.renderIcons) window.renderIcons();
    } catch (e) { showToast("Erro ao carregar jogo", true); }
}

function resetForm() {
    document.getElementById('editingId').value = '';
    document.getElementById('gameName').value = '';
    document.getElementById('gameHtml').value = '';
    document.getElementById('gameLogic').value = '';
    selectedRoles = [];
    selectedUsers = [];
    document.getElementById('formTitle').innerHTML = '<span data-icon="gamepad"></span> Novo Jogo';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('saveGameBtn').innerText = 'SALVAR JOGO';
    if (window.renderIcons) window.renderIcons();
}

async function saveGame() {
    const name = document.getElementById('gameName').value;
    const htmlCode = document.getElementById('gameHtml').value;
    const logicCode = document.getElementById('gameLogic').value;
    const editingId = document.getElementById('editingId').value;
    if (!name || !htmlCode) return showToast("Nome e HTML são obrigatórios!", true);

    const body = { 
        id: editingId || Date.now().toString(),
        name, 
        htmlCode, 
        logicCode: logicCode || '', 
        allowedRoles: selectedRoles, 
        allowedUsers: selectedUsers,
        createdAt: new Date().toISOString()
    };

    try {
        let ok;
        if (editingId) {
            ok = await OrdemMissions.updateProject(editingId, body);
        } else {
            ok = await OrdemMissions.createProject(body);
        }
        if (ok) {
            showToast(editingId ? "Jogo atualizado!" : "Jogo criado!");
            resetForm();
            switchTab('list', document.querySelectorAll('.tab-btn')[0]);
        } else { showToast("Erro ao salvar", true); }
    } catch (e) { showToast("Erro de conexão", true); }
}

function tryDeleteGame(id) {
    openConfirm("Deseja EXCLUIR este jogo permanentemente?", async () => {
        try {
            await OrdemMissions.deleteProject(id);
            showToast("Jogo removido.");
            loadGames();
        } catch (e) { showToast("Erro ao deletar", true); }
    });
}

// --- PERMISSÕES ---
async function openPermissionsHub() {
    try {
        const [roles, users] = await Promise.all([
            OrdemRoles.getRoles(),
            OrdemDB.getAllAccounts()
        ]);
        allRoles = roles;
        allUsers = users;
    } catch (e) {}

    renderPermRoles();
    renderPermUsers();
    openModal('permissionsHubModal');
}

function renderPermRoles() {
    const c = document.getElementById('permRolesList');
    c.innerHTML = '';
    allRoles.forEach(r => {
        const sel = selectedRoles.includes(r.id);
        const btn = document.createElement('div');
        btn.className = `role-select-btn ${sel ? 'selected' : ''}`;
        btn.innerHTML = `<span style="font-weight:bold; color:${r.color}">${r.name}</span><span class="role-check-icon" data-icon="check"></span>`;
        btn.onclick = () => {
            if (selectedRoles.includes(r.id)) selectedRoles = selectedRoles.filter(x => x !== r.id);
            else selectedRoles.push(r.id);
            renderPermRoles();
        };
        c.appendChild(btn);
    });
    if (window.renderIcons) window.renderIcons();
}

function renderPermUsers() {
    const c = document.getElementById('permUsersList');
    c.innerHTML = '';
    allUsers.forEach(u => {
        const sel = selectedUsers.includes(u.id);
        const btn = document.createElement('div');
        btn.className = `role-select-btn ${sel ? 'selected' : ''}`;
        btn.innerHTML = `<span>${u.nickname}</span><span class="role-check-icon" data-icon="check"></span>`;
        btn.onclick = () => {
            if (selectedUsers.includes(u.id)) selectedUsers = selectedUsers.filter(x => x !== u.id);
            else selectedUsers.push(u.id);
            renderPermUsers();
        };
        c.appendChild(btn);
    });
    if (window.renderIcons) window.renderIcons();
}

// Init
(async () => {
    await loadGames();
    if (window.markDataReady) window.markDataReady();
})();
