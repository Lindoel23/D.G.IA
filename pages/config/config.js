/* --- pages/config/config.js --- */

const DEFAULT_CONFIG = { primary: "#00ff88", background: "#1a1a1a", card: "#252525", text: "#ffffff" };
let currentConfig = {};
let activeKey = null;

function toggleConfigPass() {
    const i = document.getElementById('accPass');
    const btn = document.querySelector('.toggle-pass');
    if (i.type === "password") { i.type = "text"; btn.innerHTML = window.getIcon('eye'); }
    else { i.type = "password"; btn.innerHTML = window.getIcon('eye_off'); }
    if (window.renderIcons) window.renderIcons();
}

async function loadUserData() {
    const uid = OrdemAuth.getCurrentUID();
    if (!uid) return;
    try {
        const [account, roles] = await Promise.all([
            OrdemDB.getAccount(uid),
            OrdemRoles.getRoles()
        ]);
        if (account) {
            document.getElementById('accNick').value = account.nickname || '';
            document.getElementById('accEmail').value = account.email || '';
            document.getElementById('accPass').value = ''; // Firebase Auth gerencia senhas
            document.getElementById('accPass').placeholder = '(nova senha opcional)';
            currentConfig = account.config || { ...DEFAULT_CONFIG };
            updatePreviews();

            // Foto de perfil
            const configPic = document.getElementById('configProfilePic');
            if (account.profileImage) {
                configPic.style.backgroundImage = `url(${account.profileImage})`;
                configPic.dataset.currentImage = account.profileImage;
                const defaultIcon = configPic.querySelector('.pp-default-icon');
                if (defaultIcon) defaultIcon.style.display = 'none';
                localStorage.setItem('user_profile_image', account.profileImage);
            } else {
                configPic.dataset.currentImage = '';
            }

            const rolesContainer = document.getElementById('myRolesDisplay');
            rolesContainer.innerHTML = '';
            (account.roles || ['member']).forEach(rid => {
                const rObj = roles.find(r => r.id === rid);
                const span = document.createElement('span');
                span.style.cssText = `background:${rObj ? rObj.color : '#666'}; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold; color:#000; text-transform:uppercase;`;
                span.innerText = rObj ? rObj.name : rid;
                rolesContainer.appendChild(span);
            });
        }
    } catch (e) { console.error(e); }
}

function updatePreviews() {
    ['primary', 'background', 'card', 'text'].forEach(k => {
        const el = document.getElementById(`preview-${k}`);
        if (el) el.style.backgroundColor = currentConfig[k];
    });
    if (window.applyTheme) window.applyTheme(currentConfig);
}

function openPicker(k) { activeKey = k; const c = currentConfig[k]; document.getElementById('hexInput').value = c; document.getElementById('nativePicker').value = c; document.getElementById('colorModal').style.display = 'flex'; }
function closePicker() { document.getElementById('colorModal').style.display = 'none'; activeKey = null; }

function selectSwatchAndClose(c) {
    if (activeKey) { currentConfig[activeKey] = c; updatePreviews(); }
    closePicker();
}

function updatePreviewOnly(c) {
    document.getElementById('hexInput').value = c;
    if (activeKey) { currentConfig[activeKey] = c; updatePreviews(); }
}

function updateFromText(c) { if (c.startsWith('#') && c.length === 7) { document.getElementById('nativePicker').value = c; updatePreviewOnly(c); } }

function confirmColor() {
    const val = document.getElementById('hexInput').value;
    if (activeKey && val) { currentConfig[activeKey] = val; updatePreviews(); }
    closePicker();
}

function openResetModal() { document.getElementById('resetModal').style.display = 'flex'; if (window.renderIcons) window.renderIcons(); }
function closeResetModal() { document.getElementById('resetModal').style.display = 'none'; }

function confirmReset() {
    currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    updatePreviews();
    saveAllSettings(true);
    closeResetModal();
}

async function saveAllSettings(isReset = false) {
    const btn = document.getElementById('btnSaveTheme');
    if (!isReset) btn.innerText = "Salvando...";
    const uid = OrdemAuth.getCurrentUID();
    try {
        const ok = await OrdemDB.updateAccount(uid, { config: currentConfig });
        if (ok) {
            localStorage.setItem('user_theme_cache', JSON.stringify(currentConfig));
            showToast("Paleta de cores salva!");
            if (!isReset) btn.innerText = "TEMA SALVO!";
        } else showToast("Erro ao salvar tema", true);
    } catch (e) { showToast("Falha na conexão", true); }
    setTimeout(() => { if (btn) btn.innerText = "SALVAR TEMA GERAL"; }, 2000);
}

async function saveAccountData() {
    const nick = document.getElementById('accNick').value;
    const email = document.getElementById('accEmail').value;
    const pass = document.getElementById('accPass').value;
    const btn = document.getElementById('btnUpdateAccount');
    if (!nick || !email) return showToast("Dados incompletos", true);
    const oldT = btn.innerText; btn.innerText = "Salvando...";
    const uid = OrdemAuth.getCurrentUID();
    try {
        // Atualiza perfil no DB
        const ok = await OrdemDB.updateAccount(uid, { nickname: nick, email: email });
        if (ok) {
            localStorage.setItem('user_name', nick);
            
            // Se informou nova senha, atualiza no Firebase Auth
            if (pass && pass.length >= 6) {
                try {
                    await firebaseAuth.currentUser.updatePassword(pass);
                } catch (authErr) {
                    showToast("Perfil salvo, mas erro ao mudar senha. Faça login novamente.", true);
                    btn.innerText = oldT;
                    return;
                }
            }
            
            // Se email mudou, atualiza no Firebase Auth
            const currentUser = firebaseAuth.currentUser;
            if (currentUser && currentUser.email !== email) {
                try {
                    await currentUser.updateEmail(email);
                } catch (emailErr) {
                    showToast("Perfil salvo, mas erro ao mudar email. Reautentique.", true);
                }
            }
            
            showToast("Conta Atualizada!"); btn.innerText = "SUCESSO!";
        }
        else showToast("Erro ao salvar", true);
    } catch (e) { showToast("Erro conexão", true); }
    setTimeout(() => { btn.innerText = oldT; }, 2000);
}

(async () => {
    await loadUserData();
    if (window.renderIcons) window.renderIcons();
    if (window.markDataReady) window.markDataReady();
})();
