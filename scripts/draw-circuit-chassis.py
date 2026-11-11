"""Original engraved electrical workbench; layered SVG, no external images."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
p = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1000" viewBox="0 0 720 500" class="sl-equipment sl-machine-circuit cc-machine" role="img" aria-label="Circuit Constructor">
<defs>
 <linearGradient id="__CC__-brass" x2=".8" y2="1"><stop stop-color="#fff1b7"/><stop offset=".2" stop-color="#dcb064"/><stop offset=".43" stop-color="#82502d"/><stop offset=".6" stop-color="#edce87"/><stop offset="1" stop-color="#775032"/></linearGradient>
 <linearGradient id="__CC__-copper" x2="1" y2=".7"><stop stop-color="#edbf94"/><stop offset=".3" stop-color="#b56f48"/><stop offset=".55" stop-color="#674039"/><stop offset=".8" stop-color="#da9c6c"/><stop offset="1" stop-color="#7d4d39"/></linearGradient>
 <linearGradient id="__CC__-wood" x2=".15" y2="1"><stop stop-color="#845137"/><stop offset=".45" stop-color="#46392f"/><stop offset="1" stop-color="#231f29"/></linearGradient>
 <linearGradient id="__CC__-enamel" x2="1" y2=".8"><stop stop-color="#39636b"/><stop offset=".5" stop-color="#142f3d"/><stop offset="1" stop-color="#315660"/></linearGradient>
 <linearGradient id="__CC__-glass" x2="1" y2=".15"><stop stop-color="#e0fcf2" stop-opacity=".48"/><stop offset=".2" stop-color="#d3eeeb" stop-opacity=".08"/><stop offset=".73" stop-color="#e9fcf2" stop-opacity=".12"/><stop offset=".91" stop-color="#fff8d5" stop-opacity=".58"/><stop offset="1" stop-color="#8acbd1" stop-opacity=".18"/></linearGradient>
 <radialGradient id="__CC__-glow"><stop stop-color="#fff9b4" stop-opacity=".8"/><stop offset=".35" stop-color="#ffd885" stop-opacity=".35"/><stop offset="1" stop-color="#efb358" stop-opacity="0"/></radialGradient>
 <filter id="__CC__-halo" x="-.6" y="-.6" width="2.2" height="2.2"><feGaussianBlur stdDeviation="5"/></filter>
</defs>
<g class="cc-chassis" stroke-linecap="round" stroke-linejoin="round">
 <ellipse cx="360" cy="466" rx="288" ry="16" fill="#091d2a" opacity=".5"/>
 <!-- Carved oak cabinet, copper bevel, enamel inset and engraved sunburst. -->
 <path d="M72 426V114Q72 65 124 62H226Q360-5 494 62H596Q648 65 648 114V426Z" fill="url(#__CC__-wood)" stroke="#3f2d29" stroke-width="7"/>
 <path d="M85 422V116Q85 80 126 77H229Q360 10 491 77H594Q635 80 635 116V422Z" fill="url(#__CC__-brass)" stroke="#eac98a" stroke-width="2"/>
 <path d="M100 410V117Q100 94 130 94H234Q360 31 486 94H590Q620 94 620 117V410Z" fill="url(#__CC__-enamel)" stroke="#553f32" stroke-width="3"/>
 <path d="M110 401V119Q110 105 132 105H237Q360 47 483 105H588Q610 105 610 119V401" fill="none" stroke="#8e9a7e" stroke-opacity=".5"/>
 <path d="M288 75Q360 29 432 75M295 79Q360 42 425 79" fill="none" stroke="#f4d79c" stroke-width="1.5"/>
 <path d="M343 58 360 42 377 58 360 53Z" fill="#e7ce8d"/>
 <path d="M78 357q-28-20-35 4q-6 19 18 30q25 15 9 31q-15 8-22-5q16 6 16-3q-2-11-20-18q-31-15-15-44q18-28 49-7M642 357q28-20 35 4q6 19-18 30q-25 15-9 31q15 8 22-5q-16 6-16-3q2-11 20-18q31-15 15-44q-18-28-49-7" fill="url(#__CC__-copper)" stroke="#d4ad76" stroke-width="1.5"/>
 <path d="M60 425H660L673 442Q360 482 47 442Z" fill="url(#__CC__-wood)" stroke="#ad7b4c" stroke-width="4"/>
 <path d="M58 434Q360 467 662 434L659 445Q360 479 61 445Z" fill="url(#__CC__-copper)" stroke="#f0cd90" stroke-width="2"/>
 <path d="M112 451 100 475H159L173 457M547 457 561 475H620L608 451" fill="url(#__CC__-brass)" stroke="#64452f" stroke-width="3"/>
 <path d="M312 449 327 439H393L408 449 393 463H327Z" fill="url(#__CC__-brass)" stroke="#593e2e" stroke-width="2"/>
 <text x="360" y="455" text-anchor="middle" fill="#4d3b2b" font-family="Georgia,serif" font-size="10" letter-spacing="3">F · W</text>
 <!-- Real circuit topology: battery + / switch / lamp / series ammeter / battery −. -->
 <g fill="none" stroke="#9cae9b" stroke-width="2" stroke-dasharray="3 7" opacity=".45">
  <path d="M130 250V140H240M345 140H450V350H383M337 350V385H500M580 385V417H190V250"/>
 </g>
 <g fill="#d0ded0" opacity=".65" font-family="Georgia,serif" text-anchor="middle" font-size="10" letter-spacing="1.5">
  <text x="161" y="215">CELL</text><text x="292" y="111">SWITCH</text><text x="360" y="198">LAMP</text><text x="541" y="312">AMMETER</text>
 </g>
''']
# Deliberate engraving, corner flowers, wood grain and slotted fasteners.
for x, y in [(94,116),(626,116),(94,390),(626,390),(134,441),(586,441)]:
    p.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#efcc8e" stroke="#62442e" stroke-width="1.3"/><path d="M{x-2} {y+2}l4-4" stroke="#765233" stroke-width="1.4"/>')
for x, s in [(120,1),(600,-1)]:
    p.append(f'<g transform="translate({x} 122) scale({s} 1)" fill="none" stroke="#cfb67e" stroke-width="1" opacity=".65"><path d="M0 48V7Q0-5 12 0Q23 8 10 16Q5 18 5 12M0 30Q15 20 19 31Q23 42 9 40M0 45Q14 37 21 49"/></g>')
for i in range(9):
    p.append(f'<path d="M{110+i*63} 451q15 5 30 2m-18 4 19 1" fill="none" stroke="#dfa775" opacity=".22"/>')
p.append('</g>\n<!-- CIRCUIT_LAYERS -->\n</svg>\n')
(root/'assets/science-lab/circuit-constructor-chassis.svg').write_text(''.join(p))
print('Drew the engraved Circuit Constructor cabinet.')
