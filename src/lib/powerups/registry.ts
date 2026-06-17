import type { PowerUpDefinition } from "../types/powerup";

export const POWERUP_CONFIG = {
  spawnIntervalMs: 8000,
  maxConcurrent: 3,
  arenaTtlMs: 15000,
};

export const POWERUP_REGISTRY: Record<string, PowerUpDefinition> = {
  health_boost: {
    id: "health_boost",
    label: "HEALTH BOOST",
    icon: "❤️",
    description: "Restore 20 HP immediately",
    duration: null,
  },
  attack_surge: {
    id: "attack_surge",
    label: "ATTACK SURGE",
    icon: "⚡",
    description: "Next attack does 2× damage",
    duration: 30000,
  },
  shield: {
    id: "shield",
    label: "SHIELD",
    icon: "🛡️",
    description: "Absorb next incoming hit",
    duration: 60000,
  },
};