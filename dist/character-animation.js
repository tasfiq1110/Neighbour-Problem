import * as THREE from 'three';

const v = () => new THREE.Vector3();
const wrap=angle=>Math.atan2(Math.sin(angle),Math.cos(angle));
export function locomotionDirection(dx,dz,heading){
 if(Math.hypot(dx,dz)<.0001)return {yaw:0,direction:1};
 const delta=wrap(Math.atan2(dx,dz)-heading);
 const backward=Math.abs(delta)>Math.PI*.55;
 return {yaw:backward?wrap(delta-Math.sign(delta)*Math.PI):delta,direction:backward?-1:1};
}

// Solve in actor space, before the actor's crouch scale or world heading.
export function solveArm(root, upper, forearm, hand, target, pole) {
  if (!upper || !forearm || !hand) return;
  root.updateWorldMatrix(true, true);
  const point = bone => root.worldToLocal(bone.getWorldPosition(v()));
  const shoulder = point(upper), elbow = point(forearm), wrist = point(hand);
  const a = shoulder.distanceTo(elbow), b = elbow.distanceTo(wrist);
  const direction = target.clone().sub(shoulder);
  const distance = THREE.MathUtils.clamp(direction.length(), Math.abs(a-b)+.001, a+b-.001);
  direction.normalize();
  const bend = pole.clone().sub(shoulder);
  bend.addScaledVector(direction, -bend.dot(direction)).normalize();
  const along = (a*a-b*b+distance*distance)/(2*distance);
  const desiredElbow = shoulder.clone().addScaledVector(direction, along)
    .addScaledVector(bend, Math.sqrt(Math.max(0, a*a-along*along)));
  const desiredWrist = shoulder.clone().addScaledVector(direction, distance);
  const rotateToward = (bone, child, destination) => {
    // Bone-local vectors avoid quaternion errors under scaled ancestors.
    const origin = bone.worldToLocal(child.getWorldPosition(v())).normalize();
    const goal = bone.worldToLocal(root.localToWorld(destination.clone())).normalize();
    bone.quaternion.multiply(new THREE.Quaternion().setFromUnitVectors(origin, goal));
    bone.updateWorldMatrix(true, true);
  };
  rotateToward(upper, forearm, desiredElbow);
  rotateToward(forearm, hand, desiredWrist);
}

export class CharacterAnimation {
  constructor(root, model, mixer, actions, weapon) {
    Object.assign(this, {root, model, mixer, actions, weapon});
    this.speed = 0;
    this.last = null;
    this.legYaw=0;
    this.bones = {};
    model.traverse(bone => {
      if (bone.isBone) this.bones[bone.name.replace(/^mixamorig:?/, '')] = bone;
    });
    for (const name of ['Idle', 'Walk', 'Run']) {
      actions[name]?.play().setEffectiveWeight(name === 'Idle' ? 1 : 0);
    }
  }

  update(data, dt, armed) {
    const {root, model, actions, bones, weapon} = this;
    const elapsed = Math.max(.001, dt);
    const distance = this.last ? Math.hypot(data.x-this.last.x, data.z-this.last.z) : 0;
    const actual = distance > 3 || data.state === 'down' ? 0 : distance / elapsed;
    const heading=data.angle||0;
    const motion=this.last?locomotionDirection(data.x-this.last.x,data.z-this.last.z,heading):{yaw:0,direction:1};
    this.last = {x:data.x, z:data.z};
    this.speed = THREE.MathUtils.lerp(this.speed, actual, 1-Math.exp(-elapsed*12));
    const moving = THREE.MathUtils.smoothstep(this.speed, .08, .65);
    const running = THREE.MathUtils.smoothstep(this.speed, 3.8, 7.5);
    actions.Idle?.setEffectiveWeight(1-moving);
    actions.Walk?.setEffectiveWeight(moving*(1-running));
    actions.Run?.setEffectiveWeight(moving*running);
    // Keep both gaits running through transitions; never restart at frame zero.
    const cadence = THREE.MathUtils.clamp(this.speed / (2.6*(1-running)+6.5*running), .45, 1.65);
    const direction=motion.direction;
    actions.Walk?.setEffectiveTimeScale(cadence*direction);
    actions.Run?.setEffectiveTimeScale(cadence*direction * (actions.Run.getClip().duration / actions.Walk.getClip().duration));
    if(data.melee>0&&!this.inMelee){this.meleeStart={position:weapon.position.clone(),quaternion:weapon.quaternion.clone(),bones:{}};for(const name of ['RightArm','RightForeArm','LeftArm','LeftForeArm'])if(bones[name])this.meleeStart.bones[name]=bones[name].quaternion.clone();}
    this.inMelee=data.melee>0;
    this.mixer.update(dt);
    this.legYaw+=wrap((actual>.15&&!this.inMelee?motion.yaw:0)-this.legYaw)*(1-Math.exp(-elapsed*12));
    if(model.parent)model.parent.rotation.y=Math.PI+this.legYaw;
    root.updateWorldMatrix(true,true);
    // Split the counter-turn across the spine; shoulders keep aiming while feet strafe.
    for(const name of ['Spine','Spine1']){const bone=bones[name];if(!bone)continue;const relative=new THREE.Matrix4().copy(bone.parent.matrixWorld).invert().multiply(root.matrixWorld);const axis=new THREE.Vector3(0,1,0).transformDirection(relative);bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis,-this.legYaw*.5));bone.updateWorldMatrix(true,true);}
    weapon.visible = armed && data.state !== 'down';
    if (data.melee>0 && bones.RightArm) {
      const phase=THREE.MathUtils.clamp((.72-data.melee)/.72,0,1);
      const smooth=t=>t*t*(3-2*t);
      const weight=smooth(Math.min(1,phase/.16))*smooth(Math.min(1,(1-phase)/.22));
      const strike=phase<.45?smooth(phase/.45):1-smooth((phase-.45)/.55);
      // Small torso anticipation and recovery, instead of a detached straight-arm jab.
      if(bones.Spine2)bones.Spine2.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-.22*strike));
      root.updateWorldMatrix(true,true);
      const points=data.meleeBehind?
        [[.05,-.22,.09],[.13,-.08,.08],[-.08,-.03,.35],[-.12,-.2,.25],[.05,-.22,.09]]:
        [[.05,-.22,.09],[.21,-.12,-.08],[-.08,-.12,.38],[-.08,-.17,.25],[.05,-.22,.09]];
      const times=[0,.24,.47,.67,1];let segment=0;while(segment<3&&phase>times[segment+1])segment++;
      const t=smooth((phase-times[segment])/(times[segment+1]-times[segment]));
      const offset=new THREE.Vector3().fromArray(points[segment]).lerp(new THREE.Vector3().fromArray(points[segment+1]),t);
      const pose=(side,off,poleX)=>{
        const upper=bones[side+'Arm'],lower=bones[side+'ForeArm'],hand=bones[side+'Hand'];
        const q1=armed?this.meleeStart.bones[side+'Arm']:upper.quaternion.clone(),q2=armed?this.meleeStart.bones[side+'ForeArm']:lower.quaternion.clone();
        const shoulder=root.worldToLocal(upper.getWorldPosition(v()));
        solveArm(root,upper,lower,hand,shoulder.clone().add(off),shoulder.clone().add(new THREE.Vector3(poleX,-.4,.04)));
        upper.quaternion.slerp(q1,1-weight);lower.quaternion.slerp(q2,1-weight);root.updateWorldMatrix(true,true);
      };
      pose('Right',offset,.4);
      pose('Left',new THREE.Vector3(.12,-.18,data.meleeBehind?.12+strike*.22:.15),-.4);
      if(armed){
        // Keep equipment visible: lower and sling the rifle during the takedown.
        weapon.position.copy(this.meleeStart.position).lerp(new THREE.Vector3(.13,1.12,-.2),weight);
        weapon.quaternion.copy(this.meleeStart.quaternion).slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(.2,Math.PI,.45)),weight);
      }
      return;
    }
    if (!weapon.visible || !bones.RightHand) return;

    // Layer a steady rifle hold over the animated legs and breathing torso.
    const shoulder = root.worldToLocal(bones.RightArm.getWorldPosition(v()));
    const leftShoulder = root.worldToLocal(bones.LeftArm.getWorldPosition(v()));
    const grip = shoulder.clone().add(leftShoulder).multiplyScalar(.5);
    grip.add(new THREE.Vector3(.07, -.19, .14));
    const recoil = Math.min(.035, (data.recoil || 0)*.3);
    grip.z -= recoil;
    if (data.reload > 0) grip.y -= .16;
    solveArm(root, bones.RightArm, bones.RightForeArm, bones.RightHand, grip,
      new THREE.Vector3(shoulder.x+.4, shoulder.y-.5, shoulder.z));
    // The rifle follows the solved wrist every frame, including gait bob/recoil.
    weapon.position.copy(root.worldToLocal(bones.RightHand.getWorldPosition(v())));
    weapon.position.y += .07;
    weapon.rotation.set(0, 0, 0);
    const support = weapon.position.clone().add(data.reload>.45
      ? new THREE.Vector3(0,-.2,.12) : new THREE.Vector3(0,-.06,.22));
    solveArm(root, bones.LeftArm, bones.LeftForeArm, bones.LeftHand, support,
      new THREE.Vector3(-.5, shoulder.y-.5, shoulder.z+.05));
  }
}
