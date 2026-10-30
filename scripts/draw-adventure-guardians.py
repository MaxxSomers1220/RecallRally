#!/usr/bin/env python3
"""Original articulated vector illustrations. No third-party assets or fonts."""
from pathlib import Path
out=Path(__file__).resolve().parent.parent/'assets/adventure'
out.mkdir(parents=True,exist_ok=True)
colors=[('#db8749','#f4c986'),('#927356','#d9c9a4'),('#96654d','#dcb385'),('#9171ba','#d8bee4'),('#a482be','#e8c5d9'),('#8e80bd','#d3c9fa'),('#6a9a84','#b8d2a5'),('#4a9d9c','#bce3d2'),('#a8c3ae','#eef2d5'),('#a395c3','#efe2cb')]
for i,(base,light) in enumerate(colors):
 pre=f'g{i}'
 defs=f'''<defs><linearGradient id="{pre}-coat" x2=".8" y2="1"><stop stop-color="{light}"/><stop offset=".5" stop-color="{base}"/><stop offset="1" stop-color="#343d5c"/></linearGradient><linearGradient id="{pre}-gold" x2="1" y2="1"><stop stop-color="#fff2bc"/><stop offset=".45" stop-color="#d6ad65"/><stop offset="1" stop-color="#89603e"/></linearGradient><linearGradient id="{pre}-cream" x2=".3" y2="1"><stop stop-color="#fff2d7"/><stop offset="1" stop-color="{light}"/></linearGradient></defs>'''
 coat=f'url(#{pre}-coat)';gold=f'url(#{pre}-gold)';cream=f'url(#{pre}-cream)'
 tail='';wings='';body='';head='';arms='';prop=''
 # Every guardian has its own silhouette, materials, appendages and instrument.
 if i==0:
  tail=f'<path d="M27 45Q90 65 74 11Q69-7 56-14Q65 14 41 26Z" fill="{coat}"/><path d="M74 11Q69-7 56-14Q61 8 51 17L71 29Z" fill="{cream}"/>'
  body=f'<path d="M-24-12Q-43 25-31 65L-37 90H-12L-5 48 10 48 18 90H41L30 62Q41 25 25-12Z" fill="{coat}"/><path d="M-17-9-10 43H15L22-9" fill="#486b6a"/><path d="M-12-4V43M13-4V43" stroke="{gold}" stroke-width="3"/>'
  head=f'<path d="M-32-49-39-101-8-82Q7-88 17-81L43-101 34-48 23-24 0-17-27-28Z" fill="{coat}"/><path d="m-31-64-2-25 18 15m38 0 16-15-2 25" fill="#574052"/><path d="M-31-48Q-22-53 0-34Q24-53 33-48L21-25 0-17-25-29Z" fill="{cream}"/>'
  arms=f'<path d="M-24 2-44 31-60 13M26 3 46 25 58 7" fill="none" stroke="{base}" stroke-width="15"/>'
  prop=f'<g transform="translate(-59 6)"><path d="M0-35 20-23V0L0 13-20 0V-23Z" fill="#668c7f" stroke="{gold}" stroke-width="2"/><path d="M0-24 12-3H-12Z" fill="none" stroke="#f6df9b"/></g>'
 elif i==1:
  wings=f'<path d="M-30-10Q-75-19-70 44L-34 57M30-10Q75-19 70 44L34 57" fill="{coat}"/><path d="M-61 6-40 35M-65 23-43 44M61 6 40 35M65 23 43 44" stroke="{light}" stroke-width="3"/>'
  body=f'<path d="M-37-10Q-49 45-22 69L-20 85-34 91H-2L0 69 7 69 10 91H39L25 85 24 69Q49 45 37-10Z" fill="{coat}"/><ellipse cy="28" rx="27" ry="34" fill="{cream}"/>'
  head=f'<path d="M-38-39-42-90-18-82Q0-91 20-82L42-90 38-38 23-22H-22Z" fill="{coat}"/><path d="M-32-67Q-8-91 0-65Q10-91 33-67L28-40 0-28-28-40Z" fill="{cream}"/><path d="M-5-37 0-25 7-37" fill="{gold}"/>'
  prop=f'<path d="M-45 10Q-20 4 0 16Q20 4 45 10V45Q20 38 0 50Q-20 38-45 45Z" fill="#f3e5be" stroke="#b58d61" stroke-width="2"/><path d="M0 16V50M-34 20-10 25M-34 28-10 33M10 25 34 20M10 33 34 28" stroke="#8f8c79" stroke-width="2"/>'
 elif i==2:
  tail=f'<path d="M27 49Q71 65 69 25Q60 46 31 35" fill="{base}"/>'
  body=f'<path d="M-29-11Q-42 27-28 71L-32 89H-8L-3 58 7 58 13 89H40L29 70Q44 23 27-11Z" fill="{coat}"/><path d="M-27-10-11 37H18L29-10" fill="#385b74"/><path d="M-16-4-5 18 9 18 22-4" fill="#fff0cb"/>'
  head=f'<circle cx="-29" cy="-73" r="13" fill="{base}"/><circle cx="29" cy="-73" r="13" fill="{base}"/><path d="M-30-64Q-36-91 0-90Q36-91 30-64L27-34Q0-10-27-34Z" fill="{coat}"/><ellipse cy="-39" rx="24" ry="16" fill="{cream}"/><path d="M-39-81Q0-117 39-81L29-75H-29Z" fill="#294b64"/><path d="M-23-84H23" stroke="{gold}" stroke-width="4"/>'
  arms=f'<path d="M-28 3-47 26-54 8M28 3 45 30 55 17" fill="none" stroke="{base}" stroke-width="14"/>'
  prop=f'<g transform="translate(-56 4)"><circle r="18" fill="{gold}"/><circle r="13" fill="#f5e8c0"/><path d="M0-12 4 0 0 12-4 0Z" fill="#568f9b"/><path d="M-12 0H12" stroke="#8d7252"/></g>'
 elif i in (3,7):
  wings=f'<path d="M-22 8Q-83-28-67-66L-40-44-24-9M22 8Q83-28 67-66L40-44 24-9" fill="{coat}"/><path d="M-61-48-25-3M61-48 25-3" stroke="{light}" stroke-width="3"/>'
  tail=f'<path d="M24 39Q76 42 61 73Q44 92 30 75Q54 76 49 62Q44 53 22 56" fill="{coat}"/>'
  body=f'<path d="M-25-16Q-42 18-24 64L-30 88H-5L0 56 11 56 19 88H44L26 63Q45 17 25-16Z" fill="{coat}"/><path d="M-12-12Q-25 25-6 57H14Q27 24 14-12Z" fill="{cream}"/><path d="M-12 8H17M-14 22H19M-10 36H17" stroke="{base}" stroke-width="2"/>'
  head=f'<path d="M-29-50-34-88-13-78Q11-86 29-62L43-43 28-25-12-22-31-36Z" fill="{coat}"/><path d="m-29-81-13-26 26 19M15-80 29-103 31-72" fill="{gold}"/><path d="M-13-41Q9-54 32-43L28-26H-12Z" fill="{cream}"/><path d="M36-43 42-46" stroke="#2a3e51" stroke-width="3"/>'
  arms=f'<path d="M-26 2-44 26-51 10M26 2 43 24 50 12" stroke="{base}" stroke-width="13" fill="none"/>'
  prop=f'<path d="M-53 10Q-26-1 0 13Q26-1 53 10V48Q25 37 0 52Q-25 37-53 48Z" fill="#f3e9c8" stroke="{gold}" stroke-width="3"/><path d="M0 13V52M-40 19-13 23M-40 28-13 32M13 23 40 19M13 32 40 28" stroke="#8c9b9c" stroke-width="2"/>'
 elif i==4:
  wings=f'<path d="M-12-22Q-99-115-84-14Q-72 31-20 32Q-85 42-57 86Q-18 105 0 45Q18 105 57 86Q85 42 20 32Q72 31 84-14Q99-115 12-22Z" fill="{coat}"/><path d="M-19-16-64-53-57-9-22 20M19-16 64-53 57-9 22 20M-13 39-46 68M13 39 46 68" fill="none" stroke="{gold}" stroke-width="4"/><circle cx="-54" cy="-19" r="13" fill="#917399"/><circle cx="54" cy="-19" r="13" fill="#917399"/>'
  body=f'<path d="M-19-20Q-32 21-14 60L0 83 14 60Q32 21 19-20Z" fill="#3e465e"/><path d="M-20-7 0 18 20-7M0 18V64" fill="none" stroke="{gold}" stroke-width="3"/>'
  head=f'<path d="M-22-42Q-35-82 0-88Q35-82 22-42L14-27H-14Z" fill="{cream}"/><path d="M-13-84Q-14-102-29-107M13-84Q14-102 29-107" stroke="{gold}" stroke-width="3" fill="none"/>'
  arms=f'<path d="M-22-2-46 18-66-1M22-2 46 18 61-9" stroke="#3e465e" stroke-width="9" fill="none"/>'
  prop=f'<path d="M-66 0-78-39" stroke="{gold}" stroke-width="3"/>'
 elif i==5:
  tail=''
  body=f'<path d="M-32-8-47 29-27 50-23 90H-1L4 56 15 90H42L26 49 47 26 31-9 0-31Z" fill="{coat}"/><path d="M0-31V56M-32-8 26 49M31-9-27 50M-47 29 47 26" fill="none" stroke="#e5dbff" stroke-width="2"/><path d="M-18 3 0-9 18 3 16 28 0 39-16 28Z" fill="#fae2b2"/>'
  head=f'<path d="M0-103 29-84 37-50 16-25-20-25-37-50-28-84Z" fill="{coat}"/><path d="M0-103V-28M-28-84 37-50M29-84-37-50" stroke="#ede5ff" stroke-width="2" fill="none"/>'
  arms=f'<path d="M-33-1-60 12-65 46-45 39-40 18M33-1 60 12 65 46 45 39 40 18" fill="{coat}"/>'
  prop=f'<circle cy="16" r="10" fill="#fff1bb"/><path d="M0 5 9 16 0 26-9 16Z" fill="#c1a6f2"/>'
 elif i==6:
  body=f'<path d="M-35 36-42 84H-14L-6 47M35 36 42 84H14L6 47" fill="{base}"/><ellipse cy="17" rx="47" ry="48" fill="{coat}"/><circle cy="17" r="37" fill="{gold}"/><circle cy="17" r="29" fill="#415d63"/><g stroke="#e8ca87" stroke-width="5">'+''.join(f'<path d="M0-18V-8" transform="translate(0 17) rotate({k*30})"/>' for k in range(12))+'</g><path d="M0-5V17L15 26" stroke="#fff0bc" fill="none" stroke-width="3"/>'
  head=f'<path d="M-25-36V-71Q0-95 25-71V-36Q0-15-25-36Z" fill="{cream}"/><path d="M-32-71-21-91H22L32-71Z" fill="{gold}"/><circle cy="-85" r="8" fill="#526965"/>'
  arms=f'<path d="M-43-3-62 16-60 39M43-3 61 14 59 37" stroke="{base}" stroke-width="13" fill="none"/>'
  prop=f'<path d="M-63 29V8M-63 9-73-3-70-17-63-8-55-17-52-3-63 9" stroke="{gold}" stroke-width="5" fill="none"/>'
 elif i==8:
  wings=f'<path d="M-18 6Q-89-23-72-65Q-38-61-6-8M18 6Q89-23 72-65Q38-61 6-8" fill="#c5e7df"/><path d="M-67-53-14-3M67-53 14-3M-55-49-50-26M55-49 50-26" stroke="#709f9e" fill="none" stroke-width="2"/>'
  body=f'<path d="M-40 19-43 89H-26L-17 28M17 28 26 89H43L38 15" fill="{coat}"/><ellipse cy="16" rx="40" ry="28" fill="{cream}"/><path d="M-11 2-22-46Q0-74 25-46L27-5 9 29Z" fill="{cream}"/>'
  head=f'<path d="M-23-53-28-79-14-86Q5-91 23-75L29-50 17-30H-10Z" fill="{cream}"/><path d="m-23-78-17-18 22 6M22-76 36-97 34-74" fill="{base}"/><path d="M-16-86-25-111M-20-98-40-102M-25-108-16-118M16-85 26-113M21-99 40-106M25-110 18-120" stroke="{gold}" stroke-width="4" fill="none"/>'
  tail=f'<path d="M-39 7Q-61-13-52-27Q-37-18-28 8" fill="{cream}"/>'
 elif i==9:
  wings=f'<path d="M-14 2Q-90-11-79-75Q-35-62-4-19M14 2Q90-11 79-75Q35-62 4-19" fill="{coat}"/><path d="M-72-63-17-12M-70-45-23-3M-59-23-29 4M72-63 17-12M70-45 23-3M59-23 29 4" stroke="{cream}" stroke-width="4"/>'
  body=f'<ellipse cy="25" rx="31" ry="36" fill="{coat}"/><path d="M-25 44-36 89H-12L-3 56M25 44 36 89H12L3 56" fill="{cream}"/>'
  head=f'<path d="M-27-40Q-33-89 2-89Q35-86 30-41L17-17H-16Z" fill="{cream}"/><path d="M-25-71-28-94-11-82M22-76 37-94 31-60" fill="{light}"/><path d="M1-43 34-48 27-27 8-25Z" fill="{gold}"/><path d="M-21-86-25-109-9-101 0-118 9-101 25-109 21-86Z" fill="{gold}"/><path d="M4-109A9 9 0 1 0 4-94A7 7 0 0 1 4-109" fill="#fcf3df"/>'
  tail=f'<path d="M26 44Q73 63 67 23" stroke="{base}" stroke-width="9" fill="none"/><path d="M66 26 59 9 74 17Z" fill="{gold}"/>'
 eyes='<g class="guardian-eyes"><ellipse cx="-12" cy="-56" rx="6.8" ry="9" fill="#fff7e4"/><ellipse cx="12" cy="-56" rx="6.8" ry="9" fill="#fff7e4"/><ellipse cx="-13" cy="-55" rx="3.6" ry="5.6" fill="#253c51"/><ellipse cx="11" cy="-55" rx="3.6" ry="5.6" fill="#253c51"/><circle cx="-14" cy="-58" r="1.8" fill="white"/><circle cx="10" cy="-58" r="1.8" fill="white"/></g><g class="guardian-blink" fill="none" stroke="#4b4557" stroke-width="2.5"><path d="M-19-55Q-12-61-5-55M5-55Q12-61 19-55"/></g>'
 if i==1:eyes+='<g fill="none" stroke="#b18a50" stroke-width="2"><circle cx="-13" cy="-56" r="13"/><circle cx="13" cy="-56" r="13"/><path d="M0-57H0"/></g>'
 faces='<path class="guardian-smile" d="M-8-33Q0-26 8-33" fill="none" stroke="#443e4c" stroke-width="2"/><path class="guardian-oops" d="M-5-33Q0-39 5-33Q0-25-5-33Z" fill="none" stroke="#443e4c" stroke-width="2"/>'
 # Fine engraving follows the actual garment; no rasterized labels.
 details=f'<g class="guardian-trim" fill="none" stroke="{gold}" stroke-width="1.2">'+''.join(f'<path d="M{x} {y-3}l3 3-3 3-3-3Z"/>' for x,y in [(-19,33),(19,33),(-17,48),(17,48)])+'</g>'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -125 200 230" width="400" height="460"><title>Original illustrated guardian {i}</title>{defs}<g stroke="#303d52" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><g class="guardian-tail">{tail}</g><g class="guardian-wings">{wings}</g>{body}{details}<g class="guardian-head">{head}{eyes}{faces}</g><g class="guardian-arms">{arms}</g>{prop}</g></svg>'
 (out/f'guardian-{i}.svg').write_text(svg)
print('Drew ten original articulated guardians')
