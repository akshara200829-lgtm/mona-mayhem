/**
 * Power-Up Engine
 * * This file contains the core orchestration logic for the power-up system:
 * - Spawning new power-ups at intervals
 * - Collecting power-ups from the arena
 * - Expiring active effects when duration ends
 * - Managing the lifecycle of spawned and active power-ups
 * * Pure functions: no side effects, all state changes return new state objects.
 */

import type {
  BattleState,
  SpawnedPowerUp,
  ActivePowerUp,
} from '../types/powerup';
import { POWERUP_CONFIG } from '../types/powerup';
import { getRandomPowerUpType, getPowerUpDefinition } from './registry';
import * as effects from './effects';

/**
 * Update spawns: prune expired/collected power-ups, spawn new ones if due.
 * Called at the START of each turn before any battle actions.
 * * Process:
 * 1. Remove collected and expired spawned power-ups from arena
 * 2. Check if it's time to spawn a new power-up (spawn interval)
 * 3. Check if there's room for a new spawn (max concurrent limit)
 * 4. If both conditions met, create and add new spawned power-up
 * * @param battleState - Current battle state
 * @returns Updated battle state with new spawns/pruned arena
 */
export function updateSpawns(battleState: BattleState): BattleState {
  // [1] Prune: Remove collected or expired spawned power-ups
  const activePUs = battleState.spawnedPowerUps.filter((pu) => {
    const isCollected = pu.collectedBy !== null && pu.collectedBy !== undefined;
    const isExpired = battleState.currentTurn >= pu.expiresAtTurn;
    return !isCollected && !isExpired;
  });

  // [2] Check if we should spawn a new power-up
  const isSpawnTurn =
    battleState.currentTurn % POWERUP_CONFIG.spawnIntervalTurns === 0;

  const canSpawn = activePUs.length < POWERUP_CONFIG.maxConcurrentSpawned;

  let newSpawnedPUs = activePUs;

  if (isSpawnTurn && canSpawn) {
    const newPU = createSpawnedPowerUp(battleState.currentTurn);
    newSpawnedPUs = [...activePUs, newPU];
  }

  return {
    ...battleState,
    spawnedPowerUps: newSpawnedPUs,
    lastPowerUpSpawnTurn: isSpawnTurn ? battleState.currentTurn : battleState.lastPowerUpSpawnTurn
  };
}

/**
 * Collect a power-up: remove from arena, apply effect or add to active.
 * Called when a player clicks on a spawned power-up.
 * * Process:
 * 1. Find the spawned power-up by ID
 * 2. Remove from spawned list
 * 3. If immediate effect (health_boost): apply directly to player state
 * 4. If duration-based (shield, surge): add to active power-ups list
 * * @param battleState - Current battle state
 * @param powerUpId - ID of the spawned power-up to collect
 * @param playerId - ID of the player collecting it
 * @returns Updated battle state with power-up collected/applied
 */
export function collectPowerUp(
  battleState: BattleState,
  powerUpId: string,
  playerId: string
): BattleState {
  // [1] Find the spawned power-up
  const spawnedPU = battleState.spawnedPowerUps.find((pu) => pu.id === powerUpId);

  if (!spawnedPU) {
    console.warn(`Power-up ${powerUpId} not found in spawned list`);
    return battleState; // No change if not found
  }

  // [2] Remove from spawned list
  const updatedSpawned = battleState.spawnedPowerUps.filter(
    (pu) => pu.id !== powerUpId
  );

  // [3] Determine if immediate or duration-based
  const isImmediate = spawnedPU.type === 'health_boost';

  if (isImmediate) {
    // Immediate effect: apply now, don't add to active list
    let updatedState = {
      ...battleState,
      spawnedPowerUps: updatedSpawned,
    };

    // Apply health boost directly
    updatedState = effects.applyHealthBoost(updatedState, playerId);

    return updatedState;
  } else {
    // Duration-based: add to active effects
    return applyDurationPowerUp(
      { ...battleState, spawnedPowerUps: updatedSpawned },
      spawnedPU,
      playerId
    );
  }
}

/**
 * Apply a duration-based power-up (shield, attack_surge).
 * Creates an ActivePowerUp entry and adds it to the active effects list.
 */
function applyDurationPowerUp(
  battleState: BattleState,
  spawnedPU: SpawnedPowerUp,
  playerId: string
): BattleState {
  const definition = getPowerUpDefinition(spawnedPU.type);

  if (!definition) {
    console.warn(`No definition found for power-up type: ${spawnedPU.type}`);
    return battleState;
  }

  const activePU: ActivePowerUp = {
    id: `active-${spawnedPU.id}`,
    type: spawnedPU.type,
    playerId,
    appliedAt: battleState.currentTurn,
    expiresAt: battleState.currentTurn + definition.effect.durationTurns,
    stackCount: 1,
    metadata: {},
  };

  const appliedPU = effects.getApplyHandler(spawnedPU.type)(activePU);
  const updatedActivePUs = [...battleState.activePowerUps, appliedPU];

  return {
    ...battleState,
    activePowerUps: updatedActivePUs,
  };
}

/**
 * Update timers and expire active power-ups.
 * Called at the END of each turn after all battle actions.
 */
export function updateTimers(battleState: BattleState): BattleState {
  const stillActivePUs = battleState.activePowerUps.filter((activePU) => {
    const isExpired = battleState.currentTurn >= activePU.expiresAt;

    if (isExpired) {
      const expireHandler = effects.getExpireHandler(activePU.type);
      const player = battleState.player1.id === activePU.playerId ? battleState.player1 : battleState.player2;
      const opponent = battleState.player1.id === activePU.playerId ? battleState.player2 : battleState.player1;
      expireHandler({
        player,
        opponent,
        battleState,
        activePowerUp: activePU,
      });
    }

    return !isExpired;
  });

  return {
    ...battleState,
    activePowerUps: stillActivePUs,
  };
}

/**
 * Create a new spawned power-up instance.
 */
function createSpawnedPowerUp(spawnedAtTurn: number): SpawnedPowerUp {
  return {
    id: `pu-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: getRandomPowerUpType(),
    spawnedAtTurn,
    expiresAtTurn: spawnedAtTurn + POWERUP_CONFIG.spawnedPowerUpTtlTurns,
    position: randomPosition(),
    collectedBy: null,
  };
}

/**
 * Generate a random position on the arena screen.
 */
function randomPosition(): { x: number; y: number } {
  const minX = 100;
  const maxX = 700;
  const minY = 100;
  const maxY = 500;

  return {
    x: minX + Math.random() * (maxX - minX),
    y: minY + Math.random() * (maxY - minY),
  };
}

/**
 * Get all active power-ups for a specific player.
 */
export function getPlayerActivePowerUps(
  battleState: BattleState,
  playerId: string
): ActivePowerUp[] {
  return battleState.activePowerUps.filter((pu) => pu.playerId === playerId);
}

/**
 * Get all spawned power-ups on the arena.
 */
export function getSpawnedPowerUps(battleState: BattleState): SpawnedPowerUp[] {
  return battleState.spawnedPowerUps;
}

/**
 * Check if a power-up is valid and can be collected.
 */
export function isValidPowerUpToCollect(
  battleState: BattleState,
  powerUpId: string
): boolean {
  const pu = battleState.spawnedPowerUps.find((p) => p.id === powerUpId);
  return pu !== undefined && (pu.collectedBy === null || pu.collectedBy === undefined);
}

/**
 * Clear all active power-ups (used for battle reset/end).
 */
export function clearAllPowerUps(battleState: BattleState): BattleState {
  return {
    ...battleState,
    activePowerUps: [],
    spawnedPowerUps: [],
  };
}