window.MissionSystem = window.MissionSystem || {};

window.MissionSystem.renderGlobeMarkers = function() {
    if (!window.GlobeEngine) return;
    
    const filteredIds = this.getFilteredMissions().map(m => m.id);
    const markerList = this.missions
        .filter(m => !(parseFloat(m.lng) === 0 && parseFloat(m.lat) === 0))
        .map(m => {
            const isVis = filteredIds.includes(m.id);
            return {
                id: m.id,
                name: m.name,
                coords: [parseFloat(m.lng), parseFloat(m.lat)],
                color: m.type === 'primary' ? '#ff4444' : m.type === 'base' ? '#53A0D4' : '#f1c40f',
                missionData: m,
                targetOpacity: isVis ? 1 : 0,
                onClick: (marker) => {
                    if (this.isPicking) return;
                    if (!isVis) return;
                    if (typeof toggleSidebar === 'function') toggleSidebar(true);
                    if (this.showDetails) this.showDetails(marker.missionData);
                    window.GlobeEngine.flyTo(marker.coords[0], marker.coords[1]);
                }
            };
        });

    // Inclui marcadores do histórico com opacidade 0 para fade-out suave
    const conclusionColors = { concluido: '#00ff88', falha: '#ff4444', neutro: '#888' };
    if (this.history && this.history.length > 0) {
        this.history
            .filter(m => !(parseFloat(m.lng) === 0 && parseFloat(m.lat) === 0))
            .forEach(m => {
                markerList.push({
                    id: m.id,
                    name: m.name,
                    coords: [parseFloat(m.lng), parseFloat(m.lat)],
                    color: conclusionColors[m.conclusion] || '#888',
                    missionData: m,
                    targetOpacity: 0,
                    onClick: () => {}
                });
            });
    }

    window.GlobeEngine.setMarkers(markerList);
};
