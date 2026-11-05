import test from 'node:test';
import assert from 'node:assert/strict';
import {detectInputMode} from '../dist/input-profile.js';
test('device controls do not depend on viewport width',()=>{
 assert.equal(detectInputMode({userAgent:'Mozilla Windows NT 10.0',coarse:false}),'desktop');
 assert.equal(detectInputMode({userAgent:'Mozilla Windows NT 10.0',maxTouchPoints:10,coarse:true}),'desktop');
 assert.equal(detectInputMode({mobile:true,userAgent:'Android',maxTouchPoints:5,coarse:true}),'touch');
 assert.equal(detectInputMode({userAgent:'iPhone',maxTouchPoints:5}),'touch');
 assert.equal(detectInputMode({platform:'MacIntel',userAgent:'Macintosh',maxTouchPoints:5}),'touch');
 assert.equal(detectInputMode({platform:'MacIntel',userAgent:'Macintosh',maxTouchPoints:0}),'desktop');
});
