function buildMission2() {
    let cursorX = 0;

    // --- HELPER FUNCTIONS ---
    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        cursorX += width;
    }
    
    function addWaterPit(width) {
        GAME.waterPits.push({ x: cursorX, width: width, y: 550 });
        cursorX += width;
    }

    // NEW HELPER: Draws a straight horizontal line of coins
    function addCoins(startX, y, count) {
        for (let i = 0; i < count; i++) {
            GAME.studs.push({ x: startX + (i * 40), y: y, radius: 8, collected: false, color: "#ffd700" });
        }
    }

    // NEW HELPER: Draws a massive jumping arc of coins!
    function addCoinArc(startX, baseY, count) {
        for (let i = 0; i < count; i++) {
            // Math.sin creates a perfect arc shape in the air
            let arcY = baseY - Math.sin((i / (count - 1)) * Math.PI) * 150; 
            GAME.studs.push({ x: startX + (i * 45), y: arcY, radius: 8, collected: false, color: "#00bfff" });
        }
    }

    // ==========================================
    // MISSION 2 LAYOUT: 50-COIN FRENZY & ESCAPE
    // ==========================================
    
    // --- SECTION 1: STARTING SAFE AREA ---
    addGround(600, 540);
    addCoins(200, 500, 5); // 5 coins

    // --- SECTION 2: THE STAIRCASE CLIMB ---
    addGround(200, 480);
    addCoins(cursorX - 180, 440, 4); // 4 coins above the stairs
    addGround(200, 420);
    addCoins(cursorX - 180, 380, 4);
    addGround(200, 360);
    addCoins(cursorX - 180, 320, 4);

    // --- SECTION 3: JUMP PAD INTO MASSIVE COIN ARC ---
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    addWaterPit(280); // Huge gap!
    addCoinArc(cursorX - 550, 340, 14); // 14 coins in a massive arc over the water

    // --- SECTION 4: LANDING ZONE WITH BB-8 ---
    GAME.droids.push({
        x: cursorX + 100, y: 515, baseY: 515, width: 40, height: 45, type: 'bb8',
        dx: 2.0, minX: cursorX + 50, maxX: cursorX + 350, bounceY: 0, textTimer: 0, label: 'Beep-Bloop!', isFloating: false
    });
    addGround(500, 540);
    addCoins(cursorX - 400, 500, 8); // 8 coins on the ground

    // --- SECTION 5: HIGH-SPEED MOVING PLATFORMS ---
    GAME.movingPlatforms.push({ 
        x: cursorX, y: 440, width: 140, height: 24, 
        dx: 2.5, dy: 0, minX: cursorX, maxX: cursorX + 300, minY: 440, maxY: 440, isMoving: true 
    });
    addCoins(cursorX + 50, 400, 6); // 6 coins hovering above the first platform
    addWaterPit(450);

    GAME.movingPlatforms.push({ 
        x: cursorX, y: 340, width: 140, height: 24, 
        dx: 2.5, dy: 0, minX: cursorX, maxX: cursorX + 300, minY: 340, maxY: 340, isMoving: true 
    });
    addCoins(cursorX + 50, 300, 6); // 6 coins hovering above the second platform
    addWaterPit(450);

    // --- SECTION 6: FORCE LIFT OBSTACLE ---
    GAME.forceContainers.push({
        x: cursorX + 150, y: 310, width: 100, height: 230,
        baseY: 310, isHovering: false, type: 'speeder', color: null
    });
    addGround(600, 540);
    addCoins(cursorX - 400, 250, 5); // 5 coins hiding above the speeder!

    // --- SECTION 7: FINAL SPRINT TO THE SPACESHIP ---
    addCoins(cursorX + 100, 500, 10); // 10 coins leading to the ship
    
    // Define the Spaceship at the end
    GAME.spaceship = { x: cursorX + 500, y: 380, width: 280, height: 160 };
    addGround(1200, 540);

    // Set final width so the camera stops
    GAME.worldWidth = cursorX;
}
