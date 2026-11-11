#!/usr/bin/env python3
"""Build-time sample-based rendering via installed FluidSynth; no game dependency."""
import ctypes as C, ctypes.util, hashlib, json, math, os, subprocess, tempfile, wave
from pathlib import Path
import numpy as np
from scipy import signal
from concurrent.futures import ProcessPoolExecutor

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/music'
RATE=32000
FONT=Path(os.environ.get('MUSIC_SOUNDFONT_PATH',str(ROOT/'assets/music/source/TimGM6mb.sf2')))

class Synth:
 def __init__(self,score):
  self.lib=C.CDLL(ctypes.util.find_library('fluidsynth'))
  def fn(name,ret,args):
   f=getattr(self.lib,name);f.restype=ret;f.argtypes=args;return f
  self.new_settings=fn('new_fluid_settings',C.c_void_p,[])
  self.setnum=fn('fluid_settings_setnum',C.c_int,[C.c_void_p,C.c_char_p,C.c_double])
  self.setint=fn('fluid_settings_setint',C.c_int,[C.c_void_p,C.c_char_p,C.c_int])
  self.new_synth=fn('new_fluid_synth',C.c_void_p,[C.c_void_p])
  self.load=fn('fluid_synth_sfload',C.c_int,[C.c_void_p,C.c_char_p,C.c_int])
  self.program=fn('fluid_synth_program_change',C.c_int,[C.c_void_p,C.c_int,C.c_int])
  self.cc=fn('fluid_synth_cc',C.c_int,[C.c_void_p,C.c_int,C.c_int,C.c_int])
  self.on=fn('fluid_synth_noteon',C.c_int,[C.c_void_p,C.c_int,C.c_int,C.c_int])
  self.off=fn('fluid_synth_noteoff',C.c_int,[C.c_void_p,C.c_int,C.c_int])
  self.write=fn('fluid_synth_write_float',C.c_int,[C.c_void_p,C.c_int,C.c_void_p,C.c_int,C.c_int,C.c_void_p,C.c_int,C.c_int])
  self.delete=fn('delete_fluid_synth',None,[C.c_void_p]);self.delete_settings=fn('delete_fluid_settings',None,[C.c_void_p])
  self.settings=self.new_settings();self.setnum(self.settings,b'synth.sample-rate',RATE);self.setnum(self.settings,b'synth.gain',.6)
  self.setint(self.settings,b'synth.reverb.active',0);self.setint(self.settings,b'synth.chorus.active',0)
  self.synth=self.new_synth(self.settings)
  if self.load(self.synth,os.fsencode(FONT),1)<0:raise RuntimeError('Cannot load SoundFont '+str(FONT))
  for t in score['tracks']:
   if t.get('role')=='kit':continue
   ch=t.get('channel',score['tracks'].index(t))
   self.program(self.synth,ch,t['program']);self.cc(self.synth,ch,7,t['volume']);self.cc(self.synth,ch,10,t['pan']);self.cc(self.synth,ch,91,0);self.cc(self.synth,ch,93,0)
 def block(self,n):
  l=np.empty(n,dtype=np.float32);r=np.empty(n,dtype=np.float32)
  self.write(self.synth,n,l.ctypes.data,0,1,r.ctypes.data,0,1)
  return np.column_stack((l,r))
 def close(self):self.delete(self.synth);self.delete_settings(self.settings)

def render(score):
 frames=round(score['loopBars']*4*60/score['bpm']*RATE);events=[];fpb=RATE*60/score['bpm']
 for cycle in range(3):
  for t in score['tracks']:
   if t.get('role')=='kit':continue
   ch=t['channel']
   for n in t['notes']:
    at=max(0,round(((n['bar']-1)*4+n['beat']-1)*fpb))+cycle*frames
    events.extend([(at,1,ch,n['note'],n['vel']),(at+round(n['dur']*fpb),0,ch,n['note'],0)])
 events.sort();synth=Synth(score);pcm=np.zeros((frames,2),dtype=np.float32);cursor=0;limit=3*frames
 # Two full warm-up cycles leave held notes alive across the final loop boundary.
 for at,on,ch,pitch,vel in events+[(limit,0,0,0,0)]:
  at=min(at,limit)
  while cursor<at:
   n=min(4096,at-cursor);audio=synth.block(n);a=max(cursor,2*frames);b=min(cursor+n,limit)
   if b>a:pcm[a-2*frames:b-2*frames]=audio[a-cursor:b-cursor]
   cursor+=n
  if cursor>=limit:break
  (synth.on(synth.synth,ch,pitch,vel) if on else synth.off(synth.synth,ch,pitch))
 synth.close()
 rng=np.random.default_rng(sum(map(ord,score['id']))+2026)
 for track in score['tracks']:
  if track.get('role')!='kit':continue
  for n in track['notes']:
   at=round(((n['bar']-1)*4+n['beat']-1)*fpb)%frames
   t=np.arange(round(.36*RATE),dtype=np.float32)/RATE;velocity=n['vel']/80
   noise=rng.normal(0,1,len(t)).astype(np.float32)
   if n['note']==36:
    phase=2*np.pi*(44*t+24*.035*(1-np.exp(-t/.035)))
    wave=np.sin(phase)*(1-np.exp(-t/.004))*np.exp(-t/.085)*.095*velocity
   elif n['note']==38:
    filtered=signal.sosfilt(signal.butter(2,[500,3400],btype='bandpass',fs=RATE,output='sos'),noise)
    wave=filtered*(1-np.exp(-t/.004))*np.exp(-t/.047)*.034*velocity
   elif n['note']==42:
    filtered=signal.sosfilt(signal.butter(2,[2400,5400],btype='bandpass',fs=RATE,output='sos'),noise)
    wave=filtered*(1-np.exp(-t/.002))*np.exp(-t/.019)*.016*velocity
   else:wave=(np.sin(2*np.pi*680*t)+.18*np.sin(2*np.pi*1370*t))*(1-np.exp(-t/.002))*np.exp(-t/.018)*.018*velocity
   indexes=(at+np.arange(len(t)))%frames
   pcm[indexes,0]+=wave;pcm[indexes,1]+=wave
 # Circular frequency-domain EQ/reverb preserves periodicity and note tails.
 freq=np.fft.rfftfreq(frames,1/RATE)
 eq=(1/(1+(freq/6100)**6))*(freq/np.sqrt(freq*freq+34**2))
 eq*=1+.12*np.exp(-.5*((freq-210)/150)**2)
 spectrum=np.fft.rfft(pcm,axis=0);spectrum*=eq[:,None]
 wet=np.zeros_like(pcm)
 for channel in range(2):
  taps=np.ones(len(freq),dtype=np.complex128)
  for k,(delay,amp) in enumerate([(.039,.11),(.083,.075),(.137,.055),(.211,.04),(.307,.029),(.431,.018)]):
   taps+=amp*np.exp(-2j*np.pi*freq*(delay+(channel*.006 if k%2 else -channel*.004)))
  wet[:,channel]=np.fft.irfft(spectrum[:,channel]*taps,n=frames).astype(np.float32)
 pcm=wet
 # Gentle periodic tape wow/flutter, with shared-channel drift for a stable image.
 position=np.arange(frames,dtype=np.float64)
 cycles=frames/RATE
 drift=RATE*(.00055*np.sin(2*np.pi*round(cycles*.29)*position/frames)+.000045*np.sin(2*np.pi*round(cycles*4.1)*position/frames))
 shifted=(position+drift)%frames;i=np.floor(shifted).astype(np.int64);fraction=(shifted-i).astype(np.float32)
 pcm=pcm[i]*(1-fraction[:,None])+pcm[(i+1)%frames]*fraction[:,None]
 # Mild harmonic saturation, then consistent album loudness with conservative peaks.
 pcm=np.tanh(pcm*1.28)/1.28
 rms=float(np.sqrt(np.mean(pcm**2)));pcm*=.105/max(rms,1e-8)
 # Soft limiting catches isolated instrument transients without flattening the groove.
 pcm=.78*np.tanh(pcm/.78)
 raw_seam=float(np.max(np.abs(pcm[0]-pcm[-1])))
 if raw_seam>.001:
  n=96;w=np.linspace(0,1,n,dtype=np.float32)[:,None];pcm[-n:]=pcm[-n:]*(1-w)+pcm[0]*w
 return pcm,{'sampleRate':RATE,'loopFrames':frames,'loopSeconds':frames/RATE,'peak':float(np.max(np.abs(pcm))),'rms':float(np.sqrt(np.mean(pcm**2))),'rawBoundaryDelta':raw_seam,'boundaryDelta':float(np.max(np.abs(pcm[0]-pcm[-1])))}

def write_wav(file,pcm):
 with wave.open(str(file),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE);w.writeframes(np.round(pcm*32767).astype('<i2').tobytes())

def render_one(name):
 score=json.loads((OUT/'source'/f'{name}.json').read_text());pcm,stats=render(score)
 with tempfile.TemporaryDirectory(prefix='rally-afterglow-')as temp:
  wav=Path(temp)/'loop.wav';write_wav(wav,pcm);target=OUT/f'{name}.mp3'
  subprocess.run(['ffmpeg','-y','-v','error','-i',str(wav),'-c:a','libmp3lame','-b:a','80k','-ar',str(RATE),'-map_metadata','-1',str(target)],check=True)
 packets=json.loads(subprocess.run(['ffprobe','-v','quiet','-show_packets','-of','json',str(target)],capture_output=True,text=True,check=True).stdout)['packets']
 skip=next((v['skip_samples'] for v in packets[0].get('side_data_list',[]) if v.get('side_data_type')=='Skip Samples'),0)
 padding=next((v['discard_padding'] for v in packets[-1].get('side_data_list',[]) if v.get('side_data_type')=='Skip Samples'),0)
 encoded=sum(round(float(p['duration_time'])*RATE) for p in packets)
 assert encoded-skip-padding==stats['loopFrames'],name+' gapless frame count'
 stats.update(id=name,file=str(target.relative_to(ROOT)),bytes=target.stat().st_size,sha256=hashlib.sha256(target.read_bytes()).hexdigest(),title=score['title'],bpm=score['bpm'],loopBars=score['loopBars'],channels=2,mp3=dict(encodedFrames=encoded,skipSamples=skip,discardPadding=padding))
 print(name,round(stats['loopSeconds'],2),'seconds',round(stats['rms'],4),'RMS',flush=True);return stats

def main():
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--only',nargs='*');parser.add_argument('--jobs',type=int,default=2);args=parser.parse_args()
 if not FONT.is_file():raise SystemExit('Set MUSIC_SOUNDFONT_PATH to licensed TimGM6mb.sf2')
 from importlib.util import spec_from_file_location,module_from_spec
 spec=spec_from_file_location('compose',ROOT/'scripts/compose-storybook-music.py');module=module_from_spec(spec);spec.loader.exec_module(module)
 names=args.only or [row[0] for row in module.CUES]
 with ProcessPoolExecutor(max_workers=args.jobs) as pool:rows=list(pool.map(render_one,names))
 if args.only:return
 manifest={'source':'Lantern Afterglow: original compositions and original synthesized brushed percussion; licensed sampled instruments','renderer':'FluidSynth TimGM6mb, circular room/EQ, subtle tape drift, gentle saturation; FFmpeg libmp3lame 80kbps stereo / 32kHz','soundfont':{'name':FONT.name,'sha256':hashlib.sha256(FONT.read_bytes()).hexdigest(),'license':'GPL-2.0-only'},'theme':[74,78,81,76,74,71],'assets':rows,'sketches':[]}
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print('TOTAL',sum(r['bytes'] for r in rows),'bytes',flush=True)
if __name__=='__main__':main()
