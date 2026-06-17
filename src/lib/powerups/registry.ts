/**
 * Power-Up Registry
 * * This file contains the catalog of all available power-up types.
 * It's a data-only layer — no game logic here, purely definitions.
 * * To add a new power-up type:
 * 1. Add entry to POWERUP_REGISTRY object below
 * 2. Add type to PowerUpType union in types/powerup.ts
 * 3. Create effect handler in effects.ts
 * 4. Done!
 */

import type { PowerUpDefinition, PowerUpType } from '../types/powerup';

/**
 * Complete registry of all available power-ups.
 * Catalog entries for health_boost, attack_surge, and shield.
 * Each entry is immutable after creation.
 */
export const POWERUP_REGISTRY: Record<PowerUpType, PowerUpDefinition> = {
  /**
   * HEALTH_BOOST
   * Immediate effect: Restores 20 HP to the collecting player.
   * Common pickup, low rarity, frequent spawns.
   */
  health_boost: {
    id: 'health_boost',
    name: 'Health Boost',
    description: 'Restore 20 HP',
    rarity: 'common',
    arcadeTheme: {
      icon: '❤️',
      color: '#ff4444',
      soundEffect: 'heal_boost',
    },
    effect: {
      durationTurns: 0, // Immediate effect, no duration
      cooldownTurns: 0,
      stackable: true, // Multiple can be collected
      maxStacks: undefined, // No limit on collecting multiple
    },
  },

  /**
   * ATTACK_SURGE
   * Duration-based effect: Next 2 turns, outgoing damage is doubled (2x multiplier).
   * Uncommon, medium power, strategic timing important.
   */
  attack_surge: {
    id: 'attack_surge',
    name: 'Attack Surge',
    description: 'Next attack does 2x damage',
    rarity: 'uncommon',
    arcadeTheme: {
      icon: '⚡',
      color: '#ffdd00',
      soundEffect: 'attack_surge_activate',
    },
    effect: {
      durationTurns: 2, // Active for 2 turns
      cooldownTurns: 1,
      stackable: false, // Only one surge at a time
      maxStacks: 1,
    },
  },

  /**
   * SHIELD
   * Duration-based effect: Absorbs the next incoming hit (damage reduced to 0).
   * After blocking one hit or duration expires, effect removed.
   * Uncommon, defensive play, reactive timing.
   */
  shield: {
    id: 'shield',
    name: 'Shield',
    description: 'Absorb the next incoming hit',
    rarity: 'uncommon',
    arcadeTheme: {
      icon: '🛡️',
      color: '#4444ff',
      soundEffect: 'shield_activate',
    },
    effect: {
      durationTurns: 2, // Shield lasts 2 turns before expiring
      cooldownTurns: 1,
      stackable: false, // Only one shield at a time
      maxStacks: 1,
    },
  },
};

/**
 * Get a power-up definition by its type.
 * @param type - The power-up type identifier
 * @returns The power-up definition, or undefined if not found
 */
export function getPowerUpDefinition(type: PowerUpType): PowerUpDefinition | undefined {
  return POWERUP_REGISTRY[type];
}

/**
 * Get all power-up types available in the registry.
 * Useful for random selection during spawning.
 * @returns Array of all power-up type keys
 */
export function getAllPowerUpTypes(): PowerUpType[] {
  return Object.keys(POWERUP_REGISTRY) as PowerUpType[];
}

/**
 * Get a random power-up type weighted by rarity.
 * Higher rarity = lower probability.
 * * Spawn weights (can be tuned for balance):
 * - common: 50%
 * - uncommon: 40%
 * - rare: 10%
 * * @returns Randomly selected power-up type
 */
export function getRandomPowerUpType(): PowerUpType {
  const rand = Math.random() * 100;

  // Count rarity distribution in registry
  const types = getAllPowerUpTypes();
  const common = types.filter(t => POWERUP_REGISTRY[t].rarity === 'common');
  const uncommon = types.filter(t => POWERUP_REGISTRY[t].rarity === 'uncommon');
  const rare = types.filter(t => POWERUP_REGISTRY[t].rarity === 'rare');

  // Weighted random selection
  if (rand < 50 && common.length > 0) {
    return common[Math.floor(Math.random() * common.length)];
  } else if (rand < 90 && uncommon.length > 0) {
    return uncommon[Math.floor(Math.random() * uncommon.length)];
  } else if (rare.length > 0) {
    return rare[Math.floor(Math.random() * rare.length)];
  }

  // Fallback if no rarities match (shouldn't happen)
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Get spawn probability for a given rarity.
 * Used for balancing spawn rates across different difficulty tiers.
 * @param rarity - The rarity level
 * @returns Probability weight (0-100)
 */
export function getRarityWeight(rarity: 'common' | 'uncommon' | 'rare'): number {
  switch (rarity) {
    case 'common':
      return 50;
    case 'uncommon':
      return 40;
    case 'rare':
      return 10;
    default:
      return 0;
  }
}

/**
 * Verify that a power-up type is valid (exists in registry).
 * Useful for validation before processing.
 * @param type - The power-up type to verify
 * @returns True if the type exists in the registry
 */
export function isValidPowerUpType(type: any): type is PowerUpType {
  return type in POWERUP_REGISTRY;
}