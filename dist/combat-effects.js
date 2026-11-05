import * as THREE from 'three';

// Fixed allocations and no transient lights: firing never changes shader light counts.
export class CombatEffects {
 constructor(scene, texture) {
  this.scene=scene;this.pool=[];this.clock=0;
  for(let i=0;i<96;i++){
   const material=new THREE.SpriteMaterial({map:texture,color:'#fff0b2',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
   const mesh=new THREE.Sprite(material);scene.add(mesh);this.pool.push({mesh,type:'sprite',life:0,velocity:new THREE.Vector3()});
  }
  const shellGeometry=new THREE.CylinderGeometry(.025,.025,.11,5);
  for(let i=0;i<24;i++){
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:'#ffd788',transparent:true,opacity:0,depthWrite:false}));
   const shell=new THREE.Mesh(shellGeometry,new THREE.MeshBasicMaterial({color:'#b69245',transparent:true,opacity:0}));
   for(const [mesh,type] of [[line,'line'],[shell,'shell']]){scene.add(mesh);this.pool.push({mesh,type,life:0,velocity:new THREE.Vector3()});}
  }
 }
 ready(){for(const p of this.pool)p.mesh.visible=false;}
 take(type,life){const p=this.pool.find(p=>p.type===type&&p.life<=0)||this.pool.filter(p=>p.type===type).reduce((a,b)=>a.life<b.life?a:b);p.life=p.max=life;p.mesh.visible=true;p.mesh.material.opacity=1;p.velocity.set(0,0,0);return p;}
 sprite(position,color,size,life,velocity){const p=this.take('sprite',life);p.mesh.position.copy(position);p.mesh.scale.setScalar(size);p.mesh.material.color.set(color);if(velocity)p.velocity.copy(velocity);}
 shot(from,to,enemy){
  const line=this.take('line',.065),a=line.mesh.geometry.attributes.position;a.setXYZ(0,from.x,from.y,from.z);a.setXYZ(1,to.x,to.y,to.z);a.needsUpdate=true;line.mesh.geometry.computeBoundingSphere();line.mesh.material.color.set(enemy?'#ff9870':'#ffe0a0');
  this.sprite(from,'#fff0b2',.48,.055);
  this.sprite(from,'#927b61',.35,.4,new THREE.Vector3(0,.5,0));
  for(let i=0;i<4;i++)this.sprite(to,'#d6bc8d',.12,.22,new THREE.Vector3(Math.sin(i*2)*2,1+i*.2,Math.cos(i*2)*2));
  const shell=this.take('shell',.8);shell.mesh.position.copy(from);shell.velocity.set(1.7,2.2,.4);
 }
 update(dt){for(const p of this.pool){if(p.life<=0)continue;p.life-=dt;p.mesh.visible=p.life>0;if(p.life<=0)continue;p.mesh.material.opacity=Math.min(1,p.life/p.max*2);p.mesh.position.addScaledVector(p.velocity,dt);if(p.type==='shell'){p.velocity.y-=9.8*dt;p.mesh.rotation.x+=dt*15;p.mesh.rotation.z+=dt*9;}}}
}
