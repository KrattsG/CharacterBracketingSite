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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('character-creation-form');
  const msg = document.getElementById('creation-message');
  if (!form) return;

  form.addEventListener('submit', (e) => {
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

    const filenameBase = sanitizeFilename(name || 'fighter');
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
    const filename = filenameBase + '.yaml';
    downloadYaml(filename, yaml);

    msg.textContent = `YAML generated and downloaded as ${filename}`;
  });
});
