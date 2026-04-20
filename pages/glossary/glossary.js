/* --- pages/glossary/glossary.js --- */

function setFlex(val) { document.getElementById('flexDemo').style.justifyContent = val; }

let isOverlay = false;
function toggleLayoutMode() {
    const panel = document.getElementById('layoutPanel');
    const btn = document.getElementById('layoutBtn');
    isOverlay = !isOverlay;
    if (isOverlay) {
        panel.classList.add('absolute');
        btn.innerText = "ALTERNAR MODO (ATUAL: OVERLAY)";
    } else {
        panel.classList.remove('absolute');
        btn.innerText = "ALTERNAR MODO (ATUAL: RELATIVE)";
    }
}

function openDemoModal() { openModal('demoModal'); }

function showDemoToast(isError) {
    const t = document.getElementById('toast');
    t.innerText = isError ? "FALHA CRÍTICA SIMULADA ⚠️" : "OPERAÇÃO BEM SUCEDIDA ✅";
    t.style.borderColor = isError ? '#ff4444' : 'var(--accent-color)';
    t.style.color = isError ? '#ff4444' : 'var(--accent-color)';
    t.className = "show";
    setTimeout(() => { t.className = t.className.replace("show", ""); }, 3000);
}

if (window.renderIcons) window.renderIcons();
