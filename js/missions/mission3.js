function buildMission3() {
    // 1. Map Width & Player Ship Spawn
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

    // 2. Initialize Arrays
    GAME.playerLasers = [];
    GAME.asteroids = [];
    GAME.shieldGenerators = [];
    GAME.shieldBarriers = [];
    GAME.mazeWalls = [];
    GAME.puzzleBatteries = [];
    GAME.puzzleSockets = [];
    GAME.puzzleDoors = [];

    // 3. Destination Earth-like Planet
    GAME.moon = { x: 11400, y: 50 };

    // 4. Shield Generators (Gate 1, Dual Gate 2, Gate 3, Super Shield 4)
    GAME.shieldGenerators = [
        { id: "gen1",  x: 2200,  y: 260, width: 45, height: 45, hp: 3,  maxHp: 3,  active: true },
        { id: "gen2a", x: 6200,  y: 90,  width: 45, height: 45, hp: 3,  maxHp: 3,  active: true },
        { id: "gen2b", x: 6200,  y: 430, width: 45, height: 45, hp: 3,  maxHp: 3,  active: true },
        { id: "gen3",  x: 9200,  y: 260, width: 45, height: 45, hp: 3,  maxHp: 3,  active: true },
        { id: "gen4",  x: 10200, y: 250, width: 60, height: 60, hp: 10, maxHp: 10, isSuper: true, active: true }
    ];

    GAME.shieldBarriers = [
        { targetIds: ["gen1"],           x: 2500,  y: 0, width: 30, height: 600, active: true },
        { targetIds: ["gen2a", "gen2b"], x: 6500,  y: 0, width: 30, height: 600, active: true },
        { targetIds: ["gen3"],           x: 9500,  y: 0, width: 30, height: 600, active: true },
        { targetIds: ["gen4"],           x: 10500, y: 0, width: 30, height: 600, active: true }
    ];

    // =========================================================
    // MAZE SECTION 1: Space Station Outer Wing (3,200px - 4,800px)
    // =========================================================
    GAME.mazeWalls.push(
        // Outer Outer Bounds
        { x: 3200, y: 0,   width: 1600, height: 40 },
        { x: 3200, y: 560, width: 1600, height: 40 },

        // Internal Corridor Walls
        { x: 3200, y: 40,  width: 40, height: 200 },
        { x: 3200, y: 360, width: 40, height: 200 },
        { x: 3600, y: 160, width: 40, height: 400 }, // Forces top/bottom paths
        { x: 4000, y: 40,  width: 40, height: 380 },
        { x: 4400, y: 160, width: 40, height: 400 }
    );

    // Puzzle 1: Battery in Top Chamber, Socket & Door at Exit
    GAME.puzzleBatteries.push({ id: "bat1", targetSocketId: "soc1", x: 3400, y: 100, width: 35, height: 35, placed: false });
    GAME.puzzleSockets.push({ id: "soc1", x: 4600, y: 120, width: 45, height: 45, active: false });
    GAME.puzzleDoors.push({ id: "door1", targetSocketId: "soc1", x: 4700, y: 40, width: 30, height: 520, active: true });


    // =========================================================
    // MAZE SECTION 2: Deep Wreckage Core (7,000px - 8,600px)
    // =========================================================
    GAME.mazeWalls.push(
        { x: 7000, y: 0,   width: 1600, height: 40 },
        { x: 7000, y: 560, width: 1600, height: 40 },

        { x: 7000, y: 40,  width: 40, height: 200 },
        { x: 7000, y: 360, width: 40, height: 200 },
        { x: 7400, y: 40,  width: 40, height: 380 },
        { x: 7800, y: 180, width: 40, height: 380 },
        { x: 8200, y: 40,  width: 40, height: 380 }
    );

    // Puzzle 2: Battery in Lower Dead-End Chamber, Socket & Door at Exit
    GAME.puzzleBatteries.push({ id: "bat2", targetSocketId: "soc2", x: 7200, y: 460, width: 35, height: 35, placed: false });
    GAME.puzzleSockets.push({ id: "soc2", x: 8400, y: 450, width: 45, height: 45, active: false });
    GAME.puzzleDoors.push({ id: "door2", targetSocketId: "soc2", x: 8500, y: 40, width: 30, height: 520, active: true });


    // 6. Asteroid Field & Rain (Skipping Maze Coordinates so Rocks don't spawn inside walls)
    GAME.asteroids = [
        // Zone 1: Entry Space
        { x: 500,  y: 180, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 750,  y: 400, radius: 60, destructible: false, color: "#636e72", active: true },
        { x: 1100, y: 320, radius: 40, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true, dy: 2, minY: 100, maxY: 480 },
        { x: 1400, y: 220, radius: 85, destructible: false, color: "#2d3436", active: true },
        { x: 1750, y: 440, radius: 35, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },

        // Zone 2: Mid Open Space
        { x: 5100, y: 180, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 5400, y: 420, radius: 80, destructible: false, color: "#2d3436", active: true },

        // Zone 3: Final Approach
        { x: 8900, y: 180, radius: 45, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },
        { x: 9800, y: 350, radius: 50, destructible: true,  hp: 3, maxHp: 3, color: "#8e44ad", active: true },

        // Rain Comets
        { x: 1200, y: 150, radius: 28, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -4.0, isRain: true, hasTail: true },
        { x: 1800, y: 380, radius: 35, destructible: false, color: "#636e72", active: true, dx: -4.8, isRain: true, hasTail: true },
        { x: 5200, y: 180, radius: 30, destructible: true,  hp: 2, maxHp: 2, color: "#9b59b6", active: true, dx: -4.5, isRain: true, hasTail: true },
        { x: 9100, y: 360, radius: 42, destructible: false, color: "#2d3436", active: true, dx: -5.4, isRain: true, hasTail: true }
    ];

    // 7. Space Studs / Coins Breadcrumb Trail
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
