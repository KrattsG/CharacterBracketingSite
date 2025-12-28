// create.js - generate fighter YAML and download

function sanitizeFilename(name) {
  if (!name) return 'fighter' + Date.now();
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '') || ('fighter' + Date.now());
}

function toYamlString(obj) {
  // Manual YAML serialization tailored to the fighters format used in data/fighters
  const lines = [];
  function pushKV(key, value) {
    if (value === undefined || value === null) {
      lines.push(`${key}:`);
      return;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      if (value.length === 0) return;
      value.forEach(item => {
        lines.push(`  - ${String(item)}`);
      });
      return;
    }
    const s = String(value);
    if (/[:\\-\\n\\r#\\[\\]\\{\\},&\\*\\!\\|>%@`]/.test(s) || s.startsWith(' ')) {
      lines.push(`${key}: "${s.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${s}`);
    }
  }

  pushKV('name', obj.name);
  pushKV('image', obj.image);
  pushKV('verse', obj.verse);
  pushKV('powersystem', obj.powersystem);
  pushKV('strengths', obj.strengths);
  pushKV('weaknesses', obj.weaknesses);

  // ensure trailing newline
  return lines.join('\n') + '\n';
}

function parseListInput(input) {
  if (!input) return [];
  return input.split(',').map(s => s.trim()).filter(Boolean);
}

function downloadYaml(filename, content) {
  const blob = new Blob([content], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function findNextFighterIndex() {
  const fightersDir = 'data/fighters/';

  // Helper to compute smallest missing positive integer from an array of used indices
  const smallestMissing = (used) => {
    const set = new Set(used);
    let i = 1;
    while (true) {
      if (!set.has(i)) return i;
      i++;
    }
  };

  // 1) Try index.json
  try {
    const idxResp = await fetch(fightersDir + 'index.json');
    if (idxResp.ok) {
      const list = await idxResp.json();
      if (Array.isArray(list)) {
        const used = list.map(n => {
          const m = String(n).match(/^fighter(\d+)\.yaml$/i);
          return m ? Number(m[1]) : null;
        }).filter(Boolean);
        if (used.length) return smallestMissing(used);
      }
    }
  } catch (e) {
    // ignore
  }

  // 2) Try directory HTML listing
  try {
    const dirResp = await fetch(fightersDir);
    if (dirResp.ok) {
      const ct = dirResp.headers.get('content-type') || '';
      if (ct.includes('text/html')) {
        const html = await dirResp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const anchors = Array.from(doc.querySelectorAll('a'));
        const names = anchors.map(a => a.getAttribute('href')).filter(h => h && h.toLowerCase().endsWith('.yaml'));
        const used = names.map(n => {
          const m = String(n).match(/^fighter(\d+)\.yaml$/i);
          return m ? Number(m[1]) : null;
        }).filter(Boolean);
        if (used.length) return smallestMissing(used);
      }
    }
  } catch (e) {
    // ignore
  }

  // 3) Fallback: probe sequentially until we find a missing file
  for (let i = 1; i <= 200; i++) {
    try {
      const resp = await fetch(`${fightersDir}fighter${i}.yaml`, { method: 'HEAD' });
      if (!resp.ok) return i;
    } catch (e) {
      // If HEAD fails (some servers block), try GET
      try {
        const r2 = await fetch(`${fightersDir}fighter${i}.yaml`);
        if (!r2.ok) return i;
      } catch (e2) {
        return i;
      }
    }
  }

  // If everything 1..200 exists, choose 201
  return 201;
}

function previewCharacter() {
  const name = document.getElementById('character-name').value.trim();
  const verse = document.getElementById('character-verse').value.trim();
  const ability = document.getElementById('character-ability').value.trim();
  const image = document.getElementById('character-image').value.trim();
  const strengthsInput = document.getElementById('character-strengths').value.trim();
  const weaknessesInput = document.getElementById('character-weaknesses').value.trim();

  // Update preview name
  document.getElementById('preview-name').textContent = name || 'Character Name';

  // Update preview verse
  document.getElementById('preview-verse').textContent = verse ? `Verse: ${verse}` : 'Verse: Not specified';

  // Update preview ability
  document.getElementById('preview-ability').textContent = ability ? `Power System: ${ability}` : 'Power System: Not specified';

  // Update preview image
  const previewImg = document.getElementById('preview-img');
  const noImage = document.getElementById('no-image');
  if (image) {
    previewImg.src = image;
    previewImg.style.display = 'block';
    noImage.style.display = 'none';
  } else {
    previewImg.style.display = 'none';
    noImage.style.display = 'block';
  }

  // Update strengths list
  const strengthsList = document.getElementById('preview-strengths-list');
  strengthsList.innerHTML = '';
  const strengths = parseListInput(strengthsInput);
  if (strengths.length > 0) {
    strengths.forEach(strength => {
      const li = document.createElement('li');
      li.textContent = strength;
      strengthsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'None specified';
    li.style.fontStyle = 'italic';
    li.style.color = '#ccc';
    strengthsList.appendChild(li);
  }

  // Update weaknesses list
  const weaknessesList = document.getElementById('preview-weaknesses-list');
  weaknessesList.innerHTML = '';
  const weaknesses = parseListInput(weaknessesInput);
  if (weaknesses.length > 0) {
    weaknesses.forEach(weakness => {
      const li = document.createElement('li');
      li.textContent = weakness;
      weaknessesList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'None specified';
    li.style.fontStyle = 'italic';
    li.style.color = '#ccc';
    weaknessesList.appendChild(li);
  }

  // Show the preview section
  document.getElementById('character-preview').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('character-creation-form');
  const msg = document.getElementById('creation-message');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('character-name').value.trim();
    const verse = document.getElementById('character-verse').value.trim();
    const ability = document.getElementById('character-ability').value.trim();
    const image = document.getElementById('character-image').value.trim();
    const strengthsInput = document.getElementById('character-strengths').value.trim();
    const weaknessesInput = document.getElementById('character-weaknesses').value.trim();

    if (!name) {
      msg.textContent = 'Please enter a character name.';
      return;
    }

    // Find the smallest available fighter index and use that filename
    let index = 1;
    try {
      index = await findNextFighterIndex();
    } catch (err) {
      console.warn('Could not determine next fighter index, falling back to timestamped name', err);
      index = null;
    }

    const filenameBase = index ? `fighter${index}` : sanitizeFilename(name || 'fighter');
    const strengths = parseListInput(strengthsInput);
    const weaknesses = parseListInput(weaknessesInput);

    const fighter = {
      name: name,
      image: image || '',
      verse: verse || '',
      powersystem: ability || '',
      strengths: strengths,
      weaknesses: weaknesses
    };

    const yaml = toYamlString(fighter);
    const filename = `${filenameBase}.yaml`;
    downloadYaml(filename, yaml);

    msg.textContent = `YAML generated and downloaded as ${filenameBase}.yaml (save to server's data/fighters/ to make it available)`;
  });
});
