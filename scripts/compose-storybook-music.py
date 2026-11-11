#!/usr/bin/env python3
"""Develop the user-approved polyphonic sketch into editable original game cues."""
import copy,json,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/music/source'
TPQ=480
APPROVED=ROOT/'assets/music/source/approved-ensemble-sketch.json'
# Beat, duration, bass, upper voicing; these are the approved sketch's harmonies.
HARMONY=[
 [(0,4,38,[57,62,64,66])],[(0,4,37,[57,61,64,66])],
 [(0,4,47,[55,59,62,66])],[(0,4,45,[55,57,61,64])],
 [(0,4,47,[57,59,62,66])],[(0,4,40,[55,59,62,66])],
 [(0,4,43,[55,59,62,64])],[(0,4,45,[55,57,61,64])],
 [(0,4,47,[57,59,62,66])],[(0,4,43,[55,59,62,66])],
 [(0,4,42,[57,62,64,66])],[(0,4,40,[55,59,62,66])],
 [(0,4,43,[55,59,62,66])],[(0,2,42,[57,61,64,66]),(2,2,47,[57,59,63,66])],
 [(0,2,40,[55,59,62,66]),(2,2,45,[55,57,61,64])],[(0,4,38,[57,59,62,66])],
]
HOME_RETURN=[
 [(0,74,1.5),(1.5,78,.5),(2,76,1),(3,73,.5),(3.5,74,.44)],
 [(0,76,1),(1,78,.5),(1.5,81,.5),(2,78,1),(3,76,.88)],
 [(0,79,1.5),(1.5,78,.5),(2,76,1),(3,74,.88)],
 [(0,76,1.5),(1.5,73,.5),(2,71,1),(3,69,.88)],
 [(0,78,1),(1,81,1),(2,83,1),(3,81,.5),(3.5,78,.44)],
 [(0,79,1),(1,78,.5),(1.5,76,.5),(2,74,1),(3,71,.88)],
 [(0,74,1),(1,76,.5),(1.5,78,.5),(2,79,1.78)],
 [(0,76,1),(1,74,.5),(1.5,73,.5),(2,71,.75),(3,73,.75)],
 [(0,71,1),(1,74,.5),(1.5,78,.5),(2,76,.5),(2.5,78,.5),(3,81,.9)],
 [(0,79,1.9),(2,78,.75),(3,76,.75)],
 [(0,74,1),(1,78,.5),(1.5,81,.5),(2,78,1),(3,76,.88)],
 [(0,71,1),(1,74,1),(2,76,.5),(2.5,79,.5),(3,78,.88)],
 [(0,79,1.5),(1.5,78,.5),(2,76,1),(3,74,.88)],
 [(0,73,1),(1,76,1),(2,78,1.78)],
 [(0,76,1),(1,74,.5),(1.5,73,.5),(2,71,1),(3,73,.88)],
 [(0,76,1.5),(1.5,74,.5),(2,73,.75),(3,73,.4),(3.5,76,.43)],
]
MAP_THEME=[
 [(0,74,.5),(.5,78,.5),(1,76,1),(2,81,1.5),(3.5,78,.43)],
 [(.25,76,.7),(1,78,.5),(1.5,81,.5),(2.5,78,.5),(3,76,.88)],
 [(0,74,1),(1,71,.5),(1.5,74,.5),(2,78,1),(3,76,.88)],
 [(.5,73,.5),(1,76,1),(2.5,73,.5),(3,71,.5),(3.5,69,.43)],
 [(0,71,.5),(.5,74,.5),(1,78,1),(2.5,81,.5),(3,78,.88)],
 [(0,79,1.5),(1.5,78,.5),(2,76,.75),(3,74,.75)],
 [(0,71,1),(1,74,.5),(1.5,76,.5),(2.5,79,.5),(3,78,.88)],
 [(.5,76,.5),(1,73,.75),(2,71,.5),(2.5,73,.5),(3,76,.88)],
 [(0,78,.5),(.5,81,.5),(1,83,1),(2,81,.75),(3,78,.75)],
 [(0,79,1.5),(1.5,78,.5),(2.5,76,.5),(3,74,.88)],
 [(0,78,1),(1,76,.5),(1.5,73,.5),(2.5,74,.5),(3,69,.88)],
 [(0,71,.5),(.5,74,.5),(1,76,1),(2.5,79,.5),(3,78,.88)],
 [(0,79,1),(1,78,.5),(1.5,76,.5),(2,74,1),(3,71,.88)],
 [(0,73,.75),(1,76,.5),(1.5,78,.5),(2.5,78,1.25)],
 [(0,76,.75),(1,74,.5),(1.5,73,.5),(2,71,.75),(3,73,.75)],
 [(0,74,2.4),(2.5,73,.5),(3,76,.88)],
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

def add(track,bar,beat,pitch,dur,vel):
 at=max(0,bar*4+beat)
 track['notes'].append({'bar':int(at//4)+1,'beat':round(at%4+1,5),'dur':round(dur,5),'note':pitch,'vel':vel})

def compose(kind):
 seed=json.loads(APPROVED.read_text());home=kind=='home';tracks=copy.deepcopy(seed['tracks'])
 # The approved 16-bar ensemble remains the homepage opening, not a new thin sketch.
 for ch,t in enumerate(tracks):
  first=copy.deepcopy(t['notes']);t['notes']=[]
  for cycle in range(2):
   for n in first:
    n=copy.deepcopy(n);n['bar']+=cycle*16
    if ch==1 and (not home or cycle==1):continue
    if not home and ch in [0,3]:continue
    # Final tonic cadence becomes a prepared dominant return; rewrite accompanying layers below.
    if (n['bar']-1)*4+n['beat']-1>=123.9 and ch in [0,3,4,5]:continue
    if home and cycle==1 and ch in [0,2]:n['vel']=min(127,n['vel']+(2 if n['bar']<25 else -1))
    t['notes'].append(n)
 if home:
  for bar,phrase in enumerate(HOME_RETURN,16):
   for beat,p,d in phrase:add(tracks[1],bar,beat-.004,p,d+.025 if d>=.9 else d,77+(2 if beat==0 else -2))
 else:
  tracks[3].update(name='Acoustic bass: walking exploration foundation',program=32,volume=91,role='Walking roots, fifths, chord thirds and intentional approaches; no drums')
  tracks[0]['role']='Voiced piano chords on changing afterbeats with short melodic answers'
  for bar in range(32):
   phrase=MAP_THEME[bar%16]
   for beat,p,d in phrase:
    if 16<=bar<20:p-=12
    if 24<=bar<28 and beat==0 and p in [74,78]:p+=5 if p==74 else 3
    add(tracks[1],bar,beat-.004,p,d+.025 if d>=.9 else d,78+(2 if beat==0 else -2))
   regions=HARMONY[bar%16] if bar!=31 else [(0,4,45,[55,57,61,64])]
   for start,dur,bass,voices in regions:
    positions=[(start+.25,1.2,63),(start+2.25,1.35,57)] if dur==4 else [(start+.25,1.55,60)]
    if bar%8 in [3,7] and dur==4:positions=[(start,.95,63),(start+1.75,.9,56),(start+3.0,.85,60)]
    for at,length,vel in positions:
     for p in voices:add(tracks[0],bar,at+.006,p,length,vel)
    # Four-beat walking grammar; cadential breaks keep it from becoming a fixed ostinato.
    next_bass=(regions[1][2] if len(regions)>1 and start==0 else HARMONY[(bar+1)%16][0][2])
    for k in range(int(dur)):
     if bar%8==7 and k==2:continue
     pitch=[bass,bass+7,bass+12,bass+7][k]
     if k==int(dur)-1 and bar%4 in [1,3]:
      pitch=next_bass-1 if (next_bass-1)%12 in [1,2,4,6,7,9,11] else next_bass+2
     add(tracks[3],bar,start+k+.003,pitch,.86,72 if k==0 else 60+(3 if k==2 else 0))
 # A7 in the final bar resolves to the first D harmony; retain voiced body and tails.
 if home:
  for p in [55,57,61,64]:add(tracks[0],31,.006,p,2.8,61)
  for p in [57,61,64]:add(tracks[0],31,3.0,p,.88,45)
  add(tracks[3],31,.003,45,2.6,72);add(tracks[3],31,3.25,49,.62,57)
 for p in [57,61,64]:add(tracks[4],31,0,p,3.86,44)
 for k,p in enumerate([61,64,69]):add(tracks[5],31,2.8+k*.33,p+12,.9,44-k*2)
 # Replace the terminal violin tonic with a dominant answer, including the next downbeat pickup.
 tracks[2]['notes']=[n for n in tracks[2]['notes'] if (n['bar']-1)*4+n['beat']-1<123.9]
 for beat,p,d in [(0,64,1.4),(1.5,62,.5),(2,61,1),(3,64,.98)]:add(tracks[2],31,beat-.004,p,d,58)
 for t in tracks:t['notes'].sort(key=lambda n:((n['bar']-1)*4+n['beat']-1,n['note']))
 return {'id':kind,'title':'An Invitation to Adventure' if home else 'The Lantern Trail','bpm':92 if home else 104,'meter':'4/4','scale':'D major','loopBars':32,'motif':[74,78,76,81],
  'form':(['Approved statement','Rising exploration answer','Varied statement','Enriched return and dominant pickup'] if home else ['Traveling statement','Exploration answer','Lower-register variation','Upper return and dominant pickup']),
  'approvedSource':'assets/music/source/approved-ensemble-sketch.json','sourceType':'Original composition developed from user-approved ensemble sketch; sampled General MIDI rendering','tracks':tracks}

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 for kind in ['home','map']:
  score=compose(kind);(OUT/(kind+'.json')).write_text(json.dumps(score,indent=2)+'\n');midi(score,OUT/(kind+'.mid'))
  sketch={**score,'loopBars':8,'tracks':[{**t,'notes':[n for n in t['notes'] if n['bar']<=8]} for t in score['tracks'][:4]]}
  (OUT/(kind+'-sketch.json')).write_text(json.dumps(sketch,indent=2)+'\n');midi(sketch,OUT/(kind+'-sketch.mid'))
  print(kind,score['bpm'],'BPM; 32 bars;',sum(len(t['notes']) for t in score['tracks']),'authored notes')

if __name__=='__main__':main()
