export interface MatchRecord {
  id: string;
  timestamp: string;
  winner: string;
  loser: string;
  player1: string;
  player2: string;
  turns: number;
}

const STORAGE_KEY = 'mona_mayhem_match_history';

/**
 * Fetch logs safely from LocalStorage
 */
export function getMatchHistory(): MatchRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Save a clean record of the completed duel
 */
export function saveMatchResult(winner: string, loser: string, p1: string, p2: string, turns: number): MatchRecord[] {
  if (typeof window === 'undefined') return [];

  const newRecord: MatchRecord = {
    id: `match-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    winner,
    loser,
    player1: p1,
    player2: p2,
    turns
  };

  const current = getMatchHistory();
  const updated = [newRecord, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Wipe local storage history logs
 */
export function clearMatchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}