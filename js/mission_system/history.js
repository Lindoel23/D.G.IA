/* --- js/mission_system/history.js --- */
/* Módulo de Histórico de Missões — Finalização, Arquivo e Globo */

window.MissionSystem = window.MissionSystem || {};

// Flag interna: indica se o histórico está aberto (para controlar o globo)
window.MissionSystem._historyOpen = false;

// ===== ABRIR / FECHAR SIDEBAR DE HISTÓRICO =====

window.MissionSystem.openHistory = async function() {
    this._historyOpen = true;
    await this.loadHistory();
    const overlay = document.getElementById('history-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
    this.renderHistory();
    this.renderHistoryGlobeMarkers();
    this.updateHistoryNotificationDot();
};

window.MissionSystem.closeHistory = function() {
    this._historyOpen = false;
    const overlay = document.getElementById('history-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }
    // Restaurar marcadores ativos no globo
    if (this.renderGlobeMarkers) this.renderGlobeMarkers();
};

// ===== MARCADORES DO HISTÓRICO NO GLOBO =====

window.MissionSystem.renderHistoryGlobeMarkers = function() {
    if (!window.GlobeEngine) return;

    const conclusionColors = { concluido: '#00ff88', falha: '#ff4444', neutro: '#888' };
    const filteredIds = this.getFilteredHistory().map(m => m.id);

    const markerList = this.history
        .filter(m => !(parseFloat(m.lng) === 0 && parseFloat(m.lat) === 0))
        .map(m => {
            const isVis = filteredIds.includes(m.id);
            return {
                id: m.id,
                name: m.name,
                coords: [parseFloat(m.lng), parseFloat(m.lat)],
                color: conclusionColors[m.conclusion] || '#888',
                missionData: m,
                targetOpacity: isVis ? 1 : 0,
                onClick: (marker) => {
                    if (!isVis) return;
                    this.showHistoryDetails(marker.missionData);
                    window.GlobeEngine.flyTo(marker.coords[0], marker.coords[1]);
                }
            };
        });

    window.GlobeEngine.setMarkers(markerList);
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
    this.renderHistoryGlobeMarkers();
};

window.MissionSystem.getFilteredHistory = function() {
    const isAdmin = this.userPermissions.roles.includes('admin') || this.userPermissions.roles.includes('my_love');

    let filtered = this.history.filter(m => {
        const acc = m.accessType || 'all';
        if (acc === 'individual' && !isAdmin) {
            const reqRoles = m.allowedRoles || [];
            const reqUsers = m.allowedUsers || [];
            const hasRole = reqRoles.some(r => this.userPermissions.roles.includes(r));
            const hasUser = reqUsers.includes(this.userPermissions.userId);
            if (!hasRole && !hasUser) return false;
        }
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

        // Tag NOVO
        const isViewed = (m.viewedBy || []).includes(this.userPermissions.userId);
        let isNewHtml = '';
        if (!isViewed) {
            isNewHtml = `<div class="mission-rect-new-tag">NOVO</div>`;
        }

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
            ${isNewHtml}
            <div class="history-conclusion-tag" style="background:rgba(0,0,0,0.6); border:1px solid ${borderColor}; color:${borderColor};">${conclusionLabel}</div>
            <div class="mission-rect-name">${m.name}</div>
            ${roleBadgeHtml}
        `;

        rect.onclick = () => {
            // Marcar como visto
            if (!isViewed) {
                if (!m.viewedBy) m.viewedBy = [];
                m.viewedBy.push(this.userPermissions.userId);
                dbRef(`missionHistory/${m.id}/viewedBy`).set(m.viewedBy).catch(e => console.error('Erro viewedBy hist:', e));
                const tag = rect.querySelector('.mission-rect-new-tag');
                if (tag) tag.remove();
                this.updateHistoryNotificationDot();
            }
            this.showHistoryDetails(m);
            if (window.GlobeEngine) {
                const parsedLng = parseFloat(m.lng) || 0;
                const parsedLat = parseFloat(m.lat) || 0;
                if (!(parsedLng === 0 && parsedLat === 0)) {
                    window.GlobeEngine.flyTo(parsedLng, parsedLat);
                }
            }
        };
        scrollBox.appendChild(rect);
    });

    this.updateHistoryNotificationDot();
};

// ===== NOTIFICAÇÃO DE HISTÓRICO NÃO VISTO =====

window.MissionSystem.updateHistoryNotificationDot = function() {
    const visible = this.getFilteredHistory();
    let unseenCount = 0;
    visible.forEach(m => {
        if (!(m.viewedBy || []).includes(this.userPermissions.userId)) unseenCount++;
    });

    // Bolinha no botão do relógio (histórico)
    const clockBtn = document.getElementById('btn-history-missions');
    if (clockBtn) {
        let dot = clockBtn.querySelector('.notification-dot');
        if (unseenCount > 0) {
            if (!dot) {
                dot = document.createElement('div');
                dot.className = 'notification-dot';
                clockBtn.appendChild(dot);
            }
        } else {
            if (dot) dot.remove();
        }
    }

    // Bolinha no botão de missão (trigger lateral)
    const triggerBtn = document.querySelector('.mission-trigger');
    if (triggerBtn) {
        let dot = triggerBtn.querySelector('.history-notification-dot');
        if (unseenCount > 0) {
            if (!dot) {
                dot = document.createElement('div');
                dot.className = 'notification-dot history-notification-dot';
                dot.style.top = 'auto';
                dot.style.bottom = '5px';
                dot.style.background = '#f1c40f';
                dot.style.boxShadow = '0 0 8px #f1c40f';
                triggerBtn.appendChild(dot);
            }
        } else {
            if (dot) dot.remove();
        }
    }
};

// ===== DETALHE DO HISTÓRICO =====

window.MissionSystem.showHistoryDetails = function(mission) {
    const conclusionColors = { concluido: '#00ff88', falha: '#ff4444', neutro: '#888' };
    const conclusionLabels = { concluido: 'Concluído', falha: 'Falha', neutro: 'Neutro' };
    const color = mission.type === 'primary' ? '#ff4444' : mission.type === 'base' ? '#53A0D4' : '#f1c40f';
    const label = mission.type === 'primary' ? 'PRINCIPAL' : mission.type === 'base' ? 'BASE' : 'SECUNDÁRIA';
    const conclusionColor = conclusionColors[mission.conclusion] || '#888';
    const conclusionLabel = conclusionLabels[mission.conclusion] || 'Neutro';

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

    // Texto de conclusão (pode estar vazio)
    let conclusionTextHtml = '';
    if (mission.conclusionText) {
        conclusionTextHtml = `<div class="detail-text" style="border-color:${conclusionColor};">${mission.conclusionText}</div>`;
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
                ${conclusionTextHtml}
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="document.getElementById('historyDetailModal').remove()">FECHAR</button>
                <button class="btn-save" onclick="document.getElementById('historyDetailModal').remove(); window.MissionSystem.openHistoryEdit('${mission.id}')" style="display:flex; align-items:center; gap:6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    EDITAR
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// ===== EDIÇÃO DO HISTÓRICO (Admin vs User) =====

window.MissionSystem.openHistoryEdit = function(missionId) {
    const mission = this.history.find(m => m.id === missionId);
    if (!mission) return;

    const isAdmin = this.userPermissions.roles.includes('admin') || this.userPermissions.roles.includes('my_love');
    const color = mission.type === 'primary' ? '#ff4444' : mission.type === 'base' ? '#53A0D4' : '#f1c40f';

    let modal = document.getElementById('historyEditModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'historyEditModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '17000';

    let formHtml = '';

    if (isAdmin) {
        // ADMIN: Vê tudo editável
        formHtml = `
            <div class="mission-form">
                <input type="text" id="hedit-name" value="${mission.name || ''}" placeholder="Nome da Missão">
                <textarea id="hedit-desc" placeholder="Descrição...">${mission.description || ''}</textarea>
                <input type="text" id="hedit-location" value="${mission.locationName || ''}" placeholder="Localização">
                <label style="font-size:0.75rem; color:#888; text-transform:uppercase; margin-top:5px;">Conclusão da Missão</label>
                <textarea id="hedit-conclusion-text" placeholder="Descreva a conclusão..." style="height:80px;">${mission.conclusionText || ''}</textarea>
                <label style="font-size:0.75rem; color:#888; text-transform:uppercase;">Resultado</label>
                <select id="hedit-conclusion-type">
                    <option value="concluido" ${mission.conclusion === 'concluido' ? 'selected' : ''}>✅ Concluído</option>
                    <option value="falha" ${mission.conclusion === 'falha' ? 'selected' : ''}>❌ Falha</option>
                    <option value="neutro" ${mission.conclusion === 'neutro' ? 'selected' : ''}>⚪ Neutro</option>
                </select>
            </div>
        `;
    } else {
        // USUÁRIO COMUM: Só vê a conclusão da missão
        formHtml = `
            <div class="mission-form">
                <label style="font-size:0.75rem; color:#888; text-transform:uppercase;">Conclusão da Missão</label>
                <textarea id="hedit-conclusion-text" placeholder="Descreva a conclusão..." style="height:100px;">${mission.conclusionText || ''}</textarea>
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px;">
            <h3 style="margin-top:0; color:${color};">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:8px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Editar — ${mission.name}
            </h3>
            ${formHtml}
            <div class="modal-footer">
                <button class="btn-cancel" onclick="document.getElementById('historyEditModal').remove()">CANCELAR</button>
                <button class="btn-save" onclick="window.MissionSystem.saveHistoryEdit('${missionId}', ${isAdmin})">SALVAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.MissionSystem.saveHistoryEdit = async function(missionId, isAdmin) {
    const changes = {};

    if (isAdmin) {
        const name = document.getElementById('hedit-name').value.trim();
        if (!name) { if (window.showToast) window.showToast('Preencha o nome!', true); return; }
        changes.name = name;
        changes.description = document.getElementById('hedit-desc').value;
        changes.locationName = document.getElementById('hedit-location').value;
        changes.conclusionText = document.getElementById('hedit-conclusion-text').value;
        changes.conclusion = document.getElementById('hedit-conclusion-type').value;
    } else {
        changes.conclusionText = document.getElementById('hedit-conclusion-text').value;
    }

    try {
        await dbRef(`missionHistory/${missionId}`).update(changes);

        const modal = document.getElementById('historyEditModal');
        if (modal) modal.remove();

        // Fechar detalhe se estiver aberto
        const detailModal = document.getElementById('historyDetailModal');
        if (detailModal) detailModal.remove();

        if (window.showToast) window.showToast('Histórico atualizado!');

        // Recarregar
        await this.loadHistory();
        this.renderHistory();
        this.renderHistoryGlobeMarkers();
    } catch (e) {
        console.error('Erro ao salvar edição do histórico:', e);
        if (window.showToast) window.showToast('Erro ao salvar!', true);
    }
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
    const confirmModal = document.getElementById('confirmFinalizeModal');
    if (confirmModal) confirmModal.remove();

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
                <label style="font-size:0.75rem; color:#888; text-transform:uppercase;">Conclusão da Missão (Opcional)</label>
                <textarea id="finalize-conclusion-text" placeholder="Descreva como a missão foi concluída..." style="height:100px;"></textarea>
                <label style="font-size:0.75rem; color:#888; text-transform:uppercase;">Resultado *</label>
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

    const mission = this.missions.find(m => m.id === missionId);
    if (!mission) return;

    const historyEntry = {
        ...mission,
        conclusion: conclusion,
        conclusionText: conclusionText,
        finalizedAt: new Date().toISOString()
    };

    try {
        await OrdemMissions.archiveMission(historyEntry);
        await OrdemMissions.deleteMission(missionId);

        const modal = document.getElementById('finalizeMissionModal');
        if (modal) modal.remove();

        this.closeDetails();

        if (window.showToast) window.showToast('Missão finalizada e arquivada!');

        await this.load();
        if (this.renderList) this.renderList('mission-content-area');
        if (this.renderGlobeMarkers) this.renderGlobeMarkers();
    } catch (e) {
        console.error('Erro ao finalizar missão:', e);
        if (window.showToast) window.showToast('Erro ao finalizar missão!', true);
    }
};
