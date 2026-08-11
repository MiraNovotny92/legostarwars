// Centralized Global Engine State
window.GAME = {
    state: "START",
    currentMission: 1,
    selectedCharKey: 'luke',
    score: 0,
    hasLightsaber: false,
    hasShield: false,
    shieldTimer: 0,
    startTime: 0,
    elapsedTime: 0,
    kyberCrystalsCollected: 0,
    deathMessageTimer: 0,
    lastSafeX: 50,
    worldWidth: 3000,
    gravity: 0.65,
    friction: 0.82,
    camera: { x: 0, y: 0, shake: 0 },
    
    player: { 
        x: 50, y: 400, width: 48, height: 48, 
        dx: 0, dy: 0, speed: 5, jumpPower: -13.5, 
        grounded: false, facing: 'right',
        scaleX: 1, scaleY: 1,
        saberSwingTimer: 0
    },
    obi: { x: 300, y: 490, width: 50, height: 50 },
    lightsaber: { x: 2000, y: 480, width: 12, height: 60 },

    platforms: [],
    movingPlatforms: [],
    jumpPads: [],
    forceContainers: [],
    stars: [],
    vaporators: [],
    crates: [],
    studs: [],
    droids: [],
    particles: [],
    kyberCrystals: [],
    waterPits: [],
    buildings: [],
    laserGates: [],
    npcs: []
};

// Fail-Safe Drawing Helper (Guarantees zero API exceptions on any browser)
function drawRoundedRect(ctx, x, y, width, height, radius = 6) {
    let r = typeof radius === 'number' ? radius : 6;
    ctx.beginPath();
    try {
        if (ctx.roundRect) {
            ctx.roundRect(x, y, width, height, r);
        } else {
            ctx.rect(x, y, width, height);
        }
    } catch (e) {
        ctx.rect(x, y, width, height);
    }
    ctx.fill();
}
