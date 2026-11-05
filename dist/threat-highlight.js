import * as THREE from 'three';

// A shared animated skeleton keeps the x-ray silhouette exactly on the enemy.
// No extra lights, textures, or geometry are allocated when a guard fires.
export class ThreatHighlight {
 constructor(model) {
  this.material=new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:0,depthTest:false,depthWrite:false,toneMapped:false,fog:false});
  this.meshes=[];
  this.flash=0;
  const sources=[];
  model.traverse(mesh=>{if(mesh.isMesh)sources.push(mesh);});
  for(const source of sources){
   const overlay=source.isSkinnedMesh?new THREE.SkinnedMesh(source.geometry,this.material):new THREE.Mesh(source.geometry,this.material);
   overlay.name='enemy-threat-overlay';
   overlay.position.copy(source.position);overlay.quaternion.copy(source.quaternion);overlay.scale.copy(source.scale);
   if(source.isSkinnedMesh){overlay.bindMode=source.bindMode;overlay.bind(source.skeleton,source.bindMatrix);}
   overlay.renderOrder=1000;overlay.frustumCulled=false;overlay.visible=false;
   source.parent.add(overlay);this.meshes.push(overlay);
  }
 }
 shot(){this.flash=.65;}
 update(data,dt,time,enabled=true){
  this.flash=Math.max(0,this.flash-dt);
  const alive=data.state!=='down';
  const alerted=['combat','suspicious','search','investigate'].includes(data.state)||(data.awareness||0)>.15;
  const active=enabled&&alive&&(alerted||this.flash>0);
  const firing=this.flash>0;
  const combat=data.state==='combat';
  this.material.color.setHex(firing?0xffead1:combat?0xff4938:0xffbb45);
  const target=active?(firing?.72:combat?.36:.26)+Math.sin(time*(firing?18:5))*.055:0;
  this.material.opacity=active?THREE.MathUtils.lerp(this.material.opacity,target,1-Math.exp(-dt*18)):0;
  for(const mesh of this.meshes)mesh.visible=active;
  if(!alive)this.flash=0;
 }
 warmup(){this.material.opacity=.4;for(const mesh of this.meshes)mesh.visible=true;}
 dispose(){for(const mesh of this.meshes)mesh.removeFromParent();this.material.dispose();}
}
