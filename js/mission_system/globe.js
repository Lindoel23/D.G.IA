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

    window.GlobeEngine.setMarkers(markerList);
};
