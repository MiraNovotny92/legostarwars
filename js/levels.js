function buildMissionLevel(difficultyMultiplier) {
    GAME.platforms = []; GAME.movingPlatforms = []; GAME.jumpPads = []; GAME.forceContainers = []; 
    GAME.stars = []; GAME.vaporators = []; GAME.crates = []; GAME.studs = []; GAME.droids = []; 
    GAME.particles = []; GAME.kyberCrystals = []; GAME.waterPits = []; GAME.buildings = [];
    GAME.laserGates = []; GAME.npcs = [];
    
    GAME.kyberCrystalsCollected = 0;
    let cursorX = 0;
    let totalWidthNeeded = 9000;

    for(let i = 0; i < 250; i++) {
        GAME.stars.push({ 
            x: Math.random() * totalWidthNeeded, y: Math.random() * 450, 
            size: Math.random() * 2 + 1, alpha: Math.random() 
        });
    }

    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        
        if (width >= 800 && Math.random() > 0.3) {
            let bType = Math.random() > 0.5 ? 'imperial' : 'jedi';
            GAME.buildings.push({ x: cursorX + 200, y: heightY - 160, width: 180, height: 160, type: bType });
        }

        // Spawn Studs/Coins in Arcs and Rows
        let studCount = GAME.currentMission === 2 ? Math.floor(width / 50) : Math.floor(width / 200);
        for (let s = 0; s < studCount; s++) {
            let studX = cursorX + 60 + (s * 45);
            let colors = ["#ffd700", "#00bfff", "#ff007f", "#2ecc71"];
            let color = colors[Math.floor(Math.random() * colors.length)];
            GAME.studs.push({ x: studX, y: heightY - 45 - Math.sin(s * 0.5) * 40, radius: 8, collected: false, color: color });
        }

        // Spawn Trees & Crates
        let itemsCount = Math.floor(width / 320);
        for(let j = 0; j < itemsCount; j++) {
            let rX = cursorX + 80 + Math.random() * (width - 160);
            if (Math.random() > 0.5) {
                GAME.vaporators.push({ x: rX, y: heightY - 180, width: 30, height: 180 });
            } else {
                GAME.crates.push({ x: rX, y: heightY - 50, width: 50, height: 50, color: "#f39c12" });
            }
        }

        // Spawn All Droid Types
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

            if (Math.random() > 0.5) {
                let npcType = Math.random() > 0.5 ? 'jawa' : 'rebel';
                GAME.npcs.push({
                    x: cursorX + 150, y: heightY - 40, width: 36, height: 40,
                    type: npcType, textTimer: 0, bounceY: 0,
                    label: npcType === 'jawa' ? 'Utinni!' : 'For the Republic!'
                });
            }
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

        if (choice < 0.25) {
            // Water Pit with Moving Platform
            let pitSize = 240 + (difficultyMultiplier * 40);
            GAME.movingPlatforms.push({ 
                x: cursorX + 20, y: 440, width: 130, height: 24, 
                dx: 1.8, dy: 0, minX: cursorX + 20, maxX: cursorX + pitSize - 130,
                minY: 440, maxY: 440, isMoving: true 
            });
            addWaterPit(pitSize);
            addGround(700, currentHeight);

        } else if (choice < 0.50) {
            // TALL LIGHTSABER BARRIER (Slash with D)
            addGround(400, currentHeight);
            GAME.laserGates.push({
                x: cursorX - 100, y: currentHeight - 320,
                width: 28, height: 320, destroyed: false
            });
            addGround(500, currentHeight);

        } else if (choice < 0.75) {
            // GIANT WALL + VERTICAL MOVING PLATFORM (Up / Down)
            let wallHeight = 280;
            let wallWidth = 120;
            let wallX = cursorX + 320;

            GAME.movingPlatforms.push({
                x: cursorX + 140, y: currentHeight - 60, width: 130, height: 24,
                dx: 0, dy: -2.0, minX: cursorX + 140, maxX: cursorX + 140,
                minY: currentHeight - 250, maxY: currentHeight - 50, isMoving: true
            });

            GAME.platforms.push({
                x: wallX, y: currentHeight - wallHeight,
                width: wallWidth, height: wallHeight + 100, isGround: false
            });

            // Stud Rewards On Top of Wall
            for (let s = 0; s < 5; s++) {
                GAME.studs.push({ x: wallX + 10 + (s * 22), y: currentHeight - wallHeight - 30, radius: 8, collected: false, color: "#ffd700" });
            }

            addGround(900, currentHeight);

        } else {
            // FORCE LEVITATION CONTAINER OBSTACLE
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

    addGround(1200, 540);
    GAME.worldWidth = cursorX;
    
    // Mission 1 setup
    if (GAME.currentMission === 1) {
        GAME.lightsaber.x = GAME.worldWidth - 600;
        GAME.obi.x = 300;
        GAME.obi.y = 490;
    }

    // Mission 2 Stud Frenzy Backup Guarantee
    if (GAME.currentMission === 2) {
        while(GAME.studs.length < 120) {
            GAME.studs.push({
                x: 400 + Math.random() * (GAME.worldWidth - 800),
                y: 200 + Math.random() * 300,
                radius: 8, collected: false, color: ["#ffd700", "#00bfff", "#ff007f"][Math.floor(Math.random()*3)]
            });
        }
    }
}
