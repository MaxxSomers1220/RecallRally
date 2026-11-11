#!/usr/bin/env python3
"""Prepare an original transparent 3-pose sheet for runtime (crop/pack only).
Requires Pillow, NumPy and SciPy when producing art; CI validates committed WebPs.
"""
import argparse,json,hashlib,math
from pathlib import Path
import numpy as np
from scipy import ndimage
from PIL import Image
p=argparse.ArgumentParser();p.add_argument('key');p.add_argument('source');p.add_argument('--land',type=int,required=True);args=p.parse_args()
root=Path(__file__).resolve().parent.parent/'assets/characters';root.mkdir(parents=True,exist_ok=True)
im=Image.open(args.source).convert('RGBA');arr=np.array(im);alpha=arr[:,:,3]
labels,n=ndimage.label(alpha>12);sizes=np.bincount(labels.ravel());ids=sorted(np.argsort(sizes[1:])[-3:]+1,key=lambda i:np.where(labels==i)[1].mean())
assert len(ids)==3 and all(sizes[i]>10000 for i in ids),'Need three separate character silhouettes'
# Assign soft alpha edges to their original connected figure, not a neighboring cell.
near=ndimage.distance_transform_edt(labels==0,return_distances=False,return_indices=True);owners=labels[tuple(near)]
boxes=[];feet=[]
for i in ids:
 y,x=np.where(labels==i);box=(int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1));boxes.append(box)
 fy,fx=np.where((labels==i)&(np.indices(alpha.shape)[0]>y.max()-45));feet.append(float((fx.min()+fx.max())/2))
scale=558/max(b[3]-b[1] for b in boxes);rows=[]
extent=max(max(foot-b[0],b[2]-foot) for b,foot in zip(boxes,feet))*scale
canvas_width=max(640,math.ceil((extent*2+24)/32)*32)
for k,(i,b,foot) in enumerate(zip(ids,boxes,feet)):
 piece=arr.copy();piece[:,:,3]=np.where(owners==i,alpha,0);cut=Image.fromarray(piece).crop(b);cut=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS)
 canvas=Image.new('RGBA',(canvas_width,640));x=round(canvas_width/2-(foot-b[0])*scale);y=620-cut.height
 assert x>=0 and x+cut.width<=canvas_width,(args.key,k,'Pose does not fit; review source',x,cut.width)
 canvas.alpha_composite(cut,(x,y));f=root/f'{args.key}-{k}.webp';canvas.save(f,'WEBP',quality=87,method=6,exact=True)
 rows.append(dict(key=f'{args.key}-{k}',file=f.name,guardian=args.land,pose=['curious','casting','impressed'][k],width=canvas_width,height=640,baseline=620,source_crop=list(b),foot_center=foot,bytes=f.stat().st_size,max_bytes=220000,sha256=hashlib.sha256(f.read_bytes()).hexdigest(),source='Original OpenAI image_gen transparent three-pose sheet',source_path=args.source,source_sha256=hashlib.sha256(Path(args.source).read_bytes()).hexdigest()))
manifest=root/'manifest.json';m=json.loads(manifest.read_text()) if manifest.exists() else {'version':1,'base':'65d0953','assets':[]}
m['assets']=[r for r in m['assets'] if r.get('guardian')!=args.land]+rows;m['assets'].sort(key=lambda r:(r.get('guardian',99),r['key']));manifest.write_text(json.dumps(m,indent=2)+'\n');print(args.key,[(r['pose'],r['bytes']) for r in rows])
