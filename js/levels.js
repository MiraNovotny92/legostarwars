/**
 * js/levels.js
 * Game level definitions and LevelManager controller module.
 */

export const LEVELS = [
  {
    id: 1,
    name: "Level 1: The Beginning",
    tileSize: 32,
    // Grid Legend: 0 = Empty, 1 = Wall/Platform, 2 = Player Start, 3 = Goal, 4 = Coin
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 4, 0, 0, 0, 3, 1],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    spawnPoints: {
      player: { x: 1, y: 1 },
      goal: { x: 10, y: 1 }
    },
    entities: [
      { type: "enemy", x: 5, y: 3, speed: 2, patrolRange: [3, 7] }
    ],
    timeLimit: 60
  },
  {
    id: 2,
    name: "Level 2: The Maze",
    tileSize: 32,
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 1, 0, 0, 0, 1, 0, 4, 3, 1],
      [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 4, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    spawnPoints: {
      player: { x: 1, y: 1 },
      goal: { x: 10, y: 1 }
    },
    entities: [
      { type: "enemy", x: 4, y: 1, speed: 3, patrolRange: [2, 6] },
      { type: "enemy", x: 8, y: 3, speed: 2, patrolRange: [6, 10] }
    ],
    timeLimit: 45
  }
];

export class LevelManager {
  constructor(levels = LEVELS) {
    this.levels = levels;
    this.currentIndex = 0;
  }

  /**
   * Get current level configuration.
   */
  getCurrentLevel() {
    return this.levels[this.currentIndex] || null;
  }

  /**
   * Advance to the next level.
   * Returns the next level object, or null if all levels are complete.
   */
  nextLevel() {
    if (this.hasNextLevel()) {
      this.currentIndex++;
      return this.getCurrentLevel();
    }
    return null;
  }

  /**
   * Reset to first level or reload current level.
   */
  resetLevel() {
    return this.getCurrentLevel();
  }

  loadLevel(index) {
    if (index >= 0 && index < this.levels.length) {
      this.currentIndex = index;
      return this.getCurrentLevel();
    }
    return null;
  }

  hasNextLevel() {
    return this.currentIndex < this.levels.length - 1;
  }

  getTotalLevels() {
    return this.levels.length;
  }
}
