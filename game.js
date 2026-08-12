const canvas = document.getElementById("gameCanvas"); 
const ctx = canvas.getContext("2d"); 

const CHARACTERS = {     
    luke: { name: "Luke Skywalker", color: "#2ecc71", saberColor: "#2ecc71" },     
    ahsoka: { name: "Ahsoka Tano", color: "#3498db", saberColor: "#ffffff" },     
    anakin: { name: "Anakin Skywalker", color: "#00bfff", saberColor: "#00bfff" },     
    vader: { name: "Darth Vader", color: "#e74c3c", saberColor: "#ff4d4d" } 
};

window.selectCharacter = function(key, el) {     
    GAME.selectedCharKey = key;     
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));     
    if (el) el.classList.add('selected'); 
};

window.selectMission = function(mId, el) {     
    GAME.currentMission = mId;     
    document.querySelectorAll('.mission-btn').forEach(b => b.classList.remove('selected'));     
    if (el) el.classList.add('selected'); 
};

window.toggleFullscreen = function() {     
    const doc = window.document;     
    const docEl = doc.documentElement;     
    const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullScreen;     
    const cancelFS = doc.exitFullscreen || doc.webkitExitFullscreen;     
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {         
        if (requestFS) requestFS.call(docEl);     
    } else {         
        if (cancelFS) cancelFS.call(doc);     
    } 
};

window.buyShield = function() {     
    if (GAME.score >= 50) {         
        GAME.score -= 50;          
        const scoreText = document.getElementById("score-text");         
        if (scoreText) scoreText.innerText = GAME.score;         
        GAME.hasShield = true; GAME.shieldTimer = 300;         
        playSound('shield'); addParticles(GAME.player.x, GAME.player.y, "#00bfff", 15);     
    } 
};

window.startGame = function() {     
    window.toggleFullscreen();     
    const startScreen = document.getElementById("start-screen");     
    const scoreText = document.getElementById("score-text");     
    const tjFill = document.getElementById("tj-fill");          
    
    if (startScreen) startScreen.style.display = "none";     
    GAME.score = 0; if (scoreText) scoreText.innerText = GAME.score;     
    GAME.hasLightsaber = false; GAME.hasShield = false;     
    if (tjFill) tjFill.style.width = "0%";     
    GAME.startTime = Date.now();          
    
    buildMissionLevel(); // Removed difficulty parameter
    startBackgroundMusic();     
    GAME.state = "PLAYING"; 
};

function addParticles(x, y, color, count = 5) {     
    for (let i = 0; i < count; i++) {         
        GAME.particles.push({             
            x: x, y: y,             
            dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 - 2,             
            size: Math.random() * 6 + 3, color: color, life: 30         
        });     
    } 
}

function triggerWin(message) {     
    GAME.state = "WON";     
    const winScreen = document.getElementById("win-screen");     
    const winMessage = document.getElementById("win-message");     
    const finalTime = document.getElementById("final-time");     
    const finalStuds = document.getElementById("final-studs");     
    const trueJediBadge = document.getElementById("true-jedi-badge");     
    const timerText = document.getElementById("timer-text");     
    let formattedTime = timerText ? timerText.innerText : "00:00";     
    if (winMessage) winMessage.innerText = message;     
    if (finalTime) finalTime.innerText = formattedTime;     
    if (finalStuds) finalStuds.innerText = GAME.score;     
    if (trueJediBadge) trueJediBadge.style.display = GAME.score >= 100 ? "block" : "none";     
    for(let i = 0; i < 150; i++) {         
        addParticles(GAME.camera.x + 600, 200, ["#ffd700", "#00bfff", "#ff007f", "#2ecc71"][Math.floor(Math.random()*4)], 1);     
    }     
    if (winScreen) winScreen.style.display = "flex";     
    playSound('win'); 
}

const keys = { ArrowLeft: false, ArrowRight: false, Space: false, F: false, D: false }; 

window.addEventListener("keydown", (e) => {     
    if (e.code === "ArrowLeft") keys.ArrowLeft = true;     
    if (e.code === "ArrowRight") keys.ArrowRight = true;     
    if (e.code === "Space") {         
        if (!keys.Space && GAME.player.grounded) { playSound('jump'); GAME.player.scaleX = 0.7; GAME.player.scaleY = 1.3; }         
        keys.Space = true;     
    }     
    if (e.code === "KeyF") keys.F = true;     
    if (e.code === "KeyD") {         
        if (!keys.D && GAME.player.saberSwingTimer <= 0) {             
            GAME.player.saberSwingTimer = 15;             
            playSound('slash');         
        }         
        keys.D = true;     
    } 
});

window.addEventListener("keyup", (e) => {     
    if (e.code === "ArrowLeft") keys.ArrowLeft = false;     
    if (e.code === "ArrowRight") keys.ArrowRight = false;     
    if (e.code === "Space") keys.Space = false;     
    if (e.code === "KeyF") keys.F = false;     
    if (e.code === "KeyD") keys.D = false; 
});

function bindTouch(id, keyName) {     
    const btn = document.getElementById(id);     
    if (!btn) return;     
    btn.addEventListener("touchstart", (e) => {         
        e.preventDefault(); keys[keyName] = true;         
        if (keyName === 'Space' && GAME.player.grounded) { playSound('jump'); GAME.player.scaleX = 0.7; GAME.player.scaleY = 1.3; }         
        if (keyName === 'D' && GAME.player.saberSwingTimer <= 0) { GAME.player.saberSwingTimer = 15; playSound('slash'); }     
    });     
    btn.addEventListener("touchend", (e) => { e.preventDefault(); keys[keyName] = false; }); 
}

bindTouch("btn-left", "ArrowLeft"); bindTouch("btn-right", "ArrowRight"); bindTouch("btn-jump", "Space"); bindTouch("btn-force", "F"); bindTouch("btn-attack", "D");

function resetPlayer() {     
    if (GAME.hasShield) return;     
    GAME.player.x = GAME.lastSafeX; GAME.player.y = 300; GAME.player.dx = 0; GAME.player.dy = 0;     
    GAME.deathMessageTimer = 90; GAME.camera.shake = 12;     
    GAME.forceContainers.forEach(fc => fc.y = fc.baseY); 
}

function update() {     
    if (GAME.state !== "PLAYING") return;     
    GAME.elapsedTime = Date.now() - GAME.startTime;     
    let mins = Math.floor(GAME.elapsedTime / 60000);     
    let secs = Math.floor((GAME.elapsedTime % 60000) / 1000);     
    let ms = Math.floor((GAME.elapsedTime % 1000) / 100);     
    const timerText = document.getElementById("timer-text");     
    if (timerText) timerText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;     
    
    if (GAME.shieldTimer > 0) GAME.shieldTimer--; else GAME.hasShield = false;     
    if (GAME.player.saberSwingTimer > 0) GAME.player.saberSwingTimer--;     
    
    if (keys.ArrowLeft) { GAME.player.dx -= 1.2; GAME.player.facing = 'left'; }     
    if (keys.ArrowRight) { GAME.player.dx += 1.2; GAME.player.facing = 'right'; }     
    if (keys.Space && GAME.player.grounded) { GAME.player.dy = GAME.player.jumpPower; GAME.player.grounded = false; }     
    
    GAME.player.dy += GAME.gravity; GAME.player.dx *= GAME.friction;     
    GAME.player.scaleX += (1 - GAME.player.scaleX) * 0.15;     
    GAME.player.scaleY += (1 - GAME.player.scaleY) * 0.15;     
    
    // Moving Platforms
    GAME.movingPlatforms.forEach(mp => {         
        if (mp.isMoving) {             
            if (mp.dx) { mp.x += mp.dx; if (mp.x > mp.maxX || mp.x < mp.minX) mp.dx *= -1; }
            if (mp.dy) { mp.y += mp.dy; if (mp.y > mp.maxY || mp.y < mp.minY) mp.dy *= -1; }
        }     
    });     

    const solidObjects = GAME.platforms    
        .concat(GAME.crates)         
        .concat(GAME.forceContainers)         
        .concat(GAME.laserGates.filter(g => !g.destroyed));     

    GAME.player.x += GAME.player.dx;     
    solidObjects.forEach(s => {         
        if (GAME.player.x < s.x + s.width && GAME.player.x + GAME.player.width > s.x && GAME.player.y < s.y + s.height && GAME.player.y + GAME.player.height > s.y) {             
            if (GAME.player.dx > 0) GAME.player.x = s.x - GAME.player.width;             
            else if (GAME.player.dx < 0) GAME.player.x = s.x + s.width;             
            GAME.player.dx = 0;         
        }     
    });     

    GAME.player.y += GAME.player.dy;     
    GAME.player.grounded = false;     
    solidObjects.forEach(s => {         
        if (GAME.player.x < s.x + s.width && GAME.player.x + GAME.player.width > s.x && GAME.player.y < s.y + s.height && GAME.player.y + GAME.player.height > s.y) {             
            if (GAME.player.dy > 0) {                 
                if (!GAME.player.grounded) { GAME.player.scaleX = 1.2; GAME.player.scaleY = 0.8; }                 
                GAME.player.grounded = true; GAME.player.dy = 0; GAME.player.y = s.y - GAME.player.height;                 
                if (s.y >= 480) GAME.lastSafeX = Math.max(50, GAME.player.x - 30);             
            } else if (GAME.player.dy < 0) {                 
                GAME.player.y = s.y + s.height; GAME.player.dy = 0;             
            }         
        }     
    });     

    // Lightsaber Attack
    if (GAME.player.saberSwingTimer > 0) {         
        let attackBoxX = GAME.player.facing === 'right' ? GAME.player.x + GAME.player.width : GAME.player.x - 40;         
        let attackBox = { x: attackBoxX, y: GAME.player.y - 20, width: 40, height: GAME.player.height + 40 };         
        GAME.laserGates.forEach(gate => {             
            if (!gate.destroyed && attackBox.x < gate.x + gate.width && attackBox.x + attackBox.width > gate.x && attackBox.y < gate.y + gate.height && attackBox.y + attackBox.height > gate.y) {                 
                gate.destroyed = true;                 
                playSound('gateBreak');                 
                addParticles(gate.x + 10, gate.y + gate.height/2, "#ff0055", 25);                 
                GAME.score += 20;                 
                const scoreText = document.getElementById("score-text");                 
                if (scoreText) scoreText.innerText = GAME.score;             
            }         
        });     
    }     

    // Ride Moving Platforms
    GAME.movingPlatforms.forEach(p => {         
        let prevPlayerBottom = (GAME.player.y - GAME.player.dy) + GAME.player.height;         
        if (GAME.player.x < p.x + p.width && GAME.player.x + GAME.player.width > p.x) {             
            if (GAME.player.dy >= 0 && prevPlayerBottom <= p.y + 12 && GAME.player.y + GAME.player.height >= p.y) {                 
                GAME.player.grounded = true; GAME.player.dy = 0; GAME.player.y = p.y - GAME.player.height;                 
                if (p.isMoving) {
                    if (p.dx) GAME.player.x += p.dx;
                    if (p.dy) GAME.player.y += p.dy;
                }             
            }         
        }     
    });     

    // Droids Interaction & Timer
    GAME.droids.forEach(d => {         
        let dist = Math.hypot((GAME.player.x + 24) - (d.x + 20), (GAME.player.y + 24) - d.y);         
        if (d.textTimer > 0) d.textTimer--;
        
        if (keys.F && dist < 420) {             
            d.isFloating = true; d.y -= 3;             
            if (d.y < 300) d.y = 300;             
            d.bounceY = Math.sin(Date.now() / 100) * 8;             
            addParticles(d.x + 20, d.y + 20, "#e0aaff", 1);             
        } else {             
            d.isFloating = false;             
            if (d.y < d.baseY) {                 
                d.y += 5; if (d.y > d.baseY) d.y = d.baseY;             
            } else {                 
                d.x += d.dx;                 
                if (d.x > d.maxX || d.x < d.minX) d.dx *= -1;             
            }         
        }         
        if (d.bounceY > 0 && !d.isFloating) d.bounceY -= 1;         
        if (dist < 45 && d.textTimer === 0 && !d.isFloating) {             
            d.bounceY = 12; d.textTimer = 60; playSound(d.type);             
            addParticles(d.x + 20, d.y, "#00bfff", 6);             
            GAME.score += 5;              
            const scoreText = document.getElementById("score-text");             
            const tjFill = document.getElementById("tj-fill");             
            if (scoreText) scoreText.innerText = GAME.score;             
            if (tjFill) tjFill.style.width = Math.min(100, (GAME.score / 100) * 100) + "%";         
        }     
    });     

    // Force Lift
    GAME.forceContainers.forEach(fc => {         
        let dist = Math.abs((GAME.player.x + GAME.player.width/2) - (fc.x + fc.width/2));         
        if (keys.F && dist < 420) {             
            fc.y -= 4.5; fc.isHovering = true;             
            if (fc.y < 60) fc.y = 60;             
            GAME.camera.shake = Math.random() * 2;             
            addParticles(fc.x + Math.random() * fc.width, fc.y + fc.height, "#e0aaff", 2);         
        } else {             
            fc.isHovering = false; fc.y += 8;             
            if (fc.y > fc.baseY) fc.y = fc.baseY;         
        }     
    });     

    // Stud / Coin Pickup
    GAME.studs.forEach(s => {         
        if (!s.collected && Math.hypot((GAME.player.x + 24) - s.x, (GAME.player.y + 24) - s.y) < 32) {             
            s.collected = true; GAME.score += 10;             
            const scoreText = document.getElementById("score-text");             
            const tjFill = document.getElementById("tj-fill");             
            if (scoreText) scoreText.innerText = GAME.score;             
            if (tjFill) tjFill.style.width = Math.min(100, (GAME.score / 100) * 100) + "%";             
            playSound('stud'); addParticles(s.x, s.y, s.color, 8);         
        }     
    });     
// Jump Pads (Fires the player up!)
    GAME.jumpPads.forEach(pad => {         
        if (GAME.player.x < pad.x + pad.width && GAME.player.x + GAME.player.width > pad.x && 
            GAME.player.y + GAME.player.height >= pad.y && GAME.player.y < pad.y + pad.height) {             
            GAME.player.dy = -22; // This is the massive upward boost
            playSound('jump'); 
            GAME.camera.shake = 8;             
            addParticles(pad.x + 30, pad.y, "#00ffcc", 10);         
        }     
    });

    // Particle Cleanup (Reverse Loop to prevent array skip / stuck particles)
    for (let i = GAME.particles.length - 1; i >= 0; i--) {
        
// Particle Cleanup (Reverse Loop to prevent array skip / stuck particles)
    for (let i = GAME.particles.length - 1; i >= 0; i--) {
        let p = GAME.particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) {
            GAME.particles.splice(i, 1);
        }
    }

    // --- ADD THIS NEW BLOCK HERE ---
    // MISSION 1: OBI-WAN & LIGHTSABER LOGIC
    if (GAME.currentMission === 1) {
        
        // 1. Did the player touch the lightsaber?
        if (!GAME.hasLightsaber && 
            GAME.player.x < GAME.lightsaber.x + GAME.lightsaber.width && 
            GAME.player.x + GAME.player.width > GAME.lightsaber.x && 
            GAME.player.y < GAME.lightsaber.y + GAME.lightsaber.height && 
            GAME.player.y + GAME.player.height > GAME.lightsaber.y) {         
            
            GAME.hasLightsaber = true; 
            playSound('win'); 
            addParticles(GAME.lightsaber.x, GAME.lightsaber.y, "#00ff00", 25);     
        }     

        // 2. Dialogue Box for Obi-Wan
        let distObi = Math.abs(GAME.player.x - GAME.obi.x);     
        const dialogueBox = document.getElementById("dialogue-box");     
        const dialogueText = document.getElementById("dialogue-text");     
        
        if (distObi < 150 && GAME.player.y > 400) {         
            if (GAME.hasLightsaber) {
                triggerWin("Returned Obi-Wan's Lightsaber!");         
            } else {              
                if (dialogueBox) dialogueBox.style.display = "block";              
                if (dialogueText) dialogueText.innerText = "Obi-Wan: Hello there! I lost my lightsaber. Can you help me find it?";          
            }     
        } else { 
            if (dialogueBox) dialogueBox.style.display = "none"; 
        }
    }
    // -------------------------------

    if (GAME.player.y > 800) resetPlayer();  
    if (GAME.deathMessageTimer > 0) GAME.deathMessageTimer--;     
    if (GAME.player.x < 0) GAME.player.x = 0;     
    if (GAME.player.x + GAME.player.width > GAME.worldWidth) GAME.player.x = GAME.worldWidth - GAME.player.width;     
    
    let targetCamX = GAME.player.x - canvas.width / 2 + GAME.player.width / 2;     
    GAME.camera.x += (targetCamX - GAME.camera.x) * 0.1;     
    if (GAME.camera.x < 0) GAME.camera.x = 0;     
    if (GAME.camera.x > GAME.worldWidth - canvas.width) GAME.camera.x = GAME.worldWidth - canvas.width;     
    if (GAME.camera.shake > 0) GAME.camera.shake *= 0.88; 
}

function drawLegoPlatform(p) {     
    if (p.isGround) {         
        let img = ASSETS['ground'];         
        if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {             
            try {                 
                let pattern = ctx.createPattern(img, 'repeat');                 
                if (pattern) {                     
                    ctx.fillStyle = pattern;                     
                    drawRoundedRect(ctx, p.x, p.y, p.width, p.height, 6);                     
                    ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();                     
                    return;                 
                }             
            } catch (e) {}         
        }         
        ctx.fillStyle = "#6e3f19"; drawRoundedRect(ctx, p.x, p.y, p.width, p.height, 6);         
        ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();                  
        ctx.fillStyle = "#2ecc71"; ctx.fillRect(p.x, p.y, p.width, 10);         
        ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.strokeRect(p.x, p.y, p.width, 10);         
        return;     
    }     
    let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);     
    grad.addColorStop(0, p.isMoving ? "#34495e" : "#2c3e50");     
    grad.addColorStop(1, "#1a252f");          
    ctx.fillStyle = grad; drawRoundedRect(ctx, p.x, p.y, p.width, p.height, 8);     
    ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();     
    ctx.fillStyle = p.isMoving ? "#e67e22" : "#00bfff";     
    ctx.fillRect(p.x, p.y, p.width, 3);     
    let studSpacing = 22;     
    let studCount = Math.floor(p.width / studSpacing);     
    for (let i = 0; i < studCount; i++) {         
        let sx = p.x + (i * studSpacing) + 11;         
        let sy = p.y - 4;         
        ctx.fillStyle = p.isMoving ? "#d35400" : "#0097e6";         
        ctx.fillRect(sx - 5, sy, 10, 4);         
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(sx - 5, sy, 10, 1);     
    } 
}

function draw() {     
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);     
    bgGrad.addColorStop(0, "#090a14"); bgGrad.addColorStop(0.5, "#160e2e"); bgGrad.addColorStop(1, "#281140");     
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);     
    ctx.save();      
    
    let shakeX = (Math.random() - 0.5) * GAME.camera.shake;     
    let shakeY = (Math.random() - 0.5) * GAME.camera.shake;     
    ctx.translate(-GAME.camera.x + shakeX, shakeY);     
    
    try { GAME.stars.forEach(s => { ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`; ctx.fillRect(s.x, s.y, s.size, s.size); }); } catch(e) {}     
    try { GAME.buildings.forEach(b => drawBuilding(ctx, b)); } catch(e) {}     
    try { GAME.vaporators.forEach(v => drawVaporator(ctx, v)); } catch(e) {}     
    try {         
        GAME.waterPits.forEach(wp => {             
            ctx.fillStyle = "#00d2d3"; ctx.shadowBlur = 15; ctx.shadowColor = "#00d2d3";             
            ctx.fillRect(wp.x, wp.y, wp.width, 100);             
            ctx.fillStyle = "#54a0ff";             
            ctx.fillRect(wp.x, wp.y + Math.sin(Date.now()/200)*3, wp.width, 6);             
            ctx.shadowBlur = 0;         
        });     
    } catch(e) {}     
    try { GAME.platforms.concat(GAME.movingPlatforms).forEach(p => drawLegoPlatform(p)); } catch(e) {}     
    try {         
        GAME.forceContainers.forEach(fc => drawForceObject(ctx, fc));         
        GAME.crates.forEach(c => drawForceObject(ctx, c));     
    } catch(e) {}     
    try { GAME.laserGates.forEach(g => drawLaserGate(ctx, g)); } catch(e) {}     
    try {         
        GAME.studs.forEach(s => {             
            if (!s.collected) {                 
                ctx.shadowBlur = 10; ctx.shadowColor = s.color;                 
                ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2); ctx.fill();                 
                ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x - 2, s.y - 2, 2.5, 0, Math.PI*2); ctx.fill();                 
                ctx.shadowBlur = 0;             
            }         
        });     
    } catch(e) {}     
    try {         
        GAME.droids.forEach(d => drawDroid(ctx, d));         
        GAME.npcs.forEach(n => drawNPC(ctx, n));         
        GAME.jumpPads.forEach(pad => { ctx.fillStyle = pad.color; ctx.fillRect(pad.x, pad.y, pad.width, pad.height); });     
    } catch(e) {}     
    try {         
        GAME.particles.forEach(p => {             
            ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();         
        });     
    } catch(e) {}     
    
    // Player Character & Saber Swing
    try {
        if (GAME.currentMission === 1) {
            if (ASSETS['obi'] && ASSETS['obi'].complete && ASSETS['obi'].naturalWidth > 0) {
                ctx.drawImage(ASSETS['obi'], GAME.obi.x, GAME.obi.y, 50, 50);
            } else if (typeof drawObiWan === 'function') {
                drawObiWan(ctx, GAME.obi.x, GAME.obi.y);
            }
            if (!GAME.hasLightsaber) {
                let floatY = GAME.lightsaber.y + Math.sin(Date.now() / 150) * 8;
                ctx.fillStyle = "#bdc3c7";
                ctx.fillRect(GAME.lightsaber.x - 2, floatY + 30, 16, 18);
                ctx.fillStyle = "#2ecc71"; ctx.shadowBlur = 20; ctx.shadowColor = "#2ecc71";
                ctx.fillRect(GAME.lightsaber.x, floatY, 12, 30);
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#2ecc71"; ctx.font = "bold 13px 'Comic Sans MS'"; ctx.textAlign = "center";
                ctx.fillText("Obi-Wan's Lightsaber", GAME.lightsaber.x + 6, floatY - 12);
            }
        }
    } catch(e) {}
    
    try {         
        ctx.save();         
        ctx.translate(GAME.player.x + GAME.player.width/2, GAME.player.y + GAME.player.height);         
        ctx.scale(GAME.player.scaleX, GAME.player.scaleY);         
        
        if (GAME.hasShield) {             
            ctx.strokeStyle = "#00bfff"; ctx.lineWidth = 4; ctx.shadowBlur = 15; ctx.shadowColor = "#00bfff";             
            ctx.beginPath(); ctx.arc(0, -GAME.player.height/2, GAME.player.width/1.2, 0, Math.PI*2); ctx.stroke();             
            ctx.shadowBlur = 0;         
        }         
        
        let currentChar = CHARACTERS[GAME.selectedCharKey];         
        ctx.fillStyle = currentChar.color;         
        ctx.fillRect(-GAME.player.width/2 + 8, -GAME.player.height + 15, GAME.player.width - 16, 20);         
        ctx.fillStyle = "#f1c40f";         
        ctx.beginPath(); ctx.arc(0, -GAME.player.height + 10, 10, 0, Math.PI*2); ctx.fill();         
        ctx.fillStyle = "#2c3e50";         
        ctx.fillRect(-GAME.player.width/2 + 10, -GAME.player.height + 35, GAME.player.width - 20, 13);         
        ctx.strokeStyle = "#000"; ctx.lineWidth = 2.5;         
        ctx.strokeRect(-GAME.player.width/2 + 8, -GAME.player.height + 15, GAME.player.width - 16, 20);         
        
        if (GAME.player.saberSwingTimer > 0 || GAME.hasLightsaber) {             
            ctx.save();             
            let swingProgress = (15 - GAME.player.saberSwingTimer) / 15;             
            let swingAngle = GAME.player.facing === 'right' ? (-Math.PI/2 + (swingProgress * Math.PI)) : (Math.PI/2 - (swingProgress * Math.PI));                          
            ctx.translate(GAME.player.facing === 'right' ? 10 : -10, -GAME.player.height + 25);             
            ctx.rotate(swingAngle);             
            ctx.shadowBlur = 20; ctx.shadowColor = currentChar.saberColor;             
            ctx.fillStyle = currentChar.saberColor;             
            ctx.fillRect(0, -35, 6, 35);             
            ctx.shadowBlur = 0;             
            ctx.restore();         
        }         
        ctx.restore();     
    } catch(e) {}     
    ctx.restore();     
    
    if (GAME.deathMessageTimer > 0) {         
        ctx.fillStyle = "#e74c3c"; ctx.font = "bold 28px 'Comic Sans MS'";         
        ctx.fillText("Oops! Respawning safe...", canvas.width/2 - 140, 200);     
    } 
}

function gameLoop() {     
    update(); draw(); requestAnimationFrame(gameLoop); 
}

gameLoop();
