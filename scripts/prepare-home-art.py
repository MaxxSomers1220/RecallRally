"""Prepare original paintings and approved project art for the live homepage."""
from PIL import Image,ImageOps
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'assets/home'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
rows=[]
def save(key,source,box,size,budget,role):
 p=root/source;im=Image.open(p).convert('RGB')
 if box:im=im.crop(box)
 im=ImageOps.fit(im,size,Image.Resampling.LANCZOS);target=out/(key+'.webp');im.save(target,'WEBP',quality=79,method=6)
 rows.append(dict(key=key,file=target.name,width=size[0],height=size[1],bytes=target.stat().st_size,max_bytes=budget,sha256=sha(target),source=source,source_sha256=sha(p),role=role))
save('hall','assets/home/source/study-hall.png',None,(1440,960),220000,'quiet painted hero background; decorative')
save('quick','assets/home/source/practice-tools.png',(0,100,755,855),(480,480),70000,'brass recall bell and study book; decorative')
save('written','assets/home/source/practice-tools.png',(780,80,1536,836),(480,480),70000,'feather quill and journal; decorative')
save('science','assets/home/source/science-workbench.png',None,(480,260),65000,'original fantasy science-workbench symbol; decorative')
save('library','librarian/library-painted.webp',None,(480,260),65000,'approved library panorama thumbnail; decorative')
save('adventure','assets/adventure/mosswood.webp',None,(480,200),55000,'approved Mosswood world thumbnail; decorative')
(out/'manifest.json').write_text(json.dumps(dict(version=1,license='Original project artwork. No third-party stock or commercial game assets.',generated='2026-11-01; OpenAI image_gen',assets=rows),indent=2)+'\n')
print([(r['key'],r['bytes']) for r in rows]);assert sum(r['bytes'] for r in rows)<400000
