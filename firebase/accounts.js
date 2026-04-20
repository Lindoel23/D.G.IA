/* --- firebase/accounts.js --- */
/* CRUD de Contas — Salvamento Silencioso por Campo */

window.OrdemDB = {

    // Lê conta completa
    async getAccount(uid) {
        if (!uid) return null;
        try {
            const snap = await dbRef('accounts/' + uid).once('value');
            return snap.val();
        } catch (e) { return null; }
    },

    // Lê um campo específico
    async getAccountField(uid, field) {
        if (!uid) return null;
        try {
            const snap = await dbRef('accounts/' + uid + '/' + field).once('value');
            return snap.val();
        } catch (e) { return null; }
    },

    // Atualiza campos específicos (SILENCIOSO — sem logs, sem toast)
    // Aceita paths aninhados: { "config/primary": "#ff0000" }
    async updateAccount(uid, changesObj) {
        if (!uid || !changesObj) return false;
        try {
            await dbRef('accounts/' + uid).update(changesObj);
            return true;
        } catch (e) { return false; }
    },

    // Lista todas as contas (admin)
    async getAllAccounts() {
        try {
            const snap = await dbRef('accounts').once('value');
            const data = snap.val() || {};
            return Object.entries(data).map(([id, acc]) => ({ id, ...acc }));
        } catch (e) { return []; }
    },

    // Deleta conta do DB (admin)
    // Nota: não remove do Firebase Auth (precisa de Admin SDK)
    async deleteAccount(uid) {
        if (!uid) return false;
        try {
            await dbRef('accounts/' + uid).remove();
            return true;
        } catch (e) { return false; }
    },

    // Busca conta por email ou nickname
    async findAccountByLogin(loginInput) {
        try {
            // Tenta por email
            let snap = await dbRef('accounts').orderByChild('email').equalTo(loginInput).once('value');
            let data = snap.val();
            if (data) {
                const uid = Object.keys(data)[0];
                return { id: uid, ...data[uid] };
            }
            // Tenta por nickname
            snap = await dbRef('accounts').orderByChild('nickname').equalTo(loginInput).once('value');
            data = snap.val();
            if (data) {
                const uid = Object.keys(data)[0];
                return { id: uid, ...data[uid] };
            }
            return null;
        } catch (e) { return null; }
    }
};
