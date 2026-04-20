/* --- firebase/missions.js --- */
/* CRUD de Missões e GameTime */

window.OrdemMissions = {

    // Lê todas as missões (retorna array)
    async getMissions() {
        try {
            const snap = await dbRef('missions').once('value');
            const data = snap.val();
            if (!data) return [];
            if (Array.isArray(data)) return data.filter(Boolean);
            return Object.values(data);
        } catch (e) { return []; }
    },

    // Salva TODAS as missões (sobrescreve)
    async setMissions(missionsArray) {
        try {
            await dbRef('missions').set(missionsArray);
            return true;
        } catch (e) { return false; }
    },

    // Atualiza uma missão específica (por index no array)
    async updateMission(index, changesObj) {
        try {
            await dbRef('missions/' + index).update(changesObj);
            return true;
        } catch (e) { return false; }
    },

    // Cria missão (append no array)
    async createMission(missionData) {
        try {
            const missions = await this.getMissions();
            missions.push(missionData);
            await dbRef('missions').set(missions);
            return true;
        } catch (e) { return false; }
    },

    // Deleta missão por ID
    async deleteMission(missionId) {
        try {
            let missions = await this.getMissions();
            missions = missions.filter(m => m && m.id !== missionId);
            await dbRef('missions').set(missions);
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
            if (Array.isArray(data)) return data.filter(Boolean);
            return Object.values(data);
        } catch (e) { return []; }
    },

    async setProjects(projectsArray) {
        try {
            await dbRef('projects').set(projectsArray);
            return true;
        } catch (e) { return false; }
    },

    async createProject(projectData) {
        try {
            const projects = await this.getProjects();
            projects.push(projectData);
            await dbRef('projects').set(projects);
            return true;
        } catch (e) { return false; }
    },

    async updateProject(projectId, changesObj) {
        try {
            const projects = await this.getProjects();
            const idx = projects.findIndex(p => p && p.id === projectId);
            if (idx < 0) return false;
            Object.assign(projects[idx], changesObj);
            await dbRef('projects').set(projects);
            return true;
        } catch (e) { return false; }
    },

    async deleteProject(projectId) {
        try {
            let projects = await this.getProjects();
            projects = projects.filter(p => p && p.id !== projectId);
            await dbRef('projects').set(projects);
            return true;
        } catch (e) { return false; }
    }
};
