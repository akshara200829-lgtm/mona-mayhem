import type { BattleState } from "../types/powerup";
import { POWERUP_REGISTRY } from "./registry";

export function applyImmediateEffect(
  state: BattleState,
  kind: string,
  playerIndex: 0 | 1
): void {
  if (kind === "health_boost") {
    state.players[playerIndex].hp = Math.min(
      100,
      state.players[playerIndex].hp + 20
    );
    state.log.push(
      `${state.players[playerIndex].username} gained 20 HP from HEALTH BOOST!`
    );
  }
}

export function applyActiveEffects(
  baseDamage: number,
  state: BattleState,
  attackerIndex: 0 | 1,
  defenderIndex: 0 | 1
): { finalDamage: number; absorbed: boolean } {
  let finalDamage = baseDamage;
  let absorbed = false;

  // Check attacker's attack_surge
  const surge = state.players[attackerIndex].activePowerUps.find(
    (p) => p.kind === "attack_surge"
  );
  if (surge) {
    finalDamage *= 2;
    state.log.push(
      `${state.players[attackerIndex].username}'s ATTACK SURGE doubled damage to ${finalDamage}!`
    );
    state.players[attackerIndex].activePowerUps = state.players[
      attackerIndex
    ].activePowerUps.filter((p) => p.uid !== surge.uid);
  }

  // Check defender's shield
  const shield = state.players[defenderIndex].activePowerUps.find(
    (p) => p.kind === "shield"
  );
  if (shield) {
    absorbed = true;
    shield.damageAbsorbed = true;
    state.log.push(
      `${state.players[defenderIndex].username}'s SHIELD absorbed ${finalDamage} damage!`
    );
    state.players[defenderIndex].activePowerUps = state.players[
      defenderIndex
    ].activePowerUps.filter((p) => p.uid !== shield.uid);
    finalDamage = 0;
  }

  return { finalDamage, absorbed };
}

export function expireTimedEffects(state: BattleState): void {
  const now = Date.now();
  for (const player of state.players) {
    const def = POWERUP_REGISTRY;
    player.activePowerUps = player.activePowerUps.filter((p) => {
      const expired = now - p.activatedAt >= p.duration;
      if (expired) {
        state.log.push(
          `${player.username}'s ${def[p.kind]?.label ?? p.kind} expired.`
        );
      }
      return !expired;
    });
  }
}