// shared/js/loader.js

(function() {
    const STATE = {
        domReady: false,
        windowLoaded: false,
        dataReady: false, 
        firebaseReady: false,
        isHolding: false
    };

    const overlayHTML = `
        <div id="page-transition-overlay" class="page-transition-overlay">
            <div class="page-transition-spinner"></div>
        </div>
    `;

    function getOverlay() {
        let overlay = document.getElementById('page-transition-overlay');
        if (!overlay) {
            if (document.body) document.body.insertAdjacentHTML('afterbegin', overlayHTML);
            else document.write(overlayHTML); // Fallback agressivo no head
            overlay = document.getElementById('page-transition-overlay');
        }
        return overlay;
    }

    // Garante que o overlay exista ANTES da pintura da tela branca
    if (!document.body) {
        document.addEventListener('DOMContentLoaded', getOverlay);
    } else {
        getOverlay();
    }

    // Sincroniza callback com o ciclo de pintura real da GPU
    function doubleRAF(callback) {
        requestAnimationFrame(() => {
            requestAnimationFrame(callback);
        });
    }

    function checkAndHideLoader() {
        if (STATE.isHolding) return;
        if (window.blockGlobalLoaderHide) return; // Legado pro mapa
        
        // Verifica DB/Auth
        if (window.firebase && typeof firebase.auth === 'function' && !STATE.firebaseReady) return;
        
        // Exige DOM, Window e os Dados customizados da página estarem carregados
        if (STATE.domReady && window.document.readyState === 'complete' && STATE.dataReady && STATE.firebaseReady) {
            executeHide();
        }
    }

    function executeHide() {
        const overlay = getOverlay();
        if (overlay.classList.contains('hidden')) return;

        doubleRAF(() => {
            document.body.classList.add('page-ready');
            overlay.classList.add('hidden');
            
            setTimeout(() => {
                if(overlay.classList.contains('hidden')) {
                    overlay.style.display = 'none';
                }
            }, 350); 
        });
    }

    // --- API PÚBLICA --- //

    // Libera a página principal para aparecer
    window.markDataReady = function() {
        STATE.dataReady = true;
        checkAndHideLoader();
    };

    // Esconde na marra 
    window.forceHideLoader = function() {
        STATE.isHolding = false;
        STATE.domReady = true;
        STATE.dataReady = true;
        STATE.firebaseReady = true;
        executeHide();
    };

    // Prende o loader (bom pra operações complexas)
    window.holdLoader = function(bool) {
        STATE.isHolding = !!bool;
        if (!STATE.isHolding) checkAndHideLoader();
    };

    // Mostra o loader para navegar
    window.showGlobalLoader = function(callback) {
        const overlay = getOverlay();
        overlay.style.display = 'flex';
        void overlay.offsetHeight; // force repaint

        document.body.classList.remove('page-ready');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            if (callback) callback();
        }, 350);
    };


    // --- LISTENERS BASE --- //
    document.addEventListener('DOMContentLoaded', () => {
        STATE.domReady = true;
        
        // Auto-liberação de segurança apenas para páginas puramente visuais, 
        // ou seja, se a página não tem JS pesados pedindo lock, liberamos o dataReady.
        if (!document.querySelector('script[src*="pages/dashboard/dashboard.js"]') && 
            !document.querySelector('script[src*="pages/accounts/accounts.js"]') &&
            !document.querySelector('script[src*="pages/games-panel/games-panel.js"]') &&
            !document.querySelector('script[src*="pages/config/config.js"]') &&
            !document.querySelector('script[src*="js/map_controller.js"]')) {
            STATE.dataReady = true; 
        }
        
        checkAndHideLoader();
    });

    window.addEventListener('load', () => {
        STATE.windowLoaded = true;
        checkAndHideLoader();
    });

    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            window.forceHideLoader();
        }
    });

    function pollFirebase(attempts = 0) {
        if (window.firebase && typeof firebase.auth === 'function') {
            try {
                const unsub = firebase.auth().onAuthStateChanged(() => {
                    STATE.firebaseReady = true;
                    unsub();
                    checkAndHideLoader();
                });
            } catch(e) {
                // If it fails (e.g. app not initialized yet), treat as not ready and wait
                if (attempts < 50) {
                    setTimeout(() => pollFirebase(attempts + 1), 50);
                } else {
                    STATE.firebaseReady = true;
                    checkAndHideLoader();
                }
            }
        } else if (attempts < 50) {
            // Tenta por até 2.5 segundos (50 * 50ms) aguardando o load do Firebase
            setTimeout(() => pollFirebase(attempts + 1), 50);
        } else {
            // Desiste e libera para não travar a tela pra sempre
            STATE.firebaseReady = true;
            checkAndHideLoader();
        }
    }
    setTimeout(() => pollFirebase(0), 20);

    // --- NAVEGAÇÃO & VIEW TRANSITIONS API --- //
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');

        if (link && link.href && !link.target && 
            link.href.startsWith(window.location.origin) && 
            !link.getAttribute('href').startsWith('#') &&
            !link.href.includes('/api/') && !link.hasAttribute('download')) {
            
            e.preventDefault(); 
            
            // Garantia: anima o loader da nossa interface ao invés de congelar a API de transição
            window.showGlobalLoader(() => {
                window.location.href = link.href;
            });
        }
    });

})();