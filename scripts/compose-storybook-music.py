#!/usr/bin/env python3
"""Original editable score + dependency-free Standard MIDI; no borrowed tune data."""
import json, math, random, struct
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/music/source'
TPQ=480
CHORDS={
 'D':([54,57,62,64],38),'DF':([54,57,62,66],42),
 'G':([55,59,62,66],43),'A':([52,57,59,61],45),
 'B':([54,57,62,66],47),'E':([55,59,62,64],40),
 'F':([54,57,61,64],42),'DA':([54,57,62,64],45),
}
HOME=['D','DF','G','A','B','E','G','A','D','F','G','DA','B','G','E','A','E','G','DF','A','B','G','E','A','D','DF','G','A','B','E','G','A']
MAP=['D','G','DF','A','B','G','E','A','D','DF','G','A','B','E','G','A','E','B','G','DF','E','G','B','A','D','G','DF','A','B','E','G','A']
# Each phrase has a statement, answer, space, and a return gesture.
HOME_MELODY=[
 [(0,74,1.15),(1.5,78,.55),(2.25,76,1.35)],
 [(.25,81,1.4),(2,78,.75),(3,76,.75)],
 [(0,74,2.6),(3,71,.65)],
 [(.5,73,1.4),(2.5,69,1.25)],
 [(0,71,.9),(1.25,74,.9),(2.75,78,1.8)],
 [(1,76,1.4),(2.75,74,.9)],
 [],[(.5,71,1.1),(2,73,.75),(3.25,76,.6)]
]
MAP_MELODY=[
 [(0,74,.8),(1,78,.4),(1.75,76,.65),(2.75,81,.9)],
 [(0,78,1.1),(1.75,76,.7),(2.75,74,.9)],
 [(.5,78,.75),(1.75,81,.75),(3,79,1.2)],
 [(1,76,1.1),(2.5,73,.75)],
 [(0,71,.8),(1.25,74,.55),(2,78,1.4)],
 [(.5,79,1.2),(2.25,78,.65),(3.25,76,.5)],
 [],[(.25,73,1.3),(2,76,.7),(3,73,.6)]
]

def vlq(n):
 b=[n&127];n>>=7
 while n:b.insert(0,(n&127)|128);n>>=7
 return bytes(b)

def midi(score,file):
 tracks=[]
 def chunk(events,end):
  events.sort(key=lambda e:(e[0],e[1]));buf=bytearray();last=0
  for tick,_,event in events:buf+=vlq(tick-last)+event;last=tick
  buf+=vlq(max(0,end-last))+b'\xff\x2f\x00'
  return b'MTrk'+struct.pack('>I',len(buf))+buf
 end=score['loopBars']*4*TPQ
 tempo=round(60_000_000/score['bpm'])
 tracks.append(chunk([(0,0,b'\xff\x51\x03'+tempo.to_bytes(3,'big')),(0,0,b'\xff\x58\x04\x04\x02\x18\x08'),(0,0,b'\xff\x59\x02\x02\x00')],end))
 for channel,t in enumerate(score['tracks']):
  name=t['name'].encode();events=[(0,0,b'\xff\x03'+vlq(len(name))+name),(0,0,bytes([0xc0|channel,t['program']])),(0,0,bytes([0xb0|channel,7,t['volume']])),(0,0,bytes([0xb0|channel,10,t['pan']])),(0,0,bytes([0xb0|channel,91,0])),(0,0,bytes([0xb0|channel,93,0]))]
  for n in t['notes']:
   start=max(0,round(((n['bar']-1)*4+n['beat']-1)*TPQ));duration=round(n['dur']*TPQ)
   events.append((start,2,bytes([0x90|channel,n['note'],n['vel']])))
   events.append((start+duration,1,bytes([0x80|channel,n['note'],0])))
  tracks.append(chunk(events,end))
 file.write_bytes(b'MThd'+struct.pack('>IHHH',6,1,len(tracks),TPQ)+b''.join(tracks))

def compose(kind):
 home=kind=='home';rng=random.Random(221 if home else 962)
 tracks=[
  {'name':'Nylon guitar - rolled harmony','program':24,'volume':62 if home else 65,'pan':42,'notes':[]},
  {'name':'Flute - motif statements','program':73,'volume':77,'pan':70,'notes':[]},
  {'name':'Clarinet - phrase answers','program':71,'volume':70,'pan':55,'notes':[]},
  {'name':'Acoustic bass - roots and passing steps','program':32,'volume':72 if home else 77,'pan':64,'notes':[]},
  {'name':'Strings - common-tone plane','program':48,'volume':37,'pan':78,'notes':[]},
  {'name':'Cello - inner answers','program':42,'volume':51,'pan':48,'notes':[]},
  {'name':'Celesta - sparse cadence points','program':8,'volume':43,'pan':83,'notes':[]},
 ]
 def note(track,bar,beat,pitch,duration,velocity):
  jitter=rng.uniform(-.012,.012)*(76 if home else 96)/60
  at=max(0,bar*4+beat+jitter)
  tracks[track]['notes'].append({'bar':int(at//4)+1,'beat':round(at%4+1,5),'dur':round(duration,4),'note':pitch,'vel':max(1,min(127,velocity+rng.randint(-3,3)))})
 progression=HOME if home else MAP
 for bar,code in enumerate(progression):
  voices,bass=CHORDS[code];section=bar//8;part=bar%8
  # Rolled voicings, with different registers and one quiet answer on selected bars.
  offsets=[0,.055,.11] if home else [0,.04,.085]
  roll=[voices[0],voices[1],voices[3]] if part%2==0 else [voices[1],voices[2],voices[3]]
  for k,p in enumerate(roll):note(0,bar,offsets[k]+(.35 if section==2 else 0),p,1.8 if home else 1.15,57 if home else 62)
  if part in ([1,4,6] if home else [0,1,3,4,6]):
   for k,p in enumerate([voices[1],voices[2]]):note(0,bar,2.25+k*.06,p,1.4 if home else .9,44 if home else 51)
  note(3,bar,0,bass,2.7 if home else 1.55,65 if home else 71)
  if not home:
   next_bass=CHORDS[progression[(bar+1)%32]][1]
   note(3,bar,2,bass+7 if part%2==0 else bass+12,1.1,56)
   if part in [3,7]:note(3,bar,3.5,max(p for p in range(next_bass-3,next_bass) if p%12 in [1,2,4,6,7,9,11]),.42,48)
  elif part in [3,7]:note(3,bar,3.25,bass+7,.6,44)
  # Shared cell recurs with an answering instrument, then a B-section contour change.
  phrase=(HOME_MELODY if home else MAP_MELODY)[part]
  lead=1 if section in [0,3] else 2
  for beat,p,duration in phrase:
   if section==1 and part in [2,4]:p-=12
   if section==2:
    if part in [0,1,5]:p-=7
    elif part in [2,4]:p-=12
   if section==3 and part==2:p+=2
   note(lead,bar,beat,p,duration,66 if home else 73)
  # Tied common tones bridge the next chord instead of synchronized block retriggers.
  if bar%2==0 and part not in [0]:
   nxt=CHORDS[progression[(bar+1)%32]][0]
   common=[p for p in voices if p in nxt]
   p=common[-1] if common else voices[2]
   note(4,bar,.6,p,5.7,45 if section!=2 else 38)
   note(4,bar,1.1,voices[0],2.65,34)
  if part in [3,6] or (section==2 and part in [1,5]):
   line=[voices[1]-12,voices[0]-12,voices[2]-12]
   for k,p in enumerate(line):note(5,bar,.5+k*1.05,p,1.25,46 if home else 51)
  if part==7 or (section==1 and part==3):
   note(6,bar,2.5,voices[2]+12,.8,42);note(6,bar,3.5,voices[1]+12,.6,36)
 score={'id':kind,'title':'An Invitation to Adventure' if home else 'The Lantern Trail','bpm':76 if home else 96,'meter':'4/4','scale':'D major','loopBars':32,'motif':[74,78,76,81,78,76],'form':['A','A prime','B','A return'],'sourceType':'Original composition; sampled General MIDI rendering','tracks':tracks}
 return score

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 for kind in ['home','map']:
  score=compose(kind);(OUT/(kind+'.json')).write_text(json.dumps(score,indent=2)+'\n');midi(score,OUT/(kind+'.mid'))
  sketch={**score,'loopBars':8,'tracks':[{**t,'notes':[n for n in t['notes'] if n['bar']<=8]} for t in score['tracks'][:4]]}
  # Plain piano lead/harmony and bass prove the phrase before arranging timbre.
  sketch['tracks'][0]['program']=0
  for t in sketch['tracks'][1:3]:t['program']=0
  (OUT/(kind+'-sketch.json')).write_text(json.dumps(sketch,indent=2)+'\n');midi(sketch,OUT/(kind+'-sketch.mid'))
  print(kind,score['bpm'],'BPM,32 bars,',sum(len(t['notes']) for t in score['tracks']),'notes; sketch and full MIDI written')

if __name__=='__main__':main()
