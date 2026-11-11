#!/usr/bin/env python3
"""Original Lantern Afterglow suite: editable scores and Standard MIDI.
No sampled records, borrowed melodies, or artist recordings are used.
"""
import json, random, struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/music/source';TPQ=480
# Quiet close-position 6/9, major-9 and minor-9 voicings in a shared D/B tonal family.
CHORDS={
 'D69':([54,59,64,69],38),'Dmaj9':([54,61,64,69],38),
 'Gmaj9':([54,57,59,62],43),'G69':([52,57,59,62],43),
 'Bm9':([54,57,61,64],35),'Em9':([54,55,59,62],40),
 'A13':([55,59,61,66],33),'Asus9':([55,59,62,64],33),
 'Fsm7':([52,57,61,64],42),'Cmaj9':([52,55,59,62],36),
}
PROGRESSIONS={
 'open':['D69','Fsm7','Gmaj9','Asus9','Bm9','Em9','G69','A13'],
 'minor':['Bm9','Em9','Gmaj9','Fsm7','Bm9','G69','Em9','Asus9'],
 'float':['Gmaj9','Dmaj9','Em9','Asus9','G69','Bm9','Em9','A13'],
 'wonder':['Dmaj9','Gmaj9','Cmaj9','Asus9','Bm9','Em9','G69','A13'],
}
# A distinctive six-note invitation, answered rather than repeated as a short ostinato.
MOTIF=[74,78,81,76,74,71]
PHRASES=[
 [(0,74,1.1),(1.5,78,.6),(2.5,81,.85)],
 [(.5,76,1.15),(2,74,.8),(3.25,71,.6)],
 [(.5,74,1.8),(3,78,.65)],
 [],
 [(0,76,1.1),(1.75,79,.65),(2.75,78,1.1)],
 [(.75,74,1.45),(2.75,71,1.15)],
 [(1,73,1.2),(2.75,76,.8)],
 [(.5,74,2.65)],
]
# id, title, bpm, bars, lead GM program, harmony, energy, register, drums
CUES=[
 ('home','Lantern Afterglow',74,32,4,'open',.62,0,.42),
 ('map','The Last Tram to Mosswood',80,32,24,'open',.74,0,.60),
 ('world-0','Pippin’s Paper Lanterns',78,16,24,'open',.66,0,.52),
 ('world-1','Fern’s Firefly Waltz in Four',74,16,12,'float',.56,0,.35),
 ('world-2','Compass Coast After Rain',80,16,73,'open',.65,0,.50),
 ('world-3','Quill’s Midnight Margins',72,16,71,'minor',.53,-12,.28),
 ('world-4','Maestro’s Velvet Balcony',82,16,11,'wonder',.65,0,.56),
 ('world-5','Flint’s Violet Refractions',76,16,8,'float',.54,0,.32),
 ('world-6','Tock’s Brass Pocketwatch',84,16,28,'minor',.69,-12,.65),
 ('world-7','Lyra’s Underwater Postcards',72,16,11,'float',.51,0,.27),
 ('world-8','Zephyr’s Rooftop Garden',76,16,73,'float',.52,0,.30),
 ('world-9','Astra and the Moonlit Train',78,16,8,'wonder',.62,0,.44),
 ('duel-high','Lanterns Against the Storm',92,16,11,'minor',.80,0,.85),
 ('lab-hub','Fizzwick’s Late-Night Workshop',78,16,4,'wonder',.56,0,.38),
 ('lab-potion','Apricot Steam and Moonbubbles',80,16,12,'wonder',.59,0,.43),
 ('lab-circuit','Copper Wires, Warm Windows',82,16,28,'open',.60,-12,.50),
 ('lab-creature','A Small Friend Wakes',74,16,73,'float',.49,0,.26),
 ('lab-weather','Rain in a Teacup',76,16,11,'float',.53,0,.38),
 ('lab-observatory','The Observatory at 2 AM',72,16,8,'minor',.45,0,.16),
 ('practice','Pencils by the Window',78,16,4,'open',.43,-12,.20),
 ('library','The Librarian’s Unsent Letter',72,16,71,'minor',.48,-12,.22),
 ('library-storm','Books Above the Neon River',92,16,24,'minor',.76,0,.78),
 ('rescue','Rigby’s Light at the Platform',76,16,73,'float',.52,0,.26),
 ('finale','Everyone Home Before Dawn',80,16,11,'open',.68,0,.46),
]
def vlq(n):
 b=[n&127];n>>=7
 while n:b.insert(0,(n&127)|128);n>>=7
 return bytes(b)
def midi(score,file):
 end=score['loopBars']*4*TPQ
 def chunk(events):
  events.sort(key=lambda e:(e[0],e[1]));buf=bytearray();last=0
  for tick,_,event in events:buf+=vlq(tick-last)+event;last=tick
  buf+=vlq(max(0,end-last))+b'\xff\x2f\x00';return b'MTrk'+struct.pack('>I',len(buf))+buf
 tempo=round(60_000_000/score['bpm'])
 tracks=[chunk([(0,0,b'\xff\x51\x03'+tempo.to_bytes(3,'big')),(0,0,b'\xff\x58\x04\x04\x02\x18\x08'),(0,0,b'\xff\x59\x02\x02\x00')])]
 for t in score['tracks']:
  ch=t['channel'];name=t['name'].encode();events=[(0,0,b'\xff\x03'+vlq(len(name))+name),(0,0,bytes([0xc0|ch,t['program']])),(0,0,bytes([0xb0|ch,7,t['volume']])),(0,0,bytes([0xb0|ch,10,t['pan']]))]
  for n in t['notes']:
   at=max(0,round(((n['bar']-1)*4+n['beat']-1)*TPQ));dur=round(n['dur']*TPQ)
   events.extend([(at,2,bytes([0x90|ch,n['note'],n['vel']])),(at+dur,1,bytes([0x80|ch,n['note'],0]))])
  tracks.append(chunk(events))
 file.write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(tracks),TPQ)+b''.join(tracks))
def compose(row):
 kind,title,bpm,bars,lead,harmony,energy,register,drums=row
 rng=random.Random('recall-lantern-afterglow-'+kind)
 tracks=[
  dict(name='Felt Rhodes · extended harmony',program=4,volume=66,pan=52,channel=0,role='keys',notes=[]),
  dict(name='Lantern motif · '+str(lead),program=lead,volume=61 if lead in [8,11,12] else 67,pan=69,channel=1,role='lead',notes=[]),
  dict(name='Nylon guitar · quiet replies',program=24,volume=44,pan=78,channel=2,role='guitar',notes=[]),
  dict(name='Upright bass · rounded foundations',program=32,volume=79,pan=64,channel=3,role='bass',notes=[]),
  dict(name='Warm strings · common-tone air',program=48,volume=29,pan=55,channel=4,role='air',notes=[]),
  dict(name='Vibraphone · scattered lights',program=11,volume=30,pan=84,channel=5,role='accent',notes=[]),
  dict(name='Original brushed kit · soft swing',program=0,volume=64,pan=64,channel=9,role='kit',notes=[]),
 ]
 def note(track,bar,beat,pitch,dur,vel):
  # Deterministic microtiming; eighth offbeats are gently late, never quantized beeps.
  swing=.065 if abs(beat%1-.5)<.03 else 0
  at=max(0,bar*4+beat+swing+rng.uniform(-.009,.009))
  tracks[track]['notes'].append(dict(bar=int(at//4)+1,beat=round(at%4+1,5),note=pitch,dur=round(dur,4),vel=max(1,min(110,round(vel*energy)+rng.randint(-3,3)))))
 for bar in range(bars):
  part=bar%8;section=bar//8;voices,bass=CHORDS[PROGRESSIONS[harmony][part]]
  # A and A' leave pockets of space; B changes register and orchestration.
  bridge=bars==32 and section==2;returning=section==bars//8-1
  for k,p in enumerate(voices):note(0,bar,(.15 if part%2 else 0)+k*.027,p,2.5 if part%2==0 else 3.3,62 if not bridge else 50)
  if part in [1,4,6]:
   for k,p in enumerate(voices[1:]):note(0,bar,2.5+k*.018,p,1.0,36)
  note(3,bar,0,bass,1.8 if drums>.6 else 2.8,80)
  if part in [1,3,4,6,7] and drums>.3:note(3,bar,2.5,bass+(7 if part%2 else 12),1.0,57)
  if drums>.7:note(3,bar,3.5,CHORDS[PROGRESSIONS[harmony][(part+1)%8]][1]-1,.35,46)
  phrase=PHRASES[part]
  for beat,p,dur in phrase:
   if bridge:p-=12
   if section%2 and part==4:p=81
   if section%2 and part==5:p=78
   # Leave recognizable space around the six-note opening gesture.
   note(1,bar,beat,p+register,dur,76 if lead not in [8,11] else 62)
  if part in [2,3,6] and kind!='practice':
   for k,p in enumerate([voices[1],voices[3],voices[2]]):note(2,bar,.5+k*.75,p,1.1,44)
  if bar%2==0:
   common=set(voices)&set(CHORDS[PROGRESSIONS[harmony][(part+1)%8]][0]);p=max(common) if common else voices[1]
   note(4,bar,.7,p,5.9,42);note(4,bar,1.1,voices[0],2.9,28)
  if part==7 and (section%2 or kind in ['world-5','world-9','lab-observatory']):note(5,bar,2.75,voices[2]+12,1.4,40)
  if drums:
   # Percussion is rendered from original sine/noise envelopes, not drum-loop samples.
   density=drums*(.65 if bridge else 1)
   for beat in ([0,2.5] if density>.4 else [0]):note(6,bar,beat,36,.3,round(62*density))
   for beat in [1,3]:note(6,bar,beat,38,.14,round(43*density))
   for beat in ([.5,1.5,2.5,3.5] if density>.5 else [1.5,3.5]):note(6,bar,beat,42,.075,round(30*density))
   if part in [3,7] and density>.5:note(6,bar,3.75,37,.07,round(29*density))
 return dict(id=kind,title=title,bpm=bpm,meter='4/4',scale='D major / B minor',loopBars=bars,motif=MOTIF,form=['invitation','answer','space','return'],harmony=PROGRESSIONS[harmony],inspiration='Original downtempo fantasy with warm 1990s Tokyo lo-fi colors; no artist/song imitation',sourceType='Original composition; sampled licensed instruments and original synthesized percussion',tracks=tracks)
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 for row in CUES:
  score=compose(row);(OUT/(row[0]+'.json')).write_text(json.dumps(score,indent=2)+'\n');midi(score,OUT/(row[0]+'.mid'));print(row[0],score['bpm'],score['loopBars'],sum(len(t['notes']) for t in score['tracks']))
if __name__=='__main__':main()
