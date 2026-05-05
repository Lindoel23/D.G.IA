# Prompt Mestre para Geração de Mini-Games (D.G.IA)

Sempre que precisar criar um novo mini-game no Google AI Studio (ou ChatGPT/Claude), copie e cole o texto abaixo. Ele já contém todas as regras da nossa infraestrutura do Firebase, resets de salas, caminhos dinâmicos e políticas do navegador.

---

**Copie a partir daqui:**

Atue como um Desenvolvedor Front-end Especialista em Jogos Multiplayer e crie um mini-game estilo [TEMA DO JOGO, ex: Rádio Cyberpunk/Painel de Hack] para o meu sistema de RPG.

### REGRAS ESTRUTURAIS OBRIGATÓRIAS (D.G.IA):

1. **Blocos Puros:** Gere exatamente 3 blocos de código separados: um bloco HTML (apenas o conteúdo interno, sem tags `<html>`, `<body>` ou `<head>`), um bloco CSS (sem tags `<style>`), e um bloco JavaScript (sem tags `<script>`).

2. **Variáveis Globais do Firebase:** O Firebase já está importado e inicializado na plataforma. O seu código JS não deve inicializá-lo. Você já tem acesso direto às variáveis globais:
   - `db`: a referência do `firebase.database()`
   - `playerId`: string única do jogador
   - `playerName`: nome do jogador

3. **Caminho Dinâmico de Banco de Dados:** Para o sistema de reset global de salas da minha plataforma funcionar, o jogo deve descobrir seu próprio ID na URL. Inicie a lógica de Firebase sempre com:
   ```javascript
   const urlParams = new URLSearchParams(window.parent.location.search || window.location.search);
   const gameId = urlParams.get('id') || 'jogo_teste';
   const GAME_PATH = `ordem/games/${gameId}/state`;
   const gameRef = db.ref(GAME_PATH);
   ```

4. **Multiplayer Automático (Single Source of Truth):**
   - O jogo é compartilhado. A ação de um jogador afeta todos em tempo real.
   - Use `gameRef.on('value', snap => { ... })` como o **único local** que atualiza a interface (UI). 
   - Quando o jogador interage, apenas atualize o banco (`gameRef.update(...)`). Não mude o visual direto no evento de clique, deixe o Firebase responder e atualizar a tela para todos.

5. **Política de Áudio (Autoplay):** Se o jogo possuir áudio automático dependente da ação de terceiros, implemente um **Overlay de Inicialização** ('Clique para Ligar'). Quando clicado, execute `.play()` mutado e logo em seguida `.pause()` na tag de áudio, para que o navegador desbloqueie a reprodução remota de áudios pela política de segurança.

6. **Responsividade e Mobile:** O jogo será muito acessado via celular. Use CSS com Flexbox/Grid, unidades relativas (`vw`, `vh`) e obrigatoriamente inclua `@media (max-width: 768px)` adaptando o tamanho dos botões e interfaces para serem amigáveis ao toque (dedo).

7. **Design e Imersão:** Tema Escuro (Dark Mode/Cyberpunk). Use cores contrastantes (ex: neon), texturas de sombra (`box-shadow`), gradientes suaves e evite barras de rolagem (`overflow: hidden`). Todo áudio ou imagem chamado no HTML deve ter caminhos relativos na pasta assets (ex: `../assets/MinhaImagem.png`).

### MECÂNICA DO JOGO:
[ESCREVA AQUI COMO FUNCIONA O SEU NOVO JOGO]
