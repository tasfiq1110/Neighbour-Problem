import * as THREE from 'three';

const v = () => new THREE.Vector3();

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
    this.bones = {};
    model.traverse(bone => {
      if (bone.isBone) this.bones[bone.name.replace(/^mixamorig:?/, '')] = bone;
    });
    for (const name of ['Idle', 'Walk', 'Run']) {
      actions[name]?.play().setEffectiveWeight(name === 'Idle' ? 1 : 0);
    }
  }

  update(data, dt, armed) {
    const {root, actions, bones, weapon} = this;
    const elapsed = Math.max(.001, dt);
    const distance = this.last ? Math.hypot(data.x-this.last.x, data.z-this.last.z) : 0;
    const actual = distance > 3 || data.state === 'down' ? 0 : distance / elapsed;
    const heading=data.angle||0;
    const forward=this.last?(data.x-this.last.x)*Math.sin(heading)+(data.z-this.last.z)*Math.cos(heading):0;
    this.last = {x:data.x, z:data.z};
    this.speed = THREE.MathUtils.lerp(this.speed, actual, 1-Math.exp(-elapsed*12));
    const moving = THREE.MathUtils.smoothstep(this.speed, .08, .65);
    const running = THREE.MathUtils.smoothstep(this.speed, 3.8, 7.5);
    actions.Idle?.setEffectiveWeight(1-moving);
    actions.Walk?.setEffectiveWeight(moving*(1-running));
    actions.Run?.setEffectiveWeight(moving*running);
    // Keep both gaits running through transitions; never restart at frame zero.
    const cadence = THREE.MathUtils.clamp(this.speed / (2.6*(1-running)+6.5*running), .45, 1.65);
    const direction=forward<-.001?-1:1;
    actions.Walk?.setEffectiveTimeScale(cadence*direction);
    actions.Run?.setEffectiveTimeScale(cadence*direction * (actions.Run.getClip().duration / actions.Walk.getClip().duration));
    this.mixer.update(dt);
    weapon.visible = armed && data.state !== 'down' && !(data.melee>0);
    if (data.melee>0 && bones.RightArm) {
      const strike=Math.sin(Math.min(1,(.72-data.melee)/.5)*Math.PI);
      const shoulder=root.worldToLocal(bones.RightArm.getWorldPosition(v()));
      const target=shoulder.clone().add(new THREE.Vector3(-.08,-.1,.2+strike*.32));
      solveArm(root,bones.RightArm,bones.RightForeArm,bones.RightHand,target,
        shoulder.clone().add(new THREE.Vector3(.4,-.35,.1)));
      const left=root.worldToLocal(bones.LeftArm.getWorldPosition(v()));
      solveArm(root,bones.LeftArm,bones.LeftForeArm,bones.LeftHand,
        left.clone().add(new THREE.Vector3(.12,-.1,data.meleeBehind?.36:.16)),
        left.clone().add(new THREE.Vector3(-.35,-.3,0)));
      return;
    }
    if (!weapon.visible || !bones.RightHand) return;

    // Layer a steady rifle hold over the animated legs and breathing torso.
    const shoulder = root.worldToLocal(bones.RightArm.getWorldPosition(v()));
    const leftShoulder = root.worldToLocal(bones.LeftArm.getWorldPosition(v()));
    const grip = shoulder.clone().add(leftShoulder).multiplyScalar(.5);
    grip.add(new THREE.Vector3(.07, -.19, .14));
    const recoil = Math.min(.035, (data.fire || 0)*.12);
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
