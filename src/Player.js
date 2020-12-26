import * as THREE from "three";
import { Vector3 } from "three";
import LookControls from "./LookControls";
import Mouse from "./Mouse";

class Player {
  constructor(game) {
    this.game = game;

    this.controls = null;
    this.lastTime = performance.now();

    this.velocity = new Vector3();
    //this.gravityAcc = new Vector3(0, -9.8, 0);
    this.gravityAcc = new Vector3(0, -100, 0);
    this.gravityVel = new Vector3();
    this.boostVel = new Vector3();
    this.boostAcc = new Vector3(0, 10, 0);
    this.boost = false;
    this.controls = new LookControls(this.game.camera, this.game.element);
    this.setupKeys();

    this.game.mouse = new Mouse({ game: this.game });
    this.game.mouseID = this.game.Networking.newID();
    this.game.objects[this.game.mouseID] = this.game.mouse;
    this.game.camera.add(this.game.mouse.object);
    this.game.mouse.object.position.set(0, 0, -1);
    let data = this.game.mouse.serialize();
    data.id = this.game.mouseID;
    this.game.Networking.add(data);

    //player rocket:
    document.addEventListener("click", this.makeRocket.bind(this));
  }

  update() {
    let now = performance.now();
    let elapsed = now - this.lastTime;
    this.lastTime = now;

    this.velocity = new Vector3();

    if (this.boost) {
      //   let boostPart = new Vector3();
      //   boostPart.copy(this.boostAcc);
      //   boostPart.multiplyScalar(elapsed / 1000);
      //   this.boostVel.add(boostPart);
      //   this.velocity.add(this.boostVel);
      this.velocity.add(new Vector3(0, 50, 0));
      this.gravityVel = new Vector3();
    } else {
      let gravityPart = new Vector3();
      gravityPart.copy(this.gravityAcc);
      gravityPart.multiplyScalar(elapsed / 1000);
      this.gravityVel.add(gravityPart);

      this.velocity.add(this.gravityVel);
    }

    let forward = new THREE.Vector3();
    this.game.camera.getWorldDirection(forward);
    //project forward onto XZ plane:
    let up = new Vector3(0, 1, 0);
    let perp = new Vector3();
    perp.copy(up);
    perp.multiplyScalar(forward.dot(up));
    forward.sub(perp);
    forward.normalize();
    let right = new Vector3();
    right.copy(forward);
    right.cross(up);

    let directionalFactor = 30;

    if (this.up) {
      let additional = new Vector3();
      additional.copy(forward);
      additional.multiplyScalar(directionalFactor);
      this.velocity.add(additional);
    }
    if (this.down) {
      let additional = new Vector3();
      additional.copy(forward);
      additional.multiplyScalar(directionalFactor);
      this.velocity.sub(additional);
    }
    if (this.left) {
      let additional = new Vector3();
      additional.copy(right);
      additional.multiplyScalar(directionalFactor);
      this.velocity.sub(additional);
    }
    if (this.right) {
      let additional = new Vector3();
      additional.copy(right);
      additional.multiplyScalar(directionalFactor);
      this.velocity.add(additional);
    }

    let potentialPosition = new Vector3();
    potentialPosition.copy(this.game.camera.position);

    let delta = new Vector3();
    delta.copy(this.velocity);
    delta.multiplyScalar(elapsed / 1000);

    potentialPosition.add(delta);

    let collision = this.game.map.checkCollision(potentialPosition);

    if (potentialPosition.y < 0 || collision.hit) {
      this.velocity = new Vector3(0, 0, 0);
      this.gravityVel = new Vector3();
      this.boostVel = new Vector3();
      delta = new Vector3();
    }

    this.game.camera.position.add(delta);

    if (this.boost) {
      //this.system.particleSystem.visible = true;
      this.game.mouse.jet = true;
      //this.system.show();
      //this.system.update();
    } else {
      this.game.mouse.jet = false;
      //this.system.hide();
      //this.system.particleSystem.visible = false;
    }
  }

  makeRocket() {
    console.log("make rocket");
    this.game.scene.updateMatrixWorld();
    let rocketPosition = new Vector3();
    rocketPosition.setFromMatrixPosition(this.game.mouse.object.matrixWorld);
    let direction = this.game.camera.getWorldDirection();
    let data = {
      x: rocketPosition.x,
      y: rocketPosition.y,
      z: rocketPosition.z,
      dx: direction.x,
      dy: direction.y,
      dz: direction.z,
      travel: true,
      type: "rocket",
    };
    this.game.Networking.add(data);
  }

  setupKeys() {
    document.addEventListener(
      "keydown",
      function (event) {
        if (event.code == "Space") {
          this.boost = true;
        }

        if (event.code == "KeyW") {
          this.up = true;
        }

        if (event.code == "KeyA") {
          this.left = true;
        }

        if (event.code == "KeyS") {
          this.down = true;
        }

        if (event.code == "KeyD") {
          this.right = true;
        }
      }.bind(this)
    );

    document.addEventListener(
      "keyup",
      function (event) {
        if (event.code == "Space") {
          this.boost = false;
        }

        if (event.code == "KeyW") {
          this.up = false;
        }

        if (event.code == "KeyA") {
          this.left = false;
        }

        if (event.code == "KeyS") {
          this.down = false;
        }

        if (event.code == "KeyD") {
          this.right = false;
        }
      }.bind(this)
    );
  }
}
export default Player;
