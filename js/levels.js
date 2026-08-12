function buildMissionLevel(difficultyMultiplier) {
    // Reset all arrays for the new level
    GAME.platforms = []; GAME.movingPlatforms = []; GAME.jumpPads = []; GAME.forceContainers = []; 
    GAME.stars = []; GAME.vaporators = []; GAME.crates = []; GAME.studs = []; GAME.droids = []; 
    GAME.particles = []; GAME.kyberCrystals = []; GAME.waterPits = []; GAME.buildings = [];
    GAME.laserGates = []; GAME.npcs = [];
    
    GAME.kyberCrystalsCollected = 0;
    let cursorX = 0;

    // Background Stars
    for(let i = 0; i < 250; i++) {
        GAME.stars.push({ x: Math.random() * 8000, y: Math.random() * 450, size: Math.random() * 2 + 1, alpha: Math.random() });
    }

    // --- HELPER FUNCTIONS TO BUILD LEVELS ---
    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        cursorX += width;
    }
    function addWaterPit(width) {
        GAME.waterPits.push({ x: cursorX, width: width, y: 550 });
        cursorX += width;
    }

    // ==========================================
    // LEVEL 1: FIND OBI-WAN'S LIGHTSABER
    // ==========================================
    if (GAME.currentMission === 1) {
        
        // 1. Safe starting area with Obi-Wan
        GAME.obi = { x: 300, y: 490, width: 50, height: 50 };
        addGround(800, 540); 

        // 2. A simple water pit jump
        addWaterPit(200);
        
        // 3. A platform with an R2D2 Droid
        GAME.droids.push({
            x: cursorX + 100, y: 495, baseY: 495, width: 40, height: 45, type: 'r2d2',
            dx: 1.5, minX: cursorX + 50, maxX: cursorX + 350,
            bounceY: 0, textTimer: 0, label: 'Beep Boop!', isFloating: false
        });
        addGround(400, 540);

        // 4. Force Container to lift out of the way
        GAME.forceContainers.push({
            x: cursorX + 150, y: 310, width: 90, height: 230,
            baseY: 310, isHovering: false, type: 'brick', color: '#e74c3c'
        });
        addGround(600, 540);

        // 5. Goal Area with the Lightsaber!
        GAME.lightsaber = { x: cursorX + 200, y: 480, width: 12, height: 60 };
        addGround(500, 540);

        GAME.worldWidth = cursorX;
    } 
    // Basic flat ground for Mission 2 & 3 (until we build them!)
    else {
        addGround(2000, 540);
        GAME.worldWidth = cursorX;
    }
}
