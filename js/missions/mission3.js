function buildMission3() {
    let cursorX = 0;

    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        cursorX += width;
    }

    // ==========================================
    // MISSION 3 LAYOUT: RESCUE GROGU
    // ==========================================
    
    // Starting safe ground
    addGround(800, 540); 

    // TODO: We will build Grogu's rescue level here!

    GAME.worldWidth = cursorX;
}
