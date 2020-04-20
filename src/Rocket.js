import * as THREE from "three";
import { Vector3 } from "three";
import ParticleSystem from "./ParticleSystem";

class Rocket {
  constructor({ game, scene, position, direction, onCollision }) {
    this.onCollision = onCollision;
    this.game = game;
    this.speed = 200;
    this.explosionTime = 2;
    //this.speed = 0.1;

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
    this.travel = true;

    this.system = new ParticleSystem({
      numParticles: 100,
      //velocity: direction.clone().multiplyScalar(-100),
      velocity: new Vector3(0, 0, -200),
      lifetime: 1,
      radius: 0.1,
      emissionRate: 100,
      startColor: new THREE.Color(1, 0, 0),
      stopColor: new THREE.Color(1, 0, 0),
      size: 3,
      src: "smoke.png",
    });

    this.scene.add(this.system.particleSystem);
    this.mesh.add(this.system.particleSystem);
  }

  explode() {
    this.travel = false;

    this.explosion = new ParticleSystem({
      numParticles: 10,
      //velocity: direction.clone().multiplyScalar(-100),
      velocity: new Vector3(0, 0, 0),
      lifetime: this.explosionTime,
      radius: 1,
      emissionRate: 1000,
      startColor: new THREE.Color(1, 0, 0),
      stopColor: new THREE.Color(1, 0, 0),
      size: 20,
      src: "smoke.png",
    });
    this.scene.add(this.explosion.particleSystem);
    this.explosion.particleSystem.position.copy(this.mesh.position);

    setTimeout(() => {
      this.scene.remove(this.mesh);
      this.scene.remove(this.system.particleSystem);
      this.scene.remove(this.explosion.particleSystem);

      this.game.removeRocket(this);
    }, this.explosionTime * 1000);
  }

  networkUpdate(data) {
    if (data.travel != null) {
      this.travel = data.travel;
    }
  }

  remove() {
    this.scene.remove(this.mesh);
    this.scene.remove(this.system.particleSystem);
  }

  update() {
    if (this.travel) {
      let now = performance.now() / 1000;
      let deltaT = (now - this.startTime) * this.speed;
      //console.log("deltaT: " + deltaT);
      let newPosition = this.startPosition.clone();
      newPosition.add(this.direction.clone().multiplyScalar(deltaT));
      this.mesh.position.copy(newPosition);

      this.system.show();
      this.system.update();

      if (this.onCollision) {
        if (
          this.game.checkCollision({
            position: this.mesh.position,
            buildingMap: this.game.buildingMap,
          })
        ) {
          this.onCollision(this);
        }
      }

      // if (
      //   this.game.checkCollision({
      //     position: this.mesh.position,
      //     buildingMap: this.game.buildingMap,
      //   })
      // ) {
      //   this.travel = false;
      //   setTimeout(() => {
      //     this.scene.remove(this.mesh);
      //     this.scene.remove(this.system.particleSystem);
      //     //this.scene.remove(this.explosion.particleSystem);

      //     this.game.removeRocket(this);
      //   }, this.explosionTime * 1000);

      //   //explode and die!
      //   //this.explode();
      //   if (this.onCollision) {
      //     this.onCollision(this);
      //   }
      // }
    }
  }
}
export default Rocket;
