/* --- firebase/roles.js --- */
/* CRUD de Cargos — Salvamento Silencioso */

window.OrdemRoles = {

    // Lê todos os cargos (retorna array)
    async getRoles() {
        try {
            const snap = await dbRef('roles').once('value');
            const data = snap.val();
            if (!data) return [];
            // Se salvo como objeto { admin: {...}, member: {...} }
            if (!Array.isArray(data)) {
                return Object.entries(data).map(([id, r]) => ({ id, ...r }));
            }
            return data;
        } catch (e) { return []; }
    },

    // Atualiza campo de um cargo (silencioso)
    async updateRole(roleId, changesObj) {
        if (!roleId || !changesObj) return false;
        try {
            await dbRef('roles/' + roleId).update(changesObj);
            return true;
        } catch (e) { return false; }
    },

    // Sobrescreve TODOS os cargos (array → objeto)
    async setAllRoles(rolesArray) {
        if (!Array.isArray(rolesArray)) return false;
        try {
            const rolesObj = {};
            rolesArray.forEach(r => {
                rolesObj[r.id] = {
                    name: r.name,
                    color: r.color,
                    permissions: r.permissions || []
                };
            });
            await dbRef('roles').set(rolesObj);
            return true;
        } catch (e) { return false; }
    },

    // Deleta um cargo
    async deleteRole(roleId) {
        if (!roleId) return false;
        try {
            await dbRef('roles/' + roleId).remove();
            return true;
        } catch (e) { return false; }
    }
};
