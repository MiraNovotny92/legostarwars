function buildMission1(difficultyMultiplier) {
    // --- HELPER FUNCTIONS TO BUILD LEVELS ---
    // We define these here so you can easily use them to draw this specific map
    let cursorX = 0;

    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        cursorX += width;
    }
    
    function addWaterPit(width) {
        GAME.waterPits.push({ x: cursorX, width: width, y: 550 });
        cursorX += width;
    }

    // ==========================================
    // MISSION 1 LAYOUT: FIND OBI-WAN'S LIGHTSABER
    // ==========================================
    
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

    // Set the final width of the level so the camera knows where to stop
    GAME.worldWidth = cursorX;
}
