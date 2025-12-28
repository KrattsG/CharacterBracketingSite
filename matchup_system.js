class MatchupSystem {
  constructor() {
    this.fighters = [];
    this.selectedFighter1 = null;
    this.selectedFighter2 = null;
    this.initialPlaceholder1 = 'Select Fighter 1';
    this.initialPlaceholder2 = '🛡️ Select Fighter 2';
    this.placeholder1 = '⚔️ Select Fighter 1';
    this.placeholder2 = '🛡️ Select Fighter 2';
    this.saveFiles = this.loadSaveFiles();
    this.currentSaveFile = localStorage.getItem('currentSaveFile') || 'default';
  }

  async loadFighters() {
    try {
      const loadedFiles = [];

      // Try loading sequentially named files (fighter1.yaml, fighter2.yaml, etc.)
      for (let i = 1; i <= 20; i++) {
        try {
          const filePath = `data/fighters/fighter${i}.yaml`;
          const response = await fetch(filePath);
          if (response.ok) {
            const yamlText = await response.text();
            const fighter = jsyaml.load(yamlText);
            this.fighters.push(fighter);
            loadedFiles.push(`fighter${i}`);
          }
        } catch (error) {
          // File doesn't exist, continue to next
          continue;
        }
      }

      if (this.fighters.length === 0) {
        console.warn('No fighter files found in data/fighters directory');
      } else {
        // Populate dropdowns
        this.populateDropdowns();
        console.log('Fighters loaded:', this.fighters.length, 'fighters from files:', loadedFiles);
      }
    } catch (error) {
      console.error('Error loading fighters:', error);
    }
  }

  populateDropdowns() {
    this.populateCustomDropdown('fighter1-dropdown', 1);
    this.populateCustomDropdown('fighter2-dropdown', 2);
  }

  populateCustomDropdown(dropdownId, fighterNumber) {
    const optionsContainer = document.getElementById(`${dropdownId.replace('-dropdown', '')}-options`);
    const placeholderText = fighterNumber === 1 ? this.placeholder1 : this.placeholder2;

    // Clear existing options
    optionsContainer.innerHTML = '';

    // Add placeholder option
    const placeholderDiv = document.createElement('div');
    placeholderDiv.className = 'dropdown-option placeholder-option';
    placeholderDiv.textContent = placeholderText;
    placeholderDiv.onclick = () => this.selectFighter('', fighterNumber, dropdownId);
    optionsContainer.appendChild(placeholderDiv);

    // Add fighter options
    this.fighters.forEach(fighter => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'dropdown-option';
      optionDiv.textContent = fighter.name;
      optionDiv.onclick = () => this.selectFighter(fighter.id, fighterNumber, dropdownId);
      optionsContainer.appendChild(optionDiv);
    });
  }

  selectFighter(fighterId, fighterNumber, dropdownId) {
    const selectedFighter = fighterId ? this.fighters.find(f => f.id === fighterId) : null;
    const slotId = fighterNumber === 1 ? 'fighter1-slot' : 'fighter2-slot';
    const slot = document.getElementById(slotId);
    const selectedTextId = fighterNumber === 1 ? 'fighter1-selected-text' : 'fighter2-selected-text';
    const selectedText = document.getElementById(selectedTextId);

    if (fighterNumber === 1) {
      this.selectedFighter1 = selectedFighter;
    } else {
      this.selectedFighter2 = selectedFighter;
    }

    if (selectedFighter) {
      selectedText.textContent = selectedFighter.name;

      // Add or update selected-fighter div
      let selectedDiv = slot.querySelector('.selected-fighter');
      if (!selectedDiv) {
        selectedDiv = document.createElement('div');
        selectedDiv.className = 'selected-fighter';
        slot.appendChild(selectedDiv);
      }
      selectedDiv.innerHTML = `
        <img src="${selectedFighter.image}" alt="${selectedFighter.name}" class="selected-fighter-image">
        <p class="selected-fighter-verse"><strong>Verse:</strong> ${selectedFighter.verse}</p>
        <p class="selected-fighter-powersystem"><strong>Power System:</strong> ${selectedFighter.powersystem}</p>
        <div class="fighter-strengths">
          <h5>Strengths:</h5>
          <ul>
            ${selectedFighter.strengths ? selectedFighter.strengths.map(s => `<li>${s}</li>`).join('') : ''}
          </ul>
        </div>
        <div class="fighter-weaknesses">
          <h5>Weaknesses:</h5>
          <ul>
            ${selectedFighter.weaknesses ? selectedFighter.weaknesses.map(w => `<li>${w}</li>`).join('') : ''}
          </ul>
        </div>
      `;
      slot.classList.add('selected');
    } else {
      selectedText.textContent = fighterNumber === 1 ? this.placeholder1 : this.placeholder2;

      // Remove selected-fighter div if exists
      const selectedDiv = slot.querySelector('.selected-fighter');
      if (selectedDiv) {
        slot.removeChild(selectedDiv);
      }
      slot.classList.remove('selected');
    }

    // Close dropdown
    this.closeDropdown(dropdownId);

    // Display matchup if both fighters are selected
    if (this.selectedFighter1 && this.selectedFighter2) {
      this.displayMatchup();
    } else {
      // Clear matchup if not both selected
      document.getElementById('matchup-container').innerHTML = '';
    }
  }

  toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('open');

    // Close all dropdowns first
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));

    // Toggle the clicked dropdown
    if (!isOpen) {
      dropdown.classList.add('open');
    }
  }

  closeDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.remove('open');
  }

  filterDropdown(searchId, dropdownId) {
    const searchInput = document.getElementById(searchId);
    const optionsContainer = document.getElementById(`${dropdownId.replace('-dropdown', '')}-options`);
    const filter = searchInput.value.toLowerCase();
    const options = optionsContainer.querySelectorAll('.dropdown-option');

    options.forEach(option => {
      const text = option.textContent.toLowerCase();
      if (text.includes(filter) || option.classList.contains('placeholder-option')) {
        option.style.display = '';
      } else {
        option.style.display = 'none';
      }
    });
  }

  displayMatchup() {
    const matchupContainer = document.getElementById('matchup-container');
    matchupContainer.innerHTML = `
      <div class="matchup-display">
        <div class="matchup-analysis">
          <h3>Matchup Analysis</h3>
          <p>${this.analyzeMatchup()}</p>
        </div>
        <div class="winner-selection">
          <h4>Select the Winner:</h4>
          <button onclick="matchupSystem.recordWinner('${this.selectedFighter1.id}', '${this.selectedFighter2.id}')" class="winner-btn">${this.selectedFighter1.name} Wins</button>
          <button onclick="matchupSystem.recordWinner('${this.selectedFighter2.id}', '${this.selectedFighter1.id}')" class="winner-btn">${this.selectedFighter2.name} Wins</button>
        </div>
        <div class="save-management">
          <div id="current-save-display" class="current-save">Current Save: ${this.currentSaveFile}</div>
          <div class="save-controls">
            <input type="text" id="new-save-name" placeholder="New save file name" class="save-input">
            <button onclick="matchupSystem.createSaveFile(document.getElementById('new-save-name').value)" class="save-btn">Create Save</button>
            <button onclick="matchupSystem.exportSaveFile(matchupSystem.currentSaveFile)" class="save-btn">Export Current</button>
            <input type="file" id="import-file" accept=".json" style="display: none;" onchange="matchupSystem.importSaveFile(this.files[0])">
            <button onclick="document.getElementById('import-file').click()" class="save-btn">Import Save</button>
          </div>
          <div class="save-files-list">
            <h5>Available Save Files:</h5>
            <ul id="save-file-list"></ul>
          </div>
        </div>
        <div id="winners-list" class="winners-list">
          <h4>Recent Winners in "${this.currentSaveFile}":</h4>
          <ul id="winners-ul"></ul>
        </div>
      </div>
    `;
    this.displayWinners();
    this.updateSaveFileUI();
  }

  analyzeMatchup() {
    // Simple analysis based on strengths and weaknesses
    const f1 = this.selectedFighter1;
    const f2 = this.selectedFighter2;

    let analysis = '';

    // Check if strengths counter weaknesses
    const f1CountersF2 = f1.strengths && f2.weaknesses && f1.strengths.some(s => f2.weaknesses.includes(s));
    const f2CountersF1 = f2.strengths && f1.weaknesses && f2.strengths.some(s => f1.weaknesses.includes(s));

    if (f1CountersF2 && f2CountersF1) {
      analysis = 'This matchup is evenly balanced with mutual counters.';
    } else if (f1CountersF2) {
      analysis = `${f1.name} has the advantage due to countering ${f2.name}'s weaknesses.`;
    } else if (f2CountersF1) {
      analysis = `${f2.name} has the advantage due to countering ${f1.name}'s weaknesses.`;
    } else {
      analysis = 'This matchup appears to be unpredictable without clear advantages.';
    }

    return analysis;
  }

  randomizeMatchup() {
    if (this.fighters.length < 2) {
      console.error('Not enough fighters to randomize matchup');
      return;
    }

    // Get two random different fighters
    const shuffled = [...this.fighters].sort(() => 0.5 - Math.random());
    this.selectedFighter1 = shuffled[0];
    this.selectedFighter2 = shuffled[1];

    // Update dropdowns
    this.selectFighter(this.selectedFighter1.id, 1, 'fighter1-dropdown');
    this.selectFighter(this.selectedFighter2.id, 2, 'fighter2-dropdown');

    // Display matchup
    this.displayMatchup();
  }

  recordWinner(winnerId, loserId) {
    const winner = this.fighters.find(f => f.id === winnerId);
    const loser = this.fighters.find(f => f.id === loserId);

    if (!winner || !loser) {
      console.error('Winner or loser not found');
      return;
    }

    const matchupResult = {
      winner: winner.name,
      loser: loser.name,
      timestamp: new Date().toISOString(),
      winnerId: winnerId,
      loserId: loserId
    };

    // Load existing winners from localStorage
    let winners = JSON.parse(localStorage.getItem('matchupWinners') || '[]');

    // Add new winner to the beginning of the array
    winners.unshift(matchupResult);

    // Keep only the last 10 winners
    winners = winners.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem('matchupWinners', JSON.stringify(winners));

    // Update display
    this.displayWinners();

    // Show confirmation
    alert(`${winner.name} recorded as winner against ${loser.name}!`);
  }

  displayWinners() {
    const winnersUl = document.getElementById('winners-ul');
    if (!winnersUl) return;

    const winners = JSON.parse(localStorage.getItem('matchupWinners') || '[]');

    winnersUl.innerHTML = '';

    if (winners.length === 0) {
      winnersUl.innerHTML = '<li>No winners recorded yet.</li>';
      return;
    }

    winners.forEach(result => {
      const li = document.createElement('li');
      const date = new Date(result.timestamp).toLocaleString();
      li.textContent = `${result.winner} defeated ${result.loser} (${date})`;
      winnersUl.appendChild(li);
    });
  }

  filterFighters(searchId, selectId) {
    const searchInput = document.getElementById(searchId);
    const select = document.getElementById(selectId);
    const filter = searchInput.value.toLowerCase();
    const options = select.options;

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const text = option.text.toLowerCase();
      if (text.includes(filter) || option.value === '') {
        option.style.display = '';
      } else {
        option.style.display = 'none';
      }
    }
  }

  loadSaveFiles() {
    const saves = JSON.parse(localStorage.getItem('matchupSaveFiles') || '{}');
    if (!saves.default) {
      saves.default = { name: 'Default Save', winners: [], created: new Date().toISOString() };
    }
    localStorage.setItem('matchupSaveFiles', JSON.stringify(saves));
    return saves;
  }

  createSaveFile(name) {
    if (!name || name.trim() === '') {
      alert('Please enter a valid save file name.');
      return;
    }

    const trimmedName = name.trim();
    if (this.saveFiles[trimmedName]) {
      alert('A save file with this name already exists.');
      return;
    }

    this.saveFiles[trimmedName] = {
      name: trimmedName,
      winners: [],
      created: new Date().toISOString()
    };

    localStorage.setItem('matchupSaveFiles', JSON.stringify(this.saveFiles));
    this.updateSaveFileUI();
    alert(`Save file "${trimmedName}" created successfully!`);
  }

  switchSaveFile(saveName) {
    if (!this.saveFiles[saveName]) {
      console.error('Save file not found');
      return;
    }

    this.currentSaveFile = saveName;
    localStorage.setItem('currentSaveFile', saveName);
    this.displayWinners();
    this.updateSaveFileUI();
  }

  recordWinner(winnerId, loserId) {
    const winner = this.fighters.find(f => f.id === winnerId);
    const loser = this.fighters.find(f => f.id === loserId);

    if (!winner || !loser) {
      console.error('Winner or loser not found');
      return;
    }

    const matchupResult = {
      winner: winner.name,
      loser: loser.name,
      timestamp: new Date().toISOString(),
      winnerId: winnerId,
      loserId: loserId
    };

    // Add to current save file
    if (!this.saveFiles[this.currentSaveFile]) {
      this.saveFiles[this.currentSaveFile] = { name: this.currentSaveFile, winners: [], created: new Date().toISOString() };
    }

    this.saveFiles[this.currentSaveFile].winners.unshift(matchupResult);

    // Keep only the last 50 winners per save file
    this.saveFiles[this.currentSaveFile].winners = this.saveFiles[this.currentSaveFile].winners.slice(0, 50);

    // Save back to localStorage
    localStorage.setItem('matchupSaveFiles', JSON.stringify(this.saveFiles));

    // Automatically export/save to data/saves/ with dynamic name
    this.autoSaveToDataSaves();

    // Update display
    this.displayWinners();

    // Show confirmation
    alert(`${winner.name} recorded as winner against ${loser.name} in "${this.currentSaveFile}"!`);
  }

  displayWinners() {
    const winnersUl = document.getElementById('winners-ul');
    if (!winnersUl) return;

    const currentSave = this.saveFiles[this.currentSaveFile];
    const winners = currentSave ? currentSave.winners : [];

    winnersUl.innerHTML = '';

    if (winners.length === 0) {
      winnersUl.innerHTML = '<li>No winners recorded yet in this save file.</li>';
      return;
    }

    winners.forEach(result => {
      const li = document.createElement('li');
      const date = new Date(result.timestamp).toLocaleString();
      li.textContent = `${result.winner} defeated ${result.loser} (${date})`;
      winnersUl.appendChild(li);
    });
  }

  updateSaveFileUI() {
    // Update current save file display
    const currentSaveDisplay = document.getElementById('current-save-display');
    if (currentSaveDisplay) {
      currentSaveDisplay.textContent = `Current Save: ${this.currentSaveFile}`;
    }

    // Update save file list
    const saveFileList = document.getElementById('save-file-list');
    if (saveFileList) {
      saveFileList.innerHTML = '';
      Object.keys(this.saveFiles).forEach(saveName => {
        const save = this.saveFiles[saveName];
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${save.name} (${save.winners.length} entries)</span>
          <button onclick="matchupSystem.switchSaveFile('${saveName}')" class="${saveName === this.currentSaveFile ? 'active' : ''}">Switch</button>
        `;
        saveFileList.appendChild(li);
      });
    }
  }

  exportSaveFile(saveName) {
    if (!this.saveFiles[saveName]) {
      alert('Save file not found.');
      return;
    }

    const saveData = this.saveFiles[saveName];
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${saveName}_matchup_results.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  importSaveFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!importedData.name || !Array.isArray(importedData.winners)) {
          throw new Error('Invalid save file format');
        }

        const saveName = importedData.name;
        if (this.saveFiles[saveName]) {
          if (!confirm(`A save file named "${saveName}" already exists. Overwrite it?`)) {
            return;
          }
        }

        this.saveFiles[saveName] = importedData;
        localStorage.setItem('matchupSaveFiles', JSON.stringify(this.saveFiles));
        this.updateSaveFileUI();
        alert(`Save file "${saveName}" imported successfully!`);
      } catch (error) {
        alert('Error importing save file: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  autoSaveToDataSaves() {
    const saveData = this.saveFiles[this.currentSaveFile];
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    // Create dynamic filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `data/saves/${this.currentSaveFile}_${timestamp}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  }
}

// Initialize the matchup system
const matchupSystem = new MatchupSystem();
