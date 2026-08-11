const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- UI ELEMENTS ---
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const saberText = document.getElementById("saber-text");
const saberIcon = document.getElementById("saber-icon");

// --- ASSETS ---
const jediLeftImg = new Image(); jediLeftImg.src = "assets/jedi_left.png";
const jediRightImg = new Image(); jediRightImg.src = "assets/jedi_right.png";
const obiImg = new Image(); obiImg.src = "assets/obi.png";

// --- GAME SETTINGS & STATE ---
const gravity = 0.6;
const friction = 0.8;
const worldWidth = 14000; 
const camera = { x: 0, y: 0 };
let hasLightsaber = false;
let deathMessageTimer = 0; 

const player = {
    x: 50, y: 400, width: 50, height: 50, 
    dx: 0, dy: 0, speed: 5, jumpPower: -13, grounded: false, facing: 'right'
};

const obi = { x: 400, y: 500, width: 50, height: 50 };
const lightsaber = { x: 4800, y: 490, width: 10, height: 60 }; 

// --- IMPROVED LEVEL BUILDER ---
const platforms = [];
const movingPlatforms = [];
const jumpPads = [];
const forceBlocks = []; // Now an array for multiple blocks!
let cursorX = 0; 

function addGround(width) {
    platforms.push({ x: cursorX, y: 550, width: width, height: 100, isMoving: false });
    cursorX += width;
}
function addPit(width) { cursorX += width; }
function addPlatform(xOffset, y, width) {
    platforms.push({ x: cursorX + xOffset, y: y, width: width, height: 20, isMoving: false });
}
function addMovingPlatform(xOffset, y, width, moveDist) {
    let startX = cursorX + xOffset;
    movingPlatforms.push({ x: startX, y: y, width: width, height: 20, dx: 2, minX: startX, maxX: startX + moveDist, isMoving: true });
}
function addJumpPad(xOffset, y) {
    jumpPads.push({ x: cursorX + xOffset, y: y, width: 60, height: 20, color: "#00ffcc" });
}
function addForceBlock(xOffset, y) {
    forceBlocks.push({ x: cursorX + xOffset, y: y, width: 100, height: 100, color: "#9d4edd", isHovering: false });
}

// ⬇️ DESIGN YOUR LEVEL HERE ⬇️

// 1. Safe start area
addGround(1500); 

// 2. An obstacle you have to lift!
addForceBlock(-700, 450); // Placed 700px BEFORE the end of the first ground

// 3. A pit with a moving platform
addMovingPlatform(50, 450, 150, 300); 
addPit(500); 

// 4. More safe ground
addGround(1000);

// 5. A high wall that requires a jump pad!
addJumpPad(-200, 530);     
addPlatform(-200, 200, 200); 
addPit(200);

// 6. Final stretch
addGround(3000);


// --- CLOUDS ---
const clouds = [];
for(let i = 0; i < 80; i++) { 
    clouds.push({ x: Math.random() * worldWidth, y: Math.random() * 250 + 20, width: Math.random() * 100 + 50, height: Math.random() * 40 + 20, parallax: Math.random() * 0.5 + 0.2 });
}

// --- INPUTS ---
const keys = { ArrowLeft: false, ArrowRight: false, Space: false, F: false };
window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = true;
    if (e.code === "ArrowRight") keys.ArrowRight = true;
    if (e.code === "Space") keys.Space = true;
    if (e.code === "KeyF") keys.F = true;
});
window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") keys.ArrowLeft = false;
    if (e.code === "ArrowRight") keys.ArrowRight = false;
    if (e.code === "Space") keys.Space = false;
    if (e.code === "KeyF") keys.F = false;
});

// --- GAME LOGIC ---
function resetGame() {
    player.x = 50; player.y = 400; player.dx = 0; player.dy = 0;
    hasLightsaber = false; deathMessageTimer = 180; 
    saberText.style.display = "inline";
    saberIcon.style.display = "none";
    forceBlocks.forEach(fb => fb.y = 450); // Reset blocks
}

function update() {
    if (keys.ArrowLeft) { player.dx -= 1.2; player.facing = 'left'; }
    if (keys.ArrowRight) { player.dx += 1.2; player.facing = 'right'; }
    if (keys.Space && player.grounded) { player.dy = player.jumpPower; player.grounded = false; }

    player.dy += gravity; player.dx *= friction; player.x += player.dx; player.y += player.dy;
    player.grounded = false;

    movingPlatforms.forEach(mp => {
        mp.x += mp.dx;
        if (mp.x > mp.maxX || mp.x < mp.minX) mp.dx *= -1; 
    });

    const allPlatforms = platforms.concat(movingPlatforms);
    allPlatforms.forEach(p => {
        if (player.x < p.x + p.width && player.x + player.width > p.x && player.y < p.y + p.height && player.y + player.height > p.y) {
            if (player.dy > 0 && player.y + player.height - player.dy <= p.y) {
                player.grounded = true; player.dy = 0; player.y = p.y - player.height; 
                if (p.isMoving) player.x += p.dx;
            }
        }
    });

    jumpPads.forEach(pad => {
        if (player.x < pad.x + pad.width && player.x + player.width > pad.x && player.y < pad.y + pad.height && player.y + player.height > pad.y) {
            player.dy = -22; player.grounded = false;
        }
    });

    if (player.y > 1000) resetGame();
    if (deathMessageTimer > 0) deathMessageTimer--;

    // Update ALL force blocks
    forceBlocks.forEach(block => {
        let distanceToBlock = Math.abs((player.x + player.width/2) - (block.x + block.width/2));
        if (keys.F && distanceToBlock < 350) {
            block.y -= 3; block.isHovering = true;
            if (block.y < 150) block.y = 150; 
        } else {
            block.isHovering = false; block.y += 6; 
            if (block.y > 450) block.y = 450; 
        }
        if (player.x < block.x + block.width && player.x + player.width > block.x && player.y < block.y + block.height && player.y + player.height > block.y) {
            if (player.dx > 0 && player.x < block.x) { player.x = block.x - player.width; player.dx = 0; } 
            else if (player.dx < 0 && player.x > block.x) { player.x = block.x + block.width; player.dx = 0; }
        }
    });

    if (!hasLightsaber && player.x < lightsaber.x + lightsaber.width && player.x + player.width > lightsaber.x && player.y < lightsaber.y + lightsaber.height && player.y + player.height > lightsaber.y) {
        hasLightsaber = true;
        saberText.style.display = "none";
        saberIcon.style.display = "inline-block";
    }

    // --- HTML UI UPDATE LOGIC ---
    let distToObi = Math.abs(player.x - obi.x);
    if (distToObi < 150 && player.y > 400) { 
        dialogueBox.style.display = "block"; 
        dialogueText.innerText = hasLightsaber 
            ? "Obi-Wan: Hello there... Excellent! You found my lightsaber! The Force is strong with you!" 
            : "Obi-Wan: Hello there... I dropped my lightsaber at the end of the valley. Navigate the moving platforms to find it!";
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
    ctx.fillStyle = "#aaaaaa"; ctx.fillRect(x, y + 40, 10, 20);
    ctx.fillStyle = "#333333"; ctx.fillRect(x - 2, y + 45, 14, 4);
    ctx.shadowBlur = 15; ctx.shadowColor = "#00bfff";
    ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 2, y, 6, 40);
    ctx.shadowBlur = 0; 
}

function draw() {
    ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(-camera.x, 0); 

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    clouds.forEach(cloud => {
        let parallaxX = cloud.x + (camera.x * cloud.parallax);
        ctx.beginPath(); ctx.arc(parallaxX, cloud.y, cloud.height, 0, Math.PI * 2);
        ctx.arc(parallaxX + 30, cloud.y - 10, cloud.height + 10, 0, Math.PI * 2);
        ctx.arc(parallaxX + 60, cloud.y, cloud.height, 0, Math.PI * 2); ctx.fill();
    });

    const allPlatforms = platforms.concat(movingPlatforms);
    allPlatforms.forEach(p => {
        let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        grad.addColorStop(0, "#8a9aab"); grad.addColorStop(1, "#4a5a6b");
        ctx.fillStyle = grad; ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = p.isMoving ? "#ff9900" : "#b0c4de"; 
        ctx.fillRect(p.x, p.y, p.width, 5);
    });

    jumpPads.forEach(pad => {
        ctx.fillStyle = pad.color; ctx.beginPath(); ctx.roundRect(pad.x, pad.y, pad.width, pad.height, 10); ctx.fill();
    });

    if (obiImg.complete && obiImg.naturalWidth !== 0) ctx.drawImage(obiImg, obi.x, obi.y, obi.width, obi.height);
    if (!hasLightsaber) drawLightsaber(lightsaber.x, lightsaber.y + Math.sin(Date.now() / 200) * 10);

    // Draw ALL force blocks
    forceBlocks.forEach(block => {
        ctx.fillStyle = block.color; ctx.fillRect(block.x, block.y, block.width, block.height);
        if (block.isHovering) {
            ctx.strokeStyle = "#9d4edd"; ctx.shadowBlur = 20; ctx.shadowColor = "#9d4edd"; ctx.lineWidth = 4;
            ctx.strokeRect(block.x - 5, block.y - 5, block.width + 10, block.height + 10);
            ctx.shadowBlur = 0;
        }
    });

    let currentImg = player.facing === 'left' ? jediLeftImg : jediRightImg;
    if (currentImg.complete && currentImg.naturalWidth !== 0) ctx.drawImage(currentImg, player.x, player.y, player.width, player.height);
    
    ctx.restore(); 

    if (deathMessageTimer > 0) {
        ctx.fillStyle = "red"; ctx.font = "bold 40px 'Comic Sans MS'";
        ctx.fillText("Oh no! You fell into the abyss!", 100, 300);
    }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
requestAnimationFrame(gameLoop);
