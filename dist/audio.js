const VOICE_IDS=['start','brief','cross','keycard','radar','power','codes','capture','danger','search','follow','hold','stealth','cover','mark','engage','reload','smoke','decoy','lowammo','extract'];
export class GameAudio{
 constructor(){this.ctx=null;this.muted=false;this.volume=.65;this.levels={effects:.75,music:.32,voice:1};this.buffers=new Map();this.voiceQueue=[];this.spoken=new Map();this.active=false;this.lastBeat=0;this.lastBird=0;this.beat=0;this.voicePlays=0;}
 start(){
  if(this.ctx){this.ctx.resume();return;}
  try{
   this.ctx=new (window.AudioContext||window.webkitAudioContext)();
   const ctx=this.ctx;this.master=ctx.createGain();this.master.gain.value=this.muted?0:this.volume;this.master.connect(ctx.destination);
   this.effects=ctx.createGain();this.music=ctx.createGain();this.voice=ctx.createGain();
   for(const key of ['effects','music','voice']){this[key].gain.value=this.levels[key];this[key].connect(this.master);}
   this.noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate);const data=this.noiseBuffer.getChannelData(0);let brown=0;
   for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.025;data[i]=brown*7;}
   this.wind=this.ambience('lowpass',450,.09);this.rain=this.ambience('highpass',1800,.035);this.river=this.ambience('lowpass',900,.01);
   this.prepareVoices();
  }catch(error){console.warn('Audio unavailable:',error.message);}
 }
 ambience(type,frequency,level){const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();source.buffer=this.noiseBuffer;source.loop=true;filter.type=type;filter.frequency.value=frequency;gain.gain.value=level;source.connect(filter).connect(gain).connect(this.music);source.start();return gain;}
 async prepareVoices(){
  await Promise.all(VOICE_IDS.map(async id=>{try{const response=await fetch(`assets/audio/bn/${id}.mp3?v=male-bd-1`);if(!response.ok)return;const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(id,buffer);this.pumpVoice();}catch{}}));
 }
 setMuted(value){this.muted=value;if(this.master)this.master.gain.setTargetAtTime(value?0:this.volume,this.ctx.currentTime,.04);if(value)this.stopVoice();}
 setLevel(channel,value){if(!(channel in this.levels))return;this.levels[channel]=Math.max(0,Math.min(1,Number(value)));}
 reset(){this.stopVoice();this.spoken.clear();this.voicePlays=0;this.lastBeat=0;this.beat=0;}
 stopVoice(){this.voiceQueue=[];if(this.voiceSource){this.voiceSource.onended=null;try{this.voiceSource.stop();}catch{}this.voiceSource=null;}}
 speak(id){if(this.muted||!this.ctx||!VOICE_IDS.includes(id))return;const now=this.ctx.currentTime;if(now-(this.spoken.get(id)??-100)<12)return;this.spoken.set(id,now);if(this.voiceQueue.length>=2)this.voiceQueue.pop();this.voiceQueue.push(id);this.pumpVoice();}
 pumpVoice(){if(this.voiceSource||!this.active||this.muted||!this.voiceQueue.length)return;const id=this.voiceQueue[0],buffer=this.buffers.get(id);if(!buffer)return;this.voiceQueue.shift();const source=this.ctx.createBufferSource();source.buffer=buffer;const filter=this.ctx.createBiquadFilter();filter.type='highpass';filter.frequency.value=180;source.connect(filter).connect(this.voice);this.voiceSource=source;this.voicePlays++;source.onended=()=>{source.disconnect();filter.disconnect();this.voiceSource=null;this.pumpVoice();};source.start();}
 tone(frequency=500,duration=.1,type='sine',volume=.1,bus=this.effects,delay=0){if(!this.ctx)return;const t=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(Math.max(25,frequency*.7),t+duration);gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain).connect(bus);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(t);osc.stop(t+duration);}
 noise(duration=.2,volume=.3,cutoff=2000,pan=0,delay=0){if(!this.ctx)return;const t=this.ctx.currentTime+delay,source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain(),panner=this.ctx.createStereoPanner();source.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=cutoff;gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);panner.pan.value=Math.max(-1,Math.min(1,pan));source.connect(filter).connect(gain).connect(panner).connect(this.effects);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();panner.disconnect();};source.start(t,Math.random()*2);source.stop(t+duration);}
 footstep(player){this.noise(.08,player.crouch?.025:.07,Math.abs(player.x)<5?900:450,(this.beat%2?1:-1)*.12);}
 update(sim,mode){if(!this.ctx)return;const active=mode==='playing'||mode==='cinematic',now=this.ctx.currentTime;
  if(this.active&&!active)this.stopVoice();this.active=active;
  const duck=this.voiceSource?.38:1;
  this.effects.gain.setTargetAtTime(active?this.levels.effects:0,now,.12);
  this.voice.gain.setTargetAtTime(active?this.levels.voice:0,now,.08);
  this.music.gain.setTargetAtTime(active?this.levels.music*duck:0,now,.3);
  if(!active||this.muted)return;this.pumpVoice();
  this.river.gain.setTargetAtTime(Math.max(.005,.07-Math.abs(sim.player.x+92)*.003),now,.5);
  this.wind.gain.setTargetAtTime(.07+Math.sin(now*.15)*.02,now,.5);
  const tension=Math.min(1,sim.alarm/65),interval=1.1-tension*.55;
  if(now-this.lastBeat>interval){this.lastBeat=now;const notes=[110,130.82,146.84,130.82,110,164.82,146.84,98];this.tone(notes[this.beat++%notes.length],1.6,'sine',.15,this.music);if(tension>.25)this.tone(110,.18,'triangle',.07*tension,this.music,.25);}
  if(now-this.lastBird>5.5){this.lastBird=now;this.tone(2400+Math.random()*600,.12,'sine',.012,this.music);this.tone(2700,.1,'sine',.009,this.music,.22);}
 }
 event(e,player){
  if(e.type==='dialogue'&&e.id)this.speak(e.id);if(e.type==='voice')this.speak(e.id);
  if(e.type==='shot'){const distance=Math.hypot(e.from.x-player.x,e.from.z-player.z),level=(e.enemy||e.buddy)?Math.max(.02,.45-distance*.009):.62,pan=(e.from.x-player.x)/25;
   this.noise(e.weapon==='marksman'?.28:.16,level,e.weapon==='carbine'?3400:2500,pan);this.tone(e.weapon==='marksman'?60:95,.13,'triangle',level*.6);
   this.noise(.2,level*.2,800,pan,.09);this.noise(.035,level*.16,5000,pan,.07);if(!e.hit)this.tone(1400,.07,'sine',level*.035,this.effects,.1);
  }
  if(e.type==='reload'){this.noise(.1,.16,1800);this.noise(.08,.12,2800,0,.75);}
  if(e.type==='loaded'||e.type==='equip')this.noise(.1,.25,3200);
  if(e.type==='melee')this.noise(.16,.16,600);
  if(e.type==='impact'){this.noise(.1,.34,300);this.tone(75,.12,'sine',.18);}
  if(e.type==='hurt')this.tone(60,.18,'sine',.23);
  if(['objective','pickup','healed'].includes(e.type)){this.tone(620,.12);this.tone(900,.2,'sine',.08,this.effects,.12);}
  if(e.type==='radio'||e.type==='reinforcement'){this.noise(.2,.08,1100);this.tone(1100,.1,'square',.04);}
  if(e.type==='smoke')this.noise(.8,.25,850);
  if(e.type==='decoy'){this.tone(430,.12,'triangle',.2);this.noise(.15,.15,1600,.4,.13);}
 }
}
