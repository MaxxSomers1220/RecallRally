#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parent.parent/'assets/characters';m=json.loads((root/'manifest.json').read_text());groups={}
for r in m['assets']:
 f=root/r['file'];raw=f.read_bytes();assert hashlib.sha256(raw).hexdigest()==r['sha256'];assert len(raw)==r['bytes']<=r['max_bytes'];assert r['source']
 with Image.open(f) as im:
  im.load();assert im.size==(r['width'],r['height'])
  if 'guardian' in r:
   assert im.mode=='RGBA';a=im.getchannel('A');b=a.point(lambda v:255 if v>25 else 0).getbbox();assert b and abs(b[3]-r['baseline'])<=3;assert all(a.getpixel(p)==0 for p in [(0,0),(im.width-1,0),(0,639),(im.width-1,639)]);assert a.getextrema()==(0,255)
   cx=585 if r['guardian']==9 else 588;left=cx-208*r['width']/1280+b[0]*208/640;right=cx-208*r['width']/1280+b[2]*208/640;assert 390<left<right<720,(f,'stage clipping',left,right)
   groups.setdefault(r['guardian'],[]).append(r)
assert len(groups)==10
for rows in groups.values():
 assert len(rows)==3 and len({r['sha256'] for r in rows})==3;assert len({(r['width'],r['height'],r['baseline']) for r in rows})==1
assert len(m['assets'])==32
print('PASS 30 distinct transparent painted guardian poses, aligned baselines, two material swatches, decoded dimensions, hashes and budgets')
