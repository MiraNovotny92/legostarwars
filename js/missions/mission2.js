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

    // HELPER: Draws a straight horizontal line of coins
    function addCoins(startX, y, count) {
        for (let i = 0; i < count; i++) {
            GAME.studs.push({ x: startX + (i * 40), y: y, radius: 8, collected: false, color: "#ffd700" });
        }
    }

    // HELPER: Draws a jumping arc of coins
    function addCoinArc(startX, baseY, count, spacing = 45, arcHeight = 150) {
        for (let i = 0; i < count; i++) {
            let arcY = baseY - Math.sin((i / (count - 1)) * Math.PI) * arcHeight; 
            GAME.studs.push({ x: startX + (i * spacing), y: arcY, radius: 8, collected: false, color: "#00bfff" });
        }
    }

    // NEW HELPER: Draws a massive block/grid of coins
    function addCoinGrid(startX, startY, rows, cols) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                GAME.studs.push({ x: startX + (c * 40), y: startY + (r * 40), radius: 8, collected: false, color: "#ffd700" });
            }
        }
    }

    // ==========================================
    // MISSION 2 LAYOUT: 200+ COIN FRENZY & ESCAPE
    // ==========================================
    
    // --- SECTION 1: STARTING SAFE AREA ---
    // 24 Coins in a block right at the start
    addCoinGrid(cursorX + 200, 400, 3, 8); 
    addGround(600, 540);

    // --- SECTION 2: THE STAIRCASE CLIMB ---
    // 24 Coins scattered above the steps
    addCoinGrid(cursorX, 400, 2, 4); 
    addGround(200, 480);
    
    addCoinGrid(cursorX, 340, 2, 4); 
    addGround(200, 420);
    
    addCoinGrid(cursorX, 280, 2, 4); 
    addGround(200, 360);

    // --- SECTION 3: JUMP PAD INTO DOUBLE COIN ARC ---
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    // 20 Coins soaring over the pit
    addCoinArc(cursorX - 50, 340, 10, 40, 200); 
    addCoinArc(cursorX - 50, 300, 10, 40, 200); 
    addWaterPit(300);

    // --- SECTION 4: LANDING ZONE WITH BB-8 ---
    // FIXED: y and baseY set to 495 so BB-8 sits on the floor
    GAME.droids.push({
        x: cursorX + 100, y: 495, baseY: 495, width: 40, height: 45, type: 'bb8',
        dx: 2.0, minX: cursorX + 50, maxX: cursorX + 350, bounceY: 0, textTimer: 0, label: 'Beep-Bloop!', isFloating: false
    });
    addCoinGrid(cursorX + 50, 420, 2, 8); // 16 coins hovering above BB-8
    addGround(400, 540);

    // --- SECTION 5: HIGH-SPEED MOVING PLATFORMS ---
    GAME.movingPlatforms.push({ 
        x: cursorX, y: 440, width: 240, height: 24, 
        dx: 2.5, dy: 0, minX: cursorX, maxX: cursorX + 300, minY: 440, maxY: 440, isMoving: true 
    });
    addCoins(cursorX + 50, 400, 6); // 6 coins
    addWaterPit(300);

    GAME.movingPlatforms.push({ 
        x: cursorX, y: 340, width: 240, height: 24, 
        dx: 2.5, dy: 0, minX: cursorX, maxX: cursorX + 300, minY: 340, maxY: 340, isMoving: true 
    });
    addCoins(cursorX + 50, 300, 6); // 6 coins
    addWaterPit(250);

    // --- SECTION 6: FORCE SPEEDER LIFT ---
    GAME.forceContainers.push({
        x: cursorX + 150, y: 310, width: 100, height: 230,
        baseY: 310, isHovering: false, type: 'speeder', color: null
    });
    addCoinGrid(cursorX + 100, 200, 3, 10); // 30 coins in the sky
    addGround(600, 540);

    // --- SECTION 7: FORCE BRICK LIFT ---
    GAME.forceContainers.push({
        x: cursorX + 100, y: 310, width: 90, height: 230,
        baseY: 310, isHovering: false, type: 'brick', color: '#e74c3c'
    });
    addCoinGrid(cursorX + 50, 200, 2, 6); // 12 coins
    addGround(300, 540);

    // --- SECTION 8: MOVING PLATFORM OVER PIT ---
    GAME.movingPlatforms.push({ 
        x: cursorX, y: 440, width: 140, height: 24, 
        dx: 1.8, dy: 0, minX: cursorX, maxX: cursorX + 300, 
        minY: 440, maxY: 440, isMoving: true 
    });
    addCoins(cursorX + 50, 400, 5); // 5 coins
    addWaterPit(250);
    addCoins(cursorX + 50, 500, 4); // 4 coins on the safe landing
    addGround(200, 540);

    // --- SECTION 9: TWO-WAY WALL OF DOOM ---
    // Coins going UP the left lift
    addCoins(cursorX + 50, 400, 1);
    addCoins(cursorX + 50, 300, 1);
    addCoins(cursorX + 50, 200, 1);
    GAME.movingPlatforms.push({
        x: cursorX + 50, y: 490, width: 120, height: 24,
        dx: 0, dy: -2.0, minX: cursorX + 50, maxX: cursorX + 50,
        minY: 200, maxY: 490, isMoving: true
    });

    GAME.platforms.push({
        x: cursorX + 200, y: 220, width: 100, height: 320, isGround: false
    });
    addCoinArc(cursorX + 150, 200, 5, 40, 100); // 5 coins arched over the wall

    GAME.movingPlatforms.push({
        x: cursorX + 330, y: 290, width: 120, height: 24,
        dx: 0, dy: -2.0, minX: cursorX + 330, maxX: cursorX + 330,
        minY: 200, maxY: 490, isMoving: true
    });
    // Coins going DOWN the right lift
    addCoins(cursorX + 350, 400, 1);
    addCoins(cursorX + 350, 300, 1);
    addCoins(cursorX + 350, 200, 1);
    addWaterPit(500);

    // --- SECTION 10: WATER PIT HOPS ---
    addGround(200, 540);
    addCoinArc(cursorX, 500, 4, 40, 100); // 4 coins
    addWaterPit(150);
    
    addGround(200, 540);
    addCoinArc(cursorX, 500, 4, 40, 100); // 4 coins
    addWaterPit(150);

    // --- SECTION 11: R2D2 AND THE BIG PAYOUT ---
    GAME.droids.push({
        x: cursorX + 100, y: 495, baseY: 495, width: 40, height: 45, type: 'r2d2',
        dx: 1.5, minX: cursorX + 50, maxX: cursorX + 350,
        bounceY: 0, textTimer: 0, label: 'Beep Boop!', isFloating: false
    });
    // A massive grid of 60 coins right before the end!
    addCoinGrid(cursorX + 50, 250, 5, 12); 
    addGround(600, 540);
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });
    GAME.jumpPads.push({ x: cursorX - 100, y: 340, width: 60, height: 20, color: "#00ffcc" });


    // --- SECTION 12: FINAL SPRINT TO THE SPACESHIP ---
    // FIXED: Y position calculated so it sits exactly on the floor (540 floor - 260 height = 280)
    GAME.spaceship = { x: cursorX + 100, y: 280, width: 380, height: 260 }; 
    addGround(800, 540);

    // Set final width so the camera stops panning
    GAME.worldWidth = cursorX;
}
