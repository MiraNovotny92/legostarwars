let currentMission = 1;
let kyberCrystalsCollected = 0;
let groguFound = false;

function buildMissionLevel(difficultyMultiplier) {
    platforms = []; movingPlatforms = []; jumpPads = []; forceContainers = []; 
    stars = []; vaporators = []; crates = []; studs = []; droids = []; particles = []; kyberCrystals = [];
    kyberCrystalsCollected = 0; groguFound = false;
    let cursorX = 0;

    // Endless Sky Star Generator (Scales dynamically across full width)
    let totalWidthNeeded = 6000;
    for(let i = 0; i < 200; i++) {
        stars.push({ x: Math.random() * totalWidthNeeded, y: Math.random() * 450, size: Math.random() * 2 + 1, alpha: Math.random() });
    }

    function addGround(width) {
        platforms.push({ x: cursorX, y: 550, width: width, height: 100, isGround: true });
        
        let itemsCount = Math.floor(width / 320);
        for(let j = 0; j < itemsCount; j++) {
            let rX = cursorX + 100 + Math.random() * (width - 200);
            if (Math.random() > 0.4) {
                vaporators.push({ x: rX, y: 370, width: 24, height: 180 });
            } else {
                crates.push({ x: rX, y: 500, width: 50, height: 50, color: "#485460" });
            }
        }

        // Always Spawn Droids (including Easy/Padawan)
        if (width >= 400 && cursorX > 200) {
            const types = ['r2d2', 'gonk', 'bb8', 'mouse'];
            let droidType = types[Math.floor(Math.random() * types.length)];
            let labels = { r2d2: 'Beep Boop!', gonk: 'GONK!', bb8: 'Beep-Bloop!', mouse: 'Whirrr!' };
            
            droids.push({
                x: cursorX + 150 + Math.random() * (width - 300),
                y: 505, baseY: 505, width: 40, height: 45,
                type: droidType,
                dx: droidType === 'mouse' ? 2.2 : 1.2,
                minX: cursorX + 60, maxX: cursorX + width - 60,
                bounceY: 0, textTimer: 0, label: labels[droidType], isFloating: false
            });
        }

        cursorX += width;
    }

    function addPit(width) { cursorX += width; }
    
    function addFloatingPlatform(xOffset, y, width) {
        movingPlatforms.push({ x: cursorX + xOffset, y: y, width: width, height: 22, dx: 0, minX: 0, maxX: 0, isMoving: false });
        for(let s = 0; s < 3; s++) {
            studs.push({ x: cursorX + xOffset + 30 + (s * 40), y: y - 35, radius: 7, collected: false, color: "#00bfff" });
        }

        if (currentMission === 2 && Math.random() > 0.4 && kyberCrystals.length < 3) {
            kyberCrystals.push({ x: cursorX + xOffset + width/2, y: y - 45, width: 20, height: 30, collected: false });
        }
    }

    addGround(1200);
    let numberOfObstacles = Math.max(3, difficultyMultiplier * 3);

    for (let i = 0; i < numberOfObstacles; i++) {
        let choice = Math.random();
        if (choice < 0.33) {
            let pitSize = 220 + (difficultyMultiplier * 50);
            movingPlatforms.push({ x: cursorX, y: 450, width: 140, height: 22, dx: 1.5, minX: cursorX, maxX: cursorX + pitSize - 140, isMoving: true });
            addPit(pitSize);
            addGround(700);
        } else if (choice < 0.66) {
            jumpPads.push({ x: cursorX + 80, y: 530, width: 60, height: 20, color: "#00ffcc" });
            addFloatingPlatform(80, 280, 200);
            addGround(300); addPit(180); addGround(700);
        } else {
            // Variety of Force Objects (Speeder Bike, Lego Brick, or Container)
            let forceTypes = ['container', 'speeder', 'brick'];
            let chosenType = forceTypes[Math.floor(Math.random() * forceTypes.length)];
            
            forceContainers.push({
                x: cursorX + 250, y: 320,
                width: chosenType === 'speeder' ? 100 : 90,
                height: chosenType === 'brick' ? 160 : 220,
                baseY: 320, isHovering: false, type: chosenType,
                color: chosenType === 'brick' ? '#e74c3c' : null
            });
            addGround(1000);
        }
    }

    addGround(1000);
    worldWidth = cursorX;
    lightsaber.x = worldWidth - 600;

    // Guaranteed 3 Kyber Crystals for Mission 2
    while(currentMission === 2 && kyberCrystals.length < 3) {
        kyberCrystals.push({ x: 800 + (kyberCrystals.length * 800), y: 500, width: 20, height: 30, collected: false });
    }
}
