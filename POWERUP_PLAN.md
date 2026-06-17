Set-Content -Path "POWERUP_PLAN.md" -Encoding utf8 -Value @"
# Power-Up System Architecture Plan

Generated via GitHub Copilot Plan Mode - GSSoC / MLH Global Hack Week

## Overview
A modular Power-Up system for the Mona Mayhem battle arena (Astro + TypeScript).

## Current Project State
- src/pages/index.astro - basic placeholder page
- src/pages/api/contributions/[username].ts - stub API endpoint
- No src/lib/ directory yet, no components yet

## Files to CREATE (7 new files)
- src/lib/types/powerup.ts - All TypeScript type definitions (ROOT, no dependencies)
- src/lib/powerups/registry.ts - Power-up catalog, data only
- src/lib/powerups/effects.ts - Effect application logic
- src/lib/powerups/engine.ts - Spawn/collect/expire orchestration
- src/lib/game/battleState.ts - Battle state factory
- src/components/PowerUpPickup.astro - Clickable power-up icon on arena
- src/components/ActiveEffects.astro - Active effects display per player

## Files to MODIFY
- src/pages/index.astro - Import components, integrate engine calls, wire event handlers
- src/styles.css - Add glow/pulse CSS animations

## Power-Up Types
- health_boost - Restore 20 HP (immediate effect)
- attack_surge - Next attack does 2x damage (duration-based)
- shield - Absorb next incoming hit (duration-based)

## Lifecycle
spawn -> display on arena -> player collects -> apply effect -> expire after duration/use

## Dependency Graph
src/lib/types/powerup.ts (ROOT - used by everything)
  src/lib/powerups/registry.ts (depends on types)
    src/lib/powerups/effects.ts (depends on types + registry)
    src/lib/powerups/engine.ts (depends on types + registry)
  src/lib/game/battleState.ts (depends on types)
  src/components/PowerUpPickup.astro (depends on types + registry)
  src/components/ActiveEffects.astro (depends on types)
src/pages/index.astro - ORCHESTRATOR (depends on all above)

## Key Functions
- initializeBattleState(player1, player2) - sets up state with empty power-up arrays
- updateSpawns(battleState) - prune expired, spawn new if interval met
- collectPowerUp(battleState, powerUpId, playerId) - remove from arena, apply or activate
- updateTimers(battleState) - expire duration-based power-ups
- applyActiveEffects(baseDamage, battleState, defenderId, attackerId) - apply modifiers

## Battle Turn Order
1. powerUpEngine.updateSpawns(battleState)
2. calculateDamage(attacker)
3. effects.applyActiveEffects() - modify damage based on active power-ups
4. applyDamage(battleState, damage)
5. powerUpEngine.updateTimers(battleState)
6. battleState.currentTurn++

## Edge Cases Handled
- Power-up spawns while previous uncollected: max concurrent cap in POWERUP_CONFIG
- Shield + incoming hit: resolveShield() marks damageAbsorbed = true, then expires
- health_boost is immediate (no ActivePowerUp entry created)
- attack_surge and shield create ActivePowerUp entries with duration
"@