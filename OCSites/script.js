const DATA_PATH = "data/";

const fighterFiles = ["klaus.yaml"]; // Add more fighter YAML files here

const gameData = {
  fighters: []
};

// Load all fighter YAML files
Promise.all(
  fighterFiles.map(file =>
    fetch(DATA_PATH + file)
      .then(res => res.text())
      .then(text => {
        gameData.fighters.push(jsyaml.load(text));
      })
  )
).then(() => {
  console.log("Fighters loaded:", gameData.fighters);
  initGame();
});

let selectedLeft = null;
let selectedRight = null;
let currentSlot = null;

function initGame() {
  // Example usage
  renderRoster(gameData.fighters);
  
  // Add click handlers to slots
  document.getElementById('left').onclick = () => { currentSlot = 'left'; updateSlots(); };
  document.getElementById('right').onclick = () => { currentSlot = 'right'; updateSlots(); };
}

function renderRoster(fighters) {
  const roster = document.getElementById('roster');
  roster.innerHTML = '';
  fighters.forEach(fighter => {
    const div = document.createElement('div');
    div.className = 'fighter';
    div.innerHTML = `
      <img src="${fighter.image}" alt="${fighter.name}">
      <h3>${fighter.name}</h3>
      <p>Power: ${fighter.power}</p>
      <p>Speed: ${fighter.speed}</p>
      <p>Strengths: ${fighter.strengths.join(', ')}</p>
      <p>Weaknesses: ${fighter.weaknesses.join(', ')}</p>
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
    <p>Power: ${selectedLeft.power}</p>
    <p>Speed: ${selectedLeft.speed}</p>
    <p>Strengths: ${selectedLeft.strengths.join(', ')}</p>
    <p>Weaknesses: ${selectedLeft.weaknesses.join(', ')}</p>
  ` : 'Select';
  rightSlot.innerHTML = selectedRight ? `
    <img src="${selectedRight.image}" alt="${selectedRight.name}">
    <h3>${selectedRight.name}</h3>
    <p>Power: ${selectedRight.power}</p>
    <p>Speed: ${selectedRight.speed}</p>
    <p>Strengths: ${selectedRight.strengths.join(', ')}</p>
    <p>Weaknesses: ${selectedRight.weaknesses.join(', ')}</p>
  ` : 'Select';
  
  // Highlight current slot
  leftSlot.classList.toggle('selected', currentSlot === 'left');
  rightSlot.classList.toggle('selected', currentSlot === 'right');
}