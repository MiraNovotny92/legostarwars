function buildMission3() {
    // 1. Level Dimensions & Player Ship Spawn
    GAME.worldWidth = 6000; // Long space map
    GAME.player = {
        x: 100,
        y: 300,
        width: 40,
        height: 25,
        dx: 0,
        dy: 0,
        shootTimer: 0
    };

    // 2. Clear ground platformer objects so space remains empty
    GAME.platforms = [];
    GAME.movingPlatforms = [];
    GAME.crates = [];
    GAME.forceContainers = [];
    GAME.laserGates = [];
    GAME.droids = [];
    GAME.npcs = [];
    GAME.jumpPads = [];
    GAME.waterPits = [];
    GAME.vaporators = [];
    GAME.buildings = [];
    GAME.playerLasers = [];

    // 3. Moon / Destination Planet at the end of space
    GAME.moon = { x: 5500, y: 50 };

    // 4. Forcefield Barriers & 3-Hit Generators
    GAME.shieldGenerators = [
        { id: "gen1", x: 1750, y: 120, width: 35, height: 35, hp: 3, active: true },
        { id: "gen2", x: 3750, y: 480, width: 35, height: 35, hp: 3, active: true }
    ];

    GAME.shieldBarriers = [
        { targetId: "gen1", x: 1900, y: 0, width: 25, height: 700, active: true },
        { targetId: "gen2", x: 3900, y: 0, width: 25, height: 700, active: true }
    ];

    // 5. Asteroid Field (Destroyable vs. Solid, Static vs. Moving)
    GAME.asteroids = [
        // --- ZONE 1: Warm-up Asteroids ---
        { x: 500,  y: 200, radius: 35, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 700,  y: 400, radius: 45, destructible: false, active: true }, // Solid
        { x: 900,  y: 150, radius: 30, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 1100, y: 320, radius: 40, destructible: true,  hp: 3, maxHp: 3, active: true, dy: 2, minY: 150, maxY: 480 }, // Moving Up/Down
        { x: 1400, y: 250, radius: 50, destructible: false, active: true },

        // --- ZONE 2: First Shield Gate Area ---
        { x: 2100, y: 100, radius: 40, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 2300, y: 450, radius: 35, destructible: true,  hp: 3, maxHp: 3, active: true, dy: -2.5, minY: 100, maxY: 480 },
        { x: 2600, y: 280, radius: 55, destructible: false, active: true, dx: 1.5, minX: 2500, maxX: 2800 }, // Moving Left/Right
        { x: 2900, y: 150, radius: 30, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 3100, y: 380, radius: 45, destructible: true,  hp: 3, maxHp: 3, active: true },

        // --- ZONE 3: Heavy Asteroid Field ---
        { x: 4200, y: 200, radius: 40, destructible: false, active: true, dy: 3, minY: 80, maxY: 500 },
        { x: 4400, y: 400, radius: 35, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 4700, y: 120, radius: 45, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 500, y: 300, radius: 60, destructible: false, active: true },
        { x: 5200, y: 250, radius: 30, destructible: true,  hp: 3, maxHp: 3, active: true }
    ];

    // 6. Space Studs / Coins to Collect
    GAME.studs = [];
    for (let x = 300; x < 5300; x += 150) {
        let y = 100 + Math.sin(x / 200) * 200 + 150; // Wavy pattern through space
        GAME.studs.push({
            x: x,
            y: y,
            radius: 8,
            color: x % 300 === 0 ? "#ffd700" : "#00bfff", // Gold & Cyan coins
            collected: false
        });
    }
}
