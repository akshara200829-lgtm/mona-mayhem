/**
 * Battle State Factory
 *
 * Creates the initial battle state used by the power-up engine.
 * Keeps player data and power-up tracking in one place.
 */

import type { BattleState, Player } from "../types/powerup";

/**
 * Create a new player object.
 */
export function createPlayer(id: string, username: string): Player {
  return {
    id,
    username,
    hp: 10,
    maxHp: 100,
    contributions: 0,
    attack: 10,
    defense: 5,
  };
}

/**
 * Initialize a fresh battle.
 *
 * Starts with:
 * - two players
 * - empty spawned power-ups
 * - empty active effects
 * - turn counter at 0
 */
export function initializeBattleState(
  player1Name: string,
  player2Name: string
): BattleState {
  const player1 = createPlayer("player-1", player1Name);
  const player2 = createPlayer("player-2", player2Name);

  return {
    player1,
    player2,
    currentTurn: 0,
    spawnedPowerUps: [],
    activePowerUps: [],
    lastPowerUpSpawnTurn: 0,
    status: "active",
  };
}

/**
 * Advance the battle turn.
 */
export function nextTurn(battleState: BattleState): BattleState {
  return {
    ...battleState,
    currentTurn: battleState.currentTurn + 1,
  };
}

/**
 * Reset battle power-ups.
 * Useful after battle ends.
 */
export function resetBattlePowerUps(battleState: BattleState): BattleState {
  return {
    ...battleState,
    spawnedPowerUps: [],
    activePowerUps: [],
  };
}

/**
 * Get player by ID.
 */
export function getPlayer(
  battleState: BattleState,
  playerId: string
): Player | null {
  if (battleState.player1.id === playerId) {
    return battleState.player1;
  }

  if (battleState.player2.id === playerId) {
    return battleState.player2;
  }

  return null;
}

/**
 * Update player HP safely.
 */
export function updatePlayerHP(
  battleState: BattleState,
  playerId: string,
  amount: number
): BattleState {
  const update = (player: Player): Player => {
    if (player.id !== playerId) {
      return player;
    }

    const newHP = Math.min(
      player.maxHp,
      Math.max(0, player.hp + amount)
    );

    return {
      ...player,
      hp: newHP,
    };
  };

  return {
    ...battleState,
    player1: update(battleState.player1),
    player2: update(battleState.player2),
  };
}

/**
 * Check if battle is over.
 */
export function isBattleOver(battleState: BattleState): boolean {
  return (
    battleState.player1.hp <= 0 ||
    battleState.player2.hp <= 0
  );
}