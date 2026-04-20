/* --- js/mission_system/core.js --- */
/* Core do sistema de missões — Firebase */

window.MissionSystem = window.MissionSystem || {};

window.MissionSystem.init = async function() {
    this.userPermissions.userId = OrdemAuth ? OrdemAuth.getCurrentUID() : localStorage.getItem('user_id');
    await this.loadTime();
    await this.load();
    await this.loadUserPermissions();
    await this.loadRolesCache();
    if(this.renderGlobeMarkers) this.renderGlobeMarkers();
    if(this.updateNotificationDot) this.updateNotificationDot();
    console.log(" > MissionSystem: Modo Filtro 3.0 Ativo.");
};

window.MissionSystem.loadTime = async function() {
    try {
        const data = await OrdemMissions.getGameTime();
        this.gameDate = data.gameDate;
        const disp = document.getElementById('game-date-display');
        if (disp && this.gameDate) {
            const parts = this.gameDate.split('-');
            if(parts.length === 3) {
                disp.innerText = `${parts[2]}/${parts[1]}/${parts[0]}`;
            } else { disp.innerText = this.gameDate; }
        }
    } catch(e) { console.error("Erro tempo:", e); }
};

window.MissionSystem.load = async function() {
    try {
        this.missions = await OrdemMissions.getMissions();
    } catch (e) { console.error("Erro missões:", e); }
};

window.MissionSystem.loadUserPermissions = async function() {
    if (!this.userPermissions.userId) return;
    try {
        const u = await OrdemDB.getAccount(this.userPermissions.userId);
        if (u) {
            this.userPermissions.roles = u.roles || [];
            this.customOrders = u.missionOrders || {};
        }
    } catch(e) { console.error(e); }
};

window.MissionSystem.loadRolesCache = async function() {
    try {
        this.allRolesCache = await OrdemRoles.getRoles();
    } catch(e) { console.error("Erro ao carregar roles:", e); }
};
