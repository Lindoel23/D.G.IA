/* --- js/map_controller.js --- */
/* Controla interações de base, boot e CRUD na visão do Mapa — Firebase */

window.isAdminUser = false;
window.isEditingMode = false;

// Segura o Loading Global para não gaguejar enquanto o D3 constrói a geometria do planeta
window.blockGlobalLoaderHide = true;
window.addEventListener('GlobeReady', () => {
    // Quando o mapa estiver totalmente montado e renderizado, liberamos o Fade
    window.blockGlobalLoaderHide = false;
    if (window.markDataReady) window.markDataReady();
    else if (window.hideGlobalLoader) window.hideGlobalLoader(); // Fallback
});

// --- ADMIN CHECK ---
async function checkAdmin() {
    const uid = OrdemAuth ? OrdemAuth.getCurrentUID() : localStorage.getItem('user_id');
    if (!uid) return;
    try {
        const u = await OrdemDB.getAccount(uid);
        if (u) {
            const r = u.roles || [];
            if (r.includes('admin') || r.includes('my_love')) {
                document.getElementById('admin-mission-control').style.display = 'block';
                window.isAdminUser = true;
                const btnEditTime = document.getElementById('btn-edit-time');
                if (btnEditTime) {
                    btnEditTime.style.display = 'inline-block';
                    if (window.renderIcons) window.renderIcons();
                }
            }
        }
    } catch (e) { console.error("Erro RBAC", e); }
}

// --- SIDEBAR ---
function toggleSidebar(s) { 
    const sb = document.getElementById('mission-sidebar');
    if (s) {
        sb.classList.add('open');
        if (window.MissionSystem && window.MissionSystem.renderList) {
            window.MissionSystem.renderList('mission-content-area');
        }
    } else {
        sb.classList.remove('open');
    }
}

// Listener de Segurança
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        const sb = document.getElementById('mission-sidebar');
        if (sb && sb.classList.contains('open')) {
            toggleSidebar(false);
        }
        const detailOverlay = document.querySelector('.mission-details-overlay');
        if (detailOverlay && detailOverlay.classList.contains('active')) {
            if (window.MissionSystem && window.MissionSystem.closeDetails) {
                window.MissionSystem.closeDetails();
            } else {
                detailOverlay.classList.remove('active');
            }
        }
    }
});

// --- CONTROLES DE MODAIS E PICKING ---
function openMissionCreateModal() { 
    window.isEditingMode = false;
    if(window.MissionCover) window.MissionCover.cleanCreateModal();
    if(window.MissionSystem) {
        window.MissionSystem.tempAllowedRoles = [];
        window.MissionSystem.tempAllowedUsers = [];
        const elAcc = document.getElementById('m-accessType');
        if(elAcc) {
            elAcc.value = 'all';
            if (window.MissionSystem.togglePermUI) window.MissionSystem.togglePermUI('all', 'm');
        }
        if (window.MissionSystem.updatePermSummary) window.MissionSystem.updatePermSummary('m');
    }
    document.getElementById('missionModal').style.display = 'flex'; 
    if(window.renderIcons) window.renderIcons();
}

function openTimeModal() {
    if (window.MissionSystem && window.MissionSystem.gameDate) {
        document.getElementById('sys-game-date').value = window.MissionSystem.gameDate;
    }
    document.getElementById('timeEditModal').style.display = 'flex';
    if (window.renderIcons) window.renderIcons();
}

function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
}

function startPicking() {
    window.isEditingMode = false;
    if (window.MissionSystem && window.MissionSystem.startPickingMode) window.MissionSystem.startPickingMode();
}

function startRepicking() {
    window.isEditingMode = true;
    if (window.MissionSystem && window.MissionSystem.startPickingMode) window.MissionSystem.startPickingMode();
}

// --- CRUD DE MISSÕES (FIREBASE) ---
async function saveMission() {
    const name = document.getElementById('m-name').value;
    const desc = document.getElementById('m-desc').value;
    const locName = document.getElementById('m-location-name').value;
    const type = document.getElementById('m-type').value;
    const icon = document.getElementById('m-icon').value;
    let lng = document.getElementById('m-lng').value || 0;
    let lat = document.getElementById('m-lat').value || 0;
    const endDate = document.getElementById('m-endDate').value || null;
    
    const coverImage = document.getElementById('m-cover-data').value || null;
    const coverPos = document.getElementById('m-cover-pos').value || "50,50";
    
    const accessType = document.getElementById('m-accessType').value;
    const allowedRoles = window.MissionSystem ? window.MissionSystem.tempAllowedRoles : [];
    const allowedUsers = window.MissionSystem ? window.MissionSystem.tempAllowedUsers : [];

    if(!name) return window.showToast("Preencha o nome da missão!", true);

    const missionData = {
        id: Date.now().toString(),
        name, description: desc, locationName: locName, 
        type, icon, lng, lat, 
        accessType, allowedRoles, allowedUsers, 
        endDate, coverImage, coverPos,
        viewedBy: [],
        createdAt: new Date().toISOString()
    };

    try {
        await OrdemMissions.createMission(missionData);
        window.showToast("Missão criada de forma excepcional!");
        closeModal('missionModal');
        setTimeout(() => window.location.reload(), 1000);
    } catch(e) { window.showToast("Erro ao comunicar com o Satélite", true); }
}

async function saveEditMission() {
    const id = document.getElementById('edit-m-id').value;
    const name = document.getElementById('edit-m-name').value;
    const desc = document.getElementById('edit-m-desc').value;
    const locName = document.getElementById('edit-m-location-name').value;
    const type = document.getElementById('edit-m-type').value;
    const icon = document.getElementById('edit-m-icon').value;
    let lng = document.getElementById('edit-m-lng').value || 0;
    let lat = document.getElementById('edit-m-lat').value || 0;
    const endDate = document.getElementById('edit-m-endDate').value || null;
    
    const coverImage = document.getElementById('edit-m-cover-data').value || null;
    const coverPos = document.getElementById('edit-m-cover-pos').value || "50,50";
    
    const accessType = document.getElementById('edit-m-accessType').value;
    const allowedRoles = window.MissionSystem ? window.MissionSystem.tempAllowedRoles : [];
    const allowedUsers = window.MissionSystem ? window.MissionSystem.tempAllowedUsers : [];
    
    if(!name) return window.showToast("Preencha obrigatoriamente o nome!", true);

    try {
        // Busca missões, encontra e atualiza
        let missions = await OrdemMissions.getMissions();
        const idx = missions.findIndex(m => m && m.id === id);
        if (idx >= 0) {
            Object.assign(missions[idx], { 
                name, description: desc, locationName: locName, 
                type, icon, lng, lat, 
                accessType, allowedRoles, allowedUsers, 
                endDate, coverImage, coverPos 
            });
            await OrdemMissions.setMissions(missions);
        }
        window.showToast("Coordenadas atualizadas com maestria!");
        closeModal('editMissionModal');
        setTimeout(() => window.location.reload(), 1000);
    } catch(e) { window.showToast("Falha de transmissão na edição", true); }
}

async function deleteMissionConfirm() {
    const id = document.getElementById('edit-m-id').value;
    if(!confirm("Tem certeza que deseja apagar esta missão?")) return;
    try {
        await OrdemMissions.deleteMission(id);
        closeModal('editMissionModal');
        window.location.reload();
    } catch(e) { alert("Erro ao excluir"); }
}

async function saveGameTime() {
    const gameDate = document.getElementById('sys-game-date').value;
    if(!gameDate) return window.showToast("Selecione uma data!", true);
    try {
        await OrdemMissions.setGameTime(gameDate);
        window.showToast("Data atualizada!");
        closeModal('timeEditModal');
        setTimeout(() => window.location.reload(), 500);
    } catch(e) { window.showToast("Falha ao salvar data", true); }
}

// --- INICIALIZAÇÃO DO GLOBO E DO SISTEMA ---
window.addEventListener('DOMContentLoaded', () => {
    if (window.GlobeEngine) window.GlobeEngine.init('globeCanvas');
});

window.addEventListener('GlobeReady', async () => {
    if (window.MissionSystem && window.MissionSystem.init) {
        await window.MissionSystem.init();
        const count = document.getElementById('mission-count');
        if (count && window.MissionSystem.missions) {
            count.textContent = window.MissionSystem.missions.length;
        }
    }
});

// --- BOOT ---
checkAdmin();
if(window.renderIcons) window.renderIcons();
