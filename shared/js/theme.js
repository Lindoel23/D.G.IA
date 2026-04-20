// shared/js/theme.js — Carregamento de tema via Firebase
(function() {

    function applyTheme(config) {
        if (!config) return;
        const root = document.documentElement;
        if(config.primary) root.style.setProperty('--accent-color', config.primary);
        if(config.background) root.style.setProperty('--bg-color', config.background);
        if(config.card) root.style.setProperty('--card-bg', config.card);
        if(config.text) root.style.setProperty('--text-color', config.text);
    }

    // Expõe para uso externo (ex: preview do config.html)
    window.applyTheme = applyTheme;

    // Previne a aplicação de tema personalizado em páginas públicas (Login/Registro)
    const pathname = window.location.pathname;
    const isPublic = pathname.includes('/login') || 
                     pathname.includes('/register') || 
                     pathname === '/' || 
                     pathname.endsWith('/index.html');
                     
    if (isPublic) {
        return; 
    }

    // --- LÓGICA DE CACHE (A MÁGICA DO CARREGAMENTO RÁPIDO) ---
    const cachedConfig = localStorage.getItem('user_theme_cache');
    if (cachedConfig) {
        try {
            applyTheme(JSON.parse(cachedConfig));
        } catch (e) {
            console.log("Erro ao ler cache do tema");
        }
    }

    // --- SINCRONIZAÇÃO COM FIREBASE ---
    // Espera o Firebase estar pronto e carrega config do DB
    function syncTheme() {
        const uid = localStorage.getItem('user_id');
        if (!uid || typeof dbRef === 'undefined') return;
        
        dbRef('accounts/' + uid + '/config').once('value').then(snap => {
            const config = snap.val();
            if (config) {
                applyTheme(config);
                localStorage.setItem('user_theme_cache', JSON.stringify(config));
            }
        }).catch(() => console.log("Usando tema padrão ou cache."));
    }

    // Tenta sincronizar imediatamente ou espera o Firebase carregar
    if (typeof dbRef !== 'undefined') {
        syncTheme();
    } else {
        window.addEventListener('load', () => {
            setTimeout(syncTheme, 500);
        });
    }

})();