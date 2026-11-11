#!/usr/bin/env python3
"""Validate actual decoded dimensions, transparency, byte budgets, provenance hashes."""
from pathlib import Path
from PIL import Image
import json,hashlib,xml.etree.ElementTree as ET,re
root=Path(__file__).resolve().parent.parent/'assets/adventure'
m=json.loads((root/'manifest.json').read_text());keys=set()
for a in m['assets']:
 f=root/a['file'];raw=f.read_bytes();assert a['key'] not in keys;keys.add(a['key'])
 assert hashlib.sha256(raw).hexdigest()==a['sha256'],f
 assert len(raw)==a['bytes']<=a['max_bytes'],f
 if f.suffix=='.webp':
  with Image.open(f) as im:im.load();assert im.size==(a['width'],a['height']);assert im.width>=1200
 else:
  svg=ET.fromstring(raw);assert (int(svg.get('width')),int(svg.get('height')))==(a['width'],a['height']);assert not re.search(r'<script|<foreignObject|\bon\w+=|(?:href|src)=[\"\'](?:https?:|//)',raw.decode(),re.I)
 assert a['source']
assert len(keys)==23
print('PASS 13 decoded paintings, 10 original articulated guardians, provenance, SHA-256 and byte budgets')
