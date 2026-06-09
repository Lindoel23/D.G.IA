# Prompt Mestre — Gerador de Estações Puzzle Kirlian

> Copie e cole este prompt em outra IA de geração de código para cada uma das estações. Lembre-se de anexar os arquivos: `kirlian_design_base.md`, `conexao_sinais.md` e o documento específico da estação (ex: `estacao_3_valvulas.md`).

---

**[COPIE A PARTIR DAQUI]**

Atue como um Desenvolvedor Front-end Especialista em Puzzles Cooperativos e crie o código para a **[COLOQUE O NOME DA ESTAÇÃO AQUI, ex: Estação 3 — Válvulas]** do "Puzzle Kirlian".

Leia os documentos de design anexados para entender o escopo do projeto, como as peças se encaixam e as regras desta estação.

### REGRAS ESTRUTURAIS OBRIGATÓRIAS:

1. **Blocos Puros**: Gere exatamente 3 blocos de código separados: HTML (apenas o conteúdo interno da estação, sem tags `<html>`, `<body>` ou `<head>`), CSS (sem tags `<style>`), e JavaScript (sem tags `<script>`).

2. **Caminho Fixo no Firebase**: O Firebase já está globalmente inicializado no sistema principal, e a variável `db` já está disponível. O caminho para o estado sincronizado deste puzzle será fixo em todas as 5 estações. O seu código JavaScript deve começar referenciando o banco assim:
   ```javascript
   const KIRLIAN_PATH = 'ordem/puzzles/kirlian/state';
   const gameRef = db.ref(KIRLIAN_PATH);
   ```

3. **Single Source of Truth**: A interface da estação só pode ser visualmente atualizada dentro do listener do Firebase: `gameRef.on('value', snap => { ... })`. Quando o jogador interagir com algo (ex: girar válvula), faça **apenas** a atualização no banco de dados com `gameRef.update(...)` ou mantenha estados temporários locais que não afetam outros jogadores até a confirmação.

4. **Design e Imersão OBRIGATÓRIOS**:
   - **NÃO use** design moderno, neon, limpo ou cyberpunk. 
   - O tema do Puzzle Kirlian é **Soviético antigo, Desgastado, Industrial**.
   - Use cores como verde-oliva militar, amarelo desbotado, ferrugem, painéis de metal sujo.
   - Use fontes estilo CMD/Terminal antigo ou industriais densas.
   - Botões, pinos e alavancas devem parecer peças de maquinário velho e pesado (sombras sólidas, bordas grossas).

5. **Comunicação de Sinais**: Siga estritamente o mapa de envio e recebimento de sinais descrito no documento `conexao_sinais.md` para esta estação específica. Nunca atualize um campo que não seja de responsabilidade da sua estação.

6. **Sistema de Layout (Padrão D.G.IA — Anti-Vazamento e Responsivo)**:

   O layout de cada estação deve seguir este sistema comprovado. Ele garante que **nada vaza da tela**, **o scroll funciona no mobile**, e **cards ficam perfeitamente alinhados em qualquer dispositivo**.

   **6.1. Reset Global Obrigatório** — No topo absoluto do CSS:
   ```css
   * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
   *:focus { outline: none; }
   ```
   > `box-sizing: border-box` faz com que padding e border sejam **incluídos** dentro do `width`/`height`. Sem isso, um elemento com `width: 100%` e `padding: 20px` vazaria 40px pra fora da tela.

   **6.2. HTML e Body** — Flex column full-height com scroll habilitado:
   ```css
   html {
       margin: 0; padding: 0;
       height: auto;
       overflow-x: hidden;
       overflow-y: auto;
       -webkit-overflow-scrolling: touch; /* Scroll suave no iOS */
       background: #051005;
   }
   body {
       margin: 0; padding: 0;
       display: flex; flex-direction: column;
       min-height: 100vh;
       min-height: 100dvh; /* Sobrescreve a linha acima em browsers modernos, resolve barra de endereço mobile */
       overflow-x: hidden;
       overflow-y: auto;
       background: #051005;
       font-family: 'Courier New', Courier, monospace;
       user-select: none;
   }
   ```
   > **CRÍTICO**: Tanto `html` quanto `body` precisam de `overflow-y: auto`. Se qualquer um tiver `overflow: hidden`, o scroll no mobile é bloqueado e o rodapé/botões ficam inacessíveis.

   **6.3. Container Principal** — Nunca vaza, centraliza, empilha:
   ```css
   .container {
       width: 100vw;      /* Ocupa toda a viewport */
       max-width: 100%;   /* MAS nunca ultrapassa o body (impede scrollbar horizontal) */
       max-width: 900px;  /* Limite estético — impede que fique largo demais em monitores */
       margin: 0 auto;    /* Centraliza horizontalmente */
       padding: 20px;
       display: flex;
       flex-direction: column;
       flex: 1;
       gap: 15px;         /* Espaçamento uniforme entre cards, sem margin individual */
       overflow: visible;
   }
   ```
   > O combo `width: 100vw` + `max-width: 100%` é um **padrão anti-overflow**. `100vw` inclui a largura da scrollbar, mas `max-width: 100%` corta isso.

   **6.4. Estrutura em Cards** — Cada seção da estação (header, área principal, controles) deve ser um `.card` independente:
   ```css
   .card {
       background: #1f241c;         /* Fundo soviético escuro */
       border: 4px solid #3a4033;   /* Borda industrial */
       border-radius: 10px;
       padding: 15px;
       display: flex;
       flex-direction: column;
       gap: 15px;                   /* Espaçamento entre filhos SEM margin */
       box-shadow: inset 0 0 15px #000, 5px 5px 15px rgba(0, 0, 0, 0.5);
   }
   ```
   > Use `gap` ao invés de `margin` entre filhos. Não tem "margin collapse" e o espaçamento é uniforme.

   **6.5. Botões** — Largura total, altura fixa, flex center:
   ```css
   button {
       width: 100%;
       height: 55px;
       display: flex;
       align-items: center;
       justify-content: center;
       border-radius: 8px;
       cursor: pointer;
       font-weight: bold;
       box-sizing: border-box;
   }
   ```
   > Altura fixa = botões consistentes. `display: flex` + `align-items: center` = texto perfeitamente centralizado.

   **6.6. Fontes e Espaçamentos Adaptáveis**:
   - Use `clamp()` para todas as fontes. Exemplo: `font-size: clamp(14px, 4vw, 24px);`. Nunca use `px` fixos para fontes.
   - Use `clamp()` para paddings e gaps também. Exemplo: `padding: clamp(10px, 3vw, 20px);`.

   **6.7. CRT/Scanlines**: Efeitos visuais de tela devem usar `position: fixed`, `z-index: 9998+` e `pointer-events: none`.

   **6.8. Media Queries** — O grid/flex cuida de 90% da responsividade. As queries fazem apenas ajustes finos:
   ```css
   /* Tablet (≤768px) */
   @media (max-width: 768px) {
       .container { padding: 12px; gap: 10px; }
       .card { padding: 12px; }
   }
   /* Mobile (≤480px) — Headers empilham, faders viram coluna */
   @media (max-width: 480px) {
       .container { padding: 8px; gap: 8px; }
       .card { padding: 10px; }
       /* flex-wrap: wrap nos headers para empilhar título + timer */
   }
   /* Landscape curto (≤500px de altura) — Reduz paddings verticais drasticamente */
   @media (max-height: 500px) {
       .container { padding: 6px; gap: 6px; }
       .card { padding: 8px; gap: 8px; }
   }
   ```

   **6.9. Estrutura HTML Obrigatória** — O HTML deve seguir este padrão de cards:
   ```html
   <div id="crt-overlay"></div>
   <div class="container">
       <div class="card header-card">
           <!-- Título + Timer ou indicadores -->
       </div>
       <div class="card main-card">
           <!-- Área principal da estação (grid, válvulas, etc) -->
       </div>
       <div class="card controls-card">
           <!-- Controles interativos + botão de ação -->
       </div>
   </div>
   ```
   > Cada card é um bloco independente. O container empilha eles verticalmente com `gap`. Se o conteúdo ultrapassar a tela, o scroll funciona naturalmente.

Com base nas instruções acima e nos documentos lidos, gere os blocos HTML, CSS e JS definitivos.

**[FIM DO PROMPT]**
