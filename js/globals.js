// Centralized Engine State - Guarantees all files share the exact same data
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

// Fail-Safe Drawing Helper (Guarantees zero browser crashes)
window.drawRoundedRect = function(ctx, x, y, w, h, r = 6) {
    if (w <= 0 || h <= 0) return;
    try {
        let radius = typeof r === 'number' ? r : 6;
        if (radius * 2 > w) radius = w / 2;
        if (radius * 2 > h) radius = h / 2;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
        ctx.fill();
    } catch(e) {
        // Ultimate Fallback if the browser doesn't support complex curves
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
    }
};
