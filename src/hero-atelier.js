// Composable, native-coordinate illustration. All colors and equipment use existing IDs.
function heroAtelierDefs(l,id){
 const c=heroOptionColor('skin',l.skin),t=pantherTone;
 const grad=(name,stops)=>'<radialGradient id="'+id+'-'+name+'" cx=".32" cy=".25" r=".78">'+stops.map(([o,f,a])=>'<stop offset="'+o+'" stop-color="'+f+'" stop-opacity="'+(a??1)+'"/>').join('')+'</radialGradient>';
 let art=grad('portrait',[[0,t(c,.4)],[.32,t(c,.14)],[.68,c],[1,t(c,-.38)]])+grad('cheeklight',[[0,t(c,.65),.4],[1,c,0]])+grad('warmth',[[0,t(c,-.2),.25],[1,c,0]]);
 for(const name of ['velvet','silk','leather','metal'])if(HERO_ATELIER_ART[name])art+='<pattern id="'+id+'-paint-'+name+'" patternUnits="userSpaceOnUse" width="'+(name==='silk'?120:90)+'" height="'+(name==='silk'?190:110)+'"><image href="'+HERO_ATELIER_ART[name]+'" width="'+(name==='silk'?120:90)+'" height="'+(name==='silk'?190:110)+'" preserveAspectRatio="none"/></pattern>';
 return '<defs>'+art+'</defs>';
}
function heroAtelierSurface(d,fill,id){
 const key=fill==='url(#'+id+'-skin)'?'velvet':fill==='url(#'+id+'-steel)'?'metal':fill==='url(#'+id+'-boot)'?'leather':['cloth','silk','ruffle','petal','underskirt','cape'].some(k=>fill==='url(#'+id+'-'+k+')')?'silk':null;
 return key&&HERO_ATELIER_ART[key]?'<path class="hero-atelier-paint" d="'+d+'" fill="url(#'+id+'-paint-'+key+')" opacity="'+(key==='velvet'?.14:key==='silk'?.28:.3)+'" style="mix-blend-mode:multiply" stroke="none"/>':'';
}
function heroPortraitDetail(l,id,shape){
 const c=heroOptionColor('skin',l.skin),h=heroOptionColor('hairColor',l.hairColor),t=pantherTone;
 const p=(d,f,s='none',w=1,extra='')=>'<path d="'+d+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+w+'" stroke-linecap="round" '+extra+'/>';
 return '<g class="hero-face-planes hero-portrait-paint"><defs><clipPath id="'+id+'-portrait-clip"><path d="'+shape+'"/></clipPath></defs><g clip-path="url(#'+id+'-portrait-clip)">'+p(shape,'url(#'+id+'-portrait)')+heroAtelierSurface(shape,'url(#'+id+'-skin)',id)+'<ellipse cx="140" cy="145" rx="18" ry="12" fill="url(#'+id+'-cheeklight)"/><ellipse cx="184" cy="144" rx="16" ry="12" fill="url(#'+id+'-warmth)"/>'+p('M120 118Q122 145 137 156Q130 141 134 127Z',t(c,-.23),'none',0,'opacity=".3"')+p('M192 113Q202 139 178 163L184 146Z',t(c,-.32),'none',0,'opacity=".25"')+p('M155 127Q152 140 153 144Q160 150 167 144L163 139 161 128Z',t(c,-.1))+p('M157 129Q154 140 156 142L160 143', 'none',t(c,.4),1.8)+p('M153 146Q157 148 160 146M164 145l3-1','none',t(c,-.35),.8)+p('M147 169Q160 174 175 164','none',t(c,.26),1.3)+p('M130 93Q145 79 165 85','none',t(c,.52),2.2)+p('M128 149Q134 148 141 151M176 149l9-3','none',t(c,.44),1.2)+'</g></g>';
}
function heroIrisDetail(id){
 let a='';for(let n=0;n<18;n++){const t=n*Math.PI/9;a+='<path d="M'+(2+Math.cos(t)*5.4).toFixed(2)+' '+(1+Math.sin(t)*7.8).toFixed(2)+'L'+(2+Math.cos(t)*7.3).toFixed(2)+' '+(1+Math.sin(t)*9.4).toFixed(2)+'" stroke="url(#'+id+'-thread)" opacity=".35" stroke-width=".5"/>';}
 return a;
}
function heroEquipmentDetail(l,id){
 const g='url(#'+id+'-gold)',p=(d,c,w)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>';
 return '<g class="hero-tool-metalwork">'+p('M263 141 271 145M263 147 271 151M263 153 271 157M263 159 271 163M263 165 271 169M263 171 271 175M263 177 271 181',g,1.4)+p('M265 115v19M265 191v20','#fff0ca',.9)+'<circle cx="267" cy="128" r="2.4" fill="'+g+'" stroke="#76532e" stroke-width=".6"/></g>';
}
// One copy of each selectable source layer; clipped uses share original IDs/gradients.
function heroComposeRig(l,o,L){
 const id=o.id,pose=o.pose,defs=[],sources=new Map(),use=(art,name,shape)=>{let sid=sources.get(art);const cid=id+'-cut-'+name;if(!sid){sid=id+'-piece-'+sources.size;sources.set(art,sid);defs.push('<g id="'+sid+'">'+art+'</g>');}if(shape)defs.push('<clipPath id="'+cid+'"><path d="'+shape+'"/></clipPath>');return '<g'+(shape?' clip-path="url(#'+cid+')"':'')+'><use href="#'+sid+'"/></g>';};
 const joint=(name,p,art,angle=0)=>'<g data-hj="'+name+'" data-pivot="'+p+'" transform="rotate('+angle+' '+p.join(' ')+')">'+art+'</g>';
 const limb=(side,art,hand,prop)=>{const left=side==='left',s=left?[116,203]:[207,203],e=left?[89,228]:[239,204],w=left?[61,238]:[260,168];
  const upper=left?'M74 175H160V214L96 237 73 226Z':'M160 175H239L248 209 223 246H160Z',lower=left?'M-15 208H83L103 232 79 269H-15Z':'M225 140H310V211L247 224 228 211Z';
  const glove=use(L.gloves,side+'-glove',left?'M-20 210H90V275H-20Z':'M225 140H300V215H225Z');
  const wrist=joint(side+'-wrist',w,prop+hand+glove);
  const fore=joint(side+'-elbow',e,use(art,side+'-fore',lower)+wrist);
  return joint(side+'-shoulder',s,use(art,side+'-upper',upper)+fore);
 };
 const legs=L.legs.replace(/<defs>[\s\S]*?<\/defs>/g,m=>{defs.push(m);return ''}),legArt=[];
 for(const side of ['left','right']){const left=side==='left',x=left?-20:160,end=left?160:330,hip=left?[140,275]:[180,275],knee=left?[121,313]:[200,313],ankle=left?[94,355]:[223,355],shape=(y,h)=>'M'+x+' '+y+'H'+end+'V'+h+'H'+x+'Z';
  const foot=joint(side+'-ankle',ankle,use(legs,side+'-foot',shape(353,420)));
  const shin=joint(side+'-knee',knee,use(legs,side+'-shin',shape(308,359))+foot);
  legArt.push(joint(side+'-hip',hip,use(legs,side+'-thigh',shape(249,318))+shin));
 }
 const head=joint('head',[160,181],L.head+joint('hair',[160,142],L.frontLocks)+L.flowers);
 const armArt='<g class="hero-sleeves">'+limb('left',L.arms+L.sleeves+L.shoulders,L.leftHand,L.magicAccents)+limb('right',L.arms+L.sleeves+L.shoulders,L.rightHand,L.weapon)+'</g>';
 const torso=L.torso+L.outfit+L.fabricDepth+L.pattern+L.tailoring+L.belt+L.accessory+L.neck+L.collar+L.brooch;
 const back=joint('torso-back',[160,278],L.wings+joint('cape',[157,190],L.cape)+joint('hair-back',[160,180],L.hairBack));
 const upper=joint('torso',[160,278],joint('skirt',[160,260],L.skirt)+torso+armArt+head);
 return '<g class="panther-hero storybook-hero hero-motion-rig '+(o.fairy?'fairy-hero ':'')+'panther-pose-'+pose+'" data-hero-style="'+(o.fairy?'fairy':'panther')+'" data-hero-face="'+l.face+'" data-hero-hair="'+l.hairStyle+'" data-hero-outfit="'+l.outfit+'" data-hero-staff="'+l.staff+'" data-hero-wings="'+l.wings+'" data-hero-shoes="'+l.shoes+'" data-hero-magic="'+l.magicColor+'" data-hero-pose="'+pose+'" data-hero-rig-id="'+id+'" data-hero-signature="'+Object.values(l).join('-')+'" style="--hero-magic:'+heroMagicColor(l)+'">'+L.defs+heroAtelierDefs(l,id)+'<defs>'+defs.join('')+'</defs><ellipse cx="164" cy="400" rx="103" ry="8" fill="#263440" opacity=".13"/>'+back+'<g class="hero-legs" data-shoes="'+l.shoes+'">'+legArt.join('')+'</g>'+upper+L.label+'</g>';
}
