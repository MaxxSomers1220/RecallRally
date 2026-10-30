"""Validate the actual local image pack, SVG content, size and provenance."""
from pathlib import Path
from PIL import Image
import json,hashlib,xml.etree.ElementTree as ET,re
root=Path(__file__).resolve().parents[1]/'librarian'
manifest=json.loads((root/'art-manifest.json').read_text())
for a in manifest['assets']:
 p=root/a['file'];raw=p.read_bytes()
 assert len(raw)<=a['max_bytes'],p.name+' exceeds byte budget'
 assert hashlib.sha256(raw).hexdigest()==a['sha256'],p.name+' provenance hash mismatch'
 if p.suffix=='.svg':
  text=raw.decode();node=ET.fromstring(text)
  assert int(node.attrib['width'])==a['width'] and int(node.attrib['height'])==a['height']
  assert not re.search(r'<script|<foreignObject|\bon\w+=|(?:href|src)=[\"\'](?:https?:|//)',text,re.I)
 else:
  im=Image.open(p);assert im.size==(a['width'],a['height']);assert ('A' in im.mode)==a['transparent']
 print('PASS',p.name,a['width'],a['height'],len(raw),'bytes')
