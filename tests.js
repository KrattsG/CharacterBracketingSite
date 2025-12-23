// Test function to simulate battles between all pairs of fighters
function runTests() {
  console.log("Running battle tests...");
  const fighters = gameData.fighters;
  const results = [];

  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const leftFighter = fighters[i];
      const rightFighter = fighters[j];
      console.log(`Testing battle: ${leftFighter.name} vs ${rightFighter.name}`);

      // Simulate battle
      let leftHealth = leftFighter.durability || 50;
      let rightHealth = rightFighter.durability || 50;
      const leftStats = { power: leftFighter.power || 50, speed: leftFighter.speed || 50, durability: leftFighter.durability || 50 };
      const rightStats = { power: rightFighter.power || 50, speed: rightFighter.speed || 50, durability: rightFighter.durability || 50 };

      let leftAbilityStates = (leftFighter.abilities || [leftFighter.ability]).map(ability => ({ cooldown: 0, startup: 0, ability, activeMode: null, modeDuration: 0 }));
      let rightAbilityStates = (rightFighter.abilities || [rightFighter.ability]).map(ability => ({ cooldown: 0, startup: 0, ability, activeMode: null, modeDuration: 0 }));

      const leftStrengths = (leftFighter.strengths || []).filter(s => typeof s === 'string' && s.trim() !== '');
      const leftWeaknesses = (leftFighter.weaknesses || []).filter(w => typeof w === 'string' && w.trim() !== '');
      const rightStrengths = (rightFighter.strengths || []).filter(s => typeof s === 'string' && s.trim() !== '');
      const rightWeaknesses = (rightFighter.weaknesses || []).filter(w => typeof w === 'string' && w.trim() !== '');

      let battleLog = [];
      let turn = 0;
      const maxTurns = 30;

      const leftAttacks = calculateAttacks(leftStats.speed);
      const rightAttacks = calculateAttacks(rightStats.speed);

      while (leftHealth > 0 && rightHealth > 0 && turn < maxTurns) {
        turn++;
        battleLog.push(`Turn ${turn}`);

        const { firstAttacker, secondAttacker, firstAttacks, secondAttacks } = determineAttackOrder(leftFighter, rightFighter, leftStats, rightStats, leftAbilityStates, rightAbilityStates, leftStrengths, rightStrengths, leftAttacks, rightAttacks);

        // First attacker performs their turn
        if (leftHealth > 0 && rightHealth > 0) {
          if (firstAttacker.fighter === leftFighter) {
            leftHealth = performFighterTurn(firstAttacker.fighter, secondAttacker.fighter, firstAttacker.stats, secondAttacker.stats, firstAttacker.abilityStates, secondAttacker.abilityStates, firstAttacker.strengths, rightWeaknesses, battleLog, turn, 'first', leftHealth, rightHealth, firstAttacks);
          } else {
            rightHealth = performFighterTurn(firstAttacker.fighter, secondAttacker.fighter, firstAttacker.stats, secondAttacker.stats, firstAttacker.abilityStates, secondAttacker.abilityStates, firstAttacker.strengths, rightWeaknesses, battleLog, turn, 'first', leftHealth, rightHealth, firstAttacks);
          }
        }

        // Second attacker performs their turn
        if (leftHealth > 0 && rightHealth > 0) {
          if (secondAttacker.fighter === leftFighter) {
            leftHealth = performFighterTurn(secondAttacker.fighter, firstAttacker.fighter, secondAttacker.stats, firstAttacker.stats, secondAttacker.abilityStates, firstAttacker.abilityStates, secondAttacker.strengths, leftWeaknesses, battleLog, turn, 'second', rightHealth, leftHealth, secondAttacks);
          } else {
            rightHealth = performFighterTurn(secondAttacker.fighter, firstAttacker.fighter, secondAttacker.stats, firstAttacker.stats, secondAttacker.abilityStates, firstAttacker.abilityStates, secondAttacker.strengths, leftWeaknesses, battleLog, turn, 'second', rightHealth, leftHealth, secondAttacks);
          }
        }

        leftAbilityStates.forEach(state => {
          if (state.cooldown > 0) state.cooldown--;
          if (state.modeDuration > 0) state.modeDuration--;
        });
        rightAbilityStates.forEach(state => {
          if (state.cooldown > 0) state.cooldown--;
          if (state.modeDuration > 0) state.modeDuration--;
        });
      }

      const winner = determineWinner(leftHealth, rightHealth, leftFighter, rightFighter);
      const result = {
        left: leftFighter.name,
        right: rightFighter.name,
        winner: winner === "Draw" ? "Draw" : winner === "Timeout" ? "Timeout" : winner.name,
        finalHealth: { left: Math.max(0, leftHealth), right: Math.max(0, rightHealth) },
        turns: turn
      };
      results.push(result);
      console.log(result);
    }
  }

  console.log("All test results:", results);
}

// Run tests after fighters are loaded
function initGame() {
  console.log("initGame called");
  renderRoster(gameData.fighters);

  document.getElementById('left').onclick = () => { currentSlot = 'left'; updateSlots(); };
  document.getElementById('right').onclick = () => { currentSlot = 'right'; updateSlots(); };
  document.getElementById('battle').onclick = battle;

  // Run tests
  runTests();
}
