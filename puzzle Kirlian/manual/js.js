const KIRLIAN_PATH = 'ordem/puzzles/kirlian/state';
const gameRef = db.ref(KIRLIAN_PATH);

// Elementos DOM
const elMainScreen = document.getElementById('st1-main-screen');
const elTimer = document.getElementById('st1-timer');
const btnEnter = document.getElementById('st1-btn-enter');
const btnResetTop = document.getElementById('st1-btn-reset');
const btnManual = document.getElementById('st1-btn-manual');
const container = document.getElementById('kirlian-st1-terminal');

// Modais de Controle
const modalPassword = document.getElementById('st1-password-modal');
const inputPassword = document.getElementById('st1-password-input');
const btnConfirmPassword = document.getElementById('st1-password-confirm');
const btnCancelPassword = document.getElementById('st1-password-cancel');
const errorPassword = document.getElementById('st1-password-error');

const modalControl = document.getElementById('st1-control-modal');
const btnPausar = document.getElementById('st1-btn-pausar');
const btnResetarTudo = document.getElementById('st1-btn-resetar');
const btnFecharControle = document.getElementById('st1-btn-fechar-controle');

const overlaySymbols = document.getElementById('st1-symbols-overlay');
const contentSymbols = document.getElementById('st1-symbols-content');

const overlayManual = document.getElementById('st1-manual-overlay');
const manualText = document.getElementById('st1-manual-text');
const btnCloseManual = document.getElementById('st1-btn-close-manual');
const btnPrev = document.getElementById('st1-btn-prev');
const btnNext = document.getElementById('st1-btn-next');
const btnUp = document.getElementById('st1-btn-up');
const btnDown = document.getElementById('st1-btn-down');

// ==========================================
// CURSOR VIRTUAL KIRLIAN (OTIMIZADO + TEXTURA)
// ==========================================
const customCursor = document.getElementById('kirlian-cursor');
let mouseX = 0;
let mouseY = 0;
let isCursorMoving = false;

window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isCursorMoving) {
        isCursorMoving = true;
        requestAnimationFrame(() => {
            if (customCursor) {
                customCursor.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
            }
            isCursorMoving = false;
        });
    }
});

// Esconde o cursor quando o mouse sai da janela do jogo
document.addEventListener('mouseleave', () => {
    if (customCursor) customCursor.classList.add('cursor-hidden');
});
document.addEventListener('mouseenter', () => {
    if (customCursor) customCursor.classList.remove('cursor-hidden');
});

// Estado Local
let localState = {
    fase: 0,
    tarefaIniciada: false,
    jogoEncerrado: false,
    cronometroMs: 900000,
    cronometroPausado: true
};
let lastRenderedKey = null;
let typewriterTimeout = null;
let currentManualPage = 0;
let isManualOpen = false;

// ==========================================
// MASTER CRONÔMETRO E RENDERIZAÇÃO
// ==========================================
function formatTime(ms) {
    if (ms < 0) ms = 0;
    let seconds = Math.floor(ms / 1000);
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    let millis = Math.floor(ms % 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function updateTimerUI() {
    requestAnimationFrame(updateTimerUI);
    let ms = 3000000;
    
    if (localState.cronometroPausado) {
        ms = localState.tempoPausadoRestante !== undefined ? localState.tempoPausadoRestante : 3000000;
    } else if (localState.jogoEncerrado) {
        if (localState.timestampFim) {
            ms = localState.timestampFim - Date.now();
        } else {
            ms = localState.tempoPausadoRestante !== undefined ? localState.tempoPausadoRestante : 3000000;
        }
    } else if (localState.timestampFim) {
        ms = localState.timestampFim - Date.now();
    }
    
    if (ms < 0) ms = 0;
    elTimer.textContent = formatTime(ms);
}
requestAnimationFrame(updateTimerUI);

gameRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    localState = { ...data };

    if (data.travasOk && !data.jogoEncerrado) {
        if (data.fase < 5) {
            gameRef.update({ fase: data.fase + 1, tarefaIniciada: false, travasOk: false });
        } else {
            gameRef.update({ jogoEncerrado: true });
        }
    }
});

// (Antigos listeners de admin foram removidos daqui para evitar duplicidade com os do final do arquivo)
// Textos do Terminal (Briefings)
const texts = {
    intro: `PROTOCOLO DE EMERGÊNCIA — EXTRAÇÃO DO NÚCLEO KIRLIAN
ВОЕННАЯ БАЗА № 7-42

Uma anomalia de contenção foi detectada na instalação.
O núcleo Kirlian está em risco de ruptura estrutural.

A extração de emergência foi autorizada.
Você tem 50 minutos para concluir todos os procedimentos
antes que a instabilidade atinja nível crítico.

Cada etapa concluída corretamente adiciona 5 minutos ao tempo.
Cada erro cometido remove 1 minuto.

Leia o manual antes de iniciar. Use o botão [MANUAL]
no canto superior direito para acessá-lo a qualquer momento.

─────────────────────────────────────────────────────
Para iniciar, confirme na Estação da Carapaça.
─────────────────────────────────────────────────────`,

    t1: `> TAREFA 1 — CALIBRAÇÃO DE PRESSÃO

O sistema de contenção detectou instabilidade nos dutos
de pressão que envolvem a carapaça do núcleo Kirlian.

Antes de qualquer tentativa de extração, os dutos precisam
ser calibrados para operar dentro dos parâmetros seguros.
Falhas nesta etapa podem comprometer toda a estrutura
de contenção e colocar a equipe em risco.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────`,

    t2: `> TAREFA 2 — REGULAGEM DE ENERGIA      [TAREFA 1: OK]

O campo energético que mantém o núcleo estável está
apresentando variações críticas. Uma sobrecarga ou
queda repentina pode liberar a energia Kirlian de forma
descontrolada. A regulagem deve ser feita com precisão.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────`,

    t3: `> TAREFA 3 — CONTENÇÃO PARANORMAL      [T1: OK] [T2: OK]

Leituras anômalas foram detectadas no campo Kirlian.
A energia vital aprisionada no núcleo está reagindo
às etapas anteriores e tentando expandir seu campo
além dos limites da carapaça.

As travas de contenção precisam ser reconfiguradas
para suprimir a expansão. Aja rapidamente.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────`,

    t4: `> TAREFA 4 — AUTORIZAÇÃO DE EXTRAÇÃO   [T1: OK] [T2: OK] [T3: OK]

Os sistemas de contenção estão quase estabilizados.
Para autorizar a extração física do núcleo, todos os
parâmetros precisam ser verificados e validados.

Coordene com as demais estações. Consulte o manual.
O Painel de Controle indicará a ordem de execução.

─────────────────────────────────────────────────────
Pressione ENTER para iniciar.
─────────────────────────────────────────────────────`,

    t5: `> TAREFA 5 — EXTRAÇÃO FINAL   [T1: OK] [T2: OK] [T3: OK] [T4: OK]

Esta é a etapa final.

Todos os sistemas estão calibrados. Todos os cabos de
contenção foram liberados. O núcleo Kirlian está pronto
para ser removido com segurança.

Transfira o núcleo para a maleta de transporte.
Esta é a última ação. Não há retorno.

─────────────────────────────────────────────────────
Pressione ENTER para concluir a extração.
─────────────────────────────────────────────────────`
};

// Símbolos da Carapaça
const symbols = {
    1: `╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 1           ║
║                                                   ║
║  OPÇÃO A:   ⊕   ○   ⊕   □                        ║
║  OPÇÃO B:   ✕   □   △   ⬡                        ║
║  OPÇÃO C:   ⬡   ◇   ○   ✕                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝`,

    2: `╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 2           ║
║                                                   ║
║  OPÇÃO A:   ○   ⬡   ◇   □                        ║
║  OPÇÃO B:   △   ✕   ✕   ○                        ║
║  OPÇÃO C:   ◇   ⊕   △   ✕                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝`,

    "3_1": `╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 3 (I)       ║
║                                                   ║
║  OPÇÃO A:   △   ◇   ○   □                        ║
║  OPÇÃO B:   ○   ✕   ✕   ⬡                        ║
║  OPÇÃO C:   ⬡   ○   ⊕   ◇                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝`,

    "3_2": `╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 3 (II)      ║
║                                                   ║
║  OPÇÃO A:   ✕   ⬡   △   △                        ║
║  OPÇÃO B:   ◇   △   ⊕   ○                        ║
║  OPÇÃO C:   □   ⊕   ○   △                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝`,

    4: `╔═══════════════════════════════════════════════════╗
║      SEQUÊNCIAS DE CONTENÇÃO — TAREFA 4           ║
║                                                   ║
║  OPÇÃO A:   △   ✕   □   ⬡                        ║
║  OPÇÃO B:   ○   ⬡   ✕   △                        ║
║  OPÇÃO C:   ⊕   □   ⬡   ○                        ║
║                                                   ║
║  Informe o operador da Carapaça.                  ║
╚═══════════════════════════════════════════════════╝`
};

// Páginas do Manual
const manualPages = [
    `MANUAL DE OPERAÇÃO — SISTEMA DE CONTENÇÃO KIRLIAN
ВОЕННАЯ БАЗА № 7-42 — PROTOCOLO DE EXTRAÇÃO

Este terminal contém todas as instruções necessárias para conduzir
a extração segura do núcleo Kirlian de sua carapaça de contenção.

O núcleo Kirlian é uma anomalia de energia vital classificada.
Sua remoção exige coordenação precisa entre todas as estações
de controle ativas. Nenhuma estação possui informação suficiente
para operar de forma independente.

Este manual está dividido nas seguintes seções:

  → Painel de Controle  — monitoramento e validação do sistema
  → Válvulas            — controle de pressão dos dutos
  → Alavancas           — regulagem de carga energética
  → Carapaça            — travas de contenção do núcleo
  → Falhas Críticas     — procedimentos de emergência
  → Eventos             — ocorrências imprevistas

Leia com atenção. Comunique-se com sua equipe.
O tempo é limitado e os erros têm consequências.

Boa sorte, operador.`,

    `PAINEL DE CONTROLE — ESTAÇÃO DE MONITORAMENTO

O Painel de Controle é responsável por monitorar o estado de todas
as estações em tempo real e por validar cada etapa da operação.

GRADE DE MONITORAMENTO
━━━━━━━━━━━━━━━━━━━━━━
A grade é composta por 25 indicadores luminosos dispostos em
5 linhas e 5 colunas. Cada linha representa uma estação:

  Linha A — Estação de Válvulas de Pressão
  Linha B — Estação de Alavancas de Energia
  Linha C — Estação da Carapaça
  Linha D — Uso reservado do sistema
  Linha E — Indicador de falha crítica ativa

As colunas de 1 a 5 indicam o número do problema —
o número da coluna corresponde ao problema listado
na seção da estação correspondente neste manual.

SISTEMA DE PRIORIDADE
━━━━━━━━━━━━━━━━━━━━━
Quando uma etapa se inicia, três estações recebem sinal
simultaneamente. A estação com indicador piscando rapidamente
deve agir primeiro. As demais aguardam com indicador lento.

Ao concluir sua parte, a estação sinaliza o painel. O indicador
dela apaga e a próxima passa a piscar rapidamente. A ordem
muda a cada tarefa — fique atento ao painel.

MEDIDORES DE CONFIRMAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━
Abaixo da grade há dois controles de ajuste:

  PRESSÃO — registra o valor indicado pela Estação de Válvulas
  ENERGIA — registra o valor indicado pela Estação de Alavancas

Atenção: quando uma estação realiza mais de uma execução
durante a mesma tarefa, apenas o valor da execução mais
recente deve ser registrado.

Após ajustar ambos os valores corretamente e pressionar
CONFIRMAR, este terminal exibirá as opções de sequência
para a Estação da Carapaça prosseguir.

Valores incorretos resultam em penalidade de tempo.`,

    `VÁLVULAS DE PRESSÃO — ESTAÇÃO DE CONTROLE

A Estação de Válvulas de Pressão é responsável por regular
o fluxo nos dutos de contenção do núcleo Kirlian. Um fluxo
fora dos parâmetros pode comprometer toda a operação.

A estação é composta por quatro dutos verticais principais,
cada um identificado por número da esquerda para a direita.
Cada duto possui uma válvula de roda que pode ser girada
para a esquerda ou para a direita quantas vezes for necessário.

Quando o Painel de Controle indicar prioridade para esta
estação, observe o número da coluna acesa. Esse número
corresponde ao Problema abaixo que deve ser executado.
Após ajustar todas as válvulas, acione o duto de liberação.
O medidor indicará o valor gerado, que deve ser informado
ao operador do Painel de Controle.

PROBLEMAS DE PRESSÃO
━━━━━━━━━━━━━━━━━━━━

PROBLEMA 1 — DESESTABILIZAÇÃO DE FLUXO INTERNO

Os sensores detectaram queda de pressão nos dutos internos
de contenção. Para restabelecer o fluxo correto, ajuste
as válvulas da seguinte forma:
Válvula 1 para a esquerda, Válvula 3 para a esquerda,
Válvula 2 para a direita e Válvula 1 para a direita.
Acione o duto de liberação para registrar.

PROBLEMA 2 — VARIAÇÃO DE PRESSÃO DETECTADA

Uma variação fora dos parâmetros foi registrada nos dutos
de saída. Para compensar e estabilizar o fluxo, ajuste
as válvulas da seguinte forma:
Válvula 2 para a direita, Válvula 4 para a direita,
Válvula 3 para a esquerda e Válvula 4 para a direita.
Acione o duto de liberação para registrar.

PROBLEMA 3 — REAJUSTE DE FLUXO DE CONTENÇÃO

O sistema de contenção exige recalibração do fluxo
para manter a estabilidade do campo Kirlian. Ajuste
as válvulas da seguinte forma:
Válvula 4 para a esquerda, Válvula 1 para a direita,
Válvula 3 para a esquerda, Válvula 2 para a direita
e Válvula 2 para a esquerda.
Acione o duto de liberação para registrar.

PROBLEMA 4 — SOBREPRESSÃO ESTRUTURAL

Uma leitura de sobrepressão foi detectada nos dutos
estruturais da carapaça. O reposicionamento das válvulas
é necessário para evitar ruptura. Ajuste da seguinte forma:
Válvula 3 para a direita, Válvula 1 para a direita,
Válvula 4 para a direita, Válvula 2 para a esquerda
e Válvula 1 para a direita.
Acione o duto de liberação para registrar.

PROBLEMA 5 — CALIBRAÇÃO INICIAL DE FLUXO

Os dutos requerem calibração inicial antes que o processo
de extração possa continuar com segurança. Ajuste
as válvulas da seguinte forma:
Válvula 4 para a direita, Válvula 3 para a esquerda,
Válvula 1 para a esquerda e Válvula 1 para a esquerda.
Acione o duto de liberação para registrar.`,

    `ALAVANCAS DE ENERGIA — ESTAÇÃO DE CONTROLE

A Estação de Alavancas de Energia é responsável por regular
a carga energética que alimenta o sistema de contenção do
núcleo Kirlian. Variações fora do tolerado podem causar
instabilidades no campo de contenção.

A estação é composta por cinco alavancas de regulagem,
identificadas por números de 1 a 5. Cada alavanca pode ser
posicionada em três níveis: Superior, Neutro e Inferior.

Quando o Painel de Controle indicar prioridade para esta
estação, observe o número da coluna acesa. Esse número
corresponde ao Problema abaixo que deve ser executado.
Após posicionar todas as alavancas, acione a Alavanca de Carga.
O medidor de energia exibirá o valor gerado, que deve
ser informado ao operador do Painel de Controle.

PROBLEMAS DE ENERGIA
━━━━━━━━━━━━━━━━━━━━

PROBLEMA 1 — INVERSÃO DE CARGA

Uma inversão no campo energético foi detectada e precisa
ser corrigida imediatamente. Posicione as alavancas assim:
Alavanca 4 em Inferior, Alavanca 1 em Superior,
Alavanca 5 em Neutro, Alavanca 3 em Inferior
e Alavanca 2 em Superior.
Acione a Alavanca de Carga para registrar.

PROBLEMA 2 — NIVELAMENTO DE CARGA

A carga energética está desnivelada e precisa de ajuste
para manter a estabilidade do campo de contenção.
Posicione as alavancas assim:
Alavanca 5 em Inferior, Alavanca 2 em Inferior,
Alavanca 4 em Superior, Alavanca 1 em Neutro
e Alavanca 3 em Inferior.
Acione a Alavanca de Carga para registrar.

PROBLEMA 3 — COMPENSAÇÃO ANÔMALA DE CAMPO

Uma leitura anômala exige compensação no campo energético.
Posicione as alavancas da seguinte forma:
Alavanca 4 em Inferior, Alavanca 5 em Inferior,
Alavanca 1 em Superior, Alavanca 2 em Neutro
e Alavanca 3 em Superior.
Acione a Alavanca de Carga para registrar.

PROBLEMA 4 — REGULAGEM DE FASE PRIMÁRIA

A regulagem de fase primária é necessária para estabilizar
o campo energético nesta etapa. Posicione assim:
Alavanca 3 em Neutro, Alavanca 5 em Superior,
Alavanca 1 em Inferior, Alavanca 4 em Neutro
e Alavanca 2 em Superior.
Acione a Alavanca de Carga para registrar.

PROBLEMA 5 — DESCARGA CONTROLADA

Uma descarga de campo energético é necessária para
estabilizar o sistema nesta etapa da operação.
Posicione as alavancas da seguinte forma:
Alavanca 2 em Inferior, Alavanca 5 em Superior,
Alavanca 4 em Neutro, Alavanca 1 em Neutro
e Alavanca 3 em Superior.
Acione a Alavanca de Carga para registrar.`,

    `CARAPAÇA DE CONTENÇÃO — ESTAÇÃO DE CONTROLE

A carapaça é a estrutura física que envolve e mantém o núcleo
Kirlian em estado de contenção segura. Para que o núcleo possa
ser removido e transferido para a maleta de transporte, é
necessário liberar as quatro travas rotativas que prendem
os cabos de contenção à superfície da carapaça.

Cada trava possui uma série de símbolos geométricos em sua
parte giratória. O operador deve girar cada trava até que
o símbolo correto esteja alinhado.

As sequências corretas de símbolos são fornecidas por este
terminal após a validação dos medidores pelo Painel de Controle.
Serão exibidas três opções — apenas uma é a correta para
a etapa em andamento. Comunique-se com sua equipe para
identificar a sequência válida.

Após posicionar as quatro travas corretamente, pressione
o botão de confirmação. Um erro nos símbolos resulta em
penalidade de tempo. Certifique-se antes de confirmar.

A cada tarefa concluída, um cabo de contenção é liberado.
Quando todos os cabos estiverem soltos, o núcleo estará
pronto para ser removido.`,

    `FALHAS CRÍTICAS — PROCEDIMENTOS DE EMERGÊNCIA

Durante a operação, o sistema pode entrar em estado de falha
crítica. Quando isso ocorrer, o Painel de Controle sinalizará
a falha acendendo a linha indicadora de alerta.

Identifique qual estação está apresentando a falha e localize
o procedimento correspondente nesta página. A falha deve ser
resolvida antes que a operação normal possa continuar.

Abaixo estão os procedimentos para cada falha identificada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FALHA CRÍTICA — PAINEL DE CONTROLE
Tipo: Interferência no Sistema de Monitoramento

O sistema de monitoramento entrou em colapso parcial.
Os indicadores luminosos estão apresentando leituras
aleatórias e não refletem o estado real das estações.

Para restaurar o painel, o operador deve executar cinco
sequências de calibração nos medidores, confirmando cada uma.
Cada sequência restaura uma linha do painel, da primeira
até a última. Quando a última linha for restaurada, todos
os indicadores piscarão duas vezes em verde e o painel
voltará a operar normalmente.

Sequência 1: PRESSÃO em 0, ENERGIA em 0. Confirmar.
Sequência 2: PRESSÃO em 10, ENERGIA em 10. Confirmar.
Sequência 3: PRESSÃO em 10, ENERGIA em 0. Confirmar.
Sequência 4: PRESSÃO em 0, ENERGIA em 10. Confirmar.
Sequência 5: PRESSÃO em 5, ENERGIA em 5. Confirmar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FALHA CRÍTICA — ESTAÇÃO DE VÁLVULAS DE PRESSÃO
Tipo: Vazamento de Gás de Contenção

O sistema detectou ruptura em um dos dutos de contenção,
liberando gás de campo Kirlian no ambiente da estação.

ALERTA: caso o operador entre em contato com o gás liberado,
os sentidos de direção ficam temporariamente invertidos.
O operador pode experimentar confusão entre esquerda e
direita durante a exposição. Mantenha a calma e comunique
sua equipe sobre o estado atual.

Para selar o vazamento, execute a seguinte sequência
de ajuste nas válvulas e acione o duto de liberação:
Válvula 4 para a esquerda, Válvula 3 para a direita,
Válvula 1 para a direita, Válvula 4 para a esquerda,
Válvula 2 para a esquerda, Válvula 1 para a esquerda,
Válvula 2 para a direita, Válvula 3 para a direita,
Válvula 4 para a esquerda e Válvula 4 para a esquerda.
Acione o duto de liberação para selar o vazamento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FALHA CRÍTICA — ESTAÇÃO DE ALAVANCAS DE ENERGIA
Tipo: Sobrecarga de Campo Energético

O sistema detectou sobrecarga no campo energético da estação.
Como consequência, os identificadores das alavancas estão
exibindo leituras incorretas — os números nos visores não
correspondem às posições físicas esperadas.

O operador deve observar atentamente os números exibidos
em cada visor e comunicar sua equipe sobre o que está vendo.
As instruções do manual continuam usando a numeração correta —
o operador é quem precisa localizar cada número na tela
e mover a alavanca correspondente.

Para resolver a sobrecarga, execute três sequências de
estabilização, acionando a Alavanca de Carga ao final de cada uma.

Sequência de Estabilização 1:
Alavanca 1 em Superior, Alavanca 2 em Inferior,
Alavanca 3 em Inferior, Alavanca 4 em Neutro
e Alavanca 5 em Neutro. Acione a Alavanca de Carga.

Sequência de Estabilização 2:
Alavanca 1 em Inferior, Alavanca 2 em Neutro,
Alavanca 3 em Superior, Alavanca 4 em Superior
e Alavanca 5 em Inferior. Acione a Alavanca de Carga.

Sequência de Estabilização 3:
Alavanca 1 em Neutro, Alavanca 2 em Superior,
Alavanca 3 em Inferior, Alavanca 4 em Neutro
e Alavanca 5 em Superior. Acione a Alavanca de Carga.

Após a terceira sequência, os identificadores voltarão
ao normal e a operação pode continuar.`,

    `EVENTOS INESPERADOS — PROTOCOLOS ESPECIAIS

O sistema Kirlian é instável por natureza.
Anomalias não catalogadas podem ocorrer a qualquer momento.

Em caso de evento não previsto neste manual,
o procedimento recomendado é o seguinte:

  Respire fundo.
  Comunique sua equipe.
  Reze para que funcione.

Boa sorte, operador.
Você vai precisar.`
];

// Funções de formatação e UI
function formatTime(ms) {
    if (ms < 0) ms = 0;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `> TEMPO: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

function typeWriter(text, element, speed = 15) {
    if (typewriterTimeout) clearTimeout(typewriterTimeout);
    element.innerHTML = "";
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            typewriterTimeout = setTimeout(type, speed);
        }
    }
    type();
}

function renderMainScreen(state) {
    const key = `${state.fase}-${state.tarefaIniciada}`;
    if (lastRenderedKey === key && !state.jogoEncerrado) return;
    lastRenderedKey = key;

    if (state.jogoEncerrado) {
        let msg = state.tipoFim === 'vitoria'
            ? "EXTRAÇÃO CONCLUÍDA COM SUCESSO.\\n\\nSISTEMA DESLIGANDO..."
            : "FALHA CRÍTICA. TEMPO ESGOTADO.\\n\\nCONTENÇÃO ROMPIDA.";
        typeWriter(msg, elMainScreen);
        return;
    }

    if (state.fase === 0) {
        typeWriter(texts.intro, elMainScreen);
    } else if (state.fase > 0 && !state.tarefaIniciada) {
        const textKey = `t${state.fase}`;
        if (texts[textKey]) typeWriter(texts[textKey], elMainScreen);
    } else if (state.fase > 0 && state.tarefaIniciada) {
        // Estado de Loading
        let history = "";
        for (let i = 1; i < state.fase; i++) {
            history += `[TAREFA ${i}: OK]\\n`;
        }
        history += `\\n> Aguardando conclusão da Tarefa ${state.fase}...\\n  ██████░░░░░░░░░░░░░░░░░░░░░░░  [carregando]`;
        typeWriter(history, elMainScreen, 5); // Digita mais rápido
    }
}

function checkOverlays(state) {
    // Esconder se o jogo acabou
    if (state.jogoEncerrado) {
        overlaySymbols.classList.add('hidden');
        return;
    }

    // Lógica para mostrar símbolos da Carapaça
    let showSymbols = false;
    let symbolContent = "";

    if (state.fase > 0 && state.tarefaIniciada && state.medidoresOk) {
        if (state.fase === 3) {
            if (state.travasExecucao === 1) {
                showSymbols = true;
                symbolContent = symbols["3_1"];
            } else if (state.travasExecucao === 2 && !state.travasOk) {
                // Execução 2 da T3 aparece automaticamente após o primeiro TRAVAS_OK
                showSymbols = true;
                symbolContent = symbols["3_2"];
            }
        } else if (!state.travasOk) {
            showSymbols = true;
            symbolContent = symbols[state.fase];
        }
    }

    if (showSymbols && symbolContent) {
        contentSymbols.textContent = symbolContent;
        overlaySymbols.classList.remove('hidden');
    } else {
        overlaySymbols.classList.add('hidden');
    }
}

// Ouvinte do Firebase
if (typeof gameRef !== 'undefined') {
    gameRef.on('value', snap => {
        const state = snap.val() || {};
        localState = { ...localState, ...state };

        // Verifica Fim de Jogo por Tempo
        if (!localState.cronometroPausado && localState.timestampFim && localState.fase > 0 && !localState.jogoEncerrado) {
            if (localState.timestampFim - Date.now() <= 0) {
                gameRef.update({ jogoEncerrado: true, tipoFim: 'derrota' });
            }
        }

        // Auto-Avanço de Fase quando a Carapaça conclui as travas
        if (localState.tarefaIniciada && localState.travasOk && localState.fase > 0) {
            if (localState.fase === 3 && localState.travasExecucao === 1) {
                // Não faz nada, a carapaça cuida da passagem para Exec 2
            } else {
                if (localState.fase < 5) {
                    gameRef.update({
                        fase: localState.fase + 1,
                        tarefaIniciada: false,
                        medidoresOk: false,
                        travasOk: false,
                        travasExecucao: 1,
                        sinal: 'INICIO',
                        sinalInicio: true,
                        falhaCriticaResolvida: (localState.fase + 1 === 2 || localState.fase + 1 === 3) ? false : true,
                        cadeiaPasso: 0
                    });
                }
            }
        }

        if (localState.jogoEncerrado) {
            container.classList.add('purple-glow');
        }

        renderMainScreen(localState);
        checkOverlays(localState);
    });
}

// Ações do Operador
function handleEnter() {
    if (localState.jogoEncerrado) return;

    if (localState.fase > 0 && !localState.tarefaIniciada) {
        if (localState.fase === 5) {
            // FIM (Vitória)
            if (typeof gameRef !== 'undefined') gameRef.update({ jogoEncerrado: true, tipoFim: 'vitoria' });
        } else {
            // AVANCAR
            let updates = { tarefaIniciada: true };
            if (localState.fase === 1) {
                updates.cronometroPausado = false;
                let tRem = localState.tempoPausadoRestante !== undefined ? localState.tempoPausadoRestante : 3000000;
                updates.timestampFim = Date.now() + tRem;
            }
            if (typeof gameRef !== 'undefined') gameRef.update(updates);
        }
    }
}

// Controle do Manual
function updateManualDisplay() {
    manualText.textContent = manualPages[currentManualPage];
}

function openManual() {
    isManualOpen = true;
    overlayManual.classList.remove('hidden');
    updateManualDisplay();
}

function closeManual() {
    isManualOpen = false;
    overlayManual.classList.add('hidden');
}

// Listeners de Botões
btnEnter.addEventListener('click', handleEnter);
btnManual.addEventListener('click', openManual);
btnCloseManual.addEventListener('click', closeManual);

btnPrev.addEventListener('click', () => {
    if (currentManualPage > 0) { currentManualPage--; updateManualDisplay(); manualText.scrollTop = 0; }
});
btnNext.addEventListener('click', () => {
    if (currentManualPage < manualPages.length - 1) { currentManualPage++; updateManualDisplay(); manualText.scrollTop = 0; }
});
btnUp.addEventListener('click', () => { manualText.scrollTop -= 50; });
btnDown.addEventListener('click', () => { manualText.scrollTop += 50; });

// Listeners de Teclado
document.addEventListener('keydown', (e) => {
    // Evita conflitos com inputs do modal
    if (document.activeElement === inputPassword) {
        if (e.key === 'Enter') btnConfirmPassword.click();
        if (e.key === 'Escape') btnCancelPassword.click();
        return;
    }

    if (e.key === 'Enter') {
        handleEnter();
    } else if (e.key === 'Control') {
        isManualOpen ? closeManual() : openManual();
    } else if (e.key === 'Escape' && isManualOpen) {
        closeManual();
    } else if (isManualOpen) {
        if (e.key === 'ArrowLeft') {
            btnPrev.click();
        } else if (e.key === 'ArrowRight') {
            btnNext.click();
        } else if (e.key === 'ArrowUp') {
            manualText.scrollTop -= 50;
        } else if (e.key === 'ArrowDown') {
            manualText.scrollTop += 50;
        }
    }
});

// ==========================================
// CONTROLE DE ADMIN (SENHA E RESET)
// ==========================================

btnResetTop.addEventListener('click', () => {
    modalPassword.classList.remove('hidden');
    inputPassword.value = '';
    errorPassword.classList.add('hidden');
    inputPassword.focus();
});

btnCancelPassword.addEventListener('click', () => {
    modalPassword.classList.add('hidden');
});

btnConfirmPassword.addEventListener('click', () => {
    if (inputPassword.value === 'theorder') {
        modalPassword.classList.add('hidden');
        modalControl.classList.remove('hidden');
        
        btnPausar.textContent = localState.cronometroPausado ? "[RETOMAR SIMULAÇÃO]" : "[PAUSAR SIMULAÇÃO]";
    } else {
        errorPassword.classList.remove('hidden');
        errorPassword.style.animation = 'none';
        setTimeout(() => errorPassword.style.animation = '', 10);
    }
});

btnFecharControle.addEventListener('click', () => {
    modalControl.classList.add('hidden');
});

btnPausar.addEventListener('click', () => {
    const newState = !localState.cronometroPausado;
    let updates = { cronometroPausado: newState };
    
    if (newState) {
        // Pausando
        let ms = 3000000;
        if (localState.timestampFim) {
            ms = localState.timestampFim - Date.now();
            if (ms < 0) ms = 0;
        }
        updates.tempoPausadoRestante = ms;
    } else {
        // Retomando
        let ms = localState.tempoPausadoRestante !== undefined ? localState.tempoPausadoRestante : 3000000;
        updates.timestampFim = Date.now() + ms;
    }

    if (typeof gameRef !== 'undefined') gameRef.update(updates);
    btnPausar.textContent = newState ? "[RETOMAR SIMULAÇÃO]" : "[PAUSAR SIMULAÇÃO]";
});

btnResetarTudo.addEventListener('click', () => {
    if (typeof gameRef !== 'undefined') {
        gameRef.set({
            inicio: false,
            sinalInicio: false,
            sinal: '',
            fase: 0,
            tarefaIniciada: false,
            medidoresOk: false,
            travasOk: false,
            travasExecucao: 1,
            tempoPausadoRestante: 3000000,
            timestampFim: null,
            cronometroPausado: true,
            penalidadesMs: 0,
            tempoExtraMs: 0,
            jogoEncerrado: false,
            tipoFim: '',
            cadeiaPasso: 0,
            falhaCriticaResolvida: true
        });
    }
    modalControl.classList.add('hidden');
});
