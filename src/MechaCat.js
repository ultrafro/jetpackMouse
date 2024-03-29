import * as THREE from "three";
import { Vector3, Quaternion } from "three";
import ParticleSystem from "./ParticleSystem";

class MechaCat {
  constructor({ scene, game, onDeath }) {
    this.type = "mechaCat";
    this.scene = scene;
    this.game = game;
    this.hp = 10;
    this.targetHp = 10;
    this.targetHpTime = 0;
    this.hpSpeed = 1;
    this.onDeath = onDeath;

    this.speed = 0.2;

    this.height = 100;
    this.range = 1000;

    this.lastDamageTime = 0;
    this.damagePeriod = 5;

    let geometry = new THREE.BoxGeometry(25, this.height, 25);
    let material = new THREE.MeshStandardMaterial();
    material.color = new THREE.Color(1.0, 1.0, 0.0);

    this.object = new THREE.Mesh(geometry, material);
    this.object.position.add(
      new Vector3(
        Math.random() * this.range - this.range / 2,
        this.height / 2,
        Math.random() * this.range - this.range / 2
      )
    );
    this.scene.add(this.object);
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
    data.hp = this.targetHp;

    data.type = "mechaCat";

    return data;
  };

  makeNewDestination = () => {
    this.destination = new Vector3().copy(this.object.position);
    let forward = this.object.getWorldDirection();
    let up = new Vector3(0, 1, 0);
    let right = new Vector3();
    right.copy(forward);
    right.cross(up);

    let radius = 10;
    let theta = (((Math.random() - 0.5) / 0.5) * 90 * Math.PI) / 180.0; //+30/-30 in radians
    let forwardCoeff = radius * Math.cos(theta);
    let rightCoeff = radius * Math.sin(theta);

    forward.multiplyScalar(forwardCoeff);
    right.multiplyScalar(rightCoeff);

    this.destination.add(forward);
    this.destination.add(right);
  };

  update = () => {
    if (this.game.Networking.master) {
      if (this.destination == null) {
        this.makeNewDestination();
      }

      let dist = this.object.position.distanceTo(this.destination);
      if (dist < this.speed) {
        //console.log("makng new destination");

        this.object.position.copy(this.destination);
        this.makeNewDestination();
      } else {
        //console.log("updating cat: " + this.object.position + " dist: " + dist);
        // console.log(
        //   "destination: " + this.destination.x,
        //   this.destination.y,
        //   this.destination.z
        // );
        let direction = new Vector3().copy(this.destination);
        direction.sub(this.object.position);
        direction.normalize();
        //console.log("direction: " + direction.x, direction.y, direction.z);
        direction.multiplyScalar(this.speed);

        this.object.position.add(direction);
        this.object.lookAt(this.destination);
        //console.log("direction: " + direction.x, direction.y, direction.z);
      }

      if (performance.now() / 1000 - this.lastDamageTime > this.damagePeriod) {
        this.lastDamageTime = performance.now() / 1000;
        let data = {
          x: this.object.position.x,
          y: 0,
          z: this.object.position.z,
          type: "damage",
        };
        this.game.Networking.add(data);
      }
    }

    //handle hp animation
    let elapsedHPTime = performance.now() / 1000 - this.targetHpTime;
    let hpDist = elapsedHPTime * this.hpSpeed;
    hpDist = Math.min(hpDist, Math.abs(this.hp - this.targetHp));
    this.hp =
      this.hp +
      (hpDist * (this.targetHp - this.hp)) / Math.abs(this.hp - this.targetHp);

    let col_val = Math.cos(
      ((2 * Math.PI * performance.now()) / 1000) *
        (1 / Math.max(this.targetHp / 5, 0.1))
    );
    col_val = col_val + 1;
    col_val = col_val / 2;
    let col = new THREE.Color(1, col_val, 0);
    this.object.material.color = col;

    // if (this.jet) {
    //   this.system.show();
    // } else {
    //   this.system.hide();
    // }
    // this.system.update();
  };

  networkUpdate = (data) => {
    if (data.hp != null) {
      this.targetHp = data.hp;
      this.targetHpTime = performance.now() / 1000;

      if (data.hp <= 0) {
        console.log("about to die");
        console.log(data);
        if (this.onDeath) {
          this.onDeath(this);
        }
      }
    }

    if (!this.game.Networking.master) {
      if (data.x != null && (data.y != null) & (data.z != null)) {
        this.object.position.set(data.x, data.y, data.z);
      }
      if (
        data.qx != null &&
        (data.qy != null) & (data.qz != null) & (data.qw != null)
      ) {
        this.object.quaternion.set(data.qx, data.qy, data.qz, data.qw);
      }
    }
  };

  remove = () => {
    this.scene.remove(this.object);
  };
}

export default MechaCat;
