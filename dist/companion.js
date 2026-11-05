const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const turn=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));

export function updateCompanion(sim,dt){
 const b=sim.buddy,p=sim.player;
 b.fire=Math.max(0,b.fire-dt);b.voiceCooldown=Math.max(0,(b.voiceCooldown||0)-dt);
 b.recoil=Math.max(0,(b.recoil||0)-dt);
 if(b.reload>0){b.reload=Math.max(0,b.reload-dt);if(!b.reload){const rounds=Math.min(18-b.mag,b.reserve);b.mag+=rounds;b.reserve-=rounds;}b.targetId=null;return;}
 const candidates=sim.guards.filter(g=>g.state!=='down'&&distance(b,g)<32&&sim.nav.clear(b,g)&&!sim.inSmoke(b)&&!sim.inSmoke(g)&&
   (g.id===sim.markedTarget?.id||g.state==='combat'||(g.health<100&&g.lastSeen&&distance(g,p)<40)));
 candidates.sort((a,c)=>(a.id===sim.markedTarget?.id?-100:distance(b,a))-(c.id===sim.markedTarget?.id?-100:distance(b,c)));
 const target=b.roe==='cover'?candidates[0]:null;
 b.targetId=target?.id??null;
 if(!target){b.burst=0;return;}
 const angle=Math.atan2(target.x-b.x,target.z-b.z);
 b.angle+=Math.max(-dt*8,Math.min(dt*8,turn(angle,b.angle)));
 if(b.mag===0){if(b.reserve>0){b.reload=2.1;b.burst=0;sim.emit('voice',{id:'reload'});}return;}
 if(b.fire>0||Math.abs(turn(angle,b.angle))>.15)return;
 // Do not fire through the player or the escorted character.
 const dx=target.x-b.x,dz=target.z-b.z,length2=dx*dx+dz*dz;
 const blocked=[p,...(sim.captured?[sim.captive]:[])].some(friend=>{const t=((friend.x-b.x)*dx+(friend.z-b.z)*dz)/length2;return t>0&&t<1&&Math.hypot(friend.x-b.x-t*dx,friend.z-b.z-t*dz)<.7;});
 if(blocked)return;
 b.mag--;b.shots++;b.recoil=.12;b.burst=(b.burst||0)+1;
 b.fire=b.burst<3?.18:.85;if(b.burst>=3)b.burst=0;
 sim.harm(target,18,true);sim.noise(b,46);target.suppressed=.65;
 sim.emit('shot',{from:{x:b.x,z:b.z},to:{x:target.x,z:target.z},hit:true,enemy:false,buddy:true,shooterId:'buddy',weapon:'rifle',angle});
 if(!b.voiceCooldown){sim.emit('voice',{id:'engage'});b.voiceCooldown=18;}
}
