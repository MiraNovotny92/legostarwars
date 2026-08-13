function buildMission3() {
    // 1. Map Width & Larger Player Ship Spawn
    GAME.worldWidth = 6000;
    GAME.player = {
        x: 100,
        y: 270,
        width: 65,  // Larger 65px ship!
        height: 36,
        dx: 0,
        dy: 0,
        shootTimer: 0
    };

    // 2. Initialize Space Arrays
    GAME.playerLasers = [];
    GAME.asteroids = [];
    GAME.shieldGenerators = [];
    GAME.shieldBarriers = [];

    // 3. Destination Moon / Planet
    GAME.moon = { x: 5500, y: 50 };

    // 4. Shield Generators placed RIGHT IN THE CENTER FLIGHT PATH before the barrier!
    GAME.shieldGenerators = [
        { id: "gen1", x: 1500, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true },
        { id: "gen2", x: 3500, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true }
    ];

    GAME.shieldBarriers = [
        { targetId: "gen1", x: 1800, y: 0, width: 30, height: 600, active: true },
        { targetId: "gen2", x: 3800, y: 0, width: 30, height: 600, active: true }
    ];

    // 5. Clear Asteroid Layout (Purple = Destroyable, Grey = Solid Danger)
    GAME.asteroids = [
        // --- ZONE 1: Warm-up Area ---
        { x: 500,  y: 200, radius: 45, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 750,  y: 420, radius: 55, destructible: false, active: true }, // Solid Iron
        { x: 1000, y: 180, radius: 40, destructible: true,  hp: 3, maxHp: 3, active: true, dy: 2, minY: 100, maxY: 480 },
        { x: 1250, y: 360, radius: 50, destructible: true,  hp: 3, maxHp: 3, active: true },

        // --- ZONE 2: After First Shield Gate ---
        { x: 2100, y: 150, radius: 45, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 2400, y: 400, radius: 50, destructible: false, active: true, dy: -2.5, minY: 100, maxY: 480 },
        { x: 2700, y: 260, radius: 60, destructible: false, active: true, dx: 1.5, minX: 2500, maxX: 2900 },
        { x: 3000, y: 180, radius: 40, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 3250, y: 380, radius: 50, destructible: true,  hp: 3, maxHp: 3, active: true },

        // --- ZONE 3: Final Approach to Moon ---
        { x: 4100, y: 220, radius: 50, destructible: false, active: true, dy: 3, minY: 80, maxY: 500 },
        { x: 4400, y: 420, radius: 45, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 4700, y: 150, radius: 50, destructible: true,  hp: 3, maxHp: 3, active: true },
        { x: 5000, y: 280, radius: 65, destructible: false, active: true }
    ];

    // 6. Space Studs / Coins Path
    for (let x = 300; x < 5200; x += 140) {
        let y = 120 + Math.sin(x / 220) * 180 + 150;
        GAME.studs.push({
            x: x,
            y: y,
            radius: 9,
            color: x % 280 === 0 ? "#ffd700" : "#00bfff",
            collected: false
        });
    }
}
