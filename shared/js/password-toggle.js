/* --- public/shared/js/password-toggle.js --- */
/* Controle universal de visibilidade de senha */

function togglePassword(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input) return;
    
    if (input.type === "password") {
        input.type = "text";
        if (btn) btn.innerHTML = window.getIcon ? window.getIcon('eye') : '👁️';
    } else {
        input.type = "password";
        if (btn) btn.innerHTML = window.getIcon ? window.getIcon('eye_off') : '🔒';
    }
}
