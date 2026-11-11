"""Pack the original grayscale atlas into four small local, tintable WebPs."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image
source=Path(sys.argv[1]); root=Path(__file__).resolve().parents[1]; folder=root/'assets/hero-advanced'
im=Image.open(source).convert('RGB'); w,h=im.size; assets=[]
for key,(x,y) in {'velvet':(0,0),'silk':(1,0),'leather':(0,1),'metal':(1,1)}.items():
    tile=im.crop((x*w//2,y*h//2,(x+1)*w//2,(y+1)*h//2)).resize((256,256),Image.Resampling.LANCZOS)
    name=key+'.webp';tile.save(folder/name,'WEBP',quality=83,method=6);raw=(folder/name).read_bytes()
    assets.append(dict(key=key,file=name,width=256,height=256,bytes=len(raw),max_bytes=45000,sha256=hashlib.sha256(raw).hexdigest(),role='tintable painted '+key+' relief'))
(folder/'manifest.json').write_text(json.dumps(dict(version=1,source='Original OpenAI image_gen grayscale four-material atlas',source_path=str(source),source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),preparation='Equal quadrant crop, 256px resample, WebP quality83; no character identity baked into material',assets=assets),indent=2)+'\n')
print('Packed four painted relief materials:',sum(a['bytes'] for a in assets),'bytes')
