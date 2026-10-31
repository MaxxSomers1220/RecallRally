function renderPantherHero(value,options={}){
 const l=normalizePantherLook(value),id=String(options.idPrefix||'panther').replace(/[^a-zA-Z0-9_-]/g,'')||'panther',pose=['idle','cast','hit','victory'].includes(options.pose)?options.pose:'idle';
 const skin=heroOptionColor('skin',l.skin),hair=heroOptionColor('hairColor',l.hairColor),cloth=heroOptionColor('outfitColor',l.outfitColor),cape=heroOptionColor('capeColor',l.capeColor),eye=heroOptionColor('eyeColor',l.eyeColor),magic=heroMagicColor(l);
 const tone=pantherTone,g=n=>'url(#'+id+'-'+n+')',ink='#292738',light=tone(cloth,.29),dark=tone(cloth,-.37),gold='#e9b65b',goldDark='#9f692d';
 const path=(d,fill,stroke=ink,w=1.6,extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round" '+extra+'/>'+heroMaterialGrain(d,fill,id)+heroAtelierSurface(d,fill,id);
 const paw=(x,y,s,c)=>pantherPaw(x,y,s,c);
 const star=(x,y,s,c)=>'<path transform="translate('+x+' '+y+') scale('+s+')" d="M0-10 2.6-2.6 10 0 2.6 2.6 0 10-2.6 2.6-10 0-2.6-2.6Z" fill="'+c+'"/>';
 const extraDefs='<radialGradient id="'+id+'-skinlight" cx=".36" cy=".32" r=".72"><stop stop-color="'+tone(skin,.45)+'" stop-opacity=".44"/><stop offset=".55" stop-color="'+skin+'" stop-opacity="0"/><stop offset="1" stop-color="'+tone(skin,-.4)+'" stop-opacity=".22"/></radialGradient><linearGradient id="'+id+'-hood" x1="0" y1="0" x2="1" y2=".9"><stop stop-color="'+tone(cloth,-.22)+'"/><stop offset=".52" stop-color="'+tone(cloth,-.54)+'"/><stop offset="1" stop-color="'+tone(cloth,-.24)+'"/></linearGradient><linearGradient id="'+id+'-boot" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="'+tone(cloth,-.45)+'"/><stop offset=".4" stop-color="'+tone(cloth,-.17)+'"/><stop offset=".7" stop-color="'+tone(cloth,-.42)+'"/><stop offset="1" stop-color="'+tone(cloth,-.65)+'"/></linearGradient>';
 const defs=heroStorybookDefs(l,id)+'<defs>'+extraDefs+'<linearGradient id="'+id+'-cloth" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="'+light+'"/><stop offset=".45" stop-color="'+cloth+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient><linearGradient id="'+id+'-cape" x1=".2" y1="0" x2=".9" y2="1"><stop stop-color="'+tone(cape,-.29)+'"/><stop offset=".47" stop-color="'+cape+'"/><stop offset="1" stop-color="'+tone(cape,.2)+'"/></linearGradient><linearGradient id="'+id+'-skin" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="'+tone(skin,.21)+'"/><stop offset=".5" stop-color="'+skin+'"/><stop offset="1" stop-color="'+tone(skin,-.19)+'"/></linearGradient><linearGradient id="'+id+'-hair" x1=".1" y1="0" x2=".75" y2="1"><stop stop-color="'+tone(hair,.19)+'"/><stop offset=".4" stop-color="'+hair+'"/><stop offset="1" stop-color="'+tone(hair,-.4)+'"/></linearGradient><linearGradient id="'+id+'-gold" x1="0" y1="0" x2=".9" y2=".9"><stop stop-color="#fff0ad"/><stop offset=".3" stop-color="#f0c877"/><stop offset=".55" stop-color="#bb7d32"/><stop offset=".75" stop-color="#eab251"/><stop offset="1" stop-color="#f4d08a"/></linearGradient><linearGradient id="'+id+'-steel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0e8e8"/><stop offset=".4" stop-color="'+tone(cloth,.37)+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient><radialGradient id="'+id+'-magic"><stop stop-color="#fff9e9"/><stop offset=".35" stop-color="'+tone(magic,.5)+'"/><stop offset="1" stop-color="'+magic+'" stop-opacity="0"/></radialGradient></defs>';
 // Behind the figure: silhouette-changing cloaks, not recolored rectangles.
 const capePaths={
  short:'M113 181Q84 186 67 220L66 280Q103 272 122 295L180 290Q219 275 248 288L237 227Q212 195 187 184Z',
  long:'M116 181Q90 189 84 229L60 355Q107 335 142 369Q205 339 272 362L249 283Q213 211 189 183Z',
  split:'M114 181Q75 186 63 227L44 339Q91 313 126 285L137 360 174 324 198 346 192 289Q241 307 287 334L269 275Q230 209 187 181Z',
  mantle:'M111 182Q83 184 69 207L73 243 91 236 103 252 117 242 132 259 151 249 172 261 187 244 205 254 222 235 240 241 244 213Q220 188 187 181Z'
 };
 let capeLayer='';if(l.cape!=='none'){
  const d=capePaths[l.cape];capeLayer=path(d,g('cape'),tone(cape,-.48),2)+path(d,'none',g('gold'),2.5)+path(l.cape==='mantle'?'M88 214Q153 244 226 212':'M119 194Q92 252 69 317M185 192Q207 252 260 320','none',tone(cape,.32),2);
  if(l.cape!=='mantle')capeLayer+=path('M121 204Q112 269 93 321L137 293 145 337Q151 280 167 241M186 202Q207 262 243 311L211 268 202 283Z',tone(cape,-.24),'none');
 }
 // Fabric ornament repeats on both cape and tunic, so "no cape" never disables it.
 let pattern='';const marks=l.cape==='mantle'?[[95,226,.47],[217,222,.47]]:l.cape==='none'?[[135,246,.45],[177,291,.5]]:[[83,293,.58],[240,298,.58]];
 for(const[x,y,s]of marks){if(l.pattern==='paws')pattern+=paw(x,y,s,tone(cape,.5));if(l.pattern==='stars')pattern+=star(x,y,s*1.2,tone(cape,.6))+star(x+12,y+9,s*.45,tone(cape,.72));if(l.pattern==='runes')pattern+=path('M'+x+' '+(y-10)+'l-7 10 7 10 7-10Z M'+x+' '+(y-10)+'v20','none',tone(cape,.65),2)}
 // Hair behind the shoulders has real length and characteristic silhouettes.
 let hairBack='';
 const hairFill=g('hair');
 if(['long','braids','locs','curls','ponytail','bob'].includes(l.hairStyle)){
  const backs={long:'M114 91Q99 111 101 154L92 248Q112 240 119 223L126 241Q140 211 139 171L185 167Q183 215 208 245L210 220 224 235Q211 189 215 151L205 91Z',bob:'M112 83Q97 104 104 151L99 184Q113 192 133 188L195 187 215 170 209 103Z',ponytail:'M199 75Q234 49 253 82Q271 107 254 135Q246 153 260 188Q229 180 220 153Q216 139 228 118Q235 102 215 100L193 99Z',braids:'M109 110Q94 132 104 165L113 183 98 212 115 229 127 211 117 187 125 166 127 119ZM191 112Q216 131 205 164L197 185 218 209 203 230 188 212 195 187 186 164Z',locs:'M107 84Q95 118 100 171L110 219 123 213 121 173 132 145 186 147 198 177 199 218 215 223 213 163 218 119 201 83Z',curls:'M112 85Q94 106 102 145Q92 156 105 171Q95 187 108 197Q101 212 117 220Q133 213 126 196Q140 184 131 168L188 164Q179 180 191 193Q181 206 198 219Q216 213 207 198Q222 188 210 173Q222 156 208 145Q222 112 202 87Z'};
  hairBack=path(backs[l.hairStyle],hairFill,tone(hair,-.6),1.5);
  if(l.hairStyle==='long')hairBack+=path('M110 140Q109 187 103 223M121 158Q125 200 118 219M202 138Q203 182 211 216','none',tone(hair,.22),1.5);
  if(l.hairStyle==='braids')for(const[x,flip]of [[111,1],[201,-1]])for(let y=144;y<220;y+=14)hairBack+=path('M'+(x-7)+' '+y+'q14-9 14 5l-7 9-8-8Z',g('hair'),tone(hair,-.38),1.4)+path('M'+x+' '+y+'l'+(8*flip)+' 10','none',tone(hair,.28),1.2);
  if(l.hairStyle==='locs')for(let x=103;x<219;x+=11)hairBack+=path('M'+x+' 111q-6 45 '+(x<160?-3:3)+' 92','none',tone(hair,-.25),7)+path('M'+(x+1)+' 118q-3 34 1 66','none',tone(hair,.23),1.5);
 }
 // Stance and layered boots share stable hip, knee, and floor anchors.
 const legs=path('M128 259 114 304 91 356 109 366 143 326 161 294 183 322 211 363 232 352 204 297 190 259Z','#303344',ink,2)+path('M137 280 121 320 102 350M181 282 197 314 220 349','none','#4e5266',4)+
 path('M88 344 109 353 102 373Q106 381 122 385L123 396Q102 402 74 399L69 390Z',g('boot'),ink,2)+path('M76 393Q99 397 121 389L123 399Q101 406 69 400Z',g('gold'),goldDark,1.4)+path('M89 352 104 358 99 378 84 372Z',dark,ink,1.3)+path('M88 349 105 356 101 364 85 359Z',g('gold'),goldDark,1.1)+
 path('M210 345 231 341 239 376Q250 382 261 388L261 398Q239 402 212 397L204 386Z',g('boot'),ink,2)+path('M210 391Q235 397 261 389L262 399Q238 405 209 399Z',g('gold'),goldDark,1.4)+path('M213 351 228 348 234 375 217 377Z',dark,ink,1.3)+path('M211 345 230 341 233 350 215 355Z',g('gold'),goldDark,1.1)+
 path('M112 307 127 314 117 339 101 333Z',g('gold'),goldDark,1.2)+path('M115 311 120 316 111 331 105 330Z','#f9d78c','none')+path('M199 307 215 300 230 326 213 336Z',g('gold'),goldDark,1.2)+path('M206 308 215 305 223 324 215 327Z','#f9d78c','none');
 const torso=path('M120 188Q154 176 194 188L209 220 194 270 127 272 112 220Z',g('cloth'),ink,2);
 const sleeves=path('M123 192Q107 183 95 202L77 224 60 226 60 244Q83 249 99 234L123 219Z',g('cloth'),ink,2)+path('M195 190Q210 187 220 204L243 184 250 163 268 170Q265 196 250 210L222 230 202 224Z',g('cloth'),ink,2)+path('M101 201Q110 213 114 225M205 201 216 218M231 197 242 211','none',light,3)+path('M78 225 95 236M246 180 263 186','none',g('gold'),4);
 let outfit='';
 if(l.outfit==='mage')outfit=path('M125 204 154 220 188 200 191 261 162 280 130 263Z',g('cloth'),ink,1.6)+path('M126 200 153 226 190 200M154 226 160 271','none',g('gold'),3)+path('M128 266 111 289 91 329 132 310 145 322 159 279 180 325 204 331 194 284 187 268Z',g('cloth'),ink,2)+path('M128 270 101 319 131 302 145 316 159 278 181 319 199 325','none',g('gold'),2.5)+path('M154 278 145 327 165 346 183 328 174 278Z',g('cape'),goldDark,1.2)+paw(165,325,.45,tone(cape,.54));
 if(l.outfit==='ranger')outfit=path('M122 202 148 191 173 204 194 193 195 266 204 290 184 299 166 286 147 301 127 291 112 294 126 261Z',g('cloth'),ink,2)+path('M132 207 161 237 191 211M129 281 149 290 167 275 186 288','none',g('gold'),2)+path('M120 194 139 193 191 261 180 270Z','#7b5439','#4a352a',1.5)+path('M126 196 135 196 186 263','none','#cba36f',1.3)+path('M159 221 169 216 179 230 169 237Z',g('gold'),goldDark,1.2);
 if(l.outfit==='knight')outfit=path('M122 198 153 187 191 198 201 235 190 264 157 279 125 264 115 236Z',g('steel'),ink,2)+path('M126 207 155 222 190 205 185 250 157 266 130 251Z',g('cloth'),g('gold'),2)+path('M155 222 157 265M129 237 157 245 187 234','none',tone(cloth,.55),2)+path('M129 265 114 288 134 302 151 278 161 304 177 278 193 303 210 288 191 265Z',g('steel'),ink,1.8)+path('M134 270 124 286M158 277 161 296M184 272 194 293','none',g('gold'),3)+paw(157,237,.69,g('gold'));
 if(l.outfit==='scholar')outfit=path('M125 196 191 197 190 252 207 341Q187 357 164 349Q139 358 113 345L129 252Z',g('cloth'),ink,2)+path('M135 199 146 205 148 334 137 341 128 334 137 251ZM172 204 183 198 178 251 197 335 187 344 176 337Z',g('gold'),goldDark,1.1)+path('M156 223 163 239 157 253 151 239ZM157 275 165 291 158 307 151 291ZM158 321V339','none',tone(cloth,.7),2)+path('M120 340Q140 346 160 341Q181 350 202 337','none',g('gold'),3);
 if(l.outfit==='bard')outfit=path('M123 192 147 203 160 224 175 203 194 192 190 261 205 289 181 312 163 289 145 307 120 287 131 260Z',g('cloth'),ink,2)+path('M147 205 158 260 171 208 160 217Z','#eee0bd','#b59e70',1.3)+path('M150 222 166 229M151 233 164 240M154 245 162 250','none',dark,2)+path('M126 194 139 211 127 226 111 218 96 208 99 195Z',g('cape'),g('gold'),2)+path('M192 194 211 194 222 211 203 224 188 212Z',g('cape'),g('gold'),2)+path('M125 276 145 292 161 276 182 294 200 280','none',g('gold'),2.5)+star(182,249,.55,g('gold'));
 if(l.outfit==='alchemist')outfit=path('M128 189 153 204 184 191 198 204 192 263 212 330 183 339 165 316 147 340 114 330 130 265 117 214Z',g('cloth'),ink,2)+path('M130 192 155 211 143 236 132 222ZM184 193 159 211 174 236 188 218Z',tone(cloth,.55),g('gold'),2)+path('M159 213 165 313M123 319 143 329M184 328 202 322','none',g('gold'),2)+[237,251,265].map(y=>'<circle cx="170" cy="'+y+'" r="2.7" fill="'+gold+'" stroke="'+goldDark+'"/>').join('')+path('M183 234h14v15h-14Z',dark,g('gold'),1.2)+path('M184 249v10q6 7 12 0v-10',magic,g('gold'),1.4);
 const collar=path('M128 181 155 195 190 179 194 193 159 213 126 195Z',g('cape'),ink,1.8)+path('M128 184 156 202 190 182','none',g('gold'),3)+path('M131 187 153 201 139 199M171 198 188 185 185 194Z',tone(cape,.34),'none');
 // Optional shoulder armor is an independent layer over every outfit.
 let shoulders='';if(l.shoulders==='leather')shoulders=path('M97 194Q108 185 122 192L126 213 110 221 95 212Z','#78503b','#46352e',1.7)+path('M100 196 118 195 120 211 110 216 101 208Z','#a9794d','#caa36c',1.3)+path('M195 191Q207 185 218 196L222 213 207 220 195 209Z','#78503b','#46352e',1.7)+path('M200 196 214 198 217 210 208 215 201 207Z','#a9794d','#caa36c',1.3);
 if(l.shoulders==='plate')shoulders=path('M94 195Q105 178 124 191L129 207 115 226 93 217Z',g('steel'),ink,1.8)+path('M96 198 115 192 124 201 113 218 98 212Z',g('gold'),goldDark,1.2)+path('M195 190Q210 178 222 195L226 216 208 226 194 207Z',g('steel'),ink,1.8)+path('M200 197 214 191 221 199 220 211 209 219Z',g('gold'),goldDark,1.2);
 // Distinct belts: a leather strap, knotted sash, or linked metal chain.
 let belt='';if(l.belt==='leather')belt=path('M124 258Q160 269 194 255L196 268Q159 282 123 271Z','#704b35','#44332c',1.8)+path('M127 262Q158 272 191 260','none','#b48a5c',1.8)+path('M153 259 169 257 177 268 168 281 155 279 149 268Z',g('gold'),goldDark,1.5)+path('M163 261 170 268 164 276 157 269Z','#f7d17e','#af7934',1);
 if(l.belt==='sash')belt=path('M124 255Q161 269 194 255L197 271Q162 283 122 272Z',g('cape'),tone(cape,-.5),1.8)+path('M174 271 185 267 201 308 186 296 181 312Z',g('cape'),goldDark,1.2)+path('M129 260Q157 272 188 260','none',tone(cape,.45),2)+path('M174 265 185 273 176 281 168 272Z',g('gold'),goldDark,1.2);
 if(l.belt==='chain'){belt=path('M125 262Q162 277 193 261','none','#7d5529',6);for(let x=130;x<193;x+=9)belt+='<ellipse cx="'+x+'" cy="'+(267+Math.sin((x-130)/63*Math.PI)*5)+'" rx="6" ry="3.5" transform="rotate(-8 '+x+' 270)" fill="none" stroke="'+gold+'" stroke-width="2.6"/>';belt+=paw(162,270,.49,g('gold'))}
 let accessory='';if(l.accessory==='pouch')accessory=path('M111 264 132 269 126 299 103 293Z','#92613c','#4c362b',1.8)+path('M110 262 134 267 128 282 107 278Z','#bb8b50','#6f4b2f',1.4)+path('M119 273 124 274 122 281 117 279Z',g('gold'),goldDark,1);
 if(l.accessory==='scroll')accessory=path('M111 266 130 273 121 303 103 296Z','#e9d7a9','#8f7049',1.5)+path('M111 266q-6-7-8 0l19 8q8 2 8-4M104 293q-7 0-3 6l20 6q7 0 5-6','none','#b1945d',3)+path('M108 279 125 285','none',g('cape'),5);
 if(l.accessory==='book')accessory=path('M109 266 133 269 129 304 104 300Z',g('cape'),ink,1.6)+path('M109 270 130 273 127 299 107 296Z','#eddfbb','#ba9a68',1)+path('M113 270 109 298','none',g('gold'),2)+paw(119,285,.37,g('gold'));
 if(l.accessory==='compass')accessory=path('M119 267v12','none',g('gold'),3)+'<circle cx="119" cy="292" r="14" fill="'+g('gold')+'" stroke="'+goldDark+'" stroke-width="1.5"/><circle cx="119" cy="292" r="10" fill="#f7e8b9" stroke="#b99a55"/>'+path('M119 282 123 291 119 302 115 293Z',magic,'#755d39',1)+path('M109 292h20M119 282v20','none','#b8a16d',.7);
 // Neck, hood, and panther ears share the face frame across all combinations.
 const neck=path('M143 163 141 188 160 204 178 185 174 162Z',g('skin'),tone(skin,-.4),1.5)+path('M144 170Q159 185 177 172L174 183 159 195 143 184Z',tone(skin,-.15),'none');
 const ear=(x,y,flip)=>{
  let d=l.ears==='rounded'?'M0 26Q-10 4 3-4Q21-9 30 22Z':l.ears==='tufted'?'M0 28-4 0 4 4 7-12 15 2 30 22Z':'M0 28 1-7Q16-3 31 23Z';
  return '<g transform="translate('+x+' '+y+') scale('+flip+' 1)"><g data-hj="ear-'+(flip===1?'left':'right')+'" data-pivot="15,25">'+path(d,dark,ink,2.4)+path(l.ears==='rounded'?'M6 22Q1 6 8 3Q18 0 23 21Z':'M6 22 8 3 24 22Z',g('gold'),goldDark,1)+'</g></g>';
 };
 const ears=l.ears==='none'?'':ear(107,l.hoodUp==='up'?28:49,1)+ear(224,l.hoodUp==='up'?35:53,-1);
 let hood='';
 if(l.hood==='none'){hood=ears}else if(l.hoodUp==='up'){
  const d={classic:'M96 89Q114 42 158 40Q201 41 222 89L234 153 208 183 164 201 109 177 80 137Z',scout:'M100 92Q115 54 154 51Q198 48 218 90L226 150 198 181 162 197 112 177 91 141Z',moon:'M90 93Q98 38 157 36Q215 39 227 91L240 146 212 179 164 202 106 181 78 137Z',armored:'M93 94 112 57 153 38 195 50 225 89 238 143 217 179 166 204 111 184 80 140Z'}[l.hood];
  hood=ears+path(d,g('hood'),ink,2.4)+path('M103 100Q122 61 158 62Q195 63 214 104L220 150 194 173 163 189 114 169 94 136Z','#242538',g('gold'),3.8)+path('M93 109Q99 71 132 56L111 89 88 130Z',light,'none');
  if(l.hood==='moon')hood+=path('M152 45a10 10 0 1 0 12 15 12 12 0 0 1-12-15Z',g('gold'),goldDark,.8)+star(112,105,.4,g('gold'))+star(220,120,.45,g('gold'));
  if(l.hood==='scout')hood+=path('M99 112 104 90Q145 47 188 74M222 128 216 160','none','#adba9c',2)+path('M92 126 105 130 109 149 97 143Z','#b09b63','#5c5740',1.2);
  if(l.hood==='armored')hood+=path('M108 68 126 58 115 90 94 123 88 136 88 118Z',g('steel'),g('gold'),1.5)+path('M197 63 215 83 229 126 221 148 212 111Z',g('steel'),g('gold'),1.5)+path('M128 57 155 43 187 53 174 66 154 59 136 70Z',g('steel'),g('gold'),1.5);
 }else{
  hood=ears+path('M114 172Q94 178 107 202L143 214 161 200 183 215 211 196Q211 177 194 169L168 190 149 192Z',g('cloth'),ink,2)+path('M114 183 141 205 158 197M175 202 197 183','none',g('gold'),3)+path('M108 195 129 201 143 211M185 209 202 196','none',light,1.5);
  if(l.hood==='armored')hood+=path('M108 183 124 181 143 201 132 207 112 198Z',g('steel'),g('gold'),1.3)+path('M186 199 198 179 210 187 202 201Z',g('steel'),g('gold'),1.3);
  if(l.hood==='moon')hood+=star(111,191,.6,g('gold'))+star(199,191,.6,g('gold'));
  if(l.hood==='scout')hood+=path('M118 185 140 200M183 201 200 183','none','#b3c19c',4);
 }
 // Six actual facial silhouettes; all clothing and hair stay independent.
 const faces={soft:'M117 102Q117 78 156 77Q195 78 201 109L197 140Q188 165 162 178Q137 175 122 151Z',angular:'M118 103Q120 76 159 77Q193 78 201 107L197 141 182 162 160 178 136 165 121 145Z',round:'M112 106Q113 77 156 77Q198 78 204 107L204 137Q199 165 163 180Q128 173 116 148Z',strong:'M112 102Q115 77 158 77Q198 77 204 108L199 145 184 169 159 180 131 164 117 142Z',heart:'M116 100Q122 76 158 77Q194 77 201 105L196 143 180 164 162 181 140 168 123 144Z',oval:'M119 99Q125 76 158 77Q193 77 200 105L195 143Q186 170 161 181Q138 173 124 149Z'};
 const face=path(faces[l.face],g('skin'),tone(skin,-.45),1.7)+path(faces[l.face],g('skinlight'),'none',0)+path('M121 112Q121 140 143 158Q161 174 184 157Q168 181 158 176Q130 167 121 142Z',tone(skin,-.1),'none')+path('M131 96Q142 83 162 84Q180 84 188 99Q162 92 145 104Z',tone(skin,.18),'none')+
 '<ellipse cx="126" cy="140" rx="8" ry="5" fill="'+tone(skin,-.05)+'" opacity=".55"/><ellipse cx="188" cy="140" rx="7" ry="5" fill="'+tone(skin,-.03)+'" opacity=".4"/>'+path('M157 132Q156 138 154 141Q153 145 160 146Q166 147 167 143Q164 142 163 138',tone(skin,-.06),tone(skin,-.19),.8)+'<ellipse cx="157" cy="141" rx="3" ry="1.7" fill="'+tone(skin,.27)+'" opacity=".7"/>'+path('M161 146q4 1 5-2','none',tone(skin,-.3),.8);
 const browStrong=['angular','strong'].includes(l.face),lash=['soft','heart'].includes(l.face),focused=l.expression==='focused'||pose==='cast';
 const eyeShape=(x,y,scale=1)=>{
  const eid=id+'-eye-'+x,shape=focused?'M-14 0Q-3-9 13-6Q16 9 3 13Q-10 14-14 0Z':'M-14 2Q-10-13 4-12Q18-9 14 5Q8 16-4 12Q-12 10-14 2Z';
  return '<g class="hero-eye-socket" transform="translate('+x+' '+y+') scale('+(scale*.83)+')"><defs><clipPath id="'+eid+'"><ellipse data-hero-aperture="" data-radius="16" rx="19" ry="16"/></clipPath></defs>'+path(shape,skin,'none',0)+'<g clip-path="url(#'+eid+')">'+(pose==='hit'?path('M-13 2Q0-5 13 0','none',tone(hair,-.6),2.4):path(shape,'#fff9e9',tone(skin,-.52),.85)+'<g data-hero-gaze=""><ellipse cx="2" cy="1" rx="8" ry="10.5" fill="'+g('iris')+'"/>'+heroIrisDetail(id)+'<ellipse cx="3" cy="0" rx="4.8" ry="7.8" fill="#262432"/><ellipse cx=".5" cy="-4.5" rx="2.8" ry="3.5" fill="#fffdf4"/><circle cx="6" cy="6" r="1.4" fill="#fffdf4"/></g>'+path(focused?'M-14-1Q-1-12 14-6':'M-14 1Q-11-14 5-12Q13-10 16-6','none',tone(hair,-.6),lash?2.6:1.8)+(lash?path('M-13-3-17-8M-11-8-14-13M13-8l4-4','none',tone(hair,-.6),1.1):''))+'</g><path data-hero-lid="" d="M-13 1Q0 5 13 0" fill="none" stroke="'+tone(hair,-.5)+'" stroke-width="1.8" opacity="0"/>'+path('M-11 15Q0 19 10 13','none',tone(skin,-.22),.6)+'</g>';
 };
 const eyes=eyeShape(137,123,browStrong?.95:1)+eyeShape(180,122,browStrong?.94:.97)+path(focused?'M123 103 145 108M169 107 190 99':'M124 102Q133 96 145 101M168 101Q181 94 190 100','none',tone(hair,-.35),browStrong?4.3:3.1);
 let mouth='';if(pose==='hit')mouth=path('M151 159Q161 154 170 158','none',tone(skin,-.46),1.8);else if(l.expression==='grin'||pose==='victory')mouth=path('M143 153Q159 160 177 151Q173 168 161 168Q149 167 143 153Z','#713d33',tone(skin,-.43),1.2)+path('M146 155Q162 161 174 154L171 160Q159 164 149 159Z','#fff5df','none');else if(l.expression==='calm')mouth=path('M150 158Q160 161 171 155','none',tone(skin,-.46),1.8);else if(l.expression==='focused')mouth=path('M148 158Q158 163 171 155','none',tone(skin,-.5),2);else mouth=path('M144 153Q156 166 175 153','none',tone(skin,-.48),1.9)+path('M151 166q8 3 14-1','none',tone(skin,.14),1.1);
 // Front hair uses locks, curls, braids, and texture rather than a color-only cap.
 let front='';const hf=g('hair'),hs=tone(hair,-.48),hi=tone(hair,.28);
 const sweep='M110 112Q100 92 119 75Q144 57 178 71Q197 68 212 92L224 103 204 104 214 118 198 113 194 132 184 113 174 97Q163 109 141 108L148 99Q131 111 119 113L122 104Z';
 if(['short','wavy','long','ponytail','braids'].includes(l.hairStyle)){
  front=path(sweep,hf,hs,1.7)+path('M119 91Q145 67 171 80Q159 99 138 103L146 92Q131 101 115 102Z',tone(hair,.12),'none')+path('M176 79Q185 95 173 105M131 85Q147 77 162 81M193 88l11 15','none',hi,1.4);
  if(l.hairStyle==='wavy')front+=path('M119 105Q110 118 119 135L123 124 129 135 132 116M197 104Q211 120 207 139L198 130 197 138 189 118',hf,hs,1.4);
  if(l.hairStyle==='short')front+=path('M119 75 127 62 142 70 155 57 166 72 185 66 191 81',hf,hs,1.5)+path('M125 99 118 119 124 125 128 114',hf,hs,1.3);
  if(l.hairStyle==='long')front+=path('M117 109Q105 145 121 177L125 160 133 169Q125 144 132 113M196 108Q210 140 195 176L192 156 185 166Q194 135 184 112',hf,hs,1.3)+path('M120 124Q115 148 121 160M199 123Q200 144 195 158','none',hi,1.5);
  if(l.hairStyle==='ponytail')front+=path('M191 75Q211 59 219 78L213 93 199 91Z',hf,hs,1.5)+path('M203 77 215 82','none',g('gold'),4);
 }
 if(l.hairStyle==='bob')front=path('M110 116Q102 78 130 69Q157 58 184 71Q214 78 211 120L205 163 190 170 193 114 180 97 174 111 161 102 149 111 137 102 129 115 128 170 112 161Z',hf,hs,1.7)+path('M115 111Q112 87 132 79M196 83Q207 100 203 147M121 120v32','none',hi,1.7);
 if(l.hairStyle==='curls'){
  front=path('M108 119Q97 93 113 79Q130 62 157 69Q189 62 207 82Q221 100 207 126L194 115 190 101 178 109 161 102 146 114 134 106 121 122Z',hf,hs,1.5);
  for(const[x,y,r]of [[117,94,12],[129,81,12],[144,77,12],[159,79,12],[174,77,12],[190,83,12],[202,97,12],[117,115,9],[202,119,9]])front+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+hf+'" stroke="'+hs+'" stroke-width="1.1"/>'+path('M'+(x-4)+' '+(y+4)+'q-5-8 3-8q6 4-1 6','none',hi,1.3);
 }
 if(l.hairStyle==='afro'||l.hairStyle==='puffs'){
  if(l.hairStyle==='afro'){front=path('M108 132Q92 133 93 119Q76 112 86 100Q77 84 92 77Q92 58 109 60Q118 45 133 54Q148 41 161 53Q177 43 189 57Q209 51 215 69Q233 73 227 91Q240 103 224 116Q226 133 208 135L196 113Q179 103 158 104Q133 104 120 119Z',hf,hs,1.8)}
  else front=path('M112 113Q105 83 125 74Q156 59 190 76Q210 86 207 117L193 106 179 103 162 107 145 103 130 109Z',hf,hs,1.6)+[83,231].map(x=>'<circle cx="'+x+'" cy="116" r="29" fill="'+hf+'" stroke="'+hs+'" stroke-width="1.7"/><circle cx="'+(x-8)+'" cy="107" r="11" fill="'+tone(hair,.11)+'"/>').join('')+path('M108 111 111 126M205 110 207 127','none',g('gold'),5);
  for(let i=0;i<16;i++){const x=103+(i*19)%111,y=70+(i*13)%43;front+=path('M'+x+' '+y+'q-4-4 0-7q6-1 6 4','none',tone(hair,.19),1.1)}
 }
 if(l.hairStyle==='locs'){
  front=path('M108 110Q104 80 128 72Q170 57 202 83L211 117 196 128 187 104 174 109 161 99 147 112 130 108 119 127Z',hf,hs,1.7);
  for(const[x,y,end]of [[119,86,122],[130,78,109],[143,76,104],[157,73,98],[172,75,105],[185,81,111],[197,89,124]])front+=path('M'+x+' '+y+'q-5 17 1 '+(end-y), 'none',tone(hair,-.2),8)+path('M'+(x+1)+' '+(y+2)+'q-3 14 0 '+(end-y-5),'none',hi,1.6);
  front+=path('M121 111h7M181 99h7M195 115h8','none',g('gold'),4);
 }
 // Long styles fall in front of the hood and collar. This separate layer
 // preserves visible length even when the head is framed by a raised hood.
 let frontLocks='';
 if(l.hairStyle==='long')frontLocks=
  path('M119 134Q110 159 113 190Q115 214 106 240L114 250Q139 232 135 207Q128 180 130 153Z',hf,hs,1.5)+
  path('M194 134Q209 156 206 187Q199 214 212 245L204 252Q182 234 186 207Q194 177 184 152Z',hf,hs,1.5)+
  path('M120 153Q115 177 123 204Q128 223 116 239M198 153Q202 176 195 204Q190 225 203 240','none',hi,1.7)+
  path('M127 178Q122 203 128 220M193 180Q197 202 193 220','none',tone(hair,-.2),2);
 if(l.hairStyle==='braids'){
  frontLocks=path('M116 139Q106 158 113 181L120 189 113 204 115 243 125 251 136 238 130 205 128 185 125 144ZM198 138Q210 155 201 179L194 190 203 208 200 243 190 252 179 238 186 205 185 186 189 143Z',hf,hs,1.5);
  for(const [x,y,flip]of [[122,172,1],[194,171,-1]])for(let i=0;i<5;i++){
   const cy=y+i*14,px=x+Math.sin(i*.9)*2;
   frontLocks+=path('M'+(px-8)+' '+cy+'Q'+px+' '+(cy-8)+' '+(px+8)+' '+cy+'L'+(px+7)+' '+(cy+9)+' '+px+' '+(cy+15)+' '+(px-8)+' '+(cy+8)+'Z',hf,hs,1.3)+
    path('M'+(px-5*flip)+' '+(cy-1)+'Q'+(px+4*flip)+' '+(cy+3)+' '+(px+3*flip)+' '+(cy+9),'none',hi,1.4);
  }
  frontLocks+=path('M115 238 130 237M186 238 201 239','none',g('gold'),5)+path('M120 245 115 254 127 252ZM192 246 186 254 199 254Z',hairFill,hs,1.2);
 }
 if(l.hairStyle==='locs'){
  for(const [x,y,end,bend]of [[116,140,234,-5],[124,148,246,3],[132,153,227,5],[190,148,239,-4],[199,142,247,6],[207,137,229,7]]){
   const d='M'+x+' '+y+'Q'+(x+bend)+' '+(y+42)+' '+(x+bend*1.3)+' '+end;
   frontLocks+=path(d,'none',hs,9.5)+path(d,'none',hair,7.3)+path('M'+(x-1)+' '+(y+4)+'Q'+(x+bend-1)+' '+(y+39)+' '+(x+bend*1.3-1)+' '+(end-4),'none',hi,1.35);
  }
  frontLocks+=path('M117 211l8 1M196 220l8-1M126 184l8 1','none',g('gold'),4);
 }
 if(l.hairStyle==='curls'){
  for(const [x,y,flip]of [[115,148,1],[123,164,1],[202,148,-1],[193,166,-1]]){
   frontLocks+=path('M'+x+' '+y+'q'+(-11*flip)+' 11 0 21q'+(10*flip)+' 10 0 20q'+(-10*flip)+' 11 2 21q'+(8*flip)+' 8-1 17','none',hs,12)+
    path('M'+x+' '+y+'q'+(-11*flip)+' 11 0 21q'+(10*flip)+' 10 0 20q'+(-10*flip)+' 11 2 21q'+(8*flip)+' 8-1 17','none',hair,9)+
    path('M'+(x-2*flip)+' '+(y+2)+'q'+(-6*flip)+' 8 0 14M'+(x+2*flip)+' '+(y+25)+'q'+(5*flip)+' 8-1 13M'+(x-2*flip)+' '+(y+46)+'q'+(-5*flip)+' 8 1 15','none',hi,1.4);
  }
 }
 if(l.hairStyle==='ponytail')frontLocks=path('M221 99Q247 105 242 132Q230 151 240 176Q214 165 221 144Q231 124 214 119Z',hf,hs,1.5)+path('M229 109Q240 121 230 142Q226 151 231 161','none',hi,1.6)+path('M214 98 224 103 222 111 211 105Z',g('gold'),goldDark,1.1);
 // Hood-down headband and panther brooch keep the mascot identity unmistakable.
 const hoodEdges=l.hood==='none'?'':l.hoodUp==='up'?path('M102 106 94 136 114 169 160 193M216 107 221 149 195 173 169 192','none',g('gold'),3):path('M111 79Q158 57 211 82','none',dark,6)+path('M111 78Q158 57 211 81','none',g('gold'),1.6);
 let mask='';if(l.mask==='eyemask')mask=path('M118 111 136 108 158 113 180 107 198 110 196 134 181 139 160 131 140 139 121 134Z M124 121Q135 108 149 119Q145 134 133 134Q126 133 124 121Z M167 119Q181 106 195 119Q190 133 179 134Q169 132 167 119Z',dark,g('gold'),1.1,'fill-rule="evenodd"')+path('M126 118Q137 108 148 118M168 117Q182 107 194 117','none',magic,1.5);if(l.mask==='scarf')mask=path('M124 145Q160 154 193 143L184 164 160 181 133 165Z',g('cape'),tone(cape,-.5),1.5)+path('M132 151 159 165 183 150M140 166 159 173 179 160','none',tone(cape,.4),1.5);
 let emblem='';if(l.emblem==='paw')emblem=paw(158,203,.49,'#302b3e');if(l.emblem==='panther')emblem=path('M148 198 149 190 154 194 164 194 169 190 169 200 166 209 159 213 151 208Z','#302b3e','none')+path('M152 201h3M163 201h3M157 206l2 2 2-2','none',gold,1.2);if(l.emblem==='moon')emblem=path('M157 191a10 10 0 1 0 10 15 12 12 0 0 1-10-15Z','#302b3e','none');if(l.emblem==='star')emblem=star(158,202,.9,'#302b3e');
 const brooch='<ellipse cx="158" cy="202" rx="13" ry="15" fill="'+g('gold')+'" stroke="'+goldDark+'" stroke-width="1.6"/><ellipse cx="158" cy="202" rx="10" ry="12" fill="#efc66e" stroke="#fbe2a0" stroke-width="1"/>'+emblem;
 // Open casting hand and a separate gripping hand read clearly at game size.
 let leftHand=path('M65 231C72 238 66 246 58 247C56 251 54 258 49 260C46 261 43 259 44 256L48 246C44 249 38 253 34 252C30 251 30 248 33 246L44 239C39 241 31 243 28 240C25 238 26 235 30 234L44 231C40 227 35 222 37 219C39 216 42 219 46 222L54 230C55 225 57 222 60 223C63 224 60 230 65 231Z',g('skin'),tone(skin,-.4),1.15)+path('M48 237Q53 244 59 240M49 244 53 246M43 232 47 235','none',tone(skin,-.27),.9)+path('M37 223 45 229M30 236l11-1M35 249l9-6M48 256l4-7','none',tone(skin,.25),1.3);
 let rightHand=path('M250 169Q246 160 252 151Q255 143 259 145Q262 147 259 154L269 149Q276 147 277 151Q278 154 267 160L274 157Q280 156 278 162L269 167Q276 166 275 171Q272 175 265 178Q257 183 250 176Z',g('skin'),tone(skin,-.4),1.15)+path('M256 157q6-1 10 5M253 164q6-1 10 4M254 171l6 2','none',tone(skin,-.27),.9)+path('M254 151q2-3 4-2M268 152l5-1','none',tone(skin,.26),1.1);
 let gloves='';if(l.gloves!=='none'){
  gloves=path('M62 222 75 230 67 245 57 251 48 244 53 232Z',dark,ink,1.4)+path('M246 166 257 174 270 172 266 185 251 184 243 178Z',dark,ink,1.4)+path('M56 233 63 237M254 177l8 2','none',light,1.5);
  if(l.gloves==='gauntlets')gloves+=path('M66 218 79 225 72 240 59 234Z',g('gold'),goldDark,1.4)+path('M244 173 260 181 264 194 246 191 239 182Z',g('gold'),goldDark,1.4)+path('M70 223 75 226 69 234M247 178 255 183 258 189','none','#ffdf91',1.4);
 }
 // One consistent grip anchor supports six genuinely different magical implements.
 let weapon='';const shaft=l.staff==='branch'?'#72513e':dark;
 if(l.staff==='starwand')weapon=path('M267 104V225','none',shaft,6)+path('M267 105V219','none',g('gold'),1.2)+star(267,89,2.4,g('gold'))+star(267,89,1.6,magic)+paw(267,91,.35,tone(magic,.7));
 else{
  weapon=path('M267 95V282','none',shaft,7)+path('M266 99v176','none',l.staff==='branch'?'#ae895c':light,1.5)+path('M261 110h12M261 259h12','none',g('gold'),5)+path('M267 280 260 288 267 299 274 287Z',g('gold'),goldDark,1.1);
  if(l.staff==='moonstaff')weapon+='<circle cx="267" cy="74" r="24" fill="none" stroke="'+g('gold')+'" stroke-width="7"/>'+path('M246 61 245 45 258 51M278 49 288 43 286 59',g('gold'),goldDark,1.2)+path('M267 49 275 70 267 96 259 72Z',magic,tone(magic,-.4),1.2)+path('M267 49v47l8-26Z',tone(magic,.5),'none')+star(267,72,.85,'#fffae0');
  if(l.staff==='crystal')weapon+=path('M267 43 279 68 273 101 259 101 250 68Z',magic,tone(magic,-.4),1.3)+path('M267 43v58l12-33Z',tone(magic,.55),'none')+path('M250 66 241 60 243 90 260 104ZM279 66 291 57 289 89 273 103Z',tone(magic,.12),tone(magic,-.35),1.2)+path('M251 98h30l-7 12h-15Z',g('gold'),goldDark,1.2);
  if(l.staff==='branch')weapon+=path('M265 106Q245 86 250 54L260 64 270 43 273 68 286 56 282 85 268 105Z','#8b6645','#493e31',1.5)+path('M255 78Q239 73 239 56Q255 54 262 68M275 80Q292 72 297 82Q289 96 275 89',magic,tone(magic,-.3),1.2)+paw(267,75,.48,tone(magic,.65));
  if(l.staff==='lantern')weapon+=path('M267 99V91M257 51Q267 33 277 51','none',g('gold'),4)+path('M249 54 258 47 276 47 285 54 280 89 253 89Z',g('gold'),goldDark,1.3)+path('M254 57h26l-4 27h-18Z',tone(magic,.6),tone(magic,-.2),1.3)+path('M252 54 258 43 265 49 275 43 283 54Z',dark,g('gold'),1.2)+paw(267,73,.55,magic)+path('M254 88h26l-7 11h-13Z',g('gold'),goldDark,1.2);
  if(l.staff==='claw')weapon+=path('M267 104Q244 96 242 72Q242 53 251 44L253 70 261 82 262 43 269 34 272 80 280 69 283 43Q295 56 292 76Q291 99 267 104Z',g('gold'),goldDark,1.5)+paw(267,76,.85,magic)+path('M246 69 251 83M284 69 280 83','none','#ffdf95',2);
 }
 weapon='<g class="panther-weapon" data-staff="'+l.staff+'" transform="rotate(9 267 164)">'+weapon+heroEquipmentDetail(l,id)+'</g>';
 const magicAccents='<g class="panther-magic-accent" opacity=".85"><circle cx="48" cy="221" r="'+(pose==='cast'?32:23)+'" fill="'+g('magic')+'"/><g transform="translate(44 218) scale('+(pose==='cast'?.57:.35)+')">'+heroMagicGlyph(l)+'</g>'+star(31,211,.45,tone(magic,.45))+star(64,216,.3,magic)+'</g>';
 const label=options.label?'<text x="160" y="418" text-anchor="middle" fill="#34534c" font-size="12" font-weight="800">PANTHER ADVENTURER</text>':'';
 const tilt=0;
 const head='<g class="panther-head" transform="rotate('+tilt+' 160 140)">'+hood+face+heroPortraitDetail(l,id,faces[l.face])+'<g class="hero-blink">'+eyes+'</g>'+mouth+front+hoodEdges+mask+'</g>';
 const fabricDepth=path('M123 221 132 251 127 257 116 232Z',tone(cloth,-.22),'none')+path('M183 217 190 237 183 255 175 251Z',tone(cloth,.12),'none')+path('M130 243 140 255M172 246l10-16','none',tone(cloth,.3),1.1);
 const bootFolds=path('M82 377 96 382 110 382M216 378 229 384 242 384','none',tone(cloth,.32),1.8)+path('M79 382 92 387M218 385l12 3','none',tone(cloth,-.36),2);
 const wavingCape='<g class="panther-cape" transform="rotate('+0+' 157 190)">'+capeLayer+'</g>';
 if(options.fairy)return fairyHeroFromLayers(l,{id,pose,articulated:options.articulated},{defs,wavingCape,hairBack,legs,bootFolds,torso,sleeves,outfit,fabricDepth,pattern,shoulders,belt,accessory,neck,head,collar,frontLocks,brooch,weapon,leftHand,rightHand,gloves,magicAccents,label,tilt});
 return heroComposeRig(l,{id,pose,fairy:false},{defs,wings:renderHeroWings(l,id),cape:wavingCape,hairBack,legs:l.shoes==='boots'?legs+bootFolds:renderHeroLegs(l,id),torso,sleeves,arms:'',outfit,fabricDepth,pattern,tailoring:heroTailoring(l,id,false),shoulders,belt,accessory,neck,head,collar,frontLocks,brooch,weapon,leftHand,rightHand,gloves,magicAccents,label,skirt:'',flowers:''});
}

/* PANTHER_ART_END */
/* FAIRY_ART_START */
/* Moonpetal Fairy Atelier — composable, offline vector artwork.
 * Shares the Panther Atelier's face, hair, hands, hood, equipment and poses.
 * Canonical viewBox 0 0 320 420; locally embedded painted materials, no network requests.
 */
function renderFairyHero(look,options={}){return renderPantherHero(look,{...options,fairy:true})}

/* These two independent layers are also available to the panther renderer. */
function renderHeroWings(l,id,pose='idle'){
 if(!l.wings||l.wings==='none')return '';
 const c=heroOptionColor('wingColor',l.wingColor),t=pantherTone,g=n=>'url(#'+id+'-'+n+')',gold='#e1b968',edge=t(c,-.34);
 const p=(d,fill,stroke=edge,w=1.35,extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
 const s=(x,y,z=1)=>'<path transform="translate('+x+' '+y+') scale('+z+')" d="M0-8 2-2 8 0 2 2 0 8-2 2-8 0-2-2Z" fill="#fff5d1"/>';
 const defs='<defs><linearGradient id="'+id+'-wing" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+t(c,.72)+'" stop-opacity=".92"/><stop offset=".48" stop-color="'+c+'" stop-opacity=".83"/><stop offset="1" stop-color="'+t(c,-.19)+'" stop-opacity=".93"/></linearGradient><linearGradient id="'+id+'-winglight" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#fff8ec" stop-opacity=".85"/><stop offset=".55" stop-color="'+t(c,.5)+'" stop-opacity=".55"/><stop offset="1" stop-color="'+c+'" stop-opacity=".28"/></linearGradient></defs>';
 let wing='';
 if(l.wings==='butterfly'){
  wing=p('M153 211C119 201 67 181 35 147C11 121 8 83 22 61C35 42 62 51 86 71C128 104 146 160 153 211Z',g('wing'),gold,2.1)+
   p('M151 215C114 207 76 209 46 231C24 249 10 290 25 308C40 326 71 306 96 287C119 271 138 246 151 215Z',g('wing'),gold,2.1)+
   p('M145 200C112 174 74 119 35 69C22 109 60 152 89 169Q116 186 145 200ZM143 223Q105 214 76 235C51 249 31 278 31 299Q83 294 126 245Z',g('winglight'),'none')+
   p('M151 209Q81 166 27 63M143 193Q97 151 39 149M129 170Q107 123 89 78M149 217Q91 238 28 307M128 233Q82 239 49 232M100 261Q68 270 25 276','none',gold,1.15)+
   p('M70 102Q81 125 100 126Q76 142 70 102ZM51 250Q70 247 89 237Q80 259 51 250Z',t(c,.8),gold,.8)+
   s(52,90,.7)+s(100,145,.6)+s(88,275,.65)+s(46,283,.4)+p('M110 113a12 12 0 1 0 13 17 14 14 0 0 1-13-17Z','#fff1b7','none');
 }else if(l.wings==='dragonfly'){
  wing=p('M153 205Q93 185 39 130Q15 107 17 88Q22 80 36 91Q116 139 153 205Z',g('wing'),gold,1.7)+
   p('M151 216Q87 217 32 246Q12 257 13 273Q17 282 34 275Q112 263 151 216Z',g('wing'),gold,1.7)+
   p('M148 204 27 95M150 217 22 269M118 180 94 139M100 164 65 123M80 149 39 119M117 230 92 244M96 239 72 259M67 250 44 272','none',t(c,.7),1.25)+
   p('M33 100 58 127 64 110 87 151 92 130 114 174M32 266 61 248 61 266 88 237 92 257 117 225','none',gold,.65)+s(49,111,.55)+s(42,263,.6);
 }else if(l.wings==='moth'){
  wing=p('M153 211Q121 154 55 95Q32 74 23 80L28 142 41 171 32 193Q67 225 121 222Z',g('wing'),gold,1.9)+
   p('M150 214Q102 216 55 238L34 257 49 269 40 284 61 288 64 303Q111 302 143 249Z',g('wing'),gold,1.9)+
   p('M29 114Q77 151 141 204M40 181Q82 206 139 212M53 262Q99 254 141 228','none',t(c,.65),6)+
   '<ellipse cx="74" cy="169" rx="19" ry="23" transform="rotate(-35 74 169)" fill="'+t(c,-.32)+'" stroke="'+gold+'" stroke-width="2"/><ellipse cx="74" cy="169" rx="10" ry="13" transform="rotate(-35 74 169)" fill="'+t(c,.7)+'"/><ellipse cx="74" cy="169" rx="4" ry="7" fill="'+t(c,-.5)+'"/>'+
   p('M150 214Q94 175 28 92M144 225Q97 268 65 299','none',gold,1)+s(85,271,.8);
 }else if(l.wings==='crystal'){
  wing=p('M153 213 104 115 41 54 49 143 83 186Z',g('wing'),gold,1.8)+p('M146 212 62 158 26 169 60 214 108 232Z',g('wing'),gold,1.8)+p('M149 218 88 228 37 295 103 271Z',g('wing'),gold,1.8)+
   p('M41 54 80 142 153 213 104 115ZM26 169 84 196 146 212 62 158ZM37 295 93 247 149 218 88 228Z',g('winglight'),gold,.8)+
   p('M80 142 49 143M84 196 60 214M93 247 103 271','none',t(c,.75),1.4)+s(78,140,.7)+s(92,246,.8);
 }
 const flare=0;
 return defs+'<g class="hero-wings fairy-wings" data-wings="'+l.wings+'" data-wing-color="'+l.wingColor+'"><g class="hero-wing-left" data-hj="wing-left" data-pivot="153,212" transform="rotate('+flare+' 153 212)">'+wing+'</g><g class="hero-wing-right" transform="translate(310 0) scale(-1 1)"><g data-hj="wing-right" data-pivot="153,212" transform="rotate('+flare+' 153 212)">'+wing+'</g></g></g>';
}

function renderHeroLegs(l,id){
 const t=pantherTone,c=heroOptionColor('outfitColor',l.outfitColor),skin=heroOptionColor('skin',l.skin),ink=t(c,-.65),g=n=>'url(#'+id+'-'+n+')',gold='#d3a253';
 const p=(d,f,s=ink,w=1.35)=>'<path d="'+d+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"/>';
 const shoe=l.shoes||'boots',defs='<defs><linearGradient id="'+id+'-fairytights" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="'+t(c,-.59)+'"/><stop offset=".44" stop-color="'+t(c,-.25)+'"/><stop offset=".7" stop-color="'+t(c,-.46)+'"/><stop offset="1" stop-color="'+t(c,-.67)+'"/></linearGradient><linearGradient id="'+id+'-fairyshoe" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="'+t(c,.68)+'"/><stop offset=".45" stop-color="'+t(c,.22)+'"/><stop offset="1" stop-color="'+t(c,-.18)+'"/></linearGradient></defs>';
 let legs=p('M129 261Q123 284 112 309L88 356 105 368Q135 337 146 317L161 291 181 320 214 365 233 356 205 302 191 261Z',g('fairytights'))+
 p('M136 279 122 313 101 347M183 282 199 313 221 348','none',t(c,-.14),3)+p('M127 302 115 322M199 314 212 337','none',t(c,-.64),2);
 if(shoe==='boots')legs+=p('M88 342 109 351 102 373Q110 384 123 386L123 396Q98 403 72 397L69 389Z',g('boot'))+p('M210 345 232 341 239 375Q251 383 261 389L261 398Q235 402 212 397L204 386Z',g('boot'))+
 p('M76 394Q99 400 122 390L123 400Q99 405 69 400ZM210 391Q237 399 261 390L262 400Q237 405 209 400Z',g('gold'),gold,1)+p('M86 351 105 358M211 349 230 345','none',g('gold'),5)+p('M87 371 98 375M218 372l12 3','none',t(c,.28),2);
 else if(shoe==='ankle')legs+=p('M86 355 105 364 100 378Q111 383 123 388L123 397Q99 403 73 397L72 387Z','#805743','#4f3b32',1.5)+p('M215 357 232 352 238 377Q251 382 261 390L260 398Q235 404 211 396L207 386Z','#805743','#4f3b32',1.5)+
 p('M84 360 102 367 97 374 80 369ZM214 361 232 356 236 365 216 370Z',g('cape'),'#6e563d',1.1)+p('M82 393Q101 399 122 391M213 393Q239 400 260 391','none',g('gold'),3)+p('M88 368l8 3M219 364l9-2','none',g('gold'),3);
 else{
  legs+=p('M87 355 103 364 97 381 81 378ZM215 359 231 355 237 379 222 383Z',g('skin'),t(skin,-.39),1.25);
  if(shoe==='bare')legs+=p('M83 375 97 378Q107 385 121 386L121 395Q101 402 77 396L73 391ZM220 378 236 374Q248 382 260 387L261 395Q240 401 218 394L213 387Z',g('skin'),t(skin,-.35),1.2);
  else{
   legs+=p('M81 376 95 379 100 382Q108 385 121 388L124 395Q99 404 76 397L72 392Z',g('fairyshoe'),ink,1.4)+p('M220 379 235 376Q244 383 258 387L264 394Q246 403 221 396L211 390Z',g('fairyshoe'),ink,1.4)+
    p('M78 397Q101 403 122 395M216 394Q242 402 261 394','none',g('gold'),1.5);
   if(shoe==='slippers'){
    legs+=p('M96 332 113 339 95 354 105 363 84 374M105 326 97 347 107 351 86 365 97 381M207 331 223 325 218 346 232 351 221 372M215 329 212 347 229 361 225 380','none',t(c,.62),4.5)+
     p('M96 332 113 339 95 354 105 363 84 374M207 331 223 325 218 346 232 351 221 372','none',t(c,.16),.8)+
     p('M96 348Q78 334 77 344Q77 353 96 353Q104 334 113 337Q119 344 101 353L95 357Z',g('fairyshoe'),t(c,-.25),1.05)+
     p('M218 344Q203 329 201 340Q200 349 216 350Q229 330 235 337Q240 346 222 350L217 354Z',g('fairyshoe'),t(c,-.25),1.05)+
     p('M92 352 80 370 87 366 86 376 101 355ZM219 350 235 363 230 363 235 373 216 354Z',g('fairyshoe'),t(c,-.25),1.1)+
     pantherPaw(102,391,.22,g('gold'))+pantherPaw(243,391,.22,g('gold'));
   }else{
    legs+=p('M84 381Q72 365 83 364Q98 366 96 384Q103 367 112 374Q116 383 100 388Z',g('cape'),g('gold'),1.05)+
     p('M224 383Q210 371 220 366Q230 365 231 381Q234 365 245 369Q251 381 235 387Z',g('cape'),g('gold'),1.05)+
     p('M88 367 99 382 108 375M222 370 232 383 242 373','none',t(c,.73),1)+p('M88 354 105 362M214 359 231 354','none',g('gold'),3);
   }
  }
 }
 return defs+'<g class="hero-legs fairy-legs" data-shoes="'+shoe+'">'+legs+'</g>';
}

function fairyHeroFromLayers(l,options,L){
 const id=options.id,pose=options.pose,t=pantherTone,c=heroOptionColor('outfitColor',l.outfitColor),cape=heroOptionColor('capeColor',l.capeColor),skin=heroOptionColor('skin',l.skin),magic=heroMagicColor(l),g=n=>'url(#'+id+'-'+n+')',ink=t(c,-.61),gold='#d7a34d',light=t(c,.63),dark=t(c,-.22);
 const p=(d,f,s=ink,w=1.4,extra='')=>'<path d="'+d+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round" '+extra+'/>'+heroAtelierSurface(d,f,id);
 const star=(x,y,z,f)=>'<path transform="translate('+x+' '+y+') scale('+z+')" d="M0-8 2.4-2.4 8 0 2.4 2.4 0 8-2.4 2.4-8 0-2.4-2.4Z" fill="'+f+'"/>';
 const defs='<defs><linearGradient id="'+id+'-silk" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="'+t(c,.68)+'"/><stop offset=".26" stop-color="'+t(c,.27)+'"/><stop offset=".55" stop-color="'+c+'"/><stop offset=".82" stop-color="'+t(c,.22)+'"/><stop offset="1" stop-color="'+t(c,-.21)+'"/></linearGradient><linearGradient id="'+id+'-underskirt" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+t(c,-.27)+'"/><stop offset=".38" stop-color="'+t(c,.06)+'"/><stop offset="1" stop-color="'+t(c,.57)+'"/></linearGradient><linearGradient id="'+id+'-ruffle" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fff5eb"/><stop offset=".42" stop-color="'+t(c,.64)+'"/><stop offset=".75" stop-color="'+t(c,.4)+'"/><stop offset="1" stop-color="'+t(c,.11)+'"/></linearGradient><linearGradient id="'+id+'-petal" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="'+t(c,.61)+'"/><stop offset=".45" stop-color="'+t(c,.15)+'"/><stop offset="1" stop-color="'+t(c,-.23)+'"/></linearGradient></defs>';
 const bow=(x,y,z)=>'<g transform="translate('+x+' '+y+') scale('+z+')">'+p('M0 0Q-28-25-32-8Q-33 8-5 9L0 0Q18-28 28-16Q39-1 5 9Z',g('cape'),t(cape,-.35),1.2)+p('M-4 6-23 39-8 32-9 46 5 14 22 39 22 26 34 30 9 4Z',g('cape'),t(cape,-.35),1.3)+p('M-25-11Q-16-8-4 3M9 2 25-12M-6 15-14 32M11 15l11 15','none',t(cape,.52),1.5)+p('M-5-1 6-4 12 8 0 15-8 7Z',g('gold'),gold,1.1)+'</g>';
 // Airy sleeves expose the forearms and preserve the shared hand/grip anchors.
 const arms=p('M105 207Q92 218 80 226L61 230 62 244Q82 244 98 231L116 219Z',g('skin'),t(skin,-.39),1.25)+p('M208 205 221 213Q239 204 248 188L254 166 265 172Q263 196 249 211L224 230 206 219Z',g('skin'),t(skin,-.39),1.25)+
  p('M89 229 99 221M236 200 246 184','none',t(skin,.3),2.1)+p('M88 238 97 232M224 220 239 209','none',t(skin,-.16),1.4);
 const puff=(x,y,flip)=>'<g transform="translate('+x+' '+y+') scale('+flip+' 1)">'+p('M-13-12Q-8-23 4-18Q17-21 21-9Q31-1 22 10Q23 20 9 23L-6 15Q-21 16-21 3Q-25-6-13-12Z',g('ruffle'),t(c,-.17),1.2)+p('M-14-8Q-3-4-2 6M3-14Q11-7 10 5M18-3Q21 7 13 12','none',t(c,.2),1.7)+p('M-10 10Q2 5 17 13L13 21Q0 17-10 18Z',g('ruffle'),t(c,.14),1.05)+p('M-9 16q4-7 9 1q5-6 12 2','none','#fff5e6',1.4)+'</g>';
 let sleeves=puff(112,202,1)+puff(206,201,-1);
 let bodice=p('M128 190Q156 184 189 191L195 218 186 258Q160 275 131 260L121 218Z',g('silk'))+
  p('M130 197 143 221 159 238 178 218 188 195 185 251 160 268 135 252Z',g('petal'),t(c,-.29),1.1)+
  p('M137 214 153 222 145 233 164 240 154 250 170 258M176 216 161 225 176 234 158 242 177 250','none',g('gold'),1.4)+
  p('M129 208 138 244M187 209 180 249','none',t(c,.7),2.1);
 let skirt='';
 if(l.outfit==='mage'){
  // Three overlapping sculpted ruffle tiers, with folded undersides and a full hem.
  skirt=p('M128 255Q101 275 80 303Q55 324 66 337Q74 347 88 337Q89 352 106 347Q113 361 130 348Q143 364 160 352Q179 367 194 350Q211 360 223 344Q239 352 248 334Q258 324 243 311Q216 280 189 255Z',g('underskirt'),t(c,-.35),1.5)+
   p('M80 312Q95 319 85 335Q98 327 104 342Q111 329 126 344Q135 329 151 347Q161 333 178 350Q191 336 202 345Q214 329 224 340Q239 324 246 329','none',g('ruffle'),7)+
   p('M128 258Q107 270 83 296Q73 307 84 316Q94 322 105 312Q108 329 124 322Q133 336 149 324Q162 338 176 327Q190 340 203 324Q218 332 226 317Q244 322 245 307Q224 278 190 257Z',g('silk'),t(c,-.24),1.5)+
   p('M84 312Q95 322 105 312Q108 329 124 322Q133 336 149 324Q162 338 176 327Q190 340 203 324Q218 332 226 317Q240 321 245 308','none',g('gold'),2.3)+
   p('M131 256Q112 269 101 286Q96 296 108 301Q123 307 135 294Q144 314 158 303Q174 319 189 300Q202 310 216 295Q231 294 223 284Q209 264 187 256Z',g('petal'),t(c,-.16),1.3)+
   p('M102 291Q116 310 135 294Q144 314 158 303Q174 319 189 300Q204 312 218 295','none',g('gold'),2.2)+
   p('M137 269Q122 282 119 293M149 271 145 297M166 271 169 300M180 269 194 294M128 300 116 313M154 311v14M187 307l14 13M95 323l-3 12M132 334l-4 12M178 337l2 13M223 327l4 12','none',t(c,.62),2.5)+
   p('M135 271 126 292 136 289ZM171 273 180 299 187 296ZM113 306 106 318 115 322ZM204 302 214 317 219 314Z',t(c,-.09),'none',0);
  // Rolled hems and translucent tulle folds give the rounded skirt depth.
  skirt+=p('M67 331Q77 341 88 332Q88 346 106 342Q114 355 130 343Q142 359 159 347Q178 363 193 345Q209 355 222 339Q235 345 246 332','none',t(c,-.12),2.1)+
   p('M75 328Q72 338 87 339L88 331Q81 336 75 328ZM98 334Q100 345 112 343L107 336Q101 339 98 334ZM125 339Q130 352 142 347L135 340Q130 344 125 339ZM160 343Q167 357 181 350L174 344Q166 349 160 343ZM198 337Q207 350 220 340L213 335Q207 343 198 337ZM228 326Q241 338 247 327L241 321Q239 330 228 326Z',t(c,-.17),'none',0,'opacity=".6"')+
   p('M73 324Q79 332 88 326M93 335Q101 340 108 335M116 340Q126 346 133 339M143 345Q153 352 162 344M177 348Q188 352 195 343M211 339Q221 342 227 334M235 328l7-2','none',t(c,.82),1.8)+
   p('M127 274Q109 285 100 302L110 299Q116 286 130 278ZM148 278Q137 302 143 321L151 320Q144 298 154 279ZM173 278Q179 298 189 304L195 301Q184 290 180 278ZM206 289Q220 300 224 316L231 312Q225 297 211 285Z',t(c,.62),'none',0,'opacity=".35"');
 }else if(l.outfit==='ranger'){
  sleeves=p('M96 195Q104 185 121 191L126 208 110 221 95 214Z',g('petal'))+p('M195 192Q211 185 218 199L220 214 206 221 194 209Z',g('petal'))+p('M98 207 112 214M202 211l14-7','none',g('gold'),2);
  bodice=p('M124 191 146 193 159 213 175 194 192 190 194 251 181 268 137 268 124 252 115 215Z',g('silk'))+p('M126 196 150 222 190 199M148 223 158 263','none',g('gold'),2)+p('M132 205 183 257 174 268 121 208Z','#956646','#614b37',1.2)+p('M130 210 178 261','none','#d6b379',1.3);
  skirt='<g data-outfit-silhouette="scout-trousers">'+p('M133 259 158 272 177 260 192 270 198 302 223 338 211 351 179 321 161 295 144 322 113 354 98 344 123 302Z',g('cape'))+p('M128 254 158 265 188 252 204 285 178 295 157 277 135 293 112 283Z',g('silk'))+p('M138 296 126 318 109 340M182 296 194 319 213 339','none',g('gold'),2)+p('M180 273h17v12h-17Z',g('petal'),g('gold'),1)+'</g>';
 }else if(l.outfit==='knight'){
  bodice=p('M123 191 154 185 193 194 201 222 188 260 159 275 130 260 116 224Z',g('steel'),t(c,-.46),1.7)+p('M128 203 157 218 189 202 183 246 159 263 135 246Z',g('silk'),g('gold'),2)+p('M157 218 159 262M134 237 159 247 185 235','none',t(c,.7),2)+pantherPaw(158,235,.48,g('gold'));
  skirt=p('M131 256Q109 273 97 305Q120 301 131 316L155 298 174 318Q194 305 216 309Q210 275 189 255Z',g('ruffle'),t(c,-.27),1.5)+p('M131 260 114 283 126 302 149 279 158 307 174 282 194 302 205 281 188 260Z',g('steel'),t(c,-.44),1.5)+p('M131 266 124 282 130 291M158 275v23M185 266 195 284 190 291','none',g('gold'),2.4)+p('M102 305 113 299 129 311M177 314 197 304 212 309','none',g('gold'),2);
 }else if(l.outfit==='scholar'){
  sleeves=p('M124 192 99 195 91 215 74 225 81 245 113 232 126 211Z',g('silk'))+p('M192 192 213 196 226 215 242 194 258 202 224 240 200 226Z',g('silk'))+p('M78 227 86 243M241 196l14 9','none',g('ruffle'),7)+p('M103 206 108 224M209 208l6 20','none',t(c,.55),2.1);
  bodice=p('M125 193 158 202 190 192 193 233 186 261 133 266 120 222Z',g('silk'))+p('M132 197 146 209 148 258 137 261 137 225ZM180 197 168 210 175 259 187 255 178 224Z',g('cape'),g('gold'),1.1);
  skirt='<g data-outfit-silhouette="scholar-travel-coat">'+p('M138 258 161 278 182 258 193 302 222 341 210 351 179 321 160 295 143 325 113 353 100 342 128 303Z',g('cape'))+p('M133 255 151 267 144 307 127 335 111 331 123 297ZM171 266 187 255 197 297 211 331 193 337 177 309Z',g('silk'),g('gold'),1.5)+p('M139 270 130 302 120 325M184 269 188 301 202 328','none',g('gold'),2)+p('M130 290h12v13h-12ZM182 290h12v13h-12Z',g('cape'),g('gold'),1)+'</g>';
 }else if(l.outfit==='bard'){
  sleeves=puff(110,202,1)+puff(208,201,-1);
  bodice=p('M125 190 145 193 160 211 178 192 192 192 191 225 185 260 133 263 124 224Z',g('petal'))+p('M145 201 158 222 175 200 170 254 156 268 145 251Z',g('ruffle'),g('gold'),1.3)+p('M148 223 169 229M149 234 167 241M153 248l12 4','none',t(c,-.18),1.6);
  skirt=p('M132 256Q109 269 79 296Q87 309 102 303Q109 320 128 308Q142 325 159 311Q179 328 195 311Q213 320 221 304Q240 310 247 296Q213 267 186 256Z',g('ruffle'),t(c,-.22),1.3)+p('M134 257 112 271 88 291Q104 304 119 292Q131 311 148 294Q162 310 177 295Q193 313 209 294Q221 302 237 290L187 257Z',g('silk'))+p('M88 291Q104 304 119 292Q131 311 148 294Q162 310 177 295Q193 313 209 294Q223 302 237 290','none',g('gold'),2.1)+p('M139 269 128 287M157 270v23M177 269l10 20M118 305l5 5M195 307l3 6','none',t(c,.68),2.6)+p('M202 276v17q-9-4-10 3q2 8 10 0v-15l9 3v10q-8-2-8 4q2 7 9 0v-20Z',g('gold'),'none',0);
 }else{
  sleeves=p('M98 194Q112 183 124 196L123 217 108 224 96 216Z',g('silk'))+p('M194 194Q208 184 220 199L220 216 205 224 192 214Z',g('silk'))+p('M100 213 110 219 122 212M196 211 207 219 218 212','none',g('ruffle'),4.5);
  bodice=p('M126 191 155 201 188 191 198 205 187 261 132 263 119 212Z',g('silk'))+p('M131 194 155 209 143 233 130 219ZM186 194 162 210 174 234 189 217Z',g('ruffle'),g('gold'),1.2)+p('M157 214 162 260','none',g('gold'),1.5)+[233,246].map(y=>'<circle cx="168" cy="'+y+'" r="2.7" fill="'+g('gold')+'"/>').join('');
  skirt=p('M132 256Q110 280 105 326L130 340 150 321 161 282 173 322 198 340 223 327Q212 280 186 255Z',g('silk'))+p('M131 263 118 319 133 330 151 309 157 270M181 266 194 309 210 322 197 329 174 310 164 269',g('cape'),g('gold'),1.3)+p('M147 274h31l7 42q-20 10-42 0Z',g('ruffle'),t(c,-.2),1.2)+p('M155 287h16v14h-16Z',g('silk'),g('gold'),1)+p('M190 276h10v8l4 13q-7 10-15 0l2-13Z',magic,g('gold'),1.2)+p('M191 276h9','none',gold,4);
 }
 // A selectable pattern remains visible even with no cape. Marking locations
 // follow the fairy skirt rather than the old panther tabard.
 let pattern='';const marks=l.outfit==='scholar'?[[127,316,.42],[194,318,.42]]:l.outfit==='ranger'?[[136,285,.36],[186,282,.38]]:l.outfit==='alchemist'?[[124,309,.36],[202,308,.36]]:l.outfit==='knight'?[[139,285,.33],[185,287,.33]]:l.outfit==='bard'?[[132,284,.38],[184,285,.38],[158,299,.25]]:[[130,288,.43],[191,294,.42],[154,322,.36]];
 for(const[x,y,z]of marks){if(l.pattern==='paws')pattern+=pantherPaw(x,y,z,t(c,.83));if(l.pattern==='stars')pattern+=star(x,y,z*1.2,'#fff2bf')+star(x+10,y+8,z*.45,g('gold'));if(l.pattern==='runes')pattern+=p('M'+x+' '+(y-7)+'l-5 7 5 8 5-8Z M'+x+' '+(y-7)+'v15','none',t(c,.83),1.45)}
 let belt=L.belt;if(l.belt==='sash')belt+=bow(188,267,.63);
 const neckline=p('M130 183Q143 181 157 195Q175 180 189 181L192 193Q180 191 174 202L158 208 142 202Q135 191 126 194Z',g('ruffle'),t(c,-.22),1.15)+p('M133 188 155 201 183 187','none',g('cape'),4)+p('M132 185q6-7 10 3q6-5 10 7M168 195q7-11 12-8q4-7 8-4','none','#fff4e3',1.55);
 // A small flower comb decorates the fairy without replacing the chosen hair.
 let flowers='';if(l.hood==='none'){
  for(const[x,y,z]of [[119,86,1],[108,97,.7],[132,79,.63]]){
   flowers+='<g transform="translate('+x+' '+y+') scale('+z+')">';
   for(let a=0;a<360;a+=72)flowers+='<ellipse cx="0" cy="-5" rx="3.3" ry="5.5" transform="rotate('+a+')" fill="'+t(c,.55)+'" stroke="'+t(c,-.1)+'" stroke-width=".6"/>';
   flowers+='<circle r="2.5" fill="'+g('gold')+'"/></g>';
  }
 }
 // The party dress has a rounded, generous tulle silhouette below the belt.
 if(l.outfit==='mage'){skirt='<g class="fairy-poofy-dress" transform="translate(160 0) scale(1.2 1) translate(-160 0)">'+skirt+'</g>';pattern='<g transform="translate(160 0) scale(1.2 1) translate(-160 0)">'+pattern+'</g>'}
 const skirtAngle=pose==='cast'?-3:pose==='victory'?-5:pose==='hit'?3:0;
 const leftAngle=pose==='cast'?-12:pose==='victory'?-20:pose==='hit'?6:0;
 const label=L.label?'<text x="160" y="418" text-anchor="middle" fill="#34534c" font-size="12" font-weight="800">PANTHER FAIRY</text>':'';
 return heroComposeRig(l,{id,pose,fairy:true},{defs:L.defs+defs,wings:renderHeroWings(l,id),cape:L.wavingCape,hairBack:L.hairBack,legs:renderHeroLegs(l,id),torso:bodice,sleeves,arms,outfit:'',fabricDepth:'',pattern:'',tailoring:heroTailoring(l,id,true),shoulders:L.shoulders,belt,accessory:L.accessory,neck:L.neck,head:L.head,collar:neckline,frontLocks:L.frontLocks,brooch:L.brooch,weapon:L.weapon,leftHand:L.leftHand,rightHand:L.rightHand,gloves:L.gloves,magicAccents:L.magicAccents,label,skirt:'<g class="fairy-skirt">'+skirt+pattern+'</g>',flowers});
}

/* FAIRY_ART_END */
