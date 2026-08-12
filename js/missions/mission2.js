function buildMission2() {
    let cursorX = 0;

    function addGround(width, heightY = 540) {
        GAME.platforms.push({ x: cursorX, y: heightY, width: width, height: 600 - heightY + 100, isGround: true });
        cursorX += width;
    }

    // ==========================================
    // MISSION 2 LAYOUT: 100-STUD FRENZY
    // ==========================================
    
    // Starting safe ground
    addGround(800, 540); 

    // TODO: We will build the coin frenzy here!

    GAME.worldWidth = cursorX;
}
