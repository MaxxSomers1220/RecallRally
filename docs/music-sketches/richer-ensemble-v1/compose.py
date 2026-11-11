"""Preview-only original chamber sketch. No game files or runtime are changed."""
import importlib.util,json,sys,subprocess,hashlib
from pathlib import Path
import numpy as np

HERE=Path(__file__).resolve().parent
REPO=Path(__file__).resolve().parents[3]
def load(name,file):
 spec=importlib.util.spec_from_file_location(name,file);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
writer=load('score_writer',REPO/'scripts/compose-storybook-music.py')
renderer=load('sample_renderer',REPO/'scripts/render-storybook-music.py')
BPM=92;BEATS=64;RATE=44100
tracks=[
 dict(name='Piano: voiced chords and answering inner line',program=0,volume=94,pan=48,role='Simultaneous 3–4-note harmony, syncopated rearticulation and moving upper voice',notes=[]),
 dict(name='Flute: connected theme',program=73,volume=87,pan=69,role='Statement, answer, rising bridge and resolved return',notes=[]),
 dict(name='Violin: independent counter-melody',program=40,volume=76,pan=85,role='Legato contrary motion beneath and alongside the lead',notes=[]),
 dict(name='Cello: moving bass foundation',program=42,volume=91,pan=56,role='Roots, inversions, fifths and cadential approach tones',notes=[]),
 dict(name='Strings: connected inner harmony',program=48,volume=69,pan=60,role='Tied common tones and moving sustained three-part voicings',notes=[]),
 dict(name='Harp: phrase punctuation',program=46,volume=67,pan=37,role='Sparse rolled chord pickups and cadential figures',notes=[]),
]
def add(ch,bar,beat,pitch,dur,vel):
 # Deterministic tiny offsets; never random harmony or a repeating envelope on the whole mix.
 offset=(0,.006,-.004,.003,-.002,.008)[ch]
 start=max(0,bar*4+beat+offset)
 tracks[ch]['notes'].append(dict(bar=int(start//4)+1,beat=round(start%4+1,5),dur=dur,note=pitch,vel=vel))

# Each region is (start beat, duration, bass, close upper voices). D-major extensions
# share tones; the B7 in bar 14 intentionally leads to Em7 in bar 15.
harmony=[
 [(0,4,38,[57,62,64,66])],[(0,4,37,[57,61,64,66])],
 [(0,4,47,[55,59,62,66])],[(0,4,45,[55,57,61,64])],
 [(0,4,47,[57,59,62,66])],[(0,4,40,[55,59,62,66])],
 [(0,4,43,[55,59,62,64])],[(0,4,45,[55,57,61,64])],
 [(0,4,47,[57,59,62,66])],[(0,4,43,[55,59,62,66])],
 [(0,4,42,[57,62,64,66])],[(0,4,40,[55,59,62,66])],
 [(0,4,43,[55,59,62,66])],[(0,2,42,[57,61,64,66]),(2,2,47,[57,59,63,66])],
 [(0,2,40,[55,59,62,66]),(2,2,45,[55,57,61,64])],
 [(0,4,38,[57,59,62,66])],
]
melody=[
 [(0,74,1.5),(1.5,78,.5),(2,76,1),(3,81,.92)],
 [(0,78,1),(1,76,.5),(1.5,78,.5),(2,74,1.78)],
 [(0,71,1),(1,74,1),(2,76,1.5),(3.5,74,.44)],
 [(0,73,1),(1,71,.5),(1.5,69,.5),(2,76,1),(3,73,.5),(3.5,76,.44)],
 [(0,74,1),(1,78,1),(2,81,1.5),(3.5,78,.44)],
 [(0,76,1.9),(2,74,1),(3,71,.90)],
 [(0,74,1),(1,71,.5),(1.5,69,.5),(2,67,1),(3,71,.85)],
 [(0,69,1.5),(1.5,73,.5),(2,76,.9),(3.25,73,.5)],
 [(0,71,1),(1,74,.5),(1.5,76,.5),(2,78,1),(3,81,.94)],
 [(0,79,1.9),(2,78,1),(3,76,.94)],
 [(0,78,1.5),(1.5,76,.5),(2,73,1),(3,69,.88)],
 [(0,71,1),(1,74,1),(2,76,1),(3,78,.94)],
 [(0,79,1.5),(1.5,78,.5),(2,76,1),(3,74,.94)],
 [(0,73,1),(1,76,1),(2,78,1.8)],
 [(0,76,1),(1,74,.5),(1.5,73,.5),(2,71,1),(3,73,.88)],
 [(0,74,3.65)],
]
counter=[
 [(1,66,1.5),(2.5,69,1.4)],[(0,69,1.9),(2,66,1),(3,64,.95)],
 [(0,67,1.5),(1.5,66,.5),(2,62,1),(3,59,.95)],[(0,64,1),(1,62,1),(2,61,1.9)],
 [(0,62,1),(1,66,1),(2,69,1),(3,66,.95)],[(0,67,1.5),(1.5,66,.5),(2,64,1.9)],
 [(0,62,1.5),(1.5,64,.5),(2,67,1),(3,66,.95)],[(0,64,1.4),(1.5,61,1),(2.5,64,.5),(3,66,.95)],
 [(0,66,1.5),(1.5,64,.5),(2,62,1.95)],[(0,62,1),(1,64,.5),(1.5,66,.5),(2,67,1.9)],
 [(0,69,1),(1,66,1),(2,64,1.9)],[(0,67,1),(1,66,.5),(1.5,64,.5),(2,62,1.9)],
 [(0,71,1.5),(1.5,69,.5),(2,67,1),(3,66,.95)],[(0,64,1.9),(2,63,1),(3,66,.95)],
 [(0,67,1),(1,66,.9),(2,64,1),(3,61,.95)],[(0,62,3.7)],
]

for bar,regions in enumerate(harmony):
 phrase=bar//4;level=[-4,0,2,0][phrase]
 for start,dur,bass,voices in regions:
  # Piano establishes real simultaneous harmony immediately, with partial late
  # releases and a quieter afterbeat. It is an accompaniment, not rolled single notes.
  for k,p in enumerate(voices):
   add(0,bar,start,p, min(1.48,dur-.12),64+level+(3 if k==3 else 0))
  if dur==4 and bar!=15:
   for p in voices[1:]:add(0,bar,start+2.5,p,1.12,53+level)
   # A compact diatonic upper neighbour resolves inside the same harmony.
   if bar in [1,3,5,9,11]:
    p=voices[-1];neighbour={64:66,66:67}[p]
    add(0,bar,3.25,neighbour,.28,43);add(0,bar,3.58,p,.32,47)
  if bar==15:
   for p in [50,57,62,66,69]:add(0,bar,1.65,p,2.25,51)
  # Broad bowed plane: voices sustain through attacks; repeated common pitches
  # are merged below into ties instead of restarting at each bar line.
  for k,p in enumerate(voices[1:]):add(4,bar,start,p,.96*dur+.18,48+level-k*3)
  add(3,bar,start,bass, min(1.78,dur-.1),77+level)
  if dur==4 and bar!=15:
   add(3,bar,2,bass+7 if bar%2==0 else bass+12,1.4,65+level)
   if bar in [1,3,7,11]:
    target=harmony[bar+1][0][2]
    approach=target-1 if bar in [3,7] else target+2
    add(3,bar,3.5,approach,.42,57)
 for beat,p,dur in melody[bar]:add(1,bar,beat,p,dur+.035 if dur>=.95 else dur,77+level+(2 if beat==0 else -2))
 for beat,p,dur in counter[bar]:add(2,bar,beat,p,dur+.05,59+level+(2 if phrase==2 else 0))
 if bar in [3,7,11]:
  upper=regions[-1][3]
  for j,p in enumerate(upper):add(5,bar,2.75+j*.26,p+12,.82,47+j*2)
 if bar==15:
  for j,p in enumerate([50,57,62,66,69,74]):add(5,bar,.10+j*.07,p,3.7-j*.07,48+j)

# Tie repeated common pitches across adjacent harmonic regions, preserving line.
notes=sorted(tracks[4]['notes'],key=lambda n:((n['bar']-1)*4+n['beat']-1,n['note']))
tied=[];last={}
for n in notes:
 start=(n['bar']-1)*4+n['beat']-1;old=last.get(n['note'])
 if old is not None:
  at=(old['bar']-1)*4+old['beat']-1
  if start<=at+old['dur']+.02:
   old['dur']=round(max(at+old['dur'],start+n['dur'])-at,5);continue
 tied.append(n);last[n['note']]=n
tracks[4]['notes']=tied
score=dict(title='Lantern Hall — fuller ensemble listening sketch',bpm=BPM,meter='4/4',scale='D major',loopBars=16,previewOnly=True,form=['A: statement','A prime: answered expansion','B: rising discovery','Return: enriched cadence'],motif=[74,78,76,81],tracks=tracks,sourceType='Original composition; FluidSynth sample-based TimGM6mb MIDI rendering')
(HERE/'score.json').write_text(json.dumps(score,indent=2)+'\n');writer.midi(score,HERE/'editable.mid')

def render(t,seconds):
 synth=renderer.Synth({**score,'tracks':t});events=[]
 for ch,track in enumerate(t):
  for n in track['notes']:
   at=round(((n['bar']-1)*4+n['beat']-1)*60/BPM*RATE)
   events.extend([(at,1,ch,n['note'],n['vel']),(at+round(n['dur']*60/BPM*RATE),0,ch,n['note'],0)])
 limit=round(seconds*RATE);events.sort();pcm=np.zeros((limit,2),dtype=np.float32);cursor=0
 for at,on,ch,p,vel in events+[(limit,0,0,0,0)]:
  at=min(at,limit)
  while cursor<at:
   size=min(2048,at-cursor);pcm[cursor:cursor+size]=synth.block(size);cursor+=size
  if cursor>=limit:break
  if on:synth.on(synth.synth,ch,p,vel)
  else:synth.off(synth.synth,ch,p)
 synth.close()
 # Small finite early reflections, no loop wrapping or reverberant drone.
 dry=pcm.copy()
 for delay,gain in [(.047,.075),(.089,.045)]:
  d=round(delay*RATE);pcm[d:]+=dry[:-d,::-1]*gain
 return pcm

duration=BEATS*60/BPM+2.1
full=render(tracks,duration)
scale=.76/max(np.max(np.abs(full)),1e-8)
full*=scale
fade=round(.45*RATE);full[-fade:]*=np.linspace(1,0,fade)[:,None]
renderer.write_wav(HERE/'full-ensemble.wav',full)
# Same arrangement minus foreground lines exposes the independently musical accompaniment.
backing=[{**t,'notes':[] if i in [1,2] else t['notes']} for i,t in enumerate(tracks)]
proof=render(backing,8*4*60/BPM)*scale
proof[-fade:]*=np.linspace(1,0,fade)[:,None]
renderer.write_wav(HERE/'harmony-and-bass.wav',proof)
for name in ['full-ensemble','harmony-and-bass']:
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(HERE/(name+'.wav')),'-c:a','libmp3lame','-b:a','192k',str(HERE/(name+'.mp3'))],check=True)
events=[]
for ch,t in enumerate(tracks):
 for n in t['notes']:
  at=(n['bar']-1)*4+n['beat']-1;events.extend([(at,1,ch),(at+n['dur'],-1,ch)])
active={};counts=[]
for beat in np.arange(.125,64,.125):
 active=[(ch,n['note']) for ch,t in enumerate(tracks) for n in t['notes'] if (n['bar']-1)*4+n['beat']-1<=beat<(n['bar']-1)*4+n['beat']-1+n['dur']]
 counts.append(len(active))
assert np.percentile(counts,10)>=5,'Sketch must have genuine concurrent arrangement throughout'
assert np.max(np.abs(full))<.99 and np.sqrt(np.mean(full**2))>.01
metrics=dict(durationSeconds=duration,sampleRate=RATE,peak=float(np.max(np.abs(full))),rms=float(np.sqrt(np.mean(full**2))),noteCounts={t['name']:len(t['notes']) for t in tracks},simultaneousVoicesMedian=float(np.median(counts)),simultaneousVoices10thPercentile=float(np.percentile(counts,10)),soundfontSha256=hashlib.sha256(renderer.FONT.read_bytes()).hexdigest(),listeningAssessment='Not human auditioned. Concurrency, signal and score structure checks do not establish musical quality.')
(HERE/'measurements.json').write_text(json.dumps(metrics,indent=2)+'\n')
print(json.dumps(metrics,indent=2))
