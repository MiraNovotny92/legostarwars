const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const saberText = document.getElementById("saber-text");
const saberIcon = document.getElementById("saber-icon");
const startScreen = document.getElementById("start-screen");
const winScreen = document.getElementById("win-screen");

// Assets
const jediLeftImg = new Image(); jediLeftImg.src = "assets/jedi_left.png";
const jediRightImg = new Image(); jediRightImg.src = "assets/jedi_right.png";
const obiImg = new Image(); obiImg.src = "assets/obi.png";

// Game State
let gameState = "START"; // "START", "PLAYING", "WON"
const gravity = 0.6;
const friction = 0.8;
let worldWidth = 3000; // Will be overwritten by generator
const camera = { x: 0, y: 0 };
let hasLightsaber = false;
let deathMessageTimer = 0; 

const player = { x: 50, y: 400, width: 50, height: 50, dx: 0, dy: 0, speed: 5, jumpPower: -13, grounded: false, facing: 'right' };
const obi = { x: 300, y: 500, width: 50, height: 50 };
const lightsaber = { x: 2000, y: 490, width: 10, height: 60 }; 

// Level Arrays
let platforms = [];
let movingPlatforms = [];
let jumpPads = [];
let forceBlocks = [];
let clouds = [];

// --- PROCEDURAL LEVEL GENERATOR ---
function buildRandomLevel(difficultyMultiplier) {
    platforms = []; movingPlatforms = []; jumpPads = []; forceBlocks = []; clouds = [];
    let cursorX = 0;

    // Helper functions for building
    function addGround(width) { platforms.push({ x: cursorX, y: 550, width: width, height: 100, isMoving: false }); cursorX += width; }
    function addPit(width) { cursorX += width; }
    function addPlatform(xOffset, y, width) { platforms.push({ x: cursorX + xOffset, y: y, width: width, height: 20, isMoving: false }); }
    
    // 1. Safe start area for Obi-Wan
    addGround(1500); 

    // 2. Generate random chunks based on difficulty
    // Easy = 5 obstacles, Medium = 10, Hard = 15
    let numberOfObstacles = difficultyMultiplier * 5; 

    for (let i = 0; i < numberOfObstacles; i++) {
        let randomChoice = Math.random();
        
        if (randomChoice < 0.33) {
            // Chunk A: Moving Platform over a pit
            let pitSize = 300 + (difficultyMultiplier * 100);
            let platformSpeed = 1.5 + (difficultyMultiplier * 0.5);
            movingPlatforms.push({ x: cursorX, y: 450, width: 150, height: 20, dx: platformSpeed, minX: cursorX, maxX: cursorX + pitSize - 150, isMoving: true });
            addPit(pitSize);
            addGround(800);
        } 
        else if (randomChoice < 0.66) {
            // Chunk B: High Wall with Jump Pad
            jumpPads.push({ x: cursorX + 100, y: 530, width: 60, height: 20, color: "#00ffcc" });
            addPlatform(100, 200, 200); 
            addGround(300);
            addPit(200);
            addGround(800);
        } 
        else {
            // Chunk C: Solid Force Block Obstacle
            forceBlocks.push({ x: cursorX + 400, y: 450, width: 100, height: 100, color: "#9d4edd", isHovering: false });
            addGround(1200);
        }
    }

    // 3. Final stretch for the Lightsaber
    addGround(1000); 
    
    // Set the world size and lightsaber position based on how long the generator ran
    worldWidth = cursorX;
    lightsaber.x = worldWidth - 600;

    // Generate Clouds
    for(let i = 0; i < (worldWidth / 150); i++) { 
        clouds.push({ x: Math.random() * worldWidth, y: Math.random() * 250 + 20, width: Math.random() * 80 + 60, height: Math.random() * 40 + 30, parallax: Math.random() * 0.4 + 0.1 });
    }
}

// Function called by the HTML buttons
function startGame(difficulty) {
    startScreen.style.display = "none";
    buildRandomLevel(difficulty);
    gameState = "PLAYING";
}

// Controls
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

function resetPlayer() {
    player.x = 50; player.y = 400; player.dx = 0; player.dy = 0;
    deathMessageTimer = 180; 
    forceBlocks.forEach(fb => fb.y = 450); 
}

function update() {
    if (gameState !== "PLAYING") return; // Stop math if not playing

    if (keys.ArrowLeft) { player.dx -= 1.2; player.facing = 'left'; }
    if (keys.ArrowRight) { player.dx += 1.2; player.facing = 'right'; }
    if (keys.Space && player.grounded) { player.dy = player.jumpPower; player.grounded = false; }

    player.dy += gravity; player.dx *= friction; player.x += player.dx; player.y += player.dy;
    player.grounded = false;

    movingPlatforms.forEach(mp => {
        mp.x += mp.dx;
        if (mp.x > mp.maxX || mp.x < mp.minX) mp.dx *= -1; 
    });

    // Vertical Collision (Allows standing on Force Blocks too!)
    const allSolids = platforms.concat(movingPlatforms).concat(forceBlocks);
    allSolids.forEach(p => {
        if (player.x < p.x + p.width && player.x + player.width > p.x && player.y < p.y + p.height && player.y + player.height > p.y) {
            if (player.dy > 0 && player.y + player.height - player.dy <= p.y + 15) { // +15 gives leniency
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

    if (player.y > 1200) resetPlayer();
    if (deathMessageTimer > 0) deathMessageTimer--;

    // Force Block Logic (Horizontal blocking and lifting)
    forceBlocks.forEach(block => {
        let distanceToBlock = Math.abs((player.x + player.width/2) - (block.x + block.width/2));
        if (keys.F && distanceToBlock < 350) {
            block.y -= 4; block.isHovering = true;
            if (block.y < 150) block.y = 150; 
        } else {
            block.isHovering = false; block.y += 6; 
            if (block.y > 450) block.y = 450; 
        }

        // Horizontal push if walking into the side of the block
        if (player.x < block.x + block.width && player.x + player.width > block.x && player.y < block.y + block.height && player.y + player.height > block.y + 10) {
            if (player.dx > 0 && player.x < block.x) { player.x = block.x - player.width; player.dx = 0; } 
            else if (player.dx < 0 && player.x > block.x) { player.x = block.x + block.width; player.dx = 0; }
        }
    });

    if (!hasLightsaber && player.x < lightsaber.x + lightsaber.width && player.x + player.width > lightsaber.x && player.y < lightsaber.y + lightsaber.height && player.y + player.height > lightsaber.y) {
        hasLightsaber = true;
        saberText.style.display = "none";
        saberIcon.style.display = "inline-block";
    }

    let distToObi = Math.abs(player.x - obi.x);
    if (distToObi < 150 && player.y > 400) { 
        if (hasLightsaber) {
            gameState = "WON"; // WIN CONDITION TRIGGERED!
            winScreen.style.display = "flex";
            dialogueBox.style.display = "none";
        } else {
            dialogueBox.style.display = "block"; 
            dialogueText.innerText = "Obi-Wan: Hello there... I dropped my lightsaber at the end of the valley. Navigate the obstacles to find it!";
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

// --- MODERN RENDERING ---
function drawLightsaber(x, y) {
    ctx.fillStyle = "#aaaaaa"; ctx.beginPath(); ctx.roundRect(x, y + 40, 10, 20, 3); ctx.fill();
    ctx.fillStyle = "#333333"; ctx.beginPath(); ctx.roundRect(x - 2, y + 45, 14, 4, 2); ctx.fill();
    ctx.shadowBlur = 20; ctx.shadowColor = "#00ff00";
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.roundRect(x + 2, y, 6, 40, 3); ctx.fill();
    ctx.shadowBlur = 0; 
}

function draw() {
    // Beautiful Sky Gradient
    let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, "#1e3c72"); 
    skyGrad.addColorStop(1, "#2a5298");
    ctx.fillStyle = skyGrad; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save(); ctx.translate(-camera.x, 0); 

    // Round Fluffy Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    clouds.forEach(cloud => {
        let px = cloud.x + (camera.x * cloud.parallax);
        ctx.beginPath(); 
        ctx.arc(px, cloud.y, cloud.height, 0, Math.PI * 2);
        ctx.arc(px + cloud.width/2.5, cloud.y - cloud.height/3, cloud.height * 1.2, 0, Math.PI * 2);
        ctx.arc(px + cloud.width/1.2, cloud.y, cloud.height * 0.9, 0, Math.PI * 2); 
        ctx.fill();
    });

    // Rounded Platforms
    const allPlatforms = platforms.concat(movingPlatforms);
    allPlatforms.forEach(p => {
        let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        grad.addColorStop(0, "#4a5a6b"); grad.addColorStop(1, "#2a3a4b");
        
        ctx.fillStyle = grad; 
        ctx.beginPath(); 
        ctx.roundRect(p.x, p.y, p.width, p.height, p.isMoving ? 10 : [10, 10, 0, 0]); // Rounded top corners
        ctx.fill();
        
        ctx.fillStyle = p.isMoving ? "#ff9900" : "#00bfff"; 
        ctx.beginPath(); 
        ctx.roundRect(p.x, p.y, p.width, 6, p.isMoving ? 10 : [10, 10, 0, 0]); 
        ctx.fill();
    });

    // Rounded Jump Pads
    jumpPads.forEach(pad => {
        ctx.fillStyle = pad.color; 
        ctx.beginPath(); 
        ctx.roundRect(pad.x, pad.y, pad.width, pad.height, 10); 
        ctx.fill();
    });

    if (obiImg.complete && obiImg.naturalWidth !== 0) ctx.drawImage(obiImg, obi.x, obi.y, obi.width, obi.height);
    if (!hasLightsaber) drawLightsaber(lightsaber.x, lightsaber.y + Math.sin(Date.now() / 150) * 10);

    // Rounded Force Blocks with better glow
    forceBlocks.forEach(block => {
        ctx.fillStyle = block.color; 
        ctx.beginPath(); 
        ctx.roundRect(block.x, block.y, block.width, block.height, 15); 
        ctx.fill();
        
        if (block.isHovering) {
            ctx.strokeStyle = "#e0aaff"; ctx.shadowBlur = 25; ctx.shadowColor = "#e0aaff"; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.roundRect(block.x, block.y, block.width, block.height, 15); ctx.stroke();
            ctx.shadowBlur = 0;
        }
    });

    let currentImg = player.facing === 'left' ? jediLeftImg : jediRightImg;
    if (currentImg.complete && currentImg.naturalWidth !== 0) ctx.drawImage(currentImg, player.x, player.y, player.width, player.height);
    
    ctx.restore(); 

    if (deathMessageTimer > 0) {
        ctx.fillStyle = "red"; ctx.font = "bold 40px 'Comic Sans MS'";
        ctx.fillText("Oh no! You fell into the abyss!", canvas.width/2 - 250, 300);
    }
}

function gameLoop() { 
    update(); 
    draw(); 
    requestAnimationFrame(gameLoop); 
}
requestAnimationFrame(gameLoop);
