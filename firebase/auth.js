/* --- firebase/auth.js --- */
/* Autenticação Firebase — Login, Register, Sessão */

window.OrdemAuth = {

    // Registra novo usuário (Firebase Auth + perfil no DB)
    async register(email, password, nickname) {
        try {
            const cred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            const uid = cred.user.uid;
            
            // Cria perfil no Realtime Database
            await dbRef('accounts/' + uid).set({
                nickname: nickname,
                email: email,
                roles: ['member'],
                config: {
                    primary: '#00ff88',
                    background: '#1a1a1a',
                    card: '#252525',
                    text: '#ffffff'
                },
                createdAt: new Date().toISOString()
            });
            
            // Logout após registro (redireciona pro login)
            await firebaseAuth.signOut();
            return { success: true };
        } catch (e) {
            let msg = 'Erro ao registrar';
            if (e.code === 'auth/email-already-in-use') msg = 'Este email já está em uso!';
            else if (e.code === 'auth/weak-password') msg = 'Senha muito fraca (mínimo 6 caracteres)';
            else if (e.code === 'auth/invalid-email') msg = 'Email inválido';
            return { success: false, message: msg };
        }
    },

    // Login com email/senha
    async login(loginInput, password) {
        loginInput = loginInput.trim();
        try {
            // Tenta login direto (pode ser email)
            const cred = await firebaseAuth.signInWithEmailAndPassword(loginInput, password);
            return await this._processLoginSuccess(cred.user.uid);
        } catch (e) {
            // Se falhou, pode ser um nickname ou as credenciais estão erradas
            if (e.code === 'auth/invalid-email' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
                return await this._loginByNickname(loginInput, password);
            }
            
            let msg = 'Credenciais inválidas!';
            if (e.code === 'auth/wrong-password') msg = 'Senha incorreta!';
            else if (e.code === 'auth/too-many-requests') msg = 'Muitas tentativas. Aguarde.';
            return { success: false, message: msg };
        }
    },

    // Processa o perfil após sucesso
    async _processLoginSuccess(uid) {
        const snap = await dbRef('accounts/' + uid).once('value');
        const profile = snap.val();
        
        if (profile) {
            localStorage.setItem('user_id', uid);
            localStorage.setItem('user_name', profile.nickname || 'Viajante');
            if (profile.profileImage) {
                localStorage.setItem('user_profile_image', profile.profileImage);
            }
            if (profile.config) {
                localStorage.setItem('user_theme_cache', JSON.stringify(profile.config));
            }
        }
        
        return { success: true, user: { id: uid, nickname: profile?.nickname || 'Viajante' } };
    },

    // Login por nickname (busca email no DB e faz login)
    async _loginByNickname(nickname, password) {
        try {
            // Busca a conta usando a função já existente que tenta por email e nickname
            const account = await window.OrdemDB.findAccountByLogin(nickname);
            
            if (!account || !account.email) {
                // Retorna credenciais inválidas em vez de "Usuário não encontrado" para não entregar se a conta existe
                return { success: false, message: 'Usuário não encontrado ou credenciais inválidas!' };
            }
            
            // Tenta login com o email real da conta encontrada
            try {
                const cred = await firebaseAuth.signInWithEmailAndPassword(account.email, password);
                return await this._processLoginSuccess(cred.user.uid);
            } catch (err) {
                let msg = 'Credenciais inválidas!';
                if (err.code === 'auth/wrong-password') msg = 'Senha incorreta!';
                else if (err.code === 'auth/too-many-requests') msg = 'Muitas tentativas. Aguarde.';
                return { success: false, message: msg };
            }
        } catch (e) {
            return { success: false, message: 'Erro ao buscar usuário!' };
        }
    },

    // Logout
    async logout() {
        await firebaseAuth.signOut();
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_theme_cache');
        localStorage.removeItem('user_profile_image');
    },

    // Retorna UID do logado (ou null)
    getCurrentUID() {
        return localStorage.getItem('user_id') || (firebaseAuth.currentUser ? firebaseAuth.currentUser.uid : null);
    },

    // Listener de estado de auth
    onAuthChanged(callback) {
        firebaseAuth.onAuthStateChanged(callback);
    }
};
