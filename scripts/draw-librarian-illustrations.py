"""Original layered guardian, shelf/foreground accents and three book poses.
Painted environment is an original image_gen asset; see librarian/art-manifest.json.
"""
from pathlib import Path
import math
root=Path(__file__).resolve().parents[1]/'librarian'
head='''<svg xmlns="http://www.w3.org/2000/svg" width="520" height="680" viewBox="0 0 260 340" class="lib-guardian-art" role="img" aria-label="The Librarian"><defs>
<linearGradient id="lg-velvet" x2="1" y2=".7"><stop stop-color="#8e71a0"/><stop offset=".3" stop-color="#48365f"/><stop offset=".63" stop-color="#302846"/><stop offset="1" stop-color="#76618c"/></linearGradient>
<linearGradient id="lg-silk" x2=".7" y2="1"><stop stop-color="#cf9d93"/><stop offset=".4" stop-color="#947080"/><stop offset="1" stop-color="#4d405c"/></linearGradient>
<linearGradient id="lg-gold" x2=".8" y2="1"><stop stop-color="#fff0c2"/><stop offset=".3" stop-color="#d3b27a"/><stop offset=".52" stop-color="#8d7054"/><stop offset=".8" stop-color="#eed39f"/><stop offset="1" stop-color="#9d7b55"/></linearGradient>
<linearGradient id="lg-hair" x2="1" y2=".3"><stop stop-color="#eeebdf"/><stop offset=".35" stop-color="#bbc6d5"/><stop offset=".65" stop-color="#8f9db8"/><stop offset="1" stop-color="#e8e2df"/></linearGradient>
<linearGradient id="lg-skin" x2="1" y2=".4"><stop stop-color="#f4d6b8"/><stop offset=".6" stop-color="#dfb59f"/><stop offset="1" stop-color="#b98886"/></linearGradient>
<radialGradient id="lg-magic"><stop stop-color="#fff3d4"/><stop offset=".4" stop-color="#b8b5ee" stop-opacity=".8"/><stop offset="1" stop-color="#aa7adb" stop-opacity="0"/></radialGradient>
</defs><g stroke-linejoin="round" stroke-linecap="round">
<ellipse cx="130" cy="322" rx="77" ry="9" fill="#111b34" opacity=".45"/>
<!-- Silver braids, velvet mantle, a pleated skirt and individually engraved trim. -->
<path d="M83 64Q69 33 96 23Q139 4 166 30Q197 46 174 84L177 135 81 133Z" fill="url(#lg-hair)" stroke="#758199" stroke-width="2.5"/>
<path d="M90 138Q50 171 32 310Q130 337 228 310Q213 171 170 138Z" fill="url(#lg-velvet)" stroke="#c6b28c" stroke-width="3"/>
<path d="M120 158 105 315H157L143 158Z" fill="url(#lg-silk)" stroke="#d8be8c" stroke-width="1.5"/>
<path d="M76 173Q68 235 55 309M94 176Q88 255 83 317M167 177Q172 259 181 317M184 174Q197 245 206 310" fill="none" stroke="#b1a1be" stroke-opacity=".35" stroke-width="2"/>
<path d="M51 304Q129 327 210 305M47 310Q129 334 215 310" fill="none" stroke="url(#lg-gold)" stroke-width="2"/>
<path d="M90 141 120 154 130 196 105 179 85 154ZM170 141 141 154 130 196 158 179 176 154Z" fill="#304254" stroke="url(#lg-gold)" stroke-width="2"/>
<path d="M109 130V151L130 169 152 149V129" fill="url(#lg-skin)" stroke="#b0887b" stroke-width="1.5"/>
<path d="M105 143 130 156 155 143 151 155 130 175 109 155Z" fill="#e3dbc8" stroke="#aa9778" stroke-width="1.5"/>
<path d="M113 149 118 158M120 152 125 164M133 165 139 154M142 159 147 150" stroke="#9e8c7e" fill="none"/>
<path d="M94 211Q130 223 166 211L168 221Q130 234 92 221Z" fill="url(#lg-gold)" stroke="#7e6550" stroke-width="1.5"/>
<path d="M119 215 130 208 142 216 130 231Z" fill="#a5b9bc" stroke="#eddbac" stroke-width="1.5"/>
<path d="M123 218 130 214 137 218 130 225Z" fill="#dae6d4"/>
'''
parts=[head]
for side in [-1,1]:
 parts.append(f'''<g transform="translate(130 169) scale({side} 1)"><g class="lg-arm lg-arm-{'left' if side==-1 else 'right'}">
<path d="M26-15Q54-33 66-7L82 25 68 43Q40 20 25 2Z" fill="url(#lg-velvet)" stroke="#ceb88d" stroke-width="2.2"/>
<path d="M67 25 84 17 91 31 74 44Z" fill="#e5d9c4" stroke="#ad967c" stroke-width="1.5"/>
<path d="M77 23Q79 5 89 0Q99-9 102-2L95 12Q114 3 117 13Q120 22 94 31L84 34Z" fill="url(#lg-skin)" stroke="#aa7d77" stroke-width="1.5"/>
<path d="M88 19 97 13M91 24l11-7M43-12Q50 12 66 24" fill="none" stroke="#e6c6ad" stroke-width="1.2"/>
</g></g>''')
parts.append('''<g class="lg-head" transform="translate(130 91)">
<path d="M-42-18Q-48 13-27 36Q0 58 30 33Q48 8 40-19Z" fill="url(#lg-skin)" stroke="#ac8680" stroke-width="2"/>
<path d="M-47-12Q-53-48-17-53Q18-62 40-37L49-9Q30-10 17-32Q-7-13-47-12Z" fill="url(#lg-hair)" stroke="#8492a9" stroke-width="2"/>
<path d="M-40-23Q-20-26-8-40M-37-30Q-20-34-16-44M9-43Q27-35 33-20M22-44Q37-31 41-15" fill="none" stroke="#f7f2e4" stroke-width="1.5"/>
<path d="M-45-3Q-55 20-38 41M44-3Q55 22 37 43" fill="none" stroke="url(#lg-hair)" stroke-width="9"/>
<g fill="#c4ae85" stroke="#7b6e65"><circle cx="-42" cy="28" r="4"/><circle cx="42" cy="28" r="4"/></g>
<path d="M-3 2-7 15 2 16" fill="none" stroke="#b38c80" stroke-width="1.3"/>
<g class="lg-face lg-face-curious"><path d="M-31-4q10-9 20-3M11-7q11-5 20 2" fill="none" stroke="#5d5364" stroke-width="2.5"/><ellipse cx="-20" cy="6" rx="4" ry="5" fill="#35495f"/><ellipse cx="21" cy="6" rx="4" ry="5" fill="#35495f"/><path d="M-8 28q9 4 17-2" fill="none" stroke="#9e6471" stroke-width="2"/></g>
<g class="lg-face lg-face-impressed"><path d="M-31-8q10-7 20-2M11-10q11-6 20 2" fill="none" stroke="#5d5364" stroke-width="2.5"/><ellipse cx="-20" cy="5" rx="4" ry="6" fill="#35495f"/><ellipse cx="21" cy="5" rx="4" ry="6" fill="#35495f"/><path d="M-12 24Q0 39 14 23Q1 29-12 24Z" fill="#fff0d7" stroke="#9e6471" stroke-width="1.5"/></g>
<g class="lg-face lg-face-preparing"><path d="M-31-3l20-2M11-5l20 2" stroke="#5d5364" stroke-width="3"/><circle cx="-20" cy="6" r="4" fill="#35495f"/><circle cx="21" cy="6" r="4" fill="#35495f"/><path d="M-9 27q9-6 18 0" fill="none" stroke="#9e6471" stroke-width="2"/></g>
<g class="lg-face lg-face-casting"><path d="M-31-2l20 3M11 1l20-4" stroke="#5d5364" stroke-width="3"/><circle cx="-19" cy="7" r="4" fill="#35495f"/><circle cx="20" cy="7" r="4" fill="#35495f"/><ellipse cy="27" rx="7" ry="5" fill="#9e6471"/></g>
<g class="lg-face lg-face-frustrated"><path d="M-32-8l22 8M11-1l21-9M-27 6l12 4M15 10l12-4" stroke="#5d5364" stroke-width="2.7"/><path d="M-11 27q11-9 22 0" fill="none" stroke="#9e6471" stroke-width="2.5"/></g>
<g class="lg-face lg-face-satisfied"><path d="M-30-6q10-6 19 0M11-6q10-6 19 0M-27 7q7 6 14 0M14 7q7 6 14 0" fill="none" stroke="#5d5364" stroke-width="2.4"/><path d="M-12 25q13 11 25-1" fill="none" stroke="#9e6471" stroke-width="2.5"/></g>
<!-- Fine brass spectacles stay constant across expressions. -->
<g fill="none" stroke="url(#lg-gold)" stroke-width="2"><ellipse cx="-21" cy="8" rx="14" ry="12"/><ellipse cx="21" cy="8" rx="14" ry="12"/><path d="M-7 7Q0 2 7 7M-35 5-44 0M35 5 44 0"/></g>
<path d="M-31 1l9-2M13 1l9-2" stroke="#fff9e3" stroke-width="1.1" opacity=".7"/>
</g>
<g class="lg-floating-book" transform="translate(130 187)"><path d="M-37-4Q-17-13 0-4Q17-13 37-4L32 26Q15 18 0 26Q-15 18-32 26Z" fill="#d7b995" stroke="#f7e5b6" stroke-width="2"/><path d="M-34-7Q-16-15 0-6V22Q-15 14-34 23ZM0-6Q16-15 34-7V23Q15 14 0 22Z" fill="#f2e7c9" stroke="#b49b72" stroke-width="1.5"/><path d="M-27-1-6 2M-26 5-6 8M7 2 27-1M7 8l19-3" stroke="#9b8791" stroke-width="1.2"/></g>
<circle class="lg-spell-aura" cx="219" cy="155" r="30" fill="url(#lg-magic)"/>
<path class="lg-cast-rune" d="M218 137 222 150 235 155 222 160 218 174 214 160 201 155 214 150Z" fill="#e8dcff" stroke="#a69bd3" stroke-width="1.5"/>
''')
for x,y in [(75,250),(177,250),(64,285),(190,285)]:
 parts.append(f'<path d="M{x} {y-8}l3 5 5 3-5 3-3 5-3-5-5-3 5-3Z" fill="none" stroke="#bba37d" stroke-width="1"/>')
parts.append('</g></svg>\n');(root/'librarian-guardian.svg').write_text(''.join(parts))
# Each independently illustrated book keeps its visible cover within the unchanged hitbox.
for frame in range(3):
 bend=[0,5,-4][frame]
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="240" height="168" viewBox="0 0 120 84"><defs><linearGradient id="book-leather" x2="1" y2=".7"><stop stop-color="#bc867e"/><stop offset=".38" stop-color="#694465"/><stop offset="1" stop-color="#2b294b"/></linearGradient><linearGradient id="book-paper" x2=".2" y2="1"><stop stop-color="#fff4d5"/><stop offset="1" stop-color="#cfb18d"/></linearGradient></defs><g stroke-linecap="round" stroke-linejoin="round">
<path d="M13 18Q37 8 59 21Q83 8 107 18L104 66Q82 57 60 69Q37 57 16 66Z" fill="url(#book-leather)" stroke="#edcd91" stroke-width="3"/>
<path d="M18 21Q38 15 58 25V62Q39 52 21 60ZM62 25Q82 15 102 21L100 60Q82 52 62 62Z" fill="url(#book-paper)" stroke="#b6a17e" stroke-width="1.3"/>
<path d="M24 28Q39 {23+bend} 56 29V57Q38 48 25 53ZM64 29Q82 {23-bend} 96 28L95 53Q82 48 64 57Z" fill="#fbefd1" stroke="#d2b68f" stroke-width="1.2"/>
<path d="M28 33Q42 29 53 35M28 39Q42 35 53 41M29 45Q42 41 53 47M67 35Q81 29 93 33M67 41Q81 35 92 39M67 47Q81 41 92 45" fill="none" stroke="#aa8d8b" stroke-width="1.1"/>
<path d="M59 22V65M16 23 24 19M98 19 105 23M19 59l7 2M97 61l7-2" fill="none" stroke="#edcc8e" stroke-width="2"/>
<path d="M37 37 41 30 45 37 41 44ZM79 36l5-6 5 6-5 6Z" fill="#c5aa83" stroke="#a38f85" stroke-width=".8"/>
<path d="M57 64 54 77 60 73 65 77 63 64Z" fill="#b1728d" stroke="#e2c497" stroke-width="1.2"/>
</g></svg>'''
 (root/('enchanted-book.svg' if frame==0 else f'enchanted-book-{frame}.svg')).write_text(svg)
# Foreground stone carving is safely below the FLOOR=405 collision baseline.
fg=['<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="920" viewBox="0 0 960 460"><g fill="none" stroke="#b7a18c" stroke-opacity=".3" stroke-width="1.2"><path d="M0 410H960M0 414H960"/>']
for x in range(0,960,80):fg.append(f'<path d="M{x+8} 460V443Q{x+40} 415 {x+72} 443V460M{x+18} 460V447Q{x+40} 427 {x+62} 447V460"/>')
fg.append('</g></svg>');(root/'library-foreground.svg').write_text(''.join(fg))
print('Drew original expressive guardian, three book page poses and safe foreground carving.')
