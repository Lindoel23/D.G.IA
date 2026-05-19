/* --- js/mission_system/history.js --- */
/* Módulo de Histórico de Missões — Finalização e Arquivo */

window.MissionSystem = window.MissionSystem || {};

// ===== ABRIR / FECHAR SIDEBAR DE HISTÓRICO =====

window.MissionSystem.openHistory = async function() {
    await this.loadHistory();
    const overlay = document.getElementById('history-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
    this.renderHistory();
};

window.MissionSystem.closeHistory = function() {
    const overlay = document.getElementById('history-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }
};

// ===== FILTRO DO HISTÓRICO =====

window.MissionSystem.applyHistoryFilter = function(type) {
    this.historyFilter = type;
    const textMap = { 'all': 'todos', 'concluido': 'concluído', 'falha': 'falha', 'neutro': 'neutro' };
    document.querySelectorAll('.history-filter-btn').forEach(b => {
        const btnText = b.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const filterText = textMap[type].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        b.classList.toggle('active', btnText === filterText);
    });
    this.renderHistory();
};

window.MissionSystem.getFilteredHistory = function() {
    const isAdmin = this.userPermissions.roles.includes('admin') || this.userPermissions.roles.includes('my_love');

    let filtered = this.history.filter(m => {
        // Verificar visibilidade (mesma lógica das missões ativas)
        const acc = m.accessType || 'all';
        if (acc === 'individual' && !isAdmin) {
            const reqRoles = m.allowedRoles || [];
            const reqUsers = m.allowedUsers || [];
            const hasRole = reqRoles.some(r => this.userPermissions.roles.includes(r));
            const hasUser = reqUsers.includes(this.userPermissions.userId);
            if (!hasRole && !hasUser) return false;
        }

        // Filtro por conclusão
        if (this.historyFilter === 'all') return true;
        return m.conclusion === this.historyFilter;
    });

    return filtered;
};

// ===== RENDERIZAR LISTA DO HISTÓRICO =====

window.MissionSystem.renderHistory = function() {
    const scrollBox = document.getElementById('history-scroll-box');
    if (!scrollBox) return;
    scrollBox.innerHTML = '';

    const filtered = this.getFilteredHistory();

    if (filtered.length === 0) {
        scrollBox.innerHTML = '<p style="color:#666; text-align:center; padding:30px;">Nenhuma missão no histórico.</p>';
        return;
    }

    const conclusionColors = { concluido: '#00ff88', falha: '#ff4444', neutro: '#888' };
    const conclusionLabels = { concluido: 'CONCLUÍDO', falha: 'FALHA', neutro: 'NEUTRO' };

    filtered.forEach(m => {
        const borderColor = conclusionColors[m.conclusion] || '#888';
        const conclusionLabel = conclusionLabels[m.conclusion] || 'NEUTRO';
        const typeColor = m.type === 'primary' ? '#ff4444' : m.type === 'base' ? '#53A0D4' : '#f1c40f';
        const typeLabel = m.type === 'primary' ? 'PRINCIPAL' : m.type === 'base' ? 'BASE' : 'SECUNDÁRIA';

        // Badge de cargo (individual)
        let roleBadgeHtml = '';
        const acc = m.accessType || 'all';
        if ((acc === 'individual' || m.originalAccessType === 'individual') && m.allowedRoles && m.allowedRoles.length > 0) {
            const roleId = m.allowedRoles[0];
            const roleData = this.allRolesCache ? this.allRolesCache.find(r => r.id === roleId) : null;
            const roleName = roleData ? roleData.name : roleId;
            const roleColor = roleData ? roleData.color : '#888';
            roleBadgeHtml = `
                <div style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.6); border:1px solid ${roleColor}; color:${roleColor}; font-size:0.6rem; padding:2px 7px; border-radius:4px; font-weight:bold; z-index:5; text-transform:uppercase;">
                    ${roleName}
                </div>
            `;
        }

        const rect = document.createElement('div');
        rect.className = 'mission-rect history-rect';
        rect.style.borderLeftColor = borderColor;
        rect.style.borderLeftWidth = '4px';

        if (m.coverImage) {
            let [px, py] = (m.coverPos || "50,50").split(',').map(Number);
            if (isNaN(px)) px = 50; if (isNaN(py)) py = 50;
            rect.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%), url(${m.coverImage})`;
            rect.style.backgroundSize = 'cover';
            rect.style.backgroundPosition = `${px}% ${py}%`;
        }

        rect.innerHTML = `
            <div class="mission-rect-type" style="color:${typeColor}; border-color:${typeColor};">${typeLabel}</div>
            <div class="history-conclusion-tag" style="background:rgba(0,0,0,0.6); border:1px solid ${borderColor}; color:${borderColor};">${conclusionLabel}</div>
            <div class="mission-rect-name">${m.name}</div>
            ${roleBadgeHtml}
        `;

        rect.onclick = () => this.showHistoryDetails(m);
        scrollBox.appendChild(rect);
    });
};

// ===== DETALHE DO HISTÓRICO =====

window.MissionSystem.showHistoryDetails = function(mission) {
    const conclusionColors = { concluido: '#00ff88', falha: '#ff4444', neutro: '#888' };
    const conclusionLabels = { concluido: 'Concluído', falha: 'Falha', neutro: 'Neutro' };
    const color = mission.type === 'primary' ? '#ff4444' : mission.type === 'base' ? '#53A0D4' : '#f1c40f';
    const label = mission.type === 'primary' ? 'PRINCIPAL' : mission.type === 'base' ? 'BASE' : 'SECUNDÁRIA';
    const conclusionColor = conclusionColors[mission.conclusion] || '#888';
    const conclusionLabel = conclusionLabels[mission.conclusion] || 'Neutro';

    // Badge de cargo nos detalhes
    const acc = mission.accessType || 'all';
    let roleDetailHtml = '';
    if ((acc === 'individual' || mission.originalAccessType === 'individual') && mission.allowedRoles && mission.allowedRoles.length > 0) {
        const roleId = mission.allowedRoles[0];
        const roleData = this.allRolesCache ? this.allRolesCache.find(r => r.id === roleId) : null;
        const roleName = roleData ? roleData.name : roleId;
        const roleColor = roleData ? roleData.color : '#888';
        roleDetailHtml = `
            <div style="text-align: right;">
                <span class="detail-label">Cargo Designado</span>
                <div style="display:flex; justify-content:flex-end; align-items:center; gap:10px; margin-top:5px;">
                    <div style="width:10px; height:10px; background:${roleColor}; border-radius:50%; box-shadow:0 0 10px ${roleColor};"></div>
                    <span style="color:${roleColor}; font-weight:bold;">${roleName}</span>
                </div>
            </div>
        `;
    }

    let modal = document.getElementById('historyDetailModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'historyDetailModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '17000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px;">
            <h3 style="margin-top:0; color:${color};">${mission.name}</h3>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                <div>
                    <span class="detail-label" style="margin-top:0;">Prioridade</span>
                    <div style="display:flex; align-items:center; gap:10px; margin-top:5px;">
                        <div style="width:10px; height:10px; background:${color}; border-radius:50%; box-shadow:0 0 10px ${color};"></div>
                        <span style="color:#fff;">${label}</span>
                    </div>
                </div>
                ${roleDetailHtml}
            </div>
            <span class="detail-label">Descrição</span>
            <div class="detail-text">${mission.description || "..."}</div>
            <span class="detail-label" style="margin-top:15px;">Localização</span>
            <div style="font-family:monospace; color:#ccc; font-weight:bold;">${mission.locationName || "Local Desconhecido"}</div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px solid #333;">
                <span class="detail-label" style="margin-top:0; color:${conclusionColor};">Conclusão</span>
                <div style="display:flex; align-items:center; gap:10px; margin-top:5px; margin-bottom:10px;">
                    <div style="width:10px; height:10px; background:${conclusionColor}; border-radius:50%; box-shadow:0 0 10px ${conclusionColor};"></div>
                    <span style="color:${conclusionColor}; font-weight:bold;">${conclusionLabel}</span>
                </div>
                <div class="detail-text" style="border-color:${conclusionColor};">${mission.conclusionText || ""}</div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="document.getElementById('historyDetailModal').remove()">FECHAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// ===== FLUXO DE FINALIZAÇÃO =====

window.MissionSystem.promptFinalize = function(missionId) {
    let modal = document.getElementById('confirmFinalizeModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'confirmFinalizeModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '17000';
    modal.innerHTML = `
        <div class="modal-content modal-mini" style="max-width:400px; text-align:center;">
            <h3 style="margin-top:0; color:#f1c40f;">Finalizar Missão</h3>
            <p style="color:#aaa; font-size:0.9rem; margin:15px 0;">Tem certeza que deseja finalizar esta missão? Ela será removida das missões ativas e enviada para o histórico.</p>
            <div class="modal-footer" style="justify-content:center; gap:12px;">
                <button class="btn-cancel" onclick="document.getElementById('confirmFinalizeModal').remove()">CANCELAR</button>
                <button class="btn-save" onclick="window.MissionSystem.openFinalizeModal('${missionId}')">CONFIRMAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.MissionSystem.openFinalizeModal = function(missionId) {
    // Fechar modal de confirmação
    const confirmModal = document.getElementById('confirmFinalizeModal');
    if (confirmModal) confirmModal.remove();

    // Buscar dados da missão
    const mission = this.missions.find(m => m.id === missionId);
    if (!mission) return;

    const color = mission.type === 'primary' ? '#ff4444' : mission.type === 'base' ? '#53A0D4' : '#f1c40f';

    let modal = document.getElementById('finalizeMissionModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'finalizeMissionModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '17000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px;">
            <h3 style="margin-top:0; color:${color};">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:8px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${mission.name}
            </h3>
            <div class="mission-form">
                <label style="font-size:0.75rem; color:#888; text-transform:uppercase;">Conclusão da Missão *</label>
                <textarea id="finalize-conclusion-text" placeholder="Descreva como a missão foi concluída..." style="height:100px;"></textarea>
                <label style="font-size:0.75rem; color:#888; text-transform:uppercase;">Resultado</label>
                <select id="finalize-conclusion-type">
                    <option value="concluido">✅ Concluído</option>
                    <option value="falha">❌ Falha</option>
                    <option value="neutro">⚪ Neutro</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="document.getElementById('finalizeMissionModal').remove()">CANCELAR</button>
                <button class="btn-save" onclick="window.MissionSystem.executeFinalize('${missionId}')">FINALIZAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.MissionSystem.executeFinalize = async function(missionId) {
    const conclusionText = document.getElementById('finalize-conclusion-text').value.trim();
    const conclusion = document.getElementById('finalize-conclusion-type').value;

    if (!conclusionText) {
        if (window.showToast) window.showToast('Preencha a conclusão da missão!', true);
        return;
    }

    const mission = this.missions.find(m => m.id === missionId);
    if (!mission) return;

    // Montar objeto do histórico (missão completa + dados de conclusão)
    const historyEntry = {
        ...mission,
        conclusion: conclusion,
        conclusionText: conclusionText,
        finalizedAt: new Date().toISOString()
    };

    try {
        // 1. Salvar no histórico
        await OrdemMissions.archiveMission(historyEntry);
        // 2. Remover das missões ativas
        await OrdemMissions.deleteMission(missionId);

        // Fechar modais e atualizar
        const modal = document.getElementById('finalizeMissionModal');
        if (modal) modal.remove();

        // Fechar overlay de detalhes
        this.closeDetails();

        if (window.showToast) window.showToast('Missão finalizada e arquivada!');

        // Recarregar dados
        await this.load();
        if (this.renderList) this.renderList('mission-content-area');
        if (this.renderGlobeMarkers) this.renderGlobeMarkers();
    } catch (e) {
        console.error('Erro ao finalizar missão:', e);
        if (window.showToast) window.showToast('Erro ao finalizar missão!', true);
    }
};
