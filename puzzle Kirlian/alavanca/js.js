// --- CONFIGURAÇÕES FIREBASE & CONSTANTES ---
const KIRLIAN_PATH = 'ordem/puzzles/kirlian/state';
const gameRef = db.ref(KIRLIAN_PATH);

// Mapeamento de posições visuais
const POS_MAP = { 'S': 20, 'N': 50, 'I': 80 };
const REVERSE_MAP = ['S', 'N', 'I'];

// Dicionário de execuções por tarefa (A1 a A5)
const TASKS = {
    1: [
        { target: ['N', 'I', 'I', 'S', 'I'], medidor: 9 }
    ],
    2: [
        { target: ['I', 'S', 'N', 'N', 'S'], medidor: 7 },
        { target: ['S', 'S', 'I', 'I', 'N'], medidor: 1 }
    ],
    3: [
        // FC1, FC2, FC3 mapeados fisicamente para alavancas 1 a 5
        { target: ['N', 'I', 'S', 'N', 'I'], visores: [4, 2, 1, 5, 3], isFC: true },
        { target: ['S', 'I', 'N', 'I', 'S'], visores: [3, 5, 2, 1, 4], isFC: true },
        { target: ['S', 'N', 'S', 'I', 'N'], visores: [2, 4, 5, 3, 1], isFC: true, isResolve: true },
        // Execução Normal
        { target: ['S', 'N', 'S', 'I', 'I'], medidor: 6, visores: [1, 2, 3, 4, 5] }
    ],
    4: [
        { target: ['N', 'I', 'S', 'N', 'S'], medidor: 2 }
    ]
};

// --- ESTADO LOCAL ---
let localState = {
    fase: 0,
    tarefaIniciada: false,
    etapa: 0,
    alavancas: ['N', 'N', 'N', 'N', 'N'],
    medidor: 0,
    fcAtiva: false,
    visores: [1, 2, 3, 4, 5],
    jogoEncerrado: false,
    cronometroPausado: true
};

let localTimerValue = 900000;
let lastSyncStamp = Date.now();

// Utility de eventos de pointer/touch
const getY = (e) => {
    if (e.clientY !== undefined) return e.clientY;
    if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientY;
    if (e.touches && e.touches.length > 0) return e.touches[0].clientY;
    return 0;
};

// --- LÓGICA DE DRAG DAS ALAVANCAS DE EXECUÇÃO ---
document.querySelectorAll('.lever-track').forEach((track, idx) => {
    const handle = track.querySelector('.lever-handle');
    let isDragging = false;

    const updateHandleZone = (clientY) => {
        const rect = track.getBoundingClientRect();
        let y = clientY - rect.top;
        let percent = (y / rect.height) * 100;

        let zone = 1; // N (Neutro)
        if (percent < 33) zone = 0; // S
        else if (percent > 67) zone = 2; // I
        return zone;
    };

    const moveDrag = (e) => {
        if (!isDragging) return;
        const rect = track.getBoundingClientRect();
        let y = getY(e) - rect.top;
        let percent = Math.max(20, Math.min(80, (y / rect.height) * 100));
        handle.style.top = `${percent}%`;
    };

    const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;

        let zone = updateHandleZone(getY(e));
        localState.alavancas[idx] = REVERSE_MAP[zone];
        handle.style.top = `${POS_MAP[localState.alavancas[idx]]}%`;

        document.removeEventListener('pointermove', moveDrag);
        document.removeEventListener('pointerup', stopDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', stopDrag);
    };

    const startDrag = (e) => {
        isDragging = true;
        e.preventDefault();

        document.addEventListener('pointermove', moveDrag);
        document.addEventListener('pointerup', stopDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    };

    handle.addEventListener('pointerdown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: false });
});

// --- LÓGICA DE DRAG DA ALAVANCA DE CARGA ---
const cargoTrack = document.getElementById('cargoTrack');
const cargoHandle = document.getElementById('cargoHandle');
let isCargoDragging = false;

const moveCargoDrag = (e) => {
    if (!isCargoDragging) return;
    const rect = cargoTrack.getBoundingClientRect();
    let y = getY(e) - rect.top;
    let maxTop = rect.height - 40; // Subtrai a altura do handle
    y = Math.max(0, Math.min(maxTop, y));
    cargoHandle.style.top = `${y}px`;
};

const stopCargoDrag = (e) => {
    if (!isCargoDragging) return;
    isCargoDragging = false;
    cargoHandle.classList.remove('dragging');

    const rect = cargoTrack.getBoundingClientRect();
    let y = getY(e) - rect.top;
    let percent = (y / rect.height) * 100;

    // Confirma se puxou a alavanca até quase o final
    if (percent > 70) {
        validateExecution();
    }

    // Efeito elástico (mola) ao soltar
    cargoHandle.style.top = '0px';

    document.removeEventListener('pointermove', moveCargoDrag);
    document.removeEventListener('pointerup', stopCargoDrag);
    document.removeEventListener('touchmove', moveCargoDrag);
    document.removeEventListener('touchend', stopCargoDrag);
};

const startCargoDrag = (e) => {
    isCargoDragging = true;
    cargoHandle.classList.add('dragging');
    e.preventDefault();

    document.addEventListener('pointermove', moveCargoDrag);
    document.addEventListener('pointerup', stopCargoDrag);
    document.addEventListener('touchmove', moveCargoDrag, { passive: false });
    document.addEventListener('touchend', stopCargoDrag);
};

cargoHandle.addEventListener('pointerdown', startCargoDrag);
cargoHandle.addEventListener('touchstart', startCargoDrag, { passive: false });

// --- LÓGICA DE VALIDAÇÃO COM FIREBASE ---
function validateExecution() {
    const taskSteps = TASKS[localState.fase];
    if (!taskSteps || localState.etapa >= taskSteps.length) return;

    const currentStep = taskSteps[localState.etapa];
    const target = currentStep.target;

    let isCorrect = true;
    for (let i = 0; i < 5; i++) {
        if (localState.alavancas[i] !== target[i]) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        // SUCCESSO
        localState.etapa++;
        const updates = {};

        if (currentStep.medidor !== undefined) {
            updateMeterUI(currentStep.medidor);
        }

        if (!currentStep.isFC) {
            gameRef.child('cadeiaPasso').transaction(val => (val || 0) + 1).catch(console.error);
        }

        if (currentStep.isResolve) {
            updates[`falhaCriticaResolvida`] = true;
            localState.fcAtiva = false;
        }

        // Prepara visores do próximo passo
        if (localState.etapa < taskSteps.length) {
            const nextStep = taskSteps[localState.etapa];
            localState.visores = nextStep.visores || [1, 2, 3, 4, 5];
            renderVisores();
        }

        gameRef.update(updates).catch(console.error);

    } else {
        // ERRO — Aplica penalidade com transaction
        document.body.classList.add('flash-error');
        setTimeout(() => document.body.classList.remove('flash-error'), 500);

        gameRef.child('timestampFim').transaction(t => t === null ? null : t - 60000).catch(console.error);
    }
}

// --- ATUALIZAÇÃO VISUAL ---
function updateCronometro(ms) {
    if (ms == null) return;
    if (ms < 0) ms = 0;

    let date = new Date(ms);
    let mm = String(date.getUTCMinutes()).padStart(2, '0');
    let ss = String(date.getUTCSeconds()).padStart(2, '0');
    let mll = String(date.getUTCMilliseconds()).padStart(3, '0');

    document.getElementById('timerDisplay').textContent = `${mm}:${ss}.${mll}`;
}

function updateMeterUI(val) {
    document.getElementById('meterNeedle').style.left = `${val * 10}%`;
}

function renderVisores() {
    for (let i = 0; i < 5; i++) {
        document.getElementById(`visor-${i}`).textContent = localState.visores[i];
    }

    const needle = document.getElementById('meterNeedle');
    if (localState.fcAtiva) {
        needle.classList.add('needle-fc');
    } else {
        needle.classList.remove('needle-fc');
    }
}

// Loop Independente do Cronômetro
setInterval(() => {
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
    updateCronometro(ms);
}, 50);

// --- LISTENER DO FIREBASE (SINGLE SOURCE OF TRUTH) ---
gameRef.on('value', snap => {
    const state = snap.val() || {};

    const prevFase = localState.fase;
    const prevTarefaIniciada = localState.tarefaIniciada;

    localState.fase = state.fase || 0;
    localState.tarefaIniciada = state.tarefaIniciada || false;
    localState.cronometroPausado = state.cronometroPausado || false;

    localState.tempoPausadoRestante = state.tempoPausadoRestante;
    localState.timestampFim = state.timestampFim;

    // Condição de Encerramento (Derrota ou Vitória)
    if (state.jogoEncerrado) {
        if (!localState.jogoEncerrado) {
            localState.jogoEncerrado = true;
            document.body.classList.add('flash-end');
        }
        return;
    }

    // Identifica transição de Tarefa ou Acionamento do ENTER pela Est.1
    if (localState.fase !== prevFase || (localState.tarefaIniciada && !prevTarefaIniciada)) {
        localState.etapa = 0;
        updateMeterUI(0);

        if (localState.fase === 3 && localState.tarefaIniciada) {
            localState.fcAtiva = true;
            localState.visores = TASKS[3][0].visores;
        } else {
            localState.fcAtiva = false;
            localState.visores = [1, 2, 3, 4, 5];
        }
        renderVisores();
    }
});
