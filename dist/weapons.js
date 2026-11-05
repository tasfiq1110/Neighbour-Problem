// Fictional equipment: distinct handling, finite magazines, no paid unlocks.
export const WEAPONS = {
 rifle: {id:'rifle',bn:'এআর–২৪ রাইফেল',en:'AR-24 Rifle',magazine:24,damage:34,range:65,interval:.14,reload:2.3,spread:1,noise:52,modes:['auto','burst','semi'],muzzle:.86},
 carbine: {id:'carbine',bn:'সি–৩০ কারবাইন',en:'C-30 Carbine',magazine:30,damage:23,range:40,interval:.085,reload:1.8,spread:1.5,noise:43,modes:['auto','burst'],muzzle:.66},
 marksman: {id:'marksman',bn:'ডিএম–১২ নির্ভুল রাইফেল',en:'DM-12 Marksman',magazine:12,damage:68,range:90,interval:.55,reload:2.8,spread:.38,noise:72,modes:['semi'],muzzle:1.08}
};
export const FIRE_MODES = {auto:['স্বয়ংক্রিয়','AUTO'],burst:['তিন গুলির বার্স্ট','3-ROUND BURST'],semi:['একক গুলি','SEMI']};
