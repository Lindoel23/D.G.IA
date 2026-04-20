/* --- pages/prompt/prompt.js --- */
/* Gerador de Jogos — Prompt adaptado para Firebase Realtime Database */

const PROMPT_GAME = `CONTEXTO:
Estou usando um sistema Hub chamado D.G.IA hospedado estaticamente no GitHub Pages, com Firebase Realtime Database como backend. Preciso criar um novo mini-game multiplayer compatível com essa plataforma.

Por favor, gere UM ÚNICO ARQUIVO HTML contendo todo o código (HTML + CSS + JS), seguindo rigorosamente estas regras:

---

### REGRAS OBRIGATÓRIAS:

1. **Arquivo Único**: Tudo em um só HTML (CSS no <style>, JS no <script>).

2. **Responsividade**: Use <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">. CSS com unidades relativas (vw, vh, %) e Flexbox/Grid.

3. **Estilo**: Tema Dark (RPG/Cyberpunk). Fundo escuro, texto claro. Use variáveis CSS:
   --accent-color: #00ff88;
   --bg-color: #1a1a1a;
   --card-bg: #252525;

4. **Firebase**: Use Firebase Realtime Database (compat mode). Importe:
   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"><\/script>
   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"><\/script>

5. **Config Firebase**:
   firebase.initializeApp({
       apiKey: "AIzaSyBGORYD-qYb-_nlOcvRdtr4Ik7AU3vL2TQ",
       authDomain: "ordem-1e087.firebaseapp.com",
       databaseURL: "https://ordem-1e087-default-rtdb.firebaseio.com",
       projectId: "ordem-1e087"
   });
   const db = firebase.database();

6. **Estrutura de dados**: Salve tudo em:
   ordem/games/{gameId}/
   ├── name, status, maxPlayers, createdBy, createdAt
   ├── state/ (estado do jogo)
   └── players/{playerId}/ (dados de cada jogador)

7. **Sincronização em tempo real**: Use db.ref().on('value', ...) para manter todos os jogadores sincronizados. NUNCA use polling/setInterval.

8. **Sala/Room**: O jogo deve ter sistema de salas:
   - Botão "Criar Sala" (gera ID aleatório)
   - Campo "Entrar na Sala" (digita ID)
   - Lobby com lista de jogadores
   - Botão "Iniciar" (só o criador)

9. **Sem alert()/prompt()**: Use modais HTML. Sem dependências externas além do Firebase.

10. **Player ID**: Use localStorage para persistir um ID local único:
    let playerId = localStorage.getItem('game_player_id');
    if (!playerId) { playerId = Date.now().toString(); localStorage.setItem('game_player_id', playerId); }

---

### 🎮 IDEIA DO JOGO PARA CRIAR AGORA:
[ESCREVA AQUI SUA IDEIA]`;

document.getElementById('promptGame').value = PROMPT_GAME;

let currentMode = 'game';

function switchPrompt(mode) {
    currentMode = mode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('.prompt-box').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('p[id^="desc-"]').forEach(p => p.style.display = 'none');

    if (mode === 'game') {
        document.getElementById('promptGame').classList.add('active');
        document.getElementById('desc-game').style.display = 'block';
    }
}

function copyCurrentPrompt() {
    const copyText = document.getElementById('promptGame');
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalHtml = btn.innerHTML;
        btn.innerText = "COPIADO! ✅";
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
    });
}

if (window.renderIcons) window.renderIcons();
