/* --- public/shared/js/profile_picture.js --- */
/* Módulo de Foto de Perfil — Upload, Crop Circular, Zoom e Drag */

window.ProfilePicture = {
    currentDataUrl: null,
    cropState: { scale: 1, posX: 50, posY: 50 },

    injectStyles: function () {
        if (document.getElementById('profile-pic-styles')) return;
        const style = document.createElement('style');
        style.id = 'profile-pic-styles';
        style.textContent = `
            .pp-modal {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.92);
                z-index: 20000;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                backdrop-filter: blur(6px);
            }
            .pp-modal.active { display: flex; }

            .pp-crop-area {
                width: 300px;
                height: 180px;
                border-radius: 8px;
                border: 3px solid var(--accent-color);
                overflow: hidden;
                position: relative;
                cursor: move;
                background-color: #111;
                background-size: cover;
                background-position: center;
                box-shadow: 0 0 30px rgba(0,0,0,0.6), 0 0 15px color-mix(in srgb, var(--accent-color) 20%, transparent);
            }

            .pp-label {
                color: white;
                font-size: 0.85rem;
                margin-bottom: 15px;
                text-align: center;
                font-family: monospace;
            }

            .pp-zoom-container {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-top: 20px;
                background: rgba(0,0,0,0.5);
                padding: 10px 20px;
                border-radius: 25px;
                border: 1px solid #333;
            }

            .pp-zoom-btn {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #222;
                border: 1px solid #555;
                color: #fff;
                font-size: 1.2rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
                padding: 0;
                font-weight: bold;
                line-height: 1;
            }
            .pp-zoom-btn:hover {
                border-color: var(--accent-color);
                color: var(--accent-color);
                box-shadow: 0 0 8px var(--accent-color);
            }

            .pp-zoom-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 120px;
                height: 4px;
                background: #333;
                border-radius: 2px;
                outline: none;
            }
            .pp-zoom-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                background: var(--accent-color);
                border-radius: 50%;
                cursor: pointer;
                border: none;
                box-shadow: 0 0 6px var(--accent-color);
            }

            .pp-actions {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 12px;
                margin-top: 25px;
            }

            .pp-actions button {
                padding: 10px 24px;
                border-radius: 6px;
                font-size: 0.9rem;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s;
            }
            .pp-btn-confirm {
                background: var(--accent-color);
                border: none;
                color: #000;
            }
            .pp-btn-confirm:hover { filter: brightness(1.1); box-shadow: 0 0 10px var(--accent-color); }

            .pp-btn-swap {
                background: rgba(255,255,255,0.1);
                border: 2px solid var(--accent-color);
                color: var(--accent-color);
            }
            .pp-btn-swap:hover { background: var(--accent-color); color: #000; }

            .pp-btn-remove {
                background: transparent;
                border: 2px solid #e74c3c;
                color: #e74c3c;
            }
            .pp-btn-remove:hover { background: #e74c3c; color: white; box-shadow: 0 0 10px #e74c3c; }

            .pp-btn-cancel {
                background: transparent;
                border: 2px solid #666;
                color: #ccc;
            }
            .pp-btn-cancel:hover { border-color: #999; color: white; }

            /* Foto Centralizada Circular no Dashboard de Config */
            .config-profile-bg {
                position: relative;
                width: 130px;
                height: 130px;
                background-color: #111;
                background-size: cover;
                background-position: center;
                cursor: pointer;
                border-radius: 50%;
                border: 3px solid var(--accent-color);
                box-shadow: 0 5px 20px rgba(0,0,0,0.5);
                overflow: hidden;
            }
            .config-profile-bg:hover {
                filter: brightness(0.85);
            }
            
            .config-profile-bg .pp-edit-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.6);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.25s;
                color: var(--accent-color);
                font-weight: bold;
                font-size: 0.9rem;
                text-shadow: 0 2px 4px rgba(0,0,0,0.9);
                backdrop-filter: blur(2px);
            }
            .config-profile-bg:hover .pp-edit-overlay {
                opacity: 1;
            }
            
            .config-profile-bg .pp-edit-overlay .icon-img {
                width: 28px;
                height: 28px;
                background-color: var(--accent-color);
                margin: 0 0 5px 0;
                filter: drop-shadow(0 0 5px var(--accent-color));
            }
            
            .config-profile-bg .pp-default-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }
            .config-profile-bg .pp-default-icon .icon-img {
                width: 60px;
                height: 60px;
                background-color: #555;
                margin: 0;
            }
        `;
        document.head.appendChild(style);
    },

    // Chama Preview - Manda buscar no DB o original sem cortes
    previewModal: async function(currentImage) {
        if (!currentImage) {
            this.triggerFileInput();
            return;
        }

        const uid = window.OrdemAuth ? OrdemAuth.getCurrentUID() : localStorage.getItem('user_id');
        if (uid) {
            try {
                // Tenta puxar a imagem Master Intacta (se existir)
                const masterImage = await OrdemDB.getAccountField(uid, 'profileImageMaster');
                if (masterImage) {
                    this.showCropModal(masterImage);
                    return;
                }
            } catch (e) { console.error("Erro puxando master image", e); }
        }
        
        // Fallback para a imagem já cortada
        this.showCropModal(currentImage);
    },

    triggerFileInput: function () {
        const existing = document.getElementById('pp-file-input');
        if (existing) existing.remove();

        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'pp-file-input';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX = 1200; // Maior resolução para manipulação
                        let w = img.width, h = img.height;
                        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
                        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
                        canvas.width = w;
                        canvas.height = h;
                        
                        // Fazemos com qualidade perfeita agora para que na hora de cortar (Passo 2) ele preserve HD
                        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                        this.showCropModal(canvas.toDataURL('image/jpeg', 0.95));
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        input.click();
    },

    showCropModal: function (dataUrl) {
        document.querySelector('.pp-modal')?.remove();

        this.currentDataUrl = dataUrl;
        this.cropState = { scale: 1, posX: 50, posY: 50 };

        const modal = document.createElement('div');
        modal.className = 'pp-modal active';
        modal.innerHTML = `
            <p class="pp-label">Arraste e ajuste o zoom para enquadrar</p>
            <div class="pp-crop-area"></div>
            <div class="pp-zoom-container">
                <button class="pp-zoom-btn" data-dir="out">−</button>
                <input type="range" class="pp-zoom-slider" min="100" max="300" value="100">
                <button class="pp-zoom-btn" data-dir="in">+</button>
            </div>
            <div class="pp-actions">
                <button class="pp-btn-cancel">CANCELAR</button>
                <button class="pp-btn-swap">TROCAR</button>
                <button class="pp-btn-remove">REMOVER</button>
                <button class="pp-btn-confirm">CONFIRMAR</button>
            </div>
        `;
        document.body.appendChild(modal);

        const cropArea = modal.querySelector('.pp-crop-area');
        const slider = modal.querySelector('.pp-zoom-slider');
        const self = this;

        function updatePreview() {
            const s = self.cropState.scale;
            cropArea.style.backgroundImage = `url(${dataUrl})`;
            
            // Permite dar Zoom in livre, sem que a escala comece gigantesca. Começa com cover.
            // Para isso, faremos hack: scale=1 significa background-size: cover. Valores > 1 aumentam o background-size em %.
            if (s <= 1) {
                cropArea.style.backgroundSize = 'cover';
            } else {
                // Baseado num width arbitrário
                cropArea.style.backgroundSize = `${s * 100}%`;
            }
            cropArea.style.backgroundPosition = `${self.cropState.posX}% ${self.cropState.posY}%`;
        }
        updatePreview();

        // Zoom slider
        slider.addEventListener('input', (e) => {
            self.cropState.scale = parseInt(e.target.value) / 100;
            updatePreview();
        });

        // Zoom buttons
        modal.querySelectorAll('.pp-zoom-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dir = btn.dataset.dir;
                let val = parseInt(slider.value);
                if (dir === 'in') val = Math.min(300, val + 15);
                else val = Math.max(100, val - 15);
                slider.value = val;
                self.cropState.scale = val / 100;
                updatePreview();
            });
        });

        // Drag
        let dragStartX, dragStartY, startPosX, startPosY;
        const onDragStart = (e) => {
            e.preventDefault();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            dragStartX = cx; dragStartY = cy;
            startPosX = self.cropState.posX;
            startPosY = self.cropState.posY;
            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('touchmove', onDragMove, { passive: false });
            document.addEventListener('mouseup', onDragEnd);
            document.addEventListener('touchend', onDragEnd);
        };
        const onDragMove = (e) => {
            e.preventDefault();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaX = (dragStartX - cx) / 2.5;
            const deltaY = (dragStartY - cy) / 2.5;
            self.cropState.posX = Math.max(0, Math.min(100, startPosX + deltaX));
            self.cropState.posY = Math.max(0, Math.min(100, startPosY + deltaY));
            updatePreview();
        };
        const onDragEnd = () => {
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('touchmove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
            document.removeEventListener('touchend', onDragEnd);
        };
        cropArea.addEventListener('mousedown', onDragStart);
        cropArea.addEventListener('touchstart', onDragStart, { passive: false });

        // Mouse wheel zoom on crop area
        cropArea.addEventListener('wheel', (e) => {
            e.preventDefault();
            let val = parseInt(slider.value);
            val += e.deltaY > 0 ? -10 : 10;
            val = Math.max(100, Math.min(300, val));
            slider.value = val;
            self.cropState.scale = val / 100;
            updatePreview();
        }, { passive: false });

        // Buttons
        modal.querySelector('.pp-btn-cancel').addEventListener('click', () => modal.remove());

        modal.querySelector('.pp-btn-swap').addEventListener('click', () => {
            modal.remove();
            self.triggerFileInput();
        });

        modal.querySelector('.pp-btn-remove').addEventListener('click', () => {
            modal.remove();
            self.saveProfile(null);
        });

        modal.querySelector('.pp-btn-confirm').addEventListener('click', () => {
            // Render final cropped image mapped to 5:3 ratio with Ultra High Resolution logic
            const finalCanvas = document.createElement('canvas');
            const targetW = 600;
            const targetH = 360;
            finalCanvas.width = targetW;
            finalCanvas.height = targetH;
            const ctx = finalCanvas.getContext('2d');

            // Smoothing de imagem ultra para garantir que downscale fique bonito
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const img = new Image();
            img.onload = () => {
                const s = self.cropState.scale;
                const drawW = img.width * s;
                const drawH = img.height * s;
                // Translate posX/posY (0-100%) to offset proportional to target frame
                const offsetX = -(drawW - targetW) * (self.cropState.posX / 100);
                const offsetY = -(drawH - targetH) * (self.cropState.posY / 100);

                // Draw directly as rectangle
                ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

                // Exporta como JPEG comprimido para Firebase (base64 leve)
                // Qualidade Alta (0.8) é o balanço perfeito de peso (geralmente ~50-80KB)
                const croppedData = finalCanvas.toDataURL('image/jpeg', 0.85);
                modal.remove();
                
                // Salva ambos: o Recortado Leve (pra carregar rapido no app) 
                // e o Master HD (pra permitir re-editar o crop depois sem estragar a imagem)
                self.saveProfile(croppedData, dataUrl);
            };
            img.src = dataUrl;
        });
    },

    saveProfile: async function (imageData, masterData = null) {
        const uid = window.OrdemAuth ? OrdemAuth.getCurrentUID() : localStorage.getItem('user_id');
        if (!uid) return;

        try {
            // Se tiver apagando, remove ambos
            const payload = { profileImage: imageData || null };
            if (masterData !== null) {
                payload.profileImageMaster = masterData;
            } else if (!imageData) {
                payload.profileImageMaster = null; 
            }

            const ok = await OrdemDB.updateAccount(uid, payload);

            if (ok) {
                const imagePath = imageData || null;

                if (imagePath) {
                    localStorage.setItem('user_profile_image', imagePath);
                } else {
                    localStorage.removeItem('user_profile_image');
                }

                // Atualizar avatar no config (se existir)
                const configAvatar = document.getElementById('configProfilePic');
                if (configAvatar) {
                    configAvatar.dataset.currentImage = imagePath || ''; // Persist state so reopening logic knows the latest image
                    if (imagePath) {
                        configAvatar.style.backgroundImage = `url(${imagePath})`;
                        const defaultIcon = configAvatar.querySelector('.pp-default-icon');
                        if (defaultIcon) defaultIcon.style.display = 'none';
                    } else {
                        configAvatar.style.backgroundImage = 'none';
                        const defaultIcon = configAvatar.querySelector('.pp-default-icon');
                        if (defaultIcon) defaultIcon.style.display = 'flex';
                    }
                }

                // Atualizar avatar no menu sidebar (se existir)
                const menuAvatar = document.getElementById('menuProfileBanner');
                if (menuAvatar) {
                    if (imagePath) {
                        menuAvatar.style.backgroundImage = `url(${imagePath})`;
                        const di = menuAvatar.querySelector('.menu-profile-default-icon');
                        if (di) di.remove();
                    } else {
                        menuAvatar.style.backgroundImage = 'none';
                        const diag = menuAvatar.querySelector('.menu-profile-default-icon');
                        if (!diag) {
                            const defaultIcon = document.createElement('div');
                            defaultIcon.className = 'menu-profile-default-icon';
                            defaultIcon.innerHTML = window.getIcon ? window.getIcon('user') : '';
                            menuAvatar.insertBefore(defaultIcon, menuAvatar.firstChild);
                            if (window.renderIcons) window.renderIcons();
                        }
                    }
                }

                if (window.showToast) window.showToast(imageData ? 'Foto de perfil atualizada!' : 'Foto de perfil removida!');
            } else {
                if (window.showToast) window.showToast('Erro ao salvar foto', true);
            }
        } catch (e) {
            console.error('ProfilePicture save error:', e);
            if (window.showToast) window.showToast('Erro de conexão', true);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.ProfilePicture.injectStyles();
});
