// game-logic/logic-fios.js

module.exports = function(io) {
    // --- Configurações Iniciais do Jogo ---
    function generateWireData() {
        const wires = [];
        const wireColors = ['#111', '#222', '#3a1a1a', '#1a2a3a', '#000'];
        for(let i=0; i<15; i++) {
            const startX = Math.random() * 400;
            const startY = Math.random() * 50; 
            const endX = Math.random() * 400; 
            const endY = 100 + Math.random() * 300; 
            wires.push({
                d: `M${startX} ${startY} C ${startX} ${startY + 100}, ${endX} ${endY - 100}, ${endX} ${endY}`,
                color: wireColors[Math.floor(Math.random() * wireColors.length)],
                width: 2 + Math.random() * 3
            });
        }
        return wires;
    }

    let gameState = {
        switches: Array(10).fill(false),
        doorOpen: false,
        masterUnlocked: false,
        generatorOn: false,
        errorCount: 0,
        isExploded: false,
        wireData: generateWireData()
    };

    // --- Onde a mágica acontece (Socket.io) ---
    io.on("connection", (socket) => {
        // Envia estado inicial
        socket.emit("init", gameState);

        socket.on("toggleDoor", () => {
            gameState.doorOpen = !gameState.doorOpen; 
            io.emit("updateDoor", gameState.doorOpen);
        });

        socket.on("toggleSwitch", (data) => {
            if (gameState.isExploded) return;
            gameState.switches[data.id] = data.status;
            io.emit("updateSwitch", data);
        });

        socket.on("triggerFail", () => {
            if (gameState.isExploded) return;
            gameState.switches.fill(false);
            gameState.errorCount++;

            if (gameState.errorCount >= 5) {
                gameState.isExploded = true;
                gameState.doorOpen = true; 
                io.emit("explosion"); 
                io.emit("updateDoor", true);
            } else {
                io.emit("failUpdate", { count: gameState.errorCount });
            }
        });

        socket.on("unlockMaster", () => {
            if (gameState.isExploded) return;
            gameState.masterUnlocked = true;
            io.emit("updateMasterLock");
        });

        socket.on("startEngine", () => {
            if (gameState.isExploded) return;
            gameState.generatorOn = true;
            io.emit("engineStarted");
        });

        socket.on("adminReset", (password) => {
            if (password === "theorder") {
                gameState = {
                    switches: Array(10).fill(false),
                    doorOpen: false,
                    masterUnlocked: false,
                    generatorOn: false,
                    errorCount: 0,
                    isExploded: false,
                    wireData: generateWireData()
                };
                io.emit("gameReset", gameState);
            }
        });
    });

    console.log(" > Módulo Carregado: Protocolo Fios");
};