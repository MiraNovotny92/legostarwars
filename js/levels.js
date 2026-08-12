function buildMissionLevel() {
    // 1. Reset all arrays for the new level
    GAME.platforms = []; GAME.movingPlatforms = []; GAME.jumpPads = []; GAME.forceContainers = []; 
    GAME.stars = []; GAME.vaporators = []; GAME.crates = []; GAME.studs = []; GAME.droids = []; 
    GAME.particles = []; GAME.kyberCrystals = []; GAME.waterPits = []; GAME.buildings = [];
    GAME.laserGates = []; GAME.npcs = [];
    
    GAME.kyberCrystalsCollected = 0;

    // 2. Generate Background Stars
    for(let i = 0; i < 250; i++) {
        GAME.stars.push({ x: Math.random() * 8000, y: Math.random() * 450, size: Math.random() * 2 + 1, alpha: Math.random() });
    }

    // 3. Route to the correct handcrafted mission file
    if (GAME.currentMission === 1) {
        buildMission1();
    } 
    else if (GAME.currentMission === 2) {
        buildMission2(); 
    } 
    else if (GAME.currentMission === 3) {
        buildMission3(); 
    }
}
