import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Simulation,Navigation} from '../dist/simulation.js';
import {CombatEffects} from '../dist/combat-effects.js';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)s.step(.05,input);};
function range(){const s=new Simulation();s.guards=[];s.training=true;s.nav=new Navigation([]);Object.assign(s.player,{x:0,z:20,angle:0});s.acquireWeapon('rifle',80);return s;}
test('burst fires exactly three rounds per trigger, even when held',()=>{
 const s=range();s.command('firemode');tick(s,30,{fire:true});assert.equal(s.shots,3);assert.equal(s.player.mag,21);
 tick(s,2);tick(s,30,{fire:true});assert.equal(s.shots,6);
});
test('switching weapons preserves magazines; marksman remains semi automatic',()=>{
 const s=range();s.attack();s.acquireWeapon('carbine');s.acquireWeapon('marksman');s.switchWeapon();assert.equal(s.player.mag,0);
 s.command('reload');tick(s,40);assert.equal(s.player.mag,30);s.switchWeapon();s.command('reload');tick(s,60);tick(s,30,{fire:true});assert.equal(s.shots,2);
 s.switchWeapon();assert.equal(s.player.mag,23);
});
test('reload cancels queued burst and cannot create ammunition',()=>{
 const s=range();s.command('firemode');tick(s,1,{fire:true});s.command('reload');const before=s.player.mag+s.player.reserve;tick(s,60);assert.equal(s.shots,1);assert.equal(s.player.mag+s.player.reserve,before);
});
test('rear takedown has delayed impact; front strike is not a silent knockout',()=>{
 for(const behind of [true,false]){const s=range();const g=s.makeGuard(0,22,0);g.angle=behind?0:Math.PI;g.patrol=[{x:0,z:22}];s.guards=[g];s.command('melee');assert.equal(g.health,100);tick(s,8);assert.equal(g.health,behind?0:60);assert.equal(s.noises.length,behind?0:1);}
});
test('sustained combat reuses GPU objects and never adds lights',()=>{
 const scene=new THREE.Scene(),effects=new CombatEffects(scene,new THREE.Texture());effects.ready();const count=scene.children.length;
 for(let i=0;i<500;i++){effects.shot(new THREE.Vector3(),new THREE.Vector3(0,1,20),false);effects.update(.02);}
 assert.equal(scene.children.length,count);assert.equal(scene.children.filter(o=>o.isLight).length,0);effects.update(2);assert.ok(scene.children.every(o=>!o.visible));
});
