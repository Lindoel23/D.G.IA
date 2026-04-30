/* --- pages/prompt/prompt.js --- */
/* Gerador de Jogos — Prompt adaptado para Firebase Realtime Database */

const PROMPT_GAME = `CONTEXTO:
Estou usando um sistema Hub chamado D.G.IA hospedado no GitHub Pages (estático, sem servidor). Preciso de um mini-game cooperativo que roda via Firebase Realtime Database para sincronização em tempo real.

Gere o jogo separado em 3 BLOCOS DE CÓDIGO independentes (HTML, CSS, JS), seguindo estas regras:

### REGRAS OBRIGATÓRIAS:

1. **3 Blocos Separados**: Gere exatamente 3 blocos de código: um bloco HTML (só o conteúdo do <body>), um bloco CSS (só estilos), e um bloco JS (só lógica).

2. **NÃO inclua** tags <html>, <head>, <body>, <style> ou <script> nos blocos. Só o conteúdo puro de cada um.

3. **Firebase já está disponível no JS**. As seguintes variáveis já existem quando o JS roda:
   - db → referência do firebase.database()
   - playerId → ID único do jogador (persistido via localStorage)
   - playerName → nome do jogador

4. **Responsividade**: Use unidades relativas (vw, vh, %) e Flexbox/Grid.

5. **Estilo**: Tema Dark (RPG/Cyberpunk). Fundo escuro, texto claro.

6. **Estrutura de dados no Firebase**: Salve o estado compartilhado em:
   ordem/games/{nomeDoJogo}/state/

7. **Multiplayer Automático (SEM SALAS)**: NÃO crie sistema de salas, lobbies, ou botões de "criar/entrar sala". Todos os jogadores compartilham o MESMO estado automaticamente. Quando alguém abre o jogo, ele já vê o estado atual. Quando alguém interage, todos os outros veem a mudança em tempo real. Funciona como um quadro branco compartilhado — quem entra, já está participando.

8. **Sincronização**: Use db.ref().on('value', ...) para escutar mudanças em tempo real. Cada interação do jogador escreve diretamente no Firebase, e todos recebem a atualização automaticamente. NUNCA use polling/setInterval para sync.

9. **Inicialização**: Quando o primeiro jogador entra, o JS deve verificar se o estado existe no Firebase. Se não existir, cria o estado inicial. Se já existir, apenas aplica o estado atual na tela.

10. **Sem alert()/prompt()**: Use modais HTML customizados.

11. **Sem dependências externas** além do Firebase (que já está carregado).

12. **Admin Reset**: Inclua um botão discreto (pequeno, canto inferior) para resetar o jogo. Ao clicar, exibe um modal pedindo senha. A senha correta é "theorder". O reset reescreve o estado inicial no Firebase, e todos os jogadores veem o jogo reiniciar automaticamente.

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
