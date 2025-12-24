let allCharacters = [];

async function loadCharacters() {
    const characterGrid = document.getElementById('character-grid');

    // Try loading sequentially named files (fighter1.yaml, fighter2.yaml, etc.)
    for (let i = 1; i <= 20; i++) {
        try {
            const filePath = `data/fighters/fighter${i}.yaml`;
            const response = await fetch(filePath);
            if (response.ok) {
                const yamlText = await response.text();
                const character = jsyaml.load(yamlText);
                allCharacters.push(character);

                const card = createCharacterCard(character);
                characterGrid.appendChild(card);
            }
        } catch (error) {
            // File doesn't exist, continue to next
            continue;
        }
    }
}

function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';

    card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="character-image">
        <h3>${character.name}</h3>
        <p><strong>Verse:</strong> ${character.verse}</p>
        <p><strong>Power System:</strong> ${character.powersystem}</p>
        ${character.strengths && character.strengths.length > 0 ? `
            <div class="fighter-strengths">
                <h5>Strengths:</h5>
                <ul>
                    ${character.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        ${character.weaknesses && character.weaknesses.length > 0 ? `
            <div class="fighter-weaknesses">
                <h5>Weaknesses:</h5>
                <ul>
                    ${character.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;

    return card;
}

function filterCharacters() {
    const searchTerm = document.getElementById('character-search').value.toLowerCase();
    const characterGrid = document.getElementById('character-grid');
    const cards = characterGrid.querySelectorAll('.character-card');

    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const verse = card.querySelector('p').textContent.toLowerCase();
        const powerSystem = card.querySelectorAll('p')[1].textContent.toLowerCase();

        if (name.includes(searchTerm) || verse.includes(searchTerm) || powerSystem.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load characters when the page loads
document.addEventListener('DOMContentLoaded', loadCharacters);
