import * as THREE from "three";
import { Vector3, Quaternion } from "three";
import ParticleSystem from "./ParticleSystem";

class Damage {
  constructor({ scene, game, data }) {
    this.scene = scene;
    this.game = game;
    this.particleSystem = new ParticleSystem({
      numParticles: 10,
      //velocity: direction.clone().multiplyScalar(-100),
      velocity: new Vector3(0, 100, 0),
      lifetime: 1,
      radius: 0.1,
      emissionRate: 10,
      startColor: new THREE.Color(1, 0, 0),
      stopColor: new THREE.Color(1, 0, 0),
      size: 50,
      src: "smoke.png",
    });

    this.scene.add(this.particleSystem.particleSystem);
    this.particleSystem.particleSystem.position.set(data.x, data.y, data.z);

    this.offset = Math.random() * 2;
    this.startTime = performance.now() / 1000;
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

    data.type = "damage";

    return data;
  };

  update = () => {
    if (performance.now() / 1000 > this.startTime + this.offset) {
      this.particleSystem.update();
    }
  };

  networkUpdate = (data) => {
    this.particleSystem.particleSystem.position.set(data.x, data.y, data.z);
  };

  remove = () => {
    this.scene.remove(this.particleSystem.particleSystem);
  };
}

export default Damage;
