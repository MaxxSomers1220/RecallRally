function guardianReleaseFocus(land){
 const r=GUARDIAN_RIGS[land],m=CHARACTER_META[land];if(!r||!m)return{x:520,y:89};
 return{x:(land===9?585:588)+(r.focus[0]-m.width/2)*.325,y:73-98+r.focus[1]*.325};
}
function guardianRigMarkup(d,l,glyph){
 const r=GUARDIAN_RIGS[d.land];if(!r)return '';const m=CHARACTER_META[d.land],id='gm-'+d.land,defs=[],parts=[];
 const path=s=>'<path d="'+s+'"/>';
 const clip=(name,shape)=>{defs.push('<clipPath id="'+id+'-'+name+'">'+path(shape)+'</clipPath>');return 'url(#'+id+'-'+name+')'};
 const image='<use href="#'+id+'-paint"/>';
 const extract=(shape,name)=>{let paint=image;if(name.startsWith('wing')){const cut=id+'-'+name+'-occlusion';defs.push('<mask id="'+cut+'" maskUnits="userSpaceOnUse" x="0" y="0" width="'+m.width+'" height="640"><rect width="'+m.width+'" height="640" fill="white"/><g fill="black">'+[r.head,...r.arms.flatMap(flatten)].map(a=>path(a.shape)).join('')+(r.fixed||[]).map(s=>path(s)).join('')+'</g></mask>');paint=(r.repairs||[]).map((a,i)=>'<g clip-path="'+clip(name+'-repair'+i,a.shape)+'"><use href="#'+id+'-paint" transform="translate('+a.offset.join(' ')+')"/></g>').join('')+'<g mask="url(#'+cut+')">'+image+'</g>';}return '<g clip-path="'+clip(name,shape)+'">'+paint+'</g>';};
 const flatten=a=>[a,...(a.child?flatten(a.child):[]),...(a.hand?flatten(a.hand):[])];
 const all=[r.head,...(r.ears||[]),...r.arms.flatMap(flatten),...(r.tails||[]),...(r.wings||[]).flatMap(a=>[a,a.child].filter(Boolean)),...(r.steps||[]).flatMap(a=>[a,a.child].filter(Boolean)),...(r.cloth||[])];
 defs.push('<image class="guardian-painted-frame" id="'+id+'-paint" href="'+CHARACTER_ART[r.key+'-1']+'" width="'+m.width+'" height="640"/>');
 defs.push('<mask id="'+id+'-body" maskUnits="userSpaceOnUse" x="0" y="0" width="'+m.width+'" height="640"><rect width="'+m.width+'" height="640" fill="white"/><g fill="black">'+all.map(a=>path(a.shape)).join('')+'</g><g fill="white">'+[r.head,...r.arms,...(r.wings||[])].map(a=>'<circle cx="'+a.pivot[0]+'" cy="'+a.pivot[1]+'" r="10"/>').join('')+(r.fixed||[]).map(s=>path(s)).join('')+'</g></mask>');
 // Overlapping circular joint caps keep seams closed without smearing or scaling anatomy.
 function limb(a,kind,i){
  const draw=(part,name)=>{let art=extract(part.shape,name);if(part.hand){const hole=id+'-'+name+'-hand-hole';defs.push('<mask id="'+hole+'" maskUnits="userSpaceOnUse" x="0" y="0" width="'+m.width+'" height="640"><rect width="'+m.width+'" height="640" fill="white"/><g fill="black">'+path(part.hand.shape)+'</g><circle cx="'+part.hand.pivot[0]+'" cy="'+part.hand.pivot[1]+'" r="6" fill="white"/></mask>');art='<g mask="url(#'+hole+')">'+art+'</g><g data-g-joint="'+name+'-wrist" data-pivot="'+part.hand.pivot+'">'+extract(part.hand.shape,name+'-wrist')+'</g>';}
   if(part.child)art+='<g data-g-joint="'+name+'-tip" data-pivot="'+part.child.pivot+'">'+draw(part.child,name+'-tip')+'</g>';return art;};
  return '<g data-g-joint="'+kind+i+'" data-pivot="'+a.pivot+'">'+draw(a,kind+i)+'</g>';
 }
 for(const [i,a]of(r.tails||[]).entries())parts.push(limb(a,'tail',i));
 const tailArt=parts.join('');parts.length=0;
 for(const [i,a]of(r.wings||[]).entries())parts.push(limb(a,'wing',i));
 const hip=r.hip||r.breath?.[1]||460;defs.push('<clipPath id="'+id+'-upper"><rect width="'+m.width+'" height="'+(hip+1)+'"/></clipPath><clipPath id="'+id+'-lower"><rect y="'+hip+'" width="'+m.width+'" height="640"/></clipPath>');parts.push('<g clip-path="url(#'+id+'-upper)"><g mask="url(#'+id+'-body)">'+image+'</g></g>');
 for(const [i,a]of(r.cloth||[]).entries())parts.push(limb(a,'cloth',i));
 for(const [i,a]of(r.steps||[]).entries())parts.push(limb(a,'step',i));
 for(const [i,a]of r.arms.entries())parts.push(limb(a,'arm',i));
 const headExtras=[...(r.ears||[])];defs.push('<mask id="'+id+'-head" maskUnits="userSpaceOnUse" x="0" y="0" width="'+m.width+'" height="640"><rect width="'+m.width+'" height="640" fill="white"/><g fill="black">'+headExtras.map(a=>path(a.shape)).join('')+'</g></mask>');
 let head='<g mask="url(#'+id+'-head)">'+extract(r.head.shape,'head-cut')+'</g>';
 for(const[i,a]of headExtras.entries())head+=limb(a,'ear',i);
 r.eyes.forEach(([x,y,rx,ry,dy,dx],i)=>{const lid=id+'-eye'+i;defs.push('<clipPath id="'+lid+'"><ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'"/></clipPath><clipPath id="'+lid+'-open"><ellipse data-g-eye="'+i+'" data-radius="'+ry+'" cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'"/></clipPath>');
 head+='<g clip-path="url(#'+lid+')"><use href="#'+id+'-paint" transform="translate('+(dx||0)+' '+dy+')"/></g><g clip-path="url(#'+lid+'-open)"><g data-g-gaze="'+i+'">'+image+'</g></g><path data-g-lid="'+i+'" d="M'+(x-rx)+' '+y+'Q'+x+' '+(y+ry*.3)+' '+(x+rx)+' '+y+'" fill="none" stroke="#483b34" stroke-width="1.5" opacity="0"/>';});
 parts.push('<g data-g-joint="head" data-pivot="'+r.head.pivot+'">'+head+'</g>');
 const f=guardianReleaseFocus(d.land),cx=d.land===9?585:588,width=m.width*.325;
 return '<g class="spell-fighter guardian-fighter"><g class="illustrated-guardian painted-guardian guardian-rig" data-guardian="'+d.land+'" data-mood="'+(d.phase==='result'?(d.correct?'impressed':'casting'):d.phase==='won'?'delighted':d.phase==='lost'?'kind':'curious')+'" data-character-pose="0" data-motion-state="listening" transform="translate('+cx+' 73)"><svg class="guardian-rig-art" x="'+(-width/2)+'" y="-98" width="'+width+'" height="208" viewBox="0 0 '+m.width+' 640"><defs>'+defs.join('')+'</defs>'+tailArt+'<g data-g-breath>'+parts.join('')+'</g><g data-g-fixed-feet clip-path="url(#'+id+'-lower)"><g mask="url(#'+id+'-body)">'+image+'</g></g></svg></g><g class="guardian-motion-focus" transform="translate('+f.x+' '+f.y+')" fill="'+l.magicColor+'"><circle r="9" fill="'+l.magicColor+'"/><g class="guardian-charge">'+glyph+'</g></g></g>';
}
