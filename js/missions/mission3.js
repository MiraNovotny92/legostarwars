function buildMission3() {
    // 1. Map Width & Player Ship Spawn (12,000px - Twice as long!)
    GAME.worldWidth = 12000;
    GAME.player = {
        x: 100,
        y: 270,
        width: 65,  // Larger 65px ship
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
    GAME.moon = { x: 11400, y: 50 };

    // 4. 4 Shield Gates along the 12,000px journey
    GAME.shieldGenerators = [
        { id: "gen1", x: 2200, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true },
        { id: "gen2", x: 5200, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true },
        { id: "gen3", x: 8200, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true },
        { id: "gen4", x: 10200, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true }
    ];

    GAME.shieldBarriers = [
        { targetId: "gen1", x: 2500, y: 0, width: 30, height: 600, active: true },
        { targetId: "gen2", x: 5500, y: 0, width: 30, height: 600, active: true },
        { targetId: "gen3", x: 8500, y: 0, width: 30, height: 600, active: true },
        { targetId: "gen4", x: 10500, y: 0, width: 30, height: 600, active: true }
    ];

    // 5. Massive Asteroid Field (Varied colors, jagged shapes, tails, and sizes)
    GAME.asteroids = [
        // --- ZONE 1: Entry Corridor (0 - 2,500px) ---
        { x: 500,  y: 180, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 750,  y: 400, radius: 60, destructible: false, color: "#636e72", active: true }, // Slate Grey
        { x: 950,  y: 120, radius: 25, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -2.5, minX: 700, maxX: 1100, hasTail: true }, // Fast Comet
        { x: 1100, y: 320, radius: 40, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true, dy: 2, minY: 100, maxY: 480 },
        { x: 1400, y: 220, radius: 85, destructible: false, color: "#2d3436", active: true }, // Giant Dark Iron Rock
        { x: 1750, y: 440, radius: 35, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 2000, y: 150, radius: 50, destructible: false, color: "#7f8c8d", active: true },

        // --- ZONE 2: Deep Space Field (2,500 - 5,500px) ---
        { x: 2800, y: 150, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 3100, y: 380, radius: 70, destructible: false, color: "#485460", active: true, dy: -2.5, minY: 100, maxY: 480 },
        { x: 3400, y: 220, radius: 30, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -3, minX: 3100, maxX: 3600, hasTail: true },
        { x: 3800, y: 450, radius: 50, destructible: false, color: "#d63031", active: true }, // Red Clay Rock
        { x: 4100, y: 180, radius: 40, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 4400, y: 320, radius: 90, destructible: false, color: "#2d3436", active: true }, // Massive Hazard
        { x: 4800, y: 120, radius: 35, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true, dy: 2.8, minY: 80, maxY: 480 },

        // --- ZONE 3: Cosmic Storm (5,500 - 8,500px) ---
        { x: 5800, y: 250, radius: 50, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 6100, y: 100, radius: 65, destructible: false, color: "#636e72", active: true, dy: 3, minY: 80, maxY: 500 },
        { x: 6400, y: 420, radius: 30, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -3.5, minX: 6000, maxX: 6600, hasTail: true },
        { x: 6800, y: 200, radius: 75, destructible: false, color: "#2d3436", active: true },
        { x: 7200, y: 350, radius: 40, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 7600, y: 150, radius: 55, destructible: false, color: "#7f8c8d", active: true, dy: -2, minY: 100, maxY: 460 },

        // --- ZONE 4: Final Approach to Moon (8,500 - 11,200px) ---
        { x: 8800, y: 180, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 9100, y: 400, radius: 80, destructible: false, color: "#485460", active: true },
        { x: 9400, y: 220, radius: 35, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -3, minX: 9000, maxX: 9600, hasTail: true },
        { x: 9800, y: 350, radius: 50, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 10800, y: 250, radius: 95, destructible: false, color: "#2d3436", active: true }
    ];

    // 6. Space Studs / Coins Path
    for (let x = 300; x < 11000; x += 130) {
        let y = 120 + Math.sin(x / 240) * 180 + 150;
        GAME.studs.push({
            x: x,
            y: y,
            radius: 9,
            color: x % 260 === 0 ? "#ffd700" : "#00bfff",
            collected: false
        });
    }
}
