// public/js/icons.js

(function() {

    // Função que gera a DIV do ícone apontando para o arquivo físico
    window.getIcon = function(name) {
        if (!name) return '';
        // Substitui espaços por underscores por segurança extra
        const safeName = name.trim().replace(/\s+/g, '_');
        return `<div class="icon-img" style="--url: url('/icons/${safeName}.svg')"></div>`;
    };

    // Renderiza ícones automaticamente baseados no atributo data-icon
    window.renderIcons = function() {
        document.querySelectorAll('[data-icon]').forEach(el => {
            const rawName = el.getAttribute('data-icon');
            if (rawName) {
                const safeName = rawName.trim().replace(/\s+/g, '_');
                const iconDiv = document.createElement('div');
                iconDiv.className = 'icon-img';
                iconDiv.style.setProperty('--url', `url('/icons/${safeName}.svg')`);

                el.removeAttribute('data-icon'); 

                if (el.childNodes.length === 0) {
                    el.appendChild(iconDiv);
                } else {
                    el.insertBefore(iconDiv, el.firstChild);
                }
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.renderIcons);
    } else {
        window.renderIcons();
    }
})();