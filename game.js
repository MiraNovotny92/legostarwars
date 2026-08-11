const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const saberText = document.getElementById("saber-text");
const saberIcon = document.getElementById("saber-icon");
const scoreText = document.getElementById("score-text");
const startScreen = document.getElementById("start-screen");
const winScreen = document.getElementById("win-screen");

// Assets
const jediLeftImg = new Image(); jediLeftImg.src = "assets/jedi_left.png";
const jediRightImg = new Image(); jediRightImg.src = "assets/jedi_right.png";
const obiImg = new Image(); obiImg.src = "assets/obi.png";

// Characters Config
const CHARACTERS = {
    luke: { name: "Luke Skywalker", color: "#2ecc71", saberColor: "#2ecc71", cape: false },
    ahsoka: { name: "Ahsoka Tano", color: "#3498db", saberColor: "#ffffff", cape: false },
    anakin: { name: "Anakin Skywalker", color: "#00bfff", saberColor: "#00bfff", cape: true },
    vader: { name: "Darth Vader", color: "#e74c3c", saberColor: "#ff4d4d", cape: true }
};
let selectedCharKey = 'luke';

function selectCharacter(key, el) {
    selectedCharKey = key;
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

// Game State & Audio
let gameState = "START";
const gravity = 0.65;
const friction = 0.82;
let worldWidth = 3000;
const camera = { x: 0, y: 0, shake: 0 };
let hasLightsaber = false;
let deathMessageTimer = 0;
let score = 0;
let lastSafeX = 50;

const player = { 
    x: 50, y: 400, width: 48, height: 48, 
    dx: 0, dy: 0, speed: 5, jumpPower: -13.5, 
    grounded: false, facing: 'right',
    scaleX: 1, scaleY: 1
};
const obi = { x: 300, y: 500, width: 50, height: 50 };
const lightsaber = { x: 2000, y: 490, width: 12, height: 60 };

let platforms = [], movingPlatforms = [], jumpPads = [], forceContainers = [], stars = [], trees = [], crates = [], studs = [], droids = [], particles = [];

// Fullscreen
function toggleFullscreen() {
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullScreen;
    const cancelFS = doc.exitFullscreen || doc.webkitExitFullscreen;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (requestFS) requestFS.call(docEl);
    } else {
        if (cancelFS) cancelFS.call(doc);
    }
}

// Audio Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'jump') {
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(); osc.stop(now + 0.12);
    } else if (type === 'stud') {
        osc.frequency.setValueAtTime(900, now); osc.frequency.setValueAtTime(1400, now + 0.06);
        gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(); osc.stop(now + 0.12);
    } else if (type === 'r2d2') {
        osc.type = 'sine'; let freq = 800 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, now); osc.frequency.linearRampToValueAtTime(freq + 400, now + 0.08);
        gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(); osc.stop(now + 0.2);
    } else if (type === 'gonk') {
        osc.type = 'square'; osc.frequency.setValueAtTime(110, now);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(); osc.stop(now + 0.25);
    } else if (type === 'win') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659, now + 0.3);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(); osc.stop(now + 0.5);
    }
}

// Particle System
function addParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            dx: (Math.random() - 0.5) * 6, dy: (Math.random() - 0.5) * 6 - 2,
            size: Math.random() * 5 + 3, color: color, life: 25
        });
    }
}

// Level Builder
function buildRandomLevel(difficultyMultiplier) {
    platforms = []; movingPlatforms = []; jumpPads = []; forceContainers = []; 
    stars = []; trees = []; crates = []; studs = []; droids = []; particles = [];
    let cursorX = 0;

    // Background Stars for Night Sky
    for(let i = 0; i < 100; i++) {
        stars.push({ x: Math.random() * 3500, y: Math.random() * 400, size: Math.random() * 2 + 1, alpha: Math.random() });
    }

    function addGround(width) {
        platforms.push({ x: cursorX, y: 550, width: width, height: 100, isGround: true });
        
        let itemsCount = Math.floor(width / 350);
        for(let j = 0; j < itemsCount; j++) {
            let rX = cursorX + 120 + Math.random() * (width - 240);
            if (Math.random() > 0.5) {
                trees.push({ x: rX, y: 350, width: 30, height: 200 });
            } else {
                crates.push({ x: rX, y: 500, width: 50, height: 50, color: "#7f8c8d" });
            }
        }

        if (width > 600 && cursorX > 500) {
            let droidType = Math.random() > 0.5 ? 'r2d2' : 'gonk';
            droids.push({
                x: cursorX + width/2, y: 505, width: 40, height: 45,
                type: droidType, dx: droidType === 'r2d2' ? 1.2 : 0.6,
                minX: cursorX + 100, maxX: cursorX + width - 100,
                bounceY: 0, textTimer: 0, label: droidType === 'r2d2' ? 'Beep Boop!' : 'GONK!'
            });
        }

        cursorX += width;
    }

    function addPit(width) { cursorX += width; }
    
    function addFloatingPlatform(xOffset, y, width) {
        movingPlatforms.push({ x: cursorX + xOffset, y: y, width: width, height: 20, dx: 0, minX: 0, maxX: 0, isMoving: false });
        
        // Arc of studs above platform (Never inside crates)
        for(let s = 0; s < 3; s++) {
            studs.push({ x: cursorX + xOffset + 30 + (s * 40), y: y - 35, radius: 7, collected: false, color: "#00bfff" });
        }
    }

    addGround(1400);
    let numberOfObstacles = difficultyMultiplier * 4;

    for (let i = 0; i < numberOfObstacles; i++) {
        let choice = Math.random();
        if (choice < 0.33) {
            let pitSize = 240 + (difficultyMultiplier * 60);
            movingPlatforms.push({ x: cursorX, y: 450, width: 140, height: 20, dx: 1.5, minX: cursorX, maxX: cursorX + pitSize - 140, isMoving: true });
            addPit(pitSize);
            addGround(800);
        } else if (choice < 0.66) {
            jumpPads.push({ x: cursorX + 80, y: 530, width: 60, height: 20, color: "#00ffcc" });
            addFloatingPlatform(80, 280, 200);
            addGround(300); addPit(180); addGround(800);
        } else {
            forceContainers.push({ x: cursorX + 300, y: 300, width: 110, height: 250, baseY: 300, isHovering: false });
            addGround(1100);
        }
    }

    addGround(1000);
    worldWidth = cursorX;
    lightsaber.x = worldWidth - 600;
}

function startGame(difficulty) {
    toggleFullscreen();
    startScreen.style.display = "none";
    score = 0; scoreText.innerText = score;
    hasLightsaber = false;
    saberText.style.display = "inline"; saberIcon.style.display = "none";
    buildRandomLevel(difficulty);
    gameState = "PLAYING";
}

// Inputs
const keys = { ArrowLeft: false, ArrowRight: false, Space: false, F: false };
window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = true;
    if (e.code === "ArrowRight") keys.ArrowRight = true;
    if (e.code === "Space") {
        if (!keys.Space && player.grounded) { playSound('jump'); player.scaleX = 0.7; player.scaleY = 1.3; }
        keys.Space = true;
    }
    if (e.code === "KeyF") keys.F = true;
});
window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = false;
    if (e.code === "ArrowRight") keys.ArrowRight = false;
    if (e.code === "Space") keys.Space = false;
    if (e.code === "KeyF") keys.F = false;
});

function bindTouch(id, keyName) {
    const btn = document.getElementById(id);
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault(); keys[keyName] = true;
        if(keyName==='Space' && player.grounded) { playSound('jump'); player.scaleX = 0.7; player.scaleY = 1.3; }
    });
    btn.addEventListener("touchend", (e) => { e.preventDefault(); keys[keyName] = false; });
}
bindTouch("btn-left", "ArrowLeft"); bindTouch("btn-right", "ArrowRight");
bindTouch("btn-jump", "Space"); bindTouch("btn-force", "F");

function resetPlayer() {
    player.x = lastSafeX; player.y = 300; player.dx = 0; player.dy = 0;
    deathMessageTimer = 90; camera.shake = 12;
    forceContainers.forEach(fc => fc.y = fc.baseY);
}

// Update Engine
function update() {
    if (gameState !== "PLAYING") return;

    if (keys.ArrowLeft) { player.dx -= 1.2; player.facing = 'left'; }
    if (keys.ArrowRight) { player.dx += 1.2; player.facing = 'right'; }
    if (keys.Space && player.grounded) { player.dy = player.jumpPower; player.grounded = false; }

    player.dy += gravity; player.dx *= friction;
    player.scaleX += (1 - player.scaleX) * 0.15;
    player.scaleY += (1 - player.scaleY) * 0.15;

    movingPlatforms.forEach(mp => {
        if (mp.isMoving) {
            mp.x += mp.dx;
            if (mp.x > mp.maxX || mp.x < mp.minX) mp.dx *= -1;
        }
    });

    // --- 1. FULL SOLID COLLISION (Ground, Crates, Force Blocks) ---
    const solidObjects = platforms.filter(p => p.isGround).concat(crates).concat(forceContainers);

    player.x += player.dx;
    solidObjects.forEach(s => {
        if (player.x < s.x + s.width && player.x + player.width > s.x && player.y < s.y + s.height && player.y + player.height > s.y) {
            if (player.dx > 0) player.x = s.x - player.width;
            else if (player.dx < 0) player.x = s.x + s.width;
            player.dx = 0;
        }
    });

    player.y += player.dy;
    player.grounded = false;
    solidObjects.forEach(s => {
        if (player.x < s.x + s.width && player.x + player.width > s.x && player.y < s.y + s.height && player.y + player.height > s.y) {
            if (player.dy > 0) {
                if (!player.grounded) { player.scaleX = 1.2; player.scaleY = 0.8; }
                player.grounded = true; player.dy = 0; player.y = s.y - player.height;
                if (s.y >= 500) lastSafeX = Math.max(50, player.x - 30);
            } else if (player.dy < 0) {
                player.y = s.y + s.height; player.dy = 0;
            }
        }
    });

    // --- 2. ONE-WAY PLATFORMS (Floating & Moving - Jump Through Below) ---
    movingPlatforms.forEach(p => {
        let prevPlayerBottom = (player.y - player.dy) + player.height;
        if (player.x < p.x + p.width && player.x + player.width > p.x) {
            // Check if player is falling down AND was previously above the platform
            if (player.dy >= 0 && prevPlayerBottom <= p.y + 12 && player.y + player.height >= p.y) {
                player.grounded = true; player.dy = 0; player.y = p.y - player.height;
                if (p.isMoving) player.x += p.dx;
            }
        }
    });

    // Droids
    droids.forEach(d => {
        d.x += d.dx;
        if (d.x > d.maxX || d.x < d.minX) d.dx *= -1;
        if (d.bounceY > 0) d.bounceY -= 1;
        if (d.textTimer > 0) d.textTimer--;

        let dist = Math.hypot((player.x + 24) - (d.x + 20), (player.y + 24) - d.y);
        if (dist < 45 && d.textTimer === 0) {
            d.bounceY = 12; d.textTimer = 60; playSound(d.type);
            addParticles(d.x + 20, d.y, "#00bfff", 6);
            score += 5; scoreText.innerText = score;
        }
    });

    // Studs
    studs.forEach(s => {
        if (!s.collected && Math.hypot((player.x + 24) - s.x, (player.y + 24) - s.y) < 32) {
            s.collected = true; score += 10; scoreText.innerText = score;
            playSound('stud'); addParticles(s.x, s.y, s.color, 8);
        }
    });

    // Jump Pads
    jumpPads.forEach(pad => {
        if (player.x < pad.x + pad.width && player.x + player.width > pad.x && player.y + player.height >= pad.y && player.y < pad.y + pad.height) {
            player.dy = -22; playSound('jump'); camera.shake = 8;
            addParticles(pad.x + 30, pad.y, "#00ffcc", 10);
        }
    });

    // Force Containers
    forceContainers.forEach(fc => {
        let dist = Math.abs((player.x + player.width/2) - (fc.x + fc.width/2));
        if (keys.F && dist < 420) {
            fc.y -= 4.5; fc.isHovering = true;
            if (fc.y < 60) fc.y = 60;
            camera.shake = Math.random() * 2;
            addParticles(fc.x + Math.random() * fc.width, fc.y + fc.height, "#e0aaff", 2);
        } else {
            fc.isHovering = false; fc.y += 8;
            if (fc.y > fc.baseY) fc.y = fc.baseY;
        }
    });

    particles.forEach((p, index) => {
        p.x += p.dx; p.y += p.dy; p.life--;
        if (p.life <= 0) particles.splice(index, 1);
    });

    if (player.y > 800) resetPlayer();
    if (deathMessageTimer > 0) deathMessageTimer--;

    if (!hasLightsaber && player.x < lightsaber.x + lightsaber.width && player.x + player.width > lightsaber.x && player.y < lightsaber.y + lightsaber.height && player.y + player.height > lightsaber.y) {
        hasLightsaber = true; saberText.style.display = "none"; saberIcon.style.display = "inline-block";
        playSound('win'); addParticles(lightsaber.x, lightsaber.y, "#00ff00", 25);
    }

    let distObi = Math.abs(player.x - obi.x);
    if (distObi < 150 && player.y > 400) {
        if (hasLightsaber) {
            gameState = "WON"; winScreen.style.display = "flex"; dialogueBox.style.display = "none"; playSound('win');
        } else {
            dialogueBox.style.display = "block"; dialogueText.innerText = "Obi-Wan: Hello there! Bring back my lightsaber from the valley!";
        }
    } else {
        dialogueBox.style.display = "none";
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > worldWidth) player.x = worldWidth - player.width;

    let targetCamX = player.x - canvas.width / 2 + player.width / 2;
    camera.x += (targetCamX - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > worldWidth - canvas.width) camera.x = worldWidth - canvas.width;
    if (camera.shake > 0) camera.shake *= 0.88;
}

// 3D Procedural Lego Platform Rendering
function drawLegoPlatform(p) {
    let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
    grad.addColorStop(0, p.isMoving ? "#34495e" : "#2c3e50");
    grad.addColorStop(1, "#1a252f");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, p.height, 4); ctx.fill();

    // Lego Top Studs (3D effect)
    let studSpacing = 20;
    let studCount = Math.floor(p.width / studSpacing);
    for (let i = 0; i < studCount; i++) {
        let sx = p.x + (i * studSpacing) + 10;
        let sy = p.y - 3;
        
        ctx.fillStyle = p.isMoving ? "#e67e22" : "#00bfff";
        ctx.fillRect(sx - 5, sy, 10, 3);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(sx - 5, sy, 10, 1); // Highlight
    }
}

// Render Engine
function draw() {
    // Restored Original Dark Blue Galactic Sky
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#1e3c72"); bgGrad.addColorStop(1, "#2a5298");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save(); 
    let shakeX = (Math.random() - 0.5) * camera.shake;
    let shakeY = (Math.random() - 0.5) * camera.shake;
    ctx.translate(-camera.x + shakeX, shakeY);

    // Stars
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Trees
    trees.forEach(t => {
        ctx.fillStyle = "#3d2817"; ctx.fillRect(t.x, t.y, t.width, t.height);
        ctx.fillStyle = "#1b4d2e"; ctx.beginPath(); ctx.arc(t.x + 15, t.y, 50, 0, Math.PI*2); ctx.fill();
    });

    // Platforms (Ground + One-Way Floating)
    platforms.concat(movingPlatforms).forEach(p => drawLegoPlatform(p));

    // Force Containers
    forceContainers.forEach(fc => {
        ctx.fillStyle = "#1e272e"; ctx.beginPath(); ctx.roundRect(fc.x, fc.y, fc.width, fc.height, 10); ctx.fill();
        ctx.fillStyle = "#0984e3"; ctx.fillRect(fc.x + 10, fc.y + 20, fc.width - 20, 15);
        ctx.fillStyle = "#485460"; ctx.fillRect(fc.x + 15, fc.y + 60, fc.width - 30, fc.height - 80);

        if (fc.isHovering) {
            ctx.strokeStyle = "#a29bfe"; ctx.lineWidth = 6; ctx.shadowBlur = 20; ctx.shadowColor = "#a29bfe";
            ctx.strokeRect(fc.x - 4, fc.y - 4, fc.width + 8, fc.height + 8);
            ctx.shadowBlur = 0;
        }
    });

    // Crates & Studs
    crates.forEach(c => { ctx.fillStyle = c.color; ctx.fillRect(c.x, c.y, c.width, c.height); });
    
    // Glowing Lego Studs
    studs.forEach(s => {
        if (!s.collected) {
            ctx.shadowBlur = 10; ctx.shadowColor = s.color;
            ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x - 2, s.y - 2, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Droids
    droids.forEach(d => {
        let drawY = d.y - d.bounceY;
        if (d.type === 'r2d2') {
            ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.roundRect(d.x, drawY, d.width, d.height, [20,20,5,5]); ctx.fill();
            ctx.fillStyle = "#2980b9"; ctx.fillRect(d.x + 8, drawY + 12, 24, 8);
            ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 16, 3, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillStyle = "#7f8c8d"; ctx.beginPath(); ctx.roundRect(d.x, drawY, d.width, d.height, 4); ctx.fill();
            ctx.fillStyle = "#2c3e50"; ctx.fillRect(d.x + 5, drawY + 20, d.width - 10, 4);
        }

        if (d.textTimer > 0) {
            ctx.fillStyle = "#fff"; ctx.font = "bold 14px 'Comic Sans MS'";
            ctx.fillText(d.label, d.x - 10, drawY - 10);
        }
    });

    // Jump Pads
    jumpPads.forEach(pad => { ctx.fillStyle = pad.color; ctx.fillRect(pad.x, pad.y, pad.width, pad.height); });

    // Obi-Wan & Lightsaber
    if (obiImg.complete && obiImg.naturalWidth !== 0) ctx.drawImage(obiImg, obi.x, obi.y, obi.width, obi.height);
    if (!hasLightsaber) {
        ctx.fillStyle = "#2ecc71"; ctx.shadowBlur = 15; ctx.shadowColor = "#2ecc71";
        ctx.fillRect(lightsaber.x, lightsaber.y + Math.sin(Date.now() / 150) * 8, lightsaber.width, lightsaber.height);
        ctx.shadowBlur = 0;
    }

    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    });

    // --- DRAW SELECTED CHARACTER (Image asset with fallback to Lego Minifig) ---
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height);
    ctx.scale(player.scaleX, player.scaleY);
    let pImg = player.facing === 'left' ? jediLeftImg : jediRightImg;
    let currentChar = CHARACTERS[selectedCharKey];

    if (pImg.complete && pImg.naturalWidth !== 0) {
        ctx.drawImage(pImg, -player.width/2, -player.height, player.width, player.height);
    } else {
        // Procedural Custom Lego Character Minifig
        ctx.fillStyle = currentChar.color; // Torso
        ctx.fillRect(-player.width/2 + 8, -player.height + 15, player.width - 16, 20);
        
        ctx.fillStyle = "#f1c40f"; // Lego Yellow Head
        ctx.beginPath(); ctx.arc(0, -player.height + 10, 10, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = "#2c3e50"; // Legs
        ctx.fillRect(-player.width/2 + 10, -player.height + 35, player.width - 20, 13);

        // Lightsaber Blade Glow
        if (hasLightsaber) {
            ctx.shadowBlur = 15; ctx.shadowColor = currentChar.saberColor;
            ctx.fillStyle = currentChar.saberColor;
            let saberX = player.facing === 'right' ? 15 : -20;
            ctx.fillRect(saberX, -player.height + 5, 5, 30);
            ctx.shadowBlur = 0;
        }
    }
    ctx.restore();

    ctx.restore();

    if (deathMessageTimer > 0) {
        ctx.fillStyle = "#e74c3c"; ctx.font = "bold 28px 'Comic Sans MS'";
        ctx.fillText("Oops! Respawning safe...", canvas.width/2 - 140, 200);
    }
}

function gameLoop() {
    update(); draw(); requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
