export function detectInputMode({mobile=false,userAgent='',platform='',maxTouchPoints=0,coarse=false}={}){
 const phoneOrTablet=mobile||/Android|iPhone|iPad|iPod/i.test(userAgent)||(platform==='MacIntel'&&maxTouchPoints>1);
 if(phoneOrTablet)return 'touch';
 const desktop=/Windows|Macintosh|X11|Linux x86_64/i.test(userAgent);
 return coarse&&maxTouchPoints>0&&!desktop?'touch':'desktop';
}
export function browserInputMode(){return detectInputMode({mobile:navigator.userAgentData?.mobile,userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints,coarse:matchMedia('(pointer:coarse)').matches});}
