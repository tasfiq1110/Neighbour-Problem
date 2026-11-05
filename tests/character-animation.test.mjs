import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {CharacterAnimation} from '../dist/character-animation.js';
import {Simulation, Navigation, dist} from '../dist/simulation.js';

// Exercise the shipped skeleton and clips without needing a GPU or textures.
function fixture() {
  const file=fs.readFileSync(new URL('../dist/assets/models/Soldier.glb',import.meta.url));
  const length=file.readUInt32LE(12), gltf=JSON.parse(file.subarray(20,20+length));
  const binary=file.subarray(28+length);
  const nodes=gltf.nodes.map(n=>{
    const b=new THREE.Bone();b.name=THREE.PropertyBinding.sanitizeNodeName(n.name||'');
    if(n.translation)b.position.fromArray(n.translation);
    if(n.rotation)b.quaternion.fromArray(n.rotation);
    if(n.scale)b.scale.fromArray(n.scale);
    if(n.matrix)new THREE.Matrix4().fromArray(n.matrix).decompose(b.position,b.quaternion,b.scale);
    return b;
  });
  gltf.nodes.forEach((n,i)=>n.children?.forEach(c=>nodes[i].add(nodes[c])));
  const root=new THREE.Group(), facing=new THREE.Group(), model=new THREE.Group();
  root.add(facing);facing.rotation.y=Math.PI;facing.add(model);model.scale.setScalar(1.18);
  gltf.scenes[gltf.scene||0].nodes.forEach(i=>model.add(nodes[i]));
  const read=index=>{
    const a=gltf.accessors[index], view=gltf.bufferViews[a.bufferView];
    const size={SCALAR:1,VEC3:3,VEC4:4}[a.type], out=[];
    for(let i=0;i<a.count;i++)for(let k=0;k<size;k++)out.push(binary.readFloatLE((view.byteOffset||0)+(a.byteOffset||0)+i*(view.byteStride||size*4)+k*4));
    return out;
  };
  const mixer=new THREE.AnimationMixer(model),actions={};
  for(const animation of gltf.animations){
    const tracks=animation.channels.map(channel=>{
      const s=animation.samplers[channel.sampler], path=channel.target.path;
      const Track=path==='rotation'?THREE.QuaternionKeyframeTrack:THREE.VectorKeyframeTrack;
      return new Track(nodes[channel.target.node].name+'.'+({translation:'position',rotation:'quaternion',scale:'scale'}[path]),read(s.input),read(s.output));
    });
    actions[animation.name]=mixer.clipAction(new THREE.AnimationClip(animation.name,-1,tracks));
  }
  const weapon=new THREE.Group();root.add(weapon);
  return new CharacterAnimation(root,model,mixer,actions,weapon);
}

test('real soldier keeps both hands on rifle through gait, heading and crouch changes',()=>{
  const rig=fixture();let x=0;
  for(let i=0;i<240;i++){
    const speed=i<60?0:i<150?5.6:9.5;x+=speed/60;
    rig.root.position.set(x,0,0);rig.root.rotation.y=i*.03;rig.root.scale.y=i>180?.73:1;
    rig.update({x,z:0,fire:i%8===0?.14:0},1/60,true);
    const wrist=rig.root.worldToLocal(rig.bones.RightHand.getWorldPosition(new THREE.Vector3()));
    assert.ok(wrist.distanceTo(rig.weapon.position.clone().add(new THREE.Vector3(0,-.07,0)))<.001);
    const support=rig.root.worldToLocal(rig.bones.LeftHand.getWorldPosition(new THREE.Vector3()));
    const error=support.distanceTo(rig.weapon.position.clone().add(new THREE.Vector3(0,-.06,.22)));
    assert.ok(error<.015,`support-hand error ${error} at frame ${i}`);
  }
  assert.ok(rig.actions.Run.getEffectiveWeight()>.9);
  for(let i=0;i<90;i++)rig.update({x,z:0},1/60,true);
  assert.ok(rig.actions.Idle.getEffectiveWeight()>.99);
});

test('companion settles without repeated start/stop at follow boundary',()=>{
  const sim=new Simulation();sim.guards=[];sim.nav=new Navigation([]);
  Object.assign(sim.player,{x:0,z:0});Object.assign(sim.buddy,{x:0,z:12});
  let transitions=0,wasMoving=false;
  for(let i=0;i<300;i++){
    sim.step(.05);
    if(!!sim.buddy.moving!==wasMoving)transitions++;
    wasMoving=!!sim.buddy.moving;
  }
  assert.ok(transitions<=2);assert.ok(dist(sim.buddy,sim.player)<2.8);
  sim.player.z-=.5;sim.step(.05);assert.equal(sim.buddy.moving,false);
});
