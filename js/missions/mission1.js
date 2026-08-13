function buildMission1() {
    // --- HELPER FUNCTIONS TO BUILD LEVELS ---
    let cursorX = 0; // The "pen" that moves left to right as we build

    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        cursorX += width; // Move the pen forward by the width of the ground
    }
    
    function addWaterPit(width) {
        GAME.waterPits.push({ x: cursorX, width: width, y: 550 });
        cursorX += width; // Move the pen forward by the width of the pit
    }

    // ==========================================
    // MISSION 1 LAYOUT: THE LONG TREK FOR THE LIGHTSABER
    // ==========================================
    
    // --- SECTION 1: STARTING AREA ---
    // Place Obi-Wan at the start of the level
    GAME.obi = { x: 300, y: 490, width: 50, height: 50 };
    // Draw 600px of safe ground for the start
    addGround(600, 540); 


    // --- SECTION 2: FIRST WATER PIT ---
    // A simple 200px gap to jump over
    addWaterPit(150);
    

    // --- SECTION 3: DROID GREETING ---
    // Place an R2D2 droid 100px into this new section
    GAME.droids.push({
        x: cursorX + 100, y: 495, baseY: 495, width: 40, height: 45, type: 'r2d2',
        dx: 1.5, minX: cursorX + 50, maxX: cursorX + 350,
        bounceY: 0, textTimer: 0, label: 'Beep Boop!', isFloating: false
    });
        // Place an R2D2 droid 100px into this new section
    GAME.droids.push({
        x: cursorX + 150, y: 495, baseY: 495, width: 40, height: 45, type: 'r2d2',
        dx: 1.5, minX: cursorX + 50, maxX: cursorX + 350,
        bounceY: 0, textTimer: 0, label: 'Beep Boop!', isFloating: false
    });
    // Draw 300px of ground under the droid
    addGround(300, 540);


    // --- SECTION 4: THE FORCE BLOCK ---
    // Place a heavy red brick 200px into this section. The player must hold 'F' to lift it.
    GAME.forceContainers.push({
        x: cursorX + 200, y: 310, width: 90, height: 230,
        baseY: 310, isHovering: false, type: 'brick', color: '#e74c3c'
    });
    // Draw 600px of ground under the Force block
    addGround(300, 540);
    
        // --- SECTION 4: THE FORCE BLOCK ---
    // Place a heavy red brick 200px into this section. The player must hold 'F' to lift it.
    GAME.forceContainers.push({
        x: cursorX + 200, y: 310, width: 90, height: 230,
        baseY: 310, isHovering: false, type: 'brick', color: '#e74c3c'
    });
    // Draw 600px of ground under the Force block
    addGround(300, 540);


    // --- SECTION 5: HORIZONTAL MOVING PLATFORM OVER PIT ---
    // Place a platform moving left and right over the pit
    GAME.movingPlatforms.push({ 
        x: cursorX, y: 440, width: 140, height: 24, 
        dx: 1.8, dy: 0, minX: cursorX, maxX: cursorX + 300, // Moves 300px right
        minY: 440, maxY: 440, isMoving: true 
    });
    // Add the water pit under the moving platform
    addWaterPit(400);


    // --- SECTION 6: THE TWO-WAY GIANT WALL ---
    // This requires a lift on the left (to go) and a lift on the right (to come back)
    
    // Left Vertical Lift (Starts at Y: 490, moves up to Y: 200)
    GAME.movingPlatforms.push({
        x: cursorX + 50, y: 490, width: 120, height: 24,
        dx: 0, dy: -2.0, minX: cursorX + 50, maxX: cursorX + 50,
        minY: 200, maxY: 490, isMoving: true
    });

    // The Giant Wall (Solid block, not ground)
    GAME.platforms.push({
        x: cursorX + 200, y: 220, width: 100, height: 320, isGround: true
    });

    // Right Vertical Lift (Starts at Y: 490, moves up to Y: 200)
    GAME.movingPlatforms.push({
        x: cursorX + 330, y: 490, width: 120, height: 24,
        dx: 0, dy: -2.0, minX: cursorX + 330, maxX: cursorX + 330,
        minY: 200, maxY: 490, isMoving: true
    });
    // Draw 600px of ground under the wall and lifts
    addGround(500, 540);


    // --- SECTION 7: LASER GATE OBSTACLE ---
    // Place a destructible laser gate. The player can slash it now, and it stays destroyed on the way back!
    GAME.laserGates.push({
        x: cursorX + 200, y: 240, width: 20, height: 300, destroyed: false
    });
    // Draw 500px of ground under the laser gate
    addGround(300, 540);

        // --- SECTION 7: LASER GATE OBSTACLE ---
    // Place a destructible laser gate. The player can slash it now, and it stays destroyed on the way back!
    GAME.laserGates.push({
        x: cursorX + 200, y: 240, width: 20, height: 300, destroyed: false
    });
    // Draw 500px of ground under the laser gate
    addGround(300, 540);


// --- SECTION 8: JUMP PAD OVER A WALL ---
    // Left side: A green jump pad that shoots the player into the air
    GAME.jumpPads.push({ 
        x: cursorX + 100, y: 520, width: 60, height: 20, color: "#00ffcc" 
    });

    // The Wall they are jumping over
    GAME.platforms.push({
        x: cursorX + 200, y: 200, width: 100, height: 340, isGround: true
    });

    // Right side: Another green jump pad so they can get back over on the return trip
    GAME.jumpPads.push({ 
        x: cursorX + 350, y: 520, width: 60, height: 20, color: "#00ffcc" 
    });
    
    // Draw 600px of ground under the pads and wall
    addGround(600, 540);


    // --- SECTION 9: DROID VALLEY ---
    // Place a Gonk Droid and a Mouse Droid walking around
    GAME.droids.push({
        x: cursorX + 100, y: 495, baseY: 495, width: 45, height: 45, type: 'gonk',
        dx: 1.0, minX: cursorX + 50, maxX: cursorX + 400, bounceY: 0, textTimer: 0, label: 'GONK!', isFloating: false
    });
    GAME.droids.push({
        x: cursorX + 500, y: 515, baseY: 515, width: 40, height: 25, type: 'mouse',
        dx: 2.5, minX: cursorX + 450, maxX: cursorX + 750, bounceY: 0, textTimer: 0, label: 'Whirrr!', isFloating: false
    });
    // Draw 900px of ground
    addGround(300, 540);

    addGround(200, 480);
    addGround(200, 400);
    addGround(100, 350);
    addGround(200, 300);
        GAME.droids.push({
        x: cursorX + 100, y: 495, baseY: 495, width: 45, height: 45, type: 'gonk',
        dx: 1.0, minX: cursorX + 50, maxX: cursorX + 400, bounceY: 0, textTimer: 0, label: 'GONK!', isFloating: false
    });
    addGround(200, 400);

    // 1. The moving platform
    // dx: 1.5 means it moves left and right. 
    // minX and maxX define how far it travels.
    GAME.movingPlatforms.push({ 
        x: cursorX, y: 440, width: 140, height: 24, 
        dx: 1.5, dy: 0, minX: cursorX, maxX: cursorX + 200, 
        minY: 440, maxY: 440, isMoving: true 
    });
    
    // 2. The water pit underneath it (140 platform width + 200 travel distance = 340 gap)
    addWaterPit(340);

        // Place a heavy red brick 200px into this section. The player must hold 'F' to lift it.
    GAME.forceContainers.push({
        x: cursorX + 200, y: 310, width: 90, height: 230,
        baseY: 310, isHovering: false, type: 'brick', color: '#e74c3c'
    });
    // Draw 600px of ground under the Force block
    addGround(300, 540);
        // Place a heavy red brick 200px into this section. The player must hold 'F' to lift it.
    GAME.forceContainers.push({
        x: cursorX + 200, y: 310, width: 90, height: 230,
        baseY: 310, isHovering: false, type: 'brick', color: '#e74c3c'
    });
    // Draw 600px of ground under the Force block
    addGround(300, 540);
    addGround(100, 480);
    addGround(100, 400);
    addGround(100, 350);
    addGround(100, 300);
    addGround(100, 250);
    addGround(50, 200);
    addGround(50, 250);
    addGround(50, 200);
    addGround(50, 250);
    addGround(50, 200);
    addGround(50, 250);
    addGround(50, 200);
    addGround(50, 250);
    addGround(50, 200);
    addGround(50, 250);
    addGround(50, 200);
    addGround(50, 250);
    addGround(50, 200);
    addGround(50, 250);
    addGround(50, 300);
    addGround(50, 350);
    addGround(50, 400);

        GAME.jumpPads.push({ 
        x: cursorX + 100, y: 520, width: 60, height: 20, color: "#00ffcc" 
    });

        // Place a heavy red brick 200px into this section. The player must hold 'F' to lift it.
    GAME.forceContainers.push({
        x: cursorX + 200, y: 310, width: 90, height: 230,
        baseY: 310, isHovering: false, type: 'brick', color: '#e74c3c'
    });
    // Draw 600px of ground under the Force block
    addGround(300, 540);

    // --- SECTION 5: HORIZONTAL MOVING PLATFORM OVER PIT ---
    // Place a platform moving left and right over the pit
    GAME.movingPlatforms.push({ 
        x: cursorX, y: 440, width: 140, height: 24, 
        dx: 1.8, dy: 0, minX: cursorX, maxX: cursorX + 300, // Moves 300px right
        minY: 440, maxY: 440, isMoving: true 
    });
    // Add the water pit under the moving platform
    addWaterPit(400);
    addGround(200, 540);

    
// Left Vertical Lift (Starts low at Y: 490, moves up to Y: 200)
    GAME.movingPlatforms.push({
        x: cursorX + 50, y: 490, width: 120, height: 24,
        dx: 0, dy: -2.0, minX: cursorX + 50, maxX: cursorX + 50,
        minY: 200, maxY: 490, isMoving: true
    });

    // The Giant Wall in the middle
    // Note: Set isGround: false so it renders as a high-tech metal pillar instead of dirt
    GAME.platforms.push({
        x: cursorX + 200, y: 220, width: 100, height: 320, isGround: false
    });

    // Right Vertical Lift (Starts higher up at Y: 290, moves up to Y: 200)
    GAME.movingPlatforms.push({
        x: cursorX + 330, y: 290, width: 120, height: 24,
        dx: 0, dy: -2.0, minX: cursorX + 330, maxX: cursorX + 330,
        minY: 200, maxY: 290, isMoving: true
    });

    // THIS IS THE SECRET:
    // Instead of addGround, we add a water pit that spans the entire 600px width of this obstacle!
    addWaterPit(600);

    // A simple 200px gap to jump over
    addWaterPit(150);
    addGround(200, 540);

    // A simple 200px gap to jump over
    addWaterPit(150);
    addGround(200, 540);
    addWaterPit(150);

    // Place an R2D2 droid 100px into this new section
    GAME.droids.push({
        x: cursorX + 100, y: 495, baseY: 495, width: 40, height: 45, type: 'r2d2',
        dx: 1.5, minX: cursorX + 50, maxX: cursorX + 350,
        bounceY: 0, textTimer: 0, label: 'Beep Boop!', isFloating: false
    });
    
    // --- SECTION 10: GOAL AREA ---
    // Place the Lightsaber 300px into the final section
    GAME.lightsaber = { x: cursorX + 300, y: 480, width: 12, height: 60 };
    // Draw 500px of ground for the ending area
    addGround(500, 540);

    // Set the final width of the level so the camera stops scrolling
    GAME.worldWidth = cursorX;
}
