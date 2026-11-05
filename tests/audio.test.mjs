import test from 'node:test';
import assert from 'node:assert/strict';
import {GameAudio} from '../dist/audio.js';

function fixture(){
 const audio=new GameAudio(),sources=[];
 const node=()=>({connect(next){return next;},disconnect(){this.disconnected=true;}});
 audio.ctx={currentTime:0,createBufferSource(){const s={...node(),start(){this.started=true;},stop(){this.stopped=true;}};sources.push(s);return s;},createBiquadFilter(){return {...node(),frequency:{value:0}};}};
 audio.active=true;audio.voice=node();for(const id of ['start','brief','follow','hold','danger','reload','search'])audio.buffers.set(id,{});
 return {audio,sources};
}
test('dialogue is serial with a breathing gap and duplicate requests cannot overlap',()=>{
 const {audio,sources}=fixture();audio.speak('start');audio.speak('start');audio.speak('brief');
 assert.equal(sources.length,1);assert.equal(audio.voiceQueue.length,1);
 sources[0].onended();audio.pumpVoice();assert.equal(sources.length,1);
 audio.ctx.currentTime=.5;audio.pumpVoice();assert.equal(sources.length,2);assert.equal(audio.currentVoice,'brief');
 assert.equal(sources[0].disconnected,true);
});
test('new orders replace queued old orders, urgent dialogue wins, and stale chatter expires',()=>{
 const {audio}=fixture();audio.speak('start');audio.speak('follow');audio.speak('hold');
 assert.deepEqual(audio.voiceQueue.map(x=>x.id),['hold']);audio.speak('danger');assert.equal(audio.voiceQueue[0].id,'danger');
 audio.voiceSource.onended();audio.ctx.currentTime=11;audio.pumpVoice();assert.equal(audio.voiceSource,null);assert.equal(audio.voiceQueue.length,0);
});
test('pause/reset stop and disconnect speech and all delayed sound effects',()=>{
 const {audio,sources}=fixture();audio.speak('start');const filter=audio.voiceFilter;
 const transient={stop(){this.stopped=true;},disconnect(){this.disconnected=true;}};audio.track(transient,[]);
 audio.reset();assert.equal(sources[0].stopped,true);assert.equal(sources[0].disconnected,true);assert.equal(filter.disconnected,true);
 assert.equal(audio.voiceSource,null);assert.equal(audio.voiceQueue.length,0);assert.equal(transient.stopped,true);assert.equal(audio.transients.size,0);
});
