const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const objectiveText = document.getElementById("objective-text");
const scoreText = document.getElementById("score-text");
const startScreen = document.getElementById("start-screen");
const winScreen = document.getElementById("win-screen");
const winMessage = document.getElementById("win-message");

// Assets
const jediLeftImg = new Image(); jediLeftImg.src = "assets/jedi_left.png";
const jediRightImg = new Image(); jediRightImg.src = "assets/jedi_right.png";
const obiImg = new Image(); obiImg.src = "assets/obi.png";

// Characters Config
const CHARACTERS = {
    luke: { name: "Luke Skywalker", color: "#2ecc71", saberColor: "#2ecc71" },
    ahsoka: { name: "Ahsoka Tano", color: "#3498db", saberColor: "#ffffff" },
    anakin: { name: "Anakin Skywalker", color: "#00bfff", saberColor: "#00bfff" },
    vader: { name: "Darth Vader", color: "#e74c3c", saberColor: "#ff4d4d" }
};
let selectedCharKey = 'luke';

function selectCharacter(key, el) {
    selectedCharKey = key;
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function selectMission(mId, el) {
    currentMission = mId;
    document.querySelectorAll('.mission-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
}

// Game Physics State
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

let platforms = [], movingPlatforms = [], jumpPads = [], forceContainers = [], stars = [], vaporators = [], crates = [], studs = [], droids = [], particles = [], kyberCrystals = [];

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

function addParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            dx: (Math.random() - 0.5) * 6, dy: (Math.random() - 0.5) * 6 - 2,
            size: Math.random() * 5 + 3, color: color, life: 25
        });
    }
}

function startGame(difficulty) {
    toggleFullscreen();
    startScreen.style.display = "none";
    score = 0; scoreText.innerText = score;
    hasLightsaber = false;
    
    if (currentMission === 1) objectiveText.innerText = "Find Obi-Wan's Lightsaber";
    else if (currentMission === 2) objectiveText.innerText = "Find 3 Kyber Crystals (0/3)";
    else objectiveText.innerText = "Rescue Baby Yoda (Grogu)";

    buildMissionLevel(difficulty);
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

// Update Loop
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

    // Solid Collisions
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

    // One-Way Platforms
    movingPlatforms.forEach(p => {
        let prevPlayerBottom = (player.y - player.dy) + player.height;
        if (player.x < p.x + p.width && player.x + player.width > p.x) {
            if (player.dy >= 0 && prevPlayerBottom <= p.y + 12 && player.y + player.height >= p.y) {
                player.grounded = true; player.dy = 0; player.y = p.y - player.height;
                if (p.isMoving) player.x += p.dx;
            }
        }
    });

    // FORCE POWER ON DROIDS & OBJECTS
    droids.forEach(d => {
        let dist = Math.hypot((player.x + 24) - (d.x + 20), (player.y + 24) - d.y);
        if (keys.F && dist < 420) {
            d.isFloating = true; d.y -= 3;
            if (d.y < 300) d.y = 300;
            d.bounceY = Math.sin(Date.now() / 100) * 8;
            addParticles(d.x + 20, d.y + 20, "#e0aaff", 1);
            if (Math.random() < 0.05) playSound(d.type);
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
        if (d.textTimer > 0) d.textTimer--;

        if (dist < 45 && d.textTimer === 0 && !d.isFloating) {
            d.bounceY = 12; d.textTimer = 60; playSound(d.type);
            addParticles(d.x + 20, d.y, "#00bfff", 6);
            score += 5; scoreText.innerText = score;
        }
    });

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

    // Stud Collection
    studs.forEach(s => {
        if (!s.collected && Math.hypot((player.x + 24) - s.x, (player.y + 24) - s.y) < 32) {
            s.collected = true; score += 10; scoreText.innerText = score;
            playSound('stud'); addParticles(s.x, s.y, s.color, 8);
        }
    });

    // Kyber Crystal Pickup (Mission 2)
    kyberCrystals.forEach(kc => {
        if (!kc.collected && Math.hypot((player.x + 24) - kc.x, (player.y + 24) - kc.y) < 40) {
            kc.collected = true; kyberCrystalsCollected++;
            playSound('win'); addParticles(kc.x, kc.y, "#00bfff", 15);
            objectiveText.innerText = `Find Kyber Crystals (${kyberCrystalsCollected}/3)`;
            if (kyberCrystalsCollected >= 3) {
                gameState = "WON"; winMessage.innerText = "All Kyber Crystals Recovered!"; winScreen.style.display = "flex";
            }
        }
    });

    // Jump Pads
    jumpPads.forEach(pad => {
        if (player.x < pad.x + pad.width && player.x + player.width > pad.x && player.y + player.height >= pad.y && player.y < pad.y + pad.height) {
            player.dy = -22; playSound('jump'); camera.shake = 8;
            addParticles(pad.x + 30, pad.y, "#00ffcc", 10);
        }
    });

    particles.forEach((p, index) => {
        p.x += p.dx; p.y += p.dy; p.life--;
        if (p.life <= 0) particles.splice(index, 1);
    });

    if (player.y > 800) resetPlayer();
    if (deathMessageTimer > 0) deathMessageTimer--;

    // Mission 1 Win Objective
    if (currentMission === 1 && !hasLightsaber && player.x < lightsaber.x + lightsaber.width && player.x + player.width > lightsaber.x && player.y < lightsaber.y + lightsaber.height && player.y + player.height > lightsaber.y) {
        hasLightsaber = true; playSound('win'); addParticles(lightsaber.x, lightsaber.y, "#00ff00", 25);
    }

    let distObi = Math.abs(player.x - obi.x);
    if (currentMission === 1 && distObi < 150 && player.y > 400) {
        if (hasLightsaber) {
            gameState = "WON"; winMessage.innerText = "You returned Obi-Wan's Lightsaber!"; winScreen.style.display = "flex"; dialogueBox.style.display = "none"; playSound('win');
        } else {
            dialogueBox.style.display = "block"; dialogueText.innerText = "Obi-Wan: Hello there! Bring back my lightsaber from the end of the valley!";
        }
    } else {
        dialogueBox.style.display = "none";
    }

    // Mission 3 Win Objective (Rescue Grogu)
    if (currentMission === 3 && player.x > worldWidth - 500) {
        gameState = "WON"; winMessage.innerText = "Grogu Saved! You are a true Jedi Master!"; winScreen.style.display = "flex"; playSound('win');
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > worldWidth) player.x = worldWidth - player.width;

    let targetCamX = player.x - canvas.width / 2 + player.width / 2;
    camera.x += (targetCamX - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > worldWidth - canvas.width) camera.x = worldWidth - canvas.width;
    if (camera.shake > 0) camera.shake *= 0.88;
}

function drawLegoPlatform(p) {
    let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
    grad.addColorStop(0, p.isMoving ? "#34495e" : "#2c3e50");
    grad.addColorStop(1, "#1e272e");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, p.height, 4); ctx.fill();

    ctx.fillStyle = p.isMoving ? "#e67e22" : "#00bfff";
    ctx.fillRect(p.x, p.y, p.width, 3);

    let studSpacing = 22;
    let studCount = Math.floor(p.width / studSpacing);
    for (let i = 0; i < studCount; i++) {
        let sx = p.x + (i * studSpacing) + 11;
        let sy = p.y - 4;
        ctx.fillStyle = p.isMoving ? "#d35400" : "#0097e6";
        ctx.fillRect(sx - 5, sy, 10, 4);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(sx - 5, sy, 10, 1);
    }
}

function drawCrate(c) {
    let grad = ctx.createLinearGradient(c.x, c.y, c.x + c.width, c.y + c.height);
    grad.addColorStop(0, "#485460"); grad.addColorStop(1, "#1e272e");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(c.x, c.y, c.width, c.height, 6); ctx.fill();
    ctx.strokeStyle = "#d2dae2"; ctx.lineWidth = 2; ctx.strokeRect(c.x + 4, c.y + 4, c.width - 8, c.height - 8);

    ctx.fillStyle = "#f1c40f"; ctx.fillRect(c.x + 6, c.y + 6, c.width - 12, 8);
    ctx.fillStyle = "#000";
    for(let i = 0; i < 4; i++) { ctx.fillRect(c.x + 8 + (i * 8), c.y + 6, 4, 8); }

    ctx.shadowBlur = 8; ctx.shadowColor = "#00ff00";
    ctx.fillStyle = "#00ff00"; ctx.beginPath(); ctx.arc(c.x + c.width - 12, c.y + c.height - 12, 3, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
}

function drawVaporator(v) {
    ctx.fillStyle = "#7f8c8d"; ctx.fillRect(v.x + 10, v.y + 30, 4, v.height - 30);
    ctx.fillStyle = "#bdc3c7";
    ctx.fillRect(v.x + 2, v.y + 40, 20, 8);
    ctx.fillRect(v.x + 4, v.y + 70, 16, 8);
    ctx.fillRect(v.x + 2, v.y + 100, 20, 8);

    ctx.fillStyle = "#34495e"; ctx.fillRect(v.x + 6, v.y, 12, 30);
    ctx.shadowBlur = 12; ctx.shadowColor = "#00bfff";
    ctx.fillStyle = "#00bfff"; ctx.fillRect(v.x + 8, v.y + 10, 8, 10);
    ctx.shadowBlur = 0;
}

// Render Loop
function draw() {
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#0f172a"); bgGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save(); 
    let shakeX = (Math.random() - 0.5) * camera.shake;
    let shakeY = (Math.random() - 0.5) * camera.shake;
    ctx.translate(-camera.x + shakeX, shakeY);

    // Endless Stars Background
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    vaporators.forEach(v => drawVaporator(v));
    platforms.concat(movingPlatforms).forEach(p => drawLegoPlatform(p));

    // Force Objects
    forceContainers.forEach(fc => drawForceObject(ctx, fc));
    crates.forEach(c => drawCrate(c));
    
    // Lego Studs
    studs.forEach(s => {
        if (!s.collected) {
            ctx.shadowBlur = 10; ctx.shadowColor = s.color;
            ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x - 2, s.y - 2, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Mission 2 Kyber Crystals
    kyberCrystals.forEach(kc => {
        if (!kc.collected) {
            ctx.shadowBlur = 15; ctx.shadowColor = "#00bfff";
            ctx.fillStyle = "#00bfff"; ctx.beginPath();
            ctx.moveTo(kc.x, kc.y); ctx.lineTo(kc.x + 10, kc.y - 15);
            ctx.lineTo(kc.x + 20, kc.y); ctx.lineTo(kc.x + 10, kc.y + 15); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Droids
    droids.forEach(d => drawDroid(ctx, d));

    // Jump Pads
    jumpPads.forEach(pad => { ctx.fillStyle = pad.color; ctx.fillRect(pad.x, pad.y, pad.width, pad.height); });

    // Mission 1: Obi-Wan & Lightsaber
    if (currentMission === 1) {
        if (obiImg.complete && obiImg.naturalWidth !== 0) ctx.drawImage(obiImg, obi.x, obi.y, obi.width, obi.height);
        if (!hasLightsaber) {
            ctx.fillStyle = "#2ecc71"; ctx.shadowBlur = 15; ctx.shadowColor = "#2ecc71";
            ctx.fillRect(lightsaber.x, lightsaber.y + Math.sin(Date.now() / 150) * 8, lightsaber.width, lightsaber.height);
            ctx.shadowBlur = 0;
        }
    }

    // Mission 3: Baby Yoda / Grogu Hover Pod at the End
    if (currentMission === 3) {
        let gx = worldWidth - 450;
        ctx.fillStyle = "#bdc3c7"; ctx.beginPath(); ctx.arc(gx, 490, 25, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#2ecc71"; ctx.beginPath(); ctx.arc(gx, 485, 10, 0, Math.PI*2); ctx.fill(); // Grogu Head
    }

    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    });

    // Player Rendering
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height);
    ctx.scale(player.scaleX, player.scaleY);
    let pImg = player.facing === 'left' ? jediLeftImg : jediRightImg;
    let currentChar = CHARACTERS[selectedCharKey];

    if (pImg.complete && pImg.naturalWidth !== 0) {
        ctx.drawImage(pImg, -player.width/2, -player.height, player.width, player.height);
    } else {
        ctx.fillStyle = currentChar.color;
        ctx.fillRect(-player.width/2 + 8, -player.height + 15, player.width - 16, 20);
        ctx.fillStyle = "#f1c40f";
        ctx.beginPath(); ctx.arc(0, -player.height + 10, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(-player.width/2 + 10, -player.height + 35, player.width - 20, 13);
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
