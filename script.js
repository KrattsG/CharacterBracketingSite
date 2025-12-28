// Load scripts synchronously
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Load fighters when page loads
window.addEventListener('load', async () => {
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
    await loadCharacters();
    await loadScript('matchup_system.js');
    matchupSystem.loadFighters();

    // Add event listener for randomize button
    document.getElementById('randomize-btn').addEventListener('click', () => {
      matchupSystem.randomizeMatchup();
    });
  } catch (error) {
    console.error('Error loading scripts:', error);
  }
});
