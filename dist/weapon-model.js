import * as THREE from 'three';
import {WEAPONS} from './weapons.js';
import {mergeGeometries} from './vendor/addons/utils/BufferGeometryUtils.js';

const templates=new Map();

export function createWeaponModel() {
 const root=new THREE.Group(),variants={};
 const metal=new THREE.MeshStandardMaterial({color:'#303936',metalness:.78,roughness:.38});
 const polymer=new THREE.MeshStandardMaterial({color:'#3f493b',roughness:.85});
 const dark=new THREE.MeshStandardMaterial({color:'#101a19',metalness:.5,roughness:.4});
 for(const id of Object.keys(WEAPONS)){
  if(templates.has(id)){const group=templates.get(id).clone();root.add(group);variants[id]=group;group.visible=id==='rifle';continue;}
  const group=new THREE.Group();root.add(group);variants[id]=group;group.visible=id==='rifle';
  const box=(x,y,z,w,h,d,mat=metal)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;group.add(m);return m;};
  const tube=(x,y,z,r,length,mat=metal)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,length,10),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;group.add(m);return m;};
  const length=id==='carbine'?.5:id==='marksman'?.9:.7;
  box(0,0,.09,.11,.13,length); // receiver
  tube(0,.025,length*.5+.24,.025,length*.5);
  tube(0,.025,WEAPONS[id].muzzle-.05,.038,.1,dark);
  box(0,-.12,0,.085,.17,.1,polymer).rotation.x=-.2; // grip
  box(0,-.15,.16,.08,id==='marksman'?.13:.24,.15,dark).rotation.x=.12;
  box(0,.015,-.34,.12,.16,.28,polymer);box(0,.015,-.49,.14,.19,.045,dark);
  for(let i=0;i<6;i++)box(0,.082,.13+i*.045,.13,.025,.016,dark); // rail
  if(id==='marksman'){tube(0,.16,.05,.065,.27,dark);box(0,.09,.04,.06,.06,.1);}
  else{box(0,.13,.1,.055,.08,.09,dark);box(0,.12,length*.5,.025,.07,.025,dark);}
  // Bake small weapon details into three shared meshes, rather than dozens of draws per guard.
  const parts=[...group.children];
  for(const material of [metal,polymer,dark]){
   const geometries=parts.filter(m=>m.material===material).map(m=>{m.updateMatrix();const g=m.geometry.toNonIndexed();g.applyMatrix4(m.matrix);return g;});
   if(geometries.length){const mesh=new THREE.Mesh(mergeGeometries(geometries),material);mesh.castShadow=true;group.add(mesh);geometries.forEach(g=>g.dispose());}
  }
  for(const part of parts){group.remove(part);part.geometry.dispose();}
  templates.set(id,group);
 }
 root.userData.variants=variants;
 const muzzle=new THREE.Object3D();muzzle.position.set(0,.025,.86);root.add(muzzle);root.userData.muzzle=muzzle;
 root.userData.select=id=>{id=WEAPONS[id]?id:'rifle';for(const [key,g] of Object.entries(variants))g.visible=key===id;muzzle.position.z=WEAPONS[id].muzzle;};
 return root;
}
