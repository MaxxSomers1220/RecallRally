"""Original layered vector illustration for Recall Rally; no external assets."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parts = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1000" viewBox="0 0 720 500" class="sl-equipment sl-machine-potion pm-machine" role="img" aria-label="Potion Mixer">
<defs>
 <linearGradient id="__PM__-brass" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff0b0"/><stop offset=".22" stop-color="#d9ae60"/><stop offset=".45" stop-color="#8e5a30"/><stop offset=".63" stop-color="#e7c47c"/><stop offset="1" stop-color="#6c422d"/></linearGradient>
 <linearGradient id="__PM__-copper" x1="0" y1="0" x2=".9" y2=".8"><stop stop-color="#fbc7a0"/><stop offset=".2" stop-color="#be6e45"/><stop offset=".52" stop-color="#743f35"/><stop offset=".78" stop-color="#dc9a64"/><stop offset="1" stop-color="#8d4b35"/></linearGradient>
 <linearGradient id="__PM__-enamel" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#244d58"/><stop offset=".45" stop-color="#142b38"/><stop offset="1" stop-color="#3b6370"/></linearGradient>
 <linearGradient id="__PM__-glass" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#d3f7eb" stop-opacity=".4"/><stop offset=".14" stop-color="#fff9dc" stop-opacity=".09"/><stop offset=".67" stop-color="#b2e7ea" stop-opacity=".06"/><stop offset=".91" stop-color="#f2ffef" stop-opacity=".48"/><stop offset="1" stop-color="#75b2c0" stop-opacity=".16"/></linearGradient>
 <linearGradient id="__PM__-wood" x2="0" y2="1"><stop stop-color="#60412f"/><stop offset=".45" stop-color="#302c31"/><stop offset="1" stop-color="#191f2b"/></linearGradient>
 <radialGradient id="__PM__-aura"><stop stop-color="#e8c87c" stop-opacity=".27"/><stop offset="1" stop-color="#8cbaac" stop-opacity="0"/></radialGradient>
 <radialGradient id="__PM__-lamp"><stop stop-color="#fff9c0"/><stop offset=".5" stop-color="#f2bd63"/><stop offset="1" stop-color="#b26935"/></radialGradient>
 <filter id="__PM__-halo" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="7"/></filter>
</defs>
<g class="pm-chassis" stroke-linejoin="round" stroke-linecap="round">
 <ellipse cx="360" cy="277" rx="328" ry="206" fill="url(#__PM__-aura)"/>
 <ellipse cx="360" cy="470" rx="281" ry="14" fill="#091b25" opacity=".46"/>
 <!-- Curved, engraved copper backplate and five carved instrument cradles. -->
 <path d="M54 191V82Q54 39 100 35Q219 12 360 30Q501 12 620 35Q666 39 666 82V191L647 205V94Q647 64 617 61Q498 40 360 56Q222 40 103 61Q73 64 73 94V205Z" fill="url(#__PM__-copper)" stroke="#53372f" stroke-width="3"/>
 <path d="M64 165V81Q65 48 103 46Q226 25 360 42Q494 25 617 46Q655 48 656 81V165" fill="none" stroke="#f3cc93" stroke-width="2"/>
 <path d="M80 66Q130 41 177 51M543 51Q590 41 640 66M327 42Q360 18 393 42" fill="none" stroke="#5e3c31" stroke-width="3"/>
 <path d="M334 36 346 28 360 34 374 28 386 36M350 37 360 29 370 37" fill="none" stroke="#efc87e" stroke-width="1.5"/>
 <g fill="#ecce89" stroke="#69462d" stroke-width="1.4">
  <path d="M60 148q-23-13-27 7q-3 18 17 26q22 10 13 26q-12 12-19-1q12 3 11-6q-4-11-18-15q-28-15-16-40q16-24 39-9Z"/>
  <path d="M660 148q23-13 27 7q3 18-17 26q-22 10-13 26q12 12 19-1q-12 3-11-6q4-11 18-15q28-15 16-40q-16-24-39-9Z"/>
 </g>
''']

for i, x in enumerate([100, 230, 360, 490, 620]):
    y = 174
    parts.append(f'''<g data-potion-cradle="{i+1}">
 <path d="M{x-47} {y-38}Q{x-43} {y+14} {x} {y+18}Q{x+43} {y+14} {x+47} {y-38}L{x+37} {y-36}Q{x+34} {y+3} {x} {y+6}Q{x-34} {y+3} {x-37} {y-36}Z" fill="url(#__PM__-brass)" stroke="#593b2a" stroke-width="2"/>
 <path d="M{x-38} {y-14}Q{x} {y+22} {x+38} {y-14}M{x-30} {y-10}Q{x} {y+12} {x+30} {y-10}" fill="none" stroke="#f3da9e" stroke-width="1.3"/>
 <path d="M{x-14} {y+11}L{x-18} {y+27}H{x+18}L{x+14} {y+11}Z" fill="url(#__PM__-copper)" stroke="#5b382d" stroke-width="2"/>
 <circle cx="{x}" cy="{y+18}" r="4" fill="#f7d18a" stroke="#705133"/>
 </g>''')

# Individually curved glass routes form a readable fan into the cauldron.
routes = ["M100 190V217Q100 239 125 239H213Q238 239 260 280",
          "M230 190V210Q230 230 253 230Q286 230 306 280",
          "M360 190V280",
          "M490 190V210Q490 230 467 230Q434 230 414 280",
          "M620 190V217Q620 239 595 239H507Q482 239 460 280"]
for i, d in enumerate(routes):
    parts.append(f'''<g class="pm-route" data-route="{i+1}" fill="none"><path d="{d}" stroke="#162d37" stroke-width="17"/><path d="{d}" stroke="#b4d5cc" stroke-opacity=".55" stroke-width="12"/><path d="{d}" stroke="#183945" stroke-width="7"/><path d="{d}" stroke="#f5f6d7" stroke-opacity=".5" stroke-width="1.4"/></g>''')

parts.append('''
 <!-- Engraved gauge, pressure relief and a hand-cranked mixing drive. -->
 <path d="M136 282V333Q136 350 171 350H207M584 282V333Q584 350 549 350H513" fill="none" stroke="#513b31" stroke-width="16"/>
 <path d="M136 282V333Q136 350 171 350H207M584 282V333Q584 350 549 350H513" fill="none" stroke="url(#__PM__-copper)" stroke-width="11"/>
 <g transform="translate(136 276)"><circle r="36" fill="url(#__PM__-brass)" stroke="#64442e" stroke-width="3"/><circle r="28" fill="#e8ddb6" stroke="#8d693f" stroke-width="2"/>
 <path d="M-23 1A23 23 0 0 1 23 1" fill="none" stroke="#6f9586" stroke-width="5"/><path d="M-23 1A23 23 0 0 1-11-20" fill="none" stroke="#a26f52" stroke-width="5"/>
 <g stroke="#685340" stroke-width="1.5"><path d="M-20 0h5M-17-12l4 3M-8-20l2 5M8-20l-2 5M17-12l-4 3M20 0h-5"/></g>
 <path d="M-13 17H13M-7 21H7" stroke="#907a58" stroke-width="1"/><text x="0" y="14" text-anchor="middle" font-size="6" letter-spacing="1" fill="#776044">PRESSURE</text>
 </g>
 <g transform="translate(584 276)"><path d="M-15-30Q0-43 15-30V20Q31 44 0 47Q-31 44-15 20Z" fill="url(#__PM__-brass)" stroke="#64442e" stroke-width="3"/><path d="M-7-27Q0-33 7-27V25A15 15 0 1 1-7 25Z" fill="#c7d9d0" stroke="#725f4b" stroke-width="2"/><path d="M1-21V26" stroke="#f9f3d7" stroke-width="2"/>
 <g stroke="#796447" stroke-width="1.3"><path d="M10-22h6M10-12h4M10-2h6M10 8h4M10 18h6"/></g></g>
 <!-- Wood-inlaid pedestal: substantial feet, bevels, rivets and curling brackets. -->
 <path d="M143 406Q360 384 577 406L598 441Q580 460 360 466Q140 460 122 441Z" fill="url(#__PM__-wood)" stroke="#9d7044" stroke-width="4"/>
 <path d="M139 420Q360 442 581 420L584 434Q360 457 136 434Z" fill="url(#__PM__-copper)" stroke="#e0b77a" stroke-width="2"/>
 <path d="M159 444 150 467 118 473 112 482H173L187 448M533 448 547 482H608L602 473 570 467 561 444" fill="url(#__PM__-brass)" stroke="#60442f" stroke-width="3"/>
 <path d="M224 432q-24 12-40 0q-15-14 0-20q13-3 12 8q-6-6-9 0q1 10 21 7M496 432q24 12 40 0q15-14 0-20q-13-3-12 8q6-6 9 0q-1 10-21 7" fill="none" stroke="#f1d496" stroke-width="2"/>
 <path d="M324 437 336 428H384L396 437 384 451H336Z" fill="url(#__PM__-brass)" stroke="#60442f" stroke-width="2"/><text x="360" y="443" text-anchor="middle" font-size="8" font-family="Georgia,serif" letter-spacing="2" fill="#513d2e">F · W</text>
''')
for x, y in [(68,91),(652,91),(68,124),(652,124),(157,432),(563,432),(199,440),(521,440)]:
    parts.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#eed49b" stroke="#68442f" stroke-width="1.2"/><path d="M{x-1.5} {y+1.5}l3-3" stroke="#7b5636" stroke-width="1.1"/>')
parts.append('</g>\n<!-- POTION_LAYERS -->\n</svg>\n')
(root/'assets/science-lab/potion-mixer-chassis.svg').write_text(''.join(parts))
print('Drew the original engraved copper chassis and five glass routes.')
