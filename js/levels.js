function buildMissionLevel(difficultyMultiplier) {
    GAME.platforms = []; GAME.movingPlatforms = []; GAME.jumpPads = []; GAME.forceContainers = []; 
    GAME.stars = []; GAME.vaporators = []; GAME.crates = []; GAME.studs = []; GAME.droids = []; 
    GAME.particles = []; GAME.kyberCrystals = []; GAME.waterPits = []; GAME.buildings = [];
    GAME.laserGates = []; GAME.npcs = [];
    
    GAME.kyberCrystalsCollected = 0;
    let cursorX = 0;
    let totalWidthNeeded = 8000;

    for(let i = 0; i < 250; i++) {
        GAME.stars.push({ x: Math.random() * totalWidthNeeded, y: Math.random() * 450, size: Math.random() * 2 + 1, alpha: Math.random() });
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

    function addFloatingPlatform(xOffset, y, width) {
        GAME.movingPlatforms.push({ x: cursorX + xOffset, y: y, width: width, height: 24, dx: 0, dy: 0, minX: 0, maxX: 0, minY: 0, maxY: 0, isMoving: false });
        for(let s = 0; s < 3; s++) {
            GAME.studs.push({ x: cursorX + xOffset + 30 + (s * 40), y: y - 35, radius: 7, collected: false, color: "#00bfff" });
        }
    }

    addGround(1000, 540);
    let numberOfObstacles = Math.max(3, difficultyMultiplier * 3);
    for (let i = 0; i < numberOfObstacles; i++) {
        let choice = Math.random();
        let currentHeight = 520 - (Math.random() * 80);

        if (choice < 0.25) {
            // Horizontal Moving Platform over pit
            let pitSize = 220 + (difficultyMultiplier * 50);
            GAME.movingPlatforms.push({ 
                x: cursorX, y: 440, width: 140, height: 24, 
                dx: 1.5, dy: 0, minX: cursorX, maxX: cursorX + pitSize - 140, 
                minY: 440, maxY: 440, isMoving: true 
            });
            addWaterPit(pitSize);
            addGround(700, currentHeight);

        } else if (choice < 0.50) {
            // Vertical Up & Down Moving Platform beside a giant wall
            let wallHeight = 280;
            let wallWidth = 100;
            let wallX = cursorX + 300;

            GAME.movingPlatforms.push({
                x: cursorX + 120, y: currentHeight - 50, width: 130, height: 24,
                dx: 0, dy: -2.0, minX: cursorX + 120, maxX: cursorX + 120,
                minY: currentHeight - 240, maxY: currentHeight - 50, isMoving: true
            });

            GAME.platforms.push({
                x: wallX, y: currentHeight - wallHeight,
                width: wallWidth, height: wallHeight + 100, isGround: false
            });

            addGround(800, currentHeight);

        } else if (choice < 0.75) {
            // Tall Unjumpable Barrier (Slash with D)
            addGround(300, currentHeight);
            GAME.laserGates.push({
                x: cursorX - 80, y: currentHeight - 300,
                width: 20, height: 300, destroyed: false
            });
            addGround(600, currentHeight);

        } else {
            // Force Container
            let forceTypes = ['container', 'speeder', 'brick'];
            let chosenType = forceTypes[Math.floor(Math.random() * forceTypes.length)];
            
            GAME.forceContainers.push({
                x: cursorX + 250, y: currentHeight - 230,
                width: chosenType === 'speeder' ? 100 : 90,
                height: chosenType === 'brick' ? 160 : 220,
                baseY: currentHeight - 230, isHovering: false, type: chosenType,
                color: chosenType === 'brick' ? '#e74c3c' : null
            });
            addGround(1000, currentHeight);
        }
    }

    addGround(1000, 540);
    GAME.worldWidth = cursorX;

    if (GAME.currentMission === 1) {
        GAME.lightsaber.x = GAME.worldWidth - 500;
        GAME.lightsaber.y = 480;
        GAME.obi.x = 300;
        GAME.obi.y = 490;
    }
}
