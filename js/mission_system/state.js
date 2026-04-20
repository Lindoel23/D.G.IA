window.MissionSystem = window.MissionSystem || {};

Object.assign(window.MissionSystem, {
    missions: [],
    isPicking: false,
    lastPickLng: 0,
    lastPickLat: 0,
    currentFilter: 'all',
    userPermissions: { roles: [], userId: null },
    gameDate: null,
    tempAllowedRoles: [],
    allRoles: [],
    allUsers: [],
    allRolesCache: [],
    customOrders: {},
    targetPrefix: 'm'
});
