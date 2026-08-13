const canvas = document.getElementById("gameCanvas"); 
const ctx = canvas.getContext("2d"); 

const CHARACTERS = {     
    luke: { name: "Luke Skywalker", color: "#2ecc71", saberColor: "#2ecc71" },     
    ahsoka: { name: "Ahsoka Tano", color: "#e67e22", saberColor: "#ffffff" },     
    anakin: { name: "Anakin Skywalker", color: "#00bfff", saberColor: "#00bfff" },     
    vader: { name: "Darth Vader", color: "#111111", saberColor: "#ff0000" } 
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
    if (GAME.score >= 10) {         
        GAME.score -= 10;          
        const scoreText = document.getElementById("score-text");         
        if (scoreText) scoreText.innerText = GAME.score;         
        GAME.hasShield = true; GAME.shieldTimer = 300;         
        playSound('shield'); addParticles(GAME.player.x, GAME.player.y, "#00bfff", 15);     
    } 
};

let pauseTimeStart = 0;

window.togglePause = function() {
    const pauseScreen = document.getElementById("pause-screen");
    const dialogueBox = document.getElementById("dialogue-box");

    if (GAME.state === "PLAYING") {
        GAME.state = "PAUSED";
        pauseTimeStart = Date.now();
        if (pauseScreen) pauseScreen.style.display = "flex";
        if (dialogueBox) dialogueBox.style.display = "none";
        
        if (typeof bgMusic !== 'undefined' && bgMusic) {
            bgMusic.pause();
        }
    } else if (GAME.state === "PAUSED") {
        GAME.state = "PLAYING";
        GAME.startTime += (Date.now() - pauseTimeStart);
        if (pauseScreen) pauseScreen.style.display = "none";
        
        if (typeof isMuted !== 'undefined' && !isMuted && typeof bgMusic !== 'undefined' && bgMusic) {
            bgMusic.play().catch(() => {});
        }
    }
};

window.goToMainMenu = function() {
    GAME.state = "START";
    
    const pauseScreen = document.getElementById("pause-screen");
    const winScreen = document.getElementById("win-screen");
    const startScreen = document.getElementById("start-screen");
    const dialogueBox = document.getElementById("dialogue-box");
    
    if (pauseScreen) pauseScreen.style.display = "none";
    if (winScreen) winScreen.style.display = "none";
    if (dialogueBox) dialogueBox.style.display = "none";
    if (startScreen) startScreen.style.display = "flex";
    
    if (typeof bgMusic !== 'undefined' && bgMusic) {
        bgMusic.pause();
    }
};

window.startGame = function() {     
    if (window.audioCtx && window.audioCtx.state === 'suspended') {
        window.audioCtx.resume().catch(() => {});
    }

    window.toggleFullscreen();     
    const startScreen = document.getElementById("start-screen");     
    const scoreText = document.getElementById("score-text");     
    const tjFill = document.getElementById("tj-fill");         
    
    if (startScreen) startScreen.style.display = "none";     
    GAME.score = 0; if (scoreText) scoreText.innerText = GAME.score;     
    GAME.hasLightsaber = false; GAME.hasShield = false;     
    if (tjFill) tjFill.style.width = "0%";     
    GAME.startTime = Date.now();         
    
    buildMissionLevel();
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

const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, Space: false, F: false, D: false };

window.addEventListener("keydown", (e) => {     
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.ArrowLeft = true;     
    if (e.code === "ArrowRight") keys.ArrowRight = true; // Fixed: Removed "KeyD" from here!
    if (e.code === "ArrowUp" || e.code === "KeyW") keys.ArrowUp = true;     
    if (e.code === "ArrowDown" || e.code === "KeyS") keys.ArrowDown = true;     
    if (e.code === "Space") {         
        if (!keys.Space && GAME.player.grounded) { 
            playSound('jump'); 
            GAME.player.scaleX = 0.7; 
            GAME.player.scaleY = 1.3; 
        }         
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
    if (e.code === "Escape" || e.code === "KeyP") {
        if (GAME.state === "PLAYING" || GAME.state === "PAUSED") {
            togglePause();
        }
    }
});

window.addEventListener("keyup", (e) => {     
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.ArrowLeft = false;     
    if (e.code === "ArrowRight") keys.ArrowRight = false;     
    if (e.code === "ArrowUp" || e.code === "KeyW") keys.ArrowUp = false;     
    if (e.code === "ArrowDown" || e.code === "KeyS") keys.ArrowDown = false;     
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
    // --- SPACESHIP TAKEOFF CUTSCENE ---
    if (GAME.state === "CUTSCENE_SHIP") {
        if (GAME.spaceship.cutsceneTimer === undefined) GAME.spaceship.cutsceneTimer = 0;
        GAME.spaceship.cutsceneTimer++;

        if (GAME.spaceship.cutsceneTimer < 120) {
            GAME.camera.shake = 4;
        } else {
            if (!GAME.spaceship.dy) GAME.spaceship.dy = -0.5;
            GAME.spaceship.dy -= 0.06;
            GAME.spaceship.y += GAME.spaceship.dy;
            GAME.camera.shake = 8;
        }

        let engineX = GAME.spaceship.x + 10;
        let engineY = GAME.spaceship.y + 105;
        for (let i = 0; i < 5; i++) {
            GAME.particles.push({
                x: engineX + (Math.random() - 0.5) * 20,
                y: engineY,
                dx: (Math.random() - 0.5) * 4,
                dy: Math.random() * 6 + 4,
                size: Math.random() * 10 + 4,
                color: ["#ff4757", "#ffa502", "#eccc68", "#ffffff"][Math.floor(Math.random() * 4)],
                life: 25
            });
        }

        for (let i = GAME.particles.length - 1; i >= 0; i--) {
            let p = GAME.particles[i];
            p.x += p.dx; p.y += p.dy; p.life--;
            if (p.life <= 0) GAME.particles.splice(i, 1);
        }

        if (GAME.spaceship.y < -400) {
            triggerWin("Escaped with 200 Coins!");
        }
        return;
    }

    // --- MISSION 1: JUMP CELEBRATION CUTSCENE ---
    if (GAME.state === "CUTSCENE_JUMP") {
        if (GAME.cutsceneTimer === undefined) GAME.cutsceneTimer = 0;
        GAME.cutsceneTimer++;

        let playerBounce = Math.abs(Math.sin(GAME.cutsceneTimer * 0.18)) * 35;
        let obiBounce = Math.abs(Math.sin(GAME.cutsceneTimer * 0.18 + 0.4)) * 35;

        GAME.player.y = GAME.player.baseY - playerBounce;
        GAME.obi.y = GAME.obi.baseY - obiBounce;

        if (GAME.cutsceneTimer % 5 === 0) {
            let colors = ["#ffd700", "#00bfff", "#ff007f", "#2ecc71", "#ffffff"];
            addParticles(GAME.player.x + 24, GAME.player.y + 30, colors[Math.floor(Math.random() * colors.length)], 3);
            addParticles(GAME.obi.x + 25, GAME.obi.y + 30, colors[Math.floor(Math.random() * colors.length)], 3);
        }

        for (let i = GAME.particles.length - 1; i >= 0; i--) {
            let p = GAME.particles[i];
            p.x += p.dx; p.y += p.dy; p.life--;
            if (p.life <= 0) GAME.particles.splice(i, 1);
        }

        if (GAME.cutsceneTimer > 600) {
            GAME.player.y = GAME.player.baseY;
            GAME.obi.y = GAME.obi.baseY;
            triggerWin("Returned Obi-Wan's Lightsaber!");
        }
        return;
    }

    // --- MISSION 3: MOON LANDING CUTSCENE ---
    if (GAME.state === "CUTSCENE_LANDING") {
        if (GAME.cutsceneTimer === undefined) GAME.cutsceneTimer = 0;
        GAME.cutsceneTimer++;

        GAME.player.x += 2.5;
        if (GAME.player.y < GAME.moon.y + 80) GAME.player.y += 0.8;
        if (GAME.player.y > GAME.moon.y + 80) GAME.player.y -= 0.8;

        addParticles(GAME.player.x, GAME.player.y + 15, "#ff9f43", 2);

        if (GAME.cutsceneTimer > 180) {
            triggerWin("Landed Safely on the Secret Moon Base!");
        }
        return;
    }

    if (GAME.state !== "PLAYING") return;
    
    GAME.elapsedTime = Date.now() - GAME.startTime;  
    let mins = Math.floor(GAME.elapsedTime / 60000);     
    let secs = Math.floor((GAME.elapsedTime % 60000) / 1000);     
    let ms = Math.floor((GAME.elapsedTime % 1000) / 100);     
    const timerText = document.getElementById("timer-text");     
    if (timerText) timerText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;     
    
    if (GAME.shieldTimer > 0) GAME.shieldTimer--; else GAME.hasShield = false;     
    if (GAME.player.saberSwingTimer > 0) GAME.player.saberSwingTimer--;     
    
    // --- MISSION 3: ZERO-GRAVITY FLIGHT & SHOOTING ---
    if (GAME.currentMission === 3) {
        if (keys.ArrowLeft) GAME.player.dx -= 1.2;
        if (keys.ArrowRight) GAME.player.dx += 1.2;
        if (keys.ArrowUp) GAME.player.dy -= 1.2;
        if (keys.ArrowDown) GAME.player.dy += 1.2;

        GAME.player.dx *= GAME.friction;
        GAME.player.dy *= GAME.friction;

        GAME.player.x += GAME.player.dx;
        GAME.player.y += GAME.player.dy;

        if (GAME.player.y < 30) { GAME.player.y = 30; GAME.player.dy = 0; }
        if (GAME.player.y > 490) { GAME.player.y = 490; GAME.player.dy = 0; }

        if (!GAME.playerLasers) GAME.playerLasers = [];
        if (keys.D && (GAME.player.shootTimer || 0) <= 0) {
            GAME.player.shootTimer = 10;
            GAME.playerLasers.push({
                x: GAME.player.x + GAME.player.width,
                y: GAME.player.y + GAME.player.height / 2 - 3,
                width: 22,
                height: 6,
                dx: 16
            });
            playSound('laser');
        }
        if (GAME.player.shootTimer > 0) GAME.player.shootTimer--;

        // Move Lasers forward & check hits
        for (let i = GAME.playerLasers.length - 1; i >= 0; i--) {
            let l = GAME.playerLasers[i];
            l.x += l.dx;
            let hit = false;

            if (GAME.asteroids) {
                GAME.asteroids.forEach(ast => {
                    if (!hit && ast.active && Math.hypot(l.x - ast.x, l.y - ast.y) < ast.radius) {
                        hit = true;
                        if (ast.destructible) {
                            ast.hp--;
                            addParticles(l.x, l.y, "#ff9f43", 8);
                            if (ast.hp <= 0) {
                                ast.active = false;
                                addParticles(ast.x, ast.y, "#a4b0be", 20);
                                playSound('gateBreak');
                            }
                        } else {
                            addParticles(l.x, l.y, "#ffffff", 5);
                        }
                    }
                });
            }

            if (GAME.shieldGenerators) {
                GAME.shieldGenerators.forEach(gen => {
                    if (!hit && gen.active && l.x > gen.x && l.x < gen.x + gen.width && l.y > gen.y && l.y < gen.y + gen.height) {
                        hit = true;
                        gen.hp--;
                        addParticles(l.x, l.y, "#00bfff", 12);
                        playSound('gateBreak');
                        if (gen.hp <= 0) {
                            gen.active = false;
                            addParticles(gen.x + gen.width/2, gen.y + gen.height/2, "#00bfff", 30);
                            if (GAME.shieldBarriers) {
                                GAME.shieldBarriers.forEach(sb => {
                                    if (sb.targetId === gen.id) sb.active = false;
                                });
                            }
                        }
                    }
                });
            }

            if (hit || l.x > GAME.camera.x + canvas.width + 100) {
                GAME.playerLasers.splice(i, 1);
            }
        }

        if (GAME.asteroids) {
            GAME.asteroids.forEach(ast => {
                if (!ast.active) return;
                if (ast.dy) {
                    ast.y += ast.dy;
                    if (ast.y > ast.maxY || ast.y < ast.minY) ast.dy *= -1;
                }
                if (ast.dx) {
                    ast.x += ast.dx;
                    if (ast.x > ast.maxX || ast.x < ast.minX) ast.dx *= -1;
                }

                let dist = Math.hypot((GAME.player.x + 20) - ast.x, (GAME.player.y + 15) - ast.y);
                if (dist < ast.radius + 18) {
                    let angle = Math.atan2((GAME.player.y + 15) - ast.y, (GAME.player.x + 20) - ast.x);
                    GAME.player.x = ast.x + Math.cos(angle) * (ast.radius + 19);
                    GAME.player.y = ast.y + Math.sin(angle) * (ast.radius + 19);
                    GAME.camera.shake = 3;
                }
            });
        }

        if (GAME.shieldBarriers) {
            GAME.shieldBarriers.forEach(sb => {
                if (sb.active && GAME.player.x < sb.x + sb.width && GAME.player.x + GAME.player.width > sb.x &&
                    GAME.player.y < sb.y + sb.height && GAME.player.y + GAME.player.height > sb.y) {
                    GAME.player.x = sb.x - GAME.player.width;
                }
            });
        }

        if (GAME.moon && GAME.player.x + GAME.player.width >= GAME.moon.x - 50) {
            if (GAME.state === "PLAYING") {
                GAME.state = "CUTSCENE_LANDING";
                GAME.cutsceneTimer = 0;
            }
        }
    } 
    // --- MISSIONS 1 & 2: STANDARD PLATFORMER MOVEMENT ---
    else {
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
    }

    // Lightsaber Attack
    if (GAME.player.saberSwingTimer > 0) {         
        let attackBoxX = GAME.player.facing === 'right' ? GAME.player.x + GAME.player.width : GAME.player.x - 40;         
        let attackBox = { x: attackBoxX, y: GAME.player.y - 20, width: 40, height: GAME.player.height + 40 };         
        GAME.laserGates.forEach(gate => {             
            if (!gate.destroyed && attackBox.x < gate.x + gate.width && attackBox.x + attackBox.width > gate.x && attackBox.y < gate.y + gate.height && attackBox.y + attackBox.height > gate.y) {                 
                gate.destroyed = true;                 
                playSound('gateBreak');                 
                addParticles(gate.x + 10, gate.y + gate.height/2, "#ff0055", 25);                                   
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
            s.collected = true; 
            GAME.score += 1;                         
            const scoreText = document.getElementById("score-text");                         
            const tjFill = document.getElementById("tj-fill");                         
            if (scoreText) scoreText.innerText = GAME.score;                         
            if (tjFill) tjFill.style.width = Math.min(100, (GAME.score / 100) * 100) + "%";                         
            playSound('stud'); addParticles(s.x, s.y, s.color, 8);                 
        }         
    }); 

    // Jump Pads
    GAME.jumpPads.forEach(pad => {         
        if (GAME.player.x < pad.x + pad.width && GAME.player.x + GAME.player.width > pad.x && 
            GAME.player.y + GAME.player.height >= pad.y && GAME.player.y < pad.y + pad.height) {             
            GAME.player.dy = -22; 
            playSound('jump'); 
            GAME.camera.shake = 8;             
            addParticles(pad.x + 30, pad.y, "#00ffcc", 10);         
        }     
    });

    // Particle Cleanup
    for (let i = GAME.particles.length - 1; i >= 0; i--) {
        let p = GAME.particles[i];
        p.x += p.dx; p.y += p.dy; p.life--;
        if (p.life <= 0) GAME.particles.splice(i, 1);
    }

    // MISSION 1: OBI-WAN & LIGHTSABER LOGIC
    if (GAME.currentMission === 1) {
        if (!GAME.hasLightsaber && 
            GAME.player.x < GAME.lightsaber.x + GAME.lightsaber.width && 
            GAME.player.x + GAME.player.width > GAME.lightsaber.x && 
            GAME.player.y < GAME.lightsaber.y + GAME.lightsaber.height && 
            GAME.player.y + GAME.player.height > GAME.lightsaber.y) {         
            
            GAME.hasLightsaber = true; 
            playSound('win'); 
            addParticles(GAME.lightsaber.x, GAME.lightsaber.y, "#00ff00", 25);     
        }     

        let distObi = Math.abs(GAME.player.x - GAME.obi.x);     
        const dialogueBox = document.getElementById("dialogue-box");     
        const dialogueText = document.getElementById("dialogue-text");     
        
        if (distObi < 150 && GAME.player.y > 400) {          
            if (GAME.hasLightsaber) {                 
                if (GAME.state === "PLAYING") {
                    GAME.state = "CUTSCENE_JUMP";
                    GAME.cutsceneTimer = 0;
                    GAME.player.baseY = GAME.player.y;
                    GAME.obi.baseY = GAME.obi.y;
                    if (dialogueBox) dialogueBox.style.display = "none";
                    playSound('win');
                }          
            } else {                                
                if (dialogueBox) dialogueBox.style.display = "block";                                
                if (dialogueText) dialogueText.innerText = "Obi-Wan: Hello there! I lost my lightsaber. Can you help me find it?";                        
            }      
        } else { 
            if (dialogueBox) dialogueBox.style.display = "none"; 
        }
    }                    

    // MISSION 2: SPACESHIP ESCAPE LOGIC     
    if (GAME.currentMission === 2 && GAME.spaceship) {         
        const dialogueBox = document.getElementById("dialogue-box");                      
        const dialogueText = document.getElementById("dialogue-text");                      

        if (GAME.player.x + GAME.player.width > GAME.spaceship.x + 50) {             
            if (GAME.score >= 200) {                 
                if (GAME.state === "PLAYING") {
                    GAME.state = "CUTSCENE_SHIP";
                    GAME.spaceship.cutsceneTimer = 0;
                    GAME.spaceship.dy = 0;
                    if (dialogueBox) dialogueBox.style.display = "none";
                    playSound('rocket');
                }
            } else {                 
                if (dialogueBox && dialogueText) {                     
                    dialogueBox.style.display = "block";                     
                    dialogueText.innerText = `Ship locked! You need 200 coins. You only have ${GAME.score}.`;                 
                }             
            }         
        } else if (GAME.player.x < 400) {
            if (dialogueBox && dialogueText) {
                dialogueBox.style.display = "block";
                dialogueText.innerText = "Mission Goal: Collect 200 coins to power the Escape Ship!";
            }
        } else {             
            if (dialogueBox) dialogueBox.style.display = "none";         
        }     
    }

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

    // Render Player Lasers
    try {
        if (GAME.playerLasers) {
            GAME.playerLasers.forEach(l => {
                ctx.shadowBlur = 12; ctx.shadowColor = "#ff0055";
                ctx.fillStyle = "#ff0055";
                drawRoundedRect(ctx, l.x, l.y, l.width, l.height, 3);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(l.x + 2, l.y + 1, l.width - 4, l.height - 2);
                ctx.shadowBlur = 0;
            });
        }
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

    // Mission 2: Spaceship Rendering
    try {
        if (GAME.currentMission === 2 && GAME.spaceship) {
            ctx.save();
            ctx.fillStyle = "#95a5a6";
            drawRoundedRect(ctx, GAME.spaceship.x, GAME.spaceship.y + 60, GAME.spaceship.width, 60, 20);
            ctx.fillStyle = "#2980b9";
            drawRoundedRect(ctx, GAME.spaceship.x + 180, GAME.spaceship.y + 20, 70, 50, 15);
            ctx.shadowBlur = 20; ctx.shadowColor = "#e74c3c";
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(GAME.spaceship.x - 15, GAME.spaceship.y + 75, 20, 30);
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = "#00bfff"; ctx.font = "bold 18px 'Comic Sans MS'"; ctx.textAlign = "center";
            ctx.fillText("Escape Ship!", GAME.spaceship.x + GAME.spaceship.width/2, GAME.spaceship.y);
            ctx.restore();
        }
    } catch(e) {}

    // Mission 3: Space Objects (Moon, Asteroids, Shields)
    try {
        if (GAME.currentMission === 3) {
            if (GAME.moon) {
                ctx.save();
                ctx.shadowBlur = 30; ctx.shadowColor = "#a4b0be";
                ctx.fillStyle = "#747d8c";
                ctx.beginPath();
                ctx.arc(GAME.moon.x + 300, GAME.moon.y + 300, 300, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            }

            if (GAME.asteroids) {
                GAME.asteroids.forEach(ast => {
                    if (!ast.active) return;
                    ctx.save();
                    ctx.fillStyle = ast.destructible ? "#8c7ae6" : "#485460";
                    ctx.strokeStyle = "#2f3542"; ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(ast.x, ast.y, ast.radius, 0, Math.PI * 2);
                    ctx.fill(); ctx.stroke();

                    if (ast.destructible && ast.hp < ast.maxHp) {
                        ctx.fillStyle = "#ff4757";
                        ctx.fillRect(ast.x - 12, ast.y - ast.radius - 10, 24 * (ast.hp / ast.maxHp), 4);
                    }
                    ctx.restore();
                });
            }

            if (GAME.shieldBarriers) {
                GAME.shieldBarriers.forEach(sb => {
                    if (!sb.active) return;
                    ctx.shadowBlur = 15; ctx.shadowColor = "#00bfff";
                    ctx.fillStyle = "rgba(0, 191, 255, 0.4)";
                    ctx.fillRect(sb.x, sb.y, sb.width, sb.height);
                    ctx.shadowBlur = 0;
                });
            }

            if (GAME.shieldGenerators) {
                GAME.shieldGenerators.forEach(gen => {
                    if (!gen.active) return;
                    let colors = ["#ff4757", "#ffa502", "#2ecc71"];
                    ctx.fillStyle = colors[gen.hp - 1] || "#2ecc71";
                    drawRoundedRect(ctx, gen.x, gen.y, gen.width, gen.height, 6);
                    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();
                });
            }
        }
    } catch(e) {}
    
    try {         
        if (GAME.state !== "CUTSCENE_SHIP") { 
            ctx.save();         
            
            // --- MISSION 3: HERO STARFIGHTER ---
            if (GAME.currentMission === 3) {
                let currentChar = CHARACTERS[GAME.selectedCharKey];
                let px = GAME.player.x;
                let py = GAME.player.y;
                let w = GAME.player.width;
                let h = GAME.player.height;

                ctx.fillStyle = currentChar.color;
                ctx.beginPath();
                ctx.moveTo(px + w, py + h / 2);
                ctx.lineTo(px, py + 5);
                ctx.lineTo(px + 10, py + h / 2);
                ctx.lineTo(px, py + h - 5);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();

                ctx.fillStyle = "#00bfff";
                drawRoundedRect(ctx, px + 20, py + h / 2 - 6, 16, 12, 4);

                ctx.shadowBlur = 15; ctx.shadowColor = "#ff9f43";
                ctx.fillStyle = "#ff9f43";
                ctx.fillRect(px - 6, py + h / 2 - 4, 8, 8);
                ctx.shadowBlur = 0;
            } 
            // --- MISSIONS 1 & 2: LEGO MINIFIGURE ---
            else {
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
                    
                    let saberLength = GAME.selectedCharKey === 'vader' ? 55 : 35;
                    
                    ctx.shadowBlur = 20; ctx.shadowColor = currentChar.saberColor;             
                    ctx.fillStyle = currentChar.saberColor;             
                    ctx.fillRect(0, -saberLength, 6, saberLength);
                    
                    if (GAME.selectedCharKey === 'ahsoka') {
                        let dualOffset = GAME.player.facing === 'right' ? -25 : 25;
                        ctx.fillRect(dualOffset, -25, 5, 25);
                    }
                    
                    ctx.shadowBlur = 0;             
                    ctx.restore();         
                }       
                ctx.restore();     
            } 
            ctx.restore();     
        }
    } catch(e) {}
    ctx.restore();     
    
    if (GAME.deathMessageTimer > 0) {         
        ctx.fillStyle = "#e74c3c"; ctx.font = "bold 28px 'Comic Sans MS'";         
        ctx.fillText("Oops! Respawning safe...", canvas.width/2 - 140, 200);     
    } 
}

function gameLoop() {     
    update(); 
    draw(); 
    requestAnimationFrame(gameLoop); 
}

gameLoop();
