/* --- shared/js/api-helpers.js --- */
/* Helpers Firebase — substitui os antigos headers de API */

// O UID agora vem do Firebase Auth (ou localStorage como fallback)
const userId = window.OrdemAuth ? window.OrdemAuth.getCurrentUID() : localStorage.getItem('user_id');
