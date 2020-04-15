import * as THREE from "three";
import { Vector3 } from "three";
import ParticleSystem from "./ParticleSystem";

class Rocket {
  constructor({ scene, position, direction }) {
    this.speed = 200;

    this.scene = scene;
    this.startPosition = position.clone();
    this.direction = direction.clone();

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Mesh(geometry, material);

    this.scene.add(this.mesh);
    this.mesh.position.copy(position);

    let lookPosition = this.startPosition.clone().add(direction);
    this.mesh.lookAt(lookPosition);

    this.startTime = performance.now() / 1000;

    this.system = new ParticleSystem({
      numParticles: 100,
      velocity: direction.clone().multiplyScalar(-100),
      lifetime: 0.5,
      radius: 1,
      startColor: new THREE.Color(1, 0, 0),
      stopColor: new THREE.Color(1, 0, 0),
      src: "smoke.png",
    });

    this.scene.add(this.system.particleSystem);
    this.mesh.add(this.system.particleSystem);
  }

  update() {
    let now = performance.now() / 1000;
    let deltaT = (now - this.startTime) * this.speed;
    //console.log("deltaT: " + deltaT);
    let newPosition = this.startPosition.clone();
    newPosition.add(this.direction.clone().multiplyScalar(deltaT));
    this.mesh.position.copy(newPosition);

    this.system.show();
    this.system.update();
  }
}
export default Rocket;
