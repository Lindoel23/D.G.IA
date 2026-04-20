/* --- pages/accounts/accounts.js --- */

let allRoles = [];
let currentManageRoles = [];

function switchView(viewId, btn) {
    document.getElementById('view-users').style.display = 'none';
    document.getElementById('view-roles').style.display = 'none';
    document.getElementById('view-' + viewId).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (viewId === 'users') loadUsers();
    if (viewId === 'roles') loadRoles();
}

function filterUsers(term) {
    term = term.toLowerCase();
    document.querySelectorAll('.user-item').forEach(item => {
        const nick = item.querySelector('h4').innerText.toLowerCase();
        const emailInput = item.querySelector('input[id^="email_"]');
        const email = emailInput ? emailInput.value.toLowerCase() : "";
        item.style.display = (nick.includes(term) || email.includes(term)) ? 'block' : 'none';
    });
}

function toggleListPassword(uid) {
    const input = document.getElementById(`pass_${uid}`);
    const iconContainer = document.querySelector(`#btn_eye_${uid}`);
    if (input.type === "password") {
        input.type = "text";
        iconContainer.innerHTML = window.getIcon('eye');
    } else {
        input.type = "password";
        iconContainer.innerHTML = window.getIcon('eye_off');
    }
}

async function loadUsers() {
    const list = document.getElementById('usersList');
    try {
        const [users, roles] = await Promise.all([
            OrdemDB.getAllAccounts(),
            OrdemRoles.getRoles()
        ]);
        allRoles = roles;
        list.innerHTML = '';

        users.forEach(u => {
            const uRoles = Array.isArray(u.roles) ? u.roles : ['member'];
            let badgesHtml = '';
            uRoles.forEach(rid => {
                const rObj = allRoles.find(r => r.id === rid);
                const name = rObj ? rObj.name : rid;
                const color = rObj ? rObj.color : '#666';
                badgesHtml += `<span class="role-badge" style="background:${color}">${name}</span>`;
            });
            const rolesString = JSON.stringify(uRoles).replace(/"/g, '&quot;');
            const isProtected = (u.nickname === 'Lindoel' || u.nickname === 'Mestrezinha');
            const deleteBtnHtml = isProtected ? '' : `<button class="btn-danger" onclick="tryDeleteUser('${u.id}')">EXCLUIR CONTA</button>`;

            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = `
                <div class="user-header" onclick="this.parentElement.classList.toggle('open')">
                    <div class="user-info-container">
                        <div class="role-badges">${badgesHtml}</div>
                        <h4>${u.nickname}</h4>
                    </div>
                    <span class="arrow" data-icon="arrow_down"></span>
                </div>
                <div class="user-details">
                    <div class="detail-content">
                        <div class="edit-group"><label>Apelido</label><input type="text" id="nick_${u.id}" value="${u.nickname}"></div>
                        <div class="edit-group"><label>Email</label><input type="text" id="email_${u.id}" value="${u.email || ''}"></div>
                        <div class="edit-group">
                            <label>Cargos Atuais</label>
                            <div id="display_roles_${u.id}" class="role-badges" style="margin-bottom:5px;">${badgesHtml}</div>
                            <button class="btn-manage" onclick="openManageRoles('${u.id}', '${u.nickname}', ${rolesString})">GERENCIAR CARGOS</button>
                        </div>
                        <div class="user-actions">
                            <button class="btn-save" onclick="updateUser('${u.id}')">SALVAR ALTERAÇÕES</button>
                            ${deleteBtnHtml}
                        </div>
                    </div>
                </div>`;
            list.appendChild(div);
        });
        if (window.renderIcons) window.renderIcons();
    } catch (e) { showToast("Falha na conexão", true); }
}

function openManageRoles(uid, nickname, userRoles) {
    document.getElementById('manageUserId').value = uid;
    document.getElementById('manageUserName').innerText = nickname;
    currentManageRoles = [...userRoles];
    renderManageRolesList();
    openModal('manageRolesModal');
}

function renderManageRolesList() {
    const container = document.getElementById('manageRolesList');
    container.innerHTML = '';
    allRoles.forEach(r => {
        const isSelected = currentManageRoles.includes(r.id);
        const btn = document.createElement('div');
        btn.className = `role-select-btn ${isSelected ? 'selected' : ''}`;
        btn.innerHTML = `<span style="font-weight:bold; color:${r.color}">${r.name}</span><span class="role-check-icon" data-icon="check"></span>`;
        btn.onclick = () => {
            if (currentManageRoles.includes(r.id)) currentManageRoles = currentManageRoles.filter(id => id !== r.id);
            else currentManageRoles.push(r.id);
            renderManageRolesList();
        };
        container.appendChild(btn);
    });
    if (window.renderIcons) window.renderIcons();
}

async function confirmUserRoles() {
    const uid = document.getElementById('manageUserId').value;
    try {
        const ok = await OrdemDB.updateAccount(uid, { roles: currentManageRoles });
        if (ok) { showToast("Cargos atualizados!"); closeModal('manageRolesModal'); loadUsers(); }
        else showToast("Erro ao salvar cargos", true);
    } catch (e) { showToast("Falha na conexão", true); }
}

async function updateUser(targetId) {
    const nickname = document.getElementById(`nick_${targetId}`).value;
    const email = document.getElementById(`email_${targetId}`).value;
    try {
        const ok = await OrdemDB.updateAccount(targetId, { nickname, email });
        if (ok) { showToast("Alterações salvas!"); loadUsers(); }
        else showToast("Erro ao salvar dados", true);
    } catch (e) { showToast("Falha na conexão", true); }
}

function tryDeleteUser(targetId) {
    openConfirm("Deseja EXCLUIR permanentemente esta conta?", async () => {
        await OrdemDB.deleteAccount(targetId);
        showToast("Conta removida.");
        loadUsers();
    });
}

// --- CARGOS ---
function openColorModal() { openModal('colorModal'); }
function closeColorModal() { closeModal('colorModal'); }
function updatePreviewOnly(color) {
    document.getElementById('roleColorPreview').style.backgroundColor = color;
    document.getElementById('roleColorValue').value = color;
    document.getElementById('hexInput').value = color;
}
function selectSwatchAndClose(color) { updatePreviewOnly(color); closeColorModal(); }

function togglePerm(card) {
    card.classList.toggle('selected');
    if (card.dataset.val === 'ALL') {
        const allCards = document.querySelectorAll('.perm-card:not([data-val="ALL"])');
        if (card.classList.contains('selected')) allCards.forEach(c => c.classList.add('selected'));
        else allCards.forEach(c => c.classList.remove('selected'));
    }
}

async function loadRoles() {
    allRoles = await OrdemRoles.getRoles();
    const list = document.getElementById('rolesList');
    list.innerHTML = '';
    allRoles.forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'role-card';
        div.style.borderLeft = `4px solid ${r.color}`;
        div.innerHTML = `<div><strong style="color:${r.color}">${r.name}</strong></div>
            <div class="role-actions">
                <button class="btn-icon" onclick="editRole('${r.id}')" data-icon="edit"></button>
                <button class="btn-danger-icon" onclick="tryDeleteRole(${i})" data-icon="trash"></button>
            </div>`;
        list.appendChild(div);
    });
    if (window.renderIcons) window.renderIcons();
}

function editRole(roleId) {
    const role = allRoles.find(r => r.id === roleId);
    if (!role) return;
    document.getElementById('editingRoleId').value = role.id;
    document.getElementById('roleName').value = role.name;
    updatePreviewOnly(role.color);
    document.querySelectorAll('.perm-card').forEach(card => {
        card.classList.toggle('selected', role.permissions.includes("ALL") || role.permissions.includes(card.dataset.val));
    });
    document.getElementById('roleFormTitle').innerText = "Editar Cargo";
    document.getElementById('cancelEditBtn').style.display = 'flex';
    document.getElementById('saveRoleBtn').innerText = "ATUALIZAR CARGO";
}

function resetRoleForm() {
    document.getElementById('editingRoleId').value = "";
    document.getElementById('roleName').value = "";
    updatePreviewOnly("#00ff88");
    document.querySelectorAll('.perm-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('roleFormTitle').innerText = "Novo Cargo";
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('saveRoleBtn').innerText = "SALVAR CARGO";
}

async function saveRole() {
    const name = document.getElementById('roleName').value;
    const color = document.getElementById('roleColorValue').value;
    const editingId = document.getElementById('editingRoleId').value;
    if (!name) return showToast("Nome obrigatório!", true);
    let perms = [];
    document.querySelectorAll('.perm-card.selected').forEach(c => perms.push(c.dataset.val));
    const id = editingId || name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^\w]/g, '');
    const roleData = { id, name, color, permissions: perms };
    const existingIdx = allRoles.findIndex(r => r.id === id);
    if (existingIdx >= 0) allRoles[existingIdx] = roleData;
    else allRoles.push(roleData);
    await OrdemRoles.setAllRoles(allRoles);
    resetRoleForm(); loadRoles(); showToast("Cargo salvo!");
}

function tryDeleteRole(index) {
    const role = allRoles[index];
    if (role.id === 'admin' || role.id === 'member') return showToast("Cargos de sistema não podem ser excluídos", true);
    openConfirm("Deseja apagar este cargo permanentemente?", async () => {
        allRoles.splice(index, 1);
        await OrdemRoles.setAllRoles(allRoles);
        loadRoles(); showToast("Cargo removido.");
    });
}

// Init
(async () => {
    await loadUsers();
    if (window.markDataReady) window.markDataReady();
})();
