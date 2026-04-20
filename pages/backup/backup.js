/* --- pages/backup/backup.js --- */
/* Adaptado para GitHub Pages — sem API de servidor */

function uploadIcon() {
    showToast("Funcionalidade indisponível no GitHub Pages. Adicione ícones diretamente no repositório (pasta icons/).", true);
}

function loadTree() {
    const root = document.getElementById('treeRoot');
    root.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">A visualização da estrutura está disponível diretamente no <a href="https://github.com" style="color: var(--accent-color);">repositório GitHub</a>.</div>';
}

loadTree();
if (window.renderIcons) window.renderIcons();

// --- SNAPSHOT EXPORT SYSTEM --- //
const FILES_TO_BACKUP = [
    "index.html", "css/map.css", "css/mission_system.css", "firebase/accounts.js", 
    "firebase/auth.js", "firebase/config.js", "firebase/missions.js", "firebase/roles.js", 
    "js/mission_system/core.js", "js/mission_system/cover_manager.js", "js/mission_system/filters.js", 
    "js/mission_system/globe.js", "js/mission_system/permissions.js", "js/mission_system/picking.js", 
    "js/mission_system/state.js", "js/mission_system/ui.js", "js/globe_engine.js", 
    "js/map_controller.js", "js/mission_system.js", "pages/accounts/accounts.css", 
    "pages/accounts/accounts.html", "pages/accounts/accounts.js", "pages/backup/backup.css", 
    "pages/backup/backup.html", "pages/backup/backup.js", "pages/config/config.css", 
    "pages/config/config.html", "pages/config/config.js", "pages/dashboard/dashboard.css", 
    "pages/dashboard/dashboard.html", "pages/dashboard/dashboard.js", "pages/games-panel/games-panel.css", 
    "pages/games-panel/games-panel.html", "pages/games-panel/games-panel.js", "pages/glossary/glossary.css", 
    "pages/glossary/glossary.html", "pages/glossary/glossary.js", "pages/login/login.css", 
    "pages/login/login.html", "pages/login/login.js", "pages/prompt/prompt.css", 
    "pages/prompt/prompt.html", "pages/prompt/prompt.js", "pages/register/register.css", 
    "pages/register/register.html", "pages/register/register.js", "shared/css/auth.css", 
    "shared/css/components.css", "shared/css/global.css", "shared/js/api-helpers.js", 
    "shared/js/icons.js", "shared/js/loader.js", "shared/js/menu.js", "shared/js/modal.js", 
    "shared/js/password-toggle.js", "shared/js/profile_picture.js", "shared/js/theme.js", 
    "shared/js/toast.js", "tools/map.html"
];

async function downloadFullSnapshot() {
    const btn = document.getElementById('btnSnapshot');
    if (!btn) return;
    
    // Feedback visual imediato e bloqueio duplo de clique
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ LENDO ARQUIVOS...';
    btn.disabled = true;

    try {
        // Dispara todos os disparos de leitura paralelamente sem depender de backend
        const fetchPromises = FILES_TO_BACKUP.map(async (filePath) => {
            try {
                // Força evitar cache do github pages lendo sempre a última build
                const res = await fetch(`/${filePath}?t=${Date.now()}`);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const text = await res.text();
                return { path: filePath, content: text, success: true };
            } catch (err) {
                return { path: filePath, content: `[FALHA NA LEITURA DESTE ARQUIVO VIA FETCH: ${err.message}]`, success: false };
            }
        });

        // Espera de forma segura independente de quebras isoladas (Zero quebra sistêmica)
        const results = await Promise.allSettled(fetchPromises);
        
        let finalOutput = "";
        
        // Estrutura Padrão Estrita requisitada
        results.forEach(result => {
            if (result.status === "fulfilled") {
                const data = result.value;
                finalOutput += `=========================================\n`;
                finalOutput += `FILE: /${data.path}\n`;
                finalOutput += `=========================================\n`;
                finalOutput += `${data.content}\n\n`;
            }
        });

        // Monta o timestamp
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `ordem_snapshot_${dateStr}.txt`;

        // Compila o conteúdo em um arquivo físico virtual (Blob Object)
        const blob = new Blob([finalOutput], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Dispara a janela de "Salvar Como" no navegador
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        
        // Coletor de lixo (previne memory leak do URLObjectURL)
        setTimeout(() => {
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        }, 100);

        if (window.showToast) window.showToast("Snapshot local extraído com sucesso!");

    } catch (e) {
        console.error("Erro no processo de extração do snapshot:", e);
        if (window.showToast) window.showToast("Erro inesperado durante a leitura dos diretórios.", true);
    } finally {
        // Restaura Estado
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
