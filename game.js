const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
let activeDialogue = null;
let deathMessageTimer = 0; 

// --- GAME OBJECTS ---
const player = {
    x: 50, y: 400, width: 50, height: 50, 
    dx: 0, dy: 0, speed: 5, jumpPower: -13, grounded: false, facing: 'right'
};

const obi = { x: 400, y: 500, width: 50, height: 50 };
const lightsaber = { x: 5000, y: 490, width: 10, height: 60 }; 
const forceBlock = { x: 1200, y: 450, width: 100, height: 100, isHovering: false };

// --- LEVEL BUILDER (No more manual math!) ---
const platforms = [];
let cursorX = 0; // Keeps track of where we are in the level

function addGround(width) {
    platforms.push({ x: cursorX, y: 550, width: width, height: 100, isMoving: false });
    cursorX += width; // Move the cursor forward
}

function addPit(width) {
    cursorX += width; // Move the cursor forward without drawing ground!
}

// ⬇️ CONFIGURE YOUR ABYSS LENGTHS HERE ⬇️
addGround(1500); 
addPit(80);       // <--- Very easy gap for a 5-year-old!
addGround(800);
addPit(120);      // <--- Slightly bigger gap
addGround(1200);
addPit(150);      // <--- Medium gap
addGround(3000); 

// --- SPECIAL PLATFORMS & PADS ---
// Moving platforms that slide left and right
const movingPlatforms = [
    { x: 3800, y: 450, width: 150, height: 20, dx: 2, minX: 3800, maxX: 4100, isMoving: true }
];

// Bouncy Force Pads (Mushrooms) that launch you high!
const jumpPads = [
    { x: 800, y: 530, width: 60, height: 20, color: "#00ffcc" },
    { x: 2600, y: 530, width: 60, height: 20, color: "#00ffcc" }
];

// Static floating platforms
platforms.push({ x: 250, y: 450, width: 150, height: 20, isMoving: false });
platforms.push({ x: 600, y: 350, width: 150, height: 20, isMoving: false });

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
    hasLightsaber = false; forceBlock.y = 450; deathMessageTimer = 180; 
}

function update() {
    // 1. Movement
    if (keys.ArrowLeft) { player.dx -= 1.2; player.facing = 'left'; }
    if (keys.ArrowRight) { player.dx += 1.2; player.facing = 'right'; }
    if (keys.Space && player.grounded) { player.dy = player.jumpPower; player.grounded = false; }

    player.dy += gravity; 
    player.dx *= friction; 
    player.x += player.dx;
    player.y += player.dy;
    player.grounded = false;

    // 2. Move Moving Platforms
    movingPlatforms.forEach(mp => {
        mp.x += mp.dx;
        if (mp.x > mp.maxX || mp.x < mp.minX) mp.dx *= -1; // Reverse direction
    });

    // 3. Platform Collision (Combines static and moving platforms)
    const allPlatforms = platforms.concat(movingPlatforms);
    allPlatforms.forEach(p => {
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y) {
            
            // Only land if falling downwards onto it
            if (player.dy > 0 && player.y + player.height - player.dy <= p.y) {
                player.grounded = true; 
                player.dy = 0; 
                player.y = p.y - player.height; 
                
                // If it's a moving platform, stick the player to it so they don't slide off!
                if (p.isMoving) {
                    player.x += p.dx;
                }
            }
        }
    });

    // 4. Jump Pad Collision
    jumpPads.forEach(pad => {
        if (player.x < pad.x + pad.width && player.x + player.width > pad.x &&
            player.y < pad.y + pad.height && player.y + player.height > pad.y) {
            player.dy = -22; // Super high jump!
            player.grounded = false;
        }
    });

    // 5. Death Pit Check
    if (player.y > 1000) resetGame();
    if (deathMessageTimer > 0) deathMessageTimer--;

    // 6. Force Block Logic
    let distanceToBlock = Math.abs((player.x + player.width/2) - (forceBlock.x + forceBlock.width/2));
    if (keys.F && distanceToBlock < 350) {
        forceBlock.y -= 3; forceBlock.isHovering = true;
        if (forceBlock.y < 150) forceBlock.y = 150; 
    } else {
        forceBlock.isHovering = false; forceBlock.y += 6; 
        if (forceBlock.y > 450) forceBlock.y = 450; 
    }
    if (player.x < forceBlock.x + forceBlock.width && player.x + player.width > forceBlock.x && 
        player.y < forceBlock.y + forceBlock.height && player.y + player.height > forceBlock.y) {
        if (player.dx > 0 && player.x < forceBlock.x) { player.x = forceBlock.x - player.width; player.dx = 0; } 
        else if (player.dx < 0 && player.x > forceBlock.x) { player.x = forceBlock.x + forceBlock.width; player.dx = 0; }
    }

    // 7. Quests
    if (!hasLightsaber && player.x < lightsaber.x + lightsaber.width && player.x + player.width > lightsaber.x &&
        player.y < lightsaber.y + lightsaber.height && player.y + player.height > lightsaber.y) {
        hasLightsaber = true;
    }

    let distToObi = Math.abs(player.x - obi.x);
    if (distToObi < 150 && player.y > 400) { 
        activeDialogue = hasLightsaber 
            ? "Obi-Wan: Hello there... Excellent! You found my lightsaber! The Force is strong with you!" 
            : "Obi-Wan: Hello there... I dropped my lightsaber at the end of the valley. Can you bring it to me?";
    } else {
        activeDialogue = null;
    }

    // 8. Boundaries & Camera
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
    ctx.save();
    ctx.translate(-camera.x, 0); 

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    clouds.forEach(cloud => {
        let parallaxX = cloud.x + (camera.x * cloud.parallax);
        ctx.beginPath();
        ctx.arc(parallaxX, cloud.y, cloud.height, 0, Math.PI * 2);
        ctx.arc(parallaxX + 30, cloud.y - 10, cloud.height + 10, 0, Math.PI * 2);
        ctx.arc(parallaxX + 60, cloud.y, cloud.height, 0, Math.PI * 2);
        ctx.fill();
    });

    const allPlatforms = platforms.concat(movingPlatforms);
    allPlatforms.forEach(p => {
        let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        grad.addColorStop(0, "#8a9aab"); grad.addColorStop(1, "#4a5a6b");
        ctx.fillStyle = grad; ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = p.isMoving ? "#ff9900" : "#b0c4de"; // Moving platforms have orange tops!
        ctx.fillRect(p.x, p.y, p.width, 5);
    });

    jumpPads.forEach(pad => {
        ctx.fillStyle = pad.color;
        ctx.beginPath();
        ctx.roundRect(pad.x, pad.y, pad.width, pad.height, 10);
        ctx.fill();
    });

    if (obiImg.complete && obiImg.naturalWidth !== 0) ctx.drawImage(obiImg, obi.x, obi.y, obi.width, obi.height);
    
    if (!hasLightsaber) drawLightsaber(lightsaber.x, lightsaber.y + Math.sin(Date.now() / 200) * 10);

    ctx.fillStyle = forceBlock.color; ctx.fillRect(forceBlock.x, forceBlock.y, forceBlock.width, forceBlock.height);
    if (forceBlock.isHovering) {
        ctx.strokeStyle = "#9d4edd"; ctx.shadowBlur = 20; ctx.shadowColor = "#9d4edd"; ctx.lineWidth = 4;
        ctx.strokeRect(forceBlock.x - 5, forceBlock.y - 5, forceBlock.width + 10, forceBlock.height + 10);
        ctx.shadowBlur = 0;
    }

    let currentImg = player.facing === 'left' ? jediLeftImg : jediRightImg;
    if (currentImg.complete && currentImg.naturalWidth !== 0) ctx.drawImage(currentImg, player.x, player.y, player.width, player.height);
    
    ctx.restore(); 

    // UI
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; ctx.fillRect(10, 10, 360, 60);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px 'Comic Sans MS'"; ctx.fillText("Controls:", 20, 30);
    ctx.font = "14px 'Comic Sans MS'"; ctx.fillText("⬅️ ➡️ to run | SPACE to jump | Hold 'F' for Force", 20, 55);
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; ctx.fillRect(canvas.width - 200, 10, 190, 40);
    ctx.fillStyle = hasLightsaber ? "#00ff00" : "#ff0000";
    ctx.fillText(hasLightsaber ? "Lightsaber: FOUND!" : "Lightsaber: Missing", canvas.width - 190, 35);

    if (activeDialogue) {
        ctx.fillStyle = "rgba(0, 50, 100, 0.9)"; ctx.fillRect(50, 480, 700, 100);
        ctx.strokeStyle = "#00bfff"; ctx.lineWidth = 3; ctx.strokeRect(50, 480, 700, 100);
        ctx.fillStyle = "#ffffff"; ctx.font = "18px 'Comic Sans MS'"; ctx.fillText(activeDialogue, 70, 535);
    }

    if (deathMessageTimer > 0) {
        ctx.fillStyle = "red"; ctx.font = "bold 40px 'Comic Sans MS'";
        ctx.fillText("Oh no! You fell into the abyss!", 100, 300);
    }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
requestAnimationFrame(gameLoop);