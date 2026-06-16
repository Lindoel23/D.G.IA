const KIRLIAN_PATH = 'ordem/puzzles/kirlian/state';
const gameRef = db.ref(KIRLIAN_PATH);

// Estado Local
let globalState = {};
let localFase = 0;
let isTaskActive = false;
let isCriticalFailureActive = false;
let valves = [0, 0, 0, 0]; // v1, v2, v3, v4
let t1ExecutionCount = 0;
let localTimerValue = 900000;
let lastSyncStamp = Date.now();

// Definição das posições alvo e valores do medidor para cada tarefa
// Baseado no Documento de Design Base v1.1
const TARGETS = {
    1: {
        exec1: { target: [-2, 0, -1, 1], meter: 5 },
        exec2: { target: [1, 0, -1, -1], meter: 7 }
    },
    2: {
        fc: { target: [0, 0, 2, -4], meter: 0 },
        normal: { target: [0, 1, -1, 2], meter: 3 }
    },
    3: {
        normal: { target: [0, 1, -1, 0], meter: 9 }
    },
    4: {
        normal: { target: [2, -1, 1, 1], meter: 4 }
    }
};

// Sincronização via Firebase
gameRef.on('value', snap => {
    const state = snap.val() || {};
    globalState = state;

    // Detectar mudança de Fase (AVANCAR)
    if (state.fase !== localFase) {
        localFase = state.fase || 0;
        t1ExecutionCount = 0;
        resetValves();
        setMeter(0);
        updateStatusDisplay();
    }

    // Verificar se a tarefa está rodando
    isTaskActive = state.tarefaIniciada === true && !state.jogoEncerrado && state.fase >= 1 && state.fase <= 4;

    if (state.tarefaIniciada && !state.jogoEncerrado) {
        updateStatusDisplay(`TAREFA 0${state.fase} EM ANDAMENTO`);
    }

    // Detectar Falha Crítica (Tarefa 2)
    if (state.fase === 2 && state.tarefaIniciada && !state.falhaCriticaResolvida) {
        if (!isCriticalFailureActive) {
            isCriticalFailureActive = true;
            document.getElementById('green-gas-overlay').style.display = 'block';
            document.getElementById('meter-needle').classList.add('fc-wobble');
            updateStatusDisplay("ALERTA: VAZAMENTO! CONTROLES COMPROMETIDOS");
        }
    } else {
        if (isCriticalFailureActive) {
            isCriticalFailureActive = false;
            document.getElementById('green-gas-overlay').style.display = 'none';
            document.getElementById('meter-needle').classList.remove('fc-wobble');
            resetValves(); // Reseta para a equipe começar a tarefa normal limpa
            updateStatusDisplay("VAZAMENTO CONTIDO. RETOMAR OPERAÇÃO.");
        }
    }

    // FIM (Vitória ou Derrota)
    if (state.jogoEncerrado) {
        isTaskActive = false;
        document.getElementById('purple-glow-overlay').style.display = 'block';
        updateStatusDisplay(state.tipoFim === 'vitoria' ? "EXTRAÇÃO CONCLUÍDA COM SUCESSO" : "FALHA CRÍTICA GERAL - SIMULAÇÃO ENCERRADA");
    } else {
        document.getElementById('purple-glow-overlay').style.display = 'none';
    }

    // Timer é atualizado em loop independente
});

// Lógica de Válvulas
window.changeValve = function (index, delta) {
    if (!isTaskActive || globalState.jogoEncerrado) return;

    let finalDelta = delta;
    if (isCriticalFailureActive) {
        finalDelta = -delta; // Inversão dos controles na Falha Crítica
    }

    valves[index] += finalDelta;
    updateValveVisuals();
};

function updateValveVisuals() {
    for (let i = 0; i < 4; i++) {
        document.getElementById(`counter-${i}`).innerText = valves[i];
        const wheel = document.getElementById(`wheel-${i}`);
        // Cada giro muda visualmente 45 graus
        wheel.style.transform = `rotate(${valves[i] * 45}deg)`;
    }
}

function resetValves() {
    valves = [0, 0, 0, 0];
    updateValveVisuals();
}

// Botão LIBERAR
window.handleLiberar = function () {
    if (!isTaskActive || globalState.jogoEncerrado) return;

    // Feedback visual do cano horizontal
    const horizWheel = document.querySelector('.wheel-horiz');
    const currentRot = horizWheel.style.transform.replace(/[^0-9\-]/g, '') || 0;
    horizWheel.style.transform = `rotate(${Number(currentRot) + 90}deg)`;

    let targetConfig = null;
    let isFC = false;

    // Selecionar alvo baseado na fase
    if (localFase === 1) {
        targetConfig = t1ExecutionCount === 0 ? TARGETS[1].exec1 : TARGETS[1].exec2;
    } else if (localFase === 2) {
        if (isCriticalFailureActive) {
            targetConfig = TARGETS[2].fc;
            isFC = true;
        } else {
            targetConfig = TARGETS[2].normal;
        }
    } else if (localFase === 3) {
        targetConfig = TARGETS[3].normal;
    } else if (localFase === 4) {
        targetConfig = TARGETS[4].normal;
    } else {
        return; // Fase 5 não tem execução
    }

    // Validação
    const isCorrect = valves.every((val, i) => val === targetConfig.target[i]);

    if (isCorrect) {
        if (isFC) {
            // Resolveu Falha Crítica
            gameRef.update({ falhaCriticaResolvida: true });
        } else {
            // Execução normal correta
            setMeter(targetConfig.meter);

            if (localFase === 1 && t1ExecutionCount === 0) {
                t1ExecutionCount++;
            }
            
            // Sempre conclui passo na cadeia. Envia sinal para o Painel de Luzes.
            // Substituímos triggerExecucaoOK_3 por transação em cadeiaPasso
            gameRef.child('cadeiaPasso').transaction(val => (val || 0) + 1);
            resetValves();
        }
    } else {
        // Errou! Aplica penalidade no cronômetro global com transaction
        gameRef.child('timestampFim').transaction(t => t === null ? null : t - 60000);

        // Reseta as válvulas localmente para o operador tentar de novo
        resetValves();

        // Efeito visual de erro rápido na tela local (vermelho rápido)
        document.body.style.backgroundColor = '#300';
        setTimeout(() => document.body.style.backgroundColor = '#0b0f0b', 150);
    }
};

// Medidor Visual
function setMeter(val) {
    document.getElementById('meter-value').innerText = val;
    // Escala 0 a 10 mapeada para -90deg a +90deg
    const angle = -90 + (val * 18);
    const needle = document.getElementById('meter-needle');
    // Se estiver em Falha Crítica, a classe fc-wobble sobrepõe o transform. 
    // Só definimos o fixo se não tiver a classe.
    if (!needle.classList.contains('fc-wobble')) {
        needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }
}

// Atualizações de UI genéricas
function updateStatusDisplay(text) {
    const el = document.getElementById('status-display');
    if (!el) return;
    if (text) {
        el.innerText = text;
        if (isCriticalFailureActive) el.style.color = '#55ff55';
        else el.style.color = '#d6d1b8';
    } else {
        el.innerText = globalState.fase === 0 ? "AGUARDANDO INÍCIO DA SIMULAÇÃO" : "PRONTO PARA OPERAÇÃO";
        el.style.color = '#d6d1b8';
    }
}

// Loop Local do Cronômetro
setInterval(() => {
    let ms = 3000000;
    if (globalState.cronometroPausado) {
        ms = globalState.tempoPausadoRestante !== undefined ? globalState.tempoPausadoRestante : 3000000;
    } else if (globalState.jogoEncerrado) {
        if (globalState.timestampFim) {
            ms = globalState.timestampFim - Date.now();
        } else {
            ms = globalState.tempoPausadoRestante !== undefined ? globalState.tempoPausadoRestante : 3000000;
        }
    } else if (globalState.timestampFim) {
        ms = globalState.timestampFim - Date.now();
    }
    
    if (ms < 0) ms = 0;
    updateTimerUI(ms);
}, 50);

function updateTimerUI(ms) {
    if (ms <= 0) {
        document.getElementById('timer-display').innerText = "00:00.000";
        return;
    }
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    const mil = Math.floor(ms % 1000).toString().padStart(3, '0');
    document.getElementById('timer-display').innerText = `${m}:${s}.${mil}`;
}