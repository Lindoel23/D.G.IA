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
    async login(email, password) {
        try {
            // Tenta login direto
            const cred = await firebaseAuth.signInWithEmailAndPassword(email, password);
            const uid = cred.user.uid;
            
            // Carrega perfil do DB
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
        } catch (e) {
            // Se falhou com email, tenta buscar por nickname
            if (e.code === 'auth/invalid-email' || e.code === 'auth/user-not-found') {
                return await this._loginByNickname(email, password);
            }
            let msg = 'Credenciais inválidas!';
            if (e.code === 'auth/wrong-password') msg = 'Senha incorreta!';
            else if (e.code === 'auth/too-many-requests') msg = 'Muitas tentativas. Aguarde.';
            return { success: false, message: msg };
        }
    },

    // Login por nickname (busca email no DB e faz login)
    async _loginByNickname(nickname, password) {
        try {
            const snap = await dbRef('accounts').orderByChild('nickname').equalTo(nickname).once('value');
            const data = snap.val();
            if (!data) return { success: false, message: 'Usuário não encontrado!' };
            
            // Pega o primeiro (e único) resultado
            const uid = Object.keys(data)[0];
            const profile = data[uid];
            
            if (!profile.email) return { success: false, message: 'Conta sem email cadastrado!' };
            
            // Agora faz login com o email encontrado
            return await this.login(profile.email, password);
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
