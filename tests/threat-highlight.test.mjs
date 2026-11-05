import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ThreatHighlight} from '../dist/threat-highlight.js';

function fixture(){
 const model=new THREE.Group(),mesh=new THREE.SkinnedMesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());
 const bone=new THREE.Bone();mesh.add(bone);mesh.bind(new THREE.Skeleton([bone]));model.add(mesh);
 return {mesh,highlight:new ThreatHighlight(model)};
}
test('threat silhouette shares animated skeleton and renders through occluders without changing depth',()=>{
 const {mesh,highlight}=fixture(),overlay=highlight.meshes[0];
 assert.equal(overlay.skeleton,mesh.skeleton);assert.equal(overlay.geometry,mesh.geometry);
 assert.equal(overlay.material.depthTest,false);assert.equal(overlay.material.depthWrite,false);
 assert.equal(overlay.renderOrder,1000);assert.equal(overlay.castShadow,false);
 highlight.update({state:'patrol'},.05,0);assert.equal(overlay.visible,false);
 for(const state of ['suspicious','investigate','search','combat']){
  highlight.update({state},.05,1);assert.equal(overlay.visible,true);assert.ok(highlight.material.opacity>0);
 }
 highlight.update({state:'patrol'},.05,2);assert.equal(overlay.visible,false);
});
test('firing flash expires and downed enemies or menu never expose silhouettes',()=>{
 const {highlight}=fixture(),overlay=highlight.meshes[0];
 highlight.shot();highlight.update({state:'patrol'},.05,1);assert.equal(overlay.visible,true);
 assert.equal(highlight.material.color.getHex(),0xffead1);
 highlight.update({state:'patrol'},1,2);assert.equal(overlay.visible,false);
 highlight.shot();highlight.update({state:'down'},.05,3);assert.equal(overlay.visible,false);assert.equal(highlight.flash,0);
 highlight.update({state:'combat'},.05,3,false);assert.equal(overlay.visible,false);
 const geometry=overlay.geometry;let disposed=false;geometry.addEventListener('dispose',()=>disposed=true);
 highlight.dispose();assert.equal(overlay.parent,null);assert.equal(disposed,false);
});
