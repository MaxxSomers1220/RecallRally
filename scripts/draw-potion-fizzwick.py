"""Illustration pass on Fizzwick's established design, only for Potion Mixer."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'assets/science-lab/professor-fizzwick.svg').read_text()
s=s.replace('class="sl-fizzwick"','class="sl-fizzwick pm-fizzwick"').replace('id="fizz-','id="pmf-').replace('#fizz-','#pmf-')
s=s.replace('</defs>','''<radialGradient id="pmf-skin" cx=".3" cy=".3" r=".8"><stop stop-color="#ffe0b7"/><stop offset=".6" stop-color="#e4b18c"/><stop offset="1" stop-color="#bd816c"/></radialGradient>
<linearGradient id="pmf-lens" x2="1" y2="1"><stop stop-color="#f3ffe8"/><stop offset=".32" stop-color="#b8dedd"/><stop offset=".7" stop-color="#689eac"/><stop offset="1" stop-color="#d2f1df"/></linearGradient>
<linearGradient id="pmf-gold" x2=".8" y2="1"><stop stop-color="#fff0b7"/><stop offset=".4" stop-color="#b98c4d"/><stop offset=".65" stop-color="#eccb87"/><stop offset="1" stop-color="#8d623a"/></linearGradient></defs>''')
s=s.replace('fill="#e8be98"','fill="url(#pmf-skin)"').replace('fill="#d6b578"','fill="url(#pmf-gold)"').replace('fill="#c2e6de"','fill="url(#pmf-lens)"')
s=s.replace(' <path class="fizz-hand"',''' <path d="M71 139Q65 171 56 222L78 229 82 187 92 157M142 143 151 166 168 216 155 226 138 180" fill="#8a8190" fill-opacity=".22" stroke="none"/>
 <path d="M66 207h20v23H64ZM129 195h16v18h-15Z" fill="#dcc49d" stroke="#a28a70" stroke-width="1.3"/>
 <path d="M68 210h15M131 198h12M63 240Q113 254 163 237" fill="none" stroke="#fff3cb" stroke-width="1.4"/>
 <path d="M76 219h5v7h-5Z" fill="#74bdb3" stroke="#4b7d80" stroke-width="1"/>
 <path class="fizz-hand"''')
s=s.replace(' <path d="M53 85H166"',''' <path d="M39 64 52 70M54 42 68 55M85 30 96 48M123 28 132 48M159 48 151 63M174 65 161 77" fill="none" stroke="#fffbed" stroke-width="2"/>
 <path d="M45 81 53 89M66 47 73 57M142 30 141 47M170 52 158 63" fill="none" stroke="#8c9daf" stroke-width="1.4"/>
 <path d="M53 85H166"''')
s=s.replace(' <g class="fizz-calm">',''' <g class="pmf-goggle-engraving" fill="none" stroke="#f8df9e" stroke-width="1"><circle cx="83" cy="88" r="20"/><circle cx="137" cy="88" r="20"/><path d="M65 79l3 1M63 88h4M65 97l3-1M152 79l3-1M153 88h5M151 98l4 1"/></g>
 <g class="fizz-calm">''',1)
s=s.replace('<g class="fizz-calm"><path d="M75 90Q83 82 91 90M129 90Q137 82 145 90" stroke="#35445e" fill="none"/></g>', '<g class="fizz-calm"><ellipse cx="83" cy="88" rx="9" ry="7" fill="#edf4dc" stroke="#567784" stroke-width="1.5"/><ellipse cx="137" cy="88" rx="9" ry="7" fill="#edf4dc" stroke="#567784" stroke-width="1.5"/><ellipse cx="80" cy="88" rx="3.5" ry="5" fill="#3d5969" stroke="none"/><ellipse cx="134" cy="88" rx="3.5" ry="5" fill="#3d5969" stroke="none"/><path d="M74 77q8-7 17-3M129 76q8-3 16 2" fill="none" stroke="#f8eacd" stroke-width="2"/></g>')
s=s.replace(' <path d="M105 94', ''' <g class="fizz-excited"><path d="M74 89q9-17 18 0M128 89q9-17 18 0" fill="none" stroke="#35445e" stroke-width="3"/></g>
 <g class="fizz-celebrate"><path d="M73 91q10-19 20 0M127 91q10-19 20 0" fill="none" stroke="#35445e" stroke-width="3.5"/><path d="M73 98l4 1M143 98l4-1" stroke="#ecb080" stroke-width="2"/></g>
 <path d="M105 94''')
s=s.replace(' <path class="fizz-calm" d="M101 133', ''' <path class="fizz-excited" d="M99 132Q111 149 127 131Q112 141 99 132Z" fill="#79515b" stroke-width="1.5"/>
 <path class="fizz-celebrate" d="M98 132Q111 153 128 131Q113 139 98 132Z" fill="#79515b" stroke-width="1.5"/>
 <path class="fizz-calm" d="M101 133''')
s=s.replace(' <path d="M78 59', ''' <path d="M68 82q4-8 12-8M123 82q4-8 12-8" fill="none" stroke="#fffce2" stroke-width="2" opacity=".8"/>
 <path d="M70 123q10-7 20-4M120 121q12-5 25 0M76 129l12 1M127 129l14-1" fill="none" stroke="#fffbe6" stroke-width="1.3"/>
 <path d="M78 59''')
(root/'assets/science-lab/professor-fizzwick-potion.svg').write_text(s)
print('Drew Potion Mixer Fizzwick: engraved goggles, shaded coat, four expression layers.')
