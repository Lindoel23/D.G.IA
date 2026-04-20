window.MissionSystem = window.MissionSystem || {};

window.MissionSystem.applyFilter = function(type) {
    this.currentFilter = type;
    const textMap = { 'all': 'todas', 'public': 'público', 'individual': 'individual', 'local': 'local' };
    document.querySelectorAll('.filter-btn').forEach(b => {
         b.classList.toggle('active', b.textContent.toLowerCase().trim() === textMap[type]);
    });
    if(this.renderGlobeMarkers) this.renderGlobeMarkers();
    const scrollBox = document.getElementById('mission-scroll-box');
    if (scrollBox) scrollBox.scrollTop = 0;
    if (scrollBox && this.renderList) this.renderList('mission-content-area');
};

window.MissionSystem.getFilteredMissions = function() {
    let filtered = this.missions.filter(m => {
        const acc = m.accessType || 'all';
        const isAdmin = this.userPermissions.roles.includes('admin') || this.userPermissions.roles.includes('my_love');

        if (acc === 'individual' && !isAdmin) {
            const reqRoles = m.allowedRoles || [];
            const reqUsers = m.allowedUsers || [];
            const hasRole = reqRoles.some(r => this.userPermissions.roles.includes(r));
            const hasUser = reqUsers.includes(this.userPermissions.userId);
            if (!hasRole && !hasUser) return false;
        }

        if (this.currentFilter === 'all') return true;
        if (this.currentFilter === 'public') return acc === 'all';
        if (this.currentFilter === 'local') return acc === 'local';
        if (this.currentFilter === 'individual') return acc === 'individual';
        
        return true;
    });

    const activeFilter = this.currentFilter || 'all';
    const orderArray = this.customOrders ? this.customOrders[activeFilter] : null;
    if (orderArray && orderArray.length > 0) {
        filtered.sort((a, b) => {
            const idxA = orderArray.indexOf(a.id);
            const idxB = orderArray.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
        });
    }

    return filtered;
};
