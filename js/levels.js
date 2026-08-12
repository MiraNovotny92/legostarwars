function buildMissionLevel(difficultyMultiplier) {
    GAME.platforms = []; 
    GAME.movingPlatforms = []; 
    GAME.jumpPads = []; 
    GAME.forceContainers = []; 
    GAME.stars = []; 
    GAME.vaporators = []; 
    GAME.crates = []; 
    GAME.studs = []; 
    GAME.droids = []; 
    GAME.particles = []; 
    GAME.kyberCrystals = []; 
    GAME.waterPits = []; 
    GAME.buildings = [];
    GAME.laserGates = []; 
    GAME.npcs = [];
    
    GAME.kyberCrystalsCollected = 0;
    let cursorX = 0;
    let totalWidthNeeded = 8000;

    for(let i = 0; i < 250; i++) {
        GAME.stars.push({ 
            x: Math.random() * totalWidthNeeded, 
            y: Math.random() * 450, 
            size: Math.random() * 2 + 1, 
            alpha: Math.random() 
        });
    }

    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        
        if (width >= 800 && Math.random() > 0.3) {
            let bType = Math.random() > 0.5 ? 'imperial' : 'jedi';
            GAME.buildings.push({
                x: cursorX + 200, y: heightY - 160,
                width: 180, height: 160, type: bType
            });
        }

        let itemsCount = Math.floor(width / 320);
        for(let j = 0; j < itemsCount; j++) {
            let rX = cursorX + 80 + Math.random() * (width - 160);
            if (Math.random() > 0.5) {
                GAME.vaporators.push({ x: rX, y: heightY - 180, width: 30, height: 180 });
            } else {
                GAME.crates.push({ x: rX, y: heightY - 50, width: 50, height: 50, color: "#f39c12" });
            }
        }

        if (width >= 350 && cursorX > 200) {
            const types = ['r2d2', 'gonk', 'bb8', 'mouse'];
            let droidType = types[Math.floor(Math.random() * types.length)];
            let labels = { r2d2: 'Beep Boop!', gonk: 'GONK!', bb8: 'Beep-Bloop!', mouse: 'Whirrr!' };
            
            GAME.droids.push({
                x: cursorX + 100 + Math.random() * (width - 200),
                y: heightY - 45, baseY: heightY - 45, width: 40, height: 45,
                type: droidType,
                dx: droidType === 'mouse' ? 2.2 : 1.2,
                minX: cursorX + 40, maxX: cursorX + width - 40,
                bounceY: 0, textTimer: 0, label: labels[droidType], isFloating: false
            });
        }
        cursorX += width;
    }

    function addWaterPit(width) {
        GAME.waterPits.push({ x: cursorX, width: width, y: 550 });
        cursorX += width;
    }

    // Starting Safe Zone
    addGround(1000, 540);

    let numberOfObstacles = Math.max(4, difficultyMultiplier * 3);
    for (let i = 0; i < numberOfObstacles; i++) {
        let choice = Math.random();
        let currentHeight = 520 - (Math.random() * 40);

        if (choice < 0.3) {
            // OBSTACLE 1: Water Pit with Horizontal Moving Platform
            let pitSize = 240 + (difficultyMultiplier * 40);
            GAME.movingPlatforms.push({ 
                x: cursorX + 20, y: 440, width: 130, height: 24, 
                dx: 1.8, dy: 0, minX: cursorX + 20, maxX: cursorX + pitSize - 130,
                minY: 440, maxY: 440, isMoving: true 
            });
            addWaterPit(pitSize);
            addGround(700, currentHeight);

        } else if (choice < 0.6) {
            // OBSTACLE 2: TALL LIGHTSABER BARRIER (Too high to jump over, must slash with D)
            addGround(400, currentHeight);
            GAME.laserGates.push({
                x: cursorX - 100, y: currentHeight - 320,
                width: 28, height: 320, destroyed: false
            });
            addGround(500, currentHeight);

        } else if (choice < 0.85) {
            // OBSTACLE 3: GIANT WALL + VERTICAL MOVING PLATFORM (Up and Down)
            let wallHeight = 280;
            let wallWidth = 120;
            let wallX = cursorX + 320;

            // Vertical platform going up and down
            GAME.movingPlatforms.push({
                x: cursorX + 140, y: currentHeight - 60, width: 130, height: 24,
                dx: 0, dy: -2.0, minX: cursorX + 140, maxX: cursorX + 140,
                minY: currentHeight - 250, maxY: currentHeight - 50, isMoving: true
            });

            // Unjumpable Giant Wall Block
            GAME.platforms.push({
                x: wallX, y: currentHeight - wallHeight,
                width: wallWidth, height: wallHeight + 100, isGround: false
            });

            // Stud rewards on top of giant wall
            for (let s = 0; s < 3; s++) {
                GAME.studs.push({ x: wallX + 20 + (s * 35), y: currentHeight - wallHeight - 30, radius: 7, collected: false, color: "#ffd700" });
            }

            addGround(900, currentHeight);

        } else {
            // OBSTACLE 4: Force Levitation Block
            let forceTypes = ['container', 'speeder', 'brick'];
            let chosenType = forceTypes[Math.floor(Math.random() * forceTypes.length)];
            
            GAME.forceContainers.push({
                x: cursorX + 250, y: currentHeight - 230,
                width: chosenType === 'speeder' ? 100 : 90,
                height: chosenType === 'brick' ? 160 : 220,
                baseY: currentHeight - 230, isHovering: false, type: chosenType,
                color: chosenType === 'brick' ? '#e74c3c' : null
            });
            addGround(900, currentHeight);
        }
    }

    // Goal Zone
    addGround(1200, 540);
    GAME.worldWidth = cursorX;
    GAME.lightsaber.x = GAME.worldWidth - 600;

    while(GAME.currentMission === 2 && GAME.kyberCrystals.length < 3) {
        GAME.kyberCrystals.push({ 
            x: 800 + (GAME.kyberCrystals.length * 800), 
            y: 480, width: 20, height: 30, collected: false 
        });
    }
}
