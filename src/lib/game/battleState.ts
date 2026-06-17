import type { BattleState } from "../types/powerup";

export function initializeBattleState(
  username1: string,
  username2: string
): BattleState {
  return {
    players: [
      { username: username1, hp: 100, activePowerUps: [] },
      { username: username2, hp: 100, activePowerUps: [] },
    ],
    arenaPowerUps: [],
    currentTurn: 0,
    lastSpawnAt: Date.now(),
    log: [],
  };
}

export function calculateBaseDamage(): number {
  return Math.floor(Math.random() * 15) + 5; // 5–20
}

export function applyDamage(
  state: BattleState,
  damage: number,
  defenderIndex: 0 | 1
): void {
  state.players[defenderIndex].hp = Math.max(
    0,
    state.players[defenderIndex].hp - damage
  );
}

export function isBattleOver(state: BattleState): false | 0 | 1 {
  if (state.players[0].hp <= 0) return 0;
  if (state.players[1].hp <= 0) return 1;
  return false;
}