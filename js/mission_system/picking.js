window.MissionSystem = window.MissionSystem || {};

window.MissionSystem.startPickingMode = function(callback) {
    if (!window.GlobeEngine) return;

    this.isPicking = true;

    // Esconder UI
    if (window.toggleSidebar) window.toggleSidebar(false);
    if (window.closeModal) { window.closeModal('missionModal'); window.closeModal('editMissionModal'); }
    const header = document.querySelector('.header-row');
    const trigger = document.querySelector('.mission-trigger');
    if (header) header.style.opacity = '0';
    if (trigger) trigger.style.opacity = '0';

    const actionBar = document.getElementById('picking-actions');
    if (actionBar) actionBar.style.display = 'flex';

    // Ativar modo picking no globo
    window.GlobeEngine.setPickingMode(true, (coords) => {
        this.lastPickLng = coords.lng;
        this.lastPickLat = coords.lat;
        console.log(`PICK (GLOBO): Lng=${coords.lng.toFixed(4)}, Lat=${coords.lat.toFixed(4)}`);
    });

    // Botões
    window.confirmPick = () => {
        this.isPicking = false;
        window.GlobeEngine.setPickingMode(false);
        cleanup(true, { lng: this.lastPickLng, lat: this.lastPickLat });
    };

    window.cancelPick = () => {
        this.isPicking = false;
        window.GlobeEngine.setPickingMode(false);
        cleanup(false);
    };

    const cleanup = (success, coords) => {
        if (actionBar) actionBar.style.display = 'none';
        if (header) header.style.opacity = '1';
        if (trigger) trigger.style.opacity = '1';

        if (window.isEditingMode) {
            const editModal = document.getElementById('editMissionModal');
            if (editModal) {
                editModal.style.display = 'flex';
                if (success && coords) {
                    document.getElementById('edit-m-lng').value = coords.lng.toFixed(4);
                    document.getElementById('edit-m-lat').value = coords.lat.toFixed(4);
                }
            }
        } else {
            if (window.openMissionCreateModal) {
                window.openMissionCreateModal();
                if (success && coords) {
                    document.getElementById('m-lng').value = coords.lng.toFixed(4);
                    document.getElementById('m-lat').value = coords.lat.toFixed(4);
                }
            }
        }
        if (success && callback) callback(coords);
    };
};
