window.MissionSystem = window.MissionSystem || {};

window.MissionSystem.isOrganizeMode = false;

window.MissionSystem.toggleOrganizeMode = function() {
    if (this.isOrganizeMode) {
        this.isOrganizeMode = false;
        this.saveOrganizeMode();
        const icon = document.getElementById('organize-icon');
        if (icon) {
            icon.innerHTML = '';
            icon.setAttribute('data-icon', 'organize');
        }
        if (window.renderIcons) window.renderIcons();
        if (this.renderList) this.renderList('mission-content-area');
    } else {
        this.isOrganizeMode = true;
        const icon = document.getElementById('organize-icon');
        if (icon) {
            icon.innerHTML = '';
            icon.setAttribute('data-icon', 'check');
        }
        if (window.renderIcons) window.renderIcons();
        if (this.renderList) this.renderList('mission-content-area');
    }
};

window.MissionSystem.moveMission = function(index, direction) {
    const list = this.getFilteredMissions();
    if (index + direction < 0 || index + direction >= list.length) return;
    
    const filter = this.currentFilter || 'all';
    const newOrder = list.map(m => m.id);
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + direction];
    newOrder[index + direction] = temp;
    
    if (!this.customOrders) this.customOrders = {};
    this.customOrders[filter] = newOrder;
    this.saveOrganizeMode(true);
    
    if (this.renderList) this.renderList('mission-content-area');
};

window.MissionSystem.saveOrganizeMode = async function(silent) {
    const userId = this.userPermissions ? this.userPermissions.userId : null;
    if (!userId) { console.error('saveOrganizeMode: sem userId'); return; }
    
    const filter = this.currentFilter || 'all';
    const order = this.customOrders ? (this.customOrders[filter] || []) : [];
    
    try {
        const orders = this.customOrders || {};
        await OrdemDB.updateAccount(userId, { missionOrders: orders });
        if (!silent && window.showToast) window.showToast('Ordem salva com sucesso!');
    } catch (e) {
        console.error('saveOrganizeMode: Erro:', e);
        if (!silent && window.showToast) window.showToast('Erro ao salvar ordem!', true);
    }
};

window.MissionSystem.updateNotificationDot = function() {
    const filtered = this.getFilteredMissions();
    let unseenCount = 0;
    filtered.forEach(m => {
        const isViewed = (m.viewedBy || []).includes(this.userPermissions.userId);
        if (!isViewed) unseenCount++;
    });

    const triggerBtn = document.querySelector('.mission-trigger');
    if (triggerBtn) {
        let dot = triggerBtn.querySelector('.notification-dot');
        if (unseenCount > 0) {
            if (!dot) {
                dot = document.createElement('div');
                dot.className = 'notification-dot';
                triggerBtn.appendChild(dot);
            }
        } else {
            if (dot) dot.remove();
        }
    }
    return unseenCount;
};

window.MissionSystem.renderList = function(containerId) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;

    let scrollBox = document.getElementById('mission-scroll-box');
    let savedScrollTop = 0;

    if (!scrollBox) {
        listContainer.innerHTML = `<div class="mission-container"><div id="mission-scroll-box"></div></div>`;
        scrollBox = document.getElementById('mission-scroll-box');
    } else {
        savedScrollTop = scrollBox.scrollTop;
        scrollBox.innerHTML = '';
    }

    const filtered = this.getFilteredMissions();
    let unseenCount = 0;

    if (filtered.length === 0) {
        scrollBox.innerHTML = '<p style="color:#666; text-align:center; padding:30px;">Sem missões nesta categoria.</p>';
    } else {
        filtered.forEach((m, index) => {
            const color = m.type === 'primary' ? '#ff4444' : m.type === 'base' ? '#53A0D4' : '#f1c40f';
            const label = m.type === 'primary' ? 'PRINCIPAL' : m.type === 'base' ? 'BASE' : 'SECUNDÁRIA';
            
            const isViewed = (m.viewedBy || []).includes(this.userPermissions.userId);
            let isNewHtml = '';
            if (!isViewed) {
                isNewHtml = `<div class="mission-rect-new-tag">NOVO</div>`;
                if (!this.isOrganizeMode) unseenCount++;
            }
            
            let neonClass = '';
            let diffDays = null;
            if (m.endDate && this.gameDate) {
                const dEnd = new Date(m.endDate);
                const dCurrent = new Date(this.gameDate);
                
                const diffTime = dEnd.getTime() - dCurrent.getTime();
                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 1) {
                    neonClass = 'neon-critical';
                } else if (diffDays <= 5) {
                    neonClass = 'neon-warning';
                }
            }

            let daysHtml = '';
            if (m.endDate && diffDays !== null) {
                let boxStyle = "background: rgba(0,0,0,0.7); border: 1px solid #444; color: #ddd;";
                let text = `<b>${diffDays}</b> dias restantes`;
                
                if (diffDays < 0) {
                    boxStyle = "background: rgba(255,68,68,0.2); border: 1px solid #ff4444; color: #ff4444;";
                    text = "<b>EXPIRADA</b>";
                } else if (diffDays === 0) {
                    boxStyle = "background: rgba(241,196,15,0.2); border: 1px solid #f1c40f; color: #f1c40f;";
                    text = "<b>HOJE</b>";
                }

                daysHtml = `
                    <div class="mission-rect-days" style="position: absolute; bottom: 12px; left: 15px; ${boxStyle} border-radius: 6px; padding: 4px 8px; font-size: 0.70rem; display: flex; align-items: center; gap: 5px; z-index: 5;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${text}
                    </div>
                `;
            }

            // Badge de cargo para missões individuais
            let roleBadgeHtml = '';
            const acc = m.accessType || 'all';
            if ((acc === 'individual' || m.originalAccessType === 'individual') && m.allowedRoles && m.allowedRoles.length > 0) {
                const roleId = m.allowedRoles[0];
                const roleData = this.allRolesCache ? this.allRolesCache.find(r => r.id === roleId) : null;
                const roleName = roleData ? roleData.name : roleId;
                const roleColor = roleData ? roleData.color : '#888';
                roleBadgeHtml = `
                    <div class="mission-rect-role" style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.6); border:1px solid ${roleColor}; color:${roleColor}; font-size:0.6rem; padding:2px 7px; border-radius:4px; font-weight:bold; z-index:5; text-transform:uppercase;">
                        ${roleName}
                    </div>
                `;
            }

            let arrowsHtml = '';
            if (this.isOrganizeMode) {
                arrowsHtml = `
                    <div style="position: absolute; right: 10px; bottom: 10px; display:flex; flex-direction:row; gap:8px; z-index:10; background: rgba(0,0,0,0.4); padding: 5px; border-radius: 8px;">
                        <button class="btn-org-arrow" onclick="event.stopPropagation(); window.MissionSystem.moveMission(${index}, -1)" title="Subir">
                           <span data-icon="arrow_down" style="display:inline-block; transform:rotate(180deg); opacity: 0.8;"></span>
                        </button>
                        <button class="btn-org-arrow" onclick="event.stopPropagation(); window.MissionSystem.moveMission(${index}, 1)" title="Descer">
                           <span data-icon="arrow_down" style="opacity: 0.8;"></span>
                        </button>
                    </div>
                `;
            }

            const rect = document.createElement('div');
            rect.className = `mission-rect ${neonClass}`;
            rect.style.borderLeftColor = color;
            
            if (m.coverImage) {
                let [px, py] = (m.coverPos || "50,50").split(',').map(Number);
                if (isNaN(px)) px = 50; if (isNaN(py)) py = 50;
                rect.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%), url(${m.coverImage})`;
                rect.style.backgroundSize = 'cover';
                rect.style.backgroundPosition = `${px}% ${py}%`;
            }
            
            rect.innerHTML = `
                <div class="mission-rect-type" style="color:${color}; border-color:${color};">${label}</div>
                ${isNewHtml}
                <div class="mission-rect-name">${m.name}</div>
                ${daysHtml}
                ${roleBadgeHtml}
                ${arrowsHtml}
            `;
            
            if (!this.isOrganizeMode) {
                rect.onclick = () => {
                    const isViewedOnClick = (m.viewedBy || []).includes(this.userPermissions.userId);
                    if (!isViewedOnClick) {
                        if(!m.viewedBy) m.viewedBy = [];
                        m.viewedBy.push(this.userPermissions.userId);

                        // Salva viewedBy no Firebase
                        OrdemMissions.getMissions().then(missions => {
                            const mi = missions.findIndex(x => x && x.id === m.id);
                            if (mi >= 0) {
                                missions[mi].viewedBy = m.viewedBy;
                                OrdemMissions.setMissions(missions);
                            }
                        }).catch(e => console.error("Erro marcando view", e));

                        const tag = rect.querySelector('.mission-rect-new-tag');
                        if (tag) tag.remove();
                        
                        const triggerBtn = document.querySelector('.mission-trigger');
                        if (triggerBtn) {
                            unseenCount--;
                            if (unseenCount <= 0) {
                                const dot = triggerBtn.querySelector('.notification-dot');
                                if (dot) dot.remove();
                            }
                        }
                    }
                    this.showDetails(m);
                    if (window.GlobeEngine) {
                        const parsedLng = parseFloat(m.lng) || 0;
                        const parsedLat = parseFloat(m.lat) || 0;
                        if (!(parsedLng === 0 && parsedLat === 0)) {
                            window.GlobeEngine.flyTo(parsedLng, parsedLat);
                        }
                    }
                };
            } else {
                rect.style.cursor = 'default';
            }
            scrollBox.appendChild(rect);
        });
    }

    const triggerBtn = document.querySelector('.mission-trigger');
    if (triggerBtn) {
        let dot = triggerBtn.querySelector('.notification-dot');
        if (unseenCount > 0) {
            if (!dot) {
                dot = document.createElement('div');
                dot.className = 'notification-dot';
                triggerBtn.appendChild(dot);
            }
        } else {
            if (dot) dot.remove();
        }
    }

    if (window.renderIcons) window.renderIcons();
    this.createOverlay();
    
    scrollBox.scrollTop = savedScrollTop;
};

window.MissionSystem.createOverlay = function() {
    if (document.getElementById('mission-details-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'mission-details-overlay';
    overlay.className = 'mission-details-overlay';
    overlay.innerHTML = `
        <div class="details-header">
            <button class="details-btn" onclick="window.MissionSystem.closeDetails()" title="Voltar"><span data-icon="arrow_left"></span></button>
            <span id="details-title-text" class="details-title"></span>
            <button class="details-btn" id="btn-edit-mission" style="display:none;" title="Editar"><span data-icon="edit"></span></button>
        </div>
        <div id="details-content" class="mission-details-body"></div>
    `;
    const sidebar = document.getElementById('mission-sidebar');
    if (sidebar) sidebar.appendChild(overlay);
    if (window.renderIcons) window.renderIcons();
};

window.MissionSystem.showDetails = function(mission) {
    const overlay = document.getElementById('mission-details-overlay');
    const content = document.getElementById('details-content');
    const titleText = document.getElementById('details-title-text');
    const header = overlay.querySelector('.details-header');
    const editBtn = document.getElementById('btn-edit-mission');
    if (!overlay || !content || !header) return;

    if (mission.coverImage) {
        let [px, py] = (mission.coverPos || "50,50").split(',').map(Number);
        if (isNaN(px)) px = 50; if (isNaN(py)) py = 50;
        header.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.9) 100%), url(${mission.coverImage})`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = `${px}% ${py}%`;
        header.style.borderBottom = 'none';
        header.style.paddingTop = '80px';
    } else {
        header.style.backgroundImage = '';
        header.style.borderBottom = '1px solid #333';
        header.style.paddingTop = '20px';
    }

    const color = mission.type === 'primary' ? '#ff4444' : mission.type === 'base' ? '#53A0D4' : '#f1c40f';
    const label = mission.type === 'primary' ? 'PRINCIPAL' : mission.type === 'base' ? 'BASE' : 'SECUNDÁRIA';

    titleText.innerText = mission.name;
    titleText.style.color = color;

    let validadeText = '';
    if (mission.endDate) {
        const parts = mission.endDate.split('-');
        const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : mission.endDate;
        validadeText = `
            <span class="detail-label" style="margin-top:15px; color:#f1c40f;">Término da Missão</span>
            <div style="font-family:monospace; color:#ccc; font-weight:bold;">${formatted}</div>
        `;
    }

    // Badge de cargo dentro dos detalhes (individual)
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

    // Botão Tornar Público / Tornar Individual
    let toggleAccessHtml = '';
    const isAdmin = window.isAdminUser;
    const isOwner = mission.allowedUsers && mission.allowedUsers.includes(this.userPermissions.userId);
    const hasRole = mission.allowedRoles && mission.allowedRoles.some(r => this.userPermissions.roles.includes(r));

    if (acc === 'individual' && (isOwner || hasRole || isAdmin)) {
        toggleAccessHtml = `
            <div style="margin-top:30px; padding-top:20px; border-top:1px solid #333;">
                <button onclick="window.MissionSystem.confirmToggleAccess('${mission.id}', 'all')" 
                    style="width:100%; padding:12px; background:rgba(0,255,136,0.1); border:1px solid var(--accent-color); color:var(--accent-color); border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; transition:0.2s;"
                    onmouseover="this.style.background='rgba(0,255,136,0.2)'" onmouseout="this.style.background='rgba(0,255,136,0.1)'">
                    Tornar Público
                </button>
            </div>
        `;
    } else if (acc === 'all' && mission.originalAccessType === 'individual' && (isOwner || hasRole || isAdmin)) {
        toggleAccessHtml = `
            <div style="margin-top:30px; padding-top:20px; border-top:1px solid #333;">
                <button onclick="window.MissionSystem.confirmToggleAccess('${mission.id}', 'individual')"
                    style="width:100%; padding:12px; background:rgba(255,68,68,0.1); border:1px solid #ff4444; color:#ff4444; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.85rem; transition:0.2s;"
                    onmouseover="this.style.background='rgba(255,68,68,0.2)'" onmouseout="this.style.background='rgba(255,68,68,0.1)'">
                    Tornar Individual
                </button>
            </div>
        `;
    }
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
            <div>
                <span class="detail-label">Prioridade</span>
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
        ${validadeText}
        ${toggleAccessHtml}
    `;
    if (window.isAdminUser) {
        editBtn.style.display = 'flex';
        editBtn.onclick = () => this.openEditModal(mission);
    } else { editBtn.style.display = 'none'; }

    if (window.renderIcons) window.renderIcons();
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
};

// Modal de confirmação para trocar acesso
window.MissionSystem.confirmToggleAccess = function(missionId, newAccess) {
    const label = newAccess === 'all' ? 'Público' : 'Individual';
    const msg = newAccess === 'all' 
        ? 'Tem certeza que deseja tornar esta missão pública? Todos poderão vê-la.'
        : 'Tem certeza que deseja tornar esta missão individual novamente?';

    // Criar modal de confirmação
    let modal = document.getElementById('confirm-access-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'confirm-access-modal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px; text-align:center;">
            <h3 style="margin-top:0; color:#fff;">Tornar ${label}</h3>
            <p style="color:#aaa; font-size:0.9rem; margin:15px 0;">${msg}</p>
            <div class="modal-footer" style="justify-content:center; gap:12px;">
                <button class="btn-cancel" onclick="document.getElementById('confirm-access-modal').remove()">CANCELAR</button>
                <button class="btn-save" onclick="window.MissionSystem.executeToggleAccess('${missionId}', '${newAccess}')">CONFIRMAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.MissionSystem.executeToggleAccess = async function(missionId, newAccess) {
    const userId = this.userPermissions ? this.userPermissions.userId : localStorage.getItem('user_id');
    try {
        let missions = await OrdemMissions.getMissions();
        const mIdx = missions.findIndex(x => x && x.id === missionId);
        if (mIdx >= 0) {
            if (newAccess === 'all' && missions[mIdx].accessType === 'individual') {
                missions[mIdx].originalAccessType = 'individual';
            }
            missions[mIdx].accessType = newAccess;
            await OrdemMissions.setMissions(missions);
        }
        if (true) {
            // Atualizar missão local
            const m = this.missions.find(x => x.id === missionId);
            if (m) {
                if (newAccess === 'all' && m.accessType === 'individual') {
                    m.originalAccessType = 'individual';
                }
                m.accessType = newAccess;
            }
            const modal = document.getElementById('confirm-access-modal');
            if (modal) modal.remove();
            
            if (window.showToast) window.showToast(newAccess === 'all' ? 'Missão tornada pública!' : 'Missão tornada individual!', 'success');
            this.closeDetails();
            if (this.renderList) this.renderList('mission-content-area');
            if (this.renderGlobeMarkers) this.renderGlobeMarkers();
        } else {
            if (window.showToast) window.showToast('Erro ao alterar acesso!', 'error');
        }
    } catch (e) {
        console.error(e);
        if (window.showToast) window.showToast('Erro de conexão!', 'error');
    }
};

window.MissionSystem.closeDetails = function() {
    const overlay = document.getElementById('mission-details-overlay');
    if (overlay) overlay.classList.remove('active');
    if (window.GlobeEngine && window.GlobeEngine.resetFocus) {
        window.GlobeEngine.resetFocus();
    }
};

window.MissionSystem.openEditModal = function(mission) {
    document.getElementById('edit-m-id').value = mission.id;
    document.getElementById('edit-m-name').value = mission.name;
    document.getElementById('edit-m-desc').value = mission.description;
    document.getElementById('edit-m-location-name').value = mission.locationName || "";
    document.getElementById('edit-m-type').value = mission.type;
    document.getElementById('edit-m-icon').value = mission.icon;
    document.getElementById('edit-m-lng').value = mission.lng || 0;
    document.getElementById('edit-m-lat').value = mission.lat || 0;
    
    const elEndDate = document.getElementById('edit-m-endDate');
    if (elEndDate) elEndDate.value = mission.endDate || "";
    
    const accType = mission.accessType || 'all';
    const elAcc = document.getElementById('edit-m-accessType');
    if (elAcc) elAcc.value = accType;
    
    if (window.MissionCover) window.MissionCover.populateEditModal(mission);
    
    this.tempAllowedRoles = mission.allowedRoles || [];
    this.tempAllowedUsers = mission.allowedUsers || [];
    
    if(this.updatePermSummary) this.updatePermSummary('edit-m');
    if(this.togglePermUI) this.togglePermUI(accType, 'edit-m');

    const modal = document.getElementById('editMissionModal');
    if (modal) { modal.style.display = 'flex'; if (window.renderIcons) window.renderIcons(); }
};
