function buildMission3() {
    // 1. Map Width & Player Ship Spawn (12,000px Map)
    GAME.worldWidth = 12000;
    GAME.player = {
        x: 100,
        y: 270,
        width: 65,  // 65px Starfighter
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

    // 4. Single, Dual, and Super Shield Generators
    GAME.shieldGenerators = [
        // Gate 1: Standard Single Generator (3 Hits)
        { id: "gen1", x: 2200, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true },

        // Gate 2: DUAL GENERATORS (Must destroy BOTH gen2a & gen2b to open barrier!)
        { id: "gen2a", x: 5000, y: 90,  width: 45, height: 45, hp: 3, maxHp: 3, active: true },
        { id: "gen2b", x: 5000, y: 430, width: 45, height: 45, hp: 3, maxHp: 3, active: true },

        // Gate 3: Standard Single Generator (3 Hits)
        { id: "gen3", x: 8200, y: 260, width: 45, height: 45, hp: 3, maxHp: 3, active: true },

        // Gate 4: SUPER SHIELD GENERATOR (10 Hits!)
        { id: "gen4", x: 10150, y: 250, width: 60, height: 60, hp: 10, maxHp: 10, isSuper: true, active: true }
    ];

    GAME.shieldBarriers = [
        { targetIds: ["gen1"],           x: 2500,  y: 0, width: 30, height: 600, active: true },
        { targetIds: ["gen2a", "gen2b"], x: 5500,  y: 0, width: 30, height: 600, active: true }, // Dual Shield
        { targetIds: ["gen3"],           x: 8500,  y: 0, width: 30, height: 600, active: true },
        { targetIds: ["gen4"],           x: 10500, y: 0, width: 30, height: 600, active: true }  // Super Shield
    ];

    // 5. Space Asteroids & Asteroid Rain
    GAME.asteroids = [
        // --- ZONE 1: Entry Corridor (0 - 2,500px) ---
        { x: 500,  y: 180, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 750,  y: 400, radius: 60, destructible: false, color: "#636e72", active: true },
        { x: 1100, y: 320, radius: 40, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true, dy: 2, minY: 100, maxY: 480 },
        { x: 1400, y: 220, radius: 85, destructible: false, color: "#2d3436", active: true },
        { x: 1750, y: 440, radius: 35, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 2000, y: 150, radius: 50, destructible: false, color: "#7f8c8d", active: true },

        // --- ZONE 2: Deep Space Field (2,500 - 5,500px) ---
        { x: 2800, y: 150, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 3100, y: 380, radius: 70, destructible: false, color: "#485460", active: true, dy: -2.5, minY: 100, maxY: 480 },
        { x: 3800, y: 450, radius: 50, destructible: false, color: "#d63031", active: true },
        { x: 4100, y: 180, radius: 40, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 4400, y: 320, radius: 90, destructible: false, color: "#2d3436", active: true },
        { x: 4800, y: 120, radius: 35, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true, dy: 2.8, minY: 80, maxY: 480 },

        // --- ZONE 3: Cosmic Field (5,500 - 8,500px) ---
        { x: 5800, y: 250, radius: 50, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 6100, y: 100, radius: 65, destructible: false, color: "#636e72", active: true, dy: 3, minY: 80, maxY: 500 },
        { x: 6800, y: 200, radius: 75, destructible: false, color: "#2d3436", active: true },
        { x: 7200, y: 350, radius: 40, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 7600, y: 150, radius: 55, destructible: false, color: "#7f8c8d", active: true, dy: -2, minY: 100, maxY: 460 },

        // --- ZONE 4: Final Approach to Moon (8,500 - 11,200px) ---
        { x: 8800, y: 180, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 9100, y: 400, radius: 80, destructible: false, color: "#485460", active: true },
        { x: 9800, y: 350, radius: 50, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 10800, y: 250, radius: 95, destructible: false, color: "#2d3436", active: true },

        // --- CONTINUOUS ASTEROID RAIN (Flying Right to Left) ---
        { x: 1200, y: 150, radius: 28, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -4.0, isRain: true, hasTail: true },
        { x: 1800, y: 380, radius: 35, destructible: false, color: "#636e72", active: true, dx: -4.8, isRain: true, hasTail: true },
        { x: 2600, y: 220, radius: 25, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -4.2, isRain: true, hasTail: true },
        { x: 3400, y: 420, radius: 40, destructible: false, color: "#2d3436", active: true, dx: -5.0, isRain: true, hasTail: true },
        { x: 4200, y: 180, radius: 30, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -4.5, isRain: true, hasTail: true },
        { x: 5000, y: 300, radius: 38, destructible: false, color: "#7f8c8d", active: true, dx: -5.2, isRain: true, hasTail: true },
        { x: 6200, y: 160, radius: 30, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -4.0, isRain: true, hasTail: true },
        { x: 7400, y: 440, radius: 35, destructible: false, color: "#636e72", active: true, dx: -5.1, isRain: true, hasTail: true },
        { x: 8600, y: 200, radius: 28, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -4.6, isRain: true, hasTail: true },
        { x: 9800, y: 360, radius: 42, destructible: false, color: "#2d3436", active: true, dx: -5.4, isRain: true, hasTail: true }
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
