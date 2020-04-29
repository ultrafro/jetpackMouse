import * as THREE from "three";
import { Vector3, Quaternion } from "three";
import ParticleSystem from "./ParticleSystem";

class MechaCat {
  constructor({ scene, game }) {
    this.type = "mechaCat";
    this.scene = scene;
    this.game = game;

    this.speed = 0.2;

    this.height = 100;
    this.range = 1000;

    this.lastDamageTime = 0;
    this.damagePeriod = 5;

    let geometry = new THREE.BoxGeometry(25, this.height, 25);
    let material = new THREE.MeshNormalMaterial();

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

    // if (this.jet) {
    //   this.system.show();
    // } else {
    //   this.system.hide();
    // }
    // this.system.update();
  };

  networkUpdate = (data) => {
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
