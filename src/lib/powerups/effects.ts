import type { ActivePowerUp, BattleState, EffectContext, EffectResult } from '../types/powerup';

/**
 * Resolve a SHIELD effect during battle.
 * Absorbs the next incoming hit completely.
 * * @param ctx - Effect context
 * @returns Result with damage absorbed flag
 */
export function resolveShield(ctx: EffectContext): EffectResult {
  // Shield is active and can block
  return { damageAbsorbed: 1 }; // Return 1 to indicate shield is blocking
}

/**
 * Resolve an ATTACK_SURGE effect during battle.
 * Doubles outgoing damage (2x multiplier).
 * * @param ctx - Effect context
 * @returns Result with damage multiplier
 */
export function resolveAttackSurge(ctx: EffectContext): EffectResult {
  // Attack surge doubles the next damage
  return { multiplier: 2.0 };
}

/**
 * Apply HEALTH_BOOST effect immediately when collected.
 * Restores 20 HP to the player, capped at maxHp.
 * This is an immediate effect (not duration-based).
 * * @param battleState - Current battle state
 * @param playerId - ID of player collecting the boost
 * @returns Updated battle state with player HP restored
 */
export function applyHealthBoost(
  battleState: BattleState,
  playerId: string
): BattleState {
  const player = playerId === battleState.player1.id ? battleState.player1 : battleState.player2;

  const restored = 20; // Fixed amount
  const newHp = Math.min(player.hp + restored, player.maxHp);

  // Create updated player
  const updatedPlayer = { ...player, hp: newHp };

  // Return updated state
  return {
    ...battleState,
    [playerId === battleState.player1.id ? 'player1' : 'player2']: updatedPlayer,
  };
}

/**
 * Apply ATTACK_SURGE effect when collected.
 * Creates an active power-up entry that will double damage for 2 turns.
 * * @param activePU - The active power-up to configure
 * @returns The configured active power-up
 */
export function applyAttackSurge(activePU: ActivePowerUp): ActivePowerUp {
  return {
    ...activePU,
    metadata: {
      ...activePU.metadata,
      surgeActive: true,
    },
  };
}

/**
 * Apply SHIELD effect when collected.
 * Creates an active power-up entry that will block the next hit for 2 turns.
 * * @param activePU - The active power-up to configure
 * @returns The configured active power-up
 */
export function applyShield(activePU: ActivePowerUp): ActivePowerUp {
  return {
    ...activePU,
    metadata: {
      ...activePU.metadata,
      damageAbsorbed: false, // Not used yet
    },
  };
}

/**
 * Expire ATTACK_SURGE effect.
 * Called when the surge duration ends.
 * * @param ctx - Effect context
 */
export function expireAttackSurge(ctx: EffectContext): void {
  // Extensible for animations, sound hooks, etc.
}

/**
 * Expire SHIELD effect.
 * Called when the shield duration ends.
 * * @param ctx - Effect context
 */
export function expireShield(ctx: EffectContext): void {
  // Extensible for animations, sound hooks, etc.
}

/**
 * Expire HEALTH_BOOST effect (no-op, instant effect).
 * * @param ctx - Effect context
 */
export function expireHealthBoost(ctx: EffectContext): void {
  // No-op: health boost is instant and doesn't have duration
}

/**
 * Get the appropriate expire handler for a power-up type.
 * Used during effect expiration phase.
 * * @param powerUpType - The type of power-up
 * @returns The expire handler function, or no-op if not found
 */
export function getExpireHandler(powerUpType: string): (ctx: EffectContext) => void {
  switch (powerUpType) {
    case 'attack_surge':
      return expireAttackSurge;
    case 'shield':
      return expireShield;
    case 'health_boost':
      return expireHealthBoost;
    default:
      return () => {}; // No-op
  }
}

/**
 * Get the appropriate apply handler for a power-up type.
 * Called when a power-up is first collected.
 * * @param powerUpType - The type of power-up
 * @returns The apply handler function
 */
export function getApplyHandler(powerUpType: string): (activePU: ActivePowerUp) => ActivePowerUp {
  switch (powerUpType) {
    case 'attack_surge':
      return applyAttackSurge;
    case 'shield':
      return applyShield;
    case 'health_boost':
    default:
      return (pu) => pu; // No setup needed for immediate effect
  }
}