// Helper function to calculate number of attacks based on speed
function calculateAttacks(speed) {
  return 1 + Math.floor(speed / 40); // 1-3 attacks based on speed
}

/**
 * Calculates the total damage for an ability including bonuses.
 * @param {number} baseDamage - Base damage of the ability.
 * @param {number} power - Attacker's power stat.
 * @param {Array} strengths - Attacker's strengths.
 * @param {Array} weaknesses - Defender's weaknesses.
 * @param {string} mode - 'fast' or 'hard' mode.
 * @returns {number} Total damage.
 */
function calculateAbilityDamage(baseDamage, power, strengths, weaknesses, mode) {
  let damage = baseDamage + Math.floor(power / 10);
  if (mode === 'fast') {
    damage -= 10;
  } else if (mode === 'hard') {
    damage += 10;
  }
  damage += calculateWeaknessBonus(strengths, weaknesses);
  return damage;
}

/**
 * Calculates bonus damage from strengths exploiting weaknesses.
 * @param {Array} strengths - Attacker's strengths.
 * @param {Array} weaknesses - Defender's weaknesses.
 * @returns {number} Bonus damage.
 */
function calculateWeaknessBonus(strengths, weaknesses) {
  let bonus = 0;
  strengths.forEach(strength => {
    if (weaknesses.includes(strength)) {
      bonus += 15;
    }
  });
  return bonus;
}

/**
 * Applies active mode boosts to the base stats.
 * @param {Object} baseStats - Base stats (power, speed, durability).
 * @param {Array} abilityStates - Array of ability states.
 * @returns {Object} Boosted stats.
 */
function applyModeBoosts(baseStats, abilityStates) {
  let boostedStats = { ...baseStats };
  abilityStates.forEach(state => {
    if (state.activeMode && state.modeDuration > 0) {
      Object.keys(state.activeMode).forEach(stat => {
        boostedStats[stat] = (boostedStats[stat] || 0) + (state.activeMode[stat] || 0);
      });
    }
  });
  return boostedStats;
}

/**
 * Selects an available ability to use, prioritizing attack abilities.
 * @param {Array} abilityStates - Array of ability states.
 * @returns {Object|null} Selected ability state or null if none available.
 */
function selectAbility(abilityStates) {
  // First, try to find an attack ability that's ready
  let attackAbility = abilityStates.find(state => state.ability.type === 'attack' && state.cooldown === 0 && state.startup === 0);
  if (attackAbility) return attackAbility;

  // If no attack ability, try mode switch
  let modeSwitchAbility = abilityStates.find(state => state.ability.type === 'mode_switch' && state.cooldown === 0 && state.startup === 0);
  if (modeSwitchAbility) return modeSwitchAbility;

  // If none ready, return the one with the least cooldown (or charging)
  let available = abilityStates.filter(state => state.cooldown === 0);
  if (available.length > 0) {
    return available[0]; // Return the first available (could be charging)
  }

  return null; // All on cooldown
}
