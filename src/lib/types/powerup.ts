/**
 * Power-Up System Type Definitions
 *
 * Single source of truth for power-up data structures.
 */

/**
 * Available power-up types
 */
export type PowerUpType =
  | "health_boost"
  | "attack_surge"
  | "shield";

/**
 * Rarity levels
 */
export type PowerUpRarity =
  | "common"
  | "uncommon"
  | "rare";

/**
 * Spawned power-up on arena
 */
export interface SpawnedPowerUp {
  /**
   * Unique ID
   */
  id: string;

  /**
   * Power-up type
   */
  type: PowerUpType;

  /**
   * Spawn turn
   */
  spawnedAtTurn: number;

  /**
   * Auto remove turn
   */
  expiresAtTurn: number;

  /**
   * Arena position
   */
  position: {
    x: number;
    y: number;
  };

  /**
   * Player who collected it
   */
  collectedBy?: string | null;
}

/**
 * Active effect on player
 */
export interface ActivePowerUp {
  id: string;

  type: PowerUpType;

  /**
   * Player affected
   */
  playerId: string;

  appliedAt: number;

  expiresAt: number;

  stackCount: number;

  metadata?: Record<string, any>;
}

/**
 * Registry definition
 */
export interface PowerUpDefinition {
  id: PowerUpType;

  name: string;

  description: string;

  rarity: PowerUpRarity;

  arcadeTheme: {
    icon: string;
    color: string;
    soundEffect: string;
  };

  effect: {
    /**
     * 0 = instant effect
     */
    durationTurns: number;

    cooldownTurns: number;

    stackable: boolean;

    maxStacks?: number;
  };
}

/**
 * Player state
 */
export interface PlayerState {
  id: string;

  username: string;

  hp: number;

  maxHp: number;

  contributions: number;

  attack: number;

  defense: number;

  [key: string]: any;
}

/**
 * Alias used by battleState
 */
export type Player = PlayerState;

/**
 * Whole battle state
 */
export interface BattleState {
  currentTurn: number;

  player1: PlayerState;

  player2: PlayerState;

  activePowerUps: ActivePowerUp[];

  spawnedPowerUps: SpawnedPowerUp[];

  lastPowerUpSpawnTurn: number;

  status?: "active" | "finished";
}

/**
 * Context for effect handlers
 */
export interface EffectContext {
  player: PlayerState;

  opponent: PlayerState;

  battleState: BattleState;

  activePowerUp: ActivePowerUp;
}

/**
 * Effect calculation result
 */
export interface EffectResult {
  multiplier?: number;

  hpRestore?: number;

  damageAbsorbed?: number;

  [key: string]: any;
}

/**
 * Applied effect log
 */
export interface EffectApplied {
  type: PowerUpType;

  blocked?: boolean;

  originalDamage?: number;

  [key: string]: any;
}

/**
 * Global configuration
 */
export const POWERUP_CONFIG = {
  /**
   * Spawn every 5 turns
   */
  spawnIntervalTurns: 5,

  /**
   * Max visible power-ups
   */
  maxConcurrentSpawned: 2,

  /**
   * Arena lifetime
   */
  spawnedPowerUpTtlTurns: 8,

  /**
   * Default active duration
   */
  defaultActiveDurationTurns: 2,

  /**
   * Cooldown
   */
  defaultCooldownTurns: 1,
} as const;