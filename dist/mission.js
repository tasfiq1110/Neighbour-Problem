export const WORLD={x:120,z:170};
export const ROUTES=[-88,-34,26,88];
export const DIFFICULTIES={
 story:{name:'অভিযাত্রী',en:'Operative',vision:.82,damage:7,notice:.65,ammo:90,meds:3,reinforcements:3},
 veteran:{name:'দুর্ধর্ষ',en:'Veteran',vision:1.08,damage:14,notice:1.2,ammo:48,meds:2,reinforcements:7},
 ghost:{name:'ছায়াযোদ্ধা',en:'Ghost',vision:1.28,damage:20,notice:1.55,ammo:24,meds:1,reinforcements:10}
};
export const OBJECTIVES=[
 {id:'brief',x:9,z:143,duration:1.5,bn:'অভিযানের নথি সংগ্রহ করুন',en:'Collect the operation dossier',desc:'ঘাঁটির টেবিল থেকে পথনকশা নিন। কাজ করতে E ধরে রাখুন।',edesc:'Hold E at the safehouse table to collect the route dossier.'},
 {id:'cross',x:-34,z:-10,duration:0,bn:'সীমান্তের ওপারে পৌঁছান',en:'Cross the frontier',desc:'চারটি প্রবেশপথ খোলা আছে। আলো, টহল ও নজরদারি ক্যামেরা এড়িয়ে চলুন।',edesc:'Choose one of four crossings. Avoid patrols, searchlights and cameras.'},
 {id:'keycard',x:-72,z:-43,duration:2.4,bn:'ডিপোর প্রবেশপত্র সংগ্রহ করুন',en:'Recover the depot access card',desc:'পশ্চিমের ডিপোতে প্রবেশপত্র ও অস্ত্র আছে। প্রয়োজনে পাহারাদারকে পেছন থেকে কাবু করুন।',edesc:'The western depot holds an access card and rifle. Approach quietly.'},
 {id:'radar',x:68,z:-58,duration:4,bn:'রেডিও যোগাযোগ বিচ্ছিন্ন করুন',en:'Disable the radio relay',desc:'পূর্বের রিলে স্টেশন বন্ধ করুন। শত্রুর অতিরিক্ত দল আসার পথ আটকে যাবে।',edesc:'Disable the eastern relay to prevent further reinforcements.'},
 {id:'power',x:-32,z:-99,duration:3,bn:'কম্পাউন্ডের বিদ্যুৎ বন্ধ করুন',en:'Cut power to the compound',desc:'জেনারেটর নিষ্ক্রিয় করুন। সার্চলাইট ও নজরদারি ক্যামেরা বন্ধ হয়ে যাবে।',edesc:'Shut down the generator to disable cameras and searchlights.'},
 {id:'codes',x:-65,z:-134,duration:4,bn:'ভল্টের সংকেত উদ্ধার করুন',en:'Recover the vault codes',desc:'আর্কাইভের টার্মিনাল থেকে সংকেত নিন। আপলোডের সময় সতর্ক থাকুন।',edesc:'Download the vault codes from the archive terminal. Stay covered.'},
 {id:'capture',x:18,z:-142,duration:3,bn:'ভিক্টর সেবলকে আটক করুন',en:'Capture Viktor Sable',desc:'ভিক্টর সেবল একজন সম্পূর্ণ কাল্পনিক চোরাচালান-চক্রের নেতা। প্রহরী সরিয়ে তাকে আটক করুন।',edesc:'Sable is a wholly fictional smuggling kingpin. Clear nearby guards and secure him.'},
 {id:'extract',x:78,z:140,duration:25,bn:'বন্দিকে নিয়ে ঘাঁটিতে ফিরুন',en:'Escort the captive to extraction',desc:'সেবলকে সঙ্গে নিয়ে দক্ষিণ-পূর্বের ঘাটে ফিরুন। নৌকা প্রস্তুত হওয়া পর্যন্ত এলাকা ধরে রাখুন।',edesc:'Escort Sable to the southeast dock. Hold the extraction zone until the boat is ready.'}
];
export const BUILDINGS=[
 {x:-13,z:143,w:18,d:14,h:5,type:'safe'},
 {x:24,z:105,w:14,d:11,h:5,type:'home'}, {x:47,z:87,w:12,d:14,h:6,type:'home'},
 {x:9,z:74,w:15,d:12,h:5,type:'shop'}, {x:-26,z:95,w:17,d:12,h:5,type:'home'},
 {x:-54,z:64,w:15,d:10,h:5,type:'home'}, {x:61,z:45,w:18,d:13,h:5,type:'depot'},
 {x:-75,z:-51,w:24,d:16,h:6,type:'depot',open:true},
 {x:65,z:-67,w:16,d:14,h:5,type:'radar',open:true},
 {x:-30,z:-107,w:13,d:10,h:5,type:'utility'},
 {x:-65,z:-144,w:23,d:18,h:7,type:'archive',open:true},
 {x:18,z:-151,w:31,d:21,h:9,type:'compound',open:true},
 {x:62,z:-128,w:17,d:15,h:6,type:'barracks'},
 {x:-10,z:-58,w:13,d:14,h:5,type:'barracks'}, {x:25,z:-34,w:13,d:11,h:5,type:'barracks'},
 {x:85,z:135,w:9,d:7,h:4,type:'dock'}
];
export const CRATES=[[-49,21,5,3],[-11,18,4,3],[40,16,4,3],[-93,-23,5,3],[-54,-33,4,3],[-71,-29,5,3],[53,-47,4,3],[78,-42,5,3],[4,-91,4,3],[-45,-87,5,3],[-48,-124,5,3],[-5,-133,4,3],[41,-142,5,3],[69,119,4,3],[92,103,4,3]];
export const GUARD_SPAWNS=[[-36,18],[-90,8],[22,13],[87,5],[-68,-26],[-85,-53],[-59,-43],[-24,-16],[36,-31],[64,-42],[81,-71],[51,-66],[-31,-86],[-9,-103],[-63,-124],[-80,-146],[1,-131],[35,-136],[18,-146],[64,-117],[80,110],[-2,45]];
export const CAMERAS=[{x:-34,z:-3,angle:0},{x:26,z:-3,angle:0},{x:-61,z:-40,angle:1.5},{x:43,z:-125,angle:2.5}];
export const SUPPLIES=[{id:'supply1',x:50,z:50},{id:'supply2',x:-88,z:87},{id:'supply3',x:86,z:-96}];
export function makeColliders(){const list=[];for(const b of BUILDINGS){if(!b.open)list.push({...b});else{list.push({x:b.x,z:b.z-b.d/2,w:b.w,d:1.2,h:b.h});list.push({x:b.x-b.w/2,z:b.z,w:1.2,d:b.d,h:b.h});list.push({x:b.x+b.w/2,z:b.z,w:1.2,d:b.d,h:b.h});}}for(const [x,z,w,d] of CRATES)list.push({x,z,w,d,h:1.65});for(const x of [-108,-62,0,61,109])list.push({x,z:0,w:3,d:3,h:7});return list;}
export const DIALOGUE={
 start:['বাচ্চু: পথনকশা আগে নিন। আজ অনুমানের ওপর ভরসা করলে চলবে না।','Bachchu: Collect the route dossier first. Tonight we cannot rely on guesses.'],
 brief:['বাচ্চু: চারটি পথ চিহ্নিত আছে। কোনটি নেবেন, সিদ্ধান্ত আপনার।','Bachchu: Four crossings are marked. Your choice.'],
 cross:['সীমান্ত পেরিয়েছেন। এখন পশ্চিমের ডিপোতে প্রবেশপত্র খুঁজুন।','Frontier crossed. Find the access card at the western depot.'],
 keycard:['প্রবেশপত্র পাওয়া গেছে। অস্ত্র নেওয়া হয়েছে—তবু নীরবে চলাই বুদ্ধিমানের কাজ।','Access card secured. Rifle acquired. Quiet movement is still the wiser choice.'],
 radar:['রেডিও যোগাযোগ বিচ্ছিন্ন। আপাতত আর কোনো অতিরিক্ত দল আসবে না।','Relay disabled. No further reinforcement teams can be called.'],
 power:['বাচ্চু: বিদ্যুৎ নেই। এবার ওদের দাপটেরও একটু লোডশেডিং হোক।','Bachchu: Power is out. Let their arrogance have a power cut too.'],
 codes:['ভল্টের সংকেত উদ্ধার হয়েছে। সেবলের দপ্তরে এগিয়ে যান।','Vault codes recovered. Advance to Sable’s office.'],
 capture:['সেবল আটক হয়েছে। তাকে জীবিত নিয়ে নির্ধারিত ঘাটে পৌঁছান।','Sable is secured. Escort him alive to the designated dock.'],
 danger:['বাচ্চু: ওরা অবস্থান জেনে গেছে। আড়াল বদলান, একই জায়গায় থাকবেন না।','Bachchu: They have our position. Change cover; do not stay in one place.'],
 search:['বাচ্চু: ওরা শেষ দেখা জায়গায় খুঁজছে। এখন চুপচাপ সরে পড়ুন।','Bachchu: They are searching our last position. Slip away quietly.']
};
