#!/usr/bin/env python3
"""Build-time sample-based rendering via installed FluidSynth; no game dependency."""
import ctypes as C, ctypes.util, hashlib, json, math, os, subprocess, tempfile, wave
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/music'
RATE=44100
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
  for ch,t in enumerate(score['tracks']):
   self.program(self.synth,ch,t['program']);self.cc(self.synth,ch,7,t['volume']);self.cc(self.synth,ch,10,t['pan']);self.cc(self.synth,ch,91,0);self.cc(self.synth,ch,93,0)
 def block(self,n):
  l=np.empty(n,dtype=np.float32);r=np.empty(n,dtype=np.float32)
  self.write(self.synth,n,l.ctypes.data,0,1,r.ctypes.data,0,1)
  return np.column_stack((l,r))
 def close(self):self.delete(self.synth);self.delete_settings(self.settings)

def render(score):
 frames=round(score['loopBars']*4*60/score['bpm']*RATE);events=[];fpb=RATE*60/score['bpm']
 for cycle in range(3):
  for ch,t in enumerate(score['tracks']):
   for n in t['notes']:
    at=max(0,round(((n['bar']-1)*4+n['beat']-1)*fpb))+cycle*frames
    events.extend([(at,1,ch,n['note'],n['vel']),(at+round(n['dur']*fpb),0,ch,n['note'],0)])
 events.sort();synth=Synth(score);pcm=np.zeros((frames,2),dtype=np.float32);cursor=0
 # Warm one complete cycle so releasing notes cross the chosen loop boundary.
 limit=2*frames
 for at,on,ch,pitch,vel in events+[(limit,0,0,0,0)]:
  at=min(at,limit)
  while cursor<at:
   n=min(2048,at-cursor);audio=synth.block(n)
   a=max(cursor,frames);b=min(cursor+n,limit)
   if b>a:pcm[a-frames:b-frames]=audio[a-cursor:b-cursor]
   cursor+=n
  if cursor>=limit:break
  (synth.on(synth.synth,ch,pitch,vel) if on else synth.off(synth.synth,ch,pitch))
 synth.close()
 # Quiet early reflections are circular, preserving the loop rather than adding a fade-out.
 pcm=pcm+.10*np.roll(pcm,round(.047*RATE),axis=0)+.055*np.roll(pcm[:,::-1],round(.089*RATE),axis=0)
 peak=float(np.max(np.abs(pcm)));rms=float(np.sqrt(np.mean(pcm**2)))
 pcm*=min(.70/max(peak,1e-8),.13/max(rms,1e-8))
 raw_seam=float(np.max(np.abs(pcm[0]-pcm[-1])))
 # One millisecond of endpoint interpolation, only if measured discontinuity exceeds .004.
 if raw_seam>.004:
  n=44;w=np.linspace(0,1,n,dtype=np.float32)[:,None]
  pcm[-n:]=pcm[-n:]*(1-w)+pcm[0]*w
 return pcm,{'sampleRate':RATE,'loopFrames':frames,'loopSeconds':frames/RATE,'peak':float(np.max(np.abs(pcm))),'rms':float(np.sqrt(np.mean(pcm**2))),'rawBoundaryDelta':raw_seam,'boundaryDelta':float(np.max(np.abs(pcm[0]-pcm[-1])))}

def write_wav(file,pcm):
 with wave.open(str(file),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE);w.writeframes(np.round(pcm*32767).astype('<i2').tobytes())

def main():
 if not FONT.is_file():raise SystemExit('Set MUSIC_SOUNDFONT_PATH to licensed TimGM6mb.sf2')
 rows=[]
 # Render the plain music sketches before the full instrument arrangements.
 for name in ['home-sketch','map-sketch','home','map']:
  score=json.loads((OUT/'source'/f'{name}.json').read_text());pcm,stats=render(score)
  with tempfile.TemporaryDirectory(prefix='rally-music-')as temp:
   wav=Path(temp)/'loop.wav';write_wav(wav,pcm)
   target=(OUT/'source'/f'{name}.mp3')if name.endswith('sketch')else OUT/f'{name}.mp3'
   subprocess.run(['ffmpeg','-y','-v','error','-i',str(wav),'-c:a','libmp3lame','-b:a','128k','-map_metadata','-1',str(target)],check=True)
  packet_info=json.loads(subprocess.run(['ffprobe','-v','quiet','-show_packets','-of','json',str(target)],capture_output=True,text=True,check=True).stdout)['packets']
  skip=next((s['skip_samples'] for s in packet_info[0].get('side_data_list',[]) if s.get('side_data_type')=='Skip Samples'),0)
  padding=next((s['discard_padding'] for s in packet_info[-1].get('side_data_list',[]) if s.get('side_data_type')=='Skip Samples'),0)
  encoded=sum(round(float(p['duration_time'])*RATE) for p in packet_info)
  assert encoded-skip-padding==stats['loopFrames'],'MP3 gapless region must match the authored PCM'
  stats.update({'id':name,'file':str(target.relative_to(ROOT)),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'title':score['title'],'bpm':score['bpm'],'loopBars':score['loopBars'],'channels':2,'mp3':{'encodedFrames':encoded,'skipSamples':skip,'discardPadding':padding}})
  rows.append(stats);print(name,json.dumps(stats))
 manifest={'source':'Original scores, sample-based FluidSynth rendering','renderer':'FluidSynth via system libfluidsynth.so.3; FFmpeg libmp3lame 128kbps','soundfont':{'name':FONT.name,'sha256':hashlib.sha256(FONT.read_bytes()).hexdigest(),'license':'GPL-2.0-only'},'assets':[r for r in rows if not r['id'].endswith('sketch')],'sketches':[r for r in rows if r['id'].endswith('sketch')]}
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')

if __name__=='__main__':main()
