const VOICE_PRIORITY={danger:3,extract:3,lowammo:2,reload:2,engage:2};
const VOICE_GROUP={follow:'formation',hold:'formation',stealth:'orders',cover:'orders',danger:'threat',search:'threat',engage:'threat'};
const VOICE_IDS=['start','brief','cross','keycard','radar','power','codes','capture','danger','search','follow','hold','stealth','cover','mark','engage','reload','smoke','decoy','lowammo','extract'];
export class GameAudio{
 constructor(){this.ctx=null;this.muted=false;this.volume=.65;this.levels={effects:.75,music:.32,voice:1};this.buffers=new Map();this.voiceQueue=[];this.spoken=new Map();this.active=false;this.lastBeat=0;this.lastBird=0;this.beat=0;this.voicePlays=0;this.voiceReadyAt=0;this.transients=new Set();this.lastEnemyShot=-100;}
 start(){
  if(this.ctx){this.ctx.resume();return;}
  try{
   this.ctx=new (window.AudioContext||window.webkitAudioContext)();
   const ctx=this.ctx;this.master=ctx.createGain();this.master.gain.value=this.muted?0:this.volume;this.limiter=ctx.createDynamicsCompressor();Object.assign(this.limiter.threshold,{value:-6});this.limiter.knee.value=6;this.limiter.ratio.value=12;this.limiter.attack.value=.003;this.limiter.release.value=.18;this.master.connect(this.limiter).connect(ctx.destination);
   this.effects=ctx.createGain();this.music=ctx.createGain();this.voice=ctx.createGain();
   for(const key of ['effects','music','voice']){this[key].gain.value=this.levels[key];this[key].connect(this.master);}
   this.noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate);const data=this.noiseBuffer.getChannelData(0);let brown=0;
   for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.025;data[i]=brown*7;}
   this.shotNoise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const shotData=this.shotNoise.getChannelData(0);for(let i=0;i<shotData.length;i++)shotData[i]=Math.random()*2-1;
   this.wind=this.ambience('lowpass',450,.09);this.rain=this.ambience('highpass',1800,.035);this.river=this.ambience('lowpass',900,.01);
   this.prepareVoices();
  }catch(error){console.warn('Audio unavailable:',error.message);}
 }
 ambience(type,frequency,level){const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();source.buffer=this.noiseBuffer;source.loop=true;filter.type=type;filter.frequency.value=frequency;gain.gain.value=level;source.connect(filter).connect(gain).connect(this.music);source.start();return gain;}
 async prepareVoices(){
  await Promise.all(VOICE_IDS.map(async id=>{try{const response=await fetch(`assets/audio/bn/${id}.mp3?v=male-bd-1`);if(!response.ok)return;const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(id,buffer);this.pumpVoice();}catch{}}));
 }
 setMuted(value){this.muted=value;if(this.master)this.master.gain.setTargetAtTime(value?0:this.volume,this.ctx.currentTime,.04);if(value){this.stopVoice();this.stopEffects();}}
 setLevel(channel,value){if(!(channel in this.levels))return;this.levels[channel]=Math.max(0,Math.min(1,Number(value)));}
 reset(){this.stopVoice();this.stopEffects();this.voiceReadyAt=0;this.spoken.clear();this.voicePlays=0;this.lastBeat=0;this.beat=0;}
 stopEffects(){for(const source of [...this.transients]){try{source.stop();}catch{}source.onended?.();}this.transients.clear();}
 track(source,nodes){this.transients.add(source);source.onended=()=>{source.onended=null;source.disconnect();for(const node of nodes)node.disconnect();this.transients.delete(source);};}
 stopVoice(){this.voiceQueue=[];const source=this.voiceSource;this.voiceSource=null;if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();this.voiceFilter?.disconnect();}this.voiceFilter=null;this.currentVoice=null;this.voiceReadyAt=(this.ctx?.currentTime||0)+.45;}
 speak(id){
  if(this.muted||!this.ctx||!VOICE_IDS.includes(id))return;
  const now=this.ctx.currentTime;
  if(this.currentVoice===id&&this.voiceSource||now-(this.spoken.get(id)??-100)<12||this.voiceQueue.some(item=>item.id===id))return;
  const group=VOICE_GROUP[id];if(group)this.voiceQueue=this.voiceQueue.filter(item=>VOICE_GROUP[item.id]!==group);
  this.voiceQueue.push({id,at:now,priority:VOICE_PRIORITY[id]||1});
  this.voiceQueue.sort((a,b)=>b.priority-a.priority||a.at-b.at);this.voiceQueue.length=Math.min(2,this.voiceQueue.length);this.pumpVoice();
 }
 pumpVoice(){
  if(this.voiceSource||!this.active||this.muted||this.ctx.currentTime<this.voiceReadyAt)return;
  const now=this.ctx.currentTime;this.voiceQueue=this.voiceQueue.filter(item=>now-item.at<10);
  const index=this.voiceQueue.findIndex(item=>this.buffers.has(item.id));if(index<0)return;
  const {id}=this.voiceQueue.splice(index,1)[0],source=this.ctx.createBufferSource();source.buffer=this.buffers.get(id);
  const filter=this.ctx.createBiquadFilter();filter.type='highpass';filter.frequency.value=85;
  source.connect(filter).connect(this.voice);this.voiceSource=source;this.voiceFilter=filter;this.currentVoice=id;this.spoken.set(id,now);this.voicePlays++;
  source.onended=()=>{source.disconnect();filter.disconnect();if(this.voiceSource!==source)return;this.voiceSource=null;this.voiceFilter=null;this.currentVoice=null;this.voiceReadyAt=this.ctx.currentTime+.45;};source.start();
 }
 tone(frequency=500,duration=.1,type='sine',volume=.1,bus=this.effects,delay=0){if(!this.ctx||this.muted||this.transients.size>=32)return;const t=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(Math.max(25,frequency*.7),t+duration);gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain).connect(bus);this.track(osc,[gain]);osc.start(t);osc.stop(t+duration);}
 noise(duration=.2,volume=.3,cutoff=2000,pan=0,delay=0){if(!this.ctx||this.muted||this.transients.size>=32)return;const t=this.ctx.currentTime+delay,source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain(),panner=this.ctx.createStereoPanner();source.buffer=this.shotNoise;filter.type='lowpass';filter.frequency.value=cutoff;gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);panner.pan.value=Math.max(-1,Math.min(1,pan));source.connect(filter).connect(gain).connect(panner).connect(this.effects);this.track(source,[filter,gain,panner]);source.start(t,Math.random());source.stop(t+duration);}
 footstep(player){this.noise(.08,player.crouch?.025:.07,Math.abs(player.x)<5?900:450,(this.beat%2?1:-1)*.12);}
 update(sim,mode){if(!this.ctx)return;const active=mode==='playing'||mode==='cinematic',now=this.ctx.currentTime;
  if(this.active&&!active){this.stopVoice();this.stopEffects();}this.active=active;
  const speaking=!!this.voiceSource||now<this.voiceReadyAt,duck=speaking?.18:1;
  this.effects.gain.setTargetAtTime(active?this.levels.effects*(speaking?.48:1):0,now,.12);
  this.voice.gain.setTargetAtTime(active?this.levels.voice:0,now,.08);
  this.music.gain.setTargetAtTime(active?this.levels.music*duck:0,now,.3);
  if(!active||this.muted)return;this.pumpVoice();
  this.river.gain.setTargetAtTime(Math.max(.005,.07-Math.abs(sim.player.x+92)*.003),now,.5);
  this.wind.gain.setTargetAtTime(.07+Math.sin(now*.15)*.02,now,.5);
  const tension=Math.min(1,sim.alarm/65),interval=1.1-tension*.55;
  if(now-this.lastBeat>interval){this.lastBeat=now;const notes=[110,130.82,146.84,130.82,110,164.82,146.84,98];this.tone(notes[this.beat++%notes.length],interval*.8,'sine',.08,this.music);if(tension>.25)this.tone(110,.18,'triangle',.07*tension,this.music,.25);}
  if(!speaking&&tension<.25&&now-this.lastBird>18){this.lastBird=now;this.tone(2400+Math.random()*600,.12,'sine',.012,this.music);this.tone(2700,.1,'sine',.009,this.music,.22);}
 }
 event(e,player){
  if(e.type==='dialogue'&&e.id)this.speak(e.id);if(e.type==='voice')this.speak(e.id);
  if(this.muted||!this.ctx)return;
  if(e.type==='shot'){const remote=e.enemy||e.buddy;if(remote&&this.ctx.currentTime-this.lastEnemyShot<.085)return;if(remote)this.lastEnemyShot=this.ctx.currentTime;const distance=Math.hypot(e.from.x-player.x,e.from.z-player.z),level=(e.enemy||e.buddy)?Math.max(.012,.3/(1+distance*.09)):.4,pan=(e.from.x-player.x)/25;
   this.noise(e.weapon==='marksman'?.28:.16,level,e.weapon==='carbine'?3400:2500,pan);this.tone(e.weapon==='marksman'?60:95,.09,'sine',level*.32);
   this.noise(.16,level*.12,800,pan,.065);this.noise(.035,level*.16,5000,pan,.07);
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
