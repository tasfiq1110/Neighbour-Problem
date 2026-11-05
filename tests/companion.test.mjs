import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,Navigation} from '../dist/simulation.js';
import {updateCompanion} from '../dist/companion.js';
function encounter(){const s=new Simulation();s.nav=new Navigation([]);Object.assign(s.player,{x:-5,z:0,weapon:false});Object.assign(s.buddy,{x:0,z:0,angle:0,follow:false});const g=s.makeGuard(0,15,0);g.state='combat';s.guards=[g];return s;}
const advance=(s,n)=>{for(let i=0;i<n;i++)updateCompanion(s,.05);};
test('companion fires while holding position and player is unarmed',()=>{const s=encounter();advance(s,25);assert.ok(s.buddy.shots>=3);assert.ok(s.guards[0].health<100);assert.ok(s.events.some(e=>e.type==='shot'&&e.shooterId==='buddy'));});
test('hold-fire command, walls, smoke and friendlies block companion fire',()=>{
 for(const condition of ['orders','wall','smoke','friendly']){const s=encounter();if(condition==='orders')s.command('roe');if(condition==='wall')s.nav=new Navigation([{x:0,z:8,w:6,d:1}]);if(condition==='smoke')s.smokes=[{x:0,z:15,r:4,life:10}];if(condition==='friendly')Object.assign(s.player,{x:0,z:7});advance(s,40);assert.equal(s.buddy.shots,0,condition);}
});
test('marked targets can be engaged without automatic attacks on unaware patrols',()=>{const s=encounter();s.guards[0].state='patrol';advance(s,20);assert.equal(s.buddy.shots,0);s.markedTarget={id:0,life:15};advance(s,20);assert.ok(s.buddy.shots>0);});
test('companion reload transfers finite reserve ammunition',()=>{const s=encounter();s.buddy.mag=0;s.buddy.reserve=5;updateCompanion(s,.05);assert.ok(s.buddy.reload>0);advance(s,43);assert.ok(s.buddy.mag<=5);assert.equal(s.buddy.reserve,0);assert.equal(s.buddy.mag+s.buddy.shots,5);});
