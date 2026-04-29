/* --- firebase/missions.js --- */
/* CRUD de Missões e GameTime */

window.OrdemMissions = {

    // Lê todas as missões (retorna array para o UI, mas salva como objeto)
    async getMissions() {
        try {
            const snap = await dbRef('missions').once('value');
            const data = snap.val();
            if (!data) return [];
            
            // AUTO MIGRATION: Se for array, converte para objeto e salva no Firebase
            if (Array.isArray(data)) {
                console.log("🛠️ Iniciando Migração Automática de Array para Objeto (Missions)...");
                const newObj = {};
                data.forEach((m, idx) => {
                    if (m) {
                        const mId = m.id || (Date.now().toString() + idx);
                        m.id = mId; 
                        newObj[mId] = m;
                    }
                });
                await dbRef('missions').set(newObj);
                console.log("✅ Migração de Missões Concluída!");
                return Object.values(newObj);
            }
            
            return Object.values(data);
        } catch (e) { return []; }
    },

    // Salva TODAS as missões (agora deve receber ou construir um dicionário)
    async setMissions(missionsArray) {
        try {
            const newObj = {};
            missionsArray.forEach(m => { if(m && m.id) newObj[m.id] = m; });
            await dbRef('missions').set(newObj);
            return true;
        } catch (e) { return false; }
    },

    // Atualiza uma missão específica (por ID direto)
    async updateMission(missionId, changesObj) {
        try {
            await dbRef(`missions/${missionId}`).update(changesObj);
            return true;
        } catch (e) { return false; }
    },

    // Cria missão (set direto no ID)
    async createMission(missionData) {
        try {
            if (!missionData.id) missionData.id = Date.now().toString();
            await dbRef(`missions/${missionData.id}`).set(missionData);
            return true;
        } catch (e) { return false; }
    },

    // Deleta missão por ID
    async deleteMission(missionId) {
        try {
            await dbRef(`missions/${missionId}`).remove();
            return true;
        } catch (e) { return false; }
    },

    // ===== GAME TIME =====

    async getGameTime() {
        try {
            const snap = await dbRef('gameTime').once('value');
            return snap.val() || { gameDate: new Date().toISOString().split('T')[0] };
        } catch (e) { return { gameDate: new Date().toISOString().split('T')[0] }; }
    },

    async setGameTime(gameDate) {
        try {
            await dbRef('gameTime').set({ gameDate });
            return true;
        } catch (e) { return false; }
    },

    // ===== PROJETOS (JOGOS) =====

    async getProjects() {
        try {
            const snap = await dbRef('projects').once('value');
            const data = snap.val();
            if (!data) return [];
            
            // AUTO MIGRATION: Se for array, converte para objeto
            if (Array.isArray(data)) {
                console.log("🛠️ Iniciando Migração Automática de Array para Objeto (Projects)...");
                const newObj = {};
                data.forEach((p, idx) => {
                    if (p) {
                        const pId = p.id || (Date.now().toString() + idx);
                        p.id = pId;
                        newObj[pId] = p;
                    }
                });
                await dbRef('projects').set(newObj);
                console.log("✅ Migração de Projetos Concluída!");
                return Object.values(newObj);
            }
            
            return Object.values(data);
        } catch (e) { return []; }
    },

    async setProjects(projectsArray) {
        try {
            const newObj = {};
            projectsArray.forEach(p => { if(p && p.id) newObj[p.id] = p; });
            await dbRef('projects').set(newObj);
            return true;
        } catch (e) { return false; }
    },

    async createProject(projectData) {
        try {
            if (!projectData.id) projectData.id = Date.now().toString();
            await dbRef(`projects/${projectData.id}`).set(projectData);
            return true;
        } catch (e) { return false; }
    },

    async updateProject(projectId, changesObj) {
        try {
            await dbRef(`projects/${projectId}`).update(changesObj);
            return true;
        } catch (e) { return false; }
    },

    async deleteProject(projectId) {
        try {
            await dbRef(`projects/${projectId}`).remove();
            return true;
        } catch (e) { return false; }
    }
};
