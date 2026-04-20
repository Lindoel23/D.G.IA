/* --- public/shared/js/toast.js --- */
/* Função de toast universal — substitui as 5 versões duplicadas */

function showToast(msg, isError = false) {
    // Busca toast: tenta #configToast primeiro, depois #toast
    let toast = document.getElementById('configToast') || document.getElementById('toast');
    if (!toast) {
        // Cria um toast se não existir no HTML
        toast = document.createElement('div');
        toast.id = 'configToast';
        document.body.appendChild(toast);
    }
    toast.innerText = (isError ? "⚠️ " : "✅ ") + msg;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const color = isError ? '#ff4444' : accent;
    toast.style.borderColor = color;
    toast.style.color = color;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
