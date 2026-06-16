const KIRLIAN_PATH = 'ordem/puzzles/kirlian/state';
const gameRef = db.ref(KIRLIAN_PATH);

const rows = ['A', 'B', 'C', 'D', 'E'];
const cols = [1, 2, 3, 4, 5];

const TARGETS = {
    1: { p: 7, e: 9 },
    2: { p: 3, e: 1 },
    3: { p: 9, e: 6 },
    4: { p: 4, e: 2 }
};

const SEQUENCES = {
    1: ['A5', 'B2', 'A3', 'C1'],
    2: ['B4', 'A2', 'B1', 'C2'],
    3: ['A1', 'B3', 'C3', 'C4'],
    4: ['A4', 'B5', 'C5']
};

const T4_FC_SEQUENCES = [
    { p: 0, e: 0 },
    { p: 10, e: 10 },
    { p: 10, e: 0 },
    { p: 0, e: 10 },
    { p: 5, e: 5 }
];

let currentState = null;
let currentFase = 0;

let localFcT4Step = 0;
let t4FcResolved = false;
let isAnimatingT4FC = false;
let randomBlinkInterval = null;

let localTimerMs = 15 * 60 * 1000;
let isRunning = false;
let lastTick = performance.now();

// Controle local dos Faders
document.getElementById('fader-pressao').addEventListener('input', e => {
    document.getElementById('val-pressao').innerText = e.target.value;
});
document.getElementById('fader-energia').addEventListener('input', e => {
    document.getElementById('val-energia').innerText = e.target.value;
});

// Animação fluida e independente para os milésimos do cronômetro
setInterval(() => {
    let ms = 3000000;
    if (currentState && currentState.cronometroPausado) {
        ms = currentState.tempoPausadoRestante !== undefined ? currentState.tempoPausadoRestante : 3000000;
    } else if (currentState && currentState.jogoEncerrado) {
        if (currentState.timestampFim) {
            ms = currentState.timestampFim - Date.now();
        } else {
            ms = currentState.tempoPausadoRestante !== undefined ? currentState.tempoPausadoRestante : 3000000;
        }
    } else if (currentState && currentState.timestampFim) {
        ms = currentState.timestampFim - Date.now();
    }
    
    if (ms < 0) ms = 0;
    displayTimer(ms);
}, 50);

function displayTimer(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const msStr = Math.floor(ms % 1000).toString().padStart(3, '0');
    document.getElementById('timer-box').innerText =
        `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${msStr}`;
}

// Escuta Single Source of Truth do Firebase
gameRef.on('value', snap => {
    const state = snap.val() || {};
    currentState = state;

    isRunning = state.fase > 0 && state.tarefaIniciada && !state.jogoEncerrado && !state.cronometroPausado;

    // Reseta configurações locais se houver avanço de tarefa
    if (state.fase !== currentFase) {
        currentFase = state.fase;
        localFcT4Step = 0;
        t4FcResolved = false;
        isAnimatingT4FC = false;
    }

    updateUI(state);
});

function updateUI(state) {
    // Evita atualizar os LEDs durante o brilho final animado da Falha 4
    if (isAnimatingT4FC) return;

    if (state.jogoEncerrado) {
        document.getElementById('purple-glow').classList.remove('hidden');
    } else {
        document.getElementById('purple-glow').classList.add('hidden');
    }

    resetGrid();

    // Tarefa 5 (Extração Final) - Linha D inteira acende em roxo
    if (state.fase === 5 && state.tarefaIniciada) {
        setRowColor('D', 'bg-purple');
        return;
    }

    if (state.fase > 0 && state.tarefaIniciada) {
        // Falha Crítica Externa (Est.3 ou Est.4) - Linha E acende em vermelho
        if (state.fase === 2 || state.fase === 3) {
            if (!state.falhaCriticaResolvida) {
                setRowColor('E', 'bg-red');
                return; // Impede a cadeia normal de iniciar
            }
        }

        // Falha Crítica Interna da Tarefa 4
        if (state.fase === 4) {
            if (!t4FcResolved) {
                updateT4FcVisuals(localFcT4Step);
                return; // Impede a cadeia normal de iniciar
            }
        }

        // Cadeia de Execução Normal
        renderChain(state);
    } else {
        stopRandomBlinks();
    }
}

function resetGrid() {
    rows.forEach(r => {
        cols.forEach(c => {
            const el = document.getElementById(`light-${r}${c}`);
            if (el) el.className = 'grid-light'; // Remove todas classes utilitárias
        });
    });
}

function setRowColor(r, colorClass) {
    cols.forEach(c => setLightColor(`${r}${c}`, colorClass));
}

function setLightColor(id, colorClass) {
    const el = document.getElementById(`light-${id}`);
    if (el && colorClass) el.classList.add(colorClass);
}

function renderChain(state) {
    const seq = SEQUENCES[state.fase];
    if (!seq) return;

    // Est.3, 4 e 5 atualizam esse campo para progredir a cadeia para a Est.2
    let step = state.cadeiaPasso || 0;

    // Ajuste visual para Tarefa 3, que possui dupla execução na Carapaça (C3 e C4)
    if (state.fase === 3 && state.travasExecucao === 2) {
        step = 3;
    }

    for (let i = 0; i < seq.length; i++) {
        const id = seq[i];
        if (i < step) {
            setLightColor(id, ''); // Passo já concluído (luz apagada)
        } else if (i === step) {
            setLightColor(id, 'fast-blink'); // Ação imediata!
        } else {
            setLightColor(id, 'slow-blink'); // Aguardando
        }
    }
}

function startRandomBlinks() {
    if (randomBlinkInterval) return;
    randomBlinkInterval = setInterval(() => {
        if (isAnimatingT4FC || t4FcResolved) return;
        resetGrid();
        const num = Math.floor(Math.random() * 6) + 5; // Escolhe 5 a 10 LEDs
        for (let i = 0; i < num; i++) {
            const r = rows[Math.floor(Math.random() * rows.length)];
            const c = cols[Math.floor(Math.random() * cols.length)];
            setLightColor(`${r}${c}`, 'bg-red');
        }
    }, 200);
}

function stopRandomBlinks() {
    if (randomBlinkInterval) {
        clearInterval(randomBlinkInterval);
        randomBlinkInterval = null;
    }
}

function updateT4FcVisuals(step) {
    if (step === 0) {
        startRandomBlinks();
    } else {
        stopRandomBlinks();
        const rowsToGreen = rows.slice(0, step);
        const rowsToRed = rows.slice(step);

        rowsToGreen.forEach(r => setRowColor(r, 'bg-green'));
        rowsToRed.forEach(r => setRowColor(r, 'bg-red'));
    }
}

document.getElementById('btn-confirmar').addEventListener('click', () => {
    if (!currentState) return;

    const p = parseInt(document.getElementById('fader-pressao').value, 10);
    const e = parseInt(document.getElementById('fader-energia').value, 10);

    // Validação da Falha Crítica T4 local
    if (currentState.fase === 4 && currentState.tarefaIniciada && !t4FcResolved) {
        const target = T4_FC_SEQUENCES[localFcT4Step];
        if (p === target.p && e === target.e) {
            localFcT4Step++;
            if (localFcT4Step >= 5) {
                // Última etapa da Falha Resolvida -> Animação de retorno
                isAnimatingT4FC = true;
                stopRandomBlinks();
                resetGrid();
                rows.forEach(r => setRowColor(r, 'bg-green'));

                let blinkCount = 0;
                const interval = setInterval(() => {
                    resetGrid();
                    setTimeout(() => {
                        if (isAnimatingT4FC) rows.forEach(r => setRowColor(r, 'bg-green'));
                    }, 150);
                    blinkCount++;
                    if (blinkCount >= 2) {
                        clearInterval(interval);
                        setTimeout(() => {
                            isAnimatingT4FC = false;
                            t4FcResolved = true;
                            if (currentState) updateUI(currentState);
                        }, 300);
                    }
                }, 300);
            } else {
                updateUI(currentState);
            }
        } else {
            // Se errou a sequência, envia sinal de penalidade para o cronômetro central
            gameRef.child('timestampFim').transaction(t => t === null ? null : t - 60000);
        }
        return;
    }

    // Validação da Cadeia Normal
    const target = TARGETS[currentState.fase];
    if (target) {
        if (p === target.p && e === target.e) {
            gameRef.update({ medidoresOk: true });
        } else {
            gameRef.child('timestampFim').transaction(t => t === null ? null : t - 60000);
        }
    }
});
