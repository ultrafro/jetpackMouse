import * as THREE from "three";
import { Vector3 } from "three";
import ParticleSystem from "./ParticleSystem";
class Explosion {
  constructor({ scene, id, data, onFinished }) {
    this.explosionTime = 2;

    this.id = id;
    this.data = data;
    this.scene = scene;
    this.onFinished = onFinished;

    this.creationTime = performance.now() / 1000;

    this.particleSystem = new ParticleSystem({
      numParticles: 10,
      //velocity: direction.clone().multiplyScalar(-100),
      velocity: new Vector3(0, 0, 0),
      lifetime: this.explosionTime,
      radius: 1,
      emissionRate: 1000,
      startColor: new THREE.Color(1, 1, 1),
      stopColor: new THREE.Color(1, 0, 0),
      size: 20,
      src: "smoke.png",
    });

    this.scene.add(this.particleSystem.particleSystem);
    this.particleSystem.particleSystem.position.set(data.x, data.y, data.z);
  }

  networkUpdate = (data) => {
    this.particleSystem.particleSystem.position.set(data.x, data.y, data.z);
  };

  update = () => {
    let now = performance.now() / 1000;

    if (now - this.creationTime > this.explosionTime) {
      this.remove();
      if (this.onFinished) {
        this.onFinished(this);
      }
    }
  };

  remove = () => {
    this.scene.remove(this.particleSystem.particleSystem);
  };
}
export default Explosion;
