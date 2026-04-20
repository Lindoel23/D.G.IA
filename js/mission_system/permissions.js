window.MissionSystem = window.MissionSystem || {};

window.MissionSystem.togglePermUI = function(val, prefix) {
    const container = document.getElementById(prefix + '-perm-container');
    if(container) container.style.display = (val === 'individual') ? 'block' : 'none';
};

window.MissionSystem.openPermSelector = async function(prefix) {
    this.targetPrefix = prefix;
    try {
        const [roles, users] = await Promise.all([
            OrdemRoles.getRoles(),
            OrdemDB.getAllAccounts()
        ]);
        this.allRoles = roles;
        this.allUsers = users;
    } catch (e) { console.error("Erro ao puxar cargos: ", e); }

    if(this.renderPermRoles) this.renderPermRoles();
    if(this.renderPermUsers) this.renderPermUsers();
    
    const modal = document.getElementById('permissionsHubModal');
    if(modal) { modal.style.display = 'flex'; if (window.renderIcons) window.renderIcons(); }
};

window.MissionSystem.renderPermRoles = function() {
    const c = document.getElementById('permRolesList');
    if(!c) return;
    c.innerHTML = '';
    this.allRoles.forEach(r => {
        const sel = this.tempAllowedRoles.includes(r.id);
        const btn = document.createElement('div');
        btn.className = `role-select-btn ${sel ? 'selected' : ''}`;
        btn.innerHTML = `<span style="font-weight:bold; color:${r.color}">${r.name}</span><span class="role-check-icon" data-icon="check"></span>`;
        btn.onclick = () => {
            if (this.tempAllowedRoles.includes(r.id)) this.tempAllowedRoles = this.tempAllowedRoles.filter(x => x !== r.id);
            else this.tempAllowedRoles.push(r.id);
            this.renderPermRoles();
            if(this.updatePermSummary) this.updatePermSummary(this.targetPrefix);
        };
        c.appendChild(btn);
    });
    if (window.renderIcons) window.renderIcons();
};

window.MissionSystem.renderPermUsers = function() {
    const c = document.getElementById('permUsersList');
    if(!c) return;
    c.innerHTML = '';
    this.allUsers.forEach(u => {
        const sel = this.tempAllowedUsers.includes(u.id);
        const btn = document.createElement('div');
        btn.className = `role-select-btn ${sel ? 'selected' : ''}`;
        btn.innerHTML = `<span>${u.nickname}</span><span class="role-check-icon" data-icon="check"></span>`;
        btn.onclick = () => {
            if (this.tempAllowedUsers.includes(u.id)) this.tempAllowedUsers = this.tempAllowedUsers.filter(x => x !== u.id);
            else this.tempAllowedUsers.push(u.id);
            this.renderPermUsers();
            if(this.updatePermSummary) this.updatePermSummary(this.targetPrefix);
        };
        c.appendChild(btn);
    });
    if (window.renderIcons) window.renderIcons();
};

window.MissionSystem.updatePermSummary = function(prefix) {
    const el = document.getElementById(prefix + '-perm-summary');
    if(el) el.innerText = `Cargos: ${this.tempAllowedRoles.length} | Usuários: ${this.tempAllowedUsers.length}`;
};
