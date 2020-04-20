import * as THREE from "three";
import { Vector3, Quaternion } from "three";
import ParticleSystem from "./ParticleSystem";

class Mouse {
  constructor({ scene }) {
    this.scene = scene;

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    this.object = new THREE.Mesh(geometry, material);

    this.system = new ParticleSystem({
      numParticles: 100,
      velocity: new Vector3(0, -10.0, 0),
      lifetime: 0.1,
      radius: 1,
      startColor: new THREE.Color(1, 0, 0),
      stopColor: new THREE.Color(1, 0, 0),
      src: "smoke.png",
    });

    this.scene.add(this.system.particleSystem);
    this.object.add(this.system.particleSystem);
    this.system.particleSystem.position.set(-0.5, -2, -4);

    this.scene.add(this.object);

    this.jet = true;
  }

  serialize = () => {
    let data = {};

    this.scene.updateMatrixWorld();
    let position = new Vector3();
    let quaternion = new Quaternion();
    let scale = new Vector3();
    this.object.matrixWorld.decompose(position, quaternion, scale);

    data.x = position.x;
    data.y = position.y;
    data.z = position.z;
    data.qx = quaternion.x;
    data.qy = quaternion.y;
    data.qz = quaternion.z;
    data.qw = quaternion.w;

    data.type = "mouse";

    data.jet = this.jet;

    return data;
  };

  update = () => {
    if (this.jet) {
      this.system.show();
    } else {
      this.system.hide();
    }
    this.system.update();
  };

  networkUpdate = (data) => {
    if (data.x != null && (data.y != null) & (data.z != null)) {
      this.object.position.set(data.x, data.y, data.z);
    }
    if (
      data.qx != null &&
      (data.qy != null) & (data.qz != null) & (data.qw != null)
    ) {
      this.object.quaternion.set(data.qx, data.qy, data.qz, data.qw);
    }

    if (data.jet) {
      //turn on jet.
      this.jet = true;
    }
  };

  remove = () => {
    this.scene.remove(this.object);
  };
}

export default Mouse;
