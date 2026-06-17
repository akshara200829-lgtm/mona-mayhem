export type PowerUpKind = "health_boost" | "attack_surge" | "shield";

export interface PowerUpDefinition {
  id: PowerUpKind;
  label: string;
  icon: string;
  description: string;
  duration: number | null; // null = immediate
}

export interface ArenaPowerUp {
  uid: string;
  kind: PowerUpKind;
  spawnedAt: number;
}

export interface ActivePowerUp {
  uid: string;
  kind: PowerUpKind;
  activatedAt: number;
  duration: number; // ms
  damageAbsorbed?: boolean;
}

export interface PlayerState {
  username: string;
  hp: number;
  activePowerUps: ActivePowerUp[];
}

export interface BattleState {
  players: [PlayerState, PlayerState];
  arenaPowerUps: ArenaPowerUp[];
  currentTurn: number;
  lastSpawnAt: number;
  log: string[];
}