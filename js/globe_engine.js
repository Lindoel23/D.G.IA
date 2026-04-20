/* --- public/js/globe_engine.js --- */
/* MOTOR DO GLOBO 3D D.G.IA — LERP Physics + Câmera Otimizada + SVGs Crosshair */

window.GlobeEngine = (function() {
    let canvas, ctx;
    let width, height, radius;
    let projection, path;
    let landFeatures = null;
    let allDots = [];
    let markers = [];
    
    // Ícones Dinâmicos SVG e PNG Tinted
    const icons = {
        exclamation: new Image(),
        question: new Image(),
        tower: new Image(),
        safehouse: new Image(),
        ocultista: new Image()
    };
    icons.exclamation.src = 'icons/exclamation.svg'; 
    icons.question.src = 'icons/question.svg';
    icons.tower.src = 'icons/tower.svg';
    icons.safehouse.src = 'icons/safehouse.svg';
    
    // Carregamento especial para png com tint Vermelho ("como SVG")
    icons.ocultista.src = 'assets/puzzle.png';
    let ocultistaTinted = null;
    icons.ocultista.onload = () => {
        const off = document.createElement('canvas');
        off.width = icons.ocultista.width || 256;
        off.height = icons.ocultista.height || 256;
        const octx = off.getContext('2d');
        octx.drawImage(icons.ocultista, 0, 0, off.width, off.height);
        octx.globalCompositeOperation = 'source-in';
        octx.fillStyle = '#ff4444';
        octx.fillRect(0, 0, off.width, off.height);
        ocultistaTinted = off;
    };
    
    // Variáveis de Estado
    let currentRot = [0, -15];
    let targetRot = [0, -15];
    let currentScale = 0;
    let targetScale = 0;
    
    let autoRotate = true;
    let autoRotateTimer = null;
    let isPicking = false;
    let pickCallback = null;
    let dataLoaded = false;
    let isDragging = false; 
    let isMissionFocused = false; 

    function getAccentColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#00ff88';
    }

    function hexToRgba(hex, alpha) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function pointInPolygon(point, polygon) {
        const [x, y] = point;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];
            if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
    }

    function pointInFeature(point, feature) {
        const geom = feature.geometry;
        if (geom.type === "Polygon") {
            if (!pointInPolygon(point, geom.coordinates[0])) return false;
            for (let i = 1; i < geom.coordinates.length; i++) {
                if (pointInPolygon(point, geom.coordinates[i])) return false;
            }
            return true;
        } else if (geom.type === "MultiPolygon") {
            for (const poly of geom.coordinates) {
                if (pointInPolygon(point, poly[0])) {
                    let inHole = false;
                    for (let i = 1; i < poly.length; i++) {
                        if (pointInPolygon(point, poly[i])) { inHole = true; break; }
                    }
                    if (!inHole) return true;
                }
            }
        }
        return false;
    }

    function generateDots(feature, spacing) {
        const dots = [];
        const bounds = d3.geoBounds(feature);
        const step = spacing * 0.09; 
        for (let lng = bounds[0][0]; lng <= bounds[1][0]; lng += step) {
            for (let lat = bounds[0][1]; lat <= bounds[1][1]; lat += step) {
                if (pointInFeature([lng, lat], feature)) {
                    dots.push({ lng, lat });
                }
            }
        }
        return dots;
    }

    function render() {
        if (!ctx) return;
        const accent = getAccentColor();
        ctx.clearRect(0, 0, width, height);

        const scale = projection.scale();
        const scaleFactor = scale / radius;
        const cx = width / 2, cy = height / 2;

        const glowGrad = ctx.createRadialGradient(cx, cy, scale * 0.95, cx, cy, scale * 1.3);
        glowGrad.addColorStop(0, hexToRgba(accent, 0.08));
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
        ctx.fillStyle = "#0a0a0a";
        ctx.fill();
        ctx.strokeStyle = hexToRgba(accent, 0.3);
        ctx.lineWidth = 2 * scaleFactor;
        ctx.stroke();

        if (landFeatures) {
            ctx.beginPath();
            landFeatures.features.forEach(f => path(f));
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1 * scaleFactor;
            ctx.stroke();

            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.45;
            allDots.forEach(dot => {
                const proj = projection([dot.lng, dot.lat]);
                if (proj) {
                    ctx.beginPath();
                    ctx.arc(proj[0], proj[1], 1 * scaleFactor, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
            ctx.globalAlpha = 1;

            markers.forEach(marker => {
                const proj = projection(marker.coords);
                if (proj) {
                    // Lerp de Opacidade (Fade Rápido ~200ms)
                    if (marker.currentOpacity === undefined) marker.currentOpacity = marker.targetOpacity !== undefined ? marker.targetOpacity : 1;
                    if (marker.targetOpacity === undefined) marker.targetOpacity = 1;
                    marker.currentOpacity += (marker.targetOpacity - marker.currentOpacity) * 0.15;
                    if (marker.currentOpacity < 0.01) return;

                    const color = marker.color || '#ff4444';
                    const ctxAlpha = marker.currentOpacity;

                    ctx.globalAlpha = ctxAlpha;
                    
                    // Pulso/Glow sutil estático
                    ctx.beginPath();
                    ctx.arc(proj[0], proj[1], 14 * scaleFactor, 0, 2 * Math.PI);
                    ctx.fillStyle = hexToRgba(color, 0.15 + Math.sin(Date.now() / 400) * 0.05);
                    ctx.fill();

                    // Ícone SVG ou Tinted PNG
                    const iconName = marker.missionData && marker.missionData.icon ? marker.missionData.icon : 'none';
                    let img = icons[iconName];
                    if (iconName === 'ocultista' && ocultistaTinted) {
                        img = ocultistaTinted;
                    }

                    // Tratamento dinâmico: se src não encontrado ou não natural do projeto, constrói on the fly ou tenta usar
                    const size = 26 * scaleFactor;
                    if ((img && img.complete) || (img && img.width)) {
                        // Desenha SVG importado se existir
                        ctx.drawImage(img, proj[0] - size/2, proj[1] - size/2, size, size);
                        // Borda sutil de apoio em volta da imagem para o canvas interpretar com clareza
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 1 * scaleFactor;
                        ctx.beginPath();
                        ctx.arc(proj[0], proj[1], 12 * scaleFactor, 0, 2 * Math.PI);
                        ctx.stroke();
                    } else {
                        // Fallback absoluto: Bolha clássica, caso falte path do SVG na view de canvas isolada
                        ctx.beginPath();
                        ctx.arc(proj[0], proj[1], 7 * scaleFactor, 0, 2 * Math.PI);
                        ctx.fillStyle = color;
                        ctx.fill();
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 2 * scaleFactor;
                        ctx.stroke();
                    }
                }
            });
            ctx.globalAlpha = 1;
        }

        // MIRA CENTRAL DO GLOBO (Puro eixo focal)
        if (isPicking) {
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 1.5;
            
            // Circulo vazio central
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
            ctx.stroke();

            // Lâmina vertical superior e inferior
            ctx.beginPath();
            ctx.moveTo(cx, cy - 20);
            ctx.lineTo(cx, cy - 10);
            ctx.moveTo(cx, cy + 10);
            ctx.lineTo(cx, cy + 20);
            ctx.stroke();

            // Lâmina horizontal esquerda e direita
            ctx.beginPath();
            ctx.moveTo(cx - 20, cy);
            ctx.lineTo(cx - 10, cy);
            ctx.moveTo(cx + 10, cy);
            ctx.lineTo(cx + 20, cy);
            ctx.stroke();
        }
    }

    function renderLoop() {
        if (dataLoaded) {
            // Auto Rotate só rola se não estiver com restrições
            if (autoRotate && !isDragging && !isMissionFocused && !isPicking) {
                targetRot[0] += 0.08;
            }

            // Normalizador Cíclico: impede que a rotação cresça infinitamente após horas aberto
            if (targetRot[0] > 720) {
                targetRot[0] -= 360;
                currentRot[0] -= 360;
            } else if (targetRot[0] < -720) {
                targetRot[0] += 360;
                currentRot[0] += 360;
            }

            currentRot[0] += (targetRot[0] - currentRot[0]) * 0.08;
            currentRot[1] += (targetRot[1] - currentRot[1]) * 0.08;
            currentScale += (targetScale - currentScale) * 0.15;

            projection.rotate(currentRot).scale(currentScale);
            render();
        }
        
        requestAnimationFrame(renderLoop);
    }

    function pauseAutoRotate() {
        autoRotate = false;
        clearTimeout(autoRotateTimer);
        // Garantia: Nunca recomeçar sozinho se tiver focado em detalhe ou no picking mode
        if (!isPicking && !isMissionFocused) {
            autoRotateTimer = setTimeout(() => { autoRotate = true; }, 4000);
        }
    }

    // Informar o sistema da nova coordenada central quando a câmera mexer no picking
    function emitPickCoordinate() {
        if (isPicking && pickCallback) {
            const coords = projection.invert([width/2, height/2]);
            if (coords) pickCallback({ lng: coords[0], lat: coords[1] });
        }
    }

    function setupMouseInteraction() {
        canvas.addEventListener('mousedown', (e) => {
            pauseAutoRotate();
            isDragging = true;
            let startX = e.clientX, startY = e.clientY;
            let startRot = [...targetRot];

            const move = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                targetRot[0] = startRot[0] + dx * 0.4;
                targetRot[1] = Math.max(-90, Math.min(90, startRot[1] - dy * 0.4));
            };
            const up = () => {
                isDragging = false;
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                emitPickCoordinate();
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.85 : 1.15;
            targetScale = Math.max(radius, Math.min(radius * 4, targetScale * factor));
            
            // Depois do Lerp escorregar, a projeção muda de escala. Como o centro é cravado, 
            // no centro as coordendas de lat/long não sofrem distorção de escala por estar ancoradas
        }, { passive: false });

        canvas.addEventListener('click', (e) => {
            if (isPicking) {
                // Durante picking, click solto no canvas força confirmação visual apenas
                emitPickCoordinate();
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            const scale = projection.scale();
            const scaleFactor = scale / radius;
            const hitRadius = 14 * scaleFactor;

            for (const marker of markers) {
                const proj = projection(marker.coords);
                if (proj) {
                    const dx = x - proj[0];
                    const dy = y - proj[1];
                    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
                        if (marker.onClick) marker.onClick(marker);
                        return;
                    }
                }
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDragging || isPicking) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            const scale = projection.scale();
            const scaleFactor = scale / radius;
            const hitRadius = 14 * scaleFactor;

            let isHovering = false;
            for (const marker of markers) {
                const proj = projection(marker.coords);
                if (proj) {
                    const dx = x - proj[0];
                    const dy = y - proj[1];
                    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
                        isHovering = true;
                        break;
                    }
                }
            }
            canvas.style.cursor = isHovering ? 'pointer' : 'grab';
        });
    }

    function setupTouchInteraction() {
        let lastTouchX, lastTouchY, lastTouchDist;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                isDragging = true;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                isDragging = false; 
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                pauseAutoRotate(); 
                const dx = e.touches[0].clientX - lastTouchX;
                const dy = e.touches[0].clientY - lastTouchY;
                targetRot[0] += dx * 0.4;
                targetRot[1] = Math.max(-90, Math.min(90, targetRot[1] - dy * 0.4));
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (lastTouchDist) {
                    const factor = dist / lastTouchDist;
                    targetScale = Math.max(radius, Math.min(radius * 4, targetScale * factor));
                }
                lastTouchDist = dist;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                isDragging = false;
                emitPickCoordinate();
                
                if (e.changedTouches.length === 1 && !isPicking) {
                    const rect = canvas.getBoundingClientRect();
                    const x = (e.changedTouches[0].clientX - rect.left) * (canvas.width / rect.width);
                    const y = (e.changedTouches[0].clientY - rect.top) * (canvas.height / rect.height);
                    const scale = projection.scale();
                    const sf = scale / radius;
                    const hr = 16 * sf;
                    for (const marker of markers) {
                        const proj = projection(marker.coords);
                        if (proj) {
                            const ddx = x - proj[0], ddy = y - proj[1];
                            if (ddx * ddx + ddy * ddy <= hr * hr) {
                                if (marker.onClick) marker.onClick(marker);
                                return;
                            }
                        }
                    }
                }
            }
            lastTouchDist = null;
        });
    }

    function handleResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        radius = Math.min(width, height) / 2.3;
        canvas.width = width;
        canvas.height = height;
        
        targetScale = Math.max(radius, Math.min(radius * 4, targetScale));
        
        if (targetScale < radius) targetScale = radius;
        if (currentScale < radius) currentScale = radius;
        
        projection.translate([width / 2, height / 2]);
    }

    function flyTo(lng, lat, withZoom = true) {
        isMissionFocused = true;
        
        let endX = -lng;
        let deltaX = (endX - currentRot[0]) % 360;
        
        if (deltaX > 180) deltaX -= 360;
        if (deltaX < -180) deltaX += 360;
        
        targetRot[0] = currentRot[0] + deltaX;
        targetRot[1] = -lat;
        
        if (withZoom) targetScale = radius * 1.3;
    }

    function resetFocus() {
        isMissionFocused = false;
        targetScale = radius;
    }

    return {
        init(canvasId) {
            canvas = document.getElementById(canvasId);
            ctx = canvas.getContext('2d');

            width = window.innerWidth;
            height = window.innerHeight;
            radius = Math.min(width, height) / 2.3;
            
            currentScale = radius;
            targetScale = radius;
            currentRot = [0, -15];
            targetRot = [0, -15];

            canvas.width = width;
            canvas.height = height;

            projection = d3.geoOrthographic()
                .scale(currentScale)
                .translate([width / 2, height / 2])
                .clipAngle(90);

            path = d3.geoPath().projection(projection).context(ctx);
            projection.rotate(currentRot);

            setupMouseInteraction();
            setupTouchInteraction();
            window.addEventListener('resize', handleResize);

            fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json')
                .then(r => r.json())
                .then(data => {
                    landFeatures = data;
                    data.features.forEach(f => {
                        allDots.push(...generateDots(f, 30));
                    });
                    dataLoaded = true;
                    requestAnimationFrame(renderLoop);
                    window.dispatchEvent(new Event('GlobeReady'));
                })
                .catch(err => {
                    console.error("GlobeEngine: Erro ao carregar geodados", err);
                    dataLoaded = true;
                    requestAnimationFrame(renderLoop);
                    window.dispatchEvent(new Event('GlobeReady'));
                });
        },
        setMarkers(markerList) { 
            markerList.forEach(nm => {
                const em = markers.find(m => m.id === nm.id);
                if (em && em.currentOpacity !== undefined) nm.currentOpacity = em.currentOpacity;
            });
            markers = markerList; 
        },
        setPickingMode(enabled, callback) {
            isPicking = enabled;
            pickCallback = callback;
            canvas.style.cursor = enabled ? 'crosshair' : 'grab';
            
            if (enabled) {
                autoRotate = false;
                clearTimeout(autoRotateTimer);
                // Reporta 0,0 imediato do eixo focal sem obrigar clique!
                emitPickCoordinate();
            } else {
                if (!isMissionFocused) autoRotate = true;
            }
        },
        flyTo,
        resetFocus,
        handleResize,
        getProjection() { return projection; }
    };
})();
