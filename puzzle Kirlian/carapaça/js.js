const KIRLIAN_PATH = 'ordem/puzzles/kirlian/state';
const gameRef = db.ref(KIRLIAN_PATH);

let currentState = {};
let currentFase = 0;
let localLocks = [0, 0, 0, 0];
let timerInterval;
let localTimerMs = 900000;
let lastSyncTime = Date.now();
let isTimerRunning = false;
let isProcessing = false;

// Arrays restaurados para os símbolos originais do design document
const symbols = [
    ['○', '△', '✕', '◇', '⬡'],
    ['△', '○', '⬡', '✕', '□'],
    ['□', '◇', '○', '⊕', '△'],
    ['◇', '⬡', '□', '○', '✕']
];

// Sequências corretas (agora 100% alinhadas com o novo manual corrigido)
const correctSequences = {
    1: ['✕', '□', '△', '⬡'],
    2: ['○', '⬡', '◇', '□'],
    31: ['⬡', '○', '⊕', '◇'], // T3 Execução 1
    32: ['◇', '△', '⊕', '○'], // T3 Execução 2
    4: ['△', '✕', '□', '⬡']
};

function formatTime(ms) {
    if (ms < 0) ms = 0;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

// Configura rotação das travas
document.querySelectorAll('.lock-dial').forEach((dial, idx) => {
    dial.addEventListener('click', () => {
        // Bloqueio apenas na fase final ou jogo encerrado. Fase 0 agora é liberada!
        if (currentFase === 5 || currentState.jogoEncerrado || currentState.travasOk) return; 
        
        const sym = document.getElementById(`sym-${idx}`);
        
        // Remove e readiciona a classe para forçar o restart da animação
        sym.classList.remove('roll-animation');
        void sym.offsetWidth; // Force reflow
        sym.classList.add('roll-animation');
        
        // Troca o símbolo na metade da animação (quando ele está invisível a 90 graus)
        setTimeout(() => {
            localLocks[idx] = (localLocks[idx] + 1) % 5;
            sym.innerText = symbols[idx][localLocks[idx]];
        }, 100);
    });
});

// Loop reativo Firebase
gameRef.on('value', snap => {
    const state = snap.val() || {};
    currentState = state;
    currentFase = state.fase || 0;

    // Sincroniza Cronômetro
    if (state.cronometroMs !== undefined) {
        localTimerMs = state.cronometroMs;
        lastSyncTime = Date.now();
    }

    if (state.tarefaIniciada && !state.jogoEncerrado && !state.cronometroPausado && !isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            let now = Date.now();
            let elapsed = now - lastSyncTime;
            lastSyncTime = now;
            localTimerMs -= elapsed;
            if (localTimerMs <= 0) localTimerMs = 0;
            document.getElementById('timerDisplay').innerText = formatTime(localTimerMs);
        }, 37);
    } else if ((!state.tarefaIniciada || state.jogoEncerrado || state.cronometroPausado) && isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timerInterval);
        document.getElementById('timerDisplay').innerText = formatTime(localTimerMs);
    }

    // Condição de fim
    if (state.jogoEncerrado) {
        const purple = document.getElementById('purple-flash');
        purple.style.display = 'block';
        setTimeout(() => purple.style.opacity = '1', 10);
    }

    // Controle dos Cabos
    for (let i = 1; i <= 4; i++) {
        const cabo = document.getElementById(`cabo-${i}`);
        if (currentFase > i) cabo.classList.add('active');
        else cabo.classList.remove('active');
    }

    // Fase 5 layout override
    if (currentFase === 5) {
        document.getElementById('locks-container').style.display = 'none';
        document.getElementById('controls-card').style.display = 'none';
        document.getElementById('fase5-msg').style.display = 'block';
        for (let i = 1; i <= 4; i++) document.getElementById(`cabo-${i}`).classList.add('active');
    } else {
        document.getElementById('locks-container').style.display = 'flex';
        document.getElementById('controls-card').style.display = 'flex';
        document.getElementById('fase5-msg').style.display = 'none';
    }
});

// Ação do Botão B
document.getElementById('btn-confirmar').addEventListener('click', () => {
    if (currentState.jogoEncerrado || currentState.travasOk || isProcessing) return;

    // Debounce simples anti-spam
    isProcessing = true;
    setTimeout(() => isProcessing = false, 1000);

    if (currentFase === 0) {
        // Envia INICIO e muda para fase 1
        gameRef.update({ 
            fase: 1,
            tarefaIniciada: false,
            sinalInicio: true,
            inicio: true,
            sinal: 'INICIO'
        });
        return;
    }

    if (currentFase === 5) return;

    const currentSymbols = [
        symbols[0][localLocks[0]],
        symbols[1][localLocks[1]],
        symbols[2][localLocks[2]],
        symbols[3][localLocks[3]]
    ];

    let isCorrect = false;
    if (currentFase === 1) isCorrect = validate(currentSymbols, correctSequences[1]);
    else if (currentFase === 2) isCorrect = validate(currentSymbols, correctSequences[2]);
    else if (currentFase === 3) {
        const exec = currentState.travasExecucao || 1;
        if (exec === 1) isCorrect = validate(currentSymbols, correctSequences[31]);
        else isCorrect = validate(currentSymbols, correctSequences[32]);
    }
    else if (currentFase === 4) isCorrect = validate(currentSymbols, correctSequences[4]);

    if (isCorrect) {
        let updates = {};
        let isLastExec = true;

        // Trata as múltiplas execuções da Fase 3
        if (currentFase === 3 && (currentState.travasExecucao || 1) === 1) {
            isLastExec = false;
            updates.travasExecucao = 2; // Avança execução, MAS NÃO SETA travasOk
        } else {
            updates.travasOk = true; // Seta travasOk apenas na execução final
        }

        // Bônus de tempo via transaction
        if (isLastExec) {
            gameRef.child('cronometroMs').transaction(t => t === null ? 900000 : t + 60000);
        }

        triggerSuccess();
        if (Object.keys(updates).length > 0) gameRef.update(updates);

    } else {
        triggerError();
        // Penalidade via transaction
        gameRef.child('cronometroMs').transaction(t => t === null ? 900000 : (t - 30000 < 0 ? 0 : t - 30000));
    }
});

function validate(current, target) {
    return current[0] === target[0] && current[1] === target[1] && current[2] === target[2] && current[3] === target[3];
}

function triggerError() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = 0; flash.style.left = 0; flash.style.right = 0; flash.style.bottom = 0;
    flash.style.backgroundColor = 'rgba(255,0,0,0.5)';
    flash.style.zIndex = 9999;
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.4s ease-out';
    document.body.appendChild(flash);

    void flash.offsetWidth; // Force reflow
    flash.style.opacity = 0;
    setTimeout(() => flash.remove(), 400);
}

function triggerSuccess() {
    document.querySelectorAll('.lock-dial').forEach(dial => {
        dial.style.boxShadow = 'inset 0 0 20px #0f0, 0 8px 15px rgba(0,0,0,0.8), 0 0 0 2px #4a5242';
    });
    setTimeout(() => {
        document.querySelectorAll('.lock-dial').forEach(dial => {
            dial.style.boxShadow = '';
        });
    }, 1000);
}
