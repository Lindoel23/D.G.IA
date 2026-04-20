/* --- public/js/mission_system/cover_manager.js --- */
window.MissionCover = {
    currentMode: null, // 'create' or 'edit'
    
    injectStyles: function() {
        if(document.getElementById('mission-cover-styles')) return;
        const style = document.createElement('style');
        style.id = 'mission-cover-styles';
        style.textContent = `
            .bg-modal {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.9);
                z-index: 15000;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                backdrop-filter: blur(6px);
            }
            .bg-modal.active { display: flex; }
            .bg-preview {
                width: 320px;
                height: 140px;
                border: 3px solid var(--accent-color);
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                cursor: move;
                background-size: cover;
                background-position: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            }
            .bg-preview-label {
                color: white;
                font-size: 0.85rem;
                margin-bottom: 10px;
                text-align: center;
                font-family: monospace;
            }
            .bg-modal-actions {
                display: flex;
                gap: 15px;
                margin-top: 20px;
            }
            .bg-modal-actions button {
                padding: 10px 24px;
                border-radius: 6px;
                font-size: 0.9rem;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s;
            }
            .bg-confirm {
                background: var(--accent-color);
                border: none;
                color: #000;
            }
            .bg-confirm:hover { filter: brightness(1.1); box-shadow: 0 0 10px var(--accent-color); }
            .bg-remove {
                background: transparent;
                border: 2px solid #e74c3c;
                color: #e74c3c;
            }
            .bg-remove:hover { background: #e74c3c; color: white; box-shadow: 0 0 10px #e74c3c;}
            .bg-cancel {
                background: transparent;
                border: 2px solid #666;
                color: #ccc;
            }
            .bg-cancel:hover { border-color: #999; color: white; }
            .bg-swap {
                background: rgba(255,255,255,0.1);
                border: 2px solid var(--accent-color);
                color: var(--accent-color);
            }
            .bg-swap:hover { background: var(--accent-color); color: #000; }
            #bg-mission-file { display: none; }
            
            .mission-cover-preview {
                width: 100%;
                height: 80px;
                border: 1px dashed #444;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background: #111;
                color: #888;
                transition: 0.2s;
                margin-bottom: 15px;
                background-size: cover;
                background-position: center;
                position: relative;
                overflow: hidden;
            }
            .mission-cover-preview:hover {
                border-color: var(--accent-color);
                color: var(--accent-color);
            }
            .mission-cover-preview::before {
                content: '';
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1;
                transition: 0.2s;
            }
            .mission-cover-preview:hover::before {
                background: rgba(0,0,0,0.3);
            }
            .mission-cover-preview span {
                z-index: 2;
                font-weight: bold;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                gap: 8px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.8);
            }
        `;
        document.head.appendChild(style);
    },

    openModal: function(mode) {
        this.currentMode = mode;
        const prefix = mode === 'edit' ? 'edit-m' : 'm';
        const currentData = document.getElementById(prefix + '-cover-data').value;
        
        if (currentData) {
            this.showPreviewModal(currentData, document.getElementById(prefix + '-cover-pos').value);
        } else {
            this.triggerFileInput();
        }
    },

    triggerFileInput: function() {
        document.getElementById('bg-mission-file')?.remove();
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'bg-mission-file';
        input.accept = 'image/*';
        document.body.appendChild(input);
        
        input.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 1200;
                        const MAX_HEIGHT = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                        } else {
                            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Foi ajustada a compressão de 0.40 para 0.85 (Alta Qualidade) para manter a arte lindíssima
                        const base64Data = canvas.toDataURL('image/jpeg', 0.85);
                        this.showPreviewModal(base64Data, "50,50");
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        input.click();
    },

    showPreviewModal: function(dataUrl, pos) {
        document.querySelector('.bg-modal')?.remove();
        
        const modal = document.createElement('div');
        modal.className = 'bg-modal active';
        modal.innerHTML = `
            <p class="bg-preview-label">Arraste para posicionar a capa</p>
            <div class="bg-preview"></div>
            <div class="bg-modal-actions">
                <button class="bg-cancel">CANCELAR</button>
                <button class="bg-swap">TROCAR</button>
                ${dataUrl ? '<button class="bg-remove">REMOVER</button>' : ''}
                <button class="bg-confirm">CONFIRMAR</button>
            </div>
        `;
        document.body.appendChild(modal);

        const preview = modal.querySelector('.bg-preview');
        preview.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%), url(${dataUrl})`;
        
        let [bgPosX, bgPosY] = pos ? pos.split(',').map(Number) : [50, 50];
        if (isNaN(bgPosX)) bgPosX = 50; if (isNaN(bgPosY)) bgPosY = 50;
        
        preview.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;

        let dragStartX, dragStartY, startPosX, startPosY;

        const onStart = (e) => {
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            dragStartX = clientX; dragStartY = clientY;
            startPosX = bgPosX; startPosY = bgPosY;
            
            document.addEventListener('mousemove', onMove);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchend', onEnd);
        };

        const onMove = (e) => {
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const deltaX = (dragStartX - clientX) / 3.2;
            const deltaY = (dragStartY - clientY) / 1.4;
            
            bgPosX = Math.max(0, Math.min(100, startPosX + deltaX));
            bgPosY = Math.max(0, Math.min(100, startPosY + deltaY));
            
            preview.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        };

        const onEnd = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);
        };

        preview.addEventListener('mousedown', onStart);
        preview.addEventListener('touchstart', onStart, { passive: false });
        
        modal.querySelector('.bg-cancel').addEventListener('click', () => modal.remove());
        
        if (modal.querySelector('.bg-remove')) {
            modal.querySelector('.bg-remove').addEventListener('click', () => {
                this.updateForm(null, "50,50");
                modal.remove();
            });
        }
        
        modal.querySelector('.bg-swap').addEventListener('click', () => {
            modal.remove();
            this.triggerFileInput();
        });

        modal.querySelector('.bg-confirm').addEventListener('click', () => {
            this.updateForm(dataUrl, `${bgPosX},${bgPosY}`);
            modal.remove();
        });
    },

    updateForm: function(dataUrl, pos) {
        const prefix = this.currentMode === 'edit' ? 'edit-m' : 'm';
        const inputData = document.getElementById(prefix + '-cover-data');
        const inputPos = document.getElementById(prefix + '-cover-pos');
        const previewDiv = document.getElementById(prefix + '-cover-preview');
        
        inputData.value = dataUrl || '';
        inputPos.value = pos || '50,50';
        
        if (dataUrl) {
            let [bgPosX, bgPosY] = pos.split(',').map(Number);
            previewDiv.style.backgroundImage = `url(${dataUrl})`;
            previewDiv.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
            previewDiv.innerHTML = '<span><span data-icon="image"></span> ALTERAR CAPA</span>';
            if(window.renderIcons) window.renderIcons();
        } else {
            previewDiv.style.backgroundImage = 'none';
            previewDiv.innerHTML = '<span><span data-icon="image"></span> ADICIONAR CAPA</span>';
            if(window.renderIcons) window.renderIcons();
        }
    },
    
    populateEditModal: function(mission) {
        const inputData = document.getElementById('edit-m-cover-data');
        const inputPos = document.getElementById('edit-m-cover-pos');
        this.currentMode = 'edit';
        
        if (mission.coverImage) {
            this.updateForm(mission.coverImage, mission.coverPos || '50,50');
        } else {
            this.updateForm(null, '50,50');
        }
    },
    
    cleanCreateModal: function() {
        this.currentMode = 'create';
        this.updateForm(null, '50,50');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.MissionCover.injectStyles();
});
