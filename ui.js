let selectedLeft = null;
let selectedRight = null;
let currentSlot = null;

function initGame() {
  console.log("initGame called");
  renderRoster(gameData.fighters);

  // Add click handlers to slots
  document.getElementById('left').onclick = () => { currentSlot = 'left'; updateSlots(); };
  document.getElementById('right').onclick = () => { currentSlot = 'right'; updateSlots(); };

  // Add battle button handler
  document.getElementById('battle').onclick = battle;
}

function renderRoster(fighters) {
  const roster = document.getElementById('roster');
  roster.innerHTML = '';
  fighters.forEach(fighter => {
    const div = document.createElement('div');
    div.className = 'fighter';
    const strengths = (fighter.strengths || []).filter(s => s && typeof s === 'string' && s.trim() !== '').join(', ') || 'None';
    const weaknesses = (fighter.weaknesses || []).filter(w => w && typeof w === 'string' && w.trim() !== '').join(', ') || 'None';
    div.innerHTML = `
      <img src="${fighter.image}" alt="${fighter.name}">
      <h3>${fighter.name}</h3>
      <p>Power: ${fighter.power || 50}</p>
      <p>Durability: ${fighter.durability || 50}</p>
      <p>Speed: ${fighter.speed || 50}</p>
      <p>Strengths: ${strengths}</p>
      <p>Weaknesses: ${weaknesses}</p>
    `;
    div.onclick = () => selectFighter(fighter);
    roster.appendChild(div);
  });
}

function renderStages(stages) {
  // Removed as not needed
}

function selectFighter(fighter) {
  if (currentSlot === 'left') {
    selectedLeft = fighter;
  } else if (currentSlot === 'right') {
    selectedRight = fighter;
  }
  updateSlots();
  currentSlot = null; // Reset
}

function selectStage(stage) {
  // Removed as not needed
}

function updateSlots() {
  const leftSlot = document.getElementById('left');
  const rightSlot = document.getElementById('right');

  leftSlot.innerHTML = selectedLeft ? `
    <img src="${selectedLeft.image}" alt="${selectedLeft.name}">
    <h3>${selectedLeft.name}</h3>
    <p>Power: ${selectedLeft.power || 50}</p>
    <p>Speed: ${selectedLeft.speed || 50}</p>
    <p>Strengths: ${(selectedLeft.strengths || []).filter(s => s && typeof s === 'string' && s.trim() !== '').join(', ') || 'None'}</p>
    <p>Weaknesses: ${(selectedLeft.weaknesses || []).filter(w => w && typeof w === 'string' && w.trim() !== '').join(', ') || 'None'}</p>
  ` : 'Select';
  rightSlot.innerHTML = selectedRight ? `
    <img src="${selectedRight.image}" alt="${selectedRight.name}">
    <h3>${selectedRight.name}</h3>
    <p>Power: ${selectedRight.power || 50}</p>
    <p>Speed: ${selectedRight.speed || 50}</p>
    <p>Strengths: ${(selectedRight.strengths || []).filter(s => s && typeof s === 'string' && s.trim() !== '').join(', ') || 'None'}</p>
    <p>Weaknesses: ${(selectedRight.weaknesses || []).filter(w => w && typeof w === 'string' && w.trim() !== '').join(', ') || 'None'}</p>
  ` : 'Select';

  // Highlight current slot
  leftSlot.classList.toggle('selected', currentSlot === 'left');
  rightSlot.classList.toggle('selected', currentSlot === 'right');
}
