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
            }
        } catch (error) {
            // File doesn't exist, continue to next
            continue;
        }
    }

    // Call render function if defined
    if (typeof renderCharacters === 'function') {
        renderCharacters();
    }
}

// Characters will be loaded by script.js
