// Phase A transform: relabel categories (20 -> 8), fold QA into Testing, and split
// skills.json into a lean registry + a skills.extended.json sidecar. No code reads
// skills.json or the extended fields, so this is behaviour-preserving.
import fs from 'node:fs';
import path from 'node:path';

const SKILLS = 'packages/tokens/.agents/skills/skills.json';
const EXT = 'packages/tokens/.agents/skills/skills.extended.json';

const CATEGORY_MAP = {
  'token-foundations': 'foundations', 'design/foundation': 'foundations', 'color-ramps': 'foundations',
  'design/ui': 'design', 'design/ux': 'design', 'design/motion': 'design', 'design': 'design',
  'design/handoff': 'handoff',
  'react': 'react', 'storybook': 'react',
  'figma-integration': 'figma',
  'discovery': 'discovery', 'reference': 'discovery', 'reasoning': 'discovery', 'design/corpus': 'discovery',
  'editing': 'quality', 'validation': 'quality', 'governance': 'quality',
  'coordination': 'workflow', 'design/agents': 'workflow'
};
const CORE = ['name', 'description', 'category', 'path', 'agents', 'autonomy'];

const src = JSON.parse(fs.readFileSync(SKILLS, 'utf8'));
const leanSkills = [];
const extended = {};
const catCount = {}, agentCount = {};
let unmapped = new Set();

for (const s of src.skills) {
  const oldCat = s.category;
  const cat = CATEGORY_MAP[oldCat] || (unmapped.add(oldCat), oldCat);
  const agents = [...new Set((s.agents || []).map((a) => (a === 'QA' ? 'Testing' : a)))];

  const lean = { name: s.name, description: s.description, category: cat, path: s.path, agents, autonomy: s.autonomy };
  leanSkills.push(lean);
  catCount[cat] = (catCount[cat] || 0) + 1;
  agents.forEach((a) => (agentCount[a] = (agentCount[a] || 0) + 1));

  const ext = {};
  for (const [k, v] of Object.entries(s)) {
    if (!CORE.includes(k)) ext[k] = v;
  }
  ext.original_category = oldCat; // keep provenance for the Phase B folder move
  if (Object.keys(ext).length) extended[s.name] = ext;
}

const leanDoc = {
  $schema: src.$schema, name: src.name, version: '6.1.0',
  description: src.description, repository: src.repository,
  note: 'Lean registry. Extended metadata (intents, compose graph, io, gates) lives in skills.extended.json, keyed by skill name.',
  skills: leanSkills
};
const extDoc = {
  name: src.name + '-extended', version: '6.1.0',
  description: 'Optional per-skill metadata split out of skills.json in Phase A. Keyed by skill name.',
  skills: extended
};

fs.writeFileSync(SKILLS, JSON.stringify(leanDoc, null, 2) + '\n');
fs.writeFileSync(EXT, JSON.stringify(extDoc, null, 2) + '\n');

console.log('skills:', leanSkills.length, '| extended entries:', Object.keys(extended).length);
console.log('unmapped categories:', unmapped.size ? [...unmapped].join(', ') : 'none');
console.log('\ncategories (8):'); Object.entries(catCount).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>console.log('  ', c, n));
console.log('\nagents:'); Object.entries(agentCount).sort((a,b)=>b[1]-a[1]).forEach(([a,n])=>console.log('  ', a, n));
console.log('\nlean skills.json size:', fs.statSync(SKILLS).size, 'B | extended:', fs.statSync(EXT).size, 'B');
