/* --- pages/register/register.js --- */

function toggleRegisterPass() {
    const input = document.getElementById('regPass');
    const btn = document.getElementById('btnEyeRegister');
    if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = window.getIcon ? window.getIcon('eye') : '👁️';
    } else {
        input.type = "password";
        btn.innerHTML = window.getIcon ? window.getIcon('eye_off') : '🔒';
    }
}

function showError(msg) {
    const toast = document.getElementById('errorToast');
    toast.innerText = msg;
    toast.classList.add('show');
    const card = document.querySelector('.login-card');
    card.classList.add('error-shake');
    setTimeout(() => { toast.classList.remove('show'); card.classList.remove('error-shake'); }, 3000);
}

async function doRegister() {
    const nickname = document.getElementById('regNick').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    if (!nickname || !email || !password) return showError("Preencha todos os campos!");
    try {
        const result = await OrdemAuth.register(email, password, nickname);
        if (result.success) {
            window.showGlobalLoader(() => window.location.href = 'pages/login/login.html');
        } else {
            showError(result.message || "Erro ao registrar!");
        }
    } catch (e) {
        showError("Erro de conexão!");
    }
}

if (window.renderIcons) window.renderIcons();
