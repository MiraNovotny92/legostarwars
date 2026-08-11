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

// Game State & Audio
let gameState = "START"; 
const gravity = 0.6;
const friction = 0.8;
let worldWidth = 3000; 
const camera = { x: 0, y: 0 };
let hasLightsaber = false;
let deathMessageTimer = 0; 
let score = 0;
let lastSafeX = 50;

const player = { x: 50, y: 400, width: 50, height: 50, dx: 0, dy: 0, speed: 5, jumpPower: -13, grounded: false, facing: 'right' };
const obi = { x: 300, y: 500, width: 50, height: 50 };
const lightsaber = { x: 2000, y: 490, width: 10, height: 60 }; 

// Level Objects
let platforms = [], movingPlatforms = [], jumpPads = [], forceBlocks = [], clouds = [], trees = [], crates = [], studs = [];

// --- NATIVE SOUND SYNTHESIZER (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'jump') {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'stud') {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.15);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start(); osc.stop(audioCtx.currentTime + 0.6);
    }
}

// --- PROCEDURAL LEVEL GENERATOR ---
function buildRandomLevel(difficultyMultiplier) {
    platforms = []; movingPlatforms = []; jumpPads = []; forceBlocks = []; clouds = []; trees = []; crates = []; studs = [];
    let cursorX = 0;

    function addGround(width) { 
        platforms.push({ x: cursorX, y: 550, width: width, height: 100, isMoving: false }); 
        let itemsCount = Math.floor(width / 300); 
        for(let j = 0; j < itemsCount; j++) {
            let rX = cursorX + 100 + Math.random() * (width - 200);
            if (Math.random() > 0.5) {
                trees.push({ x: rX, y: 350, width: 30, height: 200 });
            } else {
                crates.push({ x: rX, y: 500, width: 50, height: 50, color: "#95a5a6", hp: 1 });
            }
            // Spawn Lego studs on the floor
            studs.push({ x: rX + 20, y: 520, radius: 8, collected: false, color: "#fca311" });
        }
        cursorX += width; 
    }
    
    function addPit(width) { cursorX += width; }
    function addPlatform(xOffset, y, width) { 
        platforms.push({ x: cursorX + xOffset, y: y, width: width, height: 20, isMoving: false });
        studs.push({ x: cursorX + xOffset + width/2, y: y - 25, radius: 8, collected: false, color: "#00bfff" });
    }
    
    addGround(1500);
    let numberOfObstacles = difficultyMultiplier * 4; 

    for (let i = 0; i < numberOfObstacles; i++) {
        let randomChoice = Math.random();
        if (randomChoice < 0.33) {
            let pitSize = 250 + (difficultyMultiplier * 80);
            let platformSpeed = 1.2 + (difficultyMultiplier * 0.4);
            movingPlatforms.push({ x: cursorX, y: 450, width: 150, height: 20, dx: platformSpeed, minX: cursorX, maxX: cursorX + pitSize - 150, isMoving: true });
            addPit(pitSize);
            addGround(800);
        } else if (randomChoice < 0.66) {
            jumpPads.push({ x: cursorX + 100, y: 530, width: 60, height: 20, color: "#00ffcc" });
            addPlatform(100, 250, 200); 
            addGround(300);
            addPit(200);
            addGround(800);
        } else {
            forceBlocks.push({ x: cursorX + 300, y: 300, width: 100, height: 250, baseY: 300, color: "#9d4edd", isHovering: false });
            addGround(1000);
        }
    }

    addGround(1000);
    worldWidth = cursorX;
    lightsaber.x = worldWidth - 600;

    for(let i = 0; i < (worldWidth / 150); i++) { 
        clouds.push({ x: Math.random() * worldWidth, y: Math.random() * 200 + 20, width: Math.random() * 80 + 60, height: Math.random() * 40 + 30, parallax: Math.random() * 0.4 + 0.1 });
    }
}

function startGame(difficulty) {
    startScreen.style.display = "none";
    score = 0;
    scoreText.innerText = score;
    buildRandomLevel(difficulty);
    gameState = "PLAYING";
}

// Input Controllers
const keys = { ArrowLeft: false, ArrowRight: false, Space: false, F: false };
window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = true;
    if (e.code === "ArrowRight") keys.ArrowRight = true;
    if (e.code === "Space") { if (!keys.Space && player.grounded) playSound('jump'); keys.Space = true; }
    if (e.code === "KeyF") keys.F = true;
});
window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = false;
    if (e.code === "ArrowRight") keys.ArrowRight = false;
    if (e.code === "Space") keys.Space = false;
    if (e.code === "KeyF") keys.F = false;
});

// Touch Handlers
function bindTouch(id, keyName) {
    const btn = document.getElementById(id);
    btn.addEventListener("touchstart", (e) => { e.preventDefault(); keys[keyName] = true; if(keyName==='Space' && player.grounded) playSound('jump'); });
    btn.addEventListener("touchend", (e) => { e.preventDefault(); keys[keyName] = false; });
}
bindTouch("btn-left", "ArrowLeft");
bindTouch("btn-right", "ArrowRight");
bindTouch("btn-jump", "Space");
bindTouch("btn-force", "F");

function resetPlayer() {
    player.x = lastSafeX; 
    player.y = 300; 
    player.dx = 0; 
    player.dy = 0;
    deathMessageTimer = 120; 
    forceBlocks.forEach(fb => fb.y = fb.baseY); 
}

function update() {
    if (gameState !== "PLAYING") return; 

    if (keys.ArrowLeft) { player.dx -= 1.2; player.facing = 'left'; }
    if (keys.ArrowRight) { player.dx += 1.2; player.facing = 'right'; }
    if (keys.Space && player.grounded) { player.dy = player.jumpPower; player.grounded = false; }

    player.dy += gravity; player.dx *= friction; player.x += player.dx; player.y += player.dy;
    player.grounded = false;

    movingPlatforms.forEach(mp => {
        mp.x += mp.dx;
        if (mp.x > mp.maxX || mp.x < mp.minX) mp.dx *= -1; 
    });

    // Solid Collisions
    const allSolids = platforms.concat(movingPlatforms).concat(forceBlocks).concat(crates);
    allSolids.forEach(p => {
        if (player.x < p.x + p.width && player.x + player.width > p.x && player.y < p.y + p.height && player.y + player.height > p.y) {
            if (player.dy > 0 && player.y + player.height - player.dy <= p.y + 15) { 
                player.grounded = true; player.dy = 0; player.y = p.y - player.height; 
                if (p.isMoving) player.x += p.dx;
                if (!p.isMoving && p.y >= 500) lastSafeX = Math.max(50, player.x - 40); // Track safe checkpoint
            }
        }
    });

    // Collect Studs
    studs.forEach(stud => {
        if (!stud.collected && Math.hypot((player.x + 25) - stud.x, (player.y + 25) - stud.y) < 35) {
            stud.collected = true;
            score += 10;
            scoreText.innerText = score;
            playSound('stud');
        }
    });

    // Jump Pad Collision
    jumpPads.forEach(pad => {
        if (player.x < pad.x + pad.width && player.x + player.width > pad.x && player.y < pad.y + pad.height && player.y + player.height > pad.y) {
            player.dy = -22; player.grounded = false; playSound('jump');
        }
    });

    if (player.y > 800) resetPlayer();
    if (deathMessageTimer > 0) deathMessageTimer--;

    // Force Block Logic
    forceBlocks.forEach(block => {
        let distanceToBlock = Math.abs((player.x + player.width/2) - (block.x + block.width/2));
        if (keys.F && distanceToBlock < 400) {
            block.y -= 4; block.isHovering = true;
            if (block.y < 50) block.y = 50;
        } else {
            block.isHovering = false; block.y += 8; 
            if (block.y > block.baseY) block.y = block.baseY; 
        }

        if (player.x < block.x + block.width && player.x + player.width > block.x && player.y < block.y + block.height && player.y + player.height > block.y + 10) {
            if (player.dx > 0 && player.x < block.x) { player.x = block.x - player.width; player.dx = 0; } 
            else if (player.dx < 0 && player.x > block.x) { player.x = block.x + block.width; player.dx = 0; }
        }
    });

    // Lightsaber Pickup
    if (!hasLightsaber && player.x < lightsaber.x + lightsaber.width && player.x + player.width > lightsaber.x && player.y < lightsaber.y + lightsaber.height && player.y + player.height > lightsaber.y) {
        hasLightsaber = true;
        saberText.style.display = "none";
        saberIcon.style.display = "inline-block";
        playSound('win');
    }

    // Obi-Wan Interaction
    let distToObi = Math.abs(player.x - obi.x);
    if (distToObi < 150 && player.y > 400) { 
        if (hasLightsaber) {
            gameState = "WON"; 
            winScreen.style.display = "flex";
            dialogueBox.style.display = "none";
            playSound('win');
        } else {
            dialogueBox.style.display = "block"; 
            dialogueText.innerText = "Obi-Wan: Hello there! Find my lightsaber at the end of the valley!";
        }
    } else {
        dialogueBox.style.display = "none"; 
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > worldWidth) player.x = worldWidth - player.width;

    camera.x = player.x - canvas.width / 2 + player.width / 2;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > worldWidth - canvas.width) camera.x = worldWidth - canvas.width;
}

// --- RENDERING ---
function drawLightsaber(x, y) {
    ctx.fillStyle = "#aaaaaa"; ctx.beginPath(); ctx.roundRect(x, y + 40, 10, 20, 3); ctx.fill();
    ctx.fillStyle = "#333333"; ctx.beginPath(); ctx.roundRect(x - 2, y + 45, 14, 4, 2); ctx.fill();
    ctx.shadowBlur = 20; ctx.shadowColor = "#00ff00";
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.roundRect(x + 2, y, 6, 40, 3); ctx.fill();
    ctx.shadowBlur = 0; 
}

function draw() {
    let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, "#1e3c72"); skyGrad.addColorStop(1, "#2a5298");
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save(); ctx.translate(-camera.x, 0); 

    // Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    clouds.forEach(cloud => {
        let px = cloud.x + (camera.x * cloud.parallax);
        ctx.beginPath(); 
        ctx.arc(px, cloud.y, cloud.height, 0, Math.PI * 2);
        ctx.arc(px + cloud.width/2.5, cloud.y - cloud.height/3, cloud.height * 1.2, 0, Math.PI * 2);
        ctx.arc(px + cloud.width/1.2, cloud.y, cloud.height * 0.9, 0, Math.PI * 2); 
        ctx.fill();
    });

    // Trees
    trees.forEach(tree => {
        ctx.fillStyle = "#5c4033"; ctx.fillRect(tree.x, tree.y, tree.width, tree.height);
        ctx.fillStyle = "#1e5631"; ctx.beginPath();
        ctx.arc(tree.x + tree.width/2, tree.y, 60, 0, Math.PI*2);
        ctx.arc(tree.x + tree.width/2 - 30, tree.y + 40, 50, 0, Math.PI*2);
        ctx.arc(tree.x + tree.width/2 + 30, tree.y + 40, 50, 0, Math.PI*2);
        ctx.fill();
    });

    // Platforms
    const allPlatforms = platforms.concat(movingPlatforms);
    allPlatforms.forEach(p => {
        let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        grad.addColorStop(0, "#4a5a6b"); grad.addColorStop(1, "#2a3a4b");
        ctx.fillStyle = grad; ctx.beginPath(); 
        ctx.roundRect(p.x, p.y, p.width, p.height, p.isMoving ? 10 : [10, 10, 0, 0]); 
        ctx.fill();
        ctx.fillStyle = p.isMoving ? "#ff9900" : "#00bfff"; ctx.beginPath(); 
        ctx.roundRect(p.x, p.y, p.width, 6, p.isMoving ? 10 : [10, 10, 0, 0]); 
        ctx.fill();
    });

    // Studs
    studs.forEach(s => {
        if (!s.collected) {
            ctx.fillStyle = s.color;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(s.x - 2, s.y - 2, 3, 0, Math.PI * 2); ctx.fill();
        }
    });

    // Crates
    crates.forEach(crate => {
        ctx.fillStyle = crate.color; ctx.beginPath(); 
        ctx.roundRect(crate.x, crate.y, crate.width, crate.height, 5); ctx.fill();
        ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth = 2;
        ctx.strokeRect(crate.x + 5, crate.y + 5, crate.width - 10, crate.height - 10);
    });

    // Jump Pads
    jumpPads.forEach(pad => {
        ctx.fillStyle = pad.color; ctx.beginPath(); 
        ctx.roundRect(pad.x, pad.y, pad.width, pad.height, 10); ctx.fill();
    });

    if (obiImg.complete && obiImg.naturalWidth !== 0) ctx.drawImage(obiImg, obi.x, obi.y, obi.width, obi.height);
    if (!hasLightsaber) drawLightsaber(lightsaber.x, lightsaber.y + Math.sin(Date.now() / 150) * 10);

    // Force Blocks with visual glow
    forceBlocks.forEach(block => {
        ctx.fillStyle = block.color; ctx.beginPath(); 
        ctx.roundRect(block.x, block.y, block.width, block.height, 15); ctx.fill();
        if (block.isHovering) {
            ctx.strokeStyle = "#e0aaff"; ctx.shadowBlur = 25; ctx.shadowColor = "#e0aaff"; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.roundRect(block.x, block.y, block.width, block.height, 15); ctx.stroke();
            ctx.shadowBlur = 0;
        }
    });

    // Player Rendering
    let currentImg = player.facing === 'left' ? jediLeftImg : jediRightImg;
    if (currentImg.complete && currentImg.naturalWidth !== 0) ctx.drawImage(currentImg, player.x, player.y, player.width, player.height);
    
    ctx.restore(); 

    if (deathMessageTimer > 0) {
        ctx.fillStyle = "#ff4d4d"; ctx.font = "bold 32px 'Comic Sans MS'";
        ctx.fillText("Oops! Respawning...", canvas.width/2 - 150, 200);
    }
}

function gameLoop() { 
    update(); 
    draw(); 
    requestAnimationFrame(gameLoop); 
}
requestAnimationFrame(gameLoop);
