const DATA_PATH = "data/fighters/";

const gameData = {
  fighters: []
};

// Load all fighter YAML files dynamically from local server directory listing
async function loadFighters() {
  console.log("loadFighters called");
  try {
    const response = await fetch('data/fighters/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    console.log("Directory HTML:", html);

    // Parse the HTML to extract YAML file links
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));
    const fighterFiles = links
      .map(a => a.getAttribute('href'))
      .filter(href => href && href.endsWith('.yaml') && !href.startsWith('?'))
      .map(href => href.replace(/^\.\//, '')); // Remove leading ./

    const promises = fighterFiles.map(async file => {
      try {
        const res = await fetch(DATA_PATH + file + '?t=' + Date.now());
        if (!res.ok) {
          throw new Error(`Failed to load ${file}: ${res.status}`);
        }
        const text = await res.text();
        const fighterData = jsyaml.load(text);
        // Validate required fields
        if (!fighterData.name || !fighterData.image) {
          console.warn(`Skipping ${file}: missing required fields (name or image)`);
          return;
        }
        gameData.fighters.push(fighterData);
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    });

    await Promise.all(promises);
    console.log("Fighters loaded:", gameData.fighters);
    initGame();
  } catch (error) {
    console.error("Error loading fighters:", error);
    // Optionally, show an error message to the user
    document.getElementById('result').innerHTML = 'Failed to load fighters. Please check the console for details.';
  }
}

loadFighters();
