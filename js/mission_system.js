/* --- public/js/mission_system.js --- */
/* Módulo Central do Sistema de Missões (Hub Loader) */

const MISSION_SYSTEM_MODULES = [
    'js/mission_system/state.js',
    'js/mission_system/core.js',
    'js/mission_system/filters.js',
    'js/mission_system/globe.js',
    'js/mission_system/permissions.js',
    'js/mission_system/picking.js',
    'js/mission_system/ui.js'
];

// Carregamento sequencial imediato para funcionar no contexto de `<script src="..."></script>` síncrono.
MISSION_SYSTEM_MODULES.forEach(src => {
    document.write(`<script src="${src}"><\/script>`);
});