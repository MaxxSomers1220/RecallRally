// Original, composable storybook character drawing. No state, scoring, saves or timers.
const GUARDIAN_CHARACTER_KEYS=['pippin','fern','compass','quill','maestro','flint','tock','lyra','zephyr','astra'];
function heroStorybookDefs(l,id){
 const eye=heroOptionColor('eyeColor',l.eyeColor),tone=pantherTone,hair=heroOptionColor('hairColor',l.hairColor);
 return '<defs><pattern id="'+id+'-silkpaint" patternUnits="userSpaceOnUse" width="160" height="220"><image href="'+CHARACTER_ART.silk+'" width="160" height="220"/></pattern><pattern id="'+id+'-hairfiber" patternUnits="userSpaceOnUse" width="13" height="25"><path d="'+(['afro','puffs','curls'].includes(l.hairStyle)?'M2 4q6-5 7 2q-1 6-5 2M8 19q-4-6-6-1q-1 5 5 3':'M3-3Q-2 8 4 18T3 31M10-4Q5 8 11 18T10 31')+'" fill="none" stroke="'+tone(hair,.32)+'" stroke-width=".75" opacity=".36"/></pattern><radialGradient id="'+id+'-iris" cx=".38" cy=".27" r=".75"><stop stop-color="'+tone(eye,.55)+'"/><stop offset=".4" stop-color="'+eye+'"/><stop offset=".82" stop-color="'+tone(eye,-.36)+'"/><stop offset="1" stop-color="'+tone(eye,-.65)+'"/></radialGradient><pattern id="'+id+'-brushgrain" patternUnits="userSpaceOnUse" width="100" height="100"><image href="'+CHARACTER_ART.linen+'" width="100" height="100"/></pattern><linearGradient id="'+id+'-thread" x2="1" y2="1"><stop stop-color="#fff1c7"/><stop offset=".34" stop-color="#e0c087"/><stop offset=".68" stop-color="#a98550"/><stop offset="1" stop-color="#f6dfab"/></linearGradient></defs>';
}
function heroMaterialGrain(d,fill,id){
 if(!['cloth','cape','silk','petal','underskirt','ruffle','hair','boot','fairyshoe','steel'].some(k=>fill==='url(#'+id+'-'+k+')'))return '';
 if(fill==='url(#'+id+'-hair)')return '<path class="hero-hair-fibers" d="'+d+'" fill="url(#'+id+'-hairfiber)" stroke="none"/>';
 if(['cloth','cape','silk','petal','underskirt','ruffle'].some(k=>fill==='url(#'+id+'-'+k+')'))return '<path class="hero-fold-paint" d="'+d+'" fill="url(#'+id+'-silkpaint)" opacity=".24" stroke="none" pointer-events="none"/>';
 return '<path class="hero-painted-grain" d="'+d+'" fill="url(#'+id+'-brushgrain)" opacity="'+(fill.includes('hair')?.08:.12)+'" stroke="none" pointer-events="none"/>';
}
function heroTailoring(l,id,fairy){
 const cloth=heroOptionColor('outfitColor',l.outfitColor),t=pantherTone,gold='url(#'+id+'-thread)',edge=t(cloth,-.48),light=t(cloth,.57);
 const seam=(d,w=1.1,c=light,extra='')=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
 let art='';
 // Actual construction follows each outfit, rather than an ornament pasted over every look.
 if(l.outfit==='mage')art=seam(fairy?'M138 212Q146 242 143 252M179 211Q174 239 178 251M111 284Q109 294 115 298M185 285Q185 294 191 298':'M132 208 155 231 185 209M133 281 118 306M181 281 192 310',1.2,gold)+seam(fairy?'M124 278Q117 285 115 292M179 276 185 295':'M137 217 154 234 180 217',.8,edge,'stroke-dasharray="1 3"');
 if(l.outfit==='ranger')art=seam('M127 200 142 211M178 208 189 202M129 237 139 245M179 238 186 231',1.1,gold)+seam('M132 211 175 254',.8,'#ead0a1','stroke-dasharray="2 3"')+seam(fairy?'M128 273 117 283M184 273 196 283':'M128 274 126 286M184 273 189 285',1.5,edge);
 if(l.outfit==='knight')art=seam('M130 204 157 221 185 205M137 240 158 251 180 239',1.2,'#eef3df')+seam('M131 201 156 216 185 201',.8,edge)+[135,184].map(x=>'<circle cx="'+x+'" cy="225" r="2.2" fill="'+gold+'" stroke="'+edge+'" stroke-width=".7"/>').join('');
 if(l.outfit==='scholar')art=seam('M137 209 138 247M178 208 178 247',1.6,gold)+seam('M141 211V244M174 211V244',.65,edge,'stroke-dasharray="2 3"')+seam(fairy?'M127 285 122 307M190 284 196 309':'M128 279 116 309M188 279 204 309',1,gold);
 if(l.outfit==='bard')art=seam('M145 208 155 224 171 207M148 236 165 243M151 247 163 253',1.3,gold)+seam(fairy?'M113 278 104 291M141 276 133 294M181 276 190 295M208 280 218 292':'M128 281 117 300M186 281 199 302',1.1,light);
 if(l.outfit==='alchemist')art=seam('M134 202 149 215M182 202 168 215M136 228 145 233M177 228 170 233',1.1,gold)+seam('M151 282V307M175 282V307',.7,edge,'stroke-dasharray="2 2"')+seam('M152 285H175',1.1,light);
 // Cuff stitching and material edge highlights stay attached to the sleeves and boots.
 return '<g class="hero-tailoring" data-tailored-outfit="'+l.outfit+'" aria-hidden="true">'+art+'</g>';
}
function heroSplitLimbArt(art,id,kind){
 // Shared source geometry appears once; clipped uses articulate without duplicating gradient IDs.
 const a=id+'-'+kind;
 return '<defs><g id="'+a+'-source">'+art+'</g><clipPath id="'+a+'-left"><rect x="-100" y="-100" width="260" height="650"/></clipPath><clipPath id="'+a+'-right"><rect x="160" y="-100" width="300" height="650"/></clipPath></defs>'+['left','right'].map(side=>'<g class="atelier-arm-'+side+'"><g clip-path="url(#'+a+'-'+side+')"><use href="#'+a+'-source"/></g></g>').join('');
}
function paintedGuardianArt(d,l,glyph){return guardianRigMarkup(d,l,glyph)}

function heroFacePlanes(l){
 const c=heroOptionColor('skin',l.skin),t=pantherTone;
 return '<g class="hero-face-planes"><path d="M128 117Q125 135 135 145L139 145Q130 132 132 120Z" fill="'+t(c,-.18)+'" opacity=".48"/><path d="M185 113Q193 128 184 147L180 150Q192 139 190 120Z" fill="'+t(c,-.28)+'" opacity=".32"/><path d="M131 143Q140 141 147 148Q137 153 130 147Z" fill="'+t(c,.32)+'" opacity=".32"/><path d="M174 147Q181 140 188 142L187 146Q181 151 174 149Z" fill="'+t(c,.25)+'" opacity=".33"/><path d="M146 95Q162 88 177 95Q166 92 153 99Z" fill="'+t(c,.34)+'" opacity=".36"/><path d="M147 171Q160 178 176 168Q165 181 154 176Z" fill="'+t(c,-.16)+'" opacity=".45"/><path d="M158 128Q163 133 162 140" fill="none" stroke="'+t(c,.29)+'" stroke-width="1.5" stroke-linecap="round" opacity=".6"/></g>';
}
