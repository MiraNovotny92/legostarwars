# Lego Star Wars Explorer

A scalable, procedurally generated web platformer built for a 5-year-old.
Runs completely offline in any web browser.

## Managing Assets
All images must be placed in the `assets/` folder.
*   **Player Left:** `jedi_left.png`
*   **Player Right:** `jedi_right.png`
*   **Quest Giver:** `obi.png`
*   **Collectible:** `saber.png`

## How the Procedural Generator Works
The game uses a function called `buildRandomLevel(difficultyMultiplier)`. 
When you click a difficulty button on the main screen, it tells the game how many random obstacle "chunks" to spawn. 
*   **Easy:** 5 chunks
*   **Medium:** 10 chunks
*   **Hard:** 15 chunks

### Changing Obstacle Rarity
Inside `game.js`, look for the `Math.random()` checks inside the `buildRandomLevel` loop.
*   `if (randomChoice < 0.33)` -> Spawns moving platforms and pits.
*   `else if (randomChoice < 0.66)` -> Spawns high walls and jump pads.
*   `else` -> Spawns the giant purple Force blocks.
You can adjust these decimals to make certain obstacles appear more or less often.

### Scenery and Crates
Trees and metal crates spawn automatically on safe ground. The `addGround(width)` function calculates how much space is available and randomly drops trees (background) and solid crates (jump obstacles) along the path. 

## Customizing Physics
At the top of `game.js`, you can adjust the engine variables:
*   `gravity`: Lower this number (e.g., `0.3`) to make the Jedi float longer in the air.
*   `player.jumpPower`: Increase this (make it a more negative number, like `-15`) to jump higher.
*   `player.speed`: Change the left/right running speed.
