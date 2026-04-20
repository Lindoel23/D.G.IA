/* --- pages/login/login.js --- */

function toggleLoginPass() {
    const input = document.getElementById('password');
    const btn = document.getElementById('btnEyeLogin');
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

async function doLogin() {
    const login = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!login || !password) return showError("Preencha todos os campos!");
    try {
        const result = await OrdemAuth.login(login, password);
        if (result.success) {
            window.showGlobalLoader(() => window.location.href = 'pages/dashboard/dashboard.html');
        } else {
            showError(result.message || "Credenciais inválidas!");
        }
    } catch (e) {
        showError("Erro de conexão!");
    }
}

if (window.renderIcons) window.renderIcons();
