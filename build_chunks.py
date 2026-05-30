#!/usr/bin/env python3
"""Build sharded data files for the tester from the master prompts.json.

Output:
  data/index.json         -- tiny manifest: total count, per-difficulty counts, chunk list
  data/chunk-NNN.json      -- ~1000-item shuffled chunks (balanced across difficulty/form)

The page loads index.json + chunk-000 immediately (fast first paint), then
streams the remaining chunks in the background. prompts.json stays the master.
Re-run this after every generation round, before committing.
"""
import json, os, random
from collections import Counter

CHUNK = 1000
d = json.load(open('prompts.json', encoding='utf-8'))
items = d['items']

# Deterministic shuffle so each chunk is balanced across difficulty and form.
shuf = items[:]
random.seed(42)
random.shuffle(shuf)

os.makedirs('data', exist_ok=True)
# clear stale chunks
for f in os.listdir('data'):
    if f.startswith('chunk-') and f.endswith('.json'):
        os.remove(os.path.join('data', f))

chunks = []
for i in range(0, len(shuf), CHUNK):
    name = f'chunk-{i // CHUNK:03d}.json'
    json.dump(shuf[i:i + CHUNK], open(os.path.join('data', name), 'w', encoding='utf-8'), ensure_ascii=False)
    chunks.append(name)

bd = Counter(it.get('difficulty', 'medium') for it in items)
index = {
    'version': d.get('version'),
    'count': len(items),
    'byDifficulty': {'easy': bd.get('easy', 0), 'medium': bd.get('medium', 0), 'hard': bd.get('hard', 0)},
    'chunks': chunks,
}
json.dump(index, open('data/index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f"built {len(chunks)} chunks for {len(items)} items; index byDifficulty={index['byDifficulty']}")
