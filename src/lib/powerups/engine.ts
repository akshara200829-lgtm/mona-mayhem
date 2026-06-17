import type { BattleState, ArenaPowerUp, ActivePowerUp, PowerUpKind } from "../types/powerup";
import { POWERUP_CONFIG, POWERUP_REGISTRY } from "./registry";
import { applyImmediateEffect } from "./effects";

const ALL_KINDS: PowerUpKind[] = ["health_boost", "attack_surge", "shield"];

function randomKind(): PowerUpKind {
  return ALL_KINDS[Math.floor(Math.random() * ALL_KINDS.length)];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function updateSpawns(state: BattleState): ArenaPowerUp | null {
  const now = Date.now();

  // Prune expired arena power-ups
  state.arenaPowerUps = state.arenaPowerUps.filter(
    (p) => now - p.spawnedAt < POWERUP_CONFIG.arenaTtlMs
  );

  // Spawn new if conditions are met
  if (
    now - state.lastSpawnAt >= POWERUP_CONFIG.spawnIntervalMs &&
    state.arenaPowerUps.length < POWERUP_CONFIG.maxConcurrent
  ) {
    const newPowerUp: ArenaPowerUp = {
      uid: uid(),
      kind: randomKind(),
      spawnedAt: now,
    };
    state.arenaPowerUps.push(newPowerUp);
    state.lastSpawnAt = now;
    state.log.push(`A ${POWERUP_REGISTRY[newPowerUp.kind].label} appeared on the arena!`);
    return newPowerUp;
  }

  return null;
}

export function collectPowerUp(
  state: BattleState,
  powerUpUid: string,
  playerIndex: 0 | 1
): void {
  const idx = state.arenaPowerUps.findIndex((p) => p.uid === powerUpUid);
  if (idx === -1) return;

  const [picked] = state.arenaPowerUps.splice(idx, 1);
  const def = POWERUP_REGISTRY[picked.kind];

  if (def.duration === null) {
    // Immediate effect
    applyImmediateEffect(state, picked.kind, playerIndex);
  } else {
    // Duration-based effect
    const active: ActivePowerUp = {
      uid: picked.uid,
      kind: picked.kind,
      activatedAt: Date.now(),
      duration: def.duration,
    };
    state.players[playerIndex].activePowerUps.push(active);
    state.log.push(
      `${state.players[playerIndex].username} activated ${def.label}!`
    );
  }
}

export function updateTimers(state: BattleState): void {
  const now = Date.now();
  for (const player of state.players) {
    player.activePowerUps = player.activePowerUps.filter(
      (p) => now - p.activatedAt < p.duration
    );
  }
}